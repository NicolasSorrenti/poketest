# v0.5.8 — Trainer coverage status

A separate **178-record Trainer** audit is now available in `TRAINER_COVERAGE.md`
and `trainer_coverage.json`. See those files for the complete card-by-card
status. Existing attack/Power recognition totals below remain unchanged and
must not be interpreted as 100% rules accuracy. Trainer rules are the primary
workstream; AI Trainer use will be addressed separately.

# Neo Campus TCG v0.5.7 — Pokémon Power handler coverage

| Metric | v0.5.6 | v0.5.7 |
|---|---:|---:|
| Historical cards | 1,123 | 1,123 |
| Attack records with recognized handlers | 1,479 / 1,479 | **1,479 / 1,479** |
| Pokémon Power records with recognized handlers | 157 / 166 | **166 / 166** |
| Pokémon Power names with recognized handlers | 128 / 136 | **136 / 136** |
| Missing recognition mappings | 9 | **0** |

**Scope:** Implemented the eight remaining distinct Power names, covering nine printed card records. The new `test_power_final_v057.js` contains 68 scenario assertions including both Electrode prints, card-choice validation, actual attack events, KO/Prize accounting, defense, damage redirection, and suppression. All pre-existing suites remain part of `npm test`.

**Details:** Buzzap, Shapeshift, Miraculous Wind, Bench Guard, Flee, Allergic Pollen, [Keep], and [Quicken]. Corrections for Parasect's imported blank description were retained from the prior release.

**Rules caveat:** A registered handler is not a proof of all-time historical authenticity. Optional Bench Guard is configured by a toggle, not a per-damage choice; Flee's reaction flow is applied post-attack and unwinds direct effects; Allergic Pollen's discard protection reconciles card locations and has not been verified for every simultaneous card interaction. Secondary effects of Special Energy, stage-changing attacks and multi-step Trainer interactions need further regression testing. Full graphical playthrough remains unverified.

Run `npm test` and `npm run cards:coverage` locally to recheck.

---

# Neo Campus TCG v0.5.6 — Pokémon Power expansion

| Coverage metric | v0.5.5 | v0.5.6 |
|---|---:|---:|
| Historical card records | 1,123 | 1,123 |
| Attacks recognized | 1,479/1,479 | **1,479/1,479** |
| Pokémon Powers recognized | 85/166 | **157/166** |
| Power records still unrecognized | 81 | **9** |

**Scope:** Expanded the reusable Power activation framework, live UI card-choice prompts, triggered on-play and switch effects, continuous Power hooks, and normalized `Pokemon Power` / `Poke-POWER` / `Pokémon Power` text. Added corrections to verified missing text in local card records. New direct regression tests exercise event timing, mandatory and optional choices, damage, switches, Energy movement, and evolution effects.

### Examples implemented or wired in this pass

- **Summon Minions, Surprise Bite, Sneak Attack, Reel In** on entering play.
- **[Increase], [Engage], [Perform], Tag Team, Gift, Howl, Lightning Burst** with player prompts where required.
- **Drive Off**, with a defending-player selection when the rival activates it.
- **Special Delivery, Shift, Submerge, Energy Converter**, and multiple Unown interactive Powers.
- **Spikes, Sinkhole, Bolt, Energy Evolution, Chain Reaction, Scram**, and switching-related event hooks.
- Power lookup now accepts historically inconsistent TCGdex type spelling instead of silently ignoring eligible Powers.

### Unrecognized Power records (9)

