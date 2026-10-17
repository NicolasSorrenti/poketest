'use strict';
const assert=require('node:assert/strict');
const {ClassicLocalService,deckOptions}=require('./classic_local_service');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {isBasicPokemon,isEnergy}=require('./core_rules');
const F=require('./classic_format'), A=require('./attack_effects_core'), P=require('./classic_power_core'), T=require('./classic_trainer_core');
const RETAIL=require('./retail_theme_decks'), GENESIS=require('./neo_genesis_decks'), DISCOVERY=require('./neo_discovery_decks'), DESTINY=require('./neo_destiny_decks');
const regular=["blackout","brushfire","overgrowth","zap","power_reserve","water_blast"];
const official=[...regular,...RETAIL.entries.map(x=>x.id),...GENESIS.entries.map(x=>x.id),...DISCOVERY.entries.map(x=>x.id),...DESTINY.entries.map(x=>x.id)];
assert.equal(official.length,28,'All 28 historical official decks should be available');
assert.equal(new Set(official).size,28);
assert.equal(deckOptions().length,33,'28 original themes and five lab/custom presets');
assert(official.every(id=>deckOptions().some(x=>x.id===id)));
assert.deepEqual(DESTINY.entries.map(x=>x.id),['dark','light']);
const service=new ClassicLocalService({maxSessions:256});
let openings=0,commands=0,attackCount=0,powerCount=0,trainerCount=0;
const unsupported=[];
function command(session,token,type,payload){const next=service.action(token,{type,payload},session.revision);commands++;
 assert.deepEqual(next.counts,[60,60],`Card count changed after ${type}`);
 assert.equal(next.view.players[1].hand,undefined,'Hidden information leaked to player');
 return next;
}
function resolveChoices(result,token){
 for(let i=0;result.view.pendingDecision&&i<20;i++){
  const d=result.view.pendingDecision;
  if(d.actor!==0)throw Error('Opponent choice not resolved by bot: '+d.kind);
  const minimum=(d.options||[]).slice(0,d.min).map(o=>o.id);
  result=command(result,token,'choose',{decisionId:d.id,selected:minimum});
 }
 if(result.view.pendingDecision)throw Error('Decision cycle not completed');
 return result;
}
for(let k=0;k<official.length;k++){
 const id=official[k],cards=service.decklist(id);
 assert.equal(cards.length,60,id+' is not a complete deck');
 const neo=cards.some(id=>id.startsWith('neo'));
 assert(F.validateDeck(cards,CATALOG,neo?{neo:true}:cards.some(id=>id.startsWith('gym'))?{gym:true}:{reprint:true}).valid,id+' has an illegal list');
 for(const cid of new Set(cards)){
  const c=CATALOG.get(cid);assert(c,`Missing ${cid} in ${id}`);
  for(const a of c.attacks||[]){attackCount++;if(!A.compile(a))unsupported.push(`${id}: ${c.name}/${a.name}`);}
  for(const a of c.abilities||[]){powerCount++;if(![P.ACTIVATED,P.PASSIVE,P.ONPLAY].some(x=>x.has(a.name)))unsupported.push(`${id}: ${c.name}/${a.name}`);}
  if(c.supertype==='Trainer'){trainerCount++;if(!T.SUPPORTED.has(c.name))unsupported.push(`${id}: ${c.name}`);}
 }
 for(let n=0;n<3;n++){
  let result=service.create({deck:id,opponent:official[(k+1)%official.length],seed:7351+k*291+n*3701});
  assert.deepEqual(result.counts,[60,60],`Opening ${id} changed counts`);
  let token=result.token;
  const i=result.view.players[0].hand.findIndex(cid=>isBasicPokemon(CATALOG.get(cid)));
  assert(i>=0,id+': no Basic in starting hand');
  result=command(result,token,'setup_select',{handIndex:i});
  result=resolveChoices(command(result,token,'setup_confirm',{}),token);
  assert.equal(result.view.phase,'game');
  assert.equal(result.view.players[1].hand,undefined);
  if(result.view.turn===0&&!result.view.pendingDecision){
   const j=result.view.players[0].hand.findIndex(cid=>isBasicPokemon(CATALOG.get(cid)));
   if(j>=0)result=resolveChoices(command(result,token,'bench',{handIndex:j}),token);
   const e=result.view.players[0].hand.findIndex(cid=>isEnergy(CATALOG.get(cid)));
   if(e>=0)result=resolveChoices(command(result,token,'attach_energy',{handIndex:e,slot:-1}),token);
  }
  openings++;
 }
}
console.log('PASS v0.29 official themes:',official.length,'unique decks;',openings,'authoritative games;',commands,'real actions;',attackCount,'attack signatures;',powerCount,'Power signatures;',trainerCount,'Trainer cards');
if(unsupported.length)console.log('KNOWN UNIMPLEMENTED IN OFFICIAL DECKS ('+unsupported.length+'):',unsupported.join(' | '));
else console.log('PASS all official theme decks: every included attack, Trainer, and Pokémon Power has an effect handler');
// Historical correctness rules: no first-turn evolution and no foreign-owner
// evolution; original Gym names are NOT interchangeable with regular species.
const g=createGame({decks:[service.decklist('giovanni'),service.decklist('brock')],format:'gym-theme',seed:441});
g.phase='game';g.turn=0;g.round=1;g.players[0].active={id:'gym2-73',under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1};
g.players[1].active={id:'gym1-66',under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0};
g.players[0].hand=['gym2-47'];
const early=applyCommand(g,0,{type:'evolve',payload:{handIndex:0,slot:-1}});assert.equal(early.ok,false,'Must not evolve in first turn');
console.log('PASS theme evolution: cannot evolve a just-played Basic on turn one.');
