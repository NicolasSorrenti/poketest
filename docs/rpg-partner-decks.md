# Milestone 4 — RPG partner deck collaboration

The RPG and Classic engine currently support **1v1** battles. This milestone establishes playable NPC deck customization and prepares clean saved partner-deck snapshots for future Tag Duels. **Do not describe this as a full 2v2 battle mode.**

## How to use

1. Complete the first two authored relationship story chapters with a character.
2. Talk to that NPC and choose **Edit [name]'s deck**.
3. The existing Cube visual builder opens at `/rpg_deck_studio.html?partner=<id>&deck=<theme>&name=<name>`.
4. Their 60-card theme deck is the starting point. The editable pool contains their original cards plus Pokémon TCG cards available from the player's own collection; editing does not consume owned cards.
5. Keep their protected signature Pokémon and at least **30 of the 60 original cards**. All standard size, Basic Pokémon, historical four-copy/name, Miracle Energy and card availability constraints still apply.
6. Save. The next RPG duel *against* that NPC uses a snapshot of the customized deck, passed to the authoritative Classic CPU engine. The normal player deck and other NPCs' decks are unchanged.
7. Each NPC has a separate saved list in `state.partnerDecks[npc]`, and `state.partnerDeckSources[npc]` tracks the original deck source. Unsaved drafts are discarded when leaving the editor.

## Files

- `rpg_partner_decks.js`: unlocking, allowed card pool, protected signature selection, validation, state save/snapshot.
- `rpg_partner_deck_studio.js`: Cube builder adapter in partner-edit mode, conditional on `?partner=`.
- `rpg_deck_studio.js`: original player's own editor, unchanged outside partner mode.
- `rpg.js`: dialogue entry point, persisted opponent-deck snapshots, pre-duel feedback, recovery after reload.
- `classic_live.js`: delivers customized NPC deck through `customOpponentDeck` to the match service.
- `classic_local_service.js`: validates customized opponent card IDs/deck legality and gives the CPU the modified list.
- `tests/rpg_partner_decks.test.js`: progression requirements, protected identities, save, ownership, and engine integration.

**Future 2v2 integration**: when Tag Duel mechanics are implemented, the partner CPU should receive `PARTNER.snapshot(state,partnerId,sourceTheme)` if present or its original theme otherwise. Partner deck edits must not modify the player's deck or convert the match into a misleading pseudo-tag battle.

## Character authoring

Unlocks use the first two completed `<npc>_route_N`, `<npc>_guest_N`, or `<npc>_bond_N` chapters. New NPCs must be registered in the existing narrative pack system and have playable theme decks. The preferred signature comes from `rpg_bond_rewards.js`; if that printed card isn't in the NPC's original deck, the editor chooses a standout Pokémon already present in their actual deck and protects it.

Run `npm run test:rpg` after modifying partner decks or story progression. The feature does not add deck-recipe management.
