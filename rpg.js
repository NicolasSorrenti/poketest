'use strict';
(()=>{
const $=id=>document.getElementById(id),KEY='neoHarborRpgV1',STORY=window.NeoHarborStory,SCHEDULES=window.NeoRpgSchedules,WORLD=window.NeoRpgWorld,ARC=window.NeoRpgRivalArc,TOURNAMENTS=window.NeoRpgTournaments,COMPETE=window.NeoRpgCompetitiveLoop,BRIDGE=window.NeoRpgDuelBridge;
const PACK=window.NeoRpgNarrativePack,SIDE=window.NeoRpgSideQuests,EPILOGUE=window.NeoRpgEpilogue,APPOINTMENTS=window.NeoRpgAppointments,INTENTIONS=window.NeoRpgIntentions,CG=window.NeoRpgCGGallery,PLANNER=window.NeoRpgDailyPlanner,SOCIAL=window.NeoRpgSocialActivities,DATES=window.NeoRpgPlannedDates,PRE=window.NeoRpgPreDuel,SITUATIONS=window.NeoRpgSituations,SLICE=window.NeoRpgSliceOfLife,JOURNEY=window.NeoRpgSeasonJourney,COLLECT=window.NeoRpgCollection,RPGD=window.NeoRpgDialogue,BONDS=window.NeoRpgBondRewards,PARTNER=window.NeoRpgPartnerDecks,VN=window.NeoRpgConversations;
const TUTORIAL=window.NeoRpgTutorials||null;
const INVITES=window.NeoRpgEventInvites||null,SCENE_CAST=window.NeoRpgSceneCast,MANDATORY=window.NeoRpgMandatoryEvents||null,REACT=window.NeoRpgReactivity,COMMUNITY=window.NeoRpgCommunity,CONSEQ=window.NeoRpgConsequences,NPC_DECKS=window.NeoRpgNpcDeckProgression,TIME=window.NeoRpgTimeCoordinator,REL=window.NeoRpgRelationships,MEM=window.NeoRpgDialogueMemory||null;
const MANDATORY_EVENTS=[...(window.NeoRpgSeasonEvents?.events||[]),...(window.NeoRpgCharacterPacks?.mandatoryEvents||[])];
const periods=['Morning','Afternoon','Evening'];
const OUTFITS=window.NeoRpgOutfits;
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
 hana:{name:'Hana Mizuno',age:20,deck:'power_reserve',style:'Wigglytuff · Teamwork',locs:['shop','cafe','park'],slots:[0,1],days:[1,2,3,4,5,6],intro:'Oh! You must be our new challenger. Welcome to Neo Harbor!',repeat:'You made it! I was hoping I would run into you again.',talk:["The beginner table asked for four Jigglypuff. We own three. Guess who lent them hers?","Someone signed up for the cup as 'The Human Coin Flip.' Nobody knows who it is.","I get about five quiet minutes here before somebody asks where the sleeves are."],flirt:'That was unexpectedly sweet. You should warn me before you say things like that.',duelWin:'You won! You are fitting in frighteningly fast.',duelLose:'That was fun! We should play again soon.'},
 reina:{name:'Reina Kurogane',age:21,portrait:'/rpg-assets/characters/reina/portraits/primary.png',deck:'blackout',style:'Haymaker · Aggression',locs:['shop','center'],slots:[1,2],days:[1,2,3,4,5,6],intro:'So you are the challenger who came here to win it all. Big words.',repeat:'Back again? Good. I would hate to run out of competition.',talk:["I drew six Energy and a Trainer last night. Not a Basic in sight. Wonderful opening.","I heard you tried one of Yuna's combos. Did you survive?","That Trainer you played on turn one last match? Don't do that again."],flirt:'You always talk this much before a match? I could get used to it.',duelWin:'Fine. That was a good game. Enjoy the win while it lasts.',duelLose:'You are improving. Not quickly enough, but improving.'},
 shiori:{name:'Shiori Tsukishima',age:23,deck:'overgrowth',style:'Damage Swap · Defense',locs:['cafe','library','park'],slots:[0,2],days:[2,4,6],intro:'You are new here. You seem to know exactly why you came.',repeat:'A pleasant coincidence. Would you like to talk?',talk:["That player kept a Switch in hand for three turns. I wonder if you noticed why.","I found an old tournament program in my bag. It has somebody else's notes in the margin.","The library's heating is unbearable after lunch. This table is a much better place to read."],flirt:'You are unexpectedly direct. I shall remember that.',duelWin:'A thoughtful performance. Thank you for the match.',duelLose:'You saw more of the position than you realize.'},
 yuna:{name:'Yuna Hoshino',age:19,deck:'zap',style:'Clefable · Surprise',locs:['arcade','shop'],slots:[1,2],days:[1,3,5,6,0],intro:'New face! Excellent. My audience was getting bored of me winning.',repeat:'Hey, challenger! I have at least three questionable ideas today.',talk:["My Clefable copied a move it couldn't afford to use. I call that ambition.","Someone laughed through my whole match yesterday. I did too, until I saw the replay.","I named the new combo 'Revenge of the Missing Basic.' It has a logo now."],flirt:'Whoa, that was smoother than my last combo. And it actually worked!',duelWin:'Okay, okay. I demand an extremely theatrical rematch.',duelLose:'I knew it! The chaos strategy is scientifically sound!'},
 akari:{name:'Akari Fujimoto',age:22,deck:'gym_new_voltage',style:'Slowking · Denial',locs:['library','center','cafe'],slots:[0,1],days:[1,2,4,5],intro:'The newcomer? Your opening statistics will be interesting to study.',repeat:'I have revised my evaluation of your playstyle.',talk:["You held an Energy in hand last match. I have three theories. One involves lunch.","I replaced two Trainers last night. The opening odds went up a little.","I made a chart of everybody's preferred sleeves. It began as a note in the margin."],flirt:'I... did not have an appropriate response prepared.',duelWin:'An intriguing result. I will revise my assumptions.',duelLose:'Predictable? Perhaps. But consistency is a kind of elegance.'},
 camila:{name:'Camila Vega',age:24,deck:'rocket_lab',style:'Dark Vileplume · Control',locs:['shop','cafe'],slots:[1,2],days:[2,3,4,5,6],intro:'A new collector in my favorite town. How delightful.',repeat:'Ah, my favorite potential business partner.',talk:["See the crease in that holo? It cuts the price in half. I still like it.","Someone offered their grandfather's old card for a shiny promo. I sent them home to think.","You didn't show your last draw even after the match. Impressive self-control."],flirt:'Careful, darling. I might believe you.',duelWin:'An expensive lesson. Fortunately, I collect those too.',duelLose:'That was a lovely demonstration of leverage.'},
 marina:{name:'Marina Aoki',age:21,deck:'water_blast',style:'Rain Dance · Setup',locs:['park','cafe'],slots:[0,2],days:[0,2,3,5,6],intro:'Oh, hello. There is usually room for one more along the water.',repeat:'It is nice to see you again. The river is particularly beautiful today.',talk:["The ferry was late this morning. Even the gulls looked impatient.","The qualifier form keeps ending up on the table whenever I unpack my bag.","The river's almost smooth today. Give it an hour and it'll have opinions."],flirt:'That is a wonderful thing to say. Thank you.',duelWin:'You played beautifully. I enjoyed watching your plan come together.',duelLose:'Maybe patience really is worth something after all.'},
 kaede:{name:'Kaede Arashi',age:22,deck:'rocket_lab',style:'Dark Pokémon · Disruption',locs:['arcade','center','park'],slots:[1,2],days:[0,1,3,4,6],start:40,intro:'So you are the local hotshot? Cute town you have here.',repeat:'Still trying to figure me out? Keep trying.',talk:["Someone asked if I'm 'the one from that tournament.' I said no. They looked relieved.","That arcade high score lasted twenty minutes. Your locals take things personally.","I found the better move on the train home. Three stops too late."],flirt:'Heh. You are going to be trouble, aren’t you?',duelWin:'Not bad. You might actually be fun.',duelLose:'That expression on your face? Worth the trip.'}
};
Object.assign(cast,PACK.cast,SIDE.cast);
const BOND_PLAN=BONDS.build(STORY.events,cast);
for(const [id,look] of Object.entries({...PACK.looks,...SIDE.looks}))if(cast[id])cast[id].appearance=look;
const exhibitionOpponents={7:'yuna',14:'reina',21:'hana',30:'reina',42:'kaede',60:'akari',75:'camila',88:'reina',90:'shiori'};
const eventCards=[{day:7,slot:1,place:'arcade',title:'Arcade Friendly Cup',reward:7},{day:14,slot:1,place:'center',title:'Club Exhibition',reward:9},{day:21,slot:2,place:'shop',title:'Card Shop Night',reward:8},{day:30,slot:1,place:'center',title:'Neighborhood Cup',reward:15},{day:42,slot:1,place:'arcade',title:'Open Challenge',reward:10},{day:60,slot:1,place:'center',title:'Regional Qualifier',reward:22},{day:75,slot:2,place:'shop',title:'Final Practice Meet',reward:12},{day:88,slot:1,place:'center',title:'Championship Opening',reward:20},{day:90,slot:1,place:'center',title:'Championship Finale Exhibition',reward:25}];


function eligibleStories(){const nearby=SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location));return STORY.available(state).filter(e=>!e.evergreen||nearby.includes(e.npc));}
function storyDialogueLines(id){const lines=STORY.linesFor(state,id);return RPGD?.storyLines(id,lines)||lines;}
function startStory(id){
 if(state.activeSituation||state.activeSideQuest||state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel)return;
 const e=eligibleStories().find(e=>e.id===id);if(!e||!confirmTimeAdvance())return;
 state.selected=e.npc;state.activeStory={id:e.id,phase:'lines',index:0,choice:null};persist();render();
}
function renderStory(){
 const a=state.activeStory,e=STORY.byId(a.id);
 if(!e){state.activeStory=null;persist();return null;}
 if(a.phase==='lines'){
  const lines=storyDialogueLines(e.id),line=lines[Math.min(a.index,lines.length-1)];
  return {speaker:line.speaker==='Protagonist'?'You':(cast[line.speaker]?.name|| (line.speaker===e.npc?cast[e.npc].name:line.speaker)),line:line.text,choices:[[a.index<lines.length-1?'Continue ›':'Respond ›','storyNext']]};
 }
 if(a.phase==='choice'){
  // Keep the actual final line on screen while response choices are shown.
  const last=storyDialogueLines(e.id).at(-1);
  return {speaker:last?.speaker==='Protagonist'?'You':(cast[last?.speaker]?.name||last?.speaker||cast[e.npc].name),line:last?.text||'',choices:e.choices.map((c,i)=>[c.label,'storyChoice:'+i])};
 }
 const chosen=e.choices[a.choice];
 return {speaker:cast[e.npc].name,line:chosen.reply,choices:[['Finish scene','storyFinish']]};
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
 const id=e.npc;
 // STORY.resolve has already committed and mirrored the selected relationship effects.
 const chapterReward=BONDS.reward(state,e,BOND_PLAN,COLLECT);
 log('Finished '+e.title+' with '+cast[id].name+'.');const storyMemories=recordCG('story_milestone',id,{eventId:e.id});recordIntention('story');
 if(chapterReward)log('Bond chapter '+chapterReward.chapter+' reward from '+cast[id].name+': '+chapterReward.label+'.');
 state.activeStory=null;advance();state.selected=id;
 persist();closeSceneDialogue();showCGMoment(storyMemories[0]);
 if(chapterReward)$('notice').textContent='★ Chapter reward: '+chapterReward.label;
}


