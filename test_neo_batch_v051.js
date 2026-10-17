'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const {ClassicLocalService}=require('./classic_local_service');
const F=require('./classic_format'),P=require('./classic_power_core');
const U=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
function game(id='neo2-56'){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:100});
 g.phase='game';g.round=8;g.turn=0;g.turnSerial=14;g.rngState=65536;
 g.players[0].active=U(id,{energies:Array(6).fill('base1-99')});g.players[0].bench=[U('neo2-44'),U('base1-3')];
 g.players[1].active=U('base1-58',{energies:Array(5).fill('base1-100')});g.players[1].bench=[U('base1-3'),U('base1-46')];
 for(const p of g.players){p.prizes=Array(6).fill('base1-99');p.hand=[];p.deck=['neo2-56','base1-99','neo1-68','base1-46'];}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function attack(g,name){const i=CATALOG.get(g.players[0].active.id).attacks.findIndex(a=>a.name===name);assert.ok(i>=0);send(g,0,'attack',{attackIndex:i});}
function choose(g,key){assert.ok(g.pendingDecision);const d=g.pendingDecision;send(g,d.actor,'choose',{decisionId:d.id,selected:[key||d.options[0].id]});}
const pool=new ClassicLocalService().cardPool();
for(const id of require('./neo_v051_pool').ids){assert.ok(pool.find(c=>c.id===id)?.supported,'Supported Neo v0.51 '+id);assert.equal(F.isAllowed(id,{neo:true}),true);}
assert.equal(P.ACTIVATED.has('Revive Friends'),true);
assert.equal(P.PASSIVE.has('Frog Song'),true);
{
 let head=false,tail=false;
 for(let seed=0;seed<10000&&!(head&&tail);seed+=977){
  const g=game();g.rngState=seed;
  send(g,0,'use_power',{slot:-1,powerIndex:0});
  const d=g.pendingDecision;
  if(d){head=true;assert.equal(d.actor,0);assert.ok(d.options.every(o=>g.players[0].deck[Number(o.id.split(':')[1])]==='neo2-56'));
   choose(g,d.options[0].id);assert.ok(g.players[0].bench.some(u=>u.id==='neo2-56'));assert.equal(g.players[0].deck.includes('neo2-56'),false);}
  else tail=true;
 }assert.ok(head&&tail,'Revive Friends must honor both coin outcomes');
}
{
 const g=game('neo2-8');
 g.players[0].bench=[U('neo2-44'),U('neo1-68')];g.players[1].bench=[U('neo2-44')];
 g.players[1].active=U('base1-58');
 g.players[0].active.energies=Array(5).fill('base1-102');
 attack(g,'Doubleslap');
 const heads=g.coinFlips.slice(-2).filter(x=>x.result==='heads').length;
 const expected=heads?heads*40+40:0;
 if(expected>=Number(CATALOG.get('base1-58').hp))assert.ok(g.players[1].discard.includes('base1-58'),'Frog Song damage knocks out low-HP Defender');
 else assert.equal(g.players[1].active.damage,expected,'Frog Song only boosts a hit');
}
{
 const g=game('neo1-16');
 g.players[1].active=U('base1-4',{energies:Array(4).fill('base1-98')});
 let success=false;
 for(let seed=0;seed<10000&&!success;seed+=919){
  const trial=structuredClone(g);trial.rngState=seed;attack(trial,'Super Metronome');
  if(!trial.pendingDecision)continue;
  choose(trial,'slot:-1');choose(trial,'attack:0');
  assert.ok(trial.pendingDecision,'Copied Fire Spin requires Energy selection');
  const d=trial.pendingDecision;
  send(trial,0,'choose',{decisionId:d.id,selected:d.options.slice(0,2).map(x=>x.id)});
  assert.equal(trial.players[0].active.energies.length,4);
  assert.equal(trial.players[0].discard.filter(id=>id==='base1-99').length,2);
  success=true;
 }assert.ok(success);
}
{
 let passed=false;
 for(let seed=0;seed<10000&&!passed;seed+=919){
  const g=game('neo1-16');g.players[1].active=U('base3-5',{energies:Array(5).fill('base1-101')});g.rngState=seed;
  attack(g,'Super Metronome');if(!g.pendingDecision)continue;
  choose(g,'slot:-1');choose(g,'attack:0');
  if(g.pendingDecision)choose(g,'bench:1');
  assert.equal(g.pendingDecision,null);
  passed=true;
 }assert.ok(passed,'Copied Dark Mind chooses Bench target');
}
console.log('PASS v0.51: Kabuto Revive Friends, Politoed Frog Song and copy attack choices');
