# Apex strategic CPU vs Mastermind: extensive validation (October 2026)

## Decision

**Do not promote Level 8 Apex to RPG. Keep the validated RPG default Level 7 Mastermind.**

The strengthened Level 8 includes bounded beam search, a wall-clock planning budget (1.3 seconds), public opponent-response estimates and resource opportunity costs. The user explicitly accepts slower decisions if they are *better*. These trials establish acceptable simulated computation latency, but **not a reproducible improvement in playing strength**. Extra compute is not a substitute for a better evaluation function.

## Independent held-out tournaments

GitHub Actions workflow **Apex Extensive Validation**, run [40150643950](https://github.com/NicolasSorrenti/poketest/actions/runs/40150643950), completed **all six jobs successfully**: five sets of paired mirrored duels and CPU invariants.

Each role starts with an identical NPC tier-upgraded deck and the character's established personality, so differing deck strength does not account for a skill advantage. The general fixtures use four official theme-deck archetypes, including mixed matchups in both deck orders. All matches use the authoritative rules engine.

| Sample | Games | Apex wins | Mastermind wins | Unfinished | Apex decisive win % |
|---|---:|---:|---:|---:|---:|
| RPG tier 1, seed 317951 | 144 | 68 | 72 | 4 | 48.57% |
| RPG tier 2, seed 843713 | 144 | 69 | 71 | 4 | 49.29% |
| RPG tier 3, seed 931723 | 144 | 72 | 70 | 2 | 50.70% |
| RPG tier 3, seed 173993 | 144 | 69 | 75 | 0 | 47.92% |
| General, 8 fixtures, seed 659021 | 192 | 93 | 98 | 1 | 48.69% |
| **All** | **768** | **371** | **386** | **11** | **49.01%** |

The four RPG samples total **278 Apex wins vs 288 Mastermind wins**, plus 10 unfinished matches (566 decisive); **49.12%** decisive win rate, ordinary 95% Wilson interval **45.02–53.23%**. General 191 decisive games yielded **48.69%**, Wilson **41.70–55.74%**. Overall 757 decisive games yielded **49.01%**, Wilson **45.46–52.57%**. **These confidence intervals are descriptive**, not independent-match guarantees: mirrored seats/seeds create correlations.

Earlier small smoke trials favored Apex (53–42 in 95 decisive general games, 37–23 in 60 RPG games), but the larger *different-seed* trials failed to replicate that gain. The 24-game smoke tournament is a strict seed-overlapping subset of the 60-game RPG tournament: **do not double-count it as independent evidence**.

## Per-character RPG results (all four RPG samples)

| Character | Apex wins | Mastermind wins | Unfinished |
|---|---:|---:|---:|
| Reina | 39 | 56 | 1 |
| Yuna | 49 | 39 | 8 |
| Camila | 49 | 47 | 0 |
| Kaede | 49 | 46 | 1 |
| Shiori | 43 | 53 | 0 |
| Akari | 49 | 47 | 0 |

These are six representative personalities/archetypes, **not the full NPC roster**, and no universal per-character superiority is established. The loss concentrated in some personalities (especially Reina and Shiori) despite modest gains elsewhere.

## Responsiveness and rules validity

The challenger Level 8 p95 measured *per driveSide batch action average* (not individual command p95) was approximately **251–286 ms across RPG samples**, and **142 ms maximum fixture p95 on general decks**. In RPG samples, observed worst averaged decision batches stayed below **825 ms**. Level 7 per-batch p95 was approximately 35–44 ms in the same jobs. Timings are CI-specific, and should not be advertised as guaranteed production latency.

The invariants job passed **14/14 tests** for that run, with **16/16 tests** passing in the newer small Apex challenge run [40150723959](https://github.com/NicolasSorrenti/poketest/actions/runs/40150723959). Hidden-information invariance, legal action selection, bounded planning, card conservation, guaranteed-KO evaluation and RPG CPU checkpoint upgrades are covered. Every NPC evaluation reported an **empty engine-error list**; some games reached the benchmark turn cap and are reported as unfinished, not counted as wins.

Other repository CI suites have known **unrelated failures**, including RPG bootstrap script assertions, stale generated character assets, cloud-save checkpoint expectations and browser smoke selector/layout assumptions. The extensive CPU job succeeding is **not evidence that the whole PR CI is green**. Do not merge on the basis of this report alone.

## Reproduction

```sh
node --test tests/cpu_deep_levels.test.js tests/rpg_cpu_champion.test.js
node scripts/benchmark-cpu-advanced.js --baseline-level 7 --level 8 --pairs 12 --max-turns 120 --fixtures 8 --seed 659021
node scripts/benchmark-cpu-rpg-advanced.js --baseline-level 7 --level 8 --tier 1 --pairs 12 --max-turns 110 --seed 317951
node scripts/benchmark-cpu-rpg-advanced.js --baseline-level 7 --level 8 --tier 2 --pairs 12 --max-turns 110 --seed 843713
node scripts/benchmark-cpu-rpg-advanced.js --baseline-level 7 --level 8 --tier 3 --pairs 12 --max-turns 110 --seed 931723
node scripts/benchmark-cpu-rpg-advanced.js --baseline-level 7 --level 8 --tier 3 --pairs 12 --max-turns 110 --seed 173993
```

## Next targeted research

1. Compare **decision disagreement positions** where Level 7 wins and Level 8 loses; inspect the first bad choice, not just the overall result. Focus on hand depletion, false threats from imaginary Energy, loss of KO tempo, and bench/Trainer prioritization.
2. Add tactical position fixtures with explicit correct choices and full rules legality; use them to ablate the Apex opponent-response penalty, hypothetical one-Energy weight, root selection and beam search.
3. Test new candidate evaluators on **held-out seeds and all RPG tiers**, not seeds already used to tune weights. Promote only if the improvement replicates consistently.
4. Preserve CPU personality and legitimate imperfect information. Never peek at opponent hand, random future deck contents or future coin flips.

**Final implementation status:** `rpg_cpu_config.js` stays at `RPG_CPU_LEVEL=7`; Apex remains optional and experimental in non-RPG modes. PR #101 is open, unmerged and undeployed.
