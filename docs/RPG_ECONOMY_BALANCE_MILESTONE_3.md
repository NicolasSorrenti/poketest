# RPG economy — Milestone 3: soft cap on ordinary duel credits

## Active rules

- For every seven-day in-game week (days 1–7, 8–14, etc.), the first two **ordinary duel victories, across all NPCs**, pay **15 credits each**.
- Third and later ordinary victories during that week pay **8 credits each**.
- Losses and draws still pay **5 credits** and never consume a full-credit win.
- Story and rivalry encounters, authored exhibitions, side quests, bond challenges, official cup rounds, daily training challenges and Saturday locals all keep their **15-credit base victory payout plus their pre-existing event bonuses**. They do not consume the ordinary cap.
- Booster rewards, collection odds, shop prices, NPC relationship rewards, and the historical TCG reducer are unchanged.

## Persistence

The accepted duel receipt writes `ordinaryCreditWin: true` into `state.results` for qualifying victories. The credits calculation derives the current week's count from these results and uses the existing duel-id duplicate-receipt guard. There is no separate weekly counter to go out of sync, and the allowance resets naturally on day 8, 15, etc.

Previously saved results without the new marker remain intact and do not consume the cap retroactively, because historical special-duel types cannot always be reconstructed reliably from their old records. This may give a player who loads an old save up to two additional 15-credit routine victories in the first partially played week after the update; subsequent weeks are fully tracked.

## Verification

`tests/rpg_credit_pacing.test.js` checks the 15/15/8 sequence, losses/draws, all authored and competitive exceptions, the weekly boundary, duplicate receipts and save compatibility. It is included in `npm run test:rpg`.

`npm run balance:rpg` produces the synthetic 90-day economy report plus a matched scenario comparison with the previously uncapped 15-credit victory policy. Outcome RNG is separated from card-draw RNG so opponent choices and win/loss sequences stay identical in both cases. Scenarios do not simulate real CPU duels, NPC availability, or official cup bonuses, and model a high-spending player who always buys the latest unlocked packs.

## Future calibration

Observe actual week-by-week player card acquisition and deck readiness before changing starter credits, shop prices or special-story rewards. If grinding remains attractive, test lower repeat-credit payouts separately rather than simultaneously changing multiple systems.
