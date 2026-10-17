# Neo Campus TCG v0.6.6 — Server integration and honest fidelity gate

- Preserves v0.6.5 card logic and all seven historical Trainer script bundles.
- Adds an actual HTTP-server integration smoke test (`test_server_integration.js`) to `npm test`. Tests that the real game HTML, engine, 7 Trainer scripts, and representative Base/Neo archives are accessible; verifies 404 handling and directory traversal protection.
- Adds `npm run release:strict`: intentionally returns nonzero until a full historical rule-fidelity certification is justified. Handler counts are **not** considered proof of fidelity.
- `npm test` passes locally. This is **not** 100% completion: eight Trainer records are still classified partial; open choices/timing and human browser playthroughs remain.

Run `npm start` and open http://localhost:8000/ to play.
