'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../rpg_situations'),CG=require('../rpg_cg_gallery'),Schedules=require('../rpg_schedules');
const npcs=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
const ready=(e,extra={})=>({day:e.start,slot:e.slot,location:e.place,focus:50,credits:80,
 relationships:Object.fromEntries(npcs.map(n=>[n,{affection:10,trust:4,respect:0}])),
 bonds:Object.fromEntries(npcs.map(n=>[n,{affection:10,trust:4,duels:0}])),
 hungOut:{},situationDone:{},activeSituation:null,...extra});
const firstDay=e=>{for(let day=e.start;day<=e.end;day++)if(Schedules.locationFor(e.npc,day,e.slot)===e.place&&S.chance(e,day,e.slot))return day;return null};
test('narrated situations have character-spoken responses rather than third-person explanations',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const rpg=fs.readFileSync(path.join(__dirname,'..','rpg.js'),'utf8');
 assert.match(rpg,/if\(a\.phase==='choice'\)return \{speaker:'Narrator',line:e\.intro/,'the scene introduction must be narrator text');
 for(const e of S.events){
  assert.ok(e.intro.length>40,'missing physical context for '+e.id);
  assert.equal(e.options.length,2);
  for(const option of e.options){
   assert.ok(option.response.length>=30,'missing response '+e.id);
   assert.doesNotMatch(option.response,/^(?:She |He |Hana |Reina |Shiori |Yuna |Akari |Camila |Marina |Kaede )(?:laughs|nods|smiles|thanks|accepts|discovers|strikes|starts|puts|turns)\b/i,'response should sound spoken by its NPC '+e.id);
  }
 }
});
test('all planned CGs have unique real-life event definitions',()=>{
 assert.deepEqual(S.validate(),[]);assert.equal(S.events.length,16);
 assert.equal(new Set(S.events.map(x=>x.id)).size,8);
 assert.deepEqual(S.events.map(x=>x.id).sort(),CG.catalog.filter(x=>x.category==='special').map(x=>x.id).sort());
 for(const e of S.events)assert.equal(CG.byId(e.id).trigger,'situation');
});
test('all eight situations are discoverable during the 90-day season with the real NPC schedule',()=>{
 for(const e of S.events){
  const d=firstDay(e);assert.ok(d, e.id+' has no real matching schedule slot');
  const s=ready(e,{day:d});
  assert.ok(S.available(s,[e.npc]).some(x=>x.id===e.id),e.id+' not eligible on day '+d);
  assert.ok(!S.available(s,[]).some(x=>x.id===e.id));
 }
});
test('the chance is stable across reload and cannot be rerolled by repeated reads',()=>{
 const e=S.events[0],d=firstDay(e),s=ready(e,{day:d});
 const before=JSON.stringify(s),first=S.available(s,[e.npc]).map(x=>x.id);
 for(let k=0;k<20;k++)assert.deepEqual(S.available(JSON.parse(JSON.stringify(s)),[e.npc]).map(x=>x.id),first);
 assert.equal(JSON.stringify(s),before);
 assert.equal(S.chance(e,d,e.slot),true);
});
test('situation requires exact day period venue bond and NPC presence',()=>{
 const e=S.events[0],day=firstDay(e);
 const s=ready(e,{day});
 assert.ok(S.available(s,[e.npc]).length>0);
 assert.deepEqual(S.available({...s,slot:(e.slot+1)%3},[e.npc]),[]);
 assert.deepEqual(S.available({...s,location:'home'},[e.npc]),[]);
 assert.deepEqual(S.available({...s,day:e.end+1},[e.npc]),[]);
 assert.deepEqual(S.available({...s,relationships:{[e.npc]:{affection:0,trust:1}}},[e.npc]),[]);
 assert.deepEqual(S.available({...s,relationships:{[e.npc]:{affection:8,trust:0}}},[e.npc]),[]);
 assert.deepEqual(S.available({...s,focus:0},[e.npc]),[]);
});
test('choice/resolution costs only one period in controller, not the domain engine',()=>{
 const e=S.events[0],s=ready(e,{day:firstDay(e)});
 S.start(s,e.id,[e.npc]);
 assert.equal(s.activeSituation.phase,'choice');assert.equal(s.focus,50);
 const response=S.choose(s,0);assert.ok(response.response);assert.equal(s.focus,50);
 const result=S.finish(s,[e.npc]);
 assert.equal(result.event.id,e.id);assert.equal(result.choice,0);
 assert.equal(s.focus,44);assert.equal(s.relationships[e.npc].affection,11);
 assert.equal(s.relationships[e.npc].trust,6);assert.equal(s.bonds[e.npc].affection,11);
 assert.equal(s.situationDone[e.id].day,firstDay(e));
 assert.equal(s.hungOut[s.day+':'+e.npc],true);
 assert.equal(s.activeSituation,null);
 assert.deepEqual(S.available(s,[e.npc]),[]);
 assert.throws(()=>S.finish(s,[e.npc]),/No situation ready/);
});
test('different responses change relationship progression without forcing romance',()=>{
 const e=S.events[0],s=ready(e,{day:firstDay(e)});
 S.start(s,e.id,[e.npc]);S.choose(s,1);S.finish(s,[e.npc]);
 assert.equal(s.relationships[e.npc].affection,12);assert.equal(s.relationships[e.npc].trust,5);
 assert.equal(s.partner,undefined);assert.equal(s.relationships[e.npc].attraction,undefined);
});
test('save/reload at both dialogue stages preserves the choice and does not double rewards',()=>{
 const e=S.events[3],s=ready(e,{day:firstDay(e)});
 S.start(s,e.id,[e.npc]);let restored=JSON.parse(JSON.stringify(s));
 S.hydrate(restored);assert.equal(restored.activeSituation.phase,'choice');
 S.choose(restored,1);restored=JSON.parse(JSON.stringify(restored));
 S.hydrate(restored);assert.equal(restored.activeSituation.phase,'response');
 S.finish(restored,[e.npc]);const before=JSON.stringify(restored);
 assert.throws(()=>S.finish(restored,[e.npc]),/No situation ready/);
 assert.equal(JSON.stringify(restored),before);
});
test('an existing daily hangout blocks a second situational reward',()=>{
 const e=S.events[2],d=firstDay(e),s=ready(e,{day:d,hungOut:{[d+':'+e.npc]:true}});
 assert.deepEqual(S.available(s,[e.npc]),[]);
 assert.throws(()=>S.start(s,e.id,[e.npc]),/not available/);
});
test('resource depletion or missing NPC before resolution leaves state unchanged',()=>{
 const e=S.events[3],s=ready(e,{day:firstDay(e)});
 S.start(s,e.id,[e.npc]);S.choose(s,0);s.focus=0;
 const before=JSON.stringify(s);
 assert.throws(()=>S.finish(s,[e.npc]),/no longer available|not available|Not enough focus/);
 assert.equal(JSON.stringify(s),before);
 s.focus=50;
 assert.throws(()=>S.finish(s,[]),/no longer available/);
});
test('a finished situational event unlocks only its own special CG exactly once',()=>{
 const e=S.events[0],s=ready(e,{day:firstDay(e)});
 assert.deepEqual(CG.record(s,'situation',e.npc,{eventId:e.id}),[]);
 S.start(s,e.id,[e.npc]);S.choose(s,0);S.finish(s,[e.npc]);
 const got=CG.record(s,'situation',e.npc,{eventId:e.id});
 assert.deepEqual(got.map(x=>x.id),[e.id]);
 assert.equal(CG.record(s,'situation',e.npc,{eventId:e.id}).length,0);
 assert.equal(CG.record(s,'situation',e.npc,{eventId:'another'}).length,0);
 assert.ok(CG.gallery(s,{character:e.npc}).find(x=>x.id===e.id).unlocked);
});
test('malformed save metadata is repaired and an old save still has an empty event history',()=>{
 const s=ready(S.events[0],{situationDone:{fake:{day:1,choice:0},hana_apron_mixup:{day:-1,choice:0}},
 activeSituation:{id:'unknown',phase:'response',choice:0}});
 S.hydrate(s);assert.deepEqual(s.situationDone,{});assert.equal(s.activeSituation,null);
 const legacy={day:1};S.hydrate(legacy);assert.deepEqual(legacy.situationDone,{});
});
test('all events share the existing playable locations and are SFW adult-cast, without invented beach destination',()=>{
 const venues=new Set(Schedules.publicPlaces);
 for(const e of S.events){
  assert.ok(venues.has(e.place));
  assert.notEqual(e.place,'beach');
  assert.ok(e.intro.length>25&&e.options.every(o=>o.response.length>30));
 }
});
