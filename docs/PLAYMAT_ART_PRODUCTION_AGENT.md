# Neo Campus — Illustrated Playmat Production & Integration Agent Guide

**Purpose:** Create actual STATIC image playmats (WebP or PNG) for the Neo Campus TCG match field, while preserving the existing programmatically generated SVG mats as reliable fallback. This is both an ART PRODUCTION brief and an IMPLEMENTATION brief for an autonomous agent.

**Read before work:** `duel_playmats.js`, `duel_playmats.css`, `classic_live.js`, `classic_live.html`, `rpg_bond_rewards.js`, `rpg.js`, `duel_match_v085.css`, `duel_observability_rail.css`, and `server.js`. Also read existing character portraits and expression/cut-in images for the relevant NPC. Work from the actual latest branch, not assumptions about older UI screenshots.

## Nonnegotiable specification

| Attribute | Specification |
| --- | --- |
| Art type | Static, full-bleed, **horizontal tabletop playmat**, NOT a CG, poster, screen mockup, or card image |
| Master canvas | **3072 × 1536 px** (2:1), or higher at EXACTLY 2:1 |
| Shipped image | **2048 × 1024 px** (2:1) |
| Fallback resolution | 1280 × 640 px acceptable when source cannot be upscaled cleanly (existing SVG is 1280 × 640) |
| Shipped format | Preferred: **WebP**, RGB/sRGB, no alpha, quality **82–88** |
| Alternate | PNG RGB when transparency/lossless art is genuinely required; JPEG only if necessary |
| Target file size | Aim for **200–500 KB** each; investigate files over **700 KB**, and never quietly ship giant unoptimized PNGs |
| Master files | Retain source/master separately from the production WebP; do not load masters at runtime |
| Naming | Lowercase kebab-case or the exact stable existing mat ID (e.g., `npc-hana.webp`) |
| Live asset location | `rpg-assets/ui/playmats/<mat-id>.webp` |
| Live URL | `/rpg-assets/ui/playmats/<mat-id>.webp` |
| Visible UI | Art must stay **behind** all Pokémon, their attachments, statuses, attacks, benches, controls and labels |
| Supported platform | **Desktop first**. Mobile mats are intentionally disabled in current `duel_playmats.css`; do not enable or change mobile layout without separate approval |
| Safety/content | Adult NPCs, **SFW only**; no nudity, explicit sexualization, gore, hate symbols, or inappropriate text |
| Naming/branding | No invented branding, fake logos, AI watermarks, signatures, UI elements, or text baked into art |
| Usage | Cosmetic only. Nothing about playmats changes game rules, legal targets, card visibility, AI, saves, or multiplayer protocol |

### CRITICAL: real display geometry and crop behavior

The code's current SVG mats use a **1280 × 640**, 2:1 artwork. The desktop battlefield contains TWO separate territory backgrounds: `.player-territory` and `.opponent-territory`; a single static art file fills one territory, NOT the entire screen. The two territory boxes can have very different viewport dimensions than a 2:1 image, and CSS uses `background-size:cover` / `background-position:center`.

A territory is frequently much **wider and shallower than 2:1**. A 4:1 viewport displays approximately the **center 50% of the IMAGE HEIGHT**; at 5:1, it displays approximately the center 40%. This is an illustrative mathematical crop, not a claim of one fixed on-screen ratio. Other screen sizes can crop horizontally instead. Because of this:
- Place all identity-defining features, attractive motifs and intended focal texture primarily within the **central horizontal band, Y=32%–68%** of the master (roughly Y=492–1044 on 3072×1536, or Y=328–696 on 2048×1024). Surrounding 0–32% and 68–100% must remain attractive, seamless-feeling extension, not blank bars.
- Keep *indispensable* details away from the first and last **10% of the WIDTH**. Note that the middle is also obscured by Pokémon, so **do not rely on any single character face or symbol remaining visible**.
- A character or motif can be subtly represented in the left or right third of the canvas, but its identity must still read through colors, repeated motifs, emblematic objects, and overall art direction when a Pokémon covers it.
- Keep the visual field **quiet, lower-contrast, and relatively detail-light** behind active/bench Pokémon, attack buttons and small text. Use gentle color transitions, subtle fabric/foil motifs, not strong busy geometry.
- Keep corners finished and bleed artwork to every edge. **No letterboxing, frames outside the canvas, transparent margins, fake UI zones or labels.**
- The opponent mat in the current implementation is NOT automatically flipped 180°. Compose so it looks intentional in either territory; avoid directional text and prominent top-only layout.
- Do NOT bake battle zones, Pokémon cards, prize cards, stadium slots, UI overlays, damage counters or clickable icons into the image. Those already exist in the live DOM.

### Visual direction

