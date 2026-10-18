# Neo Harbor — Gameplay / Social / CG Gallery Implementation Contract

Owner: RPG gameplay integration. Version: `2026-10-18 season01`. Scope: original **eight established adult heroines** (Hana, Reina, Shiori, Yuna, Akari, Camila, Marina, Kaede), not newly drafted narrative-agent supporting cast.

## Delivered in this milestone

The game has a new **CG Gallery** button and filterable 32-card album (character and category). A card stays locked until the player earns its actual in-game trigger, then the game persistently remembers its day, period and trigger. Unlocked cards show their assigned art when the exact file is installed; missing binaries show a clear production placeholder. No broken-image icons or guessed/reused art. An optional full-screen CG moment is displayed only when its matching image **successfully loads**. Missing images never block travel, dialogue or an authoritative match.

Trigger wiring:
- `selectPerson` → first *actual* encounter: one profile memory.
- `startDuel` → after legal initiation of a real Classic CPU duel: one pre-duel location CG, when character/affection/day requirements match.
- `hang` → after an actual time-consuming social action with that character: social and special CGs when their requirements match.
- `finishStory`, `attend` and the real-duel settlement callback expose reserved `story_milestone`, `appointment`, `after_duel` trigger paths for a **future** authored CG pack. No unimplemented scenes are promised by these hooks.

Each earned CG unlocks at most once. Duplicate duel callbacks cannot create duplicate rewards or gallery entries. Gallery progress survives day changes, reloads and New Game+, while a **new campaign** starts with an empty album. Player relationship stats and legacy `neoHarborRpgV1` saves are preserved.

Note: CG unlocking is a **local-browser campaign record**, not server-enforced anti-cheat. Bundled JavaScript metadata may be inspectable by technically skilled players; player-facing UI hides locked titles/assets to avoid casual spoilers. Further spoiler-safe server entitlement would require a backend entitlement service.

## Current playable map vs future locations

Existing location keys: `home`, `shop`, `arcade`, `park`, `cafe`, `center`, `library`. **There is no separate `beach` route today.** Marina's swimsuit/beach-towel event is authored as a **riverside sandbar scene inside `park`**, which actually exists, has scheduled NPC presence and can be reached. Do not create a fictional map key in an asset manifest. If the story agent later adds a beach venue, decide whether to migrate these CGs after playability testing.

Kaede enters town on **Day 41**; her CG minimum days respect that arrival.

## Data schema / contracts

Source of truth: `rpg_cg_gallery.js`. Machine-readable parallel export `docs/cg-art-queue.json`, art prompts `docs/CG_ART_AGENT_HANDOFF.md`.

Record keys: `id`, `character`, `category`, `trigger`, `place` or null, `slot` or null (0 morning/1 afternoon/2 evening), `minAffection`, `startDay`, `title`, `hint`, `scene`, `composition`, `outfit`, `expression`, `environment`, `mood`, `fanservice`, `path`, `thumb`, `dialogueSafe`.

Exports:
- `CG.catalog` array of 32 independent art briefs, exactly four per heroine.
- `CG.validate()` returns errors for duplicate IDs, invalid metadata and asset path format.
- `CG.hydrate(state)` repairs missing/invalid optional save fields.
- `CG.record(state,trigger,npc)` unlocks eligible records **only when the game controller has actually observed the action**.
- `CG.gallery(state,{character,category})` returns masked locked records and safe unlocked paths.
- `CG.unlocked(state,id)`, `CG.markViewed(state,id)` enforce album visibility.

Save fields:
```json
{
  "cgUnlocked": {
    "hana_first_meeting": {"day": 5, "slot": 0, "trigger": "meet"}
  },
  "cgViewed": {"hana_first_meeting": true}
}
```

The records are additive to `neoHarborRpgV1`; no save-version reset. New Game+ copies only the CG album and campaign history; all other RPG progression follows the existing replay rules.

Asset contract:
- Full: `rpg-assets/events/cg/season01/<id>.webp`, **1920×1080**
- Thumbnail: `rpg-assets/events/cg/season01/thumbs/<id>.webp`, **640×360**
- Image files are external art-agent deliverables and **are not provided by the gameplay PR**.
- Existing portrait sprites and art ZIPs must not be overwritten.
- Gallery never requests a locked CG image.
- On missing/unavailable file, unlocked tile falls back to a plain image-less memory and optional in-game moment simply does not appear.

