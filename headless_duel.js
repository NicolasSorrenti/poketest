'use strict';
// Server-side duel slice. Serializable, deterministic and independent of browser/CPU.
// Unported attack/Power effects are REJECTED, not silently treated as plain damage.
const {isBasicPokemon,isBasicEnergy,isEnergy,canEvolve,canPayEnergy,legalAttachment,validateDeck}=require('./core_rules');
const {makeDecision,validateAnswer}=require('./decision_core');
const {validateCommand}=require('./duel_protocol');
const crypto=require('node:crypto');
const ATTACK=require('./attack_effects_core');
const STATUS=require('./special_conditions_core');
const BERRIES=require('./neo_berry_rules');
const CLASSIC=require('./classic_format');
const CLASSIC_TRAINERS=require('./classic_trainer_core');
const CLASSIC_POWERS=require('./classic_power_core');
const isClassicRules=g=>['classic','theme-expanded','gym-theme','gym-expanded','neo-theme','online-preview'].includes(g.format);
const ATTACH_ONLY_TRAINERS=new Set(['PlusPower','Defender','Berry','Counterattack Claws','Focus Band','EXP.ALL','Gold Berry','Miracle Berry','Balloon Berry','Magnifier','Charity',"Brock's Protection","Koga's Ninja Trick","Sabrina's ESP",'Clefairy Doll','Mysterious Fossil']);
const protectedEnergy=u=>Boolean(u?.attachedTrainers?.some(t=>t.id==='gym2-101'));
const isBaby=(g,u)=>['neo-theme','online-preview'].includes(g.format)&&u&&!u.secretPlanFaceDown&&['Elekid','Magby','Tyrogue','Igglybuff','Cleffa','Pichu','Smoochum'].includes(CATALOG.get(u.id)?.name);

const SET_NAMES=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'];
function historicalCards(){return SET_NAMES.flatMap(s=>require('./cards/'+s+'.json'));}
const CATALOG=new Map(historicalCards().map(c=>[c.id,c]));
const SECRET_BASIC=Object.freeze({id:'secret-plan-facedown',name:'Face-down Pokémon',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],hp:'10',attacks:[],abilities:[],retreatCost:[],weaknesses:[],resistances:[]});
function fail(message){throw Error(message);}
function requireInt(v,name){if(!Number.isSafeInteger(v))fail(`Invalid ${name}`);return v;}
function randomRaw(g,n){
 if(!Number.isSafeInteger(n)||n<=0)fail('Invalid random range');
 g.rngState=(Math.imul(g.rngState,1664525)+1013904223)>>>0;
 return Math.floor((g.rngState/0x100000000)*n);
}
function next(g,n){
 const result=randomRaw(g,n);
 // Shuffle calls randomRaw directly, so shuffling two remaining cards is not a coin toss.
 if(n===2&&g.phase==='game'){
  g.coinSeq=(g.coinSeq||0)+1;
  (g.coinFlips ||= []).push({seq:g.coinSeq,result:result?'heads':'tails'});
  if(g.coinFlips.length>100)g.coinFlips.shift();
  log(g,`🪙 Coin flip: ${result?'HEADS':'TAILS'}.`);
 }
 return result;
}
function shuffle(g,a){const arr=[...a];for(let i=arr.length-1;i>0;i--){const j=randomRaw(g,i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function log(g,message){g.message.unshift(String(message));g.message.length=Math.min(g.message.length,120);if(g.format==='online-preview'){(g.matchFeed ||= []).push({seq:(g.feedSeq=(g.feedSeq||0)+1),kind:'message',text:String(message)});if(g.matchFeed.length>150)g.matchFeed.shift();}}
function card(g,id){const result=CATALOG.get(id);if(!result)fail(`Unknown card ${String(id)}`);return result;}
// A named Energy requirement on an ATTACHED card checks the type it
// supplies in play, not the cardboard's printed name. WotC Rainbow counts
// as every Basic Energy type; Neo Destiny Miracle counts as every type.
function attachedEnergyMatchesType(g,id,type){
 if(!type)return true;
 const name=card(g,id).name;
 return name===type+' Energy'||name==='Rainbow Energy'||name==='Miracle Energy';
}
function unit(id,round=0){return {id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:round};}
function allPokemon(p){return [p.active,...p.bench].filter(Boolean);}
function hasActiveEffect(u,key,g){return Boolean(u&&u[key]&&u[key].expires>g.turnSerial);}
function clearBenchEffects(u){
 for(const key of ['shield','attackPenalty','noRetreat','attackLock','reactiveShield','swordsDance','amnesia','mirrorShell','destinyBond','lastAttackImpact','screech','noSwitch','gymGiantGrowth','gymInkSpurt','gymShadowImages','gymFireWall','gymCrosscounter','neo48Growl','neo48Slime','neo48PollenShieldUntil','neo48Endure','neo48MeanLook','neo48EndureUsed','neo48SlimeUntil','neo48CrunchUntil','neo49LockOn','neo49LockTarget','neo49Pursuit','neo49CounterUntil','neo49PoisonUntil','neo50LastAttack','neo50Observed'])delete u[key];
}
function familyCandidates(g,side,restriction){
 const p=g.players[side];return p.deck.flatMap((id,i)=>{
  const c=card(g,id);if(!isBasicPokemon(c))return [];
  if(restriction==='Fighting'&&!c.types?.includes('Fighting'))return [];
  if(restriction&&restriction!=='Fighting'){
   const allowed=restriction==='Nidoran M or Nidoran F'?['Nidoran♂','Nidoran♀','Nidoran M','Nidoran F']:[restriction];
   if(!allowed.includes(c.name))return [];
  }
  return [{id,index:i,name:c.name}];
 });
}
function publicName(g,u){return u?.secretPlanFaceDown?'Face-down Pokémon':card(g,u.id).name;}
function exactAttackSubject(program,c){
 const kinds=['bench-both-recoil','recoil','coin-recoil','switch-self','coin-recoil-bonus','own-counters','flail-counters','minus-counters','coin-self-confuse','coin-times-confuse','coin-status-recoil','drain','leech-seed','coin-shield','damage-shield','coin-attack-lock','coin-heal-one','water-extra','extra-energy','energy-coins','discard-all-self-energy','once-per-unit','swords-dance','thunderstorm','reactive-shield','recover-discard','recoil-coin-shield','optional-switch-self','rampage','vanish','conversion2','wildfire','energy-conversion','rapid-evolution','afternoon-nap'];
 if(kinds.includes(program.kind)&&program.subject!==undefined&&program.subject!==c.name)fail('Attack effect subject does not match its user');
}

function extraAttackEnergy(g,unit,attack,type){
 const required=attack.cost||[], cards=unit.energies.map(id=>card(g,id));
 if(type==='Water'){
  const water=cards.filter(x=>x.name==='Water Energy').length;
  const waterRequired=required.filter(x=>x==='Water').length;
  const others=cards.reduce((n,x)=>n+(x.name==='Double Colorless Energy'?2:x.name==='Water Energy'?0:1),0);
  const colorless=required.filter(x=>x==='Colorless').length;
  return Math.max(0,water-waterRequired-Math.max(0,colorless-others));
 }
 return Math.max(0,cards.length-required.length);
}
function effectiveCard(g,u){
 if(u?.secretPlanFaceDown)return SECRET_BASIC;
 const printed=card(g,u.id);
 if(isClassicRules(g)&&u.gymShapeshiftCard){
  const mimicked=card(g,u.gymShapeshiftCard);
  return {...mimicked,id:printed.id,abilities:printed.abilities};
 }
 if(isClassicRules(g)&&u.under?.length){
  const side=g.players.findIndex(p=>allPokemon(p).includes(u));
  if(side>=0&&g.players[side].recallUntil>g.turnSerial)
   return {...printed,attacks:[...(printed.attacks||[]),...u.under.flatMap(id=>card(g,id).attacks||[])]};
 }
 if(isClassicRules(g)&&printed.name==="Sabrina's Alakazam"&&CLASSIC_POWERS.enabled(g,u,'Psylink')){
  const owner=g.players.findIndex(p=>allPokemon(p).includes(u));
  if(owner>=0){const others=allPokemon(g.players[owner]).filter(x=>x!==u&&!x.secretPlanFaceDown&&card(g,x.id).types?.includes('Psychic'));
   return {...printed,attacks:[...(printed.attacks||[]),...others.flatMap(x=>card(g,x.id).attacks||[])]};}
 }

 if(!isClassicRules(g)||printed.name!=='Ditto'||!CLASSIC_POWERS.enabled(g,u,'Transform'))return printed;
 const owner=g.players.findIndex(p=>p.active===u);if(owner<0)return printed;
 const opponent=g.players[1-owner].active;if(!opponent)return printed;
 const mirror=card(g,opponent.id);
 // Two active Dittos are not recursively transformed into one another.
 if(mirror.name==='Ditto')return printed;
 return {...mirror, id:printed.id, name:mirror.name, abilities:printed.abilities};
}
function unownNormal(g,side){
 const copies=g.players.flatMap(allPokemon).filter(x=>card(g,x.id).id==='neo2-50');
 return copies.length===1&&allPokemon(g.players[side]).includes(copies[0])&&CLASSIC_POWERS.enabled(g,copies[0],'[Normal]');
}
function maxHP(g,u){const base=u.gymGiantGrowth&&u.id==='gym2-10'?80:Number(effectiveCard(g,u).hp)||0;return base+(isClassicRules(g)&&CLASSIC_POWERS.enabled(g,u,'Gaseous Form')?u.energies.filter(id=>card(g,id).name==='Psychic Energy').length*10:0)+(!u.secretPlanFaceDown&&g.stadium&&card(g,g.stadium.id).name==="Rocket's Hideout"&&card(g,u.id).name.startsWith('Dark ')?20:0);}
function draw(g,side,count=1,required=false){const p=g.players[side];for(let i=0;i<count;i++){if(!p.deck.length){if(required){g.over=true;g.winner=1-side;log(g,`${p.name} cannot draw at the start of turn.`);}return;}p.hand.push(p.deck.pop());}}
function setupHand(g,p){let retries=0;while(retries++<200){p.deck=shuffle(g,[...p.deck,...p.hand]);p.hand=[];for(let i=0;i<7;i++)p.hand.push(p.deck.pop());if(p.hand.some(id=>isBasicPokemon(card(g,id))))break;}
 if(!p.hand.some(id=>isBasicPokemon(card(g,id))))fail(`${p.name} has no Basic Pokémon`);
 p.mulligans=retries-1;
}
function createGame({decks,names=['Player 1','Player 2'],seed=1,format='unrestricted',deckSize=60,prizeCount=6}={}){
 if(!Array.isArray(decks)||decks.length!==2||!decks.every(Array.isArray))fail('Two decks are required');
 if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)fail('Invalid shuffle seed');
 if(!['unrestricted','classic','theme-expanded','gym-theme','gym-expanded','neo-theme','online-preview'].includes(format))fail('Unknown duel format');
 if(!((deckSize===60&&prizeCount===6)||(format==='online-preview'&&deckSize===40&&prizeCount===4)))fail('Unsupported deck and Prize configuration');
 const game={format,deckSize,prizeCount,phase:'setup',turn:0,round:1,turnSerial:0,over:false,winner:null,players:[],setupReady:[false,false],message:[],pendingDecision:null,pendingAction:null,nextDecisionId:0,rngState:seed>>>0,events:[]};
 for(let side=0;side<2;side++){
  const v=deckSize===40?validateDeck(decks[side],CATALOG,{size:40}):format==='classic'?CLASSIC.validateDeck(decks[side],CATALOG):format==='gym-theme'?CLASSIC.validateDeck(decks[side],CATALOG,{gym:true}):format==='gym-expanded'?CLASSIC.validateDeck(decks[side],CATALOG,{gymFull:true}):format==='neo-theme'?CLASSIC.validateDeck(decks[side],CATALOG,{neo:true}):format==='online-preview'?CLASSIC.validateDeck(decks[side],CATALOG,{gymFull:true,neo:true}):format==='theme-expanded'?CLASSIC.validateDeck(decks[side],CATALOG,{reprint:true}):validateDeck(decks[side],CATALOG);if(!v.valid)fail(`Invalid deck ${side}: ${v.errors.join('; ')}`);
  const p={name:String(names[side]||`Player ${side+1}`),deck:[...decks[side]],hand:[],prizes:[],discard:[],active:null,bench:[],energyUsed:false,retreated:false,turnPlays:[],mulligans:0};
  game.players.push(p);setupHand(game,p);
 }
 return game;
}
function revealSecretPlan(g,side,slot){
 const p=g.players[side],u=located(p,slot);if(!u?.secretPlanFaceDown)fail('No face-down Secret Plan Pokémon in that slot');
 const actual=card(g,u.id);u.secretPlanFaceDown=false;
 log(g,`${p.name} revealed ${actual.name} from Secret Plan.`);
 if(!isBasicPokemon(actual)){
  p.discard.push(u.id,...u.under,...u.energies,...u.attachedTrainers.map(t=>t.id));
  if(slot===-1)p.active=null;else p.bench.splice(slot,1);
  return false;
 }return true;
}
function located(p,slot){return slot===-1?p.active:p.bench[slot];}
function safeSlot(p,slot){requireInt(slot,'slot');if(slot< -1||slot>=p.bench.length)fail('Invalid Pokémon slot');const pokemon=located(p,slot);if(!pokemon)fail('Missing Pokémon');return pokemon;}
function handCard(g,p,index){requireInt(index,'hand index');if(index<0||index>=p.hand.length)fail('Invalid hand index');return card(g,p.hand[index]);}
function requireMigratedEffects(g){
 // Stadium rules in curated Gym decks are handled selectively below; optional effects are opt-in.
 if(isClassicRules(g)){
  for(const p of g.players)for(const u of allPokemon(p))for(const a of (card(g,u.id).abilities||[]))
   if(a.name&&!['gym-theme','gym-expanded','neo-theme','online-preview'].includes(g.format)&&![...CLASSIC_POWERS.ACTIVATED,...CLASSIC_POWERS.ONPLAY,...CLASSIC_POWERS.PASSIVE].includes(a.name))fail('Unported Pokémon Power: '+a.name);
  return;
 }
 for(const p of g.players)for(const u of allPokemon(p))if((card(g,u.id).abilities||[]).length)fail('An in-play Pokémon Power requires an effect handler');
}
function applyCondition(g,u,status){
 if(u.neo48PollenShieldUntil>g.turnSerial&&['Asleep','Confused','Paralyzed','Poisoned'].includes(status))return;
 if(isClassicRules(g)&&CLASSIC_POWERS.protectsStatus(g,u))return;
 STATUS.applyCondition(u,status);
 if(u.gymShapeshiftCard&&['Asleep','Confused','Paralyzed'].includes(status)){
  const owner=g.players.find(p=>allPokemon(p).includes(u));if(owner)owner.discard.push(u.gymShapeshiftCard);
  delete u.gymShapeshiftCard;
 }
}
function classicHelpers(){return {flip:g=>next(g,2)===1,random:randomRaw,shuffle,draw,log,unit,clearBenchEffects,knockOuts,finishPromotions,finishTurn,calculateDamage,applyCondition,onPlay:(g,side,slot)=>CLASSIC_POWERS.played(g,side,slot,classicHelpers())};}
function retreatCost(g,side,u){
 const owner=g.players[side],enemy=g.players[1-side];
 const base=(effectiveCard(g,u).retreatCost||[]).length;
 if(!isClassicRules(g))return base;
 // Balloon Berry errata: this Pokémon's Retreat Cost is 0.
 if(u.attachedTrainers.some(t=>card(g,t.id).name==='Balloon Berry'))return 0;
 const aids=owner.bench.filter(x=>CLASSIC_POWERS.enabled(g,x,'Retreat Aid')).length;
 const gymSave=g.stadium&&card(g,g.stadium.id).name==='Cerulean City Gym'&&card(g,u.id).name.startsWith("Misty's ")?1:0;
 const sticky=CLASSIC_POWERS.enabled(g,enemy.active,'Sticky Goo')?2:0;
 const broken=g.stadium&&card(g,g.stadium.id).name==='Broken Ground Gym'&&
  (effectiveCard(g,u).subtypes||[]).some(t=>t==='Baby'||t==='Basic')?1:0;
 return Math.max(0,base-aids-gymSave)+sticky+(g.stadium&&card(g,g.stadium.id).name==="The Rocket's Training Gym"?1:0)+broken;
}
// Retreat pays printed Colorless energy units, not number of Energy cards.
// Historical Double Colorless/Miracle cards each provide two units; ordinary
// Energy cards (including Rainbow and Recycle) provide exactly one.
function retreatUnits(g,u,id){
 if(isClassicRules(g)&&CLASSIC_POWERS.enabled(g,u,'Photosynthesis'))return 1;
 if(u.buzzapTypes?.[id])return 2;
 const name=card(g,id).name;
 return name==='Double Colorless Energy'||name==='Miracle Energy'?2:1;
}
function jawClampLocks(g,side){const u=g.players[side].active;return Boolean(u?.noSwitch?.expires>g.turnSerial&&g.players[1-side].active?.id===u.noSwitch.sourceId);}
function allowTurn(g,side){if(g.phase!=='game'||g.over)fail('Duel is not active');if(side!==g.turn)fail('Not your turn');}
function specialEnergyCount(g,u,name){return u.energies.filter(id=>card(g,id).name===name+' Energy').length;}
function isDarkType(g,u){return effectiveCard(g,u).types?.includes('Darkness')||card(g,u.id).name.startsWith('Dark ');}
function isMetalType(g,u){return effectiveCard(g,u).types?.includes('Metal');}
function attackPool(g,u){const pool=[];
 for(const id of u.energies){
  // Erika's Oddish converts each attached Energy card into one Grass Energy,
  // including Double Colorless Energy, even while affected by a Condition.
  if(isClassicRules(g)&&CLASSIC_POWERS.enabled(g,u,'Photosynthesis')){pool.push('Grass');continue;}
  if(u.buzzapTypes?.[id]){pool.push(u.buzzapTypes[id],u.buzzapTypes[id]);continue;}
  if(isClassicRules(g)&&u.energyBurnUntil>g.turnSerial){pool.push('Fire');if(card(g,id).name==='Double Colorless Energy')pool.push('Fire');continue;}const c=card(g,id);if(['Grass Energy','Fire Energy','Water Energy','Lightning Energy','Psychic Energy','Fighting Energy'].includes(c.name))pool.push(c.name.slice(0,-7));
 else if(c.name==='Double Colorless Energy')pool.push('Colorless','Colorless');
 else if(c.name==='Rainbow Energy')pool.push('Any');
 else if(c.name==='Miracle Energy')pool.push('Any','Any');
 else if(['Recycle Energy','Full Heal Energy','Potion Energy'].includes(c.name))pool.push('Colorless');
 else if(c.name==='Darkness Energy')pool.push('Darkness');
 else if(c.name==='Metal Energy')pool.push('Metal');
 else fail(`Special Energy ${c.name} requires an effect handler`);
 }
 return pool;
}
// Decisions for historical Classic attacks are planned before effect resolution.
// The tentative plan lives in pendingAction and is committed only once its
// entire sequence has been answered. The regular reducer gives atomic rollback.
const GYM_LAST=require('./gym_last_attack_plan');
const gymLastHelpers=()=>({card,compile:ATTACK.compile,attack:(g,side,index)=>effectiveCard(g,g.players[side].active).attacks[index],resolve:ATTACK.resolve,flip:g=>next(g,2)===1,commit:(g,side,index,extra)=>resolveAttack(g,side,index,undefined,undefined,extra)});
const FINAL_KINDS=new Set(require('./classic_final_manifest.json').map(x=>x.kind));
function finalChoice(g,plan,stage,actor,options,{min=1,max=min,optional=false,label=stage}={}){
 if(!options.length&&!optional)fail('No legal options for '+stage);
 g.nextDecisionId++;
 g.pendingDecision=makeDecision({id:`final:${g.nextDecisionId}`,actor,kind:stage,label,options,min,max,optional});
 g.pendingAction={kind:'final_attack',plan:{...plan,stage}};
}
function planFinalAttack(g,side,attackIndex,program,plan={side,attackIndex,data:{}}){
 const p=g.players[side],f=g.players[1-side],u=p.active,a=effectiveCard(g,u).attacks[attackIndex],kind=program.kind, data=plan.data;
 const energyOptions=()=>u.energies.map((id,i)=>({id:`energy:${i}`,label:`${i+1}: ${card(g,id).name}`}));
 const benchOptions=(owner)=>owner.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)}));
 const finish=()=>resolveAttack(g,side,attackIndex, data.target, data.energyPicks,{...data,finalApproved:true});
 if(['barrier','destiny-bond','third-eye','scavenge'].includes(kind)&&!data.energyPicks){
  if(!u.energies.length)fail('An attached Energy is required for this attack');
  finalChoice(g,plan,'pay-energy',side,energyOptions(),{label:`${a.name}: choose an Energy to discard`});return;
 }
 if(kind==='scavenge'&&!Object.hasOwn(data,'discardTrainer')){
  const options=p.discard.flatMap((id,i)=>card(g,id).supertype==='Trainer'?[{id:`discard:${i}`,label:card(g,id).name}]:[]);
  if(!options.length)fail('No Trainer card in discard pile');
  finalChoice(g,plan,'recover-trainer',side,options,{label:'Choose the Trainer to recover'});return;
 }
 if(kind==='third-eye'&&!Object.hasOwn(data,'drawCount')){
  finalChoice(g,plan,'draw-count',side,Array.from({length:4},(_,i)=>({id:`count:${i}`,label:`Draw ${i} card${i===1?'':'s'}`})),{label:'Draw up to 3 cards'});return;
 }
 if(kind==='prophecy'&&!Object.hasOwn(data,'deckOwner')){
  finalChoice(g,plan,'prophecy-player',side,[{id:'side:0',label:g.players[0].name},{id:'side:1',label:g.players[1].name}],{label:'Choose a player’s deck'});return;
 }
 if(kind==='prophecy'&&!Object.hasOwn(data,'deckOrder')){
  const top=g.players[data.deckOwner].deck.slice(-3).reverse();
  if(!top.length){data.deckOrder=[];return finish();}
  finalChoice(g,plan,'prophecy-order',side,top.map((id,i)=>({id:`top:${i}`,label:`${card(g,id).name} (${i+1})`})),{min:top.length,max:top.length,label:'Arrange cards from TOP to BOTTOM'});return;
 }
 if(['copy-attack','amnesia'].includes(kind)&&!Object.hasOwn(data,'copyIndex')){
  // Never offer a copied attack which our reducer cannot actually execute.
  // Amnesia only disables an attack and can name any printed attack.
  const omitted=new Set(['copy-attack','mirror-move','drag-off',...FINAL_KINDS]);
  const options=(card(g,f.active.id).attacks||[]).flatMap((x,i)=>{
   const script=ATTACK.compile(x);
   if(kind==='copy-attack'&&(!script||omitted.has(script.kind)))return [];
   return [{id:`attack:${i}`,label:x.name}];
  });
  finalChoice(g,plan,'opponent-attack',side,options,{label:`${a.name}: choose the Defending Pokémon's attack`});return;
 }
 if(kind==='copy-attack'&&Object.hasOwn(data,'copyIndex')&&!Object.hasOwn(data,'target')){
  const copied=ATTACK.compile(card(g,f.active.id).attacks[data.copyIndex]);
  const wants=new Set(['bench-target','switch-self','switch-attacker','target-any','target-any-coin']);
  if(copied&&wants.has(copied.kind)){
   const owner=copied.kind==='switch-self'?p:f;
   if(owner.bench.length||copied.kind==='target-any'||copied.kind==='target-any-coin'){
    const options=benchOptions(owner);
    if(copied.kind==='target-any'||copied.kind==='target-any-coin')options.unshift({id:'bench:-1',label:'Active: '+publicName(g,f.active)});
    finalChoice(g,plan,'target-bench',side,options,{label:`${a.name}: choose target for copied ${card(g,f.active.id).attacks[data.copyIndex].name}`});return;
   }
  }
 }
 if(['stare'].includes(kind)&&!Object.hasOwn(data,'target')){
  const options=[{id:'bench:-1',label:`Active ${publicName(g,f.active)}`},...benchOptions(f)];
  finalChoice(g,plan,'target-pokemon',side,options,{label:'Stare: choose one opposing Pokémon'});return;
 }
 if(kind==='magnetic-lines'&&!protectedEnergy(f.active)&&f.active.energies.some(id=>card(g,id).subtypes?.includes('Basic')||/^(Grass|Fire|Water|Lightning|Psychic|Fighting) Energy$/.test(card(g,id).name))&&f.bench.length){
  if(!Object.hasOwn(data,'enemyEnergyIndex')){
   const options=f.active.energies.flatMap((id,i)=>/^(Grass|Fire|Water|Lightning|Psychic|Fighting) Energy$/.test(card(g,id).name)?[{id:`energy:${i}`,label:card(g,id).name}]:[]);
   finalChoice(g,plan,'magnetic-energy',side,options,{label:'Choose a Basic Energy to move'});return;
  }
  if(!Object.hasOwn(data,'target')){finalChoice(g,plan,'target-bench',side,benchOptions(f),{label:'Move the Energy to which opposing Benched Pokémon?'});return;}
 }
 if(kind==='energy-bomb'&&u.energies.length&&p.bench.length&&(!data.destinations||data.destinations.length<u.energies.length)){
  const index=data.destinations?.length||0;
  finalChoice(g,plan,'energy-destination',side,benchOptions(p),{label:`Energy Bomb: destination for Energy ${index+1} of ${u.energies.length}`});return;
 }
 if(['continuous-fireball','fireball','playing-with-fire','fascinate'].includes(kind)&&!data.preRoll){
  data.preRoll=ATTACK.resolve(program,()=>next(g,2)===1,{selfEnergy:u.energies.length});
 }
 if(['continuous-fireball','fireball','playing-with-fire'].includes(kind)&&data.preRoll.discardHeadCount>0&&!data.energyPicks){
  const qty=data.preRoll.discardHeadCount;
  finalChoice(g,plan,'pay-energy',side,energyOptions(),{min:qty,max:qty,label:`${a.name}: discard ${qty} Energy card(s)`});return;
 }
 if(kind==='fascinate'){
  if(!f.bench.length)fail('Fascinate requires an opposing Benched Pokémon');
  if(data.preRoll.flips[0]&&!Object.hasOwn(data,'target')){finalChoice(g,plan,'target-bench',side,benchOptions(f),{label:'Fascinate: choose opponent’s replacement'});return;}
 }
 if(kind==='flame-pillar'&&!Object.hasOwn(data,'energyPicks')&&!u.energies.length)data.energyPicks=[];
 if(kind==='flame-pillar'&&!Object.hasOwn(data,'energyPicks')){
  finalChoice(g,plan,'optional-energy',side,energyOptions(),{label:'Flame Pillar: optionally discard an Energy',optional:true});return;
 }
 if(kind==='flame-pillar'&&data.energyPicks.length>0&&f.bench.length&&!Object.hasOwn(data,'target')){
  finalChoice(g,plan,'target-bench',side,benchOptions(f),{label:'Flame Pillar: choose a Benched target'});return;
 }
 finish();
}
function answerFinalAttack(g,plan,answer){
 const v=answer.selected,stage=plan.stage,d=plan.data;
 if(stage==='pay-energy'||stage==='optional-energy')d.energyPicks=answer.decline?[]:v.map(x=>Number(x.slice(7)));
 else if(stage==='recover-trainer')d.discardTrainer=Number(v[0].slice(8));
 else if(stage==='draw-count')d.drawCount=Number(v[0].slice(6));
 else if(stage==='prophecy-player')d.deckOwner=Number(v[0].slice(5));
 else if(stage==='prophecy-order')d.deckOrder=v.map(x=>Number(x.slice(4)));
 else if(stage==='opponent-attack')d.copyIndex=Number(v[0].slice(7));
 else if(stage==='target-pokemon'||stage==='target-bench')d.target=Number(v[0].slice(6));
 else if(stage==='magnetic-energy')d.enemyEnergyIndex=Number(v[0].slice(7));
 else if(stage==='energy-destination'){(d.destinations ||= []).push(Number(v[0].slice(6)));}
 else fail('Unknown final attack decision stage');
 planFinalAttack(g,plan.side,plan.attackIndex,ATTACK.compile(effectiveCard(g,g.players[plan.side].active).attacks[plan.attackIndex]),{...plan,data:d});
}

