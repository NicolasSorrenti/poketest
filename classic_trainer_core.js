'use strict';
// Classic-only, headless Trainer resolver. All decisions are addressed to the
// player who is actually entitled to choose. A play is committed only after
// the required selection chain completes; the outer reducer is transactional.
const {makeDecision}=require('./decision_core');
const {isBasicPokemon,isEnergy,canEvolve}=require('./core_rules');
const STATUS=require('./special_conditions_core');
// Chaos Gym cannot pass attached Trainers to the other player (WotC ruling).
const ATTACH_ONLY=new Set(['PlusPower','Defender','Berry','Counterattack Claws','Charity',"Brock's Protection","Koga's Ninja Trick","Sabrina's ESP",'Mysterious Fossil','Clefairy Doll']);
const SETS=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'];
const CATALOG=new Map(SETS.flatMap(s=>require('./cards/'+s+'.json')).map(c=>[c.id,c]));
const get=id=>{const c=CATALOG.get(id);if(!c)throw Error('Unknown Classic card: '+id);return c;};
const fossilEvolution=c=>c.evolvesFrom==='Mysterious Fossil'||(['Omanyte','Kabuto','Aerodactyl'].includes(c.name)&&c.subtypes?.includes('Stage 1'));
const basicEnergy=c=>/^(Grass|Fire|Water|Lightning|Psychic|Fighting) Energy$/.test(c.name)&&isEnergy(c);
const pokemon=c=>c.supertype==='Pokémon';
const all=p=>[p.active,...p.bench].filter(Boolean);
const publicName=u=>u?.secretPlanFaceDown?'Face-down Pokémon':get(u.id).name;
const slot=(p,n)=>n===-1?p.active:p.bench[n];
const n=v=>{if(!Number.isInteger(v))throw Error('Noninteger selection');return v;};
const chosen=(d,k)=>d[k]!==undefined;
const nums=(d,k)=>d[k].map(x=>n(Number(x.slice(x.indexOf(':')+1))));
const options=(entries,prefix='n')=>entries.map(({i,label})=>({id:`${prefix}:${i}`,label}));
const zone=(ids,pred=()=>true)=>ids.flatMap((id,i)=>pred(get(id),i)?[{i,label:get(id).name}]:[]);
const targets=(p,pred=()=>true)=>[-1,...p.bench.map((_,i)=>i)].flatMap(i=>slot(p,i)&&pred(slot(p,i),i)?[{i,label:(i===-1?'Active: ':'Bench: ')+publicName(slot(p,i))}]:[]);
function held(p,id,index){if(p.hand[index]!==id)throw Error('Trainer in hand changed during selection');}
function choice(g,plan,key,actor,items,{min=1,max=min,optional=false,label=key}={}){
 if(!items.length&&min>0)throw Error('No legal choices for '+label);
 g.nextDecisionId++;
 g.pendingDecision=makeDecision({id:`classic-trainer:${g.nextDecisionId}`,actor,kind:key,label,options:items,min,max,optional});
 g.pendingAction={kind:'classic_trainer',plan:{...plan,await:key}};
}
function select(g,plan,key,actor,items,cfg){
 if(chosen(plan.data,key))return false;
 choice(g,plan,key,actor,items,cfg);return true;
}
function cannotSwitch(g,side){
 const victim=g.players[side].active,source=g.players[1-side].active;
 return Boolean(victim?.noSwitch?.expires>g.turnSerial&&source?.id===victim.noSwitch.sourceId);
}
function prompt(g,plan,helpers){
 const side=plan.side,p=g.players[side],f=g.players[1-side],d=plan.data,name=get(plan.cardId).name;
 if(!plan.proxy)held(p,plan.cardId,plan.handIndex);
 // Additional Gym Trainer effects; all hidden-card choices belong to their owner.
 if(name==="Lt. Surge's Secret Plan"&&!chosen(d,'hidden')){
  if(p.bench.length>=5)throw Error('Bench full for Secret Plan');
  return select(g,plan,'hidden',side,options(zone(p.hand,(c,i)=>i!==plan.handIndex)),{label:'Select a hand card to place face down as a Basic Pokémon'});
 }
 if(name==='Recall'&&!p.active?.under?.length)throw Error('Recall requires an evolved Active Pokémon');
 if(name==="Sabrina's ESP"&&!chosen(d,'target'))return select(g,plan,'target',side,options(targets(p,u=>get(u.id).name.startsWith("Sabrina's ")),'slot'),{label:'Attach Sabrina’s ESP to a Sabrina Pokémon'});
 if(name==="Koga's Ninja Trick"&&!chosen(d,'target')){
  if(!get(p.active?.id||'base1-3').name.startsWith("Koga's "))throw Error('Ninja Trick requires an Active Koga Pokémon');
 }
 if(name==="Blaine's Quiz #3"){
  if(!chosen(d,'question'))return select(g,plan,'question',side,options(zone(p.hand,(c,i)=>i!==plan.handIndex&&pokemon(c)&&c.attacks?.length)) ,{label:'Choose hidden Pokémon card for Quiz #3'});
  if(!chosen(d,'attack')){
   const pokemonCard=get(p.hand[nums(d,'question')[0]]);
   return select(g,plan,'attack',side,pokemonCard.attacks.map((a,i)=>({id:'attack:'+i,label:a.name})),{label:'Choose an attack name to announce'});
  }
  if(!chosen(d,'guess')){
   const selected=get(p.hand[nums(d,'question')[0]]),name=selected.attacks[nums(d,'attack')[0]].name;
   const candidates=[...new Set([...CATALOG.values()].filter(c=>c.supertype==='Pokémon'&&c.attacks?.some(a=>a.name===name)).map(c=>c.name))].sort();
   return select(g,plan,'guess',1-side,candidates.map((n,i)=>({id:'guess:'+i,label:n})),{label:`Quiz #3: which Pokémon has the announced attack “${name}”?`});
  }
 }
 // Remaining Gym trainers use authoritative, owner-specific decisions.
 if(name==="Brock's Protection"&&!chosen(d,'target'))return select(g,plan,'target',side,options(targets(p,u=>get(u.id).name.startsWith("Brock's ")),'slot'),{label:'Attach Brock’s Protection to a Brock Pokémon'});
 if(name==='Narrow Gym'){
  for(const actor of [1-side,side]){
   const owner=g.players[actor],key='bounce'+actor;
   if(owner.bench.length>4&&!chosen(d,key))return select(g,plan,key,actor,options(owner.bench.map((u,i)=>({i,label:publicName(u)})),'bench'),{label:'Narrow Gym: return one of your Benched Pokémon to hand'});
  }
 }
 if(name==="Misty's Wish"){
  if(!chosen(d,'prize'))return select(g,plan,'prize',side,p.prizes.map((_,i)=>({id:`prize:${i}`,label:`View Prize ${i+1}`})),{label:'Choose Prize card to inspect'});
  if(!d.wishInspected){(p.privateLog||=[]).push('Misty’s Wish privately inspected '+get(p.prizes[nums(d,'prize')[0]]).name);d.wishInspected=true;}
  if(!chosen(d,'permission'))return select(g,plan,'permission',1-side,[{id:'choice:0',label:'Decline the swap'},{id:'choice:1',label:'Allow the swap'}],{label:`Misty's Wish: allow opponent to swap a Prize?`});
  if(nums(d,'permission')[0]===1&&!chosen(d,'swap')&&p.hand.length>1){const items=options(zone(p.hand,(c,i)=>i!==plan.handIndex));if(items.length)return select(g,plan,'swap',side,items,{label:'Choose hand card to trade for your inspected Prize'});}
 }
 if(name==="Blaine's Quiz #2"){
  if(!chosen(d,'question'))return select(g,plan,'question',side,options(zone(p.hand,(c,i)=>i!==plan.handIndex)),{label:'Choose a secret card for the quiz'});
  if(!chosen(d,'guess'))return select(g,plan,'guess',1-side,[{id:'type:0',label:'Pokémon'},{id:'type:1',label:'Trainer'},{id:'type:2',label:'Energy'}],{label:'Blaine’s Quiz #2: guess the hidden card category'});
 }
 if(name==='Tickling Machine'&&!chosen(d,'coin'))d.coin=[helpers.flip(g)?'heads':'tails'];
 // No Removal Gym adds a discard cost to both Energy Removal Trainers.
 if(['Energy Removal','Super Energy Removal'].includes(name)&&g.stadium&&get(g.stadium.id).name==='No Removal Gym'&&!chosen(d,'stadiumCost')){
  const other=options(zone(p.hand,(c,i)=>i!==plan.handIndex));
  if(other.length<2)throw Error('No Removal Gym requires two other cards to discard');
  return select(g,plan,'stadiumCost',side,other,{min:2,max:2,label:'No Removal Gym: discard 2 cards'});
 }
 // A copied Trainer remains physically in the opponent's discard pile.
 if(name==='Mail from Bill'&&plan.proxy&&p.hand.length>=4)throw Error('Mail from Bill copy requires fewer than four other cards');
 const hchoices=(pred=()=>true)=>options(zone(p.hand,(c,i)=>i!==plan.handIndex&&pred(c,i)));
 const deck=(pred=()=>true)=>options(zone(p.deck,pred),'deck');
 const own=(pred=()=>true)=>options(targets(p,pred),'slot');
 const enemy=(pred=()=>true)=>options(targets(f,pred),'slot');
 const disc=(owner,pred=()=>true)=>options(zone(owner.discard,pred),'disc');
 const single=(key,actor,items,label,optional=false)=>select(g,plan,key,actor,items,{label,optional});
 const multi=(key,actor,items,min,max,label,optional=false)=>select(g,plan,key,actor,items,{min,max,label,optional});
 // Sabrina's Psychic Control copies only one-shot Trainers. Permanent cards,
 // Pokémon Tools and fossil cards are excluded by the printed restriction.
 if(name==="Sabrina's Psychic Control"){
  if(!chosen(d,'coin'))d.coin=helpers.flip(g)?['heads']:['tails'];
  if(d.coin[0]==='heads'&&!chosen(d,'copy')){
   const entries=disc(f,c=>c.supertype==='Trainer'&&SUPPORTED.has(c.name)&&!
    (c.subtypes||[]).includes('Stadium')&&!['PlusPower','Defender','Berry','Counterattack Claws',"Sabrina's Psychic Control",'Charity','Mysterious Fossil','Clefairy Doll'].includes(c.name));
   if(entries.length)return single('copy',side,entries,"Choose opponent's discarded Trainer to copy",true);
   d.copy=[];
  }
 }
 // Neo Destiny theme Trainer decisions are authoritative and replay-safe.
 if(['Berry','Counterattack Claws','Focus Band','EXP.ALL','Gold Berry','Miracle Berry','Balloon Berry','Magnifier'].includes(name)&&!chosen(d,'target')){
  return single('target',side,own(u=>!u.attachedTrainers.some(t=>['Berry','Counterattack Claws','Focus Band','EXP.ALL','Gold Berry','Miracle Berry','Balloon Berry','Magnifier'].includes(get(t.id).name))),'Attach the Pokémon Tool to which Pokémon?');
 }
 if(name==='Pokémon Breeder Fields'){
  // One or two of your in-play Pokémon can be nominated for independent flips.
  const evolutionOptions=u=>p.deck.flatMap((id,i)=>canEvolve(get(id),get(u.id))?[{id:`deck:${i}`,label:get(id).name}]:[]);
  if(!chosen(d,'targets')){
   const targetsWithEvos=targets(p,u=>!get(u.id).subtypes?.includes('Baby')&&evolutionOptions(u).length);
   if(!targetsWithEvos.length)throw Error('No Pokémon with a matching Evolution in your deck');
   return multi('targets',side,options(targetsWithEvos,'slot'),1,Math.min(2,targetsWithEvos.length),'Choose 1 or 2 Pokémon for Breeder Fields');
  }
  if(!chosen(d,'heads'))d.heads=nums(d,'targets').map(()=>helpers.flip(g));
  for(let k=0;k<d.heads.length;k++)if(d.heads[k]&&!chosen(d,'evo'+k)){
   const u=slot(p,nums(d,'targets')[k]),cards=evolutionOptions(u);
   if(cards.length)return single('evo'+k,side,cards,'Choose evolution to add to your hand',true);
   d['evo'+k]=[];
  }
 }
 // Neo Discovery theme Trainers: all decisions are made by the correct player.
 if(name==='Energy Ark'){
  if(!chosen(d,'flips'))d.flips=[helpers.flip(g),helpers.flip(g)];
  if(!chosen(d,'find')){
   const amount=d.flips.filter(Boolean).length,available=deck(basicEnergy),cap=Math.min(amount,available.length);
   if(cap)return multi('find',side,available,0,cap,'Energy Ark: search for Basic Energy',true);
   d.find=[];
  }
 }
 if(name==='Fossil Egg'){
  if(p.bench.length>=5)throw Error('Fossil Egg requires a Bench space');
  if(!chosen(d,'heads'))d.heads=[helpers.flip(g)];
  if(d.heads[0]&&!chosen(d,'fossil')){
   const valid=fossilEvolution;
   const fromHand=hchoices(valid).map(o=>({...o,id:o.id.replace('n:','hand:')}));
   const fromDeck=deck(valid);
   if(fromHand.length+fromDeck.length)return single('fossil',side,[...fromHand,...fromDeck],'Choose Fossil evolution from hand or deck',true);
   d.fossil=[];
  }
 }
 if(name==='Hyper Devolution Spray'&&!chosen(d,'devolve')){
  return single('devolve',side,own(u=>u.under.length>0),'Choose evolved Pokémon to devolve');
 }
 if(name==='Double Gust'){
  if(cannotSwitch(g,side))d.ownSwitch=[];
  if(cannotSwitch(g,1-side))d.enemySwitch=[];
  if(!chosen(d,'ownSwitch')){
   if(p.bench.length)return single('ownSwitch',1-side,options(p.bench.map((u,i)=>({i,label:publicName(u)})),'bench'),'Opponent chooses your replacement');
   d.ownSwitch=[];
  }
  if(!chosen(d,'enemySwitch')){
   if(f.bench.length)return single('enemySwitch',side,options(f.bench.map((u,i)=>({i,label:publicName(u)})),'bench'),'Choose opponent replacement');
   d.enemySwitch=[];
  }
 }



 // Neo v0.63: Super Scoop Up flips once before offering a target.
 if(name==='Super Scoop Up'){
  if(!chosen(d,'ssuCoin'))d.ssuCoin=[helpers.flip(g)?'heads':'tails'];
  if(d.ssuCoin[0]==='heads'&&!chosen(d,'ssuTarget'))
   return single('ssuTarget',side,own(),'Super Scoop Up: choose Pokémon to return to hand');
 }

 // Neo Genesis Card-Flip Game: pick a genuinely face-down Prize, then guess
 // its public category WITHOUT ever exposing its ID in private options.
 if(name==='Card-Flip Game'){
  if(!chosen(d,'flipPrize')){
   const available=f.prizes.flatMap((id,i)=>!g.prizesFaceUp&&!f.prizeFaceUp?.[i]?[{id:'prize:'+i,label:'Opponent Prize '+(i+1)}]:[]);
   if(!available.length)throw Error('Card-Flip Game requires an opponent face-down Prize');
   return single('flipPrize',side,available,'Choose an opponent face-down Prize');
  }
  if(!chosen(d,'flipGuess'))return single('flipGuess',side,[
   {id:'kind:0',label:'Energy'}, {id:'kind:1',label:'Trainer'}, {id:'kind:2',label:'Pokémon'}
  ],'Guess the hidden Prize card type');
 }
 // Neo v0.64: owner-only deck order and hand payment choices.
 if(name==='New Pokédex'){
  if(!d.newDexShuffled){p.deck=helpers.shuffle(g,p.deck);d.newDexShuffled=true;}
  const count=Math.min(5,p.deck.length),base=p.deck.length-count;
  for(let step=0;step<count;step++){
   const key='newDex'+step;
   if(!chosen(d,key)){
    const used=Array.from({length:step},(_,i)=>nums(d,'newDex'+i)[0]);
    const optionsFor=p.deck.flatMap((id,i)=>i>=base&&!used.includes(i)?[{id:'deck:'+i,label:get(id).name}]:[]);
    return single(key,side,optionsFor,'New Pokédex: select card '+(step+1)+' from top',false);
   }
  }
 }
 if(name==='Energy Amplifier'){
  if(!chosen(d,'ampCost'))return single('ampCost',side,hchoices(isEnergy),'Energy Amplifier: choose an Energy card to shuffle into deck');
  if(!d.ampShuffled){
   const ix=nums(d,'ampCost')[0],id=p.hand[ix];
   if(!id||!isEnergy(get(id))||ix===plan.handIndex)throw Error('Energy Amplifier illegal Energy cost');
   p.hand.splice(ix,1);if(ix<plan.handIndex)plan.handIndex--;
   p.deck=helpers.shuffle(g,[...p.deck,id]);
   helpers.log(g,'Energy Amplifier revealed '+get(id).name+'.');
   d.ampShuffled=true;
  }
  if(!chosen(d,'ampCoin'))d.ampCoin=[helpers.flip(g)?'heads':'tails'];
  if(d.ampCoin[0]==='heads'&&!chosen(d,'ampFind')){
   const items=deck(basicEnergy);
   if(items.length)return multi('ampFind',side,items,0,Math.min(3,items.length),'Energy Amplifier: select up to 3 Basic Energy',true);
   d.ampFind=[];
  }
 }
 if(name==="Thought Wave Machine (Rocket's Secret Machine)"){
  if(!chosen(d,'twFlips')){
   const results=[];let heads=0;
   while(true){
    if(results.length>1000)throw Error('Thought Wave flip limit exceeded');
    const coin=helpers.flip(g);results.push(coin?'heads':'tails');if(!coin)break;heads++;
   }
   d.twFlips=results;d.twHeads=heads;
  }
  const energyCount=f.active?.energies.length||0,required=Math.min(d.twHeads,energyCount);
  if(required>0&&!chosen(d,'twEnergy')){
   if(required===energyCount)d.twEnergy=Array.from({length:energyCount},(_,i)=>'energy:'+i);
   else return multi('twEnergy',side,options(zone(f.active.energies),'energy'),required,required,'Thought Wave: select opposing Energy to return');
  }
 }
 // Neo v0.55 — exact two-seat Trainer decisions. The Trainer itself remains
 // in its hand until commit; any other hand picks use pre-commit indices.
 if(name==='Mary'){
  if(!chosen(d,'maryDrawn')){
   helpers.draw(g,side,2);d.maryDrawn=true;
  }
  if(!chosen(d,'maryReturn')){
   const candidates=hchoices();
   if(candidates.length<2)throw Error('Mary requires two cards to shuffle back');
   return multi('maryReturn',side,candidates,2,2,'Mary: choose two hand cards to shuffle into your deck');
  }
 }
 if(name==='PokéGear'&&!chosen(d,'gearTrainer')){
  const at=Math.max(0,p.deck.length-7),items=p.deck.flatMap((id,i)=>i>=at&&get(id).supertype==='Trainer'?[{id:'deck:'+i,label:get(id).name}]:[]);
  if(items.length)return multi('gearTrainer',side,items,0,1,'PokéGear: reveal one Trainer from top seven',true);
  d.gearTrainer=[];
 }
 if(name==='Super Energy Retrieval'){
  if(!chosen(d,'serCost')){
   const possible=hchoices();
   if(possible.length<2||!p.discard.some(id=>basicEnergy(get(id))))throw Error('Super Energy Retrieval requires 2 other hand cards and Basic Energy in discard');
   return multi('serCost',side,possible,2,2,'Super Energy Retrieval: trade two hand cards');
  }
  if(!chosen(d,'serEnergy')){
   const possible=disc(p,basicEnergy),count=Math.min(4,possible.length);
   if(count)return multi('serEnergy',side,possible,count,count,'Super Energy Retrieval: choose '+count+' Basic Energy cards');
   d.serEnergy=[];
  }
 }
 if(name==='Time Capsule'){
  for(const ownerSide of [1-side,side]){
   const owner=g.players[ownerSide],yesKey='capsuleYes'+ownerSide,pickKey='capsuleCards'+ownerSide;
   const eligible=options(zone(owner.discard,c=>basicEnergy(c)||(c.supertype==='Pokémon'&&(c.subtypes?.includes('Basic')||c.subtypes?.includes('Stage 1')||c.subtypes?.includes('Stage 2')))),'disc');
   if(!chosen(d,yesKey)){
    if(eligible.length)return single(yesKey,ownerSide,[{id:'choice:0',label:'Return no cards'},{id:'choice:1',label:'Return '+Math.min(5,eligible.length)+' eligible cards'}],'Time Capsule: choose whether to recycle cards');
    d[yesKey]=['choice:0'];
   }
   if(nums(d,yesKey)[0]===1&&!chosen(d,pickKey))
    return multi(pickKey,ownerSide,eligible,Math.min(5,eligible.length),Math.min(5,eligible.length),'Time Capsule: choose cards to shuffle into your deck');
  }
 }
 if(name==='Pokémon Personality Test'){
  if(!chosen(d,'personalityCard')){
   const valid=hchoices(c=>c.supertype==='Pokémon'&&c.subtypes?.some(x=>x==='Stage 1'||x==='Stage 2'));
   if(!valid.length)throw Error('Pokémon Personality Test requires an Evolution in hand');
   return single('personalityCard',side,valid,'Select an Evolution card to show after opponent guesses');
  }
  if(!chosen(d,'personalityGuess'))
   return single('personalityGuess',1-side,[{id:'kind:0',label:'Light Pokémon'},{id:'kind:1',label:'Dark Pokémon'},{id:'kind:2',label:'Neither'}],'Guess the hidden Evolution card category');
 }
 if(name==="Impostor Professor Oak's Invention"){
  if(!chosen(d,'oakReplace')){
   (p.privateLog ||= []).push('Impostor Invention: opponent Prize cards — '+f.prizes.map(id=>get(id).name).join(', '));
   return single('oakReplace',side,[{id:'choice:0',label:'Keep opponent Prizes'},{id:'choice:1',label:'Shuffle opponent Prizes into deck and replace'}],'Impostor Invention: replace opponent Prizes?');
  }
 }
 // Neo v0.54: Trainer decisions are owner-specific and transactional.
 if(name==='Energy Charge'){
  if(!chosen(d,'chargeHeads'))d.chargeHeads=[helpers.flip(g)];
  if(d.chargeHeads[0]&&!chosen(d,'recycle')){
   const items=disc(p,c=>isEnergy(c));
   if(items.length)return multi('recycle',side,items,0,Math.min(2,items.length),'Energy Charge: shuffle up to two Energy cards',true);
   d.recycle=[];
  }
 }
 if(name==='Ruin Wall'){
  if(p.bench.length>=5)throw Error('Ruin Wall cannot be played with a full Bench');
  if(!chosen(d,'ruinUnown')){
   const items=deck(c=>c.supertype==='Pokémon'&&c.name.startsWith('Unown')&&c.subtypes?.includes('Basic'));
   if(items.length)return multi('ruinUnown',side,items,0,1,'Ruin Wall: search for an Unown Basic',true);
   d.ruinUnown=[];
  }
 }
 if(name==='Old Rod'){
  if(!chosen(d,'rodFlips'))d.rodFlips=[helpers.flip(g),helpers.flip(g)];
  if(!chosen(d,'oldCard')){
   const bothHeads=d.rodFlips.every(Boolean),bothTails=d.rodFlips.every(x=>!x);
   const items=bothHeads?disc(p,c=>c.supertype==='Pokémon'):bothTails?disc(p,c=>c.supertype==='Trainer'):[];
   if(items.length)return single('oldCard',side,items,'Old Rod: recover a card from discard',true);
   d.oldCard=[];
  }
 }
 if(name==="Team Rocket's Evil Deeds"){
  if(!chosen(d,'evilCard')){
   const items=options(zone(f.hand),'hand');
   if(items.length)return single('evilCard',side,items,'Evil Deeds: select a card in opponent hand');
   d.evilCard=[];
  }
  if(!chosen(d,'evilDraw')){
   return single('evilDraw',1-side,[0,1,2].map(n=>({id:'count:'+n,label:'Draw '+n+' card(s)'})),'Evil Deeds: opponent chooses cards to draw');
  }
 }
 // Neo Genesis theme-deck Trainers (curated card pool only).
 if(name==='Moo-Moo Milk'&&!chosen(d,'healTarget'))return single('healTarget',side,own(u=>u.damage>0),'Choose Pokémon to heal');
 if(name==='Pokémon March'){
  for(const actor of [1-side,side]){
   const key=`march${actor}`,owner=g.players[actor],eligible=options(zone(owner.deck,isBasicPokemon),'deck');
   if(!chosen(d,key)){
    if(owner.bench.length<5&&eligible.length)return multi(key,actor,eligible,0,1,'Pokémon March: optionally Bench a Basic Pokémon',true);
    d[key]=[];
   }
  }
 }
 if(name==='Super Rod'&&!chosen(d,'coin'))d.coin=[helpers.flip(g)?'heads':'tails'];
 if(name==='Super Rod'&&!chosen(d,'rodCard')){
  const evolved=d.coin[0]==='heads';const eligible=disc(p,c=>evolved?(c.subtypes||[]).some(s=>s==='Stage 1'||s==='Stage 2'):isBasicPokemon(c));
  if(eligible.length)return single('rodCard',side,eligible,`Super Rod: choose ${evolved?'Evolution':'Basic Pokémon'}`,true);
  d.rodCard=[];
 }
 // Lt. Surge's Treaty: the opponent decides which of the two outcomes.
 if(name==="Lt. Surge's Treaty"){
  if(!chosen(d,'mode'))return single('mode',1-side,[{id:'mode:0',label:'Both players take one Prize'},{id:'mode:1',label:'The player who used Treaty draws one card'}],'Lt. Surge’s Treaty: opponent chooses the outcome');
  if(nums(d,'mode')[0]===0)for(const ownerSide of [1-side,side]){
   const key='prize'+ownerSide,owner=g.players[ownerSide];
   if(!chosen(d,key)){
    if(owner.prizes.length)return single(key,ownerSide,owner.prizes.map((_,i)=>({id:`prize:${i}`,label:`Prize ${i+1}`})),'Take one of your Prizes');
    d[key]=[];
   }
  }
 }
 // Minion of Team Rocket is an immediate-turn-ending Trainer on any tails.
 if(name==='Minion of Team Rocket'){
  if(!chosen(d,'flips'))d.flips=[helpers.flip(g),helpers.flip(g)];
  if(d.flips.every(Boolean)&&f.bench.length&&!chosen(d,'bench'))return single('bench',side,options(f.bench.map((u,i)=>({i,label:publicName(u)})),'bench'),'Choose an opponent Benched Pokémon to return to hand');
 }
 // Misty's Wrath: choose exactly two of the available top seven cards.
 if(name==="Misty's Wrath"&&!chosen(d,'keep')){
  const count=Math.min(7,p.deck.length),base=p.deck.length-count;
  const pool=Array.from({length:count},(_,i)=>({id:`deck:${base+i}`,label:get(p.deck[base+i]).name}));
  if(pool.length)return multi('keep',side,pool,Math.min(2,count),Math.min(2,count),"Misty's Wrath: keep 2 from your top 7");
  d.keep=[];
 }
 // Energy Flow: choose any combination of Energy across all your Pokémon.
 if(name==='Energy Flow'&&!chosen(d,'energy')){
  const pool=targets(p).flatMap(({i})=>slot(p,i).energies.map((id,j)=>({id:`energy:${i}:${j}`,label:`${get(slot(p,i).id).name} — ${get(id).name}`})));
  if(pool.length)return multi('energy',side,pool,0,pool.length,'Energy Flow: return any attached Energy to your hand',true);
  d.energy=[];
 }
 // More Gym Heroes / Challenge effects with shared authoritative decisions.
 if(name==="Blaine's Last Resort"&&hchoices().length)throw Error("Blaine's Last Resort requires an empty hand apart from itself");
 if(name==='Good Manners'){
  if(hchoices(isBasicPokemon).length)throw Error('Good Manners requires no Basic Pokémon in hand');
  if(!chosen(d,'find')){const pool=deck(isBasicPokemon);if(pool.length)return single('find',side,pool,'Search a Basic Pokémon',true);d.find=[];}
 }
 if(name==='Master Ball'&&!chosen(d,'find')){
  const visible=p.deck.slice(-7),from=p.deck.length-visible.length;
  const pool=visible.flatMap((id,i)=>pokemon(get(id))?[{id:`deck:${from+i}`,label:get(id).name}]:[]);
  if(pool.length)return single('find',side,pool,'Choose a Pokémon from the top 7',true);
  d.find=[];
 }
 if(name==="Giovanni's Last Resort"&&!chosen(d,'target'))return single('target',side,own(u=>get(u.id).name.startsWith("Giovanni's ")&&u.damage>0),'Choose Giovanni Pokémon to heal');
 if(name==="Misty's Tears"){
  if(!chosen(d,'cost'))return single('cost',side,hchoices(),'Discard another card for Misty’s Tears');
  if(!chosen(d,'find')){const cards=deck(c=>c.name==='Water Energy'),max=Math.min(2,cards.length);if(max)return multi('find',side,cards,0,max,'Find up to 2 Water Energy cards',true);d.find=[];}
 }
 if(name==="Erika's Maids"){
  if(!chosen(d,'cost')){if(hchoices().length<2)throw Error('Erika’s Maids requires two other cards');return multi('cost',side,hchoices(),2,2,'Discard two other cards');}
  if(!chosen(d,'find')){const cards=deck(c=>pokemon(c)&&c.name.startsWith("Erika's "));if(cards.length)return multi('find',side,cards,0,Math.min(2,cards.length),'Find up to 2 Erika Pokémon',true);d.find=[];}
 }
 if(name==="The Rocket's Trap"){
  if(!chosen(d,'coin'))d.coin=[helpers.flip(g)?'heads':'tails'];
  if(d.coin[0]==='heads'&&!chosen(d,'amount'))return single('amount',side,Array.from({length:Math.min(3,f.hand.length)+1},(_,i)=>({id:`count:${i}`,label:`Shuffle ${i} random cards`})),'Choose number of cards');
 }
 if(name==="Rocket's Secret Experiment"){
  if(!chosen(d,'coin'))d.coin=[helpers.flip(g)?'heads':'tails'];
  if(d.coin[0]==='heads'&&!chosen(d,'find')){const cards=deck();if(cards.length)return single('find',side,cards,'Find any card',true);d.find=[];}
 }
 // Curated Gym Heroes / Challenge retail Trainer effects.
 if(name==='Misty' && !chosen(d,'cost')){
  if(hchoices().length<2)throw Error('Misty requires discarding two other cards');
  return multi('cost',side,hchoices(),2,2,'Discard two other cards for Misty');
 }
 if(name==="Brock's Training Method"&&!chosen(d,'find'))return single('find',side,deck(c=>c.supertype==='Pokémon'&&c.name.startsWith("Brock's ")),'Choose a Brock Pokémon');
 if(name==='Lt. Surge'&&!chosen(d,'basic')){
  if(p.bench.length>=5)throw Error('Your Bench is full');
  return single('basic',side,hchoices(isBasicPokemon),'Choose Basic Pokémon to replace your Active');
 }
 if(name==='Secret Mission'&&!chosen(d,'discard')){
  const a=hchoices();return a.length?multi('discard',side,a,0,a.length,'Discard cards, then draw as many',true):(d.discard=[]);
 }
 if(name==='Erika'&&!chosen(d,'drawMine'))return single('drawMine',side,[0,1,2,3].map(i=>({id:`count:${i}`,label:`Draw ${i}`})),'How many cards do you draw?');
 if(name==='Erika'&&!chosen(d,'drawOpponent'))return single('drawOpponent',1-side,[0,1,2,3].map(i=>({id:`count:${i}`,label:`Draw ${i}`})),'How many cards do you draw?');
 if(name==='Sabrina'&&!chosen(d,'source')){
  const family=own(u=>get(u.id).name.startsWith("Sabrina's "));
  if(family.length<2||!family.some(o=>slot(p,Number(o.id.split(':')[1])).energies.length))throw Error('Sabrina requires two Sabrina Pokémon, one with Energy');
 }
 if(name==='Sabrina'&&!chosen(d,'source'))return single('source',side,own(u=>get(u.id).name.startsWith("Sabrina's ")&&u.energies.length>0),'Choose source Sabrina Pokémon');
 if(name==='Sabrina'&&!chosen(d,'target'))return single('target',side,own((u,i)=>get(u.id).name.startsWith("Sabrina's ")&&i!==nums(d,'source')[0]),'Choose destination Sabrina Pokémon');
 if(name==="Blaine's Gamble"&&!chosen(d,'discard')){
  const a=hchoices();return a.length?multi('discard',side,a,0,a.length,'Discard any cards, then flip for double draws',true):(d.discard=[]);
 }
 if(name==='Max Revive'){
  if(!chosen(d,'cost')){
   if(hchoices(isEnergy).length<2)throw Error('Max Revive needs two Energy cards from hand');
   return multi('cost',side,hchoices(isEnergy),2,2,'Discard two Energy cards');
  }
  if(!chosen(d,'recover')){
   if(p.bench.length>=5)throw Error('Bench is full');
   return single('recover',side,disc(p,isBasicPokemon),'Choose Basic Pokémon from discard');
  }
 }
 if(name==='Giovanni'&&!chosen(d,'target'))return single('target',side,own(u=>get(u.id).name.startsWith("Giovanni's ")),'Choose Giovanni Pokémon to evolve early');
 if(name==='Warp Point'){
  if(cannotSwitch(g,1-side))d.enemySwitch=[];
  if(cannotSwitch(g,side))d.ownSwitch=[];
  if(!chosen(d,'enemySwitch')){
   if(f.bench.length)return single('enemySwitch',1-side,options(f.bench.map((u,i)=>({i,label:publicName(u)})),'bench'),'Opponent chooses a replacement');
   d.enemySwitch=[];
  }
  if(!chosen(d,'ownSwitch')){
   if(p.bench.length)return single('ownSwitch',side,options(p.bench.map((u,i)=>({i,label:publicName(u)})),'bench'),'Choose your replacement');
   d.ownSwitch=[];
  }
 }
 if(name==="Erika's Perfume"&&!chosen(d,'opponentBasics')){
  const a=options(zone(f.hand,isBasicPokemon),'hand'),n=Math.min(a.length,5-f.bench.length);
  if(n)return multi('opponentBasics',side,a,0,n,'Choose opponent Basics to Bench',true);
  d.opponentBasics=[];
 }
 // Prevent mandatory choice chains that cannot finish. Item Finder can
 // recover a Trainer already in the discard OR one discarded to pay its cost.
 // Pokémon Trader needs a Pokémon both to offer and to find in the deck.
 if(name==='Item Finder'&&!disc(p,c=>c.supertype==='Trainer').length
  &&!hchoices(c=>c.supertype==='Trainer').length)throw Error('Item Finder has no Trainer to recover');
 if(name==='Pokémon Trader'){
  if(!hchoices(pokemon).length)throw Error('Pokémon Trader needs a Pokémon in hand');
  if(!deck(pokemon).length)throw Error('Pokémon Trader has no Pokémon left in deck');
 }
 if(name==='Blaine'&&!p.hand.some((id,i)=>i!==plan.handIndex&&get(id).name==='Fire Energy'))throw Error('Blaine requires Fire Energy to attach');
 const cost2=['Computer Search','Item Finder','Maintenance'];
 if(cost2.includes(name) && !chosen(d,'cost')){
  if(hchoices().length<2)throw Error(name+' needs two other cards to discard/return');
  return multi('cost',side,hchoices(),2,2,'Choose two cards from your hand');
 }
 // Validate the destination before requesting payment: an impossible search must not
 // strand the player in a mandatory discard decision.
 if(name==='Energy Retrieval'&&!disc(p,basicEnergy).length)throw Error('No Basic Energy in discard');
 if(['Energy Retrieval',"Imposter Oak's Revenge"].includes(name)&&!chosen(d,'cost')){
  if(!hchoices().length)throw Error(name+' requires one other card');
  return single('cost',side,hchoices(),'Choose one other card to discard');
 }
 if(name==='Pokémon Trader'&&!chosen(d,'trade'))return single('trade',side,hchoices(pokemon),'Choose Pokémon from hand to trade');
 if(name==='Computer Search'&&!chosen(d,'find'))return single('find',side,deck(),'Search your deck for any card');
 if(name==='Item Finder'&&!chosen(d,'recover'))return single('recover',side,disc(p,c=>c.supertype==='Trainer'),'Choose Trainer from discard');
 if(name==='Pokémon Trader'&&!chosen(d,'find'))return single('find',side,deck(pokemon),'Choose Pokémon from deck');
 if(name==='Energy Retrieval'&&!chosen(d,'recover')){const a=disc(p,basicEnergy);if(!a.length)throw Error('No Basic Energy in discard');return multi('recover',side,a,1,Math.min(2,a.length),'Recover 1 or 2 Basic Energy');}
 if(name==='Energy Search'&&!chosen(d,'find'))return single('find',side,deck(basicEnergy),'Choose Basic Energy');
 if(name==="The Boss's Way"&&!chosen(d,'find'))return single('find',side,deck(c=>pokemon(c)&&c.name.startsWith('Dark ')),'Choose Dark Evolution',false);
 if(name==='Poké Ball'&&!chosen(d,'find')&&helpers.flip(g)){const available=deck(pokemon);if(available.length)return single('find',side,available,'Search for a Pokémon',true);d.find=[];}
 if(name==='Pokédex'&&!chosen(d,'arrange')){const k=Math.min(5,p.deck.length);if(!k)d.arrange=[];else return multi('arrange',side,options(p.deck.slice(-k).reverse().map((id,i)=>({i,label:get(id).name})),'top'),k,k,'Reorder top cards (top to bottom)');}
 if(name==='Recycle'&&!chosen(d,'recover')&&helpers.flip(g))return single('recover',side,disc(p),'Put a card from discard on your deck',true);
 if(name==='Gust of Wind'&&cannotSwitch(g,1-side))d.target=[];
 if(name==='Switch'&&cannotSwitch(g,side))d.target=[];
 if(name==='Gust of Wind'&&!chosen(d,'target'))return single('target',side,options(f.bench.map((u,i)=>({i,label:publicName(u)})),'bench'),'Choose opponent replacement');
 if(name==='Switch'&&!chosen(d,'target'))return single('target',side,options(p.bench.map((u,i)=>({i,label:publicName(u)})),'bench'),'Choose your replacement');
 if(['Potion','Super Potion','Scoop Up','Devolution Spray','Defender','Pokémon Center'].includes(name)&&!chosen(d,'target')&&name!=='Pokémon Center')return single('target',side,own(u=>name==='Potion'?u.damage>0:name==='Super Potion'?u.damage>0&&u.energies.length>0:name==='Devolution Spray'?u.under.length>0:true),'Choose one of your Pokémon');
 if(name==='Energy Removal'&&!chosen(d,'target'))return single('target',side,enemy(u=>u.energies.length>0&&!u.attachedTrainers.some(t=>get(t.id).name==="Brock's Protection")),'Choose opposing Pokémon');
 if(name==='Super Energy Removal'){
  if(!chosen(d,'source'))return single('source',side,own(u=>u.energies.length>0),'Choose your Pokémon to pay Energy');
  if(!chosen(d,'ownEnergy'))return single('ownEnergy',side,options(zone(slot(p,nums(d,'source')[0]).energies)),'Discard one of your attached Energy');
  if(!chosen(d,'target'))return single('target',side,enemy(u=>u.energies.length>0&&!u.attachedTrainers.some(t=>get(t.id).name==="Brock's Protection")),'Choose opponent Pokémon');
 }
 if(['Energy Removal','Super Energy Removal'].includes(name)&&chosen(d,'target')&&!chosen(d,'enemyEnergy')){
  const u=slot(f,nums(d,'target')[0]),max=name==='Super Energy Removal'?Math.min(2,u.energies.length):1;
  return multi('enemyEnergy',side,options(zone(u.energies)),name==='Super Energy Removal'?1:1,max,'Choose opposing Energy to discard');
 }
 if(name==='Super Potion'&&chosen(d,'target')&&!chosen(d,'ownEnergy'))return single('ownEnergy',side,options(zone(slot(p,nums(d,'target')[0]).energies)),'Discard one attached Energy');
 if(name==='Nightly Garbage Run'&&!chosen(d,'recover')){const a=disc(p,c=>pokemon(c)||basicEnergy(c));if(!a.length)throw Error('No eligible cards');return multi('recover',side,a,1,Math.min(3,a.length),'Choose up to 3 cards');}
 if(name==='Mr. Fuji'&&!chosen(d,'target'))return single('target',side,options(p.bench.map((u,i)=>({i,label:publicName(u)})),'bench'),'Choose a Benched Pokémon');
 if(name==='Pokémon Flute'&&!chosen(d,'recover'))return single('recover',side,disc(f,isBasicPokemon),'Choose opponent Basic Pokémon');
 if(name==='Revive'&&!chosen(d,'recover'))return single('recover',side,disc(p,isBasicPokemon),'Choose Basic Pokémon');
 if(name==="Rocket's Sneak Attack"&&!chosen(d,'oppHand')){const a=options(zone(f.hand,c=>c.supertype==='Trainer'),'hand');if(a.length)return single('oppHand',side,a,'Choose opponent Trainer to shuffle away');d.oppHand=[];}
 if(name==='Devolution Spray'&&!chosen(d,'stage')){
  const u=slot(p,nums(d,'target')[0]),c=get(u.id);const vals=[{i:1,label:'Remove Stage 1 and Stage 2'},{i:2,label:'Remove Stage 2'}].filter(o=>o.i===1||c.subtypes?.includes('Stage 2'));
  return single('stage',side,options(vals,'stage'),'Choose evolution stage to remove');
 }
 if(name==='Pokémon Breeder'){
  if(!chosen(d,'evolution'))return single('evolution',side,hchoices(c=>c.subtypes?.includes('Stage 2')),'Choose Stage 2 Pokémon');
  if(!chosen(d,'target')){
   const evolved=get(p.hand[nums(d,'evolution')[0]]);const stage1=Array.from(CATALOG.values()).filter(c=>c.name===evolved.evolvesFrom&&c.subtypes?.includes('Stage 1'));
   return single('target',side,own(u=>isBasicPokemon(get(u.id))&&u.playedTurn<g.round&&stage1.some(c=>c.evolvesFrom===get(u.id).name)),'Choose a Basic Pokémon to evolve');
  }
 }
 if(name==='Challenge!'){
  if(!chosen(d,'accept')&&p.bench.length===5&&f.bench.length===5){d.accept=['accept:0'];}
  if(!chosen(d,'accept'))return single('accept',1-side,[{id:'accept:0',label:'Decline: opponent draws two cards'},{id:'accept:1',label:'Accept: both players search for Basics'}],'Accept Challenge?');
  if(nums(d,'accept')[0]===1){
   for(const player of [1-side,side]){
    const k=`basics${player}`;if(!chosen(d,k)){
     const owner=g.players[player];const cap=Math.min(5-owner.bench.length,owner.deck.filter(id=>isBasicPokemon(get(id))).length);
     if(cap>0)return multi(k,player,options(zone(owner.deck,isBasicPokemon),'deck'),0,cap,'Choose Basic Pokémon to Bench',true);
     d[k]=[];
    }
   }
  }
 }
 // No choices left: evaluate the effect in a single reducer transaction.
 commit(g,plan,helpers);
 return true;
}
function take(array,picks){return [...picks].sort((a,b)=>b-a).map(i=>({i,id:array.splice(i,1)[0]})).sort((a,b)=>a.i-b.i).map(o=>o.id);}
function transferDeck(g,p,indices){const moved=take(p.deck,indices);p.deck=shufflePlaceholder(g,p.deck);return moved;}
// Shuffle is supplied by the authenticated game reducer (never Math.random).
let shufflePlaceholder=()=>{throw Error('Shuffle helper missing');};
function commit(g,plan,h){
 const p=g.players[plan.side],f=g.players[1-plan.side],d=plan.data,name=get(plan.cardId).name;
 if(!plan.proxy)held(p,plan.cardId,plan.handIndex);
 const pick=k=>nums(d,k)[0],picks=k=>nums(d,k),extract=(owner,k)=>take(owner.discard,picks(k));
 const cardInHand=plan.proxy?plan.cardId:p.hand.splice(plan.handIndex,1)[0];
 const isStadium=['No Removal Gym',"The Rocket's Training Gym",'Resistance Gym',"Rocket's Minefield Gym",'Narrow Gym','Pewter City Gym','Cerulean City Gym','Vermilion City Gym','Celadon City Gym','Fuchsia City Gym','Saffron City Gym','Cinnabar City Gym','Viridian City Gym','Rocket\'s Hideout','Energy Stadium','Chaos Gym','Ecogym','Sprout Tower','Healing Field','Broken Ground Gym','Radio Tower','Lucky Stadium'].includes(name);
 if(isStadium){
  if(g.stadium&&get(g.stadium.id).name===name)throw Error('This Stadium is already in play');
  if(g.stadium){const old=g.players[g.stadium.owner];old.discard.push(old.stadium);delete old.stadium;}
  p.stadium=cardInHand;g.stadium={owner:plan.side,id:cardInHand};
 }else if(!plan.proxy)p.discard.push(cardInHand);

 if(chosen(d,'stadiumCost'))p.discard.push(...take(p.hand,picks('stadiumCost').map(i=>i>plan.handIndex?i-1:i)));
 if(['Computer Search','Item Finder',"Imposter Oak's Revenge",'Energy Retrieval'].includes(name))p.discard.push(...take(p.hand,picks('cost').map(i=>i>plan.handIndex?i-1:i)));
 if(name==='Maintenance')p.deck.push(...take(p.hand,picks('cost').map(i=>i>plan.handIndex?i-1:i)));
 switch(name){



  case 'Card-Flip Game':{
   const i=pick('flipPrize'),guess=pick('flipGuess');
   if(i<0||i>=f.prizes.length||g.prizesFaceUp||f.prizeFaceUp?.[i])throw Error('Card-Flip Game selected a face-up or missing Prize');
   if(guess<0||guess>2)throw Error('Card-Flip Game requires a valid type guess');
   const revealed=get(f.prizes[i]);
   (f.prizeFaceUp ||= [])[i]=true;
   const actual=revealed.supertype==='Energy'||basicEnergy(revealed)?0:revealed.supertype==='Trainer'?1:2;
   h.log(g,'Card-Flip Game revealed opponent Prize '+(i+1)+': '+revealed.name+'.');
   if(guess===actual)h.draw(g,plan.side,2);
   break;
  }
  case 'New Pokédex':{
   const count=Math.min(5,p.deck.length),base=p.deck.length-count;
   const chosenIndices=Array.from({length:count},(_,i)=>pick('newDex'+i));
   if(new Set(chosenIndices).size!==count||chosenIndices.some(i=>i<base||i>=p.deck.length))throw Error('Invalid New Pokédex order');
   const wanted=chosenIndices.map(i=>p.deck[i]);
   for(let i=0;i<count;i++)p.deck[base+i]=wanted[count-1-i];
   break;
  }
  case 'Energy Amplifier':{
   if(d.ampCoin[0]==='heads'){
    const picksFrom=picks('ampFind');
    if(picksFrom.length>3||new Set(picksFrom).size!==picksFrom.length||picksFrom.some(i=>!basicEnergy(get(p.deck[i]))))throw Error('Invalid Amplifier search');
    p.hand.push(...take(p.deck,picksFrom));p.deck=h.shuffle(g,p.deck);
   }
   break;
  }
  case "Thought Wave Machine (Rocket's Secret Machine)":{
   const amount=Math.min(d.twHeads,f.active?.energies.length||0),chosenIndices=d.twEnergy?nums(d,'twEnergy'):[];
   if(chosenIndices.length!==amount||new Set(chosenIndices).size!==amount||chosenIndices.some(i=>!f.active.energies[i]))throw Error('Invalid Thought Wave Energy choice');
   f.hand.push(...take(f.active.energies,chosenIndices));
   g.tickleEndsTurn=true;
   break;
  }
  case 'Super Scoop Up':{
   if(d.ssuCoin?.[0]==='heads'){
    const index=pick('ssuTarget'),u=slot(p,index);
    if(!u)throw Error('Super Scoop Up target is missing');
    if(index===-1)p.active=null;else p.bench.splice(index,1);
    p.hand.push(u.id,...u.under,...u.energies,...u.attachedTrainers.map(t=>t.id),...(u.gymShapeshiftCard?[u.gymShapeshiftCard]:[]));
    if(index===-1){
     if(!p.bench.length){g.over=true;g.winner=1-plan.side;}
     else{g.pendingPromotions=[plan.side];g.promotionAfter='trainer';h.finishPromotions(g);}
    }
   }
   break;
  }
  case 'Mary':{
   const chosenHand=picks('maryReturn').map(i=>i>plan.handIndex?i-1:i);
   if(chosenHand.length!==2||new Set(chosenHand).size!==2||chosenHand.some(i=>!p.hand[i]))throw Error('Invalid Mary hand selection');
   p.deck=h.shuffle(g,[...p.deck,...take(p.hand,chosenHand)]);
   break;
  }
  case 'PokéGear':{
   if(d.gearTrainer?.length){
    const idx=pick('gearTrainer'),at=Math.max(0,p.deck.length-7);
    if(idx<at||get(p.deck[idx])?.supertype!=='Trainer')throw Error('Invalid PokéGear Trainer choice');
    p.hand.push(...take(p.deck,[idx]));
   }
   p.deck=h.shuffle(g,p.deck);p.trainerLockedUntil=g.turnSerial+1;break;
  }
  case 'Super Energy Retrieval':{
   const cost=picks('serCost').map(i=>i>plan.handIndex?i-1:i),energy=picks('serEnergy');
   const required=Math.min(4,p.discard.filter(id=>basicEnergy(get(id))).length);
   if(cost.length!==2||new Set(cost).size!==2||cost.some(i=>!p.hand[i])||energy.length!==required||new Set(energy).size!==required||energy.some(i=>!basicEnergy(get(p.discard[i]))))throw Error('Invalid Super Energy Retrieval selection');
   p.discard.push(...take(p.hand,cost));
   p.hand.push(...take(p.discard,energy));break;
  }
  case 'Time Capsule':{
   for(const ownerSide of [1-plan.side,plan.side]){
    const owner=g.players[ownerSide],yes='capsuleYes'+ownerSide,key='capsuleCards'+ownerSide;
    if(nums(d,yes)[0]!==1)continue;
    const valid=owner.discard.filter(id=>{const c=get(id);return basicEnergy(c)||(c.supertype==='Pokémon'&&(c.subtypes?.includes('Basic')||c.subtypes?.includes('Stage 1')||c.subtypes?.includes('Stage 2')));});
    const count=Math.min(5,valid.length),chosenCards=picks(key);
    if(chosenCards.length!==count||new Set(chosenCards).size!==count||chosenCards.some(i=>!owner.discard[i]||!valid.includes(owner.discard[i])))throw Error('Invalid Time Capsule recovery');
    owner.deck=h.shuffle(g,[...owner.deck,...take(owner.discard,chosenCards)]);
   }
   p.trainerLockedUntil=g.turnSerial+1;break;
  }
  case 'Pokémon Personality Test':{
   const original=picks('personalityCard')[0],i=original>plan.handIndex?original-1:original;
   const candidate=get(p.hand[i]);
   if(candidate.supertype!=='Pokémon'||!candidate.subtypes?.some(s=>s==='Stage 1'||s==='Stage 2'))throw Error('Invalid Pokémon Personality Test target');
   const trueType=candidate.name.startsWith('Light ')?0:candidate.name.startsWith('Dark ')?1:2;
   h.draw(g,nums(d,'personalityGuess')[0]===trueType?1-plan.side:plan.side,3);
   h.log(g,'Pokémon Personality Test revealed '+candidate.name+'.');
   break;
  }
  case "Impostor Professor Oak's Invention":{
   if(nums(d,'oakReplace')[0]===1){
    const count=f.prizes.length;
    f.deck=h.shuffle(g,[...f.deck,...f.prizes]);f.prizes=[];
    // The old face-up indices belonged to the shuffled-away Prize cards.
    // Replacement cards are new face-down Prizes unless a global effect
    // (Here Comes Team Rocket!) requires all Prize identities to stay public.
    f.prizeFaceUp=[];
    for(let i=0;i<count;i++)f.prizes.push(f.deck.pop());
   }break;
  }
  case 'Arcade Game':{
   p.deck=h.shuffle(g,p.deck);
   const revealed=[];for(let i=0;i<3&&p.deck.length;i++)revealed.push(p.deck.pop());
   const matched=revealed.find(id=>revealed.filter(x=>get(x).name===get(id).name).length>=2);
   const gained=matched?revealed.filter(id=>get(id).name===get(matched).name):[];
   const remaining=revealed.filter(id=>!gained.includes(id));
   p.hand.push(...gained);p.deck=h.shuffle(g,[...p.deck,...remaining]);
   h.log(g,'Arcade Game revealed '+revealed.map(id=>get(id).name).join(', ')+'.');
   break;
  }
  case 'Energy Charge':{
   if(d.chargeHeads?.[0])p.deck=h.shuffle(g,[...p.deck,...take(p.discard,picks('recycle'))]);
   break;
  }
  case 'Ruin Wall':{
   if(d.ruinUnown?.length){
    if(p.bench.length>=5)throw Error('Ruin Wall Bench full');
    const i=pick('ruinUnown'),id=p.deck[i],candidate=get(id);
    if(candidate.supertype!=='Pokémon'||!candidate.name.startsWith('Unown')||!candidate.subtypes?.includes('Basic'))throw Error('Invalid Ruin Wall search');
    p.bench.push(h.unit(take(p.deck,[i])[0],g.round));
   }
   p.deck=h.shuffle(g,p.deck);break;
  }
  case 'Old Rod':{
   if(d.oldCard?.length){
    const id=p.discard[pick('oldCard')],c=get(id),bothHeads=d.rodFlips.every(Boolean),bothTails=d.rodFlips.every(x=>!x);
    if(!(bothHeads&&c.supertype==='Pokémon'||bothTails&&c.supertype==='Trainer'))throw Error('Illegal Old Rod recovery');
    p.hand.push(...take(p.discard,picks('oldCard')));
   }break;
  }
  case "Team Rocket's Evil Deeds":{
   if(d.evilCard?.length){
    const i=pick('evilCard');if(!f.hand[i])throw Error('Stale Evil Deeds opponent hand');
    f.deck=h.shuffle(g,[...f.deck,...take(f.hand,[i])]);
   }
   const count=pick('evilDraw');if(!Number.isInteger(count)||count<0||count>2)throw Error('Invalid Evil Deeds draw');
   h.draw(g,1-plan.side,count);break;
  }
  case 'Chaos Gym':break;
  case "Lt. Surge's Secret Plan":{
   if(p.bench.length>=5)throw Error('Bench full for Secret Plan');
   const before=pick('hidden');const index=plan.proxy?before:before>plan.handIndex?before-1:before;
   if(!p.hand[index])throw Error('Secret Plan card selection changed');
   const hidden=h.unit(p.hand.splice(index,1)[0],g.round);hidden.secretPlanFaceDown=true;hidden.secretPlanOwner=plan.side;hidden.secretPlanSerial=(g.nextSecretPlanSerial=(g.nextSecretPlanSerial||0)+1);
   p.bench.push(hidden);break;
  }
  case "Sabrina's Psychic Control":{
   if(d.coin[0]==='heads'&&d.copy?.length){
    const copiedId=f.discard[pick('copy')];
    if(!copiedId)throw Error('Stale Psychic Control target');
    const copied=get(copiedId);
    if(copied.supertype!=='Trainer'||!SUPPORTED.has(copied.name)||copied.subtypes?.includes('Stadium')||
       ['PlusPower','Defender','Berry','Counterattack Claws',"Sabrina's Psychic Control",'Charity','Mysterious Fossil','Clefairy Doll'].includes(copied.name))throw Error('Illegal Psychic Control target');
    // Virtual play: no extra card enters hand, discard, deck, or Bench.
    prompt(g,{side:plan.side,handIndex:p.hand.length,cardId:copiedId,proxy:true,data:{}},h);
   }
   break;
  }
  case "Lt. Surge's Treaty":{
   if(pick('mode')===1)h.draw(g,plan.side,1);
   else for(const actor of [1-plan.side,plan.side])if(d['prize'+actor]?.length){
    const owner=g.players[actor],idx=nums(d,'prize'+actor)[0];
    if(!Number.isInteger(idx)||!owner.prizes[idx])throw Error('Illegal Treaty prize');
    owner.hand.push(owner.prizes.splice(idx,1)[0]);
    // Prize reveal flags are indexed to the physical Prize slots.
    // Taking one must shift the remaining cards' visibility together.
    owner.prizeFaceUp?.splice(idx,1);
   }
   if(pick('mode')===0){
    // Treaty grants actual Prize cards. Taking the last Prize wins just as
    // taking it after a Knock Out does; simultaneous final claims are a tie
    // pending the historical sudden-death procedure.
    const winners=[0,1].filter(side=>g.players[side].prizes.length===0);
    if(winners.length){
     g.over=true;g.winner=winners.length===1?winners[0]:null;
     h.log(g,g.winner===null?'Simultaneous win conditions — sudden-death rematch required.':g.players[g.winner].name+' wins!');
    }
   }
   break;
  }
  case "Brock's Protection":{
   const u=slot(p,pick('target'));if(!get(u.id).name.startsWith("Brock's "))throw Error('Protection requires Brock Pokémon');
   u.attachedTrainers.push({id:plan.cardId});if(!plan.proxy)p.discard.pop();break;
  }
  case 'Narrow Gym':{
   for(const actor of [1-plan.side,plan.side]){const owner=g.players[actor];if(owner.bench.length>4){const i=nums(d,'bounce'+actor)[0];const u=owner.bench.splice(i,1)[0];owner.hand.push(u.id,...u.under,...u.energies,...u.attachedTrainers.map(t=>t.id));}}
   break;
  }
  case "Misty's Wish":{
   const idx=pick('prize'),prize=p.prizes[idx];
   if(pick('permission')===1){
    // Approval with no other hand card does not grant an undeserved draw.
    if(d.swap?.length){
     const from=pick('swap')>plan.handIndex?pick('swap')-1:pick('swap');
     const tmp=p.hand[from];p.hand[from]=prize;p.prizes[idx]=tmp;
     // Replacement is a new face-down Prize, not the revealed original.
     if(p.prizeFaceUp)p.prizeFaceUp[idx]=false;
    }
   }else{
    // The original Prize is returned face-down if permission was denied.
    if(p.prizeFaceUp)p.prizeFaceUp[idx]=false;
    h.draw(g,plan.side,1);
   }
   break;
  }
  case "Blaine's Quiz #2":{
   const idx=pick('question')>plan.handIndex?pick('question')-1:pick('question'),c=get(p.hand[idx]);
   const type=c.supertype==='Trainer'?1:c.supertype==='Pokémon'&&!/ Energy$/.test(c.name)?0:2;
   (pick('guess')===type?h.draw(g,1-plan.side,2):h.draw(g,plan.side,2));break;
  }
  case 'Charity':{if(!p.active)throw Error('Charity requires Active Pokémon');p.active.attachedTrainers.push({id:plan.cardId});if(!plan.proxy)p.discard.pop();break;}
  case 'Recall':p.recallUntil=g.turnSerial+1;break;
  case "Sabrina's ESP":{
   const u=slot(p,pick('target'));if(!get(u.id).name.startsWith("Sabrina's "))throw Error('Invalid Sabrina ESP target');
   u.attachedTrainers.push({id:plan.cardId,expires:g.turnSerial+1});if(!plan.proxy)p.discard.pop();break;
  }
  case "Koga's Ninja Trick":{
   if(!p.active||!get(p.active.id).name.startsWith("Koga's "))throw Error('Ninja Trick requires Active Koga Pokémon');
   p.active.attachedTrainers.push({id:plan.cardId});if(!plan.proxy)p.discard.pop();break;
  }
  case "Blaine's Quiz #3":{
   const source=get(p.hand[pick('question')>plan.handIndex?pick('question')-1:pick('question')]);
   const matching=[...new Set([...CATALOG.values()].filter(c=>c.supertype==='Pokémon'&&c.attacks?.some(a=>a.name===source.attacks[pick('attack')].name)).map(c=>c.name))].sort();
   if(matching[pick('guess')]===source.name)h.draw(g,1-plan.side,3);else h.draw(g,plan.side,3);break;
  }
  case 'Tickling Machine':{
   if(d.coin[0]==='heads'){
    if(f.tickleHand?.length)throw Error('Opponent already has a Tickling Machine set-aside hand');
    f.tickleHand=f.hand.splice(0);f.tickleRestoreTurn=g.turnSerial+1;
   }else if(!plan.proxy){g.tickleEndsTurn=true;}
   break;
  }
  case 'Minion of Team Rocket':{
   if(d.flips.every(Boolean)){
    if(d.bench?.length){const i=pick('bench'),u=f.bench[i];if(!u)throw Error('Minion target is missing');
     f.bench.splice(i,1);f.hand.push(u.id,...u.under,...u.energies,...u.attachedTrainers.map(t=>t.id));}
   }else if(!plan.proxy)h.finishTurn(g); // A virtual Chaos Gym use never ends the original player's turn.
   break;
  }
  case "Misty's Duel":{
   // The card explicitly permits a coin flip in place of Rock–Paper–Scissors.
   const winningSide=h.flip(g)?plan.side:1-plan.side,owner=g.players[winningSide];
   owner.deck=h.shuffle(g,[...owner.deck,...owner.hand]);owner.hand=[];h.draw(g,winningSide,5);break;
  }
  case "Misty's Wrath":{ 
   const n=Math.min(7,p.deck.length),top=p.deck.splice(-n),start=p.deck.length;
   const keep=new Set(picks('keep').map(x=>x-start));
   if(keep.size!==Math.min(2,n)||[...keep].some(i=>i<0||i>=top.length))throw Error('Invalid Misty’s Wrath choice');
   top.forEach((id,i)=>(keep.has(i)?p.hand:p.discard).push(id));break;
  }
  case 'Trash Exchange':{
   const count=p.discard.length;p.deck=h.shuffle(g,[...p.deck,...p.discard]);p.discard=[];
   for(let i=0;i<count&&p.deck.length;i++)p.discard.push(p.deck.pop());break;
  }
  case 'Energy Flow':{
   const grouped=new Map();for(const selected of d.energy||[]){
    const match=/^energy:(-?\d+):(\d+)$/.exec(selected);if(!match)throw Error('Invalid Energy Flow selection');
    const s=Number(match[1]),e=Number(match[2]),u=slot(p,s);
    if(!u||!u.energies[e])throw Error('Invalid Energy Flow source');
    if(!grouped.has(s))grouped.set(s,[]);grouped.get(s).push(e);
   }
   for(const [s,items] of grouped){if(new Set(items).size!==items.length)throw Error('Duplicate Energy Flow selection');const u=slot(p,s);p.hand.push(...take(u.energies,items));}
   break;
  }
  case "Blaine's Last Resort":h.draw(g,plan.side,5);break;
  case "Erika's Kindness":for(const owner of g.players)for(const u of all(owner))u.damage=Math.max(0,u.damage-20);break;
  case 'Good Manners':if(d.find?.length)p.hand.push(...take(p.deck,[pick('find')]));p.deck=h.shuffle(g,p.deck);break;
  case 'Master Ball':if(d.find?.length)p.hand.push(...take(p.deck,[pick('find')]));p.deck=h.shuffle(g,p.deck);break;
  case "Giovanni's Last Resort":slot(p,pick('target')).damage=0;p.discard.push(...p.hand);p.hand=[];break;
  case "Misty's Tears":{const i=pick('cost')>plan.handIndex?pick('cost')-1:pick('cost');p.discard.push(...take(p.hand,[i]));if(d.find?.length)p.hand.push(...take(p.deck,picks('find')));p.deck=h.shuffle(g,p.deck);break;}
  case "Erika's Maids":{p.discard.push(...take(p.hand,picks('cost').map(i=>i>plan.handIndex?i-1:i)));if(d.find?.length)p.hand.push(...take(p.deck,picks('find')));p.deck=h.shuffle(g,p.deck);break;}
  case "The Rocket's Trap":{
   if(d.coin[0]==='heads'){
    const count=Math.min(pick('amount'),f.hand.length);for(let i=0;i<count;i++){const idx=h.random(g,f.hand.length);f.deck.push(f.hand.splice(idx,1)[0]);}f.deck=h.shuffle(g,f.deck);
   }break;
  }
  case "Rocket's Secret Experiment":{
   if(d.coin[0]==='heads'){if(d.find?.length)p.hand.push(...take(p.deck,[pick('find')]));p.deck=h.shuffle(g,p.deck);}
   else p.trainerLockedUntil=g.turnSerial+3;
   break;
  }
  case 'Brock':for(const u of all(p))u.damage=Math.max(0,u.damage-10);break;
  case "Brock's Training Method":p.hand.push(...take(p.deck,[pick('find')]));p.deck=h.shuffle(g,p.deck);break;
  case 'Misty':p.discard.push(...take(p.hand,picks('cost').map(i=>i>plan.handIndex?i-1:i)));p.mistyBoostUntil=g.turnSerial+1;break;
  case 'Lt. Surge':{const i=pick('basic')>plan.handIndex?pick('basic')-1:pick('basic');const id=p.hand.splice(i,1)[0];p.bench.push(p.active);p.active=h.unit(id,g.round);break;}
  case 'Secret Mission':if(d.discard.length){p.discard.push(...take(p.hand,picks('discard').map(i=>i>plan.handIndex?i-1:i)));}h.draw(g,plan.side,d.discard.length);break;
  case 'Erika':h.draw(g,plan.side,pick('drawMine'));h.draw(g,1-plan.side,pick('drawOpponent'));break;
  case 'Koga':p.kogaPoisonUntil=g.turnSerial+1;break;
  case 'Sabrina':{const from=slot(p,pick('source')),to=slot(p,pick('target'));to.energies.push(...from.energies);from.energies=[];break;}
  case "Sabrina's Gaze":for(const x of [p,f]){const count=x.hand.length;x.deck=h.shuffle(g,[...x.deck,...x.hand]);x.hand=[];h.draw(g,g.players.indexOf(x),count);}break;
  case "Blaine's Gamble":{p.discard.push(...take(p.hand,picks('discard').map(i=>i>plan.handIndex?i-1:i)));if(h.flip(g))h.draw(g,plan.side,d.discard.length*2);break;}
  case 'Max Revive':{p.discard.push(...take(p.hand,picks('cost').map(i=>i>plan.handIndex?i-1:i)));p.bench.push(h.unit(extract(p,'recover')[0],g.round));break;}
  case 'Fervor':{const top=take(p.deck,Array.from({length:Math.min(3,p.deck.length)},(_,i)=>p.deck.length-1-i));for(const id of top)(get(id).name==='Fire Energy'?p.hand:p.discard).push(id);break;}
  case 'Giovanni':slot(p,pick('target')).giovanniEvolveUntil=g.turnSerial+1;break;
  case 'Blaine':if(!p.energyUsed){p.blaineRemaining=2;delete p.blaineTarget;}break;
  case "Erika's Perfume":{const ids=take(f.hand,picks('opponentBasics'));for(const id of ids)f.bench.push(h.unit(id,g.round));break;}
  case 'Warp Point':for(const [owner,choice] of [[f,'enemySwitch'],[p,'ownSwitch']])if(d[choice].length){const old=owner.active;owner.active=owner.bench.splice(pick(choice),1,old)[0];STATUS.clearConditions(old);h.clearBenchEffects(old);}break;
  case "Bill's Teleporter":if(h.flip(g))h.draw(g,plan.side,4);break;
  case 'Energy Ark':{if(d.find?.length)p.hand.push(...take(p.deck,picks('find')));p.deck=h.shuffle(g,p.deck);break;}
  case 'Fossil Egg':{
   if(d.heads[0]&&d.fossil?.length){const choice=d.fossil[0],fromHand=choice.startsWith('hand:'),i=n(Number(choice.split(':')[1]));
    const cards=fromHand?p.hand:p.deck;
    const adjusted=fromHand&&i>plan.handIndex?i-1:i;
    const [id]=take(cards,[adjusted]);if(!fossilEvolution(get(id)))throw Error('Not a Mysterious Fossil evolution');
    p.bench.push(h.unit(id,g.round));
    if(!fromHand)p.deck=h.shuffle(g,p.deck);
   }break;
  }
  case 'Hyper Devolution Spray':{
   const u=slot(p,pick('devolve'));if(!u.under.length)throw Error('Pokémon is no longer evolved');
   p.hand.push(u.id);u.id=u.under.shift();u.playedTurn=g.round;
   STATUS.clearConditions(u);h.clearBenchEffects(u);break;
  }
  case 'Double Gust':{
   for(const [owner,key] of [[p,'ownSwitch'],[f,'enemySwitch']])if(d[key]?.length){
    const idx=pick(key);const old=owner.active;owner.active=owner.bench.splice(idx,1,old)[0];
    STATUS.clearConditions(old);h.clearBenchEffects(old);
   }break;
  }
  case 'Professor Elm':p.deck=h.shuffle(g,[...p.deck,...p.hand]);p.hand=[];h.draw(g,plan.side,7);p.trainerLockedUntil=g.turnSerial+1;break;
  case 'Moo-Moo Milk':{const u=slot(p,pick('healTarget'));let heads=0;for(let i=0;i<2;i++)heads+=h.flip(g)?1:0;u.damage=Math.max(0,u.damage-heads*20);break;}
  case 'Pokémon March':{
   for(const actor of [1-plan.side,plan.side]){
    const owner=g.players[actor],key=`march${actor}`;
    if(chosen(d,key)&&d[key].length){owner.bench.push(h.unit(take(owner.deck,picks(key))[0],g.round));}
    owner.deck=h.shuffle(g,owner.deck);
   }break;
  }
  case 'Super Rod':if(d.rodCard?.length)p.hand.push(...extract(p,'rodCard'));break;
  case 'Berry':case 'Counterattack Claws':case 'Focus Band':case 'EXP.ALL':case 'Gold Berry':case 'Miracle Berry':case 'Balloon Berry':case 'Magnifier':{
   const u=slot(p,pick('target'));if(u.attachedTrainers.some(t=>['Berry','Counterattack Claws','Focus Band','EXP.ALL','Gold Berry','Miracle Berry','Balloon Berry','Magnifier'].includes(get(t.id).name)))throw Error('Pokémon already has a Tool');
   u.attachedTrainers.push({id:plan.cardId});p.discard.pop();break;
  }
  case 'Mail from Bill':if(p.hand.length<4)h.draw(g,plan.side,4-p.hand.length);break;
  case 'Heal Powder':if(h.flip(g)){if(p.active){STATUS.clearConditions(p.active);p.active.damage=Math.max(0,p.active.damage-20);}}break;
  case 'Pokémon Breeder Fields':{
   // All decisions refer to indices in the *same original deck*. Remove
   // simultaneously, otherwise the second search may grab the wrong card.
   const indices=[];
   for(let i=0;i<d.heads.length;i++)if(d.heads[i]&&d['evo'+i]?.length){
    const idx=nums(d,'evo'+i)[0];
    if(!Number.isInteger(idx)||!p.deck[idx])throw Error('Invalid Breeder Fields search');
    const source=slot(p,nums(d,'targets')[i]);
    if(!source||!canEvolve(get(p.deck[idx]),get(source.id)))throw Error('Breeder Fields evolution no longer matches');
    indices.push(idx);
   }
   if(new Set(indices).size!==indices.length)throw Error('Breeder Fields cannot search the same card twice');
   if(indices.length)p.hand.push(...take(p.deck,indices));
   p.deck=h.shuffle(g,p.deck);break;
  }
  case 'Energy Stadium':case "Rocket's Hideout":case 'Ecogym':case 'Sprout Tower':case 'Healing Field':case 'Broken Ground Gym':case 'Radio Tower':case 'Lucky Stadium':break;
  case 'Bill':h.draw(g,plan.side,2);break;
  case 'Professor Oak':p.discard.push(...p.hand);p.hand=[];h.draw(g,plan.side,7);break;
  case 'Impostor Professor Oak':f.deck=h.shuffle(g,[...f.deck,...f.hand]);f.hand=[];h.draw(g,1-plan.side,7);break;
  case "Imposter Oak's Revenge":f.deck=h.shuffle(g,[...f.deck,...f.hand]);f.hand=[];h.draw(g,1-plan.side,4);break;
  case 'Lass':for(const owner of [p,f]){const cards=take(owner.hand,zone(owner.hand,c=>c.supertype==='Trainer').map(x=>x.i));owner.deck=h.shuffle(g,[...owner.deck,...cards]);}break;
  case 'Maintenance':p.deck=h.shuffle(g,p.deck);h.draw(g,plan.side);break;
  case 'Computer Search':case 'Energy Search':case "The Boss's Way":case 'Poké Ball':
   if(chosen(d,'find')&&d.find.length){const [id]=take(p.deck,[pick('find')]);p.hand.push(id);}p.deck=h.shuffle(g,p.deck);break;
  case 'Pokémon Trader':{const i=pick('trade'),handOffset=i>plan.handIndex?i-1:i;const [offered]=take(p.hand,[handOffset]);const [found]=take(p.deck,[pick('find')]);p.hand.push(found);p.deck=h.shuffle(g,[...p.deck,offered]);break;}
  case 'Item Finder':p.hand.push(...extract(p,'recover'));break;
  case 'Energy Retrieval':p.hand.push(...extract(p,'recover'));break;
  case 'Nightly Garbage Run':p.deck=h.shuffle(g,[...p.deck,...extract(p,'recover')]);break;
  case 'Recycle':if(chosen(d,'recover')&&d.recover.length)p.deck.push(...extract(p,'recover'));break;
  case 'Pokédex':if(chosen(d,'arrange')){const count=d.arrange.length,top=p.deck.splice(-count).reverse();for(const i of picks('arrange').reverse())p.deck.push(top[i]);}break;
  case 'Gambler':p.deck=h.shuffle(g,[...p.deck,...p.hand]);p.hand=[];h.draw(g,plan.side,h.flip(g)?8:1);break;
  case 'Digger':{
   let owner=plan.side;
   for(let i=0;i<2048;i++){if(!h.flip(g)) {pFor(g,owner).active.damage+=10;h.knockOuts(g,'checkup');break;}owner=1-owner;}
   break;
  }
  case 'Full Heal':STATUS.clearConditions(p.active);break;
  case 'Potion':case 'Super Potion':{const u=slot(p,pick('target'));u.damage=Math.max(0,u.damage-(name==='Potion'?20:40));if(name==='Super Potion')p.discard.push(...take(u.energies,[pick('ownEnergy')]));break;}
  case 'Pokémon Center':for(const u of all(p))if(u.damage){u.damage=0;p.discard.push(...u.energies);u.energies=[];}break;
  case 'Switch':case 'Gust of Wind':{if(!d.target?.length)break;const owner=name==='Switch'?p:f,idx=pick('target');const old=owner.active;owner.active=owner.bench.splice(idx,1,old)[0];STATUS.clearConditions(old);h.clearBenchEffects(old);break;}
  case 'Energy Removal':case 'Super Energy Removal':{
   const u=slot(f,pick('target'));
   if(u.attachedTrainers.some(t=>get(t.id).name==="Brock's Protection"))throw Error('Brock’s Protection prevents opposing Energy Removal');
   f.discard.push(...take(u.energies,picks('enemyEnergy')));
   if(name==='Super Energy Removal'){const own=slot(p,pick('source'));p.discard.push(...take(own.energies,[pick('ownEnergy')]));}
   break;
  }
  case 'Defender':{const u=slot(p,pick('target'));u.attachedTrainers.push({id:plan.cardId,expires:g.turnSerial+2});p.discard.pop();break;}
  case 'PlusPower':p.active.attachedTrainers.push({id:plan.cardId,expires:g.turnSerial+1});p.discard.pop();break;
  case 'Goop Gas Attack':g.powerBlankUntil=g.turnSerial+2;break;
  case 'Here Comes Team Rocket!':g.prizesFaceUp=true;break;
  case 'No Removal Gym':case "The Rocket's Training Gym":case 'Resistance Gym':case "Rocket's Minefield Gym":break;
  case 'Transparent Walls':p.transparentWallsUntil=g.turnSerial+2;break;
  case 'Pewter City Gym':case 'Cerulean City Gym':case 'Vermilion City Gym':case 'Celadon City Gym':
  case 'Fuchsia City Gym':case 'Saffron City Gym':case 'Cinnabar City Gym':case 'Viridian City Gym':break;
  case 'Rocket\'s Sneak Attack':if(d.oppHand.length){const [id]=take(f.hand,[pick('oppHand')]);f.deck=h.shuffle(g,[...f.deck,id]);}break;
  case 'Pokémon Flute':f.bench.push(h.unit(extract(f,'recover')[0],g.round));break;
  case 'Revive':{const u=h.unit(extract(p,'recover')[0],g.round);u.damage=Math.floor(Number(get(u.id).hp)/20)*10;p.bench.push(u);break;}
  case 'Mr. Fuji':{const [u]=p.bench.splice(pick('target'),1);p.deck=h.shuffle(g,[...p.deck,u.id,...u.under,...u.energies,...u.attachedTrainers.map(x=>x.id)]);break;}
  case 'Scoop Up':{const idx=pick('target'),u=idx===-1?p.active:p.bench[idx];if(idx===-1){p.active=null;}else p.bench.splice(idx,1);
   p.hand.push(u.under.length?u.under[u.under.length-1]:u.id);p.discard.push(...[u.id,...u.under.slice(0,-1),...u.energies,...u.attachedTrainers.map(x=>x.id)].filter(x=>x!== (u.under.length?u.under[u.under.length-1]:u.id)));
   if(idx===-1){if(!p.bench.length){g.over=true;g.winner=1-plan.side;}else {g.pendingPromotions=[plan.side];g.promotionAfter='direct';h.finishPromotions(g);}}break;
  }
  case 'Devolution Spray':{const u=slot(p,pick('target'));const stage=pick('stage');const cards=[u.id,...u.under];const remaining=cards.filter(id=>get(id).subtypes?.includes('Basic')||(stage===2&&get(id).subtypes?.includes('Stage 1')));
   if(!remaining.length)throw Error('Devolution without a Basic Pokémon');u.id=remaining[0];u.under=remaining.slice(1);p.discard.push(...cards.filter(id=>!remaining.includes(id)));STATUS.clearConditions(u);h.clearBenchEffects(u);break;}
  case 'Pokémon Breeder':{
   const handIdx=pick('evolution')>plan.handIndex?pick('evolution')-1:pick('evolution'),[id]=p.hand.splice(handIdx,1),u=slot(p,pick('target'));
   u.under.unshift(u.id);u.id=id;u.playedTurn=g.round;STATUS.clearConditions(u);h.clearBenchEffects(u);h.onPlay?.(g,plan.side,pick('target'));break;
  }
  case 'Challenge!':{
   if(pick('accept')===0){h.draw(g,plan.side,2);break;}
   for(const ownerIndex of [1-plan.side,plan.side]){const owner=g.players[ownerIndex],k='basics'+ownerIndex;if(!chosen(d,k))continue;for(const id of take(owner.deck,picks(k)).map(id=>h.unit(id,g.round)))owner.bench.push(id);owner.deck=h.shuffle(g,owner.deck);}
   break;
  }
  case 'Sleep!':if(h.flip(g))h.applyCondition(g,f.active,'Asleep');break;
  default:throw Error('Unported Trainer: '+name);
 }
 h.log(g,`${p.name} played ${name}.`);
 if(g.tickleEndsTurn){delete g.tickleEndsTurn;h.finishTurn(g);}
}
const pFor=(g,side)=>g.players[side];
function start(g,side,handIndex,h){const p=g.players[side],c=get(p.hand[handIndex]);if(c.supertype!=='Trainer')throw Error('Not a Trainer');if(!SUPPORTED.has(c.name))throw Error('Unported Trainer '+c.name);
 if(c.name==='Mail from Bill'&&p.hand.length>=5)throw Error('Mail from Bill requires at most 4 cards in hand (including itself)');
 const plan={side,handIndex,cardId:c.id,data:{}};return prompt(g,plan,h);
}
function startProxy(g,side,cardId,h){
 if(g.players[side].trainerLockedUntil>g.turnSerial)throw Error('Redirected Trainer use blocked this turn');
 const c=get(cardId);if(c.supertype!=='Trainer'||c.subtypes?.includes('Stadium')||ATTACH_ONLY.has(c.name)||!SUPPORTED.has(c.name))throw Error('Unsupported redirected Trainer');
 return prompt(g,{side,handIndex:g.players[side].hand.length,cardId,proxy:true,data:{}},h);
}
function answer(g,plan,response,h){
 if(!plan||!plan.await)throw Error('Trainer choice is missing');
 const data={...plan.data,[plan.await]:response.decline?[]:[...response.selected]};
 return prompt(g,{...plan,data,await:null},h);
}
const SUPPORTED=new Set(['Ecogym','Card-Flip Game','New Pokédex','Energy Amplifier',"Thought Wave Machine (Rocket's Secret Machine)",'Balloon Berry','Super Scoop Up','Magnifier','Gold Berry','Miracle Berry','Focus Band','EXP.ALL','Sprout Tower','Healing Field','Broken Ground Gym','Radio Tower','Lucky Stadium','Mary','PokéGear','Super Energy Retrieval','Time Capsule','Pokémon Personality Test',"Impostor Professor Oak's Invention",'Arcade Game','Energy Charge','Ruin Wall','Old Rod',"Team Rocket's Evil Deeds",'Energy Ark','Fossil Egg','Hyper Devolution Spray','Double Gust',"Bill's Teleporter",'Professor Elm','Moo-Moo Milk','Pokémon March','Super Rod','Bill','Professor Oak','Impostor Professor Oak',"Imposter Oak's Revenge",'Lass','Maintenance','Computer Search','Energy Search',"The Boss's Way",'Poké Ball','Pokémon Trader','Item Finder','Energy Retrieval','Nightly Garbage Run','Recycle','Pokédex','Gambler','Digger','Full Heal','Potion','Super Potion','Pokémon Center','Switch','Gust of Wind','Energy Removal','Super Energy Removal','Defender','PlusPower','Goop Gas Attack','Here Comes Team Rocket!',"Rocket's Sneak Attack",'Pokémon Flute','Revive','Mr. Fuji','Scoop Up','Devolution Spray','Pokémon Breeder','Challenge!','Sleep!',
 'Brock',"Brock's Training Method",'Misty','Lt. Surge','Secret Mission','Erika',"Erika's Perfume",'Koga','Sabrina',"Sabrina's Gaze",'Blaine',"Blaine's Gamble",'Fervor','Max Revive','Giovanni','Warp Point',
 "Blaine's Last Resort","Erika's Kindness",'Good Manners','Master Ball',"Giovanni's Last Resort","Misty's Tears","Erika's Maids","The Rocket's Trap","Rocket's Secret Experiment",
 'No Removal Gym',"The Rocket's Training Gym",'Resistance Gym',"Rocket's Minefield Gym",'Transparent Walls',
 'Misty\'s Wrath','Misty\'s Duel',"Lt. Surge's Treaty",'Minion of Team Rocket','Trash Exchange','Energy Flow',
 'Charity','Brock\'s Protection','Narrow Gym','Misty\'s Wish','Blaine\'s Quiz #2','Tickling Machine','Recall',"Sabrina's ESP","Koga's Ninja Trick","Blaine's Quiz #3",
 'Pewter City Gym','Cerulean City Gym','Vermilion City Gym','Celadon City Gym',
 'Fuchsia City Gym','Saffron City Gym','Cinnabar City Gym','Viridian City Gym',
 "Sabrina's Psychic Control",'Berry','Counterattack Claws','Energy Stadium','Chaos Gym',"Lt. Surge's Secret Plan",'Mail from Bill',"Rocket's Hideout",'Heal Powder','Pokémon Breeder Fields']);
module.exports={SUPPORTED,start,startProxy,answer};
