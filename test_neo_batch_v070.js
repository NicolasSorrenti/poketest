'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=(id,e={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...e});
function game(witness=true){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:172});
 g.phase='game';g.round=7;g.turn=1;g.turnSerial=30;g.rngState=4567;
 g.players[0].active=U('base1-3',{energies:['base1-99']});
 g.players[0].bench=witness?[U('neo2-11',{energies:['base1-99','base1-99']})]:[U('base1-46')];
 g.players[1].active=U('base1-4',{energies:Array(5).fill('base1-98')});
 g.players[1].bench=[U('base1-58')];
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(15).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choose(g,ids){const d=g.pendingDecision;assert.ok(d);send(g,d.actor,'choose',{decisionId:d.id,selected:ids??d.options.slice(0,d.min).map(x=>x.id)});}
function priorFireSpin(g){
 assert.equal(CATALOG.get('base1-4').attacks[0].name,'Fire Spin');
 send(g,1,'attack',{attackIndex:0});
 assert.ok(g.pendingDecision,'Fire Spin requires two additional Energy discards');
 choose(g,g.pendingDecision.options.slice(0,2).map(o=>o.id));
 assert.equal(g.pendingDecision,null);
 assert.equal(g.players[0].active.damage,100,'Charizard dealt printed damage, Chansey survived');
 assert.equal(g.turn,0,'Defending Smeargle player acts next');
 assert.equal(g.players[1].active.energies.length,3,'Charizard paid Fire Spin cost');
}
{
 const g=game(true);priorFireSpin(g);
 assert.equal(g.players[0].bench[0].neo50Observed?.serial,30,'Benched Smeargle witnessed real prior attack');
 assert.equal(g.players[1].active.neo50LastAttack?.attack.name,'Fire Spin');
 send(g,0,'retreat',{slot:0});
 assert.equal(g.players[0].active.id,'neo2-11');
 assert.equal(g.players[0].active.energies.length,2);
 send(g,0,'attack',{attackIndex:0});
 assert.equal(g.players[1].active.damage,100,'Sketch copied Fire Spin damage despite zero Fire Energy');
 assert.equal(g.players[0].active.energies.length,2,'Sketch waives any extra Energy discards');
 assert.equal(g.players[0].discard.filter(x=>x==='base1-99').length,1,'Only Chansey retreat Energy was paid');
}
{
 const g=game(false);priorFireSpin(g);
 g.players[0].hand=['neo2-11'];send(g,0,'bench',{handIndex:0});
 const newSmeargle=g.players[0].bench.find(x=>x.id==='neo2-11');
 assert.equal(newSmeargle.neo50Observed,undefined);
 newSmeargle.energies=['base1-99','base1-99']; // Isolate witness legality from Sketch's printed two-unit cost.
 send(g,0,'retreat',{slot:1});
 const before=g.players[1].active.damage;
 send(g,0,'attack',{attackIndex:0});
 assert.equal(g.players[1].active.damage,before,'Newly Benched Smeargle cannot copy an attack it did not witness');
}
{
 const g=game(true);priorFireSpin(g);
 // Switching the opponent's attacking Pokémon invalidates Sketch's
 // Defending Pokémon requirement even though Smeargle was present.
 const old=g.players[1].active;g.players[1].active=g.players[1].bench.splice(0,1,old)[0];
 send(g,0,'retreat',{slot:0});send(g,0,'attack',{attackIndex:0});
 assert.equal(g.players[1].active.damage,0,'Sketch never copies a Benched previous attacker');
}
{
 const g=game(true);priorFireSpin(g);
 // Real turn boundary, but attacker history is too old. The witness
 // remains on the same Smeargle; this cannot resurrect an old attack.
 g.turnSerial+=2;
 send(g,0,'retreat',{slot:0});send(g,0,'attack',{attackIndex:0});
 assert.equal(g.players[1].active.damage,0,'Sketch only reads immediately previous turn');
}
console.log('PASS v0.70: actual Sketch history, Bench witnesses, ignored extra Fire Spin cost, late Smeargle and switched/old attacker');
