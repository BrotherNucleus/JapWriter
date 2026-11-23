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
