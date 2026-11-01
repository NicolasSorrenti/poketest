'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const configs=[
 {id:'base1-53',formats:[['classic',60],['neo-theme',60],['online-preview',60],['online-preview',40]]},
 {id:'base4-79',formats:[['online-preview',60],['online-preview',40]]}
];
const unit=(id,energies=[],damage=0,status=null)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison:false,playedTurn:0});
function game(format,size){const deck=list('base1:Brushfire').slice(0,size);const g=createGame({format,decks:[deck,deck],deckSize:size,prizeCount:size===40?4:6,seed:79});g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;for(const p of g.players){p.active=unit('base1-1');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill('base1-99');p.prizes=Array(size===40?4:6).fill('base1-99');p.prizeFaceUp=Array(size===40?4:6).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Magnemite attack must be rejected');assert.deepEqual(g,before,'rejected Magnemite attack must be atomic');}
function seedFor(flips){for(let seed=0;seed<10000;seed++){let state=seed,ok=true;for(const expected of flips){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){ok=false;break;}}if(ok)return seed;}throw Error('coin sequence not found');}
function setCoins(g,flips){g.rngState=seedFor(flips);g.coinFlips=[];g.coinSeq=0;}

let scenarios=0;
for(const c of configs)for(const [format,size] of c.formats){
 const card=CATALOG.get(c.id);assert.equal(card.name,'Magnemite');assert.equal(card.hp,'40');assert.deepEqual(card.types,['Lightning']);assert.deepEqual(card.attacks,[
  {name:'Thunder Wave',cost:['Lightning'],damage:'10',text:'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'},
  {name:'Selfdestruct',cost:['Lightning','Colorless'],damage:'40',text:"Does 10 damage to each Pokémon on each player's Bench. (Don't apply Weakness and Resistance for Benched Pokémon.) Magnemite does 40 damage to itself."}
 ]);assert.deepEqual(card.weaknesses,[{type:'Fighting',value:'×2'}]);assert.deepEqual(card.resistances,[]);assert.deepEqual(card.retreatCost,['Colorless']);scenarios++;
 // Thunder Wave always deals 10; heads Paralyzes and tails leaves the current
 // Special Condition alone. A new condition replaces the old one.
 for(const heads of [false,true]){const g=game(format,size);g.players[0].active=unit(c.id,['base1-100']);g.players[1].active=unit('base1-3',[],0,'Confused');setCoins(g,[heads]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10);assert.equal(g.players[1].active.status,heads?'Paralyzed':'Confused');assert.deepEqual(g.players[0].active.energies,['base1-100']);assert.equal(g.coinFlips.length,1);scenarios++;}
 // Paralysis prevents the opponent's next attack and is cleared after that
 // turn's between-turns checkup.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-100']);g.players[1].active=unit('base1-3',['base1-96']);setCoins(g,[true]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.status,'Paralyzed');reject(g,1,'attack',{attackIndex:0});act(g,1,'end_turn');assert.equal(g.players[1].active.status,null);scenarios++;}
 // Double Colorless cannot satisfy Thunder Wave's Lightning symbol.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-96']);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Selfdestruct hits both Benches for 10 ignoring Weakness/Resistance, hits a
 // Lightning-weak Active Pokémon for 80, and deals 40 recoil to Magnemite.
 // Since Magnemite has 40 HP, the recoil KOs it and its attachments are discarded.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-100','base1-96']);g.players[0].bench=[unit('base1-2')];g.players[1].active=unit('base1-2');g.players[1].bench=[unit('base1-19')];act(g,0,'attack',{attackIndex:1});assert.equal(g.players[0].bench[0].damage,10,'own Bench Weakness is ignored');assert.equal(g.players[1].bench[0].damage,10,'opposing Bench Resistance is ignored');assert.equal(g.players[1].active.damage,80,'Active Weakness applies');assert.equal(g.players[0].active,null,'40 recoil KOs 40-HP Magnemite');assert.ok(g.players[0].discard.includes(c.id));assert.ok(g.players[0].discard.includes('base1-100'));assert.ok(g.players[0].discard.includes('base1-96'));assert.equal(g.pendingAction.kind,'take_prize');scenarios++;}
 // Active Resistance still applies to the 40 damage; the self-KO remains 40.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-100','base1-96']);g.players[1].active=unit('base1-19');act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,10);assert.equal(g.players[0].active,null);scenarios++;}
 // The Colorless symbols on two Double Colorless Energy cards do not supply
 // the required Lightning Energy; invalid Selfdestruct is rejected atomically.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-96','base1-96']);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // With an empty Bench, Selfdestruct still damages the Active target and itself.
 {const g=game(format,size);g.players[0].active=unit(c.id,['base1-100','base1-96']);g.players[1].active=unit('base1-1');act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,40);assert.equal(g.players[0].active,null);scenarios++;}
}
assert.equal(scenarios,54);
console.log(`PASS Magnemite Thunder Wave and Selfdestruct costs, outcomes, Bench modifiers and self-KO (${scenarios} reducer scenarios)`);
