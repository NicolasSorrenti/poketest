# Neo Harbor RPG / VN — art production status
Updated: 2026-10-17
Owner: art and character assets only. Source: `NicolasSorrenti/poketest`.

## Cast and visual continuity
Hana Mizuno (20), Reina Kurogane (21), Shiori Tsukishima (23), Yuna Hoshino (19), Akari Fujimoto (22), Camila Vega (24), Marina Aoki (21), Kaede Arashi (22). All are clearly adults. Retain canonical hair palettes, accessories, outfit signatures, age and personality from `rpg.js`, and original standalone Reina artwork.

## Prepared binary deliverable — manual Git integration pending
`neo_harbor_art_expansion_2026-10-17.zip` is an **attachment to the ChatGPT conversation**, not a GitHub release or existing branch folder.

- 8 primary portrait candidates, 8 selector portraits, 32 captioned expression panels, 8 outfit-concept full-body previews, 24 chibi directional stickers, 8 location panoramas, 6 SFW narrative event scenes and 8 character nameplate PNGs: **102 real images**.
- Organized under additive `rpg-assets/characters/{id}/...`, `rpg-assets/ui/`, `rpg-assets/events/cg/`, and `rpg-assets/locations/panoramas/`. The ZIP contains `manifest.art-expansion.json`, `checksums.json`, an installation guide and a verification script.
- Local archive verification: 102 images decoded, SHA256 hashes and manifest paths match, ZIP CRC passed. ZIP SHA256 `2a7173080138c1264eb8d012d462a540c74c775507b1b756c46e1bd9545840ed`.

## Important honesty / QA
These are source-backed extracts of original generated Neo Harbor art sheets, **not** eight separately generated 4K primary masters. Facial expression panels are genuine generated poses, but not full-size VN portrait permutations. Chibi artwork keeps opaque art-card backgrounds because attempting artificial cutouts removed clothing and facial details; these are directional reference stickers, not animation frames. Outfit mattes can show pale halos. Location backgrounds are lower-res concept panoramas. Scene CGs are illustrative candidates, not yet scripted events. Assets are original SFW urban JRPG-inspired fashion, not copied official character illustrations.

## Integration boundaries
**Do not claim these image paths exist on GitHub until the ZIP is manually merged.** The repository's existing root `rpg-assets/{id}.png` and backgrounds are unchanged. RPG agent owns scripts, character schedules and events; duel agent owns TCG rules; integration agent owns UI wiring. New art has no automatic game-code modifications.

## Next production priorities
1. Individually generate a high-resolution primary hero illustration per established cast member, approved against existing visual references.
2. True transparent standing character sprites, robust mask QA.
3. Neutral/happy/embarrassed/angry/surprised/flirty *full VN portraits* with consistent silhouettes and costumes.
4. Real frame-by-frame overworld sprites and independent high-res story CGs for Shiori and Kaede.
5. After art review, integrate approved art selectively and run live browser/mobile screenshot checks.


## 2026-10-17 — ZIP build integration prepared
- `scripts/install-rpg-art.js` safely extracts `asset-packs/neo_harbor_art_expansion_2026-10-17.zip` during package postinstall, explicit build and prestart using Node built-ins.
- 105 archive files in approved `rpg-assets/` paths were locally unpacked successfully and re-verified idempotently from the original 10.6 MB ZIP. All tracked canonical root portraits are preserved.
- Five automated tests cover idempotence, overwrite refusal, zip-slip, checksum pinning, symlink safety, and missing-archive behavior. Registered in Node CI.
- `docs/ART_PACK_INSTALL.md` explains the one manual GitHub ZIP upload.
- **Publication boundary:** This branch commits the build configuration and test harness only. Until the ZIP itself is uploaded to `asset-packs/`, GitHub and deployed sites do not contain the new binaries. Builds continue to show existing artwork.
