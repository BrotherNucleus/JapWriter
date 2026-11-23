import assert from "node:assert/strict";
import test from "node:test";
import { CHARACTER_STATES, ALL_HIRAGANA, RETIRED_CHARACTERS } from "../js/characters.js";
import {
  createLocalStorage,
  createMemoryStorage,
  SELECTION_STORAGE_KEY
} from "../js/storage.js";

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

test("local storage saves and restores the selection", () => {
  const values = new Map();
  const browserStorage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
  const storage = createLocalStorage(browserStorage);

  storage.setCharacterState("あ", CHARACTER_STATES.known);
  const restored = createLocalStorage(browserStorage);

  assert.equal(
    restored.getSelection()["あ"],
    CHARACTER_STATES.known
  );
  assert.ok(values.has(SELECTION_STORAGE_KEY));
});

test("selection data can be exported and imported", () => {
  const source = createMemoryStorage();
  source.setCharacterState("あ", CHARACTER_STATES.known);
  source.setCharacterState("い", CHARACTER_STATES.learning);

  const destination = createMemoryStorage();
  destination.importSelection(source.exportSelection());

  assert.equal(
    destination.getSelection()["あ"],
    CHARACTER_STATES.known
  );
  assert.equal(
    destination.getSelection()["い"],
    CHARACTER_STATES.learning
  );
});

test("selection import rejects invalid and unsupported files", () => {
  const storage = createMemoryStorage();

  assert.throws(
    () => storage.importSelection("{"),
    /Could not read hiragana selection file/
  );
  assert.throws(
    () => storage.importSelection(JSON.stringify({ version: 2, selection: {} })),
    /unsupported format/
  );
});

test("selections saved with retired small kana still load", () => {
  const legacySelection = Object.fromEntries(
    [...ALL_HIRAGANA, ...RETIRED_CHARACTERS].map((character) => [
      character,
      CHARACTER_STATES.unselected
    ])
  );
  legacySelection["あ"] = CHARACTER_STATES.known;
  legacySelection["ゃ"] = CHARACTER_STATES.learning;

  const storage = createMemoryStorage();
  storage.importSelection(JSON.stringify({ version: 1, selection: legacySelection }));
  assert.equal(storage.getSelection()["あ"], CHARACTER_STATES.known);
  assert.ok(!("ゃ" in storage.getSelection()));

  const browserStorage = {
    getItem: () => JSON.stringify(legacySelection),
    setItem() {}
  };
  const restored = createLocalStorage(browserStorage);
  assert.equal(Object.keys(restored.getSelection()).length, ALL_HIRAGANA.length);
});
