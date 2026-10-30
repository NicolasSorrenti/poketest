# Neo Campus RPG — Dialogue uniqueness audit and writing guide

> Audit date: 2026-10-30. Source: `main`. This is a writing-quality assessment, **not** a rewrite. Preserve existing character/event IDs, gating, choices, rewards and CG mappings when applying edits.

## Scope and evidence

Reviewed the authored chat pools and inspected the structures of `rpg_story.js`, `rpg_dialogue.js`, `rpg_narrative_pack.js`, `rpg_side_quests.js`, `rpg_slice_of_life.js`, `rpg_group_chats.js`, and `rpg_season_events.json`.

- `rpg_everyday_chats.js`: **22 characters × 23 scenes = 506** short everyday conversations. Dialogue arrays are restricted to 3 or 5 lines, with speakers alternating NPC/player.
- `rpg_character_chats.js`: **22 characters × 4 scenes = 88** 5-line conversations, also alternating NPC/player.
- Overlap checks included duplicate normalized lines, repeated prompts, and a token-overlap comparison of scenes from different characters. These are *candidate flags*, not definitive semantic judgments. A full human editorial pass over route and event scripts remains outstanding; do **not** claim every romance event has been individually assessed.

## Confirmed candidate overlaps (editorial triage)

| Severity | Characters | Evidence in `rpg_everyday_chats.js` | Editorial direction |
| --- | --- | --- | --- |
| HIGH | **Nereo / Sol** | Nereo: niece made a friendship bracelet → player: "Are you wearing it?" → worn under sleeve. Sol: neighbor's kid made a friendship bracelet → **same player question** → wearing it, jokes about knots. | Keep one; replace the other's **premise**, not just a few nouns. Prefer a scene advancing their individual history. |
| MEDIUM–HIGH | **Jinx / Rina** | Both discover an old music box, discuss its song. Jinx remembers childhood; Rina wants to finish an incomplete tune. | Keep the stronger association with each character; move the other to an unrelated concrete activity. |
| MEDIUM | **Alma / Iris** | Both center on book-sharing shelves: Alma creates a corner for exchanged books; Iris finds a take-a-book shelf. | Distinguish the *dramatic purpose*, or replace one premise with a personal conflict/decision. |
| LOW / thematic collision | **Elena / Barb** | Both have a sewing scene involving a crooked stitch and someone learning. | Accept if useful characterization, but avoid clustered crafting/coaching anecdotes without a distinct consequence. |
| LOW / repeated comic shape | **Akari / Sol / Laca** | Failed paper crane resembling a napkin; soap resembling a potato; embroidered flower resembling a fried egg. | Not duplicate stories, but the repeated "made an object → resembles another object" joke risks feeling generated. Vary comedic mechanism. |
| LOW | **Reina / Shiori** | Both have found/pressed flower imagery associated with books. | Can remain if they express different motivations; verify the scenes do not appear close together. |

### Repeated player wording (not proof of duplicate scenes)

- `rpg_character_chats.js`: "What did you say?" is used for **Hana, Reina, Iris, Sierra, Barb**; "What happened?" for Shiori/Iris; "That sounds frustrating." for Camila/Elena; "What did you do?" for Marina/Jun; "How did she take it?" for Elena/Sierra.
- `rpg_everyday_chats.js`: examples of cross-character reuse include "Are you wearing it?" (Nereo/Sol), "Did you make it?" (Hana/Teo), "Did you get bored?" (Hana/Marina), "What will you do with it?" (Shiori/Iris), and "How did it turn out?" (Shiori/Sierra).
- **Do not ban natural questions globally.** Flag them only when combined with a matching premise, emotional arc, or punchline.

## Systemic risks

