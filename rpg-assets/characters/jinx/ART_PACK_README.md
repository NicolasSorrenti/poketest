# Jinx Rivera — provisional extracted art pack

This package contains **real cropped image files**, not merely a single character-sheet picture.

## Ready to preview (matches path contract of `characters/jinx/art_manifest.json`)
- `rpg-assets/characters/jinx/neutral.png`: cropped primary portrait, transparent matte
- `rpg-assets/characters/jinx/{neutral,smirk,judgy,fire,soft}.webp`: five face/expression crops with studio backgrounds

## Additional artwork (not automatically displayed by the RPG)
- `rpg-assets/characters/jinx/cutins/`: 2 battle/reaction concepts
- `rpg-assets/characters/jinx/concept-cgs/`: 4 independent story-image concepts and thumbnails
- `rpg-assets/characters/jinx/reference/`: 2 full-resolution source character-sheet illustrations
- `rpg-assets/characters/jinx/previews/`: 1 avatar concept

## IMPORTANT QUALITY / SCRIPT WARNINGS
1. Source art depicts **dark purple / black hair and pink eyes**, but the current official character bible (`characters/jinx/bible.md`) specifies **silver-white hair with neon-pink underlights and amber eyes**. Do NOT treat these images as canonical without approving a character design change or regenerating them to match the bible.
2. The four scripted CGs (`jinx_arcade_challenge.webp`, `jinx_unguarded.webp`, `jinx_marina_park.webp`, and `jinx_alma_cafe.webp`) have **not** been generated accurately. The included concept scene illustrations do not depict the specified characters and settings. To avoid showing wrong scenes, the ZIP intentionally does not fake those exact files.
3. Expression art was cropped from a multi-image collage. It is a real individual WebP for each emotion but lower resolution than separately generated expressions; expression panels have backgrounds.
4. The primary portrait is a manually matted, cropped panel and may need some cleanup at the edges.

## Commit to GitHub (your repository ignores this directory)
Extract ZIP at repo root, preserving `rpg-assets/...`, then run:

```bash
git add -f rpg-assets/characters/jinx
git commit -m "Add Jinx provisional portrait and expression assets"
git push origin main
```

No file exceeds GitHub's 100MB individual-file limit. The ZIP is not required in your repository.
