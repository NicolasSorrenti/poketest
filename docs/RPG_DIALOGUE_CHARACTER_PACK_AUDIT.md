# Character-pack dialogue audit — 2026-10-30

## Progress

Reviewed character route summaries and changed ten lines in seven route events, keeping event schema, IDs, prerequisites, flags, choices, reward values and CG fields unchanged.

| Character | Source events counted | Route events edited | Status |
| --- | ---: | --- | --- |
| Barb | 18 | barb_route_5 | Partial review, route revision committed |
| Laca | 7 | laca_route_4 | Partial review, route revision committed |
| Jinx | 7 | jinx_route_2; jinx_route_5 | Partial review, route revisions committed |
| Elena | 5 | elena_route_2; elena_route_5 | Partial review, route revisions committed |
| Daisy | 4 | daisy_route_3; daisy_route_4 | Partial review, route revisions committed |

### Commit references

Source files: Barb `903344a`; Laca `e905ac0`; Jinx `b3c112e`; Elena `1bb8262`; Daisy `474ed6c`. Compiled asset synchronization `6c32fdd`.

### Validation performed

- All five JSON files parsed successfully and retained their original event counts (41 total).
- All events checked had nonempty identifiers, dialogue with speakers/text, and choices.
- Verified the compiled character pack contains the updated dialogue text.
- **Not yet verified:** generated-file equivalence from running the build script, complete test suite, runtime behavior or complete per-event uniqueness review.

### Audit criteria for remaining work

For every source `characters/*/stories.json` event (including random CGs and crossovers), compare: dramatic premise, character-specific agency, character voice, player participation, progression continuity, similarity to other character scenes, and integration constraints. Rewrite only meaningful overlaps or weak dramatic beats. Do not modify event IDs or choice semantics to solve a writing issue. Run `node scripts/rpg-character-packs.js` and existing RPG tests in a full checkout before considering integration validated.

### Future dialogue design rules

Prefer concrete decisions over generic reassurance; make character dialogue reflect specific ambitions, competencies and relationships. Rotate between collaborative action, disagreement, humor, earned tenderness, rivalry and quiet reflection. Avoid repeating the same motif, such as creative insecurity, uncomfortable affection, mysterious audience, or an invitation to spend time together, unless it serves distinct characters differently. Preserve event CG and timing assumptions.

## Second pack batch — 2026-10-30

Reviewed the full five-route arcs of Rina, Sierra, Luna and Sol (20 route events); revised **7 lines in 4 events** while retaining stable choices, flags, speaker order and CG references:

- Rina `rina_route_4`: distinguishes musical vulnerability from simply saving another encore for the player; she now asks for a genuine opinion.
- Sierra `sierra_route_5`: replaces another career-calendar clash with the agent actually watching Sierra play and supporting the match.
- Luna `luna_route_2`: shifts the recurring "help me with supplies" beat toward designing an accessible beginner table and agency.
- Sol `sol_route_5`: moves from a vague performance metaphor to a direct relationship invitation.

Source commits: `688111f`, `706dfbe`, `bb4bc61`, `5934e59`. Generated character-pack sync: `0e7dae8`.

**Coverage:** 20 route events examined; four revised. Remaining random/side/crossover scenes in these packs need separate editorial review. JSON and compiled text checks are not a replacement for a full generated-build/test run.
