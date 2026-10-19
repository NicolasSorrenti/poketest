# Neo Harbor — Character relationship milestone authoring

This feature intentionally does **not** add saved deck recipes or automated deck upgrades.

## Current architecture

- **Canonical characters:** Eight core cast entries in `rpg.js`, supporting NPCs in `rpg_narrative_pack.js` and `rpg_side_quests.js`, and additional characters authored under `characters/<id>/*.json` and compiled by `scripts/rpg-character-packs.js`.
- **Existing story routes:** `rpg_story.js` keeps the original IDs and imports generated narrative pack events without rewriting character JSON packs.
- **Additional authored stories:** `rpg_bond_chapters.js` supplies missing fourth guest chapters and four side-quest-NPC chapters each. They are available through day 90, but require the earlier chapter and actual character presence. Original routes preserve their own missable windows.
- **Character reward mapping:** `rpg_bond_rewards.js` recognizes the first four authored `_route_N`, `_guest_N`, or `_bond_N` events per NPC, in chronological order. The remaining optional route chapters and crossovers retain their existing stories.
- **Reward mechanics:** Chapters 1/2/3/4 award 10/15/18/25 credits; chapters 2 and 4 also give one themed booster voucher, and chapter 3 gives one playable signature card. Rewards are keyed to the completed story event ID and must not be granted twice.
- **Personal challenge:** After chapter 2, each NPC can offer a one-time signature duel. Win to claim credits and a voucher; a loss or draw does not consume the opportunity. The normal duel and pre-duel flow is reused.
- **Card ownership:** Signature cards and booster vouchers are handled by `rpg_collection.js`. Voucher redemption is available at The Lucky Draw, opens a ten-card random booster, and must not deduct credits.
- **Presentation:** Character list shows `0 / 4` through `4 / 4` but does not reveal locked chapter titles, dialogue, or outcomes.

## Adding another character

1. Write a character JSON pack with **at least four authored route scenes** using valid locations, prerequisites, arrival dates, and story windows. The generated registry remains the build output: do not edit it manually.
2. Confirm their dialogue, age, schedule, portrait path, preferred TCG deck, and story flags are coherent.
3. Add their exact ID to `SIGNATURES` and `TRIALS` in `rpg_bond_rewards.js`. Choose a real card ID from Base Set through Neo Destiny. Give them a meaningful, character-specific challenge name.
4. Optionally assign a thematic expansion to `CHARACTER_SETS` in `rpg_collection.js`; unknown IDs otherwise receive a stable expansion assignment.
5. Run `npm run characters:build`, `npm run characters:check` and `npm run test:rpg`. The bond milestone tests dynamically inspect the actual compiled cast and fail when any new character lacks four chapters, a signature card or a duel challenge.

**Important:** Never replace or renumber existing story IDs, erase choices, rewrite generated JavaScript by hand, or expose future chapter titles in the UI. Keep special stories and crossover moments intact. This subsystem is an additive progression layer.
