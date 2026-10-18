# CPU AI — Trainer search and payment choices

## Goal and architecture

This is an opt-in continuation of PR #12, targeting actual strategic
decisions that previously treated most search and discard choices as
interchangeable labels.

`trainerSelections:true` adds two linked improvements, only for
Expert/Champion:

- **Playing the Trainer:** a valuable Brock's Training Method or The Boss's
  Way should not lose automatically to the generic 82-point `end_turn`
  score. Search priority now depends on the player's visible Brock's Pokémon
  or potential Dark evolution line; Energy Search is encouraged when the
  player needs Energy but has none in hand. Other Trainer effects preserve
  existing base policy unless the search opportunity is relevant.
- **Resolving the choice:** the CPU considers the current field, own known
  hand and names printed in the *authorized* Trainer decision. Search for a
  matching evolution or colored Energy needed to pay attack costs; prefer
  discarding a surplus Basic over a useful evolution/Trainer card; use a
  separate score for selectable cards and for payment options.

All options are received through `publicView`'s pending decision and are
the same named cards the legal player may view while searching. The policy
never looks up opponents' unrevealed hands/decks or hypothetical reducer coin
outcomes. Only the authoritative reducer executes selected commands.

The tests cover:
- Search for Machoke with Machop in play over Rattata.
- Search for Fighting Energy to power Machop's printed Low Kick instead of
  Water that only powers an unrelated Benched Pokémon.
- Discard an expendable Basic rather than a playable Evolution.
- Play Brock's Training Method while Brock's Geodude is on the board; do not
  falsely reward the search with an unrelated Active.
- Play The Boss's Way for a Grimer line that can evolve into Dark Muk.
- Keep old Champion policy selectable with `trainerSelections:false`.
- Use real headless matches and historical Gym/Neo format legality.

## Measured A/B tournament results

The first three mirrors (Blackout, Brushfire, Cold Fusion) were exactly
**100–100**. The card decisions rarely matter in those decks.

Adding actual Trainer-search decks produced a 360-game experiment:

| Equal deck | Experimental wins | Control wins | Draws |
| --- | ---: | ---: | ---: |
| Blackout (seed 951931) | 40 | 40 | 0 |
| Brushfire (1051931) | 30 | 30 | 0 |
| Cold Fusion (1151931) | 30 | 30 | 0 |
| Brock Gym Heroes (1251931) | 43 | 37 | 0 |
| Trouble Team Rocket (1351931) | 43 | 37 | 0 |
| **Total** | **186** | **174** | **0** |

**51.7%** decisive win rate was small. A second set of independent
Brock/Trouble cohorts (seeds 1451931 and 1551931) each reproduced **43–37**
for the new CPU. The combined 520-game A/B result is:

| Comparison | New AI wins | Original wins | Draws |
| --- | ---: | ---: | ---: |
| Original five deck cohorts | 186 | 174 | 0 |
| Second Brock cohort | 43 | 37 | 0 |
| Second Trouble cohort | 43 | 37 | 0 |
| **Total, 520 games** | **272** | **248** | **0** |

The new policy wins **52.31%** of decisive matches (Wilson 95% interval about
**48.0%–56.6%**). It gives a repeatable small positive Gym/Rocket trend,
but the overall interval still includes 50% and the first three decks were
identical to baseline. **Not enough to promote to default.**

Validated in GitHub Actions CPU Sequence Experiment run `39088652333`:
all 520 matched games and the focused CPU tests passed, including historical
Gym, Rocket and Neo formats.

To reproduce an actual Gym search comparison:

```sh
node benchmark_cpu.js --pairs 40 --max-turns 120 --seed 1251931 \
  --left-level 5 --right-level 5 \
  --left-trainer-selections true --right-trainer-selections false \
  --left-deck brock --right-deck brock
```

Other policy flags (`actionDiscipline`, `trainerTactics`, `turnSearch`)
remain independent. `actionDiscipline` is the only previously promoted
Champion behavior; the user-requested ≤5% weaker-tier upset goal remains
unmet, and cannot be enforced by cheating, deck manipulation or biased
randomness.
