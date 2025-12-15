/**
 * XLSX Export Functionality
 * Exports data to Microsoft Excel format
 * Uses SheetJS (xlsx) library (loaded via CDN)
 */

import { 
  getLogbookData, 
  getVaultData, 
  getStatsData, 
  getGameData,
  formatDate,
  formatDuration,
  getAllExportableData
} from './export-utils.js';

// Check if xlsx library is available
function checkXlsxLibrary() {
  if (typeof window === 'undefined' || !window.XLSX) {
    console.error('XLSX library not loaded. Please include: https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js');
    return false;
  }
  return true;
}

// Export logbook to XLSX
export function exportLogbookToXlsx() {
  if (!checkXlsxLibrary()) {
    alert('XLSX library not loaded. Please refresh the page.');
    return;
  }

  const entries = getLogbookData();
  const XLSX = window.XLSX;

  // Prepare data - handle both student logbook and regular logbook formats
  let data;
  if (entries.length > 0 && entries[0].name) {
    // Student logbook format
    data = [
      ['Date', 'Name', 'Class'],
      ...entries.map(entry => [
        formatDate(entry.timestamp || entry.date),
        entry.name || 'N/A',
        entry.className || entry.class || 'N/A'
      ])
    ];
  } else {
    // Regular logbook format
    data = [
      ['Date', 'Title', 'Content'],
      ...entries.map(entry => [
        formatDate(entry.date || entry.timestamp),
        entry.title || 'Untitled',
        entry.content || entry.note || ''
      ])
    ];
  }

  // Create workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Logbook');

  // Set column widths based on format
  if (entries.length > 0 && entries[0].name) {
    ws['!cols'] = [
      { wch: 20 }, // Date
      { wch: 30 }, // Name
      { wch: 30 }  // Class
    ];
  } else {
    ws['!cols'] = [
      { wch: 20 }, // Date
      { wch: 30 }, // Title
      { wch: 50 }  // Content
    ];
  }

  try {
    XLSX.writeFile(wb, `logbook-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to XLSX:', error);
    alert('Error exporting to XLSX. Please try again.');
  }
}

// Export vault to XLSX
export function exportVaultToXlsx() {
  if (!checkXlsxLibrary()) {
    alert('XLSX library not loaded. Please refresh the page.');
    return;
  }

  const entries = getVaultData();
  const XLSX = window.XLSX;

  // Prepare data
  const data = [
    ['Title', 'Content'],
    ...entries.map(entry => [
      entry.title || 'Untitled',
      entry.content || entry.data || ''
    ])
  ];

  // Create workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vault');

  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Title
    { wch: 50 }  // Content
  ];

  try {
    XLSX.writeFile(wb, `vault-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to XLSX:', error);
    alert('Error exporting to XLSX. Please try again.');
  }
}

// Export statistics to XLSX
export function exportStatsToXlsx() {
  if (!checkXlsxLibrary()) {
    alert('XLSX library not loaded. Please refresh the page.');
    return;
  }

  const stats = getStatsData();
  const XLSX = window.XLSX;
  const wb = XLSX.utils.book_new();

  // Overview sheet
  const overviewData = [
    ['Metric', 'Value'],
    ['Total Visits', stats.totalVisits || 0],
    ['Time Spent', formatDuration(stats.timeSpent || 0)],
    ['First Visit', formatDate(stats.firstVisit)],
    ['Last Visit', formatDate(stats.lastVisit)],
    ['Pages Visited', Object.keys(stats.pageVisits || {}).length],
    ['Games Played', Object.keys(stats.gameStats || {}).length]
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  // Page visits sheet
  if (Object.keys(stats.pageVisits || {}).length > 0) {
    const pageVisitsData = [
      ['Page', 'Visits'],
      ...Object.entries(stats.pageVisits).map(([page, visits]) => [page, visits])
    ];
    const wsPages = XLSX.utils.aoa_to_sheet(pageVisitsData);
    wsPages['!cols'] = [{ wch: 30 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsPages, 'Page Visits');
  }

  // Game statistics sheet
  if (Object.keys(stats.gameStats || {}).length > 0) {
    const gameStatsData = [
      ['Game', 'Plays', 'Best Score', 'Total Score', 'Average Score'],
      ...Object.entries(stats.gameStats).map(([game, data]) => [
        game,
        data.plays || 0,
        data.bestScore || 0,
        data.totalScore || 0,
        Math.round((data.totalScore || 0) / (data.plays || 1))
      ])
    ];
    const wsGames = XLSX.utils.aoa_to_sheet(gameStatsData);
    wsGames['!cols'] = [
      { wch: 25 }, // Game
      { wch: 10 }, // Plays
      { wch: 12 }, // Best Score
      { wch: 12 }, // Total Score
      { wch: 12 }  // Average Score
    ];
    XLSX.utils.book_append_sheet(wb, wsGames, 'Game Statistics');
  }

  try {
    XLSX.writeFile(wb, `stats-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to XLSX:', error);
    alert('Error exporting to XLSX. Please try again.');
  }
}

// Export all data to XLSX
export function exportAllToXlsx() {
  if (!checkXlsxLibrary()) {
    alert('XLSX library not loaded. Please refresh the page.');
    return;
  }

  const data = getAllExportableData();
  const XLSX = window.XLSX;
  const wb = XLSX.utils.book_new();

  // Logbook sheet
  if (data.logbook.length > 0) {
    const logbookData = [
      ['Date', 'Title', 'Content'],
      ...data.logbook.map(entry => [
        formatDate(entry.date || entry.timestamp),
        entry.title || 'Untitled',
        entry.content || entry.note || ''
      ])
    ];
    const wsLogbook = XLSX.utils.aoa_to_sheet(logbookData);
    wsLogbook['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsLogbook, 'Logbook');
  }

  // Vault sheet
  if (data.vault.length > 0) {
    const vaultData = [
      ['Title', 'Content'],
      ...data.vault.map(entry => [
        entry.title || 'Untitled',
        entry.content || entry.data || ''
      ])
    ];
    const wsVault = XLSX.utils.aoa_to_sheet(vaultData);
    wsVault['!cols'] = [{ wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsVault, 'Vault');
  }

  // Statistics sheet
  const statsData = [
    ['Metric', 'Value'],
    ['Total Visits', data.stats.totalVisits || 0],
    ['Time Spent', formatDuration(data.stats.timeSpent || 0)],
    ['First Visit', formatDate(data.stats.firstVisit)],
    ['Last Visit', formatDate(data.stats.lastVisit)]
  ];
  const wsStats = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Statistics');

  // Page visits sheet
  if (Object.keys(data.stats.pageVisits || {}).length > 0) {
    const pageVisitsData = [
      ['Page', 'Visits'],
      ...Object.entries(data.stats.pageVisits).map(([page, visits]) => [page, visits])
    ];
    const wsPages = XLSX.utils.aoa_to_sheet(pageVisitsData);
    wsPages['!cols'] = [{ wch: 30 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsPages, 'Page Visits');
  }

  // Game statistics sheet
  if (Object.keys(data.stats.gameStats || {}).length > 0) {
    const gameStatsData = [
      ['Game', 'Plays', 'Best Score', 'Average Score'],
      ...Object.entries(data.stats.gameStats).map(([game, gameData]) => [
        game,
        gameData.plays || 0,
        gameData.bestScore || 0,
        Math.round((gameData.totalScore || 0) / (gameData.plays || 1))
      ])
    ];
    const wsGames = XLSX.utils.aoa_to_sheet(gameStatsData);
    wsGames['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsGames, 'Games');
  }

  try {
    XLSX.writeFile(wb, `india-tech-atlas-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to XLSX:', error);
    alert('Error exporting to XLSX. Please try again.');
  }
}

