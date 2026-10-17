# v0.7.2 — Charity choice range

- Charity's choice picker now supports a specific voluntary reduction of 0–1000 damage in 10-damage increments, or 'all' for unlimited damage. Prior implementation artificially capped numeric selections at 200.
- Added regression tests for a 250-damage reduction, disallowed fractional/negative amounts, and downstream damage calculation.
- All existing npm tests pass.

Caveat: the numeric choice UI still imposes a technical ceiling of 1000; 'all' is unlimited. This is not a complete proof of historical fidelity for Charity, nor does it complete the remaining Trainer cards.
