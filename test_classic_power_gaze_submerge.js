'use strict';
// Behavioral tests of two Neo Discovery / Neo Revelation Powers.
const assert=require('node:assert/strict');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const P=require('./classic_power_core');
const {publicView}=require('./duel_protocol');
const base=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,status=null)=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status,poison:false,playedTurn:0});
const byName=name=>[...CATALOG.values()].find(x=>x.name===name)?.id;
const send=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,type+' failed: '+r.error);};
function ready(id){
 const g=createGame({format:'classic',decks:[base,base],seed:22022});
 g.phase='game';g.round=3;g.turnSerial=8;g.turn=0;
 for(const p of g.players){p.active=unit('base1-44');p.bench=[unit('base1-27')];p.deck=['base1-91','base1-98','base1-99'];p.prizes=['base1-92'];p.hand=[];p.discard=[];}
 g.players[0].active=unit(id);return g;
}
function choose(g,id){const d=g.pendingDecision;assert.ok(d,'Expected decision');send(g,d.actor,'choose',{decisionId:d.id,selected:[id]});}
let cases=0;
{
 const g=ready('neo2-40');
 g.players[1].bench=[unit('base1-27'),unit('neo2-47')];
 const target=g.players[1].bench[1];
 assert.equal(P.enabled(g,target,'Darkness'),true);
 send(g,0,'use_power',{slot:-1});
 assert.deepEqual(g.pendingDecision.options.map(x=>x.id),['bench:1'],
  'Gaze may select only opponent Bench Pokémon with Pokémon Powers');
 assert.deepEqual(publicView(g,0).pendingDecision.options.map(x=>x.id),['bench:1']);
 assert.equal(publicView(g,1).pendingDecision.options,undefined);
 choose(g,'bench:1');
 assert.equal(P.enabled(g,g.players[1].bench[1],'Darkness'),false);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false,'Only one Gaze per turn');
 // Gaze ends if target leaves the Bench, not if the entire turn has ended.
 const moved=g.players[1].bench.splice(1,1)[0];g.players[1].active=moved;
 assert.equal(P.enabled(g,moved,'Darkness'),true);
 assert.equal(moved.gazeSuppressedUntil,undefined);
 cases++;
}
{
 const g=ready('neo2-40');
 g.players[1].bench=[unit('neo2-47')];
 send(g,0,'use_power',{slot:-1});choose(g,'bench:0');
 assert.equal(P.enabled(g,g.players[1].bench[0],'Darkness'),false);
 g.turnSerial++;
 assert.equal(P.enabled(g,g.players[1].bench[0],'Darkness'),true,'Gaze ends at end of the turn');
 cases++;
}
{
 const g=ready('neo2-40');
 g.players[1].bench=[unit('base1-27')];
 const before=structuredClone(g);
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 assert.deepEqual(g,before,'Gaze should fail atomically when no opponent Power target exists');
 cases++;
}
{
 // Gaze suppression must also disable global passive Powers such as Muk's
 // Toxic Gas; merely checking the underlying printed Power is not enough.
 const g=ready('neo2-40');
 const muk=unit('base3-13');
 g.players[1].bench=[muk];
 assert.equal(P.enabled(g,g.players[0].active,'Gaze'),false,
   'Active Toxic Gas normally blanks Igglybuff');
 muk.gazeSuppressedUntil=g.turnSerial+1;
 assert.equal(P.enabled(g,g.players[0].active,'Gaze'),true,
   'Suppressed Toxic Gas must no longer blank other Powers');
 cases++;
}
function attackDamage(useSubmerge){
 const g=ready('neo3-32');
 const own=g.players[0],f=g.players[1];
 own.active.energies=Array(3).fill(byName('Lightning Energy'));
 f.active=unit(byName('Charmander'));
 assert.ok(CATALOG.get(f.active.id).weaknesses.some(w=>w.type==='Water'));
 if(useSubmerge){
  send(g,0,'use_power',{slot:-1});
  assert.equal(g.players[0].active.submergeUntil,g.turnSerial+1);
  assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 }
 send(g,0,'attack',{attackIndex:0});
 return g.players[1].active.damage;
}
{
 assert.equal(attackDamage(false),30,'Lanturn normally deals printed Lightning-type damage');
 assert.equal(attackDamage(true),60,'Submerge converts damage type to Water, triggering weakness');
 cases++;
}
{
 const g=ready('neo3-32');
 g.players[0].active.status='Confused';
 assert.equal(applyCommand(g,0,{type:'use_power',payload:{slot:-1}}).ok,false);
 g.players[0].active.status=null;
 send(g,0,'use_power',{slot:-1});
 assert.equal(g.players[0].active.submergeUntil,g.turnSerial+1);
 g.players[0].active.status='Asleep';
 assert.equal(P.enabled(g,g.players[0].active,'Submerge'),false);
 cases++;
}
console.log('PASS Neo Powers Gaze + Submerge:',cases,'authoritative scenarios');
