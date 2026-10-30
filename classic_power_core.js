'use strict';
// Explicit headless Classic Power implementations. Unsupported powers do not
// silently turn into no-ops; they are listed in UNSUPPORTED below.
const {makeDecision}=require('./decision_core');
const STATUS=require('./special_conditions_core');
const {isBasicPokemon,isEnergy}=require('./core_rules');
const SETS=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'];
const CARDS=new Map([
 ...require('./cards/base1.json'),
 ...require('./cards/base2.json'),
 ...require('./cards/base3.json'),
 ...require('./cards/base4.json'),
 ...require('./cards/base5.json'),
 ...require('./cards/gym1.json'),
 ...require('./cards/gym2.json'),
 ...require('./cards/neo1.json'),
 ...require('./cards/neo2.json'),
 ...require('./cards/neo3.json'),
 ...require('./cards/neo4.json'),
 ...require('./cards/basep.json')
].map(c=>[c.id,c]));
const card=id=>{const c=CARDS.get(id);if(!c)throw Error('Unknown Classic card '+id);return c;};
const own=p=>[p.active,...p.bench].filter(Boolean);
const pokemon=(p,slot)=>slot===-1?p.active:p.bench[slot];
const slotList=(p,pred=()=>true)=>[-1,...p.bench.map((_,i)=>i)].flatMap(i=>pokemon(p,i)&&pred(pokemon(p,i),i)?[{id:'slot:'+i,label:(i===-1?'Active ':'Bench ')+(pokemon(p,i).secretPlanFaceDown?'Face-down Pokémon':card(pokemon(p,i).id).name)}]:[]);
const indices=(arr,pred=()=>true,prefix='index')=>arr.flatMap((id,i)=>pred(card(id),i)?[{id:`${prefix}:${i}`,label:prefix==='prize'?`Prize ${i+1}`:card(id).name,cardId:id}]:[]);
const basicEnergy=c=>isEnergy(c)&&/^(Grass|Fire|Water|Lightning|Psychic|Fighting) Energy$/.test(c.name);
const healthy=u=>u&&u.status!=='Asleep'&&u.status!=='Confused'&&u.status!=='Paralyzed';
// Gaze stops ALL Powers on the chosen opposing Benched Pokémon. Suppression
// ends when the target leaves the Bench, or at the end of this turn.
function gazed(g,u){
 if(!u||!(u.gazeSuppressedUntil>g.turnSerial))return false;
 const benched=g.players.some(p=>p.bench.includes(u));
 if(!benched){delete u.gazeSuppressedUntil;return false;}
 return true;
}
function powerNames(u){return u?.secretPlanFaceDown?[]:(card(u.id).abilities||[]).filter(x=>x.name).map(x=>x.name);}
function live(g,u,name){
 if(!u||!powerNames(u).includes(name)||(u.powerSuppressedUntil>g.turnSerial||gazed(g,u)))return false;
 if(name!=='Toxic Gas'&&g.powerBlankUntil>g.turnSerial)return false;
 if(name!=='Toxic Gas'&&has(g,'Toxic Gas',true))return false;
 return healthy(u);
}
function has(g,name,noGlobal=false){return g.players.some(p=>own(p).some(u=>
 powerNames(u).includes(name)&&healthy(u)&&!gazed(g,u)&&
 !(u.powerSuppressedUntil>g.turnSerial)&&(noGlobal||live(g,u,name))));}