1. **Shared conversation cadence:** a large number of everyday scenes follow NPC anecdote → player question → answer → player question → punchline/reassurance. This is partly imposed by 3/5-line alternating arrays. Diversity of topics alone does not resolve it.
2. **The protagonist as interviewer:** repeated neutral follow-up questions obscure player personality and relationship history.
3. **Interchangeable stakes:** trivial discoveries, wholesome kindness, beginner reassurance, slightly embarrassing craft mishaps, and affectionate closure can recur without changing what the player learns.
4. **Same-function stories across characters:** two scenes may have zero shared text but both perform the same narrative job (e.g. "secretly soft competitive person," "unexpectedly charitable merchant").
5. **Mood flattening:** a good mixture includes awkwardness, friction, rivalry, genuine mistake, silence, excitement, practical favors, and unresolved ambiguity — not only warm punchlines.

## Future dialogue and event-generation rules

### Distinct-scene test (mandatory before drafting)

For each scene, record: **NPC(s), unique premise, setting/prop, relationship stage, conflict or desire, surprising turn, emotional endpoint, prior-event callback, character revelation, player agency, and whether it uses a shared trope**.

Before accepting a scene, compare its one-sentence beat against **all other NPCs**, not just scenes for the same NPC. Reject if it shares **two or more of:** (1) distinctive object or situation, (2) same protagonist prompt, (3) same conversational turn, (4) same emotional function/punchline — unless the resemblance is an intentional cross-character callback with explicit payoff.

### Dialogue shape menu (rotate; do not force everything into 5-line Q&A)

- **Disagreement / negotiation:** NPC and player want different things; ending is a compromise or lingering tension.
- **Shared action:** repair, sort, test, cook, practice, walk, investigate, design or build something *during* the conversation, not just recount it.
- **Callback / consequence:** a past player choice or NPC scene changes the present exchange.
- **Unexpected interruption:** another character, event, tournament result, or environmental detail redirects the talk.
- **Two-way vulnerability:** the player offers a concrete opinion, confesses, jokes, teases or takes a small risk.
- **Character-driven humor:** irony, dry observations, deliberate mischief, playful provocation, understatement; avoid relying on "object looks like other object."
- **Misunderstanding and repair:** a mistaken assumption causes friction, followed by recognition or an imperfect apology.
- **Competence revealed:** character demonstrates a real skill, rather than narrating that they have it.
- **Quiet/sincere moment:** subtext, restrained response, or meaningful silence.
- **Decision with cost:** an event challenges a value or leads to a persistent consequence; strongest for rank-up route scenes.
- **Multi-character triangle:** two NPCs conflict or collaborate in a way that reveals how they see each other and the player.
- **Competitive/TCG-specific:** tactical dispute, deck-building trade-off, tournament logistics, fair-play controversy or personal reaction to winning/losing. Avoid universal "good match" compliments.

### Character voice anchors (starting points, not rigid stereotypes)

| NPC | Favor | Avoid |
| --- | --- | --- |
| Hana | Responsibility, caring for newcomers, overcommitment, shop-community specifics | Generic kindness with no personal cost |
| Reina | Competitive pressure, sharp directness, respect earned in play, guarded tenderness | Making every reply a generic insult or hidden-softie twist |
| Shiori | Thoughtful inference, literary nuance, measured choices | Every conversation about a book or calm advice |
| Yuna | Showmanship, improvisation, mischievous risks, bold reactions | Random chaos without purpose |
| Akari | Analytical curiosity, models that fail against emotion, carefully chosen admissions | Every joke being "I calculated X" |
| Camila | Negotiation, collecting, self-interest vs generosity, theatrical confidence | Every interaction becoming a transaction |
| Marina | Physical routine, waterside experience, patience, self-directed decisions | Only poetic river imagery and reassurance |
| Kaede | Blunt challenge, mobility, ambiguity, rivalry and competence | Repeatedly saying she is hard to understand |
| Jinx | Playful edge, surprise, musical or personal interests **only when distinct** | Reusing Rina's nostalgia/music-box premise |
| Rina | Performing, audience awareness, music-making and performance pressure | Reusing Jinx's found-music-box premise |
| Barb | Design craftsmanship, assertive humor, individuality, practical affection | Defaulting to sewing-lesson anecdotes shared with Elena |
| Laca | Lifeguard competence, physical confidence, impulsive banter, shifting work/private selves | Generic handmade-object mishap jokes |
| Sol | An individual point of view and hobbies distinct from the ensemble | Reusing Nereo's bracelet story or generic wholesome mishaps |
| Nereo | Quiet relational detail with a personal choice or consequence | Another child's-gift scene identical to Sol |
| Alma / Iris | Different motivations and roles around reading/community | Both being used for anonymous book-swap stories |
| Other cast | Author a dedicated voice card with goals, anxieties, humor, relationships and 3 banned recycled premises | Transferring another NPC's established anecdote |

