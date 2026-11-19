import { filterWords, getLearningCount } from "./words.js";

export function createScheduler(words, random = Math.random) {
  const history = new Map();
  let previousWord = null;

  function next(selection) {
    const candidates = filterWords(words, selection).filter(
      (entry) => entry.word !== previousWord
    );
    if (candidates.length === 0) {
      return null;
    }

    const maximumPriority = Math.max(
      ...candidates.map((entry) => {
        const record = history.get(entry.word);
        const reviewPriority = record?.nextPriority ?? 0;
        return reviewPriority + getLearningCount(entry.word, selection) * 2;
      })
    );
    const prioritized = candidates.filter((entry) => {
      const record = history.get(entry.word);
      const reviewPriority = record?.nextPriority ?? 0;
      return (
        reviewPriority + getLearningCount(entry.word, selection) * 2 ===
        maximumPriority
      );
    });
    const selected = prioritized[Math.floor(random() * prioritized.length)];
    previousWord = selected.word;
    return selected;
  }

  function record(entry, correct) {
    history.set(entry.word, {
      nextPriority: correct ? -1 : 3
    });
  }

  return { next, record };
}
