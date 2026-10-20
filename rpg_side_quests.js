'use strict';
/*
 * Neo Harbor: optional town side quests, separate from romance routes and
 * tournament standings. All duels continue through the Classic duel bridge.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgSideQuests=api;
})(typeof window!=='undefined'?window:null,function(){
 const cast={
  elio:{name:'Elio Soto',age:19,deck:'bodyguard',style:'Fossil Bodyguard · Careful basics',
   intro:'Sorry. I was sorting my cards by the tiny numbers at the bottom. Is that weird?',
   repeat:'Hey. I tried that thing you said. It mostly worked. Mostly is new for me.',
   talk:["The old deck box has a Champion sticker. I finally put my own name on the new one.","A player picked up my cards at the shop to 'fix' my deck. I asked for them back.","I kept my favorite Basic in play too long last night. Sentimentality is expensive."],
   flirt:'Oh. Uh, I am going to pretend I heard a question about deck sleeves.',
   duelWin:'I won? I mean—good game. Sorry. That came out wrong. Good game.',
   duelLose:'I think I finally understand that losing does not mean I wasted your time.'},
  alma:{name:'Alma Serrano',age:35,deck:'lockdown',style:'Fossil Lockdown · Slow control',
   intro:'Welcome. We have coffee, tea, and a table where nobody asks about your win rate.',
   repeat:'There you are. Would you like the good chair or the one that makes you sit up straight?',
   talk:["The tournament crowd moved every chair again. Do they have a grudge against the aisle?","A regular asked for an easier path through the café. We moved three tables yesterday.","Someone left a five-credit coin under the back table. Think I can call it a tip?"],
   flirt:'Thank you. But I charge extra for compliments delivered during the lunch rush.',
   duelWin:'Good. You gave yourself time to think. The room did not fall apart while you did.',
   duelLose:'I own a café, not a trophy shelf. I am perfectly comfortable with this result.'},
  nereo:{name:'Nereo Paz',age:29,deck:'cold_fusion',style:'Cold Fusion · Weathering the turn',
   intro:'If you are looking for the ferry schedule, it is accurate on days the river agrees.',
   repeat:'I tightened that dock railing. It has a better grip on life than I do this morning.',
   talk:["I carry spare batteries because the dock light dies whenever somebody needs directions.","The wind ate two of my printed schedules this morning. Both were already out of date.","Somebody said Chaos Gym reminds them of the ferry timetable. I was offended until I thought about it."],
   flirt:'That is kind of you. It might even make me less grumpy for the next ten minutes.',
   duelWin:'You had a plan for the bad draws. That is worth more than a perfect hand.',
   duelLose:'See? Sometimes the river lets you cross. Sometimes you rebuild the boat.'}
 };
 const looks={
  elio:{silhouette:'Compact oversized varsity hoodie with layered tee and worn straight-leg denim',palette:'Sky blue, amber, charcoal',hair:'Soft chestnut curls, loosely pinned away from the eyes',details:'Hand-decorated card binder, repaired canvas sneakers, mismatched sleeves',expressions:'Overthought smile, relief after admitting uncertainty'},
  alma:{silhouette:'Confident relaxed apron-over-streetwear silhouette, draped long-sleeve shirt, comfortable boots',palette:'Espresso brown, sage green, cream',hair:'Dark wavy hair in a practical low bun with escaping strands',details:'Old analog wristwatch, handwritten receipts and pen tucked into apron',expressions:'Dry amusement, attentive gaze, exhaustion she rarely shows'},
  nereo:{silhouette:'Sturdy boatyard jacket with rolled cuffs over a fitted striped tee and work pants',palette:'Petrol teal, orange rust, washed navy',hair:'Sun-bleached black short hair, wind-ruffled',details:'Salt-worn tool pouch, carabiner, patched ferry ticket lanyard',expressions:'Sardonic squint, immediate focus when something is wrong'}
 };
 const schedules={
  elio:[['home','shop','arcade'],['home','shop','home'],['library','shop','arcade'],['home','center','home'],['library','shop','arcade'],['shop','center','arcade'],['home','park','home']],
  alma:[['cafe','cafe','home'],['cafe','cafe','cafe'],['home','cafe','cafe'],['cafe','cafe','home'],['cafe','cafe','cafe'],['cafe','shop','cafe'],['home','park','cafe']],
  nereo:[['park','shop','home'],['park','park','cafe'],['home','park','park'],['park','shop','home'],['park','park','cafe'],['shop','center','park'],['home','park','home']]
 };
 const arrivals={elio:3,alma:1,nereo:18};
 const L=(speaker,text)=>({speaker,text});
 const C=(label,reply,delta,flag)=>({label,reply,delta,flag});
 const quests=[
  {id:'borrowed_deck',title:'A Deck With Someone Else’s Name',summary:'A nervous new regular has inherited a box of cards and a lot of expectations.',
   stages:[
    {title:'The Bent Binder',npc:'elio',place:'shop',slot:1,start:4,end:18,kind:'talk',
     lines:[L("Narrator","At the shop, Elio keeps turning a scuffed deck box over in his hands. A fading Champion sticker covers the lid."),
      L("elio","That's not my name. My cousin put it there before she gave me the deck."),
      L("Protagonist","Have you played with it yet?"),
      L("hana","He has. And he shuffled for twenty minutes before his first turn."),
      L("Narrator","A corner of the sticker peels away. Elio presses it back down without looking at Hana."),
      L("elio","I like two of the cards. Is it strange if I want to start with those?")],
     choices:[C('Help identify the cards he actually enjoys','These two. I know how they work together. Can we keep them?',{insight:2,credits:4,trust:1},'elio_own_list'),
      C('Show him a simple opening before changing anything','Wait. Attach first, then evolve next turn. Okay. Deal again.',{preparation:1,trust:2},'elio_fundamentals')]},
    {title:'Missing Pieces',npc:'elio',place:'library',slot:0,start:19,end:34,kind:'talk',
     lines:[L("Narrator","At the library, Elio has arranged two deck lists side by side. One is covered in price tags; the other has drawings in the margins."),
      L("elio","I checked the prices. I think my cousin's deck costs more than everything I own."),
      L("Protagonist","Which list is yours?"),
      L("elio","The messy one. I could build most of it with what I've got."),
      L("camila","And with the commons in the free exchange box. Don't tell my paying customers I sent you there."),
      L("elio","Would you look at the opening hands with me? I keep running out of Energy.")],
     openingByFlag:{elio_own_list:'I tried the cards I liked. For the first time, it felt like my deck.',elio_fundamentals:'I got through three turns without asking for help. Then I lost on turn four, but still.'},
     choices:[C('Build with trades and cards already available','That leaves enough for sleeves too. And I do not have to borrow anything.',{insight:2,credits:8,trust:1},'elio_budget'),
      C('Practice decision-making with bad opening hands','That hand was awful. ...All right, again. I think I see a way out.',{preparation:1,respect:2},'elio_practice')]},
    {title:'No Inherited Victory',npc:'elio',place:'center',slot:1,start:35,end:53,kind:'duel',reward:{win:{credits:18,reputation:3},loss:{credits:6,insight:2},draw:{credits:8,insight:2}},
     lines:[L("Narrator","The center's tables are nearly full. A woman in the back row waves to Elio; he waves back, then tightens a loose deck sleeve."),
      L("elio","My cousin came to watch. I told her I'd be using my own list."),
      L("Protagonist","What did she say?"),
      L("elio","She asked to borrow it after the match. Can you believe that?"),
      L("Narrator","He draws seven cards, pauses over the hand, then nods to himself."),
      L("elio","Your turn to cut. And please, don't go easy on me.")],
     openingByFlag:{elio_budget:'Camila found the last Trainer in the exchange box. She charged me one terrible joke.',elio_practice:'I drew one Basic and six Energy. Did not even swear. Out loud.'}}
   ]},
  {id:'quiet_table',title:'The Table Nobody Notices',summary:'The café is busy, but not everybody has a comfortable place to play.',
   stages:[
    {title:'One Chair Too Many',npc:'alma',place:'cafe',slot:1,start:10,end:28,kind:'talk',
     lines:[L("Narrator","At the café, tournament players have pushed their chairs into the aisle. A regular with a walking aid peers in, then turns back toward the door."),
      L("alma","Every week, the same table. Every week, they block the way."),
      L("Protagonist","Did anyone notice her leaving?"),
      L("alma","I did. Too late. She's been coming here longer than any of them."),
      L("Narrator","Alma lifts a chair clear of the passage. The abandoned cup on the near table is still warm."),
      L("alma","Next week, that aisle stays open. Can you help me work out the rest?")],
     choices:[C('Offer to help rearrange the furniture after closing','After closing. Bring a tape measure; I know exactly which chair keeps snagging the aisle.',{focus:-6,reputation:2,trust:1},'alma_layout'),
      C('Ask Alma to consult the regulars before moving anything','Good point. I will ask the regulars before I start dragging furniture around.',{insight:2,trust:2},'alma_listen')]},
    {title:'The Flyer With No Fine Print',npc:'alma',place:'center',slot:0,start:29,end:49,kind:'talk',
     lines:[L("Narrator","Jun has pinned a fresh flyer to the community-center board. Its elegant lettering is barely readable from an arm's length away."),
      L("alma","Tell me this is a draft. Please."),
      L("jun","It's a draft. I thought the type looked nice."),
      L("Protagonist","Can someone standing at the door read the start time?"),
      L("Narrator","Jun backs away from the board, squints, then takes the flyer down."),
      L("alma","Let's try again. Start time, clear entrance, room to move. Anything else?")],
     openingByFlag:{alma_layout:'That table layout stuck. Mrs. Ito came by for her usual tea yesterday.',alma_listen:'The regulars wanted the doorway clear, not the whole room rearranged. Fair enough.'},
     choices:[C('Make an accessible, plain-language flyer together','Now I can read the start time from the counter. That is better.',{reputation:3,insight:1,trust:1},'alma_clear'),
      C('Volunteer to welcome players at the door','Can you take the door at six? I will bring you tea before the rush.',{reputation:2,credits:8,trust:1},'alma_welcome')]},
    {title:'Not Just the Winners',npc:'alma',place:'cafe',slot:2,start:50,end:72,kind:'talk',
     lines:[L("Narrator","The café's back tables are still pushed apart from last night's gathering. Someone has left a drawing of a Pikachu wearing an apron."),
      L("alma","You missed the new club night. They used almost every chair."),
      L("Protagonist","Did they play a tournament?"),
      L("shiori","Not even a bracket. I taught someone to shuffle and lost a game to a nine-year-old."),
      L("Narrator","Alma puts the drawing beside the till, away from a ring of wet glasses."),
      L("alma","They've asked when we're doing it again. I said I'd check who can help.")],
     openingByFlag:{alma_clear:'A couple came in holding Jun\'s new flyer. They said it was the first one they could read from outside.',alma_welcome:'Someone came back looking for you. Said you made the first visit easier.'},
     choices:[C('Offer to help set it up next season','Saturday, six sharp. And eat something before you get here.',{credits:16,reputation:3,focus:10,trust:2},'alma_regular'),
      C('Encourage Alma to let other volunteers lead too','You are right. If I do the whole thing myself, we will never make it a regular night.',{credits:10,reputation:4,insight:2},'alma_shared')]}
   ]},
  {id:'river_route',title:'The Ferry With Empty Seats',summary:'A delivery route and a tournament timetable are pulling against each other.',
   stages:[
    {title:'The Box On The Dock',npc:'nereo',place:'park',slot:0,start:20,end:38,kind:'talk',
     lines:[L("Narrator","A crate marked STARTER DECKS sits beside the ferry landing, far from the club's temporary pickup point."),
      L("nereo","Don't lift that yet. The ferry crew thinks it belongs to the morning delivery."),
      L("Protagonist","The kids are expecting these today, aren't they?"),
      L("iris","They are. I sent the new address, but half the crew never saw it."),
      L("Narrator","Nereo opens the message thread. Three different pickup times appear on the screen."),
      L("nereo","Well, there's our problem. Want to help untangle this before someone carries it to the wrong shore?")],
     choices:[C('Help the crew write down a single delivery plan','One page. Three names. I could frame this.',{insight:2,trust:2},'nereo_plan'),
      C('Carry the boxes with Nereo to the temporary pickup','Take the small one. No, the other small one. Fine, we will both complain tomorrow.',{credits:12,focus:-8,trust:1},'nereo_carry')]},
    {title:'The Unpopular Delay',npc:'nereo',place:'shop',slot:1,start:39,end:61,kind:'talk',
     lines:[L("Narrator","A revised ferry schedule is taped to the shop counter. Three arrival times have been crossed out in red."),
      L("nereo","Told them the crossing would run late. Teo made it sound like a shipwreck."),
      L("teo","My exact words were 'probably not a shipwreck.' They cut that part."),
      L("Protagonist","Did the players get the new schedule?"),
      L("Narrator","Nereo taps a message thread filled with question marks. Then he turns the screen toward Teo."),
      L("nereo","Not all of them. Help me get the right time out before someone misses their round.")],
     openingByFlag:{nereo_plan:'They found the pickup point. Ferry was still late, but nobody waited on the wrong dock.',nereo_carry:'How is your back? The kids already wore out two of those decks.'},
     choices:[C('Ask Teo to announce the clear route updates','Teo, if you say crisis even once, you are delivering the next notice in person.',{reputation:2,credits:8,trust:1},'nereo_notice'),
      C('Set up a paper noticeboard as a backup','An actual board. With paper. My grandfather would be proud.',{insight:2,reputation:2,trust:1},'nereo_board')]},
    {title:'The Last Crossing',npc:'nereo',place:'park',slot:2,start:62,end:85,kind:'talk',
     lines:[L("Narrator","At the ferry landing, volunteers roll empty crates toward the storage shed. A child's hand-drawn thank-you card is taped to the last one."),
      L("nereo","Every deck made it over. Only one box got wet, and that was my lunch."),
      L("Protagonist","Are you going to frame the thank-you card?"),
      L("nereo","I was thinking of the fridge. There's a gap next to the ferry inspection notice."),
      L("Narrator","The ferry horn sounds behind you. Nereo keeps the card out of the wind with two fingers."),
      L("nereo","Next season I want a route that works even when the weather doesn't. Fancy helping?")],
     openingByFlag:{nereo_notice:'Teo got the update out. Only called it a dramatic rescue once.',nereo_board:'Someone left a thank-you on the noticeboard. I took it down before the rain.'},
     choices:[C('Organize an ordinary thank-you meal for the crew','No speeches? I am in. I will bring the folding chairs.',{credits:18,reputation:3,focus:8,trust:1},'nereo_meal'),
      C('Help set up the same system for next season','Write that down before somebody invents four different pickup times again.',{insight:3,reputation:4,preparation:1},'nereo_next')]}
   ]}
 ];
 const MAP=new Map(quests.map(q=>[q.id,q]));
 const caps={credits:999999,focus:100,insight:99,reputation:100,preparation:3};
 function hydrate(s){
  if(!s.relationships||typeof s.relationships!=='object'||Array.isArray(s.relationships))s.relationships={};
  if(!s.bonds||typeof s.bonds!=='object'||Array.isArray(s.bonds))s.bonds={};
  for(const id of Object.keys(cast)){
   if(!s.relationships[id]||typeof s.relationships[id]!=='object')s.relationships[id]={affection:0,trust:0,respect:0,attraction:0,duels:0};
   if(!s.bonds[id]||typeof s.bonds[id]!=='object')s.bonds[id]={affection:0,trust:0,duels:0};
  }
  if(!s.sideQuests||typeof s.sideQuests!=='object'||Array.isArray(s.sideQuests))s.sideQuests={};
  if(!s.activeSideQuest||typeof s.activeSideQuest!=='object'||!MAP.has(s.activeSideQuest.id))s.activeSideQuest=null;
  if(s.activeSideQuest){
   const p=s.sideQuests[s.activeSideQuest.id],q=MAP.get(s.activeSideQuest.id),stage=q?.stages[p?.step];
   if(!stage||p.status!=='active'||!['lines','choice','response','duel'].includes(s.activeSideQuest.phase)
    ||(s.activeSideQuest.phase==='lines'&&(!Number.isInteger(s.activeSideQuest.index)||s.activeSideQuest.index<0||s.activeSideQuest.index>=stage.lines.length+(stage.openingByFlag?.[p.history?.[p.step-1]?.flag]?1:0)))
    ||(s.activeSideQuest.phase==='response'&&(!Number.isInteger(s.activeSideQuest.choice)||!stage.choices?.[s.activeSideQuest.choice])))
    s.activeSideQuest=null;
  }
  return s;
 }
 function current(s,q){
  const p=s.sideQuests[q.id];if(p?.status==='complete'||p?.status==='missed')return null;
  return {quest:q,progress:p||null,index:p?.step||0,stage:q.stages[p?.step||0]};
 }
 function appointments(s){
  hydrate(s);if(s.day>90)return [];
  return quests.map(q=>current(s,q)).filter(x=>x&&s.day>=x.stage.start&&s.day<=x.stage.end)
   .map(x=>({npc:x.stage.npc,place:x.stage.place,slot:x.stage.slot,start:x.stage.start,end:x.stage.end}));
 }
 function available(s,people=[]){
  hydrate(s);if(s.day>90||s.pendingDuel)return [];
  return quests.map(q=>current(s,q)).filter(x=>x&&x.stage.place===s.location&&x.stage.slot===s.slot
   &&s.day>=x.stage.start&&s.day<=x.stage.end&&people.includes(x.stage.npc));
 }
 function byId(id){return MAP.get(id);}
 function linesFor(s,id){
  hydrate(s);const x=current(s,MAP.get(id)||{});if(!x)return [];
  const earlier=x.progress?.history?.[x.index-1],opening=x.stage.openingByFlag?.[earlier?.flag];
  return opening?[x.stage.lines[0],{speaker:x.stage.npc,text:opening},...x.stage.lines.slice(1)]:x.stage.lines;
 }
 function begin(s,id,people=[]){
  hydrate(s);
  const x=available(s,people).find(x=>x.quest.id===id);
  if(!x||s.activeSideQuest||s.activeStory||s.activeEncounter||s.activeArc||s.pendingDuel)throw Error('Side quest is not available');
  if(!s.sideQuests[id])s.sideQuests[id]={status:'active',step:0,history:[],startedDay:s.day};
  s.activeSideQuest={id,phase:'lines',index:0,choice:null};
  return x;
 }
 function applyDelta(s,d){
  if((s.credits||0)+(d.credits||0)<0)throw Error('Not enough credits for this choice');
  if((s.focus||0)+(d.focus||0)<0)throw Error('Not enough focus for this choice');
  for(const key of Object.keys(caps))if(Number.isFinite(d[key]))
   s[key]=Math.max(0,Math.min(caps[key],(s[key]||0)+d[key]));
 }
 function advance(s,x,result){
  const {quest,progress,index}=x;
  progress.history.push({step:index,day:s.day,...result});
  progress.step=index+1;
  if(progress.step===quest.stages.length){progress.status='complete';progress.completedDay=s.day;}
  s.activeSideQuest=null;
  return {done:progress.status==='complete',step:progress.step};
 }
 function finishChoice(s,id,index,people=[]){
  hydrate(s);
  const x=available(s,people).find(x=>x.quest.id===id);
  if(!x||x.stage.kind!=='talk'||!s.activeSideQuest||s.activeSideQuest.id!==id||s.activeSideQuest.phase!=='response'
   ||s.activeSideQuest.choice!==index)throw Error('Side quest choice is no longer available');
  const choice=x.stage.choices[index];if(!choice||!Number.isInteger(index))throw Error('Invalid side quest decision');
  applyDelta(s,choice.delta);
  const rel=s.relationships?.[x.stage.npc],bond=s.bonds?.[x.stage.npc];
  for(const key of ['trust','affection','respect']){
   if(Number.isFinite(choice.delta[key])){if(rel)rel[key]=(rel[key]||0)+choice.delta[key];if(bond&&(key==='trust'||key==='affection'))bond[key]=(bond[key]||0)+choice.delta[key];}
  }
  const status=advance(s,x,{choice:index,flag:choice.flag});
  return {title:x.quest.title,reply:choice.reply,...status};
 }
 function canDuel(s,id,people=[]){
  hydrate(s);const x=available(s,people).find(x=>x.quest.id===id);
  return !!x&&x.stage.kind==='duel'&&s.activeSideQuest?.id===id&&s.activeSideQuest?.phase==='duel';
 }
 function settleDuel(s,duel,receipt){
  hydrate(s);if(!duel?.sideQuestId||!receipt)return null;
  const q=MAP.get(duel.sideQuestId),x=q&&current(s,q),p=x?.progress;
  if(!x||!p||p.status!=='active'||x.index!==duel.sideQuestStage||x.stage.kind!=='duel'||x.stage.npc!==duel.npc)return null;
  const key=receipt.outcome==='Victory'?'win':receipt.outcome==='Defeat'?'loss':'draw';
  const reward=x.stage.reward[key];applyDelta(s,reward);
  const status=advance(s,x,{result:key,flag:'duel_'+key});
  if(Number.isFinite(reward.credits))receipt.credits+=reward.credits;
  return {title:q.title,credits:reward.credits||0,reward,done:status.done,
   text:key==='win'?'You gave me a real match. I lost, but this is finally my deck. Thanks for treating me like a player.':
    key==='loss'?'I won. Wait—I really won. You gave me a proper game. This means more than you know.':
    'A draw? That feels like the most honest possible ending. I would like a rematch someday.'};
 }
 function expire(s){
  hydrate(s);const missed=[];
  for(const q of quests){
   const x=current(s,q);
   if(x&&s.day>x.stage.end){
    s.sideQuests[q.id]={...(x.progress||{step:0,history:[]}),status:'missed',missedDay:s.day};
    if(s.activeSideQuest?.id===q.id)s.activeSideQuest=null;
    missed.push(q.id);
   }
  }
  return missed;
 }
 function journal(s){
  hydrate(s);
  return quests.map(q=>{
   const p=s.sideQuests[q.id];
   if(!p)return null;
   if(p.status==='complete')return {id:q.id,title:q.title,status:'complete',summary:'Completed · '+p.history.length+' chapters'};
   if(p.status==='missed')return {id:q.id,title:q.title,status:'missed',summary:'Opportunity passed'};
   const stage=q.stages[p.step];
   return {id:q.id,title:q.title,status:'active',summary:'Next: '+stage.title+' · '+stage.place+' · Days '+stage.start+'–'+stage.end};
  }).filter(Boolean);
 }
 function validate(){
  const errors=[],ids=new Set();
  for(const q of quests){
   if(ids.has(q.id))errors.push('Duplicate quest '+q.id);ids.add(q.id);
   if(q.stages.length<2)errors.push('Short quest '+q.id);
   for(const [i,s] of q.stages.entries()){
    if(!cast[s.npc]||!['talk','duel'].includes(s.kind)||s.start<1||s.end>90||s.start>s.end||s.slot<0||s.slot>2||s.lines.length<5)
     errors.push('Invalid stage '+q.id+':'+i);
    if(i&&q.stages[i-1].end>=s.end)errors.push('Bad stage ordering '+q.id+':'+i);
    if(s.kind==='talk'&&(s.choices?.length<2||s.choices.some(c=>!c.label||!c.reply||!c.flag||!c.delta)))errors.push('Invalid choices '+q.id+':'+i);
    if(s.kind==='duel'&&(!s.reward?.win||!s.reward?.loss||!s.reward?.draw))errors.push('Missing duel outcomes '+q.id);
   }
  }
  return errors;
 }
 return Object.freeze({cast,looks,schedules,arrivals,quests,byId,hydrate,appointments,available,linesFor,begin,finishChoice,canDuel,settleDuel,expire,journal,validate});
});
