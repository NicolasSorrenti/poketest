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

## Further work

The current patch deliberately avoids migrating historical saves or rewriting the existing `bonds` and `relationships` models. A future data-model pass can make relationship updates transactional and canonical, with explicit migrations and separate regression tests.
