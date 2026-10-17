# Neo Campus Classic v0.16 — Powers & Trainers Engine Milestone

Scope: **Base Set, Jungle, Fossil, Team Rocket** (311 card records). Later sets are kept in `cards/` but excluded from the Classic format.

## Shipped code

- `classic_trainer_core.js`: common transactional decision programs for all **39 distinct Trainer names**, covering **41 printed Classic Trainer records**. Stage selection is assigned to the correct player (including `Challenge!`); Trainer costs are paid when the complete validated decision chain resolves. The reducer rejects invalid/stale choices without changing committed state.
- `classic_power_core.js`: activated and passive Pokémon Power hooks, plus on-evolution effects, covering **52 printed Power records** (36 unique Power names). Includes Ditto Transform's active copy behavior, Buzzap, Rain Dance, Energy Trans, retreat modifiers, status immunities, Vileplume/Muk suppression, Prize-revealing rules, and more.
- `headless_duel.js`: integrates Classic Trainers, Powers, conditional stat behavior, retroactive attack damage modification, defender/attacker passives, dynamic retreat costs, Prize responses, and reactive Knock Out behavior. The previous unrestricted/legacy test path remains intact.
- `duel_protocol.js`: projects permitted prize and opponent-hand information for *Here Comes Team Rocket!* and *Clairvoyance* while keeping ordinary opponent cards secret; Peek results stay private to the owner.

## Verified by automated tests

- **427/427** Classic attack records compile into headless attack programs. **425/427** complete the prepared execution probe; the two Mirror Move cases lack a preceding opponent attack by design.
- **41/41** printed Trainer records: end-to-end choices and card conservation in prepared states, encompassing 39 unique names.
- **52/52** printed Power records have headless handler classifications: 22 activated records exercised through full decisions, 6 evolution-triggered records through actual evolutions, and 24 passive records registered and tested in selected cross-effect scenarios.
- Targeted tests cover card costs, Choice ownership, multiple selections, choice rollback, Ditto's copied attacks, PlusPower/Defender, Machamp retaliation, Dark Vileplume suppression, Rain Dance, Buzzap Prize ownership, Dark Gyarados reaction, Sticky Goo retreat costs, Clairvoyance and prize visibility.
- **30 additional mixed-match simulations**: 4,082 accepted commands, 520 Trainer plays, 18 Power activations, 835 attacks, 720 choice responses; card conservation checked after each accepted action. Note: simulations that hit the turn cap were ended with concession and are not counted as naturally resolved victories.
- Complete existing Node.js test suite continues to pass. Existing test suite includes 220 older completed seeded headless duels.

## The distinction between execution coverage and 100% fidelity

The 41 Trainer and 52 Power record counts above mean **migrated and exercised in the headless reducer**, not that every possible historical card interaction has been proven correct. Some complicated timings and nested effects (for example, every Transparency prevention case, nested transformed/copied attack decisions, simultaneous reactive Power stacks and unusual Trainer combinations) need rule-by-rule verification and opponent-choice integration.

The **browser duel currently still runs the legacy rules engine**. This new headless engine is usable through Node commands/tests but has not replaced the browser client's rule authority. No online multiplayer UI is included. The pre-existing Gym/Neo strict fidelity gate is also intentionally outside the four-set Classic scope.

## Commands

From `neo-campus-work` with Node.js >= 18:

```bash
npm start                     # legacy local browser UI at http://localhost:8000
npm test                      # entire project regression suite
npm run test:classic:support  # new Trainer & Power integration suite
npm run audit:classic:support # per-set attack/Trainer/Power headless handler inventory
npm run audit:classic:execute # execute 427 attack records in prepared states
```

## Next engineering priorities

1. Route browser commands through the authoritative Classic reducer (one source of truth).
2. Build exhaustive per-card historical rule assertions across Trainer/Power interactions and status/KO timing.
3. Add saveable replays and a full match fuzz test harness for expanded deck combinations.
4. Treat Gym/Neo additions and online invite-code play as later expansions.
