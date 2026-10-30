# NEO CAMPUS — master overworld character sprites

Release date: 2026-10-30
**Sprites:** 67 separate transparent RGBA PNGs, across 19 character folders.

## Install
Extract into the ROOT of `NicolasSorrenti/poketest` so the `rpg-assets/` directory lands in the existing `rpg-assets/` folder.
All individual game sprites follow `rpg-assets/characters/<id>/overworld/<pose>.png`.
Sprites are provided as files only: the game will not automatically show every new pose until it is registered in its pose configuration / map placement system.
No code, runtime manifest, maps, RPG HTML, or existing GitHub content was modified.
Unzip carefully if any same-name files already exist; this release does not overwrite anything inside GitHub automatically.

## Pose counts
- akari: 8 PNGs
- alma: 4 PNGs
- camila: 2 PNGs
- elena: 3 PNGs
- elio: 1 PNGs
- hana: 3 PNGs
- iris: 3 PNGs
- jun: 1 PNGs
- kaede: 5 PNGs
- laca: 6 PNGs
- luna: 3 PNGs
- marina: 3 PNGs
- nereo: 1 PNGs
- rina: 5 PNGs
- shiori: 4 PNGs
- sierra: 3 PNGs
- sol: 3 PNGs
- teo: 3 PNGs
- yuna: 6 PNGs

## Already-approved existing character sprites outside this ZIP
Barb, Reina, Jinx and Daisy were previously described as completed/approved in the repository or other chat deliveries. Their assets were deliberately not invented or recopied from unrelated references.

## Known QA notes
- Rina `reaching-idol.png`: one leg was cropped by the original render.
- Shiori `reaching-book-back.png`: original book partly cropped; complex hair mask warrants inspection.
- Luna: back pose updated using the later full-length revision. The newly revised seated pose reaches the original source image edge; verify the right shoe and hanging hem at runtime scale.
- Other silhouettes may have very thin, semi-transparent edges; verify on a checkered game background.
- Seated/activity poses include props in the PNG (such as the chair or tray), as depicted; do not layer onto conflicting furniture without visual QA.
- No per-map scale/anchor calibration is supplied here; preserve the manifest and use the in-game placement tool.

## Archive contents
- `rpg-assets/characters/`: 67 PNG character sprite files in game-style paths.
- `SPRITE_INVENTORY.csv` / `SPRITE_INVENTORY.json`: exact path, dimensions, checksum, source, QA.
- `SHA256SUMS.txt`: per-sprite checksums.
- `PREVIEW_CHARACTERS.jpg`: one representative pose for each included character.
- The COMPLETE artwork ZIP additionally has `art-production/overworld-source-archive/`: original sheets/renders, not to be used by the RPG directly.

