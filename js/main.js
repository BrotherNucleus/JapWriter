import { CHARACTER_STATES, HIRAGANA_ROWS } from "./characters.js";
import { createDrawingCanvas } from "./canvas.js";
import { createMemoryStorage } from "./storage.js";
import { createScheduler } from "./scheduler.js";
import { strings } from "./strings.js";
import { loadWords } from "./words.js";

const MINIMUM_SELECTION = 3;
const storage = createMemoryStorage();
const setupScreen = document.querySelector("#setup-screen");
const practiceScreen = document.querySelector("#practice-screen");
const pageTitle = document.querySelector("#page-title");
const pageIntro = document.querySelector("#page-intro");
const characterGroups = document.querySelector("#character-groups");
const selectionStatus = document.querySelector("#selection-status");
const setupMessage = document.querySelector("#setup-message");
const startButton = document.querySelector("#start-button");
const backButton = document.querySelector("#back-button");
const promptArea = document.querySelector("#prompt-area");
const practiceStatus = document.querySelector("#practice-status");
const writingSurface = document.querySelector("#writing-surface");
const practiceCanvas = document.querySelector("#practice-canvas");
const submitButton = document.querySelector("#submit-button");
const feedbackArea = document.querySelector("#feedback-area");
const nextWordButton = document.querySelector("#next-word-button");
let words = [];
let scheduler;
let currentWord;
let canvasController;

function getSelectedCount(selection) {
  return Object.values(selection).filter(
    (state) => state !== CHARACTER_STATES.unselected
  ).length;
}

function createCharacterButton(character, state) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "character-button";
  button.dataset.character = character;
  button.dataset.state = state;
  button.setAttribute("aria-label", `${character}: ${strings.states[state]}`);
  button.title = `${character}: ${strings.states[state]}`;
  button.textContent = character;
  return button;
}

function createRow(row, selection) {
  const section = document.createElement("section");
  section.className = "character-row";
  section.setAttribute("aria-labelledby", `row-${row.characters[0]}`);
  const heading = document.createElement("div");
  heading.className = "row-heading";
  const title = document.createElement("h3");
  title.id = `row-${row.characters[0]}`;
  title.textContent = row.label;
  heading.append(title);
  const actions = document.createElement("div");
  actions.className = "row-actions";
  for (const [state, label] of [
    [CHARACTER_STATES.known, strings.selection.rowKnown],
    [CHARACTER_STATES.learning, strings.selection.rowLearning],
    [CHARACTER_STATES.unselected, strings.selection.rowClear]
  ]) {
    const action = document.createElement("button");
    action.type = "button";
    action.className = "text-button";
    action.dataset.rowState = state;
    action.textContent = label;
    actions.append(action);
  }
  heading.append(actions);
  const characterList = document.createElement("div");
  characterList.className = "character-list";
  for (const character of row.characters) {
    characterList.append(createCharacterButton(character, selection[character]));
  }
  section.append(heading, characterList);
  return section;
}

function renderSetup() {
  const selection = storage.getSelection();
  characterGroups.replaceChildren(
    ...HIRAGANA_ROWS.map((row) => createRow(row, selection))
  );
  const selectedCount = getSelectedCount(selection);
  selectionStatus.textContent = strings.selection.selectedCount(
    selectedCount,
    Object.keys(selection).length
  );
  startButton.disabled = selectedCount < MINIMUM_SELECTION;
  setupMessage.textContent =
    selectedCount < MINIMUM_SELECTION
      ? strings.selection.minimumRequired(MINIMUM_SELECTION)
      : strings.selection.ready;
}

function showSetup() {
  setupScreen.hidden = false;
  practiceScreen.hidden = true;
  pageTitle.textContent = "Choose your hiragana";
  pageIntro.textContent =
    "Mark characters you know and characters you want to learn. You can change this selection whenever you like.";
  renderSetup();
}

function createPrompt() {
  promptArea.replaceChildren();
  const meaning = document.createElement("p");
  meaning.className = "prompt-meaning";
  meaning.textContent = currentWord.meaning;
  const reading = document.createElement("p");
  reading.className = "prompt-reading";
  reading.textContent = currentWord.romaji;
  reading.setAttribute("aria-label", `Romaji: ${currentWord.romaji}`);
  promptArea.append(meaning, reading);
}

