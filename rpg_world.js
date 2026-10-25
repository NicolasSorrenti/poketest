'use strict';
/* Neo Harbor's location activities and missable everyday encounters.
   Rules live outside the TCG engine and the browser view. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgWorld=api;
})(typeof window!=='undefined'?window:null,function(){
 const REL=typeof module==='object'&&module.exports?require('./rpg_relationships'):window.NeoRpgRelationships;
 const activities=[
  {
    "id": "home_reflect",
    "place": "home",
    "slots": [
      0,
      1,
      2
    ],
    "title": "Review your duel journal",
    "cost": 0,
    "focus": 5,
    "change": {
      "insight": 2,
      "preparation": 1
    },
    "text": "The journal falls open to a match you nearly forgot. One line in the margin makes more sense on a second look."
  },
  {
    "id": "home_recharge",
    "place": "home",
    "slots": [
      0,
      1,
      2
    ],
    "title": "Take a proper break",
    "cost": 0,
    "focus": 0,
    "change": {
      "focus": 30
    },
    "text": "The phone goes quiet. You eat something, put the deck boxes away, and finally get an evening without a bracket."
  },
  {
    "id": "shop_shift",
    "place": "shop",
    "slots": [
      0,
      1
    ],
    "title": "Help behind the counter",
    "cost": 0,
    "focus": 12,
    "change": {
      "credits": 18,
      "reputation": 1
    },
    "npc": "hana",
    "bond": {
      "trust": 1
    },
    "text": "By closing time the sleeves are restocked and the counter is clear. Your pay is waiting by the register."
  },
  {
    "id": "shop_trade",
    "place": "shop",
    "slots": [
      1,
      2
    ],
    "title": "Study the trading binder",
    "cost": 0,
    "focus": 8,
    "change": {
      "insight": 2,
      "reputation": 1
    },
    "npc": "camila",
    "bond": {
      "affection": 1
    },
    "text": "A binder page holds three versions of the same card. The price tags tell only half the story."
  },
  {
    "id": "arcade_combo",
    "place": "arcade",
    "slots": [
      1,
      2
    ],
    "title": "Run the combo challenge",
    "cost": 5,
    "focus": 10,
    "change": {
      "insight": 2,
      "preparation": 1
    },
    "npc": "yuna",
    "bond": {
      "affection": 1
    },
    "text": "The first combo fails. So does the second. By the fifth attempt, you've found the card that keeps causing trouble."
  },
  {
    "id": "arcade_scores",
    "place": "arcade",
    "slots": [
      1,
      2
    ],
    "title": "Climb the score board",
    "cost": 4,
    "focus": 12,
    "change": {
      "reputation": 2,
      "insight": 1
    },
    "npc": "kaede",
    "bond": {
      "respect": 1
    },
    "text": "A new set of initials appears higher on the score board. Two regulars glance up from their drinks."
  },
  {
    "id": "park_walk",
    "place": "park",
    "slots": [
      0,
      1,
      2
    ],
    "title": "Walk along the waterfront",
    "cost": 0,
    "focus": 0,
    "change": {
      "focus": 20
    },
    "npc": "marina",
    "bond": {
      "trust": 1
    },
    "text": "The ferry horn fades behind you. You take the longer path along the railings before heading home."
  },
  {
    "id": "park_flyers",
    "place": "park",
    "slots": [
      0,
      1
    ],
    "title": "Help with community flyers",
    "cost": 0,
    "focus": 8,
    "change": {
      "reputation": 2,
      "credits": 6
    },
    "npc": "hana",
    "bond": {
      "affection": 1
    },
    "text": "By afternoon, the event flyers have reached every noticeboard along the waterfront. One is already crooked."
  },
  {
    "id": "cafe_shift",
    "place": "cafe",
    "slots": [
      0,
      1
    ],
    "title": "Cover the café rush",
    "cost": 0,
    "focus": 14,
    "change": {
      "credits": 16,
      "reputation": 1
    },
    "npc": "camila",
    "bond": {
      "trust": 1
    },
    "text": "The lunch rush leaves a mountain of cups and a handful of tips. Someone has drawn a smile on your order pad."
  },
  {
    "id": "cafe_listen",
    "place": "cafe",
    "slots": [
      1,
      2
    ],
    "title": "Join the strategy table",
    "cost": 3,
    "focus": 7,
    "change": {
      "insight": 2,
      "focus": 3
    },
    "npc": "shiori",
    "bond": {
      "affection": 1
    },
    "text": "At the strategy table, a single misplayed Trainer sparks twenty minutes of argument and a much better opening."
  },
  {
    "id": "center_scrimmage",
    "place": "center",
    "slots": [
      1,
      2
    ],
    "title": "Practice tournament openings",
    "cost": 0,
    "focus": 15,
    "change": {
      "preparation": 2,
      "insight": 1
    },
    "npc": "reina",
    "bond": {
      "respect": 1
    },
    "text": "You shuffle another awkward starting hand, then another. By the last game, the first turn comes more easily."
  },
  {
    "id": "center_volunteer",
    "place": "center",
    "slots": [
      0,
      1
    ],
    "title": "Volunteer at the duel tables",
    "cost": 0,
    "focus": 10,
    "change": {
      "credits": 8,
      "reputation": 3
    },
    "npc": "akari",
    "bond": {
      "trust": 1
    },
    "text": "Someone loses a match slip. You find it under a chair before the next round is announced."
  },
  {
    "id": "library_research",
    "place": "library",
    "slots": [
      0,
      1
    ],
    "title": "Research historical matchups",
    "cost": 0,
    "focus": 10,
    "change": {
      "insight": 3,
      "preparation": 1
    },
    "npc": "akari",
    "bond": {
      "respect": 1
    },
    "text": "A yellowed tournament report contains exactly the matchup you were wondering about. Somebody has circled the key turn."
  },
  {
    "id": "library_read",
    "place": "library",
    "slots": [
      0,
      1,
      2
    ],
    "title": "Find some quiet and read",
    "cost": 0,
    "focus": 0,
    "change": {
      "focus": 16,
      "insight": 1
    },
    "npc": "shiori",
    "bond": {
      "trust": 1
    },
    "text": "The reading room is nearly empty. You finish a chapter before noticing how late it's become."
  },
  {"id":"center_mentor","place":"center","slots":[1,2],"title":"Lead a community training clinic","cost":0,"focus":12,"minReputation":6,"cooldownDays":7,"change":{"credits":28,"reputation":1},"npc":"akari","bond":{"trust":1},"text":"The center pays you to coach its newer duelists. Your growing reputation has brought students to your table."},
  {"id":"center_sponsor","place":"center","slots":[1,2],"title":"Host a sponsored card showcase","cost":0,"focus":16,"minReputation":15,"requiresStarter":true,"cooldownDays":7,"voucherSet":"latest","change":{"reputation":1},"text":"Your sponsor funds a booster from the newest expansion you have actually unlocked. Claim the voucher at the card shop."},
  {"id":"library_masterclass","place":"library","slots":[0,1],"title":"Teach a strategic masterclass","cost":0,"focus":12,"minInsight":10,"cooldownDays":7,"change":{"credits":16,"preparation":2},"npc":"akari","bond":{"respect":1},"text":"Your detailed matchup notes impress the regulars. You leave with a teaching fee and ideas for your next match."}
];
 function choice(label,reply,delta){return {label,reply,delta};}
 const encounters=[
  {
    "id": "shop_opening",
    "place": "shop",
    "npc": "hana",
    "start": 3,
    "end": 17,
    "slots": [
      0
    ],
    "minBond": 0,
    "title": "Before the Doors Open",
    "intro": "The shop's delivery boxes block the tournament table. Hana balances scissors on the counter while searching for the packing list.",
    "choices": [
      {
        "label": "Stay to help",
        "reply": "You got that end? Good. I think there's actually a table underneath.",
        "delta": {
          "reputation": 1,
          "trust": 2,
          "affection": 1,
          "focus": -6
        }
      },
      {
        "label": "Show a quicker way to organize",
        "reply": "Label the piles by set? Why didn't I think of that an hour ago?",
        "delta": {
          "insight": 2,
          "respect": 1,
          "affection": 1
        }
      }
    ]
  },
  {
    "id": "shop_trade_night",
    "place": "shop",
    "npc": "camila",
    "start": 19,
    "end": 36,
    "slots": [
      1,
      2
    ],
    "minBond": 1,
    "title": "The Unusual Trade",
    "intro": "At the shop, a collector holds two worn cards beneath the display lamp. Camila studies the scratched sleeve more closely than either card.",
    "choices": [
      {
        "label": "Make a fair proposal",
        "reply": "That's fair. Let me get sleeves for both of you before somebody changes their mind.",
        "delta": {
          "trust": 2,
          "reputation": 2,
          "credits": -5
        }
      },
      {
        "label": "Ask what the card means to them",
        "reply": "Ask him about the creased card. There's a reason he won't let go of it.",
        "delta": {
          "affection": 2,
          "insight": 1
        }
      }
    ]
  },
  {
    "id": "shop_late_match",
    "place": "shop",
    "npc": "reina",
    "start": 62,
    "end": 82,
    "slots": [
      1,
      2
    ],
    "minBond": 2,
    "title": "An Empty Practice Table",
    "intro": "Only one table lamp is still on at the shop. Reina has dealt two opening hands onto opposite sides of the mat.",
    "choices": [
      {
        "label": "Offer to test difficult hands",
        "reply": "You want to test the ugly hands? Good. Take the worse one.",
        "delta": {
          "respect": 2,
          "preparation": 1,
          "focus": -8
        }
      },
      {
        "label": "Suggest a break from competition",
        "reply": "Food first? Fine. But you're choosing somewhere that doesn't close early.",
        "delta": {
          "affection": 2,
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "arcade_joke",
    "place": "arcade",
    "npc": "yuna",
    "start": 7,
    "end": 23,
    "slots": [
      1,
      2
    ],
    "minBond": 0,
    "title": "One More Attempt",
    "intro": "A crowd surrounds Yuna's table at the arcade. She's written 'PLAN A' on a sleeve and crossed it out four times.",
    "choices": [
      {
        "label": "Join the experiment",
        "reply": "That went spectacularly wrong. Again! Before anybody learns from it.",
        "delta": {
          "affection": 2,
          "insight": 1
        }
      },
      {
        "label": "Offer some tactical advice",
        "reply": "Wait. If we change this Trainer, it can fail in a completely new way.",
        "delta": {
          "respect": 1,
          "preparation": 1,
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "arcade_challenge",
    "place": "arcade",
    "npc": "kaede",
    "start": 44,
    "end": 65,
    "slots": [
      1,
      2
    ],
    "minBond": 0,
    "title": "The New Challenger",
    "intro": "At the arcade, a stranger in a patched jacket has claimed the last free card table. Kaede looks up over her freshly shuffled deck.",
    "choices": [
      {
        "label": "Welcome her to the scene",
        "reply": "Local hospitality. I could get used to that. Know anyone worth playing?",
        "delta": {
          "affection": 1,
          "trust": 2
        }
      },
      {
        "label": "Discuss the toughest opponents",
        "reply": "Toughest opponent? Finally, a question with an interesting answer.",
        "delta": {
          "respect": 2,
          "insight": 1
        }
      }
    ]
  },
  {
    "id": "park_riverside",
    "place": "park",
    "npc": "marina",
    "start": 8,
    "end": 27,
    "slots": [
      0,
      2
    ],
    "minBond": 0,
    "title": "By the Water",
    "intro": "The last ferry crosses the water. Marina has left enough space on the bench for another person.",
    "choices": [
      {
        "label": "Enjoy the quiet together",
        "reply": "There's a quieter path past the railing. The sunset's better from there.",
        "delta": {
          "trust": 2,
          "focus": 12
        }
      },
      {
        "label": "Ask about her next challenge",
        "reply": "I still have that tournament flyer. It's in my bag somewhere.",
        "delta": {
          "affection": 1,
          "respect": 1,
          "preparation": 1
        }
      }
    ]
  },
  {
    "id": "park_communal",
    "place": "park",
    "npc": null,
    "start": 18,
    "end": 42,
    "slots": [
      0,
      1
    ],
    "minBond": 0,
    "title": "A Neighborhood Favor",
    "intro": "A volunteer struggles to keep a folding table upright. The wind sends event flyers across the grass.",
    "choices": [
      {
        "label": "Give them a hand",
        "reply": "The table finally stays level with a folded leaflet beneath its short leg.",
        "delta": {
          "reputation": 3,
          "focus": -8
        }
      },
      {
        "label": "Share a few spare supplies",
        "reply": "The organizers discover they've got enough pencils and cups for the afternoon.",
        "delta": {
          "reputation": 2,
          "credits": -6,
          "insight": 1
        }
      }
    ]
  },
  {
    "id": "cafe_old_story",
    "place": "cafe",
    "npc": "shiori",
    "start": 17,
    "end": 36,
    "slots": [
      0,
      2
    ],
    "minBond": 1,
    "title": "An Old Photograph",
    "intro": "Shiori pauses beneath an old photograph near the café door. Someone has written a tournament date on the frame.",
    "choices": [
      {
        "label": "Listen without pressing",
        "reply": "I knew her. She's in the back row. We were always late for round one.",
        "delta": {
          "trust": 2,
          "affection": 1
        }
      },
      {
        "label": "Offer a new perspective",
        "reply": "I'd forgotten how young we all looked in that picture.",
        "delta": {
          "respect": 2,
          "insight": 1
        }
      }
    ]
  },
  {
    "id": "cafe_neighbors",
    "place": "cafe",
    "npc": null,
    "start": 28,
    "end": 58,
    "slots": [
      1
    ],
    "minBond": 0,
    "title": "The Regulars’ Table",
    "intro": "Three café regulars argue over a deck list scribbled on a menu. Every Trainer has a question mark next to it.",
    "choices": [
      {
        "label": "Join the discussion",
        "reply": "Someone hands you the pencil. The debate shifts to which card anyone would actually draw.",
        "delta": {
          "reputation": 2,
          "insight": 1
        }
      },
      {
        "label": "Offer to buy a round of snacks",
        "reply": "A bowl of snacks lands on the table. The argument continues between mouthfuls.",
        "delta": {
          "credits": -7,
          "reputation": 2,
          "focus": 5
        }
      }
    ]
  },
  {
    "id": "cafe_trade",
    "place": "cafe",
    "npc": "camila",
    "start": 62,
    "end": 81,
    "slots": [
      2
    ],
    "minBond": 2,
    "title": "No Business Tonight",
    "intro": "Camila has left her card binder under the café table. The two coffees between you are already going cold.",
    "choices": [
      {
        "label": "Ask how she is doing",
        "reply": "Today? Fine. A little tired, actually. Don't tell the collectors.",
        "delta": {
          "trust": 2,
          "affection": 1
        }
      },
      {
        "label": "Tell her about your own worries",
        "reply": "I'd have guessed that worried you. Here, take the last biscuit.",
        "delta": {
          "affection": 2,
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "center_coach",
    "place": "center",
    "npc": "reina",
    "start": 11,
    "end": 32,
    "slots": [
      1,
      2
    ],
    "minBond": 0,
    "title": "Training Partners",
    "intro": "Reina tests an opening hand in the empty practice room, with another deck set up across from hers.",
    "choices": [
      {
        "label": "Ask her to critique your game",
        "reply": "Show me the turn before that. No, earlier. There's your problem.",
        "delta": {
          "respect": 2,
          "preparation": 1,
          "focus": -8
        }
      },
      {
        "label": "Encourage her to take a break",
        "reply": "A break? You planning to beat me by feeding me snacks? ...Might work.",
        "delta": {
          "affection": 2,
          "focus": 5
        }
      }
    ]
  },
  {
    "id": "center_volunteers",
    "place": "center",
    "npc": "akari",
    "start": 48,
    "end": 70,
    "slots": [
      1
    ],
    "minBond": 1,
    "title": "The Results Board",
    "intro": "Akari has ruled a grid across the community-center noticeboard. One row is missing a result.",
    "choices": [
      {
        "label": "Help check the rankings",
        "reply": "Ah, you're right. That score belongs on the next row. Hand me the pencil.",
        "delta": {
          "trust": 1,
          "respect": 1,
          "insight": 2
        }
      },
      {
        "label": "Suggest a different way to measure progress",
        "reply": "We could track the first-time players who returned. ...I'll need another column.",
        "delta": {
          "affection": 1,
          "respect": 2
        }
      }
    ]
  },
  {
    "id": "library_notes",
    "place": "library",
    "npc": "akari",
    "start": 13,
    "end": 35,
    "slots": [
      0,
      1
    ],
    "minBond": 0,
    "title": "Margin Notes",
    "intro": "At the library, Akari has filled the margin of a match report with tiny arrows. One points back to the opening turn.",
    "choices": [
      {
        "label": "Study the pattern together",
        "reply": "There. That's the hand I couldn't explain. Look at the Energy count.",
        "delta": {
          "trust": 1,
          "insight": 2,
          "preparation": 1
        }
      },
      {
        "label": "Question the key assumption",
        "reply": "I was treating the draw as certain. You're right; it isn't.",
        "delta": {
          "respect": 2,
          "affection": 1
        }
      }
    ]
  },
  {
    "id": "library_silence",
    "place": "library",
    "npc": "shiori",
    "start": 48,
    "end": 74,
    "slots": [
      0,
      1,
      2
    ],
    "minBond": 1,
    "title": "The Quiet Corner",
    "intro": "In the library's back room, Shiori has left the chair opposite her pulled out. A book lies open between two cups of tea.",
    "choices": [
      {
        "label": "Share a quiet hour",
        "reply": "This section gets better on the next page. Shall I spoil it?",
        "delta": {
          "trust": 2,
          "focus": 10
        }
      },
      {
        "label": "Exchange favorite books",
        "reply": "You've read that one? I never meet anyone who's finished the second half.",
        "delta": {
          "affection": 2,
          "insight": 1
        }
      }
    ]
  },
  {
    "id": "home_postcard",
    "place": "home",
    "npc": null,
    "start": 10,
    "end": 28,
    "slots": [
      2
    ],
    "minBond": 0,
    "title": "A Postcard From Home",
    "intro": "A postcard sits beside your deck list at home. Somebody has drawn a tiny Poké Ball beneath an untidy signature.",
    "choices": [
      {
        "label": "Write an honest reply",
        "reply": "Your reply fills the back of a scrap tournament handout. You fold it beside the door.",
        "delta": {
          "focus": 15,
          "insight": 2
        }
      },
      {
        "label": "Pin it beside your tournament calendar",
        "reply": "The postcard takes its place by the calendar, its bent corner catching the morning light.",
        "delta": {
          "focus": 25,
          "reputation": 1
        }
      }
    ]
  },
  {
    "id": "home_reflection",
    "place": "home",
    "npc": null,
    "start": 60,
    "end": 83,
    "slots": [
      0,
      2
    ],
    "minBond": 0,
    "title": "The Unmarked Date",
    "intro": "Your duel journal is open at its last empty page. There's a tea ring on the cover and a longer list of names than when you arrived.",
    "choices": [
      {
        "label": "List what has changed",
        "reply": "You jot down three matches worth keeping, including one you lost. The page isn't blank anymore.",
        "delta": {
          "insight": 3,
          "focus": 10
        }
      },
      {
        "label": "Make time for the people who matter",
        "reply": "Two names go into the margin. You leave enough room to add more.",
        "delta": {
          "focus": 20,
          "reputation": 1
        }
      }
    ]
  },
  {
    "id": "cup_neighborhood_rival",
    "place": "center",
    "npc": "reina",
    "start": 31,
    "end": 49,
    "slots": [
      1,
      2
    ],
    "minBond": 0,
    "requiresCup": {
      "id": "neighborhood",
      "states": [
        "champion",
        "eliminated"
      ]
    },
    "title": "A Match Worth Remembering",
    "intro": "Reina is stacking chairs after the Neighborhood Cup. She slides the old score sheet across the table without looking up.",
    "choices": [
      {
        "label": "Ask her to analyze the toughest turn",
        "reply": "Here. That's the turn I wanted to ask about. What would you change?",
        "delta": {
          "insight": 2,
          "preparation": 1,
          "respect": 2
        }
      },
      {
        "label": "Admit what the cup meant to you",
        "reply": "For what it's worth, you showed up. That's more than half the predictions managed.",
        "delta": {
          "trust": 2,
          "affection": 1,
          "reputation": 1
        }
      }
    ]
  },
  {
    "id": "cup_neighborhood_return",
    "place": "shop",
    "npc": "hana",
    "start": 36,
    "end": 54,
    "slots": [
      0,
      1
    ],
    "minBond": 0,
    "requiresCup": {
      "id": "neighborhood",
      "states": [
        "missed",
        "expired"
      ]
    },
    "title": "A Seat at the Next Table",
    "intro": "Hana packs away the Neighborhood Cup sign-up sheets. An unopened pack of sleeves is balanced on the register.",
    "choices": [
      {
        "label": "Ask for help preparing for the next chance",
        "reply": "I'll save a table for practice next week. Bring the deck you're actually playing.",
        "delta": {
          "trust": 2,
          "affection": 1,
          "preparation": 1
        }
      },
      {
        "label": "Volunteer to help the next event run smoothly",
        "reply": "Great. Volunteers meet before opening. Remind me to bring enough pens.",
        "delta": {
          "reputation": 3,
          "affection": 1,
          "credits": 6
        }
      }
    ]
  },
  {
    "id": "cup_regional_numbers",
    "place": "library",
    "npc": "akari",
    "start": 61,
    "end": 80,
    "slots": [
      0,
      1
    ],
    "minBond": 0,
    "requiresCup": {
      "id": "regional",
      "states": [
        "champion",
        "eliminated"
      ]
    },
    "title": "What the Numbers Leave Out",
    "intro": "At the library, Akari has sorted Regional Qualifier notes into neat piles. One sheet bears your name in red pencil.",
    "choices": [
      {
        "label": "Study your strongest decision together",
        "reply": "Tell me why you held that card. I'm trying not to guess before you answer.",
        "delta": {
          "insight": 3,
          "respect": 2
        }
      },
      {
        "label": "Ask about the things statistics cannot measure",
        "reply": "Numbers won't tell me who stayed to cheer in the last round. Maybe we should ask.",
        "delta": {
          "affection": 2,
          "trust": 1,
          "focus": 8
        }
      }
    ]
  },
  {
    "id": "cup_regional_new_tide",
    "place": "park",
    "npc": "marina",
    "start": 68,
    "end": 87,
    "slots": [
      0,
      2
    ],
    "minBond": 0,
    "requiresCup": {
      "id": "regional",
      "states": [
        "missed",
        "expired"
      ]
    },
    "title": "Another Way Forward",
    "intro": "Marina sits near the ferry landing with a folded Regional Qualifier schedule. She pats the bench beside her.",
    "choices": [
      {
        "label": "Plan your own challenge away from the circuit",
        "reply": "There's a little event outside town next month. I could show you the flyer.",
        "delta": {
          "affection": 2,
          "trust": 1,
          "focus": 15
        }
      },
      {
        "label": "Talk about returning to competition on your terms",
        "reply": "If you want another qualifier, we can practice first. The river can wait.",
        "delta": {
          "insight": 2,
          "preparation": 1,
          "respect": 1
        }
      }
    ]
  },
  {
    "id": "cup_final_between_rounds",
    "place": "arcade",
    "npc": "kaede",
    "start": 88,
    "end": 90,
    "slots": [
      1,
      2
    ],
    "minBond": 0,
    "requiresCup": {
      "id": "championship",
      "states": [
        "open"
      ],
      "minRound": 1
    },
    "title": "Between the Rounds",
    "intro": "Kaede spots the championship bracket tucked into your deck box at the arcade. She taps an empty result square.",
    "choices": [
      {
        "label": "Share the opening you are still working on",
        "reply": "You can do better than that opening. Come on, deal it again.",
        "delta": {
          "preparation": 1,
          "insight": 2,
          "respect": 1
        }
      },
      {
        "label": "Take one evening away from the pressure",
        "reply": "One evening off? Then I'm picking the arcade machine. Beat my high score.",
        "delta": {
          "focus": 20,
          "trust": 1,
          "affection": 1
        }
      }
    ]
  },
  {
    "id": "cup_final_afterglow",
    "place": "center",
    "npc": "reina",
    "start": 88,
    "end": 90,
    "slots": [
      1,
      2
    ],
    "minBond": 0,
    "requiresCup": {
      "id": "championship",
      "states": [
        "champion",
        "eliminated"
      ]
    },
    "title": "When the Crowd Goes Home",
    "intro": "The final tournament table is empty except for two cups of water. Reina moves a chair out with her foot.",
    "choices": [
      {
        "label": "Thank her for pushing you all season",
        "reply": "Yeah, you pushed me too. Don't get sentimental or I'll ask for another game.",
        "delta": {
          "trust": 2,
          "affection": 1,
          "reputation": 2
        }
      },
      {
        "label": "Ask for one more friendly practice together",
        "reply": "I've got one more match in me. No crowd, no prizes. Cut my deck.",
        "delta": {
          "preparation": 1,
          "respect": 2,
          "focus": -5
        }
      }
    ]
  }
];
 const IDs=new Map(activities.map(a=>[a.id,a])),EVENTS=new Map(encounters.map(e=>[e.id,e]));
 const caps={focus:100,preparation:3,insight:99,reputation:100,credits:999999};
 function hydrate(state){
  if(!state||typeof state!=='object')throw Error('Invalid campaign state');
  for(const [k,initial] of Object.entries({focus:75,preparation:0,insight:0,reputation:0})){
   if(!Number.isFinite(state[k]))state[k]=initial;
   state[k]=Math.max(0,Math.min(caps[k],Math.floor(state[k])));
  }
  for(const key of ['activityDone','encountersDone'])if(!state[key]||typeof state[key]!=='object'||Array.isArray(state[key]))state[key]={};
  if(!state.activeEncounter||typeof state.activeEncounter!=='object'||!EVENTS.has(state.activeEncounter.id))state.activeEncounter=null;
  return state;
 }
 function modify(state,delta){
  for(const key of ['focus','preparation','insight','reputation','credits'])if(Number.isFinite(delta[key]))state[key]=Math.max(0,Math.min(caps[key],(state[key]||0)+delta[key]));
 }
 function improveBond(state,id,delta){
  if(!id||!delta)return;
  const changes={};
  for(const stat of ['affection','trust','respect','attraction'])if(Number.isFinite(delta[stat]))changes[stat]=delta[stat];
  REL.apply(state,id,changes);
 }
 function activityReason(state,entry){
  if(state.day>90)return 'The circuit season has ended';
  if(entry.place!==state.location||!entry.slots.includes(state.slot))return 'Not here at this time';
  if(state.activityDone[state.day+':'+entry.id])return 'Already completed today';
  if(entry.minInsight&&(state.insight||0)<entry.minInsight)return 'Requires '+entry.minInsight+' Insight';
  if(entry.minReputation&&(state.reputation||0)<entry.minReputation)return 'Requires '+entry.minReputation+' Reputation';
  if(entry.requiresStarter&&!state.deckJourney?.starter)return 'Choose a starter deck first';
  if(entry.cooldownDays&&Array.from({length:entry.cooldownDays-1},(_,i)=>state.day-i-1)
   .some(day=>day>0&&state.activityDone[day+':'+entry.id]))return 'Available once every '+entry.cooldownDays+' days';
  if(state.credits<entry.cost)return 'Not enough credits';
  if(state.focus<entry.focus)return 'Not enough focus — rest first';
  return null;
 }
 function activitiesAt(state){hydrate(state);return activities.filter(a=>a.place===state.location&&a.slots.includes(state.slot)).map(a=>({...a,disabledReason:activityReason(state,a)}));}
 function doActivity(state,id,people=[]){
  hydrate(state);const a=IDs.get(id);
  if(!a)throw Error('Unknown activity');
  const reason=activityReason(state,a);if(reason)throw Error(reason);
  state.activityDone[state.day+':'+id]=true;
  modify(state,{focus:-a.focus,credits:-a.cost});
  modify(state,a.change);
  const withNpc=a.npc&&people.includes(a.npc)?a.npc:null;
  if(withNpc)improveBond(state,withNpc,a.bond);
  return {id:a.id,person:withNpc,summary:a.text,spent:1,reward:a.change,voucherSet:a.voucherSet||null};
 }
 function availableEncounters(state,people=[]){
  hydrate(state);
  if(state.day>90)return [];
  return encounters.filter(e=>e.place===state.location&&e.start<=state.day&&state.day<=e.end&&e.slots.includes(state.slot)&&!state.encountersDone[e.id]&&(!e.npc||people.includes(e.npc))&&(!e.npc||(state.relationships?.[e.npc]?.affection||0)>=e.minBond)
   &&(!e.requiresCup||(
    e.requiresCup.states.includes(state.tournaments?.[e.requiresCup.id]?.state)
    &&(state.tournaments?.[e.requiresCup.id]?.round||0)>=(e.requiresCup.minRound||0)
   )));
 }
 function completeEncounter(state,id,index,people=[]){
  hydrate(state);const e=EVENTS.get(id);
  if(!e||state.encountersDone[id]||!availableEncounters(state,people).some(x=>x.id===id))throw Error('Encounter is no longer available');
  const selected=e.choices[index];if(!selected||!Number.isInteger(index))throw Error('Invalid encounter decision');
  const d=selected.delta;
  if(Number.isFinite(d.credits)&&state.credits+d.credits<0)throw Error('Not enough credits for this decision');
  modify(state,d);
  if(e.npc)improveBond(state,e.npc,d);
  state.encountersDone[id]={day:state.day,choice:index};
  return {id,person:e.npc,summary:selected.reply,spent:1,delta:d};
 }
 function newDay(state,days=1){hydrate(state);if(days>0)modify(state,{focus:Math.min(90,Math.floor(days)*22)});}
 function afterDuel(state,receipt){
  hydrate(state);
  if(!receipt||!['Victory','Defeat','Draw'].includes(receipt.outcome))return null;
  const spentPrep=state.preparation>0?1:0;if(spentPrep)state.preparation--;
  const earned=spentPrep?(receipt.outcome==='Victory'?14:8):0;
  const rep=receipt.outcome==='Victory'?2:receipt.outcome==='Draw'?1:0;
  modify(state,{credits:earned,reputation:rep,focus:-10});
  receipt.credits=(receipt.credits||0)+earned;receipt.trainingBonus=earned;
  return earned?'Your duel preparation earned '+earned+' bonus credits '+(receipt.outcome==='Victory'?'for the victory.':'even without a victory.'):(rep?'Your reputation grew after the duel.':'You learned from the duel, even without a victory.');
 }
 function validate(){
  const faults=[],seen=new Set();
  for(const a of activities){
   if(seen.has(a.id))faults.push('Duplicate activity '+a.id);seen.add(a.id);
   if(!a.slots.every(n=>Number.isInteger(n)&&n>=0&&n<=2)||a.cost<0||a.focus<0)faults.push('Bad activity '+a.id);
  }
  seen.clear();
  for(const e of encounters){
   if(seen.has(e.id))faults.push('Duplicate encounter '+e.id);seen.add(e.id);
   if(e.start<1||e.end>90||e.end<e.start||!e.choices.length||!e.choices.every(c=>c.label&&c.reply))faults.push('Bad encounter '+e.id);
   if(e.requiresCup&&(!['neighborhood','regional','championship'].includes(e.requiresCup.id)
    ||!Array.isArray(e.requiresCup.states)||!e.requiresCup.states.length
    ||e.requiresCup.states.some(status=>!['open','champion','eliminated','expired','missed'].includes(status))
    ||(e.requiresCup.minRound!==undefined&&(!Number.isInteger(e.requiresCup.minRound)||e.requiresCup.minRound<0||e.requiresCup.minRound>3))
   ))faults.push('Bad tournament prerequisite '+e.id);
  }
  return faults;
 }
 return Object.freeze({activities,encounters,byEncounter:id=>EVENTS.get(id),hydrate,activitiesAt,doActivity,availableEncounters,completeEncounter,newDay,afterDuel,validate});
});
