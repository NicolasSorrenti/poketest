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
test('Apex does not attach Rainbow Energy for an immediate self-knockout',()=>{
 const o=board(),rainbow='base5-80';
 const activeAttach={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const benchAttach={type:'attach_energy',payload:{handIndex:0,slot:0}};
 // The reducer applies Rainbow's 10 damage and resolves the knockout
 // immediately, before the new Energy could power another attack.
 o.self.hand=[rainbow];
 o.self.active.energies=[FIGHT,FIGHT]; // Rainbow would fund Special Punch
 o.self.active.damage=60; // Hitmonchan: 10 of 70 HP remaining
 assert.ok(AI.energyValue(o.self.active,rainbow)>12,
  'Rainbow is otherwise an attractive attack-unlocking attachment');
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack],'never consider lethal Rainbow instead of a legal Jab');
 assert.ok(AI.score(activeAttach,o,cfg,{})<=-1000,
  'self-knockout is not an Energy improvement');
 o.self.active.damage=50; // 20 HP: the attachment is survivable
 assert.ok(AI.score(activeAttach,o,cfg,{})>-1000,
  'survivable Rainbow remains a legitimate attachment');
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [activeAttach],'survivable Rainbow may be prepared before an attack');
 o.self.bench[0].damage=40; // Machop: 10 of 50 HP remaining
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,benchAttach]),
  [attack],'never consider a lethal Bench attachment');
 assert.ok(AI.score(benchAttach,o,cfg,{})<=-1000,
  'Bench self-knockouts must also be discouraged');
 o.self.bench[0].damage=30;
 assert.ok(AI.score(benchAttach,o,cfg,{})>-1000,
  'a Bench recipient with 20 HP can still use Rainbow');
 o.self.active.damage=60;
 assert.ok(AI.score(activeAttach,o,AI.configuration({side:1,level:7}),{})>-1000,
  'keep Level 7 scoring unchanged');
});

test('Apex avoids Darkness Energy that will KO a non-Dark Bench at checkup',()=>{
 const o=board(),darkness='neo1-104';
 const benchAttach={type:'attach_energy',payload:{handIndex:0,slot:0}};
 const activeAttach={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.hand=[darkness];
 o.self.bench[0].damage=40; // Machop has 10 HP; Darkness recoil hits Bench every turn.
 const options=level=>AI.candidates(o,level,{trainers:0,powers:0,powerKeys:new Set(),stadium:false});
 const hasBench=level=>options(level).some(a=>a.type==='attach_energy'&&a.payload.slot===0);
 assert.equal(hasBench(cfg),false,'do not offer a doomed Darkness Bench attachment');
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,benchAttach]),[attack],
  'root preparation must also reject the doomed attachment');
 assert.ok(AI.score(benchAttach,o,cfg,{})<=-1000);
 o.self.bench[0].damage=30; // 20 HP survives ours, but faints on opponent's checkup.
 assert.equal(hasBench(cfg),false,'Bench must survive both checkups before our next turn');
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,benchAttach]),[attack],
  'root preparation must not override the two-checkup survival guard');
 assert.ok(AI.score(benchAttach,o,cfg,{})<=-1000);
 o.self.bench[0].damage=20; // 30 HP survives two 10-damage checkups.
 assert.equal(hasBench(cfg),true,'a Bench that survives until our next turn remains eligible');
 assert.ok(AI.score(benchAttach,o,cfg,{})>-1000);
 o.self.bench[0].energies=[darkness]; // Two Darkness deal 40 damage over both turns.
 assert.equal(hasBench(cfg),false,'count all attached Darkness Energy across both checkups');
 o.self.bench[0].damage=0; // 50 HP survives two 20-damage checkups.
 assert.equal(hasBench(cfg),true,'survivable multiple-Darkness Bench attachment remains eligible');
 o.self.bench[0]={id:'neo1-24',energies:[],damage:40}; // Dark-type Murkrow is immune.
 assert.equal(hasBench(cfg),true,'Dark-type recipients do not take Darkness recoil');
 o.self.bench[0]={id:MACHOP,energies:[],damage:40};
 const lower=AI.configuration({side:1,level:7});
 assert.equal(hasBench(lower),true,'Level 7 retains its existing candidate rules');
 assert.ok(AI.score(benchAttach,o,lower,{})>-1000);
 o.self.active.damage=60; // Preserve a possible final-Prize win before checkup.
 assert.equal(options(cfg).some(a=>a.type==='attach_energy'&&a.payload.slot===-1),true,
  'do not blanket-exclude an Active attachment that could win immediately');
 assert.ok(AI.score(activeAttach,o,cfg,{})>-1000);
});

