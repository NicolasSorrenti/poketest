'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const story=require('../rpg_story');

test('every RPG character has five main relationship events',()=>{
 const expected={
  hana:/^hana_route_/,
  reina:/^reina_route_/,
  shiori:/^shiori_route_/,
  yuna:/^yuna_route_/,
  akari:/^akari_route_/,
  camila:/^camila_route_/,
  marina:/^marina_route_/,
  kaede:/^kaede_route_/,
  jun:/^jun_guest_/,
  teo:/^teo_guest_/,
  iris:/^iris_guest_/,
  elio:/^elio_bond_/,
  alma:/^alma_bond_/,
  nereo:/^nereo_bond_/,
  barb:/^barb_route_/,
  daisy:/^daisy_route_/,
  elena:/^elena_route_/,
  jinx:/^jinx_route_/,
  laca:/^laca_route_/,
  luna:/^luna_route_/,
  rina:/^rina_route_/,
  sierra:/^sierra_route_/,
  sol:/^sol_route_/
 };
 for(const [npc,idPattern] of Object.entries(expected)){
  const events=story.events.filter(e=>e.npc===npc&&idPattern.test(e.id));
  assert.equal(events.length,5,npc+' should have five main events, found '+events.length);
 }
});

test('new bridge scenes have valid prerequisites and windows',()=>{
 const bridgeIds=[
  'hana_route_bridge_4','reina_route_bridge_4','shiori_route_bridge_4',
  'yuna_route_bridge_4','akari_route_bridge_4','camila_route_bridge_4',
  'marina_route_bridge_4','kaede_route_early_1','daisy_route_bridge_4',
  'jun_guest_5','teo_guest_5','iris_guest_5',
  'elio_bond_5','alma_bond_5','nereo_bond_5'
 ];
 const ids=new Set(story.events.map(e=>e.id));
 for(const id of bridgeIds){
  const event=story.byId(id);
  assert.ok(event,'missing '+id);
  assert.ok(event.prerequisite===null||ids.has(event.prerequisite),id+' has an invalid prerequisite');
  assert.ok(event.start>=1&&event.end<=90&&event.start<=event.end,id+' has an invalid campaign window');
  assert.ok(event.lines.length>=4,id+' needs authored dialogue');
  assert.ok(event.choices.length>=2,id+' needs player choices');
 }
});
