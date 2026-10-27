# Neo Campus — Daily special outfit probabilities

Applies to Hana (8 special PNGs), Akari (5) and Barb (10). The current special-outfit pool is `SPECIAL_LOOKS` in `rpg.js`.

**Per-character roll:** The game rolls a special appearance once for each character on each in-game day, at **10% on the first day**, plus **5 percentage points per day without seeing a special outfit** (capped at 100%). The counter continues increasing even when a special outfit was rolled but the player never encountered the character. If the character is seen wearing a special outfit, the next day returns to 10%.

The daily result and selected PNG are saved in `state.specialLookDays`, so they don't change between morning, afternoon, evening, navigation, dialogue, or a resumed save. On a day without a special roll, the ordinary character portraits remain in use.

When the player actually encounters the character in an ordinary location, the appearance is marked seen. The special PNG takes priority over regular expression portraits in ordinary RPG views and duel-facing avatars; battle-exclusive cut-ins, battle reaction illustrations and CGs use their dedicated assets.

Outfit-change chimes remain separate: they are image-only close-ups using the existing outfit PNGs and focus data in `rpg-assets/outfit-chime-focus.json`. They do not alter the daily probability.

### Example, provided no special outfit was seen

| Day | Chance |
|---|---:|
| 1 | 10% |
| 2 | 15% |
| 3 | 20% |
| 4 | 25% |
| 10 | 55% |
| 19+ | 100% |

### Test coverage

`tests/rpg_hana_overworld_variants.test.js` checks daily locking, initial chance, incremental pity, an unseen roll, and reset on observation. `tests/rpg_hana_outfit_chime.test.js` checks the shared runtime wiring.
