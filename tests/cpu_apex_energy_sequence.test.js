'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const AI=require('../cpu_policy');
const FIGHT='base1-97',HITMONCHAN='base1-7',MACHOP='base1-52',RATTATA='base1-61';
const cfg=AI.configuration({side:1,level:8});
const attack={type:'attack',payload:{attackIndex:0}};
const attach={type:'attach_energy',payload:{handIndex:0,slot:0}};
function board(){
 return {self:{active:{id:HITMONCHAN,energies:[FIGHT],damage:0,status:null},
   bench:[{id:MACHOP,energies:[],damage:0}],hand:[FIGHT],
   energyUsed:false,prizeCount:3},
  opponent:{active:{id:RATTATA,energies:[],damage:0},bench:[{id:RATTATA,energies:[],damage:0}]}};
}
test('Apex attaches useful Energy before a non-winning attack',()=>{
 const actions=AI.energyPreparationActions(board(),cfg,[attack,attach]);
 assert.deepEqual(actions,[attach]);
});
test('Apex retains a guaranteed winning knockout instead of forcing attachment',()=>{
 const o=board();o.self.prizeCount=1;o.opponent.bench=[];o.opponent.active.damage=10;
 const actions=AI.energyPreparationActions(o,cfg,[attack,attach]);
 assert.deepEqual(actions,[attack,attach]);
});
test('Apex does not force attachment when Energy was already used',()=>{
 const o=board();o.self.energyUsed=true;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,attach]),[attack,attach]);
});
test('other CPU levels retain their existing attack ordering',()=>{
 const o=board();
 assert.deepEqual(AI.energyPreparationActions(o,AI.configuration({side:1,level:7}),[attack,attach]),[attack,attach]);
});


test('Apex does not suppress an attack for illegal Miracle Energy',()=>{
 const o=board();
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.hand=['neo4-16'];
 o.self.bench=[];
 o.self.retreated=false;
 const actions=AI.candidates(o,cfg,{trainers:0,powers:0,powerKeys:new Set(),stadium:false});
 assert.equal(actions.some(a=>a.type==='attach_energy'),false);
 assert.equal(actions.some(a=>a.type==='attack'),true);
 assert.equal(AI.energyPreparationActions(o,cfg,actions).some(a=>a.type==='attack'),true);
});
test('Miracle Energy can target Light Pokémon unless attachment-blocked',()=>{
 const o=board();
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.hand=['neo4-16'];
 o.self.bench=[{id:'neo4-13',energies:[],damage:0,playedTurn:2}];
 o.self.retreated=false;
 const used={trainers:0,powers:0,powerKeys:new Set(),stadium:false};
 const actions=AI.candidates(o,cfg,used);
 assert.equal(actions.some(a=>a.type==='attach_energy'&&a.payload.slot===-1),false);
 assert.equal(actions.some(a=>a.type==='attach_energy'&&a.payload.slot===0),true);
 o.self.bench[0].energyAttachBlockSerial=12;
 assert.equal(AI.candidates(o,cfg,used).some(a=>a.type==='attach_energy'),false);
});

function benchEnergyBoard(energyId,energyUsed=false){
 const o=board();
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.hand=[HITMONCHAN,energyId];
 o.self.bench=[];
 o.self.energyUsed=energyUsed;
 return o;
}
const benchHitmonchan={type:'bench',payload:{handIndex:0}};
test('Apex does not treat illegal Miracle Energy as Bench attack readiness',()=>{
 const miracle=benchEnergyBoard('neo4-16');
 // An illegal Miracle Energy offers no attachment option, unlike a
 // legal off-type Energy which could still be attached for future turns.
 const noEnergy=benchEnergyBoard('base1-91'); // Bill, not an Energy card
 assert.equal(AI.score(benchHitmonchan,miracle,cfg,{}),
  AI.score(benchHitmonchan,noEnergy,cfg,{}));
});
test('Apex does not assume a second Energy attachment when already used',()=>{
 const spentFighting=benchEnergyBoard(FIGHT,true);
 const spentFire=benchEnergyBoard('base1-98',true);
 assert.equal(AI.score(benchHitmonchan,spentFighting,cfg,{}),
  AI.score(benchHitmonchan,spentFire,cfg,{}));
});
test('Apex still rewards a legal, available Energy for a newly benched attacker',()=>{
 const fighting=benchEnergyBoard(FIGHT);
 const fire=benchEnergyBoard('base1-98');
 assert.ok(AI.score(benchHitmonchan,fighting,cfg,{})>
  AI.score(benchHitmonchan,fire,cfg,{}));
});

