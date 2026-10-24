# Neo Campus RPG: Everyday Dialogue and Group Interactions

## Updated content
- **462 everyday conversations** (21 for each of the 22 currently supported cast IDs).
- **88 personality-specific conversations** (four for each character).
- **56 group conversations**, four distinct seven-beat exchanges for each of 14 groups: 12 two-NPC groupings and two three-NPC gatherings.
- **606 authored Talk conversations, 2,882 spoken lines** altogether.

The newest addition provides **44 more solo conversations and 28 more group exchanges**, favoring natural interactions, modest discoveries, emotional subtext, friendship and work concerns over repeated one-note jokes or generic character exposition.

## How group conversations work
Existing story and side-quest dialogue already supports more than one speaker; `rpg_scene_cast.js` automatically limits visible portraits to participants in the dialogue. `rpg_group_chats.js` now uses that same presentation path for ordinary **Talk**, without a new dialogue system.

Group dialogue can occur only when:
- The clicked NPC and every guest NPC are all present according to **the same schedule query** for the current day, time period and location.
- The protagonist has already met every character in the exchange.
- Higher-priority story events, social invitations, character reactivity and slice-of-life encounters have not taken precedence.
- The optional deterministic group-selection check chooses a group scene.

Group scripts do not award anything or change time, save data, relationship stats, romance flags, or event progress. Their text is spoiler-safe and assumes no earlier group scene has been heard.

## Normal-day crowd balancing
`rpg_schedules.js` now balances the available cast across the existing six public locations, with a **four-NPC normal occupancy ceiling** per location. It applies the same mapping to `locationFor`, `peopleAt`, `itinerary`, and `nextVisit`, so no UI or game system uses a different routine location for an NPC.

- Each NPC keeps their usual daily schedule as the first choice; only overflow is redistributed.
- A role-aware preference retains expected workplaces or favorite venues where practical, rather than dispersing everyone arbitrarily.
- Co-present pairs with authored interactions have a **soft stay-together preference**. It never overrides the location cap but keeps all group variants accessible in the 90-day campaign.
- A formerly synchronized fourth-week deviation now affects only a subset of characters, so it no longer funnels nearly everyone into the park on the same afternoon.
- **Appointments, authored story events, and their participant overrides are pinned** to their specified locations. When an event draws more than four NPCs into the same place, the normal occupancy ceiling is relaxed for that event.
- No new locations, time periods, travel costs, quests, story flags, or account-access exceptions were introduced.
- The redistribution is stable on reload and is cached for ordinary (non-event) day/slot lookups.

## Verification
- 90-day × 3-period simulation: **no ordinary public location exceeded four present NPCs**. The former template produced at least one group of five or more during 217 of 270 periods and peaked at 15.
- Repeated the occupancy and dialogue-rotation simulations with the **server-filtered, account-exclusive Barb pack** added to the normal 21-character generated roster: 22 characters, the same four-person public cap, and all 56 multi-character variants reachable. Group rotation uses a three-day stride to avoid synchronized schedules hiding individual scenes.
- Group-conversation reachability: **all four variants of all 14 groups remain playable**, with exact NPC presence and introductions enforced.
- All 21 everyday topics and four voice-specific topics remain valid for every NPC; the actual 90-day casual rotation exposes all 21 new everyday topics.
- Added scheduling regression tests for the four-person limit, stable lookups, arrivals, deterministic visits, six-person event overrides and compatibility with event locations.
- Updated group and everyday conversation tests and retained their registration in the RPG regression command.
- Content structure and JavaScript syntax checks passed. Full Node/Chromium CI checks must be inspected separately before merge.

## Design caveats
These are authored casual conversations, not independent quests, and they do not remember dialogue selections. Repeating Talk with the same NPC in the same daypart can still repeat the same script. Crowd balancing is designed for the currently loaded character roster and its six public venues. A very large future cast might require an additional offstage/at-home policy instead of filling every venue to capacity.
