'use strict';
const assert=require('node:assert/strict');
const RULES=require('./core_rules');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const unit=(id,props={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...props});
function game(attacker='base1-58'){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:64});
 g.phase='game';g.turn=0;g.round=7;g.turnSerial=21;g.rngState=4;
 g.players[0].active=unit(attacker);g.players[0].bench=[unit('base1-3')];
 g.players[1].active=unit('base1-3');g.players[1].bench=[unit('base1-58')];
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(20).fill('base1-99');}
 return g;
}
function send(g,side,type,payload){const r=applyCommand(g,side,{type,payload:payload||{}});assert.equal(r.ok,true,type+': '+r.error);}
assert.equal(RULES.isEnergy(CATALOG.get('base5-17')),true);
assert.equal(RULES.isEnergy(CATALOG.get('base5-80')),true);
assert.equal(RULES.isEnergy(CATALOG.get('neo4-16')),true);
assert.equal(RULES.canPayEnergy(['Lightning','Colorless'],['Any','Grass']),true);
assert.equal(RULES.canPayEnergy(['Fire','Water'],['Any','Grass']),false,'One Rainbow cannot pay two colored symbols');
assert.equal(RULES.canPayEnergy(['Fire','Water'],['Any','Any']),true,'Miracle can pay two symbols');
assert.equal(RULES.canPayEnergy(['Fire','Colorless','Colorless'],['Any','Any']),false);
assert.equal(RULES.legalAttachment({card:CATALOG.get('neo4-16'),unit:unit('base1-58'),cardName:'Pikachu'}),false);
assert.equal(RULES.legalAttachment({card:CATALOG.get('neo4-16'),unit:unit('neo4-49'),cardName:'Light Machoke'}),true);
{
 const base=Array(60).fill('base1-99');base[0]='base1-58';base[1]='neo4-16';base[2]='neo4-16';
 assert.equal(RULES.validateDeck(base,CATALOG).valid,false);
 assert.ok(RULES.validateDeck(base,CATALOG).errors.some(e=>e.includes('Miracle Energy')));
}
{
 const g=game('base1-58');
 g.players[0].hand=['base5-17'];
 send(g,0,'attach_energy',{handIndex:0,slot:-1});
 assert.equal(g.players[0].active.damage,10,'Rainbow attachment deals 10 to attached host');
 assert.equal(g.players[0].active.energies[0],'base5-17');
 g.players[0].hand=['base5-80'];
 assert.equal(applyCommand(g,0,{type:'bench',payload:{handIndex:0}}).ok,false,'Rainbow cannot be played as Pokémon');
}
{
 const g=game('base1-58');g.players[0].active.energies=['base5-80','base1-99'];
 send(g,0,'attack',{attackIndex:1}); // Thunder Jolt costs Lightning + Colorless
 assert.ok(g.players[1].active.damage>0,'Rainbow pays typed attack cost');
}
{
 const g=game('neo4-49');g.players[0].hand=['neo4-16'];
 send(g,0,'attach_energy',{handIndex:0,slot:-1});
 assert.deepEqual(g.players[0].active.energies,['neo4-16']);
 send(g,0,'attack',{attackIndex:1}); // Gentle Kick needs two Fighting
 assert.equal(g.players[1].active.damage,40);
 assert.equal(g.players[0].active.energies.length,0,'Miracle discarded after turn');
 assert.equal(g.players[0].discard.includes('neo4-16'),true);
}
{
 const g=game('neo4-49');g.players[0].hand=['neo4-16'];g.players[0].bench[0]=unit('neo4-49');
 send(g,0,'attach_energy',{handIndex:0,slot:0});
 send(g,0,'end_turn');
 assert.equal(g.players[0].bench[0].energies.length,0,'Miracle leaves Benched host at end of owner turn');
 assert.equal(g.players[0].discard.includes('neo4-16'),true);
}
console.log('PASS v0.57: Rainbow and Miracle typed costs, attachment damage, deck restriction, turn-end discard and card identity');
