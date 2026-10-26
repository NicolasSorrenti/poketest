# Neo Campus — Cross-character town events and CG queue

## Added content

**42 optional, fully scripted two-character encounters** spanning the 90-day RPG season. Each includes a full multi-speaker conversation, two meaningful player responses, one-time save state, a gallery memory, and a dedicated unique artwork target. **15 are follow-up scenes** gated on a real earlier completed episode.

The purpose is to make residents have creative work, friendships, rivalries, jobs, and ongoing community projects that continue whether or not the player is pursuing their romance route. These are non-mandatory, SFW, no-focus/no-time-cost scenes. They never automatically set romance commitments or bypass mandatory story chapters.

## Art production contract

All **42 CG targets are currently PENDING**, not approved illustrations. The game first attempts the event's dedicated `/rpg-assets/events/cg/season01/<event_id>.webp`; if missing, it displays the conspicuous non-final `/rpg-assets/events/cg/crossover_pending.svg` in-scene and in the gallery. The original dialogue, CG framing behavior, and save/gallery unlocks still work. The fallback SVG is deliberately generic; it is **not** a generated character illustration.

Production instructions:
1. Open `rpg_cross_character_events.js`, or read `NeoRpgCrossCharacterEvents.pendingArt` in Node, to see every exact ID, scene description, pair, and composition.
2. Generate a unique **16:9 illustration**, with both characters recognizable and the lower fifth available for dialogue. Preserve each character's approved facial reference, hairstyle, proportions, outfits and distinguishing details.
3. Place the approved WebP at the **exact** `image` path for that event; optionally place a matching thumbnail in `season01/thumbs/<event_id>.webp`. This automatically takes precedence over the placeholder. **Do not replace already approved artwork.**
4. When approved, set that event's `artPending` to `false` and update the manifest or queue. Do not mark placeholder art as final/approved.
5. Validate no broken image paths, dialogue overlaps, or prematurely unlocked gallery memories.

## Gameplay rules

Events can begin on venue entry or while talking to the leading NPC, according to each event's `trigger`. Every named guest must have been met and actually be at the same venue. A limited cross-event pin in `rpg_slice_of_life.js` preserves the pair's *natural weekly meeting* from unrelated town crowd redistribution—characters are **never teleported** to create a scene. Only one optional slice scene can occur per game day, with ordinary story events and planned appointments still taking priority.

Follow-ups are unavailable unless their prerequisite appeared and completed in the current save. The existing slice-of-life save model records choices and prevents repeats, so older saves remain compatible. In-scene CGs retain the existing full-scene background-and-dialogue presentation.

## Complete event and CG queue

### Shop scenes
- **The Window That Ate the Shop** — barb + hana; morning, days 10–90. `crossover_barb_hana_window_display`
- **A Jacket for a Bargain** — barb + camila; morning, days 12–90. `crossover_barb_camila_trade_coat`
- **A Fair Price for Victory** — reina + camila; morning, days 17–90. `crossover_reina_camila_trade_strategy`
- **The Price of a Smile** — camila + hana; morning, days 20–90. `crossover_camila_hana_countersale`
- **The Sign Everyone Missed** — jinx + sol; afternoon, days 19–90. `crossover_jinx_sol_midnight_sign`

### Park scenes
- **The Deep End Is Optional** — laca + marina; morning, days 10–90. `crossover_laca_marina_beginner_lesson`
- **The Rescue Drill** — laca + sol; morning, days 12–90. `crossover_laca_sol_rescue_drill`
- **Counting Ripples** — laca + luna; afternoon, days 18–90. `crossover_laca_luna_calm_water`
- **Steps Before the Spotlight** — laca + rina; afternoon, days 14–90. `crossover_laca_rina_safe_stage`
- **The Map with No Shortcut** — marina + sierra; morning, days 20–90. `crossover_marina_sierra_tide_sketch`
- **Two Ways to Catch a Sunset** — sol + sierra; morning, days 21–90. `crossover_sol_sierra_sunset_photos`
- **Champions in the Margins** — reina + shiori; afternoon, days 20–90. `crossover_reina_shiori_history_match`
- **The Reflective-Vest Makeover** — jinx + laca; afternoon, days 19–90. `crossover_jinx_laca_reflective_vest`
- **Fabric That Can Keep Up** — barb + laca; afternoon, days 20–90. `crossover_barb_laca_poolside_design`
- **When Adventurers Learn the Rules** — laca + sierra; morning, days 23–90. `crossover_laca_sierra_safety_walk`

