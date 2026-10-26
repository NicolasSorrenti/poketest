# PR140 artwork worker handoff: Iris, Jinx, Jun, Luna, Nereo, Teo

Audited branch `art/overworld-character-refresh`, fetched directly from GitHub, detached commit `8902bb3ed26c8f3f2c8646a1a26c14b2522b8e49`. PR: https://github.com/NicolasSorrenti/poketest/pull/140 . No commits, pushes, GitHub writes, source edits, or changes to the shared checkout. Never checked out main.

## Result

34 ready image files: 33 reuses/format conversions and 1 generated Jinx soft. This includes optional aliases and existing unchanged compatible assets, not 34 missing expressions. All source attempts remain preserved. Twelve happy/surprised expressions reviewed (two per character); Jinx's two actually missing fallback names also inspected. No other new expression generation. No extra characters touched or used as references.

All proper alpha composites were viewed on white and #20242c. Hidden RGB under alpha zero is expressly not a rejection reason. The original portraits have alpha range 0–254; their hidden backgrounds were preserved in lossless conversion. New Jinx soft also has alpha 0–254 and composites cleanly.

## Findings and exact targets

All paths below are repository-relative; runtime URL adds `/`. Ready files mirror these paths beneath `ready/`.

| Character | Actual current scene mapping | Existing compatible expressions | Coordinator action |
|---|---|---|---|
| iris | `rpg-assets/iris.png`; not in scene expressionGuests, has no generated pack | `rpg-assets/characters/iris/expression-portraits/{happy,surprised}.webp` | Scene needs explicit canonical map; battle VN neutral/happy/surprised currently show a different male character. Ready replacements at `rpg-assets/characters/iris/vn-expressions/{neutral,happy,surprised}.webp`. |
| jinx | pack `art.expressions.neutral` => `rpg-assets/characters/jinx/neutral.webp` (wrong dark-haired identity); fallback neutral.png correct | `rpg-assets/characters/jinx/expression-portraits/{happy,surprised,annoyed,playful,smirk}.webp` | Ready canonical neutral at root `neutral.webp` and `expression-portraits/neutral.webp`; add explicit scene happy/surprised mapping. Missing battle concerned reused from annoyed, soft generated; both ready under `expression-portraits/`. |
| jun | `rpg-assets/characters/jun/vn-expressions/<emotion>.webp`, then `rpg-assets/jun.png` | `rpg-assets/characters/jun/expression-portraits/{happy,surprised}.webp` matches approved blue/gold-coated dark-haired man | Legacy sheet depicts orange-haired headset man. Ready VN neutral/happy/surprised replacements plus canonical `expression-portraits/neutral.webp`. |
| luna | pack `art.expressions.neutral` => `rpg-assets/characters/luna/neutral.webp`; happy points to root happy.webp (absent) then fallback primary | `rpg-assets/characters/luna/expression-portraits/{happy,surprised,concerned,soft}.webp` matches approved dark-haired gold-star/celestial dress | Installed neutral changed to purple-haired leather streetwear. Ready root neutral.webp and expression-portraits/neutral.webp restore original. Map happy/surprised to existing expression portraits. |
| nereo | `rpg-assets/characters/nereo/vn-expressions/<emotion>.webp`, then `rpg-assets/nereo.png` | `rpg-assets/characters/nereo/expression-portraits/{happy,surprised}.webp` matches approved dark-haired tattooed man, teal/orange jacket and white shirt | Legacy sheet/installed neutral depicts unrelated curly-haired woman. Ready VN neutral/happy/surprised replacements and expression-portraits neutral. |
| teo | `rpg-assets/characters/teo/vn-expressions/<emotion>.webp`, then `rpg-assets/teo.png` | `rpg-assets/characters/teo/expression-portraits/{neutral,happy,surprised}.webp` matches approved brown-haired man, white/blue coat and deck binder | Legacy sheet has different longer hair/hairpins, jewelry and shirt. Ready VN neutral/happy/surprised replacements; expression portrait set retained unchanged. |

`manifest.json` contains each precise target URL, ready filename, original source, dimensions, SHA256 and thumbnail. Neutral replacements for five mismatched installed neutral portraits reuse original approved PNGs, preserving native 1024×1536 framing; Teo retains his matching 512×1024 existing neutral. Reused expression portraits are 512×1024; generated Jinx soft is 1024×1536. Coordinator should review framing in scene/battle CSS after integration.

## Runtime evidence and integration limits

- `rpg.js:1957–1973`: scene expressionGuests includes jun/nereo/teo but excludes iris. `portraitPaths` prefers selected outfit expressions, then pack expressions, legacy, pack portrait and original base, as implemented in `rpg_outfits.js:sources`.
- `rpg_character_packs.generated.js` and `characters/{jinx,luna}/art_manifest.json`: only Jinx/Luna have generated art maps in this scope. Change their source manifests and regenerate; do not hand edit the generated JS.
- Scene dialogue emits neutral/surprised/vulnerable/irritated/determined/happy (`rpg.js:1979`). Current legacy guest determined/vulnerable/irritated were not visually cleared in this two-expression batch: route them to canonical neutral until separately audited. Do not leave incompatible legacy expressions active after staging only three replacements.
- Jinx root smirk/judgy/fire/soft and Luna root shy/panic/blush also belong to the older style direction; avoid retaining those source-map routes without an identity review. Use compatible installed portrait expressions (Jinx smirk/annoyed, Luna concerned/soft) or canonical neutral. No blind filename equivalence for vulnerable/determined.
- `rpg_match_reactions.js`: guest group uses VN folder; Jinx/Luna use expression-portraits. `runtime-paths.json` records every expression candidate for all eleven battle kinds, checked against the fetched tracked tree. All guest files exist, but existence does not establish identity compatibility. The only absent portrait candidates were Jinx concerned (weakness/big-hit fallback) and soft (KO fallback). Both now have ready files. Dedicated declared attack art keeps precedence and was not changed.
- Rejected candidates checked: `rpg-assets/rejected-artwork/next-overworld/iris/neutral.webp` and `next-overworld-v2/{jinx,jun,nereo}/neutral.webp` repeat the mismatching installed neutrals, so not reused. The rejected Luna `next-overworld-v2/luna/neutral.webp` is undecodable in the fetched Git tree, not a hidden-RGB objection. Original approved portrait reused instead. Teo has no rejected neutral candidate in this tree.
- Compatible happy/surprised art was already installed. Reused it rather than generating replacements. The concerned alias uses the existing Jinx annoyed expression as a serious/frowning concerned fallback; that alias is explicit in the manifest.

Concrete remaining blocker: runtime routing still needs coordinator integration. Simply copying files does not make Iris scenes expressive or prevent other old-style guest emotions and Jinx/Luna pack routes. No art-generation blocker remains for the staged expressions. This is a reviewable handoff, not an assertion the live game is fixed.

## Verification

Git-tracked scoped image inventory: 161 assets, SHA256/dimensions/decode results in `github-tree-image-inventory.json`; one undecodable rejected Luna file. Existing `node tests/rpg_match_reactions.test.js` passes in isolated fetched snapshot. That test validates routing behavior, not visual identity. All 34 ready images decode, contain transparency, and match recorded SHA256. Snapshot remains clean. Source-art and generation composites are included; all generated attempts and exact prompt preserved in `attempts/`.
