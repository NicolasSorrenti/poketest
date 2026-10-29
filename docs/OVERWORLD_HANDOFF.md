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

## 2026-10-29 — native screen handoff fix
- Map overlay dismisses before native NPC interaction and activity execution, preventing native dialogue / time confirmations from appearing behind it.
- Successful travel dismisses the map immediately because first-visit or mandatory event narration can start during travel.
- Stale activity choice panels are removed on dismiss or before opening another panel.
- Cache-busting script version updated in rpg.html. JavaScript parse checks passed for main bridge/adapter/prototype.
- **Not yet browser tested or deployed** as of this edit; avoid calling integration production-verified.

## 2026-10-29 — battle-return and story-dock stability
- The separate Overworld RPG now embeds the original `.stage-panel` in a map story dock, reusing native dialogue, choices and scene CG rendering.
- Map iframe only reloads when scene, cast roster, or chibi toggle actually changes.
- Back/close buttons respect active story locks.
- The existing full-screen `#duel` layer temporarily suppresses the map overlay; a `MutationObserver` restores the overworld when the battle ends, then refreshes its schedule and displays active story if present.
- Changes committed through `cea5d1ad`. JavaScript syntax checked; **no browser gameplay verification yet**. Test duel→rewards→map and mandatory events during travel.

## 2026-10-29 — map-based VN layout
- Standalone Overworld RPG reuses live `.stage-panel` inside `#neoOverworldStoryDock` instead of copying conversation state.
- Overworld-only injected CSS removes old scene backdrop/header, keeps the map visible behind portraits, CGs, dialogue, response choices and selected-character actions. Mobile panel sizing included.
- Original `/rpg.html` is not modified. `/rpg-overworld.html` cache query bumped for the integration script.
- Syntax validated; gameplay and layout still need deployment/browser QA, especially story completion, multiple CGs, discreet-mode chibi presentation, pre-duel screens and rewards.

## 2026-10-29 — dialogue, choices and CG lifecycle
- Dedicated overworld controller observes changes to the native `#line`, `#speaker`, `#choices`, `#characterActions`, and `#rpgSceneCG` DOM nodes to show and hide its VN dock without copying narrative state.
- Idle placeholder `The town is waiting.` does not keep the conversation panel open after a completed dialogue.
- After NPC interaction, an activity, travel, and battle return, UI synchronizes to native state. Native modal CG / reward dialogs remain controlled by the RPG engine.
- GitHub `main` commit `334f41f1`; JS syntax passed. Browser end-to-end verification remains required, especially mandatory dialogues, CG modal sequences, and post-duel rewards.

## 2026-10-29 — Reina full-journey audit, arrival interaction guard
- Audited the shared overworld bridge and presentation adapter. Identified that travel arrival/first-meeting chime-ins were not counted as an interaction lock, allowing premature NPC clicks or activity starts.
- Bridge `snapshot().locked`, `travel`, `interact`, and `activity` now guard `arrivalGate`, `pendingOverworldArrival` and active travel transitions. `snapshot().arriving` distinguishes arrival animation from actual story dialogue so the new dialogue panel does not open just because an arrival is playing.
- Updated JS cache versions and syntax-checked changed files. **Full end-to-end browser journey is still unverified**, especially CG→duel→pack rewards→overworld. No claim of deployed/live QA.

## 2026-10-29 — approved compact travel and What's next navigation

