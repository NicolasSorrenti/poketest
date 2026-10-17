'use strict';
(()=>{
const $=id=>document.getElementById(id),KEY='neoHarborRpgV1';
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
const eventCards=[{day:7,slot:1,place:'arcade',title:'Arcade Friendly Cup',reward:7},{day:14,slot:1,place:'center',title:'Club Exhibition',reward:9},{day:21,slot:2,place:'shop',title:'Card Shop Night',reward:8},{day:30,slot:1,place:'center',title:'Neighborhood Cup',reward:15},{day:42,slot:1,place:'arcade',title:'Open Challenge',reward:10},{day:60,slot:1,place:'center',title:'Regional Qualifier',reward:22},{day:75,slot:2,place:'shop',title:'Final Practice Meet',reward:12},{day:88,slot:1,place:'center',title:'Championship Opening',reward:20},{day:90,slot:1,place:'center',title:'Championship Finals',reward:25}];
function defaults(){return {day:1,slot:0,location:'home',metReina:false,reinaTrust:0,reinaDuels:0,results:[],flags:{intro:false},journal:['The 90-day season begins.'],pendingDuel:null,bonds:{},talked:{},hungOut:{},eventsDone:{},points:0,credits:80,playerDeck:'blackout',selected:null,ended:false}}
let state;try{state=JSON.parse(localStorage.getItem(KEY))||defaults();if(!Number.isInteger(state.day)||state.day<1||state.day>91)throw Error('Invalid save');}catch{state=defaults()}
for(const [k,v] of Object.entries(defaults()))if(state[k]===undefined)state[k]=v;
for(const id of Object.keys(cast)){if(!state.bonds[id])state.bonds[id]={affection:0,trust:0,duels:0};}
const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));
const log=t=>{state.journal.unshift(t);state.journal=state.journal.slice(0,25)};
let scene={speaker:'Narrator',line:'Ninety days. One championship. You came to Neo Harbor to win. Everyone else has their own plans.',choices:[]};
const atKey=(id)=>state.day+':'+state.slot+':'+id;
function advance(n=1){for(let i=0;i<n;i++){state.slot++;if(state.slot>=3){state.slot=0;state.day++;}}if(state.day>90){state.day=91;state.ended=true;log('The Neo Harbor championship season has ended.');}persist();}
function say(speaker,line,choices=[]){scene={speaker,line,choices};render();}
function currentPeople(){if(state.day>90)return [];const weekday=(state.day-1)%7;return Object.entries(cast).filter(([id,c])=>state.day>=(c.start||1)&&c.locs.includes(state.location)&&c.slots.includes(state.slot)&&c.days.includes(weekday)).map(([id])=>id);}
function selectPerson(id){if(!cast[id]||!currentPeople().includes(id))return;const c=cast[id],first=!state['met_'+id]&&!((id==='reina')&&state.metReina);state['met_'+id]=true;if(id==='reina')state.metReina=true;state.selected=id;persist();say(c.name,first?c.intro:c.repeat,options(id));}
function options(id){const c=cast[id],key=atKey(id);return [
 [state.talked[key]?'Talked this period':'Talk','talk:'+id],
 ['Spend time together','hang:'+id],
 ['Challenge to a duel · 1 period','duel:'+id],
 ['Playful remark','flirt:'+id],
 ['Goodbye','close']
 ];}
