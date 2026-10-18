# Pokémon Cube Draft (preview)

Open /cube.html from the Classic duel lobby (npm start).

## Flow
1. Draft against three CPUs. Four packs of 15 cards per seat; packs pass in alternating directions.
2. Build a 40-card deck from drafted cards and unlimited Basic Energy. Customize the suggested legal deck using +/- controls.
3. Start a four-Prize Cube Championship match in the existing authoritative Classic duel UI.
4. Return to /cube.html after each match. The server records its authoritative outcome and unlocks the next opponent. Your original 40-card deck is frozen for all three rounds. Refreshing restores an active draft/tournament while its server session remains alive.

## Card eligibility and collation
The conservative card pool consists only of non-Energy cards appearing in the 28 historical theme deck lists (Base Set through Neo Destiny) and whose attack, Power, and Trainer handlers are registered. Recognition and themed-deck tests do not certify every unusual rules interaction.
The pool is roughly 65% Pokémon (weighted toward Basic Pokémon, balanced across the six Basic Energy types, and compatible evolution lines) and 35% Trainers. Pokémon whose only attacks need unavailable Dark/Metal/Special Energy are excluded unless they have an implemented Power. Duplicate cards are intentional. Players still need to draft compatible evolution cards.

## Format rules
- Four players: one human, three CPU.
- Four 15-card packs per player, alternating pass direction.
- Decks contain 40 cards, with four Prizes per game.
- Unlimited Basic Energy supply outside packs.
- Standard four-of card-name limit excluding Basic Energy.
- Normal historical evolution rules. No extra Cube evolution shortcuts.

## Verification
- npm run test:cube: draft, CPU choices, legal deck generation, real authoritative 40-card duel setup, HTTP API and browser JS syntax.
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
- A three-round solo Cube Championship is available: Rookie Rival (CPU level 2), Campus Challenger (level 3), Cube Champion (level 4). Wins/losses/draws are recorded from the server-side duel state and cannot be client-reported. The mode is a gauntlet, not a four-player round-robin bracket.
- No human multiplayer drafting or fully simulated four-player tournament standings yet.
- Eligible handlers are more extensively covered than arbitrary archive cards but not proven perfectly accurate in every combination.
