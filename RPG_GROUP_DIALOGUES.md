# Neo Campus RPG: Ambient Group Conversations

## What changed

The RPG already had multi-speaker dialogue rendering in story and side-quest scenes, including a scene-cast display that shows only participants. Ordinary `Talk` previously selected a scene for just the clicked NPC and did **not** invite co-located friends into the conversation.

This change adds `rpg_group_chats.js` and passes the actual `currentPeople()` location roster into the same pure Talk selector on both the character-click and Talk-button paths. No alternative dialogue UI is created.

### New authored content
- 66 additional character-specific everyday conversations, **three per NPC**, for a new total of 19 casual and 4 personality-specific solo conversations per character.
- 28 authored group conversations with **14 groups**: 12 pairings with two NPCs, plus two small gatherings involving three NPCs and the player.
- All group interactions are seven dialogue beats with real character speaker IDs. Scenes include Reina/Yuna arcade rivalry, Jinx/Luna rhythm-game banter, Hana/Camila negotiations, Nereo/Marina dock disputes, Teo/Jun event commentary, Rina/Sierra public-image stories, and three-person exchanges.

Total authored Talk catalog: **534 conversations and 2,466 spoken lines** across 22 NPCs and group interactions.

## Hard eligibility rules
- Only triggered in regular repeat **Talk**, never first greetings, mandatory scenes, story scenes, contextual reactions, or appointment invitations.
- A group scene may be selected **only** if the clicked NPC and *every participating NPC* appear in `currentPeople()`, using the world's actual day, time slot, schedules and story appointment overrides.
- The player must have **already met** every participant; these conversations cannot introduce a character early.
- Private or account-specific character access is inherited from the server-filtered cast and attendee roster. A hidden/private NPC cannot be conjured by a group line.
- Deterministic selection is occasional (approximately one third of otherwise eligible repeat Talk interactions when a group is present), with two authored variants for each group. Otherwise, the solo conversation bank works exactly as before.
- These are conversations only: no affection, reward, clock, duel, romance flag, save schema or CG change. Chosen lines render through the existing `sayConversation` engine and the `rpg_scene_cast.js` speaker-aware composition.

## Validation
- `tests/rpg_group_chats.test.js` tests group integrity, missing introductions/attendance, deterministic/no-state-change behavior, and availability of both variants of every group at real scheduled co-locations across the 90-day campaign.
- The existing everyday test bank was updated from 16 to 19 scenes per NPC; all new solo scenes are reachable during the campaign.
- The RPG regression command now checks the new script and runs the group test.

## Caveats
- Group chats do not alter relationships or remember what was said, and can repeat if the player keeps talking to the same character in the same time slot.
- Story and reactive event precedence is intentionally maintained; a character who has an important invitation or reaction will present that before ambient cross-talk.
- Existing character schedules are not changed to force certain NPCs together. Some combinations (for example, account-specific character pairs that never share a location) receive no invented group scene. The system can accept further authored groups if their schedules genuinely overlap.
- Full runtime CI and browser smoke must still be checked before merging/deploying.
