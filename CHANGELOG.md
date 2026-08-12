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

- **Real photos still needed for 4 brands**: Prepapp, MJ Studio, Seed Capital, and Moonking are still colored gradient cards (name + tagline, no photo, no lightbox) — Acústica Eafit is the 5th. AM Studios, Tata's Photos, and Geco. got real photos 2026-08-11 (see log) and were converted back to real `<button data-lightbox>` items; do the same for the rest once photos exist.
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

- **2026-08-11**: Fixed the "open the workshop" door (`.work-door`) so it actually rotates in 3D instead of looking like a flat slide. Root cause: `.work-door-leaf` (the animated element) is a *grandchild* of `.work-door` (the element with `perspective`), with `.work-door-frame` in between — that middle element needs `transform-style: preserve-3d` or the browser flattens the leaf's `rotateY`/`translateZ` into 2D before the ancestor's perspective ever applies. **Key lesson**: any future 3D-transform element (perspective on an outer wrapper, animated transform on an inner element) needs `preserve-3d` on every element in between, not just leaf-level styling — check this first if a "3D" effect looks flat.
  - Hinge is on the **right** edge (`transform-origin: right center`, hinge dot at `right: 3px`) — the leaf pops toward the viewer and rotates, collapsing toward the right hinge and revealing the arch void on the left, i.e. "opens to the right". (A left-hinge version was tried first per an earlier reading of the client's reference, then reverted — client confirmed right-hinge/opens-right is correct.) Open-state transform: `rotateY(-48deg) translateZ(40px)`.

**2026-08-11** — `e1f5e22` Added real photos for 5 brands (AM Studios, Geco., Tata's Photos, Epika Store, Centro del Sueño y Ronquido — converted the first three back from color-cards to real `<button data-lightbox>` items) and refreshed the mockups for the 8 brands that already had photos (same filenames, so every existing reference picked them up automatically — no HTML changes needed for those). Wired the 5 new ones into the hero mosaic, the Trabajo reveal grid, and the lightbox photo pool. Source files: `C:\Users\majot\Desktop\Fotos para sitio\para el hero`, resized to 840x1260 and re-encoded as JPG before adding.

**2026-08-11** — Door open-state iteration (several commits): went back and forth between a flat two-piece void+leaf split (fully legible but user felt it wasn't "3D enough") and a real `rotateY` hinge rotation (reads as physically opened but fights with label legibility the more it rotates). Landed back on the hinge rotation per explicit request ("la de bisagra"), hinge on the **right** edge (`transform-origin: right center`) matching a real door, with the handle dot on the **left** edge of the leaf so it naturally sits at the frame's left edge when closed and right at the void/leaf seam when open — one element instead of two overlapping ones. **Convention**: this door's open-angle is a legibility/dramatic-swing trade-off that's been re-litigated many times — before changing the rotateY angle again, check `.work-door.is-open .work-door-leaf` current value and the rendered leaf width via `getBoundingClientRect()` rather than guessing from a screenshot.

**2026-08-10** — `3d26685` Fixed the open-door illusion actually being invisible: `translateZ()` combined with a `rotateY()` hinge rotation compounds in 3D space and can re-magnify a foreshortened element back to nearly its original on-screen footprint, masking the rotation almost entirely. Diagnosed by sampling `elementFromPoint` across the door at 10 x-positions instead of trusting screenshots at this small size — found the leaf still covered ~78% of the frame width despite the rotation. Removed `translateZ` from the open-leaf transform. **Convention**: if a hinge/card-flip rotateY effect ever looks "stuck" or unchanged despite the transform clearly being applied (check via computed `transform`/`matrix3d`), verify the actual rendered footprint with `elementFromPoint` sampling before assuming it's a cache issue — don't add translateZ "pop" to a rotateY hinge without re-checking rendered width.

**2026-08-10** — `812ebe9` Rebuilt the Trabajo section's card row as a fixed CSS Grid (`repeat(5, minmax(0,1fr))` at ≥901px) instead of flex-wrap, which had been wrapping to 3-over-2 on desktop. Door is now explicitly the 3rd item: `[1] [2] [door] [3] [4]`, and the revealed "taller" content is a normal-flow 3-column grid below the row (own open/close state), not inside the row itself — opening it just grows page height, the 5-card row never reflows.

**2026-08-10** — `9229d77` Replaced the Trabajo section's infinite auto-scroll marquee with an "Abrir el taller" door-reveal interaction: a small illustrated door (WoW purple + lima, not a generic button) sits after the 4 initially-visible project cards; click swings it open and the rest of the existing projects (no new ones added) rise into view with a staggered animation, click again to reverse and collapse. Also added a `data-match` micro-interaction — hovering a brand logo below highlights its matching project card (only wired for the 3 confirmed logo/photo pairs: Milán, Arlo, Orbit).

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
