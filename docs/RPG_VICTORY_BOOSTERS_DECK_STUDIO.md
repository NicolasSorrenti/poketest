# RPG Milestone — Victory Boosters and Full Deck Studio

## Player experience

- A completed, server-authoritative NPC/tournament win now grants a **five-card** mini booster instead of a single card. It is added once per settled duel, and a loss/draw grants no cards.
- Packs continue to draw from the starter-compatible Base Set upgrade pool, preferring at least one previously unowned card until that starter's pool is exhausted. The **five-card flip/reveal overlay** shows each reward and offers Reveal All. Opening the overlay never awards anything again.
- Store packs remain **five cards for 20 earned credits**. Both victory and purchased packs persist their five-card reveal across browser reloads until acknowledged.
- The RPG sidebar offers **Open full Deck Studio**. The screen at `/rpg_deck_studio.html` is a first-class responsive page with artwork, search, Pokémon/Trainer/Energy filters, name/quantity sorting, collection ownership counts, deck-by-category lists, large card detail view, add/remove copy controls, deck category totals and Save/Discard.
- The editor works with incomplete drafts so the player can remove cards before adding replacements. **Save is disabled until a legal exact 60-card deck** respecting ownership, 4-of except basic Energy, and at least one Basic Pokémon. Unsaved drafts survive reload; live battles only use the saved deck snapshot. Deck Studio blocks editing during a pending duel.
- Existing two-select quick swap dialog remains as a shortcut while the full-screen editor is introduced. Deck editing consumes no RPG periods.

## Authority, state and compatibility

All collection mutation is in `rpg_collection.js`. A victory is only awarded after the existing authenticated Classic match result bridge and idempotent settlement; it is never awarded on an unverified client-side preview. `deckJourney.lastPack` contains `{cards,source,opened}`; the pack count and card ownership are applied before the popup. New/old saves hydrate it safely. The match itself retains exactly the 60 IDs at duel challenge time and is not changed by the editor.

No changes to the TCG reducer, NPC decks, Cube, multiplayer or narrative content.

## QA

`npm run test:rpg` includes collection domain tests for five-card packs, losses, ownership, incomplete drafts, save rejection and save reload. Controller UI tests verify actual win reward pack, visual reveal, ignored duplicate receipts, reload without repurchasing and correct opening persistence. Chromium RPG smoke opens the dedicated studio, tests an invalid 59-card draft cannot save, restores the count to 60, saves, returns to RPG and completes a real match using the saved custom list.

**Scope:** These are curated five-card training/victory packs, not full historical 11-card Wizards of the Coast booster collation. Later milestones can add pack-art animations, rarity probabilities, Jungle/Fossil/Rocket/Neo progression and trading.
