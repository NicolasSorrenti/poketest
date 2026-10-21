'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const folder=__dirname;
const source=fs.readFileSync(folder+'/engine.js','utf8').split('async function load()')[0];
const data=fs.readdirSync(folder+'/cards').filter(n=>n.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(folder+'/cards/'+f)));
const ctx={Math,console,window:{NeoCardCorrections:{}},document:{getElementById:()=>({classList:{add(){},remove(){}},style:{},appendChild(){},querySelectorAll(){return []}}),querySelector:()=>null},setTimeout(){},clearTimeout(){},innerWidth:1600};
vm.createContext(ctx);
vm.runInContext(source.replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();'),ctx);
for(const f of ['trainer_rules_v058.js','trainer_rules_v059.js','trainer_rules_v060.js','trainer_rules_v061.js'])vm.runInContext(fs.readFileSync(folder+'/'+f,'utf8'),ctx);
function fresh({hand=[],meActive='base1-58',foeActive='base1-50',myBench=[],foeBench=[],myEnergy=[],enemyEnergy=[]}={}){
 vm.runInContext(`lookup=new Map();engine.players=[statePlayer('Human',[]),statePlayer('Rival',[])];engine.turn=0;engine.round=4;engine.turnSerial=9;engine.phase='game';engine.over=false;engine.started=true;engine.stadium=null;engine._trainer60ExpPrompt=null;engine._trainer58FlipCache=new Map();render=()=>{};deckSearchRequest=null;selected=null;`,ctx);
 const g=vm.runInContext('engine',ctx),mk=vm.runInContext('unit',ctx),map=vm.runInContext('lookup',ctx);
 for(const card of data)map.set(card.id,card);
 const p=g.players[0],f=g.players[1];p.hand=hand.slice();p.active=mk(meActive);f.active=mk(foeActive);p.bench=myBench.map(mk);f.bench=foeBench.map(mk);p.active.energies=myEnergy.slice();f.active.energies=enemyEnergy.slice();p.prizes=['base1-95'];f.prizes=['base1-94'];p.deck=Array(10).fill('base1-98');f.deck=Array(10).fill('base1-99');
 return {g,p,f};
}
let tests=0;function check(title,fn){try{fn();++tests;}catch(err){console.error('FAIL',title);throw err;}}
check('Warp Point stays atomic until target choice is confirmed',()=>{
 const {g,p,f}=fresh({hand:['gym2-126'],myBench:['base1-35'],foeBench:['base1-53','base1-58']});
 const enemy=f.active,own=p.active,card=p.hand[0];
 assert.equal(g.trainer58(0),null);assert.equal(f.active,enemy);assert.equal(p.active,own);assert.ok(p.hand.includes(card));
 assert.equal(g.trainer58(0,[0]),true);assert.notEqual(f.active,enemy);assert.notEqual(p.active,own);
});
check('Double Gust cancellation never changes either Active Pokémon',()=>{
 const id=data.find(x=>x.name==='Double Gust'&&x.supertype==='Trainer').id;
 const {g,p,f}=fresh({hand:[id],myBench:['base1-35'],foeBench:['base1-53','base1-58']});
 const enemy=f.active,own=p.active;
 assert.equal(g.trainer58(0),null);assert.equal(f.active,enemy);assert.equal(p.active,own);
 assert.equal(g.trainer58(0,[1]),true);assert.equal(f.active.id,'base1-58');assert.equal(p.active.id,'base1-35');
});
check('Narrow Gym does not alter the rival Bench while waiting for human decision',()=>{
 const id=data.find(x=>x.name==='Narrow Gym'&&x.supertype==='Trainer').id;
 const {g,p,f}=fresh({hand:[id],myBench:['base1-35','base1-50','base1-53','base1-58','base1-5'],foeBench:['base1-35','base1-50','base1-53','base1-58','base1-5']});
 assert.equal(g.trainer58(0),null);assert.equal(f.bench.length,5);assert.equal(p.bench.length,5);
 assert.equal(g.trainer58(0,[3]),true);assert.equal(f.bench.length,4);assert.equal(p.bench.length,4);assert.equal(g.stadium.id,id);
});
check('EXP.ALL during rival attack prompts human to select from multiple Basic Energy',()=>{
 const {g,p,f}=fresh({myBench:['base1-35','base1-53']});
 g.turn=1;g.turnSerial=10;p.active.damage=500;p.active.incomingAttack={turnSerial:10,damage:200};
 p.active.energies=['base1-98','base1-97'];p.bench[0].attachedTrainers=[{id:'neo4-93'}];p.bench[1].attachedTrainers=[{id:'neo4-93'}];
 g.resolveKO();const req=vm.runInContext('deckSearchRequest',ctx);
 assert.ok(req?.defenderPrompt);assert.equal(p.active.energies.length,2);assert.equal(p.bench[0].energies.length,0);
 assert.equal(req.execute('1:1'),true);assert.equal(p.active.id,'base1-35');assert.equal(p.bench[0].energies[0],'base1-97');assert.ok(p.discard.includes('neo4-93'));
 assert.equal(g._trainer60ExpPrompt,null);
});
check('EXP.ALL may be declined, and the KO then completes',()=>{
 const {g,p}=fresh({myBench:['base1-35']});g.turn=1;g.turnSerial=10;p.active.damage=500;
 p.active.incomingAttack={turnSerial:10,damage:200};p.active.energies=['base1-98','base1-97'];p.bench[0].attachedTrainers=[{id:'neo4-93'}];
 g.resolveKO();const req=vm.runInContext('deckSearchRequest',ctx);assert.ok(req);assert.equal(req.execute('skip'),true);
 assert.ok(p.discard.includes('base1-98'));assert.ok(p.discard.includes('base1-97'));assert.equal(p.active.energies.length,0);
});
check('Charity offers a choice before attacking and reduces damage after weakness/resistance',()=>{
 const {g,p,f}=fresh({meActive:'base1-58',foeActive:'base1-35',myEnergy:['base1-98']});
 p.active.attachedTrainers=[{id:'gym1-99'}];
 assert.equal(g.attack(0,null,true),null);const req=vm.runInContext('deckSearchRequest',ctx);
 assert.ok(req);assert.equal(f.active.damage,0);
 assert.equal(req.execute(10),true);assert.equal(f.active.damage,10);
 assert.equal(p.active._trainer60CharityReduction,10);
});
check('Charity allows ordinary damage when zero reduction selected',()=>{
 const {g,p,f}=fresh({meActive:'base1-58',foeActive:'base1-35',myEnergy:['base1-98']});
 p.active.attachedTrainers=[{id:'gym1-99'}];assert.equal(g.attack(0,null,true),null);
 assert.equal(vm.runInContext('deckSearchRequest',ctx).execute(0),true);
 assert.equal(f.active.damage,20);
});
check('Charity can waive all final attack damage even above 200',()=>{
 const {g,p}=fresh({meActive:'base1-58',foeActive:'base1-35',myEnergy:['base1-98']});
 p.active.attachedTrainers=[{id:'gym1-99'}];
 assert.equal(g.attack(0,null,true),null);
 const req=vm.runInContext('deckSearchRequest',ctx);
 assert.ok(req.options.some(o=>o.index==='all'));
 assert.equal(req.execute('invalid'),false);
 assert.equal(req.execute('all'),true);
 assert.equal(g.trainer60ApplyCharity(p.active,310),0);
});
check('Charity accepts reductions above 200 in 10-damage steps and rejects fractions',()=>{
 const {g,p}=fresh({meActive:'base1-58',foeActive:'base1-35',myEnergy:['base1-98']});
 p.active.attachedTrainers=[{id:'gym1-99'}];assert.equal(g.attack(0,null,true),null);
 const req=vm.runInContext('deckSearchRequest',ctx);
 assert.ok(req.options.some(o=>o.index===250));
 assert.equal(req.execute(255),false);
 assert.equal(req.execute(-10),false);
 assert.equal(req.execute(250),true);
 assert.equal(g.trainer60ApplyCharity(p.active,330),80);
});
check('Charity voluntary reduction clamps to actual damage',()=>{
 const {g,p,f}=fresh();p.active.attachedTrainers=[{id:'gym1-99'}];p.active._trainer60CharityReduction=30;
 assert.equal(g.trainer60ApplyCharity(p.active,10),0);assert.equal(g.trainer60ApplyCharity(p.active,70),40);
});
check('Koga Ninja Trick offers a human decision before rival attack and discards only when switched',()=>{
 const {g,p,f}=fresh({meActive:'gym2-42',foeActive:'base1-58',myBench:['base1-35'],enemyEnergy:['base1-98']});
 p.active.attachedTrainers=[{id:'gym2-115'}];g.turn=1;
 const previous=p.active;
 assert.equal(g.attack(0,null,true),false);
 const req=vm.runInContext('deckSearchRequest',ctx);assert.ok(req?.defenderPrompt);
 assert.equal(p.active,previous);assert.equal(p.bench[0].damage,0);
 assert.equal(req.execute(0),true);
 assert.equal(p.active.id,'base1-35');assert.ok(p.active.damage>0);
 assert.equal(p.bench[0],previous);assert.ok(p.discard.includes('gym2-115'));
});
check('Koga Ninja Trick can be declined without discarding the Tool',()=>{
 const {g,p}=fresh({meActive:'gym2-42',foeActive:'base1-58',myBench:['base1-35'],enemyEnergy:['base1-98']});
 p.active.attachedTrainers=[{id:'gym2-115'}];g.turn=1;
 assert.equal(g.attack(0,null,true),false);
 const req=vm.runInContext('deckSearchRequest',ctx);assert.equal(req.execute(-1),true);
 assert.equal(p.active.id,'gym2-42');assert.equal(p.active.attachedTrainers.length,1);
});
check('Koga Ninja Trick lets the defending CPU switch before human attack damage',()=>{
 const {g,p,f}=fresh({meActive:'base1-58',foeActive:'gym2-27',foeBench:['base1-35'],myEnergy:['base1-98']});
 f.active.attachedTrainers=[{id:'gym2-115'}];f.active.damage=50;
 const old=f.active,sub=f.bench[0];
 g.attack(0,null,true);
 assert.equal(f.active,sub);assert.equal(f.bench[0],old);
 assert.ok(f.discard.includes('gym2-115'));
 assert.ok(!old.attachedTrainers.length);
});
check('Koga Ninja Trick does not force defending CPU to switch into weaker substitute',()=>{
 const {g,p,f}=fresh({meActive:'base1-58',foeActive:'gym2-27',foeBench:['base1-35'],myEnergy:['base1-98']});
 f.active.attachedTrainers=[{id:'gym2-115'}];f.bench[0].damage=35;
 const old=f.active;g.attack(0,null,true);
 assert.equal(f.active,old);assert.equal(old.attachedTrainers.length,1);
 assert.ok(!f.discard.includes('gym2-115'));
});
check('New Pokédex leaves deck unshuffled if selection is interrupted',()=>{
 const id=data.find(c=>c.name==='New Pokédex'&&c.supertype==='Trainer').id;
 const {g,p}=fresh({hand:[id]});const before=p.deck.slice();
 assert.equal(g.trainer58(0),null);assert.deepEqual(p.deck,before);
 assert.equal(g.trainer58(0,[0,1]),false);assert.deepEqual(p.deck,before);
 assert.equal(g.trainer58(0,[0,1,2,3,4]),true);assert.ok(p.discard.includes(id));
});
check('Super Energy Retrieval can recover fewer than four Energies',()=>{
 const id=data.find(c=>c.name==='Super Energy Retrieval'&&c.supertype==='Trainer').id;
 const {g,p}=fresh({hand:[id,'base1-98','base1-99'],meActive:'base1-58'});
 p.discard=['base1-97','base1-98','base1-99'];
 assert.equal(g.trainer58(0,[[1,2],[0]]),true);
 assert.ok(p.hand.includes('base1-97'));
 assert.equal(p.discard.filter(x=>x===id).length,1);
});
check('Chaos Gym can redirect Bill to its rival when the coin fails',()=>{
 const {g,p,f}=fresh({hand:['base1-91']});g.stadium={id:'gym2-102',owner:1};
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>false',ctx);
 try{assert.equal(g.trainer(0),true);assert.equal(p.hand.length,0);assert.ok(p.discard.includes('base1-91'));
  assert.equal(f.hand.length,2);assert.ok(!f.discard.includes('base1-91'));
 }finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Chaos Gym can redirect an Energy Search using RIVAL deck and choices',()=>{
 const id=data.find(c=>c.name==='Energy Search'&&c.supertype==='Trainer').id;
 const {g,p,f}=fresh({hand:[id]});g.stadium={id:'gym2-102',owner:1};
 f.deck=['base1-97','base1-98'];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>false',ctx);
 try{assert.equal(g.trainer(0),true);assert.ok(p.discard.includes(id));assert.equal(p.hand.length,0);
  assert.equal(f.hand.length,1);assert.equal(f.deck.length,1);assert.ok(['base1-97','base1-98'].includes(f.hand[0]));
 }finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Chaos Gym successful flip still lets the original human play Bill',()=>{
 const {g,p,f}=fresh({hand:['base1-91']});g.stadium={id:'gym2-102',owner:1};
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.trainer(0),true);assert.equal(p.hand.length,2);assert.equal(f.hand.length,0);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Charity reducing attack damage to zero does not trigger Machamp Strikes Back',()=>{
 const {g,p,f}=fresh({meActive:'base1-58',foeActive:'base1-8',myEnergy:['base1-98']});
 p.active.attachedTrainers=[{id:'gym1-99'}];
 assert.equal(g.attack(0,null,true),null);
 assert.equal(vm.runInContext('deckSearchRequest',ctx).execute(10),true);
 assert.equal(f.active.damage,0);
 assert.equal(p.active.damage,0);
});
check('Lucky Stadium is once per turn and draws on Heads',()=>{
 const {g,p}=fresh();g.stadium={id:data.find(c=>c.name==='Lucky Stadium').id,owner:0};
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.stadium58(),true);assert.equal(p.hand.length,1);assert.equal(g.stadium58(),false);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Healing Field heals the Active Pokémon by two counters on Heads',()=>{
 const {g,p}=fresh();g.stadium={id:data.find(c=>c.name==='Healing Field').id,owner:0};p.active.damage=30;
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.stadium58(),true);assert.equal(p.active.damage,10);}finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Energy Stadium requires a coin flip and allows a chosen basic Energy from discard',()=>{
 const {g,p}=fresh();g.stadium={id:data.find(c=>c.name==='Energy Stadium').id,owner:0};p.discard=['base1-98','base1-97'];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.stadium58(),null);assert.equal(g.stadium58(1),true);assert.ok(p.hand.includes('base1-97'));assert.equal(p.discard.length,1);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Rocket Hideout increases the HP of Dark Pokémon on either team',()=>{
 const {g,p,f}=fresh({meActive:'base5-4',foeActive:'base5-2'});
 const normalP=g.maxHP(p.active),normalF=g.maxHP(f.active);g.stadium={id:data.find(c=>c.name==="Rocket's Hideout").id,owner:0};
 assert.equal(g.maxHP(p.active),normalP+20);assert.equal(g.maxHP(f.active),normalF+20);
});
check('Sprout Tower reduces damage from Colorless Pokémon attacks',()=>{
 const {g,p,f}=fresh({meActive:'base1-3',foeActive:'base1-3',myEnergy:['base1-98','base1-98','base1-98','base1-98']});
 g.stadium={id:data.find(c=>c.name==='Sprout Tower').id,owner:0};
 assert.equal(g.attack(1,null,true),true);assert.equal(f.active.damage,50);
});
check('Resistance Gym reduces a minus-30 resistance to minus-10',()=>{
 const {g}=fresh();const calc=vm.runInContext('calculateDamage',ctx);
 const atk={name:'Gastly',types:['Psychic']},def={name:'Tauros',resistances:[{type:'Psychic',value:'-30'}],weaknesses:[]};
 assert.equal(calc(50,atk,def),20);g.stadium={id:data.find(c=>c.name==='Resistance Gym').id,owner:0};
 assert.equal(calc(50,atk,def),40);
});
check('Rocket Minefield Gym damages newly benched Basics on tails',()=>{
 const {g,p}=fresh({hand:['base1-35']});g.stadium={id:data.find(c=>c.name==="Rocket's Minefield Gym").id,owner:0};
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>false',ctx);
 try{assert.equal(g.playBasic(0),true);assert.equal(p.bench.length,1);assert.equal(p.bench[0].damage,20);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Cerulean City Gym reduces retreat cost of Misty Pokémon',()=>{
 const {g,p}=fresh({meActive:'gym1-54',myBench:['base1-35']});
 g.stadium={id:data.find(c=>c.name==='Cerulean City Gym').id,owner:0};
 assert.equal(g.retreat(0),true);assert.equal(p.active.id,'base1-35');
});
check('Broken Ground Gym adds a retreat Energy to Basic Pokémon',()=>{
 const {g,p}=fresh({meActive:'base1-50',myBench:['base1-35']});
 g.stadium={id:data.find(c=>c.name==='Broken Ground Gym').id,owner:0};
 assert.equal(g.retreat(0),false);p.active.energies.push('base1-98');
 assert.equal(g.retreat(0),true);assert.equal(p.discard.at(-1),'base1-98');
});
check('Rocket Training Gym adds one Colorless to retreat cost',()=>{
 const {g,p}=fresh({meActive:'base1-50',myBench:['base1-35']});
 g.stadium={id:data.find(c=>c.name==="The Rocket's Training Gym").id,owner:0};
 assert.equal(g.retreat(0),false);p.active.energies.push('base1-98');assert.equal(g.retreat(0),true);
});
check('Pewter City Gym ignores Resistance when Brock Pokémon attack',()=>{
 const {g}=fresh();const calc=vm.runInContext('calculateDamage',ctx);
 const atk={name:"Brock's Onix",types:['Fighting']},def={name:'Articuno',resistances:[{type:'Fighting',value:'-30'}],weaknesses:[]};
 assert.equal(calc(40,atk,def),10);g.stadium={id:data.find(c=>c.name==='Pewter City Gym').id,owner:0};assert.equal(calc(40,atk,def),40);
});
check('Cinnabar City Gym cancels Water Weakness for Blaine Pokémon',()=>{
 const {g}=fresh();const calc=vm.runInContext('calculateDamage',ctx);
 const atk={name:'Lapras',types:['Water']},def={name:"Blaine's Magmar",resistances:[],weaknesses:[{type:'Water',value:'×2'}]};
 assert.equal(calc(20,atk,def),40);g.stadium={id:data.find(c=>c.name==='Cinnabar City Gym').id,owner:0};assert.equal(calc(20,atk,def),20);
});
check('Celadon City Gym cures Erika Pokémon by discarding attached Energy',()=>{
 const {g,p}=fresh({meActive:'gym1-42',myEnergy:['base1-98']});g.stadium={id:data.find(c=>c.name==='Celadon City Gym').id,owner:0};
 p.active.status='Asleep';p.active.poison=true;
 assert.equal(g.stadium58(0),true);assert.equal(p.active.status,null);assert.equal(p.active.poison,false);assert.equal(p.active.energies.length,0);
});
check('Saffron City Gym can return attached Sabrina Basic Energy repeatedly',()=>{
 const {g,p}=fresh({meActive:'gym1-91',myEnergy:['base1-98','base1-97']});
 g.stadium={id:data.find(c=>c.name==='Saffron City Gym').id,owner:0};
 assert.equal(g.stadium58(0),true);assert.equal(g.stadium58(0),true);assert.equal(p.hand.length,2);
});
check('Radio Tower shows top two cards without changing deck order',()=>{
 const {g,p}=fresh();g.stadium={id:data.find(c=>c.name==='Radio Tower').id,owner:0};
 const before=p.deck.slice();assert.equal(g.stadium58(),true);assert.deepEqual(p.deck,before);assert.equal(g.stadium58(),false);
});
check('Viridian City Gym heals Giovanni Pokémon when evolved',()=>{
 const {g,p}=fresh({hand:['gym2-8'],meActive:'gym2-43'});p.active.damage=40;
 p.active.playedTurn=1;g.stadium={id:data.find(c=>c.name==='Viridian City Gym').id,owner:0};
 assert.equal(g.evolve(0,-1),true);assert.equal(p.active.damage,20);
});
check('No Removal Gym enforces two extra hand discards before Energy Removal',()=>{
 const id=data.find(c=>c.name==='Energy Removal').id;
 const {g,p,f}=fresh({hand:[id,'base1-98','base1-97'],enemyEnergy:['base1-98']});
 g.stadium={id:data.find(c=>c.name==='No Removal Gym').id,owner:0};
 assert.equal(g.trainer58(0),null);assert.equal(p.hand.length,3);
 assert.equal(g.trainer58(0,[[1,2],-1,0]),true);
 assert.equal(f.active.energies.length,0);assert.equal(p.hand.length,0);
});
check('Gym evolution uses the matching Trainer Pokémon, not an ordinary species',()=>{
 const compat=vm.runInContext('compatible',ctx);
 const persian=data.find(c=>c.id==='gym2-8'),giovanniMeowth=data.find(c=>c.id==='gym2-43');
 const ordinaryMeowth=data.find(c=>c.name==='Meowth'&&c.supertype==='Pokémon');
 assert.equal(compat(persian,giovanniMeowth),true);
 assert.equal(compat(persian,ordinaryMeowth),false);
});
check('Fuchsia City Gym shuffles a chosen Koga Pokémon on Heads',()=>{
 const {g,p}=fresh({meActive:'gym2-48',myBench:['base1-35']});
 g.stadium={id:data.find(c=>c.name==='Fuchsia City Gym').id,owner:0};
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.stadium58(),null);assert.equal(g.stadium58(-1),true);
  assert.equal(p.active.id,'base1-35');assert.equal(p.deck.length,11);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Recycle puts a chosen discard card on top of deck on Heads',()=>{
 const id=data.find(c=>c.name==='Recycle'&&c.supertype==='Trainer').id;
 const {g,p}=fresh({hand:[id]});p.discard=['base1-97'];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.trainer58(0,[0]),true);assert.equal(p.deck.at(-1),'base1-97');assert.equal(p.discard.length,1);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Energy Charge shuffles selected Energy cards into deck on Heads',()=>{
 const id=data.find(c=>c.name==='Energy Charge'&&c.supertype==='Trainer').id;
 const {g,p}=fresh({hand:[id]});p.discard=['base1-97','base1-98'];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.trainer58(0,[[0,1]]),true);assert.equal(p.deck.length,12);assert.equal(p.discard.length,1);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Energy Ark searches up to the number of Heads for Basic Energy',()=>{
 const id=data.find(c=>c.name==='Energy Ark'&&c.supertype==='Trainer').id;
 const {g,p}=fresh({hand:[id]});
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.trainer58(0,[[0,1]]),true);assert.equal(p.hand.length,2);assert.equal(p.deck.length,8);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Old Rod on two Tails recovers a selected Trainer card',()=>{
 const id=data.find(c=>c.name==='Old Rod'&&c.supertype==='Trainer').id;
 const {g,p}=fresh({hand:[id]});p.discard=['base1-91'];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>false',ctx);
 try{assert.equal(g.trainer58(0,[0]),true);assert.ok(p.hand.includes('base1-91'));}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Super Rod on Heads recovers a selected Evolution card',()=>{
 const id=data.find(c=>c.name==='Super Rod'&&c.supertype==='Trainer').id;
 const {g,p}=fresh({hand:[id]});p.discard=['base1-8'];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.trainer58(0,[0]),true);assert.ok(p.hand.includes('base1-8'));}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Giovanni allows a Giovanni Pokémon to evolve through two stages in one turn',()=>{
 const {g,p}=fresh({hand:['gym2-18','gym2-42','gym2-6'],meActive:'gym2-72'});
 assert.equal(g.trainer58(0,[-1]),true);assert.equal(g.evolve(0,-1),true);
 assert.equal(p.active.id,'gym2-42');assert.equal(g.evolve(0,-1),true);assert.equal(p.active.id,'gym2-6');
});
check('Balloon Berry permits a retreat without spending Energy and is discarded',()=>{
 const {g,p}=fresh({meActive:'base1-58',myBench:['base1-35']});p.active.attachedTrainers=[{id:'neo3-60'}];
 assert.equal(g.retreat(0),true);assert.ok(p.discard.includes('neo3-60'));assert.equal(p.active.id,'base1-35');
});
check('Lt Surge Treaty can award one selected Prize to each player',()=>{
 const id=data.find(c=>c.name==="Lt. Surge's Treaty").id;
 const {g,p,f}=fresh({hand:[id]});const own=p.prizes[0],theirs=f.prizes[0];
 assert.equal(g.trainer58(0,[1,0,0]),true);
 assert.equal(p.prizes.length,0);assert.equal(f.prizes.length,0);
 assert.ok(p.hand.includes(own));assert.ok(f.hand.includes(theirs));
});
check('Misty Wish can exchange a chosen Prize after opponent agrees',()=>{
 const id=data.find(c=>c.name==="Misty's Wish").id;
 const {g,p}=fresh({hand:[id,'base1-98']});const prize=p.prizes[0];
 assert.equal(g.trainer58(0,[0,1,1]),true);
 assert.ok(p.hand.includes(prize));assert.equal(p.prizes[0],'base1-98');
});
check('Pokémon March lets each player select their own Basic to Bench',()=>{
 const id=data.find(c=>c.name==='Pokémon March').id;
 const {g,p,f}=fresh({hand:[id]});p.deck=['base1-58'];f.deck=['base1-35'];
 assert.equal(g.trainer58(0,[[0],[0]]),true);
 assert.equal(p.bench[0].id,'base1-58');assert.equal(f.bench[0].id,'base1-35');
});
check('Super Scoop Up returns the selected Pokémon and attachments on Heads',()=>{
 const id=data.find(c=>c.name==='Super Scoop Up').id;
 const {g,p}=fresh({hand:[id],meActive:'base1-58',myBench:['base1-35'],myEnergy:['base1-98']});
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.trainer58(0,[-1]),true);assert.ok(p.hand.includes('base1-58'));assert.ok(p.hand.includes('base1-98'));}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Poké Ball can search for an Evolution card on Heads',()=>{
 const id=data.find(c=>c.name==='Poké Ball').id;
 const {g,p}=fresh({hand:[id]});p.deck=['base1-8'];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.trainer58(0,[0]),true);assert.ok(p.hand.includes('base1-8'));}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Fossil Egg puts an evolution from the deck onto the Bench',()=>{
 const id=data.find(c=>c.name==='Fossil Egg').id;
 const fossil=data.find(c=>c.supertype==='Pokémon'&&['Kabuto','Omanyte','Aerodactyl'].includes(c.name)&&c.subtypes?.includes('Stage 1'));
 const {g,p}=fresh({hand:[id]});p.deck=[fossil.id];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.trainer58(0,['d0']),true);assert.equal(p.bench[0].id,fossil.id);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Fossil Egg places Kabuto as a Basic despite missing TCGdex evolvesFrom',()=>{
 const {g,p}=fresh({hand:['neo2-72']});p.deck=['base3-50'];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.trainer58(0,['d0']),true);assert.equal(p.bench[0].id,'base3-50');
  assert.ok(vm.runInContext('basic',ctx)(g.card(p.bench[0])));}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Mysterious Fossil can be Benched and voluntarily discarded',()=>{
 const {g,p}=fresh({hand:['base3-62']});assert.equal(g.playBasic(0),true);
 assert.equal(p.bench[0].id,'base3-62');assert.equal(g.discardMysteriousFossil(0),true);
 assert.ok(p.discard.includes('base3-62'));assert.equal(p.bench.length,0);
});
check('Mysterious Fossil is immune to Special Conditions and cannot retreat',()=>{
 const {g,p}=fresh({meActive:'base3-62',myBench:['base1-35']});p.active.status='Paralyzed';p.active.poison=true;p.active.burn=true;
 g.resolveKO();assert.equal(p.active.status,null);assert.equal(p.active.poison,false);assert.equal(p.active.burn,false);
 assert.equal(g.retreat(0),false);
});
check('Knocking Out Mysterious Fossil on Bench does not award a Prize',()=>{
 const {g,p,f}=fresh({myBench:['base3-62']});const before=f.prizes.length;
 p.bench[0].damage=10;g.resolveKO();assert.equal(p.bench.length,0);
 assert.equal(f.prizes.length,before);assert.ok(p.discard.includes('base3-62'));
});
check('Omanyte can evolve from Mysterious Fossil in a later turn',()=>{
 const {g,p}=fresh({hand:['base3-52'],meActive:'base3-62'});
 p.active.playedTurn=1;assert.equal(g.evolve(0,-1),true);
 assert.equal(p.active.id,'base3-52');assert.ok(p.active.under.includes('base3-62'));
});
check('Misty boosts only an attack from a Misty Pokémon after paying two hand-card costs',()=>{
 const {g,p,f}=fresh({hand:['gym1-18','base1-98','base1-99'],meActive:'gym1-85',foeActive:'base1-3',myEnergy:['base1-98']});
 assert.equal(g.trainer58(0,[[1,2]]),true);
 assert.equal(p.hand.length,0);assert.equal(p.mistyBoostSerial,g.turnSerial);
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(g.attack(0,null,true),true);assert.equal(f.active.damage,40);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('Koga adds Poison only when a Koga Pokémon deals attack damage',()=>{
 const {g,p,f}=fresh({hand:['gym2-19'],meActive:'gym2-48',foeActive:'base1-3',myEnergy:['base1-99']});
 assert.equal(g.trainer58(0),true);assert.equal(p.kogaPoisonSerial,g.turnSerial);
 assert.equal(g.attack(0,null,true),true);assert.equal(f.active.damage,10);assert.equal(f.active.poison,true);
});
check('Rocket Secret Experiment Heads searches the chosen card and Tails locks Trainer plays',()=>{
 const id='gym2-120';const heads=fresh({hand:[id]});heads.p.deck=['base1-97','base1-98'];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(heads.g.trainer58(0,[1]),true);assert.ok(heads.p.hand.includes('base1-98'));}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
 const tails=fresh({hand:[id]});ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>false',ctx);
 try{assert.equal(tails.g.trainer58(0),true);assert.ok(tails.p.trainerLockUntil>=tails.g.round+1);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check("Misty's Duel correctly redraws five cards for the coin-flip winner",()=>{
 const id='gym1-123',heads=fresh({hand:[id,'base1-98','base1-99']});heads.f.hand=['base1-97'];
 ctx.__originalCoin=vm.runInContext('coin',ctx);vm.runInContext('coin=()=>true',ctx);
 try{assert.equal(heads.g.trainer58(0),true);assert.equal(heads.p.hand.length,5);assert.deepEqual(heads.f.hand,['base1-97']);}
 finally{vm.runInContext('coin=__originalCoin',ctx)}
});
check('EXP.ALL stale choice cannot clear a pending KO decision',()=>{
 const {g,p}=fresh({myBench:['base1-35','base1-53']});
 g.turn=1;g.turnSerial=10;p.active.damage=500;p.active.incomingAttack={turnSerial:10,damage:200};
 p.active.energies=['base1-98','base1-97'];
 p.bench[0].attachedTrainers=[{id:'neo4-93'}];p.bench[1].attachedTrainers=[{id:'neo4-93'}];
 g.resolveKO();
 const req=vm.runInContext('deckSearchRequest',ctx);
 assert.ok(req?.defenderPrompt);
 // The offered Energy or Tool can disappear while a choice is pending.
 p.bench[0].attachedTrainers.length=0;
 assert.equal(req.execute('0:0'),false);
 assert.ok(g._trainer60ExpPrompt);
 assert.equal(vm.runInContext('deckSearchRequest',ctx),req);
 assert.equal(p.active.energies.length,2);
 assert.equal(req.execute('1:1'),true);
 assert.equal(g._trainer60ExpPrompt,null);
 assert.ok(p.discard.includes('neo4-93'));
});
check('EXP.ALL always offers a choice, even with one Basic Energy and one receiver',()=>{
 const {g,p}=fresh({myBench:['base1-35']});
 g.turn=1;g.turnSerial=10;p.active.damage=500;p.active.incomingAttack={turnSerial:10,damage:200};
 p.active.energies=['base1-98'];p.bench[0].attachedTrainers=[{id:'neo4-93'}];
 g.resolveKO();
 const req=vm.runInContext('deckSearchRequest',ctx);
 assert.ok(req?.defenderPrompt);
 assert.equal(p.bench[0].energies.length,0);
 assert.equal(req.execute('skip'),true);
 assert.ok(p.discard.includes('base1-98'));
 assert.ok(p.bench[0].attachedTrainers.some(t=>t.id==='neo4-93'));
});
check('Koga Ninja Trick rejects a stale Bench choice without consuming the Tool',()=>{
 const {g,p}=fresh({meActive:'gym2-42',foeActive:'base1-58',myBench:['base1-35'],enemyEnergy:['base1-98']});
 p.active.attachedTrainers=[{id:'gym2-115'}];g.turn=1;
 assert.equal(g.attack(0,null,true),false);
 const req=vm.runInContext('deckSearchRequest',ctx);
 const original=p.active,tool=p.active.attachedTrainers[0];
 p.bench.length=0;
 assert.equal(req.execute(0),false);
 assert.equal(p.active,original);
 assert.ok(p.active.attachedTrainers.includes(tool));
 assert.ok(g._trainer60NinjaPending);
});
check('Charity stale prompt cannot attack after the Active Pokemon changes',()=>{
 const {g,p,f}=fresh({meActive:'base1-58',foeActive:'base1-35',myEnergy:['base1-98'],myBench:['base1-50']});
 p.active.attachedTrainers=[{id:'gym1-99'}];
 assert.equal(g.attack(0,null,true),null);
 const req=vm.runInContext('deckSearchRequest',ctx),old=p.active;
 [p.active,p.bench[0]]=[p.bench[0],p.active];
 assert.equal(req.execute(0),false);
 assert.equal(f.active.damage,0);
 assert.ok(old.attachedTrainers.some(t=>t.id==='gym1-99'));
});
check("Sabrina's ESP cannot attach to a target that changed while selection was pending",()=>{
 const id='gym1-117', {g,p}=fresh({hand:[id],meActive:'gym1-91'});
 assert.equal(g.trainer58(0),null);
 const req=vm.runInContext('deckSearchRequest',ctx);
 assert.ok(req);
 const target=p.active,originalHand=p.hand.slice();
 target.id='base1-58'; // no longer a Sabrina Pokémon
 assert.equal(req.execute(-1),false);
 assert.deepEqual(p.hand,originalHand);
 assert.equal(target.attachedTrainers.length,0);
});
console.log(`PASS v0.6.0: ${tests} human Trainer timing, choices, and damage outcome scenarios`);
