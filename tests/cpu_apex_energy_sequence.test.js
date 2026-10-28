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
test('Apex prepares Energy before a Confused final-prize attack',()=>{
 // Jab would win on printed damage, but Confusion requires an independent
 // heads flip before the attack resolves. The KO is not guaranteed.
 const o=board();o.self.prizeCount=1;o.opponent.bench=[];o.opponent.active.damage=10;
 o.self.active.status='Confused';
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,attach]),[attach]);
 // The ordinary, non-Confused guaranteed KO still takes priority.
 o.self.active.status=null;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,attach]),[attack,attach]);
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

test('Apex values an attachment that attacks next turn after Paralysis clears',()=>{
 // The active cannot attack now, but Paralysis wears off at the end of this
 // turn. A Fighting attachment will enable Hitmonchan's Jab next turn.
 const fighting=futureEnergyBoard(FIGHT,'base1-91',[]);
 const fire=futureEnergyBoard('base1-98','base1-91',[]);
 for(const o of [fighting,fire]){
  o.turnSerial=11;
  o.self.active.status='Paralyzed';
 }
 assert.ok(AI.energyHorizonBonus(attachActive,fighting,cfg)>
  AI.energyHorizonBonus(attachActive,fire,cfg),
  'guaranteed Paralysis recovery should reward a legal next-turn Jab');
 // Sleep is not guaranteed to clear, so do not assume a free wake-up.
 fighting.self.active.status='Asleep';
 fire.self.active.status='Asleep';
 assert.equal(AI.energyHorizonBonus(attachActive,fighting,cfg),
  AI.energyHorizonBonus(attachActive,fire,cfg));
});

test('Apex forecasts a two-Energy sequence through Paralysis recovery',()=>{
 const dce=futureEnergyBoard(FIGHT,'base1-96',[FIGHT]);
 const noEnergy=futureEnergyBoard(FIGHT,'base1-91',[FIGHT]);
 for(const o of [dce,noEnergy]){
  o.turnSerial=11;
  o.self.active.status='Paralyzed';
 }
 assert.ok(AI.energyHorizonBonus(attachActive,dce,cfg)>
  AI.energyHorizonBonus(attachActive,noEnergy,cfg),
  'future legal DCE must be valued after guaranteed Paralysis recovery');
});


test('Apex Energy horizon restores attacks after Amnesia and Gym cooldown expire',()=>{
 const baseline=futureEnergyBoard(FIGHT,'base1-96',[FIGHT]);
 baseline.turnSerial=11;
 const expected=AI.energyHorizonBonus(attachActive,baseline,cfg);
 for(const lock of [
  {amnesia:{index:0,expires:10}},
  {gymAttackCooldown:{index:0,expires:10}},
  {gymAttackCooldown:{index:null,expires:10}}
 ]){
  const expired=structuredClone(baseline);
  Object.assign(expired.self.active,lock);
  assert.equal(AI.energyHorizonBonus(attachActive,expired,cfg),expected,
   'expired public attack restrictions must not distort attachment value');
 }
});

test('Apex does not forecast Energy damage from a permanently spent Gym attack',()=>{
 // The reducer records once-used Gym attack indices on the Active. Unlike
 // Amnesia and temporary cooldowns, these do not expire with turnSerial.
 // DCE would fund Hitmonchan's second attack next turn, but that attack is
 // marked unavailable. The projection must not spend Energy for a phantom KO.
 const dce=futureEnergyBoard(FIGHT,'base1-96',[FIGHT]);
 const noEnergy=futureEnergyBoard(FIGHT,'base1-91',[FIGHT]);
 for(const o of [dce,noEnergy]){
  o.turnSerial=11;
  o.self.active.gymAttackOnce=[1];
 }
 assert.equal(AI.energyHorizonBonus(attachActive,dce,cfg),
  AI.energyHorizonBonus(attachActive,noEnergy,cfg),
  'a once-used attack must stay unavailable in next-turn Energy forecasts');
 // Control: without the permanent lock, a legal future DCE is useful.
 delete dce.self.active.gymAttackOnce;
 delete noEnergy.self.active.gymAttackOnce;
 assert.ok(AI.energyHorizonBonus(attachActive,dce,cfg)>
  AI.energyHorizonBonus(attachActive,noEnergy,cfg));
});

