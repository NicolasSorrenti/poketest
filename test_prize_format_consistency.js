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
// A single attack can Knock Out an Active and an already-damaged Benched Pokémon.
// Both earned Prizes must be chosen before the defender's forced promotion.
{
 const g=createGame({decks:[deck,deck],format:'classic',prizeCount:4,seed:418});
 g.phase='game';g.setupReady=[true,true];g.turn=0;g.turnSerial=4;g.round=4;
 g.players[0].active=U('base1-7',['base1-97']);
 g.players[1].active=U('base1-61',[],15);
 g.players[1].bench=[U('base1-35',[],30),U('base1-52')];
 g.players[0].prizes=['base1-91','base1-94','base1-95','base1-93'];
 g.players[0].prizeFaceUp=[false,true,false,false];
 let r=applyCommand(g,0,{type:'attack',payload:{attackIndex:0}});
 assert.equal(r.ok,true,r.error);
 assert.equal(g.pendingDecision?.kind,'prize-card');
 assert.equal(g.players[0].prizes.length,4,'Multiple Knock Outs do not auto-claim Prizes');
 r=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['prize:2']}});
 assert.equal(r.ok,true,r.error);
 assert.equal(g.pendingDecision?.kind,'prize-card','Second Knock Out queues second Prize choice');
 r=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['prize:0']}});
 assert.equal(r.ok,true,r.error);
 assert.deepEqual(g.players[0].prizes,['base1-94','base1-93']);
 assert.deepEqual(g.players[0].prizeFaceUp,[true,false]);
 assert.equal(g.players[1].active?.id,'base1-52','Only surviving Benched Pokémon auto-promotes');
 assert.equal(g.turn,1,'Turn advances only after all Prize claims and promotions');
}
// A Prize-race victory must be awarded after the final selection, even when
// the defender still has a Benched Pokémon. Champion CPU must resolve its own
// Prize decision without seeing card identities.
{
 const g=createGame({decks:[deck,deck],format:'classic',prizeCount:4,seed:418});
 g.phase='game';g.setupReady=[true,true];g.turn=1;g.turnSerial=4;g.round=4;
 g.players[1].active=U('base1-7',['base1-97']);
 g.players[0].active=U('base1-61',[],15);
 g.players[0].bench=[U('base1-52')];
 g.players[1].prizes=['base1-91'];
 g.players[1].prizeFaceUp=[false];
 let result=applyCommand(g,1,{type:'attack',payload:{attackIndex:0}});
 assert.equal(result.ok,true,result.error);
 assert.equal(g.over,false,'Winning Knock Out waits for Prize selection');
 assert.equal(g.pendingDecision?.actor,1,'CPU is the Prize actor');
 const {driveSide}=require('./cpu_policy');
 const resolved=driveSide(g,{side:1,level:5,personality:'tactical',limit:12});
 assert.equal(resolved.game.over,true);
 assert.equal(resolved.game.winner,1,'Taking the final Prize awards the win');
 assert.ok(resolved.commands.some(entry=>entry.command.type==='choose'),'Champion resolves Prize prompt');
 assert.equal(resolved.game.players[1].prizes.length,0);
}
console.log('PASS manual Prize choices: all six historical formats, simultaneous KOs, final Prize, Champion CPU');
