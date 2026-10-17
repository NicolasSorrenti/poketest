# Neo Campus TCG v0.6.5 — Release integrity gate

This release preserves the v0.6.4 gameplay and adds a mandatory archive and runtime classification regression gate to `npm test`.

- Verifies all 12 historical set files, 1,123 unique card IDs, 1,479 attacks, 166 Power records, and 178 Trainer records.
- Fails the test suite if a Trainer becomes unimplemented or Stadium placement-only in the audit.
- Verifies the six classic basic Energy types are never categorized as benchable Pokémon, even when historical input data contains a malformed `supertype`.
- Ensures existing special Energy cards cannot be benched.
- Verifies all seven Trainer interaction script layers remain linked in the playable HTML.

This is *regression protection*, not proof of full historical mechanical fidelity. The existing eight partial Trainer records and complex attack/Power interactions remain open.

Run `npm test` and `npm run cards:coverage` to repeat the checks.
