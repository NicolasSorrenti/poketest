# Neo Harbor RPG / VN — art production status

> **Production correction (2026-10-22):** All future image generator calls MUST obey `docs/ART_GENERATION_ONE_IMAGE_RULE.md`: one standalone in-game asset per generated image. Never generate concept boards, character grids, lineups, multi-expression sheets or mixed asset previews; reject any such output. This supersedes any older references to concept-sheet extraction as a preferred production workflow.
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

## 2026-10-18 — completed expression ZIP, pending binary upload
- Rebuilt the *single, complete* `neo_harbor_complete_art_pack_2026-10-18.zip` in the conversation container, **20,160,888 bytes**, SHA-256 `6683a2ba03e30c88b6d8c493e238cc3822972f8efa499c93ea62686d1f1269d5`.
- Preserves all 108 entries in the earlier pack, with 56 new image files: eight generated 6-panel source references and 48 independent labelled expression panels (neutral, happy, embarrassed, angry, surprised, flirty) for the eight established adult heroines.
- New PNG source grids were inspected and cropped; new portraits are WebP with baked illustrated backgrounds, not transparently isolated standing sprites. Images and manifests verified locally, all ZIP CRCs clean, no duplicate archive paths.
- Deployment installer now accepts **only the new version** and extracts additions into allowed `rpg-assets/` directories without overwriting canonical portraits. `package.json` build hooks are unchanged.
- The actual ZIP is **not committed** to GitHub by this text-only API integration. Upload the single archive to `asset-packs/` (manual GitHub UI or Work cloud browser), then deploy. UI expression-switching requires a separate approved integration milestone.

## 2026-10-18: Six missing supporting NPC portraits packaged
- Created one additive cumulative archive `neo_harbor_complete_art_with_guests_2026-10-18.zip` in the ChatGPT conversation, **36,136,397 bytes**, SHA256 `bd784ecd1b22d06fa31624768357e0fa78952ba854557ef816bf1eb056b23972`.
- Reused all 158 earlier image files *without regenerating them*, then added six newly generated transparent primary PNG portraits with exact game-root paths for Jun, Teo, Iris, Elio, Alma and Nereo, six compressed WebP alternatives and six menu avatars: **176 total image assets**.
- All six were drawn against `rpg_narrative_pack.js`, `rpg_side_quests.js`, and `RPG_NARRATIVE_EXPANSION.md`. Generated at 1086×1448 with RGBA transparency and distinctive canonical uniforms/accessories. No new dialogue, event scripts, or sidequest modifications.
- QA: 176 image files decoded, complete archive CRC and all 176 SHA256 entries validated; image source files and names compared with the character IDs used by `rpg.js` (`/rpg-assets/{id}.png`).
- Build extractor and instructions updated to allow the six new root PNGs and manifests; if ZIP alone is uploaded under `asset-packs/`, Node hooks extract automatically. **Binary ZIP itself is not present in GitHub yet**. Directly unzipping at repo root and committing the PNGs also works.

## 2026-10-18 — G5 scene-art pack prepared
- Eight previously generated illustrations encoded to 1920×1080 sRGB WebP and eight 640×360 thumbnails, using the G5 event IDs in `docs/cg-art-queue.json`.
- Separate additive ZIP: `neo_harbor_g5_situation_cgs_2026-10-18.zip` (3,600,073 bytes), SHA-256 `9806efda37ef03fd8409a550a4e3cca120673052e930a56ecda170f518fdcf27`. 18 archive entries including a manifest and README. Integrity and 16 image dimensions verified.
- 3 scenes match reasonably; 5 are provisional action mismatches, flagged in manifest and `docs/G5_ART_UPLOAD.md`. No artwork regeneration or changes to existing portraits.
- Updated script to optionally extract this second archive when committed to `asset-packs/`; **binary ZIP is not present in GitHub until user uploads it**.
