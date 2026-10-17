# v0.7.5 — Lt. Surge's Secret Plan ownership check

- Face-down cards now record the actual player as their Secret Plan owner rather than a hard-coded player zero.
- Voluntary face-up reveals are restricted to the controlling player's own turn.
- Mandatory reveals triggered by game effects bypass the voluntary turn check.
- Added a regression verifying both an illegal opponent reveal and a legitimate forced reveal.

The card remains partially verified: exhaustive hidden-information interactions and all timing windows are not yet certified. Chaos Gym's general choice resolver also remains incomplete.
