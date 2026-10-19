# Neo Harbor complete character & environment art pack — 2026-10-18

## Install (no code changes)
1. Extract this ZIP **at the root of NicolasSorrenti/poketest**, not inside an already-existing rpg-assets folder.
2. Commit and push the new `rpg-assets/` files (or drag the `rpg-assets/` folder into a Git working copy and stage it).
3. Redeploy the game. The current `rpg.js` calls `/rpg-assets/{id}.png`, so Jun, Teo, Iris, Elio, Alma and Nereo automatically display their new artwork.
4. Existing eight heroine root portraits (`rpg-assets/{hana,reina,shiori,yuna,akari,camila,marina,kaede}.png`) are **not in this ZIP** and therefore cannot be overwritten by it.

This is a **cumulative** ZIP: it contains 158 previously packaged images and 18 new supporting-NPC files (six actual transparent primary PNGs + six WebP primary alternatives + six optimized thumbnails). It does not duplicate previously generated character art by generating it again.

## New NPC IDs and live game URLs
- Jun Arai → `rpg-assets/jun.png`
- Teo Álvarez → `rpg-assets/teo.png`
- Iris Navarro → `rpg-assets/iris.png`
- Elio Soto → `rpg-assets/elio.png`
- Alma Serrano → `rpg-assets/alma.png`
- Nereo Paz → `rpg-assets/nereo.png`

For upgraded future UIs, each guest also has `rpg-assets/characters/<id>/portraits/primary.webp` and `rpg-assets/ui/avatars/<id>.webp`.

## QA and known limitations
- These are six individually generated original SFW full-portrait illustrations on alpha-transparent backdrops, named for the six adult supporting NPCs in `rpg_narrative_pack.js` and `rpg_side_quests.js`.
- Their facial expressions and outfits match the descriptive bibles; guest expression variants / alternate outfits / walk cycles are **not yet authored**.
- There is no engine modification and no new story dialogue in the archive.
- This ZIP's `rpg-assets/complete-art-manifest.json`, `rpg-assets/guest-portraits-manifest.json` and `rpg-assets/complete-art-checksums.json` describe the contents.
- Due to automated Git ignore rules in the repository for `rpg-assets/characters/` and `rpg-assets/ui/`, after unzipping, use `git add -f rpg-assets/characters rpg-assets/ui` if you want to commit those existing expansion art directories; root `rpg-assets/jun.png` etc. are not ignored.

Do not extract this cumulative ZIP on top of an installation containing manually edited versions of expansion images without comparing files first. If you want only the six guests, extract just the root PNGs and their matching optimized files/manifest.
