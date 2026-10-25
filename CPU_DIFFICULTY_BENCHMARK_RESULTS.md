# CPU Levels 6–8: validation report (October 2026)

## Decision

**Do not promote Levels 6, 7 or 8 to RPG yet.** The largest tested trials do not establish a statistically persuasive strength increase over the production RPG Champion policy (Level 5 with Prize-race, knockout-tempo and opponent-response tactics enabled).

The RPG's `RPG_CPU_LEVEL` remains **5** in `rpg_cpu_config.js`. Levels 6–8 remain **experimental, opt-in** difficulty options for Single Match and Cube, not a promise of progressively higher win rates.

## General TCG benchmark: 400 games per challenger

Six original matched matchups were not enough: the completed 400-game trials use eight mirrored scenarios, including reversed asymmetric deck assignments, 25 paired seeds per fixture and up to 120 turns.

| Challenger | Wins | Losses | Unfinished | Decisive win % | 95% Wilson interval |
|---|---:|---:|---:|---:|---|
| Level 6 / Grandmaster | 187 | 200 | 13 | 48.32% | 43.38%–53.29% |
| Level 7 / Mastermind | 196 | 186 | 18 | 51.31% | 46.31%–56.28% |
| Level 8 / Apex | 197 | 184 | 19 | 51.71% | 46.70%–56.68% |

Reproduction (each command generates 400 real-engine duels):

```sh
node scripts/benchmark-cpu-advanced.js --level 6 --pairs 25 --max-turns 120 --fixtures 8
node scripts/benchmark-cpu-advanced.js --level 7 --pairs 25 --max-turns 120 --fixtures 8
node scripts/benchmark-cpu-advanced.js --level 8 --pairs 25 --max-turns 120 --fixtures 8
```

Inputs: Blackout, Brushfire, Overgrowth, and Zap, tested as same-deck mirrors and reversed mixed matchups. All three benchmark jobs passed in GitHub Actions run `40146900747`.

## RPG-specific benchmark: 144 games per challenger

Six NPCs' actual **tier-3** late-campaign deck upgrades (`rpg_npc_deck_progression.upgrade`) are played as same-deck mirrors, with each NPC's personality on both sides. For each character, 12 seeds are mirrored for 24 games; duel formats support the relevant expanded card pool. This isolates decision quality rather than allowing a stronger deck to masquerade as smarter AI.

| Challenger | Wins | Losses | Unfinished | Decisive win % | 95% Wilson interval |
|---|---:|---:|---:|---:|---|
| Level 6 / Grandmaster | 76 | 68 | 0 | 52.78% | 44.66%–60.75% |
| Level 7 / Mastermind | 70 | 73 | 1 | 48.95% | 40.89%–57.06% |
| Level 8 / Apex | 70 | 74 | 0 | 48.61% | 40.59%–56.70% |

Character decks: Reina, Yuna, Camila, Kaede, Shiori, and Akari. All three jobs completed with zero reported game-engine errors in GitHub Actions run `40147253821`.

Reproduction:

```sh
node scripts/benchmark-cpu-rpg-advanced.js --level 6 --pairs 12 --max-turns 110
node scripts/benchmark-cpu-rpg-advanced.js --level 7 --pairs 12 --max-turns 110
node scripts/benchmark-cpu-rpg-advanced.js --level 8 --pairs 12 --max-turns 110
```

## Latency, validity and limitations

- The **combined mean decision time for both players**, in the general tournament, was approximately 0.84 ms, 3.42 ms and 4.64 ms respectively in the Level 6, 7 and 8 fixtures. The RPG mirrors yielded combined means of about 1.73 ms, 3.44 ms and 4.57 ms.
- These combined averages do **not** establish per-level p95 latency or absence of slow outliers. Before shipping a heavier policy into RPG, measure per-action p95/p99 under representative server load.
- The benchmarking scripts use seeded, paired, mirrored matches in the real authoritative reducer. All trials are CPU versus CPU, not real players.
- The 95% Wilson bounds are descriptive estimates calculated over decisive games; matched seeds create dependencies and may make naive intervals optimistic. None of these intervals excludes 50% in the higher-level's favor.
- Results vary materially by deck and NPC personality. Even when Level 8 slightly beats Level 5 in the general tournament, it loses more often in the tier-3 RPG mirrors.
- This benchmark verifies legal completion and comparative match outcomes, **not** perfect play, omniscience, exploit-free security, or every implemented card mechanic.

## Recommended next iteration

Instead of increasing search depth alone, improve the AI's representation of **end-of-turn utility**, legal full-action sequencing, resource opportunity cost, and strategic counterplay under imperfect information. Run broad, held-out tournaments to avoid overfitting known benchmark fixtures. Only promote an experimental tier after a meaningful, reproducible superiority margin on **both general and RPG-specific** decks, acceptable per-action tail latency, and passing integration tests.

The change remains in PR #101 for review; do not assume it is deployed or that the newly named tiers are guaranteed stronger.
