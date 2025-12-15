// AI story generator
const aiStoryTitle = document.getElementById("ai-story-title");
const aiStoryBody = document.getElementById("ai-story-body");
const aiStoryNextBtn = document.getElementById("ai-story-next");

const aiStories = [
  {
    title: "Analog Sparks, Quantum Dreams",
    body:
      "An AI historian stitches together oral archives from TIFR and IISc to show how the analog sparks of cosmic-ray research morphed into today's quantum repeater ambitions. Founders remix those insights to prototype cryogenic stacks with frugal parts.",
  },
  {
    title: "Indus Code Commons",
    body:
      "Synthesized interviews from 400+ open-source maintainers reveal an Indus Commons: a decentralized guild where rural coders train AI copilots on Indic data and swap licensing tokens to fund their own micro-grants.",
  },
  {
    title: "UPI x Space Mesh",
    body:
      "A predictive narrative links UPI settlement rails with private satcom constellations. The AI foresees real-time payments for off-world manufacturing, sparking debate on lunar export regulations.",
  },
  {
    title: "AgriSingularity",
    body:
      "Generative storytelling imagines federated learning models training on soil microbiome data across Punjab and Tamil Nadu. The AI predicts a 30% boost in farmer incomes once microlabs share anonymized enzyme signatures.",
  },
  {
    title: "Heritage Metaverse",
    body:
      "AI curators reconstruct pre-independence patent drafts and narrate them inside mixed-reality corridors. Visitors co-create new device blueprints, blending Rabindranath Tagore's essays with present-day chiplet diagrams.",
  },
];

let aiStoryIndex = 0;

function renderAIStory() {
  if (!aiStoryTitle || !aiStoryBody) return;
  const story = aiStories[aiStoryIndex];
  aiStoryTitle.textContent = story.title;
  aiStoryBody.textContent = story.body;
}

export function initAIStories() {
  if (!aiStoryTitle || !aiStoryBody) return; // Exit if elements don't exist on this page
  if (aiStoryNextBtn) {
    aiStoryNextBtn.addEventListener("click", () => {
      aiStoryIndex = (aiStoryIndex + 1) % aiStories.length;
      renderAIStory();
    });
  }
  renderAIStory();
}

