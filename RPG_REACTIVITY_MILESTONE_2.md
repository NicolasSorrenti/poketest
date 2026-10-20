# Neo Campus RPG — Milestone 2: Character Reactivity

Status: implemented on `main` as a data-driven, read-only contextual dialogue layer. Pokémon TCG rules and existing authored story prerequisites remain unchanged.

## Player-facing behavior

- A known character with an unread recent memory displays **✦ Something to say** in the NPC list when present.
- Talking to that character opens a short, voiced three-beat conversation about the most relevant available event.
- Specific reactions cover personal duels (victory, defeat, draw), major Cup results, weekly local outcomes, kept or missed appointments, and just-completed personal chapters.
- Existing initial introductions, mandatory events, authored story chapters, optional invitations, and custom character packs retain precedence.
- No affection, relationship points, credits, time, or prizes are awarded by a contextual conversation; it isn't necessary to talk to everyone every day.
- If the player leaves the conversation early, its memory remains available. It is acknowledged **only after displaying the last line**, and that acknowledgment persists after reloading the save.
- Pre-duel rematches recall the previous result, including a draw. The line is shown as the NPC's response after the standard narrator introduction.
- After a standard duel, NPCs make character-specific remarks, including for local final rounds and victories that reverse earlier results.
- Finishing a casual conversation keeps the NPC selected so Duel and Deck actions remain accessible.

## Character coverage

`rpg_reactivity.js` contains individually written variations for Hana, Reina, Shiori, Yuna, Akari, Camila, Marina, Kaede, Elena, Jinx, Luna, Rina, Sierra and Sol (14 main characters).

Other existing and future character-pack NPCs receive safe, neutral contextual dialogue. Where a character pack specifies duelWin / duelLose, its established voice is preserved in their first reaction line.

## Priority and expiry rules

- An unread direct match from the last five days takes precedence, followed by a missed meeting, a weekly local result, an official cup result, an attended meeting, and a personal chapter.
- Public results only become eligible after a recorded `champion` or `eliminated` tournament/local outcome, never from calendar dates alone. Calendar-only news remains in the existing mandatory season system.
- Cup reactions expire eight days after the start of their major bracket. Local-result reactions expire five days after that week's Saturday Local, so old news cannot overwhelm new conversations.
- The selector is deterministic and read-only. No random rerolls, story flag mutations, or NPC relationship manipulation.
- A character's first meeting always uses their existing introduction instead of an unrelated reaction.

## Compatibility

- Old saves initialize an optional `state.npcReactivity.seen` dictionary without changing story IDs or existing relationship data.
- In-progress casual reactions save their `scene.reactionId`; reloads can resume, and only the final line marks the acknowledgment.
- `rpg_preduel.js` accepts an optional `reactivity` dependency. Other callers still receive the original preview behavior.
- `rpg_competitive_loop.js`, original major Cups, character packs, main story, and TCG duel reducer remain separate.

## Verification

- `node --test tests/rpg_reactivity.test.js` covers character voice, prioritization, memory expiry, story outcomes, old saves, draws, once-only acknowledgments and lack of rewards.
- `node --test tests/rpg_world_ui.test.js` covers end-to-end dialogue selection, interruption/retry, save/load, pre-duel rematch and preservation of duel controls.
- `npm run test:rpg` includes the new tests.
- `tests/rpg_match_reactions_http.test.js` confirms the new module is served by the hosted Node server.
- `tests/rpg_browser_smoke.js` exercises completing optional chat decisions before starting real duels.

## Later, distinct milestones

Dynamic NPC-to-NPC league simulation, permanent rival evolution, player-deck strategic profiling, deeper branching dialog based on authored route decisions, and NPC-initiated inbox messages remain follow-up work. The mandatory-event scheduler already owns major scheduled narrative beats and should not be duplicated here.
