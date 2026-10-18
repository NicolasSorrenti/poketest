'use strict';
const assert=require('node:assert/strict');
const {createGame,CATALOG,reduce}=require('./headless_duel');
const {countCards}=require('./core_rules');
const AI=require('./cpu_policy');

const IDS={hit:'base1-7',rat:'base1-61',machop:'base1-52',fight:'base1-97',bill:'base1-91',potion:'base1-94',gust:'base1-93',switch:'base1-95'};
const deck=[...Array(4).fill(IDS.hit),...Array(4).fill(IDS.rat),...Array(4).fill(IDS.machop),
 ...Array(4).fill(IDS.bill),...Array(4).fill(IDS.potion),...Array(4).fill(IDS.gust),
 ...Array(4).fill(IDS.switch),...Array(32).fill(IDS.fight)];
assert.equal(deck.length,60);
assert.equal(Object.keys(AI.SKILLS).length,5);
assert.equal(Object.keys(AI.PERSONALITIES).length,6);
assert.throws(()=>AI.configuration({level:0}),/1/);
assert.throws(()=>AI.configuration({personality:'cheater'}),/personality/);
for(let level=2;level<=5;level++){
 const lower=AI.SKILLS[level-1],higher=AI.SKILLS[level];
 assert.ok(higher.sampleWindow<lower.sampleWindow,
  'Competence must narrow the pool of possible strategic misjudgments');
 assert.ok(higher.temperature<lower.temperature,
  'Stronger opponents must inject strictly less decision noise');
 assert.ok(higher.attention>lower.attention,
  'Skill must still increase the intended analysis budget');
}
const settings={level:3,personality:'balanced',side:1,seed:47};

{
 const game=createGame({decks:[deck,deck],seed:120,format:'classic'});
 const projected=AI.observation(game,1);
 assert.equal(projected.opponent.hand,undefined);
 assert.equal(projected.opponent.deck,undefined);
 assert.equal(projected.opponent.prizes,undefined);
 assert.equal(projected.self.deck,undefined);
 const decision=AI.chooseAction(game,settings);
 assert.equal(decision.command.type,'setup_select','Opening setup must choose an Active');
 assert.equal(reduce(game,1,decision.command).ok,true);
 const identical=AI.chooseAction(structuredClone(game),settings);
 assert.deepEqual(decision.command,identical.command,'Seeded policy must be reproducible');
 const hidden=structuredClone(game);
 // Change only concealed hand and deck contents, not public counts.
 const foe=hidden.players[0];
 if(foe.deck.length&&foe.hand.length){const old=foe.hand[0];foe.hand[0]=foe.deck[0];foe.deck[0]=old;}
 assert.deepEqual(AI.chooseAction(hidden,settings)?.command,decision.command,
  'Opponent hidden cards must not alter a CPU decision');
}

