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

test('Apex Energy horizon restores attacks after Amnesia and Gym cooldown expire',()=>{
 // An expired public lock must not be treated as permanent just because
 // the Energy horizon helper previously evaluated attacks at turnSerial=0.
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
   'an expired attack restriction must not change Energy attachment value');
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
