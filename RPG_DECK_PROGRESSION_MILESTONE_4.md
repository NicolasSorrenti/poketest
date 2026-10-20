# Neo Campus RPG — Milestone 4: Deck Progression 2.0

## Playable features

The existing, shared Cube-style **Deck Studio** now includes an expandable **Strategy Lab**. Open it from the player's Deck Studio, or press **Scout** on a currently selected, familiar NPC in the RPG.

### 1. Deck profile

Shows the current (possibly unsaved) 60-card draft's Pokémon, Trainer and Energy counts, main Pokémon types, and Basic Pokémon count. Uses the printed card catalogue and the existing campaign deck.

### 2. Owned-card upgrade experiments

Lists up to five deterministic **one-for-one swaps** using cards already in the player's collection. Strong suggestions include Pokémon evolutions with an existing lower-stage card and attackers from existing deck types. The algorithm excludes absent prerequisite evolution chains and protects single remaining evolution prerequisites.

A **Stage swap** action only edits the existing draft through `NeoRpgCollection.change`. The authoritative campaign collection validator checks card ownership, maximum copies, exactly 60 cards, and at least one Basic Pokémon. The active saved deck is **not** overwritten by a suggestion; the player must use the unchanged **Save 60-card deck** action.

This is **heuristic advice, not a claim of optimized win rate or perfect archetype knowledge**. Player choices are primary.

### 3. Missing-card wishlist

Search the existing Base Set through Neo Destiny card catalogues and track up to **eight** individual cards. This is a planning list, not an alternate inventory or purchasable singles shop.

- Goals persist in optional `state.deckStrategy.wishlist` without changing existing save IDs or card collection data.
- Search includes future historical expansions. It does not bypass expansion unlock dates.
- Owned goals remain visible as acquired so players can see progress.
- Suggested missing Pokémon evolutions are offered only when the predecessor appears in the deck, rather than encouraging an unusable Pokémon line.
- Basic Energy is excluded from goals to keep the list focused.

### 4. Booster planning

Uses the existing `NeoRpgCollection.shopPacks` information. Shows which expansions **contain** missing wishlist cards, their established prices and unlock conditions, and how many distinct wishlist cards are currently missing from each expansion.

The card shop also shows the number of missing tracked cards associated with each booster set. **Packs remain random; no single card is guaranteed.** No new currencies, drop multipliers, free booster rewards, or rare card guarantees have been introduced.

### 5. Opponent scouting

A **Scout** action on a familiar NPC opens the Strategy Lab preselected for that character. The studio can also select NPCs already met or challenged in the current campaign. Character-pack guests are loaded through existing cast registries.

Scouting requests an NPC's existing **published theme-deck list** from the server's `/api/classic/decklist` endpoint; it does not simulate or inspect a current private battle state. Shows printed Pokémon/Trainer/Energy distribution, common Pokémon types, and printed weaknesses that overlap with types in the player's deck.

Actual live duels can use modified collaborative decks and evolve differently. A scout report is **not** the opponent's hand, live strategy, a guarantee of future cards, or a simulated battle prediction.

## User experience and architecture

The Strategy Lab lives in the existing `rpg_deck_studio.html` and is expandable, preserving the large Cube-style deck builder as the main focus.

The pure `rpg_strategy.js` module supplies read-only profile, suggestion, pack planning, and scouting functions; only the explicit wishlist toggle mutates strategy metadata. Deck edits still go through `NeoRpgCollection.change` and `NeoRpgCollection.save`, and duels retain locked snapshots.

No changes have been made to Pokémon attack rules, AI heuristics, NPC story arcs, mandatory events or the user's save version. The studio refuses access during a pending duel.

## Verification

- `tests/rpg_strategy.test.js`: nine regression tests for safe wishlist migration, limits, random-booster honesty, deck profiling, legal swaps, evolution support, and scouting.
- `tests/rpg_strategy_ui.test.js`: five integration tests for actual studio initialization, search and saved goals, staging/discarding changes, rival scouting and a locked duel.
- Both run through `npm run test:rpg`.
- `tests/rpg_match_reactions_http.test.js` verifies the new public planning module is served by the same Node server.

## Future extensions

Consider better historical TCG archetype templates, optional target-card acquisition rewards that do not force repeated booster purchases, competitive opponent progression, and player-friendly guided deck edits. Those features need separate balancing and broader gameplay audits.
