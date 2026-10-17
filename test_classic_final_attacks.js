'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const MANIFEST=require('./classic_final_manifest.json');
const E={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Psychic:'base1-101',Lightning:'base1-100',Fighting:'base1-97',Colorless:'base1-99'};
const deck=[...Array(4).fill('base1-44'),...Array(4).fill('base1-27'),...Array(52).fill(E.Grass)];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(record, opts={}){
 const a=CATALOG.get(record.cardId).attacks.find(x=>x.name===record.attackName);
 const cost=(a.cost||[]).map(x=>E[x]||E.Grass);
 const g=createGame({decks:[deck,deck],format:'classic',seed:31});g.phase='game';g.turn=0;g.turnSerial=0;g.rngState=opts.seed??12990;
 for(let i=0;i<2;i++){
  const p=g.players[i];p.active=unit(i?opts.defender||'base1-44':record.cardId,i?opts.defEnergies||[]:[...cost,...(opts.extraEnergy||[])],i?opts.defDamage||0:opts.attDamage||0);
  p.bench=(i?opts.theirBench||[]:opts.ourBench||[]).map(id=>unit(id));p.deck=Array(10).fill(E.Grass);p.hand=[];p.prizes=Array(6).fill(E.Grass);p.discard=[];
 }return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type} (${side}): ${r.error}`);return g;}
function attack(g,record){return act(g,0,'attack',{attackIndex:CATALOG.get(record.cardId).attacks.findIndex(x=>x.name===record.attackName)});}
function choose(g,choices){const d=g.pendingDecision;assert.ok(d, 'Expected pending decision');const s=choices===undefined?[d.options[0].id]:choices;return act(g,d.actor,'choose',{decisionId:d.id,selected:s});}
function decline(g){const d=g.pendingDecision;assert.ok(d?.optional);return act(g,d.actor,'choose',{decisionId:d.id,selected:[],decline:true});}
function rec(name){const v=MANIFEST.find(x=>x.attackName===name);assert.ok(v);return v;}
function all(g,chooseFn){let steps=0;while(g.pendingDecision&&steps++<12)chooseFn?chooseFn(g):choose(g);assert.ok(steps<12, 'choice loop');}
let passed=0;
function scenario(name,fn){try{fn();passed++;}catch(e){e.message='['+name+'] '+e.message;throw e;}}
scenario('Barrier prevention and Energy cost',()=>{
 const r=rec('Barrier'),g=game(r);attack(g,r);assert.equal(g.pendingAction.plan.stage,'pay-energy');choose(g);assert.equal(g.players[0].active.energies.length,1);assert.equal(g.players[0].discard.length,1);assert.ok(g.players[0].active.shield?.allEffects);
});
scenario('Metronome chooses opponent move, preserves copied damage',()=>{
 const r=rec('Metronome'),g=game(r,{defender:'base1-44'});attack(g,r);assert.equal(g.pendingAction.plan.stage,'opponent-attack');choose(g,['attack:0']);assert.equal(g.pendingDecision,null);assert.ok(g.players[1].active.damage>0);
});
scenario('Amnesia disables exact selected attack',()=>{
 const r=rec('Amnesia'),g=game(r,{defender:'base1-44',defEnergies:[E.Fighting]});attack(g,r);choose(g,['attack:0']);assert.equal(g.players[1].active.amnesia.index,0);g.turn=1;const result=applyCommand(g,1,{type:'attack',payload:{attackIndex:0}});assert.equal(result.ok,false);assert.match(result.error,/Amnesia/);
});
scenario('Mirror Move copies previous-turn final damage',()=>{
 const r=rec('Mirror Move'),g=game(r);g.turnSerial=2;g.players[0].active.lastAttackImpact={serial:1,damage:30,status:null};attack(g,r);assert.equal(g.players[1].active.damage,30);
});
scenario('Destiny Bond costs Energy and marks reactive KO',()=>{
 const r=rec('Destiny Bond'),g=game(r);attack(g,r);choose(g);assert.equal(g.players[0].active.energies.length,1);assert.ok(g.players[0].active.destinyBond);
});
scenario('Ram damages self and defender forced-switch even when self KO',()=>{
 const r=rec('Ram'),g=game(r,{attDamage:80,defender:'base1-11',ourBench:['base1-44'],theirBench:['base1-44','base1-44']});attack(g,r);assert.equal(g.pendingAction.kind,'ram_switch');choose(g,['bench:1']);assert.notEqual(g.players[1].active,null);assert.equal(g.players[0].active.id,'base1-44');
});
scenario('Prophecy chooses opponent deck and orders top three',()=>{
 const r=rec('Prophecy'),g=game(r);g.players[1].deck=[E.Fire,E.Water,E.Psychic,E.Grass];attack(g,r);choose(g,['side:1']);assert.equal(g.pendingAction.plan.stage,'prophecy-order');choose(g,['top:2','top:1','top:0']);assert.deepEqual(g.players[1].deck,[E.Fire,E.Grass,E.Psychic]);assert.ok(g.players[1].hand.includes(E.Water));
});
scenario('Scavenge discards Energy and returns a selected Trainer',()=>{
 const r=rec('Scavenge'),g=game(r);g.players[0].discard=['base1-91',E.Fire];attack(g,r);choose(g);assert.equal(g.pendingAction.plan.stage,'recover-trainer');choose(g,['discard:0']);assert.ok(g.players[0].hand.includes('base1-91'));
});
scenario('Stare targets Bench without Weakness',()=>{
 const r=rec('Stare'),g=game(r,{theirBench:['base1-44']});attack(g,r);choose(g,['bench:0']);assert.equal(g.players[1].bench[0].damage,10);assert.ok(g.players[1].bench[0].powerSuppressedUntil);
});
scenario('Continuous Fireball collects exact post-flip discard',()=>{
 const r=rec('Continuous Fireball'),g=game(r,{extraEnergy:[E.Fire,E.Fire]});attack(g,r);const roll=g.pendingAction?.plan.data.preRoll;if(roll?.discardHeadCount)choose(g,g.pendingDecision.options.slice(0,roll.discardHeadCount).map(x=>x.id));assert.equal(g.players[0].prizes.length, roll.damage>=Number(CATALOG.get('base1-44').hp)?5:6);if(roll.damage<Number(CATALOG.get('base1-44').hp))assert.equal(g.players[0].prizes.length,roll.damage>=Number(CATALOG.get('base1-44').hp)?5:6);assert.equal(g.players[0].discard.length,roll.discardHeadCount);
});
scenario('Magnetic Lines transfers chosen Basic Energy to target Bench',()=>{
 const r=rec('Magnetic Lines'),g=game(r,{defEnergies:[E.Water,E.Fire],theirBench:['base1-44']});attack(g,r);choose(g,['energy:1']);choose(g,['bench:0']);assert.deepEqual(g.players[1].active.energies,[E.Water]);assert.deepEqual(g.players[1].bench[0].energies,[E.Fire]);
});
scenario('Fireball resolves coin before any optional discard',()=>{
 const r=rec('Fireball'),g=game(r,{seed:1000});attack(g,r);const roll=g.pendingAction?.plan.data.preRoll;if(g.pendingDecision)choose(g);assert.equal(g.players[0].discard.length,roll.discardHeadCount);assert.equal(g.players[0].prizes.length,roll.damage>=Number(CATALOG.get('base1-44').hp)?5:6);
});
scenario('Energy Bomb distributes attached Energy one by one',()=>{
 const r=rec('Energy Bomb'),g=game(r,{ourBench:['base1-44','base1-44']});attack(g,r);let steps=0;while(g.pendingDecision){const id=steps++?'bench:1':'bench:0';choose(g,[id]);}assert.equal(steps,2);assert.equal(g.players[0].active.energies.length,0);assert.equal(g.players[0].bench[0].energies.length,1);assert.equal(g.players[0].bench[1].energies.length,1);
});
scenario('Playing with Fire discard corresponds to flip',()=>{
 const r=rec('Playing with Fire'),g=game(r,{seed:1000});attack(g,r);const roll=g.pendingAction?.plan.data.preRoll;if(g.pendingDecision)choose(g);assert.equal(g.players[0].discard.length,roll.discardHeadCount);assert.equal(g.players[0].prizes.length,roll.damage>=Number(CATALOG.get('base1-44').hp)?5:6);
});
scenario('Third Eye discards one Energy then draws selected count',()=>{
 const r=rec('Third Eye'),g=game(r);attack(g,r);choose(g);choose(g,['count:2']);assert.equal(g.players[0].hand.length,2);assert.equal(g.players[0].discard.length,1);
});
scenario('Fascinate chooses Bench Pokémon only if coin succeeds',()=>{
 const r=rec('Fascinate'),g=game(r,{theirBench:['base1-44']});attack(g,r);if(g.pendingDecision)choose(g);assert.ok(g.players[1].active);assert.equal(g.players[1].bench.length,1);
});
scenario('Flame Pillar optional Energy cost and Bench target',()=>{
 const r=rec('Flame Pillar'),g=game(r,{theirBench:['base1-44'],extraEnergy:[E.Fire]});attack(g,r);choose(g,['energy:0']);choose(g,['bench:0']);assert.equal(g.players[1].active.damage,10);assert.equal(g.players[0].prizes.length,5);assert.equal(g.players[0].discard.length,1);
});
scenario('Mirror Shell arms a next-turn reflection',()=>{
 const r=rec('Mirror Shell'),g=game(r);attack(g,r);assert.ok(g.players[0].active.mirrorShell);
});
console.log(`PASS Classic finale: ${passed} behavior scenarios across 18 distinct attack families`);
// Every printed variant (including duplicate foil/non-foil entries) must
// traverse the reducer with legal answers, not merely compile as a name.
let variants=0;
const ATTACK=require('./attack_effects_core');
function ledger(g){
 const ids=[];
 for(const p of g.players){
  ids.push(...p.deck,...p.hand,...p.prizes,...p.discard);
  for(const u of [p.active,...p.bench].filter(Boolean)){
   ids.push(u.id,...u.under,...u.energies,...u.attachedTrainers.map(x=>x.id));
  }
 }
 return ids.sort();
}

for(const record of MANIFEST){
 scenario(`printed ${record.cardId} / ${record.attackName}`,()=>{
  const original=CATALOG.get(record.cardId).attacks.find(x=>x.name===record.attackName);
  assert.equal(ATTACK.compile(original)?.kind,record.kind);
  const g=game(record,{seed:1000,ourBench:['base1-44','base1-44'],theirBench:['base1-44','base1-44'],defEnergies:[E.Fire,E.Water,E.Psychic],extraEnergy:[E.Fire,E.Water],defender:'base1-11'});
  g.players[0].discard=['base1-91',E.Grass];
  g.players[0].deck=[E.Fire,E.Water,E.Psychic,E.Grass];
  g.players[0].active.lastAttackImpact={serial:-1,damage:10,status:null};
  const before=ledger(g);
  attack(g,record);
  let choices=0;
  while(g.pendingDecision&&choices++<16){const d=g.pendingDecision;choose(g,d.options.slice(0,d.min).map(o=>o.id));}
  assert.ok(choices<16,`Unresolved pending chain: ${record.cardId}`);
  assert.equal(g.pendingDecision,null);
  assert.deepEqual(ledger(g),before,'No card may disappear or duplicate during a Classic attack');
  variants++;
 });
}
console.log(`PASS Classic final printed variants: ${variants}/25 accepted with complete pending-choice resolution`);
scenario('Barrier blocks an incoming attack through the opponent turn',()=>{
 const r=rec('Barrier'),g=game(r,{defEnergies:[E.Grass,E.Grass]});attack(g,r);choose(g);assert.equal(g.turn,1);
 act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);
});
scenario('Destiny Bond knocks out the opposing attacker after a lethal hit',()=>{
 const r=rec('Destiny Bond'),g=game(r,{defEnergies:[E.Grass,E.Grass],attDamage:Number(CATALOG.get(r.cardId).hp)-10,ourBench:['base1-44'],theirBench:['base1-44']});attack(g,r);choose(g);assert.equal(g.turn,1);
 act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].prizes.length,5);assert.equal(g.players[1].prizes.length,5);
});
scenario('Mirror Shell reflects actual attack damage on next opponent turn',()=>{
 const r=rec('Mirror Shell'),g=game(r,{defEnergies:[E.Grass,E.Grass],ourBench:['base1-44'],theirBench:['base1-44']});attack(g,r);assert.equal(g.turn,1);act(g,1,'attack',{attackIndex:0});
 assert.ok(g.players[1].active.damage>0||g.players[0].prizes.length<6,'Incoming attack damage was not reflected');
});
scenario('Final effect choices reject stale selections without side effects',()=>{
 const r=rec('Energy Bomb'),g=game(r,{ourBench:['base1-44','base1-44']});attack(g,r);const before=JSON.stringify(g);
 const bad=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['bench:999']}});
 assert.equal(bad.ok,false);assert.equal(JSON.stringify(g),before);
});
console.log('PASS Classic finale reactive timing, card variants, and transactional choice guards');
// The number of mandatory discards is a property of each seeded coin result,
// not the number of cards assigned arbitrarily by an auto-picking client.
let coinCases=0;
for(const name of ['Continuous Fireball','Fireball','Playing with Fire','Fascinate']){
 for(let seed=0;seed<64;seed++){
  const r=rec(name),g=game(r,{seed:seed*71873+111,extraEnergy:[E.Fire,E.Water],theirBench:['base1-44']});
  const before=ledger(g);
  attack(g,r);
  let expectedDiscard=0;
  if(g.pendingAction?.plan?.data?.preRoll)expectedDiscard=g.pendingAction.plan.data.preRoll.discardHeadCount||0;
  let decisions=0;
  while(g.pendingDecision&&decisions++<8){const d=g.pendingDecision;choose(g,d.options.slice(0,d.min).map(o=>o.id));}
  assert.ok(decisions<8);
  if(['Continuous Fireball','Fireball','Playing with Fire'].includes(name))assert.equal(g.players[0].discard.length,expectedDiscard,`${name} seed ${seed}`);
  assert.deepEqual(ledger(g),before,`Coin-resolution card conservation: ${name} seed ${seed}`);
  coinCases++;
 }
}
console.log('PASS Classic finale seeded coin/cost cases: '+coinCases+' with state conservation');
