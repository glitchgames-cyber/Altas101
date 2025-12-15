// Timeline carousel functionality
const milestones = [
  {
    title: "First Indigenous Analog Computer",
    year: "1953 · TIFR",
    body: "Scientists at Tata Institute of Fundamental Research built early analog computers to solve differential equations for cosmic-ray studies.",
    tags: ["Research", "Hardware"],
  },
  {
    title: "ISRO is Born",
    year: "1969 · Bengaluru",
    body: "The Indian Space Research Organization formed, setting the stage for launch vehicles, remote sensing and India's space economy.",
    tags: ["Space", "Policy"],
  },
  {
    title: "Software Technology Parks",
    year: "1991 · Liberalization",
    body: "STPI units introduced satellite links that let Indian engineers export code before the commercial internet boom.",
    tags: ["Exports", "Infra"],
  },
  {
    title: "India Stack Emerges",
    year: "2016 · Digital India",
    body: "Aadhaar, UPI, and DigiLocker combine into programmable public infrastructure that redefines inclusion.",
    tags: ["Fintech", "Public Digital Goods"],
  },
  {
    title: "Chandrayaan-3 Soft Landing",
    year: "2023 · Lunar South Pole",
    body: "India becomes the first nation to land near the Moon's south pole, proving rugged, frugal engineering for harsh environments.",
    tags: ["Space", "Innovation"],
  },
  {
    title: "Future: Quantum-Ready India",
    year: "2030+ · National Quantum Mission",
    body: "A homegrown stack blending photonic qubits, cryogenic control, and QKD networks secures communications for a billion citizens.",
    tags: ["Quantum", "Security"],
  },
];

let currentMilestone = 0;
const timelineCard = document.getElementById("timeline-card");

function renderMilestone(index) {
  if (!timelineCard) return;
  const data = milestones[index];
  timelineCard.querySelector("h3").textContent = data.title;
  timelineCard.querySelector(".timeline__year").textContent = data.year;
  timelineCard.querySelector(".timeline__body").textContent = data.body;
  const tagContainer = timelineCard.querySelector(".timeline__tags");
  tagContainer.innerHTML = "";
  data.tags.forEach((tag) => {
    const span = document.createElement("span");
    span.textContent = tag;
    tagContainer.appendChild(span);
  });
}

export function initTimeline() {
  if (!timelineCard) return; // Exit if timeline card doesn't exist on this page
  document.querySelectorAll(".timeline__nav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const direction = btn.dataset.direction === "next" ? 1 : -1;
      currentMilestone =
        (currentMilestone + direction + milestones.length) % milestones.length;
      renderMilestone(currentMilestone);
    });
  });
  renderMilestone(currentMilestone);
}

