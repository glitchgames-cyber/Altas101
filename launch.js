const windows = {
  1: { prob: 0.65, reward: "Micro payload, low hype" },
  2: { prob: 0.45, reward: "CubeSat constellation" },
  3: { prob: 0.3, reward: "Commercial imaging stack" },
  4: { prob: 0.22, reward: "Navigation payload + investors onboard" },
  5: { prob: 0.12, reward: "Heavy payload + lunar assist" },
};

const slider = document.getElementById("launch-window");
const display = document.getElementById("launch-display");
const details = document.getElementById("launch-details");
const commitBtn = document.getElementById("launch-commit");
const feedback = document.getElementById("launch-feedback");
const resetBtn = document.getElementById("launch-reset");

const successEl = document.getElementById("launch-success");
const failEl = document.getElementById("launch-fail");
const attemptsEl = document.getElementById("launch-attempts");

let success = 0;
let fail = 0;
let attempts = 3;

function updateWindowInfo() {
  const value = Number(slider.value);
  const info = windows[value];
  display.textContent = value;
  details.textContent = `Success odds: ${(info.prob * 100).toFixed(
    0
  )}% • Reward: ${info.reward}`;
}

slider.addEventListener("input", updateWindowInfo);

function commitLaunch() {
  if (attempts <= 0) {
    feedback.textContent = "No commitments left. Reset to fly again.";
    feedback.style.color = "#ff7a18";
    return;
  }
  attempts -= 1;
  const choice = Number(slider.value);
  const { prob } = windows[choice];
  const roll = Math.random();
  if (roll < prob) {
    success += 1;
    feedback.textContent = "Payload deployed! Investors cheer.";
    feedback.style.color = "#4dd0e1";
  } else {
    fail += 1;
    feedback.textContent = "Launch failure. Debris recovered.";
    feedback.style.color = "#ff7a18";
  }
  refreshStats();
  if (attempts === 0) {
    feedback.textContent += " Flight log closed. Reset required.";
  }
}

function refreshStats() {
  successEl.textContent = success;
  failEl.textContent = fail;
  attemptsEl.textContent = attempts;
}

function resetLog() {
  success = 0;
  fail = 0;
  attempts = 3;
  feedback.textContent = "";
  refreshStats();
}

commitBtn.addEventListener("click", commitLaunch);
resetBtn.addEventListener("click", resetLog);

updateWindowInfo();
refreshStats();

