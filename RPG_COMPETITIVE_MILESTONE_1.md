# RPG Milestone 1 — Competitive Daily Loop

This milestone introduces repeatable, campaign-scoped competitive opportunities without adding alternate Pokémon TCG rules.

## Where to play

- **Daily Training Challenge:** Beginning on Day 2, visit the **Community Center** at any time of day. A rotating trainer offers one match per day. It refreshes the following day; victory, loss, and draw all consume the day's entry.
- **Saturday Local:** On Days 6, 13, 20, and every seventh day thereafter, visit **The Lucky Draw**. Win **two successive rounds on the same day** for a championship prize. Enter by the afternoon to leave enough time for both rounds. Defeat eliminates you; a draw allows a rematch if time remains.
- The **Circuit** tab in the RPG's location action dock lists available matches and free travel shortcuts. The sidebar shows the next local day, plus circuit matches where available.
- Major Cups and all original NPC challenges are unchanged.

## Rewards

Existing battle receipts still grant their standard points, credits, relationship effects and ten-card booster on wins.

Additional competitive bonuses:

| Activity | Win bonus | Other result |
| --- | --- | --- |
| Daily training | +4 circuit points and +8 credits | No extra bonus |
| Saturday local round | +5 circuit points and +10 credits | No extra bonus |
| Saturday local final victory | Additional +12 circuit points, +20 credits, and one voucher for an unlocked expansion | No championship award |

Redeem the voucher at the card shop through the existing booster system. Expansions already unlocked by collection, relationship, or day progression are eligible; results don't need to unlock content out of order.

## Character progression

The daily and weekly opponent *roster* changes across campaign Acts I, II, and III. Matches use each NPC's existing authored deck and the authoritative Classic duel engine. **Adaptive opponent deck upgrades and changes to CPU skill are outside this first delivery** and should be evaluated separately against the dedicated CPU AI project's balancing work.

## Save format and correctness

A new optional `state.competitive` object stores day entries, per-week round progress, and processed duel receipts. Older saves initialize it automatically. Scores and circuit progression are awarded only after a genuine accepted RPG duel receipt, exactly once per ID. Draws do not prematurely clear weekly bracket rounds. The next weekly local retains separate results, and New Game+ resets the circuit with the rest of the campaign.

Tests: `node --test tests/rpg_competitive_loop.test.js`, `npm run test:rpg`, and `npm test`. The module is included in RPG and browser mock integration harnesses.

## Follow-up opportunities

- Better competitive opponent deck evolution and opponent analysis
- Mini-league standings involving NPC vs NPC matches
- In-world character reactions to local results and rivalry records
- Clearer tournament notifications and calendar integration
