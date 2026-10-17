# Neo Campus TCG v0.29 — Historical theme deck completion

## Included preconstructed decks

| Historical expansion | Count | Decks |
| --- | ---: | --- |
| Base Set | 4 | Blackout, Brushfire, Overgrowth, Zap! |
| Jungle | 2 | Power Reserve, Water Blast |
| Fossil | 2 | BodyGuard, LockDown |
| Base Set 2 | 4 | Grass Chopper, Hot Water, Lightning Bug, Psych Out |
| Team Rocket | 2 | Devastation, Trouble |
| Gym Heroes | 4 | Brock, Misty, Lt. Surge, Erika |
| Gym Challenge | 4 | Koga, Sabrina, Blaine, Giovanni |
| Neo Genesis | 2 | Cold Fusion, Hotfoot |
| Neo Discovery | 2 | BrainWave, Wallop |
| Neo Destiny | 2 | Dark, Light |
| **Total** | **28** | |

Neo Revelation had no official English theme decks. There are five additional lab/custom choices in the menus: 33 choices total, 28 official.

## Changes

- Added exact original 60-card Dark and Light lists with their correct interset printings from Neo Genesis/Discovery/Revelation/Destiny.
- Expanded card/import, deck legality, catalog, UI and online game setup for Neo Destiny; fixes Gym-vs-Neo legality across the same live duel.
- Added theme-only attack behaviors for 19 previously unported Gym deck attack signatures and 13 Neo Destiny attack signatures, with transactional choices for exact Energy targets, Bench Pokémon, and searches.
- Added the seven Neo Destiny-specific Trainer handlers (Berry, Counterattack Claws, Energy Stadium, Mail from Bill, Rocket's Hideout, Heal Powder and Pokémon Breeder Fields). Corrected simultaneous multi-evolution deck index search.
- Added theme-only Neo Destiny Powers including Magma Pool, Hot Plate, Tag Team, Unown E Engage, Unown S Search and Unown T Tell.
- Implemented Sabrina’s Psychic Control coin toss, eligible copied one-shot Trainer choice, and virtual effect replay (opponent’s original card stays in opponent discard).
- Implemented defender-owned Misty’s Tentacruel Flee decision (switch/decline and take the original attack damage) and Brock’s Rhydon Bench Guard reaction (redirect up to 10 damage from a Benched Pokémon).
- Preserved existing energy attachment, Gym evolution, two-human multiplayer room/chat and action-feedback changes.
- Both local and multiplayer UIs show copied Psylink attacks and Energy Stadium’s activated action.

## Validation and limitations

- Full `npm test` regression suite passes.
- `test_all_official_themes_v029.js`: all 28 official decks, 84 seeded authoritative matches, 320 valid actions, 60-card zone conservation, hidden opponent hands, legality checks and card-handler coverage across distinct printings.
- `test_theme_reactions_v029.js`: Flee accepted/declined choices, selected Bench replacement, Bench Guard interception and Psychic Control one-shot replay with no extra physical card.
- Zero missing *handler registrations* among attacks, named Powers or Trainer names in these official 28 decks. This is not a proof that every rare effect combination is historically perfect. Some effects require more exhaustive opposing-card and timing tests.
- The CPU is a simple rules-validating bot and is not yet a strong, competitive opponent.
- Unlocked Gym/Neo cards **outside** the 28 preconstructed deck lists may remain unsupported or unverified. See existing audits for those broader set limitations.

Run `npm run test:themes:v029` or `npm test` to reproduce the checks.
