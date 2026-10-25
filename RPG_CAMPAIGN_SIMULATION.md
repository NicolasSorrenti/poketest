# RPG Campaign Consistency & 90-Day Simulation

This package adds a deterministic, read-only **headless campaign simulator** for Neo Harbor's 90-day RPG.

## Run

```bash
node rpg_campaign_simulator.js all
node rpg_campaign_simulator.js social
node rpg_campaign_simulator.js competitive
node --test tests/rpg_time_coordinator.test.js tests/rpg_campaign_simulator.test.js tests/rpg_world_ui.test.js
npm run test:rpg
```

Available strategies are `idle`, `casual`, `social`, `competitive`, and `balanced`. Each takes exactly 270 periods and validates the day/period clock, mandatory-season milestones, duplicate event queues and receipts, resource floors, appointment handling, and campaign closure. The simulator exercises the **real RPG** appointment, story, schedule, social activity, tournament, competitive, mandatory-event, community, world, and epilogue modules.

### Boundaries and limitations

- **No real Classic Pokémon TCG duels are executed.** Competitive scenarios use explicit synthetic receipts to test RPG tournament and calendar progression. They do not validate CPU decisions, card legality, combat results, deck construction, or anti-cheat logic.
- The simulator does not create/edit real campaigns, cloud saves, or user accounts. It creates ephemeral in-memory state and outputs JSON.
- Narrative routes are explored as simplified deterministic policies, not complete human playthroughs of dialogue/CG/side-quest screens. Story-completion totals are coverage observations, not editorial judgments.
- Scenarios intentionally optimize different play styles. They should not be read as expected player outcome distributions or economic balance forecasts.
- A remaining useful extension is an authenticated end-to-end browser test, including cloud save/load and real Classic duel receipts.

## Clock and appointment rules

`rpg_time_coordinator.js` is the shared source for period math and booked-meeting conflicts.

An action that consumes a period must ask before it can miss a known booking. Story chapters, side quests, encounters, rivalry arcs, special situations, and legacy hangouts now check this **before** committing any scene/reward. Existing town activities, social outings, rest/sleep, and pre-duel staging continue using the same warning. Attending the appointment itself does not warn or miss it.

Mandatory scenes remain in their queue when an appointment is due now, rather than auto-traveling the player away from the reserved venue. They may play after the appointment or once its slot has passed.

## Relationship state consistency

`rpg_relationships.js` now owns stat changes for story choices, social activities, appointments, planned dates, encounters, situations, side quests and duel receipts. `relationships` is canonical; the existing `bonds` view remains mirrored for older UI and saves. On first load, legacy progress is reconciled once, **before missed appointments expire**; subsequent reloads do not use a maximum merge that could undo a negative trust consequence.

Tests cover migration, applying awards, surviving JSON reloads, missed appointment penalties, and settling a duel only once.

## Optional encounter fairness

`rpg_encounter_director.js` selects among otherwise-valid slice-of-life opportunities without changing story, schedule, or CG prerequisites. It remembers a small recent history to reduce repeated selection of the same NPC, prioritizes close-to-expiry moments, and uses stable deterministic ties. Selection itself remains read-only until an encounter actually starts. Important mandatory scenes, booked meetings, and invitations still have their existing priority.

## Related regression maintenance

Existing CI tests were updated to use the correct bootstrap asset URLs, a unique Deck Studio back-navigation selector, the new browser test dependencies, and the asynchronous cloud checkpoint protocol. The generated account-scoped character roster was also rebuilt from the current character pack definitions rather than editing generated character data by hand.

## Further work

The current patch migrates the relationship compatibility views, but does not alter authored relationship thresholds or romance-route design. End-to-end browser/cloud replay tests and fully simulated Classic duels remain separate follow-up tasks.

## Competitive circuit regression coverage (after roster expansion)

The full 90-day headless simulation now verifies that every recurring competition it plays actually settles into the RPG standings. A rejected receipt fails the simulation instead of silently counting as a successful duel. The same receipt is replayed deliberately to ensure it cannot award points or credits a second time.

The simulation also checks that the canonical `relationships` view stays synchronized with older `bonds` saves after every time period. Story rewards no longer have a separate maximum-based copy that could disguise a mismatch.

The report adds `competitiveSettled`, `competitiveMatches`, and `matchmakingVersion`; it continues to label **all simulated duels as synthetic**. Tests exercise the complete 90-day expanded roster, every Saturday's three distinct challengers, and version-1 legacy-save settlement. This is a progression regression harness, **not a validation of Classic battle tactics or actual CPU difficulty**.
