# Riverside Park — Neo Campus overworld art brief

## Existing RPG identity
- Canonical RPG location ID: `park`
- Canonical name: **Riverside Park**
- Existing scene art: `rpg-assets/park.jpg`
- RPG description: “Some conversations are easier away from tournament tables.”
- Overworld test route: `/overworld-prototype.html?scene=park`
- Editable layout: `/overworld-placement-studio.html` (select Riverside Park)
- Current blueprint: `overworld/maps/park-blueprint.svg`

## Final map specification
One continuous, illustrated **1550 × 1120** outdoor riverside park environment. Anime JRPG environmental art, slightly elevated three-quarter camera matched to Pixel Palace. Keep a visible riverfront promenade and railings, trees, garden foliage, benches, a community noticeboard, distant harbor-town architecture, and connecting footpaths. Use natural warm daylight with cool river reflections. The place should feel peaceful and lived-in, suitable for informal conversation away from tournament venues.

### Composition
- Upper-left: open waterside promenade with a view of the river.
- Upper-right: benches, a sheltered social/rest area.
- Lower-left: community noticeboard and garden path.
- Lower-right: shaded garden lawn and quieter walking path.
- Center: continuous walkable pathways with room for several separate full-body sprites.

The four zones are **art directions**, not fixed geometry constraints. Adjust final character foot anchors to the approved background using the Placement Studio.

### Production rules
- Clean environment **without any people, readable lettering, floating labels, icons, markers or game UI**.
- Furniture and environmental objects may be baked into the background; character sprites must stay independent transparent PNGs.
- Retain scale consistency with Pixel Palace. Main paths must allow full-body characters in roughly 140–160 logical-pixel sprite heights.
- Avoid deep perspective/vanishing points that make feet anchors inconsistent.

### Reuse existing gameplay
RPG activities include waterfront walks and community flyers; NPC schedules already use location `park`. The overworld remains a separate prototype until integration can reuse canonical location schedules, dialogues, and activities safely.

### Verification
Before final approval, load the background and stand/walk/talk poses in both preview and Placement Studio; verify feet sit on paths, benches and noticeboard do not overlap characters, and all interactive hotspots match the actual background.