The playmat belongs to a modern anime / Japanese collectible-card-game school-town RPG, combining art-book-quality 2D illustration, distinctive color language, graphic shapes and soft illustrated textures. It should look like merchandise that a character might genuinely give the player: elegant, thematic, coherent, readable under physical-looking TCG cards, suitable for game sessions of many minutes.

Use the **canonical current character portraits** as identity references: look first for `rpg-assets/characters/<npc-id>/portraits/primary.webp` or `primary.png`, then existing `rpg-assets/<npc-id>.png`, matching expressions, and `rpg-assets/characters/<npc-id>/cutins/match-cutin.webp`. Not all paths are populated for all characters: check the repository tree and use the newest canon available for each character. Do not infer hair color, outfit or age from the name or theme palette alone. Preserve hairstyle, face, apparent adult age and general design in every character mat. Do not present old concept sheets or another character as canon.

**Good art:** abstract fabrics, soft holographic ink, magical light, stylized town motifs, school-card-club insignia (invented, noninfringing), subtle linework, anime environmental painting, a restrained portrait/silhouette where appropriate. Character-specific art should be **recognizable but not a giant face that competes with the cards**. Vary motifs, typography-free iconography, palette and mood significantly between mats, not just a hue shift on the same generic swirl.

**Do not:** use official Pokémon art or trading-card IP from outside this personal project, copy someone else's playmat illustration, collage unrelated character portraits, imitate the exact composition of a third-party commercial mat, make all 20 look interchangeable, embed unreadable AI-generated text, embed battle UI, cover gameplay with contrast, or include story spoilers/romance endings.

### Current IDs to cover — no invented IDs

The catalog currently has **23 IDs**. Produce an image for each if this is a full production batch; otherwise make the requested subset and preserve existing SVG fallbacks.

