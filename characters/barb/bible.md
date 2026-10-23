# Barb — Neo Campus / Neo Harbor Character Bible

> **Canon lock:** Barb; **21 years old**; **161 cm (5 ft 3.4 in)**; **adult**; optional romance NPC. A recurring character across the 90-day campaign. **Character ID `barb` must never be renamed.**

## Elevator pitch

A copper-haired, alt-fashion accessory maker who can decorate a deck box in an hour but struggles to insist that her own name stay on it. Barb turns craft supplies and cheerful trash talk into unlikely friendships. She is observant and lively rather than purely combative. Her route asks whether creativity can be both commercially useful and unmistakably her own; it gives the player the option to offer support without becoming the person who makes all her choices.

## Physical continuity (DO NOT DRIFT)

- **Height:** exactly **161 cm**. Petite/medium-short compared with the original 165 cm guide. Torso and legs are a little compact, **not** dramatically stunted. Body has believable adult anatomy and movement. In a full-body lineup she reads clearly shorter than 165 cm peers, but not doll/chibi proportions.
- **Build:** naturally curvy, defined waist, rounded hips, softly substantial thighs, **moderately fuller bust** compared with the early reference; tops fit snugly without an exaggerated anatomical or posed effect. Adult proportions are consistent in every outfit.
- **Hair:** distinctive long, smooth copper-auburn, roughly waist length with darker roots; soft front strands and subtle side part. Copper is identity-defining; do not recolor to red-pink, blonde, white, or purple.
- **Eyes / face:** warm green-hazel eyes, strong dark brows, prominent eyelashes and a gently pointed face with an easy mischievous smile. Light/fair peach complexion, warm blush, rosy lips and dark winged liner. No changing eye shape or facial identity between expressions.
- **Tattoo:** black/grey **floral roses along LEFT upper arm/shoulder**, visible when sleeveless, never mirrored to right side. Additional tiny ink details may appear only when consistent with reference.
- **Piercings:** small silver horseshoe septum plus small hoops/studs in ears. Nose placement and jewelry shape are consistent.
- **Signature accessories:** black leather-look baker-boy cap with metallic buckle/rings, delicate butterfly necklace (blue accent), optional clear oversized glasses, black chain-strap shoulder bag. Accessories can vary by scene, anatomy cannot.
- **Clothes:** close-fitting lace-up black crop top with sensible but flattering neckline; short black pleated faux-leather skirt; black thigh-high stockings with big decorative bows; chunky black lace-up ankle boots. Alternate brown/pink plaid mini with cropped cardigan. Functional shorts/hoodie while working. SFW throughout.
- **Color anchors:** copper #AE4636, rose #D98C81, peach #F1B69E, green-hazel #77734E, black #242024, mauve #9B7288, punk-pink #F367A2.

## Portrait and animation rules

Use the provided `assets/neutral.webp` as her **production baseline portrait**; approved design sheet is `assets/reference/barb_character_bible.webp` for comparison only. The portrait is a standalone illustration/photo-styled image with its own background, **not alpha-transparent**; if an overlay sprite is needed, produce a distinct transparent-background image, never rename this asset as one. The reference sheet is a collage; NEVER feed it directly to scene CG slots.

Expression roster for future independent portrait generation: `neutral`, `smile`, `playful`, `wry`, `surprised`, `flustered`, `soft`, `determined`. Keep face geometry, tattoo side, bust, glasses, cap, jewelry and hairline stable. Several captions from the reference sheet are not in-game dialogue and should not be baked onto sprites.

A real CG is a **single cinematic scene**, 16:9 when possible, bottom 20% low-detail for the dialogue UI; no grids, character model sheets, text callouts, watermarks, title overlays or excessive duplicate figures. Use `art_manifest.json` for scene-specific art prompts. **The event CG images named there are requests, not included finished assets** and the current Character Pack pipeline does not auto-bind them to story scenes.

## Place in the cast

Barb is 21 and runs a small one-woman side venture customizing TCG storage accessories—display boxes, deck cases, and illustrated playmats. She knows to leave official game-card backs and sanctioned sleeves alone. Her table appears around the shop, arcade, café and community center. She is different from Jinx: Jinx attacks first to protect herself; Barb jokes, asks questions and creates things, only becoming sharp when people dismiss her authorship. She is different from Sol: organized spontaneity is not Barb's issue—her conflict is ownership and advocacy.

