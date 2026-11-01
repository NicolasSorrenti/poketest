# Neo Campus RPG relationship-event audit

Generated from `main` after the weighted relationship layer was merged.

## Scope

- 25 characters
- 141 authored events
- Every event reviewed for route stage, subject matter, intimacy escalation, existing affection gate, and recommended Bond rank.
- Existing `minBond` values are legacy affection-only gates. They are recorded but should not be confused with the new weighted Bond ranks.

## Recommended Bond ranks

| Rank | Use |
|---|---|
| 0 | Introduction or first meaningful connection |
| 1 | Familiarity after the player has shown interest |
| 2 | Personal trust or meaningful support |
| 3 | Vulnerability, private time, or emotionally intimate transition |
| 4 | Romantic/final relationship decision |

The rank is a floor, not a requirement to choose romance. A player may still choose friendship or an undecided ending.

## Findings

- The original heroine routes generally have five beats once their bridge event is included. Their bridge should be Rank 3; their final scene should be Rank 4.
- The guest/bond routes use raw affection gates of 0/2/4/6/8. These should be converted to relationship ranks rather than treated as five identical stat checks.
- Lyla has seven route scenes. Keep all seven, but treat scenes 6–7 as extra late-route content; do not use them as evidence that every character needs seven rank-ups.
- Early scenes may contain playful attraction, but direct or emotionally loaded flirtation should not unlock before Rank 1–2.
- Events with a narrow late window need a 90-day simulation before their gates are finalized.

## Gate-pacing check

Using the proposed thresholds `[0, 8, 18, 28, 40, 55]`:

- Strong answers complete every route; Lyla completes all seven scenes.
- Average answers complete all scenes for 21 of the 24 five-scene routes without extra social activity.
- Adding one ordinary social interaction between route beats lets all 25 characters reach their full authored route set.
- Poor answers can stall early without making the route impossible: one social interaction between beats recovers every route in the stat-only simulation.
- This is a relationship-score simulation, not yet a complete day/slot conflict simulation. The next check must account for the 90-day calendar and competing events.

