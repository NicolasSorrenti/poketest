# STATUS UPDATE — 2026-10-23

The transparent primary portrait, 7 expression variants, one chibi and the approved first story CG are now included in this package. The remainder of this historical brief describes original targets; refer to `README_INSTALL.md` and `BARB_ASSET_STATUS.json` for true present asset statuses. CG #2 and the checkerboard-backed cut-in are review-only.

---

# Barb — production art brief and asset checklist

## Canon

Barb is an **adult woman, 21**, **exactly 161 cm**. Her frame is relatively compact with natural adult proportions and a moderately fuller bust, pronounced waist and softly rounded hips. Long copper-auburn hair, hazel-green eyes, black baker-boy cap, silver septum, butterfly necklace and **LEFT upper-arm rose tattoo** are identity locks. Match the approved 161 cm design sheet (`characters/barb/assets/reference/barb_character_bible.webp`). Contemporary SFW anime/JRPG style; adult, lively, punk-cute. Avoid changing proportions, tattoo sides or face between expressions.

## Source of truth and current deliverables

`characters/barb/assets/neutral.webp` is a finished **single, backgrounded reference portrait**, 1122 × 1402. The source is not a transparent PNG and does not satisfy the ideal full-silhouette production master specification; treat it as a working portrait for first integration. `characters/barb/assets/reference/barb_character_bible.webp` is a multi-panel 161 cm design bible, **not a CG or sprite**. The pack has playable story text and only a primary portrait in the loadable manifest.

## Art generation reliability rule

Produce **ONE finished image per generator request**. Follow the repo's `docs/ART_GENERATION_ONE_IMAGE_RULE.md` and `docs/PORTRAIT_GENERATION_GUIDE.md`; validate each prompt with `node scripts/rpg-art-prompt.js --validate <prompt-file>` before submitting. Never request character sheets, multiple outfits or expressions in a single image call. Reject any output with montage layout, captions, textual badges, multiple Barb copies, mislocated tattoo, inconsistent eye or hair colors, altered proportions, unintended extra body parts, or underage appearance.

## Production sprite (pending)

- `rpg-assets/characters/barb/portraits/primary.png`: true **1024 × 1536 transparent PNG**, no background; upper-thigh-to-head or knee-up, 3/4 angle, eyes 26–30% down, full original cap/hair silhouette and enough torso to read 161cm petite adult build. Use in character pack manifest `portrait` only once actually shipped. Existing `neutral.webp` stays as fallback until then.
- Expression snapshots **280 × 380 WebP**, consistent crop/framing, one image per generation: `expression-portraits/neutral.webp`, `smile.webp`, `surprised.webp`, `annoyed.webp`, `soft.webp`; optional `playful.webp`, `flustered.webp`, `determined.webp`. These require image outputs, not cropped captions from the board. For each, avoid new body proportions or face drift.
- Optional full-height pose for the VN: transparent front-facing and relaxed arms-down; note tattoo is on model's anatomical LEFT, not image-left.

## Scenes: one separate 16:9 illustration per event (pending)

Target full art **1920 × 1080 WebP** and thumbnail **640 × 360 WebP**, always a single cohesive environmental composition, clear lower 20% for dialogue. `character.json` has no runtime CGI hooks; connect scene assets through the CG gallery / story bridge according to game code rather than assuming `art_manifest.json` auto-binds them.

1. `barb_display_table.webp` (`barb_route_1`): first handmade accessories display in the card shop; Barb owns the table visually.
2. `barb_prototype_arcade.webp` (`barb_route_2`): creative prototype test at arcade; a personal, slightly comic moment.
3. `barb_cafe_draft.webp` (`barb_route_3`): warm café light, an honest difficult conversation by a laptop and sketchbook; emotionally quieter.
4. `barb_showcase.webp` (`barb_route_4`): the public display at the community center, success grounded in Barb's ownership.
5. `barb_riverside.webp` (`barb_route_5`): sunset waterfront moment and quiet sketchbook, no heavy spoilers baked into visual.

All five prompts with fuller composition details and stable paths are in `characters/barb/art_manifest.json`.

## Optional systems work beyond a standard Character Pack

- In-match reaction cut-in: `rpg-assets/characters/barb/cutins/match-cutin.webp` when artist-generated and registered via existing match reaction/cut-in mechanism.
- Chibi: 3-view front/side/back at the engine's currently used native sizes, plus map icon if overworld uses character-specific icons.
- Personalized gift playmat: separate mat image and item/unlock rules must be implemented as an RPG reward, not by editing the character manifest alone.
- Balance: assess `power_reserve` versus late-game decks in mirrored CPU simulations before optional tuned overrides in `rpg_npc_deck_progression.js`.

## Acceptance criteria

1. Stable name `Barb`, NPC ID `barb`; age 21, height 161 cm consistent in all files.
2. Every art output is independently usable, not a crop of a model sheet masquerading as master art.
3. The `characters:build` output includes her in the generated registry and copies `assets/` to `rpg-assets/characters/barb`.
4. `characters:validate`, `test:rpg` and a manual 90-day route smoke test pass on the actual checked-out repository.
5. Do not label optional CGs, outfit poses or chibi assets as complete until individual files exist and their runtime hooks are tested.
