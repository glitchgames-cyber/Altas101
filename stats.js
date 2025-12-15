// Statistics dashboard functionality
function getStats() {
  const stats = {
    totalVisits: 0,
    pagesVisited: {},
    gamesPlayed: {},
    timeSpent: 0,
    lastVisit: null,
    firstVisit: null
  };

  // Get page visit stats
  const pageStats = localStorage.getItem('page-visits');
  if (pageStats) {
    const parsed = JSON.parse(pageStats);
    stats.pagesVisited = parsed;
    stats.totalVisits = Object.values(parsed).reduce((sum, count) => sum + count, 0);
  }

  // Get game stats
  const gameStats = localStorage.getItem('game-stats');
  if (gameStats) {
    stats.gamesPlayed = JSON.parse(gameStats);
  }

  // Get time spent
  const timeSpent = localStorage.getItem('time-spent');
  if (timeSpent) {
    stats.timeSpent = parseInt(timeSpent) || 0;
  }

  // Get visit dates
  const lastVisit = localStorage.getItem('last-visit');
  const firstVisit = localStorage.getItem('first-visit');
  if (lastVisit) stats.lastVisit = new Date(lastVisit);
  if (firstVisit) stats.firstVisit = new Date(firstVisit);

  return stats;
}

function updatePageVisit(page) {
  const pageStats = JSON.parse(localStorage.getItem('page-visits') || '{}');
  pageStats[page] = (pageStats[page] || 0) + 1;
  localStorage.setItem('page-visits', JSON.stringify(pageStats));
  localStorage.setItem('last-visit', new Date().toISOString());
  
  if (!localStorage.getItem('first-visit')) {
    localStorage.setItem('first-visit', new Date().toISOString());
  }
}

function updateGameStats(game, score) {
  const gameStats = JSON.parse(localStorage.getItem('game-stats') || '{}');
  if (!gameStats[game]) {
    gameStats[game] = { plays: 0, bestScore: 0, totalScore: 0 };
  }
  gameStats[game].plays++;
  if (score > gameStats[game].bestScore) {
    gameStats[game].bestScore = score;
  }
  gameStats[game].totalScore += score;
  localStorage.setItem('game-stats', JSON.stringify(gameStats));
}

function renderStats() {
  const stats = getStats();
  const grid = document.getElementById('stats-grid');
  if (!grid) return;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  grid.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Visits</div>
      <div class="stat-value">${stats.totalVisits}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Pages Visited</div>
      <div class="stat-value">${Object.keys(stats.pagesVisited).length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Games Played</div>
      <div class="stat-value">${Object.keys(stats.gamesPlayed).length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Time Spent</div>
      <div class="stat-value">${formatTime(stats.timeSpent)}</div>
    </div>
  `;

  // Render game stats
  const gameStatsEl = document.getElementById('game-stats');
  if (gameStatsEl && Object.keys(stats.gamesPlayed).length > 0) {
    gameStatsEl.innerHTML = Object.entries(stats.gamesPlayed).map(([game, data]) => `
      <div style="margin-bottom: 1rem; padding: 1rem; background: var(--bg-alt); border-radius: 8px;">
        <h3 style="margin-top: 0; color: var(--accent);">${game.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          <div>
            <strong>Plays:</strong> ${data.plays}
          </div>
          <div>
            <strong>Best Score:</strong> ${data.bestScore}
          </div>
          <div>
            <strong>Avg Score:</strong> ${Math.round(data.totalScore / data.plays)}
          </div>
        </div>
      </div>
    `).join('');
  } else if (gameStatsEl) {
    gameStatsEl.innerHTML = '<p>No game statistics yet. Play some games to see your stats here!</p>';
  }

  // Simple bar chart for page visits
  const canvas = document.getElementById('visits-chart');
  if (canvas && Object.keys(stats.pagesVisited).length > 0) {
    const ctx = canvas.getContext('2d');
    const maxVisits = Math.max(...Object.values(stats.pagesVisited));
    const pages = Object.entries(stats.pagesVisited).sort((a, b) => b[1] - a[1]).slice(0, 10);
    
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    const barWidth = canvas.width / pages.length - 10;
    const barMaxHeight = canvas.height - 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#00d4ff';
    
    pages.forEach(([page, visits], index) => {
      const barHeight = (visits / maxVisits) * barMaxHeight;
      const x = index * (barWidth + 10) + 5;
      const y = canvas.height - barHeight - 30;
      
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Label
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--fg') || '#000';
      ctx.font = '10px sans-serif';
      ctx.fillText(page.replace('.html', ''), x, canvas.height - 10);
      ctx.fillText(visits, x, y - 5);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#00d4ff';
    });
  }
}

function exportStats() {
  const stats = getStats();
  const dataStr = JSON.stringify(stats, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `india-tech-atlas-stats-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function resetStats() {
  if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
    localStorage.removeItem('page-visits');
    localStorage.removeItem('game-stats');
    localStorage.removeItem('time-spent');
    localStorage.removeItem('last-visit');
    localStorage.removeItem('first-visit');
    renderStats();
    alert('Statistics have been reset.');
  }
}

function initStats() {
  // Track current page visit
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  updatePageVisit(currentPage);

  // Track time spent
  let startTime = Date.now();
  setInterval(() => {
    const timeSpent = parseInt(localStorage.getItem('time-spent') || '0');
    localStorage.setItem('time-spent', (timeSpent + 1).toString());
  }, 1000);

  // Render stats
  renderStats();

  // Event listeners
  const exportBtn = document.getElementById('export-stats');
  const resetBtn = document.getElementById('reset-stats');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportStats);
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetStats);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStats);
} else {
  initStats();
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
  window.updatePageVisit = updatePageVisit;
  window.updateGameStats = updateGameStats;
}

