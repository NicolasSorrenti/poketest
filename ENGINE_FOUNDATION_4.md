# Engine Foundation 4 — shared Pokémon target choices

This checkpoint connects the transport-neutral decision contract to the browser's generic `requestTarget` / `chooseTarget` flow. The flow is used by targeted attacks (e.g. Stretch Kick), Trainers (e.g. Gust of Wind), and Power prompts that invoke `requestTarget`.

Changes:
- New `target_choice_bridge.js` converts eligible Active/Bench slots into stable option IDs, validates the decision actor, and rechecks currently legal targets before executing the existing effect callback.
- The browser now loads the new adapter after `legacy_choice_bridge.js`.
- `test_target_choice_bridge.js` covers valid selection, wrong actor, illegal side, targets becoming invalid, and stale requests.
- Full `npm test` passes.

This is an incremental integration, not a headless gameplay engine. Many `deckSearchRequest` prompts and card-specific targeting still use legacy engine callbacks; the turn/CPU and UI remain coupled. No new multiplayer behavior is claimed. Existing game behavior is retained.
