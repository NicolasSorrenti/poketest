# RPG balance — Milestone 2: rarity-correct boosters

Source: historical card rarities from [PokemonTCG/pokemon-tcg-data](https://github.com/PokemonTCG/pokemon-tcg-data/tree/master/cards/en) for all eleven sets. A compact offline number-to-rarity table in `rpg_collection.js` preserves authentic rarity categories (including non-holo Rare Trainer cards and Secret/Shining cards) without runtime API access.

## Distribution

| Pack | Common | Uncommon | Rare slot | Basic Energy |
| --- | ---: | ---: | ---: | ---: |
| 5-card NPC mini booster | 2 | 1 | 1 | 1 |
| 10-card shop, voucher or cup booster | 5 | 3 | 1 | 1 |

Rare slot probabilities are game-tuned rather than a representation of factory pack odds: 25% Holo Rare; 1% Secret/Shining only where that pool exists (Team Rocket, Neo Revelation, Neo Destiny); otherwise non-holo Rare. All packs draw one Basic Energy from Base Set even when the expansion contains no Basic Energy. Duplicate cards can still appear in the same pack.

The weekly limit of two ordinary mini boosters, story/official championship exceptions, shop prices and credits, expansion unlock dates, preexisting unopened reward queues and legacy saves are unchanged. Existing historical TCG gameplay mechanics are untouched.

Collection and RPG UI regression tests validate all rarity buckets, correct pack sizes, and the five-card victory presentation. This milestone does **not** claim complete economy calibration. Next: compare 90-day social-heavy, mixed and duel-heavy player simulations before changing rewards.
