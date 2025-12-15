// Future Lab - Toggle ingredients to simulate scenarios
const labOutputEl = document.getElementById("lab-output");

const impactDescriptions = {
  ai: "Bharat-scale AI copilots process 100+ languages, enabling voice-first interfaces for rural users.",
  space: "Private launch providers reduce satellite deployment costs by 70%, enabling constellation networks.",
  quantum: "Quantum-secure networks protect critical infrastructure, with QKD links spanning major cities.",
  rural: "Mesh networks and edge computing bring low-latency services to 500M+ rural users."
};

function updateLabOutput() {
  if (!labOutputEl) return;
  
  const checked = Array.from(document.querySelectorAll('.lab__controls input[type="checkbox"]:checked'))
    .map(cb => cb.dataset.impact);
  
  if (checked.length === 0) {
    labOutputEl.textContent = "Turn the knobs to generate a future scenario.";
    return;
  }
  
  const scenarios = checked.map(impact => impactDescriptions[impact] || '');
  const combined = scenarios.join(' ');
  
  labOutputEl.textContent = combined || "Turn the knobs to generate a future scenario.";
}

export function initLab() {
  const checkboxes = document.querySelectorAll('.lab__controls input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateLabOutput);
  });
  updateLabOutput();
}