## Full path inventory
- `rpg-assets/characters/akari/overworld/clipboard-writing.png` (560×1527)
- `rpg-assets/characters/akari/overworld/fashion-sketch.png` (420×999)
- `rpg-assets/characters/akari/overworld/over-shoulder-bag.png` (506×1516)
- `rpg-assets/characters/akari/overworld/over-shoulder-cardigan.png` (513×1535)
- `rpg-assets/characters/akari/overworld/presenting-designs.png` (693×1530)
- `rpg-assets/characters/akari/overworld/seated-clipboard.png` (916×1507)
- `rpg-assets/characters/akari/overworld/seated-coffee-laptop.png` (945×1529)
- `rpg-assets/characters/akari/overworld/standing-clipboard.png` (557×1503)
- `rpg-assets/characters/alma/overworld/over-shoulder-back.png` (294×822)
- `rpg-assets/characters/alma/overworld/serving-tray.png` (434×822)
- `rpg-assets/characters/alma/overworld/standing-front.png` (352×822)
- `rpg-assets/characters/alma/placing-coffee-cup.png` (973×1526)
- `rpg-assets/characters/camila/overworld/standing-back.png` (533×1535)
- `rpg-assets/characters/camila/overworld/standing-front.png` (572×1526)
- `rpg-assets/characters/elena/overworld/over-shoulder-documents.png` (528×822)
- `rpg-assets/characters/elena/overworld/seated-reviewing-documents.png` (698×802)
- `rpg-assets/characters/elena/overworld/standing-portfolio.png` (612×822)
- `rpg-assets/characters/elio/standing-front.png` (798×1533)
- `rpg-assets/characters/hana/overworld/kneeling-bag.png` (484×745)
- `rpg-assets/characters/hana/overworld/phone-standing.png` (499×996)
- `rpg-assets/characters/hana/overworld/standing-back.png` (440×980)
- `rpg-assets/characters/iris/overworld/crouching.png` (458×793)
- `rpg-assets/characters/iris/overworld/over-shoulder-back.png` (359×842)
- `rpg-assets/characters/iris/overworld/standing-front.png` (419×842)
- `rpg-assets/characters/jun/standing-front.png` (638×1531)
- `rpg-assets/characters/kaede/overworld/arcade-playing-back.png` (666×1493)
- `rpg-assets/characters/kaede/overworld/arcade-playing-front.png` (765×1536)
- `rpg-assets/characters/kaede/overworld/crouching-relaxed.png` (1018×1536)
- `rpg-assets/characters/kaede/overworld/looking-back.png` (651×1523)
- `rpg-assets/characters/kaede/overworld/standing-front.png` (708×1532)
- `rpg-assets/characters/laca/overworld/casual/crouching.png` (1020×1526)
- `rpg-assets/characters/laca/overworld/casual/reaching-out.png` (650×1503)
- `rpg-assets/characters/laca/overworld/casual/walking-back.png` (612×1523)
- `rpg-assets/characters/laca/overworld/lifeguard/back-rescue-buoy.png` (578×1526)
- `rpg-assets/characters/laca/overworld/lifeguard/front-leaning.png` (641×1526)
- `rpg-assets/characters/laca/overworld/lifeguard/kneeling-lookout.png` (916×1499)
- `rpg-assets/characters/luna/overworld/looking-back.png` (469×822) — Replaced earlier cut-off leg pose with later full-length rear 3/4 revision.
- `rpg-assets/characters/luna/overworld/seated.png` (650×738) — Latest user-approved seated render reaches the right/bottom canvas edge; inspect right boot/trim before final in-game use.
- `rpg-assets/characters/luna/overworld/standing-front.png` (620×822)
- `rpg-assets/characters/marina/overworld/looking-back.png` (847×1535)
- `rpg-assets/characters/marina/overworld/seated-relaxing.png` (1024×1536)
- `rpg-assets/characters/marina/overworld/standing-front.png` (728×1533)
- `rpg-assets/characters/nereo/standing-front.png` (601×1448)
- `rpg-assets/characters/rina/overworld/alternate-card-pose.png` (891×1535)
- `rpg-assets/characters/rina/overworld/alternate-idol-pose.png` (940×1526)
- `rpg-assets/characters/rina/overworld/over-shoulder.png` (418×1003)
- `rpg-assets/characters/rina/overworld/reaching-idol.png` (571×1010) — Original illustration crops a leg. Retained as historical pose; requires art fix.
- `rpg-assets/characters/rina/overworld/seated-cards.png` (597×785)
- `rpg-assets/characters/shiori/overworld/over-shoulder.png` (839×1443)
- `rpg-assets/characters/shiori/overworld/reaching-book-back.png` (832×1148) — Original book was cropped; fine hair-edge extraction requires QA.
- `rpg-assets/characters/shiori/overworld/reaching-book-front.png` (1020×1530)
- `rpg-assets/characters/shiori/overworld/standing-book.png` (881×1530)
- `rpg-assets/characters/sierra/overworld/looking-back.png` (512×822)
- `rpg-assets/characters/sierra/overworld/seated-relaxed.png` (654×736)
- `rpg-assets/characters/sierra/overworld/standing-wink.png` (497×822)
- `rpg-assets/characters/sol/crouching.png` (1086×1445)
- `rpg-assets/characters/sol/looking-back.png` (925×1448)
- `rpg-assets/characters/sol/standing-front.png` (845×1447)
- `rpg-assets/characters/teo/overworld/looking-back.png` (351×1010)
- `rpg-assets/characters/teo/overworld/serving-tray.png` (469×1015)
- `rpg-assets/characters/teo/overworld/standing-front.png` (389×1015)
- `rpg-assets/characters/yuna/overworld/back-three-quarter.png` (986×1525)
- `rpg-assets/characters/yuna/overworld/crouching-cards.png` (1024×1482)
- `rpg-assets/characters/yuna/overworld/gamer-idle.png` (1013×1522)
- `rpg-assets/characters/yuna/overworld/headphones.png` (982×1530)
- `rpg-assets/characters/yuna/overworld/seated-cards.png` (1024×1533)
- `rpg-assets/characters/yuna/overworld/side-pose.png` (955×1519)
