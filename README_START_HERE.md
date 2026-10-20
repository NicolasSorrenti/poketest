# Neo Campus TCG — ALL artwork since the portrait regeneration

**Single cumulative archive for the portrait-refresh art milestone, October 19–20, 2026.**

## Extract

Unzip the archive into the root of your local `poketest` repository.
- `rpg-assets/` contains the installable artwork and a few supplied documentation manifests.
- `art-production/` contains additional original render PNGs, draft concepts, and inspiration collages. It is safe to keep this folder out of the production repo or commit separately.

## Included

- 20 latest **1024 x 1536 transparent PNG** primary portraits (not the older portrait versions).
- 20 new **PNG expression sheets**, one for each character (five expressions on each sheet; these are *sheets*, not pre-wired per-emotion files).
- 20 **transparent 1280 x 720 PNG attack cut-ins**, plus RPG reaction manifest.
- 14 **scripted event CG slots** originally supplied in two batches (10 draft + 4 newer originals); several provisional slots have been upgraded with standalone original renders. Each has a 1920 x 1080 WebP and 640 x 360 WebP thumbnail.
- Newly illustrated standalone CG PNG renders in `art-production/original-story-renders/`, including alternative/unused scenes.
- Draft crossover and composition concepts stored separately in `art-production/`, for reference only.
- Exploratory art montages under `art-production/inspiration-montages/` **not suitable as directly installed CGs**.
- Exact compatibility aliases for character portraits expected by Jinx, Luna, Rina, Elena, Sierra, Sol, and Reina.

## Why not the older 266 MB art pack?

This package is intentionally scoped to **art produced or refreshed since the user's decision to regenerate the entire cast**. It doesn't reinstall all legacy 2026-10-17/18 portrait styles, chibis, and earlier event art, as that would mix in outdated characters. Keep existing repo backgrounds/chibis unless separately refreshed.

## Git commands (after extraction)

```bash
git add -f rpg-assets/
git commit -m "Add cumulative refreshed Neo Campus RPG art"
git push origin main
```

If you also want to commit the source references, add `art-production/` separately (the PNG renders make the repository significantly larger). **Do not commit the ZIP itself**.

## Status / honest limitations

- Story event **composites** are placeholders; even when the path matches a scripted event they are not necessarily bespoke scene illustrations. The later, original scenes override several, but some remain provisional.
- Some original render scene compositions have shifted costumes/settings slightly; see `art-production/ASSET_INDEX.json` for provenance/status.
- Expression sheets are not yet auto-separated or integrated into VN face switching.
- None of the art in this ZIP has been pushed to GitHub by this packaging step.
