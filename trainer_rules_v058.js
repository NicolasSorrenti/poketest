'use strict';
// Era Trainer work is deliberately separate from the attack/Power interpreter.
// A card enters its owner's discard pile ONLY once every required choice has been
// supplied. Canceling a selection does not spend the card or any costs.
const TRAINER58 = new Set([
 'Computer Search','Item Finder','Maintenance','Energy Retrieval','Super Energy Retrieval','Pokémon Trader',
 'Energy Search','Poké Ball','The Boss\'s Way','Brock\'s Training Method','Good Manners','Master Ball','PokéGear',
 'Revive','Max Revive','Pokémon Flute','Scoop Up','Mr. Fuji','Super Scoop Up','Hyper Devolution Spray',
 'Pokémon Breeder','Devolution Spray','Super Energy Removal','Energy Removal','Super Potion',
 'Nightly Garbage Run','Super Rod','Recycle','Energy Charge','Energy Ark',
 'Bill','Professor Oak','Impostor Professor Oak','Lass','Gambler','Professor Elm','Mary','Bill\'s Teleporter',
 'Full Heal','Pokémon Center','Erika\'s Kindness','Brock','Heal Powder','Mail from Bill','Blaine\'s Last Resort',
 'Fervor','Pokédex','New Pokédex','Moo-Moo Milk','Rocket\'s Sneak Attack',
 'Team Rocket\'s Evil Deeds','Misty\'s Tears','Erika\'s Maids','Fossil Egg','Ruin Wall',
 'Here Comes Team Rocket!','Rocket\'s Secret Experiment','The Rocket\'s Trap','Sleep!',
 'Transparent Walls','Erika','Misty\'s Wrath','Blaine\'s Gamble','Arcade Game',
 'Old Rod','Energy Amplifier','Computer Error','Impostor Professor Oak\'s Invention',
 'Sabrina\'s Gaze','Trash Exchange','Digger','Misty\'s Duel','Pokémon March',
 'Recall','Thought Wave Machine (Rocket\'s Secret Machine)','Card-Flip Game','Pokémon Personality Test',
 'Blaine\'s Quiz #2','Challenge!','Time Capsule','Pokémon Breeder Fields','Tickling Machine',
 'Narrow Gym','Celadon City Gym','Fuchsia City Gym','Viridian City Gym',
 'Imposter Oak\'s Revenge','Goop Gas Attack','Giovanni\'s Last Resort','Erika\'s Perfume',
 'Energy Flow','Secret Mission','Sabrina','Koga','Misty','Blaine','Giovanni',
 'Warp Point','Double Gust','Minion of Team Rocket','Lt. Surge\'s Treaty','Misty\'s Wish',
 'Magnifier','Miracle Berry','Balloon Berry','Brock\'s Protection','Sabrina\'s ESP',
 'Counterattack Claws','EXP.ALL','Charity','Lt. Surge','Koga\'s Ninja Trick',
 'Lucky Stadium','Healing Field','Energy Stadium','Radio Tower','Saffron City Gym','Celadon City Gym','Fuchsia City Gym'
]);
// For cards that require unimplemented permanent hooks, never claim their
// Stadium text works. They are tracked as known-but-incomplete in the audit.
const TRAINER58_STADIUMS = new Set([
 'Pokémon Tower','Rocket\'s Hideout','Sprout Tower','Resistance Gym','Cerulean City Gym',
 'Pewter City Gym','No Removal Gym','The Rocket\'s Training Gym','Broken Ground Gym','Cinnabar City Gym',
 'Radio Tower','Lucky Stadium','Energy Stadium','Healing Field','Saffron City Gym','Celadon City Gym','Fuchsia City Gym'
]);
const trainer58Original=Engine.prototype.trainer;
function trainer58Pokemon(c){return c?.supertype==='Pokémon'&&!isBasicEnergyCard(c)}
function trainer58FossilEvolution(c){return trainer58Pokemon(c)&&(c.evolvesFrom==='Mysterious Fossil'||(c.subtypes||[]).includes('Stage 1')&&['Kabuto','Omanyte','Aerodactyl'].includes(c.name))}
function trainer58Evolution(c){return trainer58Pokemon(c) && (c.subtypes||[]).some(x=>x==='Stage 1'||x==='Stage 2')}
function trainer58Basic(c){return basic(c)||(c?.subtypes||[]).includes('Baby')&&trainer58Pokemon(c)}
function trainer58Energy(c){return energy(c) && isBasicEnergyCard(c)}
function trainer58Cards(zone,predicate=()=>true){return zone.map((id,index)=>({id,index,name:lookup.get(id)?.name||id,card:lookup.get(id)})).filter(x=>predicate(x.card,x))}
function trainer58Bench(p){return [{index:-1,id:p.active?.id,name:lookup.get(p.active?.id)?.name||'Active',unit:p.active},...p.bench.map((u,index)=>({index,id:u.id,name:lookup.get(u.id)?.name||'Pokémon',unit:u}))].filter(x=>x.unit)}
function trainer58RemoveIndices(zone,indices){return indices.slice().sort((a,b)=>b-a).map(index=>zone.splice(index,1)[0]).reverse()}
function trainer58CardFromDiscard(c){return trainer58Basic(c)||trainer58Evolution(c)||trainer58Energy(c)}
function trainer58Restack(p,ids){p.deck=shuffle([...p.deck,...ids])}
function trainer58ClearConditions(u){u.status=null;u.poison=false;u.poisonDamage=10;u.burn=false}
Engine.prototype.trainer58=function(handIndex, provided){
 const game=this,p=this.me,f=this.foe,c=lookup.get(p.hand[handIndex]),name=c?.name;
 if(!c||!TRAINER58.has(name)||this.phase!=='game'||this.over)return false;
 if(p.trainerLockUntil>=this.round&&p.trainerLockUntil>0||this.continuousPower('Hay Fever'))return false;
 const tower57=lookup.get(this.stadium?.id)?.name==='Pokémon Tower'?this.players.map(player=>player.discard.slice()):null;
 const picks=Array.isArray(provided)?provided.slice():[],path=[];
 if(!game._trainer58FlipCache)game._trainer58FlipCache=new Map();
 const flipCacheKey=`${game.turnSerial}:${game.turn}:${handIndex}:${c.id}`;
 if(!game._trainer58FlipCache.has(flipCacheKey))game._trainer58FlipCache.set(flipCacheKey,[]);
 const flipHistory=game._trainer58FlipCache.get(flipCacheKey);
 let flipIndex=0;
 const trainerFlip=(label)=>{if(flipIndex<flipHistory.length)return flipHistory[flipIndex++];
  const result=coin(label);flipHistory.push(result);flipIndex++;return result;
 };

 let gymAdditionalDiscard=null;
 const clear=()=>{deckSearchRequest=null;selected=null};
 const commit=(message=name)=>{
  if(gymAdditionalDiscard)p.discard.push(...trainer58RemoveIndices(p.hand,gymAdditionalDiscard));
  const idx=p.hand.indexOf(c.id);if(idx<0)return false;
  p.discard.push(p.hand.splice(idx,1)[0]);
  if(tower57)for(let side=0;side<2;side++){const player=game.players[side];for(const id of tower57[side]){const before=tower57[side].filter(x=>x===id).length,now=player.discard.filter(x=>x===id).length;if(now>=before)continue;const inHand=player.hand.indexOf(id);if(inHand>=0){player.discard.push(player.hand.splice(inHand,1)[0]);game.log('Pokémon Tower prevented a card from returning from discard to hand.')}}}
  game._trainer58FlipCache.delete(flipCacheKey);clear();game.log(`${p.name} played ${message}.`);game.resolveKO();render();return true;
 };
 // Stage a sequence of choices. The engine revalidates every stage against
 // live card zones; callbacks apply state changes only at the final stage.
 const pick=(label,options,then,{multi=false,min=1,max=1}={})=>{
  options=options.map(o=>({...o,name:o.name||String(o.index)}));
  if(options.length<min)return false;
  const complete=(val)=>{
   const vals=multi?val:[val];
   if(!Array.isArray(vals)||vals.length<min||vals.length>max||new Set(vals).size!==vals.length||vals.some(v=>!options.some(x=>x.index===v)))return false;
   return then(multi?vals:val);
  };
  if(path.length<picks.length){const next=picks[path.length];path.push(next);return complete(next)}
  // Solo mode: decisions explicitly assigned to the opponent belong to the
  // computer, not to the human controlling this Trainer. Cache the choice
  // between subsequent selection steps to avoid changing it on a retry.
  if(game.turn===0&&/^(Opponent (?:chooses|guesses|accepts|may|permits|selects)|Choose up to one opponent Basic Pok[eé]mon|Opponent chooses)/i.test(label)){
   if(!game._trainer58CpuChoices)game._trainer58CpuChoices=new Map();
   const key=`${game.turnSerial}:${c.id}:${handIndex}:${path.length}:${label}`;
   let ai=game._trainer58CpuChoices.get(key);
   const valid=v=>options.some(o=>o.index===v);
   if(ai===undefined||(multi?!Array.isArray(ai)||ai.some(v=>!valid(v)):!valid(ai))){
    const available=options.slice();
    if(multi){const n=Math.min(Math.max(min,0),available.length);ai=available.slice(0,n).map(o=>o.index)}
    else ai=available[Math.floor(Math.random()*available.length)]?.index;
    game._trainer58CpuChoices.set(key,ai);
   }
   path.push(ai);return complete(ai);
  }
  if(Array.isArray(provided))return false;
  const prefix=path.slice();
  deckSearchRequest={label:`${name}: ${label}`,options:options.map(o=>({index:o.index,id:o.id,name:o.name})),multi,min,max,selected:[],execute:value=>game.trainer58(p.hand.indexOf(c.id),prefix.concat([value]))};
  render();return null;
 };
 const choose=(label,zone,predicate,next,opts)=>pick(label,trainer58Cards(zone,predicate),next,opts);
 const chooseMany=(label,zone,predicate,min,max,next)=>choose(label,zone,predicate,next,{multi:true,min,max});
 const deckPick=(label,pred,next)=>choose(label,p.deck,pred,j=>{const ok=next(j);if(ok!==false)p.deck=shuffle(p.deck);return ok});
 const selectPokemon=(label,player,predicate,next,benchOnly=false)=>pick(label,(benchOnly?trainer58Bench(player).filter(x=>x.index>=0):trainer58Bench(player)).filter(x=>!predicate||predicate(x.unit,x)).map(x=>({index:x.index,name:(x.index===-1?'Active: ':'Bench: ')+x.name,id:x.id})),next);
 const returnUnit=(player,u,where='hand',all=false)=>{
  const cards=[u.id,...(u.under||[]),...u.energies,...(u.attachedTrainers||[]).map(x=>x.id)];
  if(where==='deck')player.deck=shuffle([...player.deck,...cards]);
  else if(all)player.hand.push(...cards);
  else {const baseId=(u.under&&u.under.length)?u.under[u.under.length-1]:u.id;player.hand.push(baseId);player.discard.push(...cards.filter((id,i)=>i!==cards.lastIndexOf(baseId)));}
  if(player.active===u)player.active=player.bench.shift()||null;else player.bench.splice(player.bench.indexOf(u),1);
 };
 const resolveTrainerEffect=()=>{switch(name){
  case 'Bill': game.draw(p,2);return commit();
  case 'Professor Oak': p.discard.push(...p.hand.filter((_,j)=>j!==handIndex));p.hand=[c.id];game.draw(p,7);return commit();
  case 'Professor Elm': p.deck=shuffle([...p.deck,...p.hand.filter((_,j)=>j!==handIndex)]);p.hand=[c.id];game.draw(p,7);p.trainerLockUntil=game.round;return commit();
  case 'Mary':{
   const handWithout=p.hand.filter((_,j)=>j!==handIndex);
   const drawn=p.deck.slice(Math.max(0,p.deck.length-2)).reverse();
   const virtual=[...handWithout,...drawn];
   if(virtual.length<2)return false;
   return pick('Choose exactly two cards from your hand after drawing two',virtual.map((id,index)=>({index,id,name:(index>=handWithout.length?'New: ':'Hand: ')+(lookup.get(id)?.name||id)})),indices=>{
    // The two most recent deck cards are precisely the cards just revealed.
    p.deck.splice(Math.max(0,p.deck.length-2));
    const pool=virtual.slice(),returned=trainer58RemoveIndices(pool,indices);
    p.deck=shuffle([...p.deck,...returned]);p.hand=[c.id,...pool];
    return commit();
   },{multi:true,min:2,max:2});
  }
  case 'Impostor Professor Oak': f.deck=shuffle([...f.deck,...f.hand]);f.hand=[];game.draw(f,7);return commit();
  case 'Sabrina\'s Gaze':{
   p.discard.push(p.hand.splice(handIndex,1)[0]);
   for(const side of [p,f]){const count=side.hand.length;side.deck=shuffle([...side.deck,...side.hand]);side.hand=[];game.draw(side,count)}
   clear();game.log(`${p.name} played Sabrina's Gaze.`);render();return true;
  }
  case 'Lass':{
   for(const side of [p,f]){
    const moved=side.hand.filter((id,j)=>trainer(lookup.get(id))&&(side!==p||j!==handIndex));
    side.hand=side.hand.filter((id,j)=>!trainer(lookup.get(id))||(side===p&&j===handIndex));
    side.deck=shuffle([...side.deck,...moved]);
   }
   return commit();
  }
  case 'Gambler':p.deck=shuffle([...p.deck,...p.hand.filter((_,j)=>j!==handIndex)]);p.hand=[c.id];game.draw(p,trainerFlip('Gambler')?8:1);return commit();
  case 'Full Heal':if(!p.active||!(p.active.status||p.active.poison||p.active.burn))return false;trainer58ClearConditions(p.active);return commit();
  case 'Pokémon Center':for(const u of [p.active,...p.bench].filter(x=>x?.damage)){u.damage=0;p.discard.push(...u.energies.splice(0));}return commit();
  case 'Brock':for(const u of [p.active,...p.bench].filter(Boolean))u.damage=Math.max(0,u.damage-10);return commit();
  case 'Erika\'s Kindness':for(const s of [p,f])for(const u of [s.active,...s.bench].filter(Boolean))u.damage=Math.max(0,u.damage-20);return commit();
  case 'Heal Powder':if(trainerFlip('Heal Powder')&&p.active){trainer58ClearConditions(p.active);p.active.damage=Math.max(0,p.active.damage-20)}return commit();
  case 'Mail from Bill':if(p.hand.length>=5)return false;game.draw(p,Math.max(0,5-p.hand.length));return commit();
  case 'Blaine\'s Last Resort':if(p.hand.length!==1)return false;game.draw(p,5);return commit();
  case 'Bill\'s Teleporter':if(trainerFlip('Bill\'s Teleporter'))game.draw(p,4);return commit();
  case 'Sleep!':if(trainerFlip('Sleep!')&&f.active)f.active.status='Asleep';return commit();
  case 'Here Comes Team Rocket!':game.prizesFaceUp=true;return commit();
  case 'Rocket\'s Secret Experiment':if(!trainerFlip('Rocket\'s Secret Experiment')){p.trainerLockUntil=game.round+1;return commit()}return deckPick('Search for any card',()=>true,j=>{p.hand.push(p.deck.splice(j,1)[0]);return commit()});
  case 'Transparent Walls':p.benchShieldUntilSerial=game.turnSerial+2;return commit();
  case 'Moo-Moo Milk':return selectPokemon('Choose a Pokémon to heal',p,null,slot=>{const u=slot===-1?p.active:p.bench[slot];u.damage=Math.max(0,u.damage-20*(Number(trainerFlip('Moo-Moo Milk 1'))+Number(trainerFlip('Moo-Moo Milk 2'))));return commit()});
  case 'Fervor':{const revealed=p.deck.splice(Math.max(0,p.deck.length-3));for(const id of revealed){if(lookup.get(id)?.name==='Fire Energy')p.hand.push(id);else p.discard.push(id)}return commit()}
  case 'Energy Search':return deckPick('Choose a Basic Energy card',trainer58Energy,j=>{p.hand.push(p.deck.splice(j,1)[0]);return commit()});
  case 'The Boss\'s Way':return deckPick('Choose a Dark Evolution',x=>trainer58Evolution(x)&&x.name.startsWith('Dark '),j=>{p.hand.push(p.deck.splice(j,1)[0]);return commit()});
  case 'Brock\'s Training Method':return deckPick('Choose a Brock Pokémon',x=>trainer58Pokemon(x)&&x.name.startsWith("Brock's "),j=>{p.hand.push(p.deck.splice(j,1)[0]);return commit()});
  case 'Good Manners':if(p.hand.some((id,j)=>j!==handIndex&&basic(lookup.get(id))))return false;return deckPick('Choose a Basic Pokémon',basic,j=>{p.hand.push(p.deck.splice(j,1)[0]);return commit()});
  case 'Poké Ball':{
   if(!trainerFlip('Poké Ball'))return commit();
   const options=trainer58Cards(p.deck,trainer58Pokemon);
   if(!options.length){p.deck=shuffle(p.deck);return commit()}
   return pick('Choose a Pokémon or skip the search',[...options,{index:-1,id:null,name:'Skip search'}],j=>{
    if(j>=0)p.hand.push(p.deck.splice(j,1)[0]);p.deck=shuffle(p.deck);return commit();
   });
  }
  case 'PokéGear':{
   const opts=trainer58Cards(p.deck.slice(Math.max(0,p.deck.length-7)),trainer);
   if(!opts.length){p.deck=shuffle(p.deck);return commit()}
   return pick('Choose one Trainer among the top seven cards',opts,j=>{const tailStart=Math.max(0,p.deck.length-7);p.hand.push(p.deck.splice(tailStart+j,1)[0]);p.deck=shuffle(p.deck);return commit()},{min:0,max:1});
  }
  case 'Master Ball':{
   const begin=Math.max(0,p.deck.length-7),ids=p.deck.slice(begin);const opts=trainer58Cards(ids,trainer58Pokemon);
   if(!opts.length){p.deck=shuffle(p.deck);return commit()}
   return pick('Choose a Pokémon from the top 7',opts,j=>{p.hand.push(p.deck.splice(begin+j,1)[0]);p.deck=shuffle(p.deck);return commit()},{min:0,max:1});
  }
  case 'Energy Ark':{const successes=Number(trainerFlip('Energy Ark 1'))+Number(trainerFlip('Energy Ark 2'));if(!successes)return commit();return chooseMany('Search for up to '+successes+' Basic Energy',p.deck,trainer58Energy,0,successes,js=>{p.hand.push(...trainer58RemoveIndices(p.deck,js));p.deck=shuffle(p.deck);return commit()})}
  case 'Energy Charge':if(!trainerFlip('Energy Charge'))return commit();return chooseMany('Shuffle up to 2 Energy from discard',p.discard,energy,0,2,js=>{trainer58Restack(p,trainer58RemoveIndices(p.discard,js));return commit()});
  case 'Recycle':if(!trainerFlip('Recycle')||!p.discard.length)return commit();return choose('Choose a card from discard to put on deck',p.discard,()=>true,j=>{p.deck.push(p.discard.splice(j,1)[0]);return commit()});
  case 'Super Rod':{
   const want=trainerFlip('Super Rod')?trainer58Evolution:basic;
   if(!p.discard.some(id=>want(lookup.get(id))))return commit();
   return choose('Choose a Pokémon from discard',p.discard,want,j=>{p.hand.push(p.discard.splice(j,1)[0]);return commit()});
  }
  case 'Nightly Garbage Run':return chooseMany('Shuffle up to 3 Pokémon or basic Energy into deck',p.discard,trainer58CardFromDiscard,0,3,js=>{trainer58Restack(p,trainer58RemoveIndices(p.discard,js));return commit()});
  case 'Pokémon Flute':if(f.bench.length>=5)return false;return choose('Choose an opposing Basic Pokémon from discard',f.discard,basic,j=>{f.bench.push(unit(f.discard.splice(j,1)[0]));return commit()});
  case 'Revive':if(p.bench.length>=5)return false;return choose('Choose a Basic Pokémon to revive',p.discard,basic,j=>{let u=unit(p.discard.splice(j,1)[0]);u.damage=Math.floor(Number(game.card(u)?.hp||0)/20)*10;u.playedTurn=game.round;p.bench.push(u);return commit()});
  case 'Max Revive':if(p.bench.length>=5)return false;return chooseMany('Discard exactly 2 Energy cards from your hand',p.hand,(x,z)=>z.index!==handIndex&&energy(x),2,2,discard=>choose('Choose Basic Pokémon from discard',p.discard,basic,j=>{p.discard.push(...trainer58RemoveIndices(p.hand,discard));const u=unit(p.discard.splice(j,1)[0]);u.playedTurn=game.round;p.bench.push(u);return commit()}));
  case 'Computer Search':return chooseMany('Discard 2 other hand cards',p.hand,(x,z)=>z.index!==handIndex,2,2,cost=>deckPick('Choose any card in your deck',()=>true,j=>{const id=p.deck[j];p.discard.push(...trainer58RemoveIndices(p.hand,cost));p.hand.push(p.deck.splice(p.deck.indexOf(id),1)[0]);return commit()}));
  case 'Item Finder':return chooseMany('Discard 2 other hand cards',p.hand,(x,z)=>z.index!==handIndex,2,2,cost=>choose('Recover a Trainer from discard',p.discard,trainer,j=>{const recovered=p.discard[j];p.discard.push(...trainer58RemoveIndices(p.hand,cost));p.hand.push(p.discard.splice(p.discard.indexOf(recovered),1)[0]);return commit()}));
  case 'Maintenance':return chooseMany('Shuffle two other hand cards into your deck',p.hand,(x,z)=>z.index!==handIndex,2,2,cost=>{trainer58Restack(p,trainer58RemoveIndices(p.hand,cost));game.draw(p);return commit()});
  case 'Energy Retrieval':return choose('Discard one other card from your hand',p.hand,(x,z)=>z.index!==handIndex,cost=>chooseMany('Recover up to 2 Basic Energy',p.discard,trainer58Energy,0,2,js=>{p.discard.push(p.hand.splice(cost,1)[0]);p.hand.push(...trainer58RemoveIndices(p.discard,js));return commit()}));
  case 'Super Energy Retrieval':return chooseMany('Discard two other hand cards',p.hand,(x,z)=>z.index!==handIndex,2,2,cost=>{
   const avail=trainer58Cards(p.discard,trainer58Energy);if(!avail.length)return false;
   return chooseMany('Recover up to four Basic Energy',p.discard,trainer58Energy,0,Math.min(4,avail.length),js=>{p.discard.push(...trainer58RemoveIndices(p.hand,cost));p.hand.push(...trainer58RemoveIndices(p.discard,js));return commit()});
  });
  case 'Pokémon Trader':return choose('Choose your Pokémon to trade',p.hand,(x,z)=>z.index!==handIndex&&trainer58Pokemon(x),cost=>deckPick('Choose Pokémon from deck',trainer58Pokemon,j=>{const desired=p.deck[j];trainer58Restack(p,trainer58RemoveIndices(p.hand,[cost]));p.hand.push(p.deck.splice(p.deck.indexOf(desired),1)[0]);return commit()}));
  case 'Erika\'s Maids':return chooseMany('Shuffle 2 hand cards into deck',p.hand,(x,z)=>z.index!==handIndex,2,2,cost=>chooseMany('Choose up to two Erika Pokémon',p.deck,x=>trainer58Pokemon(x)&&x.name.startsWith("Erika's "),0,2,js=>{trainer58Restack(p,trainer58RemoveIndices(p.hand,cost));p.hand.push(...trainer58RemoveIndices(p.deck,js));p.deck=shuffle(p.deck);return commit()}));
  case 'Misty\'s Tears':return choose('Discard one other card',p.hand,(x,z)=>z.index!==handIndex,cost=>chooseMany('Choose up to two Water Energy',p.deck,x=>x?.name==='Water Energy',0,2,js=>{p.discard.push(p.hand.splice(cost,1)[0]);p.hand.push(...trainer58RemoveIndices(p.deck,js));p.deck=shuffle(p.deck);return commit()}));
  case 'Super Energy Removal':return selectPokemon('Choose friendly Pokémon to discard one Energy from',p,u=>u.energies.length>0,from=>{
   const src=from===-1?p.active:p.bench[from];return pick('Choose attached Energy to discard as cost',trainer58Cards(src.energies),cost=>selectPokemon('Choose opposing Pokémon to remove Energy from',f,u=>u.energies.length>0&&!(u.attachedTrainers||[]).some(x=>lookup.get(x.id)?.name==="Brock's Protection"),to=>{
    const dest=to===-1?f.active:f.bench[to];return pick('Choose up to two opponent Energy cards to discard',trainer58Cards(dest.energies),choices=>{
     p.discard.push(src.energies.splice(cost,1)[0]);for(const id of trainer58RemoveIndices(dest.energies,choices)){if(lookup.get(game.stadium?.id)?.name==='Ecogym'&&energyType(id)!=='Colorless'&&lookup.get(id)?.name!=='Double Colorless Energy')f.hand.push(id);else f.discard.push(id)}return commit();
    },{multi:true,min:1,max:Math.min(2,dest.energies.length)});
   }));
  });
  case 'Energy Removal':return selectPokemon('Choose opposing Pokémon',f,u=>u.energies.length>0&&!(u.attachedTrainers||[]).some(x=>lookup.get(x.id)?.name==="Brock's Protection"),slot=>{
   const u=slot===-1?f.active:f.bench[slot];return pick('Choose attached Energy to discard',trainer58Cards(u.energies),j=>{{const id=u.energies.splice(j,1)[0];if(lookup.get(game.stadium?.id)?.name==='Ecogym'&&energyType(id)!=='Colorless'&&lookup.get(id)?.name!=='Double Colorless Energy')f.hand.push(id);else f.discard.push(id)}return commit()});
  });
  case 'Super Potion':return selectPokemon('Choose Pokémon to heal',p,u=>u.damage>0&&u.energies.length>0,slot=>{
   const u=slot===-1?p.active:p.bench[slot];return pick('Choose attached Energy to discard',trainer58Cards(u.energies),j=>{p.discard.push(u.energies.splice(j,1)[0]);u.damage=Math.max(0,u.damage-40);return commit()});
  });
  case 'Scoop Up':return selectPokemon('Return a Pokémon Basic card to your hand',p,null,slot=>{returnUnit(p,slot===-1?p.active:p.bench[slot]);return commit()});
  case 'Mr. Fuji':return selectPokemon('Shuffle a Benched Pokémon and all attachments into your deck',p,null,slot=>{returnUnit(p,p.bench[slot],'deck');return commit()},true);
  case 'Super Scoop Up':if(!trainerFlip('Super Scoop Up'))return commit();return selectPokemon('Choose Pokémon and attachments to return to hand',p,null,slot=>{returnUnit(p,slot===-1?p.active:p.bench[slot],'hand',true);return commit()});
  case 'Hyper Devolution Spray':return selectPokemon('Choose evolved Pokémon to devolve',p,u=>(u.under||[]).length>0,slot=>{
   const u=slot===-1?p.active:p.bench[slot],top=u.id;u.id=u.under.shift();p.hand.push(top);u.playedTurn=game.round;trainer58ClearConditions(u);return commit();
  });
  case 'Devolution Spray':return selectPokemon('Choose evolved Pokémon',p,u=>(u.under||[]).length>0,slot=>{
   const u=slot===-1?p.active:p.bench[slot];return pick('Choose evolution stage to remove through',Array.from({length:u.under.length},(_,index)=>({index,name:lookup.get(index===0?u.id:u.under[index-1])?.name||'Evolution'})),step=>{
    p.discard.push(u.id,...u.under.splice(0,step));u.id=u.under.shift();trainer58ClearConditions(u);u.playedTurn=game.round;return commit();
   });
  });
  case 'Pokémon Breeder':return choose('Choose Stage 2 from hand',p.hand,(x,z)=>z.index!==handIndex&&(x?.subtypes||[]).includes('Stage 2'),handCard=>{
   const evo=lookup.get(p.hand[handCard]);return selectPokemon('Choose matching Basic Pokémon',p,u=>basic(game.card(u))&&u.playedTurn<game.round&&!p.turnPlays.includes(u)&&compatible(evo,game.card(u))===false&&String(evo.evolvesFrom||'').length>0,slot=>{
    // Stage 2 matching is through the middle stage printed on the card.
    const intermediate=[...lookup.values()].some(mid=>mid.name===evo.evolvesFrom&&compatible(mid,game.card(slot===-1?p.active:p.bench[slot])));
    if(!intermediate||game.continuousPower('Prehistoric Power'))return false;
    const u=slot===-1?p.active:p.bench[slot],from=game.card(u);u.under=[from.id,...(u.under||[])];u.id=p.hand.splice(handCard,1)[0];u.playedTurn=game.round;trainer58ClearConditions(u);game.onPlayEvolution(u,evo);return commit();
   });
  });
  case 'Rocket\'s Sneak Attack':return choose('Choose an opposing Trainer from hand',f.hand,trainer,j=>{trainer58Restack(f,trainer58RemoveIndices(f.hand,[j]));return commit()});
  case 'Team Rocket\'s Evil Deeds':return choose('Choose an opposing hand card',f.hand,()=>true,j=>pick('Opponent chooses how many cards to draw',Array.from({length:3},(_,index)=>({index,name:index+' cards'})),draw=>{
   trainer58Restack(f,trainer58RemoveIndices(f.hand,[j]));game.draw(f,draw);return commit();
  }));
  case 'The Rocket\'s Trap':if(!trainerFlip('The Rocket\'s Trap'))return commit();{
   const shuffled=shuffle(f.hand).slice(0,3);for(const id of shuffled){const j=f.hand.indexOf(id);if(j>=0)f.deck.push(f.hand.splice(j,1)[0])}f.deck=shuffle(f.deck);return commit();
  }
  case 'Fossil Egg':if(p.bench.length>=5)return false;if(!trainerFlip('Fossil Egg'))return commit();return pick('Choose fossil evolution from hand or deck',[...trainer58Cards(p.hand,trainer58FossilEvolution).filter(x=>x.index!==handIndex).map(x=>({...x,index:'h'+x.index,name:'Hand: '+x.name})),...trainer58Cards(p.deck,trainer58FossilEvolution).map(x=>({...x,index:'d'+x.index,name:'Deck: '+x.name}))],key=>{
   const from=key[0]==='h'?p.hand:p.deck,id=from.splice(+key.slice(1),1)[0];const fossil=unit(id);fossil.fossilAsBasic=true;p.bench.push(fossil);p.bench[p.bench.length-1].playedTurn=game.round;p.deck=shuffle(p.deck);return commit();
  });
  case 'Ruin Wall':if(p.bench.length>=5)return false;return deckPick('Choose Unown to Bench',x=>trainer58Pokemon(x)&&x.name.startsWith('Unown'),j=>{let u=unit(p.deck.splice(j,1)[0]);u.playedTurn=game.round;p.bench.push(u);return commit()});
  case 'Pokédex':case 'New Pokédex':{
   // Do not shuffle or reorder the deck before the human confirms the entire
   // selection. A cancelled New Pokédex previously consumed its shuffle.
   if(!game._trainer60PreviewDecks)game._trainer60PreviewDecks=new Map();
   const key=`${game.turnSerial}:${c.id}:${handIndex}`;
   const signature=p.deck.join('|');
   let stage=game._trainer60PreviewDecks.get(key);
   if(!stage||stage.signature!==signature){stage={signature,preview:name==='New Pokédex'?shuffle(p.deck.slice()):p.deck.slice()};game._trainer60PreviewDecks.set(key,stage)}
   const preview=stage.preview;
   const amount=Math.min(5,preview.length);
   if(amount<2){if(name==='New Pokédex')p.deck=preview.slice();game._trainer60PreviewDecks.delete(key);return commit()}
   const top=preview.slice(-amount).reverse();
   const pickNext=order=>{
    if(order.length===amount){p.deck=[...preview.slice(0,-amount),...order.map(j=>top[j]).reverse()];game._trainer60PreviewDecks.delete(key);return commit()}
    return pick('Choose next card to put on top',top.map((id,index)=>({id,index,name:lookup.get(id)?.name||id})).filter(x=>!order.includes(x.index)),j=>pickNext([...order,j]));
   };
   return pickNext([]);
  }
  case 'Erika':return pick('How many cards would you like to draw (0–3)?',Array.from({length:4},(_,index)=>({index,name: String(index)+' cards'})),count=>{
   return pick('Opponent chooses how many cards to draw (0–3)',Array.from({length:4},(_,index)=>({index,name:String(index)+' cards'})),enemyCount=>{game.draw(p,count);game.draw(f,enemyCount);return commit()});
  });
  case 'Misty\'s Wrath':{
   const start=Math.max(0,p.deck.length-7),top=p.deck.slice(start);
   return pick('Choose two of the top seven cards',top.map((id,index)=>({id,index,name:lookup.get(id)?.name||id})),js=>{
    const revealed=p.deck.splice(start),kept=trainer58RemoveIndices(revealed,js);
    p.hand.push(...kept);p.discard.push(...revealed);return commit();
   },{multi:true,min:Math.min(2,top.length),max:Math.min(2,top.length)});
  }
  case 'Blaine\'s Gamble':return chooseMany('Choose any hand cards to discard',p.hand,(x,z)=>z.index!==handIndex,0,p.hand.length-1,js=>{
   p.discard.push(...trainer58RemoveIndices(p.hand,js));if(trainerFlip('Blaine\'s Gamble'))game.draw(p,js.length*2);return commit();
  });
  case 'Impostor Professor Oak\'s Invention':return pick('Replace opponent Prize cards?', [{index:0,name:'No — leave their Prizes alone'},{index:1,name:'Yes — replace their Prizes'}],yes=>{
   if(yes){const n=f.prizes.length;f.deck=shuffle([...f.deck,...f.prizes]);f.prizes=f.deck.splice(Math.max(0,f.deck.length-n));}
   return commit();
  });
  case 'Computer Error':return pick('How many cards to draw (0–5)?',Array.from({length:6},(_,index)=>({index,name:String(index)+' cards'})),draw=>pick('Opponent may draw 0–5 cards',Array.from({length:6},(_,index)=>({index,name:String(index)+' cards'})),oppDraw=>{
   game.draw(p,draw);game.draw(f,oppDraw);const result=commit();if(result)game.end();return result;
  }));
  case 'Trash Exchange':{const n=p.discard.length,ids=p.discard.splice(0);p.deck=shuffle([...p.deck,...ids]);p.discard.push(...p.deck.splice(Math.max(0,p.deck.length-n)));return commit()}
  case 'Digger':{
   for(let k=0;k<80;k++){const side=k%2===0?p:f;if(!trainerFlip('Digger')){if(side.active)side.active.damage+=10;break}}
   return commit();
  }
  case 'Arcade Game':{
   p.deck=shuffle(p.deck);const top=p.deck.splice(Math.max(0,p.deck.length-3));
   const match=top.find(x=>top.filter(t=>lookup.get(t)?.name===lookup.get(x)?.name).length>=2);
   if(match){for(const id of top){if(lookup.get(id)?.name===lookup.get(match)?.name)p.hand.push(id);else p.deck.push(id)}}else p.deck.push(...top);
   p.deck=shuffle(p.deck);return commit();
  }
  case 'Old Rod':{
   const n=Number(trainerFlip('Old Rod 1'))+Number(trainerFlip('Old Rod 2'));
   const pred=n===2?trainer58Pokemon:n===0?trainer:()=>false;
   if(!p.discard.some(id=>pred(lookup.get(id))))return commit();
   return choose('Choose a card to recover from discard',p.discard,pred,j=>{p.hand.push(p.discard.splice(j,1)[0]);return commit()});
  }
  case 'Energy Amplifier':return choose('Shuffle one Energy from your hand into deck',p.hand,(x,z)=>z.index!==handIndex&&energy(x),cost=>{
   // The source Energy is kept out of the deck until all choices are resolved.
   if(!trainerFlip('Energy Amplifier')){trainer58Restack(p,trainer58RemoveIndices(p.hand,[cost]));return commit()}
   return chooseMany('Choose up to three Basic Energy from the deck',p.deck,trainer58Energy,0,3,js=>{
    p.hand.push(...trainer58RemoveIndices(p.deck,js));trainer58Restack(p,trainer58RemoveIndices(p.hand,[cost]));return commit();
   });
  });
  case 'Misty\'s Duel':{
   const winner=trainerFlip('Misty\'s Duel (coin substitute)')?p:f;
   winner.deck=shuffle([...winner.deck,...winner.hand.filter(id=>winner!==p||id!==c.id)]);
   winner.hand=winner===p?[c.id]:[];game.draw(winner,5);return commit();
  }
  case 'Pokémon March':return chooseMany('Choose up to one opponent Basic Pokémon to Bench',f.deck,basic,0,Math.min(1,5-f.bench.length),ids=>{
   return chooseMany('Choose up to one Basic Pokémon to Bench',p.deck,basic,0,Math.min(1,5-p.bench.length),ours=>{
    for(const id of trainer58RemoveIndices(f.deck,ids)){const u=unit(id);u.playedTurn=game.round;f.bench.push(u)}
    for(const id of trainer58RemoveIndices(p.deck,ours)){const u=unit(id);u.playedTurn=game.round;p.bench.push(u)}
    f.deck=shuffle(f.deck);p.deck=shuffle(p.deck);return commit();
   });
  });
  case 'Imposter Oak\'s Revenge':return choose('Discard one other hand card',p.hand,(x,z)=>z.index!==handIndex,j=>{
   p.discard.push(p.hand.splice(j,1)[0]);f.deck=shuffle([...f.deck,...f.hand]);f.hand=[];game.draw(f,4);return commit();
  });
  case 'Goop Gas Attack':game.powerSilenceUntilSerial=game.turnSerial+2;return commit();
  case 'Giovanni\'s Last Resort':return selectPokemon('Choose a Giovanni Pokémon to heal completely',p,u=>game.card(u)?.name.startsWith("Giovanni's "),slot=>{
   const u=slot===-1?p.active:p.bench[slot];u.damage=0;p.discard.push(...p.hand.filter((_,j)=>j!==handIndex));p.hand=[c.id];return commit();
  });
  case 'Erika\'s Perfume':return chooseMany('Choose opposing Basic Pokémon to place on their Bench',f.hand,basic,0,Math.min(5-f.bench.length,f.hand.filter(id=>basic(lookup.get(id))).length),js=>{
   for(const id of trainer58RemoveIndices(f.hand,js)){const u=unit(id);u.playedTurn=game.round;f.bench.push(u)}return commit();
  });
  case 'Secret Mission':return chooseMany('Opponent reveals hand. Choose any cards from yours to discard and replace',p.hand,(x,z)=>z.index!==handIndex,0,p.hand.length-1,js=>{
   p.discard.push(...trainer58RemoveIndices(p.hand,js));game.draw(p,js.length);return commit();
  });
  case 'Energy Flow':{
   const options=trainer58Bench(p).flatMap(entry=>entry.unit.energies.map((id,j)=>({index:`${entry.index}:${j}`,id,name:(entry.index===-1?'Active':'Bench '+(entry.index+1))+' — '+(lookup.get(id)?.name||'Energy')})));
   return pick('Choose any attached Energy cards to return to your hand',options,keys=>{
    const groups=new Map();for(const key of keys){const [slot,j]=key.split(':').map(Number);if(!groups.has(slot))groups.set(slot,[]);groups.get(slot).push(j)}
    for(const [slot,js] of groups){const u=slot===-1?p.active:p.bench[slot];p.hand.push(...trainer58RemoveIndices(u.energies,js))}return commit();
   },{multi:true,min:0,max:options.length});
  }
  case 'Sabrina':return selectPokemon('Choose source Sabrina Pokémon',p,u=>game.card(u)?.name.startsWith("Sabrina's ")&&u.energies.length>0,from=>{
   const src=from===-1?p.active:p.bench[from];return selectPokemon('Choose another Sabrina Pokémon',p,u=>u!==src&&game.card(u)?.name.startsWith("Sabrina's "),to=>{
    const dst=to===-1?p.active:p.bench[to];dst.energies.push(...src.energies.splice(0));return commit();
   });
  });
  case 'Koga':p.kogaPoisonSerial=game.turnSerial;return commit();
  case 'Misty':return chooseMany('Discard two other cards for Misty\'s attack bonus',p.hand,(x,z)=>z.index!==handIndex,2,2,js=>{
   p.discard.push(...trainer58RemoveIndices(p.hand,js));p.mistyBoostSerial=game.turnSerial;return commit();
  });
  case 'Blaine':if(p.energyUsed)return false;p.blaineExtraEnergySerial=game.turnSerial;p.blaineExtraEnergyRemaining=2;p.blaineEnergyTarget=null;p.energyUsed=true;return commit();
  case 'Giovanni':return selectPokemon('Choose Giovanni Pokémon eligible for immediate evolution',p,u=>game.card(u)?.name.startsWith("Giovanni's "),slot=>{
   const u=slot===-1?p.active:p.bench[slot];u.giovanniEvolutionSerial=game.turnSerial;return commit();
  });
  case 'Lt. Surge':if(p.bench.length>=5)return false;return choose('Choose Basic from hand to become your Active',p.hand,(x,z)=>z.index!==handIndex&&basic(x),j=>{
   p.bench.push(p.active);p.active=unit(p.hand.splice(j,1)[0]);p.active.playedTurn=game.round;return commit();
  });
  case 'Minion of Team Rocket':if(!trainerFlip('Minion 1')||!trainerFlip('Minion 2')){const result=commit();if(result)game.end();return result}
   return selectPokemon('Choose an opponent\'s Benched Pokémon to return to hand',f,null,slot=>{returnUnit(f,f.bench[slot],'hand',true);return commit()},true);
  case 'Warp Point':{
   // Stage the attacking player's choice before changing any battlefield zones.
   // The rival is the owner of its replacement decision (solo AI), and its
   // choice is applied FIRST once all selections are valid.
   if(!p.bench.length){
    if(f.bench.length){const old=f.active;f.active=f.bench[0];f.bench[0]=old;trainer58ClearConditions(old)}
    return commit();
   }
   return selectPokemon('Choose your replacement Active Pokémon',p,null,slot=>{
    if(!p.bench[slot])return false;
    if(f.bench.length){const outgoing=f.active;f.active=f.bench[0];f.bench[0]=outgoing;trainer58ClearConditions(outgoing)}
    const outgoing=p.active;p.active=p.bench[slot];p.bench[slot]=outgoing;trainer58ClearConditions(outgoing);
    return commit();
   },true);
  }
  case 'Double Gust':{
   // Rival owns the first choice. Defer BOTH switches until the human has
   // chosen the opposing replacement, so Cancel leaves the board unchanged.
   if(!f.bench.length){
    if(p.bench.length){const old=p.active;p.active=p.bench[0];p.bench[0]=old;trainer58ClearConditions(old)}
    return commit();
   }
   return selectPokemon('Choose opposing Pokémon to pull Active',f,null,slot=>{
    if(!f.bench[slot])return false;
    if(p.bench.length){const outgoing=p.active;p.active=p.bench[0];p.bench[0]=outgoing;trainer58ClearConditions(outgoing)}
    const outgoing=f.active;f.active=f.bench[slot];f.bench[slot]=outgoing;trainer58ClearConditions(outgoing);
    return commit();
   },true);
  }
  case 'Lt. Surge\'s Treaty':return pick('Opponent chooses: each player takes one Prize or you draw a card',[{index:0,name:'You draw 1 card'},{index:1,name:'Each player chooses a Prize'}],j=>{
   if(j===0){game.draw(p);return commit()}
   return pick('Choose your Prize card',trainer58Cards(p.prizes),mine=>pick('Opponent chooses a Prize card',trainer58Cards(f.prizes),other=>{
    p.hand.push(p.prizes.splice(mine,1)[0]);f.hand.push(f.prizes.splice(other,1)[0]);return commit();
   }));
  });
  case 'Misty\'s Wish':return pick('Look at one of your Prize cards',trainer58Cards(p.prizes),j=>pick('Opponent permits you to switch this Prize with your hand?',[{index:0,name:'No — draw a card'},{index:1,name:'Yes — swap cards'}],yes=>{
   if(!yes){game.draw(p);return commit()}
   return choose('Choose one of your other hand cards to swap with the Prize',p.hand,(x,z)=>z.index!==handIndex,k=>{
    const exchange=p.hand[k];p.hand[k]=p.prizes[j];p.prizes[j]=exchange;return commit();
   });
  }));
  case 'Miracle Berry':case 'Balloon Berry':case 'Brock\'s Protection':case 'Sabrina\'s ESP':case 'Counterattack Claws':case 'EXP.ALL':case 'Magnifier':case 'Charity':case 'Koga\'s Ninja Trick':{
   const toolLimit=new Set(['Miracle Berry','Balloon Berry','Counterattack Claws','EXP.ALL']);
   const predicate=u=>{
    if(name==="Brock's Protection"&&!game.card(u)?.name.startsWith("Brock's "))return false;
    if(name==="Sabrina's ESP"&&!game.card(u)?.name.startsWith("Sabrina's "))return false;
    if(name==="Koga's Ninja Trick"&&(u!==p.active||!game.card(u)?.name.startsWith("Koga's ")))return false;
    if(['Charity','Magnifier'].includes(name)&&u!==p.active)return false;
    return !toolLimit.has(name)||(u.attachedTrainers||[]).every(x=>!new Set(['Focus Band','Berry','Gold Berry','Miracle Berry','Balloon Berry','Counterattack Claws','EXP.ALL']).has(lookup.get(x.id)?.name));
   };
   return selectPokemon('Choose Pokémon to receive '+name,p,predicate,slot=>{
    const u=slot===-1?p.active:p.bench[slot];
    u.attachedTrainers.push({id:c.id,expireAtEndSerial:['Magnifier','Charity','Sabrina\'s ESP'].includes(name)?game.turnSerial:null});
    const idx=p.hand.indexOf(c.id);p.hand.splice(idx,1);clear();game.log(`${name} attached to ${game.card(u)?.name}.`);render();return true;
   });
  }
  case 'Recall':if(!p.active?.under?.length)return false;p.active.recallTurnSerial=game.turnSerial;return commit();
  case 'Card-Flip Game':return pick('Choose an opponent Prize',trainer58Cards(f.prizes),j=>pick('Guess its card type',[
   {index:0,name:'Energy'},{index:1,name:'Trainer'},{index:2,name:'Pokémon'}],guess=>{
    const reveal=lookup.get(f.prizes[j]),actual=energy(reveal)?0:trainer(reveal)?1:2;
    if(!f.revealedPrizes)f.revealedPrizes=new Set();f.revealedPrizes.add(j);
    game.log(`Card-Flip Game revealed ${reveal?.name||'a Prize'}.`);if(guess===actual)game.draw(p,2);return commit();
   }));
  case 'Pokémon Personality Test':return choose('Choose Evolution card from your hand',p.hand,(x,z)=>z.index!==handIndex&&trainer58Evolution(x),j=>pick('Opponent guesses the category',[{index:0,name:'Light'},{index:1,name:'Dark'},{index:2,name:'Neither'}],guess=>{
    const name=lookup.get(p.hand[j])?.name||'',category=name.startsWith('Light ')?0:name.startsWith('Dark ')?1:2;
    game.draw(guess===category?f:p,3);return commit();
  }));
  case 'Blaine\'s Quiz #2':return choose('Choose card from your hand',p.hand,(x,z)=>z.index!==handIndex,j=>pick('Opponent guesses the card type',[{index:0,name:'Energy'},{index:1,name:'Trainer'},{index:2,name:'Pokémon'}],guess=>{
    const revealed=lookup.get(p.hand[j]),actual=energy(revealed)?0:trainer(revealed)?1:2;
    game.draw(actual===guess?f:p,2);return commit();
  }));
  case 'Thought Wave Machine (Rocket\'s Secret Machine)':{
   let heads=0;while(heads<80&&trainerFlip('Thought Wave Machine'))heads++;
   const take=(count,chosen)=>{
    if(count===0||!f.active?.energies.length){
     for(const id of trainer58RemoveIndices(f.active?.energies||[],chosen))f.hand.push(id);
     const ok=commit();if(ok)game.end();return ok;
    }
    return pick('Choose opponent Active Energy to return to hand',trainer58Cards(f.active.energies).filter(x=>!chosen.includes(x.index)),j=>take(count-1,[...chosen,j]));
   };
   return take(heads,[]);
  }
  case 'Tickling Machine':{
   if(!trainerFlip('Tickling Machine')){const result=commit();if(result)game.end();return result}
   f.trainer58HeldHand=f.hand.splice(0);f.trainer58ReturnSerial=game.turnSerial+1;return commit();
  }
  case 'Time Capsule':{
   const recovers=x=>trainer58Pokemon(x)||trainer58Energy(x);
   const opponent=trainer58Cards(f.discard,recovers);
   return pick('Opponent chooses up to five eligible cards to shuffle from discard',opponent,opp=>{
    if(opp.length&&opp.length!==Math.min(5,opponent.length))return false;
    const own=trainer58Cards(p.discard,recovers);
    return pick('Choose up to five of your discard cards to shuffle into your deck',own,mine=>{
     if(mine.length&&mine.length!==Math.min(5,own.length))return false;
     trainer58Restack(f,trainer58RemoveIndices(f.discard,opp));
     trainer58Restack(p,trainer58RemoveIndices(p.discard,mine));p.trainerLockUntil=game.round;return commit();
    },{multi:true,min:0,max:Math.min(5,own.length)});
   },{multi:true,min:0,max:Math.min(5,opponent.length)});
  }
  case 'Pokémon Breeder Fields':{
   const opts=trainer58Bench(p).filter(x=>!game.card(x.unit)?.subtypes?.includes('Baby')&&p.deck.some(id=>compatible(lookup.get(id),game.card(x.unit))));
   if(!opts.length)return false;
   return pick('Choose one or two Pokémon to check for Evolution',opts,slots=>{
    const available=[];for(const slot of slots)if(trainerFlip('Pokémon Breeder Fields'))available.push(slot);
    const chooseEvolution=(step,found)=>{
     if(step===available.length){const ids=found.map(j=>p.deck[j]);p.hand.push(...ids);trainer58RemoveIndices(p.deck,found);p.deck=shuffle(p.deck);return commit()}
     const u=available[step]===-1?p.active:p.bench[available[step]];
     return pick('Choose a matching evolution from deck',trainer58Cards(p.deck,x=>compatible(x,game.card(u))).filter(x=>!found.includes(x.index)),j=>chooseEvolution(step+1,[...found,j]));
    };
    return chooseEvolution(0,[]);
   },{multi:true,min:1,max:Math.min(2,opts.length)});
  }
  case 'Challenge!':return pick('Opponent accepts the Challenge?',[{index:0,name:'Decline (draw 2)'},{index:1,name:'Accept (search for Basic Pokémon)'}],accept=>{
   if(!accept||p.bench.length>=5&&f.bench.length>=5){game.draw(p,2);return commit()}
   const opts=trainer58Cards(f.deck,basic),limit=Math.max(0,5-f.bench.length);
   return pick('Opponent selects Basic Pokémon for their Bench',opts,opp=>{
    const ours=trainer58Cards(p.deck,basic),count=Math.max(0,5-p.bench.length);
    return pick('Select Basic Pokémon for your Bench',ours,mine=>{
     for(const id of trainer58RemoveIndices(f.deck,opp)){const u=unit(id);u.playedTurn=game.round;f.bench.push(u)}
     for(const id of trainer58RemoveIndices(p.deck,mine)){const u=unit(id);u.playedTurn=game.round;p.bench.push(u)}
     p.deck=shuffle(p.deck);f.deck=shuffle(f.deck);return commit();
    },{multi:true,min:0,max:Math.min(count,ours.length)});
   },{multi:true,min:0,max:Math.min(limit,opts.length)});
  });
  case 'Narrow Gym':{
   // Choose first and only then return either side's Pokémon. Prior builds
   // changed the rival Bench before human confirmation, so Cancel corrupted
   // the game without ever spending Narrow Gym.
   const apply=ownSlot=>{
    if(p.bench.length===5&&(!Number.isInteger(ownSlot)||ownSlot<0||ownSlot>=5))return false;
    const send=(side,j)=>{const u=side.bench[j];side.hand.push(u.id,...u.under,...u.energies,...(u.attachedTrainers||[]).map(x=>x.id));side.bench.splice(j,1)};
    if(f.bench.length===5)send(f,0); // rival selects its own replacement
    if(p.bench.length===5)send(p,ownSlot);
    if(game.stadium)game.discardStadium();
    game.stadium={id:p.hand.splice(p.hand.indexOf(c.id),1)[0],owner:game.turn};
    clear();game.log(`${p.name} played Narrow Gym.`);render();return true;
   };
   if(p.bench.length!==5)return apply(null);
   return selectPokemon('Choose your Benched Pokémon to return to hand',p,null,j=>apply(j),true);
  }
  default: return false;
 }};
 if(lookup.get(this.stadium?.id)?.name==='No Removal Gym'&&['Energy Removal','Super Energy Removal'].includes(name))return chooseMany('Discard 2 extra hand cards required by No Removal Gym',p.hand,(x,z)=>z.index!==handIndex,2,2,js=>{gymAdditionalDiscard=js;return resolveTrainerEffect()});
 return resolveTrainerEffect();
};
Engine.prototype.trainer=function(i,benchTarget=null){
 const c=lookup.get(this.me?.hand?.[i]);
 if(c&&TRAINER58.has(c.name)&&(c.name==='Narrow Gym'||(!(c.subtypes||[]).includes('Stadium')&&!/This card stays in play/i.test((c.rules||[]).join(' '))))){
  if([this.foe.active,...this.foe.bench].some(u=>this.unitHasPower(u,'Mind Games'))&&coin('Mind Games')){
   const side=this.me;side.deck.push(side.hand.splice(i,1)[0]);this.log('Mind Games returned the Trainer card to the top of the deck.');render();return true;
  }
  return this.trainer58(i,benchTarget);
 }
 return trainer58Original.call(this,i,benchTarget);
};

