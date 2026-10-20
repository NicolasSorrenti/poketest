# Neo Campus / Neo Harbor — dialogue and UX copy editorial audit
_Date: 2026-10-20 · Branch: `main` · Scope: player-facing RPG/VN dialogue and interface text_

## Executive assessment

**The most visible problem was not spelling.** Many scenes sounded like a character explaining their intended arc to the player rather than speaking from a specific situation. Several character packs repeated "you see the real me" beats, and the original guest-character daily conversations could concatenate an unrelated character statement after a generic question. This pass prioritizes believable responses, specific stakes, a distinguishable voice for each cast member, accurate TCG language, and compatibility with existing story identifiers and save files.

This is an editorial **audit plus targeted rewrite**, not a claim that every string in the repository has received individual human copyediting. The repository also contains game-engine code, test fixtures, historical Pokémon TCG card databases, authored specifications, art metadata, and developer docs, which are different audit surfaces.

## Player-facing source inventory

| Surface | Primary source | Editorial concerns / status |
| --- | --- | --- |
| Character-pack story chapters (six guest characters) | `characters/{elena,jinx,luna,rina,sierra,sol}/stories.json` | All six packs inspected; 17 main route scenes rewritten; one crossover choice clarified |
| NPC first meetings, casual conversations, and hangouts | `characters/*/character.json`, `rpg_dialogue.js` and `rpg_conversations.js` | All six guest-character daily topics now have contextual four-beat responses; Luna/Sierra activity copy updated |
| Eight original character arcs | `rpg_story.js` | Structure and representative scenes inspected; remaining scene-by-scene deep rewrite not yet completed |
| Supporting cast and side quests | `rpg_narrative_pack.js`, `rpg_side_quests.js`, `rpg_bond_chapters.js` | Inspected for generic prose and conversational pacing; not fully rewritten in this pass |
| Crossovers, time passing, schedules, encounter outcomes | `rpg_reactivity.js`, `rpg_world.js`, `rpg_situations.js`, `rpg_social_activities.js`, `rpg_planned_dates.js` | Sampled for voice, emotional repetition and UI fit; follow-up copyediting remains |
| Main story beats and required events | `rpg_season_events.json`, `characters/*/mandatory_events.json` | Reviewed representative material for narrative consistency; remaining line-by-line polish |
| Cut-ins, preduel reactions, and epilogues | `rpg_match_reactions.js`, `rpg_preduel.js`, `rpg_epilogue.js` | Sampled; next-stage focus on shorter, punchier character-specific reactions |
| RPG labels and screen copy | `rpg.js`, `rpg.html` | Surveyed UI text and navigation labels; needs a separate accessibility/terminology sweep |
| Card descriptions and combat effects | `cards/*.json` and TCG rules sources | **Not editorialized**: historical card effects are canon/rules data; their wording must not be casually rewritten |

## Completed revisions

1. **Daily dialogue instead of topic roulette.** `rpg_dialogue.js` gained 36 four-beat follow-ups, six for each of Jinx, Luna, Sol, Rina, Elena and Sierra. These make the protagonist's next sentence responsive to what the NPC just said. The existing greeting, flirt, story and choice APIs remain intact.
2. **Luna:** five route scenes, 15 choice responses, six casual topics and five hangout descriptions revised. She is still accident-prone, but now her challenges involve organizing beginner night, a personally built deck, requesting permission before others step in, and learning from tournament outcomes.
3. **Sierra:** five route scenes, 15 choice responses, six casual topics and five hangouts revised. Her work matters and she does not have to renounce it. The route now uses concrete openings, disruption cards, a weak matchup, her own calendar decisions, and a believable dinner invitation.
4. **Rina:** three main route scenes and nine choice responses revised so music, band rehearsals, tournaments, and community events intersect instead of being two scripted identities competing for attention. A misleading reference to a 'Supporter' card was replaced with era-appropriate Trainer terminology.
5. **Jinx:** the introduction and finale now emphasize competitive chemistry rather than obligatory staring or a false claim about tournament placement. The wet-railing crossover choice now responds to what is actually happening in the scene.
6. **Elena:** two later chapters replace accountant-style statements about 'variables' with restrained, specific admissions and clear invitations. She remains precise without speaking like an expense report.
7. **Extended route dialogue:** `rpg_dialogue.js` insertions updated to reflect the new story beats for Luna, Sierra, Rina, Jinx and Elena; an invalid 'sideboard plan' Pokémon TCG reference was corrected.
8. **Generated assets:** `rpg_character_packs.generated.js` updated after every pack edit; scene IDs, story prerequisites, choice kinds and flags retained.