### Route events vs repeatable chats

- **Repeatable everyday:** low-stakes novelty; can be 3–5 lines, but should leave one distinct sensory, comedic, or personality detail. Do not imply untracked persistent relationship changes.
- **Character chats:** showcase voice and an internal contradiction, not just a trivia item. Allow character to ask the player something meaningful or react to a specific viewpoint.
- **Main/rank-up events:** each event should change the relationship or situation; give it a unique conflict, choice that matters, continuity with earlier ranks, and a plausible bridge to the next event. Do not reskin the same confession/comfort/compliment scene for different NPCs.
- **Group chats:** characterize the *relationship between NPCs*, not just one character with another standing nearby. Favor distinct alliances, disagreements and revelations.
- **Side quests / season:** provide stakes and local/world change, not redundant romance progression; preserve quest flags and duel handoffs.

### Suggested scene metadata (planning notes; not required game schema)

`{ npc, scene_id, tier: "everyday|character|route|group|quest|season", premise, motif_tags: [], function_tags: [], beat_pattern, voice_notes, player_role, continuity_refs: [], avoid_similar_to: [], consequences: [] }`

Store this in an editorial inventory or script comments; **do not alter the runtime schema** without dedicated tests.

## Repeatable QA checklist for new batches

1. Search **exact and normalized** text across all authored dialogue modules (strip punctuation, case, smart apostrophes, extra whitespace).
2. Compare **scene-level** similarity: full lines; opening hook; rare-noun/prop overlap; temporal beats; emotional resolution. Review flagged matches manually.
3. Track **trope quotas** by NPC and across cast: found object, child gift, public kindness, cooking/craft mishap, old song, plant, library exchange, embarrassing accident, compliment-after-duel.
4. Check **voice attribution blind**: without speaker IDs, can an editor identify the NPC? If multiple voices fit, rewrite.
5. Check the **player's role**: add opinions, specific choices, callbacks or action rather than two generic interrogative prompts.
6. Test **route continuity**: prerequisites, names, known facts, stat/romance thresholds, multi-romance support, choices and consequences.
7. Test **implementation** after changes: preserve IDs, speaker names, event timing, counts, 3/5-line constraints where enforced, artwork hooks, flags and reward effects; run existing `validate()` exports and RPG tests.
8. Record decisions in an **accepted overlap** list (shared locations/common concepts are fine) to avoid repeatedly flagging intentional motifs.

## Recommended edit backlog (do not auto-apply)

**P0:** Rewrite one of Nereo/Sol's bracelet conversations; replace a whole premise, not surface words.

**P1:** Differentiate Jinx/Rina music boxes; review Alma/Iris book-swap; reduce stock protagonist questions that occur inside similar beats.

**P2:** Review craft failures across Akari/Sol/Laca and sewing overlaps Elena/Barb; keep if they reveal substantially different traits.

**P3:** Make a complete **per-event route inventory** for main + guest packs, side quests, seasonal events and dialogue extension hooks. Read every branch/choice, compare dramatic function (not just lexical similarity), and identify scenes that fail to advance character arcs. This module-wide editorial task is not completed by the initial 594-chat automated comparison.

## Working principle

**A unique dialogue is not just different words. It gives *this character* a reason to say something *here*, produces a response only *this protagonist/relationship* would make, and moves the moment somewhere a different NPC's scene would not.**
