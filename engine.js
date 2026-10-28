'use strict';
const SETS=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'];
const SET_NAMES=['Base Set','Jungle','Fossil','Base Set 2','Team Rocket','Gym Heroes','Gym Challenge','Neo Genesis','Neo Discovery','Neo Revelation','Neo Destiny','Wizards Promos'];
const $=id=>document.getElementById(id), rng=n=>Math.floor(Math.random()*n);
const coinQueue=[];let coinBusy=false;let matchGeneration=0;let lastBattleAnimation=Promise.resolve();let cpuRunning=false;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function feedback(message,side,kind='action',slot=-1,duration=920){
 const banner=$('actionFeedback');if(!banner)return;
 banner.textContent=message;banner.className='feedback '+kind;
 const selector=side===1?(slot===-1?'#oppActive .field-pokemon':`#oppBench .field-pokemon:nth-child(${slot+1})`):(slot===-1?'#myActive .field-pokemon':`#myBench .field-pokemon:nth-child(${slot+1})`);
 const tile=document.querySelector(selector);
 if(tile){tile.classList.remove('fx-attach','fx-attack','fx-hit');void tile.offsetWidth;tile.classList.add('fx-'+kind)}
 await pause(duration);banner.className='feedback hidden';tile?.classList.remove('fx-'+kind);
}

// Battlefield FX uses viewport coordinates, so animated objects fly between real cards.
function battlefieldCenter(side,slot=-1){
 const root=side===1?(slot===-1?'oppActive':'oppBench'):(slot===-1?'myActive':'myBench');
 const el=slot===-1?$(root)?.querySelector?.('.field-pokemon'):$(root)?.querySelectorAll?.('.field-pokemon')?.[slot];
 if(!el)return null;const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,el};
}
function sourceCenter(el){if(!el)return null;const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}}
function battleFX({from,to,emoji='✨',label='',kind='attack',duration=930}){
 if(!from||!to)return Promise.resolve();
 const layer=$('battleFX');if(!layer)return Promise.resolve();
 const projectile=document.createElement('div');projectile.className='battle-projectile '+kind;projectile.textContent=emoji;
 projectile.style.left=from.x+'px';projectile.style.top=from.y+'px';layer.append(projectile);
 if(label){let callout=document.createElement('div');callout.className='battle-callout';callout.textContent=label;callout.style.left=`${Math.max(130,Math.min(innerWidth-130,to.x))}px`;callout.style.top=`${Math.max(70,to.y-65)}px`;layer.append(callout);setTimeout(()=>callout.remove(),duration+400)}
 const anim=projectile.animate([{transform:'translate(-50%,-50%) scale(.65)',opacity:0},{opacity:1,offset:.17},{transform:`translate(calc(-50% + ${to.x-from.x}px),calc(-50% + ${to.y-from.y}px)) scale(1.2)`,opacity:1,offset:.8},{transform:`translate(calc(-50% + ${to.x-from.x}px),calc(-50% + ${to.y-from.y}px)) scale(1.8)`,opacity:0}],{duration,easing:'ease-in-out'});
 return anim.finished.catch(()=>{}).then(()=>{projectile.remove();const impact=document.createElement('div');impact.className='battle-impact '+kind;impact.style.left=to.x+'px';impact.style.top=to.y+'px';layer.append(impact);setTimeout(()=>impact.remove(),450)});
}
function battlefieldAttack(side,targetSlot,attackName,damage,bench=false){
 const attacker=battlefieldCenter(side),victim=battlefieldCenter(1-side,bench?targetSlot:-1);
 if(!attacker||!victim)return Promise.resolve();
 const victimEl=victim.el;victimEl.classList.add('battle-shake');setTimeout(()=>victimEl.classList.remove('battle-shake'),1000);
 const type=engine.card(engine.players[side].active)?.types?.[0]||'Colorless';const elemental={Water:'💦',Fire:'🔥',Grass:'🍃',Lightning:'⚡',Psychic:'🔮',Fighting:'💢',Darkness:'🌑',Metal:'⚙️',Colorless:'💥'};
 return lastBattleAnimation=battleFX({from:attacker,to:victim,emoji:elemental[type]||'💥',kind:'attack type-'+type.toLowerCase(),label:`${attackName}  ·  ${damage} damage`,duration:850});
}
function queuePrizeFX(winnerSide){
 const from=battlefieldCenter(1-winnerSide);
 setTimeout(()=>{const count=$(winnerSide===0?'playerPrizeCount':'rivalPrizeCount');const to=sourceCenter(count);if(from&&to)lastBattleAnimation=Promise.all([lastBattleAnimation,battleFX({from,to,emoji:'🏆',kind:'prize',label:'Prize card taken!',duration:750})]);},80);
}
function coin(context='Coin flip'){
 const result=Math.random()<.5;
 coinQueue.push({result,context});playCoinQueue();
 return result;
}
function playCoinQueue(){
 if(coinBusy||!coinQueue.length)return;
 coinBusy=true;const {result,context}=coinQueue.shift(),overlay=$('coinOverlay');
 if(!overlay){coinBusy=false;return;}
 $('coinContext').textContent=context;
 $('coinResult').textContent='Flipping…';
 $('coinFace').textContent='?';
 overlay.classList.remove('hidden');
 $('coinFace').classList.remove('spinning','heads','tails');
 void $('coinFace').offsetWidth;
 $('coinFace').classList.add('spinning');
 setTimeout(()=>{
  $('coinFace').classList.remove('spinning');
  $('coinFace').classList.add(result?'heads':'tails');
  $('coinFace').textContent=result?'H':'T';
  $('coinResult').textContent=result?'HEADS':'TAILS';
 },650);
 setTimeout(()=>{overlay.classList.add('hidden');coinBusy=false;playCoinQueue()},1375);
}

let cards=[],lookup=new Map(),selected=null,target=0,offset=0,theme='water',pendingTrainer=null;
let targetRequest=null;let deckSearchRequest=null;
const TYPES={water:['Water','Lightning'],fire:['Fire','Fighting'],grass:['Grass','Psychic']};
// Browser loads core_rules.js first. Legacy VM card tests evaluate engine.js alone;
// preserve their original behavior through a small compatibility fallback.
const BASIC_ENERGY_NAMES=new Set(["Grass Energy","Fire Energy","Water Energy","Lightning Energy","Psychic Energy","Fighting Energy"]);
const CORE=globalThis.NeoCoreRules || (typeof require==='function'?require('./core_rules'):null) || (()=>{
 const types=new Set(['Grass Energy','Fire Energy','Water Energy','Lightning Energy','Psychic Energy','Fighting Energy']);
 const isBasicEnergy=c=>Boolean(c&&types.has(c.name)&&!c.hp&&!(c.attacks||[]).length&&!(c.abilities||[]).length);
 return {
  isBasicEnergy,normalize:c=>isBasicEnergy(c)?{...c,supertype:'Energy',subtypes:(c.subtypes||[]).filter(x=>x!=='Basic')}:c,
  isEnergy:c=>Boolean(c&&(c.supertype==='Energy'||isBasicEnergy(c))),
  isBasicPokemon:c=>Boolean(c&&!isBasicEnergy(c)&&c.supertype==='Pokémon'&&((c.subtypes||[]).includes('Basic')||c.name==='Mysterious Fossil')&&!(c.subtypes||[]).includes('Baby')),
  canEvolve:(c,p)=>{if(p?.name==='Mysterious Fossil'&&['Kabuto','Omanyte','Aerodactyl'].includes(c?.name)&&(c.subtypes||[]).includes('Stage 1'))return true;
   if(!c?.evolvesFrom||!p?.name)return false;
   const owner=String(c.name||'').match(/^(Blaine's |Erika's |Misty's |Brock's |Lt\. Surge's |Sabrina's |Koga's |Giovanni's |Rocket's )/);
   if(owner)return p.name===(c.evolvesFrom.startsWith(owner[1])?c.evolvesFrom:owner[1]+c.evolvesFrom);
   return c.evolvesFrom===p.name||c.evolvesFrom.replace(/^(Dark |Light )/,'')===p.name;},
  canPayEnergy:(cost,pool)=>{const remaining=[...pool];for(const symbol of cost){if(symbol==='Colorless')continue;const i=remaining.indexOf(symbol);if(i<0)return false;remaining.splice(i,1);}return remaining.length>=cost.filter(s=>s==='Colorless').length;},
  legalAttachment:({card,unit,energyUsed=false,round=0,pureBody=false,cardName=''})=>Boolean(unit&&(card?.supertype==='Energy'||isBasicEnergy(card))&&!energyUsed&&!(unit.energyAttachBlockUntil>=round&&unit.energyAttachBlockUntil>0)&&!(pureBody&&card.name==='Water Energy'&&!(unit.energies||[]).length)&&!((card.subtypes||[]).includes('Special')&&card.name==='Miracle Energy'&&!/Shining /i.test(cardName)))
 };
})();
const isBasicEnergyCard=CORE.isBasicEnergy;
const normalizeLoadedCard=CORE.normalize;
const basic=CORE.isBasicPokemon;
const energy=CORE.isEnergy;
const trainer=c=>c?.supertype==='Trainer';
const compatible=CORE.canEvolve;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=rng(i+1);[a[j],a[i]]=[a[i],a[j]]}return a};
function toast(s){$('toast').textContent=s;$('toast').style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').style.display='none',3500)}
function img(c){return c?.images?.small||''}
function short(c){return `<img loading="lazy" src="${img(c)}" onerror="this.style.display='none'" alt=""><div class="name">${esc(c?.name||'?')}</div>`}
function esc(s){return String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function info(c){return `<h3>${esc(c.name)} <small>${esc(c.id)}</small></h3><p>${esc(c.supertype)} · ${esc((c.subtypes||[]).join(', '))} · ${esc((c.types||[]).join('/'))} · ${c.hp||'—'} HP</p>${(c.abilities||[]).map(x=>`<p><b>Power: ${esc(x.name)} ${IMPLEMENTED_POWERS.has(x.name)?'✅ supported':'⚠ not scripted'}</b><br>${esc(x.text)}</p>`).join('')}${(c.attacks||[]).map(x=>`<p><b>${esc(x.name)}</b> [${esc((x.cost||[]).join(', '))}] ${esc(x.damage||'')}<br>${esc(x.text||'')}</p>`).join('')}${c.rules?`<p>${esc(c.rules.join(' '))}</p>`:''}${trainer(c)?`<p>${esc(c.rules?.join(' ')||'')}</p>`:''}<p>Weakness: ${esc(c.weaknesses?.[0]?.type||'—')} · Resistance: ${esc(c.resistances?.[0]?.type||'—')} · Retreat: ${(c.retreatCost||[]).length}</p>`}
function statePlayer(name,deck){
 const discard=[];
 // Buzzap's Electrode is an attached Energy while in play, but an Electrode card
 // again once sent to its owner's discard pile.
 Object.defineProperty(discard,'push',{value:function(...ids){return Array.prototype.push.apply(this,ids.map(id=>typeof id==='string'&&id.startsWith('__buzzap:')?id.split(':').slice(2).join(':'):id))}});
 return {name,deck:shuffle(deck),hand:[],prizes:[],active:null,bench:[],discard,energyUsed:false,retreated:false,turnPlays:[],drawFailed:false,trainerLockUntil:0}
}
function unit(id){return {id,under:[],damage:0,energies:[],status:null,poison:false,poisonDamage:10,burn:false,playedTurn:-10,immuneUntil:0,attackShield:0,preventBelow:0,burnEnergyTurn:-1,powerUses:{},cantRetreatUntil:0,smokescreenUntil:0,trainerLockUntil:0,damageBoostUntil:0,damageBoost:0,nextAttackBoost:null,attackLocks:[],usedAttacks:{},lastAttackResult:null,destinyBondUntil:0,counterEffect:null,benchShieldUntil:0,attachedTrainers:[]}}
function discardUnit(p,u){if(u)p.discard.push(u.id,...(u.under||[]),...u.energies,...(u.attachedTrainers||[]).map(x=>x.id),...(u.shapeshiftCardId?[u.shapeshiftCardId]:[]))}
function calculateDamage(raw,source,target){let dmg=Math.max(0,raw),kind=source?.types?.[0];if(!dmg)return 0;const weak=target?.weaknesses?.find(w=>w.type===kind);const resist=target?.resistances?.find(r=>r.type===kind);if(weak&&!(engine?.stadium&&lookup.get(engine.stadium.id)?.name==='Cinnabar City Gym'&&kind==='Water'&&target?.name?.startsWith("Blaine's ") )){const multiplier=String(weak.value||'×2').match(/[×x](\d+)/i);dmg*=multiplier?Number(multiplier[1]):2}if(resist&&!(engine?.stadium&&lookup.get(engine.stadium.id)?.name==='Pewter City Gym'&&source?.name?.startsWith("Brock's ") )&&!(engine?.me?.active&&source?.name===engine.card(engine.me.active)?.name&&(engine.me.active.attachedTrainers||[]).some(x=>lookup.get(x.id)?.name==='Magnifier'))){const offset=parseInt(String(resist.value||'-30'),10);const stadiumResistance=(engine?.stadium&&lookup.get(engine.stadium.id)?.name==='Resistance Gym')?20:0;dmg=Math.max(0,dmg+(Number.isFinite(offset)?offset:-30)+stadiumResistance)}return dmg}

// Executable, exact-text historical attack implementations added in v0.4.3.
// BATCH43_RULES is generated from the user's cached TCGdex data. No fuzzy name-only matching.
const BATCH43_RULES = new Map([["Crushing Earth\u001fFlip a coin. If heads, this attack does 10 damage to each Benched Pokémon (yours and your opponent's). (Don't apply Weakness and Resistance for Benched Pokémon.) If tails, this attack does nothing. Either way, Shining Steelix can't attack during your next turn.", 331], ["Water Slash\u001fDoes 50 damage plus 10 more damage for each Energy attached to Shining Kabutops but not used to pay for this attack's Energy cost. Don't apply Resistance.", 326], ["Migraine\u001fFlip a coin. If heads, the Defending Pokémon is now Confused. If tails, Psyduck is now Confused.", 320], ["Ink Blast\u001fThis attack does 20 damage plus 10 more damage for each Energy attached to Dark Octillery but not used to pay for this attack's Energy cost. You can't add more than 20 damage in this way.", 315], ["Hypno Shower\u001fThe Defending Pokémon is now Asleep. Remove 1 damage counter from each Benched Pokémon (yours and your opponent's) with any damage counters on it.", 311], ["Thunder Needle\u001fFlip 3 coins. This attack does 20 damage times the number of heads. If you get 2 or more heads, the Defending Pokémon is now Paralyzed.", 305], ["Expand\u001fAll damage done to Jigglypuff during your opponent's next turn is reduced by 10 (after applying Weakness and Resistance).", 299], ["Charging Horn\u001fFlip a coin. If heads, this attack does 30 damage plus 30 more damage. If tails, this attack does 30 damage.", 298], ["Slap Awake\u001fIf the Defending Pokémon is Asleep or Confused, this attack does 20 damage plus 20 more damage. Then, the Defending Pokémon is no longer Asleep or Confused.", 297], ["Dark Song\u001fFlip a coin. If heads, the Defending Pokémon is now Asleep. If tails, the Defending Pokémon is now Confused.", 296], ["Rushing Magma\u001fDiscard the top 5 cards of your deck. (If there are fewer than 5 cards in your deck, discard all of them.) This attack does 20 damage for each Energy card you discarded in this way.", 295], ["Incinerate\u001fShow the top card of your opponent's deck to all players. If it's a Trainer card, discard it.", 294], ["Rock Tackle\u001fDark Pupitar does 10 damage to itself. Dark Pupitar can't use this attack during your next turn.", 292], ["Surround\u001fFlip a coin. If heads, the Defending Pokémon is now Asleep. If tails, the Defending Pokémon can't retreat during your opponent's next turn.", 290], ["Egg Toss\u001fFlip 2 coins. If either of them is tails, this attack does nothing.", 285], ["Mind Shock\u001fDon't apply Weakness or Resistance for this attack.", 279], ["Curve Attack\u001fFlip a coin. If heads, prevent all damage done by attacks to Dark Porygon2 during your opponent's next turn. (Any other effects of attacks still happen.)", 265], ["Psysplash\u001fDoes 10 damage to each of your opponent's Pokémon for each Energy card attached to that Pokémon. Don't apply Weakness and Resistance.", 260], ["Outrage\u001fFlip a coin. If heads, this attack does 30 damage plus 10 more damage for each damage counter on Shining Gyarados. If tails, this attack does nothing.", 254], ["Raging Headbutt\u001fFlip a coin. If heads, this attack does 10 damage plus 10 damage times the number of damage counters on Snubbull. If tails, this attack does 10 damage.", 253], ["Toxic Saliva\u001fFlip a coin. If heads, the Defending Pokémon is now Poisoned. It now takes 20 Poison damage after each player's turn (even if it was already Poisoned).", 251], ["Needle Storm\u001fFlip a coin until you get tails. This attack does 20 damage times the number of heads you get.", 249], ["Flock Attack\u001fFlip a number of coins equal to the number of Murkrows on your Bench. This attack does 10 damage plus 10 more damage for each heads.", 248], ["Positive Ion\u001fFlip a coin. If heads, this attack does 10 damage plus 10 more damage. If tails, this attack does 10 damage.", 246], ["Rising Lunge\u001fFlip a coin. If heads, this attack does 10 damage plus 10 more damage. If tails, this attack does 10 damage.", 242], ["High-Speed Charge\u001fPiloswine does 30 damage to itself. Piloswine can't use this attack during your next turn.", 241], ["Nap\u001fRemove 3 damage counters from Piloswine. If it has fewer damage counters than that, remove all of them.", 240], ["Strange Dance\u001fFlip a coin. If heads, this attack does 20 damage plus 20 more damage and the Defending Pokémon is now Confused. If tails, this attack does 20 damage.", 237], ["Quick Attack\u001fFlip a coin. If heads, this attack does 10 damage plus 20 more damage.", 231], ["Aerowing\u001fYou may flip a coin. If heads, this attack does 80 damage. If tails, this attack does nothing.", 227], ["Rainbow Burn\u001fThis attack does 30 damage plus 10 more for each type of Basic Energy card if any, attached to Ho-oh", 224], ["Aurora Wave\u001fFlip 2 coins. If both are heads, the Defending Pokémon is now Paralyzed. If only 1 is heads, the Defending Pokémon is now Asleep.", 220], ["Black Fang\u001fFlip a number of coins equal to the number of Energy attached to Houndoom. This attack does 30 damage plus 10 more damage for each heads.", 215], ["Psychic Damage\u001fFlip 3 coins. For each heads, put 1 damage counter on the Defending Pokémon.", 208], ["Gigavolt\u001fFlip a coin. If heads, this attack does 40 damage plus 20 more damage. If tails, this attack does 40 damage and the Defending Pokémon is now Paralyzed.", 207], ["Spike Stab\u001fFlip a coin. If heads, the Defending Pokémon is now Poisoned. If tails, this attack does nothing (not even damage).", 204], ["Fury Cutter\u001fFlip 4 coins. This attack does 10 damage plus 10 more damage if exactly 1 is heads, or 20 more damage if exactly 2 are heads, or 40 more damage if exactly 3 are heads, or 80 more damage if all 4 are heads.", 200], ["Spike Barrage\u001fFlip a number of coins equal to the number of Energy attached to Omastar. This attack does 20 damage plus 20 more for each heads.", 197], ["Squeeze\u001fFlip a coin. If heads, this attack does 10 damage plus 20 more damage and the Defending Pokémon is now Paralyzed. If tails, this attack does 10 damage.", 196], ["Hyper Reverse\u001fDoes 10 damage times the number of Energy cards attached to the Defending Pokémon. After doing damage, remove a number of damage counters from Butterfree equal to the amount of damage done to the Defending Pokémon (after applying Weakness and Resistance).", 187], ["Triple Poison\u001fFlip a coin. If heads, the Defending Pokémon is now Poisoned. Your opponent now puts 3 damage counters instead of 1 after each player's turn (even if it was already Poisoned).", 185], ["Psychic\u001fDoes 30 damage plus 10 more for each Energy Card attached to the Defending Pokémon.", 180], ["Deflector\u001fDuring your opponent's next turn, whenever Chikorita takes damage, divide that damage in half (rounded down to the nearest 10). (Any other effects still happen.)", 174], ["Milk Drink\u001fFlip 2 coins. Remove 2 damage counters times the number of heads from Miltank. If it has fewer damage counters than that, remove all of them.", 168], ["Raging Charge\u001fThis attack does 10 damage plus 10 damage for each damage counter on Granbull. Then, Granbull does 20 damage to itself.", 166], ["Discharge\u001fDiscard all Lightning Energy cards attached to Flaaffy in order to use this attack. Flip a number of coins equal to the number of Lightning Energy cards you discarded. This attack does 30 damage times the number of heads.", 163], ["Sweep Away\u001fDiscard the top 3 cards from your deck.", 162], ["Poison Bite\u001fIf this attack damages the Defending Pokémon, the Defending Pokémon is now Poisoned and you remove a number of damage counters from Ariados equal to half that damage (rounded up to the nearest 10). If Ariados has fewer damage counters than that, remove all of them.", 157], ["Beat Up\u001fFlip a coin for each of your Pokémon in play (including this one). This attack does 20 damage times the number of heads.", 154], ["Flame Burst\u001fFlip a coin. If heads, this attack does 60 damage plus 20 more damage and does 20 damage to Typhlosion. If tails, this attack does 60 damage.", 149], ["Mind Blast\u001fFlip a coin. If heads, this attack does 20 damage plus 10 more damage and the Defending Pokémon is now Confused. If tails, this attack does 20 damage.", 147], ["Steel Wing\u001fFlip a coin. If heads, all damage done by attacks to Skarmory during your opponent's next turn is reduced by 20 (after applying Weakness and Resistance).", 146], ["Leech Seed\u001fIf this attack damages the Defending Pokémon (after applying Weakness and Resistance), remove 1 damage counter from Jumpluff, if it has any.", 142], ["Riptide\u001fDoes 10 damage plus 10 damage times the number of Energy cards in your discard pile. Then, shuffle all Energy cards from your discard pile into your deck.", 141], ["Flower Dance\u001fDoes 30 damage times the number of cards with Bellossom in their names that you have in play (including this one).", 140], ["Random ESP\u001fFlip a coin. If heads, the Defending Pokémon is now Confused. If tails, this attack does no damage and Sabrina's Psyduck is now Confused.", 138], ["Bubbles\u001fFlip a coin. If tails, you can't use this attack during your next turn.", 133], ["Bouncing Ball\u001fFlip a coin. If tails, Lt. Surge's Voltorb does 10 damage to itself.", 131], ["Smelly Gas\u001fFlip a coin. If heads, this attack does 10 damage to each Benched Pokémon (including your own). (Don't apply Weakness and Resistance for Benched Pokémon.)", 128], ["Fast-Acting Poison\u001fFlip 2 coins. If both are heads, the Defending Pokémon is now Confused and Poisoned.", 126], ["Retaliation\u001fYou can't use this attack unless Giovanni's Nidoran ♂ has 2 or more damage counters on it.", 125], ["Double-edge\u001fGiovanni's Nidoran ♀ does 20 damage to itself.", 124], ["Fury Punch\u001fFlip a coin. If heads, this attack does 20 damage times the number of damage counters on Giovanni's Machop.", 123], ["Pulled Punch\u001fIf the Defending Pokémon has no damage counters on it, this attack does 40 damage. If it has any damage counters on it, this attack does 10 damage.", 121], ["Group Therapy\u001fYou and your opponent remove 1 damage counter from each of your Pokémon with damage counters on them.", 120], ["Fire Tail Slap\u001fUse this attack only if there are any Fire Energy cards attached to Blaine's Charmander. Flip a coin. If tails, discard 1 of those cards.", 114], ["Pendulum Curse\u001fFlip a number of coins equal to the number of damage counters on the Defending Pokémon. This attack does 20 damage times the number of heads.", 110], ["Ice Throw\u001fIf the Defending Pokémon is Fighting, this attack's base damage is doubled.", 107], ["Double-edge\u001fLt. Surge's Raticate does 20 damage to itself.", 106], ["Toxic Cloud\u001fFlip a coin. If heads, this Defending Pokémon is now Poisoned. It now takes 20 Poison damage instead of 10 after each player's turn (even if it was already Poisoned).", 102], ["Spontaneous Explosion\u001fFlip a coin. If heads, this attack does 10 damage plus 30 more damage and Koga's Weezing does 30 damage to itself; if tails, this attack does 10 damage.", 101], ["Toxic Secretion\u001fFlip a coin. If heads, the Defending Pokémon is now Poisoned. It now takes 20 Poison damage instead of 10 after each player's turn (even if it was already Poisoned).", 98], ["Rend\u001fIf the Defending Pokémon already has any damage counters on it, this attack does 20 damage plus 20 more damage. If not, this attack does 20 damage.", 97], ["Poison Sting Tackle\u001fGiovanni's Nidorina does 20 damage to itself. Flip a coin. If heads, the Defending Pokémon is now Poisoned.", 96], ["Headlock\u001fFlip a coin. If heads, this attack does 20 damage plus 20 more damage and the Defending Pokémon is now Paralyzed. If tails, this attack does 20 damage.", 94], ["Risky Attack\u001fFlip a coin. If tails, this attack does no damage to the Defending Pokémon and Giovanni's Machoke does 100 damage to itself.", 93], ["Stamp\u001fFlip a coin. If heads, this attack does 30 damage plus 10 more damage (to the Defending Pokémon) and 10 damage to each of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) If tails, this attack does 30 damage (to the Defending Pokémon).", 87], ["Thunder Flare\u001fDoes 30 damage plus 10 damage times the number of damage counters on Lt. Surge's Jolteon, then flip a coin. If tails, Lt. Surge's Jolteon does 30 damage to itself.", 83], ["Aerial Maneuvers\u001fFlip a coin. If heads, this attack does 10 damage plus 30 more damage, and, during your opponent's next turn, prevent all effects of attacks, including damage, done to Koga's Pidgeotto. If tails, this attack does 10 damage.", 82], ["Love Lariat\u001fFlip a coin. If heads, this attack does 50 damage plus 50 more damage if you have at least 1 Giovanni's Nidoking on your Bench. If tails, this attack does nothing.", 80], ["Earthdrill\u001fThis attack can't be used unless Brock's Dugtrio used its Lie Low attack last turn.", 79], ["Lie Low\u001fAll damage done to Brock's Dugtrio during your opponent's next turn is reduced by 20 (after applying Weakness and Resistance).", 78], ["Burn Up\u001fFlip a coin. If tails, discard all Fire Energy cards attached to Blaine's Ninetales.", 77], ["Juxtapose\u001fFlip a coin. If heads, switch the number of damage counters on Rocket's Mewtwo with the number of damage counters on the Defending Pokémon (even if it would Knock Out either Pokémon). (It's okay if 1 of the Pokémon has no damage counters on it.)", 76], ["Electro Beam\u001fFlip a coin. If tails, discard all Energy cards attached to Misty's Golduck.", 74], ["Thundertackle\u001fFlip a coin. If heads, the Defending Pokémon is now Paralyzed. If tails, Lt. Surge's Raichu does 20 damage to itself.", 73], ["Kerzap\u001fFlip a coin. If heads, this attack does 20 damage plus 30 more damage to the Defending Pokémon and discard all Lightning Energy cards attached to Lt. Surge's Raichu. If tails, this attack does 20 damage.", 72], ["Summon Storm\u001fFlip 2 coins. If both of them are heads, this attack does 20 damage to each other Pokémon (even your own). Don't apply Weakness and Resistance for this attack.", 68], ["Firestorm\u001fDiscard 3 Fire Energy cards attached to Blaine's Arcanine in order to use this attack.", 64], ["Karate Chop\u001fDoes 40 damage minus 10 damage for each damage counter on Brock's Mankey.", 61], ["Night Spirits\u001fFlip a number of coins equal to the total number of Sabrina's Gastlys, Sabrina's Haunters, and Sabrina's Gengars you have in play. This attack does 30 damage times the number of heads.", 60], ["Water Punch\u001fFlip a number of coins equal to the number of Water Energy attached to Misty's Poliwhirl. This attack does 30 damage plus 10 damage for each heads.", 58], ["Egg Bomb\u001fFlip a coin. If tails, this attack does nothing to the Defending Pokémon and Erika's Exeggcute does 20 damage to itself.", 56], ["Deflector\u001fDuring your opponent's next turn, whenever Erika's Exeggcute takes damage, divide that damage in half (rounded down to the nearest 10). (Any other effects still happen.)", 55], ["Thunderbolt\u001fDiscard all Energy cards attached to Lt. Surge's Raichu in order to use this attack.", 52], ["Discharge\u001fDiscard all Lightning Energy cards attached to Lt. Surge's Electabuzz in order to use this attack. Flip a number of coins equal to the number of Lightning Energy cards you discarded. This attack does 30 damage times the number of heads.", 44], ["Water Gun\u001fDoes 10 damage plus 10 damage for each Energy attached to Poliwag but not used to pay for this attack's Energy cost. Extra Energy after the end don't count.", 4], ["Thunderstorm\u001fFor each of your opponent's Benched Pokémon, flip a coin. If heads, this attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) Then, Zapdos does 10 damage times the number of tails to itself.", 11]]);
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
 case 163:{const amt=countEnergy(u,'Lightning');if(!amt)return {ok:false};discardEnergy(amt,'Lightning');dmg=30*heads(amt);break}
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

// v0.4.4: exact printed-text dispatch from the cached historical dataset.
// These handlers have individual state/outcome regression tests; other attacks remain unsupported.
const BATCH44_RULES = new Map([["Take Away\u001fShuffle Erika's Dragonair and all cards attached to it into your deck. Then, your opponent shuffles his or her Active Pokémon and all cards attached to it into his or her deck.",39],["Crystal Beam\u001fFlip a coin. If heads, your opponent can't attach Energy cards to the Defending Pokémon during his or her next turn.",50],["Focus Energy\u001fDuring your next turn, Lt. Surge's Rattata's Gnaw attack's base damage is doubled.",51],["Roaring Flames\u001fDiscard all Fire Energy cards attached to Blaine's Charizard. If all Energy cards attached to Blaine's Charizard provide 2 Fire Energy, discard all of them. This attack does 20 damage plus 20 more damage for each Fire Energy discarded in this way.",53],["Intimidate\u001fIf the Defending Pokémon's maximum HP is 50 or less, it can't attack Giovanni's Nidoking during your opponent's next turn. (Benching or evolving either Pokémon ends this effect.)",57],["Dark Wave\u001fAll Pokémon Powers stop working until the end of your opponent's next turn.",61],["Damage Shift\u001fMove 1 damage counter from each of your Pokémon that has any on it to the Defending Pokémon. (Don't apply Weakness and Resistance.)",62],["Detonate\u001fDoes 10 damage to each Pokémon on each player's bench. (Don't apply Weakness and Resistance for Benched Pokémon.) Brock's Graveler does 50 damage to itself. If there is a Stadium card in play, discard it.",64],["Mega Thrash\u001fBrock's Primeape does 20 damage to itself. If there is a Stadium card in play, discard it.",65],["False Charity\u001fFlip a coin. If heads, look at the top card of your opponent's deck. If it's a Trainer card, put it in your opponent's discard pile; otherwise, put it into his or her hand.",69],["Obscuring Gas\u001fFlip a coin. If heads, shuffle Koga's Koffing and all cards attached to it into your deck (after doing damage).",70],["Surprise\u001fLook at a random card from your opponent's hand. Your opponent shuffles that card into his or her deck.",72],["Power Ball\u001fFlip 3 coins. This attack does 30 damage plus 10 more damage for each heads.",73],["Focus Energy\u001fDuring your next turn, Lt. Surge's Raticate's Double-edge attack's damage (base damage and damage to itself) is doubled.",74],["Life Drain\u001fFlip a coin. If heads, put a number of damage counters on the Defending Pokémon so that its remaining HP are 10.",78],["Call Will-o'-the-wisp\u001fFlip 3 coins. For each heads, if you have a Fire Energy card in your discard pile, put it into your hand.",84],["Poison Spore\u001fFlip a coin. If heads, the Defending Pokémon is now Poisoned and this attack does 10 damage to each of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",85],["Focus Energy\u001fDuring your next turn, Lt. Surge's Rattata's Quick Attack's base damage is doubled.",88],["Ink Spurt\u001fFlip a coin. If heads, whenever the Defending Pokémon tries to attack, your opponent flips a coin. If tails, that attack does nothing. (This effect lasts until the Defending Pokémon evolves or is Benched.)",89],["Star Boomerang\u001fFlip a coin. If heads, return Misty's Staryu and all cards attached to it to your hand. (Either way, this attack does its damage.)",91],["Fade Out\u001fReturn Sabrina's Gastly and all Energy cards attached to it to your hand. (Discard all other cards attached to Sabrina's Gastly.)",93],["Zzzap\u001fDoes 20 damage to each Pokémon in play that has a Pokémon Power. Don't apply Weakness and Resistance.",97],["Sputter\u001fAll Pokémon Powers stop working until the end of your next turn.",100],["Spider Web\u001fFlip a coin. If heads, the Defending Pokémon can't retreat. (Benching or evolving that Pokémon ends this effect.)",104],["Pollen Shield\u001fDuring your opponent's next turn, Bayleef can't become Asleep, Confused, Paralyzed, or Poisoned. (All other effects of attacks, Pokémon Powers, and Trainer cards still happen.)",105],["Jaw Clamp\u001fUntil the end of your opponent's next turn, as long as Croconaw is your Active Pokémon, the Defending Pokémon can't retreat, and if the effect of an attack, Pokémon Power, or Trainer card would change that player's Active Pokémon, that part of the effect does nothing.",108],["Sticky Nectar\u001fFlip a coin. If heads, this attack does 20 damage plus 10 more damage and, until the end of your opponent's next turn, as long as Gloom is your Active Pokémon, the Defending Pokémon can't retreat, and if the effect of an attack, Pokémon Power, or Trainer card would change that player's Active Pokémon, that part of the effect does nothing. If tails, this attack does 20 damage.",110],["Endure\u001fFlip a coin. If heads, then if, during your opponent's next turn, Phanpy would be Knocked Out by an attack, Phanpy isn't Knocked Out and its remaining HP become 10 instead.",112],["Freeze\u001fFlip a coin. If heads, the Defending Pokémon can't attack. (Benching or evolving the Defending Pokémon ends this effect.)",113],["Fireworks\u001fFlip a coin. If tails, discard 1 Energy card attached to Cyndaquil.",117],["Fin Slap\u001fIf an attack damaged Horsea during your opponent's last turn, this attack does 20 damage plus 10 more damage. If not, this attack does 20 damage.",118],["Scary Face\u001fFlip a coin. If heads, until the end of your opponent's next turn the Defending Pokémon can't attack or retreat.",120],["Growth\u001fFlip a coin. If heads, you may attach up to 2 Energy cards from your hand to Sunkern.",121],["Pursuit\u001fDuring your opponent's next turn, if the Defending Pokémon tries to retreat, do 10 damage to it. (Don't apply Weakness and Resistance.)",129],["Work Together\u001fFlip a coin. If heads, this attack does 10 damage plus 10 more damage for each Omanyte, Omastar, Kabuto, and Kabutops on your Bench.",138],["Burst\u001fFlip a coin. If heads, Pineco does 40 damage to itself and 10 damage to each Pokémon on each player's Bench. (Don't apply Weakness and Resistance for Benched Pokémon.) Flip a coin. If tails, this attack does nothing (not even damage).",139],["Triggered Poison\u001fIf your opponent attaches an Energy card to the Defending Pokémon during his or her next turn, that Pokémon becomes Poisoned.",142],["Present\u001fFlip 3 coins. If exactly 1 is heads, this attack does 40 damage. If exactly 2 are heads, remove 3 damage counters from the Defending Pokémon. If the Defending Pokémon has fewer damage counters than that, remove all of them. If all 3 are heads, this attack does 60 damage. If all 3 are tails, remove all damage counters from the Defending Pokémon.",143],["Fly\u001fFlip a coin. If heads, during your opponent's next turn, prevent all effects of attacks, including damage, done to Aerodactyl. If tails, this attack does nothing (not even damage).",152],["Psychic Leaf\u001fFlip a coin for each Energy attached to the Defending Pokémon. This attack does 10 damage plus 10 more damage for each heads. Remove a number of damage counters from Celebi equal to the damage done to the Defending Pokémon (after applying Weakness and Resistance). If Celebi has fewer damage counters than that, remove all of them.",153],["Tail Shock\u001fFlip a coin. If heads, this attack does 10 damage to each of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",162],["Poison Bite\u001fIf this attack damages the Defending Pokémon, the Defending Pokémon is now Poisoned and you remove a number of damage counters from Golbat equal to half that damage (rounded up to the nearest 10). If Golbat has fewer damage counters than that, remove all of them. Either way, the Defending Pokémon is now Poisoned.",163],["Rock Tumble\u001fDon't apply Resistance.",164],["Octazooka\u001fFlip a coin. If heads, whenever the Defending Pokémon attacks, your opponent flips a coin. If tails that attack does nothing. (Benching or evolving that Pokémon ends this effect.)",166],["Dark Drain\u001fFlip a coin for each of your opponent's Pokémon. For each heads, this attack does 10 damage to that Pokémon. Don't apply Weakness and Resistance. Remove a number of damage counters from Dark Crobat equal to the damage dealt. If Dark Crobat has fewer damage counters than that, remove all of them.",176],["Dark Fire\u001fIf there are any Energy cards attached to Dark Houndoom, discard 1 of them and this attack does 30 damage plus 20 more damage (plus 10 more damage for the Energy you discarded). If there aren't any, this attack does 30 damage.",181],["Mountain Smasher\u001fFlip a number of coins equal to the number of Energy cards attached to Dark Tyranitar. This attack does 20 damage times the number of heads. Then, for each heads, discard the top card from your opponent's deck.",184],["Gentle Flames\u001fIf the Defending Pokémon is a Baby Pokémon, this attack does 10 damage instead of 50. If the Defending Pokémon is a Basic Pokémon, this attack does 30 damage instead of 50.",186],["Light Wave\u001fDuring your opponent's next turn, prevent all effects of attacks that are not damage done to this Pokémon.",188],["Dark Tentacle\u001fDuring your opponent's next turn, the Defending Pokémon can't evolve except from effects of attacks or Pokémon Powers. (Benching that Pokémon ends this effect.)",194],["Battle Frenzy\u001fFor each Pokémon in play (yours and your opponent's), flip a coin. For each heads, this attack does 20 damage to that Pokémon. Don't apply Weakness and Resistance for this attack.",196],["Clamping Jaw\u001fThe Defending Pokémon can't retreat during your opponent's next turn. If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips a coin. If tails, that attack does nothing. (Benching either Pokémon ends this effect.)",200],["Armor Up\u001fUntil the end of your next turn, if Dark Forretress would be Knocked Out by damage from an attack, flip a coin. If heads, Dark Forretress is not Knocked Out and its remaining HP become 10 instead.",202],["Ice Pillar\u001fUntil the end of your opponent's next turn, as long as Light Dewgong is your Active Pokémon, prevent all damage done by attacks to your Benched Pokémon. (Any other effects of attacks still happen.)",206],["Pulse Guard\u001fDuring your opponent's next turn, whenever 30 or more damage is done to Light Jolteon (after applying Weakness and Resistance), prevent that damage. (Any other effects of attacks still happen.)",210],["Charm\u001fIf the Defending Pokémon attacks during your opponent's next turn, any damage it does is reduced by 10 (before applying Weakness and Resistance).",218],["Dodge\u001fIf Hitmonchan would be damaged by an attack during your opponent's next turn, flip a coin. If heads, prevent that attack's damage done to Hitmonchan. (Any other effects of attacks still happen.)",220],["Leer\u001fFlip a coin. If heads, the Defending Pokémon can't attack during your opponent's next turn. (Benching or evolving either Pokémon ends this effect.)",221],["Lightning Cut\u001fFlip a coin. If heads, this attack does 30 damage plus 10 more damage and does 10 damage to each of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) If tails, this attack does 30 damage and Shining Kabutops does 10 damage to itself.",227],["Flashing Eyes\u001fFlip 3 coins. If exactly 1 is heads, the Defending Pokémon is now Asleep. If exactly 2 are heads, the Defending Pokémon is now Confused. If all 3 are heads, the Defending Pokémon is now Paralyzed.",230],["Elemental Blast\u001fDiscard a Fire Energy card, a Water Energy card, and a Lightning Energy card attached to Lugia in order to use this attack.",96],["Burning Flame\u001fFlip 2 coins. For each heads, discard a Fire Energy card attached to Light Flareon or this attack does nothing. This attack does 30 damage plus 20 damage for each heads.",208],["Fire Blast\u001fDiscard a Fire Energy card attached to Light Ninetales in order to use this attack.",213],["Psyburst\u001fDiscard a Fire Energy card attached to Shining Mewtwo or this attack does nothing. This attack does 40 damage plus 10 damage for each Energy attached to the Defending Pokémon.",229],["Flame Wheel\u001fDiscard 3 Fire Energy cards attached to Typhlosion in order to use this attack. Do 20 damage to each Benched Pokémon (yours and your opponent's). (Don't apply Weakness and Resistance for Benched Pokémon.)",99]]);
function batch44Id(a){return BATCH44_RULES.get(a.name+'\u001f'+(a.text||''))??null;}
function batch44Effect(game, ix, a, u, p, f){
 const v=f.active, t=a.text||'';
 const flip=(suffix='flip')=>coin(`${a.name} — ${suffix}`);
 const heads=(count)=>{let n=0;for(let j=0;j<count;j++)if(flip(`${j+1}/${count}`))n++;return n};
 const own=()=>[p.active,...p.bench].filter(Boolean), rival=()=>[f.active,...f.bench].filter(Boolean);
 const all=()=>[...own(),...rival()];
 const card=x=>game.card(x), name=x=>card(x)?.name||'';
 const isBasicEnergy=id=>energy(lookup.get(id))&&!(lookup.get(id)?.subtypes||[]).includes('Special');
 const discardFrom=(unit,owner,idx)=>owner.discard.push(unit.energies.splice(idx,1)[0]);
 const popEnergy=(unit,owner,qty,condition=()=>true)=>{
  const indices=[];for(let j=0;j<unit.energies.length&&indices.length<qty;j++)if(condition(unit.energies[j]))indices.push(j);
  if(indices.length<qty)return false;
  for(const j of indices.reverse())discardFrom(unit,owner,j);return true;
 };
 const discardName=(unit,owner,count,energyName)=>popEnergy(unit,owner,count,id=>lookup.get(id)?.name===energyName+' Energy');
 const oppRound=game.round+(game.turn===1?1:0);
 const benchProtected=()=>game.unitHasPower(f.active,'Aurora Veil')||(f.active.benchShieldUntil>0&&f.active.benchShieldUntil>=game.round);
 const spread=(units,damage)=>{for(const unit of units.filter(Boolean))unit.damage+=damage};
 const draw=(side,count)=>{for(let n=0;n<count;n++)if(!side.deck.length)break;else side.hand.push(side.deck.pop());};
 const shuffleBack=(side,unit)=>{side.deck=shuffle([...side.deck,unit.id,...unit.under,...unit.energies]);if(side.active===unit)side.active=side.bench.shift()||null;else side.bench.splice(side.bench.indexOf(unit),1)};
 const returnHand=(side,unit)=>{side.hand.push(unit.id,...unit.under,...unit.energies);if(side.active===unit)side.active=side.bench.shift()||null;else side.bench.splice(side.bench.indexOf(unit),1)};
 let dmg=parseInt(a.damage,10)||0, status=null, after=null, ignoreWR=false, ignoreResistance=false;
 switch(ix){
 // Field effects and deck manipulation.
 case 39: after=()=>{shuffleBack(p,u);if(f.active)shuffleBack(f,f.active)};break; // Erika's Dragonair: Take Away
 case 69: if(flip()&&f.deck.length){const top=f.deck.pop();if(trainer(lookup.get(top)))f.discard.push(top);else f.hand.push(top)}break;
 case 70: if(!flip())break;after=()=>shuffleBack(p,u);break;
 case 72: if(f.hand.length){const j=Math.floor(Math.random()*f.hand.length);f.deck=shuffle([...f.deck,f.hand.splice(j,1)[0]])}break;
 case 91: if(flip())after=()=>returnHand(p,u);break;
 case 93: after=()=>{p.hand.push(u.id,...u.energies);p.discard.push(...u.under);p.active=p.bench.shift()||null};break;
 case 100: game.powerSilenceUntilSerial=game.turnSerial+3;break;
 // Energy costs and damage scaling.  Mandatory costs are validated before any mutation.
 case 53:{const n=u.energies.filter(id=>lookup.get(id)?.name==='Fire Energy').length; if(n===0)return {ok:false};discardName(u,p,n,'Fire');dmg=20+20*n;break}
 case 96:{if(!['Fire','Water','Lightning'].every(e=>u.energies.some(id=>lookup.get(id)?.name===e+' Energy')))return {ok:false};for(const e of ['Fire','Water','Lightning'])discardName(u,p,1,e);break}
 case 99: if(u.energies.length<3)return {ok:false};popEnergy(u,p,3);after=()=>spread([...p.bench,...(benchProtected()?[]:f.bench)],20);break;
 case 117: if(!flip()&&u.energies.length)popEnergy(u,p,1);break;
 case 121: if(flip()){for(let n=0;n<2;n++){const j=p.hand.findIndex(id=>energy(lookup.get(id)));if(j<0)break;u.energies.push(p.hand.splice(j,1)[0])}}break;
 case 181: if(u.energies.length){popEnergy(u,p,1);dmg=60}else dmg=30;break;
 case 184:{const h=heads(u.energies.length);dmg=20*h;for(let i=0;i<h&&f.deck.length;i++)f.discard.push(f.deck.pop());break}
 case 208:{const h=heads(2);if(u.energies.length<h)return {ok:false};popEnergy(u,p,h);dmg=30+20*h;break}
 case 213: if(!u.energies.length)return {ok:false};popEnergy(u,p,1);break;
 case 229: if(!u.energies.length)return {ok:false};popEnergy(u,p,1);dmg=40+10*v.energies.length;break;
 // Direct damage, statuses, and damage-counter effects.
 case 62:{const contributors=own().filter(x=>x.damage>=10);for(const x of contributors)x.damage-=10;after=(_,blocked)=>{if(!blocked)v.damage+=10*contributors.length};break}
 case 64: after=()=>{spread([...p.bench,...(benchProtected()?[]:f.bench)],10);u.damage+=50};break;
 case 65: u.damage+=20;break;
 case 73: dmg+=10*heads(3);break;
 case 78: dmg=0;after=(_,blocked)=>{if(!blocked)v.damage=Math.max(v.damage,game.maxHP(v)-10)};break;
 case 84:{const h=heads(3);for(let i=0;i<h;i++){const j=p.discard.findIndex(id=>lookup.get(id)?.name==='Fire Energy');if(j<0)break;p.hand.push(p.discard.splice(j,1)[0])}break}
 case 85: if(flip()){status='Poisoned';after=()=>{if(!benchProtected())spread(f.bench,10)}}break;
 case 97: dmg=0;after=()=>spread(all().filter(x=>(card(x)?.abilities||[]).length>0),20);break;
 case 118: dmg=(u.lastAttackerTurn===game.round-1)?30:20;break;
 case 138: if(flip())dmg=10+10*p.bench.filter(x=>/^(Omanyte|Omastar|Kabuto|Kabutops)$/.test(name(x))).length;break;
 case 139: {const one=flip('self and Bench'),two=flip('attack');if(one){u.damage+=40;spread([...p.bench,...(benchProtected()?[]:f.bench)],10)}if(!two)dmg=0;break}
 case 143:{const h=heads(3);dmg=h===1?40:h===3?60:0;after=()=>{if(h===0)v.damage=0;else if(h===2)v.damage=Math.max(0,v.damage-30)};break}
 case 152: if(flip()){u.attackShield=Infinity;u.preventAttackEffects=true}else dmg=0;break;
 case 153:{const h=heads(v.energies.length);dmg=10+10*h;after=(dealt)=>{if(dealt>0)u.damage=Math.max(0,u.damage-dealt)};break}
 case 162: if(flip())after=()=>{if(!benchProtected())spread(f.bench,10)};break;
 case 163: status='Poisoned';after=dealt=>{if(dealt>0)u.damage=Math.max(0,u.damage-Math.ceil(dealt/20)*10)};break;
 case 164: ignoreResistance=true;break;
 case 176:{dmg=0;let total=0;after=()=>{for(const target of rival())if(flip('target '+name(target))){if(target===f.active||!benchProtected()){target.damage+=10;total+=10}}u.damage=Math.max(0,u.damage-total)};break}
 case 186: dmg=(card(v)?.subtypes||[]).includes('Baby')?10:(card(v)?.subtypes||[]).includes('Basic')?30:50;break;
 case 196: dmg=0;after=()=>{for(const x of all())if(flip('target '+name(x))&&(x===p.active||x===f.active||!benchProtected()||p.bench.includes(x)))x.damage+=20};break;
 case 227: {if(flip()){dmg=40;after=()=>{if(!benchProtected())spread(f.bench,10)}}else{dmg=30;u.damage+=10}break}
 case 230: {const h=heads(3);status=h===1?'Asleep':h===2?'Confused':h===3?'Paralyzed':null;break}
 // Temporary / persistent controls; changes to attach, retreat, evolve and KO are part of this release.
 case 50: if(flip())v.energyAttachBlockUntil=oppRound;break;
 case 51: u.nextAttackBoost={name:'Gnaw',multiplyBase:2,until:game.round+1};break;
 case 57: if(game.maxHP(v)<=50){v.conditionalAttackLockUntil=oppRound;v.conditionalLockSource=u}break;
 case 61: game.powerSilenceUntilSerial=game.turnSerial+2;break;
 case 74: u.nextAttackBoost={name:'Double-edge',multiplyBase:2,multiplySelf:2,until:game.round+1};break;
 case 88: u.nextAttackBoost={name:'Quick Attack',multiplyBase:2,until:game.round+1};break;
 case 89: if(flip()){v.persistentAccuracySource=u;v.persistentAccuracySourceId=u.id}break;
 case 104: if(flip()){v.persistentRetreatSource=u;v.persistentRetreatSourceId=u.id}break;
 case 105: u.statusImmunityUntil=oppRound;break;
 case 108: v.switchLockUntil=oppRound;v.cantRetreatUntil=oppRound;break;
 case 110: if(flip()){dmg=30;v.switchLockUntil=oppRound;v.cantRetreatUntil=oppRound}else dmg=20;break;
 case 112: if(flip())u.endureUntil=oppRound;break;
 case 113: if(flip()){v.persistentAttackLockSource=u;v.persistentAttackLockSourceId=u.id}break;
 case 120: if(flip()){v.attackLocks.push({name:'*',until:oppRound});v.cantRetreatUntil=oppRound}break;
 case 129: v.pursuitSource=u;v.pursuitUntil=oppRound;break;
 case 142: v.poisonOnEnergyUntil=oppRound;break;
 case 166: if(flip()){v.persistentAccuracySource=u;v.persistentAccuracySourceId=u.id}break;
 case 188: u.nonDamageEffectsUntil=oppRound;break;
 case 194: v.evolutionLockUntil=oppRound;break;
 case 200: v.cantRetreatUntil=oppRound;v.smokescreenUntil=oppRound;break;
 case 202: u.endureCoinUntil=game.round+1;break;
 case 206: u.benchShieldUntil=oppRound;break;
 case 210: u.preventDamageThreshold=30;u.preventDamageThresholdUntil=oppRound;break;
 case 218: v.damageOutgoingReduction=10;v.damageOutgoingReductionUntil=oppRound;break;
 case 220: u.coinDamageShieldUntil=oppRound;break;
 case 221: if(flip()){v.persistentAttackLockSource=u;v.persistentAttackLockSourceId=u.id}break;
 default:return {ok:false};
 }
 return {ok:true,dmg,status,after,ignoreWR,ignoreResistance};
}

// v0.4.5 — strict, card-text keyed attack scripts. No automatic choices for unscripted cards.

// v0.4.6: card-text keyed handlers, audited against the local historical database.
const BATCH46 = new Map([["Lucky Shot\u001fChoose 1 of your opponent's Benched Pokémon and flip a coin. If heads, this attack does 30 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) This attack can't be used if your opponent has no Benched Pokémon.", "luckyShot", "foeBench"], ["Flytrap\u001fBefore doing damage, choose 1 of your opponent's Benched Pokémon and switch it with his or her Active Pokémon. This attack can't be used if your opponent has no Benched Pokémon.", "flytrap", "foeBench"], ["Tempt\u001fIf your opponent has any Benched Pokémon, flip a coin. If heads, choose 1 of your opponent's Benched Pokémon and switch it with the Defending Pokémon.", "tempt", "foeBenchOptional"], ["Sludge Grip\u001fIf your opponent has any Benched Pokémon, flip a coin. If heads, choose 1 of your opponent's Benched Pokémon and switch it with the Defending Pokémon. The new Defending Pokémon is now Poisoned.", "sludgeGrip", "foeBenchOptional"], ["Pull In\u001fIf your opponent has any Benched Pokémon, you may choose 1 of them and switch it with the Defending Pokémon (before doing damage or other effects of this attack). Either way, the Defending Pokémon is now Asleep.", "pullIn", "foeAnyOptional"], ["Entangle\u001fIf your opponent has any Benched Pokémon, choose 1 of them and switch it with the Defending Pokémon, then flip a coin. If heads, the new Defending Pokémon is now Paralyzed.", "entangle", "foeBench"], ["Fling Away\u001fIf your opponent has any Benched Pokémon, this attack does 30 damage instead of 50 and choose 1 of those Benched Pokémon. This attack does 30 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)", "flingAway", "foeBenchOptional"], ["Dragon Tornado\u001fUnless this attack Knocks Out the Defending Pokémon, choose 1 of your opponent's Benched Pokémon and switch it with the Defending Pokémon.", "dragonTornado", "foeBenchOptional"], ["Dragon Tornado\u001fIf this attack doesn't Knock Out the Defending Pokémon, and if there are any Pokémon on your opponent's Bench, choose 1 of them and switch it with the Defending Pokémon.", "dragonTornado", "foeBenchOptional"], ["Overhead Toss\u001fIf you have any Benched Pokémon, flip a coin. If tails, choose 1 of your Benched Pokémon. This attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)", "overheadToss", "ownBenchOptional"], ["Overhead Toss\u001fIf you have any Benched Pokémon, flip a coin. If tails, this attack does 10 damage to 1 of them. (Don't apply Weakness and Resistance for Benched Pokémon.)", "overheadToss", "ownBenchOptional"], ["Wash Away\u001fIf you have any Benched Pokémon, flip a coin. If heads, remove all damage counters from 1 of your Benched Pokémon and discard all Energy cards attached to it.", "washAway", "ownBenchOptional"], ["Electric Current\u001fTake 1 Lightning Energy card attached to Lt. Surge's Electabuzz and attach it to 1 of your Benched Pokémon. If you have no Benched Pokémon, discard that Energy card.", "electricCurrent", "ownBenchOptional"], ["Electric Current\u001fTake 1 Energy card attached to Flaaffy and attach it to 1 of your Benched Pokémon. If you have no Benched Pokémon, discard that Energy card.", "electricCurrent", "ownBenchOptional"], ["Baton Pass\u001fIf you have any Pokémon on your Bench, remove all Energy cards from Ledian and attach them to 1 of those Pokémon, then switch Ledian with that Pokémon.", "batonPass", "ownBenchOptional"], ["Plasma\u001fIf there are any Energy cards in your discard pile, attach 1 of them to Magneton.", "plasma", "none"], ["Terrorize\u001fIf the Defending Pokémon is a Basic, choose 1 of its attacks. That Pokémon can't use that attack during your opponent's next turn.", "terrorize", "none"], ["Lightning Strike\u001fYou may discard all Energy cards attached to Raichu. If you do, this attack does 80 damage.", "lightningStrike", "none"], ["Warm Up\u001fIf you have any benched Pokémon, search your deck for a Energy card and attach it to 1 of them. Then shuffle your deck.", "warmUp", "ownBenchOptional"], ["Tentacle Wrap\u001fFlip a coin. If heads, the Defending Pokémon is now Paralyzed. If tails, during your opponent's next turn, your opponent pays more to retreat the Defending Pokémon.", "tentacleWrap", "none"], ["Stare\u001fChoose 1 of your opponent's Pokémon. This attack does 10 damage to that Pokémon. Don't apply Weakness and Resistance for this attack. (Any other effects that would happen after applying Weakness and Resistance still happen.) If that Pokémon has a Pokémon Power, that power stops working until the end of your opponent's next turn.", "stare", "foeAny"], ["Stare\u001fChoose 1 of your opponent's Pokémon. This attack does 10 damage to that Pokémon. Don't apply Weakness and Resistance for this attack. (Any other effects that would happen after applying Weakness and Resistance still happen.) If that Pokémon has a Pokémon Power, that power stops working until the end of your opponent's next turn.", "stare", "foeAny"]].map(([key,kind,mode])=>[key,{kind,mode}]));
function batch46Rule(a){return BATCH46.get(a.name+'\u001f'+(a.text||''))||null}
function batch46Mode(a){return batch46Rule(a)?.mode||'none'}
function batch46Effect(g, rule, a, u,p,f, slot,choice){
 const {kind,mode}=rule;
 const damage=parseInt(a.damage,10)||0;
 const flip=()=>coin(a.name+' — coin flip');
 const bench=(side,j)=>side.bench[j];
 const swap=(side,j)=>{
   if(!Number.isInteger(j)||j<0||j>=side.bench.length)return false;
   const previous=side.active;[side.active,side.bench[j]]=[side.bench[j],previous];
   // A Pokémon leaving Active loses special conditions and temporary protection.
   previous.status=null;previous.poison=false;previous.poisonDamage=10;previous.burn=false;
   previous.attackShield=0;previous.halfShield=false;previous.preventAttackEffects=false;
   previous.powerSilencedUntilSerial=0;
   return true;
 };
 const strike=(victim,hit,j)=>{
  if(!victim||hit<=0)return;
  if(j!==-1&&(g.unitHasPower(f.active,'Aurora Veil')||f.active.benchShieldUntil>0&&f.active.benchShieldUntil>=g.round))return;
  if(j===-1){
   if(victim.immuneUntil>g.round||victim.preventAttackEffects||victim.nonDamageEffectsUntil>=g.round&&victim.nonDamageEffectsUntil>0)return;
   if(g.unitHasPower(victim,'Invisible Wall')&&hit>=30)return;
   if(victim.attackShield)hit=Math.max(0,hit-victim.attackShield);
   if(victim.halfShield)hit=Math.floor(hit/20)*10;
  }
  victim.damage+=hit;
  battlefieldAttack(g.turn,j,a.name,hit,j!==-1);
 };
 switch(kind){
 case 'luckyShot': if(flip())strike(f.bench[slot],30,slot);return {ok:true,direct:true,damage:0};
 case 'flytrap': if(!swap(f,slot))return {ok:false};return {ok:true,damage};
 case 'tempt': if(f.bench.length&&flip())swap(f,slot);return {ok:true,damage:0};
 case 'sludgeGrip': if(f.bench.length&&flip()){swap(f,slot);if(!g.unitHasPower(f.active,'Thick Skinned'))f.active.poison=true;}return {ok:true,damage};
 case 'pullIn': if(slot!==-1&&f.bench.length)swap(f,slot);return {ok:true,damage,after:(_dealt,blocked)=>{if(!blocked)f.active.status='Asleep'}};
 case 'entangle': if(!swap(f,slot))return {ok:false};if(flip())f.active.status='Paralyzed';return {ok:true,damage:0};
 case 'flingAway': return {ok:true,damage:f.bench.length?30:50,after:()=>{if(f.bench.length)strike(f.bench[slot],30,slot)}};
 case 'dragonTornado': return {ok:true,damage,after:()=>{if(f.active&&f.active.damage<g.maxHP(f.active)&&f.bench.length)swap(f,slot)}};
 case 'overheadToss': return {ok:true,damage,after:()=>{if(p.bench.length&&!flip())p.bench[slot].damage+=g.card(u).name==="Giovanni's Pinsir"?20:10}};
 case 'washAway': if(p.bench.length&&flip()){p.bench[slot].damage=0;p.discard.push(...p.bench[slot].energies.splice(0))}return {ok:true,damage:0};
 case 'electricCurrent': {
   const wanted=g.card(u).name==="Lt. Surge's Electabuzz"?'Lightning':null;
   const candidates=u.energies.map((id,i)=>({id,i})).filter(x=>!wanted||g.energies({energies:[x.id]}).includes(wanted));
   if(!candidates.length)return {ok:false};
   const index=choice===null?candidates[0].i:choice;
   if(!candidates.some(x=>x.i===index))return {ok:false};
   const card=u.energies.splice(index,1)[0];if(p.bench.length)p.bench[slot].energies.push(card);else p.discard.push(card);
   return {ok:true,damage};
 }
 case 'batonPass': return {ok:true,damage,after:()=>{if(p.bench.length){p.bench[slot].energies.push(...u.energies.splice(0));swap(p,slot)}}};
 case 'plasma': {
   const eligible=p.discard.map((id,i)=>({id,i})).filter(x=>energy(lookup.get(x.id)));
   const selected=eligible.find(x=>x.i===(choice===null?eligible[0]?.i:choice));
   if(choice!==null&&!selected)return {ok:false};
   if(selected)u.energies.push(p.discard.splice(selected.i,1)[0]);
   return {ok:true,damage};
 }
 case 'terrorize':{
   if(basic(g.card(f.active))){const attacks=g.card(f.active)?.attacks||[];if(attacks.length){if(!Number.isInteger(choice)||choice<0||choice>=attacks.length)return {ok:false};f.active.attackLocks.push({name:attacks[choice].name,until:g.round+1});}}
   return {ok:true,damage:0};
 }
 case 'lightningStrike': if(choice===1){p.discard.push(...u.energies.splice(0));return {ok:true,damage:80}}return {ok:true,damage:40};
 case 'warmUp':{
   if(!p.bench.length)return {ok:true,damage:0};
   const eligible=p.deck.map((id,i)=>({id,i})).filter(x=>energy(lookup.get(x.id)));
   const selected=eligible.find(x=>x.i===(choice===null?eligible[0]?.i:choice));
   if(choice!==null&&!selected)return {ok:false};
   if(selected)p.bench[slot].energies.push(p.deck.splice(selected.i,1)[0]);
   p.deck=shuffle(p.deck);return {ok:true,damage:0};
 }
 case 'tentacleWrap': if(flip())f.active.status='Paralyzed';else {f.active.extraRetreatCost=1;f.active.extraRetreatCostUntilSerial=g.turnSerial+2}return {ok:true,damage};
 case 'stare':{
   const victim=slot===-1?f.active:f.bench[slot];strike(victim,10,slot);
   if((g.card(victim)?.abilities||[]).length)victim.powerSilencedUntilSerial=g.turnSerial+2;
   return {ok:true,direct:true,damage:0};
 }
 }
 return {ok:false};
}

function gEnergyHint(name){return name==="Lt. Surge's Electabuzz"?'Lightning':null}
function gEnergyOK(id,hint){return !hint||energyType(id)===hint}
const BATCH45_RULES = new Map([["Jump Over\u001fIf you opponent has any Benched Pokémon, choose 1 of them. Flip a coin. If heads, this attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)", 1], ["Flame Jet\u001fFlip a coin. If heads, choose 1 of your opponent's Pokémon. This attack does 40 damage to that Pokémon. Don't apply Weakness and Resistance for this attack. (Any other effects that would happen after applying Weakness and Resistance still happen.)", 2], ["Stretch Vine\u001fChoose 1 of your opponent's Benched Pokémon, and this attack does 10 damage to it. (Don't apply Weakness and Resistance for Benched Pokémon.)", 3], ["Shadow Attack\u001fFlip a coin. If heads, and if your opponent has any Benched Pokémon, choose 1 of them and this attack does 30 damage to it. (Don't apply Weakness and Resistance for Benched Pokémon.)", 4], ["Magic Darts\u001fChoose 1 of your opponent's Pokémon and flip 3 coins. This attack does 10 damage times the number of heads to that Pokémon. Don't apply Weakness and Resistance for this attack.", 5], ["Overrun\u001fFlip a coin. If heads and if your opponent has any Benched Pokémon, choose 1 of them and this attack does 20 damage to it. (Don't apply Weakness and Resistance for Benched Pokémon.)", 6], ["Mean Look\u001fThe Defending Pokémon can't retreat as long as Murkrow remains your Active Pokémon. (Benching or evolving either Pokémon ends this effect.)", 7], ["Fire Wind\u001fIf your opponent has any Benched Pokémon, choose 1 of them. Flip 2 coins. For each heads, this attack does 10 damage to that Pokémon. (Don't apply Weakness and Resistance.)", 8], ["Recover\u001fDiscard 1 Energy attached to Corsola or this attack does nothing. Remove all damage counters from Corsola.", 9], ["Slime\u001fIf an attack would do damage to Wooper during your opponent's next turn, your opponent flips a coin. If tails, prevent all damage done to Wooper from that attack. (Any other effects of that attack happen.)", 10], ["Searing Flames\u001fDiscard 2 Energy cards attached to Entei or this attack does nothing.", 11], ["Sacred Fire\u001fFlip a coin. If heads, choose 1 of your opponent's Pokémon. This attack does 40 damage to that Pokémon. Don't apply Weakness and Resistance.", 12], ["Mega Flame\u001fFlip 2 coins. For each tails, discard 1 Energy card from Entei, if it has any.", 13], ["Lightning Spark\u001fIf your opponent has any Benched Pokémon, flip a coin. If heads, choose 1 of them and this attack does 20 damage to it. (Don't apply Weakness and Resistance for Benched Pokémon.)", 14], ["Sharpshooting\u001fFlip a coin. If heads, choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. Don't apply Weakness and Resistance.", 15], ["Stun Wave\u001fIf the Defending Pokémon has a Pokémon Power, that power stops working until the end of your next turn.", 16], ["Water Cannon\u001fChoose 1 of your opponent's Pokémon. This attack does 10 damage for each Energy card attached to Dark Omanyte. Don't apply Weakness and Resistance. You can't do more than 30 damage in this way.", 17], ["Thundersquall\u001fIf your opponent has any Benched Pokémon, choose 1 of them and this attack does 10 damage to that Pokémon for each Energy attached to Shining Raichu. (Don't apply Weakness and Resistance for Benched Pokémon.)", 18], ["Stoke\u001fSearch your deck for a Fire Energy card and attach it to Blaine's Growlithe. Shuffle your deck afterward.", 19], ["Energy Support\u001fSearch your deck for a Psychic Energy card. Show that card to your opponent, then put it into your hand. Shuffle your deck afterward.", 20], ["Call for Family\u001fSearch your deck for a card named Murkrow and put it onto your Bench. Shuffle your deck afterward. (You can't use this attack if your Bench is full.)", 21], ["Guiding Flame\u001fPut a Baby Pokémon or a Basic Pokémon card from your discard pile onto your Bench. (You can't use this attack if your Bench is full.)", 22], ["Healing Water\u001fRemove a number of damage counters from 1 of your Benched Pokémon equal to the number of Energy cards attached to Shining Celebi. If the Pokémon has fewer damage counters than that, remove all of them.", 23], ["Return Home\u001fIf you have any Benched Pokémon, shuffle 1 of them and all cards attached to it into your deck.", 24], ["Poison Bind\u001fThe Defending Pokémon is now Poisoned. Flip a coin. If heads, the Defending Pokémon can't retreat until the end of your opponent's next turn and if the effect of an attack, Pokémon Power, or Trainer card would change that player's Active Pokémon, that part of the effect does nothing.", 25], ["Hind Kick\u001fIf you have any Benched Pokémon, flip a coin. If heads, switch Blaine's Ponyta with 1 of your Benched Pokémon.", 26]]);
const BATCH45_MODES = {"1": "benchOptional", "2": "any", "3": "bench", "4": "benchOptional", "5": "any", "6": "benchOptional", "7": "none", "8": "benchOptional", "9": "none", "10": "none", "11": "none", "12": "any", "13": "none", "14": "benchOptional", "15": "any", "16": "none", "17": "any", "18": "benchOptional", "19": "searchDeck", "20": "searchDeck", "21": "searchDeck", "22": "searchDiscard", "23": "ownBench", "24": "ownBenchOptional", "25": "none", "26": "ownBenchOptional"};
function batch45Id(a){return BATCH45_RULES.get(a.name+'\u001f'+(a.text||''))??null}
function batch45Mode(a){return BATCH45_MODES[batch45Id(a)]||'none'}
function batch45Effect(game,ix,a,u,p,f,slot){
 const own=p.active, opponent=f.active, mode=BATCH45_MODES[ix]||'none';
 const rivalBench=f.bench, activeDamage=parseInt(a.damage,10)||0;
 let damage=activeDamage;
 const flip=(label='flip')=>coin(a.name+' — '+label);
 const target=mode==='any'?(slot===-1?f.active:f.bench[slot]):f.bench[slot];
 const strike=(unit,amount,position)=>{
  if(!unit||amount<=0)return;
  if(unit!==f.active&&(game.unitHasPower(f.active,'Aurora Veil')||f.active.benchShieldUntil>=game.round&&f.active.benchShieldUntil>0))return;
  // These targeted attacks explicitly ignore Weakness/Resistance, not all protection.
  if(unit===f.active){
   if(unit.immuneUntil>game.round||unit.preventBelow>0&&amount<=unit.preventBelow||unit.preventDamageThresholdUntil>=game.round&&unit.preventDamageThreshold>0&&amount>=unit.preventDamageThreshold)return;
   if(game.unitHasPower(unit,'Invisible Wall')&&amount>=30)return;
   if(game.unitHasPower(unit,'Transparency')&&coin('Haunter — Transparency'))return;
   if(unit.coinDamageShieldUntil>=game.round&&coin('Dodge — damage prevention'))return;
   if(unit.slimeShieldUntilSerial>game.turnSerial&&!coin('Slime — damage prevention'))return;
   if(unit.halfShield)amount=Math.floor(amount/20)*10;
   if(unit.attackShield>0)amount=Math.max(0,amount-unit.attackShield);
  }
  unit.damage+=amount;
  if(unit===f.active&&amount>0){unit.lastAttacker=u;unit.lastAttackerPlayer=p;unit.lastAttackerTurn=game.round;
    if(game.unitHasPower(unit,'Strikes Back'))u.damage+=10;
    if(game.unitHasPower(unit,'Fluffy Wool')&&coin('Fluffy Wool'))u.status='Asleep';}
  battlefieldAttack(game.turn,position,a.name,amount,position!==-1);
 };
 // Direct attacks don't damage the opponent's Active Pokémon unless it was selected.
 switch(ix){
 case 1: if(rivalBench.length&&flip('jump'))strike(target,20,slot);return {ok:true,direct:true,damage:0};
 case 2: if(flip('flame jet'))strike(target,40,slot);return {ok:true,direct:true,damage:0};
 case 3: if(!rivalBench.length)return {ok:false};strike(target,10,slot);return {ok:true,direct:true,damage:0};
 case 4: if(rivalBench.length&&flip('shadow'))strike(target,30,slot);return {ok:true,direct:true,damage:0};
 case 5: {let n=0;for(let j=0;j<3;j++)if(flip('dart '+(j+1)))n++;strike(target,n*10,slot);return {ok:true,direct:true,damage:0};}
 case 6: return {ok:true,damage,after:()=>{if(rivalBench.length&&flip('overrun'))strike(target,20,slot)}};
 case 7: f.active.persistentRetreatSource=u;f.active.persistentRetreatSourceId=u.id;return {ok:true,damage:0};
 case 8: return {ok:true,damage,after:()=>{if(rivalBench.length){let h=0;for(let j=0;j<2;j++)if(flip('fire wind '+(j+1)))h++;strike(target,h*10,slot)}}};
 case 9: if(!u.energies.length)return {ok:false};p.discard.push(u.energies.pop());u.damage=0;return {ok:true,damage:0};
 case 10: u.slimeShieldUntilSerial=game.turnSerial+2;return {ok:true,damage:0};
 case 11: if(u.energies.length<2)return {ok:false};p.discard.push(...u.energies.splice(u.energies.length-2,2));return {ok:true,damage};
 case 12: if(flip('sacred fire'))strike(target,40,slot);return {ok:true,direct:true,damage:0};
 case 13: for(let j=0;j<2;j++)if(!flip('mega flame '+(j+1))&&u.energies.length)p.discard.push(u.energies.pop());return {ok:true,damage};
 case 14: return {ok:true,damage,after:()=>{if(rivalBench.length&&flip('spark'))strike(target,20,slot)}};
 case 15: if(flip('sharpshooting'))strike(target,20,slot);return {ok:true,direct:true,damage:0};
 case 16: return {ok:true,damage,after:(_amount,blocked)=>{if(!blocked&&(game.card(f.active)?.abilities||[]).length)f.active.powerSilencedUntilSerial=game.turnSerial+3}};
 case 17: strike(target,u.energies.length*10,slot);return {ok:true,direct:true,damage:0};
 case 18: return {ok:true,damage,after:()=>{if(rivalBench.length)strike(target,u.energies.length*10,slot)}};
 case 19: case 20: case 21: {
  const wanted=ix===19?'Fire Energy':ix===20?'Psychic Energy':'Murkrow';
  const items=p.deck.map((id,index)=>({id,index,c:lookup.get(id)})).filter(x=>x.c?.name===wanted);
  const selected=items.find(x=>x.index===game.batch45SearchChoice);
  if(items.length&& !selected)return {ok:false};
  if(ix===21&&p.bench.length>=5)return {ok:false};
  if(selected){const id=p.deck.splice(selected.index,1)[0];if(ix===19)u.energies.push(id);else if(ix===20)p.hand.push(id);else p.bench.push(unit(id));}
  p.deck=shuffle(p.deck);
  return {ok:true,damage:0};
 }
 case 22: {
  if(p.bench.length>=5)return {ok:false};
  const found=p.discard.map((id,index)=>({id,index,c:lookup.get(id)})).filter(x=>x.c?.supertype==='Pokémon'&&(basic(x.c)||(x.c.subtypes||[]).includes('Baby')));
  const chosen=found.find(x=>x.index===game.batch45SearchChoice);
  if(found.length&&!chosen)return {ok:false};
  if(chosen)p.bench.push(unit(p.discard.splice(chosen.index,1)[0]));
  return {ok:true,damage};
 }
 case 23: {
  const v=p.bench[slot];if(!v)return {ok:false};
  v.damage=Math.max(0,v.damage-u.energies.length*10);return {ok:true,damage:0};
 }
 case 24: {
  if(p.bench.length){const v=p.bench[slot];if(!v)return {ok:false};
    p.deck=shuffle([...p.deck,v.id,...(v.under||[]),...v.energies]);p.bench.splice(slot,1);}
  return {ok:true,damage};
 }
 case 25: return {ok:true,damage,after:(_amount,blocked)=>{if(!blocked&&!game.unitHasPower(f.active,'Thick Skinned'))f.active.poison=true;if(flip('poison bind'))f.active.cantRetreatUntilSerial=game.turnSerial+2}};
 case 26: if(p.bench.length&&flip('hind kick')){
    const v=p.bench[slot];if(!v)return {ok:false};[p.active,p.bench[slot]]=[v,p.active];p.bench[slot].status=null;p.bench[slot].poison=false;
  }return {ok:true,damage};
 default:return {ok:false};
 }
}


// v0.4.9 — verified attacks with explicit choices rather than heuristics.
// The keys identify individual historical printings; no other cards are enabled by these handlers.
const ATTACK49=Object.freeze({
 'base1-39|Conversion 1':'conversionWeak', 'base5-48|Conversion 1':'conversionWeak',
 'base1-39|Conversion 2':'conversionResist',
 'basep-46|Lightning Rod':'lightningRod', 'basep-46|Lightning Bolt':'lightningBolt',
 'basep-44|Burning Fire':'burningFire', 'base5-44|Flame Pillar':'flamePillar',
 'basep-23|Lightning Burn':'lightningBurn',
 'neo2-7|Lock-on':'lockOn', 'neo2-26|Lock-on':'lockOn',
 'neo3-8|Dark Flame':'darkFlame',
 'neo3-25|Core Stream':'coreStream',
 'neo4-25|Beatdown':'beatdown',
 'neo2-44|Belly Drum':'bellyDrum'
});
const TYPES49=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function batch49Kind(c,a){return ATTACK49[`${c?.id}|${a?.name}`]||null}
function batch49Options(g,kind){
 const p=g.me,f=g.foe,u=p.active;
 if(kind==='conversionWeak'||kind==='conversionResist'||kind==='coreStream')return TYPES49.map((name,index)=>({index,name}));
 if(kind==='lightningRod')return [f.active,...f.bench].map((v,j)=>({index:j-1,name:`${g.card(v)?.name} (${j?'Bench '+j:'Active'})`}));
 if(kind==='flamePillar')return [{index:-1,name:'Do not discard Energy'},...u.energies.flatMap((id,j)=>f.bench.map((v,slot)=>({index:slot*100+j,name:`Discard ${lookup.get(id)?.name||id} → ${g.card(v)?.name} (Bench ${slot+1})`})) )];
 if(kind==='lightningBurn')return f.bench.map((v,index)=>({index,name:`${g.card(v)?.name} (Bench ${index+1})`}));
 if(kind==='burningFire')return [u,...p.bench].flatMap((v,slot)=>v.energies.map((id,j)=>({index:slot*100+j,name:`${g.card(v)?.name} — ${lookup.get(id)?.name||id} #${j+1}`})));
 if(kind==='darkFlame')return u.energies.flatMap((id,discardIndex)=>[...p.discard.map((eid,j)=>({index:discardIndex*1000+j,name:`Discard ${lookup.get(id)?.name}, recover ${lookup.get(eid)?.name}`})).filter(x=>energy(lookup.get(p.discard[x.index%1000]))),{index:discardIndex*1000+p.discard.length,name:`Discard ${lookup.get(id)?.name}, then reattach it`}]);
 if(kind==='bellyDrum')return p.deck.map((id,index)=>({index,name:lookup.get(id)?.name||id})).filter(x=>isBasicEnergyCard(lookup.get(p.deck[x.index])));
 return [];
}
function batch49Validate(g,kind,opts,choice){
 if(['conversionWeak','conversionResist','coreStream','lightningRod','flamePillar','lightningBurn','darkFlame'].includes(kind)){
  if(kind==='darkFlame'&&!opts.length)return {ok:false};
  if(kind==='lightningBurn'&&!opts.length)return {ok:true,value:null};
  if(kind==='conversionWeak'&&!(g.card(g.foe.active)?.weaknesses||[]).length)return {ok:true,value:null};
  if(choice===null&&g.turn===0)return {prompt:true};
  const value=choice===null?opts[0]?.index:choice;
  return {ok:opts.some(x=>x.index===value),value};
 }
 if(['burningFire','bellyDrum'].includes(kind)){
  if(choice===null&&g.turn===0&&opts.length)return {prompt:true,multi:true};
  const values=choice===null?(kind==='burningFire'?[]:opts.slice(0,2).map(x=>x.index)):choice;
  if(!Array.isArray(values)||values.length>(kind==='bellyDrum'?2:opts.length)||new Set(values).size!==values.length||values.some(v=>!opts.some(x=>x.index===v)))return {ok:false};
  return {ok:true,value:values};
 }
 return {ok:true,value:null};
}
function batch49Effect(g,kind,choice,a,u,p,f){
 let damage=parseInt(a.damage,10)||0,direct=false,after=()=>{};
 switch(kind){
  case 'conversionWeak':if(choice!==null)f.active.weaknessOverride=TYPES49[choice];break;
  case 'conversionResist':u.resistanceOverride=TYPES49[choice];break;
  case 'lightningRod':(choice===-1?f.active:f.bench[choice]).lightningRodMarker=true;break;
  case 'lightningBolt':after=()=>{
   for(const [j,v] of [f.active,...f.bench].entries())if(v.lightningRodMarker){
    if(j>0&&g.unitHasPower(f.active,'Aurora Veil'))continue;
    const hit=calculateDamage(20,g.card(u),modifiedType49(g.card(v),v));
    v.damage+=hit;g.log(`Lightning Rod bonus: ${g.card(v)?.name} took ${hit} damage.`);
    battlefieldAttack(g.turn,j-1,a.name,hit,j>0);
   }
  };break;
  case 'burningFire':{
   const perUnit=new Map();for(const n of choice){const slot=Math.floor(n/100),idx=n%100;const indices=perUnit.get(slot)||[];indices.push(idx);perUnit.set(slot,indices)}
   for(const [slot,indices] of perUnit){const v=slot===0?u:p.bench[slot-1];for(const j of indices.sort((a,b)=>b-a))p.discard.push(v.energies.splice(j,1)[0]);}
   damage=10+choice.length*10;break;
  }
  case 'flamePillar':if(choice!==-1){const slot=Math.floor(choice/100),j=choice%100;p.discard.push(u.energies.splice(j,1)[0]);after=()=>{if(f.bench[slot]&&!g.unitHasPower(f.active,'Aurora Veil')){f.bench[slot].damage+=10;battlefieldAttack(g.turn,slot,a.name,10,true)}};}break;
  case 'lightningBurn':{
   const heads=coin(a.name+' — Lightning Burn');if(heads){after=()=>{if(choice!==null&&f.bench[choice]&&!g.unitHasPower(f.active,'Aurora Veil')){f.bench[choice].damage+=30;battlefieldAttack(g.turn,choice,a.name,30,true)}};}else u.damage+=30;
   break;
  }
  case 'lockOn':u.lockOnTarget=f.active;u.lockOnTargetId=f.active.id;u.lockOnUntil=g.round+1;break;
  case 'darkFlame':{
   const di=Math.floor(choice/1000),recovery=choice%1000;
   const discarded=u.energies.splice(di,1)[0];
   if(recovery===p.discard.length)u.energies.push(discarded);
   else {const recovered=p.discard.splice(recovery,1)[0];p.discard.push(discarded);if(recovered)u.energies.push(recovered)}
   break;
  }
  case 'coreStream':{
   const type=TYPES49[choice];damage=0;direct=true;
   for(const [j,v] of [f.active,...f.bench].entries()){
    if(v.energies.some(id=>energyType(id)===type)&&!(j>0&&g.unitHasPower(f.active,'Aurora Veil'))){v.damage+=20;battlefieldAttack(g.turn,j-1,a.name,20,j>0)}
   }
   break;
  }
  case 'beatdown':if((g.card(f.active)?.name||'').includes('Dark')||g.card(f.active)?.types?.includes('Darkness'))if(coin('Beatdown bonus'))damage=100;break;
  case 'bellyDrum':{
   u.damage+=30;
   if(u.damage<g.maxHP(u)){
    for(const j of [...choice].sort((a,b)=>b-a))u.energies.push(p.deck.splice(j,1)[0]);
    p.deck=shuffle(p.deck);
   }
   break;
  }
 }
 return {damage,direct,after};
}
function modifiedType49(card,unit){
 return unit&&(unit.weaknessOverride||unit.resistanceOverride)?{...card,
  weaknesses:unit.weaknessOverride?[{type:unit.weaknessOverride,value:'×2'}]:card.weaknesses,
  resistances:unit.resistanceOverride?[{type:unit.resistanceOverride,value:'-30'}]:card.resistances}:card;
}

// v0.4.8 — card-ID-specific attack handlers. All choices are validated before committing an attack.
const ATTACK48=Object.freeze({
 'base3-8|Prophecy':{kind:'prophecy'},'base3-23|Prophecy':{kind:'prophecy'},'neo1-52|Prophecy':{kind:'prophecy'},
 'gym2-39|Errand-Running':{kind:'errand'},
 'neo4-106|Miracle Leaf':{kind:'miracle'},
 'neo3-54|Psykiss':{kind:'psykiss'},
 'neo4-9|Threaten':{kind:'threaten'},
 'neo4-72|Reflected Sunlight':{kind:'sunlight'},
 'neo3-33|Lava Flow':{kind:'lava'},
 'neo4-18|Ball of Flame':{kind:'ball'},
 'neo4-107|White-Hot Flame':{kind:'whitehot'}
});
function batch48Rule(card,a){return ATTACK48[`${card?.id}|${a?.name}`]||null}
const PERM48=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
function batch48Choices(game,rule){
 const p=game.me,f=game.foe,u=p.active;
 if(rule.kind==='prophecy'){
  const out=[];
  for(let side=0;side<2;side++){
   const owner=side?f:p,top=owner.deck.slice(-3).reverse(),perm=PERM48.filter(seq=>seq.slice(0,top.length).every(v=>v<top.length));
   for(const [j,order] of perm.entries())out.push({index:side*6+j,name:`${owner.name}: ${order.slice(0,top.length).map(k=>lookup.get(top[k])?.name||top[k]).join(' → ')} (top first)`,side,order});
  }
  return out;
 }
 if(rule.kind==='errand')return p.deck.map((id,index)=>({id,index,name:lookup.get(id)?.name})).filter(x=>trainer(lookup.get(x.id)));
 if(rule.kind==='miracle')return ['Asleep','Confused','Poisoned'].map((name,index)=>({index,name}));
 if(rule.kind==='psykiss')return [f.active,...f.bench].flatMap((u,slot)=>u?u.energies.map((id,j)=>({index:slot*100+j,name:`${game.card(u)?.name}: ${lookup.get(id)?.name||id}`})).filter(x=>(lookup.get(f.active===u?f.active.energies[x.index%100]:u.energies[x.index%100])?.subtypes||[]).includes('Special')):[]);
 if(rule.kind==='threaten')return f.hand.map((id,index)=>({index,id,name:lookup.get(id)?.name||id})).filter(x=>trainer(lookup.get(x.id)));
 if(rule.kind==='lava')return u.energies.map((id,index)=>({index,name:`${lookup.get(id)?.name||id} (${index+1})`}));
 if(rule.kind==='ball')return [{index:-1,name:'Keep Fire Energy (20 damage to Active only)'},...u.energies.map((id,index)=>({index,name:`Discard ${lookup.get(id)?.name||id} (${index+1})` })).filter(x=>x.index>=0&&lookup.get(u.energies[x.index])?.name==='Fire Energy').flatMap(x=>f.bench.map((b,slot)=>({index:slot*100+x.index,name:`${x.name} → ${game.card(b)?.name} (Bench ${slot+1})`})) )];
 if(rule.kind==='whitehot')return u.energies.flatMap((id,j)=>lookup.get(id)?.name==='Fire Energy'?u.energies.map((other,k)=>lookup.get(other)?.name==='Lightning Energy'&&k!==j?{index:j*100+k,name:`Discard Fire #${j+1} and Lightning #${k+1}`}:null).filter(Boolean):[]);
 return [];
}
function batch48Ready(game,rule,choices,choice){
 const kind=rule.kind;
 if(kind==='sunlight'){
  if(choice===null&&game.turn===0)return {prompt:'recipient'};
  if(choice===null&&game.turn===1){const energyIndices=game.me.hand.map((id,i)=>energy(lookup.get(id))?i:-1).filter(i=>i>=0).slice(0,2);return {ok:true,value:{slot:-1,energyIndices}};}
  if(typeof choice!=='object'||Array.isArray(choice)||!Number.isInteger(choice.slot)||!Array.isArray(choice.energyIndices))return {ok:false};
  const slot=choice.slot,indices=choice.energyIndices;
  if(slot< -1||slot>=game.me.bench.length||new Set(indices).size!==indices.length||indices.length>2||indices.some(k=>!Number.isInteger(k)||!energy(lookup.get(game.me.hand[k]))))return {ok:false};
  return {ok:true,value:choice};
 }
 if(['lava'].includes(kind)){
  if(choice===null&&game.turn===0)return {prompt:'multi'};
  const values=choice===null?[]:choice;
  if(!Array.isArray(values)||new Set(values).size!==values.length||values.some(k=>!Number.isInteger(k)||!choices.some(x=>x.index===k)))return {ok:false};
  return {ok:true,value:values};
 }
 if(kind==='prophecy'&&choices.length===0)return {ok:true,value:0};
 if(kind==='ball'&&choices.length===1)return {ok:true,value:-1};
 if(kind==='whitehot'&&!choices.length)return {ok:false};
 if(['errand','psykiss','threaten'].includes(kind)&&!choices.length)return {ok:true,value:null};
 if(kind==='prophecy'&&game.turn===1)return {ok:true,value:choices[0]?.index??0};
 if(choice===null&&game.turn===0)return {prompt:'single'};
 const value=choice===null?choices[0]?.index:choice;
 return {ok:choices.some(x=>x.index===value),value};
}
function batch48Before(game,rule,choice,attack,u,p,f){
 let dmg=parseInt(attack.damage,10)||0,after=()=>{};
 const flip=label=>coin(attack.name+' — '+label);
 switch(rule.kind){
  case 'prophecy':{const chosen=choice===0&&(!p.deck.length&&!f.deck.length)?null:batch48Choices(game,rule).find(x=>x.index===choice);if(chosen){const owner=chosen.side?f:p,top=owner.deck.splice(-Math.min(3,owner.deck.length)).reverse();const ordered=chosen.order.slice(0,top.length).map(k=>top[k]);owner.deck.push(...ordered.reverse());}break;}
  case 'errand':if(flip('find Trainer')&&choice!==null){p.hand.push(p.deck.splice(choice,1)[0]);p.deck=shuffle(p.deck)}break;
  case 'miracle':{let heads=0;for(let k=0;k<f.active.energies.length;k++)if(flip('Energy '+(k+1)))heads++;after=(_d,blocked)=>{if(heads&&!blocked){const s=['Asleep','Confused','Poisoned'][choice];if(s==='Poisoned'){if(!game.unitHasPower(f.active,'Thick Skinned'))f.active.poison=true}else f.active.status=s}};break;}
  case 'psykiss':if(choice!==null&&flip('return Special Energy')){const slot=Math.floor(choice/100),j=choice%100,v=slot===0?f.active:f.bench[slot-1];if(v?.energies[j]){f.deck=shuffle([...f.deck,v.energies.splice(j,1)[0]]);}}break;
  case 'threaten':if(choice!==null&&flip('shuffle Trainer')){const id=f.hand.splice(choice,1)[0];if(id)f.deck=shuffle([...f.deck,id]);}break;
  case 'sunlight':{const v=choice.slot===-1?p.active:p.bench[choice.slot];for(const j of [...choice.energyIndices].sort((a,b)=>b-a)){v.energies.push(p.hand.splice(j,1)[0]);}break;}
  case 'lava':{for(const j of [...choice].sort((a,b)=>b-a))p.discard.push(u.energies.splice(j,1)[0]);dmg=40+20*choice.length;break;}
  case 'ball':{if(choice>=0){const slot=Math.floor(choice/100),j=choice%100;p.discard.push(u.energies.splice(j,1)[0]);after=(_d,blocked)=>{if(!blocked&&!game.unitHasPower(f.active,'Aurora Veil')&&f.bench[slot]){f.bench[slot].damage+=20;battlefieldAttack(game.turn,slot,attack.name,20,true)}};}break;}
  case 'whitehot':{const fire=Math.floor(choice/100),lightning=choice%100;for(const j of [fire,lightning].sort((a,b)=>b-a))p.discard.push(u.energies.splice(j,1)[0]);if(!flip('recoil'))u.damage+=30;break;}
 }
 return {damage:dmg,after};
}

// Historical attacks added in v0.4.7. These are identified by printing ID and
// attack name, not by broad matches against incomplete translated card text.
const ATTACK47 = Object.freeze({
 'basep-8|Devolution Beam':{kind:'devolve'},
 'basep-9|Devolution Beam':{kind:'devolve'},
 'neo1-24|Feint Attack':{kind:'feint',damage:20},
 'neo2-13|Feint Attack':{kind:'feint',damage:30},
 'base3-14|Gigashock':{kind:'benchSpreadChoose',count:3,exact:true,damage:10},
 'base3-29|Gigashock':{kind:'benchSpreadChoose',count:3,exact:true,damage:10},
 'gym1-20|Rock Slide':{kind:'benchSpreadChoose',count:3,damage:10},
 'gym1-21|Tunneling':{kind:'benchSpreadChoose',count:2,damage:20,attackLock:true},
 'gym2-4|Wide Solarbeam':{kind:'benchSpreadChoose',count:2,exact:true,damage:20},
 'base3-12|Wildfire':{kind:'wildfire'},
 'base3-27|Wildfire':{kind:'wildfire'},
 'neo3-66|Dragon Bond':{kind:'searchDragon'},
 'basep-35|Let\'s Play!':{kind:'searchBaby'},
 'neo2-19|Magic Dust':{kind:'coinChooseStatus',statuses:['Asleep','Confused','Paralyzed','Poisoned']},
 'neo3-12|Delta Beam':{kind:'coinChooseStatus',statuses:['Asleep','Confused','Paralyzed']},
 'neo1-3|Sweet Nectar':{kind:'coinHealTarget'},
 'neo4-5|Crushing Blow':{kind:'coinEnergyDiscard'},
 'gym2-63|Pranks':{kind:'coinDiscardTop'}
});
function batch47Rule(card,attack){return ATTACK47[`${card?.id}|${attack?.name}`]||null}
function batch47Options(game,rule){
 const p=game.me,f=game.foe;
 switch(rule.kind){
  case 'devolve': return [
    ...[p.active,...p.bench].map((u,j)=>({key:j,side:0,slot:j-1,unit:u})),
    ...[f.active,...f.bench].map((u,j)=>({key:6+j,side:1,slot:j-1,unit:u}))
   ].filter(x=>x.unit?.under?.length).map(x=>({index:x.key,name:`${x.side===0?'Your':'Rival'} ${game.card(x.unit)?.name} (${x.slot===-1?'Active':'Bench '+(x.slot+1)})` }));
  case 'benchSpreadChoose':return f.bench.map((u,index)=>({index,name:`${game.card(u)?.name} (Bench ${index+1})`}));
  case 'wildfire':return game.me.active.energies.map((id,index)=>({index,name:`${lookup.get(id)?.name||id} (Energy ${index+1})`,id})).filter(x=>lookup.get(x.id)?.name==='Fire Energy');
  case 'searchBaby':return p.deck.map((id,index)=>({index,id,name:lookup.get(id)?.name})).filter(x=>(lookup.get(x.id)?.subtypes||[]).includes('Baby'));
  case 'coinChooseStatus':return rule.statuses.map((name,index)=>({index,name}));
  case 'coinHealTarget':return [p.active,...p.bench].filter(Boolean).map((u,index)=>({index,name:`${game.card(u)?.name} (${index?'Bench '+index:'Active'})`}));
  case 'coinEnergyDiscard':return f.active.energies.map((id,index)=>({index,name:`${lookup.get(id)?.name||id} (${index+1})`}));
  case 'coinDiscardTop':return f.discard.map((id,index)=>({index,name:lookup.get(id)?.name||id}));
  case 'searchDragon':return p.deck.map((id,index)=>({index,id,name:lookup.get(id)?.name})).filter(x=>['Gyarados','Dark Gyarados','Shining Gyarados'].includes(x.name));
  default:return [];
 }
}
function batch47Selection(game,rule,options,target,choice){
 if(rule.kind==='feint'){
  const slot=target===null&&game.turn===1?-1:target;
  return {ok:Number.isInteger(slot)&&slot>=-1&&slot<game.foe.bench.length,slot};
 }
 if(rule.kind==='searchBaby'&&game.me.bench.length>=5)return {ok:false};
 if(rule.kind==='devolve'&&!options.length)return {ok:false};
 if(rule.kind==='benchSpreadChoose'||rule.kind==='wildfire'){
  if(rule.kind==='benchSpreadChoose'&&!options.length)return {ok:true,values:[]};
  if(choice===null&&game.turn===1)choice=rule.kind==='wildfire'?options.slice(0,Math.min(options.length,game.foe.deck.length<=3?2:1)).map(o=>o.index):options.slice(0,rule.count).map(o=>o.index);
  if(choice===null&&game.turn===0&&options.length)return {ok:false,prompt:true,multi:true};
  const values=Array.isArray(choice)?choice:[];
  const max=rule.kind==='wildfire'?options.length:Math.min(rule.count,options.length);
  const min=rule.exact?max:0;
  if(values.length<min||values.length>max||new Set(values).size!==values.length||values.some(v=>!options.some(o=>o.index===v)))return {ok:false};
  return {ok:true,values};
 }
 if(['devolve','searchBaby','searchDragon','coinChooseStatus','coinHealTarget','coinEnergyDiscard','coinDiscardTop'].includes(rule.kind)){
  if(choice===null&&game.turn===0&&options.length)return {ok:false,prompt:true};
  if(choice===null){
   let best=options[0];
   if(game.turn===1&&rule.kind==='devolve')best=options.find(o=>o.index>=6)||best;
   if(game.turn===1&&rule.kind==='coinChooseStatus')best=options.find(o=>o.name==='Paralyzed')||options.find(o=>o.name==='Poisoned')||best;
   if(game.turn===1&&rule.kind==='coinHealTarget')best=[...options].sort((a,b)=>{const party=[game.me.active,...game.me.bench];return party[b.index].damage-party[a.index].damage})[0]||best;
   return {ok:true,value:best?.index??null};
  }
  if(!options.some(o=>o.index===choice))return {ok:false};
  return {ok:true,value:choice};
 }
 return {ok:false};
}
function batch47Resolve(game,rule,selection,attack,attacker,attackerPlayer,defenderPlayer,effectsBlocked=false){
 const p=attackerPlayer,f=defenderPlayer;
 if(rule.kind==='feint'){
  const victim=selection.slot===-1?f.active:f.bench[selection.slot];
  if(!victim)return;
  victim.damage+=rule.damage;
  game.log(`${attack.name} hit ${game.card(victim)?.name} for ${rule.damage}, ignoring Weakness, Resistance, Powers, and protection effects.`);
  battlefieldAttack(game.turn,selection.slot,attack.name,rule.damage,selection.slot!==-1);
 }
 if(rule.kind==='benchSpreadChoose'){
  const blocked=game.unitHasPower(f.active,'Aurora Veil')||(f.active.benchShieldUntil>0&&f.active.benchShieldUntil>=game.round);
  for(const slot of selection.values){const victim=f.bench[slot];if(!victim||blocked)continue;victim.damage+=rule.damage;battlefieldAttack(game.turn,slot,attack.name,rule.damage,true);}
  if(rule.attackLock)attacker.attackLocks.push({name:'*',until:game.round+1});
 }
 if(rule.kind==='wildfire'){
  for(const slot of [...selection.values].sort((a,b)=>b-a))p.discard.push(attacker.energies.splice(slot,1)[0]);
  for(let n=0;n<selection.values.length&&f.deck.length;n++)f.discard.push(f.deck.pop());
  game.log(`${attack.name}: discarded ${selection.values.length} Fire Energy; opponent discarded ${selection.values.length} cards from their deck (if available).`);
 }
 if(rule.kind==='devolve'){
  const side=selection.value>=6?f:p,slot=selection.value%6-1;
  const victim=slot===-1?side.active:side.bench[slot];if(!victim?.under?.length)return;
  const evolution=victim.id;
  victim.id=victim.under.shift();side.hand.push(evolution);
  victim.status=null;victim.poison=false;victim.poisonDamage=10;victim.burn=false;
  victim.attackShield=0;victim.preventAttackEffects=false;victim.cantRetreatUntil=0;
  victim.powerSilencedUntilSerial=0;victim.attackLocks=[];victim.usedAttacks={};
  // Devolution clears ongoing attack-imposed modifiers like an Evolution does.
  for(const key of ['smokescreenUntil','immuneUntil','preventBelow','damageBoost','damageBoostUntil','benchShieldUntil','nonDamageEffectsUntil','statusImmunityUntil','evolutionLockUntil','switchLockUntil','poisonOnEnergyUntil','energyAttachBlockUntil','damageOutgoingReductionUntil','persistentRetreatSource','persistentAttackLockSource','persistentAccuracySource','nextAttackBoost'])victim[key]=null;
  victim.halfShield=false;victim.cantRetreatUntilSerial=0;victim.coinDamageShieldUntil=0;
  game.log(`${attack.name}: returned ${lookup.get(evolution)?.name} to its owner's hand.`);
 }
 if(rule.kind==='coinChooseStatus'){
  if(coin(attack.name+' — condition check')&&!effectsBlocked&&selection.value!==null){
   const condition=rule.statuses[selection.value];
   if(condition==='Poisoned'){if(!game.unitHasPower(f.active,'Thick Skinned'))f.active.poison=true;}
   else f.active.status=condition;
   game.log(`${attack.name}: ${game.card(f.active)?.name} became ${condition}.`);
  }
 }
 if(rule.kind==='coinHealTarget'&&coin(attack.name+' — healing')&&selection.value!==null){
  const target=[p.active,...p.bench][selection.value];if(target)target.damage=0;
 }
 if(rule.kind==='coinEnergyDiscard'&&f.active.energies.length&&coin(attack.name+' — discard')&&selection.value!==null){
  const id=f.active.energies.splice(selection.value,1)[0];if(id)f.discard.push(id);
 }
 if(rule.kind==='coinDiscardTop'&&coin(attack.name+' — recycle')&&selection.value!==null){
  const id=f.discard.splice(selection.value,1)[0];if(id)f.deck.push(id);
 }
 if(rule.kind==='searchBaby'||rule.kind==='searchDragon'){
  const slot=selection.value;
  if(slot!==null){const id=p.deck.splice(slot,1)[0];if(rule.kind==='searchBaby'){
   const newborn=unit(id);newborn.playedTurn=game.round;p.bench.push(newborn);
  }else p.hand.push(id);}
  p.deck=shuffle(p.deck);
  game.log(`${attack.name}: ${slot===null?'no eligible card found':'searched and shuffled the deck'}.`);
 }
}

// v0.5.0 — attack responses use a turn-serial expiration, not a name-based approximation.
// The responder may have been knocked out, so effects resolve before KO cleanup.
const BATCH50=Object.freeze({
 'base5-46|Mirror Shell':'mirrorShell',
 'gym1-11|Crosscounter':'crosscounter',
 'gym1-12|Fire Wall':'fireWall',
 'gym1-13|Shadow Images':'shadowImages',
 'neo2-16|Counter':'counter',
 'neo2-35|Counter':'counter',
 'neo2-41|Secrete Poison':'secretePoison',
 'neo4-109|Reflect Shield':'reflectShield',
 'gym2-10|Giant Growth':'giantGrowth',
 'neo4-10|Rushing Flames':'rushingFlames',
 'neo1-29|Sweet Scent':'sweetScent'
});
function batch50Kind(card,attack){return BATCH50[`${card?.id}|${attack?.name}`]||null}
function batch50EnergyChoices(game){return [game.me.active,...game.me.bench].flatMap((v,slot)=>v?v.energies.map((id,j)=>({index:slot*100+j,name:`${game.card(v)?.name}: ${lookup.get(id)?.name}`,slot,j})):[])}
function batch50Incoming(game,defending,attacking,damage){
 let amount=damage;
 if(defending.shadowImages){
  if(!coin('Rocket’s Scyther — Shadow Images')){game.log('Shadow Images prevented the incoming attack damage.');return 0}
  // The effect lasts until Scyther takes actual damage, not just until the coin succeeds.
 }
 const response=defending.counterEffect;
 if(response?.expires>game.turnSerial&&amount>0){
  let returned=0;
  if(response.kind==='reflectShield'){
   if(coin('Reflect Shield')){amount=0;returned=20}
  }else if(response.kind==='crosscounter'){
   if(coin('Crosscounter'))returned=2*damage;
  }else if(response.kind==='counter'){
   if(coin('Counter'))returned=damage;
  }else if(response.kind==='mirrorShell')returned=damage;
  else if(response.kind==='fireWall')returned=10;
  else if(response.kind==='secretePoison'){
   if(!game.unitHasPower(attacking,'Thick Skinned'))attacking.poison=true;
   const current=game.me;
   if(!game.unitHasPower(current.active,'Aurora Veil'))for(const v of current.bench)v.damage+=10;
  }
  if(returned){
   // Counterattacks are made by the defending card, not the original attacker.
   const dealt=calculateDamage(returned,game.card(defending),game.card(attacking));
   attacking.damage+=dealt;
   game.log(`${game.card(defending)?.name}'s ${response.name} counterattacked for ${dealt}.`);
  }
 }
 if(amount>0)defending.shadowImages=false;
 return amount;
}
// v0.5.1: exact, card-ID-specific choices. The importer text is not executable code.
const ATTACK51 = Object.freeze({
 'gym2-40|Lunar Power':'lunar',
 'neo2-42|Hatch':'hatch',
 'neo4-83|Sunbathe':'sunbathe',
 'neo4-38|Explosive Evolution':'explosive',
 'neo1-30|Squaredance':'squaredance',
 'gym1-32|Jellyfish Pod':'jellyfish',
 'gym2-12|Super Removal':'superRemoval',
 'neo1-26|Pilfer':'pilfer',
 'neo3-19|Twister':'twister',
 'gym2-83|Group Attack':'groupAttack',
 'neo1-47|Char':'char',
 'neo3-11|Perish Song':'perish'
});
function batch51Kind(c,a){return ATTACK51[`${c?.id}|${a?.name}`]||null}
function batch51Options(game,kind,u){
 const p=game.me,f=game.foe,options=[];
 if(['lunar','hatch','sunbathe','explosive'].includes(kind)){
  const slots=kind==='lunar'?p.bench.map((v,i)=>({v,slot:i})):[{v:u,slot:-1}];
  for(const {v,slot} of slots)for(let j=0;j<p.deck.length;j++){
   const c=lookup.get(p.deck[j]),prev=game.card(v);
   if(!c||c.supertype!=='Pokémon'||!c.subtypes?.some(t=>/^Stage/.test(t)))continue;
   if(kind==='explosive' ? c.name!=='Dark Tyranitar' : !compatible(c,prev))continue;
   if(kind==='explosive'&&prev.name!=='Dark Pupitar')continue;
   options.push({index:(slot+1)*10000+j,slot,deckIndex:j,id:c.id,name:`${prev.name} → ${c.name}`});
  }
 } else if(kind==='squaredance'){
  for(let j=0;j<p.deck.length;j++){const c=lookup.get(p.deck[j]);if(isBasicEnergyCard(c))options.push({index:j,name:c.name,id:c.id});}
 } else if(kind==='jellyfish'){
  for(let j=0;j<p.deck.length;j++){const c=lookup.get(p.deck[j]);if(["Tentacool","Tentacruel","Misty's Tentacool","Misty's Tentacruel"].includes(c?.name))options.push({index:j,name:c.name,id:c.id});}
 } else if(kind==='superRemoval'){
  for(const [slot,v] of [f.active,...f.bench].entries())if(v)for(let j=0;j<v.energies.length;j++)options.push({index:slot*10000+j,slot,j,name:`${game.card(v).name}: ${lookup.get(v.energies[j])?.name||'Energy'}`});
 } else if(kind==='pilfer'){
  for(let j=0;j<p.discard.length;j++){const c=lookup.get(p.discard[j]);options.push({index:j,id:p.discard[j],name:c?.name||p.discard[j]});}
 } else if(kind==='twister'){
  for(let j=0;j<f.active.energies.length;j++){const id=f.active.energies[j];options.push({index:j,id,name:lookup.get(id)?.name||id});}
 } else if(kind==='groupAttack'){
  for(let j=0;j<p.deck.length;j++)if(lookup.get(p.deck[j])?.name==="Koga's Zubat")options.push({index:j,id:p.deck[j],name:"Koga's Zubat"});
 }
 return options;
}
function batch51Handle(game,kind,attackIndex,benchTarget,defer,choice,attack,source){
 const p=game.me,f=game.foe,now=game.turnSerial,token=source.id+'|'+attack.name;
 let pending=game.pendingAttack51;
 if(!pending||pending.source!==source||pending.token!==token||pending.turn!==now){pending={source,token,turn:now,heads:0};game.pendingAttack51=pending;}
 const finish=(message,withKO=true)=>{
  game.pendingAttack51=null;deckSearchRequest=null;game.log(`${p.name}: ${game.card(source).name} used ${attack.name}. ${message}`);
  if(withKO)game.resolveKO();if(!game.over&&!defer)game.end();render();return {done:true,value:true};
 };
 const options=batch51Options(game,kind,source);
 const prompt=(label,opts,{multi=false,min=0,max=opts.length}={})=>{
  if(game.turn===1)return null;
  deckSearchRequest={attackIndex,label,options:opts,multi,min,max,selected:[],execute:v=>game.attack(attackIndex,benchTarget,defer,v)};
  render();return {done:true,value:false};
 };
 const nums=Array.isArray(choice)?choice:null;
 const validMulti=(list,min=0,max=options.length)=>Array.isArray(list)&&list.length>=min&&list.length<=max&&new Set(list).size===list.length&&list.every(j=>options.some(o=>o.index===j));
 const take=(list,collection)=>{const picked=list.map(j=>collection[j]);for(const j of [...list].sort((a,b)=>b-a))collection.splice(j,1);return picked};
 if(['lunar','hatch','sunbathe','explosive'].includes(kind)){
  if(pending.heads===0)pending.heads=coin(attack.name+' — evolution')?1:-1;
  if(pending.heads<0)return finish('Tails — no evolution.');
  if(choice===null&&options.length){const r=prompt(`${attack.name}: choose an Evolution card (or skip).`,[...options,{index:-1,name:'Do not evolve'}]);if(r)return r;}
  if(choice!==null&&choice!==-1&&!options.some(o=>o.index===choice))return {done:true,value:false};
  const chosen=choice===-1?null:options.find(o=>o.index===choice)??options[0];
  if(kind==='explosive'){
   if(!game.unitHasPower(f.active,'Aurora Veil'))for(const v of f.bench)v.damage+=10;
   f.active.damage+=10;
  }
  if(['hatch','sunbathe'].includes(kind))source.damage=0;
  if(chosen){
   const v=chosen.slot===-1?source:p.bench[chosen.slot];const evolution=p.deck.splice(chosen.deckIndex,1)[0];
   const old=game.card(v);v.under=[v.id,...v.under];v.id=evolution;v.playedTurn=game.round;
   v.status=null;v.poison=false;v.poisonDamage=10;v.burn=false;v.attackShield=0;
   v.powerUses={};v.usedAttacks={};v.weaknessOverride=null;v.resistanceOverride=null;
   // Evolution by an attack counts as evolution and must trigger the incoming Power.
   game.onPlayEvolution(v,lookup.get(evolution));game.log(`${old.name} evolved to ${lookup.get(evolution).name} via ${attack.name}.`);
  }
  p.deck=shuffle(p.deck);
  return finish(chosen?'Evolution resolved.':'No Evolution card was chosen.');
 }
 if(kind==='squaredance'){
  if(!pending.rolled){pending.rolled=true;pending.heads=0;for(const v of [p.active,...p.bench,f.active,...f.bench])if(v&&coin('Squaredance — '+game.card(v).name))pending.heads++;}
  const max=Math.min(pending.heads,options.length);
  if(choice===null&&max){const r=prompt(`Squaredance: choose up to ${max} Basic Energy cards.`,options,{multi:true,max});if(r)return r;}
  const chosen=choice===null?options.slice(0,max).map(o=>o.index):choice;
  if(!validMulti(chosen,0,max))return {done:true,value:false};
  const items=take(chosen,p.deck);p.hand.push(...items);p.deck=shuffle(p.deck);
  return finish(`${pending.heads} Heads; ${items.length} Basic Energy cards drawn.`);
 }
 if(kind==='jellyfish'){
  if(choice===null&&options.length){const r=prompt('Jellyfish Pod: choose any number of Tentacool or Tentacruel cards.',options,{multi:true});if(r)return r;}
  const chosen=choice===null?options.map(o=>o.index):choice;
  if(!validMulti(chosen))return {done:true,value:false};
  const items=take(chosen,p.deck);p.hand.push(...items);p.deck=shuffle(p.deck);
  return finish(`Retrieved ${items.length} Pokémon.`);
 }
 if(kind==='superRemoval'){
  if(pending.heads===0)pending.heads=coin('Super Removal')?1:-1;
  if(pending.heads<0)return finish('Tails — no Energy discarded.');
  const grouped=new Map();for(const o of options)grouped.set(o.slot,(grouped.get(o.slot)||[]).concat(o));
  if(choice===null&&options.length){const r=prompt('Super Removal: choose exactly one Energy from every opposing Pokémon with Energy.',options,{multi:true,min:grouped.size,max:grouped.size});if(r)return r;}
  const chosen=choice===null?[...grouped.values()].map(xs=>xs[0].index):choice;
  if(!validMulti(chosen,grouped.size,grouped.size)||new Set(chosen.map(j=>Math.floor(j/10000))).size!==grouped.size)return {done:true,value:false};
  const picks=chosen.map(j=>({slot:Math.floor(j/10000),j:j%10000})).sort((a,b)=>b.slot-a.slot||b.j-a.j);
  for(const {slot,j} of picks){const v=slot===0?f.active:f.bench[slot-1];f.discard.push(v.energies.splice(j,1)[0]);}
  return finish(`${picks.length} opposing Energy cards discarded.`);
 }
 if(kind==='pilfer'){
  if(pending.heads===0)pending.heads=coin('Pilfer — discard recovery')?1:-1;
  if(pending.heads>0&&choice===null&&options.length){const r=prompt('Pilfer: choose one card from your discard pile to shuffle into your deck.',options);if(r)return r;}
  if(choice!==null&&!options.some(o=>o.index===choice))return {done:true,value:false};
  if(pending.heads>0&&options.length){const j=choice===null?options[0].index:choice;p.deck.push(p.discard.splice(j,1)[0]);}
  // Return the entire in-play stack to the deck, not the discard pile.
  p.deck=shuffle([...p.deck,source.id,...source.under,...source.energies]);
  p.active=p.bench.shift()||null;
  return finish('Aipom and all its attachments were shuffled into the deck.');
 }
 if(kind==='twister'){
  if(!pending.rolled){pending.rolled=true;pending.heads=Number(coin('Twister — 1'))+Number(coin('Twister — 2'));}
  const max=Math.min(pending.heads,options.length);
  if(choice===null&&max){const r=prompt(`Twister: choose ${max} opposing Energy cards to discard.`,options,{multi:true,min:max,max});if(r)return r;}
  const chosen=choice===null?options.slice(0,max).map(o=>o.index):choice;
  if(!validMulti(chosen,max,max))return {done:true,value:false};
  const items=take(chosen,f.active.energies);f.discard.push(...items);
  game.pendingAttack51=null;deckSearchRequest=null;
  return {damage:pending.heads?50:0}; // ordinary attack pipeline applies WR, counters, and Knock Outs
 }
 if(kind==='perish'){
  const eligible=f.active.status==='Asleep'&&f.active.lastNightEyesRound===game.round-1&&f.active.lastNightEyesBy===game.turn;
  if(eligible){f.active.damage=game.maxHP(f.active);return finish('The Asleep Defending Pokémon was Knocked Out.');}
  return finish('The Night Eyes condition was not met.');
 }
 if(kind==='char'){
  game.pendingAttack51=null;deckSearchRequest=null;
  return {damage:30};
 }
 if(kind==='groupAttack'){
  const max=Math.min(5-p.bench.length,options.length);
  if(choice===null&&max){const r=prompt(`Group Attack: choose up to ${max} Koga's Zubat cards to Bench.`,options,{multi:true,max});if(r)return r;}
  const chosen=choice===null?options.slice(0,max).map(o=>o.index):choice;
  if(!validMulti(chosen,0,max))return {done:true,value:false};
  const ids=take(chosen,p.deck);for(const id of ids){const v=unit(id);v.playedTurn=game.round;p.bench.push(v);for(const side of game.players){const source=side.active;if(source&&game.unitHasPower(source,'Hot Plate'))v.damage+=10;}}p.deck=shuffle(p.deck);
  game.pendingAttack51=null;deckSearchRequest=null;
  return {damage:10*[p.active,...p.bench].filter(v=>v&&game.card(v)?.name==="Koga's Zubat").length};
 }
 return {done:true,value:false};
}

// v0.5.3: historically specific attacks, with explicit choices and one-shot coin results.
const BATCH53=Object.freeze({
 'gym2-31|Bonfire':'bonfire',
 'gym1-14|Call of the Night':'callOfNight',
 'gym2-56|Invigorate':'invigorate',
 'neo4-7|Eerie Howl':'eerieHowl',
 'neo4-21|Provoke':'provoke',
 'neo4-19|Prehistoric Water':'prehistoricWater',
 'gym2-57|Helping Hand':'helpingHand'
});
function batch53Kind(c,a){return BATCH53[`${c?.id}|${a?.name}`]||null}
function batch53Options(game,kind){const p=game.me,f=game.foe;
 if(kind==='invigorate')return [p,f].flatMap((owner,side)=>owner.bench.length>=5?[]:owner.discard.map((id,index)=>({index:side*10000+index,name:`${owner.name}: ${lookup.get(id)?.name}`,id})).filter(x=>basic(lookup.get(x.id))));
 if(kind==='eerieHowl'||kind==='provoke')return f.bench.length>=5?[]:f.hand.map((id,index)=>({index,name:lookup.get(id)?.name,id})).filter(x=>{const c=lookup.get(x.id);return basic(c)||(c?.subtypes||[]).includes('Baby')});
 if(kind==='prehistoricWater')return [f.active,...f.bench].map((v,j)=>({index:j-1,name:game.card(v)?.name||'',id:v?.id})).filter(x=>{const v=x.index===-1?f.active:f.bench[x.index];return v?.under?.length>0});
 if(kind==='helpingHand')return [f.active,...f.bench].map((v,j)=>({index:j-1,name:game.card(v)?.name||'',id:v?.id})).filter(x=>x.id);
 if(kind==='bonfire')return game.me.active.energies.map((id,index)=>({index,name:lookup.get(id)?.name||id,id})).filter(x=>lookup.get(x.id)?.name==='Fire Energy');
 return [];
}
function batch53Validate(game,kind,selection,attackIndex,benchTarget,deferTurnEnd){
 const p=game.me,f=game.foe,u=p.active,options=batch53Options(game,kind);
 const request=(label,list,callback,multi=false,max=list.length)=>{deckSearchRequest={label,options:list,multi,min:0,max,selected:[],execute:callback};render();return false};
 const retry=x=>game.attack(attackIndex,benchTarget,deferTurnEnd,x);
 if(kind==='bonfire'){
  if(!game.pending53||game.pending53.kind!==kind||game.pending53.u!==u||game.pending53.serial!==game.turnSerial){
   let heads=0;for(let n=0;n<3;n++)if(coin('Bonfire — flip '+(n+1)))heads++;
   game.pending53={kind,u,serial:game.turnSerial,heads};
  }
  const n=game.pending53.heads;
  if(n>options.length)return {damage:0,choice:null};
  if(n&&selection===null&&game.turn===0)return request(`Bonfire: choose exactly ${n} Fire Energy card${n===1?'':'s'} to discard.`,options,retry,true,n);
  const chosen=selection===null?options.slice(0,n).map(x=>x.index):selection;
  if(!Array.isArray(chosen)||chosen.length!==n||new Set(chosen).size!==n||!chosen.every(j=>options.some(x=>x.index===j)))return false;
  return {damage:n*10,choice:chosen};
 }
 if(kind==='invigorate'||kind==='eerieHowl'||kind==='prehistoricWater'){
  if(selection===null&&options.length&&game.turn===0)return request(`${game.card(u).attacks[attackIndex].name}: choose a Pokémon.`,options,retry);
  const chosen=selection===null?options[0]?.index:null;
  const value=selection===null?chosen:selection;
  if(value!==undefined&&!options.some(x=>x.index===value))return false;
  if(value===undefined&&selection!==null)return false;
  return {damage:0,choice:value};
 }
 if(kind==='provoke'){
  if(selection===null&&options.length&&game.turn===0)return request('Provoke: select any number of the opponent’s Basic/Baby Pokémon to Bench.',options,retry,true,Math.min(options.length,5-f.bench.length));
  const chosen=selection===null?options.slice(0,5-f.bench.length).map(x=>x.index):selection;
  if(!Array.isArray(chosen)||chosen.length>5-f.bench.length||new Set(chosen).size!==chosen.length||!chosen.every(j=>options.some(x=>x.index===j)))return false;
  return {damage:0,choice:chosen};
 }
 if(kind==='helpingHand'){
  if(selection===null&&game.turn===0)return request('Helping Hand: choose an opposing Pokémon to heal.',options,retry);
  if(selection!==null&&typeof selection==='number'){
   if(!options.some(x=>x.index===selection))return false;
   const v=selection===-1?f.active:f.bench[selection];const counters=Math.floor(v.damage/10);
   if(game.turn===0)return request('Helping Hand: how many damage counters should be removed?',Array.from({length:counters+1},(_,index)=>({index,name:`Remove ${index} (draw ${index})`})),n=>retry({slot:selection,count:n}));
   return {damage:0,choice:{slot:selection,count:counters}};
  }
  const chosen=selection===null?{slot:options[0]?.index??-1,count:Math.floor(f.active.damage/10)}:selection;
  if(!chosen||!Number.isInteger(chosen.slot)||!options.some(x=>x.index===chosen.slot))return false;
  const v=chosen.slot===-1?f.active:f.bench[chosen.slot];
  if(!Number.isInteger(chosen.count)||chosen.count<0||chosen.count>Math.floor(v.damage/10))return false;
  return {damage:0,choice:chosen};
 }
 return {damage:0,choice:null};
}
function batch53After(game,kind,choice,attack,attacker,owner,opponent){
 if(kind==='bonfire'){
  for(const index of [...choice].sort((a,b)=>b-a))owner.discard.push(attacker.energies.splice(index,1)[0]);
  const hit=game.pending53?.heads*10||0;
  if(hit){for(const victim of opponent.bench){
   if(!victim)continue;
   const shield=game.unitHasPower(opponent.active,'Aurora Veil')||victim.preventAttackEffects||Boolean(victim.attackShield===Infinity);
   if(!shield)victim.damage+=Math.max(0,hit-(victim.attackShield||0));
  }}
  game.log(`Bonfire: ${hit} damage to every opposing Pokémon, without Weakness or Resistance.`);
  game.pending53=null;
 }
 if(kind==='callOfNight'&&opponent.active&&opponent.active.damage<game.maxHP(opponent.active)){
  const first=coin('Call of the Night — flip 1'),second=coin('Call of the Night — flip 2');
  if(first&&second){
   const target=opponent.active;opponent.deck=shuffle([...opponent.deck,target.id,...target.under,...target.energies]);
   opponent.active=opponent.bench.shift()||null;game.log('Call of the Night returned the Defending Pokémon and all attachments to its deck.');
  }
 }
 if(kind==='invigorate'&&choice!==undefined){const side=choice>=10000?opponent:owner,slot=choice%10000;const id=side.discard.splice(slot,1)[0];
  if(id){const v=unit(id);v.playedTurn=game.round;v.damage=Math.floor((Number(lookup.get(id)?.hp)||0)/20)*10;side.bench.push(v);game.log(`Invigorate placed ${lookup.get(id)?.name} onto ${side.name}'s Bench.`);}
 }
 if((kind==='eerieHowl'||kind==='provoke')&&opponent.bench.length<5){
  const selected=kind==='eerieHowl'?(choice===undefined?[]:[choice]):choice;
  for(const index of [...selected].sort((a,b)=>b-a)){if(opponent.bench.length>=5)break;const id=opponent.hand.splice(index,1)[0];if(id){const v=unit(id);v.playedTurn=game.round;opponent.bench.push(v);for(const side of game.players){const source=side.active;if(source&&game.unitHasPower(source,'Hot Plate'))v.damage+=10}}}
  game.log(`${attack.name}: placed ${selected.length} Pokémon from the opponent's hand onto their Bench.`);
 }
 if(kind==='prehistoricWater'&&choice!==undefined&&coin('Prehistoric Water')){
  const v=choice===-1?opponent.active:opponent.bench[choice];if(v?.under?.length){const cardId=v.id;v.id=v.under.shift();opponent.deck=shuffle([...opponent.deck,cardId]);
   v.status=null;v.poison=false;v.burn=false;v.attackShield=0;v.preventAttackEffects=false;v.attackLocks=[];v.usedAttacks={};
   for(const key of ['smokescreenUntil','immuneUntil','preventBelow','damageBoost','damageBoostUntil','benchShieldUntil','nonDamageEffectsUntil','statusImmunityUntil','evolutionLockUntil','switchLockUntil','poisonOnEnergyUntil','energyAttachBlockUntil','damageOutgoingReductionUntil','persistentRetreatSource','persistentAttackLockSource','persistentAccuracySource','nextAttackBoost'])v[key]=null;
   game.log(`Prehistoric Water devolved ${lookup.get(cardId)?.name} and shuffled its Evolution into the deck.`);
  }
 }
 if(kind==='helpingHand'&&choice){const v=choice.slot===-1?opponent.active:opponent.bench[choice.slot];if(v){v.damage-=10*choice.count;game.draw(owner,choice.count);game.log(`Helping Hand healed ${choice.count} counters and drew ${choice.count} cards.`)}}
}

// v0.5.4: exact historical card attacks with validated Energy/evolution choices.
// Imported text drops printed energy symbols for some cards; these card IDs are verified.
const BATCH54=Object.freeze({
 'base5-34|Energy Bomb':'energyBomb',
 'basep-12|Energy Control':'energyControl',
 'neo2-52|Energy Cycle':'energyCycle',
 'neo1-65|Static Electricity':'staticElectricity',
 'neo3-1|Attract Current':'attractCurrent',
 'neo3-7|Stoke':'stoke',
 'neo3-9|Evolutionary Spore':'evolutionarySpore'
});
function batch54Kind(c,a){return BATCH54[`${c?.id}|${a?.name}`]||null}
function batch54Choices(game,kind){
 const p=game.me,f=game.foe,own=[p.active,...p.bench],opp=[f.active,...f.bench];
 const result=[];
 const add=(value,name,data)=>result.push({index:value,name,data});
 if(kind==='energyBomb'){
  for(let e=0;e<p.active.energies.length;e++)for(let dest=0;dest<p.bench.length;dest++){
   const c=lookup.get(p.active.energies[e]);add(e*10+dest,`${c?.name||'Energy'} #${e+1} → ${game.card(p.bench[dest]).name} (Bench ${dest+1})`,{e,dest});
  }
 }else if(['energyControl','energyCycle'].includes(kind)){
  for(let source=0;source<opp.length;source++){
   if(kind==='energyCycle'&&source!==0)continue;
   for(let e=0;e<(opp[source]?.energies.length||0);e++){
    const id=opp[source].energies[e];
    if(kind==='energyControl'&&!isBasicEnergyCard(lookup.get(id)))continue;
    for(let dest=kind==='energyCycle'?1:0;dest<opp.length;dest++){
     if(source===dest)continue;
     add(result.length,`${lookup.get(id)?.name} — ${game.card(opp[source]).name} → ${game.card(opp[dest]).name}`,{source,e,dest});
    }
   }
  }
 }else if(kind==='stoke'){
  for(let e=0;e<p.deck.length;e++)if(lookup.get(p.deck[e])?.name==='Fire Energy')add(e,`Fire Energy (${e+1} in deck)`,{e});
 }else if(kind==='staticElectricity'){
  const targets=[...own.map((v,j)=>({v,side:0,slot:j})),...opp.map((v,j)=>({v,side:1,slot:j}))].filter(x=>x.v&&game.card(x.v)?.name==='Mareep');
  for(let e=0;e<p.deck.length;e++)if(lookup.get(p.deck[e])?.name==='Lightning Energy')for(let t=0;t<targets.length;t++){
   add(result.length,`Lightning Energy #${e+1} → ${targets[t].side===0?'Your':'Opponent’s'} Mareep (${targets[t].slot===0?'Active':'Bench '+targets[t].slot})`,{e,side:targets[t].side,slot:targets[t].slot,target:t});
  }
 }else if(kind==='attractCurrent'){
  for(let e=0;e<p.deck.length;e++)if(lookup.get(p.deck[e])?.name==='Lightning Energy')for(let dest=0;dest<own.length;dest++)if(own[dest]&&game.card(own[dest])?.types?.includes('Lightning')){
   add(result.length,`Lightning Energy #${e+1} → ${game.card(own[dest]).name} (${dest===0?'Active':'Bench '+dest})`,{e,dest});
  }
 }else if(kind==='evolutionarySpore'){
  for(let source=0;source<own.length;source++){
   const u=own[source];if(!u||!['Hoppip','Skiploom'].includes(game.card(u)?.name))continue;
   for(let e=0;e<p.deck.length;e++)if(compatible(lookup.get(p.deck[e]),game.card(u)))
    add(result.length,`${game.card(u).name} (${source===0?'Active':'Bench '+source}) → ${lookup.get(p.deck[e]).name}`,{source,e});
  }
 }
 return result;
}
function batch54Prepare(game,kind,selection,index,benchTarget,deferTurnEnd){
 const p=game.me,u=p.active,choices=batch54Choices(game,kind),serial=game.turnSerial;
 if(kind==='energyBomb'&&!p.bench.length)return {ok:true,selection:[]};
 let state=game.pending54;
 if(!state||state.serial!==serial||state.source!==u||state.kind!==kind){state={serial,source:u,kind};game.pending54=state;}
 if(['energyControl','energyCycle'].includes(kind)&&state.heads===undefined)state.heads=coin(`${kind} — coin flip`);
 if(kind==='attractCurrent'&&state.heads===undefined){state.heads=0;for(let j=0;j<3;j++)if(coin('Attract Current — flip '+(j+1)))state.heads++;}
 if(['energyControl','energyCycle'].includes(kind)&&!state.heads)return {ok:true,selection:null};
 const multi=['energyBomb','staticElectricity','attractCurrent','evolutionarySpore'].includes(kind);
 let max=kind==='energyBomb'?u.energies.length:kind==='staticElectricity'?new Set(choices.map(o=>o.data.target)).size:kind==='attractCurrent'?state.heads:kind==='evolutionarySpore'?new Set(choices.map(o=>o.data.source)).size:1;
 max=Math.min(max,kind==='energyBomb'?max:choices.length);
 // An empty result is legitimate for optional searches. Assignments are mandatory for Energy Bomb.
 if(selection===null&&p===game.players[0]&&choices.length&&max>0){
  const options=choices.map(({index,name})=>({index,name}));
  if(!multi)options.push({index:-1,name:'Skip (do not move/attach Energy)'});
  deckSearchRequest={label:`${game.card(u).attacks[index].name}: ${multi?'choose card-to-Pokémon assignments':'choose an option'}.`,options,multi,min:kind==='energyBomb'?u.energies.length:0,max,selected:[],
   execute:x=>game.attack(index,benchTarget,deferTurnEnd,x)};
  render();return {ok:false,prompt:true};
 }
 let chosen=selection;
 if(selection===null){
  if(kind==='energyBomb')chosen=Array.from({length:u.energies.length},(_,e)=>e*10);
  else if(multi){chosen=[];const energies=new Set(),targets=new Set();for(const c of choices){if(chosen.length>=max)break;if(energies.has(c.data.e)||targets.has(c.data.target??c.data.source))continue;chosen.push(c.index);energies.add(c.data.e);targets.add(c.data.target??c.data.source)}}
  else chosen=choices[0]?.index??-1;
 }
 if(multi){
  if(!Array.isArray(chosen)||chosen.length>max||(kind==='energyBomb'&&chosen.length!==u.energies.length)||new Set(chosen).size!==chosen.length)return {ok:false};
  const picked=chosen.map(v=>choices.find(x=>x.index===v));if(picked.some(x=>!x))return {ok:false};
  const usedE=new Set(),usedT=new Set();for(const x of picked){
   if(x.data.e!==undefined){if(usedE.has(x.data.e))return {ok:false};usedE.add(x.data.e)}
   if(kind==='energyBomb'&&x.data.e>=u.energies.length)return {ok:false};
   const target=kind==='staticElectricity'?x.data.target:kind==='evolutionarySpore'?x.data.source:null;
   if(target!==null){if(usedT.has(target))return {ok:false};usedT.add(target)}
  }
  return {ok:true,selection:picked.map(x=>x.data)};
 }
 if(chosen===-1)return {ok:true,selection:null};
 const pick=choices.find(x=>x.index===chosen);return pick?{ok:true,selection:pick.data}:{ok:false};
}
function batch54Apply(game,kind,selection){
 const p=game.me,f=game.foe,u=p.active,own=[p.active,...p.bench],opp=[f.active,...f.bench];
 if(kind==='energyBomb'){
  const before=[...u.energies];u.energies=[];
  if(!p.bench.length)p.discard.push(...before);
  else for(const {e,dest} of selection) p.bench[dest].energies.push(before[e]);
 }else if(['energyControl','energyCycle'].includes(kind)){
  if(selection){const source=opp[selection.source],dest=opp[selection.dest];dest.energies.push(source.energies.splice(selection.e,1)[0]);}
 }else if(kind==='stoke'){
  if(selection)p.active.energies.push(p.deck.splice(selection.e,1)[0]);
  p.deck=shuffle(p.deck);
 }else if(kind==='staticElectricity'||kind==='attractCurrent'){
  // Deck indices are stable until the selections are validated; remove highest first.
  const energies=selection.map(x=>({x,id:p.deck[x.e]}));
  for(const {x} of [...energies].sort((a,b)=>b.x.e-a.x.e))p.deck.splice(x.e,1);
  for(const {x,id} of energies){const side=kind==='staticElectricity'?game.players[x.side]:p;const dest=kind==='attractCurrent'?own[x.dest]:[side.active,...side.bench][x.slot];dest.energies.push(id);}
  p.deck=shuffle(p.deck);
 }else if(kind==='evolutionarySpore'){
  const list=selection.map(x=>({x,id:p.deck[x.e]}));
  for(const {x} of [...list].sort((a,b)=>b.x.e-a.x.e))p.deck.splice(x.e,1);
  for(const {x,id} of list){const pokemon=own[x.source];const old=pokemon.id;pokemon.under=[old,...pokemon.under];pokemon.id=id;pokemon.playedTurn=game.round;pokemon.status=null;pokemon.poison=false;pokemon.burn=false;pokemon.powerUses={};game.onPlayEvolution(pokemon,lookup.get(id));}
  p.deck=shuffle(p.deck);
 }
}

/* v0.5.5 — choice-aware historical attack handlers. These do not parse arbitrary card text. */
const BATCH55=Object.freeze({
 'basep-15|Texture Magic':'textureMagic',
 'basep-24|Birthday Surprise':'birthdaySurprise',
 'basep-32|Paint':'paint',
 'gym1-3|Fairy Power':'fairyPower',
 'gym1-94|Sleight of Hand':'sleightOfHand',
 'gym2-49|Messenger':'messenger',
 'gym2-90|ESP':'esp',
 'neo3-65|Devastate':'devastate',
 'neo3-66|Gold Scale':'goldScale',
 'neo4-13|Bubble Jump':'bubbleJump',
 'neo4-15|Sweet Kiss':'sweetKiss',
 'neo4-24|Flash Touch':'flashTouch',
 'neo4-26|Knock Over':'knockOver',
 'neo4-36|Call Back':'callBack',
 'basep-10|Cat Punch':'catPunch',
 'neo2-45|Dust Devil':'dustDevil',
 'neo3-27|Crystal Wave':'crystalWave',
 'neo4-3|Tusk Toss':'tuskToss',
 'neo4-47|Flipper Stroke':'flipperStroke',
 'neo4-51|Fish Out':'fishOut',
 'neo4-53|Mysterious Wing':'mysteriousWing',
 'neo4-54|Evolution Song':'evolutionSong',
 'neo2-39|Plunder':'plunder',
 'neo3-24|Swipe':'swipe',
 'neo3-41|Grab':'grab',
});
function batch55Kind(c,a){return BATCH55[`${c?.id}|${a?.name}`]||null}
const batch55Types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function batch55List(game,owner){return [owner.active,...owner.bench].filter(Boolean)}
function batch55CandidateCards(ids,fn){return ids.map((id,index)=>({id,index,card:lookup.get(id)})).filter(x=>fn(x.card,x.index))}
let cpuResumeChoice=null;
function batch55Request(game,index,defer,label,options,run,multi=false,max=1,min=0,defenderPrompt=false){
 deckSearchRequest={attackIndex:index,label,options,multi,min,max,selected:[],defenderPrompt,
 execute(value){const result=run(value);if(defenderPrompt&&result===true&&cpuResumeChoice){const done=cpuResumeChoice;cpuResumeChoice=null;done(true)}return result;}};
 render();return false;
}
function batch55Selection(game,kind,choice,index,defer){
 const p=game.me,f=game.foe,u=p.active,card=game.card(u);
 const own=batch55List(game,p),opp=batch55List(game,f),human=game.turn===0;
 const ask=(label,opts,fn,multi=false,max=1,min=0)=>batch55Request(game,index,defer,`${card.name}'s ${kind}: ${label}`,opts,fn,multi,max,min);
 const optsFrom=(array,label)=>array.map((x,j)=>({index:j,name:label(x,j)}));
 const askDefender=(label,opts,fn,multi=false,min=0,max=opts.length)=>game.turn===1?batch55Request(game,index,defer,`${card.name}: defender ${label}`,opts,fn,multi,max,min,true):null;
 const maybePrompt=(opts,label,multi=false,min=0,max=opts.length)=>{
  if(choice===null &&human&&opts.length){ask(label,opts,v=>game.attack(index,null,defer,v),multi,max,min);return {ok:false}}
  return null;
 };
 const select=(options,allowNone=false)=>{
  const v=choice===null?options[0]?.index??-1:choice;
  if(v===-1&&allowNone)return {ok:true,value:null};
  const o=options.find(x=>x.index===v);return o?{ok:true,value:o}:{ok:false};
 };

 if(kind==='plunder')return {ok:true,data:null};
 if(kind==='swipe')return {ok:true,data:{heads:coin('Swipe — discard attached Trainers')}};
 if(kind==='grab'){
  const opts=opp.flatMap((v,slot)=>(v.attachedTrainers||[]).map((x,j)=>({index:slot*100+j,name:`${game.card(v).name} — ${lookup.get(x.id)?.name||x.id}`})));
  if(!opts.length)return {ok:false};
  const prompt=maybePrompt(opts,'choose an opposing attached Trainer');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:result.value.index}:result;
 }
 if(kind==='dustDevil')return {ok:true,data:null};
 if(['catPunch','crystalWave','tuskToss'].includes(kind)){
  const state=game.pending55?.key===kind&&game.pending55.turn===game.turnSerial?game.pending55:{key:kind,turn:game.turnSerial,heads:coin(card.name+' — '+kind)};game.pending55=state;
  if(kind==='catPunch'&&state.heads||kind==='crystalWave'&&state.heads||!f.bench.length)return {ok:true,data:{heads:state.heads,slot:null}};
  // These attacks explicitly give the defender, not the attacker, the decision.
  const opts=f.bench.map((v,index)=>({index,name:game.card(v).name}));
  if(choice===null&&game.turn===1){askDefender('choose a Benched Pokémon',opts,slot=>game.attack(index,null,defer,slot));return {ok:false}}
  const picked=choice===null?opts[0]?.index??null:choice;
  return opts.some(o=>o.index===picked)?{ok:true,data:{heads:state.heads,slot:picked}}:{ok:false};
 }

 if(['flipperStroke','fishOut','mysteriousWing','evolutionSong'].includes(kind)){
  const options=(owner)=>{
   let result=[];
   if(kind==='flipperStroke')result=batch55CandidateCards(owner.deck,(c,j)=>j>=owner.deck.length-3&&energy(c)&&!(c.subtypes||[]).includes('Special')).map(x=>({index:x.index,name:x.card.name+' (top 3)'}));
   else if(['fishOut','mysteriousWing'].includes(kind))result=batch55CandidateCards(owner.discard,c=>c?.supertype==='Pokémon').map(x=>({index:x.index,name:x.card.name+' (discard)'}));
   else if(kind==='evolutionSong'){
    const monsters=batch55List(game,owner);
    for(let pos=0;pos<monsters.length;pos++){
     const pokemon=monsters[pos];for(let j=0;j<owner.deck.length;j++){
      const evolution=lookup.get(owner.deck[j]);if(compatible(evolution,game.card(pokemon)))result.push({index:pos*10000+j,name:`${game.card(pokemon).name} → ${evolution.name}`});
     }
    }
   }
   return result;
  };
  const opOpts=options(f),myOpts=options(p),multi=['fishOut','flipperStroke'].includes(kind),max=kind==='fishOut'?3:kind==='flipperStroke'?3:1;
  let selected=choice;
  if(selected===null)selected={opp:null,own:null};
  if(selected===null||typeof selected!=='object'||Array.isArray(selected))return {ok:false};
  const normalized=(value,opts)=>{
   if(value===null)return null;
   const arr=Array.isArray(value)?value:[value];
   return arr.length<=max&&new Set(arr).size===arr.length&&arr.every(n=>opts.some(x=>x.index===n))?arr:false;
  };
  let opponentPick=normalized(selected.opp,opOpts);
  if(opponentPick===false)return {ok:false};
  if(opponentPick===null){
   if(game.turn===1&&opOpts.length){
    askDefender('choose cards for your side',opOpts,opp=>game.attack(index,null,defer,{...selected,opp}),multi,0,Math.min(max,opOpts.length));return {ok:false};
   }
   // The opposing CPU exercises its optional choice when it benefits its position.
   opponentPick=opOpts.slice(0,max).map(x=>x.index);
  }
  let attackerPick=normalized(selected.own,myOpts);
  if(attackerPick===false)return {ok:false};
  if(attackerPick===null){
   if(game.turn===0&&myOpts.length){ask('choose cards for your side',myOpts,own=>game.attack(index,null,defer,{opp:opponentPick,own}),multi,Math.min(max,myOpts.length),0);return {ok:false}}
   attackerPick=myOpts.slice(0,max).map(x=>x.index);
  }
  return {ok:true,data:{opp:opponentPick,own:attackerPick}};
 }
 if(kind==='birthdaySurprise')return {ok:true,data:{birthday:!!p.isBirthday,heads:p.isBirthday?coin('Birthday Surprise'):false}};
 if(kind==='knockOver'){
  if(!game.stadium)return {ok:true,data:{discard:false}};
  const opts=[{index:1,name:'Discard the Stadium'},{index:0,name:'Leave the Stadium in play'}];
  const prompt=maybePrompt(opts,'choose whether to discard the Stadium');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:{discard:!!result.value.index}}:result;
 }
 if(kind==='paint'){
  const heads=game.pending55?.key==='paint'&&game.pending55?.turn===game.turnSerial?game.pending55.heads:coin('Paint — type change');game.pending55={key:'paint',turn:game.turnSerial,heads};
  if(!heads)return {ok:true,data:{heads:false}};
  const options=batch55Types.map((name,index)=>({index,name}));
  const prompt=maybePrompt(options,'choose the new type');if(prompt)return prompt;
  const selected=select(options);return selected.ok?{ok:true,data:{heads:true,type:batch55Types[selected.value.index]}}:selected;
 }
 if(kind==='textureMagic'){
  const types=[null,...batch55Types];const options=types.flatMap((res,r)=>types.map((weak,w)=>({index:r*types.length+w,name:`Resistance: ${res||'keep'} · opposing Weakness: ${weak||'keep'}`})));
  // The Power is optional, but a player can select the current weakness/resistance if desired.
  const prompt=maybePrompt(options,'choose Resistance and opposing Weakness');if(prompt)return prompt;
  const selected=select(options);return selected.ok?{ok:true,data:{res:types[Math.floor(selected.value.index/9)],weak:types[selected.value.index%9]}}:selected;
 }
 if(kind==='fairyPower'){
  const key='fairyPower',state=game.pending55?.key===key&&game.pending55.turn===game.turnSerial?game.pending55:{key,turn:game.turnSerial,heads:coin('Fairy Power')};game.pending55=state;
  if(!state.heads)return {ok:true,data:[]};
  const options=own.map((poke,index)=>({index,name:`${game.card(poke).name} (${index?'Bench '+index:'Active'})`}));
  if(choice===null&&human)return maybePrompt(options,'choose any Pokémon to return to hand',true,0,options.length);
  const indices=choice===null?[]:choice;
  if(!Array.isArray(indices)||new Set(indices).size!==indices.length||indices.some(x=>!options.some(o=>o.index===x)))return {ok:false};
  return {ok:true,data:indices};
 }
 if(kind==='sleightOfHand'){
  const allHand=optsFrom(p.hand,(id,i)=>`${lookup.get(id)?.name||id} (hand ${i+1})`);
  let selected=choice;
  if(selected===null){if(human)return maybePrompt(allHand,'choose up to three cards to return to deck',true,0,Math.min(3,allHand.length));selected=[];}
  if(Array.isArray(selected))selected={give:selected,take:null};
  if(!selected||!Array.isArray(selected.give)||selected.give.length>3||new Set(selected.give).size!==selected.give.length||selected.give.some(x=>!allHand.some(o=>o.index===x)))return {ok:false};
  const newDeck=[...p.deck,...selected.give.map(j=>p.hand[j])],energyOpts=batch55CandidateCards(newDeck,c=>energy(c)&&!(c.subtypes||[]).includes('Special')).map(x=>({index:x.index,name:x.card.name+' (deck '+(x.index+1)+')'}));
  const max=Math.min(selected.give.length,energyOpts.length);
  if(selected.take===null){
   if(human&&max){ask('choose the Basic Energy to retrieve',energyOpts,take=>game.attack(index,null,defer,{give:selected.give,take}),true,max,max);return {ok:false}}
   selected={...selected,take:energyOpts.slice(0,max).map(x=>x.index)};
  }
  if(!Array.isArray(selected.take)||selected.take.length!==max||new Set(selected.take).size!==max||selected.take.some(j=>!energyOpts.some(x=>x.index===j)))return {ok:false};
  return {ok:true,data:selected};
 }
 if(kind==='messenger'){
  const opts=batch55CandidateCards(p.deck,c=>c?.supertype==='Pokémon'&&c.name!==card.name).map(x=>({index:x.index,name:x.card.name}));
  const prompt=maybePrompt(opts,'choose a Basic or Evolution Pokémon from deck');if(prompt)return prompt;
  const result=select(opts,true);return result.ok?{ok:true,data:result.value?.index??-1}:result;
 }
 if(kind==='esp'){
  const state=game.pending55?.key==='esp'&&game.pending55.turn===game.turnSerial?game.pending55:{key:'esp',turn:game.turnSerial,heads:[1,2,3].filter(n=>coin('ESP — flip '+n)).length};game.pending55=state;
  if(state.heads!==3)return {ok:true,data:{heads:state.heads}};
  const opts=(game.card(f.active)?.attacks||[]).map((attack,index)=>({index,name:attack.name}));
  if(!opts.length)return {ok:true,data:{heads:3,copy:null}};
  const prompt=maybePrompt(opts,'choose a Defending Pokémon attack to copy');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:{heads:3,copy:result.value.index}}:result;
 }
 if(kind==='devastate'){
  const opts=u.energies.map((id,index)=>({index,name:lookup.get(id)?.name||id}));
  if(opts.length<2)return {ok:false};
  let selected=choice;
  if(selected===null){if(human)return maybePrompt(opts,'discard exactly 2 attached Energy',true,2,2);selected=[0,1];}
  if(Array.isArray(selected))selected={cost:selected,remove:null};
  if(!Array.isArray(selected?.cost)||selected.cost.length!==2||new Set(selected.cost).size!==2||selected.cost.some(v=>!opts.some(x=>x.index===v)))return {ok:false};
  const state=game.pending55?.key==='devastate'&&game.pending55.turn===game.turnSerial?game.pending55:{key:'devastate',turn:game.turnSerial,heads:coin('Devastate — discard opponent Energy')};game.pending55=state;
  const targets=opp.map((v,i)=>({v,i})).filter(({v})=>v.energies.length);
  if(state.heads&&targets.length){
   const options=targets.flatMap(({v,i})=>v.energies.map((id,e)=>({index:i*100+e,name:`${game.card(v).name} (${i?'Bench '+i:'Active'}) — ${lookup.get(id)?.name||id}`})));
   if(selected.remove===null){if(human){ask('choose one Energy from EACH opposing Pokémon',options,remove=>game.attack(index,null,defer,{...selected,remove}),true,targets.length,targets.length);return {ok:false}}selected={...selected,remove:targets.map(({i})=>i*100)};}
   const remove=selected.remove;
   if(!Array.isArray(remove)||remove.length!==targets.length||new Set(remove).size!==remove.length||remove.some(x=>!options.some(o=>o.index===x))||targets.some(({i})=>remove.filter(x=>Math.floor(x/100)===i).length!==1))return {ok:false};
  }
  return {ok:true,data:{cost:selected.cost,heads:state.heads,remove:selected.remove||[]}};
 }
 if(kind==='bubbleJump'){
  if(!p.bench.length||u.energies.length<2)return {ok:true,data:null};
  const state=game.pending55?.key===kind&&game.pending55.turn===game.turnSerial?game.pending55:{key:kind,turn:game.turnSerial,heads:coin('Bubble Jump')};game.pending55=state;
  if(!state.heads)return {ok:true,data:null};
  const opts=p.bench.map((v,index)=>({index,name:game.card(v).name}));
  const prompt=maybePrompt(opts,'choose the Benched Pokémon to receive 2 Energy');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:{bench:result.value.index}}:result;
 }
 if(kind==='flashTouch'){
  if(!p.bench.length)return {ok:true,data:null};
  const opts=p.bench.map((v,index)=>({index,name:game.card(v).name}));
  const prompt=maybePrompt(opts,'choose your replacement Active Pokémon');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:result.value.index}:result;
 }
 if(kind==='callBack'){
  if(p.bench.length===5||f.bench.length===5)return {ok:false};
  const opts=batch55CandidateCards(f.discard,c=>c?.supertype==='Pokémon'&&(basic(c)||(c.subtypes||[]).includes('Baby'))).map(x=>({index:x.index,name:x.card.name}));
  if(!opts.length)return {ok:false};
  const prompt=maybePrompt(opts,'choose a Pokémon from opposing discard');if(prompt)return prompt;
  const result=select(opts);return result.ok?{ok:true,data:result.value.index}:result;
 }
 if(['goldScale','sweetKiss'].includes(kind)){
  const opts=[{index:1,name:kind==='goldScale'?'Draw 2 cards':'Draw 1 card'},{index:0,name:'Do not draw'}];
  if(choice===null&&game.turn===1){askDefender('choose whether to draw',opts,answer=>game.attack(index,null,defer,answer));return {ok:false}}
  const selected=choice===null?((kind==='goldScale'?f.deck.length>=2:f.deck.length>0)?1:0):choice;
  return opts.some(o=>o.index===selected)?{ok:true,data:{opponentDraw:!!selected}}:{ok:false};
 }
 return {ok:false};
}
function batch55After(game,kind,data,a,u,p,f){
 const own=batch55List(game,p),opp=batch55List(game,f);
 const bounce=(pokemon,side)=>{side.hand.push(pokemon.id,...pokemon.under,...pokemon.energies);if(pokemon===side.active){side.active=side.bench.shift()||null}else side.bench.splice(side.bench.indexOf(pokemon),1);};
 switch(kind){
  case 'plunder':break; // Resolved in the pre-damage step.
  case 'swipe':if(data.heads)for(const v of opp){f.discard.push(...(v.attachedTrainers||[]).map(x=>x.id));v.attachedTrainers=[]}break;
  case 'grab':{
   const slot=Math.floor(data/100),j=data%100,v=opp[slot],tool=v?.attachedTrainers?.splice(j,1)[0];
   if(tool){f.deck=shuffle([...f.deck,tool.id]);}break;
  }
  case 'catPunch':if(!data.heads&&data.slot!==null){const victim=f.bench[data.slot];if(victim&&!game.unitHasPower(f.active,'Aurora Veil'))victim.damage+=20;}break;
  case 'crystalWave':if(!data.heads&&data.slot!==null&&f.active&&f.active.damage<game.maxHP(f.active)){
   [f.active,f.bench[data.slot]]=[f.bench[data.slot],f.active];
   const retreated=f.bench[data.slot];retreated.status=null;retreated.poison=false;retreated.burn=false;
  }break;
  case 'tuskToss':if(f.bench.length){if(data.heads)bounce(f.active,f);else if(data.slot!==null){[f.active,f.bench[data.slot]]=[f.bench[data.slot],f.active];const old=f.bench[data.slot];old.status=null;old.poison=false;old.burn=false;}}break;
  case 'dustDevil':for(const side of [p,f])for(const target of batch55List(game,side))if(!game.card(target)?.types?.includes('Fighting'))target.damage+=10;break;
  case 'flipperStroke':{
   for(const {owner,picks} of [{owner:f,picks:data.opp},{owner:p,picks:data.own}]){
    for(const j of [...picks].sort((a,b)=>b-a)){const [id]=owner.deck.splice(j,1);owner.hand.push(id)}
    owner.deck=shuffle(owner.deck);
   }break;
  }
  case 'fishOut':{
   for(const {owner,picks} of [{owner:f,picks:data.opp},{owner:p,picks:data.own}]){
    for(const j of [...picks].sort((a,b)=>b-a)){const [id]=owner.discard.splice(j,1);owner.deck.push(id)}
    if(picks.length)owner.deck=shuffle(owner.deck);
   }break;
  }
  case 'mysteriousWing':{
   for(const {owner,picks} of [{owner:f,picks:data.opp},{owner:p,picks:data.own}])if(picks.length){const [id]=owner.discard.splice(picks[0],1);owner.hand.push(id)}
   break;
  }
  case 'evolutionSong':{
   for(const {owner,picks} of [{owner:f,picks:data.opp},{owner:p,picks:data.own}]){
    if(picks.length){const pos=Math.floor(picks[0]/10000),j=picks[0]%10000,target=batch55List(game,owner)[pos],id=owner.deck.splice(j,1)[0];
     if(target&&id){target.under=[target.id,...target.under];target.id=id;target.playedTurn=game.round;target.status=null;target.poison=false;target.burn=false;target.powerUses={};game.onPlayEvolution(target,lookup.get(id));}
     owner.deck=shuffle(owner.deck);
    }
   }break;
  }
  case 'birthdaySurprise':break;
  case 'knockOver':if(data.discard){game.discardStadium();}break;
  case 'paint':if(data.heads){f.active.coloringType=data.type;game.log(`${game.card(f.active).name} changes type to ${data.type}.`)}break;
  case 'textureMagic':if(data.res)u.temporaryResistance=data.res;if(data.weak&&game.card(f.active).weaknesses?.length)f.active.temporaryWeakness=data.weak;break;
  case 'fairyPower':for(const i of [...data].sort((a,b)=>b-a)){const target=own[i];if(target)bounce(target,p)}break;
  case 'sleightOfHand':{
   const returned=data.give.map(j=>p.hand[j]);for(const j of [...data.give].sort((a,b)=>b-a))p.hand.splice(j,1);
   p.deck.push(...returned);const found=data.take.map(j=>p.deck[j]);for(const j of [...data.take].sort((a,b)=>b-a))p.deck.splice(j,1);
   p.hand.push(...found);p.deck=shuffle(p.deck);break;
  }
  case 'messenger':{
   const candidate=data>=0?p.deck[data]:null;
   if(candidate){p.hand.push(candidate);p.deck.splice(data,1)}
   const stack=[u.id,...u.under,...u.energies];p.deck=shuffle([...p.deck,...stack]);p.active=p.bench.shift()||null;break;
  }
  case 'esp':if(data.heads===1)game.draw(p);break;
  case 'devastate':{
   const costs=[...data.cost].sort((a,b)=>b-a);for(const e of costs)p.discard.push(u.energies.splice(e,1)[0]);
   for(const victim of f.bench)if(!game.unitHasPower(f.active,'Aurora Veil'))victim.damage+=10;
   if(data.heads)for(const code of [...data.remove].sort((a,b)=>b-a)){const target=opp[Math.floor(code/100)];if(target){const [id]=target.energies.splice(code%100,1);if(id)f.discard.push(id)}}
   break;
  }
  case 'goldScale':if(data.opponentDraw)game.draw(f,2);game.draw(p,2);break;
  case 'sweetKiss':if(data.opponentDraw)game.draw(f);break;
  case 'bubbleJump':if(data!==null){const target=p.bench[data.bench];if(target){target.energies.push(...u.energies.splice(0,2));bounce(u,p)}}break;
  case 'flashTouch':if(data!==null){[p.active,p.bench[data]]=[p.bench[data],p.active];p.active.immunityConditionUntilBenched=true;}break;
  case 'callBack':{
   const id=f.discard.splice(data,1)[0],v=unit(id);v.damage=10;v.playedTurn=game.round;f.bench.push(v);break;
  }
 }
}

class Engine{
 constructor(){this.turnSerial=0;this.powerSilenceUntilSerial=0;this.players=[];this.turn=0;this.round=0;this.over=false;this.message=[];this.started=false;this.phase='idle';this.mulligans=[0,0]}
 log(s){this.message.unshift(s);this.message=this.message.slice(0,120)}
 power56RawActive(u){if(!u||['Asleep','Confused','Paralyzed'].includes(u.status)||u.powerSilencedUntilSerial>this.turnSerial)return false;
  return !this.players.some(p=>[p.active,...p.bench].some(v=>v&&v!==u&&!['Asleep','Confused','Paralyzed'].includes(v.status)&&(lookup.get(v.id)?.abilities||[]).some(a=>a.name==='Toxic Gas')));
 }
 card(u){if(!u)return null;if(this.players.some(side=>side.bench.includes(u))){if(u.temporaryWeakness||u.temporaryResistance){u.temporaryWeakness=null;u.temporaryResistance=null;}if(u.immunityConditionUntilBenched)u.immunityConditionUntilBenched=false;}const source=lookup.get(u.id);if(!source)return null;
  let dynamic=u.shapeshiftCardId&&this.power56RawActive(u)?{
   ...lookup.get(u.shapeshiftCardId),
   // Brock's Ninetales keeps its own Power, never the copied Evolution's Power.
   abilities:source.abilities,
   id:u.shapeshiftCardId,
  }:source;
  if(this.power56RawActive(u)){
   const owningSide=this.players.find(p=>p.active===u||p.bench.includes(u));
   const other=this.players.find(p=>p!==owningSide);const def=other?.active?lookup.get(other.active.id):null;
   if(source.name==='Ditto'&&owningSide?.active===u&&def){dynamic={...source,types:def.types,hp:def.hp,weaknesses:def.weaknesses,resistances:def.resistances,retreatCost:def.retreatCost,attacks:def.attacks};}
   if(source.name==='Sudowoodo'&&(source.abilities||[]).some(a=>a.name==='Mimic')&&owningSide?.active===u&&def){dynamic={...source,attacks:def.attacks};}
   if((source.abilities||[]).some(a=>a.name==='Psylink')&&owningSide){
    const extra=[owningSide.active,...owningSide.bench].filter(v=>v&&v!==u&&(lookup.get(v.id)?.types||[]).includes('Psychic')).flatMap(v=>lookup.get(v.id)?.attacks||[]);
    dynamic={...dynamic,attacks:[...(dynamic.attacks||[]),...extra]};
   }
   const prehistoric=this.players.some(p=>[p.active,...p.bench].some(v=>v&&this.power56RawActive(v)&&(lookup.get(v.id)?.abilities||[]).some(a=>a.name==='Prehistoric Memory')));
   if(prehistoric&&u.under?.length){dynamic={...dynamic,attacks:[...(dynamic.attacks||[]),...u.under.flatMap(id=>lookup.get(id)?.attacks||[])]};}
  }
  if(u.recallTurnSerial===this.turnSerial&&u.under?.length){dynamic={...dynamic,attacks:[...(dynamic.attacks||[]),...u.under.flatMap(id=>lookup.get(id)?.attacks||[])]};}
  if(!(u.coloringType||u.temporaryResistance||u.temporaryWeakness))return dynamic;
  const result={...dynamic};if(u.coloringType)result.types=[u.coloringType];
  if(u.temporaryResistance)result.resistances=[{type:u.temporaryResistance,value:'-30'}];
  if(u.temporaryWeakness)result.weaknesses=[{type:u.temporaryWeakness,value:'×2'}];return result;
 }
 draw(p,n=1){for(let i=0;i<n;i++){if(!p.deck.length){p.drawFailed=true;return false}p.hand.push(p.deck.pop())}return true}
 start(d1,d2){
 if(window.NeoClassicFormat){for(const [side,deck] of [d1,d2].entries()){const verdict=window.NeoClassicFormat.validateDeck(deck,lookup);if(!verdict.valid)throw Error(`Classic deck ${side+1} rejected: ${verdict.errors.join('; ')}`);}}
 matchGeneration++;$('actionFeedback').className='feedback hidden';
 coinQueue.length=0;coinBusy=false;$('coinOverlay').classList.add('hidden');this.turnSerial=0;this.powerSilenceUntilSerial=0;this.copyCoinCache=null;this.pending53=null;this.pending54=null;this.lastAttackAction=null;this.players=[statePlayer('You',d1),statePlayer('Rival',d2)];this.turn=0;this.round=1;this.over=false;this.started=true;this.phase='setup';this.message=[];this.mulligans=[0,0];selected=null;deckSearchRequest=null;targetRequest=null;
 for(let pi=0;pi<2;pi++){
  const p=this.players[pi];let tries=0;
  do{p.deck=shuffle([...p.deck,...p.hand]);p.hand=[];this.draw(p,7);tries++}
  while(!p.hand.some(id=>basic(lookup.get(id)))&&tries<200);
  this.mulligans[pi]=tries-1;
  if(!p.hand.some(id=>basic(lookup.get(id)))){this.over=true;this.phase='game';this.log(`${p.name} has no Basic Pokémon in the deck.`);render();return}
 }
 // The opponent sets up privately; its board is hidden until you confirm.
 const cpu=this.players[1];let pos=cpu.hand.findIndex(id=>basic(lookup.get(id)));
 cpu.active=unit(cpu.hand.splice(pos,1)[0]);
 while(cpu.hand.some(id=>basic(lookup.get(id)))&&cpu.bench.length<5){const j=cpu.hand.findIndex(id=>basic(lookup.get(id)));cpu.bench.push(unit(cpu.hand.splice(j,1)[0]))}
 this.log('Choose your Active Pokémon and optionally up to five Benched Pokémon.');render();
 }
 setupSelect(i){
 if(this.phase!=='setup'||this.over)return false;
 const p=this.players[0],id=p.hand[i];if(!basic(lookup.get(id)))return false;
 if(!p.active)p.active=unit(p.hand.splice(i,1)[0]);
 else if(p.bench.length<5)p.bench.push(unit(p.hand.splice(i,1)[0]));
 else return false;
 render();return true;
 }
 setupUndo(slot){
 if(this.phase!=='setup')return false;
 const p=this.players[0];let u=slot===-1?p.active:p.bench[slot];if(!u)return false;
 p.hand.push(u.id);
 if(slot===-1)p.active=null;else p.bench.splice(slot,1);
 render();return true;
 }
 confirmSetup(){
 if(this.phase!=='setup'||!this.players[0].active)return false;
 for(const p of this.players)for(let i=0;i<6;i++)if(p.deck.length)p.prizes.push(p.deck.pop());
 this.phase='game';this.draw(this.players[0]);
 this.log(`Both players are ready with 6 Prize cards. You took ${this.mulligans[0]} mulligan(s); rival took ${this.mulligans[1]}.`);
 this.log('Classic first-turn attacks are enabled.');render();return true;
 }
 get me(){return this.players[this.turn]};get foe(){return this.players[1-this.turn]}
 check(){if(this.over)return;for(let i=0;i<2;i++){let p=this.players[i],f=this.players[1-i];if(p.prizes.length===0||!f.active&&!f.bench.length||f.drawFailed){this.over=true;this.log(`🏆 ${p.name} wins!`);break}}}
 playBasic(i,bench=true){const p=this.me,c=lookup.get(p.hand[i]);if(this.phase!=='game'||this.over||!basic(c)||p.bench.length>=(lookup.get(this.stadium?.id)?.name==='Narrow Gym'?4:5))return false;let newUnit=unit(p.hand.splice(i,1)[0]);newUnit.playedTurn=this.round;p.bench.push(newUnit);for(const side of this.players){const hot=side.active;if(hot&&this.unitHasPower(hot,'Hot Plate'))newUnit.damage+=10}this.log(`${p.name} benched ${c.name}.`);this.resolveKO();render();return true}
 evolve(i,idx){const p=this.me,u=idx===-1?p.active:p.bench[idx],c=lookup.get(p.hand[i]);if(this.phase!=='game'||!u||!c||u.shapeshiftCardId||!compatible(c,this.card(u)))return false;if(u.playedTurn>=this.round||p.turnPlays.includes(u)||this.continuousPower('Prehistoric Power')||(u.evolutionLockUntil>=this.round&&u.evolutionLockUntil>0))return false;const old=this.card(u);u.under=[old.id,...(u.under||[])];u.id=p.hand.splice(i,1)[0];u.playedTurn=this.round;u.status=null;u.poison=false;u.poisonDamage=10;u.burn=false;u.attackShield=0;u.persistentAttackLockSource=null;u.persistentAccuracySource=null;u.persistentRetreatSource=null;u.persistentAttackLockSourceId=null;u.persistentAccuracySourceId=null;u.persistentRetreatSourceId=null;u.evolutionLockUntil=0;u.shadowImages=false;u.giantGrowth=false;u.conditionalAttackLockUntil=0;u.switchLockUntil=0;u.cantRetreatUntilSerial=0;u.slimeShieldUntilSerial=0;u.powerSilencedUntilSerial=0;p.turnPlays.push(u);u.powerUses={};u.weaknessOverride=null;u.resistanceOverride=null;u.lockOnUntil=0;this.log(`${p.name} evolved ${old.name} into ${c.name}.`);this.onPlayEvolution(u,c);render();return true}
 onPlayEvolution(u,c){const p=this.me,f=this.foe,names=new Set((c.abilities||[]).map(a=>a.name));if(names.has('Berserk')){const victim=coin('Feraligatr — Berserk')?f:p;victim.discard.push(...victim.deck.splice(Math.max(0,victim.deck.length-5),5));this.log(`Berserk discarded 5 cards from ${victim.name}'s deck.`)}if(names.has('Herbal Scent')&&coin('Meganium — Herbal Scent'))for(const side of this.players)for(const v of [side.active,...side.bench])if(v&&this.card(v)?.types?.includes('Grass'))v.damage=0;if(names.has('Fire Boost')&&coin('Typhlosion — Fire Boost')){for(let n=0;n<4;n++){const j=p.deck.findIndex(id=>lookup.get(id)?.name==='Fire Energy');if(j<0)break;u.energies.push(p.deck.splice(j,1)[0])}p.deck=shuffle(p.deck)}if(names.has('Softboiled')){u.damage=Math.max(0,u.damage-(coin('Blissey — Softboiled')?80:40))}if(names.has('Call the Boss')){const j=p.deck.findIndex(id=>lookup.get(id)?.name==='Giovanni');if(j>=0)p.hand.push(p.deck.splice(j,1)[0]);p.deck=shuffle(p.deck)}}
 attach(i,idx){const p=this.me,u=idx===-1?p.active:p.bench[idx],c=lookup.get(p.hand[i]);if(this.phase!=='game'||!CORE.legalAttachment({card:c,unit:u,energyUsed:p.energyUsed,round:this.round,pureBody:this.unitHasPower(u,'Pure Body'),cardName:this.card(u)?.name||''}))return false;const originalSource=this.turn===0?sourceCenter($('hand')?.querySelectorAll('[data-hand]')?.[i]):battlefieldCenter(1,-1);u.energies.push(p.hand.splice(i,1)[0]);if(u.poisonOnEnergyUntil>=this.round&&u.poisonOnEnergyUntil>0)u.poison=true;if(this.unitHasPower(u,'Pure Body')&&c.name==='Water Energy')p.discard.push(u.energies.shift());if(this.unitHasPower(u,'Healing Fire')&&c.name==='Fire Energy')u.damage=Math.max(0,u.damage-10);const conductivity=[this.foe.active,...this.foe.bench].filter(v=>this.unitHasPower(v,'Conductivity'));if(conductivity.length===1)u.damage+=10;p.energyUsed=true;this.log(`${p.name} attached ${c.name} to ${this.card(u).name}.`);render();lastBattleAnimation=battleFX({from:originalSource||battlefieldCenter(this.turn,-1),to:battlefieldCenter(this.turn,idx),emoji:ENERGY_ICON[energyType(c.id)]||'⚡',kind:'energy',label:`${c.name} → ${this.card(u).name}`,duration:940});return true}
 energies(u){return u.energies.flatMap((id,i)=>{
  const card=lookup.get(id),name=card?.name||'',override=u.power56EnergyOverrides?.[i];
  if(this.miraculousWindActive()&&(card?.subtypes||[]).includes('Special'))return ['Colorless'];
  if(id.startsWith('__buzzap:')){const type=id.split(':')[1];return [type,type]}
  if(name==='Double Colorless Energy')return ['Colorless','Colorless'];
  if(name==='Miracle Energy'){const type=this.card(u)?.types?.[0]||'Colorless';return [type,type]}
  if(name==='Recycle Energy')return ['Colorless'];
  return [override&&override.until>this.turnSerial&&this.power56RawActive(override.provider)?override.type:
   this.printedPower(u,'Photosynthesis',true)?'Grass':
   u.burnEnergyTurn===this.round&&this.players[this.turn]?.active===u?'Fire':name.replace(' Energy','')];
 })}

 afford(u,cost){if(lookup.get(u?.id)?.name==='Ditto'&&this.power56RawActive(u)&&this.players.some(p=>p.active===u))return u.energies.length>=(cost||[]).length;let pool=this.energies(u);if(this.card(u)?.types?.includes('Grass')&&this.continuousPower('Wild Growth'))pool=pool.flatMap(x=>x==='Grass'?['Grass','Grass']:[x]);return CORE.canPayEnergy(cost||[],pool)}
 // Powers are evaluated on each side, not only the active player. Muk's Toxic Gas suppresses every other Pokémon Power.
 activePowers(side){if(this.powerSilenceUntilSerial>this.turnSerial)return [];return [this.players[side]?.active,...(this.players[side]?.bench||[])].filter(Boolean).flatMap(u=>(this.card(u)?.abilities||[]).filter(a=>!a.type||/^(?:pok[eé]mon power|poke-power|poke-body)$/i.test(a.type)).map(a=>({u,name:a.name,text:a.text||''}))).filter(a=>!['Asleep','Confused','Paralyzed'].includes(a.u.status)&&!(a.u.powerSilencedUntilSerial>this.turnSerial))}
 continuousPower(name){return [0,1].some(side=>this.activePowers(side).some(a=>a.name===name&&(!this.activePowers(0).concat(this.activePowers(1)).some(p=>p.name==='Toxic Gas')||name==='Toxic Gas')))}
 powerSources(name){if(name==='[Quicken]')return [this.me.active,...this.me.bench].filter(u=>this.printedPower(u,name,true));const disabled=name!=='Toxic Gas'&&this.continuousPower('Toxic Gas');return disabled?[]:this.activePowers(this.turn).filter(a=>a.name===name).map(a=>a.u)}
 miraculousWindActive(){return this.players.some(p=>p.active&&this.unitHasPower(p.active,'Miraculous Wind'))}
 powerAvailable(name){return this.phase==='game'&&!this.over&&this.powerSources(name).length>0}
 unitHasPower(u,name){if(!u||this.continuousPower('Toxic Gas'))return false;return !['Asleep','Confused','Paralyzed'].includes(u.status)&&!(u.powerSilencedUntilSerial>this.turnSerial)&&(this.card(u)?.abilities||[]).some(a=>a.name===name)}
 printedPower(u,name,worksWhileStatus=false){if(!u||name!=='Toxic Gas'&&this.continuousPower('Toxic Gas'))return false;return !(u.powerSilencedUntilSerial>this.turnSerial)&&(worksWhileStatus||!['Asleep','Confused','Paralyzed'].includes(u.status))&&(this.card(u)?.abilities||[]).some(a=>a.name===name)}
 countPower(side,name){if(name!=='Toxic Gas'&&this.continuousPower('Toxic Gas'))return 0;return [this.players[side]?.active,...(this.players[side]?.bench||[])].filter(u=>u&&(this.card(u)?.abilities||[]).some(a=>a.name===name)).length}
 maxHP(u){let hp=Number(this.card(u)?.hp||0);if(u?.giantGrowth&&this.players.some(side=>side.active===u))hp=80;if(this.unitHasPower(u,'Gaseous Form'))hp+=10*this.energies(u).filter(x=>x==='Psychic').length;return hp}
 // A Power activation is independent of the ordinary Energy attachment limit.
 damageSwap(fromSlot,toSlot){const p=this.me,from=fromSlot===-1?p.active:p.bench[fromSlot],to=toSlot===-1?p.active:p.bench[toSlot];if(!this.powerAvailable('Damage Swap')||!from||!to||from===to||from.damage<10||to.damage+10>=Number(this.card(to)?.hp||0))return false;from.damage-=10;to.damage+=10;this.log(`${p.name} used Damage Swap: 10 damage from ${this.card(from).name} to ${this.card(to).name}.`);render();return true}
 discardStadium(){if(!this.stadium)return false;const side=this.players[this.stadium.owner];if(side)side.discard.push(this.stadium.id);this.stadium=null;return true}
 // Electrode's Buzzap replaces itself with two Rainbow-equivalent Energy units; opponent takes a Prize for the KO.
 buzzap(slot){const p=this.me,u=slot===-1?p.active:p.bench[slot];if(!u||this.card(u)?.name!=='Electrode'||!this.powerSources('Buzzap').includes(u))return false;const host=slot===-1?p.active:p.bench[slot];const replacement={...host,id:'__buzzap_energy',under:[],energies:[]}; // The chosen Electrode is removed; its temporary Energy must be attached by selecting a recipient.
 return false; // Buzzap needs a separate recipient-selection and KO transaction; not silently approximated.
 }
 // Fossil Gengar: transfer one damage counter between opposing Pokémon once per turn, without a Knock Out.
 curse(fromSlot,toSlot){const foe=this.foe,from=fromSlot===-1?foe.active:foe.bench[fromSlot],to=toSlot===-1?foe.active:foe.bench[toSlot],source=this.powerSources('Curse').find(u=>!u.powerUses?.curse);if(!source||!from||!to||from===to||from.damage<10||to.damage+10>=Number(this.card(to)?.hp||0))return false;from.damage-=10;to.damage+=10;source.powerUses.curse=true;this.log(`${this.me.name} used Curse to move 1 damage counter.`);render();return true}
 // Jungle Vileplume: once per turn flip a coin; on heads remove one damage counter from each of your Pokémon.
 healPower(){const source=this.powerSources('Heal').find(u=>!u.powerUses?.heal);if(!source)return false;source.powerUses.heal=true;const success=coin('Vileplume — Heal');if(success)for(const u of [this.me.active,...this.me.bench])if(u)u.damage=Math.max(0,u.damage-10);this.log(`Vileplume used Heal: ${success?'heads — healed 10 from each Pokémon':'tails — no healing'}.`);render();return true}
 // Fossil Dragonite Step In: may switch itself from the Bench into the Active position during its owner's turn.
 stepIn(slot){const p=this.me,u=p.bench[slot];if(!u||this.card(u)?.name!=='Dragonite'||!this.powerSources('Step In').includes(u))return false;[p.active,p.bench[slot]]=[u,p.active];this.log(`${p.name} used Step In.`);render();return true}
 // Fossil Slowbro: moves one damage counter from another friendly Pokémon to Slowbro (cannot KO Slowbro).
 strangeBehavior(fromSlot,toSlot){const p=this.me,from=fromSlot===-1?p.active:p.bench[fromSlot],to=toSlot===-1?p.active:p.bench[toSlot];if(!from||!to||from===to||from.damage<10||this.card(to)?.name!=='Slowbro'||!this.powerSources('Strange Behavior').includes(to)||to.damage+10>=Number(this.card(to).hp||0))return false;from.damage-=10;to.damage+=10;this.log(`${p.name} used Strange Behavior.`);render();return true}
 // A machine-readable Power inventory prevents unsupported cards from being misrepresented as playable.
 powerAudit(){const powers=[];for(const c of cards){for(const a of c.abilities||[]){powers.push({card:c.id,cardName:c.name,name:a.name,implemented:IMPLEMENTED_POWERS.has(a.name),text:a.text||''})}}return powers}

 pollenStench(){const source=this.powerSources('Pollen Stench').find(u=>!u.powerUses?.pollenStench);if(!source)return false;source.powerUses.pollenStench=true;(coin('Pollen Stench')?this.foe.active:this.me.active).status='Confused';this.log(`${this.card(source).name} used Pollen Stench.`);render();return true}
 fragranceTrap(slot=0){const source=this.powerSources('Fragrance Trap').find(u=>!u.powerUses?.fragranceTrap),f=this.foe;if(!source||!f.bench.length)return false;source.powerUses.fragranceTrap=true;if(coin('Fragrance Trap')){slot=Math.max(0,Math.min(f.bench.length-1,slot));[f.active,f.bench[slot]]=[f.bench[slot],f.active]}this.log(`${this.card(source).name} used Fragrance Trap.`);render();return true}
 playfulPunch(){const source=this.powerSources('Playful Punch').find(u=>!u.powerUses?.playfulPunch);if(!source)return false;source.powerUses.playfulPunch=true;if(coin('Playful Punch'))this.foe.active.damage+=calculateDamage(20,this.card(source),this.card(this.foe.active));this.log(`${this.card(source).name} used Playful Punch.`);this.resolveKO();if(!this.over)this.end();render();return true}
 observe(){const source=this.powerSources('Observe').find(u=>!u.powerUses?.observe);if(!source)return false;source.powerUses.observe=true;this.log(`Observe — rival's top cards: ${this.foe.deck.slice(-5).reverse().map(id=>lookup.get(id)?.name).join(', ')||'(none)'}.`);render();return true}
 cunning(){const source=this.powerSources('Cunning').find(u=>!u.powerUses?.cunning);if(!source)return false;source.powerUses.cunning=true;this.log(`Cunning saw ${lookup.get(this.foe.deck.at(-1))?.name||'an empty deck'}.`);if(coin('Cunning — shuffle'))this.foe.deck=shuffle(this.foe.deck);render();return true}
 specialDelivery(handIndex){const source=this.powerSources('Special Delivery').find(u=>!u.powerUses?.specialDelivery),p=this.me;if(!source||!p.deck.length)return false;source.powerUses.specialDelivery=true;this.draw(p);const i=Math.max(0,Math.min(p.hand.length-1,Number.isInteger(handIndex)?handIndex:0));p.deck.push(p.hand.splice(i,1)[0]);this.log(`${this.card(source).name} used Special Delivery.`);render();return true}

 rainDance(handIndex,slot){const p=this.me,u=slot===-1?p.active:p.bench[slot],id=p.hand[handIndex],c=lookup.get(id);if(!this.powerAvailable('Rain Dance')||!u||!this.card(u)?.types?.includes('Water')||c?.name!=='Water Energy')return false;u.energies.push(p.hand.splice(handIndex,1)[0]);this.log(`${p.name} used Rain Dance: Water Energy → ${this.card(u).name}.`);render();lastBattleAnimation=battleFX({from:sourceCenter($('hand')?.querySelectorAll('[data-hand]')?.[handIndex])||battlefieldCenter(this.turn,-1),to:battlefieldCenter(this.turn,slot),emoji:'💧',kind:'energy',label:'Rain Dance',duration:900});return true}
 energyTrans(fromSlot,toSlot){const p=this.me,from=fromSlot===-1?p.active:p.bench[fromSlot],to=toSlot===-1?p.active:p.bench[toSlot];if(!this.powerAvailable('Energy Trans')||!from||!to||from===to)return false;const idx=from.energies.findIndex(id=>lookup.get(id)?.name==='Grass Energy');if(idx<0)return false;to.energies.push(from.energies.splice(idx,1)[0]);this.log(`${p.name} used Energy Trans: Grass Energy → ${this.card(to).name}.`);render();lastBattleAnimation=battleFX({from:battlefieldCenter(this.turn,fromSlot),to:battlefieldCenter(this.turn,toSlot),emoji:'🌿',kind:'energy',label:'Energy Trans',duration:850});return true}
 energyBurn(){const u=this.me.active;if(!u||!this.card(u)?.abilities?.some(a=>a.name==='Energy Burn')||!this.powerAvailable('Energy Burn'))return false;u.burnEnergyTurn=this.round;this.log(`${this.me.name}: Charizard's Energy Burn turns attached Energy into Fire Energy for this turn.`);render();return true}
 naturalHealing(){const source=this.powerSources('Natural Healing').find(u=>!u.powerUses?.naturalHealing&&u.damage>=10);if(!source)return false;source.damage-=10;source.powerUses.naturalHealing=true;this.log(`${this.card(source).name} used Natural Healing.`);render();return true}
 solarPower(){const source=this.powerSources('Solar Power').find(u=>!u.powerUses?.solarPower);if(!source)return false;source.powerUses.solarPower=true;for(const u of [this.me.active,this.foe.active])if(u){u.status=null;u.poison=false;u.poisonDamage=10;}this.log('Solar Power cleared Special Conditions from both Active Pokémon.');render();return true}
 cowardice(slot){const p=this.me,u=slot===-1?p.active:p.bench[slot];if(!u||this.card(u)?.name!=='Tentacool'||!this.powerSources('Cowardice').includes(u)||u.playedTurn>=this.round)return false;p.hand.push(u.id);p.discard.push(...u.under,...u.energies);if(slot===-1){p.active=p.bench.shift()||null}else p.bench.splice(slot,1);this.log(`${p.name} returned Tentacool with Cowardice.`);render();return true}
 longDistanceHypnosis(){const source=this.powerSources('Long Distance Hypnosis').find(u=>!u.powerUses?.hypnosis);if(!source)return false;source.powerUses.hypnosis=true;if(coin('Long Distance Hypnosis'))this.foe.active.status='Asleep';else this.me.active.status='Asleep';this.log(`${this.card(source).name} used Long Distance Hypnosis.`);render();return true}
 trickery(){const source=this.powerSources('Trickery').find(u=>!u.powerUses?.trickery),p=this.me;if(!source||!p.prizes.length||!p.deck.length)return false;source.powerUses.trickery=true;const top=p.deck[p.deck.length-1];p.deck[p.deck.length-1]=p.prizes[0];p.prizes[0]=top;this.log(`${p.name} used Trickery to exchange a face-down Prize with the top deck card.`);render();return true}
 laugh(){const source=this.powerSources('[Laugh]').find(u=>!u.powerUses?.laugh);if(!source)return false;source.powerUses.laugh=true;if(coin('[Laugh]'))for(const p of this.players)p.deck=shuffle(p.deck);this.log('Unown used [Laugh].');render();return true}
 tell(){const source=this.powerSources('[Tell]').find(u=>!u.powerUses?.tell);if(!source)return false;source.powerUses.tell=true;if(coin('[Tell]'))this.log(`Hands revealed — You: ${this.me.hand.map(id=>lookup.get(id)?.name).join(', ')} | Rival: ${this.foe.hand.map(id=>lookup.get(id)?.name).join(', ')}`);else this.log('[Tell] failed.');render();return true}
 matterExchange(handIndex){const source=this.powerSources('Matter Exchange').find(u=>!u.powerUses?.matterExchange),p=this.me;if(!source||handIndex<0||handIndex>=p.hand.length)return false;source.powerUses.matterExchange=true;p.discard.push(p.hand.splice(handIndex,1)[0]);this.draw(p);this.log(`${p.name} used Matter Exchange.`);render();return true}
 downpour(handIndex){const source=this.powerSources('Downpour')[0],p=this.me,id=p.hand[handIndex];if(!source||lookup.get(id)?.name!=='Water Energy')return false;p.discard.push(p.hand.splice(handIndex,1)[0]);this.log(`${p.name} discarded Water Energy with Downpour.`);render();return true}
 gatherFire(fromSlot){const source=this.powerSources('Gather Fire')[0],p=this.me,from=fromSlot===-1?p.active:p.bench[fromSlot];if(!source||!from||from===source)return false;const j=from.energies.findIndex(id=>lookup.get(id)?.name==='Fire Energy');if(j<0)return false;source.energies.push(from.energies.splice(j,1)[0]);this.log(`${p.name} moved Fire Energy with Gather Fire.`);render();return true}
 fireRecharge(toSlot){const source=this.powerSources('Fire Recharge').find(u=>!u.powerUses?.fireRecharge),p=this.me,to=toSlot===-1?p.active:p.bench[toSlot];if(!source||!to||!this.card(to)?.types?.includes('Fire'))return false;source.powerUses.fireRecharge=true;if(!coin('Fire Recharge')){this.log('Fire Recharge failed.');render();return true}const j=p.discard.findIndex(id=>lookup.get(id)?.name==='Fire Energy');if(j>=0)to.energies.push(p.discard.splice(j,1)[0]);p.deck=shuffle(p.deck);this.log(`${p.name} used Fire Recharge.`);render();return true}
 evolutionaryLight(){const source=this.powerSources('Evolutionary Light').find(u=>!u.powerUses?.evolutionaryLight),p=this.me;if(!source)return false;const options=p.deck.map((id,index)=>({id,index,c:lookup.get(id)})).filter(x=>x.c?.supertype==='Pokémon'&&!basic(x.c));source.powerUses.evolutionaryLight=true;if(!options.length){p.deck=shuffle(p.deck);render();return true}if(this.turn===1){const chosen=options[0];p.hand.push(p.deck.splice(chosen.index,1)[0]);p.deck=shuffle(p.deck);this.log(`${p.name} used Evolutionary Light.`);render();return true}deckSearchRequest={label:'Evolutionary Light: choose an Evolution Pokémon.',options:options.map(x=>({index:x.index,id:x.id,name:x.c.name})),execute:index=>{const j=p.deck.findIndex((id,k)=>k===index);if(j<0)return false;p.hand.push(p.deck.splice(j,1)[0]);p.deck=shuffle(p.deck);deckSearchRequest=null;this.log(`${p.name} found an Evolution Pokémon with Evolutionary Light.`);render();return true}};render();return true}
 // Limited, explicit copied-attack execution. Nontrivial additional costs and choices
 // are not silently bypassed: the picker only offers effects verified for this path.
 copyAttackMode(source,attack){
  if(!source||!attack)return null;
  const key=source.id+'|'+attack.name;
  if(['base1-5|Metronome','base2-1|Metronome','base2-17|Metronome','base4-5|Metronome','base4-6|Metronome'].includes(key))return 'metronome';
  if(key==='basep-30|Mini-Metronome')return 'mini';
  if(key==='neo1-16|Super Metronome')return 'super';
  if(['neo2-11|Sketch','neo2-30|Sketch'].includes(key))return 'sketch';
  if(key==='neo3-19|Genetic Memory')return 'memory';
  if(['base1-22|Mirror Move','base2-62|Mirror Move','base4-28|Mirror Move','base4-92|Mirror Move'].includes(key))return 'mirror';
  return null;
 }
 copyable(a,mode){
  if(!a||this.copyAttackMode(cards.find(c=>c.attacks?.includes(a)),a))return false;
  const pattern=this.attackPattern(a);
  // These paths resolve entirely within the common attack machinery and do not
  // require additional hand/deck/energy choices. Expand after adding tests.
  const safe=new Set(['plain','status','coinStatus','fail','bonus','multi','coinRecoil','recoil','defendReduce','agilityShield','coinPreventDamage','selfSleep','selfConfuse','coinBurn','halfRemainingHP','halfRemainingHPDown','defenderEnergyBonus','defenderDamageBonus','selfDamageBonus','benchCountBonus','damageCounterCoins','discardSome','discardAll','discardOneRequired']);
  if(!safe.has(pattern))return false;
  return true;
 }
 copyCandidates(mode,u,f){
  let sources=[];
  if(mode==='metronome'||mode==='mini')sources=[{c:this.card(f.active),u:f.active}];
  if(mode==='super')sources=[f.active,...f.bench].filter(Boolean).map(v=>({c:this.card(v),u:v}));
  if(mode==='memory')sources=(u.under||[]).map(id=>({c:lookup.get(id),u}));
  if(mode==='sketch'){
   const history=this.lastAttackAction;
   if(history&&history.turnSerial===this.turnSerial-1&&history.attacker===f.active&&history.defendingTeam.includes(u)){
    const card=lookup.get(history.cardId),attack=card?.attacks?.[history.index];
    if(attack&&this.copyable(attack,mode))return [{index:0,attack,origin:card}];
   }
   return [];
  }
  const candidates=[];
  for(const {c} of sources)for(let i=0;i<(c?.attacks||[]).length;i++){
   const attack=c.attacks[i];if(this.copyable(attack,mode))candidates.push({index:candidates.length,attack,origin:c});
  }
  return candidates;
 }
 // Conservative attack-text classifier. Never mark a complex unimplemented effect as authentic.
 attackPattern(a){
  if(this.copyAttackMode(cards.find(c=>c.attacks?.includes(a)),a))return 'attackCopy';
  const t=(a.text||'').trim();
  if(!t)return 'plain';
  // Verified historical card-specific effects: keep their full behavior together.
  if(/^If Erika's Vileplume does damage to the Defending Pok[eé]mon \(after applying Weakness and Resistance\), remove a number of damage counters from Erika's Vileplume equal to half the damage done to the Defending Pok[eé]mon \(rounded up to the nearest 10\)\. If Erika's Vileplume has fewer damage counters than that, remove all of them\.$/i.test(t))return 'megaDrain';
  if(/^Flip a coin\. If tails, Lt\. Surge's Magneton does 20 damage to itself\.$/i.test(t))return 'magnetonRecoil';
  if(/^Does 20 damage times the total number of Koffings, Weezings, and Dark Weezings in play \(Apply Weakness and Resistance\.\)\. Then, this attack does 20 damage to each Koffing, Weezing, and Dark Weezing \(even your own\)\. Don't apply Weakness and Resistance\.$/i.test(t))return 'massExplosion';
  // Verified Gym-era Energy recovery, self-attachment, and direct-condition attacks.
  if(/^Take (?:up to )?(?:1|2|one|two) Lightning Energy cards? from your discard pile and attach (?:it|them) to .+\.$/i.test(t))return 'recoverLightningAttach';
  if(/^If there are any Lightning Energy cards in your discard pile, attach 1 of them to .+\.$/i.test(t))return 'recoverLightningAttach';
  if(/^Flip a coin\. If heads, you may attach up to 2 Grass Energy cards from your hand to .+\.$/i.test(t))return 'coinGrassGrowth';
  if(/^[^.]+ does damage to itself equal to 10 times the number of Lightning Energy cards attached to it\.$/i.test(t))return 'lightningSelfRecoil';
  if(/^[^.]+ is now Poisoned\.$/i.test(t))return 'selfPoison';
  // Non-damaging defensive attacks are real attacks, not empty turns.
  // Grimer (Fossil 48) Minimize, with a reusable exact-text reduction template.
  if(/^All damage done by attacks to (?:this Pokémon|[\w'’ .-]+) during your opponent's next turn is reduced by (\d+) \(after applying Weakness and Resistance\)\.$/i.test(t))return 'defendReduce';
  if(/^During your opponent's next turn, (?:any|all) damage done (?:to (?:this Pokémon|[\w'’ .-]+) )?by attacks is reduced by (\d+) \(after applying Weakness and Resistance\)\.$/i.test(t))return 'defendReduce';
  // Historically printed damage/effect protection. Restrict patterns to complete sentences.
  if(/^Flip a coin\. If heads, during your opponent's next turn, prevent all effects of attacks, including damage, done to [^.]+\.$/i.test(t))return 'agilityShield';
  if(/^Discard 1 Energy card attached to [^.]+ in order (?:to |)use this attack\. During your opponent's next turn, prevent all effects of attacks, including damage, done to [^.]+\.$/i.test(t))return 'barrierShield';
  if(/^Discard 1 Energy card attached to [^.]+ in order (?:to |)use this attack\. Remove all damage counters from [^.]+\.$/i.test(t))return 'recoverFull';
  if(/^Remove all damage counters from [^.]+\. [^.]+ is now Asleep\.$/i.test(t))return 'restHeal';
  if(/^Whenever an attack does damage to [^(]+\(after applying Weakness and Resistance\) during your opponent's next turn, that attack only does half the damage to [^(]+\(rounded down to the nearest 10\)\. \(Any other effects still happen\.\)$/i.test(t))return 'halfShield';
  if(a.name==='Stretch Kick'&&/opponent.{0,10}Benched Pokémon/i.test(t))return 'stretch';
  if(a.name==='Water Gun'&&/Does 10 damage plus 10 more damage for each Water Energy/i.test(t))return 'watergun';
  if(a.name==='Hydro Pump'&&/Does 40 damage plus 10 more damage for each Water Energy/i.test(t))return 'hydropump';
  // Only accept search/snipe templates whose entire effect is understood.
  if(/^Search your deck for (?:a|1) Basic Pok[eé]mon(?: card)?, (?:show|reveal) it to your opponent, (?:and )?put it into your hand\. (?:Then )?shuffle your deck\.$/i.test(t))return 'searchBasic';
  if(/^Search your deck for (?:a|1) Pok[eé]mon(?: card)?, (?:show|reveal) it to your opponent, (?:and )?put it into your hand\. (?:Then )?shuffle your deck\.$/i.test(t))return 'searchPokemon';
  if(/^Choose (?:1|one) of your opponent's Benched Pok[eé]mon\. This attack does (\d+) damage to that Pok[eé]mon\. \(Don't apply Weakness and Resistance for Benched Pok[eé]mon\.\)$/i.test(t))return 'benchSnipe';
  if(/^This attack does (\d+) damage to each of your opponent's Benched Pok[eé]mon\. \(Don't apply Weakness and Resistance for Benched Pok[eé]mon\.\)$/i.test(t))return 'benchSpread';
  if(/^Draw (?:a|1|2|3|4) cards?\.?$/i.test(t))return 'draw';
  if(/^Flip a coin\. If heads, draw (?:a|1|2|3) cards?\.$/i.test(t))return 'coinDraw';
  // Damage depending on Energy attached to the Defending Pokemon (e.g. Base Mewtwo Psychic).
  if(/^Does (\d+) damage plus (\d+) more damage for each Energy card attached to the Defending Pok[eé]mon\.$/i.test(t))return 'defenderEnergyBonus';
  // Historical protection attacks; track the shield only until the opponent finishes its next turn.
  if(/^Flip a coin\. If heads, prevent all damage done to (?:this Pok[eé]mon|[\w'’ .-]+) during your opponent's next turn\. \(Any other effects of attacks still happen\.\)$/i.test(t))return 'coinPreventDamage';
  if(/^Flip (\d+) coins?\. This attack does (\d+) damage (?:times|for each) (?:the )?number of heads\.$/i.test(t))return 'multi';
  if(/^Flip a coin\. If heads, this attack does (\d+) damage plus (\d+) more damage;? if tails, this attack does (\d+) damage\.$/i.test(t))return 'coinDamageChoice';
  if(/^Flip a coin until you get tails\. This attack does (\d+) damage times the number of heads\.$/i.test(t))return 'untilTails';
  if(/^Does (\d+) damage plus (\d+) more damage for each damage counter on the Defending Pok[eé]mon\.$/i.test(t))return 'defenderDamageBonus';
  if(/^Does (\d+) damage plus (\d+) more damage for each damage counter on [^.]+\.$/i.test(t))return 'selfDamageBonus';
  if(/^Does (\d+) damage minus (\d+) for each damage counter on [^.]+\.$/i.test(t))return 'selfDamageMinus';
  if(/^Does (\d+) damage times (?:the )?number of damage counters on [^.]+\.$/i.test(t))return 'selfDamageTimes';
  if(/^Does (\d+) damage plus (\d+) more damage for each of your Benched Pok[eé]mon\.$/i.test(t))return 'benchCountBonus';
  if(/^Don't apply Weakness and Resistance for this attack\. \(Any other effects that would happen after applying Weakness and Resistance still happen\.\)$/i.test(t))return 'ignoreWR';
  if(/^The Defending Pok[eé]mon can't retreat during your opponent's next turn\.$/i.test(t))return 'cantRetreat';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon can't retreat during your opponent's next turn\.$/i.test(t))return 'coinCantRetreat';
  if(/^If the Defending Pok[eé]mon tries to attack during your opponent's next turn, your opponent flips a coin\. If tails, that attack does nothing\.$/i.test(t))return 'smokescreen';
  if(/^If the Defending Pok[eé]mon has any Energy cards attached to it, choose (?:1|one) of them and discard it\.$/i.test(t))return 'discardDefenderEnergy';
  if(/^If the Defending Pok[eé]mon has any Energy cards attached to it, flip a coin\. If heads, choose (?:1|one) of those Energy cards and discard it\.$/i.test(t))return 'coinDiscardDefenderEnergy';
  if(/^Does (\d+) damage to each of your own Benched Pok[eé]mon\. \(Don't apply Weakness and Resistance for Benched Pok[eé]mon\.\)$/i.test(t))return 'ownBenchSpread';
  if(/^If your opponent has any Benched Pok[eé]mon, he or she chooses 1 of them and switches it with the Defending Pok[eé]mon\. \(Do the damage before switching the Pok[eé]mon\.\)$/i.test(t))return 'forceSwitchAfterDamage';
  if(/^If your opponent has any Benched Pok[eé]mon, choose 1 of them and switch it with (?:the Defending|his or her Active) Pok[eé]mon\.$/i.test(t))return 'forceSwitch';
  if(/^Flip a coin\. If heads and if your opponent has any Benched Pok[eé]mon, he or she chooses 1 of them and switches it with the Defending Pok[eé]mon\. \(Do the damage before switching the Pok[eé]mon\.\)$/i.test(t))return 'coinForceSwitchAfterDamage';
  if(/^If your opponent has any Benched Pok[eé]mon, choose 1 of them and this attack does (\d+) damage to it\. \(Don't apply Weakness and Resistance for Benched Pok[eé]mon\.\)$/i.test(t))return 'benchSnipe';
  if(/^This attack's damage isn't affected by Weakness, Resistance, Pok[eé]mon Powers, or any other effects on the Defending Pok[eé]mon\.$/i.test(t))return 'swift';
  if(/^Until the end of your next turn, if an attack damages the Defending Pok[eé]mon \(after applying Weakness and Resistance\), that attack does (\d+) more damage to the Defending Pok[eé]mon\.$/i.test(t))return 'damageAmplifier';
  if(/^Flip a coin\. If heads, this attack does (\d+) damage to each of your opponent's Benched Pok[eé]mon\. If tails, this attack does (\d+) damage to each of your own Benched Pok[eé]mon\. \(Don't apply Weakness and Resistance for Benched Pok[eé]mon\.\)$/i.test(t))return 'coinBenchSpread';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now Paralyzed\. If tails, this attack does nothing \(not even damage\)\.$/i.test(t))return 'paralyzeOrFail';
  if(/^Does damage to the Defending Pok[eé]mon equal to half the Defending Pok[eé]mon's remaining HP \(rounded up to the nearest 10\)\.$/i.test(t))return 'halfRemainingHP';
  if(/^The Defending Pok[eé]mon is now Poisoned\. It now takes (\d+) Poison damage instead of 10 after each player's turn \(even if it was already Poisoned\)\.$/i.test(t))return 'severePoison';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now (Confused|Paralyzed) and Poisoned\.$/i.test(t))return 'coinDoubleStatus';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now Poisoned; if tails, the Defending Pok[eé]mon is now Paralyzed\.$/i.test(t))return 'poisonOrParalyze';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now Paralyzed\. If tails, the Defending Pok[eé]mon is now Asleep\.$/i.test(t))return 'paralyzeOrSleep';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now Confused; if tails, the Defending Pok[eé]mon is now Asleep\.$/i.test(t))return 'confuseOrSleep';
  if(/^Does (\d+) damage to each Pok[eé]mon on each player's Bench\. \(Don't apply Weakness and Resistance for Benched Pok[eé]mon\.\) [^.]+ does (\d+) damage to itself\.$/i.test(t))return 'allBenchSelfDamage';
  if(/^Remove a number of damage counters from [^.]+ equal to (half )?the damage done to (?:the )?Defending Pok[eé]mon \(after applying Weakness and Resistance\)(?: \(rounded up to the nearest 10\))?(?:\. If [^.]+ has fewer damage counters than that, remove all of them)?\.$/i.test(t))return 'drainDamage';
  if(/^Flip a number of coins equal to the number of Energy(?: cards)? attached to [^.]+\. This attack does (\d+) damage times the number of heads\.$/i.test(t))return 'energyCoinDamage';
  if(/^You can't use this attack during your next turn\.$/i.test(t))return 'selfAttackLock';
  if(/^Choose 1 of the Defending Pok[eé]mon's attacks\. That Pok[eé]mon can't use that attack during your opponent's next turn\.$/i.test(t)||/^Choose 1 of defenders attacks\. Defender cannot use that attack next turn\.$/i.test(t))return 'opponentAttackLock';
  if(/^Flip (\d+) coins?\. This attack does (\d+) times the number of heads\.$/i.test(t))return 'multi';
  if(/^Does (\d+) damage plus (\d+) (?:more )?damage for each (?:[A-Z] )?Energy attached to [^.]+ but not used to pay for this attack(?:'s)? Energy cost\. (?:Extra (?:[A-Z] )?Energy after the (\d+)(?:st|nd|rd|th)? (?:doesn't|don't) count|You can't add more than (\d+) damage (?:in )?this way)\.$/i.test(t))return 'extraEnergyDamage';
  if(/^Does (\d+) damage plus (\d+) more damage for each (Nidoking) you have in play\.$/i.test(t))return 'namedInPlayBonus';
  if(/^Unless this attack Knocks Out the Defending Pok[eé]mon, return the Defending Pok[eé]mon and all cards attached to it to your opponent's hand\.$/i.test(t))return 'bounceDefender';
  if(/^During your next turn, [^.]+ attack's base damage is (\d+) instead of (\d+)\.$/i.test(t))return 'boostNextAttack';
  if(/^Unless all damage from this attack is prevented, you may remove (\d+) damage counter from [^.]+\.$/i.test(t))return 'leechSeed';
  if(/^During (?:your )?opponent's next turn, whenever (\d+) or less damage is done to [^(]+\(after applying Weakness and Resistance\), prevent that damage\. \(Any other effects of attacks still happen\.\)$/i.test(t))return 'hardenThreshold';
  if(/^The Defending Pok[eé]mon is now Poisoned\. This attack does (\d+) damage to each of your opponent's Benched Pok[eé]mon\. \(Don't apply Weakness and Resistance for Benched Pok[eé]mon\.\)$/i.test(t))return 'poisonBenchSpread';
  if(/^Flip (\d+) coins?\. This attack does (\d+) damage times the number of heads\. [^.]+ is now Confused \(after doing damage\)\.$/i.test(t))return 'multiSelfConfuse';
  if(/^Your opponent can't play Trainer cards during his or her next turn\.$/i.test(t))return 'trainerLock';
  if(/^Flip a coin\. If heads, your opponent can't play Trainer cards during his or her next turn\.$/i.test(t))return 'coinTrainerLock';
  if(/^This attack can't be used unless [^.]+ and the Defending Pok[eé]mon have the same number of Energy cards attached to them\.$/i.test(t))return 'equalEnergyRequired';
  if(/^You can't (?:use )?this attack unless the Defending Pok[eé]mon is Asleep\.$/i.test(t))return 'sleepRequired';
  if(/^All damage done by attacks to [^.]+ during your opponent's next turn is reduce by (\d+) \(after applying Weakness and Resistance\)\.$/i.test(t))return 'defendReduce';
  if(/^Flip a coin\. If heads, this attack does (\d+) damage plus (\d+) more damage; if tails, this attack does (\d+) damage and [^.]+ does (\d+) damage to itself\.$/i.test(t))return 'coinDamageRecoil';
  if(/^If the Defending Pok[eé]mon has any Energy cards attached to it, choose 1 and discard it\.$/i.test(t))return 'discardDefenderEnergy';
  if(/^Flip a coin\. If heads, Defending Pok[eé]mon is now (Poisoned|Paralyzed)\.$/i.test(t))return 'coinStatus';
  if(/^Does (\d+) damage times the number of Energy cards attached to the Defending Pok[eé]mon\.$/i.test(t))return 'defenderEnergyTimes';
  if(/^Discard 1 Energy card attached to [^.]+ or this attack does nothing\.$/i.test(t)||(a?.name==='Flamethrower'&&/^Discard 1 Fire Energy card attached to [^.]+ or this attack does nothing\.$/i.test(t)))return 'discardOneRequired';
  if(/^Does damage equal to half the Defending Pok[eé]mon's remaining HP \(rounded down to the nearest 10\)\.$/i.test(t))return 'halfRemainingHPDown';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now Poisoned; if tails, it is now Confused\.$/i.test(t))return 'poisonOrConfuse';
  if(/^Both the Defending Pok[eé]mon and [^.]+ are now Confused \(after doing damage\)\.$/i.test(t))return 'bothConfused';
  if(/^Flip a coin\. If tails, [^.]+ is now Confused \(after doing damage\)\.$/i.test(t))return 'coinSelfConfuse';
  if(/^If the Defending Pok[eé]mon isn't Colorless, this attack does (\d+) damage to each Benched Pok[eé]mon of the same type as the Defending Pok[eé]mon \(including your own\)\.$/i.test(t))return 'chainLightning';
  if(/^Switch [^.]+ with 1 of your Benched Pok[eé]mon\.$/i.test(t)||/^You may switch [^.]+ with 1 of your Benched Pok[eé]mon \(Do the damage before switching the Pok[eé]mon\)\.$/i.test(t))return 'selfSwitch';
  if(/^Choose 1 of your opponent's Pok[eé]mon\. This attack does (\d+) damage to that Pok[eé]mon\. Don't apply Weakness and Resistance for this attack\. \(Any other effects that would happen after applying Weakness and Resistance still happen\.\)$/i.test(t))return 'anySnipe';
  if(/^Flip a coin\. If heads, the Defending Pokémon is now (Asleep|Confused|Paralyzed|Poisoned)\.$/i.test(t))return 'coinStatus';
  if(/^The Defending Pokémon is now (Asleep|Confused|Paralyzed|Poisoned)\.$/i.test(t))return 'status';
  if(/^Flip a coin\. If tails, (?:this Pokémon|[\w'’ -]+) does (\d+) damage to itself\.$/i.test(t))return 'coinRecoil';
  if(/^(?:This Pokémon|[\w'’ -]+) does (\d+) damage to itself\.$/i.test(t))return 'recoil';
  if(/^Flip a coin\. If heads, this attack does (\d+) more damage\.$/i.test(t))return 'bonus';
  if(/^Flip a coin\. If tails, this attack does nothing\.$/i.test(t))return 'fail';
  if(/^Discard all Energy cards attached to (?:this Pokémon|[\w'’ -]+) in order to use this attack\.$/i.test(t))return 'discardAll';
  if(/^Discard (\d+) Energy cards? attached to (?:this Pokémon|[\w'’ -]+) in order to use this attack\.$/i.test(t)||(a?.name==='Flamethrower'&&/^Discard (\d+) Fire Energy cards? attached to (?:this Pokémon|[\w'’ -]+) in order to use this attack\.$/i.test(t)))return 'discardSome';
  if(/^Remove (?:1|one|2|two) damage counters? from (?:this Pokémon|[\w'’ -]+)\.$/i.test(t))return 'heal';
  if(/^Flip a coin\. If tails, this attack does nothing\. Either way, you can't use this attack again as long as [^.]+ stays in play[^]*$/i.test(t))return 'oncePerPlayCoin';
  if(/^Discard 1 Energy card attached to [^.]+ in order to use this attack\. If a Pok[eé]mon Knocks Out [^.]+ during your opponent's next turn, Knock Out that Pok[eé]mon\.$/i.test(t))return 'destinyBond';
  if(/^Search your deck for (?:a|an) (?:[A-Za-z]+ )?Basic Pok[eé]mon(?: card)?(?: named [^.]+| with [^.]+ in its name)? and put it onto your Bench\.[^]*$/i.test(t))return 'searchBasicToBench';
  if(/^Flip a coin\. If heads, you may search your deck for a Basic Pok[eé]mon(?: card)? with [^.]+ in its name and put it onto your Bench\.[^]*$/i.test(t))return 'coinSearchBasicToBench';
  if(/^If the Defending Pok[eé]mon attacks [^.]+ during your opponent's next turn, any damage done[^.]+(?:is |is reduce|is reduced) by (\d+)[^.]*\.[^]*$/i.test(t))return 'defendReduce';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon can't attack [^.]+ during your opponent's next turn\.[^]*$/i.test(t))return 'coinPreventAttack';
  if(/^Take up to (\d+) [A-Za-z]+ Energy cards from your discard pile and attach them to [^.]+\.$/i.test(t))return 'recoverEnergyAttach';
  if(/^Choose up to (\d+) Energy cards from your discard pile and attach them to [^.]+\.$/i.test(t))return 'recoverEnergyAttach';
  if(/^Take (?:1|one) [A-Za-z]+ Energy card from your discard pile and attach it to [^.]+\.$/i.test(t))return 'recoverEnergyAttach';
  if(/^If there are any Energy in your discard pile, choose 1 of them and attach it to [^.]+\.$/i.test(t))return 'recoverEnergyAttach';
  if(/^Put up to (\d+) Energy cards from your discard pile into your hand\. [^.]+ does (\d+) damage to itself\.$/i.test(t))return 'recoverEnergyHandRecoil';
  if(/^Flip a coin\. If heads, remove (?:a|1) damage counter from [^.]+\.[^]*$/i.test(t))return 'coinHeal';
  if(/^If [^.]+ has any damage counters on it, flip a coin\. If heads, remove 1 of those damage counters\.$/i.test(t))return 'coinHeal';
  if(/^If there are any damage counters on [^.]+, remove 1 of them\.$/i.test(t))return 'heal';
  if(/^Discard 1 Energy card attached to [^.]+ in order to use this attack\. Put a Trainer card from your discard pile into your hand\.$/i.test(t))return 'recoverTrainer';
  if(/^If your opponent has any Benched Pok[eé]mon, he or she chooses 1 of them and switches it with (?:his or her Active Pok[eé]mon|the Defending Pok[eé]mon), then,? if you have any Benched Pok[eé]mon, you switch 1 of them with your Active Pok[eé]mon\.[^]*$/i.test(t))return 'rapidSpin';
  if(/^If your opponent has any Benched Pok[eé]mon, he or she chooses 1 of them and switches it with their Active Pok[eé]mon; then,? if you have any Benched Pok[eé]mon, you switch 1 of them with your Active Pok[eé]mon\.[^]*$/i.test(t))return 'rapidSpin';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now Paralyzed,? and this attack does (\d+) damage to each of your opponent's Benched Pok[eé]mon\.[^]*$/i.test(t))return 'coinParalyzeBenchSpread';
  if(/^Look at your opponent's hand\.$/i.test(t))return 'revealHand';
  if(/^This attack can't be used during your next turn\. \(Benching [^.]+ ends this effect\.\)$/i.test(t))return 'selfAttackLock';
  if(/^[^.]+ is now Asleep \(after doing damage\)\.$/i.test(t))return 'selfSleep';
  if(/^[^.]+ is now Confused \(after doing damage\)\.$/i.test(t))return 'selfConfuse';
  if(/^The Defending Pok[eé]mon is now Asleep and Poisoned\.$/i.test(t))return 'sleepPoison';
  if(/^Both the Defending Pok[eé]mon and [^.]+ are now Asleep \(after doing damage\)\.$/i.test(t))return 'bothAsleep';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now Burned\.$/i.test(t))return 'coinBurn';
  if(/^During your opponent's next turn, prevent all effects of attacks, including damage, done to your Benched Pok[eé]mon\.$/i.test(t))return 'benchShield';
  if(/^[^.]+ does (\d+) damage to itself\. If your opponent has any Benched Pok[eé]mon, he or she chooses 1 of them and switches it with the Defending Pok[eé]mon\.[^]*$/i.test(t))return 'recoilForceSwitch';
  if(/^Does (\d+) damage plus (\d+) more damage for each damage counter on [^.]+\. Flip a coin\. If tails, [^.]+ is now Confused[^]*$/i.test(t))return 'selfDamageBonusConfuse';
  if(/^Flip a number of coins equal to the number of Energy cards attached to [^.]+\. This attack does (\d+) damage times the number of heads\. Discard a number of Energy cards attached to [^.]+ equal to the number of heads\.$/i.test(t))return 'energyCoinDamageDiscard';
  if(/^Your opponent flips a number of coins equal to the number of Pok[eé]mon on his or her Bench\. This attack does (\d+) damage times the number of tails\.[^]*$/i.test(t))return 'benchTailsDamage';
  if(/^Your opponent shuffles his or her Active Pok[eé]mon and all cards attached to it into his or her deck\. This attack can't be used if your opponent has no Benched Pok[eé]mon\.$/i.test(t))return 'shuffleDefender';
  if(/^If the Defending Pok[eé]mon has any basic Energy cards attached to it, choose 1 of them\. If your opponent has any Benched Pok[eé]mon, choose 1 of them and attach that Energy card to it\.$/i.test(t))return 'moveDefenderEnergy';
  if(/^Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\. If you get (\d+) or more heads, [^.]+ is now Confused[^]*$/i.test(t))return 'multiConditionalSelfConfuse';
  if(/^Discard 1 Energy card attached to [^.]+ in order to draw up to (\d+) cards\.$/i.test(t))return 'discardEnergyDraw';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now Paralyzed\. If tails, [^.]+ does (\d+) damage to itself\.$/i.test(t))return 'paralyzeOrRecoil';
  if(/^Before doing damage, choose 1 of your opponent's Benched Pok[eé]mon and switch it with the Defending Pok[eé]mon\. Do the damage to the new Defending Pok[eé]mon\.[^]*$/i.test(t))return 'forceSwitchBefore';
  if(/^Flip a coin\. If heads, choose 1 of your opponent's Benched Pok[eé]mon and switch it with the Defending Pok[eé]mon\. This attack can't be used if your opponent has no Benched Pok[eé]mon\.$/i.test(t))return 'coinForceSwitch';
  if(/^Does (\d+) damage plus (\d+) more damage for each (?:Magnemite, Magneton, and Dark Magneton|Murkrow)s? on your Bench\.$/i.test(t))return 'namedBenchBonus';
  if(/^Shuffle your opponent's deck\.$/i.test(t))return 'shuffleOpponentDeck';
  if(/^Search your deck for a Energy card and attach it to [^.]+\. Shuffle your deck afterward\.$/i.test(t))return 'searchEnergyAttach';
  if(/^Flip a coin until you get tails\. This attack does (\d+) damage plus (\d+) more damage for each heads\.$/i.test(t))return 'untilTailsBase';
  if(/^Put 1 damage counter on the Defending Pok[eé]mon for each damage counter on [^.]+\.$/i.test(t))return 'counterMirrorDamage';
  if(/^Flip a number of coins equal to the number of damage counters on [^.]+\. This attack does (\d+) damage plus (\d+) more damage for each heads\.$/i.test(t))return 'damageCounterCoins';
  if(/^[^.]+ is now Asleep\. Flip a coin, If heads, the Defending Pok[eé]mon is now Asleep\.$/i.test(t))return 'selfSleepCoinSleep';
  if(/^Flip a coin\. If tails, this attack's base damage is (\d+) instead of (\d+)\.$/i.test(t))return 'coinLowDamage';
  if(/^Flip a coin\. If heads, this attack does (\d+) damage plus (\d+) more damage\. If tails, this attack does (\d+) damage and the Defending Pok[eé]mon is now Asleep\.$/i.test(t))return 'damageOrSleep';
  if(/^Flip 2 coins\. If both of them are heads, this attack does (\d+) damage plus (\d+) more damage\. If 1 or both of them are tails, this attack does (\d+) damage\.$/i.test(t))return 'twoHeadsBonus';
  if(/^Flip 2 coins\. If both are heads, this attack does (\d+) damage plus (\d+) more damage\. If 1 or both are tails, this attack does (\d+) damage\.$/i.test(t))return 'twoHeadsBonus';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now Poisoned\. If tails, the Defending Pok[eé]mon is now Confused\.$/i.test(t))return 'poisonOrConfuse';
  if(/^Flip a coin\. If heads, remove (\d+) damage counters from [^.]+\.[^]*$/i.test(t))return 'coinHealMany';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon is now Asleep, Confused, Paralyzed, or Poisoned \(your choice\)\.$/i.test(t))return 'coinChoiceStatus';
  if(/^Flip a coin\. If heads, each player may choose a card from his or her discard pile and put it into his or her hand\.$/i.test(t))return 'coinRecoverBoth';
  if(/^Remove 1 damage counter from each of your Pok[eé]mon that has any damage counters on it\.$/i.test(t))return 'healAllFriendly';
  if(/^This attack does (\d+) damage plus (\d+) more damage for each Special Energy card attached to the Defending Pok[eé]mon\.$/i.test(t))return 'specialEnergyBonus';
  if(/^If the Defending Pok[eé]mon has no damage counters on it, this attack does (\d+) damage\. If it has any, this attack does (\d+) damage\.$/i.test(t))return 'damageIfHealthy';
  if(/^If there are more Energy cards attached to the Defending Pok[eé]mon than to [^.]+, this attack does (\d+) damage plus (\d+) more damage\. If not, this attack does (\d+) damage\.$/i.test(t))return 'energyComparisonDamage';
  if(/^[^.]+ and the Defending Pok[eé]mon have a different number of Energy cards attached to them, this attack does nothing\.$/i.test(t))return 'equalEnergyRequired';
  if(/^[^.]+ can't attack during your next turn\.$/i.test(t))return 'selfAttackLock';
  if(/^Does (\d+) damage plus (\d+) (?:more )?damage for each (?:attached )?(?:[A-Z][a-z]* )?Energy attached to [^.]+ but not used to pay for this attack(?:'s)?(?: Energy cost)?\. (?:Extra .* after the (\d+)(?:st|nd|rd|th)? (?:doesn't|don't) count|You can't add more than (\d+) damage in this way)\.$/i.test(t))return 'extraEnergyDamage';
  if(/^Discard 1 Energy card to [^.]+ in order to use this attack\. Remove all damage counters from [^.]+\.$/i.test(t))return 'recoverFull';
  if(/^[^.]+ does (\d+) damage to itself\. Flip a coin\. If heads, prevent all damage done to [^.]+ during your opponent's next turn\.[^]*$/i.test(t))return 'recoilCoinPreventDamage';
  if(/^Your opponent flips a coin\. If tails, this attack does (\d+) damage plus (\d+) more damage; if heads, this attack does (\d+) damage\.$/i.test(t))return 'coinDamageChoice';
  if(/^If your opponent has any Benched Pok[eé]mon, choose 1 of them and flip a coin\. If heads, this attack does (\d+) damage to that Pok[eé]mon\.[^]*$/i.test(t))return 'coinBenchSnipe';
  if(/^Flip a number of coins equal to the number of Energy cards attached to [^.]+\. This attack does (\d+) times the number of heads\. You can't flips? more than (\d+) coins in this way\.$/i.test(t))return 'cappedEnergyCoins';
  if(/^Flip 2 coins\. If both are heads, the Defending Pok[eé]mon is now Paralyzed\. If either of them is tails, this attack does nothing[^]*$/i.test(t))return 'twoHeadsParalyze';
  if(/^For each Benched Pok[eé]mon in play \(yours and your opponent's\), flip a coin\. If heads, this attack does (\d+) damage to that Pok[eé]mon\.[^]*$/i.test(t))return 'allBenchCoinDamage';
  if(/^Flip a coin\. If heads, this attack does (\d+) damage to each of your opponent's Pok[eé]mon\. Don't apply Weakness and Resistance\. Then, if your opponent has any Benched Pok[eé]mon, he or she chooses 1 of them and switches it with the Defending Pok[eé]mon\.$/i.test(t))return 'coinAllOpponentSwitch';
  if(/^Use this attack only if there are any Energy cards attached to [^.]+\. Flip a coin\. If heads, discard 1 of those Energy cards\. If tails, this attack does nothing[^]*$/i.test(t))return 'energyRequiredCoinDiscardOrFail';
  if(/^Use this attack only if there are any Energy cards attached to [^.]+\. Flip a coin\. If heads, discard 1 of those Energy cards and this attack does (\d+) damage plus (\d+) more damage\. If tails, this attack does (\d+) damage\.$/i.test(t))return 'energyRequiredCoinBonusDiscard';
  if(/^Search your deck for an Evolution card named [^.]+ and put it on [^.]+\. \(This counts as evolving [^.]+\.\) Shuffle your deck afterward\.$/i.test(t))return 'searchEvolutionSelf';
  if(/^Shuffle [^.]+ into your deck\. \(Discard all cards attached to [^.]+\.\)$/i.test(t))return 'shuffleSelfDiscardAttachments';
  if(/^Flip a coin\. If heads, this attack does (\d+) damage plus (\d+) more damage and the Defending Pok[eé]mon is now Paralyzed; if tails, this attack does (\d+) damage\.$/i.test(t))return 'coinBonusParalyze';
  if(/^Choose 1 of your opponent's Pok[eé]mon and flip a coin\. If heads, this attack does (\d+) damage to that Pok[eé]mon\. Don't apply Weakness and Resistance[^]*$/i.test(t))return 'coinAnySnipe';
  if(/^Flip a coin\. If heads, flip another coin\. If the second coin is heads, this attack does (\d+) damage to each of your opponent's Benched Pok[eé]mon\. If the second coin is tails, this attack does (\d+) damage to each of your opponent's Benched Pok[eé]mon\.[^]*$/i.test(t))return 'doubleCoinBenchSpread';
  if(/^Discard (\d+) Energy cards attached to [^.]+ in order to use this attack\. This attack does (\d+) damage plus (\d+) more damage for each damage counter on [^.]+\.$/i.test(t))return 'discardSomeSelfDamageBonus';
  if(/^Flip a number of coins equal to the total number of Pok[eé]mon in play\. This attack does (\d+) damage times the number of heads\. Then, [^.]+ does (\d+) damage times the number of tails to itself\.$/i.test(t))return 'allPokemonCoinsRecoil';
  if(/^Flip a coin\. If heads, discard 1 Energy card attached to [^.]+\. If tails, discard all Energy cards attached to [^.]+\. If you can't discard Energy cards, this attack does nothing\.$/i.test(t))return 'coinDiscardOneOrAll';
  if(/^Flip a coin\. If tails, shuffle [^.]+ and all cards attached to it into your deck \(after doing damage\)\.$/i.test(t))return 'coinShuffleSelf';
  if(/^Put a damage counter on each of your opponent's Pok[eé]mon has already has any damage counters on it\.$/i.test(t))return 'damageDamagedOpponents';
  if(/^Draw a card\. Then, switch [^.]+ with 1 of your Benched Pok[eé]mon\. You can't use this attack if your Bench is empty\.$/i.test(t))return 'drawSelfSwitch';
  if(/^Search your deck for a basic Energy card\. Show that card to your opponent, then put it into your hand\. Shuffle your deck afterward\.$/i.test(t))return 'searchBasicEnergyHand';
  if(/^Take 1 [A-Za-z]+ Energy card attached to [^.]+ and attach it to 1 of your Benched Pok[eé]mon\. If you have no Benched Pok[eé]mon, discard that Energy card\.$/i.test(t))return 'moveOwnEnergyToBench';
  if(/^Does (\d+) damage to each Pok[eé]mon that isn't ([A-Za-z]+) on each player's Bench\.[^]*$/i.test(t))return 'typedBenchSpread';
  if(/^Flip (\d+) coins\. For each heads, remove 1 damage counter from each of your Pok[eé]mon\.[^]*$/i.test(t))return 'multiHealAll';
  if(/^Flip 2 coins\. If 1 or both of them are heads, the Defending Pok[eé]mon is now Confused\.$/i.test(t))return 'twoCoinsStatus';
  if(/^Discard the top (\d+) cards of your deck\.[^]*This attack does (\d+) damage for each ([A-Za-z]+) Energy card you discarded in this way\.$/i.test(t))return 'millSelfEnergyDamage';
  if(/^Does (\d+) damage to each of your opponent's Pok[eé]mon\. Don't apply Weakness and Resistance\.$/i.test(t))return 'allOpponentSpread';
  if(/^Shuffle your hand into your deck, then draw (\d+) cards\.$/i.test(t))return 'shuffleHandDraw';
  if(/^If the Defending Pok[eé]mon was Asleep, it is no longer Asleep\.$/i.test(t))return 'wakeDefender';
  if(/^Discard 1 Energy card attached to [^.]+ in order to use this attack\. If the Defending Pok[eé]mon has any Energy cards attached to it, choose 1 of them and discard it\.$/i.test(t))return 'discardOwnAndDefenderEnergy';
  if(/^Does (\d+) damage to each ([A-Za-z]+) Pok[eé]mon on your opponent's Bench\.[^]*$/i.test(t))return 'typedOpponentBenchSpread';
  if(/^Flip (\d+) coins\. This attack does (\d+) damage times the number of heads to the Defending Pok[eé]mon and (\d+) damage times the number of tails to [^.]+\.$/i.test(t))return 'multiHeadsDamageTailsRecoil';
  if(/^Don't apply Resistance for this attack\.[^]*$/i.test(t))return 'ignoreResistance';
  if(/^Shuffle your deck\.$/i.test(t))return 'shuffleOwnDeck';
  if(/^Flip 2 coins\. If 1 or both of them are tails, this attack does nothing\.$/i.test(t))return 'twoHeadsRequired';
  if(/^Return a ([A-Za-z]+) Energy card attached to [^.]+ to your hand in order to use this attack\.$/i.test(t))return 'returnEnergyRequired';
  if(/^Flip a coin\. If heads, the Defending Pok[eé]mon can't attack during your opponent's next turn\.$/i.test(t))return 'coinPreventAttack';
  if(batch43Id(a)!==null)return 'batch43';
  if(batch44Id(a)!==null)return 'batch44';
  if(batch45Id(a)!==null)return 'batch45';
  if(batch46Rule(a))return 'batch46';
  if(batch47Rule(cards.find(c=>c.attacks?.some(other=>other===a||(other.name===a.name&&other.text===a.text&&other.damage===a.damage))),a))return 'batch47';
  if(batch48Rule(cards.find(c=>c.attacks?.some(other=>other===a||(other.name===a.name&&other.text===a.text&&other.damage===a.damage))),a))return 'batch48';
  if(batch49Kind(cards.find(c=>c.attacks?.some(other=>other===a||(other.name===a.name&&other.text===a.text&&other.damage===a.damage))),a))return 'batch49';
  if(batch50Kind(cards.find(c=>c.attacks?.includes(a)),a))return 'batch50';
  if(batch51Kind(cards.find(c=>c.attacks?.includes(a)),a))return 'batch51';
  if(batch53Kind(cards.find(c=>c.attacks?.includes(a)),a))return 'batch53';
  if(batch54Kind(cards.find(c=>c.attacks?.includes(a)),a))return 'batch54';
  if(batch55Kind(cards.find(c=>c.attacks?.includes(a)),a))return 'batch55';
  return null;
 }
 legalAttack(a){return this.attackPattern(a)!==null}
 attackAudit(){return cards.flatMap(c=>(c.attacks||[]).map((a,i)=>({card:c.id,cardName:c.name,index:i,attack:a.name,pattern:this.attackPattern(a),implemented:this.legalAttack(a),text:a.text||''})))}
 attack(i,benchTarget=null,deferTurnEnd=false,searchChoice=null,copyOverride=null){let p=this.me,f=this.foe,u=p.active,c=this.card(u),original=c?.attacks?.[i],a=copyOverride?.attack||original;if(this.phase!=='game'||!a||!original||this.over||!f.active||!this.afford(u,original.cost)||u.attackLocks.some(x=>(x.name===a.name||x.name==='*')&&x.until>=this.round)||u.usedAttacks[a.name]||((c.subtypes||[]).includes('Baby')&&this.unitHasPower(f.active,'Scare')))return false;if((u.persistentAttackLockSource&&this.foe.active===u.persistentAttackLockSource&&this.foe.active.id===u.persistentAttackLockSourceId)||(u.conditionalAttackLockUntil>=this.round&&u.conditionalLockSource===this.foe.active)){this.log(`${c.name} cannot attack due to a lingering effect.`);render();return false}if(['Asleep','Paralyzed'].includes(u.status)){this.log(`${c.name} cannot attack while ${u.status}.`);render();return false}const pattern=this.attackPattern(a),t=a.text||'';let dmg=parseInt(a.damage,10)||0,pendingStatus=null;
 if(pattern==='batch54'){
  const result=batch54Prepare(this,batch54Kind(c,a),searchChoice,i,benchTarget,deferTurnEnd);
  if(!result.ok)return false;this.batch54Ready=result.selection;deckSearchRequest=null;
 }
 if(pattern==='batch55'){const ready=batch55Selection(this,batch55Kind(c,a),searchChoice,i,deferTurnEnd);if(!ready.ok)return false;this.batch55Ready=ready.data;deckSearchRequest=null;}
 if(!copyOverride&&pattern==='attackCopy'){
  const mode=this.copyAttackMode(c,original);
  if(mode==='mirror'){
   const outcome=u.incomingAttack;
   if(!outcome||outcome.turnSerial!==this.turnSerial-1||outcome.damage===undefined){this.log('Mirror Move: this Pokémon was not attacked on the previous turn.');render();return false;}
   const v=f.active;if(!v)return false;
   // The printed result is repeated without recalculating Weakness/Resistance.
   const hit=Math.max(0,outcome.damage);v.damage+=hit;
   if(outcome.status)v.status=outcome.status;
   if(outcome.poison)v.poison=true;
   this.log(`${c.name} used Mirror Move: repeats ${hit} damage from the previous attack.`);
   battlefieldAttack(this.turn,-1,original.name,hit);this.resolveKO();if(!this.over&&!deferTurnEnd)this.end();render();return true;
  }
  const choices=this.copyCandidates(mode,u,f);
  const copyCoin=()=>{const cache=this.copyCoinCache;if(cache&&cache.unit===u&&cache.turnSerial===this.turnSerial&&cache.index===i)return cache.heads;const heads=coin(original.name+' — copy check');this.copyCoinCache={unit:u,turnSerial:this.turnSerial,index:i,heads};return heads;};
  if(!choices.length){this.log(`${original.name}: no currently executable copied attack is available.`);render();return false;}
  if(searchChoice===null&&this.turn===0){
   // For Mini/Super Metronome the coin is resolved before showing valid choices.
   if(['mini','super'].includes(mode)&&!copyCoin()){
    this.log(`${original.name}: Tails, the attack failed.`);if(!deferTurnEnd)this.end();render();return true;
   }
   deckSearchRequest={attackIndex:i,label:`${original.name}: choose an attack to copy.`,options:choices.map(x=>({index:x.index,name:`${x.origin.name} — ${x.attack.name}`})),execute:j=>this.attack(i,benchTarget,deferTurnEnd,j)};
   render();return false;
  }
  const selected=choices.find(x=>x.index===searchChoice)||((this.turn!==0&&searchChoice===null)?choices[0]:null);
  if(!selected)return false;
  if(['mini','super'].includes(mode)&&this.turn!==0&&!copyCoin()){
   this.log(`${original.name}: Tails, the attack failed.`);if(!deferTurnEnd)this.end();render();return true;
  }
  deckSearchRequest=null;
  this.log(`${c.name}'s ${original.name} copies ${selected.origin.name}'s ${selected.attack.name}.`);
  return this.attack(i,benchTarget,deferTurnEnd,null,{attack:selected.attack,mode});
 }
 if(!copyOverride&&pattern==='batch55'&&batch55Kind(c,a)==='esp'&&this.batch55Ready?.heads===3){
  const copied=this.card(f.active)?.attacks?.[this.batch55Ready.copy];
  if(!copied||!this.copyable(copied,'super'))return false;
  deckSearchRequest=null;this.pending55=null;this.batch55Ready=null;
  return this.attack(i,benchTarget,deferTurnEnd,null,{attack:copied,mode:'super'});
 }
 if(copyOverride&&!this.copyable(a,copyOverride.mode))return false;
 if(copyOverride&&!['metronome','sketch'].includes(copyOverride.mode)){
  const count=pattern==='discardSome'?Number(t.match(/Discard (\d+) (?:Fire )?Energy/i)?.[1]||0):pattern==='discardAll'?u.energies.length:pattern==='discardOneRequired'?1:0;
  if(u.energies.length<count)return false;
 }
 if(pattern==='batch55'){const kind=batch55Kind(c,a),d=this.batch55Ready;if(kind==='birthdaySurprise')dmg=d.birthday&&d.heads?80:30;if(kind==='esp')dmg=d.heads===2?20:0;if(kind==='catPunch')dmg=d.heads?20:0;if(kind==='crystalWave')dmg=d.heads?40:30;if(kind==='dustDevil')dmg=0;}
 // Typed discard costs check the kind of Energy an attached card supplies.
 const fireDiscardIndices=()=>u.energies.flatMap((id,index)=>
  ['Fire Energy','Rainbow Energy','Miracle Energy'].includes(lookup.get(id)?.name)?[index]:[]);
 const typedFirePayment=/^Discard (?:\d+ )?Fire Energy card/i.test(t);
 const paidCount=pattern==='discardSome'?Number(t.match(/Discard (\d+) (?:Fire )?Energy/i)?.[1]||0):pattern==='discardOneRequired'?1:0;
 if(!copyOverride?.mode?.match(/^(metronome|sketch)$/)&&typedFirePayment&&
    ['discardSome','discardOneRequired'].includes(pattern)&&fireDiscardIndices().length<paidCount)return false;
 const attackTargetAtStart=f.active,damageBeforeAttack=f.active.damage,previousStatus=f.active.status,previousPoison=f.active.poison;
 const defendingTeamAtStart=[f.active,...f.bench].filter(Boolean);
 if(!pattern){this.log(`${a.name} is not scripted yet and cannot be used.`);render();return false}let batch43=null; if(pattern==='batch43'){batch43=batch43Effect(this,batch43Id(a),a,u,f.active,p,f);if(!batch43.ok)return false;dmg=batch43.dmg;pendingStatus=batch43.status||null;}let batch44=null; if(pattern==='batch44'){batch44=batch44Effect(this,batch44Id(a),a,u,p,f);if(!batch44.ok)return false;dmg=batch44.dmg;pendingStatus=batch44.status||null;}let batch46=null;
 if(pattern==='batch46'){
  const rule=batch46Rule(a),mode=rule.mode;
  const foeSide=mode.startsWith('foe'),ownSide=mode.startsWith('own');
  const ownBench=ownSide, list=ownSide?p.bench:f.bench;
  const optional=mode.endsWith('Optional');
  const needs=mode==='foeAny'||mode==='foeAnyOptional'||((foeSide||ownSide)&&(!optional||list.length>0));
  if(needs){const min=mode.startsWith('foeAny')?-1:0;if(!Number.isInteger(benchTarget)||benchTarget<min||benchTarget>=list.length)return false;}
  if(!optional&&(foeSide||ownSide)&&!list.length)return false;
  if(rule.kind==='electricCurrent'&&!u.energies.length)return false;
  const options=rule.kind==='plasma'?p.discard.map((id,index)=>({id,index,name:lookup.get(id)?.name||id})).filter(x=>energy(lookup.get(x.id))):
   rule.kind==='electricCurrent'?u.energies.map((id,index)=>({id,index,name:lookup.get(id)?.name||id})).filter(x=>gEnergyOK(x.id,gEnergyHint(c.name))):
   rule.kind==='warmUp'&&p.bench.length?p.deck.map((id,index)=>({id,index,name:lookup.get(id)?.name||id})).filter(x=>energy(lookup.get(x.id))):
   rule.kind==='terrorize'&&basic(this.card(f.active))?(this.card(f.active)?.attacks||[]).map((x,index)=>({index,id:'attack-'+index,name:x.name})): 
   rule.kind==='lightningStrike'?[{index:0,id:'keep',name:'Keep attached Energy (40 damage)'},{index:1,id:'discard',name:'Discard all Energy (80 damage)'}]:[];
  if(searchChoice===null&&this.turn===0&&options.length&&['electricCurrent','plasma','warmUp','terrorize','lightningStrike'].includes(rule.kind)){
   deckSearchRequest={attackIndex:i,label:`${a.name}: choose an option.`,options,execute:j=>this.attack(i,benchTarget,false,j)};
   render();return false;
  }
  if(searchChoice!==null&&options.length&&!options.some(x=>x.index===searchChoice))return false;
  batch46=batch46Effect(this,rule,a,u,p,f,benchTarget,searchChoice);
  if(!batch46.ok)return false;
  dmg=batch46.damage;
  if(batch46.direct){deckSearchRequest=null;if(this._trainer61Vermilion?.attacker===u&&this._trainer61Vermilion.serial===this.turnSerial&&this._trainer61Vermilion.result===false){u.damage+=10;this.log('Vermilion City Gym: Tails — attacking Pokémon takes 10 damage.');}
 u.lastAttackName=a.name;u.lastAttackRound=this.round;this.log(`${p.name}: ${c.name} used ${a.name}.`);this.resolveKO();if(!this.over&&!deferTurnEnd)this.end();render();return true;}
  deckSearchRequest=null;
 }
 let batch48=null;
 if(pattern==='batch48'){
  const rule=batch48Rule(c,a),choices=batch48Choices(this,rule),result=batch48Ready(this,rule,choices,searchChoice);
  if(result.prompt){
   if(result.prompt==='recipient'){
    const options=[p.active,...p.bench].map((v,j)=>({index:j-1,name:`${this.card(v)?.name} (${j?'Bench '+j:'Active'})`}));
    deckSearchRequest={label:`${a.name}: choose the Pokémon that receives Energy.`,options,execute:slot=>{
     const eOptions=p.hand.map((id,index)=>({id,index,name:lookup.get(id)?.name})).filter(x=>energy(lookup.get(x.id)));
     deckSearchRequest={label:`${a.name}: select up to two Energy cards (or none).`,options:eOptions,multi:true,min:0,max:2,selected:[],execute:energyIndices=>this.attack(i,benchTarget,false,{slot,energyIndices})};render();return true;
    }};render();return false;
   }
   deckSearchRequest={attackIndex:i,label:`${a.name}: choose ${result.prompt==='multi'?'any number of attached Energy cards':'an effect option'}.`,options:choices,multi:result.prompt==='multi',min:0,max:choices.length,selected:[],execute:value=>this.attack(i,benchTarget,false,value)};render();return false;
  }
  if(!result.ok)return false;
  deckSearchRequest=null;
  batch48=batch48Before(this,rule,result.value,a,u,p,f);dmg=batch48.damage;
 }
 let batch49=null;
 if(pattern==='batch49'){
  const kind=batch49Kind(c,a),options=batch49Options(this,kind),valid=batch49Validate(this,kind,options,searchChoice);
  if(valid.prompt){
   deckSearchRequest={attackIndex:i,label:`${a.name}: ${valid.multi?'choose up to '+(kind==='bellyDrum'?2:options.length)+' cards':'choose an option'}.`,options,
    multi:Boolean(valid.multi),min:0,max:kind==='bellyDrum'?2:options.length,selected:[],execute:choice=>this.attack(i,benchTarget,false,choice)};
   render();return false;
  }
  if(!valid.ok)return false;
  deckSearchRequest=null;
  batch49=batch49Effect(this,kind,valid.value,a,u,p,f);dmg=batch49.damage;
  if(batch49.direct){if(this._trainer61Vermilion?.attacker===u&&this._trainer61Vermilion.serial===this.turnSerial&&this._trainer61Vermilion.result===false){u.damage+=10;this.log('Vermilion City Gym: Tails — attacking Pokémon takes 10 damage.');}
 u.lastAttackName=a.name;u.lastAttackRound=this.round;
   this.log(`${p.name}: ${c.name} used ${a.name}.`);this.resolveKO();if(!this.over&&!deferTurnEnd)this.end();render();return true;}
 }
 let batch50=null;
 if(pattern==='batch50'){
  const kind=batch50Kind(c,a);
  if(kind==='rushingFlames'){
   const choices=batch50EnergyChoices(this),valid=Array.isArray(searchChoice)&&new Set(searchChoice).size===searchChoice.length&&searchChoice.every(j=>choices.some(x=>x.index===j));
   if(searchChoice===null&&this.turn===0){
    deckSearchRequest={attackIndex:i,label:'Rushing Flames: choose any number of Energy cards to discard (0 is allowed).',options:choices,multi:true,min:0,max:choices.length,selected:[],execute:indices=>this.attack(i,benchTarget,false,indices)};render();return false;
   }
   if(searchChoice!==null&&!valid)return false;
   batch50={kind,chosen:searchChoice===null?choices.slice(0,Math.min(2,choices.length)).map(x=>x.index):searchChoice};
  }else if(kind==='sweetScent'){
   // Flip exactly once. If a user must select a Pokémon, keep that flip while selection is pending.
   if(!this.pendingSweetScent||this.pendingSweetScent.source!==u||this.pendingSweetScent.turnSerial!==this.turnSerial){
    this.pendingSweetScent={source:u,turnSerial:this.turnSerial,side:coin('Sweet Scent')?'own':'opponent'};
   }
   const side=this.pendingSweetScent.side,sidePlayer=side==='own'?p:f;
   const choices=[sidePlayer.active,...sidePlayer.bench].map((v,j)=>({index:j-1,name:v?this.card(v)?.name+' ('+(j?'Bench '+j:'Active')+')':''})).filter((x,j)=>[sidePlayer.active,...sidePlayer.bench][j]?.damage>0);
   if(searchChoice===null&&choices.length&&this.turn===0){
    deckSearchRequest={attackIndex:i,label:`Sweet Scent: choose a damaged ${side==='own'?'friendly':'opposing'} Pokémon to heal.`,options:choices,execute:j=>this.attack(i,benchTarget,false,j)};render();return false;
   }
   if(searchChoice!==null&&!choices.some(x=>x.index===searchChoice))return false;
   batch50={kind,healTarget:searchChoice===null?choices[0]?.index:searchChoice,healSide:side};
  }else batch50={kind};
  deckSearchRequest=null;
 }
 let batch47=null;
 if(pattern==='batch47'){
  const rule=batch47Rule(c,a),options=batch47Options(this,rule);
  batch47={rule,options,selection:batch47Selection(this,rule,options,benchTarget,searchChoice)};
  if(batch47.selection.prompt){
   deckSearchRequest={attackIndex:i,label:`${a.name}: ${rule.kind==='wildfire'?'select Fire Energy to discard':rule.kind==='benchSpreadChoose'?'choose Benched targets':'choose a card or Pokémon'}.`,
    options,multi:Boolean(batch47.selection.multi),exact:Boolean(rule.exact),min:rule.exact?Math.min(rule.count,options.length):0,
    max:rule.kind==='benchSpreadChoose'?Math.min(rule.count,options.length):options.length,selected:[],
    execute:choice=>this.attack(i,benchTarget,false,choice)};
   render();return false;
  }
  if(!batch47.selection.ok)return false;
  deckSearchRequest=null;
  if(rule.kind==='feint')dmg=0;
 }
 let batch45=null;if(pattern==='batch45'){const mode=batch45Mode(a);const ownBench=mode==='ownBench'||mode==='ownBenchOptional';const required=mode==='any'||mode==='bench'||mode==='ownBench'||(mode==='benchOptional'&&f.bench.length>0)||(mode==='ownBenchOptional'&&p.bench.length>0);const targetCount=ownBench?p.bench.length:f.bench.length;if(required&&(!Number.isInteger(benchTarget)||benchTarget<(mode==='any'?-1:0)||benchTarget>=targetCount))return false;if(mode==='bench'&&!f.bench.length)return false;
  const id=batch45Id(a);
  if(id===21&&p.bench.length>=5||id===22&&p.bench.length>=5)return false;
  if([19,20,21,22].includes(id)){
    const collection=id===22?p.discard:p.deck;
    const candidates=collection.map((cid,j)=>({id:cid,j,c:lookup.get(cid)})).filter(x=>id===19?x.c?.name==='Fire Energy':id===20?x.c?.name==='Psychic Energy':id===21?x.c?.name==='Murkrow':x.c?.supertype==='Pokémon'&&(basic(x.c)||(x.c.subtypes||[]).includes('Baby')));
    if(searchChoice===null&&this.turn===0&&candidates.length){
      deckSearchRequest={attackIndex:i,label:`${a.name}: choose a card ${id===22?'from your discard pile':'from your deck'}.`,options:candidates.map(x=>({index:x.j,id:x.id,name:x.c.name})),execute:j=>this.attack(i,benchTarget,false,j)};
      render();return false;
    }
    if(searchChoice!==null&&!candidates.some(x=>x.j===searchChoice))return false;
    this.batch45SearchChoice=searchChoice===null?(candidates[0]?.j??null):searchChoice;
  }
  if(id===9&&!u.energies.length||id===11&&u.energies.length<2)return false;}if(a.name==='Stretch Kick'&&/opponent.{0,10}Benched Pokémon/i.test(a.text||'')&&!f.bench.length){this.log('Stretch Kick requires an opposing Benched Pokémon.');render();return false}if(['searchBasic','searchPokemon'].includes(pattern)){
  const candidates=p.deck.map((id,j)=>({id,j,c:lookup.get(id)})).filter(x=>x.c?.supertype==='Pokémon'&&(pattern!=='searchBasic'||basic(x.c)));
  if(searchChoice===null&&this.turn===0&&candidates.length){
   deckSearchRequest={attackIndex:i,kind:pattern,options:candidates.map(x=>({index:x.j,id:x.id,name:x.c.name}))};
   this.log(`${a.name}: choose a Pokémon from your deck.`);render();return false;
  }
  if(searchChoice!==null&&!candidates.some(x=>x.j===searchChoice))return false;
  const chosen=searchChoice===null?candidates[0]:candidates.find(x=>x.j===searchChoice);
  if(chosen){p.hand.push(p.deck.splice(chosen.j,1)[0]);this.log(`${p.name} found ${lookup.get(chosen.id).name} with ${a.name}.`)}
  p.deck=shuffle(p.deck);deckSearchRequest=null;
 }
 if(['benchSnipe','benchSpread'].includes(pattern)){
  if(!f.bench.length){this.log(`${a.name} has no opposing Benched target.`);render();return false}
  const hit=+((a.text||'').match(/does (\d+) damage/i)?.[1]||0);
  if(pattern==='benchSnipe'&&(!Number.isInteger(benchTarget)||benchTarget<0||benchTarget>=f.bench.length))return false;
  const targets=pattern==='benchSpread'?f.bench.map((v,k)=>({v,k})):[{v:f.bench[benchTarget],k:benchTarget}];
  for(const {v,k} of targets){const protectedBench=this.unitHasPower(f.active,'Aurora Veil')||(f.active.benchShieldUntil>0&&f.active.benchShieldUntil>=this.round);if(!protectedBench)v.damage+=hit;this.log(`${p.name}: ${a.name} ${protectedBench?'was blocked by Bench protection':`hit opposing Benched ${this.card(v).name} for ${hit} (no Weakness/Resistance)`}.`);if(!protectedBench)battlefieldAttack(this.turn,k,a.name,hit,true)}
  this.resolveKO();if(!this.over&&!deferTurnEnd)this.end();render();return true;
 }
 if(pattern==='anySnipe'){
  const hit=Number((a.text||'').match(/does (\d+) damage/i)?.[1]||0),victim=benchTarget===-1?f.active:f.bench[benchTarget];if(!victim)return false;const blocked=benchTarget!==-1&&(this.unitHasPower(f.active,'Aurora Veil')||(f.active.benchShieldUntil>0&&f.active.benchShieldUntil>=this.round));if(!blocked)victim.damage+=hit;this.log(`${p.name}: ${a.name} ${blocked?'was blocked':`hit ${this.card(victim).name} for ${hit}`}.`);if(!blocked)battlefieldAttack(this.turn,benchTarget,a.name,hit,benchTarget!==-1);this.resolveKO();if(!this.over&&!deferTurnEnd)this.end();render();return true;
 }
 if(['coinBenchSnipe','coinAnySnipe'].includes(pattern)){
  const victim=pattern==='coinAnySnipe'?(benchTarget===-1?f.active:f.bench[benchTarget]):f.bench[benchTarget];if(!victim)return false;const hit=Number(t.match(/does (\d+) damage/i)?.[1]||0),heads=coin(a.name+' — targeted attack');if(heads&&!(victim!==f.active&&(this.unitHasPower(f.active,'Aurora Veil')||(f.active.benchShieldUntil>0&&f.active.benchShieldUntil>=this.round))))victim.damage+=hit;this.resolveKO();if(!this.over&&!deferTurnEnd)this.end();render();return true
 }
 if(['searchBasicToBench','coinSearchBasicToBench'].includes(pattern)){
  if(p.bench.length>=5)return false;
  const allowed=pattern==='searchBasicToBench'||coin(a.name+' — search check');
  if(allowed){
   const named=t.match(/named ([^.]+?) and put/i)?.[1],owner=t.match(/with ([^.]+?) in its name/i)?.[1],type=t.match(/for (?:a|an) ([A-Za-z]+) Basic/i)?.[1];
   const candidates=p.deck.map((id,j)=>({id,j,c:lookup.get(id)})).filter(x=>basic(x.c)&&(!named||named.split(/ or /i).includes(x.c.name))&&(!owner||x.c.name.includes(owner))&&(!type||x.c.types?.includes(type)));
   if(searchChoice===null&&this.turn===0&&candidates.length){deckSearchRequest={attackIndex:i,kind:pattern,options:candidates.map(x=>({index:x.j,id:x.id,name:x.c.name}))};this.log(`${a.name}: choose a Basic Pokémon for your Bench.`);render();return false}
   if(searchChoice!==null&&!candidates.some(x=>x.j===searchChoice))return false;
   const chosen=searchChoice===null?candidates[0]:candidates.find(x=>x.j===searchChoice);if(chosen)p.bench.push(unit(p.deck.splice(chosen.j,1)[0]));p.deck=shuffle(p.deck);deckSearchRequest=null;
  }
 }
 if(pattern==='recoverLightningAttach'){
  const max=/up to 2 Lightning Energy/i.test(t)?2:1;
  for(let n=0;n<max;n++){
   const j=p.discard.findIndex(id=>lookup.get(id)?.name==='Lightning Energy');
   if(j<0)break;
   u.energies.push(p.discard.splice(j,1)[0]);
  }
 }
 if(pattern==='coinGrassGrowth'&&coin(a.name+' — Growth')){
  for(let n=0;n<2;n++){
   const j=p.hand.findIndex(id=>lookup.get(id)?.name==='Grass Energy');
   if(j<0)break;
   u.energies.push(p.hand.splice(j,1)[0]);
  }
 }
 if(pattern==='lightningSelfRecoil')u.damage+=10*u.energies.filter(id=>lookup.get(id)?.name==='Lightning Energy').length;
 if(pattern==='selfPoison')u.poison=true;
 if(pattern==='recoverEnergyAttach'){
  const cap=Number(t.match(/(?:up to )?(\d+)/i)?.[1]||1),specified=t.match(/(?:up to \d+|Take 1) ([A-Za-z]+) Energy/i)?.[1];
  for(let n=0;n<cap;n++){const j=p.discard.findIndex(id=>energy(lookup.get(id))&&(!specified||lookup.get(id)?.name===specified+' Energy'));if(j<0)break;u.energies.push(p.discard.splice(j,1)[0])}
 }
 if(pattern==='recoverEnergyHandRecoil'){
  const m=t.match(/up to (\d+).*does (\d+) damage/i);for(let n=0;n<Number(m?.[1]||0);n++){const j=p.discard.findIndex(id=>energy(lookup.get(id)));if(j<0)break;p.hand.push(p.discard.splice(j,1)[0])}u.damage+=Number(m?.[2]||0)
 }
 if(pattern==='recoverTrainer'){
  if(!u.energies.length)return false;const j=p.discard.findIndex(id=>trainer(lookup.get(id)));if(j<0)return false;p.discard.push(u.energies.pop());p.hand.push(p.discard.splice(j,1)[0])
 }
 if(pattern==='searchEnergyAttach'){
  const candidates=p.deck.map((id,j)=>({id,j,c:lookup.get(id)})).filter(x=>energy(x.c));if(searchChoice===null&&this.turn===0&&candidates.length){deckSearchRequest={attackIndex:i,kind:pattern,options:candidates.map(x=>({index:x.j,id:x.id,name:x.c.name}))};this.log(`${a.name}: choose an Energy card.`);render();return false}if(searchChoice!==null&&!candidates.some(x=>x.j===searchChoice))return false;const chosen=searchChoice===null?candidates[0]:candidates.find(x=>x.j===searchChoice);if(chosen)u.energies.push(p.deck.splice(chosen.j,1)[0]);p.deck=shuffle(p.deck);deckSearchRequest=null
 }
 if(pattern==='searchBasicEnergyHand'){
  const candidates=p.deck.map((id,j)=>({id,j,c:lookup.get(id)})).filter(x=>energy(x.c)&&!(x.c.subtypes||[]).includes('Special'));if(searchChoice===null&&this.turn===0&&candidates.length){deckSearchRequest={attackIndex:i,kind:pattern,options:candidates.map(x=>({index:x.j,id:x.id,name:x.c.name}))};render();return false}if(searchChoice!==null&&!candidates.some(x=>x.j===searchChoice))return false;const chosen=searchChoice===null?candidates[0]:candidates.find(x=>x.j===searchChoice);if(chosen)p.hand.push(p.deck.splice(chosen.j,1)[0]);p.deck=shuffle(p.deck);deckSearchRequest=null
 }
 if(pattern==='searchEvolutionSelf'){
  const names=(t.match(/named (.+?) and put/i)?.[1]||'').split(/, | or /).map(x=>x.trim()),candidates=p.deck.map((id,j)=>({id,j,c:lookup.get(id)})).filter(x=>names.includes(x.c?.name));if(searchChoice===null&&this.turn===0&&candidates.length){deckSearchRequest={attackIndex:i,kind:pattern,options:candidates.map(x=>({index:x.j,id:x.id,name:x.c.name}))};render();return false}if(searchChoice!==null&&!candidates.some(x=>x.j===searchChoice))return false;const chosen=searchChoice===null?candidates[0]:candidates.find(x=>x.j===searchChoice);if(chosen){u.under=[u.id,...u.under];u.id=p.deck.splice(chosen.j,1)[0];u.status=null;u.poison=false;u.burn=false}p.deck=shuffle(p.deck);deckSearchRequest=null
 }
 if(pattern==='discardEnergyDraw'){if(!u.energies.length)return false;p.discard.push(u.energies.pop());this.draw(p,Number(t.match(/up to (\d+)/i)?.[1]||0))}
 if(pattern==='returnEnergyRequired'){const type=t.match(/Return a ([A-Za-z]+) Energy/i)?.[1],j=u.energies.findIndex(id=>lookup.get(id)?.name===type+' Energy');if(j<0)return false;p.hand.push(u.energies.splice(j,1)[0])}
 if(pattern==='discardOwnAndDefenderEnergy'){if(!u.energies.length)return false;p.discard.push(u.energies.pop());if(f.active.energies.length)f.discard.push(f.active.energies.pop())}
 if(pattern==='shuffleOpponentDeck')f.deck=shuffle(f.deck)
 if(pattern==='shuffleOwnDeck')p.deck=shuffle(p.deck)
 if(pattern==='shuffleHandDraw'){const n=Number(t.match(/draw (\d+)/i)?.[1]||0);p.deck=shuffle([...p.deck,...p.hand]);p.hand=[];this.draw(p,n)}
 if(pattern==='shuffleDefender'){if(!f.bench.length)return false;const old=f.active;f.deck=shuffle([...f.deck,old.id,...old.under,...old.energies]);f.active=f.bench.shift();this.log(`${this.card(old).name} was shuffled into its owner's deck.`)}
 if(pattern==='moveDefenderEnergy'&&f.bench.length){const j=f.active.energies.findIndex(id=>!(lookup.get(id)?.subtypes||[]).includes('Special'));if(j>=0)f.bench[Math.max(0,Math.min(f.bench.length-1,Number.isInteger(benchTarget)?benchTarget:0))].energies.push(f.active.energies.splice(j,1)[0])}
 if(pattern==='moveOwnEnergyToBench'){const type=t.match(/Take 1 ([A-Za-z]+) Energy/i)?.[1],j=u.energies.findIndex(id=>lookup.get(id)?.name===type+' Energy');if(j<0)return false;if(p.bench.length)p.bench[Math.max(0,Math.min(p.bench.length-1,Number.isInteger(benchTarget)?benchTarget:0))].energies.push(u.energies.splice(j,1)[0]);else p.discard.push(u.energies.splice(j,1)[0])}
 if(pattern==='shuffleSelfDiscardAttachments'){p.discard.push(...u.under,...u.energies);p.deck=shuffle([...p.deck,u.id]);p.active=p.bench.shift()||null}
 if(pattern==='forceSwitchBefore'){if(!f.bench.length)return false;const slot=Number.isInteger(benchTarget)&&benchTarget>=0&&benchTarget<f.bench.length?benchTarget:0;[f.active,f.bench[slot]]=[f.bench[slot],f.active]}
 if(pattern==='oncePerPlayCoin'){u.usedAttacks[a.name]=true;if(!coin(a.name+' — attack check'))dmg=0}
 if(pattern==='energyRequiredCoinDiscardOrFail'){if(!u.energies.length)return false;if(coin(a.name+' — energy'))p.discard.push(u.energies.pop());else dmg=0}
 if(pattern==='energyRequiredCoinBonusDiscard'){if(!u.energies.length)return false;const m=t.match(/does (\d+) damage plus (\d+).*does (\d+) damage/i),heads=coin(a.name+' — energy');if(heads){p.discard.push(u.energies.pop());dmg=Number(m[1])+Number(m[2])}else dmg=Number(m[3])}
 if(pattern==='coinDiscardOneOrAll'){if(!u.energies.length){dmg=0}else if(coin(a.name+' — discard'))p.discard.push(u.energies.pop());else p.discard.push(...u.energies.splice(0))}
 if(pattern==='destinyBond'){if(!u.energies.length)return false;p.discard.push(u.energies.pop());u.destinyBondUntil=this.round+1}
 if(pattern==='coinPreventAttack'&&coin(a.name+' — attack prevention'))f.active.smokescreenUntil=this.round+1;
 if(pattern==='revealHand')this.log(`${p.name} saw the rival hand: ${f.hand.map(id=>lookup.get(id)?.name).join(', ')||'(empty)'}.`)
 if(u.status==='Confused'&&!coin('Confusion check')){this.log(`${c.name} hurt itself in confusion.`);u.damage+=20;this.resolveKO();if(!this.over&&!deferTurnEnd)this.end();return true}
 if((u.smokescreenUntil>0&&u.smokescreenUntil>=this.round||u.persistentAccuracySource===f.active&&u.persistentAccuracySourceId===f.active?.id)&&!coin('Attack accuracy check')){this.log(`${c.name}'s attack failed because of the lingering accuracy effect.`);if(!deferTurnEnd)this.end();return true}
 if(pattern==='batch51'){const result=batch51Handle(this,batch51Kind(c,a),i,benchTarget,deferTurnEnd,searchChoice,a,u);if(result.done)return result.value;dmg=result.damage;}
 let batch53=null;
 if(pattern==='batch53'){
  batch53={kind:batch53Kind(c,a)};const state=batch53Validate(this,batch53.kind,searchChoice,i,benchTarget,deferTurnEnd);
  if(state===false)return false;batch53.choice=state.choice;dmg=['bonfire','callOfNight'].includes(batch53.kind)?(batch53.kind==='bonfire'?state.damage:dmg):state.damage;deckSearchRequest=null;
 }
 if(pattern==='sleepRequired'&&f.active.status!=='Asleep')return false;
 if(pattern==='equalEnergyRequired'&&u.energies.length!==f.active.energies.length)return false;
 if(pattern==='discardOneRequired'&&!u.energies.length&&!copyOverride?.mode.match(/^(metronome|sketch)$/))return false;
 if(pattern==='paralyzeOrFail'&&!coin(a.name+' — attack check')){this.log(`${c.name}'s ${a.name} failed.`);if(!deferTurnEnd)this.end();return true}
 if(pattern==='batch45'){batch45=batch45Effect(this,batch45Id(a),a,u,p,f,benchTarget);if(!batch45.ok)return false;dmg=batch45.damage;if([19,20,21,22].includes(batch45Id(a)))deckSearchRequest=null;if(batch45.direct){if(this._trainer61Vermilion?.attacker===u&&this._trainer61Vermilion.serial===this.turnSerial&&this._trainer61Vermilion.result===false){u.damage+=10;this.log('Vermilion City Gym: Tails — attacking Pokémon takes 10 damage.');}
 u.lastAttackName=a.name;u.lastAttackRound=this.round;this.log(`${p.name}: ${c.name} used ${a.name}.`);this.resolveKO();if(!this.over&&!deferTurnEnd)this.end();render();return true;}}
 if(['agilityShield','barrierShield','recoverFull','restHeal','halfShield'].includes(pattern)){
  if(['barrierShield','recoverFull'].includes(pattern)){
   if(!u.energies.length){this.log(`${a.name} requires an attached Energy to discard.`);render();return false}
   p.discard.push(u.energies.pop());
  }
  if(pattern==='agilityShield'){const heads=coin(a.name+' — protection');if(heads){u.preventAttackEffects=true;u.attackShield=Infinity;}this.log(`${c.name} used ${a.name}: ${heads?'protected':'tails'}.`)}
  if(pattern==='barrierShield'){u.preventAttackEffects=true;u.attackShield=Infinity;this.log(`${c.name} used Barrier and discarded 1 Energy.`)}
  if(pattern==='halfShield'){u.halfShield=true;this.log(`${c.name} used Light Screen.`)}
  if(pattern==='recoverFull'||pattern==='restHeal'){u.damage=0;if(pattern==='restHeal')u.status='Asleep';this.log(`${c.name} used ${a.name} and healed all damage.`)}
  render();if(!deferTurnEnd)this.end();return true;
 }
 if(pattern==='coinPreventDamage'){
  const activate=coin(a.name+' — protection check');
  if(activate){u.attackShield=Infinity;}
  this.log(`${p.name}: ${c.name} used ${a.name}${activate?' — protected during rival turn':' — protection failed'}.`);render();
  if(!deferTurnEnd)this.end();return true;
 }
 if(pattern==='defendReduce'){
  const reduction=Number(t.match(/reduce(?:d)? by (\d+)/i)?.[1]||0);
  u.attackShield=reduction;
  this.log(`${p.name}: ${c.name} used ${a.name}; incoming attack damage reduced by ${reduction} during the rival's next turn.`);
  render();
  if(!deferTurnEnd)this.end();
  return true;
 }
if(a.name==='Water Gun'&&/Does 10 damage plus 10 more damage for each Water Energy/i.test(t)){const paid=(a.cost||[]).filter(e=>e==='Water').length;dmg=10+Math.min(20,Math.max(0,this.energies(u).filter(e=>e==='Water').length-paid)*10)}
 if(a.name==='Hydro Pump'&&/Does 40 damage plus 10 more damage for each Water Energy/i.test(t)){dmg=40+Math.min(20,Math.max(0,this.energies(u).filter(e=>e==='Water').length-3)*10)}
 if(a.name==='Stretch Kick'&&/opponent.{0,10}Benched Pokémon/i.test(t)){
  let slot=benchTarget;
  if(slot===null&&this.turn===0)return false;
  if(slot===null)slot=0;
  if(!Number.isInteger(slot)||slot<0||slot>=f.bench.length)return false;
  let victim=f.bench[slot];victim.damage+=20;
  this.log(`${p.name}: ${c.name} used Stretch Kick on Benched ${this.card(victim).name} (20 damage; no Weakness/Resistance).`);
  render();battlefieldAttack(this.turn,slot,'Stretch Kick',20,true);
  this.resolveKO();if(!this.over&&!deferTurnEnd)this.end();render();return true;
 }

 if(pattern==='massExplosion'){const isTarget=v=>/^(Koffing|Weezing|Dark Weezing)$/.test(this.card(v)?.name||'');dmg=20*[p.active,...p.bench,f.active,...f.bench].filter(v=>v&&isTarget(v)).length}
 if(pattern==='magnetonRecoil'&&!coin(a.name+' — recoil'))u.damage+=20;
 if(pattern==='defenderEnergyBonus'){const m=t.match(/^Does (\d+) damage plus (\d+) more damage for each Energy card attached to the Defending Pok[eé]mon/i);dmg=Number(m[1])+Number(m[2])*f.active.energies.length}
 if(pattern==='selfDamageBonusConfuse'){const m=t.match(/Does (\d+) damage plus (\d+)/i);dmg=Number(m[1])+Number(m[2])*Math.floor(u.damage/10)}
 if(pattern==='coinDamageChoice'){const m=t.match(/does (\d+) damage plus (\d+) more damage;? if tails, this attack does (\d+) damage/i);dmg=coin(a.name+' — damage')?Number(m[1])+Number(m[2]):Number(m[3])}
 if(pattern==='untilTails'){const per=Number(t.match(/does (\d+) damage times/i)?.[1]||0);let heads=0;while(heads<100&&coin(a.name+' — flip '+(heads+1)))heads++;dmg=per*heads}
 if(pattern==='defenderDamageBonus'){const m=t.match(/Does (\d+) damage plus (\d+) more damage/i);dmg=Number(m[1])+Number(m[2])*Math.floor(f.active.damage/10)}
 if(pattern==='selfDamageBonus'){const m=t.match(/Does (\d+) damage plus (\d+) more damage/i);dmg=Number(m[1])+Number(m[2])*Math.floor(u.damage/10)}
 if(pattern==='selfDamageMinus'){const m=t.match(/Does (\d+) damage minus (\d+)/i);dmg=Math.max(0,Number(m[1])-Number(m[2])*Math.floor(u.damage/10))}
 if(pattern==='selfDamageTimes'){const per=Number(t.match(/Does (\d+) damage times/i)?.[1]||0);dmg=per*Math.floor(u.damage/10)}
 if(pattern==='benchCountBonus'){const m=t.match(/Does (\d+) damage plus (\d+) more damage/i);dmg=Number(m[1])+Number(m[2])*p.bench.length}
 if(pattern==='halfRemainingHP'){const remaining=Math.max(0,Number(this.card(f.active)?.hp||0)-f.active.damage);dmg=Math.ceil(remaining/20)*10}
 if(pattern==='halfRemainingHPDown'){const remaining=Math.max(0,Number(this.card(f.active)?.hp||0)-f.active.damage);dmg=Math.floor(remaining/20)*10}
 if(pattern==='defenderEnergyTimes')dmg=Number(t.match(/Does (\d+) damage times/i)?.[1]||0)*f.active.energies.length
 if(pattern==='energyCoinDamage'){const per=Number(t.match(/does (\d+) damage times/i)?.[1]||0);let heads=0;for(let n=0;n<u.energies.length;n++)if(coin(a.name+' — flip '+(n+1)))heads++;dmg=per*heads}
 if(pattern==='energyCoinDamageDiscard'){const per=Number(t.match(/does (\d+) damage times/i)?.[1]||0);let heads=0;for(let n=0;n<u.energies.length;n++)if(coin(a.name+' — flip '+(n+1)))heads++;dmg=per*heads;p.discard.push(...u.energies.splice(0,heads))}
 if(pattern==='cappedEnergyCoins'){const m=t.match(/does (\d+) times.*more than (\d+) coins/i);let heads=0;for(let n=0;n<Math.min(u.energies.length,Number(m?.[2]||0));n++)if(coin(a.name+' — flip '+(n+1)))heads++;dmg=Number(m?.[1]||0)*heads}
 if(pattern==='benchTailsDamage'){const per=Number(t.match(/does (\d+) damage times/i)?.[1]||0);let tails=0;for(let n=0;n<f.bench.length;n++)if(!coin(a.name+' — rival flip '+(n+1)))tails++;dmg=per*tails}
 if(pattern==='extraEnergyDamage'){const m=t.match(/^Does (\d+) damage plus (\d+)/i),paid=(a.cost||[]).length,extra=Math.max(0,u.energies.length-paid),cap=Number(t.match(/can't add more than (\d+)/i)?.[1]||((t.match(/after the (\d+)/i)?.[1]||extra)*Number(m[2])));dmg=Number(m[1])+Math.min(cap,extra*Number(m[2]))}
 if(a.name==='Hidden Power'&&c.id==='neo4-58'&&this.printedPower(u,'[Perform]',true)&&!['Asleep','Paralyzed'].includes(u.status)&&u.incomingAttack?.turnSerial===this.turnSerial-1){
  dmg+=u.incomingAttack.damage||0;
  this.log(`[Perform] adds ${u.incomingAttack.damage||0} damage from the attack received last turn.`);
 }
 if(pattern==='namedInPlayBonus'){const m=t.match(/^Does (\d+) damage plus (\d+)/i),count=[p.active,...p.bench].filter(v=>this.card(v)?.name==='Nidoking').length;dmg=Number(m[1])+Number(m[2])*count}
 if(pattern==='namedBenchBonus'){const m=t.match(/^Does (\d+) damage plus (\d+)/i),names=/Magnemite/.test(t)?new Set(['Magnemite','Magneton','Dark Magneton']):new Set(['Murkrow']),count=p.bench.filter(v=>names.has(this.card(v)?.name)).length;dmg=Number(m[1])+Number(m[2])*count}
 if(pattern==='untilTailsBase'){const m=t.match(/does (\d+) damage plus (\d+)/i);let heads=0;while(heads<100&&coin(a.name+' — flip '+(heads+1)))heads++;dmg=Number(m[1])+Number(m[2])*heads}
 if(pattern==='counterMirrorDamage')dmg=Math.floor(u.damage/10)*10
 if(pattern==='damageCounterCoins'){const m=t.match(/does (\d+) damage plus (\d+)/i);let heads=0;for(let n=0;n<Math.floor(u.damage/10);n++)if(coin(a.name+' — flip '+(n+1)))heads++;dmg=Number(m[1])+Number(m[2])*heads}
 if(pattern==='coinLowDamage'){const m=t.match(/base damage is (\d+) instead of (\d+)/i);dmg=coin(a.name+' — damage')?Number(m[2]):Number(m[1])}
 if(pattern==='damageOrSleep'){const m=t.match(/heads, this attack does (\d+) damage plus (\d+).*tails, this attack does (\d+)/i),heads=coin(a.name+' — damage');dmg=heads?Number(m[1])+Number(m[2]):Number(m[3]);if(!heads)pendingStatus='Asleep'}
 if(pattern==='twoHeadsBonus'){const m=t.match(/does (\d+) damage plus (\d+).*does (\d+) damage/i),success=coin(a.name+' — flip 1')&&coin(a.name+' — flip 2');dmg=success?Number(m[1])+Number(m[2]):Number(m[3])}
 if(pattern==='coinBonusParalyze'){const m=t.match(/does (\d+) damage plus (\d+).*does (\d+) damage/i),heads=coin(a.name+' — bonus');dmg=heads?Number(m[1])+Number(m[2]):Number(m[3]);if(heads)pendingStatus='Paralyzed'}
 if(pattern==='discardSomeSelfDamageBonus'){const m=t.match(/Discard (\d+).*does (\d+) damage plus (\d+)/i),n=Number(m?.[1]||0);if(u.energies.length<n)return false;p.discard.push(...u.energies.splice(0,n));dmg=Number(m[2])+Number(m[3])*Math.floor(u.damage/10)}
 if(pattern==='allPokemonCoinsRecoil'){const m=t.match(/does (\d+) damage times.*does (\d+) damage times/i),count=[p.active,...p.bench,f.active,...f.bench].filter(Boolean).length;let heads=0;for(let n=0;n<count;n++)if(coin(a.name+' — flip '+(n+1)))heads++;dmg=Number(m[1])*heads;u.damage+=Number(m[2])*(count-heads)}
 if(pattern==='millSelfEnergyDamage'){const m=t.match(/top (\d+).*does (\d+) damage for each ([A-Za-z]+) Energy/i),milled=p.deck.splice(Math.max(0,p.deck.length-Number(m?.[1]||0)));p.discard.push(...milled);dmg=Number(m?.[2]||0)*milled.filter(id=>lookup.get(id)?.name===m?.[3]+' Energy').length}
 if(pattern==='specialEnergyBonus'){const m=t.match(/does (\d+) damage plus (\d+)/i);dmg=Number(m[1])+Number(m[2])*f.active.energies.filter(id=>(lookup.get(id)?.subtypes||[]).includes('Special')).length}
 if(pattern==='damageIfHealthy'){const m=t.match(/does (\d+) damage.*does (\d+) damage/i);dmg=f.active.damage?Number(m[2]):Number(m[1])}
 if(pattern==='energyComparisonDamage'){const m=t.match(/does (\d+) damage plus (\d+).*does (\d+) damage/i);dmg=f.active.energies.length>u.energies.length?Number(m[1])+Number(m[2]):Number(m[3])}
 if(pattern==='multiHeadsDamageTailsRecoil'){const m=t.match(/Flip (\d+) coins.*does (\d+) damage times.*and (\d+) damage times/i);let heads=0;for(let n=0;n<Number(m?.[1]||0);n++)if(coin(a.name+' — flip '+(n+1)))heads++;dmg=Number(m?.[2]||0)*heads;u.damage+=Number(m?.[3]||0)*(Number(m?.[1]||0)-heads)}
 if(pattern==='coinDamageRecoil'){const m=t.match(/does (\d+) damage plus (\d+) more damage; if tails, this attack does (\d+) damage and [^.]+ does (\d+) damage to itself/i);if(coin(a.name+' — damage'))dmg=Number(m[1])+Number(m[2]);else{dmg=Number(m[3]);u.damage+=Number(m[4])}}
 if(pattern==='twoHeadsRequired'&&!(coin(a.name+' — flip 1')&&coin(a.name+' — flip 2')))dmg=0
 if(pattern==='twoHeadsParalyze'){const locked=u.lockOnUntil===this.round&&u.lockOnTarget===f.active&&u.lockOnTargetId===f.active.id;const heads=locked||(coin(a.name+' — flip 1')&&coin(a.name+' — flip 2'));u.lockOnUntil=0;if(!heads)dmg=0;else pendingStatus='Paralyzed'}
 if(batch50?.kind==='giantGrowth'&&coin('Giant Growth'))u.giantGrowth=true;
 if(batch50?.kind==='shadowImages')u.shadowImages=true;
 if(batch50?.kind==='rushingFlames'){let count=0;const chosen=batch50.chosen.map(index=>({slot:Math.floor(index/100),j:index%100})).sort((x,y)=>y.slot-x.slot||y.j-x.j);for(const x of chosen){const source=x.slot===0?p.active:p.bench[x.slot-1];if(source?.energies[x.j]){p.discard.push(source.energies.splice(x.j,1)[0]);count++;}}let heads=0;for(let j=0;j<count;j++)if(coin('Rushing Flames — '+(j+1)))heads++;dmg=heads*40;}
 if(batch50?.kind==='sweetScent'){const side=batch50.healSide==='own'?p:f;const v=batch50.healTarget===-1?side.active:side.bench[batch50.healTarget];if(v)v.damage=Math.max(0,v.damage-20);this.pendingSweetScent=null;}
 if(batch50?.kind&&['mirrorShell','crosscounter','fireWall','counter','secretePoison','reflectShield'].includes(batch50.kind)){u.counterEffect={kind:batch50.kind,name:a.name,expires:this.turnSerial+2};}
 if(c.id==='gym2-10'&&a.name==='Pound'&&u.giantGrowth)dmg=30;
 let doubleRecoil=false;if(u.nextAttackBoost?.name===a.name&&u.nextAttackBoost.until>=this.round){const boost=u.nextAttackBoost;if(boost.multiplyBase){dmg+=Math.max(0,parseInt(a.damage,10)||0);doubleRecoil=Boolean(boost.multiplySelf)}else dmg=boost.damage;u.nextAttackBoost=null}
 const multi=['multi','multiSelfConfuse'].includes(pattern)&&t.match(/^Flip (\d+) coins?\. This attack does (\d+)(?: damage)? times (?:the )?number of heads/i);if(multi){let heads=0;for(let n=0;n<+multi[1];n++)if(coin(a.name+' — flip '+(n+1)))heads++;dmg=heads*(+multi[2]);if(pattern==='multiSelfConfuse')u.status='Confused'}
 if(pattern==='multiConditionalSelfConfuse'){const m=t.match(/Flip (\d+) coins\. This attack does (\d+) damage times.*get (\d+) or more heads/i);let heads=0;for(let n=0;n<Number(m?.[1]||0);n++)if(coin(a.name+' — flip '+(n+1)))heads++;dmg=heads*Number(m?.[2]||0);if(heads>=Number(m?.[3]||99))u.status='Confused'}
 if(pattern==='draw'||(pattern==='coinDraw'&&coin(a.name+' — draw check'))){const count=Number(t.match(/(?:Draw|draw) (\d+)/)?.[1]||1);this.draw(p,count);this.log(`${p.name} drew a card with ${a.name}.`)}
 if(pattern==='fail'&&!coin(a.name+' — attack check'))dmg=0;
 if(pattern==='bonus'&&coin(a.name+' — bonus damage'))dmg+=+(t.match(/does (\d+) more damage/i)?.[1]||0);
 if(['cantRetreat','coinCantRetreat'].includes(pattern)&&(pattern==='cantRetreat'||coin(a.name+' — retreat lock')))f.active.cantRetreatUntil=this.round+1;
 if(pattern==='smokescreen')f.active.smokescreenUntil=this.round+1;
 if(pattern==='trainerLock')f.trainerLockUntil=this.round+1;
 if(pattern==='coinTrainerLock'&&coin(a.name+' — Trainer lock'))f.trainerLockUntil=this.round+1;
 if(['discardDefenderEnergy','coinDiscardDefenderEnergy'].includes(pattern)&&f.active.energies.length&&(pattern==='discardDefenderEnergy'||coin(a.name+' — Energy discard'))){f.discard.push(f.active.energies.pop());this.log(`${this.card(f.active).name} discarded an Energy.`)}
 if(pattern==='ownBenchSpread'){const hit=Number(t.match(/Does (\d+) damage/i)?.[1]||0);for(const v of p.bench)v.damage+=hit}
 if(pattern==='chainLightning'&&!this.card(f.active)?.types?.includes('Colorless')){const hit=Number(t.match(/does (\d+) damage/i)?.[1]||0),type=this.card(f.active)?.types?.[0];for(const side of [p,f])for(const v of side.bench)if(this.card(v)?.types?.includes(type)&&!(side===f&&this.unitHasPower(f.active,'Aurora Veil')))v.damage+=hit}
 if(pattern==='coinBenchSpread'){const m=t.match(/does (\d+) damage to each of your opponent's.*does (\d+) damage to each of your own/i);const friendly=!coin(a.name+' — Bench damage');const side=friendly?p:f;if(friendly||!this.unitHasPower(f.active,'Aurora Veil'))for(const v of side.bench)v.damage+=Number(friendly?m[2]:m[1])}
 if(pattern==='doubleCoinBenchSpread'&&coin(a.name+' — activation')){const hit=coin(a.name+' — amount')?Number(t.match(/second coin is heads, this attack does (\d+)/i)?.[1]||0):Number(t.match(/second coin is tails, this attack does (\d+)/i)?.[1]||0);if(!this.unitHasPower(f.active,'Aurora Veil'))for(const v of f.bench)v.damage+=hit}
 if(pattern==='allBenchCoinDamage'){const hit=Number(t.match(/does (\d+) damage/i)?.[1]||0);for(const side of [p,f])for(const v of side.bench)if(coin(a.name+' — Bench flip'))v.damage+=hit}
 if(pattern==='coinAllOpponentSwitch'&&coin(a.name+' — spread')){const hit=Number(t.match(/does (\d+) damage/i)?.[1]||0);f.active.damage+=hit;if(!this.unitHasPower(f.active,'Aurora Veil'))for(const v of f.bench)v.damage+=hit}
 if(pattern==='typedBenchSpread'){const m=t.match(/Does (\d+).*isn't ([A-Za-z]+)/i);for(const side of [p,f])for(const v of side.bench)if(!this.card(v)?.types?.includes(m?.[2]))v.damage+=Number(m?.[1]||0)}
 if(pattern==='typedOpponentBenchSpread'){const m=t.match(/Does (\d+) damage to each ([A-Za-z]+)/i);if(!this.unitHasPower(f.active,'Aurora Veil'))for(const v of f.bench)if(this.card(v)?.types?.includes(m?.[2]))v.damage+=Number(m?.[1]||0)}
 if(pattern==='allOpponentSpread'){const hit=Number(t.match(/Does (\d+)/i)?.[1]||0);f.active.damage+=hit;if(!this.unitHasPower(f.active,'Aurora Veil'))for(const v of f.bench)v.damage+=hit}
 if(pattern==='damageDamagedOpponents')for(const v of [f.active,...f.bench])if(v?.damage)v.damage+=10
 if(pattern==='recoilForceSwitch'){u.damage+=Number(t.match(/does (\d+) damage to itself/i)?.[1]||0)}
 if(pattern==='recoilCoinPreventDamage'){u.damage+=Number(t.match(/does (\d+) damage to itself/i)?.[1]||0);if(coin(a.name+' — protection'))u.attackShield=Infinity}
 if(pattern==='allBenchSelfDamage'){const m=t.match(/Does (\d+) damage to each.*does (\d+) damage to itself/i);for(const side of [p,f])for(const v of side.bench)v.damage+=Number(m[1]);u.damage+=Number(m[2])}
 if(pattern==='damageAmplifier'){f.active.damageBoost=Number(t.match(/does (\d+) more damage/i)?.[1]||0);f.active.damageBoostUntil=this.round+1}
 if(pattern==='selfAttackLock')u.attackLocks.push({name:a.name,until:this.round+1})
 if(pattern==='opponentAttackLock'){const chosen=this.card(f.active)?.attacks?.[Number.isInteger(benchTarget)?benchTarget:0];if(chosen)f.active.attackLocks.push({name:chosen.name,until:this.round+1})}
 if(pattern==='boostNextAttack'){const m=t.match(/([\w'’ -]+) attack's base damage is (\d+)/i);u.nextAttackBoost={name:m?.[1]?.trim(),damage:Number(m?.[2]||0),until:this.round+1}}
 if(pattern==='hardenThreshold')u.preventBelow=Number(t.match(/whenever (\d+) or less/i)?.[1]||0)
 if(pattern==='batch55'&&batch55Kind(c,a)==='plunder'){f.discard.push(...(f.active.attachedTrainers||[]).map(x=>x.id));f.active.attachedTrainers=[];}
 if(dmg){
  // Printed attack modifiers from the original historical Power cards.
  if(a.name==='Megahorn'&&this.unitHasPower(u,'Final Blow')&&this.maxHP(u)-u.damage<=20)dmg=120;
  if(a.name==='Floodlight'&&this.unitHasPower(u,'Hydroelectric Power')){
   const extra=Math.max(0,u.energies.filter(id=>lookup.get(id)?.name==='Water Energy').length-(a.cost||[]).filter(t=>t==='Water').length);
   dmg+=extra*10;
  }
  if(this.unitHasPower(u,'Frenzy')&&u.status==='Confused')dmg+=30;
  if(u.damageOutgoingReductionUntil>=this.round)dmg=Math.max(0,dmg-(u.damageOutgoingReduction||0));dmg=(batch43?.ignoreWR||batch44?.ignoreWR||['ignoreWR','swift','benchTailsDamage'].includes(pattern)||(pattern==='batch53'&&batch53?.kind==='bonfire'))?Math.max(0,dmg):pattern==='ignoreResistance'?(this.card(f.active)?.weaknesses?.some(w=>w.type===c.types?.[0])?dmg*2:dmg):calculateDamage(dmg,c,modifiedType49(this.card(f.active),f.active));if(batch44?.ignoreResistance){const weak=this.card(f.active)?.weaknesses?.find(w=>w.type===c.types?.[0]);dmg=Math.max(0,batch44.dmg)*(weak?2:1)}if(batch43?.ignoreResistance){const weak=this.card(f.active)?.weaknesses?.find(w=>w.type===c.types?.[0]);dmg=Math.max(0,batch43.dmg)*(weak?2:1)}if(c.name==='Politoed'&&this.unitHasPower(u,'Frog Song')&&this.players.flatMap(side=>[side.active,...side.bench]).filter(v=>/^(Poliwag|Poliwhirl|Poliwrath|Politoed)$/.test(this.card(v)?.name||'')).length>3)dmg+=40;if(a.name==='Hidden Power'&&this.players[this.turn].active){const sources=[p.active,...p.bench].filter(v=>this.unitHasPower(v,'[XXXXX]'));if(sources.length){let heads=0;while(heads<100&&coin('[XXXXX]'))heads++;dmg+=heads*10;}}if(a.name==='Hidden Power'){const anger=[p.active,...p.bench].find(v=>this.unitHasPower(v,'Anger'));if(anger)dmg+=anger.damage}if(f.active.damageBoostUntil>=this.round)dmg+=f.active.damageBoost;if(f.active.preventBelow&&dmg<=f.active.preventBelow)dmg=0;if(this.countPower(1-this.turn,'[Metal]')===1&&c.types?.includes('Metal'))dmg=Math.max(0,dmg-30);if(this.countPower(1-this.turn,'[Normal]')===1&&c.types?.includes('Colorless'))dmg=Math.max(0,dmg-30);if(this.countPower(1-this.turn,'Darkness')===1&&c.types?.includes('Darkness'))dmg=Math.max(0,dmg-30);if(this.unitHasPower(f.active,'Neutral Shield')&&(u.under||[]).length)dmg=0;if(this.unitHasPower(f.active,'Shell Armor'))dmg=Math.max(0,dmg-10);if(this.unitHasPower(f.active,'Hard Shell')&&dmg<=40)dmg=10;if(this.unitHasPower(f.active,'Strange Barrier')&&basic(c)&&dmg>=20)dmg=10;if(this.continuousPower('Relaxing Scent'))dmg=Math.ceil(dmg/20)*10;if(f.active.halfShield)dmg=Math.floor(dmg/20)*10;if(f.active.preventDamageThresholdUntil>=this.round&&dmg>=f.active.preventDamageThreshold)dmg=0;if(f.active.coinDamageShieldUntil>=this.round&&dmg>0&&coin('Dodge — prevent attack damage'))dmg=0;if(f.active.slimeShieldUntilSerial>this.turnSerial&&dmg>0&&!coin('Slime — prevent damage on tails'))dmg=0;if(dmg>0&&this.stadium){const stadiumName=lookup.get(this.stadium.id)?.name;if(stadiumName==='Sprout Tower'&&c.types?.includes('Colorless'))dmg=Math.max(0,dmg-30)}if(dmg>0)dmg+=10*(u.attachedTrainers||[]).filter(x=>lookup.get(x.id)?.name==='PlusPower').length;dmg=Math.max(0,dmg-20*(f.active.attachedTrainers||[]).filter(x=>lookup.get(x.id)?.name==='Defender').length);if(f.active.attackShield){const previous=dmg;dmg=Math.max(0,dmg-f.active.attackShield);this.log(`${this.card(f.active).name}'s protective attack reduced damage by ${previous-dmg}.`)}if(this.card(f.active)?.abilities?.some(a=>a.name==='Kabuto Armor')&&!['Asleep','Confused','Paralyzed'].includes(f.active.status)&&!this.continuousPower('Toxic Gas'))dmg=Math.floor(dmg/20)*10;
 // Mr. Mime: Invisible Wall prevents 30 or more attack damage after Weakness/Resistance.
 if(this.card(f.active)?.abilities?.some(a=>a.name==='Invisible Wall')&&!['Asleep','Confused','Paralyzed'].includes(f.active.status)&&!this.continuousPower('Toxic Gas')&&dmg>=30)dmg=0;
 if(dmg){if(this.card(f.active)?.abilities?.some(a=>a.name==='Transparency')&&!['Asleep','Confused','Paralyzed'].includes(f.active.status)&&!this.continuousPower('Toxic Gas')&&coin('Haunter — Transparency'))dmg=0;}if(dmg){dmg=batch50Incoming(this,f.active,u,dmg);}if(dmg>0&&this._trainer61Vermilion?.attacker===u&&this._trainer61Vermilion.serial===this.turnSerial&&this._trainer61Vermilion.result===true)dmg+=10;if(dmg&&p.mistyBoostSerial===this.turnSerial&&c.name?.startsWith("Misty's "))dmg+=20;
 if(dmg&&this.trainer60ApplyCharity)dmg=this.trainer60ApplyCharity(u,dmg);
 if(dmg){f.active.lastAttacker=u;f.active.lastAttackerPlayer=p;f.active.lastAttackerTurn=this.round;f.active.damage+=dmg;if(p.kogaPoisonSerial===this.turnSerial&&c.name?.startsWith("Koga's ") )f.active.poison=true;if(f.active.damage>=this.maxHP(f.active)&&(f.active.endureUntil>=this.round&&f.active.endureUntil>0||f.active.endureCoinUntil>=this.round&&f.active.endureCoinUntil>0&&coin('Armor Up — survive Knock Out')))f.active.damage=this.maxHP(f.active)-10;
 // Machamp: Strikes Back deals 10 damage to the attacker when damaged by an attack while Active.
 if(this.card(f.active)?.abilities?.some(a=>a.name==='Strikes Back')&&!['Asleep','Confused','Paralyzed'].includes(f.active.status)&&!this.continuousPower('Toxic Gas')){u.damage+=10;this.log(`${this.card(f.active).name}'s Strikes Back placed 1 damage counter on ${c.name}.`)}
 if(this.unitHasPower(f.active,'Fluffy Wool')&&coin('Fluffy Wool'))u.status='Asleep';
 if(this.printedPower(f.active,'Restless Sleep',true)&&f.active.status==='Asleep')u.damage+=20;
 if(this.printedPower(f.active,'Pollen Defense',true)&&coin('Pollen Defense'))u.status='Confused';
 if(this.unitHasPower(f.active,'Energy Drain')&&u.energies.length&&coin('Energy Drain')){
  // Energy Drain is the *defender's Pokémon Power*, not an Energy cost paid
  // by the attacking player. Thus Ecogym returns eligible discarded Energy
  // to the attacker's hand and Brock's Protection forbids removal entirely.
  const protectedEnergy=(u.attachedTrainers||[]).some(tool=>lookup.get(tool.id)?.name==="Brock's Protection");
  if(protectedEnergy)this.log("Brock's Protection stopped Energy Drain.");
  else{
   const removed=u.energies.pop();
   const ecogym=lookup.get(this.stadium?.id)?.name==='Ecogym';
   if(ecogym&&energyType(removed)!=='Colorless'&&lookup.get(removed)?.name!=='Double Colorless Energy'){
    p.hand.push(removed);this.log('Ecogym returned Energy discarded by Energy Drain to its owner.');
   }else p.discard.push(removed);
  }
 }
 if(this.printedPower(f.active,'Shock Blast',true)&&!coin('Shock Blast')){u.damage+=20;f.active.damage+=20;}
 }}
 const effectsBlocked=(f.active.nonDamageEffectsUntil>=this.round&&f.active.nonDamageEffectsUntil>0)||f.active.preventAttackEffects||this.unitHasPower(f.active,'Crystal Body')||(this.unitHasPower(f.active,'Neutral Shield')&&(u.under||[]).length),statusBlocked=effectsBlocked||f.active.statusImmunityUntil>=this.round;
 if(pattern==='batch51'&&batch51Kind(c,a)==='char'&&!effectsBlocked&&!f.active.charCounter&&coin('Char — place Char counter'))f.active.charCounter=true;
 if(pendingStatus==='Poisoned'){if(!statusBlocked&&!this.unitHasPower(f.active,'Thick Skinned'))f.active.poison=true;pendingStatus=null;}
 if(pattern==='batch54'){batch54Apply(this,batch54Kind(c,a),this.batch54Ready);this.pending54=null;this.batch54Ready=null;}
 if(pattern==='batch55'){batch55After(this,batch55Kind(c,a),this.batch55Ready,a,u,p,f);this.batch55Ready=null;this.pending55=null;}
 if(batch53)batch53After(this,batch53.kind,batch53.choice,a,u,p,f);
 if(batch47)batch47Resolve(this,batch47.rule,batch47.selection,a,u,p,f,effectsBlocked);
 if(batch48)batch48.after(dmg,effectsBlocked);
 if(batch49)batch49.after(dmg,effectsBlocked);
 if(batch43?.after)batch43.after(dmg,effectsBlocked);if(batch44?.after)batch44.after(dmg,effectsBlocked);if(batch45?.after)batch45.after(dmg,effectsBlocked);if(batch46?.after)batch46.after(dmg,effectsBlocked);
 if(pendingStatus&&!statusBlocked)f.active.status=pendingStatus;
 if(pattern==='coinParalyzeBenchSpread'&&coin(a.name+' — combined effect')){if(!effectsBlocked)f.active.status='Paralyzed';if(!this.unitHasPower(f.active,'Aurora Veil')&&!(f.active.benchShieldUntil>0&&f.active.benchShieldUntil>=this.round)){const hit=Number(t.match(/does (\d+) damage to each/i)?.[1]||0);for(const v of f.bench)v.damage+=hit}}
 let status=['status','coinStatus'].includes(pattern)&&t.match(/(?:If heads, )?(?:the )?Defending Pokémon is now (Asleep|Confused|Paralyzed|Poisoned)/i);if(status&&!statusBlocked&&(pattern!=='coinStatus'||coin(a.name+' — status effect'))&&!(this.card(f.active)?.abilities?.some(a=>a.name==='Thick Skinned')&&!['Asleep','Confused','Paralyzed'].includes(f.active.status)&&!this.continuousPower('Toxic Gas'))){if(status[1]==='Poisoned')f.active.poison=true;else f.active.status=status[1];this.log(`${this.card(f.active).name} became ${status[1]}.`)}
 if(!effectsBlocked){if(pattern==='paralyzeOrFail')f.active.status='Paralyzed';
 if(pattern==='severePoison'){f.active.poison=true;f.active.poisonDamage=Number(t.match(/takes (\d+) Poison/i)?.[1]||20)}
 if(pattern==='coinDoubleStatus'&&coin(a.name+' — status effect')){const s=t.match(/now (Confused|Paralyzed) and Poisoned/i)?.[1];f.active.status=s;f.active.poison=true}
 if(pattern==='poisonOrParalyze'){if(coin(a.name+' — status effect'))f.active.poison=true;else f.active.status='Paralyzed'}
 if(pattern==='paralyzeOrSleep')f.active.status=coin(a.name+' — status effect')?'Paralyzed':'Asleep';
 if(pattern==='confuseOrSleep')f.active.status=coin(a.name+' — status effect')?'Confused':'Asleep';}
 if(!effectsBlocked&&pattern==='poisonOrConfuse'){if(coin(a.name+' — status effect'))f.active.poison=true;else f.active.status='Confused'}
 if(!effectsBlocked&&pattern==='bothConfused'){f.active.status='Confused';u.status='Confused'}
 if(pattern==='coinSelfConfuse'&&!coin(a.name+' — confusion'))u.status='Confused'
 if(pattern==='megaDrain'&&dmg>0)u.damage=Math.max(0,u.damage-Math.ceil(dmg/20)*10);
 if(pattern==='massExplosion'){for(const v of [p.active,...p.bench,f.active,...f.bench])if(v&&/^(Koffing|Weezing|Dark Weezing)$/.test(this.card(v)?.name||''))v.damage+=20;this.log('Mass Explosion deals 20 unmodified damage to each Koffing, Weezing and Dark Weezing in play.')}
 if(pattern==='coinHeal'&&coin(a.name+' — healing'))u.damage=Math.max(0,u.damage-10)
 if(pattern==='coinHealMany'&&coin(a.name+' — healing'))u.damage=Math.max(0,u.damage-10*Number(t.match(/remove (\d+) damage/i)?.[1]||0))
 if(pattern==='multiHealAll'){const flips=Number(t.match(/Flip (\d+)/i)?.[1]||0);let heads=0;for(let n=0;n<flips;n++)if(coin(a.name+' — heal '+(n+1)))heads++;for(const v of [p.active,...p.bench])if(v)v.damage=Math.max(0,v.damage-heads*10)}
 if(pattern==='twoCoinsStatus'&&(coin(a.name+' — flip 1')||coin(a.name+' — flip 2'))&&!effectsBlocked)f.active.status='Confused'
 if(pattern==='selfDamageBonusConfuse'&&!coin(a.name+' — confusion'))u.status='Confused'
 if(pattern==='paralyzeOrRecoil'){if(coin(a.name+' — status')){if(!effectsBlocked)f.active.status='Paralyzed'}else u.damage+=Number(t.match(/does (\d+) damage to itself/i)?.[1]||0)}
 if(pattern==='coinChoiceStatus'&&coin(a.name+' — status')&&!effectsBlocked)f.active.status='Asleep'
 if(pattern==='selfSleepCoinSleep'){u.status='Asleep';if(coin(a.name+' — sleep')&&!effectsBlocked)f.active.status='Asleep'}
 if(pattern==='wakeDefender'&&f.active.status==='Asleep')f.active.status=null
 if(pattern==='selfSleep')u.status='Asleep'
 if(pattern==='selfConfuse')u.status='Confused'
 if(pattern==='sleepPoison'&&!effectsBlocked){f.active.status='Asleep';f.active.poison=true}
 if(pattern==='bothAsleep'){u.status='Asleep';if(!effectsBlocked)f.active.status='Asleep'}
 if(pattern==='coinBurn'&&coin(a.name+' — burn')&&!effectsBlocked)f.active.burn=true
 if(pattern==='benchShield')u.benchShieldUntil=this.round+1
 if(pattern==='healAllFriendly')for(const v of [p.active,...p.bench])if(v)v.damage=Math.max(0,v.damage-10)
 if(pattern==='coinRecoverBoth'&&coin(a.name+' — recovery')&&!this.continuousPower('Allergic Pollen')){for(const side of [f,p])if(side.discard.length)side.hand.push(side.discard.pop())}
 if(pattern==='drawSelfSwitch'){if(!p.bench.length)return false;this.draw(p);const slot=Number.isInteger(benchTarget)&&benchTarget>=0&&benchTarget<p.bench.length?benchTarget:0;[p.active,p.bench[slot]]=[p.bench[slot],p.active]}
 if(pattern==='coinShuffleSelf'&&!coin(a.name+' — stay')){p.deck=shuffle([...p.deck,u.id,...u.under,...u.energies]);p.active=p.bench.shift()||null}
 let self=['recoil','coinRecoil'].includes(pattern)&&t.match(/does (\d+) damage to itself/i);if(self&&(pattern!=='coinRecoil'||!coin(a.name+' — recoil')))u.damage+=+self[1];if(doubleRecoil){const recoil=Number(t.match(/does (\d+) damage to itself/i)?.[1]||0);u.damage+=recoil}
 const waivedCost=copyOverride&&['metronome','sketch'].includes(copyOverride.mode);
 const discard=!waivedCost&&['discardAll','discardSome'].includes(pattern)&&t.match(/Discard (all|\d+) (?:Fire )?Energy cards? attached/i);
 if(discard){
  const n=discard[1]==='all'?u.energies.length:+discard[1];
  if(typedFirePayment){
   const chosen=fireDiscardIndices().slice(0,n);
   for(const i of chosen.sort((a,b)=>b-a))p.discard.push(u.energies.splice(i,1)[0]);
  }else p.discard.push(...u.energies.splice(0,n));
 }
 if(pattern==='discardOneRequired'&&!waivedCost){
  const i=typedFirePayment?fireDiscardIndices()[0]:u.energies.length-1;
  p.discard.push(u.energies.splice(i,1)[0]);
 }
 if(pattern==='heal'){const count=/\b(?:2|two)\b/i.test(t)?2:1;u.damage=Math.max(0,u.damage-count*10);this.log(`${c.name} healed ${count*10} damage.`)}
 if(pattern==='drainDamage'){const half=/equal to half/i.test(t);u.damage=Math.max(0,u.damage-(half?Math.ceil(dmg/20)*10:dmg))}
 if(pattern==='leechSeed'&&dmg>0)u.damage=Math.max(0,u.damage-10*Number(t.match(/remove (\d+) damage counter/i)?.[1]||1))
 if(pattern==='poisonBenchSpread'){if(!effectsBlocked)f.active.poison=true;if(!this.unitHasPower(f.active,'Aurora Veil')){const hit=Number(t.match(/does (\d+) damage to each/i)?.[1]||0);for(const v of f.bench)v.damage+=hit}}
 if(['forceSwitch','forceSwitchAfterDamage','coinForceSwitchAfterDamage','coinForceSwitch','recoilForceSwitch','rapidSpin','coinAllOpponentSwitch'].includes(pattern)&&f.bench.length&&(!['coinForceSwitchAfterDamage','coinForceSwitch'].includes(pattern)||coin(a.name+' — switch'))){const slot=Number.isInteger(benchTarget)&&benchTarget>=0&&benchTarget<f.bench.length?benchTarget:0;[f.active,f.bench[slot]]=[f.bench[slot],f.active];f.bench[slot].status=null;f.bench[slot].poison=false;f.bench[slot].burn=false}
 if(pattern==='rapidSpin'&&p.bench.length){const slot=0;[p.active,p.bench[slot]]=[p.bench[slot],p.active];p.bench[slot].status=null;p.bench[slot].poison=false;p.bench[slot].burn=false}
 if(pattern==='selfSwitch'&&p.bench.length){const slot=Number.isInteger(benchTarget)&&benchTarget>=0&&benchTarget<p.bench.length?benchTarget:0;[p.active,p.bench[slot]]=[p.bench[slot],p.active];p.bench[slot].status=null;p.bench[slot].poison=false;p.bench[slot].burn=false}
 if(pattern==='bounceDefender'&&f.active.damage<this.maxHP(f.active)){const bounced=f.active;f.hand.push(bounced.id,...bounced.under,...bounced.energies);f.active=f.bench.shift()||null}
 if(c.id==='neo3-11'&&a.name==='Night Eyes'){f.active.lastNightEyesRound=this.round;f.active.lastNightEyesBy=this.turn;}
 if(this._trainer61Vermilion?.attacker===u&&this._trainer61Vermilion.serial===this.turnSerial&&this._trainer61Vermilion.result===false){u.damage+=10;this.log('Vermilion City Gym: Tails — attacking Pokémon takes 10 damage.');}
 u.lastAttackName=a.name;u.lastAttackRound=this.round;
 // Store the *final* amount of attack damage actually taken for Mirror Move.
 if(attackTargetAtStart===f.active){f.active.incomingAttack={turnSerial:this.turnSerial,damage:Math.max(0,f.active.damage-damageBeforeAttack),status:f.active.status!==previousStatus?f.active.status:null,poison:!previousPoison&&f.active.poison};}
 this.lastAttackAction={turnSerial:this.turnSerial,player:this.turn,attacker:u,cardId:copyOverride?.attack?(cards.find(x=>x.attacks?.includes(a))?.id||c.id):c.id,index:copyOverride?.attack?(cards.find(x=>x.attacks?.includes(a))?.attacks.indexOf(a)??i):i,defendingTeam:defendingTeamAtStart};
 this.log(`${p.name}: ${c.name} used ${a.name} (${dmg} damage).`);render();battlefieldAttack(this.turn,-1,a.name,dmg);this.resolveKO();if(!this.over&&!deferTurnEnd)this.end();render();return true}
 resolveKO(){for(const side of this.players){const v=side.active;if(v?.immunityConditionUntilBenched){v.status=null;v.poison=false;}}for(let i=0;i<2;i++){let p=this.players[i],foe=this.players[1-i];
 for(let j=p.bench.length-1;j>=0;j--){let v=p.bench[j];if(v.damage>=this.maxHP(v)){
 this.log(`${this.card(v).name} was Knocked Out on the Bench!`);discardUnit(p,v);p.bench.splice(j,1);if(this.card(v)?.name!=='Mysterious Fossil'&&foe.prizes.length){foe.hand.push(foe.prizes.pop());queuePrizeFX(1-i);}}}
if(p.active&&p.active.damage>=this.maxHP(p.active)){const knocked=p.active,card=this.card(knocked);if(this.unitHasPower(knocked,'Fortitude')&&coin('Fortitude')){knocked.damage=Math.max(0,this.maxHP(knocked)-10);this.log(`${card.name} survived with 10 HP due to Fortitude.`);continue}const focus=(knocked.attachedTrainers||[]).find(x=>lookup.get(x.id)?.name==='Focus Band');
 if(focus){knocked.attachedTrainers.splice(knocked.attachedTrainers.indexOf(focus),1);p.discard.push(focus.id);if(coin('Focus Band')){knocked.damage=Math.max(0,this.maxHP(knocked)-10);this.log('Focus Band prevents the Knock Out.');continue;}}
 if(this.unitHasPower(knocked,'Time Travel')&&coin('Time Travel')){p.deck=shuffle([...p.deck,knocked.id,...knocked.under,...knocked.energies]);p.active=p.bench.shift()||null;this.log(`${card.name} escaped the Knock Out with Time Travel.`);continue}this.log(`${card.name} was Knocked Out!`);if(this.unitHasPower(knocked,'Final Beam')&&coin('Final Beam')&&knocked.lastAttacker){const count=knocked.energies.filter(id=>lookup.get(id)?.name==='Water Energy').length;knocked.lastAttacker.damage+=20*count}const rebirth=this.unitHasPower(knocked,'Rebirth');discardUnit(p,knocked);p.active=null;if(rebirth){const j=p.discard.lastIndexOf(knocked.id);if(j>=0)p.hand.push(p.discard.splice(j,1)[0])}if(card.name!=='Mysterious Fossil'&&foe.prizes.length){foe.hand.push(foe.prizes.pop());queuePrizeFX(1-i);}if(p.bench.length)p.active=p.bench.shift();}}this.check()}
 between(){for(const side of this.players)if(side.active?.immunityConditionUntilBenched){side.active.status=null;side.active.poison=false;}for(const side of this.players){for(const v of [side.active,...side.bench])if(v?.charCounter&&!coin('Char counter — '+this.card(v).name))v.damage+=20;}for(let i=0;i<2;i++){let p=this.players[i],u=p.active;if(!u)continue;if(u.poison)u.damage+=u.poisonDamage||10;if(u.burn&&coin('Burn check'))u.damage+=20;if(u.status==='Asleep'){if(this.continuousPower('Deep Sleep')){if(coin('Deep Sleep check 1')&&coin('Deep Sleep check 2'))u.status=null}else if(coin('Sleep recovery'))u.status=null}if(u.status==='Paralyzed'&&i===this.turn)u.status=null;}if(this.runTrainerBetweenTriggers)this.runTrainerBetweenTriggers();this.resolveKO()}
 end(){if(this.phase!=='game'||this.over)return;this.copyCoinCache=null;this.pendingAttack51=null;this.pending53=null;this.pending54=null;for(const side of this.players)for(const v of side.bench){v.shadowImages=false;v.giantGrowth=false;}this.pendingSweetScent=null;this.between();for(let si=0;si<this.players.length;si++){const owner=this.players[si];for(const pokemon of [owner.active,...owner.bench])if(pokemon?.attachedTrainers){
  const expired=pokemon.attachedTrainers.filter(x=>x.expireAtEndSerial!==null&&x.expireAtEndSerial!==undefined&&x.expireAtEndSerial<=this.turnSerial);
  owner.discard.push(...expired.map(x=>x.id));pokemon.attachedTrainers=pokemon.attachedTrainers.filter(x=>!expired.includes(x));
 }}if(this.over){render();return}for(const protectedUnit of [this.foe.active,...this.foe.bench])if(protectedUnit){protectedUnit.attackShield=0;protectedUnit.preventAttackEffects=false;protectedUnit.halfShield=false;protectedUnit.preventBelow=0;protectedUnit.damageBoost=0;protectedUnit.damageBoostUntil=0;}this.turn=1-this.turn;this.turnSerial++;if(this.turn===0)this.round++;for(const participant of this.players){for(const pok of [participant.active,...participant.bench])if(pok){pok.burnEnergyTurn=-1;if(pok.typeChangeEndSerial<=this.turnSerial)delete pok.coloringType;pok.powerUses={};}}let p=this.me;p.energyUsed=false;p.retreated=false;p.turnPlays=[];if(!this.draw(p))this.check();this.log(`Turn ${this.round} — ${p.name}.`);render();if(this.turn===1&&!this.over){const generation=matchGeneration;setTimeout(()=>void cpu(generation),420)}}
 retreat(idx){if(this.phase!=='game'||this.card(this.me.active)?.name==='Mysterious Fossil')return false;let p=this.me,u=p.active;if(p.retreated||!p.bench[idx]||!u||u.status==='Asleep'||u.status==='Paralyzed'||(u.cantRetreatUntil>0&&u.cantRetreatUntil>=this.round)||(u.cantRetreatUntilSerial>this.turnSerial)||(u.switchLockUntil>=this.round&&u.switchLockUntil>0)||(u.persistentRetreatSource&&this.foe.active===u.persistentRetreatSource&&u.persistentRetreatSourceId===this.foe.active?.id))return false;let cost=(this.card(u).retreatCost||[]).length;const stadium58=lookup.get(this.stadium?.id)?.name;if(stadium58==='The Rocket\'s Training Gym')cost++;if(stadium58==='Broken Ground Gym'&&(basic(this.card(u))||(this.card(u)?.subtypes||[]).includes('Baby')))cost++;if(stadium58==='Cerulean City Gym'&&this.card(u)?.name.startsWith("Misty's ") )cost=Math.max(0,cost-1);if(u.extraRetreatCostUntilSerial>this.turnSerial)cost+=u.extraRetreatCost||0;if(this.powerSources('Retreat Aid').length)cost=Math.max(0,cost-this.powerSources('Retreat Aid').length);const balloonBerry=(u.attachedTrainers||[]).find(x=>lookup.get(x.id)?.name==='Balloon Berry');if(balloonBerry)cost=0;if(u.energies.length<cost)return false;if(u.pursuitUntil>=this.round&&u.pursuitSource===this.foe.active){u.damage+=10;this.resolveKO();if(this.over||this.me.active!==u)return false}p.discard.push(...u.energies.splice(0,cost));[p.active,p.bench[idx]]=[p.bench[idx],p.active];const lostGiantGrowth=Boolean(p.bench[idx].giantGrowth);p.bench[idx].shadowImages=false;p.bench[idx].giantGrowth=false;p.bench[idx].status=null;p.bench[idx].poison=false;p.bench[idx].burn=false;p.bench[idx].attackShield=0;if(balloonBerry){const oldUnit=p.bench[idx];oldUnit.attachedTrainers.splice(oldUnit.attachedTrainers.indexOf(balloonBerry),1);p.discard.push(balloonBerry.id);}p.retreated=true;this.log(`${p.name} retreated.`);if(lostGiantGrowth)this.resolveKO();render();return true}
 trainer(i,benchTarget=null){let p=this.me,c=lookup.get(p.hand[i]),n=c?.name||'';if(this.phase!=='game'||!trainer(c)||this.over)return false;if([this.foe.active,...this.foe.bench].some(u=>this.unitHasPower(u,'Mind Games'))&&coin('Mind Games')){p.deck.push(p.hand.splice(i,1)[0]);this.log('Mind Games returned the Trainer card to the top of the deck.');render();return true}if(p.trainerLockUntil>0&&p.trainerLockUntil>=this.round){this.log('A lingering effect prevents Trainer cards this turn.');render();return false}if(this.continuousPower('Hay Fever')){this.log('Hay Fever prevents Trainer cards from being played.');render();return false}const drawCount={'Bill':2,'Professor Oak':7,'Erika':3,'Mary':3};if(n in drawCount){p.hand.splice(i,1);p.discard.push(c.id);if(n==='Professor Oak'){p.discard.push(...p.hand);p.hand=[]}this.draw(p,drawCount[n]);this.log(`${p.name} played ${n}.`);render();return true}
 if(['Defender','PlusPower','Focus Band','Berry','Gold Berry'].includes(n)){
  const u=n==='PlusPower'?p.active:benchTarget===-1?p.active:p.bench[benchTarget];
  if(!u)return false;
  if(['Focus Band','Berry','Gold Berry'].includes(n)&&(u.attachedTrainers||[]).some(x=>['Focus Band','Berry','Gold Berry'].includes(lookup.get(x.id)?.name)))return false;
  if(!u.attachedTrainers)u.attachedTrainers=[];
  const id=p.hand.splice(i,1)[0];u.attachedTrainers.push({id,expireAtEndSerial:n==='PlusPower'?this.turnSerial:n==='Defender'?this.turnSerial+1:null});
  this.log(`${p.name} attached ${n} to ${this.card(u).name}.`);render();return true;
 }
  if((c.subtypes||[]).includes('Stadium')||/^This card stays in play when you play it\./i.test((c.rules||[]).join(' '))){
  if(this.stadium)this.discardStadium();this.stadium={id:p.hand.splice(i,1)[0],owner:this.turn};
  this.log(`${p.name} played Stadium ${n}.`);render();return true;
 }
 if(n==='Potion'||n==='Super Potion'){let u=benchTarget===-1?p.active:p.bench[benchTarget];if(!u||u.damage<10||(n==='Super Potion'&&!u.energies.length))return false;if(n==='Super Potion')p.discard.push(u.energies.pop());u.damage=Math.max(0,u.damage-(n==='Potion'?20:40));p.discard.push(p.hand.splice(i,1)[0]);this.log(`${p.name} used ${n}.`);render();return true}
 if(n==='Switch'&&p.bench.length&&Number.isInteger(benchTarget)&&benchTarget>=0&&benchTarget<p.bench.length){p.discard.push(p.hand.splice(i,1)[0]);[p.active,p.bench[benchTarget]]=[p.bench[benchTarget],p.active];const lostGiantGrowth=Boolean(p.bench[benchTarget].giantGrowth);p.bench[benchTarget].shadowImages=false;p.bench[benchTarget].giantGrowth=false;p.bench[benchTarget].status=null;p.bench[benchTarget].poison=false;p.bench[benchTarget].burn=false;p.bench[benchTarget].attackShield=0;this.log(`${p.name} switched to ${this.card(p.active).name}.`);if(lostGiantGrowth)this.resolveKO();render();return true}
 if(n==='Gust of Wind'&&this.foe.bench.length&&Number.isInteger(benchTarget)&&benchTarget>=0&&benchTarget<this.foe.bench.length){p.discard.push(p.hand.splice(i,1)[0]);[this.foe.active,this.foe.bench[benchTarget]]=[this.foe.bench[benchTarget],this.foe.active];const lostGiantGrowth=Boolean(this.foe.bench[benchTarget].giantGrowth);this.foe.bench[benchTarget].shadowImages=false;this.foe.bench[benchTarget].giantGrowth=false;this.foe.bench[benchTarget].status=null;this.foe.bench[benchTarget].poison=false;this.foe.bench[benchTarget].burn=false;this.foe.bench[benchTarget].attackShield=0;this.log(`${p.name} used Gust of Wind to bring out ${this.card(this.foe.active).name}.`);if(lostGiantGrowth)this.resolveKO();render();return true}
 if(n==='Energy Removal'){let u=benchTarget===-1?this.foe.active:this.foe.bench[benchTarget];if(!u?.energies.length)return false;p.discard.push(p.hand.splice(i,1)[0]);this.foe.discard.push(u.energies.pop());this.log(`${p.name} played Energy Removal.`);render();return true}
 this.log(`${n} requires an effect script; it was not played.`);render();return false}
}

// v0.5.6: reusable power actions. Choices are validated against the current
// live game state; invalid choices never spend the activation.
const POWER_BATCH_56 = new Set([
 'Pollen Stench','Playful Punch','Observe','Cunning','Special Delivery',
 'Fragrance Trap','[Search]','[Help]','[Join]','[Find]','[Give]','[Want]','[Yield]',
 '[Bear]','Peek','Shift','Submerge','Energy Charge',
 'Electromagnetic Power','Soak Up','Glaring Gaze','Fossil', 'Revive Friends',
 'Emerge','Spatial Distortion','Gaze','Energy Converter','Undo','Drive Off','[Quicken]'
]);
function power56All(p){return [p.active,...p.bench].filter(Boolean)}
function power56Options(game,predicate){return (game.me.deck||[]).map((id,index)=>({index,id,card:lookup.get(id)})).filter(x=>predicate(x.card,x))}
function power56Unowns(game,word){return word.split('').every(letter=>game.me.bench.some(u=>game.card(u)?.name===`Unown [${letter}]`));}
function power56Pick(game,name,options,callback,choice){
 if(choice===null&&game.turn===0&&options.length){
  deckSearchRequest={label:`${name}: choose a card or Pokémon.`,options:options.map(x=>({index:x.index,id:x.id,name:x.name})),execute:j=>game.power56(name,j)};
  render();return null;
 }
 if(choice===null)choice=options[0]?.index;
 if(!options.some(x=>x.index===choice))return false;
 return callback(choice);
}
Engine.prototype.power56=function(name,choice=null){
 const p=this.me,opp=this.foe,source=this.powerSources(name).find(u=>['Energy Charge','Electromagnetic Power'].includes(name)||name==='Soak Up'?(u.powerUses?.[name]||0)<2:!u.powerUses?.[name]);
 if(!POWER_BATCH_56.has(name)||!source||this.phase!=='game'||this.over)return false;
 const me=power56All(p),others=power56All(opp),slot=(i)=>i===-1?p.active:p.bench[i],
  opts=(list,desc)=>list.map((u,i)=>({index:i-1,name:`${desc}: ${this.card(u)?.name}`})),
  selected=(items,act)=>power56Pick(this,name,items,act,choice),
  finish=(message)=>{source.powerUses[name]=['Energy Charge','Electromagnetic Power'].includes(name)?0:name==='Soak Up'?(source.powerUses[name]||0)+1:true;deckSearchRequest=null;this.log(message||`${this.card(source).name} used ${name}.`);this.resolveKO();render();return true;},
  deckFind=(filter,dest='hand',max=1)=>{
    let avail=power56Options(this,filter);if(!avail.length){p.deck=shuffle(p.deck);return finish(name+' found no eligible cards.');}
    return selected(avail.map(x=>({...x,name:x.card.name})),j=>{const id=p.deck.splice(j,1)[0];if(dest==='bench')p.bench.push(unit(id));else if(dest==='energy')slot(-1).energies.push(id);else p.hand.push(id);p.deck=shuffle(p.deck);return finish();});
  };
 switch(name){
  case 'Cunning':{
   const options=[{index:0,name:'Keep top card'},{index:1,name:'Shuffle opponent deck'}];
   return selected(options,j=>{this.log(`Cunning saw ${lookup.get(opp.deck.at(-1))?.name||'empty deck'}.`);if(j===1)opp.deck=shuffle(opp.deck);return finish();});
  }
  case 'Pollen Stench':return this.pollenStench();
  case 'Playful Punch':return this.playfulPunch();
  case 'Observe':return this.observe();
  
  case 'Fragrance Trap':{
   if(!opp.bench.length)return false;
   // A coin is rolled before the choice. A canceled picker cannot reroll it.
   if(source.power56Coin===undefined)source.power56Coin=coin('Fragrance Trap');
   if(!source.power56Coin){delete source.power56Coin;return finish('Fragrance Trap failed.');}
   return selected(opp.bench.map((u,i)=>({index:i,name:this.card(u).name})),j=>{
    [opp.active,opp.bench[j]]=[opp.bench[j],opp.active];delete source.power56Coin;return finish();
   });
  }
  case 'Special Delivery':{
   // Draw first, then request a specific card to put on top of the deck.
   if(!source.power56Drawn){if(!p.deck.length)return false;this.draw(p);source.power56Drawn=true;}
   return selected(p.hand.map((id,index)=>({index,name:lookup.get(id)?.name||id})),j=>{
    p.deck.push(p.hand.splice(j,1)[0]);delete source.power56Drawn;return finish();
   });
  }
  case '[Search]':{
   if(!p.prizes.length)return false;
   return selected(p.prizes.map((id,index)=>({index,name:`Prize #${index+1}`})),j=>{
    this.log(`Unown [S] looked at Prize #${j+1}: ${lookup.get(p.prizes[j])?.name}.`);return finish();
   });
  }
  case 'Peek':{
   const choices=[{index:0,name:'Top of your deck'},{index:1,name:'Top of opponent deck'},{index:2,name:'Random opponent hand'},...p.prizes.map((_,i)=>({index:100+i,name:`Your Prize #${i+1}`})),...opp.prizes.map((_,i)=>({index:200+i,name:`Opposing Prize #${i+1}`}))];
   return selected(choices,j=>{const id=j===0?p.deck.at(-1):j===1?opp.deck.at(-1):j===2?opp.hand[Math.floor(Math.random()*opp.hand.length)]:j>=200?opp.prizes[j-200]:p.prizes[j-100];this.log(`Peek saw ${lookup.get(id)?.name||'(none)'}.`);return finish();});
  }
  case 'Shift':{
   const types=[...new Set([...me,...others].filter(v=>v!==source).flatMap(v=>this.card(v)?.types||[]))].filter(x=>x!=='Colorless');
   if(!types.length)return false;
   return selected(types.map((name,index)=>({index,name})),j=>{source.coloringType=types[j];source.typeChangeEndSerial=this.turnSerial+1;return finish(`Shift changed Venomoth to ${types[j]}.`);});
  }
  case 'Submerge':source.coloringType='Water';source.typeChangeEndSerial=this.turnSerial+1;return finish('Submerge changed Lanturn to Water for this turn.');
  case 'Energy Charge':{
   if(p.active!==source)return false;
   const from=me.filter(u=>u!==source);
   const options=from.flatMap((u,j)=>u.energies.map((id,k)=>({index:j*100+k,name:`${this.card(u).name} — ${lookup.get(id)?.name}`})).filter(x=>x.name.endsWith('Lightning Energy')));
   return selected(options,j=>{const donor=from[Math.floor(j/100)],id=donor.energies.splice(j%100,1)[0];source.energies.push(id);return finish('Energy Charge moved Lightning Energy.');});
  }
  case 'Soak Up':{
   const sources=me.filter(u=>u!==source);
   const options=sources.flatMap((u,j)=>u.energies.map((id,k)=>({index:j*100+k,name:`${this.card(u).name} — ${lookup.get(id)?.name}`})).filter(x=>x.name.endsWith('Grass Energy')));
   return selected(options,j=>{const donor=sources[Math.floor(j/100)],id=donor.energies.splice(j%100,1)[0];source.energies.push(id);return finish('Soak Up moved Grass Energy.');});
  }
  case 'Electromagnetic Power':{
   const valid=u=>/^(Dark )?(Magnemite|Magneton)$/.test(this.card(u)?.name||'');
   const units=me.filter(valid);
   const options=units.flatMap((u,i)=>u.energies.flatMap((id,k)=>units.filter(v=>v!==u).map((v,j)=>({index:i*10000+k*100+units.indexOf(v),name:`${this.card(u).name} → ${this.card(v).name}: ${lookup.get(id)?.name}`}))));
   return selected(options,j=>{const from=units[Math.floor(j/10000)],to=units[j%100],k=Math.floor(j/100)%100;if(!from?.energies[k]||!to||to===from)return false;to.energies.push(from.energies.splice(k,1)[0]);return finish('Electromagnetic Power moved an Energy.');});
  }
  case 'Glaring Gaze':{
   if(source.power56Coin===undefined)source.power56Coin=coin('Glaring Gaze');
   if(!source.power56Coin){delete source.power56Coin;return finish('Glaring Gaze failed.');}
   let options=opp.hand.map((id,index)=>({index,name:lookup.get(id)?.name})).filter(x=>trainer(lookup.get(opp.hand[x.index])));
   if(!options.length){delete source.power56Coin;return finish('Glaring Gaze found no Trainer.');}
   return selected(options,j=>{opp.deck=shuffle([...opp.deck,opp.hand.splice(j,1)[0]]);delete source.power56Coin;return finish();});
  }
  case 'Emerge':{
   source.powerUses[name]=true;const heads=coin('Emerge');if(!heads)return finish('Emerge failed.');
   let candidate=p.deck.findIndex(id=>lookup.get(id)?.name==="Koga's Beedrill");
   if(candidate<0){p.deck=shuffle(p.deck);return finish('Emerge found no Koga’s Beedrill.');}
   source.under=[source.id,...source.under];source.id=p.deck.splice(candidate,1)[0];source.status=null;source.poison=false;source.playedTurn=this.round;p.deck=shuffle(p.deck);return finish();
  }
  case 'Revive Friends':case 'Fossil':case 'Revive Fossil':{
   if(p.bench.length>=5)return false;
   const heads=coin(name);source.powerUses[name]=true;if(!heads)return finish(`${name} failed.`);
   const predicate=name==='Revive Friends'?(c=>c?.name==='Kabuto'):(c=>c?.evolvesFrom==='Mysterious Fossil'||(c?.subtypes||[]).includes('Stage 1')&&['Kabuto','Omanyte','Aerodactyl'].includes(c?.name));
   const options=power56Options(this,predicate);
   if(!options.length){p.deck=shuffle(p.deck);return finish(`${name} found no eligible card.`);}
   return selected(options.map(x=>({...x,name:x.card.name})),j=>{const v=unit(p.deck.splice(j,1)[0]);v.fossilAsBasic=true;p.bench.push(v);p.deck=shuffle(p.deck);return finish();});
  }
  case 'Spatial Distortion':{
   if(source.power56Coin===undefined)source.power56Coin=coin('Spatial Distortion');
   if(!source.power56Coin){delete source.power56Coin;return finish('Spatial Distortion failed.');}
   const options=p.discard.map((id,index)=>({index,name:lookup.get(id)?.name||id})).filter(x=>(lookup.get(p.discard[x.index])?.subtypes||[]).includes('Stadium'));
   if(!options.length){delete source.power56Coin;return finish('No Stadium in discard.');}
   return selected(options,j=>{if(this.stadium)this.discardStadium();this.stadium={id:p.discard.splice(j,1)[0],owner:this.turn};delete source.power56Coin;return finish();});
  }

  case 'Gaze':{
   const candidates=opp.bench.map((u,index)=>({index,name:this.card(u)?.name})).filter(x=>this.card(opp.bench[x.index])?.abilities?.length);
   if(!candidates.length)return false;
   return selected(candidates,j=>{opp.bench[j].powerSilencedUntilSerial=this.turnSerial+1;opp.bench[j].gazeSilenced=true;return finish();});
  }
  case 'Energy Converter':{
   const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
   const cards=me.flatMap((u,j)=>u.energies.map((id,k)=>({source:u,slot:j,energyIndex:k,id})).filter(x=>energy(lookup.get(x.id))&&!(lookup.get(x.id)?.subtypes||[]).includes('Special')));
   const options=cards.flatMap((it,k)=>types.map((type,j)=>({index:k*types.length+j,name:`${this.card(it.source).name}: ${lookup.get(it.id)?.name} → ${type}`})));
   return selected(options,j=>{const e=cards[Math.floor(j/types.length)];if(!e||!e.source.energies[e.energyIndex])return false;
    e.source.power56EnergyOverrides??={};e.source.power56EnergyOverrides[e.energyIndex]={type:types[j%types.length],until:this.turnSerial+1,provider:source};return finish();});
  }
  case 'Undo':{
   if(!power56Unowns(this,'UNDO')||!p.active||p.active===source)return false;
   const u=p.active;p.hand.push(u.id,...u.under,...u.energies,...(u.attachedTrainers||[]).map(x=>x.id));p.active=p.bench.shift()||null;return finish();
  }
  case '[Help]':{
   if(!power56Unowns(this,'HELP'))return false;
   const n=p.hand.length;p.deck=shuffle([...p.deck,...p.hand]);p.hand=[];this.draw(p,n);return finish();
  }
  case '[Join]':case '[Find]':{
   const word=name==='[Join]'?'JOIN':'FIND';if(!power56Unowns(this,word))return false;
   return deckFind(c=>name==='[Find]'?trainer(c):c?.supertype==='Pokémon');
  }
  case '[Give]':{
   if(!power56Unowns(this,'GIVE'))return false;
   if(!source.power56CoinChecked){source.power56CoinChecked=true;source.power56Coin=coin('[Give]');}
   if(!source.power56Coin){delete source.power56CoinChecked;return finish('[Give] failed.');}
   let options=power56Options(this,c=>energy(c)&&!(c.subtypes||[]).includes('Special'));
   return selected(options.map(x=>({...x,name:x.card.name})),j=>{
    const target=power56All(p)[0];if(!target)return false;target.energies.push(p.deck.splice(j,1)[0]);p.deck=shuffle(p.deck);delete source.power56CoinChecked;return finish();});
  }
  case '[Want]':{
   if(!power56Unowns(this,'WANT'))return false;
   if(source.power56Coin===undefined)source.power56Coin=coin('[Want]');
   if(!source.power56Coin){delete source.power56Coin;return finish('[Want] failed.');}
   const opts=p.discard.map((id,index)=>({index,name:lookup.get(id)?.name||id})).filter(x=>trainer(lookup.get(p.discard[x.index])));
   if(!opts.length){delete source.power56Coin;return finish('[Want] found no Trainer.');}
   return selected(opts,j=>{p.hand.push(p.discard.splice(j,1)[0]);delete source.power56Coin;return finish();});
  }
  case '[Yield]':{
   if(source.power56Coin===undefined)source.power56Coin=coin('[Yield]');
   if(!source.power56Coin){delete source.power56Coin;return finish('[Yield] failed.');}
   const options=power56Options(this,c=>c?.name==='Psychic Energy');
   if(!options.length){delete source.power56Coin;return finish('No Psychic Energy.');}
   return selected(options.map(x=>({...x,name:x.card.name})),j=>{
    const target=me.find(u=>this.card(u)?.name.startsWith('Unown '));if(!target)return false;
    target.energies.push(p.deck.splice(j,1)[0]);p.deck=shuffle(p.deck);delete source.power56Coin;return finish();});
  }
  case 'Drive Off':{
   if(p.active!==source||!opp.bench.length)return false;
   // Opponent chooses its replacement, even when the active player is the CPU.
   const move=j=>{if(!Number.isInteger(j)||j<0||j>=opp.bench.length)return false;
    const old=opp.active;[opp.active,opp.bench[j]]=[opp.bench[j],opp.active];
    if(old){old.status=null;old.poison=false;old.burn=false;}
    deckSearchRequest=null;source.powerUses[name]=true;this.log('Drive Off forced a defending-player switch.');
    power56Switch(this,1-this.turn,old);render();return true;};
   if(this.turn===1){
    deckSearchRequest={label:'Drive Off: choose YOUR Benched Pokémon to become Active',defenderPrompt:true,
     options:opp.bench.map((u,index)=>({index,name:this.card(u)?.name})),execute:j=>{const ok=move(j);if(ok&&cpuResumeChoice){const done=cpuResumeChoice;cpuResumeChoice=null;done(true);}return ok;}};
    render();return null;
   }
   return move(opp.bench.length-1); // CPU defending selects its replacement.
  }
  case '[Quicken]':{
   if(p.quickenUsedSerial===this.turnSerial)return false;
   const heads=coin('[Quicken]');source.powerUses[name]=true;p.quickenUsedSerial=this.turnSerial;
   if(heads){for(const unown of me.filter(v=>this.card(v)?.name?.startsWith('Unown ')))unown.unownQuickenUntil=this.turnSerial+2;}
   this.log('[Quicken]: '+(heads?'all your Unown are protected during the next opponent turn.':'Tails.'));
   render();return true;
  }
  case '[Bear]':{
   const donors=me.filter(u=>u!==source&&this.card(u)?.name.startsWith('Unown ')&&u.damage>=10);
   if(!donors.length||this.maxHP(source)-source.damage<=10)return false;
   return selected(donors.map((u,i)=>({index:i,name:this.card(u).name})),j=>{donors[j].damage-=10;source.damage+=10;return finish();});
  }
  default:return false;
 }
};


// v0.5.6 event-driven Powers. Only registered effects below are counted by audit.
function power56OnEnter(game,newcomer){
 const p=game.me,opp=game.foe,c=game.card(newcomer),abilities=new Set((c?.abilities||[]).map(a=>a.name));
 if(game.continuousPower('Toxic Gas'))return;
 const optionsEnemy=()=>[opp.active,...opp.bench].filter(Boolean).map((u,index)=>({index,name:game.card(u)?.name}));
 const askEnemy=(name,amount,wr)=>{
  const options=optionsEnemy();if(!options.length)return;
  const apply=j=>{const u=[opp.active,...opp.bench][j];if(!u)return false;u.damage+=wr?calculateDamage(amount,c,game.card(u)):amount;deckSearchRequest=null;game.log(`${c.name}'s ${name} dealt ${amount} damage to ${game.card(u).name}.`);game.resolveKO();render();return true};
  if(game.turn===0){deckSearchRequest={label:`${name}: choose an opposing Pokémon.`,options,execute:apply};}
  else apply(0);
 };
 if(abilities.has('[Vanish]')&&coin('[Vanish]')){
  const options=[p.active,...p.bench].filter(v=>v&&v!==newcomer&&game.card(v)?.name.startsWith('Unown ')).map((v,index)=>({index,name:game.card(v).name}));
  const returnCard=j=>{const t=[p.active,...p.bench].filter(v=>v&&v!==newcomer&&game.card(v)?.name.startsWith('Unown '))[j];if(!t)return false;
   p.hand.push(t.id);p.discard.push(...t.under,...t.energies,...(t.attachedTrainers||[]).map(x=>x.id));if(p.active===t)p.active=p.bench.shift()||null;else p.bench.splice(p.bench.indexOf(t),1);deckSearchRequest=null;render();return true;};
  if(game.turn===0&&options.length)deckSearchRequest={label:'[Vanish]: return another Unown to hand',options,execute:returnCard};else if(options.length)returnCard(0);
 }
 if(abilities.has('[Increase]')&&p.bench.length<5){
  const options=p.deck.map((id,index)=>({index,name:lookup.get(id)?.name||id})).filter(x=>/Unown/i.test(lookup.get(p.deck[x.index])?.name||'')&&basic(lookup.get(p.deck[x.index])));
  const take=j=>{if(!options.some(x=>x.index===j)||p.bench.length>=5)return false;
   const id=p.deck.splice(j,1)[0];p.bench.push(unit(id));p.deck=shuffle(p.deck);deckSearchRequest=null;
   game.log(`[Increase] put ${lookup.get(id).name} onto the Bench.`);render();return true;};
  if(options.length){if(game.turn===0)deckSearchRequest={label:'[Increase]: optionally choose an Unown to Bench',options,execute:take};else take(options[0].index);}
  else p.deck=shuffle(p.deck);
 }
 if(abilities.has('Tag Team')&&p.bench.includes(newcomer)&&p.active){
  const old=p.active;old.damage=Math.max(0,old.damage-30);const j=p.bench.indexOf(newcomer);
  [p.active,p.bench[j]]=[p.bench[j],p.active];p.bench[j].status=null;p.bench[j].poison=false;p.bench[j].burn=false;
  game.log('Light Machamp used Tag Team: healed 30 from Active and switched in.');
 }
 if(abilities.has('[Engage]')){
  const otherFirst=()=>{
   const chosen=j=>{if(j!==0&&j!==1)return false;
    if(j===1){const n=p.hand.length;p.deck=shuffle([...p.deck,...p.hand]);p.hand=[];game.draw(p,4);game.log(`[Engage]: ${p.name} shuffled ${n} cards and drew 4.`);}
    deckSearchRequest=null;render();return true;};
   if(game.turn===0)deckSearchRequest={label:'[Engage]: do you want to shuffle your hand into deck and draw 4?',options:[{index:0,name:'Decline'},{index:1,name:'Draw 4'}],execute:chosen};
   else chosen(1);
  };
  const decide=j=>{if(j!==0&&j!==1)return false;
   if(j===1){const n=opp.hand.length;opp.deck=shuffle([...opp.deck,...opp.hand]);opp.hand=[];game.draw(opp,4);game.log(`[Engage]: ${opp.name} shuffled ${n} cards and drew 4.`);}
   otherFirst();render();return true;};
  if(game.turn===1)deckSearchRequest={label:'Opponent played Unown E — [Engage]: redraw your hand?',defenderPrompt:true,options:[{index:0,name:'Keep my hand'},{index:1,name:'Shuffle and draw 4'}],execute:j=>{const ok=decide(j);if(ok&&cpuResumeChoice){const resume=cpuResumeChoice;cpuResumeChoice=null;resume(true);}return ok;}};
  else decide(1); // CPU opponent chooses to redraw (strategic policy remains basic).
 }
 if(abilities.has('Gift')){
  // The defending player searches first; afterward the owner has the same option.
  const tool=id=>(lookup.get(id)?.supertype==='Trainer')&&(lookup.get(id)?.rules||[]).some(line=>/Pok[eé]mon Tool/i.test(line));
  const ownSearch=()=>{
   const opts=p.deck.map((id,index)=>({index,name:lookup.get(id)?.name})).filter(x=>tool(p.deck[x.index]));
   const take=j=>{if(j!==-1&&!opts.some(x=>x.index===j))return false;
    if(j!==-1){p.hand.push(p.deck.splice(j,1)[0]);p.deck=shuffle(p.deck);game.log('Gift found a Pokémon Tool for '+p.name+'.');}
    deckSearchRequest=null;render();return true;};
   if(game.turn===0&&opts.length)deckSearchRequest={label:'Gift: optionally take a Pokémon Tool from your deck',options:[{index:-1,name:'Skip search'},...opts],execute:take};
   else if(opts.length)take(opts[0].index);
  };
  const oppOpts=opp.deck.map((id,index)=>({index,name:lookup.get(id)?.name})).filter(x=>tool(opp.deck[x.index]));
  const takeOpponent=j=>{if(j!==-1&&!oppOpts.some(x=>x.index===j))return false;
   if(j!==-1){opp.hand.push(opp.deck.splice(j,1)[0]);opp.deck=shuffle(opp.deck);game.log('Gift found a Pokémon Tool for '+opp.name+'.');}
   deckSearchRequest=null;ownSearch();render();return true;};
  if(game.turn===1&&oppOpts.length)deckSearchRequest={label:'Gift: optionally take a Pokémon Tool from your deck',defenderPrompt:true,options:[{index:-1,name:'Skip search'},...oppOpts],execute:j=>{const ok=takeOpponent(j);if(ok&&cpuResumeChoice){const resume=cpuResumeChoice;cpuResumeChoice=null;resume(true);}return ok;}};
  else takeOpponent(oppOpts.length?oppOpts[0].index:-1);
 }
 if(abilities.has('Howl')){
  // Entei's Howl is optional; invoking it must finish the turn after all five
  // revealed cards are resolved. Energy attachments are genuine player choices.
  const finishTurn=()=>{deckSearchRequest=null;game.log('Entei used Howl and ended its turn.');game.end();render();return true;};
  const startHowl=()=>{
   const flipped=[];for(let j=0;j<5&&p.deck.length;j++)flipped.push(p.deck.pop());
   const flames=flipped.filter(id=>lookup.get(id)?.name==='Fire Energy');
   p.discard.push(...flipped.filter(id=>lookup.get(id)?.name!=='Fire Energy'));
   const attachNext=()=>{
    if(!flames.length)return finishTurn();
    const firePokemon=[p.active,...p.bench].filter(u=>u&&game.card(u)?.types?.includes('Fire'));
    if(!firePokemon.length){p.discard.push(...flames);return finishTurn();}
    const attach=j=>{if(!Number.isInteger(j)||j<0||j>=firePokemon.length)return false;
     const id=flames.shift();firePokemon[j].energies.push(id);
     game.log('Howl attached Fire Energy to '+game.card(firePokemon[j]).name+'.');
     deckSearchRequest=null;attachNext();render();return true;};
    if(game.turn===0)deckSearchRequest={label:`Howl: attach a Fire Energy (${flames.length} remaining)`,options:firePokemon.map((u,index)=>({index,name:game.card(u)?.name})),execute:attach};
    else attach(firePokemon.indexOf(newcomer)>=0?firePokemon.indexOf(newcomer):0);
   };
   attachNext();render();return true;
  };
  const decide=j=>{if(j===0){deckSearchRequest=null;render();return true;}if(j!==1)return false;deckSearchRequest=null;return startHowl();};
  if(game.turn===0)deckSearchRequest={label:'Entei: use Howl? (Ends your turn)',options:[{index:0,name:'Do not use Howl'},{index:1,name:'Use Howl and end turn'}],execute:decide};
  else decide(p.deck.slice(-5).some(id=>lookup.get(id)?.name==='Fire Energy')?1:0);
 }
 if(abilities.has('Sneak Attack'))askEnemy('Sneak Attack',10,true);
 if(abilities.has('Surprise Bite'))askEnemy('Surprise Bite',20,false);
 if(abilities.has('Reel In')){
  const opts=p.discard.map((id,index)=>({index,name:lookup.get(id)?.name||id})).filter(x=>lookup.get(p.discard[x.index])?.supertype==='Pokémon');
  const take=indices=>{if(!Array.isArray(indices)||indices.length>3||new Set(indices).size!==indices.length||indices.some(j=>!opts.some(x=>x.index===j)))return false;
   for(const j of [...indices].sort((a,b)=>b-a))p.hand.push(p.discard.splice(j,1)[0]);deckSearchRequest=null;game.log('Reel In returned '+indices.length+' Pokémon.');render();return true;};
  if(opts.length){if(game.turn===0)deckSearchRequest={label:'Reel In: select up to 3 Pokémon from discard',options:opts,multi:true,min:0,max:Math.min(3,opts.length),selected:[],execute:take};else take(opts.slice(0,3).map(x=>x.index));}
 }
 if(abilities.has('Summon Minions')){
  const opts=p.deck.map((id,index)=>({index,name:lookup.get(id)?.name||id})).filter(x=>basic(lookup.get(p.deck[x.index])));
  const take=indices=>{if(!Array.isArray(indices)||indices.length>2||new Set(indices).size!==indices.length||indices.some(j=>!opts.some(x=>x.index===j)))return false;
   for(const j of [...indices].sort((a,b)=>b-a))if(p.bench.length<5)p.bench.push(unit(p.deck.splice(j,1)[0]));p.deck=shuffle(p.deck);deckSearchRequest=null;game.log('Summon Minions filled the Bench.');render();return true;};
  if(p.bench.length<5){if(game.turn===0&&opts.length)deckSearchRequest={label:'Summon Minions: choose up to 2 Basic Pokémon',options:opts,multi:true,min:0,max:Math.min(2,5-p.bench.length,opts.length),selected:[],execute:take};else take(opts.slice(0,Math.min(2,5-p.bench.length)).map(x=>x.index));}
 }
}
const originalEvolve56=Engine.prototype.onPlayEvolution;
Engine.prototype.onPlayEvolution=function(u,c){originalEvolve56.call(this,u,c);power56OnEnter(this,u);
 const p=this.me,eevees=[p.active,...p.bench].filter(v=>v&&v!==u&&this.unitHasPower(v,'Chain Reaction'));
 const opts=p.deck.map((id,index)=>({index,name:lookup.get(id)?.name||id})).filter(x=>lookup.get(p.deck[x.index])?.evolvesFrom==='Eevee');
 if(!eevees.length||!opts.length)return;
 const evolve=j=>{if(!opts.some(x=>x.index===j))return false;const eevee=eevees[0];eevee.under=[eevee.id,...eevee.under];eevee.id=p.deck.splice(j,1)[0];eevee.playedTurn=this.round;eevee.status=null;eevee.poison=false;p.deck=shuffle(p.deck);deckSearchRequest=null;this.log('Chain Reaction evolved Eevee.');render();return true;};
 if(this.turn===0)deckSearchRequest={label:'Chain Reaction: choose an Eevee evolution',options:opts,execute:evolve};else evolve(opts[0].index);
};
const originalPlayBasic56=Engine.prototype.playBasic;
Engine.prototype.playBasic=function(i,bench){const p=this.me,before=p.bench.length;const result=originalPlayBasic56.call(this,i,bench);if(result&&p.bench.length>before)power56OnEnter(this,p.bench.at(-1));return result;};
function power56Switch(game,side,previous){
 const p=game.players[side],incoming=p.active;if(!incoming||incoming===previous)return;if(incoming.gazeSilenced){incoming.gazeSilenced=false;incoming.powerSilencedUntilSerial=0;}
 if(previous){
  if(game.unitHasPower(previous,'Magma Pool')){
   const j=previous.energies.findIndex(id=>lookup.get(id)?.name==='Fire Energy');if(j>=0)incoming.energies.push(previous.energies.splice(j,1)[0]);
  }
 }
 const adversary=game.players[1-side];
 let damaged=false;
 if(game.turn===1-side)for(const guard of [adversary.active,...adversary.bench].filter(Boolean)){
  if(game.unitHasPower(guard,'Spikes')){incoming.damage+=10;damaged=true;game.log(`Spikes dealt 10 damage to ${game.card(incoming).name}.`);}
 }
 if(damaged)game.resolveKO();
}
const originalAttach56=Engine.prototype.attach;
Engine.prototype.attach=function(i,slot){const p=this.me,target=slot===-1?p.active:p.bench[slot],energyId=p.hand[i];const result=originalAttach56.call(this,i,slot);
 if(result&&target&&this.printedPower(target,'Lightning Burst')&&lookup.get(energyId)?.name==='Lightning Energy'&&this.foe.bench.length){
  const rival=this.foe;
  const exchange=j=>{if(!Number.isInteger(j)||j<0||j>=rival.bench.length)return false;
   const previous=rival.active;[rival.active,rival.bench[j]]=[rival.bench[j],rival.active];
   if(previous){previous.status=null;previous.poison=false;previous.burn=false;}
   deckSearchRequest=null;this.log('Lightning Burst forced the Defending Pokémon to switch.');power56Switch(this,1-this.turn,previous);render();return true;};
  if(this.turn===1){deckSearchRequest={label:'Lightning Burst: choose YOUR replacement Active Pokémon',defenderPrompt:true,options:rival.bench.map((u,index)=>({index,name:this.card(u)?.name})),execute:j=>{const ok=exchange(j);if(ok&&cpuResumeChoice){const done=cpuResumeChoice;cpuResumeChoice=null;done(true);}return ok;}};render();}
  else exchange(0); // CPU chooses its own replacement.
 }
 if(!result||!target||!this.unitHasPower(target,'Energy Evolution')||!coin('Energy Evolution'))return result;
 const type=lookup.get(energyId)?.name?.replace(' Energy','');
 const options=p.deck.map((id,index)=>({index,name:lookup.get(id)?.name||id})).filter(x=>lookup.get(p.deck[x.index])?.evolvesFrom==='Eevee'&&lookup.get(p.deck[x.index])?.types?.includes(type));
 const evolvePick=j=>{if(!options.some(x=>x.index===j))return false;target.under=[target.id,...target.under];target.id=p.deck.splice(j,1)[0];target.playedTurn=this.round;target.status=null;target.poison=false;p.deck=shuffle(p.deck);deckSearchRequest=null;this.log('Energy Evolution evolved Eevee.');render();return true;};
 if(options.length){if(this.turn===0)deckSearchRequest={label:'Energy Evolution: choose an Eevee evolution',options,execute:evolvePick};else evolvePick(options[0].index);}else p.deck=shuffle(p.deck);render();return result;
};
const originalRetreat56=Engine.prototype.retreat;
Engine.prototype.retreat=function(idx){const side=this.turn,p=this.me,old=p.active;
 const result=originalRetreat56.call(this,idx);if(!result)return false;
 if(old&&this.players[1-side]&&[this.players[1-side].active,...this.players[1-side].bench].some(u=>this.unitHasPower(u,'Sinkhole'))){
  if(!coin('Dark Dugtrio — Sinkhole')){old.damage+=20;this.log('Sinkhole dealt 20 damage to the retreated Pokémon.');this.resolveKO();}
 }
const defenderSide=this.players[1-side];for(const watcher of [defenderSide.active,...defenderSide.bench].filter(Boolean)){
  if(defenderSide.active===watcher&&this.unitHasPower(watcher,'[Chase]')&&coin('[Chase]')){
   old.damage+=calculateDamage(10,this.card(watcher),this.card(old));this.log('[Chase] damaged the retreating Pokémon.');this.resolveKO();
  }
 }
 power56Switch(this,side,old);render();return true;
};
const originalTrainer56=Engine.prototype.trainer;
Engine.prototype.trainer=function(i,benchTarget){const old0=this.players[0]?.active,old1=this.players[1]?.active;const result=originalTrainer56.call(this,i,benchTarget);if(result){for(let side=0;side<2;side++)power56Switch(this,side,side===0?old0:old1);}return result;};
const originalResolveKO56=Engine.prototype.resolveKO;
Engine.prototype.resolveKO=function(){
 for(const side of this.players){
  for(const u of [side.active,...side.bench].filter(Boolean))if(this.unitHasPower(u,'Scram')&&this.maxHP(u)-u.damage===10){
   side.deck=shuffle([...side.deck,u.id,...u.under,...u.energies,...(u.attachedTrainers||[]).map(x=>x.id)]);
   if(side.active===u)side.active=side.bench.shift()||null;else side.bench.splice(side.bench.indexOf(u),1);
   this.log("Brock's Primeape escaped using Scram.");
  }
 }
 return originalResolveKO56.call(this);
};
const originalAttack56=Engine.prototype.attack;
Engine.prototype.attack=function(i,benchTarget,defer,choice,copyOverride){
 const u=this.me.active,a=this.card(u)?.attacks?.[i];
 if(u&&this.unitHasPower(u,'Rebellion')&&a){
  // Both tails: attack does nothing and Gyarados is returned to its owner's deck.
  if(this.phase==='game'&&this.afford(u,a.cost)&&!['Asleep','Paralyzed'].includes(u.status)&&(()=>{const first=coin('Rebellion 1'),second=coin('Rebellion 2');return !first&&!second;})()){
   const p=this.me;p.deck=shuffle([...p.deck,u.id,...u.under,...u.energies,...(u.attachedTrainers||[]).map(x=>x.id)]);p.active=p.bench.shift()||null;
   this.log(`Rebellion: ${this.card(u)?.name||'Misty’s Gyarados'} shuffled away instead of attacking.`);
   this.resolveKO();if(!this.over&&!defer)this.end();render();return true;
  }
 }
 const defendingSide=1-this.turn,defender=this.players[defendingSide]?.active;
 const bolt=defender&&this.unitHasPower(defender,'Bolt'),before=defender?.damage;
 const resolved=originalAttack56.call(this,i,benchTarget,defer,choice,copyOverride);
 if(resolved&&bolt&&this.players[defendingSide]?.active===defender&&defender.damage>before&&defender.damage<this.maxHP(defender)&&coin('Bolt')){
  const side=this.players[defendingSide];side.deck=shuffle([...side.deck,defender.id,...defender.under,...defender.energies,...(defender.attachedTrainers||[]).map(x=>x.id)]);
  side.active=side.bench.shift()||null;this.log('Bolt shuffled Entei and attachments into the deck.');this.check();render();
 }
 return resolved;
};


// v0.5.7: the eight remaining Power names (nine printings). These hooks use
// the actual attached-card state and interact with the established duel UI.
const POWER57_TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
Engine.prototype.buzzap=function(slot,choice=null){
 const p=this.me,foe=this.foe,source=slot===-1?p.active:p.bench[slot];
 if(this.phase!=='game'||this.over||!source||!this.powerSources('Buzzap').includes(source))return false;
 const dest=[{slot:-1,u:p.active},...p.bench.map((u,j)=>({slot:j,u}))].filter(x=>x.u&&x.u!==source);
 if(!dest.length)return false;
 const options=dest.flatMap(x=>POWER57_TYPES.map((type,t)=>({index:(x.slot+1)*8+t,name:`${type} ×2 → ${this.card(x.u).name} (${x.slot===-1?'Active':'Bench '+(x.slot+1)})`})));
 if(choice===null&&this.turn===0){deckSearchRequest={label:'Buzzap: choose the receiving Pokémon and Energy type. Electrode is Knocked Out and opponent takes a Prize.',options,execute:j=>this.buzzap(slot,j)};render();return null;}
 const index=choice===null?options[0]?.index:choice,pick=options.find(x=>x.index===index);if(!pick)return false;
 const dstSlot=Math.floor(index/8)-1,type=POWER57_TYPES[index%8],recipient=dstSlot===-1?p.active:p.bench[dstSlot];
 if(!recipient||recipient===source)return false;
 const energyId=`__buzzap:${type}:${source.id}`;
 lookup.set(energyId,{id:energyId,name:`${type} Energy`,supertype:'Energy',subtypes:['Special'],buzzapSource:source.id});
 recipient.energies.push(energyId);
 p.discard.push(...(source.under||[]),...(source.energies||[]),...(source.attachedTrainers||[]).map(x=>x.id));
 if(slot===-1)p.active=p.bench.shift()||null;else p.bench.splice(slot,1);
 if(foe.prizes.length){foe.hand.push(foe.prizes.pop());queuePrizeFX(1-this.turn)}
 deckSearchRequest=null;this.log(`${p.name} used Buzzap: Electrode became two ${type} Energy on ${this.card(recipient)?.name||'a Pokémon'}; rival took a Prize.`);
 this.check();render();return true;
};
Engine.prototype.shapeshift=function(slot,handIndex=null,remove=false){
 const p=this.me,source=slot===-1?p.active:p.bench[slot];
 if(this.phase!=='game'||this.over||!source||source.id!=='gym2-3'||!this.powerSources('Shapeshift').includes(source))return false;
 if(remove){if(!source.shapeshiftCardId)return false;p.discard.push(source.shapeshiftCardId);delete source.shapeshiftCardId;deckSearchRequest=null;this.log("Brock's Ninetales removed its Shapeshift Evolution card.");this.resolveKO();render();return true;}
 if(source.shapeshiftCardId||source.shapeshiftAttachedSerial===this.turnSerial)return false;
 const options=p.hand.map((id,index)=>({index,name:lookup.get(id)?.name||id})).filter(x=>(lookup.get(p.hand[x.index])?.subtypes||[]).some(s=>/^Stage [12]$/.test(s)));
 if(!options.length)return false;
 if(handIndex===null&&this.turn===0){deckSearchRequest={label:"Shapeshift: choose an Evolution from your hand to attach to Brock's Ninetales",options,execute:j=>this.shapeshift(slot,j)};render();return null;}
 const chosen=handIndex===null?options[0].index:handIndex;if(!options.some(x=>x.index===chosen))return false;
 source.shapeshiftCardId=p.hand.splice(chosen,1)[0];source.shapeshiftAttachedSerial=this.turnSerial;
 deckSearchRequest=null;this.log(`Shapeshift: Brock's Ninetales is treated as ${lookup.get(source.shapeshiftCardId).name}.`);
 this.resolveKO();render();return true;
};
// Benching/Poisoning Ninetales' disguise card is checked before KO and at
// turn transitions; copied Evolution cards are never part of its evolution stack.
Engine.prototype.cleanShapeshifts=function(){
 for(const p of this.players)for(const u of [p.active,...p.bench])if(u?.shapeshiftCardId&&['Asleep','Confused','Paralyzed'].includes(u.status)){
  p.discard.push(u.shapeshiftCardId);delete u.shapeshiftCardId;
  this.log("Shapeshift ended because Brock's Ninetales received a Special Condition.");
 }
};
Engine.prototype.snapshotDiscardProtection=function(){
 if(!this.continuousPower('Allergic Pollen'))return null;
 return this.players.map(p=>p.discard.slice());
};
Engine.prototype.restoreDiscardProtection=function(){
 const snapshots=this._power57Discards;if(!snapshots)return;
 for(let side=0;side<2;side++){
  const player=this.players[side],original=snapshots[side],current=player.discard;
  const nowCounts=new Map();for(const id of current)nowCounts.set(id,(nowCounts.get(id)||0)+1);
  const missing=[];for(const id of original){const count=nowCounts.get(id)||0;if(count>0)nowCounts.set(id,count-1);else missing.push(id)}
  for(const id of missing){
   // The protected discard card must be removed from the destination first.
   // Ids are repeated in the historical engine, so consume a single copy.
   let found=false;
   for(const p of this.players){
    for(const zone of [p.hand,p.deck,p.prizes]){const i=zone.indexOf(id);if(i>=0){zone.splice(i,1);found=true;break}}
    if(found)break;
    for(const v of [p.active,...p.bench].filter(Boolean)){
     const k=v.energies.indexOf(id);
     if(k>=0){v.energies.splice(k,1);found=true;break}
    }
    if(found)break;
    for(let j=0;j<p.bench.length;j++)if(p.bench[j].id===id){p.bench.splice(j,1);found=true;break}
    if(found)break;
   }
   if(!found&&this.stadium?.id===id){this.stadium=null;found=true}
   player.discard.push(id);
   this.log(`Allergic Pollen kept ${lookup.get(id)?.name||id} in the discard pile.`);
  }
 }
 this._power57Discards=null;
};
Engine.prototype.redirectBenchGuard=function(){
 const snapshot=this._power57DamageBaseline;if(!snapshot)return;
 for(let side=0;side<2;side++){
  const p=this.players[side],benchGuards=p.bench.filter(v=>this.unitHasPower(v,'Bench Guard'));
  if(!benchGuards.length||p.benchGuardAuto===false)continue;
  const rhydon=benchGuards[0];
  for(const [u,before] of snapshot[side]){
   if(u===rhydon||!p.bench.includes(u)||u.damage<=before)continue;
   const redir=Math.min(10,u.damage-before);if(redir<=0)continue;
   u.damage-=redir;rhydon.damage+=redir;
   this.log(`Bench Guard redirected ${redir} damage from ${this.card(u)?.name} to Brock's Rhydon.`);
  }
 }
 this._power57DamageBaseline=null;
};
Engine.prototype.power57RestoreProtected=function(){
 const snapshots=this._power57Protected;if(!snapshots)return;
 for(const {owner,u,damage,energies,status,poison,burn,unownKeep,unownQuicken} of snapshots){
  if(!([owner.active,...owner.bench].includes(u)))continue;
  if(unownKeep){
   const missing=energies.filter((id,i)=>u.energies.filter(x=>x===id).length<energies.slice(0,i+1).filter(x=>x===id).length);
   if(missing.length){u.energies.push(...missing);for(const id of missing){const j=owner.discard.lastIndexOf(id);if(j>=0)owner.discard.splice(j,1);}this.log('[Keep] prevented an opponent from discarding Unown Energy.');}
  }
  if(unownQuicken){u.damage=damage;u.status=status;u.poison=poison;u.burn=burn;
   // Any hostile attack-induced Energy discards are prevented as well.
   for(const id of energies){if(u.energies.includes(id))continue;u.energies.push(id);let j=owner.discard.lastIndexOf(id);if(j>=0)owner.discard.splice(j,1);}
  }
 }
 this._power57Protected=null;
};
// resolveKO is the last safe pre-KO hook shared by attacks and passive effects.
const previousResolveKO57=Engine.prototype.resolveKO;
Engine.prototype.resolveKO=function(){this.redirectBenchGuard();this.power57RestoreProtected();this.restoreDiscardProtection();this.cleanShapeshifts();return previousResolveKO57.call(this)};
const previousAttack57=Engine.prototype.attack;
Engine.prototype.attack=function(i,slot,defer,choice,override){
 const defendingSide=1-this.turn,owner=this.players[defendingSide],defender=owner.active;
 const flee=defender&&this.unitHasPower(defender,'Flee')&&owner.bench.length>0;
 const originalStatus=defender?.status,originalPoison=defender?.poison,originalBurn=defender?.burn,
  originalEnergies=defender?.energies.slice(),originalDamage=defender?.damage||0;
 this._power57Discards=this.snapshotDiscardProtection();
 this._power57DamageBaseline=this.players.map(p=>p.bench.map(u=>[u,u.damage]));
 this._power57Protected=[];
 const guarded=owner&&[owner.active,...owner.bench].filter(Boolean);
 const hasKeep=guarded.some(u=>this.unitHasPower(u,'[Keep]'));
 for(const u of guarded){const power=this.card(u)?.name?.startsWith('Unown ');
  if(!power)continue;
  const protectedUntil=u.unownQuickenUntil>this.turnSerial;
  if((hasKeep&&u.energies.length)||protectedUntil)
   this._power57Protected.push({owner,u,damage:u.damage,energies:u.energies.slice(),status:u.status,poison:u.poison,burn:u.burn,unownKeep:hasKeep,unownQuicken:protectedUntil});
 }
 const result=previousAttack57.call(this,i,slot,defer,choice,override);
 if(!result){this._power57DamageBaseline=null;this._power57Protected=null;this._power57Discards=null;return result;}
 this.restoreDiscardProtection();
 // Only damage (not zero-damage attacks) permits the optional Flee switch.
 if(flee&&owner.active===defender&&defender.damage>originalDamage&&defender.damage<this.maxHP(defender)){
  const options=[{index:-1,name:'Stay Active (do not use Flee)'},...owner.bench.map((u,index)=>({index,name:`Switch with ${this.card(u)?.name}`}))];
  const swap=(j)=>{if(j!==-1&&(!Number.isInteger(j)||j<0||j>=owner.bench.length))return false;
   if(j!==-1){
    // The incoming damage remains; everything else the attack did to the
    // Tentacruel is prevented if Flee is used.
    defender.status=originalStatus;defender.poison=originalPoison;defender.burn=originalBurn;
    defender.energies=originalEnergies.slice();
    [owner.active,owner.bench[j]]=[owner.bench[j],owner.active];
    this.log("Misty's Tentacruel used Flee after taking damage.");
   }
   deckSearchRequest=null;render();if(cpuResumeChoice){const finish=cpuResumeChoice;cpuResumeChoice=null;finish(true);}return true;};
  if(defendingSide===0&&this.turn===1){deckSearchRequest={label:"Flee: Tentacruel took damage. Choose a Bench replacement or stay Active.",defenderPrompt:true,options,execute:swap};render();}
  else swap(options[1]?.index??-1);
 }
 return result;
};
const previousPower57=Engine.prototype.power56;
Engine.prototype.power56=function(name,...rest){
 if(this.continuousPower('Allergic Pollen')&&['Spatial Distortion','[Want]'].includes(name)){
  this.log(`Allergic Pollen prevents ${name} from affecting a discard pile.`);
  render();return false;
 }
 const snapshot=this.snapshotDiscardProtection();
 if(snapshot)this._power57Discards=snapshot;
 const success=previousPower57.call(this,name,...rest);
 if(success!==null)this.restoreDiscardProtection();
 return success;
};
const IMPLEMENTED_POWERS=new Set(['Rain Dance','Energy Trans','Energy Burn','Damage Swap','Strikes Back','Invisible Wall','Thick Skinned','Prehistoric Power','Toxic Gas','Hay Fever','Retreat Aid','Kabuto Armor','Transparency','Heal','Curse','Step In','Strange Behavior','Gaseous Form','Wild Growth','Neutral Shield','Aurora Veil','Guard','Pure Body','Crystal Body','Hard Shell','Shell Armor','Strange Barrier','Relaxing Scent','Conductivity','Healing Fire','Sticky Goo','[Zoom]','Natural Healing','Solar Power','Cowardice','Long Distance Hypnosis','Trickery','[Laugh]','[Tell]','Berserk','Herbal Scent','Fire Boost','Softboiled','Call the Boss','Fortitude','Time Travel','Final Beam','Rebirth','[Metal]','[Normal]','Fluffy Wool','Matter Exchange','Downpour','Gather Fire','Fire Recharge','Evolutionary Light','Photosynthesis','Restless Sleep','Pollen Defense','Energy Drain','Shock Blast','Frog Song','Darkness','Deep Sleep','Scare','Hot Plate','Mind Games','Pollen Stench','Playful Punch','Observe','Cunning','Special Delivery','Fragrance Trap','[Search]','[Help]','[Join]','[Find]','[Give]','[Want]','[Yield]','[Bear]','Peek','Shift','Submerge','Energy Charge','Electromagnetic Power','Soak Up','Glaring Gaze','Fossil','Revive Fossil','Revive Friends','Emerge','Spatial Distortion','Gaze','Energy Converter','Undo','Final Blow','Hydroelectric Power','Frenzy','Anger','Gaze','Energy Converter','Undo','[Chase]','[XXXXX]','[Vanish]','Bolt','Energy Evolution','Chain Reaction','Clairvoyance','Mimic','Psylink','Prehistoric Memory','Transform','Legendary Body','Spikes','Sinkhole','Magma Pool','Scram','Rebellion','Reel In','Summon Minions','Sneak Attack','Surprise Bite','[Increase]','[Perform]','Tag Team','[Engage]','Drive Off','Gift','Lightning Burst','Howl','Buzzap','Shapeshift','Miraculous Wind','Bench Guard','Flee','Allergic Pollen','[Keep]','[Quicken]']);
const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};
function makeDeck(key){let types=TYPES[key],pool=cards.filter(c=>c.supertype==='Pokémon'&&c.hp&&c.attacks?.length&&c.id.startsWith('base1-')&&basic(c)&&types.includes(c.types?.[0])&&c.attacks.some(a=>engine.legalAttack(a)));
 if(pool.length<12)pool=cards.filter(c=>window.NeoClassicFormat.isAllowed(c)&&basic(c)&&types.includes(c.types?.[0])&&c.attacks?.some(a=>engine.legalAttack(a)));
 let deck=[];for(let j=0;j<23;j++)deck.push(pool[j%pool.length]?.id);
 const tnames=['Bill','Potion','Switch','Gust of Wind','Energy Removal'];for(let j=0;j<13;j++){let c=cards.find(x=>x.id.startsWith('base1-')&&x.name===tnames[j%tnames.length]);if(c)deck.push(c.id)}
 for(let j=0;j<24;j++){let c=cards.find(x=>x.id.startsWith('base1-')&&x.supertype==='Energy'&&x.name===types[j%2]+' Energy');if(c)deck.push(c.id)}
 while(deck.length<60){let c=cards.find(x=>x.name==='Water Energy'&&x.id.startsWith('base1-'));deck.push(c.id)}return shuffle(deck.slice(0,60))}
function startMatch(){pendingTrainer=null;selected=null;if(!cards.length)return toast('Load the database first.');theme=$('theme').value;const entry=HISTORIC_THEMES.find(d=>d.key===theme);const deck=entry?(window.AuthenticDecks?.list(entry.key)||reconstructedDeck(entry)):makeDeck(theme);if(!deck)return toast('Could not assemble a playable deck from this set.');const rivalEntry=entry?HISTORIC_THEMES[(HISTORIC_THEMES.indexOf(entry)+1)%HISTORIC_THEMES.length]:null;const rival=rivalEntry?(window.AuthenticDecks?.list(rivalEntry.key)||reconstructedDeck(rivalEntry)):makeDeck(theme==='water'?'fire':theme==='fire'?'grass':'water');try{engine.start(deck,rival||makeDeck('water'));}catch(error){toast(error.message);return;}engine.players[0].isBirthday=!!$('birthdayToggle')?.checked;if(entry)engine.log((window.AuthenticDecks?.list(entry.key)?'Original verified ':'Reconstructed ')+entry.expansion+' / '+entry.name+(window.AuthenticDecks?.list(entry.key)?' — exact retail 60-card list.':' — not the verified retail list.'));render()}
// Historical English theme deck product line-up. The deck recipes below are
// explicitly RECONSTRUCTIONS, not purported original 60-card lists.
const HISTORIC_THEMES=[
 ['base1','Base Set',[['Overgrowth','Grass','Water'],['Zap!','Lightning','Psychic'],['Brushfire','Grass','Fire'],['Blackout','Water','Fighting']]],
 ['base2','Jungle',[['Water Blast','Water','Fighting'],['Power Reserve','Grass','Psychic']]],
 ['base3','Fossil',[['LockDown','Fire','Water'],['BodyGuard','Grass','Fighting']]],
 ['base4','Base Set 2',[['Grass Chopper','Grass','Fighting'],['Hot Water','Fire','Water'],['Lightning Bug','Grass','Lightning'],['Psych Out','Water','Psychic']]],
 ['base5','Team Rocket',[['Devastation','Grass','Water'],['Trouble','Grass','Psychic']]],
 ['gym1','Gym Heroes',[['Brock','Fighting'],['Misty','Water'],['Lt. Surge','Lightning'],['Erika','Grass']]],
 ['gym2','Gym Challenge',[['Sabrina','Psychic'],['Koga','Grass'],['Blaine','Fire'],['Giovanni','Fighting']]],
 ['neo1','Neo Genesis',[['Hotfoot','Grass','Fire'],['Cold Fusion','Water','Lightning']]],
 ['neo2','Neo Discovery',[['BrainWave','Water','Psychic'],['Wallop','Grass','Fighting']]],
 ['neo4','Neo Destiny',[['Light','Water','Fighting'],['Dark','Fire','Psychic']]]
].filter(([set])=>['base1','base2','base3','base5'].includes(set)).flatMap(([set,expansion,decks])=>decks.map(([name,...types])=>({key:`${set}:${name}`,set,expansion,name,types})));
function reconstructedDeck(entry){
 const pool=cards.filter(c=>window.NeoClassicFormat.isAllowed(c)&&c.supertype==='Pokémon'&&basic(c)&&c.attacks?.some(a=>engine.legalAttack(a))&&entry.types.includes(c.types?.[0])&&c.id.startsWith(entry.set+'-'));
 const fallback=cards.filter(c=>basic(c)&&c.attacks?.some(a=>engine.legalAttack(a))&&entry.types.includes(c.types?.[0])&&c.id.startsWith('base1-'));
 const playable=[...pool,...fallback.filter(c=>!pool.some(v=>v.id===c.id))];
 if(!playable.length)return null;
 const deck=[];const count=new Map();
 const add=id=>{const card=lookup.get(id);if(!card||(count.get(card.name)||0)>=4)return false;deck.push(id);count.set(card.name,(count.get(card.name)||0)+1);return true};
 // Keep a broad selection of playable Basics, with a maximum of four copies.
 for(let i=0;i<24;i++){let c=playable[Math.floor(i/3)%playable.length];if(!add(c.id)){let next=playable.find(x=>(count.get(x.name)||0)<4);if(next)add(next.id)}}
 const tnames=['Bill','Potion','Switch','Gust of Wind','Energy Removal'];
 for(let i=0;i<12;i++){const c=cards.find(x=>x.id.startsWith('base1-')&&x.name===tnames[i%tnames.length]);if(c)add(c.id)}
 for(let i=0;i<24;i++){let type=entry.types[i%entry.types.length];let c=cards.find(x=>x.supertype==='Energy'&&x.name===type+' Energy'&&x.id.startsWith('base1-'));if(c)deck.push(c.id)}
 let j=0;while(deck.length<60&&j++<100){let type=entry.types[j%entry.types.length];let c=cards.find(x=>x.supertype==='Energy'&&x.name===type+' Energy');if(c)deck.push(c.id)}
 return deck.length===60?shuffle(deck):null;
}
function fillThemeChoices(){const select=$('theme');select.innerHTML='<optgroup label="Classic prototype decks"><option value="water">Water / Lightning (prototype)</option><option value="fire">Fire / Fighting (prototype)</option><option value="grass">Grass / Psychic (prototype)</option></optgroup>';
 for(const group of [...new Set(HISTORIC_THEMES.map(d=>d.expansion))]){let opt=document.createElement('optgroup');opt.label=group+(HISTORIC_THEMES.filter(d=>d.expansion===group).every(d=>window.AuthenticDecks?.list(d.key))?' — original verified':' — authentic where marked ★');for(const d of HISTORIC_THEMES.filter(t=>t.expansion===group)){let o=document.createElement('option');o.value=d.key;o.textContent=d.name+' · '+d.types.join('/')+(window.AuthenticDecks?.list(d.key)?' ★ Original':' ◇ Reconstructed');opt.append(o)}select.append(opt)}
}
const ENERGY_ICON={Grass:'🌿',Fire:'🔥',Water:'💧',Lightning:'⚡',Psychic:'🔮',Fighting:'✊',Colorless:'◇',Darkness:'🌑',Metal:'⚙️',Rainbow:'🌈'};
function energyType(id){let c=lookup.get(id);if(!c)return 'Colorless';let n=c.name||'';return n.endsWith(' Energy')?n.slice(0,-7):n.replace(/ Energy$/,'')}
function unitHTML(u,isActive=false){
 if(!u)return '<div class="muted">None</div>';
 let c=engine.card(u),hp=engine.maxHP(u),statuses=[];
 if(u.poison)statuses.push(['☠','Poisoned','poison']);
 if(u.charCounter)statuses.push(['🔥','Char counter — flip after every turn','burn']);
 if(u.burn)statuses.push(['🔥','Burned','burn']);
 if(u.lightningRodMarker)statuses.push(['⚡','Lightning Rod marker','shield']);
 if(u.weaknessOverride)statuses.push(['🎯',`Weakness changed to ${u.weaknessOverride}`,'shield']);
 if(u.resistanceOverride)statuses.push(['🛡️',`Resistance changed to ${u.resistanceOverride}`,'shield']);
 if(u.lockOnUntil>=engine.round&&u.lockOnUntil>0)statuses.push(['🎯','Lock-on: next Electric Bolt against original target succeeds','shield']);
 if(u.unownQuickenUntil>engine.turnSerial)statuses.push(['🛡️','[Quicken]: Unown immune to opponent attacks next turn','shield']);
 if(u.shapeshiftCardId)statuses.push(['🦊','Shapeshift: '+(lookup.get(u.shapeshiftCardId)?.name||'Evolution'),'shield']);
 if(u.shadowImages)statuses.push(['🌫️','Shadow Images: coin flip prevents damage until this Pokémon takes damage','shield']);
 if(u.giantGrowth)statuses.push(['⬆️','Giant Growth: 80 maximum HP; Pound deals 30','shield']);
 if(u.counterEffect?.expires>engine.turnSerial)statuses.push(['↩️',`${u.counterEffect.name}: counters attack damage next turn`,'shield']);
 if(u.halfShield)statuses.push(['🛡️','Halves incoming attack damage','shield']);
 if(u.attackShield)statuses.push(['🛡️',`-${u.attackShield} incoming attack damage until rival turn ends`,'shield']);
 if(u.immunityConditionUntilBenched)statuses.push(['✨','Flash Touch: immune to new Special Conditions while Active','shield']);
 if(u.coloringType)statuses.push(['🎨',`Paint changed its type to ${u.coloringType}`,'shield']);
 for(const x of u.attachedTrainers||[]){const t=lookup.get(x.id);statuses.push(['📎',`Attached: ${t?.name||x.id}`,'shield']);}
 if(u.status){let status={Asleep:['💤','Asleep','asleep'],Paralyzed:['⚡','Paralyzed','paralyzed'],Confused:['🌀','Confused','confused']}[u.status];if(status)statuses.push(status)}
 const iconHTML=u.energies.map(id=>{let type=energyType(id);return `<span class="energy-badge" title="${esc(lookup.get(id)?.name||type)}">${ENERGY_ICON[type]||'✦'}</span>`}).join('');
 return `<div class="tile field-pokemon ${isActive?'active':''}" data-poke="${esc(u.id)}">${short(c)}${statuses.length?`<div class="status-badges">${statuses.map(([symbol,label,cls])=>`<span class="status-badge ${cls}" title="${label}">${symbol}</span>`).join('')}</div>`:''}<div class="stats">HP ${Math.max(0,hp-u.damage)}/${hp}${u.damage?' · '+u.damage+' dmg':''}</div><div class="energy-row" title="Attached Energy">${iconHTML||'<span class="empty-energy">No Energy</span>'}</div>${u.energies.length?`<div class="energy-stack" aria-label="${u.energies.length} attached Energy cards">${u.energies.slice(0,4).map((id,i)=>`<span class="energy-card-peek" style="--peek:${i}" title="${esc(lookup.get(id)?.name||energyType(id))}">${ENERGY_ICON[energyType(id)]||'✦'}</span>`).join('')}</div>`:''}</div>`
}
function validEnergySelection(p){return selected?.kind==='hand'&&energy(lookup.get(p.hand[selected.i]));}
// Targeting is data-driven: every action declares its side, zone and predicate.
const TARGET_RULES={
 Switch:{side:0,zone:'bench'},'Gust of Wind':{side:1,zone:'bench'},
 'Energy Removal':{side:1,zone:'any',valid:u=>u.energies.length>0},
 Potion:{side:0,zone:'any',valid:u=>u.damage>0},
 'Super Potion':{side:0,zone:'any',valid:u=>u.damage>0&&u.energies.length>0},
 'Stretch Kick':{side:1,zone:'bench'},'Bench attack':{side:1,zone:'bench'},'Rain Dance':{side:0,zone:'any',valid:u=>engine.card(u)?.types?.includes('Water')},'Energy Trans source':{side:0,zone:'any',valid:u=>u.energies.some(id=>lookup.get(id)?.name==='Grass Energy')},'Energy Trans destination':{side:0,zone:'any'},Retreat:{side:0,zone:'bench'}
};
TARGET_RULES['Strange Behavior source']={side:0,valid:u=>u.damage>=10};TARGET_RULES['Strange Behavior destination']={side:0,valid:u=>engine.card(u)?.name==='Slowbro'&&u.damage+10<Number(engine.card(u)?.hp||0)};TARGET_RULES['Curse source']={side:1,valid:u=>u.damage>=10};TARGET_RULES['Curse destination']={side:1,valid:u=>u.damage+10<Number(engine.card(u)?.hp||0)};
TARGET_RULES['Damage Swap source']={side:0,valid:u=>u.damage>=10};TARGET_RULES['Damage Swap destination']={side:0,valid:u=>u.damage+10<Number(engine.card(u)?.hp||0)};
TARGET_RULES['Gather Fire source']={side:0,valid:u=>u.energies.some(id=>lookup.get(id)?.name==='Fire Energy')};
TARGET_RULES['Fire Recharge target']={side:0,valid:u=>engine.card(u)?.types?.includes('Fire')};
TARGET_RULES['Defender']={side:0,zone:'any'};TARGET_RULES['Focus Band']={side:0,zone:'any'};TARGET_RULES['Berry']={side:0,zone:'any'};TARGET_RULES['Gold Berry']={side:0,zone:'any'};
TARGET_RULES['Self switch attack']={side:0,zone:'bench'};
TARGET_RULES['Friendly Bench attack']={side:0,zone:'bench'};
TARGET_RULES['Opponent Pokémon attack']={side:1,zone:'any'};
function optionsFor(rule){const p=engine.players[rule.side];if(!p)return [];return [...(rule.zone==='bench'?[]:[{side:rule.side,slot:-1,u:p.active}]),...p.bench.map((u,i)=>({side:rule.side,slot:i,u}))].filter(x=>x.u&&(!rule.valid||rule.valid(x.u)))}
function requestTarget(name,execute){const rule=TARGET_RULES[name];if(!rule)return false;const opts=optionsFor(rule);if(!opts.length){toast('No valid targets for '+name);return false}targetRequest={name,rule,execute};if(globalThis.NeoTargetChoiceBridge)globalThis.NeoTargetChoiceBridge.prepare(targetRequest,opts,0);selected=null;render();return true}
function chooseTarget(side,slot){if(!targetRequest)return false;const req=targetRequest;if(req.rule.side!==side)return false;let success;try{const bridge=globalThis.NeoTargetChoiceBridge;success=bridge?bridge.commit(req,0,side,slot,optionsFor(req.rule),req.execute):(optionsFor(req.rule).some(x=>x.slot===slot)&&req.execute(slot));}catch(error){toast(error.message);return false;}if(success){if(targetRequest===req)targetRequest=null;selected=null;}render();return success}
function selectPokemonTarget(side,slot){if(targetRequest){chooseTarget(side,slot);return}if(side!==0)return;
 const p=engine.players[0];if(!validEnergySelection(p)||engine.phase!=='game'||engine.over||engine.turn!==0)return;
 if(selected?.power==='Rain Dance'){if(engine.rainDance(selected.i,slot)){selected=null;render();}return;}if(p.energyUsed){toast('You have already attached an Energy this turn.');return}
 const c=lookup.get(p.hand[selected.i]);
 if(engine.attach(selected.i,slot)){selected=null;render()}
}
function addPowerButton(label,action){const b=document.createElement('button');b.textContent=label;b.onclick=action;$('actionBar').append(b)}
function render(){if(!engine.started)return;for(const side of engine.players){if(side?.lastActive49&&side.lastActive49!==side.active){side.lastActive49.weaknessOverride=null;side.lastActive49.resistanceOverride=null;side.lastActive49.lockOnUntil=0;side.lastActive49.shadowImages=false;side.lastActive49.giantGrowth=false;for(const other of engine.players)for(const pok of [other?.active,...(other?.bench||[])])if(pok?.lockOnTarget===side.lastActive49)pok.lockOnUntil=0;}if(side)side.lastActive49=side.active;}let p=engine.players[0],o=engine.players[1];
 if(engine.phase==='setup'){
  $('setupPanel').classList.remove('hidden');
  $('setupHelp').textContent=p.active?'Active chosen. Add up to five Basic Pokémon to your Bench, or confirm your setup. Click placed Pokémon to return them to your hand.':'Choose a Basic Pokémon from your opening hand as your Active Pokémon.';
  $('setupHand').innerHTML=p.hand.map((id,i)=>`<div class="tile ${basic(lookup.get(id))?'selectable':''}" data-setup-hand="${i}">${short(lookup.get(id))}<div class="stats">${basic(lookup.get(id))?'Select Pokémon':'Not a Basic Pokémon'}</div></div>`).join('');
  $('setupActive').innerHTML=p.active?`<div data-setup-undo="-1">${unitHTML(p.active,true)}<div class="tip">Click to undo</div></div>`:'<span class="muted">Choose from hand</span>';
  $('setupBench').innerHTML=p.bench.map((u,i)=>`<div data-setup-undo="${i}">${unitHTML(u)}<div class="tip">Click to undo</div></div>`).join('')||'<span class="muted">Optional</span>';
  $('confirmSetup').disabled=!p.active;
  $('turnInfo').textContent='Opening setup';$('score').textContent='';$('oppInfo').textContent='Setting up…';
  $('sidebarTurn').textContent='OPENING SETUP';$('oppBench').innerHTML='';$('oppActive').innerHTML='<div class="muted">Hidden until setup is confirmed</div>';
  $('myActive').innerHTML=unitHTML(p.active,true);$('myBench').innerHTML=p.bench.map(u=>unitHTML(u)).join('');
  $('hand').innerHTML='';$('handCount').textContent=`(${p.hand.length} opening cards)`;
  $('selection').textContent='Complete opening setup above to begin.';$('actionBar').innerHTML='';$('attacks').innerHTML='';
  $('endTurn').disabled=true;$('retreat').disabled=true;$('log').textContent=engine.message.join('\n');return;
 }
 $('setupPanel').classList.add('hidden');$('turnInfo').textContent=engine.over?'MATCH COMPLETE':engine.turn===0?`Your turn · ${engine.round}`:`Rival turn · ${engine.round}`;$('score').textContent=`Prizes ${6-p.prizes.length}–${6-o.prizes.length}`;$('oppInfo').textContent=`Hand ${o.hand.length} · Deck ${o.deck.length} · Prizes ${o.prizes.length}`;if([p.active,...p.bench].some(u=>engine.unitHasPower(u,'Clairvoyance')))$('oppInfo').textContent+=' · Revealed: '+o.hand.map(id=>lookup.get(id)?.name||id).join(', ');$('rivalHandCount').textContent=o.hand.length;$('rivalDeckCount').textContent=o.deck.length;$('rivalPrizeCount').textContent=o.prizes.length;$('playerDeckCount').textContent=p.deck.length;$('playerPrizeCount').textContent=p.prizes.length;$('playerDiscardCount').textContent=p.discard.length;$('sidebarTurn').textContent=engine.over?'MATCH OVER':engine.turn===0?'YOUR TURN · '+engine.round:'RIVAL TURN · '+engine.round;document.querySelector('.turn-banner')?.classList.toggle('rival',engine.turn===1);$('oppBench').innerHTML=o.bench.map((u,i)=>`<div data-target-side="1" data-target-slot="${i}" class="trainer-pokemon-target">${unitHTML(u)}</div>`).join('');$('oppActive').innerHTML=`<div data-target-side="1" data-target-slot="-1" class="pokemon-target">${unitHTML(o.active,true)}</div>`;$('myActive').innerHTML=`<div data-target-side="0" data-target-slot="-1" class="pokemon-target">${unitHTML(p.active,true)}</div>`;
 $('myBench').innerHTML=p.bench.map((u,i)=>`<div data-target-side="0" data-target-slot="${i}" class="pokemon-target">${unitHTML(u)}</div>`).join('');
 const attaching=!targetRequest&&validEnergySelection(p)&&engine.turn===0&&(!p.energyUsed||selected?.power==='Rain Dance')&&!engine.over;
 document.querySelectorAll('[data-target-side]').forEach(el=>{const side=+el.dataset.targetSide,slot=+el.dataset.targetSlot;el.classList.toggle('awaiting-trainer',!!targetRequest&&targetRequest.rule.side===side&&optionsFor(targetRequest.rule).some(x=>x.slot===slot));el.classList.toggle('awaiting-energy',attaching&&side===0)});
 $('handCount').textContent=`(${p.hand.length})`;
 $('hand').innerHTML=p.hand.map((id,i)=>`<div class="tile ${selected?.kind==='hand'&&selected.i===i?'selected':''}" data-hand="${i}">${short(lookup.get(id))}</div>`).join('');$('log').textContent=engine.message.join('\n');
 let can=engine.phase==='game'&&engine.turn===0&&!engine.over;$('endTurn').disabled=!can;$('retreat').disabled=!can||!p.bench.length||p.retreated;$('attacks').innerHTML=(lookup.get(p.active?.id)?.attacks||[]).map((a,i)=>`<button data-attack="${i}" ${!can||!engine.afford(p.active,a.cost)||!engine.legalAttack(a)?'disabled':''}>${esc(a.name)} · ${esc(a.damage||'effect')} ${engine.legalAttack(a)?'':'🔒'}</button>`).join('')||'<span class="muted">No attacks</span>';
 $('actionBar').innerHTML='';if(deckSearchRequest){
  $('selection').textContent=deckSearchRequest.label||'Search your deck: select the Pokémon to reveal and put into your hand.';
  const req=deckSearchRequest;
  const bridge=globalThis.NeoLegacyChoiceBridge;
  if(bridge)bridge.prepare(req,0);
  const submitChoice=value=>{const execute=req.execute||((v)=>engine.attack(req.attackIndex,null,false,v));try{return bridge?bridge.commit(req,0,value,execute):execute(value)}catch(error){toast(error.message);return false}};
  for(const option of req.options){const b=document.createElement('button');b.textContent=(req.multi?(req.selected.includes(option.index)?'✓ ':'□ '):'')+option.name+(option.id?' ('+option.id+')':'');b.onclick=()=>{if(deckSearchRequest!==req)return;if(req.multi){if(req.selected.includes(option.index))req.selected=req.selected.filter(x=>x!==option.index);else if(req.selected.length<req.max)req.selected.push(option.index);render();}else submitChoice(option.index)};$('actionBar').append(b)}
  if(req.multi){const confirm=document.createElement('button');confirm.textContent=`Confirm selection (${req.selected.length})`;confirm.disabled=req.selected.length<req.min;confirm.onclick=()=>submitChoice(req.selected.slice());$('actionBar').append(confirm);}
  if(!req.defenderPrompt){const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.onclick=()=>{globalThis.NeoLegacyChoiceBridge?.cancel(req);if(engine._psychicProxy59)engine.cancelPsychic59();else{deckSearchRequest=null;engine.pendingSweetScent=null;render()}};$('actionBar').append(cancel);}else{
  const msg=document.createElement('span');msg.className='tip';msg.textContent='Choose an option (or confirm an empty selection) to resume the rival’s turn.';$('actionBar').append(msg);
 }

  return;
 }if(targetRequest){$('selection').textContent=`${targetRequest.name}: select a highlighted ${targetRequest.rule.side===0?'friendly':'opposing'} Pokémon.`;const cancel=document.createElement('button');cancel.textContent='Cancel selection';cancel.onclick=()=>{globalThis.NeoTargetChoiceBridge?.cancel(targetRequest);targetRequest=null;render()};$('actionBar').append(cancel);return;}if(selected){let c=selected.kind==='hand'?lookup.get(p.hand[selected.i]):lookup.get(selected.id);if(c)$('inspector').innerHTML=info(c);if(can&&selected.kind==='hand'&&c){let actions=[];if(engine.powerAvailable('Matter Exchange'))actions.push(['Matter Exchange',()=>engine.matterExchange(selected.i)]);if(engine.powerAvailable('Downpour')&&c.name==='Water Energy')actions.push(['Downpour',()=>engine.downpour(selected.i)]);if(basic(c)&&p.bench.length<5)actions.push(['Bench Pokémon',()=>engine.playBasic(selected.i)]);if(energy(c)&&c.name==='Water Energy'&&engine.powerAvailable('Rain Dance'))actions.push(['Rain Dance 💧',()=>{selected={...selected,power:'Rain Dance'};toast('Choose one of your Water Pokémon. Rain Dance does not use your normal attachment.');render();return false}]);if(energy(c)){if(!p.energyUsed)$('selection').textContent=`${c.name} selected — click your Active Pokémon or a Benched Pokémon to attach it.`;else $('selection').textContent='You have already attached Energy this turn.'}if(c.supertype==='Pokémon'&&!basic(c)){if(compatible(c,engine.card(p.active)))actions.push(['Evolve Active',()=>engine.evolve(selected.i,-1)]);p.bench.forEach((u,i)=>{if(compatible(c,engine.card(u)))actions.push([`Evolve ${engine.card(u).name}`,()=>engine.evolve(selected.i,i)])})}if(trainer(c))actions.push(['Play Trainer',()=>{if(TARGET_RULES[c.name]&&!TRAINER58.has(c.name)){const cardId=c.id;return requestTarget(c.name,slot=>{const idx=engine.players[0].hand.indexOf(cardId);return idx>=0&&engine.trainer(idx,slot)});}return engine.trainer(selected.i)}]);actions.forEach(([label,fn],i)=>{let b=document.createElement('button');b.textContent=label;b.onclick=()=>{if(fn())selected=null;render()};$('actionBar').append(b)});if(!actions.length)$('actionBar').textContent='No playable action for this card now.'}
 if(can&&selected?.kind==='hand'){const chosen=lookup.get(p.hand[selected.i]);if(energy(chosen)&&!p.energyUsed&&!selected.power){const addAttach=(label,slot)=>{const b=document.createElement('button');b.textContent=label;b.className='attach-energy-action';b.onclick=()=>{const handIndex=selected?.i;if(Number.isInteger(handIndex)&&engine.attach(handIndex,slot)){selected=null;render()}};$('actionBar').append(b)};addAttach(`⚡ Attach to ${engine.card(p.active)?.name||'Active'}`,-1);p.bench.forEach((unit,slot)=>addAttach(`⚡ Attach to ${engine.card(unit)?.name||'Bench Pokémon'}`,slot));$('selection').textContent=`${chosen.name} selected — choose a button below or click a highlighted Pokémon.`}}
 if(selected?.power==='Rain Dance')$('selection').textContent='Rain Dance: click one of your Water Pokémon.';if(!validEnergySelection(p))$('selection').textContent=selected.kind==='hand'?`Selected: ${lookup.get(p.hand[selected.i])?.name||'card'}`:'Selected Pokémon';}else{$('selection').textContent='Select a card in your hand to see available actions.'}
 if(can){for(const u of [engine.me.active,...engine.me.bench])if(u?.secretPlanFaceDown)addPowerButton('🎴 Reveal Secret Plan Pokémon',()=>engine.revealSecretPlan(u));for(const [slot,u] of [{slot:-1,u:engine.me.active},...engine.me.bench.map((u,slot)=>({slot,u}))])if(u&&engine.card(u)?.name==='Mysterious Fossil')addPowerButton('🦴 Discard Mysterious Fossil',()=>engine.discardMysteriousFossil(slot));if(lookup.get(engine.stadium?.id)?.name==='Vermilion City Gym'&&engine.card(engine.me.active)?.name?.startsWith("Lt. Surge's ") )addPowerButton('⚡ Vermilion Gym bonus: '+(engine.me.vermillionUseSerial===engine.turnSerial?'ON':'OFF'),()=>{engine.me.vermillionUseSerial=engine.me.vermillionUseSerial===engine.turnSerial?-1:engine.turnSerial;render();return true});if(engine.stadium&&new Set(['Lucky Stadium','Healing Field','Energy Stadium','Radio Tower','Saffron City Gym','Celadon City Gym','Fuchsia City Gym']).has(lookup.get(engine.stadium.id)?.name)){addPowerButton('🏟 Stadium action',()=>engine.stadium58());}for(const name of POWER_BATCH_56){if(engine.powerAvailable(name))addPowerButton('✨ '+name,()=>engine.power56(name));}if(engine.powerAvailable('Buzzap')){for(const [slot,u] of [{slot:-1,u:engine.me.active},...engine.me.bench.map((u,slot)=>({slot,u}))])if(u?.id==='base1-21'||u?.id==='base4-25')addPowerButton('⚡ Buzzap — '+(slot===-1?'Active':'Bench '+(slot+1)),()=>engine.buzzap(slot));}
 if(engine.powerAvailable('Shapeshift')){for(const [slot,u] of [{slot:-1,u:engine.me.active},...engine.me.bench.map((u,slot)=>({slot,u}))])if(u?.id==='gym2-3'){addPowerButton('🦊 Shapeshift — '+(slot===-1?'Active':'Bench '+(slot+1)),()=>engine.shapeshift(slot));if(u.shapeshiftCardId)addPowerButton('↩ Remove Shapeshift',()=>engine.shapeshift(slot,null,true));}}
 if(engine.powerAvailable('[Quicken]'))addPowerButton('✨ [Quicken]',()=>engine.power56('[Quicken]'));
 if([engine.me.active,...engine.me.bench].some(u=>engine.unitHasPower(u,'Bench Guard'))){addPowerButton('🛡 Bench Guard redirect: '+(engine.me.benchGuardAuto===false?'OFF':'ON'),()=>{engine.me.benchGuardAuto=engine.me.benchGuardAuto===false;render();return true});}
 if(engine.powerAvailable('Heal')){let b=document.createElement('button');b.textContent='🌺 Heal';b.onclick=()=>engine.healPower();$('actionBar').append(b)}if(engine.powerAvailable('Step In')){engine.me.bench.forEach((u,i)=>{if(engine.card(u)?.abilities?.some(a=>a.name==='Step In')){let b=document.createElement('button');b.textContent='🐉 Step In';b.onclick=()=>engine.stepIn(i);$('actionBar').append(b)}})}if(engine.powerAvailable('Strange Behavior')){let b=document.createElement('button');b.textContent='💠 Strange Behavior';b.onclick=()=>requestTarget('Strange Behavior source',source=>requestTarget('Strange Behavior destination',destination=>engine.strangeBehavior(source,destination)));$('actionBar').append(b)}if(engine.powerAvailable('Curse')){let b=document.createElement('button');b.textContent='👻 Curse';b.onclick=()=>requestTarget('Curse source',source=>requestTarget('Curse destination',destination=>engine.curse(source,destination)));$('actionBar').append(b)}if(engine.powerAvailable('Energy Burn')){let b=document.createElement('button');b.textContent='🔥 Energy Burn';b.onclick=()=>engine.energyBurn();$('actionBar').append(b)}if(engine.powerAvailable('Energy Trans')){let b=document.createElement('button');b.textContent='🌿 Energy Trans';b.onclick=()=>requestTarget('Energy Trans source',source=>requestTarget('Energy Trans destination',destination=>engine.energyTrans(source,destination)));$('actionBar').append(b)}if(engine.powerAvailable('Damage Swap')){let b=document.createElement('button');b.textContent='🩹 Damage Swap';b.onclick=()=>requestTarget('Damage Swap source',source=>requestTarget('Damage Swap destination',destination=>engine.damageSwap(source,destination)));$('actionBar').append(b)}if(engine.powerAvailable('Natural Healing'))addPowerButton('🌿 Natural Healing',()=>engine.naturalHealing());if(engine.powerAvailable('Solar Power'))addPowerButton('☀️ Solar Power',()=>engine.solarPower());if(engine.powerAvailable('Long Distance Hypnosis'))addPowerButton('💤 Long Distance Hypnosis',()=>engine.longDistanceHypnosis());if(engine.powerAvailable('Trickery'))addPowerButton('🎁 Trickery',()=>engine.trickery());if(engine.powerAvailable('[Laugh]'))addPowerButton('🔀 [Laugh]',()=>engine.laugh());if(engine.powerAvailable('[Tell]'))addPowerButton('👁 [Tell]',()=>engine.tell());if(engine.powerAvailable('Cowardice')){if(engine.me.active&&engine.card(engine.me.active)?.name==='Tentacool')addPowerButton('↩ Cowardice — Active',()=>engine.cowardice(-1));engine.me.bench.forEach((u,i)=>{if(engine.card(u)?.name==='Tentacool')addPowerButton('↩ Cowardice — Bench',()=>engine.cowardice(i))})}if(engine.powerAvailable('Gather Fire'))addPowerButton('🔥 Gather Fire',()=>requestTarget('Gather Fire source',slot=>engine.gatherFire(slot)));if(engine.powerAvailable('Fire Recharge'))addPowerButton('⚡ Fire Recharge',()=>requestTarget('Fire Recharge target',slot=>engine.fireRecharge(slot)));if(engine.powerAvailable('Evolutionary Light'))addPowerButton('🔎 Evolutionary Light',()=>engine.evolutionaryLight());}
}
function attackScore(a,engine){
 const defending=engine.foe.active, attacker=engine.me.active;
 if(!engine.afford(attacker,a.cost)||!engine.legalAttack(a))return -Infinity;if(['benchSnipe','benchSpread'].includes(engine.attackPattern(a))&&!engine.foe.bench.length)return -Infinity;
 if(['Asleep','Paralyzed'].includes(attacker.status))return -Infinity;
 if((a.name==='Stretch Kick'&&/opponent.{0,10}Benched Pokémon/i.test(a.text||''))||engine.attackPattern(a)==='benchSnipe'){
  if(!engine.foe.bench.length)return -Infinity;
  return Math.max(...engine.foe.bench.map(v=>20+(v.damage+20>=+(engine.card(v).hp||0)?85:0)));
 }
 let damage=parseInt(a.damage,10)||0,def=engine.card(defending),type=engine.card(attacker).types?.[0];if(a.name==='Water Gun'&&/Does 10 damage plus 10 more damage for each Water Energy/i.test(a.text||''))damage=10+Math.min(20,Math.max(0,engine.energies(attacker).filter(t=>t==='Water').length-(a.cost||[]).filter(t=>t==='Water').length)*10);
 damage=calculateDamage(damage,engine.card(attacker),def);
 if(['agilityShield','barrierShield','halfShield'].includes(engine.attackPattern(a)))return attacker.damage>=Number(engine.card(attacker).hp||0)-50?45:13;
 if(['recoverFull','restHeal'].includes(engine.attackPattern(a)))return attacker.damage>0?Math.min(75,attacker.damage):0;
 if(engine.attackPattern(a)==='defendReduce'){
  const amount=Number((a.text||'').match(/reduced by (\d+)/i)?.[1]||0);
  // Make the rival value preventing lethal attacks, not only dealing damage.
  const needsProtection=attacker.damage>=Math.max(0,Number(engine.card(attacker).hp||0)-40);
  return amount/2+(needsProtection?18:0);
 }
 if(engine.attackPattern(a)==='batch54'){const kind=batch54Kind(engine.card(attacker),a);return ({energyBomb:17,energyControl:18,energyCycle:14,staticElectricity:30,attractCurrent:32,stoke:24,evolutionarySpore:26})[kind]??8;}
 if(engine.attackPattern(a)==='batch53'){
  const kind=batch53Kind(engine.card(attacker),a);
  if(kind==='bonfire')return 15*(1+engine.foe.bench.length);
  if(kind==='callOfNight')return damage+(engine.foe.bench.length?15:25);
  if(kind==='invigorate')return batch53Options(engine,kind).length?18:-Infinity;
  if(kind==='eerieHowl'||kind==='provoke')return batch53Options(engine,kind).length?17:-Infinity;
  if(kind==='prehistoricWater')return batch53Options(engine,kind).length?24:-Infinity;
  if(kind==='helpingHand')return engine.foe.active.damage?Math.min(20,engine.foe.active.damage/10*4):3;
 }
 if(engine.attackPattern(a)==='batch50'){
  const kind=batch50Kind(engine.card(attacker),a),hp=engine.maxHP(attacker),injured=attacker.damage>=Math.max(10,hp-40);
  if(['mirrorShell','crosscounter','counter','fireWall','reflectShield','secretePoison','shadowImages'].includes(kind))return injured?35:18;
  if(kind==='giantGrowth')return attacker.giantGrowth?0:attacker.damage>=20?29:20;
  if(kind==='rushingFlames')return Math.min(55,batch50EnergyChoices(engine).length*12);
  if(kind==='sweetScent')return [engine.me.active,...engine.me.bench].some(v=>v?.damage>0)?14:0;
 }
 if(engine.attackPattern(a)==='batch49'){const kind=batch49Kind(engine.card(attacker),a);if(kind==='lockOn')return 25;if(kind==='bellyDrum')return attacker.damage+30>=engine.maxHP(attacker)?-Infinity:28;if(kind==='burningFire')return damage+10*Math.min(2,engine.me.bench.reduce((n,v)=>n+v.energies.length,attacker.energies.length));if(kind==='conversionWeak')return engine.card(defending)?.weaknesses?.length?14:1;if(kind==='conversionResist')return 15;if(kind==='lightningRod')return 10;if(kind==='coreStream')return 20+engine.foe.bench.reduce((s,v)=>s+v.energies.length*4,0);if(kind==='darkFlame')return damage+12;return damage+10;}
 if(engine.attackPattern(a)==='batch47'){
  const rule=batch47Rule(engine.card(attacker),a);
  if(rule?.kind==='feint')return rule.damage+12+Math.max(0,...engine.foe.bench.map(x=>x.damage+rule.damage>=engine.maxHP(x)?85:0));
  if(rule?.kind==='benchSpreadChoose')return damage+Math.min(rule.count,engine.foe.bench.length)*rule.damage;
  if(rule?.kind==='devolve')return [engine.foe.active,...engine.foe.bench].some(x=>x?.under?.length)?30:-Infinity;
  if(rule?.kind==='searchBaby')return engine.me.bench.length<5?22:-Infinity;
  if(rule?.kind==='searchDragon')return engine.me.deck.some(id=>['Gyarados','Dark Gyarados','Shining Gyarados'].includes(lookup.get(id)?.name))?20:3;
  if(rule?.kind==='coinChooseStatus')return damage+18;
  if(rule?.kind==='coinHealTarget')return Math.max(0,...[engine.me.active,...engine.me.bench].filter(Boolean).map(x=>x.damage));
  if(rule?.kind==='wildfire')return engine.foe.deck.length<10?25:12;
  return damage+8;
 }
 if(engine.attackPattern(a)==='batch46'){
  const {kind,mode}=batch46Rule(a);
  if(mode==='foeBench'&&!engine.foe.bench.length||mode==='ownBench'&&!engine.me.bench.length)return -Infinity;
  if(kind==='washAway')return engine.me.bench.reduce((best,u)=>Math.max(best,u.damage),0)>0?35:0;
  if(kind==='plasma')return engine.me.discard.some(id=>energy(lookup.get(id)))?damage+22:damage;
  if(kind==='terrorize')return basic(engine.card(engine.foe.active))?18:1;
  if(kind==='batonPass')return damage+(engine.me.active.damage>30?18:3);
  if(kind==='luckyShot')return engine.foe.bench.length?18:-Infinity;
  if(kind==='electricCurrent'&&engine.me.bench.length)return damage+5;
  if(kind==='stare')return engine.foe.bench.some(u=>(engine.card(u)?.abilities||[]).length)?32:12;
  return damage+5;
 }
 if(engine.attackPattern(a)==='batch45'){const id=batch45Id(a);if([7,10].includes(id))return 20+(attacker.damage>0?12:0);if(id===9)return attacker.damage>0?Math.min(70,attacker.damage):0;return damage+8;}
 if(engine.attackPattern(a)==='batch43'){
  const id=batch43Id(a);
  if(id===79&&(attacker.lastAttackName!=='Lie Low'||attacker.lastAttackRound!==engine.round-1))return -Infinity;
  if(id===125&&attacker.damage<20)return -Infinity;
  if([55,78,146,174,265,299].includes(id))return Math.max(18,Math.min(48,attacker.damage+16));
  if([120,168,240,311,142].includes(id))return Math.max(12,Math.min(45,attacker.damage+6));
  if([98,102,126,138,185,204,220,251,290,296,320].includes(id))return Math.max(19,damage+13);
  if([141,162,294,208,260].includes(id))return Math.max(15,damage+9);
 }
 return damage+(damage&&defending.damage+damage>=+(def.hp||0)?85:0)+(a.text&&/Poisoned|Paralyzed|Asleep|Confused/.test(a.text)?10:0);
}
function cpuBenchTarget(engine){return engine.foe.bench.map((u,i)=>({i,score:20+(u.damage+20>=+(engine.card(u).hp||0)?85:0)+u.damage/10})).sort((a,b)=>b.score-a.score)[0]?.i??0}
// Each rival action is awaited; the CPU never starts a new action while an effect is on screen.
async function waitForCoinAnimations(generation){
 while(generation===matchGeneration&&(coinBusy||coinQueue.length))await pause(80);
}
async function cpu(generation){
 const valid=()=>generation===matchGeneration&&engine.turn===1&&!engine.over&&engine.phase==='game';
 if(!valid()||cpuRunning)return;
 cpuRunning=true;
 const status=$('cpuActionStatus'),stage=$('battleStage');
 const step=async (message,kind='action',slot=-1,duration=750)=>{
  if(!valid())return false;
  // On-play and Energy-triggered Powers can require a human decision during
  // the CPU turn. Pause the sequence until the defending player responds.
  if(deckSearchRequest?.defenderPrompt){const confirmed=await new Promise(resolve=>{cpuResumeChoice=resolve});if(!confirmed||!valid())return false;}
  if(status)status.textContent=message;
  await feedback(message,1,kind,slot,duration);
  return valid();
 };
 try{
  stage?.classList.add('cpu-busy');
  if(!await step('🎒 Rival is thinking…','action',-1,560))return;
  const p=engine.me;
  if(engine.powerAvailable('[Quicken]'))engine.power56('[Quicken]');
  if(engine.powerAvailable('Natural Healing'))engine.naturalHealing();
  if(engine.powerAvailable('Heal')&&[p.active,...p.bench].some(u=>u?.damage))engine.healPower();
  if(engine.powerAvailable('Solar Power')&&(p.active?.status||p.active?.poison||engine.foe.active?.status||engine.foe.active?.poison))engine.solarPower();
  if(engine.powerAvailable('Long Distance Hypnosis'))engine.longDistanceHypnosis();
  if(engine.powerAvailable('Trickery'))engine.trickery();
  if(engine.powerAvailable('Evolutionary Light'))engine.evolutionaryLight();
  if(engine.powerAvailable('Fire Recharge')){const slot=p.active&&engine.card(p.active)?.types?.includes('Fire')?-1:p.bench.findIndex(u=>engine.card(u)?.types?.includes('Fire'));if(slot>=-1&&p.discard.some(id=>lookup.get(id)?.name==='Fire Energy'))engine.fireRecharge(slot)}
  // Bench each Pokémon separately and leave time to see the card arrive.
  for(let i=p.hand.length-1;i>=0&&valid();i--){
   const c=lookup.get(p.hand[i]);
   if(basic(c)&&p.bench.length<3){
    if(!await step(`🟢 Rival plays ${c.name} to the Bench`,'action',-1,550))return;
    engine.playBasic(i);
    if(!await step(`✓ ${c.name} is now Benched`,'attach',p.bench.length-1,690))return;
   }
  }
  // Evolve eligible Pokémon from the authentic theme deck's evolution lines.
  // One stage per Pokémon per turn; Engine.evolve validates timing and Power restrictions.
  for(let pass=0;pass<2&&valid();pass++){
   let progressed=false;
   for(let i=p.hand.length-1;i>=0&&valid();i--){
    const c=lookup.get(p.hand[i]);
    if(c?.supertype!=='Pokémon'||basic(c))continue;
    const slots=[-1,...p.bench.map((_,j)=>j)];
    const slot=slots.find(j=>{
     const u=j===-1?p.active:p.bench[j];
     return u&&compatible(c,engine.card(u))&&u.playedTurn<engine.round&&!p.turnPlays.includes(u);
    });
    if(slot===undefined)continue;
    if(!await step(`✨ Rival evolves into ${c.name}`,'action',slot,580))return;
    if(engine.evolve(i,slot)){
     progressed=true;
     if(!await step(`✓ ${c.name} evolved`,'attach',slot,640))return;
    }
   }
   if(!progressed)break;
  }
  if(!valid())return;
  const choices=p.hand.map((id,i)=>({i,c:lookup.get(id)})).filter(x=>energy(x.c));
  if(choices.length&&!p.energyUsed){
   const attacks=engine.card(p.active)?.attacks||[];
   choices.sort((a,b)=>{
    const need=x=>Math.max(0,...attacks.map(at=>(at.cost||[]).filter(t=>t===energyType(x.c.id)&&!engine.energies(p.active).includes(t)).length));
    return need(b)-need(a);
   });
   const name=choices[0].c.name,activeName=engine.card(p.active).name;
   if(!await step(`⚡ Rival prepares ${name}`,'action',-1,470))return;
   if(engine.attach(choices[0].i,-1)){
    if(status)status.textContent=`⚡ ${name} → ${activeName}`;
    await lastBattleAnimation;
    if(!valid())return;
    if(!await step(`✓ ${name} attached to ${activeName}`,'attach',-1,650))return;
   }
  }
  const attacks=engine.card(p.active)?.attacks||[];
  const best=[...attacks.keys()].map(i=>({i,score:attackScore(attacks[i],engine)})).filter(x=>Number.isFinite(x.score)).sort((x,y)=>y.score-x.score);
  if(best.length){
   const pick=best[0].i,attack=attacks[pick],attackerName=engine.card(p.active).name;
   if(!await step(`⚔ ${attackerName} uses ${attack.name}!`,'attack',-1,900))return;
   // defer automatic turn advancement until animation, coin flips, and damage have been viewed
   const newMode=engine.attackPattern(attack)==='batch45'?batch45Mode(attack):engine.attackPattern(attack)==='batch46'?batch46Mode(attack):null;const cpuTarget=newMode==='foeAnyOptional'&&engine.foe.bench.length?cpuBenchTarget(engine):['any','foeAny','foeAnyOptional'].includes(newMode)?-1:((newMode==='bench'||newMode?.startsWith('foeBench'))&&engine.foe.bench.length)?cpuBenchTarget(engine):((newMode==='ownBench'||newMode?.startsWith('ownBench'))&&engine.me.bench.length)?0:null;
   const special47=engine.attackPattern(attack)==='batch47'&&batch47Rule(engine.card(engine.me.active),attack);
   const cpuChoice=engine.attackPattern(attack)==='batch46'?(batch46Rule(attack).kind==='terrorize'?0:batch46Rule(attack).kind==='lightningStrike'?1:null):null;
   const feintTarget=special47?.kind==='feint'?[{slot:-1,u:engine.foe.active},...engine.foe.bench.map((u,slot)=>({slot,u}))].sort((a,b)=>{
    const score=v=>(v.u.damage+special47.damage>=engine.maxHP(v.u)?100:0)+(v.slot===-1?12:0)+v.u.damage/10;
    return score(b)-score(a);
   })[0]?.slot??-1:null;
   const succeeded=engine.attack(pick,special47?.kind==='feint'?feintTarget:newMode?cpuTarget:(['Stretch Kick','benchSnipe'].includes(engine.attackPattern(attack)==='benchSnipe'?'benchSnipe':attack.name)?cpuBenchTarget(engine):null),true,cpuChoice);
   if(succeeded){
    if(deckSearchRequest?.defenderPrompt){const confirmed=await new Promise(resolve=>{cpuResumeChoice=resolve});if(!confirmed||generation!==matchGeneration)return;}
    if(status)status.textContent=`💥 Resolving ${attack.name}…`;
    await Promise.all([lastBattleAnimation,waitForCoinAnimations(generation)]);
    if(generation!==matchGeneration)return;
    await pause(600);
    if(valid())engine.end();
   }else if(valid()&&deckSearchRequest?.defenderPrompt){
    const completed=await new Promise(resolve=>{cpuResumeChoice=resolve});
    if(completed&&generation===matchGeneration){await Promise.all([lastBattleAnimation,waitForCoinAnimations(generation)]);await pause(420);if(valid())engine.end()}
   }else if(valid())engine.end();
  }else{
   if(await step('⏭ Rival has no usable attack — ending turn','action',-1,950))engine.end();
  }
 }finally{
  cpuRunning=false;
  stage?.classList.remove('cpu-busy');
  if(status)status.textContent='';
 }
}

async function load(){const all=await Promise.allSettled(SETS.map(async s=>{let r=await fetch(`cards/${s}.json`);if(!r.ok)r=await fetch(`https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/${s}.json`);if(!r.ok)throw Error(s);return r.json()}));let misses=[];for(let i=0;i<all.length;i++){if(all[i].status==='fulfilled')cards.push(...all[i].value.map(normalizeLoadedCard));else misses.push(SETS[i])}cards=(window.NeoCardCorrections?.applyCardCorrections(cards)||cards).map(normalizeLoadedCard).filter(c=>c.id&&c.name);lookup=new Map(cards.map(c=>[c.id,c]));$('dbStatus').textContent=`Classic: ${cards.filter(c=>window.NeoClassicFormat.isAllowed(c)).length}/311 cards · full archive: ${cards.length} records`; if(misses.length)toast('Some sets unavailable: '+misses.join(', '));SETS.forEach((s,i)=>$('setFilter').innerHTML+=`<option value="${s}">${SET_NAMES[i]}</option>`);drawCatalog();if(cards.length){fillThemeChoices();startMatch();}else $('turnInfo').textContent='Unable to load: run local server or connect to internet.'}
function drawCatalog(){let q=$('search').value.toLowerCase(),set=$('setFilter').value;let filtered=cards.filter(c=>(set==='all'||(set==='classic'&&window.NeoClassicFormat.isAllowed(c))||c.id.startsWith(set+'-'))&&(!q||`${c.name} ${c.id} ${c.attacks?.map(a=>a.name).join(' ')||''}`.toLowerCase().includes(q)));$('catalogCount').textContent=`${filtered.length} cards`;let showing=filtered.slice(0,offset+72);$('catalog').innerHTML=showing.map(c=>`<div class="tile" data-catalog="${esc(c.id)}">${short(c)}<div class="stats">${esc(c.id)}</div></div>`).join('');$('moreCards').disabled=showing.length>=filtered.length}
document.addEventListener('click',e=>{let sh=e.target.closest('[data-setup-hand]');if(sh){engine.setupSelect(+sh.dataset.setupHand);return}let su=e.target.closest('[data-setup-undo]');if(su){engine.setupUndo(+su.dataset.setupUndo);return}let pt=e.target.closest('[data-target-side]');if(pt){selectPokemonTarget(+pt.dataset.targetSide,+pt.dataset.targetSlot);return}let h=e.target.closest('[data-hand]');if(h&&engine.turn===0){targetRequest=null;pendingTrainer=null;selected=(selected?.kind==='hand'&&selected.i===+h.dataset.hand)?null:{kind:'hand',i:+h.dataset.hand};render()}let a=e.target.closest('[data-attack]');if(a){const index=+a.dataset.attack,atk=engine.card(engine.players[0].active)?.attacks?.[index];if(atk?.name==='Stretch Kick')requestTarget('Stretch Kick',slot=>engine.attack(index,slot));else if(engine.attackPattern(atk)==='benchSnipe')requestTarget('Bench attack',slot=>engine.attack(index,slot));else if(engine.attackPattern(atk)==='anySnipe')requestTarget('Opponent Pokémon attack',slot=>engine.attack(index,slot));else if(engine.attackPattern(atk)==='selfSwitch')requestTarget('Self switch attack',slot=>engine.attack(index,slot));else if(engine.attackPattern(atk)==='batch47'&&batch47Rule(engine.card(engine.me.active),atk)?.kind==='feint')requestTarget('Opponent Pokémon attack',slot=>engine.attack(index,slot));else if(engine.attackPattern(atk)==='batch46'){
 const mode=batch46Mode(atk),own=mode.startsWith('own'),optional=mode.endsWith('Optional');
 const hasBench=own?engine.me.bench.length:engine.foe.bench.length;
 if(mode==='foeAny'||mode==='foeAnyOptional')requestTarget('Opponent Pokémon attack',slot=>engine.attack(index,slot));
 else if(mode.startsWith('foe')&&(!optional||hasBench))requestTarget('Bench attack',slot=>engine.attack(index,slot));
 else if(own&&(!optional||hasBench))requestTarget('Friendly Bench attack',slot=>engine.attack(index,slot));
 else engine.attack(index);
 }else if(engine.attackPattern(atk)==='batch45'&&(batch45Mode(atk)==='ownBench'||batch45Mode(atk)==='ownBenchOptional'&&engine.me.bench.length))requestTarget('Friendly Bench attack',slot=>engine.attack(index,slot));else if(engine.attackPattern(atk)==='batch45'&&batch45Mode(atk)==='any')requestTarget('Opponent Pokémon attack',slot=>engine.attack(index,slot));else if(engine.attackPattern(atk)==='batch45'&&(batch45Mode(atk)==='bench'||batch45Mode(atk)==='benchOptional'&&engine.foe.bench.length))requestTarget('Bench attack',slot=>engine.attack(index,slot));else engine.attack(index)}let cc=e.target.closest('[data-catalog]');if(cc){let c=lookup.get(cc.dataset.catalog);$('catalogDetail').innerHTML=info(c)} });
$('confirmSetup').onclick=()=>engine.confirmSetup();$('endTurn').onclick=()=>engine.turn===0&&engine.end();$('newGame').onclick=startMatch;$('retreat').onclick=()=>requestTarget('Retreat',slot=>engine.retreat(slot));$('search').oninput=()=>{offset=0;drawCatalog()};$('setFilter').onchange=()=>{offset=0;drawCatalog()};$('moreCards').onclick=()=>{offset+=72;drawCatalog()};document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');['duel','cards','rules'].forEach(id=>$(id).classList.toggle('hidden',id!==t.dataset.tab))});
load();
