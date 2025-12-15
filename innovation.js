const domains = [
  "Agri-tech",
  "Health-tech",
  "Space-tech",
  "Fintech",
  "Climate-tech",
  "Mobility",
  "Quantum R&D",
  "Media-tech",
];

const technologies = [
  "AI copilots",
  "edge robotics",
  "satellite analytics",
  "bio-sensors",
  "digital public goods",
  "quantum security",
  "immersive storytelling",
  "battery intelligence",
];

const missions = [
  "serve rural founders",
  "boost MSME exports",
  "enable clean logistics",
  "support moon missions",
  "digitize heritage",
  "power inclusive finance",
  "decarbonize cities",
  "tutor every child",
];

const innovationOutput = document.getElementById("innovation-output");
const innovationRollBtn = document.getElementById("innovation-roll");
const innovationCountEl = document.getElementById("innovation-count");
const innovationTimeEl = document.getElementById("innovation-time");
const copyBtn = document.getElementById("copy-idea");

let innovationCount = 0;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function rollInnovation() {
  const idea = `${pickRandom(domains)} x ${pickRandom(
    technologies
  )} to ${pickRandom(missions)}.`;
  innovationOutput.textContent = idea;
  innovationCount += 1;
  innovationCountEl.textContent = innovationCount;
  innovationTimeEl.textContent = new Date().toLocaleTimeString();
}

innovationRollBtn.addEventListener("click", rollInnovation);

copyBtn.addEventListener("click", async () => {
  const text = innovationOutput.textContent.trim();
  if (!text || text.startsWith("Tap roll")) {
    copyBtn.textContent = "Roll First";
    setTimeout(() => (copyBtn.textContent = "Copy Idea"), 1200);
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied!";
  } catch (error) {
    copyBtn.textContent = "Copy Failed";
  } finally {
    setTimeout(() => (copyBtn.textContent = "Copy Idea"), 1500);
  }
});

