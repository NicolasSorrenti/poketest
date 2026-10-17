# RPG / VN Agent Status — 2026-10-17

## Ownership and safety
The RPG/VN agent owns `rpg.js`, `rpg_story.js`, `rpg_schedules.js`, `rpg_world.js`, related HTML/CSS and tests. The Classic Pokémon TCG engine and card-rule modules are owned by other agents and must not be changed here. Adult character definitions, established dialogue, personal stories and existing browser saves must be preserved.

## Implemented milestones

### 0.4: Narrative foundation and readable time
- 90-day season with three periods/day, explicit home, time controls and calendar.
- Eight adult heroine definitions and 32 connected/missable story scenes with independent romance/friendship options.
- Persistent player relationships, choice flags and the Classic duel bridge.
- Single-match exhibition events use real Classic CPU duels. Tournament brackets/standings are **not** implemented.

### 0.4.1: Living schedules — PR #13
- `rpg_schedules.js`: seven days × three slots for all eight heroines, with rotating weeks, Kaede arrival gate and scene overrides.
- Exports `locationFor`, `peopleAt`, `itinerary`, `nextVisit`, `validate`.
- NPC dialogue exposes upcoming availability; the map's radar now points to the **actual** current scheduled place, not a broad list of possible venues.

### 0.5: Town Life and Discoverable Encounters — THIS MILESTONE
- `rpg_world.js`: 14 location-specific activities across **all seven places**, with costs, one-completion-per-day limits, resource effects and optional relationship bonuses if a relevant NPC is actually present.
- Resources: focus (recovers on new days), insight, local reputation and duel preparation. Every metric persists in the same `neoHarborRpgV1` save. No save reset or key change required.
- Duel preparation is a modest **campaign-only** bonus: one prepared charge can add 5 credits on a victory. It does not alter battle mechanics.
- 16 optional, time-limited, choice-driven local encounters; meaningful affiliation/credit/focus/reputation effects, no spoilers in the journal, no repeat completion, and save/load while a dialogue is open.
- Dedicated Town Life dashboard and Local Encounters sidebar on `rpg.html`; world resources and activity requirements are visible. The old generic shop-work/study UI actions have been replaced by appropriate venue-specific choices.
- Corrected "Around Town Now" radar and location people counts to use the actual schedule, preventing misleading navigation.
- `rpg_world.js` public script is allowlisted in the Node server; no broad JS access opened.

### 0.6: Optional Reina rivalry arc — THIS MILESTONE
- `rpg_rival_arc.js`: a complete optional four-episode character-specific mini-arc complementing, not replacing, the established four Reina relationship events.
- Unlock conditions use actual completed duels with Reina, growing bonds, earned reputation or insight; different playstyles can reach the private challenge. The storyline ends with an epilogue whose tone and friendship/romance status honor earlier choices.
- The pivotal private match is launched through the **authoritative Classic TCG bridge**; its real win/loss/draw affects trust, respect, dialogue and the persisted arc record. A defeat does not make the epilogue unreachable.
- Episodes persist as `arcFlags`, `arcOutcomes` and `activeArc` in the existing `neoHarborRpgV1` save. Legacy saves are repaired conservatively; an unfinished dialogue resumes after reload; duplicate battle notifications do not replay progress.
- Rivalry scenes appear in the existing Story Opportunities panel, preserving established travel/time and dialogue UX. Declining the optional challenge is free and permits trying again while its window remains open.
- Added `tests/rpg_rival_arc.test.js`, UI tests for route progression, a real bridged duel, and mid-dialogue save/reload, and an RPG-specific GitHub Actions workflow `.github/workflows/rpg-regression.yml`.

## Tests and QA
- Added `tests/rpg_world.test.js` (11 tests), `tests/rpg_world_ui.test.js` (8 controller smoke tests) and `tests/rpg_rival_arc.test.js` (10 route tests).
- `npm run test:rpg` runs 40 focused regression tests including the existing 11 story/schedule checks; `.github/workflows/rpg-regression.yml` now runs it on relevant PRs and main pushes.
- **40/40 scenarios passed** in isolated JavaScript execution of actual source/test contents through a test shim; syntax, graph consistency, DOM ID bindings and all 16 encounter reachability windows also checked. This is **not** a claim of a completed native Node test run or a real-browser Render playthrough.
- Need follow-up testing: `npm run test:rpg` in an actual checkout, mobile browser responsiveness, real TCG completed duel end-to-end, performance/save behavior across 90 days, and missing art files if the user has not committed the art ZIP.

## Integration contracts
- The browser loads `rpg_story.js` → `rpg_schedules.js` → `rpg_world.js` → `rpg_rival_arc.js` → `rpg_duel_bridge.js` → `rpg.js`.
- `NeoRpgWorld`: `hydrate(state)`, `activitiesAt(state)`, `doActivity(state,id,people)`, `availableEncounters(state,people)`, `completeEncounter(state,id,index,people)`, `newDay(state,days)`, `afterDuel(state,receipt)`, `validate()`.
- `NeoRpgRivalArc`: `hydrate(state)`, `available(state,people)`, `linesFor(state,id)`, `finish(state,id,index,people)`, `settleDuel(state,id,receipt)`, `validate()`. Trials store `arcEpisode` on the pending Classic duel; its authoritative result is applied once before the RPG clock advances.
- World functions mutate only the RPG save object; the controller advances the clock afterward. For NPC bond changes, `relationships` and legacy `bonds` are updated consistently.
- All dialogue and custom event IDs are fixed ASCII strings. No copyrighted Tag Force content or external sprites were added.

## Prioritized continuation
1. Extend the verified optional character-specific duel-and-choice episode format to the other seven heroines, preserving their established personalities and existing route events.
2. Improve chapter milestones and actual in-game tournament brackets with bracket progress based on authoritative duel results, not automatic awards.
3. Introduce a persistent card collection/shop inventory economy and deck legality integration with the existing TCG deck APIs.
4. Complete personal and campaign endings, plus a replay/NG+ flow.
5. Keep expanding tests (especially browser/Render end-to-end); coordinate shared `server.js` and `package.json` edits with other agents.

## Handoff
Start from current `main` and review recent changes from other agents before editing. Keep changes RPG-scoped, use feature branches and PRs, and update this file on every milestone. Preserve gameplay freedom: dueling, social stories and activities are alternate meaningful paths, not a compulsory main quest.
