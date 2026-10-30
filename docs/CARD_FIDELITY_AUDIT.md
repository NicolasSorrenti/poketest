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

The [per-card and per-effect ledger](CARD_FIDELITY_LEDGER.json) tracks all 1,123 catalog records. Entries start as unreviewed; partial entries specify exactly which scenarios were tested. It is an inventory, not a fidelity certificate.

## Evidence recorded so far

| Card | Scope of check | Evidence | Status |
| --- | --- | --- | --- |
| Item Finder (base1-74) | Recovering a Trainer discarded as its cost, including a copy via Sabrina's Psychic Control | test_item_finder_paid_trainer.js; PR #231 | Fixed and merged; other interactions not yet certified |
| Old Rod (neo3-64) | Two matching coin results with an eligible card; recovery is mandatory | test_old_rod_fidelity.js | Fixed and merged in PR #236; other interactions not yet certified |
| Super Rod (neo1-103) | Coin flip with an eligible card; recovery is mandatory | test_super_rod_fidelity.js | Fixed and merged in PR #238; other interactions not yet certified |
| Moo-Moo Milk (neo1-101) | Target eligibility for damaged and undamaged Pokémon | test_moo_moo_milk_fidelity.js | Fixed and merged in PR #239; coin outcomes and other interactions not yet certified |

| Alakazam (base1-1) | Confuse Ray damage and both coin outcomes | test_card_fidelity_base_batch01.js | Partial; other interactions not certified |
| Blastoise (base1-2) | Hydro Pump bonus and cap with Water and non-Water Energy | test_card_fidelity_base_batch01.js | Partial; other interactions not certified |
| Hitmonchan (base1-7) | Jab and Special Punch damage, weakness, resistance, and typed cost | test_card_fidelity_base_batch01.js | Partial; other interactions not certified |

| Chansey (base1-3) | Scrunch heads/tails against Bubblebeam, including paralysis; Double-edge damage | test_card_fidelity_base_batch02.js | Partial; independent print/ruling review and other interactions pending |
| Charizard (base1-4) | Fire Spin cost and mixed Energy choice; Energy Burn conversion, expiry and status restrictions | test_card_fidelity_base_batch02.js | Partial; independent print/ruling review and other interactions pending |
| Gyarados (base1-6) | Dragon Rage and Bubblebeam damage, costs and coin outcomes | test_card_fidelity_base_batch02.js | Partial; independent print/ruling review and other interactions pending |

These scenarios use the TCGdex-sourced catalogue text. Printed card images and applicable historical rulings still need independent review. Tests exercise the shared reducer in Classic, Neo, online-preview, and 40-card Cube configurations; they do not establish client or network integration.

| Clefairy (base1-5) | Sing heads/tails and Sleep recovery; Metronome copying Fire Spin, waived discard and Energy cost rejection | test_card_fidelity_clefairy.js | Partial; other copied effects and print/ruling review pending |

| Nidoking (base1-11) | Toxic replaces ordinary poison, deals 20 at consecutive checkups and logs the actual damage | test_card_fidelity_nidoking.js | Partial; other interactions and independent print/ruling review pending |

| Machamp (base1-8) | Seismic Toss cost and Strikes Back knockout timing/status restrictions | test_card_fidelity_machamp.js | Partial; independent print/ruling review and remaining interactions pending |

| Magneton (base1-9) | Thunder Wave coin/status outcomes and cost; Selfdestruct Active, Bench and recoil damage, weakness/resistance note, cost and knockout | test_card_fidelity_magneton.js | Partial; independent print/ruling review and other interactions pending |
| Mewtwo (base1-10) | Psychic counts attached Energy cards (not units); Barrier's Psychic Energy discard, equivalent-choice auto-resolution, Rainbow Energy choice, and prevention of damage/paralysis on the next turn | test_card_fidelity_mewtwo.js | Partial; PokémonTCG card data says Psychic Energy where the imported catalogue and Bulbapedia transcription say Energy; scan/ruling check and other interactions pending |
| Ninetales (base1-12) | Fire Blast auto-discards identical Fire cards; preserves choice between Basic Fire and Rainbow Energy | test_typed_energy_discard_audit.js | Partial; Lure and other Fire Blast interactions pending |
| Light Flareon (neo4-46) | Burning Flame heads, damage, mandatory Fire discard count, equivalent-choice auto-resolution and discard notification | test_typed_energy_discard_audit.js | Partial; other interactions and print/ruling review pending |
| Shining Mewtwo (neo4-109) | Psyburst automatic Fire Energy discard among identical cards, preservation of other Energy and discard notification | test_typed_energy_discard_audit.js | Partial; Reflect Shield and other interactions pending |


The full card-by-card fidelity review is **not complete**. Do not count the other cards or untested branches of the cards above as verified. Existing Classic execution probing covers 427 attack records in a manufactured scenario; it checks execution, not correctness or all possible choices.
