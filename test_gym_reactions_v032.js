'use strict';
const assert=require('node:assert/strict');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const RETAIL=require('./retail_theme_decks');
const POWER=require('./classic_power_core');
const unit=(id,patch={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,playedTurn:1,...patch});
const setup=seed=>{const g=createGame({decks:[RETAIL.list('brock'),RETAIL.list('misty')],format:'gym-expanded',seed});g.phase='game';g.turn=0;g.round=4;g.turnSerial=8;g.players[0].active=unit('gym2-54',{energies:['base1-102','base1-102']});g.players[1].active=unit('base1-3');g.players[0].bench=[unit('base1-1')];g.players[1].bench=[unit('base1-1')];return g;};
const attack=(g,side,index=0)=>{const r=applyCommand(g,side,{type:'attack',payload:{attackIndex:index}});assert.ok(r.ok,r.error);};
// Fire Wall damages the original attacker after actual attack damage, even if Moltres is Knocked Out.
{const g=setup(6);g.players[1].active=unit('gym1-12',{gymFireWall:{expires:10},damage:50});attack(g,0);assert.equal(g.players[0].active.damage,10);assert.ok(g.message.some(s=>s.includes('Fire Wall retaliated')));}
// Crosscounter coin outcome, with double actual damage on heads.
{let heads=0,tails=0;for(let seed=1;seed<=70;seed++){const g=setup(seed);g.players[1].active=unit('gym1-11',{gymCrosscounter:{expires:10}});attack(g,0);if(g.message.some(x=>x.includes('Crosscounter retaliated'))){heads++;assert.equal(g.players[0].active,null);assert.equal(g.players[1].active.damage,40);}else tails++;}assert.ok(heads&&tails);}
// Shadow Images: a tails flip prevents damage but not effects; the shield stays until the Pokémon takes damage.
{let resisted=0,hit=0;for(let seed=1;seed<=70;seed++){const g=setup(seed);g.players[1].active=unit('gym1-13',{gymShadowImages:true});attack(g,0);if(g.players[1].active.damage===0){resisted++;assert.equal(g.players[1].active.gymShadowImages,true);}else{hit++;assert.equal(g.players[1].active.gymShadowImages,undefined);}}assert.ok(resisted&&hit);}
// Relaxing Scent halves actual damage after W/R, rounded up in units of 10.
{const g=setup(1);g.players[1].active=unit('gym2-41');assert.equal(POWER.enabled(g,g.players[1].active,'Relaxing Scent'),true);attack(g,0);assert.equal(g.players[1].active.damage,10);}
{const g=setup(1);g.players[1].active=unit('gym2-41',{status:'Asleep'});assert.equal(POWER.enabled(g,g.players[1].active,'Relaxing Scent'),false);attack(g,0);assert.equal(g.players[1].active.damage,20);}
// Rebellion on both tails shuffles Gyarados and *all* attachments without handing out a Prize.
{let rebelled=0,attacked=0;for(let seed=1;seed<=90;seed++){
 const g=setup(seed);const before=g.players[0].prizes.length,enemyPrizes=g.players[1].prizes.length;g.players[0].active=unit('gym2-13',{energies:['base1-102','base1-102','base1-102','base1-102'],under:['gym1-86']});
 attack(g,0);if(g.players[0].active.id!=='gym2-13'){
  rebelled++;assert.ok(g.players[0].deck.includes('gym2-13'));assert.ok(g.players[0].deck.includes('gym1-86'));assert.ok(g.players[0].deck.filter(id=>id==='base1-102').length>=4);assert.equal(g.players[0].prizes.length,before);assert.equal(g.players[1].prizes.length,enemyPrizes);
 }else attacked++;
 }assert.ok(rebelled&&attacked);}
// Confusion doesn't suppress Rebellion's passive behavior, but sleep should prevent announcing an attack.
{const g=setup();g.players[0].active=unit('gym2-13',{status:'Confused',energies:Array(4).fill('base1-102')});assert.equal(POWER.enabled(g,g.players[0].active,'Rebellion'),true);}
console.log('PASS Gym v0.32: Crosscounter, Fire Wall, Shadow Images, Relaxing Scent, Rebellion including heads/tails and cleanup');
