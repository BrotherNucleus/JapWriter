import assert from "node:assert/strict";
import test from "node:test";
import { CHARACTER_STATES } from "../js/characters.js";
import {
  createScheduler,
  getPracticeWeight,
  getReviewWeight
} from "../js/scheduler.js";
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

test("scheduler scores unseen words above incorrect and correct words", () => {
  assert.ok(getReviewWeight() > getReviewWeight({ correct: false }));
  assert.ok(getReviewWeight({ correct: false }) > getReviewWeight({ correct: true }));
  assert.ok(getReviewWeight({ correct: true }) < getReviewWeight());
});

test("scheduler gives known-only words a lower weight than learning words", () => {
  const selection = {
    あ: CHARACTER_STATES.known,
    い: CHARACTER_STATES.learning,
    お: CHARACTER_STATES.known
  };

  assert.ok(
    getPracticeWeight(words[1], selection) <
      getPracticeWeight({ word: "い" }, selection)
  );
});

test("learning-only mode picks only words containing a learning character", () => {
  const selection = {
    あ: CHARACTER_STATES.known,
    い: CHARACTER_STATES.learning,
    お: CHARACTER_STATES.known,
    か: CHARACTER_STATES.known
  };
  const scheduler = createScheduler(words, () => 0.99);

  for (let round = 0; round < 6; round += 1) {
    assert.equal(scheduler.next(selection, { learningOnly: true }).word, "あい");
  }
});

test("learning-only mode returns nothing when no word has a learning character", () => {
  const selection = {
    あ: CHARACTER_STATES.known,
    い: CHARACTER_STATES.known,
    お: CHARACTER_STATES.known,
    か: CHARACTER_STATES.known
  };
  const scheduler = createScheduler(words);

  assert.equal(scheduler.next(selection, { learningOnly: true }), null);
  assert.ok(scheduler.next(selection));
});
