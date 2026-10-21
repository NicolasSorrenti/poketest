'use strict';
// Regression checks for reversible pre-effect Trainer choices across battle modes.
const assert=require('node:assert/strict');
const {CATALOG,createGame,reduce}=require('./headless_duel');
const {publicView,validateCommand}=require('./duel_protocol');
const fs=require('node:fs');

const starter=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=id=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
const find=name=>[...CATALOG.values()].find(c=>c.supertype==='Trainer'&&c.name===name)?.id;
function fixture(name){
 const game=createGame({decks:[starter,starter],seed:421,format:'classic'});
 game.phase='game';game.turn=0;game.round=3;game.turnSerial=4;
 for(const player of game.players){
  player.active=unit('base1-44');player.bench=[unit('base1-44')];
  player.prizes=Array(6).fill('base1-99');
  player.discard=[];
 }
 const p=game.players[0];
 p.hand=[find(name),'base1-91','base1-91','base1-44'];
 p.deck=['base1-44','base1-99','base1-91','base1-44','base1-99'];
 p.discard=['base1-71'];
 assert.ok(p.hand[0],name+' must exist');
 return game;
}
const play=(g,side,type,payload={})=>{
 const r=reduce(g,side,{type,payload});
 assert.ok(r.ok,type+': '+r.error);
 return r.game;
};
const blocked=(g,side,type,payload={})=>{
 const r=reduce(g,side,{type,payload});
 assert.equal(r.ok,false,'Expected '+type+' to be rejected');
 return r.error;
};
{
 let g=fixture('Item Finder'),hand=g.players[0].hand.slice(),deck=g.players[0].deck.slice(),discard=g.players[0].discard.slice();
 g=play(g,0,'play_trainer',{handIndex:0});
 const d=g.pendingDecision;
 assert.equal(d.kind,'cost');
 assert.equal(publicView(g,0).pendingDecision.cancelable,true);
 assert.equal(publicView(g,1).pendingDecision.cancelable,undefined);
 assert.match(blocked(g,1,'cancel_choice',{decisionId:d.id}),/cannot|choice/i);
 assert.match(blocked(g,0,'cancel_choice',{decisionId:'incorrect'}),/Stale/);
 g=play(g,0,'cancel_choice',{decisionId:d.id});
 assert.equal(g.pendingDecision,null);
 assert.equal(g.pendingAction,null);
 assert.deepEqual(g.players[0].hand,hand,'Item Finder remains in hand');
 assert.deepEqual(g.players[0].deck,deck);
 assert.deepEqual(g.players[0].discard,discard);
 // A second attempt after selecting the two costs can still be abandoned:
 // both the costs and the recovered Trainer are only tentative.
 g=play(g,0,'play_trainer',{handIndex:0});
 const choice=g.pendingDecision;
 g=play(g,0,'choose',{decisionId:choice.id,selected:choice.options.slice(0,2).map(o=>o.id)});
 assert.equal(g.pendingDecision.kind,'recover');
 assert.equal(publicView(g,0).pendingDecision.cancelable,true);
 g=play(g,0,'cancel_choice',{decisionId:g.pendingDecision.id});
 assert.deepEqual(g.players[0].hand,hand);
 assert.deepEqual(g.players[0].discard,discard);
}
{
 let g=fixture('Pokémon Trader');
 g=play(g,0,'play_trainer',{handIndex:0});
 assert.equal(g.pendingDecision.kind,'trade');
 assert.equal(publicView(g,0).pendingDecision.cancelable,true);
 const first=g.pendingDecision;
 g=play(g,0,'choose',{decisionId:first.id,selected:[first.options[0].id]});
 assert.equal(g.pendingDecision.kind,'find');
 assert.equal(publicView(g,0).pendingDecision.cancelable,false,'Deck lookup must be irreversible');
 assert.match(blocked(g,0,'cancel_choice',{decisionId:g.pendingDecision.id}),/no longer be cancelled/);
 assert.equal(g.players[0].hand[0],find('Pokémon Trader'));
}
{
 let g=fixture('Computer Search');
 g=play(g,0,'play_trainer',{handIndex:0});
 assert.equal(publicView(g,0).pendingDecision.cancelable,true);
 const d=g.pendingDecision;
 g=play(g,0,'choose',{decisionId:d.id,selected:d.options.slice(0,2).map(o=>o.id)});
 assert.equal(g.pendingDecision.kind,'find');
 assert.equal(publicView(g,0).pendingDecision.cancelable,false);
 assert.match(blocked(g,0,'cancel_choice',{decisionId:g.pendingDecision.id}),/no longer be cancelled/);
}
{
 let g=fixture('Pokédex');
 g=play(g,0,'play_trainer',{handIndex:0});
 assert.equal(g.pendingDecision.kind,'arrange');
 assert.equal(publicView(g,0).pendingDecision.cancelable,false,'Top five cards are already exposed');
 assert.match(blocked(g,0,'cancel_choice',{decisionId:g.pendingDecision.id}),/no longer be cancelled/);
}
{
 let g=fixture('Potion');
 g.players[0].active.damage=20;
 g=play(g,0,'play_trainer',{handIndex:0});
 assert.equal(publicView(g,0).pendingDecision.cancelable,true);
 g=play(g,0,'cancel_choice',{decisionId:g.pendingDecision.id});
 assert.equal(g.players[0].active.damage,20);
 assert.equal(g.players[0].hand[0],find('Potion'));
}
assert.equal(validateCommand({type:'cancel_choice',payload:{decisionId:'xyz'}}).type,'cancel_choice');
for(const file of ['classic_live.js','online.js']){
 const src=fs.readFileSync(__dirname+'/'+file,'utf8');
 assert.match(src,/if\(d\.cancelable\).*cancel_choice/,'Client should expose cancellable decisions');
}
console.log('PASS Trainer choice cancellation: before costs, after staged costs, hidden deck guard, client command');
