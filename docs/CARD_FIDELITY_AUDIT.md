# Card effect fidelity audit

Baseline: main commit ea22ef43a248ab723e3302c20465563aec34429e (2026-10-30).

Goal: review every in-scope card's printed effect, relevant historical rulings, and actual authoritative reducer behavior. A registered handler, source-code match, or successful smoke run is not proof of correct behavior. Record each individual effect only after checking its costs, choices and ownership, timing, conditions, and observable results; include interactions and test references. Reprints can share evidence only after their text and rules are compared.

## Catalog scope

| Set | Cards |
| --- | ---: |
| Base Set | 102 |
| Jungle | 64 |
| Fossil | 62 |
| Base Set 2 | 130 |
| Team Rocket | 83 |
| Black Star Promos | 53 |
| Gym Heroes | 132 |
| Gym Challenge | 132 |
| Neo Genesis | 111 |
| Neo Discovery | 75 |
| Neo Revelation | 66 |
| Neo Destiny | 113 |
| Total | 1,123 |

The [per-card and per-effect ledger](CARD_FIDELITY_LEDGER.json) tracks all 1,123 catalog records. Entries start as unreviewed; partial entries specify exactly which scenarios were tested. It is an inventory, not a fidelity certificate.\n\n## Evidence recorded so far

| Card | Scope of check | Evidence | Status |
| --- | --- | --- | --- |
| Item Finder (base1-74) | Recovering a Trainer discarded as its cost, including a copy via Sabrina's Psychic Control | test_item_finder_paid_trainer.js; PR #231 | Fixed and merged; other interactions not yet certified |
| Old Rod (neo3-64) | Two matching coin results with an eligible card; recovery is mandatory | test_old_rod_fidelity.js | Fixed and merged in PR #236; other interactions not yet certified |

|\n| Super Rod (neo1-103) | Coin flip with an eligible card; recovery is mandatory | test_super_rod_fidelity.js | Fixed and merged in PR #238; other interactions not yet certified |

|\n| Moo-Moo Milk (neo1-101) | Target eligibility for damaged and undamaged Pokémon | test_moo_moo_milk_fidelity.js | Fixed and merged in PR #239; coin outcomes and other interactions not yet certified |

The full card-by-card fidelity review is **not complete**. Do not count the other cards or untested branches of the cards above as verified. Existing Classic execution probing covers 427 attack records in a manufactured scenario; it checks execution, not correctness or all possible choices.
