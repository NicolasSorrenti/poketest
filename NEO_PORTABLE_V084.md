# Neo Revelation / Neo Destiny portable attack pass (v0.82–v0.84)

This milestone works in the **server-authoritative portable duel path**, not merely the legacy browser-text recognizer.

## Shipped

- Added three exact-signature modules: `neo_attack_batch_v082.js`, `neo_attack_batch_v083.js`, `neo_attack_batch_v084.js`.
- 39 explicit historical attack-to-program mappings, using already-supported game-state fields and transactions rather than approximating unresolved interactions.
- New targeted regression files `test_neo_batch_v082.js`, `test_neo_batch_v083.js`, `test_neo_batch_v084.js`, included in `npm test`.
- Added `neo_v084_pool.js`: 19 reviewed Neo Pokémon printings with all printed attacks compiled and no named Pokémon Powers. Included these IDs in curated Neo legality and card selection, with `test_neo_unlock_v084.js` guarding the whitelist.
- Fixed brittle legacy smoke assertions: until-tails flips now terminate in the generic all-heads smoke test, and targetable attack coverage enforces a minimum historical baseline instead of freezing a count.

## Measured attack compiler coverage

As measured by the actual `test_attack_effects_core.js` suite after v0.84, the portable compiler recognizes **1,349 / 1,479** historical attack records, with **130 unported**. This is a higher-fidelity metric than the legacy `attack_coverage.json` recognition report, but does not itself prove all attack combinations.

- Dedicated **TCG Gameplay Regression** passed at `41ff78bc1`: https://github.com/NicolasSorrenti/poketest/actions/runs/39159482315
- The all-repository **Node regression** has a separate RPG integration failure (HTTP 404 for an RPG asset in `tests/rpg_integration.test.js`), unrelated to these portable attack scripts; do **not** describe the entire repository CI as green.

## Outstanding

1. Approximately 130 historical attack records still lack portable compiler programs. Neo Revelation, Neo Destiny, and Black Star Promos contain most of the work.
2. More Neo Pokémon have one ported attack but remain excluded until every printed attack and named Power is supported.
3. Audit copied attacks, defender-owned prompts, mixed Special Energy, triggered Pokémon Powers, multi-KOs, and two-browser multiplayer timing independently.
4. Audit/refresh `trainer_coverage.json` (8 conservative partial Trainer records) and the deliberately failing strict historical fidelity gate.
5. Run full human browser and online room acceptance after dynamic tests; neither compiler coverage nor static pool inclusion certifies every interaction.

**Policy:** Preserve original card text and fail closed on unknown programs; do not declare 100% fidelity from registered handler counts.
