// Executable, exact-text historical attack implementations added in v0.4.3.
// BATCH43_RULES is generated from the user's cached TCGdex data. No fuzzy name-only matching.
const BATCH43_RULES = new Map(__BATCH43_RULES__);
function batch43Id(a){return BATCH43_RULES.get(a.name+'\u001f'+(a.text||''))??null}
function batch43Effect(game, ix, a, source, defender, attacker, opponent){
 const p=attacker,f=opponent,u=source,v=defender,t=a.text||'';
 const C=z=>game.card(z), name=z=>C(z)?.name||'', countEnergy=(z,type)=>z.energies.filter(id=>{const c=lookup.get(id);return c?.name===type+' Energy'}).length;
 const n=(regex,fallback=0)=>Number(t.match(regex)?.[1]??fallback);
 const flip=()=>coin(`${a.name} — effect`);
 const heads=(times)=>{let k=0;for(let j=0;j<times;j++)if(coin(`${a.name} — ${j+1}/${times}`))k++;return k};
 const all=()=>[p.active,...p.bench,f.active,...f.bench].filter(Boolean);
 const own=()=>[p.active,...p.bench].filter(Boolean);
 const enemy=()=>[f.active,...f.bench].filter(Boolean);
 const spread=(units,amount)=>{for(const x of units.filter(Boolean))x.damage+=amount};
 const safeEnemyBench=()=>game.unitHasPower(f.active,'Aurora Veil')||(f.active.benchShieldUntil>0&&f.active.benchShieldUntil>=game.round)?[]:f.bench;
 const discardEnergy=(quantity,type)=>{const indices=[];for(let j=0;j<u.energies.length&&indices.length<quantity;j++)if(!type||lookup.get(u.energies[j])?.name===type+' Energy')indices.push(j);if(indices.length<quantity)return false;for(const j of indices.reverse())p.discard.push(u.energies.splice(j,1)[0]);return true};
 const moveToHand=()=>{p.hand.push(u.id,...u.under,...u.energies);const rest=p.bench.shift()||null;p.active=rest;};
 const shuffleSelf=()=>{p.deck=shuffle([...p.deck,u.id,...u.under,...u.energies]);p.active=p.bench.shift()||null;};
 const blockStatus=()=>Boolean(v.preventAttackEffects||game.unitHasPower(v,'Crystal Body'));
 let dmg=parseInt(a.damage,10)||0, ignoreWR=false,ignoreResistance=false,after=null, status=null;
 switch(ix){
 // Extra-energy and opponent-energy multipliers (each printed card is matched exactly).
 case 4:case 19: {dmg=10+10*Math.min(2,Math.max(0,u.energies.length-(a.cost||[]).length));break}
 case 58:case 215:{const type=ix===58?'Water':null;const times=type?countEnergy(u,type):u.energies.length;dmg=(ix===58?30:30)+10*heads(times);break}
 case 60:{dmg=30*heads(own().filter(x=>/^Sabrina's (Gastly|Haunter|Gengar)$/.test(name(x))).length);break}
 case 61:{dmg=Math.max(0,40-10*Math.floor(u.damage/10));break}
 case 83:{dmg=30+10*Math.floor(u.damage/10);if(!flip())u.damage+=30;break}
 case 97:{dmg=v.damage>0?40:20;break}
 case 107:{dmg=C(v)?.types?.includes('Fighting')?2*(parseInt(a.damage,10)||0):(parseInt(a.damage,10)||0);break}
 case 110:{dmg=20*heads(Math.floor(v.damage/10));break}
 case 121:{dmg=v.damage?10:40;break}
 case 123:{dmg=flip()?20*Math.floor(u.damage/10):0;break}
 case 140:{dmg=30*own().filter(x=>name(x).includes('Bellossom')).length;break}
 case 141:{const ids=p.discard.filter(id=>energy(lookup.get(id)));dmg=10+10*ids.length;after=()=>{for(const id of ids){const j=p.discard.indexOf(id);if(j>=0)p.deck.push(...p.discard.splice(j,1))}p.deck=shuffle(p.deck)};break}
 case 154:{dmg=20*heads(own().length);break}
 case 166:{dmg=10+u.damage;u.damage+=20;break}
 case 180:{dmg=30+10*v.energies.length;break}
 case 187:{dmg=10*v.energies.length;after=dealt=>{u.damage=Math.max(0,u.damage-Math.ceil(dealt/10)*10)};break}
 case 197:{dmg=20+20*heads(u.energies.length);break}
 case 202:{dmg=10;if(flip())dmg+=10*p.bench.filter(x=>/^(Omanyte|Omastar|Kabuto|Kabutops)$/.test(name(x))).length;break}
 case 208:{dmg=0;after=(_,blocked)=>{if(!blocked)v.damage+=10*heads(3)};break}
 case 224:{dmg=30+10*new Set(u.energies.map(id=>lookup.get(id)?.name).filter(s=>BASIC_ENERGY_NAMES.has(s))).size;break}
 case 248:{dmg=10+10*heads(p.bench.filter(x=>name(x)==='Murkrow').length);break}
 case 253:{dmg=flip()?10+u.damage:10;break}
 case 254:{dmg=flip()?30+u.damage:0;break}
 case 260:{dmg=0;after=()=>{for(const x of [f.active,...safeEnemyBench()])x.damage+=x.energies.length*10};break}
 case 295:{const cards=p.deck.splice(Math.max(0,p.deck.length-5));p.discard.push(...cards);dmg=20*cards.filter(id=>energy(lookup.get(id))).length;break}
 case 315:{dmg=20+Math.min(20,10*Math.max(0,u.energies.length-a.cost.length));break}
 case 326:{dmg=50+10*Math.max(0,u.energies.length-a.cost.length);ignoreResistance=true;break}
 // Discarding Energy is an attack COST; invalid costs must reject the attack before changing state.
 case 52:{if(!u.energies.length)return {ok:false};discardEnergy(u.energies.length);break}
 case 64:{if(!discardEnergy(3,'Fire'))return {ok:false};break}
 case 44:{const amount=countEnergy(u,'Lightning');if(!amount)return {ok:false};discardEnergy(amount,'Lightning');dmg=30*heads(amount);break}
 case 65:{const qty=countEnergy(u,'Fire');discardEnergy(qty,'Fire');dmg=20+20*qty;break}
 case 72:{if(flip()){dmg=50;discardEnergy(countEnergy(u,'Lightning'),'Lightning')}else dmg=20;break}
 case 74:{if(!flip())discardEnergy(u.energies.length);break}
 case 77:{if(!flip())discardEnergy(countEnergy(u,'Fire'),'Fire');break}
 case 114:{if(!countEnergy(u,'Fire'))return {ok:false};if(!flip())discardEnergy(1,'Fire');break}
 case 150:{if(!discardEnergy(3))return {ok:false};after=()=>spread([...p.bench,...safeEnemyBench()],20);break}
 case 163:{const amt=u.energies.length;if(!amt)return {ok:false};discardEnergy(amt);dmg=30*heads(amt);break}
 case 175:{if(!flip()){if(!u.energies.length)return {ok:false};discardEnergy(1)}break}
 case 192:{if(!discardEnergy(1))return {ok:false};after=()=>{u.damage=0};break}
 case 211:case 308:{if(!discardEnergy(ix===211?2:1))return {ok:false};break}
 case 261:{if(v.energies.length&&flip())f.discard.push(v.energies.shift());break}
 case 264:{if(u.energies.length){discardEnergy(1);dmg=60}else dmg=30;break}
 // Status/condition effects; applied after damage calculation and protective effects.
 case 73:{if(flip())status='Paralyzed';else u.damage+=20;break}
 case 94:case 196:case 207:case 237:{const h=flip();dmg=Number(t.match(/does (\d+) damage/i)?.[1]||parseInt(a.damage)||0)+(h?Number(t.match(/plus (\d+) more damage/i)?.[1]||0):0);if(h)status=ix===237?'Confused':ix===207?'': 'Paralyzed';if(ix===207&&!h)status='Paralyzed';if(ix===237&&!h)status=null;break}
 case 96:{u.damage+=20;if(flip())status='Poisoned';break}
 case 98:case 102:case 251:case 185:{if(flip())status='Poisoned';after=(d,blocked)=>{if(!blocked&&status==='Poisoned'&&v.poison)v.poisonDamage=ix===185?30:20};break}
 case 126:{if(heads(2)===2){status='Confused';after=(_,blocked)=>{if(!blocked)v.poison=true}}break}
 case 138:{if(flip())status='Confused';else{dmg=0;u.status='Confused'}break}
 case 147:{if(flip()){dmg=30;status='Confused'}else dmg=20;break}
 case 170:case 178:case 318:{if(flip())after=(_,blocked)=>{if(!blocked)v.attackLocks.push({name:'*',until:game.round+1})};break}
 case 156:{if(flip())v.cantRetreatUntil=game.round+1;break}
 case 204:{if(flip())status='Poisoned';else dmg=0;break}
 case 220:{const h=heads(2);if(h===2)status='Paralyzed';else if(h===1)status='Asleep';break}
 case 296:{status=flip()?'Asleep':'Confused';break}
 case 320:{if(flip())status='Confused';else u.status='Confused';break}
 case 290:{if(flip())status='Asleep';else v.cantRetreatUntil=game.round+1;break}
 case 297:{if(['Asleep','Confused'].includes(v.status))dmg=40;else dmg=20;after=(_,blocked)=>{if(!blocked)v.status=null};break}
 case 305:{const h=heads(3);dmg=20*h;if(h>=2)status='Paralyzed';break}
 case 311:{status='Asleep';after=()=>{for(const x of [...p.bench,...f.bench])x.damage=Math.max(0,x.damage-10)};break}
 // Fixed one-turn damage prevention, retaliation and attack locks.
 case 55:case 174:{u.halfShield=true;break}
 case 78:{u.attackShield=20;break}
 case 82:{if(flip()){dmg=40;u.attackShield=Infinity;u.preventAttackEffects=true}else dmg=10;break}
 case 146:{if(flip())u.attackShield=20;break}
 case 265:{if(flip())u.attackShield=Infinity;break}
 case 299:{u.attackShield=10;break}
 case 304:{u.preventDamageThreshold=30;break}
 case 317:{u.coinDamageShieldUntil=game.round+1;break}
 case 158:{u.statusImmunityUntil=game.round+1;break}
 case 125:{if(u.damage<20)return {ok:false};break}
 case 79:{if(u.lastAttackName!=='Lie Low'||u.lastAttackRound!==game.round-1)return {ok:false};break}
 case 133:{if(!flip())u.attackLocks.push({name:a.name,until:game.round+1});break}
 case 70:{if(game.maxHP(v)<=50)v.attackLocks.push({name:'*',until:game.round+1});break}
 case 132:{if(flip())v.smokescreenUntil=game.round+1;break}
 case 151:{game.powerSilenceUntil=game.round+1;break}
 case 152:{v.cantRetreatUntil=game.round+1;break}
 case 205:{u.coinDamageShieldUntil=game.round+1;break}
 case 209:{v.poisonOnEnergyUntil=game.round+1;break}
 case 314:{v.damageOutgoingReduction=10;v.damageOutgoingReductionUntil=game.round+1;break}
 // Coin-modified damage and variable recoil.
 case 56:case 93:{if(!flip()){dmg=0;u.damage+=ix===56?20:100}break}
 case 80:{dmg=flip()?50+50*(p.bench.some(x=>name(x)==="Giovanni's Nidoking")?1:0):0;break}
 case 81:{if(p.bench.length&&!flip())p.bench[0].damage+=20;break}
 case 87:{if(flip()){dmg=40;after=()=>spread(safeEnemyBench(),10)}else dmg=30;break}
 case 88:{spread([...p.bench,...safeEnemyBench()],10);u.damage+=50;break}
 case 89:{u.damage+=20;break}
 case 101:{if(flip()){dmg=40;u.damage+=30}else dmg=10;break}
 case 106:case 124:{u.damage+=20;break}
 case 131:{if(!flip())u.damage+=10;break}
 case 149:{if(flip()){dmg=80;u.damage+=20}else dmg=60;break}
  case 168:{u.damage=Math.max(0,u.damage-20*heads(2));break}
 case 176:{dmg=20+(v.lastAttackerPlayer===f&&v.lastAttackerTurn===game.round-1?10:0);break}
 case 200:{const h=heads(4);dmg=10+(h===4?80:h===3?40:h===2?20:h===1?10:0);break}
 case 223:{for(let i=0;i<2;i++)if(!flip()&&u.energies.length)discardEnergy(1);break}
 case 227:{if(!flip())dmg=0;else dmg=80;break}
 case 228:{if(u.energies.length){discardEnergy(u.energies.length);dmg=80}break}
 case 231:case 242:case 246:case 298:{const bonus=Number(t.match(/plus (\d+) more damage/i)?.[1]||0);dmg=(parseInt(a.damage)||0)+(flip()?bonus:0);break}
 case 240:{u.damage=Math.max(0,u.damage-30);break}
 case 241:{u.damage+=30;u.attackLocks.push({name:a.name,until:game.round+1});break}
 case 249:{let h=0;while(h<100&&flip())h++;dmg=20*h;break}
 case 285:{if(heads(2)!==2)dmg=0;break}
 case 292:{u.damage+=10;u.attackLocks.push({name:a.name,until:game.round+1});break}
 // Bench, draw and deck-discard mechanics.
 case 11:case 15:{let tails=0;for(const x of f.bench){if(flip()){if(safeEnemyBench().includes(x))x.damage+=20}else tails++}u.damage+=10*tails;break}
 case 68:{if(heads(2)===2)spread(all().filter(x=>x!==u&&(!f.bench.includes(x)||safeEnemyBench().includes(x))),20);break}
 case 76:{if(flip()){const amt=u.damage;u.damage=v.damage;v.damage=amt}break}
 case 120:{for(const x of all())x.damage=Math.max(0,x.damage-10);break}
 case 128:{if(flip())spread([...p.bench,...safeEnemyBench()],10);break}
 case 137:{after=()=>{moveToHand()};break}
 case 145:{dmg=0;after=()=>spread(all().filter(x=>(C(x)?.abilities||[]).length),20);break}
 case 162:{const removed=p.deck.splice(Math.max(0,p.deck.length-3));p.discard.push(...removed);break}
 case 199:{dmg=0;const victims=all().filter(x=>!C(x)?.types?.includes('Fighting'));after=()=>spread(victims,10);break}
 case 294:{const top=f.deck[f.deck.length-1];if(top){game.log(`${a.name} revealed ${lookup.get(top)?.name||'a card'}.`);if(trainer(lookup.get(top)))f.discard.push(f.deck.pop())}break}
 case 331:{if(flip())spread([...p.bench,...safeEnemyBench()],10);u.attackLocks.push({name:a.name,until:game.round+1});break}
 case 256:{game.draw(f,2);game.draw(p,2);break}
 // Attacks that spend resources from the discard pile or adjust their own status.
 case 119:{for(let i=0,n=heads(3);i<n;i++){const j=p.discard.findIndex(id=>lookup.get(id)?.name==='Fire Energy');if(j<0)break;p.hand.push(p.discard.splice(j,1)[0])}break}
 case 142:{after=dealt=>{if(dealt>0)u.damage=Math.max(0,u.damage-10)};break}
 case 157:case 235:{after=(dealt,blocked)=>{if(dealt>0&&!blocked){v.poison=true;u.damage=Math.max(0,u.damage-Math.ceil(dealt/20)*10)}};break}
 case 179:{if(flip())for(let j=0;j<2;j++){const k=p.hand.findIndex(id=>energy(lookup.get(id)));if(k<0)break;u.energies.push(p.hand.splice(k,1)[0])}break}
 case 217:{const j=p.discard.findIndex(id=>energy(lookup.get(id)));if(j>=0)u.energies.push(p.discard.splice(j,1)[0]);break}
 case 279:{ignoreWR=true;break}
 default:return {ok:false};
 }
 return {ok:true,dmg,status,after,ignoreWR,ignoreResistance};
}
