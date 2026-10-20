'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const COMMUNITY=require('../rpg_community');
const SCHEDULES=require('../rpg_schedules');
const PACK=require('../rpg_narrative_pack'),SIDE=require('../rpg_side_quests');
const cast=Object.fromEntries(['hana','reina','shiori','yuna','akari','camila','marina','kaede'].map(id=>[id,{name:id}]));
Object.assign(cast,PACK.cast,SIDE.cast);
const make=(day=1)=>({day,points:0,credits:100,results:[],relationships:{},tournaments:{}});
const deps={cast,schedules:SCHEDULES};
test('NPC events use real co-location and chronological time, not invented teleports',()=>{
 const s=make(),created=COMMUNITY.sync(s,25,deps);
 assert.ok(created.length>5,'Club matches and social scenes should occur throughout campaign');
 for(const e of created){
  assert.ok(['match','meetup'].includes(e.kind));
  assert.ok(e.a!==e.b,'two separate characters participate');
  const attendees=SCHEDULES.peopleAt(e.day,e.slot,e.place);
  assert.ok(attendees.includes(e.a),e.a+' absent on Day '+e.day);
  assert.ok(attendees.includes(e.b),e.b+' absent on Day '+e.day);
  if(e.kind==='match')assert.ok(e.winner===e.a||e.winner===e.b);
 }
 assert.ok(created.some(e=>e.kind==='meetup'));
});
test('competition results are deterministic across identical saves',()=>{
 const a=make(),b=make();
 COMMUNITY.sync(a,55,deps);COMMUNITY.sync(b,55,deps);
 assert.deepEqual(a.community,b.community);
 const once=JSON.stringify(a.community),again=COMMUNITY.sync(a,55,deps);
 assert.deepEqual(again,[]);
 assert.equal(JSON.stringify(a.community),once,'Repeated render, reload or same-day sync changes nothing');
});
test('skipping multiple days equals individual daily advancement',()=>{
 const a=make(),b=make();
 COMMUNITY.sync(a,60,deps);
 for(let d=1;d<=60;d++)COMMUNITY.sync(b,d,deps);
 assert.deepEqual(a.community,b.community);
});
test('results do not change player points, rewards, relationships or official tournaments',()=>{
 const s=make();const original={points:s.points,credits:s.credits,results:[...s.results],relationships:{...s.relationships},tournaments:{...s.tournaments}};
 COMMUNITY.sync(s,30,deps);
 for(const key of Object.keys(original))assert.deepEqual(s[key],original[key],key+' must not be affected');
});
test('standings are consistent with club match score slips and independent of player result',()=>{
 const s=make();COMMUNITY.sync(s,90,deps);
 const events=s.community.events.filter(e=>e.kind==='match');
 const ranking=COMMUNITY.rank(s,cast);
 assert.equal(ranking.reduce((n,x)=>n+x.wins,0),events.length);
 assert.equal(ranking.reduce((n,x)=>n+x.losses,0),events.length);
 assert.ok(ranking.every((x,i)=>i===0||ranking[i-1].wins>=x.wins));
});
test('old saves initialize from current day with no retroactive rewards or spoilers',()=>{
 const s=make(48);COMMUNITY.hydrate(s);
 assert.equal(s.community.lastResolvedDay,47);
 assert.equal(s.community.events.length,0);
 COMMUNITY.sync(s,47,deps);assert.equal(s.community.events.length,0);
 const entries=COMMUNITY.sync(s,49,deps);
 assert.ok(entries.every(e=>e.day>=48&&e.day<=49));
 assert.equal(s.community.lastResolvedDay,49);
});
test('no future results are shown before the clock reaches that day',()=>{
 const s=make();COMMUNITY.sync(s,10,deps);
 s.day=4;
 assert.ok(COMMUNITY.recent(s).length>0);
 assert.equal(COMMUNITY.forCharacter(s,'kaede')?.day>4||false,false);
 // The UI must only sync through *completed* days, but the public selector also respects its day boundary.
 assert.equal(COMMUNITY.dialogue(s,'kaede',cast),null);
});
test('rivalries and friendships emerge across repeated independent encounters',()=>{
 const s=make();COMMUNITY.sync(s,90,deps);
 for(const e of s.community.events){
  if(e.rivalry)assert.ok(s.community.links[e.pair].matches>=2);
  if(e.friendship)assert.ok(s.community.links[e.pair].meetings>=2);
 }
 assert.ok(Object.values(s.community.links).some(x=>x.matches>=2),'some club rivals should meet again');
});
test('character-specific community memory is a read-only three-line scene',()=>{
 const s=make(60);COMMUNITY.sync(s,59,deps);
 const match=COMMUNITY.recent(s,90).find(e=>e.day>=55);
 assert.ok(match);
 s.day=match.day+1;
 const before=JSON.stringify(s);
 const context=COMMUNITY.dialogue(s,match.a,cast);
 assert.ok(context);assert.equal(context.kind,'community');
 assert.match(context.id,/^react:community:/);
 assert.deepEqual(context.lines.map(x=>x.speaker),[match.a,'Protagonist',match.a]);
 assert.equal(JSON.stringify(s),before);
});
test('invalid schedules or missing cast cannot fabricate off-screen match',()=>{
 const s=make();
 assert.deepEqual(COMMUNITY.sync(s,5,{cast:{},schedules:{peopleAt:()=>[]}}),[]);
 assert.equal(COMMUNITY.rank(s).length,0);
});

test('main cast has distinct reactions to off-screen club results and friendships',()=>{
 const ids=['hana','reina','shiori','yuna','akari','camila','marina','kaede','elena','jinx','luna','rina','sierra','sol'];
 for(const id of ids)for(const tone of ['win','loss','meet'])
  assert.ok(COMMUNITY.VOICES[id]?.[tone],id+' missing '+tone+' reaction');
 const history={lastResolvedDay:4,events:[{id:'club-match-4',kind:'match',day:4,slot:1,place:'center',
  pair:'akari:reina',a:'akari',b:'reina',winner:'reina',loser:'akari'}]};
 const s=make(5);s.community=history;
 assert.notEqual(COMMUNITY.dialogue(s,'reina',cast).lines[0].text,
  COMMUNITY.dialogue(s,'akari',cast).lines[0].text);
});
