'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const ATTACK=require('./attack_effects_core');
const U=(id,x={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...x});
function game(source,opts={}){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:25});
 g.phase='game';g.round=7;g.turn=0;g.turnSerial=22;g.rngState=opts.seed??211;
 g.players[0].active=U('neo1-16',{damage:opts.damage||0,energies:opts.energies||['base1-99','base1-99','base1-99']});
 g.players[0].bench=[U('neo2-11'),U('base1-46')];
 g.players[1].active=U(source,{energies:['base1-99']});
 g.players[1].bench=[U('base1-58')];
 for(const p of g.players){p.prizes=Array(6).fill('base1-99');p.deck=Array(15).fill('base1-99');p.hand=[];p.discard=[];}
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);}
function choose(g,id){const d=g.pendingDecision;assert.ok(d,'Decision required');send(g,d.actor,'choose',{decisionId:d.id,selected:[id||d.options[0].id]});}
function metronome(source,attackName,opts={}){
 const idx=CATALOG.get(source).attacks.findIndex(a=>a.name===attackName);
 assert.ok(idx>=0,source+' has '+attackName);
 for(let seed=0;seed<15000;seed+=151){
  const g=game(source,{...opts,seed:seed*6553600+(opts.seed||0)});send(g,0,'attack',{attackIndex:0});
  if(!g.pendingDecision)continue;
  assert.equal(g.pendingDecision.actor,0,'Chooser always controls Super Metronome');
  const sources=g.pendingDecision.options.map(x=>x.id);assert.ok(sources.includes('slot:-1'));
  choose(g,'slot:-1');
  if(!g.pendingDecision.options.some(x=>x.id==='attack:'+idx))throw Error(attackName+' was excluded from supported copied attacks');
  choose(g,'attack:'+idx);
  return g;
 }
 throw Error('No Super Metronome heads after seeded trials');
}
for(const id of ['base1-3','base1-44','base3-48','base4-80','base2-35']){
 const c=CATALOG.get(id);assert.ok(c?.attacks?.length);
}
assert.equal(ATTACK.compile(CATALOG.get('base1-3').attacks[0]).kind,'coin-shield');
assert.equal(ATTACK.compile(CATALOG.get('base1-44').attacks[0]).kind,'leech-seed');
assert.equal(ATTACK.compile(CATALOG.get('base3-48').attacks.find(a=>a.name==='Minimize')).kind,'damage-shield');
assert.equal(ATTACK.compile(CATALOG.get('base4-80').attacks.find(a=>a.name==='Pay Day')).kind,'coin-draw');
assert.equal(ATTACK.compile(CATALOG.get('base2-35').attacks.find(a=>a.name==='Big Eggsplosion')).kind,'energy-coins');
{
 const g=metronome('base3-48','Minimize');
 assert.equal(g.players[0].active.shield.reduce,20,'Copied Minimize shields the copier');
 assert.equal(g.players[1].active.shield,undefined,'Source Grimer must not receive copied shield');
}
{
 let shielded=false,unshielded=false;
 for(let seed=1;seed<8000&&!(shielded&&unshielded);seed+=163){
  const g=metronome('base1-3','Scrunch',{seed});
  const active=g.players[0].active;
  if(active.shield){shielded=true;assert.equal(active.shield.preventDamage,true);}
  else unshielded=true;
  assert.equal(g.players[1].active.shield,undefined);
 }
 assert.ok(shielded&&unshielded,'Copied Scrunch has both shield coin outcomes');
}
{
 const g=metronome('base1-44','Leech Seed',{damage:30});
 assert.equal(g.players[0].active.damage,20,'Copied Leech Seed heals the copier');
 assert.equal(g.players[1].active.damage,20,'Copied Leech Seed damages the current defender');
}
{
 let drew=false,missed=false;
 for(let seed=1;seed<8000&&!(drew&&missed);seed+=193){
  const g=metronome('base4-80','Pay Day',{seed});
  if(g.players[0].hand.length) drew=true;
  else missed=true;
  assert.equal(g.players[1].hand.length,1,'Only the mandatory opponent turn-start draw applies to the source owner');
 }
 assert.ok(drew&&missed,'Copied Pay Day must use a real coin outcome');
}
{
 const g=metronome('base2-35','Big Eggsplosion',{energies:['base1-99','base1-99','base1-99']});
 const flips=g.coinFlips; // Includes one successful Super Metronome flip followed by copied attack flips.
 const copyFlips=flips.slice(-3).filter(x=>x.result==='heads').length;
 assert.equal(g.players[1].active.damage,copyFlips*20,'Copied Big Eggsplosion uses COPIER Energy count and coin results');
}
{
 const g=game('base1-4',{energies:['base1-99']});let succeeded=false;
 for(let seed=0;seed<12000&&!succeeded;seed+=157){
  const trial=structuredClone(g);trial.rngState=seed*6553600;send(trial,0,'attack',{attackIndex:0});
  if(!trial.pendingDecision)continue;
  assert.equal(trial.pendingDecision.options.some(x=>x.id==='slot:-1'),false,'Unpayable Fire Spin must not appear as a selectable source');
  succeeded=true;
 }
 assert.ok(succeeded,'Unpayable additional Energy cost filtered on heads');
}
{
 let seenHeads=false;
 for(let seed=0;seed<12000&&!seenHeads;seed+=157){
  const g=game('base1-4',{energies:['base1-99'],seed:seed*6553600});
  g.players[1].bench=[]; // Only Fire Spin, which demands two additional discards.
  send(g,0,'attack',{attackIndex:0});
  if(g.coinFlips.at(-1)?.result!=='heads')continue;
  assert.equal(g.pendingDecision,null,'No payable attack means no selection, not a rejected command');
  assert.equal(g.turn,1,'No-effect heads consumes the attack and advances the turn');
  assert.equal(g.players[1].active.damage,0);
  seenHeads=true;
 }
 assert.ok(seenHeads,'No-eligible-target heads must be tested');
}
console.log('PASS v0.69: copied shield/heal/draw/energy-coins, coin outcomes, copier identity and impossible additional costs');
