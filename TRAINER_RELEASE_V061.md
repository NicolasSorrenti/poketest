# Neo Campus TCG v0.6.1 — Trainer interaction repairs

This build continues the historical Trainer correctness pass against the bundled TCGdex card text. It is **not** a declaration that the remaining Trainer interactions are 100% authentic.

## Resolved or improved

- **Vermilion City Gym:** Lt. Surge Pokémon now offer a real **optional** choice to flip before an attack. Heads adds 10 damage **after** the normal damage modifiers if damage was dealt; Tails adds 10 self-damage even if the attack itself deals no damage. A declined flip does neither. The effect is not offered to other Pokémon. The CPU's strategic use remains out of scope.
- **Brock's Protection:** The attack-resolution path now restores an attached Energy card which an opposing attack tried to discard from a protected Brock Pokémon; the removal does not reach the owner's discard pile.
- **Ecogym:** Opponent-triggered discard of non-Colorless Energy from a surviving Pokémon returns the Energy to its owner. Voluntary own discards are unaffected. `Double Colorless Energy` is now correctly excluded from Ecogym's non-Colorless clause, including Energy Removal.
- **Validation:** 11 new targeted attack/Trainer scenarios plus the existing Node.js regression suite, including the prior v0.6.0 human-choice scenarios.

## Scope and outstanding work

`npm run trainers:audit` reports **166 of 178 Trainer records with a handler** and **12 partial records**. This is dispatch/test coverage, not a proof of all rules interactions.

The remaining 12 partial records are listed in `TRAINER_COVERAGE.md`. Important remaining work includes full Chaos Gym redirected Trainer plays, Sabrina's ESP reroll choices, comprehensive Pokémon Tower and Ecogym interactions, the complete height dataset for Blaine's Quiz #1, face-down Secret Plan reveal cases, and cross-card timing for reactive Tools.

The graphical browser playthrough has not been completed in this release.
