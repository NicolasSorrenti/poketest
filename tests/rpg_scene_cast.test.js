'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const CAST=require('../rpg_scene_cast');
const cast={hana:{name:'Hana Mizuno'},reina:{name:'Reina Kurogane'},yuna:{name:'Yuna Hoshino'},
 akari:{name:'Akari Fujimoto'},rin:{name:'Rin'},sol:{name:'Sol Varela'}};
const present=['hana','reina','yuna','akari'];
const compose=rest=>CAST.select({cast,present,...rest});
test('free roaming still shows the nearby cast outside any conversation',()=>{
 const scene=compose({shown:{speaker:'Narrator',line:'The shop is open.'}});
 assert.equal(scene.conversation,false);
 assert.deepEqual(scene.participants,present);
});
test('a one-on-one conversation hides all bystanders, even when they are in the location',()=>{
 const scene=compose({portraitId:'hana',shown:{speaker:'Hana Mizuno',line:'Do you have a moment?'}});
 assert.equal(scene.conversation,true);
 assert.deepEqual(scene.participants,['hana']);
 assert.equal(scene.focused,'hana');
});
test('the same partner remains onstage during player or narrator lines',()=>{
 const lines=[{speaker:'hana',text:'You made it!'}, {speaker:'Protagonist',text:'Sure did.'},
  {speaker:'Narrator',text:'The lights dim.'}];
 const scene=compose({portraitId:'hana',shown:{speaker:'You',line:'Sure did.',dialogue:lines,index:1}});
 assert.equal(scene.conversation,true);
 assert.deepEqual(scene.participants,['hana']);
 assert.equal(scene.focused,null);
});
test('authored group conversation keeps every participating speaker and removes bystanders',()=>{
 const lines=[{speaker:'hana',text:'Hey.'},{speaker:'yuna',text:'Over here.'},
  {speaker:'Protagonist',text:'What is happening?'}];
 const scene=compose({active:true,portraitId:'reina',shown:{speaker:'You',line:'What is happening?'},
  script:lines});
 assert.deepEqual(scene.participants,['hana','yuna']);
 assert.equal(scene.conversation,true);
});
test('group participants can speak even when the location list is capped or stale',()=>{
 const scene=compose({active:true,portraitId:'hana',
  shown:{speaker:'Sol Varela',line:'I have an idea.'},
  script:[['hana','Hello'],['sol','Hi'],['rin','Ready?']]});
 assert.deepEqual(scene.participants,['hana','sol','rin']);
 assert.equal(scene.focused,'sol');
});
test('narrated encounters keep their own character without displaying everyone nearby',()=>{
 const event=compose({active:true,portraitId:'reina',shown:{speaker:'Narrator',line:'A sudden noise.'}});
 assert.deepEqual(event.participants,['reina']);
 const solo=compose({active:true,portraitId:null,shown:{speaker:'Narrator',line:'The lights go out.'}});
 assert.deepEqual(solo.participants,[]);
});
test('remote conversations show no physical NPC onstage',()=>{
 const scene=compose({active:true,remote:true,portraitId:'hana',
  shown:{speaker:'✉ Hana Mizuno · message',line:'See you tomorrow'},
  script:[{speaker:'hana',text:'See you tomorrow'}]});
 assert.deepEqual(scene.participants,[]);
 assert.equal(scene.conversation,true);
});
test('an ordinary travel/narration beat restores the free-roaming cast',()=>{
 const scene=compose({portraitId:null,shown:{speaker:'Narrator',line:'You head to the arcade.'}});
 assert.deepEqual(scene.participants,present);
 assert.equal(scene.conversation,false);
});
