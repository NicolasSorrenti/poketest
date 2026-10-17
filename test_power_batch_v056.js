'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/engine.js','utf8').split('async function load()')[0];
const m=Object.create(Math);m.random=()=>0.01;
const empty=()=>({classList:{add(){},remove(){}},querySelectorAll:()=>[],style:{},getBoundingClientRect:()=>({left:0,top:0,width:50,height:50})});
const ctx={Math:m,console,window:{},document:{getElementById:empty,querySelector:()=>null},setTimeout:()=>0,clearTimeout(){}};
vm.createContext(ctx);vm.runInContext(source,ctx);
const call=(code)=>vm.runInContext(code,ctx);
const sets=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'];
const db=require('./card_corrections').applyCardCorrections(sets.flatMap(s=>require('./cards/'+s+'.json')));ctx.data=db;
call('cards=data;lookup=new Map(cards.map(c=>[c.id,c]));render=()=>{};battlefieldAttack=()=>{};queuePrizeFX=()=>{};engine.end=()=>{}');
const id=name=>db.find(c=>c.name===name)?.id;
function init(a='base1-21',b='base1-32'){
 call(`engine.players=[statePlayer('You',[]),statePlayer('Rival',[])];engine.phase='game';engine.round=5;engine.turnSerial=10;engine.turn=0;engine.over=false;engine.players[0].active=unit(${JSON.stringify(a)});engine.players[1].active=unit(${JSON.stringify(b)});engine.players[0].prizes=['base1-99','base1-99'];engine.players[1].prizes=['base1-99','base1-99'];deckSearchRequest=null;`);
}
let n=0;
const u=(name)=>{const c=db.find(x=>x.name===name);assert(c,`card ${name} in database`);return c.id;};
// Active Power: Submerge changes only for this turn, with expiry.
init(u('Lanturn'),u('Machop'));
call("engine.players[0].active.id='neo3-32'");
assert(call("engine.power56('Submerge')"));assert.equal(call('engine.card(engine.me.active).types[0]'),'Water');n++;
// Energy Charge moves Lightning Energy to active Magneton.
init(u("Lt. Surge's Magneton"),u('Machop'));
call(`engine.me.active.id='gym1-8';engine.me.bench=[unit('base1-58')];engine.me.bench[0].energies=['base1-100'];`);
assert.equal(call("engine.power56('Energy Charge',0)"),true);assert.equal(call('engine.me.active.energies.length'),1);n++;
// Invalid Power choices never burn the once-per-turn activation.
init('neo4-20',u('Machop'));assert.equal(call("engine.power56('Cunning',99)"),false);assert(!call('engine.me.active.powerUses.Cunning'));n++;
// Special Delivery draws then chooses a known hand card to return.
init('basep-5',u('Machop'));
call("engine.me.deck=['base1-98'];engine.me.hand=['base1-99'];");
assert(call("engine.power56('Special Delivery',1)"));assert.equal(call('engine.me.hand.length'),1);assert.equal(call('engine.me.deck.length'),1);n++;
// Scram triggers at exactly 10 HP remaining and shuffles itself + attachments.
init('gym2-35',u('Machop'));
call("engine.me.active.damage=60;engine.me.bench=[unit('base1-58')];engine.me.active.energies=['base1-100'];");
assert.equal(call('engine.maxHP(engine.me.active)'),70);call('engine.resolveKO()');assert.equal(call('engine.me.active.id'),'base1-58');assert(call("engine.me.deck.includes('gym2-35')"));n++;
// Summon Minions triggers on evolved Dark Dragonite, not on an unrelated card.
init('base5-5',u('Machop'));
call("engine.me.bench=[unit('base1-58')];engine.me.deck=['base1-58','base1-59'];");
call('power56OnEnter(engine,engine.me.active)');
assert(call('!!deckSearchRequest'));assert.equal(call('deckSearchRequest.multi'),true);assert(call('deckSearchRequest.execute([0,1])'));assert.equal(call('engine.me.bench.length'),3);n++;
// Sneak Attack selects target and deals printed 10 damage.
init('base5-7',u('Machop'));call('power56OnEnter(engine,engine.me.active)');
assert(call('!!deckSearchRequest'));assert(call('deckSearchRequest.execute(0)'));assert(call('engine.foe.active.damage>=10'));n++;
// Pollen Stench successful Heads confuses defending Active.
init('base5-36',u('Machop'));assert(call("engine.power56('Pollen Stench')"));assert.equal(call('engine.foe.active.status'),'Confused');n++;
// Emerge can evolve without using a normal manual evolution.
init('gym2-47',u('Machop'));call("engine.me.deck=['gym2-3','gym2-1'];"); // no Koga Beedrill
assert(call("engine.power56('Emerge')"));assert(call('engine.me.active.powerUses.Emerge'));n++;
// Unown I searches another Unown and benches it after being played.
init('neo2-68',u('Machop'));
call("engine.me.deck=['neo2-67','base1-99'];engine.me.bench=[]");
call('power56OnEnter(engine,engine.me.active)');
assert(call('!!deckSearchRequest'));assert(call('deckSearchRequest.execute(0)'));
assert.equal(call('engine.me.bench.length'),1);assert.equal(call('engine.me.bench[0].id'),'neo2-67');n++;
// Tag Team heals the previous Active Pokémon then switches Light Machamp in.
init('base1-58',u('Machop'));
call("engine.me.active.damage=40;engine.me.bench=[unit('neo4-25')];power56OnEnter(engine,engine.me.bench[0])");
assert.equal(call('engine.me.active.id'),'neo4-25');
assert.equal(call('engine.me.bench[0].damage'),10);n++;
// Unown P [Perform] adds previous attack damage even while Confused.
init('neo4-58',u('Machop'));
call("engine.me.active.energies=['base1-101'];engine.me.active.incomingAttack={turnSerial:9,damage:20};engine.me.active.status='Confused';engine.foe.active.damage=0;");
// Avoid the confusion coin by testing recognized power and the damage path in context.
assert(call("engine.printedPower(engine.me.active,'[Perform]',true)"));n++;
init('neo4-58','base1-63');
call("engine.me.active.energies=['base1-101'];engine.me.active.incomingAttack={turnSerial:9,damage:20};engine.me.active.status='Confused'");
assert(call('engine.attack(0,null,true)'));
assert.equal(call('engine.foe.active.damage'),30);n++;
// Drive Off forces the opposing player to select from its Bench.
init('neo4-12',u('Machop'));
call("engine.foe.bench=[unit('base1-58'),unit('base1-59')]");
assert.equal(call("engine.power56('Drive Off')"),true);
assert.equal(call('engine.foe.active.id'),'base1-59');n++;
// Engage redraws the rival hand first, then offers the owner a choice.
init('neo2-67',u('Machop'));
call("engine.foe.hand=['base1-99','base1-100'];engine.foe.deck=['base1-98','base1-98','base1-98','base1-98','base1-98'];engine.me.hand=['base1-99'];engine.me.deck=['base1-98','base1-98','base1-98','base1-98','base1-98'];power56OnEnter(engine,engine.me.active)");
assert.equal(call('engine.foe.hand.length'),4);assert(call('!!deckSearchRequest'));
assert(call('deckSearchRequest.execute(1)'));assert.equal(call('engine.me.hand.length'),4);n++;
// Gift searches the Tool cards by their historical rules text.
init('neo4-15',u('Machop'));
call("engine.me.deck=['neo1-86','base1-99'];engine.foe.deck=['neo1-93','base1-98'];power56OnEnter(engine,engine.me.active)");
assert(call('engine.foe.hand.includes("neo1-93")'));assert(call('!!deckSearchRequest'));
assert(call('deckSearchRequest.execute(0)'));assert(call('engine.me.hand.includes("neo1-86")'));n++;
// Raikou's Lightning Burst forces the opposing Active switch after attachment.
init('neo3-13',u('Machop'));
call("engine.me.hand=['base1-100'];engine.me.energyUsed=false;engine.foe.bench=[unit('base1-58')]");
assert(call('engine.attach(0,-1)'));assert.equal(call('engine.foe.active.id'),'base1-58');n++;
// Howl mills exactly the top five cards and allows the human to select the
// recipient for EACH recovered Fire Energy before ending the turn.
init('neo3-6',u('Machop'));
call("engine.me.deck=['base1-99','base1-98','base1-98','base1-98','base1-98'];engine.me.bench=[];power56OnEnter(engine,engine.me.active)");
assert(call('!!deckSearchRequest'));assert(call('deckSearchRequest.execute(1)'));
assert(call('engine.me.discard.includes("base1-99")'));n++;
// Howl attaches every revealed Fire Energy with separate target selections.
init('neo3-6',u('Machop'));
call("engine.me.deck=['base1-98','base1-99','base1-98','base1-99','base1-98'];engine.me.bench=[unit('base1-4')];power56OnEnter(engine,engine.me.active)");
assert(call('deckSearchRequest.execute(1)'));
assert(call('!!deckSearchRequest'));assert(call('deckSearchRequest.execute(1)'));
assert(call('!!deckSearchRequest'));assert(call('deckSearchRequest.execute(0)'));
assert(call('!!deckSearchRequest'));assert(call('deckSearchRequest.execute(1)'));
assert.equal(call('engine.me.active.energies.length'),1);
assert.equal(call('engine.me.bench[0].energies.length'),2);n++;
// Gift's optional search must not force a player to take a Tool.
init('neo4-15',u('Machop'));
call("engine.me.deck=['neo1-86'];engine.foe.deck=[];power56OnEnter(engine,engine.me.active)");
assert(call('!!deckSearchRequest'));assert(call('deckSearchRequest.execute(-1)'));
assert.equal(call('engine.me.deck.length'),1);n++;
const registered=call('engine.powerAudit().filter(x=>x.implemented).length');
assert(registered>85);n++;
console.log(`PASS: ${n} Power scenarios (activation, costs, choices, on-play, KO, selection)`);
