'use strict';
const assert=require('node:assert/strict');
const {plan,createPresenter}=require('./rpg_time_transitions');

function transition(beforeDay,beforeSlot,afterDay,afterSlot,source){
 return plan({beforeDay,beforeSlot,afterDay,afterSlot,source});
}
assert.equal(transition(5,0,5,1).title,'AFTERNOON');
assert.equal(transition(5,0,5,1).kind,'period');
assert.equal(transition(5,1,5,2).title,'EVENING');
assert.equal(transition(5,2,6,0).kind,'day');
assert.equal(transition(5,2,6,0).newDate,'DAY 06 / 90');
assert.equal(transition(5,0,6,0,'sleep').kind,'sleep');
assert.equal(transition(5,0,6,0,'sleep').title,'A NEW MORNING');
assert.equal(transition(90,2,91,0).kind,'season');
assert.equal(transition(5,0,5,0),null);
assert.equal(transition(5,3,5,0),null);
assert.equal(transition(0,0,5,1),null);
assert.equal(transition(5,0,5,1).weekday,'FRIDAY');

function fakeDOM(reduced=false){
 const listeners=new Map(),timers=new Map(),elements=[];
 function make(tag){
  const handlers={};
  const element={
   tagName:tag,children:[],attributes:{},className:'',style:{values:{},setProperty(n,v){this.values[n]=v;}},
   textContent:'',removed:false,
   append(...nodes){this.children.push(...nodes);},
   setAttribute(k,v){this.attributes[k]=v;},
   addEventListener(name,fn){handlers[name]=fn;},
   removeEventListener(name){delete handlers[name];},
   dispatch(name,event){handlers[name]?.(event||{target:this});},
   remove(){this.removed=true;const index=elements.indexOf(this);if(index>=0)elements.splice(index,1);}
  };
  return element;
 }
 const document={
  createElement:make,
  body:{append(element){elements.push(element);}},
  addEventListener(name,fn){listeners.set(name,fn);},
  removeEventListener(name,fn){if(listeners.get(name)===fn)listeners.delete(name);}
 };
 let next=0;
 const presenter=createPresenter({
  document,window:{matchMedia:()=>({matches:reduced})},
  setTimeout(fn,ms){const id=++next;timers.set(id,{fn,ms});return id;},
  clearTimeout(id){timers.delete(id);}
 });
 return {presenter,elements,timers,listeners};
}
{
 const env=fakeDOM();
 const result=env.presenter.present({beforeDay:1,beforeSlot:0,afterDay:1,afterSlot:1});
 assert.equal(result.title,'AFTERNOON');
 assert.equal(env.presenter.active,true);
 assert.equal(env.elements.length,1);
 const first=env.elements[0];
 assert.match(first.className,/neo-timefx--afternoon/);
 assert.equal(first.attributes.role,'status');
 assert.equal(first.attributes['aria-live'],'polite');
 assert.equal(first.style.values['--neo-timefx-duration'],'680ms');
 assert.equal(env.timers.size,1);
 env.presenter.present({beforeDay:1,beforeSlot:2,afterDay:2,afterSlot:0});
 assert.equal(first.removed,true,'new transitions must replace old overlays');
 assert.equal(env.elements.length,1);
 assert.equal(env.timers.size,1,'superseded timer must be cleared');
 const second=env.elements[0];
 second.dispatch('animationend',{target:second});
 assert.equal(env.presenter.active,false);
 assert.equal(env.elements.length,0);
 assert.equal(env.listeners.size,0);
 assert.equal(env.timers.size,0);
}
{
 const env=fakeDOM();
 env.presenter.present({beforeDay:1,beforeSlot:2,afterDay:2,afterSlot:0,source:'sleep'});
 const evt={key:'Escape',preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};
 env.listeners.get('keydown')(evt);
 assert.equal(evt.prevented,true);
 assert.equal(evt.stopped,true);
 assert.equal(env.elements.length,0);
 assert.equal(env.presenter.active,false);
 assert.equal(env.presenter.present({beforeDay:2,beforeSlot:0,afterDay:2,afterSlot:0}),null);
 assert.equal(env.elements.length,0);
}
{
 const env=fakeDOM(true);
 env.presenter.present({beforeDay:2,beforeSlot:1,afterDay:2,afterSlot:2});
 assert.match(env.elements[0].className,/neo-timefx--reduced/);
 assert.equal(env.elements[0].style.values['--neo-timefx-duration'],'140ms');
 env.presenter.dismiss();
 assert.equal(env.elements.length,0);
}
console.log('RPG calendar/period/sleep transitions: planning, DOM lifecycle, cancellation and reduced-motion checks passed.');
