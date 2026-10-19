'use strict';
(()=>{
const $=id=>document.getElementById(id),KEY='neoHarborRpgV1',STORY=window.NeoHarborStory,SCHEDULES=window.NeoRpgSchedules,WORLD=window.NeoRpgWorld,ARC=window.NeoRpgRivalArc,TOURNAMENTS=window.NeoRpgTournaments,BRIDGE=window.NeoRpgDuelBridge;
const PACK=window.NeoRpgNarrativePack,SIDE=window.NeoRpgSideQuests,EPILOGUE=window.NeoRpgEpilogue,APPOINTMENTS=window.NeoRpgAppointments,INTENTIONS=window.NeoRpgIntentions,CG=window.NeoRpgCGGallery,PLANNER=window.NeoRpgDailyPlanner,SOCIAL=window.NeoRpgSocialActivities,DATES=window.NeoRpgPlannedDates,PRE=window.NeoRpgPreDuel,SITUATIONS=window.NeoRpgSituations;
const periods=['Morning','Afternoon','Evening'];
const places={
 home:['Your Apartment','Your base during the championship season.'],
 shop:['The Lucky Draw','Booster packs, friendly duels and the local card scene.'],
 arcade:['Pixel Palace','Bright cabinets, bold challenges and unconventional strategies.'],
 park:['Riverside Park','Some conversations are easier away from tournament tables.'],
 cafe:['The Rest Stop','A cozy place for coffee, gossip and late-day plans.'],
 center:['Community Center','The official circuit board, matches and local rankings.'],
 library:['Town Library','Strategy notes, quiet study and borrowed books.']
};
const cast={
 hana:{name:'Hana Mizuno',age:20,deck:'power_reserve',style:'Wigglytuff · Teamwork',locs:['shop','cafe','park'],slots:[0,1],days:[1,2,3,4,5,6],intro:'Oh! You must be our new challenger. Welcome to Neo Harbor!',repeat:'You made it! I was hoping I would run into you again.',talk:['I still think the best deck is one that makes all your Pokémon feel useful.','Everybody is talking about the next cup. No pressure, right?','You know, the card shop gets surprisingly quiet in the mornings.'],flirt:'That was unexpectedly sweet. You should warn me before you say things like that.',duelWin:'You won! You are fitting in frighteningly fast.',duelLose:'That was fun! We should play again soon.'},
 reina:{name:'Reina Kurogane',age:21,deck:'blackout',style:'Haymaker · Aggression',locs:['shop','center'],slots:[1,2],days:[1,2,3,4,5,6],intro:'So you are the challenger who came here to win it all. Big words.',repeat:'Back again? Good. I would hate to run out of competition.',talk:['Good players practice openings. Great players practice recovering from bad openings.','I hear you have been talking to the other regulars. Focus is a skill, too.','You want my respect? Earn it across the table.'],flirt:'You always talk this much before a match? I could get used to it.',duelWin:'Fine. That was a good game. Enjoy the win while it lasts.',duelLose:'You are improving. Not quickly enough, but improving.'},
 shiori:{name:'Shiori Tsukishima',age:23,deck:'overgrowth',style:'Damage Swap · Defense',locs:['cafe','library','park'],slots:[0,2],days:[2,4,6],intro:'You are new here. You seem to know exactly why you came.',repeat:'A pleasant coincidence. Would you like to talk?',talk:['A thoughtful match is a conversation neither player can control completely.','There is something peaceful about watching a match from a distance.','Winning can teach you something. So can the silence afterward.'],flirt:'You are unexpectedly direct. I shall remember that.',duelWin:'A thoughtful performance. Thank you for the match.',duelLose:'You saw more of the position than you realize.'},
 yuna:{name:'Yuna Hoshino',age:19,deck:'zap',style:'Clefable · Surprise',locs:['arcade','shop'],slots:[1,2],days:[1,3,5,6,0],intro:'New face! Excellent. My audience was getting bored of me winning.',repeat:'Hey, challenger! I have at least three questionable ideas today.',talk:['A card that surprises you is never a bad card. Okay, usually.','If the plan fails, that just means the next plan will be funnier.','You know what this deck needs? Another completely unreasonable combo.'],flirt:'Whoa, that was smoother than my last combo. And it actually worked!',duelWin:'Okay, okay. I demand an extremely theatrical rematch.',duelLose:'I knew it! The chaos strategy is scientifically sound!'},
 akari:{name:'Akari Fujimoto',age:22,deck:'gym_new_voltage',style:'Slowking · Denial',locs:['library','center','cafe'],slots:[0,1],days:[1,2,4,5],intro:'The newcomer? Your opening statistics will be interesting to study.',repeat:'I have revised my evaluation of your playstyle.',talk:['Every deck reveals an assumption about its pilot.','A small improvement to consistency is often worth more than a spectacular trick.','Your previous results contain several fascinating anomalies.'],flirt:'I... did not have an appropriate response prepared.',duelWin:'An intriguing result. I will revise my assumptions.',duelLose:'Predictable? Perhaps. But consistency is a kind of elegance.'},
 camila:{name:'Camila Vega',age:24,deck:'rocket_lab',style:'Dark Vileplume · Control',locs:['shop','cafe'],slots:[1,2],days:[2,3,4,5,6],intro:'A new collector in my favorite town. How delightful.',repeat:'Ah, my favorite potential business partner.',talk:['Rare cards are only as interesting as the stories behind them.','A good trade leaves both people wondering who got the better deal.','You look like somebody who has learned to hide a good hand.'],flirt:'Careful, darling. I might believe you.',duelWin:'An expensive lesson. Fortunately, I collect those too.',duelLose:'That was a lovely demonstration of leverage.'},
 marina:{name:'Marina Aoki',age:21,deck:'water_blast',style:'Rain Dance · Setup',locs:['park','cafe'],slots:[0,2],days:[0,2,3,5,6],intro:'Oh, hello. There is usually room for one more along the water.',repeat:'It is nice to see you again. The river is particularly beautiful today.',talk:['Some decks need time before you see what they can really do.','I like coming here when the competition becomes too loud.','I keep telling myself that tomorrow is a good day to try something new.'],flirt:'That is a wonderful thing to say. Thank you.',duelWin:'You played beautifully. I enjoyed watching your plan come together.',duelLose:'Maybe patience really is worth something after all.'},
 kaede:{name:'Kaede Arashi',age:22,deck:'rocket_lab',style:'Dark Pokémon · Disruption',locs:['arcade','center','park'],slots:[1,2],days:[0,1,3,4,6],start:40,intro:'So you are the local hotshot? Cute town you have here.',repeat:'Still trying to figure me out? Keep trying.',talk:['Reputations are just stories that got repeated too many times.','I came here for strong opponents, not polite applause.','Sometimes the best move is the one nobody expects you to make.'],flirt:'Heh. You are going to be trouble, aren’t you?',duelWin:'Not bad. You might actually be fun.',duelLose:'That expression on your face? Worth the trip.'}
};
Object.assign(cast,PACK.cast,SIDE.cast);
for(const [id,look] of Object.entries({...PACK.looks,...SIDE.looks}))if(cast[id])cast[id].appearance=look;
const eventCards=[{day:7,slot:1,place:'arcade',title:'Arcade Friendly Cup',reward:7},{day:14,slot:1,place:'center',title:'Club Exhibition',reward:9},{day:21,slot:2,place:'shop',title:'Card Shop Night',reward:8},{day:30,slot:1,place:'center',title:'Neighborhood Cup',reward:15},{day:42,slot:1,place:'arcade',title:'Open Challenge',reward:10},{day:60,slot:1,place:'center',title:'Regional Qualifier',reward:22},{day:75,slot:2,place:'shop',title:'Final Practice Meet',reward:12},{day:88,slot:1,place:'center',title:'Championship Opening',reward:20},{day:90,slot:1,place:'center',title:'Championship Finale Exhibition',reward:25}];


function eligibleStories(){return STORY.available(state);}
function startStory(id){
 if(state.activeSituation||state.activeSideQuest||state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel)return;
 const e=eligibleStories().find(e=>e.id===id);if(!e)return;
 state.selected=e.npc;state.activeStory={id:e.id,phase:'lines',index:0,choice:null};persist();render();
}
function renderStory(){
 const a=state.activeStory,e=STORY.byId(a.id);
 if(!e){state.activeStory=null;persist();return null;}
 if(a.phase==='lines'){
  const lines=STORY.linesFor(state,e.id),line=lines[Math.min(a.index,lines.length-1)];
  return {speaker:line.speaker==='Protagonist'?'You':(cast[line.speaker]?.name|| (line.speaker===e.npc?cast[e.npc].name:line.speaker)),line:line.text,choices:[[a.index<lines.length-1?'Continue ›':'Respond ›','storyNext']]};
 }
 if(a.phase==='choice')return {speaker:cast[e.npc].name,line:'How will you respond?',choices:e.choices.map((c,i)=>[c.label,'storyChoice:'+i])};
 const chosen=e.choices[a.choice];
 return {speaker:cast[e.npc].name,line:chosen.reply,choices:[['Finish scene · ⏳ 1 period','storyFinish']]};
}
function advanceStory(){
 const a=state.activeStory;if(!a||a.phase!=='lines')return;
 const e=STORY.byId(a.id);a.index++;if(a.index>=STORY.linesFor(state,e.id).length)a.phase='choice';
 persist();render();
}
function chooseStory(raw){
 const a=state.activeStory;if(!a||a.phase!=='choice')return;
 const index=Number(raw),e=STORY.byId(a.id),choice=e.choices[index];
 if(!choice||!Number.isInteger(index))return;
 if(choice.kind==='commit'&&((state.partner&&state.partner!==e.npc)||state.relationships[e.npc].trust<3||state.relationships[e.npc].affection<6)){
  $('notice').textContent=state.partner&&state.partner!==e.npc?'You have already committed to another relationship.':'You need a stronger bond before taking this step.';return;
 }
 a.phase='response';a.choice=index;persist();render();
}
function finishStory(){
 const a=state.activeStory;if(!a||a.phase!=='response')return;
 const e=STORY.byId(a.id);
 let result;try{result=STORY.resolve(state,a.id,a.choice)}catch(err){$('notice').textContent=err.message;return;}
 const id=e.npc,bond=state.bonds[id],updated=state.relationships[id];
 for(const metric of ['affection','trust','duels'])bond[metric]=Math.max(bond[metric]||0,updated[metric]||0);
 log('A memorable afternoon with '+cast[id].name+'.');recordCG('story_milestone',id);recordIntention('story');
 state.activeStory=null;advance();state.selected=id;
 persist();say(cast[id].name,result.choice.reply);
}


function beginSideQuest(id){
 if(state.activeSituation||state.activeSideQuest||state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel||state.day>90)return;
 try{const x=SIDE.begin(state,id,currentPeople());state.selected=x.stage.npc;persist();render();}
 catch(err){$('notice').textContent=err.message;}
}
function showSideQuest(){
 const a=state.activeSideQuest,x=SIDE.byId(a?.id),p=state.sideQuests[a?.id],e=x?.stages[p?.step];
 if(!e){state.activeSideQuest=null;persist();return null;}
 if(a.phase==='lines'){
  const lines=SIDE.linesFor(state,a.id),line=lines[Math.min(a.index,lines.length-1)];
  return {speaker:line.speaker==='Protagonist'?'You':cast[line.speaker]?.name||line.speaker,line:line.text,choices:[[a.index<lines.length-1?'Continue ›':'Respond ›','sideNext']]};
 }
 if(a.phase==='duel')return {speaker:cast[e.npc].name,line:'Ready for a real match? No special rules, no going easy.',choices:[['Play the match · ⏳ 1 period','sideDuel'],['Not right now · free','sidePause']]};
 if(a.phase==='choice')return {speaker:cast[e.npc].name,line:'What would you suggest?',choices:e.choices.map((c,i)=>[c.label,'sideChoice:'+i])};
 return {speaker:cast[e.npc].name,line:e.choices[a.choice].reply,choices:[['Finish chapter · ⏳ 1 period','sideFinish']]};
}
function nextSideQuest(){
 const a=state.activeSideQuest;if(!a||a.phase!=='lines')return;
 const x=SIDE.byId(a.id),lineCount=SIDE.linesFor(state,a.id).length;
 a.index++;
 if(a.index>=lineCount)a.phase=x.stages[state.sideQuests[a.id].step].kind==='duel'?'duel':'choice';
 persist();render();
}
function chooseSideQuest(raw){
 const a=state.activeSideQuest;if(!a||a.phase!=='choice')return;
 const x=SIDE.byId(a.id),stage=x.stages[state.sideQuests[a.id].step],i=Number(raw),choice=stage.choices?.[i];
 if(!Number.isInteger(i)||!choice)return;
 if(state.credits+(choice.delta.credits||0)<0||state.focus+(choice.delta.focus||0)<0){
  $('notice').textContent='Not enough credits or focus for that choice.';return;
 }
 a.phase='response';a.choice=i;persist();render();
}
function finishSideQuest(){
 const a=state.activeSideQuest;if(!a||a.phase!=='response')return;
 const x=SIDE.byId(a.id),i=a.choice,owner=x.stages[state.sideQuests[a.id].step].npc;
 let result;try{result=SIDE.finishChoice(state,a.id,i,currentPeople());}
 catch(err){$('notice').textContent=err.message;return;}
 log((result.done?'Completed':'Progressed')+' side quest: '+result.title+'.');recordIntention('sideQuest');
 advance();persist();say(cast[owner].name,result.reply);
}
function pauseSideQuest(){
 if(state.activeSideQuest?.phase!=='duel')return;
 state.activeSideQuest=null;persist();say('Narrator','You agree to return when you are ready to play. No time has passed.');
}

function timeFlash(beforeDay,beforeSlot){const overlay=document.createElement('div');overlay.className='notice-pop';const heading=document.createElement('b');heading.textContent=state.day>90?'Season complete':state.day!==beforeDay?'A NEW DAY BEGINS':'TIME PASSES';const body=document.createElement('span');body.textContent=state.day>90?'Day 90 has ended.':('Day '+state.day+' · '+periods[state.slot]);overlay.append(heading,body);document.body.append(overlay);overlay.addEventListener('animationend',()=>overlay.remove());}

function defaults(){return {sideQuests:{},activeSideQuest:null,day:1,slot:0,location:'home',metReina:false,reinaTrust:0,reinaDuels:0,results:[],flags:{intro:false},journal:['The 90-day season begins.'],pendingDuel:null,bonds:{},talked:{},hungOut:{},eventsDone:{},points:0,credits:80,playerDeck:'blackout',selected:null,ended:false,storyDone:{},storyMissed:{},relationships:{},routeOutcomes:{},partner:null,activeStory:null,activeEncounter:null,activeArc:null,arcFlags:{},arcOutcomes:{},activityDone:{},encountersDone:{},focus:75,insight:0,reputation:0,preparation:0,lastDuelReceipt:null,tournaments:{},campaignHistory:[],ngPlus:0,appointments:[],appointmentSeq:0,scene:null,socialHistory:{},situationDone:{},activeSituation:null}}
let state;try{state=JSON.parse(localStorage.getItem(KEY))||defaults();if(!Number.isInteger(state.day)||state.day<1||state.day>91)throw Error('Invalid save');}catch{state=defaults()}
for(const [k,v] of Object.entries(defaults()))if(state[k]===undefined)state[k]=v;
if(!Array.isArray(state.campaignHistory))state.campaignHistory=[];
if(!Number.isInteger(state.ngPlus)||state.ngPlus<0)state.ngPlus=0;
if(!places[state.location])state.location='home';
if(!Number.isInteger(state.slot)||state.slot<0||state.slot>2)state.slot=0;
for(const k of ['results','journal'])if(!Array.isArray(state[k]))state[k]=defaults()[k];
for(const k of ['flags','bonds','talked','hungOut','eventsDone','storyDone','storyMissed','relationships','routeOutcomes'])if(!state[k]||typeof state[k]!=='object'||Array.isArray(state[k]))state[k]={};
if(!state.pendingDuel?.id||!cast[state.pendingDuel?.npc])state.pendingDuel=null;
if(state.pendingDuel)PRE.hydrate(state.pendingDuel);
for(const id of Object.keys(cast)){if(!state.bonds[id])state.bonds[id]={affection:0,trust:0,duels:0};}
STORY.normalize(state);
WORLD.hydrate(state);
SIDE.hydrate(state);
SIDE.expire(state);
ARC.hydrate(state);
// Restored saves may already be beyond an optional cup's registration window.
TOURNAMENTS.expire(state);
APPOINTMENTS.hydrate(state);APPOINTMENTS.expire(state);INTENTIONS.hydrate(state);CG.hydrate(state);SOCIAL.hydrate(state);DATES.hydrate(state,APPOINTMENTS,SOCIAL);SITUATIONS.hydrate(state);
for(const id of Object.keys(cast)){const old=state.bonds[id],current=state.relationships[id];
 if(!state.flags['newStoryMigrated_'+id]){for(const key of ['affection','trust','duels'])current[key]=Math.max(current[key]||0,old[key]||0);
 state.flags['newStoryMigrated_'+id]=true;}
}
if(typeof state.activeStory==='string')state.activeStory=null;
STORY.recordExpiry(state);
const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));
const log=t=>{state.journal.unshift(t);state.journal=state.journal.slice(0,25)};
function recordIntention(kind){const result=INTENTIONS.record(state,kind);if(result)log('Daily priority fulfilled: '+result.title+' ('+result.rewardLabel+').');}
function recordCG(kind,npc,context=null){const entries=CG.record(state,kind,npc,context);if(entries.length)log(entries.length+' new memory illustration'+(entries.length===1?'':'s')+' unlocked for the CG Gallery.');return entries;}
let scene=state.scene&&typeof state.scene.speaker==='string'&&typeof state.scene.line==='string'&&Array.isArray(state.scene.choices)?state.scene:{speaker:'Narrator',line:'Ninety days. One championship. You came to Neo Harbor to win. Everyone else has their own plans.',choices:[]};
const atKey=(id)=>state.day+':'+state.slot+':'+id;
function advance(n=1){const beforeDay=state.day,beforeSlot=state.slot;for(let i=0;i<n;i++){state.slot++;if(state.slot>=3){state.slot=0;state.day++;}}if(state.day>90){state.day=91;state.ended=true;log('The Neo Harbor championship season has ended.');}
state.selected=null;
if(state.day>beforeDay)WORLD.newDay(state,state.day-beforeDay);
const expiredCups=TOURNAMENTS.expire(state);if(expiredCups.length)log('A tournament registration window has closed.');
const missed=STORY.recordExpiry(state);if(missed.length)log('Some opportunities in town passed while you were busy.');
const missedQuests=SIDE.expire(state);if(missedQuests.length)log('A local side-quest opportunity passed while you were away.');
const missedAppointments=APPOINTMENTS.expire(state);
INTENTIONS.hydrate(state); // Expire yesterday's optional choice before saving the new day.
for(const plan of missedAppointments)log('You missed your planned meet-up with '+(cast[plan.npc]?.name||'a trainer')+'.');
persist();timeFlash(beforeDay,beforeSlot);}
function say(speaker,line,choices=[]){scene={speaker,line,choices};state.scene=scene;persist();render();}
function publicAppointments(place){return [...APPOINTMENTS.overrides(state),...STORY.available(state,place),...SIDE.appointments(state)];}
function currentPeople(){if(state.day>90)return [];const regular=SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location));
for(const e of eligibleStories())if(!regular.includes(e.npc))regular.push(e.npc);
return regular;}
function selectPerson(id){if(state.activeSituation||state.activeStory||state.activeEncounter||state.activeArc||!cast[id]||!currentPeople().includes(id))return;const c=cast[id],first=!state['met_'+id]&&!((id==='reina')&&state.metReina);state['met_'+id]=true;if(id==='reina')state.metReina=true;state.selected=id;const memories=recordCG('meet',id);persist();say(c.name,first?c.intro:c.repeat,options(id));showCGMoment(memories[0]);}
function options(id){const key=atKey(id),spentToday=!!state.hungOut[state.day+':'+id];
 const booked=APPOINTMENTS.active(state).find(e=>e.npc===id);
 return [
 [booked?'Meet-up scheduled · check upcoming plans':'Invite to a future meet-up · free',booked?'plans':'invite:'+id],
 [booked?'A meeting is already planned':'Plan an activity or date · free',booked?'plans':'dateInvite:'+id],
 ['Ask about their routine · free','where:'+id],
 [state.talked[key]?'Talk again · free (bond already earned)':'Talk · free · +1 affection','talk:'+id],
 [spentToday?'Shared outing completed today':'Choose a shared activity · ⏳ 1 period','socialPlan:'+id],
 [spentToday?'Already spent time today · free':'Spend time together · ⏳ 1 period · +2 affection / +1 trust','hang:'+id],
 ['Challenge to a duel · ⏳ 1 period · earn points, credits & trust','duel:'+id],
 [state.talked['flirt:'+key]?'Playful remark again · free':'Playful remark · free · +1 affection','flirt:'+id],
 ['Goodbye · free','close']
 ];}

