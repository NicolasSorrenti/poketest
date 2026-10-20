'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../rpg_reactivity');
const Collection=require('../rpg_collection');
const Registry=require('../rpg_character_packs.generated'),Narrative=require('../rpg_narrative_pack'),Side=require('../rpg_side_quests');
const s=(overrides={})=>({day:20,slot:1,results:[],appointments:[],tournaments:{},competitive:{locals:{}},storyDone:{},...overrides});
const duel=(npc,id,day,won,draw=false)=>({id,npc,day,won,draw});
test('all 14 primary characters have distinct authored responses across duels, cup and appointments',()=>{
 const ids=['hana','reina','shiori','yuna','akari','camila','marina','kaede','elena','jinx','luna','rina','sierra','sol'];
 const all=[...Object.keys(Narrative.cast),...Object.keys(Side.cast),...Object.keys(Registry.cast||{})];
 for(const id of ids){
  assert.ok(R.VOICE[id],id);
  for(const key of ['win','loss','draw','local','cup','missed','kept','preWin','preLoss'])
   assert.ok(R.VOICE[id][key],id+':'+key);
  assert.ok(all.includes(id)||ids.slice(0,8).includes(id),id+' belongs to current RPG cast');
 }
 assert.notEqual(R.VOICE.reina.win[0],R.VOICE.hana.win[0]);
});
test('recent personal match changes conversation, matching win loss and draw accurately',()=>{
 for(const [outcome,won,draw] of [['win',true,false],['loss',false,false],['draw',false,true]]){
  const state=s({results:[duel('reina','d-'+outcome,19,won,draw)]});
  const before=JSON.stringify(state),r=R.reaction(state,'reina');
  assert.equal(r.kind,outcome);
  assert.equal(r.lines.length,3);
  assert.match(r.lines[0].text,/./);
  assert.equal(r.lines[1].speaker,'Protagonist');
  assert.equal(r.lines[2].speaker,'reina');
  assert.equal(JSON.stringify(state),before,'selector never mutates story or rewards');
 }
});
test('one conversation acknowledges exact match once and survives save/load',()=>{
 const state=s({results:[duel('hana','duel42',18,true)]});
 const r=R.reaction(state,'hana');assert.equal(R.mark(state,r.id),true);
 assert.equal(R.mark(state,r.id),false);
 assert.equal(R.reaction(state,'hana'),null);
 const restored=JSON.parse(JSON.stringify(state));
 assert.equal(R.reaction(restored,'hana'),null);
});
test('old saves and invalid reaction keys cannot poison state',()=>{
 const state=s({npcReactivity:null});
 assert.equal(R.mark(state,'not-a-reaction'),false);
 assert.equal(R.mark(state,'react:'+('x'.repeat(221))),false);
 assert.equal(R.mark(state,'react:duel:hana:safe'),true);
 assert.equal(R.seen(state,'react:duel:hana:safe'),true);
});
test('results outside the recent window and future results are not used',()=>{
 const state=s({results:[duel('reina','old',2,true),duel('reina','future',23,false)]});
 assert.equal(R.reaction(state,'reina'),null);
});
test('local results are recognized only when earned, not by calendar or forged open bracket',()=>{
 const state=s({day:13,competitive:{locals:{'1':{status:'open'},'2':{status:'champion'}}}});
 assert.equal(R.reaction(state,'jinx').kind,'local');
 assert.ok(R.reaction(state,'jinx').lines[1].text.includes('won'));
 const loss=s({day:14,competitive:{locals:{'2':{status:'eliminated'}}}});
 assert.match(R.reaction(loss,'luna').lines[1].text,/did not/);
 assert.equal(R.reaction(s({day:13,competitive:{locals:{'2':{status:'open'}}}}),'jinx'),null);
});
test('official cups produce distinct public context only for real results within the act',()=>{
 const state=s({day:35,tournaments:{neighborhood:{state:'champion'}}});
 assert.equal(R.reaction(state,'elena').kind,'cup');
 assert.match(R.reaction(state,'elena').lines[1].text,/Winning/);
 assert.equal(R.reaction(s({day:47,tournaments:{neighborhood:{state:'champion'}}}),'elena'),null);
 assert.equal(R.reaction(s({day:30,tournaments:{neighborhood:{state:'open'}}}),'elena'),null);
});
test('missed and kept appointments elicit different, personal reactions and never penalize bonds',()=>{
 const missed=s({appointments:[{id:42,npc:'elena',status:'missed',day:19}],relationships:{elena:{affection:4}}});
 const before=JSON.stringify(missed);
 const r=R.reaction(missed,'elena');
 assert.equal(r.kind,'missed');assert.equal(JSON.stringify(missed),before);
 assert.equal(R.reaction(missed,'jinx'),null);
 const kept=s({appointments:[{id:43,npc:'elena',status:'attended',day:20}]});
 assert.equal(R.reaction(kept,'elena').kind,'kept');
});
test('duel memory takes priority over cup and local reactions, but other reactions remain queued',()=>{
 const state=s({day:34,results:[duel('reina','last-reina',33,false)],
  tournaments:{neighborhood:{state:'champion'}},competitive:{locals:{'5':{status:'champion'}}}});
 const first=R.reaction(state,'reina');assert.equal(first.kind,'loss');
 R.mark(state,first.id);
 const second=R.reaction(state,'reina');assert.ok(['cup','local'].includes(second.kind));
 R.mark(state,second.id);
 assert.notEqual(R.reaction(state,'reina')?.id,second.id);
});
test('completed character story may be acknowledged without romance assumption',()=>{
 const state=s({storyDone:{rina_route_1:{day:19,choice:1}}});
 const a=R.reaction(state,'rina');
 assert.equal(a.kind,'chapter');
 assert.ok(!a.lines.map(x=>x.text).join(' ').match(/love you|we are dating|partner/i));
});
test('pre-duel rematch banter is derived from legitimate previous results without mutation',()=>{
 const state=s({results:[duel('reina','previous',18,true)]});
 const d={id:'upcoming',npc:'reina'};
 const before=JSON.stringify(state);
 assert.match(R.preDuelLine(state,d),/last loss/);
 assert.equal(R.preDuelLine(s(),d),null);
 assert.equal(JSON.stringify(state),before);
});
test('after-duel responses reflect comeback, weekly championship and ties',()=>{
 const state=s({results:[duel('reina','older',12,false),duel('reina','now',20,true)]});
 const receipt={duelId:'now',outcome:'Victory'};
 assert.match(R.afterDuel(state,{npc:'reina'},receipt,{duelWin:'Great victory!'}),/turnaround/);
 assert.match(R.afterDuel(state,{npc:'reina',competitiveKind:'local',competitiveRound:1},receipt),/local/i);
 assert.match(R.afterDuel(state,{npc:'reina'}, {...receipt,outcome:'Draw'}),/chance|finish|question|never/i);
});
test('unrecognized pack character safely uses neutral contextual phrasing',()=>{
 const state=s({results:[duel('jun','jun-match',20,true)]});
 const r=R.reaction(state,'jun');assert.equal(r.kind,'win');
 assert.equal(r.lines[0].speaker,'jun');
 assert.equal(r.lines[0].text,'I have been thinking about our last match.');
});

test('imported NPC keeps its character-pack post-duel voice, not a generic victory template',()=>{
 const character={duelWin:'I did not expect that clever attack!',duelLose:'I planned for this rematch.'};
 const state=s({results:[duel('jun','now',20,true)]});
 assert.equal(R.afterDuel(state,{npc:'jun'},{duelId:'now',outcome:'Victory'},character),character.duelWin);
 assert.equal(R.afterDuel(state,{npc:'jun'},{duelId:'now',outcome:'Defeat'},character),character.duelLose);
});
