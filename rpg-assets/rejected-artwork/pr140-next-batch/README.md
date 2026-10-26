# PR140 next-batch identity audit

Review branch only: `art/overworld-character-refresh`. Audited head: `4af42041ca3c3e334153b6857cfadea1c7a27668`.

## Decision

Reject all four candidates for promotion. Restore the four primary files to the exact blobs from the preceding commit (`ee67d3b`). Keep established neutral expression portraits unchanged. Every file from next-batch, including full-resolution originals, thumbnails and Sierra's check JPEG, is preserved byte-for-byte under `originals/`. The four replaced runtime encodings are preserved under `runtime-4af4204/`. No next-batch image was resized or re-encoded in this repair.

- Alma: established artwork depicts the warm brown-haired cafe owner in apron/workwear. The candidate replaces her presentation with a pale business-suit character; identity cannot be verified.
- Rina: canonical pink twin tails, aqua eyes and pastel idol styling become a brunette in a black dress. Clear identity mismatch.
- Sierra: canonical brunette/hazel-green model has a guarded face and established silhouette. Candidate has a different face, warm brown hair and cheerful formal-trouser presentation; identity cannot be verified.
- Sol: canonical coral-pink waves, sea-green eyes and tropical accessories become blonde hair and sportswear. Clear identity mismatch.

## Runtime resolution

`rpg.js` calls `portraitPaths`: outfit expressions/portrait, pack expression, legacy expression, pack portrait, then cast base. The function does not directly select `expression-portraits/neutral.webp`. The executable audit in `runtime-resolution.json` evaluates that exact function with the real narrative/side cast, generated packs and outfit selector, recording installed candidates.

Alma's overworld uses `vn-expressions/neutral.webp`; her changed structured primary was not its default. Rina and Sierra have missing pack neutral WebPs and reach their primary PNG fallbacks. Sol's overworld uses `expressions/neutral.png`; the changed structured primary was not its default. Battle reactions independently prefer VN/portrait expressions (dedicated attack art leads attacks). Gallery fallbacks use expression-portraits for Rina/Sierra/Sol and VN expressions for Alma. These existing neutral expressions match established identities and must not be overwritten with unverified candidates.

Canonical visual comparisons included root `rpg-assets/{alma,rina,sierra,sol}.png`, installed neutral expression portraits, primary files from the preceding commit, and `characters/{rina,sierra,sol}/bible.md`. Existing `alma/reference/expression-master.webp` depicts an unrelated male expression sheet, so it was excluded as an identity authority. Sierra's `reference/portrait_source.png` also differs from her established root/neutral artwork; this repair does not promote it.

## Integrity

`manifest.json` records every preserved image and restored primary path, dimensions, byte length, SHA-256 and Git blob SHA. All images decode completely. Local Git hash-object values are independently checked against SHA-1 of the Git blob header plus exact bytes. Remote blob SHAs must match before tree/commit creation. Existing rejected-artwork directories are retained.

## Validation results

Targeted run: 20 passed, 3 failed across reaction, HTTP assets, generated-pack and gallery tests. All three failures are unchanged gallery catalog-count assertions (50 versus 47, 97 versus 94, 194 versus 188); neither gallery source nor its tests are modified by this repair. Outfit selection and deterministic character-pack checks pass. The executable neutral-resolution audit passed for all four characters.

## Subsequent user-directed Alma expression integration

After the neutral audit, the user explicitly requested expressions-v3 Alma concerned/surprised based on coordinator approval against next-batch Alma neutral. Both supplied PNG SHA-256 values were verified. The two expression-portraits WebPs are installed at native 1024 x 1536 with lossless conversion and exact decoded RGBA pixel equality. Sources, thumbnails, attempts, validation.json, and displaced WebPs are preserved in alma-expressions-v3/. Its separate manifest records dimensions and hashes. This approval is for the two requested files; the unresolved canonical-neutral discrepancy is still documented above. Alma runtime currently selects legacy vn-expressions, so these files are installed without silently switching neutral identity or expression routing.