## hana

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `hana_route_1` | Too Many Promises — first connection — Before opening, stacks of deck boxes take up every free inch of the counter. Hana has a pencil tucked behind one ear and a roll of tape stuck to | D5–18 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `hana_route_2` | A Seat Saved — continued familiarity — At the café, two cups are waiting at a corner table. Hana has written a deck list on the back of a receipt, then crossed out half of it. I ordere | D24–40 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `hana_cross_1` | The Extra Table — continued familiarity — A camera tripod stands across the shop's last free table. The BEGINNERS sign is balanced against one leg. Teo, the kids arrive at six. We're goin | D25–39 | Affection 1 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `hana_route_3` | One Empty Chair — personal trust — The last customer leaves. A chair remains pulled out across from the counter, next to a cold cup of tea. You can go. I won’t be offended. I wasn’ | D48–64 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `hana_route_bridge_4` | A Promise With Room — private/emotional transition — I moved the extra tables, answered the messages, and somehow still managed to leave one thing unfinished. Let me guess. The thing was making time | D65–72 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. Late window is narrow; verify reachability in simulation. |
| `hana_route_4` | A Promise for Tomorrow — final relationship decision — The park is full of people packing away tournament banners. Hana has saved two paper cups from the refreshments table. They gave us the leftovers | D73–86 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## reina

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `reina_route_1` | Another Hour — first connection — The community center is almost empty. Under the flickering lights, Reina deals the same opening hand again. If you’re going to hover, pull up a c | D7–19 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `reina_route_2` | Pressure Point — continued familiarity — A few players crowd around the results sheet. Someone makes a joke about Reina getting lucky. Her pen stops halfway across the page. Funny. They | D26–41 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `reina_cross_1` | A Correct Loss — personal trust — Reina has folded the corrected match slip into quarters. Jun waits across the community-center table, hands in his pockets. The replayed attack w | D47–63 | Affection 2 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `reina_route_3` | Side by Side — personal trust — Reina has reserved two tables at the center. The second holds a neatly sleeved copy of your usual deck. You’ve been giving away your first turn l | D52–66 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `reina_route_bridge_4` | No Score to Settle — private/emotional transition — The practice hall is empty. No spectators, no bracket, no excuse to pretend this is only training. You invited me here without challenging me. I | D67–75 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. Late window is narrow; verify reachability in simulation. |
| `reina_route_4` | The Match After — final relationship decision — Someone has left chalk marks from the tournament bracket on the park pavement. Reina rubs one out with the toe of her shoe. I hate the day after | D76–88 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## shiori

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `shiori_route_1` | A Quiet Observer — first connection — At the café, Shiori watches a nearby game while her own deck remains untouched in its case. He had the knockout in hand three turns ago. Why didn | D12–24 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `shiori_route_2` | A Recorded Match — continued familiarity — In the library, a recording of an old tournament pauses on a crowded board. The same minute has been replayed enough times to wear out the timest | D35–51 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `shiori_route_3` | An Open Door — personal trust — The community center doors are propped open. Shiori stops a few steps short as a cheer erupts inside. They changed the tables around. The games s | D58–72 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `shiori_cross_1` | The Second Opinion — personal trust — At the community center, Jun places an old score sheet beside Shiori's unopened deck case. A beginner's tournament is packing up nearby. That's t | D60–76 | Affection 2 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `shiori_route_bridge_4` | A Different Kind of Practice — private/emotional transition — I brought no match recordings today. That sounds serious. I wanted to remember a conversation without replaying it afterward to find the perfect | D73–77 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. Late window is narrow; verify reachability in simulation. |
| `shiori_route_4` | Beyond the Score — final relationship decision — Shiori has brought a small cake to the café. She sets down two forks before remembering to remove the paper wrapping. I asked for the smallest on | D78–89 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## yuna

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `yuna_route_1` | Impossible Combo — first connection — The arcade table is littered with dice, spare sleeves, and a deck list covered in question marks. Yuna holds up a card like a magician. Behold. T | D9–22 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `yuna_route_2` | Behind the Joke — continued familiarity — The arcade crowd is still laughing. Yuna takes a bow, then quietly gathers the cards nobody stayed to see. I had the winning play, you know. Why | D30–46 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `yuna_cross_1` | The Match Without Applause — personal trust — At the arcade, Teo sets a microphone beside Yuna's test deck. Its red indicator is off, but the cable crosses her playmat. Can we leave that thin | D34–49 | Affection 2 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `yuna_route_3` | A Real Shot — personal trust — At the shop, Yuna’s new deck sits in plain sleeves. Not a single one has a doodle or a joke written on it. Nobody laughed when I showed them this | D52–67 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `yuna_route_bridge_4` | The Part Between Jokes — private/emotional transition — I had three jokes ready for this conversation. Only three? You are losing your edge. I know. The problem is that I wanted to say something withou | D68–73 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. Late window is narrow; verify reachability in simulation. |
| `yuna_route_4` | After the Encore — final relationship decision — The arcade shutters are halfway down. Yuna turns off the last cabinet, leaving one blinking high-score screen. Look at that. We outlasted the ele | D74–87 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## akari

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `akari_route_1` | A Statistical Anomaly — first connection — Akari has covered a library table with neatly written columns. One row is circled three times; your name is next to it. That last draw should hav | D13–26 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `akari_route_2` | An Unplanned Afternoon — continued familiarity — At the café, three schedules are lined up beside Akari's untouched drink. Your arrival earns a long look at the clock. You're eleven minutes earl | D33–49 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `akari_cross_1` | A Model of Fairness — personal trust — Akari's pairing chart fills the community-center board. Jun taps three rows where one beginner keeps meeting veteran players. The rankings make t | D51–66 | Affection 2 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `akari_route_3` | The Broken Prediction — personal trust — The results board has been updated. Akari's prediction sheet is folded small enough to fit beneath a card sleeve. The winner wasn't in my top fou | D54–70 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `akari_route_bridge_4` | An Hour Without a Plan — private/emotional transition — I arrived twelve minutes early and still did not decide what we would do. Should I be worried? Possibly. I am trying to find out whether an hour | D71–75 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. Late window is narrow; verify reachability in simulation. |
| `akari_route_4` | No More Predictions — final relationship decision — Akari's notebook lies closed in the library. An envelope rests on top, with your name written carefully across it. I wrote several drafts. They w | D76–89 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## camila

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `camila_route_1` | Terms and Conditions — first connection — At the shop, Camila holds an old card beneath the overhead light. A tiny crease catches it near the edge. Beautiful printing. Awful corner. A col | D16–29 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `camila_route_2` | A Question of Trust — continued familiarity — Two regulars go quiet when Camila approaches the café counter. A folded note sits beside her untouched cup. Apparently I cheated someone on a tra | D34–51 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `camila_cross_1` | Inventory of Trust — continued familiarity — Seven prize decks sit on the shop counter. Camila compares the manifest with an empty space between the boxes. This says eight. Iris, did one end | D36–52 | Affection 1 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `camila_route_3` | The Price of Honesty — personal trust — At closing, a younger collector presses worn cards into Camila's palm. A valuable holo sits on top. You're sure you want to swap all of these? Th | D58–72 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `camila_route_bridge_4` | A Deal With No Fine Print — private/emotional transition — I wrote the agreement down, then crossed out every condition. That is unlike you. I know. I wanted to see what remained when neither of us was tr | D73–76 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. Late window is narrow; verify reachability in simulation. |
| `camila_route_4` | No Bargaining — final relationship decision — Camila has left her usual card case at home. At the café she turns a sugar packet over and over between her fingers. I've spent ten minutes tryin | D77–89 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## marina

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `marina_route_1` | Waterline — first connection — The last ferry cuts a silver trail across the water. Marina has two spare tickets tucked into a small notebook. The river's calmer after the last | D8–22 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `marina_route_2` | The Application — continued familiarity — A registration form sticks out from Marina's bag at the café. Its edges are worn soft from being folded and unfolded. The deadline's Friday. For | D31–47 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `marina_cross_1` | A Weather Window — continued familiarity — The ferry timetable rattles against its frame. At the landing, water slaps the bottom step while players shelter under the awning. That boat won' | D39–55 | Affection 1 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `marina_route_3` | A Step Forward — personal trust — At the community center, Marina keeps smoothing the same corner of her badge. The players ahead of her are being called to their tables. I should | D53–69 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `marina_route_bridge_4` | Before the Next Current — private/emotional transition — The application is still in my bag. I keep checking that it is there, even though I already sent it. Waiting can be harder than deciding. Especia | D70–74 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. Late window is narrow; verify reachability in simulation. |
| `marina_route_4` | After the Tide — final relationship decision — On the riverbank, Marina unfolds a tournament bracket with her name printed near the bottom. The sheet has been smoothed flat. I kept it. Even th | D75–88 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## kaede

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `kaede_route_early_1` | A Seat at the Table — first connection — You are the new challenger, right? Everyone keeps pointing you toward the loudest table. And you are pointing me somewhere else. The quiet table | D24–41 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `kaede_route_1` | An Unexpected Arrival — first connection — At the arcade, a stranger in a patched jacket has taken the machine's top score. The regulars pretend not to watch. You all look like someone sto | D42–54 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `kaede_route_2` | No Safe Bets — continued familiarity — At the center, two players break off their conversation when Kaede arrives. She catches the end of a familiar rumor. Go on. I missed the part whe | D55–66 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `kaede_cross_1` | A Cut That Matters — continued familiarity — A clip of Kaede's tournament match loops on Teo's phone. It ends just before the players shake hands. You cropped out the handshake. Now the whol | D62–77 | Affection 1 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `kaede_route_3` | A Place to Return To — personal trust — A train passes on the far side of the park. Kaede checks the departure board on her phone, then locks the screen. The last train's in forty minut | D69–80 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `kaede_route_4` | Tomorrow, Maybe — final relationship decision — At the arcade, Kaede's bag rests beneath an empty table. The train ticket in her phone case has expired. Turns out the station doesn't give refun | D81–90 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. Late window is narrow; verify reachability in simulation. |

