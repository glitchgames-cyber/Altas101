const phaseOptions = [
  "Saral", "Megh", "Agni", "Veda", "Prana", "Shunya",
  "Akash", "Prithvi", "Jal", "Vayu", "Tejas"
];
const spinOptions = [
  "Clockwise", "Counter", "Null", "Entangled", "Reverse",
  "Superposition", "Decoherent", "Entangled-Pair"
];
const corridorOptions = [
  "101", "204", "305", "407", "509", "618", "722", "834", "945",
  "112", "223", "334", "445", "556", "667", "778", "889", "990"
];
const frequencyOptions = [
  "Alpha", "Beta", "Gamma", "Delta", "Theta", "Lambda", "Omega", "Sigma"
];

const phaseSelect = document.getElementById("phase-select");
const spinSelect = document.getElementById("spin-select");
const corridorSelect = document.getElementById("corridor-select");
const frequencySelect = document.getElementById("frequency-select");
const fireBtn = document.getElementById("collapse-fire");
const resetBtn = document.getElementById("collapse-reset");
const feedbackEl = document.getElementById("collapse-feedback");
const attemptsEl = document.getElementById("collapse-attempts");
const winsEl = document.getElementById("collapse-wins");
const lossesEl = document.getElementById("collapse-losses");
const timerEl = document.getElementById("collapse-timer");
const difficultyEl = document.getElementById("difficulty-level");
const difficultySelect = document.getElementById("difficulty-select");

let secretState = null;
let attemptsLeft = 5; // Base attempts, configurable by difficulty
let wins = 0;
let losses = 0;
let locked = false;
let timeLeft = 60; // Base timer, configurable by difficulty
let timerInterval = null;
let difficulty = 1;
let selectedDifficulty = 1; // User-selected difficulty level

function populateSelect(select, options) {
  if (!select) return;
  select.innerHTML = "";
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });
}

// Difficulty configurations
const difficultyConfigs = {
  1: { attempts: 5, time: 60, name: "Beginner" },
  2: { attempts: 4, time: 50, name: "Intermediate" },
  3: { attempts: 3, time: 40, name: "Advanced" },
  4: { attempts: 2, time: 30, name: "Expert" },
  5: { attempts: 1, time: 20, name: "Master" }
};

function rollSecretState() {
  secretState = {
    phase: pickRandom(phaseOptions),
    spin: pickRandom(spinOptions),
    corridor: pickRandom(corridorOptions),
    frequency: pickRandom(frequencyOptions),
  };
  
  // Use selected difficulty level
  const config = difficultyConfigs[selectedDifficulty] || difficultyConfigs[1];
  attemptsLeft = config.attempts;
  timeLeft = config.time;
  difficulty = selectedDifficulty;
  
  updateDifficulty();
  startTimer();
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function updateStats() {
  attemptsEl.textContent = attemptsLeft;
  winsEl.textContent = wins;
  lossesEl.textContent = losses;
  if (timerEl) {
    timerEl.textContent = `${timeLeft}s`;
    timerEl.style.color = timeLeft <= 15 ? "#ff7a18" : timeLeft <= 30 ? "#ffb84d" : "#4dd0e1";
  }
}

function updateDifficulty() {
  if (difficultyEl) {
    const config = difficultyConfigs[difficulty] || difficultyConfigs[1];
    difficultyEl.textContent = `Level ${difficulty} - ${config.name}`;
    const totalCombinations = phaseOptions.length * spinOptions.length * corridorOptions.length * frequencyOptions.length;
    const odds = 1 / totalCombinations;
    difficultyEl.title = `Odds: 1 in ${totalCombinations.toLocaleString()} (${(odds * 100).toFixed(4)}%) | Attempts: ${config.attempts} | Time: ${config.time}s`;
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  const config = difficultyConfigs[selectedDifficulty] || difficultyConfigs[1];
  timeLeft = config.time;
  updateStats();
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateStats();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (!locked) {
          losses += 1;
          locked = true;
          if (feedbackEl) {
            feedbackEl.textContent = "Time's up! Quantum state decohered. Reset to try again.";
            feedbackEl.style.color = "#ff7a18";
          }
          updateStats();
        }
      }
  }, 1000);
}

