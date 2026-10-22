'use strict';
// Reproducible whole-deck duels: mixed damage, Paralyzed, Poisoned and Confused.
const assert=require('node:assert/strict');
const {createGame,applyCommand,CATALOG}=require('./headless_duel');
const {countCards,isBasicPokemon,isEnergy}=require('./core_rules');
const {compile}=require('./attack_effects_core');
const ID={abra:'base1-43',drowzee:'base1-49',tangela:'base1-66',hit:'base1-7',psychic:'base1-101',grass:'base1-99',fighting:'base1-97'};
const pokemon=[ID.abra,ID.drowzee,ID.tangela,ID.hit];
const deck=[...pokemon.flatMap(id=>Array(4).fill(id)),...Array(16).fill(ID.psychic),...Array(16).fill(ID.grass),...Array(12).fill(ID.fighting)];
assert.equal(deck.length,60);
const act=(g,side,type,payload={})=>applyCommand(g,side,{type,payload});
let completed=0,attemptedAttacks=0,successfulAttacks=0,conditionAttacks=0,knockouts=0,turns=0;
for(let seed=1;seed<=60;seed++){
 const g=createGame({decks:[deck,deck],format:'classic',seed:seed*79,format:'classic'});
 for(let side=0;side<2;side++){
  const p=g.players[side];
  // Prefer variable status attackers rather than identical starting positions.
  const preference=[pokemon[seed%4],...pokemon];
  const preferred=preference.find(id=>p.hand.includes(id));
  const selected=p.hand.indexOf(preferred);
  assert.ok(act(g,side,'setup_select',{handIndex:selected}).ok);
  for(let i=0;i<2;i++){
   const idx=g.players[side].hand.findIndex(id=>pokemon.includes(id));if(idx<0)break;
   {const out=act(g,side,'setup_select',{handIndex:idx});assert.ok(out.ok,`seed ${seed} side ${side}: ${out.error}`);}
  }
  assert.ok(act(g,side,'setup_confirm').ok);
 }
 if(g.mulliganBonus)assert.ok(act(g,g.mulliganBonus.side,'setup_bonus_draw',{count:0}).ok);
 for(let step=0;step<700&&!g.over;step++){
  if(g.pendingDecision){const d=g.pendingDecision,decision=act(g,d.actor,'choose',{decisionId:d.id,selected:[d.options[0].id]});assert.ok(decision.ok,`Seed ${seed} failed choice: ${decision.error}`);continue;}
  const side=g.turn;let p=g.players[side];
  // Field management actions are real validated commands against the room engine.
  const benchIndex=p.hand.findIndex(id=>pokemon.includes(id));
  if(benchIndex!==-1&&p.bench.length<4){const out=act(g,side,'bench',{handIndex:benchIndex});assert.ok(out.ok,out.error);p=g.players[side];}
  const active=p.active&&CATALOG.get(p.active.id).name;
  const energyPreference=active==='Drowzee'?[ID.psychic,ID.fighting,ID.grass]:active==='Tangela'?[ID.grass,ID.psychic,ID.fighting]:active==='Hitmonchan'?[ID.fighting,ID.psychic,ID.grass]:[ID.psychic,ID.fighting,ID.grass];
  const energyId=energyPreference.find(id=>p.hand.includes(id));
  if(energyId&&!p.energyUsed){const out=act(g,side,'attach_energy',{handIndex:p.hand.indexOf(energyId),slot:-1});assert.ok(out.ok,out.error);p=g.players[side];}
  // Prefer attacks that demonstrate newly migrated behavior, then safe fallbacks.
  const attacks=CATALOG.get(p.active.id).attacks||[];
  const choices=attacks.map((a,i)=>({i,p:compile(a)})).filter(x=>x.p).sort((a,b)=>{
   const priority=x=>x.p.kind==='status'?5:x.p.kind==='coin-status'?4:x.p.kind==='recoil'?3:1;
   return priority(b)-priority(a);
  });
  let attacked=false;
  for(const option of choices){attemptedAttacks++;const beforePrize=g.players[side].prizes.length;
   const result=act(g,side,'attack',{attackIndex:option.i});
   if(!result.ok)continue;
   successfulAttacks++;if(option.p.kind==='status'||option.p.kind==='coin-status')conditionAttacks++;
   knockouts+=Math.max(0,beforePrize-g.players[side].prizes.length);attacked=true;break;
  }
  if(!attacked){const out=act(g,side,'end_turn');assert.ok(out.ok,out.error);turns++;}
  for(const owner of g.players)assert.equal(countCards(owner),60,`Card count changed: seed ${seed}, step ${step}`);
 }
 assert.ok(g.over,`Seed ${seed} failed to complete`);
 assert.ok(g.winner===0||g.winner===1||g.winner===null);
 completed++;
}
assert.ok(conditionAttacks>50,`Too few historical condition attacks exercised: ${conditionAttacks}`);
assert.equal(completed,60);
console.log(`PASS 60 completed status-heavy seeded duels: ${successfulAttacks} attacks (${conditionAttacks} status attacks), ${knockouts} attack KOs, ${turns} no-attack turns; card conservation verified for every match`);
