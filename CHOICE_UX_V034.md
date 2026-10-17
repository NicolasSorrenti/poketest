# Neo Campus TCG v0.34 — Battlefield decisions and centered dialogs

Builds on v0.33. Does not change the card engine or printed rules.

## In both `classic_live.html` (CPU) and `online.html` (multiplayer)

- Trainer, Power, attack, and Stadium decisions whose server-issued option IDs identify **in-play Pokémon** are shown on the actual battlefield. Their eligible cards glow teal and are clickable, including opposing Pokémon (e.g. Gust of Wind / Energy Removal) and your own Pokémon (e.g. Potion / Super Potion / Scoop Up).
- Eligible Pokémon can be the Active card or any Bench card. Ineligible cards are dimmed. Multi-target choices remain selected (amber) until you confirm; optional choices show Decline.
- A small instruction bar appears above the board and the page scrolls to the target when a new field decision starts.
- Non-battlefield effects (attached Energy, hand/deck/discard cards, coin-related options, quantities, statuses, trivia, etc.) appear in a prominent, **viewport-centered** dialog with a dim backdrop.
- The modal never auto-declines a mandatory server decision. Choice IDs are always copied from the server's pending decision. If a target cannot be unambiguously matched to a visible Pokémon, the original choice list is shown in the centered dialog rather than guessing.
- Works for both online seats; no opponent hand/deck information is added to the public view.
- The previous evolution / manual Energy targeting is preserved. Existing v0.30 animations and centered field layout remain.

## Run

Extract this zip, then run `npm start` from the `neo-campus-work` directory and visit:

- `http://localhost:8000/classic_live.html` for CPU games
- `http://localhost:8000/online.html` for online multiplayer

Run `npm run test:ui:v034` for the Node mapping, asset, board, local-HTTP, online-HTTP and animation tests. `npm test` still covers the full game.

Optional visual regression harness: `python test_browser_choice_v034.py` (requires Python Playwright and a Chromium executable at `/usr/bin/chromium`). This harness injects fake game responses into isolated pages to verify browser interactions; it is not an end-to-end server gameplay test.
