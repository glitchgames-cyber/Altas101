/**
 * XML Export Functionality
 * Exports data to XML format
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

// Helper to escape XML special characters
function escapeXML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Export logbook to XML
export function exportLogbookToXML() {
  const entries = getLogbookData();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<logbook-export xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
  xml += '  <metadata>\n';
  xml += `    <export-date>${new Date().toISOString()}</export-date>\n`;
  xml += `    <total-entries>${entries.length}</total-entries>\n`;
  xml += '    <source>India Tech Atlas</source>\n';
  xml += '  </metadata>\n';
  xml += '  <entries>\n';
  
  entries.forEach((entry, index) => {
    xml += '    <entry>\n';
    xml += `      <id>${index + 1}</id>\n`;
    
    // Handle both student logbook and regular logbook formats
    if (entry.name) {
      xml += `      <name>${escapeXML(entry.name)}</name>\n`;
      xml += `      <class>${escapeXML(entry.className || entry.class || '')}</class>\n`;
      xml += `      <timestamp>${escapeXML(formatDate(entry.timestamp || entry.date))}</timestamp>\n`;
    } else {
      xml += `      <title>${escapeXML(entry.title || 'Untitled')}</title>\n`;
      xml += `      <content>${escapeXML(entry.content || entry.note || '')}</content>\n`;
      xml += `      <date>${escapeXML(formatDate(entry.date || entry.timestamp))}</date>\n`;
    }
    
    xml += '    </entry>\n';
  });
  
  xml += '  </entries>\n';
  xml += '</logbook-export>';
  
  // Download
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `logbook-export-${new Date().toISOString().split('T')[0]}.xml`;
  link.click();
  URL.revokeObjectURL(url);
}

// Export vault to XML
export function exportVaultToXML() {
  const entries = getVaultData();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<vault-export xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
  xml += '  <metadata>\n';
  xml += `    <export-date>${new Date().toISOString()}</export-date>\n`;
  xml += `    <total-entries>${entries.length}</total-entries>\n`;
  xml += '    <source>India Tech Atlas - Secure Vault</source>\n';
  xml += '    <note>This export contains secure vault data. Keep it safe.</note>\n';
  xml += '  </metadata>\n';
  xml += '  <entries>\n';
  
  entries.forEach((entry, index) => {
    xml += '    <entry>\n';
    xml += `      <id>${index + 1}</id>\n`;
    xml += `      <title>${escapeXML(entry.title || 'Untitled')}</title>\n`;
    xml += `      <content>${escapeXML(entry.content || entry.data || '')}</content>\n`;
    if (entry.timestamp) {
      xml += `      <timestamp>${escapeXML(formatDate(entry.timestamp))}</timestamp>\n`;
    }
    xml += '    </entry>\n';
  });
  
  xml += '  </entries>\n';
  xml += '</vault-export>';
  
  // Download
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vault-export-${new Date().toISOString().split('T')[0]}.xml`;
  link.click();
  URL.revokeObjectURL(url);
}

// Export statistics to XML
export function exportStatsToXML() {
  const stats = getStatsData();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<statistics-report xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
  xml += '  <metadata>\n';
  xml += `    <generated>${new Date().toISOString()}</generated>\n`;
  xml += '    <source>India Tech Atlas</source>\n';
  xml += '  </metadata>\n';
  xml += '  <overview>\n';
  xml += `    <total-visits>${stats.totalVisits || 0}</total-visits>\n`;
  xml += `    <time-spent>${formatDuration(stats.timeSpent || 0)}</time-spent>\n`;
  xml += `    <first-visit>${escapeXML(formatDate(stats.firstVisit))}</first-visit>\n`;
  xml += `    <last-visit>${escapeXML(formatDate(stats.lastVisit))}</last-visit>\n`;
  xml += `    <pages-visited>${Object.keys(stats.pageVisits || {}).length}</pages-visited>\n`;
  xml += `    <games-played>${Object.keys(stats.gameStats || {}).length}</games-played>\n`;
  xml += '  </overview>\n';
  
  // Page visits
  if (Object.keys(stats.pageVisits || {}).length > 0) {
    xml += '  <page-visits>\n';
    Object.entries(stats.pageVisits).forEach(([page, visits]) => {
      xml += '    <page>\n';
      xml += `      <url>${escapeXML(page)}</url>\n`;
      xml += `      <visits>${visits}</visits>\n`;
      xml += '    </page>\n';
    });
    xml += '  </page-visits>\n';
  }
  
  // Game statistics
  if (Object.keys(stats.gameStats || {}).length > 0) {
    xml += '  <game-statistics>\n';
    Object.entries(stats.gameStats).forEach(([game, data]) => {
      xml += '    <game>\n';
      xml += `      <name>${escapeXML(game)}</name>\n`;
      xml += `      <plays>${data.plays || 0}</plays>\n`;
      xml += `      <best-score>${data.bestScore || 0}</best-score>\n`;
      xml += `      <total-score>${data.totalScore || 0}</total-score>\n`;
      xml += `      <average-score>${Math.round((data.totalScore || 0) / (data.plays || 1))}</average-score>\n`;
      xml += '    </game>\n';
    });
    xml += '  </game-statistics>\n';
  }
  
  xml += '</statistics-report>';
  
  // Download
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `stats-report-${new Date().toISOString().split('T')[0]}.xml`;
  link.click();
  URL.revokeObjectURL(url);
}

// Export all data to XML
export function exportAllToXML() {
  const data = getAllExportableData();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<india-tech-atlas-export xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
  xml += '  <metadata>\n';
  xml += `    <export-date>${data.exportDate}</export-date>\n`;
  xml += `    <version>${data.version}</version>\n`;
  xml += '    <source>India Tech Atlas</source>\n';
  xml += '  </metadata>\n';
  
  // Logbook
  xml += '  <logbook>\n';
  xml += `    <total-entries>${data.logbook.length}</total-entries>\n`;
  xml += '    <entries>\n';
  data.logbook.forEach((entry, index) => {
    xml += '      <entry>\n';
    xml += `        <id>${index + 1}</id>\n`;
    if (entry.name) {
      xml += `        <name>${escapeXML(entry.name)}</name>\n`;
      xml += `        <class>${escapeXML(entry.className || entry.class || '')}</class>\n`;
    } else {
      xml += `        <title>${escapeXML(entry.title || 'Untitled')}</title>\n`;
      xml += `        <content>${escapeXML(entry.content || entry.note || '')}</content>\n`;
    }
    xml += `        <timestamp>${escapeXML(formatDate(entry.timestamp || entry.date))}</timestamp>\n`;
    xml += '      </entry>\n';
  });
  xml += '    </entries>\n';
  xml += '  </logbook>\n';
  
  // Vault
  xml += '  <vault>\n';
  xml += `    <total-entries>${data.vault.length}</total-entries>\n`;
  xml += '    <entries>\n';
  data.vault.forEach((entry, index) => {
    xml += '      <entry>\n';
    xml += `        <id>${index + 1}</id>\n`;
    xml += `        <title>${escapeXML(entry.title || 'Untitled')}</title>\n`;
    xml += `        <content>${escapeXML(entry.content || entry.data || '')}</content>\n`;
    xml += '      </entry>\n';
  });
  xml += '    </entries>\n';
  xml += '  </vault>\n';
  
  // Statistics
  xml += '  <statistics>\n';
  xml += `    <total-visits>${data.stats.totalVisits || 0}</total-visits>\n`;
  xml += `    <time-spent>${formatDuration(data.stats.timeSpent || 0)}</time-spent>\n`;
  xml += `    <first-visit>${escapeXML(formatDate(data.stats.firstVisit))}</first-visit>\n`;
  xml += `    <last-visit>${escapeXML(formatDate(data.stats.lastVisit))}</last-visit>\n`;
  xml += '  </statistics>\n';
  
  xml += '</india-tech-atlas-export>';
  
  // Download
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `india-tech-atlas-export-${new Date().toISOString().split('T')[0]}.xml`;
  link.click();
  URL.revokeObjectURL(url);
}