## Gameplay integration roadmap

### G1 — Daily contextual planner (next)
**Player question:** "What meaningful things can I do before the day ends?"

Create `rpg_daily_planner.js` with a **read-only recommendation selector** that considers: present NPCs, booked future meet-ups and deadlines, known tournament windows, scheduled activities, money/focus, available side quests, and selected daily intention. No hidden plot details. UI should show max 3 relevant suggestions and an optional click-to-travel **only when real travel is already free**. Never auto-skip a period. Acceptance: 90-day itinerary with no recommendations pointing at missing NPCs or past events; high-priority booked appointment is visible before missing it.

### G2 — Character-specific social mechanics
Use new optional metadata supplied by narrative agent (not controller hardcoded dialogue):
```json
{"character":"hana","preferredLocations":["shop","park"],"activities":["volunteer","card_sorting"],"affinityTags":["kind","community"]}
```
Implement 2–3 shared activity archetypes per location with character-specific reactions, **not** a mechanically unique minigame per heroine. Consent and comfort matter for teasing events. Do not let generic repeated free flirt lines replace route achievements or allow affection farming. Acceptance: each of eight women has at least one preferred and one neutral activity; failed plans matter once; outcomes remain balanced for non-romantic friendships.

### G3 — Date / partner experiences
Combine existing NPC appointments with opt-in "date-like" activity proposals; real schedule reservations, explicit one-period cost, optional outfit/venue-specific CG conditions, and meaningful bond changes. Do not force romance; friendship rewards remain competitive. Opponent duels retain authoritative Classic results. Acceptance: complete a full social weekend, save/reload each period, attend/skip appointments once, no duplicated CG or trust rewards.

### G4 — Pre-duel events and dueling stakes
When a real CG file is installed, present optional **preview-before-first-action** scene and continue into the existing match, with skip/replay controls. Current implementation can display an asynchronous full-screen memory after starting the embedded duel; a subsequent dedicated pre-match gating phase should guarantee animation ordering without breaking session restoration. Preserve same-origin bridge and tournament settlement idempotency. Add earned match context dialog and usable deck selection / validity checks. Acceptance: qualifying CG visible before player acts, and browser reload during preview or match resumes the same session.

### G5 — Specials, seasons and gallery completion
Expand optional **SFW adult-only** situation-based comedy events (gusts, costume mix-ups, dropped cards, after-swim moments), tied to real public locations, outfits and established character reactions. No voyeuristic exposure, no coerced intimacy, no undergarment close-ups. Use a deterministic persisted one-time roll *only if* adding randomization later; replaying saves may not reroll for infinite rewards. Support event groups and visual variations under one gallery entry; keep scenes spoiler-safe.

### G6 — Campaign closure and QA
100% of the eight-character CG album should be **obtainable across multiple 90-day runs**, without requiring one impossible simultaneous schedule. Archive gallery across NG+; time-limited misses make replay worthwhile, not essential to progress. Verify mobile layout and accessibility (keyboard close, dialog focus, alt text). Run `npm run test:rpg`, full Node and browser smoke, and an actual completed TCG duel on deployed host.

## Cross-agent boundaries

- **Character/story agent:** canonical biographies, dialogue, route flags, route scene IDs and optional CG requests. May ask gameplay to add triggers through CG manifest IDs. May not silently replace the game engine contract.
- **Image agent:** new **separate image files** matching explicit CG IDs, face continuity, SFW and output specs. No new script, AI-labeled spoiler plot, or unverified "generated" claims.
- **Gameplay agent:** CG manifest/triggers, gallery, save and UI, reachability checks, calendar systems. Does not author personal route lore or generate images.
- **TCG/CPU agents:** Classic rules, decks, AI and multiplayer. RPG does not duplicate reducer logic.

## Verification in this milestone
- 11 pure gallery tests plus controller gallery/duel/hangout tests.
- Existing RPG controller and save fixtures load `NeoRpgCGGallery`.
- HTTP allowlist `/rpg_cg_gallery.js` is explicit; no wildcard public JS access.
- No new locations invented; scheduled CG triggers are reachable by date, period and location. Binary asset production remains the image agent's task.