**3 starter/general mats:**
- `aurora`: teal/navy aurora, soft luminous teal currents, clean premium default (existing palette: #112c45, #116480, #6ae0ca).
- `arcade`: modern neon arcade, purple and pink light trails, nighttime club atmosphere (#261339, #713580, #ed9ee7).
- `heritage`: classic green tournament cloth and cream/gold trims, quiet traditional TCG aesthetic (#173527, #56784d, #ecd9a4).

**20 character gifts (IDs and preferred palette):**

| ID | Theme colors | Suggested NON-SPOILER visual motif; adapt to the character's actual canon |
| --- | --- | --- |
| `npc-hana` | #253e60, #598aab, #c0ebf9 | Airy sky-blue teamwork geometry and friendly classroom/club textures |
| `npc-reina` | #461f38, #a24466, #ffdaad | Regal chess-like geometry, crimson/rose gold, precise competition |
| `npc-shiori` | #20324b, #5678a8, #c2d7fa | Quiet stationery, books, moonlit study, clean blue ink |
| `npc-yuna` | #441d59, #a24aaa, #ffdc81 | Neon stage, playful electric stars, pink-violet energy |
| `npc-akari` | #143946, #47848e, #b7ebe4 | Methodical circuits, translucent drafting grids, calm teal |
| `npc-camila` | #24382c, #648348, #e0d391 | Botanical dark green, antique collector's gold |
| `npc-marina` | #183c58, #398aad, #a7eafa | Lake ripples and seaglass, soft water reflection |
| `npc-kaede` | #34213d, #8a517d, #ecc0df | Torn-paper fashion graphics, dark floral magenta accents |
| `npc-jun` | #1d3543, #528c94, #cfeced | Balanced geometric club-emblem motifs, pale cyan |
| `npc-teo` | #323254, #8b6fbb, #f8e0b0 | Broadcast/stage spotlights and tasteful gold reflections |
| `npc-iris` | #2a2c4b, #796ab0, #ddcfff | Iridescent lavender facets and delicate prism glass |
| `npc-jinx` | #1b2d63, #5868d4, #f2b0f2 | Electric graffiti, sharp blue-purple stars, playful urban energy |
| `npc-luna` | #14334f, #3f82b5, #a1dcff | Midnight water, lunar ripples, silver-blue moon arcs |
| `npc-sol` | #523027, #b26942, #fce19a | Sunset warm metal, saffron rays and handmade paper |
| `npc-elena` | #2a2d47, #7e819f, #e2dbe6 | Reserved slate elegance, fine line grids and matte pearl |
| `npc-rina` | #1c3b2d, #478865, #b6e7ac | Garden leaves, soft sprouting vines and cool jade |
| `npc-sierra` | #362444, #885a99, #e4b5eb | Deep violet ornamental ribbons and playful sparkle |
| `npc-elio` | #2e3551, #697cb3, #f0d6ad | Adventurous dusk/sunrise rays, indigo with warm accents |
| `npc-alma` | #313144, #78718c, #dbcae6 | Muted plum stationery and cozy starlight fabric |
| `npc-nereo` | #183d55, #3787a4, #a6e5ee | Sea currents, aquatic glass textures, turquoise currents |

These motifs are **creative guidance, not canonical biographies**. Check each NPC's actual in-game characterization before finalizing art.

### Universal image-generation prompt (replace fields)

Produce a **full-bleed premium illustrated playmat texture**, 2:1 horizontal canvas, for the Neo Campus Pokémon TCG-inspired anime RPG game, intended to lie UNDER a live interactive tabletop of Pokémon cards. Target visual art quality: high-end original modern anime collectible card-game merchandise, polished illustration + subtle graphic design, clean silhouettes, beautiful layered paint, fine atmospheric detail, tasteful texture.

Subject: **[MAT NAME / CHARACTER ID]**.
Canonical character visual reference: **[ACTUAL CHARACTER REFERENCE IMAGE PATHS]**.
Art concept: **[SPECIFIC MOTIF, ENVIRONMENT, ACCENTS, PROP DETAILS]**.
Primary palette: **[HEX A, HEX B, HEX C]**.
Tone: **[MOOD]**.
If this is a character mat, make it feel *personally designed by or given by* that character; feature their unmistakable existing visual identity via consistent design details, restrained visual motifs, or a subtle integrated anime illustration—without crowding out the cards. If generic, use unique attractive imagery rather than a character portrait.

**Compositional requirements:** artwork fills every edge with no frame or margins; mostly horizontal composition; elaborate-but-subdued visual layers; central Y=32–68% must retain the signature pattern/atmosphere because the game crops top and bottom on wide desktops; aesthetic must survive card overlays; keep busy highlights away from central active card and small labels; use subtle gradients and graphic repeats; detail placed symmetrically enough to work for both players' territory orientations; no baked zone markers. Prioritize a legible, quiet, elegant backdrop over poster-like scene drama.

**Negative prompt:** no UI, no cards, no Poké Balls, no official logos, no copyrighted character cameos, no text, no typography, no watermark, no signature, no frame, no border, no mockup, no tabletop photographed in perspective, no angled board, no thick vignette, no busy central face, no high-frequency clutter, no empty letterbox, no cropped limbs/extra fingers/distorted faces, no invented details inconsistent with canonical character, no explicit content, no spoilers.

Create at 3072×1536 when supported, otherwise render the closest 2:1 resolution at or above 2048×1024 and downsize carefully; don't distort or stretch a differently proportioned output.

### Agent workflow for production

1. Read the latest actual repository and canonical art references; inspect the CSS territory and existing `duel_playmats.js` catalog. Do not assume every portrait path exists. Choose mat IDs from the list above.
2. Write a **unique mini-brief** (2–4 sentences) for each mat including its exact character design references, motif, light direction, palette and planned treatment under cards.
3. Generate ORIGINAL full-bleed 2:1 artwork; generate alternate candidates for designs that are too close to others. For an image service that offers only 16:9, **outpaint or crop carefully to 2:1** rather than stretching.
4. Inspect every full image for visual defects, character identity, accidental text/watermarks, artifacts, cut limbs/fingers, and adherence to SFW/nonspoiler requirements. Reject and regenerate failures.
5. Preview THREE views per candidate: whole 2:1 master, center vertical crop representative of 4:1 territory (Y=25–75% of the image), and center vertical crop representative of 5:1 territory (Y=30–70%). Also preview with **card-shaped opaque rectangles** approximately over central active and upper/lower bench areas (these test overlays are NOT part of shipped art). The background must still have a recognizable identity and legible action cards.
6. Export lossless source master (or native editable source when possible) separately, and make RGB sRGB WebP 2048×1024 at quality 82–88. Optimize toward 200–500 KB without ugly compression; if over ~700 KB, document why.
7. Save the runtime files as `rpg-assets/ui/playmats/<id>.webp` using **exact IDs**, not names like `hana-final-v3.webp`. Optionally place uncropped masters in a clearly separate art-production folder (not in runtime assets).
8. Produce an asset manifest or report with **ID, source image/reference path, output path, exact pixels, encoded bytes, SHA-256, motif/palette, review status, and any known issues**. A machine-readable JSON file and a short Markdown report are ideal.
9. Do not claim images are "in the game" merely because you exported files. Verify the static image integration below and an actual browser match.
10. Never skip a policy-disallowed image with a blank placeholder; generate a distinct, compliant SFW alternative and document what was substituted.

### Code integration required (current code is SVG-only)

As of writing, `duel_playmats.js` creates a `catalog`, generates SVG strings via `svg(id)`, and `apply(side,id)` unconditionally sets CSS `--neo-playmat-image` to that SVG. **Adding a .webp file alone will NOT display it.** The implementation agent must:

1. Add an optional immutable `image`/ `src` field to the existing mat catalog entries. Example: `{id:'aurora',...,image:'/rpg-assets/ui/playmats/aurora.webp'}`; and `{id:'npc-hana',...,image:'/rpg-assets/ui/playmats/npc-hana.webp'}`. Maintain original IDs, colors, names and gift ownership behavior. Never populate an image field unless its file exists.
2. Update `apply(side,id)` to prefer a **known same-origin static image URL** where present, without evaluating user-controlled arbitrary paths. Strictly allow `/rpg-assets/ui/playmats/[a-z0-9_-]+.webp` (or known explicitly authorized local PNGs). Set `--neo-playmat-image` to a correctly quoted CSS `url(...)`, not an `<img>` laid on top of the cards.
3. Keep the current `svg(id)` generator as an always-functional fallback when no static image exists **or loading fails**. Use normal Image preloading and a guarded `onerror` fallback, protecting against out-of-order callbacks when a user switches mats quickly. Cache image status per ID if practical; do not cause repeated network downloads on each `render()`.
4. The existing CSS selector `.stage .territory[data-playmat]::before` and `background-size:cover; background-position:center;` are the desired integration layer. Keep the image behind the DOM through existing stacking/isolation, keep the current dark gradient overlay if needed, and never obstruct card selection.
5. Apply the player's selected ID to `.player-territory` and the RPG opponent's signature `npc-<id>` mat to `.opponent-territory` using existing `classic_live.js` logic. Preserve fallback `heritage` in non-RPG CPU mode and do not affect online multiplayer.
6. The campaign unlock mechanic is already implemented in `rpg_bond_rewards.js`: NPC mats are gifts from **bond chapter 2**, and `gifted(state)` also recognizes saves with prior chapter rewards. Do not change unlock thresholds, save compatibility, mat IDs, or let unearned NPC mats be selected during RPG.
7. **Mobile is deliberately excluded.** The current `duel_playmats.css` explicitly hides both custom territory backgrounds and selector at viewport width ≤780px; do not remove this safeguard. Mats should remain selected/saved when the user moves back to desktop.
8. `server.js` already permits GET for local `.webp`, `.png` and `.jpg` resources under the repository root; do not add dangerous broad permissions, expose source/master art, or trust arbitrary external URLs.
9. **Deployment reality:** the art ZIP installer allows the `rpg-assets/ui/` prefix, but only extracts entries present in its verified archive and enforces the archive SHA-256. New images must either be committed as actual runtime files (if ignored, deliberately force-add only the approved production WebPs) OR intentionally incorporated into the validated packaging process with hashes updated and conflicts tested. Do not assume writing to `art-production/` or merely mentioning a new ZIP makes a deployed Render instance serve it. Check each production URL returns 200 with `Content-Type:image/webp`.
10. Add focused Node and browser regressions that check catalog IDs, static fallback, failed image fallback, switch race guard, ownership, desktop mobile separation, and that the cards/attacks remain clickable. Existing tests are `tests/duel_playmats.test.js`, RPG bond tests and responsive duel browser checks. Do not rewrite old tests just to make CI green; baseline CI may already have unrelated failures.

### Final acceptance checklist

- [ ] Requested IDs have ACTUAL original image files with verified 2048×1024 dimensions and RGB/sRGB export.
- [ ] Every design differs meaningfully in concept, not only color; each named character has a checked canonical identity.
- [ ] Art is full-bleed and works when the center 40–50% of height is visible; no vital detail depends on a corner.
- [ ] Image file sizes are reasonable; every runtime path and content type is correct.
- [ ] Static-image selection works on desktop for both your territory and an RPG opponent's territory.
- [ ] SVG still renders for unillustrated mats, missing files and failed loads.
- [ ] An old campaign save, newly earned chapter-2 gift, and locked character mat behave correctly.
- [ ] Desktop card/bench/active/attack/choice interactions and chat/log remain exactly as functional as before.
- [ ] Mobile remains in existing **no-custom-playmat mode** without breaking layout or losing the selection.
- [ ] Source masters are not downloaded by the game. Only ship optimized images.
- [ ] Generated images + manifest + implementation/test changes are committed as small auditable changes, with a clear summary and remaining limitations.

**Definition of done:** A character portrait PNG dropped into a directory does NOT count. Completion requires well-composed, optimized static playmat art, correct catalog registration, working in-match presentation, fallback behavior, gift unlock compatibility, and successful relevant new tests. If the agent is assigned art-only work, deliver the finalized asset batch and a manifest, explicitly state integration was NOT performed, and do not imply otherwise.
