const STORAGE_KEY = 'student-logbook-entries';
const PASSWORD_HASH = '92b0d529a95d933bd0869f0c6312fe293e34a863f33cdfc43299529d4a4d64ff';
const PASSWORD_SECRET = 'mentor@atlas2025';
const SESSION_FLAG = 'vault-authenticated';

const authForm = document.getElementById('vault-auth-form');
const passwordField = document.getElementById('vault-password');
const errorEl = document.getElementById('vault-error');
const vaultSection = document.getElementById('vault-data');
const vaultGate = document.getElementById('vault-gate');
const totalEl = document.getElementById('vault-total');
const tableBody = document.getElementById('vault-table-body');
const lockBtn = document.getElementById('vault-lock-btn');
const exportBtn = document.getElementById('vault-export-btn');
const exportJsonBtn = document.getElementById('vault-export-json-btn');
const searchInput = document.getElementById('vault-search');

const getEntries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Unable to parse logbook entries', error);
    return [];
  }
};

const saveEntries = (entries) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Unable to persist logbook entries', error);
    showError('Unable to update entries. Please check storage settings.', 'error');
    return false;
  }
};

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const hexString = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const supportsWebCrypto = () => Boolean(window.crypto?.subtle);

const hashText = async (text) => {
  if (!supportsWebCrypto()) {
    return text;
  }
  const data = new TextEncoder().encode(text);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return hexString(digest);
};

const showError = (message, variant = 'error') => {
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.dataset.variant = variant;
};

let filteredEntries = null;

const renderTable = (entriesToRender = null) => {
  if (!tableBody || !totalEl) return;
  const allEntries = getEntries();
  const entries = entriesToRender || allEntries;
  filteredEntries = entriesToRender;
  
  totalEl.textContent = allEntries.length;

  if (!entries.length) {
    const message = entriesToRender ? 'No entries match your search.' : 'No entries stored yet.';
    tableBody.innerHTML = `<tr><td colspan="5">${message}</td></tr>`;
    return;
  }

  // Map original indices for delete functionality
  const entryMap = entriesToRender 
    ? entries.map(entry => ({ entry, originalIndex: allEntries.findIndex(e => e.id === entry.id || (e.name === entry.name && e.className === entry.className && e.timestamp === entry.timestamp)) }))
    : entries.map((entry, index) => ({ entry, originalIndex: index }));

  tableBody.innerHTML = entryMap
    .map(
      ({ entry, originalIndex }) => `
        <tr>
          <td>${originalIndex + 1}</td>
          <td>${entry.name}</td>
          <td>${entry.className}</td>
          <td>${formatTimestamp(entry.timestamp)}</td>
          <td>
            <button type="button" class="btn btn--small" data-entry-index="${originalIndex}">Delete</button>
          </td>
        </tr>
      `
    )
    .join('');

  // Wire up delete buttons for each row
  tableBody
    .querySelectorAll('button[data-entry-index]')
    .forEach((btn) => btn.addEventListener('click', handleDeleteClick));
};

const unlockVault = () => {
  if (vaultSection) {
    vaultSection.hidden = false;
    if (vaultGate) vaultGate.hidden = true;
    renderTable();
  }
};

const lockVault = () => {
  sessionStorage.removeItem(SESSION_FLAG);
  if (vaultSection) {
    vaultSection.hidden = true;
  }
  if (vaultGate) {
    vaultGate.hidden = false;
  }
  if (passwordField) {
    passwordField.value = '';
    passwordField.focus();
  }
  showError('Vault has been locked. Please enter password to unlock.', 'success');
};

const validatePassword = async (event) => {
  event.preventDefault();
  if (!passwordField) return;
  const value = passwordField.value.trim();
  if (!value) {
    showError('Password is required to proceed.', 'error');
    return;
  }
  const hashed = await hashText(value);
  const isValid = supportsWebCrypto()
    ? hashed === PASSWORD_HASH
    : value === PASSWORD_SECRET;
  if (!isValid) {
    showError('Incorrect password. Try again.', 'error');
    authForm.reset();
    passwordField.focus();
    return;
  }
  sessionStorage.setItem(SESSION_FLAG, 'true');
  passwordField.value = '';
  showError('Vault unlocked for this session.', 'success');
  unlockVault();
};

const handleDeleteClick = (event) => {
  const btn = event.currentTarget;
  const indexAttr = btn.getAttribute('data-entry-index');
  if (indexAttr == null) return;

  const index = Number(indexAttr);
  if (Number.isNaN(index)) return;

  const entries = getEntries();
  if (index < 0 || index >= entries.length) return;

  const entry = entries[index];
  const confirmMessage = `Are you sure you want to delete the entry for "${entry.name}" (${entry.className})?`;
  
  if (!confirm(confirmMessage)) {
    return;
  }

  entries.splice(index, 1);
  if (!saveEntries(entries)) {
    return;
  }

  showError('Entry deleted successfully.', 'success');
  renderTable();
};

if (sessionStorage.getItem(SESSION_FLAG) === 'true') {
  unlockVault();
} else if (vaultGate) {
  vaultGate.hidden = false;
}

if (authForm) {
  authForm.addEventListener('submit', validatePassword);
}

const exportToCSV = () => {
  const entries = getEntries();
  if (!entries.length) {
    showError('No entries to export.', 'error');
    return;
  }

  const headers = ['Serial', 'Name', 'Class', 'Timestamp'];
  const rows = entries.map((entry, index) => [
    index + 1,
    entry.name,
    entry.className,
    formatTimestamp(entry.timestamp)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `vault-entries-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showError('CSV file downloaded successfully.', 'success');
};

const exportToJSON = () => {
  const entries = getEntries();
  if (!entries.length) {
    showError('No entries to export.', 'error');
    return;
  }

  const jsonContent = JSON.stringify(entries, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `vault-entries-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showError('JSON file downloaded successfully.', 'success');
};

const handleSearch = () => {
  if (!searchInput) return;
  const query = searchInput.value.trim().toLowerCase();
  
  if (!query) {
    renderTable();
    return;
  }

  const entries = getEntries();
  const filtered = entries.filter(entry => 
    entry.name.toLowerCase().includes(query) ||
    entry.className.toLowerCase().includes(query)
  );
  
  renderTable(filtered);
};

if (lockBtn) {
  lockBtn.addEventListener('click', lockVault);
}

if (exportBtn) {
  exportBtn.addEventListener('click', exportToCSV);
}

if (exportJsonBtn) {
  exportJsonBtn.addEventListener('click', exportToJSON);
}

if (searchInput) {
  searchInput.addEventListener('input', handleSearch);
}

