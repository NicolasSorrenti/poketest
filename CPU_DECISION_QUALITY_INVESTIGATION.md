# CPU decision-quality investigation (October 2026)

## Objective

Improve CPU *choice quality*, not its nominal search depth. The completed 768-game Apex-vs-Mastermind tournament found Apex at 371–386 decisive and 11 unfinished: no demonstrated strength gain. RPG therefore remains on Level 7 Mastermind. Slower decisions are acceptable only when wins and tactics actually improve.

## Iteration 1 — root coverage

Static investigation showed `cpu_strategic_search.js` could spend almost the entire 400-node pool on the first promising preparation root, leaving other legal roots (Bench, attachment, evolution, retreat and safe Trainer actions) virtually unexplored. It now divides nodes across remaining roots, rolling unused capacity forward. `chooseAction({diagnostics:true})` exposes opt-in root visits, node usage, per-root gain and elapsed time. Normal calls avoid this extra output.

GitHub run [40152500262](https://github.com/NicolasSorrenti/poketest/actions/runs/40152500262) passed **17 focused tests**. Among sampled same-state decisions, Mastermind and Apex agreed on **35/35 late-campaign Reina positions** and disagreed in **4/32 Brushfire positions** (three retreat targets, one attachment target). Where roots existed, they all received evaluation (30/30 RPG cases and 26/26 theme cases). The tactical disagreements are *not* classified as objectively wrong by the diagnostic; they highlight positions worth investigating. The diagnostic now captures publicly visible Bench cards, Energy and attack names, and is expanded to all six benchmarked NPC personalities and multiple tiers.

The paired **post-fairness** match results from the same GitHub run were:

| Dataset | Apex wins | Mastermind wins | Unfinished | Apex decisive % |
|---|---:|---:|---:|---:|
| Eight general-deck fixtures | 47 | 48 | 1 | 49.47% |
| Late-campaign NPC mirrors | 32 | 26 | 2 | 55.17% |

The outcomes were **insufficient to promote Apex**; the RPG confidence interval still includes even performance.

## Iteration 2 — counterplay calibration (pending validation)

Inspection found a second concern: `cpu_lookahead.evaluateTurn` already subtracts threat from currently affordable attacks and post-KO Bench responses, while Apex's additional `counterplayExposure` was also subtracting almost the same ready-counterattack pressure. This can double-charge tactical danger, making the slower policy too defensive.

The updated Apex `counterplayExposure` now computes **only the marginal additional threat** of a hypothetical one-Energy opponent attachment, compared with the opponent's current public attack readiness. No hidden hand is inspected, and hypothetical Energy is discounted rather than assumed. Opponent attacks disabled by Amnesia, per-turn cooldown, or once-used restrictions are excluded from this future-reply estimate. Focused tests cover known-vs-hypothetical counterplay, winning KOs, disabled attacks, deterministic hidden-information invariants and legality.

This code change happened **after** run 40152500262 and must **not** be credited for that result. Updated CI tests, expanded personality diagnostics and new matches were queued at documentation time. Keep Level 7 until fresh held-out trials establish improvement.

## Diagnostics and instrumentation

- `scripts/diagnose-cpu-decisions.js`: both policies act hypothetically on exactly the same real-engine position. Logs own hand, public board and legal candidate disagreement; never uses opposing private hand/deck/prize IDs as input to ranking.
- `scripts/diagnose-cpu-losses.js`: replays real failed Apex-vs-Mastermind duels, verifies legal transcript reproduction, and isolates earliest first-turn policy disagreements for tactical review.
- `benchmark_cpu.js` now records *actual per-decision wall-clock time* using the optional `driveSide.onDecision` callback. Earlier published latency percentiles were computed by dividing batch time by actions and are **not** individual-action percentiles.
- `.github/workflows/cpu-decision-quality.yml` runs these investigations and fresh-seed comparisons.

## Promotion criteria

An upgrade must win consistently against RPG Mastermind across NPC archetypes, early/mid/late campaign tiers, and held-out seeds, while retaining legal/deterministic play, no hidden-state leakage, no stalls and acceptable real per-decision p95/p99. The user's preference permits up to approximately 1–2 seconds of **useful thinking** per action; no artificial delay is allowed.

**Release status:** [PR #101](https://github.com/NicolasSorrenti/poketest/pull/101) is open. RPG remains Level 7. No merge or deployment is warranted until results and repository CI are reviewed.
