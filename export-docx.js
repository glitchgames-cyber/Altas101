/**
 * DOCX Export Functionality
 * Exports data to Microsoft Word format
 * Uses docx library (loaded via CDN)
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

// Check if docx library is available
function checkDocxLibrary() {
  if (typeof window === 'undefined') {
    return false;
  }
  // Check for docx library (may be exposed as window.docx or just available globally)
  if (window.docx || (typeof Document !== 'undefined' && typeof Packer !== 'undefined')) {
    return true;
  }
  console.error('docx library not loaded. Please include: https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.js');
  return false;
}

// Get docx library components
function getDocxComponents() {
  if (window.docx) {
    return window.docx;
  }
  // If library is loaded globally
  return {
    Document: window.Document,
    Packer: window.Packer,
    Paragraph: window.Paragraph,
    TextRun: window.TextRun,
    HeadingLevel: window.HeadingLevel,
    Table: window.Table,
    TableRow: window.TableRow,
    TableCell: window.TableCell,
    WidthType: window.WidthType
  };
}

// Create DOCX document from logbook entries
export async function exportLogbookToDocx() {
  if (!checkDocxLibrary()) {
    alert('DOCX library not loaded. Please refresh the page.');
    return;
  }

  // Get entries from the correct storage key
  let entries = getLogbookData();
  
  // If no entries found, try the student logbook format
  if (entries.length === 0) {
    try {
      const raw = localStorage.getItem('student-logbook-entries');
      entries = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error reading logbook:', e);
    }
  }
  const docxLib = getDocxComponents();
  if (!docxLib || !docxLib.Document) {
    alert('DOCX library not properly loaded. Please refresh the page.');
    return;
  }
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = docxLib;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "India Tech Atlas - Logbook Export",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: `Exported on: ${formatDate(new Date().toISOString())}`,
        }),
        new Paragraph({
          text: `Total Entries: ${entries.length}`,
        }),
        new Paragraph({ text: "" }),
        
        ...entries.map((entry, index) => [
          new Paragraph({
            text: `Entry ${index + 1}`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Date: ", bold: true }),
              new TextRun({ text: formatDate(entry.date || entry.timestamp) }),
            ],
          }),
          // Handle both formats: student logbook (name/className) and regular logbook (title/content)
          entry.name ? [
            new Paragraph({
              children: [
                new TextRun({ text: "Name: ", bold: true }),
                new TextRun({ text: entry.name || 'N/A' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Class: ", bold: true }),
                new TextRun({ text: entry.className || entry.class || 'N/A' }),
              ],
            }),
          ] : [
            new Paragraph({
              children: [
                new TextRun({ text: "Title: ", bold: true }),
                new TextRun({ text: entry.title || 'Untitled' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Content: ", bold: true }),
              ],
            }),
            new Paragraph({
              text: entry.content || entry.note || 'No content',
            }),
          ],
          new Paragraph({ text: "" }),
        ]).flat(),
      ],
    }],
  });

  try {
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logbook-export-${new Date().toISOString().split('T')[0]}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    alert('Error exporting to DOCX. Please try again.');
  }
}

// Create DOCX document from vault entries
export async function exportVaultToDocx() {
  if (!checkDocxLibrary()) {
    alert('DOCX library not loaded. Please refresh the page.');
    return;
  }

  const entries = getVaultData();
  const docxLib = getDocxComponents();
  if (!docxLib || !docxLib.Document) {
    alert('DOCX library not properly loaded. Please refresh the page.');
    return;
  }
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docxLib;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "India Tech Atlas - Vault Export",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: `Exported on: ${formatDate(new Date().toISOString())}`,
        }),
        new Paragraph({
          text: `Total Entries: ${entries.length}`,
        }),
        new Paragraph({
          text: "Note: This export contains your secure vault data. Keep it safe.",
          style: "IntenseQuote",
        }),
        new Paragraph({ text: "" }),
        
        ...entries.map((entry, index) => [
          new Paragraph({
            text: `Entry ${index + 1}`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Title: ", bold: true }),
              new TextRun({ text: entry.title || 'Untitled' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Content: ", bold: true }),
            ],
          }),
          new Paragraph({
            text: entry.content || entry.data || 'No content',
          }),
          new Paragraph({ text: "" }),
        ]).flat(),
      ],
    }],
  });

  try {
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vault-export-${new Date().toISOString().split('T')[0]}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    alert('Error exporting to DOCX. Please try again.');
  }
}

// Create DOCX document from statistics
export async function exportStatsToDocx() {
  if (!checkDocxLibrary()) {
    alert('DOCX library not loaded. Please refresh the page.');
    return;
  }

  const stats = getStatsData();
  const docxLib = getDocxComponents();
  if (!docxLib || !docxLib.Document) {
    alert('DOCX library not properly loaded. Please refresh the page.');
    return;
  }
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = docxLib;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "India Tech Atlas - Statistics Report",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: `Generated on: ${formatDate(new Date().toISOString())}`,
        }),
        new Paragraph({ text: "" }),
        
        new Paragraph({
          text: "Overview",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Total Visits: ", bold: true }),
            new TextRun({ text: stats.totalVisits?.toString() || '0' }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Time Spent: ", bold: true }),
            new TextRun({ text: formatDuration(stats.timeSpent || 0) }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "First Visit: ", bold: true }),
            new TextRun({ text: formatDate(stats.firstVisit) }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Last Visit: ", bold: true }),
            new TextRun({ text: formatDate(stats.lastVisit) }),
          ],
        }),
        new Paragraph({ text: "" }),

        new Paragraph({
          text: "Page Visits",
          heading: HeadingLevel.HEADING_2,
        }),
        ...(Object.keys(stats.pageVisits || {}).length > 0 ? [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Page")] }),
                  new TableCell({ children: [new Paragraph("Visits")] }),
                ],
              }),
              ...Object.entries(stats.pageVisits).map(([page, visits]) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(page)] }),
                    new TableCell({ children: [new Paragraph(visits.toString())] }),
                  ],
                })
              ),
            ],
          }),
        ] : [
          new Paragraph({ text: "No page visit data available." }),
        ]),
        new Paragraph({ text: "" }),

        new Paragraph({
          text: "Game Statistics",
          heading: HeadingLevel.HEADING_2,
        }),
        ...(Object.keys(stats.gameStats || {}).length > 0 ? [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Game")] }),
                  new TableCell({ children: [new Paragraph("Plays")] }),
                  new TableCell({ children: [new Paragraph("Best Score")] }),
                  new TableCell({ children: [new Paragraph("Avg Score")] }),
                ],
              }),
              ...Object.entries(stats.gameStats).map(([game, data]) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(game)] }),
                    new TableCell({ children: [new Paragraph((data.plays || 0).toString())] }),
                    new TableCell({ children: [new Paragraph((data.bestScore || 0).toString())] }),
                    new TableCell({ children: [new Paragraph(Math.round((data.totalScore || 0) / (data.plays || 1)).toString())] }),
                  ],
                })
              ),
            ],
          }),
        ] : [
          new Paragraph({ text: "No game statistics available." }),
        ]),
      ],
    }],
  });

  try {
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stats-report-${new Date().toISOString().split('T')[0]}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    alert('Error exporting to DOCX. Please try again.');
  }
}

// Export all data to DOCX
export async function exportAllToDocx() {
  if (!checkDocxLibrary()) {
    alert('DOCX library not loaded. Please refresh the page.');
    return;
  }

  const data = getAllExportableData();
  const docxLib = getDocxComponents();
  if (!docxLib || !docxLib.Document) {
    alert('DOCX library not properly loaded. Please refresh the page.');
    return;
  }
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = docxLib;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "India Tech Atlas - Complete Data Export",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: `Exported on: ${formatDate(data.exportDate)}`,
        }),
        new Paragraph({
          text: `Version: ${data.version}`,
        }),
        new Paragraph({ text: "" }),

        // Logbook Section
        new Paragraph({
          text: "Logbook Entries",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: `Total: ${data.logbook.length} entries`,
        }),
        ...(data.logbook.length > 0 ? data.logbook.map((entry, index) => [
          new Paragraph({
            text: `Entry ${index + 1}: ${entry.title || 'Untitled'}`,
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: formatDate(entry.date || entry.timestamp),
          }),
          new Paragraph({
            text: entry.content || entry.note || 'No content',
          }),
          new Paragraph({ text: "" }),
        ]).flat() : [
          new Paragraph({ text: "No logbook entries." }),
        ]),

        // Vault Section
        new Paragraph({
          text: "Vault Entries",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: `Total: ${data.vault.length} entries`,
        }),
        ...(data.vault.length > 0 ? data.vault.map((entry, index) => [
          new Paragraph({
            text: `Entry ${index + 1}: ${entry.title || 'Untitled'}`,
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: entry.content || entry.data || 'No content',
          }),
          new Paragraph({ text: "" }),
        ]).flat() : [
          new Paragraph({ text: "No vault entries." }),
        ]),

        // Statistics Section
        new Paragraph({
          text: "Statistics",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Total Visits: ", bold: true }),
            new TextRun({ text: (data.stats.totalVisits || 0).toString() }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Time Spent: ", bold: true }),
            new TextRun({ text: formatDuration(data.stats.timeSpent || 0) }),
          ],
        }),
      ],
    }],
  });

  try {
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `india-tech-atlas-export-${new Date().toISOString().split('T')[0]}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    alert('Error exporting to DOCX. Please try again.');
  }
}

