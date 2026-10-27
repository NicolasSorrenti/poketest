# Gemini CG candidate generator

This is a **review-only** integration. It uses the existing `docs/cg-art-queue.json` and `scripts/rpg-art-prompt.js`, and never writes into playable `rpg-assets/` paths.

## Setup

Use Node 20 or newer. Obtain an API key from Google AI Studio, then set `GEMINI_API_KEY` **locally** or in a secure CI secret (never in a repository file or prompt). The script uses the Gemini image model selected by `GEMINI_IMAGE_MODEL`, defaulting to `gemini-2.5-flash-image`. Model access, cost and quotas depend on your Google account.

## Commands

```sh
node scripts/gemini-cg.js --next --dry-run
GEMINI_API_KEY=YOUR_KEY node scripts/gemini-cg.js --next --count 3
GEMINI_API_KEY=YOUR_KEY node scripts/gemini-cg.js --scene hana_first_meeting
```

On PowerShell, set `$env:GEMINI_API_KEY="YOUR_KEY"` separately and then run `node scripts/gemini-cg.js --scene hana_first_meeting`. Do not paste keys into GitHub.

`--next` selects only canonical queue scenes whose exact expected playable CG path is absent. If all expected paths exist, the tool reports no work instead of regenerating them. `--scene` can deliberately create a new **review candidate** for an existing scene without touching the approved art.

Results go to `art-production/gemini-candidates/<scene-id>/candidate.png` (or .jpg/.webp) plus `review.json`. The script refuses to replace an existing candidate folder. Check characters, pose and story relevance visually; metadata or dimensions alone cannot validate character identity.

**Important:** Generated images are not installed in the game, converted to the expected WebP path, or approved automatically. Only after a manual approval should an operator convert and install the asset at the exact `expectedGamePath`, update any applicable event metadata, and run the game's art tests. Keep candidate folders out of regular commits if image review isn't complete.

The API is called from your own machine or configured job, not directly from this chat. The script may need a different model name when Google's supported models change.
