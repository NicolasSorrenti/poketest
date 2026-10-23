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
| `foundations` | Kanto Origins · Base / Jungle / Fossil | 160 | 80 | Only original Base Set, Jungle, and Fossil cards; classic Kanto types and evolutionary lines |
| `elemental` | Elemental Rivals | 180 | 60 | Six type lanes: Grass status, Fire offense, Water control, Lightning speed, Psychic disruption, Fighting pressure |
| `neo` | Neo Evolution Lab | 176 | 64 | Neo-biased evolution families and setup play |
| `rocket` | Rocket's Schemes | 160 | 80 | Dark/Rocket/Gym personalities and disruptive Trainers |
| `mayhem` | Trainer Mayhem | 128 | 112 | Basic-heavy decks and frequent Trainer plays |
| `kanto-growth` | Kanto Evolution League · Base/Jungle/Fossil | 176 | 64 | Original three sets, evolution-focused, stronger Stage 2 representation |
| `jungle-growth` | Jungle Growth · Base/Jungle | 176 | 64 | Stage 1 families and Kanto setup |
| `fossil-discovery` | Fossil Discoveries · Base/Jungle/Fossil | 174 | 66 | Fossil-era flavor and evolution support |
| `rocket-uprising` | Rocket Uprising · Base through Rocket | 176 | 64 | Dark Pokémon and regular evolution lines |
| `gym-academy` | Gym Academy · Kanto + Gym | 176 | 64 | Gym Leader Pokémon and evolved partnerships |
| `neo-generations` | Neo Generations · Neo 1–4 | 180 | 60 | Neo-only evolutions and Johto families |
| `stage-one` | Stage One Showdown · All Eras | 176 | 64 | Strong Stage 1 pairs, no Stage 2 cards |
| `slow-burn` | Slow Burn · All Eras | 180 | 60 | Stage 2-heavy, lower early aggression |

**Evolution-friendly formats** (`kanto-growth`, `jungle-growth`, `fossil-discovery`, `rocket-uprising`, `gym-academy`, `neo-generations`, `stage-one`, `slow-burn`) contain 80–90 Evolution slots rather than 50 in Kanto Origins, prioritize Basics that can evolve, and reserve full Basic→Stage 1→Stage 2 sequences when requested. The generator reserves a Stage 1 and matching Stage 2 for some lines, but those cards remain draftable by different players: taking the complete line is a meaningful choice, not guaranteed per seat. Strong standalone Basics (Hitmonchan, Electabuzz, Scyther, Magmar, Mewtwo, Lickitung, Chansey, Kangaskhan) are capped at **one copy each** in these particular cube pools, while exceptionally fast Trainers (Oak, Bill, Gust of Wind, PlusPower, Energy Removal, Super Energy Removal, Computer Search, Item Finder, Lass, Scoop Up) target **two copies per name**. All other formats, including the original Base/Jungle/Fossil preset, retain their historic behavior.

The CPU draft recommendations and generated CPU decks use the selected cube's evolution focus to choose linked families more often. Card abilities, evolution turn restrictions, Energy attachment, and game rules are unchanged. These are **pool and AI changes**, not unannounced changes to Pokémon card text. A limited set of cards is still sourced from supported historical theme decks; this is not yet a full audit of every card printed in each expansion.

**Balance caveat:** This is a structural intervention, not proof that Evolution decks now win as often as Basic-only decks. The existing audit covers limited heuristic CPU drafts and can adjudicate unfinished matches; compare genuine played games and human drafts before treating any win-rate estimate as reliable.

Every preset draws only from the supported historical theme-deck printings.

### Reprint consistency

A generated Cube selects **one expansion per named card** for the entire pool, while allowing multiple copies of the chosen printing. For example, PlusPower cannot appear partly as Base Set and partly as Base Set 2. The default favors the earliest eligible set, Neo Evolution Lab favors Neo printings, and Rocket's Schemes favors Team Rocket/Gym printings. Kanto Origins is strictly restricted to `base1` (Base Set), `base2` (Jungle), and `base3` (Fossil); `base4` is Base Set 2 and never appears in that Cube. This intentionally also chooses one set for same-name Pokémon with different artwork or attacks, prioritizing a consistent card library. Player decks retain the usual four-of-by-name limit.

