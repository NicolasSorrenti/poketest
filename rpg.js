'use strict';
(()=>{
const $=id=>document.getElementById(id),KEY='neoHarborRpgV1',STORY=window.NeoHarborStory,WORLD=window.NeoHarborWorld,CIRCUIT=window.NeoHarborCircuit,MARKET=window.NeoHarborMarket,FINALE=window.NeoHarborFinale;
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
const eventCards=[{day:7,slot:1,place:'arcade',title:'Arcade Friendly Cup',reward:7},{day:14,slot:1,place:'center',title:'Club Exhibition',reward:9},{day:21,slot:2,place:'shop',title:'Card Shop Night',reward:8},{day:30,slot:1,place:'center',title:'Neighborhood Cup',reward:15},{day:42,slot:1,place:'arcade',title:'Open Challenge',reward:10},{day:60,slot:1,place:'center',title:'Regional Qualifier',reward:22},{day:75,slot:2,place:'shop',title:'Final Practice Meet',reward:12},{day:88,slot:1,place:'center',title:'Championship Opening',reward:20},{day:90,slot:1,place:'center',title:'Championship Finale Exhibition',reward:25}];


function eligibleStories(){return STORY.available(state);}
function startStory(id){
 if(state.activeStory||state.pendingDuel)return;
 const e=eligibleStories().find(e=>e.id===id);if(!e)return;
 state.selected=e.npc;state.activeStory={id:e.id,phase:'lines',index:0,choice:null};persist();render();
}
function renderStory(){
 const a=state.activeStory,e=STORY.byId(a.id);
 if(!e){state.activeStory=null;persist();return null;}
 if(a.phase==='lines'){
  const line=e.lines[Math.min(a.index,e.lines.length-1)];
  return {speaker:line.speaker==='Protagonist'?'You':line.speaker===e.guest?cast[e.guest].name:cast[e.npc].name,line:line.text,choices:[[a.index<e.lines.length-1?'Continue ›':'Respond ›','storyNext']]};
 }
 if(a.phase==='choice')return {speaker:cast[e.npc].name,line:'How will you respond?',choices:e.choices.map((c,i)=>[c.label,'storyChoice:'+i])};
 const chosen=e.choices[a.choice];
 return {speaker:cast[e.npc].name,line:chosen.reply,choices:[['Finish scene · ⏳ 1 period','storyFinish']]};
}
function advanceStory(){
 const a=state.activeStory;if(!a||a.phase!=='lines')return;
 const e=STORY.byId(a.id);a.index++;if(a.index>=e.lines.length)a.phase='choice';
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
 log('A memorable afternoon with '+cast[id].name+'.');
 state.activeStory=null;advance();state.selected=id;
 persist();say(cast[id].name,result.choice.reply);
}

function timeFlash(beforeDay,beforeSlot){const overlay=document.createElement('div');overlay.className='notice-pop';const heading=document.createElement('b');heading.textContent=state.day>90?'Season complete':state.day!==beforeDay?'A NEW DAY BEGINS':'TIME PASSES';const body=document.createElement('span');body.textContent=state.day>90?'Day 90 has ended.':('Day '+state.day+' · '+periods[state.slot]);overlay.append(heading,body);document.body.append(overlay);overlay.addEventListener('animationend',()=>overlay.remove());}

function defaults(){return {day:1,slot:0,location:'home',metReina:false,reinaTrust:0,reinaDuels:0,results:[],flags:{intro:false},journal:['The 90-day season begins.'],pendingDuel:null,bonds:{},talked:{},hungOut:{},eventsDone:{},points:0,credits:80,playerDeck:'blackout',selected:null,ended:false,storyDone:{},storyMissed:{},relationships:{},routeOutcomes:{},partner:null,activeStory:null,finale:null,newGamePlus:0,activityDone:{},practiceInsights:0}}
let state;try{state=JSON.parse(localStorage.getItem(KEY))||defaults();if(!Number.isInteger(state.day)||state.day<1||state.day>91)throw Error('Invalid save');}catch{state=defaults()}
for(const [k,v] of Object.entries(defaults()))if(state[k]===undefined)state[k]=v;
for(const id of Object.keys(cast)){if(!state.bonds[id])state.bonds[id]={affection:0,trust:0,duels:0};}
STORY.normalize(state);
WORLD.normalize(state);CIRCUIT.normalize(state);MARKET.normalize(state);
for(const id of Object.keys(cast)){const old=state.bonds[id],current=state.relationships[id];
 if(!state.flags['newStoryMigrated_'+id]){for(const key of ['affection','trust','duels'])current[key]=Math.max(current[key]||0,old[key]||0);
 state.flags['newStoryMigrated_'+id]=true;}
}
if(typeof state.activeStory==='string')state.activeStory=null;
STORY.recordExpiry(state);
CIRCUIT.expire(state);
const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));
const log=t=>{state.journal.unshift(t);state.journal=state.journal.slice(0,25)};
let scene={speaker:'Narrator',line:'Ninety days. One championship. You came to Neo Harbor to win. Everyone else has their own plans.',choices:[]};
const atKey=(id)=>state.day+':'+state.slot+':'+id;
function advance(n=1){const beforeDay=state.day,beforeSlot=state.slot;for(let i=0;i<n;i++){state.slot++;if(state.slot>=3){state.slot=0;state.day++;}}if(state.day>90){state.day=91;state.ended=true;log('The Neo Harbor championship season has ended.');}
state.selected=null;
const missed=STORY.recordExpiry(state);if(missed.length)log('Some opportunities in town passed while you were busy.');
const news=WORLD.afterAdvance(state,beforeDay);
for(const result of news)log('Local circuit update: '+cast[result.winner].name+' defeated '+cast[result.loser].name+'.');
const forfeited=CIRCUIT.expire(state);if(forfeited)log('Missed the next round of '+forfeited.name+'.');
persist();timeFlash(beforeDay,beforeSlot);}
function say(speaker,line,choices=[]){scene={speaker,line,choices};render();}
function currentPeople(){return WORLD.peopleAt(state,cast,state.location,eligibleStories());}

