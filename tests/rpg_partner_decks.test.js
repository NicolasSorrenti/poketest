'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const PARTNER=require('../rpg_partner_decks'),COLLECT=require('../rpg_collection');
const {ClassicLocalService}=require('../classic_local_service');
const STORY=require('../rpg_story'),BONDS=require('../rpg_bond_rewards');
const PACK=require('../rpg_narrative_pack'),SIDE=require('../rpg_side_quests');
const heroes=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
const originalDecks={hana:'power_reserve',reina:'blackout',shiori:'overgrowth',yuna:'zap',akari:'gym_new_voltage',camila:'rocket_lab',marina:'water_blast',kaede:'rocket_lab'};
const cast=Object.assign(Object.fromEntries(heroes.map(id=>[id,{name:id,deck:originalDecks[id]}])),PACK.cast,SIDE.cast);
const chapters=BONDS.build(STORY.events,cast);
const state=(npc='reina')=>({day:20,credits:50,storyDone:{
 [chapters.byNpc[npc][0]]:{day:7},[chapters.byNpc[npc][1]]:{day:18}
 },deckJourney:{owned:{}},partnerDecks:{},partnerDeckSources:{}});
const service=new ClassicLocalService();
const catalog=new Map(service.catalog().map(c=>[c.id,c]));
function setup(npc='reina'){
 const s=state(npc),source=cast[npc].deck,original=service.decklist(source);
 const sig=PARTNER.protectedCard(original,catalog,BONDS.SIGNATURES[npc]);
 return {s,source,original,sig,ctx:{original,owned:s.deckJourney.owned,catalog,signature:sig}};
}
test('all present characters unlock deck collaboration only after two real chapters',()=>{
 assert.ok(Object.keys(cast).length>=20);
 for(const npc of Object.keys(cast)){
  const s=state(npc);assert.equal(PARTNER.unlocked(s,npc),true,npc);
  delete s.storyDone[chapters.byNpc[npc][1]];
  assert.equal(PARTNER.unlocked(s,npc),false,npc);
 }
});
test('partner edits preserve original deck, protected Pokémon, and at least half the character theme',()=>{
 const {s,source,original,sig,ctx}=setup();
 assert.equal(original.length,60);
 assert.ok(sig&&original.includes(sig));
 assert.equal(PARTNER.check(original,ctx).valid,true);
 PARTNER.save(s,'reina',source,original,ctx);
 assert.deepEqual(PARTNER.snapshot(s,'reina',source),original);
 assert.notEqual(s.partnerDecks.reina.cards,original,'partner save must snapshot rather than alias');
 assert.equal(PARTNER.snapshot(s,'reina','another-theme'),null);
 const zero=[...original].filter(id=>id!==sig);
 while(zero.length<60)zero.push(original.find(id=>catalog.get(id)?.supertype==='Energy'));
 assert.equal(PARTNER.check(zero,ctx).valid,false);
 assert.match(PARTNER.check(zero,ctx).errors.join(' '),/signature Pokémon/);
 assert.throws(()=>PARTNER.save(s,'reina',source,zero,ctx),/Not enough copies|signature Pokémon/);
});
test('owned additions affect partner decks but never consume cards from player collection',()=>{
 const {s,source,original,ctx}=setup();
 const originalCounts=PARTNER.count(original);
 const extra=[...catalog.values()].find(c=>
   c.supertype==='Pokémon'&&(c.subtypes||[]).includes('Basic')&&!originalCounts[c.id]&&!original.some(id=>catalog.get(id)?.name===c.name));
 assert.ok(extra);
 s.deckJourney.owned[extra.id]=1;
 const pool=PARTNER.pool(original,s.deckJourney.owned,catalog);
 assert.equal(pool[extra.id],1);
 const old=original.find(id=>catalog.get(id)?.supertype==='Energy');
 assert.ok(old);
 const next=[...original];next.splice(next.indexOf(old),1,extra.id);
 assert.equal(PARTNER.check(next,ctx).valid,true);
 PARTNER.save(s,'reina',source,next,ctx);
 assert.ok(s.partnerDecks.reina.cards.includes(extra.id));
 assert.equal(s.deckJourney.owned[extra.id],1,'owned cards should not be spent to modify a partner deck');
 const duplicated=[...next,extra.id].slice(1);
 assert.equal(PARTNER.check(duplicated,ctx).valid,false,'cannot borrow more copies than the player owns');
});
test('corrupted or inaccessible saved partner decks are ignored safely',()=>{
 const {s,source,original,ctx}=setup();
 assert.equal(PARTNER.snapshot(s,'reina',source),null);
 PARTNER.save(s,'reina',source,original,ctx);
 assert.equal(PARTNER.snapshot(s,'reina',source).length,60);
 delete s.storyDone[chapters.byNpc.reina[1]];
 assert.equal(PARTNER.snapshot(s,'reina',source),null);
 s.storyDone[chapters.byNpc.reina[1]]={day:18};
 s.partnerDecks.reina.cards=['bad'];
 assert.equal(PARTNER.snapshot(s,'reina',source),null);
 assert.equal(PARTNER.get(s,'reina',original,ctx.owned,catalog,ctx.signature).validSaved,false);
});
test('Classic CPU engine accepts legal edited partner decks and rejects invalid lists',()=>{
 const {s,source,original,sig,ctx}=setup();
 const copy=[...original];
 PARTNER.save(s,'reina',source,copy,ctx);
 const playable=service.create({deck:'brushfire',opponent:source,customOpponentDeck:PARTNER.snapshot(s,'reina',source),seed:15});
 assert.equal(typeof playable.token,'string');
 assert.ok(service.session(playable.token).game.players[1]);
 assert.throws(()=>service.create({deck:'brushfire',opponent:source,customOpponentDeck:Array(60).fill('nonsense-1'),seed:15}),/Illegal partner deck/);
 assert.throws(()=>service.create({deck:'brushfire',opponent:source,customOpponentDeck:copy.slice(1),seed:15}),/60 valid card IDs/);
});

test('partner deck builder scripts load and the RPG duel bridge forwards snapshots to Classic',()=>{
 const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'rpg_deck_studio.html'),'utf8');
 const rpg=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
 const live=fs.readFileSync(path.join(root,'classic_live.js'),'utf8');
 const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
 assert.match(html,/\/rpg_partner_decks\.js/);
 assert.match(html,/\/rpg_partner_deck_studio\.js/);
 assert.match(rpg,/PARTNER\.snapshot/);
 assert.match(rpg,/neoRpgNpcDeck:/);
 assert.match(live,/customOpponentDeck/);
 assert.match(server,/\/rpg_partner_deck_studio\.js/);
});
