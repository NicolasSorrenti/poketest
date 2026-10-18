'use strict';
const assert=require('node:assert/strict');
const FORMAT=require('./classic_format');
const {CATALOG}=require('./headless_duel');
const ATTACK=require('./attack_effects_core');
const {ClassicLocalService}=require('./classic_local_service');
const ids=require('./neo_v084_pool').ids;
assert.equal(ids.length,19);
assert.equal(new Set(ids).size,ids.length,'duplicate printings');
const cards=new Map(new ClassicLocalService().cardPool().map(c=>[c.id,c]));
for(const id of ids){
 const source=CATALOG.get(id);
 assert.ok(source,'missing cached historical card '+id);
 assert.equal(source.supertype,'Pokémon',id);
 assert.equal((source.abilities||[]).filter(a=>a.name).length,0,id+' has unreviewed Power');
 assert.ok((source.attacks||[]).length,id+' lacks printed attacks');
 for(const a of source.attacks||[])assert.ok(ATTACK.compile(a),id+' unported '+a.name);
 assert.equal(FORMAT.isAllowed(id,{neo:true}),true,id+' not deck-legal');
 assert.ok(FORMAT.NEO_IDS.includes(id),id+' absent from Neo catalog');
 assert.equal(cards.get(id)?.supported,true,id+' not playable in curated card pool');
}
for(const id of ['neo3-65','neo4-51','neo3-5','neo4-47'])
 assert.equal(ids.includes(id),false,'partially ported Neo Pokémon must remain excluded '+id);
console.log('PASS Neo v0.84 deck unlock: 19 reviewed playable printings, strict attack and Power checks');
