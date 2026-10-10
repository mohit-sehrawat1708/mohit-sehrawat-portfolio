# Mohit Sehrawat: portfolio

A one-page portfolio: hero with real screen recordings, about, three projects, toolkit, experience, hackathons and contact.
It is plain HTML, CSS and JavaScript with no build step and nothing to install. It is hosted on Vercel:
https://mybasicportfolio.vercel.app

```
index.html                       all page content
css/style.css                    all styles (light + dark theme)
js/main.js                       motion, theme toggle, menu, hero tabs
js/404-theme.js                  lets the 404 page use the light/dark mode chosen on the portfolio
assets/Mohit_Sehrawat_Resume.pdf every résumé link points here (also /resume and /cv)
assets/og-image.png              link-preview image (1200×630)
assets/gifs/                     recordings, illustrations and their poster frames
assets/fonts/                    the three fonts, served from this site (see "Credits")
404.html                         the "404 lost" page Vercel shows for any missing address
favicon.svg, favicon.ico         browser-tab icon (the .ico is the fallback for old browsers)
apple-touch-icon.png             iPhone / iPad home-screen icon (180×180)
icon-192.png, icon-512.png,      Android home-screen icons, listed in site.webmanifest
icon-maskable-512.png
site.webmanifest                 name, colours and icons for "Add to Home screen"
robots.txt, sitemap.xml          for search engines
vercel.json                      Vercel settings: clean URLs, /resume link, caching, security headers
.vercelignore                    files that are in the repo but not part of the website
```

The page has a light/dark mode toggle. It respects "reduce motion" (no pinning or scroll animation). It also works without JavaScript.

## Run it locally

- **Quickest:** open `index.html` in a browser (double-click it). The console then shows one red error about
  `site.webmanifest` being blocked by CORS. That is harmless and only happens when the page is opened from disk; the local
  server below avoids it.
- **Local server** (closer to how it runs when deployed), from this folder:

  ```
  python -m http.server 8000
  ```

  Then open http://localhost:8000.

Either way you need an internet connection for the animations: GSAP, Lenis and Matter.js come from the jsDelivr CDN. The fonts are
in `assets/fonts/`. Without the internet the page still shows all its content, just without motion.
A local server does not apply `vercel.json` (headers, `/resume`, clean URLs, the 404 page). To check those exactly, push a branch
and open its Vercel preview (see below).

## Deploy (Vercel, from GitHub)

The code lives in the GitHub repo **mohit-sehrawat1708/mohit-sehrawat-portfolio**, with `index.html` at the repo root, on the
`main` branch. Vercel serves the files as they are: there is no build command and no output directory.

### First deploy (once)

1. Go to https://vercel.com/new and sign in with GitHub.
   Shortcut: https://vercel.com/new/import?s=https://github.com/mohit-sehrawat1708/mohit-sehrawat-portfolio opens step 3 directly.
2. Under **Import Git Repository**, find **mohit-sehrawat-portfolio** and click **Import**.
   If it is not in the list, use the "Adjust GitHub App Permissions" link there and give Vercel access to that repo.
