'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const STORY=require('../rpg_story'),BONDC=require('../rpg_bond_chapters'),BONDS=require('../rpg_bond_rewards');
const COLLECT=require('../rpg_collection'),NAR=require('../rpg_narrative_pack'),SIDE=require('../rpg_side_quests');
const heroines=['hana','reina','shiori','yuna','akari','camila','marina','kaede'];
const cast=Object.fromEntries(heroines.map(id=>[id,{name:id}]));
Object.assign(cast,NAR.cast,SIDE.cast);
const PLAN=BONDS.build(STORY.events,cast);
const make=()=>{
 const s={day:1,slot:1,location:'shop',credits:0,deckJourney:COLLECT.fresh(),storyDone:{},relationships:{},storyMissed:{},storyFlags:{},partner:null};
 COLLECT.choose(s,'ember_garden');return s;
};
test('every playable NPC has four authored relationship chapters, a signature and a duel challenge',()=>{
 assert.deepEqual(STORY.validate(),[]);
 assert.deepEqual(BONDC.validate(),[]);
 assert.deepEqual(BONDS.validate(STORY.events,cast),[]);
 assert.ok(Object.keys(cast).length>=20,'includes the three newer character packs');
 assert.equal(Object.keys(PLAN.byNpc).length,Object.keys(cast).length);
 for(const npc of Object.keys(cast)){
  assert.equal(PLAN.byNpc[npc].length,4,npc);
  assert.ok(BONDS.SIGNATURES[npc],npc+' has signature');
  assert.ok(BONDS.TRIALS[npc],npc+' has named duel challenge');
  assert.equal(COLLECT.canOwn(BONDS.SIGNATURES[npc]),true,npc+' signature exists in supported collection');
  for(const [i,id] of PLAN.byNpc[npc].entries()){
   assert.equal(STORY.byId(id).npc,npc);
   assert.equal(PLAN.byEvent[id].chapter,i+1);
  }
 }
});
test('side quest cast now has four distinct non-expiring, sequential narrative scenes each',()=>{
 for(const npc of Object.keys(SIDE.cast)){
  const ids=PLAN.byNpc[npc];assert.equal(ids.length,4);
  assert.equal(new Set(ids).size,4);
  for(let i=0;i<4;i++){
   const e=STORY.byId(ids[i]);
   assert.equal(e.evergreen,true);
   assert.equal(e.end,90);
   assert.equal(e.choices.length,2);
   assert.ok(e.lines.length>=4);
   if(i)assert.equal(e.prerequisite,ids[i-1]);
  }
 }
});
test('additional final chapters remain playable until season end and respect prerequisites',()=>{
 const npc='jun',id=PLAN.byNpc[npc][3],e=STORY.byId(id);
 const s=make();STORY.normalize(s);
 s.day=88;s.slot=e.slot;s.location=e.place;s.relationships[npc].affection=8;
 assert.equal(STORY.available(s).some(item=>item.id===id),false,'later chapter cannot spoil previous chapter');
 for(const previous of PLAN.byNpc[npc].slice(0,3))s.storyDone[previous]={choice:0,day:70};
 assert.equal(STORY.available(s).some(item=>item.id===id),true);
 STORY.recordExpiry(s);assert.equal(s.storyMissed[id],undefined);
});
test('chapters award credits, themed voucher, signature and a final voucher exactly once',()=>{
 const s=make(),npc='camila';
 const ids=PLAN.byNpc[npc],set=COLLECT.setForCharacter(npc),sig=BONDS.SIGNATURES[npc];
 let expectedCredits=0;
 for(let i=0;i<ids.length;i++){
  s.storyDone[ids[i]]={choice:0,day:12+i};
  const result=BONDS.reward(s,STORY.byId(ids[i]),PLAN,COLLECT);
  assert.equal(result.chapter,i+1);
  expectedCredits+=[10,15,18,25][i];
  assert.equal(s.credits,expectedCredits);
  assert.equal(BONDS.progress(s,npc,PLAN).completed,i+1);
  const snapshot=JSON.stringify(s);
  assert.equal(BONDS.reward(s,STORY.byId(ids[i]),PLAN,COLLECT),null);
  assert.equal(JSON.stringify(s),snapshot,'never repeat currency or card rewards');
 }
 assert.equal(s.deckJourney.vouchers[set],2);
 assert.equal(s.deckJourney.owned[sig]>=1,true);
 assert.equal(s.credits,68);
});
test('every character gets a distinct one-time themed duel reward when bond chapters are completed',()=>{
 for(const npc of Object.keys(cast)){
  const s=make(),ids=PLAN.byNpc[npc],set=COLLECT.setForCharacter(npc);
  assert.equal(BONDS.canChallenge(s,npc,PLAN),false,npc);
  s.storyDone[ids[0]]={choice:0,day:10};
  assert.equal(BONDS.canChallenge(s,npc,PLAN),false,npc);
  s.storyDone[ids[1]]={choice:0,day:30};
  assert.equal(BONDS.canChallenge(s,npc,PLAN),true,npc);
  assert.equal(BONDS.settleChallenge(s,npc,false,PLAN,COLLECT),null);
  const win=BONDS.settleChallenge(s,npc,true,PLAN,COLLECT);
  assert.equal(win.title,BONDS.TRIALS[npc]);
  assert.equal(s.deckJourney.vouchers[set],1);
  assert.equal(s.credits,12);
  assert.equal(BONDS.canChallenge(s,npc,PLAN),false);
  assert.equal(BONDS.settleChallenge(s,npc,true,PLAN,COLLECT),null);
  assert.equal(s.credits,12);
 }
});
test('redeeming a story voucher costs no credits, yields ten random cards and retains gift source after reload',()=>{
 const s=make(),set=COLLECT.setForCharacter('reina');s.credits=0;
 COLLECT.awardVoucher(s,set);
 const cards=COLLECT.redeemVoucher(s,set,()=>0.31);
 assert.equal(cards.length,10);
 assert.equal(s.credits,0);
 assert.equal(s.deckJourney.vouchers[set],0);
 assert.equal(s.deckJourney.lastPack.source,'gift');
 assert.equal(s.deckJourney.lastPack.set,set);
 assert.ok(cards.some(id=>COLLECT.ENERGY.has(id)));
 assert.ok(cards.some(id=>id.startsWith(set+'-')&&Number(id.split('-')[1])<=COLLECT.SETS[set].rares));
 const restored=JSON.parse(JSON.stringify(s));COLLECT.hydrate(restored);
 assert.deepEqual(restored.deckJourney,s.deckJourney);
 assert.throws(()=>COLLECT.redeemVoucher(s,set),/Reveal your previous booster/);
 s.deckJourney.lastPack.opened=true;
 assert.throws(()=>COLLECT.redeemVoucher(s,set),/no .* booster vouchers/);
});
test('legacy saves hydrate missing or corrupted voucher state safely',()=>{
 const s=make();delete s.deckJourney.vouchers;COLLECT.hydrate(s);
 assert.deepEqual(s.deckJourney.vouchers,{});
 s.deckJourney.vouchers={neo4:2,invalid:5,base1:-1};
 COLLECT.hydrate(s);assert.deepEqual(s.deckJourney.vouchers,{neo4:2});
});
test('browser script order and public routes include new modules',()=>{
 const root=path.join(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'rpg.html'),'utf8');
 const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
 const game=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
 assert.ok(html.indexOf('/rpg_bond_chapters.js')<html.indexOf('/rpg_story.js'));
 assert.ok(html.indexOf('/rpg_bond_rewards.js')<html.indexOf('/rpg.js'));
 assert.match(server,/pathname==='\/rpg_bond_chapters\.js'/);
 assert.match(server,/pathname==='\/rpg_bond_rewards\.js'/);
 assert.match(game,/BONDS\.settleChallenge/);
 assert.match(game,/BONDS\.reward/);
 assert.match(game,/BONDS\.progress/);
});


