# Quick game checks

`npm test` runs three short checks in parallel: an RPG flow using a simulated DOM, a duel setup and turn, and a Cube HTTP draft through starting a duel. They do not exercise a real browser or prove individual card effects are correct.

The original npm suite remains available as `npm run test:full`. The other GitHub Actions workflows remain available through **Actions → workflow → Run workflow**, so detailed regressions and benchmarks can be run when needed. Only the quick checks run automatically on pushes to main and pull requests.
