# Neo Harbor Portrait Generation Guide

> **One artwork per generation call:** Follow [ART_GENERATION_ONE_IMAGE_RULE.md](ART_GENERATION_ONE_IMAGE_RULE.md). Describe only the finished portrait or expression being requested, using a short *positive* instruction. For each expression, use a separate model call and run `node scripts/rpg-art-prompt.js --validate <prompt-file>` before submitting the actual prompt. Layout rejection criteria belong to visual QA, not the image-model instruction.

Use this guide to keep all VN portraits visually consistent.

## Primary portrait standard
- Canvas: **1024 x 1536**, transparent PNG.
- Framing: upper-thigh to head or knee-up if outfit silhouette matters; never random close crops.
- Character centered vertically with the **eye line around 26% to 30% from the top**.
- Leave breathing room above the hair and enough visible torso so proportions read consistently.
- Facing: slight 3/4 angle or front-facing; avoid extreme tilt unless it is a deliberate character trait.
- Background: transparent or fully removable; do not bake scene backgrounds into portraits.
- Lighting: soft key light + mild rim light, matching the polished JRPG/VN style used by the rest of the cast.

## Expression standard
- Export one file per expression as **280 x 380 WebP** for UI use.
- Keep the same crop, scale, hairstyle, and outfit across all expressions.
- Recommended base set: neutral, smile, surprised, worried/annoyed, soft/flirty.

## Scene CG standard
- Full CG: **1920 x 1080 WebP**.
- Gallery thumb: **640 x 360 WebP**.
- Keep the bottom 20% reasonably readable for dialogue overlays.

## Common issues seen in current portraits
- Inconsistent zoom level between characters.
- Some portraits are full-body while others are chest-up only.
- Expression crops vary too much in head size and eye line.

## Recommendation
For future characters, generate the portrait first using the portrait standard above, then derive the expression set from that established look rather than inventing a new crop for each character.
