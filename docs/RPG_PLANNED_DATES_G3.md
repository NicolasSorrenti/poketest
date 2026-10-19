# Neo Campus RPG — G3 Planned Dates and Meaningful Meet-ups

**Owner:** RPG gameplay systems. Implemented on 2026-10-18 as a discrete change from character/story/TCG agents. No adult/explicit art is created or required in this feature.

## Player-facing flow

The player meets a scheduled NPC in a public location. The normal **Invite to a future meet-up** option remains, including its existing free booking flow and legacy rewards. A new option, **Plan an activity or date**, offers:

1. **Reserve a real time and place.** Choose among the same three upcoming days/periods that the original appointment service verifies against NPC schedules. No invented locations, no forced NPC teleportation. Scheduling is free.
2. **Choose what to do together.** Select one of the three G2 social activities at the selected location, with affinity and costs clearly labeled. A choice such as a riverside walk is only offered if the date is at Riverside Park.
3. **Choose the social tone**, explicitly:
   - **Friends** — warm, supportive experience. An available familiar/favorite shared activity may produce one extra trust, but no forced romance.
   - **Friendly challenge** — playful or tactical/competitive activity; adds a little respect.
   - **Romantic date** — available only when affection is at least 4, trust at least 2, the activity is suitable (quiet, creative, playful, collecting or adventure), and the player isn't committed to someone else. The NPC verbally agrees to the appointment in the UI. Adds just +1 attraction and **never** sets `partner`, `routeOutcomes`, or unlocks romance story scenes prematurely.
4. The **Upcoming Plans** panel displays the booked tone, activity and cost. The G1 daily planner knows the planned experience and reminds players of the date/venue and on-arrival resources.
5. Attend at the correct period/place while the NPC is actually present. **One period and the G2 activity's Focus/Credits are charged at attendance, not booking**. A missing resource prevents the action and doesn't secretly spend it. Character-specific reactions come from existing G2 metadata.
6. An attended date updates the journal, optionally fulfills the social daily intention, and feeds matching previously planned **appointment/hangout CG gallery triggers**. Missing art assets do not block the meeting or claim an illustration was generated.

## Actual systems, not fake scripts

- `rpg_planned_dates.js`: standalone UMD module, exports `tones`, `options`, `choices`, `allowedTone`, `book`, `attend`, `canAttend`, `hydrate`. Only owns the orchestration of G2 activities and the old appointment booking API; no duplicate TCG or character story implementation.
- `rpg_appointments.js`: backwards-compatible `attend(..., {grantRewards:false})` to avoid stacking the old +2 affection/+1 trust **on top of** the G2 activity rewards. Calls without the fourth argument behave exactly as before. Failed attendance is validated *before* mutation.
- `rpg.js`: additive options/handlers `dateInvite`, `dateSlot`, `dateActivity`, `dateBook`. Actions validate schedule/activity/tone **again when booked**. The old `invite`, `book`, `attend` route remains intact.
- `rpg_daily_planner.js`: a booked planned date appears by social tone and includes the expected activity cost; all suggestions remain read-only.
- `server.js` and `rpg.html`: explicit JS allowlisting and browser script load; no broad public file serving.
- Existing `neoHarborRpgV1` browser save key is unchanged. Optional `activityId` and `socialTone` fields live on existing appointment records, so G1 planner, journal, expiry and save/reload remain compatible. Invalid old appointment extensions are repaired to legacy meet-ups.

## Rules and consequences

- All real appointments keep the existing 3-pending-meeting cap, 6-day planning horizon, one future booking per NPC, and cooldown between successive attended meetings.
- Attending any meeting cannot stack with a same-day hangout (G2 shared activity or generic original).
- An appointment skipped until after its time becomes **missed once**, reducing trust by 1 using the existing provider. Future dating activities cannot be redeemed after expiration.
- Date eligibility is checked during booking **and** attendance. If trust/relationship circumstances change, the chosen romantic plan cannot be silently transformed into something else; the UI identifies the issue instead.
- Romance stays optional. Friendly or competitive paths remain fully viable even when affection is high.
- No official card rules, CPU decision logic, tournaments, multiplayer or authored NPC arc content were changed.

## Art agent contract

No images were generated in G3. A booked outing can unlock any existing hangout CG already tied to that NPC, time and location, *only when it is actually attended*. If the image file is missing, the gallery uses its established placeholder. For later date-specific illustrations, art agent should request new separate `cg/<id>.webp` briefs and the gameplay agent should add them to the existing CG catalog with an explicit, reachable condition, rather than pretending existing images are new.

## Acceptance & QA

- `tests/rpg_planned_dates.test.js`: 18 domain regressions covering friend/rival/date choices, calendar slot integrity, resources, missed plans, old-save fallback, idempotence, social anti-grind and 90-day viability.
- `tests/rpg_world_ui.test.js`: real conversation, booking and attendance, cost/affection tests, explicit romantic gating, and legacy controller regressions.
- `tests/rpg_integration.test.js`: verifies the new module's HTTP route.
- Run `npm run test:rpg` and **RPG Chromium smoke** before merging. The browser smoke exercises the real Classic duel path to ensure the social module didn't break it.

## Next milestone: G4, richer pre-duel social context

Special NPC matches should show a location/cast-specific CG before the player can act and then seamlessly start the real match, without creating a second duel session or blocking on missing art. Add opt-in skip/replay to CG moment previews, meaningful wager/event copy, and reload-safe transitions. This remains outside the Pokémon battle rules and narrative agent's authored stories.
