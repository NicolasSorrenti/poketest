# Neo Campus — Full beachwear image reference package

Extract this ZIP **into the poketest repository root** (retain directories).

## Contents
- `rpg-assets/references/beachwear/original_collection_bold.png` — previously approved bold lineup: Barb, Laca, Rina, Luna, Akari, Sierra, Alma, Sol, Hana, Jinx and Reina.
- `rpg-assets/references/beachwear/remaining_designs.png` — approved remaining lineup: Shiori, Yuna, Camila, Marina, Kaede, Iris, Elena, Jun, Teo, Elio and Nereo.
- `rpg-assets/references/beachwear/all_character_references.json` — maps all 22 names, including Barb, to the correct artwork path.
- `rpg-assets/references/beachwear/remaining_designs.json` — detailed new descriptions for the 11 remaining characters.
- `scripts/apply_beachwear_designs.py` — updates 11 descriptions and sets working `visualReference` paths for 21 Barb consultation events.

## Apply
```bash
python scripts/apply_beachwear_designs.py
node --check rpg_cross_character_events.js
```
Review changes and run the RPG tests before committing. This package **does not contain individual event CGs**; both images are styling contact sheets. Character faces and proportions in these concept sheets are not canonical—use the existing approved visual bibles instead.
