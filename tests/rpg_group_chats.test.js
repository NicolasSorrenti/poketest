'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const GROUP=require('../rpg_group_chats');
const VN=require('../rpg_conversations');
const SCHEDULES=require('../rpg_schedules');
const SCENE_CAST=require('../rpg_scene_cast');
const everyday=require('../rpg_everyday_chats');
const actor={intro:'First meeting',repeat:'Hello',talk:['Legacy topic A','Legacy topic B']};
const cast=Object.fromEntries([...new Set(GROUP.groups.flatMap(g=>g.pair))].map(id=>[id,{name:id.toUpperCase()}]));
function metState(day=1,slot=0,location='shop'){
 const state={day,slot,location,metReina:true};
 for(const id of Object.keys(cast))state['met_'+id]=true;
 return state;
}

test('authored multi-speaker conversations are complete and use actual cast IDs',()=>{
 assert.equal(GROUP.groups.length,14);
 assert.equal(GROUP.groups.reduce((n,g)=>n+g.scenes.length,0),70);
 assert.deepEqual(GROUP.validate(),[]);
 const keys=new Set();
 for(const g of GROUP.groups){
  assert.ok(g.pair.length>=2&&g.pair.length<=3);
  assert.ok(g.pair.every(id=>id in cast));
  const key=[...g.pair].sort().join(':');
  assert.ok(!keys.has(key),key+' repeated');keys.add(key);
  for(const script of g.scenes){
   assert.equal(script.length,7,key);
   for(const [speaker,line] of script){
    assert.ok(speaker==='Protagonist'||g.pair.includes(speaker),key+' invalid speaker');
    assert.ok(typeof line==='string'&&line.trim(),key+' blank line');
   }
  }
 }
});

test('group Talk never invents absent or unintroduced conversation partners',()=>{
 for(const g of GROUP.groups){
  const state=metState();
  const all=[...g.pair];
  assert.equal(GROUP.candidates(state,g.pair[0],all).some(x=>x===g),true);
  const without=all.slice(0,-1);
  assert.equal(GROUP.candidates(state,g.pair[0],without).includes(g),false);
  const stranger=metState();
  delete stranger['met_'+g.pair[1]];
  assert.equal(GROUP.candidates(stranger,g.pair[0],all).includes(g),false);
 }
 assert.deepEqual(GROUP.candidates(metState(),'not_in_cast',[]),[]);
 assert.equal(GROUP.select(metState(),'not_in_cast',[]),null);
 assert.equal(GROUP.select(metState(),GROUP.groups[0].pair[0],[]),null);
});

test('all five variants in every group can occur at real co-locations during the 90-day season',()=>{
 for(const g of GROUP.groups){
  const seen=new Set();
  for(let day=1;day<=90;day++)for(let slot=0;slot<3;slot++){
   const location=SCHEDULES.locationFor(g.pair[0],day,slot);
   if(!location||location==='home'||!g.pair.every(id=>SCHEDULES.locationFor(id,day,slot)===location))continue;
   const present=SCHEDULES.peopleAt(day,slot,location);
   const state=metState(day,slot,location),snapshot=JSON.stringify(state);
   for(const npc of g.pair){
    const lines=GROUP.select(state,npc,present);
    if(lines&&g.scenes.some(row=>row[0][1]===lines[0].text)){
     assert.ok(lines.every(x=>x.speaker==='Protagonist'||present.includes(x.speaker)));
     const composition=SCENE_CAST.select({cast,present,portraitId:npc,shown:{dialogue:lines,speaker:cast[npc].name,line:lines[0].text}});
     assert.ok(g.pair.every(id=>composition.participants.includes(id)),g.pair.join('+')+' missing visible speaker');
     seen.add(g.scenes.findIndex(row=>row[0][1]===lines[0].text));
     assert.deepEqual(GROUP.select(state,npc,present),lines);
    }
   }
   assert.equal(JSON.stringify(state),snapshot,'group selection mutates saves');
  }
  assert.deepEqual([...seen].sort(),[0,1,2,3,4],g.pair.join('+')+' never displays a variant');
 }
});

test('first meetings win; otherwise Talk can select group conversation and fall back safely',()=>{
 const g=GROUP.groups[0],npc=g.pair[0];
 const state=metState(1,0,'shop');
 assert.equal(VN.dialogue(state,npc,actor,null,{first:true,present:g.pair})[0].text,actor.intro);
 let found=false;
 for(let day=1;day<=90;day++){
  const s=metState(day,1,'shop'),present=g.pair;
  const expected=GROUP.select(s,npc,present);
  const spoken=VN.dialogue(s,npc,actor,null,{present});
  if(expected){found=true;assert.deepEqual(spoken,expected);break;}
 }
 assert.ok(found,'group conversation should be reachable');
 const normal=VN.dialogue(state,npc,actor,null);
 assert.ok(normal.length>=3);
 assert.ok(normal.some(line=>line.speaker==='Protagonist'));
 assert.ok(everyday.topics[npc].length===23);
});

test('browser loads group content before Talk; runtime passes real attendance to both entry points',()=>{
 const root=path.join(__dirname,'..');
 const boot=fs.readFileSync(path.join(root,'rpg_character_bootstrap.js'),'utf8');
 const client=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
 const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
 assert.ok(boot.includes('"/rpg_group_chats.js"'));
 assert.ok(boot.indexOf('"/rpg_group_chats.js"')<boot.indexOf('"/rpg_conversations.js"'));
 assert.ok(server.includes("pathname==='/rpg_group_chats.js'"));
 assert.equal((client.match(/VN\.dialogue\(state,id,c,RPGD,\{(?:first,)?present:currentPeople\(\)\}\)/g)||[]).length,2);
});
