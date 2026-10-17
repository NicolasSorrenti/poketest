'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const folder=__dirname;
const data=fs.readdirSync(folder+'/cards').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(folder+'/cards/'+f)));
const context={Math,console,window:{},document:{getElementById:()=>({classList:{add(){},remove(){}},style:{},appendChild(){}}),querySelector:()=>null},setTimeout(){},clearTimeout(){},innerWidth:1600};
vm.createContext(context);
vm.runInContext(fs.readFileSync(folder+'/engine.js','utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),context);
for(const f of ['trainer_rules_v058.js','trainer_rules_v059.js','trainer_rules_v060.js','trainer_rules_v061.js','trainer_rules_v062.js','trainer_rules_v063.js','trainer_rules_v064.js'])vm.runInContext(fs.readFileSync(folder+'/'+f,'utf8'),context);
context.fixtures=data;
function run(s){return vm.runInContext(s,context)}
function setup(pokemonId,attackName){
 run(`lookup=new Map(fixtures.map(c=>[c.id,c]));render=()=>{};battlefieldAttack=()=>{};
 engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.over=false;
 engine.turn=0;engine.round=4;engine.turnSerial=12;engine.started=true;engine.stadium=null;
 deckSearchRequest=null;engine._trainer64Esp=null;engine._trainer64Resolving=false;
 engine.players[0].active=unit('${pokemonId}');engine.players[1].active=unit('base1-15');
 engine.players[0].bench=[];engine.players[1].bench=[];
 engine.players[0].prizes=Array(6).fill('base1-97');engine.players[1].prizes=Array(6).fill('base1-98');
 engine.players[0].deck=Array(12).fill('base1-98');engine.players[1].deck=Array(12).fill('base1-97');
 engine.players[0].active.energies=['base1-97','base1-98','base1-99','base1-100','base1-101','base1-102','base1-101','base1-99'];
 engine.players[0].active.attachedTrainers=[{id:'gym1-117',expireAtEndSerial:engine.turnSerial}];`);
 const idx=run(`engine.card(engine.me.active).attacks.findIndex(a=>a.name===${JSON.stringify(attackName)})`);
 assert.ok(idx>=0,'Missing attack '+attackName);
 return {g:run('engine'),idx};
}
let tests=0;
function test(name,fn){try{fn();tests++}catch(e){console.error('FAILED:',name);throw e}}
// deterministic coin source; first preview and subsequent rerolls are
// intentionally distinguishable so the battle's result can be checked.
function preset(list){context.flips=list.slice();run('coin=()=>{if(!flips.length)throw Error("Unexpected extra coin");return flips.shift()}')}
function prompt(){return run('deckSearchRequest')}
test('One-coin Sabrina Quick Attack exposes a keep-or-reroll choice without dealing premature damage',()=>{
 const {g,idx}=setup('gym2-94','Quick Attack');preset([false]);
 assert.equal(g.attack(idx,null,true),null);assert.equal(g.foe.active.damage,0);
 assert.equal(prompt().options.length,2);assert.deepEqual(Array.from(g._trainer64Esp.original),[false]);
 assert.equal(prompt().execute('keep'),true);assert.equal(g.foe.active.damage,10);
 assert.equal(g._trainer64Esp,null);
});
test('Reroll replaces a Tails result with Heads and modifies actual attack damage',()=>{
 const {g,idx}=setup('gym2-94','Quick Attack');preset([false,true]);
 assert.equal(g.attack(idx,null,true),null);assert.equal(prompt().execute('reroll'),true);
 assert.equal(g.foe.active.damage,30);assert.equal(context.flips.length,0);
});
test('Two-coin Sonic Distortion rerolls both flips instead of just the first',()=>{
 const {g,idx}=setup('gym1-34','Sonic Distortion');preset([false,false,true,false]);
 assert.equal(g.attack(idx,null,true),null);assert.deepEqual(Array.from(g._trainer64Esp.original),[false,false]);
 assert.equal(prompt().execute('reroll'),true);assert.equal(g.foe.active.status,'Confused');
});
test('Three-coin Healing Pollen rerolls the complete set and heals based on chosen results',()=>{
 const {g,idx}=setup('gym1-34','Healing Pollen');g.me.active.damage=50;
 preset([false,false,false,true,true,true]);
 assert.equal(g.attack(idx,null,true),null);assert.equal(prompt().execute('reroll'),true);
 assert.equal(g.me.active.damage,20);
});
test('ESP allows re-flipping Removal Beam only when the target has Energy',()=>{
 const {g,idx}=setup('gym1-96','Removal Beam');g.foe.active.energies=['base1-98'];preset([false,true]);
 assert.equal(g.attack(idx,null,true),null);
 assert.match(prompt().label,/Removal Beam/);
 assert.equal(prompt().execute('reroll'),true);
 assert.equal(context.flips.length,0);
});
test('Removal Beam with no target Energy does not offer an unnecessary ESP reroll',()=>{
 const {g,idx}=setup('gym1-96','Removal Beam');
 g.foe.active.energies=[];
 assert.equal(g.attack(idx,null,true),true);
 assert.equal(g._trainer64Esp,null);
 assert.equal(g.foe.active.damage,20);
});
test('Shadow Attack can reroll its conditional flip with a selected opposing Bench target',()=>{
 const {g,idx}=setup('gym2-55','Shadow Attack');
 g.foe.bench=[run("unit('base1-7')")];g.me.active.energies=Array(6).fill('base1-101');preset([false,true]);
 assert.equal(g.attack(idx,0,true),null);
 assert.match(prompt().label,/Shadow Attack/);
 assert.equal(g.foe.bench[0].damage,0);
 assert.equal(prompt().execute('reroll'),true);
 assert.equal(g.foe.bench[0].damage,30);
 assert.equal(context.flips.length,0);
});
test('Shadow Attack without opposing Bench cannot preview a non-occurring ESP coin',()=>{
 const {g,idx}=setup('gym2-55','Shadow Attack');
 g.foe.bench=[];
 g.attack(idx,null,true);
 assert.equal(g._trainer64Esp,null);
});
test('Invalid choice is rejected without advancing the game or spending the queued outcomes',()=>{
 const {g,idx}=setup('gym2-94','Quick Attack');preset([false]);
 assert.equal(g.attack(idx,null,true),null);const before=prompt();
 assert.equal(before.execute('invalid'),false);assert.strictEqual(prompt(),before);
 assert.equal(g.foe.active.damage,0);assert.deepEqual(Array.from(g._trainer64Esp.original),[false]);
});
test('Canceling a picker and returning to attack does not give a free new preview flip',()=>{
 const {g,idx}=setup('gym2-94','Quick Attack');preset([false]);
 assert.equal(g.attack(idx,null,true),null);run('deckSearchRequest=null');
 assert.equal(g.attack(idx,null,true),null);assert.deepEqual(Array.from(g._trainer64Esp.original),[false]);
 assert.equal(prompt().execute('keep'),true);assert.equal(g.foe.active.damage,10);
});
test('ESP cannot trigger for an unrelated Pokémon even with an illegally attached copy',()=>{
 const {g,idx}=setup('gym2-94','Quick Attack');g.me.active.id='base1-58';
 const realIndex=g.card(g.me.active).attacks.findIndex(a=>a.name==='Quick Attack');
 if(realIndex>=0){preset([false]);assert.notEqual(g.attack(realIndex,null,true),null);}
 assert.equal(g._trainer64Esp,null);
});
test('Pending ESP state expires on End Turn',()=>{
 const {g,idx}=setup('gym2-94','Quick Attack');preset([false]);
 assert.equal(g.attack(idx,null,true),null);run('deckSearchRequest=null');
 g.end();assert.equal(g._trainer64Esp,null);assert.equal(run('deckSearchRequest'),null);
});

const psychicId='gym2-121';
function borrowed(name){return data.find(c=>c.name===name&&c.supertype==='Trainer').id}

test('Psychic Control refuses a discard slot changed after choice, without stealing a new Trainer',()=>{
 const {g}=setup('gym2-94','Quick Attack');preset([true]);
 g.me.hand=[psychicId];g.foe.discard=[borrowed('Bill')];
 assert.equal(g.trainer(0),null);
 // Opponent discard changed before the delayed choice was confirmed.
 g.foe.discard[0]=borrowed('Switch');
 assert.equal(prompt().execute(0),false);
 assert.deepEqual(Array.from(g.me.hand),[psychicId]);
 assert.deepEqual(Array.from(g.foe.discard),[borrowed('Switch')]);
 assert.equal(g._psychicProxy59,null);
});
test('Psychic Control cancels a delayed borrowed Switch if the source leaves the opposing discard',()=>{
 const {g}=setup('gym2-94','Quick Attack');preset([true]);
 g.me.hand=[psychicId];g.me.bench=[run("unit('base1-7')")];
 g.foe.discard=[borrowed('Switch')];
 assert.equal(g.trainer(0),null);assert.equal(prompt().execute(0),null);
 const original=g.me.active,bench=g.me.bench[0];
 g.foe.discard=[]; // source moved while the borrowed target picker was pending
 assert.equal(prompt().execute(0),false);
 assert.strictEqual(g.me.active,original);assert.strictEqual(g.me.bench[0],bench);
 assert.deepEqual(Array.from(g.me.hand),[psychicId]);
 assert.equal(g._psychicProxy59,null);
 assert.equal(run(`lookup.has(${JSON.stringify('trainer59-proxy-'+borrowed('Switch'))})`),false);
});
test('Psychic Control borrows Switch with target choice and keeps rival card in original discard',()=>{
 const {g}=setup('gym2-94','Quick Attack');preset([true]);
 g.me.hand=[psychicId];g.me.bench=[run("unit('base1-7')")];const original=g.me.active;
 g.foe.discard=[borrowed('Switch')];
 assert.equal(g.trainer(0),null);assert.equal(prompt().execute(0),null);
 assert.match(prompt().label,/borrowed Switch/);
 assert.equal(prompt().execute(0),true);
 assert.strictEqual(g.me.bench[0],original);
 assert.equal(g.me.discard.filter(id=>id===psychicId).length,1);
 assert.equal(g.me.discard.includes('trainer59-proxy-'+borrowed('Switch')),false);
 assert.deepEqual(Array.from(g.foe.discard),[borrowed('Switch')]);
 assert.equal(g._psychicProxy59,null);
});
test('Psychic Control borrows Gust of Wind and the human chooses the opposing Bench target',()=>{
 const {g}=setup('gym2-94','Quick Attack');preset([true]);
 g.me.hand=[psychicId];g.foe.bench=[run("unit('base1-7')")];const active=g.foe.active;
 g.foe.discard=[borrowed('Gust of Wind')];
 assert.equal(g.trainer(0),null);assert.equal(prompt().execute(0),null);
 assert.equal(prompt().execute(0),true);
 assert.strictEqual(g.foe.bench[0],active);
 assert.deepEqual(Array.from(g.foe.discard),[borrowed('Gust of Wind')]);
 assert.equal(g.me.discard.filter(id=>id===psychicId).length,1);
});
test('Psychic Control borrows Potion but heals a legal chosen target only',()=>{
 const {g}=setup('gym2-94','Quick Attack');preset([true]);
 g.me.hand=[psychicId];g.me.active.damage=50;g.foe.discard=[borrowed('Potion')];
 assert.equal(g.trainer(0),null);assert.equal(prompt().execute(0),null);
 assert.equal(prompt().execute(99),false);
 assert.equal(g.me.active.damage,50);
 assert.equal(prompt().execute(-1),true);
 assert.equal(g.me.active.damage,30);
 assert.deepEqual(Array.from(g.foe.discard),[borrowed('Potion')]);
});


test('Counterattack Claws puts exactly two damage counters on the attacker on Heads',()=>{
 const {g}=setup('gym2-94','Quick Attack');g.turn=0;
 g.foe.active.attachedTrainers=[{id:'neo4-97'}];g.foe.active.damage=30;
 g.foe.active.incomingAttack={turnSerial:g.turnSerial,damage:20};
 preset([true]);g.resolveKO();
 assert.equal(g.me.active.damage,20);assert.ok(g.foe.discard.includes('neo4-97'));
 assert.equal(g.foe.active.attachedTrainers.length,0);
 g.resolveKO();assert.equal(g.me.active.damage,20);
});
test('Counterattack Claws is discarded on Tails without counter damage',()=>{
 const {g}=setup('gym2-94','Quick Attack');g.foe.active.attachedTrainers=[{id:'neo4-97'}];
 g.foe.active.damage=20;g.foe.active.incomingAttack={turnSerial:g.turnSerial,damage:10};
 preset([false]);g.resolveKO();assert.equal(g.me.active.damage,0);
 assert.equal(g.foe.discard.filter(id=>id==='neo4-97').length,1);
});
test('Counterattack Claws still deals damage when its attached Pokémon is knocked out',()=>{
 const {g}=setup('gym2-94','Quick Attack');g.foe.bench=[run("unit('base1-7')")];
 g.foe.active.attachedTrainers=[{id:'neo4-97'}];g.foe.active.damage=999;
 g.foe.active.incomingAttack={turnSerial:g.turnSerial,damage:60};
 preset([true]);g.resolveKO();assert.equal(g.me.active.damage,20);
 assert.ok(g.foe.discard.includes('neo4-97'));
 assert.equal(g.foe.active.id,'base1-7');
});


test('Night Spirits rerolls the actual number of Sabrina evolution-line Pokémon in play',()=>{
 const {g,idx}=setup('gym1-58','Night Spirits');
 g.me.bench=[run("unit('gym1-93')"),run("unit('gym1-14')")];
 // There are exactly three Sabrina's Gastly/Haunter/Gengar in play.
 assert.equal(g.me.bench.length,2);
 preset([false,false,false,true,false,false]);
 assert.equal(g.attack(idx,null,true),null);
 assert.equal(g._trainer64Esp.original.length,3);
 assert.equal(prompt().execute('reroll'),true);
 assert.equal(g.foe.active.damage,30);
});
test('Pendulum Curse uses the number of damage counters on the Defending Pokémon',()=>{
 const {g,idx}=setup('gym2-56','Pendulum Curse');
 g.foe.active.damage=20;
 preset([false,false,true,true]);
 assert.equal(g.attack(idx,null,true),null);
 assert.equal(g._trainer64Esp.original.length,2);
 assert.equal(prompt().execute('reroll'),true);
 assert.equal(g.foe.active.damage,60);
});

test('ESP is discarded at the end of the turn even when not used',()=>{
 const {g}=setup('gym2-94','Quick Attack');
 g.end();assert.equal(g.players[0].active.attachedTrainers.length,0);
 assert.equal(g.players[0].discard.filter(id=>id==='gym1-117').length,1);
});
test('ESP does not prompt or alter a non-coin attack',()=>{
 const {g}=setup('gym2-94','Psyscan');const i=g.card(g.me.active).attacks.findIndex(a=>a.name==='Psyscan');
 assert.notEqual(g.attack(i,null,true),null);assert.equal(g._trainer64Esp,null);
 assert.equal(run('deckSearchRequest'),null);
});

test('Counterattack Claws can knock out the attacking Pokémon while the defending Pokémon also faints',()=>{
 const {g}=setup('gym2-94','Quick Attack');
 g.me.active.damage=40;g.me.bench=[run("unit('base1-7')")];
 g.foe.bench=[run("unit('base1-7')")];
 g.foe.active.damage=999;g.foe.active.attachedTrainers=[{id:'neo4-97'}];
 g.foe.active.incomingAttack={turnSerial:g.turnSerial,damage:60};
 const humanPrizes=g.me.prizes.length,enemyPrizes=g.foe.prizes.length;
 preset([true]);g.resolveKO();
 assert.equal(g.players[0].active.id,'base1-7');
 assert.equal(g.players[1].active.id,'base1-7');
 assert.equal(g.me.prizes.length,humanPrizes-1);
 assert.equal(g.foe.prizes.length,enemyPrizes-1);
});


test('Ecogym returns Energy discarded by Koga Muk reactive Pokémon Power to the attacking owner',()=>{
 const {g,idx}=setup('gym2-94','Quick Attack');
 g.me.active.attachedTrainers=[];g.me.active.energies=['base1-101','base1-99'];
 g.foe.active=run("unit('gym2-26')");g.stadium={id:'neo1-84',owner:0};
 preset([false,true]);assert.equal(g.attack(idx,null,true),true);
 assert.deepEqual(Array.from(g.me.active.energies),['base1-101']);
 assert.ok(g.me.hand.includes('base1-99'));
 assert.equal(g.me.discard.includes('base1-99'),false);
});
test('Without Ecogym, an Energy Drain discard reaches the discard pile',()=>{
 const {g,idx}=setup('gym2-94','Quick Attack');
 g.me.active.attachedTrainers=[];g.me.active.energies=['base1-101','base1-99'];
 g.foe.active=run("unit('gym2-26')");
 preset([false,true]);assert.equal(g.attack(idx,null,true),true);
 assert.ok(g.me.discard.includes('base1-99'));
 assert.equal(g.me.hand.includes('base1-99'),false);
});
test('Brock Protection prevents Energy Drain despite the successful Power flip',()=>{
 const {g}=setup('gym2-94','Quick Attack');
 g.me.active=run("unit('gym1-21')");g.me.active.energies=['base1-97','base1-97'];
 g.me.active.attachedTrainers=[{id:'gym2-101'}];
 g.foe.active=run("unit('gym2-26')");
 preset([false,true]);assert.equal(g.attack(0,null,true),true);
 assert.deepEqual(Array.from(g.me.active.energies),['base1-97','base1-97']);
 assert.equal(g.me.discard.includes('base1-97'),false);
});


test('Ecogym does not retrieve Double Colorless Energy discarded by an opposing Power',()=>{
 const {g,idx}=setup('gym2-94','Quick Attack');
 g.me.active.attachedTrainers=[];g.me.active.energies=['base1-101','base1-96'];
 g.foe.active=run("unit('gym2-26')");g.stadium={id:'neo1-84',owner:0};
 preset([false,true]);assert.equal(g.attack(idx,null,true),true);
 assert.ok(g.me.discard.includes('base1-96'));
 assert.equal(g.me.hand.includes('base1-96'),false);
});


test('Ecogym does not return Energy from a Pokémon knocked out by an attack',()=>{
 const {g,idx}=setup('gym2-94','Quick Attack');g.me.active.attachedTrainers=[];
 g.foe.active.energies=['base1-102'];g.foe.active.damage=999;
 g.foe.bench=[run("unit('base1-7')")];g.stadium={id:'neo1-84',owner:0};
 preset([false]);assert.equal(g.attack(idx,null,true),true);
 assert.ok(g.foe.discard.includes('base1-102'));
 assert.equal(g.foe.hand.includes('base1-102'),false);
});


test('Canceling Psychic Control removes the temporary borrowed card but never rolls again for free',()=>{
 const {g}=setup('gym2-94','Quick Attack');preset([true]);
 g.me.hand=[psychicId];g.me.bench=[run("unit('base1-7')")];
 g.foe.discard=[borrowed('Switch')];
 assert.equal(g.trainer(0),null);assert.equal(prompt().execute(0),null);
 const proxy='trainer59-proxy-'+borrowed('Switch');
 assert.ok(run(`lookup.has(${JSON.stringify(proxy)})`));
 g.cancelPsychic59();assert.equal(run(`lookup.has(${JSON.stringify(proxy)})`),false);
 assert.deepEqual(Array.from(g.me.hand),[psychicId]);
 assert.deepEqual(Array.from(g.foe.discard),[borrowed('Switch')]);
 assert.equal(g.trainer(0),null);assert.ok(prompt().options.length);
});

console.log(`PASS v0.6.4: ${tests} Trainer ESP, Psychic Control and reactive Tool scenarios`);
