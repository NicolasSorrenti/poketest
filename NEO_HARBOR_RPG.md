# Neo Harbor RPG — Vertical Slice (prototype)

Open `/rpg.html` after `npm start`.

This isolated RPG layer adds a day/period calendar, location navigation, a Reina interaction, dialogue choices, local browser saving, and a challenge that embeds the **existing authoritative Classic CPU duel page**. No duplicate Pokémon TCG rules are introduced.

## Art
Copy the separately supplied `rpg-assets/` folder into the repo root. The page expects `rpg-assets/reina.png` and `rpg-assets/card-shop-day.png`. These are early candidate assets; transparent sprite extraction and artist approval are still necessary.

## Prototype limitations
- The player deck defaults to Blackout; Reina uses the existing Brushfire preset as a **temporary technical stand-in**, not her intended competitive Haymaker deck.
- Match result is posted back to the RPG via same-origin iframe messaging; the campaign advances one period after a completed match.
- Campaign state lives in browser localStorage. Duel sessions are held in the current Node server memory, so restarting the server mid-duel cannot recover the same game.
- Pack economy, actual 90-day event script, championship logic, eight-character routes, permanent cross-browser persistence, and more than one NPC are **not implemented** yet.
- Battle UI remains existing Classic duel page; its rules and card-support limits remain unchanged.

## QA checklist
1. Run `npm start`, open `http://localhost:8000/rpg.html`.
2. Visit Lucky Draw during afternoon; talk with Reina, choose a response and challenge her.
3. Finish the duel through the same Neo Campus CPU UI. Verify RPG dialogue changes and the period advances once.
4. Reload during a duel and verify the duel resumes in the embedded page.
5. Reload the RPG outside a duel and verify day, location and journal persist.
6. Verify `/classic_live.html` and `/online.html` are unchanged in normal use.

This branch is a prototype and has not yet passed live browser integration testing.


## Expanded cast milestone
- Eight adult heroine profiles are present in the RPG: Hana, Reina, Shiori, Yuna, Akari, Camila, Marina and Kaede.
- Each has a weekly location/time schedule; Kaede starts appearing after Day 40.
- Per-NPC first encounters, changing dialogue, one-per-period talk interactions, daily hangouts, flirting, basic trust/affection counters and match histories.
- NPC challenges use the existing local Classic duel service through the existing browser duel page. Opponents currently use **stand-in preset decks**, not their final archetypes.
- The player can select an existing official theme deck from the RPG screen.
- Calendar includes scheduled circuit events and a points counter. **These events are provisional narrative/exhibition activities and do not yet run real tournament brackets.**
- Existing browser saves are migrated by filling defaults for newly introduced fields.

### Known gaps
- Only Reina has a candidate character portrait. Other NPCs currently appear in the list and dialogues without illustrated sprites; the UI must not use random stock avatars.
- Current RPG progress remains client-side localStorage. The full story, romance milestones, card economy, spoiler-protected server event gating and finale remain unimplemented.
- The image archive was delivered separately and has not been pushed to GitHub.
- Match return, reload and Render integration still require an actual browser end-to-end test.


## 0.4 — Living Town UI & Connected Narrative

### Player-facing UI
- The home location now has a large **YOU ARE HOME** state and a sleep-until-morning action.
- The header prominently shows day, weekday, week, chapter, the 90-day campaign progress bar, and the three time periods.
- Persistent **NEXT PERIOD** and **GO HOME** actions; free travel is separated from ⏳ time-consuming actions.
- A calendar dialog shows announced circuit exhibitions (no hidden character-story spoilers).
- Illustrated portrait panels and location backdrops use \`rpg-assets/{character}.png\` and location images supplied by the separate art ZIP; missing portraits fall back to initials.
- The responsive 3-panel design shows locations, VN dialogue and people/actions with portrait thumbnails.

### Authored VN foundations
- 32 connected authored character scenes (four per heroine) live in \`rpg_story.js\`, separate from the town controller.
- Each scene includes multiple dialogue beats, choices, a recorded outcome, relationship consequences and limited-time availability.
- Later scenes depend on earlier scenes and minimum affinity, so dates and choices matter; missed windows cannot be replayed during the same season.
- A single exclusive romance commitment is possible when its character-route conditions have been earned; friendship remains viable.
- Story progress persists through reload while a scene is in progress; rewards apply **once**, on scene completion.
- Existing \`neoHarborRpgV1\` browser saves are migrated conservatively; previous affection/trust and collections of past matches are retained.
- No plot spoilers are printed in the UI changelog or player calendar.

### Circuit activity correction
- Announced **exhibition** events now launch a real Classic CPU duel rather than award automatic circuit points.
- Results are applied to the campaign once, with extra exhibition points only upon a victory.
- These are single-match exhibitions, **not** genuine elimination brackets or a complete championship.

### QA
- \`tests/rpg_story.test.js\` covers story graph validity, prerequisites, scene expiry, duplicate reward protection and mutually exclusive commitments.
- The story module passed all five equivalent isolated scenario checks.
- The new interface passed scripted DOM smoke checks for home display, free travel, sleep/day rollover, multi-step scene completion and a completed duel callback.
- JavaScript syntax and HTML element bindings were checked.
- **Not yet verified:** a full real-browser playthrough with assets and an actual completed Node-backed duel on Render.

### Outstanding work
- Real tournament brackets, collection economy, historical NPC signature decks and full championship/ending resolution.
- All final illustrated portraits must be committed from the separately delivered asset ZIP; the GitHub source only references their paths. See the art-pack readme for installation.
- Story definitions currently ship to the browser as static JS. Server-authoritative spoiler protection and persistent server-side saves remain future work.
- The existing Classic engine's per-card implementation and AI limitations are unchanged.
