'use strict';
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {isBasicPokemon,isEnergy,countCards}=require('./core_rules');
const {compile}=require('./attack_effects_core');
const B=['base1-57','base2-60','base5-52','base1-53','base1-61'];
const d=[...B.flatMap(id=>Array(4).fill(id)),...Array(20).fill('base1-100'),...Array(20).fill('base1-97')];
assert.equal(d.length,60);
const sum={games:0,attacks:0,choices:0,forcedSwitches:0,benchHits:0,actions:0,unfinished:0,discards:0};
function act(g,side,type,payload={}){const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type} ${JSON.stringify(payload)}: ${r.error}`);sum.actions++;assert.equal(countCards(g.players[0]),60);assert.equal(countCards(g.players[1]),60);}
for(let seed=1;seed<=100;seed++){
 const g=createGame({decks:[d,d],seed:seed*1729});
 for(let side=0;side<2;side++){
  let i=g.players[side].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));act(g,side,'setup_select',{handIndex:i});
  for(let k=0;k<2;k++){
   i=g.players[side].hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
   if(i!==-1)act(g,side,'setup_select',{handIndex:i});
  }
  act(g,side,'setup_confirm');
 }
 for(let step=0;step<550&&!g.over;step++){
  if(g.pendingDecision){
   const side=g.pendingDecision.actor,kind=g.pendingAction?.kind;
   if(kind==='attack_switch')sum.forcedSwitches++;
   act(g,side,'choose',{decisionId:g.pendingDecision.id,selected:g.pendingDecision.options.slice(0,g.pendingDecision.min).map(x=>x.id)});sum.choices++;continue;
  }
  const side=g.turn,p=g.players[side];
  let i=p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  if(i!==-1&&p.bench.length<5)act(g,side,'bench',{handIndex:i});
  const refreshed=g.players[side];
  if(!refreshed.energyUsed){
   const wanted=CATALOG.get(refreshed.active.id).attacks.flatMap(a=>a.cost||[]).filter(t=>t!=='Colorless');
   let j=refreshed.hand.findIndex(id=>isEnergy(CATALOG.get(id))&&wanted.some(t=>CATALOG.get(id).name===t+' Energy'));
   if(j===-1)j=refreshed.hand.findIndex(id=>isEnergy(CATALOG.get(id)));
   if(j!==-1)act(g,side,'attach_energy',{handIndex:j,slot:-1});
  }
  const a=CATALOG.get(p.active?.id)?.attacks||[];
  let attacked=false;
  for(let j=a.length-1;j>=0;j--){
   const prog=compile(a[j]);if(!prog)continue;
   const out=applyCommand(g,side,{type:'attack',payload:{attackIndex:j}});
   if(out.ok){sum.attacks++;sum.actions++;assert.equal(countCards(g.players[0]),60);assert.equal(countCards(g.players[1]),60);if(prog.kind.startsWith('bench')||prog.kind==='target-any')sum.benchHits++;attacked=true;break;}
  }
  if(!attacked)act(g,side,'end_turn');
 }
 if(!g.over)sum.unfinished++;
 else sum.games++;
}
assert.equal(sum.unfinished,0);
assert.ok(sum.attacks>500,`Not enough attack coverage: ${JSON.stringify(sum)}`);
assert.ok(sum.choices>100,`Too few choices: ${JSON.stringify(sum)}`);
console.log('PASS 100 seeded target/bench headless duels:',JSON.stringify(sum));
