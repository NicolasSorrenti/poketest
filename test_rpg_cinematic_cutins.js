'use strict';
const assert=require('node:assert/strict');
const {makeExperience,assetFor,priorityFor,durationFor,MAX_REACTIONS}=require('./rpg_match_reactions');
assert.equal(MAX_REACTIONS,6);
assert.equal(durationFor('attack'),2800);
assert.equal(durationFor('ko_taken'),2600);
assert.equal(durationFor('ko_scored',true),2600);
assert.equal(priorityFor('ko_taken')>priorityFor('attack'),true);
assert.equal(assetFor({characters:{reina:{attack:'/rpg-assets/characters/hana/portraits/primary.png'}}},'reina','attack'),
 '/rpg-assets/characters/reina/vn-expressions/angry.webp','never show the wrong NPC');
assert.equal(assetFor({characters:{reina:{attack:'/rpg-assets/characters/reina/reactions/attack.webp'}}},'reina','attack'),
 '/rpg-assets/characters/reina/reactions/attack.webp');

const classes=new Set(['hidden']),children=[],timers=new Map();
let timerId=0;
const el={
 classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)},
 replaceChildren(...nodes){children.splice(0,children.length,...nodes)}
};
function node(tag){
 const attrs={};
 return {
  tagName:tag,children:[],className:'',textContent:'',alt:'',src:'',style:{},
  classList:{add(name){this._added=name}},attrs,
  append(...nodes){this.children.push(...nodes);},
  remove(){this.removed=true;},
  getAttribute(name){return name==='src'?this.src:attrs[name];},
  setAttribute(name,value){attrs[name]=value;}
 };
}
const make=makeExperience({
 element:el,npcId:'reina',npcName:'Reina',random:()=>0,doc:{createElement:node},
 schedule:(fn,ms)=>{const id=++timerId;timers.set(id,{fn:()=>{timers.delete(id);fn();},ms});return id;},
 cancel:id=>{timers.delete(id);},
 media:{matchMedia:()=>({matches:false})}
});
const view=(p0=6,p1=6)=>({phase:'game',players:[
 {prizeCount:p0,active:{id:'p0',damage:0},bench:[]},
 {prizeCount:p1,active:{id:'p1',damage:0},bench:[]}
]});
make.setManifest({characters:{reina:{
 attack:'/rpg-assets/reactions/reina/attack.png',
 match_cutin:'/rpg-assets/characters/reina/cutins/match-cutin.webp',
 default:'/rpg-assets/characters/reina/portraits/primary.png'
}}});
assert.equal(make.update({view:view(),activity:[]}),null,'initial state should not replay');
const first=make.update({view:view(),activity:[{seq:3,type:'attack',side:1,label:'Tackle'}]});
assert.equal(first.kind,'attack');
assert.equal(make.active,true);
assert.equal(timers.values().next().value.ms,2800,'attack art remains readable');
assert.equal(children[0].className.includes('npc-reaction-attack'),true);
assert.match(children[0].className,/has-wide-action-art/,'Dedicated attack illustration appears first');
const battleImage=children[0].children[0].children[0];
const vn='/rpg-assets/characters/reina/vn-expressions/';
assert.equal(battleImage.src,'/rpg-assets/reactions/reina/attack.png','Reina uses her dedicated attack illustration');
battleImage.onerror();
assert.equal(battleImage.src,vn+'angry.webp','The aggressive VN expression is the first fallback');
assert.match(children[0].className,/has-vn-expression/);
battleImage.onerror();
assert.equal(battleImage.src,vn+'happy.webp','Try another installed expression if the first fails');
battleImage.onerror();
assert.equal(battleImage.src,vn+'neutral.webp','Fall back to the VN neutral expression');
battleImage.onerror();
assert.equal(battleImage.src,'/rpg-assets/characters/reina/cutins/match-cutin.webp');
assert.match(children[0].className,/has-match-art/);
battleImage.onerror();
assert.equal(battleImage.src,'/rpg-assets/characters/reina/portraits/primary.png','Original portrait remains the final fallback');
assert.doesNotMatch(children[0].className,/has-vn-expression|has-wide-action-art|has-match-art/);
assert.equal(classes.has('hidden'),false);
const second=make.update({view:view(),activity:[{seq:6,type:'play_trainer',side:1}]});
assert.equal(second.kind,'play_card');
assert.equal(make.queued,'play_card');
const critical=make.update({view:view(5,6),activity:[]});
assert.equal(critical.kind,'ko_taken');
assert.equal(make.active,true);
assert.equal(make.queued,null,'knockout cancels stale queued banter');
assert.equal(children[0].className.includes('is-finisher'),true);
assert.equal(timers.size,1,'old timers get cleared');
assert.equal(timers.values().next().value.ms,2600);
timers.values().next().value.fn();
assert.equal(make.active,false);
assert.equal(children.length,0);
assert.equal(classes.has('hidden'),true);
assert.equal(timers.size,0);
make.reset();
assert.equal(make.count,0);
console.log('RPG cinematic cut-ins: wide art, match fallback, readable timing, KO priority, queue and NPC safety passed.');

