# Neo Harbor — CG Production Handoff (32 event images)

**Owner:** illustration / image-creator agent. **Gameplay:** `rpg_cg_gallery.js` owns metadata and triggers. **Characters and story:** parallel narrative agent. **Asset status:** none of these 32 new images are presently committed in this manifest; treat all as requested, not delivered. Older art ZIPs may contain other scenes; check actual image inventory before reuse.

## Visual bible (mandatory for all 32 images)
Create polished original **anime visual-novel event illustrations**, stylistically coherent with Neo Harbor’s existing portraits and approved look sheets. All eight heroines are clearly **adult women (19–24)**. SFW romantic-comedy / tasteful anime fan service only. No explicit nudity, upskirt exposure, visible underwear, sexual acts, voyeuristic changing-room views, or implied minors. Situational embarrassment should be caused by humor, clothes/props getting tangled, a gust, or a playful pose rather than nonconsensual exposure.

**Deliverables per ID:** one `1920×1080` sRGB **16:9 WebP** full CG and one `640×360` matching WebP thumbnail. Keep bottom **20% relatively uncluttered** for UI dialogue, but do not draw any UI or text into the art. Use a single consistent anime rendering pipeline (line weight, shading, skin tone, lighting). Do not draw real copyrighted Pokémon cards, card text, logos, or branded trading card art: anonymous sleeves/backs suffice. Images must be real separate files, not a tiled contact sheet, and not one identical pose recropped 32 times.

**Naming:** `rpg-assets/events/cg/season01/<id>.webp` and `rpg-assets/events/cg/season01/thumbs/<id>.webp`. Preserve existing `rpg-assets/{id}.png` portraits, any installed prior art, and the user’s archive. If one of these exact IDs is already fulfilled, verify art/identity/format first and do not regenerate. On delivery include an index manifest, dimensions, bytes and SHA-256 per image; package as an additive ZIP suitable for committing to GitHub.

**Use an established approved character reference first.** If it conflicts with summary below, flag the discrepancy rather than silently changing the character. Keep skin tone and face shape consistent and distinct, even in swimsuits. Marina’s sandy shore is the *existing riverside park/sandbar* — the game does not currently have a separate playable beach location.

## Canonical cast continuity
- **hana:** Hana Mizuno, 20. Chestnut shoulder-length wavy hair half-up at work. Cream/coral/warm teal wardrobe; soft pastel cardigan, pleated streetwear skirt, enamel pins, and battered card shop lanyard. Enthusiastic, warm, occasionally shy.
- **reina:** Reina Kurogane, 21. Long ink-black hair with severe side part and red underlayer, subtle silver ear cuff. Black/garnet/silver palette; cropped charcoal motorcycle jacket, fitted jersey, tailored trousers. Intense, fiercely disciplined, guarded smiles.
- **shiori:** Shiori Tsukishima, 23. Straight dark-violet bob tucked behind ear, vintage watch and occasionally thin reading glasses. Slate blue/pearl/muted violet, structured long coat, turtleneck, asymmetric skirt and boots. Gentle composure, witty reserve.
- **yuna:** Yuna Hoshino, 19. Spiky twin buns with dyed neon tips, electric cyan/raspberry/blue palette, oversized graphic jacket, mismatched patterned tights, sticker-covered deck box and lucky bracelet. Loud theatrical mischief, honest flashes of insecurity.
- **akari:** Akari Fujimoto, 22. Glossy dark hair in high angled ponytail, square glasses, indigo/mint/white palette, angular blazer, graphic mock-neck, cargo skirt, tablet and color-coded notes. Sharp, methodical, surprisingly easily flustered.
- **camila:** Camila Vega, 24. Voluminous dark curls swept over one shoulder, burgundy/gold/black palette, long wine-colored coat, fitted vest, tailored trousers, ringed hands and gold card-case chain. Elegant, teasing, privately empathetic.
- **marina:** Marina Aoki, 21. Soft blue-black side braid and shell-shaped clip, seafoam/navy/sand palette, lightweight linen jacket, navy casualwear, canvas bag. River lover, reflective, gentle and increasingly brave.
- **kaede:** Kaede Arashi, 22. Messy silver-gray shag haircut with dark roots, acid green/charcoal/violet palette, cropped leather jacket, asymmetric tee, utility belt, combat boots and safety-pin charms. Punk bravado over cautious warmth.

## Art queue — 32 standalone prompts
Every section below is a complete request. Apply the shared visual bible above, the canonical character continuity for that character, and the unique shot specification. Producing artwork is a different workstream; the game already knows the expected file paths.

### 01. hana_first_meeting — The Shop's Warm Welcome

**Character:** hana; **Type:** profile; **Gameplay unlock:** meet, any public location, affection ≥ 0, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Hana Mizuno, 20. Chestnut shoulder-length wavy hair half-up at work. Cream/coral/warm teal wardrobe; soft pastel cardigan, pleated streetwear skirt, enamel pins, and battered card shop lanyard. Enthusiastic, warm, occasionally shy.**

**The moment:** A welcoming moment behind the Lucky Draw counter; Hana offers the protagonist a neatly sleeved starter card.

**Staging/composition:** Three-quarter medium shot, shop shelves softly receding; negative space at lower fifth for VN dialogue. Bottom 20% clear for dialogue UI.

