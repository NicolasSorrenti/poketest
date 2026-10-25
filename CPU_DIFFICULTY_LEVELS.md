# CPU difficulty tiers (experimental)

1–5 retain their existing scoring, noise and NPC personality behavior.

- **6 · Grandmaster:** bounded two-ply deterministic same-turn preparation search, on top of Level 5.
- **7 · Mastermind:** three-ply planning and visible enemy counterattack pressure.
- **8 · Apex:** four-ply planning with a larger but still bounded search and a stronger visible counterattack penalty.

The planner now evaluates deterministic multi-action preparation through a potential end-of-turn attack, including known counterattack threats, scarce cards retained in hand, ready backups, Prize urgency, and possible ready Bench replacements. It can examine deterministic retreat and safe Trainer uses as well as Energy/evolution/Bench actions. No hypothetical attack or hidden draw is executed. It remains a bounded, approximate evaluator, not a full opponent-turn minimax solver.

These tiers are **not** perfect play, exhaustive game-tree search, trained agents, or guaranteed to beat Champion. Search simulates only legal deterministic `bench`, `attach_energy` and `evolve` actions using the authoritative reducer; it never rolls hypothetical attacks, considers an opponent's concealed hand, looks at hidden prizes, or consults future shuffled draws. CPU personalities remain separate from skill level.

**RPG now selects Level 7 Mastermind in this feature branch**. The user prioritized stronger play over modest additional CPU thinking time. Mastermind beat the Level 5 RPG Champion across both the broad seeded trials and a separate held-out seed sample; it edged out Level 8 on tier-3 character decks. Existing saves are upgraded safely, including tactics previously set false at Level 5. Single Match and Cube defaults remain independent. This PR is not deployed until merged.

## Measured results (October 2026)

[See the full validation report](CPU_DIFFICULTY_BENCHMARK_RESULTS.md). The earlier October 2026 baseline of 400 general matches plus 144 late-campaign RPG mirrors per challenger showed **no statistically convincing gain over Level 5**. Those historical results predate the new end-of-turn/resource/counterplay evaluator and must not be used to claim its strength. Those numbers are historical. Subsequent full-turn strategy improvements have demonstrated better outcomes, summarized below; the earlier report includes baseline win/loss counts, Wilson intervals, timings, and reproduction commands.

## Revised planner evaluation and RPG promotion

In GitHub Actions run `40148408524`, the revised CPU with card and Energy opportunity costs, multi-action sequencing, and visible opponent response scored:

| CPU | General decisive record vs Champion | RPG tier-3 decisive record vs Champion |
|---|---|---|
| Grandmaster 6 | 209–179, 12 unfinished | 77–66, 1 unfinished |
| Mastermind 7 | **217–171**, 12 unfinished | **85–59**, no unfinished |
| Apex 8 | 217–170, 13 unfinished | 84–60, no unfinished |

In an independent seed run `40148408579`, Mastermind scored **211–185** in decisive general matches and **83–60** in decisive tier-3 RPG matches, with 4 and 1 unfinished respectively. The eight focused planner tests passed. These seeded observations favor Level 7 but do not guarantee a specific win probability; matched game pairs and choice of decks affect uncertainty.

RPG-deck p95 simulated per-action decision-processing time for Level 7 was ~21 ms in the held-out run and ~50 ms in the primary run, compared with ~1–2 ms for Champion under those runners. The higher latency is accepted in exchange for stronger CPU play, but this is not a measurement of end-to-end UX under production traffic.

**Implementation:** `rpg_cpu_config.js` sets `RPG_CPU_LEVEL=7` and promotes older cloud/local CPU sessions without mutating game or profile state. Actual deployment awaits merge and CI review.

## Proving that a new level is better

Run paired and mirrored games, varying deck, seed and seat, then compare both win rates and CPU action latency. Examples:

```sh
node --test tests/cpu_deep_levels.test.js
node benchmark_cpu.js --pairs 20 --left-level 5 --right-level 6 --left-deck blackout --right-deck blackout
node benchmark_cpu.js --pairs 20 --left-level 5 --right-level 7 --left-deck brushfire --right-deck blackout
node benchmark_cpu.js --pairs 20 --left-level 5 --right-level 8 --left-deck blackout --right-deck brushfire
```

Advance a tier to RPG only after multiple deck archetypes, repeatable mirrored matches, and action-latency results support a meaningful gain. Check hidden-information invariance, rejected probes, stalls, turn caps and timeouts; report confidence intervals rather than treating a few wins as proof.
