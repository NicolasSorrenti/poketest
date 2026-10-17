# Neo Campus TCG v0.6.0 — Trainer accuracy pass

## Verification summary

- 178 original-era Trainer records represented; 165 dispatch to a handler and 13 remain marked partial.
- 57 direct Trainer/timing/choice scenarios pass in `test_trainer_v060.js`.
- `npm test` runs those alongside the existing attack, Power, Energy, evolution, and Trainer regression tests.
- All 1,479 attack and 166 Pokémon Power records remain *recognized*, which is not equivalent to exhaustive historical rule correctness.

## Fixed in this pass

1. Warp Point, Double Gust and Narrow Gym do not modify the board while a mandatory selection is pending or is cancelled.
2. EXP.ALL responds to a Knock Out with a human decision about destination Pokémon and which Basic Energy to preserve, including a decline option.
3. Charity permits a voluntary reduction of incoming attack damage after Weakness and Resistance; reduction to zero prevents reactions that require damage.
4. Koga's Ninja Trick prompts the defending player before an opponent attack resolves and only discards the Tool if used.
5. New Pokédex selection can be cancelled without inadvertently shuffling the deck.
6. Super Energy Retrieval permits fewer than the maximum eligible Basic Energy cards.
7. Chaos Gym can redirect eligible Trainers to the rival, drawing from and paying costs with the rival's own cards rather than using the human's resources. More complex redirected plays are not yet fully supported.
8. Gym evolutions correctly require their trainer's matching Pokémon lines even when the imported species name lacks the trainer prefix.
9. Fossil Egg can produce eligible Fossil Pokémon with missing source evolution metadata. Mysterious Fossil can be Benched, voluntarily discarded, and evolved, cannot retreat or receive Special Conditions, and gives no Prize on Knock Out.
10. Tested the outcome of multiple Stadiums, card searches, Misty's attack bonus, Koga's Poison, Rocket's Secret Experiment, and Misty's Duel.

## Still partial

The exact **13 card records** remaining partial are listed in `TRAINER_COVERAGE.md`. Among the difficult or incomplete cases are: full Chaos Gym redirected-card decisions, Sabrina's ESP reflip/reuse timing, the remaining heights for Blaine's Quiz #1, hidden-information choices in Lt. Surge's Secret Plan, all interruptions for Counterattack Claws / EXP.ALL, and continuous suppression and discard-pile effects interacting with every attack and Power. A complete browser playthrough has not been verified.

**This is not a declaration of 100% historically authentic Trainer gameplay.** The status indicator "handler" means the card has an implementation path; it does not prove all game-state combinations were tested.
