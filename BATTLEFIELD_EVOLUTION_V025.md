# v0.25 — Evolution legality and battlefield clarity

## Corrected core behavior

- Pokémon selected during opening setup now enter with `playedTurn` equal to the first playable round, not zero. Therefore a first-turn normal evolution (e.g., Grimer → Muk) is illegal on either player's opening turn. Evolving on a subsequent turn works.
- Owner-specific Gym evolutions use consistent name normalization for Nidoran gender symbols and whitespace: e.g. `Giovanni's Nidoran ♂` now legitimately evolves into `Giovanni's Nidorino`. The owner prefix is mandatory: a Gym evolution cannot evolve an unrelated or generic copy of a Pokémon.
- The accelerated target picker delegates compatibility to the **same `core_rules.canEvolve()`** used by the authoritative Node reducer. This avoids valid actions appearing as ineligible or invalid evolutions being highlighted. Giovanni's temporary early-evolution permission is preserved but never bypasses species compatibility.

## Playfield and UI

- Prize stack at the left of **its own trainer's half** of the board: opponent on top, local player below. Each slot has a full illustrated original Neo Campus card back; collected prizes remain visibly empty. The identity of face-down prizes is never exposed.
- Opponent's Bench above opponent's Active; local player's Active above local Bench. Attack controls remain next to Active.
- Attached Energy rendered as overlapping upper card strips **above** the Pokémon, visible for both players, with an overflow count for larger attachments.
- Animate entry/evolution, damage, and Energy attachments; announce turn transitions and the latest authoritative duel-log event for both local and online matches. Prefer reduced-motion setting respected.
- All UI animations derive from server-projected state, without granting the client any new authority over actions or hidden cards.

## Tests

- `npm run test:board`: core and browser asset tests, dual-player setup/first-turn enforcement, Giovanni family compatibility, quick UI validation, local and remote HTTP tests.
- `npm test`: complete historical engine and online regression suite including board tests.

## Limitations

- Browser-level navigation from a sandboxed headless Chromium to localhost returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`, so an interactive graphical smoke test needs to be run locally. Static client validation and live HTTP tests pass.
- Card art images rely on remote `images.small` URLs (as before); the Prize card back is a bundled SVG and works offline.
- Gym and Neo effects marked as previews in v0.24 remain incomplete; this release fixes evolution and presentation, not those unsupported effects.
