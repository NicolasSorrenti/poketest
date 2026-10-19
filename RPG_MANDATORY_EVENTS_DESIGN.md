# Neo Harbor — Mandatory & Relationship-Triggered Events (Design v1)

**Status:** Narrative/engineering proposal, **not yet installed at runtime**. Written after inspecting the current main branch (`rpg.js`, `rpg_story.js`, `rpg_conversations.js`, `rpg_situations.js`, `rpg_daily_planner.js`, `rpg_bond_chapters.js`, current character packs). This does not change the optional existing story chapters, change combat rules, or modify save data.

## Why this feature exists

The 90-day campaign currently plays like a sandbox of discoverable scenes. `STORY.available(state, place)` demands *the right place, day, period, bond and prerequisite*. Optional authored chapters may expire if players do not visit the correct place on time. `rpg_situations.js` includes threshold and probability based encounters, but these are still optional and can fail their chance check. A player can develop meaningful relationships yet miss pivotal story developments.

**Design goal:** The *world* should occasionally approach the protagonist, and an NPC who has developed a relationship with him should sometimes initiate meaningful moments. The player should **not** be required to grind every NPC or forced into romance.

## Three kinds of narrative events

| Kind | Eligibility | Delivery | Required? |
| --- | --- | --- | --- |
| **Season beat** | Day reached; accessible even if the player avoided social content | Automatic cinematic/dialogue the next safe moment (after a time action, before the next free action); can reference tournament outcomes | Yes, as a world development |
| **Bond beat** | The character has a meaningful bond **and** specific narrative history (or mutual activity), plus a day floor | NPC initiates conversation: appears if nearby, otherwise sends a message / meets later | Yes *once earned*, but player controls the response |
| **Personal chapter / unexpected situation** | Existing story/schedule/relationship or seeded chance | Keep the current opt-in scene and journal flows | No, remains optional |

The key distinction is **a compulsory world event is not a compulsory relationship choice**. An earned bond scene cannot automatically set `partner`, romance, or affection. It may include explicitly neutral, friendship and boundary-setting responses.

### Season beats: outline for the 90 days

- **Days 1–2 — Welcome and stakes:** Formal start of Neo Harbor's circuit, introducing the season clock and why collecting/training matters. Baseline story for every player.
- **Day 14 — The community is bigger than the bracket:** A town-wide issue or gathering puts familiar/unknown faces into context; choose how to respond, not who to date. Avoid moving an existing Day 14 exhibition.
- **Day 29 — Cup eve:** Locals prepare the Neighborhood Cup. React to the player's deck and friendships, but do **not** auto-enter/complete the Day 30 tournament.
- **Day 59 — Qualifier eve:** A tournament logistics or community decision creates stakes before the Day 60 qualifier, regardless of earlier victories.
- **Days 87–88 — Championship preparations:** Show the town reacting to standings; don't spoil or replace the Day 88/90 exhibition activities.
- **At the end of Day 90 — Season closure:** Before the final epilogue/New Game+, acknowledge the actual tournament record, selected partner/friendships and major choices. Do not assume victory.

Start with **4–6 meaningful season scenes total**, not a cutscene every morning. Day numbers are story anchors (earliest trigger), not deadlines. An end-of-day fast-forward must not erase an overdue scene.

### Earned bond beats for the five newly added heroines plus Sol

All six are adult romance-capable characters in the current `characters/\<id\>/` packs. These should be **character-initiated** rather than another list of "Talk" rewards. Suggested design triggers below deliberately combine an authored chapter with established trust/relationship, not only generic daily affection.

| Character | Trigger idea | Scene initiated by her | Real character progression |
| --- | --- | --- | --- |
| **Rina Hoshino** | After `rina_route_2` + meaningful trust, day >= 30 | Sends the player a message to sneak in a short TCG practice after an exhausting rehearsal | The player can respectfully decline; she takes seriously the idea that time spent playing is hers, not just stolen from her idol schedule |
| **Elena Crowe** | After `elena_route_2` + trust, day >= 36 | Breaks her own calendar rule to ask for help with a genuinely unexpected problem | She learns to request support without pretending she has already solved everything |
| **Jinx Rivera** | After `jinx_route_2` + respect, day >= 40 | Confronts the player after an actual competitive setback | She is testing whether someone will still treat her seriously when she is not winning; no unearned overnight personality reversal |
| **Luna Quinn** | After `luna_route_2` + trust, day >= 40 | Invites the player to test a deck alone; specifically asks not to be rescued every turn | She gets competence and independence rather than being reduced to a slapstick/fanservice misunderstanding |
| **Sierra Holt** | After `sierra_route_2` + respect, day >= 48 | Faces a conflict between a scheduled shoot and a meaningful tournament preparation | Neither modeling nor Pokémon is framed as the "wrong" identity; the choice is about her boundaries |
| **Sol Varela** | After `sol_route_2` + trust, day >= 44 | Stops the player at a quiet moment and admits she has no event planned | Tests whether the relationship can survive ordinary companionship; complements rather than repeats her existing festival arc |

