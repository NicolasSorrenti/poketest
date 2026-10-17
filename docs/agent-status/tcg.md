# Neo Campus TCG — engineering status

Updated: 2026-10-17. Target: Base Set through Neo Destiny (Neo 4). Canonical branch: `main`.

## Verification contract

- "Signature recognized" means a card's attack/power text can be classified, NOT that its gameplay is complete.
- "Implemented" means a reducer path, legally bounded decisions and at least a focused regression scenario exist.
- "Verified" means the focused tests and complete `npm test` regression suite succeeded in GitHub Actions for the listed commit.
- All local CPU and online games use `headless_duel.js` as the shared authoritative reducer. Full live two-browser and Render acceptance tests are not yet certified.

## Verified milestones in this execution session

| Milestone | Git commit | Gameplay changes | Evidence |
| --- | --- | --- | --- |
| Neo v0.55 | `3954959bb8` plus tests `bc9b81a266` | Mary, PokéGear, Super Energy Retrieval, Time Capsule, Pokémon Personality Test, Impostor Professor Oak's Invention; six Trainer printings | GitHub Actions run [39013225555](https://github.com/NicolasSorrenti/poketest/actions/runs/39013225555), PASS |
| Neo v0.56 | `cc3b29cfdd` plus regression fixes `c9839418a0` | Sprout Tower, Broken Ground Gym, Healing Field, Radio Tower, Lucky Stadium; five Stadium printings; CPU/online action support, live use button | GitHub Actions run [39013729444](https://github.com/NicolasSorrenti/poketest/actions/runs/39013729444), PASS |

- Total newly registered, curated Neo Trainer/Stadium printings from v0.55-v0.56: **11**.
- Historical Stadium text was checked against Neo Genesis and Neo Destiny card references; implementation respects the printed reduction/retreat semantics.
- v0.56 tests cover 30-point post-Weakness/Resistance reduction, Basic retreat surcharge, heads/tails action outcomes, once-per-turn limits and private Radio Tower views.

| Neo v0.57 | `64f528ec9a` plus regression fixes `6f8fcb0dbd` | Rainbow Energy and Miracle Energy: wildcard typed costs, 10-damage attach effect, Miracle recipient restrictions, singleton deck rule and owner turn-end discard | GitHub Actions run [39014085128](https://github.com/NicolasSorrenti/poketest/actions/runs/39014085128), PASS |
| Neo v0.58 | `9acce58e4c` plus regression fix `5e5ade8f52` | Baby-to-Basic legal evolutions, individual-Pokémon evolution turn checks, Gym-family restrictions and independent Active-slot evolution | GitHub Actions run [39014211528](https://github.com/NicolasSorrenti/poketest/actions/runs/39014211528), PASS |

- v0.57 and v0.58 add **verified mechanical behavior** rather than merely adding text signatures. They do not unlock every Baby evolution combo or every Energy interaction.

## Coverage limitations

The existing `attack_coverage.json` currently counts 1,479/1,479 classified signatures across 1,123 cards, but classification is not proof that 1,479 attacks are fully implemented or individually verified. The `power_coverage.json` and `trainer_coverage.json` artifacts are also snapshots; the latter describes 178 cards, 170 marked handler and 8 partial, without exhaustive dynamic timing verification. These totals MUST NOT be shown as authentic gameplay coverage percentages.

The curated deck pool is a strict subset of the 1,123-card archive; untested Neo printings should remain gated rather than represented as complete.

## Open correctness gaps / risks

1. **Special Energy fidelity**: Rainbow typed costs and attachment damage, and Miracle Energy attachments/expiry now have focused tests. Recycle Energy return-from-play, effects treating Rainbow as each named basic type, and cross-Power Energy modifiers remain unresolved.
2. **Baby and Gym evolution edge cases**: normal Baby-to-Basic and first-turn rules now have tests. Verify Baby evolution counted as an Evolved Pokémon for every effect and special Gym Trainer overrides.
3. **Copied attack effects** with nested payment, targeting, redirection and reactive choices; Super Metronome and Sketch remain guarded for unsupported operations.
4. **Pokémon Powers** whose timing depends on Bench transitions, on-play status, suppression, multi-KO and forced promotions.
5. **Stadium timing** when a Stadium is replaced during a turn or a nested forced switch is underway; the current Stadium action is deliberately restricted to once per player's turn.
6. **Trainer reactive tools** such as EXP.ALL, Focus Band, Miracle Berry and Gold Berry; confirm cross-turn tool timing and simultaneous KOs.
7. **Multiplayer browser E2E** and Render deployment remain unverified; reducers are unit-tested using the same shared Node implementation.

## Next prioritized tasks

1. Implement Recycle Energy return-from-play with conservation tests for retreat, attacks, Energy Removal and knockouts; confirm Rainbow named-type interactions.
2. Extend Baby/Gym evolution rules for special Trainer-granted exceptions and ensure evolved Baby-to-Basic is classified as Evolved for attack interactions.
3. Implement remaining Neo Trainers / reactive tools and Stadium replacement timing using actual in-game tests.
4. Re-run `npm test` and update this file **only after green CI**, retaining unresolved issues rather than declaring completion.
