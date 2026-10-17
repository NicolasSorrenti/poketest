# Neo Campus v0.45 — Gym Trainer interactions, Chaos Gym / Professor Elm

A verified historical rule fixes a remaining Chaos Gym loophole: when a failed flip lets the opponent use **Professor Elm**, that opponent cannot use another redirected Trainer during the same active turn. A second failed Chaos Gym flip now discards the attempted Trainer without offering an illegal second use.

- The restriction is enforced both before opening a Chaos Gym opponent-choice prompt and within virtual Trainer resolution.
- The original player's turn continues as required.
- `test_gym_trainer_fidelity_v044.js` now includes this scenario (despite its original filename); `npm test` passed.
- All v0.44 Gym Trainer fixes remain: Chaos attached Trainer ruling, Koga's Ninja Trick switch cleanup, Brock's Protection against Energy movement, and Charity after end-of-turn knockouts.
- Blaine's Quiz #1 remains intentionally unsupported. Exhaustive cross-card historical fidelity is not certified.

Historical basis: WotC 2001/2002 Chaos Gym / Professor Elm rulings in the compiled Complete Pokémon Card Rulings Reference (June 2003).

Deploying this commit to Render will reset matches currently stored in memory.
