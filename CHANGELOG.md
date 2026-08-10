# Changelog — Workshop of Wonders landing

This file is the working log for this project. **Claude: read this file at the start of any session on this repo, and append a new entry every time you finish a piece of work** (after commit+push), instead of relying on conversation memory. Keep entries short and factual — what changed and why, not a transcript of the conversation.

## How to use this file
- Add new entries at the **top** of the "Log" section (most recent first), one entry per meaningful change/commit.
- Each entry: date, one-line summary, commit hash if available.
- Keep the "Pending / open items" section current — remove items once resolved, add new ones as they come up.
- Keep the "Key decisions & conventions" section updated if a new durable pattern/convention is established (e.g. a breakpoint value, a naming rule).

---

## Project links

- **Repo**: https://github.com/workshop-of-wonders/wow-landing (branch `main`, push directly — no PR flow used so far)
- **Live site**: https://wow-landing-beta.vercel.app/ (auto-deploys from `main` via Vercel)
- **Vercel dashboard**: not confirmed — the Vercel MCP integration connected in this environment (team `somosefectowow-1205's projects`) does **not** list this project, so it's deployed under a different Vercel account/login than the one connected here. To check build logs or domain settings, log into vercel.com with whichever account owns `wow-landing-beta` directly (not through this session's tools).
- **Design assets**: `design-system/` folder in the repo (icons, logo, client logos, hero photos, font). Real Behance case-study images still need to be added here (see Pending below).
- **Behance (reference for case studies)**: https://www.behance.net/mjtamayol

## Pending / open items

- **Real photos still needed for 8 brands**: Prepapp, MJ Studio, Seed Capital, AM Studios, Tata's Photos, Geco., Moonking, and Acústica Eafit are in the Trabajo carousel as colored gradient cards (name + tagline, no photo, no lightbox) since there's no project photo for them yet. Once real images exist, convert each `.work-item-color` div back into a real `<button data-lightbox>` like the others (see 2026-08-09 entry).
- **`tiny.png` client logo identity unconfirmed**: `design-system/clients/tiny.png` (teal cursive mark) visually resembles the Tin-T! logo but wasn't confirmed against a source — left its caption/title as generic "Tiny" rather than guessing. Confirm with the client and either rename to Tin-T! or correct it.
- **Lead form backend**: the "Cuéntanos tu proyecto" modal (project form) submits nowhere — it just shows a local thank-you message. Need a destination (email, CRM, Google Sheet, Formspree, etc.) to actually wire it up.
- **Client logo sizing**: logos are transparent + tight-cropped and rendered at a consistent height, but some may still look slightly different in visual weight due to each source file's original design (not fixable purely with CSS).

## Key decisions & conventions