function beginSideQuest(id){
 if(state.activeSituation||state.activeSideQuest||state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel||state.day>90)return;
 const chapter=SIDE.available(state,currentPeople()).find(x=>x.quest.id===id);
 // Duel stages do not spend time until the actual match is launched.
 if(!chapter||(chapter.stage.kind!=='duel'&&!confirmTimeAdvance()))return;
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
 if(a.phase==='duel')return {speaker:cast[e.npc].name,line:'Ready for a real match? No special rules, no going easy.',choices:[['Play the match','sideDuel'],['Not right now','sidePause']]};
 if(a.phase==='choice'){
  const last=SIDE.linesFor(state,a.id).at(-1);
  return {speaker:last?.speaker==='Protagonist'?'You':(cast[last?.speaker]?.name||last?.speaker||cast[e.npc].name),line:last?.text||'',choices:e.choices.map((c,i)=>[c.label,'sideChoice:'+i])};
 }
 return {speaker:cast[e.npc].name,line:e.choices[a.choice].reply,choices:[['Finish chapter','sideFinish']]};
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
 advance();persist();closeSceneDialogue();
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

function defaults(){return {sideQuests:{},activeSideQuest:null,day:1,slot:0,location:'home',visitedLocations:{home:true},metReina:false,reinaTrust:0,reinaDuels:0,results:[],flags:{intro:false},journal:['The 90-day season begins.'],pendingDuel:null,bonds:{},talked:{},hungOut:{},eventsDone:{},points:0,credits:80,playerDeck:'blackout',selected:null,ended:false,storyDone:{},storyMissed:{},relationships:{},routeOutcomes:{},partner:null,activeStory:null,activeEncounter:null,activeArc:null,arcFlags:{},arcOutcomes:{},activityDone:{},encountersDone:{},focus:75,insight:0,reputation:0,preparation:0,lastDuelReceipt:null,tournaments:{},campaignHistory:[],ngPlus:0,appointments:[],appointmentSeq:0,scene:null,socialHistory:{},situationDone:{},activeSituation:null,sliceOfLifeDone:{},sliceOfLifeLastDay:0,activeSliceOfLife:null,deckJourney:null,competitive:null,npcReactivity:null,community:null,consequences:null,mandatoryEventState:null,playmatGifts:{},playmatSelected:'aurora',gameplayTutorials:{disabled:false,seen:{}}}}
const hadCampaignSave=!!localStorage.getItem(KEY);
let state;try{state=JSON.parse(localStorage.getItem(KEY))||defaults();if(!Number.isInteger(state.day)||state.day<1||state.day>91)throw Error('Invalid save');}catch{state=defaults()}
for(const [k,v] of Object.entries(defaults()))if(state[k]===undefined)state[k]=v;
if(!hadCampaignSave)state.deckJourney=COLLECT.fresh();
COLLECT.hydrate(state);
TUTORIAL?.hydrate(state);
if(!Array.isArray(state.campaignHistory))state.campaignHistory=[];
if(!Number.isInteger(state.ngPlus)||state.ngPlus<0)state.ngPlus=0;
if(!places[state.location])state.location='home';
if(!state.visitedLocations||typeof state.visitedLocations!=='object'||Array.isArray(state.visitedLocations))state.visitedLocations={home:true};
state.visitedLocations[state.location]=true;
if(!Number.isInteger(state.slot)||state.slot<0||state.slot>2)state.slot=0;
for(const k of ['results','journal'])if(!Array.isArray(state[k]))state[k]=defaults()[k];
for(const k of ['flags','bonds','talked','hungOut','eventsDone','storyDone','storyMissed','relationships','routeOutcomes'])if(!state[k]||typeof state[k]!=='object'||Array.isArray(state[k]))state[k]={};
if(!state.pendingDuel?.id||!cast[state.pendingDuel?.npc])state.pendingDuel=null;
if(state.pendingDuel)PRE.hydrate(state.pendingDuel);
for(const id of Object.keys(cast)){if(!state.bonds[id])state.bonds[id]={affection:0,trust:0,duels:0};}
STORY.normalize(state);
 MEM?.hydrate(state);
// The player's childhood friend begins with pre-existing trust, never automatic romance.
if(cast.laca&&!state.flags.lacaChildhoodFriendInitialized){
 const r=state.relationships.laca,b=state.bonds.laca;
 r.trust=Math.max(r.trust||0,5);r.affection=Math.max(r.affection||0,2);
 b.trust=Math.max(b.trust||0,r.trust);b.affection=Math.max(b.affection||0,r.affection);
 state.flags.lacaChildhoodFriendInitialized=true;
}
for(const id of Object.keys(cast)){const old=state.bonds[id],current=state.relationships[id];
 if(!state.flags['newStoryMigrated_'+id]){for(const key of ['affection','trust','duels'])current[key]=Math.max(current[key]||0,old[key]||0);
 state.flags['newStoryMigrated_'+id]=true;}
}
REL.hydrate(state,Object.keys(cast));
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
APPOINTMENTS.hydrate(state);APPOINTMENTS.expire(state);INTENTIONS.hydrate(state);CG.hydrate(state);SOCIAL.hydrate(state);DATES.hydrate(state,APPOINTMENTS,SOCIAL);SITUATIONS.hydrate(state);SLICE?.hydrate(state);
if(typeof state.activeStory==='string')state.activeStory=null;
STORY.recordExpiry(state);
if(MANDATORY)MANDATORY.hydrate(state,MANDATORY_EVENTS);
const persist=()=>{localStorage.setItem(KEY,JSON.stringify(state));window.NeoRpgCloudSave?.onLocalSave();};
const log=t=>{state.journal.unshift(t);state.journal=state.journal.slice(0,25)};
function recordIntention(kind){const result=INTENTIONS.record(state,kind);if(result)log('Daily priority fulfilled: '+result.title+' ('+result.rewardLabel+').');}
function recordCG(kind,npc,context=null){const entries=CG.record(state,kind,npc,context);if(entries.length)log(entries.length+' new memory illustration'+(entries.length===1?'':'s')+' unlocked for the CG Gallery.');return entries;}
let scene=state.scene&&typeof state.scene.speaker==='string'&&typeof state.scene.line==='string'&&Array.isArray(state.scene.choices)?state.scene:{speaker:'Narrator',line:'Ninety days. One championship. You came to Neo Harbor to win. Everyone else has their own plans.',choices:[]};

function queueMandatory(){
 if(!MANDATORY)return;
 MANDATORY.queue(state,MANDATORY_EVENTS);
}
function autoTravelForEvent(place){
 if(!place||!places[place]||state.location===place)return false;
 state.visitedLocations=state.visitedLocations||{};
 state.visitedLocations[place]=true;
 state.location=place;
 state.selected=null;
 return true;
}
function arriveForScheduledPlan(){
 if(state.pendingDuel||state.activeStory||state.activeSituation||state.activeEncounter||state.activeArc||state.activeSideQuest||state.activeAppointment||state.mandatoryEventState?.active)return false;
 const due=APPOINTMENTS.active(state).find(e=>e.day===state.day&&e.slot===state.slot&&places[e.place]);
 return due?autoTravelForEvent(due.place):false;
}
function mandatoryDestination(event){
 if(event?.place&&places[event.place])return event.place;
 if(event?.location&&places[event.location])return event.location;
 // Character packs can declare a destination; otherwise use the character's current schedule.
 if(event?.characterId){
  const scheduled=SCHEDULES.locationFor(event.characterId,state.day,state.slot,APPOINTMENTS.overrides(state));
  if(places[scheduled])return scheduled;
 }
 return null;
}
function maybeStartMandatory(){
 if(!MANDATORY)return;
 queueMandatory();
 if(MANDATORY.hydrate(state,MANDATORY_EVENTS).active)return;
 // Existing scripted dialogue, character choices, galleries, duel preparation and starter selection remain authoritative.
 if(state.activeSliceOfLife||scene.line||scene.choices?.length||state.deckJourney&&!state.deckJourney.starter
    ||$('cgMoment')?.open||$('preDuelDialog')?.open||$('galleryDialog')?.open||$('calendarDialog')?.open)return;
 // A due meeting takes precedence over an automatic story that would relocate the player.
 if(TIME.dueNow(state).length)return;
 const started=MANDATORY.takeNext(state,MANDATORY_EVENTS);
 if(started){autoTravelForEvent(mandatoryDestination(MANDATORY_EVENTS.find(e=>e.id===started.id)));persist();}
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
 if(a.phase==='choice'){
  const last=e.lines.at(-1);
  const remote=e.kind==='bond'&&(e.delivery==='remote'||!SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location)).includes(e.characterId));
  const speaker=last?.speaker==='Protagonist'?'You':(cast[last?.speaker]?.name||last?.speaker||'Narrator');
  return {speaker:remote&&cast[last?.speaker]?'✉ '+speaker+' · message':speaker,line:mandatoryText(last?.text||''),choices:e.choices.map((c,i)=>[c.label,'mandatoryChoice:'+i])};
 }
 const choice=e.choices[a.choice];
 const responseActor=[...e.lines].reverse().find(line=>cast[line.speaker])?.speaker;
 const remoteReply=e.kind==='bond'&&(e.delivery==='remote'||!SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location)).includes(e.characterId));
 const actorName=cast[e.characterId]?.name||e.characterId;
 return {speaker:e.kind==='bond'?(remoteReply?'✉ '+actorName+' · message':actorName):(cast[responseActor]?.name||'Narrator'),line:mandatoryText(choice?.reply||''),choices:[['Continue story ›','mandatoryFinish']]};
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

