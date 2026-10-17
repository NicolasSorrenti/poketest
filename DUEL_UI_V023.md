# Neo Campus v0.23 — Quick-Play Duel UI

This release improves the existing **online.html** (two real players) and **classic_live.html** (CPU). Both clients continue to use the existing authoritative server reducer. No gameplay resolution was added to the client.

## Faster actions

- Click an **Energy** card, then click a glowing Pokémon to attach it. The server validates turn limits and attachment restrictions.
- Click an **Evolution** card, then click a glowing eligible Pokémon. The UI checks the printed previous stage and current-round restriction as a convenience; the server still checks all special conditions.
- Click a **Trainer** to play it immediately. If an effect asks you to select cards or targets, the normal server decision panel appears.
- Click a **Basic Pokémon** from your hand to Bench it immediately.
- Cancel a targeted hand selection via the hand button, decision pane, or **Escape**. Cancel does not rewind a Trainer already played or any server-committed action.

## Battlefield usability

- Each player's remaining Prizes appear as six face-down / taken markers on the left of the board. These are counts, NOT revealed Prize identities. Private hands/Prize card information remain server-protected.
- Attacks appear directly next to your Active Pokémon, showing printed name, Energy symbols, and damage. They remain visible but disabled when it is not your turn.
- Hover or keyboard-focus a card in your hand or on the board to view an enlarged card artwork and rules. Clicking a Pokémon outside of target mode opens a pinned inspector with Close. The inspector uses source card images; artwork may need an internet connection.
- Targeting highlights legal-looking Pokémon, and provides cancel affordances. Authoritative rules always have final say.

## Architecture & QA

- Shared presentation functions live in `duel_quick_ui.js` (served from the static whitelist). They only format and validate local targeting hints; they do **not** mutate game state.
- `test_duel_quick_ui.js` covers evolution eligibility, Prize rendering without exposing card IDs, and both clients' shared interaction wiring.
- `npm run test:quick-ui`, `npm run test:online`, and the full `npm test` suite passed in this release.
- Chromium browser navigation to local HTTP servers was blocked by this environment's policy, so final visual interaction QA should be performed in a real browser on the user's machine. Automated HTTP and static script tests are passing.

## Run

```bash
npm start
```

Online friends: `http://localhost:8000/online.html` (use invite code and cloudflared as before)

Vs. CPU: `http://localhost:8000/classic_live.html`

The card engine remains an in-progress historical implementation. Gym and Neo printings may still include unsupported effects.