**Costume:** Pastel varsity cardigan, layered streetwear skirt, crossbody organizer, enamel pins and shop lanyard.

**Acting:** Bright sincere smile with a playful hint of nerves.

**Set / lighting:** Warm shop lighting; card binders, deck boxes, welcoming handmade signage.

**Mood:** cozy. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/hana_first_meeting.webp` and `rpg-assets/events/cg/season01/thumbs/hana_first_meeting.webp`.

---

### 02. hana_shop_challenge — One More Match?

**Character:** hana; **Type:** pre_duel; **Gameplay unlock:** before_duel, shop, affection ≥ 1, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Hana Mizuno, 20. Chestnut shoulder-length wavy hair half-up at work. Cream/coral/warm teal wardrobe; soft pastel cardigan, pleated streetwear skirt, enamel pins, and battered card shop lanyard. Enthusiastic, warm, occasionally shy.**

**The moment:** Hana sits at a trading table, checking the top card of her sleeved deck and looking up, delighted by the challenge.

**Staging/composition:** Diagonal table-level three-quarter shot; clearly show deck box and her free hand, leaving lower fifth clear. Bottom 20% clear for dialogue UI.

**Costume:** Canonical shop layers with lanyard and pin-covered cardigan, sleeves pushed up for playing.

**Acting:** Excited competitive smile, eye contact with player.

**Set / lighting:** Busy card shop after school hours, warm side lighting; tabletop playmat with no readable card text.

**Mood:** playful. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/hana_shop_challenge.webp` and `rpg-assets/events/cg/season01/thumbs/hana_shop_challenge.webp`.

---

### 03. hana_flyer_afternoon — Flyers and Riverside Breezes

**Character:** hana; **Type:** social; **Gameplay unlock:** hangout, park, affection ≥ 3, day ≥ 1. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Hana Mizuno, 20. Chestnut shoulder-length wavy hair half-up at work. Cream/coral/warm teal wardrobe; soft pastel cardigan, pleated streetwear skirt, enamel pins, and battered card shop lanyard. Enthusiastic, warm, occasionally shy.**

**The moment:** Hana sits beside the player on a riverside picnic blanket, sorting community-event flyers between laughter.

**Staging/composition:** Wide seated composition, character mid-right, river and silhouettes on left; dialogue-safe bottom. Bottom 20% clear for dialogue UI.

**Costume:** Comfortable pleated skirt, soft cardigan tied at waist, practical sneakers; same enamel pins.

**Acting:** Open laughter, relaxed and unguarded.

**Set / lighting:** Tree shade, riverboats at distance, paper flyers and card sleeves.

**Mood:** warm. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/hana_flyer_afternoon.webp` and `rpg-assets/events/cg/season01/thumbs/hana_flyer_afternoon.webp`.

---

### 04. hana_apron_mixup — An Apron Too Many

**Character:** hana; **Type:** special; **Gameplay unlock:** hangout, shop, affection ≥ 5, day ≥ 9, period afternoon. **Fan-service intensity:** 2/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Hana Mizuno, 20. Chestnut shoulder-length wavy hair half-up at work. Cream/coral/warm teal wardrobe; soft pastel cardigan, pleated streetwear skirt, enamel pins, and battered card shop lanyard. Enthusiastic, warm, occasionally shy.**

**The moment:** Trying on a promotional apron over her fully worn outfit, Hana accidentally tangles its long ties with her card case. She catches the player laughing and makes a mock-indignant face.

**Staging/composition:** Mid-shot from doorway, apron and sleeves clearly readable; avoid a dressing-room voyeur viewpoint. Bottom 20% clear for dialogue UI.

**Costume:** Fully clothed shop outfit and bright promotional apron; modest playful silhouette.

**Acting:** Flustered blush turning into a delighted grin.

**Set / lighting:** Card shop storage room, display ribbons and a toppled stack of sleeves.

**Mood:** ecchi-comedy. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/hana_apron_mixup.webp` and `rpg-assets/events/cg/season01/thumbs/hana_apron_mixup.webp`.

---

### 05. reina_rival_intro — The Rival's First Glance

**Character:** reina; **Type:** profile; **Gameplay unlock:** meet, any public location, affection ≥ 0, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Reina Kurogane, 21. Long ink-black hair with severe side part and red underlayer, subtle silver ear cuff. Black/garnet/silver palette; cropped charcoal motorcycle jacket, fitted jersey, tailored trousers. Intense, fiercely disciplined, guarded smiles.**

**The moment:** Reina stands at a quiet practice table, arms folded around a sleeved deck case, silently sizing up a new opponent.

**Staging/composition:** Slightly low three-quarter hero composition, sharp lines, stage area below clear. Bottom 20% clear for dialogue UI.

**Costume:** Charcoal moto jacket, fitted tournament jersey, high-waisted trousers, silver ear cuff.

**Acting:** Unblinking competitive stare and a controlled half-smile.

**Set / lighting:** Community Center practice tables, precise overhead spotlights.

