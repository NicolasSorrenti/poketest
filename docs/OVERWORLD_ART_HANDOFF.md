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
| 1 | `home` | Your Apartment | `overworld/maps/home-blueprint.svg` | Warm cozy personal room, bed, deck/journal desk, wardrobe, open center, nighttime/window lighting option | Conversation image candidate generated, NOT in GitHub or approved; needs layout review |
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


## Apartment candidate produced in the art conversation

- The user and assistant generated an original nighttime apartment image, local conversation filename `estudio_nocturno_con_cartas_y_plantas.png`, **1475 × 1066 RGB**, on 2026-10-29. It exists as a conversation artifact, **not in this repository**; do not treat it as an approved canonical asset.
- The candidate depicts bed, TCG desk, wardrobe, plants, window lounge and open central floor, in a neon-lit warm-purple JRPG environment. Before adoption compare it side-by-side with `overworld/maps/home-blueprint.svg`, confirm object placement versus manifest hotspots/anchors and resize/export to the canonical map geometry if approved.
- **Next automatic generation target while the apartment awaits review: `park` / Riverside Park.** Use `overworld/maps/park-blueprint.svg` for exact spatial reference and Pixel Palace's approved background for perspective/lighting/quality. Do not mix portrait images into the background.

## 2026-10-29 — Riverside Park visual concept / geometry QA (candidate only)

- **Target:** `park` / Riverside Park, next after the previously generated apartment concept awaiting review. Existing approved Pixel Palace background remains untouched.
- **Source references:** [park blueprint](https://github.com/NicolasSorrenti/poketest/blob/main/overworld/maps/park-blueprint.svg), [manifest](https://github.com/NicolasSorrenti/poketest/blob/main/overworld/manifest.js), [approved arcade map](https://github.com/NicolasSorrenti/poketest/blob/main/rpg-assets/locations/arcade/overworld-map.webp).
- **Generated visual concept:** `neo_campus_riverside_park_candidate_v1.png` (conversation artifact, **not in GitHub**), **1536 × 1024 RGB**, elevated three-quarter/isometric painted-anime scene. Contains a riverside retaining wall along the lower edge, central fountain, paths, flowering plantings, benches, playground at upper left, pergola at upper right and notice board on right. No NPCs or RPG UI baked in. A second conversation artifact `neo_campus_riverside_park_anchor_review.png` overlays the current manifest geometry for QA.
- **Not safe to promote yet:** canonical master canvas is **1550 × 1120**; image is 1536 × 1024 and must be regenerated/reframed rather than stretched. The current manifest's waterfront hotspot is upper left, but the concept puts the river at the bottom and playground upper left. Flyer board is expected lower left, but appears on the right. Existing anchors E1/E3 intersect tree/railing and P3/P4 intersect benches near the fountain; these are not valid sprite foot placements. No manifest edits were made.
- **Pre-existing source inconsistency:** `park-blueprint.svg` schematic labels top-left Waterfront, top-right Path, bottom-left Benches and bottom-right Notice board, whereas `overworld/manifest.js` hotspot labels are top-left Waterfront, top-right Benches, bottom-left Flyer board, bottom-right Garden. **Manifest geometry/labels take precedence** until design review resolves the mismatch; do not use the SVG labels to silently remap interactions.
- **GitHub upload status:** Only the text handoff was committed. The generated PNG and QA overlay were retained as downloadable conversation files; local binary files cannot be passed directly into the available GitHub text-file write action. Do not claim an art asset is present on `main`.
- **Next priority:** revise `park` concept to align with the fixed 1550 × 1120 master map: waterfront upper-left, bench area upper-right, flyer board lower-left, flower garden lower-right; leave the center cross-path open and keep P1/P2/P3/P4 and E1–E4 clear. Review output with anchor overlay before any promotion. The apartment image is also still awaiting review, so neither is approved.

## 2026-10-29 — Riverside Park second image pass and anchor QA

- **One new park candidate** was generated, not promoted: conversation artifact `neo_campus_park_candidate_v2_master_1550x1120.png` (1550 × 1120 RGB). Source generation was 1536 × 1024; the center 1417 × 1024 was cropped and uniformly resized, preserving the required aspect ratio without stretching. Companion artifact: `neo_campus_park_candidate_v2_anchor_qa.png`, a 1550 × 1120 overlay with all eight manifest foot anchors and four hotspot rectangles.
- The candidate has attractive premium JRPG rendering but **fails the canonical layout**: water occupies the lower edge (E3/E4 are in water); a fountain occupies the central circulation area; the flyer board is on the right rather than lower-left; E1 overlaps a pergola; P1/P2 crowd the fountain planters. **Not safe to install**.
- Confirmed from [`overworld/prototype.js`](https://github.com/NicolasSorrenti/poketest/blob/main/overworld/prototype.js) that hotspot x/y are top-left coordinates. In [`overworld/manifest.js`](https://github.com/NicolasSorrenti/poketest/blob/main/overworld/manifest.js), both park right-side hotspot rectangles end at x=1740 on a 1550px map, clipping 190px. Geometry adjustment belongs to a separate validated change, not an unreviewed art update.
- Added [precise park regeneration brief](https://github.com/NicolasSorrenti/poketest/blob/main/art-production/overworld-candidates/park-layout-brief-v2.md) with master coordinates, exact anchors, hotspot geometry, placement and image prompt. **Image files are available only in this conversation; they were not uploaded to GitHub.** No changes to Pixel Palace, the manifest, the approved character art, gameplay or original `rpg.html`.
- **Next:** regenerate `park` with upper-left waterfront, upper-right benches, lower-left flyer board, lower-right flower garden, and dry unobstructed floor at P1–P4/E1–E4; validate with anchor overlay before approval. Cafe remains next after park.