- Overworld main header now shows the **current location** and **Day / Morning-Afternoon-Evening**, plus the hamburger menu; removed the always-present top travel dropdown and button.
- The bottom row above Activities / Events / Deck / Status contains only two equal-width compact triggers: **What's next?** and **Travel**. Both are collapsed by default, and only one expands at once.
- Travel opens a scrollable illustrated destination grid based on `NeoRpgOverworldBridge.snapshot().places`. The active location is marked and disabled; travel requests continue through the existing RPG bridge, retaining state/arrival guards.
- What's next reuses the live `#dailyPlanner` DOM with its existing action handlers. When the panel closes, the original planner element is restored to its home in the RPG stage (no duplicate planner state).
- The expanded sheet collapses on selecting a destination, starting a story/dialogue, closing via Escape/close/outside tap, or opening the game menu/another panel. CG and dialogue overlays hide all bottom navigation as before.
- Integrated `/overworld-prototype.html?rpg-integration=1` now hides its redundant preview location header/footer; standalone prototype keeps them.
- Desktop/mobile CSS supports a scrollable panel and safe-area insets. Latest code commits `0c48789`, `abcb421`, `f1fd9a4`, `7f96215`; **browser end-to-end verification remains outstanding**.

## 2026-10-29 — Mobile dialogue/arrival regression corrections

User screenshot (Riverside Park, Day 32 Evening) established four defects: duplicate Reina portraits, undersized VN bust artwork, original RPG interaction panel appearing after dialogue, and mandatory/entry-event dialogue not taking precedence over exploration controls.

- `rpg-overworld-integration.js` now **hides the native `#portrait`** while the overworld's character-only speaker layer renders. Each portrait fills about **40vw**, maximum **two**, so a pair occupies roughly 80vw.
- The UI uses `NeoRpgSceneCast.createSpeakerWindow()`: when a third (or later) participant speaks, the least-recently-speaking of the two visible portraits is replaced; all scripted participants are eligible, not just the first four.
- `hideStory()` no longer reparents the live `.stage-panel` back to the classic RPG after each conversation. The existing stage remains mounted in the *hidden* overworld dock between scenes. Only explicit `dismiss()` restores the original stage.
- The overworld bridge now exposes explicit `storyActive`/`eventActive`. On each real RPG `render()` (including the early-return travel transition path), it dispatches `neo-rpg-overworld-render`. The adapter listens and prioritizes forced events, dialogues and CGs ahead of the map UI. **Character action buttons alone never keep a story panel open.**
- In arrival-only transitions the map controls are hidden/blocked; scripted entry events show the native scene even while the arrival gate is settling. Regular map controls return after the scene is done.
- `tests/rpg_scene_cast.test.js` includes two-person/third-speaker/narrator/fifth-speaker rotation regression cases; JavaScript syntax and manual in-memory speaker-window simulations passed. **Real browser playthrough remains to be verified** on mobile for forced arrivals, CGs, and transition back to the map.
- Original `/rpg.html` stays separate; render behavior is notified only on the standalone overworld route.

## 2026-10-29 — Overworld duplicate portrait and Activities stacking regression fixes

- **Cause of duplicated character artwork:** the standalone RPG was still building native `#portrait` and dynamically generated `#rpgSceneCast` even after the overworld introduced its own two-character VN portrait layer. For `NeoRpgOverworldStandalone`, `rpg.js` now skips creation of both legacy visual portrait collections while still calculating canonical scene participants for the new renderer.
- **Cause of the old UI reappearing:** `hideStory()` still reparented the live native `.stage-panel` into the old page layout. It now keeps that stage in the hidden overworld dock; explicit `dismiss()` alone restores it.
- **Map sprites during VN:** the parent overworld adapter sends a same-origin `neo-overworld-story-visibility` message to the embedded map, including on iframe reload. Its CSS hides the map NPCs, edge portraits and hotspots (not the environmental background) during an active dialogue or CG.
- **Activities modal:** an old activity panel had `z-index:2` underneath the new bottom navigation (`z-index:4`). It now opens as a foreground dialog (`z-index:12`) with a full-screen backdrop (`z-index:11`), prevents interaction with the map behind, hides the bottom bar, supports tap-outside, Close and Escape.
- **Regression tests:** `tests/rpg_overworld_layering.test.js` has five checks for stage parenting, legacy portrait suppression, embedded map visibility, activity layering and cache refresh. All five executed successfully in an isolated JavaScript test harness; full live mobile/browser validation remains needed.
- **UI work committed to main:** `50959239`, `9df1aa70`, `03b70c5a`, `ed9fb7e0`, `f4cad4f5` plus asset version bumps and regression tests. Original `/rpg.html` presentation is preserved by the standalone-only condition.

