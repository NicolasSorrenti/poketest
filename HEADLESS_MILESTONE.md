**Update (v0.11):** The current headless attack/condition milestone is documented in [`HEADLESS_EFFECTS_MILESTONE.md`](HEADLESS_EFFECTS_MILESTONE.md). The v0.10 figures below are retained as historical baseline.

# Neo Campus TCG — Authoritative Duel Slice (v0.10 architectural checkpoint)

## What ships in this milestone

This checkpoint contains **two distinct execution paths**:

1. **Existing browser/CPU duel** (`engine.js`, `index.html`) — preserved, playable locally, supports the previous catalog-wide effect scripts. It is still coupled to the DOM/CPU and not certified for perfect historical accuracy.
2. **New authoritative, headless duel** (`headless_duel.js`) — an independent Node.js rules entrypoint. It is pure from the transport's perspective, JSON-serializable and transactional. It can drive a future room service, CLI test harness, remote client or campaign script without browser globals. **It does not yet replace the legacy duel UI or execute the full historical catalog.**

The new path is intentionally conservative: unsupported effects are *rejected without modifying the match*. The old engine is not silently used as a fallback, because doing so would reintroduce DOM-dependent decisions and hidden-state hazards.

### Commands

`setup_select`, `setup_undo`, `setup_confirm`, `bench`, `evolve` (no unported Power triggers), `attach_energy`, `retreat`, `play_trainer`, `attack`, `choose`, `end_turn`, `concede`. Each carries an explicit player actor, and commands from the wrong player are rejected. The old command definition also includes `use_power`, which this slice explicitly rejects until migrated.

### Supported card effects in the new path

- **412 of 1,479 historical attack records (27.9%)** matched *exactly*: 297 ordinary numeric-damage attacks, 55 multi-coin damage attacks, 25 coin-or-zero attacks, 35 coin bonus damage attacks. The `audit:headless` script prints a per-card support report.
- **12 of 178 historical Trainer records** across 6 card names: Bill, Professor Oak, Potion, Switch, Gust of Wind, Energy Removal.
- Basic Energy; Double Colorless Energy for attack costs; Energy attachments, evolution, weakness/resistance, Knock Outs, Prize transfers, Bench promotion, retreat costs, turn/draw sequencing, and common gameplay actions in the supported subset.
- Other Special Energy effects, on-play/continuous Pokémon Powers, Stadium effects, attached Tools' interaction effects, status attacks and complex attack text are deliberately blocked until correctly migrated.

### Decision and transaction behavior

- The pending decision is owned by an explicit player, which may be the player *not currently taking a turn*. E.g. a Knock Out can require the defender to promote a Benched Pokémon before the attacker's turn ends.
- Multi-step Energy Removal asks for the Pokémon and then the particular Energy to discard. Neither step spends the Trainer prematurely. Retreat can ask for an exact number of Energy cards to discard.
- Optional decisions can be cancelled while leaving the card in hand and the state unchanged. Stale, illegal and duplicated selections are rejected.
- `reduce(game,actor,command)` makes a structured clone and returns a new state only if the command succeeds. Failed actions never change the supplied game. `applyCommand` commits successful reductions atomically.
- Match shuffles and coin flips use stored RNG state for deterministic test replay; the `roomAdapter` ignores client-supplied RNG seeds and supplies server-generated randomness.
- Rooms use invite codes, separate credentials, revision checks and player-specific views. Opening setup hides the opponent's Active/Bench until both have confirmed. Returned views are **copies**, so the consumer cannot mutate match state through a view reference.

### Testing

- `npm test` runs the legacy regression suite plus the new action/attack-room suites.
- `npm run test:headless` tests the new headless slice.
- `node test_headless_full_duels.js` runs **100 seeded completed duels** using historical card IDs. Checks 60-card conservation for both players after accepted turns.
- `test_headless_duel.js` exercises real two-player rooms and 2,000 adversarial command attempts with atomic rollback; includes Energy attachment/evolution, turn validation, Trainer multi-step choices and opponent-turn promotions.
- `test_attack_effects_core.js` enumerates all 1,479 attack records and checks all interpreted branches with forced heads/tails.
- `npm run audit:headless` shows coverage; `npm run audit:headless -- --json` emits the per-card support matrix.
- `npm run release:strict` still **fails intentionally** because eight historical Trainer records are marked partial and final historical verification remains open.

### Library/usage example (Node.js)

```js
const {createGame, reduce, roomAdapter} = require('./headless_duel');
const {RoomCoordinator} = require('./duel_rooms');

// In production use your own authenticated deck-selection flow: two legal 60-card decks.
const coordinator = new RoomCoordinator(roomAdapter());
const host = coordinator.create();
const guest = coordinator.join(host.code);
coordinator.start(host.code, host.token, {decks: [hostDeck, guestDeck]});
const hostView = coordinator.view(host.code, host.token);
// Only the host's hidden cards will be visible in hostView.
coordinator.dispatch(host.code, host.token,
  {type: 'setup_select', payload: {handIndex: 0}}, hostView.revision);
```

The `RoomCoordinator` is currently an **in-memory library**, not an HTTP/WebSocket service; this checkpoint does not claim to be deployable as an online multiplayer game. A real network transport, guest-owned deck selection, persistence, reconnects, rate limits, and UI remain separate work.

## What to build next

1. Move reactive effects and their player choices into a portable *effect handler registry*, with precondition, decision, and commit stages. Migrate attack/status, Pokémon Powers, Trainer and Special Energy effects in complete behavioral families.
2. Replace the browser `Engine`'s rule authority with the new headless path **only after parity tests** demonstrate the migrated families behave the same or better. Do not maintain two competing engines long-term.
3. Extend differential testing, deterministic replays and complete-duel coverage. Then add matchmaking/network adapters if needed; the eventual story/tag-team game is intentionally out of scope.

## Running local playable game

From `neo-campus-work`: `npm start`, then http://localhost:8000. The existing browser game remains functional. `npm test` validates both paths.
