# Neo Campus — all recoverable overworld character artwork
This archive groups the character artwork available in this ChatGPT session. **The 42 PNGs in `rpg-assets/characters/<id>/overworld/` are individual sprite images.** The 33 assets in `art-production/overworld-source-archive/` are original sheets, earlier variations or raw sources. They are **not** intended for direct loading by the RPG.
## How to install
Extract the ZIP at the **root** of the `NicolasSorrenti/poketest` repository, preserving folders. Existing approved artwork has not been overwritten here. No GitHub changes were performed. **Caution:** These file paths are consistent with the project's asset convention, but the RPG still needs pose/scene registration in `overworld/manifest.js` or its runtime renderer to display most of them; merely unzipping is not enough to make every character appear. The existing Reina, Barb and Jinx assets are untouched.
## QA and known limitations
- Individual images in `rpg-assets/...` have RGBA channels and were cropped close to the visible artwork.   The grouped compositions are stored separately and never inside a character's active sprite path.
- Some hair-edge transparency and unusually large poses should be checked at actual in-game scale.   In particular, `shiori/reaching-book-back.png` was extracted from a user-supplied checkerboard-background correction   and retains possible fine-hair extraction artifacts; its original is archived.
- Rina's `reaching-idol.png` includes a leg cropped in the original generated sheet; no missing anatomy was fabricated.
- Some new sprites were generated with fairly front-facing anatomy; slight overhead/three-quarter art QA remains useful.
- Raw source sheets may contain multiple characters, overlapping silhouettes, gradient backgrounds or rejected outfit/identity variants.   Do **not** import `art-production/overworld-source-archive` files as sprites.
- This includes all recoverable, identifiable images from the working container; previously displayed images that were   not retained as separate files cannot be recovered or represented as verified PNGs.   In particular, an earlier Camila bending-to-book standalone is not recoverable as a separate source here.
- Characters described as already completed elsewhere (Barb, Reina, Jinx, Daisy) are not duplicated from the repo.   No canonical reference/attack cut-in images from the user-provided character library ZIP are duplicated.

## Game sprite paths

### Yuna — 6 PNGs
- `rpg-assets/characters/yuna/overworld/back-three-quarter.png` (986x1525)
- `rpg-assets/characters/yuna/overworld/side-pose.png` (955x1519)
- `rpg-assets/characters/yuna/overworld/headphones.png` (982x1530)
- `rpg-assets/characters/yuna/overworld/gamer-idle.png` (1013x1522)
- `rpg-assets/characters/yuna/overworld/crouching-cards.png` (1024x1482)
- `rpg-assets/characters/yuna/overworld/seated-cards.png` (1024x1533)

### Hana — 3 PNGs
- `rpg-assets/characters/hana/overworld/standing-back.png` (440x980)
- `rpg-assets/characters/hana/overworld/phone-standing.png` (499x996)
- `rpg-assets/characters/hana/overworld/kneeling-bag.png` (484x745)

### Laca — 6 PNGs
- `rpg-assets/characters/laca/overworld/casual/walking-back.png` (612x1523)
- `rpg-assets/characters/laca/overworld/casual/reaching-out.png` (650x1503)
- `rpg-assets/characters/laca/overworld/casual/crouching.png` (1020x1526)
- `rpg-assets/characters/laca/overworld/lifeguard/front-leaning.png` (641x1526)
- `rpg-assets/characters/laca/overworld/lifeguard/back-rescue-buoy.png` (578x1526)
- `rpg-assets/characters/laca/overworld/lifeguard/kneeling-lookout.png` (916x1499)

### Rina — 5 PNGs
- `rpg-assets/characters/rina/overworld/reaching-idol.png` (571x1010) — Source pose has a cropped leg in original render
- `rpg-assets/characters/rina/overworld/over-shoulder.png` (418x1003)
- `rpg-assets/characters/rina/overworld/seated-cards.png` (597x785)
- `rpg-assets/characters/rina/overworld/alternate-card-pose.png` (891x1535) — Alternate/candidate pose
- `rpg-assets/characters/rina/overworld/alternate-idol-pose.png` (940x1526) — Alternate/candidate pose

### Akari — 8 PNGs
- `rpg-assets/characters/akari/overworld/over-shoulder-cardigan.png` (513x1535)
- `rpg-assets/characters/akari/overworld/clipboard-writing.png` (560x1527)
- `rpg-assets/characters/akari/overworld/seated-clipboard.png` (916x1507)
- `rpg-assets/characters/akari/overworld/fashion-sketch.png` (420x999)
- `rpg-assets/characters/akari/overworld/standing-clipboard.png` (557x1503)
- `rpg-assets/characters/akari/overworld/over-shoulder-bag.png` (506x1516)
- `rpg-assets/characters/akari/overworld/presenting-designs.png` (693x1530)
- `rpg-assets/characters/akari/overworld/seated-coffee-laptop.png` (945x1529)

### Shiori — 4 PNGs
- `rpg-assets/characters/shiori/overworld/over-shoulder.png` (839x1443)
- `rpg-assets/characters/shiori/overworld/standing-book.png` (881x1530)
- `rpg-assets/characters/shiori/overworld/reaching-book-front.png` (1020x1530)
- `rpg-assets/characters/shiori/overworld/reaching-book-back.png` (832x1148) — Background algorithmically removed; fine lavender hair edges need manual QA; book cropped by original

### Camila — 2 PNGs
- `rpg-assets/characters/camila/overworld/standing-front.png` (572x1526)
- `rpg-assets/characters/camila/overworld/standing-back.png` (533x1535)

