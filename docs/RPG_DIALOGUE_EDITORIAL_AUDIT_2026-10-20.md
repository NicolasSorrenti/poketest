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

## Second milestone: narration-led legacy stories (2026-10-20)

The eight original heroine routes have now been rewritten, **32 of 32 chapters**, in `rpg_legacy_scenes.js`. Each chapter uses a compact staged exchange: narrator setting, specific character dialogue, protagonist response, another revealing beat, and a choice anchored in what actually happened. Characters are not required to describe their own gestures or recite the moral of the scene. The old generic two-line expansion is bypassed for these fully authored chapters.

Updated the live story graph, RPG HTML script order, server allowlist, and VN styling so `Narrator` lines display as descriptive text. Original IDs, windows, relationship increments, friendship/romance branch kinds, and save state shape remain untouched. All 32 scenes have regression checks for choice compatibility and script loading.

The first scenes of **Elio, Alma and Nereo's three side quests** also gained stage descriptions rather than expository dialogue; the existing quest reward and progression machinery stays unchanged. Additional supporting-quest scenes remain editorial candidates.

Future content is now governed by the narrator/subtext guidance in `docs/rpg-natural-conversations.md`, inspired by Persona 4's social-link presentation without copying dialogue or events.

The latest code-level integrity check loaded 32 stories through the actual modules, verified their narration and choice metadata, and reported no authoring-schema errors. Full browser and regression workflow status should be checked from the latest GitHub Actions run, since other UI changes were concurrently landing on main.

## Third milestone: supporting cast, world events and everyday conversations

- Rewrote **all nine** stages of Elio, Alma and Nereo's supporting side quests, while keeping each stage's six-line footprint, event IDs, original choice flags, duel rewards and branch conditions. The ensemble scenes use other NPCs' comments where a redundant second narrator beat would slow the exchange.
- Rewrote **26** side-quest choice responses and conditional callbacks to respond to specifics rather than abstract lessons.
- Rewrote **all six season-wide mandatory events** as short town vignettes, preserving flag effects and the three actual-results tokens in the season closure.
- Rewrote the **Rina and Sol earned bond invitations**, retaining their four-line save index, remote-or-present delivery behavior, event triggers and neutral-decline flags. Their text works both spoken and as a message.
- Revised **24 everyday topics and their 24 matching exchanges** for Hana, Reina, Shiori, Yuna, Akari, Camila, Marina and Kaede; revised **18 everyday topics/exchanges** for Elio, Alma, Nereo, Jun, Teo and Iris.
- Found a dialogue-source precedence bug: the original six guest characters' newer topic-specific dialogue was unintentionally overridden by stale supplemental arrays. Changed the merge so explicit maps always win, and added a dedicated regression test. This is a live behavior fix, not merely a text edit.
- Adjusted the mandatory event renderer to attribute season replies to their actual NPC, and label earned bond replies as messages **only if the character is remote**.
- Added dedicated prose/metadata regression checks in `tests/rpg_editorial_consistency.test.js` and updated the house style in `docs/rpg-natural-conversations.md`.

