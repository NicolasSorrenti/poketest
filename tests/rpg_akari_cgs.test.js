'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const CG=require('../rpg_cg_gallery'),STORY=require('../rpg_story');
const specs=[
 {id:'akari_route_1',place:'library',slot:0,start:13,end:26,sha:'6a2e5cbea5b4d2fb8c70d6532c5001233bf46e701b72bb68be84405c5adca0bb'},
 {id:'akari_route_3',place:'center',slot:1,start:54,end:70,sha:'25789dbccbc894aac01a7210a74e287e4726e3726d6f8205364d57349f3cdafd'}
];
function state(spec,day=spec.start){
 const s=STORY.normalize({day,slot:spec.slot,location:spec.place,relationships:{},storyDone:{}});
 s.relationships.akari.affection=12;s.relationships.akari.trust=12;
 const e=STORY.byId(spec.id);if(e.prerequisite)s.storyDone[e.prerequisite]={choice:0,day:day-1};
 return s;
}
for(const spec of specs){
 test(spec.id+' matches the story and approved asset bytes',()=>{
  const e=STORY.byId(spec.id),cg=CG.byId(spec.id);
  assert.equal(cg.sceneId,e.id);assert.equal(cg.title,e.title);
  assert.equal(cg.trigger,'story_milestone');assert.equal(cg.character,'akari');assert.equal(cg.category,'social');
  assert.equal(cg.minAffection,0);
  assert.deepEqual([e.place,e.slot,e.start,e.end],[spec.place,spec.slot,spec.start,spec.end]);
  assert.deepEqual([cg.place,cg.slot,cg.startDay],[e.place,e.slot,e.start]);
  for(const [key,dir] of [['path',''],['thumb','thumbs/']]){
   assert.equal(cg[key],'/rpg-assets/events/cg/season01/'+dir+spec.id+'.webp');
   const bytes=fs.readFileSync(path.join(__dirname,'..',cg[key]));
   assert.equal(bytes.toString('ascii',8,12),'WEBP');
   if(key==='path')assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),spec.sha);
  }
 });
 test(spec.id+' requires the completed matching event and valid context',()=>{
  const cg=CG.byId(spec.id),s=state(spec);
  const row=()=>CG.gallery(s).find(x=>x.id===spec.id);
  assert.equal(row().unlocked,false);assert.equal(row().path,null);assert.equal(row().thumb,null);
  assert.deepEqual(CG.record(s,'story_milestone','akari',{eventId:spec.id}),[]);
  STORY.resolve(s,spec.id,0);
  for(const context of [null,{eventId:'akari_route_2'}])assert.deepEqual(CG.record(s,'story_milestone','akari',context),[]);
  for(const [key,value] of [['location','home'],['slot',(spec.slot+1)%3],['day',spec.start-1],['day',91]]){
   const wrong=JSON.parse(JSON.stringify(s));wrong[key]=value;
   assert.deepEqual(CG.record(wrong,'story_milestone','akari',{eventId:spec.id}),[]);
  }
  assert.deepEqual(CG.record(s,'story_milestone','hana',{eventId:spec.id}),[]);
  assert.deepEqual(CG.record(s,'hangout','akari',{eventId:spec.id}).filter(x=>x.id===spec.id),[]);
  assert.deepEqual(CG.record(s,'story_milestone','akari',{eventId:spec.id}),[cg]);
  assert.equal(row().unlocked,true);assert.equal(row().path,cg.path);assert.equal(row().thumb,cg.thumb);
  assert.equal(CG.markViewed(s,spec.id),true);
  const restored=JSON.parse(JSON.stringify(s));assert.equal(CG.unlocked(restored,spec.id),true);
  assert.deepEqual(CG.record(restored,'story_milestone','akari',{eventId:spec.id}),[]);
 });
 test(spec.id+' finishStory records and saves the CG before time advancement can affect eligibility',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../rpg.js'),'utf8');
  const start=source.indexOf('function finishStory(){'),end=source.indexOf('\nfunction beginSideQuest(',start);
  assert.ok(start>=0&&end>start,'finishStory function boundary must be present');
  const finish=source.slice(start,end);
  for(const day of [spec.start,spec.end])for(const choice of [0,1,2]){
   const s=state(spec,day);s.activeStory={id:spec.id,phase:'response',choice};
   let recorded=null,saved=false,closed=false;
   const ctx={state:s,STORY,cast:{akari:{name:'Akari'}},BONDS:{reward:()=>null},BOND_PLAN:{},COLLECT:{},
    log:()=>{},recordIntention:()=>{},recordCG:(...args)=>{const entries=CG.record(s,...args);recorded=entries[0]||null;return entries;},
    advance:()=>{s.slot=(s.slot+1)%3;s.location='home';},persist:()=>{saved=true;},
    closeSceneDialogue:()=>{closed=true;},$:()=>({})};
   vm.runInNewContext(finish+'\nfinishStory();',ctx);
   assert.equal(recorded?.id,spec.id);assert.ok(saved&&closed);assert.equal(s.activeStory,null);
   assert.equal(CG.gallery(s).find(x=>x.id===spec.id).unlocked,true);
  }
 });
}
test('existing Akari introduction and workshop CGs remain distinct',()=>{
 for(const id of ['akari_data_intro','akari_center_workshop']){
  const e=CG.byId(id);assert.ok(e);assert.notEqual(e.trigger,'story_milestone');
  assert.equal(e.path,'/rpg-assets/events/cg/season01/'+id+'.webp');
 }
 assert.deepEqual(CG.validate(),[]);
});