## jun

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `jun_guest_1` | An Appeal to the Rules — first connection — At the library, Jun closes a rulebook beside a tournament slip. Someone has circled a disputed ruling in red. I made the right call. You'd think | D11–25 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. |
| `jun_guest_2` | The Table Nobody Books — continued familiarity — The beginner table is empty again. I even straightened the chairs. The sign says anyone is welcome, but the chairs are facing the judges' desk. C | D37–52 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `jun_guest_3` | A Signature on the Slip — personal trust — The beginner table is full. Someone's arguing about which deck box brings luck. You going to make a ruling? Jun sets a score slip on the table. T | D66–82 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `jun_guest_4` | A Match Without a Whistle — deeper vulnerability — At the empty community center, Jun removes his judge badge and sets it beneath the scorekeeper's clipboard. There. Now nobody can ask me to settl | D83–90 | Affection 6 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. Late window is narrow; verify reachability in simulation. |
| `jun_guest_5` | The Rule He Keeps — sustained closeness — I left the badge at home today. That sounds intentional. It is. I wanted to play one match without deciding what everyone else should do. Jun pla | D86–90 | Affection 8 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Late window is narrow; verify reachability in simulation. |

## teo

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `teo_guest_1` | Dead Air — first connection — Teo replays seven seconds of silence on his recording. The red recording light stays on long after the clip ends. There. Right after the third tu | D5–17 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. |
| `teo_guest_2` | The Highlight Reel — continued familiarity — I made a highlight reel. Kaede looks terrifying in it. Isn't that what she wanted? The paused footage shows her laughing. An earlier shot catches | D26–43 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `teo_guest_3` | A Mic Left on the Table — personal trust — They didn't ask me to host the final. I wrote half a complaint before I saw the volunteer sheet. What was on the sheet? A second column lists tra | D60–78 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `teo_guest_4` | The Quiet Broadcast — deeper vulnerability — At the arcade, Teo has left his microphone unplugged. A recording of two players thinking through a slow turn plays on his phone. This is the par | D79–90 | Affection 6 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `teo_guest_5` | The Broadcast We Keep — sustained closeness — I brought the microphone, but I am not turning it on yet. Another quiet match? A match where I ask the players what they want people to hear firs | D84–90 | Affection 8 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Late window is narrow; verify reachability in simulation. |