function selectPerson(id){if(state.activeStory||!cast[id]||!currentPeople().includes(id))return;const c=cast[id],first=!state['met_'+id]&&!((id==='reina')&&state.metReina);state['met_'+id]=true;if(id==='reina')state.metReina=true;state.selected=id;persist();say(c.name,first?c.intro:c.repeat,options(id));}
function options(id){const c=cast[id],key=atKey(id);return [
 [state.talked[key]?'Talked this period':'Talk','talk:'+id],
 ['Spend time together · ⏳ 1 period','hang:'+id],
 ['Challenge to a duel · ⏳ 1 period','duel:'+id],
 ['Playful remark','flirt:'+id],
 ['Goodbye','close']
 ];}
function scheduleEvent(){return eventCards.find(e=>![30,60,88,90].includes(e.day)&&e.day===state.day&&e.slot===state.slot&&e.place===state.location&&!state.eventsDone[e.day+':'+e.title]);}
function act(action){
 const [type,id]=action.split(':');
 if(type==='storyNext')return advanceStory();
 if(type==='storyChoice')return chooseStory(id);
 if(type==='storyFinish')return finishStory();
 if(state.activeStory||state.pendingDuel)return;
 if(type==='calendar')return openCalendar();
 if(type==='tregister')return registerTournament(id);
 if(type==='tmatch')return startTournamentRound();
 if(type==='arcadeStart')return arcadeStart();
 if(type==='arcade')return arcadeFinish(id);
 if(type==='cafeShift')return sideActivity('cafeShift');
 if(type==='research')return sideActivity('research');
 if(type==='scout')return sideActivity('scout');
 if(type==='home'){state.location='home';state.selected=null;persist();return say('Narrator','Back home. The championship posters on the wall remind you why you came.');}
 if(type==='sleep'){if(state.location!=='home')return;const n=3-state.slot;advance(n);return say('Narrator','You wake up to a new day in Neo Harbor.');}
 if(type==='close'){state.selected=null;persist();return say('Narrator','The town has a rhythm of its own. You are beginning to hear it.');}
 if(type==='duel')return startDuel(id||state.selected,false);
 if(type==='event'){const e=scheduleEvent();if(!e)return;const opponents={7:'yuna',14:'reina',21:'hana',30:'reina',42:'kaede',60:'akari',75:'camila',88:'reina',90:'shiori'};return startDuel(opponents[e.day]||'reina',e);}
 if(type==='rest'||type==='practice'||type==='work'){if(state.day>90)return;if(type==='work'){state.credits+=15;log('Earned 15 credits helping around town.');}advance();return say('Narrator',type==='work'?'A productive shift. The day continues.':type==='practice'?'You review matchups and refine your strategy.':'You take a break. Other lives in the town carry on.');}
 if(type==='new'){if(confirm('Start a new season? This overwrites this browser save.')){state=defaults();for(const id of Object.keys(cast))state.bonds[id]={affection:0,trust:0,duels:0};persist();location.reload();}return;}
 if(!cast[id]||!currentPeople().includes(id))return say('Narrator','They have already moved on. Try another time.');
 const c=cast[id],bond=state.bonds[id],key=atKey(id);
 if(type==='talk'){if(!state.talked[key]){state.talked[key]=true;bond.affection++;state.relationships[id].affection++;}persist();return say(c.name,c.talk[(state.day+bond.duels+bond.affection)%c.talk.length],options(id));}
 if(type==='flirt'){if(!state.talked['flirt:'+key]){state.talked['flirt:'+key]=true;bond.affection++;state.relationships[id].affection++;state.relationships[id].attraction++;}persist();return say(c.name,c.flirt,options(id));}
 if(type==='hang'){if(state.hungOut[state.day+':'+id])return say(c.name,'I enjoyed our time today. Let us make plans another day.',options(id));state.hungOut[state.day+':'+id]=true;bond.affection+=2;bond.trust++;state.relationships[id].affection+=2;state.relationships[id].trust++;log('Spent time with '+c.name+'.');advance();state.selected=null;return say(c.name,'That was a lovely way to spend part of the day. See you around.');}
}
function duelUrl(duel){return '/classic_live.html?rpg=1&deck='+encodeURIComponent(duel.playerDeck)+'&opponent='+encodeURIComponent(duel.opponent)+'&rpgMatch='+encodeURIComponent(duel.id);}
function registerTournament(id){
 try{const entry=CIRCUIT.register(state,id);persist();say('Circuit Office','Registration confirmed for '+CIRCUIT.current(state).event.name+'. Be at the Community Center for your scheduled match.');}
 catch(error){$('notice').textContent=error.message;}
}
function startTournamentRound(){
 const entry=CIRCUIT.dueMatch(state);if(!entry)return;
 return startDuel(entry.npc,null,entry);
}
function startDuel(id,exhibition=null,tournament=null){
 if(state.pendingDuel||state.day>90||!cast[id]||(!exhibition&&!tournament&&!currentPeople().includes(id)))return;
 if(state.playerDeck==='custom'&&!state.collection.customDeck){$('notice').textContent='Save a collection-built 60-card deck first.';return;}
 if(state.playerDeck==='custom')localStorage.setItem('neoCampusCustomGymDeck',JSON.stringify(state.collection.customDeck));
 const c=cast[id],eventKey=exhibition?exhibition.day+':'+exhibition.title:null;
 state.pendingDuel={id:'npc-'+id+'-'+state.day+'-'+state.slot+'-'+state.results.length+'-'+Math.random().toString(36).slice(2,10),npc:id,day:state.day,slot:state.slot,
  opponent:WORLD.deckFor(id,state.day)||c.deck,playerDeck:state.playerDeck,resolved:false,eventKey,eventReward:exhibition?exhibition.reward:0,
  eventTitle:exhibition?exhibition.title:null,tournamentId:tournament?tournament.event.id:null,tournamentRound:tournament?tournament.number:null};
 persist();$('duel').hidden=false;$('battle').src=duelUrl(state.pendingDuel);
}
window.addEventListener('message',ev=>{if(ev.origin!==location.origin||ev.source!==$('battle').contentWindow)return;const msg=ev.data,duel=state.pendingDuel;if(!msg||msg.type!=='neo-rpg-duel-finished'||!duel||duel.resolved||msg.matchId!==duel.id||![0,1].includes(msg.winner))return;duel.resolved=true;const won=msg.winner===0,c=cast[duel.npc],bond=state.bonds[duel.npc];state.results.push({id:duel.id,npc:duel.npc,won,day:duel.day});bond.duels++;bond.trust+=won?2:1;state.relationships[duel.npc].duels++;state.relationships[duel.npc].trust+=won?2:1;state.relationships[duel.npc].respect+=won?2:1;state.points+=won?3:1;state.credits+=won?15:5;
let tournamentMessage='';
if(duel.tournamentId){
 try{
  const finish=CIRCUIT.recordMatch(state,duel.id,won);
  if(finish.ended)tournamentMessage=finish.won?'You won the '+finish.name+'!':'You were eliminated from the '+finish.name+'.';
  else tournamentMessage='Round '+finish.round+' complete. Your next tournament match is scheduled for Day '+finish.next.day+'.';
  log(tournamentMessage);
 }catch(error){log('Tournament update error: '+error.message);}
}
if(duel.eventKey&&!state.eventsDone[duel.eventKey]){state.eventsDone[duel.eventKey]={won,day:duel.day};if(won)state.points+=duel.eventReward;log('Played '+duel.eventTitle+(won?' — victory.':' — defeat.'));}if(duel.npc==='reina'){state.reinaDuels=bond.duels;state.reinaTrust=bond.trust;}log('Day '+duel.day+': '+(won?'Defeated ':'Lost to ')+c.name+'.');state.pendingDuel=null;advance();state.selected=null;$('duel').hidden=true;$('battle').src='about:blank';say(duel.tournamentId?'Tournament Desk':c.name,duel.tournamentId?tournamentMessage:(won?c.duelWin:c.duelLose));});

