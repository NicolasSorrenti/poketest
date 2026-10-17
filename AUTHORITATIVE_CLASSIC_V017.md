# Neo Campus Classic v0.17 — Playable Authoritative Client

## What this release actually changes

The `classic_live.html` interface is a NEW playable local human-versus-CPU duel using `headless_duel.js` as the ONLY rules authority. It no longer calls the historical `engine.js` browser implementation. The original `/` page remains unchanged except for a link to the new interface, so testers can compare both experiences and fall back if the new UI misses something.

The authoritative local game travels this path:

```
classic_live.html + classic_live.js
  └── /api/classic/create, /state, /action
       └── classic_local_service.js (token-based local session + revision)
            ├── headless_duel.reduce() (atomic rules and choices)
            ├── duel_protocol.publicView() (private information)
            └── classic_bot.driveBot() (same legal reducer, baseline heuristic)
```

`classic_live_decks.js` adds two valid 60-card **custom test decks** on top of six original Base/Jungle 60-card theme decks. Rocket Lab includes Dark Pokémon and their Powers; Fossil Lab includes Muk, Ditto and other Fossil interactions. Custom lab decks are not described as real retail products.

## Run locally

1. Install Node.js 18+ (22+ recommended).
2. Extract the ZIP and open a terminal in `neo-campus-work/`.
3. Run `npm start`.
4. Navigate to **http://localhost:8000/classic_live.html**.
5. Select both 60-card decks and choose **Start authoritative duel**.
6. Select a Basic Pokémon from your opening hand and click **Confirm opening setup**.
7. Click hand cards to Bench, attach Energy, evolve or play Trainers. Use the attack and Power buttons. Answer card-specific choices in the right-hand panel.
8. The CPU executes on the Node server. Your opponent's hand and Prize contents are never sent to the browser.

The original client and the full card archive remain available at **http://localhost:8000/**.

There are **no npm dependencies to install** for the local game. Card images are external and may require internet access; gameplay uses bundled JSON.

## Verified in this release

- Server-side generation of all eight available 60-card decks, with Classic format validation.
- Local game state isolation using an unpredictable session token, expiration and a finite room cap.
- Atomic typed actions with revision checking, so stale requests and illegal commands do not mutate the real match.
- CPU controls the same headless reducer. It can Bench, evolve, attach Energy, play selected Trainers, attack, and respond to pending decisions.
- Two real gameplay softlock guards: attack locks and Scavenge discard requirements are checked *before* mandatory multi-step decisions open.
- Opponent's hand and Prize identities omitted from player 0 view; spectator-specific decisions concealed by `duel_protocol`.
- 96 simulated local sessions, 1,247 attacks, 236 player-controlled choice chains, 72 Bill plays, 3,924 accepted commands, and card conservation throughout. **These sessions did not all run to natural victory**; they exercised bounded portions of actual matches across deck combinations.
- Complete existing legacy and headless test suite passes; HTTP tests exercise real API endpoints and static pages.
- Client source parses and all explicitly referenced DOM elements exist.

## Explicit limitations

- This is a **local test client**, not yet hosted multiplayer, a public deployment or a lobby.
- Human-vs-CPU works, but CPU decision-making is intentionally simplistic. It does not exploit every Pokémon Power or every possible Trainer strategy.
- Original Base–Rocket Classic card effects have migrated handlers, **not full certified historical accuracy**. Particularly complex copied attacks, simultaneous triggers and rare effect-ordering cases require further manual testing.
- Original `/` browser UI still has the legacy rules, so use `/classic_live.html` to test the authoritative engine.
- Browser automation could not open localhost in the current execution environment. HTTP, DOM/static checks, and end-to-end engine tests passed, but a human needs to verify real mouse/touch gameplay in a normal browser.
- Local sessions are in memory; restarting Node ends the match. A refresh in the same browser tab restores the match while the server session is active (90-minute inactivity expiration).
- There is no deck builder; the eight available decks are an initial test surface. New cards can be tested through additional deck presets or future deck-builder support.

## Tests

```sh
npm run test:classic:live
npm run test:classic
npm test
```

## Next milestones (do NOT expand scope yet)

1. Manually playtest `/classic_live.html` against both Fossil and Rocket Lab decks; fix selection and delayed-effect UX bugs.
2. Improve the server's authoritative Power timing, copied attack choices and conditional Trainer interactions based on reproducible failing game logs.
3. Introduce a shareable command transcript / replay export for reproducible human reports, and eventually add a legal Classic deck editor.
4. After the authoritative local client is stable, route an optional private multiplayer invite-code service through the same reducer. A future story/tag-team experience should depend on this engine rather than embed new rules.
