'use strict';
const assert = require('node:assert/strict');
const fs=require('node:fs');
const {normalizeCard}=require('./tcgdex_adapter');
const {CATALOG}=require('./headless_duel');
const {canEvolve}=require('./core_rules');
const {ClassicOnlineService}=require('./classic_online_service');

const chinchou=CATALOG.get('neo1-55'),lanturn=CATALOG.get('neo1-38');
assert.equal(lanturn.evolvesFrom,'Chinchou','Neo Genesis Lanturn must have its printed Evolution ancestry');
assert.ok(canEvolve(lanturn,chinchou));
assert.ok(canEvolve(lanturn,CATALOG.get('neo3-42')),'Another printing of Chinchou should evolve');
assert.ok(canEvolve(CATALOG.get('neo3-32'),chinchou),'Neo Revelation Lanturn should evolve');
assert.equal(canEvolve(lanturn,CATALOG.get('neo1-80')),false);
assert.ok(canEvolve(CATALOG.get('gym1-8'),CATALOG.get('gym1-50')),'Lt. Surge Magneton metadata corrected');
for(const [id,evolvesFrom] of [['neo1-38','Chinchou'],['gym1-8',"Lt. Surge's Magnemite"]]){
 const source=CATALOG.get(id);
 // TCGdex omission must not be reintroduced by `npm run cards`.
 const decoded=normalizeCard({id,name:source.name,category:'Pokemon',stage:'Stage1',hp:source.hp,attacks:source.attacks,abilities:source.abilities});
 assert.equal(decoded.evolvesFrom,evolvesFrom);
}

// Test the actual multiplayer room and reducer, not only the helper.
const online=new ClassicOnlineService();
const host=online.create({deck:'cold_fusion',name:'Host'});
const guest=online.join({code:host.code,deck:'cold_fusion',name:'Guest'});
const state=t=>online.state(host.code,t);
const cmd=(t,type,payload={})=>online.action(host.code,t,{revision:state(t).revision,command:{type,payload}});
let st=state(host.token);online.ready(host.code,host.token,{ready:true,revision:st.revision});
st=state(guest.token);online.ready(host.code,guest.token,{ready:true,revision:st.revision});
st=state(host.token);online.start(host.code,host.token,{revision:st.revision});
const room=online.findRoom(host.code);
// Swap a given card into the seven-card opening hand or into the regular hand,
// never changing the number of physical cards in the duel.
function moveToHand(player,id){
 let idx=player.hand.indexOf(id);
 if(idx>=0)return idx;
 for(const zone of ['deck','prizes']){
  idx=player[zone].indexOf(id);
  if(idx>=0){const replaced=player.hand[0];player.hand[0]=player[zone][idx];player[zone][idx]=replaced;return 0;}
 }
 throw Error('Missing '+id);
}
for(const [side,token] of [[0,host.token],[1,guest.token]]){
 const p=room.game.players[side];
 const idx=moveToHand(p,'neo1-55');
 cmd(token,'setup_select',{handIndex:idx});
 cmd(token,'setup_confirm');
}
assert.equal(room.game.phase,'game');
for(const p of room.game.players) assert.equal(p.active.id,'neo1-55');
for(const p of room.game.players)moveToHand(p,'neo1-38');
const tryEvolve=(token)=>cmd(token,'evolve',{handIndex:room.game.players[token===host.token?0:1].hand.indexOf('neo1-38'),slot:-1});
let originalRevision=room.revision;
assert.throws(()=>tryEvolve(host.token),/Illegal evolution/);
assert.equal(room.revision,originalRevision,'Rejected first-turn evolution must not advance room state');
assert.equal(room.game.players[0].active.id,'neo1-55');
cmd(host.token,'end_turn');
originalRevision=room.revision;
assert.throws(()=>tryEvolve(guest.token),/Illegal evolution/);
assert.equal(room.revision,originalRevision);
cmd(guest.token,'end_turn');
assert.equal(room.game.round,2);
for(const [side,token] of [[0,host.token],[1,guest.token]]){
 if(side===1)cmd(host.token,'end_turn');
 const rev=state(token).revision;
 const after=tryEvolve(token);
 assert.equal(after.revision,rev+1);
 assert.equal(room.game.players[side].active.id,'neo1-38');
 assert.equal(room.game.players[side].active.under[0],'neo1-55');
 assert.deepEqual(after.counts,[60,60]);
 assert.equal(after.view.players[1-side].hand,undefined,'Opponent hand must stay private');
}
for(const page of ['online.js','classic_live.js']){
 const code=fs.readFileSync(__dirname+'/'+page,'utf8');
 assert.match(code,/c\.supertype==='Pokémon'&&c\.evolvesFrom/);
}
console.log('PASS v0.26 Chinchou → Lanturn: corrected import metadata, both player seats, first turn forbidden, second turn allowed, source retained, privacy and 60 cards');
