# Neo Campus TCG v0.29 — All official theme decks through Neo Destiny

This release provides **28 original 60-card preconstructed theme decks** covering Base Set, Jungle, Fossil, Base Set 2, Team Rocket, Gym Heroes, Gym Challenge, Neo Genesis, Neo Discovery, and Neo Destiny. Neo Revelation has no official English theme decks. The two newly included Neo Destiny decks are **Dark** and **Light**.

- Start locally: `npm start` (Node.js 18+), then visit **http://localhost:8000/classic_live.html** to play against the CPU.
- For two-player online/local-browser matches, open **http://localhost:8000/online.html**. You can select any two official theme decks; private rooms and chat are preserved.
- Run the complete test suite with `npm test`. The dedicated new historical-theme checks run with `npm run test:themes:v029`.

This release includes the newly supported Dark/Light attack handlers, Pokémon Powers, Tools, Stadiums, Neo rules, Sabrina’s Psychic Control, Brock’s Rhydon Bench Guard, and Misty’s Tentacruel Flee. The client now displays Psylink copied attacks and the Energy Stadium action in both duel UIs. Gym/Neo mixes are legal in the same game; first-turn and trainer-specific Pokémon evolution restrictions remain enforced. Check `THEME_DECKS_V029.md` for details and test scope.

**Fidelity note:** Every attack/Power/Trainer card used by these 28 deck lists has a registered game handler, and the release passes the existing full suite plus new deck/reaction tests. Handler presence and seeded simulations do not prove that every rare timing interaction exactly matches the original card text; additional manual playtesting and comprehensive card-by-card edge-case verification are still recommended. The AI uses basic tactics, not a competitive strategy.

---

## NEW: Private online multiplayer (v0.22 preview)

Run `npm start`, then open http://localhost:8000/online.html to create or join a private duel.
On Windows, use `START_ONLINE_LOCAL.bat`; to invite remote friends for free, install `cloudflared` and run `SHARE_WITH_CLOUDFLARE.bat` in a second terminal. See **ONLINE_MULTIPLAYER_PREVIEW.md** for step-by-step instructions and caveats.

The previous CPU duel remains available at http://localhost:8000/classic_live.html.

---

# Neo Campus Classic (Base Set → Team Rocket)

The current playable format is **311 cards from Base/Jungle/Fossil/Team Rocket**. The complete historical archive remains bundled but later sets are not legal in Classic duels. This is a **preview**, not a fully verified 311-card engine.

Run `npm start` and open http://localhost:8000. Run `npm run test:classic` for focused tests and `npm run audit:classic` for remaining effects. See [CLASSIC_MILESTONE.md](CLASSIC_MILESTONE.md) and [CLASSIC_COVERAGE.json](CLASSIC_COVERAGE.json).

---

> **Engine architecture milestone (v0.10):** See [HEADLESS_MILESTONE.md](HEADLESS_MILESTONE.md) for the new authoritative game reducer, supported action families, room tests, 100 complete simulated duels, and the migration limitations. The browser duel remains a separate legacy rules path.

# Neo Campus TCG v0.6.3 — Reactive Trainer update

EXP.ALL now correctly lets a human player **decline** its optional Energy transfer on a Knock Out; Koga's Ninja Trick is discarded whenever its host switches to the Bench, and Chaos Gym avoids coin flips on several impossible Trainer plays. Seven new tests plus the full existing regression suite pass. See `TRAINER_RELEASE_V063.md`. The Trainer audit remains **168 handlers / 10 partial**; recognition is not complete rules verification.

## v0.6.1 — Trainer-interaction update

See `TRAINER_RELEASE_V061.md` for new Vermilion City Gym, Brock's Protection and Ecogym behavior, tests and unresolved partial effects.

## v0.6.0 — Trainer timing, defender decisions, and Fossil evolution fixes

This update focuses on **human-player rules correctness**, not AI strategy. It adds transactional Warp Point, Double Gust, Narrow Gym and New Pokédex choices; EXP.ALL choices at a Knock Out; the defending player’s Koga’s Ninja Trick response; an optional Charity damage reduction after Weakness and Resistance; expanded Chaos Gym rival replay; and tests for Stadiums, Gym evolution chains, and Fossil Egg / Mysterious Fossil special behavior.

