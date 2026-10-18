'use strict';
// Tests for four original Neo printings through the same authoritative reducer
// used by CPU and two-browser multiplayer, not just the signature compiler.
const assert=require('node:assert/strict');
const ATTACK=require('./attack_effects_core');
const {defs}=require('./neo_attack_batch_v089');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const {list}=require('./authentic_decks');
const costEnergy={Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Grass:'base1-99',Fighting:'base1-97',Psychic:'base1-101',Colorless:'base1-99',Metal:'neo1-19',Darkness:'neo1-104'};
const unit=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
function attack(id,name){const a=CATALOG.get(id)?.attacks?.find(a=>a.name===name);assert.ok(a,id+': '+name);return a;}
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),a=attack(id,name),p=ATTACK.compile(a);
 assert.equal(p?.kind,'neo89:'+kind,key+' compiles');
 assert.equal(ATTACK.compile({...a,text:a.text+' corrupted'}),null,key+' has no loose text fallback');
 assert.equal(ATTACK.compile({...a,cost:['Colorless']}),null,key+' has no loose Energy cost fallback');
}
const roll=(id,name,coin=[],context={})=>{
 const seq=[...coin];return ATTACK.resolve(ATTACK.compile(attack(id,name)),()=>{assert.ok(seq.length,'unexpected extra coin flip');return seq.shift();},context);
};
assert.equal(roll('neo3-20','Aerowing',[],{optionalBoost:false}).damage,40);
assert.equal(roll('neo3-20','Aerowing',[true],{optionalBoost:true}).damage,80);
assert.equal(roll('neo3-20','Aerowing',[false],{optionalBoost:true}).damage,0);
assert.equal(roll('neo3-21','Lightning Strike',[],{optionalBoost:false}).damage,40);
assert.equal(roll('neo3-21','Lightning Strike',[],{optionalBoost:true}).damage,80);
assert.equal(roll('neo3-21','Lightning Strike',[],{optionalBoost:true}).discardAllSelfEnergy,true);
assert.equal(roll('neo4-26','Knock Over',[],{optionalBoost:false}).discardStadium,undefined);
assert.equal(roll('neo4-26','Knock Over',[],{optionalBoost:true}).discardStadium,true);
assert.equal(roll('neo3-10','Plasma',[],{discardEnergyIndex:2}).recoverAttachedEnergyIndex,2);
function make(id,name){
 const deck=list('base1:Brushfire'),g=createGame({decks:[deck,deck],format:'online-preview',seed:124});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;g.rngState=38291;
 g.players[0].active=unit(id,{energies:attack(id,name).cost.map(t=>costEnergy[t])});
 g.players[1].active=unit('base1-3'); // Chansey: no Lightning Weakness; survives an 80-damage hit.
 for(const p of g.players){p.bench=[unit('base1-2')];p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
const send=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+' failed: '+r.error);};
const begin=(g,name)=>{send(g,0,'attack',{attackIndex:CATALOG.get(g.players[0].active.id).attacks.findIndex(a=>a.name===name)});return g.pendingDecision;};
const yes=(g,d)=>send(g,0,'choose',{decisionId:d.id,selected:['choice:yes']});
const no=(g,d)=>send(g,0,'choose',{decisionId:d.id,selected:[],decline:true});
{
 const g=make('neo3-20','Aerowing');
 const d=begin(g,'Aerowing');assert.equal(d?.actor,0);
 const wrong=applyCommand(g,1,{type:'choose',payload:{decisionId:d.id,selected:['choice:yes']}});
 assert.equal(wrong.ok,false,'opponent cannot make attacker option decisions');
 assert.equal(g.pendingDecision?.id,d.id,'illegal choice leaves pending action intact');
 no(g,d);
 assert.equal(g.players[1].active.damage,40,'declining optional coin preserves 40 damage');
}
{
 const seen=new Set();
 for(let seed=0;seed<200&&seen.size<2;seed++){
  const g=make('neo3-20','Aerowing');g.rngState=seed*6553600;
  const d=begin(g,'Aerowing');yes(g,d);
  const actual=g.players[1].active.damage;
  assert.ok([0,80].includes(actual),'opt-in coin can only yield 0 or 80');
  seen.add(actual);
 }
 assert.deepEqual([...seen].sort((a,b)=>a-b),[0,80],'both actual-coin outcomes verified');
}
{
 const g=make('neo3-21','Lightning Strike');
 const d=begin(g,'Lightning Strike');no(g,d);
 assert.equal(g.players[1].active.damage,40);
 assert.equal(g.players[0].active.energies.length,attack('neo3-21','Lightning Strike').cost.length);
}
{
 const g=make('neo3-21','Lightning Strike');
 g.players[0].active.energies.push('base1-101');
 const quantity=g.players[0].active.energies.length,discard=g.players[0].discard.length;
 const d=begin(g,'Lightning Strike');yes(g,d);
 assert.equal(g.players[1].active.damage,80);
 assert.equal(g.players[0].active.energies.length,0,'must discard ALL attached Energy cards');
 assert.equal(g.players[0].discard.length,discard+quantity,'all attached cards reach discard');
}
{
 const g=make('neo4-26','Knock Over');
 begin(g,'Knock Over');assert.equal(g.pendingDecision,null,'Stadium-less attack does not prompt');
 assert.equal(g.players[1].active.damage,30);
}
for(const discardIt of [true,false]){
 const g=make('neo4-26','Knock Over'),stadium='gym1-103';
 g.stadium={id:stadium,owner:1};
 const d=begin(g,'Knock Over');assert.equal(d?.actor,0);
 if(discardIt)yes(g,d);else no(g,d);
 assert.equal(g.players[1].active.damage,30,'Knock Over always does 30 damage');
 assert.equal(g.stadium,discardIt?null:g.stadium);
 if(discardIt){assert.ok(g.players[1].discard.includes(stadium));}
 else assert.equal(g.stadium.id,stadium,'declined option preserves Stadium');
}
{
 const g=make('neo3-10','Plasma');g.players[0].discard=['base1-98','base1-102','base1-94'];
 const d=begin(g,'Plasma');assert.equal(d?.actor,0);
 assert.deepEqual(d.options.map(o=>o.id),['discard:0','discard:1'],'only Energy cards can be selected');
 const bad=applyCommand(g,0,{type:'choose',payload:{decisionId:d.id,selected:['discard:2']}});
 assert.equal(bad.ok,false,'cannot attach Trainer from discard');
 assert.equal(g.pendingDecision?.id,d.id,'invalid Plasma choice rolls back');
 send(g,0,'choose',{decisionId:d.id,selected:['discard:1']});
 assert.equal(g.players[0].active.energies.at(-1),'base1-102');
 assert.deepEqual(g.players[0].discard,['base1-98','base1-94']);
 assert.equal(g.players[1].active.damage,30);
}
{
 const g=make('neo3-10','Plasma');g.players[0].discard=[];
 begin(g,'Plasma');assert.equal(g.pendingDecision,null);
 assert.equal(g.players[1].active.damage,30);
}
console.log('PASS Neo v089: 4 exact historical attacks; four choice flows; both outcomes; Energy selection/rollback; stadium ownership');
