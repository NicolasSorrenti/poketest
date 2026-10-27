# Neo Campus — Outfit-change chime-in crop guide

This document maps each Hana overworld variant to its outfit-focused close-up. Runtime data is in `rpg-assets/characters/hana/overworld-variants/chime-focus.json`.

Coordinates use normalized fractions of the image height (0 = top, 1 = bottom). The image is **not modified**: the UI crops the original PNG with CSS. All eight are 512 × 1024 in the current pack.

| Variant | Focus top | Focus bottom | Target |
|---|---:|---:|---|
| 01_original_white_lace_denim.png | 0.305 | 0.635 | White bodice and lace front, with upper denim waistband |
| 02_gray_blouse_denim.png | 0.3 | 0.63 | Gray draped blouse and waistband |
| 03_gray_ruched_top_denim.png | 0.305 | 0.625 | Gray ruched blouse and upper shorts |
| 04_white_top_mini_skirt.png | 0.34 | 0.79 | White camisole and mini skirt |
| 05_white_top_pleated_skirt.png | 0.34 | 0.8 | White camisole and pleated skirt |
| 06_pink_lace_white_top_denim.png | 0.315 | 0.635 | Pink lace detail, white top and denim waist |
| 07_gray_lace_white_top_denim.png | 0.32 | 0.64 | Gray lace neckline, white top and shorts waistband |
| 08_ribbon_top_denim.png | 0.31 | 0.65 | Ribbon and printed bodice, upper denim shorts |

## Behavior
- Show only on entry to a location containing Hana, when the selected outfit differs from the last outfit the player saw on her.
- Don't show on first sighting, to avoid treating a newly met character as an outfit change.
- Three-second non-interactive overlay: image only, thin decorative border; no text.
- Ordinary outfit stays unchanged throughout the encounter/dialogue. Canonical scripted outfits bypass the chime-in.
- If a story or battle overlay is active, don't cover it. Respect reduced-motion preferences.
- The original portrait is a valid outfit in rotation, but uses a generic torso focus when selected.
- Crop rectangles are approximate and can be edited without changing JavaScript.

## Testing
Enter and leave Hana's scheduled location repeatedly on different periods or days. The overlay should appear on the second appearance if her outfit differs, display for approximately three seconds, and then disappear. It should never occur during scripted CGs or battles. Check on desktop and mobile.