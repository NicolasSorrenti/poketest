'use strict';
const assert=require('node:assert/strict');
const ATTACK=require('./attack_effects_core');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {defs}=require('./neo_attack_batch_v090');
const energy={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Colorless:'base1-99',Metal:'neo1-19',Darkness:'neo1-104'};
const unit=(id,extra={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...extra});
const attack=(id,name)=>{const a=CATALOG.get(id)?.attacks?.find(x=>x.name===name);assert.ok(a,id+' '+name);return a;};
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),a=attack(id,name),p=ATTACK.compile(a);
 assert.equal(p?.kind,kind==='thundersquall'?'bench-target':'neo90:'+kind,key);
 assert.equal(ATTACK.compile({...a,text:a.text+' modified'}),null,key+' strict text matching');
 assert.equal(ATTACK.compile({...a,cost:['Colorless']}),null,key+' strict printed Energy requirement');
}
function resolve(id,name,flips=[],ctx={}){
 const remaining=[...flips];
 return ATTACK.resolve(ATTACK.compile(attack(id,name)),()=>{assert.ok(remaining.length,'unexpected flip');return remaining.shift();},ctx);
}
assert.equal(resolve('neo3-27','Crystal Wave',[true],{enemyBench:2}).damage,40);
assert.equal(resolve('neo3-27','Crystal Wave',[false],{enemyBench:2}).forceSwitch,'switch-defender');
assert.equal(resolve('neo3-27','Crystal Wave',[false],{enemyBench:0}).forceSwitch,undefined);
assert.equal(resolve('neo3-22','Lightning Spark',[true],{enemyBench:2}).benchDamage,20);
assert.equal(resolve('neo3-22','Lightning Spark',[false],{enemyBench:2}).neo90Target,undefined);
assert.equal(resolve('neo3-22','Lightning Spark',[],{enemyBench:0}).flips.length,0);
assert.equal(resolve('neo3-50','Sharpshooting',[true]).neo90Target,'any');
assert.equal(resolve('neo3-50','Sharpshooting',[false]).neo90Target,undefined);
assert.equal(resolve('neo4-111','Thundersquall',[],{selfEnergy:4}).benchDamage,40);
assert.equal(resolve('neo4-111','Thundersquall',[],{selfEnergy:5}).benchDamage,50);
function game(id,name,{seed=0,bench=true,extra=0}={}){
 const deck=list('base1:Brushfire'),g=createGame({decks:[deck,deck],format:'online-preview',seed:42});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;g.rngState=seed*6553600;
 g.players[0].active=unit(id,{energies:[...attack(id,name).cost.map(t=>energy[t]),...Array(extra).fill('base1-102')]});
 g.players[1].active=unit('base1-15');
 g.players[0].bench=[unit('base1-15')];
 g.players[1].bench=bench?[unit('base1-15'),unit('base1-3')]:[];
 for(const p of g.players){p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
const command=(g,side,type,payload={})=>applyCommand(g,side,{type,payload});
function ok(g,side,type,payload={}){const r=command(g,side,type,payload);assert.equal(r.ok,true,type+': '+r.error);}
function start(g,name){const id=g.players[0].active.id;ok(g,0,'attack',{attackIndex:CATALOG.get(id).attacks.findIndex(x=>x.name===name)});return g.pendingDecision;}
function choose(g,d,...selected){ok(g,d.actor,'choose',{decisionId:d.id,selected});}
{
 const g=game('neo4-111','Thundersquall');
 const d=start(g,'Thundersquall');
 assert.equal(d?.actor,0,'attacker selects opposing Benched Pokémon');
 assert.deepEqual(d.options.map(x=>x.id),['bench:0','bench:1']);
 const invalid=command(g,1,'choose',{decisionId:d.id,selected:['bench:0']});
 assert.equal(invalid.ok,false,'defending player cannot redirect Bench target');
 assert.equal(g.pendingDecision?.id,d.id,'illegal choice does not mutate state');
 choose(g,d,'bench:1');
 assert.equal(g.players[1].active.damage,40);
 assert.equal(g.players[1].bench[0].damage,0);
 assert.equal(g.players[1].bench[1].damage,40);
}
{
 const g=game('neo4-111','Thundersquall',{extra:2});
 const d=start(g,'Thundersquall');choose(g,d,'bench:0');
 assert.equal(g.players[1].bench[0].damage,60,'each physically attached Energy card adds 10 Bench damage');
 assert.equal(g.players[1].active.damage,40);
}
{
 const g=game('neo4-111','Thundersquall',{bench:false});
 assert.equal(start(g,'Thundersquall'),null,'no Bench target requested if defender has no Bench');
 assert.equal(g.players[1].active.damage,40);
}
{
 const hits=new Set();
 for(let seed=0;seed<150&&hits.size<2;seed++){
  const g=game('neo3-22','Lightning Spark',{seed});
  const d=start(g,'Lightning Spark');
  if(d){
   assert.equal(d.actor,0);
   assert.deepEqual(d.options.map(x=>x.id),['bench:0','bench:1']);
   const before=g.coinFlips.length;
   const wrong=command(g,0,'choose',{decisionId:d.id,selected:['bench:8']});
   assert.equal(wrong.ok,false,'illegal opponent target rejected');
   assert.equal(g.pendingDecision?.id,d.id);
   choose(g,d,'bench:1');
   assert.equal(g.coinFlips.length,before,'answering target does not flip coin again');
   assert.equal(g.players[1].bench[1].damage,20);
   hits.add('heads');
  }else{
   assert.equal(g.players[1].bench[1].damage,0);
   hits.add('tails');
  }
  assert.equal(g.players[1].active.damage,30);
 }
 assert.deepEqual([...hits].sort(),['heads','tails']);
}
{
 const g=game('neo3-22','Lightning Spark',{bench:false});
 assert.equal(start(g,'Lightning Spark'),null);
 assert.equal(g.players[1].active.damage,30);
 assert.equal((g.coinFlips||[]).length,0,'no coin without opponent Bench');
}
{
 const outcomes=new Set();
 let selectedActive=false,selectedBench=false;
 for(let seed=0;seed<180&&(!selectedActive||!selectedBench||outcomes.size<2);seed++){
  const g=game('neo3-50','Sharpshooting',{seed});
  const d=start(g,'Sharpshooting');
  if(!d){assert.equal(g.players[1].active.damage,0);outcomes.add('tails');continue;}
  outcomes.add('heads');assert.equal(d.actor,0);
  assert.deepEqual(d.options.map(x=>x.id),['bench:-1','bench:0','bench:1']);
  const prior=g.coinFlips.length;
  if(!selectedActive){choose(g,d,'bench:-1');selectedActive=true;assert.equal(g.players[1].active.damage,20);}
  else{choose(g,d,'bench:1');selectedBench=true;assert.equal(g.players[1].bench[1].damage,20);assert.equal(g.players[1].active.damage,0);}
  assert.equal(g.coinFlips.length,prior,'target selection must reuse the existing heads');
 }
 assert.deepEqual([...outcomes].sort(),['heads','tails']);
 assert.ok(selectedActive&&selectedBench);
}
{
 const seen=new Set();let testedDefenderChoice=false;
 for(let seed=0;seed<150&&(!testedDefenderChoice||seen.size<2);seed++){
  const g=game('neo3-27','Crystal Wave',{seed});
  const d=start(g,'Crystal Wave');
  if(d){
   assert.equal(d.actor,1,'defender owns forced-switch decision');
   assert.equal(g.players[1].active.damage,30,'switch resolves after damage');
   const wrong=command(g,0,'choose',{decisionId:d.id,selected:['bench:1']});
   assert.equal(wrong.ok,false,'attacker cannot choose defender switch');
   choose(g,d,'bench:1');
   assert.equal(g.players[1].active.id,'base1-3');
   testedDefenderChoice=true;seen.add('tails');
  }else{assert.equal(g.players[1].active.damage,40);seen.add('heads');}
 }
 assert.deepEqual([...seen].sort(),['heads','tails']);
 assert.equal(testedDefenderChoice,true);
}
{
 let found=false;
 for(let seed=0;seed<150&&!found;seed++){
  const g=game('neo3-27','Crystal Wave',{seed,bench:false});
  start(g,'Crystal Wave');
  if(g.players[1].active.damage===30){assert.equal(g.pendingDecision,null);found=true;}
 }
 assert.ok(found,'tails with empty opposing Bench never blocks play');
}
console.log('PASS Neo v090: four printed attacks, coin branches, correct target ownership, no extra flips, forced switches and Bench Energy scaling');
