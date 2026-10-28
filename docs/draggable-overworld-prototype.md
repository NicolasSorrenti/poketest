# Draggable Overworld — experimental Render branch

Branch: `feature/draggable-overworld-prototype`. Open `/overworld-prototype.html` after deploying this branch. This page is deliberately isolated from the live `/rpg.html` campaign and **does not persist or modify saves**.

## Current behavior
- A single continuous 1550 × 1120 logical-pixel Pixel Palace map.
- Drag/touch-drag to pan, with constrained camera bounds; Center returns to the primary play area.
- Four primary character anchors (`P1–P4`) and eight additional spots (`E1–E8`).
- Eight sample characters. Clicking an off-screen circular face marker pans toward its actual anchor.
- Clicking a character opens an isolated interaction panel; Talk, Duel, Spend time and Make plans are placeholders, **not connected to live RPG actions**.
- Guides toggle shows/hides the temporary environment composition markup.
- Character portraits are read from existing `/rpg-assets/characters/<id>/portraits/primary.png` paths; missing files show letter silhouettes.

## Background illustration handoff
Edit `BACKGROUND_URL` in `overworld-prototype.html` to point at a new environment-only image, e.g. `/rpg-assets/locations/arcade/overworld-map.webp`. Design the source at the same `1550:1120` aspect ratio, ideally at 3100 × 2240 or better for high-density screens. **Do not bake characters, labels, or interaction indicators into the background.** The positions below are measured in 1550 × 1120 logical pixels.

| Anchor | x | y | purpose |
| --- | ---: | ---: | --- |
| P1 | 685 | 480 | primary, Reina demonstration |
| P2 | 865 | 485 | primary, Yuna demonstration |
| P3 | 690 | 590 | primary, Barb demonstration |
| P4 | 865 | 600 | primary, Jinx demonstration |
| E1 | 265 | 440 | west cabinets |
| E2 | 1230 | 440 | east prizes |
| E3 | 395 | 915 | southwest seating |
| E4 | 1150 | 930 | southeast games |
| E5 | 340 | 245 | upper west |
| E6 | 1150 | 240 | upper east |
| E7 | 580 | 990 | lower center west |
| E8 | 990 | 995 | lower center east |

For final integration, resolve `PEOPLE` from the RPG's current people-at-location schedule and allocate unoccupied spots, prioritizing four central anchors. Preserve the existing VN dialogue/duel/time/autosave engines. Replace the demonstration sprite crop with dedicated transparent overworld sprites once approved.

## Render test
Create a separate Render Web Service from this repository and select `feature/draggable-overworld-prototype` as its branch. Reuse the existing Node start command `npm start` (or `node server.js`), and open `https://<your-preview-service>/overworld-prototype.html`. Keep the current production service pinned to `main`. No PR merge is required for preview.

## Test checklist
1. Verify map drags in both directions on mobile and desktop, without scrolling the browser page.
2. Tap the four primary characters to open/close the panel.
3. Drag away from the center and confirm off-screen face markers appear and jump to their targets.
4. Toggle guides and recenter.
5. Resize/orient the device, repeat with eight demo characters.
6. Verify the production RPG URL remains unchanged.

## Pixel Palace illustrated v1
The HTML now automatically tries to load `/rpg-assets/locations/arcade/overworld-map.webp` and falls back to the original schematic until that binary asset is uploaded. The prepared clean environment art file is named `overworld-map.webp` and is 1550 x 1120 pixels. On GitHub, upload it to **this experimental branch only** at `rpg-assets/locations/arcade/overworld-map.webp`. The Render preview auto-deploys from branch commits.

The prototype includes seven independently clickable developer hotspots: west arcade cabinets, north retro machines, prizes, claw machines, tournament tables, lounge and drinks. The **Guides** toggle hides/shows activity-zone labels and the **Center** control recenters the camera. Hotspots are intentionally demonstration-only; no RPG actions or save logic are modified.

The proposed art is closely aligned with the blueprint composition, but exact background hotspot matching should be validated visually after upload, since image generation does not preserve geometry perfectly.
