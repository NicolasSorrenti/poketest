# Integration status — 2026-10-17

## Branch and ownership
Branch: `integration/rpg-ux-save-fix-20261017`, built from the current `main` after parallel TCG and RPG agents published their own duel adapter and character-relationship integration. Superseded PR #5 was closed without merging. This branch does not change any card rules, NPC schedules, storyline definitions, image files, or engine outcomes.

## Audited / fixed
1. **Radar travel save loss:** the town radar changed `state.location` but did not persist before rendering, so refreshing could rewind the player's location. Now persists immediately.
2. **Deck during duel:** the RPG duel overlay launched without a locked render, and the deck select could change even while a saved duel was in progress. The UI now locks while a duel or story scene is active (also at season end); the onchange handler rejects programmatic late changes.
3. **Regression:** `tests/rpg_save_lock.test.js` simulates radar navigation and reload, an NPC interaction, challenge, locked action controls, a deferred deck listing, message-based return, rewards, token cleanup and a second reload. CI is configured to run this test alongside existing RPG tests.

## Evidence
- Updated JavaScript parsed successfully through V8 after editing.
- GitHub PR CI is the authoritative runtime test; results are pending until the PR workflow completes.
- Real browser, screenshots, production hosting, and multi-client network play have **not** been verified in this session.

## Next integration priorities
- Run real browser journeys and review mobile screenshots.
- Test hosted server restarts, unrecoverable in-memory duels and reconnect messaging.
- Exercise two simultaneous online clients with network drops; synchronize presentation improvements without touching authoritative rules.
- Preserve the other agents' changes by merging only once the PR can fast-forward or merge cleanly.

## Known architectural limit
CPU and multiplayer both use the Classic reducer, but live duel state remains in server memory. A server restart during a duel still cannot resume that exact engine session.