test('Apex forecasts next-turn Energy through expiring, but not persistent, attack locks',()=>{
 // Hitmonchan can fund Special Punch with Fighting now and DCE next turn.
 // A temporary lock expiring by serial 13 should not erase that forecast.
 for(const lock of [
  {amnesia:{index:1,expires:13}},
  {gymAttackCooldown:{index:1,expires:13}},
  {gymAttackCooldown:{index:null,expires:13}}
 ]){
  const dce=futureEnergyBoard(FIGHT,'base1-96',[FIGHT]);
  const noEnergy=futureEnergyBoard(FIGHT,'base1-91',[FIGHT]);
  for(const o of [dce,noEnergy]){
   o.turnSerial=11;
   Object.assign(o.self.active,structuredClone(lock));
  }
  assert.ok(AI.energyHorizonBonus(attachActive,dce,cfg)>
   AI.energyHorizonBonus(attachActive,noEnergy,cfg),
   'an attack unlocked next turn must reward legal two-turn setup');
  for(const o of [dce,noEnergy]){
   if(o.self.active.amnesia)o.self.active.amnesia.expires=14;
   if(o.self.active.gymAttackCooldown)o.self.active.gymAttackCooldown.expires=14;
  }
  assert.equal(AI.energyHorizonBonus(attachActive,dce,cfg),
   AI.energyHorizonBonus(attachActive,noEnergy,cfg),
   'an attack still locked next turn must not earn phantom setup value');
 }
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
test('Apex discounts a Confused opponent KO before penalizing Active Energy',()=>{
 const threatened=threatenedActiveEnergyBoard();
 const confused=structuredClone(threatened);
 confused.opponent.active.status='Confused';
 // The reducer makes a Confused attacker pass a 50% coin flip before the
 // printed attack resolves. A certain Jab KO is therefore not a >=75% KO.
 assert.ok(AI.score(attachActive,confused,cfg,{})>
  AI.score(attachActive,threatened,cfg,{})+80,
  'Confusion must not trigger the same doomed-Active Energy penalty as a guaranteed KO');
});
test('Apex does not treat an Amnesia-disabled knockout as a doomed-Active threat',()=>{
 const threatened=threatenedActiveEnergyBoard();
 const locked=structuredClone(threatened);
 locked.opponent.active.amnesia={index:0,expires:locked.turnSerial+1};
 assert.equal(AI.score(attachActive,locked,cfg,{})-
  AI.score(attachActive,threatened,cfg,{}),140);
 // Expired Amnesia must restore the actual threat.
 locked.opponent.active.amnesia.expires=locked.turnSerial;
 assert.equal(AI.score(attachActive,locked,cfg,{}),
  AI.score(attachActive,threatened,cfg,{}));
});
test('Apex ignores Gym cooldown and once-used attacks when investing Energy',()=>{
 const threatened=threatenedActiveEnergyBoard();
 for(const lock of [
  {gymAttackCooldown:{index:0,expires:threatened.turnSerial+1}},
  {gymAttackOnce:[0]}
 ]){
  const locked=structuredClone(threatened);
  Object.assign(locked.opponent.active,lock);
  assert.equal(AI.score(attachActive,locked,cfg,{})-
   AI.score(attachActive,threatened,cfg,{}),140);
 }
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
test('Apex does not force a doomed Active attachment before a ready attack',()=>{
 const o=exposedActiveHorizonBoard();
 // The Bench is temporarily attachment-blocked. The Active can use Jab now,
 // but another Fighting Energy cannot unlock Special Punch before the KO.
 // Hitmonchan has a two-Energy retreat cost: mark retreat already used so
 // this fixture actually tests a stranded attachment, not a legal escape.
 o.self.bench[0].energyAttachBlockSerial=o.turnSerial+1;
 o.self.retreated=true;
 const activeEnergy={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeEnergy]),
  [attack,activeEnergy],
  'preserve the legal attack instead of forcing a stranded attachment');
});
test('Apex keeps productive Energy preparation against a Confused attacker',()=>{
 const threatened=exposedActiveHorizonBoard();
 threatened.self.bench[0].energyAttachBlockSerial=threatened.turnSerial+1;
 threatened.self.retreated=true;
 const activeEnergy={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const confused=structuredClone(threatened);
 confused.opponent.active.status='Confused';
 assert.deepEqual(AI.energyPreparationActions(threatened,cfg,[attack,activeEnergy]),
  [attack,activeEnergy],'a guaranteed KO makes the extra Active Energy expendable');
 assert.deepEqual(AI.energyPreparationActions(confused,cfg,[attack,activeEnergy]),
  [activeEnergy],'a 50% Confusion KO must not suppress otherwise useful Energy preparation');
});
test('Apex preserves Energy preparation when it enables a legal retreat',()=>{
 const o=exposedActiveHorizonBoard();
 o.self.bench[0].energyAttachBlockSerial=o.turnSerial+1;
 const activeEnergy={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeEnergy]),
  [activeEnergy],
  'the second Fighting Energy pays Hitmonchan retreat and is not stranded');
});
test('Apex still prepares an Active Energy when the opposing KO is unavailable',()=>{
 const o=exposedActiveHorizonBoard();
 o.self.bench[0].energyAttachBlockSerial=o.turnSerial+1;
 const activeEnergy={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const safe=structuredClone(o);
 safe.opponent.active.energies=[];
 assert.deepEqual(AI.energyPreparationActions(safe,cfg,[attack,activeEnergy]),
  [activeEnergy],'Energy preparation remains useful against an uncharged foe');
 const disabled=structuredClone(o);
 disabled.opponent.active.amnesia={index:0,expires:disabled.turnSerial+1};
 assert.deepEqual(AI.energyPreparationActions(disabled,cfg,[attack,activeEnergy]),
  [activeEnergy],'a disabled opponent attack cannot force the Active to be treated as doomed');
});
test('Apex still prepares useful Bench Energy when its Active is doomed',()=>{
 const o=exposedActiveHorizonBoard();
 const activeEnergy={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const benchEnergy={type:'attach_energy',payload:{handIndex:0,slot:0}};
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeEnergy,benchEnergy]),
  [activeEnergy,benchEnergy],
  'Bench preparation remains available before the Active attacks');
});
test('Apex keeps the immediate Special Punch upgrade before attacking',()=>{
 const o=exposedActiveHorizonBoard();
 o.self.active.energies=[FIGHT,FIGHT];
 o.self.bench[0].energyAttachBlockSerial=o.turnSerial+1;
 const activeEnergy={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeEnergy]),
  [activeEnergy],'the third Fighting Energy immediately unlocks Special Punch');
});
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

