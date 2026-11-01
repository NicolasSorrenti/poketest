'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');

const variants=[
 {plus:'base1-84',buzz:'base1-20',lightning:'base1-100',fire:'base1-98',format:'classic'},
 {plus:'base4-113',buzz:'base4-24',lightning:'base4-128',fire:'base4-126',format:'online-preview'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=Array(56).fill(v.lightning).concat(Array(4).fill(v.buzz));
 const g=createGame({format:v.format,decks:[deck,deck],seed:84113});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;
 for(const p of g.players){p.active=unit(v.buzz);p.bench=[];p.hand=[];p.deck=Array(20).fill(v.fire);p.discard=[];p.prizes=Array(6).fill(v.fire);p.prizeFaceUp=Array(6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
const player=(g,side)=>g.players[side];
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function seedFor(heads){for(let seed=0;seed<10000;seed++){const state=(Math.imul(seed,1664525)+1013904223)>>>0;if((state>=0x80000000)===heads)return seed;}throw Error('coin seed not found');}
function setCoin(g,heads){g.rngState=seedFor(heads);g.coinFlips=[];g.coinSeq=0;}
let scenarios=0;

for(const v of variants){
 const plus=CATALOG.get(v.plus),buzz=CATALOG.get(v.buzz);
 assert.equal(plus.name,'PlusPower');
 assert.equal(plus.rules[0],"Attach PlusPower to your Active Pokémon. At the end of your turn, discard PlusPower. If this Pokémon's attack does damage to the Defending Pokémon (after applying Weakness and Resistance), the attack does 10 more damage to the Defending Pokémon.");
 assert.equal(buzz.name,'Electabuzz');assert.equal(buzz.attacks[1].name,'Thunderpunch');
 assert.deepEqual(CATALOG.get('base1-84').rules,CATALOG.get('base4-113').rules);
 scenarios++;

 // WotC errata applies PlusPower to damage dealt to either Active Pokémon.
 // Thunderpunch tails therefore boosts both the 30 to the opponent and the
 // 10 recoil to Electabuzz; multiple attached copies stack. It expires after
 // this turn even though the damage effect has resolved.
 {
  const g=game(v),p=player(g,0);p.active=unit(v.buzz,[v.lightning,v.fire]);
  p.hand=[v.plus,v.plus];player(g,1).active=unit('base1-3');
  act(g,0,'play_trainer',{handIndex:0});act(g,0,'play_trainer',{handIndex:0});
  assert.equal(player(g,0).active.attachedTrainers.filter(t=>CATALOG.get(t.id).name==='PlusPower').length,2);
  setCoin(g,false);act(g,0,'attack',{attackIndex:1});
  assert.equal(player(g,1).active.damage,50,'30 base plus 20 from two PlusPowers');
  assert.equal(player(g,0).active.damage,30,'10 self-damage plus 20 from two PlusPowers');
  assert.equal(player(g,0).active.attachedTrainers.some(t=>CATALOG.get(t.id).name==='PlusPower'),false,'PlusPower expires at end of turn');
  assert.equal(player(g,0).discard.filter(id=>id===v.plus).length,2);
  scenarios++;
 }

 // The post-Weakness/Resistance condition matters: if Resistance reduces
 // Thunderpunch's 30 to 0, PlusPower adds nothing to that opponent Pokémon,
 // but still boosts Thunderpunch's separately dealt self-damage.
 {
  const g=game(v),p=player(g,0);p.active=unit(v.buzz,[v.lightning,v.fire]);
  p.hand=[v.plus];player(g,1).active=unit('base1-47');
  act(g,0,'play_trainer',{handIndex:0});setCoin(g,false);act(g,0,'attack',{attackIndex:1});
  assert.equal(player(g,1).active.damage,0,'Lightning Resistance reduces the attack to zero before PlusPower is checked');
  assert.equal(player(g,0).active.damage,20,'the positive recoil is independently boosted after self Weakness/Resistance');
  scenarios++;
 }

 // Heads has no self-damage to boost, while the 40 attack damage receives
 // the normal +10. This also guards against PlusPower causing false recoil.
 {
  const g=game(v),p=player(g,0);p.active=unit(v.buzz,[v.lightning,v.fire]);
  p.hand=[v.plus];player(g,1).active=unit('base1-3');
  act(g,0,'play_trainer',{handIndex:0});setCoin(g,true);act(g,0,'attack',{attackIndex:1});
  assert.equal(player(g,1).active.damage,50,'heads gives 40 attack damage plus PlusPower');
  assert.equal(player(g,0).active.damage,0);
  scenarios++;
 }

 // WotC's damage chart places PlusPower before the Defending Pokémon's
 // Power. Thus Kabuto halves the boosted 20 to 10; applying Kabuto first
 // incorrectly reduces the unboosted 10 to zero.
 {
  const g=game(v),p=player(g,0);p.active=unit('base1-58',['base1-96']);
  p.hand=[v.plus];player(g,1).active=unit('base3-50');
  act(g,0,'play_trainer',{handIndex:0});act(g,0,'attack',{attackIndex:0});
  assert.equal(player(g,1).active.damage,10,'PlusPower precedes Kabuto Armor');
  scenarios++;
 }
}

console.log(`PASS PlusPower Base/Base Set 2 erratum, damage ordering, recoil, and expiry (${scenarios} reducer scenarios)`);
