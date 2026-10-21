# RPG NPC balance — archetype-specific tuning after themed boosters

## Intent

Bring three conspicuously uneven opponents closer to a fair 90-day progression without globally increasing/decreasing NPC AI difficulty or modifying authentic Pokémon card text. The real duel engine is the evaluation authority. Changes apply only to generated **RPG Act II and III** decks: shared retail/Classic presets, Cube, multiplayer and user-edited partner decks are untouched.

The pre-tuning recipe is preserved as `NPC.baselineUpgrade()`; normal RPG duels call `NPC.upgrade()`. All deck substitutions are one-for-one and checked against real card IDs and the four-copy rule (except Basic Energy), preserving 60 cards and legal evolution families.

## Verified first paired benchmark

The reproducible experiment in `scripts/benchmark-rpg-npc-candidates.js` used genuine Classic reducer duels with identical level-3 CPU policy on both sides, original themed-pack acquisition rules, two starters (Ember Garden, Tidal Circuit), three purchasing strategies (mixed, Evolution Workshop, Trainer's Toolkit), two collection seeds and both seat orders at each of Days 45, 60 and 80.

**864 real-engine matches**, zero duel errors. GitHub Actions [passing run 39610994760](https://github.com/NicolasSorrenti/poketest/actions/runs/39610994760). Every entry below is NPC wins out of 24 games. Draws and turn-limit outcomes are **not** counted as wins. The sample is exploratory; differences of 1–2 wins are not necessarily statistically meaningful.

| Opponent | Recipe | Day 45 | Day 60 | Day 80 |
| --- | --- | ---: | ---: | ---: |
| Reina | Original tier | 20 | 19 | 22 |
| Reina | Remove one Hitmonchan and soften denial | 20 | 19 | 22 |
| Reina | Remove Super Energy Removal, replace one Energy Removal | 20 | 19 | 20 |
| Yuna | Original tier | 12 | 15 | 8 |
| **Yuna** | **2 Pikachu become 2 Electabuzz — selected** | **14** | **15** | **11** |
| Yuna | 3 Electabuzz variant | 18 | 15 | 12 |
| Camila | Original tier | 10 | 11 | 15 |
| **Camila** | **Dark Muk + Dark Weezing hybrid — selected** | **11** | **14** | **15** |
| Camila | Rush Dark Weezing | 11 | 13 | 14 |

### Live deck changes

**Yuna, Acts II/III:** Substitute two Pikachu with two **Electabuzz**. This retains her Mewtwo/Psychic emphasis, all Lightning/Psychic Energy, all Trainers, and original printed card behavior. The tested three-Electabuzz variant was more extreme at Day 45 and is **not** adopted.

**Camila, Acts II/III:** Substitute one Dark Gyarados for **Dark Muk**, another for **Dark Weezing**, and two Water Energy for Grass Energy. There are still compatible Magikarp, Grimer and Koffing Basics, and the full Oddish → Dark Gloom → Dark Vileplume chain. No stronger new card printing is invented; no Trainer-lock rule is changed.

**Reina, Acts II/III — provisional:** Substitute one extra Hitmonchan for an Onix, two Energy Removal for Switch and Potion, and Super Energy Removal for Defender. This reduces stacked early fighting pressure and repeated Energy denial without deleting her signature Fighting identity or core search/tempo Trainers. In Act III she still has two Hitmonchan, two Energy Removal, two Gust of Wind, Computer Search and Item Finder. The initial softer variants did **not** significantly affect her matchup win rate, so a stronger recipe was selected for a further matched trial. The follow-up mirrored matches completed: the fair-rival recipe won **21/24** at Day 45 (baseline 20/24), **18/24** at Day 60 (baseline 19/24), and **20/24** at Day 80 (baseline 22/24). This is a modest reduction in late-game pressure, **not evidence of statistical balance**. [Passing matched workflow](https://github.com/NicolasSorrenti/poketest/actions/runs/39614908880).

## Reproduction

```sh
node --test tests/rpg_npc_candidate_balance.test.js tests/rpg_npc_deck_progression.test.js
npm run balance:npc-tuning -- --days 45,60,80 --npcs reina,yuna,camila --styles mixed,evolution,toolkit --starters ember_garden,tidal_circuit --seeds 2
```

`.github/workflows/rpg-npc-tuning.yml` runs the character candidate comparison and uploads complete JSON data. The existing NPC regression and match benchmark workflow also validates real generated player decks, original source deck preservation and historical rules.

### Limits and next verification

- Equal level-3 CPU agents are **not** a proxy for human match outcomes or actual character-specific CPU personalities.
- Two–three random seeds and 24–36 games per candidate/checkpoint have considerable uncertainty. Do not balance against individual one-game swings.
- The more conservative Yuna and Camila recipes have initial matched head-to-head evidence. Reina's fair-rival variant completed its mirrored games, but 24 games per checkpoint are not enough to claim the remaining advantage has been eliminated.
- Real campaign progress can accelerate a character's tier after story milestones. The benchmark intentionally uses only calendar tiers.
- No economy settings, booster rates, social rewards, or original attacks/Pokémon Powers change in this milestone.