**Mood:** dramatic. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/reina_rival_intro.webp` and `rpg-assets/events/cg/season01/thumbs/reina_rival_intro.webp`.

---

### 06. reina_center_predue — Calculated Opening

**Character:** reina; **Type:** pre_duel; **Gameplay unlock:** before_duel, center, affection ≥ 1, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Reina Kurogane, 21. Long ink-black hair with severe side part and red underlayer, subtle silver ear cuff. Black/garnet/silver palette; cropped charcoal motorcycle jacket, fitted jersey, tailored trousers. Intense, fiercely disciplined, guarded smiles.**

**The moment:** Reina fans three sleeved cards across the table, considering an opening play before meeting the player's eyes.

**Staging/composition:** Dynamic side-angle medium shot, card backs visible without duplicating licensed card art. Bottom 20% clear for dialogue UI.

**Costume:** Tournament jersey, charcoal cropped jacket at chair, signature ear cuff.

**Acting:** Controlled confidence, tiny daring grin.

**Set / lighting:** Official duel table with soft arena lighting and blurred bracket board.

**Mood:** competitive. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/reina_center_predue.webp` and `rpg-assets/events/cg/season01/thumbs/reina_center_predue.webp`.

---

### 07. reina_training_break — After the Practice Session

**Character:** reina; **Type:** social; **Gameplay unlock:** hangout, center, affection ≥ 3, day ≥ 8. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Reina Kurogane, 21. Long ink-black hair with severe side part and red underlayer, subtle silver ear cuff. Black/garnet/silver palette; cropped charcoal motorcycle jacket, fitted jersey, tailored trousers. Intense, fiercely disciplined, guarded smiles.**

**The moment:** Reina leans against the empty practice-table rail, sharing strategy notes and a bottle of water after a long training session.

**Staging/composition:** Wide two-point perspective with Reina on the right, note pages on table; dialogue-safe bottom. Bottom 20% clear for dialogue UI.

**Costume:** Tournament outfit, jacket resting on chair, practical fully covered athletic top.

**Acting:** Rare unguarded smile, serious eyes.

**Set / lighting:** Community center at sunset, long warm bands of light across floor.

**Mood:** quiet. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/reina_training_break.webp` and `rpg-assets/events/cg/season01/thumbs/reina_training_break.webp`.

---

### 08. reina_rain_catch — Not So Impeccable

**Character:** reina; **Type:** special; **Gameplay unlock:** hangout, center, affection ≥ 5, day ≥ 21, period evening. **Fan-service intensity:** 2/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Reina Kurogane, 21. Long ink-black hair with severe side part and red underlayer, subtle silver ear cuff. Black/garnet/silver palette; cropped charcoal motorcycle jacket, fitted jersey, tailored trousers. Intense, fiercely disciplined, guarded smiles.**

**The moment:** A sudden splash from a faulty roof gutter catches Reina as she returns from practice. Her neatly kept hair is a mess, and she glares before laughing with the player.

**Staging/composition:** Three-quarter upper-body cinematic shot; comedic water droplets, no clothing transparency. Bottom 20% clear for dialogue UI.

**Costume:** Fully covered jersey, jacket closed; damp hair and neat deck case protected under arm.

**Acting:** Mock fury dissolving into a reluctant smile.

**Set / lighting:** Evening entrance to community center; rain reflections and neon.

**Mood:** comedy. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/reina_rain_catch.webp` and `rpg-assets/events/cg/season01/thumbs/reina_rain_catch.webp`.

---

### 09. shiori_first_page — A Quiet Invitation

**Character:** shiori; **Type:** profile; **Gameplay unlock:** meet, any public location, affection ≥ 0, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Shiori Tsukishima, 23. Straight dark-violet bob tucked behind ear, vintage watch and occasionally thin reading glasses. Slate blue/pearl/muted violet, structured long coat, turtleneck, asymmetric skirt and boots. Gentle composure, witty reserve.**

**The moment:** Shiori stands by a library window holding a historical tournament book and looks up from the pages.

**Staging/composition:** Gentle medium shot at eye level, ample negative space below and to left. Bottom 20% clear for dialogue UI.

**Costume:** Long slate coat, high-neck top, asymmetric layered skirt, boots, vintage watch.

**Acting:** Measured amusement, observant eyes.

**Set / lighting:** Library shelves, rain-speckled glass and low afternoon light.

**Mood:** elegant. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/shiori_first_page.webp` and `rpg-assets/events/cg/season01/thumbs/shiori_first_page.webp`.

---

### 10. shiori_library_predue — Quiet Contest

**Character:** shiori; **Type:** pre_duel; **Gameplay unlock:** before_duel, library, affection ≥ 1, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Shiori Tsukishima, 23. Straight dark-violet bob tucked behind ear, vintage watch and occasionally thin reading glasses. Slate blue/pearl/muted violet, structured long coat, turtleneck, asymmetric skirt and boots. Gentle composure, witty reserve.**

**The moment:** Shiori calmly lays out her card sleeves on a study table, moving a pair of reading glasses aside before inviting a quiet duel.

**Staging/composition:** Table-height balanced medium shot, hands and deck visible, space at bottom. Bottom 20% clear for dialogue UI.

**Costume:** Canonical coat folded over chair, turtleneck, layered skirt, watch.

**Acting:** Soft knowing smile and focused gaze.

**Set / lighting:** Library strategy desk, desk lamp, annotated tournament book.

**Mood:** tender. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/shiori_library_predue.webp` and `rpg-assets/events/cg/season01/thumbs/shiori_library_predue.webp`.

---