3. On the configure screen:
   - **Project Name:** `mybasicportfolio` (this gives the address https://mybasicportfolio.vercel.app)
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (leave it as it is)
   - **Build and Output Settings:** leave every field empty and every override switched off
   - **Environment Variables:** none
4. Click **Deploy**. After about half a minute Vercel shows the finished site. Click through to the project dashboard: the
   **Domains** list shows the live address.
5. Check that the address under **Domains** is exactly `mybasicportfolio.vercel.app`. If Vercel gave the project a
   different one (for example with a suffix), the site still works, but the link previews and search-engine data point at the
   wrong address until you follow "If the address is taken" below.
6. Optional checks from a terminal (each line prints the response headers):
   ```
   curl -sI https://mybasicportfolio.vercel.app/                 # 200, content-security-policy, strict-transport-security
   curl -sI https://mybasicportfolio.vercel.app/site.webmanifest # 200
   curl -sI https://mybasicportfolio.vercel.app/no/such/page     # 404 (the "404 lost" page)
   curl -sI https://mybasicportfolio.vercel.app/resume           # 307 to the résumé PDF
   ```
   Then run https://pagespeed.web.dev on the address for real-world speed scores.

**Before every push, commit every file.** New files are not included by `git commit -a`. Use `git add -A` and then
`git commit`, and check that `git status` shows nothing left over. A file that never reaches GitHub is missing on the live
site (for example the icons, `404.html` or a font).

Do not add a folder called `public` to the repo: with the "Other" preset Vercel would publish only that folder.

### After that, every push deploys

- A push to `main` updates the live site within a minute.
- A push to any other branch (or a pull request) gets its own preview address and leaves the live site alone.
- To undo a bad deploy: on the project overview, click **Instant Rollback** on the Production Deployment tile. On the free
  Hobby plan this only goes back to the deployment just before the current one.
- **After a rollback, new pushes do not go live** until you click **Undo Rollback** on that same tile. (Vercel stops
  assigning the address to new deployments while a rollback is in place.) Often the simplest way to undo a bad change is to
  fix it and push, without rolling back at all.

### If the address is taken, or you rename the project

If `mybasicportfolio.vercel.app` belongs to someone else, Vercel gives the project a different address (shown under
**Domains** on the project page). You can also add another free `something.vercel.app` address in **Settings → Domains**.
Renaming the project (**Settings → General → Project Name**) does not change addresses that already exist.

Once you know the final address, replace `https://mybasicportfolio.vercel.app` everywhere it appears (search the folder
for `mybasicportfolio.vercel.app`), then push:

| File | Line | What it is |
|---|---|---|
| `index.html` | 12 | the comment that lists these places (keep it accurate) |
| `index.html` | 14 | `<link rel="canonical">` |
| `index.html` | 19 | `og:url` |
| `index.html` | 22 | `og:image` (keep `/assets/og-image.png` at the end) |
| `index.html` | 29 | `twitter:image` (same) |
| `index.html` | 42 | `"url"` in the JSON-LD block (search-engine data) |
| `robots.txt` | 4 | `Sitemap:` line |
| `sitemap.xml` | 4 | `<loc>` |

Also update the address at the top of this README.

### Your own domain (optional)

1. Buy a domain from any registrar.
2. In Vercel: project → **Settings → Domains** → **Add** → type the domain (for example `mohitsehrawat.com`) → **Add**.
   If Vercel offers to add the `www.` version too and redirect one to the other, accept it.
3. Vercel shows the DNS records to create. Add exactly those at your registrar (DNS settings). When the domain shows
   **Valid Configuration**, HTTPS is set up automatically.
4. Replace the site address in the files listed in the table above with the new domain, and push.

The `.vercel.app` address keeps working.

### Short résumé link

`/resume` and `/cv` redirect to the résumé PDF, for example https://mybasicportfolio.vercel.app/resume.
Use it on LinkedIn, in emails or on the printed CV. The target is set in `vercel.json` under `"redirects"`. The redirect is
temporary (307), so you can point it at a different file later without browsers remembering the old one.

### What `vercel.json` and `.vercelignore` do

- **Clean URLs:** `/index.html` redirects to `/`, and trailing slashes are removed (`/resume/` becomes `/resume`).
- **Caching:** HTML, `css/`, `js/` and the résumé PDF are checked with the server on every visit (a quick "not modified"
  answer when nothing changed), so an edit to them shows up at once. Images and recordings in `assets/` are cached for 7 days
  (and may be used for one more day while the browser re-checks), so after you replace one with a file of the same name, a
  returning visitor can see the old one for up to 8 days. To force the new file at once, give it a new name and update its
  references. Fonts in `assets/fonts/` are cached for a year: if you ever change a font, give the file a new name.
- **Security headers:** a Content-Security-Policy (next section), plus headers that stop other sites from framing the page,
  stop browsers from guessing file types, trim the referrer sent to other sites, and switch off camera, microphone, location
  and similar browser features the site never uses.
- **404 page:** `404.html` is shown, with status 404, for any address that does not exist. Its links start with `/` because it
  can appear at any depth.
- **`.vercelignore`:** keeps `_react-backup/`, `.zip` files, `README.md` and `.nojekyll` out of the website.
- **Directory listing:** in Vercel's project settings, keep **Settings → Advanced → Directory Listing** switched off (the
  default), so an address such as `/assets/` shows the 404 page instead of a file list.
- **Upper and lower case matter on Vercel** (Windows does not care, Vercel does). A file saved as `Me.JPG` is not found by a link
  to `me.jpg`. Keep file names exactly as they are written in `index.html`.

