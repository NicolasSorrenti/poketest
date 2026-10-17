# Neo Campus Classic v0.18 — Retail Theme Decks & Curated Gym Preview

## Play

```bash
npm start
```

Visit http://localhost:8000/classic_live.html . Select the player theme deck and CPU theme deck from the two menus. The old rules UI remains available at `/`.

## New historical theme decks (16)

| Expansion | New presets |
| --- | --- |
| Fossil | BodyGuard, LockDown |
| Base Set 2 | Grass Chopper, Hot Water, Lightning Bug, Psych Out |
| Team Rocket | Devastation, Trouble |
| Gym Heroes | Brock, Misty, Lt. Surge, Erika |
| Gym Challenge | Koga, Sabrina, Blaine, Giovanni |

Together with the six existing original Base Set / Jungle theme decks and two custom laboratory decks, these provide **24 selectable deck presets**. Each of the new decks is 60 cards, satisfies printed card-name copy limits, and can open a server-authoritative match. The deck recipes preserve their particular historical printings.

Historical deck reference materials: PokeBeach Fossil, Base Set 2, Team Rocket, Gym Heroes and Gym Challenge theme-deck archives; supplemental sealed-deck checklists used to resolve two inconsistent fan-list transcriptions. Recipes are in `retail_theme_decks.js` and are independently verified in `test_retail_theme_decks.js`.

## Format safety

- `classic`: Base Set, Jungle, Fossil and Team Rocket, unchanged.
- `theme-expanded`: adds Base Set 2 reprint IDs used by the new theme decks.
- `gym-theme`: allows only the **107 distinct Gym Heroes / Gym Challenge printed cards actually present in the eight retail Gym decks**, plus the earlier legal sets/reprints. The rest of the Gym sets are *not* available for deck construction.
- Gym preview cards do not change the Classic competitive format.
- Player hand and Prize card information remain private in the server game view.
- The game validates choices and card moves server-side.

## Base Set 2 source correction

36 attack `damage` fields had lost their damage modifier (`x`, `+`, or `-`) or another original printed value. They have been fixed in the cached data. `reprint_attack_normalizer.js` also corrects incoming Base Set 2 data in the importer, preventing regeneration of the same problem. All four Base Set 2 theme decks have executable attack programs.

## Curated Gym engine progress — **preview, not full Gym rules certification**

- 107 curated Gym card records: 73 Pokémon, 25 Trainers, 9 Basic Energy printings.
- 123 printed attacks on curated Gym Pokémon: **93 executable programs** (including 26 new Gym-specific programs); **30 remain unported**.
- **24 of 25** curated Gym Trainer printings have resolution paths. **Sabrina's Psychic Control** remains unsupported in the headless Gym theme format. Stadiums retain their cards correctly; some passive Stadium effects are still incomplete.
- **4 of 8** Gym Pokémon Power records have migrated: Energy Charge, Emerge, Strange Barrier, Call the Boss. Bench Guard, Flee, Pollen Defense and Psylink still need handlers.
- New/partial Gym attack families include Super Fang, Water Punch, Sleep Poison, Dream Dance, Headlock, Poison Sting Tackle, Risky Attack, Smelly Gas, and Status/coin variations.
- Gym special Trainers include Brock, Misty, Lt. Surge, Erika, Koga, Sabrina, Blaine, Giovanni, searches, revival, hand manipulation, stadium placements and switching, with follow-up correctness work still required.

**Important:** A Gym deck may start and advance normally but hit a card or game situation that is still unsupported. The engine must reject unsupported commands, not approximate their resolution. The rules UI indicates that Gym decks are previews. Use Base–Rocket / Base Set 2 decks for a more complete local experience while the Gym-specific rules are migrated.

See `CURATED_RETAIL_SUPPORT.json` for exact deck-by-deck lists of missing effects and to avoid mistaking handler coverage for verified historical fidelity.

## Verification

```bash
npm test
npm run test:retail-themes
npm run audit:retail-themes
npm run test:classic:live
```

- Full existing legacy + headless regression suite passes.
- 16 recipes validated for 60-card construction, four-copy rule, exact allowed card IDs.
- 48 new authoritative deck-opening tests covering all 16 new decks and 178 legal commands.
- 26 additional Gym attack programs with reducer and deterministic outcome tests.
- Four Gym Pokémon Power handlers with activated, passive, coin/evolution and on-play tests.
- Base Set 2 damage normalization and attack execution tests.
- 80 existing local CPU session tests and real HTTP client/API tests pass with the new deck selector.
- Manual visual browser/touch testing is still recommended; automated server tests do not establish that every visual interaction works flawlessly.

## Deliberately out of scope

Full Gym Heroes / Challenge catalog, full Gym historical timing certification, online rooms, deck-editor UI, and visual-novel/campaign mode. The headless engine remains the rules authority for the new client.
