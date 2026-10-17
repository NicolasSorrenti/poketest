# Neo Campus v0.44 — Gym Trainer fidelity audit and fixes

Scope: all Gym Heroes / Gym Challenge Trainer interactions in the shared authoritative CPU and multiplayer reducer. **Blaine's Quiz #1 remains intentionally unsupported.**

## Rules changes

- **Chaos Gym:** A failed flip discards the original Trainer. The opponent cannot use cards that must be attached or put into play (PlusPower, Defender, Charity, Brock's Protection, Koga's Ninja Trick, Sabrina's ESP, Berry, fossils, etc.). This follows the recorded Wizards of the Coast Chaos Gym ruling and avoids duplicating one physical card between discard and play. A redirected *turn-ending* Trainer cannot prematurely end the original player's turn. Multi-step one-shot proxy choices, including Computer Search and Sabrina's Psychic Control, remain supported and tested.
- **Koga's Ninja Trick:** Discard it whenever its Active Pokémon moves to the Bench (ordinary Switch, retreat, attack-driven switch, or reactive choice). It no longer remains illegally attached when the Pokémon is Benched.
- **Brock's Protection:** Block opposing attack effects that move Energy from the protected Pokémon to a Bench, including Energy Cycle and Magnetic Lines. The attack's normal damage still applies. Do not present a mandatory Energy-selection dialogue when the card protects that Energy.
- **Charity:** Return the attached card to its owner's hand *after* end-of-turn Checkup and Knock Out processing. A Pokémon Knocked Out by Poison or other end-of-turn damage takes Charity to the discard pile instead of incorrectly returning it.

## Verification

- `npm test` (the complete v0.43 suite) passed after the changes.
- `node test_gym_trainer_fidelity_v044.js` covers all above interactions and both Charity outcomes.
- Existing v0.41–v0.43 regression suites check Misty's Psyduck, Secret Plan privacy, Chaos Gym nested decisions, card-copy chains, and multiplayer UI.
- The CPU and online interfaces are unchanged; both use these server-side rules.

## Historical evidence

The June 2003 compiled Wizards of the Coast card-rulings reference (see Chaos Gym section) explicitly disallows opponent reuse of Trainer cards requiring attachment after tails and says opponent reuse of a turn-ending Trainer does not end the active player's turn.

## Limits

This update closes the reproducible Gym Trainer regressions described above. It does **not** establish exhaustive fidelity for every combination among the 264 Gym printings, particularly uncommon card interactions across sets and unusual timed effects. Blaine's Quiz #1 is intentionally omitted.

Render automatically redeploys new main-branch commits when automatic deployment is enabled; this resets in-memory matches.
