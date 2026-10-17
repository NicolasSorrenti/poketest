# Neo Campus TCG — v0.12 portable targeting, forced switches and attack payments

## Delivery scope
This release expands the portable `headless_duel.js` engine, **not** the existing browser UI rules engine. The browser game remains playable through `npm start`, but it is still powered by the legacy engine. It would be inaccurate to claim complete parity or 100% historical fidelity.

## Verified progress
- 704 / 1,479 historical attack records have recognizable portable programs (47.6%); up from 640 / 1,479 in v0.11, an increase of **64 records**.
- **46 newly compiled attack records** involve:
  - Attacker-chosen Bench damage (10)
  - Damage to own Bench (5)
  - Selfdestruct including both Benches and recoil (8)
  - Randomly chosen side to suffer Bench spread (4)
  - Opponent choosing a forced switch after damage (11)
  - Attacker choosing an opponent switch (6)
  - Attacker switching own Active (2)
- **18 newly compiled attack records** have printed mandatory attached-Energy discards. A legal user selection is required if multiple payment combinations exist, including multi-card Fire Energy costs.
- Active and Benched Pokémon KOs are processed together. Each KO awards the appropriate Prize; replacement-active decisions remain owned by the defending player. Bench damage does not apply Weakness and Resistance.
- Defender's forced-switch choices are offered **during the attacker's turn**, *after* damage and KO resolution. If only one legal Bench target exists, the switch is automatic.
- Headless action execution is transactional: invalid choices do not mutate the match, and decisions are private to their owning player.
- Special Conditions block attacking before an irrelevant targeting or Energy-payment prompt can open.
- Compiler support **does not guarantee** every corresponding card can be used in the headless engine: a card with an unported in-play Pokémon Power (e.g. some Gengar printings) is still explicitly refused.

## Test results
- `npm test`: **pass** (complete pre-existing project regressions plus the new suites).
- `npm run test:headless`: **pass**.
- New targeted tests: **17 complete command-path scenarios**, including payment, status, Bench KOs, self-destruct, both target controllers, Pokémon replacements and rollback.
- New complete matches: **60 seeded historical-card duels**, **1,821 attacks** (308 targeted Bench hits; 408 Whirlwind); **721 opponent-turn choices**; both decks maintained exactly 60 cards through all checked steps.
- Prior suites retained: 100 baseline + 60 status-heavy complete matches. Total **220 complete seeded headless games** across the suites (each uses supported deck subsets, not every card).
- `npm run audit:headless`: **704 supported effect patterns, 775 unported**. See `HEADLESS_ATTACK_COVERAGE_v012.json`.
- `npm run release:strict`: **intentionally fails** on eight historically incomplete Trainer effects. No claim of full rules certification.

## Run
```
npm start
npm run test:headless
npm run test:targeted
npm run audit:headless
```
Browser: http://localhost:8000 (legacy rules UI).

## Known limitations
- The new portable game engine has not yet replaced the browser UI's rules authority.
- 775 historical attack records still lack portable effect programs; all Pokémon Powers and most complex Trainers remain unported to the headless runner.
- Special Energy, Tools, Stadiums, protections, extra effect timings, and alternate win/sudden-death conditions still require rigorous migration and verification.
- Historical wording was matched conservatively. A recognized card effect is not a declaration of end-to-end fidelity under every possible interaction.
- The next larger goal remains migrating substantially more effects, then binding the real duel UI to the same authoritative action system.
