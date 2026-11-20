# Japanese Writing Practice

A static web app for practicing handwritten Japanese characters. The first
version focuses on hiragana and keeps user state in memory.

## Run locally

No build step or dependency installation is required. Serve the project from
the repository root with any static file server, then open the displayed URL.

For example, if Python is installed:

```text
python -m http.server 8000
```

Open <http://localhost:8000/> in a browser.

Opening `index.html` directly may work for the initial skeleton, but serving
the project over HTTP is recommended as the app grows and uses JavaScript
modules.

Run the automated tests with Node.js:

```text
node --test
```

## Deploy to GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root to
GitHub Pages when changes are pushed to the default branch.

In the repository settings, set **Pages > Build and deployment > Source** to
**GitHub Actions**. The deployed site uses relative paths so it also works
when hosted under a repository subpath.

## Project status

Milestone 4 is complete: select hiragana, then practice matching words by
writing the complete word in one adaptive canvas. Its width is one character
unit and its height is multiplied by the number of characters in the word. The
writing area alternates white and very light gray character-sized squares as a
guide. The prompt shows English
meaning and romaji, while the Japanese word remains hidden until submission.
Mark each revealed character right or wrong yourself, then continue to the next
word. Words that include learning characters are prioritized, and incorrect
words return sooner.

The starter word list is in `data/words-hiragana.json`. It is a small,
hand-curated list for this milestone; entries are intended to be common
hiragana-only vocabulary and should be expanded and reviewed before a final
release. No external dataset is used, so there is no third-party word-list
license to record.
