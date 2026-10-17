'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=__dirname;
const source=fs.readFileSync(root+'/engine.js','utf8').split('async function load()')[0].replace('const engine=new Engine();window.NeoCampus={engine,get cards(){return cards},lookup};','const engine=new Engine();');
const el=()=>({classList:{add(){},remove(){}},style:{},textContent:'',querySelectorAll:()=>[]});
const ctx={console,Math:Object.create(Math),document:{getElementById:el,querySelector:()=>null},setTimeout(){},clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(source,ctx);const R=s=>vm.runInContext(s,ctx);
const sets=['base1','base2','base3','base4','base5','basep','gym1','gym2','neo1','neo2','neo3','neo4'];
const cards=sets.flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,'cards',f+'.json'))));
const energies=['Grass','Water','Fire','Lightning','Psychic','Fighting','Metal','Darkness','Colorless'].map(t=>({id:'test-'+t,name:t+' Energy',supertype:'Energy',subtypes:['Basic']}));
const dummy={id:'dummy-45',name:'Battle dummy',hp:'900',supertype:'Pokémon',subtypes:['Basic'],types:['Colorless'],attacks:[{name:'Simple Hit',damage:'20',cost:['Colorless'],text:''}],abilities:[]};
ctx.fixtures=[...cards,...energies,dummy];R('lookup=new Map(fixtures.map(c=>[c.id,c]));render=()=>{};engine.end=()=>{};');
const targets=JSON.parse(fs.readFileSync(root+'/batch45_targets.json'));
function scenario(card,name,{heads=true,energies:attached=null,setup='',turn=0}={}){
 const c=cards.find(c=>c.id===card),i=c.attacks.findIndex(a=>a.name===name);assert(i>=0,`${card} ${name}`);
 const cost=(c.attacks[i].cost||[]).map(t=>'test-'+(t==='Colorless'?'Fire':t));
 const energyIds=attached?attached.map(t=>'test-'+t):[...cost,...cost,'test-Fire','test-Lightning','test-Water'];
 R(`engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.turn=${turn};engine.round=4;engine.turnSerial=0;engine.over=false;engine.powerSilenceUntilSerial=0;
 engine.players[${turn}].active=unit(${JSON.stringify(card)});engine.players[${1-turn}].active=unit('dummy-45');engine.players[${turn}].active.energies=${JSON.stringify(energyIds)};
 engine.players[${turn}].bench=[unit('dummy-45'),unit('dummy-45')];engine.players[${1-turn}].bench=[unit('dummy-45'),unit('dummy-45')];
 engine.players[${turn}].discard=['test-Fire','test-Water'];engine.players[${1-turn}].discard=['test-Water'];
 engine.players[${turn}].hand=['test-Fire','test-Water'];engine.players[${1-turn}].hand=[];
 engine.players[${turn}].deck=Array(15).fill('test-Fire');engine.players[${1-turn}].deck=Array(15).fill('test-Water');
 engine.players[0].prizes=Array(6).fill('dummy-45');engine.players[1].prizes=Array(6).fill('dummy-45');${setup}`);
 ctx.Math.random=()=>heads?0.01:0.99;
 return {i,c,run:R,attack:(target=null,choice=null)=>R(`engine.attack(${i},${JSON.stringify(target)},true,${JSON.stringify(choice)})`)};
}
// Every newly enabled record: text dispatch, a legal prepared game state, and an executed attack.
for(const entry of targets){
 const x=scenario(entry.card,entry.name),a=x.c.attacks[x.i];
 assert.equal(R(`engine.attackPattern(${JSON.stringify(a)})`),'batch45',entry.card+' recognized');
 const mode=entry.mode,slot=mode==='any'?-1:(mode.startsWith('bench')||mode.startsWith('ownBench'))?1:null;
 if(entry.name==='Healing Water')R('engine.me.bench[1].damage=30');
 const before=R('JSON.stringify(engine.players)');
 const choice=entry.name==='Stoke'&&entry.card==='gym2-62'?0:null;assert.equal(x.attack(slot,choice),true,entry.card+' '+entry.name+' executes');
 assert.notEqual(R('JSON.stringify(engine.players)'),before,entry.card+' '+entry.name+' has state outcome');
}
let x=scenario('gym2-2','Flame Jet');
assert.equal(x.attack(null),false,'No silent target selection for Flame Jet');
assert.equal(R('engine.foe.active.damage'),0,'Invalid target does not change board');
assert(x.attack(1));assert.equal(R('engine.foe.bench[1].damage'),40);assert.equal(R('engine.foe.active.damage'),0);
x=scenario('gym2-2','Flame Jet',{heads:false});assert(x.attack(-1));assert.equal(R('engine.foe.active.damage'),0,'Flame Jet tails');
x=scenario('gym2-59','Magic Darts');assert(x.attack(-1));assert.equal(R('engine.foe.active.damage'),30,'Three Heads');
x=scenario('gym2-59','Magic Darts',{heads:false});assert(x.attack(-1));assert.equal(R('engine.foe.active.damage'),0,'All Tails');
x=scenario('neo4-37','Water Cannon',{energies:['Water','Water','Water']});assert(x.attack(1));assert.equal(R('engine.foe.bench[1].damage'),30);assert.equal(R('engine.foe.active.damage'),0);
x=scenario('neo4-111','Thundersquall',{energies:['Lightning','Lightning','Water','Water']});assert(x.attack(1));assert.equal(R('engine.foe.active.damage'),40);assert.equal(R('engine.foe.bench[1].damage'),40);
x=scenario('neo3-22','Lightning Spark');assert(x.attack(1));assert.equal(R('engine.foe.active.damage'),30);assert.equal(R('engine.foe.bench[1].damage'),20);
x=scenario('neo3-22','Lightning Spark',{heads:false});assert(x.attack(1));assert.equal(R('engine.foe.active.damage'),30);assert.equal(R('engine.foe.bench[1].damage'),0);
x=scenario('neo1-46','Fire Wind');assert(x.attack(0));assert.equal(R('engine.foe.active.damage'),20);assert.equal(R('engine.foe.bench[0].damage'),20);
x=scenario('neo1-46','Fire Wind',{heads:false});assert(x.attack(0));assert.equal(R('engine.foe.bench[0].damage'),0);
x=scenario('neo2-37','Recover',{energies:['Water','Fire'],setup:'engine.me.active.damage=60'});assert(x.attack());assert.equal(R('engine.me.active.damage'),0);assert.equal(R('engine.me.active.energies.length'),1);assert.equal(R('engine.me.discard.length'),3);
x=scenario('neo3-6','Searing Flames',{energies:['Fire','Fire','Fire']});assert(x.attack());assert.equal(R('engine.foe.active.damage'),60);assert.equal(R('engine.me.active.energies.length'),1);
x=scenario('neo3-17','Mega Flame',{heads:false,energies:['Fire','Fire','Fire']});assert(x.attack());assert.equal(R('engine.foe.active.damage'),50);assert.equal(R('engine.me.active.energies.length'),1);
x=scenario('neo3-17','Mega Flame',{heads:true,energies:['Fire','Fire','Fire']});assert(x.attack());assert.equal(R('engine.me.active.energies.length'),3);
x=scenario('neo1-24','Mean Look');assert(x.attack());assert.equal(R('engine.foe.active.persistentRetreatSourceId'),'neo1-24');R('engine.turn=1');assert.equal(R('engine.retreat(0)'),false,'Mean Look blocks retreat while source Active');
x=scenario('neo4-34','Stun Wave',{setup:'lookup.get("dummy-45").abilities=[{name:"Test Power",type:"Pokemon Power"}]'});assert(x.attack());assert.equal(R('engine.unitHasPower(engine.foe.active,"Test Power")'),false);R('engine.turnSerial=3');assert.equal(R('engine.unitHasPower(engine.foe.active,"Test Power")'),true,'Stun Wave expires after next own turn');R('lookup.get("dummy-45").abilities=[]');
x=scenario('neo2-71','Slime');assert(x.attack());R('engine.turn=1;engine.turnSerial=1;engine.players[1].active=unit("dummy-45");engine.players[1].active.energies=["test-Fire"]');ctx.Math.random=()=>0.99;assert(R('engine.attack(0,null,true)'));assert.equal(R('engine.foe.active.damage'),0,'Slime tails prevents damage');
x=scenario('neo2-71','Slime');assert(x.attack());R('engine.turn=1;engine.turnSerial=1;engine.players[1].active=unit("dummy-45");engine.players[1].active.energies=["test-Fire"]');ctx.Math.random=()=>0.01;assert(R('engine.attack(0,null,true)'));assert.equal(R('engine.foe.active.damage'),20,'Slime heads allows damage');

