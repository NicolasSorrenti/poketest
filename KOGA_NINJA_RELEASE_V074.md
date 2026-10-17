# v0.7.4 Koga's Ninja Trick
- Added CPU defender's optional pre-damage switch when a legal attack is made and Koga's Ninja Trick is attached.
- CPU chooses a legal, healthier Bench substitute or declines. The Tool moves to discard on switching.
- Keeps existing human defender response; avoids looping back through the prompt on a CPU switch.
- Adds targeted tests for both CPU accept/decline cases.
- `npm test` passed. This release does not certify every historical card interaction as complete.
