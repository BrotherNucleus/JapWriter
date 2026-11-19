import assert from "node:assert/strict";
import test from "node:test";
import { CHARACTER_STATES } from "../js/characters.js";
import { createScheduler } from "../js/scheduler.js";
import { filterWords } from "../js/words.js";

const words = [
  { word: "あい", meaning: "love", romaji: "ai" },
  { word: "あお", meaning: "blue", romaji: "ao" },
  { word: "かお", meaning: "face", romaji: "kao" }
];

test("word filtering includes only words made from selected characters", () => {
  const selection = {
    あ: CHARACTER_STATES.known,
    い: CHARACTER_STATES.learning,
    お: CHARACTER_STATES.known,
    か: CHARACTER_STATES.unselected
  };

  assert.deepEqual(
    filterWords(words, selection).map((word) => word.word),
    ["あい", "あお"]
  );
});

test("scheduler avoids repeating the previous word", () => {
  const scheduler = createScheduler(words, () => 0);
  const selection = {
    あ: CHARACTER_STATES.learning,
    い: CHARACTER_STATES.known,
    お: CHARACTER_STATES.known
  };

  const first = scheduler.next(selection);
  const second = scheduler.next(selection);

  assert.notEqual(first.word, second.word);
});

test("scheduler prioritizes a word answered incorrectly", () => {
  const scheduler = createScheduler(words, () => 0);
  const selection = {
    あ: CHARACTER_STATES.known,
    い: CHARACTER_STATES.known,
    お: CHARACTER_STATES.known,
    か: CHARACTER_STATES.known
  };

  const first = scheduler.next(selection);
  scheduler.record(first, true);
  const second = scheduler.next(selection);
  scheduler.record(second, false);
  const third = scheduler.next(selection);
  const fourth = scheduler.next(selection);

  assert.notEqual(third.word, second.word);
  assert.equal(fourth.word, second.word);
});
