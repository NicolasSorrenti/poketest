# Neo Campus v0.46 — Neo Genesis / Neo Discovery Expansion

A batch focused on **fully playable Pokémon printings** rather than name-only attack recognition. Both CPU and hosted online modes use the same authoritative reducer.

## New executable attack implementations (8 printed attack entries)

| Set / printing | Attack | Rule |
|---|---|---|
| Neo Genesis Skarmory 13 | Steel Wing | Coin flip; on heads reduce incoming attack damage by 20 next opposing turn |
| Neo Genesis Cleffa 20 | Eeeeeeek | Shuffle hand into deck, draw 7; conserve all cards |
| Neo Genesis Chikorita 53 | Deflector | Halve damage received on opponent's next turn, rounded down to tens |
| Neo Genesis Snubbull 74 | Roar | Coin flip; on heads the opposing player chooses a Bench replacement |
| Neo Discovery Corsola 37 | Recover | Pay one chosen Energy using authoritative selection, heal all damage |
| Neo Discovery Corsola 37 | Spike Cannon | Two flips; 30 damage per heads |
| Neo Discovery Houndour 39 | Plunder | Discard all opponent-attached Trainers **before** damage |
| Neo Discovery Weedle 70 | Spike Stab | On heads: 20 and Poison; on tails: no damage/effect |

Compiler programs match exact historical imported attack signatures; fabricated/unported text does not fall back to ordinary damage.

## Twelve added custom-deck printings

- Neo Genesis: Skarmory (13), Steelix (15), Cleffa (20), Granbull (37), Chikorita (53), Girafarig (58), Onix (69), Snubbull (74), Wooper (82).
- Neo Discovery: Corsola (37), Houndour (39), Weedle (70).

Some attacks on these printings were already implemented; the whole printings are now reviewed and enabled. The Steelix → Onix and Granbull → Snubbull dependencies are available together.

**Not enabled yet:** Ampharos (Neo Genesis 1), because Flaaffy still has missing attack effects. This is intentional—full evolution-line access is more useful than an unattainable Stage 2.

## Important shared Special Energy fixes

- Metal Energy reduces damage done to its host by 10 after Weakness/Resistance. On a non-Metal attacker, it reduces the printed attack's damage by 10 before Weakness/Resistance.
- Darkness Energy boosts Active damage by 10 when an attack damages the defender and causes 10 end-of-turn damage per card on non-Dark Pokémon, including on the Bench.
- Existing attack payment and Special Energy safeguards continue to reject effects not yet supported. Some rare Bench-damage/redirected-effect combinations remain to be historically validated.

## Tests and remaining coverage

- `npm test` passed, including v0.40 and new `test_neo_batch_v046.js`.
- `npm run test:neo:v046` covers the attack effects, 12 whitelist entries, seeded heads/tails, damage shields, player-controlled payment, hidden-state-independent hand shuffle, Poison, Special Energy, and card conservation.
- Legacy deck pool expectations have been updated from 824 to 836 entries.
- The latest prior per-set Neo audit had 178 missing attack effects across all four Neo expansions; this batch addresses eight of those signatures. **Neo is not fully implemented**, and the count does not include unported Powers/Trainers.
- No changes to online/CPU layout, chat, spectators, prizes, or Gym Trainer behavior.

## Deploying

Push to `main` (or use this commit). Render redeploys automatically when enabled. Restarting Render clears in-memory matches.