// Continuous Stadiums: these are active only while that Stadium remains in play.
const trainer58BaseMaxHP=Engine.prototype.maxHP;
Engine.prototype.maxHP=function(u){
 let hp=trainer58BaseMaxHP.call(this,u);
 if(lookup.get(this.stadium?.id)?.name==="Rocket's Hideout"&&this.card(u)?.name.startsWith('Dark '))hp+=20;
 return hp;
};
const trainer58BaseAttach=Engine.prototype.attach;
Engine.prototype.attach=function(i,slot){
 const p=this.me,card=lookup.get(p.hand[i]),u=slot===-1?p.active:p.bench[slot];
 if(p.blaineExtraEnergySerial===this.turnSerial&&p.blaineExtraEnergyRemaining>0){
  if(card?.name!=='Fire Energy'||!u||!this.card(u)?.name.startsWith("Blaine's ")||(p.blaineEnergyTarget&&p.blaineEnergyTarget!==u))return false;
  const old=p.energyUsed;p.energyUsed=false;
  const ok=trainer58BaseAttach.call(this,i,slot);p.energyUsed=true;
  if(ok){p.blaineEnergyTarget=u;p.blaineExtraEnergyRemaining--;}
  return ok;
 }
 return trainer58BaseAttach.call(this,i,slot);
};
const trainer58BaseEvolve=Engine.prototype.evolve;
Engine.prototype.evolve=function(i,slot){
 const p=this.me,u=slot===-1?p.active:p.bench[slot];
 if(!u||u.giovanniEvolutionSerial!==this.turnSerial){const result=trainer58BaseEvolve.call(this,i,slot);if(result&&lookup.get(this.stadium?.id)?.name==='Viridian City Gym'&&this.card(u)?.name.startsWith("Giovanni's ") )u.damage=Math.max(0,u.damage-20);return result;}
 const played=u.playedTurn,plays=p.turnPlays;
 u.playedTurn=-10;p.turnPlays=plays.filter(v=>v!==u);
 const ok=trainer58BaseEvolve.call(this,i,slot);
 if(!ok){u.playedTurn=played;p.turnPlays=plays;}
 if(ok&&lookup.get(this.stadium?.id)?.name==='Viridian City Gym'&&this.card(u)?.name.startsWith("Giovanni's "))u.damage=Math.max(0,u.damage-20);
 return ok;
};
const trainer58BaseBetween=Engine.prototype.between;
Engine.prototype.runTrainerBetweenTriggers=function(){
 for(const owner of this.players)for(const u of [owner.active,...owner.bench].filter(Boolean)){
  const attached=u.attachedTrainers||[];
  for(const item of attached.slice()){
   const name=lookup.get(item.id)?.name;
   if(name==='Berry'&&u.damage>=20||name==='Gold Berry'&&u.damage>=40||name==='Miracle Berry'&&(u.status||u.poison||u.burn)){
    if(name==='Berry')u.damage=Math.max(0,u.damage-20);
    if(name==='Gold Berry')u.damage=Math.max(0,u.damage-40);
    if(name==='Miracle Berry')trainer58ClearConditions(u);
    owner.discard.push(item.id);attached.splice(attached.indexOf(item),1);
    this.log(`${name} activated on ${this.card(u)?.name}.`);
   }
  }
 }
};
Engine.prototype.between=function(){
 this.runTrainerBetweenTriggers();
 return trainer58BaseBetween.call(this);
};
Engine.prototype.stadium58=function(choice){
 const card=lookup.get(this.stadium?.id),name=card?.name,p=this.me;
 if(!card||!TRAINER58_STADIUMS.has(name)||this.turn!==0||this.over||this.phase!=='game'||(!['Saffron City Gym','Celadon City Gym'].includes(name)&&p.stadiumUsedSerial===this.turnSerial))return false;
 const done=()=>{if(!['Saffron City Gym','Celadon City Gym'].includes(name))p.stadiumUsedSerial=this.turnSerial;deckSearchRequest=null;this.log(`${p.name} activated ${name}.`);render();return true};
 if(name==='Lucky Stadium'){if(coin(name))this.draw(p);return done()}
 if(name==='Healing Field'){if(coin(name)&&p.active)p.active.damage=Math.max(0,p.active.damage-20);return done()}
 if(name==='Radio Tower'){const top=p.deck.slice(-2).reverse().map(id=>lookup.get(id)?.name||'Card');this.log(`Radio Tower peek: ${top.join(', ')||'(empty)'}.`);return done()}
 const makeChoice=(label,opts,next)=>{
  if(Number.isInteger(choice)){if(!opts.some(x=>x.index===choice))return false;return next(choice)}
  if(!opts.length)return false;
  deckSearchRequest={label:name+': '+label,options:opts,execute:j=>this.stadium58(j)};render();return null;
 };
 if(name==='Energy Stadium'){
  if(p.stadiumCoinSerial!==this.turnSerial){p.stadiumCoinSerial=this.turnSerial;p.stadiumCoinHeads=coin(name)}
  if(!p.stadiumCoinHeads)return done();
  const opts=trainer58Cards(p.discard,trainer58Energy);
  if(!opts.length)return done();
  return makeChoice('Choose Basic Energy from discard',opts,j=>{p.hand.push(p.discard.splice(j,1)[0]);return done()});
 }
 if(name==='Celadon City Gym'){
  const opts=trainer58Bench(p).filter(x=>this.card(x.unit)?.name.startsWith("Erika's ")).flatMap(x=>x.unit.energies.map((id,index)=>({index:100*(x.index+1)+index,id,name:(this.card(x.unit)?.name||x.name)+' — '+(lookup.get(id)?.name||'Energy')})));
  return makeChoice('Discard Energy from an Erika Pokémon to cure its conditions',opts,j=>{
   const slot=Math.floor(j/100)-1,e=j%100,u=slot===-1?p.active:p.bench[slot];p.discard.push(u.energies.splice(e,1)[0]);trainer58ClearConditions(u);return done();
  });
 }
 if(name==='Fuchsia City Gym'){
  if(!coin(name))return done();
  const opts=trainer58Bench(p).filter(x=>this.card(x.unit)?.name.startsWith("Koga's "));
  return makeChoice('Choose a Koga Pokémon to shuffle into the deck',opts,j=>{
   const u=j===-1?p.active:p.bench[j];p.deck=shuffle([...p.deck,u.id,...u.under,...u.energies,...(u.attachedTrainers||[]).map(x=>x.id)]);
   if(j===-1)p.active=p.bench.shift()||null;else p.bench.splice(j,1);
   return done();
  });
 }
 if(name==='Saffron City Gym'){
  const opts=trainer58Bench(p).filter(x=>this.card(x.unit)?.name.startsWith("Sabrina's ")).flatMap(x=>x.unit.energies.map((id,index)=>({index:100*(x.index+1)+index,id,name:(this.card(x.unit)?.name||x.name)+' — '+(lookup.get(id)?.name||'Energy')})).filter(e=>trainer58Energy(lookup.get(e.id))));
  return makeChoice('Return one attached basic Energy to your hand',opts,j=>{
   const slot=Math.floor(j/100)-1,e=j%100,u=slot===-1?p.active:p.bench[slot];p.hand.push(u.energies.splice(e,1)[0]);return done();
  });
 }
 return false;
};

const trainer58BaseEnd=Engine.prototype.end;
Engine.prototype.end=function(){
 for(const p of this.players){if(p.trainer58HeldHand&&p.trainer58ReturnSerial===this.turnSerial){p.hand.push(...p.trainer58HeldHand);delete p.trainer58HeldHand;delete p.trainer58ReturnSerial;}}
 return trainer58BaseEnd.call(this);
};

const trainer58BasePlayBasic=Engine.prototype.playBasic;
Engine.prototype.playBasic=function(i,bench=true){
 const owner=this.me,oldLength=owner.bench.length;
 const result=trainer58BasePlayBasic.call(this,i,bench);
 if(result&&owner.bench.length>oldLength&&lookup.get(this.stadium?.id)?.name==="Rocket's Minefield Gym"){
  if(!coin("Rocket's Minefield Gym")){
   owner.bench[owner.bench.length-1].damage+=20;
   this.log("Rocket's Minefield Gym inflicted 20 Bench damage (official erratum).");
   this.resolveKO();render();
  }
 }
 return result;
};
