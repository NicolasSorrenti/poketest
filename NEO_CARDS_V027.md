# Neo Campus TCG v0.27 — Expanded Neo Card Support

Built on multiplayer/chat/Energy fix v0.26. All previous Classic, Gym, lobby, server and deck features remain included.

## Actual additions

- Migrated the remaining **6 Neo Genesis theme attack records**: Screech, Jaw Clamp, Mud Splash, Dragon Tornado, Fireworks and Char.
- Migrated the remaining **4 Neo Discovery theme attacks**: Energy Cycle, Hatch, Magic Dust and Scout.
- Implemented optional Lanturn **Hydroelectric Power**, Eevee **Energy Evolution**, Unown A **Anger**, Unown I **[Increase]**, Unown N **[Normal]**, and Omanyte **Revive Fossil** through the authoritative engine. These include live choices, attachment triggers and continuous prevention.
- Fixed source data for Unown I/N and Omanyte and ensured the same corrections apply when cards are imported again.
- Added **23 manually reviewed Neo Genesis/Discovery Pokémon printings** to the experimental Neo deck-builder pool (`neo_bonus_pool.js`). No Neo Revelation or Neo Destiny printings are unlocked by this change.
- Corrected Neo-format deck validation to enforce **four Unown Basic Pokémon total**, not four of each letter.
- Protected Jaw Clamp against forced switches from Trainers, rather than just normal retreat.

## Coverage for the FOUR original Neo theme decks

| Area | Neo Genesis | Neo Discovery |
|------|------------:|--------------:|
| Attack programs registered | 42 / 42 | 33 / 33 |
| Powers registered | 2 / 2 | 5 / 5 |
| Trainer effects registered | 5 / 5 | 7 / 7 |

These are **compiler/handler registrations**, not an assertion of exhaustive historical authenticity for every simultaneous effect. More obscure cross-card interactions still require tests. The 23 additional printings have matching registered attack and Power handlers but are still experimental.

## Tests

- `npm test` — entire existing legacy, online and headless project regression suite plus new Neo tests.
- `npm run test:neo:v027` — 12+ targeted card/rule scenarios, 16 seeded local CPU command sessions, report audits.
- 16 new bounded sessions exercised **249 attacks, 99 decisions, 66 Trainers and 24 evolutions**, preserving 60 cards per player; these are bounded sessions, not a claim that all ended by natural victory.
- `npm start` — playable browser UI at `http://localhost:8000/classic_live.html`; online multiplayer at `http://localhost:8000/online.html`.
- In `deck_builder.html`, choose **Neo Genesis** or **Neo Discovery** from the expansion filter to find the new printings. The original four themes remain prebuilt decks.

## Remaining caveats

We have not fully audited complex combos with optional attack copying, Baby Pokémon, Dark/Metal/Special Energy, Stadiums, and Power-suppression or all UI interaction paths. An effect being registered is not the same as being fully certified. Do not treat the experimental Neo builder as a finalized sanctioned historical format. Multiplayer chat/server in v0.26 remains intact.
