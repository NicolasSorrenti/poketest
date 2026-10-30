'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {audit,parse}=require('../scripts/apex-turn-audit');
const {CATALOG}=require('../headless_duel');
const attach=(side,turn,damage,slot=-1,centerInHandBefore=null)=>({side,turnSerial:turn,cardId:'base1-102',
 targetDamageBefore:damage,centerInHandBefore,command:{type:'attach_energy',payload:{slot}}});
const center=(side,turn,damagedSlots=[-1])=>({side,turnSerial:turn,cardId:'base1-85',
 centerDamagedSlotsBefore:damagedSlots,
 command:{type:'play_trainer',payload:{handIndex:0}}});
test('flags an attachment to damaged Pokémon before Pokémon Center in same turn',()=>{
 const result=audit([attach(1,8,40),center(1,8)]);
 assert.equal(result.length,1);
 assert.equal(result[0].type,'energy-before-pokemon-center');
});
test('does not flag Energy after Center or on an undamaged Pokémon',()=>{
 assert.deepEqual(audit([center(1,8),attach(1,8,40)]),[]);
 assert.deepEqual(audit([attach(1,8,0),center(1,8)]),[]);
});
test('counts a discarded attachment only once across repeated Centers',()=>{
 const result=audit([attach(1,8,40),center(1,8),center(1,8)]);
 assert.equal(result.length,1,'the first Center already discarded this Energy');
 assert.equal(result[0].index,1);
});
test('still detects a new attachment between two Centers',()=>{
 const result=audit([attach(1,8,40),center(1,8),attach(1,8,20),center(1,8)]);
 assert.equal(result.length,2);
 assert.deepEqual(result.map(v=>v.index),[1,3]);
});
test('does not accuse an attachment when its target was healed before Center',()=>{
 assert.deepEqual(audit([attach(1,8,40),center(1,8,[])]),[]);
});
test('does not confuse damage on another Pokémon with the attachment target',()=>{
 assert.deepEqual(audit([attach(1,8,40,0),center(1,8,[-1])]),[]);
 assert.equal(audit([attach(1,8,40,0),center(1,8,[0])]).length,1);
});
test('discards stale evidence after a trainer or board-position action',()=>{
 const trainer={side:1,turnSerial:8,cardId:'base1-94',
  command:{type:'play_trainer',payload:{handIndex:0}}};
 const retreat={side:1,turnSerial:8,command:{type:'retreat',payload:{slot:0}}};
 assert.deepEqual(audit([attach(1,8,40),trainer,center(1,8)]),[]);
 assert.deepEqual(audit([attach(1,8,40),retreat,center(1,8)]),[]);
});
test('preserves wasted-Energy evidence through draw-only Trainers',()=>{
 for(const cardId of ['base1-91','base1-88']){
  const draw={side:1,turnSerial:8,cardId,
   command:{type:'play_trainer',payload:{handIndex:0}}};
  const result=audit([attach(1,8,40,-1,true),draw,center(1,8)]);
  assert.equal(result.length,1,cardId+' cannot heal or reposition the attachment target');
  assert.equal(result[0].attachmentIndex,0);
  assert.deepEqual(audit([attach(1,8,40),draw,center(1,8,[])]),[],
   'a healed target must not produce a false positive');
 }
});
test('preserves attachment evidence through additional draw-only Trainers',()=>{
 // Verified against classic_trainer_core: Blaine's Last Resort draws five;
 // Mail from Bill draws up to four in hand. Neither changes Pokémon state.
 for(const cardId of ['gym1-105','neo4-105']){
  const draw={side:1,turnSerial:8,cardId,
   command:{type:'play_trainer',payload:{handIndex:0}}};
  assert.equal(audit([attach(1,8,40,-1,true),draw,center(1,8)]).length,1,
   cardId+' must not erase a valid Center sequencing warning');
  assert.deepEqual(audit([attach(1,8,40),draw,center(1,8,[])]),[],
   'pre-Center damage evidence is still required');
 }
});
test('draw Trainers do not invent a Center-before-Energy option that did not exist',()=>{
 // The CPU cannot play a Center before attachment if Bill/Oak/Mail/Blaine
 // only draws that Center afterward. Missing hand evidence is conservative.
 for(const cardId of ['base1-91','base1-88','gym1-105','neo4-105']){
  const draw={side:1,turnSerial:8,cardId,
   command:{type:'play_trainer',payload:{handIndex:0}}};
  assert.deepEqual(audit([attach(1,8,40,-1,false),draw,center(1,8)]),[],
   cardId+' can introduce a previously unavailable Center');
  assert.deepEqual(audit([attach(1,8,40),draw,center(1,8)]),[],
   cardId+' must not accuse without a pre-draw hand snapshot');
  assert.equal(audit([draw,attach(1,8,40,-1,true),center(1,8)]).length,1,
   'a Center drawn before attachment restores the sequencing warning');
 }
});
test('board-neutral search and deck Trainers preserve pre-Center Energy evidence',()=>{
 // Each effect below only moves cards among hand, deck and discard; none
 // changes the attachment target, damage or attached Energy on the board.
 // IDs are actual supported Base/Fossil/Rocket Trainer cards.
 for(const [cardId,name] of [
  ['base3-59','Energy Search'],
  ['base1-77','Pokémon Trader'],
  ['base5-77','Nightly Garbage Run'],
  ['base1-87','Pokédex']
 ]){
  const trainer={side:1,turnSerial:8,cardId,
   command:{type:'play_trainer',payload:{handIndex:0}}};
  assert.equal(audit([attach(1,8,40),trainer,center(1,8)]).length,1,
   name+' must not conceal an Energy-before-Center sequencing error');
  assert.deepEqual(audit([attach(1,8,40),trainer,center(1,8,[])]),[],
   name+' must not cause a warning when Center heals no attachment target');
 }
});
test('Erika draw choices preserve only genuine pre-Center Energy mistakes',()=>{
 // The production Erika resolver draws 0–3 cards for each player. Its
 // play_trainer and subsequent choose commands never alter Pokémon state.
 const erikaId=[...CATALOG].find(([,c])=>c.name==='Erika'&&c.supertype==='Trainer')?.[0];
 assert.ok(erikaId,'Erika must resolve to a real Trainer card');
 const erika={side:1,turnSerial:8,cardId:erikaId,
  command:{type:'play_trainer',payload:{handIndex:0}}};
 const choose={side:1,turnSerial:8,
  command:{type:'choose',payload:{decisionId:'erika-draw',selected:['count:1']}}};
 const steps=[erika,choose,choose];
 assert.equal(audit([attach(1,8,40,-1,true),...steps,center(1,8)]).length,1,
  'Erika and her draw prompts must not hide an existing Center opportunity');
 assert.deepEqual(audit([attach(1,8,40,-1,false),...steps,center(1,8)]),[],
  'Center drawn after attachment was not playable beforehand');
 assert.deepEqual(audit([attach(1,8,40,-1,true),...steps,center(1,8,[])]),[],
  'Center must still heal the attachment target to count');
 // An unrelated choice is not assumed to be board-neutral.
 assert.deepEqual(audit([attach(1,8,40,-1,true),choose,center(1,8)]),[]);
});
test("Misty's Wrath keeps only genuine pre-Center attachment warnings",()=>{
 // The reducer keeps two of the top seven deck cards and discards the rest.
 // Its follow-up choice changes hand/deck/discard, never the Pokémon board.
 const wrath={side:1,turnSerial:8,cardId:'gym1-114',
  command:{type:'play_trainer',payload:{handIndex:0}}};
 assert.equal(CATALOG.get(wrath.cardId)?.name,"Misty's Wrath");
 const choose={side:1,turnSerial:8,
  command:{type:'choose',payload:{decisionId:'misty-keep',selected:['deck:1','deck:2']}}};
 const steps=[wrath,choose];
 assert.equal(audit([attach(1,8,40,-1,true),...steps,center(1,8)]).length,1,
  'Misty\'s Wrath must not hide a wasted attachment when Center was already held');
 assert.deepEqual(audit([attach(1,8,40,-1,false),...steps,center(1,8)]),[],
  'a Center first found in the top seven was not playable before attachment');
 assert.deepEqual(audit([attach(1,8,40),...steps,center(1,8)]),[],
  'missing hand snapshots must remain conservative');
 assert.equal(audit([...steps,attach(1,8,40,-1,true),center(1,8)]).length,1,
  'Center found before attachment is a genuine sequencing opportunity');
 assert.deepEqual(audit([attach(1,8,40,-1,true),...steps,center(1,8,[])]),[],
  'Center must actually heal the attached Pokémon');
});
test('Energy Retrieval choices do not hide a wasted attachment before Center',()=>{
 // Both Retrieval cards only exchange cards among hand and discard in the
 // authoritative classic_trainer_core resolver. They cannot heal, move or
 // remove Energy from an in-play Pokemon.
 for(const name of ['Energy Retrieval','Super Energy Retrieval']){
  const cardId=[...CATALOG].find(([,c])=>c.name===name&&c.supertype==='Trainer')?.[0];
  assert.ok(cardId,name+' must exist in the supported catalog');
  const retrieval={side:1,turnSerial:8,cardId,
   command:{type:'play_trainer',payload:{handIndex:0}}};
  const choose={side:1,turnSerial:8,
   command:{type:'choose',payload:{selected:['discard:0']}}};
  const actions=[retrieval,choose,choose];
  const wasted=audit([attach(1,8,40,-1,true),...actions,center(1,8)]);
  assert.equal(wasted.length,1,name+' must preserve the prior attachment');
  assert.equal(wasted[0].attachmentIndex,0);
  assert.deepEqual(audit([attach(1,8,40,-1,true),...actions,center(1,8,[])]),[],
   name+' must not report a target that Center did not heal');
  assert.deepEqual(audit([attach(1,8,40,-1,true),...actions,
   {side:1,turnSerial:8,command:{type:'retreat',payload:{slot:0}}},center(1,8)]),[],
   'a later board change invalidates the saved target snapshot');
 }
});
test('board-changing Trainer choices still clear stale attachment evidence',()=>{
 const sabrinaId=[...CATALOG].find(([,c])=>c.name==='Sabrina'&&c.supertype==='Trainer')?.[0];
 assert.ok(sabrinaId,'Sabrina must resolve to a real Trainer card');
 const sabrina={side:1,turnSerial:8,cardId:sabrinaId,
  command:{type:'play_trainer',payload:{handIndex:0}}};
 const choose={side:1,turnSerial:8,command:{type:'choose',payload:{selected:['slot:0']}}};
 assert.deepEqual(audit([attach(1,8,40,-1,true),sabrina,choose,center(1,8)]),[],
  'Sabrina can move attached Energy, so earlier slot evidence is stale');
});
test('healing Trainers still invalidate stale attachment evidence',()=>{
 const heal={side:1,turnSerial:8,cardId:'gym2-103',
  command:{type:'play_trainer',payload:{handIndex:0}}};
 assert.deepEqual(audit([attach(1,8,40),heal,center(1,8)]),[],
  "Erika's Kindness can heal the target before Center");
});
test('retains a valid attachment through a harmless bench placement',()=>{
 const bench={side:1,turnSerial:8,command:{type:'bench',payload:{handIndex:0}}};
 assert.equal(audit([attach(1,8,40),bench,center(1,8)]).length,1);
});
test('requires a pre-Center damage snapshot before reporting wasted Energy',()=>{
 const legacy=center(1,8);
 delete legacy.centerDamagedSlotsBefore;
 assert.deepEqual(audit([attach(1,8,40),legacy]),[]);
});
test('keeps both players and different turns separate',()=>{
 assert.deepEqual(audit([attach(0,8,40),center(1,8),center(0,9)]),[]);
});
test('validates audit settings',()=>{
 assert.equal(parse(['--deck','rain_dance','--pairs','1']).pairs,1);
 assert.throws(()=>parse(['--deck','invalid']),/Invalid audit settings/);
});

