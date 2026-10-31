'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');
const variants=[
 {id:'base1-37',format:'classic',size:60,prizes:6,grass:'base1-99',fire:'base1-98',dce:'base1-96'},
 {id:'base1-37',format:'neo-theme',size:60,prizes:6,grass:'base1-99',fire:'base1-98',dce:'base1-96'},
 {id:'base1-37',format:'online-preview',size:60,prizes:6,grass:'base1-99',fire:'base1-98',dce:'base1-96'},
 {id:'base1-37',format:'online-preview',size:40,prizes:4,grass:'base1-99',fire:'base1-98',dce:'base1-96'},
 {id:'base4-54',format:'online-preview',size:60,prizes:6,grass:'base4-127',fire:'base4-126',dce:'base4-124'},
 {id:'base4-54',format:'online-preview',size:40,prizes:4,grass:'base4-127',fire:'base4-126',dce:'base4-124'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v,seed=3){const deck=list('base1:Brushfire').slice(0,v.size);const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed});g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(v.prizes).fill(v.grass);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}g.players[0].active=unit(v.id);return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'underpaid Nidorino attack should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id),base=CATALOG.get('base1-37');
 assert.deepEqual(card.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),'Base Set 2 reprint must match Base Set attacks');
 assert.equal(card.attacks[0].text,'Flip 2 coins. This attack does 30 damage times the number of heads.');
 const program=ATTACK.compile(card.attacks[0]);assert.equal(program.kind,'coin-times');assert.equal(program.flips,2);assert.equal(program.each,30);scenarios++;
 // Controlled RNG states prove the printed 0/1/2-head outcomes; both flips are resolved publicly.
 for(const heads of [0,1,2]){let found=false;for(let seed=1;seed<5000&&!found;seed++){const g=game(v,seed);g.rngState=seed;g.players[0].active=unit(v.id,[v.grass,v.dce]);g.players[1].active=unit('base1-44');act(g,0,'attack',{attackIndex:0});const damage=g.players[1].active===null?60:g.players[1].active.damage;if(damage===heads*30){assert.ok(g.message.some(x=>x.includes('Double Kick')));if(heads===2){assert.equal(g.players[1].active,null);assert.equal(g.pendingAction.kind,'take_prize');}found=true;scenarios++;}}assert.ok(found,`could not produce ${heads} heads in ${v.id}`);}
 // A Grass Energy plus Double Colorless satisfies G+C+C; two DCE alone cannot pay the Grass symbol.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.dce]);act(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce,v.dce]);reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Horn Drill is a fixed 50 damage attack with G+G+C+C and no coin or choice effect.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass,v.fire,v.fire]);g.players[1].active=unit('base1-10');act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,50);assert.equal(g.pendingDecision,null);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.dce,v.dce]);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Two-head Double Kick doubles against Gyarados's printed Grass Weakness before Prize resolution.
 {let found=false;for(let seed=1;seed<5000&&!found;seed++){const g=game(v,seed);g.rngState=seed;g.players[0].active=unit(v.id,[v.grass,v.dce]);g.players[1].active=unit('base1-6');act(g,0,'attack',{attackIndex:0});if(g.players[1].active===null){assert.equal(g.pendingAction.kind,'take_prize');found=true;scenarios++;}}assert.ok(found,'two-head weakness KO must award a Prize');}
}
console.log(`PASS Nidorino attacks: ${scenarios} reducer scenarios`);
