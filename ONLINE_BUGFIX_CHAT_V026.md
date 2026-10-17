# Neo Campus TCG v0.26 — Multiplayer bugfix and room chat

## Gameplay fixes

- **Energy click crash:** `online.js` previously rendered Pokémon with a `side` argument that hid the `side()` function used to identify the local player. Targeting an Energy caused a TypeError before the DOM had finished drawing the Active card. Renamed the argument to `ownerRelative` and made the zone update atomic via a DocumentFragment and `replaceChildren`.
- **Evolution source:** Neo Genesis Lanturn (`neo1-38`) was missing `evolvesFrom: "Chinchou"`, so clients didn't recognize it as an Evolution. The printed card record and `tcgdex_adapter.js` import fallback are corrected. The same known importer anomaly was corrected for Lt. Surge's Magneton (`gym1-8`).
- **Historical evolution timing:** Both players must still wait until their second turn to evolve Pokémon from setup (including Chinchou). Regression tests verify rejected round-1 and accepted round-2 evolutions.

## Private room chat

- Chat box in both lobby and duel sidebar. Works with self-hosted Node.js multiplayer and with a Cloudflare tunnel to that server.
- Messages are available only to room members with a valid seat token; another room cannot access them.
- Plain-text rendering with `textContent`, 350-character input limit, 850-ms per-seat rate limit, 80-message ring buffer.
- Chat does not change match revision or pending choices, so receiving a message cannot invalidate an Energy-targeting click.
- Messages live in server memory. Restarting Node.js clears game rooms and chat history.

## Verification

Run `npm run test:online:v026` (dedicated) or `npm test` (all regression suites). Tests cover two online seats attaching Energy, persistent Active Pokémon, private opponent hands, full 60-card conservation, chat security, and both seats evolving Chinchou into Neo Genesis Lanturn legally on round 2.

The new client was exercised with a mocked-network Chromium harness, not a live Internet/tunnel match. Manual testing on two browser windows/devices remains important.

## Caveat

Evolution legality is fixed for Lanturn; its historical Hydroelectric Power still requires broader fidelity work. This does not claim all Neo powers are historically complete.
