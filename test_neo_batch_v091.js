'use strict';
const assert=require('node:assert/strict');
const ATTACK=require('./attack_effects_core');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const POWERS=require('./classic_power_core');
const {list}=require('./authentic_decks');
const {defs}=require('./neo_attack_batch_v091');
const byType={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Colorless:'base1-99'};
const unit=(id,opts={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...opts});
const printing=(id,name)=>{const a=CATALOG.get(id)?.attacks?.find(a=>a.name===name);assert.ok(a,id+': '+name);return a;};
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),a=printing(id,name),p=ATTACK.compile(a);
 assert.equal(p?.kind,'neo91:'+kind,'exact program '+key);
 assert.equal(ATTACK.compile({...a,text:a.text+' altered'}),null,'strict text '+key);
 assert.equal(ATTACK.compile({...a,cost:['Colorless','Colorless','Colorless']}),null,'strict cost '+key);
 const r=ATTACK.resolve(p,()=>{throw Error('No coin permitted');});
 assert.equal(r.damage,Number.parseInt(a.damage,10)||0);
 assert.deepEqual(r.flips,[]);
}
assert.equal(ATTACK.resolve(ATTACK.compile(printing('neo4-15','Sweet Kiss')),()=>false,{opponentOptDraw:true}).neo91OpponentDraw,true);
assert.equal(ATTACK.resolve(ATTACK.compile(printing('neo4-15','Sweet Kiss')),()=>false,{opponentOptDraw:false}).neo91OpponentDraw,undefined);

function game(id,name,{enemy='base1-15',enemyEnergy=null}={}){
 const deck=list('base1:Brushfire'),g=createGame({decks:[deck,deck],format:'online-preview',seed:91});
 g.phase='game';g.round=6;g.turn=0;g.turnSerial=12;g.rngState=333;
 g.players[0].active=unit(id,{energies:printing(id,name).cost.map(t=>byType[t])});
 g.players[1].active=unit(enemy,{energies:enemyEnergy??(enemy==='base1-56'?['base1-97']:[])});
 g.players[0].bench=[unit('base1-44')];
 g.players[1].bench=[unit('base1-44')];
 for(const p of g.players){p.hand=[];p.prizes=Array(6).fill('base1-99');}
 return g;
}
function send(g,side,type,payload={}){
 const r=applyCommand(g,side,{type,payload});
 assert.equal(r.ok,true,type+': '+r.error);
}
function attack(g,side,name){
 const id=g.players[side].active.id;
 const index=CATALOG.get(id).attacks.findIndex(a=>a.name===name);
 assert.ok(index>=0,id+' '+name);
 send(g,side,'attack',{attackIndex:index});
}
{
 const g=game('neo4-34','Stun Wave');
 assert.equal(POWERS.enabled(g,g.players[1].active,'Energy Trans'),true,'Venusaur Power starts enabled');
 attack(g,0,'Stun Wave');
 assert.equal(g.players[1].active.damage,30);
 assert.equal(g.players[1].active.powerSuppressedUntil,15);
 assert.equal(POWERS.enabled(g,g.players[1].active,'Energy Trans'),false);
 g.turnSerial=14;
 assert.equal(POWERS.enabled(g,g.players[1].active,'Energy Trans'),false,'disabled through attacking player next turn');
 g.turnSerial=15;
 assert.equal(POWERS.enabled(g,g.players[1].active,'Energy Trans'),true,'Power reactivates when effect expires');
}
{
 const g=game('neo4-34','Stun Wave',{enemy:'base1-44'});
 attack(g,0,'Stun Wave');
 assert.equal(g.players[1].active.powerSuppressedUntil,undefined,'no Power to silence');
}
{
 const g=game('neo3-42','Negative Ion',{enemy:'base1-56'});
 attack(g,0,'Negative Ion');
 assert.equal(g.players[1].active.damage,20,'10 damage doubled by Grass weakness on Onix');
 assert.equal(g.players[0].active.neo91IonGuard?.key,g.players[1].active.neo91IonAttack?.key);
 assert.equal(g.turn,1);
 attack(g,1,'Rock Throw');
 assert.equal(g.players[0].active.damage,0,'reduce printed 10 to zero before Fighting Weakness');
}
{
 const g=game('neo3-42','Negative Ion',{enemy:'base1-56'});
 attack(g,0,'Negative Ion');
 const previous=g.players[0].active;
 g.players[0].bench.push(previous);g.players[0].active=unit('neo3-42');
 attack(g,1,'Rock Throw');
 assert.equal(g.players[0].active.damage,20,'switching original Chinchou stops protection even for same-name Pokémon');
}
{
 const g=game('neo4-56','Charm',{enemy:'base1-56'});
 attack(g,0,'Charm');
 assert.equal(g.players[0].active.neo91CharmGuard?.key,g.players[1].active.neo91CharmAttack?.key);
 attack(g,1,'Rock Throw');
 assert.equal(g.players[0].active.damage,0,'Charm reduces damage before Weakness and Resistance');
}
{
 const g=game('neo4-56','Charm',{enemy:'base1-56'});
 attack(g,0,'Charm');
 const former=g.players[1].active;g.players[1].bench.push(former);
 g.players[1].active=unit('base1-56',{energies:['base1-97']});
 attack(g,1,'Rock Throw');
 assert.equal(g.players[0].active.damage,10,'Charm is tied to the original attacking Pokémon');
}
{
 const g=game('neo4-15','Sweet Kiss');
 const before=g.players[1].deck.length;
 attack(g,0,'Sweet Kiss');
 const d=g.pendingDecision;
 assert.equal(d?.actor,1,'defending player chooses whether to draw');
 assert.equal(g.players[1].active.damage,0,'attack effects wait for choice');
 const wrong=applyCommand(g,0,{type:'choose',payload:{decisionId:d.id,selected:['choice:draw']}});
 assert.equal(wrong.ok,false,'attacker cannot choose opponent card draw');
 assert.equal(g.pendingDecision?.id,d.id,'rejected choice must roll back');
 send(g,1,'choose',{decisionId:d.id,selected:['choice:draw']});
 assert.equal(g.players[1].active.damage,30);
 assert.equal(g.players[1].hand.length,2,'one Sweet Kiss draw and one turn-start draw');
 assert.equal(g.players[1].deck.length,before-2);
 assert.equal(g.pendingDecision,null);
}
{
 const g=game('neo4-15','Sweet Kiss');
 const before=g.players[1].deck.length;
 attack(g,0,'Sweet Kiss');
 const d=g.pendingDecision;assert.equal(d.actor,1);
 send(g,1,'choose',{decisionId:d.id,selected:[],decline:true});
 assert.equal(g.players[1].active.damage,30);
 assert.equal(g.players[1].hand.length,1,'decline still receives normal start-of-turn draw');
 assert.equal(g.players[1].deck.length,before-1);
}
console.log('PASS Neo v091: four exact printed attacks, linked pre-W/R guards, Power suppression timing, opponent-owned optional draw and rejected-choice rollback');
