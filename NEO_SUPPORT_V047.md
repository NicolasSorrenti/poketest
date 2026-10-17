# Neo Campus TCG v0.47 — Mareep → Flaaffy → Ampharos

Completes three Neo Genesis Pokémon printings for custom-deck play:

- **Mareep (neo1-65)**: Static Electricity counts all named Mareep in play on both sides (except face-down Secret Plan cards), allows the attacking player to choose up to that many **Lightning Energy** cards from their deck, attaches only to the attacker, and shuffles. The already-implemented Thundershock remains available.
- **Flaaffy (neo1-34)**: Discharge discards **all attached Lightning Energy** (not Grass, Metal, etc.), flips one coin per discarded Lightning Energy, and does 30 damage per heads. Electric Current deals 20 and transfers a selected attached Lightning Energy to a selected friendly Benched Pokémon, or discards that Energy if the player has no Bench.
- **Ampharos (neo1-1)**: Existing Gigaspark handler is available to the custom-deck builder now that its basic and Stage 1 prerequisites are executable.

Neo Discovery Mareep was already available. The changes add **three new attack-effect signatures** and **three newly selectable Neo Genesis printings**, without affecting previously implemented card effects.

## Historical sources

- Mareep: https://limitlesstcg.com/cards/N1/65
- Flaaffy: https://limitlesstcg.com/cards/N1/34
- The local card importer omits Lightning icons from these descriptions, so implementations intentionally use Lightning Energy by printed card identity rather than arbitrary attached Energy.

## Verification

- Full `npm test` passed locally including the new `test_neo_batch_v047.js`.
- Player-specific choices, optional zero-card searches, deck conservation, multiple coin flips, Lightning-only Energy movement/discard, empty Bench handling, and the complete playable Mareep line were checked.
- The old Neo v0.46 test expectation treating Ampharos as unavailable and the old forged-deck scenario have been updated.
- Both local CPU and hosted online modes share the corrected reducer. The UI itself is unchanged.
- This is a targeted Neo Genesis batch. Neo Discovery, Neo Revelation, and Neo Destiny still have unsupported interactions.

## Deployment

Push to `main`; Render redeploys when automatic deployments are enabled. Server restarts clear all active in-memory matches.
