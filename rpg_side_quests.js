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
   talk:['I used to think every deck needed a Charizard. I have since learned that it also needs Energy.',
    'You can tell who is new here by how carefully they pick up someone else’s cards.',
    'I am not actually afraid of losing. It is the part where people watch me lose.'],
   flirt:'Oh. Uh, I am going to pretend I heard a question about deck sleeves.',
   duelWin:'I won? I mean—good game. Sorry. That came out wrong. Good game.',
   duelLose:'I think I finally understand that losing does not mean I wasted your time.'},
  alma:{name:'Alma Serrano',age:35,deck:'lockdown',style:'Fossil Lockdown · Slow control',
   intro:'Welcome. We have coffee, tea, and a table where nobody asks about your win rate.',
   repeat:'There you are. Would you like the good chair or the one that makes you sit up straight?',
   talk:['The café gets busier when the tournaments finish. People need somewhere to feel human again.',
    'You can learn a lot from a room by watching who has to ask permission to enter.',
    'I have regulars who never touch a card. I hope they always feel welcome.'],
   flirt:'Thank you. But I charge extra for compliments delivered during the lunch rush.',
   duelWin:'Good. You gave yourself time to think. The room did not fall apart while you did.',
   duelLose:'I own a café, not a trophy shelf. I am perfectly comfortable with this result.'},
  nereo:{name:'Nereo Paz',age:29,deck:'cold_fusion',style:'Cold Fusion · Weathering the turn',
   intro:'If you are looking for the ferry schedule, it is accurate on days the river agrees.',
   repeat:'I tightened that dock railing. It has a better grip on life than I do this morning.',
   talk:['Someone once asked why I keep spare batteries in my deck box. Experience.',
    'The weather does not hate us. That would require it to know we are here.',
    'I like card games. Nobody can say the current changed halfway through a turn.'],
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
     lines:[L('elio','The sticker says “Champion.” I do not know who put it there.'),
      L('Protagonist','Is that your deck?'),L('elio','It was my cousin’s. Everybody says she was unbeatable. I have managed to lose to the practice bot.'),
      L('hana','He was going to put it back on the shelf. I said he should at least play one match with it.'),
      L('elio','I did. I did not understand half the cards. Do I have to play exactly like her?'),
      L('Protagonist','You do not have to decide that today.')],
     choices:[C('Help identify the cards he actually enjoys','Oh, these? I like how they work together. Nobody mentioned that part before.',{insight:2,credits:4,trust:1},'elio_own_list'),
      C('Show him a simple opening before changing anything','The first three turns finally made sense. I can try again now.',{preparation:1,trust:2},'elio_fundamentals')]},
    {title:'Missing Pieces',npc:'elio',place:'library',slot:0,start:19,end:34,kind:'talk',
     lines:[L('elio','I made a list of the cards I need. Apparently the good ones cost more than my rent.'),
      L('Protagonist','Did you price the deck you want, or the one people expect you to have?'),
      L('elio','...That is an annoyingly good question.'),
      L('camila','There are perfectly good commons in the free exchange box. Do not tell my customers I said that.'),
      L('elio','You would really help me build something ordinary?'),
      L('Protagonist','Ordinary is fine if you know what it is for.')],
     openingByFlag:{elio_own_list:'I tried the cards I liked. For the first time, it felt like my deck.',elio_fundamentals:'I got through three turns without asking for help. Then I lost on turn four, but still.'},
     choices:[C('Build with trades and cards already available','I can afford this. And I understand why every card is here.',{insight:2,credits:8,trust:1},'elio_budget'),
      C('Practice decision-making with bad opening hands','I hated those hands. I also stopped panicking when I drew them.',{preparation:1,respect:2},'elio_practice')]},
    {title:'No Inherited Victory',npc:'elio',place:'center',slot:1,start:35,end:53,kind:'duel',reward:{win:{credits:18,reputation:3},loss:{credits:6,insight:2},draw:{credits:8,insight:2}},
     lines:[L('elio','My cousin is here tonight. She offered to watch.'),
      L('Protagonist','Are you comfortable with that?'),
      L('elio','I think so. I used to want her to tell me what to do. Today I want to make my own mistakes.'),
      L('elio','Would you play me? Not a lesson. A proper match.'),
      L('Protagonist','No promises about going easy.'),
      L('elio','Good. I have never asked you to.')],
     openingByFlag:{elio_budget:'I finished the budget deck. The last card cost me an afternoon, not a fortune.',elio_practice:'I drew a terrible opening hand yesterday. I did not even complain. Much.'}}
   ]},
  {id:'quiet_table',title:'The Table Nobody Notices',summary:'The café is busy, but not everybody has a comfortable place to play.',
   stages:[
    {title:'One Chair Too Many',npc:'alma',place:'cafe',slot:1,start:10,end:28,kind:'talk',
     lines:[L('alma','The tournament crowd took the back table again.'),
      L('Protagonist','You sound annoyed.'),
      L('alma','It is not the crowd. One of our regulars uses a walking aid. I watched her leave when the chairs blocked the aisle.'),
      L('Protagonist','Did she tell anyone?'),
      L('alma','Why should she have to? She has been coming here longer than the circuit has existed.'),
      L('alma','I want the room to work without making her ask for an exception.')],
     choices:[C('Offer to help rearrange the furniture after closing','Good. No grand gesture; just a room that works better tomorrow.',{focus:-6,reputation:2,trust:1},'alma_layout'),
      C('Ask Alma to consult the regulars before moving anything','You are right. I know the room. They know how it feels to use it.',{insight:2,trust:2},'alma_listen')]},
    {title:'The Flyer With No Fine Print',npc:'alma',place:'center',slot:0,start:29,end:49,kind:'talk',
     lines:[L('alma','Jun printed a schedule for our quieter club evening. Beautiful font. Completely unreadable from two steps away.'),
      L('jun','I deserved that.'),
      L('Protagonist','Could you both agree on what people actually need to know?'),
      L('alma','Start times. Space to move around. Whether they can leave early without explaining themselves.'),
      L('jun','I can put that on the front. In large type.'),
      L('alma','Then we might finally be organizing a night for the people who attend it.')],
     openingByFlag:{alma_layout:'The chairs stayed where we moved them. Someone came back for the first time in weeks.',alma_listen:'We asked before moving the tables. The answers surprised me, and they made the café better.'},
     choices:[C('Make an accessible, plain-language flyer together','The next poster tells people what happens, rather than how impressive we are.',{reputation:3,insight:1,trust:1},'alma_clear'),
      C('Volunteer to welcome players at the door','I would trust you with the first hello. That matters.',{reputation:2,credits:8,trust:1},'alma_welcome')]},
    {title:'Not Just the Winners',npc:'alma',place:'cafe',slot:2,start:50,end:72,kind:'talk',
     lines:[L('alma','You missed the best part of the quiet night.'),
      L('Protagonist','The tournament?'),
      L('alma','There was no bracket. Two strangers taught each other a game. Someone came for tea and stayed for the company.'),
      L('shiori','Nobody asked how many matches anyone had won. It was rather lovely.'),
      L('alma','I am thinking of making it a permanent evening.'),
      L('Protagonist','That sounds less like an event and more like a place people can count on.')],
     openingByFlag:{alma_clear:'The plain-language poster worked. We had people walk in who thought this place was only for tournament players.',alma_welcome:'Someone asked for you by name at the door. Apparently you made the first visit less frightening.'},
     choices:[C('Offer to help set it up next season','I will put you on the rota. No heroics, just show up when you say you will.',{credits:16,reputation:3,focus:10,trust:2},'alma_regular'),
      C('Encourage Alma to let other volunteers lead too','A room that depends on one exhausted person is not welcoming for long. You are right.',{credits:10,reputation:4,insight:2},'alma_shared')]}
   ]},
  {id:'river_route',title:'The Ferry With Empty Seats',summary:'A delivery route and a tournament timetable are pulling against each other.',
   stages:[
    {title:'The Box On The Dock',npc:'nereo',place:'park',slot:0,start:20,end:38,kind:'talk',
     lines:[L('nereo','That box is not lost. It is stranded. Different problem.'),
      L('Protagonist','The cards inside are for the club?'),
      L('nereo','Starter decks. The ferry was delayed, and the organizers changed the handoff point without telling the drivers.'),
      L('iris','They told me at the last minute. I thought everyone else had heard.'),
      L('nereo','No villain here. Just five people certain they were the only one not confused.'),
      L('Protagonist','Then maybe we should get them talking.')],
     choices:[C('Help the crew write down a single delivery plan','A single plan in one place. What a radical invention.',{insight:2,trust:2},'nereo_plan'),
      C('Carry the boxes with Nereo to the temporary pickup','Your back will complain. The club kids will not.',{credits:12,focus:-8,trust:1},'nereo_carry')]},
    {title:'The Unpopular Delay',npc:'nereo',place:'shop',slot:1,start:39,end:61,kind:'talk',
     lines:[L('nereo','I told them the ferry would be late. Teo called it “The Great Harbor Disaster.”'),
      L('teo','For the record, the full title included “Probably Not a Disaster.”'),
      L('Protagonist','Can we tell people something more useful?'),
      L('nereo','Yes. The actual departure window and the backup pickup spot.'),
      L('teo','Those words are less exciting, but I suppose people can use them.'),
      L('nereo','I will settle for them getting home before dark.')],
     openingByFlag:{nereo_plan:'The written handoff worked. The tide was still late, but nobody was guessing where to stand.',nereo_carry:'I was right about your back. I was also right about the kids being happy with the decks.'},
     choices:[C('Ask Teo to announce the clear route updates','Fine. No dramatic music this time. I can be useful on purpose.',{reputation:2,credits:8,trust:1},'nereo_notice'),
      C('Set up a paper noticeboard as a backup','The board still works when the phones lose signal. Beautiful technology.',{insight:2,reputation:2,trust:1},'nereo_board')]},
    {title:'The Last Crossing',npc:'nereo',place:'park',slot:2,start:62,end:85,kind:'talk',
     lines:[L('nereo','People got across the river. The tournament started on time. Nobody thanked the timetable.'),
      L('Protagonist','Should they?'),
      L('nereo','No. A system working quietly is its own reward.'),
      L('marina','I would still like to thank the people who stayed after dark and helped.'),
      L('nereo','All right. That I will take.'),
      L('Protagonist','You sound almost pleased.'),
      L('nereo','Do not ruin it by telling anyone.')],
     openingByFlag:{nereo_notice:'The announcements went out in time. Teo only used the words “dramatic rescue” once.',nereo_board:'Someone taped a thank-you to the noticeboard. I am pretending not to have kept it.'},
     choices:[C('Organize an ordinary thank-you meal for the crew','No speeches? No awards? Perfect. I will bring the chairs.',{credits:18,reputation:3,focus:8,trust:1},'nereo_meal'),
      C('Help set up the same system for next season','You might have just saved us three dozen unnecessary phone calls.',{insight:3,reputation:4,preparation:1},'nereo_next')]}
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
    ||(s.activeSideQuest.phase==='lines'&&(!Number.isInteger(s.activeSideQuest.index)||s.activeSideQuest.index<0||s.activeSideQuest.index>=stage.lines.length))
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
  return opening?[{...x.stage.lines[0],text:opening},...x.stage.lines.slice(1)]:x.stage.lines;
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
