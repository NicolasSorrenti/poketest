'use strict';
const assert=require('node:assert/strict');
const {CATALOG,createGame,applyCommand,reduce}=require('./headless_duel');
const {compile,resolve}=require('./attack_effects_core');
const {applyCondition,clearConditions,checkup}=require('./special_conditions_core');
const deck=[...Array(4).fill('base1-7'),...Array(4).fill('base1-61'),...Array(4).fill('base1-52'),...Array(4).fill('base1-41'),...Array(4).fill('base1-91'),...Array(4).fill('base1-94'),...Array(4).fill('base1-93'),...Array(4).fill('base1-95'),...Array(4).fill('base1-92'),...Array(24).fill('base1-97')];
function unit(id,energies=[]){return {id,under:[],energies:[...energies],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:0};}
function ready(a='base1-7',b='base1-7',energies=[]){
 const g=createGame({decks:[deck,deck],seed:51});g.phase='game';g.setupReady=[true,true];g.players.forEach((p,i)=>{
  p.active=unit(i?b:a,i?[]:energies);p.bench=[unit('base1-61'),unit('base1-52')];p.hand=[];
  p.prizes=Array(6).fill('base1-91');p.deck=Array(12).fill('base1-97');p.discard=[];p.energyUsed=false;p.retreated=false;p.confusedRetreatFailed=false;
 });return g;
}
function action(g,side,type,payload={}){const out=applyCommand(g,side,{type,payload});assert.equal(out.ok,true,`${type} failed: ${out.error}`);return g;}
function invalid(g,side,type,payload={},pattern){const before=JSON.stringify(g),out=reduce(g,side,{type,payload});assert.equal(out.ok,false,`${type} unexpectedly accepted`);if(pattern)assert.match(out.error,pattern);assert.equal(JSON.stringify(g),before,'Rejected request mutated input');}
const GRASS='base1-99',PSYCHIC='base1-101',FIRE='base1-98',FIGHT='base1-97';
assert.equal(CATALOG.get(GRASS).name,'Grass Energy');
assert.equal(CATALOG.get(PSYCHIC).name,'Psychic Energy');
assert.equal(CATALOG.get(FIRE).name,'Fire Energy');
const patterns={};for(const c of CATALOG.values())for(const a of c.attacks||[]){const prog=compile(a);if(prog)patterns[prog.kind]=(patterns[prog.kind]||0)+1;}
assert.ok((patterns.status||0)+(patterns['coin-status-alias']||0)>=48);assert.ok((patterns['coin-status']||0)+(patterns['coin-status-alias']||0)>=141);assert.ok((patterns.recoil||0)>=1);assert.ok((patterns['coin-recoil']||0)>=1);assert.ok((patterns['draw-one']||0)>=1);
let cases=0;
{
 const u=unit('base1-7');applyCondition(u,'Poisoned');applyCondition(u,'Asleep');
 assert.equal(u.poison,true);assert.equal(u.status,'Asleep');
 const ch=checkup(u,()=>false,false);assert.equal(ch.poisonDamage,10);assert.equal(ch.woke,false);
 applyCondition(u,'Confused');assert.equal(u.status,'Confused');assert.equal(u.poison,true);
 clearConditions(u);assert.equal(u.status,null);assert.equal(u.poison,false);cases++;
}
{
 // Guaranteed Poison: damage, then Poison checkup on *both* turns.
 const g=ready('base1-66','base1-7',Array(3).fill(GRASS));
 action(g,0,'attack',{attackIndex:1});
 assert.equal(g.players[1].active.poison,true);
 assert.equal(g.players[1].active.damage,30,'20 from attack, 10 Poison between turns');
 assert.equal(g.turn,1);
 action(g,1,'end_turn');assert.equal(g.players[1].active.damage,40);
 // Poisoned does not prohibit attack; only Asleep/Paralyzed do.
 g.players[0].active.poison=true;
 g.players[0].active.energies=[GRASS,GRASS,GRASS];
 action(g,0,'attack',{attackIndex:1});assert.ok(g.players[0].active.damage>=10);
 cases++;
}
{
 // The recipient may immediately wake after its opponent's turn, but
 // can also remain Asleep and be blocked on its own turn.
 const g=ready('base1-29','base1-7',[PSYCHIC]);g.rngState=0; // next flip = tails with unbiased high-bit coin RNG
 action(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.status,'Asleep');
 invalid(g,1,'attack',{attackIndex:0},/Special Condition/);
 invalid(g,1,'retreat',{slot:0},/Cannot retreat/);
 g.rngState=1000;action(g,1,'end_turn');assert.equal(g.players[1].active.status,null);
 cases++;
}
{
 const g=ready('base1-43','base1-7',[FIGHT]);g.rngState=1000; // heads for coin status
 action(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.status,'Paralyzed');
 invalid(g,1,'attack',{attackIndex:0},/Special Condition/);
 g.rngState=1000;action(g,1,'end_turn');assert.equal(g.players[1].active.status,null);
 cases++;
}
{
 const g=ready('base1-49','base1-7',[PSYCHIC,PSYCHIC]);g.rngState=1000;
 action(g,0,'attack',{attackIndex:1});assert.equal(g.players[1].active.status,'Confused');
 // On failed Confusion flip, attack fails and the attacker suffers 20
 // self damage under Base–Neo rules (not the modern 30-counter rule).
 g.rngState=0;g.players[1].active.energies=[FIGHT];
 const targetDamage=g.players[0].active.damage;
 action(g,1,'attack',{attackIndex:0});
 assert.equal(g.players[0].active.damage,targetDamage);
 assert.equal(g.players[1].active.damage,40,'Confuse Ray dealt 20 from weakness, then 20 self damage');
 assert.equal(g.players[1].active.status,'Confused');cases++;
}
{
 const g=ready('base1-49','base1-7',[PSYCHIC,PSYCHIC]);g.rngState=1000;
 action(g,0,'attack',{attackIndex:1});g.rngState=1000;
 g.players[1].active.energies=[FIGHT];
 action(g,1,'attack',{attackIndex:0});assert.equal(g.players[0].active.damage,20,'Heads allows confused Pokémon to attack');cases++;
}
{
 // WotC retreat from Confusion pays first; on tails it remains active,
 // consumes the Energy, and cannot repeat before recovering or next turn.
 const g=ready('base1-7','base1-7',[FIGHT,FIGHT]);g.players[0].active.status='Confused';g.rngState=0;
 action(g,0,'retreat',{slot:0});assert.equal(g.players[0].active.id,'base1-7');
 assert.equal(g.players[0].active.energies.length,0);assert.equal(g.players[0].discard.length,2);
 invalid(g,0,'retreat',{slot:0},/Cannot retreat/);
 cases++;
}
{
 const g=ready('base1-7','base1-7',[FIGHT,FIGHT]);g.players[0].active.status='Confused';g.players[0].active.poison=true;g.rngState=1000;
 action(g,0,'retreat',{slot:0});assert.equal(g.players[0].active.id,'base1-61');
 assert.equal(g.players[0].bench[0].status,null);assert.equal(g.players[0].bench[0].poison,false);cases++;
}
{
 // Self recoil is affected by Weakness/Resistance; mutual KOs can occur.
 const g=ready('base1-3','base1-61',Array(4).fill(FIGHT));g.players[0].bench=[unit('base1-7')];
 g.players[1].active.damage=0;g.players[0].active.damage=50;
 action(g,0,'attack',{attackIndex:1});
 assert.equal(g.players[1].discard.includes('base1-61'),true);
 assert.equal(g.players[0].discard.includes('base1-3'),true);
 assert.equal(g.players[0].prizes.length,5);assert.equal(g.players[1].prizes.length,5);
 assert.equal(g.players[0].active.id,'base1-7');
 assert.equal(g.pendingDecision.actor,1,'Opponent selects replacement after dual KO');
 action(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['bench:1']});
 assert.equal(g.turn,1);cases++;
}
{
 // 100% historical recovery test: Poison Knock Out during Checkup.
 const g=ready('base1-7','base1-61',[FIGHT]);g.players[1].active.poison=true;g.players[1].active.damage=20;
 action(g,0,'end_turn');
 assert.equal(g.players[1].discard.includes('base1-61'),true);
 assert.equal(g.players[0].prizes.length,5);
 assert.equal(g.pendingDecision?.actor,1);
 action(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['bench:0']});
 assert.equal(g.turn,1);cases++;
}
{
 // Drawing from an empty deck by effect is not the same as failing the
 // mandatory start-of-turn draw. A Fetch with no cards is not instant loss.
 const g=ready('base2-5','base1-7',[FIGHT]);g.players[0].deck=[];
 action(g,0,'attack',{attackIndex:0});assert.equal(g.over,false);assert.equal(g.turn,1);
 g.players[1].deck=[];action(g,1,'end_turn');assert.equal(g.over,true);assert.equal(g.winner,1);cases++;
}
console.log(`PASS historical headless conditions: ${cases} full state-transition scenarios; status, coin outcomes, recoil, double KOs, Poison between turns, no-loss attack draw, WotC Confusion retreat`);
