# Neo Campus TCG v0.6.9

## Energy-card correction
- Corrected all 30 malformed Basic Energy source records in Base Set, Base Set 2, Gym Heroes, Gym Challenge, Neo Genesis to `supertype: Energy` with no `Basic` Pokémon subtype.
- Upstream TCGdex adapter now defends against these malformed historic energy entries even when the upstream category is wrong.
- Removed the unconditional board-click rejection for Special Energy; normal engine legality checks still apply (e.g. Miracle Energy).
- Added `test_energy_source_integrity.js` to the default test suite; all project automated tests pass.

## Chaos Gym status
- Existing Chaos Gym rules and tests are preserved.
- Opponent replay still relies on an automatic restricted adapter and is NOT complete for all Trainers or a human opposing player. It must not be called 100% implemented.
