# Home v5 art QA — 2026-10-29

**Status:** visual candidate only, **rejected for integration**. The new original 1550×1120 RGB painting and red-clearance/blue-hotspot overlay are conversation artifacts, not repository binaries; no approved game map or manifest was replaced.

## Exact references
- [Approved Pixel Palace camera/style](../../rpg-assets/locations/arcade/overworld-map.webp)
- [Home blueprint](../../overworld/maps/home-blueprint.svg)
- [Home spatial target v1](home-spatial-target-v1.svg)
- [Canonical manifest](../../overworld/manifest.js)

## Source and geometry
Generated source 1536×1024; center-cropped horizontally to 1417×1024, then uniformly resized to 1550×1120 to match the existing master-image coordinate system. The painting is environment-only, with no NPCs or game UI. Review archive in the conversation: `Neo_Campus_Home_v5_Concept_QA.zip` (clean image, QA overlay, README). Not uploaded to GitHub.

## Integration QA
The painting fails the four fixed furniture/hotspot identities:
- `desk` (x105–650, y170–495) contains a bed, not a deck/journal desk.
- `bed` (x900–1440, y170–495) contains TV/lounge and kitchen, not a bed.
- `wardrobe` (x105–605, y585–910) contains the computer desk.
- `window` (x925–1440, y585–910) contains bathroom/entrance, not a window nook.

Using a 92×164 standing-sprite envelope with its bottom center at each manifest anchor, P1 overlaps wardrobe/shoes; P2 overlaps TV/lounge; E1 overlaps partition/plant; E2 overlaps sofa; E4 crowds entrance planter. P3/P4/E3 appear comparatively open but are not enough to approve. Do not adjust the manifest to compensate for wrong room composition.

## Next generation instructions
Treat `home-spatial-target-v1.svg` as a **hard spatial constraint**: desk wholly in upper-left (furniture around x145–475, y260–360), bed wholly in upper-right (x1095–1380, y255–395), wardrobe wholly in lower-left (x150–465, y695–813), window/personal nook wholly in lower-right (x1120–1405, y725–787). Maintain all eight 92×164 sprite envelopes, a clear center aisle, and the bottom-center entrance. Premium colorful painted anime, elevated three-quarter camera consistent with Pixel Palace. No NPCs, UI, or embedded hotspots. Generate a new candidate, audit all eight anchors and four hotspot identities before promotion.

No gameplay, `rpg.html`, approved Pixel Palace, or canonical art modified.
