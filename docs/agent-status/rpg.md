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
- **40/40 focused scenarios passed**, first in isolated JavaScript execution and then in the **native Node GitHub Actions RPG Regression Suite** on PR #15. All four rival episode windows and all 16 optional encounter windows are reachable; DOM IDs, script serving and save flows were checked.
- The broader **Node regression**, **RPG Chromium smoke** and **TCG Gameplay Regression** checks on PR #15 also passed after modernizing the legacy RPG flow/save test fixtures to load the real set of client modules.
- Follow-up testing: a longer manual/Render playthrough across 90 days, mobile touch and narrow-screen usability, several live completed duels in varied locations, and confirming production art is installed where the browser expects it.

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


### 2026-10-18: Three-round tournament bracket milestone
- Added \`rpg_tournaments.js\` with three separate, persistent, three-round cups: Neighborhood Cup (days 30–35), Regional Qualifier (days 60–67), Championship Bracket (days 88–90). Each has a fixed opponent sequence drawn from the established eight heroines.
- The town activity panel offers the next bracket round when the player is at the Community Center within the cup's active dates. Matches launch the existing authoritative Classic CPU duel; win/loss/draw is derived only from its result.
- A win advances to the next round and grants the round's tournament points/credits. A loss eliminates the player; a draw permits a rematch. Duplicate match notifications cannot award bonuses twice because settlement verifies the current round.
- Progress lives in \`state.tournaments\` under the existing \`neoHarborRpgV1\` save key. Registration windows expire, and unfinished brackets are marked expired. Old single-match exhibition activities on these three event dates are superseded by the brackets; other exhibition events remain available.
- Added \`tests/rpg_tournaments.test.js\` with seven cases covering advancement, duplicate settlement, losses, draws, JSON save/load, missed registration and championship expiry.
- Checked JS syntax, HTML module loading, server whitelist and a simulated three-round championship victory sequence. **Not yet run:** full browser/Render match playthrough and the complete CI suite for this branch.
- Integration contract: \`NeoRpgTournaments\` exposes \`hydrate\`, \`available\`, \`begin\`, \`settle\`, \`status\`, \`expire\`, \`validate\`. \`begin\` creates a descriptor for the existing \`startDuel\`; \`settle\` runs only after the authoritative Classic receipt. No card rules are duplicated.

### Next priorities
1. Show full bracket progress and outcome details in the calendar/side panel, and test long-running browser playthroughs.
2. Add alternative participation and consolation paths for eliminated or late-arriving players; avoid hard-blocking social progression.
3. Expand seven additional optional duel-and-choice character arcs.
4. Integrate the shop and persistent card collection with existing deck APIs.
5. Final campaign results, endings and replay support.


### Tournament bracket milestone — controller/UI hardening (2026-10-18)
- Player-visible tournament progress now appears in the right sidebar and the public circuit calendar. Three markers reflect cleared rounds, the upcoming opponent, champion/defeat state, and registration deadlines.
- Existing character-themed single-match exhibitions remain separate; the three new cups use persistent three-round player paths with actual Classic CPU matches. This is **not yet a full 8-player simulated elimination tree**, and NPC-versus-NPC matches are not simulated.
- A per-cup attempt sequence identifies individual duels, including draws. Repeated settlement of a draw returns no result; duplicate Classic callbacks remain guarded by the existing duel bridge.
- Match receipts include tournament points/credits in reported totals. Legacy saves are handled through optional tournament fields and hydration.
- The main RPG regression script now includes tests/rpg_tournaments.test.js. Both previously used browser-controller test fixtures load the tournament module.
- Added three controller integration cases (three wins and rewards, elimination with continued free exploration, drawn-round retry) and two module cases (draw idempotency and invalid receipt), in addition to the original seven tournament tests.
- **Local verification:** 20 focused tournament/UI tests passed using the source test fixtures in an isolated JavaScript execution harness; JavaScript parses. GitHub Actions full Node CI and live browser/Render end-to-end checks are not yet confirmed.
- Next priorities: make NPC fixtures and bracket seeding visible if building full elimination trees; add participation after elimination, more personal routes, and eventually campaign endings.
