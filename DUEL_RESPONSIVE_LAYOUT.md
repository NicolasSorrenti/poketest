# Duel presentation: desktop and mobile

The authoritative Classic duel renderer is **shared** by CPU, RPG, Cube and online matches. Do not introduce separate game rules or duplicate client commands for screen sizes.

## Files and cascade

Both `online.html` and `classic_live.html` load:
1. `classic_live.css` — base components and battlefield markup
2. `online_compact.css`, `online_hand_tray.css` — shared duel layout and attachment art
3. Mode-specific CSS such as `cpu_parity.css`, `rpg_duel.css` where applicable
4. `duel_desktop.css` with media `(min-width: 781px)`
5. `duel_mobile.css` with media `(max-width: 780px)`

**Keep responsive CSS last.** The media attributes ensure exactly one specialized presentation is active at a time.

## Desktop

- 781px and wider
- Larger Active Pokémon at the battlefield center, with attacks alongside it
- Full-size horizontal five-Pokémon Bench
- Attached Energy is physically offset behind the **left** edge
- Attached Trainers are physically offset behind the **right** edge
- Full visible names, HP, and hover/focus inspection

## Mobile

- 780px and narrower (extra tightening at 435px)
- Five equal Bench slots; compact cards with concise labels
- Active Pokémon retains larger artwork and an adjacent attack panel
- Two rows of touch-sized commands, with a prominent End Turn
- Same click/tap actions, Undo, Power drawer and floating hand as desktop
- Visible attachment edges stay inside crowded Bench space without swallowing taps
- Pokémon inspection reveals the full list of attached Energy and Trainers

## Invariants

- `duel_quick_ui.js:energyStack()` renders both kinds of attachments: at most four visible Energy and three visible Trainer cards, with `+N` for overflow.
- HTML card labels, tooltip contents, and image URLs are escaped/validated.
- Miniature attachments have `pointer-events:none`; clicking the underlying Pokémon must still work.
- No changes to `headless_duel.js`, card costs, game decisions, or turn state belong in these presentation styles.
- Do not clip Bench `.poke` elements with `overflow:hidden` on mobile.
- New mode-specific UI elements must be compatible with both `online.html` and `classic_live.html`.

## Verification

```sh
node test_duel_responsive_layout.js
node test_duel_full_height_attachments.js
node test_duel_hand_fan_energy_v041.js
node test_energy_card_stack_v044.js
```

Chromium geometry and screenshot smoke:

```sh
npm install --no-save --ignore-scripts playwright@1.56.1
npx playwright install chromium
node tests/duel_responsive_browser_smoke.js
```

The separate GitHub Actions workflow `Responsive Duel Chromium` runs browser checks for PC, narrow desktop, phone, narrow phone, the 780/781px breakpoint, and the CPU duel page. Screenshots are uploaded to its run artifacts.
