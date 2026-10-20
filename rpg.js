'use strict';
(()=>{
const $=id=>document.getElementById(id),KEY='neoHarborRpgV1',STORY=window.NeoHarborStory,SCHEDULES=window.NeoRpgSchedules,WORLD=window.NeoRpgWorld,ARC=window.NeoRpgRivalArc,TOURNAMENTS=window.NeoRpgTournaments,COMPETE=window.NeoRpgCompetitiveLoop,BRIDGE=window.NeoRpgDuelBridge;
const PACK=window.NeoRpgNarrativePack,SIDE=window.NeoRpgSideQuests,EPILOGUE=window.NeoRpgEpilogue,APPOINTMENTS=window.NeoRpgAppointments,INTENTIONS=window.NeoRpgIntentions,CG=window.NeoRpgCGGallery,PLANNER=window.NeoRpgDailyPlanner,SOCIAL=window.NeoRpgSocialActivities,DATES=window.NeoRpgPlannedDates,PRE=window.NeoRpgPreDuel,SITUATIONS=window.NeoRpgSituations,JOURNEY=window.NeoRpgSeasonJourney,COLLECT=window.NeoRpgCollection,RPGD=window.NeoRpgDialogue,BONDS=window.NeoRpgBondRewards,PARTNER=window.NeoRpgPartnerDecks,VN=window.NeoRpgConversations;
const MANDATORY=window.NeoRpgMandatoryEvents||null,REACT=window.NeoRpgReactivity,COMMUNITY=window.NeoRpgCommunity,CONSEQ=window.NeoRpgConsequences;
const MANDATORY_EVENTS=[...(window.NeoRpgSeasonEvents?.events||[]),...(window.NeoRpgCharacterPacks?.mandatoryEvents||[])];
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
 reina:{name:'Reina Kurogane',age:21,portrait:'/rpg-assets/characters/reina/portraits/primary.png',deck:'blackout',style:'Haymaker · Aggression',locs:['shop','center'],slots:[1,2],days:[1,2,3,4,5,6],intro:'So you are the challenger who came here to win it all. Big words.',repeat:'Back again? Good. I would hate to run out of competition.',talk:['Good players practice openings. Great players practice recovering from bad openings.','I hear you have been talking to the other regulars. Focus is a skill, too.','You want my respect? Earn it across the table.'],flirt:'You always talk this much before a match? I could get used to it.',duelWin:'Fine. That was a good game. Enjoy the win while it lasts.',duelLose:'You are improving. Not quickly enough, but improving.'},
 shiori:{name:'Shiori Tsukishima',age:23,deck:'overgrowth',style:'Damage Swap · Defense',locs:['cafe','library','park'],slots:[0,2],days:[2,4,6],intro:'You are new here. You seem to know exactly why you came.',repeat:'A pleasant coincidence. Would you like to talk?',talk:['A thoughtful match is a conversation neither player can control completely.','There is something peaceful about watching a match from a distance.','Winning can teach you something. So can the silence afterward.'],flirt:'You are unexpectedly direct. I shall remember that.',duelWin:'A thoughtful performance. Thank you for the match.',duelLose:'You saw more of the position than you realize.'},
 yuna:{name:'Yuna Hoshino',age:19,deck:'zap',style:'Clefable · Surprise',locs:['arcade','shop'],slots:[1,2],days:[1,3,5,6,0],intro:'New face! Excellent. My audience was getting bored of me winning.',repeat:'Hey, challenger! I have at least three questionable ideas today.',talk:['A card that surprises you is never a bad card. Okay, usually.','If the plan fails, that just means the next plan will be funnier.','You know what this deck needs? Another completely unreasonable combo.'],flirt:'Whoa, that was smoother than my last combo. And it actually worked!',duelWin:'Okay, okay. I demand an extremely theatrical rematch.',duelLose:'I knew it! The chaos strategy is scientifically sound!'},
 akari:{name:'Akari Fujimoto',age:22,deck:'gym_new_voltage',style:'Slowking · Denial',locs:['library','center','cafe'],slots:[0,1],days:[1,2,4,5],intro:'The newcomer? Your opening statistics will be interesting to study.',repeat:'I have revised my evaluation of your playstyle.',talk:['Every deck reveals an assumption about its pilot.','A small improvement to consistency is often worth more than a spectacular trick.','Your previous results contain several fascinating anomalies.'],flirt:'I... did not have an appropriate response prepared.',duelWin:'An intriguing result. I will revise my assumptions.',duelLose:'Predictable? Perhaps. But consistency is a kind of elegance.'},
 camila:{name:'Camila Vega',age:24,deck:'rocket_lab',style:'Dark Vileplume · Control',locs:['shop','cafe'],slots:[1,2],days:[2,3,4,5,6],intro:'A new collector in my favorite town. How delightful.',repeat:'Ah, my favorite potential business partner.',talk:['Rare cards are only as interesting as the stories behind them.','A good trade leaves both people wondering who got the better deal.','You look like somebody who has learned to hide a good hand.'],flirt:'Careful, darling. I might believe you.',duelWin:'An expensive lesson. Fortunately, I collect those too.',duelLose:'That was a lovely demonstration of leverage.'},
 marina:{name:'Marina Aoki',age:21,deck:'water_blast',style:'Rain Dance · Setup',locs:['park','cafe'],slots:[0,2],days:[0,2,3,5,6],intro:'Oh, hello. There is usually room for one more along the water.',repeat:'It is nice to see you again. The river is particularly beautiful today.',talk:['Some decks need time before you see what they can really do.','I like coming here when the competition becomes too loud.','I keep telling myself that tomorrow is a good day to try something new.'],flirt:'That is a wonderful thing to say. Thank you.',duelWin:'You played beautifully. I enjoyed watching your plan come together.',duelLose:'Maybe patience really is worth something after all.'},
 kaede:{name:'Kaede Arashi',age:22,deck:'rocket_lab',style:'Dark Pokémon · Disruption',locs:['arcade','center','park'],slots:[1,2],days:[0,1,3,4,6],start:40,intro:'So you are the local hotshot? Cute town you have here.',repeat:'Still trying to figure me out? Keep trying.',talk:['Reputations are just stories that got repeated too many times.','I came here for strong opponents, not polite applause.','Sometimes the best move is the one nobody expects you to make.'],flirt:'Heh. You are going to be trouble, aren’t you?',duelWin:'Not bad. You might actually be fun.',duelLose:'That expression on your face? Worth the trip.'}
};
Object.assign(cast,PACK.cast,SIDE.cast);
const BOND_PLAN=BONDS.build(STORY.events,cast);
for(const [id,look] of Object.entries({...PACK.looks,...SIDE.looks}))if(cast[id])cast[id].appearance=look;
const eventCards=[{day:7,slot:1,place:'arcade',title:'Arcade Friendly Cup',reward:7},{day:14,slot:1,place:'center',title:'Club Exhibition',reward:9},{day:21,slot:2,place:'shop',title:'Card Shop Night',reward:8},{day:30,slot:1,place:'center',title:'Neighborhood Cup',reward:15},{day:42,slot:1,place:'arcade',title:'Open Challenge',reward:10},{day:60,slot:1,place:'center',title:'Regional Qualifier',reward:22},{day:75,slot:2,place:'shop',title:'Final Practice Meet',reward:12},{day:88,slot:1,place:'center',title:'Championship Opening',reward:20},{day:90,slot:1,place:'center',title:'Championship Finale Exhibition',reward:25}];


function eligibleStories(){const nearby=SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location));return STORY.available(state).filter(e=>!e.evergreen||nearby.includes(e.npc));}
function storyDialogueLines(id){const lines=STORY.linesFor(state,id);return RPGD?.storyLines(id,lines)||lines;}
function startStory(id){
 if(state.activeSituation||state.activeSideQuest||state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel)return;
 const e=eligibleStories().find(e=>e.id===id);if(!e)return;
 state.selected=e.npc;state.activeStory={id:e.id,phase:'lines',index:0,choice:null};persist();render();
}
function renderStory(){
 const a=state.activeStory,e=STORY.byId(a.id);
 if(!e){state.activeStory=null;persist();return null;}
 if(a.phase==='lines'){
  const lines=storyDialogueLines(e.id),line=lines[Math.min(a.index,lines.length-1)];
  return {speaker:line.speaker==='Protagonist'?'You':(cast[line.speaker]?.name|| (line.speaker===e.npc?cast[e.npc].name:line.speaker)),line:line.text,choices:[[a.index<lines.length-1?'Continue ›':'Respond ›','storyNext']]};
 }
 if(a.phase==='choice')return {speaker:cast[e.npc].name,line:'How will you respond?',choices:e.choices.map((c,i)=>[c.label,'storyChoice:'+i])};
 const chosen=e.choices[a.choice];
 return {speaker:cast[e.npc].name,line:chosen.reply,choices:[['Finish scene · ⏳ 1 period','storyFinish']]};
}
function advanceStory(){
 const a=state.activeStory;if(!a||a.phase!=='lines')return;
 const e=STORY.byId(a.id);a.index++;if(a.index>=storyDialogueLines(e.id).length)a.phase='choice';
 persist();render();
}
function chooseStory(raw){
 const a=state.activeStory;if(!a||a.phase!=='choice')return;
 const index=Number(raw),e=STORY.byId(a.id),choice=e.choices[index];
 if(!choice||!Number.isInteger(index))return;
 if(choice.kind==='commit'&&!VN.commitmentReady(state,e.npc)){
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
 const chapterReward=BONDS.reward(state,e,BOND_PLAN,COLLECT);
 log('A memorable afternoon with '+cast[id].name+'.');recordCG('story_milestone',id);recordIntention('story');
 if(chapterReward)log('Bond chapter '+chapterReward.chapter+' reward from '+cast[id].name+': '+chapterReward.label+'.');
 state.activeStory=null;advance();state.selected=id;
 persist();say(cast[id].name,result.choice.reply+(chapterReward?'\n\n★ Chapter reward: '+chapterReward.label:''));
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

function audioForTime(change){
 const kind=window.NeoRpgTimeTransitions?.plan?.(change)?.kind;
 if(kind)window.NeoRpgAudio?.play?.(kind==='season'?'finale':kind==='day'?'day':kind==='sleep'?'sleep':'period');
}
function timeFlash(beforeDay,beforeSlot,source='activity'){
 const change={beforeDay,beforeSlot,afterDay:state.day,afterSlot:state.slot,source};
 audioForTime(change);
 // Presentation follows the already-committed RPG time state; it never owns state changes.
 if(window.NeoRpgTimeTransitions?.present){window.NeoRpgTimeTransitions.present(change);return;}
 const overlay=document.createElement('div');overlay.className='notice-pop';
 const heading=document.createElement('b');heading.textContent=state.day>90?'Season complete':state.day!==beforeDay?'A NEW DAY BEGINS':'TIME PASSES';
 const body=document.createElement('span');body.textContent=state.day>90?'Day 90 has ended.':'Day '+state.day+' · '+periods[state.slot];
 overlay.append(heading,body);document.body.append(overlay);
 overlay.addEventListener('animationend',()=>overlay.remove());
}

function defaults(){return {sideQuests:{},activeSideQuest:null,day:1,slot:0,location:'home',metReina:false,reinaTrust:0,reinaDuels:0,results:[],flags:{intro:false},journal:['The 90-day season begins.'],pendingDuel:null,bonds:{},talked:{},hungOut:{},eventsDone:{},points:0,credits:80,playerDeck:'blackout',selected:null,ended:false,storyDone:{},storyMissed:{},relationships:{},routeOutcomes:{},partner:null,activeStory:null,activeEncounter:null,activeArc:null,arcFlags:{},arcOutcomes:{},activityDone:{},encountersDone:{},focus:75,insight:0,reputation:0,preparation:0,lastDuelReceipt:null,tournaments:{},campaignHistory:[],ngPlus:0,appointments:[],appointmentSeq:0,scene:null,socialHistory:{},situationDone:{},activeSituation:null,deckJourney:null,competitive:null,npcReactivity:null,community:null,consequences:null,mandatoryEventState:null}}
const hadCampaignSave=!!localStorage.getItem(KEY);
let state;try{state=JSON.parse(localStorage.getItem(KEY))||defaults();if(!Number.isInteger(state.day)||state.day<1||state.day>91)throw Error('Invalid save');}catch{state=defaults()}
for(const [k,v] of Object.entries(defaults()))if(state[k]===undefined)state[k]=v;
if(!hadCampaignSave)state.deckJourney=COLLECT.fresh();
COLLECT.hydrate(state);
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
COMPETE.hydrate(state);
REACT.hydrate(state);
COMMUNITY.hydrate(state);
CONSEQ.hydrate(state);
APPOINTMENTS.hydrate(state);APPOINTMENTS.expire(state);INTENTIONS.hydrate(state);CG.hydrate(state);SOCIAL.hydrate(state);DATES.hydrate(state,APPOINTMENTS,SOCIAL);SITUATIONS.hydrate(state);
for(const id of Object.keys(cast)){const old=state.bonds[id],current=state.relationships[id];
 if(!state.flags['newStoryMigrated_'+id]){for(const key of ['affection','trust','duels'])current[key]=Math.max(current[key]||0,old[key]||0);
 state.flags['newStoryMigrated_'+id]=true;}
}
if(typeof state.activeStory==='string')state.activeStory=null;
STORY.recordExpiry(state);
if(MANDATORY)MANDATORY.hydrate(state,MANDATORY_EVENTS);
const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));
const log=t=>{state.journal.unshift(t);state.journal=state.journal.slice(0,25)};
function recordIntention(kind){const result=INTENTIONS.record(state,kind);if(result)log('Daily priority fulfilled: '+result.title+' ('+result.rewardLabel+').');}
function recordCG(kind,npc,context=null){const entries=CG.record(state,kind,npc,context);if(entries.length)log(entries.length+' new memory illustration'+(entries.length===1?'':'s')+' unlocked for the CG Gallery.');return entries;}
let scene=state.scene&&typeof state.scene.speaker==='string'&&typeof state.scene.line==='string'&&Array.isArray(state.scene.choices)?state.scene:{speaker:'Narrator',line:'Ninety days. One championship. You came to Neo Harbor to win. Everyone else has their own plans.',choices:[]};

