# Sol Varela — Adult Heroine / Art & Dialogue Bible

Production reference only — spoilers below. The playable data is in rpg_sol_character.js.

## Identity
**Sol Varela (26)** is Neo Harbor's riverside social-event organizer. She creates spontaneous card hunts, goofy contests, and low-stakes adventures, frequently wearing bright resort swimwear around town. She loves attention and flirting and isn't embarrassed about her clothing, but treats other people's boundaries seriously. She has a fully optional romance, equally valid friendship choices, a real preset deck, and a predictable weekly itinerary.

**Emotional thesis:** She's capable of helping everybody else enjoy life, but has trouble believing they want her company if she's not providing entertainment. A failed self-organized festival taught her the wrong lesson: that ordinary connection is inadequate. The player doesn't rescue her; they help her notice people who will support her and let her learn to ask.

## Appearance lock
Adult athletic-curvy build; long coral-pink waves with golden highlights; sea-green eyes; sun freckles and an expressive smile. Saturated lagoon turquoise, coral, sunflower gold, and navy palette. Signature asymmetric turquoise/coral bikini with an open patterned resort shirt or mesh top; waterproof crossbody deck case, shell earrings, colorful bangles, sandals. Bikini-inspired fashion continues across venues, with sensible layers for weather, comfort, and safety. Do not draw her like an adolescent.

**Outfits:** Daytime turquoise swimsuit and breezy shirt; evening magenta bikini with long navy cardigan; arcade swimsuit top with orange oversized varsity shirt and shorts; rain jacket as needed; casual cover-up and shorts for organized tournament days. Fan-service charm is confident, playful, and non-explicit; never imply that she must ignore anyone's discomfort.

**Expressions:** huge invitation grin; conspiratorial wink; playful mock-offense; excited bright laugh; unexpectedly bashful surprise; genuine concern when an event becomes unsafe; quiet exhausted vulnerability; soft unguarded sunset smile.

**Portrait production target:** A transparent-background VN foreground portrait matching the existing eight adult heroine assets in line work, shading, anatomy, and camera crop. Sol should be identifiable by hair silhouette, bright turquoise-coral outfit, crossbody deck pouch, and facial energy. The current game uses /rpg-assets/sol.png. Expression-specific artwork may be added later, but the UI currently displays the neutral asset only. No portraits are committed yet.

**Reusable art prompt:** Adult anime JRPG character Sol Varela, 26, outgoing Argentine-inspired waterfront events host, curvy athletic adult figure, very long coral-pink wavy hair with gold streaks, sea-green eyes, nose freckles, mischievous expressive smile; turquoise coral SFW swimwear and airy open patterned resort shirt, shell earrings, colorful bracelets, crossbody waterproof TCG deck case, bright playful pose; sunny riverside visual novel style, professional cel shading, consistent with the eight adult Neo Harbor heroines, clean anatomy, transparent background, no text, non-explicit.

## Playable arc: five chapters and two crossovers
**1. An Invitation With No Instructions (Days 8–22, park):** Plastic Psyduck treasure hunt. She invents games faster than she checks whether people want to join. Marina appears. Choices: help, ask consent, flirt.

**2. The Worst Party in Neo Harbor (Days 26–43, arcade):** Eight RSVPs but almost no guests at a mystery event. Yuna helps turn it into a small fun gathering. Sol confronts her fear that people will refuse a straightforward invitation.

**3. The Girl Who Never Cancels (Days 45–62, café):** Alma confronts Sol's overplanning; the truth about last year's cancelled festival comes out. She struggles to ask for help rather than entertain.

**4. The Forecast Says No (Days 64–78, center):** Jun and the safety crew are worried about river conditions. Sol herself chooses to cancel the unsafe riverside gathering and organize an intimate indoor alternative.

**5. When the Music Stops (Days 79–89, sunset park):** For once she invites the player just to be together, not to attend an activity. There are mutually exclusive romance and friendship outcomes, including an honest friendship route.

**Crossovers:** At the café with Alma, they demonstrate that her self-expression and sensible safety rules can coexist. At the river with Marina, her event changes when the current is dangerous. Neither crossover replaces the main route.

Early choices are saved as storyFlags and change later dialogue. Conversations are spoken by the correct characters. Every chapter is optional and missable by design.

## Deck and player interaction
**Classic TCG opponent:** Hot Water (ID hot_water), an actual supported 60-card Team Rocket mixed Fire/Water theme deck. She likes surprising combinations and playing for the experience, not humiliating beginners. Real victories/losses go through the existing Classic duel service.

Her repeatable hangout texts feature a waterfront scavenger hunt, deliberately awful card-name jokes, juice experiments, a scheduled-nothing sunset picnic, and a deck-box fashion show. The invitation is playful, but she accepts the answer she gets.

## Implementation
Code and asset constraints: rpg_sol_character.js is the source-of-truth. rpg_narrative_pack.js merges Sol's cast/look/schedule/route; rpg_story.js already handles the route, trust, attraction, friendship, romance, missed events and choice persistence; rpg.js uses the existing duel and character UI and her bespoke hangout variations. Character art is a separate production step; until /rpg-assets/sol.png is created, the normal avatar fallback remains.
