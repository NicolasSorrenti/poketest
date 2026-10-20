# Neo Campus RPG — Milestone 3: Living NPC Community

## What players experience

The RPG now has an independent **off-screen club circuit** and a town-wide record of who has been meeting whom.

- NPCs play club practice matches with each other on even-numbered days when two registered NPCs actually share a **shop, center, or arcade** time slot.
- On every fifth day, two NPCs who share the **café, park, or library** can have a small social encounter.
- Repeated head-to-head meetings develop **competitive rivalries**. Repeated social encounters develop **familiar friendships**. Both are recorded independently of the protagonist's romance route.
- The **Community Board** button in the existing **Circuit** tab opens a compact modal containing NPC-only club standings, recent news, and known connections.
- NPCs can refer to a recent personal off-screen match or encounter during everyday conversations; fourteen main characters use differentiated, character-specific voices.
- These ambient conversations are optional, cost no time, and award no affection or rewards. Unread memories remain unconsumed until their final dialogue beat.

## Authenticity and boundaries

**Off-screen club score slips are deliberately abstract simulations, not Pokémon TCG battles.** They do not simulate attacks, legal decks, prizes, or any other TCG turn-level actions. Actual player duels, weekly player locals, official Cups and story battles remain entirely in the original authoritative Classic engine.

NPC-only standings **never** change the player's circuit points, credits, packs, relationships, story flags, major Cup outcomes, and battle history. NPC club results should not be confused with official competitive ranking.

NPC pair eligibility uses the existing character-pack schedule registry (`NeoRpgSchedules.peopleAt`) including arrivals and public places. Future character packs with schedules are automatically eligible. A deterministic score (base skill plus modest variable match form) allows upsets without player-impacting randomness.

## Timing, saves and replay

- `state.community` contains `lastResolvedDay`, a bounded `events` ledger, NPC `standings`, and pairwise `links`.
- Simulation processes **completed** campaign days only, as the clock reaches a new day. It does not generate future outcomes while rendering a screen.
- Advancing ten days together gives the same results as ten individual advances. Reloading or reopening the board never rerolls a result.
- Existing saves initialize from their current day, with no retroactive invented season history. Replayed campaigns start fresh.
- Results remain available to the end of the 90-day season and support incomplete game saves.

## Files and tests

- `rpg_community.js`: autonomous off-screen simulation, ranking, results, social relationships, event dialogue.
- `rpg.js`: calendar integration, Community Board modal, day-change journal notice, NPC dialogue.
- `rpg_reactivity.js`: community memory candidate beneath authored story and direct duel memories.
- `rpg.html` and `rpg.css`: board UI separate from the cluttered main sidebar.
- `server.js`: public JS allowlist.

Automated coverage:
- `tests/rpg_community.test.js`: co-location, temporal progression, deterministic results, save reload, match consistency, relationship emergence, voice coverage and noninterference with player stats.
- `tests/rpg_world_ui.test.js`: a ten-day RPG advancement, board opening, readable NPC news, optional character conversation, and no-affection/no-reward guarantees.
- `tests/rpg_match_reactions_http.test.js`: hosted JS availability and private source file protection.

Run `npm run test:rpg`, the broader Node test workflow, and the Chromium RPG smoke workflow.

## Follow-up opportunities

This milestone does not implement a fully simulated Pokémon tournament circuit for NPCs, spectatable live NPC duels, dynamic player-facing standings prizes, or branching story scenes for every pair. Those require a separate rules/AI performance budget and authored narrative design. A next pass could add player-observable scheduled mini-events and targeted reactions to protagonist achievements without creating new gameplay chores.
