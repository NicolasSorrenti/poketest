# Neo Campus TCG — CPU AI Director

## Branch and coordination

Branch: agent/cpu-ai-director-20261017. Draft PR: #9.
Owns CPU decision quality, skill configuration, profiles, benchmarks. Does not own historical rule implementations, NPC dialogue, art, UI or multiplayer.

## Audit

The original classic_bot.js tried a fixed first-legal sequence, attached Energy to the first valid recipient and selected the first pending option. The headless_duel.reduce validator remains the authoritative transactional rule engine. duel_protocol.publicView projects the authorized player's state. classic_local_service.js hosts singleplayer CPU turns; online has a separate service.

## Implemented this branch

- cpu_policy.js: one reusable generator, evaluator and validator for Beginner, Casual, Experienced, Expert and Champion.
- Independent styles: balanced, aggressive, defensive, tactical, setup and risk_taking.
- Seeded, reproducible stochastic policy for lower difficulties; greedy full heuristic ranking for Champion.
- Evaluations for initial Active/Bench, Energy attack-readiness, evolution, expected printed attack damage/apparent KO, retreat, common Trainers and selected activated Powers.
- All proposed actions execute only via the authoritative reducer. Heuristic policy inputs use its own viewer-projected hand/board and opponent's public board/counts, not hidden deck/hand/Prizes or predicted RNG results.
- ClassicLocalService.create accepts difficulty, personality and aiSeed independently of opponent deck, preserving existing defaults.
- Headless deterministic secrecy tests and four short self-play scenarios; an optional paired arena with seat-swapped seeds, decision timing, command logs, game outcomes and Wilson 95% intervals.

## Verified October 17, 2026 CI / benchmark

- GitHub Actions on CPU branch: **CPU AI regression, TCG Gameplay Regression, and Node regression all green**, including RPG tests. Tested PR merged tip e81f696873267c51a3b331ea8950b9722a016fe6.
- CPU unit suite: five difficulty settings, six personality styles, hidden-state projection, deterministic seed tests, legal action checks, 4 short self-play scenarios.
- Existing Classic service regression: 80 CPU duel scenarios, 3,009 validated commands, 743 attacks, 207 interactive responses and deck conservation.
- Paired seeded arena: Champion Blackout vs Beginner Blackout: 31 of 68 decisive games in 100 matches; 32 draws/turn-limits, 95% Wilson interval about 34.3%–57.3%. Champion Brushfire vs Beginner Blackout: 28 of 49 decisive in 50 matches, 1 draw/turn-limit, 95% interval about 43.3%–70.0%.
- **No statistically demonstrated ordered difficulty advantage**: stronger CPU's greedy heuristic remains too weak; prioritize strategic tuning before describing Champion as a meaningful challenge.
- No illegal actions committed by policies in the arena, but **16,181 rejected candidate legality probes from 25,707 probes** in the 100-match same-deck arena and 7,333 from 11,206 in mixed decks. This is correctness-safe but inefficient: reduce invalid candidate enumeration and avoid depending on hidden-state-sensitive reducer rejection.
- Mean action decision time ~0.74 ms (same-deck) and ~0.77 ms (mixed-deck) on GitHub-hosted Node runner; not a promise for client hardware.
- CI exposed and regression-tests two dead-end patterns: invalid activated Power choice, and Super Energy Removal without a valid opposing target; bounded subset generation handles non-prefix Double Colorless retreat cost payments.

## Testing

GitHub Actions CPU AI regression additionally runs the existing Classic local CPU suite. First CI passes exposed and we corrected CPU-side dead-end choices for Strange Behavior, Double Colorless retreat payments, and unsupported Super Energy Removal target conditions. These CPU-side preflights are not substitutes for authoritative rules-agent legality fixes. All three CI workflows passed on the verified commit noted above.

## Coordination note on concurrent rules work

- After the verified green run above, new Base→Neo rules commits landed on main. A later PR-merge TCG regression run for the AI branch failed at `test_neo_batch_v067.js:62`: expected a defender-owned Energy discard choice for Koga's Muk reactive Power. The CPU agent did not modify that rule or test; ownership belongs to the historical rules agent. CPU-only regression remains green. Re-run full suite when the rules fix lands; do not merge based solely on the earlier green result.

