'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const CG=require('../rpg_cg_gallery');
const names=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
const state=(extra={})=>({day:10,slot:1,location:'shop',
 relationships:Object.fromEntries(names.map(id=>[id,{affection:9,trust:9}])),
 bonds:Object.fromEntries(names.map(id=>[id,{affection:9,trust:9}])),...extra});
test('the original 45 CGs and 34 standalone slice-of-life briefs coexist without duplicates',()=>{
 const legacy=CG.catalog.filter(x=>x.trigger!=='slice'),ambient=CG.catalog.filter(x=>x.trigger==='slice');
 assert.equal(legacy.length,45);assert.equal(ambient.length,34);assert.equal(CG.catalog.length,79);
 assert.deepEqual(CG.validate(),[]);assert.equal(new Set(CG.catalog.map(x=>x.id)).size,79);
 for(const id of names)assert.deepEqual(legacy.filter(x=>x.character===id).map(x=>x.category),CG.categories);
});
test('first encounters grant only the correct profile and never other characters',()=>{
 const s=state({relationships:{hana:{affection:0}}});
 const result=CG.record(s,'meet','hana');
 assert.deepEqual(result.map(x=>x.id),['hana_first_meeting']);
 assert.equal(CG.record(s,'meet','hana').length,0);
 assert.equal(CG.record(s,'meet','reina')[0].id,'reina_rival_intro');
 assert.equal(Object.keys(s.cgUnlocked).length,2);
});
test('the actual play location and affection constrain pre-duel CGs',()=>{
 const s=state({relationships:{hana:{affection:0}}});
 assert.equal(CG.record(s,'before_duel','hana').length,0);
 s.relationships.hana.affection=1;
 assert.equal(CG.record(s,'before_duel','hana')[0].id,'hana_shop_challenge');
 s.location='cafe';
 assert.equal(CG.record(s,'before_duel','camila').length,0);
 assert.equal(CG.record(s,'before_duel','hana').length,0);
});
test('riverside beach scene is reachable in the existing park, not a nonexistent beach location',()=>{
 const s=state({location:'park',day:22,slot:1});
 assert.deepEqual(CG.record(s,'before_duel','marina').map(x=>x.id),['marina_riverside_predue']);
 const hang=CG.record(s,'hangout','marina').map(x=>x.id);
 assert.ok(!hang.includes('marina_beach_towel'));
 assert.ok(hang.includes('marina_sunset_cards'));
});
test('post-arrival character is never unlocked before her established town entry',()=>{
 const s=state({location:'arcade',day:39,slot:2});
 assert.deepEqual(CG.record(s,'meet','kaede'),[]);
 assert.deepEqual(CG.record(s,'before_duel','kaede'),[]);
 s.day=41;assert.equal(CG.record(s,'meet','kaede').length,1);
 assert.equal(CG.record(s,'before_duel','kaede').length,1);
});
test('social, special and before-duel moments are not granted by unrelated triggers',()=>{
 const s=state({location:'arcade',slot:2,day:25});
 assert.equal(CG.record(s,'meet','yuna').length,1);
 const duel=CG.record(s,'before_duel','yuna');assert.equal(duel.length,1);
 const hang=CG.record(s,'hangout','yuna');assert.equal(hang.length,1);
 assert.deepEqual(CG.record(s,'after_duel','yuna'),[]);
 assert.deepEqual(CG.record(s,'appointment','yuna'),[]);
 assert.deepEqual(CG.record(s,'situation','yuna'),[],'cannot unlock special art before the event resolves');
});
test('locked gallery reveals no titles or image paths and cannot mark views',()=>{
 const s=state({relationships:{hana:{affection:0}}});
 const gallery=CG.gallery(s,{character:'hana'});
 assert.equal(gallery.length,6);
 assert.ok(gallery.every(x=>!x.unlocked&&x.title==='???'&&x.path===null&&x.thumb===null));
 assert.equal(CG.markViewed(s,'hana_first_meeting'),false);
 CG.record(s,'meet','hana');
 assert.equal(CG.gallery(s,{character:'hana'})[0].unlocked,true);
 assert.equal(CG.markViewed(s,'hana_first_meeting'),true);
 assert.equal(CG.gallery(s,{character:'hana'})[0].viewed,true);
});
test('unlock metadata survives JSON roundtrip; duplicate actions do not produce duplicate unlocks',()=>{
 const s=state();CG.record(s,'meet','hana');CG.record(s,'before_duel','hana');CG.markViewed(s,'hana_shop_challenge');
 const restored=JSON.parse(JSON.stringify(s));
 assert.equal(CG.record(restored,'meet','hana').length,0);
 assert.equal(CG.record(restored,'before_duel','hana').length,0);
 assert.equal(CG.gallery(restored,{character:'hana'}).filter(x=>x.unlocked).length,2);
 assert.equal(restored.cgViewed.hana_shop_challenge,true);
});
test('legacy save migration repairs invalid CG metadata and preserves character bonds',()=>{
 const s=state({cgUnlocked:{bad:{day:1,slot:0},hana_first_meeting:{day:4,slot:9},reina_rival_intro:{day:2,slot:1}},
 cgViewed:{bad:true,hana_first_meeting:true,reina_rival_intro:true}});
 CG.hydrate(s);
 assert.deepEqual(Object.keys(s.cgUnlocked),['reina_rival_intro']);
 assert.deepEqual(Object.keys(s.cgViewed),['reina_rival_intro']);
 assert.equal(s.relationships.hana.affection,9);
});
test('only known unlocked images can be displayed; invalid seasons and negative time reject events',()=>{
 const s=state({day:91});assert.deepEqual(CG.record(s,'meet','hana'),[]);
 s.day=3;s.slot=-1;assert.deepEqual(CG.record(s,'meet','hana'),[]);
 assert.equal(CG.gallery(s).length,79);
 assert.equal(CG.gallery(s,{category:'special'}).length,16);
});
test('the manifest is ready for the art agent with exact uniquely addressed images',()=>{
 const paths=CG.catalog.flatMap(x=>[x.path,x.thumb]);assert.equal(new Set(paths).size,158);
 for(const path of paths)assert.match(path,/^\/rpg-assets\/events\/cg\/(?:season01|slice-life)\/(?:thumbs\/)?[a-z0-9_]+\.webp$/);
});

