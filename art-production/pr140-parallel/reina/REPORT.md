# Reina / Shiori / Yuna worker handoff

Audited PR140 head `8902bb3ed26c8f3f2c8646a1a26c14b2522b8e49`, branch `art/overworld-character-refresh`. No repository files, commits, or GitHub state changed. Shared checkout contained coordinator changes and was read only. Remote runtime source was checked directly at the pinned head.

## Result

No genuinely missing compatible artwork for this batch: happy and surprised exist for all three characters. Reuse the six existing transparent expression portraits; neutral copies are included as fallbacks. All nine files are 512 × 1024. Local blob SHA values match the pinned GitHub tree. SHA256, dimensions, source, exact target and thumbnail paths are in manifest.json.

## Runtime gap requiring coordinator integration

`rpg.js` portraitPaths uses cast[id].outfitArt or CharacterPacks.byId(id).art. None of these three has a generated character pack or outfitArt. expressionGuests excludes them. Consequently dialogue expressions resolve to the static fallback: Reina `/rpg-assets/characters/reina/portraits/primary.png`, Shiori `/rpg-assets/shiori.png`, Yuna `/rpg-assets/yuna.png`. The installed expression-portraits files are not reached through this scene selector.

Coordinator can add an explicit scene route for these three using existing neutral/happy/surprised expression-portraits, retaining their static fallback. Other dialogue states (vulnerable, irritated, determined) need deliberate aliases/fallback policy; these were not additional expression-generation targets in this batch. Do not assume the dialogue emits soft/concerned: its classifier uses vulnerable/irritated/determined instead.

`rpg_match_reactions.js` classifies all three as VN_MAIN and selects `/rpg-assets/characters/<id>/vn-expressions/<expression>.webp`. These are identity-compatible rectangular illustrations with baked decorative backgrounds, not transparent overworld cutouts. An explicit battle mapping is needed if using the packaged transparent pair there; preserve dedicated attack-art precedence. Do not globally change every VN_MAIN character.

## Exact target files (already present on GitHub)

| Character | Happy | Surprised |
|---|---|---|
| Reina | /rpg-assets/characters/reina/expression-portraits/happy.webp | /rpg-assets/characters/reina/expression-portraits/surprised.webp |
| Shiori | /rpg-assets/characters/shiori/expression-portraits/happy.webp | /rpg-assets/characters/shiori/expression-portraits/surprised.webp |
| Yuna | /rpg-assets/characters/yuna/expression-portraits/happy.webp | /rpg-assets/characters/yuna/expression-portraits/surprised.webp |

Ready copies: `ready/<character>/<expression>.webp`. Neutral uses the same target directory with neutral.webp. Thumbnails: `thumbnails/<character>/<expression>.png`.

## Visual review and preservation

Viewed approved portraits, original root portraits, current neutral/happy/surprised, and both archived expression candidates per character on white and dark composites (`*-review.jpg`). Viewed actual runtime VN pairs (`runtime-vn-review.jpg`). Current portraits retain canonical identity and outfit: Reina black/red hair and red embroidered jacket; Shiori lavender hair, white blouse and dark green/gold coat; Yuna blue twin tails, yellow/blue jacket and headphones. The compatible existing pair is acceptable under broad artwork approval. Expression portraits have shorter framing than neutral and occasional edge remnants, visible in composites; these do not establish a missing identity-compatible asset.

Archived `overworld-expressions/<character>/*.webp.webp` are inconsistently assigned: Reina happy depicts Shiori, Reina surprised a coral-haired woman; Shiori happy the coral-haired woman, Shiori surprised a brown-haired woman; Yuna happy the coral-haired woman and Yuna surprised Reina. Do not use these as identity references or reinstall by filename. Their rejection is based on visible character mismatch, never RGB hidden under alpha zero.

All originals and attempts remain untouched. No generation was performed, so there are no new prompts or generated attempts. No image-generation tool or CLI was invoked. Scope remained exclusively reina/shiori/yuna.