## iris

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `iris_guest_1` | The Unclaimed Box — first connection — Three donated deck boxes sit on the dock office counter. The attached note reads 'for whoever needs them.' No return address. The kids will love | D10–24 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. |
| `iris_guest_2` | Last Ferry — continued familiarity — I could take this delivery, but my sister's match is this afternoon. Didn't you train someone to cover for you? Her phone lights up. A message fr | D32–49 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `iris_guest_3` | Low Tide, Full Tables — personal trust — The club offered me next season's delivery schedule. Coordinator, not driver. That's good news, isn't it? A fresh timetable has an empty column m | D68–84 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `iris_guest_4` | The Route Home — deeper vulnerability — On the riverside bench, Iris turns a tournament ticket over in her hands. Her delivery bag is nowhere in sight. My sister lost her first match. S | D85–90 | Affection 6 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. Late window is narrow; verify reachability in simulation. |
| `iris_guest_5` | A Delivery of Her Own — sustained closeness — No delivery bag today. I left it with the new coordinator. How does it feel to be off the route? Strange. I keep listening for the ferry schedule | D87–90 | Affection 8 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Late window is narrow; verify reachability in simulation. |

## sol

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `sol_route_1` | An Invitation With No Instructions — first connection — You! Yes, you. How would you feel about becoming the founding champion of an event I invented twelve seconds ago? Depends. What's the event? A tr | D8–22 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `sol_route_2` | The Worst Party in Neo Harbor — continued familiarity — I booked an arcade party. Eight people RSVP'd. Two came. One is here to fix the pinball machine. So we're down to one? Two, if you stay. Three if | D26–43 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `sol_alma_cross_1` | The Dress Code Is Common Sense — continued familiarity — Alma, that coffee machine sounds like it's trying to evolve. Steam valve. Also, did you just come in from the river? A trail of wet footprints cr | D32–47 | Affection 1 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `sol_route_3` | The Girl Who Never Cancels — personal trust — Sol's been here three hours. She's ordered one lemonade and made seven festival plans. Six. Number four involved fireworks in a public library. L | D45–62 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `sol_marina_cross_1` | The River Doesn't RSVP — personal trust — The landing's closed past the rail. The water's moving too fast for games. I bought forty water balloons. Forty. And the river decides to be dram | D54–69 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `sol_route_4` | The Forecast Says No — private/emotional transition — I can't approve the riverside festival if the safety team says the water is unsafe. I know. I've already written the cancellation notice. You sou | D64–78 | Affection 5 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `sol_route_5` | When the Music Stops — final relationship decision — I brought two drinks, a blanket, and absolutely no activities. How's that for personal growth? I'm suspicious. Where's the hidden scavenger hunt? | D79–89 | Affection 6 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. Late window is narrow; verify reachability in simulation. |

