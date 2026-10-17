# Neo Campus TCG — v0.11: Headless Attack Effects & Historical Conditions

This is a meaningful expansion of the browser-independent, server-authoritative rules engine introduced in v0.10. It **does not** replace the existing browser/CPU duel yet. No new multiplayer UI or visual-novel features were added.

## Verifiable outcomes

- **640 / 1,479** historical attack records have recognized and executable portable effect programs (43.3%), up from **412 / 1,479** (27.9%) in v0.10. **228 attack records were added.** All 839 unported attack records continue to be rejected, rather than resolved as plain damage.
- Newly migrated effect families:
  - 48 unconditional Sleep, Poison, Paralysis or Confusion attacks
  - 141 coin-flip-dependent Sleep, Poison, Paralysis or Confusion attacks
  - 20 attacks with fixed self-recoil
  - 12 attacks with coin-dependent self-recoil
  - 4 attacks that draw one card
  - 3 additional coin-dependent damage-bonus scripts
- New **`special_conditions_core.js`** supports independent Poison plus mutually exclusive Sleep/Paralysis/Confusion. Historical between-turn processing includes 10 Poison damage, Sleep flip, and Paralysis recovery after the affected player's next turn.
- Original WotC-era Confusion behavior: on a failed attack coin flip, 20 self-damage, applying Weakness/Resistance. Confused retreat discards its required Energy, then flips; tails fails without refunding Energy.
- Recoil and poison can Knock Out both Active Pokémon: the KO queue awards Prizes and requests replacement decisions from the right owner, including during an opponent's turn.
- Special Conditions are cleared on evolution, successful retreat, Switch, Gust of Wind, and promotion.
- Normal retreat is not capped at once per turn in this era. Failed Confused retreat cannot be repeated while still Confused in the same turn.
- Draw effects from an empty deck do not automatically cause deck-out loss; only failure to make the mandatory beginning-of-turn draw does.

## Measured tests

- `npm run test:headless`: pure 1,479-record attack-catalog audit, targeted status/KO/coin-choice tests, room tests, 2,000 adversarial command attempts and **160 fully completed seeded matches**.
  - 100 baseline headless matches: 994 attacks, no card-loss anomalies.
  - 60 further status-heavy matches: 1,086 attacks (**663 status attacks**) and 303 attack-caused Knock Outs; full 60-card conservation checked throughout every match.
- `npm test`: all legacy browser-engine regression tests and all new headless tests pass.
- `npm run audit:headless`: supported vs unported effect counts. `HEADLESS_ATTACK_COVERAGE_v011.json` is a per-attack audit.
- `npm run release:strict`: **expected to fail** on eight historic Trainer records awaiting behavioral verification; do not imply 100% rules fidelity.

## How to use

- Browser-based legacy playable duel: run `npm start`, visit `http://localhost:8000`.
- Standalone headless engine: `headless_duel.js`, via `createGame`, `reduce`, `applyCommand`.
- All headless tests: `npm run test:headless`.
- Status-specific full matches and behavior: `npm run test:historical-status`.
- Coverage: `npm run audit:headless`.

## Important boundaries (not yet complete)

1. **839 historical attack records** not yet migrated into the headless path. The portable engine intentionally rejects them.
2. Pokémon Powers, most Trainer effects, Tools, Stadiums, Special Energy modifiers, additional complex timing, target selection and simultaneous sudden-death rematches remain to be migrated.
3. Browser UI still uses the legacy engine. These v0.11 headless effects are verified in Node tests but are **not yet backed by the browser's rule authority**; migrating the browser should follow tested parity, not a blind replacement.
4. Strict historic certification remains open for eight known Trainers, and human GUI playthroughs remain necessary.

## Suggested next meaningful milestone

Build a portable, declarative effect pipeline that supports chosen targets, damage to Benched Pokémon, forced switches and attack costs, then migrate **complete families** of attacks and trainers with full-match behavioral tests. After parity testing, route the playable UI through the headless engine so there is only one rules authority. Online deployment and campaign/story UI remain future clients, not tasks for this release.