## Follow-up milestone — fundamental tactics and RPG profiles

- Implemented extra CPU-side candidate preflight for affordable attacks, evolution timing, and retreat Energy with public modifiers. Reducer still makes every authoritative decision.
- Upgraded the strategy scorer with a backup-Pokémon safety incentive, conservative Professor Oak draw/discard evaluation, dangerous Energy Removal and defensive Trainer checks, lethal Gust/PlusPower setup, public one-step Energy damage projection, and exact printed-family expected damage for Flail/counters and coin effects.
- Added targeted regression tests for opening backup setup, conserving Oak, Double Colorless multi-pay choices, Magikarp Flail, PlusPower/Gust setups and projected Energy readiness.
- Added `cpu_profiles.js` with independent skills and tendencies for all eight existing Neo Harbor NPC identities. `ClassicLocalService.create({npc, difficulty, personality, aiSeed})` resolves NPC defaults but permits explicit overrides; decks stay independent. **The RPG client still must pass its NPC ID** through duel creation; that UI hook is intentionally left for the Integration Agent.
- Expanded paired benchmark matrix to cover each neighboring difficulty. Early 50-match pairs did not establish a monotonic ordering: even when Champion clearly beat Beginner on Blackout mirrors, Expert/Champion were statistically close and Casual occasionally lost to Beginner. Avoid claiming balancing is done.
- Across this milestone the CPU policy and local service regression passed repeatedly, with the full Node and TCG suites green at commit `1e142c01462201270b4f0c0cf83e725b8cf286ee`. Latest damage-evaluation tests are under CI verification as of this note.
- Next: stronger prize-race evaluation, tempo/deck-archetype tuning, better mandatory Trainer selections and target combos, longer matched tournaments with fewer turn-limit outcomes, and explicit Integration Agent handoff.

## 2026-10-17 continuation — validated action preflight and informed targeting

- Corrected a significant own-turn-state bug: `publicView` masks fields `energyUsed` and `retreated`, yet the CPU generator mistakenly read these missing fields. The policy now adds *only its own* authoritative once-per-turn flags to its masked observation, never opponent secrets. It will not propose duplicate Energy attachments or second retreats within a turn.
- Fixed opening setup: higher-skilled duelists establish a backup Basic before confirming; optional extra setup targets differ by skill, with Champions holding a sensible two-Basic Bench ceiling rather than exposing every card.
- Fixed an inverse difficulty defect: larger `attention` previously also widened the randomized action pool for *stronger* CPUs. `sampleWindow` now decreases strictly from Beginner to Champion as intended, and temperatures also decrease monotonically. All candidates still fall back to the authoritative reducer for legality.
- Added one-step public-state Energy foresight for Casual, refined threatened-retreat evaluation to distinguish safe replacements from equally lethal targets, and reduced speculative Champion fleeing that sacrificed attacking tempo.
- Coin-flip evaluation now distinguishes expected damage from knockout probability. Known coin families use **exact binomial odds** instead of double-discounting the expected result, including Nidoking Thrash/Thunderpunch's recoil branch.
- Improved forced promotion and Gust/target decisions to prioritize reachable knockouts after resistance/weakness and affordable Energy, as well as prospective survival, instead of only selecting a Pokémon with the lowest remaining HP.
- Added focused regressions for the duplicate action issue, deterministic multi-Basic openings, strict decision-noise tiers, Casual one-step planning, avoidance of suicidal retreat, exact KO chances on printed cards, and choosing Gust/promotion targets.
- Expanded the reproducible CI arena to **450 matches** across seven paired matchups, including 120-turn Champion/Expert and Casual/Beginner mirrors. The 120-turn horizon eliminates nearly all misleading 60-turn draws; it also reveals **Champion remains inadequately calibrated against Expert**.
- On the 100-game Blackout mirror at commit `e75e980`, CPU legality probes rejected dropped from **13,076** at `17ccae8` to **599** while accepted CPU commands remained valid; Champion beat Beginner 41–21 with 38 time-limited games. This is a dramatic performance improvement, but not evidence of completed difficulty balancing.
- The CPU, Node and full gameplay jobs were all green at commit `54a19e8`; subsequent regression runs continue on the CPU branch. External Neo rule changes on `main` caused intermittent historical-card test failures during this work; we did not modify those engine modules.