// Deck and discard choice flows: the choice must be explicit for the human.
x=scenario('gym2-62','Stoke',{energies:['Fire'],setup:'engine.me.deck=["test-Fire","test-Water","test-Fire"]'});
const stokeBefore=R('JSON.stringify(engine.me)');assert.equal(x.attack(),false,'Stoke prompts for a selection');assert.equal(R('JSON.stringify(engine.me)'),stokeBefore,'Prompt does not alter the deck or consume the attack');assert.equal(R('deckSearchRequest.options.length'),2);assert(x.attack(null,2));assert.equal(R('engine.me.active.energies.length'),2);assert.equal(R('engine.me.deck.length'),2);
x=scenario('gym2-95','Energy Support',{energies:['Psychic'],setup:'engine.me.deck=["test-Psychic","test-Fire"]'});
assert.equal(x.attack(),false,'Energy Support prompts for Psychic Energy');assert(x.attack(null,0));assert.equal(R('engine.me.hand.filter(id=>id==="test-Psychic").length'),1);assert.equal(R('engine.me.deck.length'),1);
x=scenario('neo3-46','Call for Family',{setup:'engine.me.deck=["neo1-24","test-Fire"]'});
assert.equal(x.attack(),false,'Call for Family requires Murkrow choice');assert(x.attack(null,0));assert.equal(R('engine.me.bench.length'),3);assert.equal(R('engine.me.bench[2].id'),'neo1-24');
x=scenario('neo4-50','Guiding Flame',{setup:'engine.me.discard=["base1-50","neo3-46"]'});
assert.equal(x.attack(),false,'Guiding Flame prompts for an eligible Basic');assert.equal(R('engine.me.bench.length'),2);assert(x.attack(null,0));assert.equal(R('engine.me.bench.length'),3);assert.equal(R('engine.me.bench[2].id'),'base1-50');assert.equal(R('engine.foe.active.damage'),50);
x=scenario('neo4-106','Healing Water',{energies:['Water','Fire','Fire'],setup:'engine.me.bench[0].damage=40'});assert.equal(x.attack(),false,'Healing Water requires a friendly Bench target');assert(x.attack(0));assert.equal(R('engine.me.bench[0].damage'),10,'Healing Water removes one damage counter per attached Energy');
x=scenario('neo4-49','Return Home',{setup:'engine.me.bench[1].energies=["test-Fire","test-Water"]'});assert.equal(x.attack(),false,'Return Home requires chosen friendly Bench');const oldDeck=R('engine.me.deck.length');assert(x.attack(1));assert.equal(R('engine.me.bench.length'),1);assert.equal(R('engine.me.deck.length'),oldDeck+3,'Return Home shuffles Pokémon and attachments into deck');
x=scenario('neo4-17','Poison Bind');assert(x.attack());assert.equal(R('engine.foe.active.poison'),true);assert.equal(R('engine.foe.active.cantRetreatUntilSerial'),2);
x=scenario('neo4-17','Poison Bind',{heads:false});assert(x.attack());assert.equal(R('engine.foe.active.poison'),true);assert.equal(R('engine.foe.active.cantRetreatUntilSerial'),undefined);
x=scenario('gym2-59','Magic Darts',{setup:'lookup.get("dummy-45").abilities=[{name:"Invisible Wall",type:"Pokemon Power"}]'});assert(x.attack(-1));assert.equal(R('engine.foe.active.damage'),0,'Mr. Mime Invisible Wall prevents 30 damage from targeted attack');R('lookup.get("dummy-45").abilities=[]');

x=scenario('gym2-64','Hind Kick',{heads:true});assert(x.attack(1));assert.equal(R('engine.me.active.id'),'dummy-45');assert.equal(R('engine.me.bench[1].id'),'gym2-64');
x=scenario('gym2-64','Hind Kick',{heads:false});assert(x.attack(1));assert.equal(R('engine.me.active.id'),'gym2-64');
console.log(`PASS: ${targets.length} exact attack texts, targeting, Heads/Tails, recoil, defense, duration and Energy outcomes`);
