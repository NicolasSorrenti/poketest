# Cube Archetype Balance — Basic-only vs Evolution (2026-10-22)

## Executive finding

**No measured Basic-only dominance in the controlled comparison.** In 280 actual engine-completed games (nine presets, eight draft seeds, two seats per seed, paired side swapping), Evolution builds won 169 (60.4%) and Basic-only builds won 111 (39.6%). Two further games remained incomplete and were excluded. No simulation errors were reported.

This is **not** a human competitive win-rate measurement or proof of format balance. It measures two optimized variants constructed from the **same player's drafted 60 cards**, so the variant decks share a virtual source inventory; this intentionally controls pool access and cannot occur as two distinct seats in a real four-player draft. The CPU's drafting, deck-building and battle policy affect the results. Mirror matches are paired, so the usual binomial confidence intervals are descriptive and should not be treated as strictly independent-sample significance claims.

## Reproducible results

Eight seeds: `11,29,47,83,137,191,251,307`. For each seed, draft four 60-pick inventories from a deterministic 240-card pool using preset-aware drafting AI. Compare the Basic-only and Evolution variants of seats 0 and 1, alternating deck sides. Duel conditions: 40-card deck, four Prizes, CPU level 3 for both decks, real authoritative duel reducer, up to 60 turn pairs per game. Only games reported by the engine as finished with a concrete winner are counted. The Evolution build must contain at least one legal complete Evolution line or its comparison is skipped. A Basic-only build may not include evolved Pokémon.

| Format | Evolved wins | Basic-only wins | Evolved win rate | Completed | Incomplete | Evolution played in games |
|---|---:|---:|---:|---:|---:|---:|
| Kanto Origins (existing) | 16 | 12 | 57.1% | 28 | 0 | 20/28 |
| **Kanto Evolution League** | 19 | 13 | **59.4%** | 32 | 0 | 26/32 |
| Jungle Growth | 19 | 13 | 59.4% | 32 | 0 | 26/32 |
| Fossil Discoveries | 25 | 6 | **80.6%** | 31 | 1 | 30/32 |
| Rocket Uprising | 14 | 18 | 43.8% | 32 | 0 | 25/32 |
| Gym Academy | 19 | 12 | 61.3% | 31 | 1 | 20/32 |
| Neo Generations | 23 | 7 | **76.7%** | 30 | 0 | 27/30 |
| Stage One Showdown | 17 | 15 | 53.1% | 32 | 0 | 25/32 |
| Slow Burn | 17 | 15 | 53.1% | 32 | 0 | 26/32 |
| **All formats** | **169** | **111** | **60.4%** | **280** | **2** | **225/282** |

The original Kanto cube could not build a complete Evolution variant from two of the 16 drafted seat inventories; Neo Generations skipped one. Every other format generated a complete Evolution deck for all 16 inventories. In the dedicated Kanto Evolution League, all 16 inventories produced a linked Evolution build, averaging **7.06 Evolution cards per deck**. This is an important improvement over merely placing Evolutions somewhere in the cube.

## Interpretation and follow-up

- **Kanto Evolution League:** the primary requested Base/Jungle/Fossil format shows Evolution decks competing successfully against Basic-only alternatives. No further immediate Basic bans are justified by this sample.
- **Stage One Showdown / Slow Burn:** close to 50/50 in this test, but not definitive proof of parity.
- **Rocket Uprising:** the only Evolution-friendly preset with more Basic wins; 14–18 from 32 is not strong evidence that its pool needs a nerf. Gather independent-draft evidence before altering it.
- **Fossil Discoveries and Neo Generations:** Evolutions were very favored. This may match the intended evolution-friendly identity, but if fair archetype choice is the goal these should be tested independently and possibly tuned back.
- **Original Kanto Origins:** it also produced competitive Evolution builds in this controlled comparison, but complete draftable lines were less dependable than in Kanto Evolution League.

## How to reproduce

```bash
MATCHUP_SEEDS=11,29,47,83,137,191,251,307 MATCHUP_SEATS=2 MATCHUP_TURNS=60 MATCHUP_LEVEL=3 node test_cube_archetype_matchups.js
```

Raw per-format data and example match outcomes are uploaded as `cube-archetype-matchups` by the [Cube Archetype Matchups workflow](https://github.com/NicolasSorrenti/poketest/actions/workflows/cube-archetype-matchups.yml).

Source run: [8-seed engine matchup audit](https://github.com/NicolasSorrenti/poketest/actions/runs/39876120682) (successful).

### Interpretation limits

1. These are controlled paired variants from the same 60 picks, not two competing draft seats.
2. The same AI policy piloted both archetypes. Human priorities, counterpicks, disruption and tactical sequencing could differ.
3. The win-rate intervals for 28–32 completed games per preset are wide (and mirror games are correlated). Avoid hard balance conclusions or overfitting to these seed samples.
4. Not every Evolution deck used an Evolution during every game; the audit records whether one was played, not merely included.
5. Some implemented card rules may still have bugs outside this test's scope.

**Decision:** keep the evolution-friendly pool restrictions and better line collation from PR #83, but do not introduce additional cross-the-board Basic nerfs based on this evidence. Next higher-confidence gate is head-to-head drafting by two *independent*, archetype-specific draft agents, more seeds, and human multiplayer playtests.