## barb

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `barb_route_1` | The Wrong Side of the Label — first connection — Please tell me you haven't stepped on the little pink paper star. That's the only one I got the cut right on. Is this for a tournament? A showcas | D6–20 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `barb_route_2` | The Prototype That Won — continued familiarity — Don't look at the score machine. I just won a game with a deck box that's held together by tape. Are you testing it in the arcade? Field test. Of | D23–38 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `barb_route_3` | Two Cups, One Honest Answer — personal trust — I made a mockup. Then another. Then twelve more. None of them felt like me. You sound tired. I can stay up all night fixing a seam. Turns out you | D41–56 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `barb_route_4` | The Table With Her Name On It — private/emotional transition — I have exactly three minutes before the showcase opens, and the table banner is upside down. Want a hand? Yes—please don't laugh. They said yes t | D59–73 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `barb_route_5` | A Design With Space Left Open — final relationship decision — I brought my sketchbook, but I haven't drawn a single line. I'm trying a new thing called 'having a day off.' How's it going? I made it two hours | D76–90 | Affection 5 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## daisy

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `daisy_route_1` | The Trouble With First Impressions — first connection — That's my table. You're welcome to share it, unless you're going to shuffle like a lawn mower. I was about to say the same about your deck sleeve | D9–25 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `daisy_route_2` | Layers — continued familiarity — I brought two sketches, and before you ask, they aren't new deck boxes. You asked me here to judge outfits? I asked you here because you'll tell | D28–43 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `daisy_route_3` | The Girl Behind the Glasses — personal trust — Don't laugh. This hoodie could fit two of me. That's the point. I almost didn't recognize you. Exactly. Everyone expects me to deliver a punch li | D46–62 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `daisy_route_bridge_4` | A Name on the Door — private/emotional transition — I found a quiet corner in the café where nobody asks for a photo or a performance. And you brought me there. You have learned the difference betw | D54–64 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. Late window is narrow; verify reachability in simulation. |
| `daisy_route_4` | A Flower That Kept Growing — private/emotional transition — Do you remember asking me about the flower tattoo? The one in the middle of your chest? Yeah. I got it after a year when I thought nothing would | D65–82 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. |

## elena

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `elena_route_1` | After Closing — first connection — The branch is closed. If this is about an account, it will have to wait until morning. It’s not about an account. Then I am at a loss. Most peopl | D10–24 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `elena_route_2` | Scheduled Exception — continued familiarity — I moved a meeting to tomorrow and turned off my work phone. That is not an invitation to make fun of my calendar. You actually cleared time? I cl | D28–42 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `elena_route_3` | The Crack in the Schedule — personal trust — I left the blazer at the office. Do not read anything into it. It looks different. Everything looks different when the structure is removed. That | D46–60 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `elena_route_4` | Unscheduled — private/emotional transition — This wasn't on my calendar. I checked twice on the way over. You still came. I did. I even brought the wrong shoes for the gravel. You could have | D64–78 | Affection 5 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `elena_route_5` | Ledger Closed — final relationship decision — I stared at my calendar for ten minutes before coming. There was nothing scheduled. Is that a problem? Ordinarily I would have invented an errand | D80–90 | Affection 6 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. Late window is narrow; verify reachability in simulation. |

