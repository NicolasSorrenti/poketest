# Neo Campus — Neo Genesis Theme Deck Preview (v0.20)

## Scope

Added **exact English retail 60-card theme decks** **Cold Fusion** (Lightning/Water, Kingdra) and **Hotfoot** (Fire/Grass, Jumpluff), first released alongside Neo Genesis. Deck recipes use Neo Genesis printing identifiers, including both Totodile #80/#81 and Cyndaquil #56/#57. Historical decklist reference: https://www.pokebeach.com/tcg/neo-genesis/theme-decks (also verified against Bulbapedia).

The existing Base–Rocket Classic format stays strict. `neo-theme` is an isolated **preview** format allowing existing historical cards plus only the 33 distinct Neo Genesis printings used in these decks. Other Neo Genesis printings (such as Lugia #9) remain unavailable in the curated format. All Neo Genesis JSON records remain archived and unchanged. The deck workshop exposes the curated 33-printing subset; it does not unlock the rest of Neo.

## Included changes

- Added `neo_genesis_decks.js` with both exact retail recipes, playable via `http://localhost:8000/classic_live.html` in the server-controlled game.
- Updated `classic_format.js`, `headless_duel.js`, `classic_local_service.js` to support controlled Neo legality, CPU match starts, and card-library visibility.
- Added five Neo Trainer implementations via the shared pending-decision path: **Bill's Teleporter**, **Professor Elm**, **Moo-Moo Milk**, **Pokémon March**, **Super Rod**. Opponent makes the first optional search on Pokémon March.
- Added Neo-era **Baby Pokémon attack-protection flip** for the two babies in the decks (Elekid, Magby), plus **Elekid's Playful Punch** Power (ends turn).
- Added 12 exact-printed attack signatures in `neo_theme_attack_core.js`, with mechanics for coin locks, full shield, Leech Seed, deck milling, Power suppression, a conditional damage bonus, Poison and drain, and defending-effect-independent Swift damage.
- Added server-side deck-list, legality, trainer, Power, Baby, attack, and hidden-information tests. Existing UI and Gym decks remain available.

## Support disclosure

The **two official decks are selectable and game-start tested, not 100% historically certified**. Their combined set of 33 distinct printings contains **42 printed attack records: 36 have headless execution programs and six remain unsupported.** The unsupported attacks are:

- Croconaw #31: Screech and Jaw Clamp
- Seadra #48: Mud Splash
- Kingdra #8: Dragon Tornado
- Cyndaquil #57: Fireworks
- Quilava #47: Char

**Hydroelectric Power** on Lanturn #38 is still unsupported. Every Trainer present in these two decks has a registered executable handler. Some broader interactions remain subject to further rules testing. Unsupported attacks are rejected rather than played as if they had no effect. `NEO_GENESIS_THEME_SUPPORT.json` is the machine-readable per-printing report.

## Running

```bash
npm start
# http://localhost:8000/classic_live.html
npm run test:neo-themes
npm run audit:neo-themes
npm test
```

No paid services or new runtime dependencies are necessary; Node 18+ is sufficient.
