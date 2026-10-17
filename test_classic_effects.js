'use strict';
const assert=require('node:assert/strict');
const {compile,resolve}=require('./attack_effects_core');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const energy='base1-97',psychic='base1-101',water='base1-102';const deck=[...Array(4).fill('base1-7'),...Array(4).fill('base1-44'),...Array(4).fill('base1-31'),...Array(4).fill('base1-35'),...Array(44).fill(energy)];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies,attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function scenario(attacker,defender,cost=[],attackerDamage=0,defenderDamage=0,bench=2){
 const g=createGame({decks:[deck,deck],format:'classic',seed:5});g.phase='game';g.players.forEach((p,i)=>{
 p.active=unit(i?defender:attacker,i?[energy]:cost,i?defenderDamage:attackerDamage);
 p.bench=Array.from({length:bench},(_,j)=>unit(j%2?'base1-44':'base1-7'));p.deck=Array(10).fill(energy);p.hand=[];p.prizes=Array(6).fill(energy);p.discard=[];
 });return g;
}
const action=(g,index)=>{const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:index}});assert.ok(r.ok,r.error);return g};
const probe=(cardId,attackName)=>{const attack=CATALOG.get(cardId).attacks.find(a=>a.name===attackName);assert.ok(attack);const effect=compile(attack);assert.ok(effect);return effect};
let cases=0;
{
 // Flat roll API must not fold variable damage into a static number.
 const p=probe('base1-31','Meditate');assert.equal(p.kind,'defender-counters');
 assert.equal(resolve(p,()=>true,{defenderCounters:3}).damage,50);cases++;
}
{
 const p=probe('base1-35','Flail');assert.equal(p.kind,'flail-counters');assert.equal(resolve(p,()=>true,{selfCounters:2}).damage,20);cases++;
}
{
 const p=probe('base1-34','Karate Chop');assert.equal(p.kind,'minus-counters');assert.equal(resolve(p,()=>true,{selfCounters:7}).damage,0);cases++;
}
{
 const p=probe('base2-16','Do the Wave');assert.equal(p.kind,'bench-count');assert.equal(resolve(p,()=>true,{benchCount:5}).damage,60);cases++;
}
{
 const p=probe('base1-20','Thunderpunch');assert.equal(p.kind,'coin-recoil-bonus');assert.equal(resolve(p,()=>true).damage,40);assert.equal(resolve(p,()=>false).selfDamage,10);cases++;
}
{
 const p=probe('base1-51','Foul Gas');assert.equal(p.kind,'coin-status-split');assert.equal(resolve(p,()=>true).status,'Poisoned');assert.equal(resolve(p,()=>false).status,'Confused');cases++;
}
{
 const p=probe('base5-11','Sonicboom');assert.equal(p.kind,'ignore-weakness');assert.equal(resolve(p,()=>true).ignoreWR,true);cases++;
}
{
 // In a real duel, Jynx Meditate includes defender damage counters, then W/R.
 const g=scenario('base1-31','base1-14',[psychic,psychic,energy],0,20);
 action(g,1);assert.equal(g.players[1].active.damage,60);cases++;
}
{
 // Magikarp's Flail scales with its own 20 damage (weakness applies afterward).
 const g=scenario('base1-35','base1-7',[water],20,0);
 action(g,1);assert.equal(g.players[1].active.damage,20);cases++;
}
{
 // State mutation remains atomic on insufficient Energy.
 const g=scenario('base1-31','base1-7',[]);const before=JSON.stringify(g);
 const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:1}});
 assert.equal(r.ok,false);assert.equal(JSON.stringify(g),before);cases++;
}
assert.equal(compile({damage:'40',text:'Choose an opponent Pokémon, do extra unknown stuff.'}),null);
console.log('PASS Classic effect families: '+cases+' targeted tests for variable damage, status split, recoil bonus, immunity and atomicity');
