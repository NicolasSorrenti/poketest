# CPU Trainer-combo planning

## Scope
Experimental `comboSearch`, OFF by default. Searches up to 96 own-state nodes per first action and three subsequent legal preparation actions. Supported chains: Energy Retrieval (one real hand-card payment, one or two Basic Energy returned from own discard), evolution, one Energy attachment, and available attacks. PlusPower can add 10 damage to an actual attack. The authoritative reducer executes all real commands; this planner does not read hidden opponent cards, predict future draws or coins, or modify rules. Trainer cost and recovery decisions use only the acting CPU's permitted options.

A fair, 60-card `cpu_combo_lab` benchmark-only Base Set recipe stresses Machop/Machoke, Retrieval and PlusPower without altering gameplay decks.

## Validation
Tests cover a complete Machop to Machoke Karate Chop line, real Trainer payment, recovery from public discard, Energy attachment limit, legitimate PlusPower KO thresholds, Chaos Gym uncertainty, and unchanged normal Energy/evolution priorities.

The first 180-game retail benchmark was poor (62 wins, 118 losses). Investigation found that non-improving normal Energy attachments and evolutions received an erroneous -50 penalty. This was corrected to zero, and a regression prevents recurrence.

After that fix, 260 seat-swapped Champion A/B games yielded:

| Equal deck | Combo on | Baseline | Draws |
|---|---:|---:|---:|
| Blackout | 29 | 31 | 0 |
| Brock | 30 | 30 | 0 |
| Cold Fusion | 29 | 31 | 0 |
| CPU Combo Lab | 42 | 38 | 0 |
| **Total** | **130** | **130** | **0** |

There is no established win-rate improvement. Keep the policy experimental. The 5% maximum lower-tier upset target remains unmet; historical RNG and match outcomes remain fair.

Run `node test_cpu_policy.js`, `node test_classic_live_service.js`, or `node benchmark_cpu.js --pairs 40 --max-turns 120 --seed 101183 --left-level 5 --right-level 5 --left-combo-search true --right-combo-search false --left-deck cpu_combo_lab --right-deck cpu_combo_lab`.
