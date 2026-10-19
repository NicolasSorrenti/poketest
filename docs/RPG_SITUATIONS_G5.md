# Neo Campus RPG G5 — Situation-specific social events

**Gameplay milestone:** G5, October 18, 2026. Works alongside G1 daily priorities, G2 shared activities, G3 appointments, G4 pre-duel CGs, narrative-agent storylines, and the existing historical Classic TCG engine.

## Now playable

The RPG sidebar has a new **Unexpected Moments** panel. Rare, optional adult-cast social scenes appear based on **all** of the following: character's actual location/schedule, the time of day, season day range, bond affection (5+) and trust (1+), enough Focus, prior once-per-day interaction, and a stable 75% per-day/period deterministic opportunity roll.

These are not automatic interruptions, nor random image slides. The player decides whether to enter the scene. Each scene has two character-appropriate, SFW comedic/friendly choices and then an explicit **Save this memory** confirmation.

- Before confirmation, reading dialogue is **free** and does not spend focus, move time, update bonds, or unlock CGs.
- **Not now** and **Leave this moment** exit for free. The situation may still be discovered at later scheduled opportunities.
- Completion spends 6 Focus and **one period**, adds a modest affection/trust reward determined by the selected response (and occasional rivalry respect), and marks the character's standard daily `hungOut` interaction used. Ordinary hangouts and G2/G3 social interactions therefore cannot stack extra rewards that day.
- After completion, the **matching existing special CG** unlocks in the Gallery, but only if the matching `situationDone[id]` is recorded by the engine. No CG is earned from a generic hangout anymore. Missing images remain placeholders and never prevent a scene.
- Each special scene completes **once per 90-day season**. New Game+ resets the event's game-state availability while preserving previously earned Gallery images using the existing album behavior.
- Save/reload works in the choice and response phases; no re-roll, no duplicate rewards. Deterministic FNV-style hashing uses `eventId:day:slot`, without `Math.random`; refreshing can never change the opportunity roll.

## Eight situations / art continuity

| Character (all adult) | Public place | Period | Earliest day | Reused CG ID |
| --- | --- | --- | --- | --- |
| Hana | Card shop | Afternoon | 9 | `hana_apron_mixup` |
| Reina | Community Center | Evening | 21 | `reina_rain_catch` |
| Shiori | Library | Afternoon | 18 | `shiori_bookstack_wobble` |
| Yuna | Arcade | Evening | 13 | `yuna_card_scatter` |
| Akari | Library | Afternoon | 15 | `akari_notes_whirl` |
| Camila | Café | Afternoon | 14 | `camila_windy_receipts` |
| Marina | Riverside Park sandbar | Afternoon | 17 | `marina_beach_towel` |
| Kaede | Arcade | Evening | 49 | `kaede_jacket_prank` |

The scenes deliberately follow character identities and existing in-game locations (there is still no independent beach location). Every outfit remains fully worn; mishaps concern a tangled jacket, aprons, a floating towel or fallen cards, not sexual exposure. All scenes are **SFW, non-voyeuristic and adult-cast only**, with personality and comedy taking precedence.

## Image creator agent: what needs producing?

**No duplicate art requests.** The eight special CG IDs and exact image/thumbnail paths already exist in `docs/CG_ART_AGENT_HANDOFF.md` and `docs/cg-art-queue.json`; G5 now gives those eight a unique **situation** trigger. Continue checking which image binaries are actually present, then generate only missing approved images.

- Full image: `rpg-assets/events/cg/season01/<id>.webp` — 1920 × 1080, sRGB.
- Gallery thumbnail: `rpg-assets/events/cg/season01/thumbs/<id>.webp` — 640 × 360.
- Consistent character appearance from existing portraits / bibles, legible emotional acting, shared VN rendering style, bottom 20% clear of text-sensitive visual detail.
- No embedded text or official licensed card art. No nudity, lingerie shots, or forced voyeuristic camera angles.
- Deliver a **separate additive ZIP** with only verified missing images, image dimensions, exact paths and hashes. Do not overwrite existing portraits, scenes, or scripts.

This gameplay milestone does **not** create new CG image files.

## Implementation and cross-agent boundary

- `rpg_situations.js` is the pure dual CommonJS/browser model: `events`, `available`, `start`, `choose`, `finish`, `hydrate`, `chance`, `validate`.
- `rpg.js` adds the sidebar events, saved scene progression, dialogue choice and completion. Story, side-quest and rival flows remain independently authored by their respective agents.
- `rpg_cg_gallery.js` switches the original eight special IDs from generic `hangout` to `situation`, and checks the **matching completed event ID**, so the general `recordCG('hangout')` call cannot award exclusive scene art.
- `rpg_daily_planner.js` sees currently discoverable events in actual scheduled locations and offers free travel suggestions; no time skip or auto-trigger.
- `server.js` allowlists only `/rpg_situations.js` (not server internals). `rpg.html` includes the script before `rpg.js`.
- Existing save key `neoHarborRpgV1` remains unchanged; optional `situationDone` and `activeSituation` are safe-migrated on loading old campaigns. Expired state does not create an unearned image.
- **No Classic TCG card rules, CPU intelligence, Cube draft or multiplayer behavior changed.**

## Verification

Run `npm run test:rpg`, the native RPG integration suite, the real Chromium RPG smoke, and broader Node/TCG checks. New unit tests cover all eight real NPC timetable slots through 90 days, deterministic rolls, resource validation, saved choices, CG exclusivity, and idempotent completion. Simulated UI tests verify save/reload, finishing a scene, and declining it without time/resource changes.

## Remaining roadmap G6

Polish 90-day campaign closure, visible consequences, robust gallery progress and replay hints, gallery asset validation, and full end-to-end town–social–CG–duel test coverage. Do not claim all 1,479 historical card attacks or every authored story is complete without independent verification.
