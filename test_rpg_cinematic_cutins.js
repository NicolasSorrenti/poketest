'use strict';
const assert=require('node:assert/strict');
const {makeExperience,assetFor,priorityFor,durationFor,MAX_REACTIONS}=require('./rpg_match_reactions');
assert.equal(MAX_REACTIONS,6);
assert.equal(durationFor('attack'),2800);
assert.equal(durationFor('ko_taken'),2600);
assert.equal(durationFor('ko_scored',true),2600);
assert.equal(priorityFor('ko_taken')>priorityFor('attack'),true);
assert.equal(assetFor({characters:{reina:{attack:'/rpg-assets/characters/hana/portraits/primary.png'}}},'reina','attack'),
 '/rpg-assets/characters/reina/portraits/primary.png','never show the wrong NPC');
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
assert.match(children[0].className,/has-wide-action-art/,'attack uses wide artwork');
const battleImage=children[0].children[0].children[0];
assert.equal(battleImage.src,'/rpg-assets/reactions/reina/attack.png');
battleImage.onerror();
assert.equal(battleImage.src,'/rpg-assets/characters/reina/cutins/match-cutin.webp','missing attack uses match art');
assert.match(children[0].className,/has-match-art/,'match art uses its own layout');
battleImage.onerror();
assert.equal(battleImage.src,'/rpg-assets/characters/reina/portraits/primary.png','missing match art uses the same NPC');
assert.doesNotMatch(children[0].className,/has-wide-action-art|has-match-art/,'fallback portrait has neutral framing');
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