function plannedDateSlots(id){
 const times=APPOINTMENTS.proposed(state,id,SCHEDULES);
 const choices=times.map((time,i)=>['Day '+time.day+' · '+periods[time.slot]+' · '+places[time.place][0]+' · choose activity','dateSlot:'+id+':'+i]);
 choices.push(['Back to conversation · free','back:'+id]);
 return choices;
}
function sharedActivityChoices(id){
 const available=SOCIAL.options(state,id,currentPeople(),cast);
 return [...available.map(a=>[
   a.title+' · '+(a.affinity==='favorite'?'♥ Favorite':a.affinity==='neutral'?'● Familiar':'◇ Something new')
   +' · ⏳ 1 period · '+a.focus+' focus'+(a.credits?' + '+a.credits+' credits':'')
   +(a.disabledReason?' · '+a.disabledReason:''),
   'socialDo:'+id+':'+a.id
 ]),['Back to conversation · free','back:'+id]];
}
function planSharedActivity(id){
 if(!cast[id]||!currentPeople().includes(id))return;
 const choices=sharedActivityChoices(id);
 if(!choices.length)return say(cast[id].name,'We could plan something another time.',options(id));
 const hint='What shall we do together? Favorite activities deepen our bond; rival-style practice builds respect. '
  +'Trying something different is worthwhile too, and varying plans keeps them fresh.';
 return say(cast[id].name,hint,choices);
}
function showEncounter(){
 const a=state.activeEncounter,e=a&&WORLD.byEncounter(a.id);
 if(!e)return null;
 const name=e.npc?cast[e.npc].name:'Neo Harbor';
 if(a.phase==='choice')return {speaker:name,line:e.intro,choices:e.choices.map((c,i)=>[c.label,'encounterChoice:'+i])};
 const decision=e.choices[a.choice];
 return {speaker:name,line:decision.reply,choices:[['Continue · ⏳ 1 period','encounterFinish']]};
}
function startEncounter(id){
 if(state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel||state.day>90)return;
 const e=WORLD.availableEncounters(state,currentPeople()).find(x=>x.id===id);if(!e)return;
 state.activeEncounter={id,phase:'choice',choice:null};state.selected=e.npc||null;persist();render();
}
function chooseEncounter(value){
 const a=state.activeEncounter;if(!a||a.phase!=='choice')return;
 const e=WORLD.byEncounter(a.id),index=Number(value);
 if(!Number.isInteger(index)||!e?.choices[index])return;
 const price=e.choices[index].delta.credits||0;
 if(state.credits+price<0){$('notice').textContent='This choice costs more credits than you have.';return;}
 a.phase='response';a.choice=index;persist();render();
}
function finishEncounter(){
 const a=state.activeEncounter;if(!a||a.phase!=='response')return;
 const e=WORLD.byEncounter(a.id);let report;
 try{report=WORLD.completeEncounter(state,a.id,a.choice,currentPeople());}
 catch(err){$('notice').textContent=err.message;return;}
 state.activeEncounter=null;recordIntention('encounter');log('An everyday encounter at '+places[e.place][0]+' left an impression.');
 advance();persist();
 say(e.npc?cast[e.npc].name:'Narrator',report.summary);
}
function performActivity(id){
 if(state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel||state.day>90)return;
 let result;try{result=WORLD.doActivity(state,id,currentPeople());}
 catch(err){$('notice').textContent=err.message;return;}
 const place=state.location;
 log('Activity completed at '+places[place][0]+': '+result.summary);recordIntention('activity');
 advance();persist();say(result.person?cast[result.person].name:'Narrator',result.summary+(result.person?' You also made a good impression.':''));
}


