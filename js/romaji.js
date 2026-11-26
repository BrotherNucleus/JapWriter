const MACRONS = Object.freeze({
  ā: "aa", â: "aa",
  ī: "ii", î: "ii",
  ū: "uu", û: "uu",
  ē: "ee", ê: "ee",
  ō: "oo", ô: "oo"
});

// Reduce a romaji string to a form where accepted spelling variants match:
// macrons or doubled vowels for long vowels, "ou" for long o, を as o or wo,
// ぢ/づ as ji/zu or di/du, m before b/p (tempura), and Nihon-shiki spellings
// such as si, ti, tu, hu.
export function normalizeRomaji(text) {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[āâīîūûēêōô]/g, (vowel) => MACRONS[vowel])
    .replace(/[\s'’\-.]/g, "")
    .replace(/m(?=[bp])/g, "n")
    .replace(/si/g, "shi")
    .replace(/ti/g, "chi")
    .replace(/tu/g, "tsu")
    .replace(/(?<![sc])hu/g, "fu")
    .replace(/zi/g, "ji")
    .replace(/di/g, "ji")
    .replace(/du/g, "zu")
    .replace(/wo/g, "o")
    .replace(/ou/g, "oo");
}

export function isCorrectReading(answer, expectedRomaji) {
  const normalized = normalizeRomaji(answer);
  return normalized.length > 0 && normalized === normalizeRomaji(expectedRomaji);
}
