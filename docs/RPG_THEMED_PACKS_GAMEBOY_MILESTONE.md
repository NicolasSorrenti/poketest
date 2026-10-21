# Neo Campus — Game Boy-inspired thematic booster milestone

## Why this design

The Game Boy Color Pokémon Trading Card Game used **Colosseum, Evolution, Mystery, and Laboratory** card pools instead of the physical Base/Jungle/Fossil booster product names. The packs overlap across historical printed sets; which cards you want matters more than which expansion is newest. Sources: [StrategyWiki's booster guide](https://strategywiki.org/wiki/Pok%C3%A9mon_Trading_Card_Game/Booster_packs), [Nintendo Player's Guide](https://pokemonflashfire.com/nintendo-power.pdf), and the [pret/poketcg booster constants and engine](https://github.com/pret/poketcg).

Neo Campus takes inspiration from this structure, not the exact Game Boy cards or official pack probabilities. It keeps its own Base Set through Neo Destiny catalogue and printed card rules.

## Shop offers

| Theme | Day | Price | Primary gameplay identity | Expansions which may join the pool when unlocked |
| --- | ---: | ---: | --- | --- |
| Colosseum Circuit | 1 | 20 | Cheap reliable Basic attackers | Base, Jungle, Fossil, Base 2, Neo Genesis/Discovery |
| Evolution Workshop | 1 | 22 | Stage 1/Stage 2 and matching Basics | All 11 printed expansions |
| Trainer's Toolkit | 1 | 24 | Guaranteed Trainer-heavy support | All 11 printed expansions |
| Wild Expedition | 8 | 25 | Jungle/Fossil and related discoveries | Base, Jungle, Fossil, Neo Discovery |
| Rocket's Shadows | 22 | 30 | Dark evolutions and Rocket support | Team Rocket, Neo Destiny |
| Gym Champions | 33 | 35 | Leader-specific Pokémon and Gym support | Gym Heroes, Gym Challenge |
| Johto Frontiers | 48 | 40 | Neo-era evolutions and Pokémon | Neo Genesis, Discovery, Revelation, Destiny |
| Mystery Vault | 68 | 48 | Rare late-era cards and secrets | Neo Revelation, Neo Destiny, Team Rocket |

Named days are normal unlocks. Eligible narrative, affection or tournament progress can still unlock the relevant printings earlier, according to the pre-existing `shopPacks` rules. The late Mystery Vault is **not** opened simply by Team Rocket availability; it requires its day gate or access to Neo Revelation/Destiny.

**Old packs remain in the shop forever.** Early packs still contain their core Basics/evolutions/Trainers, and can incorporate later printings once a relevant expansion is legitimately unlocked. No pack can emit a card from a locked expansion. Unique completion and wishlist advice are calculated for the currently eligible printings, not every historical printing that could ever appear.

## Opening packs

- Choosing a new starter grants **two free five-card welcome choices**, at The Lucky Draw, from the three Day 1 themes. They are independent selections and do not advance time or reduce credits.
- After those choices, each shop booster has **10 cards** and costs the theme's listed credits. Packs are not removed from sale after you advance the story. The original starting 80 credits are unchanged.
- Five-card packs: **1 Rare/Holo/Secret, 1 Uncommon, 2 Common, 1 Basic Energy**.
- Ten-card packs: **1 Rare/Holo/Secret, 3 Uncommon, 5 Common, 1 Basic Energy**.
- Game-tuned rare-slot odds carry forward from the previous milestone: **25% Holo**, **1% Secret/Shining** when such cards are available in the theme's current unlocked pools; remaining outcomes use non-holo Rares. These are NOT authentic factory booster odds.
- Evolution Workshop selects a Stage 1 and a matching Basic from the same currently accessible printings when possible; its Rare slot may align to that evolutionary line. Trainer's Toolkit features Trainer picks from both Common and Uncommon slots, but never changes the original rarity of the card.
- Normal NPC mini rewards and story/championship rewards now select a theme suited to the character, falling back to Colosseum Circuit if a later archetype has not unlocked. The **existing 2 ordinary mini packs/week** cap, duplicate receipt guards, and chapter/cup exceptions remain.
- Existing **source-set vouchers** from relationship milestones, tournaments and old saves remain redeemable in a separate gift section at the shop, producing the original ten-card source-set booster. This honors previously earned rewards rather than replacing their meaning.

## Save and economy migration

- New collection saves start with `deckJourney.welcomePacks=2`. The counter goes down only after a successful chosen welcome pack is added to the collection.
- Existing saves without this property hydrate it to **0**, so patching the game cannot repeatedly grant 10 additional free cards to old campaigns.
- Opened and queued packs preserve their existing `cards` exactly. The new optional `theme` tag only controls presentation; unknown/old receipts remain readable using their original `set`.
- No deck, relationship, CPU, credits, card catalogue or TCG reducer migration is required. Old vouchers stay keyed by source expansion.
- `npm run balance:rpg` now uses the real thematic shop and counts Day 1 welcome gifts. `scripts/benchmark-rpg-npc-decks.js` now simulates themed purchases for growing player decks instead of assuming a single newest-expansion pack.

## Testing and limitations

`tests/rpg_themed_packs.test.js` validates Day 1 availability, the two free picks and paid transition, source locks, thematic role guarantees, rarity slots, unique card IDs, evergreen pools, NPC rewards, old saves and vouchers. `tests/rpg_collection.test.js` and `tests/rpg_strategy.test.js` retain compatibility tests.

The shop intentionally does **not** guarantee individual Rare cards, a complete Stage 2 evolution in a single pack, or higher drop chances just because the player owns fewer copies. The collection remains governed by original card printings and independent RNG. The extra 10 initial cards change the early economy slightly; the simulator records this rather than silently treating the new packs as identical to the previous all-expansion shop.
