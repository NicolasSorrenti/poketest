# Neo Campus TCG — RPG/VN agent handoff

**Owner:** RPG/Visual Novel gameplay and narrative workstream.
**Branch:** \`feature/rpg-autonomous-world-systems\` (intended to merge to \`main\`).
**Current implementation:** Neo Harbor world/economy/circuit narrative milestone, after the v0.4 living-town UI.
**Preserve:** all eight established adult character definitions, the 90-day campaign, three periods per day, existing VN artwork paths and the Classic headless Pokémon TCG reducer. Do not copy Tag Force dialogue or assets.

## Executive status

| Milestone | State | Player-visible behavior |
|---|---|---|
| Living schedules | Implemented | Deterministic one-location-per-period routines, circuit gatherings, route-dependent visits, next public sightings, weekly NPC match results and a town bulletin |
| Time / home UX | Implemented | Explicit Morning/Afternoon/Evening clock, free travel, visible character counts, sleep, action costs, period/day transitions, calendar |
| Social & VN | Expanded and playable | 44 authored, missable scenes including the eight original core routes, four optional Hana scenes, eight paired-heroine encounters, choice effects on multiple characters, friendship/romance resolutions |
| Side activities | Implemented | Arcade high-score challenge (risk vs safe), café shifts, shop jobs, library study progression, riverside scouting, home resting and public map counts |
| Authentic TCG bridge | Integrated | All duels reuse ClassicLocalService; authoritative win/loss, CPU duel iframe with encounter-scoped session token and returned match ID; no card-rule duplication |
| Multi-match tournament | Implemented | Neighborhood Cup, Regional Qualifier and Championship: registration, reputation thresholds, 2/2/3 CPU rounds, wins/losses, elimination/forfeit, non-player standings |
| Card economy | Implemented limited catalog | Base/Jungle/Neo Genesis collection shop, actual card IDs, 60-card starter from existing decklist API, purchased singles, eight-card game bundles, owned-card editor, custom deck legality, credits |
| Endings / NG+ | Implemented | Competition and relationship-dependent season epilogues, player choice about next chapter, retain collected cards on New Game+ |
| Render deploy smoke | **Not yet verified** | Requires real Node server + live browser on Render |
| Signature NPC decks | **Not finished** | Current chapter-specific CPU decks are *approved existing presets*, not bespoke 60-card versions of each character's intended signature archetype |
| Complete multi-round official-bracket simulation | **Not finished** | Current 2/2/3-match events are fixed authored elimination ladders, not seeded independent brackets with all NPC matches |
| Full Base–Neo economy | **Not finished** | Shop currently loads Base, Jungle and Neo Genesis; custom edits use existing rules engine IDs |
| Persistent hosted save / game restart | **Not finished** | Browser localStorage retains RPG state, but CPU duel sessions live in Node memory and cannot survive server restart |
| Secret server-side story delivery | **Not finished** | Authored scripts are served to the browser. Player UI avoids spoilers; technically curious players can inspect JS. |

## Core RPG contracts

- \`rpg.html\`: player-facing town interface. All new controls must have event handlers, accessible text and mobile behavior.
- \`rpg.js\`: browser controller / migration for \`neoHarborRpgV1\`; do not silently replace or discard existing saves.
- \`rpg_story.js\`: browser+Node UMD authored event registry, lookup, prerequisites, expiry and exact-once resolution. The eight main routes retain stable IDs \`<hero>_route_1..4\` for save compatibility; extras use distinct IDs.
- \`rpg_world.js\`: deterministic location resolution, roster availability, public sightings, weekly CPU-vs-CPU competition state and staged preset deck selection.
- \`rpg_circuit.js\`: tournament registration / scheduled rounds / duplicate match results / expiry and rewards.
- \`rpg_market.js\`: item ownership, starter seeding, pack/singles buys and 60-card draft validation.
- \`rpg_finale.js\`: end-of-season decisions and collection-retaining New Game+.
- \`classic_live.js\`: **only** integration changes: \`rpg=1&rpgMatch=<uniqueId>&deck=<preset>&opponent=<preset>\`. Duel UI remains Classic-authoritative.
- \`localStorage['neoCampusRpgDeck']\`: the RPG's selected custom card list, **separate from** the standalone deck builder's \`neoCampusCustomGymDeck\`. The iframe uses the former only in RPG mode.
- RPG event availability is purely RPG-owned. A battle returns via postMessage \`{type:'neo-rpg-duel-finished',matchId,winner}\`. The parent verifies same origin, same iframe source and exact pending match ID, then records the result once.
- \`ClassicLocalService\` and \`headless_duel.js\` MUST remain the card-rule authority. No separate Pokémon TCG reducer.
- \`rpg-assets/{character}.png\`, \`rpg-assets/{location}.jpg/png\`: asset contract; the previous art ZIP must be committed manually. Missing character portraits fall back to initials.
- Coordinate data contract changes with the duel-agent before touching duel service/rules.

## Quality gates and tests

- Command: \`npm run test:rpg\` (Node built-in test runner, test files \`tests/rpg_story.test.js\`, \`tests/rpg_systems.test.js\` and \`tests/rpg_ui.test.js\`).
- Current test cases: 23 (17 unit/logic, 6 simulated controller smoke). Story registry contains 44 events, with validated links and windows. Module-source scenarios and isolated simulated DOM checks have passed.
- Syntax checked for RPG/duel-bridge JS, exact HTML IDs and server script whitelist.
- **Execution caveat:** this agent's runtime cannot clone GitHub through the shell, so the Node command and live Render browser run have *not* been executed here. The 23 authored assertions were exercised in a JavaScript evaluator against fetched connector sources, including a mock DOM with asynchronous catalog loading. Verify with \`npm run test:rpg\` and a real browser before calling the milestone production stable.
- Essential manual checks: first launch, home sleep/day rollover, entering late-game shop, opening a paid bundle, editing/playing an owned custom deck, a full two-match Cup, losing another Cup, returning after reload mid-story and mid-duel, finishing day 90 and starting NG+.
- Avoid changing existing multiplayer or the standalone Classic deck-builder storage.

## Known issues and prioritized continuation

**P0** Verify \`npm run test:rpg\` and full Render browser smoke on \`/rpg.html\`; confirm the art-pack folder is actually in the repository and every image loads. Verify authoritative CPU match finish and returning to RPG (including a match that ends after reload); restart Render mid-duel and document expected failure.

**P0** Implement genuinely owned campaign deck selection end-to-end for the full relevant historical catalog, with deck-inventory constraints enforced server-side if online accounts are introduced. Theme deck rental should remain explicitly distinct from owned custom decks.

**P1** Replace phase-based preset CPU decks with individually tested historical legal 60-card decks faithfully representing all eight signature strategies (without changing card-effect implementations). Check legacy English Slowking/Sneasel legality.

**P1** More daily variety: deeper repeatable minigames, inventory achievements, NPC-based gifts/trades and real tournament brackets with all-NPC progress; more than four core scenes per non-Hana heroine, story branches that change encounters and epilogues.

**P1** Story/relationship audit across a simulated 90-day campaign: prove full-route reachability, missed-event consequences, multi-NPC interactions, romance exclusivity and complete endings under reasonable player behavior.

**P2** More SFW approved anime character artwork and backgrounds, effects, sound, VN transitions, battle-to-story polish; protect private authored story scripts from browser inspection via a compatible authenticated server event resolver.

Do not give the player route-secret details as progress updates. Changes should be committed on feature branches, reviewed for unaffected TCG interfaces, then merged to \`main\` only after tests.