- **Buzzap** (Base Set and Base Set 2 Electrode; 2 records) — self-KO into Energy with dynamic typed Energy and correct card-zone accounting.
- **Shapeshift** (Brock's Ninetales) — replace the Pokémon identity with an attached Evolution card and manage the special restrictions.
- **Miraculous Wind** (Light Dragonite) — needs full historical Special Energy support, currently incomplete in this game.
- **[Keep]** (Unown K) — global protection against Energy removal from Unown.
- **[Quicken]** (Unown Q) — all effects and damage prevention across varied targeting systems.
- **Allergic Pollen** (Parasect) — global immunity of discard piles to both attacks and Powers.
- **Bench Guard** (Brock's Rhydon) — optional redirection of Bench damage across all damage paths.
- **Flee** (Misty's Tentacruel) — optional switching after damage, before remaining effects resolve.

The `power_coverage.json` and `attack_coverage.json` files provide machine-readable recognition data. **Recognition is not a guarantee of exhaustive rules fidelity**. Some previously recognized effects still rely on heuristic AI choices, and full graphical playthrough verification is pending. Never treat this release as 100% Pokémon Power completion.

### Validation

Run `npm test` (the full historical regression set, including the new `test_power_batch_v056.js` test), `npm run powers:audit`, and `npm run attacks:audit`. The test suite includes direct checks for the newly added effect paths and earlier attack/evolution behavior.

---

# Neo Campus TCG v0.5.5 — Final historical attack-recognition pass

| Metric | v0.5.4 | v0.5.5 |
|---|---:|---:|
| Historical card records | 1,123 | **1,123** |
| Historical attack records | 1,479 | **1,479** |
| Recognized attack effects | 1,454 | **1,479** |
| Unrecognized attack records | 25 | **0** |
| Recognized Pokémon Power records | 85 | **85** |
| Unrecognized Power records | 81 | **81** |

### Attack handlers added

- Black Star Promo Meowth — **Cat Punch**: Heads attacks Active; Tails lets the defending player choose a Benched Pokémon, without Weakness or Resistance.
- Cool Porygon — **Texture Magic**: optional type choices for temporary Resistance and opposing Weakness, ending when the affected Pokémon goes to the Bench.
- Birthday Pikachu — **Birthday Surprise**: an explicit **Trainer birthday today** option on the deck-selection bar determines whether the bonus flip happens.
- Promo Smeargle — **Paint**: choose and track a Coloring counter and replacement type on Heads.
- Erika's Clefable — **Fairy Power**: on Heads choose any number of own Pokémon to return with evolution stacks and attachments.
- Sabrina's Mr. Mime — **Sleight of Hand**: return up to three selected hand cards to the deck; retrieve Basic Energy chosen from the updated deck.
- Koga's Pidgey — **Messenger**: shuffle Pidgey and attachments into the deck; choose another Pokémon from the deck.
- Misty's Psyduck — **ESP**: preserve three coin flips and branch into draw, damage, or a supported copied attack.
- Houndour — **Plunder**: discard attached Trainers before damage; affects Defender and other Trainer cards.
- Pupitar — **Dust Devil**: damage all non-Fighting Pokémon in play; independently verified missing Fighting symbol.
- Sneasel — **Swipe**: on Heads discard attached Trainers across the opposing field.
- Suicune — **Crystal Wave**: damage bonus on Heads; on Tails defending player selects a replacement from their Bench after damage.
- Aipom — **Grab**: choose an opponent's attached Trainer and shuffle it into its owner's deck.
- Shining Gyarados — **Devastate**: select two attached Energy to discard; apply Active and Bench damage; choose an opposing Energy per Pokémon on Heads.
- Shining Magikarp — **Gold Scale**: opponent chooses whether to draw, then attacker draws.
- Dark Donphan — **Tusk Toss**: on Heads return the Defending Pokémon and attachments to hand; on Tails defending player chooses replacement.
- Light Azumarill — **Bubble Jump**: select recipient for two Energy before returning Azumarill to hand on Heads.
- Light Togetic — **Sweet Kiss**: defending player can accept or decline the optional draw.
- Light Ledian — **Flash Touch**: select friendly Bench replacement; block new Special Conditions until it leaves Active.
- Light Piloswine — **Knock Over**: optional Stadium discard.
- Dark Haunter — **Call Back**: select a legal Basic/Baby Pokémon in opposing discard and Bench it with one damage counter, respecting both Bench limits.
- Light Golduck — **Flipper Stroke**: each player independently chooses up to three top-deck Basic Energy to keep, then shuffles.
- Light Slowbro — **Fish Out**: each player independently chooses up to three Pokémon from their discard pile to shuffle back.
- Light Venomoth — **Mysterious Wing**: each player can independently retrieve an eligible Pokémon from their discard pile.
- Light Wigglytuff — **Evolution Song**: each player chooses whether to evolve one Pokémon with a compatible deck card.

### New infrastructure

- Opponent-decision prompts during the CPU's turn pause the attack until the human responds. Mandatory prompts cannot be dismissed without answering.
- Attached Trainer state on Pokémon. Defender, PlusPower, Focus Band, Berry, and Gold Berry can be attached through the existing Trainer UI. A matching effect may discard or shuffle attached Trainers.
- Stadium play/discard state, with Knock Over supporting actual Stadium cards.
- Compact attached-Trainer and temporary-effect markers in the duel field.
- `test_attack_batch_v055.js` runs 34 constructed duel scenarios and outcome checks, including negative choices, two-player choices, coin flips, Trainer attachments, and deck manipulation.

### Quality boundary — important

**The 1,479/1,479 result is attack _recognition_**, based on executable dispatcher selection. It is **not yet verified 100% authentic Pokémon TCG gameplay**. Some attack-copying choices are still restricted to engine-supported copy outcomes; some historical Trainer and special-Energy interactions need work; counterplay, protection, KO timing and status-rule edge cases require exhaustive combination tests. New persistent/attached-Trainer systems may also need additional historical rulings and UI refinement. The 81 still-unrecognized Pokémon Powers are a separate major milestone.

The automated test suite is a regression suite plus targeted prepared-duel tests, not an exhaustive combinatorial or fully visual browser test. To run it: `npm test`. For coverage: `npm run attacks:audit` and `npm run powers:audit`.

---
# Neo Campus TCG v0.5.4 — Seven additional historical attacks

| Metric | v0.5.3 | v0.5.4 |
|---|---:|---:|
| Cached historical cards | 1,123 | **1,123** |
| Attack records | 1,479 | **1,479** |
| Recognized attacks | 1,447 | **1,454** |
| Unrecognized attacks | 32 | **25** |
| Recognized Pokémon Power records | 85 | **85** (unchanged) |

## New executable attack records

- **Dark Electrode — Energy Bomb** (`base5-34`): deals its printed 30 damage, then distributes **all** attached Energy cards to explicitly selected Benched Pokémon, preserving individual cards; discards all Energy if no Bench exists. Invalid assignments do not consume the attack.
- **Mewtwo — Energy Control** (`basep-12`): flip once, then on Heads choose a **basic** Energy card on an opposing Pokémon and another opposing Pokémon to receive it. Retried selections reuse the same flip.
- **Xatu — Energy Cycle** (`neo2-52`): deals 10 damage; on Heads choose an Energy card on the Defending Pokémon and an opposing Benched recipient.
- **Mareep — Static Electricity** (`neo1-65`): optionally attach a Lightning Energy from your deck to each Mareep in play, including your opponent's Mareep. Card-to-recipient assignments must be distinct and are validated before resolution; shuffle afterward.
- **Ampharos — Attract Current** (`neo3-1`): deals 20 damage, flips three coins exactly once, and optionally searches for up to one Lightning Energy per Heads to attach to your Lightning Pokémon; shuffle afterward.
- **Ho-Oh — Stoke** (`neo3-7`): optionally search for a **Fire Energy** (not a generic Energy), attach to Ho-Oh, and shuffle.
- **Jumpluff — Evolutionary Spore** (`neo3-9`): choose any eligible Hoppip/Skiploom and unique compatible Evolution cards from the deck, evolve them in one attack, and shuffle; on-play effects are triggered.

Stoke and Static Electricity had missing printed Energy symbols in TCGdex data and were cross-checked against independent historical card references. This update preserves all prior UI and CPU turn animations.

`npm test` includes `test_attack_batch_v054.js`: direct match-state assertions for validated choices, movement, cost handling, coin outcomes, damage, discard, searching, and multi-evolution. The previous suite remains green. The manual browser playthrough and exhaustive combination tests are still outstanding.

**Audit caveat:** The recognition figure means the engine dispatches to an effect handler. It does not mean full, independently validated card/rule accuracy. 25 unrecognized attacks and 81 unrecognized Pokémon Power card records remain; Trainer, special Energy, and cross-card interactions are still incomplete.

---

# Neo Campus TCG v0.5.3 — Attack-effect coverage

| Metric | v0.5.2 | v0.5.3 |
|---|---:|---:|
| Cached card records | 1,123 | **1,123** |
| Attack records | 1,479 | **1,479** |
| Recognized attacks | 1,440 | **1,447** |
| Unrecognized attacks | 39 | **32** |
| Recognized Power records | 85 | **85** |
| Unrecognized Power records | 81 | **81** |

## Seven new card-specific implementations

- **Blaine's Charmeleon — Bonfire**: flip three coins, choose exactly one attached Fire Energy per Heads, and distribute unmodified damage to the opposing Active and Bench. The same flip result is retained while the player chooses which Energy to discard.
- **Sabrina's Gengar — Call of the Night**: deal damage first; if the defender survives, flip twice and potentially shuffle it, its evolution stack, and Energy into its owner's deck. No Prize is collected for shuffling the Pokémon.
- **Sabrina's Hypno — Invigorate**: choose a Basic Pokémon from either player's discard pile and place it on that owner's Bench with half of its maximum HP in damage counters, rounded down to tens.
- **Dark Houndoom — Eerie Howl**: inspect the opponent's hand and choose a Basic/Baby Pokémon to Bench, respecting the five-Pokémon Bench limit.
- **Dark Ursaring — Provoke**: choose multiple Basic/Baby Pokémon from the opponent's hand to Bench without exceeding capacity.
- **Dark Omastar — Prehistoric Water**: choose an evolved opposing Pokémon; on Heads, shuffle its highest Evolution stage into its owner's deck, keeping remaining damage counters (which can cause a KO).
- **Sabrina's Jynx — Helping Hand**: choose an opposing Pokémon, choose exactly how many of its damage counters to remove, and draw that many cards.

New tests validate prepared duels including successful and failed flips, incorrect inputs, card selection, damage, shuffling, and Bench placement. All previous regression scripts still pass.

**Limitations:** recognition is not equivalent to complete card authenticity. Many historical Trainer and special Energy interactions remain unavailable; old-era bugs can affect otherwise recognized attack interactions. Original Pokémon Powers are still at 85/166 recognized. Full browser playthroughs are not covered by these automated rules tests.

---

# Neo Campus TCG v0.5.2 — Historical effect coverage

| Metric | v0.5.1 | v0.5.2 |
|---|---:|---:|
| Historical cards cached | 1,123 | **1,123** |
| Attack records | 1,479 | **1,479** |
| Recognized attacks | 1,426 | **1,440** |
| Unrecognized attacks | 53 | **39** |
| Recognized Pokémon Power records | 85 | **85** |
| Unrecognized Pokémon Powers | 81 | **81** |

## New: 14 copying-attack records

Metronome (five original printings), Mirror Move (four), Mini-Metronome (one), Super Metronome (one), Sketch (two), Genetic Memory (one). Tests cover the card-picking UI, valid and invalid selections, different copied Energy requirements, status, damage, coin-flip behavior, ancestry, previous turn, and avoiding an extra damage Weakness multiplier.

**Coverage caveat:** *recognized* means a supported attack family is identified, not that every possible copy target or edge case has been implemented. The attack-copy UI currently presents a subset of supported attacks, filtering out scripts whose additional effects and choices cannot yet be safely copied. Consequently, copying is not yet 100% authentic, despite the recognition increase. Mirror Move does not replay every indirect effect, and all 1,440 recognized attack records still need broader cross-card interaction validation.

Run `npm test` and `npm run attacks:audit` locally. Full end-to-end graphical playthrough remains pending.

---

# Neo Campus TCG v0.5.1 — Historical effect coverage

| Metric | v0.5.0 | v0.5.1 |
|---|---:|---:|
| Historical cards in local cache | 1,123 | **1,123** |
| Attack records | 1,479 | **1,479** |
| Recognized attack records | 1,414 | **1,426** |
| Unrecognized attack records | 65 | **53** |
| Recognized Pokémon Power records | 85 | **85** |
| Unrecognized Pokémon Power records | 81 | **81** |

## Twelve newly enabled attack records

| Card | Attack | Implementation |
|---|---|---|
| Erika's Clefairy (Gym Challenge) | Lunar Power | Heads: select a compatible evolution from deck and a friendly Benched Pokémon; trigger on-play Powers and shuffle |
| Metapod (Neo Discovery) | Hatch | Heads: heal damage, search for and play an evolution from deck |
| Sunkern (Neo Destiny) | Sunbathe | Heads: heal and evolve via deck search |
| Dark Pupitar (Neo Destiny) | Explosive Evolution | Heads: deal 10 unmodified damage across the opposing field and optionally evolve to Dark Tyranitar |
| Clefairy (Neo Genesis) | Squaredance | Coin per Pokémon in play; search for up to that many basic Energy cards, with multi-select UI |
| Misty's Tentacool (Gym Heroes) | Jellyfish Pod | Choose any number of eligible Tentacool and Tentacruel cards from the deck |
| Misty's Golduck (Gym Challenge) | Super Removal | Heads: select one attached Energy to discard from each opposing Pokémon that has any |
| Aipom (Neo Genesis) | Pilfer | Shuffle Aipom and all attachments into the deck; on Heads choose a discard-pile card to shuffle too |
| Kingdra (Neo Revelation) | Twister | Flip twice; select and discard one opposing Energy per Heads; no damage on double Tails |
| Koga's Zubat (Gym Challenge) | Group Attack | Choose up to Bench capacity Koga's Zubats from deck, then damage for each you have in play |
| Quilava (Neo Genesis) | Char | Place persistent Char counter on Heads; Tails at end-of-turn checks place 2 damage counters |
| Misdreavus (Neo Revelation) | Perish Song | Knock Out the Asleep Defending Pokémon if hit by Night Eyes during the attacker's previous turn |

## Validation

- `npm test`: previous regression suites plus `test_attack_batch_v051.js` (17 prepared match configurations and outcome assertions).
- `npm run attacks:audit`: generates `attack_coverage.json` from the 1,123 locally bundled card records.
- Existing Pokémon Power recognition remains **85 / 166**. No new Power handlers are claimed.

## Remaining limitations

- **53 attack records are still unrecognized**, including attack-copying mechanics (Metronome, Mirror Move, Sketch, and Genetic Memory), unusual simultaneous choices, and some effects involving attached Trainer cards.
- Recognized is not equivalent to fully validated historical behavior. Full cross-card testing and complete graphical browser playthroughs are still required.
- The AI makes automatic selection decisions for optional effects rather than employing a comprehensive strategy.
- Some bundled original card descriptions have missing Energy symbols or transcription errors and require external verification before exact scripting.
