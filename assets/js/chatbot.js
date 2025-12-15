(() => {
  const panel = document.getElementById('chatbot-panel');
  const toggle = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chatbot-close');
  const messages = document.getElementById('chatbot-messages');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');

  if (!panel || !toggle || !messages || !form || !input) {
    return; // If the UI isn't on this page, do nothing
  }

  const knowledge = [
    { match: ['move', 'controls', 'wasd'], reply: 'Use WASD to move, space to jump, mouse to look. Number keys 1-6 swap tools.' },
    { match: ['seed', 'crop', 'farm'], reply: 'Hoe grass/dirt into farmland, pick Seed in the hotbar, then click farmland. Mature crops give seeds + XP.' },
    { match: ['xp', 'level'], reply: 'Harvesting crops grants XP. The bar at the bottom shows your current progress.' },
    { match: ['api', 'backend', 'php'], reply: 'Server scripts now live in /server (api.php, config.php, install.php, backups, exports, rss).' },
    { match: ['install', 'db'], reply: 'Run “php server/install.php” (or composer install-db) after setting credentials in server/config.php.' },
    { match: ['export', 'backup'], reply: 'Use /server/export-data.php for JSON/CSV and /server/backup-db.php for backups (add auth first).' }
  ];

  function addMessage(text, role = 'bot') {
    const div = document.createElement('div');
    div.className = `chatbot-msg ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function findReply(question) {
    const q = question.toLowerCase();
    for (const item of knowledge) {
      if (item.match.some(m => q.includes(m))) return item.reply;
    }
    return `I'm an offline helper. I can guide gameplay and the project layout. You asked about “${question}”. Try mentioning movement, farming, API, install, export, or backup for quick tips.`;
  }

  function respond(question) {
    addMessage('Thinking...', 'bot');
    setTimeout(() => {
      messages.lastElementChild.textContent = findReply(question);
    }, 400);
  }

  function openPanel() {
    panel.classList.add('open');
    input.focus();
  }
  function closePanel() {
    panel.classList.remove('open');
  }

  toggle.addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      closePanel();
    } else {
      openPanel();
    }
  });

  closeBtn.addEventListener('click', closePanel);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    respond(text);
  });

  addMessage('Hi! I’m your AI helper. Ask me about controls, farming, or the new server/ PHP layout.', 'bot');
})();

