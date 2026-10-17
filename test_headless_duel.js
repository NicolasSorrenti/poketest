'use strict';
const assert=require('node:assert/strict');
const {createGame,reduce,applyCommand,CATALOG,roomAdapter,replay}=require('./headless_duel');
const {RoomCoordinator}=require('./duel_rooms');
const {publicView}=require('./duel_protocol');
const {countCards}=require('./core_rules');
const id={hit:'base1-7',rat:'base1-61',machop:'base1-52',machoke:'base1-34',fight:'base1-97',water:'base1-102',bill:'base1-91',oak:'base1-88',potion:'base1-94',gust:'base1-93',switch:'base1-95',remove:'base1-92',seel:'base1-41',magikarp:'base1-35'};
for(const item of Object.values(id))assert.ok(CATALOG.has(item),`Historical fixture missing: ${item}`);
const deck=[...Array(4).fill(id.hit),...Array(4).fill(id.rat),...Array(4).fill(id.machop),...Array(4).fill(id.seel),...Array(4).fill(id.bill),...Array(4).fill(id.potion),...Array(4).fill(id.gust),...Array(4).fill(id.switch),...Array(4).fill(id.remove),...Array(24).fill(id.fight)];
assert.equal(deck.length,60);
const cmd=(type,payload={})=>({type,payload});
const change=(g,side,type,payload)=>{const result=applyCommand(g,side,cmd(type,payload));assert.ok(result.ok,`${type}: ${result.error}`);return g;};
const reject=(g,side,type,payload,match)=>{const snapshot=JSON.stringify(g);const result=applyCommand(g,side,cmd(type,payload));assert.equal(result.ok,false,`Expected rejection for ${type}`);if(match)assert.match(result.error,match);assert.equal(JSON.stringify(g),snapshot,'Rejected action mutated game');};
const sampleUnit=(name,energy=[],hpDamage=0)=>({id:id[name],under:[],energies:[...energy],attachedTrainers:[],damage:hpDamage,status:null,poison:false,playedTurn:0});
function ready(seed=3){let g=createGame({decks:[deck,deck],seed});g.phase='game';g.setupReady=[true,true];g.players.forEach((p,i)=>{p.active=sampleUnit(i?'seel':'hit');p.bench=[sampleUnit(i?'machop':'seel')];p.hand=[id.fight,id.rat,id.bill,id.gust,id.switch,id.remove,id.potion];p.deck=Array(15).fill(id.fight);p.prizes=Array(6).fill(id.bill);p.discard=[];p.energyUsed=false;p.retreated=false;p.turnPlays=[]});return g;}
let cases=0;
{
 const first=createGame({decks:[deck,deck],seed:2026});const second=createGame({decks:[deck,deck],seed:2026});
 assert.deepEqual(first,second);assert.equal(first.phase,'setup');
 assert.equal(countCards(first.players[0]),60);assert.equal(countCards(first.players[1]),60);
 reject(first,0,'setup_select',{handIndex:first.players[0].hand.findIndex(x=>x===id.fight)},/Basic/);
 const rooms=new RoomCoordinator(roomAdapter());const host=rooms.create(),guest=rooms.join(host.code);
 const begin=rooms.start(host.code,host.token,{decks:[deck,deck],seed:2026});
 const before=rooms.view(host.code,host.token),guestView=rooms.view(host.code,guest.token);
 assert.deepEqual(before.view.players[1].bench,[]);assert.equal(before.view.players[1].active,null);
 assert.equal(guestView.view.players[0].hand,undefined);assert.equal(guestView.view.players[0].active,null);
 let revision=begin.revision;
 for(const auth of [guest,host]){
  const view=rooms.view(host.code,auth.token);
  const i=view.view.players[auth.player].hand.findIndex(x=>['base1-7','base1-61','base1-52','base1-41'].includes(x));
  assert.ok(i>=0);
  const response=rooms.dispatch(host.code,auth.token,cmd('setup_select',{handIndex:i}),revision);revision=response.revision;
  assert.equal(rooms.view(host.code,auth.token).view.players[auth.player].active.id,view.view.players[auth.player].hand[i]);
  if(auth===guest){assert.equal(rooms.view(host.code,host.token).view.players[1].active,null);}
  const confirmed=rooms.dispatch(host.code,auth.token,cmd('setup_confirm'),revision);revision=confirmed.revision;
 }
 const joined=rooms.view(host.code,host.token).view;assert.equal(joined.phase,'game');assert.ok(joined.players[0].active&&joined.players[1].active);
 assert.equal(joined.players[1].hand,undefined);assert.equal(joined.players[1].prizes,undefined);
 assert.throws(()=>rooms.dispatch(host.code,guest.token,cmd('end_turn'),revision),/Not your turn/);
 revision=rooms.dispatch(host.code,host.token,cmd('end_turn'),revision).revision;
 assert.equal(rooms.view(host.code,guest.token).view.turn,1);
 assert.throws(()=>rooms.dispatch(host.code,guest.token,cmd('end_turn'),revision-1),/Stale/);
 cases++;
}
{
 const g=ready();
 reject(g,0,'bench',{handIndex:0},/Basic/);reject(g,1,'end_turn',{},/Not your turn/);
 change(g,0,'attach_energy',{handIndex:0,slot:-1});assert.equal(g.players[0].active.energies.length,1);
 reject(g,0,'attach_energy',{handIndex:0,slot:-1},/Illegal/);
 // Starting with actual Hitmonchan Jab: 20 damage, one Fighting Energy.
 const damage0=g.players[1].active.damage;
 change(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,damage0+20);
 assert.equal(g.turn,1);assert.equal(g.players[1].energyUsed,false);
 assert.equal(g.players[0].active.energies.length,1);
 assert.equal(g.events.length,2);cases++;
}
{
 const g=ready();g.players[0].hand=[id.machoke,id.fight];g.players[0].active=sampleUnit('machop');
 change(g,0,'evolve',{handIndex:0,slot:-1});assert.equal(g.players[0].active.id,id.machoke);
 assert.deepEqual(g.players[0].active.under,[id.machop]);reject(g,0,'evolve',{handIndex:0,slot:-1});cases++;
}
{
 const g=ready();g.players[0].hand=[id.switch,id.gust,id.potion,id.remove,id.bill,id.oak];
 reject(g,0,'play_trainer',{handIndex:1,target:20},/Illegal/);
 change(g,0,'play_trainer',{handIndex:0});assert.ok(g.pendingDecision);
 assert.equal(publicView(g,1).pendingDecision.options,undefined);
 reject(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['slot:0']},/another player/);
 reject(g,0,'end_turn',{},/Resolve/);
 let dec=g.pendingDecision.id;
 reject(g,0,'choose',{decisionId:dec,selected:['slot:90']},/Invalid option/);
 change(g,0,'choose',{decisionId:dec,decline:true});assert.equal(g.players[0].hand[0],id.switch);
 change(g,0,'play_trainer',{handIndex:0});dec=g.pendingDecision.id;
 change(g,0,'choose',{decisionId:dec,selected:['slot:0']});assert.equal(g.players[0].active.id,id.seel);
 assert.equal(g.players[0].discard.includes(id.switch),true);
 reject(g,0,'choose',{decisionId:dec,selected:['slot:0']},/No pending/);
 // Gust changes opponent Active using the same decision contract.
 change(g,0,'play_trainer',{handIndex:0});dec=g.pendingDecision.id;
 change(g,0,'choose',{decisionId:dec,selected:['slot:0']});assert.equal(g.players[1].active.id,id.machop);
 cases++;
}
{
 const g=ready();g.players[0].hand=[id.potion,id.remove,id.bill,id.oak];g.players[0].active.damage=40;
 change(g,0,'play_trainer',{handIndex:0});let dec=g.pendingDecision.id;change(g,0,'choose',{decisionId:dec,selected:['slot:-1']});assert.equal(g.players[0].active.damage,20);
 g.players[1].active.energies=[id.fight];change(g,0,'play_trainer',{handIndex:0});dec=g.pendingDecision.id;change(g,0,'choose',{decisionId:dec,selected:['slot:-1']});assert.equal(g.players[1].active.energies.length,0);assert.equal(g.players[1].discard.at(-1),id.fight);
 const before=g.players[0].hand.length;change(g,0,'play_trainer',{handIndex:0});assert.equal(g.players[0].hand.length,before+1);cases++;
}
{
 const g=ready();g.players[0].hand=[id.remove,id.switch];g.players[1].active.energies=[id.fight,id.water];
 change(g,0,'play_trainer',{handIndex:0});const first=g.pendingDecision.id;
 change(g,0,'choose',{decisionId:first,selected:['slot:-1']});
 const second=g.pendingDecision.id;assert.notEqual(first,second);
 assert.equal(g.players[0].hand[0],id.remove,'Trainer cost not yet paid mid-choice');
 reject(g,0,'choose',{decisionId:first,selected:['slot:-1']},/Stale/);
 change(g,0,'choose',{decisionId:second,selected:['energy:1']});
 assert.deepEqual(g.players[1].active.energies,[id.fight]);
 assert.equal(g.players[1].discard.at(-1),id.water);
 assert.equal(g.players[0].discard.at(-1),id.remove);
 assert.equal(g.pendingDecision,null);cases++;
}
{
 const g=ready();g.players[0].active.energies=[id.fight,id.water,id.fight];
 change(g,0,'retreat',{slot:0});assert.equal(g.pendingDecision.actor,0);
 assert.equal(g.players[0].active.id,id.hit,'No Energy has been paid yet');
 const dec=g.pendingDecision.id;
 reject(g,0,'choose',{decisionId:dec,selected:['energy:0']},/Wrong number/);
 change(g,0,'choose',{decisionId:dec,selected:['energy:1','energy:2']});
 assert.equal(g.players[0].active.id,id.seel);
 assert.deepEqual(g.players[0].bench[0].energies,[id.fight]);
 assert.deepEqual(g.players[0].discard,[id.fight,id.water]);
 reject(g,0,'retreat',{slot:0},/Insufficient retreat Energy/);cases++;
}
{
 const g=ready();g.players[0].active.energies=[id.fight];g.players[1].active=sampleUnit('rat');g.players[1].active.damage=15;
 g.players[1].bench=[sampleUnit('machop'),sampleUnit('seel')];
 const prizes=g.players[0].prizes.length;
 change(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].prizes.length,prizes-1);assert.equal(g.turn,0);
 assert.equal(g.pendingDecision.actor,1);
 reject(g,0,'choose',{decisionId:g.pendingDecision.id,selected:['bench:0']},/another player/);
 reject(g,1,'attach_energy',{handIndex:0,slot:-1},/Resolve/);
 change(g,1,'choose',{decisionId:g.pendingDecision.id,selected:['bench:1']});assert.equal(g.players[1].active.id,id.seel);assert.equal(g.turn,1);
 assert.equal(g.players[1].discard.includes(id.rat),true);
 assert.equal(g.pendingDecision,null);cases++;
}
{
 const g=ready();g.players[0].active.energies=[id.fight];g.players[1].active=sampleUnit('rat');g.players[1].active.damage=15;g.players[1].bench=[];
 change(g,0,'attack',{attackIndex:0});assert.equal(g.over,true);assert.equal(g.winner,0);cases++;
}
{
 const g=ready();g.players[0].active=sampleUnit('magikarp',[id.water]);
 // Tackle is printed 10 damage with no extra text, but Magikarp also has scripted moves.
 assert.ok(CATALOG.get(id.magikarp).attacks.some(a=>a.text));
 const flail=CATALOG.get(id.magikarp).attacks.findIndex(a=>a.name==='Flail');
 assert.equal(require('./attack_effects_core').compile(CATALOG.get(id.magikarp).attacks[flail]).kind,'flail-counters');
 g.players[0].active={...sampleUnit('hit',[id.water,id.water,id.water]),id:'base1-5'};
 const unsupported=CATALOG.get('base1-5').attacks.findIndex(a=>a.name==='Metronome');
 const metronomePreview=structuredClone(g);
 change(metronomePreview,0,'attack',{attackIndex:unsupported});
 assert.equal(metronomePreview.pendingAction?.kind,'final_attack');
 assert.equal(metronomePreview.pendingAction?.plan.stage,'opponent-attack');
 reject(g,0,'use_power',{name:'Anything'},/migrated/);
 reject(g,0,'play_trainer',{handIndex:0},/Not a Trainer/);
 cases++;
}
{
 // Random invalid commands never mutate; valid sequential actions remain deterministic.
 let s=123456;const rand=n=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s%n};
 const run=()=>{const g=ready(44);g.players.forEach(p=>p.deck=Array(100).fill(id.fight));let ok=0,bad=0;
  for(let i=0;i<2000;i++){
   if(g.over)break;
   const actor=i%100===0?g.turn:rand(2), type=i%100===0?'end_turn':['attach_energy','bench','play_trainer','retreat','end_turn','evolve','attack','choose'][rand(8)];
   const command=cmd(type,{handIndex:rand(12)-2,slot:rand(8)-2,target:rand(8)-2,attackIndex:rand(5)-1,decisionId:'madeup',selected:['slot:0']});
   const before=JSON.stringify(g),out=reduce(g,actor,command);
   if(!out.ok){bad++;assert.equal(JSON.stringify(g),before);}else{ok++;assert.notEqual(out.game,g);Object.assign(g,out.game);}
  }
  return {ok,bad,final:g};
 };
 const out=run();assert.equal(out.ok+out.bad,2000);assert.ok(out.ok>0&&out.bad>0);cases++;
}
{
 const seed=55;const original=createGame({decks:[deck,deck],seed});
 const moves=[];
 for(let side=0;side<2;side++){
  const index=original.players[side].hand.findIndex(id=>['base1-7','base1-52','base1-61','base1-41'].includes(id));
  moves.push({side,command:cmd('setup_select',{handIndex:index})});
  change(original,side,'setup_select',{handIndex:index});
  moves.push({side,command:cmd('setup_confirm')});change(original,side,'setup_confirm');
 }
 moves.push({side:0,command:cmd('end_turn')});change(original,0,'end_turn');
 moves.push({side:1,command:cmd('end_turn')});change(original,1,'end_turn');
 assert.deepEqual(replay({decks:[deck,deck],seed},moves),original);
 assert.throws(()=>replay({decks:[deck,deck],seed},[...moves,{side:0,command:cmd('choose',{decisionId:'bogus'})}]),/Replay failed at command 6/);
 cases++;
}
{
 const g=ready();g.players[0].active.energies=[id.fight];
 const special='neo1-104'; // Darkness Energy: bonus damage requires a handler.
 g.players[1].active.energies=[special];
 reject(g,0,'attack',{attackIndex:0},/modifiers/);
 const powered=[...CATALOG.values()].find(c=>c.supertype==='Pokémon'&&(c.abilities||[]).length&&(c.subtypes||[]).includes('Basic'));
 assert.ok(powered);
 g.players[1].bench.push(sampleUnit('rat'));g.players[1].bench.at(-1).id=powered.id;
 reject(g,0,'attack',{attackIndex:0},/Power requires/);
 cases++;
}
console.log(`PASS headless duel: ${cases} comprehensive groups, 2,000 adversarial command attempts, private two-human room setup, full simple actions, Trainer choices, KO and opponent-turn promotion`);