**Current Trainer audit:** 178 records: **165 with tested/available handler paths, 13 still partial**. The counts report dispatch and focused outcomes, **not 100% historical correctness**. See `TRAINER_COVERAGE.md` and `TRAINER_RELEASE_V060.md`. All 1,479 attack and 166 Power records remain recognized, but their complex interactions are not exhaustively verified.

Run `npm test` for the complete Node.js regression suite and `npm run trainers:audit` for the Trainer status breakdown. The CPU remains a basic opponent.

## v0.5.8 — Trainer rules foundation (human gameplay first)

This update adds `trainer_rules_v058.js`, which introduces a reusable staged-choice
system for classic Trainer cards: cards/costs are committed only after the
required choices are completed. The game now supports Computer Search, Item
Finder, Pokémon Breeder, Professor Elm, Mary, Energy Retrieval, Super Energy
Removal, several Gym-era Trainer effects, and multiple Stadium/Tool effects.
The rival AI's Trainer strategy is deliberately postponed.

**Not complete:** 178 Trainer records are audited in `TRAINER_COVERAGE.md` and
`trainer_coverage.json`. `handler` means executable dispatch, not exhaustive
rules verification. `partial` and `stadium-placement-only` explicitly identify
unresolved mechanics. `npm run trainers:audit` regenerates both reports, and
`npm test` includes the new Trainer-choice regression tests.

Important original-era interactions that still need further work include Chaos
Gym, Ecogym across every attack/Power, some quiz and borrowed-Trainer effects,
complex Tools, and opponent choices during rival turns. The attack/Power
recognition reports remain as previously published; they are not proof of
100% cross-card rules accuracy.

# Neo Campus TCG v0.5.7 — Final historical Pokémon Power registry

**All 166 Pokémon Power card records now have named effect handlers** (136 distinct names). The attack recognition registry remains **1,479/1,479**. This **does not mean every combination is historically accurate**: read `COVERAGE_REPORT.md` for limitations.

This version implements the nine previously unrecognized records (eight distinct Powers): Electrode's **Buzzap** (two editions), Brock's Ninetales's **Shapeshift**, Light Dragonite's **Miraculous Wind**, Brock's Rhydon's **Bench Guard**, Misty's Tentacruel's **Flee**, Parasect's **Allergic Pollen**, Unown K's **[Keep]**, and Unown Q's **[Quicken]**.

Highlights: typed two-unit Energy replacement and Prize transfer for Buzzap; selectable Shapeshift Evolution cards; single-Colorless replacement of Special Energy while Miraculous Wind is active; damage redirection, incoming-attack reaction prompts, Energy-discard protection, and coin-based next-turn protection. [Quicken] can activate even during disabling Special Conditions. Special Energy can now be attached from hand, but secondary rules of every Special Energy have **not** been comprehensively validated.

**Run locally with Node.js:**

```bash
npm start
```

Open http://localhost:8000. To run all regression tests and update the recognition reports:

```bash
npm test
npm run cards:coverage
```

### Known rules-validation gaps

- Power/attack recognition measures implemented handlers, not exhaustively proven resolution. Some interactions between Pokémon Powers, attack copying, Trainers, and Special Energy can still differ from printed rules.
- Bench Guard is optional via a player-configurable redirect toggle, rather than a separate question for every damage event.
- Flee currently offers the human defender a response **after** attack resolution and restores direct damage-independent status and Energy changes. Some complex simultaneous or multi-target effects need further validation.
- Allergic Pollen protects discard cards through a general restore mechanism, but unusual effects with several simultaneous destinations require more testing.
- Complex cross-card protection, KO replacement, opponent target selection, and turn sequencing still require broader browser-based playtesting.
- Only eight historic theme decks are verified original retail lists; the remainder are labeled reconstructions.

---

# Neo Campus TCG v0.5.6 — Expanded Pokémon Powers

