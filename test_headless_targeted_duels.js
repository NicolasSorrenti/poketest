'use strict';
// Complete historical-card matches. Uses the actual room-ready reducer,
// not synthetic damage calls, and validates conservation at every step.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {countCards,isBasicPokemon,isEnergy}=require('./core_rules');
const {compile}=require('./attack_effects_core');
const I={pikachu:'base2-60',pidgey:'base1-57',hitmonlee:'base3-7',rattata:'base1-61',machop:'base1-52',seel:'base1-41',L:'base1-100',F:'base1-97',W:'base1-102'};
const mons=['pikachu','pidgey','hitmonlee','rattata','machop','seel'].map(k=>I[k]);
const deck=[...mons.flatMap(id=>Array(4).fill(id)),...Array(18).fill(I.L),...Array(9).fill(I.F),...Array(9).fill(I.W)];assert.equal(deck.length,60);
function cmd(g,side,type,payload={}){return applyCommand(g,side,{type,payload});}
let games=0,attacks=0,targetAttacks=0,switchAttacks=0,choices=0,turns=0,prizes=0;
for(let seed=1;seed<=60;seed++){
 const g=createGame({decks:[deck,deck],format:'classic',seed:seed*101+4});
 for(let side=0;side<2;side++){
  let p=g.players[side];const i=p.hand.findIndex(id=>isBasicPokemon(CATALOG.get(id)));
  assert.ok(i>=0);assert.ok(cmd(g,side,'setup_select',{handIndex:i}).ok);
  for(let j=0;j<3;j++){
   p=g.players[side];const k=p.hand.findIndex(id=>mons.includes(id));if(k===-1)break;
   assert.ok(cmd(g,side,'setup_select',{handIndex:k}).ok);
  }
  assert.ok(cmd(g,side,'setup_confirm').ok);
 }
 for(let step=0;step<700&&!g.over;step++){
  if(g.pendingDecision){const d=g.pendingDecision,prev=g.turn;
   const out=cmd(g,d.actor,'choose',{decisionId:d.id,selected:[d.options[0].id]});
   assert.ok(out.ok,`seed ${seed}, step ${step} decision ${d.kind}: ${out.error}`);
   if(d.actor!==prev)choices++;continue;
  }
  const side=g.turn,before=g.players[side].prizes.length;
  let p=g.players[side];
  const basic=p.hand.findIndex(id=>mons.includes(id));
  if(basic>=0&&p.bench.length<5){const out=cmd(g,side,'bench',{handIndex:basic});assert.ok(out.ok,out.error);p=g.players[side];}
  let active=CATALOG.get(p.active.id);const energyPreference=active.name==='Pikachu'?[I.L,I.F,I.W]:active.name==='Hitmonlee'||active.name==='Machop'?[I.F,I.L,I.W]:active.name==='Seel'?[I.W,I.L,I.F]:[I.L,I.F,I.W];
  const e=energyPreference.find(id=>p.hand.includes(id));
  if(e&&!p.energyUsed){const out=cmd(g,side,'attach_energy',{handIndex:p.hand.indexOf(e),slot:-1});assert.ok(out.ok,out.error);}
  const attacking=CATALOG.get(p.active.id).attacks||[];
  let used=false;
  for(const [idx,a] of attacking.entries()){
   const program=compile(a);if(!program)continue;
   const out=cmd(g,side,'attack',{attackIndex:idx});
   if(!out.ok)continue;
   if(program.kind==='bench-target')targetAttacks++;
   if(program.kind==='switch-defender')switchAttacks++;
   attacks++;used=true;break;
  }
  if(!used){const out=cmd(g,side,'end_turn');assert.ok(out.ok,`seed ${seed} step ${step}: ${out.error}`);turns++;}
  prizes+=Math.max(0,before-g.players[side].prizes.length);
  for(const owner of g.players)assert.equal(countCards(owner),60,`Seed ${seed} step ${step}: card conservation`);
 }
 assert.equal(g.over,true,`Seed ${seed} never completed`);games++;
}
assert.ok(attacks>200);assert.ok(targetAttacks>20,`Only ${targetAttacks} targets`);assert.ok(switchAttacks>10,`Only ${switchAttacks} switches`);
console.log(`PASS 60 complete historical targeted duels: ${attacks} attacks (${targetAttacks} targeted Bench, ${switchAttacks} Whirlwind), ${choices} opponent-turn choices, ${turns} other turns, conservation of both 60-card decks`);
