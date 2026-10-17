'use strict';
const assert=require('node:assert/strict');
const {ClassicOnlineService}=require('./classic_online_service');
const {deckOptions}=require('./classic_local_service');
const presets=deckOptions().filter(x=>x.id!=='custom');
const rooms=new ClassicOnlineService({maxRooms:64});
for(let i=0;i<presets.length;i++){
 const host=rooms.create({deck:presets[i].id,name:'Host'});
 const guest=rooms.join({code:host.code,deck:presets[(i+11)%presets.length].id,name:'Guest'});
 rooms.ready(host.code,host.token,{ready:true,revision:guest.revision});
 rooms.ready(host.code,guest.token,{ready:true,revision:guest.revision+1});
 const started=rooms.start(host.code,host.token,{revision:guest.revision+2});
 assert.deepEqual(started.counts,[60,60],presets[i].id);
 assert.equal(started.view.players[1].hand,undefined);
 assert.equal(rooms.state(host.code,guest.token).view.players[0].hand,undefined);
}
console.log(`PASS Online mixed-deck matrix: ${presets.length} human-vs-human starts, every theme deck, mixed expansions, private hands, 60-card conservation`);
