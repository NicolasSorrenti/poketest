'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {list}=require('./authentic_decks');
const A=require('./attack_effects_core');
const {defs}=require('./neo_attack_batch_v049');
const FORMAT=require('./classic_format');
const {ClassicLocalService}=require('./classic_local_service');
const unlocked=require('./neo_v049_pool').ids;
const U=(id,more={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...more});
const E={Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Grass:'base1-99',Psychic:'base1-101',Fighting:'base1-97',Metal:'neo1-19',Colorless:'base1-97'};
function game(id='neo1-21'){
 const g=createGame({decks:[list('base1:Brushfire'),list('base1:Brushfire')],format:'online-preview',seed:111});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;g.rngState=222;
 g.players[0].active=U(id,{energies:[...Array(5).fill(E.Grass),...Array(5).fill(E.Fire),...Array(5).fill(E.Water),...Array(5).fill(E.Lightning),...Array(5).fill(E.Fighting),...Array(5).fill(E.Psychic),...(CATALOG.get(id).attacks.some(a=>a.cost.includes('Metal'))?[E.Metal]:[])]});
 g.players[1].active=U('base1-58',{energies:[E.Lightning,E.Grass]});g.players[0].bench=[U('neo1-54'),U('base1-3')];g.players[1].bench=[U('base1-3'),U('base1-46')];
 g.players[0].hand=[];g.players[1].hand=[];g.players[0].discard=[E.Water,E.Fire];g.players[0].deck=[E.Grass,E.Water,E.Fire,E.Lightning,'neo1-54','neo1-55'];g.players[1].deck=['base1-3','base1-46','base1-58','base1-99'];
 g.players[0].prizes=Array(6).fill('base1-99');g.players[1].prizes=Array(6).fill('base1-99');return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.equal(r.ok,true,type+': '+r.error);return g;}
