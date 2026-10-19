# Neo Campus TCG — RPG Deck Progression Milestone

## What players can do

Every **new** 90-day RPG campaign now asks the player to choose exactly one basic 60-card mixed-type starter, before the first NPC match:

| Starter | Types | Strengths | Intentional weakness |
|---|---|---|---|
| **Ember Garden** | Fire / Grass | Direct damage and incremental evolution | Slow evolution lines, no powerhouse rare Pokémon |
| **Tidal Circuit** | Water / Lightning | Flexible attackers and a few evolution payoffs | Many fragile basics and limited search |
| **Mind & Muscle** | Psychic / Fighting | Status/control and a sturdy Fighting fallback | Slower multi-energy attacks, modest Trainers |

All three are built from existing **Base Set IDs**, with **20 Pokémon / 16 Trainers / 24 basic Energy**. The Trainers are intentionally modest: Bill, Potion, Switch, Gust of Wind, Pokédex, Energy Retrieval, Maintenance and Defender. No fully optimized Haymaker/Rain Dance/Wigglytuff lists are handed out on Day 1.

A new player owns only the 60 cards of their starter. The shop sells **training packs for 20 earned credits**, which grant **five** starter-compatible cards from a curated pool. Victory in a real settled NPC or tournament duel grants **one new card**; a defeat/draw does not grant a card. The reward system prioritizes unowned cards for early victories, allowing deckbuilding variety. Buying and editing do not skip time; actual duels still cost one RPG period.

### Deck Workshop

The player's current 60-card deck is **editable in the RPG** by swapping one card for another they actually own. It validates exact deck size, card IDs and owned quantities, the non-basic-energy four-copy limit and at least one Basic Pokémon. It maintains an unsaved draft until **Save 60-card deck** is clicked; closing/discarding does not affect the combat-ready list. Battles snapshot the saved deck at challenge time, so a card edit cannot rewrite a live match.

**The player does not get access to the standalone unlimited deck builder during RPG progression.** The standard standalone Classic deck builder remains separate for sandbox testing and multiplayer experiments.

### Real battles

The RPG records **deckCards** as a 60-card snapshot on the existing unique pending-duel ID. At Start Duel/Skip (or reload of an already launched duel), it writes those IDs to the same-tab sessionStorage under `neoRpgDeck:<duelId>`. The Classic iframe starts in `custom` mode and reads this record rather than the standalone custom-deck key, then sends it to the already existing server-side `ClassicLocalService.create({deck:'custom',customDeck})`. The server continues applying its own card and deck validation. No additional combat rules or parallel card engine were introduced.

A completed battle clears the per-duel key, adds an earned card on an authenticated victory, and returns to the normal RPG. Save/reload preserves the collection, current deck, pack counter and card rewards. Loading older campaigns without a `deckJourney` field **preserves existing full-deck preset behavior**; there is an optional button to begin restricted RPG progression instead of breaking older saves.

New Game+ retains its gallery and season archive but starts a **fresh starter selection**, rather than incorrectly carrying the earlier run's fully upgraded deck across a new progression curve.

### Content and balancing boundaries

The three starters use only Base Set for compatibility with the existing engine, while the wider game can still use Base through Neo Destiny for NPCs. The first content expansion should offer staged card tiers from Jungle/Fossil/Rocket/Gym/Neo and genuine shop packs with rarity weights and themed rewards. The current packs are deterministic and repeatable, starter-biased, and do not use the official booster collation. Full booster-shop economy, selling/trading, multiple saved deck slots and a visual card-by-card drag-and-drop editor are future improvements.

**Do not claim a 100% historical TCG card implementation or entire 90-day campaign audit based on this milestone.** The authoritative engine owns that independently.

## Acceptance tests

`npm run test:rpg` now includes `tests/rpg_collection.test.js` for selection, 60-card composition, strict ownership, save/reload, upgrades, resources and New Game+. RPG controller coverage tests the actual starter modal, five-card shop pack, unsaved/saved card swap and a duel snapshot. Chromium smoke selects Tidal Circuit on its actual UI and runs a live CPU match using the `custom` list, validates saved pending deck identity, reloads the running duel and receives the server-authoritative result.

The implementation touches `rpg_collection.js`, `rpg.js`, `rpg.html`, `rpg.css`, `classic_live.js`, `rpg_epilogue.js`, `server.js` and tests. It does not change the Pokémon attack reducer, online match formats, Cube draft, NPC story scripts, or character art files.
