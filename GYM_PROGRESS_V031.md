# Neo Campus TCG v0.31 — Gym Heroes / Gym Challenge progress

Built on v0.30 (opponent animations, centered battlefield), retaining the 28 original official theme decks, local CPU and online multiplayer.

## Additional exact attack implementations (19 records)

Gym Heroes: Blaine's Moltres — Phoenix Flame; Lt. Surge's Electabuzz — Discharge; Sabrina's Gengar — Pain Amplifier; Misty's Poliwrath — Water Ring; Brock's Geodude — Lucky Shot; Erika's Exeggcute — Deflector; Lt. Surge's Magnemite — Removal Pulse; Sabrina's Drowzee — Suggestion; Sabrina's Venonat — Removal Beam.

Gym Challenge: Giovanni's Gyarados — Summon Storm and Dragon Tornado; Giovanni's Nidoking — Intimidate; Rocket's Mewtwo — Juxtapose; Rocket's Zapdos — Plasma; Koga's Pidgeotto — Aerial Maneuvers; Lt. Surge's Eevee — Surprise; Lt. Surge's Raticate — Focus Energy; Lt. Surge's Rattata — Focus Energy; Misty's Staryu — Star Boomerang.

The attack compiler matches full historical card attack texts. Targeted Bench damage and enemy Energy discard demand real player selections where needed, with replay-safe hidden decisions.

## Additional Trainers (6 unique)

Misty's Wrath, Trash Exchange, Energy Flow, Misty's Duel (official coin-flip fallback), Lt. Surge's Treaty, Minion of Team Rocket.

## Additional Pokémon Powers (2)

Misty's Cloyster — Shell Armor, including Active and Bench attack damage; Erika's Oddish — Photosynthesis (Energy color conversion even while Asleep, Confused, or Paralyzed).

## Handler coverage audit

| Set | Still missing attack handlers | Still missing Power handlers | Still missing Trainer handlers |
| --- | ---: | ---: | ---: |
| Gym Heroes | 13 | 2 | 6 |
| Gym Challenge | 20 | 7 | 7 |
| **Total** | **33** | **9** | **13** |

That is 27 fewer missing entries than v0.30: 19 attacks + 2 Powers + 6 Trainers. See `GYM_V031_REMAINING.json` for the exact remaining card names.

**Important:** A registered handler is not proof of 100% historical fidelity. Edge cases such as forced switching, simultaneous knockouts, Stadium interactions, cross-card effects, and the remaining card list above require further implementation and human testing. The 28 official theme decks retain existing registered handlers.

## Run

`npm start` then open `http://localhost:8000/classic_live.html` (local CPU) or `http://localhost:8000/online.html` (2 players).

`npm test` runs the original regression suite plus `test_gym_remaining_v031.js`.

`npm run test:gym:v031` executes the Gym and opponent-feedback regression tests.
