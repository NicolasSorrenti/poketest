'use strict';
const assert=require('node:assert/strict');
const {ClassicOnlineService}=require('./classic_online_service');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon}=require('./core_rules');
let clock=100000;
const online=new ClassicOnlineService({now:()=>clock});
const host=online.create({deck:'brushfire',name:'Alice'});
const guest=online.join({code:host.code,deck:'blackout',name:'Bob'});
const code=host.code;
const call=(token,command)=>online.action(code,token,{revision:online.state(code,token).revision,command});
let state=online.state(code,host.token);
state=online.ready(code,host.token,{ready:true,revision:state.revision});
state=online.ready(code,guest.token,{ready:true,revision:state.revision});
state=online.start(code,host.token,{revision:state.revision});
assert.equal(state.view.phase,'setup');
const room=online.findRoom(code);
for(const [side,token] of [[0,host.token],[1,guest.token]]){
 const p=room.game.players[side];let idx=p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
 assert.ok(idx>=0,'Theme deck should contain opening Basic');
 call(token,{type:'setup_select',payload:{handIndex:idx}});
 call(token,{type:'setup_confirm',payload:{}});
}
if(room.game.mulliganBonus){
 const side=room.game.mulliganBonus.side;
 call(side===0?host.token:guest.token,{type:'setup_bonus_draw',payload:{count:0}});
}
assert.equal(room.game.phase,'game');
function energyToHand(side){
 const p=room.game.players[side];
 let idx=p.hand.findIndex(id=>CATALOG.get(id)?.supertype==='Energy');
 if(idx<0){const j=p.deck.findIndex(id=>CATALOG.get(id)?.supertype==='Energy');assert.ok(j>=0);p.hand.push(...p.deck.splice(j,1));idx=p.hand.length-1;}
 return idx;
}
for(const [side,token] of [[0,host.token],[1,guest.token]]){
 if(side===1)call(host.token,{type:'end_turn',payload:{}});
 const energyIndex=energyToHand(side),player=room.game.players[side];
 const prior=player.active.id,energyId=player.hand[energyIndex],priorCount=player.active.energies.length,oldQuantity=player.hand.filter(x=>x===energyId).length;
 const before=online.state(code,token).revision;
 const action=call(token,{type:'attach_energy',payload:{handIndex:energyIndex,slot:-1}});
 assert.equal(action.revision,before+1);
 assert.equal(action.view.players[side].active.id,prior,'Active must never vanish when Energy is attached');
 assert.equal(action.view.players[side].active.energies.length,priorCount+1);
 assert.equal(action.view.players[side].active.energies.at(-1),energyId);
 assert.equal(action.view.players[side].hand.filter(x=>x===energyId).length,oldQuantity-1);
 assert.deepEqual(action.counts,[60,60]);
 assert.equal(online.state(code,side===0?guest.token:host.token).view.players[side].active.id,prior);
 assert.equal(action.view.players[1-side].hand,undefined,'Opponent hand must remain private');
}
// Room chat is separate from the duel revision, so it cannot cancel selected Energy targeting.
const beforeChat=room.revision;
clock+=1000;
let chat=online.chatMessage(code,host.token,{text:'Hi! <script>alert(1)</script>'});
assert.equal(chat.chatSeq,1);assert.equal(room.revision,beforeChat);
assert.equal(online.state(code,guest.token).chatMessages[0].text,'Hi! <script>alert(1)</script>');
assert.equal(chat.chatMessages[0].player,0);
assert.throws(()=>online.chatMessage(code,host.token,{text:'spam'}),/wait/i);
clock+=1000;
chat=online.chatMessage(code,guest.token,{text:'Ready to duel!'});
assert.equal(chat.chatSeq,2);assert.equal(room.revision,beforeChat);
assert.throws(()=>online.chatMessage(code,'fake',{text:'hacker'}),/Unauthorized/);
assert.throws(()=>online.chatMessage(code,guest.token,{text:' '.repeat(400)}),/Chat message/);
assert.throws(()=>online.chatMessage(code,guest.token,{text:'X'.repeat(351)}),/Chat message/);
const stranger=online.create({deck:'brushfire'});
assert.equal(online.state(stranger.code,stranger.token).chatMessages.length,0);
for(let i=0;i<85;i++){
 clock+=1000;online.chatMessage(code,host.token,{text:'msg '+i});
}
assert.equal(room.chat.length,80,'Bounded chat history prevents memory growth');
assert.equal(room.chat.at(-1).text,'msg 84');
assert.equal(room.chat[0].id,8);
// Guard against the name collision that caused TypeError: side is not a function.
const js=require('node:fs').readFileSync(__dirname+'/online.js','utf8');
assert.match(js,/function pokemonNode\(u,ownerRelative,slot\)/);
assert.doesNotMatch(js,/function pokemonNode\(u,side,slot\)/);
assert.match(js,/current\.view\.players\[side\(\)\]\.hand/);
const sharedZone=require('node:fs').readFileSync(__dirname+'/duel_shared_components.js','utf8');
assert.match(js,/shared\.renderZone\(/,'Online controller delegates field drawing to shared renderer');
assert.match(sharedZone,/root\.replaceChildren\(createPokemon\(team\.active,-1\)\)/,'Active Pokémon must be replaced atomically');
assert.match(sharedZone,/root\.replaceChildren\(\.\.\.bench\.map/,'Bench updates must be atomic');
assert.match(js,/content\.textContent=m\.text/,'Chat message must never be inserted as HTML');
console.log('PASS v0.26: two-player Energy attachments, unchanged Active Pokémon, complete card conservation, private hands, chat security/rate limiting, no chat revision conflicts, DOM regression guard');
