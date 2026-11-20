import { CHARACTER_STATES, ALL_HIRAGANA } from "./characters.js";

export const SELECTION_STORAGE_KEY = "japwriter.selection";

function createEmptySelection() {
  return Object.fromEntries(
    ALL_HIRAGANA.map((character) => [character, CHARACTER_STATES.unselected])
  );
}

function validateSelection(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Saved hiragana selection has an invalid format.");
  }

  const expectedCharacters = new Set(ALL_HIRAGANA);
  const savedCharacters = Object.keys(value);
  if (
    savedCharacters.length !== expectedCharacters.size ||
    savedCharacters.some((character) => !expectedCharacters.has(character))
  ) {
    throw new Error("Saved hiragana selection contains invalid characters.");
  }
  if (
    Object.values(value).some(
      (state) => !Object.values(CHARACTER_STATES).includes(state)
    )
  ) {
    throw new Error("Saved hiragana selection contains invalid states.");
  }
  return { ...value };
}

function createSelectionStorage(initialSelection, persist) {
  let selection = validateSelection(initialSelection);

  return {
    getSelection() {
      return { ...selection };
    },
    setCharacterState(character, state) {
      if (!(character in selection)) {
        throw new Error(`Unknown hiragana character: ${character}`);
      }
      if (!Object.values(CHARACTER_STATES).includes(state)) {
        throw new Error(`Unknown character state: ${state}`);
      }
      selection = { ...selection, [character]: state };
      persist(selection);
    },
    setCharactersState(characters, state) {
      const nextSelection = { ...selection };
      characters.forEach((character) => {
        if (!(character in selection)) {
          throw new Error(`Unknown hiragana character: ${character}`);
        }
        nextSelection[character] = state;
      });
      if (!Object.values(CHARACTER_STATES).includes(state)) {
        throw new Error(`Unknown character state: ${state}`);
      }
      selection = nextSelection;
      persist(selection);
    }
  };
}

export function createMemoryStorage() {
  return createSelectionStorage(createEmptySelection(), () => {});
}

export function createLocalStorage(storage = globalThis.localStorage) {
  const savedSelection = storage.getItem(SELECTION_STORAGE_KEY);
  let selection = createEmptySelection();
  if (savedSelection !== null) {
    try {
      selection = validateSelection(JSON.parse(savedSelection));
    } catch (error) {
      throw new Error(`Could not restore saved selection: ${error.message}`);
    }
  }

  return createSelectionStorage(selection, (nextSelection) => {
    try {
      storage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(nextSelection));
    } catch (error) {
      throw new Error(`Could not save hiragana selection: ${error.message}`);
    }
  });
}