## jicy

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `jicy_route_1` | The Card That Almost Got Away — first connection — A card slips from the counter just as you step into the shop. Jicy catches it before it reaches the floor, then turns toward you with a bright, w | D8–20 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `jicy_route_2` | A Table for Two — continued familiarity — Jicy has saved a quiet table and brought a few deck ideas she thought you might enjoy. She looks pleased when you join her, then immediately begi | D22–38 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `jicy_route_3` | The Quiet Between Pages — personal trust — Jicy finds you in the library with a book open beside her. She has chosen a seat with room for both of you and a stack of trading-card histories | D40–56 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `jicy_route_4` | A Little More Courage — private/emotional transition — Jicy invites you to the park to test a few new card ideas. A light breeze scatters several cards across the bench before either of you can set up | D58–74 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `jicy_route_5` | The Words She Practiced — final relationship decision — Jicy asks you to meet at the café after the evening rush. She has a note folded in her hand, though she keeps checking whether she can say the wo | D76–89 | Affection 5 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## jinx

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `jinx_route_1` | Don’t Stare Too Long — first connection — You're new. Or at least I haven't seen that deck box before. Name? Is that how you welcome everyone? Only people who stop at my practice table. I | D12–24 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `jinx_route_2` | High Score or High Horse — continued familiarity — You’re still here. Either you’re stubborn or you have terrible taste in people. Maybe both. At least own it. I changed my opening after our last | D28–42 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `jinx_marina_cross_1` | Safety First, Attitude Second — personal trust — These boots have handled worse planks than that. Please look where it dips before you tell me about your boots. A loose board shifts beside a pud | D35–48 | Affection 2 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `jinx_route_3` | When the Smirk Slips — personal trust — Don’t make a big deal out of this. I just needed air that didn’t smell like arcade carpet. You okay? Define okay. I lost a match I should’ve won | D46–60 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `jinx_alma_cross_1` | The Counter Is Not a Runway — personal trust — I'm not standing on the counter. I'm sitting. Huge difference. It's where I serve drinks, Jinx. That's the difference I'm worried about. A stack | D55–68 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `jinx_route_4` | Own It or Lose It — private/emotional transition — Tournament bracket’s up. I’m in the top half. You’re either going to be in my way or on my side. Pick. You’re asking for help? I’m asking if you’ | D64–76 | Affection 5 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `jinx_route_5` | No More Performance — final relationship decision — The bracket's finished. I'm still annoyed about one turn, and I'm not telling you which. Would it help to talk it through? Maybe later. Right now | D80–90 | Affection 6 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. Late window is narrow; verify reachability in simulation. |

## laca

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `laca_route_1` | Just Like Old Times — first connection — No way. NO WAY. You're really here? Che, come here, idiot! Laca? Is that you? Who else would yell at you from a lifeguard tower? Don't step past | D1–20 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `laca_route_2` | Be Honest, Does This Look Good? — continued familiarity — Perfect timing. I need someone who's known me long enough to tell me the truth. That sounds suspiciously like a trap. I bought a new red training | D21–38 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `laca_marina_cross_1` | Two Ways to Read the Current — continued familiarity — The river looks calm from here. The current closer to the channel is stronger. Marina's trying to convince me I should say 'please' more often in | D32–50 | Affection 1 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `laca_route_3` | Personal Space? What's That? — personal trust — Shift's over! Don't move. You're about to become an unwilling participant in the Annual Summer Games. Annual? We've never done this before. That | D39–56 | Affection 3 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `laca_sol_cross_1` | Fun Stops at the Safety Line — continued familiarity — What if we ran a mini beach-themed card tournament near the waterfront? Costumes encouraged! Near the waterfront, sure. Inside the supervised swi | D53–72 | Affection 1 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `laca_route_4` | Since When Is This Weird? — private/emotional transition — Hey. Sit. I saved the seat by the window. And your favorite snack, because apparently I remember everything. You sound suspiciously serious. I wa | D57–74 | Affection 4 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `laca_route_5` | More Than Best Friends — final relationship decision — I brought two drinks and the last of those awful candies we used to love. The sunset is free. This looks familiar. Same spot we used to watch the | D75–89 | Affection 5 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## luna

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `luna_route_1` | Sorry About the Spill — first connection — Ah—sorry! I thought I had both cups. Your cards didn't get wet, did they? Just the table. Are you okay? I am. I was bringing drinks to the practi | D15–28 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `luna_route_2` | High Shelves and Low Awareness — continued familiarity — Excuse me—could you hold that box? I can't quite reach the last row. Sure. What's in it? Sleeves for the beginner night. I promised I'd help set | D30–44 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `luna_route_3` | The Stretch That Broke the Silence — personal trust — Yes! I finally got the Energy count right. Wait—don't move that box! You rebuilt the deck? I took out the cards everyone kept insisting I needed. | D48–62 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `luna_route_4` | Falling Into Understanding — private/emotional transition — I asked the shop owner to lower the supplies shelf. She said yes. It took me all week to ask. That sounds like a win. It did. Then someone picked | D65–78 | Affection 5 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `luna_route_5` | Still Clumsy, Still Me — final relationship decision — I brought an extra playmat today. And I checked the chair legs. Twice. Prepared for anything? Not anything. I still dropped my deck on the way in | D80–90 | Affection 6 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. Late window is narrow; verify reachability in simulation. |

