'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const PRE=require('../rpg_preduel'),CG=require('../rpg_cg_gallery');
const cast={hana:{name:'Hana Mizuno',style:'Teamwork'},reina:{name:'Reina Kurogane',style:'Aggression'},yuna:{name:'Yuna Hoshino',style:'Surprise'},jun:{name:'Jun Arai'}};
const places={shop:['The Lucky Draw'],center:['Community Center'],arcade:['Pixel Palace']};
const fresh=(other={})=>({day:8,slot:1,location:'shop',relationships:{hana:{affection:5},reina:{affection:0}},...other});
const duel=(extra={})=>({id:'npc-hana-8-1-0',npc:'hana',day:8,slot:1,opponent:'power_reserve',playerDeck:'blackout',...extra});
test('staging is explicit, persists readiness and never launches on description',()=>{
 const d=duel();PRE.stage(d);
 assert.equal(PRE.isReady(d),true);assert.equal(PRE.isLaunched(d),false);
 assert.equal(PRE.describe(fresh(),d,{cast,places,cg:CG}).name,'Hana Mizuno');
 assert.equal(d.preview.phase,'ready');assert.equal(d.preview.index,0);
 assert.throws(()=>PRE.stage(d),/already staged/);
});
test('dialogue progression is idempotent and survives save/reload',()=>{
 const d=duel();PRE.stage(d);
 assert.equal(PRE.advance(d),true);assert.equal(PRE.advance(d),false);
 const restored=JSON.parse(JSON.stringify(d));PRE.hydrate(restored);
 assert.equal(restored.preview.index,1);assert.equal(PRE.launch(restored),true);
 assert.equal(PRE.launch(restored),false);assert.equal(PRE.advance(restored),false);
 assert.equal(PRE.isLaunched(restored),true);
});
test('skip launches directly without requiring a dialogue interaction',()=>{
 const d=duel();PRE.stage(d);
 assert.equal(d.preview.index,0);assert.equal(PRE.launch(d),true);
 assert.equal(d.preview.phase,'launched');assert.equal(d.preview.index,1);
});
test('old running saves without preview retain their duel rather than restarting it',()=>{
 const d=duel();PRE.hydrate(d);
 assert.equal(PRE.isLaunched(d),true);assert.equal(PRE.isReady(d),false);
 assert.equal(PRE.launch(d),false);
});
test('bad preview payloads are repaired to avoid a stuck legacy duel',()=>{
 const d=duel({preview:{phase:'nonsense',index:987}});PRE.hydrate(d);
 assert.equal(PRE.isLaunched(d),true);
 const freshD=duel({preview:{phase:'ready',index:Infinity}});PRE.hydrate(freshD);
 assert.equal(freshD.preview.index,0);
});
test('eligible installed-art metadata is selected only for proper character, place, time and bond',()=>{
 const d=duel();
 assert.equal(PRE.describe(fresh(),d,{cast,places,cg:CG}).artwork.id,'hana_shop_challenge');
 assert.equal(PRE.describe(fresh({location:'center'}),d,{cast,places,cg:CG}).artwork,null);
 assert.equal(PRE.describe(fresh({relationships:{hana:{affection:0}}}),d,{cast,places,cg:CG}).artwork,null);
 assert.equal(PRE.describe(fresh({slot:2}),d,{cast,places,cg:CG}).artwork,null);
});
test('non-primary NPCs receive safe contextual dialogue without fabricated image paths',()=>{
 const d=duel({npc:'jun'});
 const out=PRE.describe(fresh(),d,{cast,places,cg:CG});
 assert.equal(out.artwork,null);assert.match(out.lines[1].text,/Ready when you are/);
 assert.equal(out.lines[0].speaker,'Narrator');
});
test('rivalry, sidequest, official tournament and exhibition stakes do not alter reducer state',()=>{
 for(const [props,term] of [
  [{arcEpisode:'reina_rival_trial'},/Personal rivalry/],
  [{sideQuestId:'borrowed_deck'},/Side quest/],
  [{tournamentId:'neighborhood',tournamentRound:1},/Official tournament/],
  [{eventTitle:'Arcade Friendly Cup'},/Special event/]
 ]){
  const state=fresh();const before=JSON.stringify(state),d=duel(props);
  const out=PRE.describe(state,d,{cast,places,tournaments:{cups:[{id:'neighborhood',title:'Neighborhood Cup'}]}});
  assert.match(out.stake,term);assert.equal(JSON.stringify(state),before);
 }
});
test('unrecognized duel identities have no valid scene',()=>{
 assert.equal(PRE.describe(fresh(),duel({npc:'nobody'}),{cast,places}),null);
 assert.throws(()=>PRE.stage({npc:'hana'}),/Missing duel identity/);
});
