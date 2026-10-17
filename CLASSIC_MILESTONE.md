# Neo Campus Classic — Base Set through Team Rocket (preview)

## Playable format

This milestone scopes playable decks to the **311 printed card records** from:

- Base Set (102, `base1`)
- Jungle (64, `base2`)
- Fossil (62, `base3`)
- Team Rocket (83, `base5`)

Base Set 2, Gym, Neo, and Wizards Promos are **not legal** in Classic decks. Their bundled data remains intact in the card archive for eventual addition. Format validation checks **printed IDs**, 60-card deck size, four-copies-per-name limit (except basic Energy), and presence of a Basic Pokémon. In local play the format is applied before game setup; `roomAdapter()` selects Classic by default. The low-level `createGame` retains `format:'unrestricted'` for backward-compatible tests and future expansion modes; to enforce Classic explicitly, pass `format:'classic'`.

## New executable headless attack families

The portable effect interpreter has gained strict printed-text support for damage based on the attacker's or defender's damage counters, Bench size, short-form multi-coin attack text, split-heads/tails Special Conditions, coin bonus + recoil, and ignoring Weakness and Resistance where the card specifies it. Those effects are calculated during resolution, using current battle state—not guessed at import time. Attack subject names are checked against the acting Pokémon where needed.

**Classic coverage (compiled effect support, not full fidelity certification):**

| Set | Attacks | Executable | Unported |
| --- | ---: | ---: | ---: |
| Base Set | 114 | 84 | 30 |
| Jungle | 113 | 72 | 41 |
| Fossil | 90 | 57 | 33 |
| Team Rocket | 110 | 60 | 50 |
| **Total** | **427** | **273** | **154** |

Before this milestone the Classic subset had 250 executable attack records. The **23 additional records** are verified compiler patterns, with targeted behavioral tests for representative attacks.

**Still missing:** 154 headless attack records; headless implementations of 52 Pokémon Power records and most of the 41 Trainer cards; historical interaction timing and full-game real-deck verification; replacing the legacy browser engine with the authoritative reducer. Existing browser scripts remain playable, but are not certified historically accurate. The local duel against CPU continues to use the legacy engine.

## Local testing

From `neo-campus-work`:

```bash
npm start
# open http://localhost:8000
npm run test:classic
npm run audit:classic
npm test
```

The historical archive remains available through the catalog filter, which defaults to Classic legal cards.

## Automated checks

- Independent Classic legality validation for local and online-room starting decks.
- 13 local deck selections start through the original Engine (six retail lists among them).
- 10 targeted attack-effect scenarios, plus the existing headless suite.
- 100 baseline, 60 status-heavy and 60 targeted seeded headless matches constrained to Classic, with card conservation and pending choices tested.
- Full legacy regression test suite passes.

## Future architecture

The Classic legal pool is a **format layer**, not a hard-coded limitation in the card engine. Gym/Neo data and effect code remain preserved, allowing gradual expansion once Base–Rocket is fully verified. Multiplayer, story mode, and Tag Team campaign UI remain out of scope for this checkpoint.