### Content-Security-Policy: read this before editing scripts

`vercel.json` sends a Content-Security-Policy (CSP). It tells browsers to run only scripts from this site and from three exact
folders on jsDelivr (`npm/gsap@3.15.0/dist/`, `npm/lenis@1.3.26/dist/`, `npm/matter-js@0.20.0/build/`), plus the one small inline
`<script>` in the `<head>` of `index.html` (lines 56–68, the "pre-paint" theme/intro script). That inline script is allowed by its
fingerprint, the `'sha256-…'` value in the `script-src` part of the CSP. Styles and fonts may only come from this site.

- **If you change the inline script** (even one space), browsers block it until the fingerprint is updated. The page still works,
  but it ignores the visitor's saved light/dark choice on load and skips the intro and entrance animations. To fix it: open the
  deployed page, open DevTools → **Console**, and find the
  red message "Executing inline script violates the following Content Security Policy directive…". It names the new value, for
  example `'sha256-AbC…='`. Put that value into `vercel.json` in place of the old `'sha256-…'`, then push.
- **Do not add inline event handlers** (`onclick="…"`, `onerror="…"`) or new inline `<script>` blocks: the CSP blocks them. Put
  the code in `js/main.js` instead (the optional photo uses `data-optional` for this reason). The JSON-LD block
  (`<script type="application/ld+json">`) is data, never runs, and needs no fingerprint.
- **Loading something from another site** (a new CDN, an analytics script, an embed) needs its address added to the matching
  part of the CSP (`script-src`, `style-src`, `img-src`, `connect-src`, `frame-src`).
- **Library versions are locked** twice. Every jsDelivr `<script>` in `index.html` has an `integrity="sha384-…"` value
  (Subresource Integrity), and the browser refuses a file that does not match it. The CSP also names each library's folder with
  its version. **If you change a version number, change three things:** the URL in `index.html`, its `integrity` value, and the
  matching folder in the CSP in `vercel.json` (for example `https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/`). jsDelivr's package
  page has a "Copy HTML + SRI" option for each file, or run
  `curl -s <file URL> | openssl dgst -sha384 -binary | openssl base64 -A` and put `sha384-` in front of the result.
- **Fonts** are files in `assets/fonts/`, declared at the top of `css/style.css` (and again in `404.html`). Loading a font from
  Google Fonts or another site would need its addresses added to `style-src` and `font-src`.
- **Preview deployments only:** Vercel's comment toolbar, which it adds to preview addresses, is blocked by the CSP and logs
  errors there. The live site does not have the toolbar. You can switch the toolbar off in the project settings if the messages
  bother you.

### Check the link preview

Paste the address into https://www.linkedin.com/post-inspector/ (or any chat app) to see the card with `assets/og-image.png`.

### Other hosts

Netlify or GitHub Pages can also serve the folder, but they ignore `vercel.json`: no security headers, no `/resume` link and no
clean URLs. The canonical link would also still point at the Vercel address.

## Editing content

All text is in `index.html`. Each section starts with a banner comment such as `<!-- ==================== WORK ==================== -->`, so you can search for those if the line numbers drift.

| Section | Lines in `index.html` | Notes |
|---|---|---|
| Page title, description, link-preview text | 6–7, 20–21, 27–28 | Lines 20–21 are for most sites (Open Graph), 27–28 for X/Twitter. Keep them the same. The JSON-LD block (lines 37–52) has a longer description. |
| Hero (headline, recordings, caption, buttons) | 127–177 | The recording tabs' link, label and screen-reader text are also set in `js/main.js` lines 80–85. Change both. |
| Print-only "30-second version" | 179–190 | This copies the menu's 30-second version, so keep the two in sync. |
| Status strip (scrolling ticker) | 192–214 | The phrases appear twice (the second copy makes the loop seamless). Edit both. |
| About (statement, 4 facts, résumé link) | 216–231 | The 300 and 40 count up from `data-count="…"` (lines 225–226). Each also has hidden screen-reader text next to it. Change both. |
| Work (index rows + 3 project cards) | 233–357 | |
| Toolkit (draggable pills + full skills list) | 359–394 | |
| Experience (TPO, Rational Go, education) | 396–453 | |
| Hackathons (intro + clock, 5 passes, LinkedIn line) | 455–503 | The passes are lines 475–496. |
| On the side | 505–527 | |
| Contact + footer | 531–572 | |
| Menu + "30-second version" | 574–602 | |

