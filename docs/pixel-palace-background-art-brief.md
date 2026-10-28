# Pixel Palace — Approved Art Direction / Production Background Brief

Reference direction: large, continuous three-quarter overhead/isometric arcade in a vibrant modern-anime JRPG style. Neon purple, pink and blue light; tiled floor; plentiful retro arcade cabinets; prize/claw machines; tournament tables; lounge seating; plants; elevated architectural details. Mood: welcoming, lively, dense but easy to read on a mobile viewport.

## HARD REQUIREMENTS FOR THE FINAL BACKGROUND
1. **Environment-only artwork.** No people, character figures, silhouettes, NPCs, character faces, dialogue bubbles, off-screen indicators, cards, menus, title plates, map HUD, or overlays. All these belong in separate game layers.
2. Single seamless, continuous image — not multiple stitched/scrolling scenes or separate screens.
3. Isometric / three-quarter elevated view that leaves open, traversable-looking floor patches around dynamic character anchors.
4. Output aspect ratio **1550:1120**, ideally export at **3100 x 2240 PNG or WebP**. Reference coordinates are in the 1550x1120 logical-pixel canvas.
5. The location's physical attractions should remain visually identifiable without UI: arcade banks, lounge, tournament section, vending/counter zone.
6. Leave conspicuous open floors at primary anchors (685,480), (865,485), (690,590), (865,600) with room for full-body transparent sprite overlays. Secondary anchors are documented in `docs/draggable-overworld-prototype.md`.
7. Do not render a complete game screenshot. We need an environment texture that can be reused with any characters and any number of interactions.

## Assets
- Place approved environment image at `rpg-assets/locations/arcade/overworld-map.webp`.
- Set `BACKGROUND_URL` in `overworld-prototype.html` to `/rpg-assets/locations/arcade/overworld-map.webp` after adding the file.
- Make future NPC sprites transparent; allow multiple outfits/poses but never bake those into the environment.
- Validate placement by toggling the Guides overlay in the prototype.

## Status
A visual-art concept pass has been generated in the design conversation. The resulting images include composited interface elements and characters and are **not clean background assets**; do not use them as a production map. The prototype currently displays the intentionally schematic guide map until a clean environment image is approved and committed.
