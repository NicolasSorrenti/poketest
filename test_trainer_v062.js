'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=fs.readdirSync(__dirname+'/cards').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(__dirname+'/cards/'+f)));
const source=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const ctx={Math,console,window:{},document:{getElementById:()=>({classList:{add(){},remove(){}},style:{},appendChild(){},querySelectorAll(){return []}}),querySelector:()=>null},setTimeout(){},clearTimeout(){},innerWidth:1600};
vm.createContext(ctx);vm.runInContext(source,ctx);
for(const file of ['trainer_rules_v058.js','trainer_rules_v059.js','trainer_rules_v060.js','trainer_rules_v061.js','trainer_rules_v062.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const run=x=>vm.runInContext(x,ctx);
let tests=0;function t(name,fn){try{fn();tests++}catch(e){console.error('FAIL',name);throw e}}
function prep(cardId='base3-33',foeId='base1-58'){
 ctx.fixtures=data;
 run(`lookup=new Map(fixtures.map(c=>[c.id,c]));render=()=>{};battlefieldAttack=()=>{};
 engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.over=false;engine.started=true;engine.turn=0;engine.round=4;engine.turnSerial=9;
 engine.players[0].active=unit('${cardId}');engine.players[1].active=unit('${foeId}');
 engine.players[0].bench=[];engine.players[1].bench=[];
 engine.players[0].deck=Array(10).fill('base1-97');engine.players[1].deck=Array(10).fill('base1-97');
 engine.players[0].prizes=Array(6).fill('base1-97');engine.players[1].prizes=Array(6).fill('base1-97');
 deckSearchRequest=null;engine.stadium=null;engine.end=()=>{};`);
 return run('engine');
}
t('Without Pokémon Tower Gastly recovers discarded Energy cards to hand',()=>{
 const g=prep();g.me.active.energies=['base1-101','base1-101'];g.me.discard=['base1-101','base1-100'];
 assert.equal(g.attack(1,null,true),true);assert.equal(g.me.hand.length,2);assert.equal(g.me.discard.length,0);
});
t('Pokémon Tower blocks Gastly recovering discarded Energy cards',()=>{
 const g=prep();g.me.active.energies=['base1-101','base1-101'];g.me.discard=['base1-101','base1-100'];g.stadium={id:'basep-42',owner:0};
 assert.equal(g.attack(1,null,true),true);assert.equal(g.me.hand.length,0);assert.equal(g.me.discard.length,2);
 assert.equal(g.me.active.damage,10,'attack recoil still takes effect');
});
t('Pokémon Tower blocks Scavenge returning Trainer without preventing attack cost',()=>{
 const g=prep('base3-55');g.me.active.energies=['base1-101','base1-101'];g.me.discard=['base1-91'];g.stadium={id:'basep-42',owner:0};
 assert.equal(g.attack(1,null,true),true);assert.equal(g.me.hand.includes('base1-91'),false);
 assert.equal(g.me.discard.filter(x=>x==='base1-91').length,1);
 assert.equal(g.me.active.energies.length,1,'attacking Energy cost still paid');
});
t('Pokémon Tower applies to attack recovery on either side of battlefield',()=>{
 const g=prep('base3-33');g.turn=1;g.me.active=run("unit('base3-33')");g.me.active.energies=['base1-101','base1-101'];g.me.discard=['base1-101'];g.stadium={id:'basep-42',owner:0};
 assert.equal(g.attack(1,null,true),true);assert.equal(g.me.hand.length,0);assert.equal(g.me.discard.length,1);
});
t('Once Pokémon Tower is gone, discard recovery becomes legal again',()=>{
 const g=prep();g.me.active.energies=['base1-101','base1-101'];g.me.discard=['base1-101'];g.stadium={id:'basep-42',owner:0};
 assert.equal(g.attack(1,null,true),true);assert.equal(g.me.hand.length,0);
 g.stadium=null;g.me.discard=['base1-101'];assert.equal(g.attack(1,null,true),true);assert.equal(g.me.hand.length,1);
});
t('Pokémon Tower prevents Rebirth returning a knocked-out Moltres to hand',()=>{
 const g=prep('gym1-12');g.me.bench=[run("unit('base1-58')")];g.me.active.damage=200;
 g.stadium={id:'basep-42',owner:0};
 g.resolveKO();assert.equal(g.players[0].hand.includes('gym1-12'),false);
 assert.equal(g.players[0].discard.includes('gym1-12'),true);
});
t('Rebirth returns knocked-out Moltres to hand when Tower is absent',()=>{
 const g=prep('gym1-12');g.me.bench=[run("unit('base1-58')")];g.me.active.damage=200;
 g.resolveKO();assert.equal(g.players[0].hand.includes('gym1-12'),true);
});
t('Pokémon Tower blocks Dark Slowbro Reel In after deferred choice',()=>{
 const g=prep('base5-12');g.me.discard=['base1-58','base1-35'];g.stadium={id:'basep-42',owner:0};
 g.onPlayEvolution(g.me.active,run("lookup.get('base5-12')"));
 const prompt=run('deckSearchRequest');assert.ok(prompt&&prompt.multi);
 assert.equal(prompt.execute([0,1]),true);
 assert.equal(g.me.hand.includes('base1-58'),false);
 assert.equal(g.me.hand.includes('base1-35'),false);
 assert.equal(g.me.discard.length,2);
});
t('Dark Slowbro Reel In recovers cards without Tower',()=>{
 const g=prep('base5-12');g.me.discard=['base1-58'];
 g.onPlayEvolution(g.me.active,run("lookup.get('base5-12')"));
 const prompt=run('deckSearchRequest');assert.ok(prompt);assert.equal(prompt.execute([0]),true);
 assert.equal(g.me.hand.includes('base1-58'),true);
});
t('Johto quiz lengths are resolved for the entire first 251 species',()=>{
 const g=prep();assert.equal(run("trainer59Height(lookup.get('neo1-4'))"),2.3);
 assert.equal(run("trainer59Height(lookup.get('neo4-1'))"),1.4);
 assert.equal(run("trainer59Height(lookup.get('base1-1'))"),1.5);
 assert.equal(run("trainer59Height(lookup.get('basep-52'))"),3.8);
 assert.equal(run("trainer59Height(lookup.get('basep-25'))"),0.4);
});
t('Blaine Quiz #1 only offers valid Pokémon, excluding misclassified Energy and Fossil',()=>{
 const g=prep();g.me.hand=['gym1-97','neo1-4','base1-97','base3-62','base1-70'];
 assert.equal(g.trainer59(0),null);
 const options=run('deckSearchRequest.options');assert.equal(options.length,1);
 assert.equal(options[0].id,'neo1-4');
});
t('Secret Plan reveals an Energy card pulled Active by Gust of Wind',()=>{
 const g=prep();g.me.hand=['base1-93'];
 const facedown=run("unit('base1-98')");facedown.secretPlanFaceDown=true;
 g.foe.bench=[facedown];const originalActive=g.foe.active;
 assert.equal(g.trainer(0,0),true);
 assert.equal(facedown.secretPlanFaceDown,false);
 assert.ok(g.foe.discard.includes('base1-98'));
 assert.equal(g.foe.active,originalActive,'previously Active Basic returns when the face-down Energy is revealed');
});
t('Unchanged Secret Plan Bench cards remain hidden during unrelated Trainer plays',()=>{
 const g=prep();g.me.hand=['base1-91'];const hidden=run("unit('base1-98')");hidden.secretPlanFaceDown=true;
 g.foe.bench=[hidden];
 assert.equal(g.trainer(0),true);
 assert.equal(hidden.secretPlanFaceDown,true);
});
console.log('PASS v0.6.2:',tests,'Pokémon Tower cross-card scenarios');
