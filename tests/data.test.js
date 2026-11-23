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
