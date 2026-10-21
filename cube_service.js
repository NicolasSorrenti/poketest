'use strict';
const crypto=require('node:crypto');
const {CATALOG}=require('./headless_duel');
const C=require('./cube_draft');
const {getPreset}=require('./cube_presets');
const {cpuPick,score,buildCpuDeck,ENERGY_IDS}=require('./cube_strategy');
const {simulateCpuMatch}=require('./cube_bracket');
const RIVALS=Object.freeze([
 {name:'Rookie Rival',level:2,personality:'balanced'},
 {name:'Campus Challenger',level:3,personality:'balanced'},
 {name:'Cube Champion',level:4,personality:'balanced'}
]);
const NAMES=['You',...RIVALS.map(x=>x.name)];
const validateDifficulty=value=>{
 if(!Number.isInteger(value)||value<1||value>5)throw Error('CPU difficulty must be 1–5');
 return value;
};
const rivalLevel=(difficulty,seat)=>Math.min(5,Math.max(1,difficulty+RIVALS[seat-1].level-3));
const other=(seats,winner)=>seats.find(x=>x!==winner);
const match=(id,seats)=>({id,seats:[...seats],winner:null,method:null,status:seats.length?'waiting':'pending'});

class CubeService{
 constructor({simulateCpu=simulateCpuMatch}={}){this.sessions=new Map();this.simulateCpu=simulateCpu;}
 create({seed,preset='balanced',difficulty=3}={}){
  getPreset(preset);validateDifficulty(difficulty);
  if(seed!==undefined&&(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff))throw Error('Invalid cube seed');
  for(const [key,session] of this.sessions)if(Date.now()-session.updated>90*60*1000)this.sessions.delete(key);
  if(this.sessions.size>=32)throw Error('Too many active cube drafts');
  const realSeed=seed??crypto.randomBytes(4).readUInt32BE(0),draft=C.makeDraft({seed:realSeed,preset});
  const token=crypto.randomBytes(24).toString('base64url');
  this.sessions.set(token,{draft,seed:realSeed,difficulty,revision:0,updated:Date.now()});
  return {token,...this.view(token)};
 }
 session(token){
  const s=this.sessions.get(token);
  if(!s||Date.now()-s.updated>90*60*1000){this.sessions.delete(token);throw Error('Unknown or expired cube draft');}
  s.updated=Date.now();return s;
 }
 view(token){
  const s=this.session(token),d=s.draft,t=s.tournament;
  const bracket=t?['semiHuman','semiCpu','final','third'].map(id=>{
   const m=t.matches[id];
   return {id,seats:m.seats.map(x=>NAMES[x]),winner:m.winner===null?null:NAMES[m.winner],
    status:m.status,method:m.method};
  }):null;
  const placement=t?.finished?
   ['final','third'].flatMap((id)=>{
    const m=t.matches[id];
    return id==='final'?[m.winner,other(m.seats,m.winner)]:[m.winner,other(m.seats,m.winner)];
   }).map((seat,i)=>({place:i+1,name:NAMES[seat]})):null;
  return {preset:d.preset||'balanced',difficulty:s.difficulty??3,
    recommendedId:d.done?null:cpuPick(C.availableForSeat(d,0),d.picks[0]),
    revision:s.revision,round:d.round,pick:d.pick,packs:d.packs,cardsPerPack:d.cardsPerPack,done:d.done,
   pack:C.availableForSeat(d,0).map(id=>this.card(id)),drafted:d.picks[0].map(id=>this.card(id)),
   opponentCounts:d.picks.slice(1).map(a=>a.length),started:!!t,
    cubePool:d.rounds.flat(2).map(id=>{const c=CATALOG.get(id);return {id,name:c.name,supertype:c.supertype,types:c.types||[]};}),
   tournament:t?{
    rounds:2,activeRound:Math.min(2,t.results.length+1),
    results:t.results.map(r=>({...r})),opponents:RIVALS.map(r=>r.name),
    bracket,standings:placement,readyForNext:t.pendingNext,finished:t.finished,
    rematch:t.rematch,activeMatchId:t.activeMatch,
    activeDuelToken:t.pendingNext||t.finished?null:s.duelToken,
    wins:t.results.filter(r=>r.outcome==='win').length,
    losses:t.results.filter(r=>r.outcome==='loss').length,draws:t.draws
   }:null,
   energyIds:ENERGY_IDS,suggestedDeck:d.done?buildCpuDeck(d.picks[0],{preset:d.preset}):null};
 }
 launch(s,classic,opponentSeat){
  const rival=RIVALS[opponentSeat-1];
  if(!rival)throw Error('Invalid Cube opponent');
  return classic.createCube({humanDeck:s.tournament.decks[0],cpuDeck:s.tournament.decks[opponentSeat],
   difficulty:rivalLevel(s.difficulty??3,opponentSeat),personality:rival.personality,name:rival.name});
 }
 start(token,deck,revision,classic,difficulty){
  const s=this.session(token);
  if(s.revision!==revision)throw Error('Stale draft revision');
  if(!s.draft.done)throw Error('Draft must be completed first');
  if(s.tournament)throw Error('Cube tournament already started');
  const level=validateDifficulty(difficulty??s.difficulty??3),originalLevel=s.difficulty;
  const v=C.validateBuild(s.draft.picks[0],deck);
  if(!v.valid)throw Error(v.reason);
  const decks=[[...deck],...s.draft.picks.slice(1).map(picks=>buildCpuDeck(picks,{preset:s.draft.preset}))];
  const t={decks,results:[],draws:0,rematch:false,pendingNext:false,finished:false,
   activeMatch:'semiHuman',
   matches:{semiHuman:match('semiHuman',[0,1]),semiCpu:match('semiCpu',[2,3]),
    final:match('final',[]),third:match('third',[])}};
  s.tournament=t;s.difficulty=level;
  try{const duel=this.launch(s,classic,1);s.duelToken=duel.token;s.revision++;return {duelToken:duel.token};}
  catch(e){delete s.tournament;s.difficulty=originalLevel;throw e;}
 }
 resolveCpuFixture(s,id){
  const t=s.tournament,m=t.matches[id];
  if(m.status==='complete')return;
  if(m.seats.length!==2||m.seats.includes(0))throw Error('Not a CPU bracket fixture');
  const [a,b]=m.seats,result=this.simulateCpu(t.decks[a],t.decks[b],{
   seed:(s.seed+id.length*12347)>>>0,
   levelA:rivalLevel(s.difficulty??3,a),levelB:rivalLevel(s.difficulty??3,b)
  });
  if(!result||(result.winner!==0&&result.winner!==1))throw Error('CPU fixture requires a winner');
  m.winner=m.seats[result.winner];m.method=result.method||'played';m.status='complete';
 }
 sync(token,classic){
  const s=this.session(token),t=s.tournament;
  if(!t||t.pendingNext||t.finished)return this.view(token);
  if(!classic)throw Error('Classic duel service required');
  const duel=classic.state(s.duelToken);
  if(!duel.view.over)return this.view(token);
  if(duel.winner!==0&&duel.winner!==1){
   t.draws++;t.pendingNext=true;t.rematch=true;s.revision++;return this.view(token);
  }
  const m=t.matches[t.activeMatch];
  if(m.status==='complete')return this.view(token);
  const winner=duel.winner===0?0:m.seats[1];
  m.winner=winner;m.status='complete';m.method='played';
  t.results.push({round:t.results.length+1,opponent:NAMES[m.seats[1]],
   outcome:winner===0?'win':'loss'});
  t.rematch=false;
  if(t.activeMatch==='semiHuman'){
   this.resolveCpuFixture(s,'semiCpu');
   const h=t.matches.semiHuman,c=t.matches.semiCpu;
   t.matches.final=match('final',[h.winner,c.winner]);
   t.matches.third=match('third',[other(h.seats,h.winner),other(c.seats,c.winner)]);
   t.activeMatch=h.winner===0?'final':'third';
   t.pendingNext=true;
  }else{
   const otherId=t.activeMatch==='final'?'third':'final';
   this.resolveCpuFixture(s,otherId);
   t.activeMatch=null;t.finished=true;t.pendingNext=false;
  }
  s.revision++;return this.view(token);
 }
 next(token,revision,classic){
  const s=this.session(token);
  if(s.revision!==revision)throw Error('Stale draft revision');
  if(!s.tournament)throw Error('Start a Cube tournament first');
  this.sync(token,classic);
  const t=s.tournament;
  if(s.revision!==revision)throw Error('Stale draft revision');
  if(t.finished)throw Error('Cube tournament complete');
  if(!t.pendingNext)throw Error('Finish the current Cube match first');
  const current=t.matches[t.activeMatch],opponent=current.seats[1];
  if(current.seats[0]!==0)throw Error('Human must be first in the match');
  const duel=this.launch(s,classic,opponent);
  s.duelToken=duel.token;t.pendingNext=false;t.rematch=false;s.revision++;
  return {duelToken:duel.token};
 }
 card(id){
  const c=CATALOG.get(id);
  return {id,name:c.name,supertype:c.supertype,subtypes:c.subtypes||[],types:c.types||[],
   evolvesFrom:c.evolvesFrom||null,hp:c.hp||null,images:c.images||{},
   attacks:(c.attacks||[]).map(a=>({name:a.name,cost:a.cost||[],damage:a.damage||''}))};
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
