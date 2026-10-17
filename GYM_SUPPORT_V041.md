# Neo Campus v0.41 — Gym Heroes / Gym Challenge continued

Blaine’s Quiz #1 is intentionally excluded by request. No Quiz #1 implementation or card-height lookup was added.

## Added to the authoritative local/online reducer

- **Chaos Gym** is playable as a Stadium. For non-Stadium Trainer plays, the server makes the coin flip. Heads resolves normally; tails moves the Trainer to its owner’s discard and gives the other player the choice to use the effect, including another player-owned target/cost decision. The original card stays in its owner’s discard. Most ordinary one-shot Trainers, including Bill and Gust of Wind, can be redirected. Permanent Trainers and especially exotic nested replays require more interaction/ownership testing before declaring full historical fidelity.
- **Lt. Surge’s Secret Plan** puts a player-chosen hand card face down on the Bench. The card’s original identity is not disclosed to the opponent or spectators; player-own card identity is only included in that player’s private view. Manual turn-only reveal is available from Pokémon Powers. If the revealed card is not a Basic Pokémon, it goes to its owner’s discard without falsely awarding a Prize. The game handles attack damage, some forced switching, evolution, retreat and Power triggers. Exotic attacks and cards without a visible state change still need verification.
- **Misty’s Psyduck — ESP** flips exactly three coins. One heads draws one card; two heads deals 20 damage, applying normal Weakness and Resistance; three heads prompts for a Defending Pokémon attack to copy. Currently copy choices are restricted to executable, no-extra-choice attack handlers. More complex copied attacks requiring subsequent choices must be migrated separately instead of silently approximated.
- Face-down Secret Plan suppresses all Pokémon Powers, and opponent-side selection labels never disclose the hidden card ID.

## Regression verification

- `npm test` (legacy suite)
- `node test_gym_chaos_v041.js`
- `node test_gym_secret_v041.js`
- `node test_gym_psyduck_v041.js`

These tests exercise the real headless reducer, owner-specific decisions, both Chaos coin outcomes, Prize safety, opponent/spectator redaction, forced reveal, and all four Psyduck coin counts. This **does not** certify the Gym sets as 100% historically correct. Render redeployment clears active in-memory matches.
