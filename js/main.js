import { CHARACTER_STATES, SCRIPTS } from "./characters.js";
import { createDrawingCanvas } from "./canvas.js";
import { createLocalStorage, createPreferences } from "./storage.js";
import { createScheduler } from "./scheduler.js";
import { strings } from "./strings.js";
import { loadWords } from "./words.js";

const MINIMUM_SELECTION = 3;
const preferences = createPreferences();
const storages = Object.fromEntries(
  Object.values(SCRIPTS).map((script) => [script.id, createLocalStorage(localStorage, script)])
);
let activeScriptId = preferences.getActiveScript();
const scriptTabs = document.querySelector("#script-tabs");
const setupScreen = document.querySelector("#setup-screen");
const practiceScreen = document.querySelector("#practice-screen");
const pageTitle = document.querySelector("#page-title");
const pageIntro = document.querySelector("#page-intro");
const characterGroups = document.querySelector("#character-groups");
const selectionStatus = document.querySelector("#selection-status");
const setupMessage = document.querySelector("#setup-message");
const downloadSelectionButton = document.querySelector("#download-selection-button");
const selectionFileInput = document.querySelector("#selection-file-input");
const startButton = document.querySelector("#start-button");
const learningOnlyToggle = document.querySelector("#learning-only-toggle");
const learningOnlyLabel = document.querySelector("#learning-only-label");
const backButton = document.querySelector("#back-button");
const promptArea = document.querySelector("#prompt-area");
const practiceStatus = document.querySelector("#practice-status");
const writingSurface = document.querySelector("#writing-surface");
const practiceCanvas = document.querySelector("#practice-canvas");
const submitButton = document.querySelector("#submit-button");
const feedbackArea = document.querySelector("#feedback-area");
const nextWordButton = document.querySelector("#next-word-button");
const schedulers = {};
let currentWord;
let canvasController;

function activeScript() {
  return SCRIPTS[activeScriptId];
}

function activeStorage() {
  return storages[activeScriptId];
}

function renderScriptTabs() {
  scriptTabs.querySelectorAll("[data-script]").forEach((tab) => {
    const selected = tab.dataset.script === activeScriptId;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
}

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
  renderScriptTabs();
  const selection = activeStorage().getSelection();
  characterGroups.replaceChildren(
    ...activeScript().rows.map((row) => createRow(row, selection))
  );
  const selectedCount = getSelectedCount(selection);
  selectionStatus.textContent = strings.selection.selectedCount(
    selectedCount,
    Object.keys(selection).length
  );
  const learningOnly = preferences.getLearningOnly();
  const hasLearning = Object.values(selection).includes(CHARACTER_STATES.learning);
  learningOnlyToggle.checked = learningOnly;
  startButton.disabled =
    selectedCount < MINIMUM_SELECTION || (learningOnly && !hasLearning);
  if (selectedCount < MINIMUM_SELECTION) {
    setupMessage.textContent = strings.selection.minimumRequired(MINIMUM_SELECTION);
  } else if (learningOnly && !hasLearning) {
    setupMessage.textContent = strings.practiceMode.noLearningCharacters;
  } else {
    setupMessage.textContent = strings.selection.ready;
  }
}

function showSetup() {
  setupScreen.hidden = false;
  practiceScreen.hidden = true;
  pageTitle.textContent = `Choose your ${activeScript().name.toLowerCase()}`;
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
  const learningOnly = preferences.getLearningOnly();
  currentWord = schedulers[activeScriptId].next(activeStorage().getSelection(), { learningOnly });
  if (!currentWord) {
    showSetup();
    setupMessage.textContent = learningOnly
      ? strings.practiceMode.noLearningWords
      : "Too few matching words. Select more characters and try again.";
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
    activeStorage().setCharacterState(button.dataset.character, nextState);
  } else if (button.dataset.rowState && row) {
    activeStorage().setCharactersState(
      [...row.querySelectorAll("[data-character]")].map(
        (characterButton) => characterButton.dataset.character
      ),
      button.dataset.rowState
    );
  }
  renderSetup();
});

if (downloadSelectionButton) {
  downloadSelectionButton.addEventListener("click", () => {
    const file = new Blob([activeStorage().exportSelection()], {
      type: "application/json"
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `japwriter-${activeScriptId}-selection.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });
}

if (selectionFileInput) {
  selectionFileInput.addEventListener("change", async () => {
    const [file] = selectionFileInput.files;
    if (!file) return;
    try {
      activeStorage().importSelection(await file.text());
      renderSetup();
      setupMessage.textContent = "Selection imported successfully.";
    } catch (error) {
      renderSetup();
      setupMessage.textContent = error.message;
    } finally {
      selectionFileInput.value = "";
    }
  });
}

startButton.addEventListener("click", async () => {
  if (!schedulers[activeScriptId]) {
    setupMessage.textContent = "Loading word list...";
    try {
      const words = await loadWords(activeScript().wordsUrl);
      schedulers[activeScriptId] = createScheduler(words);
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
    schedulers[activeScriptId].record(currentWord, correct);
    nextWordButton.disabled = false;
    practiceStatus.textContent = correct
      ? "All characters marked correct."
      : "Some characters need more practice. They will return soon.";
  }
});

nextWordButton.addEventListener("click", () => {
  startWord();
});

learningOnlyToggle.addEventListener("change", () => {
  preferences.setLearningOnly(learningOnlyToggle.checked);
  renderSetup();
});

scriptTabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-script]");
  if (!tab || tab.dataset.script === activeScriptId) return;
  activeScriptId = tab.dataset.script;
  preferences.setActiveScript(activeScriptId);
  showSetup();
});

scriptTabs.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  const tabs = [...scriptTabs.querySelectorAll("[data-script]")];
  const index = tabs.findIndex((tab) => tab.dataset.script === activeScriptId);
  const next = tabs[(index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
  next.click();
  next.focus();
});

backButton.addEventListener("click", showSetup);

learningOnlyLabel.textContent = strings.practiceMode.learningOnly;

showSetup();
