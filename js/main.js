import { CHARACTER_STATES, HIRAGANA_ROWS } from "./characters.js";
import { createMemoryStorage } from "./storage.js";
import { strings } from "./strings.js";

const MINIMUM_SELECTION = 3;
const characterGroups = document.querySelector("#character-groups");
const selectionStatus = document.querySelector("#selection-status");
const setupMessage = document.querySelector("#setup-message");
const startButton = document.querySelector("#start-button");
const storage = createMemoryStorage();

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
    characterList.append(
      createCharacterButton(character, selection[character])
    );
  }

  section.append(heading, characterList);
  return section;
}

function render() {
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

characterGroups.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const row = button.closest(".character-row");
  if (button.dataset.character) {
    const currentState = button.dataset.state;
    const nextState = {
      [CHARACTER_STATES.unselected]: CHARACTER_STATES.known,
      [CHARACTER_STATES.known]: CHARACTER_STATES.learning,
      [CHARACTER_STATES.learning]: CHARACTER_STATES.unselected
    }[currentState];
    storage.setCharacterState(button.dataset.character, nextState);
  } else if (button.dataset.rowState && row) {
    storage.setCharactersState(
      [...row.querySelectorAll("[data-character]")].map(
        (characterButton) => characterButton.dataset.character
      ),
      button.dataset.rowState
    );
  }
  render();
});

startButton.addEventListener("click", () => {
  setupMessage.textContent = strings.selection.ready;
});

render();