function startArc(id){
 if(state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel||state.day>90)return;
 const e=ARC.available(state,currentPeople()).find(x=>x.id===id);if(!e)return;
 state.activeArc={id,phase:'lines',index:0,choice:null};state.selected='reina';persist();render();
}
function showArc(){
 const a=state.activeArc,e=a&&ARC.byId(a.id);
 if(!e){state.activeArc=null;persist();return null;}
 if(a.phase==='lines'){
  const lines=ARC.linesFor(state,a.id),line=lines[Math.min(a.index,lines.length-1)];
  return {speaker:line[0]==='You'?'You':line[0],line:line[1],choices:[[a.index<lines.length-1?'Continue ›':'Respond ›','arcNext']]};
 }
 if(a.phase==='choice')return {speaker:cast.reina.name,line:e.duel?'Do you want to play the match now?':'How will you answer?',choices:e.choices.map((choice,i)=>[choice.label,'arcChoice:'+i])};
 return {speaker:cast.reina.name,line:e.choices[a.choice].reply,choices:[['Finish conversation · ⏳ 1 period','arcFinish']]};
}
function advanceArc(){
 const a=state.activeArc;if(!a||a.phase!=='lines')return;
 const lines=ARC.linesFor(state,a.id);a.index++;
 if(a.index>=lines.length)a.phase='choice';
 persist();render();
}
function chooseArc(raw){
 const a=state.activeArc;if(!a||a.phase!=='choice')return;
 const e=ARC.byId(a.id),index=Number(raw),choice=e?.choices[index];
 if(!Number.isInteger(index)||!choice)return;
 if(choice.decline){
  state.activeArc=null;state.selected=null;persist();
  return say(cast.reina.name,'Then we will find another evening. I want you at your best.');
 }
 if(choice.duel){
  if(e.id!=='reina_rival_trial')return;
  startDuel('reina',null,e.id);
  return;
 }
 a.phase='response';a.choice=index;persist();render();
}
function finishArc(){
 const a=state.activeArc;if(!a||a.phase!=='response')return;
 let report;try{report=ARC.finish(state,a.id,a.choice,currentPeople());}
 catch(err){$('notice').textContent=err.message;return;}
 const id=a.id;
 state.activeArc=null;
 log('A meaningful conversation with '+cast.reina.name+' brought the rivalry forward.');recordIntention('arc');
 if(report.ending)log('A personal chapter reached its conclusion.');
 advance();persist();
 say(cast.reina.name,report.text);
}


function showSituation(){
 const a=state.activeSituation,e=SITUATIONS.byId(a?.id);
 if(!e)return null;
 if(a.phase==='choice')return {speaker:cast[e.npc]?.name||'Trainer',line:e.intro,
  choices:[...e.options.map((o,i)=>[o.label+' · ⏳ 1 period · '+e.focusCost+' focus','situationChoice:'+i]),['Not now · free','situationCancel']]};
 return {speaker:cast[e.npc]?.name||'Trainer',line:e.options[a.choice].response,
  choices:[['Save this memory · ⏳ 1 period','situationFinish'],['Leave this moment · free','situationCancel']]};
}
function beginSituation(id){
 if(state.activeSituation||state.activeStory||state.activeSideQuest||state.activeArc||state.activeEncounter||state.pendingDuel)return;
 try{const e=SITUATIONS.start(state,id,currentPeople());state.selected=e.npc;persist();render();}
 catch(err){$('notice').textContent=err.message;}
}
function chooseSituation(raw){
 if(!state.activeSituation)return;
 try{SITUATIONS.choose(state,Number(raw));persist();render();}
 catch(err){$('notice').textContent=err.message;}
}
function finishSituation(){
 const event=SITUATIONS.byId(state.activeSituation?.id);
 if(!event)return;
 try{
  const outcome=SITUATIONS.finish(state,currentPeople());
  log('An unexpected moment with '+cast[event.npc].name+': '+event.title+'.');
  recordIntention('hangout');
  const memories=recordCG('situation',event.npc,{eventId:event.id});
  advance();
  say(cast[event.npc].name,outcome.response);
  showCGMoment(memories[0]);
 }catch(err){$('notice').textContent=err.message;}
}