test('Apex heals a Darkness-damaged Bench before a non-winning attack',()=>{
 const o=board(),potion='base5-82',darkness='neo1-104';
 const benchAttach={type:'attach_energy',payload:{handIndex:0,slot:0}};
 Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false,decision:null});
 o.self.active.energies=[FIGHT,FIGHT,FIGHT]; // Attack is already funded.
 o.self.bench[0]={id:MACHOP,energies:[darkness],damage:30,status:null,playedTurn:2};
 o.self.hand=[potion];
 // Machop has 20 of 50 HP. Existing Darkness deals 10 at both turn ends;
 // Potion heals to 30 HP, leaving 10 HP when Apex next gets to act.
 assert.ok(AI.energyValue(o.self.bench[0],potion)<=12,
  'Potion is surplus for attacks; only its immediate healing rescues the Bench');
 const actions=AI.candidates(o,cfg,{trainers:0,powers:0,powerKeys:new Set(),stadium:false});
 assert.ok(actions.some(a=>a.type==='attach_energy'&&a.payload.slot===0),
  'the healing attachment is legal');
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,benchAttach]),[benchAttach],
  'save the Bench before an attack ends the turn');
 const savingScore=AI.score(benchAttach,o,cfg,{});
 o.self.hand=['base5-81']; // Full Heal Energy does not heal damage.
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,benchAttach]),
  [attack,benchAttach],'neutral surplus Energy should not delay the attack');
 assert.ok(savingScore>AI.score(benchAttach,o,cfg,{})+150,
  'reward actual two-checkup survival, not just an Energy symbol');
 o.self.hand=[potion];
 o.self.bench[0].damage=40; // 10 HP + 10 healed still faints at second checkup.
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,benchAttach]),[attack,benchAttach],
  'do not claim a rescue if the host still faints');
 o.self.bench[0].damage=20; // 30 HP already survives both ticks.
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,benchAttach]),[attack,benchAttach],
  'do not force Potion when the Bench already survives');
 o.self.bench[0].damage=30;
 o.self.bench[0].energies=[];
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,benchAttach]),[attack,benchAttach],
  'without Darkness there is no two-checkup rescue');
 o.self.bench[0]={id:'neo1-24',energies:[darkness,darkness,darkness],damage:30,status:null};
 // Murkrow already has its attack Energy. A single extra Colorless Energy
 // could otherwise be useful setup rather than a (nonexistent) recoil cure.
 assert.ok(AI.energyValue(o.self.bench[0],potion)<=12);
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,benchAttach]),[attack,benchAttach],
  'Dark-type Bench hosts are immune to Darkness recoil');
 o.self.bench[0]={id:MACHOP,energies:[darkness],damage:30,status:null};
 assert.deepEqual(AI.energyPreparationActions(o,AI.configuration({side:1,level:7}),
  [attack,benchAttach]),[attack,benchAttach],
  'Level 7 ordering remains unchanged');
 o.self.prizeCount=1;o.opponent.bench=[];o.opponent.active.damage=10;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,benchAttach]),[attack,benchAttach],
  'guaranteed final-Prize knockouts still take priority');
});

