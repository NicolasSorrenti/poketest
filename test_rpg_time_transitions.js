'use strict';
const assert=require('node:assert/strict');
const {plan,planTravel,createPresenter,createSequence}=require('./rpg_time_transitions');
const mandatory=require('./rpg_mandatory_events');

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
 assert.equal(first.style.values['--neo-timefx-duration'],'2200ms',
  'Period transition stays readable at the configured production duration');
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
assert.equal(planTravel({from:'The Lucky Draw',to:'Pixel Palace'}).title,'PIXEL PALACE');
assert.equal(planTravel({from:'Pixel Palace',to:'Pixel Palace'}),null);
assert.equal(planTravel({from:'',to:'Pixel Palace'}),null);
{
 const env=fakeDOM();
 env.presenter.present({beforeDay:5,beforeSlot:2,afterDay:6,afterSlot:0});
 const protectedCalendar=env.elements[0];
 assert.equal(env.presenter.presentTravel({from:'Arcade',to:'Park'}),null,'travel must not interrupt calendar');
 assert.equal(env.elements[0],protectedCalendar);
 env.presenter.dismiss();
 const travel=env.presenter.presentTravel({from:'The Lucky Draw',to:'Pixel Palace'});
 assert.equal(travel.kind,'travel');
 assert.equal(travel.durationMs,440);
 assert.match(env.elements[0].className,/neo-timefx--travel/);
 env.presenter.dismiss();
 assert.equal(env.elements.length,0);
}

