# v0.7.1 — Chaos Gym CPU-turn human response

When the CPU loses the Chaos Gym permission flip on a supported Trainer, the human can explicitly choose Use or Decline. Replay now targets the opposite player instead of hard-coding the CPU. Regression tests cover both response paths.

**Not yet complete:** arbitrary multi-step target/cost decisions and all Trainer-card eligibility under Chaos Gym still require full interactive delegation. Do not certify 100% historical fidelity.
