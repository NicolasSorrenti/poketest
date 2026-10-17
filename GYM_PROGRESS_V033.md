# Neo Campus TCG v0.33 — Gym Heroes / Gym Challenge development checkpoint

This is an incremental release continuing v0.32. The 28 official theme decks, local CPU play, two-person multiplayer, action animations, chat, and centered battlefield are retained.

## New executable effects

- Additional Gym attacks: 21 newly registered signatures, covering Fairy Power, Take Away, Call of the Night, Electric Current, Flytrap, Kindle, Sleight of Hand, Flame Jet, Growth, Super Removal, Earthdrill, Overhead Toss, Errand-Running, Lunar Power, Messenger, Invigorate, Magic Darts, Pranks, Overrun, Group Attack, and Amnesia (Misty’s Poliwag). Complex moves have dedicated decision prompts and pre-rolled coin outcomes.
- Pokémon Powers: Shapeshift, Rebirth, Fragrance Trap, Energy Drain, Scram, Soak Up, and Shock Blast. These implement attached Evolution selection, reactive Knock Out handling, attack-triggered discard, bench switching, and turn-specific tracking. **Availability auditing is not proof of perfect rules timing.**
- Trainers: Brock's Protection, Narrow Gym, Misty's Wish, Blaine's Quiz #2, Tickling Machine, Recall, Sabrina's ESP, Koga's Ninja Trick, Blaine's Quiz #3, and Charity.
- Fixed Brock’s Dugtrio Earthdrill base damage to 60 and ensured Gym theme attacks have correct preconditions. Earlier imported Gym Energy misclassification fix is retained.
- Misty’s Wish now shows the inspected Prize privately before the opponent's response; the ESP and Charity coin/damage results are resumable through multiplayer selections.

## Automated testing

- `npm test` — all existing regressions and two new v0.33 suites.
- `npm run test:gym:v033` — targeted attack, Power, Trainer, mixed Gym, Energy/multiplayer, and animation tests.
- `npm run audit:gym-migration` — prints counts and overwrites `GYM_COMPATIBILITY_REPORT_V024.json` with a detailed *handler* audit (legacy audit script name retained).

## Still unsupported, deliberately not advertised as working

The static audit counts **315/316 attacks, 24/24 named Powers, and 63/66 Trainer printings** with handlers. Four remaining unsupported *card printings*:

1. **Misty’s Psyduck — ESP** (3 coin flip outcomes, including arbitrary opponent attack copy).
2. **Blaine’s Quiz #1** (printed Pokémon length trivia with authoritative card heights).
3. **Chaos Gym** (opponent-controlled Trainer copy/replay and strict card ownership).
4. **Lt. Surge’s Secret Plan** (hidden, face-down pseudo-Pokémon on the Bench, with conditional reveals).

See `GYM_V033_REMAINING.json` for machine-readable entries. Deck-handler coverage does not imply full historical rules certification. Heavy interactions and multi-user reconnect/end-of-turn states need further real-user testing.
