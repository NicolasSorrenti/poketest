'use strict';
// Exact attacks from the Neo five-card milestone, using the actual duel
// reducer and decisions shared by multiplayer and CPU.
const assert=require('node:assert/strict');
const ATTACK=require('./attack_effects_core');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {defs}=require('./neo_attack_batch_v092');
const cost={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Colorless:'base1-99'};
const u=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
const printed=(id,name)=>{const a=CATALOG.get(id)?.attacks?.find(a=>a.name===name);assert.ok(a,id+' '+name);return a;};
for(const [key,name] of Object.entries(defs)){
 const [id,attackName]=key.split('|'),a=printed(id,attackName),p=ATTACK.compile(a);
 assert.equal(p?.kind,'neo92:'+name,'compile '+key);
 assert.equal(ATTACK.compile({...a,text:a.text+' modified'}),null,'no loose attack text signature: '+key);
 assert.equal(ATTACK.compile({...a,cost:['Colorless']}),null,'printed Energy costs are part of signature: '+key);
}
const roll=(id,name,coins=[],ctx={})=>{
 const seq=[...coins];return ATTACK.resolve(ATTACK.compile(printed(id,name)),()=>{assert.ok(seq.length,'unexpected coin');return seq.shift();},ctx);
};
assert.equal(roll('neo3-5','Present',[false,false,false]).neo92HealDefender,'all');
assert.equal(roll('neo3-5','Present',[true,false,false]).damage,40);
assert.equal(roll('neo3-5','Present',[true,true,false]).neo92HealDefender,30);
assert.equal(roll('neo3-5','Present',[true,true,true]).damage,60);
assert.equal(roll('neo4-5','Crushing Blow',[],{enemyEnergy:0}).flips.length,0);
assert.equal(roll('neo4-5','Crushing Blow',[true],{enemyEnergy:3}).neo92DiscardOpponentEnergy,true);
assert.equal(roll('neo4-5','Crushing Blow',[false],{enemyEnergy:3}).neo92DiscardOpponentEnergy,undefined);
assert.equal(roll('neo4-6','Pull In').status,'Asleep');
assert.equal(roll('neo4-50','Guiding Flame',[],{neo92DiscardIndex:3}).neo92BenchFromDiscard,3);
assert.equal(roll('neo4-107','White-Hot Flame',[false]).selfDamage,30);
assert.equal(roll('neo4-107','White-Hot Flame',[true]).selfDamage,undefined);
assert.equal(roll('neo4-107','White-Hot Flame',[],{neo92MissingPayment:true}).damage,0);

