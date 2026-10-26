
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const SLICE=require('../rpg_slice_of_life'),CG=require('../rpg_cg_gallery'),SCHEDULES=require('../rpg_schedules'),PACKS=require('../rpg_character_packs.generated');
const events=SLICE.scenes.filter(e=>e.randomForced);
test('all seven archived events preserve exact PNGs, omit Jinx, and validate',()=>{
 assert.equal(events.length,7);
 assert.equal(new Set(events.map(e=>e.id)).size,7);
 assert.ok(events.every(e=>e.npc!=='jinx'&&e.trigger==='entry'&&e.lines.length===5));
 assert.deepEqual(SLICE.validate(),[]);
 assert.deepEqual(CG.validate(),[]);
 for(const e of events){
  assert.ok(fs.existsSync(path.join(__dirname,'..',e.image.slice(1))),e.id);
  assert.equal(CG.byId(e.id)?.path,e.image);
  assert.equal(CG.byId(e.id)?.thumb,e.image);
 }
});
test('forced CG slots are reachable, random rolls persist, and scenes finish once',()=>{
 for(const e of events){
  const pack=PACKS.packs.find(p=>p.id===e.npc);
  assert.ok(pack,'unknown NPC '+e.npc);
  let day=null;
  for(let d=e.start;d<=e.end;d++)if(pack.schedule[(d-1)%7]?.[e.slot]===e.place){day=d;break;}
  assert.ok(day,'unreachable authored slot '+e.id);
  let s=null;
  for(let seed=0;seed<1000;seed++){
   const proposed={day,slot:e.slot,location:e.place,randomForcedCGSeed:seed,
    relationships:{[e.npc]:{affection:9,trust:9}},['met_'+e.npc]:true,
    sliceOfLifeDone:{},sliceOfLifeLastDay:0,activeSliceOfLife:null,focus:75};
   if(SLICE.available(proposed,[e.npc],'entry',e.npc,{onlyRandomForced:true}).some(m=>m.id===e.id)){s=proposed;break;}
  }
  assert.ok(s,'roll unavailable '+e.id);
  assert.ok(SLICE.scheduleOverrides(s).some(o=>o.npc===e.npc&&o.place===e.place),'missing schedule pin '+e.id);
  assert.equal(SCHEDULES.locationFor(e.npc,day,e.slot,SLICE.scheduleOverrides(s)),e.place);
  assert.deepEqual(SLICE.available({...s,activeStory:{id:'route'}},[e.npc],'entry',e.npc,{onlyRandomForced:true}),[]);
  assert.deepEqual(SLICE.available(s,[e.npc],'talk',e.npc,{onlyRandomForced:true}),[]);
  for(const other of events)if(other.id!==e.id)s.sliceOfLifeDone[other.id]={day:1,slot:0};
  const started=SLICE.start(s,[e.npc],'entry',e.npc,{onlyRandomForced:true});
  assert.equal(started?.id,e.id);
  assert.equal(s.focus,75);assert.equal(s.day,day);
  assert.deepEqual(CG.record(s,'slice',e.npc,{eventId:e.id}).map(x=>x.id),[e.id]);
  const restored=JSON.parse(JSON.stringify(s));SLICE.hydrate(restored);
  assert.equal(restored.randomForcedCGSeed,s.randomForcedCGSeed);
  for(let step=1;step<e.lines.length;step++)assert.equal(SLICE.next(restored).step,step);
  assert.equal(SLICE.next(restored).done,true);
  assert.equal(restored.activeSliceOfLife,null);
  assert.equal(SLICE.start(restored,[e.npc],'entry',e.npc,{onlyRandomForced:true}),null);
 }
});