function openingChoiceBoard(energyId){
 const o=board();
 o.phase='setup';
 o.self.active=null;
 o.self.bench=[];
 o.self.hand=[HITMONCHAN,energyId];
 return o;
}
const selectHitmonchan={type:'setup_select',payload:{handIndex:0}};
test('opening Active readiness ignores illegal Miracle Energy',()=>{
 const miracle=openingChoiceBoard('neo4-16');
 const noEnergy=openingChoiceBoard('base1-91'); // Bill, not an Energy
 assert.equal(AI.score(selectHitmonchan,miracle,cfg,{}),
  AI.score(selectHitmonchan,noEnergy,cfg,{}));
});
test('opening Active readiness still rewards legal matching Fighting Energy',()=>{
 const fighting=openingChoiceBoard(FIGHT);
 const noEnergy=openingChoiceBoard('base1-91');
 assert.ok(AI.score(selectHitmonchan,fighting,cfg,{})>
  AI.score(selectHitmonchan,noEnergy,cfg,{}));
});

function futureEnergyBoard(currentEnergy,futureEnergy,activeEnergies=[]){
 const o=board();
 o.phase='game';
 o.round=5;
 o.self.active.energies=activeEnergies;
 o.self.bench=[];
 // Avoid a Rattata weakness KO: Jab and Special Punch would otherwise
 // both score as lethal, masking the forecast's difference.
 o.opponent.active={id:MACHOP,energies:[],damage:0,status:null};
 o.self.hand=[currentEnergy,futureEnergy];
 return o;
}
const attachActive={type:'attach_energy',payload:{handIndex:0,slot:-1}};
test('Apex future Energy horizon ignores illegal Miracle Energy on ordinary Basics',()=>{
 // DCE + Miracle appears to unlock Hitmonchan's Special Punch, but Miracle
 // cannot legally be attached to Hitmonchan on the following turn.
 const miracle=futureEnergyBoard('base1-96','neo4-16');
 const noEnergy=futureEnergyBoard('base1-96','base1-91'); // Bill
 assert.equal(AI.energyHorizonBonus(attachActive,miracle,cfg),
  AI.energyHorizonBonus(attachActive,noEnergy,cfg));
});
test('Apex future Energy horizon still rewards legal multi-turn setup',()=>{
 // Two Fighting Energy followed by a legal DCE unlock Special Punch.
 const dce=futureEnergyBoard(FIGHT,'base1-96',[FIGHT]);
 const noEnergy=futureEnergyBoard(FIGHT,'base1-91',[FIGHT]);
 assert.ok(AI.energyHorizonBonus(attachActive,dce,cfg)>
  AI.energyHorizonBonus(attachActive,noEnergy,cfg));
});

function evolutionRefuelBoard(energyId,energyUsed=false){
 const o=board();
 o.phase='game';
 o.round=5;
 o.turnSerial=11;
 // Machop can Low Kick with these Fighting Energy, but Machoke needs
 // a third Energy for Karate Chop after evolving.
 o.self.active={id:MACHOP,energies:[FIGHT,FIGHT],damage:0,status:null,playedTurn:2};
 o.self.hand=['base1-34',energyId];
 o.self.energyUsed=energyUsed;
 o.opponent.active={id:MACHOP,energies:[],damage:0,status:null};
 return o;
}
test('Apex evolution tempo does not assume illegal Miracle Energy can refuel Machoke',()=>{
 const miracle=evolutionRefuelBoard('neo4-16');
 const noEnergy=evolutionRefuelBoard('base1-91'); // Bill
 const penalty=AI.evolutionTempoPenalty(miracle,-1,'base1-34',cfg);
 assert.ok(penalty>0,'evolving strands the currently attacking Machop');
 assert.equal(penalty,AI.evolutionTempoPenalty(noEnergy,-1,'base1-34',cfg));
});
test('Apex evolution tempo still recognizes legal Double Colorless refuel',()=>{
 const dce=evolutionRefuelBoard('base1-96');
 const noEnergy=evolutionRefuelBoard('base1-91');
 assert.equal(AI.evolutionTempoPenalty(dce,-1,'base1-34',cfg),0);
 assert.ok(AI.evolutionTempoPenalty(noEnergy,-1,'base1-34',cfg)>0);
});
test('Apex evolution tempo cannot refuel after the turn attachment was used',()=>{
 const dce=evolutionRefuelBoard('base1-96',true);
 const noEnergy=evolutionRefuelBoard('base1-91',true);
 assert.equal(AI.evolutionTempoPenalty(dce,-1,'base1-34',cfg),
  AI.evolutionTempoPenalty(noEnergy,-1,'base1-34',cfg));
});

