'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const energy={Grass:'base1-99',Psychic:'base1-101',Water:'base1-102',Fire:'base1-98',Fighting:'base1-97'};
const deck=[...Array(4).fill('base1-44'),...Array(4).fill('base1-27'),...Array(52).fill(energy.Grass)];
const unit=(id,en=[],damage=0)=>({id,under:[],energies:[...en],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(attacker,defender='base1-11',en=[],options={}){
 const g=createGame({decks:[deck,deck],format:'classic',seed:3});g.phase='game';g.turn=0;g.turnSerial=0;g.rngState=options.rngState??1000;
 g.players.forEach((p,i)=>{
  p.active=unit(i?defender:attacker,i?options.defEnergy||[]:en,i?options.defDamage||0:options.selfDamage||0);
  p.bench=(i?options.theirBench||[]:options.ourBench||[]).map(x=>unit(x));
  p.hand=[];p.prizes=Array(6).fill(energy.Grass);p.discard=[];p.deck=Array(12).fill(energy.Grass);
 });return g;
}
function act(g,side,type,payload){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return g;}
function attack(g,i){return act(g,0,'attack',{attackIndex:i});}
function choice(g,side,selected=[],decline=false){const d=g.pendingDecision;assert.ok(d);return act(g,side,'choose',{decisionId:d.id,selected,decline});}
function rejected(g,side,type,payload,regex){const before=JSON.stringify(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false);assert.match(r.error,regex);assert.equal(JSON.stringify(g),before);}
let n=0;
{
 const g=game('base2-8','base1-11',Array(3).fill(energy.Grass),{defEnergy:[energy.Grass,energy.Water],theirBench:['base1-44']});
 attack(g,1);
 assert.equal(g.players[1].active.id,'base1-44');assert.equal(g.players[1].bench.length,0);
 for(const id of ['base1-11',energy.Grass,energy.Water])assert.ok(g.players[1].hand.includes(id),id);
 assert.equal(g.players[1].prizes.length,6);n++;
}
{
 const g=game('base5-10','base1-11',[energy.Fighting,energy.Fighting,energy.Fighting,energy.Grass],{defEnergy:[energy.Grass,energy.Water],theirBench:['base1-44']});
 attack(g,1);assert.equal(g.players[1].active.id,'base1-44');
 assert.equal(g.players[1].deck.includes('base1-11'),true);assert.equal(g.players[1].prizes.length,6);n++;
}
{
 const g=game('base5-40','base1-11',[energy.Fighting,energy.Fighting,energy.Grass],{theirBench:['base1-44']});
 attack(g,0);assert.equal(g.pendingDecision,null,'Drag Off should auto-select the only opposing Benched Pokémon');
 assert.equal(g.players[1].active.id,'base1-44');assert.equal(g.players[1].bench[0].id,'base1-11');
 assert.equal(g.players[1].active.damage,20);n++;
}
{
 const g=game('base3-53','base1-11',[energy.Psychic]);
 attack(g,0);assert.equal(g.players[1].trainerLockedUntil,2);
 g.players[1].hand=['base1-91'];
 rejected(g,1,'play_trainer',{handIndex:0},/blocked/);n++;
}
{
 const g=game('base5-14','base1-11',[energy.Grass,energy.Grass],{ourBench:['base1-58'],theirBench:['base1-58']});
 // Use Koffing explicitly to test both-player splash.
 const koffing=[...CATALOG.values()].find(c=>c.name==='Koffing'&&c.id.startsWith('base1-'));
 assert.ok(koffing);
 g.players[0].bench[0].id=koffing.id;g.players[1].bench[0].id=koffing.id;
 attack(g,0);
 assert.equal(g.players[1].active.damage,60); // Dark Weezing plus 2 Koffing = 3 × 20
 assert.equal(g.players[0].active.damage,20);
 assert.equal(g.players[0].bench[0].damage,20);assert.equal(g.players[1].bench[0].damage,20);n++;
}
{
 const g=game('base3-12','base1-11',[energy.Fire,energy.Fire,energy.Fire]);
 attack(g,0);assert.equal(g.pendingAction?.kind,'attack_fire_mill');
 choice(g,0,['energy:0','energy:2']);
 assert.equal(g.players[0].active.energies.length,1);assert.equal(g.players[0].discard.length,2);
 assert.equal(g.players[1].deck.length,9);n++;
}
{
 const g=game('base3-33','base1-11',[energy.Psychic,energy.Psychic]);g.players[0].discard=[energy.Water,'base1-91',energy.Psychic];
 attack(g,1);assert.equal(g.pendingAction?.kind,'attack_discard_recover');
 choice(g,0,['discard:0','discard:2']);
 assert.equal(g.players[0].hand.length,2);assert.deepEqual(g.players[0].discard,['base1-91']);
 assert.equal(g.players[0].active.damage,10);n++;
}
{
 const g=game('base1-39','base1-11',[energy.Grass,energy.Grass]);
 attack(g,0);assert.equal(g.pendingAction?.kind,'attack_color');choice(g,0,['type:Water']);
 assert.equal(g.players[1].active.weaknessOverride,'Water');n++;
}
{
 const g=game('base1-39','base1-11',[energy.Grass,energy.Grass]);
 attack(g,1);assert.equal(g.pendingAction?.kind,'attack_color');choice(g,0,['type:Fire']);
 assert.equal(g.players[0].active.resistanceOverride,'Fire');n++;
}
{
 const g=game('base5-47','base1-11',[energy.Water,energy.Water,energy.Water]);
 const gyarados=[...CATALOG.values()].find(c=>c.name==='Gyarados'&&c.id.startsWith('base1-'));
 assert.ok(gyarados);g.players[0].deck=['base1-99',gyarados.id,'base1-99'];attack(g,1);
 assert.equal(g.pendingAction?.kind,'attack_search_evolution');choice(g,0,['card:1']);
 assert.equal(g.players[0].active.id,gyarados.id);assert.deepEqual(g.players[0].active.under,['base5-47']);n++;
}
{
 const g=game('base5-67','base1-11',[energy.Grass]);g.players[0].deck=[energy.Grass,energy.Water];
 attack(g,0);assert.equal(g.pendingAction?.kind,'attack_search_energy');choice(g,0,['card:1']);
 assert.deepEqual(g.players[0].active.energies,[energy.Grass,energy.Water]);n++;
}
{
 const g=game('base5-49','base1-11',[energy.Psychic],{ourBench:['base1-44']});
 attack(g,0);assert.equal(g.players[0].active.id,'base1-44');
 assert.ok(g.players[0].deck.includes('base5-49'));assert.ok(g.players[0].discard.includes(energy.Psychic));n++;
}
{
 const seen=new Set();for(let seed=0;seed<100;seed++){
  const g=game('base3-47','base1-11',[energy.Fighting,energy.Fighting],{rngState:seed*1000});attack(g,0);
  seen.add(g.players[1].active?.damage||0);
 }
 assert.ok(seen.has(0)&&seen.has(10)&&[...seen].some(x=>x>=20),'Seeded coin flips must NOT alternate deterministically');n++;
}
console.log('PASS Classic advanced historical attack sequences: '+n+' complete action/choice/timing groups');
