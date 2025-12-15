const STORAGE_KEY = 'student-logbook-entries';
const BACKUP_PREFIX = 'student-logbook-backup-';
const ARCHIVE_KEY = 'student-logbook-archive';

const formEl = document.getElementById('student-log-form');
const nameEl = document.getElementById('student-name');
const classEl = document.getElementById('student-class');
const alertEl = document.getElementById('log-alert');
const totalEl = document.getElementById('log-total');
const recentEl = document.getElementById('log-recent');

const getEntries = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Unable to read logbook entries', error);
    return [];
  }
};

const saveEntries = (entries) => {
  try {
    // Save to primary storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    // Create daily backup
    const today = new Date().toISOString().split('T')[0];
    const backupKey = `${BACKUP_PREFIX}${today}`;
    localStorage.setItem(backupKey, JSON.stringify(entries));
    
    // Update archive (keep last 30 days of backups)
    updateArchive(entries);
    
    return true;
  } catch (error) {
    console.error('Unable to persist logbook entries', error);
    return false;
  }
};

const updateArchive = (entries) => {
  try {
    // Get existing archive
    const archiveRaw = localStorage.getItem(ARCHIVE_KEY);
    const archive = archiveRaw ? JSON.parse(archiveRaw) : {};
    
    // Add today's entry
    const today = new Date().toISOString().split('T')[0];
    archive[today] = entries;
    
    // Keep only last 30 days
    const dates = Object.keys(archive).sort();
    if (dates.length > 30) {
      dates.slice(0, dates.length - 30).forEach(date => {
        delete archive[date];
      });
    }
    
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  } catch (error) {
    console.error('Unable to update archive', error);
  }
};

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const renderSummary = () => {
  if (!totalEl) return;
  const entries = getEntries();
  totalEl.textContent = entries.length;
  // Login details are not displayed for privacy
};

const showAlert = (message, type = 'success') => {
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.dataset.variant = type;
};

const handleSubmit = (event) => {
  event.preventDefault();
  if (!nameEl || !classEl) return;

  const name = nameEl.value.trim();
  const className = classEl.value.trim();

  if (!name || !className) {
    showAlert('Both name and class are required.', 'error');
    return;
  }

  const entries = getEntries();
  entries.push({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    name,
    className,
    timestamp: new Date().toISOString()
  });
  if (!saveEntries(entries)) {
    showAlert('Storage is unavailable. Please enable local storage and retry.', 'error');
    return;
  }
  showAlert('Entry saved locally. View all records inside the secure vault.');
  formEl.reset();
  renderSummary();
};

if (formEl) {
  formEl.addEventListener('submit', handleSubmit);
  renderSummary();
}

