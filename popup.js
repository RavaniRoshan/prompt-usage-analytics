/* popup.js – UI Logic */
const LOG_KEY = 'promptLogs';

const tableBody = document.getElementById('tableBody');
const emptyMsg = document.getElementById('emptyMsg');
const totalLogsEl = document.getElementById('totalLogs');
const avgScoreEl = document.getElementById('avgScore');
const sortField = document.getElementById('sortField');
const sortDir = document.getElementById('sortDir');
const filterInput = document.getElementById('filterInput');

let allLogs = [];
let filteredLogs = [];
let currentSort = {field: 'timestamp', asc: false};

// Load logs on startup
loadLogs();

// Event listeners
document.getElementById('exportJson').addEventListener('click', exportJson);
document.getElementById('exportCsv').addEventListener('click', exportCsv);
document.getElementById('clearLogs').addEventListener('click', clearLogs);
document.getElementById('clearFilter').addEventListener('click', () => {
  filterInput.value = '';
  applyFilter();
});

sortField.addEventListener('change', () => {
  currentSort.field = sortField.value;
  sortAndRender();
});

sortDir.addEventListener('click', () => {
  currentSort.asc = !currentSort.asc;
  sortDir.textContent = currentSort.asc ? '↑' : '↓';
  sortAndRender();
});

filterInput.addEventListener('input', applyFilter);

/**
 * Load logs from storage
 */
function loadLogs() {
  chrome.storage.local.get({[LOG_KEY]: []}, (data) => {
    allLogs = data[LOG_KEY];
    filteredLogs = allLogs;
    updateStats();
    sortAndRender();
  });
}

/**
 * Update statistics display
 */
function updateStats() {
  totalLogsEl.textContent = allLogs.length;
  
  const scores = allLogs
    .filter(l => l.successScore !== undefined && l.successScore !== null)
    .map(l => l.successScore);
  
  if (scores.length > 0) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    avgScoreEl.textContent = avg.toFixed(2);
  } else {
    avgScoreEl.textContent = '-';
  }
}

/**
 * Apply filter
 */
function applyFilter() {
  const query = filterInput.value.toLowerCase().trim();
  
  if (!query) {
    filteredLogs = allLogs;
  } else {
    filteredLogs = allLogs.filter(log => 
      log.site.toLowerCase().includes(query) ||
      log.model.toLowerCase().includes(query) ||
      log.prompt.toLowerCase().includes(query)
    );
  }
  
  sortAndRender();
}

/**
 * Sort and render table
 */
function sortAndRender() {
  filteredLogs.sort((a, b) => {
    let aVal = a[currentSort.field];
    let bVal = b[currentSort.field];
    
    // Handle undefined/null values
    if (aVal === undefined || aVal === null) aVal = -Infinity;
    if (bVal === undefined || bVal === null) bVal = -Infinity;
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) return currentSort.asc ? -1 : 1;
    if (aVal > bVal) return currentSort.asc ? 1 : -1;
    return 0;
  });
  
  renderTable();
}

/**
 * Render table rows
 */
function renderTable() {
  tableBody.innerHTML = '';
  
  if (filteredLogs.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  
  emptyMsg.style.display = 'none';
  
  for (const log of filteredLogs) {
    const tr = document.createElement('tr');
    
    // Format timestamp
    const date = new Date(log.timestamp);
    const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    const dateStr = date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    
    // Format score with color coding
    let scoreClass = 'score-unknown';
    let scoreText = '-';
    if (log.successScore !== undefined && log.successScore !== null) {
      scoreText = log.successScore.toFixed(2);
      if (log.successScore < 0.5) scoreClass = 'score-good';
      else if (log.successScore < 1) scoreClass = 'score-ok';
      else scoreClass = 'score-bad';
    }
    
    // Truncate prompt for display
    const promptPreview = log.prompt.length > 50 
      ? log.prompt.slice(0, 50) + '...' 
      : log.prompt;
    
    tr.innerHTML = `
      <td class="timestamp" title="${date.toLocaleString()}">
        <div class="time">${timeStr}</div>
        <div class="date">${dateStr}</div>
      </td>
      <td class="site">${escapeHtml(log.site)}</td>
      <td class="model">${escapeHtml(log.model)}</td>
      <td class="prompt" title="${escapeHtml(log.prompt)}">${escapeHtml(promptPreview)}</td>
      <td class="tokens">
        <span class="tokens-in">${log.tokensIn}</span>
        <span class="tokens-sep">→</span>
        <span class="tokens-out">${log.tokensOut || '-'}</span>
      </td>
      <td class="score ${scoreClass}">${scoreText}</td>
    `;
    
    tableBody.appendChild(tr);
  }
}

/**
 * Export to JSON
 */
function exportJson() {
  const data = JSON.stringify(allLogs, null, 2);
  downloadFile(data, 'application/json', 'prompt_logs.json');
}

/**
 * Export to CSV
 */
function exportCsv() {
  const headers = ['timestamp', 'site', 'model', 'prompt', 'prompt_hash', 'tokens_in', 'tokens_out', 'success_score'];
  const rows = allLogs.map(log => [
    new Date(log.timestamp).toISOString(),
    escapeCsv(log.site),
    escapeCsv(log.model),
    escapeCsv(log.prompt),
    log.promptHash || '',
    log.tokensIn,
    log.tokensOut || '',
    log.successScore !== undefined ? log.successScore : ''
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csv, 'text/csv', 'prompt_logs.csv');
}

/**
 * Clear all logs
 */
function clearLogs() {
  if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
    chrome.storage.local.set({[LOG_KEY]: []}, () => {
      allLogs = [];
      filteredLogs = [];
      updateStats();
      renderTable();
    });
  }
}

/**
 * Download file helper
 */
function downloadFile(content, mimeType, filename) {
  const blob = new Blob([content], {type: mimeType});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Escape HTML for display
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Escape CSV value
 */
function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Refresh logs periodically while popup is open
setInterval(() => {
  loadLogs();
}, 2000);