**Honest limitations:** no genuine limited-depth adversarial search, still many Trainer effect-target and attack-text cases with heuristic valuation; end-turn score and resource strategy still need serious work. Champion's full-length Blackout mirror against Expert was 21–29 before the target-choice change, confirming that deterministic greedy choice is not yet consistently stronger than Expert's slight randomness. Do not advertise Champion as truly tournament-optimal.

## Additional improvement — hand-aware openings and accessible Trainer choices

- Opening Active evaluation now cross-checks the CPU's **actual visible hand Energy** with affordable first attacks. A skilled CPU with Hitmonchan, Squirtle and Water Energy chooses the Water attacker; with Fighting Energy it chooses Hitmonchan. A novice may still be swayed by high printed HP. Covered by deterministic scoring regressions.
- Pending Gust of Wind decisions now prefer a target the current Active can actually KO after Weakness/Resistance, even if another target has less HP but resists the attack. Forced promotions similarly weigh ready attacks, current HP, and the publicly visible opposing threat. Covered by targeted regression tests.
- Final 120-turn *same-deck* seeded benchmark after these changes (`051dcc2`): **Champion 22–28 Expert**; **Casual 24–26 Beginner**. These are improvements from 17–33 and 25–25 respectively in the earlier 120-turn policy version, but not proof of stronger elite play. The current Champion simply remains **not consistently stronger** in this pool and must not be advertised as tournament optimized.
- The 100-game 60-turn Blackout baseline: Champion 35–20 Beginner, 45 time-limited results. **The mixed-deck Brushfire/Blackout series was 17–26 with seven nondecisive**; deck matchups matter greatly.
- CPU regression passed at commit `051dcc2` alongside 450 seeded arena matches; complete full-suite status must be checked on the same PR head after doc updates.

## Tactical search milestone — evaluated, not overclaimed

- Added a deterministic, bounded **two-card tactical forecast** for Energy attachments and evolutions, with a real historical Machop → Machoke → third Fighting Energy example. The forecast computes potential damage and KO probability using only the player's own revealed hand, the public battlefield, and printed attacks; it does **not** call `reduce` for future exploration or inspect private opposing cards, random state or future deck draws. A new midgame test checks decision invariance when opponent hidden cards and the future RNG state change.
- Added `--left-planning` / `--right-planning` paired A/B benchmark switches, allowing equal-level Championship comparisons instead of assuming an extra feature is beneficial. Paired 120-turn **Champion with planning vs Champion without** was **40–40** across 80 Blackout matches and **19–21** across 40 Brushfire matches. No improvement was demonstrated; the forecast also increased decision latency.
- Therefore **planning is experimental and OFF by default** on all levels (including Champion), available only via explicit `planning:true` in the CPU policy and tournament CLI. Do not turn it on in the RPG or live service based only on unit tests. A regression locks down the effective default and the CLI's truthful planning metadata.
- Implemented visible **recoil self-KO risk** in skilled attack valuation, with a historical Machoke Submission regression: an avoidable non-Prize self-KO loses to a safer move, while Beginner can still choose raw damage.
- Implemented **late deck exhaustion safeguards**: Expert/Champion will not use Bill with 2 or fewer cards remaining or Oak with 7 or fewer, where routine extra draws risk eliminating their next-turn draw. Beginner is deliberately less disciplined. Tested at the real action-candidate level.
- The 120-turn **Champion vs Expert** Blackout mirror after these safeguards was **20–30**; **Casual vs Beginner** was **24–26**, both without experimental planning. These fixed-seed head-to-head runs still do not prove tier ordering. The entire regression workflow now contains **570** paired, seat-swapped CPU matches across 60-/120-turn horizons and two same-level planner A/B tests.
- All three suites (CPU, full TCG and Node/RPG) were green at `6b5cc4e`. A subsequent benchmark reporting regression correction is being checked. One transient full-suite red earlier in this milestone came from concurrently added `test_neo_batch_v072.js` Prize/KO rules; this branch did not modify its engine implementation and later full suites recovered.
- Next genuinely promising research: diagnose **which actions differ on expert losses**, design stronger opponent-reply/Prize-race evaluation and mandatory multi-stage Trainer target planning, run multiple new *seed sets* with fewer censored games. Prefer demonstrable win-rate gains over increasing simulation complexity.

