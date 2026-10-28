'use strict';
// Daisy bonus scenes and approved CG registrations.
(function(root){
const solo=[{"id":"daisy_random_window_reflection","npc":"daisy","title":"Window Reflection","place":"shop","slot":1,"start":12,"end":90,"minBond":0,"prerequisite":null,"encounterType":"slice","trigger":"entry","randomForced":true,"chancePercent":37,"participants":[],"lines":[{"speaker":"Narrator","text":"Daisy pauses by the shop window, studying her reflection as the late light catches the glass."},{"speaker":"daisy","text":"You weren't checking the display, were you?"},{"speaker":"Protagonist","text":"I was checking if the shop was open."},{"speaker":"daisy","text":"Sure. And I was checking the weather inside."},{"speaker":"Protagonist","text":"A reflection makes a remarkably honest mirror."},{"speaker":"daisy","text":"Come on. We have a little time left."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_random_window_reflection_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_random_window_reflection_joke","delta":{"affection":1,"respect":1}}]},{"id":"daisy_random_rain_shelter","npc":"daisy","title":"The Borrowed Umbrella","place":"park","slot":2,"start":12,"end":90,"minBond":0,"prerequisite":null,"encounterType":"slice","trigger":"entry","randomForced":true,"chancePercent":37,"participants":[],"lines":[{"speaker":"Narrator","text":"A sudden shower leaves Daisy and the protagonist sharing a borrowed umbrella at the park path."},{"speaker":"daisy","text":"Rain has no respect for a carefully planned outfit."},{"speaker":"Protagonist","text":"At least this umbrella is big enough for both of us."},{"speaker":"daisy","text":"Then I suppose we owe its owner a thank-you note."},{"speaker":"Protagonist","text":"Or we could enjoy the extra five minutes."},{"speaker":"daisy","text":"Come on. We have a little time left."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_random_rain_shelter_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_random_rain_shelter_joke","delta":{"affection":1,"respect":1}}]},{"id":"daisy_random_arcade_disguise","npc":"daisy","title":"Off-Duty Incognito","place":"arcade","slot":2,"start":12,"end":90,"minBond":0,"prerequisite":null,"encounterType":"slice","trigger":"entry","randomForced":true,"chancePercent":37,"participants":[],"lines":[{"speaker":"Narrator","text":"Daisy arrives at the arcade in an oversized hoodie and loose clothes."},{"speaker":"daisy","text":"One whole afternoon and no one recognized me."},{"speaker":"Protagonist","text":"I knew it was you."},{"speaker":"daisy","text":"You're an exception. I should have guessed."},{"speaker":"Protagonist","text":"Want to try the high-score challenge?"},{"speaker":"daisy","text":"Come on. We have a little time left."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_random_arcade_disguise_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_random_arcade_disguise_joke","delta":{"affection":1,"respect":1}}],"artPending":true},{"id":"daisy_random_deck_luck","npc":"daisy","title":"Lucky Draw, Unlucky Shuffle","place":"shop","slot":1,"start":12,"end":90,"minBond":0,"prerequisite":null,"encounterType":"slice","trigger":"entry","randomForced":true,"chancePercent":37,"participants":[],"lines":[{"speaker":"Narrator","text":"Daisy's deck box tips over on the shop floor, scattering sleeved cards around both of you."},{"speaker":"daisy","text":"That's not how I wanted to reveal my strategy."},{"speaker":"Protagonist","text":"I'm not looking at the cards."},{"speaker":"daisy","text":"You say that like your curiosity doesn't have a face."},{"speaker":"Protagonist","text":"Help me collect them and I might give you a fair game."},{"speaker":"daisy","text":"Come on. We have a little time left."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_random_deck_luck_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_random_deck_luck_joke","delta":{"affection":1,"respect":1}}]}];
const cross=[{"id":"daisy_barb_swimsuit_sketch","npc":"barb","participants":["barb","daisy"],"encounterType":"slice","trigger":"talk","place":"shop","slot":1,"start":20,"end":90,"minAffection":0,"plannedMeetup":true,"title":"A Swimsuit With Her Name On It","lines":[{"speaker":"Narrator","text":"At Barb's workshop, Daisy studies a swimsuit sketch beside neatly arranged fabric swatches."},{"speaker":"barb","text":"This cut is designed to stay comfortable when you move. The sketch shows the lines; the swatches show how the fabric catches the light."},{"speaker":"daisy","text":"And I want it to feel like something I'd actually choose, not a costume."},{"speaker":"barb","text":"Then we're keeping the dark plum palette and a clean, secure silhouette."},{"speaker":"Protagonist","text":"What do you need from me?"},{"speaker":"daisy","text":"An opinion about the sketch. Preferably one with actual words."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_barb_swimsuit_sketch_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_barb_swimsuit_sketch_joke","delta":{"affection":1,"respect":1}}],"image":"/rpg-assets/events/cg/season01/daisy_barb_swimsuit_sketch.webp","artPending":false,"art":{"scene":"At Barb's workshop, Daisy studies a swimsuit sketch beside neatly arranged fabric swatches.","composition":"Approved landscape illustration with the lower fifth clear for dialogue.","outfit":"Daisy: lined layered skirt, tasteful burgundy or black outfit; Barb: canonical designer look; swimsuit consultations use secure lined swimwear and sketch/fabric swatches.","expression":"Natural, character-specific animated conversation and close-up reaction","environment":"shop","mood":"playful, warm slice of life","fanservice":0}},{"id":"daisy_barb_fitting_followup","npc":"barb","participants":["barb","daisy"],"encounterType":"slice","trigger":"talk","place":"shop","slot":1,"start":34,"end":90,"minAffection":0,"plannedMeetup":true,"title":"The Final Fitting","lines":[{"speaker":"Narrator","text":"The finished swimsuit is ready in Barb's fitting area, with the curtain drawn for privacy."},{"speaker":"barb","text":"The straps are secure, and the lining sits exactly where it should."},{"speaker":"daisy","text":"I can move comfortably. That's what I wanted."},{"speaker":"barb","text":"Good. Take a breath, then try the full turn again. I'll check the seams."},{"speaker":"Protagonist","text":"The color looks just like the sketch you showed me."},{"speaker":"daisy","text":"It feels like me. That's the important part."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_barb_fitting_followup_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_barb_fitting_followup_joke","delta":{"affection":1,"respect":1}}],"image":"/rpg-assets/events/cg/season01/daisy_barb_fitting_followup.webp","cgSequence":["daisy_barb_fitting_followup","daisy_barb_fitting_followup_stage2"],"cgSwitchSteps":[0,4],"cgSequence":["daisy_barb_fitting_followup","daisy_barb_fitting_followup_stage2"],"cgSwitchSteps":[0,4],"artPending":false,"art":{"scene":"Daisy and Barb complete the swimsuit fitting in Barb's private fitting area.","composition":"Approved two-stage 16:9 landscape illustrations; smooth transition at line 5; dialogue-safe lower fifth.","outfit":"Daisy wears the approved swimsuit in both stages. Barb wears her canonical designer outfit.","expression":"Confident comfort in stage one, pleased surprise and rapport in stage two.","environment":"Barb's workshop fitting area","mood":"warm, supportive, lightly playful","fanservice":1}},{"id":"daisy_laca_boardwalk","npc":"daisy","participants":["daisy","laca"],"encounterType":"slice","trigger":"talk","place":"park","slot":2,"start":23,"end":90,"minAffection":0,"title":"Boardwalk Bluff","lines":[{"speaker":"Narrator","text":"At a beachside café on the boardwalk, Daisy and Laca sit with a deck of cards between them."},{"speaker":"daisy","text":"She says she can guess my deck from my sleeves."},{"speaker":"laca","text":"I said I could guess your opening move. Different sport."},{"speaker":"daisy","text":"Go on then. Impress me."},{"speaker":"Protagonist","text":"I'm staying out of this."},{"speaker":"laca","text":"Too late. You're the referee."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_laca_boardwalk_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_laca_boardwalk_joke","delta":{"affection":1,"respect":1}}],"image":"/rpg-assets/events/cg/season01/daisy_laca_boardwalk.webp","artPending":false,"art":{"scene":"At a beachside café on the boardwalk, Daisy and Laca sit with a deck of cards between them.","composition":"Approved landscape illustration with the lower fifth clear for dialogue.","outfit":"Daisy: lined layered skirt, tasteful burgundy or black outfit; Barb: canonical designer look; swimsuit consultations use secure lined swimwear and sketch/fabric swatches.","expression":"Natural, character-specific animated conversation and close-up reaction","environment":"Beachside boardwalk café","mood":"playful, warm slice of life","fanservice":0}},{"id":"daisy_rina_cafe","npc":"daisy","participants":["daisy","rina"],"encounterType":"slice","trigger":"talk","place":"cafe","slot":2,"start":28,"end":90,"minAffection":0,"title":"No Stage Lights Required","lines":[{"speaker":"Narrator","text":"Rina and Daisy swap tips about styling an outfit for a quiet café appearance."},{"speaker":"rina","text":"I wanted one evening without looking like I'm on stage."},{"speaker":"daisy","text":"Then wear what makes you comfortable. You don't owe the room a performance."},{"speaker":"rina","text":"Easy for you to say. You're dressed beautifully."},{"speaker":"Protagonist","text":"You both look comfortable here."},{"speaker":"daisy","text":"That's better than any review."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_rina_cafe_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_rina_cafe_joke","delta":{"affection":1,"respect":1}}],"image":"/rpg-assets/events/cg/season01/daisy_rina_cafe.webp","artPending":true,"art":{"scene":"Rina and Daisy swap tips about styling an outfit for a quiet café appearance.","composition":"Cinematic 16:9 modern JRPG visual novel CG, consistent faces, no text, bottom fifth left clear for dialogue. Production prompt only; artwork pending.","outfit":"Daisy: lined layered skirt, tasteful burgundy or black outfit; Barb: canonical designer look; swimsuit consultations use secure lined swimwear and sketch/fabric swatches.","expression":"Natural, character-specific animated conversation and close-up reaction","environment":"cafe","mood":"playful, warm slice of life","fanservice":0}}];
// Approved multi-CG wardrobe fitting sequence; artwork distributed separately.
cross.push({
  "id": "daisy_barb_camila_wrong_size",
  "npc": "daisy",
  "participants": [
    "daisy",
    "camila",
    "barb"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 1,
  "start": 35,
  "end": 90,
  "minAffection": 0,
  "prerequisite": null,
  "title": "The Perfectly Wrong Size",
  "image": "/rpg-assets/events/cg/season01/daisy_barb_camila_wrong_size.webp",
  "cgSequence": [
    "daisy_barb_camila_wrong_size",
    "daisy_barb_camila_wrong_size_02",
    "daisy_barb_camila_wrong_size_03"
  ],
  "cgSwitchSteps": [
    0,
    4,
    9
  ],
  "lines": [
    {
      "speaker": "Narrator",
      "text": "After the café mishap, Camila and Daisy come to Barb's workshop to collect their replacement designs."
    },
    {
      "speaker": "barb",
      "text": "I finished both pieces! I might have mixed up the labels, but that's nothing."
    },
    {
      "speaker": "daisy",
      "text": "Why is my jacket big enough to fit the entire card shop?"
    },
    {
      "speaker": "camila",
      "text": "And why is mine the size of a trading card sleeve?"
    },
    {
      "speaker": "Narrator",
      "text": "Camila tries the decorative jacket over her normal black top. It doesn't reach anywhere near where a jacket should."
    },
    {
      "speaker": "camila",
      "text": "It's called a cropped silhouette. A very, very cropped silhouette."
    },
    {
      "speaker": "daisy",
      "text": "Barb, that's a jacket for a Pikachu!"
    },
    {
      "speaker": "barb",
      "text": "Okay, okay. Maybe I copied the measurements onto the wrong pattern."
    },
    {
      "speaker": "daisy",
      "text": "At least my skirt has to be the right size. Hand it over."
    },
    {
      "speaker": "Narrator",
      "text": "Daisy tries on the skirt over its secure lining. The belt sits unusually low, and the finished skirt is comically undersized."
    },
    {
      "speaker": "daisy",
      "text": "BARB! You made mine tiny too!"
    },
    {
      "speaker": "camila",
      "text": "I can't believe we both lost a fight to the measuring tape!"
    },
    {
      "speaker": "barb",
      "text": "This is officially the worst fitting day in the history of my workshop."
    },
    {
      "speaker": "daisy",
      "text": "Next time, let's measure the clothes before we put them on!"
    },
    {
      "speaker": "Narrator",
      "text": "All three burst into helpless laughter. Barb writes 'REMEASURE EVERYTHING' across her sketchbook."
    }
  ],
  "choices": [
    {
      "label": "Help Barb correct the measurements",
      "reply": "Barb borrows your notes while Daisy and Camila keep laughing.",
      "kind": "support",
      "flag": "daisy_wrong_size_help",
      "delta": {
        "affection": 1,
        "trust": 1
      }
    },
    {
      "label": "Suggest they keep the tiny outfits as a warning",
      "reply": "Daisy laughs: 'The Museum of Barb's Greatest Mistakes!'",
      "kind": "playful",
      "flag": "daisy_wrong_size_joke",
      "delta": {
        "affection": 1,
        "respect": 1
      }
    }
  ],
  "artPending": false,
  "art": {
    "scene": "Three-scene fitting-room comedy: wardrobe discovery, Camila's absurdly small decorative jacket, then Daisy's undersized low-slung skirt worn over secure opaque lining; everyone laughing.",
    "composition": "Three approved cinematic 16:9 CGs, separate moments with dialogue in between, lower fifth dialogue-safe.",
    "outfit": "Daisy signature burgundy long-sleeved translucent mesh over opaque underlayer and lined skirt; Camila black top, red skirt and tiny decorative jacket; Barb canonical red-haired designer workshop outfit.",
    "expression": "Surprise building to shared uncontrollable laughter",
    "environment": "shop",
    "mood": "lighthearted",
    "fanservice": 0
  }
});
// Approved additional Daisy CG sequences; image files uploaded separately.
cross.push(...[
 {
  "id": "daisy_barb_temporary_tattoo",
  "npc": "daisy",
  "participants": [
   "daisy",
   "barb"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 1,
  "start": 15,
  "end": 90,
  "minAffection": 0,
  "title": "The Tattoo Artist's Mistake",
  "artPending": false,
  "image": "/rpg-assets/events/cg/season01/daisy_barb_temporary_tattoo.webp",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Barb invites Daisy to test temporary tattoo transfers on a design sheet."
   },
   {
    "speaker": "Narrator",
    "text": "Daisy discovers a tiny pink cartoon face stuck to her cheek."
   },
   {
    "speaker": "daisy",
    "text": "Barb. Why is there a sticker on my FACE?"
   },
   {
    "speaker": "barb",
    "text": "Because it likes you!"
   },
   {
    "speaker": "daisy",
    "text": "You said it would come off immediately."
   },
   {
    "speaker": "barb",
    "text": "It will. After I finish laughing."
   },
   {
    "speaker": "daisy",
    "text": "I am never volunteering as your model again."
   }
  ],
  "choices": [
   {
    "label": "Join the laughter",
    "reply": "Daisy smiles and promises not to forget the moment.",
    "kind": "playful",
    "flag": "daisy_barb_temporary_tattoo_playful",
    "delta": {
     "affection": 1,
     "respect": 1
    }
   },
   {
    "label": "Help everyone recover",
    "reply": "Daisy appreciates your practical support.",
    "kind": "support",
    "flag": "daisy_barb_temporary_tattoo_support",
    "delta": {
     "affection": 1,
     "trust": 1
    }
   }
  ],
  "art": {
   "scene": "The Tattoo Artist's Mistake — approved Neo Campus illustrated crossover.",
   "composition": "16:9 cinematic CG with lower dialogue-safe area. Multiple images switch during the same encounter.",
   "outfit": "Use canon Daisy and partner character sheets; keep translucent burgundy sleeves and her identifying tattoos where shown.",
   "expression": "Playful situational expressions",
   "environment": "shop",
   "mood": "comedic slice of life",
   "fanservice": 0
  }
 },
 {
  "id": "daisy_laca_photo_booth",
  "npc": "daisy",
  "participants": [
   "daisy",
   "laca"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "arcade",
  "slot": 2,
  "start": 15,
  "end": 90,
  "minAffection": 0,
  "title": "The Photo Booth Disaster",
  "artPending": false,
  "image": "/rpg-assets/events/cg/season01/daisy_laca_photo_booth_01.webp",
  "cgSequence": [
   "daisy_laca_photo_booth_01",
   "daisy_laca_photo_booth_02"
  ],
  "cgSwitchSteps": [
   0,
   5
  ],
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Daisy and Laca squeeze into the arcade photo booth."
   },
   {
    "speaker": "daisy",
    "text": "I've perfected my camera face. Watch and learn."
   },
   {
    "speaker": "Narrator",
    "text": "The flash fires while both are still adjusting their positions."
   },
   {
    "speaker": "laca",
    "text": "Oh, those pictures are INCREDIBLE!"
   },
   {
    "speaker": "daisy",
    "text": "Do not you dare show anyone those!"
   },
   {
    "speaker": "Narrator",
    "text": "They inspect the printed strip together, laughing at each disastrous frame."
   },
   {
    "speaker": "laca",
    "text": "One for your room and one for mine!"
   },
   {
    "speaker": "daisy",
    "text": "...Fine. Give me the cutest one."
   }
  ],
  "choices": [
   {
    "label": "Join the laughter",
    "reply": "Daisy smiles and promises not to forget the moment.",
    "kind": "playful",
    "flag": "daisy_laca_photo_booth_playful",
    "delta": {
     "affection": 1,
     "respect": 1
    }
   },
   {
    "label": "Help everyone recover",
    "reply": "Daisy appreciates your practical support.",
    "kind": "support",
    "flag": "daisy_laca_photo_booth_support",
    "delta": {
     "affection": 1,
     "trust": 1
    }
   }
  ],
  "art": {
   "scene": "The Photo Booth Disaster — approved Neo Campus illustrated crossover.",
   "composition": "16:9 cinematic CG with lower dialogue-safe area. Multiple images switch during the same encounter.",
   "outfit": "Use canon Daisy and partner character sheets; keep translucent burgundy sleeves and her identifying tattoos where shown.",
   "expression": "Playful situational expressions",
   "environment": "arcade",
   "mood": "comedic slice of life",
   "fanservice": 0
  }
 },
 {
  "id": "daisy_hana_makeover",
  "npc": "daisy",
  "participants": [
   "daisy",
   "hana"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 2,
  "start": 15,
  "end": 90,
  "minAffection": 0,
  "title": "The Midnight Makeover",
  "artPending": false,
  "image": "/rpg-assets/events/cg/season01/daisy_hana_makeover_01.webp",
  "cgSequence": [
   "daisy_hana_makeover_01",
   "daisy_hana_makeover_02"
  ],
  "cgSwitchSteps": [
   0,
   5
  ],
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Hana arrives at Barb's workshop with an entire bag of hair accessories."
   },
   {
    "speaker": "hana",
    "text": "Please let me try a softer look on you, Daisy!"
   },
   {
    "speaker": "daisy",
    "text": "Why do you need eight clips?"
   },
   {
    "speaker": "Narrator",
    "text": "Hana works carefully while Daisy pretends not to enjoy the pampering."
   },
   {
    "speaker": "hana",
    "text": "Okay. Ready for the mirror?"
   },
   {
    "speaker": "Narrator",
    "text": "Daisy turns to the illuminated vanity mirror and pauses."
   },
   {
    "speaker": "daisy",
    "text": "...Oh. That's actually really good."
   },
   {
    "speaker": "hana",
    "text": "I KNEW IT!"
   },
   {
    "speaker": "daisy",
    "text": "Do not tell Barb I said that."
   }
  ],
  "choices": [
   {
    "label": "Join the laughter",
    "reply": "Daisy smiles and promises not to forget the moment.",
    "kind": "playful",
    "flag": "daisy_hana_makeover_playful",
    "delta": {
     "affection": 1,
     "respect": 1
    }
   },
   {
    "label": "Help everyone recover",
    "reply": "Daisy appreciates your practical support.",
    "kind": "support",
    "flag": "daisy_hana_makeover_support",
    "delta": {
     "affection": 1,
     "trust": 1
    }
   }
  ],
  "art": {
   "scene": "The Midnight Makeover — approved Neo Campus illustrated crossover.",
   "composition": "16:9 cinematic CG with lower dialogue-safe area. Multiple images switch during the same encounter.",
   "outfit": "Use canon Daisy and partner character sheets; keep translucent burgundy sleeves and her identifying tattoos where shown.",
   "expression": "Playful situational expressions",
   "environment": "shop",
   "mood": "comedic slice of life",
   "fanservice": 0
  }
 },
 {
  "id": "daisy_laca_windy_boardwalk",
  "npc": "daisy",
  "participants": [
   "daisy",
   "laca"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "park",
  "slot": 1,
  "start": 15,
  "end": 90,
  "minAffection": 0,
  "title": "The Wind Has Other Plans",
  "artPending": false,
  "image": "/rpg-assets/events/cg/season01/daisy_laca_windy_boardwalk.webp",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "A sudden seaside gust snatches Daisy's loose fashion sketches from her bag."
   },
   {
    "speaker": "daisy",
    "text": "MY DESIGNS!"
   },
   {
    "speaker": "Narrator",
    "text": "Laca runs behind her, laughing while trying to catch a flying page."
   },
   {
    "speaker": "laca",
    "text": "I thought you said they were windproof!"
   },
   {
    "speaker": "daisy",
    "text": "THE CLOTHES, LACA! NOT THE PAPER!"
   },
   {
    "speaker": "Narrator",
    "text": "One last sketch drifts toward the ocean."
   },
   {
    "speaker": "laca",
    "text": "I got it! I got it! ...No, I don't."
   },
   {
    "speaker": "Narrator",
    "text": "Daisy finally bursts into laughter too."
   }
  ],
  "choices": [
   {
    "label": "Join the laughter",
    "reply": "Daisy smiles and promises not to forget the moment.",
    "kind": "playful",
    "flag": "daisy_laca_windy_boardwalk_playful",
    "delta": {
     "affection": 1,
     "respect": 1
    }
   },
   {
    "label": "Help everyone recover",
    "reply": "Daisy appreciates your practical support.",
    "kind": "support",
    "flag": "daisy_laca_windy_boardwalk_support",
    "delta": {
     "affection": 1,
     "trust": 1
    }
   }
  ],
  "art": {
   "scene": "The Wind Has Other Plans — approved Neo Campus illustrated crossover.",
   "composition": "16:9 cinematic CG with lower dialogue-safe area. Multiple images switch during the same encounter.",
   "outfit": "Use canon Daisy and partner character sheets; keep translucent burgundy sleeves and her identifying tattoos where shown.",
   "expression": "Playful situational expressions",
   "environment": "park",
   "mood": "comedic slice of life",
   "fanservice": 0
  }
 },
 {
  "id": "daisy_marina_splash",
  "npc": "daisy",
  "participants": [
   "daisy",
   "marina"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "pool",
  "slot": 1,
  "start": 15,
  "end": 90,
  "minAffection": 0,
  "title": "The Unexpected Splash",
  "artPending": false,
  "image": "/rpg-assets/events/cg/season01/daisy_marina_splash_01.webp",
  "cgSequence": [
   "daisy_marina_splash_01",
   "daisy_marina_splash_02"
  ],
  "cgSwitchSteps": [
   0,
   7
  ],
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Daisy arrives at the pool determined to keep her hair dry."
   },
   {
    "speaker": "marina",
    "text": "You said you wanted to cool off!"
   },
   {
    "speaker": "Narrator",
    "text": "Marina accidentally sends a huge splash toward Daisy."
   },
   {
    "speaker": "daisy",
    "text": "MARINA! MY HAIR!"
   },
   {
    "speaker": "marina",
    "text": "You can get me back if you want."
   },
   {
    "speaker": "Narrator",
    "text": "Daisy spots an oversized water blaster by the pool steps."
   },
   {
    "speaker": "daisy",
    "text": "Oh, absolutely. I've got an idea."
   },
   {
    "speaker": "Narrator",
    "text": "Daisy takes aim while Marina relaxes on an inflatable."
   },
   {
    "speaker": "marina",
    "text": "You're being suspiciously nice."
   },
   {
    "speaker": "daisy",
    "text": "Me? Never."
   }
  ],
  "choices": [
   {
    "label": "Join the laughter",
    "reply": "Daisy smiles and promises not to forget the moment.",
    "kind": "playful",
    "flag": "daisy_marina_splash_playful",
    "delta": {
     "affection": 1,
     "respect": 1
    }
   },
   {
    "label": "Help everyone recover",
    "reply": "Daisy appreciates your practical support.",
    "kind": "support",
    "flag": "daisy_marina_splash_support",
    "delta": {
     "affection": 1,
     "trust": 1
    }
   }
  ],
  "art": {
   "scene": "The Unexpected Splash — approved Neo Campus illustrated crossover.",
   "composition": "16:9 cinematic CG with lower dialogue-safe area. Multiple images switch during the same encounter.",
   "outfit": "Use canon Daisy and partner character sheets; keep translucent burgundy sleeves and her identifying tattoos where shown.",
   "expression": "Playful situational expressions",
   "environment": "pool",
   "mood": "comedic slice of life",
   "fanservice": 0
  }
 },
 {
  "id": "daisy_barb_ribbons",
  "npc": "daisy",
  "participants": [
   "daisy",
   "barb"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 1,
  "start": 15,
  "end": 90,
  "minAffection": 0,
  "title": "The Changing Room Mix-Up",
  "artPending": false,
  "image": "/rpg-assets/events/cg/season01/daisy_barb_ribbons_01.webp",
  "cgSequence": [
   "daisy_barb_ribbons_01",
   "daisy_barb_ribbons_02",
   "daisy_barb_ribbons_03",
   "daisy_barb_ribbons_04",
   "daisy_barb_ribbons_05"
  ],
  "cgSwitchSteps": [
   0,
   3,
   5,
   8,
   12
  ],
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Barb hands Daisy what appears to be an endless collection of decorative ribbons."
   },
   {
    "speaker": "daisy",
    "text": "How many ribbons does one outfit actually need?"
   },
   {
    "speaker": "Narrator",
    "text": "Daisy ends up tangled on the fitting bench while Barb struggles not to laugh."
   },
   {
    "speaker": "barb",
    "text": "Stop moving! I think I found the knot."
   },
   {
    "speaker": "Narrator",
    "text": "Barb tries to free Daisy and catches herself in the ribbons."
   },
   {
    "speaker": "daisy",
    "text": "Now we're BOTH stuck!"
   },
   {
    "speaker": "Narrator",
    "text": "The two laugh while attempting to untie the next loop."
   },
   {
    "speaker": "barb",
    "text": "Almost. Just let me get closer so I can see it."
   },
   {
    "speaker": "Narrator",
    "text": "Daisy suddenly notices how close their faces are."
   },
   {
    "speaker": "daisy",
    "text": "You're very close right now, Barb."
   },
   {
    "speaker": "barb",
    "text": "Need me to move?"
   },
   {
    "speaker": "daisy",
    "text": "I DIDN'T SAY THAT!"
   },
   {
    "speaker": "Narrator",
    "text": "Barb finally loosens the knot, and the pair collapse into laughter."
   },
   {
    "speaker": "barb",
    "text": "I am not charging you for alterations today."
   },
   {
    "speaker": "daisy",
    "text": "Good. I am charging you for emotional damage!"
   }
  ],
  "choices": [
   {
    "label": "Join the laughter",
    "reply": "Daisy smiles and promises not to forget the moment.",
    "kind": "playful",
    "flag": "daisy_barb_ribbons_playful",
    "delta": {
     "affection": 1,
     "respect": 1
    }
   },
   {
    "label": "Help everyone recover",
    "reply": "Daisy appreciates your practical support.",
    "kind": "support",
    "flag": "daisy_barb_ribbons_support",
    "delta": {
     "affection": 1,
     "trust": 1
    }
   }
  ],
  "art": {
   "scene": "The Changing Room Mix-Up — approved Neo Campus illustrated crossover.",
   "composition": "16:9 cinematic CG with lower dialogue-safe area. Multiple images switch during the same encounter.",
   "outfit": "Use canon Daisy and partner character sheets; keep translucent burgundy sleeves and her identifying tattoos where shown.",
   "expression": "Playful situational expressions",
   "environment": "shop",
   "mood": "comedic slice of life",
   "fanservice": 0
  }
 },
 {
  "id": "daisy_yuna_card_theft",
  "npc": "daisy",
  "participants": [
   "daisy",
   "yuna"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 1,
  "start": 15,
  "end": 90,
  "minAffection": 0,
  "title": "The Great Deck Theft",
  "artPending": false,
  "image": "/rpg-assets/events/cg/season01/daisy_yuna_card_theft.webp",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Daisy is helping Yuna sort a pile of valuable cards."
   },
   {
    "speaker": "Narrator",
    "text": "Yuna's mischievous partner snatches a card and hops onto the display."
   },
   {
    "speaker": "daisy",
    "text": "YUNA! YOUR PARTNER STOLE MY CARD!"
   },
   {
    "speaker": "yuna",
    "text": "He likes you!"
   },
   {
    "speaker": "daisy",
    "text": "THAT'S A FIRST EDITION!"
   },
   {
    "speaker": "Narrator",
    "text": "Yuna dissolves into laughter as Daisy negotiates with the tiny thief."
   },
   {
    "speaker": "daisy",
    "text": "Listen. We can work something out."
   }
  ],
  "choices": [
   {
    "label": "Join the laughter",
    "reply": "Daisy smiles and promises not to forget the moment.",
    "kind": "playful",
    "flag": "daisy_yuna_card_theft_playful",
    "delta": {
     "affection": 1,
     "respect": 1
    }
   },
   {
    "label": "Help everyone recover",
    "reply": "Daisy appreciates your practical support.",
    "kind": "support",
    "flag": "daisy_yuna_card_theft_support",
    "delta": {
     "affection": 1,
     "trust": 1
    }
   }
  ],
  "art": {
   "scene": "The Great Deck Theft — approved Neo Campus illustrated crossover.",
   "composition": "16:9 cinematic CG with lower dialogue-safe area. Multiple images switch during the same encounter.",
   "outfit": "Use canon Daisy and partner character sheets; keep translucent burgundy sleeves and her identifying tattoos where shown.",
   "expression": "Playful situational expressions",
   "environment": "shop",
   "mood": "comedic slice of life",
   "fanservice": 0
  }
 },
 {
  "id": "daisy_camila_coffee_spill",
  "npc": "daisy",
  "participants": [
   "daisy",
   "camila"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "cafe",
  "slot": 2,
  "start": 15,
  "end": 90,
  "minAffection": 0,
  "title": "The Worst Possible Timing",
  "artPending": false,
  "image": "/rpg-assets/events/cg/season01/daisy_camila_coffee_spill.webp",
  "lines": [
   {
    "speaker": "Narrator",
    "text": "Camila calmly advises Daisy on building a resilient deck."
   },
   {
    "speaker": "camila",
    "text": "The secret is staying calm under pressure."
   },
   {
    "speaker": "Narrator",
    "text": "An iced coffee tips toward Daisy's meticulously annotated deck notebook."
   },
   {
    "speaker": "camila",
    "text": "OH NO!"
   },
   {
    "speaker": "daisy",
    "text": "CAMILA! THAT'S MY DECK LIST!"
   },
   {
    "speaker": "camila",
    "text": "I'M STAYING CALM!"
   },
   {
    "speaker": "daisy",
    "text": "YOU'RE SCREAMING!"
   },
   {
    "speaker": "Narrator",
    "text": "They rescue the surviving pages and promise to rewrite the rest together."
   }
  ],
  "choices": [
   {
    "label": "Join the laughter",
    "reply": "Daisy smiles and promises not to forget the moment.",
    "kind": "playful",
    "flag": "daisy_camila_coffee_spill_playful",
    "delta": {
     "affection": 1,
     "respect": 1
    }
   },
   {
    "label": "Help everyone recover",
    "reply": "Daisy appreciates your practical support.",
    "kind": "support",
    "flag": "daisy_camila_coffee_spill_support",
    "delta": {
     "affection": 1,
     "trust": 1
    }
   }
  ],
  "art": {
   "scene": "The Worst Possible Timing — approved Neo Campus illustrated crossover.",
   "composition": "16:9 cinematic CG with lower dialogue-safe area. Multiple images switch during the same encounter.",
   "outfit": "Use canon Daisy and partner character sheets; keep translucent burgundy sleeves and her identifying tattoos where shown.",
   "expression": "Playful situational expressions",
   "environment": "cafe",
   "mood": "comedic slice of life",
   "fanservice": 0
  }
 }
]);
// Four approved sleepover CGs, in chronological event order.
cross.push({
  "id": "daisy_laca_sleepover",
  "npc": "daisy",
  "participants": [
    "daisy",
    "laca"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "home",
  "slot": 2,
  "start": 25,
  "end": 90,
  "minAffection": 0,
  "title": "The Unexpected Sleepover",
  "artPending": false,
  "image": "/rpg-assets/events/cg/season01/daisy_laca_sleepover_01.webp",
  "cgSequence": [
    "daisy_laca_sleepover_01",
    "daisy_laca_sleepover_02",
    "daisy_laca_sleepover_03",
    "daisy_laca_sleepover_04",
    "daisy_laca_sleepover_05"
  ],
  "cgSwitchSteps": [
    0,
    7,
    9,
    11,
    13
  ],
  "lines": [
    {
      "speaker": "Narrator",
      "text": "Rain rattles the window while Daisy and Laca arrange their decks across a warm blanket."
    },
    {
      "speaker": "laca",
      "text": "It's two in the morning, Daisy."
    },
    {
      "speaker": "daisy",
      "text": "And?"
    },
    {
      "speaker": "laca",
      "text": "You've been studying my hand for five minutes."
    },
    {
      "speaker": "daisy",
      "text": "That's how I know you're planning something."
    },
    {
      "speaker": "laca",
      "text": "I have two Energy cards. Also, you're getting sleepy."
    },
    {
      "speaker": "Narrator",
      "text": "Their last match ends with a sleepy laugh. Neither bothers to clear away the cards."
    },
    {
      "speaker": "daisy",
      "text": "One more game?"
    },
    {
      "speaker": "laca",
      "text": "You can challenge me tomorrow. Come here."
    },
    {
      "speaker": "Narrator",
      "text": "Laca nestles against Daisy's shoulder beneath the quilt as the rain softens outside."
    },
    {
      "speaker": "daisy",
      "text": "...Okay. Five minutes."
    },
    {
      "speaker": "Narrator",
      "text": "Daisy gently hugs her closer, and the two drift off beside the unfinished game."
    },
    {
      "speaker": "Narrator",
      "text": "The bedside lamp dims; Daisy's hand rests protectively in Laca's hair."
    },
    {
      "speaker": "Narrator",
      "text": "From the other side of the bed, the last few cards and the sleeping plush are visible. Neither girl stirs."
    },
    {
      "speaker": "Narrator",
      "text": "At last the rain quiets. Still embracing, they sleep peacefully until morning."
    }
  ],
  "choices": [
    {
      "label": "Let them rest",
      "reply": "You quietly close the door, leaving Daisy and Laca asleep beside their cards.",
      "kind": "support",
      "flag": "daisy_laca_sleepover_rest",
      "delta": {
        "affection": 1,
        "trust": 1
      }
    },
    {
      "label": "Leave a blanket nearby",
      "reply": "A spare blanket keeps the room cozy until morning.",
      "kind": "support",
      "flag": "daisy_laca_sleepover_blanket",
      "delta": {
        "affection": 1,
        "respect": 1
      }
    }
  ],
  "art": {
    "scene": "Rainy night card game ends with Daisy and Laca asleep in a comfortable hug. Five approved scene images.",
    "composition": "Five sequential wide 16:9 CGs: overhead card game, cuddled sleep, alternate embrace angle, last cozy close view.",
    "outfit": "Daisy black hair, correct tattoos, burgundy long mesh sleeves with opaque sleepwear; Laca black camisole and plaid pajama pants.",
    "expression": "Natural sleepy smiles and tender closed-eye expressions",
    "environment": "home",
    "mood": "cozy affectionate slice of life",
    "fanservice": 0
  }
});
// Approved Reina, Rina and Akari two-CG encounters; images uploaded independently.
cross.push(...[
  {
    "id": "daisy_reina_card_heist",
    "npc": "daisy",
    "participants": [
      "daisy",
      "reina"
    ],
    "encounterType": "slice",
    "trigger": "talk",
    "place": "shop",
    "slot": 2,
    "start": 28,
    "end": 90,
    "minAffection": 0,
    "title": "The Midnight Card Heist",
    "artPending": false,
    "image": "/rpg-assets/events/cg/season01/daisy_reina_card_heist_01.webp",
    "cgSequence": [
      "daisy_reina_card_heist_01",
      "daisy_reina_card_heist_02"
    ],
    "cgSwitchSteps": [
      0,
      7
    ],
    "lines": [
      {
        "speaker": "Narrator",
        "text": "After closing, Reina asks Daisy to help clean the rare-card display."
      },
      {
        "speaker": "reina",
        "text": "These old cases are sensitive. Please don't touch the alarm sensor."
      },
      {
        "speaker": "daisy",
        "text": "Me? I'm the picture of careful."
      },
      {
        "speaker": "Narrator",
        "text": "Daisy reaches for a dusty corner with her cleaning cloth. An alarm immediately erupts."
      },
      {
        "speaker": "reina",
        "text": "Daisy! What did you touch?"
      },
      {
        "speaker": "daisy",
        "text": "Technically? Nothing."
      },
      {
        "speaker": "reina",
        "text": "Then why is the alarm going off?"
      },
      {
        "speaker": "Narrator",
        "text": "Reina rushes to the security keypad. Daisy offers to hold the flashlight."
      },
      {
        "speaker": "daisy",
        "text": "Here. Better light helps, right?"
      },
      {
        "speaker": "reina",
        "text": "Not in my eyes! Daisy, point it at the PANEL!"
      },
      {
        "speaker": "daisy",
        "text": "Oops. Sorry! I'm nervous!"
      },
      {
        "speaker": "Narrator",
        "text": "Reina finally silences the alarm. Both women exchange an exhausted look, then laugh."
      }
    ],
    "choices": [
      {
        "label": "Enjoy the moment",
        "reply": "Daisy laughs and gives her friend an appreciative smile.",
        "kind": "playful",
        "flag": "daisy_reina_card_heist_playful",
        "delta": {
          "affection": 1,
          "respect": 1
        }
      },
      {
        "label": "Offer to help",
        "reply": "Daisy appreciates your support.",
        "kind": "support",
        "flag": "daisy_reina_card_heist_help",
        "delta": {
          "affection": 1,
          "trust": 1
        }
      }
    ],
    "art": {
      "scene": "The Midnight Card Heist — approved two-stage Daisy crossover",
      "composition": "Two wide 16:9 CGs displayed sequentially with dialogue between, lower fifth dialogue-safe.",
      "outfit": "Approved canonical outfits, especially Daisy's translucent burgundy long-sleeve mesh shirt and tattoos.",
      "expression": "Natural comic reactions and expressive but restrained faces",
      "environment": "shop",
      "mood": "playful",
      "fanservice": 0
    }
  },
  {
    "id": "daisy_rina_karaoke",
    "npc": "daisy",
    "participants": [
      "daisy",
      "rina"
    ],
    "encounterType": "slice",
    "trigger": "talk",
    "place": "arcade",
    "slot": 2,
    "start": 25,
    "end": 90,
    "minAffection": 0,
    "title": "The Great Karaoke Betrayal",
    "artPending": false,
    "image": "/rpg-assets/events/cg/season01/daisy_rina_karaoke_01.webp",
    "cgSequence": [
      "daisy_rina_karaoke_01",
      "daisy_rina_karaoke_02"
    ],
    "cgSwitchSteps": [
      0,
      6
    ],
    "lines": [
      {
        "speaker": "Narrator",
        "text": "Rina invites Daisy to a private karaoke booth after an evening in the arcade."
      },
      {
        "speaker": "rina",
        "text": "Just one easy song. Promise!"
      },
      {
        "speaker": "daisy",
        "text": "I know every word. You're about to be impressed."
      },
      {
        "speaker": "Narrator",
        "text": "The backing track launches into an absurdly fast chorus."
      },
      {
        "speaker": "daisy",
        "text": "Rina! You said this song was easy!"
      },
      {
        "speaker": "rina",
        "text": "It is! Just keep up!"
      },
      {
        "speaker": "Narrator",
        "text": "Rina grabs a second microphone and joins Daisy for the chorus."
      },
      {
        "speaker": "daisy",
        "text": "I can't even read that fast!"
      },
      {
        "speaker": "rina",
        "text": "Then sing louder!"
      },
      {
        "speaker": "Narrator",
        "text": "They finish the duet in fits of laughter and collapse onto the couch."
      }
    ],
    "choices": [
      {
        "label": "Enjoy the moment",
        "reply": "Daisy laughs and gives her friend an appreciative smile.",
        "kind": "playful",
        "flag": "daisy_rina_karaoke_playful",
        "delta": {
          "affection": 1,
          "respect": 1
        }
      },
      {
        "label": "Offer to help",
        "reply": "Daisy appreciates your support.",
        "kind": "support",
        "flag": "daisy_rina_karaoke_help",
        "delta": {
          "affection": 1,
          "trust": 1
        }
      }
    ],
    "art": {
      "scene": "The Great Karaoke Betrayal — approved two-stage Daisy crossover",
      "composition": "Two wide 16:9 CGs displayed sequentially with dialogue between, lower fifth dialogue-safe.",
      "outfit": "Approved canonical outfits, especially Daisy's translucent burgundy long-sleeve mesh shirt and tattoos.",
      "expression": "Natural comic reactions and expressive but restrained faces",
      "environment": "arcade",
      "mood": "playful",
      "fanservice": 0
    }
  },
  {
    "id": "daisy_akari_arcade",
    "npc": "daisy",
    "participants": [
      "daisy",
      "akari"
    ],
    "encounterType": "slice",
    "trigger": "talk",
    "place": "arcade",
    "slot": 1,
    "start": 20,
    "end": 90,
    "minAffection": 0,
    "title": "The Great Arcade Rivalry",
    "artPending": false,
    "image": "/rpg-assets/events/cg/season01/daisy_akari_arcade_01.webp",
    "cgSequence": [
      "daisy_akari_arcade_01",
      "daisy_akari_arcade_02"
    ],
    "cgSwitchSteps": [
      0,
      6
    ],
    "lines": [
      {
        "speaker": "Narrator",
        "text": "Daisy challenges Akari to one more rhythm-game match."
      },
      {
        "speaker": "daisy",
        "text": "I've got this round. No excuses."
      },
      {
        "speaker": "akari",
        "text": "Okay. Ready?"
      },
      {
        "speaker": "Narrator",
        "text": "The notes fly by, but Akari barely seems to break a sweat."
      },
      {
        "speaker": "daisy",
        "text": "How are you doing that?"
      },
      {
        "speaker": "akari",
        "text": "Practice."
      },
      {
        "speaker": "Narrator",
        "text": "From behind the arcade cabinet, the final scores reveal Akari's perfect combo and Daisy's respectable but distant second place."
      },
      {
        "speaker": "daisy",
        "text": "That's not an answer!"
      },
      {
        "speaker": "akari",
        "text": "It's literally the answer."
      },
      {
        "speaker": "daisy",
        "text": "Rematch?"
      },
      {
        "speaker": "akari",
        "text": "You said that three games ago."
      },
      {
        "speaker": "Narrator",
        "text": "Daisy smiles despite herself and queues up another round."
      }
    ],
    "choices": [
      {
        "label": "Enjoy the moment",
        "reply": "Daisy laughs and gives her friend an appreciative smile.",
        "kind": "playful",
        "flag": "daisy_akari_arcade_playful",
        "delta": {
          "affection": 1,
          "respect": 1
        }
      },
      {
        "label": "Offer to help",
        "reply": "Daisy appreciates your support.",
        "kind": "support",
        "flag": "daisy_akari_arcade_help",
        "delta": {
          "affection": 1,
          "trust": 1
        }
      }
    ],
    "art": {
      "scene": "The Great Arcade Rivalry — approved two-stage Daisy crossover",
      "composition": "Two wide 16:9 CGs displayed sequentially with dialogue between, lower fifth dialogue-safe.",
      "outfit": "Approved canonical outfits, especially Daisy's translucent burgundy long-sleeve mesh shirt and tattoos.",
      "expression": "Natural comic reactions and expressive but restrained faces",
      "environment": "arcade",
      "mood": "playful",
      "fanservice": 0
    }
  }
]);
const pack=root.NeoRpgCharacterPacks?.byId?.('daisy');
if(pack){for(const e of solo){const existing=pack.events.find(x=>x.id===e.id);if(existing)Object.assign(existing,e);else pack.events.push(e);
 if(!pack.art.eventImages.some(x=>x.sceneId===e.id))pack.art.eventImages.push({sceneId:e.id,path:'/rpg-assets/events/cg/slice-life/'+e.id+'.png',prompt:e.lines[0].text+' Cinematic 16:9 scene with Daisy, canonical facial features, costumes and tattoos. Leave lower fifth clear. Artwork pending.'});}}
const registry=root.NeoRpgCrossCharacterEvents;
if(registry?.events)for(const e of cross){const existing=registry.events.find(x=>x.id===e.id);if(existing)Object.assign(existing,e);else registry.events.push(e);}
if(registry?.pendingArt)for(const e of cross){const item=registry.pendingArt.find(x=>x.id===e.id);if(item&&e.artPending===false){item.status='APPROVED';item.path=e.image;item.brief=e.art.scene;}else if(!item)registry.pendingArt.push({id:e.id,path:e.image,participants:e.participants,title:e.title,brief:e.art.scene,composition:e.art.composition,status:e.artPending===false?'APPROVED':'PENDING_CG'});}

// Daisy's three solo illustrated scenes are registered with explicit asset paths.
const daisyPack=root.NeoRpgCharacterPacks?.byId?.('daisy');
if(daisyPack){
 const extras=[
  {id:'daisy_random_window_reflection',title:'Window Reflection',place:'shop',slot:1,image:'/rpg-assets/events/cg/slice-life/daisy_random_window_reflection.png',scene:'Daisy studies her reflection in the shop window.'},
  {id:'daisy_random_rain_shelter',title:'The Borrowed Umbrella',place:'park',slot:2,image:'/rpg-assets/events/cg/slice-life/daisy_random_rain_shelter.png',scene:'Daisy and the protagonist share a borrowed umbrella in a park shower.'},
  {id:'daisy_random_deck_luck',title:'Lucky Draw, Unlucky Shuffle',place:'shop',slot:1,image:'/rpg-assets/events/cg/slice-life/daisy_random_deck_luck.png',scene:'Daisy’s sleeved cards scatter across the card shop floor.'}
 ];
 for(const e of extras){
  const lines=e.id==='daisy_random_window_reflection'?
   [{speaker:'Narrator',text:'Daisy pauses by the shop window, studying her reflection as the late light catches the glass.'},{speaker:'daisy',text:'You weren’t checking the display, were you?'},{speaker:'Protagonist',text:'I was checking if the shop was open.'},{speaker:'daisy',text:'Sure. And I was checking the weather inside.'},{speaker:'Protagonist',text:'A reflection makes a remarkably honest mirror.'},{speaker:'daisy',text:'Come on. We have a little time left.'}]:e.id==='daisy_random_rain_shelter'?
   [{speaker:'Narrator',text:'A sudden shower leaves Daisy and the protagonist sharing a borrowed umbrella at the park path.'},{speaker:'daisy',text:'Rain has no respect for a carefully planned outfit.'},{speaker:'Protagonist',text:'At least this umbrella is big enough for both of us.'},{speaker:'daisy',text:'Then I suppose we owe its owner a thank-you note.'},{speaker:'Protagonist',text:'Or we could enjoy the extra five minutes.'},{speaker:'daisy',text:'Come on. We have a little time left.'}]:
   [{speaker:'Narrator',text:'Daisy’s deck box tips over on the shop floor, scattering sleeved cards around both of you.'},{speaker:'daisy',text:'That’s not how I wanted to reveal my strategy.'},{speaker:'Protagonist',text:'I’m not looking at the cards.'},{speaker:'daisy',text:'You say that like your curiosity doesn’t have a face.'},{speaker:'Protagonist',text:'Help me collect them and I might give you a fair game.'},{speaker:'daisy',text:'Come on. We have a little time left.'}];
  const choices=[{label:'Offer practical help',reply:'Daisy gives you a grateful, surprised smile.',kind:'support',flag:e.id+'_help',delta:{affection:1,trust:1}},{label:'Make a playful observation',reply:'Daisy laughs and challenges you to keep up.',kind:'playful',flag:e.id+'_joke',delta:{affection:1,respect:1}}];
  const event={id:e.id,npc:'daisy',title:e.title,place:e.place,slot:e.slot,start:12,end:90,minBond:0,prerequisite:null,encounterType:'slice',trigger:'entry',randomForced:true,chancePercent:37,participants:[],lines,choices,image:e.image,art:{scene:e.scene,composition:'Approved landscape CG with lower fifth clear for dialogue.',outfit:'Use Daisy’s canonical outfit shown in the approved illustration.',expression:'Character-specific natural expression.',environment:e.place,mood:'everyday',fanservice:0}};
  const existing=daisyPack.events.find(x=>x.id===e.id);if(existing)Object.assign(existing,event);else daisyPack.events.push(event);
  const registered=daisyPack.art.eventImages.find(x=>x.sceneId===e.id);
  if(registered)registered.path=e.image;else daisyPack.art.eventImages.push({sceneId:e.id,path:e.image,prompt:'Approved CG: '+e.scene+' Preserve Daisy’s canonical appearance and keep the lower fifth clear for dialogue.'});
 }
}
if(typeof module==='object'&&module.exports)module.exports={solo,cross};
})(typeof window!=='undefined'?window:globalThis);
