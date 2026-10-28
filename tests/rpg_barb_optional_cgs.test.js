'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registry=require('../rpg_character_packs.generated');

test('Barb optional CG encounters remain registered with their own artwork',()=>{
 const barb=registry.byId('barb');
 assert.ok(barb,'Barb character pack must be installed');
 const events=barb.events;
 const art=barb.art.eventImages||[];
 const scenes=new Set(events.map(e=>e.id));
 const imageIds=new Set(art.map(image=>image.sceneId));
 assert.equal(scenes.size,events.length,'Story scene IDs must be unique');
 assert.equal(imageIds.size,art.length,'Each scene has at most one manifest CG');
 for(const image of art){
  assert.ok(scenes.has(image.sceneId),image.sceneId+' must refer to an authored story');
  assert.match(image.path,/^\/rpg-assets\/characters\/barb\/events\/[a-z0-9_-]+\.(?:png|webp)$/i,
   image.sceneId+' must reference Barb\'s own local CG');
 }
 const optional=events.filter(e=>e.encounterType==='slice');
 assert.ok(optional.length>=6,'Keep the optional CG encounters in the generated pack');
 for(const event of optional){
  assert.equal(event.npc,'barb');
  assert.equal(event.trigger,'entry',event.id+' must trigger on location entry');
  assert.ok(event.start<=event.end,event.id+' must have a reachable day window');
  assert.ok(imageIds.has(event.id),event.id+' must be linked to a CG manifest entry');
 }
});
