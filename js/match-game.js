// Timeline Match Game
import { updateGameInfo } from './utils.js';

const matchBank = [
  { prompt: "C-DAC releases PARAM-8000", decade: "1990s" },
  { prompt: "Launch of Aadhaar biometric identity program", decade: "2010s" },
  { prompt: "First Indian satellite Aryabhata lifts off", decade: "1970s" },
  { prompt: "India approves National Quantum Mission", decade: "2020s" },
  { prompt: "Infosys gets listed on Nasdaq", decade: "1990s" },
  { prompt: "DoT launches BharatNet optical fiber plan", decade: "2010s" },
];

let matchScore = 0;
let matchSessionActive = false;
let matchTimeLeft = 90; // Reduced from 120 to 90 seconds
let matchTimerId = null;
let matchLevel = 1; // Add level system
let matchMaxLevel = 50; // Max levels

const promptEl = document.getElementById("match-prompt");
const matchOptionsEl = document.getElementById("match-options");
const matchFeedbackEl = document.getElementById("match-feedback");
const matchScoreEl = document.getElementById("match-score");
const matchNewBtn = document.getElementById("match-new");
const matchTimerEl = document.getElementById("match-timer");
const matchStartBtn = document.getElementById("match-start");

function renderMatchChallenge() {
  if (!promptEl || !matchOptionsEl) return;
  const challenge = matchBank[Math.floor(Math.random() * matchBank.length)];
  promptEl.textContent = challenge.prompt;
  promptEl.dataset.answer = challenge.decade;
  matchFeedbackEl.textContent = "";
  const decades = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];
  matchOptionsEl.innerHTML = "";
  decades.forEach((decade) => {
    const btn = document.createElement("button");
    btn.textContent = decade;
    btn.addEventListener("click", () => {
      if (!matchSessionActive) {
        updateGameInfo("Start the Milestone Match run to log guesses.");
        return;
      }
      checkDecade(decade);
    });
    matchOptionsEl.appendChild(btn);
  });
}

function checkDecade(decade) {
  if (!promptEl) return;
  const answer = promptEl.dataset.answer;
  if (decade === answer) {
    matchScore += 1;
    
    // Level up every 5 correct answers
    if (matchScore > 0 && matchScore % 5 === 0 && matchLevel < matchMaxLevel) {
      matchLevel++;
      matchTimeLeft = Math.max(30, matchTimeLeft - 5); // Reduce time as level increases
      updateGameInfo(`Level ${matchLevel} reached! Time reduced.`);
    }
    
    if (matchFeedbackEl) {
      matchFeedbackEl.textContent = `Spot on! Level ${matchLevel}`;
      matchFeedbackEl.style.color = "#4dd0e1";
    }
    updateGameInfo(`Timeline locked: ${promptEl.textContent} happened in the ${answer}.`);
  } else {
    matchScore = 0;
    matchLevel = Math.max(1, matchLevel - 1); // Lose a level on wrong answer
    if (matchFeedbackEl) {
      matchFeedbackEl.textContent = `Oops! It was the ${answer}. Level ${matchLevel}`;
      matchFeedbackEl.style.color = "#ff7a18";
    }
    updateGameInfo(`Missed decade. ${promptEl.textContent} took place in the ${answer}.`);
  }
  if (matchScoreEl) {
    matchScoreEl.textContent = `Streak: ${matchScore} | Level: ${matchLevel}`;
  }
}

function endMatchSession(reason) {
  matchSessionActive = false;
  clearInterval(matchTimerId);
  if (matchTimerEl) {
    matchTimerEl.textContent = "Timer: 90s";
  }
  if (matchStartBtn) {
    matchStartBtn.disabled = false;
    matchStartBtn.textContent = "Restart 90s Run";
  }
  if (reason) updateGameInfo(reason);
}

function tickMatchTimer() {
  matchTimeLeft -= 1;
  if (matchTimerEl) {
    matchTimerEl.textContent = `Timer: ${matchTimeLeft}s`;
  }
  if (matchTimeLeft <= 0) {
    endMatchSession(`Milestone Match over. Your final streak: ${matchScore}.`);
  }
}

function startMatchSession() {
  if (matchSessionActive) return;
  matchSessionActive = true;
  matchScore = 0;
  matchLevel = 1;
  if (matchScoreEl) {
    matchScoreEl.textContent = "Streak: 0 | Level: 1";
  }
  matchTimeLeft = 90; // Reduced from 120
  if (matchTimerEl) {
    matchTimerEl.textContent = "Timer: 90s";
  }
  if (matchStartBtn) {
    matchStartBtn.disabled = true;
    matchStartBtn.textContent = "Session Running";
  }
  clearInterval(matchTimerId);
  matchTimerId = setInterval(tickMatchTimer, 1000);
  updateGameInfo("Milestone Match session started. Keep guessing for 90 seconds. Level up every 5 correct!");
}

export function initMatchGame() {
  if (matchNewBtn) {
    matchNewBtn.addEventListener("click", renderMatchChallenge);
  }
  if (matchStartBtn) {
    matchStartBtn.addEventListener("click", startMatchSession);
  }
  renderMatchChallenge();
}

