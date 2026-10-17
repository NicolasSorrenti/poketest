# Neo Campus TCG v0.24 — Gym rules compatibility milestone

**Starting build:** v0.23 Quick-Play UI. Both local/CPU play and invitation-code online mode are retained.

## Implemented in this milestone

- 59 additional Gym Heroes / Gym Challenge *printed attack records* have explicitly compiled headless programs (183 → 242 of 316). The 55 newly implemented substantive attack variants include healing, recoil, multiple coins, disabling attacks/Powers, damage to different Benched Pokémon, and multi-step search / Energy attachment / Bench-target decisions. Other signatures benefit from already-existing effect programs.
- Fourteen additional Gym Trainer card records now have handlers (32 → 46 of 66). New programs include Good Manners, Master Ball, Erika's Maids, Misty's Tears, The Rocket's Trap, Rocket's Secret Experiment, and other leader-specific effects. Gym Stadium hooks include Resistance Gym, Rocket's Training Gym, Rocket's Minefield Gym, No Removal Gym and Transparent Walls.
- Six additional Gym Pokémon Power records now have hooks (4 → 10 of 24): activated and passive effects such as Natural Healing, Gaseous Form, Healing Fire, Fortitude, Pollen Defense and Restless Sleep.
- Two already-recognized Trainers now reject impossible actions **before** prompting the human: Energy Retrieval with no eligible Energy in discard, and Sabrina with no legal two-Pokémon transfer.
- Rocket's Minefield Gym uses the official two-damage-counter erratum when its coin flip fails.
- Invalid Bench target submissions and cancelled/failed choices are verified to leave the game state unchanged.

## Tests

- `npm test`: the existing project suite plus v0.24 focused Gym tests and 32 Gym-deck CPU integration sessions.
- `npm run test:gym-migration`: focused attack, Trainer, Power, Stadium, and bounded 32-session mixed Gym tests.
- `npm run audit:gym-migration`: produces `GYM_COMPATIBILITY_REPORT_V024.json`, listing every Gym printing and its recognized effect coverage.

The Gym mixed sessions exercise 1,442 accepted server-authoritative commands, including 353 attacks and 220 resolved decisions. Both players preserve 60 cards, and the CPU's hand/Prizes remain private. They are **bounded test sessions**, not naturally finished duels.

## Honest current coverage

| Gym Heroes + Gym Challenge printed records | With handler | Still without handler |
|---|---:|---:|
| Attacks | 242 / 316 | 74 |
| Trainers | 46 / 66 | 20 |
| Pokémon Powers | 10 / 24 | 14 |

These numbers mean an effect is recognized and routed to a handler, **not** that all timing and historical interactions have been exhaustively verified. **101 Gym card printings still have at least one unhandled effect.** The deck builder continues flagging them; the complete 264-card Gym catalog remains available for experimental deckbuilding. In particular, **Chaos Gym, Sabrina's Psychic Control, Sabrina's ESP, and Brock's Protection are not completed in the new headless implementation.**

## Compatibility scope

This update does not turn on all Gym cards in the strict four-set Classic format; the expanded Gym format continues to control access. The legacy duel browser, local authoritative duel, and online invite-code mode remain included and were tested in the full regression suite. UI mouse interactions are not certified by the automated tests.
