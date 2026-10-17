# v0.8.1 — Chaos Gym unresolved-choice safety

A redirected Trainer replay may finish only when it has no unresolved new prompt. A handler that reports success but opens an additional mandatory choice is treated as incomplete and rolled back, rather than silently accepting a partial Trainer effect. Adds a regression release guard. Full `npm test` passes.

**Still incomplete:** full player-driven interactive multi-step Trainer choices under Chaos Gym and Sabrina's Psychic Control. This is a safety improvement, not full historical fidelity.
