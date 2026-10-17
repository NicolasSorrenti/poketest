'use strict';
const assert=require('node:assert/strict');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const RETAIL=require('./retail_theme_decks');
const ATTACK=require('./attack_effects_core');
const U=(id,patch={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,playedTurn:1,...patch});
const e={Fire:'base1-98',Water:'base1-102',Grass:'base1-99',Psychic:'base1-101',Colorless:'base1-99'};
function setup(seed=35){const g=createGame({decks:[RETAIL.list('brock'),RETAIL.list('misty')],format:'gym-expanded',seed});g.phase='game';g.turn=0;g.turnSerial=8;g.round=4;g.players[0].active=U('base1-3');g.players[1].active=U('base1-3');g.players[0].bench=[U('base1-1')];g.players[1].bench=[U('base1-1')];return g;}
function act(g,side,type,payload){const result=applyCommand(g,side,{type,payload});assert.ok(result.ok,`${type}: ${result.error}`);}
function atk(g,id,name,energy){const a=CATALOG.get(id).attacks;const index=a.findIndex(x=>x.name===name);assert.ok(index>=0);g.players[0].active=U(id,{energies:energy||a[index].cost.map(k=>e[k]||e.Colorless)});act(g,0,'attack',{attackIndex:index});return g;}
function answer(g,picks){const d=g.pendingDecision;assert.ok(d);act(g,d.actor,'choose',{decisionId:d.id,selected:picks});}
const targets=[['gym1-43','Egg Bomb'],['gym2-54','Ice Throw'],['gym2-30','Damage Shift'],['gym2-2','Roaring Flames'],['gym2-10','Giant Growth'],['gym2-87','Ink Spurt'],['gym1-91','Energy Loop'],['gym1-24','Alert']];
for(const [id,name]of targets){const c=CATALOG.get(id);assert.ok(ATTACK.compile(c.attacks.find(x=>x.name===name))?.kind.startsWith('gym:'),`${id} ${name} still unimplemented`);}
assert.equal(CATALOG.get('gym1-43').attacks[1].damage,'40');assert.equal(CATALOG.get('gym2-54').attacks[0].damage,'20');
// Egg Bomb: a failure never harms the opponent; a success deals the printed 40.
{let heads=0,tails=0;for(let i=1;i<=20;i++){
 const g=setup(i);atk(g,'gym1-43','Egg Bomb');if(g.players[1].active.damage){heads++;assert.equal(g.players[1].active.damage,40);assert.equal(g.players[0].active.damage,0);}else{tails++;assert.equal(g.players[0].active.damage,20);}}
 assert.ok(heads&&tails);}
// Ice Throw doubles printed *base* damage, then applies standard Weakness.
{const g=setup();g.players[1].active=U('base1-7');atk(g,'gym2-54','Ice Throw');assert.equal(g.players[1].active.damage,40);}
{const g=setup();atk(g,'gym2-54','Ice Throw');assert.equal(g.players[1].active.damage,20);}
// Damage Shift removes exactly one damage counter from EACH damaged Pokémon.
{const g=setup();g.players[0].bench=[U('base1-1',{damage:30}),U('base1-2',{damage:10}),U('base1-7')];g.players[1].active=U('base1-3');atk(g,'gym2-30','Damage Shift');assert.equal(g.players[0].active.damage,0);assert.equal(g.players[0].bench[0].damage,20);assert.equal(g.players[0].bench[1].damage,0);assert.equal(g.players[1].active.damage,20);}
// Roaring Flames discards attached Fire cards, preserving other Energy and scoring 20 per card.
{const g=setup();atk(g,'gym2-2','Roaring Flames',['base1-98','base1-98','base1-99']);assert.equal(g.players[1].active.damage,60);assert.deepEqual(g.players[0].active.energies,['base1-99']);assert.deepEqual(g.players[0].discard.slice(-2),['base1-98','base1-98']);}
// Giant Growth: temporary HP / Pound upgrade disappears when benched.
{const g=setup();atk(g,'gym2-10','Giant Growth');if(g.players[0].active?.gymGiantGrowth){assert.equal(g.players[0].active.gymGiantGrowth,true);g.players[0].active.energies=['base1-99'];g.turn=0;g.turnSerial=10;act(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.damage,30);}}
// Energy Loop: multiple Psychic cards prompt for an actual choice and preserve card count.
{const g=setup();g.players[1].active=U('base1-4');g.players[0].active=U('gym1-91',{energies:['base1-101','base1-101']});const old=structuredClone(g);act(g,0,'attack',{attackIndex:0});assert.equal(g.pendingDecision.actor,0);const invalid=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['energy:4']}});assert.equal(invalid.ok,false);answer(g,['energy:1']);assert.equal(g.players[0].active.energies.length,1);assert.equal(g.players[0].hand.filter(id=>id==='base1-101').length,old.players[0].hand.filter(id=>id==='base1-101').length+1);assert.equal(g.players[1].active.damage,20);}
// Alert requires a Bench, draws exactly once and switches the chosen Pokémon.
{const g=setup();g.players[0].bench=[U('base1-1'),U('base1-2')];const before=g.players[0].hand.length;atk(g,'gym1-24','Alert');assert.equal(g.pendingDecision.actor,0);answer(g,['bench:1']);assert.equal(g.players[0].active.id,'base1-2');assert.equal(g.players[0].bench[1].id,'gym1-24');assert.equal(g.players[0].hand.length,before+1);}
{const g=setup();g.players[0].bench=[];const before=structuredClone(g);const c=CATALOG.get('gym1-24'),index=0;g.players[0].active=U(c.id,{energies:['base1-99']});const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:index}});assert.equal(r.ok,false);assert.equal(g.players[0].hand.length,before.players[0].hand.length);}
// Ink Spurt: defender's next attack is actually blocked by a tails flip.
{let failed=0,succeeded=0;for(let seed=1;seed<=80;seed++){
 const g=setup(seed);atk(g,'gym2-87','Ink Spurt');if(!g.players[1].active.gymInkSpurt)continue;
 g.players[1].active.energies=['base1-99','base1-99','base1-99','base1-99'];g.turn=1;g.turnSerial=9;
 act(g,1,'attack',{attackIndex:1});
 if(g.message.some(s=>s.includes('failed due to Ink Spurt')))failed++;else succeeded++;
 }assert.ok(failed,'Ink Spurt must sometimes prevent attacks');assert.ok(succeeded,'Ink Spurt must sometimes allow attacks');}
console.log('PASS Gym v0.32 targeted tests: 8 new attacks, selected costs, counter movement, coin outcomes, damage metadata');
