'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const A=require('../rpg_rival_arc'),STORY=require('../rpg_story'),WORLD=require('../rpg_world'),S=require('../rpg_schedules');
const e=(id)=>A.byId(id);
function campaign(overrides={}){
 const s={day:14,slot:2,location:'center',results:[],credits:80,points:0,focus:75,insight:0,reputation:0,preparation:0,
  bonds:{},relationships:{},storyDone:{},storyMissed:{},arcFlags:{},arcOutcomes:{},activeArc:null,partner:null,...overrides};
 STORY.normalize(s);WORLD.hydrate(s);A.hydrate(s);return s;
}
function done(s,id,index=0){s.activeArc={id,phase:'response',choice:index};return A.finish(s,id,index,['reina']);}
test('four connected personal episodes are valid and independent from canonical romance events',()=>{
 assert.deepEqual(A.validate(),[]);
 assert.equal(A.entries.length,4);
 assert.deepEqual(A.entries.map(x=>x.id),['reina_rival_1','reina_rival_2','reina_rival_trial','reina_rival_final']);
 assert.ok(STORY.events.filter(x=>x.npc==='reina').length===4);
});
test('first episode requires a genuine prior match with Reina and her presence',()=>{
 const s=campaign();
 assert.ok(!A.available(s,['reina']).some(x=>x.id==='reina_rival_1'));
 s.results.push({npc:'reina',won:false,day:4});
 assert.ok(A.available(s,['reina']).some(x=>x.id==='reina_rival_1'));
 assert.ok(!A.available(s,[]).some(x=>x.id==='reina_rival_1'));
 assert.deepEqual(S.peopleAt(14,2,'center',[]).includes('reina'),true);
});
test('first episode records a chosen response only once and maintains legacy bonds',()=>{
 const s=campaign({results:[{npc:'reina',won:false}]});
 const report=done(s,'reina_rival_1',0);
 assert.match(report.text,/better answer/);
 assert.equal(s.relationships.reina.trust,2);
 assert.equal(s.bonds.reina.trust,2);
 assert.ok(s.arcFlags.reina_rival_1);
 assert.throws(()=>done(s,'reina_rival_1',0),/no longer available/);
});
test('second episode requires social progress or earned reputation',()=>{
 const s=campaign({day:34,slot:1,location:'shop',results:[{npc:'reina',won:false}],arcFlags:{reina_rival_1:{day:14,choice:0}}});
 assert.ok(!A.available(s,['reina']).some(x=>x.id==='reina_rival_2'));
 s.reputation=4;
 assert.ok(A.available(s,['reina']).some(x=>x.id==='reina_rival_2'));
});
test('private trial accepts varied paths to readiness but always requires played matches',()=>{
 const s=campaign({day:58,slot:2,location:'center',arcFlags:{reina_rival_1:{},reina_rival_2:{}},
  results:[{npc:'reina',won:false}]});
 s.insight=9;
 assert.ok(!A.available(s,['reina']).some(x=>x.id==='reina_rival_trial'));
 s.results.push({npc:'reina',won:false});s.insight=0;
 assert.ok(!A.available(s,['reina']).some(x=>x.id==='reina_rival_trial'));
 s.insight=3;
 assert.ok(A.available(s,['reina']).some(x=>x.id==='reina_rival_trial'));
});
test('a real duel receipt determines personal trust and respect and may settle only once',()=>{
 const s=campaign({day:58,slot:2,location:'center'});
 const win=A.settleDuel(s,'reina_rival_trial',{npc:'reina',outcome:'Victory',duelId:'real-duel-1'});
 assert.ok(win);assert.equal(s.arcFlags.reina_rival_trial.outcome,'Victory');
 assert.equal(s.relationships.reina.respect,3);
 assert.equal(A.settleDuel(s,'reina_rival_trial',{npc:'reina',outcome:'Defeat',duelId:'real-duel-1'}),null);
 assert.equal(s.relationships.reina.respect,3);
});
test('final dialogue responds to a victory or defeat without requiring a victory',()=>{
 const s=campaign({day:81,slot:2,location:'park',arcFlags:{reina_rival_trial:{outcome:'Defeat',day:58}}});
 assert.ok(A.available(s,['reina']).some(x=>x.id==='reina_rival_final'));
 assert.ok(A.linesFor(s,'reina_rival_final').some(line=>line[1].includes('loss')));
 s.arcFlags.reina_rival_trial.outcome='Victory';
 assert.ok(A.linesFor(s,'reina_rival_final').some(line=>line[1].includes('went your way')));
});
test('conclusion preserves friendship or existing exclusive romance decisions',()=>{
 const flags={reina_rival_1:{},reina_rival_2:{},reina_rival_trial:{outcome:'Draw'}};
 const friends=campaign({day:81,slot:2,location:'park',arcFlags:JSON.parse(JSON.stringify(flags))});
 const f=done(friends,'reina_rival_final',0);
 assert.equal(f.ending.relationship,'friendship');assert.equal(f.ending.tone,'rivalry');
 const romance=campaign({day:81,slot:2,location:'park',arcFlags:JSON.parse(JSON.stringify(flags)),partner:'reina'});
 const r=done(romance,'reina_rival_final',1);
 assert.equal(r.ending.relationship,'romance');assert.equal(r.ending.tone,'companionship');
});
test('ending and past outcomes persist across save hydration',()=>{
 const s=campaign({day:81,slot:2,location:'park',arcFlags:{reina_rival_trial:{outcome:'Defeat'}}});
 done(s,'reina_rival_final',2);
 const reloaded=A.hydrate(JSON.parse(JSON.stringify(s)));
 assert.equal(reloaded.arcOutcomes.reina.duelOutcome,'Defeat');
 assert.ok(!A.available(reloaded,['reina']).some(x=>x.id==='reina_rival_final'));
});
test('a corrupt or legacy save with no rivalry flags migrates conservatively',()=>{
 const s=A.hydrate({day:15,slot:2,location:'center',results:[],activeArc:{id:'unknown'},relationships:{},bonds:{}});
 assert.deepEqual(s.arcFlags,{});assert.deepEqual(s.arcOutcomes,{});
 assert.equal(s.activeArc,null);
});
