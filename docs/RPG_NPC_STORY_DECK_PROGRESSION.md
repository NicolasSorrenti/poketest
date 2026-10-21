# RPG opponent progression — Character story milestones

## Gameplay contract

Each RPG opponent continues to use their **own** original themed 60-card recipe, upgraded by the existing `rpg_npc_deck_progression.js` rules. The latest completed personal story can accelerate an opponent's recipe without moving the entire roster forward.

| Tier | Calendar baseline | Earlier character-specific milestone | Minimum day |
|---|---|---|---|
| I — original | Days 1–30 | No story requirement | Day 1 |
| II — refined | From Day 31 | Completed first `<npc>_route_1`, `<npc>_guest_1` or `<npc>_bond_1` | Day 18 |
| III — expert | From Day 61 | Completed third `<npc>_route_3`, `<npc>_guest_3` or `<npc>_bond_3` | Day 45 |

For Reina, the optional `reina_rival_1` and `reina_rival_2` records in `arcFlags` can independently qualify for refined and expert recipes, respectively, subject to the same minimum days.

Any completed dialogue choice qualifies, including friendship; no romance, gifts, or affection farming is required. Completing another character's milestones has **no impact** on this NPC's deck. The day-based tiers remain an unconditional fallback, so players who ignore every story can still reach appropriately leveled opponents.

## Technical integration

`tierForOpponent(state,npc)` checks existing `storyDone` and `arcFlags` completion records, with `tierForDay(day)` remaining the floor. No save migration or new persistent counter is needed.

The RPG browser loads the same progression module used by the authoritative Classic local service. When a duel begins, the selected tier is stored in `pendingDuel.npcDeckTier` and forwarded through `npcTier`; reloading while a duel is pending cannot change its opponent recipe. A custom character partner deck always has priority over the generated upgrade, as before.

The pre-duel presentation now distinguishes *REFINED DECK* and *EXPERT DECK*. For early, story-triggered upgrades it also displays *PERSONAL MILESTONE*, without spoiling which scene was completed.

No change to original Pokémon card rules, player deck, non-RPG Classic or Cube modes, CPU strategic skill, booster rarity, or credit payouts.

## Tests

`tests/rpg_npc_deck_progression.test.js` validates early story and rivalry milestones, minimum-day limits, roster independence, default progression, legal recipes and browser registration. `tests/rpg_world_ui.test.js` exercises the RPG's actual challenge setup and verifies the stored opponent tier.
