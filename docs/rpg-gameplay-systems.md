# Neo Harbor — Gameplay Systems Direction

## Mission and ownership (2026-10-18)
Make the existing 90-day Pokémon TCG RPG feel like a playable hybrid of a card-game campus adventure and a relationship-driven social sim. This is **gameplay infrastructure**, not a rewrite of characters, dialogue, personal stories, or TCG rules.

The parallel narrative agent may continue editing `rpg_narrative_pack.js`, `rpg_story.js`, `rpg_side_quests.js`, character bibles and their dialogue. The gameplay systems agent should prefer independent modules and scoped controller hooks, keep save compatibility, and use the existing cast dynamically. Other agents own Classic card rules, CPU strategy and illustration assets.

## Design principles
1. **Three meaningful periods per day.** Travel and short chats remain free. Duels, longer socializing, personal stories and venue activities compete for limited time. Every costly action must indicate that cost before selection.
2. **No forced optimal path.** A collector, tournament grinder, social butterfly or mixed playstyle can reach a satisfying ending. Missing some events is part of the calendar, not a dead end.
3. **Characters have their own lives.** Location-based activities, existing weekly routines and scheduled meet-ups should intersect with relationship opportunities, not teleport people without explanation.
4. **Use the real duel engine.** Tournament results, NPC challenges and deck choices must be settled by the authoritative Classic TCG service. The RPG never fakes duel outcomes or changes printed-card behavior.
5. **Relationships through play.** Social progress should emerge from real encounters, mutual plans, duels and activities in addition to authored dialogue; do not replace the narrative agent's authored arcs with generic templates.
6. **Explain the next interesting action.** Keep today's priorities, time-sensitive commitments, local NPCs and rewards readable without revealing locked scene spoilers.
7. **Persist and resume honestly.** Keep the existing `neoHarborRpgV1` browser save key; hydrate optional features conservatively and apply rewards only once.

## First gameplay milestone — optional daily intentions
- `rpg_intentions.js` is an independent module offering **one optional priority per day**: social, authentic NPC duel, or town life.
- Social can be fulfilled by a hangout, honored appointment, finished personal scene, side-quest conversation or completed rivalry chapter.
- Duel counts any real completed NPC match, **including defeats and draws**, never merely initiating a match.
- Town counts an actually completed venue activity or local encounter.
- Small, campaign-only resource rewards have caps: social (+5 focus, +1 insight), duel (+10 credits, +1 preparation), town (+8 credits, +2 reputation).
- The choice locks for that day and resets tomorrow; skipping it causes no penalty. Duplicate completions and duel callbacks cannot grant extra rewards.
- Shows a compact choice/progress interface at the top of the right sidebar. Existing routes, story pacing, event deadlines and decks are unchanged.
- Add the previously missing public-script allowlist entry for `rpg_appointments.js` alongside the new module.
- Regression: pure domain tests, browser-controller UI flows, serving paths and the existing RPG smoke/CI pipeline. Save/load during a duel still depends on the existing local session's lifecycle.

## Follow-on priorities (not yet implemented)
### A. Schedule-aware daily guidance
Provide non-spoiler suggestions of what is doable *now*, what's about to close, and whom the player can meet; avoid nagging for actions that can't be completed.

### B. Deeper relationship gameplay
Give each character distinct mechanically meaningful noncombat preferences (favorite shared activities, social opportunities, responses to commitments) driven by metadata the narrative agent can supply. Respect existing route and exclusivity gates; do not grant gifts or relationship points through repeatable free clicks.

### C. Tournament and deck-building pacing
Expose clean training-to-competition loops: deck legality, realistic opponent archetypes, optional practice matches, bracket stakes, and rewards that feed collecting without altering the Classic reducer.

### D. Weekly town rhythms
Make jobs, activity unlocks, invitations, and public events vary visibly by weekday and chapter. Avoid any mandatory all-characters social grind over 90 days.

### E. UX and quality gates
Playable mobile sidebar hierarchy; readable NPC/location prompts; verified save/resume after a completed real duel; simulation of a complete 90-day season with varied player strategies and mid-dialogue reloads.

## Test / integration requirements
- Run `npm run test:rpg` plus `tests/rpg_integration.test.js` and the real-browser smoke suite whenever available.
- Preserve tests with mocked `window.NeoRpgIntentions` in controller fixtures.
- Never make mutable narrative content part of the gameplay module; special characters remain dynamic through existing `cast`, schedules and callbacks.
- Use scoped PRs instead of editing main while independent agents are concurrently changing narrative or Classic engine modules.
