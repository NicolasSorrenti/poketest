# Neo Campus TCG v0.42 — Rare Gym interactions

Blaine’s Quiz #1 remains intentionally unsupported. This is a targeted correction pass, not a 100% historical-fidelity claim.

## Verified corrections

- **Misty’s Psyduck ESP:** On three heads, the attack can now copy straightforward recoil, coin-recoil, coin-recoil-bonus, self/whole-Bench spread and additional supported self-contained effects, without paying the Defending Pokémon’s printed attack Energy cost. In addition, copying an attack such as **Hitmonlee’s Stretch Kick** opens a second server-validated target selection. Both players see the same result; the copied Bench target is selected by the attacker, not guessed. A complex copied attack that needs a longer specialized sequence is still blocked rather than approximated.
- **Lt. Surge’s Secret Plan:** While face down, a printed Baby does **not** trigger Baby-rule flips; a printed Dark Pokémon does **not** gain Rocket’s Hideout HP as if its identity had been revealed; and a printed Psychic Pokémon cannot provide attacks to Sabrina’s Alakazam through Psylink. The public and private Psylink views agree. Cards still reveal through the existing server action, forced-switch and attack-effect machinery.
- **Chaos Gym:** Regression-tested redirecting **Computer Search** through multiple opponent-owned discard and deck-search decisions, as well as nested **Chaos Gym → Sabrina’s Psychic Control → Bill**. The copied/redirected Trainer stays in the original owner’s discard pile; player hands, selection permissions and discard locations are correct.

## Tests

- `npm test` and `npm run test:gym:v042` pass.
- New `test_gym_rare_v042.js` exercises controlled coin outcomes, multi-step opponent choices, copying recoil and chosen-Bench attacks, hidden-card identity isolation, Hidden Baby no-coin state, and Dark face-down HP.
- All existing online room and Neo support tests remain present; no changes to layouts or theme deck composition.

## Remaining caveats

ESP attack copying is not yet arbitrary for every highly interactive effect (especially copied attacks with multiple nested payments/searches). Rare **Chaos Gym** interactions involving unusual persistent Trainers and exotic nested redirection, plus all possible Secret Plan reveal triggers, still need additional historical rule verification. Blaine’s Quiz #1 remains skipped by request.

## Hosting

Pushing to `main` redeploys Render if auto-deploy is enabled. An active server restart discards in-memory matches.
