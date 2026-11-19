import assert from "node:assert/strict";
import test from "node:test";
import { CHARACTER_STATES, ALL_HIRAGANA } from "../js/characters.js";
import { createMemoryStorage } from "../js/storage.js";

test("memory storage starts with every hiragana unselected", () => {
  const storage = createMemoryStorage();
  const selection = storage.getSelection();

  assert.equal(Object.keys(selection).length, ALL_HIRAGANA.length);
  assert.ok(
    Object.values(selection).every(
      (state) => state === CHARACTER_STATES.unselected
    )
  );
});

test("memory storage updates individual and grouped character states", () => {
  const storage = createMemoryStorage();

  storage.setCharacterState("あ", CHARACTER_STATES.known);
  storage.setCharactersState(["い", "う"], CHARACTER_STATES.learning);

  assert.equal(storage.getSelection()["あ"], CHARACTER_STATES.known);
  assert.equal(storage.getSelection()["い"], CHARACTER_STATES.learning);
  assert.equal(storage.getSelection()["う"], CHARACTER_STATES.learning);
});

test("memory storage rejects unknown characters and states", () => {
  const storage = createMemoryStorage();

  assert.throws(
    () => storage.setCharacterState("A", CHARACTER_STATES.known),
    /Unknown hiragana character/
  );
  assert.throws(
    () => storage.setCharacterState("あ", "mastered"),
    /Unknown character state/
  );
});