// Shared interactive theme-deck attacks: every mutable selection is performed via
// an authoritative pending decision and then committed transactionally.
function themeAttackPlan(g,plan){
 const {side,attackIndex,data}=plan,p=g.players[side],f=g.players[1-side],u=p.active;
 const a=card(g,u.id).attacks[attackIndex],program=ATTACK.compile(a),kind=program?.effect;
 if(!kind||!program.kind.startsWith('theme:'))fail('Invalid theme attack');
 const prompt=(stage,actor,options,min,max,label,optional=false)=>{
  if(!options.length){if(min)fail('No legal options for '+label);data[stage]=[];return false;}
  if(data[stage]!==undefined)return false;
  g.nextDecisionId++;g.pendingDecision=makeDecision({id:`theme:${g.nextDecisionId}`,actor,kind:stage,label,options,min,max,optional});
  g.pendingAction={kind:'theme_attack',plan:{...plan,stage}};return true;
 };
 const energy=(owner,slot=-1)=>located(owner,slot).energies.map((id,i)=>({id:`energy:${i}`,label:card(g,id).name}));
 const bench=(owner)=>owner.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)}));
 const top=(ids,pred)=>ids.flatMap((id,i)=>pred(card(g,id))?[{id:`deck:${i}`,label:card(g,id).name}]:[]);
 const activeOptions=()=>[{id:'slot:-1',label:'Active: '+card(g,f.active.id).name},...f.bench.map((x,i)=>({id:`slot:${i}`,label:'Bench: '+card(g,x.id).name}))];
 // Announce Confusion/Smokescreen checks *before* attack-specific coin flips.
 if(!data.checked){data.checked=true;
  if(u.status==='Confused'&&next(g,2)===0){u.damage+=20;log(g,'Attack failed due to Confusion.');if(!knockOuts(g,'checkup'))finishTurn(g);return;}
  if(hasActiveEffect(u,'attackPenalty',g)&&next(g,2)===0){log(g,'Attack failed due to Smokescreen.');finishTurn(g);return;}
 }
 const allEnergies=()=>[-1,...p.bench.map((_,i)=>i)].flatMap(slot=>energy(p,slot).map(e=>({id:`source:${slot}:${e.id.slice(7)}`,label:`${card(g,located(p,slot).id).name} — ${e.label}`})));
 if(kind==='rushing-flames'&&!data.sources&&prompt('sources',side,allEnergies(),0,allEnergies().length,'Rushing Flames: discard any attached Energy',true))return;
 if(kind==='lava-flow'&&!data.sources&&prompt('sources',side,energy(p),0,u.energies.length,'Lava Flow: discard any attached Energy',true))return;
 // Roll once and remember the result across every subsequent decision.
 if(!data.roll){
  const ctx={defenderCounters:Math.floor(f.active.damage/10),enemyRemainingHP:maxHP(g,f.active)-f.active.damage,
    darkDefender:card(g,f.active.id).name.startsWith('Dark ')||card(g,f.active.id).types?.includes('Darkness'),
    topFiveEnergyCount:p.deck.slice(-5).filter(id=>isEnergy(card(g,id))).length};
  if(kind==='lava-flow')ctx.discardAmount=data.sources.length;
  if(kind==='rushing-flames')ctx.flameHeads=data.sources.filter(()=>next(g,2)===1).length;
  data.roll=ATTACK.resolve(program,()=>next(g,2)===1,ctx);
 }
 const heads=data.roll.flips[0],pickEnergy=()=>energy(p),fire=()=>energy(p).filter((_,i)=>card(g,u.energies[i]).name==='Fire Energy');
 if(['call-brock','call-misty'].includes(kind)&&heads&&p.bench.length<5){
  const owner=kind==='call-brock'?"Brock's ":"Misty's ",options=top(p.deck,c=>isBasicPokemon(c)&&c.name.startsWith(owner));
  if(!data.search&&prompt('search',side,options,0,Math.min(1,options.length),'Call for Friend: choose a Basic Pokémon',true))return;
 }
 if(kind==='rapids'&&heads&&f.active.energies.length&& !data.enemyEnergy&&prompt('enemyEnergy',side,energy(f),1,1,'Rapids: choose opponent Energy'))return;
 if(kind==='magic-pollen'&&heads&&!data.status&&prompt('status',side,['Asleep','Confused','Paralyzed','Poisoned'].map(x=>({id:`status:${x}`,label:x})),1,1,'Choose Magic Pollen condition'))return;
 if(kind==='sludge-grip'&&heads&&f.bench.length&&!data.bench&&prompt('bench',side,bench(f),1,1,'Sludge Grip: switch opposing Pokémon'))return;
 if(kind==='shadow-attack'&&heads&&f.bench.length&&!data.bench&&prompt('bench',side,bench(f),1,1,'Shadow Attack: choose target'))return;
 if(kind==='helping-hand'){
  if(!data.target&&prompt('target',side,activeOptions(),1,1,'Helping Hand: choose opposing Pokémon'))return;
  const slot=Number(data.target[0].slice(5)),damaged=located(f,slot)?.damage||0;
  if(!data.amount&&prompt('amount',side,Array.from({length:Math.floor(damaged/10)+1},(_,i)=>({id:`amount:${i}`,label:`Remove ${i} damage counters; draw ${i}`})),1,1,'Helping Hand: choose damage to remove'))return;
 }
 if(kind==='fire-tail'&&!heads&&fire().length&&!data.fire&&prompt('fire',side,fire(),1,1,'Fire Tail Slap: discard 1 Fire Energy'))return;
 if(kind==='bonfire'){
  const count=data.roll.flips.filter(Boolean).length;
  if(count&&fire().length>=count&&!data.fire&&prompt('fire',side,fire(),count,count,'Bonfire: discard Fire Energy'))return;
 }
 if(kind==='hind-kick'&&heads&&p.bench.length&&!data.bench&&prompt('bench',side,bench(p),1,1,'Hind Kick: choose new Active'))return;
 if(kind==='ball-of-flame'){
  if(u.energies.length&&!data.fire&&prompt('fire',side,pickEnergy(),0,1,'Ball of Flame: optionally discard an Energy',true))return;
  if(data.fire?.length&&f.bench.length&&!data.bench&&prompt('bench',side,bench(f),1,1,'Ball of Flame: choose Bench damage'))return;
 }
 if(kind==='call-back'&&f.bench.length<5){
  if(!data.recover&&prompt('recover',side,top(f.discard,c=>isBasicPokemon(c)),0,1,'Call Back: choose opponent Basic',true))return;
 }
 if(kind==='return-home'&&p.bench.length&&!data.bench&&prompt('bench',side,bench(p),1,1,'Return Home: shuffle your Bench Pokémon into deck'))return;
 if(kind==='bubble-jump'&&heads&&p.bench.length&&u.energies.length>=2){
  if(!data.bench&&prompt('bench',side,bench(p),1,1,'Bubble Jump: choose recipient'))return;
  if(!data.energy&&prompt('energy',side,pickEnergy(),2,2,'Bubble Jump: choose two Energy'))return;
 }
 // All decisions finished. Attack effects are committed after damage calculation.
 resolveAttack(g,side,attackIndex,undefined,undefined,{theme:data,preRoll:data.roll,confusionChecked:true,attackPenaltyChecked:true});
}