{
 // Regressions for mandatory payment choices: selecting only the first Energy
 // cannot cover a two-unit retreat where Double Colorless must pay alone.
 const game=createGame({decks:[deck,deck],seed:33,format:'classic'});
 const o=AI.observation(game,1);o.phase='game';o.turn=1;
 o.decision={id:'retreat:1',actor:1,kind:'energy-discard',
  label:'Choose Energy cards providing at least 2 retreat units',min:1,max:2,optional:false,
  options:[{id:'energy:0',label:'Water Energy'},{id:'energy:1',label:'Double Colorless Energy'}]};
 const options=AI.candidates(o,AI.configuration({side:1,level:1}),{powerKeys:new Set()});
 assert.ok(options.some(c=>c.type==='choose'&&c.payload.selected.length===1&&c.payload.selected[0]==='energy:1'),
  'Beginner must still consider a valid Double Colorless payment');
 o.decision=null;
 o.self.active={id:IDS.hit,energies:[IDS.fight],damage:0};
 o.self.bench=[{id:IDS.machop,energies:[],damage:0}];
 o.self.hand=['base1-79'];o.self.energyUsed=true;
 o.opponent.active={id:IDS.rat,energies:[],damage:0};
 assert.ok(!AI.candidates(o,AI.configuration({side:1,level:5}),{trainers:0,powerKeys:new Set()})
   .some(c=>c.type==='play_trainer'),
   'Super Energy Removal must not begin without a legal opposing Energy target');
}
{
 const o={self:{active:{id:'base1-63',energies:['base1-102'],damage:0},bench:[]},
  opponent:{active:{id:'base1-61',energies:['base1-97'],damage:0},bench:[]}};
 const action={type:'attack',payload:{attackIndex:0}};
 const risky=AI.score(action,o,AI.configuration({level:3,personality:'risk_taking'}),{});
 const neutral=AI.score(action,o,AI.configuration({level:3,personality:'balanced'}),{});
 const defensive=AI.score(action,o,AI.configuration({level:3,personality:'defensive'}),{});
 assert.ok(risky>neutral&&neutral>defensive,
  'Personality should visibly affect preferences on coin-flip attacks independently of skill');
}
{
 // Champion builds its first backup before spending the turn on a cheap hit.
 const g=createGame({decks:[deck,deck],seed:109,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,energies:[IDS.fight],damage:0};
 o.self.bench=[];o.self.hand=[IDS.machop];
 o.opponent.active={id:IDS.hit,energies:[],damage:0}; // do not override an immediate KO
 const cfg=AI.configuration({level:5,side:1});
 const benchAction={type:'bench',payload:{handIndex:0}};
 const jab={type:'attack',payload:{attackIndex:0}};
 assert.ok(AI.score(benchAction,o,cfg,{})>AI.score(jab,o,cfg,{}),
  'Experienced player should establish a backup when entirely unbenched');
 o.self.bench=[{id:IDS.machop,energies:[],damage:0}];
 o.self.hand=['base1-88'];o.self.deckCount=32;o.self.handCount=8;
 assert.ok(AI.score({type:'play_trainer',payload:{handIndex:0}},o,cfg,{})<
  AI.score(jab,o,cfg,{}),'Champion should preserve an already-useful hand instead of dumping it with Oak');
 const basic=AI.configuration({level:1,side:1});
 o.self.hand=[IDS.fight];o.self.energyUsed=false;
 o.self.active.energies=[];o.self.bench=[];
 assert.equal(AI.candidates(o,basic,{trainers:0,powerKeys:new Set()})
  .filter(c=>c.type==='attack').length,0,'An empty-Energy Active must not propose unaffordable attacks');
 o.self.hand=['base1-34'];o.self.active={id:IDS.machop,energies:[],playedTurn:o.round,damage:0};
 assert.ok(!AI.candidates(o,cfg,{trainers:0,powerKeys:new Set()})
  .some(c=>c.type==='evolve'),'First-turn evolution must be excluded before reducer probes');
}
{
 const g=createGame({decks:[deck,deck],seed:91,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,energies:[IDS.fight,IDS.fight],damage:0};
 o.self.bench=[];o.self.hand=[IDS.fight,'base1-84','base1-93'];
 o.opponent.active={id:'base1-46',energies:[],damage:20};
 o.opponent.bench=[{id:'base1-46',energies:[],damage:30}];
 const experienced=AI.configuration({side:1,level:5});
 const beginner=AI.configuration({side:1,level:1});
 const energy={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const experiencedValue=AI.score(energy,o,experienced,{});
 const basicValue=AI.score(energy,o,beginner,{});
 assert.ok(experiencedValue>basicValue,
  'Experienced AI should value the next stronger attack unlocked by Energy');
 const casual=AI.configuration({side:1,level:2});
 assert.ok(AI.score(energy,o,casual,{})>basicValue,
  'Casual should also recognize some immediate future attack damage, unlike Beginner');
 const plusPower={type:'play_trainer',payload:{handIndex:1}};
 assert.ok(AI.score(plusPower,o,experienced,{})>AI.score({type:'attack',payload:{attackIndex:0}},o,experienced,{}),
  'Strong AI should prepare a PlusPower KO when immediate damage is insufficient');
 const gust={type:'play_trainer',payload:{handIndex:2}};
 const valueWithGust=AI.score(gust,o,experienced,{});
 o.opponent.bench=[];
 assert.ok(AI.score(gust,o,experienced,{})<valueWithGust,
  'Gust utility must depend on a genuinely vulnerable opponent Bench');
}
{
 const {NPC_PROFILES,profileForNpc}=require('./cpu_profiles');
 const {ClassicLocalService}=require('./classic_local_service');
 assert.equal(Object.keys(NPC_PROFILES).length,8);
 assert.deepEqual(profileForNpc('reina'),{level:4,personality:'aggressive'});
 assert.deepEqual(profileForNpc('akari'),{level:5,personality:'tactical'});
 assert.throws(()=>profileForNpc('unknown'),/Unknown CPU NPC/);
 const service=new ClassicLocalService();
 const first=service.create({npc:'reina',seed:41,deck:'blackout',opponent:'brushfire'});
 assert.deepEqual(first.cpu,{level:4,personality:'aggressive',npc:'reina',advancedTactics:false});
 const second=service.create({npc:'reina',difficulty:1,personality:'defensive',seed:42});
 assert.deepEqual(second.cpu,{level:1,personality:'defensive',npc:'reina',advancedTactics:false},
  'An RPG NPC identity must not constrain independent skill and temperament overrides');
}
{
 const g=createGame({decks:[deck,deck],seed:125,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:'base1-35',energies:['base1-102'],damage:20};
 o.opponent.active={id:'base1-46',energies:[],damage:0};
 const champion=AI.configuration({side:1,level:5});
 assert.ok(AI.score({type:'attack',payload:{attackIndex:1}},o,champion,{})>
  AI.score({type:'attack',payload:{attackIndex:0}},o,champion,{}),
  'A wounded Magikarp must recognize Flail damage counters instead of rating it as printed flat 10');
}
{
 // Regression: once-per-turn flags are deliberately hidden from publicView,
 // but remain available in the current player's own state. Losing them forced
 // hundreds of guaranteed-failing reducer probes in every arena.
 const game=createGame({decks:[deck,deck],seed:41,format:'classic'});
 game.players[1].energyUsed=true;game.players[1].retreated=true;
 let o=AI.observation(game,1);
 assert.equal(o.self.energyUsed,true);
 assert.equal(o.self.retreated,true);
 assert.equal(o.opponent.hand,undefined);
 o.phase='game';o.turn=1;
 o.self.active={id:IDS.rat,energies:[IDS.fight],damage:0};
 o.self.bench=[{id:IDS.machop,energies:[],damage:0}];
 o.self.hand=[IDS.fight];
 o.opponent.active={id:IDS.hit,energies:[IDS.fight],damage:0};
 let proposed=AI.candidates(o,AI.configuration({level:5,side:1}),{powerKeys:new Set()});
 assert.ok(!proposed.some(a=>a.type==='attach_energy'),
  'No second Energy attachment after one was used this turn');
 assert.ok(!proposed.some(a=>a.type==='retreat'),
  'No second retreat after one was used this turn');
 o.self.energyUsed=false;o.self.retreated=false;
 proposed=AI.candidates(o,AI.configuration({level:5,side:1}),{powerKeys:new Set()});
 assert.ok(proposed.some(a=>a.type==='attach_energy'));
 assert.ok(proposed.some(a=>a.type==='retreat'));
}
{
 let inspected=0;
 for(let seed=30;seed<140&&inspected<12;seed++){
  const game=createGame({decks:[deck,deck],seed,format:'classic'});
  const hand=game.players[1].hand;
  if(hand.filter(id=>['base1-7','base1-61','base1-52'].includes(id)).length<2)continue;
  const first=AI.chooseAction(game,{side:1,level:5,seed:7});
  assert.equal(first.command.type,'setup_select');
  const next=AI.chooseAction(first.game,{side:1,level:5,seed:7});
  assert.equal(next.command.type,'setup_select',
   'Champion should place a backup Basic during setup instead of immediately confirming');
  inspected++;
 }
 assert.ok(inspected>=5,'Opening Bench test must exercise at least five multi-Basic hands');
}
{
 // A defensive retreat must weigh whether the replacement can survive the
 // known opposing attack, not simply reward the outgoing Pokémon being low HP.
 const game=createGame({decks:[deck,deck],seed:5,format:'classic'});
 const o=AI.observation(game,1);
 o.phase='game';o.turn=1;
 o.self.active={id:IDS.rat,damage:30,energies:[IDS.fight],status:null};
 o.self.bench=[{id:IDS.hit,damage:0,energies:[IDS.fight],status:null}];
 o.opponent.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 const expert=AI.configuration({level:5,side:1});
 const action={type:'retreat',payload:{slot:0}};
 const favorable=AI.score(action,o,expert,{});
 o.self.bench[0]={id:IDS.rat,damage:30,energies:[IDS.fight],status:null};
 const dangerous=AI.score(action,o,expert,{});
 assert.ok(favorable>dangerous+90,
  'Do not retreat into an equally exposed replacement when an attack can KO it');
}
{
 const attacker={id:IDS.hit,damage:0,energies:[]},defender={id:'base1-46',damage:20,energies:[]};
 const times={damage:'20x',text:'Flip 2 coins. This attack does 20 damage times the number of heads.'};
 const failure={damage:'30',text:'Flip a coin. If tails, this attack does nothing.'};
 const bonus=CATALOG.get('base1-11').attacks.find(a=>a.name==='Thrash');
 const nidoking={id:'base1-11',damage:0,energies:[]};
 const fullHpCharmander={id:'base1-46',damage:10,energies:[]};
 assert.equal(AI.knockoutChance(times,attacker,defender),.25,
  'Two heads needed in two independent fair coin flips');
 assert.equal(AI.knockoutChance(failure,attacker,defender),.5,
  'A zero-damage tails result must not be treated as a guaranteed KO');
 assert.equal(AI.knockoutChance(bonus,nidoking,fullHpCharmander),.5,
  'Nidoking Thrash takes a KO on 40-HP remaining only on heads, despite its recoil on tails');
 assert.equal(AI.knockoutChance({damage:'30',text:''},attacker,defender),1,
  'A deterministic affordable 30-damage attack is a certain KO');
}
{
 const game=createGame({decks:[deck,deck],seed:60,format:'classic'});
 const o=AI.observation(game,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 o.opponent.active={id:IDS.machop,damage:0,energies:[IDS.fight],status:null};
 o.opponent.bench=[
  {id:'base1-50',damage:20,energies:[],status:null}, // Ghost: 10 HP, resists Fighting
  {id:'base1-46',damage:30,energies:[],status:null}  // Charmander: 20 HP, vulnerable to Jab
 ];
 o.decision={id:'gust:1',actor:1,label:'Choose opposing Benched Pokémon to switch',
  kind:'bench',min:1,max:1,options:[{id:'bench:0',label:'Gastly'},{id:'bench:1',label:'Charmander'}]};
 const cfg=AI.configuration({level:5,side:1});
 const choose=i=>({type:'choose',payload:{decisionId:o.decision.id,selected:['bench:'+i]}});
 assert.ok(AI.score(choose(1),o,cfg,{})>AI.score(choose(0),o,cfg,{}),
  'Gust must prefer a guaranteed KO over a lower-HP Pokémon that resists the Active');
 o.self.bench=[
  {id:'base1-50',damage:0,energies:['base1-101'],status:null},
  {id:IDS.hit,damage:0,energies:[IDS.fight],status:null}
 ];
 o.opponent.active={id:'base1-46',damage:30,energies:[],status:null};
 o.decision={id:'promote:1',actor:1,label:'Choose your Benched Pokémon to promote',
  kind:'bench',min:1,max:1,options:[{id:'bench:0',label:'Gastly'},{id:'bench:1',label:'Hitmonchan'}]};
 assert.ok(AI.score(choose(1),o,cfg,{})>AI.score(choose(0),o,cfg,{}),
  'Forced promotion must prefer the ready winning attacker instead of an unready one');
}
{
 const game=createGame({decks:[deck,deck],seed:161,format:'classic'});
 const o=AI.observation(game,1);
 o.phase='setup';o.self.active=null;o.self.bench=[];
 o.self.hand=[IDS.hit,'base1-63','base1-102']; // Hitmonchan, Squirtle, Water Energy
 const choose=i=>({type:'setup_select',payload:{handIndex:i}});
 const expert=AI.configuration({level:5,side:1});
 const beginner=AI.configuration({level:1,side:1});
 assert.ok(AI.score(choose(1),o,expert,{})>AI.score(choose(0),o,expert,{}),
  'Champion should lead Squirtle when only Water Energy is available in opening hand');
 assert.ok(AI.score(choose(0),o,beginner,{})>AI.score(choose(1),o,beginner,{}),
  'Novice might instead pick the impressive Hitmonchan without planning its Energy');
 o.self.hand=[IDS.hit,'base1-63',IDS.fight];
 assert.ok(AI.score(choose(0),o,expert,{})>AI.score(choose(1),o,expert,{}),
  'Champion should reverse opening choice when its hand contains Fighting Energy');
}
{
 // A two-card setup line: two Fighting Energy support only Machop's
 // Low Kick, but evolving to Machoke THEN attaching another Fighting Energy
 // unlocks Karate Chop. Neither move alone can produce that attack.
 const g=createGame({decks:[deck,deck],seed:871,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;o.round=5;o.turnSerial=8;
 o.self.active={id:IDS.machop,damage:0,playedTurn:2,energies:[IDS.fight,IDS.fight],status:null};
 o.self.hand=['base1-34',IDS.fight];
 o.self.energyUsed=false;
 o.opponent.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 const champion=AI.configuration({side:1,level:5,planning:true});
 const noPlan=AI.configuration({side:1,level:5,planning:false});
 const evolve={type:'evolve',payload:{handIndex:0,slot:-1}};
 const energy={type:'attach_energy',payload:{handIndex:1,slot:-1}};
 assert.ok(AI.planningBonus(evolve,o,champion)>0,
  'Champion should forecast a two-step evolve/attach attack line');
 assert.ok(AI.planningBonus(energy,o,champion)>0,
  'Champion should also recognize attach/then/evolve as a viable line');
 assert.equal(AI.planningBonus(evolve,o,noPlan),0,
  'The baseline policy must remain independently benchmarkable');
 assert.equal(AI.configuration({side:1,level:3}).planning,false);
 assert.equal(AI.configuration({side:1,level:5}).planning,false,
  'Unproven planning experiment must remain opt-in on production difficulty');
 assert.throws(()=>AI.configuration({planning:'yes'}),/planning/);
 const hidden=structuredClone(g);
 const enemy=hidden.players[0];
 if(enemy.deck.length&&enemy.hand.length)[enemy.hand[0],enemy.deck[0]]=[enemy.deck[0],enemy.hand[0]];
 assert.deepEqual(AI.observation(hidden,1),AI.observation(g,1),
  'The planner observation must remain unchanged by opposing hidden-hand swaps');
 assert.equal(AI.planningBonus(evolve,structuredClone(o),champion),
  AI.planningBonus(evolve,o,champion),'Forecast must be pure and deterministic');
}
{
 const g=createGame({decks:[deck,deck],seed:991,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:'base1-34',damage:70,playedTurn:1,
  energies:[IDS.fight,IDS.fight,IDS.fight,IDS.fight],status:null};
 o.self.bench=[{id:IDS.machop,damage:0,energies:[],status:null}];
 o.opponent.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 const chop={type:'attack',payload:{attackIndex:0}};
 const submission={type:'attack',payload:{attackIndex:1}};
 assert.ok(AI.score(chop,o,AI.configuration({level:5}),{})>
  AI.score(submission,o,AI.configuration({level:5}),{}),
  'Champion should not use Submission for a self-KO without winning a Prize');
 assert.ok(AI.score(submission,o,AI.configuration({level:1}),{})>
  AI.score(chop,o,AI.configuration({level:1}),{}),
  'Beginner may favor raw damage without appreciating the self-KO consequence');
}
{
 const g=createGame({decks:[deck,deck],seed:931,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 o.self.hand=[IDS.bill,'base1-88'];
 o.self.deckCount=2;
 o.opponent.active={id:IDS.rat,damage:0,energies:[IDS.fight],status:null};
 const champion=AI.configuration({level:5,side:1});
 const beginner=AI.configuration({level:1,side:1});
 const used={trainers:0,powerKeys:new Set(),powers:0,stadium:false};
 const trainerNames=(cfg)=>AI.candidates(o,cfg,used).filter(x=>x.type==='play_trainer').map(x=>CATALOG.get(o.self.hand[x.payload.handIndex]).name);
 assert.deepEqual(trainerNames(champion),[],
  'Champion must not consume its last two cards with Bill or Oak when deckout looms');
 assert.ok(trainerNames(beginner).includes('Bill'),
  'Beginner may still misplay risky final draws');
 o.self.deckCount=8;
 assert.ok(trainerNames(champion).includes('Professor Oak'),
  'Champion can resume Oak when enough cards remain to draw another turn');
}
{
 // Verify the opt-in planner on an actual post-setup game, not only during
 // initial hand selection. Opponent concealed cards and future RNG cannot be
 // inputs to a strategic preference.
 let game=createGame({decks:[deck,deck],seed:12093,format:'classic'});
 game=AI.driveSide(game,{side:0,level:5,seed:87}).game;
 game=AI.driveSide(game,{side:1,level:5,seed:91}).game;
 assert.equal(game.phase,'game');
 const settings={side:game.turn,level:5,seed:99,planning:true};
 const first=AI.chooseAction(game,settings);
 assert.ok(first?.command,'Planning enabled must produce a legal action');
 const hidden=structuredClone(game);
 const unseen=hidden.players[1-game.turn];
 if(unseen.deck.length&&unseen.hand.length)
  [unseen.deck[0],unseen.hand[0]]=[unseen.hand[0],unseen.deck[0]];
 hidden.rngState=(hidden.rngState^0x9e3779b9)>>>0;
 const after=AI.chooseAction(hidden,settings);
 assert.deepEqual(after?.command,first.command,
  'Midgame forecast must ignore unrevealed opposing hand/deck and future flips');
}
{
 const {argumentsOf,arena}=require('./benchmark_cpu');
 const normal=argumentsOf(['--pairs','1','--max-turns','4','--left-level','5','--right-level','5']);
 const defaultReport=arena(normal);
 assert.equal(defaultReport.baseline.planning,false,
  'The benchmark must truthfully report that unproven planning is off by default');
 assert.equal(defaultReport.challenger.planning,false);
 const experimental=argumentsOf(['--pairs','1','--max-turns','4','--left-level','5',
  '--right-level','5','--left-planning','true','--right-planning','false']);
 const report=arena(experimental);
 assert.equal(report.baseline.planning,true);
 assert.equal(report.challenger.planning,false);
 assert.throws(()=>argumentsOf(['--left-planning','maybe']),/Planning/);
}
{
 // Evolving a ready Machop into an Energy-starved Machoke throws away Low Kick
 // and can lose a Prize race. A Champion should attack first, but may evolve
 // after sufficient Energy is available to preserve its damage output.
 const g=createGame({decks:[deck,deck],seed:12098,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;o.round=4;o.turnSerial=6;
 o.self.active={id:IDS.machop,energies:[IDS.fight],damage:0,playedTurn:2,status:null};
 o.self.bench=[{id:IDS.hit,energies:[],damage:0,playedTurn:2,status:null}];
 o.self.hand=['base1-34'];o.self.energyUsed=false;
 o.opponent.active={id:IDS.rat,damage:10,energies:[],status:null};
 const ch=AI.configuration({side:1,level:5,evolutionTempo:true});
 const baseline=AI.configuration({side:1,level:5,evolutionTempo:false});
 const ev={type:'evolve',payload:{handIndex:0,slot:-1}};
 const att={type:'attack',payload:{attackIndex:0}};
 assert.ok(AI.evolutionTempoPenalty(o,-1,'base1-34',ch)>180,
  'Mature CPU recognizes a guaranteed KO lost by premature evolution');
 assert.ok(AI.score(att,o,ch,{})>AI.score(ev,o,ch,{}),
  'Champion must claim the knockout rather than strand its Active');
 // The legacy policy already knows about immediate KO bonuses. Remove that
 // bonus to isolate the genuine flaw: evolving gives up ordinary attack tempo.
 o.opponent.active={id:IDS.hit,damage:0,energies:[],status:null};
 assert.ok(AI.score(ev,o,baseline,{})>AI.score(att,o,baseline,{}),
  'Comparison baseline retains the previous naive non-KO evolution preference');
 o.self.active.energies=[IDS.fight,IDS.fight];
 o.self.hand=['base1-34',IDS.fight];
 assert.equal(AI.evolutionTempoPenalty(o,-1,'base1-34',ch),0,
  'Evolution is safe when an Energy in the current hand unlocks a good attack this turn');
 o.self.hand=['base1-34'];
 assert.ok(AI.evolutionTempoPenalty(o,-1,'base1-34',ch)>0);
 o.self.active.energies=[IDS.fight,IDS.fight,IDS.fight];
 assert.equal(AI.evolutionTempoPenalty(o,-1,'base1-34',ch),0,
  'Do not penalize evolution that already has enough attached Energy');
 o.self.active.energies=[IDS.fight];o.self.active.status='Asleep';
 assert.equal(AI.evolutionTempoPenalty(o,-1,'base1-34',ch),0,
  'An evolution that cures a blocking condition should remain viable');
 assert.throws(()=>AI.configuration({evolutionTempo:'yes'}),/evolution-tempo/);
}
{
 // Energy Removal has a staged choice. Against a powered Active Hitmonchan
 // and a weak Bench Rattata, removing Energy from the active attacker should
 // take priority even though the Bench has fewer remaining HP.
 const g=createGame({decks:[deck,deck],seed:777,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.machop,damage:0,energies:[IDS.fight],status:null};
 o.opponent.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 o.opponent.bench=[{id:IDS.rat,damage:0,energies:[IDS.fight],status:null}];
 o.decision={id:'classic-trainer:1',kind:'target',actor:1,
  label:'Choose opposing Pokémon',min:1,max:1,optional:false,
  options:[{id:'slot:-1',label:'Active: Hitmonchan'},
   {id:'slot:0',label:'Bench: Rattata'}]};
 const active={type:'choose',payload:{decisionId:'classic-trainer:1',selected:['slot:-1']}};
 const bench={type:'choose',payload:{decisionId:'classic-trainer:1',selected:['slot:0']}};
 const champion=AI.configuration({level:5,side:1});
 const novice=AI.configuration({level:1,side:1});
 assert.ok(AI.score(active,o,champion,{})>AI.score(bench,o,champion,{}),
  'Skilled Energy Removal targets the currently attacking threat');
 assert.ok(AI.score(bench,o,novice,{})>AI.score(active,o,novice,{}),
  'Novice may instead target the weaker-looking Benched Pokémon');
 o.opponent.active.energies=[];
 assert.ok(AI.score(bench,o,champion,{})>AI.score(active,o,champion,{}),
  'An opponent Bench attacker with Energy is the right target when Active has none');
 assert.equal(AI.candidates(o,champion,{powerKeys:new Set()}).filter(x=>x.type==='choose').length,2,
  'Target selection still uses the same authoritative choice-command interface');
}
{
 // The second Energy Removal decision must choose the Energy that actually
 // disables the target's affordable attack, not the first Energy in its list.
 const game=createGame({decks:[deck,deck],seed:887,format:'classic'});
 game.pendingAction={kind:'classic_trainer',plan:{side:1,
  data:{target:['slot:-1'],source:['slot:-1']}}};
 const o=AI.observation(game,1);
 assert.equal(o.pendingTrainerTarget,-1);
 assert.equal(o.pendingTrainerSource,-1);
 o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,energies:[IDS.fight,'base1-102'],damage:0,status:null};
 o.opponent.active={id:IDS.hit,energies:[IDS.fight,'base1-102'],damage:0,status:null};
 o.decision={id:'classic-trainer:4',kind:'enemyEnergy',actor:1,
  label:'Choose opposing Energy to discard',min:1,max:1,optional:false,
  options:[{id:'n:0',label:'Fighting Energy'},{id:'n:1',label:'Water Energy'}]};
 const champion=AI.configuration({side:1,level:5});
 const choose=i=>({type:'choose',payload:{decisionId:o.decision.id,selected:['n:'+i]}});
 assert.ok(AI.score(choose(0),o,champion,{})>AI.score(choose(1),o,champion,{}),
  'Removing Fighting must be better than irrelevant Water on enemy Hitmonchan');
 o.decision={...o.decision,kind:'ownEnergy',label:'Discard one of your attached Energy'};
 assert.ok(AI.score(choose(1),o,champion,{})>AI.score(choose(0),o,champion,{}),
  'Super Energy Removal should pay spare Water instead of essential Fighting');
 const opposite=structuredClone(game);opposite.pendingAction.plan.side=0;
 const hidden=AI.observation(opposite,1);
 assert.equal(hidden.pendingTrainerTarget,null);
 assert.equal(hidden.pendingTrainerSource,null);
 assert.equal(hidden.opponent.hand,undefined);
}
{
 const g=createGame({decks:[deck,deck],seed:241,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.prizeCount=1;o.opponent.prizeCount=4;
 o.self.active={id:IDS.machop,damage:0,energies:[IDS.fight],status:null};
 o.self.bench=[];o.self.hand=[IDS.fight];
 o.opponent.active={id:IDS.rat,damage:10,energies:[],status:null};
 o.opponent.bench=[{id:IDS.hit,damage:0,energies:[],status:null}];
 const race=AI.configuration({side:1,level:5,prizeRace:true});
 const old=AI.configuration({side:1,level:5,prizeRace:false});
 const attack={type:'attack',payload:{attackIndex:0}};
 assert.ok(AI.prizeRaceBonus(attack,o,race)>=500,
  'Guaranteed last Prize from Low Kick must dominate optional setup');
 assert.equal(AI.prizeRaceBonus(attack,o,old),0,
  'Baseline remains available for blinded controlled comparison');
 o.self.prizeCount=4;o.opponent.prizeCount=1;
 o.opponent.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 o.self.active={id:IDS.rat,damage:20,energies:[IDS.fight],status:null};
 o.self.bench=[{id:IDS.hit,damage:0,energies:[IDS.fight],status:null}];
 let retreat={type:'retreat',payload:{slot:0}};
 assert.ok(AI.prizeRaceBonus(retreat,o,race)>=100,
  'When the opponent needs one Prize, a safe retreat prevents a known loss');
 o.opponent.active.status='Asleep';
 assert.equal(AI.prizeRaceBonus(retreat,o,race),0,
  'An Asleep enemy with a powered attack is not an immediate attack threat');
 o.opponent.active.status=null;
 o.self.bench[0]={id:IDS.rat,damage:20,energies:[],status:null};
 assert.equal(AI.prizeRaceBonus(retreat,o,race),0,
  'Do not flee into another Pokémon that loses to the same public counterattack');
 assert.throws(()=>AI.configuration({prizeRace:'yes'}),/Prize-race/);
 assert.equal(AI.configuration({level:5}).prizeRace,false,
  'Experimental game-tree evaluation remains disabled by default');
}
{
 const {argumentsOf,arena}=require('./benchmark_cpu');
 const opts=argumentsOf(['--pairs','1','--max-turns','4','--left-level','5','--right-level','5',
   '--left-prize-race','true','--right-prize-race','false']);
 const result=arena(opts);
 assert.equal(result.baseline.prizeRace,true);
 assert.equal(result.challenger.prizeRace,false);
 assert.throws(()=>argumentsOf(['--left-prize-race','maybe']),/Planning/);
}
{
 const {arena,argumentsOf}=require('./benchmark_cpu');
 const result=arena(argumentsOf(['--pairs','2','--max-turns','8','--seed','87002',
  '--left-level','5','--right-level','5','--left-prize-race','true','--right-prize-race','false']));
 assert.equal(result.totalMatches,4);
 assert.equal(result.prizeRace,undefined);
 assert.equal(result.baseline.prizeRace,true);
 assert.equal(result.challenger.prizeRace,false);
 assert.equal(result.winCausesByRole.length,2);
 assert.equal(result.meanFinalPrizesByRole.length,2);
 for(let role=0;role<2;role++){
  assert.equal(Object.values(result.winCausesByRole[role]).reduce((n,x)=>n+x,0),
   role===0?result.wins:result.losses,
   'Win reasons must account for all conclusive results without inventing new wins');
  assert.ok(result.meanFinalPrizesByRole[role]>=0&&result.meanFinalPrizesByRole[role]<=6);
 }
}
{
 const {arena,argumentsOf,wilson}=require('./benchmark_cpu');
 const report=arena(argumentsOf(['--pairs','3','--seed','21987',
  '--max-turns','12','--left-level','5','--right-level','4','--target-upset-rate','0.05']));
 assert.equal(report.upsetTarget.higherLevel,5);
 assert.equal(report.upsetTarget.lowerLevel,4);
 assert.equal(report.upsetTarget.targetMaximum,0.05);
 assert.equal(report.upsetTarget.applicable,true);
 assert.equal(report.upsetTarget.totalMatchUpsetRate,report.losses/report.totalMatches);
 assert.equal(report.upsetTarget.decisiveUpsetRate,
  report.conclusiveMatches?report.losses/report.conclusiveMatches:null);
 assert.equal(report.upsetTarget.statisticallyVerified,
  report.conclusiveMatches>0&&wilson(report.losses,report.conclusiveMatches).upper<=.05);
 const same=arena(argumentsOf(['--pairs','1','--max-turns','3','--left-level','5','--right-level','5']));
 assert.equal(same.upsetTarget.applicable,false,
  'Unranked same-skill comparisons must not be counted as lower-level upsets');
 assert.equal(same.upsetTarget.statisticallyVerified,false);
 assert.throws(()=>argumentsOf(['--target-upset-rate','-0.1']),/upset rate/);
 assert.throws(()=>argumentsOf(['--target-upset-rate','0.8']),/upset rate/);
 assert.ok(wilson(0,10).upper>.05,'Ten undefeated games cannot prove a <=5% upset rate');
}
{
 const g=createGame({decks:[deck,deck],seed:541,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,energies:[IDS.fight],damage:0,status:null};
 o.opponent.active={id:IDS.rat,energies:[],damage:10,status:null};
 o.opponent.bench=[{id:IDS.machop,energies:[],damage:0,status:null}];
 o.self.hand=[IDS.machop];o.self.bench=[];
 const act={type:'attack',payload:{attackIndex:0}};
 const strong=AI.configuration({side:1,level:5,knockoutTempo:true});
 const old=AI.configuration({side:1,level:5,knockoutTempo:false});
 assert.equal(AI.knockoutTempoBonus(act,o,strong),0,
  'First build a backup if a knockout cannot finish the duel and otherwise leaves an empty Bench');
 o.self.bench=[{id:IDS.machop,energies:[],damage:0,status:null}];
 assert.ok(AI.knockoutTempoBonus(act,o,strong)>=120,
  'Secured Prize should beat optional development once a safe backup is established');
 assert.equal(AI.knockoutTempoBonus(act,o,old),0);
 o.self.bench=[];o.self.prizeCount=1;
 assert.ok(AI.knockoutTempoBonus(act,o,strong)>=500,
  'Immediate game-winning final Prize takes priority even without any backup');
 o.self.prizeCount=4;o.opponent.bench=[];
 assert.ok(AI.knockoutTempoBonus(act,o,strong)>=500,
  'Knocking out the last opposing Pokémon is also a game win');
 o.opponent.bench=[{id:IDS.hit,energies:[],damage:0,status:null}];
 o.opponent.active={id:IDS.hit,energies:[IDS.fight],damage:0,status:null};
 o.self.bench=[{id:IDS.machop,energies:[],damage:0,status:null}];
 assert.equal(AI.knockoutTempoBonus(act,o,strong),0,
  'Do not treat a non-KO attack as an earned Prize');
 assert.equal(AI.configuration({level:5}).knockoutTempo,false);
 assert.throws(()=>AI.configuration({knockoutTempo:'yes'}),/knockout-tempo/);
 const {argumentsOf,arena}=require('./benchmark_cpu');
 const opts=argumentsOf(['--pairs','1','--max-turns','4','--left-level','5',
  '--right-level','5','--left-knockout-tempo','true','--right-knockout-tempo','false']);
 const report=arena(opts);
 assert.equal(report.baseline.knockoutTempo,true);
 assert.equal(report.challenger.knockoutTempo,false);
}
{
 const {parse,audit}=require('./benchmark_cpu_tiers');
 const opts=parse(['--pairs','1','--max-turns','8','--seed','31819','--decks','blackout,brushfire']);
 const result=audit(opts);
 assert.equal(result.aggregatedAdjacent.length,4);
 assert.equal(result.perDeck.length,8);
 assert.equal(result.totalGames,16);
 for(const row of result.aggregatedAdjacent){
  assert.equal(row.total,row.higherWins+row.lowerWins+row.draws);
  assert.equal(row.decisive,row.higherWins+row.lowerWins);
  assert.ok(row.confidence95.upper>=row.lowerWinRateDecisive||row.decisive===0);
 }
 assert.throws(()=>parse(['--target','0.75']),/target/);
 assert.throws(()=>parse(['--decks',',']),/deck list/);
}
{
 const g=createGame({decks:[deck,deck],seed:8719,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;o.round=5;
 o.self.active={id:IDS.rat,energies:[IDS.fight],damage:20,status:null};
 o.self.bench=[{id:IDS.hit,energies:[IDS.fight],damage:0,status:null}];
 o.opponent.active={id:IDS.hit,energies:[IDS.fight],damage:0,status:null};
 const retreat={type:'retreat',payload:{slot:0}};
 const champ=AI.configuration({level:5,side:1,opponentResponse:true});
 assert.ok(AI.opponentResponseBonus(retreat,o,champ)>=220,
  'Replace a soon-KOed Active with a survivable ready attacker using visible opponent attacks');
 o.opponent.active.status='Asleep';
 assert.equal(AI.opponentResponseBonus(retreat,o,champ),0,
  'Asleep opponent cannot attack in next immediate response');
 o.opponent.active.status=null;
 o.self.bench[0]={id:IDS.hit,energies:[],damage:0,status:null};
 assert.equal(AI.opponentResponseBonus(retreat,o,champ),0,
  'Cannot award defensive retreat credit to a passive unpowered Bench');
 o.self.bench[0]={id:IDS.hit,energies:[IDS.fight],damage:0,status:null};
 o.opponent.active.damage=60;
 assert.equal(AI.opponentResponseBonus(retreat,o,champ),0,
  'Do not retreat instead of taking an immediate knockout');
 const old=AI.configuration({level:5,side:1});
 assert.equal(AI.opponentResponseBonus(retreat,o,old),0);
 assert.equal(AI.configuration({level:5}).opponentResponse,false,
  'Unverified opponent-response feature must stay opt-in');
 assert.throws(()=>AI.configuration({opponentResponse:'yes'}),/opponent-response/);
 const {arena,argumentsOf}=require('./benchmark_cpu');
 const x=arena(argumentsOf(['--pairs','1','--max-turns','4','--left-level','5',
  '--right-level','5','--left-opponent-response','true','--right-opponent-response','false']));
 assert.equal(x.baseline.opponentResponse,true);
 assert.equal(x.challenger.opponentResponse,false);
}
{
 const {ClassicLocalService}=require('./classic_local_service');
 const local=new ClassicLocalService();
 const experimental=local.create({deck:'blackout',opponent:'blackout',seed:781,
  difficulty:5,advancedTactics:true});
 assert.equal(experimental.cpu.advancedTactics,true,
  'Real local Champion games must expose the opt-in setting to callers');
 const stored=local.session(experimental.token);
 assert.equal(stored.cpuConfig.prizeRace,true);
 assert.equal(stored.cpuConfig.knockoutTempo,true);
 assert.equal(stored.cpuConfig.opponentResponse,true);
 const ordinary=local.create({deck:'blackout',opponent:'blackout',seed:782});
 assert.equal(ordinary.cpu.advancedTactics,false,
  'Existing casual matches must preserve prior CPU policy by default');
 assert.throws(()=>local.create({advancedTactics:'yes'}),/boolean/);
 assert.throws(()=>local.create({advancedTactics:true,difficulty:2}),/require Expert or Champion/);
}
{
 for(let level=1;level<=5;level++){
  const normal=AI.configuration({level}),calibrated=AI.configuration({level,graduatedNoise:true});
  assert.equal(normal.skill,AI.SKILLS[level]);
  assert.equal(calibrated.skill,AI.CALIBRATED_SKILLS[level]);
  if(level<5){
   assert.ok(calibrated.skill.temperature>normal.skill.temperature);
   assert.ok(calibrated.skill.sampleWindow>normal.skill.sampleWindow);
  }
  if(level>1){
   assert.ok(AI.CALIBRATED_SKILLS[level].temperature<
    AI.CALIBRATED_SKILLS[level-1].temperature,
    'Worse skills must have greater decision uncertainty under calibrated rules');
  }
 }
 assert.equal(AI.CALIBRATED_SKILLS[5],AI.SKILLS[5],
  'Champions remain entirely deterministic and are not artificially buffed');
 assert.throws(()=>AI.configuration({graduatedNoise:'yes'}),/graduated-noise/);
 const {parse,audit}=require('./benchmark_cpu_tiers');
 const result=audit(parse(['--pairs','1','--max-turns','6','--decks','blackout',
  '--graduated-noise']));
 assert.equal(result.graduatedNoise,true);
 assert.equal(result.totalGames,8);
 const {arena,argumentsOf}=require('./benchmark_cpu');
 const comparison=arena(argumentsOf(['--pairs','1','--max-turns','6','--left-level','4',
  '--right-level','3','--left-graduated-noise','true','--right-graduated-noise','true']));
 assert.equal(comparison.baseline.graduatedNoise,true);
 assert.equal(comparison.challenger.graduatedNoise,true);
}
{
 // Live combat option forecasts only cards already in the CPU hand: attaching
 // a second Fighting Energy to Machoke permits a third Energy next turn, which
 // unlocks Karate Chop. No guessed top-deck or future coin result is involved.
 const g=createGame({decks:[deck,deck],seed:555,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;o.round=5;
 o.self.active={id:'base1-34',damage:0,status:null,energies:[IDS.fight],playedTurn:2};
 o.self.bench=[];
 o.self.hand=[IDS.fight,IDS.fight];
 o.self.energyUsed=false;
 o.opponent.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 const action={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const cfg=AI.configuration({side:1,level:5,energyHorizon:true});
 const normal=AI.configuration({side:1,level:5});
 const future=AI.energyHorizonBonus(action,o,cfg);
 assert.ok(future>AI.energyHorizonBonus(action,o,normal),
  'Champion must recognize a second Energy plus known hand Energy unlocks a future attack');
 const withTwo=structuredClone(o);
 withTwo.self.hand=[IDS.fight];
 assert.ok(AI.energyHorizonBonus(action,withTwo,cfg)<future,
  'Do not hallucinate a third future Energy card absent from own hand');
 const status=structuredClone(o);status.opponent.active.status='Paralyzed';
 assert.equal(AI.energyHorizonBonus(action,status,cfg),
  AI.energyHorizonBonus(action,o,cfg),
  'Forecast must never use a future opponent RNG outcome');
 assert.equal(AI.configuration({level:5}).energyHorizon,false);
 assert.throws(()=>AI.configuration({energyHorizon:'yes'}),/energy-horizon/);
 const {arena,argumentsOf}=require('./benchmark_cpu');
 const result=arena(argumentsOf(['--pairs','1','--max-turns','4','--left-level','5',
  '--right-level','5','--left-energy-horizon','true','--right-energy-horizon','false']));
 assert.equal(result.baseline.energyHorizon,true);
 assert.equal(result.challenger.energyHorizon,false);
}
{
 // Same-turn *sequence* regression: on a two-Fighting Energy Machop,
 // evolving first disables Low Kick but leaves enough hand Energy for
 // Machoke's three-Energy Karate Chop after one attach.
 const g=createGame({decks:[deck,deck],seed:1911,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;o.round=5;o.turnSerial=10;
 o.self.active={id:IDS.machop,damage:0,playedTurn:2,
  energies:[IDS.fight,IDS.fight],status:null};
 o.self.bench=[{id:IDS.hit,damage:0,energies:[],playedTurn:2,status:null}];
 o.self.hand=['base1-34',IDS.fight];o.self.energyUsed=false;
 o.opponent.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 const expert=AI.configuration({side:1,level:5,turnSearch:true});
 const noSearch=AI.configuration({side:1,level:5,turnSearch:false});
 const evolve={type:'evolve',payload:{handIndex:0,slot:-1}};
 const attach={type:'attach_energy',payload:{handIndex:1,slot:-1}};
 const multi=AI.turnSequenceBonus(evolve,o,expert);
 assert.ok(multi>35,
  'Champion must value completing evolve + attach into a stronger immediate attack');
 assert.ok(AI.turnSequenceBonus(attach,o,expert)>35,
  'Champion must recognize attach + evolve yields the same affordable attack');
 assert.equal(AI.turnSequenceBonus(evolve,o,noSearch),0,
  'Existing production CPU remains available as paired-match control');
 const noEnergy=structuredClone(o);noEnergy.self.hand=['base1-34'];
 assert.ok(AI.turnSequenceBonus(evolve,noEnergy,expert)<-90,
  'Evolving without the Energy to attack should lose tempo and be penalized');
 const sleeping=structuredClone(o);
 sleeping.self.active.status='Asleep';
 sleeping.self.active.effectiveAttacks=CATALOG.get(IDS.machop).attacks;
 assert.ok(AI.turnSequenceBonus(evolve,sleeping,expert)>30,
  'Evolution cures Sleep and must replace any cached prior-stage attack list');

 const hidden=structuredClone(g);
 if(hidden.players[0].deck.length&&hidden.players[0].hand.length)
  [hidden.players[0].deck[0],hidden.players[0].hand[0]]=
   [hidden.players[0].hand[0],hidden.players[0].deck[0]];
 hidden.rngState=(hidden.rngState^0x7ab3d98f)>>>0;
 assert.deepEqual(AI.observation(hidden,1),AI.observation(g,1),
  'Future coin states and concealed opponent draws must stay outside the search');
 assert.equal(AI.turnSequenceBonus(evolve,structuredClone(o),expert),multi,
  'Projected sequence search must be deterministic, without mutating board');
 assert.equal(AI.configuration({level:5}).turnSearch,false);
 assert.throws(()=>AI.configuration({turnSearch:'yes'}),/turn-search/);
 const {argumentsOf,arena}=require('./benchmark_cpu');
 const a=arena(argumentsOf(['--pairs','1','--max-turns','4','--left-level','5',
  '--right-level','5','--left-turn-search','true','--right-turn-search','false']));
 assert.equal(a.baseline.turnSearch,true);
 assert.equal(a.challenger.turnSearch,false);
}
{
 const g=createGame({decks:[deck,deck],seed:10997,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,energies:[IDS.fight],damage:0,status:null};
 o.opponent.active={id:IDS.hit,energies:[IDS.fight],damage:0,status:null};
 o.self.hand=['base1-88',IDS.bill,'base1-95'];o.self.handCount=8;o.self.deckCount=30;
 const cfg=AI.configuration({level:5,side:1,actionDiscipline:true});
 const old=AI.configuration({level:5,side:1,actionDiscipline:false});
 const end={type:'end_turn',payload:{}};
 const oak={type:'play_trainer',payload:{handIndex:0}};
 const bill={type:'play_trainer',payload:{handIndex:1}};
 const attack={type:'attack',payload:{attackIndex:0}};
 assert.ok(AI.score(end,o,cfg,{})>AI.score(oak,o,cfg,{}),
  'Champion must be able to keep a good hand rather than use Oak blindly');
 assert.ok(AI.score(bill,o,cfg,{})>AI.score(end,o,cfg,{}),
  'Useful Bill draw remains preferable to a premature end turn');
 assert.ok(AI.score(attack,o,cfg,{})>AI.score(end,o,cfg,{}),
  'Resource conservation must not suppress an immediately affordable attack');
 assert.ok(AI.score(end,o,old,{})<AI.score(oak,o,old,{}),
  'Baseline retains prior greediness for reproducible A/B testing');
 const beginner=AI.configuration({level:1,side:1,actionDiscipline:true});
 assert.equal(AI.score(end,o,beginner,{}),0,
  'Beginner has no expert conservation opportunity-cost heuristic');
 assert.equal(AI.configuration({level:5}).actionDiscipline,true,
  '440-game multi-deck evidence promotes Trainer conservation for Champion');
 assert.equal(AI.configuration({level:4}).actionDiscipline,false,
  'Expert remains independently calibrated and does not inherit Champion-only behavior');
 assert.equal(AI.configuration({level:5,actionDiscipline:false}).actionDiscipline,false,
  'Control policy can still be selected for a reproducible A/B baseline');
 assert.throws(()=>AI.configuration({actionDiscipline:'true'}),/action-discipline/);
 const {arena,argumentsOf}=require('./benchmark_cpu');
 const x=arena(argumentsOf(['--pairs','1','--max-turns','4','--left-level','5',
  '--right-level','5','--left-action-discipline','true','--right-action-discipline','false']));
 assert.equal(x.baseline.actionDiscipline,true);
 assert.equal(x.challenger.actionDiscipline,false);
}
{
 const g=createGame({decks:[deck,deck],seed:1337,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;o.round=5;
 o.self.active={id:IDS.hit,damage:20,playedTurn:2,
  energies:[IDS.fight,IDS.fight],status:null};
 o.self.bench=[{id:IDS.machop,damage:0,energies:[],playedTurn:2,status:null}];
 o.self.hand=['base1-85','base1-90',IDS.potion];
 o.self.handCount=3;o.self.deckCount=32;o.self.energyUsed=false;
 o.opponent.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 const cfg=AI.configuration({level:5,side:1,trainerTactics:true});
 const old=AI.configuration({level:5,side:1,trainerTactics:false});
 const action=i=>({type:'play_trainer',payload:{handIndex:i}});
 const value=(i,c)=>AI.score(action(i),o,c,{})+AI.trainerTacticsBonus(action(i),o,c);
 const pass=AI.score({type:'end_turn',payload:{}},o,cfg,{});
 assert.ok(value(0,cfg)<pass,'Champion must not discard its powered Active Energy for only 20 Center healing');
 assert.ok(value(0,old)>pass,'Baseline must reproduce premature Pokémon Center');
 assert.ok(value(1,cfg)<pass,'Super Potion must consider losing an important attached Energy');
 o.self.active.energies=[IDS.fight,'base1-102'];
 const optimalPayment=AI.trainerTacticsBonus(action(1),o,cfg);
 o.self.active.energies=['base1-102',IDS.fight];
 assert.equal(AI.trainerTacticsBonus(action(1),o,cfg),optimalPayment,
  'Super Potion opportunity score must choose the best payment regardless of attachment order');
 o.self.active.energies=[IDS.fight,IDS.fight];
 assert.ok(value(2,cfg)<pass,'Small nonlethal Potion healing should not be mandatory before ending turn');
 o.self.active.energies=[];
 o.self.active.damage=40;
 assert.ok(value(0,cfg)>pass,'Center should still heal a badly damaged unpowered Active');
 o.self.active={id:IDS.machop,damage:0,energies:[IDS.fight],playedTurn:2,status:null};
 o.self.hand=['base1-88',IDS.fight,'base1-34'];o.self.handCount=2;
 const oak={type:'play_trainer',payload:{handIndex:0}};
 assert.ok(AI.trainerTacticsBonus(oak,o,cfg)<=-250,
  'Oak should not discard immediately playable own Energy and evolution from hand');
 assert.equal(AI.trainerTacticsBonus(oak,o,old),0);
 o.self.hand=['base1-88'];o.self.energyUsed=true;
 assert.equal(AI.trainerTacticsBonus(oak,o,cfg),0,
  'Once development cards have been played, Oak is judged by hand refresh value');
 assert.throws(()=>AI.configuration({trainerTactics:'enabled'}),/trainer-tactics/);
 assert.equal(AI.configuration({level:5}).trainerTactics,false);
 const {arena,argumentsOf}=require('./benchmark_cpu');
 const output=arena(argumentsOf(['--pairs','1','--max-turns','3','--left-level','5',
  '--right-level','5','--left-trainer-tactics','true','--right-trainer-tactics','false']));
 assert.equal(output.baseline.trainerTactics,true);
 assert.equal(output.challenger.trainerTactics,false);
}
{
 const g=createGame({decks:[deck,deck],seed:18819,format:'classic'});
 g.pendingAction={kind:'classic_trainer',plan:{side:1,cardId:'base1-90',
  data:{target:['slot:-1']}}};
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,energies:[IDS.fight,'base1-102'],damage:30,status:null};
 o.self.bench=[{id:IDS.machop,energies:[IDS.fight],damage:10,status:null}];
 o.opponent.active={id:IDS.hit,energies:[IDS.fight],damage:0,status:null};
 assert.equal(o.pendingTrainerName,'Super Potion');
 o.decision={id:'classic-trainer:200',actor:1,label:'Discard one attached Energy',
   kind:'ownEnergy',min:1,max:1,options:[
    {id:'n:0',label:'Fighting Energy'},{id:'n:1',label:'Water Energy'}]};
 const champ=AI.configuration({level:5,side:1,trainerTactics:true});
 const choose=id=>({type:'choose',payload:{decisionId:o.decision.id,selected:[id]}});
 assert.ok(AI.score(choose('n:1'),o,champ,{})>AI.score(choose('n:0'),o,champ,{}),
  'Super Potion must discard spare Water before necessary Fighting on Hitmonchan');
 o.decision={...o.decision,kind:'target',label:'Choose one of your Pokémon',
  options:[{id:'slot:-1',label:'Hitmonchan'},{id:'slot:0',label:'Machop'}]};
 assert.ok(AI.score(choose('slot:-1'),o,champ,{})>AI.score(choose('slot:0'),o,champ,{}),
  'Super Potion should heal the more critically damaged Active');
 const unseen=structuredClone(g);unseen.pendingAction.plan.side=0;
 const hidden=AI.observation(unseen,1);
 assert.equal(hidden.pendingTrainerName,null,
  'AI must not observe another player’s Trainer plan through its healing heuristic');
}
{
 const g=createGame({decks:[deck,deck],seed:17889,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;o.round=5;
 o.self.active={id:IDS.hit,damage:40,energies:[IDS.fight],playedTurn:2,status:null};
 o.self.bench=[];o.self.hand=['neo1-101','neo1-96','neo1-91',IDS.fight];
 o.self.handCount=4;o.self.deckCount=20;o.self.energyUsed=false;
 o.opponent.active={id:IDS.hit,damage:0,energies:[IDS.fight],status:null};
 const cfg=AI.configuration({side:1,level:5,trainerTactics:true});
 const act=i=>({type:'play_trainer',payload:{handIndex:i}});
 const value=i=>AI.score(act(i),o,cfg,{})+AI.trainerTacticsBonus(act(i),o,cfg);
 const pass=AI.score({type:'end_turn',payload:{}},o,cfg,{});
 assert.ok(value(0)>pass,'Moo-Moo Milk is useful when Active has four damage counters');
 o.self.active.damage=0;
 assert.ok(value(0)<pass,'Do not waste Moo-Moo Milk at full health');
 assert.ok(value(1)<pass,'Save Professor Elm until after playable Energy and other Trainers');
 o.self.hand=['neo1-96'];o.self.handCount=1;o.self.energyUsed=true;
 assert.ok(value(0)>pass,'Elm must become valuable once useful hand cards have been played');
 o.self.hand=['neo1-91'];o.self.handCount=1;o.self.deckCount=20;
 assert.ok(value(0)>pass,'Teleporter has a fair expected draw value without peeking at a coin');
 o.self.deckCount=2;
 assert.ok(value(0)<pass,'Avoid gambling on cards when the deck is nearly exhausted');
}
{
 const {arena,argumentsOf}=require('./benchmark_cpu');
 const report=arena(argumentsOf(['--pairs','1','--max-turns','5','--seed','141019',
  '--left-level','5','--right-level','5','--left-deck','cold_fusion',
  '--right-deck','cold_fusion','--left-trainer-tactics','true']));
 assert.equal(report.totalMatches,2);
 assert.equal(report.baseline.deck,'cold_fusion');
 assert.equal(report.challenger.deck,'cold_fusion');
 assert.equal(report.baseline.trainerTactics,true);
 assert.equal(report.illegalActions,0,
  'The historical Neo Genesis format must allow legal Cold Fusion tournament games');
}
{
 const g=createGame({decks:[deck,deck],seed:118809,format:'classic'});
 g.pendingAction={kind:'classic_trainer',plan:{side:1,cardId:'neo1-101',data:{}}};
 const o=AI.observation(g,1);o.phase='game';o.turn=1;
 o.self.active={id:IDS.hit,damage:40,energies:[IDS.fight],status:null};
 o.self.bench=[{id:IDS.machop,damage:10,energies:[],status:null}];
 o.opponent.active={id:IDS.hit,damage:50,energies:[IDS.fight],status:null};
 o.decision={actor:1,id:'classic-trainer:11',label:'Choose Pokémon to heal',
   kind:'healTarget',min:1,max:1,options:[
    {id:'slot:-1',label:'Hitmonchan'},{id:'slot:0',label:'Machop'}]};
 const champ=AI.configuration({level:5,side:1,trainerTactics:true});
 const choose=x=>({type:'choose',payload:{decisionId:o.decision.id,selected:[x]}});
 assert.equal(o.pendingTrainerName,'Moo-Moo Milk');
 assert.ok(AI.score(choose('slot:-1'),o,champ,{})>
  AI.score(choose('slot:0'),o,champ,{}),
  'Moo-Moo Milk must heal the most damaged OWN Pokémon, not compare opposing cards');
 g.pendingAction.plan.side=0;
 assert.equal(AI.observation(g,1).pendingTrainerName,null,
  'Opponent Trainer card identity must not leak via own-plan metadata');
}
{
 const g=createGame({decks:[deck,deck],seed:55121,format:'classic'});
 const o=AI.observation(g,1);o.phase='game';o.turn=1;o.round=5;
 o.self.active={id:IDS.machop,energies:[IDS.fight],damage:0,playedTurn:2,status:null};
 o.self.bench=[{id:IDS.rat,energies:[],damage:0,playedTurn:2,status:null}];
 o.opponent.active={id:IDS.hit,energies:[IDS.fight],damage:0,status:null};
 o.self.hand=[IDS.fight,'base1-34','base1-61'];
 o.self.handCount=3;o.self.deckCount=23;
 const cfg=AI.configuration({level:5,side:1,trainerSelections:true});
 const old=AI.configuration({level:5,side:1});
 const find={kind:'find',label:'Choose one Pokémon from your deck'};
 const options=[{id:'deck:4',label:'Machoke'},{id:'deck:8',label:'Rattata'}];
 assert.ok(AI.trainerSelectionValue(options[0],find,o,cfg)>
  AI.trainerSelectionValue(options[1],find,o,cfg),
  'Pokémon Trader must select the matching on-board Machop evolution');
 assert.equal(AI.trainerSelectionValue(options[0],find,o,old),null);
 const energyDecision={kind:'find',label:'Choose Basic Energy'};
 const good={id:'deck:3',label:'Fighting Energy'};
 const bad={id:'deck:5',label:'Water Energy'};
 assert.ok(AI.trainerSelectionValue(good,energyDecision,o,cfg)>
  AI.trainerSelectionValue(bad,energyDecision,o,cfg),
  'Energy Search must choose Fighting that supports a ready Machop, not unrelated Water');
 const cost={kind:'cost',label:'Choose one other card to discard'};
 assert.ok(AI.trainerSelectionValue({id:'hand:2',label:'Rattata'},cost,o,cfg)>
  AI.trainerSelectionValue({id:'hand:1',label:'Machoke'},cost,o,cfg),
  'Computer Search must preserve an available evolution and pay a surplus Basic');
 assert.equal(AI.trainerSelectionValue({id:'deck:2',label:'Professor Oak'},
  {kind:'target',label:'Choose opposing Pokémon'},o,cfg),null,
  'The card evaluator must never apply search logic to an unrelated choice');
 assert.throws(()=>AI.configuration({trainerSelections:'yes'}),/trainer-selections/);
 const {arena,argumentsOf}=require('./benchmark_cpu');
 const outcome=arena(argumentsOf(['--pairs','1','--max-turns','4',
  '--left-level','5','--right-level','5',
  '--left-trainer-selections','true','--right-trainer-selections','false']));
 assert.equal(outcome.baseline.trainerSelections,true);
 assert.equal(outcome.challenger.trainerSelections,false);
}
let duels=0,decisions=0,attacks=0,energy=0,evolutions=0,trainer=0;
for(let seed=1;seed<=4;seed++){
 let game=createGame({decks:[deck,deck],seed:seed*1789,format:'classic'});
 const profiles=[
  {side:0,level:seed%2?1:4,personality:'aggressive',seed:seed*67},
  {side:1,level:seed%2?5:2,personality:'defensive',seed:seed*79}
 ];
 for(const config of profiles){
  const result=AI.driveSide(game,{...config,limit:200});
  assert.ok(result.steps>0,'CPU must autonomously complete setup');
  game=result.game;
  decisions+=result.steps;
 }
 assert.equal(game.phase,'game','Both CPU seats should confirm setup');
 for(let turn=0;turn<28&&!game.over;turn++){
  const side=game.pendingDecision?game.pendingDecision.actor:game.turn;
  const before=game.events.length;
  const result=AI.driveSide(game,{...profiles[side],limit:200});
  assert.ok(result.steps>0,'CPU stalled at turn '+turn+' seed '+seed);
  assert.equal(result.game.events.length,before+result.steps);
  assert.ok(result.commands.every(x=>x.side===side));
  for(const x of result.commands){
   assert.ok(x.alternatives>=1);
   assert.ok(x.probedCandidates>=1&&x.rejectedCandidates>=0);
   assert.ok(x.rejectedCandidates<x.probedCandidates,'Selected CPU actions passed reducer checks');
   if(x.command.type==='attack')attacks++;
   if(x.command.type==='attach_energy')energy++;
   if(x.command.type==='evolve')evolutions++;
   if(x.command.type==='play_trainer')trainer++;
  }
  game=result.game;decisions+=result.steps;
  assert.deepEqual(game.players.map(countCards),[60,60],'CPU actions must conserve cards');
 }
 duels++;
}
assert.ok(attacks>0,'CPU must attack');
assert.ok(energy>0,'CPU must attach Energy');
assert.ok(trainer>0,'CPU must play useful Trainers');
console.log('PASS CPU policies: 5 levels, 6 personalities, hidden information, seeded decisions, '+duels+' headless self-play scenarios, '+decisions+' legal accepted actions ('+attacks+' attacks, '+energy+' attachments, '+trainer+' Trainers)');
