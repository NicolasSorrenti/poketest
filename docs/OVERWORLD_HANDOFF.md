# Neo Campus overworld handoff

Updated: 2026-10-28 (Buenos Aires). Source of truth for the Pixel Palace prototype; the existing RPG route remains unchanged.

## Current milestone

- `/overworld-prototype.html` uses the approved `rpg-assets/locations/arcade/overworld-map.webp` at its native 1550 × 1120 aspect ratio.
- Reina's approved standing sprite and new character-only playing pose are configured in `overworld/manifest.js`; no cabinet is baked into the new pose. Default preview shows her playing the north-west arcade cabinet at foot `(339, 287)`, height `152`. `?reina-test=1` displays both poses for comparison only.
- `?cast-test=1` shows eight sample placements to test camera indicators and missing-art fallbacks. The default preview does not show unapproved placeholder bodies for the rest of the cast.
- `?dev=1` exposes the Guides button. Guides visualize foot anchors and hotspot areas without obscuring normal play.
- Character positions, sprite source, independent height, facing, hand offset and face portrait are configured separately. Missing sprites show a letter silhouette; off-screen navigation uses a separate face image.
- Hotspots are map coordinates and currently open only a preview message. No campaign state, save, dialogue, or duel code is invoked.

## Design decisions

- Maintain the full, continuous approved Pixel Palace image. Use master-image coordinates and bottom/foot anchored sprite placement. Keep map proportions across screen sizes.
- Keep full-body overworld sprites separate from VN portraits and face thumbnails. Face portraits are used only for edge navigation and the preview panel.
- `arcade` is the canonical location ID from `rpg.js`; other actual playable IDs are `home`, `shop`, `park`, `cafe`, `center`, `library`. The art pipeline must use these IDs. The prompt's workshop, school, beach and pool are not currently separate locations in this registry.
- The existing RPG's `places`, schedules, state machine, dialogue, battle, and autosave remain authoritative. Do not make this preview a parallel campaign engine.

## Asset inventory

| Asset | State | Location / next action |
| --- | --- | --- |
| Pixel Palace clean background | Approved, present | `rpg-assets/locations/arcade/overworld-map.webp` |
| Reina standing | Present | `rpg-assets/characters/reina/overworld/standing.png` |
| Reina playing, character only | Supplied and integrated | `rpg-assets/characters/reina/overworld/arcade-playing-character.png` |
| Reina old back pose | Present, unused | `rpg-assets/characters/reina/overworld/arcade-back.png`; avoid using its baked cabinet |
| Yuna, Barb, Jinx, Hana, Laca, Daisy, Rina | Face/VN art exists; no verified standalone full-body overworld sprites | Produce and approve one sprite per character, starting with Yuna |
| Akari, Shiori, Marina, Camila, Kaede, Luna, Sierra, Sol, Elena, Alma, Jun, Teo, Iris, Elio, Nereo | Overworld sprites not verified | Audit current canonical identity art before commissioning each sprite |
| Other location overworld backgrounds | Not verified | Blueprint each canonical location before commissioning background art |

## Exact next artwork request for the design conversation

**Yuna standing overworld sprite:** Use the approved canonical Yuna design from the repository as the identity reference. Premium modern anime JRPG illustration, clean linework, soft cel shading, slightly elevated three-quarter view matching Pixel Palace. Full body from head to shoes, natural standing pose, strong silhouette when displayed at about 155 logical pixels high. Transparent RGBA background with no floor, furniture, arcade machine, shadows on a backdrop, labels, text, UI or other characters. Preserve her established outfit, hair, proportions and accessories. Export a clean PNG with transparent corners and no broad translucent halo. Suggested destination: `rpg-assets/characters/yuna/overworld/standing.png`. Supply the PNG for review before it is marked approved.