function promptBenchGuard(g,queue){
 const events=[...queue];
 while(events.length){
  const hit=events.shift(),p=g.players[hit.owner],target=p.bench[hit.targetIndex];
  if(!target||hit.amount<=0)continue;
  const options=p.bench.flatMap((u,i)=>i!==hit.targetIndex&&CLASSIC_POWERS.enabled(g,u,'Bench Guard')?
   [{id:`guard:${i}`,label:`Brock's Rhydon: redirect 10 damage from ${card(g,target.id).name}`}]:[]);
  if(!options.length)continue;
  g.nextDecisionId++;
  g.pendingDecision=makeDecision({id:`benchguard:${g.nextDecisionId}`,actor:hit.owner,kind:'bench-guard',
   label:'Bench Guard: redirect up to 10 damage to Brock’s Rhydon?',options,min:1,max:1,optional:true});
  g.pendingAction={kind:'bench_guard',...hit,attacker:g.attackContext?.side??(1-hit.owner),remaining:events};return true;
 }
 delete g.benchGuardQueue;return false;
}
function performAction(g,side,cmd){
 const p=g.players[side],f=g.players[1-side],v=cmd.payload||{},type=cmd.type;
 if(g.pendingDecision){
  if(type!=='choose')fail('Resolve the pending decision first');
  const answer=validateAnswer(g.pendingDecision,side,v),pending=g.pendingAction;
  if(!pending)fail('Pending action is missing');
  if(pending.kind==='take_prize'){
   const owner=g.players[pending.side];
   const idx=Number(answer.selected[0]?.slice(6));
   if(!Number.isInteger(idx)||idx<0||idx>=owner.prizes.length)fail('Invalid Prize selection');
   const chosen=owner.prizes.splice(idx,1)[0];owner.prizeFaceUp?.splice(idx,1);owner.hand.push(chosen);
   log(g,`${owner.name} took a Prize card (${owner.prizes.length} remaining).`);
   g.pendingDecision=null;g.pendingAction=null;
   if(promptPrize(g,pending.after))return;
   const handled=completeKnockouts(g,pending.after);
   if(!handled&&pending.after==='checkup')finishTurn(g);
   else if(!handled&&pending.after==='advance')advanceTurn(g);
   return;
  }
  if(pending.kind==='chaos_redirect'){
   const owner=g.players[pending.originalSide];
   if(!owner.discard.includes(pending.cardId))fail('Redirected Trainer left its owner’s discard pile');
   g.pendingDecision=null;g.pendingAction=null;
   if(answer.decline||!answer.selected.length){log(g,`Chaos Gym: ${owner.name} lost ${card(g,pending.cardId).name}; opponent declined.`);return;}
   log(g,`Chaos Gym: ${g.players[side].name} will use ${card(g,pending.cardId).name}.`);
   CLASSIC_TRAINERS.startProxy(g,side,pending.cardId,classicHelpers());return;
  }
  if(pending.kind==='neo_berry'){
   BERRIES.resolve(g,pending,answer,berryHelpers());
   g.pendingDecision=null;g.pendingAction=null;
   if(BERRIES.between(g,berryHelpers()))return;
   if(!knockOuts(g,'advance'))advanceTurn(g);
   return;
  }
  if(pending.kind==='neo_exp_all'){
   const owner=g.players[pending.defenderSide],victim=owner.active;
   if(!victim||victim.id!==pending.victimId||victim.damage<maxHP(g,victim))fail('EXP.ALL Active source changed');
   if(!answer.decline&&answer.selected.length){
    const m=/^move:(\d+):(\d+)$/.exec(answer.selected[0]||'');
    if(!m)fail('Invalid EXP.ALL selection');
    const bench=Number(m[1]),energyIndex=Number(m[2]),recipient=owner.bench[bench];
    const energyId=victim.energies[energyIndex];
    if(!recipient||!energyId||!isBasicEnergy(card(g,energyId)))fail('EXP.ALL Energy or recipient changed');
    const tool=recipient.attachedTrainers.findIndex(t=>card(g,t.id).name==='EXP.ALL');
    if(tool<0)fail('EXP.ALL is no longer attached');
    recipient.energies.push(victim.energies.splice(energyIndex,1)[0]);
    owner.discard.push(recipient.attachedTrainers.splice(tool,1)[0].id);
    log(g,'EXP.ALL moved one Basic Energy before the Knock Out.');
   }
   g.pendingDecision=null;g.pendingAction=null;
   if(!knockOuts(g,pending.after)){
    if(pending.after==='checkup')finishTurn(g);
    else if(pending.after==='advance')advanceTurn(g);
   }
   return;
  }
  if(pending.kind==='classic_trainer'){g.pendingDecision=null;g.pendingAction=null;CLASSIC_TRAINERS.answer(g,pending.plan,answer,classicHelpers());return;}
  if(pending.kind==='classic_power'){g.pendingDecision=null;g.pendingAction=null;CLASSIC_POWERS.answer(g,pending.plan,answer,classicHelpers());return;}
  if(pending.kind==='gym_charity'){
   g.pendingDecision=null;g.pendingAction=null;
   const reduction=Number(answer.selected[0]?.slice(7)||0);
   if(!Number.isInteger(reduction)||reduction<0||reduction>pending.damage||reduction%10)fail('Invalid Charity reduction');
   log(g,`Charity reduced attack damage by ${reduction}.`);
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{...pending.extra,gymCharityApproved:true,charityBaseDamage:pending.damage,charityReduction:reduction,preRoll:pending.roll,confusionChecked:true,attackPenaltyChecked:true});return;
  }
  if(pending.kind==='gym_ninja_trick'){
   g.pendingDecision=null;g.pendingAction=null;
   const owner=g.players[pending.defender],old=owner.active;
   if(!old||!old.attachedTrainers.some(t=>card(g,t.id).name==="Koga's Ninja Trick"))fail('Ninja Trick disappeared');
   old.gymNinjaPromptSerial=g.turnSerial;
   if(answer.selected.length){const idx=Number(answer.selected[0].slice(6));if(!owner.bench[idx])fail('Ninja Trick Bench target changed');
    const trick=old.attachedTrainers.filter(t=>card(g,t.id).name==="Koga's Ninja Trick");
    owner.discard.push(...trick.map(t=>t.id));old.attachedTrainers=old.attachedTrainers.filter(t=>!trick.includes(t));
    owner.active=owner.bench.splice(idx,1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);
    log(g,`${owner.name} activated Koga's Ninja Trick and switched before the attack.`);
   }
   performAction(g,pending.side,{type:'attack',payload:{attackIndex:pending.attackIndex}});return;
  }
  if(pending.kind==='psyduck_esp_copy'){
   g.pendingDecision=null;g.pendingAction=null;const copyIndex=Number(answer.selected[0]?.slice(7));
   const opponent=g.players[1-pending.side];
   if(!Number.isInteger(copyIndex)||!card(g,opponent.active.id).attacks?.[copyIndex])fail('Invalid ESP copied attack');
   const copied=ATTACK.compile(card(g,opponent.active.id).attacks[copyIndex]);
   if(copied?.kind==='energy-discard'){
    const attacker=g.players[pending.side].active;
    const options=attacker.energies.flatMap((id,i)=>
     !copied.onlyType||attachedEnergyMatchesType(g,id,copied.onlyType)
      ?[{id:'energy:'+i,label:card(g,id).name}]:[]);
    if(options.length<copied.quantity)fail('Insufficient attached Energy for ESP copied attack cost');
    g.nextDecisionId++;
    g.pendingDecision=makeDecision({id:'psyduckPayment:'+g.nextDecisionId,actor:pending.side,kind:'energy-discard',label:"ESP: choose additional Energy cards to discard",options,min:copied.quantity,max:copied.quantity});
    g.pendingAction={kind:'psyduck_esp_payment',side:pending.side,attackIndex:pending.attackIndex,roll:pending.roll,extra:{...pending.extra,psyduckCopyIndex:copyIndex}};
    return;
   }
   if(['bench-target','switch-attacker','switch-self','target-any','target-any-coin'].includes(copied?.kind)){
    const targetOwner=copied.kind==='switch-self'?g.players[pending.side]:opponent;
    const selectable=targetOwner.bench.map((u,i)=>({id:`bench:${i}`,label:publicName(g,u)}));
    if(['target-any','target-any-coin'].includes(copied.kind))selectable.unshift({id:'bench:-1',label:'Active: '+publicName(g,opponent.active)});
    if(selectable.length){
     g.nextDecisionId++;
     const label=copied.kind==='bench-target'?"Misty's Psyduck ESP: choose opposing Benched Pokémon":copied.kind==='switch-self'?"Misty's Psyduck ESP: choose your replacement Active Pokémon":"Misty's Psyduck ESP: choose the copied attack target";
     g.pendingDecision=makeDecision({id:`psyduckTarget:${g.nextDecisionId}`,actor:pending.side,kind:'pokemon-target',label,options:selectable,min:1,max:1});
     g.pendingAction={kind:'psyduck_esp_bench',side:pending.side,attackIndex:pending.attackIndex,roll:pending.roll,extra:{...pending.extra,psyduckCopyIndex:copyIndex}};return;
    }
   }
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{...pending.extra,psyduckCopyIndex:copyIndex,preRoll:pending.roll,confusionChecked:true,attackPenaltyChecked:true});return;
  }
  if(pending.kind==='psyduck_esp_payment'){
   const p=g.players[pending.side],f=g.players[1-pending.side];
   const chosen=f.active&&card(g,f.active.id).attacks?.[pending.extra.psyduckCopyIndex];
   const script=chosen&&ATTACK.compile(chosen);
   const picks=answer.selected.map(v=>Number(v.slice(7)));
   if(!script||script.kind!=='energy-discard'||picks.length!==script.quantity||new Set(picks).size!==picks.length||
    picks.some(i=>!Number.isInteger(i)||i<0||i>=p.active.energies.length||
     script.onlyType&&!attachedEnergyMatchesType(g,p.active.energies[i],script.onlyType)))
     fail('Invalid ESP copied Energy payment');
   g.pendingDecision=null;g.pendingAction=null;
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,
    {...pending.extra,psyduckEnergyPayment:picks,preRoll:pending.roll,confusionChecked:true,attackPenaltyChecked:true});
   return;
  }
  if(pending.kind==='psyduck_esp_bench'){
   const index=Number(answer.selected[0]?.slice(6));
   const defender=g.players[1-pending.side];
   const chosenAttack=card(g,defender.active.id).attacks[pending.extra.psyduckCopyIndex];
   const script=ATTACK.compile(chosenAttack);
   const targetOwner=script?.kind==='switch-self'?g.players[pending.side]:defender;
   if(!Number.isInteger(index)||!(index===-1&&['target-any','target-any-coin'].includes(script?.kind)&&defender.active)&&!targetOwner.bench[index])fail('Illegal ESP Bench selection');
   g.pendingDecision=null;g.pendingAction=null;
   resolveAttack(g,pending.side,pending.attackIndex,index,undefined,{...pending.extra,preRoll:pending.roll,confusionChecked:true,attackPenaltyChecked:true});return;
  }
  if(pending.kind==='sabrina_esp'){
   g.pendingDecision=null;g.pendingAction=null;
   const chosen=answer.selected.length>0;
   log(g,`Sabrina’s ESP: ${chosen?'re-flipped all attack coins':'kept the original flips'}.`);
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{...pending.extra,preRoll:chosen?null:pending.roll,gymESPChecked:true,gymESPResuming:true,confusionChecked:true,attackPenaltyChecked:true});return;
  }
  if(pending.kind==='flee_reaction'){
   g.pendingDecision=null;g.pendingAction=null;
   const selection=answer.selected[0];
   const fleeBenchIndex=answer.decline?undefined:Number(selection?.slice(6));
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,
    {...pending.extra,fleeBenchIndex});return;
  }
  if(pending.kind==='bench_guard'){
   g.pendingDecision=null;g.pendingAction=null;
   if(!answer.decline&&answer.selected.length){
    const owner=g.players[pending.owner],subject=owner.bench[pending.targetIndex],guardianIndex=Number(answer.selected[0].slice(6)),guardian=owner.bench[guardianIndex];
    if(!subject||!guardian||subject===guardian||!CLASSIC_POWERS.enabled(g,guardian,'Bench Guard'))fail('Bench Guard source changed');
    const amount=Math.min(10,pending.amount,subject.damage);
    subject.damage-=amount;guardian.damage+=amount;
    log(g,`Brock's Rhydon used Bench Guard to intercept ${amount} damage.`);
   }
   if(pending.remaining?.length){promptBenchGuard(g,pending.remaining);return;}
   delete g.benchGuardQueue;
   if(isClassicRules(g))g.attackContext={side:pending.attacker,serial:g.turnSerial};
   if(!knockOuts(g,'checkup'))finishTurn(g);
   return;
  }
  if(pending.kind==='energy_stadium'){
   g.pendingDecision=null;g.pendingAction=null;
   if(!answer.decline&&answer.selected.length){const i=Number(answer.selected[0].slice(5));const x=g.players[pending.side];
    if(!x.discard[i]||!isEnergy(card(g,x.discard[i])))fail('Invalid Energy Stadium selection');
    x.hand.push(x.discard.splice(i,1)[0]);
   }return;
  }
  if(pending.kind==='theme_attack'){
   g.pendingDecision=null;g.pendingAction=null;
   const plan=pending.plan;plan.data[plan.stage]=answer.decline?[]:[...answer.selected];
   themeAttackPlan(g,plan);return;
  }
  if(pending.kind==='gym_energy_drain'){
   const attacker=g.players[pending.attackerSide].active,ix=Number(answer.selected[0]?.slice(7));if(!attacker||!attacker.energies[ix])fail('Energy Drain target changed');
   g.players[pending.attackerSide].discard.push(attacker.energies.splice(ix,1)[0]);g.pendingDecision=null;g.pendingAction=null;knockOuts(g,pending.after);return;
  }
  if(pending.kind==='gym_rebirth'){
   const owner=g.players[pending.side],victim=pending.slot===-1?owner.active:owner.bench[pending.slot];if(!victim)fail('Rebirth Pokémon changed');
   victim.gymRebirthReturn=answer.selected.includes('choice:yes');g.pendingDecision=null;g.pendingAction=null;knockOuts(g,pending.after);return;
  }
  if(pending.kind==='gym_last_attack'){g.pendingDecision=null;g.pendingAction=null;GYM_LAST.answer(g,pending.plan,answer,gymLastHelpers());return;}
  if(pending.kind==='final_attack'){
   g.pendingDecision=null;g.pendingAction=null;
   answerFinalAttack(g,pending.plan,answer);return;
  }
  if(answer.decline&&pending.kind==='neo_hydro'){g.pendingDecision=null;g.pendingAction=null;resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{hydroBoost:false});return;}
  if(answer.decline&&pending.kind==='neo_attack_choice'&&pending.stage==='hatch'){
   g.pendingDecision=null;g.pendingAction=null;
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{preRoll:pending.preRoll,neoHatchIndex:null});return;
  }
  if(answer.decline){g.pendingDecision=null;g.pendingAction=null;
   if(pending.kind==='optional_attack_switch'||pending.kind==='attack_color'){finishTurn(g);return;}
   if(['attack_family','attack_search_evolution','attack_search_energy'].includes(pending.kind)){
    g.players[pending.side].deck=shuffle(g,g.players[pending.side].deck);finishTurn(g);return;
   }
   log(g,'Pending choice cancelled.');return;}

  const selection=answer.selected[0];
  if(answer.selected.length&&!g.pendingDecision.options.some(x=>x.id===selection))fail('Stale selection');
  g.pendingDecision=null;g.pendingAction=null;
  if(pending.kind==='promote'){
   const owner=g.players[pending.side],idx=Number(selection.slice(6));
   if(!Number.isInteger(idx)||!owner.bench[idx])fail('Promotion target no longer legal');
   owner.active=owner.bench.splice(idx,1)[0];STATUS.clearConditions(owner.active);
   if(!g.pendingPromotions||g.pendingPromotions[0]!==pending.side)fail('Invalid promotion queue');
   g.pendingPromotions.shift();
   log(g,`${owner.name} promotes ${card(g,owner.active.id).name}.`);
   finishPromotions(g);return;
  }
  if(pending.kind==='trainer_target'){
   const idx=Number(selection.slice(5));
   playTrainer(g,pending.side,pending.handIndex,idx,pending.cardId);
   return;
  }
  if(pending.kind==='energy_removal'){
   const index=Number(selection.slice(7));
   playTrainer(g,pending.side,pending.handIndex,pending.target,pending.cardId,index);
   return;
  }
  if(pending.kind==='retreat_energy'){
   const picks=answer.selected.map(id=>Number(id.slice(7)));
   finishRetreat(g,pending.side,pending.slot,picks);
   return;
  }
  if(pending.kind==='neo_hydro'){resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{hydroBoost:selection==='boost:yes'});return;}
  if(pending.kind==='neo50_select'){
    const data={...pending.data,[pending.stage]:[...answer.selected]};
    g.pendingDecision=null;g.pendingAction=null;
    resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{...pending.extra,neo50Data:data,preRoll:pending.roll,confusionChecked:true,attackPenaltyChecked:true});return;
   }
   if(pending.kind==='neo49_select'){
   const data={...pending.data};data[pending.stage]=[...answer.selected];
   g.pendingDecision=null;g.pendingAction=null;
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{...pending.extra,neo49Data:data,preRoll:pending.roll,confusionChecked:true,attackPenaltyChecked:true});return;
  }
  if(pending.kind==='neo48_select'){
   g.pendingDecision=null;g.pendingAction=null;
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{...pending.extra,neo48Choices:[...answer.selected],neo48Answered:true,preRoll:pending.roll,confusionChecked:true,attackPenaltyChecked:true});return;
  }
  if(pending.kind==='neo47_attack'){
   const owner=g.players[pending.side],target=owner.active,stage=pending.stage;
   if(!target)fail('Neo attack Pokémon left Active before selection');
   if(stage==='static'){
    const ids=answer.selected.map(id=>Number(id.slice(5)));
    g.pendingDecision=null;g.pendingAction=null;
    resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{neo47Search:ids});return;
   }
   if(stage==='move-energy'){
    const ix=Number(answer.selected[0]?.slice(7));
    if(!Number.isInteger(ix)||card(g,target.energies[ix])?.name!=='Lightning Energy')fail('Illegal Lightning Energy choice');
    if(owner.bench.length){
     g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neo47Bench:${g.nextDecisionId}`,actor:pending.side,kind:'pokemon-target',label:'Electric Current: choose your Benched Pokémon',options:owner.bench.map((u,i)=>({id:`bench:${i}`,label:publicName(g,u)})),min:1,max:1});
     g.pendingAction={...pending,stage:'move-bench',energyIndex:ix};return;
    }
    g.pendingDecision=null;g.pendingAction=null;
    resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{neo47EnergyIndex:ix});return;
   }
   if(stage==='move-bench'){
    const ix=Number(answer.selected[0]?.slice(6));
    if(!Number.isInteger(ix)||!owner.bench[ix])fail('Illegal Electric Current recipient');
    g.pendingDecision=null;g.pendingAction=null;
    resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{neo47EnergyIndex:pending.energyIndex,neo47BenchIndex:ix});return;
   }
   fail('Unknown Neo v0.47 attack decision');
  }
  if(pending.kind==='neo_attack_choice'){
   const owner=g.players[pending.side],enemy=g.players[1-pending.side];
   if(pending.stage==='cycle-energy'){
    const energyIndex=Number(selection.slice(7));
    if(!enemy.active.energies[energyIndex]||!enemy.bench.length)fail('Energy Cycle source changed');
    g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neoCycleTarget:${g.nextDecisionId}`,actor:pending.side,kind:'pokemon-target',label:'Energy Cycle: choose the receiving Benched Pokémon',options:enemy.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min:1,max:1});
    g.pendingAction={...pending,stage:'cycle-target',energyIndex};return;
   }
   const details={...(pending.preRoll?{preRoll:pending.preRoll}:{} )};
   if(pending.stage==='bench')resolveAttack(g,pending.side,pending.attackIndex,Number(selection.slice(6)),undefined,details);
   else{
    if(pending.stage==='fireworks')details.neoDiscardIndex=Number(selection.slice(7));
    if(pending.stage==='cycle-target'){details.neoCycleEnergy=pending.energyIndex;details.neoCycleBench=Number(selection.slice(6));}
    if(pending.stage==='hatch')details.neoHatchIndex=answer.selected.length?Number(selection.slice(5)):null;
    if(pending.stage==='dust')details.neoStatus=selection.slice(7);
    resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,details);
   }return;
  }
  if(pending.kind==='attack_color'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{color:selection.slice(5)});return;
  }
  if(pending.kind==='attack_fire_mill'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{fireIndices:answer.selected.map(x=>Number(x.slice(7)))});return;
  }
  if(pending.kind==='attack_discard_recover'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{discardIndices:answer.selected.map(x=>Number(x.slice(8)))});return;
  }
  if(pending.kind==='attack_search_evolution'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{deckIndex:Number(selection.slice(5))});return;
  }
  if(pending.kind==='attack_search_energy'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{deckIndex:Number(selection.slice(5))});return;
  }
  if(pending.kind==='attack_enemy_energy'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{enemyEnergyIndex:Number(selection.slice(7))});return;
  }
  if(pending.kind==='attack_family'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{familyIndex:Number(selection.slice(5))});return;
  }
  if(pending.kind==='gym_alert'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{gymAlertBench:Number(selection.slice(6))});return;
  }
  if(pending.kind==='gym_energy_loop'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{gymLoopEnergy:Number(selection.slice(7))});return;
  }
  if(pending.kind==='attack_gym_bench'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{gymBenchPicks:answer.selected.map(x=>Number(x.slice(6)))});return;
  }
  if(pending.kind==='gym_removal'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{preRoll:pending.preRoll,enemyEnergyIndex:Number(selection.slice(7)),confusionChecked:true,attackPenaltyChecked:true});return;
  }
  if(pending.kind==='attack_gym_search'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{gymSearchPicks:answer.selected.map(x=>Number(x.slice(5)))});return;
  }
  if(pending.kind==='attack_bench_multi'){
   resolveAttack(g,pending.side,pending.attackIndex,undefined,undefined,{benchPicks:answer.selected.map(x=>Number(x.slice(6)))});return;
  }
  if(pending.kind==='optional_attack_switch'){
   const owner=g.players[pending.owner],idx=Number(selection.slice(6));
   if(!owner.active||!owner.bench[idx])fail('Switch target no longer legal');
   const prior=owner.active;owner.active=owner.bench.splice(idx,1,prior)[0];STATUS.clearConditions(prior);clearBenchEffects(prior);clearBenchEffects(prior);
   finishTurn(g);return;
  }
  if(pending.kind==='attack_energy'){
   const indices=answer.selected.map(x=>Number(x.slice(7)));
   resolveAttack(g,pending.side,pending.attackIndex,undefined,indices);
   return;
  }
  if(pending.kind==='attack_target'){
   const idx=Number(selection.slice(6));
   resolveAttack(g,pending.side,pending.attackIndex,idx);
   return;
  }
  if(pending.kind==='ram_switch'){
   const owner=g.players[pending.owner],idx=Number(selection.slice(6));
   if(!owner.active||!owner.bench[idx])fail('Illegal Ram switch choice');
   const old=owner.active;owner.active=owner.bench.splice(idx,1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);
   if(!knockOuts(g,'checkup'))finishTurn(g);return;
  }
  if(pending.kind==='neo_dragon_switch'){
   const defender=g.players[1-pending.side],idx=Number(selection.slice(6));if(!defender.active||!defender.bench[idx])fail('Invalid Dragon Tornado replacement');
   const old=defender.active;defender.active=defender.bench.splice(idx,1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);finishTurn(g);return;
  }
  if(pending.kind==='attack_switch'){
   const owner=g.players[pending.owner],idx=Number(selection.slice(6));
   if(!owner.active||!owner.bench[idx])fail('Switch target no longer legal');
   const prior=owner.active;owner.active=owner.bench.splice(idx,1,prior)[0];
   STATUS.clearConditions(prior);clearBenchEffects(prior);
   log(g,`${owner.name} switched to ${card(g,owner.active.id).name}.`);
   finishTurn(g);return;
  }
  fail('Unknown pending action');
 }
 if(type==='choose')fail('No pending decision');
 if(g.phase==='setup'){
  if(!['setup_select','setup_undo','setup_confirm','concede'].includes(type))fail('Opening setup is not finished');
  if(g.setupReady[side]&&type!=='concede')fail('Setup already confirmed');
  if(type==='setup_select'){
   const c=handCard(g,p,v.handIndex);if(!isBasicPokemon(c))fail('Only Basic Pokémon can be set up');
   if(p.active&&p.bench.length>=5)fail('Bench full');
   const u=unit(p.hand.splice(v.handIndex,1)[0],g.round);if(!p.active)p.active=u;else p.bench.push(u);
  }else if(type==='setup_undo'){
   const u=safeSlot(p,v.slot);if(v.slot===-1)p.active=null;else p.bench.splice(v.slot,1);p.hand.push(u.id);
  }else if(type==='setup_confirm'){
   if(!p.active)fail('Choose an Active Pokémon first');g.setupReady[side]=true;
   if(g.setupReady.every(Boolean)){
    for(const owner of g.players)for(let i=0;i<(g.prizeCount||6);i++)owner.prizes.push(owner.deck.pop());
    g.phase='game';draw(g,0);log(g,'Duel started.');
   }
  }else if(type==='concede'){g.over=true;g.winner=1-side;}
  return;
 }
 allowTurn(g,side);
 if(type!=='concede')requireMigratedEffects(g);
 if(type==='concede'){g.over=true;g.winner=1-side;log(g,`${p.name} conceded.`);return;}
 if(type==='use_stadium'){
  const name=g.stadium?card(g,g.stadium.id).name:null;
  if(!['Energy Stadium','Healing Field','Radio Tower','Lucky Stadium'].includes(name))fail('No usable Stadium action in play');
  if(p.stadiumUsedTurn===g.turnSerial)fail('Stadium action already used this turn');
  p.stadiumUsedTurn=g.turnSerial;
  if(name==='Healing Field'){
   if(next(g,2)===1&&p.active){
    p.active.damage=Math.max(0,p.active.damage-20);
    log(g,'Healing Field removed up to 2 damage counters from the Active Pokémon.');
   }else log(g,'Healing Field flip was tails.');
   return;
  }
  if(name==='Lucky Stadium'){
   if(next(g,2)===1){draw(g,side);log(g,'Lucky Stadium drew one card.');}
   else log(g,'Lucky Stadium flip was tails.');
   return;
  }
  if(name==='Radio Tower'){
   const top=p.deck.slice(-2).reverse().map(id=>card(g,id).name);
   (p.privateLog ||= []).push('Radio Tower: top '+top.length+' card(s), in order — '+top.join(', '));
   log(g,'Radio Tower inspected its owner’s top 2 cards.');
   return;
  }
  if(next(g,2)===0){log(g,'Energy Stadium flip was tails.');return;}
  const choices=p.discard.flatMap((id,i)=>/^(Grass|Fire|Water|Lightning|Psychic|Fighting) Energy$/.test(card(g,id).name)?[{id:`card:${i}`,label:card(g,id).name}]:[]);
  if(!choices.length)return;
  g.nextDecisionId++;
  g.pendingDecision=makeDecision({id:`stadium:${g.nextDecisionId}`,actor:side,kind:'energy-stadium',label:'Energy Stadium: recover a Basic Energy',options:choices,min:0,max:1,optional:true});
  g.pendingAction={kind:'energy_stadium',side};return;
 }
 if(type==='reveal_secret'){
  requireInt(v.slot,'Secret Plan slot');if(![-1,...p.bench.map((_,i)=>i)].includes(v.slot))fail('Invalid Secret Plan slot');
  revealSecretPlan(g,side,v.slot);if(!p.active)completeKnockouts(g,'trainer');return;
 }
 if(type==='bench'){
  const c=handCard(g,p,v.handIndex);if(!isBasicPokemon(c))fail('Cannot Bench a non-Basic Pokémon');if(p.bench.length>=(g.stadium&&card(g,g.stadium.id).name==='Narrow Gym'?4:5))fail('Bench full');
  const incoming=unit(p.hand.splice(v.handIndex,1)[0],g.round);p.bench.push(incoming);
  if(g.stadium&&card(g,g.stadium.id).name==="Rocket's Minefield Gym"&&next(g,2)===0){
   incoming.damage+=20;log(g,`Rocket's Minefield Gym deals 20 damage to ${c.name}.`);knockOuts(g,'direct');
  }
  log(g,`${p.name} benched ${c.name}.`);
  if(isClassicRules(g)&&p.bench.includes(incoming)){
  CLASSIC_POWERS.benched(g,side,incoming,classicHelpers());
  if(p.bench.includes(incoming))CLASSIC_POWERS.played(g,side,p.bench.indexOf(incoming),classicHelpers());
 }return;
 }
 if(type==='attach_energy'){
  const c=handCard(g,p,v.handIndex),u=safeSlot(p,v.slot);
  if(u.energyAttachBlockSerial>g.turnSerial)fail('Crystal Beam prevents Energy attachment');
  if(!legalAttachment({card:c,unit:u,round:g.round,energyUsed:p.energyUsed,cardName:card(g,u.id).name}))fail('Illegal Energy attachment');
  const usingBlaine=(['gym-theme','gym-expanded'].includes(g.format)&&p.blaineRemaining>0);
  if(usingBlaine){
   if(c.name!=='Fire Energy'||!card(g,u.id).name.startsWith("Blaine's "))fail('Blaine only allows Fire Energy on Blaine Pokémon');
   if(p.blaineTarget!==undefined&&p.blaineTarget!==v.slot)fail('Blaine must attach to the same Pokémon');
   p.blaineTarget=v.slot;p.blaineRemaining--;
   if(!p.blaineRemaining)p.energyUsed=true;
  }else p.energyUsed=true;
  u.energies.push(p.hand.splice(v.handIndex,1)[0]);
  if(c.name==='Full Heal Energy')STATUS.clearConditions(u);
  if(c.name==='Potion Energy')u.damage=Math.max(0,u.damage-10);
  if(c.name==='Rainbow Energy'){u.damage+=10;log(g,'Rainbow Energy placed one damage counter on its host.');}
  if(c.name==='Fire Energy'&&CLASSIC_POWERS.enabled(g,u,'Healing Fire'))u.damage=Math.max(0,u.damage-10);
  log(g,`${p.name} attached ${c.name}.`);
  if(c.name==='Rainbow Energy'&&u.damage>=maxHP(g,u)){knockOuts(g,'direct');return;}
  if(isClassicRules(g))CLASSIC_POWERS.attached(g,side,v.slot,c.id,classicHelpers());return;
 }
 if(type==='evolve'){
  const c=handCard(g,p,v.handIndex),u=safeSlot(p,v.slot);
  if(u.secretPlanFaceDown){if(!revealSecretPlan(g,side,v.slot)){if(!p.active)completeKnockouts(g,'trainer');return;}}
  if(!canEvolve(c,card(g,u.id))||((u.playedTurn>=g.round)&&!(u.giovanniEvolveUntil>g.turnSerial&&c.name.startsWith("Giovanni's "))))fail('Illegal evolution');
  if((c.abilities||[]).length&&!isClassicRules(g))fail('Evolution has an unported on-play Power');
  if(isClassicRules(g)&&CLASSIC_POWERS.powerInPlay(g,'Prehistoric Power'))fail('Prehistoric Power prevents evolution');
  u.under.unshift(u.id);u.id=p.hand.splice(v.handIndex,1)[0];u.playedTurn=g.round;STATUS.clearConditions(u);clearBenchEffects(u);delete u.leekSlapUsed;delete u.weaknessOverride;delete u.resistanceOverride;p.turnPlays.push(v.slot);
  if(g.stadium&&card(g,g.stadium.id).name==='Viridian City Gym'&&c.name.startsWith("Giovanni's "))u.damage=Math.max(0,u.damage-20);
  log(g,`${p.name} evolved into ${c.name}.`);if(isClassicRules(g))CLASSIC_POWERS.played(g,side,v.slot,classicHelpers());return;
 }
 if(type==='retreat'){
  const u=safeSlot(p,-1);if(u.secretPlanFaceDown&&!revealSecretPlan(g,side,-1)){completeKnockouts(g,'trainer');return;}requireInt(v.slot,'Bench slot');if(!p.bench[v.slot])fail('Invalid retreat target');
  if(u.neo48MeanLook&&g.players[1-side].active?.neo48MeanLook===u.neo48MeanLook)fail('Mean Look prevents retreat');
  if(u.status==='Asleep'||u.status==='Paralyzed'||(p.confusedRetreatFailed&&u.status==='Confused')||hasActiveEffect(u,'noRetreat',g)&&jawClampLocks(g,side))fail('Cannot retreat');
  if(u.neo49Pursuit?.expires>g.turnSerial && g.players[1-side].active?.id===u.neo49Pursuit.sourceId){
   u.damage+=10;delete u.neo49Pursuit;log(g,'Pursuit deals 10 damage when retreat is attempted.');
   if(u.damage>=maxHP(g,u)){knockOuts(g,'trainer');return;}
  }
  const cost=retreatCost(g,side,u);
  const total=u.energies.reduce((n,id)=>n+retreatUnits(g,u,id),0);
  if(total<cost)fail('Insufficient retreat Energy');
  if(u.energies.some(id=>(card(g,id).subtypes||[]).includes('Special')&&!['Double Colorless Energy','Full Heal Energy','Potion Energy','Metal Energy','Darkness Energy','Recycle Energy','Rainbow Energy','Miracle Energy'].includes(card(g,id).name))||u.attachedTrainers.some(t=>!['Berry','Counterattack Claws','Focus Band','EXP.ALL','Gold Berry','Miracle Berry','Balloon Berry','Magnifier',"Brock's Protection","Koga's Ninja Trick","Sabrina's ESP","Charity"].includes(card(g,t.id).name)))fail('Retreat modifiers require an effect handler');
  if(cost&&total>cost&&u.energies.length>1){
   g.nextDecisionId++;
   g.pendingDecision=makeDecision({id:`retreat:${g.nextDecisionId}`,actor:side,kind:'energy-discard',label:`Choose Energy cards providing at least ${cost} retreat units`,options:u.energies.map((id,i)=>({id:`energy:${i}`,label:card(g,id).name})),min:1,max:Math.min(cost,u.energies.length)});
   g.pendingAction={kind:'retreat_energy',side,slot:v.slot};return;
  }
  finishRetreat(g,side,v.slot,Array.from({length:cost?u.energies.length:0},(_,i)=>i));return;
 }
 if(type==='play_trainer'){
  if(p.trainerLockedUntil>g.turnSerial)fail('Trainer cards are blocked this turn');
  if(isClassicRules(g)&&CLASSIC_POWERS.powerInPlay(g,'Hay Fever'))fail('Dark Vileplume prevents Trainers');
  if(isClassicRules(g)){
   const played=handCard(g,p,v.handIndex);
   if(played.supertype!=='Trainer'||!CLASSIC_TRAINERS.SUPPORTED.has(played.name))fail('Unsupported Trainer');
   if(g.stadium&&card(g,g.stadium.id).name==='Chaos Gym'&&!played.subtypes?.includes('Stadium')){
    if(next(g,2)===0){
     const id=p.hand.splice(v.handIndex,1)[0];p.discard.push(id);
     // Official WotC ruling: an attached Trainer cannot be reused after a
     // Chaos Gym tails. It would need to remain in play and in its owner's
     // discard simultaneously. Never create a phantom attachment.
     if(ATTACH_ONLY_TRAINERS.has(played.name)){log(g,`Chaos Gym: ${played.name} flipped tails; attached Trainer discarded without reuse.`);return;}
     if(g.players[1-side].trainerLockedUntil>g.turnSerial){log(g,`Chaos Gym: opponent cannot reuse ${played.name} because Trainers are blocked this turn.`);return;}
     g.nextDecisionId++;
     g.pendingDecision=makeDecision({id:`chaos:${g.nextDecisionId}`,actor:1-side,kind:'chaos-redirect',label:`Chaos Gym: ${played.name} failed its coin flip. Play this Trainer with YOUR cards and Pokémon?`,options:[{id:'choice:use',label:`Use ${played.name}`}],min:0,max:1,optional:true});
     g.pendingAction={kind:'chaos_redirect',cardId:id,originalSide:side};
     log(g,`Chaos Gym: ${played.name} flipped tails.`);return;
    }
    log(g,`Chaos Gym: ${played.name} flipped heads; played normally.`);
   }
   CLASSIC_TRAINERS.start(g,side,v.handIndex,classicHelpers());return;
  }
  const c=handCard(g,p,v.handIndex);if(c.supertype!=='Trainer')fail('Not a Trainer card');
  const targetType=['Potion','Switch','Gust of Wind','Energy Removal'].includes(c.name);
  if(targetType&&v.target===undefined){
   const options=trainerOptions(g,side,c.name);
   if(!options.length)fail('No legal targets for Trainer');
   g.nextDecisionId++;
   g.pendingDecision=makeDecision({id:`trainer:${g.nextDecisionId}`,actor:side,kind:'pokemon-target',label:`${c.name}: choose a target`,options:options.map(o=>({id:`slot:${o}`,label:o===-1?'Active':`Bench ${o+1}`})),optional:true});
   g.pendingAction={kind:'trainer_target',side,handIndex:v.handIndex,cardId:c.id};return;
  }
  playTrainer(g,side,v.handIndex,v.target,c.id);return;
 }
 if(type==='attack'){
  const u=safeSlot(p,-1),c=effectiveCard(g,u),index=requireInt(v.attackIndex,'attack index'),a=(c.attacks||[])[index];
  if(!a)fail('Invalid attack');
  if(u.status==='Asleep'||u.status==='Paralyzed')fail('Special Condition prevents attacking');
  if(u.amnesia&&u.amnesia.expires>g.turnSerial&&u.amnesia.index===index)fail('Amnesia prevents that attack');
  if(u.gymAttackCooldown&&(u.gymAttackCooldown.index===null||u.gymAttackCooldown.index===index)&&u.gymAttackCooldown.expires>g.turnSerial)fail('This attack cannot be used during your next turn');
  if(programCannotRepeat(g,u,index))fail('This attack may only be used once while the Pokémon stays in play');
  // Reject attack locks BEFORE opening deck-search / targeting decisions.
  // Otherwise a choice can become impossible to finish and soft-lock the duel.
  if(hasActiveEffect(u,'attackLock',g)&&f.active?.id===u.attackLock.targetId)fail('Cannot attack this Pokémon this turn');
  if(!canPayEnergy(a.cost||[],attackPool(g,u)) && !(isClassicRules(g)&&card(g,u.id).name==='Ditto'&&CLASSIC_POWERS.enabled(g,u,'Transform')&&u.energies.reduce((count,id)=>count+(card(g,id).name==='Double Colorless Energy'?2:1),0)>=(a.cost||[]).length))fail('Insufficient attack Energy');
  const program=ATTACK.compile(a);if(!program)fail(`Unported attack effect: ${c.name} — ${a.name}`);
  if(u.gymInkSpurt&&next(g,2)===0){log(g,`${c.name}'s attack failed due to Ink Spurt.`);finishTurn(g);return;}
  exactAttackSubject(program,c);
  const rebellionRoll=isClassicRules(g)&&CLASSIC_POWERS.enabled(g,u,'Rebellion')?[next(g,2),next(g,2)]:null;
  if(rebellionRoll&&rebellionRoll[0]===0&&rebellionRoll[1]===0){
   const leaving=[u.id,...u.under,...u.energies,...u.attachedTrainers.map(x=>x.id)];
   p.deck=shuffle(g,[...p.deck,...leaving]);p.active=null;
   log(g,`Misty's Gyarados rebelled and shuffled back into the deck.`);
   if(!p.bench.length){g.over=true;g.winner=1-side;log(g,`${p.name} has no replacement Pokémon.`);return;}
   g.pendingPromotions=[side];g.promotionAfter='direct';finishPromotions(g);return;
  }
  // Neo-era Baby Pokémon: opponents must flip heads to attack a Baby Pokémon.
  // Only consumed after validating announced attack and its basic Energy payment.
  if(isBaby(g,f.active)&&next(g,2)===0){log(g,`Baby rule: ${c.name}'s attack failed.`);finishTurn(g);return;}
  // Check prerequisites before starting a multi-step attack program.
  if(u.gymAttackCooldown&&(u.gymAttackCooldown.index===null||u.gymAttackCooldown.index===index)&&u.gymAttackCooldown.expires>g.turnSerial)fail('This attack cannot be used during your next turn');
 if(programCannotRepeat(g,u,index))fail('This attack may only be used once while the Pokémon stays in play');
  if(isClassicRules(g)&&f.active?.attachedTrainers?.some(t=>card(g,t.id).name==="Koga's Ninja Trick")&&
     f.active.gymNinjaPromptSerial!==g.turnSerial&&f.bench.length){
   g.nextDecisionId++;
   g.pendingDecision=makeDecision({id:`gymNinja:${g.nextDecisionId}`,actor:1-side,kind:'gym-ninja',label:'Koga’s Ninja Trick: switch before the opponent’s attack?',options:f.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min:0,max:1,optional:true});
   g.pendingAction={kind:'gym_ninja_trick',side,defender:1-side,attackIndex:index};return;
  }
 if(program.kind==='gym:min-twenty-damage'&&u.damage<20)fail('Attack requires at least two damage counters');
  if(program.kind==='gym:matching-energy-counts'&&u.energies.length!==f.active.energies.length)fail('Attack requires matching attached Energy counts');
  if(program.kind==='scavenge'&&!p.discard.some(id=>card(g,id).supertype==='Trainer'))fail('Scavenge requires a Trainer card in the discard pile');
  if(GYM_LAST.planned(program.kind)){
   if(u.status==='Confused'&&next(g,2)===0){u.damage+=20;log(g,`${c.name} hurt itself in Confusion.`);if(!knockOuts(g,'checkup'))finishTurn(g);return;}
   if(hasActiveEffect(u,'attackPenalty',g)&&next(g,2)===0){finishTurn(g);return;}
   GYM_LAST.run(g,side,index,program,{data:{}},gymLastHelpers());return;
  }
  if(program.kind==='neo47:static-electricity'){
   const mareepCount=g.players.reduce((n,owner)=>n+allPokemon(owner).filter(v=>!v.secretPlanFaceDown&&card(g,v.id).name==='Mareep').length,0);
   const eligible=p.deck.flatMap((id,i)=>card(g,id).name==='Lightning Energy'?[i]:[]);
   if(eligible.length&&mareepCount){
    g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neo47Static:${g.nextDecisionId}`,actor:side,kind:'card-search',label:`Static Electricity: attach up to ${mareepCount} Lightning Energy card(s) to the attacker`,options:eligible.map(i=>({id:`card:${i}`,label:`${card(g,p.deck[i]).name} (${i+1})`})),min:0,max:Math.min(mareepCount,eligible.length),optional:true});
    g.pendingAction={kind:'neo47_attack',stage:'static',side,attackIndex:index};return;
   }
   resolveAttack(g,side,index,undefined,undefined,{neo47Search:[]});return;
  }
  if(program.kind==='neo47:electric-current'){
   const choices=u.energies.flatMap((id,i)=>card(g,id).name==='Lightning Energy'?[i]:[]);
   if(!choices.length)fail('Electric Current requires attached Lightning Energy');
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neo47Current:${g.nextDecisionId}`,actor:side,kind:'energy-target',label:'Electric Current: choose a Lightning Energy card to move or discard',options:choices.map(i=>({id:`energy:${i}`,label:`Lightning Energy (${i+1})`})),min:1,max:1});
   g.pendingAction={kind:'neo47_attack',stage:'move-energy',side,attackIndex:index};return;
  }
  if(program.kind==='neo47:discharge'&&!u.energies.some(id=>card(g,id).name==='Lightning Energy'))fail('Discharge requires attached Lightning Energy');
  if(program.kind.startsWith('theme:')){themeAttackPlan(g,{side,attackIndex:index,data:{}});return;}
  if(FINAL_KINDS.has(program.kind)){
   // Historical attack order: Confusion/Smokescreen is checked BEFORE any
   // attack-specific coin flip or choice about post-flip Energy discards.
   const plan={side,attackIndex:index,data:{confusionChecked:u.status==='Confused',attackPenaltyChecked:hasActiveEffect(u,'attackPenalty',g)}};
   if(u.status==='Confused'&&next(g,2)===0){u.damage+=20+(isClassicRules(g)&&CLASSIC_POWERS.enabled(g,u,'Frenzy')?30:0);log(g,`${c.name} hurt itself in Confusion.`);if(!knockOuts(g,'checkup'))finishTurn(g);return;}
   if(hasActiveEffect(u,'attackPenalty',g)&&next(g,2)===0){log(g,`${c.name}'s attack failed due to Smokescreen.`);finishTurn(g);return;}
   planFinalAttack(g,side,index,program,plan);return;
  }
  if(program.kind==='fling'&&!f.bench.length)fail('Fling requires an opponent Benched Pokémon');
  if(program.kind==='conversion1'&&!card(g,f.active.id).weaknesses?.length&&!f.active.weaknessOverride)fail('Target has no Weakness');
  if(['conversion1','conversion2'].includes(program.kind)){
   const colors=['Grass','Fire','Water','Lightning','Psychic','Fighting'];
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:`conversion:${g.nextDecisionId}`,actor:side,kind:'energy-type',label:'Choose a Pokémon type',options:colors.map(x=>({id:`type:${x}`,label:x})),min:1,max:1,optional:program.kind==='conversion1'});
   g.pendingAction={kind:'attack_color',side,attackIndex:index};return;
  }
  if(program.kind==='gym:alert'){
   if(!p.bench.length)fail('Alert requires a Benched Pokémon to switch with');
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:`gymAlert:${g.nextDecisionId}`,actor:side,kind:'pokemon-target',label:'Alert: choose your new Active Pokémon',options:p.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min:1,max:1});
   g.pendingAction={kind:'gym_alert',side,attackIndex:index};return;
  }
  if(program.kind==='gym:energy-loop'){
   const choices=u.energies.flatMap((id,i)=>card(g,id).name==='Psychic Energy'?[{id:`energy:${i}`,label:card(g,id).name}]:[]);
   if(!choices.length)fail('Energy Loop requires attached Psychic Energy');
   if(choices.length>1){g.nextDecisionId++;g.pendingDecision=makeDecision({id:`gymLoop:${g.nextDecisionId}`,actor:side,kind:'energy-target',label:'Energy Loop: return a Psychic Energy to your hand',options:choices,min:1,max:1});g.pendingAction={kind:'gym_energy_loop',side,attackIndex:index};return;}
  }
  if(program.kind==='gym:bench-select'){
   const max=Math.min(program.maxBench,f.bench.length),min=program.benchMode==='optional'?0:Math.min(max,program.benchMode==='one'?1:2);
   if(program.benchMode==='one'&&!f.bench.length)fail('Stretch Vine requires an opponent Benched Pokémon');
   if(max){g.nextDecisionId++;g.pendingDecision=makeDecision({id:`gymbench:${g.nextDecisionId}`,actor:side,kind:'pokemon-target',label:`${a.name}: choose opponent Benched Pokémon`,options:f.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min,max,optional:min===0});g.pendingAction={kind:'attack_gym_bench',side,attackIndex:index};return;}
  }
  if(['gym:search-basic-energy','gym:search-fire-attach','gym:charge-lightning','gym:jellyfish-search'].includes(program.kind)){
   const fromDiscard=program.kind==='gym:charge-lightning',source=fromDiscard?p.discard:p.deck;
   const valid=source.flatMap((id,i)=>{
    const t=card(g,id);
    const yes=program.kind==='gym:charge-lightning'?t.name==='Lightning Energy':program.kind==='gym:search-fire-attach'?t.name==='Fire Energy':program.kind==='gym:search-basic-energy'?['Grass','Fire','Water','Lightning','Psychic','Fighting'].some(x=>t.name===x+' Energy'):['Tentacool','Tentacruel',"Misty's Tentacool","Misty's Tentacruel"].includes(t.name);
    return yes?[i]:[];
   });
   if(valid.length){const limit=program.kind==='gym:jellyfish-search'?valid.length:program.kind==='gym:charge-lightning'?program.maxSearch:1;
    g.nextDecisionId++;g.pendingDecision=makeDecision({id:`gymsearch:${g.nextDecisionId}`,actor:side,kind:'card-search',label:`${a.name}: choose card(s)`,options:valid.map(i=>({id:`card:${i}`,label:card(g,source[i]).name})),min:0,max:Math.min(limit,valid.length),optional:true});g.pendingAction={kind:'attack_gym_search',side,attackIndex:index};return;}
  }
  if(a.name==='Floodlight'&&c.id==='neo1-38'&&CLASSIC_POWERS.enabled(g,u,'Hydroelectric Power')&&u.energies.some(id=>card(g,id).name==='Water Energy')){
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neoHydro:${g.nextDecisionId}`,actor:side,kind:'power-option',label:'Hydroelectric Power: add 10 damage per unused Water Energy?',options:[{id:'boost:yes',label:'Use Hydroelectric Power'}],min:0,max:1,optional:true});
   g.pendingAction={kind:'neo_hydro',side,attackIndex:index};return;
  }
  if(['neo:mud-splash','neo:dragon-tornado'].includes(program.kind)&&f.bench.length&&program.kind==='neo:mud-splash'){
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neoBench:${g.nextDecisionId}`,actor:side,kind:'pokemon-target',label:'Mud Splash: choose an opponent Benched Pokémon',options:f.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min:1,max:1});
   g.pendingAction={kind:'neo_attack_choice',stage:'bench',side,attackIndex:index};return;
  }
  if(['neo:fireworks','discovery:energy-cycle','discovery:hatch','discovery:magic-dust'].includes(program.kind)){
   const preRoll=ATTACK.resolve(program,()=>next(g,2)===1,{enemyEnergy:f.active.energies.length});
   if(program.kind==='neo:fireworks'&&preRoll.discardSelfEnergyOnTails&&u.energies.length>1){
    g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neoFireworks:${g.nextDecisionId}`,actor:side,kind:'energy-discard',label:'Fireworks: choose an attached Energy to discard',options:u.energies.map((id,i)=>({id:`energy:${i}`,label:card(g,id).name})),min:1,max:1});
    g.pendingAction={kind:'neo_attack_choice',stage:'fireworks',side,attackIndex:index,preRoll};return;
   }
   if(program.kind==='discovery:energy-cycle'&&preRoll.energyCycle&&!protectedEnergy(f.active)&&f.active.energies.length&&f.bench.length){
    g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neoCycle:${g.nextDecisionId}`,actor:side,kind:'energy-target',label:'Energy Cycle: choose an opposing Energy',options:f.active.energies.map((id,i)=>({id:`energy:${i}`,label:card(g,id).name})),min:1,max:1});
    g.pendingAction={kind:'neo_attack_choice',stage:'cycle-energy',side,attackIndex:index,preRoll};return;
   }
   if(program.kind==='discovery:hatch'&&preRoll.hatch){
    const found=p.deck.flatMap((id,i)=>card(g,id).evolvesFrom==='Metapod'?[{id:`deck:${i}`,label:card(g,id).name}]:[]);
    if(found.length){g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neoHatch:${g.nextDecisionId}`,actor:side,kind:'deck-search',label:'Hatch: choose a Pokémon evolving from Metapod',options:found,min:0,max:1,optional:true});
     g.pendingAction={kind:'neo_attack_choice',stage:'hatch',side,attackIndex:index,preRoll};return;}
   }
   if(program.kind==='discovery:magic-dust'&&preRoll.magicDust){
    g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neoDust:${g.nextDecisionId}`,actor:side,kind:'condition',label:'Magic Dust: choose a Special Condition',options:['Asleep','Confused','Paralyzed','Poisoned'].map(s=>({id:`status:${s}`,label:s})),min:1,max:1});
    g.pendingAction={kind:'neo_attack_choice',stage:'dust',side,attackIndex:index,preRoll};return;
   }
   resolveAttack(g,side,index,undefined,undefined,{preRoll});return;
  }
  if(program.kind==='wildfire'){
   const eligible=u.energies.flatMap((id,i)=>card(g,id).name==='Fire Energy'?[i]:[]);
   if(eligible.length){g.nextDecisionId++;g.pendingDecision=makeDecision({id:`wildfire:${g.nextDecisionId}`,actor:side,kind:'energy-discard',label:'Moltres Wildfire: discard any number of Fire Energy',options:eligible.map(i=>({id:`energy:${i}`,label:card(g,u.energies[i]).name})),min:0,max:eligible.length});
    g.pendingAction={kind:'attack_fire_mill',side,attackIndex:index};return;}
  }
  if(program.kind==='energy-conversion'){
   const eligible=p.discard.flatMap((id,i)=>isEnergy(card(g,id))?[i]:[]);
   if(eligible.length){g.nextDecisionId++;g.pendingDecision=makeDecision({id:`conversion:${g.nextDecisionId}`,actor:side,kind:'discard-recovery',label:'Recover up to two Energy cards',options:eligible.map(i=>({id:`discard:${i}`,label:card(g,p.discard[i]).name})),min:0,max:Math.min(2,eligible.length)});
    g.pendingAction={kind:'attack_discard_recover',side,attackIndex:index};return;}
  }
  if(program.kind==='rapid-evolution'||program.kind==='afternoon-nap'){
   const eligible=p.deck.flatMap((id,i)=>{
    const c=card(g,id);
    if(program.kind==='rapid-evolution')return ['Gyarados','Dark Gyarados'].includes(c.name)&&c.supertype==='Pokémon'?[i]:[];
    return isEnergy(c)?[i]:[];
   });
   if(eligible.length){g.nextDecisionId++;g.pendingDecision=makeDecision({id:`search:${g.nextDecisionId}`,actor:side,kind:'deck-search',label:`${a.name}: choose a card`,options:eligible.map(i=>({id:`card:${i}`,label:card(g,p.deck[i]).name})),min:1,max:1,optional:true});
    g.pendingAction={kind:program.kind==='rapid-evolution'?'attack_search_evolution':'attack_search_energy',side,attackIndex:index};return;}
  }
  if(program.kind==='fling'&&!f.bench.length)fail('Fling requires opposing Bench');
 if(program.kind==='conversion1'&&!card(g,f.active.id).weaknesses?.length&&!f.active.weaknessOverride)fail('Target has no Weakness');
 if(['conversion1','conversion2'].includes(program.kind)&&!['Grass','Fire','Water','Lightning','Psychic','Fighting'].includes(extra.color))fail('Invalid conversion type');
 if(program.kind==='wildfire'&&(!Array.isArray(extra.fireIndices)&&(u.energies.some(id=>card(g,id).name==='Fire Energy'))))fail('Fire Energy choice is required');
 if(program.kind==='wildfire'&&extra.fireIndices&&(!Array.isArray(extra.fireIndices)||new Set(extra.fireIndices).size!==extra.fireIndices.length||extra.fireIndices.some(i=>!Number.isInteger(i)||i<0||i>=u.energies.length||card(g,u.energies[i]).name!=='Fire Energy')))fail('Invalid Wildfire payment');
 if(program.kind==='energy-conversion'){
  const valid=p.discard.flatMap((id,i)=>isEnergy(card(g,id))?[i]:[]),sel=extra.discardIndices;
  if(valid.length&&(!Array.isArray(sel)||sel.length>2||new Set(sel).size!==sel.length||sel.some(i=>!valid.includes(i))))fail('Invalid discard recovery selection');
 }
 if(['rapid-evolution','afternoon-nap'].includes(program.kind)){
  const eligible=p.deck.flatMap((id,i)=>{
   const x=card(g,id);return program.kind==='rapid-evolution'?(['Gyarados','Dark Gyarados'].includes(x.name)&&x.supertype==='Pokémon'?[i]:[]):isEnergy(x)?[i]:[];
  });
  if(eligible.length&&!eligible.includes(extra.deckIndex))fail('Invalid search result');
  if(!eligible.length&&extra.deckIndex!==undefined)fail('Invalid search result');
 }
 if(u.gymAttackCooldown&&(u.gymAttackCooldown.index===null||u.gymAttackCooldown.index===index)&&u.gymAttackCooldown.expires>g.turnSerial)fail('This attack cannot be used during your next turn');
 if(programCannotRepeat(g,u,index))fail('This attack may only be used once while the Pokémon stays in play');
 if(program.kind==='gym:min-twenty-damage'&&u.damage<20)fail('Attack requires at least two damage counters');
 if(program.kind==='gym:matching-energy-counts'&&u.energies.length!==f.active.energies.length)fail('Attack requires matching attached Energy counts');
 if(program.kind==='dream-eater'&&f.active.status!=='Asleep')fail('Defending Pokémon must be Asleep');
  if(program.kind==='once-per-unit'&&u.leekSlapUsed)fail('This attack was already used');
  if(program.kind==='call-family'&&p.bench.length>=5)fail('Bench full');
  if(program.kind==='coin-heal-one'&&u.damage===0)fail('No damage to heal');
  if(program.kind==='drag-off'&&!f.bench.length)fail('Drag Off requires an opposing Benched Pokémon');
  if(program.kind==='enemy-energy-removal'&&f.active.energies.length>1){
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:`enemyenergy:${g.nextDecisionId}`,actor:side,kind:'energy-discard',label:`${a.name}: choose Defending Pokémon Energy`,options:f.active.energies.map((id,i)=>({id:`energy:${i}`,label:card(g,id).name})),min:1,max:1});
   g.pendingAction={kind:'attack_enemy_energy',side,attackIndex:index};return;
  }
  if(program.kind==='call-family'){
   const choices=familyCandidates(g,side,program.restriction);
   if(choices.length){g.nextDecisionId++;
    g.pendingDecision=makeDecision({id:`family:${g.nextDecisionId}`,actor:side,kind:'deck-search',label:`${a.name}: choose a Basic Pokémon (or fail to find)`,options:choices.map(o=>({id:`card:${o.index}`,label:o.name})),min:1,max:1,optional:true});
    g.pendingAction={kind:'attack_family',side,attackIndex:index};return;}
  }
  if(program.kind==='bench-up-to-three'&&f.bench.length>3){g.nextDecisionId++;
   g.pendingDecision=makeDecision({id:`benchmulti:${g.nextDecisionId}`,actor:side,kind:'pokemon-target',label:`${a.name}: choose exactly 3 Benched Pokémon`,options:f.bench.map((u,i)=>({id:`bench:${i}`,label:publicName(g,u)})),min:3,max:3});
   g.pendingAction={kind:'attack_bench_multi',side,attackIndex:index};return;}
  if(program.kind==='energy-discard'||program.kind==='recover-discard'){
   const quantity=program.kind==='recover-discard'?1:program.quantity;
   if(program.subject!==c.name&&program.subject!=='this Pokémon')fail('Energy cost subject does not match attacker');
   const eligible=u.energies.map((id,i)=>({id:card(g,id),i})).filter(o=>!program.onlyType||attachedEnergyMatchesType(g,u.energies[o.i],program.onlyType)).map(o=>o.i);
   if(eligible.length<quantity)fail('Insufficient Energy to discard for attack');
   if(eligible.length>quantity){
    g.nextDecisionId++;
    g.pendingDecision=makeDecision({id:`attackcost:${g.nextDecisionId}`,actor:side,kind:'energy-discard',label:`${a.name}: discard ${quantity} Energy card(s)`,options:eligible.map(i=>({id:`energy:${i}`,label:card(g,u.energies[i]).name})),min:quantity,max:quantity});
    g.pendingAction={kind:'attack_energy',side,attackIndex:index};return;
   }
   resolveAttack(g,side,index,undefined,eligible);return;
  }
  if(['bench-target','switch-attacker','switch-self','target-any','target-any-coin','drag-off'].includes(program.kind)){
   const owner=program.kind==='switch-self'?p:f;
   if(['target-any','target-any-coin'].includes(program.kind)){
    g.nextDecisionId++;g.pendingDecision=makeDecision({id:`attack:${g.nextDecisionId}`,actor:side,kind:'pokemon-target',label:`${a.name}: choose a target`,options:[{id:'bench:-1',label:`Active: ${publicName(g,f.active)}`},...f.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)}))],min:1,max:1});
    g.pendingAction={kind:'attack_target',side,attackIndex:index};return;
   }
   if(owner.bench.length){
    g.nextDecisionId++;
    g.pendingDecision=makeDecision({id:`attack:${g.nextDecisionId}`,actor:side,kind:'pokemon-target',label:`${a.name}: choose Pokémon`,options:owner.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min:1,max:1});
    g.pendingAction={kind:'attack_target',side,attackIndex:index};return;
   }
  }
  resolveAttack(g,side,index);return;
 }
 if(type==='end_turn'){finishTurn(g);return;}
 if(type==='use_power'){if(!isClassicRules(g))fail('Pokémon Powers must be migrated to the headless effect runner');const actor=safeSlot(p,v.slot);if(actor.secretPlanFaceDown&&!revealSecretPlan(g,side,v.slot)){if(!p.active)completeKnockouts(g,'trainer');return;}CLASSIC_POWERS.begin(g,side,v,classicHelpers());return;}
 fail(`Command not available in headless duel: ${type}`);
}
// All effects of one announced attack execute on one cloned, transactional state.
// Attacker target choices happen before damage. Defender forced-switch choices
// happen after damage/KO and before the between-turn checkup.
function programCannotRepeat(g,u,index){return Boolean(u.gymAttackOnce&&u.gymAttackOnce.includes(index));}
function resolveAttack(g,side,index,chosenBench,energyPicks,extra={}){
 const p=g.players[side],f=g.players[1-side],u=safeSlot(p,-1),c=effectiveCard(g,u),a=(c.attacks||[])[index];
 if(!a)fail('Invalid attack');
 if(u.status==='Asleep'||u.status==='Paralyzed')fail('Special Condition prevents attacking');
 const program=ATTACK.compile(a);if(!program)fail('Unported attack effect');
 exactAttackSubject(program,c);
 if(program.kind==='energy-discard'&&program.subject!==c.name&&program.subject!=='this Pokémon')fail('Energy cost subject does not match user');
 if(!f.active)fail('No Defending Pokémon');
 if(program.kind==='neo:mud-splash'&&f.bench.length&&(chosenBench===undefined||!f.bench[chosenBench]))fail('Mud Splash requires a valid Bench target');
 if(program.kind==='discovery:magic-dust'&&extra.preRoll?.magicDust&&!['Asleep','Confused','Paralyzed','Poisoned'].includes(extra.neoStatus))fail('Magic Dust needs a status choice');
 if(program.kind==='discovery:energy-cycle'&&extra.preRoll?.energyCycle&&!protectedEnergy(f.active)&&f.active.energies.length&&f.bench.length&&(!Number.isInteger(extra.neoCycleEnergy)||!Number.isInteger(extra.neoCycleBench)||!f.active.energies[extra.neoCycleEnergy]||!f.bench[extra.neoCycleBench]))fail('Energy Cycle requires legal source and destination');
 if(program.kind==='neo47:static-electricity'){
  const count=g.players.reduce((n,owner)=>n+allPokemon(owner).filter(v=>!v.secretPlanFaceDown&&card(g,v.id).name==='Mareep').length,0);
  const ids=extra.neo47Search;
  if(!Array.isArray(ids)||ids.length>count||new Set(ids).size!==ids.length||ids.some(i=>!Number.isInteger(i)||i<0||i>=p.deck.length||card(g,p.deck[i]).name!=='Lightning Energy'))fail('Invalid Static Electricity Energy selection');
 }
 if(program.kind==='neo47:electric-current'){
  const ix=extra.neo47EnergyIndex;
  if(!Number.isInteger(ix)||card(g,u.energies[ix])?.name!=='Lightning Energy')fail('Invalid Electric Current Lightning Energy');
  if(p.bench.length&&(!Number.isInteger(extra.neo47BenchIndex)||!p.bench[extra.neo47BenchIndex]))fail('Electric Current requires a valid Bench target');
 }
 if(program.kind==='neo47:discharge'&&!u.energies.some(id=>card(g,id).name==='Lightning Energy'))fail('Discharge needs a Lightning Energy card to discard');
 // Exact-matched final Classic attack programs must have completed every
 // required choice. The caller cannot inject an unvalidated final effect.
 if(GYM_LAST.planned(program.kind)&&!extra.gymLastApproved)fail('Complete Gym attack choices first');
 if(FINAL_KINDS.has(program.kind)&&!extra.finalApproved)fail('Complete the historical attack decisions first');
 if(FINAL_KINDS.has(program.kind)){
  if(['barrier','destiny-bond','scavenge','third-eye'].includes(program.kind)||['continuous-fireball','fireball','playing-with-fire'].includes(program.kind)&&extra.preRoll?.discardHeadCount){
   const quantity=['continuous-fireball','fireball','playing-with-fire'].includes(program.kind)?extra.preRoll.discardHeadCount:1;
   if(!Array.isArray(energyPicks)||energyPicks.length!==quantity||new Set(energyPicks).size!==quantity||energyPicks.some(i=>!Number.isInteger(i)||i<0||i>=u.energies.length))fail('Invalid final attack Energy selection');
  }
  if(program.kind==='fascinate'&&!f.bench.length)fail('Fascinate requires an opponent Bench');
  if(program.kind==='amnesia'||program.kind==='copy-attack'){
   if(!Number.isInteger(extra.copyIndex)||!card(g,f.active.id).attacks?.[extra.copyIndex])fail('Invalid copied or disabled attack');
  }
  if(program.kind==='mirror-move'&&u.lastAttackImpact?.serial!==g.turnSerial-1)fail('Mirror Move requires a hit on the previous turn');
  if(program.kind==='scavenge'&&(!Number.isInteger(extra.discardTrainer)||card(g,p.discard[extra.discardTrainer])?.supertype!=='Trainer'))fail('Scavenge requires a Trainer in discard');
  if(program.kind==='prophecy'&&(![0,1].includes(extra.deckOwner)||!Array.isArray(extra.deckOrder)))fail('Prophecy needs deck and order');
  if(program.kind==='stare'&&(!Number.isInteger(extra.target)||extra.target< -1||extra.target>=f.bench.length))fail('Invalid Stare target');
  if(program.kind==='energy-bomb'&&p.bench.length&&(!Array.isArray(extra.destinations)||extra.destinations.length!==u.energies.length||extra.destinations.some(i=>!Number.isInteger(i)||i<0||i>=p.bench.length)))fail('Invalid Energy Bomb distribution');
 }
 if(u.gymAttackCooldown&&(u.gymAttackCooldown.index===null||u.gymAttackCooldown.index===index)&&u.gymAttackCooldown.expires>g.turnSerial)fail('This attack cannot be used during your next turn');
 if(programCannotRepeat(g,u,index))fail('This attack may only be used once while the Pokémon stays in play');
 if(program.kind==='gym:bench-select'){
  const picks=extra.gymBenchPicks||[],max=Math.min(program.maxBench,f.bench.length),min=program.benchMode==='optional'?0:Math.min(max,program.benchMode==='one'?1:2);
  if(program.benchMode==='one'&&!f.bench.length)fail('No opposing Benched Pokémon');
  if(!Array.isArray(picks)||picks.length<min||picks.length>max||new Set(picks).size!==picks.length||picks.some(i=>!Number.isInteger(i)||i<0||i>=f.bench.length))fail('Invalid Gym bench selection');
 }
 if(['gym:search-basic-energy','gym:search-fire-attach','gym:charge-lightning','gym:jellyfish-search'].includes(program.kind)){
  const selected=extra.gymSearchPicks||[],fromDiscard=program.kind==='gym:charge-lightning',source=fromDiscard?p.discard:p.deck,limit=program.kind==='gym:jellyfish-search'?source.length:program.kind==='gym:charge-lightning'?program.maxSearch:1;
  const yes=id=>{const c=card(g,id);return fromDiscard?c.name==='Lightning Energy':program.kind==='gym:search-fire-attach'?c.name==='Fire Energy':program.kind==='gym:search-basic-energy'?['Grass','Fire','Water','Lightning','Psychic','Fighting'].some(x=>c.name===x+' Energy'):['Tentacool','Tentacruel',"Misty's Tentacool","Misty's Tentacruel"].includes(c.name);};
  if(!Array.isArray(selected)||selected.length>limit||new Set(selected).size!==selected.length||selected.some(i=>!Number.isInteger(i)||i<0||i>=source.length||!yes(source[i])))fail('Illegal Gym search choice');
 }
 if(program.kind==='gym:alert'&&(!p.bench.length||!Number.isInteger(extra.gymAlertBench)||!p.bench[extra.gymAlertBench]))fail('Alert needs a valid Bench replacement');
 if(program.kind==='gym:energy-loop'){
  const choices=u.energies.flatMap((id,i)=>card(g,id).name==='Psychic Energy'?[i]:[]);
  if(!choices.length||extra.gymLoopEnergy!==undefined&&!choices.includes(extra.gymLoopEnergy))fail('Energy Loop needs an attached Psychic Energy');
  if(choices.length>1&&!Number.isInteger(extra.gymLoopEnergy))fail('Energy Loop must choose which Psychic Energy to return');
 }
 if(program.kind==='gym:min-twenty-damage'&&u.damage<20)fail('Attack requires at least two damage counters');
 if(program.kind==='gym:matching-energy-counts'&&u.energies.length!==f.active.energies.length)fail('Attack requires matching attached Energy counts');
 if(program.kind==='dream-eater'&&f.active.status!=='Asleep')fail('Defending Pokémon must be Asleep');
 if(program.kind==='once-per-unit'&&u.leekSlapUsed)fail('Attack already used');
 if(program.kind==='call-family'&&p.bench.length>=5)fail('Bench full');
 if(program.kind==='coin-heal-one'&&u.damage===0)fail('No damage to heal');
  if(program.kind==='drag-off'&&!f.bench.length)fail('Drag Off requires an opposing Benched Pokémon');
 if(program.kind==='enemy-energy-removal'&&f.active.energies.length>1&&(!Number.isInteger(extra.enemyEnergyIndex)||extra.enemyEnergyIndex<0||extra.enemyEnergyIndex>=f.active.energies.length))fail('Missing legal opponent Energy choice');
 if(program.kind==='call-family'){
  const choices=familyCandidates(g,side,program.restriction);
  if(choices.length&&!choices.some(o=>o.index===extra.familyIndex))fail('Missing legal deck-search choice');
  if(!choices.length&&extra.familyIndex!==undefined)fail('Invalid deck-search choice');
 }
 if(program.kind==='bench-up-to-three'&&f.bench.length>3){
  const picks=extra.benchPicks;
  if(!Array.isArray(picks)||picks.length!==3||new Set(picks).size!==3||picks.some(i=>!Number.isInteger(i)||i<0||i>=f.bench.length))fail('Missing legal multi-target choice');
 }

 if(!canPayEnergy(a.cost||[],attackPool(g,u)) && !(isClassicRules(g)&&card(g,u.id).name==='Ditto'&&CLASSIC_POWERS.enabled(g,u,'Transform')&&u.energies.reduce((count,id)=>count+(card(g,id).name==='Double Colorless Energy'?2:1),0)>=(a.cost||[]).length))fail('Insufficient attack Energy');
 if((program.kind!=='neo46:plunder'&&f.active.attachedTrainers.some(t=>!['Defender','PlusPower','Berry','Counterattack Claws','Focus Band','EXP.ALL','Gold Berry','Miracle Berry','Balloon Berry','Magnifier',"Brock's Protection","Koga's Ninja Trick","Sabrina's ESP","Charity"].includes(card(g,t.id).name)))||f.active.energies.some(id=>(card(g,id).subtypes||[]).includes('Special')&&!['Double Colorless Energy','Full Heal Energy','Potion Energy','Metal Energy','Darkness Energy','Recycle Energy','Rainbow Energy','Miracle Energy'].includes(card(g,id).name)))fail('Damage or Energy modifiers require effect handlers');
 const usesChoice=['bench-target','switch-attacker','switch-self','target-any','target-any-coin','drag-off'].includes(program.kind);
 if(usesChoice){const owner=program.kind==='switch-self'?p:f;
  if(['target-any','target-any-coin'].includes(program.kind)){if(!Number.isInteger(chosenBench)||chosenBench< -1||chosenBench>=f.bench.length)fail('Invalid opponent target');}
  else{if(owner.bench.length&&(!Number.isInteger(chosenBench)||chosenBench<0||chosenBench>=owner.bench.length))fail('Missing or invalid attack target');
   if(!owner.bench.length&&chosenBench!==undefined)fail('No valid attack target');}
 }
 // Historical Confusion: failed roll prevents ALL attack effects.
 if(u.status==='Confused'&&!extra.confusionChecked&&next(g,2)===0){
  const self=calculateDamage(c,c,20)+(isClassicRules(g)&&CLASSIC_POWERS.enabled(g,u,'Frenzy')?30:0);u.damage+=self;
  log(g,`${c.name} hurts itself in Confusion for ${self} damage.`);
  if(!knockOuts(g,'checkup'))finishTurn(g);return;
 }
 if(hasActiveEffect(u,'attackPenalty',g)&&!extra.attackPenaltyChecked&&next(g,2)===0){log(g,`${c.name}'s attack failed due to Smokescreen.`);finishTurn(g);return;}
 if(hasActiveEffect(u,'attackLock',g)&&f.active?.id===u.attackLock.targetId)fail('Cannot attack this Pokémon this turn');
 // When Confusion allows the attack to resolve, pay printed Energy-discard costs.
 // Select exact cards when
 // more are attached than required. Energy payment is a committed part of
 // announcing an attack and is never silently chosen by the engine.
 if(!extra.gymCharityApproved&&!extra.gymESPResuming&&(program.kind==='energy-discard'||program.kind==='recover-discard')){
  const picks=energyPicks,quantity=program.kind==='recover-discard'?1:program.quantity;
  if(!Array.isArray(picks)||picks.length!==quantity||new Set(picks).size!==picks.length||picks.some(i=>!Number.isInteger(i)||i<0||i>=u.energies.length||program.onlyType&&!attachedEnergyMatchesType(g,u.energies[i],program.onlyType)))fail('Illegal attack Energy payment');
  for(const i of [...picks].sort((a,b)=>b-a))p.discard.push(u.energies.splice(i,1)[0]);
 }
 if(!extra.gymCharityApproved&&!extra.gymESPResuming&&FINAL_KINDS.has(program.kind)&&program.kind!=='flame-pillar'&&Array.isArray(energyPicks)){
  for(const i of [...energyPicks].sort((a,b)=>b-a))p.discard.push(u.energies.splice(i,1)[0]);
 }
 if(program.kind==='drag-off'&&!jawClampLocks(g,1-side)){
  const prior=f.active;f.active=f.bench.splice(chosenBench,1,prior)[0];
  STATUS.clearConditions(prior);clearBenchEffects(prior);
 }
 const coreContext={neo49Locked:Boolean(u.neo49LockOn?.expires>g.turnSerial&&f.active.neo49LockTarget?.side===side&&f.active.neo49LockTarget?.sourceId===u.id&&u.neo49LockOn.targetId===f.active.id),neo49Fossils:p.bench.filter(x=>['Omanyte','Omastar','Kabuto','Kabutops'].includes(card(g,x.id).name)).length,totalPokemon:g.players.reduce((n,owner)=>n+allPokemon(owner).length,0),selfWater:u.energies.filter(id=>card(g,id).name==='Water Energy').length,selfLightning:u.energies.filter(id=>card(g,id).name==='Lightning Energy').length,selfCounters:Math.floor(u.damage/10),defenderCounters:Math.floor(f.active.damage/10),benchCount:p.bench.length,enemyEnergy:f.active.energies.length,enemyRemainingHP:Math.max(0,maxHP(g,f.active)-f.active.damage),selfEnergy:u.energies.length,enemyBench:f.bench.length,topFireCount:p.deck.slice(-5).filter(id=>card(g,id).name==='Fire Energy').length,selfPoisoned:u.status==='Poisoned',nidokingOnBench:p.bench.some(x=>card(g,x.id).name==="Giovanni's Nidoking"),nightSpirits:allPokemon(p).filter(x=>["Sabrina's Gastly","Sabrina's Haunter","Sabrina's Gengar"].includes(card(g,x.id).name)).length,enemyMaxHP:maxHP(g,f.active),enemyFighting:effectiveCard(g,f.active).types?.includes('Fighting'),selfFireCards:u.energies.filter(id=>card(g,id).name==='Fire Energy').length,bellossomCount:allPokemon(p).filter(x=>card(g,x.id).name==='Bellossom').length,ownPokemonCount:allPokemon(p).length,discardEnergyCount:p.discard.filter(id=>isEnergy(card(g,id))).length,enemyBaby:['Elekid','Magby','Tyrogue','Igglybuff','Cleffa','Pichu','Smoochum'].includes(effectiveCard(g,f.active).name),enemyBasic:effectiveCard(g,f.active).subtypes?.includes('Basic'),damagedPreviousTurn:u.lastAttackImpact?.serial===g.turnSerial-1&&u.lastAttackImpact.damage>0,extraEnergies:(type)=>extraAttackEnergy(g,u,a,type),teamNameCount:(names,region)=> (region==='bench'?p.bench:allPokemon(p)).filter(x=>names.includes(card(g,x.id).name)).length,allNamedCount:(names)=>g.players.flatMap(allPokemon).filter(x=>names.includes(card(g,x.id).name)).length,enemyBenchCount:f.bench.length,darkDefender:card(g,f.active.id).name.startsWith('Dark '),topFiveEnergyCount:p.deck.slice(-5).filter(id=>isEnergy(card(g,id))).length,discardAmount:extra.theme?.sources?.length||0,flameHeads:extra.theme?.roll?.flips?.filter(Boolean).length||0};
 let roll=extra.preRoll||ATTACK.resolve(program,()=>next(g,2)===1,coreContext);

 // Neo v0.51: shared copy programs with explicit Bench targeting and
 // attached-Energy payments. Preserve Super Metronome's coin through choices.
 const copyAllowed=new Set(['flat','status','coin-status','coin-times','coin-bonus','coin-failure','coin-status-split','recoil','coin-recoil','coin-recoil-bonus','defender-counters','own-counters','flail-counters','minus-counters','bench-count','ignore-weakness','draw-one','bench-target','bench-own','bench-both-recoil','bench-splash-coin','switch-self','switch-attacker','switch-defender','energy-discard',
  // These classic effect families execute on the copying Pokémon with no
  // additional target/payment decision; they are safe for Neo v0.69.
  'coin-shield','damage-shield','coin-attack-lock','coin-heal-one','drain','leech-seed','coin-draw','energy-coins','coin-no-retreat','sand-attack','coin-clamp','target-any','target-any-coin']);
 const isCopyable=attack=>{
  const effect=ATTACK.compile(attack);
  if(!effect||!copyAllowed.has(effect.kind))return false;
  // Super Metronome waives the printed Energy cost, not additional discards.
  // The picker must omit attacks whose required discard cannot be paid.
  if(effect.kind==='energy-discard')return u.energies.filter(id=>!effect.onlyType||attachedEnergyMatchesType(g,id,effect.onlyType)).length>=effect.quantity;
  return true;
 };
 if(program.kind==='neo50:super-metronome'&&roll.neo50MetronomeHeads){
  const data=extra.neo50Data||{};
  const attacksFor=source=>(effectiveCard(g,source).attacks||[]).flatMap((a,i)=>isCopyable(a)?[{id:'attack:'+i,label:a.name}]:[]);
  const sources=[{id:'slot:-1',unit:f.active},...f.bench.map((x,i)=>({id:'slot:'+i,unit:x}))].filter(v=>attacksFor(v.unit).length);
  const prompt=(stage,options,label)=>{
   if(!options.length)fail('No supported copied attack choices available');
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:'neo50:'+g.nextDecisionId,actor:side,kind:'neo-attack-choice',label,options,min:1,max:1});
   g.pendingAction={kind:'neo50_select',stage,side,attackIndex:index,roll,extra,data};
  };
  if(!data.source&&!sources.length){
   // Heads with no payable/copied attacks is a valid attack that does
   // nothing. Do not rollback the entire action or allow a free reroll.
   log(g,'Super Metronome has no eligible opposing attack to copy.');
  }else{
   if(!data.source){prompt('source',sources.map(x=>({id:x.id,label:(x.id==='slot:-1'?'Active: ':'Bench: ')+publicName(g,x.unit)})),'Super Metronome: choose an opposing Pokémon');return;}
   if(!Array.isArray(data.source)||data.source.length!==1||!sources.some(x=>x.id===data.source[0]))fail('Invalid Metronome source');
   const slot=Number(data.source[0].slice(5)),source=slot===-1?f.active:f.bench[slot];
   if(!source)fail('Metronome Pokémon left play');
   const choices=attacksFor(source);
   if(!data.attack){prompt('attack',choices,'Super Metronome: choose an attack');return;}
   if(!Array.isArray(data.attack)||data.attack.length!==1||!choices.some(x=>x.id===data.attack[0]))fail('Invalid Metronome attack');
   extra.neo50CopyAttack=effectiveCard(g,source).attacks[Number(data.attack[0].slice(7))];
  }
 }
 if(program.kind==='neo50:sketch'){
  const prior=f.active?.neo50LastAttack;
  if(prior?.serial===g.turnSerial-1&&prior.cardId===f.active.id&&
     u.neo50Observed?.serial===prior.serial&&u.neo50Observed?.attackerSide===1-side)
   extra.neo50CopyAttack=prior.attack;
 }
 if(extra.neo50CopyAttack){
  const script=ATTACK.compile(extra.neo50CopyAttack);
  if(!script||!copyAllowed.has(script.kind))fail('Copied attack requires an unported interactive effect');
  const data=extra.neo50Data||{};
  const chooseCopy=(stage,options,label,min=1)=>{
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:'neo50:'+g.nextDecisionId,actor:side,kind:'neo-attack-choice',label,options,min,max:min});
   g.pendingAction={kind:'neo50_select',stage,side,attackIndex:index,roll,extra,data};
  };
  if(script.kind==='energy-discard'&&program.kind==='neo50:super-metronome'){
   const options=u.energies.flatMap((id,i)=>!script.onlyType||attachedEnergyMatchesType(g,id,script.onlyType)?[{id:'energy:'+i,label:card(g,id).name}]:[]);
   if(options.length<script.quantity)fail('Not enough attached Energy for copied attack payment');
   if(!Array.isArray(data.payment)){chooseCopy('payment',options,'Copied attack: discard attached Energy',script.quantity);return;}
   if(data.payment.length!==script.quantity||new Set(data.payment).size!==script.quantity||data.payment.some(k=>!options.some(x=>x.id===k)))fail('Illegal copied Energy payment');
  }
  const targetKind=script.kind,owner=targetKind==='switch-self'?p:f;
  const copiedAnyTarget=targetKind==='target-any'||targetKind==='target-any-coin';
  if(copiedAnyTarget||['bench-target','switch-self','switch-attacker'].includes(targetKind)&&owner.bench.length){
   // Flitter and Coin Hurl may target the Defending Active OR any of
   // its Bench. The original source Pokémon's side never chooses this.
   const options=[
    ...(copiedAnyTarget?[{id:'bench:-1',label:'Active: '+publicName(g,f.active)}]:[]),
    ...owner.bench.map((unit,i)=>({id:'bench:'+i,label:'Bench: '+publicName(g,unit)}))
   ];
   if(!Array.isArray(data.copyTarget)){chooseCopy('copyTarget',options,'Copied attack: choose opposing Pokémon');return;}
   if(data.copyTarget.length!==1||!options.some(x=>x.id===data.copyTarget[0]))fail('Invalid copied Pokémon target');
   chosenBench=Number(data.copyTarget[0].slice(6));
  }
  if(script.kind==='energy-discard'&&program.kind==='neo50:super-metronome')
   for(const i of data.payment.map(k=>Number(k.slice(7))).sort((a,b)=>b-a))p.discard.push(u.energies.splice(i,1)[0]);
  const result=ATTACK.resolve(script,()=>next(g,2)===1,coreContext);
  result.flips=[...(roll.flips||[]),...(result.flips||[])];
  roll=result;
 }
 if(program.kind.startsWith('neo48:')){
  const kind=program.kind.slice(6),pickables=[];
  let min=0,max=0,label='',actor=side;
  const choice=(ids,prefix,owner)=>ids.map((id,i)=>({id:`${prefix}:${i}`,label:owner(id,i)}));
  if(kind==='feint-attack'){
   pickables.push({id:'target:-1',label:`Active: ${publicName(g,f.active)}`},...f.bench.map((x,i)=>({id:`target:${i}`,label:`Bench: ${publicName(g,x)}`})));min=max=1;label='Feint Attack: choose an opposing Pokémon';
  }else if(kind==='sweet-nectar'&&roll.healFullChoice){
   pickables.push(...(p.active?.damage?[{id:'own:-1',label:`Active: ${publicName(g,p.active)}`}]:[]),...p.bench.flatMap((x,i)=>x.damage?[{id:`own:${i}`,label:`Bench: ${publicName(g,x)}`}]:[]));
   if(pickables.length){min=max=1;label='Sweet Nectar: choose one of your damaged Pokémon';}
  }else if(kind==='growth'&&roll.neo48Growth){
   pickables.push(...p.hand.flatMap((id,i)=>isEnergy(card(g,id))?[{id:`hand:${i}`,label:card(g,id).name}]:[]));max=Math.min(2,pickables.length);label='Growth: attach up to 2 Energy from hand';
  }else if(kind==='collect-fire'){
   pickables.push(...p.discard.flatMap((id,i)=>card(g,id).name==='Fire Energy'?[{id:`discard:${i}`,label:card(g,id).name}]:[]));max=Math.min(1,pickables.length);label='Collect Fire: attach a Fire Energy from your discard';
  }else if(kind==='flame-wheel'||kind==='flamethrower'||kind==='elemental-blast'){
   pickables.push(...u.energies.map((id,i)=>({id:`energy:${i}`,label:card(g,id).name})));
   min=max=kind==='flame-wheel'||kind==='elemental-blast'?3:Math.min(1,pickables.length);
   if(kind==='elemental-blast'&&!['Fire','Water','Lightning'].every(name=>u.energies.some(id=>card(g,id).name===name+' Energy')))fail('Elemental Blast requires one attached Fire, Water and Lightning Energy card');
   if(kind==='flame-wheel'&&u.energies.length<3)fail('Flame Wheel requires three attached Energy cards');
   label=kind==='elemental-blast'?'Elemental Blast: choose one Fire, Water and Lightning Energy to discard':`Choose ${min} Energy card(s) to discard`;
  }
  if(!extra.neo48Answered&&pickables.length&&max>0){
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neo48:${g.nextDecisionId}`,actor,kind:'neo-attack-choice',label,options:pickables,min,max,optional:min===0});
   g.pendingAction={kind:'neo48_select',side,attackIndex:index,roll,extra};return;
  }
  const choices=extra.neo48Choices||[];
  if(choices.length!==new Set(choices).size)fail('Duplicate Neo choice');
  const nums=(prefix)=>choices.filter(x=>x.startsWith(prefix+':')).map(x=>Number(x.slice(prefix.length+1)));
  if(kind==='feint-attack'&&(nums('target').length!==1||nums('target')[0]<-1||nums('target')[0]>=f.bench.length))fail('Feint Attack requires a valid target');
  if(kind==='sweet-nectar'&&roll.healFullChoice){const picks=nums('own');if(picks.length>1||picks.length&&!(picks[0]===-1?p.active:p.bench[picks[0]])?.damage)fail('Illegal Sweet Nectar target');}
  if(kind==='growth'&&roll.neo48Growth){const picks=nums('hand');if(picks.length>2||picks.some(i=>!Number.isInteger(i)||i<0||i>=p.hand.length||!isEnergy(card(g,p.hand[i]))))fail('Illegal Growth energy');}
  if(kind==='collect-fire'){const picks=nums('discard');if(picks.length>1||picks.some(i=>!Number.isInteger(i)||card(g,p.discard[i])?.name!=='Fire Energy'))fail('Illegal Collect Fire target');}
  if(['flame-wheel','flamethrower','elemental-blast'].includes(kind)){
   const picks=nums('energy'),expected=kind==='flamethrower'?Math.min(1,u.energies.length):3;
   if(picks.length!==expected||picks.some(i=>!Number.isInteger(i)||i<0||i>=u.energies.length))fail('Invalid Neo attack Energy discard');
   if(kind==='elemental-blast'&&(!['Fire Energy','Water Energy','Lightning Energy'].every(name=>picks.some(i=>card(g,u.energies[i]).name===name))||new Set(picks).size!==3))fail('Elemental Blast needs Fire, Water and Lightning Energy');
  }
  extra.neo48Choices=choices;
 }

 if(program.kind.startsWith('neo49:')){
  const kind=program.kind.slice(6),data=extra.neo49Data||{};
  const prompt=(stage,actor,options,{min=1,max=min,label=stage,optional=min===0}={})=>{
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neo49:${g.nextDecisionId}`,actor,kind:'neo-attack-choice',label,options,min,max,optional});
   g.pendingAction={kind:'neo49_select',stage,side,attackIndex:index,roll,extra,data};
  };
  const bench=(owner)=>owner.bench.map((v,i)=>({id:`bench:${i}`,label:publicName(g,v)}));
  const basic=(deck)=>deck.flatMap((id,i)=>isEnergy(card(g,id))&&['Grass Energy','Fire Energy','Water Energy','Lightning Energy','Psychic Energy','Fighting Energy'].includes(card(g,id).name)?[{id:`deck:${i}`,label:card(g,id).name}]:[]);
  if(kind==='rapid-spin'){
   if(f.bench.length&&!data.enemy){prompt('enemy',1-side,bench(f),{label:'Rapid Spin: defending player chooses their replacement'});return;}
   if(p.bench.length&&!data.own){prompt('own',side,bench(p),{label:'Rapid Spin: attacker chooses their replacement'});return;}
  }
  if(kind==='baton-pass'&&p.bench.length&&!data.own){prompt('own',side,bench(p),{label:'Baton Pass: choose your replacement to receive all Energy'});return;}
  if(kind==='fire-wind'&&f.bench.length&&!data.enemy){prompt('enemy',side,bench(f),{label:'Fire Wind: choose opposing Benched target'});return;}
  if(kind==='sweet-scent'){
   const owner=roll.neo49SweetScent==='self'?p:f;
   const options=[...(owner.active?.damage?[{id:'slot:-1',label:'Active: '+publicName(g,owner.active)}]:[]),...owner.bench.flatMap((v,i)=>v.damage?[{id:`slot:${i}`,label:'Bench: '+publicName(g,v)}]:[])];
   if(options.length&&!data.heal){prompt('heal',side,options,{label:'Sweet Scent: choose a damaged Pokémon to heal'});return;}
  }
  if(kind==='squaredance'&&roll.neo49Heads){const opts=basic(p.deck);if(opts.length&&!data.search){prompt('search',side,opts,{min:0,max:Math.min(roll.neo49Heads,opts.length),label:'Squaredance: take up to one Basic Energy for each heads'});return;}}
  if(kind==='belly-drum'&&u.damage+30<maxHP(g,u)){const opts=basic(p.deck);if(opts.length&&!data.search){prompt('search',side,opts,{min:0,max:Math.min(2,opts.length),label:'Belly Drum: attach up to 2 Basic Energy cards'});return;}}
  if(kind==='pilfer'&&roll.neo49Pilfer&&p.discard.length&&!data.discard){prompt('discard',side,p.discard.map((id,i)=>({id:`discard:${i}`,label:card(g,id).name})),{min:0,max:1,label:'Pilfer: optionally shuffle one discard card into your deck'});return;}
  const picks=(field,prefix,owner)=>{
   const items=data[field]||[],ids=items.map(id=>Number(id.slice(prefix.length)));
   if(new Set(ids).size!==ids.length||ids.some(i=>!Number.isInteger(i)||i< (prefix==='slot:'?-1:0)||i>=(owner||[]).length))fail('Invalid Neo v0.49 choice');
   return ids;
  };
  if(kind==='rapid-spin'){
   if(f.bench.length&&(!data.enemy||picks('enemy','bench:',f.bench).length!==1))fail('Rapid Spin requires defender replacement');
   if(p.bench.length&&(!data.own||picks('own','bench:',p.bench).length!==1))fail('Rapid Spin requires attacker replacement');
  }
  if(kind==='baton-pass'&&p.bench.length&&(!data.own||picks('own','bench:',p.bench).length!==1))fail('Baton Pass requires one Bench recipient');
  if(kind==='fire-wind'&&f.bench.length&&(!data.enemy||picks('enemy','bench:',f.bench).length!==1))fail('Fire Wind requires one Bench target');
  if(kind==='sweet-scent'&&data.heal){const owner=roll.neo49SweetScent==='self'?p:f;const targets=[owner.active,...owner.bench];const i=Number(data.heal[0]?.slice(5));if(!Number.isInteger(i)||i< -1||i>=owner.bench.length||!(i===-1?owner.active:owner.bench[i]).damage)fail('Illegal Sweet Scent heal');}
  if(['squaredance','belly-drum'].includes(kind)&&data.search){const choices=picks('search','deck:',p.deck);if(choices.length>(kind==='belly-drum'?2:roll.neo49Heads)||choices.some(i=>!basic(p.deck).some(o=>o.id===`deck:${i}`)))fail('Illegal Neo Basic Energy search');}
  if(kind==='pilfer'&&data.discard){const choices=picks('discard','discard:',p.discard);if(choices.length>1)fail('Pilfer can shuffle only one discard card');}
  extra.neo49Data=data;
 }
 if(program.kind==='gym:psyduck-esp'&&roll.gymPsyduckHeads===3){
  const copyable=(card(g,f.active.id).attacks||[]).flatMap((attack,i)=>{
   const script=ATTACK.compile(attack);
   // Effects that involve new targets, payments, mode choices, or copied
   // attacks need a separate decision chain and must not execute as flat damage.
   return script&&(script.kind!=='bench-target'||f.bench.length>0)&&
    (script.kind!=='energy-discard'||u.energies.filter(id=>!script.onlyType||attachedEnergyMatchesType(g,id,script.onlyType)).length>=script.quantity)&&['energy-discard','bench-target','target-any','target-any-coin','flat','status','coin-status','coin-times','coin-bonus','coin-status-split','coin-failure','draw-one','defender-counters','own-counters','flail-counters','minus-counters','bench-count','coin-times-short','ignore-weakness','coin-recoil-bonus','recoil','coin-recoil','bench-own','bench-both-recoil','bench-splash-coin','switch-self','switch-attacker','switch-defender','coin-shield','damage-shield','coin-attack-lock','coin-heal-one','drain','leech-seed','coin-draw','energy-coins'].includes(script.kind)?[{id:`attack:${i}`,label:attack.name}]:[];
  });
  if(extra.psyduckCopyIndex===undefined){
   if(copyable.length){g.nextDecisionId++;g.pendingDecision=makeDecision({id:`psyduck:${g.nextDecisionId}`,actor:side,kind:'opponent-attack',label:`Misty's Psyduck ESP: 3 heads! Copy a Defending Pokémon attack`,options:copyable,min:1,max:1});g.pendingAction={kind:'psyduck_esp_copy',side,attackIndex:index,roll,extra};return;}
   // All three heads with no implementable target is still a used attack.
   // Do not roll back and let a player retry until a more favorable outcome.
   log(g,"Misty's Psyduck ESP found no supported attack it could copy.");
  }else{
  if(!copyable.some(o=>o.id===`attack:${extra.psyduckCopyIndex}`))fail('Copied attack requires an interactive effect handler');
  const copied=ATTACK.compile(card(g,f.active.id).attacks[extra.psyduckCopyIndex]);
  if(['bench-target','switch-attacker','switch-self','target-any','target-any-coin'].includes(copied.kind)){
   const replacement=copied.kind==='switch-self'?p:f;
   if(replacement.bench.length&&(!Number.isInteger(chosenBench)||!replacement.bench[chosenBench])&&!(chosenBench===-1&&['target-any','target-any-coin'].includes(copied.kind)))fail('Copied attack needs a legal Bench choice');
   if(['target-any','target-any-coin'].includes(copied.kind)&&!replacement.bench.length&&chosenBench!==-1)fail('Copied attack needs its Active target');
  }
  if(copied.kind==='energy-discard'&&(!Array.isArray(extra.psyduckEnergyPayment)||extra.psyduckEnergyPayment.length!==copied.quantity||new Set(extra.psyduckEnergyPayment).size!==copied.quantity||extra.psyduckEnergyPayment.some(i=>!Number.isInteger(i)||!u.energies[i]||copied.onlyType&&!attachedEnergyMatchesType(g,u.energies[i],copied.onlyType))))fail('ESP copied attack must pay additional Energy');
  const effect=ATTACK.resolve(copied,()=>next(g,2)===1,coreContext);
  roll={...effect,flips:[...roll.flips,...(effect.flips||[])],gymPsyduckHeads:3};
  }
 }

 // Sabrina's ESP gives a single optional reroll of all flips of one attack.
 if(isClassicRules(g)&&roll.flips?.length&&!extra.gymESPChecked&&u.attachedTrainers.some(t=>card(g,t.id).name==="Sabrina's ESP")){
  g.nextDecisionId++;
  g.pendingDecision=makeDecision({id:`gymESP:${g.nextDecisionId}`,actor:side,kind:'gym-esp',label:`Sabrina’s ESP: re-flip all ${roll.flips.length} attack coin(s)?`,options:[{id:'choice:reroll',label:'Re-flip ALL coins'}],min:0,max:1,optional:true});
  g.pendingAction={kind:'sabrina_esp',side,attackIndex:index,roll,extra};return;
 }
 // Keep the three initial ESP flips cached across choices. Pay extra attack
 // costs exactly once, after the optional Sabrina's ESP reroll window.
 if(program.kind==='gym:psyduck-esp'&&extra.psyduckEnergyPayment&&!extra.psyduckPaymentApplied){
  const copied=ATTACK.compile(card(g,f.active.id).attacks[extra.psyduckCopyIndex]);
  if(!copied||copied.kind!=='energy-discard'||extra.psyduckEnergyPayment.length!==copied.quantity)fail('Invalid copied ESP payment');
  for(const i of [...extra.psyduckEnergyPayment].sort((a,b)=>b-a))
   p.discard.push(u.energies.splice(i,1)[0]);
  extra.psyduckPaymentApplied=true;
 }
 // A heads-only Energy discard is chosen by the attacking player, with the
 // coin cached across the decision. No hidden opponent cards are exposed.
 if(program.kind==='gym:removal-beam'&&roll.discardEnemyEnergy&&!protectedEnergy(f.active)&&f.active.energies.length>1&&!Number.isInteger(extra.enemyEnergyIndex)){
  g.nextDecisionId++;g.pendingDecision=makeDecision({id:`gymRemoval:${g.nextDecisionId}`,actor:side,kind:'energy-discard',label:`${a.name}: choose opposing Energy to discard`,options:f.active.energies.map((id,i)=>({id:`energy:${i}`,label:card(g,id).name})),min:1,max:1});
  g.pendingAction={kind:'gym_removal',side,attackIndex:index,preRoll:roll};return;
 }
 if(program.kind==='gym:removal-beam'&&roll.discardEnemyEnergy&&f.active.energies.length&&(!Number.isInteger(extra.enemyEnergyIndex)&&f.active.energies.length>1||Number.isInteger(extra.enemyEnergyIndex)&&!f.active.energies[extra.enemyEnergyIndex]))fail('Invalid Gym Energy choice');
 if(program.kind==='copy-attack'){
  const chosen=card(g,f.active.id).attacks[extra.copyIndex],copiedProgram=ATTACK.compile(chosen);
  const unsupported=new Set(['drag-off','copy-attack','mirror-move',...FINAL_KINDS]);
  if(!copiedProgram||unsupported.has(copiedProgram.kind))fail('Copied attack requires a separate interactive effect handler');
  const pickedTarget=new Set(['bench-target','target-any','target-any-coin','switch-attacker','switch-self']);
  if(pickedTarget.has(copiedProgram.kind)){
   const targetOwner=copiedProgram.kind==='switch-self'?p:f;
   if(targetOwner.bench.length){
    if(!Number.isInteger(chosenBench)||!targetOwner.bench[chosenBench])fail('Copied attack requires a legal Bench target');
   }else if(copiedProgram.kind==='target-any'||copiedProgram.kind==='target-any-coin'){
    if(chosenBench!==-1)fail('Copied any-Pokémon attack needs its Active target');
   }
  }
  // Classic Metronome waives both Energy and extra use costs according to
  // its printed text. The substituted attack uses the copier's own type.
  roll=ATTACK.resolve(copiedProgram,()=>next(g,2)===1,coreContext);
 }
 if(program.kind==='mirror-move'){const impact=u.lastAttackImpact;roll={damage:impact.damage||0,status:impact.status||null,flips:[],ignoreWR:true};}

 // Flytrap switches the Defending Pokémon BEFORE calculating 20 attack damage.
 if(roll.gymFlytrap){const i=Number(extra.gymLastData?.bench?.[0]?.slice(6));if(!Number.isInteger(i)||!f.bench[i])fail('Illegal Flytrap replacement');const old=f.active;f.active=f.bench.splice(i,1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);}
 // Houndour Plunder discards ALL attached Trainer cards on the Defending
 // Pokémon BEFORE damage/Defender/Charity calculations. Card ownership stays
 // with the defending player. No Trainer can remain attached and discarded.
 if(roll.discardDefenderTrainers){
  f.discard.push(...f.active.attachedTrainers.map(t=>t.id));
  f.active.attachedTrainers=[];
 }
 const defCard=effectiveCard(g,f.active),shield=hasActiveEffect(f.active,'shield',g)?f.active.shield:null;
 let baseDamage=roll.damage;
 // Focus Energy doubles the indicated base attack on the following turn only.
 // Rattata's Quick Attack bonus is NOT doubled; Raticate's recoil IS.
 if(u.gymFocus&&u.gymFocus.expires===g.turnSerial&&a.name===u.gymFocus.attack){
  baseDamage+=u.gymFocus.attack==='Quick Attack'?10:baseDamage;
  if(u.gymFocus.attack==='Double-edge')roll.selfDamage=(roll.selfDamage||0)*2;
  delete u.gymFocus;
 }
 if(a.name==='Floodlight'&&c.id==='neo1-38'&&CLASSIC_POWERS.enabled(g,u,'Hydroelectric Power')&&extra.hydroBoost===true){
  const water=u.energies.filter(id=>card(g,id).name==='Water Energy').length;
  baseDamage+=water*10;
 }
 if(a.name==='Hidden Power'&&card(g,u.id).name.startsWith('Unown')){
  const activeA=allPokemon(p).filter(x=>card(g,x.id).name==='Unown [A]'&&CLASSIC_POWERS.enabled(g,x,'Anger'));
  if(activeA.length)baseDamage+=Math.floor(activeA[0].damage/10)*10;
 }
 if(a.name==='Slash'&&u.swordsDance===g.turnSerial)baseDamage=60;
 if(u.id==='gym2-10'&&u.gymGiantGrowth&&a.name==='Pound')baseDamage=30;
 if(roll.gymGroupAttack)baseDamage=10*(allPokemon(p).filter(x=>card(g,x.id).name==="Koga's Zubat").length+(extra.gymLastData?.found?.length||0));
 // Metal Energy: on a non-Metal attacker it reduces damage before
 // Weakness/Resistance; on the defender it reduces damage AFTER those rules.
 // Darkness Energy provides a +10 attack bonus after Weakness/Resistance.
 const metalOnAttacker=specialEnergyCount(g,u,'Metal');
 if(metalOnAttacker&&!isMetalType(g,u))baseDamage=Math.max(0,baseDamage-10*metalOnAttacker);
 if(f.active.neo48Growl?.expires>g.turnSerial&&f.active.neo48Growl.sourceId===u.id)baseDamage=Math.max(0,baseDamage-10);
 let dmg=roll.ignoreWR?baseDamage:calculateDamage(c,defCard,baseDamage,f.active,{
  ignoreResistance:roll.ignoreResistance||u.attachedTrainers.some(t=>card(g,t.id).name==='Magnifier')||(g.stadium&&card(g,g.stadium.id).name==='Pewter City Gym'&&c.name.startsWith("Brock's ")),
  ignoreWeakness:g.stadium&&card(g,g.stadium.id).name==='Cinnabar City Gym'&&c.types?.includes('Water')&&defCard.name.startsWith("Blaine's "),
  resistancePenalty:g.stadium&&card(g,g.stadium.id).name==='Resistance Gym'?10:30
 });
 // Sprout Tower reduces Colorless Pokémon attack damage after W/R, for both players.
 if(dmg>0&&c.types?.includes('Colorless')&&g.stadium&&card(g,g.stadium.id).name==='Sprout Tower')dmg=Math.max(0,dmg-30);
 if(dmg>0){
  dmg=Math.max(0,dmg-10*specialEnergyCount(g,f.active,'Metal'));
  // The Darkness boost applies only when the attack actually damages.
  if(dmg>0)dmg+=10*specialEnergyCount(g,u,'Darkness');
 }
 if(isClassicRules(g)){
  if(!roll.ignoreDefendingEffects&&CLASSIC_POWERS.enabled(g,f.active,'Strange Barrier')&&c.subtypes?.includes('Basic')&&dmg>=20)dmg=10;
  if(!roll.ignoreDefendingEffects&&CLASSIC_POWERS.enabled(g,f.active,'Invisible Wall')&&dmg>=30)dmg=0;
  if(!roll.ignoreDefendingEffects&&CLASSIC_POWERS.enabled(g,f.active,'Kabuto Armor'))dmg=Math.floor(dmg/20)*10;
  if(!roll.ignoreDefendingEffects&&CLASSIC_POWERS.enabled(g,f.active,'Shell Armor'))dmg=Math.max(0,dmg-10);
  if(!roll.ignoreDefendingEffects&&CLASSIC_POWERS.enabled(g,f.active,'Transparency')&&next(g,2)===1){dmg=0;roll.status=null;roll.statuses=null;roll.poisonDamage=0;roll.discardEnemyEnergy=0;roll.noRetreat=false;roll.attackPenalty=false;roll.attackLock=false;}
  const defenders=roll.ignoreDefendingEffects?0:f.active.attachedTrainers.filter(t=>card(g,t.id).name==='Defender'&&t.expires>g.turnSerial).length;
  dmg=Math.max(0,dmg-defenders*20);
  const powers=u.attachedTrainers.filter(t=>card(g,t.id).name==='PlusPower'&&t.expires>g.turnSerial).length;
  if(dmg>0)dmg+=powers*10;
  if(CLASSIC_POWERS.enabled(g,u,'Frenzy')&&u.status==='Confused'&&dmg>0)dmg+=30;
 }
 if(dmg>0&&f.active.neo48CrunchUntil>g.turnSerial)dmg+=20;
 if(dmg>0&&f.active.neo48SlimeUntil>g.turnSerial&&next(g,2)===0){dmg=0;log(g,'Wooper Slime prevented damage on tails.');}
 // Frog Song adds a flat 40 only when Politoed damages the Defending Pokémon.
 if(dmg>0&&c.name==='Politoed'&&CLASSIC_POWERS.enabled(g,u,'Frog Song')&&
    g.players.reduce((n,owner)=>n+allPokemon(owner).filter(x=>['Poliwag','Poliwhirl','Poliwrath','Politoed'].includes(card(g,x.id).name)).length,0)>3){dmg+=40;log(g,'Frog Song boosted Politoed by 40 damage.');}
 // Relaxing Scent halves damage after Weakness/Resistance, rounded up to 10.
 const relaxing=isClassicRules(g)&&g.players.some(owner=>CLASSIC_POWERS.enabled(g,owner.active,'Relaxing Scent'));
 if(relaxing&&dmg>0)dmg=Math.ceil(dmg/20)*10;
 if(!roll.ignoreDefendingEffects&&f.active.reactiveShield&&f.active.reactiveShield.expires>g.turnSerial&&f.active.reactiveShield.sourceId===u.id)
  dmg=Math.max(0,dmg-f.active.reactiveShield.reduce);
 if(shield&&!roll.ignoreDefendingEffects){if(shield.allEffects||shield.preventDamage||shield.threshold!==undefined&&dmg<=shield.threshold)dmg=0;else if(shield.half)dmg=Math.floor(dmg/20)*10;else dmg=Math.max(0,dmg-(shield.reduce||0));}
 if(dmg>0&&c.types?.includes('Colorless')&&unownNormal(g,1-side))dmg=Math.max(0,dmg-30);
 if(dmg>0&&f.active.screech?.expires>g.turnSerial)dmg+=20;
 if(dmg>0&&p.mistyBoostUntil>g.turnSerial&&c.name.startsWith("Misty's "))dmg+=20;
 if(program.kind==='theme:bonfire'){
  const count=roll.flips.filter(Boolean).length,available=u.energies.filter(id=>card(g,id).name==='Fire Energy').length;
  roll.damage=count&&count<=available?count*10:0; // Bonfire requires payment for every head.
  dmg=roll.damage;
 }
 if(roll.gymDamageShift)dmg=0; // Counters move directly, bypassing Weakness, Resistance and Defender.
 if(program.kind==='theme:life-drain')dmg=0; // places counters, never attack damage
 if(program.kind==='theme:focus')dmg=0;
 if(program.kind==='theme:shadow-attack')dmg=0;
 if(a.name==='Gnaw'&&u.themeFocusUntil>g.turnSerial){dmg*=2;delete u.themeFocusUntil;}
 // Charity may reduce any amount of positive damage in 10-point increments.
 if(extra.gymCharityApproved){dmg=extra.charityBaseDamage-extra.charityReduction;}
 else if(isClassicRules(g)&&dmg>0&&u.attachedTrainers.some(t=>card(g,t.id).name==='Charity')){
  g.nextDecisionId++;
  g.pendingDecision=makeDecision({id:`gymCharity:${g.nextDecisionId}`,actor:side,kind:'gym-charity',label:`Charity: reduce ${dmg} damage by how much?`,options:Array.from({length:Math.floor(dmg/10)+1},(_,i)=>({id:`reduce:${i*10}`,label:`Reduce by ${i*10}`})),min:1,max:1});
  g.pendingAction={kind:'gym_charity',side,attackIndex:index,roll,extra,damage:dmg};return;
 }
 // Flee is a defender-owned reaction, not an attacker's automatic switch.
 // The coin outcome is saved so answering does not roll the attack twice.
 if(isClassicRules(g)&&dmg>0&&CLASSIC_POWERS.enabled(g,f.active,'Flee')&&f.bench.length&&!extra.fleeChecked){
  g.nextDecisionId++;
  g.pendingDecision=makeDecision({id:`flee:${g.nextDecisionId}`,actor:1-side,kind:'flee',
   label:"Misty's Tentacruel: switch after taking damage and avoid other attack effects?",
   options:f.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min:1,max:1,optional:true});
  g.pendingAction={kind:'flee_reaction',side,attackIndex:index,extra:{...extra,preRoll:roll,fleeChecked:true}};
  return;
 }
 if(extra.fleeBenchIndex!==undefined&&(!Number.isInteger(extra.fleeBenchIndex)||!f.bench[extra.fleeBenchIndex]))fail('Invalid Flee replacement');
 const priorDefender=f.active,priorDefDamage=f.active.damage,priorDefStatus=f.active.status;
 if(isClassicRules(g)&&f.active.gymShadowImages){
  if(next(g,2)===0){dmg=0;log(g,`Shadow Images prevented attack damage to ${card(g,f.active.id).name}.`);}
  else if(dmg>0)delete f.active.gymShadowImages;
 }
 if(program.kind==='gym:last-magic-darts'||program.kind==='gym:last-flame-jet'){
  const key=extra.gymLastData?.target?.[0],which=Number(key?.split(':')[1]);
  if((program.kind==='gym:last-magic-darts'||roll.flips[0])&&(!key||!Number.isInteger(which)||which< -1||which>=f.bench.length))fail('Illegal Gym attack target');
  if(program.kind==='gym:last-flame-jet'&&!roll.flips[0])dmg=0;
  if(key&&which>=0){if(dmg>0)f.bench[which].damage+=dmg;dmg=0;}
 }
 f.active.damage+=dmg;
 if(isClassicRules(g)&&dmg>0&&CLASSIC_POWERS.enabled(g,f.active,'Strikes Back'))u.damage+=10;
 if(dmg>0){const tool=f.active.attachedTrainers.findIndex(t=>card(g,t.id).name==='Counterattack Claws');
  if(tool>=0){const used=f.active.attachedTrainers.splice(tool,1)[0];f.discard.push(used.id);if(next(g,2)===1)u.damage+=20;}
 }
 // Keep damage on the original Tentacruel, then switch before any other
 // effect on that Pokémon can resolve. Damage is not prevented by Flee.
 if(dmg>0&&extra.fleeBenchIndex!==undefined){
  const fleeing=f.active;
  f.active=f.bench.splice(extra.fleeBenchIndex,1,fleeing)[0];
  STATUS.clearConditions(fleeing);clearBenchEffects(fleeing);
  roll={...roll,status:null,statuses:null,poisonDamage:0,discardEnemyEnergy:0,
   noRetreat:false,attackLock:false,attackPenalty:false,screech:false,
   bounceDefender:false,returnDefenderToDeck:false,forceSwitch:null};
  log(g,`${card(g,fleeing.id).name} used Flee and switched to ${card(g,f.active.id).name}.`);
 }
 if(dmg>0&&isClassicRules(g)&&f.active.gymFireWall?.expires>g.turnSerial){
  const reflected=calculateDamage(effectiveCard(g,f.active),c,10,u);
  u.damage+=relaxing?Math.ceil(reflected/20)*10:reflected;
  log(g,`Fire Wall retaliated for ${reflected} damage.`);
 }
 if(dmg>0&&isClassicRules(g)&&f.active.gymCrosscounter?.expires>g.turnSerial&&next(g,2)===1){
  const reflected=calculateDamage(effectiveCard(g,f.active),c,dmg*2,u);
  u.damage+=relaxing?Math.ceil(reflected/20)*10:reflected;
  log(g,`Crosscounter retaliated for ${reflected} damage.`);
 }
 if(dmg>0&&p.kogaPoisonUntil>g.turnSerial&&c.name.startsWith("Koga's ")&&! (extra.fleeBenchIndex!==undefined))applyCondition(g,f.active,'Poisoned');
 if(dmg>0&&isClassicRules(g)){
  if(CLASSIC_POWERS.enabled(g,f.active,'Pollen Defense')&&next(g,2)===1)applyCondition(g,u,'Confused');
  if(CLASSIC_POWERS.enabled(g,f.active,'Restless Sleep')&&priorDefStatus==='Asleep')u.damage+=20;
 }

 if(!shield?.allEffects||roll.ignoreDefendingEffects){if(roll.status)applyCondition(g,f.active,roll.status);if(roll.statuses)for(const status of roll.statuses)applyCondition(g,f.active,status);}
 const benchProtected=owner=>owner.transparentWallsUntil>g.turnSerial||Boolean(owner.themeBenchShield?.expires>g.turnSerial&&owner.active?.id===owner.themeBenchShield.sourceId);
 const hitBench=(owner,target,damage)=>{if(target&&!benchProtected(owner)){
  const victim=g.players.indexOf(owner),amount=c.types?.includes('Colorless')&&unownNormal(g,victim)?Math.max(0,damage-30):damage;
  const reduced=relaxing&&amount>0?Math.ceil(amount/20)*10:amount;
  const defended=isClassicRules(g)&&CLASSIC_POWERS.enabled(g,target,'Shell Armor')?Math.max(0,reduced-10):reduced;
  target.damage+=defended;
  if(defended>0&&isClassicRules(g)&&owner.bench.includes(target)&&owner.bench.some(x=>x!==target&&CLASSIC_POWERS.enabled(g,x,'Bench Guard'))){
   (g.benchGuardQueue ||= []).push({owner:victim,targetIndex:owner.bench.indexOf(target),amount:defended});
  }
 }};
 // Neo multi-target attacks resolve through the existing Bench-damage helper
 // so Bench Guard, Relaxing Scent and other general Bench effects are honored.
 if(roll.neo49FireWind&&f.bench.length){const i=Number(extra.neo49Data.enemy[0].slice(6));hitBench(f,f.bench[i],10*roll.neo49FireWind);}
 if(dmg>0&&f.active.neo49CounterUntil>g.turnSerial&&next(g,2)===1){
  const retaliation=calculateDamage(effectiveCard(g,f.active),c,dmg,u);u.damage+=retaliation;log(g,`Wobbuffet Counter dealt ${retaliation} attack damage.`);
 }
 if(dmg>0&&f.active.neo49PoisonUntil>g.turnSerial){applyCondition(g,u,'Poisoned');for(const victim of p.bench)hitBench(p,victim,10);log(g,'Kakuna Secrete Poison retaliated.');}
 if(roll.neo48Trample)for(const owner of g.players)for(const victim of owner.bench)if(next(g,2)===1)hitBench(owner,victim,30);
 if(roll.neo48Zzzap)for(const owner of g.players)for(const victim of allPokemon(owner))if(!victim.secretPlanFaceDown&&(card(g,victim.id).abilities||[]).length){if(owner.active===victim)victim.damage+=20;else hitBench(owner,victim,20);}
 if(roll.neo48Shockwave){if(roll.neo48ShockwaveDamage){f.active.damage+=10;for(const victim of f.bench)hitBench(f,victim,10);}roll.forceSwitch='switch-defender';}
 if(program.kind.startsWith('theme:')){
  const d=extra.theme||{},effect=program.effect,heads=Boolean(roll.flips[0]);
  const choice=(key,prefix)=>d[key]?.map(id=>Number(id.slice(prefix.length)))||[];
  const selfEnergy=(list)=>{for(const i of [...list].sort((a,b)=>b-a))p.discard.push(u.energies.splice(i,1)[0]);};
  const takeOwnPokemon=slot=>{const x=p.bench.splice(slot,1)[0];return [x.id,...x.under,...x.energies,...x.attachedTrainers.map(t=>t.id)];};
  if(['call-brock','call-misty'].includes(effect)&&heads&&d.search?.length){const i=choice('search','deck:')[0];p.bench.push(unit(p.deck.splice(i,1)[0],g.round));p.deck=shuffle(g,p.deck);}
  if(['call-brock','call-misty'].includes(effect)&&heads&&!d.search?.length)p.deck=shuffle(g,p.deck);
  if(effect==='rapids'&&heads&&d.enemyEnergy?.length){f.discard.push(f.active.energies.splice(choice('enemyEnergy','energy:')[0],1)[0]);}
  if(effect==='crystal-beam'&&heads)f.active.energyAttachBlockSerial=g.turnSerial+3;
  if(effect==='focus')u.themeFocusUntil=g.turnSerial+3;
  if(effect==='magic-pollen'&&heads&&d.status?.length)applyCondition(g,f.active,d.status[0].slice(7));
  if(effect==='hyper-needle')(u.gymAttackOnce ||= []).push(index);
  if(effect==='sludge-grip'&&heads&&d.bench?.length){const old=f.active;f.active=f.bench.splice(choice('bench','bench:')[0],1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);applyCondition(g,f.active,'Poisoned');}
  if(effect==='obscuring-gas'&&heads)roll.themeReturn='shuffle';
  if(effect==='life-drain'&&heads)f.active.damage+=Math.max(0,maxHP(g,f.active)-f.active.damage-10);
  if(effect==='fade-out')roll.themeReturn='hand';
  if(effect==='shadow-attack'&&heads&&d.bench?.length)hitBench(f,f.bench[choice('bench','bench:')[0]],30);
  if(effect==='helping-hand'&&d.target?.length){const target=located(f,choice('target','slot:')[0]),amount=choice('amount','amount:')[0];target.damage=Math.max(0,target.damage-10*amount);draw(g,side,amount);}
  if(effect==='fire-tail'&&!heads&&d.fire?.length)selfEnergy(choice('fire','energy:'));
  if(effect==='bonfire'){
   const n=roll.flips.filter(Boolean).length;
   if(n&&d.fire?.length===n){selfEnergy(choice('fire','energy:'));for(const x of f.bench)hitBench(f,x,10*n);}
  }
  if(effect==='hind-kick'&&heads&&d.bench?.length){const old=p.active;p.active=p.bench.splice(choice('bench','bench:')[0],1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);}
  if(effect==='stamp'&&heads)for(const x of f.bench)hitBench(f,x,10);
  if(effect==='will-o-wisp')for(let i=0;i<roll.flips.filter(Boolean).length;i++){const j=p.discard.findIndex(id=>card(g,id).name==='Fire Energy');if(j<0)break;p.hand.push(p.discard.splice(j,1)[0]);}
  if(effect==='false-charity'&&heads&&f.deck.length){const id=f.deck.pop();(card(g,id).supertype==='Trainer'?f.discard:f.hand).push(id);}
  if(effect==='incinerate'&&f.deck.length&&card(g,f.deck.at(-1)).supertype==='Trainer')f.discard.push(f.deck.pop());
  if(effect==='rushing-magma')for(let i=0;i<5&&p.deck.length;i++)p.discard.push(p.deck.pop());
  if(effect==='rushing-flames'){
   const selected=d.sources.map(x=>{const [slot,i]=x.slice(7).split(':').map(Number);return {slot,i};});
   for(const slot of new Set(selected.map(x=>x.slot))){const x=located(p,slot);const indices=selected.filter(s=>s.slot===slot).map(s=>s.i);for(const i of indices.sort((a,b)=>b-a))p.discard.push(x.energies.splice(i,1)[0]);}
  }
  if(effect==='lava-flow')selfEnergy(choice('sources','energy:'));
  if(effect==='ball-of-flame'&&d.fire?.length){selfEnergy(choice('fire','energy:'));if(d.bench?.length)hitBench(f,f.bench[choice('bench','bench:')[0]],20);}
  if(effect==='call-back'&&d.recover?.length){const id=f.discard.splice(choice('recover','deck:')[0],1)[0],target=unit(id,g.round);target.damage=10;f.bench.push(target);}
  if(effect==='return-home'&&d.bench?.length){p.deck=shuffle(g,[...p.deck,...takeOwnPokemon(choice('bench','bench:')[0])]);}
  if(effect==='bubble-jump'&&heads&&d.bench?.length&&d.energy?.length===2){
   const target=p.bench[choice('bench','bench:')[0]];
   for(const i of choice('energy','energy:').sort((a,b)=>b-a))target.energies.push(u.energies.splice(i,1)[0]);
   roll.themeReturn='hand';
  }
  if(effect==='ice-pillar')p.themeBenchShield={sourceId:u.id,expires:g.turnSerial+3};
 }

 // Final Gym attacks with deck/hand/energy transactions after damage.
 if(GYM_LAST.planned(program.kind)){
  const d=extra.gymLastData,kind=program.kind.slice('gym:last-'.length),heads=roll.flips[0];
  const indexOf=(key)=>Number(d[key]?.[0]?.split(':').at(-1));
  const pull=(arr,selected)=>[...selected].map(x=>Number(x.split(':').at(-1))).sort((a,b)=>b-a).map(i=>({i,id:arr.splice(i,1)[0]})).sort((a,b)=>a.i-b.i).map(x=>x.id);
  if(kind==='electric-current'){const e=indexOf('energy');const id=u.energies.splice(e,1)[0];if(p.bench.length)p.bench[indexOf('bench')].energies.push(id);else p.discard.push(id);}
  if(kind==='kindle'){p.discard.push(...pull(u.energies,d.energy));if(d.enemy?.length)f.discard.push(...pull(f.active.energies,d.enemy));}
  if(kind==='sleight-hand'){
   const top=pull(p.hand,d.top||[]);p.deck.push(...top);
   p.hand.push(...pull(p.deck,d.found||[]));p.deck=shuffle(g,p.deck);
  }
  if(kind==='growth'&&heads)u.energies.push(...pull(p.hand,d.hand||[]));
  if(kind==='super-removal'&&heads)for(const [si,v] of [[-1,f.active],...f.bench.map((x,i)=>[i,x])])if(d['energy'+si]?.length)f.discard.push(...pull(v.energies,d['energy'+si]));
  if(kind==='overhead-toss'&&!heads&&d.bench?.length)p.bench[indexOf('bench')].damage+=20;
  if(kind==='errand'&&heads){if(d.found?.length)p.hand.push(...pull(p.deck,d.found));p.deck=shuffle(g,p.deck);}
  if(kind==='lunar-power'&&heads){if(d.evolve?.length){const [_,slot,ix]=d.evolve[0].split(':').map(Number);const target=p.bench[slot],id=p.deck.splice(ix,1)[0];target.under.unshift(target.id);target.id=id;target.playedTurn=g.round;STATUS.clearConditions(target);clearBenchEffects(target);}p.deck=shuffle(g,p.deck);}
  if(kind==='invigorate'){const [_,owner,ix]=d.revive[0].split(':').map(Number),op=g.players[owner],id=op.discard.splice(ix,1)[0],revived=unit(id,g.round);revived.damage=Math.floor(Number(card(g,id).hp)/20)*10;op.bench.push(revived);}
  if(kind==='pranks'&&heads&&d.discard?.length)f.deck.push(...pull(f.discard,d.discard));
  if(kind==='overrun'&&heads&&d.bench?.length)f.bench[indexOf('bench')].damage+=20;
  if(kind==='group-attack'){p.bench.push(...pull(p.deck,d.found||[]).map(id=>unit(id,g.round)));p.deck=shuffle(g,p.deck);}
  if(kind==='amnesia')f.active.amnesia={index:indexOf('attack'),expires:g.turnSerial+2};
  if(kind==='earthdrill'){} 
  if(kind==='messenger'){
   p.deck.push(u.id,...u.under,...u.energies,...u.attachedTrainers.map(x=>x.id));
   if(d.found?.length)p.hand.push(...pull(p.deck,d.found));p.deck=shuffle(g,p.deck);
   p.active=null;
  }
  if(kind==='fairy-power'&&heads)for(const si of (d.returns||[]).map(x=>Number(x.slice(5))).sort((a,b)=>b-a)){
   const target=si===-1?p.active:p.bench[si];if(!target)fail('Fairy Power target missing');
   p.hand.push(target.id,...target.under,...target.energies,...target.attachedTrainers.map(x=>x.id));
   if(si===-1)p.active=null;else p.bench.splice(si,1);
  }
  if(kind==='call-night'&&roll.flips.every(Boolean)&&f.active.damage<maxHP(g,f.active)){
   const v=f.active;f.deck=shuffle(g,[...f.deck,v.id,...v.under,...v.energies,...v.attachedTrainers.map(x=>x.id)]);f.active=null;
  }
  if(kind==='take-away'){
   for(const owner of [p,f]){const v=owner.active;owner.deck=shuffle(g,[...owner.deck,v.id,...v.under,...v.energies,...v.attachedTrainers.map(x=>x.id)]);owner.active=null;}
  }
 }
 // Gym-specific effects with strict card conservation. Damage and shields
 // resolve first; KO handling stays in the existing common pipeline.
 if(u.id==='gym2-22'&&a.name==='Lie Low')u.gymLieLowSerial=g.turnSerial;
 if(roll.neo49LockOn){u.neo49LockOn={expires:g.turnSerial+3,targetId:f.active.id};f.active.neo49LockTarget={side,sourceId:u.id};}
 if(roll.neo49Counter)u.neo49CounterUntil=g.turnSerial+2;
 if(roll.neo49SecretePoison)u.neo49PoisonUntil=g.turnSerial+2;
 if(roll.neo49Pursuit)f.active.neo49Pursuit={sourceId:u.id,expires:g.turnSerial+2};
 if(roll.neo49BellyDrum)u.damage+=30;
 if(roll.neo49SweetScent&&extra.neo49Data?.heal){const sideTarget=roll.neo49SweetScent==='self'?p:f,i=Number(extra.neo49Data.heal[0].slice(5));const target=i===-1?sideTarget.active:sideTarget.bench[i];target.damage=Math.max(0,target.damage-20);}
 if(program.kind==='neo49:squaredance'){for(const i of (extra.neo49Data?.search||[]).map(id=>Number(id.slice(5))).sort((a,b)=>b-a))p.hand.push(p.deck.splice(i,1)[0]);p.deck=shuffle(g,p.deck);}
 if(roll.neo49BellyDrum&&u.damage<maxHP(g,u)){for(const i of (extra.neo49Data?.search||[]).map(id=>Number(id.slice(5))).sort((a,b)=>b-a))u.energies.push(p.deck.splice(i,1)[0]);p.deck=shuffle(g,p.deck);}
 if(roll.neo49Rapid){
  const switchActive=(owner,index)=>{const old=owner.active;owner.active=owner.bench.splice(index,1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);};
  if(f.bench.length)switchActive(f,Number(extra.neo49Data.enemy[0].slice(6)));
  if(p.bench.length)switchActive(p,Number(extra.neo49Data.own[0].slice(6)));
 }
 if(roll.neo49Baton&&p.bench.length){const i=Number(extra.neo49Data.own[0].slice(6));const previous=u;const chosen=p.bench[i];chosen.energies.push(...previous.energies);previous.energies=[];p.active=p.bench.splice(i,1,previous)[0];STATUS.clearConditions(previous);clearBenchEffects(previous);}
 if(roll.neo48MeanLook){const key=`${side}:${g.turnSerial}:${u.id}`;u.neo48MeanLook=key;f.active.neo48MeanLook=key;}
 if(roll.neo48PollenShield)u.neo48PollenShieldUntil=g.turnSerial+2;
 if(roll.neo48Growl)u.neo48Growl={expires:g.turnSerial+2,sourceId:f.active.id};
 if(roll.neo48Endure)u.neo48Endure={expires:g.turnSerial+2};
 if(roll.neo48Freeze)f.active.attackLock={expires:g.turnSerial+2,targetId:u.id};
 if(roll.neo48Slime)u.neo48SlimeUntil=g.turnSerial+2;
 if(roll.neo48Crunch)f.active.neo48CrunchUntil=g.turnSerial+3;
 if(roll.neo48EnergyDiscard){const chosen=extra.neo48Choices?.filter(x=>x.startsWith('energy:')).map(x=>Number(x.slice(7)))||[];for(const i of chosen.sort((a,b)=>b-a))p.discard.push(u.energies.splice(i,1)[0]);}
 if(roll.neo48DiscardColors){const chosen=extra.neo48Choices.filter(x=>x.startsWith('energy:')).map(x=>Number(x.slice(7)));for(const i of chosen.sort((a,b)=>b-a))p.discard.push(u.energies.splice(i,1)[0]);}
 if(roll.neo48Growth){for(const i of (extra.neo48Choices||[]).filter(x=>x.startsWith('hand:')).map(x=>Number(x.slice(5))).sort((a,b)=>b-a))u.energies.push(p.hand.splice(i,1)[0]);}
 if(roll.neo48CollectFire){for(const i of (extra.neo48Choices||[]).filter(x=>x.startsWith('discard:')).map(x=>Number(x.slice(8))).sort((a,b)=>b-a))u.energies.push(p.discard.splice(i,1)[0]);}
 if(roll.healFullChoice){const choice=extra.neo48Choices?.[0];if(choice){const i=Number(choice.slice(4)),victim=i===-1?p.active:p.bench[i];victim.damage=0;}}
 if(roll.targetDamage!==undefined&&program.kind==='neo48:feint-attack'){const index=Number(extra.neo48Choices?.[0]?.slice(7));if(index!==-1&&f.bench[index])f.bench[index].damage+=roll.targetDamage;else if(index===-1)f.active.damage+=roll.targetDamage;roll.targetDamage=undefined;}
 if(roll.gymCrosscounter)u.gymCrosscounter={expires:g.turnSerial+2};
 if(roll.gymFireWall)u.gymFireWall={expires:g.turnSerial+2};
 if(roll.gymShadowImages)u.gymShadowImages=true;
 if(roll.gymDamageShift){
  let shifted=0;
  for(const target of allPokemon(p))if(target.damage>=10){target.damage-=10;shifted+=10;}
  f.active.damage+=shifted;
 }
 if(roll.gymGiantGrowth)u.gymGiantGrowth=true;
 if(roll.gymInkSpurt)f.active.gymInkSpurt=true;
 if(roll.gymRoaringFlames){for(let i=u.energies.length-1;i>=0;i--)if(card(g,u.energies[i]).name==='Fire Energy')p.discard.push(u.energies.splice(i,1)[0]);}
 if(roll.gymEnergyLoop){const choices=u.energies.flatMap((id,i)=>card(g,id).name==='Psychic Energy'?[i]:[]);const i=extra.gymLoopEnergy??choices[0];p.hand.push(u.energies.splice(i,1)[0]);}
 if(roll.gymAlert){draw(g,side);const old=p.active;p.active=p.bench.splice(extra.gymAlertBench,1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);}
 if(roll.gymSwapCounters){const previous=u.damage;u.damage=f.active.damage;f.active.damage=previous;}
 if(roll.gymFocus)u.gymFocus={attack:roll.gymFocus,expires:g.turnSerial+2};
 if(roll.gymSurprise&&f.hand.length){const index=randomRaw(g,f.hand.length),id=f.hand.splice(index,1)[0];f.deck=shuffle(g,[...f.deck,id]);(p.privateLog ||= []).push('Surprise revealed '+card(g,id).name);}
 if(roll.gymPlasma){const i=p.discard.findIndex(id=>card(g,id).name==='Lightning Energy');if(i>=0)u.energies.push(p.discard.splice(i,1)[0]);}
  if(roll.gymPainAmplifier){if(f.active.damage>0)f.active.damage+=10;for(const victim of f.bench)if(victim.damage>0)hitBench(f,victim,10);}
 if(roll.gymStorm)for(const owner of g.players)for(const victim of owner.bench)hitBench(owner,victim,20);
 if(roll.gymWaterRing)for(const owner of g.players)for(const victim of owner.bench)if(!card(g,victim.id).types?.includes('Water'))hitBench(owner,victim,10);
 if(roll.selfDamage)u.damage+=relaxing?Math.ceil(roll.selfDamage/20)*10:roll.selfDamage;
 if(roll.disableThisAttack)u.gymAttackCooldown={index,expires:g.turnSerial+3};
 if(roll.disableAllAttacks)u.gymAttackCooldown={index:null,expires:g.turnSerial+3};
 if(roll.discardAllTypeEnergy){
  for(let i=u.energies.length-1;i>=0;i--)if(card(g,u.energies[i]).name===roll.discardAllTypeEnergy+' Energy')p.discard.push(u.energies.splice(i,1)[0]);
 }
 if(roll.discardStadium&&g.stadium){g.players[g.stadium.owner].discard.push(g.stadium.id);delete g.players[g.stadium.owner].stadium;g.stadium=null;}
 if(roll.healOwnTeam)for(const x of allPokemon(p))x.damage=Math.max(0,x.damage-roll.healOwnTeam);
 if(roll.healEveryPokemon)for(const owner of g.players)for(const x of allPokemon(owner))x.damage=Math.max(0,x.damage-roll.healEveryPokemon);
 if(roll.opponentBenchType)for(const x of f.bench)if(card(g,x.id).types?.includes(roll.opponentBenchType))x.damage+=roll.opponentBenchTypeDamage;
 if(roll.clearDefenderSleep&&f.active.status==='Asleep')STATUS.clearConditions(f.active);
 if(roll.shuffleOwnDeck)p.deck=shuffle(g,p.deck);
 if(['gym:search-basic-energy','gym:search-fire-attach','gym:charge-lightning','gym:jellyfish-search'].includes(program.kind)){
  const fromDiscard=program.kind==='gym:charge-lightning',source=fromDiscard?p.discard:p.deck;
  const selected=extra.gymSearchPicks||[];const moved=[...selected].sort((a,b)=>b-a).map(i=>({i,id:source.splice(i,1)[0]})).sort((a,b)=>a.i-b.i).map(x=>x.id);
  if(fromDiscard||program.kind==='gym:search-fire-attach')u.energies.push(...moved);else p.hand.push(...moved);
  if(!fromDiscard)p.deck=shuffle(g,p.deck);
 }

 if(roll.peekOpponentHand)(p.privateLog ||= []).push('Psyscan: opponent hand — '+f.hand.map(id=>card(g,id).name).join(', '));
 if(program.kind==='gym:single-use-coin')(u.gymAttackOnce ||= []).push(index);

 if(roll.spreadExcludeType){for(const owner of g.players)for(const target of allPokemon(owner))if(!card(g,target.id).types?.includes(roll.spreadExcludeType)){if(target===owner.active)target.damage+=roll.spreadAmount||0;else hitBench(owner,target,roll.spreadAmount||0);}}
 if(roll.poisonDamage&&(!shield?.allEffects||roll.ignoreDefendingEffects))f.active.poisonDamage=roll.poisonDamage;
 if(roll.markOnce)u.leekSlapUsed=true;
 if(roll.convertWeakness)f.active.weaknessOverride=extra.color;
 if(roll.convertResistance)u.resistanceOverride=extra.color;
 if(roll.millFromFire){
  const picks=extra.fireIndices||[];
  for(const i of [...picks].sort((a,b)=>b-a))p.discard.push(u.energies.splice(i,1)[0]);
  for(let i=0;i<picks.length&&f.deck.length;i++)f.discard.push(f.deck.pop());
 }
 if(roll.retrieveEnergy){
  for(const i of [...(extra.discardIndices||[])].sort((a,b)=>b-a))p.hand.push(p.discard.splice(i,1)[0]);
 }
 if(roll.rapidEvolve){
  if(extra.deckIndex!==undefined){u.under.unshift(u.id);u.id=p.deck.splice(extra.deckIndex,1)[0];u.playedTurn=g.round;STATUS.clearConditions(u);clearBenchEffects(u);delete u.leekSlapUsed;}
  p.deck=shuffle(g,p.deck);
 }
 if(roll.attachEnergyFromDeck){
  if(extra.deckIndex!==undefined)u.energies.push(p.deck.splice(extra.deckIndex,1)[0]);
  p.deck=shuffle(g,p.deck);
 }
 if(roll.swordsDance)u.swordsDance=g.turnSerial+2;
 if(roll.lockTrainers)f.trainerLockedUntil=g.turnSerial+2;
 if(roll.splashNamed)for(const owner of g.players)for(const x of allPokemon(owner))if(roll.splashNamed.names.includes(card(g,x.id).name)){if(x===owner.active)x.damage+=roll.splashNamed.amount;else hitBench(owner,x,roll.splashNamed.amount);}
 if(roll.reactiveReduction)u.reactiveShield={sourceId:f.active.id,reduce:roll.reactiveReduction,expires:g.turnSerial+2};
 if(roll.neo47Static){
  for(const ix of [...extra.neo47Search].sort((a,b)=>b-a))u.energies.push(p.deck.splice(ix,1)[0]);
  p.deck=shuffle(g,p.deck);
  log(g,`Static Electricity attached ${extra.neo47Search.length} Lightning Energy card(s).`);
 }
 if(roll.neo47DiscardLightning){
  const left=[];for(const id of u.energies){if(card(g,id).name==='Lightning Energy')p.discard.push(id);else left.push(id);}u.energies=left;
 }
 if(roll.neo47MoveLightning){
  const moved=u.energies.splice(extra.neo47EnergyIndex,1)[0];
  if(p.bench.length)p.bench[extra.neo47BenchIndex].energies.push(moved);
  else p.discard.push(moved);
 }
 if(roll.discardAllSelfEnergy){p.discard.push(...u.energies);u.energies=[];}
 if(roll.placeCounters)f.active.damage+=10*roll.placeCounters;
 if(roll.millOpponent)for(let i=0;i<roll.millOpponent&&f.deck.length;i++)f.discard.push(f.deck.pop());
 if(roll.shuffleDiscardEnergies){const recycled=p.discard.filter(id=>isEnergy(card(g,id)));p.discard=p.discard.filter(id=>!isEnergy(card(g,id)));p.deck=shuffle(g,[...p.deck,...recycled]);}
 if(roll.healAllSelf)u.damage=0;
 if(roll.discardEnemyEnergy&&f.active.energies.length&&!f.active.attachedTrainers.some(t=>card(g,t.id).name==="Brock's Protection")){const k=extra.enemyEnergyIndex??0;f.discard.push(f.active.energies.splice(k,1)[0]);}
 if(roll.callFamily!==undefined){
  if(extra.familyIndex!==undefined){const k=extra.familyIndex;p.bench.push(unit(p.deck.splice(k,1)[0],g.round));}
  p.deck=shuffle(g,p.deck);
 }
 if(roll.chainLightning&&defCard.types?.[0]!=='Colorless')for(const owner of [p,f])for(const x of owner.bench)if(card(g,x.id).types?.includes(defCard.types[0]))hitBench(owner,x,roll.chainLightning);
 if(roll.benchHits)for(const k of roll.benchHits)if(f.bench[k])hitBench(f,f.bench[k],roll.benchHitDamage);
 if(roll.benchChosenDamage){const picks=program.kind==='gym:bench-select'?extra.gymBenchPicks:(extra.benchPicks??f.bench.map((_,i)=>i));for(const k of picks)if(f.bench[k])hitBench(f,f.bench[k],roll.benchChosenDamage);}

 if(roll.selfStatus)applyCondition(g,u,roll.selfStatus);
 if(roll.healFromDamage){const amount=roll.healFromDamage==='seed'?(dmg?10:0):roll.healFromDamage==='half'?Math.ceil(dmg/20)*10:dmg;u.damage=Math.max(0,u.damage-amount);}
 if(roll.poisonIfDamaged&&dmg>0)applyCondition(g,f.active,'Poisoned');
 if(roll.screech)f.active.screech={expires:g.turnSerial+3};
 if(roll.jawClamp||roll.neo50StickyLock){f.active.noRetreat={expires:g.turnSerial+2};f.active.noSwitch={expires:g.turnSerial+2,sourceId:u.id};}
 if(roll.charCounter&&(!shield?.allEffects||roll.ignoreDefendingEffects)&&!f.active.charCounter)f.active.charCounter=true;
 if(roll.discardSelfEnergyOnTails){const e=extra.neoDiscardIndex??0;if(!u.energies[e])fail('Fireworks Energy selection invalid');p.discard.push(u.energies.splice(e,1)[0]);}
 if(roll.energyCycle&&!protectedEnergy(f.active)&&f.active.energies.length&&f.bench.length){f.bench[extra.neoCycleBench].energies.push(f.active.energies.splice(extra.neoCycleEnergy,1)[0]);}
 if(roll.hatch){u.damage=0;if(extra.neoHatchIndex!==undefined&&extra.neoHatchIndex!==null){const evolution=card(g,p.deck[extra.neoHatchIndex]);if(evolution.evolvesFrom!=='Metapod')fail('Invalid Hatch evolution');u.under.unshift(u.id);u.id=p.deck.splice(extra.neoHatchIndex,1)[0];u.playedTurn=g.round;STATUS.clearConditions(u);clearBenchEffects(u);}p.deck=shuffle(g,p.deck);}
 if(roll.magicDust&&(!shield?.allEffects||roll.ignoreDefendingEffects))applyCondition(g,f.active,extra.neoStatus);
 if(roll.blankPowers)g.powerBlankUntil=g.turnSerial+3; // Sputter lasts through the end of this player's next turn
 if(roll.millSelf)for(let i=0;i<roll.millSelf&&p.deck.length;i++)p.discard.push(p.deck.pop());
 if(roll.healSelf)u.damage=Math.max(0,u.damage-roll.healSelf);
 if(roll.shield)u.shield={...roll.shield,expires:g.turnSerial+2};
 if(roll.attackPenalty)f.active.attackPenalty={expires:g.turnSerial+2};
 if(roll.noRetreat)f.active.noRetreat={expires:g.turnSerial+2};
 if(roll.attackLock)f.active.attackLock={expires:g.turnSerial+2,targetId:u.id};
 if(roll.shuffleEnemy)f.deck=shuffle(g,f.deck);
 if(roll.targetDamage!==undefined){const target=chosenBench===-1?f.active:f.bench[chosenBench];if(chosenBench===-1)target.damage+=roll.targetDamage;else hitBench(f,target,roll.targetDamage);}
 if(roll.shuffleHandDraw){p.deck=shuffle(g,[...p.deck,...p.hand]);p.hand=[];draw(g,side,roll.shuffleHandDraw);}
 if(roll.draw)draw(g,side,roll.draw);
 if(roll.benchSide==='target'&&f.bench.length)hitBench(f,f.bench[chosenBench],roll.benchDamage);
 if(['self','both'].includes(roll.benchSide))for(const x of p.bench)hitBench(p,x,roll.benchDamage);
 if(['opponent','both'].includes(roll.benchSide))for(const x of f.bench)hitBench(f,x,roll.benchDamage);
 // Resolutions which need to know the attack's final damage are committed
 // before the KO window, including retaliation from Dark Wartortle.
 if(FINAL_KINDS.has(program.kind)){
  switch(program.kind){
   case 'barrier':u.shield={allEffects:true,expires:g.turnSerial+2};break;
   case 'destiny-bond':u.destinyBond={expires:g.turnSerial+2};break;
   case 'amnesia':f.active.amnesia={index:extra.copyIndex,expires:g.turnSerial+2};break;
   case 'prophecy':{
    const deck=g.players[extra.deckOwner].deck,n=Math.min(3,deck.length);
    if(extra.deckOrder.length!==n||new Set(extra.deckOrder).size!==n||extra.deckOrder.some(i=>i<0||i>=n))fail('Invalid prophecy permutation');
    const top=deck.slice(-n).reverse();deck.splice(deck.length-n,n,...extra.deckOrder.map(i=>top[i]).reverse());break;
   }
   case 'scavenge':p.hand.push(p.discard.splice(extra.discardTrainer,1)[0]);break;
   case 'third-eye':draw(g,side,extra.drawCount);break;
   case 'stare':{
    const target=extra.target===-1?f.active:f.bench[extra.target];
    target.damage+=10;target.powerSuppressedUntil=g.turnSerial+2;break;
   }
   case 'magnetic-lines':{
    if(f.bench.length&&!protectedEnergy(f.active)&&extra.enemyEnergyIndex!==undefined){
     if(!f.active.energies[extra.enemyEnergyIndex]||!Number.isInteger(extra.target)||!f.bench[extra.target])fail('Invalid Magnetic Lines move');
     f.bench[extra.target].energies.push(f.active.energies.splice(extra.enemyEnergyIndex,1)[0]);
    }break;
   }
   case 'energy-bomb':{
    if(!p.bench.length){p.discard.push(...u.energies);u.energies=[];}
    else{for(const slot of extra.destinations)p.bench[slot].energies.push(u.energies.shift());}break;
   }
   case 'fascinate':{
    if(extra.preRoll?.flips[0]){
     const old=f.active;f.active=f.bench.splice(extra.target,1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);
    }break;
   }
   case 'flame-pillar':{
    if(extra.energyPicks?.length){
     for(const i of [...extra.energyPicks].sort((a,b)=>b-a))p.discard.push(u.energies.splice(i,1)[0]);
     if(f.bench.length)f.bench[extra.target].damage+=10;
    }break;
   }
   case 'mirror-shell':u.mirrorShell={expires:g.turnSerial+2};break;
   default:break;
  }
 }
 // Track damage/status on a Pokémon so Mirror Move can reproduce what the
 // opponent's attack actually did, rather than its printed base damage.
 if(priorDefender&&(dmg>0||priorDefender.status!==priorDefStatus))priorDefender.lastAttackImpact={serial:g.turnSerial,damage:priorDefender.damage-priorDefDamage,status:priorDefender.status!==priorDefStatus?priorDefender.status:null};
 if(f.active&&hasActiveEffect(f.active,'mirrorShell',g)&&dmg>0){
  u.damage+=calculateDamage(card(g,f.active.id),c,dmg,u);
  log(g,`${card(g,f.active.id).name} reflected ${dmg} attack damage.`);
 }
 if(f.active&&hasActiveEffect(f.active,'destinyBond',g)&&dmg>0&&f.active.damage>=maxHP(g,f.active)){
  u.damage=Math.max(u.damage,maxHP(g,u));log(g,'Destiny Bond knocked out the attacker.');
 }
 if(program.kind==='ram'&&f.active.damage<maxHP(g,f.active)&&f.bench.length){
  // Ram switches even when its recoil knocked out Rhydon; this must happen
  // before KO promotion and end-of-attack cleanup.
  if(f.bench.length===1){const old=f.active;f.active=f.bench.splice(0,1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);}
  else{g.ramSwitchRequired=true;}
 }

 if(GYM_LAST.planned(program.kind)&&(!p.active||!f.active)){
  if(!p.active&&!p.bench.length){g.over=true;g.winner=1-side;return;}
  if(!f.active&&!f.bench.length){g.over=true;g.winner=side;return;}
  g.pendingPromotions=[0,1].filter(i=>!g.players[i].active);g.promotionAfter='checkup';finishPromotions(g);return;
 }
 // Track the exact prior attacker and whether Smeargle was present when it attacked.
 if(p.active===u){
  const smeargleWitnesses=allPokemon(f).filter(x=>card(g,x.id).name==='Smeargle');
  if(smeargleWitnesses.length){
   u.neo50LastAttack={serial:g.turnSerial,cardId:u.id,attack:a};
   for(const witness of smeargleWitnesses)witness.neo50Observed={serial:g.turnSerial,attackerSide:side};
  }
 }
 log(g,`${c.name} used ${a.name} for ${dmg} Active damage.${roll.benchSide?' Bench effect: '+roll.benchSide+'.':''}`);
 // With Bench splash damage, ALL KOs are collected before choosing replacements.
 if(program.kind==='ram'&&g.ramSwitchRequired){delete g.ramSwitchRequired;
  // Delay KO cleanup until the defender has picked its forced switch.
  g.nextDecisionId++;g.pendingDecision=makeDecision({id:`switch:${g.nextDecisionId}`,actor:1-side,kind:'pokemon-target',label:'Ram: choose your replacement Pokémon',options:f.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min:1,max:1});
  g.pendingAction={kind:'ram_switch',owner:1-side};return;
 }
 if(isClassicRules(g))g.attackContext={side,serial:g.turnSerial};
 if(g.benchGuardQueue?.length&&promptBenchGuard(g,g.benchGuardQueue))return;
 if(knockOuts(g,'checkup'))return;
 if(roll.dragonTornado&&f.active&&f.bench.length&&!jawClampLocks(g,1-side)&&f.active.damage<maxHP(g,f.active)){
  g.nextDecisionId++;g.pendingDecision=makeDecision({id:`neoTornado:${g.nextDecisionId}`,actor:side,kind:'pokemon-target',label:'Dragon Tornado: choose an opposing replacement',options:f.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min:1,max:1});
  g.pendingAction={kind:'neo_dragon_switch',side};return;
 }
 if(roll.returnDefenderToDeck&&f.active&&!jawClampLocks(g,1-side)){
  const returned=f.active;f.deck=shuffle(g,[...f.deck,returned.id,...returned.under,...returned.energies,...returned.attachedTrainers.map(x=>x.id)]);
  f.active=null;g.pendingPromotions=[1-side];g.promotionAfter='checkup';finishPromotions(g);return;
 }
 if(roll.neo49Pilfer!==undefined&&p.active===u){
  const picked=(extra.neo49Data?.discard||[]).map(x=>Number(x.slice(8)));
  const cards=[u.id,...u.under,...u.energies,...u.attachedTrainers.map(x=>x.id)];
  if(roll.neo49Pilfer&&picked.length)cards.push(p.discard.splice(picked[0],1)[0]);
  p.deck=shuffle(g,[...p.deck,...cards]);p.active=null;
  if(!p.bench.length){g.over=true;g.winner=1-side;return;}
  g.pendingPromotions=[side];g.promotionAfter='checkup';finishPromotions(g);return;
 }
 if(roll.vanishSelf&&p.active){
  const returned=p.active;p.discard.push(...returned.under,...returned.energies,...returned.attachedTrainers.map(x=>x.id));p.deck=shuffle(g,[...p.deck,returned.id]);p.active=null;
  if(!p.bench.length){g.over=true;g.winner=1-side;log(g,`${p.name} has no Pokémon remaining.`);return;}
  g.pendingPromotions=[side];g.promotionAfter='checkup';finishPromotions(g);return;
 }
 if(roll.bounceDefender&&f.active&&!jawClampLocks(g,1-side)){
  const returned=f.active;f.hand.push(returned.id,...returned.under,...returned.energies,...returned.attachedTrainers.map(x=>x.id));
  f.active=null;
  if(!f.bench.length){g.over=true;g.winner=side;log(g,`${f.name} has no Pokémon remaining.`);return;}
  g.pendingPromotions=[1-side];g.promotionAfter='checkup';finishPromotions(g);return;
 }
 if(roll.gymReturnToHand&&p.active===u){
  // Star Boomerang returns the Pokémon and ALL attached cards to the hand.
  p.hand.push(u.id,...u.under,...u.energies,...u.attachedTrainers.map(t=>t.id));p.active=null;
  if(!p.bench.length){g.over=true;g.winner=1-side;log(g,`${p.name} has no Pokémon remaining.`);return;}
  g.pendingPromotions=[side];g.promotionAfter='checkup';finishPromotions(g);return;
 }
 if(roll.themeReturn&&p.active===u){
  const returned=p.active;
  if(roll.themeReturn==='shuffle'){p.deck=shuffle(g,[...p.deck,returned.id,...returned.under,...returned.energies,...returned.attachedTrainers.map(t=>t.id)]);}
  else{p.hand.push(returned.id,...returned.under,...returned.energies);p.discard.push(...returned.attachedTrainers.map(t=>t.id));}
  p.active=null;
  if(!p.bench.length){g.over=true;g.winner=1-side;log(g,`${p.name} has no Pokémon remaining.`);return;}
  g.pendingPromotions=[side];g.promotionAfter='checkup';finishPromotions(g);return;
 }
 if(roll.optionalSwitch&&p.active&&p.bench.length&&!jawClampLocks(g,side)){
  g.nextDecisionId++;g.pendingDecision=makeDecision({id:`optswitch:${g.nextDecisionId}`,actor:side,kind:'pokemon-target',label:'You may switch your Active Pokémon',options:p.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min:1,max:1,optional:true});
  g.pendingAction={kind:'optional_attack_switch',owner:side};return;
 }
 if(roll.forceSwitch&&program.kind!=='ram'&&!jawClampLocks(g,roll.forceSwitch==='switch-self'?side:1-side)){
  const owner=roll.forceSwitch==='switch-self'?p:f;
  if(owner.active&&owner.bench.length){
   if(roll.forceSwitch==='switch-defender'&&owner.bench.length>1){
    g.nextDecisionId++;
    g.pendingDecision=makeDecision({id:`switch:${g.nextDecisionId}`,actor:1-side,kind:'pokemon-target',label:'Choose your replacement Active Pokémon',options:owner.bench.map((x,i)=>({id:`bench:${i}`,label:publicName(g,x)})),min:1,max:1});
    g.pendingAction={kind:'attack_switch',owner:1-side};return;
   }
   const i=roll.forceSwitch==='switch-defender'?0:chosenBench;
   if(!Number.isInteger(i)||!owner.bench[i])fail('Illegal switch target');
   const prior=owner.active;owner.active=owner.bench.splice(i,1,prior)[0];STATUS.clearConditions(prior);clearBenchEffects(prior);
   log(g,`${owner.name} switched to ${card(g,owner.active.id).name}.`);
  }
 }
 finishTurn(g);
}
function trainerOptions(g,side,name){const p=g.players[side],f=g.players[1-side];
 if(name==='Switch')return p.bench.map((_,i)=>i);
 if(name==='Gust of Wind')return f.bench.map((_,i)=>i);
 if(name==='Potion')return allPokemon(p).flatMap((u,i)=>u.damage>0?[i-1]:[]);
 if(name==='Energy Removal')return allPokemon(f).flatMap((u,i)=>u.energies.length?[i-1]:[]);
 return [];
}
function playTrainer(g,side,index,target,expectedId,energyIndex){const p=g.players[side],f=g.players[1-side],c=handCard(g,p,index),n=c.name;
 if(c.id!==expectedId)fail('Selected Trainer changed');
 const supported=['Bill','Professor Oak','Potion','Switch','Gust of Wind','Energy Removal'];
 if(!supported.includes(n))fail(`Unported Trainer effect: ${n}`);
 if(trainerOptions(g,side,n).length===0&&['Potion','Switch','Gust of Wind','Energy Removal'].includes(n))fail('Trainer has no legal target');
 if(['Potion','Switch','Gust of Wind','Energy Removal'].includes(n)&&!trainerOptions(g,side,n).includes(target))fail('Illegal Trainer target');
 if(n==='Switch'){const old=p.active;p.active=p.bench.splice(target,1,old)[0];STATUS.clearConditions(old);clearBenchEffects(old);}
 if(n==='Gust of Wind'){const old=f.active;f.active=f.bench.splice(target,1,old)[0];STATUS.clearConditions(old);}
 if(n==='Potion'){const u=located(p,target);u.damage=Math.max(0,u.damage-20);}
 if(n==='Energy Removal'){
  const u=located(f,target);
  if(energyIndex===undefined&&u.energies.length>1){
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:`energy:${g.nextDecisionId}`,actor:side,kind:'energy-discard',label:'Choose an Energy to discard',options:u.energies.map((id,i)=>({id:`energy:${i}`,label:card(g,id).name})),optional:true});
   g.pendingAction={kind:'energy_removal',side,handIndex:index,target,cardId:c.id};return;
  }
  const e=energyIndex===undefined?0:requireInt(energyIndex,'Energy index');
  if(e<0||e>=u.energies.length)fail('Invalid Energy selection');
  f.discard.push(u.energies.splice(e,1)[0]);
 }
 p.discard.push(p.hand.splice(index,1)[0]);
 if(n==='Professor Oak'){p.discard.push(...p.hand);p.hand=[];draw(g,side,7);}
 if(n==='Bill')draw(g,side,2);
 log(g,`${p.name} played ${n}.`);
}
function finishRetreat(g,side,slot,picks){
 const p=g.players[side],u=safeSlot(p,-1),cost=retreatCost(g,side,u);
 if((p.confusedRetreatFailed&&u.status==='Confused')||!p.bench[slot]||new Set(picks).size!==picks.length||picks.some(i=>!Number.isInteger(i)||i<0||i>=u.energies.length))fail('Illegal retreat payment');
 const contribution=picks.map(i=>retreatUnits(g,u,u.energies[i]));
 const total=contribution.reduce((n,v)=>n+v,0);
 if(cost===0&&picks.length||cost>0&&(!picks.length||total<cost||contribution.some(v=>total-v>=cost)))fail('Wrong number or excessive retreat Energy payment');
 for(const i of [...picks].sort((a,b)=>b-a))p.discard.push(u.energies.splice(i,1)[0]);
 if(u.status==='Confused'&&next(g,2)===0){p.confusedRetreatFailed=true;log(g,`${p.name} failed to retreat due to Confusion.`);return;}
 const balloon=u.attachedTrainers.findIndex(t=>card(g,t.id).name==='Balloon Berry');
 if(balloon>=0)p.discard.push(u.attachedTrainers.splice(balloon,1)[0].id);
 p.active=p.bench.splice(slot,1,u)[0];STATUS.clearConditions(u);clearBenchEffects(u);if(isClassicRules(g))CLASSIC_POWERS.movedToBench(g,side,u,p.active,classicHelpers());p.retreated=true;log(g,`${p.name} retreated.`);
 if(isClassicRules(g)&&g.players[1-side].bench.some(x=>CLASSIC_POWERS.enabled(g,x,'Sinkhole'))&&next(g,2)===0){u.damage+=20;knockOuts(g,'direct');}
}
function calculateDamage(attacker,target,base,defendingUnit=null,{ignoreWeakness=false,ignoreResistance=false,resistancePenalty=30}={}){
 let amount=base;
 const type=attacker.types?.[0]||'Colorless';
 if(!ignoreWeakness&&(defendingUnit?.weaknessOverride===type||(!defendingUnit?.weaknessOverride&&(target.weaknesses||[]).some(w=>w.type===type))))amount*=2;
 if(!ignoreResistance&&(defendingUnit?.resistanceOverride===type||(!defendingUnit?.resistanceOverride&&(target.resistances||[]).some(r=>r.type===type))))amount=Math.max(0,amount-resistancePenalty);
 return amount;
}
// Resolve both sides simultaneously before requiring promotions; needed for
// Poison and recoil KOs. Pending decisions belong to the defending owner.
function knockOuts(g,after){
 // Face-down Secret Plan cards reveal BEFORE KO/prize evaluation. A revealed
 // non-Basic was never a real Pokémon and cannot award a Prize.
 for(let side=0;side<2;side++){const owner=g.players[side];for(let index=owner.bench.length-1;index>=-1;index--){const u=index===-1?owner.active:owner.bench[index];if(u?.secretPlanFaceDown&&(u.damage>0||u.status||u.poison||u.poisonDamage))revealSecretPlan(g,side,index);}}
 // Final Beam reacts to an attack Knock Out before either side leaves play.
 // Resolve it before collecting both sides' KOs so retaliation can KO the
 // attacking Pokémon in the same checkpoint.
 const attacking=g.attackContext;
 delete g.attackContext;
 if(attacking&&isClassicRules(g)){
  const attacker=g.players[attacking.side].active;
  if(attacker){
   for(const side of [0,1]){
    if(side===attacking.side)continue;
    const defender=g.players[side];
    for(const victim of [defender.active,...defender.bench].filter(Boolean)){
     if(victim.damage<maxHP(g,victim)||!CLASSIC_POWERS.enabled(g,victim,'Final Beam'))continue;
     if(next(g,2)===1){const count=victim.energies.filter(id=>card(g,id).name==='Water Energy').length;
      const damage=calculateDamage(card(g,victim.id),effectiveCard(g,attacker),count*20,attacker);
      attacker.damage+=damage;log(g,`Final Beam retaliated for ${damage} damage.`);
     }
    }
   }
  }
 }
 if(attacking){const victim=g.players[1-attacking.side].active;if(victim?.neo48Endure?.expires>g.turnSerial&&victim.damage>=maxHP(g,victim)){victim.damage=maxHP(g,victim)-10;delete victim.neo48Endure;log(g,'Phanpy Endure survived with 10 HP.');}}
 // A surviving Giovanni's Machamp at 10 HP is not Knocked Out and yields no Prize.
 if(attacking&&isClassicRules(g))for(let side=0;side<2;side++){
  if(side===attacking.side)continue;
  const victim=g.players[side].active;
  if(victim&&victim.damage>=maxHP(g,victim)&&CLASSIC_POWERS.enabled(g,victim,'Fortitude')&&next(g,2)===1){
   victim.damage=maxHP(g,victim)-10;log(g,"Fortitude saved Giovanni's Machamp at 10 HP.");
  }
 }
 // Neo Genesis Focus Band: the protected Pokémon (Active OR Bench) only
 // gets a saving flip for a Knock Out caused by an opponent's attack.
 if(attacking&&isClassicRules(g)){
  const defenderSide=1-attacking.side,defender=g.players[defenderSide];
  for(const victim of [defender.active,...defender.bench].filter(Boolean)){
   if(victim.damage<maxHP(g,victim))continue;
   const idx=victim.attachedTrainers.findIndex(t=>card(g,t.id).name==='Focus Band');
   if(idx<0)continue;
   defender.discard.push(victim.attachedTrainers.splice(idx,1)[0].id);
   if(next(g,2)===1){
    victim.damage=maxHP(g,victim)-10;
    log(g,'Focus Band saved '+card(g,victim.id).name+' with 10 HP remaining.');
   }else log(g,'Focus Band flipped tails: '+card(g,victim.id).name+' is still Knocked Out.');
  }
  // EXP.ALL may be declined. It protects one Basic Energy from the pending
  // Active KO, before cards from that Active enter its owner's discard.
  const victim=defender.active;
  if(victim&&victim.damage>=maxHP(g,victim)&&victim.energies.some(id=>isBasicEnergy(card(g,id)))){
   const destinations=defender.bench.flatMap((u,i)=>u.attachedTrainers.some(t=>card(g,t.id).name==='EXP.ALL')?[{i,u}]:[]);
   const options=destinations.flatMap(({i})=>victim.energies.flatMap((id,j)=>isBasicEnergy(card(g,id))?[{id:'move:'+i+':'+j,label:card(g,id).name+' to '+card(g,defender.bench[i].id).name}]:[]));
   if(options.length){
    g.nextDecisionId++;
    g.pendingDecision=makeDecision({id:'expall:'+g.nextDecisionId,actor:defenderSide,kind:'neo-exp-all',label:'EXP.ALL: move one Basic Energy to a Benched Pokémon?',options,min:0,max:1,optional:true});
    g.pendingAction={kind:'neo_exp_all',defenderSide,victimId:victim.id,after};return true;
   }
  }
 }
 // Remaining reactive Gym Pokémon Powers, processed before removing any KOs.
 if(attacking&&isClassicRules(g)){
  const defenderSide=1-attacking.side,defender=g.players[defenderSide],victim=defender.active,attacker=g.players[attacking.side].active;
  if(victim&&victim.lastAttackImpact?.serial===g.turnSerial&&victim.lastAttackImpact.damage>0){
   if(CLASSIC_POWERS.enabled(g,victim,'Shock Blast')&&victim.gymShockSerial!==g.turnSerial){
    victim.gymShockSerial=g.turnSerial;
    if(next(g,2)===0){for(const player of g.players)if(player.active)player.active.damage+=20;log(g,'Shock Blast dealt 20 damage to both Active Pokémon.');}
   }
   if(CLASSIC_POWERS.enabled(g,victim,'Energy Drain')&&victim.gymDrainSerial!==g.turnSerial){
    victim.gymDrainSerial=g.turnSerial;
    if(next(g,2)===1&&attacker?.energies.length){
     if(attacker.energies.length===1){
      const removed=attacker.energies.pop();
      g.players[attacking.side].discard.push(removed);
      // Energy Drain is the defending player's Power, even when automatic.
      // The invoking attacker's seat must not be mistaken for the discarder.
      (g.ecogymDiscardCauses ||= []).push({owner:attacking.side,source:defenderSide,id:removed});
     }
     else{g.nextDecisionId++;g.pendingDecision=makeDecision({id:`energyDrain:${g.nextDecisionId}`,actor:defenderSide,kind:'energy-discard',label:'Koga’s Muk: choose Energy to discard from attacking Pokémon',options:attacker.energies.map((id,i)=>({id:`energy:${i}`,label:card(g,id).name})),min:1,max:1});
      g.pendingAction={kind:'gym_energy_drain',attackerSide:attacking.side,defenderSide,after};return true;}
    }
   }
  }
 }
 for(let side=0;side<2;side++){
  const owner=g.players[side];
  for(const [si,victim] of [[-1,owner.active],...owner.bench.map((u,i)=>[i,u])]){
   if(!victim)continue;
   if(CLASSIC_POWERS.enabled(g,victim,'Scram')&&victim.damage===maxHP(g,victim)-10){
    const cards=[victim.id,...victim.under,...victim.energies,...victim.attachedTrainers.map(t=>t.id),...(victim.gymShapeshiftCard?[victim.gymShapeshiftCard]:[])];
    owner.deck=shuffle(g,[...owner.deck,...cards]);if(si===-1)owner.active=null;else owner.bench.splice(si,1);
    log(g,'Brock’s Primeape used Scram and shuffled into its deck.');
   }
  }
 }
 for(let side=0;side<2;side++){
  const owner=g.players[side];
  for(const [si,victim] of [[-1,owner.active],...owner.bench.map((u,i)=>[i,u])]){
   if(!victim||victim.damage<maxHP(g,victim)||!CLASSIC_POWERS.enabled(g,victim,'Rebirth')||victim.gymRebirthOffered)continue;
   victim.gymRebirthOffered=true;
   g.nextDecisionId++;g.pendingDecision=makeDecision({id:`rebirth:${g.nextDecisionId}`,actor:side,kind:'rebirth',label:'Rocket’s Moltres: return this Pokémon to hand after Knock Out?',options:[{id:'choice:yes',label:'Return Rocket’s Moltres to hand'}],min:0,max:1,optional:true});
   g.pendingAction={kind:'gym_rebirth',side,slot:si,after};return true;
  }
 }
 const eliminated=[];
 // Resolve all active and Benched KOs in the same checkpoint, without
 // applying Weakness/Resistance to Benched damage.
 for(let side=0;side<2;side++){
  const p=g.players[side];
  for(let i=p.bench.length-1;i>=0;i--){
   const u=p.bench[i];if(u.damage<maxHP(g,u))continue;
   p.bench.splice(i,1);p.discard.push(u.id,...u.under,...u.energies,...u.attachedTrainers.map(x=>x.id),...(u.gymShapeshiftCard?[u.gymShapeshiftCard]:[]));if(u.gymRebirthReturn){const ix=p.discard.lastIndexOf(u.id);if(ix>=0)p.hand.push(p.discard.splice(ix,1)[0]);}
   const enemy=g.players[1-side];if(enemy.prizes.length){if(g.format==='online-preview')(g.pendingPrizeClaims ||= []).push(1-side);else {enemy.hand.push(enemy.prizes.pop());enemy.prizeFaceUp?.pop();}}
   eliminated.push(side);log(g,`${p.name}'s Benched ${card(g,u.id).name} was Knocked Out.`);
  }
 }
 for(let side=0;side<2;side++){
  const p=g.players[side],u=p.active;
  if(!u||u.damage<maxHP(g,u))continue;
  p.discard.push(u.id,...u.under,...u.energies,...u.attachedTrainers.map(x=>x.id),...(u.gymShapeshiftCard?[u.gymShapeshiftCard]:[]));if(u.gymRebirthReturn){const ix=p.discard.lastIndexOf(u.id);if(ix>=0)p.hand.push(p.discard.splice(ix,1)[0]);}p.active=null;
  const enemy=g.players[1-side];if(enemy.prizes.length){if(g.format==='online-preview')(g.pendingPrizeClaims ||= []).push(1-side);else {enemy.hand.push(enemy.prizes.pop());enemy.prizeFaceUp?.pop();}}
  eliminated.push(side);log(g,`${p.name}'s Active ${card(g,u.id).name} was Knocked Out.`);
 }
 if(!eliminated.length){const needs=[0,1].filter(side=>!g.players[side].active);if(needs.length){for(const side of needs)if(!g.players[side].bench.length){g.over=true;g.winner=1-side;return true;}g.pendingPromotions=needs;g.promotionAfter=after;finishPromotions(g);return true;}return false;}
 if(promptPrize(g,after))return true;
 return completeKnockouts(g,after);
}
function promptPrize(g,after){
 const queue=g.pendingPrizeClaims||[];
 while(queue.length&&!g.players[queue[0]].prizes.length)queue.shift();
 if(!queue.length){delete g.pendingPrizeClaims;return false;}
 const side=queue.shift(),player=g.players[side];
 g.nextDecisionId++;
 g.pendingDecision=makeDecision({id:`prize:${g.nextDecisionId}`,actor:side,kind:'prize-card',label:'Choose a face-down Prize card',
  options:player.prizes.map((_,i)=>({id:`prize:${i}`,label:`Prize ${i+1}`})),min:1,max:1});
 g.pendingAction={kind:'take_prize',side,after};return true;
}
function completeKnockouts(g,after){
 const winners=[0,1].filter(side=>!g.players[side].prizes.length||!g.players[1-side].active&&!g.players[1-side].bench.length);
 if(winners.length){g.over=true;g.winner=winners.length===1?winners[0]:null;
  log(g,g.winner===null?'Simultaneous win conditions — sudden-death rematch required.':`${g.players[g.winner].name} wins!`);return true;
 }
 const queue=[0,1].filter(side=>!g.players[side].active);
 if(queue.length){g.pendingPromotions=queue;g.promotionAfter=after;finishPromotions(g);return true;}
 return false;
}

