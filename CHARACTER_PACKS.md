# Neo Harbor — Character Packs v1

A character is **data, not application code**. Author or generate four files under `characters/<character-id>/`. One stable `id` is used for the schedule, duels, save keys, portraits and story IDs.

## Quick start

Clone the repository and inspect the **live migrated example** at [characters/sol](characters/sol). Sol's previous hand-written module is now only a compatibility adapter. The canonical character information and seven authored scenes are in JSON.

To install a new AI-authored character (folder or ZIP):

```bash
npm run characters:import -- ./my-character
# or, where the system has the unzip executable:
npm run characters:import -- ./my-character.zip
npm run characters:validate
npm run characters:build
npm run test:rpg
```

To edit an installed character, modify its JSON and run `npm run characters:build`. Commit both the JSON folder **and** regenerated `rpg_character_packs.generated.js`; no modifications to `rpg.js`, `rpg_story.js`, `rpg_schedules.js` or `rpg.html` are needed. `npm start` rebuilds the registry before starting the server, and `npm run test:rpg` checks that the checked-in registry matches its sources.

On Windows, if the `unzip` executable is unavailable, extract the ZIP to a folder first and import that folder.

## Required folder structure

```text
characters/
  sol/                        # complete live reference implementation
    character.json            # biography, voice, portrait-facing data, valid deck
    stories.json              # authored scene dialogue and choice consequences
    art_manifest.json         # required art handoff filenames and prompts
    bible.md                  # deep writing / character bible
    assets/                   # optional — PNG/JPG/WebP, copied to rpg-assets/characters/<id>/
  schema/
    character.schema.json
    stories.schema.json
    art_manifest.schema.json
```

All three schemas use JSON Schema 2020-12. The importer's **runtime validator** additionally checks playable deck IDs against the Classic TCG service, date windows, scene ID uniqueness, prerequisite chronology, speaker lines, safe image paths and adult ages. There are no new npm dependencies.

## Character design contract

- Unique lowercase `id` (letters, digits and underscores, starting with a letter); never rename it once saves exist.
- Everyone is an adult (18+). `role`: `romance`, `friendship` or `supporting`. The game controls actual relationship commitments through existing story choice kinds; choosing a role alone does not create a route.
- `deck` must be an **existing Classic deck option** from `/api/classic/decks` or `classic_local_service.deckOptions()`; inventing an ID will fail validation. Bespoke decks are a separate engine integration task.
- `schedule`: exactly seven arrays of three location IDs, Monday–Sunday with morning/afternoon/evening. Current locations: `home`, `shop`, `arcade`, `park`, `cafe`, `center`, `library`. `arrivalDay` 1–90.
- `dialogue`: intro, repeat, at least two casual talk lines, at least two hangouts, flirt, victory and defeat. Give them a recognizable voice and a nontrivial conflict; don't repeat variations of the same sentence.
- `appearance`: distinctive silhouette, palette, hair, expressions, optional eyes/details/outfits and actionable SFW `renderNotes`. Preserve Neo Harbor's colorful anime/JRPG character direction.
- `stories.json`: `events` each have a unique stable `id`, main `npc` equal to the character ID, title, `start`/`end` within the 90 days, `place`, `slot` 0–2, `minBond`, `prerequisite` (null or earlier **same-pack** scene), `lines` with `speaker` IDs and `text`, and two or more `choices`. Every choice contains `label`, `reply`, `kind`, `flag`, and relationship `delta`. Use `openingByFlag` to acknowledge prior flags in future chapters and `participants` for crossover guests.
- Available choice kinds include `support`, `honest`, `flirt`, `friend` and `commit`. The built-in story engine requires sufficient trust and affection, and checks existing commitments, before a `commit` choice can succeed.
- Crossover participants must refer to existing NPC IDs; check their story windows and schedules. The runtime validates syntax and chronology, **not** dialogue quality or story logic.

## Images and art handoff

The main RPG portrait resolves `cast[id].portrait`, falling back to `/rpg-assets/<id>.png` when no image is specified. For a new pack, set `art_manifest.json.portrait` to `/rpg-assets/characters/<id>/neutral.png` and include `assets/neutral.png`. Build copies pack-local images into that published path.

