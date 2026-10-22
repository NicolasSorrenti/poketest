'use strict';
// Real authoritative reducer scenarios for newly migrated historical Pokémon Powers.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const baseDeck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,status=null)=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status,poison:false,playedTurn:0});
const byName=name=>{
 const found=[...CATALOG.values()].find(c=>c.name===name);
 assert.ok(found,'Card unavailable: '+name);return found.id;
};
const u=letter=>unit(byName('Unown ['+letter+']'));
function game(powerId){
 const g=createGame({decks:[baseDeck,baseDeck],format:'classic',seed:20261022});
 g.phase='game';g.turn=0;g.round=4;g.turnSerial=7;
 for(const p of g.players){
  p.active=unit('base1-44');p.bench=[unit('base1-27')];
  p.hand=['base1-91','base1-92'];
  p.deck=['base1-44','base1-91','base1-98','base1-99'];
  p.prizes=['base1-27','base1-93'];p.discard=['base1-99'];
 }
 g.players[0].active=unit(powerId);
 return g;
}
const run=(g,side,type,payload={})=>{
 const r=applyCommand(g,side,{type,payload});
 assert.ok(r.ok,type+' failed: '+r.error);return r;
};
const choose=(g,id)=>{const d=g.pendingDecision;assert.ok(d,'Expected a decision');run(g,d.actor,'choose',{decisionId:d.id,selected:[id]});};
const ledger=g=>g.players.flatMap(p=>[...p.hand,...p.deck,...p.prizes,...p.discard,...[p.active,...p.bench]
 .filter(Boolean).flatMap(x=>[x.id,...x.under,...x.energies,...x.attachedTrainers.map(t=>t.id)])]).sort();
let assertions=0;
{
 const g=game('basep-13'),p=g.players[0],f=g.players[1];
 p.active.poison=true;p.active.poisonDamage=20;p.active.damage=30;
 f.active.status='Confused';f.active.poison=true;f.active.damage=40;
 p.bench[0].status='Asleep';
 const before=ledger(g);
 run(g,0,'use_power',{slot:-1});
 assert.equal(p.active.status,null);assert.equal(p.active.poison,false);
 assert.equal(p.active.poisonDamage,undefined);assert.equal(p.active.damage,30);
 assert.equal(f.active.status,null);assert.equal(f.active.poison,false);
 assert.equal(f.active.damage,40);assert.equal(p.bench[0].status,'Asleep');
 assert.deepEqual(ledger(g),before);assert.equal(g.pendingDecision,null);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 assertions++;
}
{
 const g=game('basep-13');g.players[0].active.status='Asleep';
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 assertions++;
}
{
 const g=game('neo2-69');g.players[1].deck=['base1-91','base1-92','base1-93','base1-94','base1-95','base1-98'];
 const before=structuredClone(g.players[1].deck);
 run(g,0,'use_power',{slot:-1});
 assert.deepEqual(g.players[1].deck,before,'Observe cannot rearrange an opponent deck');
 const msgs=publicView(g,0).players[0].privateMessages.join(' ');
 assert.ok(msgs.includes('base1')===false,'Private info should use card names');
 for(const id of before.slice(-5).reverse())assert.ok(msgs.includes(CATALOG.get(id).name));
 assert.equal(publicView(g,1).players[0].privateMessages,undefined);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 assertions++;
}
{
 const g=game('basep-5'),p=g.players[0];
 p.hand=['base1-91'];p.deck=['base1-99','base1-98'];
 const before=ledger(g);
 run(g,0,'use_power',{slot:-1});
 assert.equal(p.hand.length,2,'Special Delivery draws before offering the decision');
 assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['hand:0','hand:1']);
 assert.equal(publicView(g,1).pendingDecision.options,undefined);
 assert.equal(applyCommand(g,0,{type:'cancel_choice',payload:{decisionId:g.pendingDecision.id}}).ok,false,
  'Cannot cancel after a private draw');
 choose(g,'hand:1');
 assert.equal(g.players[0].deck.at(-1),'base1-98','May return the newly drawn card');
 assert.deepEqual(g.players[0].hand,['base1-91']);
 assert.deepEqual(ledger(g),before);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 assertions++;
}
{
 const g=game('basep-5');g.players[0].deck=[];
 const before=structuredClone(g);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 assert.deepEqual(g,before,'Empty-deck Special Delivery must be atomic');
 assertions++;
}
{
 const g=game('base1-44'),p=g.players[0];
 p.bench=[...('FIND'.split('').map(u))];p.deck=['base1-91','base1-27','base1-93'];
 const before=ledger(g);
 run(g,0,'use_power',{slot:0});
 assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['deck:0','deck:2']);
 assert.equal(publicView(g,1).pendingDecision.options,undefined);
 choose(g,'deck:2');
 assert.ok(g.players[0].hand.includes('base1-93'));
 assert.ok(g.message.some(m=>m.includes(CATALOG.get('base1-93').name)),
  '[Find] must reveal the searched Trainer');
 assert.deepEqual(ledger(g),before);
 assertions++;
}
{
 const g=game('base1-44');
 g.players[0].bench=[u('F'),u('I'),u('N'),unit('base1-27')];
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:0}}).ok,false,
  '[Find] cannot activate without all four letter Pokémon on Bench');
 assertions++;
}
{
 const g=game('base1-44');
 g.players[0].bench=[...('JOIN'.split('').map(u))];
 g.players[0].deck=['base1-91','base1-27','base1-93','base1-44'];
 const before=ledger(g);
 run(g,0,'use_power',{slot:0});
 assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['deck:1','deck:3']);
 choose(g,'deck:1');
 assert.ok(g.players[0].hand.includes('base1-27'));
 assert.ok(g.message.some(m=>m.includes(CATALOG.get('base1-27').name)));
 assert.deepEqual(ledger(g),before);
 assertions++;
}
{
 const g=game('base1-44');g.players[0].bench=[...('HELP'.split('').map(u))];
 const handBefore=g.players[0].hand.length,deckBefore=g.players[0].deck.length,before=ledger(g);
 run(g,0,'use_power',{slot:0});
 assert.equal(g.pendingDecision,null);
 assert.equal(g.players[0].hand.length,handBefore);
 assert.equal(g.players[0].deck.length,deckBefore);
 assert.deepEqual(ledger(g),before);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:0}}).ok,false);
 assertions++;
}
console.log('PASS six historical Pokémon Powers:',assertions,'authoritative scenarios');
