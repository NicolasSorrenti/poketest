'use strict';
// Full-screen, save-driven VN sequences for the three compulsory RPG cups.
// Presentation only: the RPG controller still owns duel outcomes, clock and saves.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgTournamentStory=api;
})(typeof window==='undefined'?null:window,function(){
 const SETTINGS={
  neighborhood:{
   place:'The Neighborhood Cup',day:30,
   opening:'The community center is transformed overnight. Tables run from wall to wall, hand-painted banners hang above the brackets, and the familiar club has become a real tournament hall.',
   announcer:'Welcome, challengers, to the Neighborhood Cup! Three matches. One local champion. Let us hear you!',
   closing:'Outside, the neighborhood is still buzzing about the matches.'
  },
  regional:{
   place:'The Regional Qualifier',day:60,
   opening:'The hall is nearly unrecognizable: official brackets, bright spotlights, visiting trainers, and a long line of spectators. This is no longer a neighborhood practice.',
   announcer:'Welcome to the Regional Qualifier! Three rounds stand between our competitors and a place among the best.',
   closing:'The visiting crowds spill into the street, still debating the plays they just saw.'
  },
  championship:{
   place:'The Championship Bracket',day:90,
   opening:'It is the final day of the season. The championship hall glows beneath the stage lights, and every table is surrounded by a restless crowd.',
   announcer:'The championship begins NOW! Three matches to decide whose name will stand at the top of Neo Harbor!',
   closing:'As the lights dim, ninety days of friendships and battles feel impossibly close.'
  }
 };
 const rivalTalk={
  hana:'You know how this works. Trust your deck, and do not forget the people cheering for you.',
  yuna:'I had a whole dramatic speech prepared, but I am too excited. Go make some noise out there!',
  reina:'You made it to this table. Good. I would not want an easy match.',
  marina:'There are a lot of eyes on this table. Just breathe and play the game you practiced.',
  akari:'I have reviewed the brackets. The probability of an interesting match is exceptionally high.',
  camila:'A tournament this big? Darling, every decision you make will have an audience.',
  kaede:'I came for a real challenge. Do not disappoint me now.',
  shiori:'There is beauty in playing well under pressure. Show me how you think.'
 };
 const guestVoice={
  hana:['I saved you a seat near the front! Well, I tried. Everyone is standing.','One card at a time. I know you can do this.','You gave us quite a day to remember.'],
  reina:['I am watching your plays. Do not embarrass yourself.','That was better. Keep your head in the game.','I will remember how you handled that pressure.'],
  shiori:['I wanted to see you play on a stage like this.','Do not rush a decision just because the room is loud.','You should be proud of the way you played.'],
  yuna:['I made a sign for you! It is extremely embarrassing!','You are on FIRE! Metaphorically. Please do not set the table on fire.','I am never going to stop talking about today.'],
  akari:['I have been following your progress closely. This is fascinating.','Your opponent is adjusting. You should too.','I would like to review every turn with you later.'],
  camila:['I would not miss your big day for anything, darling.','Make them work for every prize card.','I had a feeling you would make today memorable.'],
  marina:['I am so glad I got here before the first round.','Your friends are right here, even when it gets difficult.','Let us take a walk by the river when you are ready.'],
  kaede:['Well, look at you. You have got a crowd now.','Show me you deserve all that attention.','You made this more interesting than I expected.'],
  elio:['I brought extra sleeves, just in case.','Check your setup. Breathe. Then play.','That was a proper tournament day.'],
  alma:['We have been waiting to cheer for you.','Even from the back row, we can see how hard you are trying.','I hope you remember the people who came to see you.'],
  nereo:['I came all the way from the river for this.','One step at a time. That is how you cross anything.','I would say the trip was worth it.'],
  barb:['I would not miss this for the world.','You can hear us cheering, right? Good!','I am so glad I was here with you.'],
  laca:['I knew you would make it onto this stage.','Just keep going. I am right here.','I am proud of you, you know.'],
  daisy:['I brought a little good luck for you.','You have got this!','What a day!'],
  lyla:['I came to watch you. Do not make a big deal out of it.','That was a pretty good play.','I am glad I stayed until the end.'],
  jicy:['I was nervous just coming here, but I wanted to see you.','You can do it. I really believe that.','You were amazing to watch today.'],
  live:['I wanted to make sure you had someone cheering for you.','Remember to take care of yourself between matches.','I am happy you let me be part of your day.']
 };
 const backgrounds={
  neighborhood:'Local crowd • Day 30',regional:'Regional stage • Day 60',championship:'Grand final • Day 90'
 };
 function supporters(state,cast,cup,rel){
  const ranked=Object.keys(cast||{}).filter(id=>id!=='live').map(id=>{
   const rank=rel?.bondRank?.(state,id)||0,score=rel?.bondScore?.(state,id)||0;
   return {id,rank,score};
  }).filter(x=>x.rank>=2);
  ranked.sort((a,b)=>b.rank-a.rank||b.score-a.score||a.id.localeCompare(b.id));
  // Favor supporters over current opponents when possible, but never hide
  // a high-bond rival if the player has no other close relationships.
  const free=ranked.filter(x=>!cup.rounds.includes(x.id));
  const rivals=ranked.filter(x=>cup.rounds.includes(x.id));
  return [...free,...rivals].slice(0,6).map(x=>x.id);
 }
 function guestLine(id,stage,rank=2){
  const phrases=guestVoice[id]||[
   'I came to cheer for you. I would not miss this.',
   'Remember how far you have come. We are all here for you.',
   'I am really glad I got to share this day with you.'
  ];
  const n=stage==='arrival'?0:stage==='closing'?2:1;
  return phrases[n]+(rank>=4&&stage==='arrival'?' After everything we have shared, I had to be here.':'');
 }
 function lines(cup,key,progress,guests,cast,rel,state){
  const details=SETTINGS[cup.id]||SETTINGS.neighborhood;
  const out=[],push=(speaker,text)=>out.push({speaker,text});
  const name=id=>cast[id]?.name||id;
  const rank=id=>rel?.bondRank?.(state,id)||0;
  const established=Array.isArray(guests)?guests.filter(id=>cast[id]):[];
  const fallback={neighborhood:'elio',regional:'alma',championship:'nereo'}[cup.id];
  const guestAt=i=>established[i]||null;
  if(key==='wakeup'){
   // Live returns the player's EXISTING deck box; this is not a card reward.
   const variants={
    neighborhood:[
     'You wake to a gentle knock. The curtains are still drawn, but morning light is creeping in.',
     'Morning, sleepyhead! It is the Neighborhood Cup today. You do not want to be late.',
     'Live places your familiar deck box on the bedside table, right within reach.',
     'Here, I brought your deck. You left it out after practicing last night, so I made sure it was safe.',
     'You remembered?',
     'Of course. I know how much this means to you. Have something to eat, all right? And good luck.',
     'You take the deck from Live. The first tournament of the season is waiting.'
    ],
    regional:[
     'A soft knock draws you out of sleep. Someone opens the bedroom door.',
     'Rise and shine. The Regional Qualifier is today, remember?',
     'Live sets your deck box on the bedside table and gently slides it toward you.',
     'I brought this. You checked your deck three times yesterday, so I know you would want it close.',
     'You really have been paying attention.',
     'How could I not? You have worked so hard. Whatever happens, I am proud of you.',
     'You take your deck and get ready to face the regional crowd.'
    ],
    championship:[
     'The last morning of the season begins with a familiar voice outside your bedroom.',
     'Hey, honey. Time to wake up. Today is the championship!',
     'Live comes in holding your deck box carefully in both hands, then offers it to you.',
     'Here. Your deck. I kept it ready for you. I know this is your big day.',
     'Ninety days. I cannot believe it is here already.',
     'I can. I saw how much you put into every one of them. Go play your best, and remember I will be cheering for you.',
     'You take the deck from Live. Your last tournament morning has begun.'
    ]
   };
   // Relationship-specific tournament morning: no change to the existing
   // deck reward, chapter length, save progression or other tournament phases.
   const liveIntimate=!!(state?.mandatoryEventState?.seen?.live_glance_next_morning||
     state?.liveSpecialSeen?.live_glance_next_morning);
   const romantic={
    neighborhood:[
     'You wake to the soft sound of Live opening your bedroom door. She smiles when you look up.',
     'Good morning, sweetheart. I wanted to be the first person you saw today. Your first big tournament is here!',
     'Live sits beside you for a moment, your familiar deck box balanced carefully in her hands.',
     'I kept this safe for you. I know you were nervous last night... but I believe in you, more than you know.',
     'You remembered everything.',
     'Of course I did. Now come on, love. Eat some breakfast, play your best, and save a little time for me afterward.',
     'She squeezes your hand before giving you your deck. The Neighborhood Cup awaits.'
    ],
    regional:[
     'Morning sunlight filters into the bedroom. Live is already waiting beside you, smiling.',
     'There you are, my favorite sleepy champion. Ready for the Regional Qualifier?',
     'She gently sets your deck box on the bedside table and brushes a stray lock of hair from your forehead.',
     'I checked that you had everything. Not because I think you would forget... because I wanted to take care of you.',
     'You make it hard not to feel confident.',
     'Then my plan is working. Whatever happens today, I am proud of you. And I will be waiting when you come home.',
     'Live holds your hand for one more moment. Then you take your deck and prepare to leave.'
    ],
    championship:[
     'A familiar, affectionate voice wakes you on the most important morning of the season.',
     'Morning, love. It is championship day. Can I keep you here for another minute before the world steals you away?',
     'Live comes closer, holding the deck box you have carried through the entire season.',
     'I kept it right here. Ninety days of work, and now your big moment is finally here. I wanted to share the morning with you.',
     'I could not have done all this without you.',
     'You did the hard part, sweetheart. I am just lucky I got to see you grow. Now go show them what you can do. I will be cheering louder than anyone.',
     'She gives your hand a warm squeeze as she returns the deck. Today, you play for the championship.'
    ]
   };
   const selected=liveIntimate?romantic:variants;
   const speakers=['Narrator','Live','Narrator','Live','You','Live','Narrator'];
   (selected[cup.id]||[]).forEach((text,index)=>push(speakers[index],text));
  }else if(key==='arrival'){
   push('Narrator',details.opening);
   push('Announcer',details.announcer);
   push('You','So this is what all those days of practice were leading up to.');
   if(established.length){
    for(const id of established.slice(0,3))push(id,guestLine(id,'arrival',rank(id)));
   }else if(cast[fallback]){
    push(fallback,'You are here! I came early to see the opening ceremony. Good luck out there.');
   }
   push('Announcer','Competitors, check your decks. When you are ready, report to your first table!');
  }else if(/^round-[012]$/.test(key)){
   const round=Number(key.slice(-1)),opponent=cup.rounds[round],previous=round>0;
   push('Narrator',previous?
    'The next pairing appears on the tournament screen. The spectators move toward a new table.':
    'A staff member points you toward the first match table. The arena noise fades into a single heartbeat.');
   push('Announcer','Round '+(round+1)+' of three. '+name(opponent)+' versus our challenger!');
   if(cast[opponent])push(opponent,rivalTalk[opponent]||'Let us make this a match worth remembering.');
   const guest=guestAt(round+3)||guestAt(round%Math.max(1,established.length));
   if(guest&&guest!==opponent)push(guest,guestLine(guest,'round',rank(guest)));
   push('You',round===2?'One last match. Everything I have learned comes down to this.':'All right. Time to trust my deck.');
   push('Announcer','Players, shuffle your decks. The round is about to begin!');
  }else if(key==='closing'){
   const champion=progress?.state==='champion';
   push('Narrator',champion?'The final result appears on the screen. The hall erupts in cheers.':
    'The final result is announced. Your run has ended, but the hall is still full of familiar faces.');
   push('Announcer',champion?
    'We have a champion! Give a huge round of applause to the winner of '+cup.title+'!':
    'Thank you to every competitor. A tournament is more than the trophy at the end.');
   for(const id of established.slice(0,2))push(id,guestLine(id,'closing',rank(id)));
   if(!established.length&&cast[fallback])push(fallback,'You made it to the tournament. I am glad I got to see you play.');
   push('You',champion?'I did it. And I did not get here alone.':'That is not the end of my story. There is still so much to learn.');
   push('Narrator',details.closing+' Your friends wait by the exit, ready to talk about everything that happened.');
  }
  return out;
 }
 function countdown(state,cups){
  if(!state||!Number.isInteger(state.day)||!Array.isArray(cups))return null;
  const cup=cups.find(c=>c.day>state.day&&c.day-state.day<=3);
  return cup?{cup,daysLeft:cup.day-state.day}:null;
 }
 function countdownLines(cup,days){
  const voices={
   3:'I saw the announcement on the calendar. Three days until the tournament! You might want to look over your deck before then.',
   2:'Only two days until '+cup.title+'. It is a good time to adjust your deck if you need to. You have been practicing so much!',
   1:'The tournament is tomorrow! Get some rest tonight. I promise I will help you remember your deck in the morning.'
  };
  return [
   {speaker:'Narrator',text:'You hear Live call to you as you start your morning. The tournament date is getting close.'},
   {speaker:'Live',text:voices[days]},
   {speaker:'Narrator',text:'The '+cup.title+' begins on Day '+cup.day+'. You still have time to prepare.'}
  ];
 }
 let overlay=null,actors=null,buttons=null,heading=null,subheading=null,speaker=null,copy=null;
 function element(doc,tag,className){const el=doc.createElement(tag);el.className=className;return el;}
 function mount(doc){
  if(overlay?.isConnected)return;
  overlay=element(doc,'section','neo-cup-story');
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Official tournament story');
  const backdrop=element(doc,'div','neo-cup-story__backdrop'),venue=element(doc,'div','neo-cup-story__venue');
  const halo=element(doc,'div','neo-cup-story__spotlights');
  const crowd=element(doc,'div','neo-cup-story__crowd');
  const headline=element(doc,'header','neo-cup-story__headline');
  subheading=element(doc,'span','neo-cup-story__eyebrow');
  heading=element(doc,'h2','neo-cup-story__title');
  headline.append(subheading,heading);
  actors=element(doc,'div','neo-cup-story__actors');
  const dialogue=element(doc,'div','neo-cup-story__dialogue');
  speaker=element(doc,'strong','neo-cup-story__speaker');
  copy=element(doc,'p','neo-cup-story__line');
  buttons=element(doc,'div','neo-cup-story__actions');
  dialogue.append(speaker,copy,buttons);
  venue.append(halo,crowd,headline,actors,dialogue);
  overlay.append(backdrop,venue);doc.body.append(overlay);
 }
 function hide(){if(overlay)overlay.hidden=true;}
 function action(doc,label,callback,primary=false){
  const b=element(doc,'button','neo-cup-story__button'+(primary?' is-primary':''));
  b.type='button';b.textContent=label;b.onclick=callback;buttons.append(b);
 }
 function updateActors(doc,visible,focused,portraits,cast){
  const discreet=doc.documentElement?.dataset?.rpgDiscreet==='on'||
   (typeof window!=='undefined'&&window.NeoRpgDiscreet?.isEnabled?.()===true);
  const key=visible.join('|')+'|'+(discreet?'discreet':'art');
  if(actors.dataset.key!==key){
   actors.replaceChildren();actors.dataset.key=key;
   for(const id of visible){
    const actor=element(doc,'figure','neo-cup-story__actor');actor.dataset.id=id;
    const frame=element(doc,'div','neo-cup-story__portrait');
    if(!discreet){
     const sources=portraits?.(id,'neutral')||[];
     const img=doc.createElement('img');img.alt='';img.loading='eager';
     let cursor=0;
     img.onerror=()=>{if(cursor<sources.length)img.src=sources[cursor++];else{
      img.remove();frame.textContent=(cast[id]?.name||id).slice(0,1);
     }};
     if(sources.length)img.src=sources[cursor++];
     else frame.textContent=(cast[id]?.name||id).slice(0,1);
     frame.append(img);
    }else frame.textContent=(cast[id]?.name||id).slice(0,1);
    const name=element(doc,'figcaption','neo-cup-story__actor-name');name.textContent=cast[id]?.name||id;
    actor.append(frame,name);actors.append(actor);
   }
  }
  for(const node of actors.children)node.classList.toggle('is-speaking',node.dataset.id===focused);
 }
 function show({cup,mode='scene',phase='arena',script=[],index=0,progress=null,cast={},portraits,liveRomance=false,
  onNext=()=>{},onDeck=()=>{},onPlay=()=>{},onEnd=()=>{}}={}){
  const doc=typeof document==='undefined'?null:document;
  if(!doc?.body||!cup)return false;
  mount(doc);overlay.hidden=false;overlay.dataset.cup=cup.id;overlay.dataset.phase=phase;
  overlay.dataset.liveRomance=(phase==='wakeup'&&liveRomance)?'on':'off';
  // Discreet Mode must not display or fetch the character illustration.
  overlay.dataset.discreet=(doc.documentElement?.dataset?.rpgDiscreet==='on'||
   (typeof window!=='undefined'&&window.NeoRpgDiscreet?.isEnabled?.()===true))?'on':'off';
  const round=Math.min(3,Math.max(0,(progress?.round||0)+1));
  heading.textContent=phase==='wakeup'?'Tournament Morning':phase==='countdown'?'Tournament Approaching':cup.title;
  subheading.textContent=phase==='wakeup'?'LIVE · AT HOME · DAY '+cup.day:
   phase==='countdown'?'LIVE · TOURNAMENT COUNTDOWN · DAY '+cup.day:
   (backgrounds[cup.id]||'Official circuit')+
   (mode==='lobby'?' · ROUND '+round+' / 3':mode==='scene'?' · STORY EVENT':' · MATCH RESULT');
  const item=script[Math.max(0,Math.min(index,script.length-1))]||null;
  buttons.replaceChildren();
  const isActor=id=>!!cast[id];
  if(mode==='scene'&&item){
   speaker.textContent=isActor(item.speaker)?cast[item.speaker].name:item.speaker;
   copy.textContent=item.text;
   const seen=[];
   for(const step of script.slice(0,index+1)){
    if(!isActor(step.speaker))continue;
    if(seen.includes(step.speaker))continue;
    seen.push(step.speaker);
   }
   const visible=seen.slice(-3);
   updateActors(doc,visible,item.speaker,portraits,cast);
   action(doc,index>=script.length-1?'Continue ›':'Next ›',onNext,true);
  }else if(mode==='result'&&item){
   speaker.textContent=isActor(item.speaker)?cast[item.speaker].name:item.speaker;
   copy.textContent=item.text;
   updateActors(doc,isActor(item.speaker)?[item.speaker]:[],item.speaker,portraits,cast);
   action(doc,'Continue ›',onNext,true);
  }else{
   const finished=progress?.state!=='open';
   const opponent=finished?null:cup.rounds[progress.round];
   speaker.textContent=finished?'Tournament Desk':'Next match · '+(cast[opponent]?.name||opponent);
   copy.textContent=finished?
    'The event has ended. Take one last look at the hall before the next day begins.':
    'Your deck is the one you last saved. Edit it for free, or go directly to your next match.';
   updateActors(doc,opponent&&cast[opponent]?[opponent]:[],opponent,portraits,cast);
   if(finished)action(doc,'Leave the tournament ›',onEnd,true);
   else {
    action(doc,'▤ Edit deck · free',onDeck);
    action(doc,'⚔ Start round '+round+' / 3',onPlay,true);
   }
  }
  return true;
 }
 return Object.freeze({supporters,lines,countdown,countdownLines,show,hide});
});
