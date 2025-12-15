// Search functionality
const searchIndex = [
  {
    title: 'Past Hub',
    url: 'past.html',
    description: 'Explore the foundations of Indian tech - TIFR, ISRO, early computing, and the institutions that shaped India\'s tech journey.',
    keywords: ['past', 'history', 'TIFR', 'ISRO', 'computing', 'foundations', 'institutions']
  },
  {
    title: 'Present Pulse',
    url: 'present.html',
    description: 'Track India\'s current tech momentum - unicorns, digital infrastructure, startups, and the living heartbeat of Indian technology.',
    keywords: ['present', 'current', 'unicorns', 'startups', 'DPI', 'India Stack', 'UPI']
  },
  {
    title: 'Future Forge',
    url: 'future.html',
    description: 'Imagine India\'s next tech leap - quantum computing, space tech, AI, and speculative scenarios for tomorrow\'s innovations.',
    keywords: ['future', 'quantum', 'AI', 'space', 'innovation', 'scenarios', 'moonshots']
  },
  {
    title: 'Games Lab',
    url: 'games.html',
    description: 'Interactive games including timeline matching, 3D memory, puzzles, reaction games, and agricultural farming simulation.',
    keywords: ['games', 'play', 'interactive', 'quiz', 'puzzle', 'memory', 'agriculture']
  },
  {
    title: '3D Agriculture Farm',
    url: 'agriculture.html',
    description: 'Minecraft-style 3D farming game where you can plant crops, manage your farm, and learn about Indian agriculture.',
    keywords: ['agriculture', 'farming', '3D', 'crops', 'farm', 'Minecraft', 'educational']
  },
  {
    title: 'Student Logbook',
    url: 'login.html',
    description: 'Secure logbook for students to track their progress, save notes, and manage their learning journey.',
    keywords: ['logbook', 'student', 'notes', 'progress', 'tracking', 'secure']
  },
  {
    title: 'Vault',
    url: 'vault.html',
    description: 'Secure vault for storing important notes, insights, and personal data with password protection.',
    keywords: ['vault', 'secure', 'storage', 'password', 'notes', 'data']
  },
  {
    title: 'Quantum Collapse',
    url: 'impossible.html',
    description: 'Challenging probability-based game where you must align hidden quantum states before decoherence.',
    keywords: ['quantum', 'game', 'challenge', 'probability', 'impossible', 'difficult']
  },
  {
    title: '3D Memory Matrix',
    url: 'memory3d.html',
    description: 'Spatial memory challenge with 3D rotating cubes. Find matching pairs and test your memory skills.',
    keywords: ['memory', '3D', 'cubes', 'spatial', 'matching', 'challenge']
  },
  {
    title: 'Lightning Reflex',
    url: 'reaction.html',
    description: 'Test your reaction time and speed. Targets appear and disappear quickly - how fast can you react?',
    keywords: ['reaction', 'speed', 'reflex', 'timing', 'targets', 'fast']
  },
  {
    title: 'Circuit Puzzle',
    url: 'puzzle.html',
    description: 'Logic and pathfinding puzzle. Connect power to target through a strategic grid system.',
    keywords: ['puzzle', 'circuit', 'logic', 'pathfinding', 'strategy', 'grid']
  },
  {
    title: 'Resources',
    url: 'resources.html',
    description: 'Curated collection of resources, links, and tools related to India\'s technology ecosystem.',
    keywords: ['resources', 'links', 'tools', 'references', 'government', 'research']
  },
  {
    title: 'Blog',
    url: 'blog.html',
    description: 'Latest news, updates, and insights about India\'s technology ecosystem and innovations.',
    keywords: ['blog', 'news', 'updates', 'insights', 'articles', 'tech news']
  },
  {
    title: 'About',
    url: 'about.html',
    description: 'Learn about India Tech Atlas - our mission, vision, technology stack, and project information.',
    keywords: ['about', 'mission', 'vision', 'information', 'project', 'team']
  },
  {
    title: 'Help & FAQ',
    url: 'help.html',
    description: 'Get help with using India Tech Atlas, find answers to frequently asked questions, and learn how to use features.',
    keywords: ['help', 'FAQ', 'questions', 'support', 'guide', 'tutorial']
  },
  {
    title: 'Statistics',
    url: 'stats.html',
    description: 'View statistics, analytics, and insights about your usage of India Tech Atlas and learning progress.',
    keywords: ['statistics', 'stats', 'analytics', 'progress', 'data', 'insights']
  }
];

function search(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/);

  return searchIndex
    .map(item => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      const keywordsLower = item.keywords.map(k => k.toLowerCase());

      // Exact title match
      if (titleLower === lowerQuery) {
        score += 100;
      } else if (titleLower.includes(lowerQuery)) {
        score += 50;
      }

      // Word matches in title
      words.forEach(word => {
        if (titleLower.includes(word)) score += 20;
      });

      // Description matches
      words.forEach(word => {
        if (descLower.includes(word)) score += 10;
      });

      // Keyword matches
      words.forEach(word => {
        if (keywordsLower.includes(word)) score += 15;
      });

      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

function renderResults(results, query) {
  const container = document.getElementById('search-results');
  const statsEl = document.getElementById('search-stats');
  
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <p>No results found for "${query}"</p>
        <p style="margin-top: 1rem; color: var(--muted);">Try different keywords or check your spelling.</p>
      </div>
    `;
    if (statsEl) {
      statsEl.style.display = 'none';
    }
    return;
  }

  if (statsEl) {
    statsEl.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;
    statsEl.style.display = 'block';
  }

  container.innerHTML = results.map(item => `
    <div class="result-item" onclick="window.location.href='${item.url}'">
      <h3 class="result-title">${highlightMatch(item.title, query)}</h3>
      <div class="result-url">${item.url}</div>
      <div class="result-snippet">${highlightMatch(item.description, query)}</div>
    </div>
  `).join('');
}

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function initSearch() {
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');

  if (!input || !btn) return;

  const performSearch = () => {
    const query = input.value.trim();
    if (query.length === 0) {
      document.getElementById('search-results').innerHTML = `
        <div class="no-results">
          <p>Enter a search term to find content across the India Tech Atlas.</p>
        </div>
      `;
      document.getElementById('search-stats').style.display = 'none';
      return;
    }

    const results = search(query);
    renderResults(results, query);
  };

  btn.addEventListener('click', performSearch);
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Search on input (debounced)
  let timeout;
  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(performSearch, 300);
  });

  // Check for URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const queryParam = urlParams.get('q');
  if (queryParam) {
    input.value = queryParam;
    performSearch();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}

