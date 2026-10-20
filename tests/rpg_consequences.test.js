'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),C=require('../rpg_consequences');
const fresh=(overrides={})=>({day:12,location:'center',results:[],points:30,credits:80,
 relationships:{reina:{affection:0,trust:0}},...overrides});
function add(s,npc,id,day,outcome,other={}){
 const r={id,npc,day,won:outcome==='Victory',draw:outcome==='Draw'};
 s.results.push(r);s.day=day;
 const duel={id,npc,day,...other},receipt={duelId:id,npc,outcome};
 return C.record(s,duel,receipt,other.tournamentId?{cupOutcome:{state:'eliminated',won:false}}:
  other.competitiveKind?{competitiveOutcome:{won:false}}:{});
}
test('only a receipt matching an actual settled duel can create narrative consequences',()=>{
 const s=fresh();
 assert.equal(C.record(s,{id:'a',npc:'reina',day:12},{duelId:'a',npc:'reina',outcome:'Victory'}),null);
 const real=add(s,'reina','a',12,'Defeat');assert.ok(real);
 assert.equal(C.record(s,{id:'a',npc:'reina',day:12},{duelId:'a',npc:'reina',outcome:'Defeat'}),null);
 assert.equal(s.consequences.events.length,1);
 assert.equal(s.results.length,1);
});
test('saved chronology distinguishes comebacks, reversals and repeat losses',()=>{
 const s=fresh();
 assert.equal(add(s,'reina','a',10,'Defeat').kind,'setback');
 assert.equal(add(s,'reina','b',11,'Defeat').kind,'losing_streak');
 assert.equal(add(s,'reina','c',12,'Victory').kind,'comeback');
 assert.equal(add(s,'reina','d',13,'Defeat').kind,'reversal');
 assert.deepEqual(C.trend(s,'reina'),{played:4,wins:1,losses:3,draws:0,streak:1,latest:'Defeat'});
});
test('individual rival records are independent and do not change points or affection',()=>{
 const s=fresh();const original={points:s.points,credits:s.credits,relationships:JSON.stringify(s.relationships)};
 add(s,'reina','first',10,'Defeat');add(s,'hana','second',11,'Victory');
 assert.equal(C.trend(s,'hana').wins,1);assert.equal(C.trend(s,'reina').losses,1);
 assert.equal(s.points,original.points);assert.equal(s.credits,original.credits);
 assert.equal(JSON.stringify(s.relationships),original.relationships);
});
test('cup eliminations have a distinct consequence but no fabricated championship reward',()=>{
 const s=fresh();const cup=add(s,'akari','regional-loss',60,'Defeat',{tournamentId:'regional'});
 assert.equal(cup.kind,'cup_setback');assert.equal(cup.cup,'regional');
 assert.deepEqual(C.opportunities(s).map(x=>x.id),[cup.id]);
 assert.equal(s.tournaments,undefined);
});
test('reflection requires the real event and the center, then persists exactly once',()=>{
 const s=fresh();const e=add(s,'reina','a',12,'Defeat');
 s.location='home';assert.equal(C.resolve(s,e.id,'study'),null);
 s.location='center';assert.equal(C.resolve(s,'turn:invented','study'),null);
 const result=C.resolve(s,e.id,'study');assert.ok(result);assert.equal(result.lines.length,3);
 assert.equal(result.response.path,'study');
 assert.equal(C.resolve(s,e.id,'study'),null);
 assert.equal(C.opportunities(s).length,0);
 assert.equal(C.reaction(s,'reina').kind,'consequence');
 const restored=JSON.parse(JSON.stringify(s));
 assert.deepEqual(restored.consequences,s.consequences);
 assert.equal(C.opportunities(restored).length,0);
});
test('player choices are distinct, roleplaying-only and never grindable',()=>{
 for(const path of Object.keys(C.PATHS)){
  const s=fresh();const e=add(s,'reina','example',12,'Defeat');
  const before=JSON.stringify({points:s.points,credits:s.credits,relationships:s.relationships,results:s.results});
  const r=C.resolve(s,e.id,path);
  assert.equal(r.response.path,path);assert.match(r.lines[0].text,/./);
  assert.equal(JSON.stringify({points:s.points,credits:s.credits,relationships:s.relationships,results:s.results}),before);
  assert.equal(C.resolve(s,e.id,path),null);
 }
});
test('old saves do not fabricate earlier turning points',()=>{
 const s=fresh({day:65,results:[{id:'old',npc:'reina',day:30,won:false,draw:false}]});
 C.hydrate(s);assert.deepEqual(C.opportunities(s),[]);
 assert.deepEqual(C.ending(s).lines,[]);
 assert.equal(C.trend(s,'reina').losses,1);
});
test('opportunities expire after seven days and completed choices remain in ending',()=>{
 const s=fresh();const e=add(s,'reina','a',12,'Defeat');
 s.day=20;assert.equal(C.opportunities(s).length,0);
 s.day=12;assert.ok(C.resolve(s,e.id,'perspective'));
 s.day=91;assert.equal(C.opportunities(s).length,0);
 assert.equal(C.ending(s).reflections,1);
});
test('comeback after a prior loss gives a distinct report and followup',()=>{
 const s=fresh();add(s,'reina','a',10,'Defeat');
 const e=add(s,'reina','b',12,'Victory');
 assert.equal(e.kind,'comeback');
 assert.ok(C.resolve(s,e.id,'challenge'));
 const last=C.ending(s);
 assert.equal(last.comebacks,1);assert.equal(last.reflections,1);
 assert.ok(last.lines.some(x=>x.includes('turned 1 earlier defeat')));
 assert.match(C.preDuel(s,'reina'),/result/);
});
test('draw breaks a losing streak and can never be recorded as defeat',()=>{
 const s=fresh();add(s,'reina','a',10,'Defeat');
 const d=add(s,'reina','draw',11,'Draw');
 assert.equal(d.kind,'standard');assert.equal(C.trend(s,'reina').streak,0);
 assert.equal(add(s,'reina','new',12,'Defeat').kind,'setback');
});
test('bounded saved event log and safe reports ignore corrupted legacy values',()=>{
 const s=fresh({consequences:{events:'broken',choices:{},processed:{}}});
 C.hydrate(s);assert.ok(Array.isArray(s.consequences.events));
 for(let i=1;i<=130;i++)add(s,'reina','duel-'+i,12,i%3===0?'Defeat':'Victory');
 assert.equal(s.consequences.events.length,110);
 assert.ok(C.ending(s).comebacks>0);
});