- **Breakpoints**: `900px` is the main mobile/tablet cutoff used across the site (hero, labs accordion, nav). `720px` and `560px` are used for a few finer adjustments. When adding a new mobile override, check whether JS logic (e.g. `window.innerWidth` gates) needs to match the same breakpoint as the CSS — this caused a bug once (see 2026-08-08, labs accordion).
- **`--page-x`**: `clamp(24px, 6vw, 96px)` — the horizontal section padding variable. Use this instead of a fixed px value for any new section's left/right padding so it scales with viewport width.
- **Falling icons (contact section)**: Matter.js physics playground. Known-sensitive settings: `restitution: 0.9` + default solver iterations (bouncy, piles up — client's preferred feel, don't "fix" the piling/clumping without asking, it's intentional). Drag release is hardened across `mouseup/touchend/touchcancel/pointerup/blur`. If you ever call `Render.setPixelRatio` again, remember to also set `mouse.pixelRatio` to the same value (and re-set it on resize) — Matter's `Mouse` module doesn't pick this up automatically, and drag silently breaks on any scaled/HiDPI display without it.
- **`flex-basis` on axis-flip bug**: watch out — properties like `flex: 0 1 520px` written for a *row* layout become a fixed **height** if that flex container switches to `flex-direction: column` at a breakpoint (e.g. hero-content, hero-media, lightbox-desc all hit this). Always re-check/reset `flex-basis` inside mobile media queries after adding a fixed basis for desktop.
- **Hub diagram connector lines**: drawn dynamically in JS (`hubArrows` SVG) from real pill positions, not hardcoded paths — recalculates on resize/font-load.
- **Case-study modal**: 2x2 photo grid (project's real image + 3 seeded from the shared `hero-photos` pool) + dark bottom bar (name, category, description, tags). Triggered by `[data-lightbox]` on both work-items and client-logos.
- **Project form modal**: triggered by any `[data-open-form]` element (nav "Hablemos", hero CTA, services CTA, contact pill, hub "W" click).

---

## Log

**2026-08-10** — `58ae0f1` Labs panels: each lab's name pill now toggles a list of that lab's services (visible by default, click to hide/show), and clicking a service opens the project form. `a672406`/`ce52cd7` also restyled the lightbox: tag pills filled with WoW purple then the bottom caption bar itself changed from near-black to WoW purple (with tag pills switched to translucent white so they still contrast).

**2026-08-09** — `54e2696` Renamed `hero-photos/hero-1..8.jpg` to their real brand names (identified from logos/watermarks visible in the photos) and corrected every title/category/description across the hero background, Trabajo carousel, and marcas marquee that had been using placeholder names (Bary, Bilac, Carlos Ravelo, etc. for the wrong photos). Added 8 brands with no photo yet as colored gradient cards. See file for the full real-brand list the user provided — still pending: real photos for the 8 colorcard brands, and confirming whether `clients/tiny.png` is actually the Tin-T! logo.

**2026-08-09** — `ca5d45e` Fixed the case-study lightbox modal getting an internal scrollbar on short viewports. The 2x2 photo grid used `aspect-ratio: 4/3` per cell, so its height was purely a function of modal width, not available viewport height — switched `.lightbox-inner` to a flex column so the grid flexes to fill exactly the space left after the caption, always fitting within `max-height: 90vh` with no scroll.

**2026-08-09** — `222e360` Fixed falling icons (contact section) not being draggable on any desktop display with OS/HiDPI scaling ≠ 100% (e.g. Windows 125%). Root cause: `Render.setPixelRatio` scales the canvas but Matter's `Mouse` module has its own separate `pixelRatio` (default `1`) used to convert cursor position into world coordinates — left unset, the two drift apart by the scale factor and drag hit-testing silently misses. Now synced on init and on resize.

**2026-08-09** — `242fa5c` Hero photos wired into the existing lightbox (reusing the Trabajo section's brand mapping), and breathing room added between the "LABS" outline word and its panel cards. (A third change — shrinking the "Cómo pensamos" scroll-pin height — was tried, then explicitly reverted per feedback: keep that section's height as original.)

**2026-08-08** — `8d92516` Fix labs accordion breakpoint mismatch (JS gated at 720px, CSS at 900px).

**2026-08-08** — `aed74dd` Labs section: tap-to-expand accordion on mobile/tablet (≤900px), matching Superside reference — collapsed color bars, one open at a time.

**2026-08-08** — `9ef5da8` Mobile/tablet responsive QA pass: fixed undersized footer social tap targets (16px → 40px). Full audit (overlap/overflow/tap-targets) at 320/390/768px came back otherwise clean.

**2026-08-08** — `3b1d295`, `761a723`, `051e954` Rebuilt the mobile/tablet-portrait hero to match the Superside reference: centered text block, photo mosaic as horizontal scroll strip(s) instead of vertical columns. Fixed two "flex-basis becomes height on axis flip" bugs found along the way (hero-content, media-col).

**2026-08-08** — `c79206b`, `6749ab0`, `0566665`, `03d7fb3` Hero desktop positioning iteration: mosaic pinned flush to the right edge via `margin-left: auto` + `flex-grow: 0` on hero-content (final state); tried and reverted a mobile "bleed to edge" approach per user feedback.

**2026-08-08** — `1f74377` Added `--page-x` responsive horizontal padding variable, applied across nav/hero/sections (was a fixed 40px before, felt too tight on wide screens).

**2026-08-08** — `1648840`, `56c33bd` Bigger hero mosaic cards (hero is now taller). Redesigned the project/client click modal into a Superside-style case study layout (2x2 photo grid + dark info bar with name/category/description/tags).

**2026-08-08** — `52158f6`, `d57d360` Slowed the "Cómo pensamos" scroll-pin (more scroll distance before release). Swapped Trabajo/marcas marquee directions (work items left→right, brands right→left, opposite of each other).

**2026-08-08** — `0a86395`, `c03876d`, `a62edf4`, `5141ac2`, `a7ecd80` Falling icons physics tuning: fixed the real bug where an `afterUpdate` handler was killing the bounce every frame; iterated restitution/solver settings back and forth per user preference to land on bouncy + pile-up behavior; hardened drag-release across mouseup/touchend/touchcancel/pointerup/blur.

**2026-08-08** — `2328b18` Added the project form modal (matches a Superside-style "Book a demo" reference), dynamic JS-drawn connector lines in the services hub diagram, real wow-mark icon for the hub "W" (was plain text), and transparent/cropped client logos (flood-fill background removal via Pillow).

**2026-08-08** — `41780d9` Fixed the custom cursor in Servicios rendering behind the pills (a `.services > *:not(.outline-word)` rule had higher specificity than `.figma-cursor` and was overriding its `position:fixed`/z-index).

**2026-08-08** — `e6b1c59` Hero width/flex fixes, Labs/hub-W/contact/marcas visual updates, merged the brands section into Trabajo as a marquee row underneath the project carousel.

**2026-08-08** — `5057b26`, `8ddf134` Hero mosaic now extends behind the (transparent-until-scroll) header with a top/bottom fade mask; fixed the mosaic's infinite-scroll loop jump (`.media-col` was stretching to the container height instead of using its real content height for the `translateY(-50%)` math).

**2026-08-08** — `ae2beec` Large rework: hero, nav, labs, services hub, contact section, new Trabajo/lightbox sections — this is the session where most of the current structure (sections, JS interactions) was established. Removed the old "Esencia" section, redesigned "Cómo pensamos", labs hover panels, services hub diagram, footer socials, contact form CTA.

**2026-08-07** — `e398a52`, `abfa5a5`, `0e435c3`, `bc90315`, `f918c2b` Initial build and early iteration: custom EfectoWow font, interactive services diagram, scroll-synced process timeline, physics-based falling icons (Matter.js), scroll-pinned sections, labs hover panels, hero photo marquee.
