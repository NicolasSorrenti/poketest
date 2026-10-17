# CPU AI — turn-sequence search and resource discipline

## Status

PR #11 was merged into `main` at `0b34016caf46ec9c0ff7304c929ca6d6a8f81866`.
This continuation lives on `agent/cpu-ai-sequence-20261017` / draft PR #12.

The user's long-run objective remains **no more than a 5% decisive upset
rate from each lower difficulty against the next tier**. This has not been
demonstrated. We keep each match legal and accept stochastic upsets; never
rig shuffled cards, prize cards, coin flips or illegal actions to enforce a
numerical target.

## Bounded own-turn sequence search

An opt-in policy flag `turnSearch:true` examines up to three preparation
actions, bounded to 96 hypothetical continuation nodes for each first move.
It considers Pokémon evolutions, a maximum of one Energy attachment during
the current turn, and the resulting affordable attacks. It uses the acting
player's own hand and visible board, never the opponent's hidden cards,
future draws or pending coin outcomes. The real duel reducer is never called
inside this search; only the chosen command is submitted to the authoritative
rules engine.

It now models evolution removing Special Conditions and replacing attacks of
the previous stage. Targeted tests cover Machop → Machoke + Fighting Energy
and the Sleep-clearing evolution case.

**Controlled 200-game Champion-on vs Champion-off tournament:**

| Deck | Search wins | Control wins | Draws |
| --- | ---: | ---: | ---: |
| Blackout | 41 | 38 | 1 |
| Brushfire | 30 | 30 | 0 |
| Overgrowth | 28 | 32 | 0 |
| **Total** | **99** | **100** | **1** |

The search produced **no overall advantage**, so it remains OFF by default.
Benchmark CLI: `--left-turn-search true --right-turn-search false`.

## Resource discipline — validated and promoted for Champion

The old greedy policy had no opportunity cost for spending mediocre Trainer
cards; `end_turn` scored zero, so any Trainer use looked preferable to
keeping a good card in hand. `actionDiscipline` gives experienced CPUs a
meaningful choice to **retain** low-value Trainers, while affordable attacks,
useful Bill draws, valuable setup and genuine tactical plays still outweigh
ending the turn. Lower levels retain plausible less-disciplined play.

**440-game matched, seat-swapped Champion A/B with equal theme decks:**

| Deck/seed cohort | Disciplined wins | Old Champion wins | Draws |
| --- | ---: | ---: | ---: |
| Blackout (33197) | 54 | 26 | 0 |
| Brushfire (43197) | 29 | 31 | 0 |
| Overgrowth (53197) | 41 | 39 | 0 |
| Zap (63197) | 42 | 37 | 1 |
| Blackout (73197) | 50 | 30 | 0 |
| Brushfire (83197) | 34 | 26 | 0 |
| **Total** | **250** | **189** | **1** |

Decisive win rate **56.95%** (250/439); Wilson 95% interval approximately
**52.3%–61.5%**. This supports a modest true advantage against the unchanged
Champion over these seeded archetypes, unlike the earlier experiments.

Accordingly **`actionDiscipline` is now enabled by default only for level 5
(Champion)**; levels 1–4 are unchanged, and `actionDiscipline:false` remains
available as an exact old-policy control. This does *not* establish that
Champion wins 95% against Expert. Dedicated three-deck Champion-vs-Expert
benchmarking is included in the CPU Sequence Experiment workflow.

To reproduce the strongest original A/B:

```sh
node benchmark_cpu.js --pairs 40 --max-turns 120 --seed 33197 --left-level 5 --right-level 5 --left-action-discipline true --right-action-discipline false
```

## Verification and follow-up

The sequence tests and 80-scenario live service regressions pass, and a short
dedicated GitHub workflow benchmarks both policies without waiting on the
full historical CPU AI regression matrix. The Node/RPG and TCG rules CI jobs
also run on each branch/PR update.

Next: benchmark Champion versus Expert under the new default, expand to Gym
and Neo theme decks, and tackle visible opposing-response and Trainer
sequence planning only when it demonstrably improves win rates across
multiple decks and seeds.