function queueMandatory(){
 if(!MANDATORY)return;
 MANDATORY.queue(state,MANDATORY_EVENTS);
}
function maybeStartMandatory(){
 if(!MANDATORY)return;
 queueMandatory();
 if(MANDATORY.hydrate(state,MANDATORY_EVENTS).active)return;
 // Existing scripted dialogue, character choices, galleries, duel preparation and starter selection remain authoritative.
 if(scene.line||scene.choices?.length||state.deckJourney&&!state.deckJourney.starter
    ||$('cgMoment')?.open||$('preDuelDialog')?.open||$('galleryDialog')?.open||$('calendarDialog')?.open)return;
 if(MANDATORY.takeNext(state,MANDATORY_EVENTS)){persist();}
}
function mandatoryText(value){
 const results=Array.isArray(state.results)?state.results:[],wins=results.filter(x=>x.won===true).length;
 const championship=state.tournaments?.championship?.state;
 const standings=championship==='champion'?'You earned the championship title.':championship==='eliminated'?'The championship bracket ended before the title match.':'The championship title was not yours this season.';
 const friends=Object.entries(state.relationships||{}).filter(([,v])=>v&&(v.trust>0||v.affection>0)).sort((a,b)=>(b[1].trust||0)+(b[1].affection||0)-(a[1].trust||0)-(a[1].affection||0)).slice(0,2).map(([id])=>cast[id]?.name||id);
 const closest=state.partner?'You chose to share part of this journey with '+(cast[state.partner]?.name||state.partner)+'.':friends.length?'Friends you met along the way include '+friends.join(' and ')+'.':'You made your own way through the town, on your own terms.';
 return String(value||'').replace(/\{\{(seasonRecord|championshipRecord|friendshipRecord)\}\}/g,(_,key)=>({seasonRecord:results.length+' duels, '+wins+' victories',championshipRecord:standings,friendshipRecord:closest})[key]);
}
function renderMandatory(){
 const a=state.mandatoryEventState?.active,e=MANDATORY_EVENTS.find(x=>x.id===a?.id);
 if(!a||!e)return null;
 if(a.phase==='lines'){
  const line=e.lines[a.index]||e.lines[e.lines.length-1];
  const name=line.speaker==='Protagonist'?'You':cast[line.speaker]?.name||line.speaker;
  const remote=e.kind==='bond'&&(e.delivery==='remote'||!SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location)).includes(e.characterId));
  return {speaker:remote&&cast[line.speaker]?'✉ '+name+' · message':name,line:mandatoryText(line.text),choices:[[a.index<e.lines.length-1?'Continue ›':'Respond ›','mandatoryNext']]};
 }
 if(a.phase==='choice')return {speaker:cast[e.characterId]?.name||'Narrator',line:'How will you respond?',choices:e.choices.map((c,i)=>[c.label,'mandatoryChoice:'+i])};
 const choice=e.choices[a.choice];
 return {speaker:e.kind==='bond'?'✉ '+(cast[e.characterId]?.name||e.characterId)+' · message':'Narrator',line:mandatoryText(choice?.reply||''),choices:[['Continue story ›','mandatoryFinish']]};
}
function mandatoryAction(type,id){
 if(!MANDATORY||!state.mandatoryEventState?.active)return false;
 if(type==='mandatoryNext')MANDATORY.advanceDialogue(state,MANDATORY_EVENTS);
 else if(type==='mandatoryChoice')MANDATORY.choose(state,MANDATORY_EVENTS,Number(id));
 else if(type==='mandatoryFinish'){
  const outcome=MANDATORY.finish(state,MANDATORY_EVENTS);
  if(outcome)log('Story milestone: '+(outcome.event.title||outcome.event.id)+'.');
 }else return true; // No competing action may take control of an active mandatory scene.
 persist();render();
 return true;
}