function scheduleEvent(){return eventCards.find(e=>e.day===state.day&&e.slot===state.slot&&e.place===state.location&&!state.eventsDone[e.day+':'+e.title]);}
function act(action){
 const [type,id,part]=action.split(':');
 if(type==='situationCancel'){state.activeSituation=null;state.selected=null;return say('Narrator','You decide to leave the moment for another time. No time passes.');}
 if(type==='situationChoice')return chooseSituation(id);
 if(type==='situationFinish')return finishSituation();
 if(type==='situation')return beginSituation(id);
 if(type==='sideNext')return nextSideQuest();
 if(type==='sideChoice')return chooseSideQuest(id);
 if(type==='sideFinish')return finishSideQuest();
 if(type==='sideDuel'){
  const a=state.activeSideQuest,q=a&&SIDE.byId(a.id),stage=q?.stages[state.sideQuests[a.id]?.step];
  if(stage&&SIDE.canDuel(state,a.id,currentPeople()))return startDuel(stage.npc,null,null,null,{id:a.id,step:state.sideQuests[a.id].step});
  return;
 }
 if(type==='sidePause')return pauseSideQuest();
 if(type==='storyNext')return advanceStory();
 if(type==='storyChoice')return chooseStory(id);
 if(type==='storyFinish')return finishStory();
 if(type==='encounterChoice')return chooseEncounter(id);
 if(type==='encounterFinish')return finishEncounter();
 if(type==='arcNext')return advanceArc();
 if(type==='arcChoice')return chooseArc(id);
 if(type==='arcFinish')return finishArc();
 if(state.activeSituation||state.activeStory||state.pendingDuel||state.activeEncounter||state.activeArc||state.activeSideQuest)return;

 if(type==='dateInvite'){
  if(!cast[id]||!currentPeople().includes(id))return;
  const choices=plannedDateSlots(id);
  return say(cast[id].name,choices.length===1?'I cannot commit to another meeting yet.':'Let us choose a day and plan what to do together.',
    choices.length===1?options(id):choices);
 }
 if(type==='dateSlot'){
  if(!cast[id]||!currentPeople().includes(id))return;
  const target=APPOINTMENTS.proposed(state,id,SCHEDULES)[Number(part)];
  if(!target)return say(cast[id].name,'That opening is gone.',plannedDateSlots(id));
  const choices=DATES.options(state,id,target.place,SOCIAL,cast).map(a=>[
   a.title+' · '+(a.affinity==='favorite'?'♥ Favorite':a.affinity==='neutral'?'● Familiar':'◇ New experience')
    +' · '+a.focus+' focus'+(a.credits?' + '+a.credits+' credits':'')+' when we meet',
   'dateActivity:'+id+':'+part+':'+a.id
  ]);
  choices.push(['Choose another day · free','dateInvite:'+id]);
  return say(cast[id].name,'What should we do at '+places[target.place][0]+'? Costs are paid on arrival.',choices);
 }
 if(type==='dateActivity'){
  if(!cast[id]||!currentPeople().includes(id))return;
  const [,npc,index,activityId]=action.split(':');
  const target=APPOINTMENTS.proposed(state,id,SCHEDULES)[Number(index)];
  if(!target)return say(cast[id].name,'That time is unavailable.',plannedDateSlots(id));
  const activity=DATES.options(state,id,target.place,SOCIAL,cast).find(a=>a.id===activityId);
  if(!activity)return say(cast[id].name,'That activity cannot happen at this venue.',plannedDateSlots(id));
  const choices=DATES.choices(state,id,target.place,activityId,SOCIAL,cast).map(t=>[
   t.label+' · '+t.detail+(t.disabledReason?' · '+t.disabledReason:''),
   'dateBook:'+id+':'+index+':'+activityId+':'+t.id
  ]);
  choices.push(['Choose another activity · free','dateSlot:'+id+':'+index]);
  return say(cast[id].name,'How would you like to spend this time together?',choices);
 }
 if(type==='dateBook'){
  if(!cast[id]||!currentPeople().includes(id))return;
  const [,npc,index,activityId,tone]=action.split(':');
  const target=APPOINTMENTS.proposed(state,id,SCHEDULES)[Number(index)];
  if(!target)return say(cast[id].name,'That meeting time has passed.',plannedDateSlots(id));
  try{
   const plan=DATES.book(state,{npc:id,day:target.day,slot:target.slot,place:target.place,activityId,tone},
    {appointments:APPOINTMENTS,schedules:SCHEDULES,social:SOCIAL,cast});
   persist();
   return say(cast[id].name,'It is a plan! Day '+plan.day+', '+periods[plan.slot].toLowerCase()+' at '+places[plan.place][0]+
    '. We will '+(tone==='romantic'?'go on a date':tone==='rivalry'?'enjoy a friendly challenge':'spend time as friends')+'.',options(id));
  }catch(err){return say(cast[id].name,err.message,plannedDateSlots(id));}
 }
 if(type==='socialPlan')return planSharedActivity(id);
 if(type==='socialDo'){
  if(!cast[id]||!currentPeople().includes(id))return;
  try{
   const outcome=SOCIAL.complete(state,id,part,currentPeople(),cast);
   log('Shared '+outcome.title.toLowerCase()+' with '+cast[id].name
     +' · +'+outcome.affection+' affection, +'+outcome.trust+' trust, +'+outcome.respect+' respect.');
   recordIntention('hangout');
   const memories=recordCG('hangout',id);
   advance();
   say(cast[id].name,outcome.line);
   showCGMoment(memories[0]);return;
  }catch(err){
   return say(cast[id].name,err.message,sharedActivityChoices(id));
  }
 }
 if(type==='intention'){
  try{const goal=INTENTIONS.choose(state,id);log('Today’s priority: '+goal.title+'.');persist();render();}
  catch(err){$('notice').textContent=err.message;}
  return;
 }
 if(type==='sideQuest')return beginSideQuest(id);
 if(type==='arc')return startArc(id);
 if(type==='encounter')return startEncounter(id);
 if(type==='townActivity')return performActivity(id);
 if(type==='calendar')return openCalendar();
 if(type==='plans')return say('Planner','Your booked meet-ups appear under UPCOMING PLANS. Travel there at the agreed time; the appointment itself uses one period.');
 if(type==='back'&&cast[id])return say(cast[id].name,'Where were we?',options(id));
 if(type==='invite'){
  if(!cast[id]||!currentPeople().includes(id))return;
  const dates=APPOINTMENTS.proposed(state,id,SCHEDULES);
  if(!dates.length)return say(cast[id].name,'My schedule is rather full right now. Maybe ask again after our current plans.');
  const choices=dates.map((time,i)=>['Day '+time.day+' · '+periods[time.slot]+' · '+places[time.place][0]+' · free to book','book:'+id+':'+i]);
  choices.push(['Maybe another time','back:'+id]);
  return say(cast[id].name,'There are a few openings in my schedule. When should we meet?',choices);
 }
 if(type==='book'){
  if(!cast[id]||!currentPeople().includes(id))return;
  const chosen=APPOINTMENTS.proposed(state,id,SCHEDULES)[Number(part)];
  if(!chosen)return say(cast[id].name,'That opening is no longer available.',options(id));
  try{
   APPOINTMENTS.book(state,id,chosen.day,chosen.slot,chosen.place,SCHEDULES);
   persist();return say(cast[id].name,'Great! Day '+chosen.day+', '+periods[chosen.slot].toLowerCase()+' at '+places[chosen.place][0]+'. I will be there.',options(id));
  }catch(err){return say(cast[id].name,err.message,options(id));}
 }
 if(type==='attend'){
  const number=Number(id),plan=APPOINTMENTS.active(state).find(e=>e.id===number);
  if(!plan)return;
  const person=cast[plan.npc];
  try{
   const outcome=DATES.attend(state,number,currentPeople(),{appointments:APPOINTMENTS,social:SOCIAL,cast});
   recordIntention('appointment');
   log('Kept '+(outcome.tone==='romantic'?'a date':outcome.tone==='rivalry'?'a friendly challenge':'a friendship outing')+' with '+(person?.name||'a trainer')+'.');
   const memories=recordCG('appointment',plan.npc);
   if(!outcome.legacy)for(const cg of recordCG('hangout',plan.npc))if(!memories.some(x=>x.id===cg.id))memories.push(cg);
   advance();
   say(person?.name||'Trainer',outcome.line);
   showCGMoment(memories[0]);return;
  }catch(err){$('notice').textContent=err.message;return;}
 }
 if(type==='cancelPlan'){
  const plan=APPOINTMENTS.active(state).find(e=>e.id===Number(id));if(!plan)return;
  try{APPOINTMENTS.cancel(state,plan.id);persist();return say('Planner','You cancelled the meet-up in advance. No one was kept waiting.');}
  catch(err){$('notice').textContent=err.message;return;}
 }
 if(type==='home'){state.location='home';state.selected=null;persist();return say('Narrator','Back home. The championship posters on the wall remind you why you came.');}
 if(type==='where'){const c=cast[id],visit=SCHEDULES.nextVisit(id,state.day,state.slot,[]);return say('Narrator',c.name+(visit?' is usually around '+places[visit.place][0]+' on day '+visit.day+', '+periods[visit.slot]+'.':' has no announced public visits in the coming week.'),options(id));}
 if(type==='sleep'){if(state.location!=='home')return;const n=3-state.slot;advance(n);return say('Narrator','You wake up to a new day in Neo Harbor.');}
 if(type==='close'){state.selected=null;persist();return say('Narrator','The town has a rhythm of its own. You are beginning to hear it.');}
 if(type==='duel')return startDuel(id||state.selected,false);
 if(type==='cup'){try{const match=TOURNAMENTS.begin(state,id);return startDuel(match.npc,null,null,match);}catch(err){return say('Tournament Desk',err.message);}}
 if(type==='event'){const e=scheduleEvent();if(!e)return;const opponents={7:'yuna',14:'reina',21:'hana',30:'reina',42:'kaede',60:'akari',75:'camila',88:'reina',90:'shiori'};return startDuel(opponents[e.day]||'reina',e);}
 if(type==='work')return performActivity('shop_shift');
 if(type==='practice')return state.location==='library'?performActivity('library_research'):state.location==='center'?performActivity('center_scrimmage'):performActivity('home_reflect');
 if(type==='rest'){if(state.day>90)return;advance();return say('Narrator','You take a break. Other lives in the town carry on.');}
 if(type==='replay'){
  if(!EPILOGUE.completed(state))return;
  if(confirm('Start New Game+? Your completed season report will be archived. Relationships, standings and credits will reset.')){
   const keepCG=JSON.parse(JSON.stringify({cgUnlocked:state.cgUnlocked,cgViewed:state.cgViewed}));
   state=EPILOGUE.replay(state,defaults);Object.assign(state,keepCG);CG.hydrate(state);persist();location.reload();
  }
  return;
 }
 if(type==='new'){if(confirm('Start a new season? This overwrites this browser save.')){state=defaults();for(const id of Object.keys(cast))state.bonds[id]={affection:0,trust:0,duels:0};persist();location.reload();}return;}
 if(!cast[id]||!currentPeople().includes(id))return say('Narrator','They have already moved on. Try another time.');
 const c=cast[id],bond=state.bonds[id],key=atKey(id);
 if(type==='talk'){if(!state.talked[key]){state.talked[key]=true;bond.affection++;state.relationships[id].affection++;}persist();return say(c.name,c.talk[(state.day+bond.duels+bond.affection)%c.talk.length],options(id));}
 if(type==='flirt'){if(!state.talked['flirt:'+key]){state.talked['flirt:'+key]=true;bond.affection++;state.relationships[id].affection++;state.relationships[id].attraction++;}persist();return say(c.name,c.flirt,options(id));}
 if(type==='hang'){if(state.hungOut[state.day+':'+id])return say(c.name,'I enjoyed our time today. Let us make plans another day.',options(id));state.hungOut[state.day+':'+id]=true;bond.affection+=2;bond.trust++;state.relationships[id].affection+=2;state.relationships[id].trust++;log('Spent time with '+c.name+'.');recordIntention('hangout');const memories=recordCG('hangout',id);advance();state.selected=null;say(c.name,Array.isArray(c.hangouts)&&c.hangouts.length?c.hangouts[(state.day+bond.duels)%c.hangouts.length]:'That was a lovely way to spend part of the day. See you around.');showCGMoment(memories[0]);return;}
}
function duelUrl(duel){return '/classic_live.html?rpg=1&duelId='+encodeURIComponent(duel.id)+'&deck='+encodeURIComponent(duel.playerDeck)+'&opponent='+encodeURIComponent(duel.opponent)+'&npc='+encodeURIComponent(duel.npc)+'&npcName='+encodeURIComponent(cast[duel.npc].name);}

