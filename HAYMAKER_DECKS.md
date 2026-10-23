# Neo Campus · Haymaker Basic-only Decks

Five new **60-card, Basic-only** predefined decks using historical cards from Base Set, Jungle and Fossil. They use standard card text, normal Energy requirements, no Evolutions and the ordinary four-of limit. These are **curated custom decks**, not historical retail products or 40-card Cube-draft lists.

The decks are playable through **Single Match**, **Online Match**, and the **Deck Builder's Load Starter** menu. They can be chosen as the human deck, Classic CPU opponent, or an online player's deck. Loading one in the deck builder allows editing and saving it as your custom deck.

| ID | In-game name | Pokémon | Trainers | Energy | Primary strategy |
|---|---|---:|---:|---:|---|
| `haymaker_classic` | Classic Punch · Fighting/Lightning | 15 | 27 | 18 | Hitmonchan/Electabuzz/Scyther, early tempo + Energy Removal |
| `haymaker_fire` | Firestorm · Fire/Lightning | 14 | 25 | 21 | Fossil Magmar Smokescreen + Electabuzz pressure |
| `haymaker_psychic` | Mind Games · Psychic/Fighting | 14 | 26 | 20 | Mewtwo/Jynx/Hitmonchan coverage; Chansey defense |
| `haymaker_water` | Tidal Punch · Water/Fighting | 14 | 25 | 21 | Lapras early attacker; Hitmonchan and Articuno follow-up |
| `haymaker_jungle` | Jungle Tempo · Lightning/Grass | 15 | 26 | 19 | Electabuzz pressure, Scyther/Lickitung/Tauros versatile bench |

All five decks are intentionally Trainer-dense and include four Double Colorless Energy cards to support their colorless attackers. No custom modifiers, shortcuts, banned Evolutions, or modified battle rules are introduced.

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

The test confirms exactly 60 cards, only Base/Jungle/Fossil printings, no evolved Pokémon, no name above the four-of rule, supported attacks/Trainers, and successful real local and online match setup in both seats.
