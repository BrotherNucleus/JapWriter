import { CHARACTER_STATES, SCRIPTS } from "./characters.js";

export const SELECTION_STORAGE_KEY = SCRIPTS.hiragana.storageKey;
export const LEARNING_ONLY_STORAGE_KEY = "japwriter.learningOnly";
export const ACTIVE_SCRIPT_STORAGE_KEY = "japwriter.activeScript";
export const MODE_STORAGE_KEY = "japwriter.mode";
export const READ_SOURCE_STORAGE_KEY = "japwriter.readSource";

const MODES = Object.freeze(["write", "read"]);
const READ_SOURCE_IDS = Object.freeze(["hiragana", "katakana", "both"]);

function createEmptySelection(script) {
  return Object.fromEntries(
    script.characters.map((character) => [character, CHARACTER_STATES.unselected])
  );
}

function validateSelection(rawValue, script) {
  const label = script.name.toLowerCase();
  if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
    throw new Error(`Saved ${label} selection has an invalid format.`);
  }

  const value = { ...rawValue };
  script.retiredCharacters.forEach((character) => delete value[character]);

  const expectedCharacters = new Set(script.characters);
  const savedCharacters = Object.keys(value);
  if (
    savedCharacters.length !== expectedCharacters.size ||
    savedCharacters.some((character) => !expectedCharacters.has(character))
  ) {
    throw new Error(`Saved ${label} selection contains invalid characters.`);
  }
  if (
    Object.values(value).some(
      (state) => !Object.values(CHARACTER_STATES).includes(state)
    )
  ) {
    throw new Error(`Saved ${label} selection contains invalid states.`);
  }
  return value;
}

function createSelectionStorage(script, initialSelection, persist) {
  const label = script.name.toLowerCase();
  let selection = validateSelection(initialSelection, script);

  function assertState(state) {
    if (!Object.values(CHARACTER_STATES).includes(state)) {
      throw new Error(`Unknown character state: ${state}`);
    }
  }

  function assertCharacter(character) {
    if (!(character in selection)) {
      throw new Error(`Unknown ${label} character: ${character}`);
    }
  }

  return {
    script,
    getSelection() {
      return { ...selection };
    },
    exportSelection() {
      return JSON.stringify(
        { version: 1, script: script.id, selection },
        null,
        2
      );
    },
    importSelection(serializedSelection) {
      let imported;
      try {
        imported = JSON.parse(serializedSelection);
      } catch (error) {
        throw new Error(`Could not read ${label} selection file: ${error.message}`);
      }
      if (!imported || imported.version !== 1 || !imported.selection) {
        throw new Error(`Could not read ${label} selection file: unsupported format.`);
      }
      // Files saved before katakana existed have no script field and are hiragana.
      const fileScript = SCRIPTS[imported.script ?? SCRIPTS.hiragana.id];
      if (fileScript && fileScript.id !== script.id) {
        throw new Error(
          `This file holds a ${fileScript.name.toLowerCase()} selection. Switch to the ${fileScript.name} tab to upload it.`
        );
      }
      selection = validateSelection(imported.selection, script);
      persist(selection);
    },
    setCharacterState(character, state) {
      assertCharacter(character);
      assertState(state);
      selection = { ...selection, [character]: state };
      persist(selection);
    },
    setCharactersState(characters, state) {
      characters.forEach(assertCharacter);
      assertState(state);
      const nextSelection = { ...selection };
      characters.forEach((character) => {
        nextSelection[character] = state;
      });
      selection = nextSelection;
      persist(selection);
    }
  };
}

export function createMemoryStorage(script = SCRIPTS.hiragana) {
  return createSelectionStorage(script, createEmptySelection(script), () => {});
}

export function createLocalStorage(
  storage = globalThis.localStorage,
  script = SCRIPTS.hiragana
) {
  const label = script.name.toLowerCase();
  const savedSelection = storage.getItem(script.storageKey);
  let selection = createEmptySelection(script);
  if (savedSelection !== null) {
    try {
      selection = validateSelection(JSON.parse(savedSelection), script);
    } catch (error) {
      throw new Error(`Could not restore saved selection: ${error.message}`);
    }
  }

  return createSelectionStorage(script, selection, (nextSelection) => {
    try {
      storage.setItem(script.storageKey, JSON.stringify(nextSelection));
    } catch (error) {
      throw new Error(`Could not save ${label} selection: ${error.message}`);
    }
  });
}

export function createPreferences(storage = globalThis.localStorage) {
  function save(key, value) {
    try {
      storage.setItem(key, value);
    } catch (error) {
      throw new Error(`Could not save preferences: ${error.message}`);
    }
  }

  return {
    getLearningOnly() {
      return storage.getItem(LEARNING_ONLY_STORAGE_KEY) === "true";
    },
    setLearningOnly(value) {
      save(LEARNING_ONLY_STORAGE_KEY, String(Boolean(value)));
    },
    getActiveScript() {
      const saved = storage.getItem(ACTIVE_SCRIPT_STORAGE_KEY);
      return saved in SCRIPTS ? saved : SCRIPTS.hiragana.id;
    },
    setActiveScript(scriptId) {
      if (!(scriptId in SCRIPTS)) {
        throw new Error(`Unknown script: ${scriptId}`);
      }
      save(ACTIVE_SCRIPT_STORAGE_KEY, scriptId);
    },
    getMode() {
      const saved = storage.getItem(MODE_STORAGE_KEY);
      return MODES.includes(saved) ? saved : MODES[0];
    },
    setMode(mode) {
      if (!MODES.includes(mode)) {
        throw new Error(`Unknown mode: ${mode}`);
      }
      save(MODE_STORAGE_KEY, mode);
    },
    getReadSource() {
      const saved = storage.getItem(READ_SOURCE_STORAGE_KEY);
      return READ_SOURCE_IDS.includes(saved) ? saved : READ_SOURCE_IDS[0];
    },
    setReadSource(sourceId) {
      if (!READ_SOURCE_IDS.includes(sourceId)) {
        throw new Error(`Unknown reading source: ${sourceId}`);
      }
      save(READ_SOURCE_STORAGE_KEY, sourceId);
    }
  };
}
