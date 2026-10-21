# RPG NPC deck balance — Real duel benchmark and first targeted fixes

## Scope

This milestone introduces a reproducible headless duel audit and repairs specific rules/AI decision issues uncovered by it. It **does not** claim that the six opponents or the entire cast are competitively balanced.

No Pokémon attack text, HP, damage, Energy cost, coin odds, credit reward, shop price or CPU difficulty level has been adjusted. Classic, Cube and the player's starting deck remain independent of RPG-only character recipe changes.

## How to run

```sh
npm run balance:npcs -- --pairs 4 --max-turns 75 --npcs reina,hana,camila,marina,shiori,yuna --starters ember_garden,tidal_circuit,mind_and_muscle
node --test tests/rpg_npc_deck_balance.test.js tests/rpg_npc_deck_progression.test.js
```

The GitHub Actions `RPG NPC Deck Balance Benchmark` workflow runs the same matrix on changes to RPG NPC recipes, uploads `rpg-npc-deck-benchmark.json` and publishes per-match-up outcomes.

`scripts/benchmark-rpg-npc-decks.js` simulates an early/mid/late player collection by generating actual rarity-aware game boosters from unlocked sets, then upgrading the player's original 60-card starter deck using **only owned** Trainer cards. It uses `benchmark_cpu.duel` and the actual Classic reducer to play both decks with identical level-3 CPU policies. Every seed is tested with both seat orders. Deck legality and conservation are checked by the genuine rule engine. The benchmark selects `gym-expanded` or `online-preview` for campaign cards outside the original Base–Rocket format.

### Limitations

- The player economy and action choices are **modeled**, not replayed from actual 90-day saves.
- Only six opponents and three starter archetypes were sampled. The 24 games per NPC per stage have broad statistical uncertainty. Results are indicators for further investigation, **not human win probabilities** or guarantees.
- The NPCs all use fixed CPU level 3 in this test, deliberately separating deck recipes from character-specific CPU skill; actual RPG NPC skill profiles may vary.
- A match unfinished by the configured turn limit is counted as a draw/timeout, not a win.

## Results (432 matches, 4 mirrored pairs / NPC / player starter / stage)

Each NPC row has 24 games per stage. Scores are NPC wins, with ties/timeouts excluded only from the numerator. All 432 games were played without benchmark errors on [GitHub Actions run 39554539555](https://github.com/NicolasSorrenti/poketest/actions/runs/39554539555).

| Opponent | Early wins/24 | Mid wins/24 | Late wins/24 |
| --- | ---: | ---: | ---: |
| Reina | 18 | 20 | 20 |
| Hana | 14 | 16 | 17 |
| Camila | 12 | 8 | 4 |
| Marina | 20 | 18 | 13 |
| Shiori | 10 | 13 | 17 |
| Yuna | 7 | 16 | 8 |

Final across-all-NPC totals: early 81 NPC wins, 57 player wins, 6 draws/timeouts; mid 91 NPC wins, 52 player wins, 1 draw/timeout; late 79 NPC wins, 64 player wins, 1 draw/timeout.

For comparison, before Camila's Dark Vileplume changes the earlier same-seed full benchmark in [run 39552534388](https://github.com/NicolasSorrenti/poketest/actions/runs/39552534388) gave Camila **8/24 mid** and **5/24 late**. The focused Vileplume variant is not demonstrably stronger (8/24 mid and 4/24 late). It is important to retain this negative result rather than calling it a balance success.

Reina's Act II/III decks already appear much harder to defeat than Camila's. Avoid a blanket global boost to all opponents: it would make Reina even stronger. Per-archetype improvements should be evaluated on multiple seeds before release.

## Genuine fixes made while benchmarking

1. Avoid starting Item Finder without a recoverable Trainer and Computer Search without deck cards. The actual reducer remains authoritative; these are CPU preconditions, not card text changes.
2. Reject impossible Item Finder / Pokémon Trader choice chains without mutating an in-progress duel.
3. Respect printed Dark/Light Stage 2 evolution families instead of treating ordinary intermediate evolutions as interchangeable; guard Pokémon Breeder against proposing Stage 2 evolutions with no compatible Basic in play.
4. Introduce Camila's missing Dark Vileplume control identity in RPG Act II/III: Oddish, Dark Gloom and Dark Vileplume are legal evolutionary cards, while keeping Grass/Water Energy. Kaede retains the Rocket archetype and is not given Camila's Vileplume story deck. Neither shared Rocket test deck nor retail decks are changed.
5. Keep NPC recipes at 60 cards, validate every printed ID, and preserve source preset immutability.

**Corrections to earlier reasoning:** `base1-99` is Grass Energy and `base1-102` is Water Energy. The original Rocket lab had sufficient on-type Energy; an earlier Fire-Energy mismatch hypothesis was false and the no-op conversion code was removed.

## Next calibration decision

Camila remains significantly weaker than Reina against modeled mid/late player decks; Dark Vileplume requires multiple turns to set up and its Trainer lock may hinder its own deck. A responsible next step is to benchmark *several* distinct Camila candidate builds—control-heavy, fast Dark Muk/Weezing, and a mixed archetype—against the same seeded opponents, choose based on reproducible results, and keep the final story identity consistent. The benchmark now makes that measurable. Other high-variance opponents (notably Yuna and early Marina) also warrant broader samples.

## Verification

RPG Regression Suite passed on [run 39554539452](https://github.com/NicolasSorrenti/poketest/actions/runs/39554539452). RPG NPC Deck Balance Benchmark passed on [run 39554539555](https://github.com/NicolasSorrenti/poketest/actions/runs/39554539555). The separate repository-wide TCG Gameplay Regression remains blocked by a pre-existing cinematics timing assertion (`2800 !== 900`) unrelated to these balancing changes.
