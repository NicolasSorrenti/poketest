# RPG / VN Agent Status — 2026-10-17

## Ownership
Owns `rpg.js`, `rpg_story.js`, `rpg_schedules.js`, related RPG UI and tests. Does not own TCG rules or card effects.

## Repo baseline reviewed
The RPG already has 90-day/three-slot time progression, seven locations, browser save state, 32 authored story scenes, romance commitment checks, a duel bridge and event exhibitions. The existing NPC availability check relied on broad per-character location/slot/weekday sets, rather than an actual single location at a time. Many systems remain prototype-level: tournament brackets, collection economy, full endings, and competitive signature decks.

## Priority plan
1. **Implemented this milestone:** deterministic seven-day, three-slot itineraries for all eight established adult characters, gated Kaede arrival, fourth-week routine changes, special-story overrides and a future-visit inquiry in dialogue.
2. Next: location-specific encounters and schedule-sensitive optional activities, with regression tests.
3. Next: complete a deeply branching character arc with duel consequences and chapter outcomes.
4. Next: bracketed tournament progression, win/loss consequences, persistent standings.
5. Next: shop, collection, packs and activity economy, then endings and NG+.

## Integration contract
`rpg_schedules.js` exports `NeoRpgSchedules` in browsers and CommonJS. API: `locationFor(npc,day,slot,events)`, `peopleAt(day,slot,place,events)`, `itinerary(npc,day,events)`, `nextVisit(npc,day,slot,events,horizon)`, `validate()`. Public locations exclude `home`; events may override normal routines. `rpg.html` loads this after `rpg_story.js` and before `rpg.js`. `server.js` permits only the new named JS file, not arbitrary script access. Existing browser save key `neoHarborRpgV1` is unchanged and no migration is necessary.

## QA and caveats
Syntax checks and deterministic schedule scenario checks were performed. Added `tests/rpg_schedules.test.js` for day/slot coverage, story override, arrival gate, public location restriction and next visits. Full browser and live-duel end-to-end checks remain outstanding. This is a **schedule milestone**, not a claim that the entire RPG is complete.

## Next-agent handoff
Inspect current main before editing, especially recent duel bridge and asset commits. Keep authored character bios and dialogue unchanged. Build from the schedule API rather than adding ad hoc per-character day filters. Add save-safe interactions and regression tests. Use feature branch → PR → squash merge, and update this file on each RPG milestone.
