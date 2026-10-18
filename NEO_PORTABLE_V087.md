# Neo Campus TCG — portable attack migration v0.85–v0.87

## Scope and verified accounting

The authoritative, server-side portable attack compiler now recognizes **1,382 / 1,479** historical attack printings (**97 still unported**), measured by the `test_attack_effects_core.js` all-catalog smoke matrix on GitHub Actions after these additions. This is **program coverage, not full historical fidelity certification**.

This milestone adds **33 previously unported attack printings** beyond v0.84:
- **11 Neo Revelation/Destiny attack entries** in `neo_attack_batch_v085.js`, including Rainbow Burn, Tail Shock, Flock Attack, MAX Burst, Water Cannon, Slap Awake, Core Blast, Pulse Guard, Hypno Shower, Synchronize and Ink Blast.
- **19 Wizards Black Star Promo printings** in `promo_attack_batch_v086.js`: Light Screen, Recharge, First Aid, two Psywave printings, Telekinesis, 3-D Attack, Fury Swipes, Diamond Dust, Eek, Metal Pincer, Repeating Kick, Pain Split, Seething Anger, Slashing Strike, Roll Over, Leaf Slice, Sacred Fire and Hypno Wave.
- **3 additional Neo entries** in `neo_attack_batch_v087.js`: Stoke, Swipe, and Murkrow Call for Family.

Gigavolt and Mountain Smasher are ALREADY handled by `neo_attack_batch_v040.js`. The v087 module intentionally does not override them; regressions exercise the retained handlers.

## Integration and rules

- `attack_effects_core.js` registers the new programs with printed text/damage signatures, rejecting changed text and unknown effects.
- `headless_duel.js` now supports scoped reactive minimum-damage shielding, opponent Energy and Basic Energy type context, a defender Sleep/Confusion-only cure, two-sided Benched Pokémon healing, and opponent-owned attached Trainer discard.
- `classic_power_core.js` and `classic_trainer_core.js` include `basep` in their authoritative catalog lookups. Before this fix, promo attacks could compile but actual duels crashed on “Unknown Classic card”.
- Deterministic tests `test_neo_batch_v085.js`, `test_promo_batch_v086.js` and `test_neo_batch_v087.js` are in `npm test`. Each includes strict-signature checks, pure effect branches, and full reducer scenarios involving real defender choices, Energy attachments, triggered statuses, Tools or deck changes.
- Regression fixtures account for original end-of-turn timing: Poison checkups, Sleep wake flips, and Darkness Energy recoil on non-Dark hosts.
- The exported `CATALOG` already contained the Black Star Promos, but local card selection remains a **curated** whitelist; this milestone does **not** claim every promo printing can be selected in the standard deck builder.

## Still remaining

**97 printed attack records** lack portable programs, predominantly interactive Neo Revelation/Destiny and promotional attacks. In particular, do not silently approximate:
- Multi-player/opponent-controlled hand, discard, Energy or evolution decisions.
- Attack-copy chaining and printed cost/payment quirks.
- Multi-Pokémon, multi-coin spreading with correct ownership and Bench protections.
- Reactive Trainers, Stadium/Tool edge timing, and Power suppression.

Separately, the eight conservative partial historical Trainer records and the 166 Power printings need deep interaction verification. `release:strict` is not a 100%-fidelity pass. Full two-browser multiplayer/Render gameplay is not certified by the server-side smoke suite.

## Useful commands

```bash
npm run test:neo:v085
npm run test:promo:v086
npm run test:neo:v087
npm run audit:headless
npm test
npm run release:strict
```

Run and verify the current GitHub Action after each change. The reference 1,382 / 1,479 count is from the all-card compiler smoke matrix, **not** a claim that all focused tests or every historical matchup passed.
