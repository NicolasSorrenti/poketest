# Neo Harbor RPG G6 — 90-Day Finale and Cross-Season Gallery

**Owner:** RPG gameplay integration. October 19, 2026.

## Player-facing features

The new **Your 90-Day Journey** panel appears in the RPG sidebar. It shows the current season/day, the collected memory count and progress meter, and three spoiler-safe goals: the chapter of the 90-day journey, social connections/kept plans, and CG gallery progress. It does not reveal unearned personal-story titles.

The CG Gallery shows total unlocked memories, the percentage of the complete 32-CG catalog, and per-character/per-category completion counts. Its new **Only new memories I haven't viewed** filter shows only earned, unviewed CGs, never locked titles or image URLs. Importantly, inspecting an unlocked entry with a **missing image** no longer marks that image viewed: this happens only after the image actually loads successfully. Missing art remains a non-blocking placeholder.

The season finale preserves existing championship/romance/friendship endings and now includes counts for completed side quests, attended social plans, unique situational events, and gallery memories. **Your earlier seasons** displays up to ten archived run summaries. Normal campaign reset still clears the album; New Game+ preserves the preferred deck preset, earned gallery/unviewed status and report history, while resetting tournament, social and world progression. This replay ownership lives in rpg_epilogue.js instead of ad-hoc copying in the controller.

## Code boundaries

- rpg_season_journey.js: CommonJS/browser read-only projections for gallery totals, current social progress, spoiler-safe milestones and archive summaries
- rpg_epilogue.js: extra legitimate report metrics and gallery carryover on New Game+
- rpg.js / rpg.html / rpg.css: journey sidebar, gallery filter/completion, final-season archive, real-image-viewed correction and responsive UI
- server.js: explicitly allowlist the new module instead of opening static script access
- No Classic reducer, CPU, Cube, multiplayer or narrative-agent route content was rewritten

## Image agent

No CG binaries are created here. Continue the 32 approved images and their exact filenames in docs/CG_ART_AGENT_HANDOFF.md and docs/cg-art-queue.json. Images are 1920×1080, thumbnails 640×360, under rpg-assets/events/cg/season01. The new unseen filter makes it easy to find *earned but undelivered* art. Do not overwrite finished character portraits or event art.

## Testing and limits

- G6 module tests cover 32 scene slots, read-only counting, completed season report, New Game+ reset/carryover, archive caps, save migration and 273 simulated progress projections.
- Browser-controller tests cover journey overview, gallery filters, missing-art unviewed behavior, New Game+ archiving and a 270-period uninterrupted path from Day 1 to Day 91.
- Existing RPG flow, save/lock, duel bridge and actual Chromium match smoke remain required regression gates.
- This is **not** proof that every romance route, side quest, event illustration, or all original historical TCG cards have been exhaustively verified. The 270-period test validates the final boundary, not every possible plot combination.
