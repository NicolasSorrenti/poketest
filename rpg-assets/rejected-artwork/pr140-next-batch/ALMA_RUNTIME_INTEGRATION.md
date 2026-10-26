# Alma runtime integration follow-up

Parent: 3fb310b2f258455541cb75d336392c5107fcf7ea. Review branch only.

Visual authority: original female cafe owner in rpg-assets/alma.png and compatible expression-portraits neutral/happy/soft. Restored primary remains untouched; it uses another cafe-workwear variation and is not added as a fallback. The reference expression master and legacy VN neutral/surprised/vulnerable/irritated/determined depict an unrelated male character. VN happy depicts the female cafe owner but is no longer needed as a separate route.

The v3 concerned/surprised candidates depict a woman in a black business suit, white blouse and black trousers, matching the archived next-batch direction rather than the canonical brown coffee apron, rust cardigan and cream blouse. This visible outfit/identity discrepancy blocks their runtime promotion. Broad art approval does not resolve that specific continuity conflict. No generation, deletion, image conversion or asset replacement occurs here. All candidate files and archived originals remain byte-for-byte intact. Alpha-zero hidden RGB is not a rejection criterion.

rpg.js now selects Alma expression-portraits neutral/happy/soft explicitly, using neutral for concerned/surprised/vulnerable/irritated/determined/unknown and the original root female portrait on load failure. Battle reactions select happy for positive actions and neutral for adverse/unknown actions; dedicated manifest attack artwork still leads. Gallery portrait fallback selects the same canonical neutral. Other characters retain existing routing.

Verification: new executable tests/rpg_alma_portraits.test.js covers the actual scene resolver, battle selection and gallery fallback. Together with reaction, HTTP asset and generated-pack tests: 11 passed. test_rpg_outfits.js and syntax checks pass. Gallery suite has the same three baseline catalog-count failures (50/47, 97/94, 194/188), reproduced with the unmodified parent gallery source.

SHA-256 for unchanged expression-portraits assets:

- neutral.webp: 6244f4d6852750ba8f02f340ede611d81ed9323121af6b2dc42a8197b9a71142
- happy.webp: 37d22a41b11b68c764c2bd8990ee8a63568ccfb29920c3b3ab2b804b6c6b4067
- soft.webp: 63ca18069e111b1deb094ff7167b8575b3e0e9b31b46f54003c3f3fa054534fe
- concerned.webp (preserved, blocked): 1f88386b166845e37975a86f559cdd96886b0439dfad859974cc98243dca7a3c
- surprised.webp (preserved, blocked): ab18002870c8f5074663a4beb4f7127f07aa7d63342a21b7e0fdba925cf9c1ed
