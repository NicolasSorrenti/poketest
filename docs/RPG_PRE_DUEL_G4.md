# Neo Campus RPG G4 — Cinematic Pre-Duel State Machine

**Owner:** RPG integration. **2026-10-18**. This milestone builds on G1–G3 social/gameplay systems without changing Classic Pokémon TCG rules, deck legality, CPU logic, or the narrative agent's authored quests.

## Playable experience

Every NPC, tournament, special-event, rivalry, and side-quest challenge now enters a **pre-duel scene** *before* the Classic duel iframe is mounted. The player sees a venue-specific introduction, opponent name/deck-style, a match-stakes label, and a brief character-appropriate challenge. A qualifying CG is attempted only if the canonical character/place/day/affection gates are satisfied. The already-installed portrait and a text fallback remain available if the image asset does not exist, so the match is never blocked by unfinished art.

- **Continue story** reveals the opponent's line.
- **Start Duel** starts the real Classic match after the two-line preview.
- **Skip scene · Start Duel** starts the same match immediately, without a second duel identity or extra resource use.
- The preview is a **modal**, intentionally preventing time progression/deck changes while the match is prepared. Browser Escape is blocked to prevent a hidden, unresolved pending duel.
- The game does **not create an authoritative Classic match** until Start or Skip: the iframe is initially hidden with `about:blank`. On confirm, the duel ID, player deck, opponent, NPC identity, tournament round, event reward and side-quest identity are unchanged.
- Optional CG gallery unlocks occur on **Start or Skip**, not merely when a match challenge button is clicked. The moment uses the original, known, SFW adult-cast art slots; this feature makes no claim of delivering ungenerated CG binary files.
- A forged/stale result during preview is ignored, even if it claims the correct duel ID. Subsequent results are settled by the existing origin/frame-validated bridge; repeat receipts remain idempotent.

## Reload and save contract

The existing `neoHarborRpgV1` campaign save holds an additive field on the already-present `pendingDuel` object:

```json
{
  "pendingDuel": {
    "id": "npc-hana-8-1-0",
    "npc": "hana",
    "preview": {"phase": "ready", "index": 0}
  }
}
```

- `phase: 'ready'` means **not launched**; a refresh restores the dialog and its exact line number without booting an iframe, changing time or creating a token.
- `phase: 'launched'` means the duel has begun; a refresh resumes the same match via the pre-existing per-duel sessionStorage token and authoritative service. It never shows another preview.
- Pending duels loaded from **older saves** without any preview field default to `launched`, preserving their existing live-match behavior.
- `Start`/`Skip` are idempotent; once launched, clicking them again cannot spawn a second duel or spend another period.
- Existing bracket, side quest and rivalry continuations retain their identities; G4 adds no tournament scoring or character bond rewards.

## Source and future art integration

- `rpg_preduel.js`: pure CommonJS + browser module exposing `stage`, `hydrate`, `advance`, `launch`, `isReady`, `isLaunched`, `describe`, `compatibleCG`.
- `rpg.js`: staged-then-launched duel transition, preview modal, character portrait fallback, protected save/reload, and real-result gating.
- `rpg.html`, `rpg.css`, `server.js`: responsive, accessible-ish dialogue UI and narrowly allowlisted module script.
- `rpg_cg_gallery.js`: remains the authoritative metadata for adult-only, SFW character CGs; the image agent delivers asset files separately using its documented manifest and original IDs.

**Narrative agent:** can add optional `preDuelLines: ['One short in-character sentence']` on cast metadata. If absent, the gameplay module supplies appropriate nonspoiler dialogue for the original eight heroines and a generic fallback for supporting characters. The gameplay agent does not rewrite personal route scripts.

## Verification

- Domain tests: preview readiness, explicit start and skip, one-time launch, CG eligibility, legacy save migration, different match stakes.
- Controller tests: no iframe before Start, callback rejected during preview, UI step progression, save/reload in preview, old pending-match loading, preserved gallery eligibility and single reward.
- Real-browser Chromium smoke: verifies the popup before Classic boot, reload in the middle of dialogue, Start Duel, session token reuse on **in-duel** reload, authoritative concession and receipt, and Skip flow on the second match.
- Full `npm run test:rpg`, plus the repo's broader regression suites, should run in GitHub Actions.

## Playability boundaries

G1–G4 mechanics are implemented but this does not imply the entire 90-day campaign, every side quest, every historic TCG card, or every image has been manually verified. CG artwork remains external until the image-creator agent delivers the actual files. The preview always remains playable with an installed character portrait and dialogue instead of a missing CG.

**G5 follow-on:** optional season/time-limited social events with stable one-time probabilities, multiple variants per gallery entry, better CG production tooling, and narrative agent story authoring integrations.