### 11. shiori_cafe_conversation — Between the Lines

**Character:** shiori; **Type:** social; **Gameplay unlock:** hangout, cafe, affection ≥ 3, day ≥ 10. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Shiori Tsukishima, 23. Straight dark-violet bob tucked behind ear, vintage watch and occasionally thin reading glasses. Slate blue/pearl/muted violet, structured long coat, turtleneck, asymmetric skirt and boots. Gentle composure, witty reserve.**

**The moment:** Shiori shares a surprisingly funny memory over tea, laughing into her sleeve while a hand-written list of deck ideas lies beside the cups.

**Staging/composition:** Intimate café two-seat composition with Shiori central, leave dialogue-safe base. Bottom 20% clear for dialogue UI.

**Costume:** Elegant long coat, fitted turtleneck and signature watch.

**Acting:** Unexpected laughter, a little vulnerable.

**Set / lighting:** Warm café window, evening city glow and teacups.

**Mood:** intimate. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/shiori_cafe_conversation.webp` and `rpg-assets/events/cg/season01/thumbs/shiori_cafe_conversation.webp`.

---

### 12. shiori_bookstack_wobble — The Wobbling Book Stack

**Character:** shiori; **Type:** special; **Gameplay unlock:** hangout, library, affection ≥ 5, day ≥ 18, period afternoon. **Fan-service intensity:** 2/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Shiori Tsukishima, 23. Straight dark-violet bob tucked behind ear, vintage watch and occasionally thin reading glasses. Slate blue/pearl/muted violet, structured long coat, turtleneck, asymmetric skirt and boots. Gentle composure, witty reserve.**

**The moment:** Shiori reaches for a high shelf while carrying books. A stack topples and she steadies her layered skirt and coat with one hand as you rush to catch the books; she blushes at the awkward dance.

**Staging/composition:** Whimsical side shot showing safe footing and falling books; no voyeur/under-skirt angle. Bottom 20% clear for dialogue UI.

**Costume:** Canonical layered fully covered skirt, long coat, sturdy boots.

**Acting:** Composed face cracking into surprised embarrassment.

**Set / lighting:** Quiet library aisle, gently tumbling books and soft dust motes.

**Mood:** ecchi-comedy. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/shiori_bookstack_wobble.webp` and `rpg-assets/events/cg/season01/thumbs/shiori_bookstack_wobble.webp`.

---

### 13. yuna_arrival — Arcade Queen

**Character:** yuna; **Type:** profile; **Gameplay unlock:** meet, any public location, affection ≥ 0, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Yuna Hoshino, 19. Spiky twin buns with dyed neon tips, electric cyan/raspberry/blue palette, oversized graphic jacket, mismatched patterned tights, sticker-covered deck box and lucky bracelet. Loud theatrical mischief, honest flashes of insecurity.**

**The moment:** Yuna sits backwards on an arcade stool with her sticker-covered deck box balanced on the seat, grinning as she challenges the newcomer.

**Staging/composition:** Wide energetic portrait, cabinet lights frame character without UI clutter. Bottom 20% clear for dialogue UI.

**Costume:** Oversized graphic jacket, shorts over patterned tights, bright sneakers, lucky bracelet.

**Acting:** Cartoonishly cocky grin, bright eyes.

**Set / lighting:** Arcade cabinets with neon cyan and raspberry lights.

**Mood:** energetic. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/yuna_arrival.webp` and `rpg-assets/events/cg/season01/thumbs/yuna_arrival.webp`.

---

### 14. yuna_arcade_predue — The Wild Combo

**Character:** yuna; **Type:** pre_duel; **Gameplay unlock:** before_duel, arcade, affection ≥ 1, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Yuna Hoshino, 19. Spiky twin buns with dyed neon tips, electric cyan/raspberry/blue palette, oversized graphic jacket, mismatched patterned tights, sticker-covered deck box and lucky bracelet. Loud theatrical mischief, honest flashes of insecurity.**

**The moment:** Yuna sorts a ridiculous stack of sleeved cards on a small playmat, about to unveil an eccentric plan.

**Staging/composition:** Over-the-table three-quarter frame showing hands, sleeves, sticker-covered deck box. Bottom 20% clear for dialogue UI.

**Costume:** Her oversized printed jacket and mismatched tights; recognizable twin buns with colored tips.

**Acting:** Gleeful theatrical confidence.

**Set / lighting:** Arcade floor, colorful cabinets, dramatic cyan-magenta rim light.

**Mood:** chaotic. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/yuna_arcade_predue.webp` and `rpg-assets/events/cg/season01/thumbs/yuna_arcade_predue.webp`.

---

### 15. yuna_score_challenge — One More Try

**Character:** yuna; **Type:** social; **Gameplay unlock:** hangout, arcade, affection ≥ 3, day ≥ 5. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Yuna Hoshino, 19. Spiky twin buns with dyed neon tips, electric cyan/raspberry/blue palette, oversized graphic jacket, mismatched patterned tights, sticker-covered deck box and lucky bracelet. Loud theatrical mischief, honest flashes of insecurity.**

**The moment:** Yuna points triumphantly at a hilariously low score and offers the player a celebratory high-five, both clearly in on the joke.

**Staging/composition:** Medium-wide energetic shot, hands in gesture, game scoreboard nonlegible. Bottom 20% clear for dialogue UI.

