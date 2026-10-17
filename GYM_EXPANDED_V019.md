# Neo Campus Classic v0.19 — Expanded Gym Library & Deck Workshop

## What is new

**Every printed card** in Gym Heroes and Gym Challenge is now available to browse and place into custom 60-card decks in a new, separately named **Gym Expanded Preview** format. The archives already contained these card records, but previous releases only allowed the 107 selected for the eight official Gym retail theme decks.

- 157 additional Gym printings unlocked: **113 Pokémon**, **41 Trainers**, **3 Basic Energy printings**.
- 264 of 264 Gym Heroes + Gym Challenge printings now in the expanded pool.
- 705 total selectable printed card records across seven sets: Base Set, Jungle, Fossil, Base Set 2, Team Rocket, Gym Heroes, and Gym Challenge.
- The competitive `classic` format remains Base Set through Team Rocket, strictly enforced by the engine. `gym-theme` remains curated for the eight original Gym theme decks.
- Two additional, **custom (not retail)** playable 60-card trial decks, `Gym Discovery — Earth & Garden` and `Gym Discovery — Fire & Lightning`, draw heavily on previously unavailable Gym cards. They contain no unsupported effect records under the current compiler audit.
- Deck selection now includes **27 options**: previous 24, two discovery decks, and the custom saved deck option.

## Using the new deck builder

1. Run `npm start` and open http://localhost:8000/deck_builder.html .
2. Search by name, filter by set/type, and optionally select **Show executable effects only**.
3. Click **Load preset** to start from one of the old retail lists or new discovery decks, or assemble a deck from scratch.
4. The builder checks the 60-card limit, Basic Pokémon requirement, same-name four-copy limit (different printings count together), and whether every card is within the expanded Gym pool.
5. Save a valid deck to this browser; the duel page at `/classic_live.html` then offers **My Custom Gym Deck** for the human player.

Custom decks are stored in localStorage in your browser, **not** uploaded to a cloud service. The game server revalidates the full deck independently; the UI alone never determines deck legality. No multiplayer backend or accounts are needed.

## Honest rules support status

New card availability is **not** the same as historical rules completeness.

- Of the 157 newly available Gym records, **28** currently have a complete set of *recognized headless effect handlers* (including Basic Energy). There are **17 newly available Pokémon** whose attack records compile and who have no unported Pokémon Powers.
- The other **129** additional Gym records can be browsed, displayed, and placed in decks, but they have unported effects. Those cards are highlighted in the deck builder, and unsupported actions are rejected rather than silently converted into plain damage or a no-op.
- Across all 264 Gym records, 102 currently pass the basic full-effect-compiler check. That does not mean those cards have been exhaustively certified for historical timing and cross-card interactions.
- Neo sets are preserved in the project archive but remain unavailable in these playable formats.

For exact details, see `GYM_EXPANDED_CARD_REPORT.json` (per-card missing attack names/Power names).

## Validation

- `npm test`: complete existing regression suite plus the new expanded-pool tests.
- `npm run test:gym-expanded`: checks catalog counts, legality, both discovery decks, real authoritative game setup and Energy attachment, original format isolation, custom deck validation, and live HTTP endpoints.
- `npm run audit:retail-themes`: curated retail support audit remains intact.
- `node audit_gym_expanded.js`: regenerates the machine-readable expanded-pool support report.

The API adds public `GET /api/classic/card-pool` and `GET /api/classic/decklist?id=...` for the builder. The POST duel creator accepts a `customDeck` list only when `deck=custom`; all cards, names, counts, and formats are checked again on the server. It never accepts a custom CPU deck directly.

**Known limitation:** Full automated tests and HTTP integration tests pass, but an automated graphical Chromium smoke test was blocked by browser restrictions in this execution environment. The new browser builder should still be playtested manually with mouse and touch. Some historic Gym effects, including the complex Trainers and Powers not in the compiled subset, remain unported.
