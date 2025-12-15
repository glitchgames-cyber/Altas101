// Main script loader - imports and initializes all modules
import { initTimeline } from './js/timeline.js';
import { initMatchGame } from './js/match-game.js';
import { initLab } from './js/lab.js';
import { initAIStories } from './js/ai-stories.js';
import { initDataCards, updateGameInfo } from './js/utils.js';

// Initialize all modules when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
  } else {
  initAll();
}

function initAll() {
  initTimeline();
  initMatchGame();
  initLab();
  initAIStories();
  initDataCards();
}