**157/166 historical Pokémon Power records are recognized**, up from 85 in v0.5.5. **9 records remain unrecognized**. Attack recognition remains 1,479/1,479. Recognition is not proof of complete historical rules correctness; see `COVERAGE_REPORT.md` for the missing Powers and limitations.

The browser game continues to run locally on Node.js. Run `npm start`, then open http://localhost:8000. Run `npm test` for the full regression suite, and `npm run cards:coverage` for updated card-effect audits.

---

# Neo Campus TCG v0.5.5

Historical attack recognition reached **1,479/1,479 card-attack records**. This is **not** the same as full rules verification; 81 historical Pokémon Powers still lack recognition, and some cross-card behavior remains incomplete. Read `COVERAGE_REPORT.md` for exact limitations and tests.

Run `npm start`, `npm test`, and `npm run attacks:audit`. The project uses Node.js; Python is not required.

# Neo Campus TCG v0.5.4 — Historical attack effects

Seven newly scripted attacks: Energy Bomb, Energy Control, Energy Cycle, Static Electricity, Attract Current, Stoke, and Evolutionary Spore. Includes interactive multi-card assignments and validated coin-flip outcomes. The source cache includes 1,123 historical cards; attack audit is 1,454 / 1,479 recognized, with 25 unsupported. Pokémon Power recognition is unchanged at 85 / 166. Run `npm start` for the local Node.js game, `npm test` for tests, and `npm run attacks:audit` for the report. See `COVERAGE_REPORT.md`.

---

# Neo Campus TCG v0.5.2 — Attack-copying foundation

**New in v0.5.2:** attack selection and execution for Metronome (Clefairy and Clefable), Mini-Metronome (Togepi), Super Metronome (Togetic), Sketch (Smeargle), Genetic Memory (Kingdra), and Mirror Move (Pidgeotto and Spearow). Fourteen historical card-attack records are newly recognized.

- Metronome/Sketch ignore the copied attack’s Energy requirement and mandatory additional discard costs; Mini/Super Metronome pay additional discard costs and check the coin flip once.
- Genetic Memory selects an attack from Kingdra's actual underlying evolution cards.
- Sketch requires the Defending Pokémon to have attacked on the previous turn while Smeargle was already in play.
- Mirror Move reuses the previously recorded damage result instead of recalculating Weakness or Resistance.
- All copied attacks are subject to a **limited compatibility allowlist** of already-implemented effect families. Attacks requiring more elaborate targeting or other unimplemented effects cannot be copied yet. Mirror Move currently tracks direct Active-Pokémon damage and major Special Conditions; unusual indirect and cross-card effects still need validation.

Run `npm start` to play, `npm test` to execute the full regression suite, and `npm run attacks:audit` to regenerate the coverage report.

# Neo Campus TCG v0.5.1

**New in v0.5.1:** 12 additional historically printed card-attack records implemented: attack-driven evolution (Lunar Power, Hatch, Sunbathe, Explosive Evolution), Squaredance and Jellyfish Pod deck searches, Super Removal, Pilfer, Twister, Group Attack, Char, and Perish Song. Shared multi-card choice UI, invalid selection safety and real outcome tests are included. See `COVERAGE_REPORT.md`. All 12 historical sets are bundled locally.


**Previous update v0.5.0:** 11 more historically printed attacks with timing-aware reactive attacks and optional targets, including Mirror Shell, Crosscounter, Counter, Fire Wall, Reflect Shield, Shadow Images, Secrete Poison, Giant Growth, Rushing Flames, and Sweet Scent. Click-based multi-Energy selection works for Rushing Flames; Sweet Scent selects the relevant damaged Pokémon after the coin flip. Temporary shields and counters have visible markers. See [COVERAGE_REPORT.md](COVERAGE_REPORT.md).

## Update: v0.4.8

This release adds 11 exact historical attack-record implementations. See `COVERAGE_REPORT.md` for details. Coverage is 1,389 / 1,479 attacks recognized and 85 / 166 Pokémon Powers recognized. `npm test` now includes `test_attack_batch_v048.js`.

## Version 0.4.7: 18 additional attack records