function describePreparedDuel(){
 return PRE.describe(state,state.pendingDuel,{cast,places,cg:CG,tournaments:TOURNAMENTS});
}
function showPreparedDuel(){
 const pending=state.pendingDuel;
 if(!PRE.isReady(pending))return;
 const preview=describePreparedDuel();
 if(!preview)return;
 const modal=$('preDuelDialog'),art=$('preDuelArt');art.replaceChildren();
 $('preDuelContext').textContent=preview.stake;
 $('preDuelOpponent').textContent=preview.name;
 $('preDuelDeck').textContent=preview.deckLabel+' · '+preview.place;
 const line=preview.lines[pending.preview.index];
 $('preDuelSpeaker').textContent=line.speaker;
 $('preDuelLine').textContent=line.text;
 $('preDuelNext').hidden=pending.preview.index>=preview.lines.length-1;
 $('preDuelStart').hidden=pending.preview.index<preview.lines.length-1;
 const placeholder=document.createElement('span');placeholder.className='preduel-placeholder';
 placeholder.textContent='✦ '+preview.name+' · '+preview.place;
 art.append(placeholder);
 // Existing canonical portrait always serves as the artwork fallback.
 const face=makeAvatar(preview.npc);face.className+=' preduel-portrait';art.append(face);
 if(preview.artwork?.path){
  const photo=document.createElement('img');
  photo.className='preduel-cg';photo.alt=preview.artwork.title;
  photo.onload=()=>{
   if(!PRE.isReady(state.pendingDuel)||state.pendingDuel.id!==preview.id)return;
   art.replaceChildren(photo);
  };
  photo.onerror=()=>{}; // Keep the portrait and scene dialogue if art is absent.
  photo.src=preview.artwork.path;
 }
 if(!modal.open)modal.showModal();
}
function advancePreparedDuel(){
 if(!PRE.advance(state.pendingDuel))return;
 persist();showPreparedDuel();
}
function launchPreparedDuel(){
 const pending=state.pendingDuel;
 if(!PRE.launch(pending))return;
 recordCG('before_duel',pending.npc);
 persist();
 if($('preDuelDialog').open)$('preDuelDialog').close();
 render();
 $('duel').hidden=false;
 $('battle').src=duelUrl(pending);
}

function startDuel(id,exhibition=null,arcEpisode=null,tournament=null,sideQuest=null){
 if(state.activeSituation||state.activeStory||state.activeEncounter||(state.activeArc&&state.activeArc.id!==arcEpisode)||(state.activeSideQuest&&state.activeSideQuest.id!==sideQuest?.id)||state.pendingDuel||state.day>90||!cast[id]||(!exhibition&&!tournament&&!currentPeople().includes(id)))return;
 if(sideQuest&&(!SIDE.canDuel(state,sideQuest.id,currentPeople())||SIDE.byId(sideQuest.id)?.stages[sideQuest.step]?.npc!==id))return;
 if(arcEpisode&&(!state.activeArc||state.activeArc.phase!=='choice'||!ARC.available(state,currentPeople()).some(e=>e.id===arcEpisode)))return;
 const c=cast[id];
 state.pendingDuel={id:'npc-'+id+'-'+state.day+'-'+state.slot+'-'+state.results.length,npc:id,day:state.day,slot:state.slot,opponent:c.deck,playerDeck:state.playerDeck,resolved:false,eventKey:exhibition?exhibition.day+':'+exhibition.title:null,eventReward:exhibition?exhibition.reward:0,eventTitle:exhibition?exhibition.title:null,arcEpisode:arcEpisode||null,tournamentId:tournament?.tournamentId||null,tournamentRound:tournament?.tournamentRound??null,tournamentAttempt:tournament?.tournamentAttempt??null,sideQuestId:sideQuest?.id||null,sideQuestStage:sideQuest?.step??null};
 if(arcEpisode)state.activeArc=null;
 PRE.stage(state.pendingDuel);
 persist();render();
 $('duel').hidden=true;$('battle').src='about:blank';
 showPreparedDuel();
}
window.addEventListener('message',ev=>{
 const duel=state.pendingDuel;
 if(PRE.isReady(duel)||!BRIDGE.accepts(ev,location.origin,$('battle').contentWindow,duel))return;
 const receipt=BRIDGE.settle(state,duel,ev.data.winner,cast[duel.npc].name);
 if(!receipt)return;
 for(const note of receipt.notes)log(note);
 const preparationNote=WORLD.afterDuel(state,receipt);if(preparationNote)log(preparationNote);
 recordIntention('duel');
 const cupOutcome=duel.tournamentId?TOURNAMENTS.settle(state,duel,receipt):null;
 if(cupOutcome){
  receipt.points+=cupOutcome.points;
  receipt.credits+=cupOutcome.credits;
  receipt.tournamentBonus={points:cupOutcome.points,credits:cupOutcome.credits,state:cupOutcome.state,round:cupOutcome.round};
  log(cupOutcome.title+': '+(cupOutcome.draw?'round drawn — replay available':cupOutcome.won?'round won':'eliminated')+'.');
 }
 recordCG('after_duel',duel.npc);
 const personalOutcome=duel.arcEpisode?ARC.settleDuel(state,duel.arcEpisode,receipt):null;
  const sideOutcome=duel.sideQuestId?SIDE.settleDuel(state,duel,receipt):null;
  if(sideOutcome)log('Completed side quest: '+sideOutcome.title+'.');
 if(personalOutcome)log('A special rivalry challenge reached its result.');
 state.lastDuelReceipt=receipt;state.pendingDuel=null;
 sessionStorage.removeItem(BRIDGE.sessionKey(duel.id));
 advance();$('duel').hidden=true;$('battle').src='about:blank';
 const c=cast[duel.npc];say(c.name,sideOutcome?.text||personalOutcome|| (receipt.outcome==='Victory'?c.duelWin:receipt.outcome==='Draw'?'A hard-fought draw. Let us play again.':c.duelLose));
});
function renderAppointments(locked){
 const root=$('appointments');root.replaceChildren();
 const plans=APPOINTMENTS.active(state);
 if(!plans.length){const note=document.createElement('p');note.className='empty-note';note.textContent='No plans yet. Talk to someone in town to arrange a future meet-up.';root.append(note);return;}
 for(const meeting of plans){
  const entry=document.createElement('div');entry.className='meeting-card';
  const name=document.createElement('strong');name.textContent=cast[meeting.npc]?.name||meeting.npc;
  const detail=document.createElement('small');detail.textContent='DAY '+meeting.day+' · '+periods[meeting.slot]+' · '+places[meeting.place]?.[0];
  entry.append(name,detail);
  if(meeting.activityId){
   const a=SOCIAL.activities.find(x=>x.id===meeting.activityId);
   if(a){
    const note=document.createElement('small');note.className='meeting-plan';
    note.textContent=(meeting.socialTone==='romantic'?'♥ DATE':meeting.socialTone==='rivalry'?'⚔ CHALLENGE':'● FRIENDS')+
      ' · '+a.title+' · '+a.focus+' focus'+(a.credits?' + '+a.credits+' credits':'')+' when we meet';
    entry.append(note);
   }
  }
  const ready=meeting.day===state.day&&meeting.slot===state.slot;
  const controls=document.createElement('div');controls.className='meeting-actions';
  if(ready){
   if(meeting.place===state.location){
    const attend=document.createElement('button');attend.className='meeting-attend';
    attend.textContent=meeting.socialTone==='romantic'?'Go on date · ⏳':meeting.activityId?'Enjoy outing · ⏳':'Meet now · ⏳';
    const reason=DATES.canAttend(state,meeting,currentPeople(),{appointments:APPOINTMENTS,social:SOCIAL,cast});
    attend.disabled=locked||!!reason;if(reason)attend.title=reason;
    attend.onclick=()=>act('attend:'+meeting.id);controls.append(attend);
   }else{
    const travel=document.createElement('button');travel.className='meeting-attend';travel.textContent='Go there · free';travel.disabled=locked;travel.onclick=()=>{
     state.location=meeting.place;state.selected=null;persist();say('Planner','You arrive for your planned meet-up.');};controls.append(travel);
   }
  }else{
   const cancel=document.createElement('button');cancel.className='meeting-cancel';cancel.textContent='Cancel · free';cancel.disabled=locked;cancel.onclick=()=>act('cancelPlan:'+meeting.id);controls.append(cancel);
  }
  entry.append(controls);root.append(entry);
 }
}


function plannerDependencies(){return {schedules:SCHEDULES,appointments:APPOINTMENTS,story:STORY,side:SIDE,world:WORLD,
 tournaments:TOURNAMENTS,intentions:INTENTIONS,arc:ARC,social:SOCIAL,situations:SITUATIONS,cast,places,eventCards};}