test('Energy audit runs for authoritative duel and Trainer-rule changes on PRs and main',()=>{
 const fs=require('node:fs');
 const path=require('node:path');
 const workflow=fs.readFileSync(path.join(__dirname,'..','.github','workflows','apex-energy-audit.yml'),'utf8');
 const sections=workflow.split(/^  (pull_request|push):\s*$/m);
 assert.equal(sections.length,5,'workflow must have pull_request and push triggers');
 for(const section of [sections[2],sections[4]]){
  const paths=section.split(/^    paths:\s*$/m)[1]?.split(/^jobs:\s*$/m)[0]||'';
  for(const source of ['cpu_profiles.js','rpg_cpu_config.js','rpg_character_packs.generated.js',
   'rpg_side_quests.js','rpg_npc_deck_progression.js','tests/rpg_cpu_profiles.test.js',
   'headless_duel.js','classic_trainer_core.js',
   'classic_power_core.js','core_rules.js','attack_effects_core.js',
   'decision_core.js','duel_protocol.js','special_conditions_core.js',
   'neo_berry_rules.js','classic_format.js','cards/**']){
   assert.ok(paths.includes("- '"+source+"'"),source+' must trigger the Energy audit');
  }
 }
 assert.match(workflow,/node --test [^\n]*tests\/rpg_cpu_profiles\.test\.js/,
  'Energy audit must execute the NPC roster/personality regression');
 for(const deck of ['rain_dance','venusaur']){
  assert.ok(workflow.includes('node scripts/apex-turn-audit.js --deck '+deck+' --pairs 1 --max-turns 70'),
   deck+' must receive real reducer turn auditing');
 }
});
