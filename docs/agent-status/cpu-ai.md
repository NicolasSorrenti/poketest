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

## Testing

GitHub Actions CPU AI regression additionally runs the existing Classic local CPU suite. First CI pass exposed a dead-end Strange Behavior activation with an impossible recipient. Added conservative preflight for Power use; this is an AI workaround, not a replacement for a rules-agent legality fix. PR also runs broader gameplay and RPG suites. Check latest CI before merging.

## Known limitations and next work

1. Verify green CI on all affected and full regression suites. 
2. Add safe effect-specific multi-choice, retreat payment and Trainer discard/search targeting heuristics.
3. Benchmark many paired matches across multiple decks and report confidence intervals, latency, missed KOs and mistake diagnostics. Current tests do not establish ordered competitive skill strength.
4. Add bounded same-turn planning, then evaluate hidden-information ISMCTS against the heuristic baseline within a CPU time budget.
5. Coordinate profile assignment with RPG and UI owners. Do not rewrite story content.

Champion is presently the strongest greedy heuristic configuration, not a validated optimal or tournament-level player.
