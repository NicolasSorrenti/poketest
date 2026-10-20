# Neo Campus TCG — Story CG batch (Jinx, Luna, Sol)

This ZIP contains 4 original CG illustrations and 4 thumbnails, exported as WebP.
Extract directly at the root of your `poketest` repository. It will create:

- rpg-assets/characters/jinx/jinx_alma_cafe.webp — Jinx & Alma café crossover
- rpg-assets/characters/jinx/jinx_unguarded.webp — Jinx quiet park scene
- rpg-assets/characters/luna/luna_stretch.webp — Luna reaches for a shelf
- rpg-assets/characters/sol/sol_scavenger_hunt.webp — Sol waterfront scavenger hunt

Thumbnails are in the corresponding `thumbs/` subfolders. These **full-scene CGs use opaque backgrounds on purpose**; character portraits and duel cut-ins should remain transparent.

The full-resolution files are 1920 × 1080, thumbnails 640 × 360. Paths match the event-image paths in each character's `art_manifest.json` as of packaging. This archive does not change the manifest files or runtime code.

Commit the extracted image files, not the ZIP. If .gitignore excludes artwork, use `git add -f rpg-assets/characters/jinx/*.webp rpg-assets/characters/luna/*.webp rpg-assets/characters/sol/*.webp` and also add the `thumbs/` directories as needed.