Includes interactive multi-target Bench attacks, Devolution Beam, Feint Attack, Wildfire, Baby Pokémon and Gyarados deck searches, coin-based status/healing/Energy removal, and Pranks. **1,378/1,479 attack records recognized; 101 unrecognized.** Pokémon Power coverage unchanged. See `COVERAGE_REPORT.md` and `test_attack_batch_v047.js`. To test, run `npm test`; to play, run `npm start`.

## Version 0.4.6: 22 more historical attack records

Adds 22 newly recognized card-attack records, including conditional switches, target selection, Energy movement, and the original Tentacle Wrap retreat surcharge. Cards with an optional Energy discard or a specific selectable Energy/attack use actionable selection prompts. Coverage: **1,360 / 1,479 attacks recognized**, **119 remaining**, **85 / 166 Pokémon Powers recognized**. Recognition is not proof of full historical correctness. See `COVERAGE_REPORT.md`, `batch46_targets.json`, and `test_attack_batch_v046.js`. Run `npm test` and `npm run effects:audit` to verify the local cache.

## Version 0.4.3: 100 historical attack records

100 additional attacks are now recognized by exact printed card text and have executable effect handlers. See `COVERAGE_REPORT.md` and `batch43_targets.json` for details, `npm test` for regression tests and `npm run effects:audit` for full catalog audit. 1,247/1,479 attacks are recognized, and 232 remain unsupported. These recognition numbers are not a promise of complete historical correctness.

## v0.4.0 deck + evolution update

- Eight source-verified retail theme decks: four Base Set, Power Reserve and Water Blast (Jungle), Cold Fusion and Hotfoot (Neo Genesis). Remaining 20 are still explicitly labeled reconstructions.
- Reconstructed decks originally contained only Basic Pokémon, so they could not evolve.
- The CPU now attempts legal evolution from its hand before attaching Energy or attacking, with visible steps.
- Card data is loaded from existing bundled JSON files; no network requirement.

# Neo Campus TCG v0.3.9 — testing checkpoint

## v0.3.9 — Basic Energy classification fix

- Fixed imported Basic Energy cards being incorrectly classified as Basic Pokémon because of a conflicting upstream `stage: Basic` field.
- Explicit Energy category now takes precedence in the importer, and the runtime repairs already-cached affected records automatically.
- Basic Energy cannot be placed on the Bench and can be attached normally to Active or Benched Pokémon.
- The regression uses the previously broken Water Energy record shape; all 19 test programs pass.

## v0.3.8 — Energy attachment UI fix

- Basic Energy can be attached with explicit **Attach to Active/Bench** action buttons after selecting it in hand.
- The existing select-Energy-then-click-Pokémon interaction remains available.
- Added a regression test for attaching Basic Energy to both Active and Benched Pokémon; all 19 test programs pass.
- Special Energy remains locked until its printed effects are implemented.

## v0.3.7 — current systematic implementation checkpoint

- Current strict audit: **1,135/1,479 attacks** and **85/166 Pokémon Power occurrences** have executable handlers.
- Added further reusable Energy, coin, targeting, healing, deck/discard, recoil, protection, switching, and triggered-Power mechanics.
- Added `test_catalog_phase2.js` and `test_power_triggers_phase3.js`; all 18 test programs pass.
- The official latest errata is used for documented mistranslations; otherwise the English printed text is authoritative.
- Unsupported effects remain locked and listed in `effect_manifest.json`.

This ZIP is an in-progress testing checkpoint, not the requested 100% final build.

## v0.3.6

## v0.3.6 — systematic effect-engine expansion

- Expanded executable attack coverage to 980/1,479 and Pokémon Power coverage to 73/166.
- Added persistent retreat locks, accuracy checks, damage amplification, attack locks, damage thresholds, attack boosts, severe Poison, dynamic HP, triggered evolution and Knock Out effects, and additional switching/targeting paths.
- Added human UI actions and initial CPU use for several activated Powers.
- Added a historical correction overlay for incomplete upstream Power records without changing the bundled source files.
- Added `test_catalog_expansion.js`; all 16 test programs pass.

This remains an in-progress checkpoint and does not claim full historical completion.

## v0.3.5 — catalog expansion and honest coverage gate

