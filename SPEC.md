# Japanese Writing Practice App — Project Spec

> This file is the source of truth for the project. Read it fully before writing any code. If something here is unclear or conflicts with what you find in the repo, ask me instead of guessing.

## 1. What we are building

A web app for practicing **handwriting Japanese characters**. The user chooses which characters they already know and which they want to learn. The app then shows a word made only from those characters, the user writes it by hand on a canvas, the app gives feedback on whether the characters are correct, and then moves on to the next word. This repeats for as long as the user wants, and words come back after a while so they are reviewed.

## 2. Scope

### Version 1 (the goal for now)
- Runs as a static web page. Opening the page lets me start writing on a canvas right away.
- **Hiragana only.**
- Character selection: choose which hiragana are *known* and which are *learning*.
- Word prompts built only from the selected characters.
- Feedback on each written character, then the next word.
- Words can reappear after a while.
- **No saving of user data between sessions** (state lives in memory only).

### Planned later (design for it now, don't build it yet)
- Saving progress per user, probably in the browser (see section 7).
- Katakana.
- Kanji (words may mix kanji and kana, so "known kanji" matters).
- Better review scheduling (spaced repetition).

### Non-goals
- Accounts, logins, or a backend server.
- Teaching pronunciation or grammar.
- Native mobile apps (but the web app must work well on phones and tablets).

## 3. Core user flow

1. **Setup screen:** the user sees the hiragana chart. Each character can be in one of three states: *not selected*, *known*, *learning*. Quick actions such as "select a whole row" help. The user must select at least a few characters before starting.
2. **Practice screen:**
   1. The app shows a prompt for a word. The prompt is NOT the Japanese word itself. It shows the English meaning and the romaji reading (each can be toggled off). Optional: a button to hear the word using the browser's speech synthesis in Japanese.
   2. The user writes the word on the canvas, one character at a time, in order.
   3. The user submits.
   4. **Feedback:** the app shows the correct word and marks each character as correct or incorrect.
   5. "Next" moves to another word.
3. This loops indefinitely. The user can return to the setup screen at any time to change the selection.

## 4. Word selection rules

- A word may only be offered if **every character in it** is in the user's selected set (known or learning).
- Prefer words that contain *learning* characters, so new characters get practiced more, while still mixing in known ones.
- Do not show the same word twice in a row.
- Words that were answered incorrectly come back sooner than words answered correctly. Correctly answered words may come back after a longer gap. For v1, a simple weighted-random or queue-based approach is fine. Put the scheduling logic in its own module so it can be replaced by proper spaced repetition later.
- If too few words match the selection, tell the user and suggest selecting more characters.

## 5. Word data

- Store words in a JSON file in the repo, not hardcoded in the code.
- Suggested shape (adjust if you have a good reason, and tell me):

```json
{
  "word": "さくら",
  "reading": "さくら",
  "romaji": "sakura",
  "meaning": "cherry blossom",
  "tags": ["nature"]
}
```

- Start with a few hundred simple, common hiragana-only words. Make sure the list is correct; flag any entry you are not sure about.
- Keep the format ready for katakana and kanji words later (a kanji word will need both its written form and its kana reading).
- Check the license of any word list or dataset you use and record it in the README.

## 6. Handwriting and feedback (the hard part)

The canvas must work with **mouse, touch, and stylus** (use Pointer Events, disable page scrolling while drawing on the canvas). Provide undo and clear.

Deciding whether a handwritten character is correct is the main technical risk of this project. **Do not start with this.** Build it in stages:

1. **Stage A — self-check:** after writing, the app reveals the correct word and the user marks each character as right or wrong themselves. This gives a complete working loop early.
2. **Stage B — automatic checking:** before implementing, research and **propose 2–3 approaches with trade-offs, then wait for my choice**. Requirements: runs fully in the browser (no paid services, no server), free to use, works for hiragana first, and can extend to katakana and kanji. Candidates to evaluate include:
   - comparing the user's strokes with stroke data from an open dataset such as KanjiVG (check that it covers kana, and check its license),
   - an image-recognition model running in the browser, trained on a handwritten-kana dataset such as KMNIST (check the license and that it covers all the hiragana I need),
   - template matching against a rendered font glyph (simple but less accurate).
   Be honest about expected accuracy. Handwriting varies a lot, so a "close enough" tolerance and a way to override a wrong judgement ("I was right") are needed.