test('all character chapter chains can resolve in order and grant only one milestone reward per scene',()=>{
 for(const npc of Object.keys(cast)){
  const s=make();STORY.normalize(s);const ids=PLAN.byNpc[npc];
  for(const id of ids){
   const e=STORY.byId(id);
   s.day=e.start;s.slot=e.slot;s.location=e.place;
   s.relationships[npc].affection=Math.max(s.relationships[npc].affection,e.minBond,6);
   s.relationships[npc].trust=Math.max(s.relationships[npc].trust,3);
   assert.equal(STORY.qualifies(e,s),true,npc+' must be able to reach '+id);
   const index=e.choices.findIndex(choice=>choice.kind!=='commit');
   assert.ok(index>=0,npc+' scene must offer a non-exclusive decision');
   STORY.resolve(s,id,index);
   const reward=BONDS.reward(s,e,PLAN,COLLECT);
   assert.ok(reward,npc+' must receive milestone '+id);
  }
  assert.equal(BONDS.progress(s,npc,PLAN).completed,4);
  assert.equal(s.credits,68);
  assert.equal(s.deckJourney.vouchers[COLLECT.setForCharacter(npc)],2);
  assert.ok(s.deckJourney.owned[BONDS.SIGNATURES[npc]]>=1);
 }
});

test('later supporting chapters react to previous choices, not only affection totals',()=>{
 for(const npc of Object.keys(SIDE.cast)){
  const s=make();STORY.normalize(s);
  const [first,second]=PLAN.byNpc[npc].map(id=>STORY.byId(id));
  assert.ok(second.openingByFlag,second.id+' has remembered-choice lines');
  s.day=first.start;s.slot=first.slot;s.location=first.place;
  STORY.resolve(s,first.id,0);
  const a=STORY.linesFor(s,second.id)[0].text;
  const alt=make();STORY.normalize(alt);
  alt.day=first.start;alt.slot=first.slot;alt.location=first.place;
  STORY.resolve(alt,first.id,1);
  const b=STORY.linesFor(alt,second.id)[0].text;
  assert.notEqual(a,b,npc+' must remember what was said');
  assert.notEqual(a,second.lines[0].text,npc+' should adapt its follow-up scene');
 }
});
