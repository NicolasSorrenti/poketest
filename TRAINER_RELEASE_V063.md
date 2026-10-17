# Neo Campus TCG v0.6.3 — Reactive Trainer choices and attached-Tool lifecycle

This is a tested correctness update, **not** full historical Trainer completion.

## Gameplay repairs

- **EXP.ALL:** When the CPU's attack would Knock Out the human player's Active Pokémon, the human can now explicitly **decline** to save a Basic Energy, even when exactly one Energy and one recipient are eligible. The prompt verifies the selected Energy and recipient before applying changes; illegal selections do not move cards. Existing multi-Energy/multi-recipient selection remains supported. A successful transfer discards the EXP.ALL Tool and the Pokémon proceeds through normal KO cleanup. A decline leaves the Tool attached and the Energy to be discarded normally.
- **Koga's Ninja Trick:** The attached Trainer is discarded when its host leaves the Active position for the Bench by **normal retreat** or **Switch**, rather than only when its own reactive effect was activated. The cleanup is keyed to the actual unit object, not only card name.
- **Chaos Gym legality:** Known mandatory target requirements for Switch, Gust of Wind, Potion, Super Potion, and Energy Removal are checked before a Chaos Gym coin flip. An impossible play no longer loses a coin flip or consumes the Trainer. This is a focused safeguard, not an exhaustive legal-action validator for every Trainer.

## Validation

- Added `test_trainer_v063.js`: seven prepared duel scenarios, including both optional EXP.ALL outcomes, multiple recipient/Basic Energy choices, Ninja Trick leaving Active, and the invalid Chaos Gym plays.
- Complete existing `npm test` regression suite passes.
- `npm run trainers:audit` still counts **168 handler records and 10 partial records of 178**. This is dispatch coverage, not exhaustive rules accuracy. The known partial Trainer classifications remain conservative.

## Still pending

- Sabrina's ESP's optional **post-flip reroll of every coin**.
- Complex Chaos Gym redirected Trainers (both players' resources and all decision paths).
- EXP.ALL and other reactive Tools in all multi-effect/simultaneous Knock Out scenarios.
- Sabrina's Psychic Control borrowed Trainer interactions, face-down Secret Plan timing, and several hidden-information corner cases.
- Full browser-based match playthrough and deeper interactions with Baby Pokémon/Special Energy.

CPU Trainer strategy remains deliberately out of scope.