{
 // Skip and timer completion must notify the RPG exactly once.
 const env=fakeDOM();
 let finished=0;
 env.presenter.present({beforeDay:3,beforeSlot:0,afterDay:3,afterSlot:1},{onDismiss:()=>finished++});
 env.elements[0].dispatch('click');
 assert.equal(finished,1);
 env.presenter.dismiss();
 assert.equal(finished,1);
}
{
 // A location CG must not appear behind the location transition.
 const env=fakeDOM();
 let revealed=0;
 env.presenter.presentTravel({from:'The Lucky Draw',to:'Riverside Park'});
 env.presenter.whenIdle(()=>revealed++);
 assert.equal(revealed,0);
 const first=env.elements[0];
 // A superseding travel wipe must keep queued CGs waiting.
 env.presenter.presentTravel({from:'Riverside Park',to:'Pixel Palace'});
 assert.equal(revealed,0);
 first.dispatch('animationend',{target:first});
 assert.equal(revealed,0);
 env.elements[0].dispatch('animationend',{target:env.elements[0]});
 assert.equal(revealed,1);
 assert.equal(env.elements.length,0);
}
{
 // Narration and asynchronous image loading must both finish BEFORE time moves visually.
 const order=[];
 let reading=true,complete=null;
 const sequence=createSequence({
  canPresent:()=>!reading,
  present:(change,done)=>{order.push('wipe:'+change.afterSlot);complete=done;return true;},
  onSettled:()=>order.push('mandatory-can-start')
 });
 const releaseCG=sequence.hold();
 sequence.queue({beforeDay:2,beforeSlot:0,afterDay:2,afterSlot:1,source:'activity'});
 assert.equal(sequence.blocked,true);
 assert.equal(sequence.flush(),false,'final line is still being read');
 reading=false;
 assert.equal(sequence.flush(),false,'CG still loading or open');
 releaseCG();
 assert.deepEqual(order,['wipe:1']);
 assert.equal(sequence.running,true);
 complete();
 complete();
 assert.deepEqual(order,['wipe:1','mandatory-can-start']);
 assert.equal(sequence.blocked,false);
}
{
 // Clock changes coalesce while waiting; image failure releases the same hold.
 let change=null,finished=0;
 const sequence=createSequence({present:(c,done)=>{change=c;done();return true;},onSettled:()=>finished++});
 const release=sequence.hold();
 sequence.queue({beforeDay:5,beforeSlot:1,afterDay:5,afterSlot:2,source:'activity'});
 sequence.queue({beforeDay:5,beforeSlot:2,afterDay:6,afterSlot:0,source:'sleep'});
 assert.equal(sequence.flush(),false);
 release();release();
 assert.deepEqual([change.beforeDay,change.beforeSlot,change.afterDay,change.afterSlot],[5,1,6,0]);
 assert.equal(finished,1);
 assert.equal(sequence.blocked,false);
}
{
 // Save/reload and screen transitions may delay a mandatory event but never consume it.
 const events=[
  {id:'chapter_one',kind:'season',earliestDay:2,priority:100,delivery:'world',timeCost:0,
   trigger:{dayGte:2},lines:[{speaker:'Narrator',text:'This matters.'}],
   choices:[{label:'Continue',reply:'It happened.',flag:'chapter_one_complete'}]},
  {id:'chapter_two',kind:'season',earliestDay:2,priority:90,delivery:'world',timeCost:0,
   trigger:{eventSeen:'chapter_one'},lines:[{speaker:'Narrator',text:'The next chapter.'}],
   choices:[{label:'Continue',reply:'This continues.'}]}
 ];
 const state={day:2,slot:1,flags:{},storyDone:{},mandatoryEventState:null,activeStory:{id:'busy'}};
 assert.deepEqual(mandatory.validate(events),[]);
 mandatory.queue(state,events);
 assert.deepEqual(state.mandatoryEventState.pending.map(x=>x.id),['chapter_one']);
 assert.equal(mandatory.takeNext(state,events),null,'active scenes are not interrupted');
 assert.equal(state.mandatoryEventState.seen.chapter_one,undefined);
 const reloaded=JSON.parse(JSON.stringify(state));
 reloaded.activeStory=null;
 assert.equal(mandatory.takeNext(reloaded,events).id,'chapter_one');
 assert.equal(reloaded.mandatoryEventState.seen.chapter_one,undefined);
 assert.equal(mandatory.advanceDialogue(reloaded,events),true);
 assert.equal(mandatory.choose(reloaded,events,0),true);
 assert.equal(reloaded.mandatoryEventState.seen.chapter_one,undefined,'not seen until response acknowledgement');
 const interrupted=JSON.parse(JSON.stringify(reloaded));
 mandatory.hydrate(interrupted,events);
 assert.equal(interrupted.mandatoryEventState.active.phase,'response');
 assert.equal(mandatory.finish(interrupted,events).event.id,'chapter_one');
 assert.equal(interrupted.mandatoryEventState.seen.chapter_one.choice,0);
 mandatory.queue(interrupted,events);
 assert.deepEqual(interrupted.mandatoryEventState.pending.map(x=>x.id),['chapter_two']);
 assert.equal(mandatory.takeNext(interrupted,events),null,'same-slot cap retains pending scenes');
 interrupted.slot=2;
 assert.equal(mandatory.takeNext(interrupted,events).id,'chapter_two');
}

{
 // Being busy must not permanently lose a mandatory beat with a dayLte trigger.
 const event={id:'fleeting_visit',kind:'bond',characterId:'hana',earliestDay:2,priority:10,
  delivery:'remote',timeCost:0,trigger:{all:[{dayGte:2},{dayLte:2}]},
  lines:[{speaker:'hana',text:'We should talk.'}],choices:[{label:'Okay',reply:'Thank you.'}]};
 const events=[event],state={day:2,slot:0,activeStory:{id:'previous_scene'},mandatoryEventState:null};
 mandatory.queue(state,events);
 assert.equal(state.mandatoryEventState.pending[0].eligibleDay,2);
 state.day=4;state.slot=1;
 assert.equal(mandatory.takeNext(state,events),null);
 state.activeStory=null;
 assert.equal(mandatory.takeNext(state,events).id,event.id,'queued window must remain deliverable');
}
console.log('RPG time and travel transitions: planning, DOM lifecycle, priority, skip and reduced-motion checks passed.');