## Remaining priority findings

### High — finale outcomes do not match the romance writing

Five character-pack romantic finales — Jinx, Luna, Rina, Elena and Sierra — currently have only `support`, `honest` and/or `flirt` choice kinds. `rpg_story.js` records partnership when `choice.kind === 'commit'`, while Sol has an explicit `commit` and `friend` branch. Consequently, apparently romantic endings from those five packs are not mechanically recorded as committed relationships. This is **not fixed by the dialogue edits**, and needs a deliberate narrative-systems update, legacy save handling, and regression tests.

### Medium — voice continuity across content layers

An NPC's character bible, pack intro, six everyday topics, mandatory event, crossover, main route and duel barks should sound like the **same person** at different emotional stakes. Guest-route rewrites improve this, but supporting cast and legacy routes require the same end-to-end check.

### Medium — motivational/abstract language

Watch for repetitive lines such as 'I can be myself around you', 'no one ever asks me', 'you make me feel seen', 'you don't have to perform', 'this is what matters', and overly even therapeutic responses. Prefer revealing small behaviors, consequential disagreements, jokes, concrete TCG decisions, or silence. Do not simply blacklist compassionate dialogue: it can be appropriate when earned.

### Medium — choices must fit the preceding beat

A player choice should not invent a prop or action absent from the scene, force a flirt when the protagonist might reasonably refuse, or imply victory/romantic commitment that has not happened. Explicitly check the final line of the script, each option label, each reply, conditional `openingByFlag` branch, and any dialogue inserted by `rpg_dialogue.js`.

### Medium — period accuracy and gameplay terminology

The playable TCG period ends with Neo Destiny. Avoid mechanical references that belong to later eras (e.g., Supporter as a Trainer subtype, sideboards) unless referring to another concept in ordinary conversation. Keep rules text authoritative rather than casually rewriting cards.

### Low — UI copy pass

The RPG UI should consistently use concise labels for the same action, and never show a tooltip promising a relationship or time result that is different from the actual underlying action. Check mobile truncation, screen-reader labels, time-transition copy and duel-victory messages separately.

## Editorial acceptance checklist

- The speaker responds to the **previous line**, not merely the scene's overarching theme.
- The scene has a concrete physical setting, activity, conflict or observation instead of abstract exposition.
- Each NPC has a recognizable voice even with the speaker label hidden.
- Meaningful vulnerability is earned by circumstances; jokes and disagreement are allowed.
- The protagonist's personality is not forced into ogling, patronizing or overconfident responses.
- Every offered choice receives a reply that acknowledges that exact choice.
- Optional branches and crossovers do not assert plot outcomes that the system cannot guarantee.
- Speaker IDs, prerequisites, flag keys, choice kinds, IDs and generated registries remain stable unless accompanied by migration/test coverage.
- TCG terminology is period-appropriate.
- Run `npm run characters:check` and `npm run test:rpg`; check browser-visible rendering after editorial changes.

## Verification and limitations

The six character-pack JSON files and the checked-in generated registry were compared programmatically during this pass: **six packs, 34 pack story events, zero registry alignment differences**, and all story events retained populated dialogue, speakers, choice labels, replies and flags. This is a static content-integrity check, **not evidence that the game has been playtested**. The main branch's RPG regression GitHub Actions workflow is configured to run `npm run test:rpg` and `npm run characters:check`; verify its result for the final edit commit before treating the changes as fully regression-tested. A complete line-by-line signoff on every other textual subsystem remains a separate, measurable follow-up.