test('the main cast has distinct follow-ups for all three recovery choices',()=>{
 const ids=['hana','reina','shiori','yuna','akari','camila','marina','kaede','elena','jinx','luna','rina','sierra','sol'];
 for(const id of ids)for(const approach of Object.keys(C.PATHS))
  assert.ok(C.VOICES[id]?.[approach],id+':'+approach+' lacks a distinct line');
 assert.notEqual(C.VOICES.reina.study,C.VOICES.yuna.study);
 const s=fresh();const e=add(s,'reina','a',12,'Defeat');C.resolve(s,e.id,'study');
 assert.match(C.reaction(s,'reina').lines[0].text,/went back over our game/i);
 assert.match(C.preDuel(s,'reina'),/went back over our game/i);
});

test('unsanctioned metadata cannot fabricate a Cup or Local accomplishment',()=>{
 const s=fresh();
 const event=add(s,'reina','unsanctioned',12,'Defeat');
 assert.equal(event.kind,'setback');
 const next={id:'fake-cup',npc:'reina',day:12,tournamentId:'championship'};
 s.results.push({id:next.id,npc:next.npc,day:12,won:false,draw:false});
 const falseCup=C.record(s,next,{duelId:next.id,npc:'reina',outcome:'Defeat'});
 assert.notEqual(falseCup.kind,'cup_setback');
 const wrongDay=C.record(s,{id:'fake-day',npc:'reina',day:11},
  {duelId:'fake-day',npc:'reina',outcome:'Defeat'});
 assert.equal(wrongDay,null);
});