function sideActivity(type){
 if(state.activeStory||state.pendingDuel||state.day>90)return;
 const required={cafeShift:'cafe',research:'library',scout:'park'}[type];
 if(state.location!==required)return;
 const key=state.day+':'+type;
 if(state.activityDone[key])return say('Narrator','You already completed that activity today.');
 state.activityDone[key]=true;
 if(type==='cafeShift'){
  state.credits+=12;
  const hana=currentPeople().includes('hana')?' Hana helps you balance the trays without dropping a single cup.':'';
  log('Earned 12 credits helping at The Rest Stop.');advance();
  return say('Café Counter','Another shift finished. You earn 12 credits.'+hana);
 }
 if(type==='research'){
  state.practiceInsights++;let gain=0;
  if(state.practiceInsights%3===0){gain=2;state.points+=gain;}
  log('Studied match notes at the library'+(gain?' and earned 2 circuit points.':'.'));
  advance();return say('Town Library',gain?'Your research starts to pay off: +2 circuit points.':'You discover new strategies. Three study sessions turn into useful tournament preparation.');
 }
 const present=currentPeople().filter(id=>state.relationships[id]?.affection>0);
 const friend=present[0];
 const result=friend?'You notice '+cast[friend].name+' also enjoys this quiet spot.':'You hear a few regulars discussing upcoming matches.';
 state.practiceInsights++;log('Spent the period scouting opportunities along the river.');
 advance();return say('Riverside Park',result+' You take a few useful notes for later.');
}
function arcadeStart(){
 if(state.location!=='arcade'||state.activeStory||state.pendingDuel||state.day>90)return;
 if(state.activityDone[state.day+':arcade'])return say('Arcade Host','You already entered today’s high-score challenge. Try again another day.');
 return say('Arcade Host','The high-score cabinet has a new challenge. A steady run is safe; an aggressive run can earn a bigger prize.',[
 ['Play it safe · ⏳ 1 period','arcade:safe'],
 ['Go for the record · ⏳ 1 period','arcade:risk'],
 ['Maybe later','close']
 ]);
}
function arcadeFinish(option){
 if(state.location!=='arcade'||state.activeStory||state.pendingDuel||state.day>90||!['safe','risk'].includes(option))return;
 const key=state.day+':arcade';if(state.activityDone[key])return;
 state.activityDone[key]=true;
 const duels=state.results.length,success=option==='safe'||((state.day*13+duels*7+state.slot*5)%5)>=2;
 const reward=option==='safe'?8:success?20:3;
 state.credits+=reward;
 if(success&&currentPeople().includes('yuna')){state.relationships.yuna.affection++;state.bonds.yuna.affection++;}
 log('Played the Pixel Palace high-score challenge. Earned '+reward+' credits.');
 advance();
 return say('Arcade Host',success?'Your score lights up the screen. You earn '+reward+' credits!':'Not quite a record, but the arcade gives you '+reward+' participation credits.');
}

