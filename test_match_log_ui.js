'use strict';
const assert=require('node:assert/strict');
const shared=require('./duel_quick_ui');
const log=require('./match_log_ui');
const cards={pikachu:{name:'Pikachu'},potion:{name:'Potion'}};
const getCard=id=>cards[id]||{name:String(id)};
const history=log.entries([
 {seq:4,side:1,type:'attack',label:'Thunder Jolt',cardId:'pikachu'},
 {seq:2,side:0,type:'play_trainer',cardId:'potion'},
 {seq:3,side:0,type:'attach_energy',cardId:'pikachu'}
],getCard,'CPU');
assert.deepEqual(history.map(x=>x.seq),[2,3,4]);
assert.match(history[0].text,/You/);
assert.match(history[0].text,/Potion/);
assert.match(history[2].text,/CPU/);
assert.match(history[2].text,/Thunder Jolt/);
assert.equal(history.length,3);
console.log('Match log action history tests passed');
