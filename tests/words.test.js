import assert from "node:assert/strict";
import test from "node:test";
import { CHARACTER_STATES } from "../js/characters.js";
import { createScheduler, getReviewWeight } from "../js/scheduler.js";
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

test("scheduler keeps a word out of the next two selections", () => {
  const scheduler = createScheduler(
    [...words, { word: "あ", meaning: "ah", romaji: "a" }],
    () => 0
  );
  const selection = {
    あ: CHARACTER_STATES.learning,
    い: CHARACTER_STATES.known,
    お: CHARACTER_STATES.known
  };

  const first = scheduler.next(selection);
  const second = scheduler.next(selection);
  const third = scheduler.next(selection);
  const fourth = scheduler.next(selection);

  assert.notEqual(first.word, second.word);
  assert.notEqual(first.word, third.word);
  assert.equal(first.word, fourth.word);
});

test("scheduler scores incorrect words above unseen words and correct words below them", () => {
  assert.ok(getReviewWeight({ correct: false }) > getReviewWeight());
  assert.ok(getReviewWeight({ correct: true }) < getReviewWeight());
});
