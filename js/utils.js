// Shared utility functions
const gameInfoEl = document.getElementById("game-info");

export function updateGameInfo(message) {
  if (gameInfoEl && message) {
    gameInfoEl.textContent = message;
  }
}

// Data deck hover text
export function initDataCards() {
  document.querySelectorAll(".data-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const past = card.dataset.past;
      const future = card.dataset.future;
      card.dataset.original = card.querySelector(".data-card__value").textContent;
      card.querySelector(".data-card__value").textContent = `${past} ➜ ${future}`;
    });
    card.addEventListener("mouseleave", () => {
      const original = card.dataset.original;
      if (original) {
        card.querySelector(".data-card__value").textContent = original;
      }
    });
  });
}

