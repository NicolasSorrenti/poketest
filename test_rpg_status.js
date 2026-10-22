'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const view=require('./rpg_status');
const cast={hana:{name:'Hana'},reina:{name:'Reina'},jinx:{name:'Jinx'}};
const plan={byNpc:{hana:['hana_route_1','hana_route_2'],reina:[],jinx:[]}};
test('status view reads live relationships without changing the save',()=>{
 const state={day:27,slot:2,points:18,credits:73,focus:48,reputation:3,insight:2,
  results:[{won:true},{won:false},{won:true}],met_hana:true,partner:'hana',
  relationships:{hana:{affection:11,trust:8,attraction:3,respect:2,duels:4}},
  bonds:{hana:{affection:9,trust:7,duels:2}},storyDone:{hana_route_1:{choice:0}},
  bondTrials:{hana:true},routeOutcomes:{hana:'romance'}};
 const before=JSON.stringify(state);
 const data=view.project(state,cast,plan);
 assert.equal(JSON.stringify(state),before);
 assert.equal(data.day,27);assert.equal(data.period,'Evening');
 assert.equal(data.wins,2);assert.equal(data.duels,3);
 assert.equal(data.known.length,1);assert.equal(data.undiscovered,2);
 assert.equal(data.known[0].affection,11);assert.equal(data.known[0].trust,8);
 assert.equal(data.known[0].duels,4);
 assert.equal(data.known[0].completed,1);assert.equal(data.known[0].total,2);
 assert.equal(data.known[0].trialWon,true);assert.equal(data.known[0].partner,true);
});
test('unmet characters remain hidden, including names and story details',()=>{
 const data=view.project({day:1,slot:0,relationships:{reina:{affection:0}}},cast,plan);
 assert.equal(data.known.length,0);
 assert.equal(data.undiscovered,3);
 assert.deepEqual(data.known,[]);
});
test('legacy relationship and Reina meet flags remain compatible',()=>{
 const state={day:91,slot:0,metReina:true,relationships:{reina:{affection:0}},
  bonds:{reina:{affection:4,trust:2,duels:1}}};
 const data=view.project(state,cast,plan);
 assert.equal(data.ended,true);assert.equal(data.known[0].id,'reina');
 assert.equal(data.known[0].affection,4);assert.equal(data.known[0].duels,1);
});
test('status entry points and assets are wired into RPG',()=>{
 const html=fs.readFileSync('rpg.html','utf8');
 const js=fs.readFileSync('rpg.js','utf8');
 assert.match(html,/id="statusBtn"/);
 assert.match(html,/id="statusDialog"/);
 assert.match(html,/src="\/rpg_status\.js"/);
 assert.match(html,/href="\/rpg_status\.css"/);
 assert.match(js,/NeoRpgStatus\.open/);
});
