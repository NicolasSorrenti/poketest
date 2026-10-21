'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const ext58=fs.readFileSync(__dirname+'/trainer_rules_v058.js','utf8');
const ext59=fs.readFileSync(__dirname+'/trainer_rules_v059.js','utf8');
const cards=fs.readdirSync(__dirname+'/cards').filter(n=>n.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(__dirname+'/cards/'+f)));
let coinValue=0.01;const rng=Object.create(Math);rng.random=()=>coinValue;
const ctx={Math:rng,console,window:{NeoCardCorrections:{}},document:{getElementById:()=>({classList:{add(){},remove(){}},textContent:'',style:{},appendChild(){},querySelectorAll(){return []}}),querySelector:()=>null},setTimeout:()=>0,clearTimeout(){},innerWidth:1600};
vm.createContext(ctx);
vm.runInContext(src.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
vm.runInContext(ext58,ctx);vm.runInContext(ext59,ctx);
function fresh({hand=[],deck=[],discard=[],rivalDiscard=[],rivalDeck=[],meActive='base1-50',foeActive='base1-58',bench=[],foeBench=[],myEnergy=[],enemyEnergy=[]}={}){
 vm.runInContext(`lookup=new Map();engine.players=[statePlayer('Human',[]),statePlayer('Rival',[])];engine.turn=0;engine.round=3;engine.turnSerial=5;engine.phase='game';engine.over=false;engine.started=true;engine.stadium=null;engine._psychicProxy59=null;engine._trainer59Coins=null;render=()=>{};deckSearchRequest=null;selected=null;`,ctx);
 const g=vm.runInContext('engine',ctx),mk=vm.runInContext('unit',ctx),map=vm.runInContext('lookup',ctx);
 for(const c of cards)map.set(c.id,c);
 const p=g.players[0],f=g.players[1];p.hand=hand.slice();p.deck=deck.slice();p.discard=discard.slice();f.discard=rivalDiscard.slice();f.deck=rivalDeck.slice();
 p.active=mk(meActive);p.active.energies=myEnergy.slice();f.active=mk(foeActive);f.active.energies=enemyEnergy.slice();p.bench=bench.map(mk);f.bench=foeBench.map(mk);
 p.prizes=['base1-95'];f.prizes=['base1-94'];coinValue=0.01;
 return {g,p,f};
}
let runs=0;function test(label,cb){try{cb();runs++;}catch(e){console.error('FAILED',label);throw e}}
test('Quiz #1 checks height and draws two to the correct side',()=>{
 const {g,p,f}=fresh({hand:['gym1-97','base1-4'],deck:['base1-98','base1-99','base1-100'],rivalDeck:['base1-98','base1-99','base1-100']});
 coinValue=0.99;const wasP=p.hand.length,wasF=f.hand.length;
 assert.equal(g.trainer59(0,[1]),true);assert.ok(p.discard.includes('gym1-97'));assert.equal(p.hand.length+f.hand.length,wasP+wasF-1+2);
});
test('Quiz #3 announces attack and opponent guesses identity',()=>{
 const {g,p,f}=fresh({hand:['gym2-112','base1-4'],deck:Array(8).fill('base1-98'),rivalDeck:Array(8).fill('base1-98')});
 assert.equal(g.trainer59(0,[1,0]),true);assert.ok(p.discard.includes('gym2-112'));assert.equal(p.hand.length+f.hand.length,4);
});
test('Secret Plan puts any card facedown, then discards non-Basic without a Prize',()=>{
 const {g,p,f}=fresh({hand:['gym2-107','base1-98']});const before=f.prizes.length;
 assert.equal(g.trainer59(0,[1]),true);assert.equal(p.bench.length,1);assert.equal(g.card(p.bench[0]).name,'Face-down Pokémon');
 p.bench[0].damage=10;g.resolveKO();assert.equal(p.bench.length,0);assert.ok(p.discard.includes('base1-98'));assert.equal(f.prizes.length,before);
});
test('Secret Plan rejects a pending choice if the Bench becomes full',()=>{
 const {g,p}=fresh({hand:['gym2-107','base1-98']});
 assert.equal(g.trainer59(0),null);
 const pending=vm.runInContext('deckSearchRequest',ctx);
 assert.ok(pending);
 const make=vm.runInContext('unit',ctx);
 p.bench=Array.from({length:5},()=>make('base1-50'));
 assert.equal(pending.execute(1),false);
 assert.deepEqual(p.hand,['gym2-107','base1-98']);
 assert.equal(p.bench.length,5);
});
test('Secret Plan reveals Basic Pokémon correctly',()=>{
 const {g,p}=fresh({hand:['gym2-107','base1-50']});assert.equal(g.trainer59(0,[1]),true);
 const u=p.bench[0];assert.equal(g.revealSecretPlan(u),true);assert.equal(g.card(u).name,'Gastly');assert.equal(p.bench.length,1);
});
test('Psychic Control replays Bill without stealing opponent discard card',()=>{
 const {g,p,f}=fresh({hand:['gym2-121'],rivalDiscard:['base1-91'],deck:Array(7).fill('base1-98')});
 assert.equal(g.trainer59(0,[0]),true);assert.equal(p.hand.length,2);assert.ok(p.discard.includes('gym2-121'));assert.equal(p.discard.filter(id=>id==='base1-91').length,0);assert.equal(f.discard[0],'base1-91');
});
test('Psychic Control refuses a pending replay after its source card leaves hand',()=>{
 const {g,p,f}=fresh({hand:['gym2-121'],rivalDiscard:['base1-91'],deck:Array(7).fill('base1-98')});
 coinValue=0.01;
 assert.equal(g.trainer59(0),null);
 const prompt=vm.runInContext('deckSearchRequest',ctx);
 assert.ok(prompt);
 p.discard.push(p.hand.shift());
 assert.equal(prompt.execute(0),false);
 assert.equal(g._psychicProxy59??null,null);
 assert.deepEqual(p.hand,[]);
 assert.deepEqual(f.discard,['base1-91']);
});
test('Psychic Control invalid choices leave hand and discard unchanged',()=>{
 const {g,p,f}=fresh({hand:['gym2-121'],rivalDiscard:['base1-91']});
 assert.equal(g.trainer59(0,[8]),false);assert.equal(p.hand.length,1);assert.equal(f.discard.length,1);
});
test('Chaos Gym failed coin consumes Bill; opposing CPU can use it',()=>{
 const {g,p,f}=fresh({hand:['base1-91'],rivalDeck:Array(7).fill('base1-98')});g.stadium={id:'gym2-102',owner:1};coinValue=0.99;
 assert.equal(g.trainer(0),true);assert.deepEqual(p.hand,[]);assert.ok(p.discard.includes('base1-91'));assert.equal(f.hand.length,2);assert.ok(!f.discard.includes('base1-91'));
});
test('Chaos Gym successful coin allows normal Trainer usage',()=>{
 const {g,p}=fresh({hand:['base1-91'],deck:Array(7).fill('base1-98')});g.stadium={id:'gym2-102',owner:1};
 assert.equal(g.trainer(0),true);assert.equal(p.hand.length,2);assert.equal(p.discard.filter(id=>id==='base1-91').length,1);
});
test('Psychic Control performs a selected-cost Trainer and retains the original rival card',()=>{
 const {g,p,f}=fresh({hand:['gym2-121','base1-98','base1-99'],rivalDiscard:['base1-71'],deck:['base1-4']});
 assert.equal(g.trainer59(0,[0]),null);assert.ok(g._psychicProxy59);
 assert.equal(g.trainer58(3,[[1,2],0]),true);
 assert.ok(p.hand.includes('base1-4'));assert.ok(p.discard.includes('gym2-121'));
 assert.equal(f.discard.filter(id=>id==='base1-71').length,1);
 assert.ok(!p.discard.some(id=>id.startsWith('trainer59-proxy-')));
});
test('Cancelling Psychic Control removes its transient proxy without spending cards',()=>{
 const {g,p,f}=fresh({hand:['gym2-121','base1-98'],rivalDiscard:['base1-71']});
 assert.equal(g.trainer59(0,[0]),null);assert.ok(g._psychicProxy59);
 g.cancelPsychic59();assert.equal(p.hand.length,2);assert.equal(p.discard.length,0);assert.equal(f.discard[0],'base1-71');
});
test('AI makes the opponent decision for Erika (human chooses only own draw)',()=>{
 const {g,p,f}=fresh({hand:['base2-69'],deck:Array(9).fill('base1-98'),rivalDeck:Array(9).fill('base1-99')});
 const erika=cards.find(c=>c.name==='Erika');p.hand[0]=erika.id;
 assert.equal(g.trainer58(0,[2]),true);assert.equal(p.hand.length,2);
 assert.ok(f.hand.length<=3);assert.equal(p.discard.length,1);
});
test('Blaine extra Fire attachments stay on one chosen Blaine Pokémon',()=>{
 const blaine=cards.find(c=>c.name==='Blaine'&&c.supertype==='Trainer');
 const {g,p}=fresh({hand:[blaine.id,'base1-98','base1-98'],meActive:'gym1-1',bench:['gym2-43']});
 assert.equal(g.trainer58(0),true);
 assert.equal(g.attach(0,-1),true);
 assert.equal(g.attach(0,0),false);
 assert.equal(g.attach(0,-1),true);
 assert.equal(p.active.energies.length,2);
});
test('Counterattack Claws retaliates for two damage counters and discards itself',()=>{
 const {g,p,f}=fresh({meActive:'base1-50',foeActive:'base1-58'});
 g.turn=1;g.round=3;g.turnSerial=6;
 p.active.attachedTrainers=[{id:'neo4-97'}];p.active.damage=20;p.active.incomingAttack={turnSerial:6,damage:20};
 assert.equal(f.active.damage,0);g.resolveKO();assert.equal(f.active.damage,20);assert.ok(p.discard.includes('neo4-97'));
 g.resolveKO();assert.equal(f.active.damage,20);
});
test('EXP.ALL saves exactly one Basic Energy from Active Knock Out',()=>{
 const {g,p,f}=fresh({meActive:'base1-50',bench:['base1-58']});
 g.turn=1;g.turnSerial=6;p.active.damage=100;p.active.energies=['base1-98'];p.active.incomingAttack={turnSerial:6,damage:100};p.bench[0].attachedTrainers=[{id:'neo4-93'}];
 g.resolveKO();assert.ok(p.active?.energies.includes('base1-98'));assert.ok(p.discard.includes('neo4-93'));assert.equal(p.active.attachedTrainers.length,0);
});
test('Poké Ball on Heads with empty deck still resolves and discards the Trainer',()=>{
 const {g,p}=fresh({hand:['base2-64'],deck:['base1-98']});
 assert.equal(g.trainer(0),true);assert.equal(p.hand.length,0);assert.ok(p.discard.includes('base2-64'));
});
test('Poké Ball on Heads allows refusing to take a Pokémon',()=>{
 const {g,p}=fresh({hand:['base2-64'],deck:['base1-4']});
 assert.equal(g.trainer58(0,[-1]),true);assert.equal(p.deck.length,1);assert.equal(p.hand.length,0);
});
test('Brock Protection prevents Energy Removal without spending the Trainer',()=>{
 const {g,p,f}=fresh({hand:['base1-92'],enemyEnergy:['base1-98']});
 f.active.attachedTrainers=[{id:'gym2-101'}];
 assert.equal(g.trainer58(0),false);assert.equal(f.active.energies.length,1);assert.equal(p.hand.length,1);
});
test('Ecogym returns opposing non-Colorless Energy to its owner, not their discard',()=>{
 const {g,p,f}=fresh({hand:['base1-92'],enemyEnergy:['base1-98']});g.stadium={id:'neo1-84',owner:1};
 assert.equal(g.trainer58(0,[-1,0]),true);assert.ok(f.hand.includes('base1-98'));assert.equal(f.discard.length,0);
});
test('Charity attached to survivor returns to hand instead of discard at turn end',()=>{
 const {g,p}=fresh({meActive:'base1-50'});
 p.active.attachedTrainers=[{id:'gym1-99',expireAtEndSerial:5}];
 g.end();assert.ok(p.hand.includes('gym1-99'));assert.ok(!p.discard.includes('gym1-99'));
});
test('Chaos Gym does not consume a Trainer while Trainer-locking effect is active',()=>{
 const {g,p}=fresh({hand:['base1-91']});g.stadium={id:'gym2-102',owner:1};p.trainerLockUntil=g.round;
 coinValue=0.99;assert.equal(g.trainer(0),false);assert.deepEqual(p.hand,['base1-91']);
});
console.log(`PASS v0.5.9 ${runs} Trainer regression tests`);
