'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const PACKS=require('../rpg_character_packs.generated'),CROSS=require('../rpg_cross_character_events');
global.NeoRpgCharacterPacks=PACKS;global.NeoRpgCrossCharacterEvents=CROSS;
require('../rpg_daisy_event_additions');
const SLICE=require('../rpg_slice_of_life'),CG=require('../rpg_cg_gallery'),CGSCENE=require('../rpg_cg_scene');
const assets=['rpg-assets/events/cg/season01/daisy_route_1.png','rpg-assets/events/cg/season01/daisy_route_2.png','rpg-assets/events/cg/season01/daisy_route_3.png','rpg-assets/events/cg/season01/daisy_route_4.png','rpg-assets/events/cg/slice-life/daisy_random_window_reflection.png','rpg-assets/events/cg/slice-life/daisy_random_rain_shelter.png','rpg-assets/events/cg/slice-life/daisy_random_deck_luck.png','rpg-assets/events/cg/season01/daisy_barb_swimsuit_sketch.webp','rpg-assets/events/cg/season01/daisy_barb_fitting_followup.webp','rpg-assets/events/cg/season01/daisy_barb_fitting_followup_stage2.webp','rpg-assets/events/cg/season01/daisy_laca_boardwalk.webp'];
test('all eleven approved Daisy assets resolve to unique gallery records',()=>{
 const ids=new Set(CG.catalog.map(x=>x.id));assert.deepEqual(CG.validate(),[]);
 for(const asset of assets){assert.ok(fs.existsSync(path.join(__dirname,'..',asset)),asset);const id=path.basename(asset).replace(/\.(png|webp)$/,'');assert.ok(ids.has(id),'gallery record '+id);}
});
test('Daisy scene registry uses the approved locations and leaves missing art pending',()=>{
 const p=PACKS.byId('daisy'),random=p.events.filter(e=>['daisy_random_window_reflection','daisy_random_rain_shelter','daisy_random_deck_luck'].includes(e.id));assert.equal(random.length,3);assert.ok(random.every(e=>e.image&&e.art));
 const deck=random.find(e=>e.id==='daisy_random_deck_luck');assert.match(deck.lines[0].text,/shop floor/i);
 const beach=CROSS.events.find(e=>e.id==='daisy_laca_boardwalk');assert.match(beach.art.environment,/boardwalk/i);assert.equal(beach.artPending,false);
 assert.equal(CG.catalog.find(e=>e.id==='daisy_random_arcade_disguise')?.artPending,true);assert.equal(CG.catalog.find(e=>e.id==='daisy_rina_cafe')?.artPending,true);
 assert.equal(CROSS.pendingArt.find(e=>e.id==='daisy_rina_cafe').status,'PENDING_CG');
});
test('The Final Fitting presents stage one, advances to stage two, then unlocks both memories',()=>{
 const e=CROSS.events.find(x=>x.id==='daisy_barb_fitting_followup');assert.deepEqual(e.cgSequence,['daisy_barb_fitting_followup','daisy_barb_fitting_followup_stage2']);
 const state={activeSliceOfLife:{id:e.id,step:0}};assert.equal(CGSCENE.select(state,CG.catalog,SLICE,{})?.entry?.id,e.cgSequence[0]);state.activeSliceOfLife.step=4;assert.equal(CGSCENE.select(state,CG.catalog,SLICE,{})?.entry?.id,e.cgSequence[1]);
 const save={day:40,slot:1,sliceOfLifeDone:{[e.id]:{day:40,slot:1,choice:0}},relationships:{daisy:{affection:3}},cgUnlocked:{}};
 const unlocked=CG.record(save,'slice','daisy',{eventId:e.id});assert.deepEqual(unlocked.map(x=>x.id),e.cgSequence);
 const restored=JSON.parse(JSON.stringify(save));assert.ok(CG.unlocked(restored,e.cgSequence[0]));assert.ok(CG.unlocked(restored,e.cgSequence[1]));
});