test('Apex attaches useful Energy before a non-winning attack',()=>{
 const actions=AI.energyPreparationActions(board(),cfg,[attack,attach]);
 assert.deepEqual(actions,[attach]);
});
test('Apex retains a guaranteed winning knockout instead of forcing attachment',()=>{
 const o=board();o.self.prizeCount=1;o.opponent.bench=[];o.opponent.active.damage=10;
 const actions=AI.energyPreparationActions(o,cfg,[attack,attach]);
 assert.deepEqual(actions,[attack,attach]);
});
test('Apex prepares useful Energy before a Confused final-Prize attack',()=>{
 const o=board();o.self.prizeCount=1;o.opponent.bench=[];o.opponent.active.damage=10;
 o.self.active.status='Confused';
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,attach]),[attach]);
 // Without Confusion, the printed lethal attack really is guaranteed.
 o.self.active.status=null;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,attach]),[attack,attach]);
 // Level 7 keeps its established decision ordering.
 o.self.active.status='Confused';
 assert.deepEqual(AI.energyPreparationActions(o,AI.configuration({side:1,level:7}),[attack,attach]),[attack,attach]);
});
test('Apex does not treat a Confused last-opponent KO as certain',()=>{
 const o=board();o.self.prizeCount=3;o.opponent.bench=[];o.opponent.active.damage=10;
 o.self.active.status='Confused';
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,attach]),[attach]);
});
test('Apex cures Confusion with Full Heal Energy before a funded damaging attack',()=>{
 const o=board();
 const activeAttach={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 // Three Fighting Energy already fund Hitmonchan's attacks; an extra
 // Colorless Energy has no offensive value. The status cure is the benefit.
 o.self.active.energies=[FIGHT,FIGHT,FIGHT];
 o.self.active.status='Confused';
 o.self.hand=['base5-81']; // Full Heal Energy
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [activeAttach],'cure the mandatory 50% Confusion attack failure first');
 // The opponent's next-turn KO does not erase the value of curing now.
 o.opponent.active={id:HITMONCHAN,energies:[FIGHT],damage:0,status:null};
 o.self.active.damage=50; // opposing Jab can KO on the following turn
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [activeAttach],'a future KO must not suppress the immediate Confusion cure');
 o.self.active.damage=0;
 o.opponent.active={id:RATTATA,energies:[],damage:0,status:null};
 o.self.active.status=null;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack,activeAttach],'do not spend a redundant Energy on a healthy Active');
 o.self.active.status='Confused';
 o.self.hand=['base5-82']; // Potion Energy does not cure Confusion
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack,activeAttach],'ordinary surplus Energy must not suppress an attack');
 o.self.hand=['base5-81'];
 assert.deepEqual(AI.energyPreparationActions(o,AI.configuration({side:1,level:7}),
  [attack,activeAttach]),[attack,activeAttach],
  'the sequencing change is restricted to Apex');
});

test('Apex cures lethal Poison before a non-winning attack despite surplus Energy',()=>{
 const o=board(),activeAttach={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 // Hitmonchan is fully funded, but 20 Poison damage will KO its last 10 HP
 // at end-of-turn checkup if it attacks before attaching Full Heal Energy.
 o.self.active.energies=[FIGHT,FIGHT,FIGHT];
 o.self.active.damage=60;
 o.self.active.poison=true;
 o.self.active.poisonDamage=20;
 o.self.hand=['base5-81']; // Full Heal Energy
 assert.ok(AI.energyValue(o.self.active,o.self.hand[0])<=12,
  'surplus Colorless Energy has no meaningful attack-progress value');
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [activeAttach],'save the Active before a non-winning attack ends the turn');
 const cureScore=AI.score(activeAttach,o,cfg,{});
 o.self.hand=['base5-82']; // Potion Energy heals only 10 and does not cure Poison
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack,activeAttach],'Potion Energy is not a Poison cure');
 assert.ok(cureScore>AI.score(activeAttach,o,cfg,{}),
  'Full Heal must be valued above a non-saving Potion attachment');
 o.self.hand=['base5-81'];
 o.self.active.poisonDamage=5;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack,activeAttach],'nonlethal Poison does not force surplus Energy');
 o.self.active.poisonDamage=20;
 o.self.active.poison=false;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack,activeAttach],'a healthy Active does not need a Poison rescue');
 o.self.active.poison=true;
 assert.deepEqual(AI.energyPreparationActions(o,AI.configuration({side:1,level:7}),
  [attack,activeAttach]),[attack,activeAttach],
  'the sequencing change is Apex-only');
 o.self.prizeCount=1;
 o.opponent.bench=[];
 o.opponent.active.damage=10;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack,activeAttach],'a guaranteed game-winning knockout needs no rescue');
});

