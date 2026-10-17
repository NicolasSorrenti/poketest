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
- Fixed multiplayer lobby recovery for concurrent Ready/start actions: a stale revision now refreshes authoritative room state and retries the intent once, rather than losing the click. The previous catch path attempted to call `refresh()` while `busy` caused it to return without refreshing.

### 2. Save + player clarity
- Persist a newly initialized or migrated campaign immediately and retain current dialogue/choice buttons through refresh.
- Sanitize broken saved location, period, collections and pending NPC duel identity to avoid rendering crashes.
- Added a post-duel results banner, including points, credits, trust, and exhibition bonus, with dismissal; receipt persists through refresh.
- Display present-time NPC counts on town locations and a free-travel "Around Town Now" panel.
- Added keyboard Space to advance authored multi-line scenes while not intercepting focused buttons or text inputs.
- Corrected the exhibition action copy to say extra points are conditional on victory.
- Dialogue buttons now state their time cost and expected relationship/reward effects, including when a once-per-day or once-per-period benefit has already been claimed.
- Added mobile and reduced-motion styling.

### 3. Regression tests
- `tests/rpg_integration.test.js`: session isolation, origin/source/ID rejection, victory/defeat/draw outcomes, duplicate reward protection, client syntax/wiring, actual hosted JS/CSS HTTP responses and a genuine server-authoritative Classic create/concede/result cycle.
- `tests/rpg_flow.test.js`: simulated DOM playthrough of new campaign, free travel, NPC encounter, two duels, stale-result rejection, reward persistence, reload, sleep/day rollover, authored scene dialogue and refresh.
- CI now gates RPG story + integration + flow tests before the original repository-wide `npm test` suite.
- Node `--test` RPG suite: **11 tests passing, 0 failing** on GitHub Actions (includes HTTP/static and real service tests).
- Full `npm test` + TCG Gameplay Regression: **green** on the verified integration commit `fe77ef34fc67af026ac103cf1b9bca9ee5d09b68`, after the concurrently owned v0.59 card-rule updates were fixed. Always inspect the latest head before release.
- Browser workflow: `.github/workflows/rpg-browser.yml`, `tests/rpg_browser_smoke.js` + `tests/online_browser_smoke.js` independently validate real Chromium play: town exploration, actual Classic CPU concede via rules API, iframe return, both save/reload *during* a match and afterwards, two consecutive NPC challenges with distinct tokens and rewards, multi-day rollover; two separate real Chromium multiplayer clients join, become Ready, render the shared board, exchange a live chat message, and both receive the final server result. Chromium job `39015397220` **passed**, generated **seven screenshots**. [Browser workflow run](https://github.com/NicolasSorrenti/poketest/actions/runs/39015397220) · [Screenshot artifact](https://github.com/NicolasSorrenti/poketest/actions/runs/39015397220/artifacts/12095030239) (GitHub access required).
- Static hosting compatibility fix in `server.js`: explicitly serve `rpg_duel_bridge.js`. Actual hosted test catches allowlist regressions which script-only checks missed.

## Verified / not verified

**Verified:** bridge and campaign reward semantics; actual server HTTP assets; complete simulated multi-day RPG, two NPC matches and story save/load; actual HTTP Classic match completion; independent real Chromium full campaign → NPC encounter → two finished Classic duels → iframe return → rewards → mid-match and post-match refresh with screenshots; real two-client multiplayer Chromium lobby, shared board, chat and outcome propagation; latest observed full Node + TCG Gameplay regression suites green on contemporary branch commits.

**Pending:** production Render save/reconnect behaviour, full human-played complete TCG duel using only browser UI (Chromium tests finish legally via the real authoritative concede endpoint), WebKit and additional real mobile-device verification, visual screenshot *comparisons* / golden baselines (screenshots are captured for human review), prolonged multiplayer action/decision sequences beyond ready/chat/concede, and sustained 90-day campaign endurance runs.

**Known limitations:** The local Node duel service keeps in-progress sessions in server memory. Restarting that service may require replaying an in-progress match. Campaign saves are still browser-local. NPC schedules currently permit one character to appear in multiple places in one period; schedule semantics belong to the RPG agent, not this integration change.

## Next priorities
1. Run production Render smoke/reconnect check and verify server restart recovery; investigate long-term persistence without modifying the card-rules authority.
2. Extend real-browser tests to follow legal opening setup and play full attack/prize sequences on CPU and both online clients (two-client lobby, chat, and completion already verified).
3. Review uploaded screenshots for clipping, placement and differences; establish stable desktop/mobile screenshot baselines and accessibility checks.
4. Coordinate with the RPG agent on day-time scheduling semantics and tournament progression; do not rewrite their subsystem inside integration work.
5. Coordinate with art on final image backgrounds/portraits and missing-art fallbacks.

## Safe git practice

All changes use incremental commits to `main` via SHA-checked file updates, never force-pushing, and preserving concurrent independent agent changes. Re-check workflow conclusions and current branch head before release.

## Focused UI save / active-duel lock follow-up (2026-10-17)

- Town-radar travel now saves location immediately; reload no longer reverts this navigation path.
- The RPG locks the deck selector and navigation as soon as an NPC duel opens, including on reload. The onchange handler rejects a late programmatic deck replacement.
- `tests/rpg_save_lock.test.js` covers town travel, refreshed state, NPC challenge, duel lock, late deck changes, final result, relationship progress, token cleanup and refreshed return state.
- **Verified:** a focused simulated-DOM play session evaluated the actual feature-branch `rpg.js` and `rpg_story.js` through an entire NPC duel and passed. JavaScript syntax compiled. **Not verified:** full real-browser gameplay/screenshots or hosted/multiplayer end-to-end scenarios. Main's separate Neo rules CI is failing on `test_neo_batch_v059.js`; this integration change does not modify that subsystem.
