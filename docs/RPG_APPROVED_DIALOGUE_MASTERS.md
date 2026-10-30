# Neo Campus — approved neutral dialogue masters (2026-10-30)

The game uses **existing, approved full-body images** and crops only in its RPG dialogue views. No image was regenerated or overwritten.

| Character | Full-body master used for neutral dialogue | Other expressions |
|---|---|---|
| Iris | `rpg-assets/characters/iris/dialogue/neutral.png` (byte-identical copy of `overworld/standing-front.png`) | Original expression portraits |
| Alma | `rpg-assets/characters/alma/overworld/standing-front.png` | Original expression portraits |
| Barb | `rpg-assets/characters/barb/portraits/primary.png` | Original expressions and priority `special-day-*.png` looks |
| Elena | `rpg-assets/characters/elena/overworld/standing-portfolio.png` | Original expressions |

Camila was integrated previously using `rpg-assets/characters/camila/overworld/standing-front.png` as a dialogue master.

The source selection is in `rpg.js`; the viewport rule for the standalone overworld is in `rpg-overworld-integration.js`. Source-specific classes are installed only after a matching image loads. CG art, overworld sprites, and `rpg.html` remain untouched. Non-neutral dialogue, other special outfits, and fallback art keep existing paths. Native RPG stage crop coordinates for these approved neutral masters are `[.06,0,.88,.47]` (Camila retains her previous calibration).

**Visual QA still required:** inspect desktop and mobile conversations for each character, verify waist crop height and expression transitions; test Barb's special-day art and Discreet Mode. Do not presume code crop replaces transparent source artwork.

**Not yet integrated:** Marina/Hana/Rina/Kaede/Shiori/Yuna/Akari/Laca/Daisy/Jinx/etc approved images created in chat that do not have an identified, verified repository asset. Do not substitute images or overwrite their approved originals.

Historical PR #216 applied square crop assumptions to Marina/Laca before the master-image direction was agreed; it should be superseded, not merged unmodified.
