const terms = [
  "Aadhaar",
  "UPI",
  "ONDC",
  "DigiLocker",
  "Gaganyaan",
  "Chandrayaan",
  "Agnibaan",
  "IndiaStack",
  "BharatNet",
  "Param",
  "Agnikul",
  "Skyroot",
  "eSanjeevani",
  "CoWIN",
  "ONDC",
  "FASTag",
];

const termScrambleEl = document.getElementById("term-scramble");
const termInput = document.getElementById("term-input");
const termSubmit = document.getElementById("term-submit");
const termSkip = document.getElementById("term-skip");
const termNew = document.getElementById("term-new");
const termFeedback = document.getElementById("term-feedback");
const termScoreEl = document.getElementById("term-score");
const termBestEl = document.getElementById("term-best");
const termCorrectEl = document.getElementById("term-correct");

let currentTerm = "";
let streak = 0;
let bestStreak = 0;
let totalCorrect = 0;

function shuffle(word) {
  const chars = word.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function loadTerm() {
  currentTerm = terms[Math.floor(Math.random() * terms.length)];
  let scrambled = shuffle(currentTerm);
  if (scrambled.toLowerCase() === currentTerm.toLowerCase()) {
    scrambled = shuffle(currentTerm);
  }
  termScrambleEl.textContent = scrambled.toUpperCase();
  termInput.value = "";
  termInput.focus();
  termFeedback.textContent = "";
}

function updateScoreboard() {
  termScoreEl.textContent = streak;
  termBestEl.textContent = bestStreak;
  termCorrectEl.textContent = totalCorrect;
}

function checkTerm() {
  const guess = termInput.value.trim();
  if (!guess) {
    termFeedback.textContent = "Type your guess first.";
    termFeedback.style.color = "#ff7a18";
    return;
  }
  if (guess.toLowerCase() === currentTerm.toLowerCase()) {
    streak += 1;
    totalCorrect += 1;
    if (streak > bestStreak) bestStreak = streak;
    termFeedback.textContent = "Correct! Loading next scramble…";
    termFeedback.style.color = "#4dd0e1";
    updateScoreboard();
    setTimeout(loadTerm, 900);
  } else {
    streak = 0;
    termFeedback.textContent = `Not quite. It was ${currentTerm}.`;
    termFeedback.style.color = "#ff7a18";
    updateScoreboard();
    setTimeout(loadTerm, 1100);
  }
}

function skipTerm() {
  streak = 0;
  updateScoreboard();
  termFeedback.textContent = "Skipped. Streak reset.";
  termFeedback.style.color = "#ff7a18";
  setTimeout(loadTerm, 600);
}

termSubmit.addEventListener("click", checkTerm);
termSkip.addEventListener("click", skipTerm);
termNew.addEventListener("click", loadTerm);

termInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    checkTerm();
  }
});

loadTerm();
updateScoreboard();