const tutorialQueue=[];
function displayTutorial(){
 const tip=tutorialQueue[0],card=$('gameplayTutorial');
 if(!card)return;
 card.hidden=!tip;
 if(!tip)return;
 $('tutorialProgress').textContent='GAMEPLAY TIP · '+tip.number+' OF '+tip.total;
 $('tutorialTitle').textContent=tip.title;
 $('tutorialText').textContent=tip.text;
}
function tutorialEvent(topic,inlineId=null){
 const tip=TUTORIAL?.record(state,topic);
 if(!tip)return;
 persist();
 if(inlineId){
  const box=$(inlineId);
  if(box){box.textContent='TIP '+tip.number+'/2 · '+tip.title+' — '+tip.text;box.hidden=false;}
 }else{tutorialQueue.push(tip);displayTutorial();}
}
function confirmTimeAdvance(periods=1){
 const pending=TIME.conflicts(state,periods)[0];
 if(!pending)return true;
 const when=pending.day===state.day?periods===1?'this period':'today':'on Day '+pending.day;
 return confirm('You agreed to meet '+(cast[pending.npc]?.name||'someone')+' '+when+
  ' at '+(places[pending.place]?.[0]||pending.place)+'. Advancing time will miss that appointment. Continue?');
}
function disableTutorials(disabled){
 TUTORIAL?.setDisabled(state,disabled);
 if(disabled){tutorialQueue.length=0;displayTutorial();}
 persist();
}
const atKey=(id)=>state.day+':'+state.slot+':'+id;
function advance(n=1,transitionSource='activity',suppressTimeFlash=false){const beforeDay=state.day,beforeSlot=state.slot;TIME.advanceClock(state,n);if(state.day>90)log('The Neo Harbor championship season has ended.');
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
queueMandatory();arriveForScheduledPlan();persist();if(!suppressTimeFlash)timeFlash(beforeDay,beforeSlot,transitionSource);}
function say(speaker,line,choices=[]){scene={speaker,line,choices};state.scene=scene;persist();render();}
function sayConversation(lines,afterChoices=[],reactionId=null,invitation=null,memory=null,casual=null){
 if(!Array.isArray(lines)||!lines.length)return;
 const script=lines.filter(x=>x&&typeof x.text==='string'&&typeof x.speaker==='string');
 if(!script.length)return;
 const first=script[0];
 scene={speaker:first.speaker==='Protagonist'?'You':cast[first.speaker]?.name||first.speaker,
  line:first.text,choices:script.length>1?[['Continue ›','chatNext']]:afterChoices,
  dialogue:script,index:0,afterChoices,reactionId,invitation,
   memoryId:memory?.kind==='followup'?memory.id:null,memoryOfferId:memory?.kind==='intro'?memory.id:null,
   casualId:casual?.id||null,asideId:casual?.asideId||null};
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
 if(scene.index===scene.dialogue.length-1&&scene.memoryId)MEM?.mark(state,scene.memoryId);
 if(scene.index===scene.dialogue.length-1&&scene.casualId)MEM?.markCasual(state,scene.casualId);
 if(scene.index===scene.dialogue.length-1&&scene.asideId)MEM?.markAside(state,scene.asideId);
 state.scene=scene;persist();render();
}
function closeSceneDialogue(){
 if(state.activeSliceOfLife||state.activeSituation||state.activeStory||state.activeEncounter||state.activeArc||state.activeSideQuest||state.pendingDuel||state.mandatoryEventState?.active)return;
 // Keep the current character selected after casual dialogue so Duel and Deck actions remain accessible.
 if(!state.selected||!cast[state.selected]||!currentPeople().includes(state.selected))state.selected=null;
 scene={speaker:'Narrator',line:'',choices:[]};
 state.scene=scene;
 persist();render();
}
// Narrate a destination only the first time the player visits it.
function travelTo(placeId,{intro=true}={}){
 if(!places[placeId]||controlsLocked()||state.location===placeId)return false;
 const firstVisit=!state.visitedLocations[placeId];
 state.visitedLocations[placeId]=true;
 state.location=placeId;state.selected=null;
 // The first visit introduces the place; later visits can contain a small surprise.
 if(!firstVisit&&placeId!=='home'&&!scheduleEvent()&&!eligibleStories().length&&beginSliceOfLife('entry')){tutorialEvent('travel');return true;}
 if(firstVisit&&intro)say('Narrator',places[placeId][1]);
 else{scene={speaker:'Narrator',line:'',choices:[]};state.scene=scene;persist();render();}
 tutorialEvent('travel');
 return true;
}
function publicAppointments(place){return [...APPOINTMENTS.overrides(state),...STORY.available(state,place),...SIDE.appointments(state),...(SLICE?.scheduleOverrides?.(state)||[])];}
function currentPeople(){if(state.day>90)return [];const regular=SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location));
for(const e of eligibleStories())if(!regular.includes(e.npc))regular.push(e.npc);
return regular;}
function availableInvitation(id,people=currentPeople()){
 if(!INVITES||!cast[id]||!people.includes(id))return null;
 return INVITES.choose(state,id,{
  present:people,appointments:APPOINTMENTS.statusAt(state),
  stories:eligibleStories(),sidequests:SIDE.available(state,people),
  arcs:ARC.available(state,people),situations:SITUATIONS.available(state,people),
  encounters:WORLD.availableEncounters(state,people),
  cups:TOURNAMENTS.available(state).map(c=>({id:c.id,npc:TOURNAMENTS.status(state,c.id)?.opponent})),
  competitions:COMPETE.available(state),
  exhibitions:scheduleEvent()?[{id:String(state.day),npc:exhibitionOpponents[state.day]}]:[],
  canAttend:plan=>DATES.canAttend(state,plan,people,{appointments:APPOINTMENTS,social:SOCIAL,cast})
 });
}
// Ordinary Talk remembers its own source topic. A callback can add a three-beat
// aside ONLY after the original topic was actually read on a prior day.
function ordinaryTalk(id,character,{first=false,present=[]}={}){
 const base=VN.dialogueEntry(state,id,character,RPGD,{first,present});
 const aside=!first&&['everyday','character','classic'].includes(base.source)&&base.id
   ?MEM?.aside(state,id,base.id):null;
 return {lines:aside?[...base.lines,...aside.lines]:base.lines,
  record:{id:base.id,asideId:aside?.id||null}};
}
function selectPerson(id,{skipInvitation=false}={}){
 if(state.activeSliceOfLife||state.activeSituation||state.activeStory||state.activeSideQuest||state.activeEncounter||state.activeArc||state.pendingDuel||!cast[id]||!currentPeople().includes(id))return;
 const c=cast[id],first=!state['met_'+id]&&!((id==='reina')&&state.metReina);
 const today=state.day+':'+id,fresh=!state.talked[today];
 state['met_'+id]=true;
 if(id==='reina')state.metReina=true;
 state.talked[today]=true;
 state.selected=id;
 const memories=recordCG('meet',id);
 persist();
 const invite=skipInvitation?null:availableInvitation(id);
 // Preserve first meetings and important invitations before a casual surprise.
 if(!first&&!invite&&beginSliceOfLife('talk',id))return;
 if(invite){
  const prompt=INVITES.dialogue(state,invite);
  sayConversation(prompt.lines,prompt.choices,null,invite);
 }else{
  const context=first?null:REACT.reaction(state,id,c,cast,COMMUNITY,CONSEQ);
  const invitations=fresh?VN.choices(state,id):[];
  const memory=!first&&!context&&!invitations.length?MEM?.offer(state,id):null;
  const casual=!context&&!memory?ordinaryTalk(id,c,{first,present:currentPeople()}):null;
  sayConversation(context?.lines||memory?.lines||casual?.lines,memory?.choices||invitations,context?.id||null,null,memory,casual?.record);
 }
 tutorialEvent('conversation');showCGMoment(memories[0]);
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
   a.title+' · ⏳ 1 period · '+a.focus+' focus'+(a.credits?' + '+a.credits+' credits':'')
   +(a.disabledReason?' · '+a.disabledReason:''),
   'socialDo:'+id+':'+a.id
 ]),['Back to conversation · free','back:'+id]];
}
function planSharedActivity(id){
 if(!cast[id]||!currentPeople().includes(id))return;
 const choices=sharedActivityChoices(id);
 if(!choices.length)return say(cast[id].name,'We could plan something another time.',options(id));
 const hint='I have some time free. What do you feel like doing together?';
 tutorialEvent('social');return say(cast[id].name,hint,choices);
}
function showEncounter(){
 const a=state.activeEncounter,e=a&&WORLD.byEncounter(a.id);
 if(!e)return null;
 const name=e.npc?cast[e.npc].name:'Neo Harbor';
 if(a.phase==='choice')return {speaker:'Narrator',line:e.intro,choices:e.choices.map((c,i)=>[c.label,'encounterChoice:'+i])};
 const decision=e.choices[a.choice];
 return {speaker:e.npc?name:'Narrator',line:decision.reply,choices:[['Continue','encounterFinish']]};
}
function startEncounter(id){
 if(state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel||state.day>90)return;
 const e=WORLD.availableEncounters(state,currentPeople()).find(x=>x.id===id);if(!e||!confirmTimeAdvance())return;
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
 state.activeEncounter=null;recordIntention('encounter');log('Encounter at '+places[e.place][0]+': '+e.title+'.');
 advance();persist();closeSceneDialogue();
}
function performActivity(id){
 if(state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel||state.day>90)return;
 if(WORLD.activitiesAt(state).some(x=>x.id===id&&!x.disabledReason)&&!confirmTimeAdvance())return;
 let result;try{result=WORLD.doActivity(state,id,currentPeople());}
 catch(err){$('notice').textContent=err.message;return;}
 const place=state.location;
 if(result.voucherSet==='latest'){
  // Award the voucher once, at completion, from sets already unlocked by the campaign.
  const set=COLLECT.shopPacks(state).filter(offer=>offer.unlocked).at(-1)?.set||'base1';
  COLLECT.awardVoucher(state,set);
  result.summary+=' You earned a '+COLLECT.SETS[set].name+' booster voucher to redeem at the card shop.';
 }
 log('Activity completed at '+places[place][0]+': '+result.summary);recordIntention('activity');
 advance();persist();say('Narrator',result.summary);tutorialEvent('activities');
}


function startArc(id){
 if(state.activeStory||state.activeEncounter||state.activeArc||state.pendingDuel||state.day>90)return;
 const e=ARC.available(state,currentPeople()).find(x=>x.id===id);
 // Rival duel preparation is free; startDuel owns its eventual time warning.
 if(!e||(e.id!=='reina_rival_trial'&&!confirmTimeAdvance()))return;
 state.activeArc={id,phase:'lines',index:0,choice:null};state.selected='reina';persist();render();
}
function showArc(){
 const a=state.activeArc,e=a&&ARC.byId(a.id);
 if(!e){state.activeArc=null;persist();return null;}
 if(a.phase==='lines'){
  const lines=ARC.linesFor(state,a.id),line=lines[Math.min(a.index,lines.length-1)];
  return {speaker:line[0]==='You'?'You':line[0],line:line[1],choices:[[a.index<lines.length-1?'Continue ›':'Respond ›','arcNext']]};
 }
 if(a.phase==='choice'){
  const last=ARC.linesFor(state,a.id).at(-1);
  return {speaker:last?.[0]==='You'?'You':(last?.[0]||cast.reina.name),line:last?.[1]||'',choices:e.choices.map((choice,i)=>[choice.label,'arcChoice:'+i])};
 }
 return {speaker:cast.reina.name,line:e.choices[a.choice].reply,choices:[['Finish conversation','arcFinish']]};
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
 log('Finished '+ARC.byId(id).title+' with '+cast.reina.name+'.');recordIntention('arc');
 if(report.ending)log('A personal chapter reached its conclusion.');
 advance();persist();closeSceneDialogue();
}



function renderSliceOfLife(){
 const active=state.activeSliceOfLife,e=SLICE.byId(active?.id);if(!e)return null;
 if(e.choices){
  const lines=SLICE.linesFor(state,e.id),reply=active.step===lines.length;
  const current=reply?{speaker:e.npc,text:e.choices[active.choice].reply}:lines[active.step];
  const choices=!reply&&active.step===lines.length-1?e.choices.map((c,i)=>[c.label,'sliceChoice:'+i]):[['Continue ›','sliceNext']];
  return {speaker:cast[current.speaker]?.name||current.speaker,line:current.text,choices};
 }
 const lines=[{speaker:'Narrator',line:e.intro},{speaker:cast[e.npc]?.name||e.npc,line:e.line},{speaker:'Narrator',line:e.close}];
 return {...lines[active.step],choices:[['Continue ›','sliceNext']]};
}
function beginSliceOfLife(trigger,npc=null){
 if(!SLICE||state.activeSliceOfLife)return false;
 const moment=SLICE.start(state,currentPeople(),trigger,npc);
 if(!moment)return false;
 state.selected=moment.npc;
 const memory=moment.choices?CG.byId(moment.id):recordCG('slice',moment.npc,{eventId:moment.id})[0];
 persist();render();showCGMoment(memory,!!moment.choices);
 return true;
}
function nextSliceOfLife(){
 const result=SLICE.next(state);
 if(!result)return;
 if(result.done){const moment=SLICE.byId(result.id);
  if(moment.choices)recordCG('slice',moment.npc,{eventId:moment.id});
  log('A small moment with '+(cast[moment?.npc]?.name||'a friend')+'.');
  persist();
  return closeSceneDialogue();}
 persist();render();
}

function showSituation(){
 const a=state.activeSituation,e=SITUATIONS.byId(a?.id);
 if(!e)return null;
 if(a.phase==='choice')return {speaker:'Narrator',line:e.intro,
  choices:[...e.options.map((o,i)=>[o.label,'situationChoice:'+i]),['Not now','situationCancel']]};
 return {speaker:cast[e.npc]?.name||'Trainer',line:e.options[a.choice].response,
  choices:[['Keep this memory','situationFinish'],['Leave this moment','situationCancel']]};
}
function beginSituation(id){
 if(state.activeSituation||state.activeStory||state.activeSideQuest||state.activeArc||state.activeEncounter||state.pendingDuel)return;
 if(!SITUATIONS.available(state,currentPeople()).some(e=>e.id===id)||!confirmTimeAdvance())return;
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
  closeSceneDialogue();
  showCGMoment(memories[0]);
 }catch(err){$('notice').textContent=err.message;}
}