- Added executable reusable attack families for damage-counter scaling, Bench-count scaling, flip-until-tails damage, alternate coin damage, Weakness/Resistance bypass, retreat locks, Smokescreen-style accuracy checks, opposing Energy discard, and own-Bench damage.
- Added persistent per-Pokémon state for attack effects that survive the turn boundary.
- Added regression coverage in `test_effect_expansion.js` and retained all earlier tests.
- `effect_manifest.json` is regenerated from all 1,123 bundled cards. Current measured status is **800/1,479 attacks recognized** and **33/166 Pokémon Powers recognized**. Recognition is not claimed as exhaustive correctness.
- Unsupported effects remain visibly locked. See `COVERAGE_REPORT.md`; this build deliberately does not claim the requested 100% completion.

## Defensive attack fix
Fossil Grimer Minimize can now be used with a single Grass Energy. It prevents 20 attack damage on the opponent’s next turn, after Weakness and Resistance. An on-card shield marker shows the temporary effect. The AI now assigns defensive moves a positive utility score. Exact-text reusable damage reduction patterns are supported; this does not imply all historical defensive attacks work.

# Neo Campus TCG — Prototype v0.1.1 (Node.js)

## Run (no Python and no npm dependencies)

Requires Node.js 18 or newer.

```bash
npm start
```

Open **http://localhost:8000** in a browser. Alternatively, `node server.js`.

## Cache every card through Neo Destiny

With an internet connection, run once:

```bash
npm run cards
```

This downloads the 12 historical card-set JSON files to `cards/`. The game first tries local copies and then falls back to fetching from GitHub, so you can play online without downloading first. Card artwork comes from external image URLs and may still need internet.

Optional custom port (macOS/Linux): `PORT=3000 npm start` or (PowerShell): `$env:PORT=3000; npm start`.

## Included card sets

`base1` to `base5`, `gym1`, `gym2`, `neo1` to `neo4`, `basep` (Wizards promo).

## Prototype limitations

The archive includes the complete printed card records for those sets, but the engine **does not yet implement every attack, Trainer, Pokémon Power, special Energy, and Baby Pokémon mechanic**. Unsupported effects are explicitly disallowed. The CPU and sample decks are basic. This is the TCG-only foundation for the future school-life game.

Data: https://github.com/PokemonTCG/pokemon-tcg-data

## v0.1.3: Opening setup

Before a duel, select your Active Pokémon and optional starting Bench from the seven-card hand. Click any chosen Pokémon to undo; confirm to start. The CPU sets up automatically but remains hidden until confirmation. Opening hands without a Basic Pokémon are reshuffled and redealt (mulligans). The more detailed historical opponent-extra-card mulligan procedure is not yet implemented.


### Duel UI (v0.1.3)

- Coin-flip animation with heads/tails result for coin checks already supported by the engine.
- Attached Basic Energy is shown as a per-type icon below each Pokémon, with hover text.
- Poison, Burn, Sleep, Paralysis, and Confusion show small condition badges on Pokémon.
- To attach Energy, click the Energy in your hand and then click your Active or Benched Pokémon. Targets highlight; normal once-per-turn restriction applies.
- Coin-flip animation is visual feedback; game logic resolves immediately, not after the animation.

Other unsupported historic card effects remain unsupported.


## v0.1.4: Duel feedback and AI
- Rival turns now unfold in readable stages, with on-screen banners and card animations for setup, Energy attachment, and attacks.
- Fossil Hitmonlee Stretch Kick correctly damages a chosen opponent's Benched Pokémon for 20, ignoring weakness and resistance. The human player chooses a target; the AI evaluates opponent Bench targets, including likely Knock Outs.
- Benched Pokémon can now be Knocked Out and award prizes. The AI ranks valid attacks by damage, possible Knock Out, and status impact instead of choosing from Active-only numeric damage.
- The engine still does **not** implement every historical card effect, and only a subset of Bench-targeting attacks are supported.

