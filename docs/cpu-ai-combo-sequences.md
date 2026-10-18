# CPU Trainer-combo planning

## Scope
Experimental `comboSearch`, OFF by default. Searches up to 96 own-state nodes per first action and three subsequent legal preparation actions. Supported chains: Energy Retrieval (one real hand-card payment, one or two Basic Energy returned from own discard), evolution, one Energy attachment, and available attacks. PlusPower can add 10 damage to an actual attack. The authoritative reducer executes all real commands; this planner does not read hidden opponent cards, predict future draws or coins, or modify rules. Trainer cost and recovery decisions use only the acting CPU's permitted options.

A fair, 60-card `cpu_combo_lab` benchmark-only Base Set recipe stresses Machop/Machoke, Retrieval and PlusPower without altering gameplay decks.

## Validation
Tests cover a complete Machop to Machoke Karate Chop line, real Trainer payment, recovery from public discard, Energy attachment limit, legitimate PlusPower KO thresholds, Chaos Gym uncertainty, and unchanged normal Energy/evolution priorities.

The first 180-game retail benchmark was poor (62 wins, 118 losses). Investigation found that non-improving normal Energy attachments and evolutions received an erroneous -50 penalty. This was corrected to zero, and a regression prevents recurrence.

After that fix, 260 seat-swapped Champion A/B games yielded:

| Equal deck | Combo on | Baseline | Draws |
|---|---:|---:|---:|
| Blackout | 29 | 31 | 0 |
| Brock | 30 | 30 | 0 |
| Cold Fusion | 29 | 31 | 0 |
| CPU Combo Lab | 42 | 38 | 0 |
| **Total** | **130** | **130** | **0** |

There is no established win-rate improvement. Keep the policy experimental. The 5% maximum lower-tier upset target remains unmet; historical RNG and match outcomes remain fair.

## Playtesting the feature in the actual game

`ClassicLocalService.create({deck:'blackout',opponent:'brock',difficulty:5,
experimentalCombos:true})` enables the projected combos for the CPU in a
normal local headless duel session. Levels 4 (Expert) and 5 (Champion) allow
this explicit option. Lower levels reject it rather than silently claiming an
unavailable strategy, and all ordinary local matches remain on the unchanged
default. The returned `cpu.experimentalCombos` metadata confirms whether
the experiment is enabled. Regression tests cover these session guarantees.
The experimental flag is independent of `advancedTactics` and can be tested
without enabling other unvalidated heuristics.

Run `node test_cpu_policy.js`, `node test_classic_live_service.js`, or `node benchmark_cpu.js --pairs 40 --max-turns 120 --seed 101183 --left-level 5 --right-level 5 --left-combo-search true --right-combo-search false --left-deck cpu_combo_lab --right-deck cpu_combo_lab`.


## Authenticated Trainer-choice and follow-through correction

The follow-up audit found a real **option-ID namespace mismatch**:
`Energy Retrieval` and `Super Energy Retrieval` recover public Basic
Energy using `disc:<index>` options. The old combo scorer incorrectly
assumed `n:<index>`, which denotes *hand-card payments*. It therefore
never valued actual recovery options. This implementation now treats:
- `n:<index>`: acting player's hand payment, preserving useful evolution
  and required Energy cards
- `disc:<index>`: a card in the public discard pile (validated against
  the printed option label), for recovery
- `deck:<index>`: an *authorized* deck-search option revealed by the rules
  engine; the CPU scores the name shown in the option, not the unrevealed
  shuffled deck card ID

In addition to Energy Retrieval, the scorer covers legal staged decisions
for Computer Search, Item Finder, Pokémon Trader and Super Energy Retrieval.
A hand payment may never be mistaken for a discard or a deck search.
Tests exercise the actual Classic reducer through:
- Energy Retrieval: pay an expendable card, choose a `disc:` Basic Energy,
  recover it into the hand, and terminate the mandatory prompts.
- Computer Search: pay two spare Potions, preserve Fighting Energy, select
  Machoke from lawful `deck:` options, and actually evolve Machop, attach
  Fighting Energy to the Active, and perform its attack.

The latter test exposed a second defect: **when the search Trainer left the
hand, the CPU stopped considering the planned evolution/Energy combination**.
It attached the Energy to a Benched Pokémon instead, evolved the Active into
an Energy-starved Machoke, and ended its turn. The bounded planner now carries
an *immediate, visible evolution + Energy* line after the search resolves.
This makes the full play sequence executable without persisting secret state
or predicting a future draw. It still skips speculative combos in ordinary
positions and whenever Chaos Gym can redirect Trainer ownership.

A second benchmark-only, authentically legal 60-card
`cpu_search_lab` deck focuses on Computer Search, Item Finder, Pokémon
Trader, Energy Retrieval and compatible Machop/Machoke lines. The corrected
experiment ran 340 mirrored, seat-swapped matches:

| Identical deck | Combo wins | Control wins | Draws |
|---|---:|---:|---:|
| Blackout | 29 | 31 | 0 |
| Brock Gym Heroes | 31 | 29 | 0 |
| Cold Fusion Neo Genesis | 32 | 28 | 0 |
| CPU Combo Lab | 42 | 38 | 0 |
| CPU Search Lab | 41 | 39 | 0 |
| **Total** | **175** | **165** | **0** |

`CPU Combo Experiment` run `39103825177` passed, including
`test_cpu_policy.js`, the 80-scenario local live-duel regression and all
340 arena games. There were **zero invalid committed actions**. This
**51.47%** overall win rate still does not demonstrate general strength.
Do not enable `comboSearch` by default; the previously validated Champion
`actionDiscipline` behavior remains on independently.

The code also retains the opt-in
`ClassicLocalService.create({difficulty:5,experimentalCombos:true})` for
manual Expert/Champion testing. The requested at-most-5% lower-tier upset
goal remains unmet.
