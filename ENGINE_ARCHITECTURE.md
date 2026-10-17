# Engine architecture checkpoint 2 — card-first, transport-independent decisions

## Purpose
Neo Campus is a card-rules engine first. A visual novel / tag-team campaign or online duel is an optional future shell; neither should be required to execute effects.

## What landed
- `decision_core.js`: pure, CommonJS choice contracts with stable opaque option IDs, explicit actor, mandatory/optional choice rules, bounds and validation.
- `duel_protocol.js`: pending decision visibility is scoped to its actor, rather than leaking option labels and IDs to the other player.
- `duel_rooms.js`: turn checks permit an out-of-turn player to resolve *only* their own pending choice. An unanswered choice blocks unrelated commands. Revision handling remains unchanged.
- `test_decision_core.js`: actor authorization, exact bounds, duplicates, stale IDs, invalid IDs, privacy, room dispatch and out-of-turn decisions.

## Honest limitations
- The browser `engine.js` still owns UI, rules, randomness, and local CPU actions. The new module is NOT yet used by historical card-effect handlers.
- No online duel endpoint, persistence, lobby UI, or playable remote engine adapter is included.
- Selection IDs are opaque to transport, but game-side adapters must bind them to currently legal game objects, validate legality again at commit time, and choose the authoritative random seed.
- Existing catalog recognition and passing tests are not proof of 100% card fidelity.

## Next engineering step
Introduce a `GameSession` adapter that converts browser-specific `ask` / `askDefender` / `deckSearchRequest` paths into `makeDecision`, captures the continuation in server-side state, and calls the exact same effect resolver from UI, CPU and network actions. Migrate one representative *multi-step* Trainer end-to-end, test normal play + Chaos Gym + Psychic Control, then migrate remaining Trainer effects in batches.

## Suggested extension contract
Card effect => pure legality check => decision request (if needed) => validated player answer => effect continuation => deterministic state transition and log. Clients receive state projections and submit named actions, never raw game mutations.
