# Neo Harbor — G1 Contextual Daily Planner

**Gameplay owner:** RPG systems, not the narrative or Classic TCG agents.  
**Implemented:** 2026-10-18 on `feature/rpg-contextual-daily-planner-20261018`.

## Player experience

The top of the RPG sidebar now offers up to **three verified recommendations**, in priority order, instead of making players search a very long list of people, events and activities. The planner is entirely optional; all existing controls remain.

- **Most urgent first:** booked meet-ups taking place this period, then deadlines and currently playable cups/events, personal stories, side quests, local encounters, and activities.
- **Upcoming with clear timing:** alerts for a meet-up one period away, cups opening soon, and fully eligible personal/side-quest opportunities that expire later today. These alerts have **no action button**: the game must first advance naturally to the correct time.
- **Relevant to a daily priority:** an unfinished social, dueling or town intention modestly raises related options, without over-riding imminent commitments.
- **No fake NPC teleporting:** available NPCs are drawn from the same weekly schedules and authored event/appointment overrides as the town scene; new narrative-agent characters are supported without editing planner code.
- **No inaccessible actions:** venue activities are checked for money, focus, location and daily limit; story suggestions satisfy existing prerequisites, relationship and time gates. Side quest steps, official tournament brackets and exhibition events are also verified from the owning modules.
- **Safe shortcuts:** “Go to…” changes only the location using existing free travel. “Show me where” points toward the existing actionable panel if already at the venue. Neither action consumes time, spends credits, grants affection, starts a match, completes a meeting or resolves a scene.
- **Quiet in locked scenes:** during an ongoing duel, VN conversation, encounter or side quest, the planner shows a short “Finish your current scene” message rather than clickable options. The 90-day ending also suppresses suggestions.

## Technical contract

Source: `rpg_daily_planner.js` exports `NeoRpgDailyPlanner` and CommonJS equivalents.

```js
const suggestions = NeoRpgDailyPlanner.recommend(state, {
  schedules, appointments, story, side, world, tournaments,
  intentions, arc, cast, places, eventCards
});
```

Each suggestion is `{id, kind, priority, place, day, slot, title, detail, timeCost, timing, focusId, action}`. `timing` is `now` or `upcoming`. `action` is `travel`, `view` or `none`.

**Purity:** existing RPG engines hydrate/normalize/mutate state on read, so the planner uses a JSON snapshot before calling them. It never writes to the live `neoHarborRpgV1` save or creates planner-specific save fields. It uses the player’s real day/slot and existing public location list.

**Spoilers:** only fully eligible personal opportunities are recommended. Upcoming personal stories and rivalry chapters are described generically; locked story route titles are not shown. The JavaScript client remains inspectable, as before; this is UI spoiler protection, not a server secrecy guarantee.

**No race with narrative agent:** the controller has a small adapter (`plannerDependencies`) with references to current cast and authored modules. The narrative agent can continue adding schedules, stories, and NPCs independently; do not hardcode its individual quests in the planner.

## Regression and acceptance

Run `npm run test:rpg`; it includes `tests/rpg_daily_planner.test.js` covering pure read-only behavior, high priority appointments, absence of phantom NPCs, cup timing, low resources, and all **270 periods across a 90-day season**. Existing simulated browser UI tests verify that suggestions navigate without consuming time or creating a pending duel, and that an appointment remains booked until the player attends it. The hosted JS is explicitly allowlisted and covered by HTTP integration tests.

Run the full RPG Chromium smoke (real Classic engine match and reload) before merging. This integration does not modify duel rules, duel identity, NPC reactions, CPU difficulty, social rewards, or story dialogue.

## Next roadmap step (G2)

Introduce optional character-specific **activity affinity metadata**, authored by the narrative agent but resolved by a common social interaction engine: preferred and neutral locations, favorite activity categories, friendship/romance tone choices, and sensible per-day pacing. Preserve existing unique routes and appointments; no infinite zero-time bond farming. Ensure companions behave differently without forcing players into romance or repetitive grinding.
