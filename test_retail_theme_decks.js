'use strict';
// End-to-end curated retail legality, identity, deck activation, and hand protection.
const assert=require('node:assert/strict');
const RETAIL=require('./retail_theme_decks');
const FORMAT=require('./classic_format');
const {ClassicLocalService,DECKS,deckOptions}=require('./classic_local_service');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {isBasicPokemon,isEnergy,countCards}=require('./core_rules');
const LAB=require('./classic_live_decks').LAB;
let checks=0,starts=0,actions=0;
assert.equal(RETAIL.entries.length,16);
assert.equal(RETAIL.entries.filter(e=>e.gym).length,8);
assert.equal(deckOptions().length,50);
assert.equal(RETAIL.gymIds.length,107);
assert.equal(new Set(RETAIL.gymIds).size,RETAIL.gymIds.length);
for(const row of RETAIL.entries){
 const cards=RETAIL.list(row.id),name=row.name;
 assert.equal(cards.length,60,`${name} must be a 60-card deck`);
 assert.equal(FORMAT.validateDeck(cards,CATALOG,{gym:row.gym,reprint:!row.gym}).valid,true,`${name} fails historical 4-of deck validation`);
 assert.equal(cards.filter(id=>isBasicPokemon(CATALOG.get(id))).length>0,true,`${name}: no opening Basic`);
 for(const id of new Set(cards)){
  assert.ok(CATALOG.has(id),`${name}: unknown printing ${id}`);
  assert.ok(FORMAT.isAllowed(id,{gym:row.gym,reprint:!row.gym}),`${name}: printing not allowed ${id}`);
 }
 for(let seed=0;seed<3;seed++){
  const service=new ClassicLocalService();
  let r=service.create({deck:row.id,opponent:'blackout',seed:10007+seed*9301});let token=r.token;
  assert.deepEqual(r.counts,[60,60]);
  assert.equal(r.view.players[1].hand,undefined,'Hidden opponent hand');
  assert.equal(r.format,row.gym?'gym-theme':cards.some(id=>id.startsWith('base4'))?'theme-expanded':'classic');
  let idx=r.view.players[0].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  assert.ok(idx>=0,`${name}: missing basic in opening hand`);
  r=service.action(token,{type:'setup_select',payload:{handIndex:idx}},r.revision);actions++;
  r=service.action(token,{type:'setup_confirm',payload:{}},r.revision);actions++;
  assert.equal(r.view.phase,'game');assert.deepEqual(r.counts,[60,60]);
  const bench=r.view.players[0].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  if(bench>=0){r=service.action(token,{type:'bench',payload:{handIndex:bench}},r.revision);actions++;}
  if(!r.you.energyUsed){const energy=r.view.players[0].hand.findIndex(id=>isEnergy(CATALOG.get(id)));
   if(energy>=0){r=service.action(token,{type:'attach_energy',payload:{handIndex:energy,slot:-1}},r.revision);actions++;}}
  assert.deepEqual(r.counts,[60,60],`${name}: card conservation`);
  assert.throws(()=>service.action(token,{type:'end_turn',payload:{}},r.revision-1),/Stale/);
  starts++;checks++;
 }
}
const base=LAB.rocket_lab;
assert.throws(()=>createGame({format:'classic',decks:[RETAIL.list('brock'),base]}),/Invalid deck/);
assert.throws(()=>createGame({format:'classic',decks:[RETAIL.list('grass_chopper'),base]}),/Invalid deck/);
assert.throws(()=>createGame({format:'theme-expanded',decks:[RETAIL.list('brock'),base]}),/Invalid deck/);
assert.equal(FORMAT.isAllowed('gym2-2',{gym:true}),false,'Gym format must not legalize the whole expansion');
// Stadiums must be real retained table objects and not vanish in discard/hand.
const gymDeck=RETAIL.list('brock'),rival=RETAIL.list('misty');
const game=createGame({format:'gym-theme',decks:[gymDeck,rival],seed:555});
game.phase='game';game.turn=0;game.players[0].active={id:'gym1-66',under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0};
game.players[1].active={id:'gym1-85',under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0};
game.players[0].hand.unshift('gym1-115');
const r=applyCommand(game,0,{type:'play_trainer',payload:{handIndex:0}});
assert.equal(r.ok,true,`Pewter City Gym should play: ${r.error}`);
assert.equal(game.stadium.id,'gym1-115');assert.equal(game.players[0].stadium,'gym1-115');
assert.ok(!game.players[0].discard.includes('gym1-115'));
// Sabrina's Psychic Control now plays with a heads/tails check and optionally
// copies a one-shot Trainer without removing it from the opponent's discard.
const sabrinaGame=createGame({format:'gym-theme',decks:[RETAIL.list('sabrina'),rival],seed:99});
sabrinaGame.phase='game';sabrinaGame.players[0].active={id:'gym2-93',under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0};
sabrinaGame.players[1].active={id:'gym1-85',under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0};
sabrinaGame.players[0].hand.unshift('gym2-121');
const played=applyCommand(sabrinaGame,0,{type:'play_trainer',payload:{handIndex:0}});
assert.equal(played.ok,true,'Psychic Control should be playable');
assert.ok(sabrinaGame.players[0].discard.includes('gym2-121'));

console.log(`PASS retail theme decks: ${RETAIL.entries.length} official recipes, ${starts} server-authoritative openings, ${actions} actions, 107 curated Gym IDs, stadium persistence, strict scope, hidden information`);
