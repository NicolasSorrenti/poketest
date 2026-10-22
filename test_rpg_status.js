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
test('Status only reveals actually discovered likes and leaves save snapshots unchanged',()=>{
 const s={day:7,met_hana:true,met_reina:true,relationships:{hana:{affection:3},reina:{affection:3}},
  socialHistory:{hana:{lastDay:4,lastTag:'community',lastActivity:'shop_welcome',count:1,likedTags:['community']}}};
 const before=JSON.stringify(s);
 const data=view.project(s,cast,plan);
 assert.deepEqual(data.known.find(p=>p.id==='hana').likes,[{tag:'community',label:'Helping other players'}]);
 assert.deepEqual(data.known.find(p=>p.id==='reina').likes,[]);
 assert.equal(JSON.stringify(s),before);
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


test('Status modal renders, switches characters and closes without editing the campaign',()=>{
 class Node{
  constructor(tag){
   this.tag=tag;this.children=[];this.textContent='';this.style={};this.attributes={};this.handlers={};this.open=false;
   this.classes=new Set();
   this.classList={contains:key=>this.classes.has(key),toggle:(key,on)=>on?this.classes.add(key):this.classes.delete(key)};
  }
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[...nodes];}
  setAttribute(key,value){this.attributes[key]=String(value);}
  addEventListener(key,callback){this.handlers[key]=callback;}
  showModal(){this.open=true;}
  close(){this.open=false;}
 }
 const ids=new Map(['statusDialog','statusOverview','statusCharacters','statusDetail','statusCount']
  .map(id=>[id,new Node(id)]));
 const originalDoc=global.document,originalWin=global.window;
 global.document={getElementById:id=>ids.get(id),createElement:tag=>new Node(tag)};
 global.window={NeoRpgDiscreetAvatars:{set(){}}};
 const save={met_hana:true,met_reina:true,partner:'reina',day:22,slot:1,
  relationships:{hana:{affection:6,trust:2},reina:{affection:12,trust:9}},results:[{won:true}]};
 const before=JSON.stringify(save);
 try{
  view.open(save,cast,plan,()=>new Node('image'));
  assert.equal(ids.get('statusDialog').open,true,'click must open the native dialog');
  assert.equal(ids.get('statusOverview').children.length,8,'season stats should render');
  const entries=ids.get('statusCharacters').children;
  assert.equal(entries.length,3,'two met characters plus one hidden-count label');
  assert.equal(entries[0].children[1].children[0].textContent,'Reina','partner is first');
  entries[1].handlers.click();
  assert.equal(ids.get('statusDetail').children[0].children[0].children[1].textContent,'Hana',
   'selecting another person refreshes relationship details');
  view.close();
  assert.equal(ids.get('statusDialog').open,false,'close button must work');
  assert.equal(JSON.stringify(save),before,'status must not modify saved campaign');
 }finally{
  if(originalDoc===undefined)delete global.document;else global.document=originalDoc;
  if(originalWin===undefined)delete global.window;else global.window=originalWin;
 }
});

test('Status renders only discovered activity hints, not unrevealed favorites',()=>{
 class Node {
  constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.style={};this.attributes={};this.handlers={};this.open=false;this.classes=new Set();
   this.classList={contains:key=>this.classes.has(key),toggle:(key,on)=>on?this.classes.add(key):this.classes.delete(key)};
  }
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[...nodes];}
  setAttribute(key,value){this.attributes[key]=String(value);}
  addEventListener(key,fn){this.handlers[key]=fn;}
  showModal(){this.open=true;}
  close(){this.open=false;}
 }
 const ids=new Map(['statusDialog','statusOverview','statusCharacters','statusDetail','statusCount'].map(id=>[id,new Node(id)]));
 const origDoc=global.document,origWin=global.window;
 global.document={getElementById:id=>ids.get(id),createElement:tag=>new Node(tag)};
 global.window={NeoRpgDiscreetAvatars:{set(){}}};
 const s={met_hana:true,relationships:{hana:{affection:3}},socialHistory:{hana:{lastDay:3,lastTag:'community',count:1,likedTags:['community']}}};
 const before=JSON.stringify(s);
 try{
  view.open(s,cast,plan,()=>new Node('image'));
  const screen=ids.get('statusDetail').children;
  const learned=screen.find(c=>c.className==='status-discovered-likes');
  assert.ok(learned);
  const shown=learned.children.find(c=>c.className==='status-likes-list');
  assert.equal(shown.children.length,1);
  assert.equal(shown.children[0].textContent,'Helping other players');
  assert.equal(JSON.stringify(s),before);
 }finally{
  if(origDoc===undefined)delete global.document;else global.document=origDoc;
  if(origWin===undefined)delete global.window;else global.window=origWin;
 }
});

test('Status is first in the mobile toolbar, and stays discreet-safe',()=>{
 const html=fs.readFileSync('rpg.html','utf8');
 const css=fs.readFileSync('rpg_status.css','utf8');
 const toolbar=html.split('<div class="utility-actions">')[1];
 assert.match(toolbar,/^\s*<button id="statusBtn"/);
 assert.match(css,/#statusBtn\{position:sticky/,'Status is reachable when the mobile toolbar scrolls');
 assert.match(css,/status-character-avatar img:not\(\.rpg-safe-avatar\)/,'original portraits hidden in discreet mode');
 const server=fs.readFileSync('server.js','utf8');
 assert.match(server,/'rpg_status\.js'/,'server allowlist must include the browser controller');
});
