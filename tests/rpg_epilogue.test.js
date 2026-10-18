'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),E=require('../rpg_epilogue');
const defaults=()=>({day:1,slot:0,location:'home',ended:false,points:0,credits:80,results:[],relationships:{},partner:null,
  storyDone:{},encountersDone:{},tournaments:{},campaignHistory:[],ngPlus:0,playerDeck:'blackout'});
test('a quiet season closes without inventing wins or romances',()=>{
 const s={...defaults(),day:91,ended:true};
 const r=E.report(s);
 assert.equal(r.title,'Ninety Days in Neo Harbor');assert.equal(r.wins,0);assert.equal(r.knownCharacters,0);assert.equal(r.partner,null);
});
test('a champion report counts earned cup results and actual duel outcomes',()=>{
 const s={...defaults(),day:91,points:96,results:[{won:true},{won:true},{won:false},{draw:true}],
  tournaments:{championship:{state:'champion',round:3},regional:{state:'eliminated',round:1}}};
 const r=E.report(s);
 assert.equal(r.title,'The Harbor Champion');assert.equal(r.played,4);assert.equal(r.wins,2);assert.equal(r.losses,1);assert.equal(r.draws,1);
 assert.equal(r.cups.find(x=>x.id==='championship').status,'champion');
});
test('a committed relationship is acknowledged but friendship does not invent romance',()=>{
 const s={...defaults(),day:91,partner:'hana',relationships:{hana:{affection:10,trust:8},reina:{affection:5,trust:3}}};
 const r=E.report(s);
 assert.equal(r.partner,'Hana Mizuno');assert.equal(r.closest[0].name,'Hana Mizuno');
 assert.equal(r.title,'A Connection Beyond the Circuit');
 s.partner=null;assert.equal(E.report(s).partner,null);assert.equal(E.report(s).title,'The People Who Stayed');
});
test('report generation does not modify save data and works after JSON restore',()=>{
 const s={...defaults(),day:91,relationships:{yuna:{affection:4}},results:[{won:true}]};
 const before=JSON.stringify(s),report=E.report(s);
 assert.equal(JSON.stringify(s),before);assert.deepEqual(E.report(JSON.parse(before)),report);
});
test('New Game+ preserves only archive and preferred deck while resetting progression',()=>{
 const old={...defaults(),day:91,ended:true,playerDeck:'brushfire',points:99,credits:999,ngPlus:1,
  partner:'reina',relationships:{reina:{affection:20,trust:20}},results:[{won:true}],storyDone:{one:{day:2}},
  tournaments:{neighborhood:{state:'champion',round:3}}};
 const next=E.replay(old,defaults);
 assert.equal(next.day,1);assert.equal(next.ngPlus,2);assert.equal(next.playerDeck,'brushfire');
 assert.equal(next.credits,80);assert.equal(next.partner,null);assert.deepEqual(next.results,[]);assert.deepEqual(next.tournaments,{});
 assert.equal(next.campaignHistory.length,1);assert.equal(next.campaignHistory[0].partner,'Reina Kurogane');
});
test('history is capped and replay requires a finished season',()=>{
 const old={...defaults(),day:91,ended:true,campaignHistory:Array.from({length:12},(_,i)=>({title:'Season '+i}))};
 assert.equal(E.replay(old,defaults).campaignHistory.length,10);
 old.day=40;old.ended=false;assert.throws(()=>E.replay(old,defaults),/Finish/);
});
