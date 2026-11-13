const welcome = document.querySelector("#welcome");
const cards = document.querySelector("#cards");
const final = document.querySelector("#final");
const start = document.querySelector("#start");
const envelope = document.querySelector("#envelope");
const cardArt = document.querySelector("#card-art");
const cardTitle = document.querySelector("#card-title");
const openLabel = document.querySelector("#open-label");
const progress = document.querySelector("#progress");
const dots = Array.from(progress.children);
const birthday = document.querySelector("#birthday");
const replay = document.querySelector("#replay");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const greetings = [
  { title: "Это для тебя", flower: "peony", label: "Открыть первую открытку" },
  { title: "Спасибо, что ты рядом", flower: "roses", label: "Открыть вторую открытку" },
  { title: "А внутри — самое главное", flower: "bouquet", label: "Открыть последнюю открытку" },
];

let cardIndex = 0;
let opening = false;

function showScreen(screen, focusTarget) {
  for (const section of [welcome, cards, final]) {
    section.hidden = section !== screen;
  }

  window.scrollTo(0, 0);
  focusTarget.focus({ preventScroll: true });
}

function renderCard() {
  const greeting = greetings[cardIndex];
  cardTitle.textContent = greeting.title;
  openLabel.textContent = greeting.label;
  cardArt.className = `flowers flowers--${greeting.flower}`;
  envelope.dataset.card = cardIndex + 1;
  progress.setAttribute("aria-label", `Открытка ${cardIndex + 1} из ${greetings.length}`);
  dots.forEach((dot, index) => dot.classList.toggle("current", index === cardIndex));
}

function finishOpening() {
  envelope.classList.remove("opening");
  envelope.removeAttribute("aria-disabled");
  opening = false;
  cardIndex += 1;

  if (cardIndex === greetings.length) {
    showScreen(final, birthday);
    return;
  }

  renderCard();
  if (!reducedMotion.matches) {
    envelope.animate(
      [{ opacity: 0, transform: "translateY(-32%) scale(.68)" }, { opacity: 1, transform: "none" }],
      { duration: 320, easing: "ease-out" },
    );
  }
}

start.addEventListener("click", () => {
  cardIndex = 0;
  renderCard();
  showScreen(cards, envelope);
});

envelope.addEventListener("click", () => {
  if (opening) return;

  opening = true;
  envelope.setAttribute("aria-disabled", "true");
  envelope.classList.add("opening");

  if (reducedMotion.matches) {
    finishOpening();
  } else {
    window.setTimeout(finishOpening, 420);
  }
});

replay.addEventListener("click", () => showScreen(welcome, start));
