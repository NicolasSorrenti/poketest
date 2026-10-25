'use strict';
// A KO gives the choosing player a Prize decision in every historical rules format.
// Format still controls card legality, not whether players may select a Prize.
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const deck=list('base1:Blackout');
const U=(id,energies=[],damage=0)=>({id,under:[],energies,attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
const historical=['classic','theme-expanded','gym-theme','gym-expanded','neo-theme','online-preview'];

for(const format of historical){
 for(const prizeCount of [4,6]){
  // Build from a validated 60-card list, then switch just the format dispatch.
  // The live mode-specific setup is separately covered in test_cube_match.js.
  const game=createGame({decks:[deck,deck],format:'classic',prizeCount,seed:418});
  game.format=format;
  game.phase='game';game.setupReady=[true,true];game.turn=0;game.turnSerial=4;game.round=4;
  game.players[0].active=U('base1-7',['base1-97']); // Hitmonchan uses Jab.
  game.players[1].active=U('base1-61',[],15); // Jab Knocks Out Rattata.
  game.players[1].bench=[U('base1-52'),U('base1-41')];
  const prizes=['base1-91','base1-94','base1-95','base1-93','base1-92','base1-88'].slice(0,prizeCount);
  game.players[0].prizes=[...prizes];game.players[0].prizeFaceUp=prizes.map((_,i)=>i===1);
  game.players[1].prizes=Array(prizeCount).fill('base1-91');
  game.players[0].hand=[];
  let action=applyCommand(game,0,{type:'attack',payload:{attackIndex:0}});
  assert.equal(action.ok,true,format+': '+action.error);
  assert.equal(game.pendingDecision?.kind,'prize-card',format+' should prompt instead of auto-picking');
  assert.equal(game.pendingDecision.actor,0);
  assert.deepEqual(game.players[0].prizes,prizes,'Prize cards stay secret and unmoved until selection');
  assert.equal(publicView(game,1).pendingDecision?.options,undefined,'CPU cannot inspect player options');
  const decisionId=game.pendingDecision.id;
  action=applyCommand(game,0,{type:'choose',payload:{decisionId,selected:['prize:0']}});
  assert.equal(action.ok,true,format+': '+action.error);
  assert.equal(game.players[0].prizes.length,prizeCount-1);
  assert.equal(game.players[0].hand.includes(prizes[0]),true,'Player receives chosen (not last) Prize');
  assert.equal(game.players[0].prizes.includes(prizes[0]),false);
  assert.deepEqual(game.players[0].prizeFaceUp,prizes.slice(1).map((_,i)=>i===0),'Face-up flags follow remaining cards');
  assert.equal(game.pendingDecision?.kind,'pokemon-target','Defender chooses replacement after Prize resolution');
  assert.equal(game.pendingDecision.actor,1);
 }
}
console.log('PASS all six historical formats prompt for a chosen Prize with 4 or 6 cards');
