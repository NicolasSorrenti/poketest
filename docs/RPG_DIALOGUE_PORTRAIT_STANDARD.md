# Neo Campus — RPG dialogue portrait standard (pilot)

Status: **Marina + Laca renderer pilot**, not a claim that the 23-character art catalog has been regenerated.
Approved visual reference: Marina's 2026-10-30 user screenshot showing a face-to-upper-body dialogue composition, with the lower artwork disappearing behind the dialogue bar.

## Scope and separation

- **Text/dialogue portraits:** the standalone overworld story window (`#neoOverworldStoryDock #neoOverworldScenePeople`).
- **Not changed:** original `rpg.html`, CG galleries, RPG duel reactions, normal overworld walkable NPC sprites, event artwork, image source selection, or character outfit logic.
- Existing original artwork is preserved.
- The pilot crops on-screen via CSS: it does **not** permanently delete the rest of a full-body image.

## Presentation baseline

1. Every single participant gets a **square dialogue window**, with its top aligned and feet/legs deliberately allowed to extend *outside* the crop, never shown as tiny full-body figures in conversations.
2. Character artwork fills this window with `object-fit:cover` and `object-position:center top`; dialogue remains below the portrait.
3. Identical logical frame sizes for participants; on small screens, single portraits can be larger, while two-person conversations share the width.
4. The source `participant.src` remains untouched, so scripted emotions, outfits, and seasonal variants still resolve through `rpg.js`.
5. An opt-in per-character zoom correction is available through `--neo-dialogue-portrait-zoom`. The Laca pilot correction applies **only to tall images**, not her square/half-body expressions.
6. CSS cropping cannot change the underlying camera angle, hairstyle, outfit, or paint style; assets that fail visual QA should be regenerated.

## Future dedicated image specification

- Recommended output: RGBA **768 × 768**, no baked-in background, UI, text, shadow floor, or frame.
- Face visible and centered; crown inside canvas; matching eye line around the upper quarter; torso reaching the lower edge naturally.
- Camera: slightly elevated front three-quarter; preserve the character's approved identity, fashion, body proportions, and distinguishing details.
- Suggested eventual folder: `rpg-assets/characters/<id>/dialogue/` with `neutral.png`, `happy.png`, etc. These are **proposed** paths, not currently wired or uploaded.
- Keep original full-body references separate for special events, character galleries, and overworld pose artwork.

## Pilot evidence / source paths

| ID | Representative source | Verified mismatch |
| --- | --- | --- |
| marina | `rpg-assets/characters/marina/expression-portraits/neutral.webp` | Already cropped around upper thighs; transparent source also has visual artifacts on the far right. |
| marina | `rpg-assets/characters/marina/expression-portraits/happy.webp` | Different composition/crop than the neutral artwork. |
| laca | `rpg-assets/characters/laca/outfits/casual/neutral.webp` | Tall, full-body image; looked small beside Marina. |
| laca | `rpg-assets/characters/laca/outfits/casual/happy.webp` | A much shorter bust image; must not inherit tall-source zoom. |

## Broader audit (not yet completed)

All these IDs require at least neutral + expression + outfit visual QA and actual-screen verification before treating them as approved normalized portraits:

`akari`, `alma`, `barb`, `camila`, `elena`, `elio`, `hana`, `iris`, `jinx`, `jun`, `kaede`, `laca`, `luna`, `marina`, `nereo`, `reina`, `rina`, `shiori`, `sierra`, `sol`, `teo`, `yuna`.

Note: the 22 IDs above are from the existing stage crop registry. **Daisy** has separate appearances and should also be evaluated if she is present in text conversations.

## Visual verification checklist

1. Marina neutral and Laca casual neutral side by side in the same center-location story dialogue.
2. Marina and Laca expression change during text; head must not suddenly grow, shrink, or disappear.
3. Laca lifeguard outfit and other scheduled outfit switching.
4. Two simultaneous speakers on desktop; two simultaneous speakers on mobile.
5. One speaker in a dialogue, `CG` shown in place of portraits, and discreet mode.
6. Cancel/continue interactions must remain tappable and should not obscure the map or dialogue.
7. Images missing/failed to load: existing fallback behavior remains unchanged.

## Integration notes

Runtime implementation: `rpg-overworld-integration.js` creates `#neoOverworldDialoguePortraitStandard`, scoped to the standalone overworld dialogue portraits. It is a **reversible presentation-only pilot**. Do not commit any binary rewrites to `portraits/`, `expression-portraits/`, or `outfits/` before matching visual references.

No source image regenerated; final art standardization and live mobile/desktop screenshots remain pending.
