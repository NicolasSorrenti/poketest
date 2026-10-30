# Camila — approved dialogue portrait master

## Decision

Reuse the existing, approved full-body PNG at `rpg-assets/characters/camila/overworld/standing-front.png`. No new generated artwork, no binary copies, and no changes to the approved pose itself.

## Wiring

- `rpg.js`: place the existing PNG first in **Camila's stage/dialogue portrait source list only**. Keep reviewed emotion images as fallbacks; other modes still use their old image-selection paths.
- `rpg.js`: for the legacy RPG stage, choose the image-specific top-aligned crop `[x=.05,y=0,width=.90,height=.46]` instead of Camila's older bust crop. Original assets are never cropped on disk.
- `rpg-overworld-integration.js`: for the standalone overworld dialogue, apply the `neo-ow-dialogue-front-master` class **only when that PNG actually loads**. Use a top-anchored, responsive viewport that shows roughly from head through the beginning of the waist. Revert the class when fallback portrait images load.
- Source fallbacks are supplied for both idle character interaction and conversation presentations. CGs, character positioning, original `rpg.html`, chibi/discreet source selection, and playable overworld sprite layouts are unchanged.

## Visual QA required

1. Open a location where Camila appears. Open the interaction menu: she should be framed from the head to the upper waist, not as a tiny full-body character.
2. Start a normal dialogue and advance to a line implying an emotion change. The same approved full-body identity should remain consistent (until matching full-body expression variants are approved).
3. Compare neutral and CG moments on desktop and narrow mobile; the dialogue box and actions must remain tappable.
4. Switch Discreet/Chibi Mode to ensure its replacement portrait is **not** accidentally magnified by Camila's custom frame.
5. Verify the original PNG is still used at full length in the walkable overworld when that pose is selected.
6. If this master image fails to load, the older expression portraits should remain available as fallbacks.

## Known limits

This is a **code-driven crop**, not a new portrait. Exact apparent waist alignment depends on the original image's transparent padding and device aspect ratio. Tune the source-specific crop/scale after inspecting actual PC and mobile screenshots. A single full-body master does not provide separate facial expressions, so the previous reviewed images remain as fallbacks rather than forcing inconsistent variants.

Do not regenerate Camila's approved design solely for dialogue framing.
