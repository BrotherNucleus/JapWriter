import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SCRIPTS } from "../js/characters.js";

for (const script of Object.values(SCRIPTS)) {
  test(`${script.id} words use only selectable ${script.id} characters`, () => {
    const url = new URL(script.wordsUrl, new URL("../", import.meta.url));
    const words = JSON.parse(readFileSync(url, "utf8"));
    const allowed = new Set(script.characters);

    assert.ok(words.length > 0);
    for (const entry of words) {
      const invalid = [...entry.word].filter((character) => !allowed.has(character));
      assert.deepEqual(invalid, [], `${entry.word} has unselectable characters`);
      assert.equal(typeof entry.romaji, "string");
      assert.equal(typeof entry.meaning, "string");
    }
    assert.equal(new Set(words.map((entry) => entry.word)).size, words.length);
  });
}

// Characters that no real words in that script use.
const CHARACTERS_WITHOUT_WORDS = {
  hiragana: [],
  katakana: ["ヲ", "ヂ", "ヅ"]
};
const MINIMUM_WORDS_PER_CHARACTER = 3;

for (const script of Object.values(SCRIPTS)) {
  test(`every ${script.id} character appears in at least ${MINIMUM_WORDS_PER_CHARACTER} words`, () => {
    const url = new URL(script.wordsUrl, new URL("../", import.meta.url));
    const words = JSON.parse(readFileSync(url, "utf8"));
    const exempt = new Set(CHARACTERS_WITHOUT_WORDS[script.id]);
    const rare = script.characters
      .filter((character) => !exempt.has(character))
      .map((character) => [character, words.filter((entry) => entry.word.includes(character)).length])
      .filter(([, count]) => count < MINIMUM_WORDS_PER_CHARACTER);
    assert.deepEqual(rare, []);
  });
}
