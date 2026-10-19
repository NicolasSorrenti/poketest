# Neo Harbor RPG — Character Art Expansion (SFW)

## Installation
Extract this ZIP into the root of `NicolasSorrenti/poketest`. All binaries are additive and live under `rpg-assets/characters`, `rpg-assets/ui`, `rpg-assets/locations/panoramas`, and `rpg-assets/events/cg`. **Existing root portraits (`rpg-assets/reina.png` etc.), day backgrounds, and RPG scripts are not overwritten.**

`manifest.art-expansion.json` maps the established **Hana, Reina, Shiori, Yuna, Akari, Camila, Marina, Kaede** to real files. `checksums.json` lists dimensions and SHA-256 for every asset; run `verify_assets.py` after unpacking.

### Useful drop-in improvement (after visual approval)
To use any of the new main half-body portrait candidates in the existing game, replace only that character's root `rpg-assets/{id}.png` with the corresponding `rpg-assets/characters/{id}/portraits/primary.png`. Keep the canonical Reina portrait if you prefer the standalone original; this pack never replaces it automatically.

The existing RPG's `makeAvatar` references only root paths. The manifest and optional `integration.example.js` show how future interfaces can use expression badges, character icons, and story CGs without altering rules or dialogue.

### Art direction and production quality
- All named characters are established adult women (ages 19–24) with the existing hair colors, silhouettes, and costume identity.
- Original urban JRPG fashion direction: tactical straps, jewelry, layered knitwear, tailored coats, colorful streetwear, and modern accessories. SFW without nudity or explicit exposure.
- Portraits are native-resolution extracts from a consistent 1536×1024 sheet: each candidate is approximately **376×507**, **not** a standalone 4K illustration. Do not mistake resampling for additional detail.
- Four genuine expression icon poses exist for each character: **neutral / happy / flustered / determined**. They are icon crops, not separately re-illustrated full-body expression sprites; **angry, surprised, and flirty full VN portraits are not yet available**.
- Outfit previews use automatic light-backdrop matting and may have pale halos. Chibi figures retain their illustrated backing as rounded character stickers, transparent *only outside the card border*, to avoid deleting eyes or clothing. These are not isolated overworld sprites or animation frames.
- Environment panoramas and event CGs are clear, usable scene crops, but lower resolution than standalone environmental masters. Existing high-res shop backgrounds should remain authoritative.
- `ui/frames/` are procedurally drawn original PNG nameplates; no font files are included.

### Ownership / integration safety
Only the art pack is updated. Do not overwrite author-owned `rpg.js`, `rpg_story.js`, card-rules files, or any online duel UI. Art-to-story assignments should be reviewed with the RPG agent.

## Layout
- `characters/{id}/portraits/primary.png`: primary half-body portrait candidates
- `characters/{id}/expressions/*.png`: ~240×120 rounded expression panels with clean captions
- `characters/{id}/outfits/streetwear-preview.png`: fashion concept sprites with automatic transparency
- `characters/{id}/chibi/{front,side,back}.png`: illustrated sticker studies, not walk-cycle data
- `ui/avatars/{id}.webp`: 224×224 character selector assets
- `ui/frames/nameplate-{id}.png`: overlay-ready nameplate art
- `locations/panoramas/*.webp`: atmosphere backgrounds
- `events/cg/*.webp`: scenario illustration crops

**Known gaps:** No verified 4K individual character masters or cleanly isolated full-length character PNGs, no guaranteed six-expression VN portrait set, no frame-by-frame walk cycles, no additional scene CGs for Shiori and Kaede. These require another dedicated image-generation pass.
