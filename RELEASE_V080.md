# v0.8.0 — Chaos Gym redirected multi-selection safety

Redirected Trainer choice processing now respects the picker minimum and maximum selection counts. If a mandatory selection cannot be satisfied, the redirected play is rejected and the existing atomic rollback restores state. Regression guard added to the test suite. All existing automated tests pass.

**Not complete:** Chaos Gym and Sabrina's Psychic Control still need player-directed, multi-step interactive Trainer choices. This release does not claim 100% historical fidelity.
