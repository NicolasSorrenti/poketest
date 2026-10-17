# Neo Campus TCG v0.30 — Opponent Feedback & Centered Board

This release builds on the v0.29 all-theme-decks ZIP; no official theme-deck lists were removed.

## What changed

- Both `online.html` and `classic_live.html` now show a persistent opponent activity bar. Its label distinguishes waiting for the opponent's turn from waiting for a card choice; it switches back to **YOUR MOVE** when appropriate.
- Every completed authoritative action has a sequenced public event. The online client checks changes on its existing 1.2-second refresh and plays newly received opponent actions **in order**, rather than compressing multiple actions into a single announcement.
- Action animations include visible card art for Trainer plays, Energy attachments, Evolutions and Benching when the image is available; other effects use a distinct attack/power/switch/choice visual cue. Opponent field pulses briefly. Existing board animations for card deployment, damage and Energy gain remain.
- Server controls visibility. Private setup choices, hidden cards and selected deck/hand indices are **never exposed** by the activity feed. No extra game move is sent from these animations.
- Both Active Pokémon positions line up centrally facing each other. Benches and the hand are centered; on narrow screens, attack controls sit **below** the centered Active Pokémon.
- Local and multiplayer clients also fetch the Neo Revelation / Neo Destiny `neo3` / `neo4` card files for card names and artwork.
- `prefers-reduced-motion` disables decorative motion while keeping readable status labels.

## Try it

Run `npm start` in this folder; open `/classic_live.html` (CPU) or `/online.html` (two human players). To see the opponent updates in multiplayer, use two separate browser sessions (a private tab is fine), or two machines on the same server. Action status changes appear after the next successful state poll (up to approximately 1.2 seconds, excluding network delay). Opening an existing match does not replay its historical action animations.

## Tests

- `npm test`: full regression suite including the new v0.30 test.
- `npm run test:feedback:v030`: focused transport, privacy, opponent animation and HTTP checks.
- Rendered the battlefield at 1440px and 430px widths with browser layout checks for centered Active positions and no horizontal overflow. These were controlled layout screenshots with placeholder cards, not live multiplayer video captures.

## Limitations

This is UI presentation backed by existing rules. It doesn't alter the game logic, card legality or CPU AI. Rare historical interaction fidelity outside the 28 theme decks remains a separate workstream. If dozens of actions arrive between connection updates, the latest 24 public actions are retained, and animations are capped to avoid an excessive backlog. The action overlay announces successfully **completed** server actions, not an unsubmitted drag or tentative choice in the other player's browser.
