# CPU difficulty tiers (experimental)

1–5 retain their existing scoring, noise and NPC personality behavior.

- **6 · Grandmaster:** bounded two-ply deterministic same-turn preparation search, on top of Level 5.
- **7 · Mastermind:** three-ply planning and visible enemy counterattack pressure.
- **8 · Apex:** four-ply planning with a larger but still bounded search and a stronger visible counterattack penalty.

The planner now evaluates deterministic multi-action preparation through a potential end-of-turn attack, including known counterattack threats, scarce cards retained in hand, ready backups, Prize urgency, and possible ready Bench replacements. It can examine deterministic retreat and safe Trainer uses as well as Energy/evolution/Bench actions. No hypothetical attack or hidden draw is executed. It remains a bounded, approximate evaluator, not a full opponent-turn minimax solver.

These tiers are **not** perfect play, exhaustive game-tree search, trained agents, or guaranteed to beat Champion. Search simulates only legal deterministic `bench`, `attach_energy` and `evolve` actions using the authoritative reducer; it never rolls hypothetical attacks, considers an opponent's concealed hand, looks at hidden prizes, or consults future shuffled draws. CPU personalities remain separate from skill level.

To avoid a gameplay performance regression, the RPG campaign remains pinned to the **highest validated** CPU level (Champion, 5). Levels 6–8 can be tried explicitly in Single Match and Cube.

## Measured results (October 2026)

[See the full validation report](CPU_DIFFICULTY_BENCHMARK_RESULTS.md). The earlier October 2026 baseline of 400 general matches plus 144 late-campaign RPG mirrors per challenger showed **no statistically convincing gain over Level 5**. Those historical results predate the new end-of-turn/resource/counterplay evaluator and must not be used to claim its strength. They remain opt-in experiments; the RPG still uses Champion. The report includes win/loss counts, Wilson intervals, timings, and reproduction commands.

## Proving that a new level is better

Run paired and mirrored games, varying deck, seed and seat, then compare both win rates and CPU action latency. Examples:

```sh
node --test tests/cpu_deep_levels.test.js
node benchmark_cpu.js --pairs 20 --left-level 5 --right-level 6 --left-deck blackout --right-deck blackout
node benchmark_cpu.js --pairs 20 --left-level 5 --right-level 7 --left-deck brushfire --right-deck blackout
node benchmark_cpu.js --pairs 20 --left-level 5 --right-level 8 --left-deck blackout --right-deck brushfire
```

Advance a tier to RPG only after multiple deck archetypes, repeatable mirrored matches, and action-latency results support a meaningful gain. Check hidden-information invariance, rejected probes, stalls, turn caps and timeouts; report confidence intervals rather than treating a few wins as proof.
