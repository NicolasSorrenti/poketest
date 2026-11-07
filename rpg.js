'use strict';
(()=>{
const $=id=>document.getElementById(id),KEY='neoHarborRpgV1',STORY=window.NeoHarborStory,SCHEDULES=window.NeoRpgSchedules,WORLD=window.NeoRpgWorld,ARC=window.NeoRpgRivalArc,TOURNAMENTS=window.NeoRpgTournaments,COMPETE=window.NeoRpgCompetitiveLoop,BRIDGE=window.NeoRpgDuelBridge;
const PACK=window.NeoRpgNarrativePack,SIDE=window.NeoRpgSideQuests,EPILOGUE=window.NeoRpgEpilogue,APPOINTMENTS=window.NeoRpgAppointments,INTENTIONS=window.NeoRpgIntentions,CG=window.NeoRpgCGGallery,PLANNER=window.NeoRpgDailyPlanner,SOCIAL=window.NeoRpgSocialActivities,DATES=window.NeoRpgPlannedDates,PRE=window.NeoRpgPreDuel,SITUATIONS=window.NeoRpgSituations,SLICE=window.NeoRpgSliceOfLife,JOURNEY=window.NeoRpgSeasonJourney,COLLECT=window.NeoRpgCollection,RPGD=window.NeoRpgDialogue,BONDS=window.NeoRpgBondRewards,PARTNER=window.NeoRpgPartnerDecks,VN=window.NeoRpgConversations;
const TOURNAMENT_STORY=window.NeoRpgTournamentStory||null;
const ROMANCE=window.NeoRpgRomanceVisits||null;
const TUTORIAL=window.NeoRpgTutorials||null;
const INVITES=window.NeoRpgEventInvites||null,SCENE_CAST=window.NeoRpgSceneCast,MANDATORY=window.NeoRpgMandatoryEvents||null,REACT=window.NeoRpgReactivity,COMMUNITY=window.NeoRpgCommunity,CONSEQ=window.NeoRpgConsequences,NPC_DECKS=window.NeoRpgNpcDeckProgression,TIME=window.NeoRpgTimeCoordinator,REL=window.NeoRpgRelationships,MEM=window.NeoRpgDialogueMemory||null;
const LIVE_NEW=window.NeoRpgLiveEverydayEvents||{events:[],art:{},followups:{},artAt:()=>null,finalArt:()=>null,fallback:()=>null,byId:()=>null};
const {LIVE_EVENTS,REPEATABLE_LIVE_EVENTS,REPEATABLE_LIVE_IDS,LIVE_ROTATING_EVENTS,LIVE_ROTATING_IDS,LIVE_EVENT_ART,LIVE_SPECIAL_EVENTS,LIVE_SPECIAL_IDS,LIVE_SPECIAL_ART,LIVE_FINAL_ART_2,LIVE_REPEAT_FINAL_ART_2,LIVE_AFTER_ART,LIVE_LYLA_PHOTO_EVENT,LIVE_DAY_FOLLOWUP,LIVE_AFTER_EVENT,LIVE_REPEAT_MORNING,LIVE_FOLLOWUPS,LIVE_AWAY_IDS,LIVE_HOME_CHECKIN,LIVE_HOME_CHECKIN_ART,MIA_EVENTS,MIA_IDS,MIA_EVENT_ART,MIA_PRIVATE_EVENT,MIA_PRIVATE_ART,MIA_SLEEP_EVENT,MIA_SLEEP_ART,MIA_COUCH_CHOICE_EVENT,MIA_COUCH_CHOICE_ART,MIA_KITCHEN_EVENTS,MIA_KITCHEN_ART,MIA_WINE_MISUNDERSTANDING,MIA_WINE_REVEAL_ART,LIVE_MIA_CHOICE_EVENT,LIVE_MIA_CHOICE_ART}=window.NeoRpgLiveCampaignContent;
function startLiveGlanceMilestone(id){
 if(!LIVE_SPECIAL_IDS.has(id)||state.liveSpecialSeen?.[id])return;
 const active=state.mandatoryEventState?.active;
 if(!active||LIVE_SPECIAL_IDS.has(active.id))return;
 const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
 state.liveSuspendedEvent={...active};
 state.liveSpecialSeen={...(state.liveSpecialSeen||{}),[id]:true};
 m.active={id,phase:'lines',index:0,choice:null};
 persist();render();
}
function specialArtCandidates(path){
 if(!path)return [];
 if(/\.(?:png|jpe?g|webp)$/i.test(path))return [path];
 return [path+'.png',path+'.jpg',path+'.webp'];
}
// Until Live has a chibi, use an entirely neutral placeholder in Discreet Mode.
const LIVE_DISCREET_PLACEHOLDER='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(
 '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">'+
 '<rect width="960" height="720" fill="#24283b"/>'+
 '<rect x="90" y="70" width="780" height="580" rx="38" fill="#343950" stroke="#8187a4" stroke-width="5"/>'+
 '<circle cx="480" cy="283" r="95" fill="#9299b1"/>'+
 '<path d="M275 544c15-117 94-175 205-175s190 58 205 175" fill="#9299b1"/>'+
 '<text x="480" y="608" text-anchor="middle" fill="#f4f2fa" font-family="sans-serif" font-size="36" font-weight="700">LIVE</text>'+
 '</svg>');
function liveDiscreetEnabled(){
 return document.documentElement.dataset.rpgDiscreet==='on'||
  window.NeoRpgDiscreet?.isEnabled?.()===true;
}
function liveFollowupContent(){
 const dayScene=state.liveDayScene||{},base=dayScene.id||'live_home_cooking';
 const lines=LIVE_FOLLOWUPS[base]||["I finished up what I was doing earlier. Thanks for checking in.","It's been quite a day. I'm glad to be resting now."];
 const evening=state.slot===2;
 const away=evening&&LIVE_AWAY_IDS.has(base);
 const cooldown=Number(state.liveRepeatLastDay)||0;
 const cooling=cooldown>0&&state.day>cooldown&&state.day<=cooldown+5;
 if(away)return {away:true,speaker:'Narrator',text:base==='live_library'?
  'Live left to return her library book. A note on the table says she will be back later.':
  'Live has gone out after finishing her errands. She left you a quick note on the table.'};
 if(cooling)return {away:false,speaker:'Live',text:state.day%2===0?
  "I'm still tired from our last quiet morning. Let's take it easy for a few days, okay?":
  "I have to leave in a little while. Let's save some time together for another day."};
 return {away:false,speaker:'Live',text:lines[evening?1:0]};
}
function liveCanRepeat(){
 const last=Number(state.liveRepeatLastDay)||0;
 return !!(state.mandatoryEventState?.seen?.live_glance_next_morning||state.liveSpecialSeen?.live_glance_next_morning)&&state.slot===0&&
  (!last||state.day>=last+6);
}
function liveEventArt(id){
 // The exercise scare has two CG beats: worrying, then relieved with a towel.
 if(id==='live_workout_wake_scare')
  return (state.mandatoryEventState?.active?.id===id&&
    Number(state.mandatoryEventState.active.index)>=4)
   ?'/rpg-assets/characters/live/events/08_a_highly_detailed_anime_style_illustration_close.png'
   :LIVE_EVENT_ART.live_workout_wake_scare;
 if(id===LIVE_AFTER_EVENT.id)return LIVE_AFTER_ART;
 if(id===MIA_PRIVATE_EVENT.id)return MIA_PRIVATE_ART;
 if(id===LIVE_MIA_CHOICE_EVENT.id)return LIVE_MIA_CHOICE_ART[state.liveMiaChoiceStage==='joint'||state.liveMiaChoiceStage==='bothEnding'?'both':state.liveMiaChoiceStage==='miaEnding'?'mia':'live'];
 if(id===MIA_SLEEP_EVENT.id)return MIA_SLEEP_ART;
 if(id===MIA_COUCH_CHOICE_EVENT.id)return MIA_COUCH_CHOICE_ART;
 if(MIA_KITCHEN_ART[id])return MIA_KITCHEN_ART[id];
 if(id===MIA_WINE_MISUNDERSTANDING.id)return state.miaWineStage==='reveal'?MIA_WINE_REVEAL_ART:null;
 if(miaStoryIds.has(id))return miaArt(id);
 if(id===LIVE_REPEAT_MORNING.id)return state.mandatoryEventState?.active?.index>=1?LIVE_REPEAT_FINAL_ART_2:LIVE_SPECIAL_ART.live_glance_next_morning;
 if(id===LIVE_DAY_FOLLOWUP.id)return liveFollowupContent().away?null:LIVE_NEW.finalArt(state.liveDayScene?.id)||state.liveDayScene?.cg||LIVE_EVENT_ART[state.liveDayScene?.id]||null;
 if(LIVE_SPECIAL_IDS.has(id)){
  const base=id==='live_glance_next_morning'&&state.mandatoryEventState?.active?.index>=2?LIVE_FINAL_ART_2:LIVE_SPECIAL_ART[id];
  return specialArtCandidates(base)[0];
 }
 if(LIVE_NEW.byId(id))return LIVE_NEW.artAt(id,state.mandatoryEventState?.active?.id===id?Number(state.mandatoryEventState.active.index)||0:0);
 return id===LIVE_HOME_CHECKIN.id?state.liveHomeActivityScene?.cg||LIVE_HOME_CHECKIN_ART[0]:LIVE_EVENT_ART[id];
}
// Mia is Live's adult daughter, a CG-only visitor rather than a roster NPC.
const MIA_FIRST_TIME={
 id:'mia_first_time',title:'A New Face at Home',kind:'season',priority:97,
 earliestDay:3,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',
 trigger:{eventSeen:'live_home_welcome'},
 lines:[
  {speaker:'Narrator',text:'You wake up and head into the living room. Live is chatting with a girl about your age.'},
  {speaker:'Live',text:'Good morning, honey! Perfect timing. There is someone I want you to meet.'},
  {speaker:'Live',text:'This is Mia, my daughter. Mia, this is the boy I told you about.'},
  {speaker:'Mia',text:'Nice to meet you! So you are the one Mom keeps talking about.'},
  {speaker:'Live',text:'Mia! You make it sound like I never talk about anything else!'},
  {speaker:'Mia',text:'What? I only said you told me about him!'},
  {speaker:'Mia',text:'Anyway, I hope we get along. I will be stopping by from time to time.'},
  {speaker:'Live',text:'I am sure you two will. Now, who wants breakfast?'}
 ],
 choices:[
  {label:'Nice to meet you too, Mia',reply:'Mia smiles. "Likewise! I have a feeling we will get along."'},
  {label:'What exactly did Live tell you?',reply:'Mia laughs. "Nothing bad, I promise!" Live sighs in relief.'}
 ]
};
LIVE_EVENT_ART[MIA_FIRST_TIME.id]='/rpg-assets/characters/live/events/mia/mia_first_time.png';
const miaStoryIds=MIA_IDS||new Set();
const MIA_SCENE_SLOT=Object.fromEntries((window.NeoRpgLiveCampaignContent?.MIA_EVENTS||[]).map(e=>[e.id,Number.isInteger(e.slot)?e.slot:0]));
const MIA_SCENE_PREV=Object.fromEntries((window.NeoRpgLiveCampaignContent?.MIA_EVENTS||[]).map(e=>[e.id,Object.keys(e.trigger||{}).length===1?e.trigger.eventSeen:null]));
function miaFirstIntimateDay(){
 const seen=state.mandatoryEventState?.seen?.live_glance_next_morning;
 const day=Number(seen?.day);
 // The mandatory event is recorded with its completion day. Existing older
 // campaigns may carry the legacy completion flag without a dated entry.
 return Number.isInteger(day)&&day>=1?day:null;
}
function miaGossipCompleted(){return !!state.mandatoryEventState?.seen?.mia_gossip;}
function miaRomanceGossip(){return miaFirstIntimateDay()!==null;}
// Single authority for Mia's nickname in every scene, including out-of-order
// or resumed saves. The first explicit confession permanently retires it.
function miaUsesDaddy(){
 return miaGossipCompleted()&&!state.miaDaddyRetired;
}
function miaDialogueText(value){
 return String(value||'')
  .replace(/\{\{miaPlayerName\}\}/g,miaUsesDaddy()?'Daddy':'you')
  .replace(/\{\{miaNickname\}\}/g,miaUsesDaddy()?'Daddy':'you')
  // A literal reference to the nickname remains valid in the introductory
  // gossip, even before that event has been marked seen.
  .replace(/\bdaddy\b/gi,state.miaDaddyRetired?'you':'Daddy');
}
const MIA_GOSSIP_EXTRA='/rpg-assets/characters/live/events/mia/a_highly_detailed_anime_style_illustration_of_the.png';
function miaArt(id){return id==='mia_gossip'&&miaRomanceGossip()?MIA_GOSSIP_EXTRA:MIA_EVENT_ART[id];}
Object.assign(LIVE_EVENT_ART,MIA_EVENT_ART);
const MANDATORY_EVENTS=[...(window.NeoRpgSeasonEvents?.events||[]),...(window.NeoRpgCharacterPacks?.mandatoryEvents||[]).map(event=>
 event.kind==='bond'?{...event,earliestDay:1}:event),...LIVE_EVENTS,MIA_FIRST_TIME,...MIA_EVENTS,MIA_PRIVATE_EVENT,MIA_SLEEP_EVENT,MIA_COUCH_CHOICE_EVENT,...MIA_KITCHEN_EVENTS,MIA_WINE_MISUNDERSTANDING,LIVE_MIA_CHOICE_EVENT,...REPEATABLE_LIVE_EVENTS,...LIVE_NEW.events,...LIVE_SPECIAL_EVENTS,LIVE_AFTER_EVENT,LIVE_LYLA_PHOTO_EVENT,LIVE_HOME_CHECKIN,LIVE_DAY_FOLLOWUP,LIVE_REPEAT_MORNING];
const periods=['Morning','Afternoon','Evening'];
const OUTFITS=window.NeoRpgOutfits,CG_SCENE=window.NeoRpgCGScene;
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
Object.assign(cast,PACK.cast,SIDE.cast,window.NeoRpgCharacterPacks?.cast||{});
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
  $('notice').textContent='You need a stronger bond before taking this step.';return;
 }
 a.phase='response';a.choice=index;persist();render();
}
function finishStory(){
 const a=state.activeStory;if(!a||a.phase!=='response')return;
 const e=STORY.byId(a.id);
 try{STORY.resolve(state,a.id,a.choice);}
 catch(err){window.NeoRpgErrorReport?.capture(err,{source:'story-completion',action:'storyFinish'});console.error('RPG story completion failed',err);$('notice').textContent='Could not finish scene: '+err.message;return;}
 // Story dialogue remains its own relationship reward: no affection, trust,
 // respect or attraction increases. Collection gifts and credits are restored.
 state.activeStory=null;persist();
 const id=e.npc;let chapterReward=null;
 try{chapterReward=BONDS.reward(state,e,BOND_PLAN,COLLECT);}
 catch(err){window.NeoRpgErrorReport?.capture(err,{source:'optional-reward',action:'storyReward'});console.error('RPG chapter reward failed',err);}
 try{
  log('Finished '+e.title+' with '+cast[id].name+'.');
  recordCG('story_milestone',id,{eventId:e.id});
  if(chapterReward)log('Bond chapter '+chapterReward.chapter+' gift from '+cast[id].name+': '+chapterReward.label+'.');
 }catch(err){window.NeoRpgErrorReport?.capture(err,{source:'optional-story-effects',action:'storyFinish'});console.error('RPG optional story effects failed',err);}
 advance();state.selected=id;persist();
 // The lover's first home invitation follows their final authored chapter.
 if(ROMANCE?.offerable(state,id,STORY)&&ROMANCE.isFirst(state,id)){
  showRomanceOffer(id);
  timeSequence.flush();
 }else closeSceneDialogue();
 if(chapterReward)$('notice').textContent='★ Chapter gift: '+chapterReward.label;
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
 let result;
 try{result=SIDE.finishChoice(state,a.id,a.choice,currentPeople());}
 catch(err){window.NeoRpgErrorReport?.capture(err,{source:'side-quest-completion',action:'sideFinish'});console.error('RPG side quest completion failed',err);$('notice').textContent='Could not finish chapter: '+err.message;return;}
 persist(); // The quest is complete even if an optional follow-up effect fails.
 try{log((result.done?'Completed':'Progressed')+' side quest: '+result.title+'.');recordIntention('sideQuest');}
 catch(err){window.NeoRpgErrorReport?.capture(err,{source:'optional-side-effects',action:'sideFinish'});console.error('RPG optional side quest effects failed',err);}
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
function timeFlash(change,onDone=()=>{}){
 audioForTime(change);
 // Presentation follows the already-committed RPG time state; it never owns state changes.
 if(window.NeoRpgTimeTransitions?.present){
  // Only hold a frame once the wipe actually begins. A queued transition
  // cannot hide the still-active dialogue while waiting for acknowledgement.
  timeTransitionCovered=false;
  try{
   const shown=window.NeoRpgTimeTransitions.present(change,{
    onCover:()=>{timeTransitionCovered=true;render();},
    onDismiss:()=>{timeTransitionCovered=true;onDone();}
   });
   if(!shown)timeTransitionCovered=true;
   return !!shown;
  }catch(error){timeTransitionCovered=true;throw error;}
 }
 const overlay=document.createElement('div');overlay.className='notice-pop';
 const heading=document.createElement('b');heading.textContent=change.afterDay>90?'Season complete':change.afterDay!==change.beforeDay?'A NEW DAY BEGINS':'TIME PASSES';
 const body=document.createElement('span');body.textContent=change.afterDay>90?'Day 90 has ended.':'Day '+change.afterDay+' · '+periods[change.afterSlot];
 overlay.append(heading,body);document.body.append(overlay);
 let finished=false;
 const done=()=>{if(finished)return;finished=true;clearTimeout(timer);overlay.remove();onDone();};
 overlay.addEventListener('animationend',done);
 const timer=setTimeout(done,1400);
 return true;
}

function defaults(){return {sideQuests:{},activeSideQuest:null,day:1,slot:0,location:'home',visitedLocations:{home:true},metReina:false,reinaTrust:0,reinaDuels:0,results:[],flags:{intro:false},journal:['The 90-day season begins.'],pendingDuel:null,bonds:{},talked:{},hungOut:{},eventsDone:{},points:0,credits:80,playerDeck:'blackout',selected:null,ended:false,storyDone:{},storyMissed:{},relationships:{},routeOutcomes:{},romanceVisits:{},romanceVisitPending:null,romanceVisitShowing:null,romanceVisitDeferred:false,partner:null,partners:[],activeStory:null,activeEncounter:null,activeArc:null,arcFlags:{},arcOutcomes:{},activityDone:{},encountersDone:{},focus:75,insight:0,reputation:0,preparation:0,lastDuelReceipt:null,tournaments:{},campaignHistory:[],ngPlus:0,appointments:[],appointmentSeq:0,scene:null,socialHistory:{},situationDone:{},activeSituation:null,sliceOfLifeDone:{},sliceOfLifeLastDay:0,activeSliceOfLife:null,deckJourney:null,competitive:null,npcReactivity:null,community:null,phoneMessages:null,consequences:null,mandatoryEventState:null,playmatGifts:{},playmatSelected:'aurora',gameplayTutorials:{disabled:false,seen:{}}}}
function tournamentDayCup(){return TOURNAMENTS.cups.find(c=>c.day===state.day)||null;}
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
if(!state.romanceVisits||typeof state.romanceVisits!=='object'||Array.isArray(state.romanceVisits))state.romanceVisits={};
if(state.romanceVisitPending&&!ROMANCE?.eligible(state,state.romanceVisitPending,STORY))state.romanceVisitPending=null;
if(state.romanceVisitShowing&&!ROMANCE?.eligible(state,state.romanceVisitShowing,STORY))state.romanceVisitShowing=null;
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
APPOINTMENTS.hydrate(state);APPOINTMENTS.expire(state);
if(tournamentDayCup()&&!state.pendingDuel&&!state.mandatoryEventState?.active){
 state.location='center';state.selected=null;state.visitedLocations.center=true;
}
INTENTIONS.hydrate(state);CG.hydrate(state);SOCIAL.hydrate(state);DATES.hydrate(state,APPOINTMENTS,SOCIAL);SITUATIONS.hydrate(state);SLICE?.hydrate(state);
if(typeof state.activeStory==='string')state.activeStory=null;
STORY.recordExpiry(state);
if(MANDATORY)MANDATORY.hydrate(state,MANDATORY_EVENTS);
const persist=()=>{localStorage.setItem(KEY,JSON.stringify(state));window.NeoRpgCloudSave?.onLocalSave();};
// Deck Studio is embedded in an iframe in the new overworld. Its localStorage
// writes do not update this page's in-memory campaign object automatically.
// Apply Deck Studio changes to the running campaign synchronously. The iframe
// must never replace the rest of the campaign with its earlier page snapshot.
function applyDeckStudioSave(update){
 if(!state.deckJourney?.starter||state.pendingDuel)return false;
 const edited=update?.deckJourney;
 if(!edited||edited.starter!==state.deckJourney.starter||
    update.day!==state.day||update.slot!==state.slot||
    (update.pendingDuel?.id||null)!==(state.pendingDuel?.id||null))return false;
 if(!COLLECT.check(edited.deck,edited.owned).valid)return false;
 state.deckJourney=structuredClone(edited);
 if(update.deckStrategy)state.deckStrategy=structuredClone(update.deckStrategy);
 if(update.gameplayTutorials)state.gameplayTutorials=structuredClone(update.gameplayTutorials);
 persist(); // Make the selected deck authoritative before another RPG action.
 return true;
}
function syncDeckStudioSave(){
 let saved;
 try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch{return false;}
 return applyDeckStudioSave(saved);
}
window.NeoRpgApplyDeckStudioSave=applyDeckStudioSave;
window.NeoRpgSyncDeckStudio=syncDeckStudioSave;
const log=t=>{state.journal.unshift(t);state.journal=state.journal.slice(0,25)};
// Recover chapter gifts earned during the reward-free build, without paying
// any milestone twice or altering a single relationship statistic.
try{
 const recovered=BONDS.catchUp(state,BOND_PLAN,COLLECT);
 if(recovered.length){
  log('Restored '+recovered.length+' unclaimed character chapter gift'+(recovered.length===1?'':'s')+'.');
  persist();
 }
}catch(error){
 console.warn('Could not restore some previous relationship gifts',error);
 window.NeoRpgErrorReport?.capture?.(error,{source:'bond-reward-recovery',action:'catchUp'});
}
window.NeoRpgErrorReport?.setContextProvider(()=>{
 const active=[['mandatory',state.mandatoryEventState?.active],['slice',state.activeSliceOfLife],['situation',state.activeSituation],['story',state.activeStory],['encounter',state.activeEncounter],['arc',state.activeArc],['sideQuest',state.activeSideQuest]].find(([,value])=>!!value);
 return {day:state.day,period:['Morning','Afternoon','Evening'][state.slot]||null,
  location:state.location,selectedCharacter:state.selected,activeType:active?.[0]||null,
  eventId:active?.[1]?.id||null,phase:active?.[1]?.phase||null};
});
// The overworld UI uses one guarded campaign reset shared with cloud persistence.
let campaignResetBusy=false;
async function resetCampaign(){
 if(campaignResetBusy)return false;
 const cloud=window.NeoRpgCloudSave;
 // A cached session can still be reconnecting. Do not let an unsynced local
 // reset be silently replaced by the former cloud campaign on reload.
 if(localStorage.getItem('neoRpgCloudSessionV1')&&!cloud?.isSignedIn?.()){
  alert('Your cloud account is still reconnecting. Please reconnect or sign out before resetting your campaign.');
  return false;
 }
 const signedIn=!!cloud?.isSignedIn?.();
 if(!confirm('Reset your entire RPG campaign and start again on Day 1? This erases your current season, character relationships, decks and progress'+
  (signedIn?' and replaces your signed-in cloud save':'')+'. This cannot be undone.'))return false;
 campaignResetBusy=true;
 const previous=state;
 const previousScene=scene;
 try{
  state=defaults();
  state.deckJourney=COLLECT.fresh();
  for(const id of Object.keys(cast))state.bonds[id]={affection:0,trust:0,duels:0};
  persist();
  // Do not reload before the new snapshot reaches the cloud.
  if(signedIn){
   const synced=await cloud.syncForReset?.();
   if(!synced)throw Error('The cloud save could not be updated. Your previous campaign has been preserved. Please check your connection and try again.');
  }
  location.reload();
  return true;
 }catch(error){
  state=previous;
  scene=previousScene;
  persist();
  window.NeoRpgErrorReport?.capture?.(error,{source:'campaign-reset',action:'resetCampaign'});
  alert(error.message||'Campaign reset failed. Your previous progress was preserved.');
  return false;
 }finally{campaignResetBusy=false;}
}
function recordIntention(kind){const result=INTENTIONS.record(state,kind);if(result)log('Daily priority fulfilled: '+result.title+' ('+result.rewardLabel+').');}
function recordCG(kind,npc,context=null){
 const entries=CG.record(state,kind,npc,context);
 for(const entry of entries)if(!entry.artPending&&cgScenePresenter?.hasShown(entry.id))CG.markViewed(state,entry.id);
 if(entries.length)log(entries.length+' new CG Gallery memor'+(entries.length===1?'y':'ies')+' unlocked.');
 return entries;
}
let scene=state.scene&&typeof state.scene.speaker==='string'&&typeof state.scene.line==='string'&&Array.isArray(state.scene.choices)?state.scene:{speaker:'Narrator',line:'Ninety days. One championship. You came to Neo Harbor to win. Everyone else has their own plans.',choices:[]};
// A single handoff owns calendar wipes, image loading and forced-story eligibility.
// The state is saved at clock advancement; only presentation waits for acknowledgement.
let timeTransitionCovered=true;
const timeSequence=window.NeoRpgTimeTransitions?.createSequence?.({
 // Activity choices remain on screen until the clock advances. Allow the wipe
 // to start from a character submenu, then reveal the saved outcome on cover.
 canPresent:()=>scene.presentation==='character-menu'||(!scene.line&&!scene.choices?.length),
 present:timeFlash,
 onSettled:()=>render()
})||{
 // Headless RPG harnesses load the game without its presentation-only module.
 // Core narrative progression remains available without visual transitions.
 queue:()=>false,hold:()=>()=>{},flush:()=>false,blocked:false,running:false
};
let cgSceneRelease=null;
const cgScenePresenter=CG_SCENE?.create($('scene'),$('rpgSceneCG'),document)||null;

function queueMandatory(){
 if(!MANDATORY)return;
 // Hydrate with the complete catalog: using a filtered catalog here
 // invalidates an active Live event on every render and restarts it.
 MANDATORY.queue(state,MANDATORY_EVENTS);
 const m=state.mandatoryEventState;
 if(m?.pending)m.pending=m.pending.filter(item=>item.id!==LIVE_AFTER_EVENT.id&&item.id!==LIVE_MIA_CHOICE_EVENT.id&&!LIVE_EVENT_ART[item.id]&&!LIVE_SPECIAL_IDS.has(item.id)&&item.id!==LIVE_HOME_CHECKIN.id&&item.id!==LIVE_LYLA_PHOTO_EVENT.id&&item.id!==LIVE_DAY_FOLLOWUP.id&&item.id!==LIVE_REPEAT_MORNING.id);
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
 // Keep scripted scenes queued until after the compulsory tournament day.
 if(tournamentDayCup())return;
 if(!MANDATORY)return;
 queueMandatory();
 if(MANDATORY.hydrate(state,MANDATORY_EVENTS).active)return;
 if(timeSequence.blocked||window.NeoRpgTimeTransitions?.active)return;
 // Existing scripted dialogue, character choices, galleries, duel preparation and starter selection remain authoritative.
 if(state.romanceVisitShowing||state.activeSliceOfLife||scene.line||scene.choices?.length||state.deckJourney&&!state.deckJourney.starter
    ||$('preDuelDialog')?.open||$('galleryDialog')?.open||$('calendarDialog')?.open)return;
 // This aftermath is a forced CG-only scene and must start only after the
 // intimate scene's clock wipe has completely finished. Its pending flag is
 // persisted before the transition, so reloading cannot silently lose it.
 // It takes precedence over appointments and normal apartment encounters.
 if(state.liveAfterPending&&state.location==='home'){
  const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
  m.active={id:LIVE_AFTER_EVENT.id,phase:'lines',index:0,choice:null};
  persist();
  return;
 }
 // A due meeting takes precedence over a normal story that would relocate the player.
 if(TIME.dueNow(state).length)return;
 // The 30-glance scene is due from the *next* in-game day onward.
 // Don't restrict it to slot 0: a scheduled appointment, travel wipe, or
 // resumed dialogue must not permanently make the event missable.
 // Legacy saves may already have 30 glances without liveThirtyGlancesDay;
 // treat those as overdue instead of silently suppressing the event.
 const glanceMilestoneDay=Number(state.liveThirtyGlancesDay)||Math.max(1,state.day-1);
 if(state.location==='home'&&state.day<=90&&state.day>glanceMilestoneDay&&
    Number(state.liveGlanceCount)>=30&&!state.mandatoryEventState?.seen?.live_glance_next_morning){
  const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
  m.active={id:'live_glance_next_morning',phase:'lines',index:0,choice:null};
  // Mark completion only after the scene finishes: reloads must never lose it.
  state.liveHomeActivityScene=null;
  persist();
  return;
 }
 // Live's in-person Lyla photo sighting replaces (not supplements) an SMS.
 // Keep the saved image until a safe apartment arrival; show the PHOTO, not Live.
 if(state.location==='home'&&state.day>=2&&state.mandatoryEventState?.seen?.live_home_welcome&&state.phoneMessages?.liveLylaSighting?.src){
  const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
  delete m.seen[LIVE_LYLA_PHOTO_EVENT.id];
  m.active={id:LIVE_LYLA_PHOTO_EVENT.id,phase:'lines',index:0,choice:null};
  state.liveLastEventDay=state.day;
  persist();
  return;
 }
 // Mia's introduction is a one-time morning scene after meeting Live.
 // Save it through mandatoryEventState.seen, without adding Mia to the NPC roster.
 if(state.location==='home'&&state.slot===0&&state.day>=MIA_FIRST_TIME.earliestDay&&
    state.day<=90&&state.mandatoryEventState?.seen?.live_home_welcome&&
    !state.mandatoryEventState?.seen?.[MIA_FIRST_TIME.id]){
  const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
  m.active={id:MIA_FIRST_TIME.id,phase:'lines',index:0,choice:null};
  state.liveDayScene={day:state.day,id:MIA_FIRST_TIME.id,cg:LIVE_EVENT_ART[MIA_FIRST_TIME.id],firstSlot:state.slot,lastSeenSlot:state.slot};
  state.liveLastEventDay=state.day;
  persist();
  return;
 }
 // The one-time wine misunderstanding belongs to a quiet morning after
 // Mia's introduction. No CG is displayed during the overheard dialogue.
 if(state.location==='home'&&state.slot===0&&state.day>=MIA_WINE_MISUNDERSTANDING.earliestDay&&
    state.mandatoryEventState?.seen?.[MIA_FIRST_TIME.id]&&
    !state.mandatoryEventState?.seen?.[MIA_WINE_MISUNDERSTANDING.id]&&
    Number(state.miaLastSceneDay)!==state.day){
   const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
   m.active={id:MIA_WINE_MISUNDERSTANDING.id,phase:'lines',index:0,choice:null};
   state.miaWineStage='heard';
   state.miaWineLine=0;
   state.miaLastSceneDay=state.day;
   state.miaLastSceneSlot=state.slot;
   state.liveLastEventDay=state.day;
   state.liveDayScene={day:state.day,id:MIA_WINE_MISUNDERSTANDING.id,cg:null,firstSlot:state.slot,lastSeenSlot:state.slot};
   state.liveHomeActivityScene=null;
   persist();return;
 }
 // Mia's scenes are CG-only, save-stable apartment encounters.
 // One first-time scene per day, except the later-sofa follow-up in a later period.
 if(state.location==='home'&&state.day<=90&&state.mandatoryEventState?.seen?.[MIA_FIRST_TIME.id]){
  const seen=state.mandatoryEventState.seen;
  const firstIntimateDay=miaFirstIntimateDay();
  const gossipDue=firstIntimateDay!==null&&state.day>=firstIntimateDay+2&&!seen.mia_gossip;
  const due=MIA_EVENTS.filter(e=>(e.id==='mia_gossip'?gossipDue:state.day>=e.earliestDay)&&
   state.slot>=(e.id==='mia_gossip'?0:MIA_SCENE_SLOT[e.id])&&
   (e.id==='mia_gossip'?true:!!seen[MIA_SCENE_PREV[e.id]])&&!seen[e.id]&&
   (e.id==='mia_daytime_nap_return'?
      state.day>=Number(state.miaLastSceneDay)&&state.slot===2:
      Number(state.miaLastSceneDay)!==state.day)).sort((a,b)=>(a.id==='mia_gossip'?-1:b.id==='mia_gossip'?1:a.earliestDay-b.earliestDay));
  if(due.length){
   const event=due[0],m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
   m.active={id:event.id,phase:'lines',index:0,choice:null};
   state.miaLastSceneDay=state.day;
   state.miaLastSceneSlot=state.slot;
   state.liveDayScene={day:state.day,id:event.id,cg:miaArt(event.id),firstSlot:state.slot,lastSeenSlot:state.slot};
   state.liveLastEventDay=state.day;
   persist();return;
  }
 }
 // After Mia's nickname scene, a private conversation can happen only once.
 // Live is away this day. Record the finished event, not just the dialog stage.
 if(state.location==='home'&&state.day<=90&&
    state.mandatoryEventState?.seen?.mia_gossip&&
    !state.mandatoryEventState?.seen?.[MIA_PRIVATE_EVENT.id]&&
    !state.miaPrivateConversationFinished&&
    Number(state.miaLastSceneDay)!==state.day){
  const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
  m.active={id:MIA_PRIVATE_EVENT.id,phase:'lines',index:0,choice:null};
  state.miaPrivateStage=1;
  state.miaLastSceneDay=state.day;
  state.miaLastSceneSlot=state.slot;
  state.liveLastEventDay=state.day;
  state.liveDayScene={day:state.day,id:MIA_PRIVATE_EVENT.id,cg:MIA_PRIVATE_ART,firstSlot:state.slot,lastSeenSlot:state.slot};
  state.liveHomeActivityScene=null;
  persist();return;
 }
 // The first morning after Mia confides in the player, Live asks for an
 // honest decision. This scene is one-time, not repeatable, and never hijacks
 // a tournament morning. Only a genuinely unlocked Mia route allows it.
 if(state.location==='home'&&state.day<=90&&state.slot===0&&
    state.miaPrivateOutcome==='confided'&&
    state.mandatoryEventState?.seen?.[MIA_PRIVATE_EVENT.id]&&
    state.mandatoryEventState?.seen?.live_glance_next_morning&&
    state.day>Number(state.mandatoryEventState.seen[MIA_PRIVATE_EVENT.id]?.day||0)&&
    !state.liveMiaFinalChoice&&
    !state.mandatoryEventState?.seen?.[LIVE_MIA_CHOICE_EVENT.id]&&
    Number(state.miaLastSceneDay)!==state.day){
  const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
  m.active={id:LIVE_MIA_CHOICE_EVENT.id,phase:'lines',index:0,choice:null};
  state.liveMiaChoiceStage='intro';
  state.liveMiaChoiceStep=0;
  state.miaLastSceneDay=state.day;
  state.miaLastSceneSlot=state.slot;
  state.liveLastEventDay=state.day;
  state.liveDayScene={day:state.day,id:LIVE_MIA_CHOICE_EVENT.id,cg:LIVE_MIA_CHOICE_ART.live,firstSlot:state.slot,lastSeenSlot:state.slot};
  state.liveHomeActivityScene=null;
  persist();return;
 }
 // One quiet living-room encounter. Mia becomes an available confidante only
 // if her earlier personal conversation was completed; otherwise only Live.
 if(state.location==='home'&&state.day<=90&&state.slot>=1&&
    miaFirstIntimateDay()!==null&&state.day>=miaFirstIntimateDay()+3&&
    !state.mandatoryEventState?.seen?.[MIA_SLEEP_EVENT.id]&&
    Number(state.miaLastSceneDay)!==state.day){
   const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
   m.active={id:MIA_SLEEP_EVENT.id,phase:'lines',index:0,choice:null};
   state.miaSleepStage='choose';
   state.miaSleepTarget=null;
   state.miaLastSceneDay=state.day;
   state.miaLastSceneSlot=state.slot;
   state.liveLastEventDay=state.day;
   state.liveDayScene={day:state.day,id:MIA_SLEEP_EVENT.id,cg:MIA_SLEEP_ART,firstSlot:state.slot,lastSeenSlot:state.slot};
   state.liveHomeActivityScene=null;
   persist();return;
 }
 // A second sofa vignette becomes available the day AFTER the sleeping scene,
 // leaving the player free to choose Live, Mia (if unlocked), or neither.
 if(state.location==='home'&&state.day<=90&&state.slot>=1&&
    state.mandatoryEventState?.seen?.[MIA_SLEEP_EVENT.id]&&
    state.day>Number(state.mandatoryEventState.seen[MIA_SLEEP_EVENT.id]?.day||0)&&
    !state.mandatoryEventState?.seen?.[MIA_COUCH_CHOICE_EVENT.id]&&
    Number(state.miaLastSceneDay)!==state.day){
   const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
   m.active={id:MIA_COUCH_CHOICE_EVENT.id,phase:'lines',index:0,choice:null};
   state.miaCouchChoiceStage='choose';
   state.miaCouchChoiceTarget=null;
   state.miaLastSceneDay=state.day;
   state.miaLastSceneSlot=state.slot;
   state.liveLastEventDay=state.day;
   state.liveDayScene={day:state.day,id:MIA_COUCH_CHOICE_EVENT.id,cg:MIA_COUCH_CHOICE_ART,firstSlot:state.slot,lastSeenSlot:state.slot};
   state.liveHomeActivityScene=null;
   persist();return;
 }
 // Three progressively scheduled kitchen vignettes, at most one Mia event
 // per day. Their dialogue is computed from the CURRENT route and nickname.
 if(state.location==='home'&&state.day<=90&&
    state.mandatoryEventState?.seen?.[MIA_FIRST_TIME.id]&&
    Number(state.miaLastSceneDay)!==state.day){
  const seen=state.mandatoryEventState.seen;
  const due=MIA_KITCHEN_EVENTS.find((e,i)=>state.day>=e.earliestDay&&
    !seen[e.id]&&(!i||seen[MIA_KITCHEN_EVENTS[i-1].id]));
  if(due){
   const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
   m.active={id:due.id,phase:'lines',index:0,choice:null};
   state.miaKitchenStage=0;
   state.miaLastSceneDay=state.day;
   state.miaLastSceneSlot=state.slot;
   state.liveLastEventDay=state.day;
   state.liveDayScene={day:state.day,id:due.id,cg:MIA_KITCHEN_ART[due.id],firstSlot:state.slot,lastSeenSlot:state.slot};
   state.liveHomeActivityScene=null;
   persist();return;
  }
 }
 // Once Live's daily scene is established, do not reroll it on a return
 // visit. Later periods receive a contextual follow-up with the SAME CG.
 const daily=state.liveDayScene;
 if(state.location==='home'&&daily?.day===state.day&&
    daily.id!==MIA_FIRST_TIME.id&&!miaStoryIds.has(daily.id)&&
    daily.lastSeenSlot!==state.slot&&state.slot>daily.firstSlot){
  const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
  delete m.seen[LIVE_DAY_FOLLOWUP.id];
  m.active={id:LIVE_DAY_FOLLOWUP.id,phase:'lines',index:0,choice:null};
  daily.lastSeenSlot=state.slot;
  state.liveHomeActivityScene=null;
  persist();
  return;
 }
 if(state.location==='home'&&daily?.day===state.day){
  // Re-entering in the same period does not launch a new encounter.
  state.liveHomeActivityScene=null;
  return;
 }
 // The activity check-in is scheduled only once the clock wipe has settled.
 if(state.location==='home'&&state.liveHomeActivityScene?.pending){
  const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
  if(!m.active){
   const chosen=state.liveHomeActivityScene.id||LIVE_HOME_CHECKIN.id;
   const id=LIVE_ROTATING_IDS.has(chosen)?chosen:LIVE_HOME_CHECKIN.id;
   delete m.seen[id]; // repeatable events may run again on another apartment activity
   m.active={id,phase:'lines',index:0,choice:null};
   state.liveDayScene={day:state.day,id,cg:state.liveHomeActivityScene.cg||liveEventArt(id),firstSlot:state.slot,lastSeenSlot:state.slot};
   state.liveHomeActivityScene.pending=false;
   state.liveLastEventDay=state.day;
   persist();
   return;
  }
 }
 // Live is a resident: her one-off scenes fire on a safe apartment arrival,
 // never remotely or after travelling the player elsewhere.
 if(state.location==='home'&&state.day<=90){
  const m=MANDATORY.hydrate(state,MANDATORY_EVENTS);
  const lastLiveDay=Number(state.liveLastEventDay)||0;
  if(lastLiveDay!==state.day){
   const intro=LIVE_EVENTS.find(e=>e.id==='live_home_welcome'&&e.earliestDay<=state.day&&!m.seen[e.id]);
   const available=LIVE_ROTATING_EVENTS.filter(e=>e.earliestDay<=state.day&&(!e.slots||e.slots.includes(state.slot)));
   const previous=state.liveLastRotatingId;
   const options=available.filter(e=>e.id!==previous);
   // Prioritize unseen CG stories before replaying old ones; preserve the
   // existing save-stable rotation and daily/period gates once all are seen.
   const unseen=options.filter(e=>!m.seen[e.id]);
   const pool=unseen.length?unseen:options;
   const rotation=pool.length?pool[(Number(state.liveDailyRotationCount)||0)%pool.length]:available[0];
   const due=intro||rotation;
   if(due){
    if(LIVE_ROTATING_IDS.has(due.id)){
     delete m.seen[due.id];
     state.liveLastRotatingId=due.id;
     state.liveDailyRotationCount=(Number(state.liveDailyRotationCount)||0)+1;
    }
    m.active={id:due.id,phase:'lines',index:0,choice:null};
    state.liveDayScene={day:state.day,id:due.id,cg:LIVE_EVENT_ART[due.id],firstSlot:state.slot,lastSeenSlot:state.slot};
    state.liveLastEventDay=state.day;
    persist();
    return;
   }
  }
 }
 // The scheduler must also receive the complete catalog to preserve Live's
 // active dialogue; Live is selected only by the apartment-specific gate.
 // The non-Live scheduler runs only when no Live scene is active.
 // Exclude the replayable pool so it cannot accidentally start on every render.
 const started=MANDATORY.takeNext(state,MANDATORY_EVENTS.filter(e=>
  !LIVE_EVENTS.includes(e)&&e.id!==MIA_FIRST_TIME.id&&e.id!==MIA_PRIVATE_EVENT.id&&e.id!==LIVE_MIA_CHOICE_EVENT.id&&e.id!==MIA_SLEEP_EVENT.id&&e.id!==MIA_COUCH_CHOICE_EVENT.id&&e.id!==MIA_WINE_MISUNDERSTANDING.id&&!MIA_KITCHEN_ART[e.id]&&!miaStoryIds.has(e.id)&&!REPEATABLE_LIVE_IDS.has(e.id)&&!LIVE_SPECIAL_IDS.has(e.id)&&e.id!==LIVE_HOME_CHECKIN.id&&e.id!==LIVE_LYLA_PHOTO_EVENT.id&&e.id!==LIVE_DAY_FOLLOWUP.id&&e.id!==LIVE_REPEAT_MORNING.id&&e.id!==LIVE_AFTER_EVENT.id));
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
// Live has no NPC in the normal roster. Her photo stories unlock through
// familiarity from completed repeatable apartment encounters instead.
function livePhotoRequest(active){
 if(!active||!LIVE_ROTATING_IDS.has(active.id)||active.phase!=='choice'||
    state.location!=='home'||state.day>90||(Number(state.focus)||0)<8)return null;
 const familiarity=Math.min(20,Object.values(state.liveRepeatCounts||{})
  .reduce((total,count)=>total+Math.max(0,Number(count)||0),0));
 const profile=window.NeoRpgPhotoProfiles?.byId('live');
 const stories=window.NeoRpgPhotoStories;
 if(!profile||!stories||familiarity<2)return null;
 // Fixed for the whole period and event; reloading cannot reroll the request.
 const chance=(state.day*17+state.slot*11+
  [...active.id].reduce((sum,ch)=>sum+ch.charCodeAt(0),0))%5<2;
 if(!chance)return null;
 const story=stories.select('live',profile,familiarity,state);
 return story?{story,trust:familiarity}:null;
}

function MIA_BASE_PRIVATE_IMAGE(){
 // Later artwork is not used in this non-explicit adaptation.
 const stage=state.miaPrivateStage==='outro'?1:Number(state.miaPrivateStage)||1;
 return '/rpg-assets/characters/live/events/mia/part'+Math.min(4,Math.max(1,stage))+'.png';
}
function renderMiaPrivate(){
 if(state.miaPrivateStage==='outro')return {speaker:'Mia',line:'Ah... I guess that\'s fine.',choices:[['Continue ›','miaPrivateClose']]};
 const step=Math.max(1,Math.min(7,Number(state.miaPrivateStage)||1));
 const nodes={
  1:['Mia','Can I ask you something? Do you really see yourself becoming my daddy, or was that just our joke?'],
  2:['Mia','Wait... you mean you would rather get to know me as myself? Not as a punch line?'],
  3:['Mia','I am not sure I heard you right. You want to know the real me?'],
  4:['Mia','If this is a joke, say so now. I have wanted to tell someone something important for a long time. Are you sure you want to hear it?'],
  5:['Mia','Okay... here goes. I have been scared to say this out loud.'],
  6:['Mia','Sometimes I feel everyone sees me only as Live\'s daughter. I want to make my own decisions. And I trust you enough to say that.'],
  7:['Mia','Thanks for listening. I wanted to tell you for ages... but please, let me be the one to talk to Live when I am ready.']
 };
 const [speaker,originalLine]=nodes[step];
 const line=originalLine;

 const back=['Go back — end the conversation','miaPrivateExit'];
 const choices=step===1?[
  ['I care about getting to know you, Mia','miaPrivateYes'],
  ['I think we should keep things as they were','miaPrivateExit']
 ]:step===2?[
  ['Yes, I mean it','miaPrivateNext'],back
 ]:step===3?[
  ['I really mean it','miaPrivateNext'],back
 ]:step===4?[
  ['Yes, you can tell me','miaPrivateNext'],
  ['I need to think — ask me again','miaPrivateAgain'],
  back
 ]:step<7?[
  ['Keep listening','miaPrivateNext']
 ]:[['Promise to respect her choice','miaPrivateFinish']];
 return {speaker,line:miaDialogueText(line),choices};
}
function miaPrivateAction(action){
 const m=state.mandatoryEventState;
 const step=Number(state.miaPrivateStage)||1;
 if(action==='miaPrivateYes'&&step===1){
  // Permanent retirement as soon as the first answer is chosen.
  state.miaDaddyRetired=true;
  state.miaPrivateStage=2;
 }else if(action==='miaPrivateNext'&&step>=2&&step<7){
  state.miaPrivateStage=step+1;
 }else if(action==='miaPrivateAgain'&&step===4){
  // Repeat the point of no return; don't automatically proceed.
  state.miaPrivateStage=4;
 }else if(action==='miaPrivateExit'){
  state.miaPrivateStage='outro';
 }else if(action==='miaPrivateClose'||action==='miaPrivateFinish'){
  // Finish through the authoritative mandatory state machine so reloads
  // cannot reopen this once-per-save scene.
  m.active.phase='choice';m.active.choice=null;
  MANDATORY.choose(state,MANDATORY_EVENTS,action==='miaPrivateFinish'?0:1);
  const result=MANDATORY.finish(state,MANDATORY_EVENTS);
  if(!result)return true;
  state.miaPrivateConversationFinished=true;
  state.miaPrivateOutcome=action==='miaPrivateFinish'?'confided':'stepped_back';
  state.miaPrivateStage=action==='miaPrivateFinish'?7:1;
  state.liveLastEventDay=state.day;
  state.liveDayScene=null;
  state.liveHomeActivityScene=null;
  log('Mia conversation: '+state.miaPrivateOutcome+'.');
 }else return true;
 persist();render();return true;
}


function miaSleepCanSpeakToMia(){
 return state.miaPrivateOutcome==='confided'&&!!state.mandatoryEventState?.seen?.[MIA_PRIVATE_EVENT.id];
}
function renderMiaSleep(){
 const stage=state.miaSleepStage||'choose';
 const who=state.miaSleepTarget;
 if(stage==='choose')return {speaker:'Narrator',
  line:'Live and Mia have fallen asleep on the sofa. The room is quiet except for their breathing.',
  choices:[['Whisper to Live','miaSleepLive'],
   ...(miaSleepCanSpeakToMia()?[['Whisper to Mia','miaSleepMia']]:[]),
   ['Let them sleep','miaSleepLeave']]};
 if(stage==='wake')return who==='live'
  ?{speaker:'Live',line:'Mmm... honey? Shhh. Mia is sleeping right beside us. Did you need something?',
    choices:[['Ask her to talk somewhere quieter','miaSleepTalk'],['Let her sleep','miaSleepLeave']]}
  :{speaker:'Mia',line:miaDialogueText('Huh? You picked me, {{miaNickname}}? Why are we whispering? Mom sleeps like a rock.'),
    choices:[['Ask for a moment together','miaSleepTalk'],['Let her sleep','miaSleepLeave']]};
 if(stage==='talk')return who==='live'
  ?{speaker:'Live',line:'Shhh... a little quieter, darling. She knows me too well. One look and she will start asking questions!',
    choices:[['Respect her privacy','miaSleepContinue'],['Leave her to rest','miaSleepLeave']]}
  :{speaker:'Mia',line:miaDialogueText('You do not have to whisper so much, {{miaNickname}}. I like it when you say what you mean. Can you imagine Mom\'s face if she noticed?'),
    choices:[['Ask her to keep the moment private','miaSleepContinue'],['Leave her to rest','miaSleepLeave']]};
 if(stage==='moment')return who==='live'
  ?{speaker:'Narrator',line:'Live looks toward the sleeping Mia, then takes your hand. You share a quiet moment before she gently suggests continuing the conversation somewhere more private.',
    choices:[['Stay a moment longer','miaSleepContinue'],['Leave quietly','miaSleepLeave']]}
  :{speaker:'Narrator',line:'Mia lowers her voice and smiles. You sit together for a while, sharing a secret conversation while Live sleeps nearby.',
    choices:[['Stay a moment longer','miaSleepContinue'],['Leave quietly','miaSleepLeave']]};
 if(stage==='end')return who==='live'
  ?{speaker:'Live',line:'Thank you for being discreet. Let us have a proper conversation later, when nobody is trying to sleep.',
    choices:[['Leave quietly','miaSleepFinish']]}
  :{speaker:'Mia',line:miaDialogueText('Part of me wants Mom to find out about our little talk... but I would rather tell her myself. Thanks for listening, {{miaNickname}}.'),
    choices:[['Leave quietly','miaSleepFinish']]};
 return {speaker:'Narrator',line:'You leave the room as quietly as you entered.',choices:[['Continue','miaSleepFinish']]};
}
function miaSleepAction(action){
 if(action==='miaSleepLive'||(action==='miaSleepMia'&&miaSleepCanSpeakToMia())){
  state.miaSleepTarget=action==='miaSleepLive'?'live':'mia';
  state.miaSleepStage='wake';
 }else if(action==='miaSleepTalk')state.miaSleepStage='talk';
 else if(action==='miaSleepContinue')state.miaSleepStage=state.miaSleepStage==='talk'?'moment':'end';
 else if(action==='miaSleepLeave')state.miaSleepStage='leave';
 else if(action==='miaSleepFinish'){
  const m=state.mandatoryEventState;
  m.active.phase='choice';m.active.choice=null;
  MANDATORY.choose(state,MANDATORY_EVENTS,0);
  if(!MANDATORY.finish(state,MANDATORY_EVENTS))return true;
  state.miaSleepOutcome=state.miaSleepStage==='leave'?'left':state.miaSleepTarget;
  state.liveDayScene=null;state.liveHomeActivityScene=null;
  state.liveLastEventDay=state.day;
  log('A quiet moment at home with Live and Mia.');
 }else return true;
 persist();render();return true;
}


function renderMiaCouchChoice(){
 const step=state.miaCouchChoiceStage||'choose',who=state.miaCouchChoiceTarget;
 if(step==='choose')return {speaker:'Narrator',
  line:'You find Live and Mia sharing a blanket on the couch. Both look up, surprised. Neither seems eager to move.',
  choices:[['Check on Live','miaCouchChooseLive'],
   ...(miaSleepCanSpeakToMia()?[['Check on Mia','miaCouchChooseMia']]:[]),
   ['Leave them alone','miaCouchLeave']]};
 if(step==='greet')return who==='live'
  ?{speaker:'Live',line:'Oh! Darling, I did not notice you coming in... Please, keep your voice down. Mia is right here.',
    choices:[['Ask if she is all right','miaCouchNext'],['Leave quietly','miaCouchLeave']]}
  :{speaker:'Mia',line:miaDialogueText('Oh, {{miaNickname}}! You caught us at the strangest moment. Mom, why do you look so nervous?'),
    choices:[['Ask if she is all right','miaCouchNext'],['Leave quietly','miaCouchLeave']]};
 if(step==='answer')return who==='live'
  ?{speaker:'Live',line:'I am fine, honey, really. I just do not want Mia to read too much into us being close. You know how she teases!',
    choices:[['Promise to be discreet','miaCouchNext'],['Let them rest','miaCouchLeave']]}
  :{speaker:'Mia',line:miaDialogueText('I am perfectly fine, {{miaNickname}}. Honestly, Mom gets flustered so easily. Sometimes I want to see what happens if I tease her just a little more.'),
    choices:[['Ask her to respect Live\'s feelings','miaCouchNext'],['Let them rest','miaCouchLeave']]};
 if(step==='closing')return who==='live'
  ?{speaker:'Live',line:'Thank you for understanding. We can talk properly later. Just... let us keep this little moment between us, okay?',
    choices:[['Smile and step away','miaCouchFinish']]}
  :{speaker:'Mia',line:miaDialogueText('All right, I will give Mom a break. But you have to admit, {{miaNickname}}, her reactions can be pretty funny!'),
    choices:[['Smile and step away','miaCouchFinish']]};
 return {speaker:'Narrator',line:'You leave them to enjoy a quiet afternoon together.',
  choices:[['Continue','miaCouchFinish']]};
}
function miaCouchChoiceAction(action){
 if(action==='miaCouchChooseLive'||(action==='miaCouchChooseMia'&&miaSleepCanSpeakToMia())){
  state.miaCouchChoiceTarget=action==='miaCouchChooseLive'?'live':'mia';
  state.miaCouchChoiceStage='greet';
 }else if(action==='miaCouchNext'){
  state.miaCouchChoiceStage=state.miaCouchChoiceStage==='greet'?'answer':'closing';
 }else if(action==='miaCouchLeave')state.miaCouchChoiceStage='leave';
 else if(action==='miaCouchFinish'){
  const m=state.mandatoryEventState;
  m.active.phase='choice';m.active.choice=null;
  MANDATORY.choose(state,MANDATORY_EVENTS,state.miaCouchChoiceStage==='leave'?0:1);
  if(!MANDATORY.finish(state,MANDATORY_EVENTS))return true;
  state.miaCouchChoiceOutcome=state.miaCouchChoiceStage==='leave'?'left':state.miaCouchChoiceTarget;
  state.liveDayScene=null;state.liveHomeActivityScene=null;
  state.liveLastEventDay=state.day;
  log('A quiet conversation on the couch.');
 }else return true;
 persist();render();return true;
}


function miaKitchenDialogue(){
 const id=state.mandatoryEventState?.active?.id;
 const variant=MIA_KITCHEN_EVENTS.findIndex(e=>e.id===id);
 if(variant<0)return null;
 // A completed private conversation is the existing route's authoritative
 // gate. Daddy only appears if its own saved flag permits it.
 const together=miaSleepCanSpeakToMia();
 const scenes=[
  {intro:'Live is checking a pan at the stove while Mia waits beside you.',
   ordinary:[
    ['Mia','Hey, {{miaNickname}}! Dinner will be ready soon. Mom says she wants to make sure you leave completely satisfied.'],
    ['Mia','Wait... why did she turn so red? I meant the food!'],
    ['Live','Mia, darling, could you please hand me the plates?']
   ],
   romantic:[
    ['Mia','Hey, {{miaNickname}}! Dinner will be ready soon... though I was hoping to steal a little of your attention before it is.'],
    ['Mia','Mom is working on dinner. I have a few plans for what we could do afterward.'],
    ['Live','I can hear you two, you know!']
   ]},
  {intro:'Warm light fills the kitchen. Live is adding the final seasoning while Mia keeps you company.',
   ordinary:[
    ['Mia','Hey, {{miaNickname}}! Mom says she knows exactly how to spoil you. She is making your favorite.'],
    ['Mia','What? Why are you both smiling like that? It is just a really good recipe!'],
    ['Live','Yes, sweetheart. Just the recipe.']
   ],
   romantic:[
    ['Mia','Hey, {{miaNickname}}! I saved you a taste of dinner... but I was mostly hoping to get some time alone with you.'],
    ['Mia','If Mom asks why we disappeared after dessert, I will say we were discussing the menu.'],
    ['Live','Mia! Please let me finish cooking first.']
   ]},
  {intro:'Dinner is almost finished, and Live is arranging the dishes behind Mia.',
   ordinary:[
    ['Mia','Hey, {{miaNickname}}! Mom says tonight she is pulling out all the stops for you.'],
    ['Mia','I am starting to think she is overdoing it. It is only dinner, right?'],
    ['Live','Dinner, Mia. Yes. Please help me set the table.']
   ],
   romantic:[
    ['Mia','Hey, {{miaNickname}}! I brought you dinner, but I would rather spend the evening with you than talk about recipes.'],
    ['Mia','I hope you have room for a second helping... of conversation, obviously.'],
    ['Live','You are being unusually mysterious tonight, Mia.']
   ]}
 ];
 const scene=scenes[variant],lines=together?scene.romantic:scene.ordinary;
 const step=Math.max(0,Math.min(4,Number(state.miaKitchenStage)||0));
 if(step===0)return {speaker:'Narrator',line:scene.intro,choices:[['Continue ›','miaKitchenNext'],['Leave quietly','miaKitchenLeave']]};
 if(step<=3){
  const [speaker,line]=lines[step-1];
  return {speaker,line:speaker==='Mia'?miaDialogueText(line):line,
    choices:[[step===3?'Respond ›':'Continue ›','miaKitchenNext'],['Leave quietly','miaKitchenLeave']]};
 }
 return {speaker:'Narrator',line:'The kitchen fills with the smell of dinner as Live calls everyone to the table.',
  choices:[['Join them for dinner','miaKitchenFinish'],['Leave them to cook','miaKitchenFinish']]};
}
function miaKitchenAction(action){
 if(action==='miaKitchenNext')state.miaKitchenStage=Math.min(4,(Number(state.miaKitchenStage)||0)+1);
 else if(action==='miaKitchenLeave'||action==='miaKitchenFinish'){
  const m=state.mandatoryEventState;
  m.active.phase='choice';m.active.choice=null;
  MANDATORY.choose(state,MANDATORY_EVENTS,action==='miaKitchenLeave'?1:0);
  if(!MANDATORY.finish(state,MANDATORY_EVENTS))return true;
  state.liveDayScene=null;
  state.liveHomeActivityScene=null;
  state.liveLastEventDay=state.day;
  log('Dinner with Live and Mia.');
 }else return true;
 persist();render();return true;
}


// Fourteen spoken lines plus staging: this is deliberately a long, escalating
// audio-only misunderstanding. The CG is reserved for the final reveal.
const MIA_WINE_OVERHEARD_LINES=[
 ['Narrator','You wake up to muffled voices in the next room. It is much too early for a party... and something keeps clinking.'],
 ['Mia','Mooom... come on, just a little more!'],
 ['Live','Hold still, sweetheart! I am trying not to spill it all over you.'],
 ['Mia','Oooh! That is amazing. What did you put in this?!'],
 ['Live','A little secret ingredient. I knew you would love it.'],
 ['Mia','Well, do not stop now! Give me another taste!'],
 ['Live','Slow down, baby. You have to let it breathe first.'],
 ['Mia','Let it breathe? Mom, I think it is trying to ESCAPE!'],
 ['Narrator','A loud POP echoes through the apartment. Something fizzes. A glass clatters onto the carpet.'],
 ['Live','Oh no! It is everywhere! Quick, grab a towel!'],
 ['Mia','I cannot! I am laughing too hard! You said it would be gentle!'],
 ['Live','I said to open it GENTLY. There is a difference!'],
 ['Mia','Okay, okay... mmm. Wow. That one really is good.'],
 ['Live','See? I told you this was worth staying up for.'],
 ['Mia','One more little glass? Please? Pretty please?'],
 ['Live','Only if you promise not to shake the next bottle.'],
 ['Mia','That was ONE time! ...Oh. I think the room is spinning a little.'],
 ['Live','Come here, you. Sit down before you fall down.'],
 ['Narrator','You hear a soft thump, two helpless giggles, and then absolutely nothing.'],
 ['Narrator','Fourteen minutes pass. No footsteps. No voices. Not even a suspicious clink. You decide whether to investigate.']
];
function renderMiaWine(){
 const stage=state.miaWineStage||'heard';
 const lines=MIA_WINE_OVERHEARD_LINES;
 if(stage==='heard'){
  const index=Math.max(0,Math.min(lines.length-1,Number(state.miaWineLine)||0));
  const [speaker,line]=lines[index];
  return {speaker,line:speaker==='Mia'?miaDialogueText(line):line,
   choices:index===lines.length-1?[
    ['Go see what happened','miaWineReveal'],
    ['Go back to sleep','miaWineIgnore']
   ]:[['Keep listening ›','miaWineNext']]};
 }
 if(stage==='reveal')return {speaker:'Narrator',
  line:'You peek inside. Live and Mia are asleep on the floor beside an empty bottle of sparkling wine, a couple of tipped-over glasses, and a bowl of snacks. So THAT was all the excitement.',
  choices:[['Cover them with a blanket','miaWineBlanket'],['Leave them sleeping','miaWineFinish']]};
 if(stage==='blanket')return {speaker:'Narrator',
  line:'You drape a blanket over them. Mia murmurs something about the bubbles, and Live smiles in her sleep.',
  choices:[['Leave quietly','miaWineFinish']]};
 return {speaker:'Narrator',line:'You decide the mystery can wait. The house is quiet again.',
  choices:[['Go back to sleep','miaWineFinish']]};
}
function miaWineAction(action){
 if(action==='miaWineNext'){
  state.miaWineLine=Math.min(MIA_WINE_OVERHEARD_LINES.length-1,(Number(state.miaWineLine)||0)+1);
 }else if(action==='miaWineReveal')state.miaWineStage='reveal';
 else if(action==='miaWineIgnore')state.miaWineStage='ignore';
 else if(action==='miaWineBlanket')state.miaWineStage='blanket';
 else if(action==='miaWineFinish'){
  const m=state.mandatoryEventState;
  m.active.phase='choice';m.active.choice=null;
  MANDATORY.choose(state,MANDATORY_EVENTS,state.miaWineStage==='ignore'?1:0);
  if(!MANDATORY.finish(state,MANDATORY_EVENTS))return true;
  state.miaWineOutcome=state.miaWineStage==='ignore'?'ignored':state.miaWineStage==='blanket'?'blanket':'discovered';
  state.liveDayScene=null;state.liveHomeActivityScene=null;
  state.liveLastEventDay=state.day;
  log('A sparkling wine mystery at home.');
 }else return true;
 persist();render();return true;
}


function renderLiveMiaChoice(){
 const phase=state.liveMiaChoiceStage||'intro',n=Math.max(0,Number(state.liveMiaChoiceStep)||0);
 const intro=[
  ['Live','Honey... wake up. I need to tell you something important.'],
  ['Live','Mia and I talked. She told me everything, and I understand how she feels.'],
  ['Live','I am not here to blame you. But we cannot keep avoiding this conversation.'],
  ['Live','I love you. Now I need to know where your heart is. Will you stay with me, or should we all talk?']
 ];
 const joint=[
  ['Narrator','Mia enters quietly and sits close beside you, resting a hand on your knee.'],
  ['Mia','Mom told me you were talking. I did not want you to make this decision without hearing me, too.'],
  ['Live','We talked honestly. Whatever you decide, I do not want either of us to hurt you.'],
  ['Mia','I love you. And I know Mom does, too.'],
  ['Live','If you choose Mia, I will respect it. If you choose me, Mia knows I will be grateful.'],
  ['Mia','And if you want us both in your life, say so honestly. No secrets, no guessing.'],
  ['Live','Then tell us. What do you really want?']
 ];
 const ending=phase==='liveEnding'?[
  ['Live','...Thank you, darling. I was trying so hard not to be nervous.'],
  ['Live','I am relieved. I love you, and I want us to face the next days together.']
 ]:phase==='miaEnding'?[
  ['Mia','...Really? You are choosing me?'],
  ['Mia','I am so happy. I know this was not easy, and I will not take your trust for granted.']
 ]:[
  ['Live','Together? Then we all need to keep talking openly, not hiding how we feel.'],
  ['Mia','I can do that. No more secrets. I want us to be happy, however we make it work.'],
  ['Narrator','They exchange a look, then turn toward you with a cautious, hopeful smile.']
 ];
 const script=phase==='intro'?intro:phase==='joint'?joint:ending;
 const [speaker,line]=script[Math.min(n,script.length-1)];
 const final=n>=script.length-1;
 const options=phase==='intro'?(final?[
   ['Stay with Live','liveMiaChooseLive'],
   ['Talk to both of them','liveMiaTalkBoth']
  ]:[['Continue ›','liveMiaNext']]):phase==='joint'?(final?[
   ['Choose Mia','liveMiaChooseMia'],['Choose Live','liveMiaChooseLive'],
   ['Choose both','liveMiaChooseBoth']
  ]:[['Continue ›','liveMiaNext']]):final?[
   [phase==='bothEnding'?'Finish the conversation':'Continue to the final scene','liveMiaFinish']
  ]:[['Continue ›','liveMiaNext']];
 return {speaker,line:speaker==='Mia'?miaDialogueText(line):line,choices:options};
}
function liveMiaChoiceAction(action){
 const phase=state.liveMiaChoiceStage||'intro';
 if(action==='liveMiaNext')state.liveMiaChoiceStep=(Number(state.liveMiaChoiceStep)||0)+1;
 else if(action==='liveMiaTalkBoth'&&phase==='intro'){
  state.liveMiaChoiceStage='joint';state.liveMiaChoiceStep=0;
 }else if(action==='liveMiaChooseLive'&&(phase==='intro'||phase==='joint')){
  state.liveMiaChoiceStage='liveEnding';state.liveMiaChoiceStep=0;
 }else if(action==='liveMiaChooseMia'&&phase==='joint'){
  state.liveMiaChoiceStage='miaEnding';state.liveMiaChoiceStep=0;
  state.miaDaddyRetired=true;
 }else if(action==='liveMiaChooseBoth'&&phase==='joint'){
  state.liveMiaChoiceStage='bothEnding';state.liveMiaChoiceStep=0;
  state.miaDaddyRetired=true;
 }else if(action==='liveMiaFinish'&&['liveEnding','miaEnding','bothEnding'].includes(phase)){
  const choice=phase==='liveEnding'?'live':phase==='miaEnding'?'mia':'both';
  const m=state.mandatoryEventState;
  m.active.phase='choice';m.active.choice=null;
  MANDATORY.choose(state,MANDATORY_EVENTS,choice==='live'?0:1);
  if(!MANDATORY.finish(state,MANDATORY_EVENTS))return true;
  state.liveMiaFinalChoice=choice;
  state.liveMiaChoiceEventSeen=true;
  state.liveMiaChoiceLastDay=state.day;
  state.liveDayScene=null;state.liveHomeActivityScene=null;
  state.liveLastEventDay=state.day;
  persist();render();
  if(choice!=='both'&&ROMANCE?.open){
   const person=choice==='live'?'Live':'Mia';
   const lines=choice==='live'
    ?['I am relieved we can be honest with each other.','I love you.','Thank you for choosing me.']
    :['I am glad we talked.','No more hiding what we feel.','Thank you for believing in me.'];
   const opened=ROMANCE.open({id:choice,name:person,
    artPath:'/rpg-assets/characters/'+choice+'/events/final/'+choice+'_sneeze_parody.png',
    discreet:liveDiscreetEnabled(),cgLines:lines,
    onFinish:()=>{state.liveMiaFinalViewed=true;persist();render();},
    onCancel:()=>{state.liveMiaFinalViewed=false;persist();render();}
   });
   if(!opened)log(person+' final scene is unavailable; the relationship choice has been saved.');
  }
  return true;
 }else return true;
 persist();render();return true;
}

function renderMandatory(){
 const a=state.mandatoryEventState?.active,e=MANDATORY_EVENTS.find(x=>x.id===a?.id);
 if(a?.id===MIA_PRIVATE_EVENT.id)return renderMiaPrivate();
 if(a?.id===LIVE_MIA_CHOICE_EVENT.id)return renderLiveMiaChoice();
 if(a?.id===MIA_SLEEP_EVENT.id)return renderMiaSleep();
 if(a?.id===MIA_COUCH_CHOICE_EVENT.id)return renderMiaCouchChoice();
 if(MIA_KITCHEN_ART[a?.id])return miaKitchenDialogue();
 if(a?.id===MIA_WINE_MISUNDERSTANDING.id)return renderMiaWine();
 if(!a||!e)return null;
 if(a.phase==='lines'){
  if(e.id===LIVE_DAY_FOLLOWUP.id){
   const follow=liveFollowupContent();
   return {speaker:follow.speaker,line:follow.text,choices:[['Continue ›','mandatoryNext']]};
  }
  if(e.id===LIVE_REPEAT_MORNING.id){
   const line=e.lines[a.index]||e.lines.at(-1);
   return {speaker:line.speaker,line:line.text,choices:[['Continue ›','mandatoryNext']]};
  }
  if(e.id===LIVE_LYLA_PHOTO_EVENT.id){
   const line=e.lines[a.index]||e.lines.at(-1);
   return {speaker:line.speaker==='Protagonist'?'You':line.speaker,line:line.text,
    choices:[[a.index<e.lines.length-1?'Continue ›':'Respond ›','mandatoryNext']]};
  }
  if(e.id==='live_glance_next_morning'){
   const line=e.lines[a.index]||e.lines.at(-1);
   return {speaker:line.speaker==='Protagonist'?'You':line.speaker,line:line.text,
    choices:[[a.index<e.lines.length-1?'Continue ›':'Respond ›','mandatoryNext']]};
  }
  if(e.id===LIVE_HOME_CHECKIN.id){
   const line=e.lines[a.index]||e.lines.at(-1);
   return {speaker:line.speaker,line:line.text,choices:[['Continue ›','mandatoryNext']]};
  }
  const original=e.lines[a.index]||e.lines[e.lines.length-1];
  if(e.id==='mia_gossip'&&a.index===3)return {speaker:'Mia',line:miaDialogueText('So... does this mean I have a new dad now? Should I call you Daddy? Just kidding! Mom, your face is completely red!'),choices:[['Continue ›','mandatoryNext']]};
  const cooling=LIVE_ROTATING_IDS.has(e.id)&&Number(state.liveRepeatLastDay)>0&&
    state.day>state.liveRepeatLastDay&&state.day<=state.liveRepeatLastDay+5;
  const line=cooling&&original.speaker==='Live'&&a.index===1
   ?{speaker:'Live',text:liveFollowupContent().text}:original;
  const name=line.speaker==='Protagonist'?'You':cast[line.speaker]?.name||line.speaker;
  const remote=e.kind==='bond'&&(e.delivery==='remote'||!SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location)).includes(e.characterId));
  return {speaker:remote&&cast[line.speaker]?'✉ '+name+' · message':name,line:mandatoryText(miaStoryIds.has(e.id)?miaDialogueText(line.text):line.text),choices:a.index===e.lines.length-1&&LIVE_EVENT_ART[e.id]&&!miaStoryIds.has(e.id)&&e.id!==MIA_FIRST_TIME.id?[[ 'Respond ›','mandatoryNext'],['◉ Glance at Live','mandatoryGlance']]:[[a.index<e.lines.length-1?'Continue ›':'Respond ›','mandatoryNext']]};
 }
 if(a.phase==='choice'){
  if(e.id===LIVE_DAY_FOLLOWUP.id){
   const follow=liveFollowupContent();
   return {speaker:follow.speaker,line:follow.text,
    choices:[['See you later ›','mandatoryChoice:0'],
     ...(!follow.away?[['◉ Glance at Live','mandatoryGlance']]:[])]};
  }
  if(e.id===LIVE_REPEAT_MORNING.id)
   return {speaker:'Narrator',line:'The morning passes quietly.',choices:[['Continue ›','mandatoryChoice:0']]};
  if(e.id===LIVE_LYLA_PHOTO_EVENT.id)return {speaker:'Live',line:e.lines.at(-1).text,
   choices:e.choices.map((choice,index)=>[choice.label,'mandatoryChoice:'+index])};
  if(e.id==='live_glance_next_morning')
   return {speaker:'Narrator',line:'The morning slips by.',choices:[['Continue ›','mandatoryChoice:0']]};
  if(e.id===LIVE_HOME_CHECKIN.id)
   return {speaker:'Live',line:"Are you okay? Why didn't you go out?",choices:[['Leave now ›','mandatoryActivityLeave'],['◉ Glance at Live','mandatoryGlance']]};
  const last=e.lines.at(-1);
  const remote=e.kind==='bond'&&(e.delivery==='remote'||!SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location)).includes(e.characterId));
  const speaker=last?.speaker==='Protagonist'?'You':(cast[last?.speaker]?.name||last?.speaker||'Narrator');
  const photoOffer=livePhotoRequest(a);
  const baseChoices=LIVE_EVENT_ART[e.id]&&!miaStoryIds.has(e.id)&&e.id!==MIA_FIRST_TIME.id?[...e.choices.map((c,i)=>[c.label,'mandatoryChoice:'+i]),['◉ Glance at Live','mandatoryGlance']]:e.choices.map((c,i)=>[c.label,'mandatoryChoice:'+i]);
  const choices=photoOffer?[...baseChoices,
   ["Sure, I'll take those photos",'mandatoryPhotoLive']]:baseChoices;
  const line=mandatoryText(miaStoryIds.has(e.id)?miaDialogueText(last?.text||''):last?.text||'')+
   (photoOffer?'\n\nLive: "'+photoOffer.story.hook+'"':'');
  return {speaker:remote&&cast[last?.speaker]?'✉ '+speaker+' · message':speaker,line,choices};
 }
 const choice=e.choices[a.choice];
 if(e.id===LIVE_REPEAT_MORNING.id)return {speaker:'Narrator',line:choice?.reply||'',choices:[['Continue ›','mandatoryFinish']]};
 if(e.id===LIVE_DAY_FOLLOWUP.id)return {speaker:liveFollowupContent().away?'Narrator':'Live',
  line:liveFollowupContent().away?'You leave the note where you found it.':choice?.reply||'',
  choices:[['Leave now ›','mandatoryFinish'],
   ...(!liveFollowupContent().away?[['◉ Glance at Live','mandatoryGlance']]:[])]};
 if(e.id===LIVE_LYLA_PHOTO_EVENT.id)return {speaker:'Live',line:choice?.reply||'',
  choices:[['Continue ›','mandatoryFinish']]};
 if(LIVE_SPECIAL_IDS.has(e.id)){
  const extra=e.id==='live_glance_talk_one'&&!state.liveFirstCouchGlanced
    ?[['◉ Glance at Live','mandatoryGlance']]:[];
  return {speaker:e.id==='live_glance_next_morning'?'Narrator':'Live',line:mandatoryText(choice?.reply||''),
   choices:[['Continue ›','mandatoryFinish'],...extra]};
 }
 const responseActor=[...e.lines].reverse().find(line=>cast[line.speaker])?.speaker;
 const remoteReply=e.kind==='bond'&&(e.delivery==='remote'||!SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location)).includes(e.characterId));
 const actorName=cast[e.characterId]?.name||e.characterId;
 return {speaker:e.kind==='bond'?(remoteReply?'✉ '+actorName+' · message':actorName):(cast[responseActor]?.name||'Narrator'),line:mandatoryText(miaStoryIds.has(e.id)?miaDialogueText(choice?.reply||''):choice?.reply||''),choices:LIVE_EVENT_ART[e.id]&&!miaStoryIds.has(e.id)&&e.id!==MIA_FIRST_TIME.id?
  [['Leave now ›','mandatoryFinish'],['◉ Glance at Live','mandatoryGlance'],
   ...(liveCanRepeat()?[["Ask Live to spend another private morning together",'mandatoryRepeatLive']]:[])]:
  [['Continue story ›','mandatoryFinish']]};
}
function mandatoryAction(type,id){
 if(!MANDATORY||!state.mandatoryEventState?.active)return false;
 if(state.mandatoryEventState.active.id===MIA_PRIVATE_EVENT.id)
  return miaPrivateAction(type);
 if(state.mandatoryEventState.active.id===LIVE_MIA_CHOICE_EVENT.id)
  return liveMiaChoiceAction(type);
 if(state.mandatoryEventState.active.id===MIA_SLEEP_EVENT.id)
  return miaSleepAction(type);
 if(state.mandatoryEventState.active.id===MIA_COUCH_CHOICE_EVENT.id)
  return miaCouchChoiceAction(type);
 if(MIA_KITCHEN_ART[state.mandatoryEventState.active.id])
  return miaKitchenAction(type);
 if(state.mandatoryEventState.active.id===MIA_WINE_MISUNDERSTANDING.id)
  return miaWineAction(type);
 if(type==='mandatoryPhotoLive'){
  const offer=livePhotoRequest(state.mandatoryEventState.active);
  if(!offer||!window.NeoRpgPhotoSession?.open||!confirmTimeAdvance())return true;
  window.NeoRpgPhotoSession.open({
   characterId:'live',location:'home',story:true,storyId:offer.story.id,
   trust:offer.trust,day:state.day,slot:state.slot,savedAlbum:state.photoAlbum,
   onCancel:()=>{},onComplete:result=>{
    try{
     if(!livePhotoRequest(state.mandatoryEventState.active)||
        result?.characterId!=='live'||result.storyId!==offer.story.id||
        !Array.isArray(result.photos)||result.photos.length!==3)
      throw Error('The photo story is no longer available.');
     const before=activityBalance();
     const complete=MANDATORY.finish(state,MANDATORY_EVENTS);
     if(!complete)throw Error('This apartment encounter has already ended.');
     const activeId=complete.event.id;
     state.liveRepeatCounts=state.liveRepeatCounts||{};
     state.liveRepeatCounts[activeId]=(Number(state.liveRepeatCounts[activeId])||0)+1;
     state.liveHomeActivityScene=null;
     state.credits=Math.min(999999,(Number(state.credits)||0)+Math.max(0,Math.min(14,Number(result.credits)||0)));
     state.focus=Math.max(0,(Number(state.focus)||0)-8);
     const album=(Array.isArray(state.photoAlbum)?state.photoAlbum:[])
      .concat(result.photos.map(p=>({...p,day:state.day})));
     const counts={};
     state.photoAlbum=album.slice().reverse().filter(p=>{
      const key=String(p?.character||'');
      if(!key||counts[key]>=6)return false;
      counts[key]=(counts[key]||0)+1;return true;
     }).slice(0,72).reverse();
     state.photoStoryDone=state.photoStoryDone||{};
     const seen=Array.isArray(state.photoStoryDone.live)?state.photoStoryDone.live:[];
     if(!seen.includes(offer.story.id))state.photoStoryDone.live=[...seen,offer.story.id];
     state.photoRecords=state.photoRecords||{};
     const prev=state.photoRecords.live||{};
     state.photoRecords.live={lastDay:state.day,sessions:(prev.sessions||0)+1,
      bestAverage:Math.max(prev.bestAverage||0,result.average||0),lastAverage:result.average||0};
     activityOutcome('Live',offer.story.title+'. '+result.average+
      '/100 average. Live thanks you for the photographs.',before,null);
    }catch(error){
     window.NeoRpgErrorReport?.capture?.(error,{source:'live-photo',action:'complete'});
     console.error('Live photo story completion failed',error);
     persist();render();
    }
   }
  });
  return true;
 }
 if(type==='mandatoryNext')MANDATORY.advanceDialogue(state,MANDATORY_EVENTS);
 else if(type==='mandatoryChoice'){
  const specialId=state.mandatoryEventState.active.id;
  const selected=MANDATORY.choose(state,MANDATORY_EVENTS,Number(id));
  if(selected&&specialId==='live_glance_talk_one'&&!state.liveFirstConversationGlanceCount){
   // Acknowledging the first conversation counts as two more glances,
   // but does not open the viewer or trigger another event.
   state.liveGlanceCount=(Number(state.liveGlanceCount)||0)+2;
   state.liveGlancesByEvent=state.liveGlancesByEvent||{};
   state.liveGlancesByEvent[specialId]=(Number(state.liveGlancesByEvent[specialId])||0)+2;
   state.liveFirstConversationGlanceCount=state.liveGlanceCount;
   if(state.liveGlanceCount>=30&&!state.liveThirtyGlancesDay)state.liveThirtyGlancesDay=state.day;
  }
 }
 else if(type==='mandatoryRepeatLive'){
  const activeId=state.mandatoryEventState.active.id;
  if(!liveCanRepeat()||!LIVE_ROTATING_IDS.has(activeId)||state.mandatoryEventState.active.phase!=='response')return true;
  const outcome=MANDATORY.finish(state,MANDATORY_EVENTS);
  if(!outcome)return true;
  state.liveRepeatCounts=state.liveRepeatCounts||{};
  state.liveRepeatCounts[activeId]=(Number(state.liveRepeatCounts[activeId])||0)+1;
  state.liveHomeActivityScene=null;
  state.mandatoryEventState.active={id:LIVE_REPEAT_MORNING.id,phase:'lines',index:0,choice:null};
  persist();render();return true;
 }
 else if(type==='mandatoryGlance'){
  const activeId=state.mandatoryEventState.active.id;
  const cg=liveDiscreetEnabled()?LIVE_DISCREET_PLACEHOLDER:liveEventArt(activeId);
  if(!cg||(activeId===LIVE_DAY_FOLLOWUP.id&&liveFollowupContent().away)||
     !['lines','choice','response'].includes(state.mandatoryEventState.active.phase))return true;
  // The existing glance viewer accepts a source image and a crop rectangle.
  // Count the deliberate choice, not modal reopens or automatic CG display.
  if(typeof window.NeoOutfitChime?.glance!=='function')return true;
  const isFirstSpecial=activeId==='live_glance_talk_one';
  if(isFirstSpecial&&state.liveFirstCouchGlanced)return true;
  // A returning visitor can view the same CG again, but a unique daily
  // scene counts once, and no period can grant more than one glance.
  const ledger=state.liveGlanceLedger?.day===state.day?state.liveGlanceLedger:
   {day:state.day,slots:[],events:[]};
  state.liveGlanceLedger=ledger;
  const baseId=activeId===LIVE_DAY_FOLLOWUP.id?state.liveDayScene?.id||activeId:activeId;
  const canCount=!ledger.slots.includes(state.slot)&&!ledger.events.includes(baseId);
  if(canCount){
   ledger.slots.push(state.slot);
   ledger.events.push(baseId);
   state.liveGlanceCount=(Number(state.liveGlanceCount)||0)+1;
   state.liveGlancesByEvent=state.liveGlancesByEvent||{};
   state.liveGlancesByEvent[baseId]=(Number(state.liveGlancesByEvent[baseId])||0)+1;
  }
  if(isFirstSpecial)state.liveFirstCouchGlanced=true;
  if(canCount&&state.liveGlanceCount>=30&&!state.liveThirtyGlancesDay)
   state.liveThirtyGlancesDay=state.day;
  const previousMilestone=state.liveFirstConversationGlanceCount||0;
  let milestone=null;
  if(canCount&&!LIVE_SPECIAL_IDS.has(activeId)){
   if(!state.liveSpecialSeen?.live_glance_talk_one&&state.liveGlanceCount>=6)
    milestone='live_glance_talk_one';
   else if(state.liveSpecialSeen?.live_glance_talk_one&&!state.liveSpecialSeen?.live_glance_talk_two&&
    previousMilestone&&state.liveGlanceCount>=previousMilestone+15)
    milestone='live_glance_talk_two';
  }
  persist();
  const onClose=()=>{if(milestone)startLiveGlanceMilestone(milestone);};
  const candidates=!liveDiscreetEnabled()&&LIVE_SPECIAL_IDS.has(activeId)
    ?[...specialArtCandidates(LIVE_SPECIAL_ART[activeId]),'/rpg-assets/characters/live/events/live_couch_sweater.png']
    :[cg];
  const openGlance=async()=>{
   // Resolve a missing future CG to the existing approved couch image.
   let src=cg;
   if(!liveDiscreetEnabled()&&LIVE_SPECIAL_IDS.has(activeId)){
    src=await new Promise(resolve=>{
     let i=0;
     const attempt=()=>{
      if(i>=candidates.length){resolve(null);return;}
      const candidate=candidates[i++],test=new Image();
      test.onload=()=>resolve(candidate);
      test.onerror=attempt;
      test.src=candidate;
     };
     attempt();
    });
   }
   if(!src){onClose();return;}
   await window.NeoOutfitChime.glance(src,{top:0,bottom:1,left:0,right:1},onClose);
  };
  Promise.resolve(openGlance()).catch(error=>{console.warn('Live glance failed',error);onClose();});
  return true;
 }
 else if(type==='mandatoryActivityLeave'){
  if(state.mandatoryEventState.active.id!==LIVE_HOME_CHECKIN.id||state.mandatoryEventState.active.phase!=='choice')return true;
  MANDATORY.choose(state,MANDATORY_EVENTS,0);
  const outcome=MANDATORY.finish(state,MANDATORY_EVENTS);
  if(outcome){state.liveHomeActivityScene=null;log('Live checked in after an activity at home.');}
 }
 else if(type==='mandatoryFinish'){
  const activeId=state.mandatoryEventState.active.id;
  const outcome=MANDATORY.finish(state,MANDATORY_EVENTS);
  if(outcome&&activeId===LIVE_AFTER_EVENT.id){
   state.liveAfterPending=false;
   state.liveAfterLastCompletedDay=state.day;
   log('A tender moment with Live after your private morning.');
  }
  if(outcome&&activeId===LIVE_REPEAT_MORNING.id){
   state.liveAfterPending=true;
   state.liveRepeatLastDay=state.day;
   state.focus=Math.min(100,(Number(state.focus)||0)+5);
   log('A restorative morning with Live: +5 focus. Live needs five days to recover.');
   if(state.slot===0)advance(1,'live_repeat_morning');
  }
  if(outcome&&LIVE_SPECIAL_IDS.has(activeId)){
   if(activeId==='live_glance_next_morning'){
    state.liveSpecialSeen={...(state.liveSpecialSeen||{}),live_glance_next_morning:true};
    state.liveSuspendedEvent=null;
    state.liveAfterPending=true;
    persist();
    // The CG sequence consumes the morning only. An overdue scene reached
    // after morning must not skip another period or change the date.
    if(state.slot===0)advance(1,'live_special_morning');
   }else{
    const suspended=state.liveSuspendedEvent;
    state.liveSuspendedEvent=null;
    if(suspended&&!state.mandatoryEventState.seen?.[suspended.id])
     state.mandatoryEventState.active=suspended;
   }
  }
  if(outcome){
   if(outcome.event.id===LIVE_LYLA_PHOTO_EVENT.id){
    if(state.phoneMessages)state.phoneMessages.liveLylaSighting=null;
    log('Live showed you a photo of Lyla from a local advertisement.');
   }
   if(LIVE_ROTATING_IDS.has(outcome.event.id)){
    state.liveRepeatCounts=state.liveRepeatCounts||{};
    state.liveRepeatCounts[outcome.event.id]=(Number(state.liveRepeatCounts[outcome.event.id])||0)+1;
    state.liveHomeActivityScene=null;
    log('A moment at home with Live: '+outcome.event.title+'.');
   }else log('Story milestone: '+(outcome.event.title||outcome.event.id)+'.');
  }
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
function advance(n=1,transitionSource='activity',suppressTimeFlash=false){const beforeDay=state.day,beforeSlot=state.slot;
const homeActivity=transitionSource==='home_activity'&&state.location==='home'&&state.day<=90;
TIME.advanceClock(state,n);
if(homeActivity&&state.day<=90){
 const count=(Number(state.liveHomeActivityCount)||0)+1;
 const seen=state.mandatoryEventState?.seen||{};
 const previous=Object.keys(seen).filter(id=>LIVE_EVENT_ART[id]).sort((a,b)=>
  (Number(seen[b]?.day)||0)-(Number(seen[a]?.day)||0)||
  (Number(seen[b]?.slot)||0)-(Number(seen[a]?.slot)||0))[0];
 const lastCG=state.liveHomeActivityScene?.cg||LIVE_EVENT_ART[previous];
 // Alternate ordinary check-ins with the five repeatable CG encounters.
 // The rotation is save-stable, avoids immediate repeats, and never consumes an extra period.
 const pool=[LIVE_HOME_CHECKIN.id,...LIVE_ROTATING_EVENTS.filter(event=>event.earliestDay<=state.day&&(!event.slots||event.slots.includes(state.slot))).map(event=>event.id)];
 const previousId=state.liveHomeLastSceneId;
 // Rotate through every scene before repeating, including laundry.
 let id=pool[(count-1)%pool.length];
 if(id===previousId)id=pool[count%pool.length];
 const cg=id===LIVE_HOME_CHECKIN.id
  ?LIVE_HOME_CHECKIN_ART.filter(path=>path!==lastCG)[(count-1)%Math.max(1,LIVE_HOME_CHECKIN_ART.filter(path=>path!==lastCG).length)]
  :LIVE_EVENT_ART[id];
 state.liveHomeActivityCount=count;
 state.liveHomeLastSceneId=id;
 state.liveHomeActivityScene={pending:true,id,cg,day:state.day,slot:state.slot};
}if(state.day>90)log('The Neo Harbor championship season has ended.');
state.selected=null;
if(state.day>beforeDay){
 // A new calendar day always begins at home, regardless of yesterday's last stop.
 // Only day rollover resets location; advancing between periods never does.
 state.location=tournamentDayCup()?'center':'home';
 state.visitedLocations=state.visitedLocations||{};
 state.visitedLocations[state.location]=true;
 pendingOverworldArrival=state.location;
 pendingEntrySurprise=false;
 WORLD.newDay(state,state.day-beforeDay);
 const news=COMMUNITY.sync(state,Math.min(90,state.day-1),{schedules:SCHEDULES,cast});
 if(news.length){
  const latest=news.at(-1);
  log('Club news: '+COMMUNITY.describe(latest,cast));
 }
 phoneMessages?.onDayAdvance(beforeDay);
}
const expiredCups=TOURNAMENTS.expire(state);if(expiredCups.length)log('A tournament registration window has closed.');
STORY.recordExpiry(state); // Character story chapters are never lost to calendar expiry.
const missedQuests=SIDE.expire(state);if(missedQuests.length)log('A local side-quest opportunity passed while you were away.');
const missedAppointments=APPOINTMENTS.expire(state);
INTENTIONS.hydrate(state); // Expire yesterday's optional choice before saving the new day.
for(const plan of missedAppointments)log('You missed your planned meet-up with '+(cast[plan.npc]?.name||'a trainer')+'.');
// Keep the player at home for wake-up and any queued mandatory morning scene.
// Scheduled appointments can be resolved after the morning arrival, not by
// teleporting away before the new day is shown.
queueMandatory();if(state.day===beforeDay)arriveForScheduledPlan();persist();
if(!suppressTimeFlash&&timeSequence.queue({beforeDay,beforeSlot,afterDay:state.day,afterSlot:state.slot,source:transitionSource}))timeSequence.flush();}
function say(speaker,line,choices=[]){scene={speaker,line,choices};state.scene=scene;persist();render();}
function showRomanceOffer(id){
 if(!ROMANCE?.offerable(state,id,STORY)||!cast[id])return false;
 const first=ROMANCE.isFirst(state,id);
 scene={speaker:cast[id].name,
  line:first?
   "We've grown so close. Would you like to spend some time alone together at your apartment?":
   "I loved our last evening together. Would you like me to visit your apartment again?",
  choices:[["Yes, let's go to my apartment",'romanceAccept:'+id],
   ['Maybe another time','romanceLater:'+id]],romanceOffer:id};
 state.scene=scene;state.selected=id;persist();render();return true;
}
function startRomanceVisit(id){
 if(!ROMANCE?.ready(state,id,STORY)||!cast[id]||state.location!=='home'||
    state.romanceVisitShowing||state.pendingDuel||state.mandatoryEventState?.active||
    state.activeStory||state.activeSliceOfLife||state.activeSituation||
    state.activeSideQuest||state.activeArc||state.activeEncounter||
    scene?.line||scene?.choices?.length||timeSequence.blocked||
    arrivalGate||pendingOverworldArrival||window.NeoRpgTimeTransitions?.active)return false;
 const first=ROMANCE.isFirst(state,id);
 const script=ROMANCE.dialogue(id);
 const lines=(first?script.first:script.repeat).map(text=>({speaker:id,text}));
 state.selected=id;state.romanceVisitDeferred=false;
 scene={speaker:cast[id].name,line:lines[0].text,choices:[['Continue ›','chatNext']],
  dialogue:lines,index:0,afterChoices:[['Continue ›','romanceView:'+id]],romanceNpc:id};
 state.scene=scene;persist();render();return true;
}
function openRomanceVisit(id){
 if(state.romanceVisitShowing!==id||document.getElementById('neoRomanceVisitCG'))return;
 const script=ROMANCE.dialogue(id),first=ROMANCE.isFirst(state,id);
 if(!ROMANCE?.open({id,name:cast[id]?.name||id,discreet:liveDiscreetEnabled(),
  cgLines:script.barks,lineOffset:Number(state.romanceVisits?.[id]?.count)||0,
  onFinish:()=>{
   const completed=ROMANCE.complete(state,id,STORY);
   state.romanceVisitShowing=null;
   if(!completed){
    scene={speaker:'Narrator',line:'',choices:[]};state.scene=scene;
    persist();render();return;
   }
   log('Shared a private moment with '+cast[id].name+'.');
   activityOutcome(cast[id].name,script.outro[first?0:1]||script.outro[0],
    null,null,[],1,'romance_visit');
  },
  onCancel:()=>{
   state.romanceVisitShowing=null;
   state.romanceVisitDeferred=true;
   scene={speaker:'Narrator',line:'',choices:[]};state.scene=scene;
   persist();render();
  }
 })){
  state.romanceVisitShowing=null;
  say(cast[id]?.name||'Narrator','The private CG viewer is unavailable. You can try again later.',
   [['Close','close']]);
 }
}
function sayConversation(lines,afterChoices=[],reactionId=null,invitation=null,memory=null,casual=null,creditBond=false,photoOffer=null,photoStoryId=null){
 if(!Array.isArray(lines)||!lines.length)return;
 const script=lines.filter(x=>x&&typeof x.text==='string'&&typeof x.speaker==='string');
 if(!script.length)return;
 const first=script[0];
 scene={speaker:first.speaker==='Protagonist'?'You':cast[first.speaker]?.name||first.speaker,
  line:first.text,choices:script.length>1?[['Continue ›','chatNext']]:afterChoices,
  dialogue:script,index:0,afterChoices,reactionId,invitation,bondConversation:creditBond,
   memoryId:memory?.kind==='followup'?memory.id:null,memoryOfferId:memory?.kind==='intro'?memory.id:null,
   casualId:casual?.id||null,asideId:casual?.asideId||null,photoOffer,photoStoryId};
 state.scene=scene;persist();render();
}
function advanceConversation(){
 if(!Array.isArray(scene.dialogue)||scene.index>=scene.dialogue.length-1)return;
 scene.index++;
 const next=scene.dialogue[scene.index];
 scene.speaker=next.speaker==='Protagonist'?'You':cast[next.speaker]?.name||next.speaker;
 scene.line=next.text;
 scene.choices=scene.index===scene.dialogue.length-1?scene.afterChoices:[['Continue ›','chatNext']];
 // Completing a real conversation adds a small amount of affection once per
 // character each day. A story invitation alone grants nothing.
 if(scene.index===scene.dialogue.length-1&&scene.bondConversation&&!scene.invitation&&state.selected&&cast[state.selected]){
  state.relationshipTalkCredit=state.relationshipTalkCredit||{};
  const key=state.day+':'+state.selected;
  if(!state.relationshipTalkCredit[key]){
   REL.apply(state,state.selected,{affection:1});
   state.relationshipTalkCredit[key]=true;
  }
 }
 // Do not consume an acknowledgement until the player actually reads its final line.
 if(scene.index===scene.dialogue.length-1&&scene.reactionId)REACT.mark(state,scene.reactionId);
 if(scene.index===scene.dialogue.length-1&&scene.memoryId)MEM?.mark(state,scene.memoryId);
 if(scene.index===scene.dialogue.length-1&&scene.casualId)MEM?.markCasual(state,scene.casualId);
 if(scene.index===scene.dialogue.length-1&&scene.asideId)MEM?.markAside(state,scene.asideId);
 state.scene=scene;persist();render();
}
// Outcome first, then the clock wipe: rewards are saved independently of time.
function activityBalance(npc=null){
 const result={};
 for(const key of ['credits','focus','insight','reputation','preparation'])
  result[key]=Number(state[key])||0;
 if(npc){
  const bond=state.relationships?.[npc]||state.bonds?.[npc]||{};
  for(const key of ['affection','trust','respect','attraction'])
   result[key]=Number(bond[key])||0;
 }
 return result;
}
function activityOutcome(speaker,description,before=null,npc=null,bonus=[],periodsToAdvance=1,source='activity'){
 const earned=[...bonus],spent=[];
 if(before){
  const after=activityBalance(npc);
  const names={credits:'credits',focus:'focus',insight:'insight',reputation:'reputation',
   preparation:'duel prep',affection:'affection',trust:'trust',respect:'respect',attraction:'attraction'};
  for(const key of Object.keys(before)){
   const diff=(after[key]||0)-before[key];
   if(diff>0)earned.push('+'+diff+' '+names[key]);
   else if(diff<0)spent.push(diff+' '+names[key]);
  }
 }
 const rewards=before?'\n\nEarned: '+(earned.join(' · ')||'No stat gains')+(spent.length?'\nSpent: '+spent.join(' · '):''):'';
 scene={speaker,line:description+rewards,choices:[['Continue ›','activityContinue']],
  activityAdvance:{periods:periodsToAdvance,source}};
 state.scene=scene;persist();render();
}
function finishActivityOutcome(){
 // A cloud/local rehydrate can restore the saved receipt after the in-memory
 // scene reference changed. Keep Continue operable without charging again.
 const saved=state.scene?.activityAdvance;
 const receipt=scene?.activityAdvance||saved;
 if(!receipt)return false;
 const n=Math.max(1,Math.min(3,Number(receipt.periods)||1));
 const source=String(receipt.source||'activity');
 state.scene=scene={speaker:'Narrator',line:'',choices:[]};
 state.sceneCgId=null;
 persist();
 try{advance(n,source);}
 finally{
  // If the time-wipe owns the next frame it will render after the wipe;
  // otherwise remove the old activity dialogue immediately.
  if(!timeSequence.blocked)render();
  else{
   // On mobile, a suspended/replaced wipe can leave the old receipt on screen
   // although the clock was already saved. Retry the queued visual handoff.
   notifyOverworldRendering();
   setTimeout(()=>{
    if(scene?.activityAdvance||state.scene?.activityAdvance)return;
    if(timeSequence.blocked&&!timeSequence.running)timeSequence.flush();
    if(!timeSequence.blocked&&!arrivalGate)render();
   },1600);
  }
 }
 return true;
}
function closeSceneDialogue(){
 if(scene?.activityAdvance){finishActivityOutcome();return;}
 if(state.activeSliceOfLife||state.activeSituation||state.activeStory||state.activeEncounter||state.activeArc||state.activeSideQuest||state.pendingDuel||state.mandatoryEventState?.active)return;
 // Keep the current character selected after casual dialogue so Duel and Deck actions remain accessible.
 if(!state.selected||!cast[state.selected]||!currentPeople().includes(state.selected))state.selected=null;
 state.sceneCgId=null;
 scene={speaker:'Narrator',line:'',choices:[]};
 state.scene=scene;
 persist();
 // Start the queued wipe before revealing the next day. If the wipe is not
 // ready, render normally; a deferred wipe must never freeze dialogue choices.
 if(!timeSequence.flush())render();
}
// Narrate a destination only the first time the player visits it.
function travelTo(placeId,{intro=true}={}){
 if(!places[placeId]||controlsLocked()||state.location===placeId)return false;
 const firstVisit=!state.visitedLocations[placeId];
 state.visitedLocations[placeId]=true;
 state.location=placeId;state.selected=null;pendingOverworldArrival=placeId;
 // Entry surprises must wait until travel and any outfit/introduction chime finish.
 pendingEntrySurprise=!firstVisit&&placeId!=='home';
 if(firstVisit&&intro)say('Narrator',places[placeId][1]);
 else{scene={speaker:'Narrator',line:'',choices:[]};state.scene=scene;persist();render();}
 tutorialEvent('travel');
 return true;
}
let overworldScenePortraits={participants:[],focused:null,conversation:false};
let overworldRenderedDialogue='';
// The map/eye-level iframe reports the exact image the player interacted with.
const overworldClickedPoses=new Map();
function visibleOverworldPose(id){
 const pose=overworldClickedPoses.get(id);
 return pose&&pose.day===state.day&&pose.slot===state.slot&&pose.location===state.location?pose.src:null;
}
// Source of truth if a scene was resumed or the click-pose cache expired:
// read the currently rendered sprite from the live, same-origin overworld.
function liveOverworldPose(id){
 const overlay=document.getElementById('neoOverworldOverlay');
 if(!overlay||overlay.hidden)return null;
 const frame=overlay.querySelector('iframe[title="Current Neo Campus location"]');
 let map;try{map=frame?.contentDocument}catch{return null}
 if(!map)return null;
 const idSelector='[data-character="'+CSS.escape(id)+'"]';
 const eyeLevel=map.body?.classList.contains('neo-eye-level');
 const image=map.querySelector(eyeLevel?
  '#neoEyeLevelStage .neo-eye-character'+idSelector+' img':
  '#world .anchor'+idSelector+' img.sprite');
 const source=image?.currentSrc||image?.getAttribute('src')||null;
 if(source&&window.NeoRpgOverworldBridge?.setVisiblePose(id,source))return visibleOverworldPose(id);
 return null;
}
// Event eligibility is evaluated from campaign state, not from hidden HTML
// buttons. The overworld renders this view model and sends typed actions back.
function overworldOpportunities(){
 const locked=overworldControlsLocked(),present=currentPeople();
 const story=eligibleStories().map(e=>{
  const chapter=BOND_PLAN.byEvent[e.id];
  return {kind:'story',id:e.id,label:'✦ '+e.title+' · ⏳ 1 period',
   description:cast[e.npc].name+(chapter?' · Bond chapter '+chapter.chapter+' / 4':'')+
    ' · Available whenever your bond is ready',disabled:locked};
 });
 for(const episode of ARC.available(state,present)){
  story.push({kind:'arc',id:episode.id,label:'♜ '+episode.title+' · ⏳ 1 period',
   description:cast.reina.name+' · an optional rivalry chapter',disabled:locked});
 }
 const circuit=[
  {kind:'community',id:'board',label:'▦ Community Board · standings, rivalries & club news',disabled:locked}
 ];
 if(state.location==='arcade'){
  // Character selection belongs to the cabinet, not a duplicate minigame.
  circuit.unshift(
   {kind:'arcadeFreePlay',id:'rina',label:'♫ Dance Battle · Rina · FREE PLAY',description:'Dance with Rina. No time, credits or rewards.',disabled:locked},
   {kind:'arcadeFreePlay',id:'daisy',label:'♫ Dance Battle · Daisy · FREE PLAY',description:'Dance with Daisy. No time, credits or rewards.',disabled:locked}
  );
 }
 const consequence=CONSEQ.opportunities(state)[0];
 if(consequence)circuit.push({kind:'consequence',id:String(consequence.id),
  label:(state.location==='center'?'↗ Reflect on your match with ':'↗ Visit the Center to reflect on ')+
   (cast[consequence.npc]?.name||'a rival')+' · free',disabled:locked});
 for(const cup of TOURNAMENTS.available(state)){
  const progress=TOURNAMENTS.status(state,cup.id);
  circuit.push({kind:'cup',id:cup.id,
   label:'🏆 '+cup.title+' · Round '+(progress.round+1)+'/3 · ⏳ 1 period',
   description:'vs '+(cast[progress.opponent]?.name||'Tournament opponent'),disabled:locked});
 }
 const exhibition=scheduleEvent();
 if(exhibition&&!TOURNAMENTS.cups.some(cup=>cup.day===exhibition.day))
  circuit.push({kind:'exhibition',id:String(exhibition.day),
   label:'⚔ '+exhibition.title+' · ⏳ 1 period · +'+exhibition.reward+' pts if you win',disabled:locked});
 for(const entry of COMPETE.available(state))circuit.push({
  kind:'competitive',id:entry.id,label:'⚔ '+entry.title,
  description:(cast[entry.npc]?.name||'Circuit trainer')+' · '+entry.description,disabled:locked
 });
 const c=COMPETE.hydrate(state),local=COMPETE.localProgress(state);
 if(state.location!=='center'&&state.day>=2&&state.day<=90&&!c.daily[state.day])
  circuit.push({kind:'visitCircuit',id:'center',label:'↗ Train at the Community Center · free',disabled:locked});
 if(state.location!=='shop'&&state.day<=90&&COMPETE.localDay(state.day)&&
    local.status==='open'&&(local.round>0||state.slot<=1))
  circuit.push({kind:'visitCircuit',id:'shop',label:'↗ Visit today’s Saturday Local at The Lucky Draw · free',disabled:locked});
 const themeToday=COMPETE.themeForDay(state.day);
 if(themeToday&&state.location!=='center'&&COMPETE.themeProgress(state).status==='open'&&state.slot<=1)
  circuit.push({kind:'visitCircuit',id:'center',label:'↗ '+themeToday.title+' at the Community Center · free',
   description:themeToday.description,disabled:locked});
 const nextTheme=COMPETE.THEMES.find(theme=>theme.day>=state.day);
 if(nextTheme)circuit.push({kind:'notice',id:'theme-upcoming',label:'🏆 '+nextTheme.title+' · Day '+nextTheme.day,
  description:nextTheme.description,disabled:true});
 const nextLocal=COMPETE.upcoming(state);
 const circuitNote=(state.day<=90&&COMPETE.localDay(state.day)&&local.status==='champion'?'You won this week’s local!':
  state.day<=90&&COMPETE.localDay(state.day)&&local.status==='eliminated'?'This week’s local is over for you.':
  nextLocal?'Next Saturday Local: Day '+nextLocal+' at The Lucky Draw. Two rounds, one day.':'The competitive season has ended.')+
  ' Daily challenges run at the Community Center and refresh each new day.';
 const brackets=TOURNAMENTS.cups.map(cup=>
  window.NeoRpgTournamentPresentation?.bracketModel?.(
   cup,TOURNAMENTS.status(state,cup.id),state.day,cast
  )).filter(Boolean);
 return {
  story,circuit,circuitNote,brackets,
  situation:SITUATIONS.available(state,present).map(event=>({
   kind:'situation',id:event.id,label:'✧ '+event.title+' · ⏳ 1 period',
   description:cast[event.npc].name+' · optional surprise · '+event.focusCost+' focus',
   disabled:locked
  })),
  sidequest:SIDE.available(state,present).map(entry=>({
   kind:'sidequest',id:entry.quest.id,label:'◆ '+entry.stage.title+' · ⏳ 1 period',
   description:cast[entry.stage.npc].name+' · '+entry.quest.title,disabled:locked
  })),
  questJournal:SIDE.journal(state).map(entry=>({
   status:entry.status,title:entry.title,
   summary:entry.status==='active'?String(entry.summary||'').replace(/shop|cafe|park|center|arcade|library/g,
    place=>places[place]?.[0]||place):String(entry.summary||'')
  })),
  encounter:WORLD.availableEncounters(state,present).map(entry=>({
   kind:'encounter',id:entry.id,label:'✧ '+entry.title+' · ⏳ 1 period',
   description:(entry.npc?cast[entry.npc].name:'The neighborhood')+
    ' · limited-time opportunity',disabled:locked
  }))
 };
}
function runOverworldOpportunity(kind,id){
 if(overworldControlsLocked())return false;
 const groups=overworldOpportunities();
 const found=['story','situation','sidequest','encounter','circuit']
  .flatMap(section=>groups[section]||[]).find(item=>
   item.kind===kind&&String(item.id)===String(id)&&!item.disabled);
 if(!found)return false;
 if(kind==='arcadeFreePlay'){
  if(!window.NeoRpgArcadeGame?.open)return false;
  const dancer=found.id==='rina'?'rina':'daisy';
  return window.NeoRpgArcadeGame.open({name:dancer==='rina'?'Rina':'Daisy',characterId:dancer,freePlay:true,onCancel:()=>{},onComplete:()=>{}});
 }
 if(kind==='story')startStory(found.id);
 else if(kind==='arc')act('arc:'+found.id);
 else if(kind==='situation')act('situation:'+found.id);
 else if(kind==='sidequest')act('sideQuest:'+found.id);
 else if(kind==='encounter')act('encounter:'+found.id);
 else if(kind==='cup')act('cup:'+found.id);
 else if(kind==='competitive')act('competitive:'+found.id);
 else if(kind==='exhibition')act('event');
 else if(kind==='community')openCommunityBoard();
 else if(kind==='consequence')act('consequence');
 else if(kind==='visitCircuit')return travelTo(String(found.id),{intro:false});
 else return false;
 return true;
}
// Read-only model of the visible RPG guide. No planner or progress DOM is
// created by the campaign controller; the overworld owns the presentation.
function overworldGuide(){
 const locked=overworldControlsLocked(),ended=state.day>90;
 const suggestions=!ended&&!locked?PLANNER.recommend(state,plannerDependencies()):[];
 const plannerMessage=ended?'Your 90-day season is complete. See your report and gallery.':
  locked?'Finish your current scene or duel to explore more opportunities.':
  suggestions.length?'':'Nothing urgent right now. Explore, practice, or take a well-earned break.';
 const priority=INTENTIONS.status(state);
 const goal=ended?{message:'The season is complete. '+priority.completedCount+' daily priorities fulfilled.'}:
  !priority.chosen?{
   message:'Choose one focus for today. It is optional, and any result counts for duels.',
   options:INTENTIONS.goals.map(item=>({id:item.id,title:item.title,detail:item.detail,reward:item.rewardLabel})),
   countLabel:priority.completedCount+' priorities completed this season · resets tomorrow'
  }:{
   chosen:priority.selected?{title:priority.selected.title,detail:priority.selected.detail,
     reward:priority.selected.rewardLabel}:null,
   completed:!!priority.completed,
   countLabel:priority.completedCount+' priorities completed this season · resets tomorrow'
  };
 const appointments=APPOINTMENTS.active(state).map(plan=>{
  const ready=plan.day===state.day&&plan.slot===state.slot;
  const samePlace=plan.place===state.location;
  const activity=plan.activityId?SOCIAL.activities.find(item=>item.id===plan.activityId):null;
  const description=activity?(plan.socialTone==='romantic'?'♥ DATE':
   plan.socialTone==='rivalry'?'⚔ CHALLENGE':'● FRIENDS')+
   ' · '+activity.title+' · '+activity.focus+' focus'+
   (activity.credits?' + '+activity.credits+' credits':'')+' when we meet':'';
  let actions;
  if(ready&&samePlace){
   const reason=DATES.canAttend(state,plan,currentPeople(),{
    appointments:APPOINTMENTS,social:SOCIAL,cast
   });
   actions=[{kind:'attend',label:plan.socialTone==='romantic'?'Go on date · ⏳':
    plan.activityId?'Enjoy outing · ⏳':'Meet now · ⏳',disabled:!!reason,reason:reason||''}];
  }else if(ready){
   actions=[{kind:'travelPlan',label:'Go there · free'}];
  }else actions=[{kind:'cancelPlan',label:'Cancel · free'}];
  return {id:plan.id,name:cast[plan.npc]?.name||plan.npc,
   when:'DAY '+plan.day+' · '+periods[plan.slot]+' · '+(places[plan.place]?.[0]||plan.place),
   description,actions};
 });
 const journey=JOURNEY.currentRun(state,CG);
 return {
  locked,day:state.day,
  planner:{message:plannerMessage,items:suggestions.map(item=>({
   id:item.id,title:item.title,detail:item.detail,upcoming:item.timing==='upcoming',
   meta:item.timing==='upcoming'?'COMING UP · DAY '+item.day+' · '+periods[item.slot]:
    (item.place===state.location?'HERE NOW':'FREE TRAVEL')+' · '+(item.timeCost?'⏳ 1 PERIOD':'FREE'),
   actionLabel:item.timing==='now'&&item.action!=='none'?
    (item.action==='travel'?'Go to '+(places[item.place]?.[0]||item.place)+' · free':'Show me where · free'):''
  }))},
  priority:goal,appointments,
  townProgress:{
   points:state.points,credits:state.credits,
   lastDuel:state.lastDuelReceipt?{
    title:state.lastDuelReceipt.outcome.toUpperCase()+' · '+state.lastDuelReceipt.name,
    description:'+'+state.lastDuelReceipt.points+' circuit points · +'+
     state.lastDuelReceipt.credits+' credits · +'+state.lastDuelReceipt.trust+' trust'+
     (state.lastDuelReceipt.bonus?' (includes +'+state.lastDuelReceipt.bonus+' exhibition points)':'')+
     (state.lastDuelReceipt.trainingBonus?' · +'+state.lastDuelReceipt.trainingBonus+' training credits':'')+
     (state.lastDuelReceipt.tournamentBonus?.points?' · tournament bonus included':'')+
     (state.lastDuelReceipt.competitiveBonus?' · local circuit bonus included':'')+
     ' · Time advanced one period.'
   }:null,
   stats:[
    {name:'FOCUS',value:state.focus,max:100,detail:'Energy for town activities and outings'},
    {name:'INSIGHT',value:state.insight,max:99,detail:'Unlocks booster savings and masterclasses'},
    {name:'REPUTATION',value:state.reputation,max:100,detail:'Unlocks clinics and sponsored boosters'},
    {name:'DUEL PREP',value:state.preparation,max:3,detail:'Bonus credits after your next duel'}
   ],
   upcoming:eventCards.filter(event=>event.day>=state.day).slice(0,2).map(event=>({
    day:event.day,title:event.title,period:periods[event.slot]
   })),
   recent:state.journal.slice(0,3)
  },
  journey:{
   overview:'Season '+journey.run+' · Day '+journey.day+' / 90 · '+
    journey.gallery.unlocked+'/'+journey.gallery.total+' memories across runs',
   percent:journey.gallery.percent,
   unlocked:journey.gallery.unlocked,total:journey.gallery.total,
   milestones:JOURNEY.milestones(state,CG).map(item=>({title:item.title,detail:item.detail}))
  }
 };
}
// Every guide action is checked against fresh campaign state before dispatch,
// so old sheet buttons cannot bypass the time, location or eligibility rules.
function runOverworldGuideAction(kind,id){
 if(overworldControlsLocked())return false;
 if(kind==='gallery'){openGallery();return true;}
 if(kind==='dismissReceipt'&&state.lastDuelReceipt){
  state.lastDuelReceipt=null;persist();render();return true;
 }
 if(state.day>90)return false;
 if(kind==='planner'){
  const item=PLANNER.recommend(state,plannerDependencies()).find(item=>
   String(item.id)===String(id)&&item.timing==='now'&&item.action!=='none');
  if(!item)return false;
  openPlannerSuggestion(item.id);return true;
 }
 if(kind==='priority'){
  if(INTENTIONS.status(state).chosen||!INTENTIONS.goals.some(goal=>String(goal.id)===String(id)))return false;
  act('intention:'+id);return true;
 }
 const plan=APPOINTMENTS.active(state).find(item=>String(item.id)===String(id));
 if(!plan)return false;
 const ready=plan.day===state.day&&plan.slot===state.slot;
 if(kind==='cancelPlan'){
  if(ready)return false;
  act('cancelPlan:'+plan.id);return true;
 }
 if(kind==='travelPlan'){
  if(!ready||plan.place===state.location)return false;
  const moved=travelTo(plan.place,{intro:false});
  if(moved&&currentPeople().includes(plan.npc))selectPerson(plan.npc);
  return !!moved;
 }
 if(kind==='attend'){
  if(!ready||plan.place!==state.location||
     DATES.canAttend(state,plan,currentPeople(),{
      appointments:APPOINTMENTS,social:SOCIAL,cast
     }))return false;
  act('attend:'+plan.id);return true;
 }
 return false;
}
// Direct commands for the overworld menu; no invisible legacy button proxies.
function openStatusPanel(){
 window.NeoRpgStatus.open(state,cast,BOND_PLAN,makeAvatar,disableTutorials);
 $('statusTutorialHelp').hidden=true;
 if(!state.gameplayTutorials?.disabled)tutorialEvent('status','statusTutorialHelp');
}
async function saveCampaign(){
 persist();
 const cloud=window.NeoRpgCloudSave?.isSignedIn?.();
 let ok=false;
 try{ok=!!(await window.NeoRpgCloudSave?.syncNow?.());}
 catch(error){console.warn('Explicit RPG cloud save failed',error);}
 const message=cloud?
  (ok?'Cloud campaign synced.':'Cloud sync pending. Progress is cached on this device until it reconnects.'):
  'Campaign saved in this browser.';
 $('notice').textContent=message;
 window.dispatchEvent(new CustomEvent('neo-rpg-save-status',{detail:{message,ok:!cloud||ok}}));
 return !cloud||ok;
}
// Arrival state must exist before publishing the RPG bridge to consumers.
let pendingEntrySurprise=false;
let pendingOverworldArrival=null;
let arrivalGate=false;
// Public command/query boundary between RPG state and its overworld presenter.
window.NeoRpgOverworldBridge=Object.freeze({
 resetCampaign,
 openStatus:openStatusPanel,
 openGallery,
 openCalendar,
 saveCampaign,
 guide:overworldGuide,
 guideAction:runOverworldGuideAction,
 opportunities:overworldOpportunities,
 runOpportunity:runOverworldOpportunity,
 setVisiblePose(id,src){
  if(!cast[id]||!currentPeople().includes(id)||typeof src!=='string')return false;
  let url;try{url=new URL(src,location.href)}catch{return false}
  if(url.origin!==location.origin||!url.pathname.startsWith('/rpg-assets/characters/'+id+'/')||
     !/\.(?:png|webp|jpe?g)$/i.test(url.pathname))return false;
  overworldClickedPoses.set(id,{src:url.pathname+url.search,day:state.day,slot:state.slot,location:state.location});
  return true;
 },
 scenePortraits(){return overworldScenePortraits;},
 dialogueText(){return overworldRenderedDialogue;},
 portrait(id){
  if(!cast[id])return null;
  const src=scenePortraitSource(id,'neutral',null);
  // Supply fallbacks for every active costume, not just approved neutral art.
  const options=stagePortraitPaths(id,'neutral',null);
  return {id,name:cast[id].name,src,
   srcs:[src,...options.filter(path=>path!==src)]};
 },
 clearInteraction(){if(overworldControlsLocked())return false;state.selected=null;persist();render();return true;},
 snapshot(){
  const people=currentPeople().filter(id=>!!cast[id]);
  const booked=APPOINTMENTS.active(state);
  const indicators={};
  for(const id of people){
   // Scheduled plans win over ordinary talk opportunities, even when the
   // meeting is later today or on a future date.
   if(booked.some(plan=>plan.npc===id)){
    indicators[id]='plan';
   }else if(availableInvitation(id,people)||
     (!state['met_'+id]&&!state.overworldIntroductions?.[id]&&!(id==='reina'&&state.metReina))){
    indicators[id]='dialogue';
   }
  }
  return {location:state.location,day:state.day,slot:state.slot,
   selected:state.selected&&people.includes(state.selected)?state.selected:null,
   locked:overworldControlsLocked(),arriving:arrivalGate||!!pendingOverworldArrival||!!window.NeoRpgTimeTransitions?.active,
   storyActive:overworldStoryActive(),eventActive:!!(state.mandatoryEventState?.active||state.activeSliceOfLife||state.activeSituation||state.activeStory||state.activeSideQuest||state.activeArc||state.activeEncounter),
   people,indicators,places:Object.entries(places).map(([id,p])=>({id,name:p[0]}))};
 },
 travel(placeId){if(overworldControlsLocked())return false;return travelTo(placeId);},
 poseTriggerDialogue(id,src){
  if(overworldControlsLocked()||!cast[id]||!currentPeople().includes(id)||
     typeof src!=='string'||!src.startsWith('/rpg-assets/characters/'))return false;
  // The trigger close-up and the next Glance share the same selected image.
  if(!this.setVisiblePose(id,src))return false;
  state.selected=id;
  state.overworldPoseIntro={id,src,location:state.location,day:state.day,slot:state.slot};
  scene={speaker:cast[id].name,line:'Uh, sorry… Give me a minute…',
   choices:[['Continue ›','poseTriggerContinue:'+id]],poseTrigger:true};
  state.scene=scene;persist();render();return true;
 },
 poseIntroFallback(id){
  const intro=state.overworldPoseIntro;
  return intro?.id===id&&intro.location===state.location?intro.src:null;
 },
 interact(id){if(overworldControlsLocked()||!cast[id]||!currentPeople().includes(id))return false;selectPerson(id);return true;},
 activities(){
  const locked=overworldControlsLocked(),ended=state.day>90;
  const items=WORLD.activitiesAt(state).map(a=>({id:a.id,title:a.title,disabled:locked||ended||!!a.disabledReason}));
  if(state.location==='shop'&&state.deckJourney?.starter)
   items.unshift({id:'boosterShop',title:'Browse booster packs · The Lucky Draw',disabled:locked||ended});
  items.push({id:'rest',title:state.location==='home'?'Rest at home · ⏳ 1 period':'Wait one period · ⏳ 1 period',disabled:locked||ended});
  if(state.location==='home')
   items.push({id:'sleep',title:'Sleep until morning · ⏳ '+(3-state.slot)+' period(s)',disabled:locked||ended});
  if(state.location==='home'&&ROMANCE){
   for(const id of ROMANCE.characters){
    if(!cast[id]||!ROMANCE.ready(state,id,STORY)||
       (ROMANCE.isFirst(state,id)&&!ROMANCE.pending(state,id,STORY)))continue;
    items.push({id:'romanceVisit:'+id,
     title:(ROMANCE.isFirst(state,id)?'♥ Welcome ':'♥ Invite ')+cast[id].name+' over · ⏳ 1 period',
     disabled:locked||ended});
   }
  }
  return items;
 },
 activity(id){
  if(overworldControlsLocked()||state.day>90)return false;
  if(id.startsWith('romanceVisit:')){
   const npc=id.slice('romanceVisit:'.length);
   if(state.location!=='home'||!cast[npc]||!ROMANCE?.ready(state,npc,STORY)||
      (ROMANCE.isFirst(state,npc)&&!ROMANCE.pending(state,npc,STORY)))return false;
   return startRomanceVisit(npc);
  }
  if(id==='boosterShop'){
   if(state.location!=='shop'||!state.deckJourney?.starter)return false;
   openBoosterShop();return true;
  }
  if(id==='rest'||id==='sleep'&&state.location==='home'){
   safeAct(id);return true;
  }
  if(!WORLD.activitiesAt(state).some(a=>a.id===id&&!a.disabledReason))return false;
  performActivity(id);return true;
 },
});
function overworldStoryActive(){
 return !!(state.mandatoryEventState?.active||state.activeSliceOfLife||state.activeSituation||
  state.activeStory||state.activeSideQuest||state.activeArc||state.activeEncounter||conversationInProgress());
}
function notifyOverworldRendering(){
 window.dispatchEvent(new Event('neo-rpg-overworld-render'));
}
function overworldControlsLocked(){
 return controlsLocked()||arrivalGate||!!pendingOverworldArrival||!!window.NeoRpgTimeTransitions?.active;
}
// The bridge is not ready until all lexical campaign state and startup
// listeners have initialized. Dispatching here used to mount the overworld
// from inside this module, before arrivalGate existed (TDZ crash).
function publicAppointments(place){return [...APPOINTMENTS.overrides(state),
 // Story overrides must pin the character at the authored location TODAY,
 // regardless of the obsolete day range still present in the story metadata.
 ...STORY.available(state,place).map(e=>({...e,start:state.day,end:state.day})),
 ...SIDE.appointments(state),...(SLICE?.scheduleOverrides?.(state)||[])];}
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
 if(id==='hana'&&!(hanaEncounterKey||'').startsWith('entry:'))hanaEncounterKey='talk:'+ ++hanaEncounterSerial;
 const today=state.day+':'+id,fresh=!state.talked[today];
 state['met_'+id]=true;
 if(id==='reina')state.metReina=true;
 state.talked[today]=true;
 state.selected=id;
 const memories=recordCG('meet',id);
 persist();
 const invite=skipInvitation||(first&&Array.isArray(c.firstMeeting))?null:availableInvitation(id);
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
  // A spontaneous photo request can follow normal dialogue, but never
  // overrides a first meeting, story, memory or authored invitation.
  const photo=SOCIAL.options(state,id,currentPeople(),cast)
   .find(activity=>activity.photoSession&&!activity.disabledReason);
  const photoProfile=window.NeoRpgPhotoProfiles?.byId(id);
  const trust=Math.max(0,Number(state.relationships?.[id]?.trust)||0,Number(state.bonds?.[id]?.trust)||0);
  // Four individually authored, trust-locked microstories per female cast member.
  // Prefer stories not previously completed, with a stable daily selection.
  // Male cast members continue using the original lightweight photo sequences.
  const authored=window.NeoRpgPhotoStories?.ids.includes(id);
  const photoStory=authored?window.NeoRpgPhotoStories.select(id,photoProfile,trust,state):null;
  const photoChance=(state.day*23+[...id].reduce((sum,ch)=>sum+ch.charCodeAt(0)*7,0))%5<2;
  const photoOffer=!!(!first&&fresh&&!invite&&!context&&!memory&&!invitations.length&&
   casual?.lines?.length&&photo&&photoProfile&&photoChance&&(!authored||photoStory));
  const prompt=photoStory?.hook||
   photoProfile?.invitation?.replace(/^[^:]+:\s*"/,'').replace(/"$/,'');
  const talkLines=photoOffer?[...casual.lines,{
   speaker:id,text:prompt
  }]:context?.lines||memory?.lines||casual?.lines;
  const talkChoices=photoOffer?[
   ["Sure, I'll take the pictures",'photoAccept:'+id],
   ['Maybe another time','photoLater:'+id]
  ]:memory?.choices||invitations;
  sayConversation(talkLines,talkChoices,context?.id||null,null,memory,
   casual?.record,true,photoOffer?id:null,photoOffer?photoStory?.id||null:null);
 }
 tutorialEvent('conversation');showCGMoment(memories[0]);
}
// Infrequent contextual invitations replace the permanent dialogue command list.
function options(id){return VN.choices(state,id);}

