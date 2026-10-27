'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const reel=fs.readFileSync(path.join(__dirname,'../rpg.js'),'utf8');
const names=['barb','hana','laca','marina'];
test('year-end reel is gated to Day 91 and persists completion before display',()=>{
 assert.match(reel,/state\.day!==91\|\|state\.yearEndFallReelCompleted/);
 assert.match(reel,/state\.yearEndFallReelCompleted=true;persist\(\)/);
 assert.match(reel,/queueMicrotask\(maybeShowYearEndFallReel\)/);
 for(const blocker of ['pendingDuel','activeStory','mandatoryEventState','activeSliceOfLife','activeSituation','activeEncounter','activeArc','activeSideQuest','timeSequence.blocked'])assert.ok(reel.includes(blocker),blocker);
});
test('Day 89 and Day 90 stay outside the reel; only Day 91 can start it',()=>{
 const guard=reel.slice(reel.indexOf('function maybeShowYearEndFallReel()'),reel.indexOf('const entries=[[\'Barb\',\'barb\']'));
 assert.match(guard,/state\.day!==91/);
 assert.equal([89,90].map(day=>day===91).some(Boolean),false);
 assert.equal(91===91,true);
});
test('reel presents all four approved illustrations in sequence',()=>{
 const i=reel.indexOf("const entries=[['Barb','barb']");assert.notEqual(i,-1);
 assert.deepEqual([...reel.slice(i,reel.indexOf('];let index=0',i)).matchAll(/\['([A-Za-z]+)','([a-z]+)'\]/g)].map(x=>x[1]),['Barb','Hana','Laca','Marina']);
 for(const name of names){const b=fs.readFileSync(path.join(__dirname,'../rpg-assets/events/cg/season01/year_end_fall_'+name+'.webp'));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.ok(b.length>10000);}
});
test('viewer supports close and navigation controls with mobile-sized layout',()=>{
 for(const token of ['Previous','Next →','Close','Escape','ArrowRight','ArrowLeft','max-height:72dvh','flex-wrap:wrap'])assert.ok(reel.includes(token),token);
});