const atKey=(id)=>state.day+':'+state.slot+':'+id;
function advance(n=1,transitionSource='activity',suppressTimeFlash=false){const beforeDay=state.day,beforeSlot=state.slot;for(let i=0;i<n;i++){state.slot++;if(state.slot>=3){state.slot=0;state.day++;}}if(state.day>90){state.day=91;state.ended=true;log('The Neo Harbor championship season has ended.');}
state.selected=null;
if(state.day>beforeDay){
 WORLD.newDay(state,state.day-beforeDay);
 const news=COMMUNITY.sync(state,Math.min(90,state.day-1),{schedules:SCHEDULES,cast});
 if(news.length){
  const latest=news.at(-1);
  log('Club news: '+COMMUNITY.describe(latest,cast));
 }
}
const expiredCups=TOURNAMENTS.expire(state);if(expiredCups.length)log('A tournament registration window has closed.');
const missed=STORY.recordExpiry(state);if(missed.length)log('Some opportunities in town passed while you were busy.');
const missedQuests=SIDE.expire(state);if(missedQuests.length)log('A local side-quest opportunity passed while you were away.');
const missedAppointments=APPOINTMENTS.expire(state);
INTENTIONS.hydrate(state); // Expire yesterday's optional choice before saving the new day.
for(const plan of missedAppointments)log('You missed your planned meet-up with '+(cast[plan.npc]?.name||'a trainer')+'.');
queueMandatory();persist();if(!suppressTimeFlash)timeFlash(beforeDay,beforeSlot,transitionSource);}
function say(speaker,line,choices=[]){scene={speaker,line,choices};state.scene=scene;persist();render();}
function sayConversation(lines,afterChoices=[],reactionId=null){
 if(!Array.isArray(lines)||!lines.length)return;
 const script=lines.filter(x=>x&&typeof x.text==='string'&&typeof x.speaker==='string');
 if(!script.length)return;
 const first=script[0];
 scene={speaker:first.speaker==='Protagonist'?'You':cast[first.speaker]?.name||first.speaker,
  line:first.text,choices:script.length>1?[['Continue ›','chatNext']]:afterChoices,
  dialogue:script,index:0,afterChoices,reactionId};
 state.scene=scene;persist();render();
}
function advanceConversation(){
 if(!Array.isArray(scene.dialogue)||scene.index>=scene.dialogue.length-1)return;
 scene.index++;
 const next=scene.dialogue[scene.index];
 scene.speaker=next.speaker==='Protagonist'?'You':cast[next.speaker]?.name||next.speaker;
 scene.line=next.text;
 scene.choices=scene.index===scene.dialogue.length-1?scene.afterChoices:[['Continue ›','chatNext']];
 // Do not consume an acknowledgement until the player actually reads its final line.
 if(scene.index===scene.dialogue.length-1&&scene.reactionId)REACT.mark(state,scene.reactionId);
 state.scene=scene;persist();render();
}
function closeSceneDialogue(){
 if(state.activeSituation||state.activeStory||state.activeEncounter||state.activeArc||state.activeSideQuest||state.pendingDuel||state.mandatoryEventState?.active)return;
 // Keep the current character selected after casual dialogue so Duel and Deck actions remain accessible.
 if(!state.selected||!cast[state.selected]||!currentPeople().includes(state.selected))state.selected=null;
 scene={speaker:'Narrator',line:'',choices:[]};
 state.scene=scene;
 persist();render();
}
function publicAppointments(place){return [...APPOINTMENTS.overrides(state),...STORY.available(state,place),...SIDE.appointments(state)];}
function currentPeople(){if(state.day>90)return [];const regular=SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location));
for(const e of eligibleStories())if(!regular.includes(e.npc))regular.push(e.npc);
return regular;}
function selectPerson(id){
 if(state.activeSituation||state.activeStory||state.activeSideQuest||state.activeEncounter||state.activeArc||state.pendingDuel||!cast[id]||!currentPeople().includes(id))return;
 const c=cast[id],first=!state['met_'+id]&&!((id==='reina')&&state.metReina);
 const today=state.day+':'+id,fresh=!state.talked[today];
 state['met_'+id]=true;
 if(id==='reina')state.metReina=true;
 state.talked[today]=true;
 state.selected=id;
 const memories=recordCG('meet',id);
 persist();
 const context=first?null:REACT.reaction(state,id,c,cast,COMMUNITY,CONSEQ);
 sayConversation(context?.lines||VN.dialogue(state,id,c,RPGD,{first}),fresh?VN.choices(state,id):[],context?.id||null);
 showCGMoment(memories[0]);
}
// Infrequent contextual invitations replace the permanent dialogue command list.
function options(id){return VN.choices(state,id);}

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
 if(mandatoryAction(type,id))return;
 if(type==='chatNext')return advanceConversation();
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
 if(state.activeSituation||state.activeStory||state.pendingDuel||state.activeEncounter||state.activeArc||state.activeSideQuest||state.mandatoryEventState?.active)return;
 if(type==='consequenceChoice'){
  const id0=scene.consequenceId,answer=id0?CONSEQ.resolve(state,id0,id):null;
  if(!answer)return;
  log('After the match: '+CONSEQ.PATHS[id].label.toLowerCase()+'.');
  return sayConversation(answer.lines,[]);
 }
 if(type==='consequence'){
  const event=CONSEQ.opportunities(state)[0];if(!event)return;
  if(state.location!=='center'){
   state.location='center';state.selected=null;persist();
   return say('Narrator','You arrive at the Community Center, where you can review your last match. No time passes.');
  }
  scene={...CONSEQ.prompt(event,cast[event.npc]?.name||'your rival'),consequenceId:event.id};
  state.scene=scene;persist();render();return;
 }

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
 if(type==='sleep'){if(state.location!=='home')return;const n=3-state.slot;advance(n,'sleep');return say('Narrator','You wake up to a new day in Neo Harbor.');}
 if(type==='close'||type==='dismissDialogue')return closeSceneDialogue();
 if(type==='duel')return startDuel(id||state.selected,false);
 if(type==='partnerDeck'){
  if(!cast[id]||!currentPeople().includes(id)||!state.deckJourney?.starter||!PARTNER.unlocked(state,id)||controlsLocked())return;
  persist();
  location.assign('/rpg_deck_studio.html?partner='+encodeURIComponent(id)+
   '&deck='+encodeURIComponent(cast[id].deck)+'&name='+encodeURIComponent(cast[id].name));
  return;
 }
 if(type==='bondChallenge'){
  if(BONDS.canChallenge(state,id,BOND_PLAN))return startDuel(id,null,null,null,null,true);
  $('notice').textContent='Complete two bond chapters first.';return;
 }
 if(type==='cup'){try{const match=TOURNAMENTS.begin(state,id);return startDuel(match.npc,null,null,match);}catch(err){return say('Tournament Desk',err.message);}}
 if(type==='competitive'){
  try{const match=COMPETE.begin(state,id);return startDuel(match.npc,null,null,null,null,false,match);}
  catch(err){return say('Circuit Desk',err.message);}
 }
 if(type==='event'){const e=scheduleEvent();if(!e)return;const opponents={7:'yuna',14:'reina',21:'hana',30:'reina',42:'kaede',60:'akari',75:'camila',88:'reina',90:'shiori'};return startDuel(opponents[e.day]||'reina',e);}
 if(type==='work')return performActivity('shop_shift');
 if(type==='practice')return state.location==='library'?performActivity('library_research'):state.location==='center'?performActivity('center_scrimmage'):performActivity('home_reflect');
 if(type==='rest'){if(state.day>90)return;advance();return say('Narrator','You take a break. Other lives in the town carry on.');}
 if(type==='replay'){
  if(!EPILOGUE.completed(state)||mandatoryClosureDue())return;
  if(confirm('Start New Game+? Your completed season report will be archived. Relationships, standings and credits will reset.')){
   state=EPILOGUE.replay(state,defaults);CG.hydrate(state);persist();location.reload();
  }
  return;
 }
 if(type==='new'){if(confirm('Start a new season? This overwrites this browser save.')){state=defaults();state.deckJourney=COLLECT.fresh();for(const id of Object.keys(cast))state.bonds[id]={affection:0,trust:0,duels:0};persist();location.reload();}return;}
 if(!cast[id]||!currentPeople().includes(id))return say('Narrator','They have already moved on. Try another time.');
 const c=cast[id],bond=state.bonds[id],key=atKey(id);
 if(type==='talk'){
  state.talked[state.day+':'+id]=true;
  persist();
  const context=REACT.reaction(state,id,c,cast,COMMUNITY,CONSEQ);
  return sayConversation(context?.lines||VN.dialogue(state,id,c,RPGD),[],context?.id||null);
 }
 if(type==='flirt'){
  state.talked['flirt:'+key]=true;
  const lines=RPGD?.flirtLines(id,c.flirt)||[{speaker:'Protagonist',text:'I had something playful to say, but now I am reconsidering.'},{speaker:id,text:c.flirt}];
  persist();
  return sayConversation(lines,[]);
 }
 if(type==='hang'){if(state.hungOut[state.day+':'+id])return say(c.name,'I enjoyed our time today. Let us make plans another day.',options(id));state.hungOut[state.day+':'+id]=true;bond.affection+=2;bond.trust++;state.relationships[id].affection+=2;state.relationships[id].trust++;log('Spent time with '+c.name+'.');recordIntention('hangout');const memories=recordCG('hangout',id);advance();state.selected=null;say(c.name,Array.isArray(c.hangouts)&&c.hangouts.length?c.hangouts[(state.day+bond.duels)%c.hangouts.length]:'That was a lovely way to spend part of the day. See you around.');showCGMoment(memories[0]);return;}
}

const cardNames=new Map(),cardImages=new Map();
let packArtSerial=0;
let pendingDuelTimeShift=null;
function finishDuelRewardPresentation(){
 const transition=pendingDuelTimeShift;pendingDuelTimeShift=null;
 // The world clock and all rewards were already persisted before results appeared.
 if(transition){audioForTime(transition);window.NeoRpgTimeTransitions?.present?.(transition);}
}

function showPackReveal(){
 const pack=state.deckJourney?.lastPack,modal=$('packDialog');
 if(!pack||pack.opened||modal.open)return;
 const isVictory=pack.source==='win';
 const giver=pack.giver&&cast[pack.giver]?pack.giver:null;
 const setName=COLLECT.SETS[pack.set]?.name||'Base Set';
 $('packEyebrow').textContent=isVictory?'✦ DUEL REWARD · YOUR CARDS':'✦ NEO HARBOR · CARD REWARDS';
 $('packTitle').textContent=isVictory?'VICTORY BOOSTER':'NEW BOOSTER';
 $('packDescription').textContent=setName+' · '+pack.cards.length+' cards. Tap to flip individual cards, or reveal them all.';
 const portrait=$('packGiver');portrait.replaceChildren();
 const request=++packArtSerial; // An earlier booster image must never overwrite this giver.
 const caption=$('packGiverName');caption.textContent=giver?cast[giver].name+' gives you a '+setName+' booster':'The Lucky Draw · '+setName+' booster';
 if(giver){
  // Show a known portrait immediately while optional artwork loads.
  const showPortrait=()=>{if(request===packArtSerial)portrait.replaceChildren(makeAvatar(giver));};
  showPortrait();
  const base='/rpg-assets/characters/'+encodeURIComponent(giver)+'/';
  const candidates=[
   base+'events/booster.webp',
   base+'vn-expressions/surprised.webp',
   base+'vn-expressions/surprised.png',
   base+'vn-expressions/surprise.webp',
   base+'vn-expressions/surprise.png',
   base+'portraits/surprised.webp',
   base+'portraits/surprised.png',
   base+'portraits/surprise.webp',
   base+'portraits/surprise.png',
   base+'events/surprised.webp',
   base+'events/surprised.png'
  ];
  const art=new Image();
  art.alt=cast[giver].name+' presenting a booster';
  art.className='pack-giver-art';
  let attempt=0;
  const tryNext=()=>{
   if(request!==packArtSerial)return;
   if(attempt<candidates.length)art.src=candidates[attempt++];
   else showPortrait();
  };
  art.onload=()=>{if(request===packArtSerial)portrait.replaceChildren(art);};
  art.onerror=tryNext;
  tryNext();
 }
 const target=$('packCards');target.replaceChildren();
 const cards=[];
 for(const [index,id] of pack.cards.entries()){
  const button=document.createElement('button');button.type='button';button.className='pack-card';button.title='Reveal card '+(index+1);
  button.style.setProperty('--card-position',String(index));
  const back=document.createElement('span');back.className='pack-card-back';back.textContent='✦';button.append(back);
  const reveal=(silent=false)=>{
   if(button.className.includes('revealed'))return;
   if(!silent)window.NeoRpgAudio?.play?.('flip');
   button.className+=' revealed';button.replaceChildren();
   const detail=document.createElement('strong');detail.textContent=labelCard(id);
   const info=cardNames.get(id)||id;
   const row=document.createElement('span');row.className='pack-card-number';row.textContent='CARD '+(index+1)+' / '+pack.cards.length;
   button.append(row);
   const data=cardImages.get(id);
   if(data){
    const img=document.createElement('img');img.alt=info;img.src=data;img.loading='lazy';img.onerror=()=>img.replaceWith(document.createTextNode('✦'));
    button.append(img);
   }else{
    const symbol=document.createElement('span');symbol.className='pack-card-placeholder';symbol.textContent='✦';button.append(symbol);
   }
   button.append(detail);
  };
  button.onclick=reveal;cards.push(reveal);target.append(button);
 }
 $('packRevealAll').onclick=()=>{cards.forEach(show=>show(true));window.NeoRpgAudio?.play?.('flip');};
 $('packContinue').onclick=()=>{pack.opened=true;persist();modal.close();finishDuelRewardPresentation();};
 modal.oncancel=e=>e.preventDefault(); // One handler, even after opening dozens of packs.
 modal.showModal();
 window.NeoRpgAudio?.play?.('booster');
}

