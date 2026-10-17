# Neo Campus TCG v0.36 — Combat readability

Based on v0.35. Both `classic_live.html` (CPU) and `online.html` (friend duel) now include the same visual combat feedback. This update does **not** change the historical card effect engine.

## New
- Whenever the server confirms an **attack**, both players see a large, centrally positioned attack cue with the attack's actual name and the acting Pokémon. The attacking Active Pokémon pulses, and the defending Active Pokémon receives a subtle focus flash. Attacks that deal no damage still receive an attack cue.
- **Evolution** actions have their own presentation cue and field glow, again only after server confirmation.
- Floating **-HP / +HP** labels appear when the publicly visible damage counters of the **same** Pokémon change between game revisions. These are observed damage-counter changes, **not necessarily attack damage**; poison, healing, Powers, and Trainer effects can also cause them. No damage is guessed if a Pokémon changes position or is KO'd.
- **Recent Actions** panel shows eight server-approved public events (both players). It never contains a hidden card from a hand/deck or a private choice payload. The full historical duel log is still available.
- Attack buttons show helpful reasons for unavailable actions (wrong turn, decision pending, status, or definitely missing **basic** Energy). The server remains authoritative and special-Energy attacks are not denied by client-side guesses.
- Small usability improvement: disabled Retreat button shows why retreat cannot begin.
- HTTP asset allowlist now includes earlier shared UI dependencies (`battle_decision_ui.js`, `duel_experience_ui.js`) as well as `battle_presentation_ui.js`. Server-only scripts are still blocked.

## Run
`npm start`, then open `http://localhost:8000/classic_live.html` for CPU or `/online.html` for two players.

## Tests
- `npm test` — full existing project suite + new unit/HTTP asset tests.
- `npm run test:ui:v036` — focused v0.36, older opponent animation, and v0.35 experience tests.
- Tests cover both-player public event text, exact HP deltas, polling idempotency, private setup choices, action ordering, no replay when reconnecting, and server static assets.

## Limitations
- Combat cues are **generic per action**, not individually choreographed for each of the historical attacks.
- Floating HP numbers are based on snapshots. If multiple damage changes happen between multiplayer polls, they report the **net visible change**, not a per-attack breakdown.
- The card game engine and AI retain their prior limitations; these visuals do not certify exhaustive rules fidelity.
- A headless visual-browser run could not be performed in the build environment because Chromium navigation was blocked by environment policy. The automated Node and HTTP test suites passed.
