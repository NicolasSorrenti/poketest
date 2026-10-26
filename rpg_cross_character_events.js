'use strict';
// Neo Campus: optional two-person town scenes and per-CG art briefs.
// Artwork is deliberately tracked as PENDING until a real approved CG replaces its exact .webp path.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgCrossCharacterEvents=api;})(typeof window!=='undefined'?window:null,function(){
 const events=[
 {
  "id": "crossover_barb_hana_window_display",
  "npc": "barb",
  "participants": [
   "barb",
   "hana"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 0,
  "start": 10,
  "end": 90,
  "minAffection": 0,
  "title": "The Window That Ate the Shop",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A mannequin in a glittering jacket occupies most of the Lucky Draw window. Hana peers around it at the invisible booster shelves."
   },
   {
    "speaker": "hana",
    "text": "The jacket is fantastic, but now customers think we sell jackets."
   },
   {
    "speaker": "barb",
    "text": "We could sell jackets. Tiny sleeves on the mannequin, big sleeves in the booster packs."
   },
   {
    "speaker": "Protagonist",
    "text": "Can we make the cards visible without ruining the design?"
   },
   {
    "speaker": "hana",
    "text": "Please. Someone just asked if the Pokémon were included with the mannequin."
   },
   {
    "speaker": "barb",
    "text": "Fine. Half a window for fashion, half for monsters. A historic compromise."
   }
  ],
  "choices": [
   {
    "label": "Move the display together",
    "reply": "Hana can finally see the street. Barb gives the mannequin a salute.",
    "kind": "support",
    "flag": "crossover_barb_hana_window_display_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Suggest a card-themed jacket",
    "reply": "Barb starts sketching immediately. Hana insists the prices stay readable.",
    "kind": "creative",
    "flag": "crossover_barb_hana_window_display_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_hana_window_display.webp",
  "artPending": true,
  "art": {
   "scene": "Barb designs a new shop-window outfit display while Hana tries to keep customers able to see the actual cards.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "shop",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_camila_trade_coat",
  "npc": "barb",
  "participants": [
   "barb",
   "camila"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "shop",
  "slot": 0,
  "start": 12,
  "end": 90,
  "minAffection": 0,
  "title": "A Jacket for a Bargain",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Camila spreads trade receipts across Barb's measurement notebook."
   },
   {
    "speaker": "camila",
    "text": "I want pockets for cards, but nobody should see the pockets."
   },
   {
    "speaker": "barb",
    "text": "Secret card smuggling. Tasteful, actually."
   },
   {
    "speaker": "Protagonist",
    "text": "How many pockets is too many?"
   },
   {
    "speaker": "camila",
    "text": "That's the wrong question."
   },
   {
    "speaker": "barb",
    "text": "She's right. The real question is how much fabric her budget can survive."
   }
  ],
  "choices": [
   {
    "label": "Back Barb's fair quote",
    "reply": "Camila nods and offers an actual deposit for once.",
    "kind": "respect",
    "flag": "crossover_barb_camila_trade_coat_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Help Camila barter with sleeves",
    "reply": "Barb accepts a binder of rare sleeves as partial payment.",
    "kind": "playful",
    "flag": "crossover_barb_camila_trade_coat_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_camila_trade_coat.webp",
  "artPending": true,
  "art": {
   "scene": "Camila commissions a jacket lined with hidden deck pockets and keeps trying to negotiate the price.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "shop",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_laca_marina_beginner_lesson",
  "npc": "laca",
  "participants": [
   "laca",
   "marina"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 0,
  "start": 10,
  "end": 90,
  "minAffection": 0,
  "title": "The Deep End Is Optional",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Laca stands waist-deep in the designated training area. Marina grips a kickboard like it is an opponent."
   },
   {
    "speaker": "marina",
    "text": "I can navigate this entire coast. How am I bad at floating?"
   },
   {
    "speaker": "laca",
    "text": "You're fighting the water. You don't have to win against it."
   },
   {
    "speaker": "Protagonist",
    "text": "That sounds strangely like advice for a duel."
   },
   {
    "speaker": "marina",
    "text": "I'm listening, but the kickboard is judging me."
   },
   {
    "speaker": "laca",
    "text": "Exhale slowly. That's it. See? The water can do some of the work."
   }
  ],
  "choices": [
   {
    "label": "Encourage another try",
    "reply": "Marina floats for five seconds and celebrates as if she won a tournament.",
    "kind": "support",
    "flag": "crossover_laca_marina_beginner_lesson_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Offer to hold the spare board",
    "reply": "Laca hands you the board and coaches Marina through a calmer second attempt.",
    "kind": "kind",
    "flag": "crossover_laca_marina_beginner_lesson_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_laca_marina_beginner_lesson.webp",
  "artPending": true,
  "art": {
   "scene": "At the waterfront training shallows, Laca patiently coaches Marina in a new swimming technique.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_laca_sol_rescue_drill",
  "npc": "laca",
  "participants": [
   "laca",
   "sol"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "park",
  "slot": 0,
  "start": 12,
  "end": 90,
  "minAffection": 0,
  "title": "The Rescue Drill",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Bright cones mark a dry-land rescue drill beside the waterfront."
   },
   {
    "speaker": "sol",
    "text": "I've watched enough demonstrations. How hard can the throw be?"
   },
   {
    "speaker": "laca",
    "text": "You just missed the target by two meters."
   },
   {
    "speaker": "Protagonist",
    "text": "That was a very confident miss."
   },
   {
    "speaker": "sol",
    "text": "I deserved that. Show me the grip again."
   },
   {
    "speaker": "laca",
    "text": "That's why we practice on land first. No one's safety should depend on your first attempt."
   }
  ],
  "choices": [
   {
    "label": "Help reset the training cones",
    "reply": "The next throw lands neatly, and Sol gives Laca full credit.",
    "kind": "support",
    "flag": "crossover_laca_sol_rescue_drill_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Ask Laca to teach you as well",
    "reply": "Laca makes both of you repeat the drill until the ropes are tidy.",
    "kind": "curious",
    "flag": "crossover_laca_sol_rescue_drill_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_laca_sol_rescue_drill.webp",
  "artPending": true,
  "art": {
   "scene": "Sol volunteers for Laca's supervised water-safety drill and learns that confidence is not the same as preparation.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_rina_jinx_neon_rehearsal",
  "npc": "rina",
  "participants": [
   "rina",
   "jinx"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "arcade",
  "slot": 0,
  "start": 15,
  "end": 90,
  "minAffection": 0,
  "title": "Neon Rehearsal",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Jinx has taped a line of blue paper stars to the arcade floor."
   },
   {
    "speaker": "jinx",
    "text": "Cross here, look left, then the lights hit. That's your entrance."
   },
   {
    "speaker": "rina",
    "text": "I was expecting a microphone check, not choreography."
   },
   {
    "speaker": "Protagonist",
    "text": "The pinball machine seems very invested."
   },
   {
    "speaker": "jinx",
    "text": "It keeps flashing at the dramatic moments."
   },
   {
    "speaker": "rina",
    "text": "Okay. One more run. This time I won't laugh at the imaginary spotlight."
   }
  ],
  "choices": [
   {
    "label": "Volunteer as the audience",
    "reply": "Rina hits every cue, while Jinx bows as if she directed a stadium show.",
    "kind": "support",
    "flag": "crossover_rina_jinx_neon_rehearsal_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Suggest a deliberately silly entrance",
    "reply": "The rehearsal ends with all three of you laughing in the middle of the arcade.",
    "kind": "playful",
    "flag": "crossover_rina_jinx_neon_rehearsal_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_rina_jinx_neon_rehearsal.webp",
  "artPending": true,
  "art": {
   "scene": "Jinx helps Rina rehearse an entrance and turns the arcade into a miniature concert venue.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "arcade",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_akari_blueprint_night",
  "npc": "barb",
  "participants": [
   "barb",
   "akari"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "cafe",
  "slot": 2,
  "start": 18,
  "end": 90,
  "minAffection": 0,
  "title": "Precision Meets Patchwork",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A cafe table is covered with measurements, sketches and tiny scraps of fabric."
   },
   {
    "speaker": "akari",
    "text": "If the dimensions are correct, why would a fitting ever need adjustment?"
   },
   {
    "speaker": "barb",
    "text": "Because humans bend their elbows, darling."
   },
   {
    "speaker": "Protagonist",
    "text": "Her spreadsheet doesn't have an elbow column."
   },
   {
    "speaker": "akari",
    "text": "Not yet."
   },
   {
    "speaker": "barb",
    "text": "Put the ruler down and try moving. The pattern needs to follow you, not trap you."
   }
  ],
  "choices": [
   {
    "label": "Help Akari test the mock-up",
    "reply": "Akari moves freely and quietly adds 'comfort' to her criteria.",
    "kind": "support",
    "flag": "crossover_barb_akari_blueprint_night_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Ask Barb to teach a basic stitch",
    "reply": "Barb teaches you both the stitch. Akari insists on counting them.",
    "kind": "creative",
    "flag": "crossover_barb_akari_blueprint_night_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_akari_blueprint_night.webp",
  "artPending": true,
  "art": {
   "scene": "Akari brings a terrifyingly exact set of clothing measurements and Barb teaches her that a design also needs room to move.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "cafe",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_reina_akari_training_board",
  "npc": "reina",
  "participants": [
   "reina",
   "akari"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "center",
  "slot": 1,
  "start": 12,
  "end": 90,
  "minAffection": 0,
  "title": "An Impossible Opening Hand",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Reina has arranged a terrible opening hand on the practice table. Akari is drawing a branching diagram."
   },
   {
    "speaker": "reina",
    "text": "Don't tell me the odds. Tell me how you'd play it."
   },
   {
    "speaker": "akari",
    "text": "That is how I tell you how I would play it."
   },
   {
    "speaker": "Protagonist",
    "text": "You're both answering different questions."
   },
   {
    "speaker": "reina",
    "text": "Maybe the answer is both."
   },
   {
    "speaker": "akari",
    "text": "I would like that entered into the record."
   }
  ],
  "choices": [
   {
    "label": "Propose a test match",
    "reply": "They play three openings and quietly revise both theories.",
    "kind": "respect",
    "flag": "crossover_reina_akari_training_board_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Suggest swapping roles",
    "reply": "Reina calculates the odds while Akari tries improvising. They learn more than expected.",
    "kind": "playful",
    "flag": "crossover_reina_akari_training_board_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_reina_akari_training_board.webp",
  "artPending": true,
  "art": {
   "scene": "Reina wants intuition, Akari wants probabilities, and the community practice board gets filled with both.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "center",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_hana_akari_shop_labels",
  "npc": "hana",
  "participants": [
   "hana",
   "akari"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "cafe",
  "slot": 2,
  "start": 13,
  "end": 90,
  "minAffection": 0,
  "title": "The Labels Are Lying",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Hana has covered a cafe napkin in a color-coded inventory scheme."
   },
   {
    "speaker": "hana",
    "text": "This label says 'rare-ish'. That's not a set symbol."
   },
   {
    "speaker": "akari",
    "text": "It also isn't a category."
   },
   {
    "speaker": "Protagonist",
    "text": "It is a very optimistic adjective."
   },
   {
    "speaker": "hana",
    "text": "My handwriting got artistic under pressure."
   },
   {
    "speaker": "akari",
    "text": "I can make a sorting system that leaves room for the art."
   }
  ],
  "choices": [
   {
    "label": "Offer to test the new labels",
    "reply": "Hana can find every set within a minute. Akari permits one decorative star.",
    "kind": "kind",
    "flag": "crossover_hana_akari_shop_labels_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Defend the dramatic labels",
    "reply": "Akari agrees on a legend, provided every symbol means something.",
    "kind": "playful",
    "flag": "crossover_hana_akari_shop_labels_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_hana_akari_shop_labels.webp",
  "artPending": true,
  "art": {
   "scene": "Hana asks Akari to decipher confusing inventory labels and accidentally starts an argument about beautiful handwriting.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "cafe",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_yuna_jinx_arcade_paint",
  "npc": "yuna",
  "participants": [
   "yuna",
   "jinx"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "arcade",
  "slot": 1,
  "start": 14,
  "end": 90,
  "minAffection": 0,
  "title": "A Cabinet with a Personality",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A retired arcade cabinet has been moved into the workshop corner and covered with safe, washable paint."
   },
   {
    "speaker": "yuna",
    "text": "What if it counted how many times someone changed their mind?"
   },
   {
    "speaker": "jinx",
    "text": "Then yours would overflow by lunch."
   },
   {
    "speaker": "Protagonist",
    "text": "Can it just show the tournament schedule?"
   },
   {
    "speaker": "jinx",
    "text": "Boring. Practical. Somehow acceptable."
   },
   {
    "speaker": "yuna",
    "text": "Only if we get a high-score board for the cleanest brush strokes."
   }
  ],
  "choices": [
   {
    "label": "Paint a side panel with them",
    "reply": "Jinx signs the cabinet; Yuna adds a tiny crown to your painted shape.",
    "kind": "creative",
    "flag": "crossover_yuna_jinx_arcade_paint_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Design a useful event board",
    "reply": "The finished cabinet finally tells visitors what is happening tonight.",
    "kind": "respect",
    "flag": "crossover_yuna_jinx_arcade_paint_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_yuna_jinx_arcade_paint.webp",
  "artPending": true,
  "art": {
   "scene": "Jinx paints an old arcade cabinet while Yuna argues it needs a score counter for absolutely everything.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "arcade",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_yuna_arcade_costume",
  "npc": "barb",
  "participants": [
   "barb",
   "yuna"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "arcade",
  "slot": 1,
  "start": 14,
  "end": 90,
  "minAffection": 0,
  "title": "The Champion's Entrance",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Yuna has drawn lightning bolts on a cafe receipt and brought it to the arcade."
   },
   {
    "speaker": "yuna",
    "text": "I need a jacket that says 'final boss'."
   },
   {
    "speaker": "barb",
    "text": "You need one you can sit down in."
   },
   {
    "speaker": "Protagonist",
    "text": "What if it does both?"
   },
   {
    "speaker": "yuna",
    "text": "See? Vision."
   },
   {
    "speaker": "barb",
    "text": "Fine. Dramatic shoulders, sensible seams. No cape near the machines."
   }
  ],
  "choices": [
   {
    "label": "Help choose the fabric",
    "reply": "Yuna picks a bold lining; Barb makes her practice sitting before approving it.",
    "kind": "creative",
    "flag": "crossover_barb_yuna_arcade_costume_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Volunteer to model the prototype",
    "reply": "Both designers make you walk across the arcade in exaggerated seriousness.",
    "kind": "playful",
    "flag": "crossover_barb_yuna_arcade_costume_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_yuna_arcade_costume.webp",
  "artPending": true,
  "art": {
   "scene": "Yuna wants a jacket dramatic enough for a final-round entrance, and Barb refuses to sacrifice usable pockets.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "arcade",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_laca_luna_calm_water",
  "npc": "laca",
  "participants": [
   "laca",
   "luna"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 1,
  "start": 18,
  "end": 90,
  "minAffection": 0,
  "title": "Counting Ripples",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Luna stands by the shallow steps, staring at the changing reflections."
   },
   {
    "speaker": "luna",
    "text": "I came here to feel calm. Now I'm thinking about everything."
   },
   {
    "speaker": "laca",
    "text": "Count five ripples. You don't need to catch any of them."
   },
   {
    "speaker": "Protagonist",
    "text": "I've never heard mindfulness sound like a swimming lesson."
   },
   {
    "speaker": "luna",
    "text": "It's helping, actually."
   },
   {
    "speaker": "laca",
    "text": "Good. We can stop there. No one earns points for forcing themselves to relax."
   }
  ],
  "choices": [
   {
    "label": "Join their quiet exercise",
    "reply": "For a minute, the three of you listen to the water without trying to fill the silence.",
    "kind": "kind",
    "flag": "crossover_laca_luna_calm_water_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Bring them a warm drink afterward",
    "reply": "Luna smiles into the cup and asks if they can do this again.",
    "kind": "support",
    "flag": "crossover_laca_luna_calm_water_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_laca_luna_calm_water.webp",
  "artPending": true,
  "art": {
   "scene": "Luna has trouble relaxing beside the river, and Laca teaches a grounding exercise using the rhythm of the water.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_reina_camila_trade_strategy",
  "npc": "reina",
  "participants": [
   "reina",
   "camila"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 0,
  "start": 17,
  "end": 90,
  "minAffection": 0,
  "title": "A Fair Price for Victory",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A prized card sits between Reina's deck list and Camila's trade binder."
   },
   {
    "speaker": "camila",
    "text": "This price includes one explanation of why you run that odd trainer."
   },
   {
    "speaker": "reina",
    "text": "You can't charge for advice and then ask for it."
   },
   {
    "speaker": "Protagonist",
    "text": "That is an inventive economy."
   },
   {
    "speaker": "camila",
    "text": "It works. The card isn't going anywhere."
   },
   {
    "speaker": "reina",
    "text": "Fine. One explanation. Then you tell me what you'd cut."
   }
  ],
  "choices": [
   {
    "label": "Moderate the trade",
    "reply": "They agree on a fair exchange and spend longer discussing decks than money.",
    "kind": "respect",
    "flag": "crossover_reina_camila_trade_strategy_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Offer a mischievous counteroffer",
    "reply": "Camila laughs and throws in a free sleeve; Reina pretends she isn't amused.",
    "kind": "playful",
    "flag": "crossover_reina_camila_trade_strategy_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_reina_camila_trade_strategy.webp",
  "artPending": true,
  "art": {
   "scene": "Camila offers to trade Reina a card she needs, but insists the exchange include one honest strategy lesson.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "shop",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_akari_shiori_old_rules",
  "npc": "akari",
  "participants": [
   "akari",
   "shiori"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "library",
  "slot": 1,
  "start": 12,
  "end": 90,
  "minAffection": 0,
  "title": "The Footnote War",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A historical rules booklet lies open between Akari and Shiori."
   },
   {
    "speaker": "akari",
    "text": "That exception isn't in my notes."
   },
   {
    "speaker": "shiori",
    "text": "Because you copied the appendix from the later edition."
   },
   {
    "speaker": "Protagonist",
    "text": "So history just won the argument?"
   },
   {
    "speaker": "akari",
    "text": "History has provided a new input."
   },
   {
    "speaker": "shiori",
    "text": "I'll take that as a compliment. Let me show you the original page."
   }
  ],
  "choices": [
   {
    "label": "Help compare the two editions",
    "reply": "They annotate the differences, then agree to label the copies properly.",
    "kind": "respect",
    "flag": "crossover_akari_shiori_old_rules_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Play referee for the debate",
    "reply": "Shiori wins the first round; Akari demands a second with better citations.",
    "kind": "playful",
    "flag": "crossover_akari_shiori_old_rules_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_akari_shiori_old_rules.webp",
  "artPending": true,
  "art": {
   "scene": "Shiori finds a handwritten old-rules footnote that overturns Akari's supposedly airtight interpretation.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "library",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_yuna_kaede_scoreboard",
  "npc": "yuna",
  "participants": [
   "yuna",
   "kaede"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "arcade",
  "slot": 1,
  "start": 43,
  "end": 90,
  "minAffection": 0,
  "title": "The Scoreboard Pact",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A scoreboard has two names on it and suspiciously identical totals."
   },
   {
    "speaker": "yuna",
    "text": "A tie is just a very long dramatic pause."
   },
   {
    "speaker": "kaede",
    "text": "A tie means the scoring system is poorly designed."
   },
   {
    "speaker": "Protagonist",
    "text": "I can supervise one last round."
   },
   {
    "speaker": "yuna",
    "text": "Prepare to witness greatness."
   },
   {
    "speaker": "kaede",
    "text": "Prepare to write down the actual score this time."
   }
  ],
  "choices": [
   {
    "label": "Keep a perfectly fair score",
    "reply": "They shake hands after a close round and immediately demand a rematch.",
    "kind": "respect",
    "flag": "crossover_yuna_kaede_scoreboard_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Invent a cooperative final challenge",
    "reply": "They beat the machine together and disagree over who carried the team.",
    "kind": "playful",
    "flag": "crossover_yuna_kaede_scoreboard_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_yuna_kaede_scoreboard.webp",
  "artPending": true,
  "art": {
   "scene": "Kaede and Yuna compete over a charity arcade challenge and refuse to admit they're having fun.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "arcade",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_rina_barb_poster_fit",
  "npc": "rina",
  "participants": [
   "rina",
   "barb"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "cafe",
  "slot": 2,
  "start": 16,
  "end": 90,
  "minAffection": 0,
  "title": "A Poster That Sings",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Rina's set list and Barb's color swatches share a cafe table."
   },
   {
    "speaker": "rina",
    "text": "Everyone draws me under a spotlight."
   },
   {
    "speaker": "barb",
    "text": "I want the poster to show the girl who stays after rehearsal, too."
   },
   {
    "speaker": "Protagonist",
    "text": "That's the person your audience comes back for."
   },
   {
    "speaker": "rina",
    "text": "That's kind of sweet. Also terrifying."
   },
   {
    "speaker": "barb",
    "text": "Good posters do that sometimes. What color feels like home to you?"
   }
  ],
  "choices": [
   {
    "label": "Help choose the warmer palette",
    "reply": "Rina picks an unexpected color and Barb builds the whole layout around it.",
    "kind": "creative",
    "flag": "crossover_rina_barb_poster_fit_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Suggest a tiny hidden detail for fans",
    "reply": "Barb adds a little symbol only the three of you will recognize.",
    "kind": "kind",
    "flag": "crossover_rina_barb_poster_fit_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_rina_barb_poster_fit.webp",
  "artPending": true,
  "art": {
   "scene": "Rina asks Barb for concert-poster art; Barb wants to reflect Rina's quieter self as well as her stage persona.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "cafe",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_laca_rina_safe_stage",
  "npc": "laca",
  "participants": [
   "laca",
   "rina"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "park",
  "slot": 1,
  "start": 14,
  "end": 90,
  "minAffection": 0,
  "title": "Steps Before the Spotlight",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Rina practices along the riverside path while Laca checks a portable hydration station."
   },
   {
    "speaker": "rina",
    "text": "The big note is fine. Walking onto the stage is the hard part."
   },
   {
    "speaker": "laca",
    "text": "You're breathing like you're racing somebody."
   },
   {
    "speaker": "Protagonist",
    "text": "The stage isn't going anywhere."
   },
   {
    "speaker": "rina",
    "text": "My heart disagrees."
   },
   {
    "speaker": "laca",
    "text": "Then we start with ten quiet breaths. No show is worth burning out for."
   }
  ],
  "choices": [
   {
    "label": "Count the breathing rhythm",
    "reply": "Rina's shoulders settle. She thanks Laca for not calling it stage fright.",
    "kind": "support",
    "flag": "crossover_laca_rina_safe_stage_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Suggest a low-pressure rehearsal",
    "reply": "Rina sings a single verse by the river and seems lighter afterward.",
    "kind": "kind",
    "flag": "crossover_laca_rina_safe_stage_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_laca_rina_safe_stage.webp",
  "artPending": true,
  "art": {
   "scene": "Laca coaches Rina's breathing and posture for an outdoor performance after Rina admits she's exhausted.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_marina_sierra_tide_sketch",
  "npc": "marina",
  "participants": [
   "marina",
   "sierra"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 0,
  "start": 20,
  "end": 90,
  "minAffection": 0,
  "title": "The Map with No Shortcut",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A map has been weighted down with smooth stones near the river."
   },
   {
    "speaker": "sierra",
    "text": "The old path is shorter."
   },
   {
    "speaker": "marina",
    "text": "And flooded after rain. That's what the red pencil means."
   },
   {
    "speaker": "Protagonist",
    "text": "A scenic route that stays dry sounds better."
   },
   {
    "speaker": "sierra",
    "text": "I was hoping for an adventure."
   },
   {
    "speaker": "marina",
    "text": "Good adventures are easier when nobody needs rescuing."
   }
  ],
  "choices": [
   {
    "label": "Help mark the safe route",
    "reply": "They add clear warning signs and plan a guided walk for visitors.",
    "kind": "support",
    "flag": "crossover_marina_sierra_tide_sketch_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Volunteer for a test walk",
    "reply": "Sierra leads the way while Marina checks each crossing.",
    "kind": "curious",
    "flag": "crossover_marina_sierra_tide_sketch_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_marina_sierra_tide_sketch.webp",
  "artPending": true,
  "art": {
   "scene": "Marina and Sierra compare notes on the changing shoreline and decide how to make a safe walking route.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_sol_sierra_sunset_photos",
  "npc": "sol",
  "participants": [
   "sol",
   "sierra"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "park",
  "slot": 0,
  "start": 21,
  "end": 90,
  "minAffection": 0,
  "title": "Two Ways to Catch a Sunset",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Sol adjusts a camera while Sierra watches a family laugh near the promenade."
   },
   {
    "speaker": "sol",
    "text": "The light is perfect for about thirty seconds."
   },
   {
    "speaker": "sierra",
    "text": "Then stop adjusting and look at it."
   },
   {
    "speaker": "Protagonist",
    "text": "Maybe the subject doesn't have to be perfect."
   },
   {
    "speaker": "sol",
    "text": "I hate how reasonable that sounds."
   },
   {
    "speaker": "sierra",
    "text": "Come on. One photograph, then we put the camera down."
   }
  ],
  "choices": [
   {
    "label": "Offer to take a group photo",
    "reply": "The picture is imperfect and immediately becomes everyone's favorite.",
    "kind": "kind",
    "flag": "crossover_sol_sierra_sunset_photos_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Help Sol catch the last glow",
    "reply": "She gets the shot, then hands the camera over to enjoy the view.",
    "kind": "creative",
    "flag": "crossover_sol_sierra_sunset_photos_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_sol_sierra_sunset_photos.webp",
  "artPending": true,
  "art": {
   "scene": "Sol wants a perfect sunset photo; Sierra wants a picture of the people enjoying it.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_elena_luna_tea_notes",
  "npc": "elena",
  "participants": [
   "elena",
   "luna"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "cafe",
  "slot": 1,
  "start": 20,
  "end": 90,
  "minAffection": 0,
  "title": "A Quiet Table for Two",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "An unsigned strategy note is tucked underneath a cafe menu."
   },
   {
    "speaker": "elena",
    "text": "Someone's missing an important page."
   },
   {
    "speaker": "luna",
    "text": "We could leave it at the counter."
   },
   {
    "speaker": "Protagonist",
    "text": "It has the center's date on it. We can make sure it gets back."
   },
   {
    "speaker": "elena",
    "text": "After we finish this tea, please."
   },
   {
    "speaker": "luna",
    "text": "Yes. One small kindness at a time."
   }
  ],
  "choices": [
   {
    "label": "Take the note to the counter",
    "reply": "The owner is found, and their tea is still warm when you return.",
    "kind": "support",
    "flag": "crossover_elena_luna_tea_notes_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Stay and keep their break peaceful",
    "reply": "Elena handles the note later. Luna says she needed a moment like this.",
    "kind": "kind",
    "flag": "crossover_elena_luna_tea_notes_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_elena_luna_tea_notes.webp",
  "artPending": true,
  "art": {
   "scene": "Elena and Luna try to share a peaceful cafe break until a lost tournament note finds its way to their table.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "cafe",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_reina_shiori_history_match",
  "npc": "reina",
  "participants": [
   "reina",
   "shiori"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "park",
  "slot": 1,
  "start": 20,
  "end": 90,
  "minAffection": 0,
  "title": "Champions in the Margins",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Reina turns a fragile notebook page carefully."
   },
   {
    "speaker": "reina",
    "text": "They came back from that board position?"
   },
   {
    "speaker": "shiori",
    "text": "Yes. The champion's own notes call it luck."
   },
   {
    "speaker": "Protagonist",
    "text": "Does that make the victory less impressive?"
   },
   {
    "speaker": "reina",
    "text": "No. It makes the next move more interesting."
   },
   {
    "speaker": "shiori",
    "text": "Exactly. History's better when it includes the mistakes."
   }
  ],
  "choices": [
   {
    "label": "Ask them to recreate the game",
    "reply": "They reconstruct the final turn and laugh at a forgotten rule.",
    "kind": "curious",
    "flag": "crossover_reina_shiori_history_match_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Suggest a friendly match inspired by it",
    "reply": "Reina challenges Shiori to try the old strategy tomorrow.",
    "kind": "playful",
    "flag": "crossover_reina_shiori_history_match_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_reina_shiori_history_match.webp",
  "artPending": true,
  "art": {
   "scene": "Shiori shows Reina an old tournament notebook; Reina discovers the famous winner nearly lost the final.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_jinx_laca_reflective_vest",
  "npc": "jinx",
  "participants": [
   "jinx",
   "laca"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 1,
  "start": 19,
  "end": 90,
  "minAffection": 0,
  "title": "The Reflective-Vest Makeover",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Jinx holds a sheet of reflective star decals beside Laca's plain demonstration vest."
   },
   {
    "speaker": "jinx",
    "text": "It needs personality."
   },
   {
    "speaker": "laca",
    "text": "It needs to remain visible in an emergency."
   },
   {
    "speaker": "Protagonist",
    "text": "Those things aren't mutually exclusive."
   },
   {
    "speaker": "jinx",
    "text": "Fine. Functional stars. Responsible rebellion."
   },
   {
    "speaker": "laca",
    "text": "Now that's a design brief I can sign."
   }
  ],
  "choices": [
   {
    "label": "Check the visibility from a distance",
    "reply": "The decals sparkle without obscuring a single safety label.",
    "kind": "respect",
    "flag": "crossover_jinx_laca_reflective_vest_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Help arrange a subtle pattern",
    "reply": "Laca likes it so much she asks for a matching spare.",
    "kind": "creative",
    "flag": "crossover_jinx_laca_reflective_vest_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_jinx_laca_reflective_vest.webp",
  "artPending": true,
  "art": {
   "scene": "Jinx offers to customize Laca's training vest without compromising any safety markings.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_sierra_measurement_mixup",
  "npc": "barb",
  "participants": [
   "barb",
   "sierra"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "cafe",
  "slot": 2,
  "start": 22,
  "end": 90,
  "minAffection": 0,
  "title": "The Wrong Measurements",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Sierra opens a notebook full of trail maps where clothing measurements should be."
   },
   {
    "speaker": "sierra",
    "text": "I grabbed the wrong one."
   },
   {
    "speaker": "barb",
    "text": "These are not measurements. This is a topographic map."
   },
   {
    "speaker": "Protagonist",
    "text": "Maybe the pockets could fit a folded trail map?"
   },
   {
    "speaker": "sierra",
    "text": "Now we're getting somewhere."
   },
   {
    "speaker": "barb",
    "text": "Unexpectedly, that is the smartest thing I've heard all day."
   }
  ],
  "choices": [
   {
    "label": "Sketch the pocket with Barb",
    "reply": "They settle on a sturdy jacket with an ingenious map pocket.",
    "kind": "creative",
    "flag": "crossover_barb_sierra_measurement_mixup_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Help Sierra find the right measurements",
    "reply": "Sierra returns prepared, and Barb keeps the pocket idea anyway.",
    "kind": "kind",
    "flag": "crossover_barb_sierra_measurement_mixup_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_sierra_measurement_mixup.webp",
  "artPending": true,
  "art": {
   "scene": "Sierra brings the wrong notebook to a fitting consultation, and Barb designs around an unexpected idea.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "cafe",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_laca_marina_second_lesson",
  "npc": "laca",
  "participants": [
   "laca",
   "marina"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "park",
  "slot": 0,
  "start": 27,
  "end": 90,
  "minAffection": 0,
  "title": "Beyond the Kickboard",
  "prerequisite": "crossover_laca_marina_beginner_lesson",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Marina lays her old kickboard beside the lane rope."
   },
   {
    "speaker": "marina",
    "text": "Don't look so surprised. I practiced."
   },
   {
    "speaker": "laca",
    "text": "I'm not surprised. I'm proud."
   },
   {
    "speaker": "Protagonist",
    "text": "The kickboard looks unemployed."
   },
   {
    "speaker": "marina",
    "text": "It can retire with honors."
   },
   {
    "speaker": "laca",
    "text": "One short lap, then a proper rest. Confidence still follows the rules."
   }
  ],
  "choices": [
   {
    "label": "Cheer from the poolside",
    "reply": "Marina completes the lap and gives the kickboard a ceremonial salute.",
    "kind": "support",
    "flag": "crossover_laca_marina_second_lesson_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Ask Marina how she learned to relax",
    "reply": "She admits she kept hearing Laca's advice to stop fighting the water.",
    "kind": "kind",
    "flag": "crossover_laca_marina_second_lesson_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_laca_marina_second_lesson.webp",
  "artPending": true,
  "art": {
   "scene": "Marina returns after her first lesson and surprises Laca by swimming a short supervised distance without the board.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_hana_ribbon_return",
  "npc": "barb",
  "participants": [
   "barb",
   "hana"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "shop",
  "slot": 0,
  "start": 24,
  "end": 90,
  "minAffection": 0,
  "title": "The Window Strikes Back",
  "prerequisite": "crossover_barb_hana_window_display",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "The famous mannequin's ribbon has come loose just before opening."
   },
   {
    "speaker": "hana",
    "text": "We have exactly five minutes before the first customer."
   },
   {
    "speaker": "barb",
    "text": "And exactly one ribbon determined to become a kite."
   },
   {
    "speaker": "Protagonist",
    "text": "We have survived this window before."
   },
   {
    "speaker": "hana",
    "text": "That's what you said before it fell over."
   },
   {
    "speaker": "barb",
    "text": "Less talking, more tape. This is our sequel."
   }
  ],
  "choices": [
   {
    "label": "Secure the display together",
    "reply": "The ribbon holds, and Hana puts a tiny 'season two' sign in the window.",
    "kind": "support",
    "flag": "crossover_barb_hana_ribbon_return_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Turn the loose ribbon into a bow",
    "reply": "Barb calls the accident her best design revision yet.",
    "kind": "creative",
    "flag": "crossover_barb_hana_ribbon_return_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_hana_ribbon_return.webp",
  "artPending": true,
  "art": {
   "scene": "The shop-window display becomes a minor neighborhood attraction until a mischievous breeze threatens Barb's perfect ribbons.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "shop",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_rina_jinx_postshow_cleanup",
  "npc": "rina",
  "participants": [
   "rina",
   "jinx"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "arcade",
  "slot": 0,
  "start": 28,
  "end": 90,
  "minAffection": 0,
  "title": "After the Applause",
  "prerequisite": "crossover_rina_jinx_neon_rehearsal",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Paper stars from the first rehearsal are being peeled off the arcade floor."
   },
   {
    "speaker": "rina",
    "text": "I thought I'd be happier once people started coming to the shows."
   },
   {
    "speaker": "jinx",
    "text": "Are you not?"
   },
   {
    "speaker": "rina",
    "text": "I am. I'm also scared they'll stop."
   },
   {
    "speaker": "Protagonist",
    "text": "Those feelings can exist together."
   },
   {
    "speaker": "jinx",
    "text": "Then we keep making things worth showing. One star at a time."
   }
  ],
  "choices": [
   {
    "label": "Help store the old stars",
    "reply": "Rina saves one star inside her set-list notebook.",
    "kind": "kind",
    "flag": "crossover_rina_jinx_postshow_cleanup_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Ask what they'll build for the next show",
    "reply": "Jinx reveals a sketch, and Rina immediately wants to rehearse it.",
    "kind": "creative",
    "flag": "crossover_rina_jinx_postshow_cleanup_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_rina_jinx_postshow_cleanup.webp",
  "artPending": true,
  "art": {
   "scene": "Rina and Jinx take down the rehearsal decorations and talk about how frightening it is when a dream starts becoming real.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "arcade",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_reina_akari_rematch_model",
  "npc": "reina",
  "participants": [
   "reina",
   "akari"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "center",
  "slot": 1,
  "start": 26,
  "end": 90,
  "minAffection": 0,
  "title": "The Model That Lost",
  "prerequisite": "crossover_reina_akari_training_board",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Akari's calculation sheet is open beside a very unusual practice hand."
   },
   {
    "speaker": "akari",
    "text": "My model says you retreat."
   },
   {
    "speaker": "reina",
    "text": "Your model isn't wrong. It just hasn't met me today."
   },
   {
    "speaker": "Protagonist",
    "text": "That's a bold way to test a prediction."
   },
   {
    "speaker": "akari",
    "text": "Then play the turn. I want to see why."
   },
   {
    "speaker": "reina",
    "text": "Good. Curiosity is a better rival than certainty."
   }
  ],
  "choices": [
   {
    "label": "Help analyze the surprising play",
    "reply": "Akari adds a note labeled 'human factors' and Reina grins.",
    "kind": "respect",
    "flag": "crossover_reina_akari_rematch_model_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Ask them to switch decks",
    "reply": "Both admit the other person's plan had strengths they missed.",
    "kind": "curious",
    "flag": "crossover_reina_akari_rematch_model_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_reina_akari_rematch_model.webp",
  "artPending": true,
  "art": {
   "scene": "Akari's opening-hand model predicts Reina's next choice, but Reina decides to show her something the model missed.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "center",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_akari_wearable_math",
  "npc": "barb",
  "participants": [
   "barb",
   "akari"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "cafe",
  "slot": 2,
  "start": 31,
  "end": 90,
  "minAffection": 0,
  "title": "A Formula for Comfort",
  "prerequisite": "crossover_barb_akari_blueprint_night",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A finished garment sketch rests on top of the old measurements."
   },
   {
    "speaker": "akari",
    "text": "The revised cut is 3.4 percent more flexible."
   },
   {
    "speaker": "barb",
    "text": "How does it feel?"
   },
   {
    "speaker": "Protagonist",
    "text": "You could just put on the sample jacket."
   },
   {
    "speaker": "akari",
    "text": "I did. It feels surprisingly good."
   },
   {
    "speaker": "barb",
    "text": "There's your real result. Some discoveries need fewer decimal places."
   }
  ],
  "choices": [
   {
    "label": "Help label the updated pattern",
    "reply": "Akari writes 'tested by humans' under the dimensions.",
    "kind": "creative",
    "flag": "crossover_barb_akari_wearable_math_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Ask Akari to teach you the math",
    "reply": "Barb falls asleep halfway through the formula and wakes up laughing.",
    "kind": "playful",
    "flag": "crossover_barb_akari_wearable_math_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_akari_wearable_math.webp",
  "artPending": true,
  "art": {
   "scene": "Akari returns with a redesigned pattern and Barb makes her judge it by comfort rather than measurement alone.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "cafe",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_yuna_kaede_charity_duo",
  "npc": "yuna",
  "participants": [
   "yuna",
   "kaede"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "arcade",
  "slot": 1,
  "start": 52,
  "end": 90,
  "minAffection": 0,
  "title": "A Team of Two Rivals",
  "prerequisite": "crossover_yuna_kaede_scoreboard",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A co-op high-score machine flashes both rivals' names on one team."
   },
   {
    "speaker": "kaede",
    "text": "The organizer has a sense of humor."
   },
   {
    "speaker": "yuna",
    "text": "Or excellent taste in dramatic pairings."
   },
   {
    "speaker": "Protagonist",
    "text": "You can argue after you've cleared level three."
   },
   {
    "speaker": "kaede",
    "text": "I'm taking the left side."
   },
   {
    "speaker": "yuna",
    "text": "I'm taking the right. Do not steal my victory pose."
   }
  ],
  "choices": [
   {
    "label": "Coach their teamwork",
    "reply": "They break the charity target score and share the applause awkwardly.",
    "kind": "support",
    "flag": "crossover_yuna_kaede_charity_duo_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Bet on their teamwork",
    "reply": "The wager becomes one snack each, paid in smiles rather than money.",
    "kind": "playful",
    "flag": "crossover_yuna_kaede_charity_duo_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_yuna_kaede_charity_duo.webp",
  "artPending": true,
  "art": {
   "scene": "The arcade asks Yuna and Kaede to cooperate for a charity tournament after their notorious scoreboard tie.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "arcade",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_laca_rina_first_performance",
  "npc": "laca",
  "participants": [
   "laca",
   "rina"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "park",
  "slot": 1,
  "start": 32,
  "end": 90,
  "minAffection": 0,
  "title": "A Song Without a Stage",
  "prerequisite": "crossover_laca_rina_safe_stage",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Laca sits on a bench while Rina checks the tuning on a small speaker."
   },
   {
    "speaker": "rina",
    "text": "No crowd. Just us and the river."
   },
   {
    "speaker": "laca",
    "text": "You've already done the brave part: showing up."
   },
   {
    "speaker": "Protagonist",
    "text": "And you're breathing better this time."
   },
   {
    "speaker": "rina",
    "text": "I remembered. Ten quiet breaths before the first note."
   },
   {
    "speaker": "laca",
    "text": "Then sing what you wanted to sing all along."
   }
  ],
  "choices": [
   {
    "label": "Listen without interrupting",
    "reply": "Rina finishes softly and says this was her favorite performance yet.",
    "kind": "kind",
    "flag": "crossover_laca_rina_first_performance_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Join in for the chorus",
    "reply": "The three of you sing badly and joyfully together.",
    "kind": "playful",
    "flag": "crossover_laca_rina_first_performance_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_laca_rina_first_performance.webp",
  "artPending": true,
  "art": {
   "scene": "Rina returns to the riverside to perform a song with no lights, ticket booth or pressure.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_sierra_marina_route_walk",
  "npc": "sierra",
  "participants": [
   "sierra",
   "marina"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 0,
  "start": 35,
  "end": 90,
  "minAffection": 0,
  "title": "A Walk on the Safe Side",
  "prerequisite": "crossover_marina_sierra_tide_sketch",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "The riverside path is bustling with small groups following fresh trail signs."
   },
   {
    "speaker": "sierra",
    "text": "I thought people would ask about the shortcuts."
   },
   {
    "speaker": "marina",
    "text": "They keep asking where the benches are."
   },
   {
    "speaker": "Protagonist",
    "text": "Maybe we should mark the places to rest."
   },
   {
    "speaker": "sierra",
    "text": "You're right. I was too focused on the route."
   },
   {
    "speaker": "marina",
    "text": "Let's make it a route people can actually enjoy."
   }
  ],
  "choices": [
   {
    "label": "Help add rest stops to the map",
    "reply": "Visitors thank them for the benches more than for the shortcuts.",
    "kind": "support",
    "flag": "crossover_sierra_marina_route_walk_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Offer to carry extra water",
    "reply": "Sierra smiles as she realizes guiding is mostly looking after others.",
    "kind": "kind",
    "flag": "crossover_sierra_marina_route_walk_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_sierra_marina_route_walk.webp",
  "artPending": true,
  "art": {
   "scene": "Marina and Sierra guide visitors along the route they mapped earlier and discover that being a guide means listening.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_yuna_jinx_cabinet_opening",
  "npc": "yuna",
  "participants": [
   "yuna",
   "jinx"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "arcade",
  "slot": 1,
  "start": 30,
  "end": 90,
  "minAffection": 0,
  "title": "The Cabinet Opens",
  "prerequisite": "crossover_yuna_jinx_arcade_paint",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "The newly painted cabinet draws a small crowd around its glowing screen."
   },
   {
    "speaker": "jinx",
    "text": "People actually came to see it."
   },
   {
    "speaker": "yuna",
    "text": "Of course they did. I announced it fourteen times."
   },
   {
    "speaker": "Protagonist",
    "text": "The first high score belongs to the janitor."
   },
   {
    "speaker": "jinx",
    "text": "That's perfect."
   },
   {
    "speaker": "yuna",
    "text": "Fine. But I'm coming back after closing to earn second place honestly."
   }
  ],
  "choices": [
   {
    "label": "Applaud the unexpected champion",
    "reply": "The janitor takes a bow while Jinx photographs the moment.",
    "kind": "kind",
    "flag": "crossover_yuna_jinx_cabinet_opening_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Challenge Yuna to a friendly round",
    "reply": "She loses by one point and says the machine must be haunted.",
    "kind": "playful",
    "flag": "crossover_yuna_jinx_cabinet_opening_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_yuna_jinx_cabinet_opening.webp",
  "artPending": true,
  "art": {
   "scene": "The repainted arcade cabinet finally goes live, and its first score is not what either artist expects.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "arcade",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_laca_poolside_design",
  "npc": "barb",
  "participants": [
   "barb",
   "laca"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "park",
  "slot": 1,
  "start": 20,
  "end": 90,
  "minAffection": 0,
  "title": "Fabric That Can Keep Up",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Barb lays a light cover-up jacket over the bench near Laca's training station."
   },
   {
    "speaker": "barb",
    "text": "It looks perfect when it's standing still."
   },
   {
    "speaker": "laca",
    "text": "Great. Now make it work when I'm moving."
   },
   {
    "speaker": "Protagonist",
    "text": "That's a pretty good stress test."
   },
   {
    "speaker": "barb",
    "text": "I'm learning to fear your practical friends."
   },
   {
    "speaker": "laca",
    "text": "Good. They keep your beautiful ideas useful."
   }
  ],
  "choices": [
   {
    "label": "Help test the pockets and sleeves",
    "reply": "Barb redesigns the closures and Laca promises to wear the finished version.",
    "kind": "respect",
    "flag": "crossover_barb_laca_poolside_design_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Suggest reflective trim",
    "reply": "Laca checks that it meets visibility needs before giving a thumbs-up.",
    "kind": "creative",
    "flag": "crossover_barb_laca_poolside_design_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_laca_poolside_design.webp",
  "artPending": true,
  "art": {
   "scene": "Laca gives Barb honest feedback about a prototype lifeguard cover-up and insists it survive an actual workday.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_luna_shiori_bookmarks",
  "npc": "luna",
  "participants": [
   "luna",
   "shiori"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "library",
  "slot": 1,
  "start": 22,
  "end": 90,
  "minAffection": 0,
  "title": "Notes Left in the Margins",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A hand-written note falls out of a borrowed reference book."
   },
   {
    "speaker": "luna",
    "text": "It says, 'You can start again tomorrow.'"
   },
   {
    "speaker": "shiori",
    "text": "Someone's been leaving those in the study collection for years."
   },
   {
    "speaker": "Protagonist",
    "text": "Do we know who?"
   },
   {
    "speaker": "shiori",
    "text": "No. Maybe not knowing is part of the kindness."
   },
   {
    "speaker": "luna",
    "text": "Then we can leave our own, without pretending to be the first."
   }
  ],
  "choices": [
   {
    "label": "Write a note for the next reader",
    "reply": "Shiori carefully dates your note, and Luna slips it into the return cart.",
    "kind": "kind",
    "flag": "crossover_luna_shiori_bookmarks_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Help catalogue the tradition",
    "reply": "The three of you preserve examples without spoiling the surprise.",
    "kind": "respect",
    "flag": "crossover_luna_shiori_bookmarks_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_luna_shiori_bookmarks.webp",
  "artPending": true,
  "art": {
   "scene": "Luna finds anonymous encouragement tucked into old library books and Shiori helps trace it to a tiny local tradition.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "library",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_camila_hana_countersale",
  "npc": "camila",
  "participants": [
   "camila",
   "hana"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 0,
  "start": 20,
  "end": 90,
  "minAffection": 0,
  "title": "The Price of a Smile",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Hana shows a young visitor the budget-friendly decks while Camila rearranges the bargain table."
   },
   {
    "speaker": "camila",
    "text": "I could offer the damaged box at cost."
   },
   {
    "speaker": "hana",
    "text": "You'd do that?"
   },
   {
    "speaker": "Protagonist",
    "text": "The cards inside are still perfect."
   },
   {
    "speaker": "camila",
    "text": "Don't advertise that I have a soft heart."
   },
   {
    "speaker": "hana",
    "text": "Your secret's safe with a shop full of witnesses."
   }
  ],
  "choices": [
   {
    "label": "Help make a beginner bundle",
    "reply": "Camila adds spare sleeves and pretends they were cluttering her drawer.",
    "kind": "kind",
    "flag": "crossover_camila_hana_countersale_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Offer to teach the new player",
    "reply": "Hana sets up a learning table as Camila quietly watches.",
    "kind": "support",
    "flag": "crossover_camila_hana_countersale_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_camila_hana_countersale.webp",
  "artPending": true,
  "art": {
   "scene": "Camila organizes a bargain table at Hana's shop but is genuinely moved when a beginner can't afford the starter they want.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "shop",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_jinx_sol_midnight_sign",
  "npc": "jinx",
  "participants": [
   "jinx",
   "sol"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 1,
  "start": 19,
  "end": 90,
  "minAffection": 0,
  "title": "The Sign Everyone Missed",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A washed-out safety sign has been propped beside a table of sketchbooks."
   },
   {
    "speaker": "jinx",
    "text": "My design will be impossible to ignore."
   },
   {
    "speaker": "sol",
    "text": "As long as people can understand it before they're standing in the wrong place."
   },
   {
    "speaker": "Protagonist",
    "text": "Big letters, clear symbols, then the art?"
   },
   {
    "speaker": "jinx",
    "text": "You take the fun out of arguing."
   },
   {
    "speaker": "sol",
    "text": "I think we've found our designer's brief."
   }
  ],
  "choices": [
   {
    "label": "Test the sign from the path",
    "reply": "Even distracted passersby understand it, and Jinx adds a tiny flourish.",
    "kind": "respect",
    "flag": "crossover_jinx_sol_midnight_sign_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Help Jinx paint the final border",
    "reply": "Sol checks the text while Jinx happily adds color.",
    "kind": "creative",
    "flag": "crossover_jinx_sol_midnight_sign_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_jinx_sol_midnight_sign.webp",
  "artPending": true,
  "art": {
   "scene": "Jinx and Sol collaborate on a colorful riverside safety sign that must be expressive but instantly readable.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_laca_sierra_safety_walk",
  "npc": "laca",
  "participants": [
   "laca",
   "sierra"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 0,
  "start": 23,
  "end": 90,
  "minAffection": 0,
  "title": "When Adventurers Learn the Rules",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Sierra has drawn a winding path over the local map."
   },
   {
    "speaker": "sierra",
    "text": "This detour is beautiful, but I haven't checked the footing."
   },
   {
    "speaker": "laca",
    "text": "Then we don't send anyone through it yet."
   },
   {
    "speaker": "Protagonist",
    "text": "Let's inspect the public path first."
   },
   {
    "speaker": "sierra",
    "text": "Deal. I want memories, not injuries."
   },
   {
    "speaker": "laca",
    "text": "That's the smartest thing you've said since you got here."
   }
  ],
  "choices": [
   {
    "label": "Walk the route with them",
    "reply": "Sierra marks one slippery section for repairs and Laca approves the alternate path.",
    "kind": "support",
    "flag": "crossover_laca_sierra_safety_walk_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Help design a caution marker",
    "reply": "Laca checks visibility while Sierra picks a symbol visitors can understand.",
    "kind": "creative",
    "flag": "crossover_laca_sierra_safety_walk_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_laca_sierra_safety_walk.webp",
  "artPending": true,
  "art": {
   "scene": "Sierra asks Laca to review her riverside walking plan before inviting people to a new route.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_rina_lights_costume",
  "npc": "barb",
  "participants": [
   "barb",
   "rina"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "cafe",
  "slot": 2,
  "start": 33,
  "end": 90,
  "minAffection": 0,
  "title": "A Costume for Real Life",
  "prerequisite": "crossover_rina_barb_poster_fit",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Rina and Barb are looking at two sketches under the cafe pendant light."
   },
   {
    "speaker": "rina",
    "text": "The stage version looks like somebody I'd want to meet."
   },
   {
    "speaker": "barb",
    "text": "Then the everyday version should look like somebody you already know."
   },
   {
    "speaker": "Protagonist",
    "text": "You can borrow from both."
   },
   {
    "speaker": "rina",
    "text": "You know? I think I want the ordinary one."
   },
   {
    "speaker": "barb",
    "text": "Then we're making the ordinary one extraordinary."
   }
  ],
  "choices": [
   {
    "label": "Choose the comfortable everyday design",
    "reply": "Rina grins and asks whether she can wear it to rehearsal tomorrow.",
    "kind": "kind",
    "flag": "crossover_barb_rina_lights_costume_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Suggest combining details from both",
    "reply": "Barb makes a hybrid jacket that surprises Rina in the best way.",
    "kind": "creative",
    "flag": "crossover_barb_rina_lights_costume_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_rina_lights_costume.webp",
  "artPending": true,
  "art": {
   "scene": "After the poster, Barb helps Rina choose a performance outfit she can wear offstage without feeling like a stranger.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "cafe",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_laca_sol_training_graduation",
  "npc": "laca",
  "participants": [
   "laca",
   "sol"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "park",
  "slot": 0,
  "start": 36,
  "end": 90,
  "minAffection": 0,
  "title": "The Rope Finally Lands",
  "prerequisite": "crossover_laca_sol_rescue_drill",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Sol sets out the practice rope and checks the target before anyone asks her to."
   },
   {
    "speaker": "laca",
    "text": "Look who's done her homework."
   },
   {
    "speaker": "sol",
    "text": "I figured people deserve more than my dramatic first attempt."
   },
   {
    "speaker": "Protagonist",
    "text": "How about one clean throw?"
   },
   {
    "speaker": "sol",
    "text": "Watch the stance, not the confidence."
   },
   {
    "speaker": "laca",
    "text": "Perfect. That's the lesson."
   }
  ],
  "choices": [
   {
    "label": "Give Sol the final target",
    "reply": "She hits it and thanks Laca for being patient.",
    "kind": "support",
    "flag": "crossover_laca_sol_training_graduation_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Let Laca lead one last drill",
    "reply": "Sol walks through every safety step without skipping a single one.",
    "kind": "respect",
    "flag": "crossover_laca_sol_training_graduation_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_laca_sol_training_graduation.webp",
  "artPending": true,
  "art": {
   "scene": "Sol returns for her follow-up safety drill and surprises Laca with careful technique instead of bravado.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_reina_camila_fair_rematch",
  "npc": "reina",
  "participants": [
   "reina",
   "camila"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 0,
  "start": 38,
  "end": 90,
  "minAffection": 0,
  "title": "No Discounts on Strategy",
  "prerequisite": "crossover_reina_camila_trade_strategy",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Camila puts a new deck list on the counter without a trade binder in sight."
   },
   {
    "speaker": "camila",
    "text": "I made the cuts you recommended."
   },
   {
    "speaker": "reina",
    "text": "All of them?"
   },
   {
    "speaker": "Protagonist",
    "text": "That's a suspiciously honest sentence."
   },
   {
    "speaker": "camila",
    "text": "Not all. One card is there because I love it."
   },
   {
    "speaker": "reina",
    "text": "Keep it. Just know what you're giving up for it."
   }
  ],
  "choices": [
   {
    "label": "Arrange their practice match",
    "reply": "Camila plays decisively and accepts the result with a smile.",
    "kind": "respect",
    "flag": "crossover_reina_camila_fair_rematch_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Ask which card survived the cuts",
    "reply": "Camila reveals her sentimental favorite and Reina admits she understands.",
    "kind": "kind",
    "flag": "crossover_reina_camila_fair_rematch_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_reina_camila_fair_rematch.webp",
  "artPending": true,
  "art": {
   "scene": "Camila returns with a better deck list after Reina's earlier lesson and demands a rematch with no bargains.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "shop",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_luna_elena_second_cup",
  "npc": "elena",
  "participants": [
   "elena",
   "luna"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "cafe",
  "slot": 1,
  "start": 35,
  "end": 90,
  "minAffection": 0,
  "title": "The Second Cup",
  "prerequisite": "crossover_elena_luna_tea_notes",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A handwritten sign reads 'Study together. Talking optional.'"
   },
   {
    "speaker": "luna",
    "text": "Are you sure people will come if there isn't a tournament?"
   },
   {
    "speaker": "elena",
    "text": "Maybe that's exactly why they'll come."
   },
   {
    "speaker": "Protagonist",
    "text": "We can set up a separate table for quiet reading."
   },
   {
    "speaker": "luna",
    "text": "A room where silence isn't awkward sounds lovely."
   },
   {
    "speaker": "elena",
    "text": "Then help us make it real."
   }
  ],
  "choices": [
   {
    "label": "Set up the quiet tables",
    "reply": "A few strangers settle in comfortably, and Luna seems visibly proud.",
    "kind": "support",
    "flag": "crossover_luna_elena_second_cup_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Make a small welcome sign",
    "reply": "Elena hangs it by the door, pleased by the gentle mood.",
    "kind": "creative",
    "flag": "crossover_luna_elena_second_cup_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_luna_elena_second_cup.webp",
  "artPending": true,
  "art": {
   "scene": "Elena and Luna share tea again and decide to organize a no-pressure study afternoon for anyone who needs a quiet place.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "cafe",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_hana_camila_new_player_return",
  "npc": "hana",
  "participants": [
   "hana",
   "camila"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 0,
  "start": 37,
  "end": 90,
  "minAffection": 0,
  "title": "A New Player Returns",
  "prerequisite": "crossover_camila_hana_countersale",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A familiar deck box appears on the counter, now covered in playful stickers."
   },
   {
    "speaker": "hana",
    "text": "Look who's back for a rematch!"
   },
   {
    "speaker": "camila",
    "text": "That's a very respectable deck box."
   },
   {
    "speaker": "Protagonist",
    "text": "It used to be on the bargain shelf, remember?"
   },
   {
    "speaker": "camila",
    "text": "I remember the price, not the sentiment."
   },
   {
    "speaker": "hana",
    "text": "Sure you do. Come watch the match with us."
   }
  ],
  "choices": [
   {
    "label": "Cheer for the newcomer",
    "reply": "Camila claps first after a clever play, then pretends she didn't.",
    "kind": "support",
    "flag": "crossover_hana_camila_new_player_return_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Ask Camila for one free tip",
    "reply": "She offers exactly three, without asking for a trade.",
    "kind": "kind",
    "flag": "crossover_hana_camila_new_player_return_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_hana_camila_new_player_return.webp",
  "artPending": true,
  "art": {
   "scene": "The beginner who received the budget deck returns for a local practice match, and Camila tries to hide how proud she is.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "shop",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_laca_jinx_final_vest",
  "npc": "jinx",
  "participants": [
   "jinx",
   "laca"
  ],
  "encounterType": "slice",
  "trigger": "entry",
  "place": "park",
  "slot": 1,
  "start": 35,
  "end": 90,
  "minAffection": 0,
  "title": "Safety in Full Color",
  "prerequisite": "crossover_jinx_laca_reflective_vest",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Laca holds up the finished training vest, bright stars gleaming in the afternoon light."
   },
   {
    "speaker": "jinx",
    "text": "It looks cooler than any safety gear has a right to."
   },
   {
    "speaker": "laca",
    "text": "And every marking is still readable."
   },
   {
    "speaker": "Protagonist",
    "text": "People will actually want to put it on."
   },
   {
    "speaker": "jinx",
    "text": "That's the best compliment I've had all week."
   },
   {
    "speaker": "laca",
    "text": "Come back next week. I've got three plain training bags."
   }
  ],
  "choices": [
   {
    "label": "Help photograph the finished vest",
    "reply": "Jinx gets a beautiful portfolio shot without getting in the way of a drill.",
    "kind": "creative",
    "flag": "crossover_laca_jinx_final_vest_choice_0",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    }
   },
   {
    "label": "Ask to help with the next batch",
    "reply": "Laca starts a list of volunteers and Jinx doodles stars in the margins.",
    "kind": "support",
    "flag": "crossover_laca_jinx_final_vest_choice_1",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    }
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_laca_jinx_final_vest.webp",
  "artPending": true,
  "art": {
   "scene": "The reflective-vest design is ready, and Jinx learns that making something useful can be its own act of rebellion.",
   "composition": "Cinematic 16:9 two-character CG, both faces identifiable, storytelling action visible, bottom fifth clear for VN dialogue.",
   "outfit": "Use each character's approved visual bible; preserve design, hair and tattoos.",
   "expression": "Natural expressive response to the encounter",
   "environment": "park",
   "mood": "everyday cross-character interaction",
   "fanservice": 0
  }
 }
];
 // Barb beachwear collection: each attendee gets a unique concept-fitting conversation.
 events.push(...[
 {
  "id": "crossover_barb_hana_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "hana"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 0,
  "start": 19,
  "end": 90,
  "minAffection": 0,
  "title": "Shop Window Sunshine",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Her shop apron always slips from one shoulder"
   },
   {
    "speaker": "hana",
    "text": "I want to feel sunny, but I still need to carry stock and bend over the counter."
   },
   {
    "speaker": "barb",
    "text": "Then we're building comfort first. Yellow panels, mint piping, and adjustable straps that stay put."
   },
   {
    "speaker": "Protagonist",
    "text": "So the buttercup yellow and mint palette will become a soft square-neck top with wide adjustable straps; high-waisted shorts-style bottoms?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A tiny embroidered Poké Ball hidden at the hem."
   },
   {
    "speaker": "hana",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help test the straps while sorting display boxes",
    "reply": "Hana lifts a stack of empty deck boxes and laughs: nothing budges.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_hana_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while hana listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_hana_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_hana_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "buttercup yellow and mint",
   "cut": "soft square-neck top with wide adjustable straps; high-waisted shorts-style bottoms",
   "detail": "A tiny embroidered Poké Ball hidden at the hem.",
   "wearer": "hana",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and hana at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Her shop apron always slips from one shoulder Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: buttercup yellow and mint, soft square-neck top with wide adjustable straps; high-waisted shorts-style bottoms.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and hana both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "shop",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_reina_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "reina"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 0,
  "start": 19,
  "end": 90,
  "minAffection": 0,
  "title": "A Champion Off Duty",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Reina refuses anything that feels like a costume"
   },
   {
    "speaker": "reina",
    "text": "If this is for a day off, it has to stop looking like I'm about to compete."
   },
   {
    "speaker": "barb",
    "text": "Clean lines. No ribbons that demand attention. I'll make the structure feel effortless."
   },
   {
    "speaker": "Protagonist",
    "text": "So the deep navy with a restrained crimson seam palette will become a athletic halter bikini with secure racerback fastening and structured swim shorts?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A narrow red accent only visible when she turns."
   },
   {
    "speaker": "reina",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help check the fit with a confident practice stance",
    "reply": "Reina tries a few stretches, then admits she actually likes the design.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_reina_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while reina listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_reina_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_reina_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "deep navy with a restrained crimson seam",
   "cut": "athletic halter bikini with secure racerback fastening and structured swim shorts",
   "detail": "A narrow red accent only visible when she turns.",
   "wearer": "reina",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and reina at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Reina refuses anything that feels like a costume Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: deep navy with a restrained crimson seam, athletic halter bikini with secure racerback fastening and structured swim shorts.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and reina both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "shop",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_shiori_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "shiori"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 2,
  "start": 19,
  "end": 90,
  "minAffection": 0,
  "title": "The Bookmark Pattern",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Shiori brings a pressed seaside flower as her only reference"
   },
   {
    "speaker": "shiori",
    "text": "I don't want to look as if I wandered out of a photograph of someone else."
   },
   {
    "speaker": "barb",
    "text": "Then we borrow the feeling, not the era. Sea-glass shades and a cut you can move in."
   },
   {
    "speaker": "Protagonist",
    "text": "So the sea-glass green and ivory palette will become a vintage-inspired high-waist bikini and softly wrapped top with removable light cover-up?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A subtle pressed-flower motif on the wrap."
   },
   {
    "speaker": "shiori",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help help compare fabric textures in the afternoon light",
    "reply": "Shiori holds the sample toward the river and smiles at its understated pattern.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_shiori_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while shiori listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_shiori_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_shiori_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "sea-glass green and ivory",
   "cut": "vintage-inspired high-waist bikini and softly wrapped top with removable light cover-up",
   "detail": "A subtle pressed-flower motif on the wrap.",
   "wearer": "shiori",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and shiori at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Shiori brings a pressed seaside flower as her only reference Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: sea-glass green and ivory, vintage-inspired high-waist bikini and softly wrapped top with removable light cover-up.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and shiori both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "park",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_yuna_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "yuna"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 1,
  "start": 21,
  "end": 90,
  "minAffection": 0,
  "title": "Final Boss Summer",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Yuna wants a design loud enough for the beach-games tournament"
   },
   {
    "speaker": "yuna",
    "text": "It has to look like I've already won the beach games."
   },
   {
    "speaker": "barb",
    "text": "Then it also has to stay on while you actually play them."
   },
   {
    "speaker": "Protagonist",
    "text": "So the electric cobalt and citrus orange palette will become a sporty zip-front bikini top and flexible swim shorts with geometric contrasting panels?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A tiny lightning emblem on one side."
   },
   {
    "speaker": "yuna",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help challenge Yuna to a dry-land volleyball move test",
    "reply": "Yuna jumps for an imaginary spike and declares the design tournament-ready.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_yuna_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while yuna listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_yuna_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_yuna_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "electric cobalt and citrus orange",
   "cut": "sporty zip-front bikini top and flexible swim shorts with geometric contrasting panels",
   "detail": "A tiny lightning emblem on one side.",
   "wearer": "yuna",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and yuna at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Yuna wants a design loud enough for the beach-games tournament Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: electric cobalt and citrus orange, sporty zip-front bikini top and flexible swim shorts with geometric contrasting panels.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and yuna both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "park",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_akari_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "akari"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "cafe",
  "slot": 2,
  "start": 20,
  "end": 90,
  "minAffection": 0,
  "title": "Variables in the Sun",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Akari arrives with a spreadsheet of sun coverage, fit, and drying times"
   },
   {
    "speaker": "akari",
    "text": "I have ranked thirty-seven designs by their measurable performance."
   },
   {
    "speaker": "barb",
    "text": "Did you rank whether you'd enjoy wearing one?"
   },
   {
    "speaker": "Protagonist",
    "text": "So the teal and charcoal with fine copper linework palette will become a minimalist supportive swim top with adjustable back and high-waist bottoms?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A copper grid pattern that becomes visible in sunlight."
   },
   {
    "speaker": "akari",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help help Akari add comfort to her scoring rubric",
    "reply": "Akari crosses out a column and writes 'makes me happy' instead.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_akari_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while akari listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_akari_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_akari_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "teal and charcoal with fine copper linework",
   "cut": "minimalist supportive swim top with adjustable back and high-waist bottoms",
   "detail": "A copper grid pattern that becomes visible in sunlight.",
   "wearer": "akari",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and akari at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Akari arrives with a spreadsheet of sun coverage, fit, and drying times Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: teal and charcoal with fine copper linework, minimalist supportive swim top with adjustable back and high-waist bottoms.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and akari both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "cafe",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_camila_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "camila"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 1,
  "start": 18,
  "end": 90,
  "minAffection": 0,
  "title": "The Collector's Edition",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Camila treats her fashion consultation like a rare-card negotiation"
   },
   {
    "speaker": "camila",
    "text": "What makes this one-of-a-kind?"
   },
   {
    "speaker": "barb",
    "text": "The fit is yours, the color is yours, and no one has to know the exact pattern."
   },
   {
    "speaker": "Protagonist",
    "text": "So the wine red and antique gold palette will become a sleek one-shoulder bikini top paired with high-waist bottoms, minimal metallic detailing?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A tiny removable gold clasp with a card-suit motif."
   },
   {
    "speaker": "camila",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help ask Camila what she actually wants instead of its resale value",
    "reply": "Camila quietly admits she wants something beautiful purely for herself.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_camila_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while camila listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_camila_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_camila_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "wine red and antique gold",
   "cut": "sleek one-shoulder bikini top paired with high-waist bottoms, minimal metallic detailing",
   "detail": "A tiny removable gold clasp with a card-suit motif.",
   "wearer": "camila",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and camila at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Camila treats her fashion consultation like a rare-card negotiation Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: wine red and antique gold, sleek one-shoulder bikini top paired with high-waist bottoms, minimal metallic detailing.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and camila both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "shop",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_marina_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "marina"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 2,
  "start": 19,
  "end": 90,
  "minAffection": 0,
  "title": "Safe Harbor",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Marina insists on practicality for a long day by the water"
   },
   {
    "speaker": "marina",
    "text": "I can't be adjusting straps when someone's asking for help."
   },
   {
    "speaker": "barb",
    "text": "Then this is active swimwear, not something that only works for a photo."
   },
   {
    "speaker": "Protagonist",
    "text": "So the lagoon blue and pearl white palette will become a secure cross-back bikini with moderate coverage, UV swim shirt and dry-bag pocket?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A wave motif stitched into the hem."
   },
   {
    "speaker": "marina",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help test the design against Marina's movement checklist",
    "reply": "Marina signs off when every practical concern has a clear answer.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_marina_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while marina listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_marina_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_marina_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "lagoon blue and pearl white",
   "cut": "secure cross-back bikini with moderate coverage, UV swim shirt and dry-bag pocket",
   "detail": "A wave motif stitched into the hem.",
   "wearer": "marina",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and marina at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Marina insists on practicality for a long day by the water Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: lagoon blue and pearl white, secure cross-back bikini with moderate coverage, UV swim shirt and dry-bag pocket.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and marina both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "park",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_kaede_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "kaede"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 1,
  "start": 42,
  "end": 90,
  "minAffection": 0,
  "title": "The Quiet Ace",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Kaede is hesitant to try anything that could draw a crowd"
   },
   {
    "speaker": "kaede",
    "text": "I'm not looking for a dramatic reveal."
   },
   {
    "speaker": "barb",
    "text": "Good. We're making something you'd choose for yourself, not your audience."
   },
   {
    "speaker": "Protagonist",
    "text": "So the black, slate and a narrow silver edge palette will become a precise asymmetrical swim top with fitted high-rise bottoms and detachable wrap skirt?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A subtle silver seam that echoes her favorite deck box."
   },
   {
    "speaker": "kaede",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help let Kaede choose the final amount of contrast",
    "reply": "She picks the faintest silver trim and seems relieved Barb listens.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_kaede_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while kaede listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_kaede_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_kaede_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "black, slate and a narrow silver edge",
   "cut": "precise asymmetrical swim top with fitted high-rise bottoms and detachable wrap skirt",
   "detail": "A subtle silver seam that echoes her favorite deck box.",
   "wearer": "kaede",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and kaede at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Kaede is hesitant to try anything that could draw a crowd Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: black, slate and a narrow silver edge, precise asymmetrical swim top with fitted high-rise bottoms and detachable wrap skirt.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and kaede both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "park",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_jun_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "jun"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "cafe",
  "slot": 2,
  "start": 20,
  "end": 90,
  "minAffection": 0,
  "title": "A Design That Follows the Rules",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Jun volunteers to check the beachwear show's accessibility and dress code"
   },
   {
    "speaker": "jun",
    "text": "I can review the safety plan, but I know absolutely nothing about swimwear styling."
   },
   {
    "speaker": "barb",
    "text": "Good. I need someone who'll tell me whether every guest can actually use the changing rooms."
   },
   {
    "speaker": "Protagonist",
    "text": "So the marine blue and warm sand palette will become a coordinated bikini concept with a simple secure top and matching boardshorts for a group showcase?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. Clear fit labels and inclusive size options."
   },
   {
    "speaker": "jun",
    "text": "I like helping create the collection without deciding who has to wear the bikini."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help help Jun check the collection's fit and accessibility notes",
    "reply": "Jun marks the collection approved after Barb updates the practical instructions.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_jun_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while jun listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_jun_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_jun_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "marine blue and warm sand",
   "cut": "coordinated bikini concept with a simple secure top and matching boardshorts for a group showcase",
   "detail": "Clear fit labels and inclusive size options.",
   "wearer": "showcase design; wearer to be selected with consent",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and jun at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Jun volunteers to check the beachwear show's accessibility and dress code A bikini is shown ONLY as a garment sketch on paper; jun is dressed in their usual clothing. The proposed design: marine blue and warm sand, coordinated bikini concept with a simple secure top and matching boardshorts for a group showcase.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and jun both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "cafe",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_teo_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "teo"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 1,
  "start": 18,
  "end": 90,
  "minAffection": 0,
  "title": "The Color Commentary",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Teo proposes a coordinated team palette and tries to narrate the entire fitting"
   },
   {
    "speaker": "teo",
    "text": "The crowd goes wild as Barb unveils the summer collection!"
   },
   {
    "speaker": "barb",
    "text": "The crowd can go wild after you help me pick a color that doesn't clash with the signs."
   },
   {
    "speaker": "Protagonist",
    "text": "So the sunset coral and bright violet palette will become a bikini color concept paired with geometric-pattern boardshorts for a beach-games team?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A bold but readable team crest."
   },
   {
    "speaker": "teo",
    "text": "I like helping create the collection without deciding who has to wear the bikini."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help ask Teo to test the palette against the event banners",
    "reply": "Teo finally chooses a palette that looks good without overpowering the whole scene.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_teo_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while teo listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_teo_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_teo_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "sunset coral and bright violet",
   "cut": "bikini color concept paired with geometric-pattern boardshorts for a beach-games team",
   "detail": "A bold but readable team crest.",
   "wearer": "showcase design; wearer to be selected with consent",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and teo at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Teo proposes a coordinated team palette and tries to narrate the entire fitting A bikini is shown ONLY as a garment sketch on paper; teo is dressed in their usual clothing. The proposed design: sunset coral and bright violet, bikini color concept paired with geometric-pattern boardshorts for a beach-games team.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and teo both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "shop",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_iris_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "iris"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 2,
  "start": 19,
  "end": 90,
  "minAffection": 0,
  "title": "The Tidepool Print",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Iris has collected shell colors but doesn't know how to turn them into clothing"
   },
   {
    "speaker": "iris",
    "text": "I like these colors because they look different depending on the water."
   },
   {
    "speaker": "barb",
    "text": "Then let's make them reversible, so you can choose the mood that day."
   },
   {
    "speaker": "Protagonist",
    "text": "So the seafoam and lavender palette will become a softly gathered bikini with reversible high-waist bottoms and a sheer-free lightweight cover-up?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A tiny embroidered seashell inside the reversible seam."
   },
   {
    "speaker": "iris",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help help arrange Iris's shell-inspired color samples",
    "reply": "Iris turns the mock-up inside out twice and says she likes both versions.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_iris_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while iris listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_iris_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_iris_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "seafoam and lavender",
   "cut": "softly gathered bikini with reversible high-waist bottoms and a sheer-free lightweight cover-up",
   "detail": "A tiny embroidered seashell inside the reversible seam.",
   "wearer": "iris",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and iris at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Iris has collected shell colors but doesn't know how to turn them into clothing Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: seafoam and lavender, softly gathered bikini with reversible high-waist bottoms and a sheer-free lightweight cover-up.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and iris both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "park",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_elio_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "elio"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 1,
  "start": 22,
  "end": 90,
  "minAffection": 0,
  "title": "The Gift Sketch",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Elio wants to contribute a meaningful design without guessing someone else's measurements"
   },
   {
    "speaker": "elio",
    "text": "Would it be weird to bring a bikini design to the showcase if I'm not wearing it?"
   },
   {
    "speaker": "barb",
    "text": "Not if you design it as a concept and let whoever wears it choose the fit."
   },
   {
    "speaker": "Protagonist",
    "text": "So the sage green and muted coral palette will become a bikini prototype displayed alongside coordinated relaxed swim trunks for the community show?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A hand-drawn leaf pattern that can be adapted for any size."
   },
   {
    "speaker": "elio",
    "text": "I like helping create the collection without deciding who has to wear the bikini."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help encourage Elio to present the concept without choosing a model",
    "reply": "He pins the color study beside his own swim-trunk sketch with a proud grin.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_elio_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while elio listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_elio_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_elio_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "sage green and muted coral",
   "cut": "bikini prototype displayed alongside coordinated relaxed swim trunks for the community show",
   "detail": "A hand-drawn leaf pattern that can be adapted for any size.",
   "wearer": "showcase design; wearer to be selected with consent",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and elio at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Elio wants to contribute a meaningful design without guessing someone else's measurements A bikini is shown ONLY as a garment sketch on paper; elio is dressed in their usual clothing. The proposed design: sage green and muted coral, bikini prototype displayed alongside coordinated relaxed swim trunks for the community show.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and elio both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "shop",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_alma_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "alma"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "cafe",
  "slot": 2,
  "start": 20,
  "end": 90,
  "minAffection": 0,
  "title": "The Café After Closing",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Alma wants something elegant that can survive a whole afternoon with friends"
   },
   {
    "speaker": "alma",
    "text": "I like looking put together. I also like sitting down without rearranging myself."
   },
   {
    "speaker": "barb",
    "text": "I promise both are possible. We'll build the twist into the fabric, not the fit."
   },
   {
    "speaker": "Protagonist",
    "text": "So the espresso brown and cream palette will become a elegant twist-front bikini and wrap skirt with practical pockets for beach essentials?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A café-bean inspired textured border."
   },
   {
    "speaker": "alma",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help test how the wrap falls while Alma takes a seat",
    "reply": "Alma approves the comfortable drape and insists on treating Barb to dessert.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_alma_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while alma listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_alma_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_alma_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "espresso brown and cream",
   "cut": "elegant twist-front bikini and wrap skirt with practical pockets for beach essentials",
   "detail": "A café-bean inspired textured border.",
   "wearer": "alma",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and alma at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Alma wants something elegant that can survive a whole afternoon with friends Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: espresso brown and cream, elegant twist-front bikini and wrap skirt with practical pockets for beach essentials.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and alma both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "cafe",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_nereo_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "nereo"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 1,
  "start": 21,
  "end": 90,
  "minAffection": 0,
  "title": "A Map of Color",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Nereo brings contour maps instead of clothing references"
   },
   {
    "speaker": "nereo",
    "text": "The curves on this map are actually beautiful."
   },
   {
    "speaker": "barb",
    "text": "They are. But we're not putting a dangerous hiking route on someone's outfit."
   },
   {
    "speaker": "Protagonist",
    "text": "So the deep ocean blue and dune beige palette will become a bikini print concept with shoreline contour lines and matching swim shorts for the seaside crew?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A tiny compass point that doubles as the collection emblem."
   },
   {
    "speaker": "nereo",
    "text": "I like helping create the collection without deciding who has to wear the bikini."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help help refine the contour print so it reads as waves",
    "reply": "Nereo realizes the shoreline lines make a surprisingly elegant textile.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_nereo_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while nereo listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_nereo_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_nereo_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "deep ocean blue and dune beige",
   "cut": "bikini print concept with shoreline contour lines and matching swim shorts for the seaside crew",
   "detail": "A tiny compass point that doubles as the collection emblem.",
   "wearer": "showcase design; wearer to be selected with consent",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and nereo at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Nereo brings contour maps instead of clothing references A bikini is shown ONLY as a garment sketch on paper; nereo is dressed in their usual clothing. The proposed design: deep ocean blue and dune beige, bikini print concept with shoreline contour lines and matching swim shorts for the seaside crew.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and nereo both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "park",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_elena_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "elena"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "cafe",
  "slot": 2,
  "start": 30,
  "end": 90,
  "minAffection": 0,
  "title": "An Appointment for Elena",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Elena books a calm, private design consultation rather than joining a crowded fitting"
   },
   {
    "speaker": "elena",
    "text": "I don't want to be the center of attention. I just want to enjoy a day outside."
   },
   {
    "speaker": "barb",
    "text": "Then we'll design something comfortable, with a cover-up you can put on whenever you like."
   },
   {
    "speaker": "Protagonist",
    "text": "So the soft rose and deep indigo palette will become a comfortable wrap-style bikini top with wide straps and high-waist bottoms plus a light overshirt?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A tiny stitched rose detail near the hem."
   },
   {
    "speaker": "elena",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help let Elena choose the coverage and overshirt length",
    "reply": "Elena relaxes as the sketch changes to reflect exactly what she asked for.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_elena_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while elena listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_elena_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_elena_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "soft rose and deep indigo",
   "cut": "comfortable wrap-style bikini top with wide straps and high-waist bottoms plus a light overshirt",
   "detail": "A tiny stitched rose detail near the hem.",
   "wearer": "elena",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and elena at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Elena books a calm, private design consultation rather than joining a crowded fitting Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: soft rose and deep indigo, comfortable wrap-style bikini top with wide straps and high-waist bottoms plus a light overshirt.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and elena both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "cafe",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_jinx_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "jinx"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 2,
  "start": 19,
  "end": 90,
  "minAffection": 0,
  "title": "Graffiti Meets Sea Spray",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Jinx presents Barb with a page of paint splashes that would overwhelm any swimsuit"
   },
   {
    "speaker": "jinx",
    "text": "I want it to look like the ocean joined my crew."
   },
   {
    "speaker": "barb",
    "text": "Then give the colors room to breathe. Even rebellion needs negative space."
   },
   {
    "speaker": "Protagonist",
    "text": "So the ultraviolet, black and electric cyan palette will become a sporty bikini with graffiti-inspired colorblocking and secure straps?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A discreet graffiti tag worked into the hem instead of a giant logo."
   },
   {
    "speaker": "jinx",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help help Jinx simplify the shapes without losing the attitude",
    "reply": "Jinx calls the final color study 'chaos with a plan' and signs it.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_jinx_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while jinx listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_jinx_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_jinx_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "ultraviolet, black and electric cyan",
   "cut": "sporty bikini with graffiti-inspired colorblocking and secure straps",
   "detail": "A discreet graffiti tag worked into the hem instead of a giant logo.",
   "wearer": "jinx",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and jinx at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Jinx presents Barb with a page of paint splashes that would overwhelm any swimsuit Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: ultraviolet, black and electric cyan, sporty bikini with graffiti-inspired colorblocking and secure straps.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and jinx both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "park",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_laca_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "laca"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 1,
  "start": 21,
  "end": 90,
  "minAffection": 0,
  "title": "The Lifeguard's Day Off",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Laca wants an off-duty look distinct from her functional red lifeguard uniform"
   },
   {
    "speaker": "laca",
    "text": "I spend all day looking like I'm on shift. I want people to know I'm relaxing."
   },
   {
    "speaker": "barb",
    "text": "Then we keep your sporty style and change the color story just enough."
   },
   {
    "speaker": "Protagonist",
    "text": "So the red, cream and dusky turquoise palette will become a secure sporty bikini, modest coverage and adjustable straps with a matching light cover-up?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A tiny wave emblem instead of any rescue-service insignia."
   },
   {
    "speaker": "laca",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help test the outfit's secure movement without treating it as work gear",
    "reply": "Laca laughs when Barb tells her she is officially allowed to sit still.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_laca_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while laca listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_laca_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_laca_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "red, cream and dusky turquoise",
   "cut": "secure sporty bikini, modest coverage and adjustable straps with a matching light cover-up",
   "detail": "A tiny wave emblem instead of any rescue-service insignia.",
   "wearer": "laca",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and laca at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Laca wants an off-duty look distinct from her functional red lifeguard uniform Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: red, cream and dusky turquoise, secure sporty bikini, modest coverage and adjustable straps with a matching light cover-up.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and laca both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "park",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_luna_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "luna"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 1,
  "start": 18,
  "end": 90,
  "minAffection": 0,
  "title": "A Little Moonlight",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Luna is afraid her tastes will seem too quiet compared with everyone else's"
   },
   {
    "speaker": "luna",
    "text": "Mine is going to look boring next to Jinx's."
   },
   {
    "speaker": "barb",
    "text": "Yours should feel like you. A calm palette can be the most memorable thing in the room."
   },
   {
    "speaker": "Protagonist",
    "text": "So the midnight blue and pale lilac palette will become a soft square-neck bikini with a gently draped high-rise bottom and optional beach cardigan?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. Subtle crescent stitching hidden in the cardigan cuff."
   },
   {
    "speaker": "luna",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help help Luna choose the softer of two fabrics",
    "reply": "Luna brushes the lilac fabric between her fingers and makes the choice herself.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_luna_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while luna listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_luna_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_luna_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "midnight blue and pale lilac",
   "cut": "soft square-neck bikini with a gently draped high-rise bottom and optional beach cardigan",
   "detail": "Subtle crescent stitching hidden in the cardigan cuff.",
   "wearer": "luna",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and luna at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Luna is afraid her tastes will seem too quiet compared with everyone else's Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: midnight blue and pale lilac, soft square-neck bikini with a gently draped high-rise bottom and optional beach cardigan.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and luna both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "shop",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_rina_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "rina"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "cafe",
  "slot": 2,
  "start": 21,
  "end": 90,
  "minAffection": 0,
  "title": "A Star Without a Stage",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Rina asks for something pretty that doesn't feel like a stage costume"
   },
   {
    "speaker": "rina",
    "text": "Everyone picks glitter when I say I'm a performer."
   },
   {
    "speaker": "barb",
    "text": "Do you want glitter?"
   },
   {
    "speaker": "Protagonist",
    "text": "So the rose pink and sea-green palette will become a playful retro bikini top with supportive broad straps and high-rise bottoms plus a coordinating tied cover-up?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A single small star sewn at the waist instead of sequins."
   },
   {
    "speaker": "rina",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help ask Rina to describe the beach day she actually imagines",
    "reply": "Rina sketches friends and food instead of spotlights and picks the softer palette.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_rina_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while rina listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_rina_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_rina_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "rose pink and sea-green",
   "cut": "playful retro bikini top with supportive broad straps and high-rise bottoms plus a coordinating tied cover-up",
   "detail": "A single small star sewn at the waist instead of sequins.",
   "wearer": "rina",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and rina at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Rina asks for something pretty that doesn't feel like a stage costume Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: rose pink and sea-green, playful retro bikini top with supportive broad straps and high-rise bottoms plus a coordinating tied cover-up.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and rina both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "cafe",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_sierra_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "sierra"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 2,
  "start": 19,
  "end": 90,
  "minAffection": 0,
  "title": "The Trail to the Tide",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Sierra expects to be exploring as much as swimming"
   },
   {
    "speaker": "sierra",
    "text": "I need something that survives a walk, a swim, and sitting on a rock to watch the waves."
   },
   {
    "speaker": "barb",
    "text": "That sounds like three outfit tests. Great. I love a challenge."
   },
   {
    "speaker": "Protagonist",
    "text": "So the terracotta and ocean teal palette will become a outdoorsy cross-back bikini top, flexible swim shorts and a sun-protective overshirt?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A stitched tiny trail-marker symbol on the overshirt."
   },
   {
    "speaker": "sierra",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help help Sierra test the range of motion in the prototype",
    "reply": "Sierra gives the practical version the highest possible praise: she'd pack it.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_sierra_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while sierra listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_sierra_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_sierra_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "terracotta and ocean teal",
   "cut": "outdoorsy cross-back bikini top, flexible swim shorts and a sun-protective overshirt",
   "detail": "A stitched tiny trail-marker symbol on the overshirt.",
   "wearer": "sierra",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and sierra at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Sierra expects to be exploring as much as swimming Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: terracotta and ocean teal, outdoorsy cross-back bikini top, flexible swim shorts and a sun-protective overshirt.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and sierra both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "park",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 },
 {
  "id": "crossover_barb_sol_beachwear_design",
  "npc": "barb",
  "participants": [
   "barb",
   "sol"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 1,
  "start": 21,
  "end": 90,
  "minAffection": 0,
  "title": "Golden-Hour Colors",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Sol wants the colors of her favorite riverside sunset without sacrificing comfort"
   },
   {
    "speaker": "sol",
    "text": "I love this photograph. Can you turn the feeling into fabric?"
   },
   {
    "speaker": "barb",
    "text": "The warmth, yes. The sunset's actual temperature, no."
   },
   {
    "speaker": "Protagonist",
    "text": "So the golden amber and sky blue palette will become a balanced halter bikini with supportive neck-free conversion straps and a light sarong?"
   },
   {
    "speaker": "barb",
    "text": "That's our starting point. We'll adjust the fit and finish together. A gradient stripe along the sarong edge."
   },
   {
    "speaker": "sol",
    "text": "I want the finished outfit to feel like me, not just look good on paper."
   },
   {
    "speaker": "Narrator",
    "text": "Barb lays out fabric swatches and draws the first complete design, ready for the wearer's approval."
   }
  ],
  "choices": [
   {
    "label": "Help hold the fabric samples up in evening light",
    "reply": "Sol decides the real fabric looks even lovelier than the photograph.",
    "kind": "creative",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 1,
     "attraction": 0
    },
    "flag": "crossover_barb_sol_beachwear_design_collaboration"
   },
   {
    "label": "Ask Barb to explain the pattern construction",
    "reply": "Barb traces every seam and adjustment while sol listens closely. The sketch is labelled and safely packed away for the next fitting.",
    "kind": "support",
    "delta": {
     "affection": 1,
     "trust": 1,
     "respect": 0,
     "attraction": 0
    },
    "flag": "crossover_barb_sol_beachwear_design_process"
   }
  ],
  "image": "/rpg-assets/events/cg/season01/crossover_barb_sol_beachwear_design.webp",
  "artPending": true,
  "beachwear": {
   "palette": "golden amber and sky blue",
   "cut": "balanced halter bikini with supportive neck-free conversion straps and a light sarong",
   "detail": "A gradient stripe along the sarong edge.",
   "wearer": "sol",
   "stage": "concept"
  },
  "art": {
   "scene": "Barb and sol at a public beachwear design consultation, discussing fabric swatches and a fashion illustration on the table. Sol wants the colors of her favorite riverside sunset without sacrificing comfort Both characters fully clothed; bikini is shown as fashion sketches and fabric samples only. The proposed design: golden amber and sky blue, balanced halter bikini with supportive neck-free conversion straps and a light sarong.",
   "composition": "Single 16:9 cinematic workshop consultation, Barb and sol both clearly recognizable, design sketch foreground, bottom 20% clear for dialogue; no split panels or actual swimsuit changing.",
   "outfit": "Canonical approved everyday outfits for both characters; beachwear exists only as sketch and swatch in this initial event.",
   "expression": "Characterful collaborative design discussion",
   "environment": "park",
   "mood": "friendly professional and lighthearted",
   "fanservice": 0
  }
 }
]);
 const pendingArt=events.map(e=>({id:e.id,path:e.image,participants:e.participants,title:e.title,brief:e.art.scene,composition:e.art.composition,status:'PENDING_CG'}));
 function validate(){const issues=[],ids=new Set();for(const e of events){if(ids.has(e.id))issues.push('Duplicate '+e.id);ids.add(e.id);if(e.participants.length<2||e.participants[0]!==e.npc||e.lines.length<5||!e.choices?.length||!e.image.endsWith(e.id+'.webp'))issues.push('Invalid '+e.id);if(e.prerequisite&&!ids.has(e.prerequisite)&&!events.some(x=>x.id===e.prerequisite))issues.push('Unknown prerequisite '+e.id);}return issues;}
 return Object.freeze({events,pendingArt,validate});
});