## 2026-10-29 — Fixed dialogue height, paging, and persistent character actions

- User requested stable text height: **2 visible dialogue lines on PC and 3 on mobile**. `rpg_overworld_text_pages.js` measures the current font and width and splits long native lines into separate visual pages; `rpg-overworld-integration.js` fixes `#dialogue` height and `#line` to 2/3 line-height. A temporary `Continue ›` is displayed until the final page. Native `#choices` and scripted event-choice panels are hidden until all text has been read. Space/Enter goes to the next text page first; the RPG engine itself is not advanced until the final page's actual native action.
- On explicitly tapping an NPC, `interactionFocus` persists through ordinary talk; after `closeSceneDialogue()` the native state still retains `state.selected`, and the overworld keeps the selected canonical portrait visible. The native `#characterActions` Talk / Duel / Spend Time / Make Plans / Scout buttons appear automatically in a compact grid. This state hides the text box, rather than showing the idle narrator placeholder. `Back to map` calls `NeoRpgOverworldBridge.clearInteraction()`, clears selection safely, and restores map controls. Forced events and conversations continue to take precedence over this idle interaction state.
- The bridge exposes `dialogueText()`, `portrait(id)`, `clearInteraction()` and `snapshot().selected` for native state/portrait sources. No separate story or duel system is introduced.
- Added `tests/rpg_overworld_dialogue_pages.test.js` (five checks) covering desktop/mobile measured pagination, no text loss including long words, no premature story advance, persistent post-talk selection/actions, and script allowlisting/cache versions. The five assertions were exercised in an isolated JS test harness; Javascript syntax verified. Live browser visual QA is still needed.

## 2026-10-29 — Responsive floating player-response choices (approved visual direction)

- The user approved keeping the low fixed-height dialogue box and placing **choice options separately** to make use of unused scene space: on wide desktop with one character, a compact option panel floats **beside the portrait**; with two speakers / CG, or on mobile, the choice panel is **centered above** the dialogue box.
- The adapter reparents the existing native `#playerChoicePrompt` into `#neoOverworldOverlay` (not `#dialogue` or the scrollable stage dock), preserving event-specific buttons and their original click handlers. Ordinary non-prompt decisions with >1 choice are likewise moved by DOM reference to `#neoOverworldGenericChoices`. One-button Continue stays in the speech box.
- A **Hide choices** action inside the panel collapses the options; a small **Show choices** pill near the bottom dialogue reopens the same buttons without selecting an option or advancing dialogue/CG state. Escape hides options first. When the original RPG is explicitly opened, the reparented native prompt and choice list return to their original DOM homes.
- The choice panel is suppressed until all 2-line desktop / 3-line mobile dialogue text pages have been read. New story content resets the collapsed state. The existing scene-map lock remains active while responses are hidden.
- `tests/rpg_overworld_choice_layout.test.js` adds five regression cases for native handler preservation, generic choices, Hide/Show, responsive placement and Escape. Together with previous Overworld dialogue/layering checks, **15/15 static and unit-like checks passed** in an isolated JavaScript evaluator. Browser screenshot and full interaction testing on the deployed site are still outstanding.

## 2026-10-29 — map upload path investigation and automatic artwork detection

