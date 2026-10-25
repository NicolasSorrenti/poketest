'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const STORY=require('../rpg_story');
const BOND=require('../rpg_bond_chapters');
const NARRATIVE=require('../rpg_narrative_pack');
const REGISTRY=require('../rpg_character_packs.generated');

const expectedCrossFlags={
 hana_cross_1:['hana_shared_table','hana_boundary'],
 yuna_cross_1:['yuna_private_test','yuna_boundary'],
 camila_cross_1:['camila_lend','camila_transparent'],
 marina_cross_1:['marina_access','marina_voice'],
 reina_cross_1:['reina_rebuild','reina_own_error'],
 akari_cross_1:['akari_interviews','akari_limits'],
 kaede_cross_1:['kaede_own_story','kaede_public_correction'],
 shiori_cross_1:['shiori_no_stakes','shiori_teaches'],
 jinx_marina_cross_1:['jinx_marina_safety','jinx_marina_tease','jinx_marina_help'],
 jinx_alma_cross_1:['jinx_alma_defend','jinx_alma_pick','jinx_alma_bribe'],
 sol_alma_cross_1:['sol_practical','sol_respect'],
 sol_marina_cross_1:['sol_safe_game','sol_marina_trust'],
 laca_marina_cross_1:['laca_marina_team','laca_marina_squirtle'],
 laca_sol_cross_1:['laca_sol_props','laca_sol_safety']
};
const originals=new Set(['hana','reina','shiori','yuna','akari','camila','marina','kaede']);
const cast=new Set([...originals,...Object.keys(NARRATIVE.cast),...Object.keys(REGISTRY.cast),'elio','alma','nereo']);
test('fourteen playable crossovers keep their dialogue speakers, flags, and scene choices intact',()=>{
 assert.deepEqual(STORY.validate(),[]);
 const crossovers=STORY.events.filter(e=>e.id.includes('_cross_'));
 assert.deepEqual(crossovers.map(e=>e.id).sort(),Object.keys(expectedCrossFlags).sort());
 for(const e of crossovers){
  const flags=expectedCrossFlags[e.id];
  assert.deepEqual(e.choices.map(c=>c.flag),flags,'historic branching metadata changed for '+e.id);
  assert.ok(e.lines.length>=6,'crossover lacks back-and-forth '+e.id);
  if(!e.id.startsWith('laca_'))assert.ok(e.lines.some(x=>x.speaker==='Narrator'),'missing physical context '+e.id);
  else assert.ok(e.participants?.length,'new crossover needs the other scene character '+e.id);
  assert.ok(e.lines.some(x=>x.speaker==='Protagonist'),'player never speaks '+e.id);
  assert.ok(e.lines.some(x=>x.speaker===e.npc),'main NPC never speaks '+e.id);
  assert.ok(e.lines.every(x=>x.text&&x.text.trim().length>0),'empty dialogue '+e.id);
  assert.ok(e.lines.every(x=>x.speaker==='Narrator'||x.speaker==='Protagonist'||cast.has(x.speaker)),'a line has the wrong speaker '+e.id);
  for(const choice of e.choices)assert.ok(choice.label&&choice.reply&&choice.kind&&choice.flag,'missing response '+e.id);
  const prereq=STORY.byId(e.prerequisite);
  assert.ok(prereq,'missing previous route scene '+e.id);
  if(e.openingByFlag){
   for(const [flag,opening] of Object.entries(e.openingByFlag)){
    assert.ok(prereq.choices.some(c=>c.flag===flag),'orphaned opening flag '+e.id+'/'+flag);
    const state={storyFlags:{[e.prerequisite]:flag}};
    const lines=STORY.linesFor(state,e.id);
    assert.equal(lines[0].speaker,e.lines[0].speaker,'opening changes actor '+e.id);
    assert.equal(lines[0].text,opening,'opening ignored prior decision '+e.id);
    assert.equal(lines.length,e.lines.length,'opening shifts active-save line indexes '+e.id);
   }
  }
 }
 const shiori=STORY.byId('shiori_cross_1');
 assert.equal(shiori.place,'center');
 assert.match(shiori.lines[0].text,/community center/i,'Shiori must actually appear at the scheduled location');
});
test('all fifteen supporting bond scenes retain existing save positions and react to prior choices',()=>{
 assert.deepEqual(BOND.validate(),[]);
 assert.equal(BOND.events.length,15);
 for(const e of BOND.events){
  assert.equal(e.lines.length,5,'saved active dialogue index changed for '+e.id);
  assert.equal(e.choices.length,2,'branch changed '+e.id);
  assert.ok(e.lines.some(x=>x.speaker==='Protagonist'),'player cannot react in '+e.id);
  assert.ok(e.lines.some(x=>x.speaker==='Narrator'),'missing staging '+e.id);
  assert.ok(e.lines.at(-1).speaker===e.npc,'last request no longer belongs to the scene NPC '+e.id);
  assert.ok(e.choices.every(x=>x.label&&x.reply&&x.kind&&x.flag),'incomplete authored choice '+e.id);
  if(!e.openingByFlag)continue;
  const previous=STORY.byId(e.prerequisite);
  assert.ok(previous,'orphaned chapter '+e.id);
  for(const [flag,opening] of Object.entries(e.openingByFlag)){
   assert.ok(previous.choices.some(c=>c.flag===flag),'broken remembered-choice flag '+e.id);
   assert.equal(STORY.linesFor({storyFlags:{[e.prerequisite]:flag}},e.id)[0].text,opening);
  }
 }
});
test('generated story bundles mirror all character-pack crossover source data',()=>{
 const fs=require('node:fs');
 for(const id of ['jinx','sol']){
  const src=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'..','characters',id,'stories.json'),'utf8'));
  const pack=REGISTRY.byId(id);
  const sourceCross=src.events.filter(e=>e.id.includes('_cross_'));
  const bundledCross=pack.events.filter(e=>e.id.includes('_cross_'));
  assert.deepEqual(bundledCross,sourceCross,id+' was edited without regeneration');
 }
});