The manifest may also list `expressions` and `eventImages` with prompts and the associated authored `sceneId`. These are **art production specifications**; the generic dialogue window currently uses the main portrait, and the CG gallery / match-reaction overlays have their own content registries. Producing the images does **not automatically hook every expression or CG into a scene**. That richer binding is a separate feature.

Missing art should never prevent a playable scene: the RPG uses initials when an image cannot load. Image names should be stable, files must be PNG/JPEG/WebP, and assets must remain SFW.

## How the runtime works

1. `scripts/rpg-character-packs.js` scans `characters/*/character.json`, validates the four files and writes a deterministic `rpg_character_packs.generated.js`.
2. `rpg.html` loads the generated registry **before** the Sol adapter and story modules.
3. `rpg_narrative_pack.js` imports every registry character except Sol, whose backward-compatible adapter remains available as `NeoRpgSolCharacter`.
4. Existing `rpg_story.js` and `rpg_schedules.js` consume the expanded cast/events/schedules automatically. The duel bridge uses the valid deck ID. No per-character changes to the RPG engine.
5. New content is validated in `tests/rpg_character_packs.test.js` and in the existing RPG regression suite.

Sol's stable `sol_route_1` ... `sol_route_5` identifiers have not changed. **Do not rewrite existing scene IDs**: saves use these identifiers, and renaming them can orphan progress.

## Handoff prompt for a character-creation agent

> You are the adult-character narrative designer for Neo Harbor, a 90-day Pokémon TCG JRPG/social visual novel. Create one memorable adult woman with a distinct believable personality, flawed inner life, own goals and compelling Pokémon TCG deck. Research the existing cast to avoid duplicates; write credible multi-speaker dialogue with subtext, differing choices, continuity callbacks, seven-day schedule, a richly described SFW anime visual bible, and art-generation prompts. Deliver exactly the v1 `characters/<id>/` folder: `character.json`, `stories.json`, `art_manifest.json`, `bible.md` and optionally `assets/` artwork. Follow the schema in `characters/schema` and reference `characters/sol`; use only valid Classic deck IDs and known locations, and preserve story/save compatibility. Don't edit the engine or existing characters. Verify with `npm run characters:validate`, `npm run characters:build`, `npm run test:rpg`. Package the folder as a ZIP if requested. Favor specific, consequential dialogue and character development over exposition and generic flirt lines.

## Known v1 limits

- Packs are installed in the repository, then built and deployed; **not** uploaded by arbitrary web players at runtime. This keeps the hosted game safe and deterministic.
- The importer refuses ID collisions, requires valid assets and never overwrites an existing character. If the source is a ZIP, extract its contents into exactly one pack folder or at archive root.
- A pack creates story chapters and standard hangouts but does not yet create arbitrary new gameplay systems, locations, tournaments, battle abilities or scene-specific CG triggers. These require engine features or another content pipeline.


## Optional mandatory relationship scenes

