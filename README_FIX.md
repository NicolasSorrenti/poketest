# Daisy missing overworld and battle art repair

The repository `main` includes `characters/daisy/art_manifest.json`, but its referenced `rpg-assets/characters/daisy/portraits/primary.png` and `expression-portraits/neutral.png` were confirmed missing (GitHub fetch returned 404). This bundle fills those exact referenced paths, using the approved eight Daisy expression portraits. Neutral is also installed as the canonical primary image.

The attack artwork is included at `rpg-assets/characters/daisy/attack-cutins/attack.png` (transparent wide PNG). **This attack path is a STAGING LOCATION, not a confirmed loader convention.** Inspect current battle cut-in and reaction path logic, move/copy the image to the exact path it expects, and register Daisy in the actual cut-in lookup. Do not blindly assume an image appears just because it is present.

Test: /rpg-assets/characters/daisy/portraits/primary.png and all 8 expression-portraits URLs return HTTP 200; in RPG overworld talking to Daisy never renders empty image; attack cut-in appears during Daisy battle on both PC and mobile; artwork fits correct aspect ratio, transparent cut-in; fix error fallback if needed. Ensure final push `main` and deployment.

No runtime code has been patched or pushed by this ZIP. This is an asset handoff to Work.
