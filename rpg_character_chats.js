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
   "Someone pitched a tournament for players who've never won one.",
   "Are you considering it?",
   "Yes, but I don't want anybody to feel like they're being put in a special beginners' corner.",
   "What if they got to choose the name?",
   "That's better. If Yuna suggests 'Epic Loser Cup,' you're helping me veto it."
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
   "Really? While you were packing your cards?",
   "Yes. As if I was supposed to entertain him too.",
   "What did you say?",
   "Nothing. I gave him my best tournament stare. Very effective."
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
   "I almost missed the evening event because of a book.",
   "Must have been a good chapter.",
   "An excellent one. I had to stop just before the reveal.",
   "Was it worth putting down?",
   "Someone saved me a seat. We ended up talking the whole evening. Yes, I think it was."
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
   "Can I tell you something deeply unfair?",
   "Go ahead.",
   "When I make a stupid joke on purpose, everybody laughs. When I trip by accident, everybody also laughs.",
   "That's not exactly unfair.",
   "You're supposed to be on my side! Fine. It was a spectacular fall."
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
   "I found a strange note in my old match records.",
   "Strange for you?",
   "An entire page of calculations, followed by three words: 'That was fun.'",
   "Did you write that?",
   "I must have. I think I'd forgotten to record the most important part."
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
   "A kid tried selling me a rare card for a fraction of its value.",
   "Did you tell him?",
   "Of course. Turns out he was saving for his brother's birthday.",
   "So what happened?",
   "I found him another buyer who'd pay fairly. He came back later to show me the present."
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
   "Do you know anywhere with loud music and absolutely no view of the river?",
   "You? Trying to avoid the water?",
   "Just for one afternoon. I've been watching the tide since sunrise.",
   "There's a café near the arcade.",
   "Perfect. If anyone asks me about the weather, I'm pretending not to hear."
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
   "Three people have asked why I came to town.",
   "Have you told them?",
   "I said I got on a train. Apparently that wasn't enough of a backstory.",
   "Was there more to it?",
   "Sure. I was hungry when I got off, so I found a noodle shop. Want the sequel?"
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
   "A young player caught a ruling I'd gotten wrong at a local event.",
   "That sounds awkward.",
   "It was, for about five seconds. Then I corrected it.",
   "Did you thank her?",
   "Of course. I hope she considers judging someday. We could use another pair of sharp eyes."
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
   "I remember a final where the best moment happened after the match.",
   "A huge upset?",
   "No. Someone dropped their deck, and their opponent crouched down to help pick it up.",
   "Did you mention it on air?",
   "Of course. It was the only replay worth giving a second look."
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
   "A visitor thanked me for an event that took twelve people to set up.",
   "Did you tell them?",
   "I started listing everyone's names. They looked a little surprised.",
   "Maybe they just meant it was nice.",
   "I know. Next time I'll just say thanks, then make sure the team hears it too."
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
   "I took my cousin's name off my deck box today.",
   "Why was it there?",
   "It used to be hers. She gave it to me when I was learning.",
   "Does it feel different now?",
   "A little. I called her to tell her. She said I should have done it ages ago."
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
   "I was about to make myself some tea, then remembered I haven't sat down all day.",
   "Want some company?",
   "Are you offering to sit through the slowest cup of tea in town?",
   "Sounds perfect.",
   "Good. Just let me put this tray down before I change my mind."
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
   "The council wants to replace the old railing at the dock.",
   "Isn't it falling apart?",
   "Not yet. It needs two bolts and somebody with patience.",
   "So why keep it?",
   "That rail has survived more storms than I have. Give it one more season."
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
   "My train was delayed yesterday. I had an entire evening planned.",
   "That sounds frustrating.",
   "At first. Then I found a quiet bookshop by the station.",
   "Did you make it home late?",
   "Very. And I'm not going to pretend I disliked the detour."
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
   "A kid thanked me today for staying after their first match.",
   "That seems nice.",
   "Yeah. I thought they'd remember the joke I made about their deck.",
   "What did they remember?",
   "That I sat down and played another game. Kinda made my day."
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
   "I finally cleared the rhythm-game song that kept beating me.",
   "That's great. Did you tell anyone?",
   "Not yet. I wanted to enjoy it on my own first.",
   "So why tell me now?",
   "I don't know. You asked how my day was going, and that was the best part."
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
   "I caught myself practicing a smile in the mirror again.",
   "For the stage?",
   "No, for a coffee with somebody I hadn't seen in ages.",
   "Did you end up doing the rehearsed smile?",
   "No! I knocked over the sugar and laughed instead. Much easier."
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
   "Someone told me my last match looked easy.",
   "Was that good to hear?",
   "Sort of. I spent the week before it getting the opening wrong.",
   "You could tell them.",
   "I think I just needed to tell somebody. Thanks for listening."
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
   "I planned three activities for today. Again.",
   "Do you need to do all three?",
   "Probably not. I just hate the awkward moment when the conversation runs out.",
   "Maybe it wouldn't be awkward.",
   "You're suggesting we just sit and talk? Bold. I might actually try that."
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
   "I had a whole speech ready for when you came back.",
   "Seriously?",
   "Yeah. Very casual, very cool, definitely no awkward pauses.",
   "What happened to it?",
   "You walked in and I forgot half the words. Then we started arguing like old times."
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
   "I've been drawing the same jacket all afternoon.",
   "What's wrong with it?",
   "Nothing. I just can't decide whether it should be fierce or cozy.",
   "Why not both?",
   "That's the problem. You make it sound easy, and now I want to try it."
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
