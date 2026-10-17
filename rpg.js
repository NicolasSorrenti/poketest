'use strict';(()=>{
const KEY='neoHarborRpgV1',periods=['Morning','Afternoon','Evening'],places={home:['Your Apartment','A temporary home for a season you intend to win.'],shop:['The Lucky Draw','The center of the local card-game scene.'],arcade:['Pixel Palace','Arcade cabinets, challengers and loud music.'],park:['Riverside Park','A quiet stretch of the Neo Harbor waterfront.'],cafe:['The Rest Stop','Coffee, conversation and colorful rumors.'],center:['Community Center','The circuit schedule and the official tournament board.']};
const $=id=>document.getElementById(id);
const fresh=()=>({day:1,slot:0,location:'home',metReina:false,reinaTrust:0,reinaDuels:0,results:[],flags:{intro:false},journal:['Arrived in Neo Harbor. The 90-day championship circuit awaits.'],pendingDuel:null});
let state;try{state=JSON.parse(localStorage.getItem(KEY))||fresh();if(!Number.isInteger(state.day)||state.day<1||state.day>91)throw Error('bad save')}catch{state=fresh()}
let scene={speaker:'Narrator',line:'Ninety days. One championship. You came to Neo Harbor to win—although the town might have other plans.',choices:[]};
const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));const log=t=>{state.journal.unshift(t);state.journal=state.journal.slice(0,12)};
function changeTime(cost=1){for(let i=0;i<cost;i++){state.slot++;if(state.slot>=3){state.slot=0;state.day++}}if(state.day>90){state.day=91;scene={speaker:'Narrator',line:'The season is over. This prototype ends here; the full finale is coming in a future milestone.',choices:[]}}persist()}
function speak(speaker,line,choices=[]){scene={speaker,line,choices};render()}
const reinaHere=()=>state.location==='shop'&&state.day<=90&&((state.day%7!==0&&state.slot===1)||(state.day%7===0&&state.slot===2));
function encounter(){state.metReina=true;state.flags.intro=true;persist();speak('Reina Kurogane',state.reinaDuels?'Back again? If you want another match, I won\'t go easy.':'You are the newcomer. I expected someone taller. Did you come all this way just to look at cards?',[
 ['Challenge her','duel'],['Answer confidently','flirt'],['Ask about the town','town'],['Leave','close']]);}
function act(action){
 if(action==='duel')return beginDuel();
 if(action==='flirt'){state.reinaTrust++;persist();return speak('Reina Kurogane','Confidence is cute. It will be more convincing after you survive a few turns against me.',[['Challenge Reina','duel'],['See you around','close']]);}
 if(action==='town')return speak('Reina Kurogane','The Lucky Draw hosts the regulars. Bigger matches are posted at the Community Center. Watch the calendar if you want to get anywhere.',[['Challenge Reina','duel'],['Thanks','close']]);
 if(action==='close')return speak('Narrator','The rest of the town is waiting.');
 if(action==='rest'){changeTime();return speak('Narrator','You take some time to recover. Outside, the town continues with its day.')}
 if(action==='work'){changeTime();return speak('Narrator','You help around the shop for a while. (Money and inventory are coming in the economy milestone.)')}
 if(action==='practice'){changeTime();return speak('Narrator','You spend the period reviewing matchups and tuning your game plan.')}
 if(action==='new'){if(confirm('Start a new 90-day campaign? This overwrites your current RPG save.')){state=fresh();persist();location.reload()}}
}
function beginDuel(){if(state.pendingDuel)return;state.pendingDuel={id:'reina-'+state.day+'-'+state.slot+'-'+state.reinaDuels,day:state.day,slot:state.slot,opponent:'brushfire',resolved:false};persist();$('duel').hidden=false;$('battle').src='/classic_live.html?rpg=1&opponent=brushfire&deck=blackout';}
window.addEventListener('message',ev=>{if(ev.origin!==location.origin||ev.source!==$('battle').contentWindow)return;const msg=ev.data;if(!msg||msg.type!=='neo-rpg-duel-finished'||!state.pendingDuel||state.pendingDuel.resolved)return;const duel=state.pendingDuel;duel.resolved=true;const won=msg.winner===0;state.results.push({id:duel.id,won,day:duel.day});state.reinaDuels++;state.reinaTrust+=won?2:1;log('Day '+duel.day+': '+(won?'Defeated':'Lost to')+' Reina Kurogane.');state.pendingDuel=null;changeTime();$('duel').hidden=true;$('battle').src='about:blank';speak('Reina Kurogane',won?'Okay. Maybe you ARE worth keeping an eye on. Don\'t let it go to your head.':'You have potential. Your opening needs work, though. Come back when you have a better plan.');});
function render(){const ended=state.day>90;$('day').textContent='DAY '+String(Math.min(90,state.day)).padStart(2,'0')+' / 90';$('period').textContent=ended?'CAMPAIGN END':periods[state.slot].toUpperCase();$('places').replaceChildren();
 for(const [id,entry] of Object.entries(places)){const b=document.createElement('button');b.textContent=entry[0];b.className=id===state.location?'selected':'';b.onclick=()=>{state.location=id;persist();speak('Narrator',places[id][1])};$('places').append(b)}
 $('placeTitle').textContent=places[state.location][0];$('placeDetail').textContent=places[state.location][1];
 const bg={shop:'/rpg-assets/card-shop-day.png',home:null};$('scene').style.backgroundImage=state.location==='shop'?"linear-gradient(0deg,#090b18bb,#090b1830),url('"+bg.shop+"')":'';
 $('portrait').style.backgroundImage=reinaHere()?"url('/rpg-assets/reina.png')":'none';
 $('speaker').textContent=scene.speaker;$('line').textContent=scene.line;$('choices').replaceChildren();
 scene.choices.forEach(([label,action])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>act(action);$('choices').append(b)});
 $('people').replaceChildren();if(reinaHere()&&!ended){const b=document.createElement('button');b.className='sidebtn';b.textContent='⚡ Reina Kurogane · Challenger';b.onclick=encounter;$('people').append(b)}else{$('people').textContent='No major characters available right now.'}
 $('activities').replaceChildren();const activities=[['End this period','rest'],...(state.location==='shop'?[['Help at the shop','work']]:[]),['Study deck strategy','practice'],['New campaign','new']];for(const [label,action] of activities){const b=document.createElement('button');b.className='sidebtn';b.textContent=label;b.disabled=ended&&action!=='new';b.onclick=()=>{act(action);render()};$('activities').append(b)}
 $('journal').textContent=state.journal.slice(0,5).join(' • ');$('notice').textContent='Reina appears at the card shop most afternoons. Challenges use the existing Neo Campus duel engine.';}
$('save').onclick=()=>{persist();$('notice').textContent='Campaign saved locally in this browser.'};
render();if(state.pendingDuel){$('duel').hidden=false;$('battle').src='/classic_live.html?rpg=1&opponent=brushfire&deck=blackout';}
})();