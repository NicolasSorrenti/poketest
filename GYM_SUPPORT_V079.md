# Gym v0.79 — Lt. Surge's Treaty victory conditions

When both players take a Prize through Lt. Surge's Treaty, check the resulting Prize counts using the same last-Prize win principle as ordinary Knock Outs. The single player whose final Prize is taken wins immediately. If both take their last Prize from the same resolution, the match records simultaneous win conditions (`winner:null`, `over:true`) and requires an out-of-band period-correct sudden-death rematch. The one-card draw branch does not award a Prize or trigger win resolution. Tests cover all four outcomes.
