import { CHARACTER_STATES } from "./characters.js";

export function filterWords(words, selection) {
  const selected = new Set(
    Object.entries(selection)
      .filter(([, state]) => state !== CHARACTER_STATES.unselected)
      .map(([character]) => character)
  );
  return words.filter((entry) =>
    [...entry.word].every((character) => selected.has(character))
  );
}

export async function loadWords(url = "./data/words-hiragana.json") {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load word data (${response.status}).`);
  }
  const words = await response.json();
  if (!Array.isArray(words)) {
    throw new Error("Word data must be an array.");
  }
  return words;
}

const scriptWordCache = new Map();

// Load a script's word list once and share it between writing and reading.
export function loadScriptWords(script) {
  if (!scriptWordCache.has(script.id)) {
    const request = loadWords(script.wordsUrl).catch((error) => {
      scriptWordCache.delete(script.id);
      throw error;
    });
    scriptWordCache.set(script.id, request);
  }
  return scriptWordCache.get(script.id);
}

export function getLearningCount(word, selection) {
  return [...word].filter(
    (character) => selection[character] === CHARACTER_STATES.learning
  ).length;
}
