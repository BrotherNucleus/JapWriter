import { CHARACTER_STATES, SCRIPTS } from "./characters.js";
import { isCorrectReading } from "./romaji.js";
import { createScheduler } from "./scheduler.js";
import { strings } from "./strings.js";
import { filterWords, getLearningCount, loadScriptWords } from "./words.js";

export const READ_SOURCES = Object.freeze({
  hiragana: Object.freeze({ id: "hiragana", name: "Hiragana", scripts: ["hiragana"] }),
  katakana: Object.freeze({ id: "katakana", name: "Katakana", scripts: ["katakana"] }),
  both: Object.freeze({ id: "both", name: "Both", scripts: ["hiragana", "katakana"] })
});

export function combineSelections(storages, source) {
  return Object.assign(
    {},
    ...source.scripts.map((scriptId) => storages[scriptId].getSelection())
  );
}

export function countReadableWords(words, selection, learningOnly) {
  return filterWords(words, selection).filter(
    (entry) => !learningOnly || getLearningCount(entry.word, selection) > 0
  ).length;
}

export function createReadingMode({ storages, preferences, setHeader, setModeTabsVisible }) {
  const setupScreen = document.querySelector("#read-setup-screen");
  const practiceScreen = document.querySelector("#read-practice-screen");
  const sourceChoice = document.querySelector("#read-source-choice");
  const setupStatus = document.querySelector("#read-setup-status");
  const setupMessage = document.querySelector("#read-setup-message");
  const learningOnlyToggle = document.querySelector("#read-learning-only-toggle");
  const startButton = document.querySelector("#read-start-button");
  const backButton = document.querySelector("#read-back-button");
  const wordDisplay = document.querySelector("#read-word");
  const form = document.querySelector("#read-form");
  const answerInput = document.querySelector("#read-answer");
  const checkButton = document.querySelector("#read-check-button");
  const feedback = document.querySelector("#read-feedback");
  const nextButton = document.querySelector("#read-next-button");
  const sessionStatus = document.querySelector("#read-session-status");

  const wordsBySource = {};
  const schedulers = {};
  let currentWord = null;
  let answered = false;
  let session = { correct: 0, total: 0 };
  let renderToken = 0;

  function activeSource() {
    return READ_SOURCES[preferences.getReadSource()];
  }

  async function getWords(source) {
    if (!wordsBySource[source.id]) {
      const lists = await Promise.all(
        source.scripts.map((scriptId) => loadScriptWords(SCRIPTS[scriptId]))
      );
      wordsBySource[source.id] = lists.flat();
    }
    return wordsBySource[source.id];
  }

  async function renderSetup() {
    const token = ++renderToken;
    const source = activeSource();
    const learningOnly = preferences.getLearningOnly();
    sourceChoice.querySelectorAll("input[name='read-source']").forEach((input) => {
      input.checked = input.value === source.id;
    });
    learningOnlyToggle.checked = learningOnly;
    startButton.disabled = true;
    setupStatus.textContent = "";

    let words;
    try {
      words = await getWords(source);
    } catch (error) {
      setupMessage.textContent = error.message;
      return;
    }
    if (token !== renderToken) return;

    const selection = combineSelections(storages, source);
    const count = countReadableWords(words, selection, learningOnly);
    setupStatus.textContent = strings.reading.matchingWords(count);
    startButton.disabled = count === 0;
    if (count > 0) {
      setupMessage.textContent = strings.reading.ready;
    } else if (learningOnly && !Object.values(selection).includes(CHARACTER_STATES.learning)) {
      setupMessage.textContent = strings.practiceMode.noLearningCharacters;
    } else {
      setupMessage.textContent = strings.reading.noWords(source.name);
    }
  }

  function showSetup() {
    setupScreen.hidden = false;
    practiceScreen.hidden = true;
    setModeTabsVisible(true);
    setHeader(strings.reading.setupTitle, strings.reading.setupIntro);
    renderSetup();
  }

  function hide() {
    setupScreen.hidden = true;
    practiceScreen.hidden = true;
  }

  function renderSessionStatus() {
    sessionStatus.textContent = strings.reading.sessionScore(session.correct, session.total);
  }

  function showWord() {
    const source = activeSource();
    currentWord = schedulers[source.id].next(combineSelections(storages, source), {
      learningOnly: preferences.getLearningOnly()
    });
    if (!currentWord) {
      showSetup();
      return;
    }
    answered = false;
    wordDisplay.textContent = currentWord.word;
    wordDisplay.lang = "ja";
    answerInput.value = "";
    answerInput.disabled = false;
    checkButton.hidden = false;
    nextButton.hidden = true;
    feedback.hidden = true;
    feedback.removeAttribute("data-result");
    renderSessionStatus();
    answerInput.focus();
  }

  async function startPractice() {
    const source = activeSource();
    try {
      const words = await getWords(source);
      schedulers[source.id] ??= createScheduler(words);
    } catch (error) {
      setupMessage.textContent = error.message;
      return;
    }
    session = { correct: 0, total: 0 };
    setupScreen.hidden = true;
    practiceScreen.hidden = false;
    setModeTabsVisible(false);
    setHeader(strings.reading.practiceTitle, strings.reading.practiceIntro);
    showWord();
  }

  function checkAnswer() {
    if (answered || !currentWord) return;
    const answer = answerInput.value.trim();
    if (!answer) {
      answerInput.focus();
      return;
    }
    answered = true;
    const correct = isCorrectReading(answer, currentWord.romaji);
    schedulers[activeSource().id].record(currentWord, correct);
    session.total += 1;
    if (correct) session.correct += 1;

    const heading = document.createElement("p");
    heading.className = "read-feedback-heading";
    heading.textContent = correct ? strings.reading.correct : strings.reading.incorrect;
    const reading = document.createElement("p");
    reading.textContent = strings.reading.answer(currentWord.romaji, currentWord.meaning);
    feedback.replaceChildren(heading, reading);
    if (!correct) {
      const yours = document.createElement("p");
      yours.className = "read-feedback-yours";
      yours.textContent = strings.reading.yourAnswer(answer);
      feedback.append(yours);
    }
    feedback.dataset.result = correct ? "correct" : "incorrect";
    feedback.hidden = false;
    answerInput.disabled = true;
    checkButton.hidden = true;
    nextButton.hidden = false;
    renderSessionStatus();
    nextButton.focus();
  }

  sourceChoice.addEventListener("change", (event) => {
    if (event.target.name !== "read-source") return;
    preferences.setReadSource(event.target.value);
    renderSetup();
  });

  learningOnlyToggle.addEventListener("change", () => {
    preferences.setLearningOnly(learningOnlyToggle.checked);
    renderSetup();
  });

  startButton.addEventListener("click", startPractice);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    checkAnswer();
  });

  nextButton.addEventListener("click", showWord);

  backButton.addEventListener("click", showSetup);

  return { showSetup, hide };
}
