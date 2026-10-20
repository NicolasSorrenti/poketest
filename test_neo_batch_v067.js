'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createGame,applyCommand}=require('./headless_duel');
const {publicView}=require('./duel_protocol');
const {list}=require('./authentic_decks');
const U=(id,m={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...m});
function game(){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:543});
 g.phase='game';g.round=7;g.turn=0;g.turnSerial=19;g.rngState=271;
 g.players[0].active=U('base1-18',{energies:Array(4).fill('base1-99')});g.players[0].bench=[U('base1-46')];
 g.players[1].active=U('base1-58',{energies:['base1-98','base1-96']});g.players[1].bench=[U('base1-46')];
 for(const p of g.players){p.hand=[];p.discard=[];p.prizes=Array(6).fill('base1-99');p.deck=Array(16).fill('base1-99');}
 g.stadium={id:'neo1-84',owner:0};g.players[0].stadium='neo1-84';
 return g;
}
const act=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);};
{
 const g=game();
 g.players[1].prizes=['base1-98','base1-80','base1-58'];
 g.players[1].prizeFaceUp=[true,false,true];
 for(const viewer of [0,1,null]){
  const v=publicView(g,viewer);
  assert.deepEqual(v.players[1].revealedPrizes,[{index:0,id:'base1-98'},{index:2,id:'base1-58'}]);
  assert.equal(Object.keys(v.players[1]).includes('prizeFaceUp'),false,'Internal reveal flags never sent to clients');
  assert.equal(JSON.stringify(v.players[1]).includes('base1-80'),false,'Face-down Prize card ID never sent');
 }
 const local=fs.readFileSync(require.resolve('./classic_live.js'),'utf8');
 const online=fs.readFileSync(require.resolve('./online.js'),'utf8');
 const shared=fs.readFileSync(require.resolve('./duel_shared_components.js'),'utf8');
 assert.ok(local.includes('shared.renderFaceUpPrizes')&&local.includes('me:0'),'Local CPU UI uses player 0 perspective');
 assert.ok(online.includes('shared.renderFaceUpPrizes')&&online.includes('me:side()'),'Online UI uses local or spectated perspective');
 assert.ok(shared.includes('[[0,1-me],[1,me]]'),'Both UI modes invert top/bottom Prize rails from local seat');
 assert.ok(online.includes('renderFaceUpPrizes()')&&shared.includes('revealedPrizes'),'Publicly revealed Prizes come from shared renderer');
 const clone=structuredClone(g);
 assert.deepEqual(publicView(clone,null).players[1].revealedPrizes,publicView(g,null).players[1].revealedPrizes);
}
{
 const g=game();
 act(g,0,'attack',{attackIndex:1}); // Dragonair Hyper Beam chooses attached opponent Energy
 assert.equal(g.pendingDecision?.actor,0);
 assert.ok(g.pendingDecision.options.some(x=>x.id==='energy:0'));
 const decision=g.pendingDecision;
 act(g,0,'choose',{decisionId:decision.id,selected:['energy:0']});
 assert.equal(g.players[1].active.energies.includes('base1-98'),false);
 assert.equal(g.players[1].hand.includes('base1-98'),true,'Ecogym protects Energy discarded by attack');
 assert.equal(g.players[1].discard.includes('base1-98'),false);
 assert.equal(g.players[1].active.energies.includes('base1-96'),true,'Colorless Energy remains attached');
}
{
 let autoHeads=false,chosenHeads=false;
 for(let seed=1;seed<4000&&!(autoHeads&&chosenHeads);seed+=17){
  // With one attached Energy, Koga's Muk automatically discards it on heads.
  // Ecogym must attribute the discard to the defending player's Power.
  if(!autoHeads){
   const g=game();g.rngState=seed;
   g.players[0].active=U('base1-46',{energies:['base1-98']});
   g.players[1].active=U('gym2-26');
   act(g,0,'attack',{attackIndex:0});
   if(g.players[0].hand.includes('base1-98')){
    assert.equal(g.players[0].discard.includes('base1-98'),false,'Auto Power-discarded Energy returned by Ecogym');
    autoHeads=true;
   }
  }
  if(!chosenHeads){
   const g=game();g.rngState=seed;
   g.players[0].active=U('base1-46',{energies:['base1-98','base1-102']});
   g.players[1].active=U('gym2-26');
   act(g,0,'attack',{attackIndex:0});
   if(g.pendingAction?.kind!=='gym_energy_drain')continue;
   const d=g.pendingDecision;
   assert.equal(d.actor,1,'Defender owns Energy Drain decision');
   act(g,1,'choose',{decisionId:d.id,selected:['energy:0']});
   assert.equal(g.players[0].hand.includes('base1-98'),true,'Chosen Power-discarded Energy returned by Ecogym');
   assert.equal(g.players[0].active.energies.includes('base1-102'),true,'Unselected Energy stays attached');
   chosenHeads=true;
  }
 }
 assert.ok(autoHeads&&chosenHeads,'Ecogym covers automatic and defender-selected Koga Muk Energy Drain');
}
console.log('PASS v0.67: seat-correct permanent Prize UI and Ecogym attack/Pokémon Power provenance across owner decisions');