function finishPromotions(g){
 if(g.over)return;
 while(g.pendingPromotions&&g.pendingPromotions.length){
  const side=g.pendingPromotions[0],p=g.players[side];
  if(!p.bench.length)fail('No Pokémon available to promote');
  if(p.bench.length===1){p.active=p.bench.shift();STATUS.clearConditions(p.active);g.pendingPromotions.shift();continue;}
  g.nextDecisionId++;
  g.pendingDecision=makeDecision({id:`promotion:${g.nextDecisionId}`,actor:side,kind:'pokemon-target',label:'Choose your replacement Active Pokémon',options:p.bench.map((x,i)=>({id:`bench:${i}`,label:x.secretPlanFaceDown?'Face-down Pokémon':card(g,x.id).name})),min:1,max:1});
  g.pendingAction={kind:'promote',side};return;
 }
 const after=g.promotionAfter;
 g.pendingPromotions=null;g.promotionAfter=null;
 if(after==='checkup')finishTurn(g);
 else if(after!=='trainer')advanceTurn(g);
}
const berryHelpers=()=>({card,maxHP,STATUS,log,makeDecision});
function finishTurn(g){
 if(g.over)return;
 const cur=g.players[g.turn];
 // Magnifier expires at the end of the owning player's turn, even if Benched.
 for(const host of allPokemon(cur)){
  const kept=[];for(const t of host.attachedTrainers){
   if(card(g,t.id).name==='Magnifier')cur.discard.push(t.id);
   else kept.push(t);
  }
  host.attachedTrainers=kept;
 }
 // Do NOT return Charity here. Poison/Char Checkup can still Knock Out the
 // attached Pokémon at end of turn; in that case Charity must be discarded.
 if(cur.tickleHand&&cur.tickleRestoreTurn<=g.turnSerial){cur.hand.push(...cur.tickleHand);delete cur.tickleHand;delete cur.tickleRestoreTurn;}
 // Neo Genesis Char counters persist on Pokémon even when they move to the Bench.
 for(const owner of g.players)for(const target of allPokemon(owner))if(target.charCounter&&next(g,2)===0){target.damage+=20;log(g,`${card(g,target.id).name} takes 20 Char damage.`);}
 // WotC-era Pokémon Checkup: Poison before Sleep and Paralysis recovery.
 for(let side=0;side<2;side++){
  const u=g.players[side].active;
  if(!u)continue;
  const outcome=STATUS.checkup(u,()=>next(g,2)===1,side===g.turn);
  u.damage+=outcome.poisonDamage;
  if(outcome.poisonDamage)log(g,`${card(g,u.id).name} takes 10 Poison damage.`);
  if(outcome.woke)log(g,`${card(g,u.id).name} woke up.`);
 }
 // Miracle Energy is discarded at the end of its owner's turn, even if Benched.
 for(const host of allPokemon(cur)){
  const left=[];for(const id of host.energies){if(card(g,id).name==='Miracle Energy')cur.discard.push(id);else left.push(id);}
  host.energies=left;
 }
 // Darkness Energy damages non-Dark hosts at the end of EACH turn,
 // including when the Energy is on a Benched Pokémon.
 for(const owner of g.players)for(const target of allPokemon(owner)){
  const count=specialEnergyCount(g,target,'Darkness');
  if(count&&!isDarkType(g,target)){
   target.damage+=10*count;
   log(g,`${card(g,target.id).name} took ${count*10} Darkness Energy recoil.`);
  }
 }
 if(BERRIES.between(g,berryHelpers()))return;
 if(!knockOuts(g,'advance'))advanceTurn(g);
}
function advanceTurn(g){
 if(g.over)return;
 // Checkup, Knock Outs and any required promotion have already finished.
 // A surviving Charity returns to its owner now; one on a Knocked Out
 // Pokémon was discarded alongside it and must never return to hand.
 const leaving=g.players[g.turn];
 for(const u of allPokemon(leaving)){
  const retained=[];
  for(const t of u.attachedTrainers){if(card(g,t.id).name==='Charity')leaving.hand.push(t.id);else retained.push(t);}
  u.attachedTrainers=retained;
 }
 g.turn=1-g.turn;g.turnSerial++;if(g.turn===0)g.round++;
 for(const owner of g.players)for(const x of allPokemon(owner)){
  const retained=[];for(const t of x.attachedTrainers){if(t.expires!==undefined&&t.expires<=g.turnSerial)owner.discard.push(t.id);else retained.push(t);}x.attachedTrainers=retained;
  if(x.energyBurnUntil<=g.turnSerial)delete x.energyBurnUntil;
 }
 BERRIES.start(g,berryHelpers());
 const p=g.players[g.turn];p.energyUsed=false;p.retreated=false;p.confusedRetreatFailed=false;p.turnPlays=[];p.blaineRemaining=0;delete p.blaineTarget;
 draw(g,g.turn,1,true);if(!g.over)log(g,`${p.name}'s turn.`);
}
// Public action captions are captured BEFORE a card leaves the hand or an Active
// Pokemon is replaced. Never put a hand index, hidden selection, or deck search
// result in this object: both opponents will receive it after the action succeeds.
function describePublicAction(g,side,cmd){
 const p=g.players[side],type=cmd.type,raw=cmd.payload||{},description={};
 if(['play_trainer','bench','evolve','attach_energy'].includes(type)){
  const id=p.hand[raw.handIndex];if(typeof id==='string'&&CATALOG.has(id))description.cardId=id;
 }else if(type==='attack'&&p.active){
  description.cardId=p.active.id;
  const attack=effectiveCard(g,p.active).attacks?.[raw.attackIndex];
  if(attack?.name)description.label=attack.name;
 }else if(type==='use_power'){
  const u=raw.slot===-1?p.active:p.bench[raw.slot];
  if(u){description.cardId=u.id;const ability=CATALOG.get(u.id)?.abilities?.find(a=>a.name);if(ability)description.label=ability.name;}
 }else if(type==='retreat'&&p.active){description.cardId=p.active.id;
 }else if(type==='use_stadium'&&g.stadium){description.cardId=g.stadium.id;}
 return description;
}
// Transactional: never modify the input on failure; no UI callbacks or partial writes.
function reduce(game,actor,command){
 try{
  const cmd=validateCommand(command);
  if(actor!==0&&actor!==1)fail('Invalid player');
  if(!game||!Array.isArray(game.players)||game.players.length!==2)fail('Invalid game');
  if(game.over)fail('Game is over');
  const next=structuredClone(game);
  const visible=describePublicAction(next,actor,cmd);
  if(next.format==='online-preview'){(next.matchFeed ||= []).push({seq:(next.feedSeq=(next.feedSeq||0)+1),kind:'action',type:cmd.type,side:actor,...visible});if(next.matchFeed.length>150)next.matchFeed.shift();}
  const activeBefore=next.players.map(p=>p.active);
  const benchBefore=next.players.map(p=>new Set(p.bench));
  const turnBefore=next.turn;
  const hiddenBefore=next.players.flatMap((p,owner)=>[-1,...p.bench.map((_,i)=>i)].flatMap(slot=>{
   const u=located(p,slot);return u?.secretPlanFaceDown?[{owner,serial:u.secretPlanSerial,originalId:u.id,active:slot===-1,energy:u.energies.join('|'),tools:u.attachedTrainers.map(t=>t.id).join('|'),damage:u.damage,status:u.status}]:[];
  }));
  performAction(next,actor,cmd);
  // Koga's Ninja Trick must be discarded whenever its Active leaves for the
  // Bench, regardless of who initiated the switch (Trainer, attack, retreat,
  // reaction, or a multi-step opponent decision).
  if(isClassicRules(next))for(let side=0;side<2;side++){
   const old=activeBefore[side],owner=next.players[side];
   if(!old||!owner.bench.includes(old))continue;
   const tricks=old.attachedTrainers.filter(t=>card(next,t.id).name==="Koga's Ninja Trick");
   if(tricks.length){old.attachedTrainers=old.attachedTrainers.filter(t=>!tricks.includes(t));owner.discard.push(...tricks.map(t=>t.id));log(next,`Koga's Ninja Trick was discarded when ${publicName(next,old)} moved to the Bench.`);}
  }
  // Neo Discovery Spikes: each healthy opposing Forretress reacts to a
  // Pokémon that was Benched becoming Active during its owner's turn.
  // The comparison uses the ORIGINAL turn owner, since attacking itself can
  // advance the turn before this transaction finishes.
  if(isClassicRules(next)&&!next.over){
   const owner=next.players[turnBefore],oldActive=activeBefore[turnBefore],incoming=owner.active;
   if(incoming&&incoming!==oldActive&&benchBefore[turnBefore].has(incoming)){
    const opposing=next.players[1-turnBefore];
    const sources=allPokemon(opposing).filter(x=>CLASSIC_POWERS.enabled(next,x,'Spikes'));
    if(sources.length){
     incoming.damage+=10*sources.length;
     log(next,'Forretress Spikes placed '+sources.length+' damage counter(s) on the new Active Pokémon.');
     // Let mandatory choices already in flight finish before KO cleanup.
     if(incoming.damage>=maxHP(next,incoming)&&!next.pendingDecision)knockOuts(next,'trainer');
    }
   }
  }
  if(['attack','play_trainer','use_power','choose'].includes(cmd.type))for(const hidden of hiddenBefore){
   const p=next.players[hidden.owner];const index=[-1,...p.bench.map((_,i)=>i)].find(i=>{
    const u=located(p,i);return u?.secretPlanFaceDown&&u.secretPlanSerial===hidden.serial;
   });
   if(index===undefined)continue;
   const u=located(p,index),affected=(index===-1)!==hidden.active||u.energies.join('|')!==hidden.energy||u.attachedTrainers.map(t=>t.id).join('|')!==hidden.tools||u.damage!==hidden.damage||u.status!==hidden.status;
   if(affected){revealSecretPlan(next,hidden.owner,index);if(!p.active&&!next.pendingDecision)completeKnockouts(next,'trainer');}
  }
  returnRecycledEnergy(game,next);
  returnEcogymEnergy(game,next,actor,cmd);
  next.events.push({side:actor,type:cmd.type,payload:structuredClone(cmd.payload),visible});
  return {ok:true,game:next};
 }catch(e){return {ok:false,error:e.message};}
}
// Neo Genesis Recycle Energy returns to its owner's hand when discarded from
// an attached Pokémon. Compare the pre/post authoritative transaction: this
// covers retreat, attacks, Trainer discards, and KOs without per-card branches.
// Neo Genesis Ecogym: return Energy discarded from a surviving Pokémon
// by the OTHER player's attack / Power / Trainer, excluding KO and any
// Colorless-only Energy. This runs after each authoritative command/decision.
function returnEcogymEnergy(before,after,actor,cmd){
 const causes=after.ecogymDiscardCauses||[];
 delete after.ecogymDiscardCauses;
 const stadium=before.stadium||after.stadium;
 if(!stadium||card(before,stadium.id).name!=='Ecogym')return;
 const pending=before.pendingAction;
 const source=cmd.type==='choose'&&pending?
  pending.plan?.side??pending.defenderSide??pending.side??actor:actor;
 // Every returned Energy must have been ATTACHED to a surviving Pokémon
 // before the current action, not newly discarded from a Knocked Out card.
 for(let ownerSide=0;ownerSide<2;ownerSide++){
  if(source===ownerSide&&!causes.some(z=>z.owner===ownerSide&&z.source!==ownerSide))continue;
  const prev=before.players[ownerSide],now=after.players[ownerSide];
  const beforeUnits=allPokemon(prev),afterUnits=allPokemon(now),matched=new Set();
  const lost=[];
  const recoveredById=new Map();
  for(const previous of beforeUnits){
   const signature=u=>u.id+'|'+u.under.join('|');
   const candidates=afterUnits.flatMap((u,i)=>!matched.has(i)&&signature(u)===signature(previous)?[{u,i}]:[]);
   if(!candidates.length)continue; // KO: do NOT recover its Energy.
   const overlap=unit=>previous.energies.filter(id=>unit.energies.includes(id)).length;
   candidates.sort((a,b)=>overlap(b.u)-overlap(a.u));
   const chosen=candidates[0];matched.add(chosen.i);
   const remaining=[...chosen.u.energies];
   for(const id of previous.energies){
    const index=remaining.indexOf(id);
    if(index>=0)remaining.splice(index,1);
    else if(isEnergy(card(before,id))&&!['Double Colorless Energy','Recycle Energy','Full Heal Energy','Potion Energy'].includes(card(before,id).name))
     lost.push(id);
   }
  }
  // Avoid effects triggered by transfers to deck or hand and conserve cards
  // by matching only increased DISCARDED occurrences for each concrete ID.
  const oldCount=id=>prev.discard.filter(x=>x===id).length;
  const newCount=id=>now.discard.filter(x=>x===id).length;
  for(const id of lost){
   if(source===ownerSide&&!causes.some(z=>z.owner===ownerSide&&z.source!==ownerSide&&z.id===id))continue;
   const already=recoveredById.get(id)||0;
   if(newCount(id)-oldCount(id)<=already)continue;
   const index=now.discard.lastIndexOf(id);
   if(index<0)continue;
   now.hand.push(now.discard.splice(index,1)[0]);
   recoveredById.set(id,already+1);
   log(after,'Ecogym returned '+card(before,id).name+' to '+now.name+'\'s hand.');
  }
 }
}
function returnRecycledEnergy(before,after){
 for(let side=0;side<2;side++){
  const old=before.players[side],now=after.players[side];
  const attached=owner=>[owner.active,...owner.bench].filter(Boolean).reduce((sum,u)=>sum+(u.energies||[]).filter(id=>card(before,id).name==='Recycle Energy').length,0);
  const inDiscard=owner=>owner.discard.filter(id=>card(before,id).name==='Recycle Energy').length;
  const lost=Math.max(0,attached(old)-attached(now));
  const newlyDiscarded=Math.max(0,inDiscard(now)-inDiscard(old));
  const returned=Math.min(lost,newlyDiscarded);
  for(let i=0;i<returned;i++){
   const index=now.discard.findLastIndex(id=>card(before,id).name==='Recycle Energy');
   if(index<0)break;
   now.hand.push(now.discard.splice(index,1)[0]);
  }
  if(returned)log(after,`Recycle Energy returned ${returned} card(s) to ${now.name}'s hand.`);
 }
}
function applyCommand(game,side,command){const result=reduce(game,side,command);if(!result.ok)return result;for(const k of Object.keys(game))delete game[k];Object.assign(game,result.game);return {ok:true};}
function roomAdapter({format='classic'}={}){return {createGame:setup=>createGame({...setup,format,seed:crypto.randomBytes(4).readUInt32BE(0)}),applyCommand};}
function replay(setup,transcript){
 if(!Array.isArray(transcript))fail('Expected a command transcript');
 const game=createGame(setup);
 for(let i=0;i<transcript.length;i++){
  const entry=transcript[i];const result=applyCommand(game,entry.side,entry.command);
  if(!result.ok)fail(`Replay failed at command ${i}: ${result.error}`);
 }
 return game;
}
module.exports={CATALOG,createGame,reduce,applyCommand,roomAdapter,replay};
