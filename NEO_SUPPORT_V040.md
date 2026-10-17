# Neo Campus TCG v0.40 — More Neo Cards

## What changed
- Added **25 distinct executable attack signatures** covering **31 printed attack entries** from Neo Genesis, Neo Discovery, Neo Revelation, and Neo Destiny. The handler is keyed by original imported card text, damage and attack name; unsupported effects still fail explicitly.
- New examples: Ampharos **Gigaspark**; Azumarill **Bubble Shower**; Feraligatr **Riptide**; Sneasel **Beat Up**; Scizor **False Swipe / Double Claw**; Kabutops **Hydrocutter**; Crobat **Cross Attack**; Celebi **Psychic Damage**; Dark Tyranitar **Mountain Smasher**; Light Arcanine **Gentle Flames**; and others.
- Attack implementations include coin flips, paralysis/confusion, healing, recoil, indirect damage counters, Bench splash damage, Energy recovery, mill and printed-stage scaling.
- **Nine additional complete Neo printings** are now whitelisted for **Neo custom decks** and visible in the deck-builder catalog: Azumarill, Sneasel, Miltank, two printings each of Kabutops, Scizor and Ursaring.
- Cards whose other attacks or Pokémon Powers aren't implemented remain restricted; the four Neo sets are **not** fully implemented.

## Handler availability audit (does not certify complete historical accuracy)
| Set | Missing attacks before | Missing attacks after |
| --- | ---: | ---: |
| Neo Genesis | 37 | 27 |
| Neo Discovery | 45 | 32 |
| Neo Revelation | 53 | 49 |
| Neo Destiny | 74 | 70 |
| Total | 209 | 178 |

Other gaps: named Pokémon Powers, special Energy rules, Trainer interactions, and uncommon combinations. The existing 28 theme decks and online UI are unchanged.

## Tests
- `node test_neo_batch_v040.js` performs signature validation, custom deck legality checks, and multiple seeded attacks through the authoritative reducer, plus focused outcome checks.
- `npm test` also covers the existing game, card effects, and hosted multiplayer. Existing catalog-size tests account for the nine newly unlocked cards.

## Hosting
Push/commit to `main`; Render redeploys automatically if enabled. Deploying restarts in-memory matches. This update does not change the Render host/port configuration.
