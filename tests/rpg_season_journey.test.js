'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Journey=require('../rpg_season_journey'),CG=require('../rpg_cg_gallery'),Epilogue=require('../rpg_epilogue');
const base=(extra={})=>({day:1,slot:0,location:'home',ended:false,results:[],partner:null,points:0,credits:80,
 ngPlus:0,campaignHistory:[],storyDone:{},relationships:{},sideQuests:{},appointments:[],situationDone:{},
 cgUnlocked:{},cgViewed:{},tournaments:{},...extra});
const defaults=()=>base();
test('G6: progress summary has 32 canonical scene slots, grouped by eight characters and four event types',()=>{
 const g=Journey.gallerySummary(base(),CG);
 assert.equal(g.total,32);assert.equal(g.unlocked,0);assert.equal(g.viewed,0);assert.equal(g.percent,0);
 assert.equal(Object.keys(g.byCharacter).length,8);assert.equal(Object.keys(g.byCategory).length,4);
 for(const x of Object.values(g.byCharacter))assert.equal(x.total,4);
 for(const x of Object.values(g.byCategory))assert.equal(x.total,8);
});
test('G6: gallery summary ignores invalid awards, cannot mutate caller and excludes viewed but locked memories',()=>{
 const s=base({cgUnlocked:{hana_first_meeting:{day:3,slot:0,trigger:'meet'},invalid:{day:5,slot:0}},
  cgViewed:{hana_first_meeting:true,reina_rival_intro:true}});
 const before=JSON.stringify(s),g=Journey.gallerySummary(s,CG);
 assert.equal(g.unlocked,1);assert.equal(g.viewed,1);assert.equal(g.percent,3);
 assert.equal(JSON.stringify(s),before);
});
test('G6: milestones are spoiler-free and reflect social choices, calendar and earned art',()=>{
 const s=base({day:40,storyDone:{hana_route_1:{day:10}},relationships:{hana:{affection:5,trust:3}},
  appointments:[{status:'attended'}],cgUnlocked:{hana_first_meeting:{day:2,slot:0}}});
 const list=Journey.milestones(s,CG);
 assert.equal(list.length,3);
 assert.equal(list[0].title,'Make your mark');
 assert.match(list[1].detail,/1 kept appointments/);
 assert.match(list[2].detail,/1 of 32/);
 assert.ok(list.every(x=>!x.detail.includes('hana_route_1')));
 assert.equal(Journey.milestones({...s,day:91,ended:true},CG)[0].title,'Your season is complete');
});
test('G6: season report includes earned romance-neutral social accomplishments without inventing outcomes',()=>{
 const s=base({day:91,ended:true,sideQuests:{a:{status:'complete'},b:{status:'active'}},
  appointments:[{status:'attended'},{status:'missed'},{status:'attended'}],
  situationDone:{hana_apron_mixup:{day:10,slot:1,choice:0}},
  cgUnlocked:{hana_first_meeting:{day:1,slot:0},hana_apron_mixup:{day:10,slot:1}}});
 const report=Epilogue.report(s);
 assert.equal(report.sidequests,1);assert.equal(report.appointments,2);
 assert.equal(report.situations,1);assert.equal(report.galleryEarned,2);
 assert.equal(report.partner,null);
});
test('G6: New Game+ keeps CG collection and viewed flags but resets all event and relationship state',()=>{
 const s=base({day:91,ended:true,ngPlus:2,credits:1000,points:120,
  partner:'hana',results:[{won:true}],relationships:{hana:{affection:12,trust:10}},
  situationDone:{hana_apron_mixup:{day:10,slot:1,choice:0}},
  cgUnlocked:{hana_first_meeting:{day:2,slot:0,trigger:'meet'}},cgViewed:{hana_first_meeting:true}});
 const next=Epilogue.replay(s,defaults);
 assert.equal(next.ngPlus,3);assert.equal(next.day,1);assert.equal(next.partner,null);
 assert.equal(next.results.length,0);assert.equal(next.credits,80);assert.equal(next.points,0);
 assert.deepEqual(next.situationDone,{});assert.deepEqual(next.relationships,{});
 assert.deepEqual(next.cgUnlocked,s.cgUnlocked);assert.deepEqual(next.cgViewed,s.cgViewed);
 assert.notEqual(next.cgUnlocked,s.cgUnlocked);assert.notEqual(next.cgViewed,s.cgViewed);
 assert.equal(next.campaignHistory.length,1);assert.equal(next.campaignHistory[0].situations,1);
});
test('G6: archive exposes only user achievements, caps to 10 and preserves order',()=>{
 const s=base({campaignHistory:Array.from({length:14},(_,i)=>({run:i+1,title:'Season '+(i+1),
  wins:i,points:i*5,played:i+2,galleryEarned:i+1}))});
 const items=Journey.archive(s);
 assert.equal(items.length,10);assert.equal(items[0].run,5);assert.equal(items[9].run,14);
 assert.equal(items[9].memories,14);
 assert.ok(items.every(x=>!('storyDone' in x)));
});
test('G6: malformed or missing archive metadata is ignored or normalized for old saves',()=>{
 const s=base({campaignHistory:[null,{bad:true},{title:'Past season'},{title:'Another run',played:-5,points:NaN,run:2}]});
 assert.deepEqual(Journey.archive(s).map(x=>x.title),['Past season','Another run']);
 assert.equal(Journey.archive(s)[1].points,0);assert.equal(Journey.archive(s)[1].played,0);
});
test('G6: long seasonal progress reads remain deterministic and never spend a period or unlock anything',()=>{
 for(let day=1;day<=91;day++)for(let slot=0;slot<3;slot++){
  const s=base({day,slot,location:'park'});
  const before=JSON.stringify(s),report=Journey.currentRun(s,CG),goals=Journey.milestones(s,CG);
  assert.ok(report.gallery.remaining>=0&&report.gallery.remaining<=32);
  assert.ok(goals.length===3&&goals.every(x=>x.title&&x.detail));
  assert.equal(JSON.stringify(s),before);
 }
});
test('G6: seasons cannot replay before day 91 and gallery does not influence competitive achievements',()=>{
 const active=base({day:90,slot:2,ended:false,cgUnlocked:{hana_first_meeting:{day:1,slot:0}}});
 assert.throws(()=>Epilogue.replay(active,defaults),/Finish/);
 const completed=base({...active,day:91,ended:true});
 const stats=Epilogue.report(completed);
 assert.equal(stats.wins,0);assert.equal(stats.champions,0);
 assert.equal(stats.galleryEarned,1);
});
