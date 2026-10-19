# Neo Campus — G5 situation event CGs

This is the **additive**, checksum-verified scene-art pack. It does not replace the previous Neo Harbor complete art archive.

## One ZIP upload

Upload the file `neo_harbor_g5_situation_cgs_2026-10-18.zip` from the ChatGPT conversation to:

```text
asset-packs/neo_harbor_g5_situation_cgs_2026-10-18.zip
```

Keep the filename unchanged. GitHub's **Add file → Upload files** works. On the next Render build/server start, `scripts/install-rpg-art.js` installs this optional pack as well as the older base archive. The existing `npm install`, `npm run build` and `npm start` hooks already run this script.

SHA-256: `9806efda37ef03fd8409a550a4e3cca120673052e930a56ecda170f518fdcf27`

## Files in the archive

- Eight full-resolution (1920 × 1080 sRGB WebP) situation CGs at `rpg-assets/events/cg/season01/<id>.webp`.
- Eight gallery thumbnails (640 × 360 WebP) at `rpg-assets/events/cg/season01/thumbs/<id>.webp`.
- `rpg-assets/events/cg/season01/g5-art-manifest.json` maps IDs to paths, hashes, source filenames and production-review status.
- `rpg-assets/events/cg/season01/README_G5_ART.md` provides the direct-unzip alternative.

The image IDs are: `hana_apron_mixup`, `reina_rain_catch`, `shiori_bookstack_wobble`, `yuna_card_scatter`, `akari_notes_whirl`, `camila_windy_receipts`, `marina_beach_towel`, `kaede_jacket_prank`.

## Production honesty

**Five illustrations are provisional**: Hana's books in the library (rather than the apron event), Reina at sunset (rather than rain at center), Shiori at a moonlit tea table (rather than wobbling bookshelf), Yuna at a claw machine (rather than spilled cards) and Kaede at a rainy vending machine (rather than the jacket prank). Their narrative trigger IDs are correct so the Gallery displays them, but the specific depicted action differs. Akari's flying notes, Camila's windblown receipts and Marina's riverside towel approximately match their assigned events. No characters, portraits or story scripts are altered.

The complete queue in `docs/cg-art-queue.json` defines 32 separate CGs; this additive pack fills only these eight G5 event IDs (8 full + 8 thumbnails). It is not an assertion that the other 24 are completed.

For direct extraction instead of one-ZIP build deployment: unzip at repo root and `git add -f rpg-assets/events/cg/season01` (the generated CG folder is ignored to prevent accidentally tracking extracted assets twice).
