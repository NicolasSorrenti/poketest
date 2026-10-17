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

## Known limitations and next work

1. Verify green CI on all affected and full regression suites. 
2. Add safe effect-specific multi-choice, retreat payment and Trainer discard/search targeting heuristics.
3. Benchmark many paired matches across multiple decks and report confidence intervals, latency, missed KOs and mistake diagnostics. Current tests do not establish ordered competitive skill strength.
4. Add bounded same-turn planning, then evaluate hidden-information ISMCTS against the heuristic baseline within a CPU time budget.
5. Coordinate profile assignment with RPG and UI owners. Do not rewrite story content.

Champion is presently the strongest greedy heuristic configuration, not a validated optimal or tournament-level player.
