# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local Development

No build tools or package managers. Run a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Architecture

Static single-page application with hash-based routing. No frameworks, no build step.

**Request flow:**
1. All navigation lands on `index.html`
2. `script.js` reads `window.location.hash` (e.g. `#works`)
3. Fetches `content/{page}.html` and injects it into `#main-content`
4. Root-level HTML files (`bio.html`, `works.html`, etc.) are meta-refresh redirects to `index.html#{section}` for old URL compatibility

**Cache busting:** `script.js` reads the `?v=` query param from its own `<script src>` tag in `index.html` and appends it to all content fetches. Bump the version in `index.html` to invalidate cached content.

## Key Files

- `index.html` — shell page: SVG ellipse, nav, empty `#main-content`, GSAP import
- `script.js` — routing, ellipse animation, glitch effect, nav state
- `styles.css` — all styles; 768px breakpoint for mobile
- `content/*.html` — page content loaded dynamically (bio, works, live, press, contact)

## Ellipse Animation

GSAP 3.12.2 animates "lynn avery" text along an SVG ellipse path. Animation start timestamp is stored in `sessionStorage['animationStartTs']` so the position persists across page loads.

The glitch effect randomly replaces letters with symbols (♣). Tunable constants at the top of `script.js`:
- `GLITCH_TRIGGER_INTERVAL_MIN_MS` / `MAX_MS` — how often glitches occur
- `GLITCH_DURATION_MIN_MS` / `MAX_MS` — how long each glitch lasts
- `GLITCH_FLICKER_CHANCE` — probability of a flicker vs. a held substitution
- `GLITCH_SYMBOLS` — pool of replacement characters

## Content Structure

**`content/works.html`** — albums use a consistent pattern: flex container with image left, details right, expandable `<details>` sections for track lists and Bandcamp embeds.

**`content/live.html`** — two tables (upcoming / past events); past events grouped by year in `<details>` blocks.

**Nav active state** — nav links use a `data-text` attribute to pre-reserve bold width and prevent layout shift when the active class is applied.
