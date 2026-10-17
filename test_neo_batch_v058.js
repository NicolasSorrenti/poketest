'use strict';
const assert=require('node:assert/strict');
const RULES=require('./core_rules');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const U=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:2,...more});
function game(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:5});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=11;
 g.players[0].active=U('base1-46',{energies:['base1-98','base1-98','base1-98']});
 g.players[0].bench=[U('base1-63')];
 g.players[1].active=U('base1-58');g.players[1].bench=[U('base1-3')];
 g.players[0].hand=['base1-24','base1-42'];g.players[1].hand=[];
 for(const p of g.players)p.prizes=Array(6).fill('base1-99');
 return g;
}
const send=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);};
const rejected=(g,type,payload)=>assert.equal(applyCommand(g,0,{type,payload}).ok,false,'Action must be refused');
assert.equal(RULES.canEvolve(CATALOG.get('base1-58'),CATALOG.get('neo1-12')),true,'Pichu -> Pikachu');
assert.equal(RULES.canEvolve(CATALOG.get('base1-58'),CATALOG.get('neo1-20')),false,'Cleffa cannot evolve to Pikachu');
assert.equal(RULES.canEvolve(CATALOG.get('base1-14'),CATALOG.get('neo1-12')),false,'Pichu cannot skip Pikachu into Raichu');
assert.equal(RULES.canEvolve(CATALOG.get('base1-7'),CATALOG.get('neo2-66')),true,'Tyrogue -> Hitmonchan');
assert.equal(RULES.canEvolve(CATALOG.get('gym2-45'),CATALOG.get('gym2-76')),true,'Giovanni male Nidoran special gender normalization');
assert.equal(RULES.canEvolve(CATALOG.get('gym2-45'),CATALOG.get('base1-55')),false,'Giovanni evolution refuses ordinary Nidoran');
assert.equal(RULES.isBasicPokemon(CATALOG.get('neo1-12')),true,'Baby can start or Bench');
assert.equal(RULES.setupCandidates(['neo1-12','base1-99'],CATALOG).length,1);
{
 const g=game();g.round=1;g.players[0].active.playedTurn=1;
 rejected(g,'evolve',{handIndex:0,slot:-1});
 assert.equal(g.players[0].active.id,'base1-46','First-turn evolution has no side effects');
}
{
 const g=game();
 send(g,0,'evolve',{handIndex:0,slot:-1});
 assert.equal(g.players[0].active.id,'base1-24');
 rejected(g,'evolve',{handIndex:0,slot:-1}); // Wartortle cannot evolve Charmeleon
 g.players[0].hand.push('base1-4'); // Charizard, second stage
 rejected(g,'evolve',{handIndex:1,slot:-1}); // same Pokémon cannot evolve twice this round
 assert.equal(g.players[0].active.id,'base1-24');
 send(g,0,'retreat',{slot:0});
 assert.equal(g.players[0].active.id,'base1-63');
 send(g,0,'evolve',{handIndex:0,slot:-1});
 assert.equal(g.players[0].active.id,'base1-42','Different Pokémon can evolve in same Active slot on the same turn');
}
{
 const g=game();g.players[0].active=U('neo1-12',{playedTurn:2});
 g.players[0].hand=['base1-58','base1-14'];
 send(g,0,'evolve',{handIndex:0,slot:-1});
 assert.equal(g.players[0].active.id,'base1-58');
 assert.deepEqual(g.players[0].active.under,['neo1-12'],'Baby stays attached underneath Basic');
 rejected(g,'evolve',{handIndex:0,slot:-1});
}
console.log('PASS v0.58: Baby->Basic, Gym owner, first-turn and same-Pokémon limits, independent Active-slot evolutions');