test('Apex uses Potion Energy when its heal prevents lethal Poison checkup',()=>{
 const o=board(),activeAttach={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 o.phase='game';o.round=5;o.turnSerial=11;
 // Hitmonchan has 70 HP and already has enough Energy for its attacks.
 // At 60 damage, a normal 10-damage Poison checkup would KO it after
 // attacking. Potion Energy heals to 50 damage, so it survives with 10 HP.
 o.self.active.energies=[FIGHT,FIGHT,FIGHT];
 o.self.active.damage=60;
 o.self.active.poison=true;
 o.self.active.poisonDamage=10;
 o.self.hand=['base5-82']; // Potion Energy
 assert.ok(AI.energyValue(o.self.active,o.self.hand[0])<=12,
  'the attachment is surplus for attacks, useful only for survival');
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [activeAttach],'attach the healing Energy before ending the turn with an attack');
 const savedScore=AI.score(activeAttach,o,cfg,{});
 o.self.hand=['base1-96']; // Double Colorless Energy cannot heal
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack,activeAttach],'ordinary surplus Energy does not rescue Poison');
 assert.ok(savedScore>AI.score(activeAttach,o,cfg,{}),
  'Apex should value a real Potion rescue over an ordinary attachment');
 o.self.hand=['base5-82'];
 o.self.active.poisonDamage=20;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack,activeAttach],'a 10-damage heal cannot survive a 20-damage tick at 10 HP');
 o.self.active.damage=50; // 20 HP -> heal to 30 -> survive a 20-damage tick
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [activeAttach],'a stronger Poison tick can still be survivable after healing');
 o.self.active.poison=false;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack,activeAttach],'no phantom Poison rescue on an unpoisoned Active');
 o.self.active.poison=true;
 assert.deepEqual(AI.energyPreparationActions(o,AI.configuration({side:1,level:7}),
  [attack,activeAttach]),[attack,activeAttach],'preserve Level 7 ordering');
 o.self.prizeCount=1;o.opponent.bench=[];o.opponent.active.damage=10;
 assert.deepEqual(AI.energyPreparationActions(o,cfg,[attack,activeAttach]),
  [attack,activeAttach],'a guaranteed game-winning attack takes priority');
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

test('Apex values Energy that unlocks an attack after Paralysis clears',()=>{
 const fighting=futureEnergyBoard(FIGHT,'base1-91',[]);
 const fire=futureEnergyBoard('base1-98','base1-91',[]);
 for(const o of [fighting,fire]){
  o.turnSerial=11;
  o.self.active.status='Paralyzed';
 }
 assert.ok(AI.energyHorizonBonus(attachActive,fighting,cfg)>
  AI.energyHorizonBonus(attachActive,fire,cfg),
  'a legal Fighting attachment must earn next-turn Jab value after guaranteed recovery');
 // Sleep is not guaranteed to end, so do not predict a free wake-up.
 fighting.self.active.status='Asleep';
 fire.self.active.status='Asleep';
 assert.equal(AI.energyHorizonBonus(attachActive,fighting,cfg),
  AI.energyHorizonBonus(attachActive,fire,cfg));
});

test('Apex Energy horizon values Full Heal Energy cure on attachment',()=>{
 // The reducer clears Sleep and Paralysis immediately on Full Heal Energy.
 // Both cards below provide one Colorless Energy; only Full Heal permits
 // Hitmonchan's already-funded Jab this turn.
 for(const status of ['Asleep','Paralyzed']){
  const fullHeal=futureEnergyBoard('base5-81','base1-91',[FIGHT]);
  const potion=futureEnergyBoard('base5-82','base1-91',[FIGHT]);
  for(const o of [fullHeal,potion]){
   o.turnSerial=11;
   o.self.active.status=status;
  }
  assert.ok(AI.energyHorizonBonus(attachActive,fullHeal,cfg)>
   AI.energyHorizonBonus(attachActive,potion,cfg),
   `Full Heal must unlock an immediate attack while ${status}`);
  fullHeal.self.active.status=null;
  potion.self.active.status=null;
  assert.equal(AI.energyHorizonBonus(attachActive,fullHeal,cfg),
   AI.energyHorizonBonus(attachActive,potion,cfg),
   'healthy Pokémon must not receive a phantom status-cure bonus');
 }
});

test('Apex forecasts a future Full Heal Energy cure if Sleep persists',()=>{
 // The first attachment funds Jab; a Full Heal Energy held for next turn
 // can wake the attacker before that attack, unlike Potion Energy.
 const fighting=futureEnergyBoard(FIGHT,'base5-81',[]);
 const offType=futureEnergyBoard('base1-98','base5-81',[]);
 const potion=futureEnergyBoard(FIGHT,'base5-82',[]);
 const potionOffType=futureEnergyBoard('base1-98','base5-82',[]);
 for(const o of [fighting,offType,potion,potionOffType]){
  o.turnSerial=11;
  o.self.active.status='Asleep';
 }
 assert.ok(AI.energyHorizonBonus(attachActive,fighting,cfg)>
  AI.energyHorizonBonus(attachActive,offType,cfg),
  'future Full Heal must unlock the funded attack even if Sleep persists');
 assert.equal(AI.energyHorizonBonus(attachActive,potion,cfg),
  AI.energyHorizonBonus(attachActive,potionOffType,cfg),
  'future Potion Energy cannot cure Sleep');
 // Without Sleep, both future Colorless Energy cards have the same value.
 const healthyHeal=futureEnergyBoard(FIGHT,'base5-81',[]);
 const healthyPotion=futureEnergyBoard(FIGHT,'base5-82',[]);
 assert.equal(AI.energyHorizonBonus(attachActive,healthyHeal,cfg),
  AI.energyHorizonBonus(attachActive,healthyPotion,cfg));
});

