export const CHARACTER_STATES = Object.freeze({
  unselected: "unselected",
  known: "known",
  learning: "learning"
});

export const HIRAGANA_ROWS = Object.freeze([
  { label: "あ row", characters: ["あ", "い", "う", "え", "お"] },
  { label: "か row", characters: ["か", "き", "く", "け", "こ"] },
  { label: "さ row", characters: ["さ", "し", "す", "せ", "そ"] },
  { label: "た row", characters: ["た", "ち", "つ", "て", "と"] },
  { label: "な row", characters: ["な", "に", "ぬ", "ね", "の"] },
  { label: "は row", characters: ["は", "ひ", "ふ", "へ", "ほ"] },
  { label: "ま row", characters: ["ま", "み", "む", "め", "も"] },
  { label: "や row", characters: ["や", "ゆ", "よ"] },
  { label: "ら row", characters: ["ら", "り", "る", "れ", "ろ"] },
  { label: "わ row", characters: ["わ", "を", "ん"] },
  { label: "が row", characters: ["が", "ぎ", "ぐ", "げ", "ご"] },
  { label: "ざ row", characters: ["ざ", "じ", "ず", "ぜ", "ぞ"] },
  { label: "だ row", characters: ["だ", "ぢ", "づ", "で", "ど"] },
  { label: "ば row", characters: ["ば", "び", "ぶ", "べ", "ぼ"] },
  { label: "ぱ row", characters: ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"] }
]);

// Characters that older saved selections may contain but the app no longer offers.
export const RETIRED_CHARACTERS = Object.freeze(
  ["ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ゃ", "ゅ", "ょ", "っ", "ゎ"]
);

export const ALL_HIRAGANA = Object.freeze(
  HIRAGANA_ROWS.flatMap((row) => row.characters)
);

export const KATAKANA_ROWS = Object.freeze([
  { label: "ア row", characters: ["ア", "イ", "ウ", "エ", "オ"] },
  { label: "カ row", characters: ["カ", "キ", "ク", "ケ", "コ"] },
  { label: "サ row", characters: ["サ", "シ", "ス", "セ", "ソ"] },
  { label: "タ row", characters: ["タ", "チ", "ツ", "テ", "ト"] },
  { label: "ナ row", characters: ["ナ", "ニ", "ヌ", "ネ", "ノ"] },
  { label: "ハ row", characters: ["ハ", "ヒ", "フ", "ヘ", "ホ"] },
  { label: "マ row", characters: ["マ", "ミ", "ム", "メ", "モ"] },
  { label: "ヤ row", characters: ["ヤ", "ユ", "ヨ"] },
  { label: "ラ row", characters: ["ラ", "リ", "ル", "レ", "ロ"] },
  { label: "ワ row", characters: ["ワ", "ヲ", "ン"] },
  { label: "ガ row", characters: ["ガ", "ギ", "グ", "ゲ", "ゴ"] },
  { label: "ザ row", characters: ["ザ", "ジ", "ズ", "ゼ", "ゾ"] },
  { label: "ダ row", characters: ["ダ", "ヂ", "ヅ", "デ", "ド"] },
  { label: "バ row", characters: ["バ", "ビ", "ブ", "ベ", "ボ"] },
  { label: "パ row", characters: ["パ", "ピ", "プ", "ペ", "ポ"] },
  { label: "Long vowel mark", characters: ["ー"] }
]);

export const ALL_KATAKANA = Object.freeze(
  KATAKANA_ROWS.flatMap((row) => row.characters)
);

export const SCRIPTS = Object.freeze({
  hiragana: Object.freeze({
    id: "hiragana",
    name: "Hiragana",
    rows: HIRAGANA_ROWS,
    characters: ALL_HIRAGANA,
    retiredCharacters: RETIRED_CHARACTERS,
    storageKey: "japwriter.selection",
    wordsUrl: "./data/words-hiragana.json"
  }),
  katakana: Object.freeze({
    id: "katakana",
    name: "Katakana",
    rows: KATAKANA_ROWS,
    characters: ALL_KATAKANA,
    retiredCharacters: Object.freeze([]),
    storageKey: "japwriter.katakana.selection",
    wordsUrl: "./data/words-katakana.json"
  })
});
