'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const variants=[
 {id:'base1-33',format:'classic',size:60,prizes:6,grass:'base1-99',dce:'base1-96',fire:'base1-98'},
 {id:'base1-33',format:'neo-theme',size:60,prizes:6,grass:'base1-99',dce:'base1-96',fire:'base1-98'},
 {id:'base1-33',format:'online-preview',size:60,prizes:6,grass:'base1-99',dce:'base1-96',fire:'base1-98'},
 {id:'base1-33',format:'online-preview',size:40,prizes:4,grass:'base1-99',dce:'base1-96',fire:'base1-98'},
 {id:'base4-47',format:'online-preview',size:60,prizes:6,grass:'base4-127',dce:'base4-124',fire:'base4-126'},
 {id:'base4-47',format:'online-preview',size:40,prizes:4,grass:'base4-127',dce:'base4-124',fire:'base4-126'}
];
const unit=(id,energies=[],damage=0,status=null,poison=false,poisonDamage=10)=>({id,under:[],energies:[...energies],attachedTrainers:[],damage,status,poison,poisonDamage,playedTurn:0});
function game(v){const deck=list('base1:Brushfire').slice(0,v.size);const g=createGame({decks:[deck,deck],format:v.format,deckSize:v.size,prizeCount:v.prizes,seed:53});g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;g.over=false;for(const p of g.players){p.active=unit('base1-2');p.bench=[];p.hand=[];p.discard=[];p.deck=Array(20).fill(v.grass);p.prizes=Array(v.prizes).fill(v.grass);p.prizeFaceUp=Array(v.prizes).fill(false);p.energyUsed=false;p.turnPlays=[];p.retreated=false;}g.players[0].active=unit(v.id);return g;}
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return r;}
function reject(g,side,type,payload={}){const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,'illegal Kakuna action should be rejected');assert.deepEqual(g,before,'rejected attack must be atomic');}
function coinSequence(g,results){for(let seed=0;seed<100000;seed++){let state=seed,match=true;for(const expected of results){state=(Math.imul(state,1664525)+1013904223)>>>0;if((state>=0x80000000)!==expected){match=false;break;}}if(match){g.rngState=seed;return;}}throw Error('coin sequence not found');}
let scenarios=0;
for(const v of variants){
 const printed=CATALOG.get(v.id),base=CATALOG.get('base1-33');
 assert.deepEqual(printed.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),base.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),'Base Set 2 reprint must match Base Set attacks');
 assert.equal(printed.attacks[0].text,"Flip a coin. If heads, prevent all damage done to Kakuna during your opponent's next turn. (Any other effects of attacks still happen.)");
 assert.deepEqual(printed.attacks[0].cost,['Colorless','Colorless']);assert.equal(printed.attacks[1].text,'Flip a coin. If heads, the Defending Pokémon is now Poisoned.');assert.deepEqual(printed.attacks[1].cost,['Grass','Grass']);scenarios++;
 // Stiffen requires two Colorless units, so Double Colorless Energy pays both.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);coinSequence(g,[true]);act(g,0,'attack',{attackIndex:0});assert.ok(g.players[0].active.shield);assert.equal(g.players[0].active.shield.preventDamage,true);assert.equal(g.players[0].active.shield.allEffects,false);scenarios++;}
 // Tails creates no protection; a lone DCE also fails to meet Poisonpowder's two Grass requirement.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);coinSequence(g,[false]);act(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].active.shield,undefined);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.dce]);reject(g,0,'attack',{attackIndex:1});scenarios++;}
 // Poisonpowder's coin changes the Special Condition only; tails still deals 20.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass]);coinSequence(g,[true]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);assert.equal(g.players[1].active.poison,true);assert.equal(g.players[1].active.poisonDamage,10);scenarios++;}
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass]);coinSequence(g,[false]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,20);assert.equal(g.players[1].active.poison,false);scenarios++;}
 // Standard Poison deals 10 at the Checkup immediately following the attack, in addition to its 20 attack damage.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass]);coinSequence(g,[true]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);assert.equal(g.turn,1);act(g,1,'end_turn');assert.equal(g.players[1].active.damage,40);scenarios++;}
 // Reapplying standard Poison replaces stronger Poison rather than stacking or preserving its 20 damage rate.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass]);g.players[1].active=unit('base1-2',[],0,null,true,20);coinSequence(g,[true]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.poisonDamage,10);assert.equal(g.players[1].active.damage,30);act(g,1,'end_turn');assert.equal(g.players[1].active.damage,40);scenarios++;}
 // Poison can coexist with Confusion; applying Poisonpowder leaves the other condition intact.
 {const g=game(v);g.players[0].active=unit(v.id,[v.grass,v.grass]);g.players[1].active=unit('base1-2',[],0,'Confused');coinSequence(g,[true]);act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.status,'Confused');assert.equal(g.players[1].active.poison,true);scenarios++;}
 // Heads protects from the next turn's attack damage, but Poisonpowder's other effect still happens.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);g.players[1].active=unit('base1-30',[v.grass,v.grass,v.grass]);coinSequence(g,[true,true]);act(g,0,'attack',{attackIndex:0});assert.equal(g.turn,1);act(g,1,'attack',{attackIndex:1});assert.equal(g.players[0].active.damage,10);assert.equal(g.players[0].active.poison,true);assert.equal(g.players[0].active.poisonDamage,10);scenarios++;}
 // The shield expires after the opponent's protected turn; later damage is not prevented.
 {const g=game(v);g.players[0].active=unit(v.id,[v.dce]);g.players[1].active=unit('base1-7',['base1-97']);coinSequence(g,[true]);act(g,0,'attack',{attackIndex:0});act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,0);assert.ok(g.players[0].active.shield.expires<=g.turnSerial);act(g,0,'end_turn');act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,20);scenarios++;}
 // Fire weakness doubles an incoming Growlithe Flare against Kakuna.
 {const g=game(v);g.turn=1;g.players[0].active=unit(v.id);g.players[1].active=unit('base1-28',[v.fire,v.grass]);act(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,40);scenarios++;}
}
console.log(`PASS Kakuna Stiffen and Poisonpowder: ${scenarios} reducer scenarios`);
