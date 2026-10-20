'use strict';
// Context-sensitive dialogue, duel banter and one-time acknowledgements for Neo Harbor.
// No rewards, time advancement, combat mutations, or random rolls occur here.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgReactivity=api;
})(typeof window!=='undefined'?window:null,function(){
 const VOICE=Object.freeze({
  "hana": {
    "win": [
      "I really thought I could hold you off a little longer.",
      "Would you play that deck again? I want another look at it."
    ],
    "loss": [
      "That was close! I'm glad my list held together.",
      "Come by the shop if you want to compare decks."
    ],
    "draw": [
      "Neither of us wanted to leave that table, did we?",
      "I think the good part was that we kept finding another way to play."
    ],
    "local": [
      "I heard about your match at the local! The tables were buzzing.",
      "I love when everyone has a story from the same afternoon."
    ],
    "cup": [
      "The big bracket has everyone talking, but I wanted to ask how you felt about it.",
      "Winning or losing does not change who gets a place at our table."
    ],
    "missed": [
      "I left a chair out for you until closing.",
      "It's all right. Next time just give me a heads-up, okay?"
    ],
    "kept": [
      "I'm still laughing about the game after everyone went home.",
      "The shop was quieter with just two decks on the table. I liked it."
    ],
    "preWin": "You surprised me last time. I brought a new plan!",
    "preLoss": "A rematch? Great. I was hoping we would try again.",
    "postLocal": "We made a real match of that local. The others are going to talk about it."
  },
  "reina": {
    "win": [
      "You got me this time. I won't pretend otherwise.",
      "I'm already changing the list for the rematch."
    ],
    "loss": [
      "Good game. I found what I was looking for.",
      "Now I want to see what you change before next time."
    ],
    "draw": [
      "We both had a chance to finish that game.",
      "The next one is going to come down to who adapts first."
    ],
    "local": [
      "The local results are on the board. I checked.",
      "The interesting part is what you do when the next opponent knows your habits."
    ],
    "cup": [
      "I saw the bracket result. It is going to follow you around town.",
      "Make sure you remember the turns, not just what they printed next to your name."
    ],
    "missed": [
      "You weren't there. I played someone else.",
      "If you want another match, just say when."
    ],
    "kept": [
      "You actually turned up early. Good.",
      "Let's make that our regular table. The lighting's better."
    ],
    "preWin": "I studied the last loss. Try that again.",
    "preLoss": "You know how the last game ended. Change something.",
    "postLocal": "You survived a real local. The next one will not be easier."
  },
  "shiori": {
    "win": [
      "You made me reconsider what I thought I knew.",
      "There's a line I'd like to discuss, if you have time."
    ],
    "loss": [
      "I haven't played that carefully in ages.",
      "I'd be glad to go over the game with you."
    ],
    "draw": [
      "That game left us both with an unfinished question.",
      "Perhaps the next game will answer it. Perhaps it will ask a better one."
    ],
    "local": [
      "I heard the local drew a crowd.",
      "A small match can become somebody else’s reason to begin playing."
    ],
    "cup": [
      "The result is public now. How are you feeling about it?",
      "The most important decisions rarely fit on the scoreboard."
    ],
    "missed": [
      "I finished my book before you arrived.",
      "No apology needed. A short message would've been enough."
    ],
    "kept": [
      "The café was almost empty by the time we looked up.",
      "I'd like another afternoon like that, if you would."
    ],
    "preWin": "You saw an opening I missed. I remember it.",
    "preLoss": "We both learned something last time. Shall we test it?",
    "postLocal": "One more story at the card tables. I am glad you played."
  },
  "yuna": {
    "win": [
      "You beat my magnificent scheme. Rude.",
      "I've got an even worse one waiting in the wings."
    ],
    "loss": [
      "It worked! My very silly deck worked!",
      "Okay. Don't tell anyone how long I practiced."
    ],
    "draw": [
      "A DRAW? That is not an ending. That is a cliffhanger!",
      "We are absolutely doing a second season."
    ],
    "local": [
      "I heard the local had real drama. Without me directing it!",
      "Tell me the best turn. I need material for my imaginary commentary track."
    ],
    "cup": [
      "A big tournament result! I heard three different versions already.",
      "I want the one with the embarrassing bits left in."
    ],
    "missed": [
      "I saved the arcade's best chair for you.",
      "It wobbles. Honestly, maybe I did you a favor."
    ],
    "kept": [
      "We stayed until the machines turned themselves off.",
      "I can't believe you helped me test that deck twenty times."
    ],
    "preWin": "I have prepared an even bigger plot twist.",
    "preLoss": "Welcome to the sequel. I expect special effects!",
    "postLocal": "That local needed more cheering. I volunteer as commentator."
  },
  "akari": {
    "win": [
      "My estimate was wrong. Annoyingly wrong.",
      "Would you tell me what you were thinking before we shuffled?"
    ],
    "loss": [
      "That result favors my list, but it's only one game.",
      "Want to try the same matchup again?"
    ],
    "draw": [
      "Our last sample did not support either conclusion.",
      "A second match would provide more useful data."
    ],
    "local": [
      "The local results make an interesting data point.",
      "One result is not a trend. The next week will tell us more."
    ],
    "cup": [
      "I examined the published bracket.",
      "It tells me what happened, but not every decision you made."
    ],
    "missed": [
      "I had already ordered the tea.",
      "It was cold by the time I revised the schedule. Please message me next time."
    ],
    "kept": [
      "You were eleven minutes early. Again.",
      "I deliberately left the rest of the afternoon blank. It went surprisingly well."
    ],
    "preWin": "Your last result changed my estimates.",
    "preLoss": "I adjusted my list after our previous match.",
    "postLocal": "The bracket is over. Time to study the opening hands."
  },
  "camila": {
    "win": [
      "Well played, darling. I did not see that coming.",
      "I'll demand another round once I've renegotiated with my own deck."
    ],
    "loss": [
      "That was expensive, wasn't it?",
      "At least neither of us put any rare cards on the table."
    ],
    "draw": [
      "Neither of us could close the deal.",
      "Interesting. I wonder who will blink first next time."
    ],
    "local": [
      "The shop is still discussing the local results.",
      "A good reputation is easier to earn than to keep."
    ],
    "cup": [
      "Your name was on the tournament board.",
      "That kind of attention can become an opportunity. Or a liability."
    ],
    "missed": [
      "I ordered two coffees. I drank both.",
      "I can forgive a late arrival. Being stood up is harder to negotiate."
    ],
    "kept": [
      "That dinner ran longer than I expected.",
      "No, I wasn't watching the clock. Don't start."
    ],
    "preWin": "One bad trade is enough. I renegotiated my strategy.",
    "preLoss": "Shall we see whether fortune favors the prepared?",
    "postLocal": "The shop has noticed your performance. Make the most of it."
  },
  "marina": {
    "win": [
      "I thought I had more time. Apparently not.",
      "Would you mind another game when the café's quieter?"
    ],
    "loss": [
      "Oh. I actually pulled that off.",
      "I'm going to want a rematch before I forget how this felt."
    ],
    "draw": [
      "We never quite found the current that would carry us through.",
      "Maybe another day the water will be kinder."
    ],
    "local": [
      "I heard everyone stayed late after the local.",
      "It is nice to see the riverfront feel like a community."
    ],
    "cup": [
      "The tournament was a lot to take in.",
      "There is room to breathe, even after a very public result."
    ],
    "missed": [
      "I waited until the ferry left.",
      "Next time send me a note. I'd rather know you're all right."
    ],
    "kept": [
      "We took the long path by the water.",
      "There's another one on the other bank. Perhaps next time?"
    ],
    "preWin": "I remember how you found that opening.",
    "preLoss": "This time I want to try something different.",
    "postLocal": "After all those matches, a walk sounds pretty good."
  },
  "kaede": {
    "win": [
      "You got me. Clean as anything.",
      "I'll be back when I have a better answer."
    ],
    "loss": [
      "I knew you wouldn't make it easy.",
      "You looked ready for another game before we'd finished packing."
    ],
    "draw": [
      "We left unfinished business on the table.",
      "That is the best kind of excuse to play again."
    ],
    "local": [
      "I heard what happened at the local.",
      "The fun part is seeing whether you can repeat it under pressure."
    ],
    "cup": [
      "People here take those bracket results very seriously.",
      "I am more interested in whether you still play boldly afterward."
    ],
    "missed": [
      "I waited around longer than I meant to.",
      "Next time I won't. Unless you ask nicely."
    ],
    "kept": [
      "I nearly took the last train without saying goodbye.",
      "Next time I'll bring the spare deck. You can pick."
    ],
    "preWin": "Oh, I remember losing to you. Here is my answer.",
    "preLoss": "I hope you have something less predictable this time.",
    "postLocal": "Now that was a local worth remembering."
  },
  "elena": {
    "win": [
      "That was a sound finish. I misjudged the risk.",
      "I have a few adjustments to make before we play again."
    ],
    "loss": [
      "That was a useful test for my list.",
      "I'd prefer another game before drawing conclusions."
    ],
    "draw": [
      "Our match ended without resolution. I have kept my notes.",
      "I would welcome another attempt when our schedules align."
    ],
    "local": [
      "I saw the local standings. Interesting work.",
      "Remember that managing pressure is as important as managing cards."
    ],
    "cup": [
      "The bracket has been published.",
      "Do not let one public result define your private judgment."
    ],
    "missed": [
      "I reserved time for our appointment. You were not there.",
      "A brief notice would be appreciated next time."
    ],
    "kept": [
      "Thank you for respecting the time we agreed on.",
      "I found myself enjoying our conversation long after it ended."
    ],
    "preWin": "I have recalculated after our previous result.",
    "preLoss": "The last game provided useful information.",
    "postLocal": "An instructive local. I hope you kept notes."
  },
  "jinx": {
    "win": [
      "Okay, you got me. Don't get comfortable.",
      "I'm coming back with something nastier next time."
    ],
    "loss": [
      "Ha! That went better than I planned.",
      "What, you didn't think I could keep a straight face?"
    ],
    "draw": [
      "A tie? Boring. Actually, no. That was kind of perfect.",
      "We are finishing this argument over a deck table."
    ],
    "local": [
      "I heard the local got messy. Sounds fun.",
      "Were you playing to win, or to make somebody remember your name?"
    ],
    "cup": [
      "A tournament result does not tell the whole story.",
      "Come on, tell me about the move that made everyone gasp."
    ],
    "missed": [
      "You stood me up! I made three terrible backup plans.",
      "Next time just tell me. I can handle a no."
    ],
    "kept": [
      "Okay, that was more fun than I was prepared to admit.",
      "You are a bad influence. Keep it up."
    ],
    "preWin": "You got lucky last time. Do it again.",
    "preLoss": "I have a new surprise. You are going to love it.",
    "postLocal": "Not bad. The crowd could use a little more chaos."
  },
  "luna": {
    "win": [
      "You won! I had a plan for once, too.",
      "Could we try the matchup again? I think I'm getting the hang of it."
    ],
    "loss": [
      "I won? Oh, wow.",
      "I was so sure I'd get the turns mixed up. One more game?"
    ],
    "draw": [
      "Nobody could finish that game.",
      "I want to figure out why on my own before our next match."
    ],
    "local": [
      "I followed the local results.",
      "I have been practicing so I can earn a place in that crowd myself."
    ],
    "cup": [
      "I heard how the bracket ended.",
      "I hope you will keep playing, whatever the result means to everyone else."
    ],
    "missed": [
      "I waited for a bit, then went back to practicing.",
      "I would still like to spend time together another day."
    ],
    "kept": [
      "I liked having space to figure things out myself.",
      "And I liked that you stayed anyway."
    ],
    "preWin": "I learned from that loss. Let me show you.",
    "preLoss": "This time I want to trust my own plan.",
    "postLocal": "I want to try a local like that, too."
  },
  "rina": {
    "win": [
      "Okay, that was good. I'm impressed.",
      "Can we go through it after rehearsal? I want another try."
    ],
    "loss": [
      "Yes! I've been practicing for this.",
      "My bandmates are never going to hear the end of it."
    ],
    "draw": [
      "We ran out of answers before we ran out of energy.",
      "I really want to finish that game another time."
    ],
    "local": [
      "I heard how the local went.",
      "I wished I could have been there for the noise and the excitement."
    ],
    "cup": [
      "The tournament results reached me between rehearsals.",
      "I wanted to hear how it felt from you, not from a noticeboard."
    ],
    "missed": [
      "I shifted my schedule to make that meeting.",
      "Please tell me early if you cannot come. I can still plan around it."
    ],
    "kept": [
      "I was glad we made time that belonged just to us.",
      "Even a short break can feel like a whole afternoon."
    ],
    "preWin": "I made time to practice after you won.",
    "preLoss": "I have a new opening. Want to see?",
    "postLocal": "The next local is going straight into my calendar."
  },
  "sierra": {
    "win": [
      "Well played. I'd have liked a different result.",
      "I can make time for a rematch after the next shoot."
    ],
    "loss": [
      "That went my way. Good game.",
      "You want to see the deck list before the next one?"
    ],
    "draw": [
      "We both held our ground right to the end.",
      "I like that more than pretending the decision was easy."
    ],
    "local": [
      "The local is all over the town’s conversations.",
      "It is strange how quickly people decide what one result says about you."
    ],
    "cup": [
      "I saw the tournament bracket.",
      "Try not to let people turn one afternoon into your whole identity."
    ],
    "missed": [
      "I cleared that time from a very full schedule.",
      "Next time please let me know before I get there."
    ],
    "kept": [
      "I enjoyed having a plan that did not belong to somebody else.",
      "Thank you for treating my time like it matters."
    ],
    "preWin": "You made me rethink that last match.",
    "preLoss": "Let us see what happens without an audience.",
    "postLocal": "A local can be more demanding than any stage."
  },
  "sol": {
    "win": [
      "No! You stole my grand finale.",
      "Fine. I'll prepare a much more dramatic rematch."
    ],
    "loss": [
      "I won! Quick, somebody get the confetti.",
      "Relax. The confetti is metaphorical. Mostly."
    ],
    "draw": [
      "Neither of us got to call that one.",
      "I kind of like having a reason to meet again."
    ],
    "local": [
      "The local sounded lively.",
      "Some days it is enough just to be part of the room."
    ],
    "cup": [
      "Everyone seems to have an opinion about the tournament.",
      "I care more about what you want to do tomorrow."
    ],
    "missed": [
      "I waited, then decided to make a quiet evening of it.",
      "Let me know next time. No dramatic excuses needed."
    ],
    "kept": [
      "It was nice not to have an entire event organized around us.",
      "Just being there was enough for me."
    ],
    "preWin": "I remember our last match. I will try a different angle.",
    "preLoss": "No agenda today. Except winning, maybe.",
    "postLocal": "Good game. Want to just hang out afterward?"
  },
  "jun": {
    "win": [
      "Good game. You found a way through my setup.",
      "I put the score sheet aside, if you'd like to review it."
    ],
    "loss": [
      "That went my way. Good game.",
      "I've got time for a second round if you do."
    ],
    "draw": [
      "We ran out of time, not ideas.",
      "I've left the deck set aside in case you want another go."
    ],
    "local": [
      "I checked the local results twice. They match.",
      "The interesting part is how the new players handled round two."
    ],
    "cup": [
      "The official bracket has been filed.",
      "I've kept the match slips in case anyone wants a review."
    ],
    "missed": [
      "I held the table for twenty minutes.",
      "Next time, a short message will do."
    ],
    "kept": [
      "You made it exactly on time.",
      "I had another match lined up, but I'm glad we played this one."
    ],
    "preWin": "You found a gap I missed last time. I checked the ruling twice.",
    "preLoss": "I still have the notes from our last match. Want a rematch?",
    "postLocal": "That's one for the club books. I'll file the result before I forget."
  },
  "teo": {
    "win": [
      "You won! I'd better revise my closing speech.",
      "Want a rematch? I can improvise the ending."
    ],
    "loss": [
      "And that's a win! Sorry, I do that automatically.",
      "I promise to commentate the next one at a reasonable volume."
    ],
    "draw": [
      "And that's a cliffhanger, folks.",
      "Sorry. Habit. Same time next week?"
    ],
    "local": [
      "Everyone was talking over each other after the local.",
      "I recorded the last round. The audio is a disaster."
    ],
    "cup": [
      "I announced the winners. Nobody could hear me over the cheering.",
      "Want the recording? I cut the part where I lost my place."
    ],
    "missed": [
      "I saved the good seat for you.",
      "It's fine. Just warn me next time so I don't give a speech to a chair."
    ],
    "kept": [
      "You actually came to my commentary workshop!",
      "I'll edit out the part where I called Energy a Pokémon. Maybe."
    ],
    "preWin": "I've prepared an apology to my audience for losing that last one.",
    "preLoss": "Last time was a hit. I'm hoping for a sequel.",
    "postLocal": "I have the local recap ready. You are in the good part."
  },
  "iris": {
    "win": [
      "You beat me to it. Fair enough.",
      "I have another delivery after this, but I'll find time for a rematch."
    ],
    "loss": [
      "That was tighter than I expected.",
      "I've got a few more minutes before I have to go."
    ],
    "draw": [
      "Neither of us could close it out.",
      "I've got a delivery after this, but I'll find time for a rematch."
    ],
    "local": [
      "Heard you played at the local.",
      "The kids at the dock already know your result."
    ],
    "cup": [
      "The tournament schedule went up this morning.",
      "Somebody wrote the scores on the delivery sheet by mistake."
    ],
    "missed": [
      "We waited until the ferry left.",
      "Tell me earlier next time. I can rearrange the pickup."
    ],
    "kept": [
      "Thanks for making it down to the dock.",
      "The boxes went faster with two people carrying them."
    ],
    "preWin": "That was a clever switch last time. I packed an answer.",
    "preLoss": "The ferry can wait ten more minutes. Ready to try again?",
    "postLocal": "A good local. I'm taking the last crate home before it rains."
  },
  "elio": {
    "win": [
      "You got me. I was really trying, too.",
      "Would you show me what you'd change in my deck?"
    ],
    "loss": [
      "I won? ...Sorry. Good game.",
      "Can we do another once I stop shaking?"
    ],
    "draw": [
      "We both had the answer, just not the cards.",
      "Can we play again once I sort the sleeves?"
    ],
    "local": [
      "They put your name up on the board!",
      "I stood there pretending I wasn't trying to memorize the list."
    ],
    "cup": [
      "I couldn't get near the bracket for the crowd.",
      "Hana let me peek at the copy behind the counter."
    ],
    "missed": [
      "I waited with the deck set up. Sorry, that sounds awful.",
      "I should've sent a message too. Next time?"
    ],
    "kept": [
      "You really showed up to help with my deck.",
      "I saved the sleeves you recommended. Want to see?"
    ],
    "preWin": "I fixed the Basic count after you beat me. I think.",
    "preLoss": "I shuffled twenty times for this rematch. Maybe that's too many.",
    "postLocal": "My cousin saw the local results. She asked me to teach her the new list."
  },
  "alma": {
    "win": [
      "You got me there. Nicely done.",
      "Want something to drink before the next game?"
    ],
    "loss": [
      "Good game. I had to work for that.",
      "Give me a minute to get the kettle before round two."
    ],
    "draw": [
      "Neither of us made it across the finish line.",
      "The café's closing soon, but I have an hour tomorrow."
    ],
    "local": [
      "The Saturday players stayed late for once.",
      "Half of them helped move the tables back. Miracles happen."
    ],
    "cup": [
      "I heard the cup finished without any arguments.",
      "Jun says that's a miracle. I think it's because everyone ate."
    ],
    "missed": [
      "Your tea went cold. I drank it.",
      "Next time, just leave me a message. I'll make another pot."
    ],
    "kept": [
      "Thanks for showing up. I had the back table ready.",
      "I don't often get to sit down when I close the shop."
    ],
    "preWin": "I've changed two cards since we last played. Nothing dramatic.",
    "preLoss": "I found an hour between shifts. How about that rematch?",
    "postLocal": "That's the local done. Whoever's still here helps stack chairs."
  },
  "nereo": {
    "win": [
      "You beat me. Nothing wrong with admitting it.",
      "I'll tinker with the list after the ferry run."
    ],
    "loss": [
      "Well, that one made it across the river.",
      "I've got an hour before the next crossing if you want another."
    ],
    "draw": [
      "Stuck at the landing, both of us.",
      "We can find another tide. I've got some cards to change first."
    ],
    "local": [
      "The local ended on time. I nearly fainted.",
      "They'll start expecting that every weekend."
    ],
    "cup": [
      "I heard the result over the ferry radio.",
      "Half the crew had a favorite. Nobody agreed on the rules."
    ],
    "missed": [
      "Kept the ferry ticket for you. It's expired now.",
      "Message me next time; I can leave it at the office."
    ],
    "kept": [
      "You turned up early. I nearly didn't recognize the situation.",
      "Here, grab the smaller crate before we head out."
    ],
    "preWin": "You put a hole in the hull last time. I patched it.",
    "preLoss": "I've got the ferry schedule sorted. Let's settle the rematch.",
    "postLocal": "We made it through the local with time to spare. That's unusual."
  }
});
 const DEFAULT=Object.freeze({
  win:['I have been thinking about our last match.','There was more to it than the final result.'],
  loss:['I went over our last game again.','I think a rematch could teach us both something.'],
  draw:['That last match left a question unanswered.','We should find time for another game.'],
  local:['I heard how the Saturday Local finished.','You never know what a small tournament will teach you.'],
  cup:['The official tournament results are out.','I would rather hear what you thought than judge a scoreboard.'],
  missed:['I waited for our meeting but you could not make it.','Please send a message if plans change next time.'],
  kept:['I enjoyed spending that time together.','It made a nice change from all the competition.'],
  preWin:'I remember what happened in our last match.',
  preLoss:'I have been thinking about our last match.',
  postLocal:'That local gave us something to remember.'
 });
 const CUP_DAYS=Object.freeze({neighborhood:30,regional:60,championship:88});
 const goodDay=n=>Number.isInteger(n)&&n>=1&&n<=91;
 const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const validRecord=r=>plain(r)&&typeof r.id==='string'&&r.id.length>0&&
  typeof r.npc==='string'&&goodDay(r.day)&&typeof r.won==='boolean';
 const lines=(npc,kind)=>VOICE[npc]?.[kind]||DEFAULT[kind];
 const rec=(npc,sentence)=>({speaker:npc,text:sentence});
 const protagonist=text=>({speaker:'Protagonist',text});
 function seen(s,id){return !!s?.npcReactivity?.seen?.[id];}
 function hydrate(s){
  if(!plain(s.npcReactivity))s.npcReactivity={};
  if(!plain(s.npcReactivity.seen))s.npcReactivity.seen={};
  return s.npcReactivity;
 }
 function mark(s,id){
  if(typeof id!=='string'||id.length>220||!id.startsWith('react:'))return false;
  const m=hydrate(s);
  if(m.seen[id])return false;
  m.seen[id]=true;return true;
 }
 function lastMatch(s,npc,exclude=null){
  return (Array.isArray(s?.results)?s.results:[]).map((row,index)=>({row,index}))
   .filter(x=>validRecord(x.row)&&x.row.npc===npc&&x.row.id!==exclude&&x.row.day<=s.day)
   .sort((a,b)=>b.row.day-a.row.day||b.index-a.index)[0]?.row||null;
 }
 function reaction(s,npc,character=null,cast=null,community=null,consequences=null){
  if(!plain(s)||typeof npc!=='string'||!goodDay(s.day)||s.day>90)return null;
  const candidate=[];
  function add(priority,id,kind,day,dialogue,asked='How have things been since then?'){
   if(!goodDay(day)||day>s.day||seen(s,id))return;
   let voice=lines(npc,kind);
   if(!VOICE[npc]&&kind==='win'&&typeof character?.duelWin==='string')voice=[character.duelWin,voice[1]];
   if(!VOICE[npc]&&kind==='loss'&&typeof character?.duelLose==='string')voice=[character.duelLose,voice[1]];
   candidate.push({priority,id,kind,day,lines:[rec(npc,voice[0]),protagonist(asked),rec(npc,voice[1])]});
  }
  // Choice-based follow-ups take priority over generic result reactions.
  const chosen=consequences?.reaction?.(s,npc);
  if(chosen&&!seen(s,chosen.id))candidate.push({...chosen,priority:108});
  const match=lastMatch(s,npc);
  if(match&&s.day-match.day<=5){
   const kind=match.draw?'draw':match.won?'win':'loss';
   add(100,'react:duel:'+npc+':'+match.id,kind,match.day,null,
    'Did you think about our last game?');
  }
  // A kept or missed plan matters only to the person involved, and never awards affection.
  const plan=(Array.isArray(s.appointments)?s.appointments:[])
   .filter(x=>x?.npc===npc&&['attended','missed'].includes(x.status)&&goodDay(x.day)&&x.day<=s.day&&s.day-x.day<=5)
   .sort((a,b)=>b.day-a.day).at(0);
  if(plan){
   const kind=plan.status==='missed'?'missed':'kept';
   add(kind==='missed'?95:70,'react:appointment:'+npc+':'+plan.id+':'+kind,kind,plan.day,null,
    plan.status==='missed'?'I wanted to ask about the other day.':'I enjoyed spending that time together.');
  }
  // Local results are public and can be mentioned by any acquaintance, whether or not they played.
  const locals=plain(s.competitive?.locals)?Object.entries(s.competitive.locals):[];
  const recent=locals.map(([w,p])=>({week:Number(w),data:p,day:Number(w)*7-1}))
   .filter(x=>goodDay(x.day)&&x.day<=s.day&&s.day-x.day<=5&&
     (x.data?.status==='champion'||x.data?.status==='eliminated'))
   .sort((a,b)=>b.day-a.day)[0];
  if(recent){
   const result=recent.data.status==='champion'?'won':'lost';
   const voice=lines(npc,'local');
   const opening=result==='won'?'You won the Saturday Local. Word got around.':'The Saturday Local did not go your way this week.';
   const id='react:local:'+npc+':'+recent.week+':'+result;
   if(!seen(s,id))candidate.push({id,priority:82,kind:'local',day:recent.day,
    lines:[rec(npc,voice[0]),protagonist(opening),rec(npc,voice[1])]});
  }
  for(const [cup,day] of Object.entries(CUP_DAYS)){
   const status=s.tournaments?.[cup]?.state;
   if(!['champion','eliminated'].includes(status)||s.day<day||s.day>day+8)continue;
   add(80,'react:cup:'+npc+':'+cup+':'+status,'cup',day,null,
    status==='champion'?'Winning that cup felt different.':'That bracket did not end the way I wanted.');
  }
  // Story consequences are acknowledged without exposing unplayed chapters or forcing romance.
  const chapters=Object.entries(s.storyDone||{}).filter(([id,entry])=>id.startsWith(npc+'_')&&plain(entry)&&goodDay(entry.day)&&entry.day<=s.day&&s.day-entry.day<=3)
   .sort((a,b)=>b[1].day-a[1].day);
  if(chapters.length){
   const [id,entry]=chapters[0],key='react:chapter:'+npc+':'+id;
   if(!seen(s,key))candidate.push({id:key,priority:65,kind:'chapter',day:entry.day,
    lines:[rec(npc,'I have been thinking about what we talked about the other day.'),
     protagonist('Did anything about it change for you?'),
     rec(npc,'I am still working that out. But I appreciated being able to say it aloud.')]});
  }
  // Ambient NPC-vs-NPC club and friendship moments sit below authored personal scenes.
  // They describe witnessed community life, never award relationship points.
  const club=community?.dialogue?.(s,npc,cast);
  if(club&&!seen(s,club.id))candidate.push({...club,priority:55});
  candidate.sort((a,b)=>b.priority-a.priority||b.day-a.day||a.id.localeCompare(b.id));
  return candidate[0]||null;
 }
 function preDuelLine(s,d){
  if(!s||!d||typeof d.npc!=='string')return null;
  const prev=lastMatch(s,d.npc,d.id);
  if(!prev||s.day-prev.day>14)return null;
  if(prev.draw)return 'We left our last game unfinished. Shall we try again?';
  return (VOICE[d.npc]||DEFAULT)[prev.won?'preWin':'preLoss']||DEFAULT.preLoss;
 }
 function afterDuel(s,d,receipt,character){
  if(!d||!receipt||!['Victory','Defeat','Draw'].includes(receipt.outcome))return null;
  const npc=d.npc,voice=VOICE[npc]||DEFAULT;
  const previous=lastMatch(s,npc,receipt.duelId);
  const local=d.competitiveKind==='local';
  const turn=previous&&previous.won!==('Victory'===receipt.outcome)&&!previous.draw&&receipt.outcome!=='Draw';
  if(local&&receipt.outcome==='Victory'&&d.competitiveRound===1)
   return voice.postLocal||DEFAULT.postLocal;
  if(receipt.outcome==='Draw')return voice.draw[0];
  // Character packs remain the source of truth for their own victory/defeat
  // lines; the reaction matrix provides separate match memories and cut-ins.
  const legacy=new Set(['hana','reina','shiori','yuna','akari','camila','marina','kaede']);
  const authored=legacy.has(npc)?null:receipt.outcome==='Victory'?character?.duelWin:character?.duelLose;
  const base=typeof authored==='string'&&authored.trim()?authored:
   receipt.outcome==='Victory'?(voice.win?.[0]||character?.duelWin||DEFAULT.win[0]):
   (voice.loss?.[0]||character?.duelLose||DEFAULT.loss[0]);
  if(turn)return base+' That went differently from last time. Want another game?';
  return base;
 }
 return Object.freeze({VOICE,reaction,hydrate,mark,seen,lastMatch,preDuelLine,afterDuel});
});