function plannedDateSlots(id){
 const times=APPOINTMENTS.proposed(state,id,SCHEDULES);
 const choices=times.map((time,i)=>['Day '+time.day+' · '+periods[time.slot]+' · '+places[time.place][0]+' · choose activity','dateSlot:'+id+':'+i]);
 choices.push(['← Back to character actions','back:'+id]);
 return choices;
}
function sharedActivityChoices(id){
 const available=SOCIAL.options(state,id,currentPeople(),cast);
 return [...available.filter(a=>!a.photoSession).map(a=>[
   a.title+' · ⏳ 1 period · '+a.focus+' focus'+(a.credits?' + '+a.credits+' credits':'')
   +(a.disabledReason?' · '+a.disabledReason:''),
   'socialDo:'+id+':'+a.id
 ]),['Back to conversation · free','back:'+id]];
}
function sayCharacterChoiceMenu(id,heading,description,choices){
 if(!cast[id]||!currentPeople().includes(id))return;
 state.selected=id;
 scene={speaker:cast[id].name,line:'',choices,presentation:'character-menu',menuCharacter:id,menuHeading:heading,menuDescription:description};
 state.scene=scene;persist();render();
}
function planSharedActivity(id){
 if(!cast[id]||!currentPeople().includes(id))return;
 const choices=sharedActivityChoices(id);
 if(!choices.length)return say(cast[id].name,'We could plan something another time.',options(id));
 tutorialEvent('social');
 return sayCharacterChoiceMenu(id,'SPEND TIME','Choose a shared activity with '+cast[id].name+'.',choices);
}

