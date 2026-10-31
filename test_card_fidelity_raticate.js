'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');

const variants=[
 {id:'base1-40',format:'classic',size:60,prizes:6,energy:['base1-98','base1-97','base1-96'],psychic:'base1-101',fighting:'base1-97',water:'base1-102'},
 {id:'base1-40',format:'neo-theme',size:60,prizes:6,energy:['base1-98','base1-97','base1-96'],psychic:'base1-101',fighting:'base1-97',water:'base1-102'},
 {id:'base1-40',format:'online-preview',size:60,prizes:6,energy:['base1-98','base1-97','base1-96'],psychic:'base1-101',fighting:'base1-97',water:'base1-102'},
 {id:'base1-40',format:'online-preview',size:40,prizes:4,energy:['base1-98','base1-97','base1-96'],psychic:'base1-101',fighting:'base1-97',water:'base1-102'},
 {id:'base4-58',format:'online-preview',size:60,prizes:6,energy:['base4-126','base4-125','base4-124'],psychic:'base4-129',fighting:'base4-125',water:'base4-130'},
 {id:'base4-58',format:'online-preview',size:40,prizes:4,energy:['base4-126','base4-125','base4-124'],psychic:'base4-129',fighting:'base4-125',water:'base4-130'}
];
const unit=(id,energies=[],damage=0)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(v,seed=13){
 const deck=list('base1:Brushfire').slice(0,v.size);
 const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed});
 g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.water);p.prizes=Array(v.prizes).fill(v.water);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} should reject`);assert.deepEqual(g,before,'rejected action must be atomic');}

let scenarios=0;
for(const v of variants){
 const card=CATALOG.get(v.id),base=CATALOG.get('base1-40');
 assert.deepEqual(card.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),'Base Set 2 Raticate must match the Base Set attacks');
 assert.deepEqual(card.attacks[0],{name:'Bite',cost:['Colorless'],damage:'20',text:''});
 assert.deepEqual(card.attacks[1],{name:'Super Fang',cost:['Colorless','Colorless','Colorless'],damage:'?',text:"Does damage to the Defending Pokémon equal to half the Defending Pokémon's remaining HP (rounded up to the nearest 10)."});
 assert.equal(ATTACK.compile(card.attacks[0]).kind,'flat');
 assert.equal(ATTACK.compile(card.attacks[1]).kind,'half-hp');
 scenarios++;

 // Super Fang rounds half of current, not maximum, HP upward to a 10-point
 // amount. Sweep every legal 10-HP remainder for a 120-HP Chansey, including
 // the 10-HP KO boundary and full-health endpoint.
 for(let remaining=10;remaining<=120;remaining+=10){
  const g=game(v);g.players[0].active=unit(v.id,[...v.energy]);g.players[1].active=unit('base1-3',[],120-remaining);
  act(g,0,'attack',{attackIndex:1});
  const expected=Math.ceil(remaining/20)*10;
  if(remaining===10){assert.equal(g.players[1].active,null,'rounded Super Fang KOs when only 10 HP remain');assert.equal(g.pendingAction?.kind,'take_prize');}
  else{assert.equal(g.players[1].active.damage,120-remaining+expected);assert.equal(120-g.players[1].active.damage,remaining-expected);}
  scenarios++;
 }

 // Bite accepts one Colorless payment, including a Double Colorless card,
 // and always deals 20. Super Fang requires three Colorless units and DCE+1
 // Basic Energy meets that printed requirement.
 {const g=game(v);g.players[0].active=unit(v.id,[v.energy[2]]);g.players[1].active=unit('base1-3');act(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,20);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.energy[2],v.energy[0]]);g.players[1].active=unit('base1-3');act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,60);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.energy[2]]);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[]);reject(g,0,'attack',{attackIndex:0});scenarios++;}

 // Incoming type modifiers use Raticate's printed Weakness and Resistance:
 // Fighting doubles, while Psychic damage is reduced by 30 after its damage
 // calculation.
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id);g.players[1].active=unit('base1-7',[v.fighting]);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,40);scenarios++;}
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id,[...v.energy]);g.players[1].active=unit('base1-10',[v.psychic,v.energy[2]]);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,10,'Mewtwo deals 40 before Raticate reduces it by 30');scenarios++;}
}
console.log(`PASS Raticate attacks: ${scenarios} reducer scenarios`);
