# Neo Campus TCG — v0.12.0: Authoritative targeting, Bench attacks, and extra costs

## Scope

This release **expands the independent, deterministic, serializable Node.js duel engine**. It does **not** replace the existing local browser duel rules engine. The browser UI remains available via `npm start` on `http://localhost:8000`.

The v0.11 portable interpreter handled **640 / 1,479** historical attack records. The v0.12 exact-text compiler handles **790 / 1,479 (53.4%)**; **689** remain explicitly unsupported, and none of these are approximated as generic damage. These counts refer to *recognition and compilation into headless effect programs*. They are **not** a card-by-card certification of historical fidelity, and some compiled attacks are blocked when their Pokémon Power, Special Energy, Stadium, or other prerequisite effect has not been migrated.

## Rules and behaviors migrated in v0.12

- **Owner-specific decisions:** the attacking player may choose an opposing target, while the defending player may be required to choose their own replacement mid-attack. This also works when the defender is not the player whose turn it is.
- **Pre-damage forced switching:** select and switch the new defender **before** applying the attack's damage (Flytrap family).
- **Post-damage forced switching:** apply damage first, then prompt the historically designated player to choose a replacement (Whirlwind/Lure families). Optional attacker switching supports decline, which still concludes the attack.
- **Bench targeting:** target one Benched Pokémon, choose any opposing Pokémon, and calculate Bench damage without Weakness/Resistance where printed.
- **Bench-wide effects:** own/opponent/both Benches, conditional side selection, conditional coin-flip damage, same-type Bench damage, and spread plus recoil/status.
- **Multi-KO resolution:** gather Knock Outs from **all Active and Benched Pokémon on both sides before discarding any**, take one Prize per knocked-out opposing Pokémon, then finish promotion queues and the turn.
- **Additional attack costs:** discard a specific number of selected attached Energy cards or all attached Energy cards. The normal attack action creates a choice when there are several ways to pay; validation rejects duplicates, stale/illegal targets, and insufficient payments without mutating the prior game state.
- **Damage formulas:** own/defending damage counters, own Bench count, half of remaining HP (round up to 10), several multi-coin damage formats, and attacks that ignore Weakness/Resistance.
- **Conservative Special Energy:** the headless path rejects unsupported attached Special Energy effects rather than silently omitting their modifiers. Double Colorless remains supported. This restriction applies to the new portable engine, **not** to the unchanged local legacy browser UI.

All effect recognition is anchored to the entire historical attack text. Unrecognized extra clauses remain unsupported.

## Verification

Commands from inside `neo-campus-work`:

```sh
npm start
npm test
npm run test:headless
npm run test:targeted
npm run audit:headless
npm run release:strict
```

- **100 original** seeded portable matches passed (994 attacks).
- **60 status-focused** portable matches passed (1,086 attacks, including 663 status attacks).
- **100 new targeting/Bench-focused** seeded portable matches passed (1,559 attacks, 942 choices, including 219 forced-switch decisions). Each match completed and maintained **exactly 60 cards per player**, verified after every accepted command.
- **19** direct rule-transition scenarios now cover timing, forced switching, Bench/Active KO, attacker-controlled selection, optional decline, Energy payment, current damage counters, side-specific spread, rejection without state mutation, and more.
- Legacy browser and authoritative-engine regression suites both pass.
- `HEADLESS_ATTACK_COVERAGE_v012.json` records each supported/unported attack card and its compiled kind.

## Remaining limitations / priorities

1. Still **689** attack records not compiled in the headless engine. Especially complex effects: multi-step interactions, delayed shields/locks, copying attacks, stadium interactions, card search and conditional deck effects, Trainers/Tools, and special Energy behavior.
2. Most Pokémon Powers and Trainers are still only handled by the legacy browser engine; the headless engine rejects unported prerequisites and only supports six basic Trainers.
3. The historical Trainer-fidelity gate still reports eight partial Trainer implementations in the legacy engine.
4. The actual browser UI is **not yet backed by the headless engine**. Until migration completes, local browser gameplay and the authoritative engine are separate execution paths; they must not be conflated.
5. The headless attack coverage figure is based on compilation, not exhaustive behavioral validation of all 790 records. Complex composite interactions and priority rules still need wider reference-based testing.

## Design direction

Preserve the authoritative engine as the single future source of truth for **local duels, invite-code duels, bots and eventual story/tag-team modes**. Prefer migrating complete effect families with end-to-end tests rather than adding individual browser-only patches. Free/easy web deployment stays a future packaging requirement; this release changes rules infrastructure, not hosting.
