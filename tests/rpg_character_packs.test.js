'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const tools=require('../scripts/rpg-character-packs');
const REGISTRY=require('../rpg_character_packs.generated');
const SOL=require('../rpg_sol_character');
const STORY=require('../rpg_story');
const SCHEDULES=require('../rpg_schedules');
const {deckOptions}=require('../classic_local_service');

const solDir=path.join(__dirname,'..','characters','sol');
const sol=tools.discover().find(x=>x.def.id==='sol');
const clone=()=>structuredClone(sol);

test('Sol lives in a complete JSON pack with valid art, dialogue and seven authored scenes',()=>{
 assert.ok(sol);
 assert.equal(tools.validate(sol),true);
 assert.equal(sol.def.id,'sol');
 assert.equal(sol.def.age,26);
 assert.equal(sol.def.role,'romance');
 assert.equal(sol.stories.events.length,7);
 assert.ok(sol.bible.includes('quiet'));
 assert.equal(sol.art.characterId,'sol');
 assert.ok(fs.existsSync(path.join(solDir,'character.json')));
 for(const name of ['stories.json','bible.md','art_manifest.json'])assert.ok(fs.existsSync(path.join(solDir,name)));
 assert.ok(deckOptions().some(x=>x.id===sol.def.deck));
});

test('Sol JSON is the live source of truth, and old API/story/save IDs stay compatible',()=>{
 const current=REGISTRY.byId('sol');
 assert.ok(current);
 assert.equal(current.cast.name,sol.def.name);
 assert.equal(current.cast.deck,sol.def.deck);
 assert.deepEqual(current.events.map(e=>e.id),sol.stories.events.map(e=>e.id));
 assert.deepEqual(SOL.events.map(e=>e.id),sol.stories.events.map(e=>e.id));
 assert.equal(STORY.events.filter(e=>e.id.startsWith('sol_route_')).length,5);
 assert.equal(SCHEDULES.locationFor('sol',8,1),sol.def.schedule[0][1]);
 assert.equal(REGISTRY.events.filter(e=>e.npc==='sol').length,7);
});

test('generated registry is deterministic and exactly matches checked-in pack data',()=>{
 assert.ok(tools.check().some(x=>x.def.id==='sol'));
 const first=tools.bundle(tools.discover()),second=tools.bundle(tools.discover());
 assert.equal(first,second);
 assert.equal(first,fs.readFileSync(path.join(__dirname,'..','rpg_character_packs.generated.js'),'utf8'));
});

test('adding a second properly-authored JSON pack automatically registers it without editing RPG code',()=>{
 const invented=clone();invented.def.id='newheroine';invented.def.name='Mara Reed';
 invented.dir=path.join(__dirname,'..','characters','newheroine');
 invented.art.characterId='newheroine';invented.stories.characterId='newheroine';
 invented.mandatory.characterId='newheroine';
 for(const e of invented.mandatory.events){
  e.id=e.id.replace(/^sol_/,'newheroine_');
  e.characterId='newheroine';
  for(const condition of e.trigger?.all||[]){
   if(condition.storyDone)condition.storyDone=condition.storyDone.replace(/^sol_/,'newheroine_');
   if(condition.relationship)condition.relationship.npc='newheroine';
  }
 }

 for(const e of invented.stories.events){
  e.id=e.id.replace(/^sol_/,'newheroine_');e.npc='newheroine';
  if(e.prerequisite)e.prerequisite=e.prerequisite.replace(/^sol_/,'newheroine_');
  if(e.openingByFlag)e.openingByFlag=Object.fromEntries(Object.entries(e.openingByFlag).map(([k,v])=>[k.replace(/^sol_/,'newheroine_'),v]));
  for(const c of e.choices)c.flag=c.flag.replace(/^sol_/,'newheroine_');
 }
 for(const img of invented.art.eventImages||[])img.sceneId=img.sceneId.replace(/^sol_/,'newheroine_');
 assert.equal(tools.validate(invented),true);
 const src=tools.bundle([sol,invented]);
 const context={module:{exports:{}},window:{}};vm.runInNewContext(src,context,{timeout:2000});
 assert.equal(context.module.exports.byId('newheroine').cast.name,'Mara Reed');
 assert.equal(context.module.exports.events.filter(e=>e.npc==='newheroine').length,7);
 assert.equal(context.window.NeoRpgCharacterPacks.byId('newheroine').arrivalDay,8);
});

test('importer blocks overwriting an installed character and validator rejects malformed packs',()=>{
 assert.throws(()=>tools.importFolder(solDir),/already installed/i);
 const badAge=clone();badAge.def.age=16;assert.throws(()=>tools.validate(badAge),/adult/i);
 const badDeck=clone();badDeck.def.deck='made_up_deck';assert.throws(()=>tools.validate(badDeck),/deck/i);
 const badSchedule=clone();badSchedule.def.schedule=[['shop']];assert.throws(()=>tools.validate(badSchedule),/schedule/i);
 const badChoice=clone();badChoice.stories.events[0].choices[1].flag=badChoice.stories.events[0].choices[0].flag;
 assert.throws(()=>tools.validate(badChoice),/duplicate flag/i);
 const badArt=clone();badArt.art.portrait='/rpg-assets/../../secrets.png';
 assert.throws(()=>tools.validate(badArt),/image/i);
 const badDependency=clone();badDependency.stories.events[1].prerequisite='never_happened';
 assert.throws(()=>tools.validate(badDependency),/prerequisite/i);
});

test('browser and server register the pack bundle before any story module',()=>{
 const html=fs.readFileSync(path.join(__dirname,'..','rpg.html'),'utf8');
 const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
 const narrative=fs.readFileSync(path.join(__dirname,'..','rpg_narrative_pack.js'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'..','rpg.js'),'utf8');
 assert.ok(html.indexOf('/rpg_character_packs.generated.js')<html.indexOf('/rpg_sol_character.js'));
 assert.ok(html.indexOf('/rpg_sol_character.js')<html.indexOf('/rpg_narrative_pack.js'));
 assert.match(server,/pathname==='\/rpg_character_packs\.generated\.js'/);
 assert.match(server,/pathname==='\/rpg_mandatory_events\.js'/);
 assert.match(server,/pathname==='\/rpg_season_events\.js'/);
 assert.match(narrative,/for\(const entry of REGISTRY\.packs\)/);
 assert.match(app,/cast\[id\]\.portrait/);
});


test('optional mandatory JSON is bundled and invalid predicates/dependencies are rejected',()=>{
 const p=clone();
 p.mandatory={schemaVersion:1,characterId:'sol',events:[{
  id:'sol_extra_scene',kind:'bond',priority:60,earliestDay:44,
  trigger:{all:[{storyDone:'sol_route_2'},{relationship:{npc:'sol',metric:'trust',gte:2}}]},
  delivery:'remote_or_present',timeCost:0,lines:[{speaker:'sol',text:'A quiet evening.'}],
  choices:[{label:'Sure',reply:'Thanks.',flag:'quiet_yes'},{label:'Not now',reply:'No rush.',flag:'quiet_no'}]
 }]};
 assert.equal(tools.validate(p),true);
 const built=tools.bundle([p]);
 const ctx={module:{exports:{}},window:{}};vm.runInNewContext(built,ctx);
 assert.equal(ctx.module.exports.mandatoryEvents[0].characterId,'sol');
 p.mandatory.events[0].trigger={eval:'globalThis'};assert.throws(()=>tools.validate(p),/unsupported predicate/);
 p.mandatory.events[0].trigger={eventSeen:'sol_extra_scene'};assert.throws(()=>tools.validate(p),/Circular/);
});
