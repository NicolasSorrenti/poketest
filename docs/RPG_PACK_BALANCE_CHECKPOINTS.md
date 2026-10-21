# RPG booster balance — five-checkpoint deck-strength audit

## Outcome

The Game Boy-style thematic packs are competitively **distinct**, and always buying the newest pack is **not consistently best**. Trainer's Toolkit delivers stronger Trainer support, but Evolution Workshop's guaranteed compatible Basic + Stage 1 cards generated materially stronger midgame decks under the project's seeded duel engine.

**Live change:** Evolution Workshop **22 → 26 credits**; Trainer's Toolkit **24 → 22 credits**. Colosseum Circuit remains 20 credits. No pack loses its guarantee, no printed card properties or rarity odds change, and no expansion unlock date, duel payout, NPC AI skill or NPC recipe is altered by this balance milestone.

## What was measured

A reproducible benchmark in `scripts/benchmark-rpg-pack-strategies.js` analyzes **Days 15, 30, 45, 60 and 80**, with five purchase plans:

- `mixed`: rotates through unlocked thematic packs.
- `toolkit`: buys only Trainer's Toolkit after identical opening gifts.
- `evolution`: buys only Evolution Workshop after identical opening gifts.
- `arena`: buys only Colosseum Circuit after identical opening gifts.
- `latest`: buys the latest-unlocked themed pack, waits if unaffordable.

**Economy assumptions:** 80 starting credits, *modeled* additional 12 credits per game day, the same two Day 1 five-card welcome picks (Arena + Evolution), and two ordinary five-card NPC win rewards per seven-day week. Purchases use the game's actual prices and ten-card `buyThemedPack` operation. Pack RNG is independently seeded by day, while battle seeds are held constant across strategies.

**Deckbuilding model:** uses only owned, historically legal cards, keeps a 60-card deck, at least 12 Basic Pokémon and 18 Basic Energy, and incorporates viable evolution stages as well as stronger Trainer cards. It validates the same core deck legality and ownership rules used by the game. It is a deterministic, *illustrative* deck optimization heuristic; it is not necessarily what a new human player would build.

**Duels:** genuine Classic reducer, two equal level-3 CPU agents, each match played in both seat orders, original physical card rules intact. NPC decks scale by the **calendar** in this benchmark; character-specific early relationship milestones are not modeled. Six archetypes sampled: Hana, Reina, Camila, Marina, Shiori, and Yuna.

The simulation does not replay real player saves or predict exact human-player win percentages. Results have sampling error, especially in 10–12 game exploratory cells.

## First complete five-checkpoint run — 300 real-engine matches

Each row displays *player wins as a percentage of decisive CPU matches*.

| Day | Mixed | Toolkit | Evolution | Arena | Latest |
| --- | ---: | ---: | ---: | ---: | ---: |
| 15 | 50% | 50% | 42% | 45% | 33% |
| 30 | 30% | 42% | 42% | 27% | 27% |
| 45 | 8% | 18% | 33% | 18% | 40% |
| 60 | 8% | 27% | 25% | 33% | 8% |
| 80 | 36% | 25% | 33% | 33% | 42% |

Each cell contained twelve total games (two starters × three NPCs × two seat orders) and 10–12 decisive outcomes, so **do not use this run alone to rank packs**.

## Larger Day 45/60 sample — 720 real-engine matches

Two starter decks, six NPC archetypes, three independently seeded samples, each mirrored in both seat orders: **72 total games per pack plan and checkpoint**.

| Checkpoint | Mixed | Toolkit | Evolution | Arena | Latest |
| --- | ---: | ---: | ---: | ---: | ---: |
| Day 45, original prices | 14/72 (19%) | 16/71 (23%) | **34/72 (47%)** | 27/69 (39%) | 24/68 (35%) |
| Day 60, original prices | 21/72 (29%) | 23/70 (33%) | **32/71 (45%)** | 23/64 (36%) | 19/71 (27%) |

Denominators exclude draws/timeouts; their counts are in the JSON artifacts.

**Findings:** All five themes produce playable strategies; Toolkit is *not* the dominant choice. Evolution Workshop wins significantly more modeled matches on average in these midgame tests. A player who follows the newest pack every day is not automatically rewarded for ignoring the older packs, which was a core design goal.

NPC strength also varies substantially. Across five strategies at Day 45, player win rates were Reina 6/58 (10%), Hana 11/58 (19%), Camila 30/59 (51%), Marina 14/58 (24%), Shiori 23/59 (39%), Yuna 31/60 (52%). Day 60 outcomes were Reina 7/58 (12%), Hana 12/55 (22%), Camila 23/57 (40%), Marina 14/59 (24%), Shiori 20/59 (34%), and Yuna 42/60 (70%). **Do not change every NPC's tier or CPU level globally based on aggregate results.** Reina and Camila need separate archetype-specific tuning in a later milestone.

## Matched counterfactual price trial — 288 additional real-engine matches

Before updating the shop, the same Day 45/60 opponents, starter decks and random seeds were replayed with **Evolution at 26** and **Toolkit at 22** versus their then-live original prices (Evolution 22, Toolkit 24).

| Checkpoint | Evolution 22 | Evolution 26 | Toolkit 24 | Toolkit 22 |
| --- | ---: | ---: | ---: | ---: |
| Day 45 | 34/72 (47%) | 29/71 (41%) | 16/71 (23%) | 17/71 (24%) |
| Day 60 | 32/71 (45%) | 28/71 (39%) | 23/70 (33%) | 24/72 (33%) |

Higher Evolution price reduces the number of strong pairing attempts while preserving its useful connected-line mechanic. Lower Toolkit price modestly improves affordability but does **not** by itself close the entire gap. The two plans remain strategically different; no broad statistical equivalence is claimed.

Based on this matched experiment, the two candidate prices were adopted. Other offers and weekly reward caps are unchanged. The game still gives two *free* welcome mini packs, so no opening reward is removed.

## Repeatable checks

```sh
npm run balance:packs -- --seeds 2
npm run balance:packs -- --duels --days 45,60 --seeds 3 --pairs 1 --starters ember_garden,tidal_circuit --npcs hana,reina,camila,marina,shiori,yuna
# Counterfactual: previous prices on the same random seeds
npm run balance:packs -- --duels --days 45,60 --styles evolution,toolkit --seeds 3 --prices evolution=22,toolkit=24
node --test tests/rpg_pack_balance.test.js
```

GitHub Actions workflow: `.github/workflows/rpg-pack-balance.yml`. It uploads full JSON reports for collection readiness, five-checkpoint matches, deeper midgame NPC matches and the price counterfactual. The pre-change, fully successful matched experiment is available as [GitHub Actions run 39602035557](https://github.com/NicolasSorrenti/poketest/actions/runs/39602035557).

Future rebalancing should use paired samples across different deck-builder heuristics, starter types, opponents, and more seeds. This first price adjustment is intentionally modest; it should not be used as a reason to change attack effects or nerf signature Pokémon cards.
