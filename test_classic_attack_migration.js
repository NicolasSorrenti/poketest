'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {compile}=require('./attack_effects_core');
const energy={Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Grass:'base1-99',Fighting:'base1-97',Fire:'base1-98'};
const deck=[...Array(4).fill('base1-44'),...Array(4).fill('base1-27'),...Array(52).fill('base1-99')];
const pokemon=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function scenario(cardId,defender='base1-11',energies=[],opts={}){
 const g=createGame({format:'classic',seed:2,decks:[deck,deck]});g.phase='game';g.turn=0;g.turnSerial=0;
 g.players.forEach((p,s)=>{
  p.active=pokemon(s?defender:cardId,s?opts.defEnergy||[]:energies,s?opts.defDamage||0:opts.selfDamage||0);
  p.bench=(s?opts.theirBench:opts.ourBench||[])?.map(id=>pokemon(id))||[];
  p.prizes=Array(6).fill('base1-99');p.hand=[];p.deck=Array(12).fill('base1-99');p.discard=[];
 });g.rngState=opts.rngState??0;return g;
}
function act(g,side,type,payload){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type} failed: ${r.error}`);return g;}
function rejected(g,side,type,payload,regexp){const before=JSON.stringify(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false);assert.match(r.error,regexp);assert.equal(JSON.stringify(g),before);}
function attack(g,index=0){return act(g,0,'attack',{attackIndex:index});}
function choose(g,side,selected=[],decline=false){const d=g.pendingDecision;assert.ok(d,'Expected pending decision');return act(g,side,'choose',{decisionId:d.id,selected,decline});}
let passed=0;
// Program shapes are tied to printed wording and cannot compile partial text.
for(const [id,name,kind] of [
 ['base1-11','Toxic','toxic'],['base1-16','Thunderbolt','discard-all-self-energy'],['base1-27','Leek Slap','once-per-unit'],
 ['base1-29','Dream Eater','dream-eater'],['base1-32','Recover','recover-discard'],['base2-10','Swords Dance','swords-dance'],
 ['base2-12','Water Gun','extra-energy'],['base2-49','Call for Family','call-family'],['base3-14','Gigashock','bench-up-to-three'],
 ['base3-15','Thunderstorm','thunderstorm'],['base3-35','Hyper Beam','enemy-energy-removal'],
 ['base5-3','Rocket Tackle','recoil-coin-shield'],['base5-83','Surprise Thunder','surprise-thunder']
 ]){
 const a=CATALOG.get(id).attacks.find(x=>x.name===name);assert.equal(compile(a)?.kind,kind,`${id} ${name}`);passed++;
}
{
 const g=scenario('base1-11','base1-11',[energy.Grass,energy.Grass,energy.Grass]);attack(g,1);
 assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.poisonDamage,20);
 assert.ok(g.players[1].active.damage>=20);passed++;
}
{
 const g=scenario('base1-27','base1-11',[energy.Grass]);attack(g,0);
 assert.equal(g.players[0].active.leekSlapUsed,true);g.turn=0;
 rejected(g,0,'attack',{attackIndex:0},/already used/);passed++;
}
{
 const g=scenario('base1-29','base1-11',[energy.Psychic,energy.Psychic]);
 rejected(g,0,'attack',{attackIndex:1},/Asleep/);
 g.players[1].active.status='Asleep';attack(g,1);passed++;
}
{
 const g=scenario('base1-16','base1-44',Array(4).fill(energy.Lightning));attack(g,1);
 assert.equal(g.players[0].active.energies.length,0);assert.equal(g.players[0].discard.length,4);passed++;
}
{
 const g=scenario('base1-32','base1-11',[energy.Psychic,energy.Psychic,energy.Psychic],{selfDamage:40});attack(g,0);
 assert.equal(g.pendingAction?.kind,'attack_energy');const d=g.pendingDecision;
 rejected(g,0,'choose',{decisionId:d.id,selected:['energy:9']},/Invalid option/);
 choose(g,0,['energy:2']);assert.equal(g.players[0].active.damage,0);
 assert.equal(g.players[0].active.energies.length,2);assert.equal(g.players[0].discard.length,1);passed++;
}
{
 const g=scenario('base3-35','base1-11',[energy.Water,energy.Water,energy.Water],{defEnergy:[energy.Water,energy.Psychic]});attack(g,1);
 assert.equal(g.pendingAction?.kind,'attack_enemy_energy');choose(g,0,['energy:1']);
 assert.deepEqual(g.players[1].active.energies,[energy.Water]);assert.deepEqual(g.players[1].discard,[energy.Psychic]);passed++;
}
{
 const g=scenario('base2-49','base1-11',[energy.Grass]);g.players[0].deck=[energy.Grass,'base2-49',energy.Grass,'base2-49'];attack(g,1);
 assert.equal(g.pendingAction?.kind,'attack_family');
 choose(g,0,['card:3']);assert.equal(g.players[0].bench.length,1);assert.equal(g.players[0].bench[0].id,'base2-49');assert.equal(g.players[0].deck.length,3);passed++;
}
{
 const g=scenario('base3-14','base1-11',Array(4).fill(energy.Lightning),{theirBench:Array(5).fill('base1-27')});attack(g);
 assert.equal(g.pendingDecision?.min,3);const d=g.pendingDecision;
 rejected(g,0,'choose',{decisionId:d.id,selected:['bench:0','bench:1']},/number of selections/);
 choose(g,0,['bench:0','bench:2','bench:4']);
 assert.deepEqual(g.players[1].bench.map(u=>u.damage),[10,0,10,0,10]);passed++;
}
{
 const g=scenario('base2-10','base1-11',[energy.Grass,energy.Grass,energy.Grass]);attack(g,0);
 assert.equal(g.players[0].active.swordsDance,2);act(g,1,'end_turn',{});assert.equal(g.turn,0);attack(g,1);
 assert.equal(g.players[1].active.damage,60);passed++;
}
{
 const g=scenario('base2-12','base1-11',Array(5).fill(energy.Water));attack(g,1);
 assert.equal(g.players[1].active.damage,50);passed++;
}
{
 const g=scenario('base5-3','base1-11',[energy.Water,energy.Water,energy.Water],{rngState:1000});attack(g,1);
 assert.equal(g.players[0].active.damage,10);assert.equal(g.players[0].active.shield.preventDamage,true);passed++;
}
{
 const g=scenario('base3-15','base1-11',Array(4).fill(energy.Lightning),{theirBench:['base1-27','base1-27','base1-27']});attack(g);
 assert.equal(g.players[1].bench.length,3);assert.equal(g.players[1].bench.map(x=>x.damage).reduce((a,b)=>a+b,0),20);assert.equal(g.players[0].active.damage,20);passed++;
}
{
 const g=scenario('base5-83','base1-11',Array(3).fill(energy.Lightning),{theirBench:['base1-27','base1-27'],rngState:682});attack(g);
 assert.deepEqual(g.players[1].bench.map(u=>u.damage),[10,10]);passed++;
}
console.log(`PASS Classic expanded attack migration: ${passed} compilation and end-to-end command checks`);