function openCalendar(){
 const root=$('calendarEntries');root.replaceChildren();
 const heading=document.createElement('h3');heading.textContent='Circuit Fixtures';root.append(heading);
 for(const e of CIRCUIT.standing(state).filter(e=>e.day>=state.day)){
  const p=document.createElement('div');p.className='calendar-entry';
  p.textContent='DAY '+e.day+' · '+e.name+' · '+e.threshold+' circuit points · Community Center';root.append(p);
 }
 for(const e of eventCards.filter(e=>e.day>=state.day&&![30,60,88,90].includes(e.day)).slice(0,5)){
  const p=document.createElement('div');p.className='calendar-entry';
  p.textContent='DAY '+e.day+' · '+periods[e.slot]+' · '+e.title+' · '+places[e.place][0];root.append(p);
 }
 const label=document.createElement('h3');label.textContent='Your Contacts · Next Known Sighting';root.append(label);
 let found=0;
 for(const [id,c] of Object.entries(cast)){
  if(!state['met_'+id]&&!state.flags['met_'+id])continue;
  const next=WORLD.nextSighting(state,cast,id,7);
  const row=document.createElement('p');row.className='calendar-entry';
  row.textContent=c.name+' · '+(next?'Day '+next.day+', '+periods[next.slot]+' at '+places[next.place][0]:'No confirmed public schedule this week');
  root.append(row);found++;
 }
 if(!found){const p=document.createElement('p');p.className='empty-note';p.textContent='Speak to a character to add their public routine to this notebook.';root.append(p);}
 const info=document.createElement('p');info.className='empty-note';info.textContent='Personal plans and secret encounters are not announced on the public calendar.';root.append(info);
 $('calendarDialog').showModal();
}
function makeAvatar(id,size=''){
 const img=document.createElement('img');img.src='/rpg-assets/'+id+'.png';img.alt=cast[id].name;img.loading='lazy';
 img.onerror=()=>{img.style.display='none';const span=document.createElement('span');span.className='avatar-fallback';span.textContent=cast[id].name.split(' ').map(x=>x[0]).join('');img.parentElement.append(span);};
 return img;
}