function scheduleEvent(){return eventCards.find(e=>e.day===state.day&&e.slot===state.slot&&e.place===state.location&&!state.eventsDone[e.day+':'+e.title]);}
function act(action){
 const [type,id,part]=action.split(':');
 if(mandatoryAction(type,id))return;
 // Suppress unrelated actions while a surprise is underway.
 if(state.activeSliceOfLife){
  if(type==='sliceChoice'&&SLICE.choose(state,Number(id))){persist();render();return;}
  if(type==='sliceNext')return nextSliceOfLife();return;
 }
 if(type==='chatNext')return advanceConversation();
  if(type==='memoryChoice'){
   const topic=MEM?.threads[id]?.topic;
   if(!topic||id!==state.selected||scene.memoryOfferId!=='memory:'+id+':'+topic+':intro'||
      !Array.isArray(scene.dialogue)||scene.index!==scene.dialogue.length-1||!currentPeople().includes(id))return;
   const reply=MEM.choose(state,id,part);
   if(reply)return sayConversation(reply);
   return;
  }
 if(type==='eventInvite'){
  const invited=scene.invitation;
  if(!invited||invited.kind!==id||invited.id!==part||!currentPeople().includes(invited.npc))return;
  const live=availableInvitation(invited.npc);
  if(!live||live.kind!==id||live.id!==part){
   return say(cast[invited.npc].name,'Something has changed. We can try another time.');
  }
  // The original event handlers still own legality, time, rewards, CGs and saves.
  if(id==='appointment')return act('attend:'+part);
  if(id==='story')return startStory(part);
  if(id==='sidequest')return beginSideQuest(part);
  if(id==='arc')return startArc(part);
  if(id==='situation')return beginSituation(part);
  if(id==='encounter')return startEncounter(part);
  if(id==='cup')return act('cup:'+part);
  if(id==='competitive')return act('competitive:'+part);
  if(id==='exhibition')return act('event');
  return;
 }
 if(type==='eventChat'){
  if(scene.invitation?.npc===id&&currentPeople().includes(id))return selectPerson(id,{skipInvitation:true});
  return;
 }
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
  if(choices.length>1)tutorialEvent('appointments');
  return say(cast[id].name,choices.length===1?'I cannot commit to another meeting yet.':'Let us choose a day and plan what to do together.',
    choices.length===1?options(id):choices);
 }
 if(type==='dateSlot'){
  if(!cast[id]||!currentPeople().includes(id))return;
  const target=APPOINTMENTS.proposed(state,id,SCHEDULES)[Number(part)];
  if(!target)return say(cast[id].name,'That opening is gone.',plannedDateSlots(id));
  const choices=DATES.options(state,id,target.place,SOCIAL,cast).map(a=>[
   a.title+' · '+a.focus+' focus'+(a.credits?' + '+a.credits+' credits':'')+' when we meet',
   'dateActivity:'+id+':'+part+':'+a.id
  ]);
  choices.push(['Choose another day · free','dateInvite:'+id]);
  return say(cast[id].name,'What should we do at '+places[target.place][0]+'?',choices);
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
   const available=SOCIAL.options(state,id,currentPeople(),cast).find(x=>x.id===part&&!x.disabledReason);
   if(available&&!confirmTimeAdvance())return;
   const outcome=SOCIAL.complete(state,id,part,currentPeople(),cast);
   log('Spent time with '+cast[id].name+': '+outcome.title+'.');
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
  try{const goal=INTENTIONS.choose(state,id);log('Today’s priority: '+goal.title+'.');persist();render();tutorialEvent('priorities');}
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
 if(type==='home'){travelTo('home');return;}
 if(type==='where'){const c=cast[id],visit=SCHEDULES.nextVisit(id,state.day,state.slot,[]);return say('Narrator',c.name+(visit?' is usually around '+places[visit.place][0]+' on day '+visit.day+', '+periods[visit.slot]+'.':' has no announced public visits in the coming week.'),options(id));}
 if(type==='sleep'){if(state.location!=='home')return;const n=3-state.slot;if(!confirmTimeAdvance(n))return;advance(n,'sleep');return say('Narrator','You wake up to a new day in Neo Harbor.');}
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
 if(type==='cup'){if(!confirmTimeAdvance())return;try{const match=TOURNAMENTS.begin(state,id);return startDuel(match.npc,null,null,match);}catch(err){return say('Tournament Desk',err.message);}}
 if(type==='competitive'){
  if(!confirmTimeAdvance())return;
  try{const match=COMPETE.begin(state,id);return startDuel(match.npc,null,null,null,null,false,match);}
  catch(err){return say('Circuit Desk',err.message);}
 }
 if(type==='event'){const e=scheduleEvent();if(!e)return;return startDuel(exhibitionOpponents[e.day]||'reina',e);}
 if(type==='work')return performActivity('shop_shift');
 if(type==='practice')return state.location==='library'?performActivity('library_research'):state.location==='center'?performActivity('center_scrimmage'):performActivity('home_reflect');
 if(type==='rest'){if(state.day>90||!confirmTimeAdvance())return;advance();return say('Narrator','You take a break. Other lives in the town carry on.');}
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
  if(beginSliceOfLife('talk',id))return;
  persist();
  const context=REACT.reaction(state,id,c,cast,COMMUNITY,CONSEQ);
  const memory=!context?MEM?.offer(state,id):null;
  const casual=!context&&!memory?ordinaryTalk(id,c,{present:currentPeople()}):null;
  return sayConversation(context?.lines||memory?.lines||casual?.lines,memory?.choices||[],context?.id||null,null,memory,casual?.record);
 }
 if(type==='flirt'){
  state.talked['flirt:'+key]=true;
  const lines=RPGD?.flirtLines(id,c.flirt)||[{speaker:'Protagonist',text:'I had something playful to say, but now I am reconsidering.'},{speaker:id,text:c.flirt}];
  persist();
  return sayConversation(lines,[]);
 }
 if(type==='hang'){if(state.hungOut[state.day+':'+id])return say(c.name,'I enjoyed our time today. Let us make plans another day.',options(id));if(!confirmTimeAdvance())return;state.hungOut[state.day+':'+id]=true;REL.apply(state,id,{affection:2,trust:1});log('Spent time with '+c.name+'.');recordIntention('hangout');const memories=recordCG('hangout',id);advance();state.selected=null;say(c.name,Array.isArray(c.hangouts)&&c.hangouts.length?c.hangouts[(state.day+bond.duels)%c.hangouts.length]:'That was a lovely way to spend part of the day. See you around.');showCGMoment(memories[0]);return;}
}

const cardNames=new Map(),cardImages=new Map();
let packArtSerial=0;
let preDuelArtSerial=0;
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
 const setName=COLLECT.THEMED_PACKS?.find(x=>x.id===pack.theme)?.name||COLLECT.SETS[pack.set]?.name||'Base Set';
 $('packEyebrow').textContent=isVictory?'✦ DUEL REWARD · YOUR CARDS':'✦ NEO HARBOR · CARD REWARDS';
 $('packTitle').textContent=isVictory?(pack.cards.length===10?(pack.kind==='championship'?'CHAMPION BOOSTER':'VICTORY BOOSTER'):'VICTORY MINI BOOSTER'):'NEW BOOSTER';
 $('packDescription').textContent=setName+' · '+pack.cards.length+' cards. Tap to flip individual cards, or reveal them all.';
 const portrait=$('packGiver');portrait.replaceChildren();
 if(giver)window.NeoRpgDiscreetAvatars?.set?.(portrait,giver,'happy',cast[giver].name);
 const request=++packArtSerial; // An earlier booster image must never overwrite this giver.
 const fromShop=!isVictory&&!giver&&state.location==='shop';
 $('packContinue').textContent=$('boosterShopDialog').open?'Back to booster shop →':'Continue adventure →';
 if(fromShop){
  // Ordinary shop purchases have no named giver. Show the clerk's dedicated CG instead of an empty frame.
  const shopArt=new Image();
  shopArt.className='pack-giver-art';
  shopArt.alt='The Lucky Draw shopkeeper handing you a booster pack';
  shopArt.onerror=()=>{if(request===packArtSerial){portrait.replaceChildren(makeAvatar('hana'));}};
  shopArt.src='/rpg-assets/shop/shopkeeper-booster.webp';
  portrait.append(shopArt);
 }
 if(giver){
  // Show a known portrait immediately while optional artwork loads.
  const showPortrait=()=>{if(request===packArtSerial){portrait.replaceChildren(makeAvatar(giver));window.NeoRpgDiscreetAvatars?.set?.(portrait,giver,'happy',cast[giver].name);}};
  showPortrait();
  const candidates=PRE.boosterArtCandidates(giver);
  const art=new Image();
  art.alt=cast[giver].name+' presenting a booster';
  art.className='pack-giver-art';
  let attempt=0;
  const tryNext=()=>{
   if(request!==packArtSerial)return;
   if(attempt<candidates.length)art.src=candidates[attempt++];
   else showPortrait();
  };
  art.onload=()=>{if(request===packArtSerial){portrait.replaceChildren(art);window.NeoRpgDiscreetAvatars?.set?.(portrait,giver,'happy',cast[giver].name);}};
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
 $('packContinue').onclick=()=>{
  pack.opened=true;
  const queued=state.deckJourney?.pendingPacks?.shift()||null;
  if(queued)state.deckJourney.lastPack=queued;
  persist();modal.close();
  if(queued)showPackReveal();
  else{
   if($('boosterShopDialog').open){
    const shop=$('boosterShopDialog'),scroll=shop.scrollTop;
    renderBoosterShop('Booster added to your collection. Pick another or close the shop.');
    shop.scrollTop=scroll;
   }
   finishDuelRewardPresentation();
  }
 };
 modal.oncancel=e=>e.preventDefault(); // One handler, even after opening dozens of packs.
 modal.showModal();
 window.NeoRpgAudio?.play?.('booster');
}

