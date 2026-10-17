# Neo Campus TCG — CPU difficulty calibration

## Target and fairness

**Design target:** In head-to-head matches between adjacent difficulty levels, a
lower-level CPU wins no more than **5% of decisive games**. Report draws and
timeouts separately, and always report the rate over *all* matches as well.
Statistical verification uses the **upper bound of a Wilson 95% interval**
for lower-level wins at each adjacent tier. A single seed cohort, even with zero
lower-tier wins, does not guarantee the ceiling.

This is an ambitious empirical **target, not a promise of deterministic outcomes**.
The historical Pokémon TCG includes shuffled decks and randomized attacks.
A lower-skilled CPU must remain able to win via legal play and favorable draws.
Do **not** rig coin flips, alter game rules, reveal opponent hidden cards, or
silently force the lower CPU to concede merely to meet a reported threshold.

The difficulty tiers should be **genuinely distinct** in action evaluation,
resource discipline and risk, not just different display labels. Natural mistakes
are appropriate to lower difficulties, but avoid intentionally sabotaging games.

## Reproducible audit

Run from repository root with Node 22:

```sh
node benchmark_cpu_tiers.js --pairs 40 --max-turns 120 --seed 71839 --decks blackout,brushfire
```

The audit runs 4 adjacent-level comparisons × 2 theme decks × 80 paired-seat
games = **640 matches**, each using only the real rules engine. Results include
wins, losses, censored games, decisive upset rates, Wilson 95% confidence
intervals, and two flags: `observedUnderTarget` and `verifiedUnderTarget`.

To make failure to reach the user's target a nonzero process exit code:

```sh
node benchmark_cpu_tiers.js --pairs 40 --max-turns 120 --seed 71839 --decks blackout,brushfire --strict
```

Do not enable the strict gate in ordinary CI until tier separation is actually
validated: otherwise ongoing unrelated gameplay work would be blocked by a known
unmet experiment. Standard CI prints the audit result without hiding failure.

## Measured skill separation before new tactics

First independent audit: 15 pairs per deck, 120-turn cap, two deck archetypes,
seed base 71839; **240 matches** overall.

| Matchup | Higher wins | Lower wins | Draws | Lower wins / decisive |
| --- | ---: | ---: | ---: | ---: |
| 2 Casual vs 1 Beginner | 34 | 26 | 0 | 43.3% |
| 3 Experienced vs 2 Casual | 39 | 20 | 1 | 33.9% |
| 4 Expert vs 3 Experienced | 29 | 31 | 0 | 51.7% |
| 5 Champion vs 4 Expert | 26 | 34 | 0 | 56.7% |

**None approaches the 5% target.** The first two levels show moderate
separation; Expert and Champion currently fail to outperform the level below.
Use the larger 640-game audit to update the sample and track generalization.

## Tactical experiments (all opt-in)

- `prizeRace`: final-Prize attacks and safe emergency retreats.
- `knockoutTempo`: prioritizes a certain knockout while preserving essential
  backup setup; does not value an unearned Prize.
- `opponentResponse`: bounded one-ply look at already-attached opposing Energy
  and public attacks to choose survivable replacements, never future rolls.

All remain **off by default** in the CPU policy. Each can be independently
A/B-tested with `--left-<name> true`, against an identical Champion baseline.
The CLI spellings are `--left-prize-race`, `--left-knockout-tempo`, and
`--left-opponent-response` (corresponding `--right-...` for opponents).

Initial 120-turn 2-deck A/B on independent seeds:
- Knockout tempo alone vs unchanged Champion: **70–68**, 2 draws.
- Opponent response alone: **74–66**, no draws.
- Combined Prize race + Knockout tempo + Opponent response:
  **64–56** vs unchanged Champion; **63–57** vs Expert.

These are modest outcomes **not statistical evidence of 95% strength**.
The first combined benchmark is only 120 games, so additional seeds/decks are
required before promotion to the default profile.

For hands-on playtesting, `ClassicLocalService.create({difficulty:5,
advancedTactics:true})` opts a Champion into the three combined experiments.
It can also be used at difficulty 4. Lower levels reject the flag; the default
remains unchanged. This path uses the live authoritative duel service, not a
fake simulator.

## Next acceptance milestones

1. Increase actual decision competence at higher levels through public-state
   lookahead of opposing responses, Prize tempo and Trainer combinations.
2. Add mistake-oriented scenario tests without tampering with legitimate TCG
   outcomes or deck randomness.
3. Test against multiple *equal* deck archetypes, both seat orders and new seed
   cohorts; diagnose card-conservation failures, censored duels, missed KOs and
   needless setup.
4. Promote any experimental feature only after it has evidence of a consistent
   advantage over its identical-policy control.
5. Re-run the adjacent-level audit and report the measured gap to **≤5%**; do
   not mark the calibration objective complete while any tier misses it.
