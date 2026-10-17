'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand}=require('./headless_duel');
const P=require('./classic_power_core');
const cards=['base1','base2','base3','base5'].flatMap(s=>require('./cards/'+s+'.json'));
const powers=cards.filter(c=>c.abilities?.some(a=>a.name)).flatMap(c=>c.abilities.filter(a=>a.name).map(a=>({card:c,power:a.name})));
const deck=[...Array(4).fill('base1-44'),...Array(56).fill('base1-99')];
const unit=(id,en=['base1-99','base1-98'],damage=20)=>({id,under:[],energies:[...en],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function game(id,which='active'){
 const g=createGame({decks:[deck,deck],format:'classic',seed:1834});g.phase='game';g.round=3;g.turnSerial=4;g.turn=0;
 const p=g.players[0],f=g.players[1];p.active=unit(which==='active'?id:'base1-44');p.bench=[unit(which==='bench'?id:'base1-44'),unit('base1-44')];
 f.active=unit('base1-44');f.bench=[unit('base1-44'),unit('base1-27')];
 p.hand=['base1-99','base1-98','base1-102','base1-91'];f.hand=['base1-91','base1-99'];
 p.deck=['base1-34','base1-99','base1-63','base1-98','base1-2','base1-44'];f.deck=['base1-44','base1-98'];
 p.discard=['base1-44','base1-27','base1-99'];f.discard=['base1-99','base1-91'];
 p.prizes=Array(6).fill('base1-99');f.prizes=Array(6).fill('base1-99');return g;
}
function ledger(g){return g.players.flatMap(p=>[...p.deck,...p.hand,...p.prizes,...p.discard,...[p.active,...p.bench].filter(Boolean).flatMap(u=>[u.id,...u.under,...u.energies,...u.attachedTrainers.map(t=>t.id)])]).sort();}
let executed=0,passives=0,unsupported=0;
for(const {card:c,power:name} of powers){
 if(P.UNSUPPORTED.has(name)){unsupported++;continue;}
 if(P.PASSIVE.has(name)){passives++;continue;}
 if(P.ONPLAY.has(name))continue;
 assert.ok(P.ACTIVATED.has(name),`Unregistered Power ${name}`);
 const bench=name==='Step In';const g=game(c.id,bench?'bench':'active'),p=g.players[0];
 if(name==='Rain Dance'){p.bench[1]=unit('base1-41');}
 if(['Energy Trans','Gather Fire'].includes(name)){p.bench[0].energies=['base1-99','base1-98'];}
 if(name==='Damage Swap')p.bench[1].damage=0;
 if(name==='Curse')g.players[1].bench[0].damage=0;
 if(name==='Heal')p.bench[0].damage=30;
 if(name==='Cowardice')p.bench.push(unit('base1-27'));
 if(name==='Summon Minions')throw Error('OnPlay miscategorized');
 const before=ledger(g);
 const r=applyCommand(g,0,{type:'use_power',payload:{slot:bench?0:-1}});assert.ok(r.ok,`${c.id} ${name} start failed: ${r.error}`);
 let steps=0;while(g.pendingDecision){assert.ok(steps++<8,`${name} stuck`);const dec=g.pendingDecision;const chosen=dec.options.slice(0,dec.min).map(o=>o.id);const a=applyCommand(g,dec.actor,{type:'choose',payload:{decisionId:dec.id,selected:chosen}});assert.ok(a.ok,`${c.id} ${name} choice ${dec.kind}: ${a.error}`);}
 assert.deepEqual(ledger(g),before,`${c.id} ${name} card conservation failed`);
 executed++;
}
console.log(`PASS Classic Pokémon Power matrix: ${executed} activated card records resolved, ${passives} passive records registered, ${unsupported} explicitly unsupported; ${powers.length} total historical records`);
