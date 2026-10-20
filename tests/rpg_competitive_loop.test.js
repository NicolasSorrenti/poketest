'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../rpg_competitive_loop');
const state=(day,slot=0,location='center')=>({day,slot,location,points:0,credits:80,pendingDuel:null});
const match=(s,e)=>({id:'duel-'+s.day+'-'+e.id,npc:e.npc,day:s.day,
 competitiveKind:e.kind,competitiveId:e.id,competitiveRound:e.round,competitiveWeek:e.week});
const finish=(s,e,outcome='Victory')=>{const d=match(s,e);return C.settle(s,d,{duelId:d.id,outcome});};

test('daily center challenges rotate deterministically and do not overwrite saves',()=>{
 const s=state(2);
 const x=C.begin(s,'daily-2');
 assert.equal(x.npc,C.opponent(2,'daily'));
 assert.deepEqual(C.available(s),[x]);
 const before=JSON.stringify(s);
 assert.equal(C.begin(s,x.id).npc,x.npc);
 assert.equal(JSON.stringify(s),before);
 assert.notEqual(C.opponent(2,'daily'),C.opponent(3,'daily'));
});
test('daily victory pays once and cannot be farmed by revisiting center',()=>{
 const s=state(9),e=C.available(s)[0],d=match(s,e);
 const result=finish(s,e);
 assert.equal(result.points,4);
 assert.equal(result.credits,8);
 assert.equal(s.points,4);
 assert.equal(s.credits,88);
 assert.equal(C.settle(s,d,{duelId:d.id,outcome:'Victory'}),null);
 assert.equal(C.available(s).length,0);
 s.location='shop';s.location='center';
 assert.equal(C.available(s).length,0);
 s.day=10;
 assert.equal(C.available(s).length,1);
});
test('defeat or draw consumes only that day of training, without circuit bonuses',()=>{
 for(const outcome of ['Defeat','Draw']){
  const s=state(3),e=C.available(s)[0],result=finish(s,e,outcome);
  assert.equal(result.won,false);
  assert.equal(s.points,0);
  assert.equal(s.credits,80);
  assert.equal(C.available(s).length,0);
 }
});
test('weekly shop locals offer two rounds on Saturday and champion voucher only after second victory',()=>{
 const s=state(6,0,'shop');
 const first=C.begin(s,'local-1-0');
 assert.equal(first.kind,'local');assert.equal(first.round,0);
 const a=finish(s,first);
 assert.equal(a.voucher,false);assert.equal(s.points,5);
 s.slot=1;
 const next=C.begin(s,'local-1-1');
 assert.equal(next.round,1);
 const b=finish(s,next);
 assert.equal(b.champion,true);assert.equal(b.voucher,true);
 assert.equal(b.points,17);assert.equal(b.credits,30);
 assert.equal(s.points,22);assert.equal(s.credits,120);
 assert.equal(C.localProgress(s,1).status,'champion');
 assert.equal(C.available(s).length,0);
});
test('weekly elimination prevents replay, new Saturday creates independent bracket',()=>{
 const s=state(13,1,'shop');
 const first=C.begin(s,'local-2-0');
 assert.equal(finish(s,first,'Defeat').won,false);
 assert.equal(C.localProgress(s,2).status,'eliminated');
 assert.throws(()=>C.begin(s,first.id),/not available/);
 s.day=20;s.slot=0;
 assert.equal(C.begin(s,'local-3-0').week,3);
 assert.equal(C.localProgress(s,2).status,'eliminated');
});
test('draw allows a rematch with a different duel id, never the same receipt twice',()=>{
 const s=state(6,0,'shop'),e=C.begin(s,'local-1-0');
 const a=match(s,e);
 assert.equal(C.settle(s,a,{duelId:a.id,outcome:'Draw'}).draw,true);
 assert.equal(C.settle(s,a,{duelId:a.id,outcome:'Victory'}),null);
 assert.equal(C.localProgress(s,1).round,0);
 s.slot=1;
 const b={...match(s,e),id:'second-duel'};
 assert.equal(C.settle(s,b,{duelId:b.id,outcome:'Victory'}).won,true);
 assert.equal(C.localProgress(s,1).round,1);
});
test('late arrival cannot enter a two-round local when insufficient time remains',()=>{
 const s=state(6,2,'shop');
 assert.equal(C.available(s).length,0);
 assert.equal(C.upcoming(s),6);
 s.day=7;
 assert.equal(C.upcoming(s),13);
});
test('invalid and replayed receipts do not mutate state',()=>{
 const s=state(6,0,'shop'),e=C.begin(s,'local-1-0'),d=match(s,e);
 const before=JSON.stringify(s);
 assert.equal(C.settle(s,d,{duelId:'forged',outcome:'Victory'}),null);
 assert.equal(C.settle(s,d,{duelId:d.id,outcome:'Unknown'}),null);
 assert.equal(JSON.stringify(s),before);
 finish(s,e);
 const snapshot=JSON.stringify(s);
 assert.equal(C.settle(s,d,{duelId:d.id,outcome:'Victory'}),null);
 assert.equal(JSON.stringify(s),snapshot);
});
test('old saves hydrate, and season-local standings survive roundtrip',()=>{
 const s=state(6,0,'shop');
 C.hydrate(s);
 finish(s,C.available(s)[0]);
 const saved=JSON.parse(JSON.stringify(s));
 assert.equal(C.localProgress(saved).round,1);
 assert.equal(C.available(saved)[0].round,1);
 saved.day=91;assert.deepEqual(C.available(saved),[]);
 const migrated=state(28);migrated.competitive=null;
 assert.deepEqual(C.available(migrated).map(e=>e.id),['daily-28']);
});
test('difficulty roster progresses between the three acts without requiring new cards or rule changes',()=>{
 assert.equal(C.tier(30),0);assert.equal(C.tier(31),1);assert.equal(C.tier(61),2);
 assert.ok(C.ROSTERS[0].includes(C.opponent(5,'daily')));
 assert.ok(C.ROSTERS[1].includes(C.opponent(42,'daily')));
 assert.ok(C.ROSTERS[2].includes(C.opponent(82,'daily')));
});
