const scenarios = [
  {
    text: "A tier-3 manufacturing cluster wants to leap into electronics design.",
    options: [
      "Slash import duties on finished devices",
      "Launch design-linked incentives + fabless grants",
      "Offer free land for assembly units",
    ],
    answer: 1,
  },
  {
    text: "Bharat fintech adoption is stalling in low-literacy districts.",
    options: [
      "Mandate only English-language apps",
      "Invest in vernacular voice UX + BC training",
      "Cap UPI transactions at ₹500",
    ],
    answer: 1,
  },
  {
    text: "Space startups need access to launch pads without delays.",
    options: [
      "Allow private reuse of ISRO pads with strict slots",
      "Ban private launches until 2030",
      "Subsidize only satellite manufacturing",
    ],
    answer: 0,
  },
  {
    text: "Rural health tech pilots struggle with device maintenance.",
    options: [
      "Create local bio-med repair fellowships",
      "Import more disposable devices",
      "Move all clinics back to paper",
    ],
    answer: 0,
  },
  {
    text: "Quantum startups need cryogenic facilities to test chips.",
    options: [
      "Export raw qubits for testing abroad",
      "Build shared cryo labs inside IITs with open access",
      "Delay research until private fabs arrive",
    ],
    answer: 1,
  },
];

const scenarioEl = document.getElementById("policy-scenario");
const optionsRoot = document.getElementById("policy-options");
const feedbackEl = document.getElementById("policy-feedback");
const livesEl = document.getElementById("policy-lives");
const winsEl = document.getElementById("policy-wins");
const lossesEl = document.getElementById("policy-losses");
const resetBtn = document.getElementById("policy-reset");

let currentScenario = null;
let lives = 3;
let wins = 0;
let losses = 0;

function pickScenario() {
  currentScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenarioEl.textContent = currentScenario.text;
  renderOptions();
  feedbackEl.textContent = "";
}

function renderOptions() {
  optionsRoot.innerHTML = "";
  currentScenario.options.forEach((option, idx) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.addEventListener("click", () => evaluateChoice(idx, btn));
    optionsRoot.appendChild(btn);
  });
}

function evaluateChoice(index, button) {
  if (optionsRoot.dataset.locked === "true") return;
  optionsRoot.dataset.locked = "true";
  const correct = index === currentScenario.answer;
  if (correct) {
    wins += 1;
    feedbackEl.textContent = "Policy clicked! Growth unlocked.";
    feedbackEl.style.color = "#4dd0e1";
  } else {
    lives -= 1;
    losses += 1;
    feedbackEl.textContent = "Ouch. Regression triggered.";
    feedbackEl.style.color = "#ff7a18";
  }
  updateStats();
  setTimeout(() => {
    if (lives <= 0) {
      feedbackEl.textContent =
        "Policy gridlock! Reset run to try for a better streak.";
      feedbackEl.style.color = "#ff7a18";
      return;
    }
    optionsRoot.dataset.locked = "false";
    pickScenario();
  }, 1500);
}

function updateStats() {
  livesEl.textContent = lives;
  winsEl.textContent = wins;
  lossesEl.textContent = losses;
}

function resetRun() {
  lives = 3;
  wins = 0;
  losses = 0;
  optionsRoot.dataset.locked = "false";
  updateStats();
  pickScenario();
}

resetBtn.addEventListener("click", resetRun);

resetRun();