3. Do not use unofficial or undocumented third-party recognition APIs.

Stroke order and stroke count are nice to check later but are **not** required for v1.

## 7. Data and persistence

- v1 keeps everything in memory.
- Put all reading and writing of user state (selected characters, per-word history) behind a small storage module with a clear interface, so persistence can be added without touching the rest of the code.
- When we add persistence, the likely choice is browser `localStorage` (or IndexedDB), because this is a static site with no server. Cookies are probably unnecessary. Please confirm this when we get there.
- Keep the state shape simple and serializable (plain JSON).

## 8. Tech stack and constraints

- **Static site only:** HTML, CSS, and JavaScript. Prefer plain JavaScript with ES modules and no build step, so the project can be opened directly and deployed anywhere. If you believe a framework or build tool is clearly worth it, explain why and ask first.
- Avoid dependencies. Every added dependency must be justified, and its license checked.
- No backend, no database, no API keys.
- Use relative paths so the site works when hosted in a repository subpath.
- **Hosting (nice to have, not required):** deploy to GitHub Pages. Include short instructions in the README. If a GitHub Actions workflow is needed, keep it minimal.
- Works in current Chrome, Firefox, Safari, and Edge, on desktop and mobile.
- Japanese text must render properly everywhere (specify a font stack with Japanese fallbacks).
- Keep all user-facing text in one place (for example `strings.js`) so a translation can be added later. UI language for now: English.

## 9. Suggested project structure

Adjust as needed and tell me when you do.

```
/
├── index.html
├── css/
├── js/
│   ├── main.js
│   ├── canvas.js        # drawing surface
│   ├── characters.js    # hiragana data (later: katakana, kanji)
│   ├── words.js         # loading and filtering words
│   ├── scheduler.js     # which word comes next
│   ├── storage.js       # persistence interface (in-memory for v1)
│   └── ui/
├── data/
│   └── words-hiragana.json
├── tests/
├── SPEC.md
└── README.md
```

## 10. Milestones

Work through these **in order, one at a time**. After each one, stop, tell me what changed and how to run it, and wait for my go-ahead.

1. **Skeleton:** the project structure, an `index.html` that opens in the browser, and a README with run instructions. Optionally the GitHub Pages deployment.
2. **Writing canvas:** the page opens and I can draw on it with mouse or touch. Clear and undo work.
3. **Hiragana and setup screen:** the full hiragana set as data, and the known / learning / not-selected selection UI.
4. **Word prompts with self-check (Stage A):** word list, word selection rules, prompt screen, reveal, self-marking, next word. This is the first complete usable loop.
5. **Automatic feedback (Stage B):** research, proposal, my approval, then implementation.
6. **Review logic:** words reappear based on past answers.
7. **Persistence:** save progress in the browser.
8. **Katakana.**
9. **Kanji.**

## 11. How to work

- Before coding a milestone, give me a short plan (what you will create or change) and mention any assumptions.
- Keep changes small and focused. Don't refactor unrelated code or add features that aren't in the current milestone.
- Write automated tests for the pure logic: word filtering, word selection, scheduling, storage. UI can be checked manually, but tell me what to check.
- Run the app and the tests yourself when possible and fix failures before reporting back.
- Keep the code simple and readable, with comments where the reasoning isn't obvious. I am learning, so explain non-obvious decisions briefly.
- Don't invent data. If you are unsure about a Japanese word, reading, or character, flag it for me to check instead of guessing.
- Commit after each working milestone with a clear message.
- If this spec is missing something you need to decide, ask.

## 12. Definition of done (for v1, milestones 1–5)

- Opening the page lets me select hiragana, then write words on the canvas.
- Every offered word uses only my selected characters.
- After submitting, I see which characters were right and which were wrong, then move to the next word.
- It works on desktop (mouse) and on a phone or tablet (touch).
- It is deployable as a static site, with instructions in the README.
- The core logic is covered by tests, and the README explains how to run everything.