Every preset draws only from the supported historical theme-deck printings. Evolutions are admitted only when a compatible predecessor is somewhere in the final cube, and CPU decks must still obey 40-card construction rules. Drafting the whole evolution family is not automatic; it requires actual picks. Mono-type support is intentional in Elemental Rivals; specialized text-effect weighting nudges each type toward its archetype but does not create new custom Pokémon rules. All presets support reproducible seeds for testing.

For verification, run `node test_cube_presets.js` or `npm run test:cube`. A first controlled Basic-only versus Evolution CPU matchup audit has now completed: **280 actual finishes, 2 incompletes** across nine Cube formats with eight draft seeds. See [CUBE_ARCHETYPE_BALANCE_REPORT.md](CUBE_ARCHETYPE_BALANCE_REPORT.md) for per-format win rates, Evolution-play rates, interpretation limits and the reproducible workflow. Independent archetype-specific drafting and human playtest win rates remain to be measured.

## Multiplayer round-robin (2–4 humans, CPU fills to four)
- Everyone completes their 60 picks, builds a legal 40-card deck and locks it.
- The tournament starts automatically when all humans have locked. All decks are frozen, including AI decks generated from the CPU drafters' own cards.
- Six round-robin pairings are scheduled: seats 1–2, 3–4, 1–3, 2–4, 1–4, 2–3. **Disjoint matches run simultaneously:** when seats 1–2 are playing, seats 3–4 can battle at the same time. Everyone plays three opponents. Rooms with fewer humans mix online PvP, human-vs-CPU, and real-engine CPU-vs-CPU simulation.
- The active human seats receive private match tokens and an on-screen Play button. Other players see who is playing and wait for their turn. A Return to Cube Championship shortcut appears in online and CPU duel pages.
- Each online fixture uses the same authenticated WotC Pokémon engine as existing Classic multiplayer, configured for a 40-card deck and four Prize cards. Only its two assigned humans can play, and the server never accepts match results from the client.
- Once a duel completes, polling the Cube room advances the tournament and updates standings. Human draws trigger an automatic rematch rather than arbitrarily awarding a winner.
- Standings use 3 points per victory; tied records use the completed head-to-head result, then seat order, as the documented fallback.
- Cube rooms and match services are still in memory and can expire or be lost on server restart. At most two non-overlapping matches play simultaneously in a four-seat Cube.
- End-to-end browser and service tests: `node test_cube_round_robin.js` and `node tests/cube_round_robin_browser_smoke.js`.

## Multiplayer playtest UX
- **Provisional pack choice:** clicking a draft card immediately shows Saving feedback, then highlights it. Until all other seats select their cards and the pack passes, the owner can click a different card to change the pending pick. The currently selected card remains in the visible pack, but other players' packs and selections stay private. The server validates replacements.
- **Card previews:** hover over (or keyboard-focus) any card in the current pack or the drafted-card list to display a large version of its art, name, type, HP, and attacks.
- **Concurrent duels:** each free pair can start a server-authoritative duel without waiting for unrelated matches; result polls independently conclude finished matches and start the next available opponent pairing. No seat receives two simultaneously active assignments.
- **Watch other people:** a tournament seat can spectate an in-progress human-vs-human game for which they are not a participant. The Cube server issues a read-only spectator token; no deck or opponent token is exposed. CPU duels are not currently watchable.
- **Tournament chat:** authenticated room-wide text chat, maximum 280 characters per message, rate-limited at 750 ms and capped at 100 messages, displayed using safe text rendering.
- **Automatic return:** when a player's or spectator's Cube duel finishes, the result remains on-screen for four seconds before navigating back to the tournament room. A manual Return shortcut remains available.
- Regression tests: `test_cube_room.js`, `test_cube_room_http.js`, `test_cube_round_robin.js`, `tests/cube_room_browser_smoke.js`, `tests/cube_round_robin_browser_smoke.js`, `tests/cube_parallel_browser_smoke.js`.
