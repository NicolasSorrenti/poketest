# Riverside Park — environment regeneration brief (candidate, 2026-10-29)

## Authority and assets
- Canonical location ID: `park`. **Do not change game logic, map ID, or original `rpg.html`.**
- Approved style and camera benchmark: [Pixel Palace](../../rpg-assets/locations/arcade/overworld-map.webp) (1550 × 1120).
- [Park blueprint](../../overworld/maps/park-blueprint.svg) is schematic only; its zone captions differ from the [manifest](../../overworld/manifest.js), which wins.
- Existing [park panorama](../../rpg-assets/locations/panoramas/park-day.webp) informs setting identity, not spatial geometry.
- Prior image candidate `neo_campus_riverside_park_candidate_v1.png` and new `neo_campus_park_candidate_v2_master_1550x1120.png` are **conversation artifacts, not uploaded to GitHub and not approved**.

## Exact master-image geometry
- Canvas: **1550 × 1120** RGB, one continuous environment-only painting, no UI, text, NPCs, avatars, or sprite shadows.
- Existing foot anchors: P1 (640,420), P2 (905,420), P3 (640,700), P4 (905,700), E1 (350,450), E2 (1210,450), E3 (380,890), E4 (1200,900). Keep all eight on flat, unobstructed, dry, walkable pavement, with ~155 logical px of vertical clearance above each foot.
- Manifest hotspot rectangles are top-left `x,y,w,h` in actual rendering (verified in `overworld/prototype.js`), not center positions. Current rects:
  - Waterfront: (350,270,510,285)
  - Benches: (1070,270,670,305)
  - Flyer board: (350,710,515,345)
  - Garden: (1070,720,670,315)
- **Geometry issue:** both right-hand hotspot rectangles end at x=1740, outside 1550px canvas, clipping 190px. Do not silently change them during artwork production; request a separate manifest geometry fix after reviewing the final map. For composition, treat the intended right-hand zones as x≈1070–1540.

## Ready-to-generate visual brief
Premium original modern anime/JRPG town environment, vivid painted detail and warm afternoon light, matching Pixel Palace's slightly elevated overhead/isometric camera and object scale. Riverside Park is a landscaped public garden with a readable orthogonal promenade and continuous navigable ground. Put a **visible riverside/waterfront promenade on the upper-left** of the image, with blue water and low protective railing confined to that side; **several benches on the upper-right**; a **freestanding community flyer board in the lower-left**; and a **lush flower garden in the lower-right**. The middle must be an open cross-shaped paved pedestrian area with no fountain, trees, benches or other obstructions over the eight listed anchors. The lower entry corridor at x≈775 must remain dry and unobstructed. Place trees, hedges, lanterns and decorative planting toward outer edges and zone borders. Distinctive riverside identity, natural perspective, coherent walkable floor, no giant foreground water band, no playground replacing the waterfront, no fountain at the center, no NPCs or interface. Use 1550×1120 master coordinates. Frame the environment fully without a black surround.

## QA of the new image-generation pass
- Source generation: 1536×1024 RGB. Center crop to 1417×1024, then proportionally scale to 1550×1120; no non-uniform stretching. New master candidate is 1550×1120 RGB.
- **Rejected for promotion:** generator retained water along the entire bottom and a central fountain, put the flyer board on the right, and left the lower E3/E4 foot anchors in water. E1 intersects the pergola; P1/P2 are beside the fountain/planters. It therefore cannot be installed under the existing map coordinates.
- The QA overlay `neo_campus_park_candidate_v2_anchor_qa.png` is also only a conversation artifact. The final render must pass an anchor overlay check before manifest or map-image changes.
- No approved artwork was overwritten; no manifest or gameplay changes were made.

## Next
Regenerate Riverside Park with upper-left waterfront, upper-right benches, lower-left board, lower-right garden and dry open center, then run a visual anchor overlay. Only after validation and review consider moving a new asset to `rpg-assets/locations/park/overworld-map.webp`. Cafe follows park.