**Verification:** content modules parsed and the character-pack and season-event data were synchronized with generated files. The full GitHub Actions **RPG Regression Suite passed** on commit `c7b9778737baeaa80acb44293d32131b360dc072` ([run 39430094392](https://github.com/NicolasSorrenti/poketest/actions/runs/39430094392)), including the mandatory-event scheduler, JSON character-pack checks, and narrative/UI regression tests. No claim is made that every incidental tooltip, battle bark or image-prompt caption has received line-by-line signoff.

## Fourth milestone: battle dialogue, special moments and everyday world prose

- **All 20 current battle opponents** now have seven distinct short cut-in lines: attack, card play, evolution, Pokémon Power, damage, knockout taken and knockout scored (**140 authored reactions**). We retain the existing 5–6-reaction director limit, priorities, and portrait-safety logic.
- **All 20 pre-duel previews** have individual NPC openings plus concise context for cup, friendly, rivalry and side-quest matches; existing save-compatible two-line previews and duel-confirmation gates remain unchanged.
- **All eight optional situational scenes** received more specific setups and direct character responses. Opening descriptions are attributed to Narrator in the live UI, not to an NPC speaking in third person.
- **All 22 ambient town encounters** now use concrete environmental setups. NPC responses are conversational; non-NPC outcomes remain narrator prose. Preserved encounter windows, prerequisite cup outcomes, choice deltas, completion IDs and save keys.
- **All 14 repeatable town activities** now report tangible details rather than moral conclusions about friendship, preparation, or personal growth. These are always narrated, even when an NPC happens to be present.
- **All 20 RPG characters** now have character-specific post-duel memories and acknowledgements in `rpg_reactivity.js`, with supporting cast no longer falling back to one shared template. Character packs still take precedence for their own authored final victory/defeat barks.
- **Response UI:** route, mandatory-event and supporting-quest choices preserve the final authored spoken line, instead of switching to an artificial "How will you respond?" or "What would you suggest?" speech bubble.
- Avoided invented details in post-duel dialogue: outcome-only history does **not** prove which Pokémon, Trainer, Switch or knockout was played. Reactions describe plausible character responses to the verified result, not an unsourced turn-by-turn recap.
- Added regression coverage for battle voice completeness, pre-duel distinctness, natural special-scene responses, correct narration ownership and preserving the actual final line during decisions.

A full successful RPG regression run at commit `018a81cba93519f93fe1f813d3714d68ff300049` is recorded in [GitHub Actions run 39437392722](https://github.com/NicolasSorrenti/poketest/actions/runs/39437392722). The final narrator-ownership and activity/encounter tests also **passed**, in [run 39437564357](https://github.com/NicolasSorrenti/poketest/actions/runs/39437564357) at commit `76a2d817d3aea477cb514d4f92d94dd84466269c`.

## Fifth milestone: meaningful bond chapters, crossovers and consistent relationship outcomes

**Now implemented on main:**
- **Five guest romance finales:** Jinx, Luna, Rina, Elena and Sierra now offer clearly differentiated friendship (`friend`), romantic commitment (`commit`) and open-ended (`honest`) choices in their chapter-five scenes. The historic option indexes, choice flags, relationship deltas and prerequisites are unchanged, so conversations and dependent conditions retain continuity.
- **Recorded relationships:** `rpg_story.js` now applies the friendship outcome when `choice.kind === 'friend'`, records `partner` and romance only on an explicit `commit` option, and rejects attempts to commit to another partner. An older save with exactly **one** compatible previously completed guest romantic option can recover that relationship; ambiguous multi-romance saves and existing partner choices are left untouched.
- **Supporting depth:** All **15** bond/guest chapter scenes in `rpg_bond_chapters.js` now have natural speaker-to-speaker exchanges with concrete stage directions. All 30 choice responses and 18 prior-choice-specific opening lines were tightened. Save-index-sensitive chapters retain five lines and all event metadata.
- **Guest crossovers:** The four character-pack Jinx/Sol crossover scenes with Alma/Marina now use genuine ensemble dialogue and short Narrator beats. They preserve the earlier choice's opening variant, and avoid giving Jinx's dialogue to Marina or Alma.
- **Native supporting stories:** `rpg_narrative_pack.js` now has **nine** revised Jun/Teo/Iris chapters and **eight** original-cast crossovers, with descriptions and grounded conversations. Their 34 branch responses no longer read like moral summaries. All 17 retain six-line staging, scene IDs and choice metadata.
- **UI text:** Reina's rivalry choices now stay anchored to her actual preceding dialogue. Centered story/quest/situational response choices no longer show redundant duration and focus-cost clutter. Activity and chapter journal entries avoid speculative statements about emotional growth.
- Added comprehensive regression tests for five finale commitment choices, old-save migration, branch exclusion, narrator staging, previous-choice-specific opening variants, native guest continuity, and VN decision copy.

The **full RPG Regression Suite passed** after the relationship, supporting scene, crossover and UI edits: [GitHub Actions run 39441782081](https://github.com/NicolasSorrenti/poketest/actions/runs/39441782081), commit `b93a7a7e5af67b6e8c79b5b832b38b3cee2a2b82`. This covers character-pack generation checks, mandatory-event behavior, save/load checks and the new editorial assertions.

The remaining work is a final long-tail audit of labels, ambient tooltips, edge-case dialogue variants and consistency across other independently maintained UI features. Official TCG card texts must remain canonical because they drive game mechanics.

## Relationship continuity and dialogue-completion follow-up

This subsequent editorial pass revisits the deeper supporting stories and crossovers specifically for **line-to-line causality** and the rule that characters should not announce actions already visible to the player.

- Revised all **15** supplemental bond and guest chapters in `rpg_bond_chapters.js` while retaining their five-line save/resume positions, IDs, choices, kinds, flags and rewards. Corrected the **nine** sets of previous-choice opening variants so the next protagonist line responds to the correct event.
- Revised the **eight** original-cast crossover scenes in `rpg_narrative_pack.js`; fixed Shiori's scheduled community-center scene, which was previously staged in a library.
- Revised all **four** Jinx/Sol crossovers in the source character packs, then synchronized `rpg_character_packs.generated.js`. These include physically plausible blocking, different motivations for the two NPCs in a scene, and specific replies to the player's choices.
- Confirmed the five guest romance endings already have explicit `friend`/`commit`/`honest` choices plus a conservative legacy-save recovery path. Added regression coverage in `tests/rpg_story.test.js`; no romance mechanics were needlessly overwritten.
- Fixed a separate repeated-dialogue bug in `rpg.js`: after the player reads the chosen reply and finishes a story, side quest, town encounter, rivalry scene or situation, that exact line no longer plays a second time. Chapter rewards remain in the journal and display as a brief notice.
- Added `tests/rpg_crossovers_editorial.test.js` and browser-facing completion checks to verify crossover speakers, previous-choice variants, branch flags, pack bundle synchronization and clean scene endings.

The prose has been validated with the RPG regression suite. No claim is made that every peripheral tooltip and battle-system string has received a complete in-browser review.

## Remaining priority findings

### Resolved — five guest romance finales are recorded correctly

Finale index 1 is now an explicit romantic commitment and index 0 is an explicit friendship branch for Jinx, Luna, Rina, Elena and Sierra; the third remains open-ended. Old-save romance recovery is deliberately conservative. The behavior has dedicated regression coverage in `tests/rpg_guest_romance.test.js`.

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
