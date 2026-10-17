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
