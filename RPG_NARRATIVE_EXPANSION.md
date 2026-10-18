# Neo Harbor — Narrative expansion and character art direction

This is an internal, **spoiler-full** production document. Do not put its contents on the player-facing calendar or in route summaries. The actual authored dialogue is in `rpg_narrative_pack.js`.

## Premise and writing rules

Neo Harbor's ninety-day circuit is a community event, not merely a tournament. Players, judges, staff, collectors, families and hobbyists depend on one another. People have their own schedules and stakes whether or not the protagonist speaks to them. No antagonist is evil simply to provide a boss match.

The primary cast remains the existing eight **adult** heroines. New guest characters are **friends, rivals, and recurring community members**, not additional romance routes. Do not accidentally make their casual flirt dialogue romantic route content. Keep scenes PG-13/SFW and give each person a recognizable speaking rhythm.

**Write conversations as actions:** somebody wants something; another person has a different, defensible need; the player can support, challenge or mediate. Avoid exposition monologues and generic "I am glad you came" endings. Jokes should expose personality or ease tension, not undermine sincere moments. Use silence when a character would realistically be uncomfortable.

**Consequences:** every authored episode consumes one of three daily periods, expires after its date window, records the choice, and changes relationship statistics. The expansion also records an explicit `storyFlags[eventId]` outcome so future scenes can branch without inferring intentions from a relationship number. Story flags are saved, and the **second and third guest chapters now change their opening dialogue** according to the preceding chapter's specific choice. Wider multi-branch quest endings remain a later milestone.

## Three new recurring trainers

### Jun Arai — 28 — reluctant referee

- **Conflict:** Good at correct rulings, bad at explaining them without embarrassing new players. A child has stopped visiting after a harsh interaction.
- **Arc:** “An Appeal to the Rules” → “The Table Nobody Books” → “A Signature on the Slip”. He learns to apologize, facilitate beginner sessions, and let others learn aloud.
- **Voice:** Understated, scrupulous, unexpectedly funny in very dry fragments. Never delivers motivational speeches.
- **Current playable deck:** `fossil_lab` — a verified available **custom Fossil laboratory preset**. Plays controlled, patient games. It is **not** yet a bespoke character list.
- **Design:** Tall/lean, rolled-sleeve referee vest, narrow watch, natural silver streak. Smoke navy/mint/steel. Expressions: dry lifted brow, tired kindness, clear eye contact when accountable.
- **Cross-cast:** Reina's replay ruling; Akari's fair-but-unwelcoming matchmaking model; Shiori's old tournament score sheet.

### Teo Álvarez — 24 — amateur announcer

- **Conflict:** He is so frightened of dead air that he talks over what the players are doing. He unintentionally spreads an unfairly edited image of Kaede.
- **Arc:** “Dead Air” → “The Highlight Reel” → “A Mic Left on the Table”. Learns consent, correction, and mentoring rather than chasing attention.
- **Voice:** Talkative, self-mocking, rapid punchlines; noticeably slower and shorter when admitting fault.
- **Current playable deck:** `hotfoot`, the existing **Neo Genesis theme-deck preset**. Quick forward momentum suits his showmanship; not a special custom deck.
- **Design:** Copper fringe, expressive eyes, patched orange/violet windbreaker, compact headphones and clip-on mic. He should look stylish and slightly overprepared, not like a real-world influencer stereotype.
- **Cross-cast:** Hana's overbooked shop table; Yuna's private testing night; Kaede's clip and reputation.

### Iris Navarro — 26 — riverside courier

- **Conflict:** Reliable to a fault: she personally fixes every missed shipment, then misses important moments in her own family.
- **Arc:** “The Unclaimed Box” → “Last Ferry” → “Low Tide, Full Tables”. Learns transparent donation records, delegation and negotiating humane work boundaries.
- **Voice:** Dry, direct, physical details instead of abstract metaphors. Her affection shows in what she remembers and delivers.
- **Current playable deck:** `cold_fusion`, the existing **Neo Genesis theme-deck preset**. Patient adaptation; not a bespoke deck.
- **Design:** Athletic, short black curls with asymmetric undercut, teal waterproof jacket, rust-orange accents, river freckles and whistle cord. Grounded in Neo Harbor's dockside identity.
- **Cross-cast:** Camila's damaged prize shipment and fair trading; Marina's access to ferries and delayed tournament registration.

## Existing eight heroines — visual continuity

Do not replace or silently redesign the current sprites. Their existing portraits are the primary reference for recognizable facial features, hairstyles, and proportions. The `looks` data in `rpg_narrative_pack.js` provides **palette, outfit, silhouette, accessories, and expression direction** for later costume iterations, subject to matching established assets:

