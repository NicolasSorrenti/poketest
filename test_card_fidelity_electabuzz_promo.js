'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const basic='base1-99',rod='basep-46',pikachu='base1-58',raichu='base1-14',lightning='base1-100';
function unit(id,energies=[],damage=0){return {id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0};}
function game(){
 const deck=[...Array(4).fill(rod),...Array(4).fill(pikachu),...Array(4).fill(raichu),...Array(48).fill(basic)];
 const g=createGame({format:'unrestricted',decks:[deck,deck],deckSize:60,prizeCount:6,seed:7});
 g.phase='game';g.turn=0;g.turnSerial=10;g.round=5;g.startingPlayer=0;
 for(const p of g.players){p.active=null;p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(basic);p.prizes=Array(6).fill(basic);p.turnPlays=[];p.energyUsed=false;p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);}
function reject(g,side,type,payload={}){const before=structuredClone(g);assert.equal(applyCommand(g,side,{type,payload}).ok,false);assert.deepEqual(g,before);}
function choose(g,side,id){act(g,side,'choose',{decisionId:g.pendingDecision.id,selected:[id]});}
let scenarios=0;
// Lightning Rod asks the attacker to select among opponent Pokémon and marks exactly that target.
{
 const g=game();g.players[0].active=unit(rod,[lightning]);g.players[1].active=unit(pikachu);g.players[1].bench=[unit('base1-7'),unit('base1-11')];
 act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,0);assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['bench:-1','bench:0','bench:1']);
 choose(g,0,'bench:1');assert.equal(g.players[1].bench[1].lightningRodMarker,true);assert.equal(g.players[1].active.lightningRodMarker,undefined);scenarios++;
}
// A sole legal marker target auto-resolves; no extra picker is opened.
{
 const g=game();g.players[0].active=unit(rod,[lightning]);g.players[1].active=unit(pikachu);
 act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.lightningRodMarker,true);scenarios++;
}
// Lightning Bolt retains its printed 10 Active damage and adds 20 to a marked Active; Weakness applies.
{
 const g=game();g.players[0].active=unit(rod,[lightning,lightning]);g.players[1].active=unit('base1-3');g.players[1].active.lightningRodMarker=true;g.players[1].active.weaknessOverride='Lightning';
 act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,60);scenarios++;
}
// One marked Benched Pokémon is auto-selected and takes 20 extra with Weakness; the Defending Active takes printed 10.
{
 const g=game();g.players[0].active=unit(rod,[lightning,lightning]);g.players[1].active=unit('base1-3');g.players[1].bench=[unit('base1-7')];g.players[1].bench[0].lightningRodMarker=true;g.players[1].bench[0].weaknessOverride='Lightning';
 act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].bench[0].damage,40);scenarios++;
}
// Lightning Bolt's printed Weakness/Resistance clause also applies to the marked Bench target's Resistance.
{
 const g=game();g.players[0].active=unit(rod,[lightning,lightning]);g.players[1].active=unit('base1-3');g.players[1].bench=[unit('base1-7')];g.players[1].bench[0].lightningRodMarker=true;g.players[1].bench[0].resistanceOverride='Lightning';
 act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].bench[0].damage,0);scenarios++;
}
// Marked Bench damage participates in the ordinary Knock Out and Prize flow.
{
 const g=game();g.players[0].active=unit(rod,[lightning,lightning]);g.players[1].active=unit('base1-3');g.players[1].bench=[unit(pikachu,[],30)];g.players[1].bench[0].lightningRodMarker=true;g.players[1].bench[0].weaknessOverride='Lightning';
 act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].bench.length,0);assert.equal(g.players[0].hand.length,1);assert.equal(g.players[0].prizes.length,5);scenarios++;
}
// With multiple markers, the attacker sees only marked Pokémon and chooses which receives the bonus.
{
 const g=game();g.players[0].active=unit(rod,[lightning,lightning]);g.players[1].active=unit('base1-3');g.players[1].bench=[unit('base1-11'),unit('base1-7')];g.players[1].active.lightningRodMarker=true;g.players[1].bench[1].lightningRodMarker=true;
 act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision.actor,0);assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['bench:-1','bench:1']);
 choose(g,0,'bench:1');assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].bench[0].damage,0);assert.equal(g.players[1].bench[1].damage,20);scenarios++;
}
// No marker means Lightning Bolt has no extra target choice and deals only its printed Active damage.
{
 const g=game();g.players[0].active=unit(rod,[lightning,lightning]);g.players[1].active=unit(pikachu);g.players[1].bench=[unit('base1-11')];
 act(g,0,'attack',{attackIndex:1});assert.equal(g.pendingDecision,null);assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].bench[0].damage,0);scenarios++;
}
// Markers persist when the same Pokémon moves to the Bench, and can still receive Lightning Bolt damage there.
{
 const g=game();g.players[0].active=unit(rod,[lightning,lightning]);g.players[1].active=unit(pikachu,[lightning]);g.players[1].active.lightningRodMarker=true;g.players[1].bench=[unit('base1-11')];
 // A player's own Retreat moves the marked Pokémon intact; switch back to the attacker's turn to isolate Bolt's target rules.
 g.turn=1;act(g,1,'retreat',{slot:0});assert.equal(g.players[1].bench[0].lightningRodMarker,true);g.turn=0;
 act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].bench[0].damage,20);scenarios++;
}
// Evolution removes the marker from the evolving Pokémon.
{
 const g=game();g.players[0].active=unit(rod,[lightning]);g.players[1].active=unit(pikachu);g.players[1].active.lightningRodMarker=true;g.players[1].hand=[raichu];
 g.turn=1;act(g,1,'evolve',{slot:-1,handIndex:0});assert.equal(g.players[1].active.id,raichu);assert.equal(g.players[1].active.lightningRodMarker,undefined);scenarios++;
}
// The two Lightning attacks reject missing typed costs; Double Colorless cannot pay Lightning.
{
 const g=game();g.players[0].active=unit(rod,['base1-96']);g.players[1].active=unit(pikachu);
 reject(g,0,'attack',{attackIndex:0});reject(g,0,'attack',{attackIndex:1});scenarios+=2;
}

// The separate Movie Promo Light Screen halves the next turn's damage after W/R but permits effects to resolve.
{
 const g=game();g.players[0].active=unit('basep-2',[lightning]);g.players[1].active=unit('base1-20',[lightning]);
 act(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].active.shield.half,true);g.rngState=50000;
 act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);assert.equal(g.players[0].active.status,'Paralyzed');
 assert.equal(g.players[0].active.shield.expires,g.turnSerial);scenarios++;
}
// Movie Promo Quick Attack coin outcomes are 10 tails / 30 heads and its two-Colorless cost accepts DCE.
for(const [seed,expected] of [[0,10],[50000,30]]){
 const g=game();g.players[0].active=unit('basep-2',['base1-96']);g.players[1].active=unit('base1-3');g.rngState=seed;
 act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,expected);scenarios++;
}
// Quick Attack rejects a typed-only payment when its two Colorless Energy are absent.
{
 const g=game();g.players[0].active=unit('basep-2',[lightning]);g.players[1].active=unit('base1-3');reject(g,0,'attack',{attackIndex:1});scenarios++;
}
console.log(`PASS Electabuzz promo Lightning Rod marker choices/lifetime and Lightning Bolt damage scenarios (${scenarios})`);
