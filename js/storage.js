import { CHARACTER_STATES, ALL_HIRAGANA } from "./characters.js";

function createEmptySelection() {
  return Object.fromEntries(
    ALL_HIRAGANA.map((character) => [character, CHARACTER_STATES.unselected])
  );
}

export function createMemoryStorage() {
  let selection = createEmptySelection();

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
    },
    setCharactersState(characters, state) {
      characters.forEach((character) => {
        this.setCharacterState(character, state);
      });
    }
  };
}