function renderCharacterCanvases() {
  canvasController?.destroy();
  writingSurface.style.setProperty("--word-length", String([...currentWord.word].length));
  practiceCanvas.setAttribute(
    "aria-label",
    `Write the complete word, ${[...currentWord.word].length} characters`
  );
  canvasController = createDrawingCanvas(practiceCanvas, {
    onChange: updatePracticeControls
  });
  canvasController.resize();
  updatePracticeControls();
}

function updatePracticeControls() {
  submitButton.disabled = !(canvasController?.hasStrokes() ?? false);
  practiceStatus.textContent = `Write all ${[...currentWord.word].length} characters in order.`;
}

function startWord() {
  currentWord = scheduler.next(storage.getSelection());
  if (!currentWord) {
    setupMessage.textContent =
      "Too few matching words. Select more characters and try again.";
    return false;
  }
  setupScreen.hidden = true;
  practiceScreen.hidden = false;
  pageTitle.textContent = "Practice Japanese writing";
  pageIntro.textContent =
    "Write each character in order. The Japanese word stays hidden until you submit.";
  feedbackArea.hidden = true;
  submitButton.hidden = false;
  nextWordButton.hidden = true;
  createPrompt();
  renderCharacterCanvases();
  return true;
}

function showFeedback() {
  const list = document.createElement("div");
  list.className = "feedback-list";
  const heading = document.createElement("h3");
  heading.textContent = `Correct word: ${currentWord.word}`;
  list.append(heading);
  [...currentWord.word].forEach((character, index) => {
    const item = document.createElement("div");
    item.className = "feedback-item";
    item.innerHTML = `<span class="feedback-character">${character}</span><span>Character ${index + 1}</span><button type="button" data-result="correct">Right</button><button type="button" data-result="incorrect">Wrong</button>`;
    item.dataset.index = index;
    list.append(item);
  });
  feedbackArea.replaceChildren(list);
  feedbackArea.hidden = false;
  submitButton.hidden = true;
  nextWordButton.hidden = false;
  nextWordButton.disabled = true;
  practiceStatus.textContent = "Mark each character based on your handwriting.";
}

characterGroups.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const row = button.closest(".character-row");
  if (button.dataset.character) {
    const nextState = {
      [CHARACTER_STATES.unselected]: CHARACTER_STATES.known,
      [CHARACTER_STATES.known]: CHARACTER_STATES.learning,
      [CHARACTER_STATES.learning]: CHARACTER_STATES.unselected
    }[button.dataset.state];
    storage.setCharacterState(button.dataset.character, nextState);
  } else if (button.dataset.rowState && row) {
    storage.setCharactersState(
      [...row.querySelectorAll("[data-character]")].map(
        (characterButton) => characterButton.dataset.character
      ),
      button.dataset.rowState
    );
  }
  renderSetup();
});

startButton.addEventListener("click", async () => {
  if (words.length === 0) {
    setupMessage.textContent = "Loading word list...";
    try {
      words = await loadWords();
      scheduler = createScheduler(words);
    } catch (error) {
      setupMessage.textContent = error.message;
      return;
    }
  }
  startWord();
});

submitButton.addEventListener("click", () => {
  showFeedback();
});

feedbackArea.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-result]");
  if (!button) return;
  const item = button.closest(".feedback-item");
  item.dataset.result = button.dataset.result;
  item.querySelectorAll("button").forEach((control) => {
    control.disabled = true;
  });
  const allMarked = [...feedbackArea.querySelectorAll(".feedback-item")]
    .every((feedbackItem) => feedbackItem.dataset.result);
  if (allMarked) {
    const correct = [...feedbackArea.querySelectorAll(".feedback-item")]
      .every((feedbackItem) => feedbackItem.dataset.result === "correct");
    scheduler.record(currentWord, correct);
    nextWordButton.disabled = false;
    practiceStatus.textContent = correct
      ? "All characters marked correct."
      : "Some characters need more practice. They will return soon.";
  }
});

nextWordButton.addEventListener("click", () => {
  startWord();
});

backButton.addEventListener("click", showSetup);

renderSetup();