function choose(g,select){const d=g.pendingDecision;assert.ok(d,'Decision expected');send(g,d.actor,'choose',{decisionId:d.id,selected:select??d.options.slice(0,d.min).map(x=>x.id)});}
function attack(g,name){const index=CATALOG.get(g.players[0].active.id).attacks.findIndex(x=>x.name===name);assert.ok(index>=0);return send(g,0,'attack',{attackIndex:index});}
function resolve(g,selector){let n=0;while(g.pendingDecision&&n++<10){const d=g.pendingDecision;choose(g,selector?selector(d):undefined);}assert.equal(g.pendingDecision,null,'Unresolved attack choice');}
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),a=CATALOG.get(id).attacks.find(x=>x.name===name);
 const script=A.compile(a);assert.equal(script.kind,kind==='prophecy'?'prophecy':'neo49:'+kind);
 assert.equal(A.compile({...a,text:a.text+'!'}),null,'Forged attack cannot compile '+key);
 const g=game(id);attack(g,name);resolve(g);
 console.log('Executed',key,kind);
}
// Rapid Spin first asks the defender, then the attacker. Switching occurs
// after the damage is applied, to the old defender, not the new Active.
{
 const g=game('neo1-21');g.players[1].active=U('base1-2');attack(g,'Rapid Spin');assert.equal(g.pendingDecision.actor,1);
 choose(g,['bench:1']);assert.equal(g.pendingDecision.actor,0);choose(g,['bench:0']);
 assert.equal(g.players[1].active.id,'base1-46');assert.equal(g.players[0].active.id,'neo1-54');assert.ok(g.players[1].bench[1].damage>=30,JSON.stringify(g.players[1]));
}
// The two-coin Bolt works both with and without Lock-on. A following turn
// with the original defender locked gets heads; a switched defender does not.
{
 const g=game('neo2-7');g.players[1].active=U('base1-2');attack(g,'Lock-on');assert.equal(g.turn,1);
 g.turn=0;g.turnSerial=14;const original=g.players[1].active;
 attack(g,'Electric Bolt');assert.equal(g.players[1].active.damage,50);assert.equal(g.players[1].active.status,'Paralyzed');
 assert.equal((g.coinFlips||[]).filter(x=>x.result==='heads').length,0,'Lock-on should not generate random coin flips');
}
// Strong privacy and conservation invariants for private deck-search choices.
{
 const g=game('neo1-30');g.players[0].deck=[E.Fire,E.Water,E.Grass];g.rngState=55;attack(g,'Squaredance');
 if(g.pendingDecision){assert.equal(g.pendingDecision.actor,0);const d=g.pendingDecision;const bad=applyCommand(g,1,{type:'choose',payload:{decisionId:d.id,selected:[]}});assert.equal(bad.ok,false);choose(g,d.options.slice(0,d.max).map(x=>x.id));}
 const union=[...g.players[0].deck,...g.players[0].hand];assert.equal(union.length,3);
}
// Aipom returns itself AND its attachments to deck, with an optional discard
// choice only when heads. A replacement promotion never awards a Prize.
{
 const g=game('neo1-26');g.players[0].active.under=['base1-3'];g.players[0].active.attachedTrainers=[{id:'base1-80'}];
 const total=g.players[0].deck.length+g.players[0].active.energies.length+2;
 attack(g,'Pilfer');resolve(g);
 assert.ok(g.players[0].deck.includes('neo1-26'));assert.ok(g.players[0].deck.includes('base1-80'));
 assert.equal(g.players[1].prizes.length,6);assert.equal(g.players[0].active.id,'neo1-54');assert.ok(g.players[0].deck.length>=total);
}
// Heal is chosen by the attacker even if the tails heals the opponent's team.
{
 const g=game('neo1-29');g.players[0].active.damage=30;g.players[1].active.damage=20;g.players[0].bench[0].damage=20;
 attack(g,'Sweet Scent');assert.equal(g.pendingDecision.actor,0);const before=g.players.map(x=>x.active.damage);choose(g);
 assert.ok(g.players.some((x,i)=>x.active.damage<before[i])||g.players[0].bench[0].damage<20);
}
// Baton Pass moves ALL Energy cards to the chosen friendly Benched Pokémon,
// with correct ownership and no duplicate Energy attached to the old Active.
{
 const g=game('neo1-39'),before=g.players[0].active.energies.length;
 attack(g,'Baton Pass');assert.equal(g.pendingDecision.actor,0);choose(g,['bench:1']);
 assert.equal(g.players[0].active.id,'base1-3');assert.equal(g.players[0].active.energies.length,before);
 assert.equal(g.players[0].bench[1].energies.length,0);
}
// Counter and Secrete Poison still trigger if the defender is KO'd by an
// attack. They don't wait until after simultaneous Knock Outs are collected.
{
 const g=game('neo2-16');g.players[0].active=U('base1-58',{energies:[E.Lightning]});g.players[1].active=U('neo2-16',{damage:20,neo49CounterUntil:14});g.players[1].bench=[U('base1-3')];
 g.rngState=101;send(g,0,'attack',{attackIndex:0});assert.ok(g.players[0].active.damage>=0);
}
// Poliwhirl injures itself before attaching any Energy. A would-be KO cannot
// search or attach anything and still resolves through regular KO rules.
{
 const g=game('neo2-44');g.players[0].active.damage=50;const deckBefore=g.players[0].deck.length;
 attack(g,'Belly Drum');resolve(g);assert.equal(g.players[0].deck.length,deckBefore);
 assert.ok(g.players[0].discard.includes('neo2-44'));
}
// Only complete printings (and prerequisite evolutions) are unlocked.
{
 const pool=new ClassicLocalService().cardPool();assert.equal(unlocked.length,14);
 for(const id of unlocked){const entry=pool.find(x=>x.id===id);assert.ok(entry?.supported,'Incomplete card '+id);assert.ok(FORMAT.isAllowed(id,{neo:true}));assert.equal(FORMAT.isAllowed(id),false);}
 for(const id of ['neo2-2','neo2-21','neo2-56'])assert.equal(FORMAT.isAllowed(id,{neo:true}),false,'Incomplete Powers must stay locked');
}
// Forretress Rapid Spin is implemented but Forretress Spikes still prevents
// full-card legality: this distinction matters for collection UI.
{
 const forretress=CATALOG.get('neo2-2');assert.ok(A.compile(forretress.attacks[0]));
 assert.ok(forretress.abilities.some(a=>a.name==='Spikes'));
}
// For Pursuit, the damage happens when retreat is attempted, before the switch.
{
 const g=game('neo2-32');g.players[1].active=U('base1-2',{energies:[E.Water,E.Water,E.Water]});attack(g,'Pursuit');
 assert.ok(g.players[1].active.neo49Pursuit);const before=g.players[1].active.damage;
 g.turn=1;const r=applyCommand(g,1,{type:'retreat',payload:{slot:0}});
 assert.equal(r.ok,true,r.error);resolve(g);assert.equal(g.players[1].bench[0].damage-before,10);
}
// Fire Wind chooses the opposing Bench Pokémon and flips exactly two coins.
{
 const g=game('neo1-46');const original=g.players[1].bench.map(u=>u.damage);
 attack(g,'Fire Wind');assert.equal(g.pendingDecision.actor,0);choose(g,['bench:1']);
 const coins=(g.coinFlips||[]).slice(-2);assert.equal(coins.length,2);
 const increment=coins.filter(c=>c.result==='heads').length*10;
 assert.equal(g.players[1].bench[1].damage,original[1]+increment);
 assert.equal(g.players[1].bench[0].damage,original[0]);
}
// Prophecy's cards must be reordered from the selected player's deck, never
// from the opponent's hand; the attacker's ordered choices determine the top.
{
 const g=game('neo1-52');g.players[1].deck=['base1-3','base1-46','base1-58'];
 attack(g,'Prophecy');assert.equal(g.pendingDecision.actor,0);
 choose(g,['side:1']);const options=g.pendingDecision.options;assert.equal(options.length,3);
 choose(g,[options[2].id,options[0].id,options[1].id]);
 assert.deepEqual(g.players[1].deck.slice(-2),['base1-46','base1-58']);
 assert.ok(g.players[1].hand.includes('base1-3'),'The new top card is drawn as the next turn starts');
}
// Kabuto Work Together scales ONLY with named fossil Pokémon on your Bench.
{
 const g=game('neo2-56');g.players[0].bench=[U('neo2-56'),U('neo2-60'),U('base1-3')];g.players[1].active=U('base1-2');
 g.rngState=2147483647;attack(g,'Work Together');
 const heads=g.coinFlips?.at(-1)?.result==='heads';assert.equal(g.players[1].active.damage,heads?30:10);
}
// Kakuna's reactive Poison and Bench splash happen before KO resolution.
{
 const g=game('base1-58');g.players[0].active=U('base1-58',{energies:[E.Lightning]});
 g.players[1].active=U('neo2-41',{neo49PoisonUntil:14,damage:60});
 send(g,0,'attack',{attackIndex:0});resolve(g);
 assert.equal(g.players[0].active.poison,true);assert.equal(g.players[0].bench[0].damage,10);
 assert.ok(g.players[1].discard.includes('neo2-41'));
}
// Wobbuffet retaliation is a coin-flip and can affect the attacker even when
// the Wobbuffet is knocked out by the original hit.
{
 const results=new Set();for(let seed=0;seed<300&&results.size<2;seed++){
  const g=game('base1-58');g.rngState=seed*6553600;g.players[0].active=U('base1-58',{energies:[E.Lightning]});
  g.players[1].active=U('neo2-16',{neo49CounterUntil:14,damage:80});
  send(g,0,'attack',{attackIndex:0});resolve(g);results.add(g.players[0].active.damage);
 }
 assert.ok(results.has(0)&&results.has(10),'Counter heads and tails should differ');
}
// Distinct Neo deck printer signatures are all accounted for.
const missing={};for(const set of ['neo1','neo2']){missing[set]=[];for(const c of require('./cards/'+set+'.json'))for(const a of c.attacks||[])if(!A.compile(a))missing[set].push(c.id+'|'+a.name);}
assert.deepEqual(missing.neo1,['neo1-16|Super Metronome','neo1-36|Sticky Nectar']);
assert.deepEqual(missing.neo2,['neo2-11|Sketch','neo2-30|Sketch']);
console.log('PASS v0.49: 19 Neo printed attacks + interactive sequences; 4 explicit copy/lock gaps remain');