### Marina — 3 PNGs
- `rpg-assets/characters/marina/overworld/standing-front.png` (728x1533)
- `rpg-assets/characters/marina/overworld/looking-back.png` (847x1535)
- `rpg-assets/characters/marina/overworld/seated-relaxing.png` (1024x1536)

### Kaede — 5 PNGs
- `rpg-assets/characters/kaede/overworld/standing-front.png` (708x1532)
- `rpg-assets/characters/kaede/overworld/looking-back.png` (651x1523)
- `rpg-assets/characters/kaede/overworld/crouching-relaxed.png` (1018x1536)
- `rpg-assets/characters/kaede/overworld/arcade-playing-front.png` (765x1536)
- `rpg-assets/characters/kaede/overworld/arcade-playing-back.png` (666x1493)

## Source-only archive paths

### akari
- `art-production/overworld-source-archive/original-combined-sheets/akari/a_clean_high_resolution_anime_illustration_collag.png`
- `art-production/overworld-source-archive/original-combined-sheets/akari/a_clean_high_resolution_anime_illustration_sheet.png`
- `art-production/overworld-source-archive/original-combined-sheets/akari/anime_character_pose_sheet_in_lavender_and_plaid.png`
- `art-production/overworld-source-archive/original-combined-sheets/akari/four_poses_of_a_stylish_anime_woman.png`
- `art-production/overworld-source-archive/original-combined-sheets/akari/imagen(20261029-185118).png`
- `art-production/overworld-source-archive/original-combined-sheets/akari/wide_clean_png_like_composite_illustration_on_a_t.png`

### backup-random-npc
- `art-production/overworld-source-archive/original-combined-sheets/backup-random-npc/a_clean_high_resolution_character_sheet_sprite.png`
- `art-production/overworld-source-archive/original-combined-sheets/backup-random-npc/a_clean_high_resolution_transparent_background_c.png`
- `art-production/overworld-source-archive/original-combined-sheets/backup-random-npc/a_clean_png_transparent_background_character_sheet.png`
- `art-production/overworld-source-archive/original-combined-sheets/backup-random-npc/a_clean_transparent_background_png_style_character.png`
- `art-production/overworld-source-archive/original-combined-sheets/backup-random-npc/a_clean_transparent_background_sprite_character_sh.png`
- `art-production/overworld-source-archive/original-combined-sheets/backup-random-npc/wide_clean_png_illustration_sheet_on_a_transparent.png`

### camila
- `art-production/overworld-source-archive/original-combined-sheets/camila/a_clean_high_resolution_character_illustration_st.png`
- `art-production/overworld-source-archive/original-combined-sheets/camila/a_clean_transparent_background_illustration_png_s.png`
- `art-production/overworld-source-archive/original-combined-sheets/camila/imagen(20261029-202908).png`
- `art-production/overworld-source-archive/original-combined-sheets/camila/overall_scene_a_clean_high_resolution_anime_styl.png`

### hana
- `art-production/overworld-source-archive/original-combined-sheets/hana/a_clean_high_resolution_character_sprite_sheet_on.png`

### kaede
- `art-production/overworld-source-archive/alternates-and-unprocessed/kaede/imagegen.png`

### laca
- `art-production/overworld-source-archive/alternates-and-unprocessed/laca/a_clean_cutout_illustration_on_a_transparent_backg.png`
- `art-production/overworld-source-archive/alternates-and-unprocessed/laca/a_clean_high_quality_anime_manga_style_illustra.png`
- `art-production/overworld-source-archive/alternates-and-unprocessed/laca/a_clean_high_quality_anime_style_illustration_ren.png`
- `art-production/overworld-source-archive/alternates-and-unprocessed/laca/a_clean_high_quality_anime_style_illustration_wit.png`
- `art-production/overworld-source-archive/alternates-and-unprocessed/laca/a_clean_png_style_illustration_on_a_transparent_ba.png`
- `art-production/overworld-source-archive/alternates-and-unprocessed/laca/a_clean_png_transparent_background_anime_style_ill.png`
- `art-production/overworld-source-archive/alternates-and-unprocessed/laca/a_clean_png_transparent_background_illustration_n.png`
- `art-production/overworld-source-archive/alternates-and-unprocessed/laca/full_body_anime_style_character_illustration_on_a.png`
- `art-production/overworld-source-archive/alternates-and-unprocessed/laca/full_body_illustration_on_a_transparent_background.png`
- `art-production/overworld-source-archive/alternates-and-unprocessed/laca/high_resolution_anime_style_illustration_single_c.png`
- `art-production/overworld-source-archive/original-combined-sheets/laca/a_clean_composite_sheet_of_anime_style_character_r.png`
- `art-production/overworld-source-archive/original-combined-sheets/laca/a_clean_studio_like_composite_illustration_on_a_t.png`

### rina
- `art-production/overworld-source-archive/original-combined-sheets/rina/wide_transparent_background_png_style_illustration.png`

### shiori
- `art-production/overworld-source-archive/alternates-and-unprocessed/shiori/a_highly_detailed_anime_style_illustration_full_b.png`
- `art-production/overworld-source-archive/alternates-and-unprocessed/shiori/imagen(20261029-201428).png`

## Other files
- `ASSET_INVENTORY.csv` — all files and status/QA notes
- `POSE_PATHS.json` — character-to-sprite mapping for future integration
- `SHA256SUMS.txt` — checksum list
- `PREVIEW_ALL_CHARACTERS.jpg` — overview of the 42 individual sprites
