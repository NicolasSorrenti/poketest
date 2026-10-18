'use strict';
const crypto=require('node:crypto');
const {CATALOG}=require('./headless_duel');
const C=require('./cube_draft');
const {isBasicPokemon,isBasicEnergy,canEvolve}=require('./core_rules');
const {cpuPick,score,buildCpuDeck,ENERGY_IDS}=require('./cube_strategy');
const RIVALS=Object.freeze([
 {name:'Rookie Rival',level:2,personality:'balanced'},
 {name:'Campus Challenger',level:3,personality:'balanced'},
 {name:'Cube Champion',level:4,personality:'balanced'}
]);
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
  const session=this.session(token);
  const {draft:d,revision}=session;
  return {revision,round:d.round,pick:d.pick,packs:d.packs,cardsPerPack:d.cardsPerPack,done:d.done,
   pack:C.availableForSeat(d,0).map(id=>this.card(id)),
   drafted:d.picks[0].map(id=>this.card(id)),
   opponentCounts:d.picks.slice(1).map(a=>a.length),started:!!session.tournament,
   tournament:session.tournament?{
    activeRound:session.tournament.results.length+1,
    rounds:3,results:session.tournament.results.map(r=>({...r})),
    opponents:RIVALS.map(r=>r.name),
    readyForNext:session.tournament.pendingNext,
    finished:session.tournament.results.length===3,
    activeDuelToken:session.tournament.pendingNext?null:session.duelToken,
    wins:session.tournament.results.filter(r=>r.outcome==='win').length,
    losses:session.tournament.results.filter(r=>r.outcome==='loss').length,
    draws:session.tournament.results.filter(r=>r.outcome==='draw').length
   }:null,
   energyIds:ENERGY_IDS,suggestedDeck:d.done?buildCpuDeck(d.picks[0]):null};
 }
 start(token,deck,revision,classic){
  const s=this.session(token);
  if(s.revision!==revision)throw Error('Stale draft revision');
  if(!s.draft.done)throw Error('Draft must be completed first');
  if(s.duelToken)throw Error('Cube match already started');
  const result=C.validateBuild(s.draft.picks[0],deck);
  if(!result.valid)throw Error(result.reason);
  // Freeze a single deck for all three rounds: the player cannot silently
  // upgrade their draft between games. All CPU decks come from their own picks.
  const opponentDecks=s.draft.picks.slice(1).map(buildCpuDeck);
  const duel=classic.createCube({humanDeck:deck,cpuDeck:opponentDecks[0],
   difficulty:RIVALS[0].level,personality:RIVALS[0].personality,name:RIVALS[0].name});
  s.tournament={humanDeck:[...deck],opponentDecks,results:[],pendingNext:false};
  s.duelToken=duel.token;s.revision++;
  return {duelToken:duel.token};
 }
 sync(token,classic){
  const s=this.session(token),t=s.tournament;
  if(!t||t.pendingNext||t.results.length===3)return this.view(token);
  if(!classic)throw Error('Classic duel service required');
  const duel=classic.state(s.duelToken);
  if(duel.view.over){
   const index=t.results.length;
   const outcome=duel.winner===0?'win':duel.winner===1?'loss':'draw';
   t.results.push({round:index+1,opponent:RIVALS[index].name,outcome});
   t.pendingNext=t.results.length<3;
   s.revision++;
  }
  return this.view(token);
 }
 next(token,revision,classic){
  const s=this.session(token);
  if(s.revision!==revision)throw Error('Stale draft revision');
  if(!s.tournament)throw Error('Start a Cube tournament first');
  // Always consult the authoritative duel state, never a client-reported win.
  this.sync(token,classic);
  const t=s.tournament;
  if(!t.pendingNext)throw Error('Finish the current Cube match first');
  // If syncing just advanced the state, the client must refresh its revision.
  if(s.revision!==revision)throw Error('Stale draft revision');
  const index=t.results.length;
  const duel=classic.createCube({humanDeck:t.humanDeck,cpuDeck:t.opponentDecks[index],
   difficulty:RIVALS[index].level,personality:RIVALS[index].personality,name:RIVALS[index].name});
  s.duelToken=duel.token;t.pendingNext=false;s.revision++;
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
module.exports={CubeService,cpuPick,score,buildCpuDeck,ENERGY_IDS,RIVALS};
