# Neo Campus: Core Rules Extraction (v0.9.0)

## Why this milestone matters

Instead of fixing single cards or moving only UI prompts, this checkpoint extracts reusable rule code that previously lived inside the browser-only `engine.js` into `core_rules.js`, an independently importable pure JavaScript module. The browser engine **now calls this module** for:

- Card types, six historical Basic Energy identities, and legacy malformed Energy normalization
- Basic Pokémon eligibility (including Mysterious Fossil and Baby exclusions)
- Evolution compatibility, including Gym trainer-specific evolution lines
- Ordinary Energy attachment eligibility (once-per-turn, special Miracle Energy and Pure Body restrictions)
- Attack Energy cost multiset matching, including Colorless requirements

Other usable pure helpers are `setupCandidates`, `validateDeck` (optional, does not reject historical app decks automatically), and `countCards`, for later deck building and state auditing.

The module has no browser, network, CPU, or match-global dependencies and can be imported with `require('./core_rules')` or accessed in the browser as `globalThis.NeoCoreRules`.

## Automated validation

- Existing entire `npm test` suite passes (all prior gameplay tests, Trainer tests, server integration, catalog checks).
- `test_core_rules.js`: all 1,123 card records / 1,479 attacks, evolution records, deck legality, classification, attachment and 20,000 seeded randomized cost-match assertions.
- `test_headless_core_integration.js`: invokes the actual Engine in a headless VM with the *new core injected* and verifies actual attachment / repeat-attachment rejection / evolution / preserved Energy / typed attack costs / calls into pure cost matcher.
- `npm run release:strict` **intentionally fails**, because eight historical Trainer records remain partial. This release does **not** certify full rules fidelity.

## Compatibility and limitations

`engine.js` retains a small inline compatibility fallback for older self-contained VM tests which evaluate `engine.js` without browser script imports; actual browser load includes `core_rules.js` before `engine.js`. Do not treat fallback as a second authoritative rules source. New rules should be implemented in `core_rules.js` and use explicit inputs.

This is a significant **rules extraction**, not an entire headless battle engine. Attack effects, Pokémon Powers, reactive Trainer decisions, game mutation, random coin flips, and CPU operations remain largely coupled to browser-oriented `engine.js`. Multiplayer and campaign modules remain future adapters.

## Running

1. `npm start` from the `neo-campus-work` folder and browse to http://localhost:8000.
2. `npm test` for the entire regression suite.
3. `npm run test:core` for extracted rules and actual engine integration.
4. `npm run release:strict` for the outstanding fidelity gate (expected to fail for eight partial Trainers).

## Next engineering step

Extract *action transactions* (actor authorization, mutations, pending decisions, commit and rollback) from card-specific UI callbacks. Make effect handlers consume a pure match context and output a decision or state change. Then migrate effects in complete families and run end-to-end effect tests rather than adding one-off UI patches.