- Inspected **all 3,483 entries in GitHub main's tree**. Only `rpg-assets/locations/arcade/overworld-map.webp` exists as a production background under `rpg-assets/locations/`. Other large location candidate paintings referenced in `docs/OVERWORLD_ART_HANDOFF.md` are not present as files in main. The shop candidate `art-production/overworld-candidates/shop-map-v1.png` is present and still explicitly mapped; it remains unapproved.
- Five scenes (`home`, `park`, `cafe`, `center`, `library`) still use `/overworld/maps/*-blueprint.svg` in the manifest. Uploading a finished image without wiring the manifest never made it show.
- `overworld/prototype.js` now probes `/rpg-assets/locations/<scene-id>/overworld-map.webp`, `.png`, `.jpg` for blueprint scenes and falls back to the original SVG if none exist. The app therefore picks up the conventional files once actually committed to main and deployed. Pixel Palace and shop remain unchanged; dimensions/anchors remain in `overworld/manifest.js` (1550×1120 for the five blueprints). A missing asset never leaves an empty map silently.
- New regression tests: `tests/rpg_overworld_map_loader.test.js`: 4/4 checks passed. **No missing background artwork was manufactured or promoted**, because the files are absent from main and many candidates still have failed placement QA. Browser validation is still required.
- To add a map: put a verified 1550×1120 final image under `rpg-assets/locations/home/overworld-map.webp` (similarly `park`, `cafe`, `center`, `library`); commit the binary to main and deploy. Check each scene's hotspot/foot anchors before treating the art as final.

## 2026-10-29 — six user-uploaded maps installed + interactive placement QA

- The user pushed six background images to GitHub main at `rpg-assets/locations/{home,park,cafe,center,library,shop}/overworld-map-candidate-20261029.webp`. **These are now the exact images mapped by `overworld/manifest.js`**, replacing the five blueprint paths and previous shop v1 candidate; Pixel Palace remains unchanged.
- The previous automatic loader only probed `overworld-map.webp/png/jpg`, which could never find the actual suffixed filenames. The explicit manifest image path fixes this without renaming or rewriting approved artwork.
- All existing NPC anchors, camera framing and hotspot coordinates remain the **initial placement baseline**. Do not claim pixel-level clearance calibration without reviewing these specific uploaded paintings. The prior art handoff contains warnings about some conceptual placements; this integration is meant for player preview and visual review first.
- Added layout QA mode: `/overworld-prototype.html?scene=home&dev=1` (replace `home` with `park`, `cafe`, `center`, `library`, `shop`). It overlays draggable NPC foot anchor markers and hotspot rectangles; data persists only in local browser storage, and **Copy layout JSON** exports all coordinates for a reviewed permanent map update. `Clear saved adjustments` resets the local draft. Embedded RPG gameplay ignores editor overrides.
- Hotspot hitboxes are bounded to the image canvas even when legacy blueprint positions fall outside its visible extents. The finished six-map layout will require checking each scene for walkable floor and real furniture/service landmarks. Copying the editor JSON is preferred to guessing geometry from filenames.
- `tests/rpg_overworld_map_loader.test.js`: 5 focused checks pass for all six image paths, preserved Pixel Palace, runtime map selection and isolated development editor. Full browser QA and Render deployment remain outstanding.

## 2026-10-29 — Next maps: Riverside Park and Rest Stop placement groundwork

- Park and Café both had legacy blueprint hotspot IDs `a,b,c,d` and right-side bounding boxes ending at x=1740 on 1550-wide maps. The manifest now uses stable semantic IDs: Park `waterfront`, `benches`, `flyer-board`, `garden`; Café `counter`, `strategy-tables`, `window-seats`, `coffee-station`. Each zone now fits inside the map. User-uploaded images and all NPC anchors remain unchanged.
- The `?dev=1` map layout editor now has an orange bottom-right resize handle per hotspot, in addition to dragging hotspots and blue NPC foot markers. Width/height are clamped to the image, locally saved, and included in `Copy layout JSON`. These are QA tools, not changes to historical campaign logic.
- Structural checks passed: all eight Park/Café hotspots have meaningful IDs and fit within their image bounds; JavaScript syntax and asset cache versions valid. Fine-grained placement against the painted furniture, clear NPC sprite envelopes, and walkable regions **have not been verified visually** and must not be described as finalized. Advance in order Park → Café → Center → Library → Home, with images in `rpg-assets/locations/<id>/overworld-map-candidate-20261029.webp`.
- Deployment source is **Cloudflare Pages**, not Render. Original `rpg.html` and Pixel Palace untouched.
