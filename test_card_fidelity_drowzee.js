'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {id:'base1-49',format:'classic',deckSize:60,prizes:6,psychic:'base1-101',colorless:'base1-96'},
 {id:'base1-49',format:'neo-theme',deckSize:60,prizes:6,psychic:'base1-101',colorless:'base1-96'},
 {id:'base1-49',format:'online-preview',deckSize:60,prizes:6,psychic:'base1-101',colorless:'base1-96'},
 {id:'base1-49',format:'online-preview',deckSize:40,prizes:4,psychic:'base1-101',colorless:'base1-96'},
 {id:'base4-73',format:'online-preview',deckSize:60,prizes:6,psychic:'base4-129',colorless:'base4-124'},
 {id:'base4-73',format:'online-preview',deckSize:40,prizes:4,psychic:'base4-129',colorless:'base4-124'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire').slice(0,v.deckSize);
 const g=createGame({format:v.format,decks:[deck,deck],deckSize:v.deckSize,prizeCount:v.prizes,seed:41});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.psychic);p.prizes=Array(v.prizes).fill(v.psychic);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Drowzee attack must be rejected');assert.deepEqual(g,before,'rejected Drowzee attack must be atomic');}
function coin(g,heads){for(let seed=0;seed<10000;seed++){const next=(Math.imul(seed,1664525)+1013904223)>>>0;if((next>=0x80000000)===heads){g.rngState=seed;return;}}throw Error('coin seed not found');}

let scenarios=0;
for(const v of variants){
 const printed=CATALOG.get(v.id),base=CATALOG.get('base1-49');
 assert.equal(printed.name,'Drowzee');assert.equal(printed.hp,'50');assert.deepEqual(printed.types,['Psychic']);
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),'Base Set 2 attacks must match Base Set text and costs');
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),[
  {name:'Pound',cost:['Colorless'],damage:'10',text:''},
  {name:'Confuse Ray',cost:['Psychic','Psychic'],damage:'10',text:'Flip a coin. If heads, the Defending Pokémon is now Confused.'}
 ]);scenarios++;

 // Pound takes one generic Energy. Double Colorless pays the cost but never
 // changes its printed 10 damage; no Energy means no partial state change.
 {const g=game(v);g.players[0].active=unit(v.id,[v.colorless]);g.players[1].active=unit('base1-58');act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,10);assert.equal(g.players[0].discard.length,0);assert.equal(g.pendingDecision,null);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id);reject(g,0,'attack',{attackIndex:0});scenarios++;}

 // Heads applies Confusion even when Chansey's Psychic Resistance reduces
 // the 10 attack damage to zero, and replaces an existing Asleep condition.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic]);g.players[1].active=unit('base1-3');g.players[1].active.status='Asleep';coin(g,true);
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].active.status,'Confused');assert.equal(g.turn,1);assert.equal(g.pendingDecision,null);scenarios++;}

 // Tails still deals damage (including the target's Psychic Weakness) but
 // does not replace an existing Paralyzed condition.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic]);g.players[1].active=unit(v.id);g.players[1].active.status='Paralyzed';coin(g,false);
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,20);assert.equal(g.players[1].active.status,'Paralyzed');assert.equal(g.pendingDecision,null);scenarios++;}

 // Two Psychic Energy are required; a Psychic plus Double Colorless is not
 // a legal substitute for the second specifically typed Energy.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.colorless]);reject(g,0,'attack',{attackIndex:1});scenarios++;}

 // Follow the inflicted condition through the opponent's next attack: tails
 // causes a 20-point self-attack; heads lets Pound resolve normally. The
 // ordinary attack Energy cost is checked but the attached card is retained.
 for(const succeeds of [false,true]){const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic]);g.players[1].active=unit('base1-58',[v.colorless]);coin(g,true);
  act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.status,'Confused');const damageAfterRay=g.players[0].active.damage;
  coin(g,succeeds);act(g,g.turn,'attack',{attackIndex:0});
  assert.deepEqual(g.players[1].active.energies,[v.colorless]);
  if(succeeds){assert.equal(g.players[0].active.damage,damageAfterRay+10);assert.equal(g.players[1].active.damage,10);}
  else{assert.equal(g.players[1].active.damage,30);assert.equal(g.players[0].active.damage,damageAfterRay);}
  assert.equal(g.pendingDecision,null);scenarios++;}
}
console.log(`PASS Drowzee Pound and Confuse Ray, including coin/status and Base Set 2 parity (${scenarios} reducer scenarios)`);
