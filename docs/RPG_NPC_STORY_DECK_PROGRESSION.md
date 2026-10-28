# RPG opponent progression — Character story milestones

## Gameplay contract

Each of the 23 RPG opponents has an independently authored, deterministic historical 60-card starting recipe in `rpg_npc_deck_progression.js`. Six private recipe upgrades strengthen the same strategy as the campaign advances. Retail theme decks remain unchanged and are not used as recipe templates. The latest completed personal story can accelerate an opponent without moving the entire roster forward.

| Tier | Calendar baseline | Earlier character-specific milestone | Minimum day |
|---|---|---|---|
| I — starting | Days 1–15 | No story requirement | Day 1 |
| II — setup | From Day 16 | Completed first `<npc>_route_1`, `<npc>_guest_1` or `<npc>_bond_1` | Day 16 |
| III — evolution | From Day 31 | Completed third `<npc>_route_3`, `<npc>_guest_3` or `<npc>_bond_3` | Day 31 |
| IV — energy | From Day 46 | No story requirement | Day 46 |
| V — disruption/recovery | From Day 61 | No story requirement | Day 61 |
| VI — ace | From Day 76 | No story requirement | Day 76 |
| VII — finisher | From Day 91 | No story requirement | Day 91 |

For Reina, the optional `reina_rival_1` and `reina_rival_2` records in `arcFlags` can independently qualify for setup and evolution tiers, respectively, subject to the same minimum days. Story milestones accelerate only through tier III; calendar days unlock all seven tiers.

Any completed dialogue choice qualifies, including friendship; no romance, gifts, or affection farming is required. Completing another character's milestones has **no impact** on this NPC's deck. The day-based tiers remain an unconditional fallback, so players who ignore every story can still reach appropriately leveled opponents.

## Technical integration

`tierForOpponent(state,npc)` checks existing `storyDone` and `arcFlags` completion records, with `tierForDay(day)` remaining the floor. `recipeFor` builds from private per-character card ID arrays and returns a fresh array for the requested tier. No save migration or new persistent counter is needed.

The RPG browser loads the same progression module used by the authoritative Classic local service. When a duel begins, the selected tier is stored in `pendingDuel.npcDeckTier` and forwarded through `npcTier`; reloading while a duel is pending cannot change its opponent recipe. A custom character partner deck always has priority over the generated upgrade, as before.

The pre-duel presentation now distinguishes *REFINED DECK* and *EXPERT DECK*. For early, story-triggered upgrades it also displays *PERSONAL MILESTONE*, without spoiling which scene was completed.

No change to original Pokémon card rules, player deck, non-RPG Classic or Cube modes, CPU strategic skill, booster rarity, or credit payouts.

## Tests

`tests/rpg_npc_deck_progression.test.js` validates unique authored starting recipes, all seven legal tiers, deterministic output, strategy progression, unchanged retail recipes, story milestones, and service integration. `tests/rpg_npc_deck_balance.test.js` and `tests/rpg_npc_candidate_balance.test.js` cover benchmark inputs and recipes. `tests/rpg_world_ui.test.js` exercises the RPG's actual challenge setup and verifies the stored opponent tier.
