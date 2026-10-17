# Neo v0.59 — Recycle Energy lifecycle

The shared reducer detects Recycle Energy lost from attached in-play Pokémon and put in the owner's discard in a single state transition, then returns the correct count to hand. Tested: one/two attached Recycle cards, retreat payments, attack Knock Out, Energy Removal, Pokémon Center, and non-triggering discard from hand. Uses a bounded pre/post count to preserve replay/transaction semantics across both CPU and multiplayer.

Remaining caveat: transactions that simultaneously return existing discarded Recycle to another zone while discarding a new attached Recycle may require fine-grained attachment identity tracing. Every rare discard path, opponent-owned attached card, and turn-end side effect still needs auditing. Don't infer full Special Energy parity from this batch.