function openPlannerSuggestion(id){
 const locked=!!state.activeSituation||!!state.activeStory||!!state.activeEncounter||!!state.activeArc||!!state.activeSideQuest||!!state.pendingDuel;
 if(locked||state.day>90)return;
 // Revalidate before taking a UI action: no stale appointment / NPC / event shortcuts.
 const pick=PLANNER.recommend(state,plannerDependencies()).find(x=>x.id===id);
 if(!pick||pick.timing!=='now'||!places[pick.place])return;
 if(pick.place!==state.location){
  state.location=pick.place;state.selected=null;persist();
  say('Planner','You head to '+places[pick.place][0]+'. '+places[pick.place][1]+' No time has passed.');
 }else{
  const section=$(pick.focusId);
  section?.scrollIntoView?.({behavior:'smooth',block:'nearest'});
  $('notice').textContent='This opportunity is available here. Choose its action below when you are ready.';
 }
}
function renderPlanner(locked){
 const root=$('dailyPlanner');root.replaceChildren();
 if(state.day>90){
  const p=document.createElement('p');p.className='planner-empty';p.textContent='Your 90-day season is complete. See your report and gallery.';root.append(p);return;
 }
 if(locked){
  const p=document.createElement('p');p.className='planner-empty';p.textContent='Finish your current scene or duel to explore more opportunities.';root.append(p);return;
 }
 const suggestions=PLANNER.recommend(state,plannerDependencies());
 if(!suggestions.length){
  const p=document.createElement('p');p.className='planner-empty';p.textContent='Nothing urgent right now. Explore, practice, or take a well-earned break.';root.append(p);return;
 }
 for(const item of suggestions){
  const card=document.createElement('div');card.className='planner-card'+(item.timing==='upcoming'?' planner-soon':'');
  const meta=document.createElement('small');meta.className='planner-meta';
  meta.textContent=item.timing==='upcoming'?'COMING UP · DAY '+item.day+' · '+periods[item.slot]:
    (item.place===state.location?'HERE NOW':'FREE TRAVEL')+' · '+(item.timeCost?'⏳ 1 PERIOD':'FREE');
  const heading=document.createElement('strong');heading.textContent=item.title;
  const desc=document.createElement('p');desc.textContent=item.detail;
  card.append(meta,heading,desc);
  if(item.action!=='none'){
   const b=document.createElement('button');b.className='planner-action';b.textContent=item.action==='travel'?'Go to '+places[item.place][0]+' · free':'Show me where · free';
   b.onclick=()=>openPlannerSuggestion(item.id);card.append(b);
  }
  root.append(card);
 }
}
function renderDailyIntention(locked){
 const root=$('dailyIntention');root.replaceChildren();
 const progress=INTENTIONS.status(state);
 const summary=document.createElement('p');summary.className='intention-summary';
 if(state.day>90){
  summary.textContent='The season is complete. '+progress.completedCount+' daily priorities fulfilled.';
  root.append(summary);return;
 }
 if(!progress.chosen){
  summary.textContent='Choose one focus for today. It is optional, and any result counts for duels.';
  root.append(summary);
  for(const goal of INTENTIONS.goals){
   const button=document.createElement('button');button.className='intention-choice';button.disabled=locked;
   const title=document.createElement('strong');title.textContent=goal.title;
   const detail=document.createElement('small');detail.textContent=goal.detail;
   const reward=document.createElement('span');reward.className='intention-reward';reward.textContent=goal.rewardLabel;
   button.append(title,detail,reward);button.onclick=()=>act('intention:'+goal.id);root.append(button);
  }
 }else{
  const goal=progress.selected;
  const card=document.createElement('div');card.className='intention-active'+(progress.completed?' complete':'');
  const title=document.createElement('strong');title.textContent=(progress.completed?'✓ COMPLETED · ':'◷ TODAY · ')+goal.title;
  const detail=document.createElement('p');detail.textContent=progress.completed?'You made progress on your own terms. Tomorrow brings a new choice.':goal.detail;
  const reward=document.createElement('small');reward.textContent='REWARD · '+goal.rewardLabel;
  card.append(title,detail,reward);root.append(card);
 }
 const count=document.createElement('small');count.className='intention-count';count.textContent=progress.completedCount+' priorities completed this season · resets tomorrow';
 root.append(count);
}

function showCGMoment(entry){
 if(!entry||!CG.unlocked(state,entry.id))return;
 const photo=document.createElement('img');
 // An absent art file must never interrupt a duel, hangout, or story beat.
 photo.onload=()=>{
  if(entry.category==='pre_duel'&&!state.pendingDuel)return;
  const modal=$('cgMoment'),root=$('cgMomentArt');root.replaceChildren(photo);
  $('cgMomentTitle').textContent=entry.title;
  $('cgMomentCaption').textContent=cast[entry.character]?.name||entry.character;
  CG.markViewed(state,entry.id);persist();
  if(!modal.open)modal.showModal();
 };
 photo.onerror=()=>{};
 photo.alt=entry.title;photo.src=entry.path;
}
function showGalleryDetail(entry){
 const root=$('galleryPreview');root.replaceChildren();
 const title=document.createElement('h3');title.textContent=entry.title;
 const text=document.createElement('p');text.textContent=(cast[entry.character]?.name||entry.character)+' · '+entry.category.replace('_',' ')+' · '+entry.hint;
 const image=document.createElement('img');image.alt=entry.title;
 const placeholder=document.createElement('p');placeholder.className='cg-pending';placeholder.textContent='Illustration not installed yet — the memory is unlocked, and its image is assigned to the art agent.';
 image.onload=()=>{placeholder.hidden=true;image.hidden=false;};
 image.onerror=()=>{image.hidden=true;placeholder.hidden=false;};
 image.src=entry.path;
 root.append(title,text,image,placeholder);
 CG.markViewed(state,entry.id);persist();
}
function renderGallery(){
 const root=$('galleryGrid');root.replaceChildren();
 const all=CG.gallery(state,{character:$('galleryCharacter').value,category:$('galleryCategory').value});
 const unlocked=all.filter(e=>e.unlocked).length;
 $('galleryCount').textContent=unlocked+' / '+all.length+' memories unlocked · unopened images appear after the art pack is installed';
 for(const entry of all){
  const tile=document.createElement('button');tile.className='cg-tile'+(entry.unlocked?' unlocked':' locked');tile.disabled=!entry.unlocked;
  const thumb=document.createElement('div');thumb.className='cg-thumb';
  if(entry.unlocked){
   const img=document.createElement('img');img.alt='';
   img.onerror=()=>{img.hidden=true;};
   img.src=entry.thumb;thumb.append(img);
  }else{
   const mystery=document.createElement('span');mystery.textContent='?';thumb.append(mystery);
  }
  const title=document.createElement('strong');title.textContent=entry.title;
  const note=document.createElement('small');note.textContent=(cast[entry.character]?.name||entry.character)+' · '+(entry.unlocked?'View memory':'Locked · '+entry.hint);
  tile.append(thumb,title,note);tile.onclick=()=>showGalleryDetail(entry);root.append(tile);
 }
}
function openGallery(){
 $('galleryPreview').replaceChildren();renderGallery();$('galleryDialog').showModal();
}

function renderBracketProgress(){
 const root=$('bracketProgress');root.replaceChildren();
 for(const cup of TOURNAMENTS.cups){
  const step=TOURNAMENTS.status(state,cup.id),card=document.createElement('div');
  card.className='bracket-card '+(step.state==='champion'?'bracket-champion':step.state==='eliminated'?'bracket-eliminated':'');
  const title=document.createElement('strong');title.textContent=cup.title;
  const label=document.createElement('small');
  if(step.state==='champion')label.textContent='🏆 CHAMPION · 3 / 3 wins';
  else if(step.state==='eliminated')label.textContent='Eliminated · '+step.round+' round'+(step.round===1?'':'s')+' won';
  else if(step.state==='expired'||step.state==='missed')label.textContent='Registration closed';
  else if(state.day<cup.day)label.textContent='Opens Day '+cup.day+' · at '+places[cup.place][0];
  else if(state.day>cup.end)label.textContent='Registration closed';
  else label.textContent='Round '+(step.round+1)+' / 3 · '+cast[step.opponent].name;
  const track=document.createElement('div');track.className='bracket-track';
  for(let i=0;i<cup.rounds.length;i++){
   const round=document.createElement('span');
   round.className='bracket-step '+(i<step.round?'cleared':i===step.round&&step.state==='open'&&state.day>=cup.day&&state.day<=cup.end?'current':'');
   round.textContent=i<step.round?'✓':String(i+1);
   round.title='Round '+(i+1)+(i<step.round?' · won':'');
   track.append(round);
  }
  card.append(title,label,track);root.append(card);
 }
}

function openCalendar(){
 const root=$('calendarEntries');root.replaceChildren();
 for(const e of eventCards.filter(e=>e.day>=state.day).slice(0,8)){
  const p=document.createElement('div');p.className='calendar-entry';
  p.textContent='DAY '+e.day+' · '+periods[e.slot]+' · '+e.title+' · '+places[e.place][0];root.append(p);
 }
 for(const cup of TOURNAMENTS.cups){
  const progress=TOURNAMENTS.status(state,cup.id);
  const entry=document.createElement('div');entry.className='calendar-entry';
  const description=progress.state==='champion'?'CHAMPION':progress.state==='eliminated'?'ELIMINATED':progress.state==='expired'||progress.state==='missed'?'REGISTRATION CLOSED':progress.round?'ROUND '+(progress.round+1)+'/3':'REGISTRATION';
  entry.textContent=cup.title+' · Days '+cup.day+'–'+cup.end+' · '+description;
  root.append(entry);
 }
 const info=document.createElement('p');info.className='empty-note';info.textContent='Tournament matches use real TCG duels. Wins advance the bracket, defeats eliminate, draws allow a rematch. Other personal encounters remain discoverable.';root.append(info);
 $('calendarDialog').showModal();
}
function makeAvatar(id,size=''){
 const img=document.createElement('img');img.src='/rpg-assets/'+id+'.png';img.alt=cast[id].name;img.loading='lazy';
 img.onerror=()=>{img.style.display='none';const span=document.createElement('span');span.className='avatar-fallback';span.textContent=cast[id].name.split(' ').map(x=>x[0]).join('');img.parentElement.append(span);};
 return img;
}
function renderSeasonReport(){
 const root=$('endSeason');root.replaceChildren();
 const complete=EPILOGUE.completed(state);
 root.hidden=!complete;
 if(!complete)return;
 const r=EPILOGUE.report(state);
 root.className='campaign-complete season-finale';
 const heading=document.createElement('h2');heading.textContent=r.title;
 const preface=document.createElement('p');preface.className='finale-subtitle';
 preface.textContent='NEO HARBOR · SEASON '+r.run+' · DAY 90 / 90';
 const closing=document.createElement('p');closing.className='finale-closing';closing.textContent=r.closing;
 const numbers=document.createElement('div');numbers.className='finale-stats';
 const details=[['Duels',r.played],['Victories',r.wins],['Draws',r.draws],['Circuit points',r.points],['Stories',r.storyScenes],['Town encounters',r.encounters],['Side quests',Object.values(state.sideQuests||{}).filter(q=>q?.status==='complete').length]];
 for(const [key,value] of details){
  const cell=document.createElement('div');cell.className='finale-stat';
  const count=document.createElement('strong');count.textContent=String(value);
  const label=document.createElement('small');label.textContent=key;cell.append(count,label);numbers.append(cell);
 }
 const trophyTitle=document.createElement('h3');trophyTitle.textContent='Your tournament record';
 const trophies=document.createElement('div');trophies.className='finale-cups';
 for(const cup of r.cups){
  const el=document.createElement('div');el.className='finale-cup '+(cup.status==='champion'?'is-champion':'');
  el.textContent=cup.title+' · '+(cup.status==='champion'?'Champion':cup.status==='eliminated'?'Eliminated after '+cup.roundsWon+' victories':cup.status==='missed'||cup.status==='expired'?'Not completed':cup.status);
  trophies.append(el);
 }
 const social=document.createElement('p');social.className='finale-social';
 social.textContent=r.partner?'A bond that continues: '+r.partner+'.':r.closest.length?'People you grew closest to: '+r.closest.map(x=>x.name).join(', ')+'.':'The people of Neo Harbor are still there for a return visit.';
 const footer=document.createElement('div');footer.className='finale-actions';
 const replay=document.createElement('button');replay.className='time-advance';
 replay.textContent='↻ Start New Game+ · archive this season';replay.onclick=()=>act('replay');
 const explanation=document.createElement('small');explanation.textContent='Replaying starts a fresh 90-day season. Reports and your selected deck preset carry over; credits, character bonds and brackets reset.';
 footer.append(replay,explanation);
 root.append(preface,heading,closing,numbers,trophyTitle,trophies,social,footer);
}

