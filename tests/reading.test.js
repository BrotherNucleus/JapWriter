import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CHARACTER_STATES, SCRIPTS } from "../js/characters.js";
import { combineSelections, countReadableWords, READ_SOURCES } from "../js/reading.js";
import { isCorrectReading, normalizeRomaji } from "../js/romaji.js";
import { createMemoryStorage } from "../js/storage.js";

test("readings match regardless of spacing, case and long-vowel spelling", () => {
  assert.ok(isCorrectReading("sakura", "sakura"));
  assert.ok(isCorrectReading("  Sakura ", "sakura"));
  assert.ok(isCorrectReading("hon o yomu", "hon wo yomu"));
  assert.ok(isCorrectReading("honwoyomu", "hon wo yomu"));
  assert.ok(isCorrectReading("kouhii", "koohii"));
  assert.ok(isCorrectReading("kōhī", "koohii"));
  assert.ok(isCorrectReading("otōsan", "otousan"));
  assert.ok(isCorrectReading("hanaji", "hanadi"));
  assert.ok(isCorrectReading("tsuzuku", "tsuduku"));
  assert.ok(isCorrectReading("tempura", "tenpura"));
  assert.ok(isCorrectReading("hune", "fune"));
  assert.ok(isCorrectReading("tukue", "tsukue"));
  assert.ok(isCorrectReading("sita", "shita"));
  assert.ok(isCorrectReading("tizu", "chizu"));
});

test("wrong or empty readings are rejected", () => {
  assert.ok(!isCorrectReading("sakra", "sakura"));
  assert.ok(!isCorrectReading("kohi", "koohii"));
  assert.ok(!isCorrectReading("", "sakura"));
  assert.ok(!isCorrectReading("   ", "sakura"));
  assert.ok(!isCorrectReading("ojisan", "ojiisan"));
});

test("combined selections include characters from every chosen script", () => {
  const storages = {
    hiragana: createMemoryStorage(SCRIPTS.hiragana),
    katakana: createMemoryStorage(SCRIPTS.katakana)
  };
  storages.hiragana.setCharacterState("あ", CHARACTER_STATES.known);
  storages.katakana.setCharacterState("ア", CHARACTER_STATES.learning);

  const both = combineSelections(storages, READ_SOURCES.both);
  assert.equal(both["あ"], CHARACTER_STATES.known);
  assert.equal(both["ア"], CHARACTER_STATES.learning);
  assert.ok(!("ア" in combineSelections(storages, READ_SOURCES.hiragana)));
});

test("readable word count respects the selection and learning-only mode", () => {
  const words = [{ word: "あい" }, { word: "いえ" }, { word: "アイ" }];
  const selection = {
    あ: CHARACTER_STATES.known,
    い: CHARACTER_STATES.learning,
    え: CHARACTER_STATES.known,
    ア: CHARACTER_STATES.known,
    イ: CHARACTER_STATES.known
  };
  assert.equal(countReadableWords(words, selection, false), 3);
  assert.equal(countReadableWords(words, selection, true), 2);
});

// Independent kana-to-romaji conversion, used only to check the word lists.
const KANA_ROMAJI = Object.fromEntries(
  [
    "あa いi うu えe おo かka きki くku けke こko さsa しshi すsu せse そso",
    "たta ちchi つtsu てte とto なna にni ぬnu ねne のno はha ひhi ふfu へhe ほho",
    "まma みmi むmu めme もmo やya ゆyu よyo らra りri るru れre ろro わwa をwo んn",
    "がga ぎgi ぐgu げge ごgo ざza じji ずzu ぜze ぞzo だda ぢdi づdu でde どdo",
    "ばba びbi ぶbu べbe ぼbo ぱpa ぴpi ぷpu ぺpe ぽpo"
  ]
    .join(" ")
    .split(" ")
    .flatMap((pair) => {
      const kana = pair[0];
      const romaji = pair.slice(1);
      const katakana = String.fromCodePoint(kana.codePointAt(0) + 0x60);
      return [[kana, romaji], [katakana, romaji]];
    })
);

function kanaToRomaji(word) {
  let romaji = "";
  for (const character of word) {
    if (character === "ー") {
      romaji += romaji.at(-1);
    } else {
      romaji += KANA_ROMAJI[character];
    }
  }
  return romaji;
}

for (const script of Object.values(SCRIPTS)) {
  test(`${script.id} word list romaji matches the kana`, () => {
    const url = new URL(script.wordsUrl, new URL("../", import.meta.url));
    const words = JSON.parse(readFileSync(url, "utf8"));
    const mismatches = words
      .filter((entry) => normalizeRomaji(kanaToRomaji(entry.word)) !== normalizeRomaji(entry.romaji))
      .map((entry) => `${entry.word}: ${entry.romaji} (expected ${kanaToRomaji(entry.word)})`);
    assert.deepEqual(mismatches, []);
  });
}
