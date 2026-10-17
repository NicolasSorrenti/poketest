# Neo Campus Classic v0.15 — Final 25 historical attack records

## Scope and architecture

This is the Base Set / Jungle / Fossil / Team Rocket **headless** rules-engine migration. The existing local browser duel remains in the project and still runs the older, independent UI-centric effects engine. Multiplayer and the story game are not being built in this milestone.

This release adds `classic_final_manifest.json` (25 exact source-card records), `classic_final_attacks.js` (18 exact effect families), and new choice/failure/response hooks in `headless_duel.js`. The manifest is an exact-print allowlist; unknown or revised wording is **not** silently interpreted as simple damage. Every family supports the transactional `choose` command, with a pending decision owned by the correct player. No change to the 311-card Classic format or the archived newer sets.

## New headless effect families

- **Copy/last hit**: Clefairy and Clefable Metronome; Pidgeotto and Spearow Mirror Move.
- **Prevent/disable/react**: Mewtwo Barrier, Poliwhirl Amnesia, Gastly Destiny Bond, Dark Wartortle Mirror Shell.
- **Damage plus timing**: Rhydon Ram (recoil and opponent forced switch, including Rhydon KO); Dark Arbok Stare (chosen target and suppression state); Dark Charizard Continuous Fireball; Dark Charmeleon Fireball; Dark Flareon Playing with Fire; Dark Rapidash Flame Pillar.
- **Deck and discard decisions**: Hypno Prophecy (choose deck and arrange top 1–3), Slowpoke Scavenge, Dark Golduck Third Eye.
- **Energy or target relocation**: Dark Magneton Magnetic Lines, Dark Electrode Energy Bomb, Dark Persian Fascinate.

## Test evidence

- All **25 printed attack variants** were accepted through actual headless `attack` / `choose` calls under synthetic but legal-cost battle states; complete pending chains were verified.
- **18 independent behavior scenarios**, including attack damage, exact costs, choices, conditional effects and timing.
- **256 deterministic coin-branch simulations** with no card loss/duplication, plus 25 per-variant card conservation assertions.
- Reactive scenarios for Barrier, Destiny Bond, Mirror Shell and knockout-time Ram switch, plus stale-choice atomicity.
- `npm test`, `npm run test:classic`, `npm run audit:classic` and `npm run audit:classic:execute` are the primary validation commands.

## Coverage — what the numbers actually mean

- **427/427 Classic attack records compile to headless effect programs**, up from 402/427 in v0.14.
- The broad synthetic execution probe reports 375 immediate successes, 50 blocked because an in-play Pokémon has an unported Power, and 2 Mirror Move cases lacking the attack-on-previous-turn prerequisite. These are not 52 intrinsic compile failures.
- This is **not a claim of 100% authentic gameplay**, nor does the test suite cover every pairwise card interaction. Metronome currently copies straightforward effects and rejects copied attacks needing separately migrated, nested interactive resolution; Mirror Move reproduces recorded final damage and direct Special Conditions but not every conceivable copied attack effect; Pokémon Power suppression and several reactive interactions require the headless Power engine to become authoritative.
- There are still **52 historical Pokémon Power records and 41 Trainer card records** in Classic needing portable behavioral migration and verification. Complex cross-effect timing, Special Energy, and the browser-client switch to this engine remain open.
- The strict historical fidelity gate across the full 1,123-card archive is **expected to fail** and should not be bypassed.

## Local usage

```sh
npm start
# open http://localhost:8000 for the current legacy local duel
npm run test:classic
npm run audit:classic
npm run audit:classic:execute
```

Next recommended major milestone: headless Pokémon Power and Trainer coverage for Classic, followed by a real browser client using `headless_duel.js` as its only rules authority.
