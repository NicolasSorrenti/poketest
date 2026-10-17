# Neo Campus TCG v0.5.9 — Trainer rules repair

This release is **not yet a certified historical Trainer implementation**. All 178 historical Trainer card records now have a dispatch path, but an entry with a handler is not necessarily feature-complete.

## Machine-generated Trainer dispatch audit

Run `npm run trainers:audit`. The current classification is **117 handler**, **61 partial**, **0 without a dispatch path**. The 61 partial records are listed individually in `TRAINER_COVERAGE.md`.

## Added and repaired

- Blaine's Quiz #1: card selection and an automated opponent length guess. This is **partial**: TCGdex doesn't include the length printed on the historical cards, so a finite local height table is used; unsupported species cannot be selected. The lengths require card-by-card verification.
- Blaine's Quiz #3: choose a Pokémon and an announced attack. The CPU guesses from the set of Pokémon bearing that attack.
- Lt. Surge's Secret Plan: select any hand card to become a face-down Basic Pokémon, manually reveal it later, and discard non-Basics when revealed. This is **partial**: not every attack and Power can yet trigger the required reveal at precisely the right step.
- Sabrina's Psychic Control: flip, choose a supported Trainer in the opponent's discard, play it with costs paid from your own cards, and leave the original Trainer in the opponent's discard. The proxy can be canceled without spending it. This is **partial**: the selection excludes unsupported non-Stadium Trainer implementations.
- Chaos Gym: non-Stadium Trainer plays are coin-gated. Failed plays discard their cards; the rival can use a limited set of safe no-choice effects. This is **partial**: the rival does not yet offer all possible replays or choices.
- Opponent-owned Trainer choices (including Erika, Challenge!, Blaine's Quiz #2, Pokémon March, etc.) are automated by the rival in solo play. The human no longer makes those selections from the rival's deck or hand. Choice quality remains basic.
- Counterattack Claws now responds to incoming damage and discards itself; EXP.ALL transfers a Basic Energy in the unambiguous, one-card case. EXP.ALL needs an interruptible defender-choice prompt for multiple eligible Energies or multiple tools.
- Blaine's extra Energy attachments must go to the **same** eligible Pokémon.
- Brock's Protection blocks opposing Energy Removal targeting; Ecogym can return non-Colorless Energy discarded by Super Energy Removal to its owner.
- Charity returns to hand at end of turn if its holder is still present; its optional damage-reduction choice is not complete.
- Poké Ball can resolve with no target and optionally skip the search. Trainer searches now exclude Basic Energy records misclassified as Basic Pokémon in the original cached JSON.
- Extra safeguards for Chaos Gym when Trainer use is already illegal, and proxy cleanup after canceled selections.

## Validation

Run `npm test`: original suites plus `test_trainer_v059.js`. The new file tests the live effects above with prepared match states, including invalid choices and replayed Trainer ownership. Run `npm run trainers:audit` for up-to-date dispatch coverage.

A real graphical duel was **not** verified in this environment: headless Chromium timed out. The Node.js server and static assets were served, and JavaScript syntax checks passed.

## Outstanding work before 100% historical fidelity

The `partial` section of `TRAINER_COVERAGE.md` is still open. Particularly significant items include Chaos Gym's general redirected-Trainer path, Secret Plan's full reveal timing, Sabrina's ESP rerolls, Charity's voluntary damage reduction, multiple-choice EXP.ALL timing, Koga's Ninja Trick, some Stadium interactions, and special Energy reactions. The 100% attack/Power **recognition** audits also don't certify their every interaction with these Trainers.
