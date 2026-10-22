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


## 2026-10-20 additional completed art

The following assets have been merged into this revised cumulative ZIP:
- 101 unique expression variants for the 20-character cast, exported as both 512x1024 transparent expression sprites and 280x380 dialogue faces (202 game-ready WebPs). The original 20 five-face sheets are also retained.
- Five NEW standalone G5 event illustrations (Hana apron, Reina rain, Shiori books, Yuna scattered cards, Kaede tangled bag), exported as 1920x1080 full CGs and 640x360 thumbs; all source PNGs are retained under art-production/original-story-renders/.
- Eight exploratory inspiration montages are preserved visually as quality-91 WebP rather than bulky PNG to keep this cumulative archive downloadable.
- The prior five G5 provisional scene compositions are archived under art-production/previous-g5-drafts/ for comparison only and are NOT used for the installable CG paths.
- For each new event, refer to rpg-assets/events/cg/season01/g5-regenerated-manifest.json.
- The original eight-heroines Gallery has 32 scenes in total. This pack includes the five new G5 scenes, but not all the other 27 as final installable images. Do not interpret this cumulative archive as the whole final gallery.

Note: artwork was not committed or pushed to the repository by packaging the ZIP.

## 2026-10-20 — 20 new individually illustrated NPC attack close-ups

This updated cumulative bundle now includes the NEW 20 close-up cut-ins. The game-ready
`rpg-assets/reactions/<character>/attack.png` images **replace** the older portrait-derived
attack assets. All 20 are 1280x720 transparent RGBA PNG.

The original unscaled high-resolution cut-in PNGs are available in the separate
`neo_campus_npc_battle_closeups_all_20_2026-10-20.zip` package. The preview and
per-character SHA256/source-dimensions manifest are included here at
`rpg-assets/reactions/closeups-art-manifest.json`. The older attack cutin manifest was
archived under `art-production/archived-manifests/` (its former asset files were
superseded). The updated `rpg-assets/reactions/manifest.json` uses the close-ups.

**Install only `rpg-assets/` for the game.** `art-production/` holds source artwork,
reference material, and archived documentation. Non-attack reaction poses are not
newly illustrated in this update. Nothing was pushed or deployed automatically.

## Packaging note: separate full-resolution battle originals

To keep the cumulative archive reliably downloadable, its 20 newest unscaled battle
source PNGs are not duplicated here. All **20 game-ready 1280×720 close-up cut-ins**,
new manifests, preview, and all earlier cumulative artwork ARE included.
Original generated battle sources are preserved in the separate ZIP:
`neo_campus_npc_battle_closeups_all_20_2026-10-20.zip`.
The `closeups-art-manifest.json` sourcePath pointers refer to those separate source
PNGs; they are not required for the game. No game assets are missing from this archive.


## Download-friendly scope of this cumulative pack

All game-ready artwork and original standalone story PNGs are included. Earlier
unused inspiration montage grids, provisional layout packs, and superseded
G5 composition drafts are omitted to keep this installable master archive
within download limits. They remain available in the preceding batch2 ZIP.
The 20 new unscaled battle source PNGs are likewise in the previously
delivered NPC battle-closeups original-source ZIP; all 20 new GAME CUTINS
are included here at their expected paths.
