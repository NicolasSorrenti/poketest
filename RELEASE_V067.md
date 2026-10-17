# Neo Campus TCG v0.6.7 — Charity uncapped damage reduction

- Charity now offers **Reduce all damage** as an option in addition to the existing 10-point reduction choices. This closes an incorrect hard cap of 200 damage for that option and allows legal zero-damage outcomes for attacks that would exceed 200 damage after modifiers.
- Invalid option values are rejected; the selected reduction remains clamped to the actual attack damage during resolution.
- Added regression test for above-200 damage handling and invalid choice handling.
- `npm test` passes including the game HTTP integration checks.
- **Not 100% historical fidelity:** eight Trainers remain conservatively classified partial; all-game timing and UI interaction testing is still needed. This release does not change their audit classifications.
