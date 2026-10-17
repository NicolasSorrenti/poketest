'use strict';
const assert=require('node:assert/strict');
const {CATALOG,createGame,reduce,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {compile}=require('./attack_effects_core');
const F='base1-97',W='base1-102',P='base1-101',L='base1-100';
const deck=[...Array(4).fill('base1-7'),...Array(4).fill('base1-61'),...Array(4).fill('base1-52'),...Array(4).fill('base1-41'),...Array(4).fill('base1-91'),...Array(4).fill('base1-94'),...Array(4).fill('base1-93'),...Array(4).fill('base1-95'),...Array(4).fill('base1-92'),...Array(24).fill(F)];
function unit(id,energies=[]){return {id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0};}
function ready(a,b,payment,oppEnergy=[]){const g=createGame({decks:[deck,deck],seed:19});g.phase='game';g.setupReady=[true,true];g.players.forEach((p,i)=>{
 p.active=unit(i?b:a,i?oppEnergy:payment);p.bench=[unit('base1-61'),unit('base1-52')];p.prizes=Array(6).fill('base1-91');p.hand=[];p.deck=Array(20).fill(F);p.discard=[];p.energyUsed=false;
});return g;}
function exec(g,side,type,payload={}){const out=applyCommand(g,side,{type,payload});assert.ok(out.ok,`${type}: ${out.error}`);return g;}
function reject(g,side,type,payload,pattern){const snapshot=JSON.stringify(g),result=reduce(g,side,{type,payload});assert.equal(result.ok,false);if(pattern)assert.match(result.error,pattern);assert.equal(JSON.stringify(g),snapshot);}
function choose(g,idx=0,side=g.pendingDecision.actor){assert.ok(g.pendingDecision);return exec(g,side,'choose',{decisionId:g.pendingDecision.id,selected:[g.pendingDecision.options[idx].id]});}
let scenarios=0;
{
 // Lightning Energy pays Pikachu's Spark. The defender takes active
 // damage; the attacker's choice hits exactly one enemy Bench slot.
 const g=ready('base2-60','base1-7',[L,L]);
 exec(g,0,'attack',{attackIndex:0});assert.equal(g.turn,0);assert.equal(g.pendingDecision.actor,0);
 assert.equal(publicView(g,1).pendingDecision.options,undefined);
 reject(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['bench:0']},/another player/);
 reject(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['bench:9']},/Invalid option/);
 choose(g,1);assert.equal(g.players[1].active.damage,20);
 assert.equal(g.players[1].bench[0].damage,0);assert.equal(g.players[1].bench[1].damage,10);
 assert.equal(g.turn,1);assert.equal(g.pendingDecision,null);scenarios++;
}
{
 // Stretch Kick ignores Weakness/Resistance on Bench, has no Active damage.
 const g=ready('base3-7','base1-7',[F,F]);g.players[1].bench=[unit('base1-61'),unit('base1-52')];
 exec(g,0,'attack',{attackIndex:0});choose(g,0);
 assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].bench[0].damage,20);scenarios++;
}
{
 // Benched Pokemon knockout gives a Prize without requiring promotion.
 const g=ready('base3-7','base1-7',[F,F]);g.players[1].bench[0].damage=20;const before=g.players[0].prizes.length;
 exec(g,0,'attack',{attackIndex:0});choose(g,0);
 assert.equal(g.players[1].bench.length,1);assert.equal(g.players[1].discard.includes('base1-61'),true);
 assert.equal(g.players[0].prizes.length,before-1);assert.equal(g.players[1].active.id,'base1-7');
 assert.equal(g.pendingDecision,null);scenarios++;
}
{
 // Earthquake damages only the attacker's Bench, no weakness applied.
 const g=ready('base1-19','base1-56',[F,F,F,F]);
 exec(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,70);
 assert.deepEqual(g.players[0].bench.map(x=>x.damage),[10,10]);assert.deepEqual(g.players[1].bench.map(x=>x.damage),[0,0]);scenarios++;
}
{
 // Selfdestruct damages both Benches simultaneously, KOs the attacker,
 // and can award multiple Prizes before the defender picks replacement.
 const g=ready('base1-9','base1-7',[L,L,F,F]);
 g.players[0].bench=[unit('base1-61')];g.players[1].bench=[unit('base1-61'),unit('base1-52')];
 g.players[1].bench[0].damage=20;g.players[0].bench[0].damage=20;
 const old0=g.players[0].prizes.length,old1=g.players[1].prizes.length;
 exec(g,0,'attack',{attackIndex:1});
 assert.equal(g.players[0].prizes.length,old0-2,'Opposing active and Bench each yield a Prize');
 assert.equal(g.players[1].prizes.length,old1-2,'Attacker and own Benched Pokemon both yield a Prize');
 assert.equal(g.over,true,'Simultaneous KOs with one side out of Pokémon cause a game end');scenarios++;
}
{
 // Whirlwind deals damage FIRST; defender chooses during attacker's turn.
 const g=ready('base1-22','base1-7',[F,F]);
 exec(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);
 assert.equal(g.pendingDecision.actor,1);assert.equal(g.turn,0);
 reject(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['bench:0']},/another player/);
 choose(g,1);assert.equal(g.players[1].active.id,'base1-52');
 assert.equal(g.players[1].bench[1].id,'base1-7');assert.equal(g.players[1].bench[1].damage,20);
 assert.equal(g.turn,1);scenarios++;
}
{
 // If Whirlwind KOs the active, there is no redundant Whirlwind choice:
 // the defender selects the replacement Active through the KO queue.
 const g=ready('base1-22','base1-61',[F,F]);g.players[1].active.damage=20;
 exec(g,0,'attack',{attackIndex:0});assert.equal(g.pendingAction.kind,'promote');
 assert.equal(g.pendingDecision.actor,1);choose(g,0);assert.equal(g.turn,1);scenarios++;
}
{
 // Lure's choice belongs to the attacker; no damage to outgoing target.
 const g=ready('base1-12','base1-7',[F,F]);
 exec(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,0);
 choose(g,1);assert.equal(g.players[1].active.id,'base1-52');assert.equal(g.players[1].bench[1].id,'base1-7');
 assert.equal(g.players[1].bench[1].damage,0);scenarios++;
}
{
 // Exeggutor Teleport switches own Active and removes conditions from prior unit.
 const g=ready('base2-35','base1-7',[P]);g.players[0].active.poison=true;
 exec(g,0,'attack',{attackIndex:0});choose(g,0);assert.equal(g.players[0].active.id,'base1-61');
 assert.equal(g.players[0].bench[0].id,'base2-35');assert.equal(g.players[0].bench[0].poison,false);scenarios++;
}
{
 // Blizzard coin choice spreads Bench damage to the correct team; no W/R.
 const g=ready('base3-2','base1-7',[W,W,W,W]);g.rngState=1000;
 exec(g,0,'attack',{attackIndex:1});assert.deepEqual(g.players[1].bench.map(x=>x.damage),[10,10]);
 assert.deepEqual(g.players[0].bench.map(x=>x.damage),[0,0]);scenarios++;
 const h=ready('base3-2','base1-7',[W,W,W,W]);h.rngState=0;
 exec(h,0,'attack',{attackIndex:1});assert.deepEqual(h.players[0].bench.map(x=>x.damage),[10,10]);
 assert.deepEqual(h.players[1].bench.map(x=>x.damage),[0,0]);scenarios++;
}
{
 // A status-blocked attacker never opens a target prompt or mutates state.
 const g=ready('base2-60','base1-7',[L,L]);g.players[0].active.status='Asleep';
 reject(g,0,'attack',{attackIndex:0},/Special Condition/);assert.equal(g.pendingDecision,null);scenarios++;
}
{
 // A single forced-switch target is selected automatically, avoiding a softlock.
 const g=ready('base1-22','base1-7',[F,F]);g.players[1].bench=[unit('base1-61')];
 exec(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.id,'base1-61');
 assert.equal(g.pendingDecision,null);assert.equal(g.turn,1);scenarios++;
}
{
 // Charmander Ember: attack cost is checked BEFORE additional printed discard.
 // The user chooses which attached Energy to pay, and the attack commits once.
 const fire='base1-98',g=ready('base1-46','base1-7',[fire,fire,F]);
 exec(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.actor,0);
 assert.equal(g.pendingDecision.options.length,3);
 const original=g.pendingDecision.id;
 reject(g,0,'choose',{decisionId:original,selected:['energy:0','energy:1']},/selection/i);
 exec(g,0,'choose',{decisionId:original,selected:['energy:2']});
 assert.deepEqual(g.players[0].active.energies,[fire,fire]);
 assert.equal(g.players[0].discard.includes(F),true);
 assert.equal(g.players[1].active.damage,30);assert.equal(g.turn,1);scenarios++;
}
{
 // Energy payment can't bypass the mandatory printed attack Energy cost.
 const fire='base1-98',g=ready('base1-46','base1-7',[fire]);
 reject(g,0,'attack',{attackIndex:1},/Insufficient attack Energy/);scenarios++;
}
{
 // Firestorm selects precisely three Fire cards, excluding unrelated Energy.
 // 4 Fire meet the attack cost; the opponent sees only a private prompt.
 const fire='base1-98',g=ready('gym2-1','base1-56',[fire,fire,fire,fire,F]);
 exec(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.min,3);
 assert.equal(g.pendingDecision.max,3);assert.equal(g.pendingDecision.options.length,4);
 reject(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['energy:0','energy:1']},/selection/i);
 const id=g.pendingDecision.id;
 exec(g,0,'choose',{decisionId:id,selected:['energy:0','energy:1','energy:2']});
 assert.deepEqual(g.players[0].active.energies,[fire,F]);
 assert.equal(g.players[0].discard.filter(x=>x===fire).length,3);
 assert.equal(g.players[1].discard.includes('base1-56'),true);
 assert.equal(g.pendingAction.kind,'promote');assert.equal(g.pendingDecision.actor,1);
 choose(g,0);assert.equal(g.turn,1);scenarios++;
}
{
 // Neo Destiny Vulpix uses the printed 'this Pokémon' wording.
 const fire='base1-98',g=ready('neo4-91','base1-7',[fire,F]);
 exec(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.options.length,2);
 choose(g,1);assert.deepEqual(g.players[0].active.energies,[fire]);
 assert.equal(g.players[1].active.damage,30);scenarios++;
}
const all=[...CATALOG.values()].flatMap(c=>(c.attacks||[]).map(a=>({card:c,attack:a,program:compile(a)})));
const migrated=all.filter(x=>['bench-target','bench-own','bench-both-recoil','bench-splash-coin','switch-defender','switch-attacker','switch-self','energy-discard'].includes(x.program?.kind));
assert.equal(migrated.length,64);
console.log(`PASS targeted/Bench/switch milestone: ${scenarios} full command paths, ${migrated.length} newly recognized historical attacks, private defender choices, KO Prize attribution, atomic invalid actions`);
