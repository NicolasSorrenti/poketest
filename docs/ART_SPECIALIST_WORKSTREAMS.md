# Neo Campus RPG — Four-specialist image production

Updated 2026-10-22. This is a **production assignment and QA agreement**, not an image-generation prompt. Do not paste this entire document into any image model.

## Baseline verified from current main

- The game's character art inventory includes 20 NPCs.
- Dedicated `rpg-assets/characters/<id>/events/booster.webp` assets are missing for all 20 characters in GitHub **even when candidate art exists in earlier ChatGPT ZIPs**.
- Dedicated `battle-result.webp` is missing for: **kaede, alma, elio, iris, jun, luna, nereo, rina, sierra, teo**.
- All 20 have `rpg-assets/reactions/<id>/attack.png`; never re-create these simply because a different cut-in slot has a missing value.
- Existing Season 1 gallery has at least 32 full CGs, and the panoramas folder has eight images. Their presence does not prove visual or narrative quality.
- Previously created user-facing candidates exist for Shiori/Yuna/Akari/Marina boosters (Batch 03) and Kaede booster and result (Batch 04); plus earlier Batch 02 Hana/Reina/Camila boosters and Kaede result. **They are not automatically checked into GitHub, nor necessarily accessible to scheduled runs.** Never label them missing *production* if they can be retrieved and validated. Never claim a ChatGPT ZIP is committed without checking GitHub.

## Ownership and priority

### 1. Reward illustrator — character gift / booster
**Owns:** `rpg-assets/characters/<id>/events/booster.webp` ONLY.
**Priority:** recover/visually validate existing user candidate packs; then produce genuinely new 768x1024 SFW reward pictures one person per image. Prefer original cast, then NPCs that have distinct named game roles. Exactly one readable sealed booster presented to the player, character-specific public game venue.
**Reference:** `rpg-assets/<id>.png`, character design from the canon in `docs/cg-art-queue.json` when listed; `scripts/rpg-art-prompt.js --reward booster --character <id> --json` for supported main heroines. Guest NPCs need exact approved text and own canonical image, not a made-up prompt template.
**Never touch:** battle-results, story CGs, reaction art.

### 2. Battle illustrator — results and reactions
**Owns:** `rpg-assets/characters/<id>/events/battle-result.webp` and genuinely absent or provisional `rpg-assets/reactions/<id>/... ` image slots.
**Priority:** the ten missing battle-result slots above, but check Kaede's previously packaged candidate first; then independently review `rpg-assets/reactions/manifest.json` and in-game cut-in logic for unfilled `match_cutin`, KO, hurt and status art paths; fill only genuine missing runtime features. Respect 768x1024 portrait for results and 1280x720 landscape for attack/cut-in assets.
**Never touch:** boosters, story CGs, canonical main portraits.

### 3. VN character illustrator — standalone expressions and sprites
**Owns:** `rpg-assets/characters/<id>/vn-expressions/`, `rpg-assets/characters/<id>/expression-portraits/`, and dedicated standing-sprite/chibi directories if verified by game code.
**Priority:** NPCs with no usable expression portraits first; missing expression identities next; improve real-transparent standing sprites only where engine uses them. Existing canonical `rpg-assets/<id>.png` is reference art **not a destination for overwriting**.
**Quality gate:** one single expression/pose per file, face/eyes/hair identity consistent; transparent PNG only when true alpha is required. Never crop a sprite sheet and declare it an independent illustration.
**Never touch:** boosters, battle results, story CGs or backgrounds.

### 4. Story/environment illustrator — event CGs and location backdrops
**Owns:** `rpg-assets/events/cg/` and `rpg-assets/locations/` (plus game-verified additional environmental image slots).
**Priority:** inspect existing 32 Season 1 CGs and eight panoramas against their event identities; generate *only* a verified missing scene or clearly documented replacement candidate for wrong/outdated art. New nighttime/alternate backgrounds require an actual target/UI integration path, not art with no runtime consumer.
**Format:** 1920x1080 event image + derived 640x360 gallery thumb; location format must match caller. No interface/text burned into CGs. No spoiler scene invention.
**Never touch:** any character reward, battle result or expression files.

## Shared acceptance and workflow

1. **Inventory first** every run: read current `main` and do not duplicate accepted or previously packaged candidates without checking whether they are accessible.
2. Check a canonical portrait **as pixels** if available. A prompt string referring to a PNG path does not feed its image contents to an image generator. If pixels are unavailable, log reference limitation before approving identity.
3. Choose *one precise file slot* and write a short affirmative, model-facing prompt for one visually continuous illustration. Follow `docs/ART_GENERATION_ONE_IMAGE_RULE.md`; separate model request from QA criteria.
4. Generate using an available image tool; inspect **actual output pixels**. Reject wrong character/setting/action, multi-scene layouts, inappropriate content, unrelated branded card art, poor anatomy, bad cropping and accidental typography. A failed render is **not** an accepted asset.
5. Export and verify real output bytes in exact repo-relative path, dimensions, format, SHA-256 and manifest; bundle a ZIP that users can safely extract. Verify ZIP CRC. GitHub commit is optional and only claimed after confirmed binary upload/commit.
6. Record accepted/rejected asset IDs and failure reasons; do not overwrite user-approved artwork or claim a chat attachment exists in GitHub.
7. If a scheduled run lacks image generation, image references, local file bytes, or GitHub binary-write privileges, **do not fabricate assets**. Describe the specific blocker and avoid repeated nonproductive claims.
8. **Workstream collision rule:** each illustrator may mutate only its owned asset paths. Shared QA docs/status can be updated only with verified facts. Any asset in a conversation ZIP is pending review until original image pixels are compared to the canonical game art.

These are scheduled specialized task instructions. Scheduling tasks does not constitute launching four separate continuously running generative-model processes, and tool availability during a later run is not guaranteed.

## Mandatory fresh-prompt handshake for every image attempt (including retries)

- Each specialist run must select exactly one canonical asset ID and regenerate its full prompt from the current repository generator immediately before EVERY image-tool invocation. For rewards: `node scripts/rpg-art-prompt.js --reward booster --character <id> --json`. For scenes, use `--scene <id> --json`. Do not reuse conversation memory, previous model output, or a shortened paraphrase.
- Attach the original character portrait pixels when supported. Check canonical character ID, appearance, wardrobe, setting, action, target path and dimensions before dispatch. Send ONLY the fresh `prompt` field to the image tool, plus actual portrait image pixels if supported. Never pass the full JSON or QA instructions as the model prompt.
- Validate the exact outbound prompt with the script's selection-specific `--validate` option, and record its SHA-256. If the image tool cannot receive the exact prompt, stop and report a prompt-delivery blocker; do not generate with an empty or substituted prompt.
- After each rejected image, log the precise visual rejection reason, discard the candidate, RE-RUN the canonical generator and exact validator for the SAME asset ID, then try again with the full freshly retrieved prompt and same identity reference. Do not let a retry inherit partial instructions or quietly change character or destination.
- Maximum two image attempts per asset per run. If both fail, report the blocker and leave the asset uncommitted. Never accept an image just to meet a quota.
- These rules apply independently to reward, battle, VN-character and story/environment specialists; they do not authorize changes outside their assigned image folders.
