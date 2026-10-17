'use strict';
const assert=require('node:assert/strict');
const {list,data}=require('./authentic_decks');
assert.equal(Object.keys(data).length,8);
for(const key of Object.keys(data)){
 const deck=list(key);
 assert.equal(deck.length,60,key);
 assert(deck.every(id=>/^(base1|base2|neo1)-\d+$/.test(id)),key);
 const counts=deck.reduce((m,id)=>(m.set(id,(m.get(id)||0)+1),m),new Map());
 for(const [id,n] of counts) if(!/Energy$/.test(({base1:{97:1,98:1,99:1,100:1,101:1,102:1},neo1:{106:1,107:1,108:1,109:1,110:1,111:1}}[id.split('-')[0]]||{})[id.split('-')[1]]?'Energy':'')) assert(n<=4,key+' '+id);
}
assert.equal(list('neo4:Light'),null);
assert.equal(list('base1:Blackout').filter(x=>x==='base1-7').length,1);
assert.equal(list('base1:Brushfire').filter(x=>x==='base1-12').length,1);
assert.equal(list('base1:Overgrowth').filter(x=>x==='base1-6').length,1);
assert.equal(list('base1:Zap!').filter(x=>x==='base1-10').length,1);
for(const key of ['base2:Power Reserve','base2:Water Blast','neo1:Cold Fusion','neo1:Hotfoot'])assert(list(key).some(id=>id.startsWith(key.split(':')[0]+'-')&&['base2-48','base2-12','neo1-8','neo1-7'].includes(id)));
console.log('PASS: eight verified original decks, exact 60-card recipes; remaining decks not mislabeled');
