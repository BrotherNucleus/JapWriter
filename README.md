# Japanese Writing Practice

A static web app for practicing handwritten Japanese characters. The first
version covers hiragana and katakana. Character selections are saved in the browser
using `localStorage`; word review history remains in memory.

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
words return sooner. A word is kept out of the next two selections; incorrect
unseen words receive the highest review weight, followed by incorrect words;
correct words receive a lower weight. Words containing only known characters
remain eligible with a lower weight than words containing learning characters.

The word list is in `data/words-hiragana.json`. It currently contains over 200
hand-curated entries intended to be common hiragana-only vocabulary. The list
should still be reviewed and expanded before a final release. Because を is
only used as a particle, it is practised through short phrases tagged
`phrase`, such as ほんをよむ (*hon wo yomu*, "read a book"); their romaji
writes を as *wo* to tell it apart from お. For the same reason ぢ and づ are
written *di* and *du* (はなぢ is *hanadi*) so they are not confused with じ and
ず. Every hiragana character appears in at least three words, and a test
checks this.

The **Katakana** tab works the same way with its own selection, word list
(`data/words-katakana.json`, common loanwords) and review history. Small kana
are left out of both tabs; the katakana tab adds the long vowel mark ー as a
selectable character, and romaji writes it by doubling the vowel (コーヒー is
*koohii*). Every katakana character appears in at least three words except
ヲ, ヂ and ヅ, which can be selected but are not used in katakana words.

No external dataset is used for either word list, so there is no third-party
word-list license to record.

Selected known and learning characters are restored automatically when the app
is reopened in the same browser. Clearing that browser's site data resets the
selection.

Use **Download selection** to save the character states as a JSON file and
**Upload selection** to restore that file on another device or browser. Upload
files are validated before they replace the current selection. Each tab saves
and uploads its own selection file; a katakana file is rejected on the
Hiragana tab and vice versa.
