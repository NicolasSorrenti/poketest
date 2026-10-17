# Neo Campus — Decision Integration Checkpoint 3

## What changed

- Shared `decision_core.js` is now usable in Node.js and in the browser, without changing the authoritative validation contract.
- Added `legacy_choice_bridge.js` to adapt the existing `deckSearchRequest` choices into stable, opaque decision option IDs.
- The browser's existing single- and multi-select deck choice buttons now validate selected values and selection counts *before* executing existing card callbacks.
- Added `test_legacy_choice_bridge.js` and included it in `npm test` and `npm run test:decisions`.
- Existing card handlers and opponent logic are intentionally preserved.

## What this is not

This is a first integration seam, not a full migration of attack/Power/Trainer target pickers. There is no playable network duel; room protocol remains a separate foundation. Legacy code still assumes a browser and distinguishes human/CPU. Further work should migrate `targetRequest`, attack-specific selectors and reactive opponent decisions behind the same adapter, then separate the headless state transition engine from the browser UI.

## Verification

`npm test` passed on Node.js 22 in the build environment. This does not constitute comprehensive interactive browser testing or certified card-by-card historical accuracy.
