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

Milestone 3 is complete: the setup screen includes the modern hiragana set,
including voiced, semi-voiced, and small kana. Click a character to cycle
between not selected, known, and learning. Row actions can set or clear a
whole row. Selection is held in memory through a storage interface and is
ready to be connected to practice prompts in the next milestone.
