const arena = document.getElementById('reaction-arena');
const startBtn = document.getElementById('reaction-start');
const feedbackEl = document.getElementById('reaction-feedback');
const scoreEl = document.getElementById('reaction-score');
const waveEl = document.getElementById('reaction-wave');
const hitsEl = document.getElementById('reaction-hits');
const missesEl = document.getElementById('reaction-misses');
const countdownEl = document.getElementById('countdown');
const waveDisplay = document.getElementById('wave-display');

let score = 0;
let wave = 1;
let hits = 0;
let misses = 0;
let gameActive = false;
let targetTimeout = null;
let waveTimeout = null;
let currentTarget = null;
let spawnInterval = null;

// Extended wave configs with more levels (up to 20 waves)
const waveConfigs = [
  { spawnDelay: 1500, targetLifetime: 2500, targetsPerWave: 6 }, // Wave 1
  { spawnDelay: 1200, targetLifetime: 2000, targetsPerWave: 7 }, // Wave 2
  { spawnDelay: 900, targetLifetime: 1500, targetsPerWave: 8 }, // Wave 3
  { spawnDelay: 700, targetLifetime: 1200, targetsPerWave: 9 }, // Wave 4
  { spawnDelay: 500, targetLifetime: 1000, targetsPerWave: 10 }, // Wave 5
  { spawnDelay: 400, targetLifetime: 800, targetsPerWave: 12 }, // Wave 6
  { spawnDelay: 300, targetLifetime: 600, targetsPerWave: 15 }, // Wave 7
  { spawnDelay: 250, targetLifetime: 500, targetsPerWave: 18 }, // Wave 8
  { spawnDelay: 200, targetLifetime: 400, targetsPerWave: 20 }, // Wave 9
  { spawnDelay: 150, targetLifetime: 350, targetsPerWave: 22 }, // Wave 10
  { spawnDelay: 120, targetLifetime: 300, targetsPerWave: 25 }, // Wave 11
  { spawnDelay: 100, targetLifetime: 250, targetsPerWave: 28 }, // Wave 12
  { spawnDelay: 80, targetLifetime: 200, targetsPerWave: 30 }, // Wave 13
  { spawnDelay: 60, targetLifetime: 180, targetsPerWave: 35 }, // Wave 14
  { spawnDelay: 50, targetLifetime: 150, targetsPerWave: 40 }, // Wave 15
  { spawnDelay: 40, targetLifetime: 120, targetsPerWave: 45 }, // Wave 16
  { spawnDelay: 30, targetLifetime: 100, targetsPerWave: 50 }, // Wave 17
  { spawnDelay: 25, targetLifetime: 80, targetsPerWave: 55 }, // Wave 18
  { spawnDelay: 20, targetLifetime: 60, targetsPerWave: 60 }, // Wave 19
  { spawnDelay: 15, targetLifetime: 50, targetsPerWave: 65 }, // Wave 20
];

let targetsInWave = 0;
let targetsHitInWave = 0;

function spawnTarget() {
  if (!gameActive || !arena) return;
  
  // Remove previous target if exists
  if (currentTarget && currentTarget.parentNode) {
    currentTarget.remove();
    misses++;
    updateStats();
  }
  
  const target = document.createElement('div');
  target.className = 'target';
  
  // Random position - ensure arena is rendered
  const arenaWidth = arena.offsetWidth || 600;
  const arenaHeight = arena.offsetHeight || 400;
  const maxX = Math.max(0, arenaWidth - 80);
  const maxY = Math.max(0, arenaHeight - 80);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  
  target.addEventListener('click', () => hitTarget(target));
  
  arena.appendChild(target);
  currentTarget = target;
  
  // Auto-remove after lifetime
  const config = waveConfigs[Math.min(wave - 1, waveConfigs.length - 1)];
  targetTimeout = setTimeout(() => {
    if (target.parentNode) {
      target.classList.add('miss');
      setTimeout(() => {
        if (target.parentNode) {
          target.remove();
          misses++;
          updateStats();
          if (target === currentTarget) currentTarget = null;
          checkWaveComplete();
        }
      }, 200);
    }
  }, config.targetLifetime);
  
  targetsInWave++;
}

function hitTarget(target) {
  if (!gameActive || !target.parentNode) return;
  
  target.classList.add('hit');
  clearTimeout(targetTimeout);
  
  const config = waveConfigs[Math.min(wave - 1, waveConfigs.length - 1)];
  const timeBonus = Math.floor(config.targetLifetime / 100);
  const waveBonus = wave * 10;
  const points = 50 + timeBonus + waveBonus;
  
  score += points;
  hits++;
  targetsHitInWave++;
  updateStats();
  
  setTimeout(() => {
    if (target.parentNode) {
      target.remove();
      if (target === currentTarget) currentTarget = null;
      checkWaveComplete();
    }
  }, 300);
}

