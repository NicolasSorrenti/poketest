# Card-game AI architecture references

Research checkpoint: 2026-10-17

- [ronniepiku Pokémon AI battle agent](https://github.com/ronniepiku/pokemon-tcg-ai-battle-agent): legal-action heuristic scorer with optional forward-model MCTS. Robust legal baseline before search.
- [SiamRahman29 Pokémon AI agent](https://github.com/SiamRahman29/pokemon-tcg-agent): ranked legal actions, explicit lethal-KO guardrails and paired tournament evaluation. Their report found low-budget MCTS underperforming their fast policy; not a general claim about MCTS.
- [cnguyen75 Pokémon AI](https://github.com/cnguyen75/pokemon-tcg-ai): within-turn beam search using heuristic action candidates and learned values; simulator dependencies are not redistributed.
- [Information Set Monte Carlo Tree Search, Cowling et al., 2012](https://eprints.whiterose.ac.uk/id/eprint/75048/): information-set search handles hidden information and avoids some determinization limitations.
- [Ensemble Determinization for Magic, Cowling et al., 2012](https://eprints.whiterose.ac.uk/id/eprint/75050/): pruning, rollout strategy and stochastic hidden-card sampling materially affect search results.
- [Magic Forge AI notes](https://github.com/Card-Forge/forge/blob/master/docs/AI.md): hand-built effect heuristics, known combo/control shortcomings and headless AI simulation.
- [HearthSim SabberStone](https://github.com/HearthSim/SabberStone): simulation engine and AI experiments support reproducible decision comparisons.

## Practical decision

Implement a fair, reproducible, rule-independent, configurable heuristic policy first. Measure head-to-head performance and explain error classes. Then test bounded within-turn planning; only pursue belief-state MCTS / ISMCTS when performance and accuracy justify cost. Modern competitive Pokémon rules are not substituted for Base Set through Neo Destiny semantics.

Sources are architecture references, not imported models or evidence that this implementation has tournament strength.