const planningCfg=AI.configuration({side:1,level:8,planning:true});
const evolveActive={type:'evolve',payload:{handIndex:0,slot:-1}};
function planningEvolutionBoard(energyId,{blocked=false,used=false}={}){
 const o=evolutionRefuelBoard(energyId,used);
 if(blocked)o.self.active.energyAttachBlockSerial=o.turnSerial+1;
 return o;
}
test('Apex two-step planner does not invent Miracle Energy refuel after evolution',()=>{
 const miracle=planningEvolutionBoard('neo4-16');
 const noEnergy=planningEvolutionBoard('base1-91'); // Bill
 assert.equal(AI.planningBonus(evolveActive,miracle,planningCfg),
  AI.planningBonus(evolveActive,noEnergy,planningCfg));
});
test('Apex two-step planner still values a legal DCE follow-up after evolution',()=>{
 const dce=planningEvolutionBoard('base1-96');
 const noEnergy=planningEvolutionBoard('base1-91');
 assert.ok(AI.planningBonus(evolveActive,dce,planningCfg)>
  AI.planningBonus(evolveActive,noEnergy,planningCfg));
});
test('Apex two-step planner ignores attachment-blocked Energy',()=>{
 const blocked=planningEvolutionBoard('base1-96',{blocked:true});
 const noEnergy=planningEvolutionBoard('base1-91',{blocked:true});
 assert.equal(AI.planningBonus(evolveActive,blocked,planningCfg),
  AI.planningBonus(evolveActive,noEnergy,planningCfg));
});
test('Apex two-step planner does not reuse an already-spent attachment',()=>{
 const spent=planningEvolutionBoard('base1-96',{used:true});
 const noEnergy=planningEvolutionBoard('base1-91',{used:true});
 assert.equal(AI.planningBonus(evolveActive,spent,planningCfg),
  AI.planningBonus(evolveActive,noEnergy,planningCfg));
});

function superEnergyRemovalBoard(benchEnergies=null){
 const o=board();
 o.self.active.energies=[FIGHT,FIGHT];
 o.self.bench=benchEnergies===null?[]:[{id:MACHOP,energies:benchEnergies,damage:0}];
 o.self.hand=['base1-79']; // Super Energy Removal
 o.opponent.active.energies=[FIGHT,FIGHT];
 return o;
}
const playSuperEnergyRemoval={type:'play_trainer',payload:{handIndex:0}};
test('Super Energy Removal fixture uses the real Base Set Trainer',()=>{
 assert.equal(require('../headless_duel').CATALOG.get('base1-79')?.name,'Super Energy Removal');
});
test('Apex does not mistake an Energy-free Bench for cheap Super Energy Removal payment',()=>{
 const noBench=superEnergyRemovalBoard();
 const emptyBench=superEnergyRemovalBoard([]);
 assert.equal(AI.score(playSuperEnergyRemoval,emptyBench,cfg,{}),
  AI.score(playSuperEnergyRemoval,noBench,cfg,{}));
});
test('Apex still values Super Energy Removal when a one-Energy donor exists',()=>{
 const expensive=superEnergyRemovalBoard();
 const cheap=superEnergyRemovalBoard([FIGHT]);
 assert.ok(AI.score(playSuperEnergyRemoval,cheap,cfg,{})>
  AI.score(playSuperEnergyRemoval,expensive,cfg,{}));
});

