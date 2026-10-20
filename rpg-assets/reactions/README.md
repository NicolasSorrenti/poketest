# NPC battle reaction assets

The RPG duel cut-in system works immediately with the existing eight main character portraits.

In manifest.json, provide an optional per-character PNG/JPG/WebP asset for any of these keys:
- default
- attack
- play_card
- evolve
- power
- hurt
- ko_taken (opponent loses a Pokémon)
- ko_scored (opponent Knocks Out one of yours)

For example, under Reina, set attack to /rpg-assets/reactions/reina/attack.webp after committing that file. The fallback order is: the expression image, then the default image, then the existing character portrait, then a decorative art-free silhouette. Only paths under /rpg-assets/ can be loaded.

**Suggested art brief:** portrait orientation, ideally 768x1024 transparent WebP, expressive bust/upper-body, ample head and face crop margin, original Neo Harbor anime fashion, no text in the image. Match each character's established design and personality. Capture performing an attack, presenting a card, evolving a Pokémon, a big win, a bad knockout, a tense exchange. Keep the scenes spoiler-free and SFW.

The cut-ins are strictly presentation. They never read private hands or modify battle state. Their dialogue comes from public action events and observed Prize changes. By default there are at most six reactions per match, one slot held for a knockout, and a short cooldown between ordinary reactions.

## Post-battle result / EXP screen art

Each RPG rival can have **one dedicated result illustration**. No code or manifest
change is required when your art agent adds it:

- `/rpg-assets/characters/<npc-id>/events/battle-result.webp` (preferred)
- `/rpg-assets/characters/<npc-id>/events/battle-result.png` (also supported)

For example, place Reina's image at
`rpg-assets/characters/reina/events/battle-result.webp`.

If neither exists, the results screen **automatically uses that character's
existing duel attack cut-in**:
`/rpg-assets/reactions/<npc-id>/attack.png`. If all art is unavailable, it
keeps the regular NPC portrait/initials. It never displays another character.

The booster screen is separate. Its optional illustration lives at
`/rpg-assets/characters/<npc-id>/events/booster.webp` (or `.png`),
and it also falls back to the attack cut-in. It no longer uses the generic
`surprised` expression as a fallback.

Keep the result illustration portrait-oriented with the face clearly legible
when cropped into the right side of the results splash. No text baked into the
image, since the game overlays the result and earned rewards.