let cardCatalog=new Map(),marketReady=false;
const currentPool=()=>{
 const sets=state.day<31?['base1']:state.day<61?['base1','base2']:['base1','base2','neo1'];
 return new Map([...cardCatalog].filter(([id])=>sets.some(set=>id.startsWith(set+'-'))));
};
async function initMarket(){
 try{
  const urls=['/cards/base1.json','/cards/base2.json','/cards/neo1.json','/api/classic/decklist?id=blackout'];
  const responses=await Promise.all(urls.map(url=>fetch(url)));
  if(responses.some(r=>!r.ok))throw Error('One or more card catalog files are unavailable');
  const [base,jungle,neo,starter]=await Promise.all(responses.map(r=>r.json()));
  cardCatalog=MARKET.catalog([...base,...jungle,...neo]);
  MARKET.seedStarter(state,starter.cards);
  marketReady=true;persist();render();renderMarket();
 }catch(error){$('marketStatus').textContent='Card collection could not load: '+error.message;}
}
function marketMessage(text){$('marketStatus').textContent=text;}
function renderMarket(){
 const c=MARKET.normalize(state),pool=currentPool();
 $('marketShop').hidden=state.location!=='shop';
 $('marketBuyPack').disabled=!marketReady||state.location!=='shop'||state.credits<MARKET.PACK_PRICE;
 $('marketSingles').replaceChildren();
 if(marketReady&&state.location==='shop'){
  for(const card of MARKET.singles(state,pool)){
   const b=document.createElement('button');
   b.textContent=card.name+' · '+card.price+' credits';
   b.disabled=state.credits<card.price;
   b.onclick=()=>{
    try{MARKET.buySingle(state,card.id,pool);persist();marketMessage('Purchased '+card.name+' for your collection.');render();renderMarket();}
    catch(error){marketMessage(error.message);}
   };
   $('marketSingles').append(b);
  }
 }
 $('draftCount').textContent=MARKET.sum(c.draft)+' / 60';
 $('marketSaveDeck').disabled=!marketReady||MARKET.validateDeck(state,cardCatalog).length>0;
 $('marketCards').replaceChildren();
 for(const [id,amount] of Object.entries(c.owned).sort((a,b)=>(cardCatalog.get(a[0])?.name||a[0]).localeCompare(cardCatalog.get(b[0])?.name||b[0]))){
  const item=cardCatalog.get(id);if(!item)continue;
  const row=document.createElement('div');row.className='market-card';
  const info=document.createElement('div');info.className='market-card-name';
  const name=document.createElement('strong');name.textContent=item.name;
  const owned=document.createElement('small');owned.textContent='Owned '+amount+' · In deck '+(c.draft[id]||0);
  info.append(name,owned);
  const buttons=document.createElement('div');buttons.className='market-card-actions';
  for(const [text,delta] of [['−',-1],['+',1]]){
   const b=document.createElement('button');b.textContent=text;
   b.disabled=delta===-1?!c.draft[id]:MARKET.sum(c.draft)>=60||(c.draft[id]||0)>=amount;
   b.onclick=()=>{
    try{MARKET.adjustDraft(state,id,delta,cardCatalog);persist();renderMarket();}catch(error){marketMessage(error.message);}
   };
   buttons.append(b);
  }
  row.append(info,buttons);$('marketCards').append(row);
 }
}
function openMarket(){
 if(!['home','shop'].includes(state.location)||state.activeStory||state.pendingDuel)return;
 marketMessage(marketReady?'Choose cards you own and build a 60-card deck.':'Loading your starter deck and card catalog…');
 renderMarket();$('marketDialog').showModal();
}
function buyMarketPack(){
 if(!marketReady||state.location!=='shop')return;
 try{
  const opened=MARKET.buyPack(state,currentPool());
  $('packReveal').replaceChildren();
  for(const item of opened){const el=document.createElement('span');el.className='badge-card';el.textContent=item.name;$('packReveal').append(el);}
  log('Opened a card bundle at The Lucky Draw.');persist();marketMessage('You received '+opened.length+' owned cards.');render();renderMarket();
 }catch(error){marketMessage(error.message);}
}
function saveMarketDeck(){
 if(!marketReady)return;
 try{
  const ids=MARKET.saveDeck(state,cardCatalog);
  localStorage.setItem('neoCampusCustomGymDeck',JSON.stringify(ids));persist();
  const select=$('deckPicker');let opt=[...select.options].find(o=>o.value==='custom');
  if(!opt){opt=document.createElement('option');opt.value='custom';opt.textContent='My collection deck · 60 cards';select.append(opt);}
  select.value='custom';marketMessage('Your 60-card collection deck is active for the next duel.');render();
 }catch(error){marketMessage(error.message);}
}