const labelCard=id=>cardNames.get(id)||id.replace('base1-','Base #');
function controlsLocked(){return state.day>90||!!state.activeSliceOfLife||!!state.mandatoryEventState?.active||!!state.pendingDuel||!!state.activeSituation||!!state.activeStory||!!state.activeSideQuest||!!state.activeArc||!!state.activeEncounter;}
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
    say('Narrator','Your '+starter.name+' deck is ready. The Lucky Draw has two free welcome mini packs waiting for you—choose from three different types. Later packs unlock as you explore; old ones are still worth opening.');
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
 const summary=document.createElement('p');summary.textContent=starter.name+' · 60-card deck · '+total+' owned cards · '+journey.packs+' paid/voucher packs opened'+(journey.welcomePacks?' · '+journey.welcomePacks+' free welcome pick'+(journey.welcomePacks===1?'':'s')+' remaining':'');
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
 $('boosterTutorial').hidden=true;tutorialEvent('boosters','boosterTutorial');
 if(!$('boosterShopDialog').open)$('boosterShopDialog').showModal();
}
function purchaseBoosterPack(packId,useVoucher=false){
 try{
  const cards=useVoucher?COLLECT.redeemVoucher(state,packId):COLLECT.buyThemedPack(state,packId);
  const opened=state.deckJourney?.lastPack;
  const name=COLLECT.THEMED_PACKS?.find(x=>x.id===opened?.theme)?.name||
   COLLECT.SETS[packId]?.name||'Booster';
  const welcome=opened?.kind==='welcome';
  log('Opened '+name+' booster: '+cards.map(labelCard).join(', ')+'.');
  persist();
  // Leave the shop open underneath the reveal, so buying another pack needs no re-entry.
  say('Card Shop',(welcome?'Your welcome ':'Your ')+name+' booster is ready! Reveal your cards, then use the Deck Studio to improve your deck.');
  showPackReveal();
 }catch(e){
  $('boosterShopStatus').textContent=e.message;
  renderBoosterShop(e.message);
 }
}
function renderBoosterShop(message=''){
 const root=$('boosterShopGrid');root.replaceChildren();
 const remaining=state.deckJourney?.welcomePacks||0;
 $('boosterShopBalance').textContent='◈ '+(state.credits||0)+' credits · Day '+state.day+
  (remaining?' · '+remaining+' welcome mini pack'+(remaining===1?'':'s')+' to choose':'');
 $('boosterShopStatus').textContent=message||
  (remaining?'Choose any two opening mini packs for free. All three starter varieties stay in the shop afterward.':'Each pack has its own card pool. Earlier packs stay useful even as later eras unlock.');
 const wishes=(state.deckStrategy?.wishlist||[]).filter(id=>!(state.deckJourney?.owned?.[id]>0));
 for(const offer of COLLECT.themedPacks(state)){
  const box=document.createElement('article');box.className='booster-offer'+(offer.unlocked?'':' is-locked');
  const eyebrow=document.createElement('small');eyebrow.className='booster-offer-edition';
  eyebrow.textContent=offer.unlocked?'THEMED BOOSTER · AVAILABLE':'THEMED BOOSTER · LOCKED';
  const title=document.createElement('h3');title.textContent=offer.name;
  const desc=document.createElement('p');desc.textContent=offer.description;
  const sources=document.createElement('small');sources.className='booster-offer-edition';
  sources.textContent='PRINTINGS · '+(offer.sources.length?offer.sources.slice(0,3).map(s=>COLLECT.SETS[s]?.name||s).join(' · ')+(offer.sources.length>3?' · +'+(offer.sources.length-3)+' more':''):'Not yet discovered');
  const progress=document.createElement('div');progress.className='booster-collection-progress';
  const track=document.createElement('div');track.className='booster-collection-track';
  const fill=document.createElement('span');fill.style.width=offer.completion+'%';track.append(fill);
  const count=document.createElement('small');count.textContent=offer.owned+' / '+offer.total+' possible cards discovered · '+offer.completion+'%';
  progress.append(track,count);
  const targets=wishes.filter(id=>COLLECT.themeContains(state,offer.id,id));
  if(targets.length){
   const tip=document.createElement('small');tip.className='booster-offer-targets';
   tip.textContent='✦ '+targets.length+' missing tracked card'+(targets.length===1?'':'s')+
    ' could appear here · no card guaranteed';
   progress.append(tip);
  }
  const reason=document.createElement('p');reason.className='booster-offer-unlock';
  const free=offer.welcome>0&&offer.unlocked;
  reason.textContent=!offer.unlocked?offer.unlockHint:
   free?'Welcome choice · five cards · one Rare and one Basic Energy':
   'Ten cards · one Rare and one Basic Energy · original card rarities';
  if(offer.discount&&offer.unlocked&&!free)reason.textContent='Insight savings: -'+offer.discount+' credits · '+reason.textContent;
  const buy=document.createElement('button');buy.type='button';buy.className='booster-offer-buy';
  const affordable=(state.credits||0)>=offer.price;
  buy.disabled=!offer.unlocked||(!free&&!affordable)||controlsLocked();
  buy.textContent=free?'Choose free mini pack · '+offer.welcome+' left':
   offer.unlocked?'Buy · '+offer.price+' credits':'Unlocks later';
  if(offer.unlocked&&!free&&!affordable)
   reason.textContent='Need '+(offer.price-(state.credits||0))+' more credits · '+reason.textContent;
  buy.onclick=()=>purchaseBoosterPack(offer.id,false);
  box.append(eyebrow,title,desc,sources,progress,reason,buy);root.append(box);
 }
 // Chapter and tournament rewards earned in old or current saves remain
 // redeemable as their original source-set vouchers, separate from the new shop.
 for(const offer of COLLECT.shopPacks(state).filter(x=>x.vouchers>0)){
  const box=document.createElement('article');box.className='booster-offer';
  const eyebrow=document.createElement('small');eyebrow.className='booster-offer-edition';
  eyebrow.textContent='EARNED EXPANSION VOUCHER';
  const title=document.createElement('h3');title.textContent=offer.name+' · '+offer.vouchers+' free';
  const desc=document.createElement('p');desc.textContent='A ten-card reward from '+offer.name+' (original expansion printings).';
  const button=document.createElement('button');button.type='button';button.className='booster-offer-buy';
  button.textContent='Redeem gift voucher · free';button.disabled=controlsLocked();
  button.onclick=()=>purchaseBoosterPack(offer.set,true);
  box.append(eyebrow,title,desc,button);root.append(box);
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

function duelUrl(duel){const mats=window.NeoDuelPlaymats,gifts=mats?.gifted?.(state)||[],owned=mats?.available?.(gifts).map(m=>m.id)||['aurora'];const imported=localStorage.getItem(mats?.IMPORT_KEY||'neoCampusPlaymatImportSelection');const chosen=mats?.choose?.(imported&&owned.includes(imported)?imported:state.playmatSelected,owned)||'aurora';if(imported){localStorage.removeItem(mats.IMPORT_KEY);if(owned.includes(imported)){state.playmatSelected=chosen;persist();}}return '/classic_live.html?rpg=1&mat='+encodeURIComponent(chosen)+'&giftMats='+encodeURIComponent(gifts.join(','))+'&duelId='+encodeURIComponent(duel.id)+'&deck='+encodeURIComponent(duel.playerDeck)+'&opponent='+encodeURIComponent(duel.opponent)+'&npc='+encodeURIComponent(duel.npc)+'&npcName='+encodeURIComponent(cast[duel.npc].name)+'&npcTier='+encodeURIComponent(duel.npcDeckTier||1)+'&npcVariant='+encodeURIComponent(duel.npcDeckVariant||0)+'&prizes='+encodeURIComponent(duel.prizeCount===6?6:4);}

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
 const artRequest=++preDuelArtSerial;
 const matchStyle=window.NeoRpgTournamentPresentation?.matchModel?.(pending,{cast,cups:TOURNAMENTS.cups});
 modal.dataset.circuit=matchStyle?.kind||'friendly';
 $('preDuelContext').textContent=preview.stake;
 $('preDuelOpponent').textContent=preview.name;
 const accelerated=pending.npcDeckTier>(pending.day<=30?1:pending.day<=60?2:3);
 $('preDuelDeck').textContent=preview.deckLabel+(pending.customOpponentDeck?' · YOUR COLLABORATIVE BUILD':pending.npcDeckTier===3?' · EXPERT DECK'+(accelerated?' · PERSONAL MILESTONE':''):pending.npcDeckTier===2?' · REFINED DECK'+(accelerated?' · PERSONAL MILESTONE':''):'')+' · '+preview.place;
 const line=preview.lines[pending.preview.index];
 $('preDuelSpeaker').textContent=line.speaker;
 $('preDuelLine').textContent=line.text;
 $('preDuelNext').hidden=pending.preview.index>=preview.lines.length-1;
 $('preDuelStart').hidden=pending.preview.index<preview.lines.length-1;
 const placeholder=document.createElement('span');placeholder.className='preduel-placeholder';
 placeholder.textContent='✦ '+preview.name+' · '+preview.place;
 art.append(placeholder);
 // Show the portrait immediately, then prefer the eligible story CG.
 // If it is missing (or none is eligible), reuse the booster / battle chime-in art.
 const face=makeAvatar(preview.npc);face.className+=' preduel-portrait';art.append(face);
 window.NeoRpgDiscreetAvatars?.set?.(art,preview.npc,'determined',preview.name);
 const artworkCandidates=[
  ...(preview.artwork?.path?[{path:preview.artwork.path,kind:'event',alt:preview.artwork.title}]:[]),
  ...PRE.boosterArtCandidates(preview.npc).map(path=>({path,kind:'booster',alt:preview.name+' before the duel'}))
 ];
 const tryArtwork=index=>{
  if(index>=artworkCandidates.length||artRequest!==preDuelArtSerial)return;
  const choice=artworkCandidates[index],photo=new Image();
  photo.className='preduel-cg'+(choice.kind==='booster'?' preduel-booster-art':'');
  photo.alt=choice.alt;
  photo.onload=()=>{
   if(artRequest!==preDuelArtSerial||!PRE.isReady(state.pendingDuel)||state.pendingDuel.id!==preview.id)return;
   art.replaceChildren(photo);
   window.NeoRpgDiscreetAvatars?.set?.(art,preview.npc,'determined',preview.name);
  };
  photo.onerror=()=>{if(artRequest===preDuelArtSerial)tryArtwork(index+1);};
  photo.src=choice.path;
 };
 tryArtwork(0);
 if(!modal.open)modal.showModal();
}
function advancePreparedDuel(){
 if(!PRE.advance(state.pendingDuel))return;
 persist();showPreparedDuel();
}
function cancelPreparedDuel(){
 const pending=state.pendingDuel;
 // Never close a launched Classic duel through a preview-only cancellation.
 if(!PRE.isReady(pending))return;
 ++preDuelArtSerial; // Ignore artwork loads from the withdrawn preview.
 if(pending.tournamentId)TOURNAMENTS.cancel(state,pending);
 if(pending.arcEpisode){
  // Reopen the choice that offered this match, even after a save/reload.
  state.activeArc={id:pending.arcEpisode,phase:'choice',index:ARC.linesFor(state,pending.arcEpisode).length,choice:null};
 }
 state.pendingDuel=null;
 sessionStorage.removeItem(BRIDGE.sessionKey(pending.id));
 sessionStorage.removeItem('neoRpgDeck:'+pending.id);
 sessionStorage.removeItem('neoRpgNpcDeck:'+pending.id);
 if($('preDuelDialog').open)$('preDuelDialog').close();
 $('duel').hidden=true;
 $('battle').src='about:blank';
 persist();render();
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
 if(!tournament&&!competition&&!confirmTimeAdvance())return;
 if(competition&&!COMPETE.available(state).some(e=>e.id===competition.id&&e.npc===id))return;
 if(sideQuest&&(!SIDE.canDuel(state,sideQuest.id,currentPeople())||SIDE.byId(sideQuest.id)?.stages[sideQuest.step]?.npc!==id))return;
 if(bondChallenge&&!BONDS.canChallenge(state,id,BOND_PLAN))return;
 if(arcEpisode&&(!state.activeArc||state.activeArc.phase!=='choice'||!ARC.available(state,currentPeople()).some(e=>e.id===arcEpisode)))return;
 const c=cast[id],npcEditedCards=PARTNER.snapshot(state,id,c.deck);
 const npcDeckVariant=NPC_DECKS?.variantForDuel?.('npc-'+id+'-'+state.day+'-'+state.slot+'-'+state.results.length)??0;
 const npcDeckTier=NPC_DECKS?.tierForOpponent?.(state,id)??(state.day<=30?1:state.day<=60?2:3);
 state.pendingDuel={id:'npc-'+id+'-'+state.day+'-'+state.slot+'-'+state.results.length+'-'+Math.random().toString(36).slice(2,10),npc:id,day:state.day,slot:state.slot,npcDeckVariant,opponent:c.deck,playerDeck:state.deckJourney?.starter?'custom':state.playerDeck,deckCards:state.deckJourney?.starter?[...state.deckJourney.deck]:null,resolved:false,eventKey:exhibition?exhibition.day+':'+exhibition.title:null,eventReward:exhibition?exhibition.reward:0,eventTitle:exhibition?exhibition.title:null,arcEpisode:arcEpisode||null,tournamentId:tournament?.tournamentId||null,tournamentRound:tournament?.tournamentRound??null,tournamentAttempt:tournament?.tournamentAttempt??null,sideQuestId:sideQuest?.id||null,sideQuestStage:sideQuest?.step??null,bondChallenge:!!bondChallenge,customOpponentDeck:npcEditedCards,
  competitiveKind:competition?.kind||null,competitiveId:competition?.id||null,
  competitiveWeek:competition?.week??null,competitiveRound:competition?.round??null,
  competitiveTitle:competition?.title||null,npcDeckTier,
  // Routine encounters are shorter; championship finals and story arcs use full matches.
  prizeCount:(arcEpisode||tournament?.tournamentRound>=2||competition?.round>=2||/final|championship/i.test(competition?.title||''))?6:4};
 if(arcEpisode)state.activeArc=null;
 PRE.stage(state.pendingDuel);
 if(npcEditedCards)sessionStorage.setItem('neoRpgNpcDeck:'+state.pendingDuel.id,JSON.stringify(npcEditedCards));
 persist();render();
 $('duel').hidden=true;$('battle').src='about:blank';
 $('preDuelTutorial').hidden=true;tutorialEvent(tournament||competition?'tournaments':'duels','preDuelTutorial');
 showPreparedDuel();
}
window.addEventListener('message',ev=>{
 const duel=state.pendingDuel;
 if(ev.data?.type==='neo-rpg-playmat-selected'){
  if(!window.NeoRpgDuelBridge.acceptsPlaymat(ev,location.origin,$('battle').contentWindow,duel))return;
  const allowed=window.NeoDuelPlaymats.available(window.NeoDuelPlaymats.gifted(state)).map(m=>m.id);
  if(!allowed.includes(ev.data.playmat))return;
  state.playmatSelected=ev.data.playmat;persist();return;
 }
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
 const awarded=COLLECT.reward(state,receipt.outcome==='Victory',duel.npc,Math.random,{
  day:duel.day,duelId:receipt.duelId,
  championship:cupOutcome?.state==='champion',
  story:!!(duel.eventKey||duel.arcEpisode||duel.sideQuestId||duel.bondChallenge)
 });
 if(awarded)log('Won a '+awarded.length+'-card '+(awarded.length===10?'championship booster':'mini booster')+': '+awarded.map(labelCard).join(', ')+'.');
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
  receipt,hasBooster:!!awarded,avatar:makeAvatar(duel.npc),npcId:duel.npc,
  presentation:tournamentPresentation,onContinue:continueAfterResult
 });
 if(shown)window.NeoRpgDiscreetAvatars?.set?.($('victoryPortrait'),duel.npc,receipt.outcome==='Victory'?'happy':'vulnerable',cast[duel.npc].name);
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
    const attend=document.createElement('button');attend.className='meeting-attend';attend.dataset.plannerKey=String(meeting.id);
    attend.textContent=meeting.socialTone==='romantic'?'Go on date · ⏳':meeting.activityId?'Enjoy outing · ⏳':'Meet now · ⏳';
    const reason=DATES.canAttend(state,meeting,currentPeople(),{appointments:APPOINTMENTS,social:SOCIAL,cast});
    attend.disabled=locked||!!reason;if(reason)attend.title=reason;
    attend.onclick=()=>act('attend:'+meeting.id);controls.append(attend);
   }else{
    const travel=document.createElement('button');travel.className='meeting-attend';travel.textContent='Go there · free';travel.disabled=locked;travel.onclick=()=>{
     travelTo(meeting.place,{intro:false});
     if(currentPeople().includes(meeting.npc))selectPerson(meeting.npc);};controls.append(travel);
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
  travelTo(pick.place,{intro:false});
 }
 tutorialEvent('planner');
 // Free navigation can lead right into a character greeting, but never
 // executes the meeting/event before the player explicitly agrees.
 if(pick.kind==='appointment'){
  const meeting=APPOINTMENTS.active(state).find(x=>String(x.id)===pick.key);
  if(meeting&&currentPeople().includes(meeting.npc))return selectPerson(meeting.npc);
 }
 if(pick.kind==='social'&&currentPeople().includes(pick.key))return selectPerson(pick.key);
 // Story and other personal opportunities are introduced by the character
 // when they are physically here. A suggestion never auto-plays the event.
 const actor=pick.kind==='story'?STORY.byId(pick.key)?.npc:
  pick.kind==='sidequest'?SIDE.available(state,currentPeople()).find(x=>x.quest.id===pick.key)?.stage.npc:
  pick.kind==='arc'?'reina':
  pick.kind==='situation'?SITUATIONS.byId(pick.key)?.npc:
  pick.kind==='encounter'?WORLD.byEncounter(pick.key)?.npc:
  pick.kind==='tournament'?TOURNAMENTS.status(state,pick.key)?.opponent:null;
 if(actor&&currentPeople().includes(actor)){
  const invite=availableInvitation(actor);
  const kind=pick.kind==='tournament'?'cup':pick.kind;
  if(invite?.kind===kind&&invite.id===pick.key)return selectPerson(actor);
 }
 // Never auto-start a duel or a story: highlight the actual action instead.
 rpgLocalTab=pick.kind==='tournament'||pick.kind==='event'?'circuit':
  pick.kind==='activity'?'activities':'stories';
 renderRpgActions(false,{speaker:'Narrator',line:'',choices:[]});
 const section=$(pick.focusId);
 const owner=section?.closest?.('.side-section');
 const heading=owner?.querySelector?.('.sidebar-title span')?.textContent||'';
 rpgActivePanel=Object.entries(rpgPanelGroups).find(([,names])=>names.some(name=>heading.includes(name)))?.[0]||'plans';
 refreshRpgPanels();
 if($('rpgInfoPanel')?.getAttribute?.('aria-hidden')==='true')window.NeoRpgInterface?.toggle?.('info');
 const buttons=[...(section?.querySelectorAll?.('button')||[])].filter(x=>!x.disabled);
 const action=buttons.find(b=>b.dataset?.plannerKey===pick.key)||
  buttons.find(b=>b.textContent?.includes(pick.key)||b.textContent?.includes(pick.title.split(' · ')[0]))||buttons[0];
 (action||section)?.scrollIntoView?.({behavior:'smooth',block:'nearest'});
 action?.focus?.({preventScroll:true});
 $('notice').textContent='You are in the right place. Pick the highlighted opportunity when you are ready; no time was spent getting here.';
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