**Future backgrounds:** Start with a spatial blueprint (logical width/height, entrances, furniture footprints, walkable floor, character foot anchors and interaction rectangles). Generate an environment-only continuous elevated three-quarter JRPG view from that blueprint. Compare the output to the blueprint and recalibrate every anchor against the actual image. Use the canonical IDs `shop`, `cafe`, `library`, `park`, `center`, `home` rather than creating new locations.

## Integration checklist and open decisions

1. Review Reina's playing pose on actual mobile portrait and desktop previews; adjust only the manifest foot coordinate and height if necessary. Her hands are approximately 22 pixels right and 95 pixels above the foot anchor in the current configuration.
2. Add approved standing sprites for the rest of the cast. Do not promote VN art to an overworld sprite as a final replacement.
3. Bridge the map to the existing `rpg.js` presence/schedule and character interaction actions behind a feature flag. Map pan and travel must stop while a scene, choice, activity or duel is active. Keep current autosave and scene completion paths.
4. Replace preview-only hotspot messages with existing RPG activity calls when the feature flag is ready. Confirm time advancement, events, CGs, discreet mode, and save continuity.
5. User review is needed before replacing `/rpg.html` or treating new artwork as approved. No question blocks the isolated preview work.

## Verification log

- Image dimensions and alpha inspected with Pillow: map 1550 × 1120 RGB; Reina playing 1024 × 1536 RGBA with transparent corners and over one million fully transparent pixels.
- JavaScript syntax checks and local HTTP/image response checks are part of this milestone. Browser and Render status are recorded separately in the delivery report; a build alone does not establish visual correctness.
- `node --test tests/overworld_preview.test.js`: 3 passed; `tests/rpg_bootstrap_dependency.test.js` and `tests/rpg_public_scripts.test.js`: 5 passed; `npm run build`: passed.
- Local HTTP served prototype, manifest, JavaScript, CSS, map, Reina pose and unchanged RPG HTML with status 200.
- Browser rendering and touch/drag behavior have **not** been verified: local Playwright browser download failed. Visual alignment and full RPG playthrough require a live preview and device testing.

## Art candidate round (not approved, 2026-10-28 Buenos Aires)

Three newly generated candidates are stored only under `art-production/overworld-candidates/` and are shown only with explicit preview query parameters. They are **not** canonical game assets:

| Candidate | Path | Review URL after deployment | Review focus |
| --- | --- | --- | --- |
| Yuna standing | `yuna-standing-v1.png` | `/overworld-prototype.html?art-test=1` | Confirm outfit, scale, fishnet black patch artifacts, silhouette and alpha edge. |
| Barb standing | `barb-standing-v1.png` | `/overworld-prototype.html?art-test=1` | Confirm 161 cm relative height, outfit, tattoo, hat, face and alpha edge. |
| Lucky Draw shop | `shop-map-v1.png` | `/overworld-prototype.html?shop-test=1` | Confirm store identity, warm daylight, open floor and furniture placement. |

The shop concept was generated from the canonical `shop-day.webp` panorama and the approved Pixel Palace camera/style reference. Actual output is **1475 × 1066**, preserving the 1550:1120 blueprint ratio; the preview uses native dimensions. `shop-blueprint.json` holds proposed spatial zones and anchors. The manifest's candidate shop anchors/hotspots were recalibrated against the generated image, but they are provisional until mobile/desktop inspection.

**Generation prompts for review/reproduction:**
- Yuna: canonical `streetwear-preview.png` and `portraits/primary.png` as identity references; full-body relaxed three-quarter standing pose, exact blue twin tails, yellow bows, headphones, yellow/blue jacket, black top/shorts, one fishnet leg, gloves and sneakers; isolated transparent cutout without furniture or text. The first render had dark stocking marks; the candidate is the refinement, but residual dark patches still need review.
- Barb: `barb_character_bible.webp` and `portraits/primary.png` as identity references; adult 161 cm petite figure in the default black cap, lace-up top, pleated skirt, bow stockings, boots, shoulder bag, jewelry and left-arm floral tattoo; relaxed three-quarter standing, transparent character-only cutout.
- Shop: `shop-day.webp` for Lucky Draw identity, approved `arcade/overworld-map.webp` for continuous camera perspective; rear/left card shelves, rear-right sales counter, upper-right windows, open central floor for four characters, lower-center card tables, lower-left lounge; no people, UI, markers or illegible signage.

