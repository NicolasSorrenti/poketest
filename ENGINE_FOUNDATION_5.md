# Engine Foundation 5 — Unified decision session lifecycle

This checkpoint migrates the two real browser adapters (`deckSearchRequest` choices and generic Pokémon-target choices) onto the same transport-neutral decision session lifecycle.

- `decision_session.js`: reusable session with actor authorization, immutable choice IDs, live-option legality rechecks, cancellation, retry on rejected effects, and one successful commit.
- `legacy_choice_bridge.js`: existing card-option pickers now commit through the session; exposes cancellation and clears settled sessions.
- `target_choice_bridge.js`: target pickers now commit through the same session; prevents accidental re-submission after successful resolution.
- `engine.js`: existing cancel buttons invalidate their old pending decision.
- `test_decision_session.js`: verifies wrong actor, stale/illegal targets, rejected resolver retry, cancellation, and double-submission prevention.

`npm start` keeps the existing browser duel available at http://localhost:8000, `npm test` runs all checks.

This is a tested integration milestone **not** a claim that every historical card is supported by the new system. Specialized effects still have legacy callbacks, and the rules engine still depends on browser/CPU state. Multiplayer room protocol modules remain future scaffolding, not a deployed online game.
