function initThemeToggle() {
  const storageKey = 'theme-preference';
  const htmlElement = document.documentElement;
  const bodyElement = document.body;

  const getTheme = () => {
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = (theme) => {
    localStorage.setItem(storageKey, theme);
    if (theme === 'light') {
      bodyElement.classList.add('light-theme');
    } else {
      bodyElement.classList.remove('light-theme');
    }
    updateToggleButton(theme);
  };

  const updateToggleButton = (theme) => {
    const toggle = document.getElementById('theme-toggle-btn');
    if (toggle) {
      toggle.dataset.theme = theme;
      toggle.setAttribute('aria-checked', theme === 'light');
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  };

  const toggleTheme = () => {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.addEventListener('click', toggleTheme);
  }

  setTheme(getTheme());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
  initThemeToggle();
}
