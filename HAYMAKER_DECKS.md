# Neo Campus · Haymaker Basic-only Decks

**17 predefined 60-card Basic-only decks**, spanning the game's supported Base Set through Neo Destiny cards. The five original Base/Jungle/Fossil Haymakers remain intact, with 12 additional era-themed options. They use standard card text, normal Energy requirements, no Evolutions and the ordinary four-of limit. These are **curated custom decks**, not historical retail products or 40-card Cube-draft lists.

The decks are playable through **Single Match**, **Online Match**, and the **Deck Builder's Load Starter** menu. They can be chosen as the human deck, Classic CPU opponent, or an online player's deck. Loading one in the deck builder allows editing and saving it as your custom deck.

| ID | In-game name | Pokémon | Trainers | Energy | Primary strategy |
|---|---|---:|---:|---:|---|
| `haymaker_classic` | Classic Punch · Fighting/Lightning | 15 | 27 | 18 | Hitmonchan/Electabuzz/Scyther, early tempo + Energy Removal |
| `haymaker_fire` | Firestorm · Fire/Lightning | 14 | 25 | 21 | Fossil Magmar Smokescreen + Electabuzz pressure |
| `haymaker_psychic` | Mind Games · Psychic/Fighting | 14 | 26 | 20 | Mewtwo/Jynx/Hitmonchan coverage; Chansey defense |
| `haymaker_water` | Tidal Punch · Water/Fighting | 14 | 25 | 21 | Lapras early attacker; Hitmonchan and Articuno follow-up |
| `haymaker_jungle` | Jungle Tempo · Lightning/Grass | 15 | 26 | 19 | Electabuzz pressure, Scyther/Lickitung/Tauros versatile bench |

The original five decks are completely unchanged. All 17 builds are Trainer-dense, with strong early play and four Double Colorless Energy cards for Colorless attack costs where appropriate. No custom modifiers, shortcuts, banned Evolutions, or modified battle rules are introduced.


## New Haymaker decks, by era

These **12 additional** decks feature actual Pokémon from the named expansion (rather than just using old Pokémon with different Trainer cards). Their decks are curated for the supported game engine, not reconstructions of historical tournament-winning lists.

| ID | Era | Featured Basics | Pokémon / Trainers / Energy |
|---|---|---|---:|
| \`haymaker_base2\` | Base Set 2 | Hitmonchan, Electabuzz, Scyther, Lickitung | 15 / 27 / 18 |
| \`haymaker_rocket_blitz\` | Team Rocket | Rocket Voltorb, Charmander, Ponyta; Fossil Magmar | 15 / 26 / 19 |
| \`haymaker_rocket_venom\` | Team Rocket | Rocket Koffing, Ekans, Oddish; Fossil Magmar | 15 / 26 / 19 |
| \`haymaker_gym_heroes\` | Gym Heroes | Rocket's Hitmonchan, Lt. Surge's Electabuzz | 15 / 26 / 19 |
| \`haymaker_gym_challenge\` | Gym Challenge | Rocket's Mewtwo and Zapdos, Sabrina's Jynx | 15 / 26 / 19 |
| \`haymaker_rocket_gym\` | Both Gym sets | Rocket's Hitmonchan, Rocket's Zapdos, Rocket's Snorlax | 15 / 26 / 19 |
| \`haymaker_neo_genesis\` | Neo Genesis | Magmar, Electabuzz, Miltank, Stantler | 15 / 26 / 19 |
| \`haymaker_neo_discovery\` | Neo Discovery | Hitmontop, Yanma, Scyther, Larvitar | 15 / 26 / 19 |
| \`haymaker_neo_revelation\` | Neo Revelation | Slugma, Chinchou, Ho-oh, Farfetch'd | 15 / 26 / 19 |
| \`haymaker_neo_destiny\` | Neo Destiny | Hitmonlee, Heracross, Scyther, Larvitar | 15 / 26 / 19 |
| \`haymaker_neo_dark\` | Team Rocket + Neo 1–4 | Sneasel, Houndour, Murkrow, Chansey | 15 / 25 / 20 |
| \`haymaker_all_eras\` | Base through Neo Destiny | Original Hitmonchan, Neo Hitmonlee, Rocket's Zapdos, Electabuzz, Hitmontop and Farfetch'd | 15 / 26 / 19 |

The Rocket decks introduce Rocket's Sneak Attack and Nightly Garbage Run. The Neo decks use a small Neo Genesis Trainer suite, including Professor Elm and Focus Band. The Darkness deck intentionally uses four Darkness Energy and four Rainbow Energy, respecting special-Energy copy limits.

**Format separation:** these are 60-card Single Match / Online Match presets. They are *not* added to the 40-card Cube draft deck-builder or to any preset's 240-card draft pool. Cube players can draft Basic-only Haymaker strategies organically.

## Try them

- Open `/classic_live.html`, choose a Haymaker deck under **Your Deck**, then choose one under **CPU Deck**.
- Open `/online.html` and select any Haymaker deck when creating/joining a room. Players can independently change their deck in the lobby.
- Open `/deck_builder.html`, choose a Haymaker option under starter decks and press **Load** to inspect or modify it.

This does **not** alter the Cube preset pools. In Cube mode, Haymaker strategies remain something players build by drafting cards; the new predefined 60-card decks are standalone match options.

## Verification

```bash
node test_haymaker_decks.js
node test_online_deck_matrix.js
```

The test confirms exactly 60 cards, printings from supported historical expansions, no evolved Pokémon, no name above the four-of rule, supported attacks/Trainers, and successful real local and online match setup in both seats. It also confirms the five original deck IDs and key card printings remain present.
