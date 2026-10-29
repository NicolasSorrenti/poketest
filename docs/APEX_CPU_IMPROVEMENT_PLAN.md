# Apex CPU decision-quality roadmap

Status: **in progress**. Phase 1 merged into `main` via [PR #198](https://github.com/NicolasSorrenti/poketest/pull/198). Scope: Level 8 (Apex) first; do not silently change lower difficulty tiers or the authoritative battle reducer.

## Verified progress — 2026-10-29

- [x] Phase 1: [PR #198](https://github.com/NicolasSorrenti/poketest/pull/198), merge commit [6726270](https://github.com/NicolasSorrenti/poketest/commit/6726270826c36716148f7cf4fbf1e714ba82215a).
- [x] Compiled `bench-count` damage is used for Do the Wave and other matching attacks; public Bench counts reach Energy, KO, counterplay, and strategic search calculations.
- [x] Promoted Benched attackers are evaluated with one fewer Benched Pokémon.
- [x] Six new deterministic regressions plus the existing Wigglytuff test are in dedicated CPU CI and `npm test`.
- [x] Focused Apex Energy Decision Audit: **101/101 tests passed**. CPU AI regression, Apex Strategic Challenge, and other focused checks passed on the reviewed functional head.
- [x] Benchmark comparison retained **66/95** decisive general wins and **30/56** decisive late-campaign RPG wins against Level 7 (same fixed-seed outcomes as the reviewed baseline; not proof of broader strength improvement).
- [ ] Full legal CPU-turn Wigglytuff test and status-aware tactical scoring (Phase 2/3).
- [ ] Recheck extensive benchmark jobs once completed; some were still running when Phase 1 merged.
- [ ] Separate pre-existing CI blockers: RPG flow `children` undefined, Reina discreet-avatar expectation, stale generated character pack, and artwork-manifest count mismatch.


## Baseline and motivation

- The merged Wigglytuff Do the Wave fix (#197) corrects immediate attack scoring when the attacker has a Bench, but other decision paths still call the damage/KO estimator without the attacker's Bench count.
- Apex's preparation search uses the same imperfect estimates, so increasing search depth alone does not guarantee better moves.
- Latest reviewed paired CI: Apex won 66/95 decisive standard-archetype games against Level 7 (69.5%); in late-campaign RPG decks, 30/56 decisive games (53.6%). The RPG sample does **not** establish a reliable advantage.
- Existing Wigglytuff scoring regression is not included in the normal `npm test` or dedicated Apex Energy Audit workflow. It does not exercise a complete legal CPU turn.
- Broad main-branch CI has unrelated RPG-flow/discreet-avatar failures; report these separately rather than interpreting them as Apex failures.

## Phase 1 — Consistent public-state attack projections (first implementation)

1. Replace the Do the Wave name-specific estimate with the compiled `bench-count` attack effect when public Bench count is known.
2. Propagate the **attacker's** Bench count (not the defender's) to attack/KO projections in tactical planning, Energy attachment scoring, and opponent-response estimation.
3. Preserve exact coin-flip probabilities and avoid reading hidden cards, future RNG, or unrevealed Prizes.
4. Add regressions for 0/4 Bench Wigglytuff damage, own-vs-opponent Bench ownership, knockout threat, and planning projections.
5. Include new regressions in dedicated CI. Prefer a focused PR with checks before merging into `main`.

## Phase 2 — End-to-end tactical decision tests

- Construct real legal boards with sufficient Energy, an opposing 50-HP Machop, and four Benched Pokémon; assert that Level 8 actually selects and resolves Do the Wave, rather than only comparing raw scores.
- Cover guaranteed final-Prize KO, recoil/self-KO, Confusion, status already applied, Energy preparation, switching, and evolution.
- Capture reproducible seeds and decision traces. Never simulate future coin flips to choose an action.

## Phase 3 — Tactical evaluation improvements

- Replace blanket status text bonuses with context-aware expected value, including duplicate or incompatible statuses and opponent recovery opportunities.
- Make guaranteed match wins dominant when legal and safe; retain the special case where self-KO would lose the match.
- Consolidate public damage, KO probability, and counterattack evaluation behind one tested interface; leave authoritative damage resolution untouched.

## Phase 4 — Planning and validation

- Improve bounded reply modelling only after tactical evaluation is reliable; retain strict public-information boundaries.
- Compare Level 8 against its previous version and Level 7 with paired seeds, swapped sides, multiple archetypes and late-campaign NPC decks.
- Record decisive wins, draws/timeouts, missed guaranteed KOs, missed useful Energy, invalid proposals, median/p95 latency, and worst-case search time.
- Promote changes only if focused tests pass and broader regressions are understood; a green smoke test alone does not establish strength.

## Merge gates

1. Run `node --check` for modified JS and all new focused tests.
2. Run CPU policy/energy/strategic search regressions and paired benchmarks; inspect actual results rather than relying only on job success.
3. Review broad CI. If it fails, identify whether the failures are pre-existing on `main` or introduced by the PR.
4. Merge into `main` only after relevant checks pass and no material regression is identified. Verify the resulting `main` commit after merging.

## Working notes

- Make small commits with focused tests; avoid unrelated RPG fixes in the same change.
- Update this document with merged PRs, benchmark outcomes, and remaining blockers as phases progress.