function protectedRemovalBoard(protectActive,benchEnergyCount=1){
 const o=superEnergyRemovalBoard();
 o.self.active.energies=[FIGHT];
 o.opponent.active.attachedTrainers=protectActive?[{id:'gym2-101'}]:[];
 o.opponent.bench=[{id:MACHOP,energies:Array(benchEnergyCount).fill(FIGHT),damage:0}];
 return o;
}
test('Super Energy Removal protection fixture uses the real Gym Trainer',()=>{
 assert.equal(require('../headless_duel').CATALOG.get('gym2-101')?.name,"Brock's Protection");
});
test('Apex ignores protected two-Energy Active when valuing Super Energy Removal',()=>{
 const protectedBoard=protectedRemovalBoard(true);
 const oneEnergyActive=protectedRemovalBoard(false);
 oneEnergyActive.opponent.active.energies=[FIGHT];
 const unprotectedTwoEnergy=protectedRemovalBoard(false);
 assert.equal(AI.score(playSuperEnergyRemoval,protectedBoard,cfg,{}),
  AI.score(playSuperEnergyRemoval,oneEnergyActive,cfg,{}));
 assert.ok(AI.score(playSuperEnergyRemoval,unprotectedTwoEnergy,cfg,{})>
  AI.score(playSuperEnergyRemoval,protectedBoard,cfg,{}));
});
test('Apex still recognizes a removable two-Energy Bench behind protected Active',()=>{
 const removableTwo=protectedRemovalBoard(true,2);
 const removableOne=protectedRemovalBoard(true,1);
 assert.ok(AI.score(playSuperEnergyRemoval,removableTwo,cfg,{})>
  AI.score(playSuperEnergyRemoval,removableOne,cfg,{}));
});

function threatenedActiveEnergyBoard(){
 const o=board();
 Object.assign(o,{phase:'game',round:5,turnSerial:11});
 // Machoke cannot attack after a single Fighting attachment, and the
 // opposing Hitmonchan has an affordable, certain Jab knockout.
 const machoke=require('../headless_duel').CATALOG.get('base1-34');
 o.self.active={id:'base1-34',energies:[],damage:Number(machoke.hp)-10,status:null};
 o.self.bench=[{id:HITMONCHAN,energies:[FIGHT],damage:0,status:null}];
 o.self.hand=[FIGHT];
 o.opponent.active={id:HITMONCHAN,energies:[FIGHT],damage:0,status:null};
 return o;
}
test('Apex invests on Bench instead of an Active doomed before its next attack',()=>{
 const o=threatenedActiveEnergyBoard();
 assert.ok(AI.score(attach,o,cfg,{})>AI.score(attachActive,o,cfg,{}),
  'a useful Bench attachment must beat Energy stranded on the doomed Active');
});
test('Apex only penalizes the Active investment when opponent has a ready knockout',()=>{
 const threatened=threatenedActiveEnergyBoard();
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 assert.equal(AI.score(attachActive,safe,cfg,{})-
  AI.score(attachActive,threatened,cfg,{}),140);
});
test('Apex does not penalize an Active attachment that enables an attack now',()=>{
 const threatened=threatenedActiveEnergyBoard();
 threatened.self.active={id:HITMONCHAN,energies:[],damage:60,status:null};
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 assert.equal(AI.score(attachActive,threatened,cfg,{}),
  AI.score(attachActive,safe,cfg,{}));
});
test('Apex does not apply doomed-Active penalty without a Bench investment',()=>{
 const threatened=threatenedActiveEnergyBoard();
 threatened.self.bench=[];
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 assert.equal(AI.score(attachActive,threatened,cfg,{}),
  AI.score(attachActive,safe,cfg,{}));
});
test('Lower CPU levels retain their existing Active Energy scoring',()=>{
 const threatened=threatenedActiveEnergyBoard();
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 const lower=AI.configuration({side:1,level:6});
 assert.equal(AI.score(attachActive,threatened,lower,{}),
  AI.score(attachActive,safe,lower,{}));
});