**Costume:** Oversized graphic jacket, layered shorts and patterned tights, bracelets.

**Acting:** Laughing so hard she can barely speak.

**Set / lighting:** Bright arcade corner, confetti ticket spill and glowing machines.

**Mood:** playful. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/yuna_score_challenge.webp` and `rpg-assets/events/cg/season01/thumbs/yuna_score_challenge.webp`.

---

### 16. yuna_card_scatter — Cardstorm Catastrophe

**Character:** yuna; **Type:** special; **Gameplay unlock:** hangout, arcade, affection ≥ 5, day ≥ 13, period evening. **Fan-service intensity:** 2/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Yuna Hoshino, 19. Spiky twin buns with dyed neon tips, electric cyan/raspberry/blue palette, oversized graphic jacket, mismatched patterned tights, sticker-covered deck box and lucky bracelet. Loud theatrical mischief, honest flashes of insecurity.**

**The moment:** Yuna bends to gather a shower of fallen sleeves while her oversized jacket gets caught on a chair. She notices the player's attempt to help and shoots a mischievous, teasing grin.

**Staging/composition:** Comic cinematic eye-level side composition, focused on expressive pose, sleeves and face; no undergarment view. Bottom 20% clear for dialogue UI.

**Costume:** Fully covered shorts and patterned tights under her signature oversized jacket.

**Acting:** Startled grin becoming mock-scandalized laughter.

**Set / lighting:** Arcade stools, glittering tokens and loose card sleeves.

**Mood:** ecchi-comedy. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/yuna_card_scatter.webp` and `rpg-assets/events/cg/season01/thumbs/yuna_card_scatter.webp`.

---

### 17. akari_data_intro — The Researcher's Question

**Character:** akari; **Type:** profile; **Gameplay unlock:** meet, any public location, affection ≥ 0, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Akari Fujimoto, 22. Glossy dark hair in high angled ponytail, square glasses, indigo/mint/white palette, angular blazer, graphic mock-neck, cargo skirt, tablet and color-coded notes. Sharp, methodical, surprisingly easily flustered.**

**The moment:** Akari studies a tablet of bracket statistics and raises her eyes just as the newcomer approaches.

**Staging/composition:** Clean geometric medium shot with tabletop and reserved bottom area. Bottom 20% clear for dialogue UI.

**Costume:** Angular indigo utility blazer, graphic mock-neck, cargo skirt, square glasses.

**Acting:** Composed and curious; one raised eyebrow.

**Set / lighting:** Town Library research desk, sticky notes and tournament charts.

**Mood:** precise. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/akari_data_intro.webp` and `rpg-assets/events/cg/season01/thumbs/akari_data_intro.webp`.

---

### 18. akari_library_predue — Predict the Draw

**Character:** akari; **Type:** pre_duel; **Gameplay unlock:** before_duel, library, affection ≥ 1, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Akari Fujimoto, 22. Glossy dark hair in high angled ponytail, square glasses, indigo/mint/white palette, angular blazer, graphic mock-neck, cargo skirt, tablet and color-coded notes. Sharp, methodical, surprisingly easily flustered.**

**The moment:** Akari aligns her deck and a set of handwritten probabilities on a desk, then closes the notebook with confidence.

**Staging/composition:** Structured symmetric medium shot, tablet and deck visible, dialogue-safe lower band. Bottom 20% clear for dialogue UI.

**Costume:** Canonical blazer, cargo skirt, glossy high ponytail, glasses.

**Acting:** Analytical smile, competitive spark.

**Set / lighting:** Study room desk lamp, mathematical notes without real card spoilers.

**Mood:** precise. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/akari_library_predue.webp` and `rpg-assets/events/cg/season01/thumbs/akari_library_predue.webp`.

---

### 19. akari_center_workshop — A Theory for Two

**Character:** akari; **Type:** social; **Gameplay unlock:** hangout, center, affection ≥ 3, day ≥ 6. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Akari Fujimoto, 22. Glossy dark hair in high angled ponytail, square glasses, indigo/mint/white palette, angular blazer, graphic mock-neck, cargo skirt, tablet and color-coded notes. Sharp, methodical, surprisingly easily flustered.**

**The moment:** Akari explains an opening-hand puzzle on a whiteboard while the player offers a silly counterexample that makes her laugh.

**Staging/composition:** Three-quarter shot with whiteboard left, character right, bottom space for UI. Bottom 20% clear for dialogue UI.

**Costume:** Fitted utility blazer, mock-neck, cargo skirt and glasses.

**Acting:** Surprised smile breaking her usual composure.

**Set / lighting:** Community Center club classroom, marker pens and shuffled deck cases.

