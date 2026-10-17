# Neo Campus TCG — gameplay engineering status

**Updated:** 2026-10-17  
**Repository:** `NicolasSorrenti/poketest`, branch `main`  
**Scope:** original Base Set through Neo Destiny (Neo 4).

## Verification policy

A recognized attack signature or a handler name is **not** proof of complete historical behavior. "Verified below" means the implemented effect was exercised in a focused reducer regression and both `npm test` and the separate Node regression workflow passed for the listed commit. These are tests on the shared server-authoritative CPU/online engine, not a certification of every human multiplayer browser path.

## Verified gameplay milestones

| Version | Verified changes | Passing TCG workflow | Passing combined Node workflow |
| --- | --- | --- | --- |
| v0.55 | Six interactive Trainer printings: Mary, PokéGear, Super Energy Retrieval, Time Capsule, Pokémon Personality Test, Impostor Professor Oak's Invention | [39013225555](https://github.com/NicolasSorrenti/poketest/actions/runs/39013225555) | Same workflow's full regression at that time |
| v0.56 | Five Stadium printings; passive/activated effects, owner-only Radio Tower peek and once-per-turn action | [39013729444](https://github.com/NicolasSorrenti/poketest/actions/runs/39013729444) | Same workflow |
| v0.57 | Rainbow and Miracle Energy: typed attack payments, recipient restriction, attachment damage, two-unit Miracle output, expiry | [39014085128](https://github.com/NicolasSorrenti/poketest/actions/runs/39014085128) | Same workflow |
| v0.58 | Baby-to-Basic evolution, first-turn and Gym-name legality, per-Pokémon evolution tracking | [39014211528](https://github.com/NicolasSorrenti/poketest/actions/runs/39014211528) | Same workflow |
| v0.59 | Recycle Energy return from attached play after retreat, KO and Trainer discards; hand discards excluded | [39014820392](https://github.com/NicolasSorrenti/poketest/actions/runs/39014820392) | [39014820386](https://github.com/NicolasSorrenti/poketest/actions/runs/39014820386) |
| v0.60 | Multi-unit retreat costs: Double Colorless/Miracle, optional exact card payment and rollback on invalid choices | [39015045318](https://github.com/NicolasSorrenti/poketest/actions/runs/39015045318) | [39015045324](https://github.com/NicolasSorrenti/poketest/actions/runs/39015045324) |
| **v0.61** | **Focus Band**, **EXP.ALL**: genuine attack-KO timing, defending-owner Basic Energy transfer choice, Tool exclusivity and rollback | [39041479868](https://github.com/NicolasSorrenti/poketest/actions/runs/39041479868) | [39041479894](https://github.com/NicolasSorrenti/poketest/actions/runs/39041479894) |
| **v0.62** | **Gold Berry**, **Miracle Berry**; existing **Berry** corrected for optional between-turn and mandatory start-turn behavior on both owners' Pokémon | [39042096556](https://github.com/NicolasSorrenti/poketest/actions/runs/39042096556) | [39042096583](https://github.com/NicolasSorrenti/poketest/actions/runs/39042096583) |
| **v0.63** | **Balloon Berry** corrected zero Retreat Cost, **Super Scoop Up** complete return to hand/promotion, **Magnifier** Resistance bypass and expiry | [39042461702](https://github.com/NicolasSorrenti/poketest/actions/runs/39042461702) | [39042461758](https://github.com/NicolasSorrenti/poketest/actions/runs/39042461758) |
| **v0.64** | **New Pokédex** real shuffled top-five ordering, **Energy Amplifier** cost/coin/search, **Thought Wave Machine** coin-until-tails, returned Energy and immediate turn end | [39042937170](https://github.com/NicolasSorrenti/poketest/actions/runs/39042937170) | [39042937174](https://github.com/NicolasSorrenti/poketest/actions/runs/39042937174) |

Four latest milestones were pushed through commits `04ec8653df`, `f67e9ffe8b`, `84ab669080` and `8203947574`, followed by focused test and fix commits, including `8a082eb684`, `d726b28848`, `ac5475a463`, `5993873239`, and `88a7007255`. Other agents' RPG work was preserved; updates used forward-only `main` changes with no force-push.

**Latest test chain:** `npm test` executes **147 sequential Node test commands**, including `test_neo_batch_v061.js`, `v062`, `v063` and `v064`. The `TCG Gameplay Regression` workflow runs it separately from the broader Node/RPG regression workflow.

## Coverage accounting (do not overclaim)

- **Neo-series Trainer archive:** 44 printings, **42 with registered effect handlers**, **2 without handlers** after v0.64. Handler availability is *not* a count of fully authenticated implementations.
- **Unported Neo Trainers:** `neo1-84` **Ecogym** (opponent-caused attached Energy discard, excluding KO), and `neo1-92` **Card-Flip Game** (opponent Prize guess and permanently face-up Prize state).
- **Pokémon Powers:** `power_coverage.json` lists 166 Power cards / 136 unique Power names and names with handlers, but not exhaustive dynamic trigger verification.
- **Attacks:** `attack_coverage.json` lists 1,479 recognized signatures across 1,123 scanned historical cards; this is classification coverage, **not** verified attack execution coverage. Legacy interpreter audits still flag conditional/unported cases.
- **Old coverage snapshots:** `trainer_coverage.json` is a static snapshot (178 cards, 170 handler, 8 partial) and must be refreshed with dynamic evidence before representing current runtime fidelity.

## Known risks and unresolved interactions

1. Ecogym and Card-Flip Game require stateful cross-event tracking and privacy-safe face-up Prize representations; neither was declared complete.
2. Focus Band, EXP.ALL and Berry effects need additional tests for simultaneous double KOs, multiple holders, KO while Poisoned, defensive Power interactions, and attacker-induced replacement.
3. Copied attacks (Sketch / Super Metronome / Gym copying) still exclude certain nested choices, payment/redirection chains, and opponent-controlled decisions.
4. Rainbow Energy named-type modifiers and Recycle Energy mixed discard/retrieval transactions still need a card-instance-level audit.
5. Multi-Stadium replacement timing, some special Gym evolution exceptions, and older Trainer/Pokémon Power suppressed-status interactions still have edge cases.
6. The CI suite exercises the shared authoritative reducer but does **not** certify a full two-browser live multiplayer session or independently verify a Render deployment.
7. The corrected Balloon Berry zero-Retreat-Cost wording follows documented historical errata; complex interactions with opponent-imposed retreat surcharges should be separately tested.

## Next priorities

1. Implement **Ecogym** with opponent-caused non-Colorless Energy discard provenance and KO exceptions; add comprehensive conservation and timing tests.
2. Implement **Card-Flip Game** with publicly revealed opponent Prize identities and privacy-safe permanent face-up state through Prize selection and save/load.
3. Expand attack-copy decision tests and reactive multi-KO scenarios, then audit broader Neo Powers and Gym modifiers.
4. Repeat both CI suites and an actual two-client multiplayer smoke test. Update this document with reproducible pass/fail evidence, never handler-only completion claims.
