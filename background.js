/* background.js – Service Worker (MV3) */
const LOG_KEY = 'promptLogs';
const MAX_PROMPT_LEN = 500;
const MAX_LOGS = 1000;

// Track pending requests awaiting response
const pendingRequests = new Map();

/**
 * Save a log entry to storage
 */
function saveLog(entry) {
  chrome.storage.local.get({[LOG_KEY]: []}, (data) => {
    const logs = data[LOG_KEY];
    logs.push(entry);
    
    // Cap at MAX_LOGS to stay within storage limits
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }
    
    chrome.storage.local.set({[LOG_KEY]: logs});
  });
}

/**
 * Create a hash for obfuscated prompts
 */
function hashPrompt(prompt) {
  if (!prompt) return '';
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Detect which LLM site a URL belongs to
 */
function detectSite(url) {
  if (url.includes('anthropic.com') || url.includes('claude.ai')) return 'claude.ai';
  if (url.includes('openai.com') || url.includes('chatgpt.com')) return 'chatgpt.com';
  if (url.includes('openrouter.ai')) return 'openrouter.ai';
  if (url.includes('x.ai') || url.includes('grok.com')) return 'grok.com';
  if (url.includes('poe.com')) return 'poe.com';
  return 'unknown';
}

/**
 * Parse request body for prompt and model info
 */
function parseRequestBody(details) {
  if (!details.requestBody) return null;
  
  let bodyStr = '';
  
  // Handle raw bytes
  if (details.requestBody.raw && details.requestBody.raw.length > 0) {
    try {
      const decoder = new TextDecoder('utf-8');
      bodyStr = decoder.decode(details.requestBody.raw[0].bytes);
    } catch (e) {
      return null;
    }
  }
  // Handle form data
  else if (details.requestBody.formData) {
    // Try to find prompt in form data
    const formData = details.requestBody.formData;
    if (formData.prompt) bodyStr = JSON.stringify({prompt: formData.prompt[0]});
    else if (formData.q) bodyStr = JSON.stringify({prompt: formData.q[0]});
    else if (formData.message) bodyStr = JSON.stringify({prompt: formData.message[0]});
  }
  
  if (!bodyStr) return null;
  
  try {
    const json = JSON.parse(bodyStr);
    
    // Extract prompt from various formats
    let prompt = '';
    if (json.prompt) prompt = json.prompt;
    else if (json.messages && Array.isArray(json.messages)) {
      prompt = json.messages
        .filter(m => m.content || m.text)
        .map(m => m.content || m.text)
        .join('\n');
    }
    else if (json.input) prompt = json.input;
    else if (json.q) prompt = json.q;
    else if (json.query) prompt = json.query;
    else if (json.text) prompt = json.text;
    
    // Extract model
    let model = 'unknown';
    if (json.model) model = json.model;
    else if (json.engine) model = json.engine;
    else if (json.model_name) model = json.model_name;
    
    // Estimate tokens in (rough approximation)
    const tokensIn = Math.ceil(prompt.length / 4);
    
    return {prompt, model, tokensIn};
  } catch (e) {
    return null;
  }
}

/**
 * Parse response headers for token usage
 */
function parseResponseHeaders(details) {
  let tokensOut = 0;
  
  if (!details.responseHeaders) return {tokensOut};
  
  for (const header of details.responseHeaders) {
    const name = header.name.toLowerCase();
    const value = header.value;
    
    // OpenAI/ChatGPT
    if (name === 'openai-usage' || name === 'x-openai-usage') {
      try {
        const usage = JSON.parse(value);
        if (usage.completion_tokens) tokensOut = usage.completion_tokens;
      } catch (e) {}
    }
    // Anthropic/Claude
    else if (name === 'anthropic-token-usage' || name === 'x-anthropic-usage') {
      try {
        const usage = JSON.parse(value);
        if (usage.output_tokens) tokensOut = usage.output_tokens;
      } catch (e) {}
    }
    // OpenRouter
    else if (name === 'x-usage-tokens') {
      tokensOut = parseInt(value) || 0;
    }
    // XAI/Grok
    else if (name === 'x-token-count') {
      tokensOut = parseInt(value) || 0;
    }
    // Generic token headers
    else if (name.includes('token') && !isNaN(parseInt(value))) {
      tokensOut = parseInt(value);
    }
  }
  
  return {tokensOut};
}

/**
 * Capture POST requests
 */
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.method !== 'POST') return;
    
    const site = detectSite(details.url);
    if (site === 'unknown') return;
    
    const parsed = parseRequestBody(details);
    if (!parsed) return;
    
    pendingRequests.set(details.requestId, {
      timestamp: details.timeStamp,
      site,
      model: parsed.model,
      prompt: parsed.prompt.slice(0, MAX_PROMPT_LEN),
      tokensIn: parsed.tokensIn,
      promptHash: hashPrompt(parsed.prompt)
    });
  },
  {
    urls: [
      '*://*.anthropic.com/*',
      '*://*.openai.com/*',
      '*://*.openrouter.ai/*',
      '*://*.x.ai/*',
      '*://*.poe.com/*',
      '*://*.chatgpt.com/*',
      '*://*.claude.ai/*',
      '*://*.grok.com/*'
    ],
    types: ['xmlhttprequest']
  },
  ['requestBody']
);

/**
 * Capture response headers
 */
chrome.webRequest.onCompleted.addListener(
  (details) => {
    const meta = pendingRequests.get(details.requestId);
    if (!meta) return;
    
    const {tokensOut} = parseResponseHeaders(details);
    
    // Calculate success score (lower ratio = better efficiency)
    // tokensIn / tokensOut < 0.5 means prompt was efficient
    let successScore;
    if (tokensOut > 0) {
      successScore = parseFloat((meta.tokensIn / tokensOut).toFixed(2));
    }
    
    const entry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      site: meta.site,
      model: meta.model,
      prompt: meta.prompt,
      promptHash: meta.promptHash,
      tokensIn: meta.tokensIn,
      tokensOut,
      successScore
    };
    
    saveLog(entry);
    pendingRequests.delete(details.requestId);
  },
  {
    urls: [
      '*://*.anthropic.com/*',
      '*://*.openai.com/*',
      '*://*.openrouter.ai/*',
      '*://*.x.ai/*',
      '*://*.poe.com/*',
      '*://*.chatgpt.com/*',
      '*://*.claude.ai/*',
      '*://*.grok.com/*'
    ],
    types: ['xmlhttprequest']
  },
  ['responseHeaders']
);

/**
 * Cleanup on error
 */
chrome.webRequest.onErrorOccurred.addListener(
  (details) => {
    pendingRequests.delete(details.requestId);
  },
  {
    urls: [
      '*://*.anthropic.com/*',
      '*://*.openai.com/*',
      '*://*.openrouter.ai/*',
      '*://*.x.ai/*',
      '*://*.poe.com/*',
      '*://*.chatgpt.com/*',
      '*://*.claude.ai/*',
      '*://*.grok.com/*'
    ],
    types: ['xmlhttprequest']
  }
);

console.log('Prompt Usage Analytics background service worker started');