function checkWaveComplete() {
  if (!gameActive) return;
  
  const config = waveConfigs[Math.min(wave - 1, waveConfigs.length - 1)];
  
  if (targetsInWave >= config.targetsPerWave) {
    // Wave complete
    clearTimeout(targetTimeout);
    clearTimeout(waveTimeout);
    if (currentTarget && currentTarget.parentNode) {
      currentTarget.remove();
      currentTarget = null;
    }
    
    // Stricter accuracy requirement: increases with wave (75% to 90%)
    const requiredAccuracy = Math.min(0.90, 0.75 + (wave * 0.01));
    if (targetsHitInWave >= config.targetsPerWave * requiredAccuracy) {
      // Passed wave (75% hit rate required)
      wave++;
      targetsInWave = 0;
      targetsHitInWave = 0;
      if (feedbackEl) {
        feedbackEl.textContent = `Wave ${wave - 1} Complete! Starting Wave ${wave}...`;
        feedbackEl.style.color = '#4dd0e1';
      }
      
      setTimeout(() => {
        if (gameActive) {
          startWave();
        }
      }, 2000);
    } else {
      // Failed wave
      endGame(false);
    }
  } else {
    // Continue spawning
    if (gameActive) {
      const config = waveConfigs[Math.min(wave - 1, waveConfigs.length - 1)];
      waveTimeout = setTimeout(() => {
        if (gameActive) {
          spawnTarget();
        }
      }, config.spawnDelay);
    }
  }
}

function startWave() {
  if (!gameActive) return;
  
  const config = waveConfigs[Math.min(wave - 1, waveConfigs.length - 1)];
  waveDisplay.textContent = wave;
  feedbackEl.textContent = `Wave ${wave} - Click targets fast!`;
  feedbackEl.style.color = '#ff7a18';
  
  spawnTarget();
}

let countdownInterval = null;

function startGame() {
  gameActive = true;
  score = 0;
  wave = 1;
  hits = 0;
  misses = 0;
  targetsInWave = 0;
  targetsHitInWave = 0;
  
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = 'Game Running...';
  }
  if (countdownEl) countdownEl.style.display = 'block';
  
  // Countdown
  let count = 3;
  if (countdownEl) countdownEl.textContent = count;
  
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      if (countdownEl) countdownEl.textContent = count;
    } else {
      if (countdownEl) {
        countdownEl.textContent = 'GO!';
        setTimeout(() => {
          countdownEl.style.display = 'none';
          clearInterval(countdownInterval);
          countdownInterval = null;
          startAccuracyCheck();
          startWave();
        }, 500);
      }
    }
  }, 1000);
  
  updateStats();
}

function endGame(won) {
  gameActive = false;
  clearTimeout(targetTimeout);
  clearTimeout(waveTimeout);
  stopAccuracyCheck();
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  if (currentTarget && currentTarget.parentNode) {
    currentTarget.remove();
    currentTarget = null;
  }
  
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = 'Start Game';
  }
  
  if (feedbackEl) {
    if (won) {
      feedbackEl.textContent = `Congratulations! You completed all waves! Final Score: ${score}`;
      feedbackEl.style.color = '#4dd0e1';
    } else {
      const accuracy = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : '0.0';
      feedbackEl.textContent = `Game Over! Final Score: ${score} | Wave: ${wave} | Accuracy: ${accuracy}%`;
      feedbackEl.style.color = '#ff7a18';
    }
  }
}

function updateStats() {
  scoreEl.textContent = score;
  waveEl.textContent = wave;
  hitsEl.textContent = hits;
  missesEl.textContent = misses;
}

// Auto-end if too many misses
let accuracyCheckInterval = null;

function startAccuracyCheck() {
  if (accuracyCheckInterval) clearInterval(accuracyCheckInterval);
  accuracyCheckInterval = setInterval(() => {
    if (gameActive && misses > 0 && hits > 0) {
      const accuracy = hits / (hits + misses);
      // Stricter accuracy check: increases with wave (60% to 75%)
      const minAccuracy = Math.min(0.75, 0.60 + (wave * 0.01));
      if (accuracy < minAccuracy && hits + misses > 8) {
        clearInterval(accuracyCheckInterval);
        endGame(false);
      }
    } else if (!gameActive && accuracyCheckInterval) {
      clearInterval(accuracyCheckInterval);
      accuracyCheckInterval = null;
    }
  }, 1000);
}

function stopAccuracyCheck() {
  if (accuracyCheckInterval) {
    clearInterval(accuracyCheckInterval);
    accuracyCheckInterval = null;
  }
}

startBtn.addEventListener('click', startGame);

