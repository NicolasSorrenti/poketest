# Neo Campus outfit-change chime configuration

Runtime configuration: `rpg-assets/outfit-chime-focus.json`.

The overlay reuses the existing portrait image. Coordinates `top` and `bottom` are normalized fractions of its height. No separate CG is required. The chime is image-only, lasts approximately 3 seconds, and includes a thin border.

## Supported characters

- Hana: eight new overworld variants, plus her normal portrait in the selection pool.
- Akari: five existing special-day portraits.
- Barb: ten existing special-day portraits.

All focus regions are editable per file. Akari and Barb use provisional garment-centered crop rectangles until each image is visually reviewed. They are not guaranteed pixel-perfect.

The overlay triggers when the player enters a place containing a character **and** their selected portrait differs from the one last seen. First encounters do not chime. Story scenes, battles, and blocking events take priority. Only one chime is shown per entry.

## Crop reference

| Character | Files | Top | Bottom | Focus |
|---|---|---:|---:|---|
| Akari | special-day-1 through special-day-5.png | 0.29 | 0.67 | Top and waist |
| Barb | special-day-1 through special-day-10.png | 0.26 | 0.70 | Top and waist |
| Hana | 01–08 in overworld-variants | 0.31 generally | 0.65 generally | Top and shorts; skirt variants extend to 0.80 |

These ranges are *initial estimates*, not visually approved precise garment boxes.

## Future expansion

Add another character to `characters` in the JSON with its real outfit paths and normalized crop positions. Add it to the list passed from the entry hook. Do not use facial expressions or narrative CGs as outfit changes.
