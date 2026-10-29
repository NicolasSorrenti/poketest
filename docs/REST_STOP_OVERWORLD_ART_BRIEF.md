# The Rest Stop — overworld background art brief

Status: temporary map blueprint committed; final illustrated background pending.

## Canon
- RPG location ID: `cafe`
- Canonical in-game name: **The Rest Stop**
- Original RPG background: `rpg-assets/cafe.jpg`
- Existing interactive placement scene: `/overworld-placement-studio.html` → café
- Preview: `/overworld-prototype.html?scene=cafe`
- Current temporary blueprint: `overworld/maps/cafe-blueprint.svg`

## Scene design
Create one continuous, people-free modern anime JRPG café interior seen from a **slightly elevated three-quarter / isometric-like angle**, consistent with Pixel Palace. A cozy waterfront-town coffee shop where people talk about duels, study card strategies, take part-time shifts, and meet friends.

Use a landscape 1550 × 1120 composition with solid visual depth and coherent room perspective. Position a service counter, espresso/barista equipment and menu area along one upper side; a set of small conversation / strategy tables on the opposite side; booths/window seats looking toward the harbor; and a relaxed quiet corner for reading or conversation. Include a broad accessible central walking area and natural locations for standing characters.

**No characters, readable text, labels, floating icons, UI, or scenery-embedded sprites.**

Keep all café furniture inside the background, and render character artwork on separate transparent layers.

## Placement-system expectations
The prototype and editor already use `cafe` and may need anchor/hotspot adjustments when art is approved. Map pixel coordinates are *provisional* until illustration placement is verified. Keep character foot positions on exposed floor and place seated characters relative to the actual furniture. The existing prototype can switch scenes using `?scene=cafe`.

## Future integration
Bind the scene to existing RPG location `cafe`, schedule, and activities. Do not replace the standard RPG exploration UI until the overworld version is tested and approved. Avoid a second activity or relationship engine.
