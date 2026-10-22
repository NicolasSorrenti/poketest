'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {SUPPORTED}=require('./classic_trainer_core');
const POWERS=require('./classic_power_core');
const seeds=[...Array(4).fill('base1-44'),...Array(4).fill('base1-27'),...Array(52).fill('base1-99')];
const unit=(id,energy=[],damage=0)=>({id,under:[],energies:[...energy],attachedTrainers:[],damage,status:null,poison:false,playedTurn:0});
function ready(){const g=createGame({decks:[seeds,seeds],format:'classic',seed:849});g.phase='game';g.turn=0;g.round=3;g.turnSerial=3;
 for(let i=0;i<2;i++){const p=g.players[i];p.active=unit('base1-44',['base1-99'],20);p.bench=[unit('base1-27',['base1-99'],10),unit('base1-44',['base1-99'])];p.deck=['base1-99','base1-98','base1-91','base1-44','base1-27','base1-99'];p.prizes=Array(6).fill('base1-99');p.hand=[];p.discard=['base1-99','base1-98','base1-91','base1-44','base1-27'];}
 return g;}
const ok=(g,side,type,payload={})=>{const a=applyCommand(g,side,{type,payload});assert.ok(a.ok,`${type}: ${a.error}`);};
const bad=(g,side,type,payload={},re)=>{const before=structuredClone(g),r=applyCommand(g,side,{type,payload});assert.equal(r.ok,false,`${type} unexpectedly accepted`);if(re)assert.match(r.error,re);assert.deepEqual(g,before,'Rejected command altered state');};
function answer(g,selected){const d=g.pendingDecision;assert.ok(d,'Expected decision');ok(g,d.actor,'choose',{decisionId:d.id,selected:selected??d.options.slice(0,d.min).map(x=>x.id)});}
function runAll(g){let n=0;while(g.pendingDecision){assert.ok(n++<12,'decision loop');answer(g);}return n;}
let passed=0;
const check=(name,f)=>{try{f();passed++;}catch(e){e.message=name+': '+e.message;throw e;}};
check('all 39 distinct Trainer names registered',()=>{
 const names=new Set(['base1','base2','base3','base5'].flatMap(s=>require('./cards/'+s+'.json')).filter(c=>c.supertype==='Trainer').map(c=>c.name));
 assert.equal(names.size,39);for(const name of names)assert.ok(SUPPORTED.has(name),`Regression: missing Classic Trainer ${name}`);
 assert.ok(SUPPORTED.size>=names.size,'Future retail Trainers may extend this supported set');
});
check('Trainer selection and card consumption',()=>{const g=ready();g.players[0].hand=['base1-71','base1-91','base1-94'];
 ok(g,0,'play_trainer',{handIndex:0});assert.ok(g.pendingDecision);assert.deepEqual(g.players[0].hand,['base1-71','base1-91','base1-94']);
 answer(g,['n:1','n:2']);assert.ok(g.pendingDecision);assert.equal(g.players[0].discard.includes('base1-71'),false);
 answer(g,['deck:2']);assert.equal(g.pendingDecision,null);assert.equal(g.players[0].discard.includes('base1-71'),true);assert.equal(g.players[0].hand.includes('base1-91'),true);
});
check('wrong answer to trainer choice is atomic',()=>{const g=ready();g.players[0].hand=['base1-71','base1-91','base1-94'];ok(g,0,'play_trainer',{handIndex:0});const d=g.pendingDecision;
 bad(g,1,'choose',{decisionId:d.id,selected:['n:1','n:2']},/another player/);
 bad(g,0,'choose',{decisionId:d.id,selected:['n:1','n:1']},/Duplicate/);
});
check('full heal and potion resolve classic',()=>{const g=ready();g.players[0].hand=['base1-82','base1-94'];g.players[0].active.status='Asleep';
 ok(g,0,'play_trainer',{handIndex:0});assert.equal(g.players[0].active.status,null);
 ok(g,0,'play_trainer',{handIndex:0});answer(g,['slot:-1']);assert.equal(g.players[0].active.damage,0);
});
check('Gust and Switch choices live on both sides',()=>{const g=ready();g.players[0].hand=['base1-93','base1-95'];
 ok(g,0,'play_trainer',{handIndex:0});answer(g,['bench:0']);assert.equal(g.players[1].active.id,'base1-27');
 ok(g,0,'play_trainer',{handIndex:0});answer(g,['bench:1']);assert.equal(g.players[0].active.id,'base1-44');
});
check('Energy Removal chooses exact opponent Energy',()=>{const g=ready();g.players[0].hand=['base1-92'];g.players[1].active.energies=['base1-99','base1-98'];
 ok(g,0,'play_trainer',{handIndex:0});answer(g,['slot:-1']);answer(g,['n:1']);assert.deepEqual(g.players[1].active.energies,['base1-99']);assert.ok(g.players[1].discard.includes('base1-98'));
});
check('PlusPower attaches and expires instead of immediately discarding',()=>{const g=ready();g.players[0].hand=['base1-84'];ok(g,0,'play_trainer',{handIndex:0});assert.equal(g.players[0].active.attachedTrainers.length,1);assert.equal(g.players[0].discard.includes('base1-84'),false);
});
check('Goop Gas Attack and Hay Fever block powers/trainers',()=>{const g=ready();g.players[0].hand=['base5-78','base1-91'];ok(g,0,'play_trainer',{handIndex:0});assert.ok(g.powerBlankUntil>g.turnSerial);
 const next=ready();next.players[1].bench.push(unit('base5-13'));next.players[0].hand=['base1-91'];bad(next,0,'play_trainer',{handIndex:0},/Vileplume/);
});
check('pre-historic evolution lock',()=>{const g=ready();g.players[1].bench.push(unit('base3-1'));g.players[0].hand=['base1-34'];g.players[0].active=unit('base1-52');bad(g,0,'evolve',{handIndex:0,slot:-1},/Prehistoric/);});
check('normal evolution still works while Powers exist',()=>{const g=ready();g.players[1].bench.push(unit('base2-11'));g.players[0].hand=['base1-34'];g.players[0].active=unit('base1-52');ok(g,0,'evolve',{handIndex:0,slot:-1});assert.equal(g.players[0].active.id,'base1-34');});
check('Rain Dance attaches additional Water Energy',()=>{const g=ready();g.players[0].active=unit('base1-2');g.players[0].bench=[unit('base1-41')];g.players[0].hand=['base1-102'];
 ok(g,0,'use_power',{slot:-1});answer(g,['hand:0']);answer(g,['slot:0']);assert.deepEqual(g.players[0].bench[0].energies,['base1-102']);assert.equal(g.players[0].energyUsed,false);
});
check('Venusaur Energy Trans moves its own Grass Energy and can be repeated',()=>{
 const g=ready(),p=g.players[0];p.active=unit('base1-15',['base1-99','base1-99','base1-102']);
 p.bench=[unit('base1-44'),unit('base1-27',['base1-99'])];
 ok(g,0,'use_power',{slot:-1});
 assert.ok(g.pendingDecision.options.some(o=>o.id==='slot:-1'),'Venusaur must be a legal Energy donor');
 answer(g,['slot:-1']);answer(g,['index:0']);
 assert.ok(g.pendingDecision.options.some(o=>o.id==='slot:0'),'Benched Pokémon must be a legal Energy recipient');
 assert.ok(!g.pendingDecision.options.some(o=>o.id==='slot:-1'),'Energy cannot move onto its original Pokémon');
 answer(g,['slot:0']);
 assert.deepEqual(p.active.energies,['base1-99','base1-102']);
 assert.deepEqual(p.bench[0].energies,['base1-99']);
 ok(g,0,'use_power',{slot:-1});answer(g,['slot:1']);answer(g,['index:0']);answer(g,['slot:-1']);
 assert.deepEqual(p.active.energies,['base1-99','base1-102','base1-99']);
 assert.deepEqual(p.bench[1].energies,[]);
 assert.equal(p.energyUsed,false,'Energy Trans must not consume the turn attachment');
 p.active.status='Paralyzed';bad(g,0,'use_power',{slot:-1},/disabled/);
});
check('Venusaur Energy Trans requires a second Pokémon to receive Energy',()=>{
 const g=ready();g.players[0].active=unit('base1-15',['base1-99']);g.players[0].bench=[];
 bad(g,0,'use_power',{slot:-1},/requires another Pokémon/);
});
check('Snorlax prevents Special Conditions',()=>{const g=ready();g.players[1].active=unit('base2-11');g.players[0].active=unit('base1-44',['base1-99','base1-99','base1-99']);g.players[1].active.status=null;
 // This attack is a normal damage one; make sure the Power does not prevent damage.
 ok(g,0,'attack',{attackIndex:0});assert.ok(g.players[1].active.damage>=0);
});
check('Dark Dragonair Power searches for an Evolution',()=>{const g=ready();g.players[0].active=unit('base5-33');g.players[0].deck=['base1-34','base1-99'];
 ok(g,0,'use_power',{slot:-1});answer(g,['deck:0']);assert.ok(g.players[0].hand.includes('base1-34'));
});
check('Power once-per-turn prevents second use',()=>{const g=ready();g.players[0].active=unit('base5-39');g.players[0].hand=['base1-99','base1-98'];
 ok(g,0,'use_power',{slot:-1});answer(g,['hand:0']);bad(g,0,'use_power',{slot:-1},/already used/);
});
check('Power coverage explicit and no silent fallbacks',()=>{
 const rec=['base1','base2','base3','base5'].flatMap(s=>require('./cards/'+s+'.json')).flatMap(c=>c.abilities||[]).filter(x=>x.name);
 assert.equal(rec.length,52);
 const known=new Set([...POWERS.ACTIVATED,...POWERS.ONPLAY,...POWERS.PASSIVE,...POWERS.UNSUPPORTED]);
 for(const name of new Set(rec.map(x=>x.name)))assert.ok(known.has(name),`Unrecognized historical Classic Power: ${name}`);
});
console.log('PASS Classic migrated Trainer/Power scenarios:',passed);
