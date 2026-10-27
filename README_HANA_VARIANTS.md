# Neo Campus — Hana Overworld Variants (8 images)

Extract this ZIP at the repository root. It adds eight PNGs under:
rpg-assets/characters/hana/overworld-variants/

These are ADDITIONAL variants. The existing Hana portrait and story expressions are not overwritten.

IMPORTANT: This package contains images and a manifest, not a verified game-code change.
The current game's portrait resolver may not scan `overworld-variants/` automatically.
To make the variants appear in the overworld, update the existing Hana portrait
selection logic to choose from the paths in variants.json (with primary portrait
as fallback), respecting any costume/event overrides.

Images are preserved exactly as provided, including their backgrounds and any clothing artifacts.
No transparency or clothing retouching has been applied.
