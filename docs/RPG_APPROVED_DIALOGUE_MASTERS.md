# Neo Campus — approved neutral dialogue masters (2026-10-30)

The game uses **existing, approved full-body images** and crops only in its RPG dialogue views. No image was regenerated or overwritten.

| Character | Full-body master used for neutral dialogue | Other expressions |
|---|---|---|
| Iris | `rpg-assets/characters/iris/dialogue/neutral.png` (byte-identical copy of `overworld/standing-front.png`) | Original expression portraits |
| Alma | `rpg-assets/characters/alma/overworld/standing-front.png` | Original expression portraits |
| Barb | `rpg-assets/characters/barb/portraits/primary.png` | Original expressions and priority `special-day-*.png` looks |
| Elena | `rpg-assets/characters/elena/overworld/standing-portfolio.png` | Original expressions |
| Jun | `rpg-assets/characters/jun/standing-front.png` (existing Jun root art) | Original expression portraits |
| Teo | `rpg-assets/characters/teo/dialogue/neutral.png` (byte-identical copy of `overworld/standing-front.png`) | Original expression portraits |
| Nereo | `rpg-assets/characters/nereo/dialogue/neutral.png` (byte-identical copy of `standing-front.png` in Nereo's root folder) | Original expression portraits |
| Elio | `rpg-assets/characters/elio/dialogue/neutral.png` (byte-identical copy of Elio's `standing-front.png`) | Original expression portraits |
| Shiori | `rpg-assets/characters/shiori/dialogue/neutral.png` (byte-identical reuse of `overworld/standing-book.png`) | Original expression portraits |
| Kaede | `rpg-assets/characters/kaede/dialogue/neutral.png` (creator-approved front-facing transparent PNG, original bytes preserved) | Original expression portraits |
| Marina | `rpg-assets/characters/marina/dialogue/neutral.png` (creator-approved transparent full-body art with ripped denim mini shorts; original uploaded PNG bytes unchanged) | Original expression portraits |

Kaede's dialogue artwork was integrated using the previously creator-approved front-facing transparent PNG, with the original PNG bytes and alpha preserved; the existing route registered in PR #299 now resolves to this file. 

Jun's source is the already-committed front standing PNG in his character folder, not a newly generated picture or a copy.

Camila was integrated previously using `rpg-assets/characters/camila/overworld/standing-front.png` as a dialogue master.

## Neutral dialogue defaults from existing overworld poses (2026-10-31)

For characters **without an explicitly approved dialogue master**, use their existing front/standing/idle overworld pose as the neutral stage image. This is a **default**, not a new artwork approval, and it does not create or modify PNGs/WebPs. If an image fails to load, use existing expression-portrait fallbacks. Existing approved artwork (including Marina, Kaede and Shiori), special-day outfits, CGs, chibis, and non-neutral expressions retain priority.

| Character | Existing default asset |
|---|---|
| Akari | `rpg-assets/characters/akari/overworld/standing-clipboard.png` |
| Daisy | `rpg-assets/characters/daisy/overworld/idle.png` |
| Hana | `rpg-assets/characters/hana/overworld/phone-standing.png` |
| Jicy | `rpg-assets/characters/jicy/overworld/standing.webp` |
| Jinx | `rpg-assets/characters/jinx/overworld/idle.png` |
| Luna | `rpg-assets/characters/luna/overworld/standing-front.png` |
| Reina | `rpg-assets/characters/reina/overworld/standing.png` |
| Rina | `rpg-assets/characters/rina/overworld/alternate-card-pose.png` |
| Sierra | `rpg-assets/characters/sierra/overworld/standing-wink.png` |
| Sol | `rpg-assets/characters/sol/standing-front.png` |
| Yuna | `rpg-assets/characters/yuna/overworld/gamer-idle.png` |
| Laca — casual | `rpg-assets/characters/laca/overworld/casual/reaching-out.png` |
| Laca — lifeguard | `rpg-assets/characters/laca/overworld/lifeguard/front-leaning.png` |

Laca has no flat `overworld/standing-front.png`: pick the matching front-oriented pose from her casual/lifeguard subfolder according to the active outfit. Sol's front pose is at the character root rather than in `overworld/`; its existing location is reused. Rina and Yuna do not have a `standing-front.png`, so the verified card/idle pose filenames are used as defaults. All paths were verified in `main`; **visual framing and pose suitability still require in-game review**.


**Costume priority:** Daily special looks (Barb, Akari, Hana) are shown before everything else in dialogue and interactions, for every emotion. Scheduled/scene-specific costumes from `rpg_outfits.js` (such as Laca's lifeguard look) come next. Only when neither applies do approved dialogue portraits and standard overworld front poses become the default. The same priority is used for conversation, idle interaction, and pose-trigger dialogue; a failed costume file falls back to the next existing portrait instead of hiding the character. This does not create any missing outfit files.\n\nThe source selection is in `rpg.js`; the viewport rule for the standalone overworld is in `rpg-overworld-integration.js`. Source-specific classes are installed only after a matching image loads. CG art, overworld sprites, and original source image files remain untouched; only the code, CSS, and cache-busting query strings change. Non-neutral dialogue, other special outfits, and fallback art keep existing paths. The RPG and overworld conversation/interaction portraits now use a top-anchored **head-to-lower-chest** crop. For full-body art, the source occupies `278%` of the viewport's height (roughly the top 36% is visible); pre-cropped expression images use `165%` and other legacy sources `190%`. The crop keeps natural proportions via `object-fit: cover` and affects only the displayed portrait viewport. Discreet-mode chibis are not cropped.

**Visual QA still required:** inspect desktop and mobile conversations for each character, verify head-to-chest crop height and expression transitions; test Barb's special-day art and Discreet Mode. Do not presume code crop replaces transparent source artwork.

**Defaults, not approval:** The characters listed above have a neutral fallback to an existing overworld pose; if a distinct previously approved dialogue PNG is later identified, add it to `APPROVED_DIALOGUE_MASTERS` to supersede the default without overwriting the original art.

Historical PR #216 applied square crop assumptions to Marina/Laca before the master-image direction was agreed; it should be superseded, not merged unmodified.