## v0.2.1 update
- Battlefield animations for Energy attachments and attacks (animated projectile, damage callout, and impact).
- Fossil Lapras Water Gun now supports its original 1-Water cost and +10 per extra Water Energy, up to +20.
- `npm test` checks Stretch Kick and Water Gun regressions.

## v0.2.2 — Sequential CPU turns

The CPU now runs a staged timeline (bench → Energy → attack → damage/coin resolution → turn end) and awaits battlefield animation promises before continuing. A centered action banner identifies the current step. New Duel cancels obsolete sequences using match generations.

## v0.2.3

- Switch now highlights your Bench and lets you choose the incoming Active Pokémon.
- Gust of Wind highlights the opponent Bench and lets you choose the incoming Active Pokémon.
- A cancel button leaves the Trainer card in hand, and invalid targets cannot consume it.
- Attached Energy cards show a miniature stacked-card indicator alongside Energy-type badges.
- Attacks have type-themed battlefield projectile icons and glow effects.
- Prize-taking creates a trophy animation after a Knock Out.
- Added targeted regression tests for Switch and Gust of Wind.

Visual effects are experimental and have not been verified in a full browser playthrough.


## v0.2.4: Targeting and historic deck picker

- 28 selectable English theme deck *identities* from Base Set to Neo Destiny (Neo Revelation released no theme decks).
- **Caution: these are generated, playable 60-card reconstructions, not the verified original retail decklists**. Exact recipes need dedicated curation. The game only scripts a subset of original card effects, and historical gameplay is not yet complete.
- Shared click-to-target flow for Switch, Gust of Wind, Potion, Super Potion, Energy Removal, manual Retreat and Stretch Kick. Click a highlighted Pokémon and cancel without spending the card.
- `npm test` runs the additional targeting regression checks.

## Original theme deck accuracy (v0.2.5)

- **Verified original retail 60-card lists**: Base Set **Blackout, Brushfire, Overgrowth, Zap!**, with exact Base Set card numbers and quantities. Source: https://www.pokebeach.com/tcg/base-set/theme-decks
- Other 24 selectable deck identities remain **playable reconstructions**, prominently labeled in the selector. We have NOT claimed they are original lists.
- Exact deck composition does **not** imply full card effect support: unsupported attack and Trainer effects still require implementation.
- Run `npm test` to check the original deck recipes, 28 theme labels, attack regressions, and targeting regressions.

## Gameplay correctness update (v0.2.6)
- Evolution keeps all previous stages underneath the Pokémon instead of discarding them immediately. A Knock Out discards the entire evolution line and attached Energy.
- Damage uses printed Weakness multipliers and Resistance reductions, with zero as the minimum damage.
- Paralysis expires after the affected player's own turn, not after either player's turn; a Pokémon switching to the Bench has its special conditions cleared.
- Additional scripted attack patterns: draw a card, conditional coin-flip draw, and flip-N-coins damage-per-heads (when the printed text matches the supported wording exactly).
- `npm test` includes a dedicated regression suite for evolution, Knock Outs, status duration, and damage calculation.

**Still incomplete:** This remains a partial historical rules implementation, not a complete Base-to-Neo Destiny simulator. Many attack/Pokémon Power/Trainer scripts, player-controlled Prize selection, post-KO Active replacement selection, and Special Energy behavior still need work. The other 24 theme-deck lists remain reconstructions.

### v0.2.7 — Early Pokémon Powers and original attack behavior
- **Rain Dance (Base Set Blastoise):** Select Water Energy in hand, choose **Rain Dance**, then click a Water Pokémon. Repeat as often as you like; normal one-Energy-per-turn allowance is unchanged. Works from the Bench and is disabled while Blastoise is Asleep, Confused, or Paralyzed.
- **Energy Trans (Base Set Venusaur):** Use the **Energy Trans** action, click the Pokémon holding Grass Energy, then the destination Pokémon. May be repeated and works from the Bench. It moves one basic Grass Energy per use.
- **Energy Burn (Base Set Charizard):** Use **Energy Burn** before attacking to treat Charizard's attached Energy as Fire for the current turn.
- **Hydro Pump (Base Set Blastoise):** 40 damage plus 10 per Water Energy beyond its 3-Water cost, up to 60 total.
- Added `test_powers.js` to the Node.js test suite.

