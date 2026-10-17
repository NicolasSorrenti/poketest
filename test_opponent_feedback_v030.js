'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {publicActivity}=require('./duel_protocol');
const {actionDescription,newActivitySince,makeOpponentActivity}=require('./duel_quick_ui');
const getCard=id=>({name:{'gym2-20':"Giovanni's Persian",'base1-99':'Grass Energy','gym1-18':'Misty'}[id]||'Unknown',images:{small:'https://example.org/'+id+'.png'}});
const fake={events:[
 {side:1,type:'setup_select',payload:{handIndex:2,hiddenCard:'secret'},visible:{}},
 {side:1,type:'attach_energy',payload:{handIndex:7,slot:-1,privateSelection:'secret'},visible:{cardId:'base1-99'}},
 {side:1,type:'attack',payload:{attackIndex:0},visible:{cardId:'gym2-20',label:'Scratch'}},
 {side:1,type:'choose',payload:{selected:['deck:2'],decline:false},visible:{}}
]};
const feed=publicActivity(fake);
assert.deepEqual(feed.map(a=>a.seq),[1,2,3,4]);
assert.ok(!JSON.stringify(feed).includes('handIndex'));
assert.ok(!JSON.stringify(feed).includes('privateSelection'));
assert.ok(!JSON.stringify(feed).includes('deck:2'));
assert.equal(feed[0].cardId,undefined,'starting hand remains hidden');
assert.equal(feed[3].cardId,undefined,'private choice remains hidden');
assert.match(actionDescription(feed[1],getCard,'Alex').text,/Alex attached Grass Energy/);
assert.match(actionDescription(feed[2],getCard,'Alex').text,/used Scratch with Giovanni/);
assert.equal(actionDescription(feed[3],getCard,'Alex').text,'Alex made a choice');
assert.deepEqual(newActivitySince(feed,null).newActions,[],'joining/reloading never replays history');
assert.deepEqual(newActivitySince(feed,2).newActions.map(a=>a.seq),[3,4],'poll gaps replay actions in order');
assert.deepEqual(newActivitySince(feed,4).newActions,[],'identical revision never replays actions');
assert.equal(newActivitySince(feed,4).seq,4);
// Integration: both sides get the same ordered activity, but setup choices
// still reveal no hand index or hidden starting Pokémon.
{
 const {ClassicOnlineService}=require('./classic_online_service');
 const {CATALOG}=require('./headless_duel');
 const service=new ClassicOnlineService();
 const first=service.create({deck:'blackout',name:'Ava'});
 const second=service.join({code:first.code,deck:'brushfire',name:'Ben'});
 let room=service.ready(first.code,first.token,{ready:true,revision:second.revision});
 room=service.ready(first.code,second.token,{ready:true,revision:room.revision});
 room=service.start(first.code,first.token,{revision:room.revision});
 const starting=room.view.players[0].hand.findIndex(id=>CATALOG.get(id).subtypes?.includes('Basic'));
 assert.ok(starting>=0);
 const response=service.action(first.code,first.token,{revision:room.revision,command:{type:'setup_select',payload:{handIndex:starting}}});
 const spectator=service.state(first.code,second.token);
 assert.deepEqual(spectator.activity,response.activity);
 assert.equal(spectator.activity.at(-1).type,'setup_select');
 assert.ok(!('cardId' in spectator.activity.at(-1)));
 assert.ok(!('payload' in spectator.activity.at(-1)));
 assert.equal(spectator.view.players[0].active,null,'do not reveal opponent starting Pokémon');
}
class FakeElement{
 constructor(tag='div'){this.tag=tag;this.children=[];this.attrs={};this._text='';this.offsetWidth=300;this.classes=new Set(['hidden']);this.classList={add:(...cs)=>cs.forEach(c=>this.classes.add(c)),remove:(...cs)=>cs.forEach(c=>this.classes.delete(c)),contains:c=>this.classes.has(c),toggle:(c,on)=>{if(on===undefined? !this.classes.has(c):on)this.classes.add(c);else this.classes.delete(c)}};}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
 append(...kids){this.children.push(...kids);}
 setAttribute(k,v){this.attrs[k]=v;}
 querySelector(selector){return selector==='.activity-subtitle'?this.children.find(c=>c.className==='activity-subtitle'):null;}
}
const oldDoc=global.document,oldWindow=global.window;
global.document={createElement:tag=>new FakeElement(tag)};
global.window={matchMedia:()=>({matches:true})};
(async()=>{
 try{
  const status=new FakeElement(),overlay=new FakeElement(),arena=new FakeElement();
  const fx=makeOpponentActivity({status,overlay,arena,getCard});
  const state=(activity,actor=1)=>({view:{phase:'game',turn:actor,over:false,players:[{},{}],pendingDecision:null},activity});
  fx.update(state(feed.slice(0,1)),0,'Alex');
  assert.ok(overlay.classList.contains('hidden'));
  assert.match(status.textContent,/ALEX IS PLAYING/i);
  fx.update(state(feed.slice(0,3)),0,'Alex');
  assert.ok(!overlay.classList.contains('hidden'));
  assert.match(overlay.textContent,/Alex attached Grass Energy/);
  await new Promise(resolve=>setTimeout(resolve,240));
  assert.match(overlay.textContent,/Alex used Scratch/);
  fx.update(state(feed,0),0,'Alex');
  assert.match(status.textContent,/YOUR MOVE/);
  fx.update({view:{phase:'game',turn:0,over:false,pendingDecision:{id:'x',actor:1}},activity:feed},0,'Alex');
  assert.match(status.textContent,/IS CHOOSING/);
  fx.clear();assert.ok(overlay.classList.contains('hidden'));
  for(const file of ['online','classic_live']){
   const html=fs.readFileSync(path.join(__dirname,file+'.html'),'utf8');
   const js=fs.readFileSync(path.join(__dirname,file+'.js'),'utf8');
   assert.match(html,/id="opponentActivityStatus"/);
   assert.match(html,/id="opponentActionFx"/);
   assert.match(js,/makeOpponentActivity\(/);
   assert.match(js,/opponentActivity\.update\(/);
   assert.match(js,/'neo3','neo4'/,'Neo Destiny original card images and names load');
  }
  const css=fs.readFileSync(path.join(__dirname,'classic_live.css'),'utf8');
  assert.match(css,/\.territory \.pokemon-strip,\.territory \.active-slot\{justify-content:center/);
  assert.match(css,/\.hand\{justify-content:center\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  console.log('PASS v0.30: private public feed, poll ordering, opponent captions, activity FX, waiting decision cues, centered CSS, Neo3/4 card assets');
 } finally {global.document=oldDoc;global.window=oldWindow;}
})().catch(e=>{console.error(e);process.exitCode=1;});
