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

## Deploy to GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root to
GitHub Pages when changes are pushed to the default branch.

In the repository settings, set **Pages > Build and deployment > Source** to
**GitHub Actions**. The deployed site uses relative paths so it also works
when hosted under a repository subpath.

## Project status

Milestone 2 is complete: the page includes a responsive writing canvas that
supports mouse, touch, and stylus input. Use **Undo** to remove the most recent
stroke and **Clear** to remove all strokes. The canvas is intentionally a
standalone module so it can be connected to character prompts later.
