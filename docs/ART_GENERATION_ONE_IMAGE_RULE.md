# MANDATORY ART GENERATION PROMPT — ONE GAME IMAGE, NEVER A SHEET

> This file overrides any older prompt or brief that suggests a concept board, character lineup, preview mosaic, multi-panel expression sheet, sprite sheet, infographic, asset catalog or presentation. Read this before EVERY image-generation call, including portraits, CGs, expressions, reactions, result screens, booster illustrations, locations and playmats.
>
> **The following prohibition applies to the GENERATED IMAGE ITSELF, not just the ZIP.**

## Exact prompt prefix — include verbatim in every generation request

**GENERATE EXACTLY ONE (1) COMPLETE, STANDALONE, IN-GAME ARTWORK FOR ONE (1) SPECIFIED ASSET. DO NOT CREATE CONCEPT ART, A CONCEPT BOARD, A CHARACTER SHEET, A SPRITE SHEET, A GRID, A COLLAGE, A CONTACT SHEET, A MOOD BOARD, A DESIGN PRESENTATION, AN ASSET COLLECTION, A STORYBOARD, A COMPARISON, A BEFORE/AFTER, OR A UI MOCKUP. DO NOT SPLIT THE CANVAS INTO PANELS, VIGNETTES, FRAMES, OR SECTIONS. NO LABELS, TITLES, CAPTIONS, ICONS, MENUS, DIALOGUE BOXES, WATERMARKS OR LOGOS. THE ENTIRE CANVAS MUST BE ONE CONTINUOUS ILLUSTRATION OF ONE MOMENT IN ONE LOCATION. RENDER ONE ASSET ONLY, NOT EXAMPLES OR VARIATIONS.**

Even if the surrounding task lists many missing assets, generate ONE asset per image call, then repeat for the next asset. Set image count to 1. Do not include multiple requested scenes, character lists, matrices or numbered image collections in the generation prompt. Character reference information may be used internally but should not be rendered as an on-image reference card. A group of characters may appear *together* only when they naturally participate in one authored scene; they must not become a character lineup.

## Per-asset request template

Copy the **exact prompt prefix** above, followed only by:

- **Asset ID (one):** `[character]_[action]` or the exact canonical asset ID.
- **Output file path (one):** `rpg-assets/[EXACT_RUNTIME_PATH].webp` (or PNG if a transparent standing sprite is required).
- **Image type (one):** `event CG` / `single reaction portrait` / `battle result` / `booster reward` / `standing character sprite` / `single location background` / `playmat`.
- **Character (if applicable):** one canonical adult NPC with appearance, hairstyle, skin tone, age, distinctive accessory and outfit taken from repository references.
- **One scene/action:** a specific, drawable moment with subject, pose, hands, expression, prop and setting. **Describe ONE image**, not a list of possible options.
- **Composition:** camera position, light, output orientation, space for in-game UI. Full bleed for backgrounds and scene CGs, transparent alpha for standing sprites; no baked UI.
- **Artwork style:** polished original modern anime VN / JRPG, clean anatomy, cohesive materials and lighting, faithful to existing approved art.
- **Content:** all characters clearly adult, SFW. Glamorous, playful, flirty fashion is acceptable; no nudity, sexual acts, visible underwear, voyeur framing, or implied minors.
- **Negative instruction:** reiterate `one continuous image only; no grid, no sheet, no collage, no typography or frames`.

Use only the relevant output dimensions from the actual code/spec (CG 1920×1080, thumb derived separately at 640×360; portrait master 1024×1536; portrait reaction generally 768×1024; special aspect ratios only when required). **Never ask the image generator to include a thumbnail next to the master**: resize the accepted master programmatically *after* generation.

## Production protocol (every asset)

1. Identify exactly one actually missing, incorrect or specifically requested runtime asset path from the current `main` branch; read the canonical visual reference before creating an image.
2. Generate ONE image with the required prefix and only this asset's scene description.
3. Inspect the output. **REJECT** if it contains any multi-panel layout, grid, tiled faces, numbered poses, split frame, concept sheet, side-by-side examples, promotional board, baked game UI, or labels. Do not crop a single panel out and claim that it was a full standalone render.
4. Reject incorrect character identity, accidental lookalikes, wrong event actions, unreadable faces, distracting anatomy artifacts, unexpected text, and other material deviations. Regenerate one corrected image if needed.
5. Resize/convert the accepted artwork to the exact production path and dimensions, with meaningful compression, correct color mode, and real alpha if the slot needs transparency.
6. Include checksum, pixel dimensions, bytes, original source name, and purpose in a machine-readable manifest. Package with repo-relative paths; do not overwrite approved files without review.
7. Only count a task as **delivered** after confirming the real standalone file decodes and its runtime URL/path is correct. Never count a generated promotional sheet as delivered gameplay art.

## Examples of what to request

**GOOD:** `One 1920×1080 event CG: adult Hana Mizuno behind the Lucky Draw counter, smiling as she offers a wrapped booster pack to the player, three-quarter mid shot, afternoon shop light, chestnut wavy half-up hair, cream/coral cardigan and worn shop lanyard, no text, a continuous single scene, lower 20% unobtrusive.`

**BAD:** `Create a Neo Campus production board showing all eight heroines, eight expressions, four reward scenes, a victory panel, and app icons.`

**BAD:** `Create a four-panel Hana expression sheet showing happy, angry, shy and excited.`

**BAD:** `Produce the full missing art catalog in one 4×4 image.`

## Review gate

Before saving or committing, answer: **Does the file itself show exactly ONE standalone image appropriate for its destination, with no grid, collage or embedded labels?** If **no**, discard it and generate again. This rule is not optional and must not be softened by aesthetic instructions elsewhere.
