# Gym v0.77 — Lt. Surge's Treaty Prize reveal metadata

When the opponent selects the Prize-taking mode, each player chooses and takes their own Prize. Reveal markers set by Card-Flip Game follow the remaining Prize cards as their indices shift: remove the exact matching `prizeFaceUp` entry along with the chosen Prize. The draw-one alternative does not touch either player's Prize or reveal state. Regression tests check choice ownership, each player's selection, hidden/public projections, and mandatory draw behavior.
