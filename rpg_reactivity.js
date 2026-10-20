'use strict';
// Context-sensitive dialogue, duel banter and one-time acknowledgements for Neo Harbor.
// No rewards, time advancement, combat mutations, or random rolls occur here.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgReactivity=api;
})(typeof window!=='undefined'?window:null,function(){
 const VOICE=Object.freeze({
  hana:{win:['You changed plans halfway through and still kept your team together.','The next match will teach us something different. I hope we both remember to have fun.'],loss:['I watched you keep trying even when the board looked awful.','Come back when you feel ready. The shop will still have a seat for you.'],draw:['Neither of us wanted to leave that table, did we?','I think the good part was that we kept finding another way to play.'],local:['I heard about your match at the local! The tables were buzzing.','I love when everyone has a story from the same afternoon.'],cup:['The big bracket has everyone talking, but I wanted to ask how you felt about it.','Winning or losing does not change who gets a place at our table.'],missed:['I kept your spot until I realized you could not make it.','Please send word next time. We can always find another afternoon.'],kept:['It was nice to spend some time together outside the usual rush.','I almost forgot what we were supposed to be in a hurry for.'],preWin:'You surprised me last time. I brought a new plan!',preLoss:'A rematch? Great. I was hoping we would try again.',postLocal:'We made a real match of that local. The others are going to talk about it.'},
  reina:{win:['You broke through my opening. I went home and replayed the turns.','Do not expect me to hand you that line twice.'],loss:['You saw what happens when a plan has a hole in it.','If you want a rematch, bring an answer. Not an excuse.'],draw:['We both had a chance to finish that game.','The next one is going to come down to who adapts first.'],local:['The local results are on the board. I checked.','The interesting part is what you do when the next opponent knows your habits.'],cup:['I saw the bracket result. It is going to follow you around town.','Make sure you remember the turns, not just what they printed next to your name.'],missed:['You were not where you said you would be.','I do not need an apology performance. Just be clear with me next time.'],kept:['You actually showed up when you said you would.','Good. Reliability matters outside the duel table too.'],preWin:'I studied the last loss. Try that again.',preLoss:'You know how the last game ended. Change something.',postLocal:'You survived a real local. The next one will not be easier.'},
  shiori:{win:['I have been thinking about the turn when you changed your mind.','You seemed to listen to the game instead of forcing it.'],loss:['I hope you did not remember only the last attack.','There was an earlier choice worth keeping for next time.'],draw:['That game left us both with an unfinished question.','Perhaps the next game will answer it. Perhaps it will ask a better one.'],local:['I heard the local drew a crowd.','A small match can become somebody else’s reason to begin playing.'],cup:['The result is public now. How are you feeling about it?','The most important decisions rarely fit on the scoreboard.'],missed:['I waited a little while, then took my book home.','I would rather know the truth about your day than have you promise something impossible.'],kept:['I liked how little we needed to plan once we were together.','Sometimes a quiet afternoon is enough.'],preWin:'You saw an opening I missed. I remember it.',preLoss:'We both learned something last time. Shall we test it?',postLocal:'One more story at the card tables. I am glad you played.'},
  yuna:{win:['You actually beat my magnificent scheme. Rude.','I have already thought of three even worse schemes.'],loss:['And that is why you never underestimate the dramatic reveal!','I am granting you a rematch for the sequel.'],draw:['A DRAW? That is not an ending. That is a cliffhanger!','We are absolutely doing a second season.'],local:['I heard the local had real drama. Without me directing it!','Tell me the best turn. I need material for my imaginary commentary track.'],cup:['A big tournament result! I heard three different versions already.','I want the one with the embarrassing bits left in.'],missed:['I made up an entire speech for when you arrived.','Now it will have to wait for our director’s cut.'],kept:['I still cannot believe you went along with that idea.','Excellent decision. Questionable judgment. Ten out of ten.'],preWin:'I have prepared an even bigger plot twist.',preLoss:'Welcome to the sequel. I expect special effects!',postLocal:'That local needed more cheering. I volunteer as commentator.'},
  akari:{win:['My notes from our last game were wrong in one important place.','You adapted sooner than I predicted. I have corrected the model.'],loss:['The last match exposed a consistency problem.','I would start with your opening hands before replacing any single card.'],draw:['Our last sample did not support either conclusion.','A second match would provide more useful data.'],local:['The local results make an interesting data point.','One result is not a trend. The next week will tell us more.'],cup:['I examined the published bracket.','It tells me what happened, but not every decision you made.'],missed:['I removed our meeting from the schedule when you did not arrive.','I would prefer a short message to an inaccurate calendar.'],kept:['That was a pleasantly efficient use of an afternoon.','And, for the record, I enjoyed the unstructured parts.'],preWin:'Your last result changed my estimates.',preLoss:'I adjusted my list after our previous match.',postLocal:'The bracket is over. Time to study the opening hands.'},
  camila:{win:['You called my bluff beautifully in our last game.','I am going to have to negotiate a better position next time.'],loss:['The last game was expensive for you, darling.','A lesson is worth keeping only if you know what it cost.'],draw:['Neither of us could close the deal.','Interesting. I wonder who will blink first next time.'],local:['The shop is still discussing the local results.','A good reputation is easier to earn than to keep.'],cup:['Your name was on the tournament board.','That kind of attention can become an opportunity. Or a liability.'],missed:['I do not mind a change of plans.','I do mind finding out about it after I have arrived.'],kept:['You kept your word, which is rarer than a shiny card.','I enjoyed the company, too. But do not quote me on that.'],preWin:'One bad trade is enough. I renegotiated my strategy.',preLoss:'Shall we see whether fortune favors the prepared?',postLocal:'The shop has noticed your performance. Make the most of it.'},
  marina:{win:['I keep thinking about how patiently you set up that win.','Sometimes the best turn is the one where you do not rush.'],loss:['That match got away from you, but not all at once.','We can look at the turning point together if you want.'],draw:['We never quite found the current that would carry us through.','Maybe another day the water will be kinder.'],local:['I heard everyone stayed late after the local.','It is nice to see the riverfront feel like a community.'],cup:['The tournament was a lot to take in.','There is room to breathe, even after a very public result.'],missed:['I took the long way home when you did not arrive.','It is all right to change plans. I would just like to know.'],kept:['I am glad we had time to walk without worrying about standings.','I would like to do it again, whenever it feels right.'],preWin:'I remember how you found that opening.',preLoss:'This time I want to try something different.',postLocal:'After all those matches, a walk sounds pretty good.'},
  kaede:{win:['You caught me off guard last time. I liked that.','Now I am going to try returning the favor.'],loss:['You fell for it. I almost felt bad. Almost.','Try something that makes me actually work next time.'],draw:['We left unfinished business on the table.','That is the best kind of excuse to play again.'],local:['I heard what happened at the local.','The fun part is seeing whether you can repeat it under pressure.'],cup:['People here take those bracket results very seriously.','I am more interested in whether you still play boldly afterward.'],missed:['You did not show. I found someone else to annoy.','If you want to make a plan, make one you can keep.'],kept:['You were actually fun company without a scoreboard.','Do not tell anyone I said that.'],preWin:'Oh, I remember losing to you. Here is my answer.',preLoss:'I hope you have something less predictable this time.',postLocal:'Now that was a local worth remembering.'},
  elena:{win:['I reviewed our previous match. Your decisions were more deliberate than I expected.','I have updated my assessment. That does not mean I am conceding the next one.'],loss:['The last result was not inevitable.','The relevant question is which contingency you did not prepare.'],draw:['Our match ended without resolution. I have kept my notes.','I would welcome another attempt when our schedules align.'],local:['I saw the local standings. Interesting work.','Remember that managing pressure is as important as managing cards.'],cup:['The bracket has been published.','Do not let one public result define your private judgment.'],missed:['I reserved time for our appointment. You were not there.','A brief notice would be appreciated next time.'],kept:['Thank you for respecting the time we agreed on.','I found myself enjoying our conversation long after it ended.'],preWin:'I have recalculated after our previous result.',preLoss:'The last game provided useful information.',postLocal:'An instructive local. I hope you kept notes.'},
  jinx:{win:['You got me good. I could not even fake being bored.','Next time I am bringing a trick you have not seen.'],loss:['I am still laughing about that last turn.','Come back with something dangerous. I hate easy rematches.'],draw:['A tie? Boring. Actually, no. That was kind of perfect.','We are finishing this argument over a deck table.'],local:['I heard the local got messy. Sounds fun.','Were you playing to win, or to make somebody remember your name?'],cup:['A tournament result does not tell the whole story.','Come on, tell me about the move that made everyone gasp.'],missed:['You stood me up! I made three terrible backup plans.','Next time just tell me. I can handle a no.'],kept:['Okay, that was more fun than I was prepared to admit.','You are a bad influence. Keep it up.'],preWin:'You got lucky last time. Do it again.',preLoss:'I have a new surprise. You are going to love it.',postLocal:'Not bad. The crowd could use a little more chaos.'},
  luna:{win:['I was so focused on your last attack that I almost missed the setup.','I want to test that kind of patience in my own deck.'],loss:['I saw exactly where I lost track of the board.','I am going to practice it rather than ask you to fix it for me.'],draw:['Nobody could finish that game.','I want to figure out why on my own before our next match.'],local:['I followed the local results.','I have been practicing so I can earn a place in that crowd myself.'],cup:['I heard how the bracket ended.','I hope you will keep playing, whatever the result means to everyone else.'],missed:['I waited for a bit, then went back to practicing.','I would still like to spend time together another day.'],kept:['I liked having space to figure things out myself.','And I liked that you stayed anyway.'],preWin:'I learned from that loss. Let me show you.',preLoss:'This time I want to trust my own plan.',postLocal:'I want to try a local like that, too.'},
  rina:{win:['I keep replaying the last match between rehearsals.','I have room in my schedule for a rematch, even if I have to make it.'],loss:['You saw how carefully I practiced that opening, right?','I had to find the time. I wanted to.'],draw:['We ran out of answers before we ran out of energy.','I really want to finish that game another time.'],local:['I heard how the local went.','I wished I could have been there for the noise and the excitement.'],cup:['The tournament results reached me between rehearsals.','I wanted to hear how it felt from you, not from a noticeboard.'],missed:['I shifted my schedule to make that meeting.','Please tell me early if you cannot come. I can still plan around it.'],kept:['I was glad we made time that belonged just to us.','Even a short break can feel like a whole afternoon.'],preWin:'I made time to practice after you won.',preLoss:'I have a new opening. Want to see?',postLocal:'The next local is going straight into my calendar.'},
  sierra:{win:['I have been thinking about how you adjusted under pressure.','It reminded me of making a choice while everyone is watching.'],loss:['It was not your day at the table.','That does not mean anyone else gets to write your next move.'],draw:['We both held our ground right to the end.','I like that more than pretending the decision was easy.'],local:['The local is all over the town’s conversations.','It is strange how quickly people decide what one result says about you.'],cup:['I saw the tournament bracket.','Try not to let people turn one afternoon into your whole identity.'],missed:['I cleared that time from a very full schedule.','Next time please let me know before I get there.'],kept:['I enjoyed having a plan that did not belong to somebody else.','Thank you for treating my time like it matters.'],preWin:'You made me rethink that last match.',preLoss:'Let us see what happens without an audience.',postLocal:'A local can be more demanding than any stage.'},
  sol:{win:['That was a stronger finish than I expected.','I liked having a plan that made room for surprises.'],loss:['You did not get the result you wanted last time.','We can just play again. It does not have to become a big event.'],draw:['Neither of us got to call that one.','I kind of like having a reason to meet again.'],local:['The local sounded lively.','Some days it is enough just to be part of the room.'],cup:['Everyone seems to have an opinion about the tournament.','I care more about what you want to do tomorrow.'],missed:['I waited, then decided to make a quiet evening of it.','Let me know next time. No dramatic excuses needed.'],kept:['It was nice not to have an entire event organized around us.','Just being there was enough for me.'],preWin:'I remember our last match. I will try a different angle.',preLoss:'No agenda today. Except winning, maybe.',postLocal:'Good game. Want to just hang out afterward?'}
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
 function reaction(s,npc,character=null){
  if(!plain(s)||typeof npc!=='string'||!goodDay(s.day)||s.day>90)return null;
  const candidate=[];
  function add(priority,id,kind,day,dialogue,asked='How have things been since then?'){
   if(!goodDay(day)||day>s.day||seen(s,id))return;
   let voice=lines(npc,kind);
   if(!VOICE[npc]&&kind==='win'&&typeof character?.duelWin==='string')voice=[character.duelWin,voice[1]];
   if(!VOICE[npc]&&kind==='loss'&&typeof character?.duelLose==='string')voice=[character.duelLose,voice[1]];
   candidate.push({priority,id,kind,day,lines:[rec(npc,voice[0]),protagonist(asked),rec(npc,voice[1])]});
  }
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
  if(local&&receipt.outcome==='Victory'&&d.competitiveRound===1){
   return voice.postLocal||DEFAULT.postLocal;
  }
  if(turn&&receipt.outcome==='Victory')return (character?.duelWin||'You won.')+' And after our last game, that is quite a turnaround.';
  if(turn&&receipt.outcome==='Defeat')return (character?.duelLose||'You lost.')+' Last time went differently. I knew you would make me work.';
  if(receipt.outcome==='Draw')return voice.draw[0];
  return receipt.outcome==='Victory'?voice.win[0]:voice.loss[0];
 }
 return Object.freeze({VOICE,reaction,hydrate,mark,seen,lastMatch,preDuelLine,afterDuel});
});
