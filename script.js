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
const bouquet = document.querySelector("#bouquet");
const bouquetNote = document.querySelector("#bouquet-note");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const greetings = [
  { title: "Это для тебя", flower: "peony", label: "Открыть первую открытку" },
  { title: "Спасибо, что ты рядом", flower: "roses", label: "Открыть вторую открытку" },
  { title: "А внутри — самое главное", flower: "bouquet", label: "Открыть последнюю открытку" },
];

const easePaper = "cubic-bezier(.22, .75, .25, 1)";
const cardCopy = [cardTitle, document.querySelector("#card-hint"), progress];
const canAnimate = () => !reducedMotion.matches && typeof envelope.animate === "function";

let cardIndex = 0;
let activeScreen = welcome;
let busy = false;

function animate(element, frames, duration, delay = 0) {
  return element.animate(frames, { duration, delay, easing: easePaper, fill: "both" });
}

function revealScreen(screen, focusTarget) {
  activeScreen.hidden = true;
  screen.hidden = false;
  activeScreen = screen;
  window.scrollTo(0, 0);
  focusTarget.focus({ preventScroll: true });
}

function fadeIn(screen) {
  return animate(screen, [
    { opacity: 0, transform: "translateY(14px) scale(.985)" },
    { opacity: 1, transform: "none" },
  ], 470);
}

async function changeScreen(screen, focusTarget) {
  if (busy) return;
  busy = true;

  if (canAnimate()) {
    const outgoing = animate(activeScreen, [
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: "translateY(-8px) scale(.99)" },
    ], 210);
    await outgoing.finished;
    revealScreen(screen, focusTarget);
    outgoing.cancel();

    const incoming = fadeIn(screen);
    await incoming.finished;
    incoming.cancel();
  } else {
    revealScreen(screen, focusTarget);
  }

  busy = false;
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

function setBouquetNote(open) {
  bouquetNote.hidden = !open;
  bouquet.setAttribute("aria-expanded", String(open));
}

function showNextCard() {
  cardIndex += 1;

  if (cardIndex === greetings.length) {
    setBouquetNote(false);
    revealScreen(final, birthday);
  } else {
    renderCard();
  }
}

async function openCard() {
  if (busy) return;
  busy = true;
  envelope.setAttribute("aria-disabled", "true");

  if (canAnimate()) {
    envelope.classList.add("opening");
    const oldCard = animate(envelope, [
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: "translateY(-28px) scale(.96)" },
    ], 250, 390);
    const oldCopy = cardCopy.map(element => animate(element, [
      { opacity: 1 },
      { opacity: 0 },
    ], 230, 345));
    await oldCard.finished;

    envelope.classList.remove("opening");
    showNextCard();
    oldCard.cancel();
    oldCopy.forEach(animation => animation.cancel());

    const incoming = activeScreen === final
      ? [fadeIn(final)]
      : [
          animate(envelope, [
            { opacity: 0, transform: "translateY(-38px) scale(.86)" },
            { opacity: 1, transform: "none" },
          ], 440),
          ...cardCopy.map(element => animate(element, [
            { opacity: 0, transform: "translateY(5px)" },
            { opacity: 1, transform: "none" },
          ], 360, 60)),
        ];

    await Promise.all(incoming.map(animation => animation.finished));
    incoming.forEach(animation => animation.cancel());
  } else {
    showNextCard();
  }

  envelope.removeAttribute("aria-disabled");
  busy = false;
}

start.addEventListener("click", () => {
  if (busy) return;
  cardIndex = 0;
  renderCard();
  changeScreen(cards, envelope);
});

envelope.addEventListener("click", openCard);
bouquet.addEventListener("click", () => setBouquetNote(bouquetNote.hidden));
replay.addEventListener("click", () => changeScreen(welcome, start));
