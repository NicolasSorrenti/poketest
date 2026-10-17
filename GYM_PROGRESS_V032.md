# Neo Campus TCG — Gym Progress v0.32

This release builds directly on v0.31. It keeps all 28 official theme decks, both CPU and online play, Energy/chat fixes, opponent animations and centered layout.

## Newly executable attacks (11)

| Card | Attack | Implemented behavior |
|---|---|---|
| Erika's Exeggcute | Egg Bomb | Heads: 40 damage. Tails: 20 self-damage instead. |
| Misty's Dewgong | Ice Throw | 20 base damage; double base damage versus Fighting before Weakness/Resistance. |
| Sabrina's Golduck | Damage Shift | Move one damage counter from every damaged friendly Pokémon to opponent's Active, ignoring Weakness/Resistance. |
| Blaine's Charizard | Roaring Flames | 20 + 20 per attached basic Fire Energy; discards those Fire Energy cards. |
| Koga's Ditto | Giant Growth | On heads, 80 max HP and Pound base 30 until benched. |
| Misty's Horsea | Ink Spurt | On heads, the opponent's afflicted Pokémon must flip to attack; tails cancels the entire attack until bench/evolution. |
| Sabrina's Abra | Energy Loop | Prompt to return a specific attached Psychic Energy to hand to attack. |
| Brock's Zubat | Alert | Requires Bench, draws one card and chooses a switch target. |
| Rocket's Hitmonchan | Crosscounter | Attack-triggered flip; on heads strikes back with 2× incoming damage subject to normal W/R. |
| Rocket's Moltres | Fire Wall | Retaliates for 10 damage with W/R if damaged next turn (including lethal damage). |
| Rocket's Scyther | Shadow Images | Repeated attack-protection flips until Scyther takes damage or leaves Active. |

## Newly executable Pokémon Powers (2)

- **Misty's Gyarados — Rebellion:** On two tails, cancels the attack and shuffles Gyarados, evolutions, attachments and Energy into its owner's deck. Promotes a new Active without awarding an opposing Prize.
- **Erika's Ivysaur — Relaxing Scent:** While healthy and Active, halves attack damage after Weakness/Resistance, rounding up to the nearest 10 (including Bench damage and recoil).

## Import repairs

The historical source data omitted the printed damage for **Erika's Exeggcute's Egg Bomb (40)** and **Misty's Dewgong's Ice Throw (20)**. These values have been corrected in the bundled Gym JSON files.

## Coverage checkpoint

| Set | Missing attacks | Missing Pokémon Powers | Missing Trainers |
|---|---:|---:|---:|
| Gym Heroes | 7 | 2 | 6 |
| Gym Challenge | 15 | 5 | 7 |
| **Both sets** | **22** | **7** | **13** |

These are **missing handler counts**. An available handler does not certify all edge cases. There are still 42 missing handler entries and a broader historical fidelity audit is pending. Details are in `GYM_V032_REMAINING.json`.

## Validation

- `npm test`: entire existing suite plus two new Gym v0.32 regression modules.
- `npm run test:gym:v032`: focused Gym regression, online Energy/chat and opponent-feedback tests.
- `node audit_gym_v024.js`: regenerates handler coverage audit.

Start with `npm start`. Open `classic_live.html` for local CPU play or `online.html` for two-player multiplayer.