async function verifyDelayedArtwork(){
 const classes=new Set(['hidden']),children=[],timers=[],calls=[];
 const el={classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},
  replaceChildren(...xs){children.splice(0,children.length,...xs)}};
 const doc={createElement(tag){return{tagName:tag,children:[],className:'',classList:{add(){}},
  append(...xs){this.children.push(...xs)},remove(){}}}};
 const pending=new Map();
 const attack='/rpg-assets/reactions/reina/attack.png';
 const fallback='/rpg-assets/characters/reina/cutins/match-cutin.webp';
 class MockImage{
  set src(path){
   const xs=pending.get(path)||[];xs.push(this);pending.set(path,xs);
   if(path!==attack&&path!==fallback)queueMicrotask(()=>this.onerror?.());
  }
 }
 const experience=makeExperience({element:el,npcId:'reina',npcName:'Reina',random:()=>0,
  doc,media:{Image:MockImage},onShow:x=>calls.push(x),
  schedule:(fn,ms)=>{timers.push({fn,ms});return timers.length},cancel:()=>{}});
 experience.setManifest({characters:{reina:{attack,match_cutin:fallback}}});
 const view=p=>({phase:'game',players:[
  {prizeCount:p,active:{id:'a',damage:0},bench:[]},
  {prizeCount:6,active:{id:'b',damage:0},bench:[]}
 ]});
 experience.update({view:view(6),activity:[]});
 experience.update({view:view(6),activity:[{seq:3,type:'attack',side:1,label:'Tackle'}]});
 const untilShown=experience.whenShown();
 await new Promise(resolve=>setImmediate(resolve)); // Missing VN variants are rejected before older art.
 assert.equal(classes.has('hidden'),true,'wait while image loads');
 assert.equal(timers.length,0,'no duration consumed before load');
 pending.get(attack)[0].onerror();
 await new Promise(resolve=>setImmediate(resolve));
 const alternate=pending.get(fallback)?.[0];
 assert.ok(alternate,'try the fallback before showing');
 assert.equal(classes.has('hidden'),true,'wait for fallback');
 alternate.onload();
 await untilShown;
 assert.equal(classes.has('hidden'),false);
 assert.equal(timers[0].ms,2800);
 assert.equal(children[0].children[0].children[0].src,fallback);
 assert.equal(calls[0].imageCandidates[0],fallback,'chat avatar starts with working image');
 experience.reset();
 assert.equal(classes.has('hidden'),true);
 // A canceled cut-in must stay canceled even if its request completes later.
 const stale=makeExperience({element:el,npcId:'reina',npcName:'Reina',random:()=>0,
  doc,media:{Image:MockImage},onShow:x=>calls.push(x),
  schedule:(fn,ms)=>{timers.push({fn,ms});return timers.length},cancel:()=>{}});
 stale.setManifest({characters:{reina:{attack,match_cutin:fallback}}});
 stale.update({view:view(6),activity:[]});
 stale.update({view:view(6),activity:[{seq:4,type:'attack',side:1,label:'Tackle'}]});
 const canceled=stale.whenShown(),beforeCancelCount=calls.length;
 await new Promise(resolve=>setImmediate(resolve)); // Let VN errors reach the pending attack fallback.
 const pendingStale=pending.get(attack)?.at(-1);
 assert.ok(typeof pendingStale?.onload==='function','Stale image request should still be pending');
 stale.reset();
 await canceled;
 pendingStale.onload?.();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(classes.has('hidden'),true,'old image must not revive canceled cut-in');
 assert.equal(calls.length,beforeCancelCount,'no stale chat entry');
 console.log('RPG delayed image, fallback loading, and stale cancellation passed.');
}
verifyDelayedArtwork().catch(error=>{console.error(error);process.exitCode=1;});
