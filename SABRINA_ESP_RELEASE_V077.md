# v0.7.7 — Sabrina’s ESP / Shadow Attack

- Added Shadow Attack to the supported conditional coin-flip reroll list.
- Requires an actual selected opposing Bench target before presenting the reroll choice.
- Never previews a Shadow Attack coin when the opposing Bench is empty.
- Kept the historical choice to retain the initial flip or reroll all attack flips once.
- Added two regression scenarios to test_trainer_v064.js.
- Full `npm test` suite passed.

Remaining: general conditional attacks, CPU-side ESP choices and complex replay/timing interactions have not been exhaustively verified.