function render(){
 const ended=state.day>90,locked=!!state.activeSituation||!!state.activeStory||!!state.activeEncounter||!!state.activeArc||!!state.activeSideQuest||!!state.pendingDuel;
 renderPlanner(locked);
 renderDailyIntention(locked);
 const receipt=state.lastDuelReceipt;
 $('duelReceipt').hidden=!receipt;
 if(receipt){
  $('receiptTitle').textContent=receipt.outcome.toUpperCase()+' · '+receipt.name;
  $('receiptDetails').textContent='+'+receipt.points+' circuit points · +'+receipt.credits+' credits · +'+receipt.trust+' trust'+(receipt.bonus?' (includes +'+receipt.bonus+' exhibition points)':'')+(receipt.trainingBonus?' · +'+receipt.trainingBonus+' training credits':'')+(receipt.tournamentBonus?.points?' · tournament bonus included':'')+' · Time advanced one period.';
  $('duelReceipt').classList.toggle('is-victory',receipt.outcome==='Victory');
 }
 $('whereLabel').textContent=state.location==='home'?'⌂  YOU ARE HOME':'●  YOU ARE HERE';
 $('timeTrack').replaceChildren();periods.forEach((p,i)=>{const x=document.createElement('span');x.className='time-pill'+(i===state.slot?' active':i<state.slot?' past':'');x.textContent=(i===0?'☀ ':i===1?'◐ ':'☾ ')+p;$('timeTrack').append(x)});
 $('day').textContent='DAY '+String(Math.min(state.day,90)).padStart(2,'0')+' / 90';
 $('period').textContent=ended?'SEASON COMPLETE':periods[state.slot].toUpperCase();
 $('chapterLabel').textContent='CHAPTER '+(state.day<=30?'I':state.day<=60?'II':'III')+' · '+(state.day<=30?'NEW FACES':state.day<=60?'RISING STAKES':'FINAL STRETCH');
 $('weekdayLabel').textContent=['MON','TUE','WED','THU','FRI','SAT','SUN'][(state.day-1)%7]+' · WEEK '+Math.ceil(Math.min(90,state.day)/7);
 $('campaignFill').style.width=Math.min(100,state.day/90*100)+'%';
 $('timeHint').textContent=state.slot===2?'Next time action starts a NEW DAY.':'Next: '+periods[state.slot+1]+' · ⏳';
 $('quickNext').textContent=state.slot===2?'☾ END DAY · ⏳':'▶ NEXT PERIOD · ⏳';
 $('quickNext').disabled=ended||locked;
 $('quickHome').disabled=locked||state.location==='home';
 $('places').replaceChildren();
 for(const [id,[name,detail]] of Object.entries(places)){
  const b=document.createElement('button');b.className='place '+(id===state.location?'selected':'');
  const glyph={home:'⌂',shop:'♠',arcade:'✦',park:'❀',cafe:'☕',center:'♜',library:'▤'}[id];
  b.textContent=glyph+'  '+name;b.disabled=locked;b.setAttribute('aria-current',id===state.location?'location':'false');b.onclick=()=>{state.location=id;state.selected=null;persist();say('Narrator',detail)};
  const status=document.createElement('span');status.className='place-status';const count=state.day<=90?SCHEDULES.peopleAt(state.day,state.slot,id,publicAppointments(id)).length:0;
   status.textContent=id===state.location?'HERE':count?count+' HERE':'›';b.append(status);$('places').append(b);
 }
 $('placeTitle').textContent=places[state.location][0];$('placeDetail').textContent=places[state.location][1];
 const bgFiles={home:'home.jpg',shop:state.slot===2?'card-shop-evening.png':'card-shop-day.png',arcade:'arcade.jpg',park:'park.jpg',cafe:'cafe.jpg',center:'center.jpg',library:'library.jpg'};
 $('scene').style.backgroundImage="linear-gradient(0deg,#090b18ec 0%,#090b1860 80%),url('/rpg-assets/"+bgFiles[state.location]+"')";
 const showingSituation=state.activeSituation?SITUATIONS.byId(state.activeSituation.id):null;
 const showingStory=state.activeStory?STORY.byId(state.activeStory.id):null;
 const showingEncounter=state.activeEncounter?WORLD.byEncounter(state.activeEncounter.id):null;
 const showingArc=state.activeArc?ARC.byId(state.activeArc.id):null;
 const sideQuest=state.activeSideQuest?SIDE.byId(state.activeSideQuest.id):null,sideOwner=sideQuest?.stages[state.sideQuests[state.activeSideQuest?.id]?.step]?.npc;
  const portraitId=showingSituation?.npc||showingStory?.npc||showingEncounter?.npc||(showingArc?'reina':null)||sideOwner||state.selected,portraitRoot=$('portrait');portraitRoot.replaceChildren();
 if(portraitId&&cast[portraitId])portraitRoot.append(makeAvatar(portraitId));
 $('homeBanner').hidden=state.location!=='home'||!!portraitId;
 $('homeBanner').textContent='YOUR APARTMENT  ·  DAY '+state.day+'  ·  '+periods[state.slot]+' — Prepare your deck, review your plans or rest.';
 let shown=showingSituation?showSituation():showingStory?renderStory():showingEncounter?showEncounter():showingArc?showArc():state.activeSideQuest?showSideQuest():scene;
 $('speaker').textContent=shown?.speaker||'Narrator';$('line').textContent=shown?.line||'The town is waiting.';$('choices').replaceChildren();
 for(const [label,action] of shown.choices||[]){
  const b=document.createElement('button');b.className='choice'+(action==='storyFinish'?' finish':'');b.textContent=label;
  if(action.startsWith('storyChoice:')){
   const event=STORY.byId(state.activeStory.id),chosen=event.choices[Number(action.split(':')[1])],bond=state.relationships[event.npc];
   b.disabled=chosen.kind==='commit'&&((!!state.partner&&state.partner!==event.npc)||bond.trust<3||bond.affection<6);
   if(b.disabled)b.title='You need a stronger bond or you already have a partner.';
  }
  if(action.startsWith('socialDo:')){
   const [,npc,activityId]=action.split(':');
   const selection=SOCIAL.options(state,npc,currentPeople(),cast).find(x=>x.id===activityId);
   b.disabled=!selection||!!selection.disabledReason;
   if(b.disabled)b.title=selection?.disabledReason||'This activity is not available.';
  }
  if(action.startsWith('dateBook:')){
   const [,npc,index,activityId,tone]=action.split(':');
   const target=APPOINTMENTS.proposed(state,npc,SCHEDULES)[Number(index)];
   const option=target?DATES.choices(state,npc,target.place,activityId,SOCIAL,cast).find(t=>t.id===tone):null;
   b.disabled=!option||!!option.disabledReason;
   if(b.disabled)b.title=option?.disabledReason||'That meeting time is no longer available.';
  }
  b.onclick=()=>act(action);$('choices').append(b);
 }
 $('townRadar').replaceChildren();
 const elsewhere=[];
 for(const place of Object.keys(places)){
  if(place==='home'||place===state.location)continue;
  const visible=state.day<=90?SCHEDULES.peopleAt(state.day,state.slot,place,publicAppointments(place)):[];
  for(const id of visible)if(!elsewhere.some(e=>e.id===id))elsewhere.push({id,place});
 }
 if(!elsewhere.length){
  const p=document.createElement('p');p.className='empty-note';p.textContent='No other trainers are around town this period.';$('townRadar').append(p);
 }
 for(const {id,place} of elsewhere){
  const button=document.createElement('button');button.className='radar-person';button.disabled=locked;
  const label=document.createElement('strong');label.textContent=cast[id].name;
  const where=document.createElement('small');where.textContent='↗ '+places[place][0];
  button.append(label,where);button.title='Travel for free to '+places[place][0];
  button.onclick=()=>{if(state.activeStory||state.activeEncounter||state.pendingDuel)return;state.location=place;state.selected=null;persist();say('Narrator','You head to '+places[place][0]+'. '+places[place][1]);};
  $('townRadar').append(button);
 }
 $('people').replaceChildren();
 const people=currentPeople();
 if(!people.length){const p=document.createElement('p');p.className='empty-note';p.textContent='No regulars here at this time. Try another location or time period.';$('people').append(p);}
 for(const id of people){
  const c=cast[id],b=document.createElement('button');b.className='person'+(state.selected===id?' selected':'');b.disabled=locked;
  const avatar=document.createElement('span');avatar.className='person-avatar';avatar.append(makeAvatar(id));
  const label=document.createElement('span');label.className='person-info';
  const name=document.createElement('strong');name.textContent=c.name;const sub=document.createElement('small');sub.textContent=c.style;
  label.append(name,sub);b.append(avatar,label);b.onclick=()=>selectPerson(id);$('people').append(b);
 }
 $('storyEvents').replaceChildren();const stories=eligibleStories();
 for(const e of stories){
  const b=document.createElement('button');b.className='event-btn';b.disabled=locked;b.textContent='✦  '+e.title+' · ⏳ 1 period';
  const small=document.createElement('small');small.textContent=cast[e.npc].name+' · limited-time encounter';b.append(small);b.onclick=()=>startStory(e.id);$('storyEvents').append(b);
 }
 const personalEpisodes=ARC.available(state,currentPeople());
 for(const episode of personalEpisodes){
  const b=document.createElement('button');b.className='event-btn arc-episode';b.disabled=locked;
  const title=document.createElement('strong');title.textContent='♜  '+episode.title+' · ⏳ 1 period';
  const hint=document.createElement('small');hint.textContent=cast.reina.name+' · an optional rivalry chapter';
  b.append(title,hint);b.onclick=()=>act('arc:'+episode.id);
  $('storyEvents').append(b);
 }
 if(!stories.length&&!personalEpisodes.length){const x=document.createElement('p');x.className='empty-note';x.textContent='No special story encounter right now.';$('storyEvents').append(x);}

 $('situationEvents').replaceChildren();
 const moments=SITUATIONS.available(state,currentPeople());
 for(const event of moments){
  const b=document.createElement('button');b.className='event-btn situation-event';
  b.disabled=locked;
  const label=document.createElement('strong');label.textContent='✧ '+event.title+' · ⏳ 1 period';
  const hint=document.createElement('small');
  hint.textContent=cast[event.npc].name+' · optional surprise · '+event.focusCost+' focus';
  b.append(label,hint);b.onclick=()=>act('situation:'+event.id);
  $('situationEvents').append(b);
 }
 if(!moments.length){
  const note=document.createElement('p');note.className='empty-note';
  note.textContent='No unusual moment here right now. A stronger bond and the right time may reveal one.';
  $('situationEvents').append(note);
 }
 $('lifeStats').replaceChildren();
 const lifeGauges=[['FOCUS',state.focus,100,'Focus determines which activities you can perform'],['INSIGHT',state.insight,99,'Lessons learned from activities'],['REPUTATION',state.reputation,100,'How familiar the town is with your name'],['DUEL PREP',state.preparation,3,'A modest bonus after your next winning match']];
 for(const [label,value,max,title] of lifeGauges){
  const item=document.createElement('div');item.className='life-stat';item.title=title;
  const row=document.createElement('div');row.className='life-stat-label';
  const name=document.createElement('b');name.textContent=label;
  const val=document.createElement('span');val.textContent=value+' / '+max;row.append(name,val);
  const track=document.createElement('div');track.className='life-track';
  const fill=document.createElement('div');fill.className='life-fill';fill.style.width=(value/max*100)+'%';track.append(fill);
  item.append(row,track);$('lifeStats').append(item);
 }
 $('townActivities').replaceChildren();
 for(const entry of WORLD.activitiesAt(state)){
  const b=document.createElement('button');b.className='town-activity';b.disabled=locked||!!entry.disabledReason;
  const title=document.createElement('strong');title.textContent=entry.title+' · ⏳ 1 period';
  const description=document.createElement('small');
  const gains=Object.entries(entry.change).filter(([,v])=>v>0).map(([key,value])=>'+'+value+' '+key);
  description.textContent=(entry.disabledReason?entry.disabledReason+' · ':'')+'Focus cost '+entry.focus+(entry.cost?' · '+entry.cost+' credits':'')+' · '+gains.join(' · ');
  b.append(title,description);b.title=entry.text;b.onclick=()=>act('townActivity:'+entry.id);
  $('townActivities').append(b);
 }
 $('sideQuestEvents').replaceChildren();
 for(const x of SIDE.available(state,currentPeople())){
  const b=document.createElement('button');b.className='event-btn';b.disabled=locked;
  const h=document.createElement('strong');h.textContent='◆ '+x.stage.title+' · ⏳ 1 period';
  const hint=document.createElement('small');hint.textContent=cast[x.stage.npc].name+' · '+x.quest.title;
  b.append(h,hint);b.onclick=()=>act('sideQuest:'+x.quest.id);$('sideQuestEvents').append(b);
 }
 if(!$('sideQuestEvents').children.length){const p=document.createElement('p');p.className='empty-note';p.textContent='No side quest encounter here right now.';$('sideQuestEvents').append(p);}
 $('sideQuestJournal').replaceChildren();
 for(const info of SIDE.journal(state)){
  const row=document.createElement('div');row.className='calendar-entry';
  row.textContent=(info.status==='complete'?'✓ ':info.status==='missed'?'– ':'◆ ')+info.title+' · '+(info.status==='active'?info.summary.replace(/shop|cafe|park|center|arcade|library/g,m=>places[m][0]):info.summary);
  $('sideQuestJournal').append(row);
 }
 $('townEncounters').replaceChildren();
 const encounters=WORLD.availableEncounters(state,currentPeople());
 for(const entry of encounters){
  const b=document.createElement('button');b.className='encounter-btn';b.disabled=locked;
  const title=document.createElement('strong');title.textContent='✧ '+entry.title+' · ⏳ 1 period';
  const hint=document.createElement('small');hint.textContent=(entry.npc?cast[entry.npc].name:'The neighborhood')+' · limited-time opportunity';
  b.append(title,hint);b.onclick=()=>act('encounter:'+entry.id);$('townEncounters').append(b);
 }
 if(!encounters.length){
  const note=document.createElement('p');note.className='empty-note';note.textContent='No special encounters here at this time.';$('townEncounters').append(note);
 }

 $('activities').replaceChildren();const e=scheduleEvent();
 const cups=TOURNAMENTS.available(state);
 const items=[...cups.map(c=>{const progress=TOURNAMENTS.status(state,c.id);return [c.title+' · Round '+(progress.round+1)+'/3 vs '+cast[progress.opponent].name+' · ⏳ 1 period','cup:'+c.id]}),...(e&&!TOURNAMENTS.cups.some(c=>c.day===e.day)?[[e.title+' · ⏳ 1 period · +'+e.reward+' pts if you win','event']]:[]),
 [state.location==='home'?'Rest at home · ⏳ 1 period':'Wait one period · ⏳ 1 period','rest'],
 ...(state.location==='home'?[['Sleep until morning · ⏳ '+(3-state.slot)+' period(s)','sleep']]:[]),
 ['Calendar · free','calendar'],['New campaign','new']];
 for(const [label,action] of items){
  const b=document.createElement('button');b.className='activity';b.textContent=label;b.disabled=(ended&&action!=='new'&&action!=='calendar')||(locked&&action!=='calendar');b.onclick=()=>act(action);$('activities').append(b);
 }
 renderBracketProgress();
 renderAppointments(locked);
 renderSeasonReport();
 $('journal').replaceChildren();const stats=document.createElement('p');stats.className='stats';stats.textContent='🏆 '+state.points+' circuit points   ·   ◈ '+state.credits+' credits';$('journal').append(stats);
 for(const e of eventCards.filter(e=>e.day>=state.day).slice(0,2)){const p=document.createElement('p');p.textContent='DAY '+e.day+' · '+e.title+' ('+periods[e.slot]+')';$('journal').append(p)}
 for(const note of state.journal.slice(0,3)){const p=document.createElement('p');p.textContent='• '+note;$('journal').append(p)}
 $('notice').textContent=state.activeSituation?'Unexpected encounter in progress — finish the scene to continue.':state.activeSideQuest?'Side quest in progress — finish the scene to continue.':state.activeStory?'Story in progress: complete this scene to continue.':state.activeArc?'A private rivalry chapter is in progress.':state.activeEncounter?'Local encounter in progress — make your decision.':state.pendingDuel?'Your duel is in progress.':'Travel & talk are free · ⏳ actions advance time';
 $('deckPicker').disabled=locked||ended;
 if($('deckPicker')?.options.length)$('deckPicker').value=state.playerDeck;
}