## Post-merge tactical continuation — PR #11

- PR #9 was **merged** into `main` at commit `66ec583ce68dddf77e02c1862f2e37f103dc3bfa`. This continuation now lives on dedicated branch `agent/cpu-ai-tactics-20261017`, draft PR #11. The current `main` contains the previous complete CPU milestone.
- Added experimental `evolutionTempo` option and regression scenarios. In a ready Machop → Machoke evolution, an Active with one Fighting Energy loses its immediately affordable Low Kick. The stronger evaluator delays that evolution unless it protects the Pokémon from an imminent knockout, cures a disabling condition, or an Energy in hand can restore effective attacking immediately. This uses only visible battle state/own hand.
- Added paired benchmark `--left-evolution-tempo` / `--right-evolution-tempo` to measure the feature against the unchanged Champion on exact same deck/seed with swapped sides. On 120-turn matches: **39–41** on Blackout (80 matches) and **28–32** on Brushfire (60 matches), with zero timeouts. It did **not** measurably improve head-to-head strength, so remains **off by default**.
- Improved Energy Removal/Super Energy Removal multi-stage choices using actual public attack affordability. Experienced+ CPUs now preferentially remove Energy from the opponent Pokémon creating the greatest immediate threat, and choose the specific attached Energy card that disables affordable attacks. On the Super Energy Removal payment stage, they prioritize discarding their least valuable own Energy while retaining the type needed for their Active attack. Beginners continue to make plausible simpler targeting mistakes.
- Only expose an **own previously selected** Trainer target/source from the pending plan to the scorer, never the opponent's hidden cards/hand/deck or the complete internal pending plan. Focused regressions cover opponent active-vs-bench target, Fighting-vs-Water Energy choice and no hidden decision metadata from another player's Trainer plan.
- The CPU, Node and Gameplay regressions were green after the first tactical evolution fix at `8ef452c`. Latest Trainer-choice regression runs are under CI verification.
- **Next milestones:** actual Prize-race optimization and expected opponent response within a bounded, masked-information model; more action-choice tests for Gym and Neo disruption; benchmark improvement across multiple independent seed ranges before enabling experimental tactics.

## Public Prize-race and opponent-response prototype (PR #11, follow-up)

- Added `prizeRace` as a **strict opt-in** CPU configuration flag (default `false`) for Expert/Champion. When the CPU can take its final Prize or knock out the only opponent Pokémon, its attack gains a dominant reward weighted by *published* attack knockout probability; it does not predict hidden Trainer cards, RNG or unknown drawn Energy.
- The same public-state evaluator considers emergency retreat if the opponent has one Prize remaining and the *currently revealed* attacking Pokémon can knock out the CPU Active but not a prospective Bench replacement. An Asleep or Paralyzed attacker is excluded from this immediate threat forecast.
- Focused tests cover guaranteed match-winning Low Kick, a genuinely safe escape from a visible final-Prize threat, a dangerous replacement, and a disabled (Asleep) enemy. Policy and benchmark are separately toggled via `--left-prize-race true/false` and `--right-prize-race true/false` for a **matched Champion vs Champion baseline**, without lowering the opponent's competence.
- Paired headless benchmark added **260 matches** across four deck archetypes and seed cohorts, all with 120-turn cap:
  - **Blackout:** experimental **43–37** baseline, no draws.
  - **Brushfire:** **29–31**, no draws.
  - **Overgrowth:** **30–30**, no draws, independent seed `17891`.
  - **Zap:** **30–25**, **5 nondecisive**, independent seed `27891`.
  - Combined: **132 wins, 123 losses, 5 draws/timeouts**, 132/255 = **51.76% decisive win rate**. Statistical uncertainty still includes no improvement; do **not** enable by default or claim calibrated Champion strength.
