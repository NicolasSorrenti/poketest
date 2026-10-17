# Neo Campus TCG v0.39 — Floating Hand & Reliable Prizes

Built from the hosted v0.38 release; no changes to card rules, server-side choice validation, theme decks or room/chat/spectator features.

## Online battlefield

- Both Benches and both Active Pokémon remain in the compact main battlefield. The hand no longer occupies 160–175px of permanent height.
- The bottom HAND tray previews three cards, opens into a floating horizontal card row, and collapses with the toggle / Close / Escape. Playing a card automatically closes the tray after the action resolves. Energy and Evolution selection closes it to expose eligible Pokémon.
- Pokémon Powers open in a separate floating drawer; Retreat, End Turn and Concede stay in the bottom action strip.
- Compact turn guidance on small screens avoids pushing the player's Bench below the fold.
- Styles are online-only (`online_hand_tray.css`), leaving `classic_live.html` unchanged.

## Prize-card bug

The UI used `busy=true` during an attack and rendered the newly pending Prize decision before resetting `busy`. This produced Prize buttons with `disabled=true`, and the polling refresh did not rerender the same revision afterwards. The UI now rerenders once `busy` is reset. Prize buttons are generated from the **server's decision options**, and a numbered Prize-choice row also appears at the top of the battlefield. Both paths send the same server-validated option ID.

## Verification

- `npm test` / `npm run test:ui:v039` pass.
- In-memory Chromium browser fixture exercised a live-like attack → pending Prize → clickable Prize choice at **1440×900** and **390×844**. Neither layout had page overflow, and the Bench remained inside the viewport.
- Both tray states opened and closed, and the mocked client sent the authoritative `choose` action.
- These tests do not replace playing a full two-player game on Render.

## Deploy

Replace your GitHub repository's project files with the contents of `neo-campus-work`, then commit and push. Render should redeploy automatically. Existing in-memory matches are lost on restart. `HOST=0.0.0.0` works with Render, and `PORT` uses the Render-provided value.