function game(id,name,defender='base1-15'){
 const deck=list('base1:Brushfire'),g=createGame({decks:[deck,deck],format:'online-preview',seed:92});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;g.rngState=474747;
 g.players[0].active=u(id,{energies:printed(id,name).cost.map(t=>cost[t])});
 g.players[1].active=u(defender,{energies:['base1-98','base1-102','base1-101']});
 g.players[0].bench=[u('base1-44')];
 g.players[1].bench=[u('base1-15'),u('base1-3')];
 for(const p of g.players){p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
const send=(g,side,type,payload={})=>applyCommand(g,side,{type,payload});
function ok(g,side,type,payload={}){const r=send(g,side,type,payload);assert.equal(r.ok,true,type+': '+r.error);return r;}
function begin(g,name){const id=g.players[0].active.id,index=CATALOG.get(id).attacks.findIndex(x=>x.name===name);assert.ok(index>=0);ok(g,0,'attack',{attackIndex:index});return g.pendingDecision;}
function choose(g,d,...ids){ok(g,d.actor,'choose',{decisionId:d.id,selected:ids});}
function reject(g,d,side,ids){const r=send(g,side,'choose',{decisionId:d.id,selected:ids});assert.equal(r.ok,false,'invalid choice must fail');assert.equal(g.pendingDecision?.id,d.id,'invalid choice rolls back');}
{
 const samples=new Set();
 for(let seed=0;seed<500&&samples.size<4;seed++){
  const g=game('neo3-5','Present','base1-3');g.rngState=seed*6553600;g.players[1].active.damage=40;
  begin(g,'Present');const flip=(g.coinFlips||[]).slice(-3).filter(x=>x.result==='heads').length;
  const expected=flip===0?0:flip===1?80:flip===2?10:100;
  assert.equal(g.players[1].active.damage,expected,'Present resolves exact three-coin damage/healing branch');
  samples.add(flip);
 }
 assert.deepEqual([...samples].sort((a,b)=>a-b),[0,1,2,3],'all four Present branches covered by real RNG');
}
{
 const seen=new Set();let picked=false;
 for(let seed=0;seed<250&&(!picked||seen.size<2);seed++){
  const g=game('neo4-5','Crushing Blow');g.rngState=seed*6553600;
  const d=begin(g,'Crushing Blow');
  const heads=!!d;seen.add(heads?'heads':'tails');
  if(d){
   picked=true;assert.equal(d.actor,0);
   assert.deepEqual(d.options.map(x=>x.id),['energy:0','energy:1','energy:2']);
   assert.equal(g.players[1].active.damage,0,'damage waits for Energy choice');
   reject(g,d,1,['energy:1']);
   const before=(g.coinFlips||[]).length;
   choose(g,d,'energy:1');
   assert.equal((g.coinFlips||[]).length,before,'no second toss after choosing Energy');
   assert.deepEqual(g.players[1].active.energies,['base1-98','base1-101']);
   assert.ok(g.players[1].discard.includes('base1-102'));
  }else assert.equal(g.players[1].active.energies.length,3);
  assert.equal(g.players[1].active.damage,50);
 }
 assert.deepEqual([...seen].sort(),['heads','tails']);
}
{
 const g=game('neo4-5','Crushing Blow');g.players[1].active.energies=[];
 begin(g,'Crushing Blow');assert.equal(g.pendingDecision,null);
 assert.equal(g.players[1].active.damage,50);
 assert.equal((g.coinFlips||[]).length,0,'no coin when defender has no Energy');
}
{
 const g=game('neo4-6','Pull In');
 const d=begin(g,'Pull In');assert.equal(d?.actor,0);
 reject(g,d,1,['bench:0']);
 choose(g,d,'bench:0');
 assert.equal(g.players[1].active.id,'base1-15');
 assert.equal(g.players[1].active.damage,30,'switch happens before damage');
 assert.equal(g.players[1].bench[0].id,'base1-15','original defender moves to Bench');
 assert.equal(g.players[1].bench[0].damage,0);
 assert.ok(['Asleep',null].includes(g.players[1].active.status),'Sleep may wake at immediate between-turn check');
}
{
 const g=game('neo4-6','Pull In');
 const d=begin(g,'Pull In');ok(g,0,'choose',{decisionId:d.id,selected:[],decline:true});
 assert.equal(g.players[1].active.id,'base1-15');
 assert.equal(g.players[1].active.damage,30);
}
{
 const g=game('neo4-6','Pull In');g.players[1].bench=[];
 assert.equal(begin(g,'Pull In'),null);
 assert.equal(g.players[1].active.damage,30);
}
{
 const g=game('neo4-50','Guiding Flame','base1-3');
 g.players[0].discard=['base1-99','neo1-12','base1-44'];
 const d=begin(g,'Guiding Flame');assert.equal(d?.actor,0);
 assert.deepEqual(d.options.map(x=>x.id),['discard:1','discard:2']);
 reject(g,d,0,['discard:0']);
 choose(g,d,'discard:1');
 assert.equal(g.players[1].active.damage,50);
 assert.equal(g.players[0].bench.at(-1).id,'neo1-12','Baby Pokémon can be recovered directly to Bench');
 assert.deepEqual(g.players[0].discard,['base1-99','base1-44']);
}
{
 const g=game('neo4-50','Guiding Flame','base1-3');g.players[0].discard=[];
 assert.equal(begin(g,'Guiding Flame'),null,'no discard target skips selection');
 assert.equal(g.players[1].active.damage,50);
}
{
 const g=game('neo4-50','Guiding Flame','base1-3');g.players[0].discard=['base1-44'];
 while(g.players[0].bench.length<5)g.players[0].bench.push(u('base1-44'));
 assert.equal(send(g,0,'attack',{attackIndex:0}).ok,false,'Guiding Flame rejects a full Bench');
 assert.equal(g.players[1].active.damage,0);
}
{
 const g=game('neo4-107','White-Hot Flame','base1-3');
 g.players[0].active.energies.push('base1-98');
 const d=begin(g,'White-Hot Flame');assert.equal(d?.actor,0);assert.equal(d.min,2);
 reject(g,d,0,['energy:0','energy:1']);
 reject(g,d,1,['energy:0','energy:3']);
 choose(g,d,'energy:2','energy:4');
 assert.equal(g.players[1].active.damage,100);
 assert.equal(g.players[0].active.energies.length,4,'exactly two Energy discarded');
 assert.equal(g.players[0].discard.length,2);
 assert.deepEqual(g.players[0].discard.map(id=>CATALOG.get(id).name).sort(),['Fire Energy','Lightning Energy']);
 assert.ok([0,30].includes(g.players[0].active.damage),'tails only causes 30 recoil');
}
{
 const seen=new Set();
 for(let seed=0;seed<200&&seen.size<2;seed++){
  const g=game('neo4-107','White-Hot Flame','base1-3');g.rngState=seed*6553600;
  const d=begin(g,'White-Hot Flame');choose(g,d,'energy:0','energy:3');
  seen.add(g.players[0].active.damage);
  assert.equal(g.players[1].active.damage,100);
 }
 assert.deepEqual([...seen].sort((a,b)=>a-b),[0,30],'White-Hot Flame both real recoil outcomes');
}
{
 const g=game('neo4-107','White-Hot Flame','base1-3');
 g.players[0].active.energies=['base1-100','base1-100','neo1-104','neo1-104','neo1-104'];
 // The default 3-Fire/2-Lightning cost is not payable here; this
 // prerequisite must still be enforced rather than silently doing 100.
 assert.equal(send(g,0,'attack',{attackIndex:0}).ok,false);
 assert.equal(g.players[1].active.damage,0);
}
console.log('PASS Neo v092: five exact attacks, all Present branches, Crushing Blow owned Energy choice, Gengar pre-damage switch, Ninetales Baby Bench recovery and Charizard typed discard/recoil');