These are *incremental* implementations, not full Base Set coverage. Remaining limitations include automatic CPU usage of Pokémon Powers, per-card choices for attacks that discard arbitrary Energy, and many unique attacks and persistent Pokémon Powers. Browser animation verification is still outstanding.


## v0.2.8 Pokémon Power work — incomplete catalog

This release adds a shared Power-suppression framework and further interactive/continuous Powers. The implemented registry is inside `engine.js` and each card's details label its Power **supported** or **not scripted**. We have **not** completed every Power through Neo Destiny; the other attacks and Trainers also remain partly unsupported.

Run `npm run cards` followed by `npm run powers:audit` to generate `power_coverage.json` from the cached full card database. This file lists every card containing an ability and explicitly shows missing Power scripts. The archive couldn't be fetched in the development environment, so a complete per-card report can't be supplied in this ZIP. Powers currently supported include Rain Dance, Energy Trans, Energy Burn, Damage Swap, Strikes Back, Invisible Wall, Thick Skinned, Prehistoric Power, Toxic Gas, Hay Fever, Retreat Aid, Kabuto Armor, Transparency, Heal, Curse, Step In, and Strange Behavior. Some edge cases, combined effects, and AI Power usage are not yet implemented.


## v0.2.9 attack scripting and audit

Attack support is **partial**. The conservative attack interpreter now recognizes additional exact attack-text patterns, including drawing multiple cards, healing damage counters, recoil, discarding attached Energy, and existing classic attack patterns. Complex attacks (deck searches, persistent effects, target choices, attack copying, etc.) are still unsupported.

Run `npm run attacks:audit` **after** `npm run cards` to generate `attack_coverage.json`, containing every unsupported attack found in the cached database. If the cache is absent the audit scans zero cards and reports the limitation.

This release does **not** mean all Base–Neo Destiny attacks are faithful or implemented.

## v0.3.0 — choice-driven attack effects

The attack interpreter now supports four additional *strictly matched* attack text templates:
- Search your deck for a Basic Pokémon or Pokémon, reveal it, put it into your hand, and shuffle. The human chooses via buttons in the duel action panel. CPU uses the first eligible match.
- Choose an opposing Benched Pokémon for damage with no Weakness/Resistance.
- Deal damage to every opposing Benched Pokémon, with individual KOs/Prizes resolved.

Unsupported templates remain locked and are enumerated with `npm run attacks:audit`. This is not a full Base–Neo Destiny attack implementation. New tests: `test_attack_choices.js`.

## v0.3.2 — TCGdex source-of-truth importer and effect manifest

**Card data now comes from TCGdex v2**, not the old GitHub repository. Run `npm run cards` while connected to the Internet. The downloader fetches set listings and each card's **full** record, normalizes it to the existing engine's schema, and caches each set in `cards/*.json` for offline matches. Downloads are rate-limited via a small concurrency pool, retried on failure, and atomically saved to avoid damaging an existing complete set.

Then run `npm run effects:audit` to build `effect_manifest.json`, containing card-by-card attacks, Pokémon Powers, whether the current engine recognizes each effect, and grouped missing-effect families. This report needs the card cache to be meaningful. Use `npm test` to validate the card adapter and current engine.

The importer does **not** execute arbitrary card text, and an imported card is not automatically fully playable. More scripted effects, historical-rule choices, and integration tests remain necessary. The development environment could not reach the live TCGdex endpoint, so the full-set download and catalog counts have **not** been verified here. The loader keeps the existing static offline cache format; simply run `npm run cards` once to populate it.


## v0.3.3 — Included offline TCGdex card cache

All twelve user-provided historical set files (1,123 cards) are included under `cards/`. You no longer need to run `npm run cards` or have an internet connection to load these sets. Run `npm run effects:audit` to regenerate `effect_manifest.json` against the actual bundled files, and `npm test` for regressions.

New attack mechanics: Psychic-style bonus damage per Energy attached to the defender, coin-flip damage prevention (Scrunch), while full prevention-of-effects attacks remain flagged unsupported. These are targeted historical templates, not blanket support for all attack text. The supplied data contains some errors/transcription variations; every effect still requires tests.

