# Neo Harbor RPG — G2 Character-Specific Shared Activities

**Status:** Gameplay implementation, 2026-10-18. **Ownership:** gameplay systems; narrative agent continues editing character stories and authored routes; image agent continues producing CG assets.

## What the player can now do

On meeting any available NPC, select **Choose a shared activity · ⏳ 1 period**. The screen displays three location-specific invitations with visible Focus/Credit costs and an affinity clue:
- **♥ Favorite:** matches what this character enjoys. Builds a stronger bond.
- **● Familiar:** comfortable, smaller friendship gains.
- **◇ Something new:** a worthwhile new experience even when it isn't their usual choice.

After confirming an available activity, the game:
1. Re-checks the real NPC presence, location, game period, credit/focus budget, current scene locks and whether the player has spent time with them already today.
2. Spends exactly one RPG period. It does **not** fabricate a TCG duel or change the historical card reducer.
3. Applies personality-weighted **affection / trust / respect** and small Insight for especially strong strategic outings; no automatic romance / attraction or partner choice.
4. Gives a brief character-specific reaction and marks a shared outing in the existing `hungOut` per-day guard.
5. Records the optional social daily intention and any existing, eligible **hangout CG** without inventing new art or granting locked images.

The original **Spend time together** option remains for compatibility and uses the **same daily guard**. A second activity on the same day for that NPC gives no extra resources or affection. Choices and previews consume no resources until confirmed.

## 18 activities across six already playable venues

| Venue | Three shared outings |
| --- | --- |
| Card shop | Build a deck together; welcome a newcomer; customize sleeves |
| Arcade | High score competition; chaotic co-op; make a playlist |
| Riverside Park | River walk; waterfront exploration; sketch the view |
| Café | Favorite card stories; quiet snack break; playful challenge |
| Community Center | Opening-hand practice; coach a beginner; tournament tactics |
| Town Library | Research combos; swap book passages; old card archives |

Each option has a Focus cost (5–15), and some have a Credits cost (5–7). No new explorable map location is introduced.

### Core eight personality metadata

| Character | Favorite styles | Familiar styles |
| --- | --- | --- |
| Hana | community, creative | quiet, collecting |
| Reina | strategy, competitive | quiet, adventure |
| Shiori | quiet, collecting | strategy, creative |
| Yuna | playful, creative | competitive, adventure |
| Akari | strategy, collecting | competitive, quiet |
| Camila | collecting, creative | quiet, community |
| Marina | quiet, adventure | community, creative |
| Kaede | competitive, adventure | playful, strategy |

The listed interests are **gameplay interpretations** of each canonical personality, not replacements for authored character routes.

## Balancing and anti-grind

Favorite affinity grants **+2 affection**, **+1 trust** and, in rival-style activities, **+2 respect** and **+1 Insight**. Familiar affinity grants **+1 affection**, **+1 trust** and +1 respect for rival-style activities. An unfamiliar outing grants **+1 affection** and, if rival-style, **+1 respect**, with no punishment for trying something different.

Doing another activity with the **same tag** with the **same character within 3 days** reduces the favorite bonus to +1 affection, +0 trust, +1 respect for strategic outings, and no Insight. Switching tags prevents that penalty. One activity or quick hangout per character per day. Bond/Focus/Credit/Insight values are capped and failures make no state changes.

Time still matters: outings compete with tournaments, personal stories and appointments rather than generating free affinity. Romance remains explicit in authored route choices; the system must not set `partner`, grant attraction, or simulate relationship consent.

## Separate-agent extension contract

In future NPCs from `rpg_narrative_pack.js` or `rpg_side_quests.js`, the narrative agent may provide optional additive `socialProfile`:
```js
socialProfile: {
  favorites: ['adventure','playful'],
  neutral: ['creative','community'],
  voice: [
    'A unique short reaction when they love the outing.',
    'A reaction to a familiar / repeatedly chosen outing.',
    'A response to an unfamiliar outing without humiliation.'
  ]
}
```
Supported tags: `strategy`, `community`, `creative`, `competitive`, `playful`, `quiet`, `adventure`, `collection`. Unknown guest characters still receive a respectful generic profile. Avoid revealing plot secrets or writing specific scenes into this metadata; true quests and relationship arcs remain in the narrative agent's files.

**Art agent:** No new binary art is required for this milestone. Existing CG gallery hangout triggers continue to work; a later pass can give unique activity-id-specific CGs by extending `rpg_cg_gallery.js` and providing separate assets at the established paths. Do **not** mark any images as generated without verified files.

## Technical details and regression

- New standalone `rpg_social_activities.js` CommonJS + browser UMD exposes `activities`, `defaults`, `profile`, `options`, `complete`, `hydrate`, `affinity`, `validate`.
- Minimal additions to `rpg.js` in NPC conversation `options` and `act` dispatcher. The existing save key `neoHarborRpgV1` is preserved; new optional `socialHistory` is hydrated from older saves.
- Day/period handling, appointment expiration and NG+ remain in existing modules. RPG state is saved before advancing the period, so an already committed activity cannot be repeated on reload.
- `tests/rpg_social_activities.test.js` covers 15 cases for availability, personalities, costs, guard reuse, safe save migration and diminishing repetition; `tests/rpg_world_ui.test.js` covers real controller choices and saves.
- Test with `npm run test:rpg` and GitHub's RPG Chromium smoke workflow. Do not claim this is a fully authored relationship system: it is the reusable playable foundation for the next social milestone.

## G3 follow-on

Tie **scheduled appointments** to a chosen activity and let the player propose a date or friendly outing at a venue that the NPC can attend, with a clearly displayed cost and explicit tone selection. The narrative agent can attach authored scenes for milestone dates while these shared interactions continue as optional repeatable content. Ensure a missed booking cannot be redeemed by a free dialog click.
