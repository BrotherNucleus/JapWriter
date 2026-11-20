import { filterWords, getLearningCount } from "./words.js";

const UNSEEN_WEIGHT = 1;
const CORRECT_WEIGHT = 0.25;
const INCORRECT_WEIGHT = 1.25;
const COOLDOWN_LENGTH = 2;

export function getReviewWeight(record) {
  if (!record) {
    return UNSEEN_WEIGHT;
  }
  return record.correct ? CORRECT_WEIGHT : INCORRECT_WEIGHT;
}

function chooseWeighted(candidates, getWeight, random) {
  const weights = candidates.map(getWeight);
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  let threshold = random() * totalWeight;

  for (let index = 0; index < candidates.length; index += 1) {
    threshold -= weights[index];
    if (threshold < 0) {
      return candidates[index];
    }
  }
  return candidates.at(-1);
}

export function createScheduler(words, random = Math.random) {
  const history = new Map();
  const recentWords = [];

  function next(selection) {
    const recentSet = new Set(recentWords);
    const candidates = filterWords(words, selection).filter(
      (entry) => !recentSet.has(entry.word)
    );
    if (candidates.length === 0) {
      return null;
    }

    const selected = chooseWeighted(
      candidates,
      (entry) =>
        getReviewWeight(history.get(entry.word)) *
        (1 + getLearningCount(entry.word, selection) * 0.25),
      random
    );
    recentWords.push(selected.word);
    if (recentWords.length > COOLDOWN_LENGTH) {
      recentWords.shift();
    }
    return selected;
  }

  function record(entry, correct) {
    history.set(entry.word, { correct });
  }

  return { next, record };
}
