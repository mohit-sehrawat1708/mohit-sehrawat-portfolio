# Mohit Sehrawat: portfolio

A one-page portfolio: hero with real screen recordings, about, three projects, toolkit, experience, hackathons and contact.
It is plain HTML, CSS and JavaScript with no build step and nothing to install.

```
index.html                       all page content
css/style.css                    all styles (light + dark theme)
js/main.js                       motion, theme toggle, menu, hero tabs
assets/Mohit_Sehrawat_Resume.pdf every résumé link points here
assets/og-image.png              link-preview image (1200×630)
assets/gifs/                     recordings, illustrations and their poster frames
favicon.svg
```

The page has a light/dark mode toggle. It respects "reduce motion" (no pinning or scroll animation). It also works without JavaScript.

## Run it locally

- **Quickest:** open `index.html` in a browser (double-click it).
- **Local server** (closer to how it runs when deployed), from this folder:

  ```
  python -m http.server 8000
  ```

  Then open http://localhost:8000.

Either way you need an internet connection. Fonts come from Google Fonts, and GSAP, Lenis and Matter.js come from the jsDelivr CDN.

## Deploy

Upload the folder as it is, with `index.html` at the site root. There is no build command and no output directory.

- **Vercel:** inside this folder, run `npx vercel` (or `vercel` if the CLI is installed) and accept the defaults. Run `vercel --prod` to publish to production. You can also push the folder to a GitHub repo and import it at vercel.com/new (framework preset "Other").
- **Netlify:** drag the folder onto https://app.netlify.com/drop.
- **GitHub Pages:** push the folder's contents to a repo with `index.html` at the repo root. Then go to Settings → Pages → "Deploy from a branch" and pick `main` / `(root)`. All paths are relative, so it also works at `https://<user>.github.io/<repo>/`.

### After deploying: fix the link preview

Social sites ignore relative URLs, so set these once you know the address:

- `index.html` **line 16**: change `content="assets/og-image.png"` to the full URL, e.g. `https://your-domain/assets/og-image.png`.
- `index.html` **line 17**: remove the `<!--` and `-->` around the `og:url` tag and put the site's address in it.

To check the result, paste the URL into https://www.linkedin.com/post-inspector/.

## Editing content

All text is in `index.html`. Each section starts with a banner comment such as `<!-- ==================== WORK ==================== -->`, so you can search for those if the line numbers drift.

| Section | Lines in `index.html` | Notes |
|---|---|---|
| Page title, description, link-preview text | 6–7, 14–15 | |
| Hero (headline, recordings, caption, buttons) | 95–142 | The recording tabs' link, label and screen-reader text are also set in `js/main.js` lines 80–85. Change both. |
| Print-only "30-second version" | 144–155 | This copies the menu's 30-second version, so keep the two in sync. |
| Status strip (scrolling ticker) | 157–179 | The phrases appear twice (the second copy makes the loop seamless). Edit both. |
| About (statement, 4 facts, résumé link) | 181–196 | The 300 and 40 count up from `data-count="…"` (lines 190–191). Each also has hidden screen-reader text next to it. Change both. |
| Work (index rows + 3 project cards) | 198–322 | |
| Toolkit (draggable pills + full skills list) | 324–359 | |
| Experience (TPO, Rational Go, education) | 361–418 | |
| Hackathons (intro + clock, 5 passes, LinkedIn line) | 420–468 | The passes are lines 440–461. |
| On the side | 470–492 | |
| Contact + footer | 496–537 | |
| Menu + "30-second version" | 539–567 | |

- **Email:** the address appears in several places. Search for `m29247396@gmail.com` and replace every match.
- **Résumé:** replace `assets/Mohit_Sehrawat_Resume.pdf` with a new file of the **same name**, and every link updates.

## Add a photo (optional)

1. Save a square photo, at least 400 px, as `assets/me.jpg`.
2. In `index.html`, find the `OPTIONAL PHOTO` comment (lines 130–132, inside the hero caption). Delete the `<!--` at the start of line 130 and the ` -->` after the `<img …>` tag on line 132. Also delete the two instruction lines. Keep the `<img>` tag itself.

The photo shows as a 96 px greyscale circle just above the hero caption. If the file is missing, the tag removes itself.

## When AccessLens has a live URL again

For now the site links AccessLens only to its code, because the old deployment is gone. Every place to change has the comment `<!-- When AccessLens is redeployed, add its live URL here -->`:

- `index.html` **line 109** (hero "Code" pill) and **line 113** (hero screen link). The hero tabs rewrite these on every tab switch, so also edit the first entry in `js/main.js` **line 81**. Set the URL as `href`, use `cursor:'OPEN ↗'` and `live:'Live'`, change `code:true` to `code:false`, and update the two `sr` texts.
- **Line 212:** work index row 02. Add a "Live" link like the one on row 01 (line 208).
- **Line 269:** card 02 buttons. Make "Open live" the first button and keep "Code" second, like card 01 (lines 236–237).
- **Line 274:** card 02 recording link (also its `data-cursor` and `aria-label`).
- **Line 519:** footer project list.
- Optionally change the card 02 chip on line 258 from "Open source" to "Live".

## Readme-Architect AI: check the wording

Line 222 has the comment `<!-- Role on this project: confirm wording with Mohit (repo is a fork of Deepender25/Readme-Architect-AI) -->`.

Card 01 (lines 223–254) and index row 01 describe the product and its stack. They say nothing about who built which part, because the GitHub repo is a fork. Once you're happy with how the card describes your role, delete the comment.

## Recordings and animations (`assets/gifs/`)

Each animation has three files:

- `.webp`: what modern browsers play
- `.gif`: the fallback
- `-poster.jpg` or `-poster.png`: the still frame shown before it plays, when paused, when it's off-screen, or with reduced motion

| Files | Where | What it is |
|---|---|---|
| `accesslens.*` | Hero tab 1, card 02 | Real screen recording of AccessLens running locally (960×600) |
| `readme-architect-720.webp`, `readme-architect.gif`, `readme-architect-poster.jpg` | Hero tab 2, card 01 | Real screen recording of the live site (WebP 720×450, GIF 864×540, poster 960×600) |
| `attendance-phone.*` | Card 03 | Illustration of the AI-Attendance flow, not a recording (360×760) |
| `terminal-pipeline.*` | Experience, TPO card | Illustration of the data pipeline (640×400) |
| `hackathon-clock.*` | Hackathons | Decorative countdown clock (480×480) |
| `pill-gemini.*`, `pill-pipeline.*`, `pill-a11y.*` | About statement | Small inline pills (240×104) |

The capture scripts are not part of this folder. To re-record, ask Claude, or swap in your own files with the same names and sizes.
## Credits

Built with HTML, CSS and JavaScript. Libraries are loaded from jsDelivr at fixed versions:

- [GSAP](https://gsap.com) 3.15 (ScrollTrigger, SplitText, ScrambleText)
- [Lenis](https://lenis.darkroom.engineering) 1.3 (smooth scrolling)
- [Matter.js](https://brm.io/matter-js/) 0.20 (the toolkit pills)

Fonts are from [Google Fonts](https://fonts.google.com): Schibsted Grotesk, Newsreader and JetBrains Mono.
