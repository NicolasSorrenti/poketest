'use strict';
const crypto=require('node:crypto');
const {CATALOG}=require('./headless_duel');
const C=require('./cube_draft');
const {isBasicPokemon,isBasicEnergy,canEvolve}=require('./core_rules');
function score(id,picks){
 const c=CATALOG.get(id),name=c.name||'',types=c.types||[];
 const existing=picks.map(x=>CATALOG.get(x));
 const basics=existing.filter(isBasicPokemon);
 const sameTypes=existing.filter(x=>x.types?.some(t=>types.includes(t))).length;
 const prior=existing.filter(x=>x.name===name).length;
 let result=c.supertype==='Trainer'?4: isBasicPokemon(c)?8:3;
 result+=Math.min(5,sameTypes)*0.8+Math.min(2,prior)*2;
 if(c.evolvesFrom&&existing.some(x=>x.name===c.evolvesFrom))result+=10;
 if(c.evolvesFrom&&!existing.some(x=>x.name===c.evolvesFrom))result-=5;
 if(c.supertype==='Trainer'&&/Bill|Oak|Elm|Search|Gust|Switch|Potion/i.test(name))result+=3;
 if(basics.length<7&&isBasicPokemon(c))result+=5;
 return result;
}
function cpuPick(ids,picks){return [...ids].sort((a,b)=>score(b,picks)-score(a,picks)||a.localeCompare(b))[0];}

const ENERGY_TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting'];
const ENERGY_IDS=Object.freeze(Object.fromEntries(ENERGY_TYPES.map(t=>{
 const card=[...CATALOG.values()].find(c=>c.name===t+' Energy'&&isBasicEnergy(c));
 if(!card)throw Error('Basic Energy missing: '+t);
 return [t,card.id];
})));
function buildCpuDeck(picks){
 if(!Array.isArray(picks)||!picks.length)throw Error('CPU has no drafted cards');
 const pokemon=picks.filter(id=>CATALOG.get(id)?.supertype==='Pokémon');
 const basics=pokemon.filter(id=>isBasicPokemon(CATALOG.get(id)));
 if(!basics.length)throw Error('CPU drafted no Basic Pokémon');
 const colorVotes=new Map();
 for(const id of basics){
  const c=CATALOG.get(id);
  for(const type of c.types||[])if(ENERGY_TYPES.includes(type))colorVotes.set(type,(colorVotes.get(type)||0)+1);
 }
 const preferred=[...colorVotes].sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]);
 if(!preferred.length)preferred.push('Fighting');
 const chosen=[],used=new Map(),byName=new Map();
 const add=id=>{
  if(chosen.length>=24)return false;
  const c=CATALOG.get(id),name=c.name;
  if((used.get(id)||0)>=(picks.filter(x=>x===id)).length||(byName.get(name)||0)>=4)return false;
  chosen.push(id);used.set(id,(used.get(id)||0)+1);byName.set(name,(byName.get(name)||0)+1);return true;
 };
 const fit=id=>{
  const c=CATALOG.get(id);
  return (c.types||[]).some(t=>preferred.includes(t))?2:0;
 };
 // Select enough opening Basics before adding advanced Evolutions.
 for(const id of [...basics].sort((a,b)=>fit(b)-fit(a)||a.localeCompare(b))){
  if(chosen.filter(x=>isBasicPokemon(CATALOG.get(x))).length>=11)break;
  add(id);
 }
 for(const id of pokemon.filter(id=>!isBasicPokemon(CATALOG.get(id))).sort((a,b)=>fit(b)-fit(a)||a.localeCompare(b))){
  if(chosen.some(x=>canEvolve(CATALOG.get(id),CATALOG.get(x))))add(id);
 }
 // Trainers are powerful draft picks and do not need colored Energy.
 const trainers=picks.filter(id=>CATALOG.get(id)?.supertype==='Trainer');
 for(const id of trainers.sort((a,b)=>score(b,chosen)-score(a,chosen)||a.localeCompare(b)))add(id);
 for(const id of basics.sort((a,b)=>fit(b)-fit(a)||a.localeCompare(b)))add(id);
 while(chosen.length<24){
  const next=picks.find(id=>CATALOG.get(id)?.supertype==='Trainer'&&(byName.get(CATALOG.get(id).name)||0)<4&&(used.get(id)||0)<picks.filter(x=>x===id).length);
  if(!next)break;
  add(next);
 }
 const energCount=40-chosen.length;
 const energies=Array.from({length:energCount},(_,i)=>ENERGY_IDS[preferred[i%preferred.length]]);
 const deck=[...chosen,...energies];
 const result=C.validateBuild(picks,deck);
 if(!result.valid)throw Error('Cannot build CPU deck: '+result.reason);
 return deck;
}

class CubeService{
 constructor(){this.sessions=new Map();}
 create({seed}={}){
  if(seed!==undefined&&(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff))throw Error('Invalid cube seed');
  for(const [key,session] of this.sessions)if(Date.now()-session.updated>90*60*1000)this.sessions.delete(key);
  if(this.sessions.size>=32)throw Error('Too many active cube drafts');
  const draft=C.makeDraft({seed:seed??crypto.randomBytes(4).readUInt32BE(0)});
  const token=crypto.randomBytes(24).toString('base64url');
  this.sessions.set(token,{draft,revision:0,updated:Date.now()});
  return {token,...this.view(token)};
 }
 session(token){
  const s=this.sessions.get(token);
  if(!s||Date.now()-s.updated>90*60*1000){this.sessions.delete(token);throw Error('Unknown or expired cube draft');}
  s.updated=Date.now();return s;
 }
 view(token){
  const {draft:d,revision}=this.session(token);
  return {revision,round:d.round,pick:d.pick,packs:d.packs,cardsPerPack:d.cardsPerPack,done:d.done,
   pack:C.availableForSeat(d,0).map(id=>this.card(id)),
   drafted:d.picks[0].map(id=>this.card(id)),
   opponentCounts:d.picks.slice(1).map(a=>a.length),started:!!this.session(token).duelToken,
   energyIds:ENERGY_IDS,suggestedDeck:d.done?buildCpuDeck(d.picks[0]):null};
 }
 start(token,deck,revision,classic){
  const s=this.session(token);
  if(s.revision!==revision)throw Error('Stale draft revision');
  if(!s.draft.done)throw Error('Draft must be completed first');
  if(s.duelToken)throw Error('Cube match already started');
  const result=C.validateBuild(s.draft.picks[0],deck);
  if(!result.valid)throw Error(result.reason);
  const cpuDeck=buildCpuDeck(s.draft.picks[1]);
  const duel=classic.createCube({humanDeck:deck,cpuDeck});
  s.duelToken=duel.token;s.revision++;
  return {duelToken:duel.token};
 }
 card(id){
  const c=CATALOG.get(id);
  return {id,name:c.name,supertype:c.supertype,subtypes:c.subtypes||[],types:c.types||[],
   evolvesFrom:c.evolvesFrom||null,hp:c.hp||null,images:c.images||{}};
 }
 pick(token,id,revision){
  const s=this.session(token),d=s.draft;
  if(s.revision!==revision)throw Error('Stale draft revision');
  if(typeof id!=='string'||id.length>40)throw Error('Invalid card ID');
  C.draftPick(d,0,id);
  for(let seat=1;seat<d.players;seat++){
   const pack=C.availableForSeat(d,seat);
   C.draftPick(d,seat,cpuPick(pack,d.picks[seat]));
  }
  s.revision++;return this.view(token);
 }
}
module.exports={CubeService,cpuPick,score,buildCpuDeck,ENERGY_IDS};