**Important:** these are **new interstitial beats**, not replacements for `*_route_3` etc. The importer should validate that a new mandatory scene doesn't recap the same exact conflict, and it should use continuity-sensitive dialogue after existing route choices. The above scenes are outlines, not finished scripts.

## Trigger language (data-only, declarative)

Add an optional `mandatory_events.json` to `characters/<id>/` (character-specific) and a shared `rpg_season_events.json` file (season events). The *compiler* merges and validates them. Existing `stories.json` remains backward-compatible and **optional-by-default**; do not reclassify existing scenes.

Example **bond** event in `characters/rina/mandatory_events.json`:

```json
{
  "schemaVersion": 1,
  "characterId": "rina",
  "events": [
    {
      "id": "rina_initiates_practice",
      "kind": "bond",
      "priority": 60,
      "earliestDay": 30,
      "trigger": {
        "all": [
          { "storyDone": "rina_route_2" },
          { "relationship": { "npc": "rina", "metric": "trust", "gte": 2 } }
        ]
      },
      "delivery": "remote_or_present",
      "timeCost": 0,
      "lines": [
        { "speaker": "rina", "text": "I have an hour until rehearsal. This time I wanted to ask you first." },
        { "speaker": "Protagonist", "text": "A practice match? On your schedule?" },
        { "speaker": "rina", "text": "On mine. I wrote it in myself." }
      ],
      "choices": [
        {
          "label": "I'd like that. Let's find a time.",
          "flag": "rina_practice_yes",
          "reply": "Then it's a date with our decks, not my manager's calendar.",
          "effects": { "flags": ["rina_chose_practice"] }
        },
        {
          "label": "Not today, but thanks for asking.",
          "flag": "rina_practice_no",
          "reply": "Okay. I'll ask again when we're both free.",
          "effects": { "flags": ["rina_respected_no"] }
        }
      ],
      "fallback": "queue",
      "expiry": "never"
    }
  ]
}
```

For a **world** event, `kind: "season"`, `earliestDay: 29`, `trigger: { "all": [ { "dayGte": 29 } ] }`, and `delivery: "world"`. Include a narrator speaker or preexisting NPC; world events do not require one principal NPC or a romance relationship.

Supported trigger predicates should be a **whitelist**, not executable JavaScript or `eval`:
- `dayGte`, `dayLte`, `storyDone`, `flag`, `relationship: {npc, metric, gte}`, `duelCountGte`, `tournamentState`, `eventSeen`, and nested `all` / `any` / `not`.
- Relationship metrics must come from `state.relationships` (`affection`, `trust`, `respect`, `attraction`) and **not** be taken from transient UI view models.
- Missing data is treated as not satisfied, except unconditional calendar-only season beats.
- All predicates, speakers, existing character IDs and prerequisites validated at build time. Cycles in `eventSeen` dependencies are errors.
- Optional alternate dialogue blocks can branch on `state.storyFlags`, `state.routeOutcomes`, `state.tournaments` and player decisions. Dialogue **must not** assume the player won a tournament.

A pack without `mandatory_events.json` is fully valid; no migrations required for existing AI-authored packs.

## Delivery semantics — what “mandatory” actually means

1. After **any completed atomic time action** or on initial/loaded state, evaluate triggers. On a multi-period rest/sleep, evaluate all due events against the resulting day/period; do not lose overdue ones.
2. **Never interrupt** an active story, side quest, duel, CG interaction, appointment, prepared duel or any character-choice dialog; the queue becomes available at the **next safe boundary**.
3. Enqueue events once based on stable ID, deduplicate across reloads. Order deterministically by **season before bond**, authored priority, eligible timestamp, ID. Re-evaluate dependencies when beginning each queued event.
4. **Display at most one automatic scene in a period/day boundary**, deferring excess rather than playing five back-to-back. An event can wait until the next safe boundary without expiring. An important final-season beat can bypass the normal per-period cap but still cannot interrupt a pending duel.
5. Present the scene in the existing middle VN text/choice UI with its actual speaker portraits; **no added sidebars or scroll-heavy lists**. A quiet "Incoming story" cue may preface a scene. A remote message is styled as a character call/message, not a physically teleported NPC.
6. Default `timeCost: 0`: the scene does not consume an extra period, focus or currency. If an event explicitly requires an activity/duel, its **follow-up** action is offered separately and may cost the normal period. Choosing "not now" must not soft-lock the story.
7. Record a stable outcome in `mandatoryEventState.seen[id]` **exactly once** after the chosen response. Neutral options are genuine answers. On reload, resume the active line/choice without duplicate rewards or flags.
8. Introductory world events can offer a **fast-forward/skip recap** in New Game+; they still record acknowledgment exactly once. Any route-affecting choice needs either an explicit decision or a neutral skip outcome—never an implicit romantic commitment.
9. World climax scenes must be delivered **before showing the completed season report and allowing New Game+**. If the game reaches Day 91 with pending closure, let the player finish the closure scene without losing state.
10. Out-of-context or removed pack event IDs in old saves should be gracefully ignored and logged, not crash rendering. An imported new pack does not silently rewrite old `storyDone`.