**Mood:** warm. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/akari_center_workshop.webp` and `rpg-assets/events/cg/season01/thumbs/akari_center_workshop.webp`.

---

### 20. akari_notes_whirl — Out of Control Variables

**Character:** akari; **Type:** special; **Gameplay unlock:** hangout, library, affection ≥ 5, day ≥ 15, period afternoon. **Fan-service intensity:** 2/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Akari Fujimoto, 22. Glossy dark hair in high angled ponytail, square glasses, indigo/mint/white palette, angular blazer, graphic mock-neck, cargo skirt, tablet and color-coded notes. Sharp, methodical, surprisingly easily flustered.**

**The moment:** A gust from an open window sends Akari's color-coded research notes flying. She lunges to catch the pages, her blazer flaring, and fixes the player with a hilariously helpless stare.

**Staging/composition:** Dynamic mid-shot from the side, floating sheets and ponytail motion, safe fully clothed angle. Bottom 20% clear for dialogue UI.

**Costume:** Canonical fully covered utility blazer and cargo skirt; glasses slightly askew.

**Acting:** Utter surprise melting into embarrassed laughter.

**Set / lighting:** Library open window, sunlit flying note papers.

**Mood:** ecchi-comedy. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/akari_notes_whirl.webp` and `rpg-assets/events/cg/season01/thumbs/akari_notes_whirl.webp`.

---

### 21. camila_collector_intro — The Collector's Eye

**Character:** camila; **Type:** profile; **Gameplay unlock:** meet, any public location, affection ≥ 0, day ≥ 1. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Camila Vega, 24. Voluminous dark curls swept over one shoulder, burgundy/gold/black palette, long wine-colored coat, fitted vest, tailored trousers, ringed hands and gold card-case chain. Elegant, teasing, privately empathetic.**

**The moment:** Camila opens an elegant case of rare card sleeves across a shop counter and glances up with a knowing half-smile.

**Staging/composition:** Fashion editorial medium composition, gold accents and ample dialogue space. Bottom 20% clear for dialogue UI.

**Costume:** Wine-colored long coat, fitted vest, tailored trousers, gold case chain and rings.

**Acting:** Knowing playful half-smile.

**Set / lighting:** Shop trading counter, reflective glass, warm golden light.

**Mood:** alluring. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/camila_collector_intro.webp` and `rpg-assets/events/cg/season01/thumbs/camila_collector_intro.webp`.

---

### 22. camila_shop_predue — Terms of the Duel

**Character:** camila; **Type:** pre_duel; **Gameplay unlock:** before_duel, shop, affection ≥ 1, day ≥ 1. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Camila Vega, 24. Voluminous dark curls swept over one shoulder, burgundy/gold/black palette, long wine-colored coat, fitted vest, tailored trousers, ringed hands and gold card-case chain. Elegant, teasing, privately empathetic.**

**The moment:** Camila elegantly places a card case on the table and fans her sleeved deck as if arranging an irresistible deal.

**Staging/composition:** Slightly low fashionable medium shot, card case and ringed hand featured. Bottom 20% clear for dialogue UI.

**Costume:** Signature burgundy coat, gold chain and fitted vest, tailored trousers.

**Acting:** Confident, teasing challenge.

**Set / lighting:** The Lucky Draw's glass display and warm spotlights.

**Mood:** flirtatious. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/camila_shop_predue.webp` and `rpg-assets/events/cg/season01/thumbs/camila_shop_predue.webp`.

---

### 23. camila_cafe_bargain — More Than a Trade

**Character:** camila; **Type:** social; **Gameplay unlock:** hangout, cafe, affection ≥ 3, day ≥ 7. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Camila Vega, 24. Voluminous dark curls swept over one shoulder, burgundy/gold/black palette, long wine-colored coat, fitted vest, tailored trousers, ringed hands and gold card-case chain. Elegant, teasing, privately empathetic.**

**The moment:** Camila lounges over a café table, explaining the surprising story behind a worthless old card, and is genuinely pleased when the player listens.

**Staging/composition:** Seated three-quarter fashion composition, intimate but respectful distance. Bottom 20% clear for dialogue UI.

**Costume:** Burgundy coat draped over chair, fully covered vest and tailored trousers.

**Acting:** Open authentic smile replacing a practiced expression.

**Set / lighting:** Quiet café at golden hour; notebook and simple snack.

**Mood:** romantic. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/camila_cafe_bargain.webp` and `rpg-assets/events/cg/season01/thumbs/camila_cafe_bargain.webp`.

---

### 24. camila_windy_receipts — The Wind's Counteroffer

**Character:** camila; **Type:** special; **Gameplay unlock:** hangout, cafe, affection ≥ 5, day ≥ 14, period afternoon. **Fan-service intensity:** 2/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Camila Vega, 24. Voluminous dark curls swept over one shoulder, burgundy/gold/black palette, long wine-colored coat, fitted vest, tailored trousers, ringed hands and gold card-case chain. Elegant, teasing, privately empathetic.**

**The moment:** A breeze from the riverside catches Camila's long coat and sends trade receipts fluttering. She uses a hand to secure the coat, then strikes an exaggerated fashion pose to cover the mishap.

**Staging/composition:** Comic editorial three-quarter shot; coat lining catching light, no exposed underwear. Bottom 20% clear for dialogue UI.

**Costume:** Tailored trousers and fully worn fitted vest beneath dramatic burgundy coat.

**Acting:** Half scandalized, half amused, playful wink.

**Set / lighting:** Riverside café terrace, loose golden papers and sunlight.

**Mood:** ecchi-comedy. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/camila_windy_receipts.webp` and `rpg-assets/events/cg/season01/thumbs/camila_windy_receipts.webp`.

---

### 25. marina_river_intro — Where the River Turns