$('galleryBtn').onclick=openGallery;
$('galleryClose').onclick=()=>$('galleryDialog').close();
$('galleryCharacter').onchange=renderGallery;$('galleryCategory').onchange=renderGallery;
$('cgMomentClose').onclick=()=>$('cgMoment').close();
$('preDuelNext').onclick=advancePreparedDuel;
$('preDuelStart').onclick=launchPreparedDuel;
$('preDuelSkip').onclick=launchPreparedDuel;
$('preDuelDialog').addEventListener('cancel',e=>e.preventDefault());
$('quickNext').onclick=()=>act('rest');$('quickHome').onclick=()=>act('home');$('calendarBtn').onclick=openCalendar;$('calendarClose').onclick=()=>$('calendarDialog').close();
$('save').onclick=()=>{persist();$('notice').textContent='Campaign saved in this browser.'};
$('dismissReceipt').onclick=()=>{state.lastDuelReceipt=null;persist();render();};
document.addEventListener('keydown',e=>{if((e.key===' '||e.code==='Space')&&!['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target?.tagName)){if(state.activeStory?.phase==='lines'){e.preventDefault();act('storyNext');}else if(state.activeArc?.phase==='lines'){e.preventDefault();act('arcNext');}}});
async function initDecks(){try{const res=await fetch('/api/classic/decks');if(!res.ok)throw Error('Could not load decks');const data=await res.json(),select=$('deckPicker');for(const d of data.decks.filter(x=>x.id!=='custom')){const o=document.createElement('option');o.value=d.id;o.textContent=d.name;select.append(o)}if([...select.options].some(o=>o.value===state.playerDeck))select.value=state.playerDeck;else{select.value='blackout';state.playerDeck='blackout'}select.onchange=()=>{if(state.pendingDuel||state.activeStory||state.activeSideQuest||state.ended){select.value=state.playerDeck;return;}state.playerDeck=select.value;persist()};}catch(e){$('notice').textContent='Deck list unavailable: '+e.message;}}
persist();render();initDecks();if(state.pendingDuel){
 if(PRE.isReady(state.pendingDuel)){
  $('duel').hidden=true;$('battle').src='about:blank';showPreparedDuel();
 }else{
  $('duel').hidden=false;$('battle').src=duelUrl(state.pendingDuel);
 }
}
})();