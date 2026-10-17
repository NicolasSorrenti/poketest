# Neo Campus TCG v0.7.8 — Sabrina's Psychic Control

This release fixes an opponent-discard race in Sabrina's Psychic Control: when a card selection is pending and the opponent's discard changes, the selected slot must still contain the originally offered Trainer. The engine now rejects mismatched selections instead of borrowing whichever Trainer currently occupies that index. Temporary borrowed Trainer identifiers also refuse accidental collisions.

A targeted regression test covers replacing the selected opponent-discard card before confirming the choice. The full `npm test` suite passed.

**Remaining limits:** Psychic Control still cannot borrow every legal historical Trainer with all multistep choices/costs. Chaos Gym and other partial Trainers are not certified 100% authentic.
