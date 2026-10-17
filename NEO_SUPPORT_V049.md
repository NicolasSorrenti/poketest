# Neo Campus TCG v0.49 — Genesis & Discovery major milestone

This release continues from v0.48 and adds **19 historically printed attack entries** to the shared, authoritative CPU and online duel engine. It unlocks **14 additional fully executable Pokémon printings** in Neo custom deck selection.

## Attack effects implemented

### Neo Genesis — seven
- Donphan (21): **Rapid Spin**, dealing damage before the defending player chooses a replacement, followed by the attacker choosing their own replacement.
- Aipom (26): **Pilfer**, returning Aipom, its evolution cards and all attachments to its owner's deck; on heads, the player may also choose a discard card to return.
- Bayleef (29): **Sweet Scent**, letting the attacker choose a damaged Pokémon on the appropriate side after a coin flip, then heal up to 20.
- Clefairy (30): **Squaredance**, flipping once per Pokémon on both battlefields, then choosing up to one Basic Energy from its deck for each heads. The deck shuffles afterward.
- Ledian (39): **Baton Pass**, transferring every Energy to a player-chosen Benched Pokémon, then switching the Active.
- Quilava (46): **Fire Wind**, choosing an opposing Benched target and flipping twice for 10 damage per heads, alongside its Active damage.
- Xatu (52): **Prophecy**, reusing the validated three-card, top-to-bottom reordering flow, with private deck contents shown only to the selecting player.

### Neo Discovery — twelve printings, seven effect categories
- Forretress (2, 21): **Rapid Spin** with sequential defending-player/attacking-player switches. *Spikes Pokémon Power remains incomplete, so Forretress is not unlocked.*
- Magnemite (7, 26): **Lock-on** and **Electric Bolt**. The next-turn attack treats the coin flips as heads only while the same attacker and Defending Pokémon remain Active; otherwise normal two-coin damage/paralysis rules apply.
- Wobbuffet (16, 35): **Counter** retaliates against damaging attacks after a coin flip, even if Wobbuffet is about to be Knocked Out.
- Umbreon (32): **Pursuit** marks the Defending Pokémon to take 10 damage if it attempts to retreat during its following turn.
- Kakuna (41): **Secrete Poison** triggers on incoming attack damage, Poisoning the opposing Active and damaging the opposing Bench before KO handling.
- Poliwhirl (44): **Belly Drum** puts three damage counters on itself first; only if it survives can the player search and attach up to two selected Basic Energy cards.
- Kabuto (56): **Work Together** adds 10 per qualifying Omanyte, Omastar, Kabuto, or Kabutops on its Bench following heads. *Revive Friends Pokémon Power remains incomplete, so Kabuto is not unlocked.*

## Newly available complete Pokémon printings

`neo1-21`, `neo1-26`, `neo1-29`, `neo1-30`, `neo1-39`, `neo1-46`, `neo1-52`, `neo2-7`, `neo2-16`, `neo2-26`, `neo2-32`, `neo2-35`, `neo2-41`, `neo2-44`.

Each printing has all attacks recognized and no missing printed Pokémon Power, and the required prior evolutions are accessible. Two Forretress and one Kabuto printing remain intentionally excluded until their Powers are implemented.

## Coverage and known exclusions

The current static handler audit now shows **2 missing Neo Genesis** attacks (Togetic's Super Metronome and Gloom's Sticky Nectar) and **2 missing Neo Discovery** printed attack entries (the two Smeargle Sketch printings). Attack-handler presence is not a guarantee of exhaustive historical interaction correctness, and separate Trainer and Pokémon Power work remains.

## Verification

The full `npm test` suite passes, including the new `test_neo_batch_v049.js`. The new tests execute all 19 printings in actual duel state and inspect multi-step decisions, both-player ownership, damage-before-switch ordering, retreat damage, retaliation and simultaneous KOs, exact printed signature enforcement, proper special-Energy selection, card conservation and playable-deck legality.

No changes to the battle UI, Gym Trainer implementations, chat or spectator modes. Hosting restarts in-memory matches on redeploy.
