# East Hills PTY LTD — website

Two-page marketing site for East Hills PTY LTD: electrical and wiring, commercial refrigeration,
air conditioning, hot water systems, decking and floor lamination across Sydney.

Built with [Astro](https://astro.build) as a fully static site. No backend, no database, no forms —
enquiries go straight to the phone.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output into dist/
npm run preview  # serve the built site locally
npm run check    # TypeScript + Astro diagnostics
```

Requires Node 20.19+ (Astro 6). Verified on Node 22.17.

> **Heads up on the `astro` command.** This machine also has Astronomer's Airflow CLI installed via
> Homebrew, which is *also* called `astro`. Running `astro …` in a terminal hits that one, not this
> web framework — `astro dev init` will scaffold an Airflow project into your folder. Always use the
> `npm run …` scripts above, which resolve to the local `node_modules/.bin/astro`.

---

## Before it goes live

Two things are legally and commercially important, and both are currently placeholders in
`src/data/site.ts`:

1. **NSW electrical contractor licence number** — set `licence.number`. NSW Fair Trading requires
   licensed electricians to display their licence number on advertising, and every competitor
   displays theirs prominently. Until it is set, the site says "Fully licensed & insured" and avoids
   claiming a number it does not have; once set, the number appears automatically in the trust strip,
   the FAQ answer, the footer and the contact page.
2. **ARCtick refrigerant handling licence** — set `arctick.number`. Required for the air conditioning
   and refrigeration refrigerant work.

Also worth confirming or supplying:

- **Trading hours** (`hours`) — currently assumed Mon–Fri 7am–5pm, Sat 8am–2pm, Sun closed.
- **Service area** (`serviceArea`) — currently Sydney plus greater Sydney metro.
- **After-hours / emergency policy** (`emergencyNote`).
- **Domain** — on GitHub Pages this is resolved automatically (see Deploying). For any other host,
  set the fallback `site` in `astro.config.mjs`; it drives canonical URLs, Open Graph tags, the
  sitemap and `robots.txt`, all of which are generated.
- **Google Business Profile** — every competitor leads with a star rating (4.9 from 247 reviews,
  4.7 from 140 reviews). Creating one and gathering reviews is probably the single highest-value
  marketing step after launch.
- **Real job photos** — the design is deliberately typographic and needs no photography, but real
  photos of finished work would strengthen the services section.
- **Logo** — none was supplied, so the brand is a typographic wordmark that works standalone.

One scoping assumption: the brief listed "3 Months Warranty, Pick Up & Delivery" globally, but
pick-up and delivery only makes sense for bench-repairable items. The copy scopes it to *appliance
repairs* and applies the three-month warranty to workmanship across all trades. Adjust the FAQ and
`promises` in `src/data/services.ts` if it is broader than that.

---

## Editing content

Almost all copy lives in two files, so no component edits are needed for routine changes:

| File | Contains |
| --- | --- |
| `src/data/site.ts` | Business name, ABN, phone numbers, email, address, hours, service area, licences |
| `src/data/services.ts` | The six services (name, tagline, body, job list), trust pillars, process steps, promises |

Phone numbers, the address and the ABN are referenced from `site.ts` everywhere they appear —
including the `LocalBusiness` structured data — so changing a number in that one file updates the
nav, hero, contact page, footer and schema together.

FAQ questions and answers live in `src/components/FAQ.astro`, alongside the `FAQPage` structured data
generated from them.

---

## Structure

```
src/
├── data/            site.ts, services.ts  ← edit content here
├── layouts/         BaseLayout.astro      ← <head>, SEO, JSON-LD, nav + footer
├── components/      Nav, Hero, TrustStrip, About, Services, ServiceCard,
│                    Process, FAQ, CallToAction, Footer, Workshop3D
├── scripts/         workshop.ts (3D), reveal.ts (scroll animations)
├── pages/           index.astro, contact.astro
└── styles/          global.css            ← design tokens
```

### Design system

Defined as custom properties at the top of `src/styles/global.css`.

| Token | Value | Notes |
| --- | --- | --- |
| `--ink` | `#0b0b0a` | Text and dark sections |
| `--paper` | `#fafaf8` | Page background |
| `--copper` | `#b4530a` | Accent — reads as copper wiring, and deliberately avoids the fire-engine red every competitor uses |
| `--steel` / `--steel-mid` / `--steel-light` | greys | `--steel` on paper; `--steel-mid` and `--steel-light` on ink |

Type is Archivo (display) and Inter (body), self-hosted via `@fontsource-variable` so there is no
Google Fonts request. Every colour pairing in use meets WCAG AA; `--steel-mid` exists specifically
because `--steel` only reaches 3.7:1 on ink.

### The 3D centrepiece

`src/scripts/workshop.ts` builds six objects — display fridge, split-system head unit, hot water
cylinder, switchboard, deck section and laminate build-up — procedurally from Three.js primitives.
There are **no model files, textures or HDR maps**: lighting comes from a generated `RoomEnvironment`
and the blueprint outlines from `EdgesGeometry`.

Guardrails, all verified:

- Three.js (525 KB) is dynamically imported, and only after `load` plus an idle callback, so it never
  competes with first paint. It is a separate chunk the initial HTML does not reference.
- Models are built on first use, not all six up front — building them all at boot cost ~200ms of
  blocking time for objects most visitors never look at.
- 3D is skipped entirely — leaving the inline SVG poster in place — on `prefers-reduced-motion`,
  when WebGL is unavailable, on `saveData` connections, and on devices reporting ≤2 cores. When
  skipped, the Three.js chunk is never downloaded at all.
- Device pixel ratio is capped at 2, and the render loop pauses when the canvas scrolls offscreen or
  the tab is hidden.
- The canvas is `aria-hidden`; all real content is in the DOM. The page is complete and good-looking
  with no 3D at all.
- `touch-action: pan-y` means horizontal drags spin the model while vertical gestures still scroll
  the page on touch devices.

Adding a service means adding an entry to `services.ts` and a builder function in `workshop.ts` keyed
by the same `model` value.

---

## Deploying

The build is plain static files in `dist/`, so any static host works.

### GitHub Pages (configured)

`.github/workflows/deploy.yml` builds and publishes on every push to `main`, and can be re-run
manually from the Actions tab. **One-time setup:** in the repo, go to
**Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**. Nothing else to
configure — no `gh-pages` branch, no deploy keys.

The site will be published at **https://tisheliosa.github.io/east-hills/**.

The workflow needs no URL hardcoded. `actions/configure-pages` resolves the origin and base path at
build time and passes them through as `SITE_URL` / `BASE_PATH`, which `astro.config.mjs` reads. That
means the same workflow keeps working if the repo is renamed, moved to a user page, or pointed at a
custom domain.

Because a project page is served from `/east-hills/` rather than a domain root, every internal link
and asset URL goes through `withBase()` in `src/lib/url.ts`. **If you add a link or asset, use that
helper** — a hardcoded `/contact` or `/logo.svg` works locally and 404s on Pages:

```astro
---
import { withBase } from '../lib/url';
---
<a href={withBase('contact')}>Contact</a>
<img src={withBase('logo.svg')} alt="" />
```

`public/.nojekyll` is required and already present: without it GitHub Pages' Jekyll step strips the
`_astro/` directory, which is where all the CSS, JS and fonts live.

### Custom domain

Add a `public/CNAME` file containing just the domain (e.g. `easthills.com.au`), point the DNS at
GitHub Pages, and set it under Settings → Pages. `configure-pages` then reports the custom domain
with an empty base path, so links flatten back to `/contact` automatically — no code change.

### Other hosts

**Netlify or Cloudflare Pages:** connect the repo, build command `npm run build`, publish directory
`dist`. Or drag the `dist` folder into the Netlify dashboard for a one-off deploy. These serve from a
domain root, so the default `base` of `/` applies; set the real domain as the fallback `site` in
`astro.config.mjs`.

---

## Verified

Against the production build (`npm run preview`), on desktop and at 375px mobile:

- Lighthouse mobile — home **95** performance / **100** accessibility / **100** best practices /
  **100** SEO; contact **100** across all four. CLS 0.
- `npm run build` and `npm run check` both clean: 0 errors, 0 warnings, 0 hints.
- Three.js chunk absent from initial HTML, requested once, after paint.
- Fallbacks confirmed with WebGL disabled and with `prefers-reduced-motion: reduce`: poster stays,
  model picker hides, no console errors, all content visible.
- With JavaScript disabled entirely: hero, all six service cards and all nine FAQ items render, and
  the FAQ still opens and closes (native `<details>`).
- All mobile tap targets ≥44px; no horizontal overflow.
- `Electrician` and `FAQPage` JSON-LD both parse, and carry both phone numbers and all six services.

### Known advisories

`npm audit` reports three issues that need a breaking major bump to clear, all confined to the build
toolchain and none shipped to visitors:

- `esbuild` — dev-server file read, Windows only. Does not affect a static build.
- `sharp` / libvips — build-time image processing. The site processes no untrusted images.

A static site ships only HTML, CSS and JS, so there is no server-side exposure.
