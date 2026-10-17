'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const {ClassicLocalService,deckOptions}=require('./classic_local_service');
const {createGame,CATALOG}=require('./headless_duel');
const FORMAT=require('./classic_format');
const RETAIL=require('./retail_theme_decks');
const {LAB}=require('./gym_expanded_decks');
const {verify,change}=require('./deck_builder_core');
const {isBasicPokemon,isEnergy,countCards}=require('./core_rules');
const {server}=require('./server');
(async()=>{
 const service=new ClassicLocalService(),all=service.cardPool();
 assert.equal(all.length,705+new Set([...require('./neo_genesis_decks').neoIds,...require('./neo_discovery_decks').neoIds,...require('./neo_bonus_pool').ids,...require('./neo_destiny_decks').neoIds,...require('./neo_v040_pool').ids,...require('./neo_v046_pool').ids,...require('./neo_v047_pool').ids,...require('./neo_v048_pool').ids,...require('./neo_v049_pool').ids,...require('./neo_v050_pool').ids,...require('./neo_v051_pool').ids,...require('./neo_v052_pool').ids,...require('./neo_v053_pool').ids,...require('./neo_v054_pool').ids,...require('./neo_v055_pool').ids]).size,'Historical sets through Neo Destiny must be available');
 assert.equal(new Set(all.map(c=>c.id)).size,705+new Set([...require('./neo_genesis_decks').neoIds,...require('./neo_discovery_decks').neoIds,...require('./neo_bonus_pool').ids,...require('./neo_destiny_decks').neoIds,...require('./neo_v040_pool').ids,...require('./neo_v046_pool').ids,...require('./neo_v047_pool').ids,...require('./neo_v048_pool').ids,...require('./neo_v049_pool').ids,...require('./neo_v050_pool').ids,...require('./neo_v051_pool').ids,...require('./neo_v052_pool').ids,...require('./neo_v053_pool').ids,...require('./neo_v054_pool').ids,...require('./neo_v055_pool').ids]).size);
 const gym=all.filter(x=>['gym1','gym2'].includes(x.set));
 assert.equal(gym.length,264);assert.equal(FORMAT.FULL_GYM_IDS.length,264);
 const unlocked=gym.filter(c=>!RETAIL.gymIds.includes(c.id));
 assert.equal(unlocked.length,157,'Preserve known 107 theme-deck cards and open 157 more printings');
 assert.ok(unlocked.some(c=>!c.supported),'Incomplete effects must not be silently marked supported');
 assert.ok(unlocked.some(c=>c.supported),'Fully supported new cards must be highlighted');
 assert.equal(FORMAT.isAllowed('gym2-2',{gym:true}),false,'Curated Gym themes must remain strict');
 assert.equal(FORMAT.isAllowed('gym2-2',{gymFull:true}),true);
 assert.equal(FORMAT.isAllowed('base4-3',{gymFull:true}),true,'Expanded pool must admit all Base Set 2 printings');
 assert.equal(FORMAT.isAllowed('neo1-1',{gymFull:true}),false);
 assert.equal(FORMAT.isAllowed('gym1-22'),false,'Base→Rocket Classic unchanged');
 const labIds=Object.keys(LAB);assert.deepEqual(labIds,['gym_new_garden','gym_new_voltage']);
 for(const id of labIds){const deck=LAB[id];assert.equal(deck.length,60);
  assert.equal(FORMAT.validateDeck(deck,CATALOG,{gymFull:true}).valid,true,`Invalid sample deck ${id}`);
  assert.equal(verify(deck,all).valid,true,`Builder rejects sample deck ${id}`);
  assert.ok(deck.some(cid=>unlocked.some(c=>c.id===cid)),'Sample must contain additional Gym cards');
  for(let seed=1;seed<=4;seed++){
   const newService=new ClassicLocalService();let result=newService.create({deck:id,opponent:'blackout',seed});
   assert.equal(result.format,'gym-expanded');assert.deepEqual(result.counts,[60,60]);
   assert.equal(result.view.players[1].hand,undefined,'Opponent hand must remain hidden');
   const token=result.token;
   let cardIdx=result.view.players[0].hand.findIndex(c=>isBasicPokemon(CATALOG.get(c)));
   result=newService.action(token,{type:'setup_select',payload:{handIndex:cardIdx}},result.revision);
   result=newService.action(token,{type:'setup_confirm',payload:{}},result.revision);
   assert.equal(result.view.phase,'game');assert.deepEqual(result.counts,[60,60]);
   const engIdx=result.view.players[0].hand.findIndex(c=>isEnergy(CATALOG.get(c)));
   if(engIdx!==-1) {result=newService.action(token,{type:'attach_energy',payload:{handIndex:engIdx,slot:-1}},result.revision); assert.deepEqual(result.counts,[60,60]);}
  }
 }
 assert.equal(deckOptions().length,33);
 const generated=service.decklist('gym_new_garden'); assert.equal(generated.length,60);
 assert.throws(()=>service.decklist('custom'),/Unknown/);
 const custom=new ClassicLocalService().create({deck:'custom',opponent:'brushfire',customDeck:LAB.gym_new_voltage,seed:123});
 assert.equal(custom.format,'gym-expanded');assert.deepEqual(custom.counts,[60,60]);
 assert.throws(()=>service.create({deck:'custom',opponent:'blackout',customDeck:LAB.gym_new_voltage.slice(1)}),/exactly 60/);
 assert.throws(()=>service.create({deck:'blackout',opponent:'custom'}),/CPU deck/);
 assert.throws(()=>service.create({deck:'blackout',opponent:'brushfire',customDeck:LAB.gym_new_voltage}),/Unexpected/);
 const forged=[...LAB.gym_new_voltage];forged[0]='basep-1';
 assert.equal(verify(forged,all).valid,false);
 assert.throws(()=>service.create({deck:'custom',opponent:'blackout',customDeck:forged}),/Invalid deck/);
 const tooMany=[...LAB.gym_new_voltage];tooMany[4]='gym2-37';tooMany[5]='gym2-37';tooMany[6]='gym2-37';
 assert.equal(verify(tooMany,all).valid,false,'Duplicates count by name across printed IDs');
 assert.throws(()=>change(LAB.gym_new_voltage,'gym1-73',1,all),/already contains 60/);
 assert.deepEqual(change(['gym1-22'],'gym1-22',-1,all),[]);
 for(const file of ['deck_builder.html','deck_builder.css','deck_builder.js','deck_builder_core.js'])assert.ok(fs.statSync(file).size>100);
 // Exercise actual HTTP APIs, not only service methods.
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port;
 async function request(path,method='GET',body){const result=await fetch(`http://127.0.0.1:${port}${path}`,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:result.status,data:await result.json()};}
 try{
  const pool=await request('/api/classic/card-pool');assert.equal(pool.status,200);assert.equal(pool.data.cards.length,705+new Set([...require('./neo_genesis_decks').neoIds,...require('./neo_discovery_decks').neoIds,...require('./neo_bonus_pool').ids,...require('./neo_destiny_decks').neoIds,...require('./neo_v040_pool').ids,...require('./neo_v046_pool').ids,...require('./neo_v047_pool').ids,...require('./neo_v048_pool').ids,...require('./neo_v049_pool').ids,...require('./neo_v050_pool').ids,...require('./neo_v051_pool').ids,...require('./neo_v052_pool').ids,...require('./neo_v053_pool').ids,...require('./neo_v054_pool').ids,...require('./neo_v055_pool').ids]).size);
  const list=await request('/api/classic/decklist?id=gym_new_voltage');assert.equal(list.status,200);assert.equal(list.data.cards.length,60);
  const invalid=await request('/api/classic/decklist?id=does_not_exist');assert.equal(invalid.status,400);
  const newMatch=await request('/api/classic/create','POST',{deck:'custom',opponent:'blackout',customDeck:LAB.gym_new_garden,seed:678});
  assert.equal(newMatch.status,200,JSON.stringify(newMatch.data));assert.equal(newMatch.data.format,'gym-expanded');
  assert.equal(newMatch.data.view.players[1].hand,undefined);
  const blocked=await request('/api/classic/create','POST',{deck:'custom',opponent:'blackout',customDeck:forged});assert.equal(blocked.status,400);
 }finally{await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
 console.log('PASS expanded Gym pool: 705 indexed cards, 157 additional Gym printings, 2 new legal decks, 8 authoritative duel openings, custom deck legality, old formats preserved, HTTP endpoints, private hands.');
})().catch(err=>{console.error(err);process.exitCode=1;});
