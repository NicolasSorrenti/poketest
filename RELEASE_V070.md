# v0.7.0 — Chaos Gym replay atomicity

When Chaos Gym redirects a Trainer to the rival, an unsuccessful or incomplete delegated play now restores both players' original state and the Stadium, rather than retaining partial costs or mutations. The owner still discards the attempted Trainer according to the existing failed-flip flow.

Added `test_chaos_replay_atomic.js` to the standard test suite. Entire existing suite passes.

## Fidelity limitation (not yet 100%)
The Chaos Gym delegation still uses a restricted CPU replay path. It does not support all Trainer choices and dual-human turn control. Complex opposing-player prompts and legality verification remain open. Do not treat this change as a completed Chaos Gym implementation.