function scheduleEvent(){return eventCards.find(e=>e.day===state.day&&e.slot===state.slot&&e.place===state.location&&!state.eventsDone[e.day+':'+e.title]);}
function act(action){
 const [type,id]=action.split(':');
 if(type==='close'){state.selected=null;persist();return say('Narrator','The town has a rhythm of its own. You are beginning to hear it.');}
 if(type==='duel')return startDuel(id||state.selected,false);
 if(type==='event'){const e=scheduleEvent();if(!e)return;state.eventsDone[e.day+':'+e.title]=true;state.points+=e.reward;log('Attended '+e.title+' (+'+e.reward+' circuit points).');advance(e.day===90?2:1);return say('Tournament Board','You competed in '+e.title+'. The exhibition result has been recorded. Full tournament brackets are planned for a later release.');}
 if(type==='rest'||type==='practice'||type==='work'){if(state.day>90)return;if(type==='work'){state.credits+=15;log('Earned 15 credits helping around town.');}advance();return say('Narrator',type==='work'?'A productive shift. The day continues.':type==='practice'?'You review matchups and refine your strategy.':'You take a break. Other lives in the town carry on.');}
 if(type==='new'){if(confirm('Start a new season? This overwrites this browser save.')){state=defaults();for(const id of Object.keys(cast))state.bonds[id]={affection:0,trust:0,duels:0};persist();location.reload();}return;}
 if(!cast[id]||!currentPeople().includes(id))return say('Narrator','They have already moved on. Try another time.');
 const c=cast[id],bond=state.bonds[id],key=atKey(id);
 if(type==='talk'){if(!state.talked[key]){state.talked[key]=true;bond.affection++;}persist();return say(c.name,c.talk[(state.day+bond.duels+bond.affection)%c.talk.length],options(id));}
 if(type==='flirt'){if(!state.talked['flirt:'+key]){state.talked['flirt:'+key]=true;bond.affection++;}persist();return say(c.name,c.flirt,options(id));}
 if(type==='hang'){if(state.hungOut[state.day+':'+id])return say(c.name,'I enjoyed our time today. Let us make plans another day.',options(id));state.hungOut[state.day+':'+id]=true;bond.affection+=2;bond.trust++;log('Spent time with '+c.name+'.');advance();state.selected=null;return say(c.name,'That was a lovely way to spend part of the day. See you around.');}
}
function duelUrl(duel){return '/classic_live.html?rpg=1&deck='+encodeURIComponent(duel.playerDeck)+'&opponent='+encodeURIComponent(duel.opponent);}
function startDuel(id){if(state.pendingDuel||state.day>90||!cast[id]||!currentPeople().includes(id))return;const c=cast[id];state.pendingDuel={id:'npc-'+id+'-'+state.day+'-'+state.slot+'-'+state.results.length,npc:id,day:state.day,slot:state.slot,opponent:c.deck,playerDeck:state.playerDeck,resolved:false};persist();$('duel').hidden=false;$('battle').src=duelUrl(state.pendingDuel);}
window.addEventListener('message',ev=>{if(ev.origin!==location.origin||ev.source!==$('battle').contentWindow)return;const msg=ev.data,duel=state.pendingDuel;if(!msg||msg.type!=='neo-rpg-duel-finished'||!duel||duel.resolved||!Number.isInteger(msg.winner))return;duel.resolved=true;const won=msg.winner===0,c=cast[duel.npc],bond=state.bonds[duel.npc];state.results.push({id:duel.id,npc:duel.npc,won,day:duel.day});bond.duels++;bond.trust+=won?2:1;state.points+=won?3:1;state.credits+=won?15:5;if(duel.npc==='reina'){state.reinaDuels=bond.duels;state.reinaTrust=bond.trust;}log('Day '+duel.day+': '+(won?'Defeated ':'Lost to ')+c.name+'.');state.pendingDuel=null;advance();state.selected=null;$('duel').hidden=true;$('battle').src='about:blank';say(c.name,won?c.duelWin:c.duelLose);});
function render(){
 const ended=state.day>90;
 $('day').textContent='DAY '+String(Math.min(state.day,90)).padStart(2,'0')+' / 90';
 $('period').textContent=ended?'SEASON COMPLETE':periods[state.slot].toUpperCase();
 $('places').replaceChildren();
 for(const [id,[name,detail]] of Object.entries(places)){const b=document.createElement('button');b.textContent=name;b.className=id===state.location?'selected':'';b.onclick=()=>{state.location=id;state.selected=null;persist();say('Narrator',detail)};$('places').append(b)}
 $('placeTitle').textContent=places[state.location][0];$('placeDetail').textContent=places[state.location][1];
 const bg=state.location==='shop'?"linear-gradient(0deg,#090b18bb,#090b1830),url('/rpg-assets/card-shop-day.png')":'';$('scene').style.backgroundImage=bg;
 const portrait=state.selected==='reina'?"/rpg-assets/reina.png":null;$('portrait').style.backgroundImage=portrait?"url('"+portrait+"')":'none';
 $('speaker').textContent=scene.speaker;$('line').textContent=scene.line;
 $('choices').replaceChildren();for(const [label,action] of scene.choices){const b=document.createElement('button');b.textContent=label;b.disabled=action.startsWith('talk:')&&!!state.talked[atKey(action.slice(5))];b.onclick=()=>act(action);$('choices').append(b)}
 $('people').replaceChildren();const people=currentPeople();for(const id of people){const c=cast[id],b=document.createElement('button');b.className='sidebtn';b.textContent=c.name+' · '+c.style;b.onclick=()=>selectPerson(id);$('people').append(b)}if(!people.length)$('people').textContent='No major characters at this location right now.';
 $('activities').replaceChildren();const event=scheduleEvent();const items=[...(event?[[event.title+' · +' +event.reward+' pts','event']]:[]),['End this period','rest'],...(state.location==='shop'?[['Help at the shop · +15 credits','work']]:[]),['Study deck strategy','practice'],['New campaign','new']];
 for(const [label,action] of items){const b=document.createElement('button');b.className='sidebtn';b.textContent=label;b.disabled=ended&&action!=='new';b.onclick=()=>act(action);$('activities').append(b)}
 $('journal').replaceChildren();const stats=document.createElement('p');stats.textContent='Circuit: '+state.points+' pts · Credits: '+state.credits;stats.className='stats';$('journal').append(stats);
 const upcoming=eventCards.filter(e=>e.day>=state.day).slice(0,3);for(const e of upcoming){const p=document.createElement('p');p.textContent='Day '+e.day+' · '+e.title+' ('+periods[e.slot]+')';$('journal').append(p)}
 for(const note of state.journal.slice(0,5)){const p=document.createElement('p');p.textContent='• '+note;$('journal').append(p)}
 $('notice').textContent='Your duels use the existing Neo Campus TCG engine. Character decks are temporary presets pending unique, tested deck lists.';
 if($('deckPicker'))$('deckPicker').value=state.playerDeck;
}
$('save').onclick=()=>{persist();$('notice').textContent='Campaign saved in this browser.'};
async function initDecks(){try{const res=await fetch('/api/classic/decks');if(!res.ok)throw Error('Could not load decks');const data=await res.json(),select=$('deckPicker');for(const d of data.decks.filter(x=>x.id!=='custom')){const o=document.createElement('option');o.value=d.id;o.textContent=d.name;select.append(o)}if([...select.options].some(o=>o.value===state.playerDeck))select.value=state.playerDeck;else{select.value='blackout';state.playerDeck='blackout'}select.onchange=()=>{state.playerDeck=select.value;persist()};}catch(e){$('notice').textContent='Deck list unavailable: '+e.message;}}
render();initDecks();if(state.pendingDuel){$('duel').hidden=false;$('battle').src=duelUrl(state.pendingDuel);}
})();