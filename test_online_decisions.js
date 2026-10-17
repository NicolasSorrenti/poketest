'use strict';
const assert=require('node:assert/strict');
const {ClassicOnlineService}=require('./classic_online_service');
const {CATALOG}=require('./headless_duel');
const {isBasicPokemon,countCards}=require('./core_rules');
const svc=new ClassicOnlineService();
const host=svc.create({deck:'rocket_lab',name:'Host'});
const guest=svc.join({code:host.code,deck:'brushfire',name:'Friend'});
svc.ready(host.code,host.token,{ready:true,revision:guest.revision});
svc.ready(host.code,guest.token,{ready:true,revision:guest.revision+1});
svc.start(host.code,host.token,{revision:guest.revision+2});
for(const [side,token] of [[0,host.token],[1,guest.token]]){
 let r=svc.state(host.code,token),i=r.view.players[side].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
 assert.ok(i>=0);r=svc.action(host.code,token,{revision:r.revision,command:{type:'setup_select',payload:{handIndex:i}}});
 svc.action(host.code,token,{revision:r.revision,command:{type:'setup_confirm'}});
}
const room=svc.rooms.get(host.code),player=room.game.players[0];
// Inject Challenge! into a prepared fixture, without changing card conservation.
player.hand[0]='base5-74';
let r=svc.state(host.code,host.token);
r=svc.action(host.code,host.token,{revision:r.revision,command:{type:'play_trainer',payload:{handIndex:0}}});
assert.ok(r.view.pendingDecision,'Challenge must prompt opponent');
assert.equal(r.view.pendingDecision.actor,undefined,'Host must not see private opponent choice');
const other=svc.state(host.code,guest.token);
assert.equal(other.view.pendingDecision.actor,1);
assert.equal(other.view.pendingDecision.options.length,2);
assert.equal(other.view.pendingDecision.options[0].id,'accept:0');
const stale=svc.action.bind(svc,host.code,host.token);
assert.throws(()=>stale({revision:r.revision,command:{type:'choose',payload:{decisionId:other.view.pendingDecision.id,selected:['accept:1']}}}),/Decision belongs/);
const declined=svc.action(host.code,guest.token,{revision:other.revision,command:{type:'choose',payload:{decisionId:other.view.pendingDecision.id,selected:['accept:0']}}});
assert.equal(declined.view.pendingDecision,null);
assert.equal(declined.view.turn,0,'Turn stays with host after guest response');
assert.deepEqual(declined.counts,[60,60]);
assert.equal(svc.state(host.code,host.token).view.players[1].hand,undefined);
console.log('PASS Online reactive decisions: guest chooses during host turn; protected options, wrong-actor rejection, game resumes, 60 cards preserved');