async function glanceAt(id){
 if(!cast[id]||!currentPeople().includes(id)||typeof window==='undefined')return;
 // Glance must show the same sprite the player clicked, not a random
 // alternate from the crop catalog or a dialogue-expression portrait.
 const clickedPose=liveOverworldPose(id)||visibleOverworldPose(id);
 let portrait=clickedPose||scenePortraitSource(id,'neutral',activeOutfitSceneId);
 const currentName=portrait.split('/').pop().split('?')[0];
 let focus=null;
 try{
  const [activeResponse,overworldResponse]=await Promise.all([
   fetch('/rpg-assets/outfit-chime-focus.json?v=20261030-glance-overworld-1'),
   fetch('/rpg-assets/outfit-chime-overworld-candidates.json?v=20261030-glance-overworld-1')
  ]);
  const active=activeResponse.ok?await activeResponse.json():null;
  const overworld=overworldResponse.ok?await overworldResponse.json():null;
  const activeEntry=active?.characters?.[id]?.variants?.[currentName]||null;
  const overworldVariants=Object.values(overworld?.characters?.[id]?.variants||{});
  const exact=overworldVariants.find(entry=>String(entry?.image||'').replace(/[?].*$/,'')===String(portrait).replace(/[?].*$/,''));
  if(clickedPose){
   // Crop metadata may shape the initial view but cannot replace this image.
   focus=exact||activeEntry||{top:0,bottom:1,left:0,right:1};
  }else if(activeEntry){focus=activeEntry;}
 }catch(_error){}
 const fallback={top:.06,bottom:.53,left:0,right:1};
 if(window.NeoOutfitChime?.glance)await window.NeoOutfitChime.glance(portrait,focus||fallback);
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
 const entry=WORLD.activitiesAt(state).find(a=>a.id===id);
 const before=activityBalance(entry?.npc);
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
 activityOutcome('Narrator',result.summary,before,entry?.npc,
  result.voucherSet==='latest'?['1 booster voucher']:[],1,place==='home'?'home_activity':'activity');
 tutorialEvent('activities');
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
  return {speaker:current.speaker==='Protagonist'?'You':(cast[current.speaker]?.name||current.speaker),line:current.text,choices};
 }
 const lines=e.lines?.length?e.lines.map(part=>({speaker:cast[part.speaker]?.name||(part.speaker==='Protagonist'?'You':part.speaker),line:part.text})):
  [{speaker:'Narrator',line:e.intro},{speaker:cast[e.npc]?.name||e.npc,line:e.line},{speaker:'Narrator',line:e.close}];
 return {...lines[active.step],choices:[['Continue ›','sliceNext']]};
}
function beginSliceOfLife(trigger,npc=null,onlyRandomForced=false){
 if(!SLICE||state.activeSliceOfLife)return false;
 const moment=SLICE.start(state,currentPeople(),trigger,npc,{onlyRandomForced});
 if(!moment)return false;
 state.selected=moment.npc;
 if(!moment.choices)recordCG('slice',moment.npc,{eventId:moment.id});
 persist();render();
 return true;
}
function nextSliceOfLife(){
 const before=state.activeSliceOfLife&&SLICE.byId(state.activeSliceOfLife.id);
 const priorCG=before?.cgSequence?.length&&before.cgSwitchSteps?.findIndex((step,index)=>index>0&&state.activeSliceOfLife.step<step&&state.activeSliceOfLife.step+1>=step);
 const result=SLICE.next(state);
 if(!result)return;
 // The CG selector uses the current step, switching the fitting artwork at step 4.
 if(result.done){const moment=SLICE.byId(result.id);
  if(moment.choices){const owners=[moment.npc,...(moment.participants||[])];for(const owner of new Set(owners))recordCG('slice',owner,{eventId:moment.id});}
  for(const entry of CG.catalog.filter(x=>x.sliceId===moment.id&&x.id!==moment.cgSequence?.[0])){const unlocked=CG.record(state,'slice',entry.character,{eventId:moment.id});if(unlocked.some(x=>x.id===entry.id))log('New CG memory unlocked: '+entry.title+'.');}
  log('A small moment with '+(cast[moment?.npc]?.name||'a friend')+'.');
  persist();
  return closeSceneDialogue();}
 if(priorCG!==false&&priorCG!==undefined){const nextCG=before.cgSequence[priorCG];if(nextCG)CG.markViewed(state,nextCG);}
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
  recordCG('situation',event.npc,{eventId:event.id});
  advance();
  closeSceneDialogue();
 }catch(err){$('notice').textContent=err.message;}
}