| Character | Narrative identity | In-game deck ID | Costume language |
| --- | --- | --- | --- |
| Hana | Helpful organizer learning boundaries | `power_reserve` | Warm pastel casualwear, pins, practical event lanyard |
| Reina | Demanding rival learning fair self-criticism | `blackout` | Angular black/garnet tournament streetwear |
| Shiori | Reflective veteran learning to return | `overgrowth` | Muted tailored coats, delicate watch |
| Yuna | Performer learning to play without an audience | `zap` | Neon layered arcade streetwear |
| Akari | Analyst learning the limits of prediction | `gym_new_voltage` | Geometric indigo/mint utility outfit |
| Camila | Trader choosing transparency over leverage | `rocket_lab` | Burgundy tailored collector fashion |
| Marina | Quiet contender learning to advocate | `water_blast` | River-ready seafoam/navy linen layers |
| Kaede | Disruptive newcomer seeking belonging | `rocket_lab` | Charcoal/purple punk utility layers |

The deck IDs above are *current gameplay presets*, and not a claim that any card-perfect signature deck has been constructed. The earlier Reina “Haymaker” description, for instance, remains her **intended archetype**, while `blackout` is the existing playable placeholder.

## Design-system guardrails

- Keep the game's **modern urban anime/JRPG, layered fashion, striking silhouettes** language, rather than shifting to generic school uniforms.
- Render new characters in the **same portrait height, cropping, perspective, outline weight, and lighting treatment** as the existing cast. They should seem to inhabit the same town and lighting scheme.
- Teo: orange-violet kinetic curves. Jun: mint-navy reserved geometry. Iris: weatherproof teal-rust practicality. Avoid giving all three the same body shape.
- Supply standard neutral, happy, irritated and vulnerable expressions when art production begins; do not create any images as part of this narrative update.
- Missing portraits intentionally fall back to initials in the existing UI. Avoid silently substituting stock art.

## Technical contract

The expansion builds on `rpg_story.js`, `rpg_schedules.js`, `rpg.js`, the existing Classic duel engine, and browser save data. It does not replace any of them, nor does it change combat rules. Story IDs from the original thirty-two scenes remain stable for existing saves.

Guest decks are selected using existing `deckOptions()` IDs. Future bespoke competitive archetypes should be introduced *only after* confirming card support and automated full-duel tests. The module is browser-static; server-side spoiler security, fully divergent multi-scene branches, custom deck lists and new final endings are separate future milestones.


## Minor characters and optional side quests — added

These characters are recurring **adult townspeople**, not new romance routes or replacements for the eight existing heroines. Each has its own weekly schedule, voice, visual direction and a live 60-card deck preset. Facial art has not been generated; the current UI uses its established fallback initials.

| Character | Design direction | Dialogue voice | Existing duel deck |
| --- | --- | --- | --- |
| Elio Soto (19) | Amber and sky-blue varsity layers, repaired sneakers, slightly messy curls and an overstuffed binder | Hesitates, asks practical beginner questions and learns to own his choices | \`bodyguard\` |
| Alma Serrano (35) | Sage/espresso café streetwear, low-bun hair, analog watch and apron | Dry, observant, supportive through specific practical actions rather than speeches | \`lockdown\` |
| Nereo Paz (29) | Petrol-teal boatyard jacket, rust accents, working trousers and patched lanyard | Understated waterfront humor, notices logistics problems before people make accusations | \`cold_fusion\` |

### Playable quests

- **A Deck With Someone Else’s Name:** Elio learns that his cousin’s success is not a required blueprint for his own play. The player chooses whether to emphasize self-expression, fundamentals, affordable cards or matchup training. A real duel closes the quest on any result, with different replies and rewards for winning, losing or drawing.
- **The Table Nobody Notices:** Alma and the community adapt the café and event signage so that the card club is genuinely easier to access. Involved characters include Jun and Shiori. Choices shape later dialogue and reward reputation, credits, focus or insight.
- **The Ferry With Empty Seats:** Nereo, Iris, Teo and Marina coordinate card shipments and event access across the river. The problem is miscommunication and unreliable transit—not an invented thief or cartoon antagonist. Choices include written handoffs, notifications, backup noticeboards and future volunteer arrangements.

Each quest has **three dated chapters**, each with a scheduled person and location. Earlier decisions change an extra dialogue beat in later chapters *without replacing essential context*. Quests persist in the browser save as \`sideQuests\` and \`activeSideQuest\`, appear on a dedicated side-quest panel and journal, and expire if their scene windows are missed. One-time rewards are applied only on completed decisions or authentic Classic duel receipts.

The finale report counts completed side quests, but the main tournament brackets and existing relationship endings remain independent. The quest duels use the currently supported presets above, **not** unverified custom signature lists. See \`tests/rpg_side_quests.test.js\` and \`tests/rpg_world_ui.test.js\` for data, reward, reload, expiry and UI-flow regression coverage.