### Save-state model

```json
{
  "mandatoryEventState": {
    "seen": {
      "neo_community_welcome": { "day": 1, "slot": 0, "choice": 0 }
    },
    "pending": [
      { "id": "rina_initiates_practice", "eligibleDay": 34, "eligibleSlot": 2 }
    ],
    "active": {
      "id": "neo_cup_eve",
      "phase": "lines",
      "index": 1,
      "choice": null
    },
    "lastPlayedStamp": "34:2"
  }
}
```

Keep `storyDone`, `storyFlags`, `activeStory`, `bonds`, `pendingDuel` and existing story scene IDs unchanged. If an event leads to an actual TCG duel, it must use the same persistent receipt path as RPG duels and never award twice.

## Integration points (implementation sequence)

1. **Pure data engine `rpg_mandatory_events.js`:** `validate`, `hydrate`, `due`, `queue`, `takeNext`, `advanceDialogue`, `choose`, `finish`; idempotent pure-ish state transitions, predictable ranking and safe fallback.
2. **Content build tooling:** extend `scripts/rpg-character-packs.js` with optional `mandatory_events.json`, add JSON Schema, copy to generated registry. Bundle world beats in a separate checked-in data module. Validate duplicate IDs against *all* existing scene/quest IDs and referential integrity.
3. **RPG reducer/renderer:** `rpg.js` hydrates saved state and calls scheduler once from a safe post-action boundary. Add `activeMandatoryEvent`-aware locking, rendering, actions (e.g. `mandatoryNext`, `mandatoryChoice`, `mandatoryFinish`), narrator/portrait handling and save-on-every-step. Calendar and planner can show **generic upcoming season commitments** without spoiler titles; triggered scenes don't become a lengthy permanent sidebar.
4. **Save + relationship bridges:** reuse existing `state.relationships`, `state.storyDone`, `state.storyFlags` and real duel receipts. Avoid double-awarding bond bonuses or implicitly changing `partner`.
5. **Author** one early world scene, one earned Rina scene, and one earned Sol scene first. Test end-to-end before authoring the full calendar or automatically requesting all AI character creators to update their packs.
6. **Scale** to Elena, Jinx, Luna and Sierra, then add 3–4 later season beats and only then optional animated/event-CG assets.

## QA and UX acceptance cases

- **Zero social play:** a player resting from Day 1 to 90 still receives all season beats; no bond beats, no soft lock.
- **Active social player:** finishing an earlier chapter and reaching a trust threshold triggers the earned beat **once**, independent of NPC location, on the next safe boundary.
- **No unintended grind:** relationship trigger uses a prerequisite chapter or meaningful interaction, not raw affection alone.
- **Collision:** world and 4 bond triggers become due during the same sleep: all are queued, only one presented; sorting deterministic and none lost.
- **Interruption:** save/reload mid-monologue and after choice, then finish; outcome and rewards happen exactly once.
- **Prepared duel / multiplayer / active quest:** never interrupts and never steals or replaces the pending duel receipt.
- **Period skipping:** sleep across a due-day works; overdue scene is not expired simply because the player did not travel to a location.
- **Crossover:** NPC involved in another active scene does not instantly teleport to satisfy event; remotely delivered message or delayed in-person presentation.
- **Relationship autonomy:** bond scene allows "no" without romantic punishment, and can be seen while the player is committed to someone else.
- **Legacy saves / New Game+:** old saves hydrate the new map and continue; New Game+ resets per-run seen/pending while retaining whatever historical archive already exists.
- **Season end:** no pending required closure is discarded by day 91 or by the epilogue panel.
- **Accessibility / UI:** centered story choice controls, clear speaker labels, keyboard advancement; text-only mode remains completely functional with missing images.

## Explicit non-goals for v1

- No custom JavaScript callbacks shipped by a character author.
- No forced romances, forced duels, forced wins or irreversible decisions hidden in cutscenes.
- No new TCG rules, NPC archetypes or tournament entries automatically created from prose.
- No random-gated mandatory content; random moments remain in `rpg_situations.js`.
- No conversion of all existing five-chapter heroine routes into auto-trigger cutscenes. The opt-in route system is valuable; mandatory beats supplement it.