- **Email:** the address appears in several places (including the JSON-LD block). Search for `m29247396@gmail.com` and replace every match.
- **Résumé:** replace `assets/Mohit_Sehrawat_Resume.pdf` with a new file of **exactly the same name** (same capitals), and every link and `/resume` update.

## Add a photo (optional)

1. Save a square photo, at least 400 px, as `assets/me.jpg` (all lower case: `Me.jpg` or `me.JPG` would not be found on Vercel).
2. In `index.html`, find the `OPTIONAL PHOTO` comment (lines 163–165, inside the hero caption). Line 166 is the photo itself,
   switched off:
   `<!-- <img class="me" src="assets/me.jpg" alt="" width="96" height="96" data-optional> -->`.
   On that line, remove only the `<!-- ` at the start and the ` -->` at the end. Keep the `<img>` tag itself, including
   `data-optional`. You can delete the three instruction lines (163–165) or leave them.

The photo shows as a 96 px greyscale circle just above the hero caption. If the file is missing, `js/main.js` removes the tag (an inline `onerror` would be blocked by the CSP).

## When AccessLens has a live URL again

For now the site links AccessLens only to its code, because the old deployment is gone. Every place to change has the comment `<!-- When AccessLens is redeployed, add its live URL here -->`:

- `index.html` **line 142**, the hero "Code" pill: set the live URL as `href`, remove the `is-code` class, change `Code` to
  `Live`, and update the hidden `data-live-sr2` text at the end of the line.
- **Lines 146–147**, the hero screen link: set the live URL as `href`, use `data-cursor="OPEN ↗"`, and update the hidden
  `data-live-sr` text on line 147.
- The hero tabs rewrite both of these on every tab switch, so also edit the first entry in `js/main.js` **line 81** the same
  way: the URL as `href`, `cursor:'OPEN ↗'`, `live:'Live'`, `code:false`, and the two `sr` texts. (Until the first tab
  switch the page shows what `index.html` says, so both places must agree.)
- Keep the alt texts (lines 150 and 315), the address bar label `localhost:3000 · accesslens` (line 312) and the caption
  "Real screen recording · local build" (line 318) for as long as the recording is the local build.
- **Line 247:** work index row 02. Add a "Live" link like the one on row 01 (line 243).
- **Line 304:** card 02 buttons. Make "Open live" the first button and keep "Code" second, like card 01 (lines 271–272).
- **Line 310:** card 02 recording link (also its `data-cursor` and `aria-label`; the label must start with the words shown on
  the card, "localhost:3000 · accesslens Real screen recording · local build", so voice-control users can say them).
- **Line 554:** footer project list.
- Optionally change the card 02 chip on line 293 from "Open source" to "Live".

If the live AccessLens is on a different site, nothing in the CSP needs to change: links to other sites are always allowed.

## Readme-Architect AI: check the wording

Line 257 has the comment `<!-- Role on this project: confirm wording with Mohit (repo is a fork of Deepender25/Readme-Architect-AI) -->`.

Card 01 (lines 258–289) and index row 01 describe the product and its stack. They say nothing about who built which part, because the GitHub repo is a fork. Once you're happy with how the card describes your role, delete the comment.

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
Browsers may keep an old copy of a replaced file for up to 8 days (see "Caching" above).

## Credits

Built with HTML, CSS and JavaScript. Libraries are loaded from jsDelivr at fixed versions, each locked with an `integrity` hash:

- [GSAP](https://gsap.com) 3.15 (ScrollTrigger, SplitText, ScrambleText)
- [Lenis](https://lenis.darkroom.engineering) 1.3 (smooth scrolling)
- [Matter.js](https://brm.io/matter-js/) 0.20 (the toolkit pills)

Fonts: Schibsted Grotesk, Newsreader (italic) and JetBrains Mono, all under the SIL Open Font License 1.1, from
[Google Fonts](https://fonts.google.com). They are served from `assets/fonts/` (Latin and Latin Extended subsets) instead of
Google's servers, so the first paint does not wait for another site. Newsreader is fixed at its display optical size (72)
and weights 300–400, the only ones the site uses, which makes its file less than a third of the original size.