**Design conversation request:** Review the three candidate images side by side in their preview routes. Approve or identify specific corrections to (1) Yuna's stocking/accessories and transparency edge, (2) Barb's relative scale and default outfit, and (3) the Lucky Draw furniture layout and shop identity. Approved versions can then move to canonical `rpg-assets/characters/<id>/overworld/standing.png` and `rpg-assets/locations/shop/overworld-map.webp`; do not promote these candidates automatically.

## Identity conflict to resolve before Jinx art

`rpg-assets/characters/jinx/reference/jinx_character_sheet_01.png` shows dark purple hair with magenta accents. `rpg-assets/characters/jinx/neutral.png` shows white hair with pink accents and a different outfit. Ask the design conversation which hair and outfit are current canon for the overworld standing sprite. Do not generate or register Jinx until that is settled.

## 2026-10-29 — RPG overworld phase 1
- `rpg.js`: `NeoRpgOverworldBridge.snapshot()` exposes current location, date/slot and scheduled NPCs; `travel(id)` reuses the guarded native `travelTo` function.
- `rpg-overworld-integration.js`: opt-in **OVERWORLD** toolbar button; same-page map overlay and native location travel dropdown. Existing RPG UI is retained.
- `rpg.html` loads optional adapter; `overworld/prototype.js` supports `?rpg-integration=1&cast=<ids>` for schedule-aligned NPC preview.
- Scope limit: NPC and hotspot clicks still use preview behavior; they are not yet wired to the main story or action system.
- Deployment QA: confirm button appears, open/close overlay, correct current location and NPCs, travel updates RPG and remains disabled in ongoing story/duels, desktop/mobile navigation, no interference with cloud save.
- Next: bridge character click to native dialogue/battle buttons and hotspots to original activity controller, preserving event locks. Final art and sprite path cleanup remain separate.

## 2026-10-29 — native action wiring (phase 2)
- Map character clicks now post a same-origin message to the RPG and invoke `selectPerson(id)` through `NeoRpgOverworldBridge.interact`, checking active locks and current scheduled roster.
- Map hotspots list currently eligible native `WORLD.activitiesAt(state)` entries and run the existing `performActivity(id)` (including native time confirmation and rewards). They are currently generic per-scene activity selectors, not individually assigned to spatial furniture.
- Overworld footer Activities/Events/Deck/Status now links to corresponding native RPG controls/sections.
- Same-origin + iframe-window checks protect message handling. Native travel remains the only source of campaign state changes.
- Syntax checked via JS parser for `rpg.js`, `rpg-overworld-integration.js`, `overworld/prototype.js`. Browser gameplay and deploy have not been verified.
- TODO: responsive browser QA, test dialogue and duel locks; later align zone-to-activity relevance and NPC sprite placements.

## 2026-10-29 — Phase 2 NPC and hotspot interactions
- The current RPG bridge implements `interact(id)`, `activities()` and `activity(id)` using the original `selectPerson`, `WORLD.activitiesAt` and `performActivity` pathways.
- The iframe preview posts `neo-overworld-action` messages for person and hotspot clicks; parent adapter validates same-origin and frame source before invoking the RPG bridge.
- Sprite-unregistered scheduled NPCs are now retained in the integrated map and shown with a fallback character marker (`8013df75`). This means missing character art does not hide in-game NPCs.
- Still needs a live deployed desktop/mobile playthrough. Current Render status was behind latest `main` as of this edit; do not equate GitHub commit with deployment.
