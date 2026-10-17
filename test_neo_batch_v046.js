'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const ATTACK=require('./attack_effects_core');
const FORMAT=require('./classic_format');
const {ClassicLocalService}=require('./classic_local_service');
const {ids}=require('./neo_v046_pool');
const {definitions}=require('./neo_attack_batch_v046');
const G=require('./neo_genesis_decks'),D=require('./neo_discovery_decks');
const E={Grass:'neo1-108',Water:'neo1-111',Lightning:'neo1-109',Metal:'neo1-19',Fighting:'neo1-106',Darkness:'neo1-104',Fire:'neo1-107',Psychic:'neo1-110'};
const unit=(id,patch={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...patch});
function match(id,{energy=[],enemy='base1-58',enemyEnergy=[],bench=[],enemyBench=['neo1-66','neo1-71'],damage=0,seed=1,hand=[],deck=[]}={}){
 const g=createGame({decks:[G.list('cold_fusion'),D.list('wallop')],format:'online-preview',seed:seed+1000});
 g.phase='game';g.turn=0;g.turnSerial=12;g.round=5;g.rngState=seed;g.message=[];
 g.players[0].active=unit(id,{energies:[...energy],damage});g.players[0].bench=bench.map(id=>unit(id));
 g.players[1].active=unit(enemy,{energies:[...enemyEnergy]});g.players[1].bench=enemyBench.map(id=>unit(id));
 g.players[0].hand=[...hand];if(deck.length)g.players[0].deck=[...deck];
 return g;
}
function send(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,r.error+' ('+type+')');return g;}
function use(g,name){const index=CATALOG.get(g.players[0].active.id).attacks.findIndex(a=>a.name===name);assert.ok(index>=0,name);return send(g,0,'attack',{attackIndex:index});}
for(const [key] of Object.entries(definitions)){
 const [id,name]=key.split('|'),a=CATALOG.get(id).attacks.find(a=>a.name===name);assert.ok(ATTACK.compile(a),key);
 const comp=ATTACK.compile({...a,text:a.text+' altered!'});
 assert.equal(comp,null,`Modified ${key} must NOT silently resolve`);
}
const pool=new ClassicLocalService().cardPool();
for(const id of ids){const card=pool.find(c=>c.id===id);assert.ok(card&&card.supported,'Missing compiled card '+id);assert.equal(FORMAT.isAllowed(id,{neo:true}),true);assert.equal(FORMAT.isAllowed(id),false);
 const deck=[...G.list('cold_fusion')],at=deck.findIndex(c=>c.startsWith('neo'));deck[at]=id;
 const legal=FORMAT.validateDeck(deck,CATALOG,{neo:true,gymFull:true});assert.ok(legal.valid,id+' '+legal.errors.join('; '));
}
assert.equal(FORMAT.isAllowed('neo1-1',{neo:true}),false,'Ampharos requires complete Flaaffy line before enabling');
// Cleffa Eeeeeeek conserves all hand cards and refills to seven.
{
 const g=match('neo1-20',{hand:['base1-91','base1-95','base1-98'],deck:['base1-3','base1-46','base1-58','neo1-69'],energy:[E.Grass]});
 use(g,'Eeeeeeek');assert.equal(g.players[0].hand.length,7);assert.equal(g.players[0].deck.length,0);
 assert.deepEqual(new Set(g.players[0].hand),new Set(['base1-91','base1-95','base1-98','base1-3','base1-46','base1-58','neo1-69']));
}
// Metal Wing shield applies to next opposing attack, and tails does not.
{
 let heads=0,tails=0;
 for(let seed=1;seed<=1000;seed++){
  const g=match('neo1-13',{energy:[E.Metal,E.Grass,E.Grass],seed});use(g,'Steel Wing');
  const active=g.players[0].active;
  const protectedByWing=Boolean(active.shield);
  if(protectedByWing){heads++;assert.equal(active.shield.reduce,20);}else tails++;
  g.players[1].active.energies=[E.Lightning,E.Grass];
  const before=active.damage;
  send(g,1,'attack',{attackIndex:1});
  const inflicted=g.players[0].active.damage-before;
  assert.equal(inflicted,protectedByWing?0:20,JSON.stringify({seed,shield:active.shield,flip:g.coinFlips,enemyAttack:CATALOG.get('base1-58').attacks[1],attackerStatus:g.players[1].active?.status,dmg:inflicted}));
  if(heads&&tails)break;
 }
 assert.ok(heads>0&&tails>0);
}
// Chikorita's Deflector halves (rounds DOWN to tens) attacks next turn.
{
 const g=match('neo1-53',{energy:[E.Grass]});use(g,'Deflector');
 assert.equal(g.players[0].active.shield.half,true);
 g.players[1].active.energies=[E.Lightning,E.Lightning];
 send(g,1,'attack',{attackIndex:1});assert.equal(g.players[0].active.damage,10);
}
// Snubbull's Roar MUST be a coin and on heads the defender chooses replacement.
{
 let yes=0,no=0;
 for(let seed=1;seed<1000;seed++){
  const g=match('neo1-74',{energy:[E.Grass],seed});use(g,'Roar');
  if(g.pendingDecision){yes++;assert.equal(g.pendingDecision.actor,1);assert.equal(g.pendingDecision.kind,'pokemon-target');send(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['bench:1']});assert.equal(g.players[1].active.id,'neo1-71');}
  else{no++;assert.equal(g.players[1].active.id,'base1-58');}
  if(yes&&no)break;
 }
 assert.ok(yes&&no,'Roar must reach both outcomes');
}
// Weedle's Spike Stab is zero damage on tails, poison and 20 on heads.
{
 const outcomes=new Set();
 for(let seed=1;seed<1000;seed++){
  const g=match('neo2-70',{energy:[E.Grass],seed});use(g,'Spike Stab');
  const flip=g.coinFlips.at(-1)?.result;
  outcomes.add(flip);
  if(flip==='heads'){assert.equal(g.players[1].active.poison,true);assert.ok(g.players[1].active.damage>=20);}
  else{assert.equal(g.players[1].active.poison,false);assert.equal(g.players[1].active.damage,0);}
  if(outcomes.size===2)break;
 }
 assert.deepEqual([...outcomes].sort(),['heads','tails']);
}
// Corsola Recover uses the existing AUTHORITY-controlled Energy discard choice.
{
 const g=match('neo2-37',{energy:[E.Water,E.Grass],damage:40});use(g,'Recover');
 assert.equal(g.pendingDecision?.actor,0);assert.equal(g.pendingDecision?.kind,'energy-discard');
 send(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['energy:1']});
 assert.equal(g.players[0].active.damage,0);assert.deepEqual(g.players[0].active.energies,[E.Water]);assert.ok(g.players[0].discard.includes(E.Grass));
}
// Corsola's Spike Cannon always flips twice, for 0, 30, or 60.
{
 const outcomes=new Set();for(let seed=1;seed<1000;seed++){
  const g=match('neo2-37',{energy:[E.Fighting,E.Fighting],enemy:'base1-2',seed});use(g,'Spike Cannon');
  outcomes.add(g.players[1].active.damage);assert.equal(g.message.filter(x=>x.includes('Coin flip:')).length,2);
  if(outcomes.size===3)break;
 }
 assert.deepEqual([...outcomes].sort((a,b)=>a-b),[0,30,60]);
}
// Plunder removes all defender-attached Trainers BEFORE damage, not the attacker’s.
{
 const g=match('neo2-39',{energy:[E.Darkness,E.Grass]});
 g.players[1].active.attachedTrainers=[{id:'base1-80',expires:15},{id:'gym2-101'}];
 const original=JSON.stringify(g.players[0].active);
 use(g,'Plunder');assert.equal(g.players[1].active.attachedTrainers.length,0);
 assert.ok(g.players[1].discard.includes('base1-80'));assert.ok(g.players[1].discard.includes('gym2-101'));
 assert.equal(JSON.stringify(g.players[0].active),original);assert.equal(g.players[1].active.damage,30,'Darkness Energy boosts Plunder damage by 10');
}
// Non-Metal attackers with attached Metal Energy lose 10 attack damage before
// Weakness/Resistance; non-Dark Darkness Energy hosts take end-turn recoil.
{
 const g=match('neo1-69',{energy:[E.Metal,E.Fighting,E.Fighting]});use(g,'Rage');
 assert.equal(g.players[1].active.damage,0,'Metal on non-Metal Onix must reduce Rage 10 to zero');
}
{
 const g=match('neo1-69',{energy:[E.Darkness]});use(g,'Screech');
 assert.equal(g.players[0].active.damage,10,'Darkness Energy on non-Dark Onix causes end-turn recoil');
}
{
 const g=match('neo2-39',{energy:[E.Darkness,E.Grass]});use(g,'Plunder');
 assert.equal(g.players[0].active.damage,0,'Darkness Energy has no end-turn recoil on Dark-type Houndour');
}
console.log('PASS v0.46: 8 printed Neo attacks, 12 whole playable printings, coin outcomes, shields, energy payment, deck conservation, Roar choices, and Plunder');
