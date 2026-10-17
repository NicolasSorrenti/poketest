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

### 0.7: Real player tournament brackets — THIS MILESTONE
- `rpg_tournaments.js`: fixed Day 30, Day 60 and Day 90 **eight-entrant single-elimination** cup structures. Three rounds of **real, authoritative Classic CPU duels** decide the player path. Other entrants' matches are deterministically simulated offscreen and recorded (this is not full TCG CPU-vs-CPU simulation).
- Neighborhood Cup, Regional Qualifier and Championship Finale now require winning actual bracket matches for championship trophies; earlier single-match exhibition rewards remain unchanged.
- **Optional qualification**: circuit points, local reputation, previous cup success or a paid wildcard offer routes into later tournaments. No mandatory story route gates progress.
- State fields `tournamentSessions` and `activeTournament` extend the same browser save key. Round, opponent, player results, NPC fixtures, trophy and entry fee survive reload.
- The bracket occupies **one total time period**; between rounds the town clock intentionally pauses, navigation/deck switching is locked and a dedicated "Next round" control remains enabled. Defeat ends the run, a draw replays the round, and the final result advances the time by one period. Double notifications cannot reapply rewards.
- New live `#bracketPanel` displays each opponent and round state, plus qualification/entry requirements. Added all client/server script links.
- 10 dedicated tournament-domain tests and 3 new browser-controller roundtrip tests; `npm run test:rpg` now includes them. Extended the HTTP regression suite to ensure all RPG public modules can be served.

## Tests and QA
- Added `tests/rpg_world.test.js` (11 tests), `tests/rpg_world_ui.test.js` (8 controller smoke tests) and `tests/rpg_rival_arc.test.js` (10 route tests).
- `npm run test:rpg` runs 53 focused regression tests including the existing 11 story/schedule checks; `.github/workflows/rpg-regression.yml` now runs it on relevant PRs and main pushes.
- **53/53 focused scenarios passed in an isolated JavaScript test run**, first in isolated JavaScript execution and then in the **native Node GitHub Actions RPG Regression Suite** on PR #15. All four rival episode windows and all 16 optional encounter windows are reachable; DOM IDs, script serving and save flows were checked.
- The broader **Node regression**, **RPG Chromium smoke** and **TCG Gameplay Regression** checks passed on the previous PR #15. Native CI for this new tournament milestone must be checked on its own PR before merging.
- Follow-up testing: a longer manual/Render playthrough across 90 days, mobile touch and narrow-screen usability, several live completed duels in varied locations, and confirming production art is installed where the browser expects it.

## Integration contracts
- The browser loads `rpg_story.js` → `rpg_schedules.js` → `rpg_world.js` → `rpg_rival_arc.js` → `rpg_tournaments.js` → `rpg_duel_bridge.js` → `rpg.js`.
- `NeoRpgWorld`: `hydrate(state)`, `activitiesAt(state)`, `doActivity(state,id,people)`, `availableEncounters(state,people)`, `completeEncounter(state,id,index,people)`, `newDay(state,days)`, `afterDuel(state,receipt)`, `validate()`.
- `NeoRpgRivalArc`: `hydrate(state)`, `available(state,people)`, `linesFor(state,id)`, `finish(state,id,index,people)`, `settleDuel(state,id,receipt)`, `validate()`. Trials store `arcEpisode` on the pending Classic duel; its authoritative result is applied once before the RPG clock advances.
- `NeoRpgTournaments`: `cupForDay(day)`, `entry(state,id)`, `begin(state,id)`, `active(state)`, `nextMatch(state)`, `settle(state,receipt,duel)`, `hydrate(state)`, `validate()`. A pending tournament duel carries `tournamentId` and `tournamentRound`; the bridge receipt is applied to the session before the town clock advances. Competition NPC matches outside the player path are saved rating-based simulations, not calls to the TCG engine.
- World functions mutate only the RPG save object; the controller advances the clock afterward. For NPC bond changes, `relationships` and legacy `bonds` are updated consistently.
- All dialogue and custom event IDs are fixed ASCII strings. No copyrighted Tag Force content or external sprites were added.

## Prioritized continuation
1. Extend the verified optional character-specific duel-and-choice episode format to the other seven heroines, preserving their established personalities and existing route events.
2. Expand tournament presentation (full NPC bracket map, standings, seasonal circuit leaderboard) and eventually replace offscreen NPC result simulation with actual CPU-vs-CPU game execution where feasible.
3. Introduce a persistent card collection/shop inventory economy and deck legality integration with the existing TCG deck APIs.
4. Complete personal and campaign endings, plus a replay/NG+ flow.
5. Keep expanding tests (especially browser/Render end-to-end); coordinate shared `server.js` and `package.json` edits with other agents.

## Handoff
Start from current `main` and review recent changes from other agents before editing. Keep changes RPG-scoped, use feature branches and PRs, and update this file on every milestone. Preserve gameplay freedom: dueling, social stories and activities are alternate meaningful paths, not a compulsory main quest.
