# Neo Campus — Hourly Overworld Artwork Handoff

Updated: 2026-10-29. This file coordinates the scheduled art-generation task and design-review conversation. Source of truth: `overworld/manifest.js`, `docs/OVERWORLD_HANDOFF.md`; the original RPG is unchanged.

## Rules and references
1. Produce environments **first**, then character-only standing sprites. Work on one artwork deliverable per scheduled run and keep this checklist current. Before any work, inspect the newest `main` changes to avoid duplicates.
2. **Approved visual style reference:** [Pixel Palace overworld map](https://github.com/NicolasSorrenti/poketest/blob/main/rpg-assets/locations/arcade/overworld-map.webp) — continuous elevated three-quarter perspective, anime/JRPG color and lighting, clearly readable open floors and precise sprite foot placement. This reference is final; do not overwrite.
3. **Geometry reference:** [Canonical overworld manifest](https://github.com/NicolasSorrenti/poketest/blob/main/overworld/manifest.js) — location IDs, original dimensions, anchor locations and hotspot zones. Keep distinct room identity and furniture arrangements. Generate only the environment: no NPCs, avatars, UI, floating markers or baked-in interactions.
4. A new render is a **candidate**, not approved game art. Save separately under `art-production/overworld-candidates/` and describe what needs review. Promote to `rpg-assets/locations/<id>/overworld-map.webp` only when approved; then verify and update coordinates. Never overwrite the approved Pixel Palace image or existing approved characters.
5. Each deliverable needs a visible **reference list** with exact repo paths/links, a generated image when image capabilities are available, dimensions/aspect ratio, QA notes (camera, walkable floor, foot anchors, overlays), and status (candidate, approved, needs input). When rendering or pushing actual image files is not possible, write an unambiguous ready-to-generate prompt and say that no art file was created.
6. Use approved modern JRPG anime aesthetic; avoid copying copyrighted games' specific character or background designs.

## Environment priorities (complete before character sprites)

| Order | Location ID | Name | Existing map source | Art direction / QA focus | Status |
| --- | --- | --- | --- | --- | --- |
| 0 | `arcade` | Pixel Palace | `rpg-assets/locations/arcade/overworld-map.webp` | **Reference / final**, preserve | Approved |
| 1 | `home` | Your Apartment | `overworld/maps/home-blueprint.svg` | Warm cozy personal room, bed, deck/journal desk, wardrobe, open center, nighttime/window lighting option | Blueprint; needs original render |
| 2 | `park` | Riverside Park | `overworld/maps/park-blueprint.svg` | Open riverside walkways, benches, flowering garden, flyer board, appropriate foot paths | Blueprint; needs original render |
| 3 | `cafe` | The Rest Stop | `overworld/maps/cafe-blueprint.svg` | Cozy café, counter, tables, window seats, free floor for character positions | Blueprint; needs original render |
| 4 | `center` | Community Center | `overworld/maps/center-blueprint.svg` | Duel/tournament tables, registration, open gathering floor | Blueprint; needs original render |
| 5 | `library` | Library | `overworld/maps/library-blueprint.svg` | Reading desks, shelving and quiet warm lighting, clear sight lines | Blueprint; needs original render |
| 6 | `shop` | The Lucky Draw | `art-production/overworld-candidates/shop-map-v1.png` | Review existing candidate against original shop identity and approved Pixel Palace before refinement | Candidate only, not approved |

Location coordinates are defined in `overworld/manifest.js`; the initial blueprints use logical `1550 × 1120` canvas and the approved Pixel Palace is also `1550 × 1120`. Preserve the scene's logical map geometry or update every hotspot/anchor only with visual verification. Shop candidate dimensions differ, inspect carefully.

### Next generation brief: Your Apartment
- Visual references: approved [Pixel Palace map](https://github.com/NicolasSorrenti/poketest/blob/main/rpg-assets/locations/arcade/overworld-map.webp), [home blueprint](https://github.com/NicolasSorrenti/poketest/blob/main/overworld/maps/home-blueprint.svg), [map/hotspot manifest](https://github.com/NicolasSorrenti/poketest/blob/main/overworld/manifest.js). Use the blueprint layout for placement, Pixel Palace for camera and style, NOT for copying furnishings.
- Original environment-only full scene, premium anime JRPG three-quarter view, believable floor and furniture perspective. Warm lived-in bedroom/apartment for a young adult TCG player: deck/journal desk, shelves, bed, wardrobe, window corner. Keep center circulation clear for sprite foot anchors; no baked characters. Design for panning/zooming across a 1550 × 1120 master composition; no UI, event markers, interactive hotspots rendered into image. Stage as a non-approved candidate until inspected against blueprint and approved.

## Character phase (after environment maps)
- **Approved scale reference:** [Reina standing](https://github.com/NicolasSorrenti/poketest/blob/main/rpg-assets/characters/reina/overworld/standing.png) and [Reina arcade pose](https://github.com/NicolasSorrenti/poketest/blob/main/rpg-assets/characters/reina/overworld/arcade-playing-character.png): full-body isolated transparent PNG, correct foot anchor and ~155px logical sprite height.
- **Do not use Reina's appearance as another character's identity reference.**
- **Yuna identity references:** `rpg-assets/characters/yuna/portraits/primary.png` and `rpg-assets/characters/yuna/streetwear-preview.png`. An existing candidate `art-production/overworld-candidates/yuna-standing-v1.png` is **not approved**; inspect its stocking, alpha and silhouette issues. Request approval before final promotion.
- **Barb identity references:** `rpg-assets/characters/barb/portraits/primary.png` and `rpg-assets/characters/barb/barb_character_bible.webp`. Existing `art-production/overworld-candidates/barb-standing-v1.png` is **not approved**. Respect adult height 161cm, hair, tattoo, accessories, approved outfit.
- **Jinx identity conflict:** `rpg-assets/characters/jinx/reference/jinx_character_sheet_01.png` and `rpg-assets/characters/jinx/neutral.png` differ in hair color; do not finalize until canonical reference chosen.
- **Other canonical starting references from manifest:** Hana `rpg-assets/characters/hana/portraits/primary.png`; Laca `rpg-assets/characters/laca/neutral.webp`; Daisy `rpg-assets/characters/daisy/portraits/primary.png`; Rina `rpg-assets/rina.png`. Check for more recent approved variants before using.
- Before every new character, display the actual verified identity refs or give exact clickable paths. If character refs are missing, ambiguous or conflicting, stop that sprite and request references rather than inventing a new design.
- Transparent RGBA, character only, natural standing pose and visually consistent apparent relative height; never mix sprites, CGs, overworld environment art and VN portraits.

## Run report format
- Target: background or character / canonical ID
- References: exact clickable paths with their role (identity, camera, spatial blueprint)
- Result: new art file path + verified link, OR prepared prompt only (explicit)
- Validation: dimensions, transparency where relevant, character consistency, hotspots/floor scale
- Next: one follow-up item; note blockers/approvals

## Queue
- [ ] Your Apartment background
- [ ] Riverside Park background
- [ ] The Rest Stop background
- [ ] Community Center background
- [ ] Library background
- [ ] Lucky Draw candidate review/refinement/approval
- [ ] Yuna standing candidate review or revised sprite
- [ ] Barb standing candidate review or revised sprite
- [ ] Jinx canonical hair identity confirmation, then sprite
- [ ] Remaining cast with individual approved reference checks