**Character:** marina; **Type:** profile; **Gameplay unlock:** meet, any public location, affection ≥ 0, day ≥ 1. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Marina Aoki, 21. Soft blue-black side braid and shell-shaped clip, seafoam/navy/sand palette, lightweight linen jacket, navy casualwear, canvas bag. River lover, reflective, gentle and increasingly brave.**

**The moment:** Marina sits on a wooden riverfront bench with her well-used deck box, watching a ferry approach.

**Staging/composition:** Calm wide portrait, leading lines from waterfront rail toward character. Bottom 20% clear for dialogue UI.

**Costume:** Loose linen jacket, fitted navy casualwear, practical sneakers, shell hair clip.

**Acting:** Thoughtful welcome smile.

**Set / lighting:** Neo Harbor waterfront, reeds, riverboat and pale sky.

**Mood:** peaceful. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/marina_river_intro.webp` and `rpg-assets/events/cg/season01/thumbs/marina_river_intro.webp`.

---

### 26. marina_riverside_predue — A Duel by the Water

**Character:** marina; **Type:** pre_duel; **Gameplay unlock:** before_duel, park, affection ≥ 1, day ≥ 1. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Marina Aoki, 21. Soft blue-black side braid and shell-shaped clip, seafoam/navy/sand palette, lightweight linen jacket, navy casualwear, canvas bag. River lover, reflective, gentle and increasingly brave.**

**The moment:** Marina sits on a sandy riverside blanket with a deck of sleeved cards in her lap, looking up to ask whether the player is ready.

**Staging/composition:** Scenic seated full-body three-quarter shot, water and sandbar as background; dialogue-safe lower fifth. Bottom 20% clear for dialogue UI.

**Costume:** Light swim cover-up over a modest one-piece swimsuit or linen summer outfit, canonical shell clip and braid.

**Acting:** Warm, quietly determined expression.

**Set / lighting:** Riverside sandy bank, picnic bag, blanket, cards, glittering water.

**Mood:** summer. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/marina_riverside_predue.webp` and `rpg-assets/events/cg/season01/thumbs/marina_riverside_predue.webp`.

---

### 27. marina_sunset_cards — Sunset Strategy

**Character:** marina; **Type:** social; **Gameplay unlock:** hangout, park, affection ≥ 3, day ≥ 8. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Marina Aoki, 21. Soft blue-black side braid and shell-shaped clip, seafoam/navy/sand palette, lightweight linen jacket, navy casualwear, canvas bag. River lover, reflective, gentle and increasingly brave.**

**The moment:** Marina points to an approaching boat as she and the player lay their deck boxes side by side, talking about plans beyond the tournament.

**Staging/composition:** Wide panoramic seated composition, soft silhouette, negative space at bottom. Bottom 20% clear for dialogue UI.

**Costume:** Navy summer casualwear under light linen overshirt, braid and shell pin.

**Acting:** Peaceful affectionate smile.

**Set / lighting:** Evening riverboat and long sunset reflections on water.

**Mood:** soft-romance. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/marina_sunset_cards.webp` and `rpg-assets/events/cg/season01/thumbs/marina_sunset_cards.webp`.

---

### 28. marina_beach_towel — The Stubborn Beach Towel

**Character:** marina; **Type:** special; **Gameplay unlock:** hangout, park, affection ≥ 5, day ≥ 17, period afternoon. **Fan-service intensity:** 2/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Marina Aoki, 21. Soft blue-black side braid and shell-shaped clip, seafoam/navy/sand palette, lightweight linen jacket, navy casualwear, canvas bag. River lover, reflective, gentle and increasingly brave.**

**The moment:** After a swim, Marina tries to tame an unruly beach towel that the wind keeps wrapping around her shoulders; she catches the player helping with a bashful laugh.

**Staging/composition:** Tasteful full-figure beach scene from eye level, expression central; no nudity or accidental exposure. Bottom 20% clear for dialogue UI.

**Costume:** Fully worn modest one-piece swimwear with opaque towel or cover-up, shell clip and braid.

**Acting:** Embarrassed giggle giving way to a playful smile.

**Set / lighting:** Sunny river sandbar, folded deck box safely away from water, bright reflections.

**Mood:** summer-comedy. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/marina_beach_towel.webp` and `rpg-assets/events/cg/season01/thumbs/marina_beach_towel.webp`.

---

### 29. kaede_new_arrival — The Challenger Arrives

**Character:** kaede; **Type:** profile; **Gameplay unlock:** meet, any public location, affection ≥ 0, day ≥ 41. **Fan-service intensity:** 0/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Kaede Arashi, 22. Messy silver-gray shag haircut with dark roots, acid green/charcoal/violet palette, cropped leather jacket, asymmetric tee, utility belt, combat boots and safety-pin charms. Punk bravado over cautious warmth.**

**The moment:** Kaede stands by an arcade doorway flicking a card sleeve between her fingers, smirking at the newest rival.

**Staging/composition:** Punk editorial mid-shot, strong diagonal framing. Bottom 20% clear for dialogue UI.

**Costume:** Cropped leather jacket, asymmetrical tee, utility belt, combat boots, safety-pin charms.

**Acting:** Provocative smirk with guarded curiosity.

**Set / lighting:** Arcade neon and rainy street, acid-green accents.

