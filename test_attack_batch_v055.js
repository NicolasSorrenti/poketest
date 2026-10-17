'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const el=()=>({classList:{add(){},remove(){}},style:{},querySelectorAll:()=>[]});
const ctx={console,Math:Object.create(Math),document:{getElementById:el,querySelector:()=>null},setTimeout(){},clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(src,ctx);const run=s=>vm.runInContext(s,ctx);
const base=['base1','base2','base3','base4','base5','basep','gym1','gym2','neo1','neo2','neo3','neo4'].flatMap(x=>require('./cards/'+x+'.json'));
const extras=['Water','Fire','Lightning','Psychic','Fighting','Grass','Darkness','Metal'].map(t=>({id:'v55-'+t,name:t+' Energy',supertype:'Energy',subtypes:[],attacks:[],abilities:[]}));
extras.push({id:'v55-training',name:'Training Target',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],hp:'600',attacks:[{name:'Tackle',cost:['Colorless'],damage:'10',text:''}],abilities:[],weaknesses:[],resistances:[],retreatCost:[]});
ctx.cardData=[...base,...extras];run('cards=cardData;lookup=new Map(cards.map(c=>[c.id,c]));render=()=>{};engine.end=()=>{};battlefieldAttack=()=>{};queuePrizeFX=()=>{};');
let checks=0;
function setup(id,name,options={}){
 const card=base.find(c=>c.id===id),index=card?.attacks?.findIndex(a=>a.name===name);
 assert(index>=0,`Missing ${id} ${name}`);
 const ids=card.attacks[index].cost.map(x=>'v55-'+(x==='Colorless'?'Water':x));
 run(`engine.players=[statePlayer('You',[]),statePlayer('CPU',[])];engine.turn=${options.side||0};engine.phase='game';engine.round=8;engine.turnSerial=12;engine.over=false;engine.pending55=null;engine.stadium=null;engine.players[engine.turn].active=unit('${id}');engine.players[engine.turn].active.energies=${JSON.stringify(ids)};engine.players[engine.turn].bench=[unit('v55-training')];engine.players[1-engine.turn].active=unit('v55-training');engine.players[1-engine.turn].bench=[unit('v55-training')];engine.players[0].prizes=['v55-training','v55-training'];engine.players[1].prizes=['v55-training','v55-training'];deckSearchRequest=null;${options.extra||''}`);
 ctx.Math.random=()=>options.heads===false?.99:.01;
 assert.equal(run(`engine.attackPattern(engine.card(engine.me.active).attacks[${index}])`),'batch55',`Pattern for ${name}`);checks++;
 return (choice=null)=>run(`engine.attack(${index},null,true,${JSON.stringify(choice)})`);
}
const eq=(expr,val,msg)=>assert.equal(run(expr),val,msg);
let a=setup('basep-24','Birthday Surprise');assert(a());eq('engine.foe.active.damage',30);
a=setup('basep-24','Birthday Surprise',{extra:'engine.me.isBirthday=true;'});assert(a());eq('engine.foe.active.damage',80);
a=setup('basep-24','Birthday Surprise',{extra:'engine.me.isBirthday=true;',heads:false});assert(a());eq('engine.foe.active.damage',30);
a=setup('basep-32','Paint');assert.equal(a(),false);eq('engine.foe.active.coloringType',undefined);assert.equal(a(999),false);assert(a(0));eq('engine.foe.active.coloringType','Grass');
a=setup('basep-32','Paint',{heads:false});assert(a());eq('engine.foe.active.coloringType',undefined);
a=setup('basep-15','Texture Magic',{extra:"engine.foe.active.id='base1-4';"});assert.equal(a(),false);assert(a(21));eq('engine.me.active.temporaryResistance','Fire');eq('engine.foe.active.temporaryWeakness','Water');
a=setup('gym1-3','Fairy Power');assert.equal(a(),false);assert.equal(a([2]),false);assert(a([1]));eq('engine.me.bench.length',0);eq('engine.me.hand.length',1);
a=setup('gym1-94','Sleight of Hand',{extra:"engine.me.hand=['v55-Fire','base1-44','v55-Psychic'];engine.me.deck=['v55-Water','v55-Fighting','v55-Lightning'];"});assert.equal(a(),false);assert.equal(a([0,2]),false);assert.equal(a({give:[0,2],take:[5,5]}),false);assert(a({give:[0,2],take:[3,4]}));eq('engine.me.hand.length',3);
a=setup('gym2-49','Messenger',{extra:"engine.me.deck=['base1-44','v55-Lightning'];engine.me.active.energies=['v55-Water'];"});assert.equal(a(),false);assert(a(0));eq('engine.me.hand[0]','base1-44');eq('engine.me.active.id','v55-training');eq('engine.me.deck.length',3);
a=setup('gym2-90','ESP',{heads:false});assert(a());eq('engine.foe.active.damage',0);
a=setup('gym2-90','ESP',{extra:"engine.foe.active.id='v55-training';"});assert.equal(a(),false);assert(a(0));eq('engine.foe.active.damage',10); // Three Heads copies the selected attack
// Force exactly two heads for ESP.
a=setup('gym2-90','ESP');let flips=0;ctx.Math.random=()=>++flips<=2?0.01:0.99;assert(a());eq('engine.foe.active.damage',20);
a=setup('neo2-39','Plunder',{extra:"engine.foe.active.attachedTrainers=[{id:'base1-80'},{id:'neo1-86'}];"});assert(a());eq('engine.foe.active.attachedTrainers.length',0);eq('engine.foe.discard.length',2);eq('engine.foe.active.damage',20);
a=setup('neo2-45','Dust Devil',{extra:"engine.me.bench[0].id='base1-4';engine.foe.bench[0].id='base1-44';"});assert(a());eq('engine.me.active.damage',0);eq('engine.me.bench[0].damage',10);eq('engine.foe.active.damage',10);
a=setup('neo3-24','Swipe',{extra:"engine.foe.active.attachedTrainers=[{id:'base1-80'}];engine.foe.bench[0].attachedTrainers=[{id:'neo1-86'}];"});assert(a());eq('engine.foe.discard.length',2);
a=setup('neo3-27','Crystal Wave',{heads:true});assert(a());eq('engine.foe.active.damage',40);
a=setup('neo3-27','Crystal Wave',{heads:false});assert(a());eq('engine.foe.active.damage',0);eq('engine.foe.bench[0].damage',30);
a=setup('neo3-41','Grab',{extra:"engine.foe.active.attachedTrainers=[{id:'base1-80'}];"});assert.equal(a(),false);assert(a(0));eq('engine.foe.active.attachedTrainers.length',0);eq('engine.foe.deck.length',1);
a=setup('neo3-65','Devastate',{extra:"engine.me.active.energies=['v55-Water','v55-Fire','v55-Fire','v55-Water'];engine.foe.active.energies=['v55-Water'];engine.foe.bench[0].energies=['v55-Fire'];"});assert.equal(a(),false);assert.equal(a([0,0]),false);assert.equal(a([0,1]),false);assert(a({cost:[0,1],remove:[0,100]}));eq('engine.foe.active.damage',50);eq('engine.foe.bench[0].damage',10);eq('engine.foe.discard.length',2);
a=setup('neo3-66','Gold Scale',{extra:"engine.me.deck=['v55-Water','v55-Fire','v55-Grass'];engine.foe.deck=['v55-Water','v55-Fire','v55-Grass'];"});assert(a());eq('engine.me.hand.length',2);eq('engine.foe.hand.length',2);
a=setup('neo4-3','Tusk Toss',{heads:true,extra:"engine.foe.active.energies=['v55-Fire'];"});assert(a());eq('engine.foe.active.id','v55-training');eq('engine.foe.hand.length',2);
a=setup('neo4-3','Tusk Toss',{heads:false});assert(a());eq('engine.foe.bench[0].id','v55-training');
a=setup('neo4-13','Bubble Jump',{extra:"engine.me.active.energies=['v55-Water','v55-Fire','v55-Grass'];"});assert.equal(a(),false);assert(a(0));eq('engine.me.active.energies.length',2);eq('engine.me.hand.includes("neo4-13")',true);
a=setup('neo4-15','Sweet Kiss',{extra:"engine.foe.deck=['v55-Water'];"});assert(a());eq('engine.foe.hand.length',1);
a=setup('neo4-24','Flash Touch');assert.equal(a(),false);assert(a(0));eq('engine.me.active.immunityConditionUntilBenched',true);
a=setup('neo4-26','Knock Over',{extra:"engine.stadium={owner:1,id:'neo4-100'};"});assert.equal(a(),false);assert(a(1));eq('engine.stadium',null);eq('engine.foe.discard.includes("neo4-100")',true);
a=setup('neo4-36','Call Back',{extra:"engine.foe.discard=['base1-44'];"});assert.equal(a(),false);assert(a(0));eq('engine.foe.bench.length',2);eq('engine.foe.bench[1].damage',10);
a=setup('neo4-47','Flipper Stroke',{extra:"engine.me.deck=['v55-Water','v55-Fire','base1-44'];engine.foe.deck=['v55-Fighting','v55-Psychic','base1-44'];"});assert.equal(a(),false);assert(a({opp:[1],own:[0]}));eq('engine.me.hand.length',1);eq('engine.foe.hand.length',1);
a=setup('neo4-51','Fish Out',{extra:"engine.me.discard=['base1-44','base1-63'];engine.foe.discard=['base1-44'];"});assert.equal(a(),false);assert(a({opp:[0],own:[0,1]}));eq('engine.me.deck.length',2);eq('engine.foe.deck.length',1);
a=setup('neo4-53','Mysterious Wing',{extra:"engine.me.discard=['base1-44'];engine.foe.discard=['base1-63'];"});assert.equal(a(),false);assert(a({opp:[0],own:[0]}));eq('engine.me.hand.length',1);eq('engine.foe.hand.length',1);
a=setup('neo4-54','Evolution Song',{extra:"engine.me.bench[0].id='base1-63';engine.foe.bench[0].id='base1-63';engine.me.deck=['base1-42'];engine.foe.deck=['base1-42'];"});assert.equal(a(),false);assert(a({opp:[10000],own:[10000]}));eq('engine.me.bench[0].id','base1-42');eq('engine.foe.bench[0].id','base1-42');
a=setup('basep-10','Cat Punch',{heads:true});assert(a());eq('engine.foe.active.damage',20);
a=setup('basep-10','Cat Punch',{heads:false});assert(a());eq('engine.foe.bench[0].damage',20);eq('engine.foe.active.damage',0);
a=setup('neo4-15','Sweet Kiss',{side:1,extra:"engine.foe.deck=['v55-Water'];"});assert.equal(a(),false);eq('deckSearchRequest.defenderPrompt',true);assert(a(0));eq('engine.foe.hand.length',0);
// Card-by-card recognition is different from exhaustive correctness, but all records have concrete dispatchers.
const audit=run('engine.attackAudit()').filter(x=>x.card!=='v55-training');assert.equal(audit.length,1479);assert.equal(audit.filter(x=>!x.implemented).length,0);assert.equal(audit.filter(x=>x.pattern==='batch55').length,25);
console.log('PASS v0.5.5: '+checks+' card preparations, real attack outcomes, explicit choices, status types, attached Trainer handling, discard searches, and 1479/1479 effect recognition.');
