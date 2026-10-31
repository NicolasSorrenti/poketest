'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');

const variants=[
 {id:'base1-50',format:'classic',deckSize:60,prizes:6,psychic:'base1-101',fire:'base1-98',grass:'base1-99',dce:'base1-96'},
 {id:'base1-50',format:'neo-theme',deckSize:60,prizes:6,psychic:'base1-101',fire:'base1-98',grass:'base1-99',dce:'base1-96'},
 {id:'base1-50',format:'online-preview',deckSize:60,prizes:6,psychic:'base1-101',fire:'base1-98',grass:'base1-99',dce:'base1-96'},
 {id:'base1-50',format:'online-preview',deckSize:40,prizes:4,psychic:'base1-101',fire:'base1-98',grass:'base1-99',dce:'base1-96'},
 {id:'base4-75',format:'online-preview',deckSize:60,prizes:6,psychic:'base4-129',fire:'base4-126',grass:'base4-127',dce:'base4-124'},
 {id:'base4-75',format:'online-preview',deckSize:40,prizes:4,psychic:'base4-129',fire:'base4-126',grass:'base4-127',dce:'base4-124'}
];
const unit=(id,energies=[])=>({id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0});
function game(v){
 const deck=list('base1:Brushfire').slice(0,v.deckSize);
 const g=createGame({format:v.format,decks:[deck,deck],deckSize:v.deckSize,prizeCount:v.prizes,seed:53});
 g.phase='game';g.turn=0;g.round=3;g.turnSerial=6;g.startingPlayer=0;g.over=false;
 for(const p of g.players){p.active=unit('base1-3');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.psychic);p.prizes=Array(v.prizes).fill(v.psychic);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}
 return g;
}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function choose(g,side,selected){assert.ok(g.pendingDecision);act(g,side,'choose',{decisionId:g.pendingDecision.id,selected});}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Gastly attack must be rejected');assert.deepEqual(g,before,'rejected Gastly attack must be atomic');}
function seedFor(flips){for(let seed=0;seed<10000;seed++){let state=seed,matched=true;for(const expected of flips){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){matched=false;break;}}if(matched)return seed;}throw Error('coin sequence not found');}
function setCoins(g,flips){g.rngState=seedFor(flips);g.coinFlips=[];g.coinSeq=0;}

let scenarios=0;
for(const v of variants){
 const printed=CATALOG.get(v.id),base=CATALOG.get('base1-50');
 assert.equal(printed.name,'Gastly');assert.equal(printed.hp,'30');assert.deepEqual(printed.types,['Psychic']);
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),'Base Set 2 attacks must match Base Set');
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),[
  {name:'Sleeping Gas',cost:['Psychic'],damage:'',text:'Flip a coin. If heads, the Defending Pokémon is now Asleep.'},
  {name:'Destiny Bond',cost:['Psychic','Colorless'],damage:'',text:"Discard 1 Psychic Energy card attached to Gastly in order to use this attack. If a Pokémon Knocks Out Gastly during your opponent's next turn, Knock Out that Pokémon."}
 ]);scenarios++;

 // Sleeping Gas: heads replaces the prior confusion, then Sleep survives a
 // tails checkup and ends when the opposing turn's checkup is heads. Tails
 // on the attack causes no damage or status.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic]);g.players[1].active.status='Confused';setCoins(g,[true,false]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.damage,0);assert.equal(g.players[1].active.status,'Asleep');assert.equal(g.coinFlips.length,2);setCoins(g,[true]);act(g,1,'end_turn');assert.equal(g.players[1].active.status,null);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic]);setCoins(g,[false]);act(g,0,'attack',{attackIndex:0});
  assert.equal(g.players[1].active.status,null);assert.equal(g.players[1].active.damage,0);assert.equal(g.coinFlips.length,1);scenarios++;}

 // The printed discard is Psychic-specific. One eligible Psychic card is
 // selected automatically even when Fire and Double Colorless are also
 // attached; the attack's ordinary Psychic/Colorless cost remains attached.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.fire,v.dce]);act(g,0,'attack',{attackIndex:1});
  assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[0].active.energies,[v.fire,v.dce]);assert.deepEqual(g.players[0].discard,[v.psychic]);assert.equal(g.players[0].active.destinyBond.expires,8);scenarios++;}
 // Duplicate Basic Psychic Energy has an equivalent discard result and does
 // not require a redundant choice.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.psychic]);act(g,0,'attack',{attackIndex:1});
  assert.equal(g.pendingDecision,null);assert.equal(g.players[0].active.energies.length,1);assert.deepEqual(g.players[0].discard,[v.psychic]);scenarios++;}
 // Rainbow provides Psychic while attached, but is a distinct Energy card;
 // the attacker owns the choice when both it and Basic Psychic are eligible.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,'base5-17']);act(g,0,'attack',{attackIndex:1});
  assert.equal(g.pendingDecision.actor,0);assert.equal(g.pendingDecision.kind,'pay-energy');assert.equal(g.pendingDecision.options.length,2);assert.ok(g.pendingDecision.options.some(x=>x.label.includes('Psychic Energy')));assert.ok(g.pendingDecision.options.some(x=>x.label.includes('Rainbow Energy')));
  choose(g,0,['energy:1']);assert.equal(g.pendingDecision,null);assert.deepEqual(g.players[0].active.energies,[v.psychic]);assert.deepEqual(g.players[0].discard,['base5-17']);scenarios++;}
 // Fire plus Double Colorless cannot satisfy the required Psychic attack cost.
 {const g=game(v);g.players[0].active=unit(v.id,[v.fire,v.dce]);reject(g,0,'attack',{attackIndex:1});scenarios++;}

 // An opposing Fire Punch Knocks out Gastly by attack, so Destiny Bond also
 // Knocks Out Magmar after its own Fire Energy discard is resolved.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.dce]);g.players[1].active=unit('base1-36',[v.fire,v.fire]);act(g,0,'attack',{attackIndex:1});assert.equal(g.turn,1);
  act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active,null);assert.equal(g.players[1].active,null);scenarios++;}
 // WotC's ruling excludes a Knock Out caused by Poison checkup. Foul Gas
 // deals 10 but does not Knock out Gastly; the Poison checkup supplies the
 // final damage and leaves Koffing alive.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.dce]);g.players[0].active.damage=10;g.players[1].active=unit('base1-51',[v.grass,v.grass]);act(g,0,'attack',{attackIndex:1});setCoins(g,[true]);act(g,1,'attack',{attackIndex:0});
  assert.equal(g.players[0].active,null);assert.equal(g.players[1].active.id,'base1-51');assert.equal(g.players[1].active.damage,0);scenarios++;}
 // The effect ends after the opponent's next turn if Gastly survives; a later
 // Fire Punch can knock out Gastly without returning the Knock Out.
 {const g=game(v);g.players[0].active=unit(v.id,[v.psychic,v.dce]);g.players[1].active=unit('base1-36',[v.fire,v.fire]);act(g,0,'attack',{attackIndex:1});act(g,1,'end_turn');act(g,0,'end_turn');
  act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active,null);assert.equal(g.players[1].active.id,'base1-36');assert.equal(g.players[1].active.damage,0);scenarios++;}
}
console.log(`PASS Gastly Sleeping Gas and Destiny Bond, Psychic-only discard, timing and ruling interactions (${scenarios} reducer scenarios)`);
