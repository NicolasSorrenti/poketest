# Shiori — canonical overworld sprite production brief

Updated: 2026-10-29 (Buenos Aires). **Reference/production brief only. No Shiori sprite has been generated or installed.**

## Priority and review status

The user explicitly requested that environment/background generation stop and that production continue with characters. Akari was the last character worked on in the design conversation, with four pose concepts supplied as conversation artifacts, not yet verified in GitHub. The next unstarted character in the roster is **Shiori**.

Do not resume backgrounds without a new request. Do not modify gameplay, the original `rpg.html`, approved Pixel Palace, Reina sprites, or the overworld manifest to register unapproved art.

## Verified identity references (GitHub main)

- **Face / hair / expression:** [Shiori primary portrait](../../../rpg-assets/characters/shiori/portraits/primary.png). Long flowing pale silver-lavender hair with soft waves, violet eyes, gold-and-dark ribbon hair ornament on the side, gold earrings. Calm, confident expression.
- **Full outfit and body proportions:** [Shiori streetwear full-body preview](../../../rpg-assets/characters/shiori/outfits/streetwear-preview.png). Dark teal/navy long asymmetrical coat with ornate gold embroidery and pale lining, cream puff-sleeved high-neck blouse, black/gold high-waist corset belt, dark short skirt, lace-edged dark thigh-high stockings, tall black lace-up heeled boots with gold buckles, fingerless black glove and jewelry.
- **Rear hairstyle / back costume cues:** [Shiori chibi back](../../../rpg-assets/characters/shiori/chibi/back.png). Long silver-lavender curls with navy-and-gold hair ribbon, ornate coat tails and tall boots. **Proportions of chibi image are NOT the full-body sprite target.**
- **Front accessory placement:** [Shiori chibi front](../../../rpg-assets/characters/shiori/chibi/front.png).
- **Style/scale only, never identity:** [Reina standing](../../../rpg-assets/characters/reina/overworld/standing.png), [Reina arcade pose](../../../rpg-assets/characters/reina/overworld/arcade-playing-character.png).
- **Background camera benchmark only:** [approved Pixel Palace](../../../rpg-assets/locations/arcade/overworld-map.webp).

These links were verified as existing files on `main` using GitHub repository reads. The canonical Shiori face and outfit were visually inspected.

## Single next deliverable

Generate **one** character-only sprite, `shiori-standing-three-quarter-candidate-v1.png`, at `art-production/overworld-candidates/shiori/`, transparent RGBA, no background or props. The sprite is a candidate pending user review, not a replacement for any existing asset.

### Ready-to-generate prompt

> Use the attached *Shiori primary portrait* and *Shiori streetwear-preview* as strict identity and outfit references. Draw Shiori, the same adult anime woman, in a single isolated **full-body** standing pose, from top of hair to the soles of both boots. Camera is slightly above her at about 15–20 degrees, looking at a natural front three-quarter view; feet planted and visible, one hand lightly holding the front of her long embroidered navy/teal coat, other arm relaxed. Her **long wavy silver-lavender hair**, **violet eyes**, ornate **navy-and-gold ribbon/hair ornament**, gold jewelry, **cream high-neck puff-sleeved blouse**, dark corset belt, short dark skirt, lace-topped dark thigh-highs, **asymmetrical navy/teal gold-embroidered long coat**, and **tall black lace-up heeled boots with gold buckles** must match the supplied references. Polished modern premium JRPG anime linework and soft painterly cel shading, realistic adult body proportions (not chibi), natural calm expression, consistent with Reina's sprite finish but do not copy Reina's face or costume. **Exactly one character, one pose.** Export transparent RGBA PNG with no colored gradient, studio glow, cast-floor shadow, text, frame, checkerboard baked into pixels, furniture or UI. Leave a little transparent padding around hair and boots.

### Validation before accepting

1. Verify PNG alpha channel: corners fully transparent, no broad pink/black halo, no opaque rectangle or fake checkerboard.
2. Verify **identity**: silver-lavender hair, violet eyes, hair ribbon, embroidered navy/teal coat, cream blouse and tall black boots. Reject red/brown bob hair, glasses, lavender cardigan or plaid skirt: these are **Akari**, not Shiori.
3. Check full-body framing: no clipped hair, hands, coat tails, stockings or shoe soles.
4. Check 15–20° elevated three-quarter view; recognizable at ~155 logical pixels height and foot anchor under soles.
5. Save under distinct candidate path. Register in `overworld/manifest.js` only after visual approval and an in-game scale/foot-placement check.

## Generation limitation in this run

Two image-generation attempts produced **Akari** instead of Shiori (red-brown bob, glasses, lavender cardigan, plaid skirt), despite the repository's verified Shiori references. Both outputs were rejected as incorrect identity. **No Shiori PNG, ZIP, GitHub binary or manifest update was created.** This brief is the deliverable so the next run can use Shiori's actual canonical images as direct visual inputs rather than the previous character's conversational context.