// Reuse existing character artwork until a scene-specific CG is installed.
function loadCGArt(image,entry,thumbnail,onSuccess,onMissing){
 const candidates=CG.artCandidates(entry,thumbnail);
 let index=0;
 const attempt=()=>{
  if(index>=candidates.length){image.hidden=true;onMissing?.();return;}
  const candidate=candidates[index++];
  image.onload=()=>{image.hidden=false;onSuccess?.(candidate.kind);};
  image.onerror=attempt;
  image.src=candidate.path;
 };
 attempt();
}
function showCGMoment(entry,encounterPreview=false){
 const preview=encounterPreview&&state.activeSliceOfLife?.id===entry?.id&&SLICE.byId(entry?.id)?.choices;
 if(!entry||(!CG.unlocked(state,entry.id)&&!preview))return;
 const photo=document.createElement('img');
 photo.alt=entry.title;
 loadCGArt(photo,entry,false,kind=>{
  if(preview&&state.activeSliceOfLife?.id!==entry.id)return;
  if(entry.category==='pre_duel'&&!state.pendingDuel)return;
  const modal=$('cgMoment'),root=$('cgMomentArt');
  const frame=document.createElement('div');
  frame.className='cg-art-frame'+(kind==='event'?'':' is-fallback');
  frame.append(photo);root.replaceChildren(frame);
  window.NeoRpgDiscreetAvatars?.set?.(root,entry.character,'surprised',cast[entry.character]?.name||entry.character);
  $('cgMomentTitle').textContent=entry.title;
  $('cgMomentCaption').textContent=cast[entry.character]?.name||entry.character;
  if(CG.unlocked(state,entry.id))CG.markViewed(state,entry.id);persist();
  if(!modal.open)modal.showModal();
 });
}
function showGalleryDetail(entry){
 const root=$('galleryPreview');root.replaceChildren();
 const title=document.createElement('h3');title.textContent=entry.title;
 const text=document.createElement('p');text.textContent=(cast[entry.character]?.name||entry.character)+' · '+entry.category.replace('_',' ')+' · '+entry.hint;
 const image=document.createElement('img');image.alt=entry.title;image.hidden=true;
 const frame=document.createElement('div');frame.className='cg-art-frame';frame.append(image);
 const placeholder=document.createElement('p');placeholder.className='cg-pending';placeholder.hidden=true;
 placeholder.textContent='Illustration not installed yet. This memory is unlocked, but no character artwork is currently available.';
 root.append(title,text,frame,placeholder);
 loadCGArt(image,entry,false,kind=>{
  frame.classList.toggle('is-fallback',kind!=='event');
  placeholder.hidden=true;
  CG.markViewed(state,entry.id);persist();renderGallery();
 },()=>{frame.hidden=true;placeholder.hidden=false;});
 window.NeoRpgDiscreetAvatars?.set?.(root,entry.character,'neutral',cast[entry.character]?.name||entry.character);
}
function populateGalleryCharacters(){
 const select=$('galleryCharacter'),previous=select.value;
 const ids=[...new Set(CG.catalog.map(entry=>entry.character))].filter(id=>!!cast[id]);
 ids.sort((a,b)=>cast[a].name.localeCompare(cast[b].name));
 const everyone=document.createElement('option');everyone.value='';everyone.textContent='All characters';select.replaceChildren(everyone);
 for(const id of ids){const option=document.createElement('option');option.value=id;option.textContent=cast[id].name;select.append(option);}
 select.value=ids.includes(previous)?previous:'';
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
   img.hidden=true;thumb.append(img);
   loadCGArt(img,entry,true,kind=>{img.classList.toggle('is-fallback',kind!=='event');});
   window.NeoRpgDiscreetAvatars?.set?.(thumb,entry.character,'neutral',cast[entry.character]?.name||entry.character);
  }else{
   const mystery=document.createElement('span');mystery.textContent='?';thumb.append(mystery);
  }
  const title=document.createElement('strong');title.textContent=entry.title;
  const note=document.createElement('small');note.textContent=(cast[entry.character]?.name||entry.character)+' · '+(entry.unlocked?'View memory':'Locked · '+entry.hint);
  tile.append(thumb,title,note);tile.onclick=()=>showGalleryDetail(entry);root.append(tile);
 }
}
function openGallery(){
 $('galleryPreview').replaceChildren();populateGalleryCharacters();renderGallery();$('galleryDialog').showModal();
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

// One spoiler-safe timeline for appointments, known stories and official fixtures.
function openCalendar(){
 const root=$('calendarEntries');root.replaceChildren();
 const now=APPOINTMENTS.stamp(state.day,state.slot);
 const rows=[];
 const add=(entry)=>{if(!places[entry.place])return;rows.push(entry);};
 for(const plan of APPOINTMENTS.active(state)){
  if(APPOINTMENTS.stamp(plan.day,plan.slot)<now)continue;
  const activity=SOCIAL.activities?.find(item=>item.id===plan.activityId);
  add({day:plan.day,slot:plan.slot,place:plan.place,kind:'Personal plan',
   title:'Meet '+(cast[plan.npc]?.name||'your friend'),
   detail:activity?.title||'Agreed meet-up',npc:plan.npc});
 }
 for(const e of eventCards){
  if(APPOINTMENTS.stamp(e.day,e.slot)<now||state.eventsDone?.[e.day+':'+e.title])continue;
  add({day:e.day,slot:e.slot,place:e.place,kind:'Official event',title:e.title,
   detail:'Scheduled circuit exhibition'});
 }
 for(const cup of TOURNAMENTS.cups){
  const progress=TOURNAMENTS.status(state,cup.id);
  if(cup.end<state.day||['champion','eliminated','expired','missed'].includes(progress.state))continue;
  add({day:Math.max(state.day,cup.day),slot:null,place:cup.place,kind:'Tournament',
   title:cup.title,detail:'Registration: Days '+cup.day+'–'+cup.end+
    (progress.round?' · Round '+(progress.round+1)+'/3':'')});
 }
 // Only reveal a story already available to a character the player has met.
 for(const event of STORY.available(state)){
  if(!state['met_'+event.npc]&&!(event.npc==='reina'&&state.metReina))continue;
  if(event.slot!==null&&event.slot!==undefined&&event.slot!==state.slot)continue;
  if(!places[event.place])continue;
  const present=SCHEDULES.peopleAt(state.day,state.slot,event.place,publicAppointments(event.place));
  if(!present.includes(event.npc))continue;
  add({day:state.day,slot:state.slot,place:event.place,kind:'Personal story',
   title:'A moment with '+cast[event.npc].name,
   detail:'A conversation is available now',npc:event.npc});
 }
 rows.sort((a,b)=>a.day-b.day||(a.slot??0)-(b.slot??0)||a.kind.localeCompare(b.kind));
 if(!rows.length){const p=document.createElement('p');p.className='empty-note';p.textContent='No known plans yet. Talk to people around town or check back later.';root.append(p);}
 let daySection=null,lastDay=null;
 for(const entry of rows){
  if(entry.day!==lastDay){
   lastDay=entry.day;daySection=document.createElement('section');daySection.className='rpg-calendar-day';
   const heading=document.createElement('h3');heading.textContent='Day '+entry.day+(entry.day===state.day?' · Today':'');
   daySection.append(heading);root.append(daySection);
  }
  const row=document.createElement('article');row.className='rpg-calendar-item';
  const type=document.createElement('small');type.className='rpg-calendar-type';type.textContent=entry.kind;
  const title=document.createElement('strong');title.textContent=entry.title;
  const detail=document.createElement('p');detail.textContent=(entry.slot===null?'Any period':periods[entry.slot])+
   ' · '+places[entry.place][0]+' · '+entry.detail;
  row.append(type,title,detail);
  const current=entry.day===state.day&&(entry.slot===null||entry.slot===state.slot);
  if(current){
   const action=document.createElement('button');action.type='button';
   action.textContent=entry.place===state.location?'View here':'Visit '+places[entry.place][0]+' · free';
   action.disabled=controlsLocked();
   action.onclick=()=>{
    $('calendarDialog').close();
    if(entry.place!==state.location)travelTo(entry.place);
    else if(entry.npc&&currentPeople().includes(entry.npc))selectPerson(entry.npc);
    else{rpgLocalTab=entry.kind==='Tournament'||entry.kind==='Official event'?'activities':'stories';renderRpgActions(false,{speaker:'Narrator',line:'',choices:[]});}
    if(entry.place===state.location&&entry.npc&&currentPeople().includes(entry.npc))return;
    if(entry.npc&&currentPeople().includes(entry.npc))selectPerson(entry.npc);
   };
   row.append(action);
  }
  daySection.append(row);
 }
 $('calendarDialog').showModal();
}
function makeAvatar(id,size=''){
 const img=document.createElement('img'),paths=portraitPaths(id,'neutral');
 img.src=paths.find(src=>!failedScenePortraits.has(src))||cast[id].portrait||'/rpg-assets/'+id+'.png';
 img.alt=cast[id].name;img.loading='lazy';
 img.onerror=()=>{
  failedScenePortraits.add(img.getAttribute('src'));
  const next=paths.find(src=>!failedScenePortraits.has(src));
  if(next){img.src=next;return;}
  img.style.display='none';
  if(!img.parentElement?.querySelector('.avatar-fallback')){
   const span=document.createElement('span');span.className='avatar-fallback';
   span.textContent=cast[id].name.split(' ').map(x=>x[0]).join('');
   img.parentElement?.append(span);
  }
 };
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
 scene:['WHO\'S HERE','YOUR DAY','TOWN LIFE','LOCAL CIRCUIT'],
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
// Outfit images are optional. All original character art remains a fallback.
const expressionGuests=new Set(['alma','jun','nereo','teo','elio']);
const failedScenePortraits=new Set();
let activeOutfitSceneId=null;
const solExpressions={neutral:'neutral',surprised:'surprised',vulnerable:'worried',irritated:'worried',determined:'neutral',happy:'smile'};
function portraitPaths(id,expression='neutral',sceneId=activeOutfitSceneId){
 const fallback=cast[id].portrait||'/rpg-assets/'+id+'.png';
 let legacy='';
 if(expressionGuests.has(id))legacy='/rpg-assets/characters/'+id+'/vn-expressions/'+expression+'.webp';
 if(id==='sol')legacy='/rpg-assets/characters/sol/expressions/'+(solExpressions[expression]||'neutral')+'.png';
 const art=cast[id].outfitArt||window.NeoRpgCharacterPacks?.byId?.(id)?.art||null;
 return OUTFITS?.sources?.(art,{location:state.location,slot:state.slot,day:state.day,sceneId},expression,{base:fallback,legacy})||[legacy,fallback].filter(Boolean);
}
function scenePortraitSource(id,expression,sceneId=activeOutfitSceneId){
 const paths=portraitPaths(id,expression,sceneId);
 return paths.find(src=>!failedScenePortraits.has(src))||paths[paths.length-1]||cast[id].portrait||'/rpg-assets/'+id+'.png';
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
function renderRpgCast(ids,locked,shown,portraitId,context={}){
 if(typeof document.querySelector!=='function')return;
 const root=$('rpgSceneCast');if(!root)return;
 // Only participants in the actual dialogue are onstage. Location attendance
 // still controls the map, people list and available activities.
 const composition=SCENE_CAST.select({cast,present:ids,portraitId,shown,...context});
 const {focused,participants}=composition;
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
   button.dataset.initials=cast[id].name.split(' ').map(part=>part[0]).join('').slice(0,2).toUpperCase();
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
   window.NeoRpgDiscreetAvatars?.set?.(button,id,expression,cast[id].name);
   const paths=portraitPaths(id,expression,context.sceneId);
   const path=scenePortraitSource(id,expression,context.sceneId);
   if(image.getAttribute('src')!==path){
    image.classList.remove('expression-change');
    image.style.display='';
    image.onerror=()=>{
     const failed=image.getAttribute('src');
     if(!paths.includes(failed))return;
     failedScenePortraits.add(failed);
     const next=paths.find(src=>!failedScenePortraits.has(src));
     if(next){image.src=next;return;}
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
 // The dock persists across dialogue/season updates: never throw away focused tabs
 // or the user's scroll position just to refresh event availability.
 let header=dock.querySelector('.rpg-dock-header');
 let body=dock.querySelector('.rpg-dock-items');
 if(!header||!body){
  dock.replaceChildren();
  header=document.createElement('div');header.className='rpg-dock-header';
  const heading=document.createElement('strong');heading.className='rpg-dock-heading';
  header.append(heading);
  const tabs=document.createElement('div');tabs.className='rpg-dock-tabs';
  for(const [id,title] of [['people','Characters'],['stories','Events'],['circuit','Circuit'],['activities','Activities']]){
   const button=document.createElement('button');button.type='button';button.dataset.tab=id;
   button.textContent=title;
   button.onclick=()=>{rpgLocalTab=id;renderRpgActions(false,{speaker:'Narrator',line:'',choices:[]});};
   tabs.append(button);
  }
  header.append(tabs);body=document.createElement('div');body.className='rpg-dock-items';
  dock.append(header,body);
 }
 header.querySelector('.rpg-dock-heading').textContent='Explore '+places[state.location][0];
 for(const button of header.querySelectorAll('[data-tab]')){
  const selected=button.dataset.tab===rpgLocalTab;
  button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));
 }
 const entries=[];
 const ids=rpgLocalTab==='people'?['people']:rpgLocalTab==='stories'?['storyEvents','situationEvents','sideQuestEvents','townEncounters']:rpgLocalTab==='circuit'?['competitiveEvents']:['townActivities','activities'];
 for(const id of ids){
  const sources=[...($(id)?.children||[])];
  for(let i=0;i<sources.length;i++){
   const source=sources[i];if(source.tagName!=='BUTTON'||source.disabled)continue;
   const text=source.querySelector('strong')?.textContent||source.textContent||'';
   const label=text.replace(/\s*·\s*⏳[^·]*/g,'').replace(/\s*·\s*\+\d+[^·]*/g,'').trim();
   entries.push({key:id+':'+i+':'+label,label,onClick:()=>source.click()});
  }
 }
 if(rpgLocalTab==='activities'&&state.location==='shop'&&state.deckJourney?.starter&&!controlsLocked()){
  entries.unshift({key:'shop:booster',label:'✦ Browse booster packs',onClick:openBoosterShop});
 }
 window.NeoRpgRenderPerf.reconcileKeyed(body,entries,
  ()=>{const button=document.createElement('button');button.type='button';button.className='rpg-dock-action';return button;},
  (button,item)=>{
   if(button.textContent!==item.label)button.textContent=item.label;
   button.onclick=item.onClick;
   button.classList.toggle('booster-shop-entry',item.key==='shop:booster');
  });
 if(!entries.length){
  const p=document.createElement('p');p.className='empty-note';
  p.textContent=rpgLocalTab==='people'?'Nobody is around right now. Try another period.':'Nothing available here right now.';
  body.append(p);
 }
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
 const ended=state.day>90,locked=!!state.activeSliceOfLife||!!state.mandatoryEventState?.active||!!state.activeSituation||!!state.activeStory||!!state.activeEncounter||!!state.activeArc||!!state.activeSideQuest||!!state.pendingDuel;
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
 const placeEntries=Object.entries(places).map(([id,[name,detail]])=>({key:id,id,name,detail}));
 window.NeoRpgRenderPerf.reconcileKeyed($('places'),placeEntries,
  ()=>{const button=document.createElement('button');button.type='button';const status=document.createElement('span');
   status.className='place-status';button.append(status);return button;},
  (button,item)=>{
   const {id,name,detail}=item;
   const glyph={home:'⌂',shop:'♠',arcade:'✦',park:'❀',cafe:'☕',center:'♜',library:'▤'}[id];
   const selected=id===state.location;
   const desired=glyph+'  '+name;
   if(button.firstChild?.nodeType===3){
    if(button.firstChild.nodeValue!==desired)button.firstChild.nodeValue=desired;
   }else button.prepend(document.createTextNode(desired));
   button.className='place'+(selected?' selected':'');
   button.disabled=locked;
   button.setAttribute('aria-current',selected?'location':'false');
   button.onclick=()=>travelTo(id);
   const status=button.querySelector('.place-status');
   const count=state.day<=90?SCHEDULES.peopleAt(state.day,state.slot,id,publicAppointments(id)).length:0;
   const label=selected?'HERE':count?count+' HERE':'›';
   if(status.textContent!==label)status.textContent=label;
  });
 $('placeTitle').textContent=places[state.location][0];$('placeDetail').textContent=places[state.location][1];
 const bgFiles={home:'home.jpg',shop:state.slot===2?'card-shop-evening.png':'card-shop-day.png',arcade:'arcade.jpg',park:'park.jpg',cafe:'cafe.jpg',center:'center.jpg',library:'library.jpg'};
 $('scene').style.backgroundImage="linear-gradient(0deg,#090b18ec 0%,#090b1860 80%),url('/rpg-assets/"+bgFiles[state.location]+"')";
 const showingMandatory=state.mandatoryEventState?.active?MANDATORY_EVENTS.find(x=>x.id===state.mandatoryEventState.active.id):null;
 const mandatoryLine=showingMandatory?.lines?.[state.mandatoryEventState.active.index];
 const mandatoryPortrait=mandatoryLine&&cast[mandatoryLine.speaker]?mandatoryLine.speaker:(showingMandatory?.kind==='bond'?showingMandatory.characterId:null);
 const showingSituation=state.activeSituation?SITUATIONS.byId(state.activeSituation.id):null;
 const showingSlice=state.activeSliceOfLife?SLICE.byId(state.activeSliceOfLife.id):null;
 const showingStory=state.activeStory?STORY.byId(state.activeStory.id):null;
 const showingEncounter=state.activeEncounter?WORLD.byEncounter(state.activeEncounter.id):null;
 const showingArc=state.activeArc?ARC.byId(state.activeArc.id):null;
 const sideQuest=state.activeSideQuest?SIDE.byId(state.activeSideQuest.id):null,sideOwner=sideQuest?.stages[state.sideQuests[state.activeSideQuest?.id]?.step]?.npc;
  const portraitId=mandatoryPortrait||showingSlice?.npc||showingSituation?.npc||showingStory?.npc||showingEncounter?.npc||(showingArc?'reina':null)||sideOwner||state.selected,portraitRoot=$('portrait');
 activeOutfitSceneId=showingMandatory?.id||showingSlice?.id||showingSituation?.id||showingStory?.id||showingEncounter?.id||showingArc?.id||sideQuest?.id||null;
 const nextPortrait=portraitId&&cast[portraitId]?portraitId:'';
 const nextArt=nextPortrait?scenePortraitSource(nextPortrait,'neutral'):'';
 if(portraitRoot.dataset.npc!==nextPortrait||portraitRoot.dataset.artSrc!==nextArt){
  portraitRoot.dataset.npc=nextPortrait;portraitRoot.dataset.artSrc=nextArt;
  portraitRoot.replaceChildren();
  if(nextPortrait)portraitRoot.append(makeAvatar(nextPortrait));
  else delete portraitRoot.dataset.rpgSafeId;
 }
 if(nextPortrait)window.NeoRpgDiscreetAvatars?.set?.(portraitRoot,nextPortrait,'neutral',cast[nextPortrait].name);
 $('homeBanner').hidden=state.location!=='home'||!!portraitId;
 $('homeBanner').textContent='YOUR APARTMENT  ·  DAY '+state.day+'  ·  '+periods[state.slot]+' — Prepare your deck, review your plans or rest.';
 let shown=showingMandatory?renderMandatory():showingSlice?renderSliceOfLife():showingSituation?showSituation():showingStory?renderStory():showingEncounter?showEncounter():showingArc?showArc():state.activeSideQuest?showSideQuest():scene;
 // Narration is visually distinguished by italics, without an unnecessary speaker label.
 const isNarration=shown?.speaker==='Narrator';
 $('speaker').textContent=isNarration?'':(shown?.speaker||'');
 $('speaker').hidden=isNarration;
 $('line').textContent=shown?.line||'The town is waiting.';
 $('dialogue').classList.toggle('is-narration',isNarration);
 $('choices').replaceChildren();
 const responseActions=new Set(['mandatoryChoice','storyChoice','sliceChoice','sideChoice','arcChoice','encounterChoice','situationChoice','sideDuel','sidePause','dateBook','dateActivity','dateSlot','book','socialPlan','dateInvite','flirt','eventInvite','eventChat']);
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
  const avatar=document.createElement('span');avatar.className='radar-person-avatar';
  window.NeoRpgDiscreetAvatars?.set?.(avatar,id,'neutral',cast[id].name);
  button.append(avatar,label,where);button.title='Travel for free to '+places[place][0];
  button.onclick=()=>travelTo(place);
  $('townRadar').append(button);
 }
 $('people').replaceChildren();
 const people=currentPeople();
 if(!people.length){const p=document.createElement('p');p.className='empty-note';p.textContent='No regulars here at this time. Try another location or time period.';$('people').append(p);}
 for(const id of people){
  const c=cast[id],b=document.createElement('button');b.className='person'+(state.selected===id?' selected':'');b.disabled=locked;
  const avatar=document.createElement('span');avatar.className='person-avatar';avatar.dataset.initials=c.name.split(' ').map(part=>part[0]).join('').slice(0,2).toUpperCase();avatar.append(makeAvatar(id));
  window.NeoRpgDiscreetAvatars?.set?.(avatar,id,'neutral',c.name);
  const label=document.createElement('span');label.className='person-info';
  const name=document.createElement('strong');name.textContent=c.name;const sub=document.createElement('small');sub.textContent=c.style;
  const bond=BONDS.progress(state,id,BOND_PLAN),chapter=document.createElement('small');
  chapter.className='character-chapter-progress';chapter.textContent='♥ Character chapters '+bond.completed+' / '+bond.total+(state.bondTrials?.[id]?' · Personal challenge won':'');
  label.append(name,sub,chapter);
  const invite=!locked?availableInvitation(id,people):null;
  if(invite){
   const cue=document.createElement('small');cue.className='character-reaction-hint';
   cue.textContent=invite.kind==='appointment'?'✦ Waiting for you':'✦ Wants to talk';
   label.append(cue);
  }else if(!locked&&state['met_'+id]&&REACT.reaction(state,id,c,cast,COMMUNITY,CONSEQ)){
   const cue=document.createElement('small');cue.className='character-reaction-hint';cue.textContent='✦ Something to say';
   label.append(cue);
  }
  b.append(avatar,label);b.onclick=()=>selectPerson(id);$('people').append(b);
 }
 const sceneScript=showingMandatory?.lines||
  (showingStory?storyDialogueLines(showingStory.id):null)||
  (showingArc?ARC.linesFor(state,showingArc.id):null)||
  (sideQuest?SIDE.linesFor(state,state.activeSideQuest.id):null)||[];
 const remoteScene=!!showingMandatory&&showingMandatory.kind==='bond'&&
  (showingMandatory.delivery==='remote'||
   !SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location)).includes(showingMandatory.characterId));
 renderRpgCast(people,locked,shown,portraitId,{
  active:!!(showingMandatory||showingSlice||showingSituation||showingStory||showingEncounter||showingArc||sideQuest),
  script:sceneScript,remote:remoteScene,sceneId:activeOutfitSceneId
 });
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
   if(!state.hungOut?.[state.day+':'+selected]&&SOCIAL.options(state,selected,people,cast).some(a=>!a.disabledReason))
    buttons.push(['✧ Spend time',()=>planSharedActivity(selected),'Suggest an activity together']);
   if(APPOINTMENTS.proposed(state,selected,SCHEDULES).length)
    buttons.push(['◷ Make plans',()=>act('dateInvite:'+selected),'Invite '+display+' to meet on another day']);
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
  const b=document.createElement('button');b.className='event-btn';b.disabled=locked;b.dataset.plannerKey=e.id;b.textContent='✦  '+e.title+' · ⏳ 1 period';
  const chapter=BOND_PLAN.byEvent[e.id];
  const small=document.createElement('small');
  small.textContent=cast[e.npc].name+(chapter?' · Bond chapter '+chapter.chapter+' / 4':'')+(e.evergreen?' · available until season end':' · limited-time encounter');
  b.append(small);b.onclick=()=>startStory(e.id);$('storyEvents').append(b);
 }
 const personalEpisodes=ARC.available(state,currentPeople());
 for(const episode of personalEpisodes){
  const b=document.createElement('button');b.className='event-btn arc-episode';b.disabled=locked;b.dataset.plannerKey=episode.id;
  const title=document.createElement('strong');title.textContent='♜  '+episode.title+' · ⏳ 1 period';
  const hint=document.createElement('small');hint.textContent=cast.reina.name+' · an optional rivalry chapter';
  b.append(title,hint);b.onclick=()=>act('arc:'+episode.id);
  $('storyEvents').append(b);
 }
 if(!stories.length&&!personalEpisodes.length){const x=document.createElement('p');x.className='empty-note';x.textContent='No special story encounter right now.';$('storyEvents').append(x);}

 $('situationEvents').replaceChildren();
 const moments=SITUATIONS.available(state,currentPeople());
 for(const event of moments){
  const b=document.createElement('button');b.className='event-btn situation-event';b.dataset.plannerKey=event.id;
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
 const lifeGauges=[['FOCUS',state.focus,100,'Energy for town activities and outings'],['INSIGHT',state.insight,99,'6 Insight: -3 credits on themed boosters; 15 Insight: -5 credits; 10 unlocks masterclasses'],['REPUTATION',state.reputation,100,'6 Reputation unlocks paid clinics; 15 unlocks weekly sponsored boosters'],['DUEL PREP',state.preparation,3,'Each point awards 14 credits on a win or 8 on a draw/loss after a duel']];
 for(const [label,value,max,title] of lifeGauges){
  const item=document.createElement('div');item.className='life-stat';item.title=title;
  const row=document.createElement('div');row.className='life-stat-label';
  const name=document.createElement('b');name.textContent=label;
  const val=document.createElement('span');val.textContent=value+' / '+max;row.append(name,val);
  const track=document.createElement('div');track.className='life-track';
  const fill=document.createElement('div');fill.className='life-fill';fill.style.width=(value/max*100)+'%';track.append(fill);
  item.append(row,track);
  const perk=label==='INSIGHT'?state.insight>=15?'Themed boosters: -5 credits':state.insight>=6?'Themed boosters: -3 credits':'6 Insight unlocks booster savings':
   label==='REPUTATION'?state.reputation>=15?'Sponsored vouchers unlocked':state.reputation>=6?'Paid clinics unlocked':'6 Reputation unlocks paid clinics':
   label==='DUEL PREP'?'Next duel: '+(state.preparation?'+14 win / +8 otherwise':'no bonus queued'):'';
  if(perk){const tip=document.createElement('small');tip.textContent=perk;item.append(tip);}
  $('lifeStats').append(item);
 }
 $('townActivities').replaceChildren();
 for(const entry of WORLD.activitiesAt(state)){
  const b=document.createElement('button');b.className='town-activity';b.dataset.plannerKey=entry.id;b.disabled=locked||!!entry.disabledReason;
  const title=document.createElement('strong');title.textContent=entry.title+' · ⏳ 1 period';
  const description=document.createElement('small');
  const gains=Object.entries(entry.change).filter(([,v])=>v>0).map(([key,value])=>'+'+value+' '+key);
  if(entry.voucherSet==='latest')gains.push('1 unlocked expansion booster voucher');
  description.textContent=(entry.disabledReason?entry.disabledReason+' · ':'')+'Focus cost '+entry.focus+(entry.cost?' · '+entry.cost+' credits':'')+' · '+gains.join(' · ');
  b.append(title,description);b.title=entry.text;b.onclick=()=>act('townActivity:'+entry.id);
  $('townActivities').append(b);
 }
 $('sideQuestEvents').replaceChildren();
 for(const x of SIDE.available(state,currentPeople())){
  const b=document.createElement('button');b.className='event-btn';b.dataset.plannerKey=x.quest.id;b.disabled=locked;
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
  const b=document.createElement('button');b.className='encounter-btn';b.dataset.plannerKey=entry.id;b.disabled=locked;
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
$('statusBtn').onclick=()=>{
 window.NeoRpgStatus.open(state,cast,BOND_PLAN,makeAvatar,disableTutorials);
 $('statusTutorialHelp').hidden=true;
 if(!state.gameplayTutorials?.disabled)tutorialEvent('status','statusTutorialHelp');
};
$('statusClose').onclick=()=>window.NeoRpgStatus.close();
$('galleryBtn').onclick=openGallery;
const moreMenu=$('rpgMoreMenu');
moreMenu?.addEventListener('click',event=>{
 if(event.target.closest('#galleryBtn,#rpgDiscreetToggle,a[href]'))moreMenu.open=false;
});
document.addEventListener('pointerdown',event=>{
 if(moreMenu?.open&&!moreMenu.contains(event.target))moreMenu.open=false;
});
$('galleryClose').onclick=()=>$('galleryDialog').close();
$('galleryCharacter').onchange=renderGallery;$('galleryCategory').onchange=renderGallery;$('galleryUnseen').onchange=renderGallery;
$('cgMomentClose').onclick=()=>$('cgMoment').close();
$('preDuelBack').onclick=cancelPreparedDuel;
$('preDuelNext').onclick=advancePreparedDuel;
$('preDuelStart').onclick=launchPreparedDuel;
$('preDuelSkip').onclick=launchPreparedDuel;
$('preDuelDialog').addEventListener('cancel',e=>{e.preventDefault();cancelPreparedDuel();});
$('quickNext').onclick=()=>act('rest');$('quickHome').onclick=()=>act('home');$('calendarBtn').onclick=openCalendar;$('calendarClose').onclick=()=>$('calendarDialog').close();$('communityClose').onclick=()=>$('communityDialog').close();
$('save').onclick=async()=>{persist();const cloud=window.NeoRpgCloudSave?.isSignedIn?.();const ok=await window.NeoRpgCloudSave?.syncNow();$('notice').textContent=cloud?(ok?'Cloud campaign synced.':'Cloud sync pending. Progress is cached on this device until it reconnects.'):'Campaign saved in this browser.';};
$('tutorialDismiss').onclick=()=>{tutorialQueue.shift();displayTutorial();};
$('dismissReceipt').onclick=()=>{state.lastDuelReceipt=null;persist();render();};
document.addEventListener('keydown',e=>{if($('statusDialog')?.open)return;if((e.key===' '||e.code==='Space')&&!['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target?.tagName)){if(scene.dialogue&&scene.index<scene.dialogue.length-1&&!state.mandatoryEventState?.active&&!state.activeStory&&!state.activeArc&&!state.activeSideQuest){e.preventDefault();act('chatNext');}else if(state.mandatoryEventState?.active?.phase==='lines'){e.preventDefault();act('mandatoryNext');}else if(state.activeStory?.phase==='lines'){e.preventDefault();act('storyNext');}else if(state.activeArc?.phase==='lines'){e.preventDefault();act('arcNext');}else if(!$('dialogue').hidden&&!state.activeSituation&&!state.mandatoryEventState?.active&&!state.activeStory&&!state.activeEncounter&&!state.activeArc&&!state.activeSideQuest&&!state.pendingDuel&&!scene.choices?.length){e.preventDefault();closeSceneDialogue();}}});
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
 window.NeoRpgCloudSave?.mount({
  getSave:()=>JSON.parse(localStorage.getItem(KEY)||'null'),
  restoreSave:save=>{localStorage.setItem(KEY,JSON.stringify(save));location.reload();},
  resetSave:()=>{localStorage.removeItem(KEY);location.reload();},
  hadLocalSave:hadCampaignSave,
  showButton:true
 });

})();