function horizonThreatBoard(){
 const o=threatenedActiveEnergyBoard();
 // Machoke needs three Fighting Energy for Karate Chop. A second
 // visible Fighting next turn would complete the line after today's one.
 // The first Fighting attachment does not fund a retreat or attack.
 o.self.active={id:'base1-34',energies:[],damage:70,status:null};
 o.self.bench=[{id:HITMONCHAN,energies:[FIGHT],damage:0,status:null}];
 // Machoke's Karate Chop costs three Fighting, not Fighting + two Colorless.
 o.self.hand=[FIGHT,FIGHT];
 return o;
}
test('Apex does not forecast next-turn Active damage after a certain knockout',()=>{
 const threatened=horizonThreatBoard();
 assert.equal(AI.energyHorizonBonus(attachActive,threatened,cfg),0);
});
test('Apex avoids doomed Active setup across defensive personality styles',()=>{
 const threatened=threatenedActiveEnergyBoard();
 for(const personality of ['balanced','defensive','tactical','setup']){
  const policy=AI.configuration({side:1,level:8,personality});
  assert.ok(AI.score(attach,threatened,policy,{})>
   AI.score(attachActive,threatened,policy,{}),personality);
 }
});
test('Apex still develops Active when its opponent is Asleep and cannot attack',()=>{
 const threatened=threatenedActiveEnergyBoard();
 const asleep=structuredClone(threatened);
 asleep.opponent.active.status='Asleep';
 assert.equal(AI.score(attachActive,asleep,cfg,{})-
  AI.score(attachActive,threatened,cfg,{}),140);
});
test('Apex does not overreact to an opponent missing its attack Energy',()=>{
 const threatened=threatenedActiveEnergyBoard();
 const empty=structuredClone(threatened);
 empty.opponent.active.energies=[];
 assert.equal(AI.score(attachActive,empty,cfg,{})-
  AI.score(attachActive,threatened,cfg,{}),140);
});
test('Apex does not punish Active investment if every Bench slot is blocked',()=>{
 const threatened=threatenedActiveEnergyBoard();
 threatened.self.bench[0].energyAttachBlockSerial=threatened.turnSerial+1;
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 assert.equal(AI.score(attachActive,threatened,cfg,{}),
  AI.score(attachActive,safe,cfg,{}));
});

test('Apex delays a low-value evolution when Machop can already attack',()=>{
 const o=evolutionRefuelBoard('base1-91');
 o.self.active={id:MACHOP,energies:[FIGHT,FIGHT],damage:0,status:null,playedTurn:2};
 o.self.hand=['base1-34','base1-91'];
 const evolution={type:'evolve',payload:{handIndex:0,slot:-1}};
 const baseline=AI.configuration({side:1,level:8});
 const nonGame=structuredClone(o);nonGame.phase='setup';
 assert.ok(AI.score(evolution,o,baseline,{})<
  AI.score(evolution,nonGame,baseline,{}),
  'a live game should discount a premature Active promotion');
});
test('Apex does not delay evolution merely to keep a Paralyzed attacker',()=>{
 const o=evolutionRefuelBoard('base1-91');
 o.self.active={id:MACHOP,energies:[FIGHT,FIGHT],damage:0,status:'Paralyzed',playedTurn:2};
 o.self.hand=['base1-34','base1-91'];
 const evolution={type:'evolve',payload:{handIndex:0,slot:-1}};
 const nonGame=structuredClone(o);nonGame.phase='setup';
 assert.equal(AI.score(evolution,o,cfg,{}),
  AI.score(evolution,nonGame,cfg,{}));
});


function retreatLockBoard(){
 const o=board();
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.active={id:HITMONCHAN,energies:[FIGHT],damage:50,status:null};
 o.self.bench=[{id:MACHOP,energies:[],damage:0,status:null}];
 o.opponent.active={id:HITMONCHAN,energies:[FIGHT],damage:0,status:null};
 return o;
}
const retreatToBench={type:'retreat',payload:{slot:0}};
test('Apex values escaping a genuinely ready public knockout',()=>{
 const ready=retreatLockBoard(),unarmed=structuredClone(ready);
 unarmed.opponent.active.energies=[];
 assert.ok(AI.score(retreatToBench,ready,cfg,{})>
  AI.score(retreatToBench,unarmed,cfg,{}));
});
test('Apex does not panic retreat against a sleeping or paralyzed attacker',()=>{
 const ready=retreatLockBoard(),unarmed=structuredClone(ready);
 unarmed.opponent.active.energies=[];
 for(const status of ['Asleep','Paralyzed']){
  const blocked=structuredClone(ready);
  blocked.opponent.active.status=status;
  assert.equal(AI.score(retreatToBench,blocked,cfg,{}),
   AI.score(retreatToBench,unarmed,cfg,{}),status);
 }
});
test('Apex does not panic retreat from an Amnesia-locked opponent attack',()=>{
 const ready=retreatLockBoard(),unarmed=structuredClone(ready);
 unarmed.opponent.active.energies=[];
 ready.opponent.active.amnesia={index:0,expires:12};
 assert.equal(AI.score(retreatToBench,ready,cfg,{}),
  AI.score(retreatToBench,unarmed,cfg,{}));
});
test('Apex respects visible Gym attack cooldown and once-per-turn attack locks',()=>{
 const ready=retreatLockBoard(),unarmed=structuredClone(ready);
 unarmed.opponent.active.energies=[];
 for(const lock of [{gymAttackCooldown:{index:0,expires:12}},
   {gymAttackOnce:[0]}]){
  const blocked=structuredClone(ready);
  Object.assign(blocked.opponent.active,lock);
  assert.equal(AI.score(retreatToBench,blocked,cfg,{}),
   AI.score(retreatToBench,unarmed,cfg,{}));
 }
});
test('Level 7 retreat heuristic remains unchanged',()=>{
 const ready=retreatLockBoard(),blocked=structuredClone(ready);
 blocked.opponent.active.amnesia={index:0,expires:12};
 const lower=AI.configuration({side:1,level:7});
 assert.equal(AI.score(retreatToBench,ready,lower,{}),
  AI.score(retreatToBench,blocked,lower,{}));
});

