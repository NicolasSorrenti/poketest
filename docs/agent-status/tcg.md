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

| **v0.65** | **Card-Flip Game** masked face-down Prize choice, hidden type guess, persistent public face-up reveal and correct-only draw; fixed online Prize indexing | [39044285607](https://github.com/NicolasSorrenti/poketest/actions/runs/39044285607) | [39044285605](https://github.com/NicolasSorrenti/poketest/actions/runs/39044285605) |
| **v0.66** | **Ecogym** non-Colorless Energy returned on opponent-caused non-KO discards, including staged Trainer choices, Colorless exclusions and Stadium replacement | [39044285607](https://github.com/NicolasSorrenti/poketest/actions/runs/39044285607) | [39044285605](https://github.com/NicolasSorrenti/poketest/actions/runs/39044285605) |
| **v0.67** | Face-up Prizes displayed on correct local/online Prize rail for Player 1, Player 2 and spectators. Ecogym tested through Dragonair's Hyper Beam and Koga's Muk's one-Energy automatic and multi-Energy defender-owned Power choice; corrected reactive discard provenance. | [39044947944](https://github.com/NicolasSorrenti/poketest/actions/runs/39044947944) | [39044947981](https://github.com/NicolasSorrenti/poketest/actions/runs/39044947981) |

| **v0.68** | Two EXP.ALL holders, defender-owned choice and single Tool consumption, Focus Band saving versus EXP.ALL KO, Bench Focus Band splash damage, simultaneous Double-KO Prizes and promotions | [39045253800](https://github.com/NicolasSorrenti/poketest/actions/runs/39045253800) | [39045253794](https://github.com/NicolasSorrenti/poketest/actions/runs/39045253794) |

| **v0.69** | Super Metronome and Sketch copy additional audited effect families: shield, healing, coin draw, Energy-coin attacks, basic locks and conditions; Super Metronome hides unpayable additional discard costs and consumes its turn on heads with no eligible targets | [39046656398](https://github.com/NicolasSorrenti/poketest/actions/runs/39046656398) | [39046656344](https://github.com/NicolasSorrenti/poketest/actions/runs/39046656344) |
| **v0.70** | Actual prior-turn Sketch witness history verified with live Charizard Fire Spin, Benched Smeargle promotion, waived Fire Spin extra Energy discard, late witness, switched attacker, stale turn | [39046733590](https://github.com/NicolasSorrenti/poketest/actions/runs/39046733590) | [39046733585](https://github.com/NicolasSorrenti/poketest/actions/runs/39046733585) |

| **v0.71** | Original Metronome secondary targets: Lure, Teleport, Dark Mind, Flitter and Whirlwind. Actor authorization, target rollback, and Misty's Psyduck ESP copied Teleport with own Bench and empty opposing Bench. | [39048106016](https://github.com/NicolasSorrenti/poketest/actions/runs/39048106016) | [39048106004](https://github.com/NicolasSorrenti/poketest/actions/runs/39048106004) |
| **v0.72** | Firestorm and copied Firestorm can discard attached Rainbow / Miracle Energy as matching typed Energy **cards** in play; authentic colorless exclusions and card conservation, with insufficient Energy transactionally rejected. | [39048512901](https://github.com/NicolasSorrenti/poketest/actions/runs/39048512901) | [39048512615](https://github.com/NicolasSorrenti/poketest/actions/runs/39048512615) |
| **v0.73** | Misty's Psyduck ESP copies targeted Flitter and Coin Hurl, including Active-only target and independent attack flip; safely copies defensive Minimize, preserving original triple-head result. | [39048881789](https://github.com/NicolasSorrenti/poketest/actions/runs/39048881789) | [39048881783](https://github.com/NicolasSorrenti/poketest/actions/runs/39048881783) |

| **v0.74** | Super Metronome and Sketch copy targeted opponent Active/Bench attacks (Flitter/Coin Hurl), including independent copied coin outcomes, legal target selection, invalid choice rollback and a witnessed Sketch example. | [39072026082](https://github.com/NicolasSorrenti/poketest/actions/runs/39072026082) | [39072026095](https://github.com/NicolasSorrenti/poketest/actions/runs/39072026095) |
| **v0.75** | Misty's Psyduck ESP copies extra Energy-discard attacks with owner-authorized exact payment and replay-safe three-head handling; generic Fire Spin vs typed Firestorm, Rainbow eligibility, Water Weakness KO and no-payable/no-handler results that cannot be retried for free. | [39072847964](https://github.com/NicolasSorrenti/poketest/actions/runs/39072847964) | [39072847994](https://github.com/NicolasSorrenti/poketest/actions/runs/39072847994) |

The initial four milestones were pushed through commits `04ec8653df`, `f67e9ffe8b`, `84ab669080` and `8203947574`, followed by focused test and fix commits, including `8a082eb684`, `d726b28848`, `ac5475a463`, `5993873239`, and `88a7007255`. Other agents' RPG work was preserved; updates used forward-only `main` changes with no force-push.

**Latest test chain:** `npm test` executes **162 sequential Node test commands**, including `test_neo_batch_v061.js` through `test_neo_batch_v075.js` plus four incremental Prize/Trainer regression scripts. The `TCG Gameplay Regression` workflow runs it separately from the broader Node/RPG regression workflow.

## Incremental Prize/Trainer rule fixes — v0.76 through v0.79

Small, sequential, independently tested commits:

| Version | Commit | Verified rules change | TCG / Node evidence |
| --- | --- | --- | --- |
| v0.76 | [c828df9](https://github.com/NicolasSorrenti/poketest/commit/c828df9cdbb935f015b72688a5154d7380bd11f7), test correction [e7fb7c7](https://github.com/NicolasSorrenti/poketest/commit/e7fb7c778be6aa8c8a92f53281031530ace95b7f) | Impostor Professor Oak's Invention clears stale Card-Flip reveal flags only if old Prizes are replaced; decline preserves flags; global reveal still applies | [TCG 39088022391](https://github.com/NicolasSorrenti/poketest/actions/runs/39088022391), [Node 39088022430](https://github.com/NicolasSorrenti/poketest/actions/runs/39088022430) |
| v0.77 | [ef9cf30](https://github.com/NicolasSorrenti/poketest/commit/ef9cf300af8302f756841437c9f8cc46b327c7d7) | Lt. Surge's Treaty takes the specifically selected Prize for each owner and shifts that owner's visibility markers; draw-only branch preserves Prizes | [TCG 39088239935](https://github.com/NicolasSorrenti/poketest/actions/runs/39088239935), [Node 39088239910](https://github.com/NicolasSorrenti/poketest/actions/runs/39088239910) |
| v0.78 | [9b326c1](https://github.com/NicolasSorrenti/poketest/commit/9b326c1ca8d945bfa95ad3d14d9b91cc8dd03d93), test correction [7822b12](https://github.com/NicolasSorrenti/poketest/commit/7822b12577288a9e64542b10caa0789af694c164) | Misty's Wish: opponent denial draws one and returns inspected Prize face-down; approved exchange adds new face-down Prize; approval without spare hand card never draws | [TCG 39088503035](https://github.com/NicolasSorrenti/poketest/actions/runs/39088503035), [Node 39088502979](https://github.com/NicolasSorrenti/poketest/actions/runs/39088502979) |
| v0.79 | [ae799c4](https://github.com/NicolasSorrenti/poketest/commit/ae799c483140ba595b59a9902602fb8f29c8f0e5) | Treaty taking final Prize sets victory, including opposing player's victory; simultaneous last Prizes record unresolved historic sudden death | [TCG 39088650777](https://github.com/NicolasSorrenti/poketest/actions/runs/39088650777), [Node 39088650737](https://github.com/NicolasSorrenti/poketest/actions/runs/39088650737) |

**Current `npm test` chain:** 162 sequential Node test commands. These four milestones add `test_neo_batch_v076.js`, `test_gym_treaty_prizes_v077.js`, `test_gym_misty_wish_v078.js`, and `test_gym_treaty_victory_v079.js`. All changes were pushed as fast-forward commits, preserving concurrent RPG and CPU changes.

## Coverage accounting (do not overclaim)

- **Neo-series Trainer archive:** 44 printings, **44 with registered effect handlers**, **0 missing handlers** after v0.66. Handler availability is *not* a count of fully authenticated implementations.
- **Previously missing Neo Trainers:** `neo1-84` Ecogym and `neo1-92` Card-Flip Game now have transactional implementations and focused tests. This is handler coverage, not exhaustive proof against every timing, ownership or interaction edge case.
- **Pokémon Powers:** `power_coverage.json` lists 166 Power cards / 136 unique Power names and names with handlers, but not exhaustive dynamic trigger verification.
- **Attacks:** `attack_coverage.json` lists 1,479 recognized signatures across 1,123 scanned historical cards; this is classification coverage, **not** verified attack execution coverage. Legacy interpreter audits still flag conditional/unported cases.
- **Old coverage snapshots:** `trainer_coverage.json` is a static snapshot (178 cards, 170 handler, 8 partial) and must be refreshed with dynamic evidence before representing current runtime fidelity.

## Known risks and unresolved interactions

1. **Ecogym corner cases:** opponent-caused discards through Trainer, Dragonair attack, and Koga's Muk Power now have verified tests. Simultaneous compound discards on evolving/devolving or indistinguishable identical Pokémon, and Energy originally owned by a different player, require per-card instance tracking beyond the tested matching by surviving host. **Card-Flip Game:** face-up Prize data projects to both browser seats and spectators and its online/local Prize rail placement has a regression guard; actual cross-browser rendering/reconnect still lacks full browser automation.
2. Focus Band / EXP.ALL now have tests for simultaneous Active KOs, Benched Focus Band, both coin outcomes, two EXP.ALL holders and exactly one selected Basic Energy. Remaining unverified cases include Poison-related KO timing, multiple simultaneous Bench KOs, defensive Pokémon Power suppression and attacker-induced replacement.
3. **Attack copying:** Metronome, Super Metronome and Sketch now have secondary target decisions, witnessed copy tests, defense/heal/draw outcomes and any-opponent Active/Bench choices. Misty's Psyduck ESP now has paid Fire Spin/typed Firestorm and no-free-reroll tests. Still unsupported: unclassified effects, deeply nested redirection, copied subattacks requiring opponent-only hand/deck decisions, and some Gym copy modes. A handler/test is not universal copy coverage.
4. **Rainbow Energy** now has tested named-Fire typed discard payments as attached Energy, including copied Firestorm, with no Basic-card treatment in deck/hand. Other named-type modifiers, Miracle Energy identity edge cases, and Recycle Energy mixed discard/retrieval transactions still need a card-instance-level audit.
5. Multi-Stadium replacement timing, some special Gym evolution exceptions, and older Trainer/Pokémon Power suppressed-status interactions still have edge cases.
6. The CI suite exercises the shared authoritative reducer but does **not** certify a full two-browser live multiplayer session or independently verify a Render deployment.
7. The corrected Balloon Berry zero-Retreat-Cost wording follows documented historical errata; complex interactions with opponent-imposed retreat surcharges should be separately tested.

## Next priorities

1. Expand audited copied-attack handling for multi-stage opponent-owned decisions, status/KO redirection and unsupported scripts; test both Neo Discovery Smeargle printings and combined reactive effects. Preserve no-free-reroll behavior for unavailable copies.
2. Extend Ecogym to rare duplicate-host and ownership-transfer paths with identity-based energy tracing; verify no false returns from Knock Outs and same-player costs.
3. Run genuine two-browser acceptance for online face-up Prizes and Prize selection across reconnect/save/load, including Card-Flip Game, Here Comes Team Rocket!, Misty's Wish, Lt. Surge's Treaty and Impostor Invention.
4. Re-run dedicated TCG, combined Node and CPU/multiplayer suites after fixes, and update this document only with reproducible pass/fail evidence.
