'use strict';
(()=>{
const $=id=>document.getElementById(id),KEY='neoHarborRpgV1',STORY=window.NeoHarborStory,SCHEDULES=window.NeoRpgSchedules,WORLD=window.NeoRpgWorld,BRIDGE=window.NeoRpgDuelBridge;
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
 if(state.activeStory||state.activeEncounter||state.pendingDuel)return;
 const e=eligibleStories().find(e=>e.id===id);if(!e)return;
 state.selected=e.npc;state.activeStory={id:e.id,phase:'lines',index:0,choice:null};persist();render();
}
function renderStory(){
 const a=state.activeStory,e=STORY.byId(a.id);
 if(!e){state.activeStory=null;persist();return null;}
 if(a.phase==='lines'){
  const line=e.lines[Math.min(a.index,e.lines.length-1)];
  return {speaker:line.speaker==='Protagonist'?'You':cast[e.npc].name,line:line.text,choices:[[a.index<e.lines.length-1?'Continue ›':'Respond ›','storyNext']]};
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

function defaults(){return {day:1,slot:0,location:'home',metReina:false,reinaTrust:0,reinaDuels:0,results:[],flags:{intro:false},journal:['The 90-day season begins.'],pendingDuel:null,bonds:{},talked:{},hungOut:{},eventsDone:{},points:0,credits:80,playerDeck:'blackout',selected:null,ended:false,storyDone:{},storyMissed:{},relationships:{},routeOutcomes:{},partner:null,activeStory:null,activeEncounter:null,activityDone:{},encountersDone:{},focus:75,insight:0,reputation:0,preparation:0,lastDuelReceipt:null,scene:null}}
let state;try{state=JSON.parse(localStorage.getItem(KEY))||defaults();if(!Number.isInteger(state.day)||state.day<1||state.day>91)throw Error('Invalid save');}catch{state=defaults()}
for(const [k,v] of Object.entries(defaults()))if(state[k]===undefined)state[k]=v;
if(!places[state.location])state.location='home';
if(!Number.isInteger(state.slot)||state.slot<0||state.slot>2)state.slot=0;
for(const k of ['results','journal'])if(!Array.isArray(state[k]))state[k]=defaults()[k];
for(const k of ['flags','bonds','talked','hungOut','eventsDone','storyDone','storyMissed','relationships','routeOutcomes'])if(!state[k]||typeof state[k]!=='object'||Array.isArray(state[k]))state[k]={};
if(!state.pendingDuel?.id||!cast[state.pendingDuel?.npc])state.pendingDuel=null;
for(const id of Object.keys(cast)){if(!state.bonds[id])state.bonds[id]={affection:0,trust:0,duels:0};}
STORY.normalize(state);
WORLD.hydrate(state);
for(const id of Object.keys(cast)){const old=state.bonds[id],current=state.relationships[id];
 if(!state.flags['newStoryMigrated_'+id]){for(const key of ['affection','trust','duels'])current[key]=Math.max(current[key]||0,old[key]||0);
 state.flags['newStoryMigrated_'+id]=true;}
}
if(typeof state.activeStory==='string')state.activeStory=null;
STORY.recordExpiry(state);
const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));
const log=t=>{state.journal.unshift(t);state.journal=state.journal.slice(0,25)};
let scene=state.scene&&typeof state.scene.speaker==='string'&&typeof state.scene.line==='string'&&Array.isArray(state.scene.choices)?state.scene:{speaker:'Narrator',line:'Ninety days. One championship. You came to Neo Harbor to win. Everyone else has their own plans.',choices:[]};
const atKey=(id)=>state.day+':'+state.slot+':'+id;
function advance(n=1){const beforeDay=state.day,beforeSlot=state.slot;for(let i=0;i<n;i++){state.slot++;if(state.slot>=3){state.slot=0;state.day++;}}if(state.day>90){state.day=91;state.ended=true;log('The Neo Harbor championship season has ended.');}
state.selected=null;
if(state.day>beforeDay)WORLD.newDay(state,state.day-beforeDay);
const missed=STORY.recordExpiry(state);if(missed.length)log('Some opportunities in town passed while you were busy.');
persist();timeFlash(beforeDay,beforeSlot);}
function say(speaker,line,choices=[]){scene={speaker,line,choices};state.scene=scene;persist();render();}
function currentPeople(){if(state.day>90)return [];const regular=SCHEDULES.peopleAt(state.day,state.slot,state.location,eligibleStories());
for(const e of eligibleStories())if(!regular.includes(e.npc))regular.push(e.npc);
return regular;}
function selectPerson(id){if(state.activeStory||state.activeEncounter||!cast[id]||!currentPeople().includes(id))return;const c=cast[id],first=!state['met_'+id]&&!((id==='reina')&&state.metReina);state['met_'+id]=true;if(id==='reina')state.metReina=true;state.selected=id;persist();say(c.name,first?c.intro:c.repeat,options(id));}
function options(id){const key=atKey(id),spentToday=!!state.hungOut[state.day+':'+id];return [
 ['Ask about their routine · free','where:'+id],
 [state.talked[key]?'Talk again · free (bond already earned)':'Talk · free · +1 affection','talk:'+id],
 [spentToday?'Already spent time today · free':'Spend time together · ⏳ 1 period · +2 affection / +1 trust','hang:'+id],
 ['Challenge to a duel · ⏳ 1 period · earn points, credits & trust','duel:'+id],
 [state.talked['flirt:'+key]?'Playful remark again · free':'Playful remark · free · +1 affection','flirt:'+id],
 ['Goodbye · free','close']
 ];}

function showEncounter(){
 const a=state.activeEncounter,e=a&&WORLD.byEncounter(a.id);
 if(!e)return null;
 const name=e.npc?cast[e.npc].name:'Neo Harbor';
 if(a.phase==='choice')return {speaker:name,line:e.intro,choices:e.choices.map((c,i)=>[c.label,'encounterChoice:'+i])};
 const decision=e.choices[a.choice];
 return {speaker:name,line:decision.reply,choices:[['Continue · ⏳ 1 period','encounterFinish']]};
}
function startEncounter(id){
 if(state.activeStory||state.activeEncounter||state.pendingDuel||state.day>90)return;
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
 state.activeEncounter=null;log('An everyday encounter at '+places[e.place][0]+' left an impression.');
 advance();persist();
 say(e.npc?cast[e.npc].name:'Narrator',report.summary);
}
function performActivity(id){
 if(state.activeStory||state.activeEncounter||state.pendingDuel||state.day>90)return;
 let result;try{result=WORLD.doActivity(state,id,currentPeople());}
 catch(err){$('notice').textContent=err.message;return;}
 const place=state.location;
 log('Activity completed at '+places[place][0]+': '+result.summary);
 advance();persist();say(result.person?cast[result.person].name:'Narrator',result.summary+(result.person?' You also made a good impression.':''));
}

function scheduleEvent(){return eventCards.find(e=>e.day===state.day&&e.slot===state.slot&&e.place===state.location&&!state.eventsDone[e.day+':'+e.title]);}
function act(action){
 const [type,id]=action.split(':');
 if(type==='storyNext')return advanceStory();
 if(type==='storyChoice')return chooseStory(id);
 if(type==='storyFinish')return finishStory();
 if(type==='encounterChoice')return chooseEncounter(id);
 if(type==='encounterFinish')return finishEncounter();
 if(state.activeStory||state.pendingDuel||state.activeEncounter)return;
 if(type==='encounter')return startEncounter(id);
 if(type==='townActivity')return performActivity(id);
 if(type==='calendar')return openCalendar();
 if(type==='home'){state.location='home';state.selected=null;persist();return say('Narrator','Back home. The championship posters on the wall remind you why you came.');}
 if(type==='where'){const c=cast[id],visit=SCHEDULES.nextVisit(id,state.day,state.slot,[]);return say('Narrator',c.name+(visit?' is usually around '+places[visit.place][0]+' on day '+visit.day+', '+periods[visit.slot]+'.':' has no announced public visits in the coming week.'),options(id));}
 if(type==='sleep'){if(state.location!=='home')return;const n=3-state.slot;advance(n);return say('Narrator','You wake up to a new day in Neo Harbor.');}
 if(type==='close'){state.selected=null;persist();return say('Narrator','The town has a rhythm of its own. You are beginning to hear it.');}
 if(type==='duel')return startDuel(id||state.selected,false);
 if(type==='event'){const e=scheduleEvent();if(!e)return;const opponents={7:'yuna',14:'reina',21:'hana',30:'reina',42:'kaede',60:'akari',75:'camila',88:'reina',90:'shiori'};return startDuel(opponents[e.day]||'reina',e);}
 if(type==='work')return performActivity('shop_shift');
 if(type==='practice')return state.location==='library'?performActivity('library_research'):state.location==='center'?performActivity('center_scrimmage'):performActivity('home_reflect');
 if(type==='rest'){if(state.day>90)return;advance();return say('Narrator','You take a break. Other lives in the town carry on.');}
 if(type==='new'){if(confirm('Start a new season? This overwrites this browser save.')){state=defaults();for(const id of Object.keys(cast))state.bonds[id]={affection:0,trust:0,duels:0};persist();location.reload();}return;}
 if(!cast[id]||!currentPeople().includes(id))return say('Narrator','They have already moved on. Try another time.');
 const c=cast[id],bond=state.bonds[id],key=atKey(id);
 if(type==='talk'){if(!state.talked[key]){state.talked[key]=true;bond.affection++;state.relationships[id].affection++;}persist();return say(c.name,c.talk[(state.day+bond.duels+bond.affection)%c.talk.length],options(id));}
 if(type==='flirt'){if(!state.talked['flirt:'+key]){state.talked['flirt:'+key]=true;bond.affection++;state.relationships[id].affection++;state.relationships[id].attraction++;}persist();return say(c.name,c.flirt,options(id));}
 if(type==='hang'){if(state.hungOut[state.day+':'+id])return say(c.name,'I enjoyed our time today. Let us make plans another day.',options(id));state.hungOut[state.day+':'+id]=true;bond.affection+=2;bond.trust++;state.relationships[id].affection+=2;state.relationships[id].trust++;log('Spent time with '+c.name+'.');advance();state.selected=null;return say(c.name,'That was a lovely way to spend part of the day. See you around.');}
}
function duelUrl(duel){return '/classic_live.html?rpg=1&duelId='+encodeURIComponent(duel.id)+'&deck='+encodeURIComponent(duel.playerDeck)+'&opponent='+encodeURIComponent(duel.opponent);}
function startDuel(id,exhibition=null){if(state.activeStory||state.activeEncounter||state.pendingDuel||state.day>90||!cast[id]||(!exhibition&&!currentPeople().includes(id)))return;const c=cast[id];state.pendingDuel={id:'npc-'+id+'-'+state.day+'-'+state.slot+'-'+state.results.length,npc:id,day:state.day,slot:state.slot,opponent:c.deck,playerDeck:state.playerDeck,resolved:false,eventKey:exhibition?exhibition.day+':'+exhibition.title:null,eventReward:exhibition?exhibition.reward:0,eventTitle:exhibition?exhibition.title:null};persist();render();$('duel').hidden=false;$('battle').src=duelUrl(state.pendingDuel);}
window.addEventListener('message',ev=>{
 const duel=state.pendingDuel;
 if(!BRIDGE.accepts(ev,location.origin,$('battle').contentWindow,duel))return;
 const receipt=BRIDGE.settle(state,duel,ev.data.winner,cast[duel.npc].name);
 if(!receipt)return;
 for(const note of receipt.notes)log(note);
 const preparationNote=WORLD.afterDuel(state,receipt);if(preparationNote)log(preparationNote);
 state.lastDuelReceipt=receipt;state.pendingDuel=null;
 sessionStorage.removeItem(BRIDGE.sessionKey(duel.id));
 advance();$('duel').hidden=true;$('battle').src='about:blank';
 const c=cast[duel.npc];say(c.name,receipt.outcome==='Victory'?c.duelWin:receipt.outcome==='Draw'?'A hard-fought draw. Let us play again.':c.duelLose);
});
function openCalendar(){
 const root=$('calendarEntries');root.replaceChildren();
 for(const e of eventCards.filter(e=>e.day>=state.day).slice(0,8)){
  const p=document.createElement('div');p.className='calendar-entry';
  p.textContent='DAY '+e.day+' · '+periods[e.slot]+' · '+e.title+' · '+places[e.place][0];root.append(p);
 }
 const info=document.createElement('p');info.className='empty-note';info.textContent='Character plans and private encounters are discovered through play.';root.append(info);
 $('calendarDialog').showModal();
}
function makeAvatar(id,size=''){
 const img=document.createElement('img');img.src='/rpg-assets/'+id+'.png';img.alt=cast[id].name;img.loading='lazy';
 img.onerror=()=>{img.style.display='none';const span=document.createElement('span');span.className='avatar-fallback';span.textContent=cast[id].name.split(' ').map(x=>x[0]).join('');img.parentElement.append(span);};
 return img;
}
function render(){
 const ended=state.day>90,locked=!!state.activeStory||!!state.activeEncounter||!!state.pendingDuel;
 const receipt=state.lastDuelReceipt;
 $('duelReceipt').hidden=!receipt;
 if(receipt){
  $('receiptTitle').textContent=receipt.outcome.toUpperCase()+' · '+receipt.name;
  $('receiptDetails').textContent='+'+receipt.points+' circuit points · +'+receipt.credits+' credits · +'+receipt.trust+' trust'+(receipt.bonus?' (includes +'+receipt.bonus+' exhibition points)':'')+(receipt.trainingBonus?' · +'+receipt.trainingBonus+' training credits':'')+' · Time advanced one period.';
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
  const status=document.createElement('span');status.className='place-status';const count=state.day<=90?SCHEDULES.peopleAt(state.day,state.slot,id,STORY.available(state,id)).length:0;
   status.textContent=id===state.location?'HERE':count?count+' HERE':'›';b.append(status);$('places').append(b);
 }
 $('placeTitle').textContent=places[state.location][0];$('placeDetail').textContent=places[state.location][1];
 const bgFiles={home:'home.jpg',shop:state.slot===2?'card-shop-evening.png':'card-shop-day.png',arcade:'arcade.jpg',park:'park.jpg',cafe:'cafe.jpg',center:'center.jpg',library:'library.jpg'};
 $('scene').style.backgroundImage="linear-gradient(0deg,#090b18ec 0%,#090b1860 80%),url('/rpg-assets/"+bgFiles[state.location]+"')";
 const showingStory=state.activeStory?STORY.byId(state.activeStory.id):null;
 const showingEncounter=state.activeEncounter?WORLD.byEncounter(state.activeEncounter.id):null;
 const portraitId=showingStory?.npc||showingEncounter?.npc||state.selected,portraitRoot=$('portrait');portraitRoot.replaceChildren();
 if(portraitId&&cast[portraitId])portraitRoot.append(makeAvatar(portraitId));
 $('homeBanner').hidden=state.location!=='home'||!!portraitId;
 $('homeBanner').textContent='YOUR APARTMENT  ·  DAY '+state.day+'  ·  '+periods[state.slot]+' — Prepare your deck, review your plans or rest.';
 let shown=showingStory?renderStory():showingEncounter?showEncounter():scene;
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
 $('townRadar').replaceChildren();
 const elsewhere=[];
 for(const place of Object.keys(places)){
  if(place==='home'||place===state.location)continue;
  const visible=state.day<=90?SCHEDULES.peopleAt(state.day,state.slot,place,STORY.available(state,place)):[];
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
 if(!stories.length){const x=document.createElement('p');x.className='empty-note';x.textContent='No special story encounter right now.';$('storyEvents').append(x);}

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
 const items=[...(e?[[e.title+' · ⏳ 1 period · +'+e.reward+' pts if you win','event']]:[]),
 [state.location==='home'?'Rest at home · ⏳ 1 period':'Wait one period · ⏳ 1 period','rest'],
 ...(state.location==='home'?[['Sleep until morning · ⏳ '+(3-state.slot)+' period(s)','sleep']]:[]),
 ['Calendar · free','calendar'],['New campaign','new']];
 for(const [label,action] of items){
  const b=document.createElement('button');b.className='activity';b.textContent=label;b.disabled=(ended&&action!=='new'&&action!=='calendar')||(locked&&action!=='calendar');b.onclick=()=>act(action);$('activities').append(b);
 }
 $('journal').replaceChildren();const stats=document.createElement('p');stats.className='stats';stats.textContent='🏆 '+state.points+' circuit points   ·   ◈ '+state.credits+' credits';$('journal').append(stats);
 for(const e of eventCards.filter(e=>e.day>=state.day).slice(0,2)){const p=document.createElement('p');p.textContent='DAY '+e.day+' · '+e.title+' ('+periods[e.slot]+')';$('journal').append(p)}
 for(const note of state.journal.slice(0,3)){const p=document.createElement('p');p.textContent='• '+note;$('journal').append(p)}
 $('notice').textContent=state.activeStory?'Story in progress: complete this scene to continue.':state.activeEncounter?'Local encounter in progress — make your decision.':state.pendingDuel?'Your duel is in progress.':'Travel & talk are free · ⏳ actions advance time';
 $('deckPicker').disabled=locked||ended;
 if($('deckPicker')?.options.length)$('deckPicker').value=state.playerDeck;
}

$('quickNext').onclick=()=>act('rest');$('quickHome').onclick=()=>act('home');$('calendarBtn').onclick=openCalendar;$('calendarClose').onclick=()=>$('calendarDialog').close();
$('save').onclick=()=>{persist();$('notice').textContent='Campaign saved in this browser.'};
$('dismissReceipt').onclick=()=>{state.lastDuelReceipt=null;persist();render();};
document.addEventListener('keydown',e=>{if((e.key===' '||e.code==='Space')&&state.activeStory?.phase==='lines'&&!['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target?.tagName)){e.preventDefault();act('storyNext');}});
async function initDecks(){try{const res=await fetch('/api/classic/decks');if(!res.ok)throw Error('Could not load decks');const data=await res.json(),select=$('deckPicker');for(const d of data.decks.filter(x=>x.id!=='custom')){const o=document.createElement('option');o.value=d.id;o.textContent=d.name;select.append(o)}if([...select.options].some(o=>o.value===state.playerDeck))select.value=state.playerDeck;else{select.value='blackout';state.playerDeck='blackout'}select.onchange=()=>{if(state.pendingDuel||state.activeStory||state.ended){select.value=state.playerDeck;return;}state.playerDeck=select.value;persist()};}catch(e){$('notice').textContent='Deck list unavailable: '+e.message;}}
persist();render();initDecks();if(state.pendingDuel){$('duel').hidden=false;$('battle').src=duelUrl(state.pendingDuel);}
})();