- Improved `benchmark_cpu.js` to report wins by *Prizes, exhaustion of the opponent's Pokémon, deck-out, or other*, plus each side's mean remaining Prize cards. This prevents silently conflating draws/turn limits and legitimate victories. Added a small independent tournament regression checking all win causes sum correctly to conclusive results.
- CPU benchmark workflow now executes **970 seat-swapped games**: the previous 710 plus the four new prize-response A/Bs (80+60+60+60). At commit `8badcf4`, **all three workflows passed**: CPU regression/arena, comprehensive Node/RPG and TCG gameplay regression.
- Remaining tasks: distinguish truly guaranteed KOs from protective effects and redirected attacks, avoid speculative retreats, benchmark across different Gym and Neo deck themes, and measure independent seeds and strategic decisions over a larger statistically informative sample.
- PR #11 remains draft; PR #9 is already merged into `main`. No historical rules, RPG story or duel UI code was changed during these experiments.

## 95%-win target and graded tactical response (latest continuation)

- Explicit user acceptance target: **lower difficulty wins no more than 5% of decisive games against each adjacent higher difficulty**. Draws/timeouts are separately reported. `benchmark_cpu.js` now includes a 5% upset target, observed pass/fail, and **Wilson 95% upper-bound** statistical verification; `benchmark_cpu_tiers.js` audits all four adjacent matchups across equal-theme decks with swapped starting positions and independent seeded cohorts. `--strict` can fail a run if calibration is not verified, but is intentionally not activated while this is an unfinished milestone.
- First 240-game independent audit (15 pairs × two decks): lower-level win rates **43.3% (1 vs 2), 33.9% (2 vs 3), 51.7% (3 vs 4), 56.7% (4 vs 5)**. The old difficulty hierarchy is far from target; higher levels even lose more often in the top two tiers. This is an explicit **unmet requirement**, not a pass.
- CI now performs a **larger 640-game adjacent-tier audit**, 40 pairs per deck, with enough samples for a meaningful 5% confidence bound in the *best* cases. Results: **1 vs 2: 69/159 lower wins (43.4%)**, **2 vs 3: 59/159 (37.1%)**, **3 vs 4: 86/160 (53.8%)**, **4 vs 5: 86/160 (53.8%)**. Two first-tier matchups had one draw apiece. **All four fail the 5% threshold**; even the ordering of the top tiers is reversed. The full CPU CI matrix additionally covers optional tactical A/B experiments.
- Added opt-in `knockoutTempo` tactical evaluation: prioritize a guaranteed KO, especially match wins, but build essential Backup Pokémon before risking the last one. Separate 140-game comparison: **70–68** with two draws, no clear evidence of skill improvement.
- Added opt-in `opponentResponse`: bounded one-ply counterattack check with **visible** opposing Energy, projected damage, own powered Bench, opponent statuses and no private deck/hand reads. Avoid moving to a passive/unpowered replacement; never flee if the current Active can take a near-certain KO. Separate 140-game comparison: **74–66**; not enough evidence to enable it automatically.
- Combined `prizeRace` + `knockoutTempo` + `opponentResponse` A/B on two decks: **64–56** vs identical Champion policy, and **63–57** vs Expert. Modest and **far below 95%**. All tactical experiments therefore remain disabled by default.
- Exposed these combined, public-state-only experimental tactics to the actual authoritative local duel service via `ClassicLocalService.create({difficulty:5,advancedTactics:true})`, also permitted at level 4. Requests at levels 1–3 reject the switch rather than claiming to enable a disabled feature. The standard CPU and established NPC difficulty defaults are unchanged; regressions cover this contract.
- Added `docs/cpu-ai-calibration.md` with reproducible commands, fairness constraints, statistical acceptance and exact results. Never manipulate random flips, private opponent data or historical game rules merely to make win rates cross 95%.
- Continuing: build a genuinely stronger Champion evaluation of Trainer combinations and future Prize tempo, examine loss transcripts/decision mistakes, and use matched large seeded tournaments across multiple deck archetypes before marking tier separation complete.

## Known limitations and next work

1. Verify green CI on all affected and full regression suites. 
2. Add safe effect-specific multi-choice, retreat payment and Trainer discard/search targeting heuristics.
3. Benchmark many paired matches across multiple decks and report confidence intervals, latency, missed KOs and mistake diagnostics. Current tests do not establish ordered competitive skill strength.
4. Validate tactical search against same-level controlled baselines before enabling it; test hidden-information ISMCTS only within a fixed CPU time budget.
5. Coordinate profile assignment with RPG and UI owners. Do not rewrite story content.

Champion is presently the strongest greedy heuristic configuration, not a validated optimal or tournament-level player.