const labelCard=id=>cardNames.get(id)||id.replace('base1-','Base #');
function controlsLocked(){return state.day>90||!!state.mandatoryEventState?.active||!!state.pendingDuel||!!state.activeSituation||!!state.activeStory||!!state.activeSideQuest||!!state.activeArc||!!state.activeEncounter;}
function showStarterChoice(){
 if(controlsLocked())return;
 const root=$('starterChoices');root.replaceChildren();
 for(const starter of COLLECT.starters){
  const button=document.createElement('button');button.className='starter-choice';
  const heading=document.createElement('strong');heading.textContent=starter.name+' · '+starter.types.join(' / ');
  const detail=document.createElement('small');detail.textContent=starter.description+' · 60 cards · 20 Pokémon / 16 Trainers / 24 Energy';
  button.append(heading,detail);
  button.onclick=()=>{
   if(controlsLocked())return;
   try{COLLECT.choose(state,starter.id);log('Chose '+starter.name+' as your first deck.');persist();
    if($('starterDialog').open)$('starterDialog').close();
    say('Narrator','Your '+starter.name+' deck is ready. Visit the card shop for packs, win cards in duels and improve your deck at home.');
   }catch(e){$('notice').textContent=e.message;}
  };
  root.append(button);
 }
 if(!$('starterDialog').open)$('starterDialog').showModal();
}
function renderCollection(){
 const root=$('deckCollection');root.replaceChildren();
 const journey=state.deckJourney,locked=controlsLocked();
 if(journey===null){
  const p=document.createElement('p');p.textContent='Legacy campaign: your current theme deck remains available. Switch to a limited collection whenever you want a new challenge.';
  const btn=document.createElement('button');btn.textContent='Begin starter-deck journey';btn.disabled=locked;
  btn.onclick=showStarterChoice;root.append(p,btn);return;
 }
 if(!journey.starter){
  const btn=document.createElement('button');btn.textContent='Choose one of three mixed-type starters';btn.disabled=locked;
  btn.onclick=showStarterChoice;root.append(btn);return;
 }
 const starter=COLLECT.byId(journey.starter);
 const picker=$('deckPicker');
 if(picker.options?.length!==1||picker.options[0]?.value!=='custom'){
  picker.replaceChildren();
  const opt=document.createElement('option');opt.value='custom';opt.textContent=starter.name+' · Your collection';picker.append(opt);
 }else picker.options[0].textContent=starter.name+' · Your collection';
 picker.value='custom';picker.disabled=true;
 const total=Object.values(journey.owned).reduce((a,n)=>a+n,0);
 const summary=document.createElement('p');summary.textContent=starter.name+' · 60-card deck · '+total+' owned cards · '+journey.packs+' packs opened';
 const studio=document.createElement('button');studio.className='studio-open';studio.textContent='✦ Build / edit your deck';studio.disabled=locked;
 studio.onclick=()=>{persist();location.assign('/rpg_deck_studio.html');};
 root.append(summary,studio);
 if(state.location==='shop'){
  const shop=document.createElement('button');
  shop.className='studio-open';
  shop.textContent='✦ Browse booster packs · The Lucky Draw';
  shop.disabled=locked||state.day>90;
  shop.onclick=openBoosterShop;
  root.append(shop);

 }
}
function openBoosterShop(){
 if(controlsLocked()||state.day>90||state.location!=='shop'||!state.deckJourney?.starter)return;
 renderBoosterShop();
 if(!$('boosterShopDialog').open)$('boosterShopDialog').showModal();
}
function purchaseBoosterPack(set,useVoucher=false){
 try{
  const cards=useVoucher?COLLECT.redeemVoucher(state,set):COLLECT.buyPack(state,set);
  const name=COLLECT.SETS[set].name;
  log('Opened '+name+' booster: '+cards.map(labelCard).join(', ')+'.');
  persist();
  if($('boosterShopDialog').open)$('boosterShopDialog').close();
  say('Card Shop','Your '+name+' booster is ready! See what you pulled, then visit the Deck Studio to use your new cards.');
  showPackReveal();
 }catch(e){
  $('boosterShopStatus').textContent=e.message;
  renderBoosterShop(e.message);
 }
}
function renderBoosterShop(message=''){
 const root=$('boosterShopGrid');root.replaceChildren();
 $('boosterShopBalance').textContent='◈ '+(state.credits||0)+' credits · Day '+state.day;
 $('boosterShopStatus').textContent=message;
 for(const offer of COLLECT.shopPacks(state)){
  const box=document.createElement('article');box.className='booster-offer'+(offer.unlocked?'':' is-locked');
  const eyebrow=document.createElement('small');eyebrow.className='booster-offer-edition';eyebrow.textContent=offer.unlocked?'AVAILABLE BOOSTER':'LOCKED BOOSTER';
  const title=document.createElement('h3');title.textContent=offer.name;
  const desc=document.createElement('p');desc.textContent=offer.description;
  const progress=document.createElement('div');progress.className='booster-collection-progress';
  const track=document.createElement('div');track.className='booster-collection-track';
  const fill=document.createElement('span');fill.style.width=offer.completion+'%';track.append(fill);
  const count=document.createElement('small');count.textContent=offer.owned+' / '+offer.total+' cards discovered · '+offer.completion+'%';
  progress.append(track,count);
  const targets=(state.deckStrategy?.wishlist||[]).filter(id=>
   id.startsWith(offer.set+'-')&&!(state.deckJourney?.owned?.[id]>0));
  if(targets.length){
   const tip=document.createElement('small');tip.className='booster-offer-targets';
   tip.textContent='✦ '+targets.length+' missing tracked card'+(targets.length===1?'':'s')+
    ' in this set · packs are randomized';
   progress.append(tip);
  }
  const reason=document.createElement('p');reason.className='booster-offer-unlock';
  reason.textContent=offer.unlocked?'Ten random cards · rare + Basic Energy guaranteed':
   offer.unlockHint.replace('bond with '+offer.npc,'bond with '+(cast[offer.npc]?.name||offer.npc));
  const buy=document.createElement('button');buy.type='button';buy.className='booster-offer-buy';
  const affordable=(state.credits||0)>=offer.price;
  buy.disabled=!offer.unlocked||(!affordable&&!offer.vouchers)||controlsLocked();
  buy.textContent=offer.vouchers?'Redeem reward · free ('+offer.vouchers+')':offer.unlocked?'Buy · '+offer.price+' credits':'Unlock to buy · '+offer.price+' credits';
  if(offer.unlocked&&!affordable&&!offer.vouchers)reason.textContent='Need '+(offer.price-(state.credits||0))+' more credits · '+reason.textContent;
  if(offer.vouchers)reason.textContent='Character chapter gift · one ten-card booster';
  buy.onclick=()=>purchaseBoosterPack(offer.set,offer.vouchers>0);
  box.append(eyebrow,title,desc,progress,reason,buy);root.append(box);
 }
}
function renderDeckWorkshop(){
 const j=state.deckJourney;if(!j?.starter)return;
 const draft=COLLECT.draft(state),owned=j.owned;
 const counts=COLLECT.rank(draft),remove=$('deckRemove'),add=$('deckAdd');
 const previousRemove=remove.value,previousAdd=add.value;
 remove.replaceChildren();add.replaceChildren();
 const label=(id,n)=>labelCard(id)+' · '+n+' copy'+(n===1?'':'ies');
 for(const [id,n] of Object.entries(counts)){
  const option=document.createElement('option');option.value=id;option.textContent=label(id,n);remove.append(option);
 }
 for(const [id,n] of Object.entries(owned)){
  if(!n)continue;
  const option=document.createElement('option');option.value=id;option.textContent=label(id,n)+' owned / '+(counts[id]||0)+' in deck';add.append(option);
 }
 if(counts[previousRemove])remove.value=previousRemove;
 if(owned[previousAdd])add.value=previousAdd;
 const valid=COLLECT.check(draft,owned);
 $('deckEditStats').textContent=COLLECT.byId(j.starter).name+' · '+draft.length+'/60 cards · '+(valid.valid?'Ready to battle':'Deck needs attention');
 $('deckEditError').textContent=valid.errors[0]||'Swap any card you own, one for one. Only your saved deck goes into battle.';
 const list=$('deckList');list.replaceChildren();
 for(const [id,n] of Object.entries(counts)){
  const item=document.createElement('span');item.textContent=n+'× '+labelCard(id);list.append(item);
 }
}
function openDeckWorkshop(){
 if(controlsLocked()||!state.deckJourney?.starter)return;
 COLLECT.draft(state);renderDeckWorkshop();persist();
 if(!$('deckEditDialog').open)$('deckEditDialog').showModal();
}
function closeDeckWorkshop(discard){
 if(discard)COLLECT.cancel(state);
 if($('deckEditDialog').open)$('deckEditDialog').close();
 persist();render();
}
$('boosterShopClose').onclick=()=> $('boosterShopDialog').close();
$('starterDialog').addEventListener('cancel',e=>{if(state.deckJourney&&!state.deckJourney.starter)e.preventDefault();});
$('deckSwap').onclick=()=>{
 try{
  COLLECT.change(state,$('deckRemove').value,$('deckAdd').value);persist();renderDeckWorkshop();
 }catch(e){$('deckEditError').textContent=e.message;}
};
$('deckSave').onclick=()=>{
 try{COLLECT.save(state);log('Saved a revised 60-card deck.');closeDeckWorkshop(false);}
 catch(e){$('deckEditError').textContent=e.message;}
};
$('deckDiscard').onclick=()=>closeDeckWorkshop(true);
$('deckEditClose').onclick=()=>closeDeckWorkshop(true);
async function loadCardNames(){
 try{const files=await Promise.all(Object.keys(COLLECT.SETS).map(async set=>{const res=await fetch('/cards/'+set+'.json');return res.ok?res.json():[];}));
  const cards=files.flat();
  for(const c of cards)if(c?.id&&c.name){cardNames.set(c.id,c.name);if(/^https:\/\//.test(c.images?.small||''))cardImages.set(c.id,c.images.small);else cardImages.set(c.id,'/api/cube-card-image/'+encodeURIComponent(c.id));}
  renderCollection();
 }catch{}
}

function duelUrl(duel){return '/classic_live.html?rpg=1&duelId='+encodeURIComponent(duel.id)+'&deck='+encodeURIComponent(duel.playerDeck)+'&opponent='+encodeURIComponent(duel.opponent)+'&npc='+encodeURIComponent(duel.npc)+'&npcName='+encodeURIComponent(cast[duel.npc].name);}

function describePreparedDuel(){
 return PRE.describe(state,state.pendingDuel,{cast,places,cg:CG,tournaments:TOURNAMENTS,
  reactivity:{preDuelLine:(s,d)=>CONSEQ.preDuel(s,d.npc)||REACT.preDuelLine(s,d)}});
}
function showPreparedDuel(){
 const pending=state.pendingDuel;
 if(!PRE.isReady(pending))return;
 const preview=describePreparedDuel();
 if(!preview)return;
 const modal=$('preDuelDialog'),art=$('preDuelArt');art.replaceChildren();
 const matchStyle=window.NeoRpgTournamentPresentation?.matchModel?.(pending,{cast,cups:TOURNAMENTS.cups});
 modal.dataset.circuit=matchStyle?.kind||'friendly';
 $('preDuelContext').textContent=preview.stake;
 $('preDuelOpponent').textContent=preview.name;
 $('preDuelDeck').textContent=preview.deckLabel+(pending.customOpponentDeck?' · YOUR COLLABORATIVE BUILD':'')+' · '+preview.place;
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
 window.NeoRpgAudio?.setPaused?.(true);
 if(pending.deckCards)sessionStorage.setItem('neoRpgDeck:'+pending.id,JSON.stringify(pending.deckCards));
 if(pending.customOpponentDeck)sessionStorage.setItem('neoRpgNpcDeck:'+pending.id,JSON.stringify(pending.customOpponentDeck));
 $('battle').src=duelUrl(pending);
 // Only important circuit matches get the fast, nonblocking versus intro.
 const presentation=window.NeoRpgTournamentPresentation;
 if(presentation?.matchModel)presentation.show(presentation.matchModel(pending,{cast,cups:TOURNAMENTS.cups}));
}

function startDuel(id,exhibition=null,arcEpisode=null,tournament=null,sideQuest=null,bondChallenge=false,competition=null){
 if(state.deckJourney&&!state.deckJourney.starter){showStarterChoice();return;}
 if(state.deckJourney?.starter&&!COLLECT.check(state.deckJourney.deck,state.deckJourney.owned).valid){$('notice').textContent='Save a valid campaign deck before challenging another trainer.';return;}
 if(state.activeSituation||state.activeStory||state.activeEncounter||(state.activeArc&&state.activeArc.id!==arcEpisode)||(state.activeSideQuest&&state.activeSideQuest.id!==sideQuest?.id)||state.pendingDuel||state.day>90||!cast[id]||(!exhibition&&!tournament&&!competition&&!currentPeople().includes(id)))return;
 if(competition&&!COMPETE.available(state).some(e=>e.id===competition.id&&e.npc===id))return;
 if(sideQuest&&(!SIDE.canDuel(state,sideQuest.id,currentPeople())||SIDE.byId(sideQuest.id)?.stages[sideQuest.step]?.npc!==id))return;
 if(bondChallenge&&!BONDS.canChallenge(state,id,BOND_PLAN))return;
 if(arcEpisode&&(!state.activeArc||state.activeArc.phase!=='choice'||!ARC.available(state,currentPeople()).some(e=>e.id===arcEpisode)))return;
 const c=cast[id],npcEditedCards=PARTNER.snapshot(state,id,c.deck);
 state.pendingDuel={id:'npc-'+id+'-'+state.day+'-'+state.slot+'-'+state.results.length,npc:id,day:state.day,slot:state.slot,opponent:c.deck,playerDeck:state.deckJourney?.starter?'custom':state.playerDeck,deckCards:state.deckJourney?.starter?[...state.deckJourney.deck]:null,resolved:false,eventKey:exhibition?exhibition.day+':'+exhibition.title:null,eventReward:exhibition?exhibition.reward:0,eventTitle:exhibition?exhibition.title:null,arcEpisode:arcEpisode||null,tournamentId:tournament?.tournamentId||null,tournamentRound:tournament?.tournamentRound??null,tournamentAttempt:tournament?.tournamentAttempt??null,sideQuestId:sideQuest?.id||null,sideQuestStage:sideQuest?.step??null,bondChallenge:!!bondChallenge,customOpponentDeck:npcEditedCards,
  competitiveKind:competition?.kind||null,competitiveId:competition?.id||null,
  competitiveWeek:competition?.week??null,competitiveRound:competition?.round??null,
  competitiveTitle:competition?.title||null};
 if(arcEpisode)state.activeArc=null;
 PRE.stage(state.pendingDuel);
 if(npcEditedCards)sessionStorage.setItem('neoRpgNpcDeck:'+state.pendingDuel.id,JSON.stringify(npcEditedCards));
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
 const competitiveOutcome=duel.competitiveKind?COMPETE.settle(state,duel,receipt):null;
 if(competitiveOutcome){
  receipt.points+=competitiveOutcome.points;
  receipt.credits+=competitiveOutcome.credits;
  receipt.competitiveBonus={points:competitiveOutcome.points,credits:competitiveOutcome.credits,champion:competitiveOutcome.champion};
  log(competitiveOutcome.message);
  if(competitiveOutcome.voucher&&state.deckJourney?.starter){
   const set=COLLECT.shopPacks(state).filter(offer=>offer.unlocked).at(-1)?.set||'base1';
   COLLECT.awardVoucher(state,set);
   log('Saturday Local prize: one '+COLLECT.SETS[set].name+' booster voucher. Redeem it at The Lucky Draw.');
  }
 }
 recordCG('after_duel',duel.npc);
 const personalOutcome=duel.arcEpisode?ARC.settleDuel(state,duel.arcEpisode,receipt):null;
  const sideOutcome=duel.sideQuestId?SIDE.settleDuel(state,duel,receipt):null;
  if(sideOutcome)log('Completed side quest: '+sideOutcome.title+'.');
  const bondTrial=duel.bondChallenge?BONDS.settleChallenge(state,duel.npc,receipt.outcome==='Victory',BOND_PLAN,COLLECT):null;
  if(bondTrial){receipt.credits+=bondTrial.credits;log(bondTrial.title+' completed: '+bondTrial.label+'.');}
 if(personalOutcome)log('A special rivalry challenge reached its result.');
 const turningPoint=CONSEQ.record(state,duel,receipt,{cupOutcome,competitiveOutcome});
 if(turningPoint?.highlight)log('A turning point with '+cast[duel.npc].name+'. You can reflect at the Community Center.');
 const awarded=COLLECT.reward(state,receipt.outcome==='Victory',duel.npc);
 if(awarded)log('Won a ten-card booster: '+awarded.map(labelCard).join(', ')+'.');
 state.lastDuelReceipt=receipt;state.pendingDuel=null;
 sessionStorage.removeItem(BRIDGE.sessionKey(duel.id));
 sessionStorage.removeItem('neoRpgDeck:'+duel.id);
  sessionStorage.removeItem('neoRpgNpcDeck:'+duel.id);
 const duelBeforeTime={beforeDay:state.day,beforeSlot:state.slot};
 advance(1,'duel',true);$('duel').hidden=true;$('battle').src='about:blank';
 window.NeoRpgAudio?.setPaused?.(false);
 pendingDuelTimeShift={...duelBeforeTime,afterDay:state.day,afterSlot:state.slot,source:'duel'};
 const c=cast[duel.npc];say(c.name,sideOutcome?.text||personalOutcome||REACT.afterDuel(state,duel,receipt,c)|| (receipt.outcome==='Victory'?c.duelWin:receipt.outcome==='Draw'?'A hard-fought draw. Let us play again.':c.duelLose));
 const continueAfterResult=()=>{
  if(awarded){
   showPackReveal();
   if(!$('packDialog').open)finishDuelRewardPresentation();
  }else finishDuelRewardPresentation();
 };
 // Result first, then the earned booster, then the time wipe. No extra engine settlement.
 const tournamentPresentation=window.NeoRpgTournamentPresentation?.celebrationModel?.({
  duel,cupOutcome,competitiveOutcome,receipt
 });
 const shown=window.NeoRpgVictoryPresentation?.show?.({
  receipt,hasBooster:!!awarded,avatar:makeAvatar(duel.npc),
  presentation:tournamentPresentation,onContinue:continueAfterResult
 });
 if(!shown)continueAfterResult();
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
 image.onload=()=>{placeholder.hidden=true;image.hidden=false;CG.markViewed(state,entry.id);persist();renderGallery();};
 image.onerror=()=>{image.hidden=true;placeholder.hidden=false;};
 image.src=entry.path;
 root.append(title,text,image,placeholder);
}
function renderGallery(){
 const root=$('galleryGrid');root.replaceChildren();
 const all=CG.gallery(state,{character:$('galleryCharacter').value,category:$('galleryCategory').value});
 const visible=$('galleryUnseen').checked?all.filter(e=>e.unlocked&&!e.viewed):all;
 const unlocked=all.filter(e=>e.unlocked).length;
 const summary=JOURNEY.gallerySummary(state,CG),newCount=summary.unlocked-summary.viewed;
 $('galleryCount').textContent=unlocked+' / '+all.length+' in this filter · '+summary.unlocked+'/'+summary.total+
  ' overall ('+summary.percent+'%) · '+newCount+' earned but not yet viewed · '+visible.length+' shown';
 const progress=$('galleryProgress');progress.replaceChildren();
 for(const [id,stat] of Object.entries(summary.byCategory)){
  const item=document.createElement('span');item.className='cg-progress-chip';
  item.textContent=stat.label+': '+stat.unlocked+'/'+stat.total;progress.append(item);
 }
 for(const [id,stat] of Object.entries(summary.byCharacter)){
  const name=document.createElement('span');name.className='cg-character-progress';
  name.textContent=(cast[id]?.name||id)+': '+stat.unlocked+'/'+stat.total;progress.append(name);
 }
 for(const entry of visible){
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

function openCommunityBoard(){
 const table=$('communityStandings'),news=$('communityNews'),connections=$('communityConnections');
 table.replaceChildren();news.replaceChildren();connections.replaceChildren();
 const standings=COMMUNITY.rank(state,cast);
 if(!standings.length){
  const p=document.createElement('p');p.className='empty-note';
  p.textContent='The club season has only just begun. Results will appear as days pass.';
  table.append(p);
 }
 for(const [i,entry] of standings.slice(0,8).entries()){
  const row=document.createElement('div');row.className='club-standing';
  const label=document.createElement('strong');label.textContent=(i+1)+'. '+entry.name;
  const score=document.createElement('span');score.textContent=entry.wins+' W · '+entry.losses+' L';
  row.append(label,score);table.append(row);
 }
 const events=COMMUNITY.recent(state,8);
 if(!events.length){
  const p=document.createElement('p');p.className='empty-note';p.textContent='The community board is quiet for now.';
  news.append(p);
 }
 for(const event of events){
  const row=document.createElement('div');row.className='club-news-entry';
  const date=document.createElement('small');date.textContent='DAY '+event.day+' · '+places[event.place]?.[0];
  const detail=document.createElement('p');detail.textContent=COMMUNITY.describe(event,cast);
  row.append(date,detail);news.append(row);
 }
 const links=Object.entries(COMMUNITY.hydrate(state).links)
  .filter(([,v])=>(v.matches||0)>=2||(v.meetings||0)>=2)
  .sort((a,b)=>(b[1].matches||0)+(b[1].meetings||0)-(a[1].matches||0)-(a[1].meetings||0));
 for(const [pair,progress] of links.slice(0,4)){
  const [a,b]=pair.split(':');
  const p=document.createElement('p');p.className='club-link';
  p.textContent=(cast[a]?.name||a)+' & '+(cast[b]?.name||b)+' · '+
   ((progress.matches||0)>=2?'Competitive rivals':'Familiar friends');
  connections.append(p);
 }
 if(!links.length){
  const p=document.createElement('p');p.className='empty-note';
  p.textContent='Friendships and rivalries emerge as the season progresses.';
  connections.append(p);
 }
 $('communityDialog').showModal();
}
function renderCompetitiveCircuit(locked){
 const root=$('competitiveEvents');if(!root)return;
 root.replaceChildren();
 const board=document.createElement('button');board.type='button';board.className='activity';
 board.textContent='▦ Community Board · NPC standings, rivalries & club news';
 board.disabled=locked;board.onclick=openCommunityBoard;root.append(board);
 const turning=CONSEQ.opportunities(state)[0];
 if(turning){
  const reflect=document.createElement('button');reflect.type='button';reflect.className='activity';
  reflect.disabled=locked;
  reflect.textContent=(state.location==='center'?'↗ Reflect on your match with ':'↗ Visit the Center to reflect on ')+
   (cast[turning.npc]?.name||'a rival')+' · free';
  reflect.onclick=()=>act('consequence');
  root.append(reflect);
 }
 const entries=COMPETE.available(state);
 for(const entry of entries){
  const button=document.createElement('button');button.type='button';button.className='activity';button.disabled=locked;
  const title=document.createElement('strong');title.textContent='⚔ '+entry.title;
  const detail=document.createElement('small');detail.textContent=(cast[entry.npc]?.name||'Circuit trainer')+' · '+entry.description;
  button.append(title,detail);button.onclick=()=>act('competitive:'+entry.id);root.append(button);
 }
 const c=COMPETE.hydrate(state),local=COMPETE.localProgress(state);
 if(state.location!=='center'&&state.day>=2&&state.day<=90&&!c.daily[state.day]){
  const button=document.createElement('button');button.className='activity';button.disabled=locked;
  button.textContent='Train at the Community Center';
  button.onclick=()=>{state.location='center';state.selected=null;persist();say('Narrator','The practice tables are set up for today’s rotating challenge.');};
  root.append(button);
 }
 if(state.location!=='shop'&&state.day<=90&&COMPETE.localDay(state.day)&&local.status==='open'&&(local.round>0||state.slot<=1)){
  const button=document.createElement('button');button.className='activity';button.disabled=locked;
  button.textContent='Visit today’s Saturday Local at The Lucky Draw';
  button.onclick=()=>{state.location='shop';state.selected=null;persist();say('Narrator','The local circuit has gathered for its weekly matches.');};
  root.append(button);
 }
 const hint=document.createElement('p');hint.className='empty-note';
 const next=COMPETE.upcoming(state);
 hint.textContent=(state.day<=90&&COMPETE.localDay(state.day)&&local.status==='champion'?'You won this week’s local!':
  state.day<=90&&COMPETE.localDay(state.day)&&local.status==='eliminated'?'This week’s local is over for you.':
  next?'Next Saturday Local: Day '+next+' at The Lucky Draw. Two rounds, one day.':'The competitive season has ended.')+
  ' Daily challenges run at the Community Center and refresh each new day.';
 root.append(hint);
}
function renderBracketProgress(){
 const root=$('bracketProgress');if(!root)return;
 // Keep bracket DOM stable across ordinary dialogue renders; only game progress updates it.
 const stamp=JSON.stringify([state.day,...TOURNAMENTS.cups.map(cup=>{
  const current=TOURNAMENTS.status(state,cup.id);
  return [cup.id,current.state,current.round,current.results?.length||0];
 })]);
 if(root.dataset.tournamentStamp===stamp)return;
 root.dataset.tournamentStamp=stamp;root.replaceChildren();
 for(const cup of TOURNAMENTS.cups){
  const progress=TOURNAMENTS.status(state,cup.id);
  const model=window.NeoRpgTournamentPresentation?.bracketModel?.(cup,progress,state.day,cast);
  if(!model)continue;
  const card=document.createElement('section');
  card.className='bracket-card neo-circuit-card'+(model.state==='champion'?' bracket-champion':'')+
   (model.state==='eliminated'?' bracket-eliminated':'');
  card.setAttribute('aria-label',model.title+' · '+model.headline);
  const title=document.createElement('strong');title.className='neo-bracket-title';title.textContent=model.title;
  const label=document.createElement('span');label.className='neo-bracket-status';label.textContent=model.headline;
  const rounds=document.createElement('div');rounds.className='neo-bracket-rounds';
  for(const item of model.rows){
   const row=document.createElement('div');
   row.className='neo-bracket-round'+(item.label==='CLEARED'?' is-cleared':'')+
    (item.current?' is-current':'')+(item.label==='ELIMINATED'?' is-eliminated':'');
   row.setAttribute('aria-label','Round '+item.round+': '+item.opponent+' · '+item.label);
   const number=document.createElement('span');number.className='neo-bracket-round__num';number.textContent=String(item.round).padStart(2,'0');
   const name=document.createElement('span');name.className='neo-bracket-round__name';name.textContent=item.opponent;
   const result=document.createElement('span');result.className='neo-bracket-round__state';result.textContent=item.label;
   row.append(number,name,result);rounds.append(row);
  }
  card.append(title,label,rounds);root.append(card);
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
 const img=document.createElement('img');img.src=cast[id].portrait||'/rpg-assets/'+id+'.png';img.alt=cast[id].name;img.loading='lazy';
 img.onerror=()=>{img.style.display='none';const span=document.createElement('span');span.className='avatar-fallback';span.textContent=cast[id].name.split(' ').map(x=>x[0]).join('');img.parentElement.append(span);};
 return img;
}

function renderJourney(){
 const root=$('journeyProgress');root.replaceChildren();
 const stats=JOURNEY.currentRun(state,CG);
 const overview=document.createElement('p');overview.className='journey-overview';
 overview.textContent='Season '+stats.run+' · Day '+stats.day+' / 90 · '+stats.gallery.unlocked+'/'+stats.gallery.total+' memories across runs';
 root.append(overview);
 const progress=document.createElement('div');progress.className='journey-track';
 const fill=document.createElement('div');fill.className='journey-fill';fill.style.width=Math.max(0,Math.min(100,stats.gallery.percent))+'%';
 progress.append(fill);root.append(progress);
 for(const item of JOURNEY.milestones(state,CG)){
  const p=document.createElement('p');p.className='journey-goal';
  const title=document.createElement('strong');title.textContent=item.title;
  const body=document.createElement('span');body.textContent=item.detail;
  p.append(title,body);root.append(p);
 }
 const open=document.createElement('button');open.className='journey-gallery';
 open.textContent='Open memory album · '+stats.gallery.unlocked+'/'+stats.gallery.total;
 open.onclick=openGallery;root.append(open);
}
function mandatoryClosureDue(){
 return !!MANDATORY&&MANDATORY_EVENTS.some(e=>e.kind==='season'&&!state.mandatoryEventState?.seen?.[e.id]&&state.day>=e.earliestDay);
}
function renderSeasonReport(){
 const root=$('endSeason');root.replaceChildren();
 const complete=EPILOGUE.completed(state)&&!mandatoryClosureDue();
 root.hidden=!complete;
 if(!complete)return;
 const r=EPILOGUE.report(state);
 root.className='campaign-complete season-finale';
 const heading=document.createElement('h2');heading.textContent=r.title;
 const preface=document.createElement('p');preface.className='finale-subtitle';
 preface.textContent='NEO HARBOR · SEASON '+r.run+' · DAY 90 / 90';
 const closing=document.createElement('p');closing.className='finale-closing';closing.textContent=r.closing;
 const numbers=document.createElement('div');numbers.className='finale-stats';
 const details=[['Duels',r.played],['Victories',r.wins],['Draws',r.draws],['Circuit points',r.points],['Stories',r.storyScenes],['Town encounters',r.encounters],['Side quests',r.sidequests],['Plans kept',r.appointments],['Special moments',r.situations],['Gallery memories',r.galleryEarned]];
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
 const history=JOURNEY.archive(state),past=document.createElement('div');
 past.className='finale-archive';
 const archiveHeading=document.createElement('h3');archiveHeading.textContent='Your earlier seasons';
 past.append(archiveHeading);
 if(!history.length){
  const first=document.createElement('p');first.textContent='Your first season will be saved here when you choose New Game+.';past.append(first);
 }else for(const season of history){
  const row=document.createElement('p');row.className='finale-archive-entry';
  row.textContent='Season '+season.run+' · '+season.title+' · '+season.wins+' wins · '+season.points+' points · '+season.memories+' collected memories';
  past.append(row);
 }
 if(r.seasonLessons?.length){
  const lessons=document.createElement('section');lessons.className='finale-lessons';
  const title=document.createElement('h3');title.textContent='What changed along the way';
  lessons.append(title);
  for(const line of r.seasonLessons){
   const item=document.createElement('p');item.textContent=line;lessons.append(item);
  }
  root.append(preface,heading,closing,numbers,trophyTitle,trophies,social,lessons,past,footer);
 }else root.append(preface,heading,closing,numbers,trophyTitle,trophies,social,past,footer);
}

// Presentation-only navigation: game state and action handlers remain authoritative.
const rpgPanelGroups={
 scene:['WHO\'S HERE','YOUR DAY','TOWN LIFE'],
 stories:['STORY OPPORTUNITIES','UNEXPECTED MOMENTS','SIDE QUESTS','LOCAL ENCOUNTERS'],
 plans:['WHAT NEXT?','TODAY\'S PRIORITY','UPCOMING PLANS','AROUND TOWN NOW'],
 progress:['YOUR 90-DAY JOURNEY','TOURNAMENT BRACKETS','YOUR DECK','SEASON JOURNAL']
};
let rpgActivePanel='plans',rpgLocalTab='people',lastRenderedLocation=null;
function ensureRpgLayout(){
 if(typeof document.querySelector!=='function')return;
 const sidebar=document.querySelector('.sidebar'),sceneRoot=$('scene');
 if(!sidebar||!sceneRoot||$('rpgPanelTabs'))return;
 const nav=document.createElement('nav');nav.id='rpgPanelTabs';nav.className='rpg-panel-tabs';nav.setAttribute('aria-label','RPG information');
 for(const [id,label] of Object.entries({scene:'Here',plans:'Today',stories:'Stories',progress:'Progress'})){
  const b=document.createElement('button');b.type='button';b.dataset.panel=id;b.textContent=label;
  b.onclick=()=>{rpgActivePanel=id;refreshRpgPanels();};nav.append(b);
 }
 sidebar.prepend(nav);
 const castRoot=document.createElement('div');castRoot.id='rpgSceneCast';castRoot.className='rpg-scene-cast';castRoot.setAttribute('aria-label','Characters at this location');
 sceneRoot.append(castRoot);
 const dock=document.createElement('section');dock.id='rpgActionDock';dock.className='rpg-action-dock';
 dock.setAttribute('aria-label','Things to do here');sceneRoot.append(dock);
}
function refreshRpgPanels(){
 if(typeof document.querySelector!=='function')return;
 const sidebar=document.querySelector('.sidebar');if(!sidebar)return;
 for(const section of sidebar.querySelectorAll(':scope > .side-section')){
  const heading=section.querySelector('.sidebar-title span')?.textContent||'';
  const group=Object.entries(rpgPanelGroups).find(([,names])=>names.some(name=>heading.includes(name)))?.[0]||'progress';
  section.hidden=group!==rpgActivePanel;
 }
 for(const button of $('rpgPanelTabs')?.querySelectorAll('button')||[]){
  const active=button.dataset.panel===rpgActivePanel;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
 }
}
// Guest art includes separately exported expressions; original cast keeps its portrait.
const expressionGuests=new Set(['alma','jun','nereo','teo','elio']);
// Cache failed optional variants so dialogue does not repeatedly request missing art.
const failedScenePortraits=new Set();
const solExpressions={neutral:'neutral',surprised:'surprised',vulnerable:'worried',irritated:'worried',determined:'neutral',happy:'smile'};
function scenePortraitSource(id,expression){
 const fallback=cast[id].portrait||'/rpg-assets/'+id+'.png';
 let candidate=fallback;
 if(expressionGuests.has(id))candidate='/rpg-assets/characters/'+id+'/vn-expressions/'+expression+'.webp';
 if(id==='sol')candidate='/rpg-assets/characters/sol/expressions/'+(solExpressions[expression]||'neutral')+'.png';
 return failedScenePortraits.has(candidate)?fallback:candidate;
}
function dialogueExpression(line){
 const s=String(line||'').toLowerCase();
 if(/[!?]{2}|\b(wow|what?!|seriously|no way)\b/.test(s))return 'surprised';
 if(/\b(sorry|afraid|miss|alone|worried|sad|wish)\b/.test(s))return 'vulnerable';
 if(/\b(never|stop|annoy|ridiculous|angry|hate)\b/.test(s))return 'irritated';
 if(/\b(win|challenge|ready|promise|fight|battle|prove)\b/.test(s))return 'determined';
 if(/[!]|\b(thanks|great|wonderful|happy|love|fun|glad)\b/.test(s))return 'happy';
 return 'neutral';
}
function renderRpgCast(ids,locked,shown,portraitId){
 if(typeof document.querySelector!=='function')return;
 const root=$('rpgSceneCast');if(!root)return;
 const speaking=Object.keys(cast).find(id=>shown?.speaker===cast[id].name||shown?.speaker===id);
 // An NPC must not appear to be speaking during the player's or narrator's lines.
 const focused=speaking||null;
 // Keep the actual speaker visible even in crowded locations (six-character cap).
 const participants=[...new Set([focused,...ids,portraitId].filter(id=>!!cast[id]))].slice(0,6);
 if(state.location==='home'||!participants.length){root.hidden=true;root.replaceChildren();return;}
 root.hidden=false;
 // Narrator and player lines should not dim every NPC in the location.
 const inConversation=!!focused&&!!(shown?.line||locked);
 root.classList.toggle('is-conversation',inConversation);
 // Preserve existing DOM nodes between dialogue lines so CSS transitions actually play.
 const existing=new Map([...root.children].map(node=>[node.dataset.npc,node]));
 for(const id of participants){
  let button=existing.get(id);
  if(!button){
   button=document.createElement('button');button.type='button';button.dataset.npc=id;
   button.className='rpg-cast-member is-entering';
   button.append(makeAvatar(id));
   const name=document.createElement('span');name.textContent=cast[id].name.split(' ')[0];button.append(name);
   button.onclick=()=>selectPerson(id);
   button.addEventListener('animationend',event=>{if(event.target===button)button.classList.remove('is-entering');});
  }
  button.style.setProperty('--cast-order',String(participants.indexOf(id)));
  const active=inConversation&&id===focused;
  button.classList.toggle('is-speaking',active);
  button.classList.toggle('is-listening',inConversation&&!active);
  button.disabled=locked||inConversation;
  button.title='Talk to '+cast[id].name;
  button.setAttribute('aria-label','Talk to '+cast[id].name);
  const image=button.querySelector('img');
  if(image){
   const expression=active?(window.NeoRpgCharacterMotion?.emotion?.(shown?.expression,dialogueExpression(shown?.line))||dialogueExpression(shown?.line)):'neutral';
   const path=scenePortraitSource(id,expression);
   if(image.getAttribute('src')!==path){
    const fallback=cast[id].portrait||'/rpg-assets/'+id+'.png';
    image.classList.remove('expression-change');
    image.style.display='';
    image.onerror=()=>{
     // Ignore asynchronous failures from an older portrait request.
     const failed=image.getAttribute('src');
     if(failed!==path&&failed!==fallback)return;
     if(failed===path&&path!==fallback){
      failedScenePortraits.add(path);
      image.src=fallback;
      return;
     }
     image.style.display='none';
     if(!button.querySelector('.avatar-fallback')){
      const span=document.createElement('span');span.className='avatar-fallback';
      span.textContent=cast[id].name.split(' ').map(x=>x[0]).join('');button.insertBefore(span,button.lastElementChild);
     }
    };
    image.onload=()=>{
     image.style.display='';
     button.querySelector('.avatar-fallback')?.remove();
    };
    image.src=path;
    if(!window.NeoRpgCharacterMotion?.expressionChange?.(image))image.classList.add('expression-change');
   }
  }
  root.append(button);existing.delete(id);
 }
 for(const node of existing.values())node.remove();
}
function cleanRpgLabel(value){
 return String(value||'')
  .replace(/\s*·\s*⏳[^·]*/g,'')
  .replace(/\s*·\s*[+-]\d+\s*(?:affection|trust|focus|credits|points|pts|insight|reputation|preparation)(?:\s*\/\s*[+-]\d+\s*\w+)?/gi,'')
  .replace(/\s*·\s*free(?:\s*\([^)]*\))?/gi,'')
  .replace(/\s*·\s*\d+\s*period(?:\(s\))?/gi,'')
  .trim();
}
function simplifyRpgLabels(){
 if(typeof document.querySelector!=='function')return;
 for(const id of ['choices','storyEvents','situationEvents','townActivities','townEncounters','sideQuestEvents','activities']){
  const root=$(id);if(!root)continue;
  for(const button of root.querySelectorAll('button')){
   const walk=document.createTreeWalker(button,NodeFilter.SHOW_TEXT);
   const nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);
   for(const node of nodes)node.nodeValue=cleanRpgLabel(node.nodeValue);
  }
 }
}
function renderRpgActions(locked,shown){
 if(typeof document.querySelector!=='function')return;
 const dock=$('rpgActionDock');if(!dock)return;
 const hasDialogue=locked||((shown?.choices?.length||0)>0)||!!(shown?.line);
 $('dialogue').hidden=!hasDialogue;
 dock.hidden=hasDialogue;
 if(hasDialogue)return;
 dock.replaceChildren();
 const header=document.createElement('div');header.className='rpg-dock-header';
 const heading=document.createElement('strong');heading.textContent='Explore '+places[state.location][0];
 header.append(heading);
 const tabs=document.createElement('div');tabs.className='rpg-dock-tabs';
 for(const [id,title] of [['people','Characters'],['stories','Events'],['circuit','Circuit'],['activities','Activities']]){
  const b=document.createElement('button');b.textContent=title;b.className=id===rpgLocalTab?'active':'';
  b.setAttribute('aria-pressed',String(id===rpgLocalTab));b.onclick=()=>{rpgLocalTab=id;renderRpgActions(false,{speaker:'Narrator',line:'',choices:[]});};
  tabs.append(b);
 }
 header.append(tabs);dock.append(header);
 const body=document.createElement('div');body.className='rpg-dock-items';
 const ids=rpgLocalTab==='people'?['people']:rpgLocalTab==='stories'?['storyEvents','situationEvents','sideQuestEvents','townEncounters']:rpgLocalTab==='circuit'?['competitiveEvents']:['townActivities','activities'];
 for(const id of ids)for(const source of $(id)?.children||[]){
  if(source.tagName!=='BUTTON'||source.disabled)continue;
  const b=document.createElement('button');b.className='rpg-dock-action';
  const text=source.querySelector('strong')?.textContent||source.textContent||'';
  b.textContent=text.replace(/\s*·\s*⏳[^·]*/g,'').replace(/\s*·\s*\+\d+[^·]*/g,'').trim();
  b.onclick=()=>source.click();body.append(b);
 }
 if(rpgLocalTab==='activities'&&state.location==='shop'&&state.deckJourney?.starter&&!controlsLocked()){
  const shop=document.createElement('button');
  shop.type='button';shop.className='rpg-dock-action booster-shop-entry';
  shop.textContent='✦ Browse booster packs · free';
  shop.onclick=openBoosterShop;
  body.prepend(shop);
 }
 if(!body.children.length){const p=document.createElement('p');p.textContent=rpgLocalTab==='people'?'Nobody is around right now. Try another period.':'Nothing available here right now.';body.append(p);}
 dock.append(body);
}
function render(){
 // Detect actual location changes after the first render; navigation remains free.
 const previousLocation=lastRenderedLocation;
 lastRenderedLocation=state.location;
 if(previousLocation&&previousLocation!==state.location){
  window.NeoRpgAudio?.play?.('travel');
  window.NeoRpgInterface?.onLocationChange?.();
  window.NeoRpgTimeTransitions?.presentTravel?.({
   from:places[previousLocation]?.[0]||previousLocation,
   to:places[state.location]?.[0]||state.location
  });
 }
 window.NeoRpgAudio?.setScene?.(state.location,state.slot);
 ensureRpgLayout();
 window.NeoRpgInterface?.init?.();
 maybeStartMandatory();
 renderJourney();
 renderCollection();
 const ended=state.day>90,locked=!!state.mandatoryEventState?.active||!!state.activeSituation||!!state.activeStory||!!state.activeEncounter||!!state.activeArc||!!state.activeSideQuest||!!state.pendingDuel;
 renderPlanner(locked);
 renderDailyIntention(locked);
 const receipt=state.lastDuelReceipt;
 $('duelReceipt').hidden=!receipt;
 if(receipt){
  $('receiptTitle').textContent=receipt.outcome.toUpperCase()+' · '+receipt.name;
  $('receiptDetails').textContent='+'+receipt.points+' circuit points · +'+receipt.credits+' credits · +'+receipt.trust+' trust'+(receipt.bonus?' (includes +'+receipt.bonus+' exhibition points)':'')+(receipt.trainingBonus?' · +'+receipt.trainingBonus+' training credits':'')+(receipt.tournamentBonus?.points?' · tournament bonus included':'')+(receipt.competitiveBonus?' · local circuit bonus included':'')+' · Time advanced one period.';
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
 const showingMandatory=state.mandatoryEventState?.active?MANDATORY_EVENTS.find(x=>x.id===state.mandatoryEventState.active.id):null;
 const mandatoryLine=showingMandatory?.lines?.[state.mandatoryEventState.active.index];
 const mandatoryPortrait=mandatoryLine&&cast[mandatoryLine.speaker]?mandatoryLine.speaker:(showingMandatory?.kind==='bond'?showingMandatory.characterId:null);
 const showingSituation=state.activeSituation?SITUATIONS.byId(state.activeSituation.id):null;
 const showingStory=state.activeStory?STORY.byId(state.activeStory.id):null;
 const showingEncounter=state.activeEncounter?WORLD.byEncounter(state.activeEncounter.id):null;
 const showingArc=state.activeArc?ARC.byId(state.activeArc.id):null;
 const sideQuest=state.activeSideQuest?SIDE.byId(state.activeSideQuest.id):null,sideOwner=sideQuest?.stages[state.sideQuests[state.activeSideQuest?.id]?.step]?.npc;
  const portraitId=mandatoryPortrait||showingSituation?.npc||showingStory?.npc||showingEncounter?.npc||(showingArc?'reina':null)||sideOwner||state.selected,portraitRoot=$('portrait');portraitRoot.replaceChildren();
 if(portraitId&&cast[portraitId])portraitRoot.append(makeAvatar(portraitId));
 $('homeBanner').hidden=state.location!=='home'||!!portraitId;
 $('homeBanner').textContent='YOUR APARTMENT  ·  DAY '+state.day+'  ·  '+periods[state.slot]+' — Prepare your deck, review your plans or rest.';
 let shown=showingMandatory?renderMandatory():showingSituation?showSituation():showingStory?renderStory():showingEncounter?showEncounter():showingArc?showArc():state.activeSideQuest?showSideQuest():scene;
 $('speaker').textContent=shown?.speaker||'Narrator';$('line').textContent=shown?.line||'The town is waiting.';$('choices').replaceChildren();
 const responseActions=new Set(['mandatoryChoice','storyChoice','sideChoice','arcChoice','encounterChoice','situationChoice','sideDuel','sidePause','dateBook','dateActivity','dateSlot','book','socialPlan','dateInvite','flirt']);
 const isPlayerPrompt=!!shown?.choices?.some(([,action])=>responseActions.has(action.split(':')[0]));
 const promptRoot=$('playerChoicePrompt'),promptPanel=$('playerChoicePanel'),choiceList=$('choices');
 const newPlayerPrompt=!!(promptRoot?.hidden&&isPlayerPrompt);
 if(promptRoot&&promptPanel){
  promptRoot.hidden=!isPlayerPrompt;
  const desiredParent=isPlayerPrompt?promptPanel:$('dialogue');
  if(choiceList.parentElement!==desiredParent)desiredParent.append(choiceList);
  choiceList.classList.toggle('centered',isPlayerPrompt);
 }
 for(const [label,action] of shown.choices||[]){
  const b=document.createElement('button');b.className='choice'+(action==='storyFinish'?' finish':'');b.textContent=label;
  if(action.startsWith('storyChoice:')){
   const event=STORY.byId(state.activeStory.id),chosen=event.choices[Number(action.split(':')[1])],bond=state.relationships[event.npc];
   b.disabled=chosen.kind==='commit'&&!VN.commitmentReady(state,event.npc);
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
 if(newPlayerPrompt){
  const first=[...choiceList.children].find(b=>!b.disabled);
  if(typeof first?.focus==='function')first.focus({preventScroll:true});
 }
 if(!locked&&shown?.line&&!shown?.choices?.length){
  const b=document.createElement('button');b.className='choice finish';b.textContent='Continue ›';
  b.onclick=()=>closeSceneDialogue();$('choices').append(b);
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
  const bond=BONDS.progress(state,id,BOND_PLAN),chapter=document.createElement('small');
  chapter.className='character-chapter-progress';chapter.textContent='♥ Character chapters '+bond.completed+' / '+bond.total+(state.bondTrials?.[id]?' · Personal challenge won':'');
  label.append(name,sub,chapter);
  if(!locked&&state['met_'+id]&&REACT.reaction(state,id,c,cast,COMMUNITY,CONSEQ)){
   const cue=document.createElement('small');cue.className='character-reaction-hint';cue.textContent='✦ Something to say';
   label.append(cue);
  }
  b.append(avatar,label);b.onclick=()=>selectPerson(id);$('people').append(b);
 }
 renderRpgCast(people,locked,shown,portraitId);
 const characterActions=$('characterActions');
 if(characterActions){
  const selected=state.selected&&people.includes(state.selected)&&!locked?state.selected:null;
  characterActions.hidden=!selected;
  characterActions.replaceChildren();
  if(selected){
   const display=cast[selected].name.split(' ')[0],buttons=[
    ['☏ Talk',()=>selectPerson(selected),'Talk to '+cast[selected].name],
    ['⚔ Duel',()=>startDuel(selected),'Challenge '+cast[selected].name+' to a duel']
   ];
   if(state.deckJourney?.starter){
    buttons.push(['⌕ Scout',()=>{
     persist();location.assign('/rpg_deck_studio.html?scout='+encodeURIComponent(selected));
    },'Review '+cast[selected].name+'’s usual theme deck and plan your upgrades']);
   }
   if(PARTNER.unlocked(state,selected)&&state.deckJourney?.starter)
    buttons.push(['▤ Deck',()=>act('partnerDeck:'+selected),'Edit '+display+'’s deck']);
   for(const [label,action,title] of buttons){
    const button=document.createElement('button');
    button.type='button';button.className='character-action-btn';
    button.textContent=label;button.title=title;button.onclick=action;
    characterActions.append(button);
   }
  }
 }
 portraitRoot.hidden=state.location!=='home'&&(people.length>0||!!portraitId);
 $('storyEvents').replaceChildren();const stories=eligibleStories();
 for(const e of stories){
  const b=document.createElement('button');b.className='event-btn';b.disabled=locked;b.textContent='✦  '+e.title+' · ⏳ 1 period';
  const chapter=BOND_PLAN.byEvent[e.id];
  const small=document.createElement('small');
  small.textContent=cast[e.npc].name+(chapter?' · Bond chapter '+chapter.chapter+' / 4':'')+(e.evergreen?' · available until season end':' · limited-time encounter');
  b.append(small);b.onclick=()=>startStory(e.id);$('storyEvents').append(b);
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
 renderCompetitiveCircuit(locked);
 renderAppointments(locked);
 renderSeasonReport();
 $('journal').replaceChildren();const stats=document.createElement('p');stats.className='stats';stats.textContent='🏆 '+state.points+' circuit points   ·   ◈ '+state.credits+' credits';$('journal').append(stats);
 for(const e of eventCards.filter(e=>e.day>=state.day).slice(0,2)){const p=document.createElement('p');p.textContent='DAY '+e.day+' · '+e.title+' ('+periods[e.slot]+')';$('journal').append(p)}
 for(const note of state.journal.slice(0,3)){const p=document.createElement('p');p.textContent='• '+note;$('journal').append(p)}
 $('notice').textContent=state.mandatoryEventState?.active?'Incoming story — finish this moment to continue.':state.activeSituation?'Unexpected encounter in progress — finish the scene to continue.':state.activeSideQuest?'Side quest in progress — finish the scene to continue.':state.activeStory?'Story in progress: complete this scene to continue.':state.activeArc?'A private rivalry chapter is in progress.':state.activeEncounter?'Local encounter in progress — make your decision.':state.pendingDuel?'Your duel is in progress.':'Travel & talk are free · ⏳ actions advance time';
 simplifyRpgLabels();
 refreshRpgPanels();
 renderRpgActions(locked,shown);
 window.NeoRpgCharacterMotion?.update?.({
  location:state.location,speaker:shown?.speaker||'',line:shown?.line||'',
  dialogue:$('dialogue'),speakerElement:$('speaker'),lineElement:$('line')
 });
 $('deckPicker').disabled=locked||ended||!!state.deckJourney;
 if($('deckPicker')?.options.length)$('deckPicker').value=state.playerDeck;
}

$('deckStudioBtn').onclick=()=>{if(!controlsLocked()&&state.deckJourney?.starter){persist();location.assign('/rpg_deck_studio.html');}};
$('galleryBtn').onclick=openGallery;
$('galleryClose').onclick=()=>$('galleryDialog').close();
$('galleryCharacter').onchange=renderGallery;$('galleryCategory').onchange=renderGallery;$('galleryUnseen').onchange=renderGallery;
$('cgMomentClose').onclick=()=>$('cgMoment').close();
$('preDuelNext').onclick=advancePreparedDuel;
$('preDuelStart').onclick=launchPreparedDuel;
$('preDuelSkip').onclick=launchPreparedDuel;
$('preDuelDialog').addEventListener('cancel',e=>e.preventDefault());
$('quickNext').onclick=()=>act('rest');$('quickHome').onclick=()=>act('home');$('calendarBtn').onclick=openCalendar;$('calendarClose').onclick=()=>$('calendarDialog').close();$('communityClose').onclick=()=>$('communityDialog').close();
$('save').onclick=()=>{persist();$('notice').textContent='Campaign saved in this browser.'};
$('dismissReceipt').onclick=()=>{state.lastDuelReceipt=null;persist();render();};
document.addEventListener('keydown',e=>{if((e.key===' '||e.code==='Space')&&!['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target?.tagName)){if(scene.dialogue&&scene.index<scene.dialogue.length-1&&!state.mandatoryEventState?.active&&!state.activeStory&&!state.activeArc&&!state.activeSideQuest){e.preventDefault();act('chatNext');}else if(state.mandatoryEventState?.active?.phase==='lines'){e.preventDefault();act('mandatoryNext');}else if(state.activeStory?.phase==='lines'){e.preventDefault();act('storyNext');}else if(state.activeArc?.phase==='lines'){e.preventDefault();act('arcNext');}else if(!$('dialogue').hidden&&!state.activeSituation&&!state.mandatoryEventState?.active&&!state.activeStory&&!state.activeEncounter&&!state.activeArc&&!state.activeSideQuest&&!state.pendingDuel&&!scene.choices?.length){e.preventDefault();closeSceneDialogue();}}});
async function initDecks(){
 try{
  const select=$('deckPicker');select.replaceChildren();
  if(state.deckJourney!==null){
   const opt=document.createElement('option');opt.value='custom';opt.textContent=state.deckJourney.starter?COLLECT.byId(state.deckJourney.starter).name+' · Your collection':'Choose your starter above';
   select.append(opt);select.value='custom';select.disabled=true;
   select.onchange=()=>{select.value='custom';};
  }else{
   const res=await fetch('/api/classic/decks');if(!res.ok)throw Error('Could not load decks');
   const data=await res.json();for(const d of data.decks.filter(x=>x.id!=='custom')){
    const opt=document.createElement('option');opt.value=d.id;opt.textContent=d.name;select.append(opt);
   }
   if([...select.options].some(o=>o.value===state.playerDeck))select.value=state.playerDeck;
   else{select.value='blackout';state.playerDeck='blackout';}
   select.onchange=()=>{if(controlsLocked()){select.value=state.playerDeck;return;}state.playerDeck=select.value;persist();};
  }
 }catch(e){$('notice').textContent='Deck list unavailable: '+e.message;}
}
window.NeoRpgAudio?.init?.();
persist();render();initDecks();loadCardNames();if(state.deckJourney&&!state.deckJourney.starter&&!state.ended&&!state.pendingDuel)showStarterChoice();if(state.deckJourney?.lastPack&&!state.deckJourney.lastPack.opened&&!state.pendingDuel)showPackReveal();if(state.pendingDuel){
 if(state.pendingDuel.deckCards)sessionStorage.setItem('neoRpgDeck:'+state.pendingDuel.id,JSON.stringify(state.pendingDuel.deckCards));
 if(state.pendingDuel.customOpponentDeck)sessionStorage.setItem('neoRpgNpcDeck:'+state.pendingDuel.id,JSON.stringify(state.pendingDuel.customOpponentDeck));
 if(PRE.isReady(state.pendingDuel)){
  $('duel').hidden=true;$('battle').src='about:blank';showPreparedDuel();
 }else{
  $('duel').hidden=false;
  window.NeoRpgAudio?.setPaused?.(true);
  $('battle').src=duelUrl(state.pendingDuel);
 }
}
})();