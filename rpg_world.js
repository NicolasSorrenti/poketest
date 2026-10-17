'use strict';
/* Neo Harbor's location activities and missable everyday encounters.
   Rules live outside the TCG engine and the browser view. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgWorld=api;
})(typeof window!=='undefined'?window:null,function(){
 const activities=[
 {id:'home_reflect',place:'home',slots:[0,1,2],title:'Review your duel journal',cost:0,focus:5,change:{insight:2,preparation:1},text:'You find a better line of play in the notes from your recent matches.'},
 {id:'home_recharge',place:'home',slots:[0,1,2],title:'Take a proper break',cost:0,focus:0,change:{focus:30},text:'The apartment is quiet. A proper break makes tomorrow feel manageable.'},
 {id:'shop_shift',place:'shop',slots:[0,1],title:'Help behind the counter',cost:0,focus:12,change:{credits:18,reputation:1},npc:'hana',bond:{trust:1},text:'A steady shift earns credits and earns you a reputation for reliability.'},
 {id:'shop_trade',place:'shop',slots:[1,2],title:'Study the trading binder',cost:0,focus:8,change:{insight:2,reputation:1},npc:'camila',bond:{affection:1},text:'You learn why the most memorable trades are about people, not prices.'},
 {id:'arcade_combo',place:'arcade',slots:[1,2],title:'Run the combo challenge',cost:5,focus:10,change:{insight:2,preparation:1},npc:'yuna',bond:{affection:1},text:'A spectacular failure teaches you almost as much as a spectacular success.'},
 {id:'arcade_scores',place:'arcade',slots:[1,2],title:'Climb the score board',cost:4,focus:12,change:{reputation:2,insight:1},npc:'kaede',bond:{respect:1},text:'Your name moves upward. A few of the regulars start paying attention.'},
 {id:'park_walk',place:'park',slots:[0,1,2],title:'Walk along the waterfront',cost:0,focus:0,change:{focus:20},npc:'marina',bond:{trust:1},text:'The river gives you a much-needed moment away from competitive play.'},
 {id:'park_flyers',place:'park',slots:[0,1],title:'Help with community flyers',cost:0,focus:8,change:{reputation:2,credits:6},npc:'hana',bond:{affection:1},text:'A small afternoon favor reminds the neighborhood that you are part of it.'},
 {id:'cafe_shift',place:'cafe',slots:[0,1],title:'Cover the café rush',cost:0,focus:14,change:{credits:16,reputation:1},npc:'camila',bond:{trust:1},text:'It is not glamorous, but the café rush pays and brings new acquaintances.'},
 {id:'cafe_listen',place:'cafe',slots:[1,2],title:'Join the strategy table',cost:3,focus:7,change:{insight:2,focus:3},npc:'shiori',bond:{affection:1},text:'A conversation over warm drinks becomes an unexpectedly useful lesson.'},
 {id:'center_scrimmage',place:'center',slots:[1,2],title:'Practice tournament openings',cost:0,focus:15,change:{preparation:2,insight:1},npc:'reina',bond:{respect:1},text:'You run the difficult opening hands again and again until they feel familiar.'},
 {id:'center_volunteer',place:'center',slots:[0,1],title:'Volunteer at the duel tables',cost:0,focus:10,change:{credits:8,reputation:3},npc:'akari',bond:{trust:1},text:'You learn the tempo of a tournament from the people running it.'},
 {id:'library_research',place:'library',slots:[0,1],title:'Research historical matchups',cost:0,focus:10,change:{insight:3,preparation:1},npc:'akari',bond:{respect:1},text:'Old tournament reports reveal a weakness you had overlooked.'},
 {id:'library_read',place:'library',slots:[0,1,2],title:'Find some quiet and read',cost:0,focus:0,change:{focus:16,insight:1},npc:'shiori',bond:{trust:1},text:'The quiet makes it easier to think through the season ahead.'}
 ];
 function choice(label,reply,delta){return {label,reply,delta};}
 const encounters=[
 {id:'shop_opening',place:'shop',npc:'hana',start:3,end:17,slots:[0],minBond:0,title:'Before the Doors Open',intro:'A pile of unopened boxes is balanced precariously behind the counter. Someone looks relieved to see a familiar face.',choices:[
  choice('Stay to help', 'The shelves look much better with two people working.',{reputation:1,trust:2,affection:1,focus:-6}),
  choice('Show a quicker way to organize', 'An improvised system makes the morning surprisingly easy.',{insight:2,respect:1,affection:1})]},
 {id:'shop_trade_night',place:'shop',npc:'camila',start:19,end:36,slots:[1,2],minBond:1,title:'The Unusual Trade',intro:'A collector hesitates over two cards while the regulars gather to watch.',choices:[
  choice('Make a fair proposal','Everyone leaves smiling, which feels like a victory.',{trust:2,reputation:2,credits:-5}),
  choice('Ask what the card means to them','The answer changes the whole conversation.',{affection:2,insight:1})]},
 {id:'shop_late_match',place:'shop',npc:'reina',start:62,end:82,slots:[1,2],minBond:2,title:'An Empty Practice Table',intro:'The last table is still set for a match, though the crowd has gone.',choices:[
  choice('Offer to test difficult hands','There is no audience, just an honest exchange of ideas.',{respect:2,preparation:1,focus:-8}),
  choice('Suggest a break from competition','The evening ends in rare, comfortable silence.',{affection:2,trust:1})]},
 {id:'arcade_joke',place:'arcade',npc:'yuna',start:7,end:23,slots:[1,2],minBond:0,title:'One More Attempt',intro:'A ridiculous deck experiment draws a curious crowd.',choices:[
  choice('Join the experiment','The results are chaotic and surprisingly educational.',{affection:2,insight:1}),
  choice('Offer some tactical advice','A tiny adjustment produces a spectacular result.',{respect:1,preparation:1,trust:1})]},
 {id:'arcade_challenge',place:'arcade',npc:'kaede',start:44,end:65,slots:[1,2],minBond:0,title:'The New Challenger',intro:'An unfamiliar competitor has taken over the corner table, looking unimpressed.',choices:[
  choice('Welcome her to the scene','A hint of a smile suggests the welcome landed.',{affection:1,trust:2}),
  choice('Discuss the toughest opponents','Now she seems genuinely interested.',{respect:2,insight:1})]},
 {id:'park_riverside',place:'park',npc:'marina',start:8,end:27,slots:[0,2],minBond:0,title:'By the Water',intro:'The riverside path is unusually peaceful, even with a busy circuit week approaching.',choices:[
  choice('Enjoy the quiet together','It is a relief to spend time without chasing a result.',{trust:2,focus:12}),
  choice('Ask about her next challenge','An honest conversation leaves both of you a little braver.',{affection:1,respect:1,preparation:1})]},
 {id:'park_communal',place:'park',npc:null,start:18,end:42,slots:[0,1],minBond:0,title:'A Neighborhood Favor',intro:'A few volunteers are setting up the park for a community event.',choices:[
  choice('Give them a hand','Neighbors start recognizing you for something beyond your deck.',{reputation:3,focus:-8}),
  choice('Share a few spare supplies','A small contribution makes a surprisingly big difference.',{reputation:2,credits:-6,insight:1})]},
 {id:'cafe_old_story',place:'cafe',npc:'shiori',start:17,end:36,slots:[0,2],minBond:1,title:'An Old Photograph',intro:'A faded picture on the wall starts an unexpected conversation.',choices:[
  choice('Listen without pressing','Some memories are best shared slowly.',{trust:2,affection:1}),
  choice('Offer a new perspective','The conversation continues long after the drinks go cold.',{respect:2,insight:1})]},
 {id:'cafe_neighbors',place:'cafe',npc:null,start:28,end:58,slots:[1],minBond:0,title:'The Regulars’ Table',intro:'A few local players are debating which strategy defines the town.',choices:[
  choice('Join the discussion','Your name starts turning up in conversations around the circuit.',{reputation:2,insight:1}),
  choice('Offer to buy a round of snacks','You hear an impressive number of terrible deck ideas.',{credits:-7,reputation:2,focus:5})]},
 {id:'cafe_trade',place:'cafe',npc:'camila',start:62,end:81,slots:[2],minBond:2,title:'No Business Tonight',intro:'For once, there are no cards on the café table.',choices:[
  choice('Ask how she is doing','An ordinary question turns into an unexpectedly sincere evening.',{trust:2,affection:1}),
  choice('Tell her about your own worries','An unguarded moment brings an equal measure of honesty.',{affection:2,trust:1})]},
 {id:'center_coach',place:'center',npc:'reina',start:11,end:32,slots:[1,2],minBond:0,title:'Training Partners',intro:'The practice room is still open, and a fierce player is looking for a challenge.',choices:[
  choice('Ask her to critique your game','The criticism is brutal, precise and useful.',{respect:2,preparation:1,focus:-8}),
  choice('Encourage her to take a break','You get a rare laugh instead of another lecture.',{affection:2,focus:5})]},
 {id:'center_volunteers',place:'center',npc:'akari',start:48,end:70,slots:[1],minBond:1,title:'The Results Board',intro:'Someone has been comparing the circuit rankings with a very complicated spreadsheet.',choices:[
  choice('Help check the rankings','The numbers are useful, but the teamwork is better.',{trust:1,respect:1,insight:2}),
  choice('Suggest a different way to measure progress','An unexpectedly thoughtful discussion follows.',{affection:1,respect:2})]},
 {id:'library_notes',place:'library',npc:'akari',start:13,end:35,slots:[0,1],minBond:0,title:'Margin Notes',intro:'Someone has covered an otherwise ordinary match report in tiny annotations.',choices:[
  choice('Study the pattern together','A fresh calculation improves both your plans.',{trust:1,insight:2,preparation:1}),
  choice('Question the key assumption','The disagreement ends in a respectful smile.',{respect:2,affection:1})]},
 {id:'library_silence',place:'library',npc:'shiori',start:48,end:74,slots:[0,1,2],minBond:1,title:'The Quiet Corner',intro:'An otherwise deserted reading room has one occupied table.',choices:[
  choice('Share a quiet hour','The silence feels companionable rather than empty.',{trust:2,focus:10}),
  choice('Exchange favorite books','A new topic creates a natural reason to meet again.',{affection:2,insight:1})]},
 {id:'home_postcard',place:'home',npc:null,start:10,end:28,slots:[2],minBond:0,title:'A Postcard From Home',intro:'There is a handwritten note waiting on your desk.',choices:[
  choice('Write an honest reply','Putting your thoughts into words helps you see the season clearly.',{focus:15,insight:2}),
  choice('Pin it beside your tournament calendar','A little encouragement makes the next day easier.',{focus:25,reputation:1})]},
 {id:'home_reflection',place:'home',npc:null,start:60,end:83,slots:[0,2],minBond:0,title:'The Unmarked Date',intro:'There is one more blank page in your journal than you expected.',choices:[
  choice('List what has changed','The progress that matters extends beyond the rankings.',{insight:3,focus:10}),
  choice('Make time for the people who matter','You leave the page open as a reminder.',{focus:20,reputation:1})]}
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
  state.relationships=state.relationships||{};
  if(!state.relationships[id])state.relationships[id]={affection:0,trust:0,respect:0,attraction:0,duels:0};
  const target=state.relationships[id];
  state.bonds=state.bonds||{};if(!state.bonds[id])state.bonds[id]={affection:0,trust:0,duels:0};
  for(const stat of ['affection','trust','respect','attraction'])if(Number.isFinite(delta[stat])){
   target[stat]=Math.max(0,(target[stat]||0)+delta[stat]);
   if(stat==='affection'||stat==='trust')state.bonds[id][stat]=target[stat];
  }
 }
 function activityReason(state,entry){
  if(state.day>90)return 'The circuit season has ended';
  if(entry.place!==state.location||!entry.slots.includes(state.slot))return 'Not here at this time';
  if(state.activityDone[state.day+':'+entry.id])return 'Already completed today';
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
  return {id:a.id,person:withNpc,summary:a.text,spent:1,reward:a.change};
 }
 function availableEncounters(state,people=[]){
  hydrate(state);
  if(state.day>90)return [];
  return encounters.filter(e=>e.place===state.location&&e.start<=state.day&&state.day<=e.end&&e.slots.includes(state.slot)&&!state.encountersDone[e.id]&&(!e.npc||people.includes(e.npc))&&(!e.npc||(state.relationships?.[e.npc]?.affection||0)>=e.minBond));
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
  const earned=receipt.outcome==='Victory'?(spentPrep?5:0):0;
  const rep=receipt.outcome==='Victory'?2:receipt.outcome==='Draw'?1:0;
  modify(state,{credits:earned,reputation:rep,focus:-10});
  receipt.credits=(receipt.credits||0)+earned;receipt.trainingBonus=earned;
  return earned?'Your preparation earned 5 extra credits and your reputation grew.':rep?'Your reputation grew after the duel.':'You learned from the duel, even without a victory.';
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
  }
  return faults;
 }
 return Object.freeze({activities,encounters,byEncounter:id=>EVENTS.get(id),hydrate,activitiesAt,doActivity,availableEncounters,completeEncounter,newDay,afterDuel,validate});
});
