export const strings = Object.freeze({
  states: {
    unselected: "Not selected",
    known: "Known",
    learning: "Learning"
  },
  selection: {
    selectedCount: (selected, total) => `${selected} of ${total} characters selected`,
    minimumRequired: (minimum) => `Select at least ${minimum} characters to start.`,
    ready: "Your selection is ready. Practice will be connected in the next milestone.",
    rowKnown: "Mark row as known",
    rowLearning: "Mark row as learning",
    rowClear: "Clear row"
  },
  practiceMode: {
    learningOnly: "Only words with learning characters",
    noLearningCharacters:
      "Mark at least one character as learning to use learning-only practice.",
    noLearningWords:
      "No words match your learning characters. Mark more characters, or turn off learning-only practice."
  },
  modes: {
    writeTitle: (scriptName) => `Choose your ${scriptName.toLowerCase()}`,
    writeIntro:
      "Mark characters you know and characters you want to learn. You can change this selection whenever you like."
  },
  reading: {
    setupTitle: "Read Japanese",
    setupIntro:
      "See a word written in kana and type how it is read in romaji. Words come from the characters you marked in Write mode.",
    practiceTitle: "Read the word",
    practiceIntro: "Type the reading in romaji, then press Enter or Check.",
    matchingWords: (count) => `${count} ${count === 1 ? "word matches" : "words match"} your selection`,
    ready: "Ready to read.",
    noWords: (sourceName) =>
      sourceName === "Both"
        ? "No words match. Mark more characters in the Hiragana or Katakana tab of Write mode."
        : `No words match. Mark more characters in the ${sourceName} tab of Write mode.`,
    correct: "Correct!",
    incorrect: "Not quite.",
    answer: (romaji, meaning) => `Reading: ${romaji} — ${meaning}`,
    yourAnswer: (answer) => `You wrote: ${answer}`,
    sessionScore: (correct, total) =>
      total === 0 ? "" : `${correct} of ${total} correct this session`
  }
});