test('Apex forecasts a two-attachment attack after Paralysis recovery',()=>{
 const dce=futureEnergyBoard(FIGHT,'base1-96',[FIGHT]);
 const noEnergy=futureEnergyBoard(FIGHT,'base1-91',[FIGHT]);
 for(const o of [dce,noEnergy]){
  o.turnSerial=11;
  o.self.active.status='Paralyzed';
 }
 assert.ok(AI.energyHorizonBonus(attachActive,dce,cfg)>
  AI.energyHorizonBonus(attachActive,noEnergy,cfg),
  'next-turn Double Colorless must retain its value after Paralysis clears');
});

test('Apex Energy horizon ignores already-expired Amnesia and Gym locks',()=>{
 const baseline=futureEnergyBoard(FIGHT,'base1-96',[FIGHT]);
 baseline.turnSerial=11;
 const expected=AI.energyHorizonBonus(attachActive,baseline,cfg);
 assert.ok(expected>0,'control attachment must have positive setup value');
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

test('Apex forecasts future Energy through expiring, not persistent, attack locks',()=>{
 // Hitmonchan has Fighting Energy; this turn's Fighting and next turn's
 // Double Colorless can fund Special Punch at turnSerial 13.
 for(const lock of [
  {amnesia:{index:1,expires:13}},
  {gymAttackCooldown:{index:1,expires:13}},
  {gymAttackCooldown:{index:null,expires:13}}
 ]){
  const dce=futureEnergyBoard(FIGHT,'base1-96',[FIGHT]);
  const bill=futureEnergyBoard(FIGHT,'base1-91',[FIGHT]);
  for(const o of [dce,bill]){
   o.turnSerial=11;
   Object.assign(o.self.active,structuredClone(lock));
  }
  assert.ok(AI.energyHorizonBonus(attachActive,dce,cfg)>
   AI.energyHorizonBonus(attachActive,bill,cfg),
   'a lock expired by the next own turn should reward legal setup');
  for(const o of [dce,bill]){
   if(o.self.active.amnesia)o.self.active.amnesia.expires=14;
   if(o.self.active.gymAttackCooldown)o.self.active.gymAttackCooldown.expires=14;
  }
  assert.equal(AI.energyHorizonBonus(attachActive,dce,cfg),
   AI.energyHorizonBonus(attachActive,bill,cfg),
   'an attack still locked next turn must not receive speculative value');
 }
});


test('Apex does not plan a next-turn KO with a permanently spent Gym attack',()=>{
 // Gym once-use indices survive turn changes. A second Energy attachment
 // cannot unlock an attack already consumed earlier in the duel.
 const dce=futureEnergyBoard(FIGHT,'base1-96',[FIGHT]);
 const bill=futureEnergyBoard(FIGHT,'base1-91',[FIGHT]);
 for(const o of [dce,bill]){
  o.turnSerial=11;
  o.self.active.gymAttackOnce=[1]; // Hitmonchan Special Punch
 }
 assert.equal(AI.energyHorizonBonus(attachActive,dce,cfg),
  AI.energyHorizonBonus(attachActive,bill,cfg),
  'a permanently used attack must not earn speculative Energy value');
 // Control: the same two-turn Energy sequence is valuable without the lock.
 delete dce.self.active.gymAttackOnce;
 delete bill.self.active.gymAttackOnce;
 assert.ok(AI.energyHorizonBonus(attachActive,dce,cfg)>
  AI.energyHorizonBonus(attachActive,bill,cfg));
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

function rainbowFutureBoard(futureEnergy,damage){
 const o=futureEnergyBoard(FIGHT,futureEnergy,[]);
 // Diglett has 30 HP. Fighting now powers Dig; a second Fighting symbol
 // next turn would power Mud Slap, but Rainbow inflicts 10 on attachment.
 o.self.active={id:'base1-47',energies:[],damage,status:null,playedTurn:1};
 o.opponent.active={id:HITMONCHAN,energies:[],damage:0,status:null};
 return o;
}
test('Apex future Energy horizon never rewards a Rainbow self-KO',()=>{
 for(const rainbow of ['base5-17','base5-80']){
  const lethal=rainbowFutureBoard(rainbow,20); // exactly 10 HP left
  const noEnergy=rainbowFutureBoard('base1-91',20); // Bill
  assert.equal(AI.energyHorizonBonus(attachActive,lethal,cfg),
   AI.energyHorizonBonus(attachActive,noEnergy,cfg),
   rainbow+' cannot power a next-turn attack after knocking out Diglett');
 }
});
test('Apex future Energy horizon preserves safe Rainbow setup',()=>{
 for(const rainbow of ['base5-17','base5-80']){
  const safe=rainbowFutureBoard(rainbow,19); // 11 HP left
  const noEnergy=rainbowFutureBoard('base1-91',19);
  assert.ok(AI.energyHorizonBonus(attachActive,safe,cfg)>
   AI.energyHorizonBonus(attachActive,noEnergy,cfg),
   rainbow+' must still unlock a legal second-turn Mud Slap');
 }
});

test('Apex counts current Rainbow damage before projecting another Rainbow next turn',()=>{
 const rainbows=['base5-17','base5-80'];
 for(const current of rainbows)for(const future of rainbows){
  const board=futureEnergyBoard(current,future,[]);
  // Diglett has 30 HP: the first Rainbow leaves 10 HP, so the second
  // Rainbow would KO it before the projected two-Energy Mud Slap.
  board.self.active={id:'base1-47',energies:[],damage:10,status:null,playedTurn:1};
  board.opponent.active={id:HITMONCHAN,energies:[],damage:0,status:null};
  const noSecond=structuredClone(board);
  noSecond.self.hand[1]='base1-91'; // Bill cannot provide a second Energy.
  assert.ok(AI.energyHorizonBonus(attachActive,board,cfg)<=
   AI.energyHorizonBonus(attachActive,noSecond,cfg),
   current+' followed by '+future+' must not reward a future self-KO');
  const safe=structuredClone(board),safeControl=structuredClone(noSecond);
  safe.self.active.damage=9; // Both Rainbow damage counters leave 1 HP.
  safeControl.self.active.damage=9;
  assert.ok(AI.energyHorizonBonus(attachActive,safe,cfg)>
   AI.energyHorizonBonus(attachActive,safeControl,cfg),
   current+' followed by '+future+' must preserve a surviving attack line');
 }
});

test('Apex does not carry spent Miracle Energy into next-turn attacks',()=>{
 // Light Wigglytuff can legally attach Miracle Energy, but it is discarded
 // at the end of this turn. Next turn's Double Colorless alone cannot pay
 // Body Slam's three-Colorless cost, so it must not earn a phantom bonus.
 const withDce=futureEnergyBoard('neo4-16','base1-96');
 const withoutDce=futureEnergyBoard('neo4-16','base1-91'); // Bill
 for(const o of [withDce,withoutDce]){
  o.self.active={id:'neo4-54',energies:[],damage:0,status:null};
 }
 assert.equal(AI.energyHorizonBonus(attachActive,withDce,cfg),
  AI.energyHorizonBonus(attachActive,withoutDce,cfg));
});


test('Apex only spends PlusPower for an attack it can legally declare',()=>{
 const action={type:'play_trainer',payload:{handIndex:0}};
 const ready=board();
 Object.assign(ready,{phase:'game',turn:1,round:5,turnSerial:11,over:false});
 ready.self.hand=['base1-84']; // PlusPower
 ready.opponent.active={id:MACHOP,energies:[],damage:20,status:null};
 // Hitmonchan's funded Jab deals 20; Machop has 30 HP remaining,
 // so PlusPower creates a real 30-damage knockout only while Jab is legal.
 const readyScore=AI.score(action,ready,cfg,{});
 const asleep=structuredClone(ready);
 asleep.self.active.status='Asleep';
 const paralyzed=structuredClone(ready);
 paralyzed.self.active.status='Paralyzed';
 const amnesia=structuredClone(ready);
 amnesia.self.active.amnesia={index:0,expires:12};
 const gymOnce=structuredClone(ready);
 gymOnce.self.active.gymAttackOnce=[0];
 for(const [label,blocked] of [['Asleep',asleep],['Paralyzed',paralyzed],
  ['Amnesia',amnesia],['Gym once-used',gymOnce]]){
  assert.ok(readyScore>AI.score(action,blocked,cfg,{})+200,
   label+' must not make PlusPower look like an immediate knockout');
 }
 const confused=structuredClone(ready);
 confused.self.active.status='Confused';
 assert.equal(AI.score(action,confused,cfg,{}),readyScore,
  'Confusion allows attack declaration; it is not an absolute attack lock');
 const lower=AI.configuration({side:1,level:7});
 assert.equal(AI.score(action,ready,lower,{}),AI.score(action,asleep,lower,{}),
  'Level 7 retains its existing PlusPower evaluation');
});

test('Apex values Full Heal Energy curing an Active into an immediate legal attack',()=>{
 const fullHeal='base5-81',potion='base5-82';
 const attachActive={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const make=(energy,status,energies=[FIGHT])=>{
  const o=board();
  Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false});
  o.self.active.status=status;
  o.self.active.energies=energies;
  o.self.hand=[energy];
  o.opponent.active={id:MACHOP,energies:[],damage:0,status:null};
  return o;
 };
 for(const status of ['Asleep','Paralyzed','Confused']){
  assert.ok(AI.score(attachActive,make(fullHeal,status),cfg,{})>
   AI.score(attachActive,make(potion,status),cfg,{}),
   'Full Heal Energy must reward curing '+status+' when Jab is already funded');
 }
 assert.equal(AI.score(attachActive,make(fullHeal,null),cfg,{}),
  AI.score(attachActive,make(potion,null),cfg,{}),
  'no status-cure tempo bonus should be awarded to a healthy Active');
 assert.equal(AI.score(attachActive,make(fullHeal,'Asleep',[]),cfg,{}),
  AI.score(attachActive,make(potion,'Asleep',[]),cfg,{}),
  'do not claim an immediate attack if Full Heal Energy cannot fund it');
 const bench={type:'attach_energy',payload:{handIndex:0,slot:0}};
 assert.equal(AI.score(bench,make(fullHeal,'Asleep'),cfg,{}),
  AI.score(bench,make(potion,'Asleep'),cfg,{}),
  'attaching Full Heal Energy to the Bench does not cure the Active');
});

test('Apex recognizes Potion Energy preventing a public next-turn knockout',()=>{
 // Neo Genesis Potion Energy heals one damage counter when attached.
 // A 70-HP Hitmonchan at 50 damage is KO'd by a ready 20-damage Rattata;
 // healing to 40 damage raises its remaining HP from 20 to 30.
 const potion='base5-82',plain='base5-81'; // Full Heal Energy, same Colorless output
 const activeAttachment={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const scenario=(id,damage,enemyEnergy=[FIGHT])=>{
  const o=board();
  Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false});
  o.self.active.damage=damage;
  o.self.hand=[id];
  o.opponent.active={id:RATTATA,energies:enemyEnergy,damage:0,status:null};
  return o;
 };
 const saving=AI.score(activeAttachment,scenario(potion,50),cfg,{});
 const plainSaving=AI.score(activeAttachment,scenario(plain,50),cfg,{});
 assert.ok(saving>plainSaving+80,
  'healing that prevents a certain public KO should beat neutral Colorless Energy');
 const safe=AI.score(activeAttachment,scenario(potion,10,[]),cfg,{});
 const plainSafe=AI.score(activeAttachment,scenario(plain,10,[]),cfg,{});
 assert.ok(safe>plainSafe,'damaged hosts should receive a modest real healing bonus');
 assert.ok(saving-plainSaving>safe-plainSafe+60,
  'survival swing should matter more than routine ten-damage healing');
 assert.equal(AI.score(activeAttachment,scenario(potion,0),cfg,{}),
  AI.score(activeAttachment,scenario(plain,0),cfg,{}),
  'a healthy host must not receive a phantom healing bonus');
 const lower=AI.configuration({side:1,level:7});
 assert.equal(AI.score(activeAttachment,scenario(potion,50),lower,{}),
  AI.score(activeAttachment,scenario(plain,50),lower,{}),
  'existing Level 7 attachment scoring remains unchanged');
});

test('Apex does not strand a Potion Energy attachment that prevents a public KO',()=>{
 const activeAttach={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const scenario=(energy,damage,withBench=true)=>{
  const o=board();
  Object.assign(o,{phase:'game',turn:1,round:5,turnSerial:11,over:false});
  // Hitmonchan is already fully funded and can already retreat. The only
  // value of Potion Energy here is healing its 20 remaining HP to 30.
  o.self.active.energies=[FIGHT,FIGHT,FIGHT];
  o.self.active.damage=damage;
  o.self.hand=[energy];
  // The opponent's publicly funded Jab deals 20 on its next turn.
  o.opponent.active={id:HITMONCHAN,energies:[FIGHT],damage:0,status:null};
  // A Colorless-ready Bench gives the stranded-Energy guard an alternative.
  o.self.bench=withBench?[{id:RATTATA,energies:[],damage:0}]:[];
  return o;
 };
 const potion='base5-82',neutral='base5-81';
 const score=(energy,damage,withBench,config=cfg)=>
  AI.score(activeAttach,scenario(energy,damage,withBench),config,{});
 assert.equal(score(potion,50,true),score(potion,50,false),
  'a Potion that saves the Active must not be penalized as stranded Energy');
 assert.ok(score(neutral,50,false)-score(neutral,50,true)>=130,
  'an ordinary surplus attachment remains stranded on a doomed Active');
 assert.ok(score(potion,60,false)-score(potion,60,true)>=130,
  'Potion still counts as stranded when 10 healing cannot prevent the KO');
 const level7=AI.configuration({side:1,level:7});
 assert.ok(score(potion,50,false,level7)-score(potion,50,true,level7)>=130,
  'the new survival correction is restricted to Apex');
});

function evolutionForecastBoard(status=null){
 const o=board();
 Object.assign(o,{phase:'game',round:5,turnSerial:11});
 o.self.active={id:MACHOP,energies:[FIGHT,FIGHT,FIGHT],damage:0,status,playedTurn:2};
 o.self.bench=[];
 o.self.hand=['base1-34']; // Machoke: Karate Chop is affordable after evolving.
 o.self.energyUsed=true;
 o.opponent.active={id:RATTATA,energies:[],damage:0,status:null};
 return o;
}
test('optional Apex two-step forecast recognizes evolution curing disabling conditions',()=>{
 const planning={...cfg,planning:true};
 const evolve={type:'evolve',payload:{handIndex:0,slot:-1}};
 for(const status of ['Asleep','Paralyzed']){
  const o=evolutionForecastBoard(status);
  assert.ok(AI.planningBonus(evolve,o,planning)>0,
   'evolution should cure '+status+' and unlock Machoke\'s attack');
 }
});
test('optional Apex evolution forecast does not retain Basic effectiveAttacks',()=>{
 const planning={...cfg,planning:true};
 const evolve={type:'evolve',payload:{handIndex:0,slot:-1}};
 // Start with Sleep so evolution must unlock the new stage's attacks.
 // A healthy Machop can already attack, making its improvement score zero.
 const normal=evolutionForecastBoard('Asleep');
 const inherited=structuredClone(normal);
 inherited.self.active.effectiveAttacks=require('../headless_duel').CATALOG.get(MACHOP).attacks;
 const baseline=AI.planningBonus(evolve,normal,planning);
 assert.ok(baseline>0,'Machoke should upgrade Machop\'s attack');
 assert.equal(AI.planningBonus(evolve,inherited,planning),baseline,
  'evolved Machoke must use its own attack list');
});

test('Apex two-step forecast accounts for Full Heal Energy clearing attack-blocking conditions',()=>{
 const attachActive={type:'attach_energy',payload:{handIndex:0,slot:-1}};
 const attachBench={type:'attach_energy',payload:{handIndex:0,slot:0}};
 const make=(energy,status)=>{
  const o=board();
  Object.assign(o,{phase:'game',round:5,turnSerial:11});
  o.self.active.status=status;
  o.self.active.energies=[FIGHT]; // Hitmonchan's Jab is already funded.
  o.self.hand=[energy];
  o.self.energyUsed=false;
  return o;
 };
 const planning={...cfg,planning:true};
 for(const status of ['Asleep','Paralyzed']){
  assert.ok(AI.planningBonus(attachActive,make('base5-81',status),planning)>0,
   'Full Heal Energy should unlock an attack after curing '+status);
  assert.equal(AI.planningBonus(attachActive,make('base5-82',status),planning),0,
   'Potion Energy cannot cure '+status);
  assert.equal(AI.planningBonus(attachBench,make('base5-81',status),planning),0,
   'curing a Benched Pokemon does not wake the Active');
 }
 assert.equal(AI.planningBonus(attachActive,make('base5-81',null),planning),0,
  'a healthy, already funded Active gets no phantom attack unlock');
});