test('special CG is exclusive to a verified, completed G5 situation event',()=>{
 const s=state({day:20,slot:1,location:'park'});
 assert.deepEqual(CG.record(s,'hangout','marina').map(x=>x.id),['marina_sunset_cards']);
 assert.deepEqual(CG.record(s,'situation','marina',{eventId:'marina_beach_towel'}),[]);
 s.situationDone={marina_beach_towel:{day:20,slot:1,choice:0}};
 const unlocked=CG.record(s,'situation','marina',{eventId:'marina_beach_towel'});
 assert.deepEqual(unlocked.map(x=>x.id),['marina_beach_towel']);
 assert.deepEqual(CG.record(s,'situation','marina',{eventId:'marina_beach_towel'}),[]);
 assert.equal(CG.gallery(s,{character:'marina'}).filter(x=>x.unlocked).length,2);
});

test('missing CG artwork reuses the character battle cut-in with event art taking priority',()=>{
 const hana=CG.byId('hana_counter_shuffle');
 const ambient=hana||CG.catalog.find(x=>x.character==='hana'&&x.trigger==='slice');
 assert.ok(ambient,'Hana must have a slice-of-life CG brief');
 const candidates=CG.artCandidates(ambient);
 assert.deepEqual(candidates.slice(0,2),[
  {path:ambient.path,kind:'event'},
  {path:'/rpg-assets/characters/hana/cutins/match-cutin.webp',kind:'cutin'}
 ]);
 const galleryThumbs=CG.artCandidates(ambient,true);
 assert.deepEqual(galleryThumbs.slice(0,2),[{path:ambient.thumb,kind:'event'},{path:ambient.path,kind:'event'}]);
 assert.ok(galleryThumbs.some(x=>x.kind==='cutin'));
 for(const [npc,file] of [['jinx','battle_smirk.webp'],['luna','battle_smile.webp']]){
  const art=CG.catalog.find(x=>x.character===npc&&x.trigger==='slice');
  assert.ok(art);
  assert.equal(CG.artCandidates(art)[1].path,'/rpg-assets/characters/'+npc+'/cutins/'+file);
 }
 for(const npc of ['elena','rina','sierra','sol']){
  const art=CG.catalog.find(x=>x.character===npc&&x.trigger==='slice');
  assert.ok(CG.artCandidates(art).some(x=>x.path==='/rpg-assets/reactions/'+npc+'/attack.png'&&x.kind==='cutin'));
 }
 const laca=CG.catalog.find(x=>x.character==='laca'&&x.trigger==='slice');
 assert.ok(CG.artCandidates(laca).some(x=>x.kind==='portrait'),'Laca may use her approved portrait once installed');
});
test('locked CGs cannot fetch cut-ins or disclose any illustration URL',()=>{
 const locked=CG.gallery(state({relationships:{hana:{affection:0}}}),{character:'hana'})[0];
 assert.equal(locked.path,null);assert.equal(locked.thumb,null);
 assert.deepEqual(CG.artCandidates(locked),[]);
 assert.deepEqual(CG.artCandidates(locked,true),[]);
});