function scheduleEvent(){return eventCards.find(e=>e.day===state.day&&e.slot===state.slot&&e.place===state.location&&!state.eventsDone[e.day+':'+e.title]);}
function safeAct(action){
 try{return act(action);}
 catch(err){
  window.NeoRpgErrorReport?.capture(err,{source:'handled-action',action});
  console.error('RPG action failed',action,err);
  $('notice').textContent='Action failed: '+(err?.message||'Unknown error')+'. Your save is intact.';
 }
}
function act(action,confirmedInvitationHandoff=false){
 const [type,id,part]=action.split(':');
 // Activity receipts must remain dismissible even when a mandatory gate or
 // restored cloud scene is temporarily active; no reward is granted twice.
 if(type==='activityContinue'&&(scene?.activityAdvance||state.scene?.activityAdvance))return finishActivityOutcome();
 const cupToday=tournamentDayCup();
 const activeScene=!!(state.activeSliceOfLife||state.activeStory||state.activeSideQuest||
  state.activeSituation||state.activeEncounter||state.activeArc);
 if(cupToday&&!activeScene&&!['cup','tournamentDeck','tournamentEnd','close','dismissDialogue','activityContinue'].includes(type)&&!type.startsWith('mandatory'))return;
 if(type==='tournamentDeck'){if(cupToday&&!state.pendingDuel)openDeckWorkshop();return;}
 if(type==='tournamentEnd'){
  if(!cupToday||state.pendingDuel||conversationInProgress()||TOURNAMENTS.status(state,cupToday.id).state==='open'||
   !state.tournamentNarrative?.[cupToday.id]?.seen?.includes('closing'))return;
  TOURNAMENT_STORY?.hide();
  scene={speaker:'Narrator',line:'',choices:[]};state.scene=scene;
  advance(3-state.slot,'tournament');render();return;
 }
 if(mandatoryAction(type,id))return;
 if(conversationInProgress()&&!confirmedInvitationHandoff){
  const currentChoice=(scene.choices||[]).some(([,candidate])=>candidate===action);
  // A confirmed event invitation delegates to its existing action handler.
  // Permit only the matching validated handoff, not arbitrary actions during dialogue.
  const invitation=scene.invitation;
  const confirmedAppointment=type==='attend'&&invitation?.kind==='appointment'&&String(invitation.id)===String(id)
    &&(scene.choices||[]).some(([,candidate])=>candidate==='eventInvite:appointment:'+id);
  if(!currentChoice&&!confirmedAppointment&&!['chatNext','memoryChoice','close','dismissDialogue'].includes(type))return;
 }
 // Suppress unrelated actions while a surprise is underway.
 if(state.activeSliceOfLife){
  if(type==='sliceChoice'&&SLICE.choose(state,Number(id))){persist();render();return;}
  if(type==='sliceNext')return nextSliceOfLife();return;
 }
 if(type==='romanceOffer'){
  if(!cast[id]||!currentPeople().includes(id)||controlsLocked())return;
  return showRomanceOffer(id);
 }
 if(type==='romanceAccept'){
  if(scene.romanceOffer!==id||!ROMANCE?.accept(state,id,STORY))return;
  state.romanceVisitDeferred=false;
  scene={speaker:'Narrator',line:'',choices:[]};state.scene=scene;
  state.selected=null;persist();
  if(state.location==='home')return startRomanceVisit(id);
  return travelTo('home',{intro:false});
 }
 if(type==='romanceLater'){
  if(scene.romanceOffer!==id)return;
  return closeSceneDialogue();
 }
 if(type==='romanceView'){
  if(scene.romanceNpc!==id||state.location!=='home'||!ROMANCE?.ready(state,id,STORY)||!confirmTimeAdvance())return;
  state.romanceVisitShowing=id;
  scene={speaker:cast[id].name,line:'',choices:[],romanceNpc:id};
  state.scene=scene;persist();render();
  queueMicrotask(()=>openRomanceVisit(id));
  return;
 }
 if(type==='activityContinue')return finishActivityOutcome();
 if(type==='chatNext')return advanceConversation();
 if(type==='poseTriggerContinue'){
  const intro=state.overworldPoseIntro;
  if(!intro||intro.id!==id||!currentPeople().includes(id))return;
  state.overworldPoseIntro=null;
  selectPerson(id);
  return;
 }
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
  if(!invited||invited.kind!==id||invited.id!==part)
   return say('Narrator','This invitation has changed. Talk to the character again to refresh it.');
  if(!currentPeople().includes(invited.npc))
   return say('Narrator','They have moved on. You can try again later.');
  // Recheck the invited event itself, not whether it is still the top-ranked
  // invitation. Rankings can change after a saved scene is restored.
  const people=currentPeople();
  const available=
   id==='story'?eligibleStories().some(e=>e.id===part&&e.npc===invited.npc):
   id==='sidequest'?SIDE.available(state,people).some(e=>e.quest.id===part&&e.stage.npc===invited.npc):
   id==='arc'?ARC.available(state,people).some(e=>e.id===part&&invited.npc==='reina'):
   id==='situation'?SITUATIONS.available(state,people).some(e=>e.id===part&&e.npc===invited.npc):
   id==='encounter'?WORLD.availableEncounters(state,people).some(e=>e.id===part&&e.npc===invited.npc):
   id==='appointment'?APPOINTMENTS.active(state).some(e=>String(e.id)===part&&e.npc===invited.npc):
   id==='cup'?TOURNAMENTS.available(state).some(e=>e.id===part):
   id==='competitive'?COMPETE.available(state).some(e=>e.id===part):
   id==='exhibition'?!!scheduleEvent()&&String(scheduleEvent().day)===part:false;
  if(!available)return say(cast[invited.npc]?.name||'Narrator',
    'That event is not available right now. We can still talk.',
    [['Talk','eventChat:'+invited.npc],['Close','close']]);
  // The original event handlers still own legality, time, rewards, CGs and saves.
  if(id==='appointment')return act('attend:'+part);
  if(id==='story')return startStory(part);
  if(id==='sidequest')return beginSideQuest(part);
  if(id==='arc')return startArc(part);
  if(id==='situation')return beginSituation(part);
  if(id==='encounter')return startEncounter(part);
  // The invitation itself was validated above. Let its duel handler run
  // through the dialogue lock; ordinary, unconfirmed actions stay locked.
  if(id==='cup')return act('cup:'+part,true);
  if(id==='competitive')return act('competitive:'+part,true);
  if(id==='exhibition')return act('event',true);
  return;
 }
 if(type==='photoAccept'||type==='photoLater'){
  if(scene?.photoOffer!==id||state.selected!==id||!cast[id]||!currentPeople().includes(id))return;
  if(type==='photoLater')return say(cast[id].name,
   'Of course. We can do it another time.',[['Continue ›','close']]);
  const activity=SOCIAL.options(state,id,currentPeople(),cast)
   .find(option=>option.photoSession&&!option.disabledReason);
  if(!activity)return say(cast[id].name,
   'Maybe later. The light is not quite right now.',[['Continue ›','close']]);
  return act('socialDo:'+id+':'+activity.id,true);
 }
 if(type==='eventChat'){
  if(cast[id]&&currentPeople().includes(id))return selectPerson(id,{skipInvitation:true});
   return say('Narrator','They have moved on. You can try again later.');
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
  if(choices.length===1)return say(cast[id].name,'I cannot commit to another meeting yet.',options(id));
  return sayCharacterChoiceMenu(id,'MAKE PLANS','Choose a day and plan an activity with '+cast[id].name+'.',choices);
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
  return sayCharacterChoiceMenu(id,'MAKE PLANS','Choose an activity for '+periods[target.slot].toLowerCase()+' at '+places[target.place][0]+'.',choices);
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
  return sayCharacterChoiceMenu(id,'MAKE PLANS','Choose how to spend your time at '+places[target.place][0]+'.',choices);
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
  // Character-neutral photography. The current location selects the proper
  // eye-level background. Only completed sessions change social state.
  if(SOCIAL.activities.some(activity=>activity.id===part&&activity.photoSession)){
   const available=SOCIAL.options(state,id,currentPeople(),cast).find(x=>x.id===part&&!x.disabledReason);
   if(!available)return sayCharacterChoiceMenu(id,'SPEND TIME','This photoshoot is not available right now.',sharedActivityChoices(id));
   if(!window.NeoRpgPhotoSession?.open)return sayCharacterChoiceMenu(id,'SPEND TIME','The camera is temporarily unavailable.',sharedActivityChoices(id));
   if(!confirmTimeAdvance())return;
   const fromConversation=scene?.photoOffer===id;
   const storyId=fromConversation?scene.photoStoryId||null:null;
   const photoProfile=window.NeoRpgPhotoProfiles?.byId(id);
   const story=storyId?window.NeoRpgPhotoStories?.byId(id,storyId,photoProfile):null;
   const currentTrust=Math.max(0,Number(state.relationships?.[id]?.trust)||0,
    Number(state.bonds?.[id]?.trust)||0);
   if(storyId&&(!story||currentTrust<story.trustMin))
    return say(cast[id].name,'I think we should get to know each other a little better first.',
     [['Continue ›','close']]);
   if(fromConversation){
    // Clear the invitation only after accepting and passing the clock check.
    scene={speaker:'Narrator',line:'',choices:[]};state.scene=scene;
    persist();render();
   }
   const opened=window.NeoRpgPhotoSession.open({
    name:cast[id].name,characterId:id,location:state.location,savedAlbum:state.photoAlbum,
    story:fromConversation,storyId,trust:currentTrust,day:state.day,slot:state.slot,
    onCancel:()=>{},
    onComplete:result=>{
     try{
      if(!SOCIAL.options(state,id,currentPeople(),cast).some(x=>x.id===part&&!x.disabledReason))
       throw Error('The photoshoot is no longer available.');
      if(result.characterId!==id||!Array.isArray(result.photos)||result.photos.length!==3||
         (storyId&&result.storyId!==storyId))
       throw Error('The photo session result is incomplete.');
      const before=activityBalance(id);
      const outcome=SOCIAL.complete(state,id,part,currentPeople(),cast);
      const award=Math.max(0,Math.min(14,Number(result.credits)||0));
      state.credits=Math.min(999999,(Number(state.credits)||0)+award);
      const photos=result.photos.filter(p=>p.character===id).slice(0,3);
      // Every character has a separate album view. Keep up to six recent
      // photos per character, and a global cap to bound cloud-save size.
      const all=(Array.isArray(state.photoAlbum)?state.photoAlbum:[])
       .concat(photos.map(p=>({...p,day:state.day})));
      const perCharacter={};
      state.photoAlbum=all.slice().reverse().filter(p=>{
       if(typeof p?.character!=='string')return false;
       const count=perCharacter[p.character]||0;
       if(count>=6)return false;
       perCharacter[p.character]=count+1;
       return true;
      }).slice(0,72).reverse();
      state.photoRecords=state.photoRecords||{};
      const previous=state.photoRecords[id]||{};
      state.photoRecords[id]={lastDay:state.day,sessions:(previous.sessions||0)+1,
       bestAverage:Math.max(previous.bestAverage||0,result.average||0),
       lastAverage:result.average||0};
      if(storyId){
       state.photoStoryDone=state.photoStoryDone||{};
       const completed=Array.isArray(state.photoStoryDone[id])?state.photoStoryDone[id]:[];
       if(!completed.includes(storyId))state.photoStoryDone[id]=[...completed,storyId];
      }
      log('Photographed '+cast[id].name+' at '+places[state.location][0]+': '+(result.average||0)+'/100 average.');
      recordIntention('hangout');
      const memories=recordCG('hangout',id);
      activityOutcome(cast[id].name,
       (story?.title?story.title+'. ':'')+'Your three photos averaged '+result.average+
       '/100. '+(award?'Your photography earned '+award+' credits. ':'')+
       outcome.line,before,id);
      showCGMoment(memories[0]);
     }catch(err){
      window.NeoRpgErrorReport?.capture?.(err,{source:'photo-minigame',action:'complete'});
      sayCharacterChoiceMenu(id,'SPEND TIME',err.message,sharedActivityChoices(id));
     }
    }
   });
   if(!opened)return say(cast[id].name,'The camera could not open. We can try again later.',
    [['Continue ›','close']]);
   return;
  }
  // Interactive arcade challenge: finish first; never charge time or currency on cancel.
  if(part==='arcade_highscore'){
   const available=SOCIAL.options(state,id,currentPeople(),cast).find(x=>x.id===part&&!x.disabledReason);
   if(!available)return sayCharacterChoiceMenu(id,'SPEND TIME','This game is not available right now.',sharedActivityChoices(id));
   if(!window.NeoRpgArcadeGame?.open)return sayCharacterChoiceMenu(id,'SPEND TIME','The arcade cabinet is temporarily unavailable.',sharedActivityChoices(id));
   if(!confirmTimeAdvance())return;
   window.NeoRpgArcadeGame.open({
    name:cast[id].name,
    onCancel:()=>{},
    onComplete:result=>{
     try{
      // Check eligibility again after the minigame, before any campaign mutation.
      if(!SOCIAL.options(state,id,currentPeople(),cast).some(x=>x.id===part&&!x.disabledReason))
       throw Error('The shared activity is no longer available.');
      const before=activityBalance(id);
      const outcome=SOCIAL.complete(state,id,part,currentPeople(),cast);
      state.arcadeRecords=state.arcadeRecords||{};
      const previous=state.arcadeRecords[id];
      state.arcadeRecords[id]={score:Math.max(previous?.score||0,result.score),lastScore:result.score,
       grade:result.grade,accuracy:result.accuracy,lastDay:state.day,win:result.win};
      log('Played '+(id==='daisy'?'Dance Battle':'Neon Circuit')+' with '+cast[id].name+': '+result.score+' points ('+result.grade+').');
      recordIntention('hangout');
      const memories=recordCG('hangout',id);
      const reaction=result.win?
       'You beat the house target with '+result.score+' points! '+cast[id].name+' congratulates you.':
       'You scored '+result.score+' points. '+cast[id].name+' smiles and suggests another try next time.';
      activityOutcome(cast[id].name,reaction+' '+outcome.line,before,id);
      showCGMoment(memories[0]);
     }catch(err){
      window.NeoRpgErrorReport?.capture?.(err,{source:'arcade-minigame',action:'complete'});
      sayCharacterChoiceMenu(id,'SPEND TIME',err.message,sharedActivityChoices(id));
     }
    }
   });
   return;
  }
  try{
   const available=SOCIAL.options(state,id,currentPeople(),cast).find(x=>x.id===part&&!x.disabledReason);
   if(available&&!confirmTimeAdvance())return;
   const before=activityBalance(id);
   const outcome=SOCIAL.complete(state,id,part,currentPeople(),cast);
   log('Spent time with '+cast[id].name+': '+outcome.title+'.');
   recordIntention('hangout');
   const memories=recordCG('hangout',id);
   activityOutcome(cast[id].name,outcome.line,before,id);
   showCGMoment(memories[0]);return;
  }catch(err){
   return sayCharacterChoiceMenu(id,'SPEND TIME',err.message,sharedActivityChoices(id));
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
 if(type==='back'&&cast[id]){scene={speaker:'Narrator',line:'',choices:[]};state.scene=scene;state.selected=id;persist();render();return;}
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
   const before=activityBalance(plan.npc);
   const outcome=DATES.attend(state,number,currentPeople(),{appointments:APPOINTMENTS,social:SOCIAL,cast});
   recordIntention('appointment');
   log('Kept '+(outcome.tone==='romantic'?'a date':outcome.tone==='rivalry'?'a friendly challenge':'a friendship outing')+' with '+(person?.name||'a trainer')+'.');
   const memories=recordCG('appointment',plan.npc);
   if(!outcome.legacy)for(const cg of recordCG('hangout',plan.npc))if(!memories.some(x=>x.id===cg.id))memories.push(cg);
   activityOutcome(person?.name||'Trainer',outcome.line,before,plan.npc);
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
 if(type==='sleep'){if(state.location!=='home')return;const n=3-state.slot;if(!confirmTimeAdvance(n))return activityOutcome('Narrator','You settle in for the night. A new morning awaits.',null,null,[],n,'sleep');}
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
 if(type==='cup'){
  if(cupToday?.id!==id)return;
  try{return selectTournamentDeck({tournamentId:id});}
  catch(err){return say('Tournament Desk',err.message);}
 }
 if(type==='competitive'){
  if(!confirmTimeAdvance())return;
  try{const match=COMPETE.begin(state,id);
   return match.kind==='theme'?selectTournamentDeck({competition:match}):
    startDuel(match.npc,null,null,null,null,false,match);
  }catch(err){return say('Circuit Desk',err.message);}
 }
 if(type==='event'){const e=scheduleEvent();if(!e)return;return startDuel(exhibitionOpponents[e.day]||'reina',e);}
 if(type==='work')return performActivity('shop_shift');
 if(type==='practice')return state.location==='library'?performActivity('library_research'):state.location==='center'?performActivity('center_scrimmage'):performActivity('home_reflect');
 if(type==='rest'){if(state.day>90||!confirmTimeAdvance())return activityOutcome('Narrator','You take a break. Other lives in the town carry on.');}
 if(type==='replay'){
  if(!EPILOGUE.completed(state)||mandatoryClosureDue())return;
  if(confirm('Start New Game+? Your completed season report will be archived. Relationships, standings and credits will reset.')){
   state=EPILOGUE.replay(state,defaults);CG.hydrate(state);persist();location.reload();
  }
  return;
 }
 if(type==='new')return resetCampaign();
 if(!cast[id]||!currentPeople().includes(id))return say('Narrator','They have already moved on. Try another time.');
 const c=cast[id],bond=state.bonds[id],key=atKey(id);
 if(type==='talk'){
  state.talked[state.day+':'+id]=true;
  if(beginSliceOfLife('talk',id))return;
  persist();
  const context=REACT.reaction(state,id,c,cast,COMMUNITY,CONSEQ);
  const memory=!context?MEM?.offer(state,id):null;
  // Shared-activity follow-ups sit below authored memories and reactivity.
  // Show each outing callback at most once; never pay relationship rewards again.
  const social=!context&&!memory?SOCIAL.memoryConversation?.(state,id,cast):null;
  const socialSeen=!!(social&&state.socialTalkSeen?.[social.id]);
  const callback=social&&!socialSeen?social:null;
  if(callback){
   state.socialTalkSeen=state.socialTalkSeen||{};
   state.socialTalkSeen[callback.id]=true;
   persist();
  }
  const casual=!context&&!memory&&!callback?ordinaryTalk(id,c,{present:currentPeople()}):null;
  return sayConversation(context?.lines||memory?.lines||callback?.lines||casual?.lines,memory?.choices||[],context?.id||null,null,memory,casual?.record,true);
 }
 if(type==='flirt'){
  state.talked['flirt:'+key]=true;
  const lines=RPGD?.flirtLines(id,c.flirt)||[{speaker:'Protagonist',text:'I had something playful to say, but now I am reconsidering.'},{speaker:id,text:c.flirt}];
  persist();
  return sayConversation(lines,[]);
 }
 if(type==='hang'){if(state.hungOut[state.day+':'+id])return say(c.name,'I enjoyed our time today. Let us make plans another day.',options(id));if(!confirmTimeAdvance())return;state.hungOut[state.day+':'+id]=true;REL.apply(state,id,{affection:2,trust:1});state.relationshipQualityTime=state.relationshipQualityTime||{};state.relationshipQualityTime[id]=(Number(state.relationshipQualityTime[id])||0)+1;log('Spent time with '+c.name+'.');recordIntention('hangout');const memories=recordCG('hangout',id);advance();state.selected=null;say(c.name,Array.isArray(c.hangouts)&&c.hangouts.length?c.hangouts[(state.day+bond.duels)%c.hangouts.length]:'That was a lovely way to spend part of the day. See you around.');showCGMoment(memories[0]);return;}
}

const cardNames=new Map(),cardImages=new Map();
let packArtSerial=0;
let preDuelArtSerial=0;
let pendingDuelTimeShift=null;
function finishDuelRewardPresentation(){
 const transition=pendingDuelTimeShift;pendingDuelTimeShift=null;
 // The world clock and all rewards were already persisted before results appeared.
 if(transition){timeSequence.queue(transition);timeSequence.flush();}
}

function showPackReveal(){
 const pack=state.deckJourney?.lastPack,modal=$('packDialog');
 if(!pack||pack.opened||modal.open)return;
 const isVictory=pack.source==='win';
 const giver=pack.giver&&cast[pack.giver]?pack.giver:null;
 const setName=COLLECT.THEMED_PACKS?.find(offer=>offer.id===pack.theme)?.name||
  COLLECT.SETS[pack.set]?.name||'Base Set';
 const request=++packArtSerial;
 const outfit=giver?OUTFITS?.select?.(cast[giver]?.art?.outfits,{
  location:state.location,slot:state.slot,day:state.day
 })?.key:null;
 const artworks=giver?[
  ...(outfit?PRE.boosterArtCandidates(giver,outfit).slice(0,1):[]),
  ...PRE.boosterArtCandidates(giver)
 ]:[];
 const cards=pack.cards.map(id=>({
  id,label:labelCard(id),name:cardNames.get(id)||id,image:cardImages.get(id)||null
 }));
 const view=window.NeoRpgOverworldPack;
 if(!view?.render?.(document,{
  eyebrow:isVictory?'✦ DUEL REWARD · YOUR CARDS':'✦ NEO HARBOR · CARD REWARDS',
  title:isVictory?(pack.cards.length===10?
   (pack.kind==='championship'?'CHAMPION BOOSTER':'VICTORY BOOSTER'):
   'VICTORY MINI BOOSTER'):'NEW BOOSTER',
  description:setName+' · '+pack.cards.length+
   ' cards. Tap to flip individual cards, or reveal them all.',
  continueLabel:$('boosterShopDialog').open?'Back to booster shop →':'Continue adventure →',
  giver,giverName:giver?cast[giver].name:null,
  fromShop:!isVictory&&!giver&&state.location==='shop',
  artworks,cards
 },{
  isCurrent:()=>request===packArtSerial&&
   state.deckJourney?.lastPack===pack&&!pack.opened,
  avatar:id=>makeAvatar(id),
  discreet:(target,id)=>window.NeoRpgDiscreetAvatars?.set?.(
   target,id,'happy',cast[id]?.name||id
  ),
  renderCards:(target,list,onFlip)=>
   window.NeoRpgOverworldCollection?.renderPackCards?.(target,list,onFlip),
  onFlip:()=>window.NeoRpgAudio?.play?.('flip'),
  onContinue:()=>{
   if(pack.opened)return;
   pack.opened=true;++packArtSerial;
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
  }
 }))throw Error('The overworld booster reward presenter did not load.');
 window.NeoRpgAudio?.play?.('booster');
}

const labelCard=id=>cardNames.get(id)||id.replace('base1-','Base #');
function conversationInProgress(){
 if(state.activeSliceOfLife||state.mandatoryEventState?.active||state.pendingDuel||state.activeSituation||state.activeStory||state.activeSideQuest||state.activeArc||state.activeEncounter)return false;
 return !!(scene?.dialogue?.length||scene?.line||scene?.choices?.length);
}
function controlsLocked({allowStarterIntro=false}={}){
 // The day-one narrator introduction must not hide the required deck choice.
 // All other dialogue, duel, event and time-transition locks still apply.
 const initialStarterIntro=allowStarterIntro&&state.scene===null&&
  state.day===1&&state.slot===0&&state.location==='home'&&
  !!state.deckJourney&&!state.deckJourney.starter;
 return timeSequence.blocked||state.day>90||
  (conversationInProgress()&&!initialStarterIntro)||
  !!state.activeSliceOfLife||!!state.mandatoryEventState?.active||
  !!state.pendingDuel||!!state.romanceVisitShowing||!!state.activeSituation||!!state.activeStory||
  !!state.activeSideQuest||!!state.activeArc||!!state.activeEncounter||!!tournamentDayCup();
}
function showStarterChoice(){
 if(controlsLocked({allowStarterIntro:true}))return;
 const starters=COLLECT.starters.map(starter=>({
  id:starter.id,
  label:starter.name+' · '+starter.types.join(' / '),
  description:starter.description+' · 60 cards · 20 Pokémon / 16 Trainers / 24 Energy'
 }));
 if(!window.NeoRpgOverworldCollection?.renderStarters?.($('starterChoices'),starters,id=>{
  if(controlsLocked({allowStarterIntro:true}))return;
  const starter=COLLECT.starters.find(item=>item.id===id);
  if(!starter)return;
  try{
   COLLECT.choose(state,starter.id);
   log('Chose '+starter.name+' as your first deck.');persist();
   if($('starterDialog').open)$('starterDialog').close();
   say('Narrator','Your '+starter.name+' deck is ready. The Lucky Draw has two free welcome mini packs waiting for you—choose from three different types. Later packs unlock as you explore; old ones are still worth opening.');
  }catch(error){$('notice').textContent=error.message;}
 }))throw Error('The overworld starter deck presenter did not load.');
 if(!$('starterDialog').open)$('starterDialog').showModal();
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
  log('Opened '+name+' booster: '+cards.map(labelCard).join(', ')+'.');
  persist();
  // The reveal is the confirmation. No blocking conversation behind the shop.
  showPackReveal();
 }catch(e){
  $('boosterShopStatus').textContent=e.message;
  renderBoosterShop(e.message);
 }
}
function renderBoosterShop(message=''){
 const remaining=state.deckJourney?.welcomePacks||0;
 const locked=controlsLocked();
 const wishes=(state.deckStrategy?.wishlist||[]).filter(id=>!(state.deckJourney?.owned?.[id]>0));
 const offers=COLLECT.themedPacks(state).map(offer=>{
  const free=offer.welcome>0&&offer.unlocked;
  const affordable=(state.credits||0)>=offer.price;
  let reason=!offer.unlocked?offer.unlockHint:
   free?'Welcome choice · five cards · one Rare and one Basic Energy':
   'Ten cards · one Rare and one Basic Energy · original card rarities';
  if(offer.discount&&offer.unlocked&&!free)
   reason='Insight savings: -'+offer.discount+' credits · '+reason;
  if(offer.unlocked&&!free&&!affordable)
   reason='Need '+(offer.price-(state.credits||0))+' more credits · '+reason;
  return {
   id:offer.id,unlocked:offer.unlocked,name:offer.name,description:offer.description,
   sourcesLabel:'PRINTINGS · '+(offer.sources.length?
    offer.sources.slice(0,3).map(set=>COLLECT.SETS[set]?.name||set).join(' · ')+
    (offer.sources.length>3?' · +'+(offer.sources.length-3)+' more':''):
    'Not yet discovered'),
   completion:offer.completion,owned:offer.owned,total:offer.total,
   targetCount:wishes.filter(id=>COLLECT.themeContains(state,offer.id,id)).length,
   reason,disabled:!offer.unlocked||(!free&&!affordable)||locked,
   buyLabel:free?'Choose free mini pack · '+offer.welcome+' left':
    offer.unlocked?'Buy · '+offer.price+' credits':'Unlocks later'
  };
 });
 const vouchers=COLLECT.shopPacks(state).filter(offer=>offer.vouchers>0).map(offer=>({
  name:offer.name,set:offer.set,vouchers:offer.vouchers,disabled:locked
 }));
 const model={
  balance:'◈ '+(state.credits||0)+' credits · Day '+state.day+
   (remaining?' · '+remaining+' welcome mini pack'+(remaining===1?'':'s')+' to choose':''),
  status:message||(remaining?
   'Choose any two opening mini packs for free. All three starter varieties stay in the shop afterward.':
   'Each pack has its own card pool. Earlier packs stay useful even as later eras unlock.'),
  offers,vouchers
 };
 if(!window.NeoRpgOverworldCollection?.renderShop?.(document,model,(id,voucher)=>{
  if(controlsLocked())return;
  purchaseBoosterPack(id,voucher);
 }))throw Error('The overworld booster shop presenter did not load.');
}
function renderDeckWorkshop(){
 const journey=state.deckJourney;if(!journey?.starter)return;
 const draft=COLLECT.draft(state),owned=journey.owned,counts=COLLECT.rank(draft);
 const label=(id,count)=>labelCard(id)+' · '+count+' copy'+(count===1?'':'ies');
 const valid=COLLECT.check(draft,owned);
 const model={
  remove:Object.entries(counts).map(([id,count])=>({id,label:label(id,count)})),
  add:Object.entries(owned).filter(([,count])=>count>0).map(([id,count])=>({
   id,label:label(id,count)+' owned / '+(counts[id]||0)+' in deck'
  })),
  stats:COLLECT.byId(journey.starter).name+' · '+draft.length+
   '/60 cards · '+(valid.valid?'Ready to battle':'Deck needs attention'),
  message:valid.errors[0]||'Swap any card you own, one for one. Only your saved deck goes into battle.',
  deck:Object.entries(counts).map(([id,count])=>({id,count,label:labelCard(id)}))
 };
 if(!window.NeoRpgOverworldCollection?.renderDeck?.(document,model))
  throw Error('The overworld deck editor presenter did not load.');
}
function openDeckWorkshop(){
 if(!state.deckJourney?.starter||state.pendingDuel||state.mandatoryEventState?.active||
  (controlsLocked()&&(!tournamentDayCup()||conversationInProgress())))return;
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
 }catch{}
}

