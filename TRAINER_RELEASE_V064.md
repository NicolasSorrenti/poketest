# Neo Campus TCG v0.6.4 — Trainer interaction correctness

Built from v0.6.3, preserving the 12 local historical sets and the existing duel UI.

## Changes implemented

1. **Sabrina's ESP** now offers a genuine choice after showing the first complete set of attack coin results: keep those outcomes or reroll the entire set once. The kept/rerolled values are fed into the normal damage/status engine. One-, two- and three-coin tests, and dynamically counted Night Spirits/Pendulum Curse, use an explicit supported-pattern whitelist rather than attempting to guess arbitrary conditional coin counts.
2. Canceling the ESP picker and retrying **does not generate another free set of first flips**. A turn change clears pending preview state.
3. **Sabrina's Psychic Control** can replay *Switch*, *Gust of Wind*, and *Potion* from the rival's discard with proper human target selection. The borrowed Trainer stays in its original discard pile, while Psychic Control is consumed once. Invalid targets do not consume a card.
4. **Counterattack Claws** has additional gameplay tests for Heads, Tails, double resolution and triggering even when its host is Knocked Out.

## Test result

Run `npm test` for the complete Node.js suite, including `test_trainer_v064.js` (25 dedicated scenarios), and `npm run trainers:audit` for the latest catalog report.

## What's NOT yet verified / completed

- The audit still conservatively classifies **8 Trainer records as partial**; this update does not inflate coverage by treating a few scenarios as full historical proof.
- ESP's most complicated **conditional** flipping sequences (e.g. Call of the Night) and exceptional coin interactions with other active Powers or copying attacks need an integrated timing design. Our new ESP picker covers listed straightforward coin attacks, not arbitrary nested coin sources.
- **Chaos Gym** still cannot guarantee all optional redirected Trainer plays, especially when the *human* should respond to an opponent's Trainer during the CPU turn.
- Trainer vs Pokémon Power / Special Energy / attack-copying interactions remain incompletely regression-tested.
- Browser GUI interaction tests are not completed; the headless Chromium process in this environment did not finish rendering. Node engine and HTTP server were tested.
- CPU Trainer strategy is deliberately out of scope per user direction.

**Recognition is not the same as 100% mechanically verified historical gameplay.**

The **Counterattack Claws** handler is now classified as implemented in the audit after additional tests for coin outcomes, single firing, simultaneous Knock Outs, and Prize awards. This changes the conservative Trainer dispatch audit to 170 handlers / 8 partial records.

**Ecogym** was also promoted to an implemented Stadium handler after adding tests for an opposing Pokémon Power (Energy Drain), Double Colorless exclusion, Brock's Protection, and Knock Out discards (in addition to the existing attack/Trainer tests).

Additional regression coverage: canceling Psychic Control now cleans the temporary proxy from the card lookup without granting a free reroll. The Energy Drain Power now cooperates with Ecogym and Brock's Protection, including Double Colorless and Knock Out exceptions.
