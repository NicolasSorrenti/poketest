'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=__dirname;
const source=fs.readFileSync(root+'/engine.js','utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const el=()=>({classList:{add(){},remove(){}},style:{},textContent:'',querySelectorAll:()=>[]});
const ctx={console,Math:Object.create(Math),document:{getElementById:el,querySelector:()=>null},setTimeout(){},clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(source,ctx);
const R=s=>vm.runInContext(s,ctx);
const sets=['base1','base2','base3','base4','base5','basep','gym1','gym2','neo1','neo2','neo3','neo4'];
const cards=sets.flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,'cards',f+'.json'))));
const energies=['Grass','Water','Fire','Lightning','Psychic','Fighting','Metal','Darkness','Colorless'].map(t=>({id:'test-'+t,name:t+' Energy',supertype:'Energy',subtypes:['Basic']}));
const dummy={id:'dummy46',name:'Practice target',hp:'900',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],attacks:[{name:'Tackle',damage:'20',cost:['Colorless'],text:''},{name:'Other Hit',damage:'30',cost:['Colorless'],text:''}],abilities:[]};
ctx.fixtures=[...cards,...energies,dummy];R('lookup=new Map(fixtures.map(c=>[c.id,c]));render=()=>{};engine.end=()=>{};');
const targets=JSON.parse(fs.readFileSync(root+'/batch46_targets.json'));
const expected=JSON.parse(fs.readFileSync(root+'/attack_coverage.json'));
assert(expected.handled>=1360);assert(expected.unsupported.length<=119);
function prep(cid,name,{heads=true,energyTypes=null,setup='',turn=0}={}){
 const card=cards.find(c=>c.id===cid),index=card?.attacks.findIndex(a=>a.name===name);
 assert(index>=0,`${cid} / ${name}`);
 const costs=(card.attacks[index].cost||[]).map(t=>'test-'+(t==='Colorless'?'Fire':t));
 const attached=energyTypes?energyTypes.map(t=>'test-'+t):[...costs,...costs,'test-Lightning','test-Fire'];
 R(`engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.turn=${turn};engine.round=4;engine.turnSerial=0;engine.over=false;engine.powerSilenceUntilSerial=0;
 engine.players[${turn}].active=unit(${JSON.stringify(cid)});engine.players[${1-turn}].active=unit('dummy46');engine.players[${turn}].active.energies=${JSON.stringify(attached)};
 engine.players[${turn}].bench=[unit('dummy46'),unit('dummy46')];engine.players[${1-turn}].bench=[unit('dummy46'),unit('dummy46')];
 engine.players[${turn}].discard=['test-Fire','test-Lightning','test-Water'];engine.players[${1-turn}].discard=[];
 engine.players[${turn}].hand=['test-Water','test-Lightning'];engine.players[${1-turn}].hand=[];
 engine.players[${turn}].deck=['test-Fire','test-Water','test-Lightning','test-Grass'];engine.players[${1-turn}].deck=Array(12).fill('test-Fire');
 engine.players[0].prizes=Array(6).fill('dummy46');engine.players[1].prizes=Array(6).fill('dummy46');
 deckSearchRequest=null; ${setup}`);
 ctx.Math.random=()=>heads?0.01:0.99;
 return {card,index,attack:(slot=null,choice=null)=>R(`engine.attack(${index},${JSON.stringify(slot)},true,${JSON.stringify(choice)})`)};
}
const appropriateTarget=mode=>mode.startsWith('foeAny')?-1:mode.startsWith('foeBench')||mode.startsWith('ownBench')?1:null;
for(const {card,name,kind,mode} of targets){
 const x=prep(card,name),attack=x.card.attacks[x.index];
 assert.equal(R(`engine.attackPattern(${JSON.stringify(attack)})`),'batch46',`${card}/${name} dispatch`);
 const choice=['terrorize','electricCurrent','plasma','warmUp'].includes(kind)?0:kind==='lightningStrike'?1:null;
 const slot=appropriateTarget(mode);
 // Some attacks require a user selection; a prompt must not mutate battle state.
 if(['plasma','warmUp','electricCurrent','terrorize','lightningStrike'].includes(kind)){
  const before=R('JSON.stringify(engine.players)');
  assert.equal(x.attack(slot),false,`${kind}: request user choice`);
  assert.equal(R('JSON.stringify(engine.players)'),before,`${kind}: choice pending has no gameplay effects`);
  assert(R('deckSearchRequest?.options?.length>0'),`${kind}: options displayed`);
 }
 assert.equal(x.attack(slot,choice),true,`${card}/${name}: executes`);
}
// Switching effects: before versus after damage.
let x=prep('gym1-48','Flytrap');assert.equal(x.attack(),false,'Flytrap requires a valid target');assert(x.attack(1));assert.equal(R('engine.foe.active.damage'),20);assert.equal(R('engine.foe.bench[1].damage'),0);
x=prep('neo4-6','Pull In');assert(x.attack(1));assert.equal(R('engine.foe.active.status'),'Asleep');assert.equal(R('engine.foe.active.damage'),30);
x=prep('neo4-6','Pull In');assert(x.attack(-1));assert.equal(R('engine.foe.active.damage'),30);
x=prep('neo4-17','Entangle');assert(x.attack(1));assert.equal(R('engine.foe.active.status'),'Paralyzed');
x=prep('neo4-17','Entangle',{heads:false});assert(x.attack(1));assert.equal(R('engine.foe.active.status'),null);
x=prep('gym2-5','Dragon Tornado');assert(x.attack(1));assert.equal(R('engine.foe.active.damage'),0);assert.equal(R('engine.foe.bench[1].damage'),40,'Dragon Tornado deals damage BEFORE switch');
x=prep('gym2-5','Dragon Tornado',{setup:'engine.foe.active.damage=870'});assert(x.attack(1));assert.equal(R('engine.foe.bench.length'),1,'Only KO replacement occurs; no extra forced switch');
// Target-only and multi-Pokémon effects.
x=prep('base5-2','Stare',{setup:'lookup.get("dummy46").abilities=[{name:"Test Power",type:"Pokemon Power"}]'});
assert.equal(x.attack(5),false,'Cannot target off-Bench slot');assert(x.attack(1));assert.equal(R('engine.foe.bench[1].damage'),10);assert.equal(R('engine.unitHasPower(engine.foe.bench[1],"Test Power")'),false);R('lookup.get("dummy46").abilities=[]');
x=prep('gym1-38','Lucky Shot');assert(x.attack(0));assert.equal(R('engine.foe.bench[0].damage'),30);
x=prep('gym1-38','Lucky Shot',{heads:false});assert(x.attack(0));assert.equal(R('engine.foe.bench[0].damage'),0);
x=prep('neo4-11','Fling Away');assert(x.attack(1));assert.equal(R('engine.foe.active.damage'),30);assert.equal(R('engine.foe.bench[1].damage'),30);
x=prep('neo4-11','Fling Away',{setup:'engine.foe.bench=[]'});assert(x.attack());assert.equal(R('engine.foe.active.damage'),50);
x=prep('neo4-17','Entangle',{setup:'engine.foe.bench=[]'});assert.equal(x.attack(),false,'Mandatory Bench target');
// Optional setup effects and owner-selected targets.
x=prep('gym2-78','Sludge Grip');assert(x.attack(1));assert.equal(R('engine.foe.active.poison'),true);assert.equal(R('engine.foe.active.damage'),10);
x=prep('gym2-78','Sludge Grip',{heads:false});assert(x.attack(1));assert.equal(R('engine.foe.active.poison'),false);assert.equal(R('engine.foe.active.damage'),10);
x=prep('basep-17','Tempt');assert(x.attack(1));assert.equal(R('engine.foe.active.damage'),0);assert.equal(R('engine.foe.bench[1].damage'),0);
x=prep('gym2-24','Overhead Toss',{heads:false});assert(x.attack(1));assert.equal(R('engine.foe.active.damage'),40);assert.equal(R('engine.me.bench[1].damage'),20);
x=prep('neo3-38','Overhead Toss',{heads:false});assert(x.attack(1,0));assert.equal(R('engine.me.bench[1].damage'),10);
x=prep('neo4-52','Wash Away',{setup:'engine.me.bench[1].damage=60;engine.me.bench[1].energies=["test-Fire","test-Water"]'});assert(x.attack(1));assert.equal(R('engine.me.bench[1].damage'),0);assert.equal(R('engine.me.bench[1].energies.length'),0);
x=prep('neo4-52','Wash Away',{heads:false,setup:'engine.me.bench[1].damage=60'});assert(x.attack(1));assert.equal(R('engine.me.bench[1].damage'),60);
// Energy choices must not be arbitrary when the player has multiple candidates.
x=prep('gym1-27','Electric Current',{energyTypes:['Lightning','Lightning','Fire']});
assert.equal(x.attack(0),false);assert(x.attack(0,1));assert.equal(R('engine.me.bench[0].energies[0]'),'test-Lightning');assert.equal(R('engine.me.active.energies.length'),2);
x=prep('neo1-34','Electric Current',{energyTypes:['Lightning','Lightning','Water']});
assert.equal(x.attack(0),false);assert(x.attack(0,2));assert.equal(R('engine.me.bench[0].energies[0]'),'test-Water');
x=prep('neo3-10','Plasma',{setup:'engine.me.discard=["test-Water","test-Fire"]'});assert.equal(x.attack(),false);assert(x.attack(null,1));assert(R('engine.me.active.energies.includes("test-Fire")'));
x=prep('neo4-46','Warm Up',{setup:'engine.me.deck=["test-Fire","test-Water","test-Lightning"]'});assert.equal(x.attack(1),false);assert(x.attack(1,1));assert.equal(R('engine.me.bench[1].energies[0]'),'test-Water');
x=prep('neo1-39','Baton Pass',{setup:'engine.me.active.energies=["test-Grass","test-Grass"]'});assert(x.attack(1));assert.equal(R('engine.me.active.energies.length'),2);assert.equal(R('engine.me.bench[1].energies.length'),0);assert.equal(R('engine.me.bench[1].id'),'neo1-39');
// Attack lock and optional-damage Energy discard.
x=prep('neo3-38','Terrorize');assert.equal(x.attack(null),false);assert(x.attack(null,1));assert.equal(R('engine.foe.active.attackLocks[0].name'),'Other Hit');
x=prep('neo3-21','Lightning Strike',{energyTypes:['Lightning','Lightning','Lightning']});assert.equal(x.attack(null),false);assert(x.attack(null,0));assert.equal(R('engine.foe.active.damage'),40);assert.equal(R('engine.me.active.energies.length'),3);
x=prep('neo3-21','Lightning Strike',{energyTypes:['Lightning','Lightning','Lightning']});assert(x.attack(null,1));assert.equal(R('engine.foe.active.damage'),80);assert.equal(R('engine.me.active.energies.length'),0);
// Special choices and empty-Bench cases do not prevent attacks that can do nothing.
x=prep('neo1-39','Baton Pass',{setup:'engine.me.bench=[]'});assert(x.attack());assert.equal(R('engine.foe.active.damage'),30);
x=prep('neo4-52','Wash Away',{setup:'engine.me.bench=[]'});assert(x.attack());
x=prep('neo4-46','Warm Up',{setup:'engine.me.bench=[]'});assert(x.attack());
x=prep('gym1-27','Electric Current',{energyTypes:['Lightning','Lightning'],setup:'engine.me.bench=[]'});assert(x.attack(null,0));assert.equal(R('engine.me.discard.filter(id=>id==="test-Lightning").length'),2);
x=prep('neo3-38','Terrorize');assert(x.attack(null,1));R('engine.turn=1;engine.players[1].active.energies=["test-Fire"]');assert.equal(R('engine.attack(1,null,true)'),false,'Terrorize prevents selected attack');
x=prep('base5-19','Stare',{setup:'lookup.get("dummy46").abilities=[{name:"Test Power",type:"Pokemon Power"}]'});assert(x.attack(-1));assert.equal(R('engine.unitHasPower(engine.foe.active,"Test Power")'),false);R('engine.turnSerial=2');assert.equal(R('engine.unitHasPower(engine.foe.active,"Test Power")'),true,'Stare expires after opponent turn');R('lookup.get("dummy46").abilities=[]');
// Limited next-turn Retreat Cost modifier, with complete Energy payment.
x=prep('neo4-62','Tentacle Wrap',{heads:false});assert(x.attack());assert.equal(R('engine.foe.active.extraRetreatCost'),1);R('lookup.get("dummy46").retreatCost=["Colorless","Colorless"];engine.turn=1;engine.turnSerial=1;engine.players[1].active.energies=["test-Fire","test-Fire"]');assert.equal(R('engine.retreat(0)'),false,'2 Energy no longer pays 3 Retreat Cost');R('engine.players[1].active.energies.push("test-Water")');assert.equal(R('engine.retreat(0)'),true);
x=prep('neo4-62','Tentacle Wrap',{heads:true});assert(x.attack());assert.equal(R('engine.foe.active.status'),'Paralyzed');
console.log(`PASS v0.4.6: ${targets.length} exact card-attack records; interactive choices, typed Energy, Bench targeting, switches, status, and timing`);
