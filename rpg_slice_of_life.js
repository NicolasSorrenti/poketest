'use strict';
// Non-story, short ambient encounters. Artwork is independently installed by ID.
// No time/focus cost, automatic once per scene and at most once per in-game day.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgSliceOfLife=api;
})(typeof window!=='undefined'?window:null,function(){
 const DIRECTOR=typeof module==='object'&&module.exports?require('./rpg_encounter_director'):window.NeoRpgEncounterDirector;
 const REL=typeof module==='object'&&module.exports?require('./rpg_relationships'):window.NeoRpgRelationships;
 const PACKS=typeof module==='object'&&module.exports?require('./rpg_character_packs.generated'):window.NeoRpgCharacterPacks;
 const FIT=typeof module==='object'&&module.exports?require('./rpg_akari_barb_event'):window.NeoRpgAkariBarbFitting;
 const scenes=[
  {
    "id": "hana_the_crooked_display",
    "npc": "hana",
    "place": "shop",
    "slot": 0,
    "start": 3,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "The Crooked Display",
    "intro": "Hana is standing on tiptoe, trying to straighten a handmade sign above the starter decks.",
    "line": "It was straight five minutes ago. The shop has a personal grudge against my handwriting.",
    "close": "You hold the corner while she fixes the tape. She steps down, inspects it, and gives you a grateful little salute.",
    "art": {
      "scene": "Hana is standing on tiptoe, trying to straighten a handmade sign above the starter decks. It was straight five minutes ago. The shop has a personal grudge against my handwriting.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "shop",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "hana_the_last_cup",
    "npc": "hana",
    "place": "cafe",
    "slot": 2,
    "start": 24,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Last Cup",
    "intro": "Hana has claimed a quiet corner table, her hair bow beside a nearly empty mug.",
    "line": "I told everyone I was off duty, so naturally somebody asked where we keep the sleeves.",
    "close": "She offers you the chair across from her. For a few minutes, neither of you has anywhere to be.",
    "art": {
      "scene": "Hana has claimed a quiet corner table, her hair bow beside a nearly empty mug. I told everyone I was off duty, so naturally somebody asked where we keep the sleeves.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "cafe",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "reina_a_rare_laugh",
    "npc": "reina",
    "place": "center",
    "slot": 1,
    "start": 5,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "A Rare Laugh",
    "intro": "Reina loses an argument with the practice-room vending machine; two bottles drop instead of one.",
    "line": "Don't even think about calling that a tactical victory. It was clearly a misplay.",
    "close": "She gives you the second bottle, and the brief smile she tries to hide is worth more than a rematch.",
    "art": {
      "scene": "Reina loses an argument with the practice-room vending machine; two bottles drop instead of one. Don't even think about calling that a tactical victory. It was clearly a misplay.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "center",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "reina_the_quiet_table",
    "npc": "reina",
    "place": "shop",
    "slot": 0,
    "start": 32,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Quiet Table",
    "intro": "Reina is at a table with no cards laid out, tracing a circle around a chipped spot in the wood.",
    "line": "I come here sometimes without a deck. Don't make it into an inspiring speech.",
    "close": "She admits she likes the shop best before the matches begin, when there is no one left to impress.",
    "art": {
      "scene": "Reina is at a table with no cards laid out, tracing a circle around a chipped spot in the wood. I come here sometimes without a deck. Don't make it into an inspiring speech.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "shop",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "shiori_the_unreturned_bookmark",
    "npc": "shiori",
    "place": "library",
    "slot": 1,
    "start": 4,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "The Unreturned Bookmark",
    "intro": "A carefully pressed flower slides from Shiori's borrowed book and lands at your feet.",
    "line": "That is not a clue to a mystery. It's a bookmark. Although I suppose it does have a story.",
    "close": "She takes it gently and tells you about the person who gave it to her years ago.",
    "art": {
      "scene": "A carefully pressed flower slides from Shiori's borrowed book and lands at your feet. That is not a clue to a mystery. It's a bookmark. Although I suppose it does have a story.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "library",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "shiori_an_unfinished_sketch",
    "npc": "shiori",
    "place": "cafe",
    "slot": 0,
    "start": 27,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "An Unfinished Sketch",
    "intro": "Shiori turns a napkin over before you can see the tiny sketch on its back.",
    "line": "It's the café window. I was trying to remember how the light falls before it disappears.",
    "close": "She lets you look after all, then draws an extra chair at the little table in the picture.",
    "art": {
      "scene": "Shiori turns a napkin over before you can see the tiny sketch on its back. It's the café window. I was trying to remember how the light falls before it disappears.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "cafe",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "yuna_the_prize_counter",
    "npc": "yuna",
    "place": "arcade",
    "slot": 2,
    "start": 4,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "The Prize Counter",
    "intro": "Yuna is surrounded by tickets from an arcade machine she insists she has beaten fairly.",
    "line": "If the prize is a rubber duck, it will become my official team mascot. No appeals.",
    "close": "The duck is smaller than expected. Yuna presents it to you with full tournament ceremony.",
    "art": {
      "scene": "Yuna is surrounded by tickets from an arcade machine she insists she has beaten fairly. If the prize is a rubber duck, it will become my official team mascot. No appeals.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "arcade",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "yuna_the_sticker_situation",
    "npc": "yuna",
    "place": "shop",
    "slot": 0,
    "start": 23,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Sticker Situation",
    "intro": "Yuna has stuck tiny stars all over her deck box and accidentally decorated her sleeve as well.",
    "line": "Don't tell anyone I need help. I'm establishing a reputation for artistic genius.",
    "close": "You peel off the last star together, and she secretly leaves one on your own deck case.",
    "art": {
      "scene": "Yuna has stuck tiny stars all over her deck box and accidentally decorated her sleeve as well. Don't tell anyone I need help. I'm establishing a reputation for artistic genius.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "shop",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "akari_data_versus_breakfast",
    "npc": "akari",
    "place": "library",
    "slot": 0,
    "start": 5,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "Data Versus Breakfast",
    "intro": "Akari's neat research table includes three charts, a calculator, and a completely forgotten pastry.",
    "line": "I scheduled breakfast. I forgot that eating it was a separate step.",
    "close": "She closes the spreadsheet and asks whether you know anywhere nearby that serves actual food.",
    "art": {
      "scene": "Akari's neat research table includes three charts, a calculator, and a completely forgotten pastry. I scheduled breakfast. I forgot that eating it was a separate step.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "library",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "akari_the_noncompetitive_experiment",
    "npc": "akari",
    "place": "center",
    "slot": 1,
    "start": 36,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Noncompetitive Experiment",
    "intro": "Akari asks you to help her measure how long it takes people to notice a change in the noticeboard.",
    "line": "A perfectly harmless study. No prizes, no ranking, and absolutely no sample-size argument.",
    "close": "When the results prove nothing, she laughs and says she might be learning to appreciate that.",
    "art": {
      "scene": "Akari asks you to help her measure how long it takes people to notice a change in the noticeboard. A perfectly harmless study. No prizes, no ranking, and absolutely no sample-size argument.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "center",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "camila_a_card_with_a_story",
    "npc": "camila",
    "place": "shop",
    "slot": 1,
    "start": 5,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "A Card With a Story",
    "intro": "Camila pauses while pricing a battered card, running her thumb over the sleeve's worn edge.",
    "line": "The market says it's nearly worthless. The owner says it's irreplaceable. The owner wins.",
    "close": "She sets it back in the binder without a price tag, and trusts you with the story behind it.",
    "art": {
      "scene": "Camila pauses while pricing a battered card, running her thumb over the sleeve's worn edge. The market says it's nearly worthless. The owner says it's irreplaceable. The owner wins.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "shop",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "camila_the_unsuccessful_bargain",
    "npc": "camila",
    "place": "cafe",
    "slot": 2,
    "start": 27,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Unsuccessful Bargain",
    "intro": "Camila has been negotiating with a café owner over the last slice of cake.",
    "line": "Apparently charm is not accepted as legal tender after closing time. Tragic.",
    "close": "She orders two coffees instead, then pushes one toward you as though that was the plan all along.",
    "art": {
      "scene": "Camila has been negotiating with a café owner over the last slice of cake. Apparently charm is not accepted as legal tender after closing time. Tragic.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "cafe",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "marina_the_ferry_s_wake",
    "npc": "marina",
    "place": "park",
    "slot": 0,
    "start": 4,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "The Ferry's Wake",
    "intro": "Marina has stopped along the riverside to watch the patterns left behind by a departing ferry.",
    "line": "Every boat leaves a different wake. That sounds poetic, but mostly I just like watching them.",
    "close": "You stand beside her until the ripples reach the bank and vanish into the reeds.",
    "art": {
      "scene": "Marina has stopped along the riverside to watch the patterns left behind by a departing ferry. Every boat leaves a different wake. That sounds poetic, but mostly I just like watching them.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "park",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "marina_the_map_with_no_destination",
    "npc": "marina",
    "place": "cafe",
    "slot": 1,
    "start": 31,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Map With No Destination",
    "intro": "Marina has drawn a little map of the riverside on the back of a receipt.",
    "line": "There's a bench nobody seems to use. I thought we could walk past it sometime.",
    "close": "She marks the spot with a blue star and asks you to keep the map until the next sunny day.",
    "art": {
      "scene": "Marina has drawn a little map of the riverside on the back of a receipt. There's a bench nobody seems to use. I thought we could walk past it sometime.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "cafe",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "kaede_the_sound_check",
    "npc": "kaede",
    "place": "arcade",
    "slot": 1,
    "start": 42,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "The Sound Check",
    "intro": "Kaede is fixing a loose cable on an arcade cabinet while its music loops the same two notes.",
    "line": "If this thing plays that chorus one more time, I'm challenging it to a duel.",
    "close": "The machine finally plays the right melody. Kaede pretends the triumphant grin wasn't hers.",
    "art": {
      "scene": "Kaede is fixing a loose cable on an arcade cabinet while its music loops the same two notes. If this thing plays that chorus one more time, I'm challenging it to a duel.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "arcade",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "kaede_the_patch_on_her_jacket",
    "npc": "kaede",
    "place": "park",
    "slot": 2,
    "start": 58,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Patch on Her Jacket",
    "intro": "Kaede has taken off her jacket to repair a small torn patch under a park lamp.",
    "line": "It was a gift from someone who'd hate how sentimental I'm being right now.",
    "close": "She lets you hold the thread while she finishes, then slips the jacket back on without another joke.",
    "art": {
      "scene": "Kaede has taken off her jacket to repair a small torn patch under a park lamp. It was a gift from someone who'd hate how sentimental I'm being right now.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "park",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "elena_an_unscheduled_pause",
    "npc": "elena",
    "place": "center",
    "slot": 0,
    "start": 13,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "An Unscheduled Pause",
    "intro": "Elena's agenda is open on the center table. Between two meetings she has written: ten minutes outside.",
    "line": "No, I haven't forgotten an appointment. I'm attempting a completely deliberate break.",
    "close": "She folds the planner shut and spends those ten minutes looking at the sunlight with you.",
    "art": {
      "scene": "Elena's agenda is open on the center table. Between two meetings she has written: ten minutes outside. No, I haven't forgotten an appointment. I'm attempting a completely deliberate break.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "center",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "elena_the_wrong_order",
    "npc": "elena",
    "place": "cafe",
    "slot": 1,
    "start": 33,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Wrong Order",
    "intro": "Elena studies a cup of tea that the server has mistaken for her usual order.",
    "line": "I could correct it. But I think I'd rather find out what I have been missing.",
    "close": "She takes a careful sip, looks almost surprised by her own smile, and orders the same tea again.",
    "art": {
      "scene": "Elena studies a cup of tea that the server has mistaken for her usual order. I could correct it. But I think I'd rather find out what I have been missing.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "cafe",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "jinx_lost_safety_pin",
    "npc": "jinx",
    "place": "arcade",
    "slot": 1,
    "start": 15,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "Lost Safety Pin",
    "intro": "Jinx is crouched beside an arcade machine, searching for a silver pin from her favorite jacket.",
    "line": "Before you ask, yes, I could buy another. That's not the point.",
    "close": "You spot it by a table leg. She fastens it back on and gives you a rare, unguarded thank-you.",
    "art": {
      "scene": "Jinx is crouched beside an arcade machine, searching for a silver pin from her favorite jacket. Before you ask, yes, I could buy another. That's not the point.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "arcade",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "jinx_a_shared_playlist",
    "npc": "jinx",
    "place": "park",
    "slot": 1,
    "start": 39,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "A Shared Playlist",
    "intro": "Jinx has one earbud in and is tapping a combat-boot heel against the riverside railing.",
    "line": "It's not a love song. It's a really good bass line. There is a difference.",
    "close": "She offers you the other earbud and waits to see whether you notice the chorus she loves.",
    "art": {
      "scene": "Jinx has one earbud in and is tapping a combat-boot heel against the riverside railing. It's not a love song. It's a really good bass line. There is a difference.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "park",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "laca_the_familiar_shortcut",
    "npc": "laca",
    "place": "park",
    "slot": 0,
    "start": 10,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "The Familiar Shortcut",
    "intro": "Laca is trying to remember which path you used to race down when you were kids.",
    "line": "I swear it used to be shorter. Either that, or we were much better at running.",
    "close": "She takes the long route anyway, pointing out all the things that have changed since then.",
    "art": {
      "scene": "Laca is trying to remember which path you used to race down when you were kids. I swear it used to be shorter. Either that, or we were much better at running.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "park",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "laca_the_honest_opinion",
    "npc": "laca",
    "place": "cafe",
    "slot": 2,
    "start": 51,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Honest Opinion",
    "intro": "Laca has brought two jackets to the café and wants a ruling before tomorrow's outing.",
    "line": "Don't say they both look good. You're my oldest friend; I need an actual answer.",
    "close": "When you choose one, she smiles at how quickly you remembered the colors she likes.",
    "art": {
      "scene": "Laca has brought two jackets to the café and wants a ruling before tomorrow's outing. Don't say they both look good. You're my oldest friend; I need an actual answer.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "cafe",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "luna_the_bookmark_avalanche",
    "npc": "luna",
    "place": "library",
    "slot": 0,
    "start": 17,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "The Bookmark Avalanche",
    "intro": "A handful of bookmarks scatter over the library floor as Luna opens a book upside down.",
    "line": "I promise I was being organized five seconds ago. Maybe four.",
    "close": "You help sort them by color; she is delighted to discover that one has a tiny drawing on the back.",
    "art": {
      "scene": "A handful of bookmarks scatter over the library floor as Luna opens a book upside down. I promise I was being organized five seconds ago. Maybe four.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "library",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "luna_the_courage_to_ask",
    "npc": "luna",
    "place": "cafe",
    "slot": 1,
    "start": 44,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Courage to Ask",
    "intro": "Luna is standing at the counter, rehearsing how to request a different table.",
    "line": "Would you come with me? I know it's a little thing, but I'd like to ask for myself.",
    "close": "She gets the quieter seat she wanted and celebrates with the smallest victorious fist pump.",
    "art": {
      "scene": "Luna is standing at the counter, rehearsing how to request a different table. Would you come with me? I know it's a little thing, but I'd like to ask for myself.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "cafe",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "rina_the_offstage_warm_up",
    "npc": "rina",
    "place": "arcade",
    "slot": 0,
    "start": 11,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "The Offstage Warm-Up",
    "intro": "Rina is quietly practicing a vocal exercise behind the arcade, hoping the machines will cover the sound.",
    "line": "I can perform for a crowd. Somehow humming for one person is scarier.",
    "close": "She finishes the phrase and gives you a shy bow that turns into a laugh.",
    "art": {
      "scene": "Rina is quietly practicing a vocal exercise behind the arcade, hoping the machines will cover the sound. I can perform for a crowd. Somehow humming for one person is scarier.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "arcade",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "rina_a_song_without_an_audience",
    "npc": "rina",
    "place": "park",
    "slot": 1,
    "start": 37,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "A Song Without an Audience",
    "intro": "Rina has a notebook open on her knees and keeps crossing out the same lyric.",
    "line": "It doesn't need to sound like a hit. I want it to sound like something I'd actually say.",
    "close": "She reads the new line to you without singing it, then keeps it instead of crossing it out.",
    "art": {
      "scene": "Rina has a notebook open on her knees and keeps crossing out the same lyric. It doesn't need to sound like a hit. I want it to sound like something I'd actually say.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "park",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "sierra_five_minutes_without_cameras",
    "npc": "sierra",
    "place": "cafe",
    "slot": 1,
    "start": 21,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "Five Minutes Without Cameras",
    "intro": "Sierra has slipped into a quiet café booth still carrying the bag from a photoshoot.",
    "line": "Please tell me you didn't come to ask for a pose. I have exactly five minutes to be invisible.",
    "close": "You sit opposite her. She relaxes enough to start telling you about her day on her own terms.",
    "art": {
      "scene": "Sierra has slipped into a quiet café booth still carrying the bag from a photoshoot. Please tell me you didn't come to ask for a pose. I have exactly five minutes to be invisible.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "cafe",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "sierra_a_photo_for_herself",
    "npc": "sierra",
    "place": "park",
    "slot": 0,
    "start": 45,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "A Photo for Herself",
    "intro": "Sierra has her phone propped against a tree, trying to photograph the sunlight on the river.",
    "line": "This one's not for work. Nobody gets to approve it but me.",
    "close": "She takes the picture, shows it to you with obvious pride, and pockets the phone instead of posting.",
    "art": {
      "scene": "Sierra has her phone propped against a tree, trying to photograph the sunlight on the river. This one's not for work. Nobody gets to approve it but me.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "park",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "sol_a_very_serious_picnic",
    "npc": "sol",
    "place": "park",
    "slot": 0,
    "start": 10,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "A Very Serious Picnic",
    "intro": "Sol is arranging three snacks on a bench as though preparing a formal banquet.",
    "line": "The third one is for whoever admits they forgot breakfast. I have a strong suspect.",
    "close": "She slides a wrapped pastry toward you, pleased that a simple morning has gone according to plan.",
    "art": {
      "scene": "Sol is arranging three snacks on a bench as though preparing a formal banquet. The third one is for whoever admits they forgot breakfast. I have a strong suspect.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "park",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "sol_the_dance_machine_challenge",
    "npc": "sol",
    "place": "arcade",
    "slot": 1,
    "start": 34,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Dance Machine Challenge",
    "intro": "Sol has stepped off a rhythm game, laughing too hard to look at the score.",
    "line": "I was robbed. By my own feet, apparently, but robbed nonetheless.",
    "close": "She asks you to pick the next song, and promises not to blame you if she loses again.",
    "art": {
      "scene": "Sol has stepped off a rhythm game, laughing too hard to look at the score. I was robbed. By my own feet, apparently, but robbed nonetheless.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "arcade",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "alma_before_the_caf_opens",
    "npc": "alma",
    "place": "cafe",
    "slot": 0,
    "start": 5,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "Before the Café Opens",
    "intro": "Alma is wiping down the same clean counter while the first kettle warms.",
    "line": "It's peaceful before the chairs start arguing with me. Want the first cup?",
    "close": "She sets out two mugs and enjoys the quiet until the front bell finally rings.",
    "art": {
      "scene": "Alma is wiping down the same clean counter while the first kettle warms. It's peaceful before the chairs start arguing with me. Want the first cup?",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "cafe",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "alma_the_handwritten_menu",
    "npc": "alma",
    "place": "cafe",
    "slot": 1,
    "start": 29,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Handwritten Menu",
    "intro": "Alma is considering a new handwritten menu board, complete with a crooked doodle of a mug.",
    "line": "The lettering is terrible. The soup is good. I know which one matters.",
    "close": "She lets you add a tiny flourish in the corner, then declares it part of the café's history.",
    "art": {
      "scene": "Alma is considering a new handwritten menu board, complete with a crooked doodle of a mug. The lettering is terrible. The soup is good. I know which one matters.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "cafe",
      "mood": "intimate",
      "fanservice": 0
    }
  },
  {
    "id": "iris_a_box_of_small_victories",
    "npc": "iris",
    "place": "shop",
    "slot": 1,
    "start": 13,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "A Box of Small Victories",
    "intro": "Iris carries a stack of shipping boxes into the shop, carefully protecting one dented corner.",
    "line": "Every package arrived dry. You have no idea how much of a miracle that is.",
    "close": "You take the lightest box, and she rewards the help with a story about the morning tide.",
    "art": {
      "scene": "Iris carries a stack of shipping boxes into the shop, carefully protecting one dented corner. Every package arrived dry. You have no idea how much of a miracle that is.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "shop",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "iris_the_tide_chart",
    "npc": "iris",
    "place": "park",
    "slot": 0,
    "start": 43,
    "end": 90,
    "minAffection": 2,
    "trigger": "talk",
    "title": "The Tide Chart",
    "intro": "Iris is comparing today's waterline with a weathered chart pinned inside her notebook.",
    "line": "I know the tide by sight. But I like being able to prove I'm right.",
    "close": "She lets you hold the chart against the breeze and points out the patterns you missed.",
    "art": {
      "scene": "Iris is comparing today's waterline with a weathered chart pinned inside her notebook. I know the tide by sight. But I like being able to prove I'm right.",
      "composition": "Single cinematic 16:9 game CG, character prominent, lower fifth clear for dialogue.",
      "outfit": "Use canonical character bible and a casual outfit suited to the location.",
      "expression": "Natural, character-specific slice-of-life expression.",
      "environment": "park",
      "mood": "intimate",
      "fanservice": 0
    }
  }
];
 // One-time automatic discoveries using source PNGs already in the repository.
 // A saved campaign seed determines which eligible visits reveal these CGs.
 const originalRandomCGs=[
  {
    "id": "luna_moonlit_terrace",
    "npc": "luna",
    "place": "cafe",
    "slot": 2,
    "start": 25,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "The Moonlit Terrace",
    "intro": "Beyond the café doors, the moonlight catches the terrace. Luna sits there with her deck box beside her.",
    "line": "I came here to practice an opening hand, but I think I needed a moment where nobody was watching.",
    "close": "You stay until the lights dim, talking about everything except the next match.",
    "lines": [
      {
        "speaker": "Narrator",
        "text": "Beyond the café doors, the moonlight catches the terrace. Luna sits there with her deck box beside her."
      },
      {
        "speaker": "luna",
        "text": "I came here to practice an opening hand, but I think I needed a moment where nobody was watching."
      },
      {
        "speaker": "Protagonist",
        "text": "You don't need to turn every quiet minute into practice."
      },
      {
        "speaker": "luna",
        "text": "I know. It's just nice to hear someone say it."
      },
      {
        "speaker": "Narrator",
        "text": "You stay until the lights dim, talking about everything except the next match."
      }
    ],
    "image": "/rpg-assets/events/cg/slice-life/luna_moonlit_terrace.png",
    "randomForced": true,
    "chancePercent": 52,
    "art": {
      "scene": "Beyond the café doors, the moonlight catches the terrace. Luna sits there with her deck box beside her.",
      "composition": "Approved original cinematic CG, displayed before dialogue.",
      "outfit": "Use archived original art without regeneration.",
      "expression": "Character-specific story expression.",
      "environment": "cafe",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "luna_balcony_moon",
    "npc": "luna",
    "place": "cafe",
    "slot": 2,
    "start": 44,
    "end": 90,
    "minAffection": 1,
    "trigger": "entry",
    "title": "A Balcony and a Promise",
    "intro": "A soft breeze draws you to the café balcony. Luna is watching moonlight ripple on the water.",
    "line": "I used to avoid places this high. I thought I'd trip in front of everybody.",
    "close": "She laughs and stays beside you until the last ferry light slips past.",
    "lines": [
      {
        "speaker": "Narrator",
        "text": "A soft breeze draws you to the café balcony. Luna is watching moonlight ripple on the water."
      },
      {
        "speaker": "luna",
        "text": "I used to avoid places this high. I thought I'd trip in front of everybody."
      },
      {
        "speaker": "Protagonist",
        "text": "But you came up here anyway."
      },
      {
        "speaker": "luna",
        "text": "And I remembered my deck. That's two small victories."
      },
      {
        "speaker": "Narrator",
        "text": "She laughs and stays beside you until the last ferry light slips past."
      }
    ],
    "image": "/rpg-assets/events/cg/slice-life/luna_balcony_moon.png",
    "randomForced": true,
    "chancePercent": 44,
    "art": {
      "scene": "A soft breeze draws you to the café balcony. Luna is watching moonlight ripple on the water.",
      "composition": "Approved original cinematic CG, displayed before dialogue.",
      "outfit": "Use archived original art without regeneration.",
      "expression": "Character-specific story expression.",
      "environment": "cafe",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "luna_starlit_cleanup",
    "npc": "luna",
    "place": "cafe",
    "slot": 2,
    "start": 29,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "One Last Spill",
    "intro": "The café is closing when a drink slips across the counter. Luna grabs a cloth immediately.",
    "line": "No, this one's mine to fix. Could you save those card sleeves from the puddle?",
    "close": "You finish wiping down the counter beneath the lights. Luna smiles at the dry cards.",
    "lines": [
      {
        "speaker": "Narrator",
        "text": "The café is closing when a drink slips across the counter. Luna grabs a cloth immediately."
      },
      {
        "speaker": "luna",
        "text": "No, this one's mine to fix. Could you save those card sleeves from the puddle?"
      },
      {
        "speaker": "Protagonist",
        "text": "They're safe. You've got the rest."
      },
      {
        "speaker": "luna",
        "text": "Look at that. I handled it without panicking."
      },
      {
        "speaker": "Narrator",
        "text": "You finish wiping down the counter beneath the lights. Luna smiles at the dry cards."
      }
    ],
    "image": "/rpg-assets/events/cg/slice-life/luna_starlit_cleanup.png",
    "randomForced": true,
    "chancePercent": 48,
    "art": {
      "scene": "The café is closing when a drink slips across the counter. Luna grabs a cloth immediately.",
      "composition": "Approved original cinematic CG, displayed before dialogue.",
      "outfit": "Use archived original art without regeneration.",
      "expression": "Character-specific story expression.",
      "environment": "cafe",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "sol_sunset_cafe",
    "npc": "sol",
    "place": "cafe",
    "slot": 2,
    "start": 32,
    "end": 90,
    "minAffection": 1,
    "trigger": "entry",
    "title": "A Table for No Occasion",
    "intro": "Sol has turned a corner café table into a tiny tropical celebration with no guest list or schedule.",
    "line": "Nothing is being launched. I just thought the sunset deserved a good seat.",
    "close": "She pulls out a spare chair and lets the evening unfold without an agenda.",
    "lines": [
      {
        "speaker": "Narrator",
        "text": "Sol has turned a corner café table into a tiny tropical celebration with no guest list or schedule."
      },
      {
        "speaker": "sol",
        "text": "Nothing is being launched. I just thought the sunset deserved a good seat."
      },
      {
        "speaker": "Protagonist",
        "text": "So what are we celebrating?"
      },
      {
        "speaker": "sol",
        "text": "Not needing a reason. It's new for me."
      },
      {
        "speaker": "Narrator",
        "text": "She pulls out a spare chair and lets the evening unfold without an agenda."
      }
    ],
    "image": "/rpg-assets/events/cg/slice-life/sol_sunset_cafe.png",
    "randomForced": true,
    "chancePercent": 52,
    "art": {
      "scene": "Sol has turned a corner café table into a tiny tropical celebration with no guest list or schedule.",
      "composition": "Approved original cinematic CG, displayed before dialogue.",
      "outfit": "Use archived original art without regeneration.",
      "expression": "Character-specific story expression.",
      "environment": "cafe",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "marina_coastal_duel",
    "npc": "marina",
    "place": "park",
    "slot": 2,
    "start": 27,
    "end": 90,
    "minAffection": 0,
    "trigger": "entry",
    "title": "A Match at the Waterline",
    "intro": "Two playmats lie by the waterfront in the last sunlight. Marina steadies their corners against the breeze.",
    "line": "No tournament points tonight. I want to see what my deck does when nobody keeps score.",
    "close": "You play a few friendly turns before packing up as the lamps come on.",
    "lines": [
      {
        "speaker": "Narrator",
        "text": "Two playmats lie by the waterfront in the last sunlight. Marina steadies their corners against the breeze."
      },
      {
        "speaker": "marina",
        "text": "No tournament points tonight. I want to see what my deck does when nobody keeps score."
      },
      {
        "speaker": "Protagonist",
        "text": "You still brought your lucky sleeves."
      },
      {
        "speaker": "marina",
        "text": "There's relaxed, and then there's reckless."
      },
      {
        "speaker": "Narrator",
        "text": "You play a few friendly turns before packing up as the lamps come on."
      }
    ],
    "image": "/rpg-assets/events/cg/slice-life/marina_coastal_duel.png",
    "randomForced": true,
    "chancePercent": 47,
    "art": {
      "scene": "Two playmats lie by the waterfront in the last sunlight. Marina steadies their corners against the breeze.",
      "composition": "Approved original cinematic CG, displayed before dialogue.",
      "outfit": "Use archived original art without regeneration.",
      "expression": "Character-specific story expression.",
      "environment": "park",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "marina_seaside_cards",
    "npc": "marina",
    "place": "park",
    "slot": 2,
    "start": 55,
    "end": 90,
    "minAffection": 2,
    "trigger": "entry",
    "title": "The Last Hand Before Dark",
    "intro": "Near the far end of the promenade, Marina has found a quiet spot for a card game by the open water.",
    "line": "I used to think every match needed a winner. Sometimes it's enough to remember why we play.",
    "close": "The last cards land as the sunset fades. Neither of you hurries to count the score.",
    "lines": [
      {
        "speaker": "Narrator",
        "text": "Near the far end of the promenade, Marina has found a quiet spot for a card game by the open water."
      },
      {
        "speaker": "marina",
        "text": "I used to think every match needed a winner. Sometimes it's enough to remember why we play."
      },
      {
        "speaker": "Protagonist",
        "text": "Are you offering me a draw?"
      },
      {
        "speaker": "marina",
        "text": "I'm offering you one last hand before we head home."
      },
      {
        "speaker": "Narrator",
        "text": "The last cards land as the sunset fades. Neither of you hurries to count the score."
      }
    ],
    "image": "/rpg-assets/events/cg/slice-life/marina_seaside_cards.png",
    "randomForced": true,
    "chancePercent": 46,
    "art": {
      "scene": "Near the far end of the promenade, Marina has found a quiet spot for a card game by the open water.",
      "composition": "Approved original cinematic CG, displayed before dialogue.",
      "outfit": "Use archived original art without regeneration.",
      "expression": "Character-specific story expression.",
      "environment": "park",
      "mood": "everyday",
      "fanservice": 0
    }
  },
  {
    "id": "yuna_neon_harbor_match",
    "npc": "yuna",
    "place": "arcade",
    "slot": 2,
    "start": 35,
    "end": 90,
    "minAffection": 1,
    "trigger": "entry",
    "title": "The Neon Challenge",
    "intro": "Under Neo Harbor's neon lights, Yuna has claimed a table and stacked her deck into a tall tower.",
    "line": "Special rules: no prizes, no audience, and no pretending you didn't see that terrible opening hand.",
    "close": "You settle in for a friendly practice game while the arcade hums around you.",
    "lines": [
      {
        "speaker": "Narrator",
        "text": "Under Neo Harbor's neon lights, Yuna has claimed a table and stacked her deck into a tall tower."
      },
      {
        "speaker": "yuna",
        "text": "Special rules: no prizes, no audience, and no pretending you didn't see that terrible opening hand."
      },
      {
        "speaker": "Protagonist",
        "text": "Those sound like rules you'll break yourself."
      },
      {
        "speaker": "yuna",
        "text": "Only if it makes a better story."
      },
      {
        "speaker": "Narrator",
        "text": "You settle in for a friendly practice game while the arcade hums around you."
      }
    ],
    "image": "/rpg-assets/events/cg/slice-life/yuna_neon_harbor_match.png",
    "randomForced": true,
    "chancePercent": 49,
    "art": {
      "scene": "Under Neo Harbor's neon lights, Yuna has claimed a table and stacked her deck into a tall tower.",
      "composition": "Approved original cinematic CG, displayed before dialogue.",
      "outfit": "Use archived original art without regeneration.",
      "expression": "Character-specific story expression.",
      "environment": "arcade",
      "mood": "everyday",
      "fanservice": 0
    }
  }
];
 scenes.push(...originalRandomCGs);
 // The browser registry contains only packs authorized by the server for this account.
 for(const pack of PACKS?.packs||[])for(const e of pack.events.filter(e=>e.encounterType==='slice')){
  const image=pack.art.eventImages.find(a=>a.sceneId===e.id);
  scenes.push({...e,minAffection:e.minBond,image:image?.path,
   intro:e.lines[0].text,line:e.lines[1].text,close:e.lines[e.lines.length-1].text,
   art:{scene:e.title,composition:'Approved single horizontal story CG',outfit:'Approved character outfit',
    expression:'Authored everyday expression',environment:e.place,mood:'everyday',fanservice:0}});
 }
 scenes.push({...FIT.event, minAffection:0, image:FIT.cgs[0].path, cgSequence:FIT.cgs.map(x=>x.id), art:{scene:'Akari and Barb fitting a swimsuit at Barb\'s workshop.',composition:'Approved cinematic 16:9 story CG with lower fifth clear for dialogue.',outfit:'Approved swimsuit-fitting scene outfits',expression:'Natural flustered and professional expressions',environment:'Barb\'s workshop',mood:'lighthearted',fanservice:1}});
 const index=new Map(scenes.map(e=>[e.id,e]));
 const authored=(PACKS?.packs||[]).flatMap(p=>p.events);
 function scheduleOverrides(state){
  if(!state||state.day<1||state.day>90||state.sliceOfLifeLastDay===state.day||
   state.activeSliceOfLife||state.pendingDuel||state.mandatoryEventState?.active)return [];
  // Protect an existing routine stop from crowd balancing while an unseen encounter is possible.
  // This never moves a character away from their authored weekly schedule; route/meeting overrides win.
  // Pin only an eligible character's existing weekly stop while the random CG
  // is available. This prevents crowd balancing from making the event impossible.
  hydrate(state);
  const originalOverrides=originalRandomCGs.filter(e=>{
   const pack=(PACKS?.packs||[]).find(p=>p.id===e.npc);
   return pack&&pack.schedule[(state.day-1)%7]?.[state.slot]===e.place&&
    state.day>=e.start&&state.day<=e.end&&!state.sliceOfLifeDone?.[e.id]&&
    state['met_'+e.npc]&&(state.relationships?.[e.npc]?.affection||0)>=e.minAffection&&randomEligible(state,e);
  }).map(e=>({npc:e.npc,place:e.place,slot:e.slot,start:state.day,end:state.day}));
  const guestOverrides=(PACKS?.packs||[]).flatMap(pack=>{
   const place=pack.schedule[(state.day-1)%7]?.[state.slot];
   if(state.day<pack.arrivalDay||!state['met_'+pack.id])return [];
    const possible=scenes.some(e=>e.encounterType==='slice'&&e.npc===pack.id&&e.place===place&&e.slot===state.slot&&
    state.day>=e.start&&state.day<=e.end&&!state.sliceOfLifeDone?.[e.id]&&
    (!e.prerequisite||state.sliceOfLifeDone?.[e.prerequisite]||state.storyDone?.[e.prerequisite])&&
    (state.relationships?.[e.npc]?.affection||0)>=e.minAffection);
   return possible?[{npc:pack.id,place,slot:state.slot,start:state.day,end:state.day}]:[];
  });
  return [...originalOverrides,...guestOverrides];
 }
 function linesFor(state,id){
  const e=index.get(id);if(!e?.lines)return [];
  // A matching flag alone is not history: require its source scene to be completed.
  const callback=Object.entries(e.openingByFlag||{}).find(([flag])=>authored.some(source=>{
   const done=source.encounterType==='slice'?state.sliceOfLifeDone?.[source.id]:state.storyDone?.[source.id];
   return done&&source.choices?.[done.choice]?.flag===flag;
  }));
  return e.lines.map((line,i)=>({...line,text:i===0&&callback?callback[1]+' '+line.text:line.text}));
 }
 function hydrate(state){
  if(!state||typeof state!=='object')throw Error('Invalid slice-of-life save');
  if(!state.sliceOfLifeDone||typeof state.sliceOfLifeDone!=='object'||Array.isArray(state.sliceOfLifeDone))state.sliceOfLifeDone={};
  for(const [id,value] of Object.entries(state.sliceOfLifeDone))
   if(!index.has(id)||!value||!Number.isInteger(value.day)||value.day<1||value.day>90)delete state.sliceOfLifeDone[id];
  if(!Number.isInteger(state.sliceOfLifeLastDay)||state.sliceOfLifeLastDay<0||state.sliceOfLifeLastDay>90)state.sliceOfLifeLastDay=0;
  if(!Number.isInteger(state.randomForcedCGSeed)||state.randomForcedCGSeed<0)state.randomForcedCGSeed=Math.floor(Math.random()*0x7fffffff);
  const active=state.activeSliceOfLife;
  if(active){
   const e=index.get(active.id),last=e?.choices?(e.lines?.length??0):(e?.lines?.length?e.lines.length-1:2);
   if(!e||!Number.isInteger(active.step)||active.step<0||active.step>last||
    (e.choices&&active.step===last&&!e.choices[active.choice])||
    (e.choices&&state.sliceOfLifeDone[e.id]))state.activeSliceOfLife=null;
  }
  return state;
 }
 function randomEligible(state,e){
  if(!e.randomForced)return true;
  const seed=Number.isInteger(state.randomForcedCGSeed)?state.randomForcedCGSeed:0;
  let hash=2166136261;
  for(const char of e.id+':'+seed+':'+state.day+':'+state.slot)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
  return hash%100<e.chancePercent;
 }
 function available(state,people,trigger,npc=null,options={}){
  if(!state||!Array.isArray(people)||state.activeSliceOfLife||state.activeStory||state.activeSideQuest||
   state.activeArc||state.activeEncounter||state.activeSituation||state.pendingDuel||state.mandatoryEventState?.active||
   state.day>90||state.sliceOfLifeLastDay===state.day)return [];
  return scenes.filter(e=>(e.trigger===trigger||(e.encounterType==='slice'&&trigger==='talk'))&&(!options.onlyRandomForced||e.randomForced)&&randomEligible(state,e)&&(!npc||e.npc===npc)&&state.location===e.place&&state.slot===e.slot&&
   state.day>=e.start&&state.day<=e.end&&(e.participants||[e.npc]).every(id=>people.includes(id)&&state['met_'+id])&&
   (!e.prerequisite||state.sliceOfLifeDone?.[e.prerequisite]||state.storyDone?.[e.prerequisite])&&
   !state.sliceOfLifeDone?.[e.id]&&(state.relationships?.[e.npc]?.affection||0)>=e.minAffection);
 }
 function start(state,people,trigger,npc=null,options={}){
  hydrate(state);const e=DIRECTOR.select(state,available(state,people,trigger,npc,options));if(!e)return null;
  DIRECTOR.remember(state,e);
  // Legacy three-beat moments unlock on discovery; authored choices commit on completion.
  if(!e.choices)state.sliceOfLifeDone[e.id]={day:state.day,slot:state.slot};
  state.sliceOfLifeLastDay=state.day;
  state.activeSliceOfLife={id:e.id,step:0};
  return e;
 }
 function next(state){
  const a=state?.activeSliceOfLife;if(!a||!index.has(a.id))return null;
  const e=index.get(a.id);
  if(e.choices){
   if(a.step===e.lines.length){
    const choice=e.choices[a.choice];if(!choice||state.sliceOfLifeDone?.[e.id])return null;
    REL.apply(state,e.npc,choice.delta);
    state.sliceOfLifeDone[e.id]={day:state.day,slot:state.slot,choice:a.choice,flag:choice.flag};
    state.activeSliceOfLife=null;return {done:true,id:a.id};
   }
   if(a.step===e.lines.length-1)return null; // The final line requires an explicit choice.
   a.step++;return {done:false,id:a.id,step:a.step};
  }
  const last=e.lines?.length?e.lines.length-1:2;
  if(a.step===last){state.activeSliceOfLife=null;return {done:true,id:a.id};}
  a.step++;return {done:false,id:a.id,step:a.step};
 }
 function choose(state,choiceIndex){
  const a=state?.activeSliceOfLife,e=index.get(a?.id);
  if(!e?.choices||a.step!==e.lines.length-1||!Number.isInteger(choiceIndex)||!e.choices[choiceIndex])return false;
  a.choice=choiceIndex;a.step=e.lines.length;return true;
 }
 function validate(){
  const errors=[],ids=new Set();for(const e of scenes){
   if(ids.has(e.id))errors.push('duplicate '+e.id);ids.add(e.id);
   if(!e.id||!e.npc||!e.place||!['entry','talk'].includes(e.trigger)||e.slot<0||e.slot>2||
    e.start<1||e.end>90||e.start>e.end||!e.title||(!e.lines?.length&&(!e.intro||!e.line||!e.close))||
    (e.randomForced&&(!Number.isInteger(e.chancePercent)||e.chancePercent<1||e.chancePercent>100||!e.image||!e.lines?.length)))errors.push('invalid '+e.id);
  }return errors;
 }
 return Object.freeze({scenes,byId:id=>index.get(id)||null,hydrate,available,start,next,choose,linesFor,scheduleOverrides,validate});
});