function renderFinale(){
 const root=$('finaleChoices');root.replaceChildren();
 const info=FINALE.summary(state);
 $('finaleTitle').textContent=info.title;
 $('finaleCompetitive').textContent=info.competition;
 $('finaleRelationship').textContent=info.intimate;
 if(state.finale?.choice){
  $('finaleQuestion').textContent='Your next chapter';
  $('finaleClosing').textContent=FINALE.choose(state,state.finale.choice).closing;
  $('finaleNewGame').hidden=false;
 }else{
  $('finaleQuestion').textContent='Choose your next chapter';
  $('finaleClosing').textContent='';
  $('finaleNewGame').hidden=true;
  for(const option of FINALE.ENDING_CHOICES){
   const btn=document.createElement('button');btn.className='event-btn';
   btn.textContent=option.title;
   const label=document.createElement('small');label.textContent=option.description;btn.append(label);
   btn.onclick=()=>{try{FINALE.choose(state,option.id);persist();renderFinale();}catch(error){$('notice').textContent=error.message;}};
   root.append(btn);
  }
 }
}
function openFinale(){
 if(state.day<=90||state.activeStory||state.pendingDuel)return;
 renderFinale();$('finaleDialog').showModal();
}
function startNewGamePlus(){
 if(!state.finale?.choice)return;
 if(!confirm('Start New Game+? Story and relationships will reset. Your collected cards will carry over.'))return;
 try{state=FINALE.newGamePlus(state,defaults);STORY.normalize(state);WORLD.normalize(state);CIRCUIT.normalize(state);MARKET.normalize(state);persist();location.reload();}
 catch(error){$('notice').textContent=error.message;}
}

