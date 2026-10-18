# Pokémon Cube Draft (preview)

Open /cube.html from the Classic duel lobby (npm start). Choose the Cube preset before starting.

## Flow
1. Draft against three CPUs. Four packs of 15 cards per seat; packs pass in alternating directions.
2. Build a 40-card deck from drafted cards and unlimited Basic Energy. Customize the suggested legal deck using +/- controls.
3. Start a four-Prize Cube Championship match in the existing authoritative Classic duel UI.
4. Return to /cube.html after each match. The server records its authoritative outcome and unlocks the next opponent. Your original 40-card deck is frozen for both human-played bracket matches. Refreshing restores an active draft/tournament while its server session remains alive.

## Card eligibility and collation
The conservative card pool consists only of non-Energy cards appearing in the 28 historical theme deck lists (Base Set through Neo Destiny) and whose attack, Power, and Trainer handlers are registered. Recognition and themed-deck tests do not certify every unusual rules interaction.
The default Balanced Cube is 156 Pokémon / 84 Trainers (roughly 65/35), with a Basic-heavy distribution and supported evolution lines. Other presets intentionally vary their Pokémon/Trainer ratio and archetype weighting. Pokémon whose only attacks need unavailable Dark/Metal/Special Energy are excluded unless they have an implemented Power. Duplicate cards are intentional. Players still need to draft compatible evolution cards.

## Format rules
- Four players: one human, three CPU.
- Four 15-card packs per player, alternating pass direction.
- Decks contain 40 cards, with four Prizes per game.
- Unlimited Basic Energy supply outside packs.
- Standard four-of card-name limit excluding Basic Energy.
- Normal historical evolution rules. No extra Cube evolution shortcuts.

## Verification
- npm run test:cube: draft, CPU choices, legal deck generation, real authoritative 40-card duel setup, HTTP API, browser JS syntax, bracket integrity, and real CPU-vs-CPU simulation.
- npm test: includes Cube tests alongside all historical duel tests.
- Browser click-through of the Cube interface and exhaustive rare cross-card interactions remain future testing tasks.

## Technical scope
- cube_draft.js and cube_service.js implement pool selection, drafting, validation, CPU picks, and 40-card deck suggestions.
- cube.html and cube_client.js render the picker and deck builder.
- server.js exposes authenticated /api/cube/create, /api/cube/state, /api/cube/pick and /api/cube/start.
- classic_local_service.js and headless_duel.js provide an isolated 40-card/four-Prize format without changing 60-card defaults.

## Known limitations
- Drafts are held in memory and expire after 90 minutes; server restart loses drafts.
- CPU drafting and CPU deck building are heuristic, not competitive-optimal. AI favors one or two Energy colors, playable attacks, and matching evolution lines.
- The four-player championship has two semifinals, a final and a third-place match. The human plays a semifinal and either the final or third-place match. The other two games are CPU-vs-CPU, with each player using their drafted 40-card deck. Human draws require replay. Results and all four places are authoritative.
- Human multiplayer drafting is available through /cube_room.html, although online Cube battles are still separate future work. CPU fixtures are simulated with the authoritative game reducer and AI for both sides, up to a bounded work budget. If a fixture has not resolved, its declared winner is determined by remaining Prizes, remaining Pokémon, then a reproducible seed tiebreak; the bracket labels this outcome.
- Eligible handlers are more extensively covered than arbitrary archive cards but not proven perfectly accurate in every combination.

## Multiplayer draft preview (/cube_room.html)
- The host creates a six-character invite code and shares the generated room link.
- Two to four human players can ready up, with empty seats filled by CPUs. Packs pass only after every player has picked; cards, picks, and submitted decks are private to their seat.
- Each human stores its own reconnect token in browser session storage; no token appears in the invite link.
- Rooms use in-memory server state and expire after six hours without activity.
- A completed draft lets each player build and lock a 40-card deck with unlimited Basic Energy. Once locked, edits are rejected by the server.
- **Online Cube duels are now wired to the round-robin tournament.** Once all human seats lock their decks, the server schedules six matches, one at a time. Every seat plays each other seat once (3 games per player).
- Room protocol lives in cube_room_service.js and /api/cube-room/*. Run node test_cube_room.js and node test_cube_room_http.js for seat privacy, complete four-human and mixed drafts, and HTTP authentication.

## Themed Cube presets
The solo selector and multiplayer room host both use exactly the same server-approved presets. Each one generates a fresh seed-based 240-card pool. These are curated **generation recipes**, not frozen 240-card inventories:

| Preset ID | Name | Pokémon | Trainers | Draft identity |
| --- | --- | ---: | ---: | --- |
| `balanced` | Classic Balanced | 156 | 84 | Original broad all-era Cube |
| `elemental` | Elemental Rivals | 180 | 60 | Six type lanes: Grass status, Fire offense, Water control, Lightning speed, Psychic disruption, Fighting pressure |
| `neo` | Neo Evolution Lab | 176 | 64 | Neo-biased evolution families and setup play |
| `rocket` | Rocket's Schemes | 160 | 80 | Dark/Rocket/Gym personalities and disruptive Trainers |
| `mayhem` | Trainer Mayhem | 128 | 112 | Basic-heavy decks and frequent Trainer plays |

Every preset draws only from the supported historical theme-deck printings. Evolutions are admitted only when a compatible predecessor is somewhere in the final cube, and CPU decks must still obey 40-card construction rules. Drafting the whole evolution family is not automatic; it requires actual picks. Mono-type support is intentional in Elemental Rivals; specialized text-effect weighting nudges each type toward its archetype but does not create new custom Pokémon rules. All presets support reproducible seeds for testing.

For verification, run `node test_cube_presets.js` or `npm run test:cube`. Competitive win-rate tuning across large numbers of matchups remains to be done.

## Multiplayer round-robin (2–4 humans, CPU fills to four)
- Everyone completes their 60 picks, builds a legal 40-card deck and locks it.
- The tournament starts automatically when all humans have locked. All decks are frozen, including AI decks generated from the CPU drafters' own cards.
- Six pairings are played one by one: seats 1–2, 3–4, 1–3, 2–4, 1–4, 2–3. Each seat has three opponents. For four humans, all six matches are online; rooms with fewer humans mix real online PvP, human-versus-CPU and engine-simulated CPU-versus-CPU matches.
- The active human seats receive private match tokens and an on-screen Play button. Other players see who is playing and wait for their turn. A Return to Cube Championship shortcut appears in online and CPU duel pages.
- Each online fixture uses the same authenticated WotC Pokémon engine as existing Classic multiplayer, configured for a 40-card deck and four Prize cards. Only its two assigned humans can play, and the server never accepts match results from the client.
- Once a duel completes, polling the Cube room advances the tournament and updates standings. Human draws trigger an automatic rematch rather than arbitrarily awarding a winner.
- Standings use 3 points per victory; tied records use the completed head-to-head result, then seat order, as the documented fallback.
- Cube rooms and match services are in memory and can expire or be lost on server restart. Four-player tournaments deliberately play **one fixture at a time**, not several simultaneous duels.
- End-to-end browser and service tests: `node test_cube_round_robin.js` and `node tests/cube_round_robin_browser_smoke.js`.
