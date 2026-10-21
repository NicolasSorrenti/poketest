'use strict';
const assert=require('node:assert/strict');
const ux=require('./duel_experience_ui');
const cardId={en:{supertype:'Energy',name:'Fire Energy'},ba:{supertype:'Pokémon',name:'Charmander',subtypes:['Basic']},ev:{supertype:'Pokémon',name:'Charmeleon',subtypes:['Stage 1']}};
const card=id=>cardId[id]||{};
assert.match(ux.vitals({damage:40,status:'Asleep',poison:true},{hp:'60'}),/20 \/ 60 HP/);
assert.match(ux.vitals({damage:40,status:'Asleep',poison:true},{hp:60}),/Asleep/);
assert.match(ux.vitals({damage:40,status:'Asleep',poison:true},{hp:60}),/Poisoned/);
assert.match(ux.vitals({damage:60},{hp:60}),/width:0%/);
assert.match(ux.vitals({damage:-40},{hp:60}),/width:100%/);
assert.equal(ux.vitals({damage:0},{hp:'not specified'}),'');
assert.equal(ux.handType(cardId.en),'Energy');assert.equal(ux.handType(cardId.ev),'Evolution');
const you={bench:[{id:'ba'}],hand:['en','ba','ev']},opponent={bench:[],hand:[]};
const base={phase:'game',over:false,turn:0,players:[you,opponent],pendingDecision:null};
let guide=ux.guide({view:base,card,energyUsed:false});
assert.equal(guide.kind,'turn');assert.doesNotMatch(guide.tip,/Energy/);
assert.equal(guide.chips[0].label,'Bench 1/5');
assert.ok(!guide.chips.some(chip=>/Energy/i.test(chip.label)),'No permanent Energy turn badge');
guide=ux.guide({view:base,card,energyUsed:true});assert.equal(guide.chips[0].label,'Bench 1/5');assert.match(guide.tip,/Basic Pokémon/);
assert.equal(ux.guide({view:{...base,turn:1},me:0,card}).kind,'waiting');
assert.equal(ux.guide({view:{...base,phase:'setup'},me:0,card}).kind,'setup');
assert.equal(ux.guide({view:{...base,pendingDecision:{actor:0}},me:0,card}).kind,'decision');
assert.equal(ux.guide({view:{...base,pendingDecision:{actor:1}},me:0,card}).kind,'waiting');
assert.equal(ux.guide({view:base,me:0,targetMode:{title:'Attach Energy'},card}).kind,'targeting');
assert.equal(ux.guide({view:{...base,over:true},me:0,card}).kind,'complete');
assert.equal(ux.guide({view:{...base,turn:1},me:1,card}).kind,'turn','online guest sees their own turn');
const fs=require('node:fs');
for(const page of ['classic_live.html','online.html']){
 const html=fs.readFileSync(__dirname+'/'+page,'utf8');assert.match(html,/id="turnCoach"/);assert.match(html,/duel_experience_ui\.js/);
}
const shared=fs.readFileSync(__dirname+'/duel_shared_components.js','utf8');
assert.match(shared,/class="attack-effect"/,'Attacks are presented by the common renderer');
for(const page of ['classic_live.js','online.js']){
 const js=fs.readFileSync(__dirname+'/'+page,'utf8');assert.match(js,/vitals:ux\.vitals/);assert.match(js,/ux\.renderGuide\(/);assert.match(js,/shared\.renderAttacks\(/);
}
console.log('PASS v0.35 HP, statuses, hand types, turn coaching both seats and visible attacks');