function blocked(g,name){if(name==='Toxic Gas')return false;return g.powerBlankUntil>g.turnSerial||has(g,'Toxic Gas',true);}
function enabled(g,u,name){return Boolean(u&&powerNames(u).includes(name)&&(healthy(u)||['Gaseous Form','Pollen Defense','Restless Sleep','[Normal]','Photosynthesis','Rebellion','Shock Blast','[Search]','[Tell]','[Laugh]','Darkness','[Bear]','[Yield]'].includes(name))&&!blocked(g,name)&&!(u.powerSuppressedUntil>g.turnSerial)&&!gazed(g,u));}
function protectsStatus(g,u){return enabled(g,u,'Thick Skinned');}
function powerInPlay(g,name){return g.players.some(p=>own(p).some(u=>enabled(g,u,name)));}
function choice(g,plan,key,actor,options,{min=1,max=min,optional=false,label=key}={}){
 if(!options.length&&min>0)throw Error('No valid options for Power '+key);
 g.nextDecisionId++;
 g.pendingDecision=makeDecision({id:`classic-power:${g.nextDecisionId}`,actor,kind:key,label,options,min,max,optional});
 g.pendingAction={kind:'classic_power',plan:{...plan,await:key}};
}
const num=s=>{const v=Number(s.slice(s.indexOf(':')+1));if(!Number.isInteger(v))throw Error('Invalid Power selection');return v;};
const selected=(plan,key)=>plan.data[key]?.map(num)||[];
const have=(plan,key)=>Object.prototype.hasOwnProperty.call(plan.data,key);
function powerPlan(g,plan,h){
 const side=plan.side,p=g.players[side],f=g.players[1-side],u=pokemon(p,plan.slot),name=plan.name,d=plan.data;
 if(!u||u.id!==plan.unitId)throw Error('Power source no longer present');
 if(plan.source==='activated'&&ONCE.has(name)&&u.powerUsed?.[name]===g.turnSerial&&
    !(name==='Special Delivery'&&d.deliveryDrawn))throw Error('Power already used this turn');
 const choose=(key,items,label,opts={})=>{
  if(have(plan,key))return false;
  choice(g,plan,key,side,items,{label,...opts});return true;
 };
 const sourceEnergy=()=>slotList(p,x=>x.energies.some(id=>basicEnergy(card(id))));
 const pokemonAt=(key,who=p)=>pokemon(who,selected(plan,key)[0]);
 // Letter Powers must have their entire word spelled out on the Bench.
 const requiredUnown={'[Find]':'FIND','[Help]':'HELP','[Join]':'JOIN'}[name];
 if(requiredUnown&&!requiredUnown.split('').every(letter=>
   p.bench.some(x=>card(x.id).name==='Unown ['+letter+']')))
  throw Error(name+' requires Unown '+requiredUnown.split('').join(', ')+' on the Bench');
 if(name==='[Find]'&&choose('deck',indices(p.deck,c=>c.supertype==='Trainer','deck'),
    '[Find]: search your deck for a Trainer card'))return;
 if(name==='[Join]'&&choose('deck',indices(p.deck,c=>c.supertype==='Pokémon','deck'),
    '[Join]: search your deck for a Pokémon card'))return;
 if(name==='Special Delivery'){
  if(!d.deliveryDrawn){
   if(!p.deck.length)throw Error('Special Delivery requires a card in the deck');
   h.draw(g,side);
   d.deliveryDrawn=true;
   (u.powerUsed ||= {})[name]=g.turnSerial;
  }
  if(choose('hand',indices(p.hand,()=>true,'hand'),
      'Special Delivery: choose a hand card to put on top of your deck'))return;
 }
 if(name==='Solar Power'&&(!p.active||!f.active))throw Error('Solar Power requires both Active Pokémon');
 if(name==='Gaze'){
  const choices=f.bench.flatMap((x,i)=>powerNames(x).length?
    [{id:'bench:'+i,label:card(x.id).name}]:[]);
  if(choose('gaze',choices,'Gaze: choose opposing Benched Pokémon to disable'))return;
 }
 if(name==='[Bear]'){
  if(Number(card(u.id).hp)-u.damage<=10)throw Error('[Bear] cannot leave Unown B Knocked Out');
  if(choose('source',slotList(p,x=>x!==u&&card(x.id).name.startsWith('Unown')&&x.damage>=10),
    '[Bear]: move 1 damage counter from an Unown to Unown B'))return;
 }
 if(name==='[Yield]'){
  if(!have(plan,'coin'))d.coin=h.flip(g);
  if(d.coin){
   if(!have(plan,'energy')){
    const options=indices(p.deck,c=>c.name==='Psychic Energy','deck');
    if(options.length){if(choose('energy',options,'[Yield]: find Psychic Energy'))return;}
    else d.energy=[];
   }
   if(selected(plan,'energy').length&&choose('target',
      slotList(p,x=>card(x.id).name.startsWith('Unown')),
      '[Yield]: attach Psychic Energy to an Unown'))return;
  }
 }
 if(name==='Cunning'){
  if(!have(plan,'coin'))d.coin=h.flip(g);
  if(d.coin){
   if(!d.looked){
    d.looked=true;
    (p.privateLog ||= []).push('Cunning: opponent top deck card — '+
      (f.deck.length?card(f.deck.at(-1)).name:'(deck empty)'));
   }
   if(choose('shuffle',[
      {id:'choice:0',label:'Leave opponent deck in place'},
      {id:'choice:1',label:'Shuffle opponent deck'}
    ],'Cunning: do you want to shuffle the opponent deck?'))return;
  }
 }
 if(['Rain Dance','Gather Fire','Energy Trans'].includes(name)){
  if(name==='Rain Dance'){
   if(choose('energy',indices(p.hand,c=>c.name==='Water Energy','hand'),'Choose Water Energy from hand'))return;
   if(choose('target',slotList(p,x=>card(x.id).types.includes('Water')),'Choose Water Pokémon to attach Energy'))return;
  }else{
   if(name==='Energy Trans'&&own(p).length<2)throw Error('Energy Trans requires another Pokémon in play');
   if(choose('source',slotList(p,x=>(name==='Energy Trans'||x!==u)&&x.energies.some(id=>card(id).name===(name==='Gather Fire'?'Fire Energy':'Grass Energy'))),'Choose source Pokémon'))return;
   if(choose('energy',indices(pokemonAt('source').energies,c=>c.name===(name==='Gather Fire'?'Fire Energy':'Grass Energy')),'Choose Energy to move'))return;
   if(name==='Energy Trans'&&choose('target',slotList(p,x=>x!==pokemonAt('source')),'Choose receiving Pokémon'))return;
  }
 }
 if(['Damage Swap','Curse','Strange Behavior'].includes(name)){
  const owner=name==='Curse'?f:p;
  if(choose('source',slotList(owner,x=>x.damage>=10&& (name!=='Strange Behavior'||x!==u)),'Choose source of damage'))return;
  if(name==='Strange Behavior'){}else if(choose('target',slotList(owner,x=>x!==pokemonAt('source',owner)&&(name==='Curse'||x.damage+10<Number(card(x.id).hp))),'Choose recipient of damage'))return;
 }

 if(name==='Downpour'&&choose('energy',indices(p.hand,c=>c.name==='Water Energy','hand'),'Discard one Water Energy'))return;
 if(name==='Berserk'&&!have(plan,'coin'))d.coin=h.flip(g);
 if(name==='Fire Recharge'){
  if(!have(plan,'coin'))d.coin=h.flip(g);
  if(d.coin&&p.discard.some(id=>card(id).name==='Fire Energy')&&own(p).some(x=>card(x.id).types?.includes('Fire'))){
   if(choose('energy',indices(p.discard,c=>c.name==='Fire Energy','discard'),'Fire Recharge: choose Energy'))return;
   if(choose('target',slotList(p,x=>card(x.id).types?.includes('Fire')),'Fire Recharge: attach to Fire Pokemon'))return;
  }
 }
 if(name==='Glaring Gaze'){
  if(!have(plan,'coin'))d.coin=h.flip(g);
  if(d.coin&&!have(plan,'trainer')){
   const options=indices(f.hand,c=>c.supertype==='Trainer','hand');
   if(options.length){if(choose('trainer',options,'Glaring Gaze: choose opposing Trainer'))return;}
   else d.trainer=[];
  }
 }
 if(name==='Fire Boost'){
  if(!have(plan,'accept')&&choose('accept',[{id:'choice:1',label:'Flip for Fire Boost'}],'Fire Boost: use optional Power?',{min:0,max:1,optional:true}))return;
  if(selected(plan,'accept').length){
   if(!have(plan,'coin'))d.coin=h.flip(g);
   if(d.coin&&!have(plan,'fire')){
    const options=indices(p.deck,c=>c.name==='Fire Energy','deck');
    if(options.length){if(choose('fire',options,'Attach up to 4 Fire Energy to Typhlosion',{min:0,max:Math.min(4,options.length),optional:true}))return;}
    else d.fire=[];
   }
  }
 }
 if(name==='[Engage]'){
  const yesNo=[{id:'choice:0',label:'Keep current hand'},{id:'choice:1',label:'Shuffle hand into deck and draw 4'}];
  if(!have(plan,'oppEngage')){choice(g,plan,'oppEngage',1-side,yesNo,{label:'Unown E: opponent may redraw'});return;}
  if(!have(plan,'ownEngage')){choice(g,plan,'ownEngage',side,yesNo,{label:'Unown E: you may redraw'});return;}
 }
 if(name==='[Search]'&&!have(plan,'prize')){if(choose('prize',indices(p.prizes,()=>true,'prize'),'Unown S: look at a Prize card'))return;}
 if(name==='[Increase]'&&!have(plan,'unown')){
  const found=indices(p.deck,c=>c.name.startsWith('Unown')&&c.subtypes?.includes('Basic'),'deck');
  if(p.bench.length>=5)throw Error('Increase requires a free Bench slot');
  if(found.length){if(choose('unown',found,'Increase: optionally Bench an Unown',{min:0,max:1,optional:true}))return;}
  else d.unown=[];
 }
 if(name==='Energy Evolution'&&!have(plan,'evolution')){
  const options=indices(p.deck,c=>c.evolvesFrom==='Eevee'&&c.types?.includes(plan.energyType),'deck');
  if(options.length){if(choose('evolution',options,'Energy Evolution: optional Eevee evolution',{min:0,max:1,optional:true}))return;}
  else d.evolution=[];
 }
 if(name==='Revive Fossil'||name==='Revive Friends'){
  if(p.bench.length>=5)throw Error('Fossil revival requires Bench space');
  if(!have(plan,'coin'))d.coin=h.flip(g);
  if(d.coin&&!have(plan,'fossil')){
   const options=indices(p.deck,c=>name==='Revive Friends'?c.name==='Kabuto':(['Omanyte','Kabuto','Aerodactyl'].includes(c.name)&&c.subtypes?.includes('Stage 1')),'deck');
   if(options.length){if(choose('fossil',options,'Fossil: optionally Bench a Fossil Pokémon',{min:0,max:1,optional:true}))return;}
   else d.fossil=[];
  }
 }
 if(name==='Shapeshift'&&!u.gymShapeshiftCard){
  if(u.gymShapeshiftUsed===g.turnSerial)throw Error('Shapeshift can only attach one Evolution per turn');
  if(choose('evolution',indices(p.hand,c=>c.supertype==='Pokémon'&&c.subtypes?.some(t=>t==='Stage 1'||t==='Stage 2'),'hand'),'Attach an Evolution to Brock’s Ninetales'))return;
 }
 if(name==='Fragrance Trap'){
  if(!have(plan,'roll'))d.roll=h.flip(g);
  if(d.roll&&f.bench.length&&choose('bench',f.bench.map((x,i)=>({id:`bench:${i}`,label:card(x.id).name})),'Choose an opponent Benched Pokémon to pull Active'))return;
 }
 if(name==='Soak Up'){
  const pool=slotList(p,x=>x!==u).flatMap(o=>{const sl=num(o.id),source=pokemon(p,sl);return source.energies.flatMap((id,i)=>card(id).name==='Grass Energy'?[{id:`energy:${sl}:${i}`,label:`${card(source.id).name} — Grass Energy`}]:[]);});
  if(!pool.length)throw Error('Soak Up requires another Pokémon with Grass Energy');
  if(choose('grass',pool,'Move up to 2 Grass Energy to Erika’s Bellsprout',{min:1,max:Math.min(2,pool.length)}))return;
 }
 if(name==='Natural Healing'&&u.damage<=0)throw Error('Natural Healing requires damage to heal');
 if(name==='Energy Charge'){
  if(plan.slot!==-1)throw Error('Energy Charge only works while Magneton is Active');
  if(choose('source',slotList(p,x=>x!==u&&x.energies.some(id=>card(id).name==='Lightning Energy')),'Choose source Pokémon for Energy Charge'))return;
  if(choose('energy',indices(pokemonAt('source').energies,c=>c.name==='Lightning Energy'),'Choose Lightning Energy'))return;
 }
 if(name==='Emerge'&& !have(plan,'roll'))d.roll=h.flip(g);
 if(name==='Emerge'&&d.roll&&!have(plan,'evolution')){const a=indices(p.deck,c=>c.name==="Koga's Beedrill",'deck');if(a.length){if(choose('evolution',a,"Find Koga's Beedrill",{min:0,max:1,optional:true}))return;}else d.evolution=[];}
 if(name==='Call the Boss'&&!have(plan,'trainer')){const a=indices(p.deck,c=>c.supertype==='Trainer'&&c.name==='Giovanni','deck');if(a.length){if(choose('trainer',a,'Optional Giovanni Trainer search',{min:0,max:1,optional:true}))return;}else d.trainer=[];}
 if(name==='Step In'&&plan.slot<0)throw Error('Step In only works on Benched Dragonite');
 if(name==='Heal'&&choose('target',slotList(p,x=>x.damage>=10),'Choose Pokémon to heal'))return;
 if(name==='Evolutionary Light'&&choose('deck',indices(p.deck,c=>c.subtypes?.includes('Stage 1')||c.subtypes?.includes('Stage 2'),'deck'),'Choose an Evolution card'))return;
 if(name==='Matter Exchange'&&choose('hand',indices(p.hand,()=>true,'hand'),'Choose a card to discard'))return;
 if(name==='Trickery'){
  if(!p.prizes.length||!p.deck.length)throw Error('Trickery requires a Prize and a card in the deck');
  if(choose('prize',indices(p.prizes,()=>true,'prize'),'Choose a face-down Prize position to exchange'))return;
 }
 if(name==='Shift'){
  const types=[...new Set(g.players.flatMap(player=>own(player).filter(x=>x!==u).flatMap(x=>card(x.id).types||[])))].filter(t=>t!=='Colorless');
  if(choose('type',types.map((t,i)=>({id:`type:${i}`,label:t})),'Choose a Pokémon type'))return;
  d.shiftType=types[selected(plan,'type')[0]];
 }
 if(name==='Cowardice'&&u.playedTurn>=g.round)throw Error('Cowardice cannot be used on the first turn in play');
 if(name==='Buzzap'){
  const colors=['Grass','Fire','Water','Lightning','Psychic','Fighting'];
  if(choose('type',colors.map((t,i)=>({id:`type:${i}`,label:t})),'Choose Energy type'))return;
  d.buzzType=colors[selected(plan,'type')[0]];
  if(choose('target',slotList(p,x=>x!==u),'Choose recipient of Buzzap'))return;
 }
 if(name==='Peek'){
  if(choose('peek', [{id:'peek:0',label:'Your top deck card'},{id:'peek:1',label:'Opponent top deck card'},{id:'peek:2',label:'Opponent random hand card'},{id:'peek:3',label:'Your Prize'},{id:'peek:4',label:'Opponent Prize'}],'Choose private information'))return;
  const mode=selected(plan,'peek')[0];
  if(mode===3||mode===4){
   const owner=mode===3?p:f;
   if(owner.prizes.length&&choose('peekPrize',indices(owner.prizes,()=>true,'prize'),'Choose a face-down Prize position to inspect'))return;
  }
 }
 if(name==='Summon Minions'){
  const items=indices(p.deck,isBasicPokemon,'deck'),count=Math.min(2,5-p.bench.length,items.length);
  if(count&&choose('deck',items,'Choose up to two Basic Pokémon',{min:0,max:count,optional:true}))return;
 }
 if(name==='Sneak Attack'&&choose('target',slotList(f),'Choose Pokémon to damage',{optional:true}))return;
 if(name==='Reel In'){
  const items=indices(p.discard,c=>c.supertype==='Pokémon','discard'),count=Math.min(3,items.length);
  if(count&&choose('discard',items,'Recover up to 3 Pokémon',{min:0,max:count,optional:true}))return;
 }
 doPower(g,plan,h);
}
function take(arr,inds){return [...inds].sort((a,b)=>b-a).map(i=>({i,id:arr.splice(i,1)[0]})).sort((a,b)=>a.i-b.i).map(x=>x.id);}
function doPower(g,plan,h){
 const side=plan.side,p=g.players[side],f=g.players[1-side],u=pokemon(p,plan.slot),d=plan.data,name=plan.name;
 const s=k=>selected(plan,k)[0];
 const donor=key=>pokemon(p,s(key));
 const once=ONCE.has(name)&&plan.source!=='evolution';
 if(once){
  if(u.powerUsed?.[name]===g.turnSerial&&!(name==='Special Delivery'&&d.deliveryDrawn))
   throw Error('Power already used this turn');
  (u.powerUsed ||= {})[name]=g.turnSerial;
 }
 switch(name){
  case 'Gaze':{
   const target=f.bench[s('gaze')];
   if(!target||!powerNames(target).length)throw Error('Invalid Gaze target');
   target.gazeSuppressedUntil=g.turnSerial+1;
   break;
  }
  case 'Submerge':{
   u.submergeUntil=g.turnSerial+1;
   break;
  }
  case '[Bear]':{
   const donor=pokemon(p,s('source'));
   if(!donor||donor===u||donor.damage<10)throw Error('Invalid [Bear] damage source');
   donor.damage-=10;u.damage+=10;
   break;
  }
  case '[Yield]':{
   if(d.coin){
    if(selected(plan,'energy').length){
     const id=take(p.deck,[s('energy')])[0];
     pokemon(p,s('target')).energies.push(id);
    }
    p.deck=h.shuffle(g,p.deck);
   }
   break;
  }
  case 'Cunning':{
   if(d.coin&&s('shuffle')===1)f.deck=h.shuffle(g,f.deck);
   break;
  }
  case 'Solar Power':{
   // Healing the Special Conditions of both Active Pokémon does not heal damage.
   STATUS.clearConditions(p.active);
   STATUS.clearConditions(f.active);
   break;
  }
  case 'Observe':{
   // The five cards must remain in their original order. Only the user sees names.
   const top=f.deck.slice(-5).reverse().map(id=>card(id).name);
   (p.privateLog ||= []).push('Observe — top '+top.length+
     ' opposing deck card(s), next draw first: '+(top.join(', ')||'(none)'));
   break;
  }
  case 'Special Delivery':{
   p.deck.push(...take(p.hand,[s('hand')]));
   break;
  }
  case '[Find]':case '[Join]':{
   const picked=take(p.deck,[s('deck')])[0];
   p.hand.push(picked);
   p.deck=h.shuffle(g,p.deck);
   h.log(g,card(u.id).name+' showed '+card(picked).name+' from a deck search.');
   break;
  }
  case '[Help]':{
   const count=p.hand.length;
   p.deck=h.shuffle(g,[...p.deck,...p.hand]);
   p.hand=[];
   h.draw(g,side,count);
   break;
  }
  case 'Berserk':{
   const target=d.coin?f:p;
   for(let i=0;i<5&&target.deck.length;i++)target.discard.push(target.deck.pop());
   break;
  }
  case 'Downpour':{
   const i=s('energy');if(card(p.hand[i])?.name!=='Water Energy')throw Error('Downpour needs Water Energy');
   p.discard.push(...take(p.hand,[i]));break;
  }
  case 'Fire Recharge':{
   if(d.coin&&have(plan,'energy')&&have(plan,'target')){
    const i=s('energy'),target=pokemon(p,s('target'));
    if(card(p.discard[i])?.name!=='Fire Energy'||!target||!card(target.id).types?.includes('Fire'))throw Error('Invalid Fire Recharge target');
    target.energies.push(...take(p.discard,[i]));
   }break;
  }
  case 'Fire Boost':{
   if(selected(plan,'accept').length&&d.coin){
    const picks=selected(plan,'fire');
    if(picks.length>4||new Set(picks).size!==picks.length||picks.some(i=>card(p.deck[i])?.name!=='Fire Energy'))throw Error('Invalid Fire Boost Energy search');
    u.energies.push(...take(p.deck,picks));p.deck=h.shuffle(g,p.deck);
   }break;
  }
  case 'Glaring Gaze':{
   if(d.coin){
    (p.privateLog ||= []).push('Glaring Gaze: opponent hand — '+f.hand.map(id=>card(id).name).join(', '));
    if(selected(plan,'trainer').length){
     const i=s('trainer');if(card(f.hand[i])?.supertype!=='Trainer')throw Error('Invalid Glaring Gaze selection');
     f.deck=h.shuffle(g,[...f.deck,...take(f.hand,[i])]);
    }
   }break;
  }
  case '[Engage]':{
   if(s('oppEngage')===1){f.deck=h.shuffle(g,[...f.deck,...f.hand]);f.hand=[];h.draw(g,1-side,4);}
   if(s('ownEngage')===1){p.deck=h.shuffle(g,[...p.deck,...p.hand]);p.hand=[];h.draw(g,side,4);}
   break;
  }
  case '[Search]':(p.privateLog ||= []).push('Unown Search: Prize '+(s('prize')+1)+' is '+card(p.prizes[s('prize')]).name);break;
  case '[Tell]':if(h.flip(g)){
   (p.privateLog ||= []).push('Unown Tell: opponent hand — '+f.hand.map(id=>card(id).name).join(', '));
   (f.privateLog ||= []).push('Unown Tell: your opponent hand — '+p.hand.map(id=>card(id).name).join(', '));
  }break;
  case 'Tag Team':if(plan.slot>=0&&p.active){p.active.damage=Math.max(0,p.active.damage-30);const old=p.active;p.active=p.bench.splice(plan.slot,1,old)[0];STATUS.clearConditions(old);h.clearBenchEffects(old);}break;
  case '[Increase]':{
   if(selected(plan,'unown').length){if(p.bench.length>=5)throw Error('Increase Bench full');
    const idx=s('unown'),id=p.deck[idx];if(!card(id).name.startsWith('Unown')||!card(id).subtypes?.includes('Basic'))throw Error('Increase target is not Unown Basic');
    p.bench.push(h.unit(take(p.deck,[idx])[0],g.round));}
   p.deck=h.shuffle(g,p.deck);break;
  }
  case 'Energy Evolution':{
   if(selected(plan,'evolution').length){const idx=s('evolution'),evolved=card(p.deck[idx]);if(evolved.evolvesFrom!=='Eevee'||!evolved.types?.includes(plan.energyType))throw Error('Illegal Energy Evolution');
    u.under.unshift(u.id);u.id=take(p.deck,[idx])[0];u.playedTurn=g.round;STATUS.clearConditions(u);h.clearBenchEffects(u);}
   p.deck=h.shuffle(g,p.deck);break;
  }
  case 'Revive Fossil':case 'Revive Friends':{if(d.coin&&selected(plan,'fossil').length){const idx=s('fossil'),id=p.deck[idx];if(name==='Revive Friends'?card(id).name!=='Kabuto':!['Omanyte','Kabuto','Aerodactyl'].includes(card(id).name))throw Error('Illegal Fossil search');
   p.bench.push(h.unit(take(p.deck,[idx])[0],g.round));}if(d.coin)p.deck=h.shuffle(g,p.deck);break;}
  case 'Shapeshift':{
   if(u.gymShapeshiftCard){p.discard.push(u.gymShapeshiftCard);delete u.gymShapeshiftCard;}
   else {const i=s('evolution'),e=card(p.hand[i]);if(e.supertype!=='Pokémon'||!e.subtypes?.some(t=>t==='Stage 1'||t==='Stage 2'))throw Error('Shapeshift needs an Evolution');u.gymShapeshiftCard=p.hand.splice(i,1)[0];u.gymShapeshiftUsed=g.turnSerial;}
   break;
  }
  case 'Fragrance Trap':if(d.roll&&selected(plan,'bench').length){const ix=s('bench');if(!f.bench[ix])throw Error('Fragrance Trap target vanished');const old=f.active;f.active=f.bench.splice(ix,1,old)[0];STATUS.clearConditions(old);h.clearBenchEffects(old);}break;
  case 'Soak Up':{
   const groups=new Map();for(const x of d.grass){const [_,slot,index]=x.split(':').map(Number);if(!groups.has(slot))groups.set(slot,[]);groups.get(slot).push(index);}
   for(const [slot,indices] of groups){const donor=pokemon(p,slot);for(const ix of indices.sort((a,b)=>b-a)){if(card(donor.energies[ix])?.name!=='Grass Energy')throw Error('Soak Up must move Grass Energy');u.energies.push(donor.energies.splice(ix,1)[0]);}}
   break;
  }
  case 'Natural Healing':u.damage=Math.max(0,u.damage-10);break;
  case 'Playful Punch':{
   if(h.flip(g)){const target=f.active;target.damage+=h.calculateDamage(card(u.id),card(target.id),20,target);h.knockOuts(g,'direct');}
   if(!g.over&&!g.pendingDecision)h.finishTurn(g);
   break;
  }
  case 'Rain Dance':p.hand.splice(s('energy'),1).forEach(id=>pokemon(p,s('target')).energies.push(id));break;
  case 'Energy Trans':pokemon(p,s('target')).energies.push(...take(donor('source').energies,[s('energy')]));break;
  case 'Gather Fire':u.energies.push(...take(donor('source').energies,[s('energy')]));break;
  case 'Energy Burn':u.energyBurnUntil=g.turnSerial+1;break;
  case 'Energy Charge':{const from=donor('source');u.energies.push(...take(from.energies,[s('energy')]));break;}
  case 'Emerge':if(d.roll&&selected(plan,'evolution').length){u.under.unshift(u.id);u.id=take(p.deck,[s('evolution')])[0];u.playedTurn=g.round;STATUS.clearConditions(u);h.clearBenchEffects(u);p.deck=h.shuffle(g,p.deck);}break;
  case 'Call the Boss':if(selected(plan,'trainer').length){p.hand.push(...take(p.deck,[s('trainer')]));p.deck=h.shuffle(g,p.deck);}break;
  case 'Damage Swap':case 'Strange Behavior':case 'Curse':{
   const who=name==='Curse'?f:p,source=pokemon(who,s('source')),target=name==='Strange Behavior'?u:pokemon(who,s('target'));
   if(target.damage+10>=Number(card(target.id).hp)&&name!=='Curse')throw Error('Damage movement would knock out Pokémon');
   source.damage-=10;target.damage+=10;if(name==='Curse')h.knockOuts(g,'direct');break;
  }
  case 'Heal':if(h.flip(g))pokemon(p,s('target')).damage=Math.max(0,pokemon(p,s('target')).damage-10);break;
  case 'Step In':{const old=p.active;p.active=p.bench.splice(plan.slot,1,old)[0];STATUS.clearConditions(old);h.clearBenchEffects(old);break;}
  case 'Cowardice':{
   const removed=plan.slot===-1?(p.active=null,u):p.bench.splice(plan.slot,1)[0];p.hand.push(removed.under.length?removed.under.at(-1):removed.id);
   p.discard.push(...[removed.id,...removed.under.slice(0,-1),...removed.energies,...removed.attachedTrainers.map(x=>x.id)].filter((_,i)=>!(!removed.under.length&&i===0)));
   if(plan.slot===-1){if(!p.bench.length){g.over=true;g.winner=1-side;}else {g.pendingPromotions=[side];g.promotionAfter='direct';h.finishPromotions(g);}}break;
  }
  case '[Laugh]':if(h.flip(g)){p.deck=h.shuffle(g,p.deck);f.deck=h.shuffle(g,f.deck);}break;
  case 'Pollen Stench':h.applyCondition(g,h.flip(g)?f.active:p.active,'Confused');break;
  case 'Long Distance Hypnosis':h.applyCondition(g,h.flip(g)?f.active:p.active,'Asleep');break;
  case 'Evolutionary Light':p.hand.push(...take(p.deck,[s('deck')]));p.deck=h.shuffle(g,p.deck);break;
  case 'Matter Exchange':p.discard.push(...take(p.hand,[s('hand')]));h.draw(g,side);break;
  case 'Trickery':{
   const idx=s('prize');
   [p.prizes[idx],p.deck[p.deck.length-1]]=[p.deck[p.deck.length-1],p.prizes[idx]];
   // The replacement Prize is face down even if the old Prize was revealed.
   if(p.prizeFaceUp)p.prizeFaceUp[idx]=false;
   break;
  }
  case 'Shift':u.shiftType=d.shiftType;break;
  case 'Buzzap':{
   const destination=pokemon(p,s('target'));destination.energies.push(u.id);destination.buzzapTypes ||= {};destination.buzzapTypes[u.id]=d.buzzType;
   if(plan.slot===-1)p.active=null;else p.bench.splice(plan.slot,1);
   p.discard.push(...u.under,...u.energies,...u.attachedTrainers.map(x=>x.id));
   if(f.prizes.length)f.hand.push(f.prizes.pop());
   if(plan.slot===-1){if(!p.bench.length){g.over=true;g.winner=1-side;}else{g.pendingPromotions=[side];g.promotionAfter='direct';h.finishPromotions(g);}}break;
  }
  case 'Peek':{
   const mode=s('peek');const owner=mode===0||mode===3?p:f;const id=mode<2?owner.deck.at(-1):mode===2?(f.hand.length?f.hand[h.random(g,f.hand.length)]:null):owner.prizes[s('peekPrize')??0];
   (p.privateLog ||= []).push(id?`Peek: ${card(id).name}`:'Peek: no card');break;
  }
  case 'Summon Minions':if(have(plan,'deck')){for(const id of take(p.deck,selected(plan,'deck')))p.bench.push(h.unit(id,g.round));p.deck=h.shuffle(g,p.deck);}break;
  case 'Sneak Attack':if(have(plan,'target')&&d.target.length){const target=pokemon(f,s('target'));target.damage+=h.calculateDamage(card(u.id),card(target.id),10,target);h.knockOuts(g,'direct');}break;
  case 'Reel In':if(have(plan,'discard'))p.hand.push(...take(p.discard,selected(plan,'discard')));break;
  default:throw Error(`Unported Power ${name}`);
 }
 h.log(g,`${p.name} activated ${name}.`);
}
const ONCE=new Set(['Fragrance Trap','Soak Up','Natural Healing','Playful Punch','Emerge','Gather Fire','Heal','Step In','Curse','Shift','Evolutionary Light','Matter Exchange','Pollen Stench','Long Distance Hypnosis','Trickery','Peek','Revive Fossil','Revive Friends','Fire Recharge','Glaring Gaze','[Search]','[Tell]','[Laugh]','Solar Power','Observe','Special Delivery','[Find]','[Help]','[Join]','[Bear]','[Yield]','Cunning','Gaze','Submerge']);
const ACTIVATED=new Set(['Shapeshift','Fragrance Trap','Soak Up','Natural Healing','Playful Punch','Emerge','Energy Charge','Rain Dance','Energy Trans','Gather Fire','Energy Burn','Damage Swap','Curse','Strange Behavior','Heal','Step In','Cowardice','Evolutionary Light','Matter Exchange','Pollen Stench','Long Distance Hypnosis','Trickery','Shift','Peek','Buzzap','Revive Fossil','Revive Friends','Downpour','Fire Recharge','Glaring Gaze','[Search]','[Tell]','[Laugh]','Solar Power','Observe','Special Delivery','[Find]','[Help]','[Join]','[Bear]','[Yield]','Cunning','Gaze','Submerge']);
const ONPLAY=new Set(['Call the Boss','Summon Minions','Sneak Attack','Reel In','[Increase]','[Engage]','Tag Team','Berserk','Fire Boost']);
const PASSIVE=new Set(['Rebirth','Energy Drain','Scram','Shock Blast','Gaseous Form','Healing Fire','Fortitude','Pollen Defense','Restless Sleep','Strange Barrier','Prehistoric Power','Toxic Gas','Hay Fever','Invisible Wall','Kabuto Armor','Transparency','Transform','Thick Skinned','Retreat Aid','Sticky Goo','Clairvoyance','Frenzy','Strikes Back','Sinkhole','Final Beam','Hydroelectric Power','Anger','Frog Song','Spikes','Energy Evolution','[Normal]','Magma Pool','Hot Plate','Psylink','Flee','Bench Guard','Shell Armor','Photosynthesis','Relaxing Scent','Rebellion','Darkness']);
const UNSUPPORTED=new Set();
function begin(g,side,payload,h){
 const slot=payload.slot;if(!Number.isInteger(slot))throw Error('Power requires a Pokémon slot');const u=pokemon(g.players[side],slot);if(!u)throw Error('Missing Pokémon');
 const available=powerNames(u),index=payload.powerIndex??0,name=available[index];if(!name||!ACTIVATED.has(name))throw Error('No migrated activated Power at this slot');
 if(!enabled(g,u,name))throw Error('Power disabled by status or suppression');
 return powerPlan(g,{side,slot,unitId:u.id,name,data:{},source:'activated'},h);
}
function attached(g,side,slot,energyId,h){
 const u=pokemon(g.players[side],slot);if(!u||!enabled(g,u,'Energy Evolution'))return;
 const name=card(energyId).name,energyType=name.endsWith(' Energy')?name.slice(0,-7):null;
 if(!energyType||!['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'].includes(energyType))return;
 const heads=h.flip(g);if(!heads)return;
 return powerPlan(g,{side,slot,unitId:u.id,name:'Energy Evolution',energyType,data:{},source:'attachment'},h);
}
function played(g,side,slot,h){const u=pokemon(g.players[side],slot);for(const name of powerNames(u))if(ONPLAY.has(name)&&!blocked(g,name))return powerPlan(g,{side,slot,unitId:u.id,name,data:{},source:'evolution'},h);}
function movedToBench(g,side,oldActive,newActive,h){
 if(!oldActive||!newActive||!enabled(g,oldActive,'Magma Pool'))return;
 const i=oldActive.energies.findIndex(id=>card(id).name==='Fire Energy');
 if(i>=0)newActive.energies.push(oldActive.energies.splice(i,1)[0]);
}
function benched(g,side,incoming,h){
 if(!incoming)return;
 for(const p of g.players){const u=p.active;
  if(enabled(g,u,'Hot Plate')){incoming.damage+=10;h.log(g,'Dark Magcargo Hot Plate damaged a newly Benched Basic Pokémon.');}
 }
 if(incoming.damage>=Number(card(incoming.id).hp))h.knockOuts(g,'direct');
}
function answer(g,plan,response,h){const data={...plan.data,[plan.await]:response.decline?[]:[...response.selected]};return powerPlan(g,{...plan,data,await:null},h);}
module.exports={ACTIVATED,ONPLAY,PASSIVE,UNSUPPORTED,enabled,powerInPlay,protectsStatus,begin,played,attached,answer,movedToBench,benched};