## lyla

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `lyla_route_1` | The Girl Behind the Contact Sheet — first connection — At the card shop, a very short, pale-blonde woman studies two expensive cards through the glass. A garment bag hangs from her shoulder beside a s | D8–19 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `lyla_route_2` | Lookbook, Take Seven — continued familiarity — Lyla texts you a location and a single instruction: 'Bring water.' The cafe's upstairs room has become a temporary studio for an adult streetwear | D20–32 | Affection 1 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `lyla_route_3` | The Contract in Fine Print — personal trust — You join Lyla at a studio lobby after a fitness campaign fitting. Her athletic outfit is practical: a fitted training top, running shorts and sne | D33–45 | Affection 2 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `lyla_route_4` | Runway Without an Audience — private/emotional transition — An evening editorial shoot ends near the arcade. Lyla has swapped a tailored jacket and pleated skirt for her usual cat-print top and baggy jeans | D46–58 | Affection 2 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `lyla_route_5` | The Smile They Couldn't Direct — private/emotional transition — A small outdoor fashion editorial uses soft summer layers, colorful jackets and casual dresses. The photographer has been asking Lyla to smile fo | D59–71 | Affection 3 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. |
| `lyla_route_6` | A Cover of Her Own — private/emotional transition — A magazine has offered Lyla a cover. The proposed styling mixes youthful streetwear for adult readers, a tailored suit and a bright sleeveless su | D72–84 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. |
| `lyla_route_7` | Outside the Frame — final relationship decision — The cover is out. Lyla arrives at a quiet café in her favorite jeans and sleeveless cat top, carrying a small envelope and her deck box. I signed | D85–90 | Affection 4 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. Late window is narrow; verify reachability in simulation. |

## rina

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `rina_route_1` | After the Final Song — first connection — Ah, you stayed until the end! Most people leave after the last encore. Did you like the show? I did. But I also noticed the deck box on your bag. | D7–20 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `rina_route_2` | Between Rehearsals — continued familiarity — I've got half an hour before vocal warm-ups. I brought a deck and an alarm. This is efficiency. You set an alarm for cards? For rehearsal! Don't | D24–38 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `rina_route_3` | The Part She Doesn’t Perform — personal trust — I wrote tomorrow's set list on the back of my deck notes. Guess which one needs more work. How's rehearsal going? Good! I keep mixing up the tran | D42–56 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `rina_route_4` | Encore for Two — private/emotional transition — I turned the encore into an acoustic rehearsal. No lights, no band, just a song I haven't dared to play for anyone. A private encore? Just a song | D60–74 | Affection 5 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `rina_route_5` | Main Set — final relationship decision — I asked my manager to leave Saturday free. The shop's doing a charity match, and my band offered to play afterward. Cards and a concert on the sa | D78–90 | Affection 6 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. |

## sierra

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `sierra_route_1` | After the Shoot — first connection — If you're here for photos, the crew packed up ten minutes ago. No photos. I saw the deck box next to your bag. Then you have better eyes than hal | D18–32 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. Any flirt here should remain indirect teasing. |
| `sierra_route_2` | Between Bookings — continued familiarity — Forty minutes before my next booking. I brought a stopwatch. You actually timed us? I told my agent I'd be ready when the car came. I meant it. A | D35–48 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. Any flirt here should remain indirect teasing. |
| `sierra_route_3` | The Only Place That Feels Real — personal trust — I lost to a kid who kept the same Basic in play for half the match. Ouch. What happened? I spent three turns waiting for a perfect hand and forgo | D52–65 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `sierra_route_4` | Off the Clock — private/emotional transition — I told my agent I can't take Sunday calls anymore. That's my practice block. Did she take it well? She said I was making her job harder. I told h | D68–80 | Affection 5 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `sierra_route_5` | Main Phase — final relationship decision — My agent came to watch a practice game. She said I looked more alive losing here than smiling through the last photo shoot. Big match? Big enough | D82–90 | Affection 6 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Commitment choice remains optional and non-exclusive. Late window is narrow; verify reachability in simulation. |

