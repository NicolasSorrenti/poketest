# RPG Talk Dialogue — Naturalness Audit

Scope: The **440 optional conversations** added in PR #92 (352 everyday and 88 in-character, across 22 NPCs), including how the new banks transition back to the original `rpg_dialogue.js` Talk exchanges. This audit does **not** rewrite mandatory romance events, character stories, or plot choices.

## Editorial rules used
- Make characters sound like people talking *to the protagonist*, not people reporting anecdotes for an audience.
- Vary conversation starts, protagonist reactions, tone and pacing. Not every encounter needs a punchline or a lesson.
- Preserve differences in character voice: Reina terse and competitive; Hana warm but busy; Yuna exuberant; Akari analytical but curious; Jinx candid and quick-witted; Elena precise and reserved; Sol enthusiastic; Laca familiar with the protagonist; Barb artistic, expressive and practical; supporting cast rooted in work and real connections.
- Specific memories, motivations and uncertainty beat generic pronouncements. Keep a human-sized emotional range, including unremarkable days.
- Avoid assuming the player has already dueled an NPC, reached a relationship threshold, participated in a scene or exchanged specific information. These conversations have no progression condition beyond meeting the NPC.
- Avoid dependent chronological anecdotes. Topic selection is deterministic but not a serialized story, so any scene may be heard before another.
- Keep low-stakes dialogue free of affection changes, rewards, story flags and spoiler reveals.

## Issues found and changed
- **Formulaic openings and question chains:** many exchanges started `I found...`, `I went...`, `Did you...` and ended with a punchline. Rewrote high-repetition conversations into natural invitations, small disagreements, follow-up questions and actual back-and-forth.
- **Overwritten character voices:** some NPCs sounded like the same cheerful narrator. Added distinct attitudes, habits, speech patterns and stakes.
- **Exposition instead of speech:** characters directly described their personal growth. Replaced several with observable actions or specific events.
- **Premature familiarity:** some NPCs made intimate statements or referred to an earlier player match regardless of progress. Kept conversations friendly and avoided unearned familiarity.
- **Questionable details:** repaired a baking-contest scene where store-bought rolls had somehow placed third, and several implausible throwaway jokes.
- **Untracked continuity:** separated Luna's two dumpling stories, Sol's overlapping handshake stories, Kaede's duplicated noodle explanations and Laca's repeated blanket-fort memory. None relies on a prior Talk being selected.
- **Perspective errors:** repaired an Alma exchange where the wrong character appeared to offer the tea, as well as an inconsistent rare-card trade.
- **Original Talk fallback:** compared the character voices in `rpg_dialogue.js` and the canonical character profiles to the new banks, keeping the old authored exchanges intact.

## Validation
- All 22 NPCs have exactly 16 distinct everyday topics and 4 distinct in-character topics.
- 440 scenes / 1,940 lines total; 310 scenes have five dialogue beats.
- Everyday scenes and voiced scenes retain alternating NPC/protagonist speakers with no blank entries or duplicate openings per NPC.
- For each NPC, all 20 new scenes remain reachable within the 90-day campaign at the same daypart; older authored Talk also remains reachable.
- No romance event, affiliation, duel, schedule, choice consequence, save serialization or portrait art altered.

## Known limitations
Naturalness is editorial, not provable by automated tests. Story context can still shape how any fixed conversation feels in a specific playthrough. Since deterministic topic selection uses only NPC/day/slot, a repeat Talk in the **same** daypart can repeat the same scene. True callbacks, relationship-tier dialogue, daypart-aware dialogue and dynamic reactions would need a separate narrative-state feature. Full GitHub regression workflows must be evaluated separately from this content audit.
