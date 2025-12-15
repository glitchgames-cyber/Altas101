const cubeGrid = document.getElementById('cube-grid');
const resetBtn = document.getElementById('memory-reset');
const feedbackEl = document.getElementById('memory-feedback');
const levelEl = document.getElementById('memory-level');
const movesEl = document.getElementById('memory-moves');
const pairsEl = document.getElementById('memory-pairs');
const timeEl = document.getElementById('memory-time');

let level = 1;
let moves = 0;
let pairsFound = 0;
let flippedCubes = [];
let matchedPairs = 0;
let gameStartTime = null;
let timeInterval = null;
let isProcessing = false;
let totalPairs = 8;
let flipTimeout = 1000; // Time before cards flip back
let maxLevel = 100; // Increased max levels
let timeLimit = null; // Time limit per level
let timeLeft = null;

const patterns = ['pattern-1', 'pattern-2', 'pattern-3', 'pattern-4', 'pattern-5', 'pattern-6', 'pattern-7', 'pattern-8'];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCubes() {
  if (!cubeGrid) return;
  
  cubeGrid.innerHTML = '';
  matchedPairs = 0;
  flippedCubes = [];
  isProcessing = false;
  
  // Start time limit if applicable
  if (timeLimit) {
    timeLeft = timeLimit;
    startTimeLimit();
  }
  
  // Ensure totalPairs doesn't exceed available patterns
  const maxPairs = Math.min(totalPairs, patterns.length);
  
  // Create pairs
  const patternPairs = [];
  for (let i = 0; i < maxPairs; i++) {
    patternPairs.push(patterns[i]);
    patternPairs.push(patterns[i]);
  }
  
  const shuffled = shuffleArray(patternPairs);
  
  shuffled.forEach((pattern, index) => {
    const cube = document.createElement('div');
    cube.className = 'memory-cube';
    cube.dataset.pattern = pattern;
    cube.dataset.index = index;
    
    const front = document.createElement('div');
    front.className = 'cube-face cube-front';
    front.textContent = '?';
    
    const back = document.createElement('div');
    back.className = `cube-face cube-back ${pattern}`;
    back.textContent = '●';
    
    cube.appendChild(front);
    cube.appendChild(back);
    
    cube.addEventListener('click', () => handleCubeClick(cube));
    cubeGrid.appendChild(cube);
  });
  
  gameStartTime = Date.now();
  startTimer();
  updateStats();
}

let timeLimitInterval = null;

function startTimer() {
  if (timeInterval) clearInterval(timeInterval);
  timeInterval = setInterval(() => {
    if (gameStartTime) {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      timeEl.textContent = elapsed;
    }
  }, 100);
}

function startTimeLimit() {
  if (timeLimitInterval) clearInterval(timeLimitInterval);
  if (!timeLimit) return;
  
  timeLimitInterval = setInterval(() => {
    timeLeft--;
    
    if (timeLeft <= 0) {
      clearInterval(timeLimitInterval);
      if (feedbackEl) {
        feedbackEl.textContent = `Time's up! Level ${level} failed.`;
        feedbackEl.style.color = '#ff7a18';
      }
      // Reset to same level
      setTimeout(() => {
        createCubes();
      }, 2000);
    }
  }, 1000);
}

function handleCubeClick(cube) {
  if (isProcessing || cube.classList.contains('flipped') || cube.classList.contains('matched')) {
    return;
  }
  
  cube.classList.add('flipped');
  flippedCubes.push(cube);
  moves++;
  updateStats();
  
  if (flippedCubes.length === 2) {
    isProcessing = true;
    // Reduce timeout as level increases (harder difficulty)
    const timeout = Math.max(500, flipTimeout - (level * 100));
    setTimeout(() => {
      checkMatch();
    }, timeout);
  }
}

function checkMatch() {
  if (flippedCubes.length !== 2) {
    flippedCubes = [];
    isProcessing = false;
    return;
  }
  
  const [cube1, cube2] = flippedCubes;
  
  if (!cube1 || !cube2 || !cube1.parentNode || !cube2.parentNode) {
    flippedCubes = [];
    isProcessing = false;
    return;
  }
  
  if (cube1.dataset.pattern === cube2.dataset.pattern) {
    // Match found!
    cube1.classList.add('matched');
    cube2.classList.add('matched');
    pairsFound++;
    matchedPairs++;
    
    if (matchedPairs === totalPairs) {
      // Level complete!
      clearInterval(timeInterval);
      const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
      if (feedbackEl) {
        feedbackEl.textContent = `Level ${level} Complete! Time: ${timeTaken}s | Moves: ${moves}`;
        feedbackEl.style.color = '#4dd0e1';
      }
      
      setTimeout(() => {
        level++;
        
        // Increase pairs more aggressively, up to 12 pairs (was 10)
        totalPairs = Math.min(12, Math.min(patterns.length, 6 + Math.floor(level * 1.5)));
        
        // Reduce flip timeout faster - minimum 300ms (was 500ms)
        flipTimeout = Math.max(300, 1000 - (level * 60));
        
        // Add time limit starting from level 15
        if (level >= 15) {
          // Time limit decreases as level increases
          timeLimit = Math.max(20, 180 - (level * 3));
        }
        
        if (feedbackEl) feedbackEl.textContent = `Starting Level ${level}...`;
        setTimeout(() => {
          createCubes();
        }, 1500);
      }, 2000);
    } else {
      if (feedbackEl) {
        feedbackEl.textContent = 'Match found! Keep going!';
        feedbackEl.style.color = '#4dd0e1';
      }
    }
  } else {
    // No match
    if (cube1 && cube1.parentNode) cube1.classList.remove('flipped');
    if (cube2 && cube2.parentNode) cube2.classList.remove('flipped');
    if (feedbackEl) {
      feedbackEl.textContent = 'No match. Try again!';
      feedbackEl.style.color = '#ff7a18';
    }
  }
  
  flippedCubes = [];
  isProcessing = false;
  updateStats();
}

function updateStats() {
  levelEl.textContent = level;
  movesEl.textContent = moves;
  pairsEl.textContent = pairsFound;
}

function resetGame() {
  level = 1;
  moves = 0;
  pairsFound = 0;
  totalPairs = 8;
  flipTimeout = 1000;
  timeLimit = null;
  timeLeft = null;
  if (timeInterval) clearInterval(timeInterval);
  if (timeLimitInterval) clearInterval(timeLimitInterval);
  if (feedbackEl) feedbackEl.textContent = '';
  createCubes();
}

resetBtn.addEventListener('click', resetGame);
createCubes();

