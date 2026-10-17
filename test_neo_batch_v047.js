'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const ATTACK=require('./attack_effects_core');
const FORMAT=require('./classic_format');
const {ClassicLocalService}=require('./classic_local_service');
const {list}=require('./authentic_decks');
const E={Lightning:'neo1-109',Grass:'neo1-108',Water:'neo1-111'};
const U=(id,extra={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...extra});
function match(id='neo1-65'){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:29});
 g.phase='game';g.turn=0;g.round=5;g.turnSerial=9;g.rngState=17;
 g.players[0].active=U(id);g.players[0].bench=[];g.players[1].active=U('base1-58');g.players[1].bench=[];
 g.players[0].hand=[];g.players[0].discard=[];g.players[1].hand=[];
 g.players[0].prizes=Array(6).fill('base1-99');g.players[1].prizes=Array(6).fill('base1-99');
 return g;
}
function send(g,side,type,payload){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,`${type}: ${r.error}`);return g;}
function attack(g,name){const i=CATALOG.get(g.players[0].active.id).attacks.findIndex(a=>a.name===name);assert.ok(i>=0);return send(g,0,'attack',{attackIndex:i});}
function choose(g,ids){assert.ok(g.pendingDecision,'choice required');const d=g.pendingDecision;return send(g,d.actor,'choose',{decisionId:d.id,selected:ids});}
for(const id of ['neo1-65','neo1-34','neo1-1']){
 const c=new ClassicLocalService().cardPool().find(x=>x.id===id);
 assert.ok(c?.supported,'Missing complete executable card '+id);
 assert.ok(FORMAT.isAllowed(id,{neo:true}),'Neo card must be available '+id);
 assert.equal(FORMAT.isAllowed(id),false,'Not available outside Neo format');
}
for(const id of ['neo1-65','neo1-34'])for(const a of CATALOG.get(id).attacks){
 assert.ok(ATTACK.compile(a),a.name+' must compile');
 const edited={...a,text:a.text+' FAKE'};
 assert.equal(ATTACK.compile(edited),null,'Unrecognized text must not silently execute '+a.name);
}
// Static Electricity counts every Mareep in play, including the opponent's
// Mareep. It searches ONLY Lightning Energy and attaches to the attacker.
{
 const g=match();g.players[0].active.energies=[E.Lightning];
 g.players[0].bench=[U('neo1-65'),U('neo2-58')];g.players[1].bench=[U('neo1-65')];
 g.players[0].deck=[E.Lightning,E.Grass,E.Lightning,E.Lightning,E.Grass];
 attack(g,'Static Electricity');
 const d=g.pendingDecision;assert.equal(d.actor,0);assert.equal(d.kind,'card-search');assert.equal(d.max,3);
 assert.equal(d.options.length,3);
 const forbidden=applyCommand(g,1,{type:'choose',payload:{decisionId:d.id,selected:[d.options[0].id]}});
 assert.equal(forbidden.ok,false,'Opponent cannot pick searched cards');
 choose(g,[d.options[0].id,d.options[2].id]);
 assert.equal(g.pendingDecision,null);
 assert.deepEqual(g.players[0].active.energies,[E.Lightning,E.Lightning,E.Lightning]);
 assert.equal(g.players[0].deck.length,3);
 assert.equal(g.players[0].deck.filter(x=>x===E.Lightning).length,1);
 assert.equal(g.players[1].bench[0].energies.length,0);
}
// Optional search can choose 0, and 0 Energy in deck does not hang a match.
{
 const g=match();g.players[0].active.energies=[E.Lightning];g.players[0].deck=[E.Lightning,E.Grass];
 attack(g,'Static Electricity');choose(g,[]);assert.equal(g.pendingDecision,null);
 assert.equal(g.players[0].active.energies.length,1);
 assert.equal(g.players[0].deck.length,2);
}
{
 const g=match();g.players[0].active.energies=[E.Lightning];g.players[0].deck=[E.Grass];
 attack(g,'Static Electricity');assert.equal(g.pendingDecision,null);assert.equal(g.players[0].deck.length,1);
}
// Discharge discards only Lightning Energy, not other attached Energy.
// A single combined hit is made from 30 per coin heads.
{
 const g=match('neo1-34');g.players[0].active.energies=[E.Lightning,E.Grass,E.Lightning];
 attack(g,'Discharge');
 assert.equal(g.players[0].discard.filter(x=>x===E.Lightning).length,2);
 assert.deepEqual(g.players[0].active.energies,[E.Grass]);
 assert.equal(g.players[0].discard.includes(E.Grass),false);
 assert.equal(g.coinFlips.slice(-2).length,2);
 assert.ok([0,30,60].includes(g.players[1].active.damage));
}
// Electric Current is mandatory, moves the selected Lightning Energy
// to exactly the chosen friendly Bench, and still deals 20 damage.
{
 const g=match('neo1-34');g.players[0].active.energies=[E.Lightning,E.Grass,E.Lightning];g.players[0].bench=[U('neo1-65'),U('base1-3')];
 attack(g,'Electric Current');assert.equal(g.pendingDecision.kind,'energy-target');
 assert.equal(g.pendingDecision.options.length,2);
 choose(g,['energy:2']);assert.equal(g.pendingDecision.kind,'pokemon-target');
 choose(g,['bench:1']);
 assert.deepEqual(g.players[0].active.energies,[E.Lightning,E.Grass]);
 assert.deepEqual(g.players[0].bench[0].energies,[]);assert.deepEqual(g.players[0].bench[1].energies,[E.Lightning]);
 assert.equal(g.players[1].active.damage,20);
}
// Without a Bench, Lightning Energy must be discarded.
{
 const g=match('neo1-34');g.players[0].active.energies=[E.Lightning,E.Lightning];
 attack(g,'Electric Current');choose(g,['energy:1']);
 assert.equal(g.players[0].active.energies.length,1);assert.equal(g.players[0].discard.at(-1),E.Lightning);
 assert.equal(g.players[1].active.damage,20);
}
// Ampharos's already-supported Gigaspark remains part of this legal line.
{
 const g=match('neo1-1');g.players[1].active=U('base1-3');g.players[0].active.energies=[E.Lightning,E.Lightning,E.Lightning];g.players[1].bench=[U('base1-3')];
 attack(g,'Gigaspark');assert.ok([0,10].includes(g.players[1].bench[0].damage));
 assert.equal(g.players[1].active.damage,40);
}
console.log('PASS v0.47 Neo Genesis Mareep → Flaaffy → Ampharos: static search, Energy choice, Discharge and Gigaspark');
