# Neo Campus: engine refactor and future invite-code multiplayer

## Verified architectural finding
`engine.js` currently couples rules with the browser (`render`, DOM element lookups, animation and dialogs), uses global `lookup` and `engine` state, and assumes player 0 is human and player 1 is CPU. It cannot safely be run as an authoritative online match without further extraction.

## New boundary in this checkpoint
- `duel_protocol.js`: validated transport-neutral action vocabulary; viewer-specific state projection, withholding opponent hands and Prize identities.
- `duel_rooms.js`: dependency-injected room lifecycle, cryptographic seat tokens, six-character codes, owner-only start, revision checks and turn gating. The authoritative rule adapter is **not yet wired**. No socket or invite UI is available in this build.
- `test_duel_rooms.js`: host/guest authorization, private state, replay/stale update checks, invalid action and turn protection.

## Important constraints before deploying multiplayer
1. Extract the rules engine to a Node-compatible `MatchState`/`applyAction` service with no DOM or animation calls. State mutations must be isolated per match, not global.
2. Replace all browser `prompt` or implicit CPU selection paths with explicit `pendingDecision` actions and legal option lists. Handle opponent-response windows (Chaos Gym, Tools, etc.).
3. Authoritative server exclusively generates randomness, checks deck legality and applies commands. Clients only send intentions.
4. Use server-side deck validation, robust schema validation for action payloads, action authorization for **pending choices**, rate limiting, deadlines and authentication/reconnect/disconnect rules. The demo room tokens are not a substitute for production session security.
5. Build a browser duel client consuming per-seat projections over WebSocket or SSE/HTTP. Add invite-code lobby, turn indicator and disconnect/rejoin behavior.
6. Test full turn sequence, replay deterministic RNG, disallowed information leaks, simultaneous effects, out-of-turn choices, and full matches.

## No false 100% claim
Catalog presence does not prove card correctness. These files establish protocol and privacy boundaries only. All existing card fidelity gaps remain until behavioral tests demonstrate otherwise.