## v0.3.4 — protective and recovery attacks

Using the bundled TCGdex card records, implemented narrowly matched attack-text patterns for Agility/Detect-style coin-flip protection against both damage and non-damage attack effects; Barrier (Energy discard and complete attack protection); Recover (Energy discard and full healing); Nap Time (full healing and Sleep); and Light Screen (halve incoming attack damage, round down to tens). CPU attack evaluation now considers defensive moves and recovery. Added `test_protection_and_recovery.js` using actual imported cards. All existing tests and effect manifest are regenerated.

**Limitations:** Discarding Energy currently uses the existing engine's automatic attachment choice, rather than asking which attached Energy to discard. Other historical attack texts, including conditional variants of these effects, are still unsupported unless their full printed wording matches an implemented pattern. The manifest's 'recognized' count is *not* a correctness certification. Full browser regression testing is still pending.

### v0.4.1 — attack effects

Implemented and regression-tested **Erika's Vileplume — Mega Drain**, **Lt. Surge's Magneton — Mega Shock**, and **Dark Weezing — Mass Explosion**, using bundled historical cards and including self/Bench damage where applicable. Use `npm test` to verify. The full card catalog remains partially implemented; attack recognition does not guarantee exhaustive correctness.


## v0.4.4: additional historic attack effects

Adds 65 previously unsupported exact-text attack records and explicit tests for Energy discard/attachment locks, coin flips, damage manipulation, spread damage, mill and healing, power suppression and defensive effects. 1,312/1,479 attacks are now recognized. 167 attack records and 81 Pokémon Powers remain unsupported. Recognition does not prove all edge cases are authentic. See `COVERAGE_REPORT.md` and `batch44_targets.json`.

## v0.4.5 — targeting, searching, status and damage mechanics

Added 26 strictly identified historical attack records, with player-selectable opposing/friendly Pokémon targets and optional deck/discard card selection where scripted. Includes Flame Jet, Magic Darts, Slime, Stun Wave, Thundersquall, Healing Water, Call for Family, and Guiding Flame. Added an outcome-focused test suite. The project still has 141 attack records and 81 Pokémon Powers unrecognized and is not yet a complete historical rules simulator. See `COVERAGE_REPORT.md`.


### v0.5.3 — seven more original attack records

Added Bonfire, Call of the Night, Invigorate, Eerie Howl, Provoke, Prehistoric Water, and Helping Hand, with required user choices, AI fallback choices and prepared-match tests. `npm run attacks:audit` now reports **1,447 of 1,479 attacks recognized**, with 32 still unrecognized; Power coverage remains **85 of 166**. Recognition is an interpreter audit, not a guarantee of cross-card rules accuracy.

## v0.5.9 — Trainer interactions and unfinished cases

**Start here:** `TRAINER_RELEASE_V059.md` and `TRAINER_COVERAGE.md`.
All 178 Trainer records now have a dispatch path, but some are still **partial** (see the current top-of-file audit). This is *not* a claim of complete historical Trainer-card functionality. The new version adds both missing Blaine quizzes, Lt. Surge's Secret Plan, Sabrina's Psychic Control, basic Chaos Gym interception, enemy-owned choices, and fixes for attached Tools and Energy-removal interactions. Run `npm test` to execute the expanded regression suites.


## v0.6.2 — cross-card Trainer corrections

See `TRAINER_RELEASE_V062.md` for tested Pokémon Tower, Blaine’s Quiz #1, and Lt. Surge’s Secret Plan fixes. Historical Trainer recognition is **168/178 handler records** and **10 partially verified records**. `npm test` includes `test_trainer_v062.js`. Full rules fidelity is not yet verified.


## v0.6.4 Trainer timing progress

Added optional full-set Sabrina's ESP rerolls and transactional Sabrina's Psychic Control replay targets, plus Counterattack Claws KO tests. See `TRAINER_RELEASE_V064.md` for scope and outstanding issues. Trainer audit marks 170 records with handlers / 8 partial; full historic rules fidelity has not been certified.
