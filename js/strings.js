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
  }
});
