'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const p=require('./battle_presentation_ui');
const lookup=id=>({e:{name:'Fire Energy',supertype:'Energy',attacks:[],abilities:[]},se:{name:'Double Colorless Energy',supertype:'Energy',subtypes:['Special']},mon:{name:'Charmander'}}[id]||{});
const players=[{active:{id:'mon',damage:0,energies:[]},bench:[]},{active:{id:'mon',damage:0,energies:[]},bench:[]}];
const view={phase:'game',turn:0,over:false,players};
assert.match(p.attackReason({view,me:0,attack:{name:'Ember',cost:['Fire']},unit:players[0].active,getCard:lookup}),/Not enough matching Energy/);
assert.equal(p.attackReason({view,me:0,attack:{name:'Ember',cost:['Fire']},unit:{...players[0].active,energies:['e']},getCard:lookup}),null);
assert.equal(p.attackReason({view,me:0,attack:{name:'Slash',cost:['Colorless','Colorless']},unit:{...players[0].active,energies:['se']},getCard:lookup}),null,'Do not misjudge special energy');
assert.match(p.attackReason({view:{...view,turn:1},me:0,attack:{cost:[]},unit:players[0].active,getCard:lookup}),/only during your turn/);
assert.match(p.attackReason({view:{...view,pendingDecision:{actor:0}},me:0,attack:{cost:[]},unit:players[0].active,getCard:lookup}),/Resolve/);
assert.match(p.attackReason({view,me:0,attack:{cost:[]},unit:{...players[0].active,status:'Asleep'},getCard:lookup}),/Asleep/);
assert.deepEqual(p.hpChanges(view,{...view,players:[players[0],{...players[1],active:{id:'mon',damage:30}}]},0),[{side:1,relative:'enemy',slot:-1,delta:30}]);
assert.deepEqual(p.hpChanges(view,{...view,players:[players[0],{...players[1],active:{id:'other',damage:30}}]},0),[],'Do not fabricate damage on Pokémon switch');
const publicFeed=[{seq:1,side:1,type:'setup_select'},{seq:2,side:0,type:'attack',cardId:'mon',label:'Scratch'},{seq:3,side:1,type:'choose'},{seq:4,side:1,type:'attack',cardId:'mon',label:'Ember'}];
assert.deepEqual(p.publicActions(publicFeed,0,lookup).map(a=>a.text),['Opponent selected a starting Pokémon','You used Scratch with Charmander','Opponent made a choice','Opponent used Ember with Charmander']);
class FakeElement{
 constructor(){this.children=[];this.classes=new Set();this.classList={add:(...x)=>x.forEach(y=>this.classes.add(y)),remove:(...x)=>x.forEach(y=>this.classes.delete(y)),contains:y=>this.classes.has(y)};this.parentNode=null;this._text='';this.attrs={};}
 set textContent(x){this._text=String(x);this.children=[];}get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n);}}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);}
 setAttribute(k,v){this.attrs[k]=v;}
 get offsetWidth(){return 200;}
}
const originalDocument=global.document,originalWindow=global.window;
global.document={createElement:()=>new FakeElement(),getElementById:()=>null};
global.window={matchMedia:()=>({matches:true})};
(async()=>{try{
 const stage=new FakeElement(),popup=new FakeElement(),timeline=new FakeElement();
 const app=p.makeBattlePresentation({stage,popup,timeline,getCard:lookup,me:()=>0,opponentName:()=> 'Opponent'});
 const state=(feed,revision,damage=0)=>({revision,activity:feed,view:{...view,players:[players[0],{...players[1],active:{id:'mon',damage}}]}});
 app.update(state(publicFeed.slice(0,1),1));
 assert.equal(popup.children.length,0,'Do not replay old attacks on initial load');
 app.update(state(publicFeed.slice(0,3),2));
 assert.match(popup.textContent,/SCRATCH/,'Attacks by you trigger a visible banner');
 assert.match(timeline.textContent,/You used Scratch/,'Action history includes both players');
 app.update(state(publicFeed,3,20));
 assert.match(timeline.textContent,/Opponent used Ember/);
 assert.equal(timeline.children.length,4);
 const first=timeline.children[0];app.update(state(publicFeed,3,20));assert.equal(timeline.children[0],first,'Unchanged polls do not rebuild the feed');
 app.reset();assert.equal(timeline.children.length,0);assert.ok(popup.classList.contains('hidden'));
 for(const file of ['classic_live.html','online.html']){
  const html=fs.readFileSync(__dirname+'/'+file,'utf8');for(const id of ['combatFx','actionTimeline'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/battle_presentation_ui.js/);
 }
 for(const file of ['classic_live.js','online.js']){
  const src=fs.readFileSync(__dirname+'/'+file,'utf8');assert.match(src,/combat.update\(current\)/);assert.match(src,/shared\.renderAttacks\(/);assert.match(src,/attackReason:presentation\.attackReason/);
 }
 console.log('PASS v0.36: public actions, attack and evolution cues, HP deltas, turn guidance, poll idempotence and two UIs');
 }finally{global.document=originalDocument;global.window=originalWindow;}})();