Character authors may add a fifth JSON file, \`mandatory_events.json\`. Omitting it preserves all existing pack behavior. Import/build copies and validates it automatically; no RPG engine modification is needed.

\`\`\`json
{
  "schemaVersion": 1,
  "characterId": "sol",
  "events": [{
    "id": "sol_asks_for_company",
    "kind": "bond",
    "priority": 60,
    "earliestDay": 44,
    "trigger": { "all": [
      { "storyDone": "sol_route_2" },
      { "relationship": { "npc": "sol", "metric": "trust", "gte": 2 } }
    ] },
    "delivery": "remote_or_present",
    "timeCost": 0,
    "expiry": "never",
    "lines": [{ "speaker": "sol", "text": "Can we just spend an afternoon talking?" }],
    "choices": [
      { "label": "I'd like that.", "reply": "Me too.", "flag": "sol_company_yes" },
      { "label": "Maybe another day.", "reply": "Of course.", "flag": "sol_company_no" }
    ]
  }]
}
\`\`\`

The importer supplies \`characterId\` to each event, checks names against existing optional story IDs, validates character and story references and rejects circular \`eventSeen\` dependencies. Only declarative predicates are accepted: \`all\`, \`any\`, \`not\`, \`dayGte\`, \`dayLte\`, \`storyDone\`, \`flag\`, \`relationship\`, \`duelCountGte\`, \`tournamentState\`, \`eventSeen\`. Relationship metrics are \`affection\`, \`trust\`, \`respect\`, and \`attraction\`. A mandatory scene must cost zero time and must not set commitment or relationship rewards. Optional route chapters remain unchanged.

## Outfit variants (optional)

Characters can define **renderable** outfits in `art_manifest.json`. These are independent of the `appearance.outfits` array, which is descriptive text only. Old characters without an art outfit map work unchanged.

Example for Laca (paths are placeholders until the art is created):

```json
{
  "schemaVersion": 1,
  "characterId": "laca",
  "portrait": "/rpg-assets/characters/laca/neutral.webp",
  "outfits": {
    "default": "casual",
    "variants": {
      "casual": {
        "portrait": "/rpg-assets/characters/laca/outfits/casual/neutral.webp",
        "expressions": { "happy": "/rpg-assets/characters/laca/outfits/casual/happy.webp" }
      },
      "lifeguard": {
        "portrait": "/rpg-assets/characters/laca/outfits/lifeguard/neutral.webp",
        "expressions": { "happy": "/rpg-assets/characters/laca/outfits/lifeguard/happy.webp" }
      }
    },
    "rules": [
      { "outfit": "lifeguard", "locations": ["park"], "slots": [0, 1] }
    ],
    "sceneOverrides": { "laca_rescue_scene": "lifeguard" }
  }
}
```

**Selection order:** scene-specific override > first matching rule > default outfit. Match by `locations` (existing RPG place IDs), `slots` (morning 0, afternoon 1, evening 2), optional `weekdays` (0–6, counted from campaign Day 1), and/or inclusive `startDay`/`endDay`. Scene overrides apply when that event is actively displayed, not merely scheduled. Rules are evaluated in written order.

Expression images may be specific to each outfit. When artwork is missing, the renderer tries the selected outfit's neutral portrait, the legacy expression, and finally the main canonical portrait; characters without variants keep the old behavior. Discreet Mode continues to use its existing safe character imagery.

For pack assets, place images under `characters/laca/assets/outfits/casual/` and `characters/laca/assets/outfits/lifeguard/`. The builder copies them to `rpg-assets/characters/laca/outfits/`. Do not import a manifest before the referenced files exist.

Run `node test_rpg_outfits.js` and `npm run test:rpg` to check the resolver and RPG integration.

## Optional illustrated encounters

An event in `stories.json` can declare `"encounterType": "slice"` and `"trigger": "entry"` (or `"talk"`). Keep its `prerequisite` null, and map its ID to an approved asset in `art_manifest.json` as usual. The pack builder preserves this data, but the narrative pack excludes it from the main story calendar and bond chapter rewards.

The ambient director selects these encounters only after the character has been introduced and is present at the event's location and period. They share the existing once-per-day limit, cost no time or focus, and cannot interrupt an active event. Unseen pack encounters protect matching stops in the character's authored weekly routine from crowd balancing; appointments and main stories take precedence. Entry encounters also support discovery through Talk.

Full `lines`, player choices, replies and relationship deltas are supported. The CG is previewed when the encounter starts; finishing the chosen reply commits the relationship change and unlocks the gallery memory once. Saves preserve the current line/choice and completed unlocks. `openingByFlag` adds a callback only when the matching answer's source encounter or main story was completed; it creates no prerequisite and the base conversation always remains available.

Run `node --test tests/rpg_barb_optional_cgs.test.js` for campaign, callback, asset and persistence coverage. With Playwright and Chromium installed, run `node tests/rpg_barb_browser_smoke.js` for all eleven encounters at desktop and mobile sizes. Set `RPG_BROWSER_EXECUTABLE` only when using an existing Chromium executable.