function handleAttempt() {
  if (locked || !secretState) return;
  if (attemptsLeft <= 0) {
    if (feedbackEl) {
      feedbackEl.textContent = "Simulation frozen. Reset to try again.";
      feedbackEl.style.color = "#ff7a18";
    }
    return;
  }
  if (timeLeft <= 0) {
    if (feedbackEl) {
      feedbackEl.textContent = "Time expired! Reset to try again.";
      feedbackEl.style.color = "#ff7a18";
    }
    return;
  }

  if (!phaseSelect || !spinSelect || !corridorSelect || !frequencySelect) return;

  const guess = {
    phase: phaseSelect.value,
    spin: spinSelect.value,
    corridor: corridorSelect.value,
    frequency: frequencySelect.value,
  };

  attemptsLeft -= 1;
  const isWin =
    guess.phase === secretState.phase &&
    guess.spin === secretState.spin &&
    guess.corridor === secretState.corridor &&
    guess.frequency === secretState.frequency;

  if (isWin) {
    wins += 1;
    locked = true;
    clearInterval(timerInterval);
    if (feedbackEl) {
      feedbackEl.textContent =
        `Incredible! You collapsed the exact hidden state at Level ${difficulty}. Quantum stability achieved!`;
      feedbackEl.style.color = "#4dd0e1";
    }
  } else if (attemptsLeft === 0) {
    losses += 1;
    locked = true;
    clearInterval(timerInterval);
    if (feedbackEl) {
      feedbackEl.textContent =
        "Decoherence wins. State lost to the abyss. Reset to take another improbable shot.";
      feedbackEl.style.color = "#ff7a18";
    }
  } else {
    const hints = [];
    const partialHints = [];
    
    if (guess.phase === secretState.phase) {
      hints.push("Phase alignment is locked in.");
    } else {
      // Give proximity hints for higher difficulty
      if (difficulty >= 3) {
        const phaseIndex = phaseOptions.indexOf(guess.phase);
        const secretIndex = phaseOptions.indexOf(secretState.phase);
        if (Math.abs(phaseIndex - secretIndex) <= 2) {
          partialHints.push("Phase is close...");
        }
      }
    }
    
    if (guess.spin === secretState.spin) {
      hints.push("Spin orientation matches the hidden state.");
    }
    
    if (guess.corridor === secretState.corridor) {
      hints.push("Corridor code is on the right channel.");
    } else if (difficulty >= 4) {
      // Give numeric proximity hints
      const guessNum = parseInt(guess.corridor);
      const secretNum = parseInt(secretState.corridor);
      const diff = Math.abs(guessNum - secretNum);
      if (diff <= 100) {
        partialHints.push(`Corridor is within ${diff} units...`);
      }
    }
    
    if (guess.frequency === secretState.frequency) {
      hints.push("Frequency resonance is perfect.");
    }

    if (feedbackEl) {
      if (hints.length) {
        feedbackEl.textContent = `Not there yet, but you're reading the lab right: ${hints.join(" ")}`;
      } else if (partialHints.length) {
        feedbackEl.textContent = `Close but not exact: ${partialHints.join(" ")}`;
      } else {
        feedbackEl.textContent =
          "Nope. The lab console flickers but the state stays mysterious for now.";
      }
      feedbackEl.style.color = "#ff7a18";
    }
  }

  updateStats();
}

function resetSimulation() {
  locked = false;
  if (feedbackEl) feedbackEl.textContent = "";
  if (timerInterval) clearInterval(timerInterval);
  // Update selected difficulty from dropdown
  if (difficultySelect) {
    selectedDifficulty = parseInt(difficultySelect.value) || 1;
  }
  rollSecretState();
  updateStats();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

function initGame() {
  if (phaseSelect) populateSelect(phaseSelect, phaseOptions);
  if (spinSelect) populateSelect(spinSelect, spinOptions);
  if (corridorSelect) populateSelect(corridorSelect, corridorOptions);
  if (frequencySelect) populateSelect(frequencySelect, frequencyOptions);

  if (fireBtn) fireBtn.addEventListener("click", handleAttempt);
  if (resetBtn) resetBtn.addEventListener("click", resetSimulation);
  
  // Listen for difficulty changes
  if (difficultySelect) {
    difficultySelect.addEventListener("change", (e) => {
      if (!locked) {
        selectedDifficulty = parseInt(e.target.value) || 1;
        resetSimulation();
      }
    });
  }

  resetSimulation();
}

