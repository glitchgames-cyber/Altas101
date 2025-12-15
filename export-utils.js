/**
 * Export Utilities
 * Shared functions for exporting data to various formats
 */

// Get all logbook entries
export function getLogbookData() {
  try {
    // Try both possible storage keys
    const entries = localStorage.getItem('student-logbook-entries') || localStorage.getItem('logbook-entries');
    return entries ? JSON.parse(entries) : [];
  } catch (e) {
    console.error('Error reading logbook data:', e);
    return [];
  }
}

// Get all vault entries
export function getVaultData() {
  try {
    const vault = localStorage.getItem('vault-data');
    return vault ? JSON.parse(vault) : [];
  } catch (e) {
    console.error('Error reading vault data:', e);
    return [];
  }
}

// Get statistics data
export function getStatsData() {
  try {
    return {
      pageVisits: JSON.parse(localStorage.getItem('page-visits') || '{}'),
      gameStats: JSON.parse(localStorage.getItem('game-stats') || '{}'),
      timeSpent: parseInt(localStorage.getItem('time-spent') || '0'),
      lastVisit: localStorage.getItem('last-visit'),
      firstVisit: localStorage.getItem('first-visit'),
      totalVisits: Object.values(JSON.parse(localStorage.getItem('page-visits') || '{}')).reduce((sum, count) => sum + count, 0)
    };
  } catch (e) {
    console.error('Error reading stats data:', e);
    return {};
  }
}

// Get game data
export function getGameData() {
  try {
    return JSON.parse(localStorage.getItem('game-stats') || '{}');
  } catch (e) {
    console.error('Error reading game data:', e);
    return {};
  }
}

// Format date for display
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

// Format time duration
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Download file helper
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Get all exportable data
export function getAllExportableData() {
  return {
    logbook: getLogbookData(),
    vault: getVaultData(),
    stats: getStatsData(),
    games: getGameData(),
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };
}

