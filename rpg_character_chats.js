'use strict';
// Authored in-character conversations. No stats, save edits, spoilers or events.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgCharacterChats=api;
})(typeof window!=='undefined'?window:null,function(){
 const scenes={
 "hana": [
  [
   "A beginner asked whether losing their first match means they're bad.",
   "What did you say?",
   "That their second match hasn't happened yet.",
   "That's very you.",
   "I almost told my entire embarrassing first-tournament story. The bell saved them."
  ],
  [
   "I had to turn down someone's request today.",
   "And what happened?",
   "They said 'no problem' and asked somebody else.",
   "You look relieved.",
   "I think I'm allowed to have limits. I just needed to hear it aloud."
  ],
  [
   "I found the poster for the shop's first ever event.",
   "How many people came?",
   "Six. We sat elbow-to-elbow around one table.",
   "Do you miss it?",
   "A little. I still remember every one of their names."
  ],
  [
   "I want to run a tournament for people who've never won.",
   "What would you call it?",
   "Anything other than 'the losers' cup.'",
   "First Steps?",
   "That's perfect. Now I want you on the poster committee."
  ]
 ],
 "reina": [
  [
   "A newcomer was afraid to ask me for deck advice.",
   "So did you help?",
   "I told her exactly what was wrong, then showed her a fix.",
   "Did she come back?",
   "Today. With a stronger deck and no fear of me. A dangerous development."
  ],
  [
   "My sister used to let me win board games.",
   "Did you know?",
   "Not until she told me years later. I was furious.",
   "Are you still?",
   "No. Now I let her choose the game, and we play properly."
  ],
  [
   "Yuna convinced me to try a silly arcade co-op game.",
   "Did you win?",
   "We lost in two minutes because nobody read the instructions.",
   "You sound happy.",
   "It was fun. Don't tell her or she'll arrange another one."
  ],
  [
   "Someone told me to smile more after a match.",
   "What did you say?",
   "That I was smiling internally at my last play.",
   "Did they believe you?",
   "Doesn't matter. I didn't owe them a performance."
  ]
 ],
 "shiori": [
  [
   "A friend asked for advice and I gave her five solutions.",
   "Did she want them?",
   "No. She wanted someone to listen.",
   "What did you do?",
   "Took her to tea and kept quiet. Surprisingly difficult, surprisingly helpful."
  ],
  [
   "Someone said I never get excited about anything.",
   "Were they wrong?",
   "I found a first edition I've wanted for years.",
   "And you celebrated?",
   "Loud enough for the librarian to turn around. A scandal."
  ],
  [
   "I love reading arguments in the margins of old books.",
   "About the stories?",
   "Often. People disagree with strangers separated by decades.",
   "Would you respond?",
   "I'd ask what changed their minds. That's the interesting part."
  ],
  [
   "I nearly skipped an evening event to finish a book.",
   "What made you go?",
   "I promised someone I'd be there.",
   "Worth it?",
   "Yes. The book waited. The conversation wouldn't have."
  ]
 ],
 "yuna": [
  [
   "My new deck has the worst possible name.",
   "Try me.",
   "Electric Marshmallow Disaster.",
   "That's incredible.",
   "It wins sometimes, which is making the problem much worse."
  ],
  [
   "I joke first so nobody gets the chance to laugh at me.",
   "I suspected that.",
   "Oh. Was I that obvious?",
   "Not always.",
   "Good. Sometimes I'm just genuinely hilarious."
  ],
  [
   "Reina challenged me to play without dramatic commentary.",
   "Did you manage?",
   "Three turns. Then Clefable did something impossible.",
   "And you yelled?",
   "At a volume legally classified as weather."
  ],
  [
   "I keep a sticker from every tournament.",
   "Even the ones you lose?",
   "Especially those. They make the best stories.",
   "That's thoughtful.",
   "I'm a complicated woman. Mostly loud, but complicated."
  ]
 ],
 "akari": [
  [
   "I reviewed our first match in my notes.",
   "Any interesting numbers?",
   "Several. Then I found a page that just says 'that was fun.'",
   "Is that yours?",
   "Apparently. It may be the most useful note I made."
  ],
  [
   "I predicted three outcomes and a fourth occurred.",
   "Does it bother you?",
   "Only until I remember surprises are how we improve a theory.",
   "So you liked it?",
   "Curiosity and happiness look very similar on me."
  ],
  [
   "I tried explaining a messy deck without using numbers.",
   "What did you say?",
   "It's a crowded bus and none of the passengers know their stop.",
   "Did that help?",
   "They changed six cards. Metaphors are frighteningly effective."
  ],
  [
   "Reina says I should trust my instinct more.",
   "Will you?",
   "Instinct is experience talking faster than explanation.",
   "And yours?",
   "Said to buy the last pastry before Yuna arrived. Excellent prediction."
  ]
 ],
 "camila": [
  [
   "Someone offered me a valuable card for almost nothing.",
   "Did you accept?",
   "I explained the price and let them decide again.",
   "That wasn't profitable.",
   "They came back to me afterward. Trust is a long game."
  ],
  [
   "People think I never give anything away.",
   "Do you?",
   "I offer unsolicited opinions for free every day.",
   "Anything kinder?",
   "Sometimes I slip a spare sleeve into a child's first deck. Keep that quiet."
  ],
  [
   "I missed an auction by refusing to bid one extra credit.",
   "Regrets?",
   "For three days. Then I found the same thing in a dusty shop.",
   "And?",
   "I laughed until the owner asked if I was all right."
  ],
  [
   "Alma says I negotiate even when talking to friends.",
   "She's right.",
   "I offered her dessert if she could prove it.",
   "You see the problem?",
   "Immediately. She ordered the most expensive cake."
  ]
 ],
 "marina": [
  [
   "People assume every free hour I have belongs to the river.",
   "Doesn't it?",
   "Some days I want a loud café with no view of the water.",
   "That surprises me.",
   "Good. I'm a person, not a postcard."
  ],
  [
   "I stayed with a beginner until they signed up for a tournament.",
   "Did you give advice?",
   "Not really. I just stayed beside them.",
   "That was enough?",
   "They said it was. Sometimes company is enough."
  ],
  [
   "I once missed a ferry because the sunset was beautiful.",
   "You? Missing a ferry?",
   "Even I forget a timetable when the sky looks like that.",
   "What did you do?",
   "Waited for the next one. It was a better crossing."
  ],
  [
   "Sometimes I say that water keeps moving when plans fail.",
   "That's poetic.",
   "It sounds better than admitting I'm improvising.",
   "Does it scare you?",
   "Less than it used to. Especially with good company."
  ]
 ],
 "kaede": [
  [
   "People keep asking why I arrived so late in the season.",
   "What do you say?",
   "That I took a wrong turn and found interesting people.",
   "Is that true?",
   "More true than any dramatic explanation."
  ],
  [
   "I hate being called mysterious.",
   "Really?",
   "Sometimes I'm late because I stopped for noodles.",
   "And today?",
   "Exactly. Mystery solved."
  ],
  [
   "I used to leave whenever a town got familiar.",
   "What about now?",
   "I know which bench stays warm at sunset.",
   "Is that a problem?",
   "I'm still deciding. I haven't bought a return ticket."
  ],
  [
   "I said something sharp to Elio yesterday.",
   "Did you apologize?",
   "Yes. He thanked me and offered a cookie.",
   "That sounds nice.",
   "It was much worse than an argument. I felt terrible."
  ]
 ],
 "jun": [
  [
   "A player asked for a ruling without reading the card.",
   "And you answered?",
   "The first judge lives in the bottom half of the card.",
   "Did it help?",
   "For five minutes. Then they came back anyway."
  ],
  [
   "A teen corrected a mistake I made while judging.",
   "How did you react?",
   "I corrected the call and thanked her.",
   "She must have been nervous.",
   "She might be an excellent judge someday. We need people like that."
  ],
  [
   "Sometimes I wonder whether anyone talks to me without a rules question.",
   "I do.",
   "Unless you're hiding a rules question.",
   "No question today.",
   "Excellent. I might actually enjoy this."
  ],
  [
   "Sol confiscated my clipboard so I'd take a break.",
   "Did you?",
   "She handed me ice cream. I asked for a receipt.",
   "Seriously?",
   "Out of habit. She'll never let me forget."
  ]
 ],
 "teo": [
  [
   "I gave a perfect tournament introduction to an empty room.",
   "How?",
   "The microphone was on, but the audience was outside.",
   "Nobody heard it?",
   "A cleaner applauded with her mop. My finest review."
  ],
  [
   "The best part of yesterday's final wasn't on camera.",
   "What happened?",
   "A player helped their opponent pick up a spilled deck.",
   "Did you mention it?",
   "Of course. That was the real highlight."
  ],
  [
   "I worry that people remember my voice, not what I say.",
   "Does that happen?",
   "Sometimes someone remembers a joke but forgets my name.",
   "Does it bother you?",
   "A little. I'm trying to make the words matter."
  ],
  [
   "Yuna says I can make a sandwich sound like a championship.",
   "Can you?",
   "The bread is ready! The cheese is down! A turning point!",
   "You're impossible.",
   "And hungry. The sandwich deserves the spotlight."
  ]
 ],
 "iris": [
  [
   "People see the tournament supplies arrive, not the inventory list.",
   "Want more credit?",
   "I mostly want people to stop using my clipboard as a coaster.",
   "Who did it?",
   "Teo. Again. Please tell him he owes me a new one."
  ],
  [
   "A volunteer asked why I care how chairs are stacked.",
   "What did you tell them?",
   "Somebody will carry them after the lights go out.",
   "And they understood?",
   "They stayed to help. That answered everything."
  ],
  [
   "I was late once and the entire opening schedule went sideways.",
   "Did it ruin the event?",
   "No. Everyone improvised and it went fine.",
   "You sound relieved.",
   "It was a good reminder the world doesn't rest on my shoulders."
  ],
  [
   "Someone thanked me for an event I didn't run alone.",
   "Did you tell them?",
   "I named everyone who carried a chair or made a sign.",
   "Why?",
   "Because people deserve to hear their names."
  ]
 ]
};
 function hash(value){let h=2166136261;for(const ch of String(value))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h;}
 function select(state,npc){
  const rows=scenes[npc];if(!rows?.length)return null;
  const day=Number(state?.day)||1,slot=Number(state?.slot)||0;
  const i=(day+Math.floor(day/4)+slot*5+hash(npc))%rows.length;
  return rows[i].map((text,i)=>({speaker:i%2?'Protagonist':npc,text}));
 }
 function shouldUse(state,npc){
  if(!scenes[npc])return false;
  const day=Number(state?.day)||1,slot=Number(state?.slot)||0;
  return (Math.floor(day/4)+slot+hash(npc))%4!==0;
 }
 function validate(){
  const faults=[];
  for(const [id,rows] of Object.entries(scenes)){
   if(rows.length<4)faults.push(id+' missing conversations');
   if(new Set(rows.map(row=>row[0])).size!==rows.length)faults.push(id+' duplicate topic');
   if(rows.some(row=>row.length!==5||row.some(line=>typeof line!=='string'||!line.trim())))faults.push(id+' invalid lines');
  }
  return faults;
 }
 return Object.freeze({scenes,select,shouldUse,validate});
});
