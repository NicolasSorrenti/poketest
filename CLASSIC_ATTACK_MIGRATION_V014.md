# Neo Campus Classic v0.14 — Historical Attack Migration

## Scope and outcome

The headless engine is focused on the first four original sets: Base Set, Jungle, Fossil, and Team Rocket (311 card records). The full archive remains available for future formats.

- Previous headless Classic compiler coverage: **273 / 427** attack records in v0.13.
- Current headless Classic compiler coverage: **402 / 427** (94.1%).
- Newly compiled: **129 historical attack records**.
- Unported: **25 historical attack records**.
- Synthetic authoritative-reducer execution probe: **352 passed**, **50 blocked due to active Pokémon Powers that are not yet ported**. These are NOT behavioral certifications for all game states.

| Set | Compiled / Total | Unported |
|---|---:|---:|
| Base Set | 109 / 114 | 5 |
| Jungle | 109 / 113 | 4 |
| Fossil | 87 / 90 | 3 |
| Team Rocket | 97 / 110 | 13 |

## Migration families

The pure interpreter and headless reducer now have new contracts for damage modifiers, strong Poison, optional recoil and damage prevention, immunity windows, defensive retaliation modifiers, conditional targeting and switching, attacker and defender Energy discards, Water Gun extra Energy bonuses, searching and attaching from the deck, recovery from discard, variable coin attacks, Trainer locks, deck milling, self-evolution, returned/reshuffled Active Pokémon, and weakness/resistance type conversion.

Unlike name-only registration, the implementation includes choices, transactional invalid-action rollback, and state transitions for these behaviors. Unported programs fail closed. The headless engine's existing two-player private-view protocol remains independent of its graphical client.

### Historical randomness correction

The seeded RNG previously used the lowest bit of a linear congruential generator for heads/tails, making coin flips alternate predictably. The headless engine now uses high bits. This changes seed-specific game transcripts, but fixed seeds still replay identically from the new version onward.

### Verification

- `npm test` — existing project suite plus new historical-effect scenarios: **passed**.
- `npm run test:classic` — Classic format/decks, **26** new migration checks, **13** additional advanced action/timing groups, and **220** completed seeded headless duels with supported deck subsets: **passed**.
- `npm run audit:classic` — prints exact per-set coverage.
- `npm run audit:classic:execute` — synthetic reducer probe; see `CLASSIC_EXECUTION_PROBE.json`.
- `CLASSIC_COVERAGE.json` — every supported/unsupported attack card record.

## What is NOT finished

**Do not use 94% compiler coverage as a claim of full historical gameplay correctness.** Several programs cannot currently run when the Pokémon has an unported Power, and the 25 remaining attacks include copied attacks, reaction timing, and multi-step Energy movement. The original local browser game still uses its legacy rules executor; it has **not** been switched over to the authoritative headless path yet. Pokémon Powers (52 records) and Trainer cards (41) still need a separate authoritative migration and interaction audit.

### Remaining Classic attack records (25)

- `base1-5` **Clefairy — Metronome**
- `base1-10` **Mewtwo — Barrier**
- `base1-22` **Pidgeotto — Mirror Move**
- `base1-38` **Poliwhirl — Amnesia**
- `base1-50` **Gastly — Destiny Bond**
- `base2-1` **Clefable — Metronome**
- `base2-17` **Clefable — Metronome**
- `base2-45` **Rhydon — Ram**
- `base2-62` **Spearow — Mirror Move**
- `base3-8` **Hypno — Prophecy**
- `base3-23` **Hypno — Prophecy**
- `base3-55` **Slowpoke — Scavenge**
- `base5-2` **Dark Arbok — Stare**
- `base5-4` **Dark Charizard — Continuous Fireball**
- `base5-11` **Dark Magneton — Magnetic Lines**
- `base5-19` **Dark Arbok — Stare**
- `base5-21` **Dark Charizard — Continuous Fireball**
- `base5-28` **Dark Magneton — Magnetic Lines**
- `base5-32` **Dark Charmeleon — Fireball**
- `base5-34` **Dark Electrode — Energy Bomb**
- `base5-35` **Dark Flareon — Playing with Fire**
- `base5-37` **Dark Golduck — Third Eye**
- `base5-42` **Dark Persian — Fascinate**
- `base5-44` **Dark Rapidash — Flame Pillar**
- `base5-46` **Dark Wartortle — Mirror Shell**

## Run locally

```bash
npm start
```

Then visit http://localhost:8000 to test the existing browser game. To test the portable game engine specifically:

```bash
npm run test:classic
npm run audit:classic
npm run audit:classic:execute
```

This project is a noncommercial fan implementation. Public deployment of official Pokémon cards and assets may require intellectual-property authorization.
