# Prompt Usage Analytics

A Chrome Extension (Manifest V3) that logs LLM prompts and response metadata across popular AI platforms.

## Features

- **Cross-platform support**: Works with Claude.ai, ChatGPT, OpenRouter, Grok, and Poe
- **Privacy-first**: All data stored locally in browser storage
- **Success scoring**: Calculates efficiency score (tokens_in / tokens_out)
- **Export options**: Export logs as JSON or CSV
- **Modern UI**: Clean, responsive popup interface with sorting and filtering

## Installation

### Method 1: Load Unpacked (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `prompt-usage-analytics` folder
5. The extension icon should appear in your toolbar

### Method 2: Chrome Web Store

*Coming soon*

## Usage

1. **Capture Prompts**: Simply use any supported LLM platform normally. The extension automatically captures prompts in the background.

2. **View Analytics**: Click the extension icon to open the dashboard
   - See total prompts and average success score
   - Sort by time, score, site, or model
   - Filter logs by site, model, or prompt content

3. **Export Data**: 
   - Click "Export JSON" for full data export
   - Click "Export CSV" for spreadsheet-compatible format

4. **Clear Data**: Click "Clear All" to remove all stored logs

## How It Works

### Data Capture

The extension uses Chrome's `webRequest` API to:
1. Intercept POST requests to LLM endpoints
2. Parse request bodies for prompt and model information
3. Read response headers for token usage data
4. Store logs with timestamps and calculated metrics

### Success Score

The success score is calculated as: `tokens_in / tokens_out`

- **< 0.5 (Good)**: Efficient prompt, minimal tokens needed
- **0.5 - 1.0 (OK)**: Reasonable efficiency
- **> 1.0 (Bad)**: Inefficient, long prompt for short response

### Privacy & Security

- **No API keys required**: Works with existing LLM sessions
- **Local storage only**: All data stays in your browser
- **No external servers**: No data is sent to any third party
- **Limited permissions**: Only requests access to LLM domains

## Supported Platforms

| Platform | URL Pattern | Status |
|----------|-------------|--------|
| Claude.ai | `*.anthropic.com`, `*.claude.ai` | ✅ Supported |
| ChatGPT | `*.openai.com`, `*.chatgpt.com` | ✅ Supported |
| OpenRouter | `*.openrouter.ai` | ✅ Supported |
| Grok | `*.x.ai`, `*.grok.com` | ✅ Supported |
| Poe | `*.poe.com` | ✅ Supported |

## Storage Limits

- Maximum **1,000 log entries** (oldest auto-removed)
- Stored in `chrome.storage.local` (unlimited in theory, but capped for performance)
- Prompts truncated to **500 characters** to save space

## File Structure

```
prompt-usage-analytics/
├── manifest.json       # Extension configuration
├── background.js       # Service worker for request capture
├── popup.html          # Dashboard HTML
├── popup.js            # Dashboard logic
├── popup.css           # Dashboard styles
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## Development

### Prerequisites

- Chrome 88+ (MV3 support)
- Basic knowledge of JavaScript and Chrome Extensions

### Testing

1. Load the extension in Chrome (see Installation)
2. Open DevTools on the service worker: `chrome://extensions` → Details → Service worker → Inspect
3. Visit a supported LLM platform and send a prompt
4. Check the console for capture logs
5. Open the popup to verify data display

### Adding New Platforms

To add support for a new LLM platform:

1. Add the domain to `host_permissions` in `manifest.json`
2. Add domain detection in `detectSite()` function in `background.js`
3. Add URL pattern to `webRequest` listeners in `background.js`
4. Test and verify prompt capture works

## Troubleshooting

### No logs appearing

- Ensure you're on a supported platform
- Check that the extension has permission for the site
- Open DevTools on the service worker to see console logs
- Some platforms may use WebSockets which aren't captured

### Missing token counts

Token counts are extracted from response headers. Not all platforms expose this data:
- Some platforms return tokens in response body (not headers)
- Success score may show as "-" if tokens_out is unavailable

### Storage full

The extension automatically prunes old logs when reaching 1,000 entries. To manually clear:
1. Open the popup
2. Click "Clear All" button

## License

MIT License - Feel free to use, modify, and distribute.

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Changelog

### v1.0.0
- Initial release
- Support for 5 major LLM platforms
- JSON and CSV export
- Success scoring algorithm
- Modern popup UI
