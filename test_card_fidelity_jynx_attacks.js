'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {id:'base1-31',format:'classic',deckSize:60,prizes:6,psychic:'base1-101',grass:'base1-99',dce:'base1-96',blastoise:'base1-2',machamp:'base1-8'},
 {id:'base4-45',format:'online-preview',deckSize:60,prizes:6,psychic:'base4-129',grass:'base4-127',dce:'base4-124',blastoise:'base1-2',machamp:'base1-8'},
 {id:'base4-45',format:'online-preview',deckSize:40,prizes:4,psychic:'base4-129',grass:'base4-127',dce:'base4-124',blastoise:'base1-2',machamp:'base1-8'}
];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire').slice(0,v.deckSize);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.deckSize,prizeCount:v.prizes,seed:43});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.psychic);p.prizes=Array(v.prizes).fill(v.psychic);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 g.players[0].active=unit(v.id);return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'invalid Jynx attack should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
function coinSequence(g,results){for(let seed=0;seed<100000;seed++){let state=seed,match=true;for(const expected of results){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){match=false;break;}}if(match){g.rngState=seed;return;}}throw Error('coin sequence not found');}
let scenarios=0;
for(const v of variants){
 const printed=CATALOG.get(v.id),base=CATALOG.get('base1-31');
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),base.attacks.map(a=>({name:a.name,cost:a.cost,text:a.text,damage:a.damage})),'Base Set 2 must match Base Set attack text and costs');
 assert.equal(printed.name,'Jynx');assert.deepEqual(printed.weaknesses,base.weaknesses);scenarios++;
 const [slap,meditate]=printed.attacks;
 assert.equal(slap.name,'Doubleslap');assert.deepEqual(slap.cost,['Psychic']);assert.equal(slap.damage,'10x');
 assert.equal(meditate.name,'Meditate');assert.deepEqual(meditate.cost,['Psychic','Psychic','Colorless']);assert.equal(meditate.damage,'20+');
 assert.equal(meditate.text,'Does 20 damage plus 10 more damage for each damage counter on the Defending Pokémon.');
 // Test every ordered two-coin result, not just the number of heads.
 for(const outcomes of [[false,false],[false,true],[true,false],[true,true]]){
  const g=game(v);g.players[0].active.energies=[v.psychic];coinSequence(g,outcomes);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,outcomes.filter(Boolean).length*10);assert.equal(g.pendingDecision,null);scenarios++;
 }
 // Both symbols in Meditate are typed Psychic; DCE only satisfies Colorless.
 {const g=game(v);g.players[0].active.energies=[v.psychic,v.psychic,v.dce];act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,20);scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.psychic,v.dce];reject(g,0,'attack',{attackIndex:1});scenarios++;}
 {const g=game(v);g.players[0].active.energies=[v.psychic,v.psychic];reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Meditate counts existing 10-damage counters on the Defending Pokémon.
 for(const counters of [0,2,3]){const g=game(v);g.players[0].active.energies=[v.psychic,v.psychic,v.grass];g.players[1].active=unit(v.blastoise,[],counters*10);
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,counters*10+20+counters*10);scenarios++;}
 // The counter bonus is calculated before Psychic Weakness doubles damage.
 {const g=game(v);g.players[0].active.energies=[v.psychic,v.psychic,v.grass];g.players[1].active=unit(v.machamp,[],10);
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,70);scenarios++;}
}
console.log(`PASS Jynx Doubleslap and Meditate: ${scenarios} reducer scenarios`);