function duelUrl(duel){const npcOutfit=OUTFITS?.select?.(cast[duel.npc]?.art?.outfits||window.NeoRpgCharacterPacks?.byId?.(duel.npc)?.art?.outfits,{location:state.location,slot:state.slot,day:state.day})?.key||'';const mats=window.NeoDuelPlaymats,gifts=mats?.gifted?.(state)||[],owned=mats?.available?.(gifts).map(m=>m.id)||['aurora'];const imported=localStorage.getItem(mats?.IMPORT_KEY||'neoCampusPlaymatImportSelection');const chosen=mats?.choose?.(imported&&owned.includes(imported)?imported:state.playmatSelected,owned)||'aurora';if(imported){localStorage.removeItem(mats.IMPORT_KEY);if(owned.includes(imported)){state.playmatSelected=chosen;persist();}}return '/classic_live.html?rpg=1&mat='+encodeURIComponent(chosen)+'&giftMats='+encodeURIComponent(gifts.join(','))+'&duelId='+encodeURIComponent(duel.id)+'&deck='+encodeURIComponent(duel.playerDeck)+'&opponent='+encodeURIComponent(duel.opponent)+'&npc='+encodeURIComponent(duel.npc)+'&npcOutfit='+encodeURIComponent(npcOutfit)+'&npcName='+encodeURIComponent(cast[duel.npc].name)+'&npcTier='+encodeURIComponent(duel.npcDeckTier||1)+'&npcVariant='+encodeURIComponent(duel.npcDeckVariant||0)+'&prizes='+encodeURIComponent(duel.prizeCount===6?6:4);}

