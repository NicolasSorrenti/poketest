# Neo v0.50: Genesis/Discovery attack-signature closure

- Compile the four last missing printed signatures: Togetic Super Metronome, Gloom Sticky Nectar and the two Smeargle Sketch variants.
- Sticky Nectar implements 20/30 damage and the heads-only Active-switch/retreat lock while the same Gloom remains Active.
- Togetic's copy decisions select an opposing Pokémon and one attack; the original coin roll is preserved.
- Sketch checks the original attacking Pokémon instance, the previous turn, and Smeargle's presence.
- Complex copied attack payments and target decisions are not yet portable. Instead of approximating their behavior, the reducer explicitly rejects them. Togetic and Smeargle therefore remain excluded from complete-card Neo deck legality.
- Gloom (neo1-36) is enabled for Neo custom decks.
- The prior static coverage audit now reports no missing Neo Genesis/Discovery attack signatures, but this is NOT a statement of 100% authentic interactions or Power/Trainer completion.
- Adds v0.50 regression cases; full browser testing and Render deployment are not certified.