test('Apex penalizes doomed Active Energy when Low Kick was already affordable',()=>{
 const threatened=threatenedActiveEnergyBoard();
 // Machop's Low Kick is already affordable. Its one-Energy retreat cost is
 // also already paid, so the second attachment adds no new escape or attack.
 threatened.self.active={id:MACHOP,energies:[FIGHT],damage:40,status:null};
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 assert.equal(AI.score(attachActive,safe,cfg,{})-
  AI.score(attachActive,threatened,cfg,{}),140);
 assert.ok(AI.score(attach,threatened,cfg,{})>
  AI.score(attachActive,threatened,cfg,{}),
  'invest in the surviving Bench instead of an unnecessary second Active Energy');
});
test('Apex keeps the immediate attack-upgrade exception for Special Punch',()=>{
 const threatened=threatenedActiveEnergyBoard();
 // The third Fighting Energy unlocks Hitmonchan's stronger Special Punch.
 threatened.self.active={id:HITMONCHAN,energies:[FIGHT,FIGHT],damage:60,status:null};
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 assert.equal(AI.score(attachActive,safe,cfg,{}),
  AI.score(attachActive,threatened,cfg,{}));
});
test('Level 6 does not inherit the new already-ready attack penalty',()=>{
 const threatened=threatenedActiveEnergyBoard();
 threatened.self.active={id:MACHOP,energies:[FIGHT],damage:40,status:null};
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 const lower=AI.configuration({side:1,level:6});
 assert.equal(AI.score(attachActive,safe,lower,{}),
  AI.score(attachActive,threatened,lower,{}));
});

function blockedRetreatEnergyBoard({status=null,retreated=false}={}){
 const o=board();
 Object.assign(o,{phase:'game',round:5,turnSerial:11});
 const machop=require('../headless_duel').CATALOG.get(MACHOP);
 assert.equal(machop.retreatCost.length,1,'fixture requires a one-Energy retreat');
 // DCE pays Machop's retreat but cannot fund its Fighting attacks.
 // The same DCE develops Benched Hitmonchan's Special Punch.
 o.self.active={id:MACHOP,energies:[],damage:Number(machop.hp)-10,status};
 o.self.bench=[{id:HITMONCHAN,energies:[FIGHT,FIGHT],damage:0,status:null}];
 o.self.hand=['base1-96'];
 o.self.retreated=retreated;
 o.opponent.active={id:HITMONCHAN,energies:[FIGHT],damage:0,status:null};
 return o;
}
test('Apex does not excuse a doomed Active attachment for an Asleep retreat',()=>{
 const threatened=blockedRetreatEnergyBoard({status:'Asleep'});
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 assert.ok(AI.score(attachActive,safe,cfg,{})>
  AI.score(attachActive,threatened,cfg,{}),
  'an Asleep Active cannot retreat even after DCE pays the cost');
});
test('Apex does not excuse a doomed Active attachment for a Paralyzed retreat',()=>{
 const threatened=blockedRetreatEnergyBoard({status:'Paralyzed'});
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 assert.ok(AI.score(attachActive,safe,cfg,{})>
  AI.score(attachActive,threatened,cfg,{}),
  'a Paralyzed Active cannot retreat even with enough Energy');
});
test('Apex does not excuse a doomed Active attachment after retreat was used',()=>{
 const threatened=blockedRetreatEnergyBoard({retreated:true});
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 assert.ok(AI.score(attachActive,safe,cfg,{})>
  AI.score(attachActive,threatened,cfg,{}),
  'the once-per-turn retreat limit still applies');
});
test('Apex preserves the escape exception for a legal Energy-funded retreat',()=>{
 const threatened=blockedRetreatEnergyBoard();
 const safe=structuredClone(threatened);
 safe.opponent.active.energies=[];
 assert.equal(AI.score(attachActive,threatened,cfg,{}),
  AI.score(attachActive,safe,cfg,{}),
  'DCE that enables a legal retreat should not be treated as stranded');
});

