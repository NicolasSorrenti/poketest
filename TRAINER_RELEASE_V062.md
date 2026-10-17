# Neo Campus TCG v0.6.2 — Trainer interactions and quiz-data corrections

## Verified changes

- **Pokémon Tower (Wizards promo):** The Stadium now enforces its discard-to-hand prohibition against attacks and Pokémon Powers, not only Trainers. This also handles deferred card selections and Rebirth (which discards and recovers a Pokémon during a single Knock Out transaction). The restriction applies to both players, and normal energy costs/recoil still resolve.
- **Blaine's Quiz #1:** Added all Johto species lengths, filling the complete Generation I–II species pool from the classic Pokédex decimetre height field. Trainer-prefixed cards, Unown forms, Flying/Surfing Pikachu, Nidoran gender variants, and Ho-Oh are normalized to their corresponding species. Ineligible Energy and pseudo-Pokémon cards no longer enter the quiz picker. The CPU's guessing policy remains simple and is not a competitive decision model.
- **Lt. Surge's Secret Plan:** An affected face-down card now flips when a Trainer, Pokémon Power, or attack changes its position or state, even without damage. The existing reveal/discard handling discards it when it is not a Basic Pokémon. Hidden Pokémon unaffected by unrelated actions remain hidden.
- **Regression tests:** 13 new targeted scenarios, in addition to the existing full Node.js test suite.

## Historical data attribution

The Gen II length data comes from the veekun Pokédex species catalog (heights in decimetres): https://github.com/veekun/pokedex/blob/master/pokedex/data/csv/pokemon.csv . The card text is sourced from the bundled TCGdex local files.

## Remaining work

The Trainer audit reports **168 handler records and 10 partial records out of 178**. This counts dispatch and tested mainline behavior, not exhaustive historical correctness. Partial interactions include Sabrina's ESP's optional post-flip rerolls, Chaos Gym's redirected choices, EXP.ALL timing and reactive Tools, Psychic Control's complex copied Trainers, and Secret Plan's hidden-information corner cases. CPU Trainer play is intentionally deferred.

A full graphical browser match has not yet been completed; `npm test` tests Node.js match-state outcomes rather than exhaustive live browser input.