**Core wants:** to be taken seriously as a maker; a modest, sustainable business; a personal life where she does not have to perform confidence all the time.  **Core fear:** that the work will be praised while her name is erased. **Blind spot:** expecting a client or friend to guess her boundaries without hearing them. **Strengths:** attention to detail, improvisation, steady hands, generosity, absurdly good taste. **Flaws:** overscheduling under stress, weaponizing humor to avoid difficult asks, assuming compromise means disappearance. **Arc:** from nervous one-off samples to a small licensed, co-branded run she can own openly, without the player solving everything for her.

## Voice direction

Speaks in quick direct sentences, half-joking challenges and specific tactile details: creased corners, crooked labels, colors and card sleeves. Avoid generic 'baby', 'master', 'darling' clichés. Flirting is playful, two-way, PG-13 and consensual. When anxious, she stops joking mid-sentence, corrects herself, and occasionally admits fear openly. When winning at Pokémon TCG, she teases but congratulates clever plays. When losing, she asks pointed questions about the deciding turn and enjoys learning.

**Gesture set:** adjust cap brim; nudge spectacles up with one fingertip; twist the pendant; use a pen to point while talking; spin a stray piece of paper; pause with lips pursed when she wants to be brave. Avoid repetitive tongue-out posing: reserve it for rare playful beats.

## TCG / game integration

**Legal starting deck ID**: `power_reserve` (a verified ID in `classic_local_service.js`, from Base Set 2). Playstyle: careful resource usage that looks cozy and approachable until the opponent miscalculates. The current pack schema cannot register a custom deck or add new RPG mechanics. Uses the game’s standard duel bridge and default NPC upgrade logic unless a later balancing milestone adds a tuned Barb profile. **Do not invent a new deck ID.**

**Availability:** joins on Day 6; seven-day repeating morning/afternoon/evening schedule in `character.json`. The RPG already supports talk, flirt, standard hangout and duel, and unlocks sequential story chapters with prerequisites. **Route beats are intentionally kept out of user-facing previews to avoid spoilers.**

**Relationship principles:** trust when she can speak for herself; affection from staying present; respect when player acknowledges her expertise; attraction only from mutual, appropriate romantic cues. No jealousy trap, no automatic romance and no forced commitment. Later commitment branch must still pass the game’s built-in trust and relationship rules.

**Autonomous NPC cues / chime-in ideas:** notices a card's artwork; compliments a smart defensive line; laughs at a terrible card pun; reacts with genuine delight when a player uses an unexpected older card; during her turn she narrates her own choices, not the player's. Do not invent hardcoded cut-ins: hook into the shared reaction system if a future update implements pack-specific chimes.

## 90-day narrative structure (spoilers for writers)

1. `barb_route_1`, Days 6–20, Shop afternoon: sample display, trust in her own signature.
2. `barb_route_2`, Days 23–38, Arcade evening: a client offer that could bury her name.
3. `barb_route_3`, Days 41–56, Café evening: a difficult email and a chance to act without being rescued.
4. `barb_route_4`, Days 59–73, Center afternoon: a small public showcase, ownership, and confidence.
5. `barb_route_5`, Days 76–90, Park afternoon: a quiet day and optional emotionally mature romance.

A zero-time mandatory follow-up can fire after `barb_route_1` and trust >=2; it asks for a small acknowledgment, not a commitment. Choice flags in later chapters refer back to prior approaches; maintain these strings for save compatibility.

## Delivery and limitations

Four primary Character Pack files plus `mandatory_events.json` are present. The included primary portrait and design reference can ship with the pack; do not present the reference as a scene CG. The five named CGs are specified but **not yet illustrated**. Extra facial expression portraits, cut-ins, chibis and bespoke gifted playmats are art tasks and/or engine integration tasks, not implied by the manifest. A new NPC must pass source schema validation, the JavaScript pack validator, generated registry rebuild, RPG tests and a real playthrough before calling her fully integrated.
