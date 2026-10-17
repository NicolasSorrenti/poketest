# Integration agent status — 2026-10-17

## Scope and ownership
This branch changes RPG/CPU duel presentation and handoff only. TCG rules, attacks, card processing, authored NPC schedules, and story routes remain owned by the other agents and are untouched.

## Audited issues
- The RPG accepted same-origin iframe win/loss messages without matching a specific pending duel ID, allowing stale messages to finish a later match.
- The CPU duel reused one sessionStorage token for every RPG encounter. A refreshed RPG iframe could recover a different encounter.
- An expired RPG duel token was cleared from the normal CPU key, not the RPG key.
- The CPU reset function read `rpgMode` outside its scope. In RPG mode, the reset button also offered an unsafe restart path.
- RPG duel transitions did not render the locked state before loading the iframe, and payout feedback was hidden in the journal.
- Tournament buttons implied fixed points despite bonus points being conditional on victory.

## Implementation
- `rpg_duel_bridge.js`: strict correlated duel completion and per-encounter session keys. Loaded by RPG and CPU duel pages; normal CPU key remains independent.
- `rpg.js`: only accept expected result IDs (in addition to existing source/origin checks); persist latest duel payout and display it; lock deck during pending duel; show other possible NPC sightings; truthful victory bonus label.
- `classic_live.js`: use correct per-duel session key; report result after action AND after state recovery; clear expired token correctly; suppress unsafe reset in RPG context.
- `duel_accessibility.css`: common visible keyboard focus and interaction feedback loaded in both CPU and multiplayer; existing shared layout components preserved.
- `test_rpg_duel_bridge.js` and `test_rpg_ui_flow.js`: correlated message, reload, multi-day simulated UI journey, rewards, and parity contracts.

## Verified
- Source syntax checked during edits using V8 JavaScript compilation.
- File wiring audited against the current GitHub repository. The full Node and browser run still require CI/live validation; do not treat simulated DOM tests as real-browser E2E.

## Known limitations / next priorities
1. Verify Node CI, then run live browser play sessions (mobile/desktop) and capture screenshots.
2. Verify actual hosted server durability. Sessions are held in server memory; a server restart still requires a fresh duel, not resume from server persistence.
3. Cover real multiplayer joining, activity UI, network loss, and reconnection in browser automation.
4. Continue UI parity using the shared presentation modules, without replacing either duel rules authority.
5. Coordinate any changes to the story state, NPC schedules, reward economy, and generated art with their respective agents.

## Branch
`integration/duel-bridge-20261017` — no force push, merge through reviewed PR to preserve concurrent work.
