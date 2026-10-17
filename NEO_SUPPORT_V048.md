# Neo Campus v0.48 — Large Neo Genesis / Discovery card milestone

Scope: one coherent batch of server-authoritative card behavior for the same CPU and online duels. No UI or VN changes. Blaine’s Quiz #1 remains intentionally excluded.

## Size and coverage

- **20 distinct exact-card attack signatures implemented**, covering more printed attacks where Neo Discovery has holo/non-holo duplicates.
- **21 complete Pokémon card printings unlocked** in custom Neo decks, not Basic/Team Rocket formats.
- **20/20 focused attack executions passed**, plus multi-seed interaction tests and the full existing `npm test` regression suite.
- Current static unresolved-attack counts: **Neo Genesis: 9; Neo Discovery: 14**. These are handler counts, **not** a certification that every historical interaction is perfectly handled.
- Neo Revelation and Neo Destiny still have considerable unported card effects.

## Implemented effects

**Neo Genesis**: Bellossom *Sweet Nectar* (coin + choose damaged ally); Lugia *Elemental Blast* (choose & discard one Fire, Water and Lightning Energy); Pichu *Zzzap* (Power-based all-field damage); Typhlosion *Flame Wheel* (three selected Energy discards + both Benches); Murkrow *Mean Look* and *Feint Attack* (retreat restriction and targeted damage that ignores other effects); Bayleef *Pollen Shield*; Phanpy *Endure* (one-turn lethal-attack survival); Piloswine *Freeze*; Chikorita *Growl* (damage reduction before Weakness/Resistance); Sunkern *Growth* (coin + optional Energy from hand).

**Neo Discovery**: Houndoom *Crunch* (+20 damage on later eligible attacks) and *Flamethrower* (chosen Energy discard); Houndour *Collect Fire* (chosen Fire Energy from discard); Tyranitar *Trample* (a coin for each Benched Pokémon); Umbreon *Feint Attack*; Yanma *Shockwave* (one coin, opponent field damage and defender-chosen switch); Beedrill *Triple Poison* (three damage counters); Pineco *Burst* (both coin outcomes according to WotC's two-flip ruling); Wooper *Slime* (flip for damage prevention).

## Newly unlocked Neo card printings

Neo Genesis: `neo1-3` Bellossom, `neo1-9` Lugia, `neo1-12` Pichu, `neo1-24` Murkrow, `neo1-28` Bayleef, `neo1-43` Phanpy, `neo1-44` Piloswine, `neo1-54` Chikorita, `neo1-78` Sunkern.

Neo Discovery: `neo2-4` and `neo2-23` Houndoom; `neo2-5` and `neo2-24` Houndour; `neo2-12` and `neo2-31` Tyranitar; `neo2-13` Umbreon; `neo2-17` and `neo2-36` Yanma; `neo2-18` Beedrill; `neo2-61` Pineco; `neo2-71` Wooper.

Other Neo attack effects received implementations without incorrectly unlocking Pokémon whose remaining Powers or other attacks still require work (for example, Typhlosion `neo1-18`).

## Verification and remaining caveats

- `npm test` includes new `test_neo_batch_v048.js` and `test_neo_interactions_v048.js`.
- Test cases cover atomic illegal Energy selections, correct elemental payments, status effects, turn-limited defensive effects, bench switching, historical Burst outcomes, Poison damage per turn, Endure and voluntary deck restrictions.
- Uses exact card text signatures; changing an attack’s wording does not accidentally compile.
- The 21 cards have all printed attack handlers and no unported named Powers. This is **not** a blanket claim of perfect WotC historical timing under every cross-card interaction.
- Uncommon Special Energy payments (such as multi-type substitution for Lugia) and rare Bench/Power shields may still require separate validation.

## Historical ruling

Pineco *Burst* uses **two** coin flips. When the second is tails, the entire attack does nothing; when second is heads and first is tails, only the regular 40 damage occurs. Source: https://forum.tcgone.net/t/br-pineco-n2-61-obvious-mistranslation/15063/2 (WotC May 2001 ruling quoted).

## Deployment

Committed to `main`. Render auto-deploys only when enabled; deployment was not independently verified. Server restarts clear in-memory matches.
