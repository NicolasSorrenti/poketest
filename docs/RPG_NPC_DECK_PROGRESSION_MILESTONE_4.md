# Neo Campus — RPG balance Milestone 4: progressive NPC deck recipes

## Goal

Make 90-day story opponents increasingly competitive through **real deck construction**, not HP multipliers, secretly improved draws or altered Pokémon TCG rules. The Classic/Cube/Single Match shared duel engine remains authoritative.

## When NPC decks change

| Campaign period | NPC deck tier | Behavior |
| --- | --- | --- |
| Days 1–30 | Act I — Original | Character's existing themed 60-card recipe, unchanged |
| Days 31–60 | Act II — Refined | Reinforce a compatible signature Pokémon when possible; add two strategy-specific Trainers |
| Days 61–90 | Act III — Expert | Reinforce the signature Pokémon again when legal; add two additional strategy-specific Trainers |

The original theme deck ID stays the same; only the NPC deck *contents* change for RPG matches. A special tournament or side-quest duel uses the same current-act deck as an ordinary NPC match. This preserves consistent challenge levels regardless of which game activity the player uses.

## Authored strategy profiles

Examples from `rpg_npc_deck_progression.js`:

- **Reina (Haymaker):** additional Hitmonchan with PlusPower, Computer Search, Gust of Wind and Item Finder supporting aggressive draws/knockouts.
- **Camila (Team Rocket):** additional Dark Gyarados backed by Super Energy Removal, Computer Search, Lass and Item Finder.
- **Kaede (Team Rocket):** additional Dark Weezing with a different disruption-focused Trainer order.
- **Shiori (evolution):** additional Beedrill with Professor Oak, Pokémon Trader, Computer Search and Item Finder to support setup.
- **Marina (water):** additional Vaporeon, Pokémon Trader, Computer Search and card draw.
- **Yuna:** additional Mewtwo with PlusPower, Item Finder and Computer Search.
- **Hana:** extra Kangaskhan from her original Power Reserve deck and search/draw Trainers.
- **Akari:** control-focused Trainer upgrades in her Gym-based deck.
- **Jun, Teo, Iris, Elio, Alma and Nereo:** original-theme Pokémon reinforcement and curated support Trainers.
- **Rina, Sol, Jinx, Luna, Elena and Sierra:** individual Trainer preferences with a deterministic choice of the strongest legal signature already in their starter theme, if available.
- Future JSON-pack characters fall back to a safe generic Trainer/support progression automatically.

For signature upgrades, the original deck must already contain the Pokémon; evolutions are reinforced only if their immediate prerequisite exists in that deck. The upgrade builder keeps 60 cards, respects four copies per Pokémon/Trainer name, replaces redundant low-impact support first, and retains at least twelve Basic Energy (plus existing special energy). The Classic service validates each final deck using `validateDeck` against the actual card catalogue before a duel can begin.

## Compatibility and player control

- A completed, saved **Deck Collaboration** build from a character's relationship chapters overrides the automatic upgrade. The player's choice is never silently replaced.
- The game snapshots `npcDeckTier` when each duel is staged and persists it with the pending duel. Reloading cannot silently move an already-prepared opponent to a later act.
- Old saved pending duels without `npcDeckTier` continue using the original deck (Act I) for compatibility.
- Only RPG sends `npcDeckId` and `npcDeckTier` to Classic's existing local CPU service; ordinary Single Matches and Cube use their unchanged preset decks.
- CPU skill level/personality, TCG mechanics, economy, collection, dialogue, save IDs and time costs are unchanged.
- Duel results, win rewards and story events still use the original NPC identity and existing settlement flow.

## Tests

`tests/rpg_npc_deck_progression.test.js` checks act boundaries, distinct/60-card legal variants for core and supporting characters, proper evolution support, deterministic fallback, Classic CPU integration, partner-deck override, and unchanged Single Match defaults.

`tests/rpg_world_ui.test.js` also verifies a day-5/day-31/day-61 NPC challenge stores the expected tier and preserves it across RPG reloads. RPG regression tests run these through `npm run test:rpg`.

## Next calibration

Test real AI matches across tiers and measure opening Basic Pokémon, Energy attachment consistency, time to evolve, knockouts and completed game rates. The presence of better Trainer cards does not by itself prove an NPC achieves a target win rate; do not change printed card effects or apply hidden bonuses to force a result.
