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
 ],
 "elio": [
  [
   "I finally asked someone not to touch my deck without permission.",
   "How'd they take it?",
   "They apologized. I almost apologized back.",
   "You were right to speak up.",
   "I'm practicing believing that."
  ],
  [
   "The others say I play too cautiously.",
   "What do you think?",
   "Sometimes they're right. But when I take a chance, I want it to be my choice.",
   "So what's next?",
   "One brave move per match. I wrote it on a sticky note."
  ],
  [
   "Someone invited me to teach a new player.",
   "You said yes?",
   "I told them everything I wished I'd known.",
   "Were they overwhelmed?",
   "A little. Then they beat me. Maybe I taught too well."
  ],
  [
   "I changed the name on my old deck box.",
   "Was that hard?",
   "It had my cousin's name on it for years.",
   "How does the new name feel?",
   "Like something I've finally earned."
  ]
 ],
 "alma": [
  [
   "The café is full of people arguing about who won.",
   "Does that bother you?",
   "No. I wish someone remembered who cleaned up.",
   "You could tell them.",
   "I do, with a mop in plain view by the door."
  ],
  [
   "A customer apologized for coming in without buying anything.",
   "What did you say?",
   "That sitting quietly is allowed here.",
   "Even if they only order water?",
   "Even then. Hospitality doesn't have a minimum purchase."
  ],
  [
   "Some days I feel like the town's listener, not a café owner.",
   "That sounds tiring.",
   "It can be. But today someone asked about my day first.",
   "And?",
   "It became a very good day."
  ],
  [
   "Everyone loves the crooked table by the window.",
   "Why not repair it?",
   "The light is good there, and nobody rushes.",
   "But the table wobbles.",
   "Then I'll fix the leg, not the feeling."
  ]
 ],
 "nereo": [
  [
   "The ferry was delayed and everybody wanted an answer.",
   "Did you have one?",
   "A timetable and a shrug. The river won.",
   "Were people upset?",
   "Yes. So I found the older passengers a place to sit."
  ],
  [
   "Marina says I pretend to be grumpier than I am.",
   "Is she right?",
   "Ask the dock cats. They know I'm a pushover.",
   "You feed them?",
   "Don't spread rumors. They know where I keep biscuits."
  ],
  [
   "Someone asked why I keep repairing that old railing.",
   "Why not replace it?",
   "It's sturdy, familiar, and marked by every flood.",
   "Sentimental?",
   "I said sturdy. Don't make this sentimental."
  ],
  [
   "A kid watched me fix a ferry sign yesterday.",
   "Did they ask questions?",
   "Twenty. Then they held my tools.",
   "Did you mind?",
   "Best apprentice I've had all month."
  ]
 ],
 "elena": [
  [
   "I made room for an evening with no appointments.",
   "Sounds relaxing.",
   "I spent the first hour wondering what I'd forgotten.",
   "And then?",
   "Watched a terrible comedy and laughed louder than expected."
  ],
  [
   "A junior colleague admitted she'd made a mistake.",
   "How did you respond?",
   "I thanked her for telling me before it grew.",
   "Were you always so understanding?",
   "No. Someone once showed me that kindness. I remember it."
  ],
  [
   "I once thought a perfect plan meant no surprises.",
   "What changed?",
   "Some of my favorite memories weren't planned.",
   "Any examples?",
   "A rainy walk. A missed train. This conversation."
  ],
  [
   "I keep buying gifts and waiting for the right moment.",
   "Why wait?",
   "I don't know. Yesterday I gave my friend a silly keychain.",
   "Did she like it?",
   "She loved it. Apparently today was the right moment."
  ]
 ],
 "jinx": [
  [
   "Somebody called me fearless after a match.",
   "Are you?",
   "Not remotely. I hate letting fear have the last word.",
   "What scares you?",
   "Being wrong in front of someone I care about."
  ],
  [
   "I repaired a stranger's torn backpack.",
   "You carry sewing supplies?",
   "A needle and black thread. Learned the hard way.",
   "Did they thank you?",
   "They looked shocked. Apparently I don't look like a repair person."
  ],
  [
   "I want people to remember more than the loud things I say.",
   "Like what?",
   "That I showed up. I listened. I meant it.",
   "I think they do.",
   "Maybe. Thanks for not making that a joke."
  ],
  [
   "I found an old sketch I made before coming here.",
   "What was it?",
   "A city full of neon signs and impossible rooftops.",
   "Did you find that place?",
   "Not exactly. Found some people worth staying for."
  ]
 ],
 "luna": [
  [
   "Someone offered to carry everything for me again.",
   "Was that a problem?",
   "They meant well, but I hadn't asked.",
   "Did you tell them?",
   "Yes. I could handle the little box, but wanted help with the big one."
  ],
  [
   "I finally won a difficult rhythm-game level.",
   "Did you tell anyone?",
   "No. Sometimes I like having something that's just mine.",
   "But you're telling me.",
   "I know. I think that means something."
  ],
  [
   "When I make a mistake, I apologize before anyone notices.",
   "Can you stop?",
   "Today I dropped a sleeve and said 'oops' instead.",
   "Progress!",
   "Please don't make a ceremony of it. I might drop another."
  ],
  [
   "I want to try something that scares me a little.",
   "Like a tournament?",
   "Maybe. Or ordering food without rehearsing first.",
   "Want company?",
   "Yes, but don't order for me. I want to do it."
  ]
 ],
 "rina": [
  [
   "Sometimes people recognize my face but not my name.",
   "Does that upset you?",
   "Only when they decide who I am before I speak.",
   "What would you tell them?",
   "I sing badly while cooking and take card games seriously."
  ],
  [
   "I caught myself practicing a smile in the mirror.",
   "For a performance?",
   "No. For meeting someone I wanted to see.",
   "Did you really need practice?",
   "No. That's what made me laugh."
  ],
  [
   "A fan asked which card matters most to me.",
   "The rarest?",
   "The bent card I traded for as a child.",
   "Did you explain?",
   "Yes. We talked about the people who taught us."
  ],
  [
   "I finally have one free evening.",
   "Any plans?",
   "I wanted to do absolutely nothing, then felt guilty.",
   "You don't need an excuse to rest.",
   "I'm trying to believe that."
  ]
 ],
 "sierra": [
  [
   "Someone called my last win effortless.",
   "Isn't that a compliment?",
   "Maybe. It ignores years of quiet practice.",
   "Would you explain?",
   "Not to them. But I wanted you to know."
  ],
  [
   "I'm learning to turn down jobs that take every weekend.",
   "Isn't that hard?",
   "Yes. Everyone calls them opportunities.",
   "And what do you call them?",
   "Sometimes a missed birthday or a day I wanted to keep."
  ],
  [
   "A girl told me she started playing after seeing my match.",
   "How did that feel?",
   "More important than any photo this year.",
   "Did you give her advice?",
   "I asked about her favorite card. She talked for twenty minutes."
  ],
  [
   "I used to photograph every good moment.",
   "And now?",
   "Sometimes I leave my camera in my bag.",
   "Does that feel strange?",
   "A little. But I remember the laughter better."
  ]
 ],
 "sol": [
  [
   "I invited three people to an outing and two said no.",
   "Were you disappointed?",
   "For a moment. Then I realized one person still wanted to go.",
   "Adventure for two, then.",
   "Exactly. Smaller doesn't mean worse."
  ],
  [
   "Jun says I make everything an event.",
   "Does he have a point?",
   "I declared tea an official sunset ceremony.",
   "Did he join?",
   "He even stayed until his cup was empty."
  ],
  [
   "Sometimes I talk so much because I don't know if people want me around.",
   "You could ask.",
   "I know. But asking is scarier than a bad joke.",
   "I want you here.",
   "Oh. That's unfairly effective."
  ],
  [
   "I went on a walk without taking three detours.",
   "How was it?",
   "One beautiful cloud and home on time.",
   "Are you proud?",
   "Very. Next time I get exactly one detour."
  ]
 ],
 "laca": [
  [
   "Remember when every little race became a championship?",
   "You kept changing the rules.",
   "Because you kept winning!",
   "You admit it now?",
   "Only because I can finally laugh. Rematch someday?"
  ],
  [
   "I thought seeing you again might be awkward.",
   "Was it?",
   "For ten seconds. Then you made your old face.",
   "Which face?",
   "That one. When you're pretending not to laugh."
  ],
  [
   "People think I'm never afraid of the water.",
   "And you're not?",
   "Of course I am. You learn to respect it and trust yourself.",
   "Does that apply elsewhere?",
   "Maybe. Especially with people."
  ],
  [
   "I almost told you an embarrassing childhood memory.",
   "Why didn't you?",
   "I wasn't sure you remembered it the same way.",
   "Try me.",
   "Our blanket fort collapsing and us calling it a secret tunnel."
  ]
 ],
 "barb": [
  [
   "Somebody asked if I'd ever dress more conventionally.",
   "What did you say?",
   "That I might, if I feel like it.",
   "Were they offended?",
   "Maybe. My clothes are conversations I get to start."
  ],
  [
   "I made a jacket that looked great on the mannequin.",
   "And on you?",
   "It didn't feel like me.",
   "Did you alter it?",
   "Moved a seam and added a tiny detail inside. Now I love it."
  ],
  [
   "Sometimes I sketch an outfit when words fail me.",
   "Does it help?",
   "Anger becomes sharp lines; joy becomes movement.",
   "And today?",
   "Something soft with a bold surprise. Interpret that as you like."
  ],
  [
   "A friend told me she wished she had my confidence.",
   "What did you say?",
   "That I get scared too.",
   "Did it help?",
   "She showed me an outfit she was afraid to wear. We went out together."
  ]
 ]
};
 function hash(value){let h=2166136261;for(const ch of String(value))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h;}
 function select(state,npc){
  const rows=scenes[npc];if(!rows?.length)return null;
  const day=Number(state?.day)||1,slot=Number(state?.slot)||0;
  // The /5 offset is intentionally independent of both the 1-in-4
  // everyday gate and the /4 character-chat gate: all four scenes surface.
  const i=(day+Math.floor(day/5)+slot*5+hash(npc))%rows.length;
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
