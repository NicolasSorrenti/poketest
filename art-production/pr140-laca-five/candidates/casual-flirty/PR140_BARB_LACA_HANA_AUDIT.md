# PR140 Barb / Laca / Hana candidate audit

Audited GitHub PR140 and recursive, non-truncated GitHub tree at `8902bb3ed26c8f3f2c8646a1a26c14b2522b8e49` (2693 entries). Verified 126 scoped asset blobs from the isolated checkout against that tree using Git blob SHA-1. Existing dirty checkouts were untouched.

## Runtime and integration

`rpg.js:portraitPaths` -> `rpg_outfits.js:sources` -> `rpg_character_packs.generated.js` / `characters/laca/art_manifest.json` selects outfit expression before outfit portrait. Mere presence under expression-portraits does not enable an image.

Laca: reuse already installed full-body casual happy/surprised/concerned; these three are byte-identical to expressions-v1 rejects. Route vulnerable and sad to concerned. Route casual and lifeguard neutral to their existing decodable outfit neutral WebPs. Update manifest and generated pack only; no raster bytes changed. Original corrupt PNGs and all rejects remain. Casual irritated/determined still fall back to outfit portrait through the existing selector. Lifeguard non-neutral and casual flirty/embarrassed/angry/inviting remain unresolved; this is deliberately a partial runtime repair.

Barb: scene manifest and battle VN_MAIN route use vn-expressions (decodable); expression-portraits concerned/soft are corrupt committed files, not an alpha issue. expressions-v1 rejects have compatible identity but bust-length framing, unlike the refreshed full-body neutral. They are not exact full-body replacements. No Barb changes.

Hana: overworld has no character-pack art mapping and uses /rpg-assets/hana.png. Battle VN_MAIN uses vn-expressions (opaque pink patterned backgrounds, different framing). Installed transparent expression-portraits neutral/happy/surprised/concerned/soft depict the matching pink-haired woman in green floral varsity jacket, white top and denim shorts. This is a separate routing integration opportunity, not evidence artwork needs regeneration. Rejected happy/surprised depict auburn bob/glasses/purple jacket; concerned depicts black hair/red jacket; exclude those. Rejected neutral is byte-identical to installed neutral. Rejected soft is identity-compatible but redundant with installed soft; no replacement needed. No Hana changes.

## Next two scoped artwork batches

1. **Barb**: full-body transparent concerned and soft. Reference `rpg-assets/characters/barb/expression-portraits/neutral.webp` and `characters/barb/assets/reference/barb_character_bible.webp`; preserve copper hair, cap, rose shoulder tattoo, black cropped outfit, skirt/shorts and tall boots. Targets `rpg-assets/characters/barb/expression-portraits/{concerned,soft}.webp`. Archived expressions-v1 crops are facial-expression references only. Preserve corrupt installed originals before any later replacement. No redesign.
2. **Laca**: full-body casual flirty/embarrassed/angry/inviting; full-body lifeguard happy/surprised/vulnerable(sad)/flirty/embarrassed/angry/inviting. Reference `rpg-assets/characters/laca/outfits/casual/neutral.webp` (black top, blue jeans) and `outfits/lifeguard/neutral.webp` (red lifeguard swimwear, whistle, red rescue float), plus `characters/laca/bible.md`. Existing outfit WebP happy/surprised/vulnerable/teasing are compatible face crops, not exact full-body replacements. Targets remain the expression paths in `characters/laca/art_manifest.json`; choose final extensions explicitly in a later integration. Casual happy/surprised/vulnerable/sad need no generation after this repair.

## Validation

Visual review used actual white and #181820 alpha composites of Barb/Laca/Hana installed expressions and archived candidates, plus Laca outfit WebPs. Five reused assets decode fully in Pillow, alpha extrema 0..255, and composite on both backgrounds. Hidden RGB where alpha=0 is ignored. No artwork generation, cleanup, re-encoding, or deletion.

15 targeted Node tests passed: `tests/rpg_laca_reused_portraits.test.js`, `tests/laca_art_integration.test.js`, `tests/rpg_laca.test.js`, `tests/rpg_match_reactions.test.js`. `node test_rpg_outfits.js` and generated-pack check pass. Existing Laca header-only tests did not detect corrupt PNG bodies; test now accepts verified WebP substitutions, with separate runtime-routing and archive-byte equality tests plus full Pillow decode during this audit.