## elio

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `elio_bond_1` | A Seat at the Table — first connection — The shop's last free chair has been left half-under a crowded play table. Elio stops just short of the noise. Think there's room for another? I c | D7–90 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. |
| `elio_bond_2` | The Practice Hand — continued familiarity — Two pages of mistakes from one game. Personal best. Did you write down anything that worked? I was going to. Then I saw how much red ink I'd used | D30–90 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `elio_bond_3` | The Open Challenge — personal trust — I signed up. My name's actually on the bracket. You still have the registration slip? Every time I put it away, I take it out to check. A volunte | D51–90 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `elio_bond_4` | A Deck of His Own — deeper vulnerability — Look. New deck box. No Champion sticker on the lid. Did you keep the old one? Of course. My cousin's name's still on it. Inside the new lid is a | D73–90 | Affection 6 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `elio_bond_5` | The Match He Chose — sustained closeness — I signed up before checking whether anyone I knew would be there. That sounds like progress. It felt more like stepping onto a bridge before I co | D86–90 | Affection 8 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Late window is narrow; verify reachability in simulation. |

## alma

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `alma_bond_1` | The Table by the Window — first connection — At the café, a new player pauses by the window table. A RESERVED sign is still standing beside an empty mug. That sign's older than half the regu | D8–90 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. |
| `alma_bond_2` | After the Rush — continued familiarity — I reheated this tea three times. At this point I'm just cooking leaves. You ever get to sit at the window table? When it's empty. Which tends to | D29–90 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `alma_bond_3` | No Trophy Required — personal trust — Someone asked whether the losers can come to the café night. Imagine asking me that. Did they take a seat? Not yet. The regulars have claimed bot | D49–90 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `alma_bond_4` | A Quiet Invitation — deeper vulnerability — Shop's closed. Don't tell the regulars I let you in. Want me to help with the last few mugs? Nope. They're done. I set a second cup out for a rea | D72–90 | Affection 6 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `alma_bond_5` | The Café After Closing — sustained closeness — The chairs are stacked, the lights are low, and nobody has asked me to organize anything. You saved the best hour for yourself. I am learning. Sl | D85–90 | Affection 8 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Late window is narrow; verify reachability in simulation. |

## nereo

| Event | About | Window | Existing gate | Recommended gate | Audit note |
|---|---|---:|---:|---|---|
| `nereo_bond_1` | A Different Kind of Weather — first connection — The ferry noticeboard reports a half-hour delay. Nereo tapes down the last corner as wind whips across the landing. Twelve people have asked me w | D20–90 | Affection 0 | Rank 0 — introduction | No relationship gate; location/window and first meeting are enough. |
| `nereo_bond_2` | The Spare Battery — continued familiarity — Somebody took the spare batteries from my deck box. Left three coins. Did they leave a note? A thank-you. They could have asked. I've got plenty. | D40–90 | Affection 2 | Rank 1 — familiarity | Use a light gate; the player should reach this after one meaningful positive interaction. |
| `nereo_bond_3` | Against the Current — personal trust — The ferry's canceled tonight. Wind's too strong even for the last crossing. What about the kids waiting for the match? Still here. One's been wat | D58–90 | Affection 4 | Rank 2 — personal trust | Require demonstrated trust, but keep it reachable through normal play. |
| `nereo_bond_4` | The Crossing — deeper vulnerability — No toolkit today. I brought a deck, and that's it. You actually got the morning off? I did. The river can do whatever it likes for two hours. He | D79–90 | Affection 6 | Rank 3 — vulnerable/private | Require a deeper bond before the personal/private turn. |
| `nereo_bond_5` | The Water Can Wait — sustained closeness — The ferry is running on time. I still took the morning off. The river survived without you. Barely. But yes, it managed. Nereo watches the curren | D86–90 | Affection 8 | Rank 4 — romantic/final | Require a strong bond; this is where direct romance or max-rank intimacy belongs. Late window is narrow; verify reachability in simulation. |

## Implementation order

1. The story graph now assigns `minBondRank` metadata to main, bridge, guest, bond, and crossover events using the recommendations above.
2. Keep ordinary casual dialogue at zero relationship gain; let selected forced/random conversations award small trust or Bond Score gains.
3. Gate direct flirt/romantic choices separately from ordinary teasing.
4. Simulate perfect, average, and poor answer patterns through Day 90 before changing thresholds again.
5. Review CG placement after the narrative gates are stable; bridge scenes do not need new CGs automatically.