### Arcade scenes
- **Neon Rehearsal** — rina + jinx; morning, days 15–90. `crossover_rina_jinx_neon_rehearsal`
- **A Cabinet with a Personality** — yuna + jinx; afternoon, days 14–90. `crossover_yuna_jinx_arcade_paint`
- **The Champion's Entrance** — barb + yuna; afternoon, days 14–90. `crossover_barb_yuna_arcade_costume`
- **The Scoreboard Pact** — yuna + kaede; afternoon, days 43–90. `crossover_yuna_kaede_scoreboard`

### Cafe scenes
- **Precision Meets Patchwork** — barb + akari; evening, days 18–90. `crossover_barb_akari_blueprint_night`
- **The Labels Are Lying** — hana + akari; evening, days 13–90. `crossover_hana_akari_shop_labels`
- **A Poster That Sings** — rina + barb; evening, days 16–90. `crossover_rina_barb_poster_fit`
- **A Quiet Table for Two** — elena + luna; afternoon, days 20–90. `crossover_elena_luna_tea_notes`
- **The Wrong Measurements** — barb + sierra; evening, days 22–90. `crossover_barb_sierra_measurement_mixup`

### Center scenes
- **An Impossible Opening Hand** — reina + akari; afternoon, days 12–90. `crossover_reina_akari_training_board`

### Library scenes
- **The Footnote War** — akari + shiori; afternoon, days 12–90. `crossover_akari_shiori_old_rules`
- **Notes Left in the Margins** — luna + shiori; afternoon, days 22–90. `crossover_luna_shiori_bookmarks`

### Follow-up scenes
- **Beyond the Kickboard** — laca + marina; morning, days 27–90. `crossover_laca_marina_second_lesson` (after `crossover_laca_marina_beginner_lesson`)
- **The Window Strikes Back** — barb + hana; morning, days 24–90. `crossover_barb_hana_ribbon_return` (after `crossover_barb_hana_window_display`)
- **After the Applause** — rina + jinx; morning, days 28–90. `crossover_rina_jinx_postshow_cleanup` (after `crossover_rina_jinx_neon_rehearsal`)
- **The Model That Lost** — reina + akari; afternoon, days 26–90. `crossover_reina_akari_rematch_model` (after `crossover_reina_akari_training_board`)
- **A Formula for Comfort** — barb + akari; evening, days 31–90. `crossover_barb_akari_wearable_math` (after `crossover_barb_akari_blueprint_night`)
- **A Team of Two Rivals** — yuna + kaede; afternoon, days 52–90. `crossover_yuna_kaede_charity_duo` (after `crossover_yuna_kaede_scoreboard`)
- **A Song Without a Stage** — laca + rina; afternoon, days 32–90. `crossover_laca_rina_first_performance` (after `crossover_laca_rina_safe_stage`)
- **A Walk on the Safe Side** — sierra + marina; morning, days 35–90. `crossover_sierra_marina_route_walk` (after `crossover_marina_sierra_tide_sketch`)
- **The Cabinet Opens** — yuna + jinx; afternoon, days 30–90. `crossover_yuna_jinx_cabinet_opening` (after `crossover_yuna_jinx_arcade_paint`)
- **A Costume for Real Life** — barb + rina; evening, days 33–90. `crossover_barb_rina_lights_costume` (after `crossover_rina_barb_poster_fit`)
- **The Rope Finally Lands** — laca + sol; morning, days 36–90. `crossover_laca_sol_training_graduation` (after `crossover_laca_sol_rescue_drill`)
- **No Discounts on Strategy** — reina + camila; morning, days 38–90. `crossover_reina_camila_fair_rematch` (after `crossover_reina_camila_trade_strategy`)
- **The Second Cup** — elena + luna; afternoon, days 35–90. `crossover_luna_elena_second_cup` (after `crossover_elena_luna_tea_notes`)
- **A New Player Returns** — hana + camila; morning, days 37–90. `crossover_hana_camila_new_player_return` (after `crossover_camila_hana_countersale`)
- **Safety in Full Color** — jinx + laca; afternoon, days 35–90. `crossover_laca_jinx_final_vest` (after `crossover_jinx_laca_reflective_vest`)

## QA

Use `node --test tests/rpg_cross_character_events.test.js`, followed by the existing RPG tests (`npm run test:rpg`). Dedicated checks cover event IDs, real schedule intersections, participant gates, one-time choice completion, save restoration, prerequisite chains, image candidates, pending-image fallback, and gallery unlocks.