**Mood:** punk. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/kaede_new_arrival.webp` and `rpg-assets/events/cg/season01/thumbs/kaede_new_arrival.webp`.

---

### 30. kaede_arcade_predue — Make It Interesting

**Character:** kaede; **Type:** pre_duel; **Gameplay unlock:** before_duel, arcade, affection ≥ 1, day ≥ 41. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Kaede Arashi, 22. Messy silver-gray shag haircut with dark roots, acid green/charcoal/violet palette, cropped leather jacket, asymmetric tee, utility belt, combat boots and safety-pin charms. Punk bravado over cautious warmth.**

**The moment:** Kaede leans over a duel table and cuts the deck with one hand, daring the player to make the first move.

**Staging/composition:** Low side-angle medium shot, hands and card backs visible, dialogue-safe bottom. Bottom 20% clear for dialogue UI.

**Costume:** Cropped punk leather jacket, layered top, fingerless accessories, utility boots.

**Acting:** Crooked challenging grin.

**Set / lighting:** Pixel Palace at night, green-violet electric glow.

**Mood:** competitive. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/kaede_arcade_predue.webp` and `rpg-assets/events/cg/season01/thumbs/kaede_arcade_predue.webp`.

---

### 31. kaede_park_afterhours — No Audience Tonight

**Character:** kaede; **Type:** social; **Gameplay unlock:** hangout, park, affection ≥ 3, day ≥ 43. **Fan-service intensity:** 1/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Kaede Arashi, 22. Messy silver-gray shag haircut with dark roots, acid green/charcoal/violet palette, cropped leather jacket, asymmetric tee, utility belt, combat boots and safety-pin charms. Punk bravado over cautious warmth.**

**The moment:** Kaede sits on a riverside railing with her boots planted firmly, quietly showing the player an old ticket she keeps as a lucky charm.

**Staging/composition:** Wide environmental shot, character off center, distance and silence intentional. Bottom 20% clear for dialogue UI.

**Costume:** Asymmetrical punk layers, boots, leather jacket over shoulders.

**Acting:** Watchful expression softening into an honest small smile.

**Set / lighting:** Evening riverwalk, muted city lights and still water.

**Mood:** vulnerable. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/kaede_park_afterhours.webp` and `rpg-assets/events/cg/season01/thumbs/kaede_park_afterhours.webp`.

---

### 32. kaede_jacket_prank — The Jacket Trap

**Character:** kaede; **Type:** special; **Gameplay unlock:** hangout, arcade, affection ≥ 5, day ≥ 49, period evening. **Fan-service intensity:** 2/3.

**IMAGE GENERATION PROMPT:**

Create a cinematic original anime visual-novel CG in Neo Harbor, an adult slice-of-life Pokémon-inspired card-game campus town (do not draw official logos/card art). Depict **Kaede Arashi, 22. Messy silver-gray shag haircut with dark roots, acid green/charcoal/violet palette, cropped leather jacket, asymmetric tee, utility belt, combat boots and safety-pin charms. Punk bravado over cautious warmth.**

**The moment:** Kaede attempts to show off a dramatic spin but snags the strap of her deck bag on her jacket. She recovers with a daring smirk and accuses the player of setting a trap.

**Staging/composition:** Dynamic mid-shot at eye level, comic motion with jacket and bag, modest fully covered silhouette. Bottom 20% clear for dialogue UI.

**Costume:** Signature leather jacket, asymmetrical tee, utility belt and opaque leggings.

**Acting:** Embarrassed for an instant, then teasing triumph.

**Set / lighting:** Arcade neon, card sleeves scattered and dark reflective floor.

**Mood:** punk-comedy. Polished clean animation-style 16:9 illustration, consistent character identity and proportions, warm scene storytelling. SFW, no explicit exposure, no text overlay, no watermarks, no inappropriate viewing angle. The face and the situational action must be immediately readable.

**Output:** `rpg-assets/events/cg/season01/kaede_jacket_prank.webp` and `rpg-assets/events/cg/season01/thumbs/kaede_jacket_prank.webp`.

---

## Production checklist

1. Confirm the exact ID is missing and not already covered by the existing ZIP/art manifest.
2. Use canonical face/hair/accessories and verify adult appearance at full resolution.
3. Compare approved drafts side by side for consistent anatomy, rendering style, costume, and background palette.
4. Validate required WebP dimensions and aspect ratio; create a separate thumbnail from the approved image.
5. Keep scene IDs/filenames exact; update a separate delivery manifest, checksum each image and package the requested ZIP.
6. Smoke-test game: portrait gallery must show only unlocked CGs; pre-duel previews should never block when a file is missing.

## Handoff to gameplay
The image agent does not edit `rpg.js`, story events or TCG rules. Commit only approved image assets plus delivery manifest; any planned special-story unlock that needs new authored scenes should be coordinated with the story agent by CG ID instead of inventing spoilers.

## G5 integration (do not regenerate existing CG requests)

The eight **special** scene IDs above are now earned exclusively by completing their corresponding optional G5 situational events at the correct public location, time, and affection threshold. Generic hangouts no longer unlock these eight CGs. Their camera, wardrobe, composition, and named asset paths are **unchanged**: do not duplicate art or create another eight names. Confirm what artwork is already delivered before generating; the game continues with the portrait/text fallback when it is missing. Maintain age-appropriate adult-only SFW playful comedy, no nudity, underwear exposure, or voyeuristic angles.