function describePreparedDuel(){
 return PRE.describe(state,state.pendingDuel,{cast,places,cg:CG,tournaments:TOURNAMENTS,
  reactivity:{preDuelLine:(s,d)=>CONSEQ.preDuel(s,d.npc)||REACT.preDuelLine(s,d)}});
}
function showPreparedDuel(){
 const pending=state.pendingDuel;
 if(!PRE.isReady(pending))return;
 const preview=describePreparedDuel();
 if(!preview)return;
 const artRequest=++preDuelArtSerial;
 const matchStyle=window.NeoRpgTournamentPresentation?.matchModel?.(
  pending,{cast,cups:TOURNAMENTS.cups}
 );
 const accelerated=pending.npcDeckTier>(pending.day<=30?1:pending.day<=60?2:3);
 const deck=preview.deckLabel+(pending.customOpponentDeck?
  ' · YOUR COLLABORATIVE BUILD':
  pending.npcDeckTier===3?' · EXPERT DECK'+(accelerated?' · PERSONAL MILESTONE':''):
  pending.npcDeckTier===2?' · REFINED DECK'+(accelerated?' · PERSONAL MILESTONE':''):'')+
  ' · '+preview.place;
 const dialogue=preview.lines[pending.preview.index];
 const artwork=[
  ...(preview.artwork?.path?[{
   path:preview.artwork.path,kind:'event',alt:preview.artwork.title
  }]:[]),
  ...PRE.boosterArtCandidates(preview.npc).map(path=>({
   path,kind:'booster',alt:preview.name+' before the duel'
  }))
 ];
 const view=window.NeoRpgOverworldPreDuel;
 if(!view?.render?.(document,{
  circuit:matchStyle?.kind||'friendly',
  stake:preview.stake,name:preview.name,npc:preview.npc,place:preview.place,
  deck,speaker:dialogue.speaker,line:dialogue.text,
  canContinue:pending.preview.index<preview.lines.length-1,artwork
 },{
  avatar:id=>makeAvatar(id),
  discreet:(target,id,name)=>
   window.NeoRpgDiscreetAvatars?.set?.(target,id,'determined',name),
  isCurrent:()=>artRequest===preDuelArtSerial&&
   PRE.isReady(state.pendingDuel)&&state.pendingDuel.id===preview.id
 }))throw Error('The overworld pre-duel presenter did not load.');
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
let battleRecoveryTimer=null,battleReadyDuelId=null;
function ensureBattleRecovery(){
 const panel=window.NeoRpgOverworldDuelRecovery?.ensure?.(
  document,retryPendingBattle,abandonPendingBattle
 );
 if(!panel)throw Error('The overworld duel recovery presenter did not load.');
 return panel;
}
function scheduleBattleRecovery(){
 clearTimeout(battleRecoveryTimer);
 const pending=state.pendingDuel;if(!pending||PRE.isReady(pending))return;
 const started=Number(pending.startedAt)||Date.now();
 const delay=Math.max(0,30000-(Date.now()-started));
 battleRecoveryTimer=setTimeout(()=>{if(state.pendingDuel?.id===pending.id&&battleReadyDuelId!==pending.id)ensureBattleRecovery().hidden=false;},delay);
}
function retryPendingBattle(){
 const pending=state.pendingDuel;if(!pending||PRE.isReady(pending))return;
 battleReadyDuelId=null;pending.startedAt=Date.now();persist();ensureBattleRecovery().hidden=true;
 if(pending.deckCards)sessionStorage.setItem('neoRpgDeck:'+pending.id,JSON.stringify(pending.deckCards));
 if(pending.customOpponentDeck)sessionStorage.setItem('neoRpgNpcDeck:'+pending.id,JSON.stringify(pending.customOpponentDeck));
 $('duel').hidden=false;window.NeoRpgAudio?.setPaused?.(true);
 $('battle').src='about:blank';requestAnimationFrame(()=>{$('battle').src=duelUrl(pending);});
 scheduleBattleRecovery();
}
function abandonPendingBattle(){
 const pending=state.pendingDuel;if(!pending||PRE.isReady(pending))return;
 if(!confirm('Return to your campaign and abandon this unfinished duel?'))return;
 battleReadyDuelId=null;
 clearTimeout(battleRecoveryTimer);
 if(pending.tournamentId)TOURNAMENTS.cancel(state,pending);
 if(pending.arcEpisode)state.activeArc={id:pending.arcEpisode,phase:'choice',index:ARC.linesFor(state,pending.arcEpisode).length,choice:null};
 state.pendingDuel=null;
 sessionStorage.removeItem(BRIDGE.sessionKey(pending.id));
 sessionStorage.removeItem('neoRpgDeck:'+pending.id);sessionStorage.removeItem('neoRpgNpcDeck:'+pending.id);
 ensureBattleRecovery().hidden=true;$('duel').hidden=true;$('battle').src='about:blank';
 window.NeoRpgAudio?.setPaused?.(false);persist();render();
}
function launchPreparedDuel(){
 const pending=state.pendingDuel;
 if(!PRE.launch(pending))return;
 battleReadyDuelId=null;pending.startedAt=Date.now();
 recordCG('before_duel',pending.npc);
 persist();
 if($('preDuelDialog').open)$('preDuelDialog').close();
 render();
 $('duel').hidden=false;
 window.NeoRpgAudio?.setPaused?.(true);
 if(pending.deckCards)sessionStorage.setItem('neoRpgDeck:'+pending.id,JSON.stringify(pending.deckCards));
 if(pending.customOpponentDeck)sessionStorage.setItem('neoRpgNpcDeck:'+pending.id,JSON.stringify(pending.customOpponentDeck));
 $('battle').src=duelUrl(pending);
 scheduleBattleRecovery();
 // Only important circuit matches get the fast, nonblocking versus intro.
 const presentation=window.NeoRpgTournamentPresentation;
 if(presentation?.matchModel)presentation.show(presentation.matchModel(pending,{cast,cups:TOURNAMENTS.cups}));
}


let tournamentDeckPopup=null;
async function selectTournamentDeck({tournamentId=null,competition=null}={}){
 syncDeckStudioSave();
 if(!state.deckJourney?.starter){showStarterChoice();return;}
 if(state.pendingDuel)return;
 const theme=competition?.kind==='theme'?COMPETE.themeForDay(state.day):null;
 let catalog=null;
 if(theme){
  try{
   if(!themedCataloguePromise)themedCataloguePromise=Promise.all(
    Object.keys(COLLECT.SETS).map(async set=>{
     const response=await fetch('/cards/'+set+'.json');
     if(!response.ok)throw Error('Card catalogue unavailable');
     return response.json();
    })
   ).then(groups=>new Map(groups.flat().filter(c=>c?.id).map(c=>[c.id,c])))
    .catch(err=>{themedCataloguePromise=null;throw err;});
   catalog=await themedCataloguePromise;
  }catch(err){say('Tournament Desk','Could not load card details. Please try again.');return;}
 }
 if(state.pendingDuel||
    tournamentId&&!TOURNAMENTS.available(state).some(c=>c.id===tournamentId)||
    competition&&!COMPETE.available(state).some(e=>e.id===competition.id))return;
 const viable=COLLECT.slots(state).map((slot,i)=>{
  if(!slot||!COLLECT.check(slot.cards,state.deckJourney.owned).valid)return null;
  if(theme&&!COMPETE.legalThemeDeck(slot.cards,theme,COLLECT.packRarity,catalog).valid)return null;
  return {slot,i};
 }).filter(Boolean);
 tournamentDeckPopup?.remove();
 const overlay=document.createElement('div');tournamentDeckPopup=overlay;
 overlay.style.cssText='position:fixed;inset:0;z-index:2147483640;background:rgba(4,9,20,.78);display:grid;place-items:center;padding:16px';
 const panel=document.createElement('section');
 panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
 panel.setAttribute('aria-label','Choose a tournament deck');
 panel.style.cssText='width:min(480px,100%);max-height:85vh;overflow:auto;background:#172238;color:#fff;border:1px solid #64738b;border-radius:16px;padding:24px;box-shadow:0 12px 45px #0009';
 const heading=document.createElement('h2');heading.textContent='Choose your tournament deck';panel.append(heading);
 const details=document.createElement('p');details.textContent=(theme?.description||'Select a saved legal deck.')+' · Only eligible decks are shown.';panel.append(details);
 const actions=document.createElement('div');actions.style.cssText='display:grid;gap:9px;margin:16px 0';panel.append(actions);
 const close=()=>{overlay.remove();if(tournamentDeckPopup===overlay)tournamentDeckPopup=null;};
 const button=(label,run)=>{
  const el=document.createElement('button');el.type='button';el.textContent=label;
  el.style.cssText='padding:12px;text-align:left;border-radius:9px;background:#344763;color:#fff;border:1px solid #8496ad;cursor:pointer';
  el.onclick=run;actions.append(el);return el;
 };
 if(!viable.length){
  const warning=document.createElement('p');warning.textContent='You have no usable decks for this tournament. Prepare a legal deck in one of your five slots before entering.';warning.setAttribute('role','status');panel.append(warning);
  button('Edit my decks',()=>{close();location.assign('/rpg_deck_studio.html');});
 }else for(const {slot,i} of viable)button((i+1)+'. '+slot.name+' · 60 cards',()=>{
  const latest=state.deckJourney.deckSlots?.[i];
  if(!latest||state.pendingDuel)return close();
  const cards=[...latest.cards];
  if(!COLLECT.check(cards,state.deckJourney.owned).valid||
      theme&&!COMPETE.legalThemeDeck(cards,theme,COLLECT.packRarity,catalog).valid)return close();
  close();
  if(tournamentId){
   try{const match=TOURNAMENTS.begin(state,tournamentId);startDuel(match.npc,null,null,{...match,selectedDeckCards:cards});}
   catch(err){say('Tournament Desk',err.message);}
  }
  else startDuel(competition.npc,null,null,null,null,false,{...competition,selectedDeckCards:cards});
 });
 button('Cancel',close);
 overlay.append(panel);document.body.append(overlay);
 overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
 panel.querySelector('button')?.focus();
}
let themeDuelPreparing=false;
let themedCataloguePromise=null;
async function startDuel(id,exhibition=null,arcEpisode=null,tournament=null,sideQuest=null,bondChallenge=false,competition=null){
 if(tournamentDayCup()&&tournament?.tournamentId!==tournamentDayCup().id)return;
 syncDeckStudioSave(); // A new duel always snapshots the latest saved 60-card deck.
 if(state.deckJourney&&!state.deckJourney.starter){showStarterChoice();return;}
 const selectedDeckCards=tournament?.selectedDeckCards||competition?.selectedDeckCards||state.deckJourney?.deck;
 if(state.deckJourney?.starter&&!COLLECT.check(selectedDeckCards,state.deckJourney.owned).valid){$('notice').textContent='Save a valid campaign deck before challenging another trainer.';return;}
 if(state.activeSituation||state.activeStory||state.activeEncounter||(state.activeArc&&state.activeArc.id!==arcEpisode)||(state.activeSideQuest&&state.activeSideQuest.id!==sideQuest?.id)||state.pendingDuel||state.day>90||!cast[id]||(!exhibition&&!tournament&&!competition&&!currentPeople().includes(id)))return;
 if(!tournament&&!competition&&!confirmTimeAdvance())return;
 if(competition&&!COMPETE.available(state).some(e=>e.id===competition.id&&e.npc===id))return;
 const theme=competition?.kind==='theme'?COMPETE.themeForDay(state.day):null;
 let themeCatalog=null;
 if(theme){
  if(themeDuelPreparing)return;
  themeDuelPreparing=true;
  try{
   if(!themedCataloguePromise)themedCataloguePromise=Promise.all(
    Object.keys(COLLECT.SETS).map(async set=>{
     const response=await fetch('/cards/'+set+'.json');
     if(!response.ok)throw Error('Card catalogue unavailable');
     return response.json();
    })
   ).then(groups=>new Map(groups.flat().filter(card=>card?.id).map(card=>[card.id,card])))
    .catch(err=>{themedCataloguePromise=null;throw err;});
   themeCatalog=await themedCataloguePromise;
  }catch(err){say('Tournament Desk','Could not load card details. Please try again.');return;}
  finally{themeDuelPreparing=false;}
  if(state.pendingDuel||!COMPETE.available(state).some(e=>e.id===competition.id))return;
  const legality=COMPETE.legalThemeDeck(selectedDeckCards,theme,COLLECT.packRarity,themeCatalog);
  if(!legality.valid){say('Tournament Desk',legality.reason+' Edit your saved deck and try again.');return;}
 }
 if(sideQuest&&(!SIDE.canDuel(state,sideQuest.id,currentPeople())||SIDE.byId(sideQuest.id)?.stages[sideQuest.step]?.npc!==id))return;
 if(bondChallenge&&!BONDS.canChallenge(state,id,BOND_PLAN))return;
 if(arcEpisode&&(!state.activeArc||state.activeArc.phase!=='choice'||!ARC.available(state,currentPeople()).some(e=>e.id===arcEpisode)))return;
 const c=cast[id];
 // Shared deckbuilding recipes, adapted to the event rules. No per-character
 // tournament deck files: every round picks an existing profile as a template.
 const sourceBank=theme?[...Object.values(NPC_DECKS?.STARTING_RECIPES||{}),
  ...COLLECT.starters.map(entry=>entry.cards)]:null;
 const template=theme?sourceBank[(state.day+competition.round*3)%sourceBank.length]:null;
 const sharedThemeDeck=theme?COMPETE.buildThemeDeck(theme,template,COLLECT.packRarity,themeCatalog,
  state.day+competition.round):null;
 if(theme&&(!sharedThemeDeck||!NPC_DECKS.validateRecipe(sharedThemeDeck,themeCatalog).valid)){
  say('Tournament Desk','The themed opponent deck could not be prepared. Please try again.');return;
 }
 const npcEditedCards=sharedThemeDeck||PARTNER.snapshot(state,id,c.deck);
 const npcDeckVariant=NPC_DECKS?.variantForDuel?.('npc-'+id+'-'+state.day+'-'+state.slot+'-'+state.results.length)??0;
 const npcDeckTier=NPC_DECKS?.tierForOpponent?.(state,id)??(state.day<=30?1:state.day<=60?2:3);
 state.pendingDuel={id:'npc-'+id+'-'+state.day+'-'+state.slot+'-'+state.results.length+'-'+Math.random().toString(36).slice(2,10),npc:id,day:state.day,slot:state.slot,npcDeckVariant,opponent:c.deck,playerDeck:state.deckJourney?.starter?'custom':state.playerDeck,deckCards:state.deckJourney?.starter?[...selectedDeckCards]:null,resolved:false,eventKey:exhibition?exhibition.day+':'+exhibition.title:null,eventReward:exhibition?exhibition.reward:0,eventTitle:exhibition?exhibition.title:null,arcEpisode:arcEpisode||null,tournamentId:tournament?.tournamentId||null,tournamentRound:tournament?.tournamentRound??null,tournamentAttempt:tournament?.tournamentAttempt??null,sideQuestId:sideQuest?.id||null,sideQuestStage:sideQuest?.step??null,bondChallenge:!!bondChallenge,customOpponentDeck:npcEditedCards,
  competitiveKind:competition?.kind||null,competitiveId:competition?.id||null,
  competitiveWeek:competition?.week??null,competitiveRound:competition?.round??null,
  competitiveTitle:competition?.title||null,competitiveTheme:theme?.day||null,npcDeckTier,
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
 if(ev.data?.type==='neo-rpg-deck-studio-updated'){
  const frame=document.querySelector('#neoOverworldDeckPanel iframe');
  if(ev.origin===location.origin&&ev.source===frame?.contentWindow)
   (ev.data.save?applyDeckStudioSave(ev.data.save):syncDeckStudioSave());
  return;
 }
 const duel=state.pendingDuel;
 if((ev.data?.type==='neo-rpg-duel-ready'||ev.data?.type==='neo-rpg-duel-error')&&ev.origin===location.origin&&ev.source===$('battle').contentWindow&&ev.data.duelId===duel?.id){
  clearTimeout(battleRecoveryTimer);
  if(ev.data.type==='neo-rpg-duel-ready'){battleReadyDuelId=duel.id;const recovery=$('battleRecovery');if(recovery)recovery.hidden=true;}
  else if(!PRE.isReady(duel)){battleReadyDuelId=null;ensureBattleRecovery().hidden=false;}
  return;
 }
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
   log((competitiveOutcome.kind==='theme'?'Themed cup':'Saturday Local')+' prize: one '+COLLECT.SETS[set].name+' booster voucher. Redeem it at The Lucky Draw.');
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
 state.lastDuelReceipt=receipt;state.pendingDuel=null;battleReadyDuelId=null;
 sessionStorage.removeItem(BRIDGE.sessionKey(duel.id));
 sessionStorage.removeItem('neoRpgDeck:'+duel.id);
  sessionStorage.removeItem('neoRpgNpcDeck:'+duel.id);
 const duelBeforeTime={beforeDay:state.day,beforeSlot:state.slot};
 const cupProgress=duel.tournamentId?TOURNAMENTS.status(state,duel.tournamentId):null;
 // Draws replay without spending a period; late legacy saves can catch up.
 const keepCupSlot=!!cupOutcome&&!!tournamentDayCup()&&(
  cupOutcome.draw||cupOutcome.state!=='open'||
  (cupProgress.cup.rounds.length-cupProgress.round>=3-state.slot));
 if(!keepCupSlot)advance(1,'duel',true);
 else persist();
 $('duel').hidden=true;$('battle').src='about:blank';
 window.NeoRpgAudio?.setPaused?.(false);
 pendingDuelTimeShift=keepCupSlot?null:{...duelBeforeTime,afterDay:state.day,afterSlot:state.slot,source:'duel'};
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
 window.dispatchEvent(new CustomEvent('neo-rpg-focus-opportunities',{detail:{kind:pick.kind,focusId:pick.focusId}}));
 $('notice').textContent='You are in the right place. Pick the highlighted opportunity when you are ready; no time was spent getting here.';
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
function showCGMoment(entry){
 if(!entry||!CG.unlocked(state,entry.id))return false;
 // Short conversations and rewards use the same presenter through their last line.
 state.sceneCgId=entry.id;
 persist();syncSceneCG();
 return true;
}
function syncSceneCG(){
 if(!cgScenePresenter)return;
 const liveEventId=state.mandatoryEventState?.active?.id;
 if(liveEventId===LIVE_LYLA_PHOTO_EVENT.id){
  const path=liveDiscreetEnabled()
   ?window.NeoRpgDiscreetAvatars?.url?.('lyla')
   :state.phoneMessages?.liveLylaSighting?.src;
  if(path){
   const entry={id:LIVE_LYLA_PHOTO_EVENT.id+':'+(state.phoneMessages.liveLylaSighting?.receivedDay||state.day),title:'Lyla in the Spotlight',character:'lyla'};
   cgScenePresenter.show(entry,[{kind:'event',path}],()=>{},()=>{});
   return;
  }
 }
 if(liveEventId===LIVE_DAY_FOLLOWUP.id&&liveFollowupContent().away){
  cgScenePresenter.clear();
  return;
 }
 if(liveEventId===MIA_WINE_MISUNDERSTANDING.id&&state.miaWineStage!=='reveal'&&state.miaWineStage!=='blanket'){
  cgScenePresenter.clear();return;
 }
 const isLiveCg=!!liveEventId&&(liveEventId===MIA_PRIVATE_EVENT.id||liveEventId===LIVE_MIA_CHOICE_EVENT.id||liveEventId===MIA_SLEEP_EVENT.id||liveEventId===MIA_COUCH_CHOICE_EVENT.id||liveEventId===MIA_WINE_MISUNDERSTANDING.id||!!MIA_KITCHEN_ART[liveEventId]||!!LIVE_EVENT_ART[liveEventId]||
  LIVE_SPECIAL_IDS.has(liveEventId)||liveEventId===LIVE_HOME_CHECKIN.id||
  liveEventId===LIVE_DAY_FOLLOWUP.id||liveEventId===LIVE_REPEAT_MORNING.id||liveEventId===LIVE_AFTER_EVENT.id);
 const liveArt=isLiveCg?(liveDiscreetEnabled()?LIVE_DISCREET_PLACEHOLDER:
  liveEventId===MIA_PRIVATE_EVENT.id?MIA_BASE_PRIVATE_IMAGE():liveEventArt(liveEventId)):null;
 if(liveArt){
  const finalSecond=(liveEventId==='live_glance_next_morning'&&state.mandatoryEventState.active.index>=2)||
    (liveEventId===LIVE_REPEAT_MORNING.id&&state.mandatoryEventState.active.index>=1);
  // Include period and selected CG so repeated encounters update the bitmap.
  const sleepFocus=liveEventId===MIA_SLEEP_EVENT.id&&!liveDiscreetEnabled()&&
   state.miaSleepTarget&&(state.miaSleepStage==='wake'||state.miaSleepStage==='talk'||state.miaSleepStage==='end')
    ?(state.miaSleepTarget==='live'?{x:434,y:64,width:337,height:438}:{x:1027,y:45,width:359,height:418}):null;
  const couchFocus=liveEventId===MIA_COUCH_CHOICE_EVENT.id&&!liveDiscreetEnabled()&&
    state.miaCouchChoiceTarget&&['greet','answer','closing'].includes(state.miaCouchChoiceStage)
    ?(state.miaCouchChoiceTarget==='live'?{x:940,y:27,width:637,height:745}:{x:374,y:29,width:556,height:898}):null;
  const entry={id:[liveEventId,state.day,state.slot,state.liveDayScene?.id||'',finalSecond?'second':'first',liveArt,
    sleepFocus?state.miaSleepTarget:couchFocus?state.miaCouchChoiceTarget:'wide'].join(':'),
   title:MANDATORY_EVENTS.find(e=>e.id===liveEventId)?.title||'Live at Home',
   ...((sleepFocus||couchFocus)?{cgFocus:sleepFocus||couchFocus}:{})};
  const paths=liveDiscreetEnabled()?[LIVE_DISCREET_PLACEHOLDER]:liveEventId===LIVE_AFTER_EVENT.id?[LIVE_AFTER_ART]:liveEventId===LIVE_REPEAT_MORNING.id?
   [finalSecond?LIVE_REPEAT_FINAL_ART_2:LIVE_SPECIAL_ART.live_glance_next_morning]:
   LIVE_SPECIAL_IDS.has(liveEventId)
   ?[...specialArtCandidates(liveEventId==='live_glance_next_morning'&&state.mandatoryEventState.active.index>=2?LIVE_FINAL_ART_2:LIVE_SPECIAL_ART[liveEventId]),'/rpg-assets/characters/live/events/live_couch_sweater.png']
   :[liveArt];
  // Until the new approved CG pack is uploaded, existing Live art stays visible.
  const sourceId=liveEventId===LIVE_DAY_FOLLOWUP.id?state.liveDayScene?.id:liveEventId;
  const fallbackArt=LIVE_NEW.fallback(sourceId);
  if(liveEventId===LIVE_MIA_CHOICE_EVENT.id){
   const alternatives=[
    '/rpg-assets/characters/live/events/mia/47_a_highly_detailed_anime_style_illustration_tightl.png',
    '/rpg-assets/characters/live/events/live_couch_sweater.png'
   ];
   for(const art of alternatives)if(!paths.includes(art))paths.push(art);
  }
  if(liveEventId==='live_workout_wake_scare'||liveEventId==='live_cleaning_wake'){
   // Both new CGs may be uploaded later; never leave an empty scene.
   const existing='/rpg-assets/characters/live/events/live_waking_up_casual.png';
   if(!paths.includes(existing))paths.push(existing);
  }
  if(fallbackArt&&!paths.includes(fallbackArt))paths.push(fallbackArt);
  cgScenePresenter.show(entry,paths.map(path=>({kind:'event',path})),()=>{},()=>{});
  return;
 }
 const selected=CG_SCENE.select(state,CG.catalog,SLICE,scene);
 const entry=selected?.entry;
 if(!entry||(!selected.preview&&!CG.unlocked(state,entry.id))){
  cgScenePresenter.clear();
  if(cgSceneRelease){const release=cgSceneRelease;cgSceneRelease=null;release();}
  return;
 }
 cgScenePresenter.show(entry,CG.artCandidates(entry,false),loaded=>{
  // Calendar/mandatory transitions must wait until the event dialogue concludes.
  if(!cgSceneRelease)cgSceneRelease=timeSequence.hold();
  if(!loaded.artPending&&CG.unlocked(state,loaded.id)){CG.markViewed(state,loaded.id);persist();}
 },()=>{
  // Missing art must not stall the campaign or hide normal portraits.
  if(cgSceneRelease){const release=cgSceneRelease;cgSceneRelease=null;release();}
 });
}
// The album is a full-page character-first experience; unearned art never gets a URL.

// Only the approved 2026 v2 expression sheets are used for these characters.
// Hana's v2 sheet is not yet in the repository; she keeps her neutral main portrait.
const RPG_V2_IDS=new Set(['akari','alma','barb','camila','daisy','elena','elio','iris','jicy','jinx','jun','kaede','laca','luna','lyla','marina','nereo','reina','rina','shiori','sierra','sol','teo','yuna']);
const RPG_V2_MOODS=['neutral','happy','surprised','vulnerable','irritated','determined'];
const RPG_V2_BATTLE=['battle-attack','battle-hurt','battle-victory'];
const RPG_V2_MOOD_ALIASES={smile:'happy',smirk:'happy',playful:'happy',flirty:'happy',soft:'vulnerable',sad:'vulnerable',concerned:'vulnerable',worried:'vulnerable',embarrassed:'vulnerable',angry:'irritated',annoyed:'irritated',focused:'determined',confident:'determined',attack:'battle-attack',hurt:'battle-hurt',victory:'battle-victory'};
function rpgV2Expression(id,emotion='neutral'){
 if(!RPG_V2_IDS.has(id))return null;
 const key=String(emotion||'neutral').toLowerCase().replace(/_/g,'-');
 const name=[...RPG_V2_MOODS,...RPG_V2_BATTLE].includes(key)?key:(RPG_V2_MOOD_ALIASES[key]||'neutral');
 return '/rpg-assets/characters/'+id+'/expressionsv2/'+name+'.png';
}
const ART_TYPES=[{id:'cg',label:'CGs'},{id:'expressions',label:'Expressions'},{id:'battle',label:'Battle art'},{id:'outfits',label:'Outfits'},{id:'photoshoot',label:'Photoshoots'}];
const artEntries=new Map();
const artSeen=state.artSeen&&typeof state.artSeen==='object'&&!Array.isArray(state.artSeen)?state.artSeen:(state.artSeen={});
const artViewed=state.artViewed&&typeof state.artViewed==='object'&&!Array.isArray(state.artViewed)?state.artViewed:(state.artViewed={});
function artKey(path){return String(path||'').split('?')[0];}
function buildArtEntries(){
 artEntries.clear();
 const register=(id,type,label,path)=>{
  if(typeof path!=='string'||!/^\/rpg-assets\/[\w./ -]+\.(?:png|webp|jpg|jpeg)$/i.test(path)||path.includes('..'))return;
  if(type==='photoshoot'&&(id!=='lyla'||!path.startsWith('/rpg-assets/characters/lyla/photoshoot/')))return;
  // Retire the old expressions from the gallery, including previously seen paths.
  if(type==='expressions'&&!/\/expressionsv2\//.test(path))return;
  if(/\/(?:expression-portraits|expression-faces|vn-expressions|expressions)\//.test(path))return;
  const key=artKey(path);
  if(artEntries.has(key))return;
  artEntries.set(key,{id,type,label,path:key,unlocked:type==='photoshoot'||!!artSeen[key],title:label,viewed:!!artViewed[key]});
 };
 for(const item of window.NeoRpgArtManifest||[])if(cast[item.id])register(item.id,item.type,item.title,item.path);
 for(const id of RPG_V2_IDS)if(cast[id]){
  for(const mood of RPG_V2_MOODS)register(id,'expressions',mood,rpgV2Expression(id,mood));
  for(const mood of RPG_V2_BATTLE)register(id,'battle',mood,rpgV2Expression(id,mood));
 }
 for(const [id,art] of Object.entries(window.NeoRpgCharacterPacks?.looks||{})){
  for(const [emotion,path] of Object.entries(art.expressions||{}))register(id,'expressions',emotion,path);
  if(art.portrait)register(id,'expressions','Portrait',art.portrait);
  for(const [outfit,variant] of Object.entries(art.outfits?.variants||{})){
   register(id,'outfits',outfit,variant.portrait);
   for(const [emotion,path] of Object.entries(variant.expressions||{}))register(id,'outfits',outfit+' · '+emotion,path);
  }
 }
 // Include only artwork actually used in play; never infer an unlock from file existence.
 for(const path of Object.keys(artSeen)){
  const match=path.match(/^\/rpg-assets\/(?:characters|reactions)\/([a-z0-9_-]+)\//i);
  if(!match||!cast[match[1]])continue;
  const id=match[1],known=(window.NeoRpgArtManifest||[]).find(item=>item.path===path),type=known?.type||(path.startsWith('/rpg-assets/reactions/')||/\/(?:reaction|reactions|cutins|attack|battle)\//i.test(path)?'battle':/\/(?:outfits|overworld-variants)\/|\/special-day-\d+\./i.test(path)?'outfits':'expressions');
  register(id,type,path.split('/').at(-1).replace(/\.[^.]+$/,''),path);
 }
}
function recordArtPath(path){
 const normalized=String(path||'').split('?')[0].replace(/^https?:\/\/[^/]+/,'');
 if(!/^\/rpg-assets\/(?:characters|reactions)\/[^?#]+\.(?:png|webp|jpe?g)$/i.test(normalized))return;
 if(/\/(?:expression-portraits|expression-faces|vn-expressions|expressions)\//.test(normalized))return;
 if(!artSeen[normalized]){artSeen[normalized]={day:state.day,slot:state.slot};buildArtEntries();persist();}
}
window.NeoRpgRecordArt=recordArtPath;
window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===$('battle')?.contentWindow&&event.data?.type==='neo-rpg-art-seen')recordArtPath(event.data.path);});
window.addEventListener('neo-rpg-art-seen',event=>recordArtPath(event.detail?.path));
function recordArtImage(img){
 if(img.closest?.('#galleryDialog,.cg-lightbox,.cg-fullscreen-viewer'))return;
 const path=artKey(img.currentSrc||img.src);
 if(!path.startsWith('/rpg-assets/')&&!path.includes('/rpg-assets/'))return;
 recordArtPath(path);
}
function attachArtworkTracker(doc){
 if(!doc||doc.__neoGalleryTracking)return;
 doc.__neoGalleryTracking=true;
 doc.addEventListener('load',e=>{if(e.target?.tagName==='IMG')recordArtImage(e.target);},true);
}
attachArtworkTracker(document);
$('battle')?.addEventListener('load',()=>{
 try{attachArtworkTracker($('battle').contentDocument);}catch{ /* cross-origin iframe is not accessible */ }
});
buildArtEntries();
let galleryCharacterPage='';
function openGalleryArtwork(entry){
 if(!entry?.unlocked)return false;
 const view=window.NeoRpgOverworldGallery;
 return !!view?.openLightbox?.(document,entry,{
  discreetAvatar:(target,id)=>
   window.NeoRpgDiscreetAvatars?.set?.(target,id,'neutral',id),
  loadCG:(image,art,onSuccess,onMissing)=>
   loadCGArt(image,art,false,onSuccess,onMissing),
  onViewed:()=>{
   if(entry.type){
    if(artViewed[entry.path])return;
    artViewed[entry.path]=true;
   }else CG.markViewed(state,entry.id);
   persist();renderGallery();
  }
 });
}
function showOtherArt(entry){
 if(!entry?.unlocked)return;
 if(!openGalleryArtwork({...entry,character:entry.character||entry.id}))
  throw Error('The overworld artwork viewer did not load.');
}
function galleryOpenViewer(entry){
 if(!entry?.unlocked)return;
 if(!openGalleryArtwork(entry))
  throw Error('The overworld CG viewer did not load.');
}
function galleryCharacterIds(){
 return [...new Set([...Object.keys(cast),...CG.catalog.map(entry=>entry.character)])]
  .filter(id=>!!cast[id])
  .sort((a,b)=>cast[a].name.localeCompare(cast[b].name));
}
function populateGalleryCharacters(){
 const items=galleryCharacterIds().map(id=>({id,name:cast[id].name}));
 if(!window.NeoRpgOverworldGallery?.populateCharacters?.($('galleryCharacter'),items))
  throw Error('The overworld gallery character list is unavailable.');
}
function galleryViewModel(){
 buildArtEntries();
 const select=$('galleryCharacter'),category=$('galleryCategory');
 // Photoshoots belong exclusively to Lyla, not to the shared category bar.
 const categories=ART_TYPES.filter(item=>item.id!=='photoshoot'||galleryCharacterPage==='lyla');
 if(!categories.some(item=>item.id===category.value))category.value='cg';
 if(!galleryCharacterPage){
  const ids=[...select.options].map(option=>option.value).filter(Boolean);
  const all=[...CG.gallery(state),...artEntries.values()].map(entry=>({
   ...entry,character:entry.character||entry.id
  }));
  return {
   page:'',characters:ids.map(id=>{
    const matches=all.filter(entry=>entry.character===id);
    return {id,name:cast[id]?.name||id,total:matches.length,
     earned:matches.filter(entry=>entry.unlocked).length};
   })
  };
 }
 const type=category.value;
 const all=type==='cg'||!type?CG.gallery(state,{character:galleryCharacterPage}):
  [...artEntries.values()]
   .filter(entry=>entry.id===galleryCharacterPage&&entry.type===type)
   .map(entry=>({...entry,character:entry.id,thumb:entry.path}));
 const visible=$('galleryUnseen').checked?
  all.filter(entry=>entry.unlocked&&!entry.viewed):all;
 return {
  page:galleryCharacterPage,title:cast[galleryCharacterPage]?.name||galleryCharacterPage,
  type:category.value,categories,all,visible
 };
}
function renderGallery(){
 const model=galleryViewModel();
 if(!window.NeoRpgOverworldGallery?.render?.(document,model,{
  avatar:id=>makeAvatar(id),
  chooseCharacter:id=>{
   if(!cast[id])return;
   galleryCharacterPage=id;
   $('galleryCharacter').value=id;$('galleryCategory').value='cg';
   renderGallery();
  },
  chooseCategory:id=>{
   if(!ART_TYPES.some(type=>type.id===id)||id==='photoshoot'&&galleryCharacterPage!=='lyla')return;
   $('galleryCategory').value=id;renderGallery();
  },
  discreetAvatar:(target,id)=>
   window.NeoRpgDiscreetAvatars?.set?.(target,id,'neutral',id),
  loadCG:(img,entry,onSuccess,onMissing)=>
   loadCGArt(img,entry,true,onSuccess,onMissing),
  open:entry=>entry.type?showOtherArt(entry):galleryOpenViewer(entry)
 }))throw Error('The overworld gallery renderer is unavailable.');
}
function openGallery(){
 galleryCharacterPage='';$('galleryUnseen').checked=false;
 populateGalleryCharacters();$('galleryCategory').value='cg';renderGallery();$('galleryDialog').showModal();
}
function openCommunityBoard(){
 const links=Object.entries(COMMUNITY.hydrate(state).links)
  .filter(([,progress])=>(progress.matches||0)>=2||(progress.meetings||0)>=2)
  .sort((a,b)=>(b[1].matches||0)+(b[1].meetings||0)-(a[1].matches||0)-(a[1].meetings||0));
 const model={
  standings:COMMUNITY.rank(state,cast).slice(0,8).map(entry=>({
   name:entry.name,wins:entry.wins,losses:entry.losses
  })),
  events:COMMUNITY.recent(state,8).map(event=>({
   day:event.day,place:places[event.place]?.[0]||event.place,
   description:COMMUNITY.describe(event,cast)
  })),
  connections:links.slice(0,4).map(([pair,progress])=>{
   const [a,b]=pair.split(':');
   return {label:(cast[a]?.name||a)+' & '+(cast[b]?.name||b)+' · '+
    ((progress.matches||0)>=2?'Competitive rivals':'Familiar friends')};
  })
 };
 if(!window.NeoRpgOverworldModals?.renderCommunity?.(document,model))
  throw Error('The overworld community board is unavailable.');
 $('communityDialog').showModal();
}
// One spoiler-safe timeline for appointments, known stories and official fixtures.
function calendarEntries(){
 const now=APPOINTMENTS.stamp(state.day,state.slot);
 const rows=[];
 const add=entry=>{if(places[entry.place])rows.push(entry);};
 for(const plan of APPOINTMENTS.active(state)){
  if(APPOINTMENTS.stamp(plan.day,plan.slot)<now)continue;
  const activity=SOCIAL.activities?.find(item=>item.id===plan.activityId);
  add({day:plan.day,slot:plan.slot,place:plan.place,kind:'Personal plan',
   title:'Meet '+(cast[plan.npc]?.name||'your friend'),
   detail:activity?.title||'Agreed meet-up',npc:plan.npc});
 }
 for(const event of eventCards){
  if(APPOINTMENTS.stamp(event.day,event.slot)<now||
    state.eventsDone?.[event.day+':'+event.title])continue;
  add({day:event.day,slot:event.slot,place:event.place,kind:'Official event',
   title:event.title,detail:'Scheduled circuit exhibition'});
 }
 for(const cup of TOURNAMENTS.cups){
  const progress=TOURNAMENTS.status(state,cup.id);
  if(cup.end<state.day||
    ['champion','eliminated','expired','missed'].includes(progress.state))continue;
  add({day:Math.max(state.day,cup.day),slot:null,place:cup.place,kind:'Tournament',
   title:cup.title,detail:'Registration: Days '+cup.day+'–'+cup.end+
    (progress.round?' · Round '+(progress.round+1)+'/3':'')});
 }
 // Don't expose undiscovered character stories or unavailable schedule windows.
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
 return rows;
}
function openCalendar(){
 const rows=calendarEntries().map(entry=>({
  ...entry,
  period:entry.slot===null?'Any period':periods[entry.slot],
  placeName:places[entry.place][0],
  canVisit:entry.day===state.day&&(entry.slot===null||entry.slot===state.slot)
 }));
 const renderer=window.NeoRpgOverworldModals;
 if(!renderer?.renderCalendar?.($('calendarEntries'),{
  day:state.day,location:state.location,locked:controlsLocked(),entries:rows
 },entry=>{
  // Recheck the calendar against the authoritative state before following a
  // shortcut. Calendar recommendations never auto-play a scene or start a duel.
  const valid=calendarEntries().some(item=>
   item.day===entry.day&&item.slot===entry.slot&&item.place===entry.place&&
   item.kind===entry.kind&&item.title===entry.title&&item.npc===entry.npc);
  if(!valid||controlsLocked())return;
  $('calendarDialog').close();
  if(entry.place!==state.location)travelTo(entry.place);
  else if(entry.npc&&currentPeople().includes(entry.npc))selectPerson(entry.npc);
  else window.dispatchEvent(new CustomEvent('neo-rpg-focus-opportunities',{
   detail:{kind:entry.kind==='Tournament'||entry.kind==='Official event'?'tournament':'story'}
  }));
  if(entry.place===state.location&&entry.npc&&currentPeople().includes(entry.npc))return;
  if(entry.npc&&currentPeople().includes(entry.npc))selectPerson(entry.npc);
 }))throw Error('The overworld calendar is unavailable.');
 $('calendarDialog').showModal();
}
// Keep the previous portrait on screen until its replacement is fully decoded.
const decodedPortraitAssets=new Map();
function readyPortrait(path){
 if(!path)return Promise.resolve(false);
 if(decodedPortraitAssets.has(path))return decodedPortraitAssets.get(path);
 const promise=new Promise(resolve=>{
  const asset=new Image();asset.decoding='async';
  asset.onload=()=>{
   if(typeof asset.decode==='function')
    Promise.resolve().then(()=>asset.decode()).then(()=>resolve(asset.naturalWidth>0),()=>resolve(asset.naturalWidth>0));
   else resolve(asset.naturalWidth>0);
  };
  asset.onerror=()=>resolve(false);
  asset.src=path;
 });
 decodedPortraitAssets.set(path,promise);
 if(decodedPortraitAssets.size>72)decodedPortraitAssets.delete(decodedPortraitAssets.keys().next().value);
 return promise;
}
function makeAvatar(id,size=''){
 const img=document.createElement('img'),paths=size==='stage'?stagePortraitPaths(id,'neutral'):portraitPaths(id,'neutral');
 img.src=paths.find(src=>!failedScenePortraits.has(src))||cast[id].portrait||'/rpg-assets/'+id+'.png';
 img.alt=cast[id].name;img.loading=size==='stage'?'eager':'lazy';
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

function mandatoryClosureDue(){
 return !!MANDATORY&&MANDATORY_EVENTS.some(e=>e.kind==='season'&&!state.mandatoryEventState?.seen?.[e.id]&&state.day>=e.earliestDay);
}
function renderSeasonReport(){
 const complete=EPILOGUE.completed(state)&&!mandatoryClosureDue();
 if(!window.NeoRpgOverworldModals?.renderSeason?.(
  $('endSeason'),{
   complete,
   report:complete?EPILOGUE.report(state):null,
   history:complete?JOURNEY.archive(state):[]
  },
  ()=>act('replay')
 ))throw Error('The overworld season report is unavailable.');
}

let lastRenderedLocation=null;
// Keep the neutral character portrait as the only fallback when a v2 sheet is absent.
const failedScenePortraits=new Set();
let activeOutfitSceneId=null;
// Hana's casual overworld looks are selected once per encounter and reused
// through its dialogue. Authored scenes retain their existing costume routing.
let hanaEncounterSerial=0,hanaEncounterKey=null,hanaLastVariant=null;
const hanaEncounterVariants=new Map();
const HANA_OVERWORLD_VARIANTS=[
 '/rpg-assets/characters/hana/overworld-variants/01_original_white_lace_denim.png',
 '/rpg-assets/characters/hana/overworld-variants/02_gray_blouse_denim.png',
 '/rpg-assets/characters/hana/overworld-variants/03_gray_ruched_top_denim.png',
 '/rpg-assets/characters/hana/overworld-variants/04_white_top_mini_skirt.png',
 '/rpg-assets/characters/hana/overworld-variants/05_white_top_pleated_skirt.png',
 '/rpg-assets/characters/hana/overworld-variants/06_pink_lace_white_top_denim.png',
 '/rpg-assets/characters/hana/overworld-variants/07_gray_lace_white_top_denim.png',
 '/rpg-assets/characters/hana/overworld-variants/08_ribbon_top_denim.png'
];
function hanaOverworldPortrait(sceneId=activeOutfitSceneId){
 if(sceneId)return null;
 const key=hanaEncounterKey||['ordinary',state.day,state.slot,state.location,'hana'].join(':');
 if(hanaEncounterVariants.has(key))return hanaEncounterVariants.get(key);
 const choices=[cast.hana.portrait,...HANA_OVERWORLD_VARIANTS].filter(Boolean);
 const available=choices.filter(path=>path!==hanaLastVariant);
 const selected=(available.length?available:choices)[Math.floor(Math.random()*(available.length||choices.length))];
 hanaEncounterVariants.set(key,selected);hanaLastVariant=selected;
 if(hanaEncounterVariants.size>64)hanaEncounterVariants.delete(hanaEncounterVariants.keys().next().value);
 return selected;
}
function portraitPaths(id,expression='neutral',sceneId=activeOutfitSceneId){
 const v2=rpgV2Expression(id,expression);
 // Never fall back to old expression sheets (including outfit expression sheets).
 return v2?[v2]:[cast[id]?.portrait||'/rpg-assets/'+id+'.png'];
}
// Persona C bust framing approved by the player. Only the RPG stage uses it.
// Original art, event CGs and booster portraits remain untouched.
// Keep Camila's approved full-body overworld source intact. The dialogue viewport
// may show just her upper body without introducing another art file.
const CAMILA_DIALOGUE_MASTER='/rpg-assets/characters/camila/overworld/standing-front.png';
// Full-body dialogue masters already approved by the player; no images modified.
// Preserve expression, location outfit, and day-locked special variants.
const APPROVED_DIALOGUE_MASTERS=Object.freeze({
 iris:'/rpg-assets/characters/iris/dialogue/neutral.png',
 alma:'/rpg-assets/characters/alma/overworld/standing-front.png',
 barb:'/rpg-assets/characters/barb/portraits/primary.png',
 elena:'/rpg-assets/characters/elena/overworld/standing-portfolio.png',
 jun:'/rpg-assets/characters/jun/standing-front.png',
 teo:'/rpg-assets/characters/teo/dialogue/neutral.png',
 nereo:'/rpg-assets/characters/nereo/dialogue/neutral.png',
 elio:'/rpg-assets/characters/elio/dialogue/neutral.png',
 kaede:'/rpg-assets/characters/kaede/dialogue/neutral.png',
 shiori:'/rpg-assets/characters/shiori/dialogue/neutral.png',
 marina:'/rpg-assets/characters/marina/dialogue/neutral.png'
});
function dialogueMasterSource(id,expression){
 return expression==='neutral'?APPROVED_DIALOGUE_MASTERS[id]||null:null;
}
// Default neutral dialogue art for characters without a separately approved master.
// Each path is an already existing front-facing (or closest idle) overworld pose.
// Never use back views, seated sprites, or substitute another character's art.
const OVERWORLD_DIALOGUE_DEFAULTS=Object.freeze({
 akari:'/rpg-assets/characters/akari/overworld/standing-clipboard.png',
 daisy:'/rpg-assets/characters/daisy/overworld/idle.png',
 hana:'/rpg-assets/characters/hana/overworld/phone-standing.png',
 jicy:'/rpg-assets/characters/jicy/overworld/standing.webp',
 jinx:'/rpg-assets/characters/jinx/overworld/idle.png',
 luna:'/rpg-assets/characters/luna/overworld/standing-front.png',
 reina:'/rpg-assets/characters/reina/overworld/standing.png',
 rina:'/rpg-assets/characters/rina/overworld/alternate-card-pose.png',
 sierra:'/rpg-assets/characters/sierra/overworld/standing-wink.png',
 sol:'/rpg-assets/characters/sol/standing-front.png',
 yuna:'/rpg-assets/characters/yuna/overworld/gamer-idle.png'
});
// Laca's overworld uses separate casual / lifeguard outfit directories.
const LACA_OVERWORLD_DIALOGUE_DEFAULTS=Object.freeze({
 casual:'/rpg-assets/characters/laca/overworld/casual/reaching-out.png',
 lifeguard:'/rpg-assets/characters/laca/overworld/lifeguard/front-leaning.png'
});
function defaultOverworldDialogueSource(id,expression,normal){
 if(expression!=='neutral'||APPROVED_DIALOGUE_MASTERS[id]||id==='camila')return null;
 if(id==='laca')return normal.some(src=>src.includes('/lifeguard/'))?
  LACA_OVERWORLD_DIALOGUE_DEFAULTS.lifeguard:LACA_OVERWORLD_DIALOGUE_DEFAULTS.casual;
 return OVERWORLD_DIALOGUE_DEFAULTS[id]||null;
}

function personaCStageCandidates(id,emotion,normal){
 const v2=rpgV2Expression(id,emotion);
 return v2?[v2]:normal.filter(src=>!/(?:\/expression-portraits\/|\/expression-faces\/|\/vn-expressions\/|\/expressions\/)/.test(src));
}
// Daily overworld-only alternate portraits. Stable for the entire in-game day.
const DAILY_STAGE_ALTERNATES={
 akari:Array.from({length:5},(_,i)=>'/rpg-assets/characters/akari/portraits/special-day-'+(i+1)+'.png'),
 barb:Array.from({length:10},(_,i)=>'/rpg-assets/characters/barb/portraits/special-day-'+(i+1)+'.png')
};
// Special looks roll once per character per day; their appearance is not consumed by viewing.
const SPECIAL_LOOKS={
 ...DAILY_STAGE_ALTERNATES,
 hana:HANA_OVERWORLD_VARIANTS
};
function specialLookRecord(id,day=state.day){
 const files=SPECIAL_LOOKS[id];
 if(!files?.length)return null;
 const root=state.specialLookDays||(state.specialLookDays={});
 const saved=root[id];
 if(saved&&saved.day===day)return saved;
 const missed=Math.max(0,(saved?Number(saved.missed)||0:Math.max(0,day-1))+Math.max(0,day-(saved?.day||day)-1));
 const chance=Math.min(1,.10+.05*missed);
 const active=Math.random()<chance;
 const portrait=active?files[Math.floor(Math.random()*files.length)]:null;
 const record={day,portrait,active,missed:missed+1,chance};
 root[id]=record;
 persist();
 return record;
}
function dailyStagePortrait(id,day){
 return specialLookRecord(id,day)?.portrait||null;
}
// A scheduled or scene-specific outfit outranks generic dialogue art.
// Restrict priority to a *different* active variant: the default master remains
// approved art whenever no special costume is being worn.
function sceneOutfitPortraitPaths(id,expression,sceneId=activeOutfitSceneId){
 const art=cast[id]?.outfitArt||cast[id]?.art||window.NeoRpgCharacterPacks?.byId?.(id)?.art||null;
 const selected=OUTFITS?.select?.(art?.outfits,{
  location:state.location,slot:state.slot,day:state.day,sceneId
 });
 if(!selected||selected.key===art?.outfits?.default)return [];
 const paths=[];
 // Laca's active lifeguard look uses the matching full-body front pose.
 if(id==='laca'&&selected.key==='lifeguard')
  paths.push(LACA_OVERWORLD_DIALOGUE_DEFAULTS.lifeguard);
 // Outfit illustration remains available, but legacy outfit expressions are retired.
 paths.push(selected.variant?.portrait);
 return [...new Set(paths.filter(path=>OUTFITS.safeImage(path)))];
}
function stagePortraitPaths(id,expression,sceneId){
 const alternate=dailyStagePortrait(id,state.day);
 const outfit=sceneOutfitPortraitPaths(id,expression,sceneId);
 const normal=personaCStageCandidates(id,expression,portraitPaths(id,expression,sceneId));
 const master=dialogueMasterSource(id,expression)||defaultOverworldDialogueSource(id,expression,normal)||(id==='camila'?CAMILA_DIALOGUE_MASTER:null);
 // v2 expressions always take priority; named outfits and poses may remain
 // as non-expression fallbacks for scenes with bespoke costumes.
 const candidates=[...new Set([...normal,...outfit,...(master?[master]:[])])];
 return alternate?[alternate,...candidates.filter(path=>path!==alternate)]:candidates;
}
function scenePortraitSource(id,expression,sceneId=activeOutfitSceneId){
 const paths=stagePortraitPaths(id,expression,sceneId);
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
 if(context.cgOnly){
  // Do not construct, preload or display any regular character portraits.
  // Live's authored CG is the entire illustration for this scene.
  overworldScenePortraits={conversation:false,focused:null,participants:[]};
  return;
 }
 // Compute scene composition for the sole overworld presenter.
 const composition=SCENE_CAST.select({cast,present:ids,portraitId,shown,...context});
 const {focused,participants}=composition;
 overworldScenePortraits={
  conversation:composition.conversation,
  focused,
  participants:composition.conversation?participants.map(id=>{
   const expression=id===focused?
    (window.NeoRpgCharacterMotion?.emotion?.(shown?.expression,dialogueExpression(shown?.line))||dialogueExpression(shown?.line)):'neutral';
   let src=scenePortraitSource(id,expression,context.sceneId),srcs=null;
   // A pose intro may change the expression, but never strip a special outfit.
   const outfitActive=!!dailyStagePortrait(id,state.day)||
    sceneOutfitPortraitPaths(id,expression,context.sceneId).length>0;
   if(id===focused&&scene?.poseTrigger&&state.overworldPoseIntro?.id===id&&!outfitActive){
    const neutral=stagePortraitPaths(id,'neutral',context.sceneId);
    srcs=stagePortraitPaths(id,'vulnerable',context.sceneId).filter(path=>!neutral.includes(path)&&!failedScenePortraits.has(path));
    if(srcs.length)src=srcs[0];
    else src=state.overworldPoseIntro.src;
   }
   // Always supply the current costume's alternatives before older portrait
   // fallbacks; a failed PNG should not strand the conversation without art.
   const sources=srcs?.length?srcs:stagePortraitPaths(id,expression,context.sceneId);
   return {id,name:cast[id].name,src,...(sources?.length?{srcs:[src,...sources.filter(path=>path!==src)]}:{})};
  }):[]
 };
 // Warm likely expressions while the current dialogue line is visible.
 if(composition.conversation){
  for(const participant of overworldScenePortraits.participants){
   void readyPortrait(participant.src);
   if(participant.id!==focused)continue;
   for(const mood of ['neutral','happy','vulnerable','irritated','determined']){
    const next=rpgV2Expression(participant.id,mood);
    if(next&&next!==participant.src)void readyPortrait(next);
   }
  }
 }
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
 for(const id of ['choices']){
  const root=$(id);if(!root)continue;
  for(const button of root.querySelectorAll('button')){
   const walk=document.createTreeWalker(button,NodeFilter.SHOW_TEXT);
   const nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);
   for(const node of nodes)node.nodeValue=cleanRpgLabel(node.nodeValue);
  }
 }
}
// Day 91 year-end blooper reel; state lives in the campaign save for local/cloud persistence.
function maybeShowYearEndFallReel(){
 if(state.day!==91||state.yearEndFallReelCompleted||state.yearEndFallReelActive||
    state.pendingDuel||state.activeStory||state.mandatoryEventState?.active||
    state.activeSliceOfLife||state.activeSituation||state.activeEncounter||
    state.activeArc||state.activeSideQuest||scene.line||scene.choices?.length||
    timeSequence.blocked||window.NeoRpgTimeTransitions?.active||document.getElementById('neoYearEndFalls'))return;
 state.yearEndFallReelActive=true;
 state.yearEndFallReelCompleted=true;
 persist();
 const entries=[['Barb','barb'],['Hana','hana'],['Laca','laca'],['Marina','marina']];
 let index=0;
 const panel=document.createElement('div');
 panel.id='neoYearEndFalls';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
 panel.setAttribute('aria-label','Year-end workshop bloopers');
 panel.style.cssText='position:fixed;inset:0;z-index:2147480000;background:rgba(12,9,25,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;color:white;box-sizing:border-box';
 const title=document.createElement('h2');title.textContent='Year-End Bloopers · Barb’s Workshop';
 title.style.cssText='margin:0;font:600 clamp(18px,3vw,26px) sans-serif;text-align:center';
 const img=document.createElement('img');img.style.cssText='width:min(100%,1100px);height:min(72vh,760px);max-height:72dvh;object-fit:contain;border-radius:12px';
 const controls=document.createElement('div');controls.style.cssText='display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;font:16px sans-serif';
 const label=document.createElement('span');label.style.cssText='min-width:110px;text-align:center';
 const prev=document.createElement('button');prev.type='button';prev.textContent='← Previous';
 const next=document.createElement('button');next.type='button';next.textContent='Next →';
 const close=document.createElement('button');close.type='button';close.textContent='Close';
 let dismissed=false;
 function show(){
  const [name,key]=entries[index];
  label.textContent=name+' · '+(index+1)+' / '+entries.length;
  img.alt=name+' slipping in the workshop year-end blooper reel';
  img.src='/rpg-assets/events/cg/season01/year_end_fall_'+key+'.webp';
  prev.disabled=index===0;next.textContent=index===entries.length-1?'Finish':'Next →';
 }
 function dismiss(){
  if(dismissed)return;dismissed=true;
  document.removeEventListener('keydown',onKey,true);
  panel.remove();state.yearEndFallReelActive=false;persist();
 }
 function advance(){if(index===entries.length-1)dismiss();else{index++;show();}}
 function onKey(e){
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();dismiss();}
  else if(e.key==='ArrowRight'){e.preventDefault();advance();}
  else if(e.key==='ArrowLeft'&&index>0){e.preventDefault();index--;show();}
 }
 prev.onclick=()=>{if(index>0){index--;show();}};next.onclick=advance;close.onclick=dismiss;
 controls.append(prev,label,next,close);panel.append(title,img,controls);document.body.append(panel);
 document.addEventListener('keydown',onKey,true);show();close.focus();
}
const phoneMessages=window.NeoRpgPhoneMessages?.create({
 state,cast,manifest:window.NeoOverworld,relationships:REL,persist,render,
 people:currentPeople,
 fallbackImage:id=>scenePortraitSource(id,'neutral',null),
 audio:()=>window.NeoRpgAudio?.play?.('phone'),
 discreet:()=>window.NeoRpgDiscreet?.isEnabled?.(),
 avatars:window.NeoRpgDiscreetAvatars,
 canShow:()=>!controlsLocked()&&!arrivalGate&&!pendingOverworldArrival&&!window.NeoRpgTimeTransitions?.active&&
  !document.querySelector('.neo-cup-story:not([hidden])')&&
  !document.querySelector('dialog[open]:not(#phoneMessageDialog)')
});
async function finishOverworldArrival(destination){
 if(state.location!==destination)return;
 // Cup mornings are entirely handled by the VN; no chimes or map encounters.
 if(tournamentDayCup()){pendingEntrySurprise=false;return;}
 arrivalGate=true;
 try{
  hanaEncounterKey='entry:'+ ++hanaEncounterSerial;
  const present=currentPeople();
  const characters=present.map(id=>({id,portrait:scenePortraitSource(id,'neutral',null)}));
  const firstMeetings=present.filter(id=>!state['met_'+id]&&!state.overworldIntroductions?.[id]&&!(id==='reina'&&state.metReina))
   .map(id=>({id,portrait:scenePortraitSource(id,'neutral',null)}));
  const outfitChime=window.NeoOutfitChime;
  if(typeof outfitChime?.onEntry==='function')await outfitChime.onEntry({characters,firstMeetings});
  else console.error('Outfit chime module missing at overworld arrival');
  if(state.location!==destination)return;
  if(firstMeetings.length){
   state.overworldIntroductions=state.overworldIntroductions||{};
   for(const {id} of firstMeetings)state.overworldIntroductions[id]=true;
   persist();
  }
  if(pendingEntrySurprise){
   pendingEntrySurprise=false;
   if(!scheduleEvent()&&(beginSliceOfLife('entry',null,true)||(!eligibleStories().length&&beginSliceOfLife('entry'))))return;
  }
 }catch(error){console.warn('Overworld arrival chime skipped:',error);}
 finally{arrivalGate=false;}
 if(state.location===destination)render();
}
// Compulsory tournaments are VN scenes in a full-screen hall, never map encounters.
// Save both cameo selection and the current line so a reload resumes in place.
function tournamentNarrativeView(){
 const cup=tournamentDayCup();
 if(!cup||!TOURNAMENT_STORY){TOURNAMENT_STORY?.hide();return;}
 if(state.pendingDuel||state.mandatoryEventState?.active||state.activeSliceOfLife||
  state.activeStory||state.activeSituation||state.activeEncounter||state.activeArc||
  state.activeSideQuest||$('starterDialog')?.open){
  TOURNAMENT_STORY.hide();return;
 }
 const progress=TOURNAMENTS.status(state,cup.id);
 // Post-duel dialogue uses the same full-screen VN instead of falling through
 // to the ordinary overworld stage. The save already owns this dialogue.
 if(scene?.line){
  if(scene.choices?.length){TOURNAMENT_STORY.hide();return;}
  const actor=Object.keys(cast).find(id=>cast[id]?.name===scene.speaker);
  TOURNAMENT_STORY.show({cup,mode:'result',
   script:[{speaker:actor||scene.speaker||'Narrator',text:scene.line}],
   index:0,cast,progress,
   portraits:(id,expression)=>stagePortraitPaths(id,expression),
   onNext:closeSceneDialogue});
  return;
 }
 state.tournamentNarrative=state.tournamentNarrative||{};
 let record=state.tournamentNarrative[cup.id];
 if(!record||typeof record!=='object'||Array.isArray(record)){
  record={seen:[],active:null,guests:null};
  state.tournamentNarrative[cup.id]=record;
 }
 if(!Array.isArray(record.seen))record.seen=[];
 // Old saves may already be halfway through the tournament when this wake-up
 // chapter is installed. Never replay the morning after the opening ceremony.
 if(!record.seen.includes('wakeup')&&(
  record.seen.includes('arrival')||
  ['arrival','round-0','round-1','round-2','closing'].includes(record.active?.key)||
  progress.round>0||progress.state!=='open')){
  record.seen.unshift('wakeup');persist();
 }
 if(!Array.isArray(record.guests)){
  record.guests=TOURNAMENT_STORY.supporters(state,cast,cup,REL);
  persist();
 }
 if(record.active&&!['wakeup','arrival','round-0','round-1','round-2','closing'].includes(record.active.key))
  record.active=null;
 if(!record.active){
  const key=!record.seen.includes('wakeup')?'wakeup':
   !record.seen.includes('arrival')?'arrival':
   progress.state==='open'&&!record.seen.includes('round-'+progress.round)?'round-'+progress.round:
   progress.state!=='open'&&!record.seen.includes('closing')?'closing':null;
  if(key){
   // Pick the interruption only once per campaign, on the first eligible
   // tournament morning after Live's intimacy scene and Mia's introduction.
   if(key==='wakeup'&&!Object.prototype.hasOwnProperty.call(record,'miaWakeup')){
    record.miaWakeup=!!(state.mandatoryEventState?.seen?.live_glance_next_morning||
      state.liveSpecialSeen?.live_glance_next_morning)&&
      !!state.mandatoryEventState?.seen?.mia_first_time&&
      !state.tournamentMiaWakeupSeen;
   }
   // Another one-time variation, only when the five-minute interruption is
   // not scheduled. Preserve the already selected variant on save/reload.
   if(key==='wakeup'&&!Object.prototype.hasOwnProperty.call(record,'miaDeckWakeup')){
    record.miaDeckWakeup=!record.miaWakeup&&
      !!state.mandatoryEventState?.seen?.mia_first_time&&
      !state.tournamentMiaDeckWakeupSeen;
   }
   record.active={key,index:0};persist();
  }
 }
 if(record.active){
  const active=record.active;
  const script=TOURNAMENT_STORY.lines(cup,active.key,progress,record.guests,cast,REL,state);
  if(!script.length){record.seen.push(active.key);record.active=null;persist();return;}
  const index=Math.min(script.length-1,Math.max(0,active.index||0));
  TOURNAMENT_STORY.show({cup,mode:'scene',phase:active.key==='wakeup'?'wakeup':'arena',script,index,progress,cast,
   liveRomance:!!(state.mandatoryEventState?.seen?.live_glance_next_morning||state.liveSpecialSeen?.live_glance_next_morning),
   portraits:(id,expression)=>stagePortraitPaths(id,expression),
   onNext:()=>{
    if(state.tournamentNarrative?.[cup.id]?.active!==active)return;
    if(active.index<script.length-1)active.index++;
    else{
     if(!record.seen.includes(active.key))record.seen.push(active.key);
     if(active.key==='wakeup'&&record.miaWakeup)state.tournamentMiaWakeupSeen=true;
     if(active.key==='wakeup'&&record.miaDeckWakeup)state.tournamentMiaDeckWakeupSeen=true;
     record.active=null;
    }
    persist();render();
   }});
 }else{
  TOURNAMENT_STORY.show({cup,mode:'lobby',progress,cast,
   portraits:(id,expression)=>stagePortraitPaths(id,expression),
   onDeck:()=>safeAct('tournamentDeck'),
   onPlay:()=>safeAct('cup:'+cup.id),
   onEnd:()=>safeAct('tournamentEnd')});
 }
}
// An acknowledged reminder stays acknowledged across reloads and cloud sync.
// It does not advance the game clock or alter relationship statistics.
function tournamentCountdownView(){
 if(!TOURNAMENT_STORY||tournamentDayCup())return;
 const upcoming=TOURNAMENT_STORY.countdown(state,TOURNAMENTS.cups);
 const key=upcoming?upcoming.cup.id+':'+state.day:null;
 if(!upcoming||state.tournamentCountdownSeen?.[key]||
  timeSequence.blocked||window.NeoRpgTimeTransitions?.active||
  arrivalGate||pendingOverworldArrival||state.pendingDuel||
  scene?.line||scene?.choices?.length||
  state.mandatoryEventState?.active||state.activeSliceOfLife||state.activeSituation||
  state.activeStory||state.activeEncounter||state.activeArc||state.activeSideQuest||
  $('starterDialog')?.open||$('preDuelDialog')?.open||
  $('galleryDialog')?.open||$('calendarDialog')?.open||
  $('deckEditDialog')?.open){
  TOURNAMENT_STORY.hide();return;
 }
 let active=state.tournamentCountdownActive;
 if(!active||active.key!==key){
  active=state.tournamentCountdownActive={key,index:0};
  persist();
 }
 const script=TOURNAMENT_STORY.countdownLines(upcoming.cup,upcoming.daysLeft);
 const index=Math.min(script.length-1,Math.max(0,active.index||0));
 TOURNAMENT_STORY.show({cup:upcoming.cup,mode:'scene',phase:'countdown',script,index,cast:{},
  onNext:()=>{
   if(state.tournamentCountdownActive!==active)return;
   if(active.index<script.length-1)active.index++;
   else{
    state.tournamentCountdownSeen=state.tournamentCountdownSeen||{};
    state.tournamentCountdownSeen[key]=true;
    state.tournamentCountdownActive=null;
    TOURNAMENT_STORY.hide();
   }
   persist();render();
  }});
}
function render(){
 // Keep the outgoing DOM intact until the calendar wipe fully covers it; then swap
 // the scene behind the overlay so the new day is revealed only as the wipe exits.
 if(timeSequence.blocked&&!timeTransitionCovered)return;
 // Detect actual location changes after the first render; navigation remains free.
 const previousLocation=lastRenderedLocation;
 lastRenderedLocation=state.location;
 if(previousLocation&&previousLocation!==state.location){
  window.NeoRpgAudio?.play?.('travel');
   const destination=state.location;
  pendingOverworldArrival=destination;
  // Stop the RPG render/event pipeline until the travel wipe and chimes finish.
  if(!timeSequence.blocked&&!state.mandatoryEventState?.active){
   const transition=window.NeoRpgTimeTransitions?.presentTravel?.({
    from:places[previousLocation]?.[0]||previousLocation,
    to:places[destination]?.[0]||destination
   },{onDismiss:()=>{
    if(pendingOverworldArrival===destination)pendingOverworldArrival=null;
    void finishOverworldArrival(destination);
   }});
   if(transition){
    // The wipe callback is primary; this fallback recovers if a mobile browser
    // drops its animation/timer callback during tab suspension.
    setTimeout(()=>{
     if(pendingOverworldArrival===destination&&!arrivalGate&&!window.NeoRpgTimeTransitions?.active){
      pendingOverworldArrival=null;
      void finishOverworldArrival(destination);
     }
    },1400);
    notifyOverworldRendering();
    return;
   }
  }
 }
 window.NeoRpgAudio?.setScene?.(state.location,state.slot);
 // Accepted invitations begin as soon as apartment arrival finishes. An
 // already-active mandatory scene finishes first; new ones can queue afterward.
 if(state.location==='home'&&state.romanceVisitPending&&!state.romanceVisitShowing&&!state.romanceVisitDeferred&&
    ROMANCE?.pending(state,state.romanceVisitPending,STORY)&&
    !state.mandatoryEventState?.active&&!state.activeStory&&!state.activeSliceOfLife&&
    !state.activeSituation&&!state.activeEncounter&&!state.activeArc&&!state.activeSideQuest&&
    !state.pendingDuel&&!timeSequence.blocked&&!arrivalGate&&!pendingOverworldArrival&&
    !window.NeoRpgTimeTransitions?.active&&!scene?.line&&!scene?.choices?.length&&
    !tournamentDayCup()){
  if(startRomanceVisit(state.romanceVisitPending))return;
 }
 if(!arrivalGate&&!pendingOverworldArrival)maybeStartMandatory();
 const ended=state.day>90,locked=timeSequence.blocked||!!state.activeSliceOfLife||!!state.mandatoryEventState?.active||!!state.activeSituation||!!state.activeStory||!!state.activeEncounter||!!state.activeArc||!!state.activeSideQuest||!!state.pendingDuel||!!tournamentDayCup();
 // Location artwork is rendered only by the persistent overworld iframe.
 const showingMandatory=state.mandatoryEventState?.active?MANDATORY_EVENTS.find(x=>x.id===state.mandatoryEventState.active.id):null;
 const mandatoryLine=showingMandatory?.lines?.[state.mandatoryEventState.active.index];
 const mandatoryPortrait=mandatoryLine&&cast[mandatoryLine.speaker]?mandatoryLine.speaker:(showingMandatory?.kind==='bond'?showingMandatory.characterId:null);
 const showingSituation=state.activeSituation?SITUATIONS.byId(state.activeSituation.id):null;
 const showingSlice=state.activeSliceOfLife?SLICE.byId(state.activeSliceOfLife.id):null;
 const showingStory=state.activeStory?STORY.byId(state.activeStory.id):null;
 const showingEncounter=state.activeEncounter?WORLD.byEncounter(state.activeEncounter.id):null;
 const showingArc=state.activeArc?ARC.byId(state.activeArc.id):null;
 const sideQuest=state.activeSideQuest?SIDE.byId(state.activeSideQuest.id):null,sideOwner=sideQuest?.stages[state.sideQuests[state.activeSideQuest?.id]?.step]?.npc;
  const liveCgOnly=!!showingMandatory&&(showingMandatory.id===LIVE_HOME_CHECKIN.id||
  showingMandatory.id===LIVE_LYLA_PHOTO_EVENT.id||showingMandatory.id===LIVE_DAY_FOLLOWUP.id||
  showingMandatory.id===LIVE_REPEAT_MORNING.id||!!LIVE_EVENT_ART[showingMandatory.id]||
  LIVE_SPECIAL_IDS.has(showingMandatory.id)||showingMandatory.id===LIVE_AFTER_EVENT.id);
 // Live has no portrait: her events are illustrated entirely by the scene CG.
 // Don't inherit a previously selected character's portrait either.
 const portraitId=liveCgOnly?null:mandatoryPortrait||showingSlice?.npc||showingSituation?.npc||showingStory?.npc||showingEncounter?.npc||(showingArc?'reina':null)||sideOwner||state.selected;
 activeOutfitSceneId=showingMandatory?.id||showingSlice?.id||showingSituation?.id||showingStory?.id||showingEncounter?.id||showingArc?.id||sideQuest?.id||null;
 let shown=showingMandatory?renderMandatory():showingSlice?renderSliceOfLife():showingSituation?showSituation():showingStory?renderStory():showingEncounter?showEncounter():showingArc?showArc():state.activeSideQuest?showSideQuest():scene;
 const cup=tournamentDayCup();
 if(cup&&!state.pendingDuel&&!showingMandatory&&!showingSlice&&!showingSituation&&!showingStory&&
  !showingEncounter&&!showingArc&&!state.activeSideQuest&&!scene?.line&&!scene?.choices?.length){
  const progress=TOURNAMENTS.status(state,cup.id),unfinished=progress.state==='open';
  shown={speaker:'Tournament Desk',
   line:unfinished?'Day '+state.day+' · '+cup.title+'. Today is dedicated to the tournament. You can edit your deck for free before each match. Round '+(progress.round+1)+' of 3 against '+(cast[progress.opponent]?.name||progress.opponent)+'.':
    (progress.state==='champion'?'Congratulations, champion!':'Your tournament has ended.')+' Other plans resume tomorrow.',
   choices:unfinished?[['▤ Edit your 60-card deck · free','tournamentDeck'],['⚔ Begin round '+(progress.round+1)+' / 3','cup:'+cup.id]]:
    [['Continue to the next day ›','tournamentEnd']]};
 }
 overworldRenderedDialogue=String(shown?.line||'');
 // Gameplay decides which actions are legal; the overworld view owns DOM
 // construction, dialogue focus, response layout, and character menus.
 const choiceItems=(shown?.choices||[]).map(([label,action])=>{
  const item={label,action,finish:action==='storyFinish'};
  if(action.startsWith('storyChoice:')){
   const event=state.activeStory&&STORY.byId(state.activeStory.id);
   const chosen=event?.choices[Number(action.split(':')[1])];
   item.disabled=!!chosen&&chosen.kind==='commit'&&!VN.commitmentReady(state,event.npc);
   if(item.disabled)item.reason='You need a stronger bond for this step.';
  }
  if(action.startsWith('socialDo:')){
   const [,npc,activityId]=action.split(':');
   const selection=SOCIAL.options(state,npc,currentPeople(),cast).find(option=>option.id===activityId);
   item.disabled=!selection||!!selection.disabledReason;
   if(item.disabled)item.reason=selection?.disabledReason||'This activity is not available.';
  }
  if(action.startsWith('dateBook:')){
   const [,npc,index,activityId,tone]=action.split(':');
   const target=APPOINTMENTS.proposed(state,npc,SCHEDULES)[Number(index)];
   const option=target?DATES.choices(state,npc,target.place,activityId,SOCIAL,cast).find(value=>value.id===tone):null;
   item.disabled=!option||!!option.disabledReason;
   if(item.disabled)item.reason=option?.disabledReason||'That meeting time is no longer available.';
  }
  return item;
 });
 // A finished narration may be acknowledged even while its time wipe has locked travel.
 if((!locked||!!tournamentDayCup()||timeSequence.blocked&&!timeSequence.running)&&shown?.line&&!shown?.choices?.length)
  choiceItems.push({label:'Continue ›',continue:true,finish:true});
 const people=currentPeople();
 const sceneScript=showingMandatory?.lines||
  (showingStory?storyDialogueLines(showingStory.id):null)||
  (showingArc?ARC.linesFor(state,showingArc.id):null)||
  (showingSlice?.lines?.length?SLICE.linesFor(state,showingSlice.id):null)||
  (sideQuest?SIDE.linesFor(state,state.activeSideQuest.id):null)||[];
 const remoteScene=!!showingMandatory&&showingMandatory.kind==='bond'&&
  (showingMandatory.delivery==='remote'||
   !SCHEDULES.peopleAt(state.day,state.slot,state.location,publicAppointments(state.location)).includes(showingMandatory.characterId));
 renderRpgCast(people,locked,shown,portraitId,{
  active:!!(showingMandatory||showingSlice||showingSituation||showingStory||showingEncounter||showingArc||sideQuest),
  script:sceneScript,remote:remoteScene,sceneId:activeOutfitSceneId,cgOnly:liveCgOnly
 });
 const menuMode=shown?.presentation==='character-menu';
 const menuId=menuMode?shown.menuCharacter:null;
 const selectedCharacter=menuMode?(menuId&&people.includes(menuId)?menuId:null):
  (state.selected&&people.includes(state.selected)&&!locked?state.selected:null);
 const stageMenu={mode:menuMode,characterId:selectedCharacter};
 if(selectedCharacter){
  stageMenu.name=cast[selectedCharacter].name;
  if(menuMode){
   stageMenu.heading=shown.menuHeading||'CHOOSE AN OPTION';
   stageMenu.description=shown.menuDescription||'Choose an option.';
   stageMenu.choices=choiceItems;
  }else{
   const display=cast[selectedCharacter].name.split(' ')[0];
   stageMenu.actions=[
    {id:'glance',label:'◉ Glance at',title:'View '+stageMenu.name+' up close'},
    {id:'talk',label:'☏ Talk',title:'Talk to '+stageMenu.name},
    {id:'duel',label:'⚔ Duel',title:'Challenge '+stageMenu.name+' to a duel'}
   ];
   const availableSocial=!state.hungOut?.[state.day+':'+selectedCharacter]?
    SOCIAL.options(state,selectedCharacter,people,cast).filter(option=>!option.disabledReason&&!option.photoSession):[];
   if(availableSocial.length)
    stageMenu.actions.push({id:'spend',label:'✧ Spend time',title:'Suggest an activity together'});
   if(APPOINTMENTS.proposed(state,selectedCharacter,SCHEDULES).length)
    stageMenu.actions.push({id:'plan',label:'◷ Make plans',title:'Invite '+display+' to meet on another day'});
   if(ROMANCE?.offerable(state,selectedCharacter,STORY))
    stageMenu.actions.push({id:'romance',label:ROMANCE.isFirst(state,selectedCharacter)?
     '♥ Private invitation':'♥ Invite home',title:'Spend a private moment with '+stageMenu.name});
   if(state.deckJourney?.starter){
    stageMenu.actions.push({id:'scout',label:'⌕ Scout',title:'Review '+stageMenu.name+'\u2019s usual theme deck and plan your upgrades'});
   }
   if(PARTNER.unlocked(state,selectedCharacter)&&state.deckJourney?.starter)
    stageMenu.actions.push({id:'deck',label:'▤ Deck',title:'Edit '+display+'\u2019s deck'});
  }
 }
 const stageView=window.NeoRpgOverworldStageView;
 if(!stageView?.render)throw Error('The overworld dialogue presenter did not load.');
 stageView.render({
  document,
  model:{speech:shown,choices:choiceItems,menu:stageMenu,locked},
  onAction:action=>safeAct(action),
  onContinue:closeSceneDialogue,
  onCommand:(command,id)=>{
   if(!cast[id]||!currentPeople().includes(id))return;
   if(command==='glance')void glanceAt(id);
   else if(command==='talk')selectPerson(id);
   else if(command==='duel')startDuel(id);
   else if(command==='spend')planSharedActivity(id);
   else if(command==='plan')act('dateInvite:'+id);
   else if(command==='romance')act('romanceOffer:'+id);
   else if(command==='scout'&&state.deckJourney?.starter){
    persist();location.assign('/rpg_deck_studio.html?scout='+encodeURIComponent(id));
   }else if(command==='deck')act('partnerDeck:'+id);
  }
 });
 renderSeasonReport();
 $('notice').textContent=tournamentDayCup()&&!state.pendingDuel&&!conversationInProgress()?'Official tournament day · deck setup and matches only.':conversationInProgress()?'Finish the conversation before traveling or starting another activity.':state.mandatoryEventState?.active?'Incoming story — finish this moment to continue.':state.activeSituation?'Unexpected encounter in progress — finish the scene to continue.':state.activeSideQuest?'Side quest in progress — finish the scene to continue.':state.activeStory?'Story in progress: complete this scene to continue.':state.activeArc?'A private rivalry chapter is in progress.':state.activeEncounter?'Local encounter in progress — make your decision.':state.pendingDuel?'Your duel is in progress.':'Travel & talk are free · ⏳ actions advance time';
 simplifyRpgLabels();
 window.NeoRpgCharacterMotion?.update?.({
  location:state.location,speaker:shown?.speaker||'',line:shown?.line||'',
  dialogue:$('dialogue'),speakerElement:$('speaker'),lineElement:$('line')
 });
 syncSceneCG();
 tournamentNarrativeView();
 tournamentCountdownView();
 queueMicrotask(maybeShowYearEndFallReel);
 // Recover an interrupted CG after refresh, without consuming the visit.
 if(state.romanceVisitShowing&&!timeSequence.blocked&&!arrivalGate&&!pendingOverworldArrival)
  queueMicrotask(()=>openRomanceVisit(state.romanceVisitShowing));
 // If another transition or mandatory scene owned the screen, resume the arrival
 // chime once it settles instead of silently losing this place entry.
 if(pendingOverworldArrival&&!arrivalGate&&!window.NeoRpgTimeTransitions?.active){
  const destination=pendingOverworldArrival;
  pendingOverworldArrival=null;
  void finishOverworldArrival(destination);
 }
 phoneMessages?.showIfReady();
 notifyOverworldRendering();
}

$('statusClose').onclick=()=>window.NeoRpgStatus.close();
$('galleryClose').onclick=()=>$('galleryDialog').close();
$('galleryBack').onclick=()=>{galleryCharacterPage='';$('galleryCharacter').value='';$('galleryCategory').value='cg';renderGallery();};
$('galleryCharacter').onchange=()=>{galleryCharacterPage=$('galleryCharacter').value;renderGallery();};$('galleryCategory').onchange=renderGallery;$('galleryUnseen').onchange=renderGallery;
$('preDuelBack').onclick=cancelPreparedDuel;
$('preDuelNext').onclick=advancePreparedDuel;
$('preDuelStart').onclick=launchPreparedDuel;
$('preDuelSkip').onclick=launchPreparedDuel;
$('preDuelDialog').addEventListener('cancel',e=>{e.preventDefault();cancelPreparedDuel();});
$('calendarClose').onclick=()=>$('calendarDialog').close();$('communityClose').onclick=()=>$('communityDialog').close();
$('tutorialDismiss').onclick=()=>{tutorialQueue.shift();displayTutorial();};
document.addEventListener('keydown',e=>{if($('statusDialog')?.open)return;if((e.key===' '||e.code==='Space')&&!['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target?.tagName)){if(scene.dialogue&&scene.index<scene.dialogue.length-1&&!state.mandatoryEventState?.active&&!state.activeStory&&!state.activeArc&&!state.activeSideQuest){e.preventDefault();act('chatNext');}else if(state.mandatoryEventState?.active?.phase==='lines'){e.preventDefault();act('mandatoryNext');}else if(state.activeStory?.phase==='lines'){e.preventDefault();act('storyNext');}else if(state.activeArc?.phase==='lines'){e.preventDefault();act('arcNext');}else if(!$('dialogue').hidden&&!state.activeSituation&&!state.mandatoryEventState?.active&&!state.activeStory&&!state.activeEncounter&&!state.activeArc&&!state.activeSideQuest&&!state.pendingDuel&&!scene.choices?.length){e.preventDefault();closeSceneDialogue();}}});
// Old pre-collection saves may still refer to a deck by ID. Validate that
// stored ID without creating a hidden selector or second deck-building UI.
async function verifyLegacyDeckId(){
 if(state.deckJourney!==null)return;
 try{
  const response=await fetch('/api/classic/decks');
  if(!response.ok)throw Error('Could not load decks');
  const data=await response.json();
  const eligible=Array.isArray(data.decks)?data.decks.filter(deck=>deck?.id&&deck.id!=='custom'):[];
  if(!eligible.some(deck=>deck.id===state.playerDeck)){
   state.playerDeck='blackout';
   persist();
  }
 }catch(error){$('notice').textContent='Deck list unavailable: '+error.message;}
}
window.NeoRpgAudio?.init?.();
persist();render();void verifyLegacyDeckId();loadCardNames();if(state.deckJourney&&!state.deckJourney.starter&&!state.ended&&!state.pendingDuel)showStarterChoice();if(state.deckJourney?.lastPack&&!state.deckJourney.lastPack.opened&&!state.pendingDuel)showPackReveal();if(state.pendingDuel){
 if(state.pendingDuel.deckCards)sessionStorage.setItem('neoRpgDeck:'+state.pendingDuel.id,JSON.stringify(state.pendingDuel.deckCards));
 if(state.pendingDuel.customOpponentDeck)sessionStorage.setItem('neoRpgNpcDeck:'+state.pendingDuel.id,JSON.stringify(state.pendingDuel.customOpponentDeck));
 if(PRE.isReady(state.pendingDuel)){
  $('duel').hidden=true;$('battle').src='about:blank';showPreparedDuel();
 }else{
  $('duel').hidden=false;
  window.NeoRpgAudio?.setPaused?.(true);
  if(!Number(state.pendingDuel.startedAt)){state.pendingDuel.startedAt=Date.now();persist();}
  $('battle').src=duelUrl(state.pendingDuel);
  scheduleBattleRecovery();
 }
}
 window.NeoRpgCloudSave?.mount({
  getSave:()=>JSON.parse(localStorage.getItem(KEY)||'null'),
  restoreSave:save=>{localStorage.setItem(KEY,JSON.stringify(save));location.reload();},
  resetSave:()=>{localStorage.removeItem(KEY);location.reload();},
  hadLocalSave:hadCampaignSave,
  showButton:true
 });
 // Publish readiness only after all declarations, save startup, game UI and
 // duel recovery wiring have been initialized. The overworld listener
 // synchronously mounts and reads snapshot(), so earlier dispatch is unsafe.
 window.dispatchEvent(new Event('neo-rpg-overworld-bridge-ready'));
})();