function render(){
 const ended=state.day>90,locked=!!state.activeStory||!!state.pendingDuel;
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
  b.textContent=glyph+'  '+name;b.disabled=locked;b.onclick=()=>{state.location=id;state.selected=null;persist();say('Narrator',detail)};
  const status=document.createElement('span');status.className='place-status';const present=WORLD.peopleAt(state,cast,id,STORY.available(state,id));
  status.textContent=id===state.location?'HERE'+(present.length?' · '+present.length:''):present.length?present.length+' HERE':'›';b.append(status);$('places').append(b);
 }
 $('placeTitle').textContent=places[state.location][0];$('placeDetail').textContent=places[state.location][1];
 const bgFiles={home:'home.jpg',shop:state.slot===2?'card-shop-evening.png':'card-shop-day.png',arcade:'arcade.jpg',park:'park.jpg',cafe:'cafe.jpg',center:'center.jpg',library:'library.jpg'};
 $('scene').style.backgroundImage="linear-gradient(0deg,#090b18ec 0%,#090b1860 80%),url('/rpg-assets/"+bgFiles[state.location]+"')";
 const showingStory=state.activeStory?STORY.byId(state.activeStory.id):null;
 const portraitId=showingStory?.npc||state.selected,portraitRoot=$('portrait');portraitRoot.replaceChildren();
 if(portraitId&&cast[portraitId])portraitRoot.append(makeAvatar(portraitId));
 $('homeBanner').hidden=state.location!=='home'||!!portraitId;
 $('homeBanner').textContent='YOUR APARTMENT  ·  DAY '+state.day+'  ·  '+periods[state.slot]+' — Prepare your deck, review your plans or rest.';
 let shown=showingStory?renderStory():scene;
 $('speaker').textContent=shown?.speaker||'Narrator';$('line').textContent=shown?.line||'The town is waiting.';$('choices').replaceChildren();
 for(const [label,action] of shown.choices||[]){
  const b=document.createElement('button');b.className='choice'+(action==='storyFinish'?' finish':'');b.textContent=label;
  if(action.startsWith('storyChoice:')){
   const event=STORY.byId(state.activeStory.id),chosen=event.choices[Number(action.split(':')[1])],bond=state.relationships[event.npc];
   b.disabled=chosen.kind==='commit'&&((!!state.partner&&state.partner!==event.npc)||bond.trust<3||bond.affection<6);
   if(b.disabled)b.title='You need a stronger bond or you already have a partner.';
  }
  b.onclick=()=>act(action);$('choices').append(b);
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
 $('collectionPanel').replaceChildren();
 const collection=MARKET.normalize(state),summary=document.createElement('p');summary.className='collection-summary';
 summary.textContent=(collection.starterReady?MARKET.sum(collection.owned):'Loading')+' owned cards · '+state.credits+' credits';
 $('collectionPanel').append(summary);
 if(state.location==='home'||state.location==='shop'){
  const action=document.createElement('button');action.className='activity';
  action.textContent=state.location==='shop'?'◈ Shop cards & edit deck':'▤ Edit collection deck';
  action.disabled=locked;action.onclick=openMarket;$('collectionPanel').append(action);
 }
 $('circuitPanel').replaceChildren();
 const active=CIRCUIT.current(state),due=CIRCUIT.dueMatch(state),availableRegistration=CIRCUIT.registration(state);
 if(active){
  const p=document.createElement('p');p.className='circuit-progress';
  p.textContent=active.event.name+' · '+active.active.wins+'/'+active.event.rounds.length+' wins';$('circuitPanel').append(p);
  const next=active.round,info=document.createElement('p');info.className='empty-note';
  info.textContent=next?'Next: Day '+next.day+' · '+periods[next.slot]+' · '+cast[next.npc].name:'Season event complete';
  $('circuitPanel').append(info);
  if(due){const b=document.createElement('button');b.className='event-btn';b.textContent='🏆 Play round '+due.number+' / '+due.total+' · ⏳ 1 period';b.disabled=locked;b.onclick=()=>act('tmatch');$('circuitPanel').append(b);}
 }else if(availableRegistration){
  const e=availableRegistration,b=document.createElement('button');b.className='event-btn';
  b.textContent='Register: '+e.name+' · '+e.threshold+' points needed';b.disabled=locked||state.points<e.threshold;
  b.onclick=()=>act('tregister:'+e.id);$('circuitPanel').append(b);
  if(state.points<e.threshold){const p=document.createElement('p');p.className='empty-note';p.textContent='Earn more points in casual duels and exhibitions.';$('circuitPanel').append(p);}
 }else{
  const next=CIRCUIT.standing(state).find(e=>!e.completed&&e.day>=state.day);
  const p=document.createElement('p');p.className='empty-note';p.textContent=next?'Next: Day '+next.day+' · '+next.name+' · '+next.threshold+' points required':'No future tournaments available.';$('circuitPanel').append(p);
 }
 $('townBulletin').replaceChildren();
 const notices=(state.world?.notices||[]).slice(0,3);
 if(notices.length){for(const x of notices){const p=document.createElement('p');p.className='bulletin-line';p.textContent='DAY '+x.day+' · '+x.text.replace(/\b(hana|reina|shiori|yuna|akari|camila|marina|kaede)\b/gi,s=>cast[s]?.name||s);$('townBulletin').append(p);}}
 else {const p=document.createElement('p');p.className='empty-note';p.textContent='Local results and town news will appear here as the days pass.';$('townBulletin').append(p);}
 $('storyEvents').replaceChildren();const stories=eligibleStories();
 for(const e of stories){
  const b=document.createElement('button');b.className='event-btn';b.disabled=locked;b.textContent='✦  '+e.title+' · ⏳ 1 period';
  const small=document.createElement('small');small.textContent=cast[e.npc].name+' · limited-time encounter';b.append(small);b.onclick=()=>startStory(e.id);$('storyEvents').append(b);
 }
 if(!stories.length){const x=document.createElement('p');x.className='empty-note';x.textContent='No special story encounter right now.';$('storyEvents').append(x);}
 $('activities').replaceChildren();const e=scheduleEvent();
 const items=[...(e?[[e.title+' · ⏳ 1 period · +'+e.reward+' pts','event']]:[]),
 [state.location==='home'?'Rest at home · ⏳ 1 period':'Wait one period · ⏳ 1 period','rest'],
 ...(state.location==='home'?[['Sleep until morning · ⏳ '+(3-state.slot)+' period(s)','sleep']]:[]),
 ...(state.location==='shop'?[['Help at shop · ⏳ 1 period · +15 credits','work']]:[]),
 ...(state.location==='arcade'?[['Arcade high-score challenge · ⏳ 1 period','arcadeStart']]:[]),
 ...(state.location==='cafe'?[['Help at the café · ⏳ +12 credits','cafeShift']]:[]),
 ...(state.location==='library'?[['Study match reports · ⏳ 1 period','research']]:[]),
 ...(state.location==='park'?[['Scout the riverside · ⏳ 1 period','scout']]:[]),
 ['Study deck strategy · ⏳ 1 period','practice'],['Calendar · free','calendar'],['New campaign','new']];
 for(const [label,action] of items){
  const b=document.createElement('button');b.className='activity';b.textContent=label;b.disabled=(ended&&action!=='new'&&action!=='calendar')||(locked&&action!=='calendar');b.onclick=()=>act(action);$('activities').append(b);
 }
 $('journal').replaceChildren();const stats=document.createElement('p');stats.className='stats';stats.textContent='🏆 '+state.points+' circuit points   ·   ◈ '+state.credits+' credits';$('journal').append(stats);
 for(const e of eventCards.filter(e=>e.day>=state.day).slice(0,2)){const p=document.createElement('p');p.textContent='DAY '+e.day+' · '+e.title+' ('+periods[e.slot]+')';$('journal').append(p)}
 for(const note of state.journal.slice(0,3)){const p=document.createElement('p');p.textContent='• '+note;$('journal').append(p)}
 $('notice').textContent=state.activeStory?'Story in progress: complete this scene to continue.':locked?'Your duel is in progress.':'Travel & talk are free · ⏳ actions advance time';
 if($('deckPicker')?.options.length)$('deckPicker').value=state.playerDeck;
 $('endSeason').hidden=!ended;$('endSeason').replaceChildren();
 if(ended){
  const p=document.createElement('p');p.textContent='The ninety-day season has ended. Your story has an ending to discover.';
  const b=document.createElement('button');b.className='event-btn';b.textContent='View your season ending';b.onclick=openFinale;
  $('endSeason').append(p,b);
 }
}

