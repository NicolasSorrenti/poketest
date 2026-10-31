'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {id:'base1-28',format:'classic',deckSize:60,prizes:6,fire:'base1-98',water:'base1-102',grass:'base1-99',dce:'base1-96',seel:'base1-41',venusaur:'base1-15'},
 {id:'base4-42',format:'online-preview',deckSize:60,prizes:6,fire:'base4-126',water:'base4-130',grass:'base4-127',dce:'base4-124',seel:'base1-41',venusaur:'base1-15'},
 {id:'base4-42',format:'online-preview',deckSize:40,prizes:4,fire:'base4-126',water:'base4-130',grass:'base4-127',dce:'base4-124',seel:'base1-41',venusaur:'base1-15'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire').slice(0,v.deckSize);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.deckSize,prizeCount:v.prizes,seed:29});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.fire);p.prizes=Array(v.prizes).fill(v.fire);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 g.players[0].active=unit(v.id);return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'invalid Flare payment should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
let scenarios=0;
for(const v of variants){
 const printed=CATALOG.get(v.id),base=CATALOG.get('base1-28');
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),base.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),'Base Set 2 must match Base Set attack text and costs');
 assert.equal(printed.name,'Growlithe');assert.deepEqual(printed.weaknesses,base.weaknesses);assert.deepEqual(printed.resistances,base.resistances);scenarios++;
 const flare=printed.attacks[0];assert.equal(flare.name,'Flare');assert.deepEqual(flare.cost,['Fire','Colorless']);assert.equal(flare.damage,'20');assert.equal(flare.text,'');
 // The Fire symbol must be paid; an arbitrary Energy cannot satisfy it.
 {const g=game(v);g.players[0].active.energies=[v.fire,v.water];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);assert.equal(g.pendingDecision,null);scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.fire,v.dce];act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.fire];reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.dce];reject(g,0,'attack',{attackIndex:0});scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.grass,v.water];reject(g,0,'attack',{attackIndex:0});scenarios++;}
 // Fire remains the attack type even when the required Colorless unit is
 // supplied by a different Basic Energy or by Double Colorless.
 {const g=game(v);g.players[0].active.energies=[v.fire,v.water];g.players[1].active=unit(v.venusaur);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,40);scenarios++;}
 // Water Weakness doubles Seel's Water-type Headbutt against Growlithe.
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id);g.players[1].active=unit(v.seel,[v.water]);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,20);scenarios++;}
}
console.log(`PASS Growlithe Flare and Weakness: ${scenarios} reducer scenarios`);
