# Competitive-archetype CPU evaluation

## Purpose

The previous CPU benchmark mostly used printed theme decks, Haymaker-style basics, and RPG character-deck mirrors. Those are insufficient proxies for competitive historical Pokémon TCG tactics. This suite exercises *archetype-specific* Energy acceleration, evolutions/Pokémon Powers, special Energy, disruption, and stall alongside the older tests.

**Important:** These are curated, legal 60-card *benchmark builds*, NOT exact documented tournament-winning lists. They intentionally include engines and trainer staples from Base Set through Neo Destiny. Passing tests cannot establish tournament-level play or that every historical mechanic is implemented.

## Deck library

`cpu_competitive_decks.js` contains validated benchmark recipes plus existing original Haymaker recipes:

| Deck | What it challenges |
|---|---|
| Haymaker aggression | Basic attacker tempo, Prize race, trainers and switching |
| Blastoise Rain Dance | Stage-2 setup, Water Energy acceleration, Pokémon Power |
| Meganium Wild Growth | Stage-2 evolution and Energy-type modification |
| Typhlosion Fire Recharge | Evolution sequencing, discard recovery and Energy economy |
| Feraligatr Downpour / Riptide | Evolution sequencing, discard-based damage and recursion |
| Energy Removal attrition | Denial strategy, constrained Energy and replacement timing |
| Chansey / Snorlax stall | Damage mitigation, healing, deck exhaustion and switching |
| Neo Darkness | Special Darkness/Rainbow Energy and high-pressure Neo-era Basics |

Decks are checked for 60 cards, card-name copy limits, multiple Basic Pokémon and existing prerequisite evolution cards. Game setup is exercised through the authoritative reducer; unimplemented card/Power effects are **not** presumed functional simply because a deck validates.

## Match structure

`scripts/benchmark-cpu-competitive.js` runs 24 deterministic fixtures in four independent groups (aggression, evolution, control and Neo), including eight same-deck mirrors. Key cross-archetype pairings appear **in both orientations**, with seat-swapped games per seed. The playing field is `online-preview` so Base/Gym/Neo-era interactions follow one consistent historical engine format; both sides receive the *same* format.

Level **7 Mastermind** is the baseline and Level **8 Apex** is the experimental challenger. Fixtures vary CPU personality but keep the personality matched within each game to isolate policy differences. All games run in the real game reducer with card conservation verification.

The evaluation reports decisive wins, unfinished games, per-fixture strength, game-engine exceptions, Wilson descriptive intervals and **actual per-action** latency p95/p99 by CPU role (the earlier theme-deck benchmark had used misleading turn-batch averages).

### Initial test / CI

```sh
node --test tests/cpu_competitive_decks.test.js tests/cpu_deep_levels.test.js tests/rpg_cpu_champion.test.js

node scripts/benchmark-cpu-competitive.js --group aggression --pairs 3 --max-turns 100 --seed 720913
node scripts/benchmark-cpu-competitive.js --group evolution --pairs 3 --max-turns 100 --seed 830929
node scripts/benchmark-cpu-competitive.js --group control --pairs 3 --max-turns 100 --seed 940943
node scripts/benchmark-cpu-competitive.js --group neo --pairs 3 --max-turns 100 --seed 1050961
```

GitHub Actions [Competitive Archetype CPU Benchmark](.github/workflows/cpu-competitive-archetypes.yml) runs these four groups separately and validates the deck library. The first configured matrix is **144 real-engine duels** (24 fixtures × 3 seed pairs × 2 seats). Results must be inspected before asserting an advantage, and any unsupported interaction or invalid recipe must fail CI visibly.

For a higher-confidence holdout run, increase to 12–20 seed pairs *with new seeds* after initial smoke and legality pass. Preserve previous seeds as development fixtures rather than test on the same data used for evaluator tuning. Mirrored game pairs and shared decks create statistical dependencies; naive Wilson intervals should not be treated as definitive.

## Rollout policy

Keep RPG on **Level 7** until the challenger demonstrates a **repeatable advantage** across competitive archetypes, upgraded RPG decks, independent seeds and acceptable actual decision-time tails. If the benchmark reveals rules defects, fix those rules rather than allowing a CPU to exploit them. A more expensive search is not automatically stronger.