test('Apex Bench horizon ignores Amnesia-locked knockout threats',()=>{
 const ready=exposedActiveHorizonBoard();
 const blocked=structuredClone(ready);
 blocked.opponent.active.amnesia={index:0,expires:blocked.turnSerial+1};
 const safe=structuredClone(blocked);
 safe.self.active.damage=0;
 assert.equal(AI.energyHorizonBonus(attach,blocked,cfg),
  AI.energyHorizonBonus(attach,safe,cfg),
  'an Amnesia-disabled attack must not create Bench replacement urgency');
 blocked.opponent.active.amnesia.expires=blocked.turnSerial;
 assert.equal(AI.energyHorizonBonus(attach,blocked,cfg),
  AI.energyHorizonBonus(attach,ready,cfg),
  'the threat returns after Amnesia expires');
});
test('Apex Bench horizon respects Gym cooldown and once-used attacks',()=>{
 const ready=exposedActiveHorizonBoard();
 for(const lock of [{gymAttackCooldown:{index:0,expires:ready.turnSerial+1}},
   {gymAttackOnce:[0]}]){
  const blocked=structuredClone(ready);
  Object.assign(blocked.opponent.active,lock);
  const safe=structuredClone(blocked);
  safe.self.active.damage=0;
  assert.equal(AI.energyHorizonBonus(attach,blocked,cfg),
   AI.energyHorizonBonus(attach,safe,cfg));
 }
});
test('Level 7 Bench horizon retains the existing affordable-attack estimate',()=>{
 const ready=exposedActiveHorizonBoard();
 const blocked=structuredClone(ready);
 blocked.opponent.active.amnesia={index:0,expires:ready.turnSerial+1};
 const lower=AI.configuration({side:1,level:7});
 assert.equal(AI.energyHorizonBonus(attach,blocked,lower),
  AI.energyHorizonBonus(attach,ready,lower));
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

test('Apex holds Psychic-resistant Eevee rather than retreating into uncharged Rhydon',()=>{
 const o=board();
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 // Base Set 2 Eevee resists Psychic -30, while Rhydon does not.
 // Psychic Abra can use Psyshock for 10; Eevee takes zero.
 o.self.active={id:'base2-51',energies:[FIGHT,FIGHT],damage:0,status:null};
 o.self.bench=[{id:'base2-45',energies:[FIGHT],damage:0,status:null}];
 o.opponent.active={id:'base1-43',energies:[FIGHT],damage:0,status:null};
 o.opponent.bench=[];
 const retreat={type:'retreat',payload:{slot:0}};
 const hold=AI.score(retreat,o,cfg,{});
 const lower=AI.score(retreat,o,AI.configuration({side:1,level:7}),{});
 assert.ok(hold<lower-250,'Apex recognizes the lost Psychic resistance and inactive Rhydon');
 assert.ok(hold<0,'retreat should not be favored in a protected matchup');
});
test('Apex retains level 7 retreat scoring on the Eevee/Rhydon matchup',()=>{
 const o=board();
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.active={id:'base2-51',energies:[FIGHT,FIGHT],damage:0,status:null};
 o.self.bench=[{id:'base2-45',energies:[FIGHT],damage:0,status:null}];
 o.opponent.active={id:'base1-43',energies:[FIGHT],damage:0,status:null};
 const lower=AI.configuration({side:1,level:7});
 assert.equal(AI.score({type:'retreat',payload:{slot:0}},o,lower,{}),
  AI.score({type:'retreat',payload:{slot:0}},structuredClone(o),lower,{}));
});

function apexRetreatTempoBoard(){
 const o=board();
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.active={id:HITMONCHAN,energies:[FIGHT],damage:50,status:null};
 o.self.bench=[{id:'base2-45',energies:[FIGHT],damage:0,status:null}];
 o.opponent.active={id:RATTATA,energies:[],damage:0,status:null};
 return o;
}
test('Apex attacks with a ready Active rather than rotate into uncharged Rhydon',()=>{
 const o=apexRetreatTempoBoard();
 const retreat={type:'retreat',payload:{slot:0}};
 assert.ok(AI.score(attack,o,cfg,{})>AI.score(retreat,o,cfg,{}));
});
test('Apex tolerates a damaged Active while preparing an uncharged Bench',()=>{
 const o=apexRetreatTempoBoard();
 o.self.active.energies=[];
 const retreat={type:'retreat',payload:{slot:0}};
 const lower=AI.configuration({side:1,level:7});
 assert.ok(AI.score(retreat,o,cfg,{})<AI.score(retreat,o,lower,{}));
});
test('Apex still rewards a real retreat when opponent has a ready knockout',()=>{
 const o=apexRetreatTempoBoard();
 o.self.active.damage=60;
 o.opponent.active={id:HITMONCHAN,energies:[FIGHT],damage:0,status:null};
 const retreat={type:'retreat',payload:{slot:0}};
 const unsafe=structuredClone(o);
 unsafe.self.bench[0].damage=90;
 assert.ok(AI.score(retreat,o,cfg,{})>AI.score(retreat,unsafe,cfg,{}));
});

test('Apex delays uncharged Bench evolution until an attack is one attachment away',()=>{
 const o=board();
 Object.assign(o,{phase:'game',round:5,turnSerial:11});
 o.self.bench=[{id:MACHOP,energies:[],damage:0,status:null,playedTurn:2}];
 o.self.hand=['base1-34'];
 const evolve={type:'evolve',payload:{handIndex:0,slot:0}};
 const unready=AI.score(evolve,o,cfg,{});
 const charged=structuredClone(o);
 charged.self.bench[0].energies=[FIGHT,FIGHT];
 charged.self.hand=[ 'base1-34',FIGHT ];
 assert.ok(AI.score(evolve,charged,cfg,{})>unready+200);
});
test('Level 7 retains existing Bench evolution scoring',()=>{
 const o=board();
 Object.assign(o,{phase:'game',round:5,turnSerial:11});
 o.self.bench=[{id:MACHOP,energies:[],damage:0,status:null,playedTurn:2}];
 o.self.hand=['base1-34'];
 const evolve={type:'evolve',payload:{handIndex:0,slot:0}};
 const lower=AI.configuration({side:1,level:7});
 assert.equal(AI.score(evolve,o,lower,{}),AI.score(evolve,structuredClone(o),lower,{}));
});

test('Apex saves a playable evolution before a small-hand Professor Oak reset',()=>{
 const o=board();
 Object.assign(o,{phase:'game',round:5,turnSerial:11});
 o.self.bench=[{id:MACHOP,energies:[],damage:0,status:null,playedTurn:2}];
 o.self.hand=['base1-34','base1-88'];
 o.self.deckCount=20;
 const evo={type:'evolve',payload:{handIndex:0,slot:0}};
 const withoutOak=structuredClone(o);
 withoutOak.self.hand=['base1-34','base1-91'];
 assert.ok(AI.score(evo,o,cfg,{})>AI.score(evo,withoutOak,cfg,{})+200);
});

// A Confused opponent must win a coin flip before its printed KO can resolve.
// Apex's Energy horizon, rescue evolution, and retreat should all use the
// same conservative likely-KO threshold as its stranded-Active evaluation.
test('Apex does not rush Bench Energy for a merely 50% Confused KO',()=>{
 const ready=threatenedActiveEnergyBoard();
 const confused=structuredClone(ready);
 confused.opponent.active.status='Confused';
 const unarmed=structuredClone(ready);
 unarmed.opponent.active.energies=[];
 assert.equal(AI.energyHorizonBonus(attach,confused,cfg),
  AI.energyHorizonBonus(attach,unarmed,cfg));
 assert.ok(AI.energyHorizonBonus(attach,ready,cfg)>
  AI.energyHorizonBonus(attach,confused,cfg));
});
test('Apex does not panic retreat from a Confused 50% KO',()=>{
 const ready=retreatLockBoard();
 const confused=structuredClone(ready);
 confused.opponent.active.status='Confused';
 assert.ok(AI.score(retreatToBench,ready,cfg,{})>
  AI.score(retreatToBench,confused,cfg,{}));
});
test('Apex delays an unready rescue evolution when the KO requires a Confusion flip',()=>{
 const ready=evolutionRefuelBoard('base1-91');
 ready.self.active.damage=40; // Machop has 10 HP left; Machoke would have 40.
 ready.opponent.active={id:HITMONCHAN,energies:[FIGHT],damage:0,status:null};
 const confused=structuredClone(ready);
 confused.opponent.active.status='Confused';
 // Exercise the public action scorer: prematureEvolutionPenalty is internal.
 assert.ok(AI.score(evolveActive,ready,cfg,{})>
  AI.score(evolveActive,confused,cfg,{})+200,
  'a guaranteed rescue should beat a speculative Confusion-flip rescue');
});