$('quickNext').onclick=()=>act('rest');$('quickHome').onclick=()=>act('home');$('calendarBtn').onclick=openCalendar;$('calendarClose').onclick=()=>$('calendarDialog').close();
$('finaleClose').onclick=()=>$('finaleDialog').close();
$('finaleNewGame').onclick=startNewGamePlus;
$('marketClose').onclick=()=>$('marketDialog').close();
$('marketBuyPack').onclick=buyMarketPack;
$('marketSaveDeck').onclick=saveMarketDeck;
$('save').onclick=()=>{persist();$('notice').textContent='Campaign saved in this browser.'};
async function initDecks(){try{const res=await fetch('/api/classic/decks');if(!res.ok)throw Error('Could not load decks');const data=await res.json(),select=$('deckPicker');for(const d of data.decks.filter(x=>x.id!=='custom'||!!state.collection.customDeck)){const o=document.createElement('option');o.value=d.id;o.textContent=d.name;select.append(o)}if([...select.options].some(o=>o.value===state.playerDeck))select.value=state.playerDeck;else{select.value='blackout';state.playerDeck='blackout'}select.onchange=()=>{state.playerDeck=select.value;persist()};}catch(e){$('notice').textContent='Deck list unavailable: '+e.message;}}
render();initDecks();initMarket();
if(state.day>90&&!state.flags.finaleOffered&&!state.pendingDuel){
 state.flags.finaleOffered=true;persist();openFinale();
}
if(state.pendingDuel){$('duel').hidden=false;$('battle').src=duelUrl(state.pendingDuel);}
})();