function exposedActiveHorizonBoard(){
 const o=board();
 Object.assign(o,{phase:'game',round:5,turnSerial:11});
 o.self.active={id:HITMONCHAN,energies:[FIGHT],damage:60,status:null};
 o.self.bench=[{id:MACHOP,energies:[],damage:0,status:null}];
 o.self.hand=[FIGHT];
 o.opponent.active={id:HITMONCHAN,energies:[FIGHT],damage:0,status:null};
 return o;
}
test('Apex Bench horizon rewards a replacement when the Active faces a ready knockout',()=>{
 const threatened=exposedActiveHorizonBoard();
 const safe=structuredClone(threatened);
 safe.self.active.damage=0;
 assert.ok(AI.energyHorizonBonus(attach,threatened,cfg)>
  AI.energyHorizonBonus(attach,safe,cfg),
  'the exposed Active, not the Energy recipient, determines replacement urgency');
});
test('Apex Bench horizon does not mistake a fragile Bench for a threatened Active',()=>{
 const safe=exposedActiveHorizonBoard();
 safe.self.active.damage=0;
 const fragile=structuredClone(safe);
 fragile.self.bench[0].damage=40;
 assert.equal(AI.energyHorizonBonus(attach,fragile,cfg),
  AI.energyHorizonBonus(attach,safe,cfg),
  'damage on a Bench target must not trigger Active replacement urgency');
});
test('Apex Bench horizon ignores knockouts from a sleeping opponent',()=>{
 const threatened=exposedActiveHorizonBoard();
 threatened.opponent.active.status='Asleep';
 const safe=structuredClone(threatened);
 safe.self.active.damage=0;
 assert.equal(AI.energyHorizonBonus(attach,threatened,cfg),
  AI.energyHorizonBonus(attach,safe,cfg));
});

function matchWinningEvolutionBoard(){
 const o=evolutionRefuelBoard('base1-96');
 // Rattata's Bite KOs damaged Machop but not evolved Machoke.
 // Machop's affordable Low Kick guarantees the final Prize right now.
 o.self.active.damage=40;
 o.self.prizeCount=1;
 o.opponent.active={id:RATTATA,energies:[FIGHT],damage:10,status:null};
 o.opponent.bench=[{id:RATTATA,energies:[],damage:0,status:null}];
 return o;
}
test('Apex preserves a certain final-Prize attack instead of evolving to safety',()=>{
 const o=matchWinningEvolutionBoard();
 const evolve={type:'evolve',payload:{handIndex:0,slot:-1}};
 assert.equal(AI.evolutionTempoPenalty(o,-1,'base1-34',cfg),550);
 assert.ok(AI.score(attack,o,cfg,{})>AI.score(evolve,o,cfg,{}));
});
test('Apex preserves an all-Pokémon knockout even when Prizes remain',()=>{
 const o=matchWinningEvolutionBoard();
 o.self.prizeCount=3;
 o.opponent.bench=[];
 assert.equal(AI.evolutionTempoPenalty(o,-1,'base1-34',cfg),550);
});
test('Apex may evolve for survival when no immediate win exists',()=>{
 const o=matchWinningEvolutionBoard();
 o.self.prizeCount=3;
 assert.equal(AI.evolutionTempoPenalty(o,-1,'base1-34',cfg),0);
});
test('Apex does not penalize evolution when evolved attack also guarantees victory',()=>{
 const o=matchWinningEvolutionBoard();
 o.self.active.damage=0;
 o.self.active.energies=[FIGHT,FIGHT,'base1-96'];
 assert.equal(AI.evolutionTempoPenalty(o,-1,'base1-34',cfg),0);
});
test('Level 7 evolution policy is unchanged by the Apex winning-attack guard',()=>{
 const o=matchWinningEvolutionBoard();
 assert.equal(AI.evolutionTempoPenalty(o,-1,'base1-34',
  AI.configuration({side:1,level:7})),0);
});
