# Neo Campus RPG G5 Situation CGs — additive art pack

This package contains **eight full event CG images** and **eight corresponding gallery thumbnails**, all re-encoded from the original eight artwork files created earlier. No other game files, sprites, portraits or story scripts are included.

Extract the ZIP at the **repository root** so paths land at exactly:

    rpg-assets/events/cg/season01/<id>.webp
    rpg-assets/events/cg/season01/thumbs/<id>.webp

The game already references these eight event IDs via `rpg_situations.js` and `rpg_cg_gallery.js`. The images are 1920×1080 sRGB WebP and the thumbnails are 640×360 sRGB WebP. All 16 exact paths and file hashes are in `g5-art-manifest.json`.

**Art handoff accuracy:** Only Akari, Camila and Marina's scenes approximately match the scripted action. Hana, Reina, Shiori, Yuna and Kaede's images depict a different moment. They are intentionally provided as provisional CGs under the correct G5 filenames so the UI can display art, and are clearly flagged in the manifest. Replace those five only after approved scene-accurate artwork is created.

**Git instructions (direct file commit):** 

    unzip neo_harbor_g5_situation_cgs_2026-10-18.zip -d .
    git add -f rpg-assets/events/cg/season01
    git commit -m "art(rpg): add G5 situation CGs and gallery thumbs"
    git push

**Single ZIP upload alternative:** The current `scripts/install-rpg-art.js` only auto-unpacks the older checksum-pinned complete archive. Uploading this additive ZIP to `asset-packs/` alone will NOT install it unless the build extractor is updated to include this specific archive and hash. Do not rename this ZIP as the older archive; validation would fail.

Unzipping directly to the repo root and committing the files always works with the existing game paths. No unrelated source files are overwritten by this archive.
