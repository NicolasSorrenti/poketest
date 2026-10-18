'use strict';
const crypto=require('node:crypto');
const {CATALOG}=require('./headless_duel');
const C=require('./cube_draft');
const {isBasicPokemon}=require('./core_rules');
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
class CubeService{
 constructor(){this.sessions=new Map();}
 create({seed}={}){
  if(seed!==undefined&&(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff))throw Error('Invalid cube seed');
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
   opponentCounts:d.picks.slice(1).map(a=>a.length)};
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
module.exports={CubeService,cpuPick,score};
