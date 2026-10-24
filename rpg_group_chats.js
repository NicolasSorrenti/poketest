'use strict';
// Optional multi-character Talk. Both NPCs must be present AND already met.
// The existing multi-speaker renderer displays every participant; no rewards/flags.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgGroupChats=api;
})(typeof window!=='undefined'?window:null,function(){
 const groups=[
 {
  "pair": [
   "hana",
   "camila"
  ],
  "scenes": [
   [
    [
     "hana",
     "Please tell Camila the suggestion box isn't a bidding system."
    ],
    [
     "camila",
     "I offered one credit for every useful suggestion. An incentive."
    ],
    [
     "Protagonist",
     "How many suggestions came in?"
    ],
    [
     "hana",
     "Forty-two. Thirty were from Camila."
    ],
    [
     "camila",
     "And the other twelve were about the suggestion box."
    ],
    [
     "Protagonist",
     "So is anyone getting paid?"
    ],
    [
     "hana",
     "I'm buying biscuits for everyone. Final offer."
    ]
   ],
   [
    [
     "camila",
     "Hana is giving away all the spare sleeves again."
    ],
    [
     "hana",
     "Only to people who need them."
    ],
    [
     "Protagonist",
     "What's the disagreement?"
    ],
    [
     "camila",
     "None. I'm matching her donation."
    ],
    [
     "hana",
     "You could have said that."
    ],
    [
     "camila",
     "And miss the chance to negotiate?"
    ],
    [
     "hana",
     "You're impossible. Thank you."
    ]
   ]
  ]
 },
 {
  "pair": [
   "reina",
   "yuna"
  ],
  "scenes": [
   [
    [
     "yuna",
     "Reina, tell them about our co-op victory."
    ],
    [
     "reina",
     "We lost."
    ],
    [
     "Protagonist",
     "That sounds more familiar."
    ],
    [
     "yuna",
     "We unlocked a bonus level first. A spiritual victory."
    ],
    [
     "reina",
     "You pressed pause instead of jumping."
    ],
    [
     "yuna",
     "I was making time for teamwork."
    ],
    [
     "reina",
     "Next time I get the jump button."
    ]
   ],
   [
    [
     "reina",
     "Yuna is announcing all her moves like stage tricks."
    ],
    [
     "yuna",
     "Because they ARE stage tricks. Surprise! A Trainer card!"
    ],
    [
     "Protagonist",
     "Doesn't announcing it ruin the surprise?"
    ],
    [
     "yuna",
     "No. Anticipation."
    ],
    [
     "reina",
     "It tells me exactly what's coming."
    ],
    [
     "yuna",
     "Then why did you fall for it yesterday?"
    ],
    [
     "reina",
     "I didn't. I wanted to see what you'd do."
    ]
   ]
  ]
 },
 {
  "pair": [
   "shiori",
   "akari"
  ],
  "scenes": [
   [
    [
     "shiori",
     "Akari has been trying to catalog my book notes."
    ],
    [
     "akari",
     "You have seven different symbols for 'important.'"
    ],
    [
     "Protagonist",
     "Why seven?"
    ],
    [
     "shiori",
     "Different kinds of important."
    ],
    [
     "akari",
     "Two are the same star with different points."
    ],
    [
     "shiori",
     "That distinction matters."
    ],
    [
     "Protagonist",
     "I think I've found your next collaborative project."
    ]
   ],
   [
    [
     "akari",
     "I calculated the odds of a particular opening hand."
    ],
    [
     "shiori",
     "I asked whether it was fun, not whether it was likely."
    ],
    [
     "Protagonist",
     "Can't both be true?"
    ],
    [
     "akari",
     "Yes. I've added 'enjoyment' to the margin."
    ],
    [
     "shiori",
     "And I tried reading the calculations."
    ],
    [
     "Protagonist",
     "Successful exchange?"
    ],
    [
     "shiori",
     "We both needed tea afterward, but yes."
    ]
   ]
  ]
 },
 {
  "pair": [
   "marina",
   "nereo"
  ],
  "scenes": [
   [
    [
     "nereo",
     "The dock sign's been repaired. Again."
    ],
    [
     "marina",
     "Because you refuse to replace it."
    ],
    [
     "Protagonist",
     "What's wrong with it?"
    ],
    [
     "nereo",
     "Nothing two bolts won't fix."
    ],
    [
     "marina",
     "And paint. And a legible arrow."
    ],
    [
     "nereo",
     "I said nothing serious."
    ],
    [
     "marina",
     "I'll bring the paint. You bring the bolts."
    ]
   ],
   [
    [
     "marina",
     "Nereo says he knows when the weather will turn."
    ],
    [
     "nereo",
     "I know when my knee complains. Different thing."
    ],
    [
     "Protagonist",
     "Does it work?"
    ],
    [
     "marina",
     "Sometimes. He warned me about rain last week."
    ],
    [
     "nereo",
     "I also warned you about a loose step."
    ],
    [
     "marina",
     "That was more useful."
    ],
    [
     "nereo",
     "Practical forecasts. That's my specialty."
    ]
   ]
  ]
 },
 {
  "pair": [
   "jun",
   "teo"
  ],
  "scenes": [
   [
    [
     "teo",
     "Jun banned 'historic upset' from my commentary."
    ],
    [
     "jun",
     "You used it for a coin flip."
    ],
    [
     "Protagonist",
     "Was it an important flip?"
    ],
    [
     "teo",
     "Every flip matters to someone."
    ],
    [
     "jun",
     "They were starting a practice match."
    ],
    [
     "teo",
     "A historic practice match."
    ],
    [
     "jun",
     "I'm adding that phrase to the list too."
    ]
   ],
   [
    [
     "jun",
     "Teo brought snacks to the judges' table."
    ],
    [
     "teo",
     "Biscuits shaped like trophies."
    ],
    [
     "Protagonist",
     "That sounds thoughtful."
    ],
    [
     "jun",
     "He made a speech for every biscuit."
    ],
    [
     "teo",
     "A short speech!"
    ],
    [
     "jun",
     "I missed a rules question during one."
    ],
    [
     "teo",
     "A moment of silence for the fallen biscuit."
    ]
   ]
  ]
 },
 {
  "pair": [
   "hana",
   "iris"
  ],
  "scenes": [
   [
    [
     "iris",
     "If someone moves those boxes again, I'm labeling the floor."
    ],
    [
     "hana",
     "I needed the table for a beginner match."
    ],
    [
     "Protagonist",
     "What's the problem?"
    ],
    [
     "iris",
     "Three boxes say 'miscellaneous.' No one knows what's inside."
    ],
    [
     "hana",
     "One has sleeves. One has signs."
    ],
    [
     "iris",
     "And the third?"
    ],
    [
     "hana",
     "...I was hoping you knew."
    ]
   ],
   [
    [
     "hana",
     "Iris caught me carrying the tables alone."
    ],
    [
     "iris",
     "She said it would be faster."
    ],
    [
     "Protagonist",
     "Was it?"
    ],
    [
     "hana",
     "Not when I got stuck in the doorway."
    ],
    [
     "iris",
     "The volunteers moved everything in five minutes."
    ],
    [
     "hana",
     "I promised to ask next time."
    ],
    [
     "iris",
     "I have it in writing."
    ]
   ]
  ]
 },
 {
  "pair": [
   "elio",
   "hana"
  ],
  "scenes": [
   [
    [
     "elio",
     "Someone left a deck here by mistake."
    ],
    [
     "hana",
     "It's a free practice deck. Green sticker."
    ],
    [
     "Protagonist",
     "People borrow them?"
    ],
    [
     "elio",
     "I did when I first came here."
    ],
    [
     "hana",
     "He returned it in perfect order."
    ],
    [
     "elio",
     "I thought that was the rule."
    ],
    [
     "hana",
     "It isn't, but I appreciated it."
    ]
   ],
   [
    [
     "hana",
     "Elio volunteered to teach someone to shuffle."
    ],
    [
     "elio",
     "Then my sleeves split down the middle."
    ],
    [
     "Protagonist",
     "What did the beginner say?"
    ],
    [
     "elio",
     "That she'd been afraid of doing that."
    ],
    [
     "hana",
     "We got them fresh sleeves and started over."
    ],
    [
     "elio",
     "Neither of us dropped anything the second time."
    ],
    [
     "hana",
     "That counts as a win."
    ]
   ]
  ]
 },
 {
  "pair": [
   "alma",
   "sol"
  ],
  "scenes": [
   [
    [
     "sol",
     "Alma won't let me call this tea an official festival."
    ],
    [
     "alma",
     "Because it's a pot of tea, Sol."
    ],
    [
     "Protagonist",
     "How many guests are coming?"
    ],
    [
     "sol",
     "Three, counting you."
    ],
    [
     "alma",
     "You haven't asked if they're staying."
    ],
    [
     "Protagonist",
     "I could stay for a cup."
    ],
    [
     "sol",
     "See? We're growing. Alma, bring the good cups!"
    ]
   ],
   [
    [
     "alma",
     "Sol helped me rearrange the chairs."
    ],
    [
     "sol",
     "I made a little stage in the corner."
    ],
    [
     "Protagonist",
     "For what?"
    ],
    [
     "sol",
     "No idea. It seemed promising."
    ],
    [
     "alma",
     "I needed that corner for delivery boxes."
    ],
    [
     "sol",
     "A stage for very important boxes."
    ],
    [
     "alma",
     "At least you'll help carry them."
    ]
   ]
  ]
 },
 {
  "pair": [
   "jinx",
   "luna"
  ],
  "scenes": [
   [
    [
     "jinx",
     "Luna, stop pretending you're bad at rhythm games."
    ],
    [
     "luna",
     "I said I got lucky."
    ],
    [
     "Protagonist",
     "How lucky?"
    ],
    [
     "jinx",
     "Forty thousand points above my score."
    ],
    [
     "luna",
     "I just knew the song."
    ],
    [
     "jinx",
     "Great. Teach me, then."
    ],
    [
     "luna",
     "Okay. But I choose the practice speed."
    ]
   ],
   [
    [
     "luna",
     "Jinx repaired the strap on my bag."
    ],
    [
     "jinx",
     "It was held together by one thread."
    ],
    [
     "Protagonist",
     "You sew?"
    ],
    [
     "jinx",
     "After ruining two jackets, yeah."
    ],
    [
     "luna",
     "She added a tiny star on the inside."
    ],
    [
     "jinx",
     "It's how I remember which side I stitched."
    ],
    [
     "luna",
     "I like it anyway."
    ]
   ]
  ]
 },
 {
  "pair": [
   "rina",
   "sierra"
  ],
  "scenes": [
   [
    [
     "rina",
     "Sierra says I should stop practicing my smile for photographs."
    ],
    [
     "sierra",
     "Look at the person holding the camera. That's all."
    ],
    [
     "Protagonist",
     "Does it help?"
    ],
    [
     "rina",
     "It makes me laugh when they're nervous."
    ],
    [
     "sierra",
     "And I usually get the picture I wanted."
    ],
    [
     "Protagonist",
     "So you're coaching each other?"
    ],
    [
     "rina",
     "Apparently. She's learning to shuffle cards next."
    ]
   ],
   [
    [
     "sierra",
     "Rina said I should sing on the train."
    ],
    [
     "rina",
     "Quietly! I said quietly."
    ],
    [
     "Protagonist",
     "Why on the train?"
    ],
    [
     "sierra",
     "She thinks it's relaxing before work."
    ],
    [
     "rina",
     "Humming is fine too."
    ],
    [
     "sierra",
     "I tried. Somebody recognized the song."
    ],
    [
     "rina",
     "You made their commute better."
    ]
   ]
  ]
 },
 {
  "pair": [
   "elena",
   "shiori"
  ],
  "scenes": [
   [
    [
     "elena",
     "Shiori wants me to borrow a novel without reading its reviews."
    ],
    [
     "shiori",
     "I said the first chapter was wonderful. Nothing more."
    ],
    [
     "Protagonist",
     "What's the risk?"
    ],
    [
     "elena",
     "I usually prefer to know what to expect."
    ],
    [
     "shiori",
     "Then this will be a small, safe surprise."
    ],
    [
     "Protagonist",
     "You'll have to report back."
    ],
    [
     "elena",
     "Privately. I'm not starting a book committee."
    ]
   ],
   [
    [
     "shiori",
     "Elena returned my book early."
    ],
    [
     "elena",
     "I couldn't put it down."
    ],
    [
     "Protagonist",
     "Did you like the ending?"
    ],
    [
     "elena",
     "It left three questions unanswered."
    ],
    [
     "shiori",
     "And?"
    ],
    [
     "elena",
     "...I enjoyed it."
    ],
    [
     "shiori",
     "I won't tell a soul."
    ]
   ]
  ]
 },
 {
  "pair": [
   "kaede",
   "yuna"
  ],
  "scenes": [
   [
    [
     "yuna",
     "Kaede has been watching my arcade technique."
    ],
    [
     "kaede",
     "You've been shouting at the machine."
    ],
    [
     "Protagonist",
     "Does that work?"
    ],
    [
     "yuna",
     "The machine respects confidence."
    ],
    [
     "kaede",
     "It doesn't respect physics, apparently."
    ],
    [
     "yuna",
     "Show me how you'd do it?"
    ],
    [
     "kaede",
     "Only if you stop shouting for thirty seconds."
    ]
   ],
   [
    [
     "kaede",
     "Yuna says the snack machine owes her money."
    ],
    [
     "yuna",
     "I paid for chips. Got two packs of mints."
    ],
    [
     "Protagonist",
     "Could be worse."
    ],
    [
     "kaede",
     "She spent ten minutes plotting revenge."
    ],
    [
     "yuna",
     "I spent ten minutes finding the refund button!"
    ],
    [
     "kaede",
     "Then I bought the mints off her."
    ],
    [
     "yuna",
     "At a substantial emotional loss."
    ]
   ]
  ]
 }
];
 const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
 function met(state,id){return state?.['met_'+id]===true||(id==='reina'&&state?.metReina===true);}
 function candidates(state,npc,present){
  if(!Array.isArray(present)||!present.includes(npc)||!met(state,npc))return [];
  const p=new Set(present);
  return groups.filter(g=>g.pair.includes(npc)&&g.pair.every(id=>p.has(id)&&met(state,id)));
 }
 function select(state,npc,present){
  const pool=candidates(state,npc,present);
  if(!pool.length)return null;
  const day=Number(state?.day)||1,slot=Number(state?.slot)||0;
  // Rare enough not to displace the independent everyday/social routines.
  if((day+slot+hash(npc))%3!==0)return null;
  const g=pool[hash(npc+':'+day+':'+slot)%pool.length];
  const variant=(Math.floor(day/4)+slot+hash(g.pair.join(':')))%g.scenes.length;
  return g.scenes[variant].map(([speaker,text])=>({speaker,text}));
 }
 function validate(){
  const faults=[],unique=new Set();
  for(const g of groups){
   const key=[...g.pair].sort().join(':');
   if(g.pair.length!==2||g.pair[0]===g.pair[1]||unique.has(key))faults.push('bad pair '+key);
   unique.add(key);
   if(g.scenes.length!==2)faults.push('missing variants '+key);
   for(const scene of g.scenes){
    const speakers=new Set(scene.map(row=>row[0]));
    if(scene.length!==7||!g.pair.every(id=>speakers.has(id))||!speakers.has('Protagonist')||
       scene.some(row=>row.length!==2||typeof row[1]!=='string'||!row[1].trim()))faults.push('invalid scene '+key);
   }
  }
  return faults;
 }
 return Object.freeze({groups,candidates,select,validate});
});
