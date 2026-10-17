# Integration agent status — 2026-10-17

## Scope and ownership

Integration owns the RPG/Classic CPU handshake, shared presentation, navigation clarity, client robustness and integration regression tests. The TCG agent retains core card rules; the RPG agent retains authored stories, character schedules and economy rules; the art agent retains assets. No card-rule files or NPC schedule definitions were deliberately modified in this integration milestone.

## Landed on `main`

### 1. Reliable NPC duel round-trip
- Added `rpg_duel_bridge.js`, a shared browser + Node integration adapter.
- Each NPC challenge carries a distinct `duelId` through the iframe URL and has a unique sessionStorage key. A new match will not resume an old finished match.
- Return messages are accepted only from the actual same-origin duel iframe with the current pending match ID and terminal result.
- Victory/defeat/draw settlement is idempotent: points, credits, trust, exhibition bonus and results are applied only once.
- Parent removes the match-scoped token on completion. Stale / cross-match callbacks have no effect.
- Fixed a previously undeclared `rpgMode` use in the CPU reset path and the stale-token error cleanup path.
- Prevented the standalone "New duel" button from resetting an embedded campaign encounter.

### 2. Save + player clarity
- Persist a newly initialized or migrated campaign immediately and retain current dialogue/choice buttons through refresh.
- Sanitize broken saved location, period, collections and pending NPC duel identity to avoid rendering crashes.
- Added a post-duel results banner, including points, credits, trust, and exhibition bonus, with dismissal; receipt persists through refresh.
- Display present-time NPC counts on town locations and a free-travel "Around Town Now" panel.
- Added keyboard Space to advance authored multi-line scenes while not intercepting focused buttons or text inputs.
- Corrected the exhibition action copy to say extra points are conditional on victory.
- Added mobile and reduced-motion styling.

### 3. Regression tests
- `tests/rpg_integration.test.js`: session isolation, origin/source/ID rejection, victory/defeat/draw outcomes, duplicate reward protection, client syntax/wiring.
- `tests/rpg_flow.test.js`: simulated DOM playthrough of new campaign, free travel, NPC encounter, two duels, stale-result rejection, reward persistence, reload, sleep/day rollover, authored scene dialogue and refresh.
- CI now gates RPG story + integration + flow tests before the original repository-wide `npm test` suite.
- GitHub Actions green before the new multi-step flow suite. Latest CI run should be consulted before declaring this new suite green.

## Verified / not verified

**Verified:** integration helper executable preflight for scoped result messaging, reward updates and idempotence; browser script syntax; earlier repository-wide GitHub Actions regressions; existing story unit tests.

**Pending:** latest multi-step simulated DOM workflow result; actual Chromium/WebKit screenshots; end-to-end completed Node-backed CPU match in a real browser; production Render save/reconnect behaviour; multiplayer human-vs-human browser interaction.

**Known limitations:** The local Node duel service keeps in-progress sessions in server memory. Restarting that service may require replaying an in-progress match. Campaign saves are still browser-local. NPC schedules currently permit one character to appear in multiple places in one period; schedule semantics belong to the RPG agent, not this integration change.

## Next priorities
1. Resolve any remaining CI failures from the new DOM playthrough and keep full repository CI green.
2. Add real-browser E2E tests against a running Node server for new game → actual completed NPC match → rewards → reload and mobile screenshots.
3. Add realistic CPU/online visual parity screenshot assertions and responsiveness/accessibility checks.
4. Coordinate with the RPG agent on day-time scheduling semantics and tournament progression; do not rewrite these subsystems inside integration work.
5. Coordinate with art on missing image handling and final asset resolution.

## Safe git practice

All changes use incremental commits to `main` via SHA-checked file updates, never force-pushing, and preserving concurrent independent agent changes. Re-check workflow conclusions and current branch head before release.

## Focused UI save / active-duel lock follow-up (2026-10-17)

- Town-radar travel now saves location immediately; reload no longer reverts this navigation path.
- The RPG locks the deck selector and navigation as soon as an NPC duel opens, including on reload. The onchange handler rejects a late programmatic deck replacement.
- `tests/rpg_save_lock.test.js` covers town travel, refreshed state, NPC challenge, duel lock, late deck changes, final result, relationship progress, token cleanup and refreshed return state.
- **Verified:** a focused simulated-DOM play session evaluated the actual feature-branch `rpg.js` and `rpg_story.js` through an entire NPC duel and passed. JavaScript syntax compiled. **Not verified:** full real-browser gameplay/screenshots or hosted/multiplayer end-to-end scenarios. Main's separate Neo rules CI is failing on `test_neo_batch_v059.js`; this integration change does not modify that subsystem.
