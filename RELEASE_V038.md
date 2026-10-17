# Neo Campus TCG v0.38 — Hosted multiplayer UX

Builds on v0.37 and preserves official theme decks and Gym attack handlers.

## Highlights

- The online match uses a single-viewport, compact desktop/tablet/mobile layout; the hand scrolls **horizontally** as necessary. Card artwork gets smaller on phones; this is a tradeoff for avoiding page scrolling. CPU interface is unaffected.
- Room Chat and unified Match Log are accessible via toggles and do not occupy the board. Incoming chat causes a red unread badge when collapsed. Log combines publicly certified game actions and public rule/coin outcomes chronologically.
- Enter a custom six-character room code before clicking Create; codes are not overwritten. Duplicate codes produce a clear error.
- Invite links open a focused join-room form prefilled with the code. Invited players can choose their name and deck, and adjust both in the lobby; a name/deck change clears Ready.
- A third or later visitor gets a spectator token, can view the public battlefield and chat, and cannot issue gameplay, change a deck/name, or see private hands or face-down prizes. Max 40 concurrent spectator tokens per room.
- Each human player's state polling is the authoritative heartbeat. After about 6 seconds without successful polling, the opponent appears disconnected; if absent for 60 seconds while the game is active, the remaining connected player wins by forfeit. If **both** players are missing, no winner is awarded. Disconnect is based on loss of heartbeat, not the browser's close event.
- Coin-flip results are generated on the server and recorded in the public log; the interface plays a short coin-result animation. Random shuffles and hidden-hand index choices are not treated as coin flips.
- Knock Outs have clear pop-up feedback and are included in the unified log.
- Online Knock Outs no longer take the last Prize automatically: the appropriate player clicks a highlighted face-down Prize. Multiple Knock Outs queue separate choices, and the correct selected card goes privately to that player's hand. Local/CPU prize-taking remains unchanged.
- Both discard piles can be inspected as galleries. Both deck icons show remaining card counts without revealing hidden cards.
- The game now listens on `0.0.0.0` by default, honoring `HOST` and Render's `PORT`.

## Run locally

```sh
npm start
```

Open http://localhost:8000/online.html. On Render, deploy the repository as a Node Web Service with start command `npm start`. The service URL ends in `/online.html`.

## Tests

```sh
npm test
npm run test:online:v037
npm run test:hosted:v038
```

## Limitations

- Matches, chat, spectator identities, and presence are **in memory only**. A free hosting instance that restarts loses them.
- The compact mobile battlefield uses very small card artwork; individual hand cards can be swiped left/right without vertically scrolling the page.
- When a browser is backgrounded or the network pauses polling, it can be counted as disconnected even if the window is still open. The 60-second grace period is intentional.
- Automated Node regression tests and HTTP scenarios pass. The environment blocked headless browser navigation to the local URL, so layout and complete click-throughs still need real-browser verification.
- Cards outside currently supported handler coverage may still have incomplete historical mechanics.
