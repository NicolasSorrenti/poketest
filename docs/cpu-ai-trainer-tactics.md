# CPU Trainer decision audit — Base Set and Neo Genesis

This report tracks `trainerTactics`, a strictly opt-in Expert/Champion
evaluation feature on draft PR #12. The previously established
`actionDiscipline` (resource conservation) remains enabled by default at
Champion. These are independent flags.

## Implemented tactics

- **Pokémon Center:** compares actual healing to all attached Energy discarded
  from each damaged friendly Pokémon, and the currently affordable attacks
  lost as a result. Low-value damage removal should not destroy a powered
  attacker.
- **Super Potion:** calculates the best possible choice of which attached
  Energy to pay, including Energy type, attack affordability and the lost
  Energy card; the staged effect chooser protects useful Fighting Energy.
- **Potion:** defers routine healing unless it can prevent a currently visible
  opposing attack from taking a Prize.
- **Switch:** discourages switching to a weaker, unready attacker unless
  clearing a harmful condition creates a tactical advantage.
- **Professor Oak:** delays hand replacement until currently playable own
  Energy attachments and evolutions have been used.
- **Moo-Moo Milk:** considers the expected healing from two fair coin flips.
  Chooses damaged **own** Pokémon as the healing recipient, not a mistakenly
  inferred opposing Pokémon. No future flip is inspected.
- **Professor Elm:** accounts for the printed ban on playing more Trainers
  that turn and delays it until useful attachments/evolutions/Trainers have
  been used; values a small hand when enough cards remain in deck.
- **Bill's Teleporter:** considers the fair 50% chance to draw four cards and
  avoids wasting it with a nearly empty deck.
- Every proposed action is still submitted to the unchanged authoritative
  rules reducer. Pending Trainer identities/target indices are visible only
  when the plan belongs to the acting CPU; the opponent hand and deck remain
  concealed.

## Paired A/B results

At the previous, initial Trainer cost calculation commit, **200 matched
Blackout/Brushfire/Overgrowth games** gave 104 experimental wins, 96 old
Champion wins (52.0%). No draws.

The revised own-Energy payment evaluation plus the Neo Trainer heuristic was
then tested using **600 matched games** across four Base theme decks plus two
Neo Genesis theme decks, with multiple independent seed sets.

| Equal deck and seed cohort | Trainer-tactics wins | Control wins | Draws |
| --- | ---: | ---: | ---: |
| Blackout 141991 | 41 | 39 | 0 |
| Brushfire 241991 | 29 | 31 | 0 |
| Overgrowth 341991 | 33 | 27 | 0 |
| Zap 441991 | 38 | 35 | 7 |
| Blackout 541991 | 40 | 40 | 0 |
| Brushfire 641991 | 39 | 41 | 0 |
| Cold Fusion 741991 (Neo Genesis) | 45 | 35 | 0 |
| Hotfoot 841991 (Neo Genesis) | 50 | 30 | 0 |
| **Total** | **315** | **278** | **7** |

The experimental CPU won **315/593 = 53.12%** of decisive matches; Wilson 95%
confidence interval approximately **49.1%–57.1%**, which includes 50%.
The improvement is **not proven** across all archetypes. In the 160 Neo
Genesis games alone it won **95–65 (59.4%)**, suggestive but still
archetype-dependent. More seed/deck diversity and additional tests are needed.

This benchmark work also repaired a coverage hole:
`benchmark_cpu.js` had always passed format `classic` to `createGame`,
incorrectly rejecting authentic Neo decks. It now selects appropriate
`neo-theme`, `gym-theme` or `theme-expanded` formats based on the
deck's actual historical card IDs; a new Cold Fusion regression ensures
this remains supported. None of these changes alters duel rules.

## Status and next work

`trainerTactics` remains **OFF by default**, because the overall 600-game
difference is not statistically persuasive. The staged Moo-Moo Milk target
fix was added *after* the initial 600-game run and has focused unit coverage;
the latest CI benchmark is re-running it.

Reproduction example:

```sh
node benchmark_cpu.js --pairs 40 --max-turns 120 --seed 741991 \
  --left-level 5 --right-level 5 \
  --left-trainer-tactics true --right-trainer-tactics false \
  --left-deck cold_fusion --right-deck cold_fusion
```

Next priorities are deeper Trainer chains and better choice scoring for Gym
and Neo effects, plus independent Champion/Expert matchups. The requested 5%
lower-tier upset target is still **unmet**, and will never be manufactured by
changing RNG, legitimate game rules, or conceding games.
