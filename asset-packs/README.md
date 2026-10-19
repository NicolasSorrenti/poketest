# Binary art packs

Place `neo_harbor_complete_art_with_guests_2026-10-18.zip` in this folder using **GitHub → Add file → Upload files**.

The deployment installer verifies and unpacks it into `rpg-assets/` automatically during `npm install`, `npm run build`, or `npm start`.

See [docs/ART_PACK_INSTALL.md](../docs/ART_PACK_INSTALL.md) for the exact SHA-256 and integration instructions.

The ZIP itself must be uploaded separately; this folder README is not the asset pack.

This complete archive includes all previous art plus 48 new individually addressable VN emotion panels. Do not upload the old and new ZIP under the same required filename; the installer checks SHA-256.

The new cumulative pack adds six supporting adult NPCs as `rpg-assets/{jun,teo,iris,elio,alma,nereo}.png`; the existing RPG client loads them immediately after extraction.

## Optional G5 event CG archive

Upload `neo_harbor_g5_situation_cgs_2026-10-18.zip` here **in addition to** the original archive. It is an independent eight-scene art pack with exact in-game CG paths and a pinned checksum. The installer automatically extracts both, when present. See `docs/G5_ART_UPLOAD.md`.