Baseline `tests/rpg_portrait_identity.test.js` fails unchanged for Hana: expects `/rpg-assets/hana.png`, actual `/rpg-assets/characters/hana/vn-expressions/happy.webp`. Do not claim full suite green.

## SHA-256 evidence

Reused assets, installed scoped expression portraits, rejected candidates, and unresolved malformed outfit PNGs follow. `DECODE FAIL` means actual full decode failure, not hidden RGB.

| Path | SHA-256 | Decode / alpha |
|---|---|---|
| `rpg-assets/characters/barb/expression-portraits/angry.webp` | `9eadf1ba3bcbb7889b90cc064151514d2a09dc25994d022d5cdb217143fdffcd` | 280x380; alpha (0, 255) |
| `rpg-assets/characters/barb/expression-portraits/concerned.webp` | `052e4415355e609d3f96470bd02b720b693b54381a649b2ba54270f1b9fd0831` | DECODE FAIL |
| `rpg-assets/characters/barb/expression-portraits/embarrassed.webp` | `779087c81383c6de1a6de0bb91a68222d806f107c1ea9bd6a4ff7e830d4700bf` | 280x380; alpha (0, 255) |
| `rpg-assets/characters/barb/expression-portraits/flirty.webp` | `50fade84dda873b17fbd26f837ced46355a4e45c07d724996093584cd19826f6` | 280x380; alpha (0, 255) |
| `rpg-assets/characters/barb/expression-portraits/happy.webp` | `8493bc79706fa4f3c880454a9b16acf4c4b76f65cc39805a8797fa965bd239cd` | 280x380; alpha (0, 255) |
| `rpg-assets/characters/barb/expression-portraits/neutral.webp` | `b44cedeafb0a77fe5d1812e314e034497b8ca462e5b5695f683f410c600d465f` | 512x1024; alpha (0, 255) |
| `rpg-assets/characters/barb/expression-portraits/sad.webp` | `2120c6a49b16fafeb2588758a8d63424f3c1759b650bb8018f7a85d886f058b8` | 280x380; alpha (0, 255) |
| `rpg-assets/characters/barb/expression-portraits/soft.webp` | `eac73ac9edc9f48988db99b6a2d2528a9fdb164cdbfeb330974dea194c7191d9` | DECODE FAIL |
| `rpg-assets/characters/barb/expression-portraits/surprised.webp` | `977ab615d625aee4fcc65fed539ffd44faa25bfe5bf37a6ddb17f17096f37a4b` | 280x380; alpha (0, 255) |
| `rpg-assets/characters/hana/expression-portraits/concerned.webp` | `1c5a974030329043a732f2b7aa023dd90aff766eca0f99478cc27e41fda98719` | 512x1024; alpha (0, 255) |
| `rpg-assets/characters/hana/expression-portraits/happy.webp` | `96d11d691a0662a0e515c417e1f0ef8b715f4cfb818ca55bc96735566a3aec31` | 512x1024; alpha (0, 255) |
| `rpg-assets/characters/hana/expression-portraits/neutral.webp` | `cc3c7c654ba33edcc4199997da691253a1063ebcbda303492b567e06dad50412` | 512x1024; alpha (0, 255) |
| `rpg-assets/characters/hana/expression-portraits/soft.webp` | `6dd19adf9c966d62bc3378721d30931099631dcc21c66d05c33553de3f36b526` | 512x1024; alpha (0, 255) |
| `rpg-assets/characters/hana/expression-portraits/surprised.webp` | `40b9fcf4612cb1ad1120339d79054ad67de5714245ea7c12b2543993eba06f4e` | 512x1024; alpha (0, 255) |
| `rpg-assets/characters/laca/expression-portraits/concerned.webp` | `4c22bfa97e9d97d60db25bc4cdec7eb4071c5e2c16b988c358a427371f7cca74` | 941x1672; alpha (0, 255) |
| `rpg-assets/characters/laca/expression-portraits/happy.webp` | `15d62a1aeddbe2da30bd4a939cd5768f7f531edefae593379fb6a32f9a1975ed` | 941x1672; alpha (0, 255) |
| `rpg-assets/characters/laca/expression-portraits/neutral.webp` | `cb33e9af3be2f368baad9b02e7490769e90c1a06d14b86de6899cc126f833006` | 512x1024; alpha (0, 255) |
| `rpg-assets/characters/laca/expression-portraits/soft.webp` | `5570b61544c8e3909aa2fe4b0b42941f8c8365baf17e097464e8a8367de4a9d2` | 941x1672; alpha (0, 255) |
| `rpg-assets/characters/laca/expression-portraits/surprised.webp` | `e876d6d8621727d76330470e4d6c60f35388f797e4dfec718d1f7df0f13bc91c` | 941x1672; alpha (0, 255) |
| `rpg-assets/characters/laca/outfits/casual/angry.png` | `9286c05f0470c3c863a5bcbeb8a4be73bda803b5951e1e181c0bd5c03f4e6d8e` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/casual/embarrassed.png` | `50474c8545a8b39a77dcc2968b9d162fd2e8de1c73cb4e4a84e2931c17618a65` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/casual/flirty.png` | `7d765aacea9d4f10f9da87708ccb8555e0cb6fe015c7bd926cf45fc88d95d80a` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/casual/happy.png` | `961bc58687b5a5837d5e7364c5c2ac3b77ab4925ceb4cdd2123d8493f1ec680e` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/casual/happy.webp` | `eef4b18875344801340e94370c11687839b84c7c6fe70cc0f714b0ab26ed6cc4` | 384x447; alpha (0, 253) |
| `rpg-assets/characters/laca/outfits/casual/inviting.png` | `3158b1f66bb76316ddca196cc6d16ef65e93c3240e85f6d9b43d246cb949c25d` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/casual/neutral.png` | `12744dd00bd3a29b562e278b7d8be68647f7f88e62ff3f9e6f9d3ffd8a01d730` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/casual/neutral.webp` | `76841a9c5eb144ff55b132e5b8b4e0e078b7c0ad4c7154bfd68659df085510a7` | 941x1672; alpha (0, 255) |
| `rpg-assets/characters/laca/outfits/casual/sad.png` | `1be173728e1774e899a9a857a8955ddf5ad37c8ff4541124716e4ec6e5125652` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/casual/surprised.png` | `3670f361187429ae32f0716f8e6465d4bea5923b29ffc91506371eb87e68c99d` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/casual/surprised.webp` | `032e6648f6274cae986ac436a67032847fd2d86e6f44a7ec52ed2cd4aac6026a` | 384x447; alpha (0, 253) |
| `rpg-assets/characters/laca/outfits/casual/teasing.webp` | `de66f0854ab4f970c4f7741d7a24223b3696afd196189df417c1fa29c7ba2f01` | 384x447; alpha (0, 253) |
| `rpg-assets/characters/laca/outfits/casual/vulnerable.webp` | `ed09fedf41ec9c38664cb501e1bf6d56569ad7ac141b6554bd770ff16e2fb55e` | 384x447; alpha (0, 253) |
| `rpg-assets/characters/laca/outfits/lifeguard/angry.png` | `78b81c9256485fcab254458e04760c79cd8cf374616999086a01ef52f0bdc039` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/lifeguard/embarrassed.png` | `14686247af721d66a8013e6e5efff5e7fa77146459d96cd8b09627589f6e8f86` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/lifeguard/flirty.png` | `740cb6c0b9d95cec50566ab7df89278cda640907490e2bf41037d533280f8b73` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/lifeguard/happy.png` | `361f40af36b45e6fe5a98e029cf269eb3f7a51656aa6af29b3682e1068069d62` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/lifeguard/happy.webp` | `2a35991b01c562fba5b4f1393540a8ead1cd375428b82c7fc6361763f2ccfbab` | 384x447; alpha (1, 254) |
| `rpg-assets/characters/laca/outfits/lifeguard/inviting.png` | `6819bbcaea1b2ceed8ae2bdb80ae82ed5f85228c76be5b2d1304643f29cd497e` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/lifeguard/neutral.png` | `2e9e4c91d73a6a2902d18fcda81ba6d51015d693d2b46618a10445f26e4c1316` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/lifeguard/neutral.webp` | `035e43536e36ca0ecea28c8ea20aa4191a41330cd0b95cfb8662a31d5f59d500` | 941x1672; alpha (0, 255) |
| `rpg-assets/characters/laca/outfits/lifeguard/sad.png` | `e8c11351dd174e2689f323f42a11934c5f7010bd387c136a79707e0340f84668` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/lifeguard/surprised.png` | `ada83574c9faf969719a1936233b632a9d116c5a390ba5ed8d8e067f76371da8` | DECODE FAIL |
| `rpg-assets/characters/laca/outfits/lifeguard/surprised.webp` | `95dd9612914e2b616140111189b7e146b701937ef6835d22d8aaebaa25eb0bf8` | 384x447; alpha (0, 253) |
| `rpg-assets/characters/laca/outfits/lifeguard/teasing.webp` | `4f03f082b08a63140d1c6bf9f55f2a0817a54330b75800febe1ae305278bbc36` | 384x447; alpha (0, 253) |
| `rpg-assets/characters/laca/outfits/lifeguard/vulnerable.webp` | `afc71041dd8f50a344de91d4ed326df9e06e4cde90f4a6a03e646ed56ce65216` | 384x447; alpha (0, 254) |
| `rpg-assets/rejected-artwork/expressions-v1/barb/concerned.webp` | `93c3b7b76762d74f53e2663c6531ab86cfef586fa4e3b776f77d2df207f5a000` | 1241x1267; alpha (0, 255) |
| `rpg-assets/rejected-artwork/expressions-v1/barb/soft.webp` | `eddc2476022257a00a6c84118cdf23422f92a70b7634c48a24b4fa254ae7bb50` | 1145x1374; alpha (0, 255) |
| `rpg-assets/rejected-artwork/expressions-v1/laca/concerned.webp` | `4c22bfa97e9d97d60db25bc4cdec7eb4071c5e2c16b988c358a427371f7cca74` | 941x1672; alpha (0, 255) |
| `rpg-assets/rejected-artwork/expressions-v1/laca/happy.webp` | `15d62a1aeddbe2da30bd4a939cd5768f7f531edefae593379fb6a32f9a1975ed` | 941x1672; alpha (0, 255) |
| `rpg-assets/rejected-artwork/expressions-v1/laca/soft.webp` | `5570b61544c8e3909aa2fe4b0b42941f8c8365baf17e097464e8a8367de4a9d2` | 941x1672; alpha (0, 255) |
| `rpg-assets/rejected-artwork/expressions-v1/laca/surprised.webp` | `e876d6d8621727d76330470e4d6c60f35388f797e4dfec718d1f7df0f13bc91c` | 941x1672; alpha (0, 255) |
| `rpg-assets/rejected-artwork/next-overworld/barb/neutral.webp` | `b44cedeafb0a77fe5d1812e314e034497b8ca462e5b5695f683f410c600d465f` | 512x1024; alpha (0, 255) |
| `rpg-assets/rejected-artwork/next-overworld-v2/laca/neutral.webp` | `cb33e9af3be2f368baad9b02e7490769e90c1a06d14b86de6899cc126f833006` | 512x1024; alpha (0, 255) |
| `rpg-assets/rejected-artwork/overworld-expressions/hana/concerned.webp.webp` | `7cde25499c066852118d5adc33511012456b2cedb2dc9353174fb4dd7d2716d3` | 512x1024; alpha (0, 255) |
| `rpg-assets/rejected-artwork/overworld-expressions/hana/happy.webp.webp` | `b9b24a4e14fd1b9f74c0f793851378239a48a3501cd10b0b7088275618d8aaef` | 512x1024; alpha (0, 255) |
| `rpg-assets/rejected-artwork/overworld-expressions/hana/soft.webp.webp` | `3bcb2a64d5dd1a14ed0688309454faaedaa3801cfe916dc1088e6c3d72edaaf3` | 512x1024; alpha (0, 255) |
| `rpg-assets/rejected-artwork/overworld-expressions/hana/surprised.webp.webp` | `10ab0a77915ff5537952cd1ab9ad0a2b6fbdd2d83bd62178d934fd2a262b5749` | 512x1024; alpha (0, 255) |
| `rpg-assets/rejected-artwork/overworld-neutral/hana/neutral.webp` | `cc3c7c654ba33edcc4199997da691253a1063ebcbda303492b567e06dad50412` | 512x1024; alpha (0, 255) |
