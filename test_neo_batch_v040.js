'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const ATTACK=require('./attack_effects_core');
const FORMAT=require('./classic_format');
const {ClassicLocalService}=require('./classic_local_service');
const G=require('./neo_genesis_decks'),D=require('./neo_discovery_decks');
const EXTRA=require('./neo_v040_pool'),NEO40=require('./neo_attack_batch_v040');
const E={Fire:'neo1-107',Water:'neo1-111',Grass:'neo1-108',Lightning:'neo1-109',Psychic:'neo1-110',Fighting:'neo1-106',Darkness:'neo1-104',Metal:'neo1-19'};
const unit=(id,patch={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...patch});
function ready(id,name,{energy=[],seed=1,defender='base1-3',bench=[],damage=0,discard=[]}={}){
 const g=createGame({decks:[G.list('cold_fusion'),D.list('wallop')],format:'online-preview',seed:seed+555});
 g.phase='game';g.turn=0;g.turnSerial=10;g.round=5;g.rngState=seed>>>0;g.message=[];
 g.players[0].active=unit(id,{energies:[...energy],damage});g.players[0].bench=bench.map(x=>unit(x));g.players[0].discard=[...discard];
 g.players[1].active=unit(defender);g.players[1].bench=[unit('neo1-66'),unit('neo1-71')];
 const index=CATALOG.get(id).attacks.findIndex(a=>a.name===name);
 assert.ok(index>=0,id+' '+name);
 const result=applyCommand(g,0,{type:'attack',payload:{attackIndex:index}});
 assert.ok(result.ok,id+' '+name+': '+result.error);return g;
}
for(const [key] of Object.entries(NEO40.mapping)){
 const [id,name]=key.split('|'),a=CATALOG.get(id).attacks.find(x=>x.name===name);
 assert.ok(ATTACK.compile(a)?.kind.startsWith('neo40:'),key);
 const energy=a.cost.map(type=>E[type]||E.Grass);
 for(const seed of [1,2000,100000]){
  const g=ready(id,name,{energy,seed});
  assert.ok(g.message.some(s=>s.includes(name)),key+' not logged');
 }
}
assert.equal(ATTACK.compile({name:'Mind Blast',damage:'20+',text:'Invented card text'}),null);
const pool=new ClassicLocalService().cardPool();
for(const id of EXTRA.ids){
 const card=pool.find(c=>c.id===id);
 assert.ok(card&&card.supported,id+' not fully playable');
 assert.ok(FORMAT.isAllowed(id,{neo:true}));assert.equal(FORMAT.isAllowed(id),false);
 const deck=G.list('cold_fusion'),i=deck.findIndex(x=>x.startsWith('neo'));deck[i]=id;
 assert.ok(FORMAT.validateDeck(deck,CATALOG,{neo:true,gymFull:true}).valid,'Custom deck rejected '+id);
}
{
 const g=ready('neo1-5','Riptide',{energy:[E.Water,E.Water,E.Water],discard:[E.Water,E.Fire,'base1-94']});
 assert.equal(g.players[1].active.damage,30);assert.deepEqual(g.players[0].discard,['base1-94']);
 assert.ok(g.players[0].deck.includes(E.Fire));
}
for(const [id,name,energy] of [['neo1-1','Gigaspark',[E.Lightning,E.Lightning,E.Lightning,E.Lightning]],['neo1-2','Bubble Shower',[E.Water,E.Water,E.Water]]]){
 let heads=0,tails=0;
 for(let seed=1;seed<200000;seed+=5000){
  const g=ready(id,name,{energy,seed}),b=g.players[1].bench.map(x=>x.damage);
  if(b[0]){heads++;assert.deepEqual(b,[10,10]);assert.equal(g.players[1].active.status,'Paralyzed');}
  else{tails++;assert.deepEqual(b,[0,0]);}
 }
 assert.ok(heads&&tails,name+' both coin results');
}
{
 const g=ready('neo1-25','Beat Up',{energy:[E.Darkness,E.Darkness],bench:['neo1-66','neo1-71'],seed:800});
 assert.equal(g.message.filter(s=>s.includes('Coin flip:')).length,3);
}
{
 const g=ready('neo1-37','Raging Charge',{energy:[E.Fighting,E.Fighting,E.Fighting],damage:20});
 assert.equal(g.players[1].active.damage,30);assert.equal(g.players[0].active.damage,40);
}
{
 const g=ready('neo2-10','False Swipe',{energy:[E.Metal]});
 assert.equal(g.players[1].active.damage,60);
 const p=ATTACK.compile(CATALOG.get('neo2-10').attacks[0]);
 assert.equal(ATTACK.resolve(p,()=>false,{enemyRemainingHP:90}).damage,40);
}
{
 const g=ready('neo4-1','Shock Bolt',{energy:[E.Lightning,E.Lightning,E.Grass]});
 assert.equal(g.players[0].active.energies.length,0);
 assert.equal(g.players[1].active.damage,50);assert.ok(g.players[0].discard.includes(E.Lightning));
}
{
 const g=ready('neo4-11','Mountain Smasher',{energy:[E.Fighting,E.Fighting,E.Fighting],seed:4});
 assert.equal(g.message.filter(s=>s.includes('Coin flip:')).length,3);
}
for(const [defender,expected] of [['neo1-66',30],['base1-4',50]]){
 const g=ready('neo4-12','Gentle Flames',{defender,energy:[E.Fire,E.Fire,E.Fire]});
 assert.equal(g.players[1].active.damage,expected,defender);
}
assert.equal(ATTACK.resolve(ATTACK.compile(CATALOG.get('neo4-12').attacks[0]),()=>false,{enemyBaby:true,enemyBasic:true}).damage,10);
console.log('PASS Neo v0.40: 25 attack signatures, 9 new selectable printings, full reducer decisions/coins and conservation');
