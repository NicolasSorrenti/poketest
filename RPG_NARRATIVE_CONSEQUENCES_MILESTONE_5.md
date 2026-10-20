# Neo Campus RPG — Milestone 5: Meaningful Narrative Consequences

## Player-visible changes

A real Classic duel can now become a turning point in the RPG rather than only a score change. The new `rpg_consequences.js` records **verified RPG results** and remembers how the player handles them.

- **First setback:** the latest loss may open a short optional reflective scene at the Community Center.
- **Second consecutive loss against a rival:** the response recognizes a difficult streak, rather than presenting an ordinary first defeat again.
- **Reversal:** a rival the player once beat wins the next encounter and the narrative acknowledges that change.
- **Comeback:** the player defeats a rival who had beaten them earlier. That is an earned season memory.
- **Official Cup setback:** a defeat in a real, official cup is acknowledged distinctly from a normal club game.
- **Saturday Local setback:** distinct from a regular practice loss.

No generic event takes over already authored personal scenes or the mandatory season-ending story.

## Optional three-way reflection

For seven days after an eligible duel, the **Circuit** tab offers `Reflect on your match` at the Community Center. Free travel remains free. Choosing to review consumes **no time, money, affection, trust, reputation, points or battle preparation**.

Three distinct responses are available:

| Player response | Narrative consequence |
|---|---|
| Study the match | Emphasizes preparation and the decisions that shaped a loss or comeback |
| Choose the next challenge | Emphasizes resilience, initiative and continuing an evolving rivalry |
| Look beyond the scoreboard | Emphasizes companionship, perspective and enjoying the community |

This response is recorded **only once per original duel result**. The scene is optional, can be left unchosen without penalty, and cannot be farmed for affection or rewards. If a result is older than seven days, the new prompt expires; previous choices remain part of the season history.

The chosen path changes the next short character conversation and the pre-duel intro for a rematch within fourteen days. Fourteen major NPCs have different written responses; imported character packs use respectful neutral fallback lines. No romantic implications are invented when the player has not pursued a route.

## Season finale and New Game+

The season report includes an optional **What changed along the way** section only when earned outcomes support it. This can acknowledge a player's dominant approach to setbacks, actual rival comebacks, or reflections after major Cup losses. The existing champion/partner/friendship titles retain priority.

New Game+ archives the full report while resetting the new season's choices and results. Old saves gain an empty `state.consequences` layer and never have past choices or duel outcomes retroactively invented.

## Technical boundaries

- Only an accepted, settled `NeoRpgDuelBridge` receipt followed by a matching `state.results` record can generate a new consequence.
- `processed[duelId]` prevents duplicate results or reload races from creating extra turning points.
- The original Classic reducer, card ownership, collection/shop, opponent AI, official Cup, and original season mandatory story schedule remain intact.
- Consequences have a bounded event ledger for the 90-day campaign. All output after recording is deterministic and reload-safe.
- The general NPC reactivity selector places an actual selected path above ordinary match chatter, while leaving authored story decisions and direct duel reactions available.
- `rpg_epilogue.js` reads season memories; it never writes rewards or modifies save state during reporting.

## Verification

- `tests/rpg_consequences.test.js`: verification, duplicates, losses/reversals/comebacks, real cup receipts, three approaches, progression without rewards, legacy saves, expiry, reload and NPC voice coverage.
- `tests/rpg_reactivity.test.js`: matching a selected path with its once-only follow-up, retaining normal conversation fallback.
- `tests/rpg_world_ui.test.js`: actual combat result through the bridge, center reflection, no-cost choices, save/reload, interruption and character response.
- `tests/rpg_epilogue.test.js`: reports earned reflective choices with a compatible archived New Game+ history.
- `tests/rpg_match_reactions_http.test.js`: production server permits `/rpg_consequences.js`.
- `npm run test:rpg` includes the new module's syntax and tests.

## Future work

A later milestone could add unique authored two-NPC conflict stories, rivalry outcomes that unlock scheduled exhibition duels, midseason commentary about community-wide stakes, and deeper dialogue on returning after missed social commitments. Those are separate from this consequence tracker and should not force grinding or bypass the authoritative TCG.
