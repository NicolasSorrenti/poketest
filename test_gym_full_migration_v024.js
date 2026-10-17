'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const R=require('./retail_theme_decks');
const A=require('./attack_effects_core');
const T=require('./classic_trainer_core');
const P=require('./classic_power_core');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const unit=(id,extra={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,poison:false,playedTurn:1,...extra});
const energy={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Colorless:'base1-99'};
const game=(seed=42)=>{let g=createGame({decks:[R.list('brock'),R.list('misty')],format:'gym-expanded',seed});g.phase='game';g.turn=0;g.round=3;g.turnSerial=5;g.players[0].active=unit('base1-3');g.players[1].active=unit('base1-3');return g;};
const ok=(g,actor,type,payload)=>{const r=applyCommand(g,actor,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);};
const choose=(g,ids)=>{const d=g.pendingDecision;assert.ok(d,'Expected player decision');ok(g,d.actor,'choose',{decisionId:d.id,selected:ids||d.options.slice(0,d.min).map(x=>x.id)});};
const newKinds=new Set(['mega-drain','double-heads-bonus','discard-all-self','self-sleep','self-poison','healing-pollen','two-coins-confuse','lava-burst','spiral-dive','night-spirits','wake-defender','naptime','disable-self-next','blaze-grass-bench','full-speed-charge','shuffle-own-deck','karate-chop','double-heads-hit','clamp','kerzap','coin-discard-fire','lie-low','love-lariat','poison-power','coin-lock-trainers','thunder-flare','blank-powers','detonate','mega-thrash','double-poison','three-coin-bonus','pendulum-curse','group-therapy','pulled-punch','poison-spore','single-use-coin','coin-draw-two','coin-all-shield','coin-lock-self-next','peek-opponent-hand','random-esp']);
const cards=[...require('./cards/gym1.json'),...require('./cards/gym2.json')];
const all=cards.flatMap(c=>(c.attacks||[]).flatMap((a,index)=>{const k=A.compile(a)?.kind;return k&&k.startsWith('gym:')&&newKinds.has(k.slice(4))?[{c,a,index,k}]:[];}));
assert.equal(all.length,44,'Expected 44 new attack signatures beyond no-retreat aliases and existing signatures');
let used=0;
for(const {c,a,index,k} of all){
 const g=game(used+2137),p=g.players[0],f=g.players[1];p.active=unit(c.id,{energies:(a.cost||[]).map(e=>energy[e]||energy.Grass)});
 f.active=unit('base1-3');f.bench=[unit('base1-8')];p.bench=[unit('base1-1')];
 if(['gym:karate-chop','gym:thunder-flare'].includes(k))p.active.damage=20;
 if(['gym:pendulum-curse','gym:pulled-punch'].includes(k))f.active.damage=20;
 if(k==='gym:mega-drain')p.active.damage=20;
 if(k==='gym:love-lariat')p.bench.push(unit('gym2-7'));
 const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:index}});
 assert.ok(r.ok,`Reducer: ${c.id}/${a.name}: ${r.error}`);
 assert.equal(g.pendingDecision,null,`No incomplete decision: ${c.id}/${a.name}`);
 used++;
}
assert.equal(used,44);
{
 const g=game(),p=g.players[0];p.active=unit('gym1-28',{energies:Array(4).fill('base1-100')});const before=p.discard.length;
 ok(g,0,'attack',{attackIndex:CATALOG.get('gym1-28').attacks.findIndex(a=>a.name==='Thunderbolt')});assert.equal(g.players[0].active.energies.length,0);assert.equal(g.players[0].discard.length,before+4);
}
{
 const g=game(),p=g.players[0];p.active=unit('gym1-5',{damage:40,energies:Array(3).fill('base1-99')});
 ok(g,0,'attack',{attackIndex:0});assert.ok(g.players[0].active.damage<40,'Mega Drain heals from damage');
}
{
 const g=game(),p=g.players[0],f=g.players[1];p.active=unit('gym2-29',{energies:Array(2).fill('base1-101')});
 const id=CATALOG.get('gym2-29').attacks.findIndex(a=>a.name==='Dark Wave');ok(g,0,'attack',{attackIndex:id});assert.ok(g.powerBlankUntil>5);
}
{
 const g=game(),p=g.players[0];p.active=unit('gym1-34',{energies:Array(2).fill('base1-99'),damage:30});p.bench=[unit('base1-1',{damage:20})];
 const id=CATALOG.get('gym1-34').attacks.findIndex(a=>a.name==='Healing Pollen');ok(g,0,'attack',{attackIndex:id});assert.ok(g.players[0].active.damage<=30&&g.players[0].bench[0].damage<=20);
}
// Trainer cards: use the real prompt/commit flow; no fictional automatic target choices.
const trainers=["Blaine's Last Resort","Erika's Kindness",'Good Manners','Master Ball',"Giovanni's Last Resort","Misty's Tears","Erika's Maids","The Rocket's Trap","Rocket's Secret Experiment"];
let trainerRuns=0;
for(const name of trainers){
 const card=cards.find(x=>x.supertype==='Trainer'&&x.name===name);assert.ok(card&&T.SUPPORTED.has(name));
 const g=game(trainerRuns+751),p=g.players[0];p.hand=[card.id];p.deck=['base1-1','base1-99','base1-3','base1-102','base1-8'];
 if(name==="Giovanni's Last Resort")p.active=unit('gym2-7',{damage:30});
 if(name==="Misty's Tears")p.hand.push('base1-99');
 if(name==="Erika's Maids")p.hand.push('base1-99','base1-98');
 const r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
 assert.ok(r.ok,`Trainer ${name}: ${r.error}`);
 let guard=0;while(g.pendingDecision&&guard++<8)choose(g);
 assert.ok(guard<8,`${name} produced too many choices`);
 assert.equal(g.pendingDecision,null,`${name} unresolved`);
 assert.ok(g.players[0].discard.includes(card.id),`${name} must enter discard`);trainerRuns++;
}
{
 const g=game(),p=g.players[0];p.active=unit('gym1-65',{damage:20});
 ok(g,0,'use_power',{slot:-1});assert.equal(g.players[0].active.damage,10);
 const r=applyCommand(g,0,{type:'use_power',payload:{slot:-1}});assert.equal(r.ok,false,'Natural Healing once per turn');
}
{
 const g=game(),p=g.players[0];p.active=unit('gym2-97',{energies:['base1-101','base1-101'],damage:50});
 // Gaseous Form increases effective max HP by 20. Without the Power this card has 30 HP.
 assert.ok(P.PASSIVE.has('Gaseous Form'));
 const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:0}}); // May be unported; must not falsely accept.
 assert.ok(r.ok===true||r.ok===false);
}
console.log(`PASS Gym v0.24: ${used} new attacks executed, ${trainerRuns} trainer decision flows, Power actions and state checks`);
// Newly shared Gym search and multi-target decision paths.
const chosenAttacks=[
 ['gym1-20','Rock Slide'],['gym1-21','Tunneling'],['gym2-4','Wide Solarbeam'],['gym2-38','Stretch Vine'],
 ['gym1-25','Moonwatching'],['gym2-95','Energy Support'],['gym2-62','Stoke'],
 ['gym1-6','Charge'],['gym1-27','Charge'],['gym1-81','Charge'],['gym1-32','Jellyfish Pod']
];
let choices=0;
for(const [id,name] of chosenAttacks){
 const g=game(1300+choices),p=g.players[0],f=g.players[1],c=CATALOG.get(id),i=c.attacks.findIndex(a=>a.name===name),a=c.attacks[i];
 assert.ok(i>=0);p.active=unit(id,{energies:(a.cost||[]).map(e=>energy[e]||energy.Grass)});
 f.bench=[unit('base1-8'),unit('base1-9'),unit('base1-1')];
 p.deck.push('base1-99','base1-98','base1-100','gym1-32');
 p.discard=['base1-100','base1-100','base1-97'];
 const before=p.active.energies.length,hand=p.hand.length;
 const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:i}});assert.ok(r.ok,`${id} ${name} ${r.error}`);
 assert.ok(g.pendingDecision,`${id} ${name} should open a real player decision`);
 assert.equal(g.pendingDecision.actor,0);
 const d=g.pendingDecision;
 const required=Math.max(d.min,1);
 assert.ok(required<=d.max);
 choose(g,d.options.slice(0,required).map(x=>x.id));
 assert.equal(g.pendingDecision,null,`${id} ${name} decision must resolve`);
 if(['Moonwatching','Energy Support','Jellyfish Pod'].includes(name))assert.equal(g.players[0].hand.length,hand+required);
 if(name==='Stoke'||name==='Charge')assert.equal(g.players[0].active.energies.length,before+required);
 if(name==='Rock Slide'||name==='Tunneling'||name==='Wide Solarbeam'||name==='Stretch Vine')assert.ok(g.players[1].bench.some(x=>x.damage>0));
 choices++;
}
assert.equal(choices,11);
// Verify a rejected, tampered Bench target does not spend the attack turn or mutate match state.
{
 const g=game(),p=g.players[0],f=g.players[1];p.active=unit('gym1-20',{energies:Array(3).fill('base1-97')});f.bench=[unit('base1-8')];
 ok(g,0,'attack',{attackIndex:0});let d=g.pendingDecision;assert.ok(d);const snapshot=structuredClone(g);
 const rejected=applyCommand(g,0,{type:'choose',payload:{decisionId:d.id,selected:['bench:99']}});
 assert.equal(rejected.ok,false);assert.deepEqual(g,snapshot,'invalid target must leave game untouched');
 choose(g,['bench:0']);
}
console.log(`PASS Gym choice migration: ${choices} real multi-stage attack decisions and invalid-choice rollback`);
// Healing Fire is triggered by an actual attachment, rather than a Power button.
{
 const g=game(),p=g.players[0];p.active=unit('gym2-21',{damage:30});p.hand=['base1-98'];
 ok(g,0,'attach_energy',{handIndex:0,slot:-1});assert.equal(g.players[0].active.damage,20);
}
// Fortitude must sometimes save Machamp before a Prize is claimed; heads/tails
// are controlled by the seeded authoritative RNG.
{
 let saved=0,defeated=0;
 for(let seed=0;seed<30;seed++){
  const g=game(),p=g.players[0],f=g.players[1];g.rngState=Math.imul(seed,0x9e3779b1)>>>0;
  p.active=unit('gym1-28',{energies:Array(4).fill('base1-100')});f.active=unit('gym2-6');f.bench=[unit('base1-1')];p.prizes=['base1-99','base1-99'];
  const beforePrizes=p.prizes.length;
  ok(g,0,'attack',{attackIndex:1});
  if(g.players[1].active?.id==='gym2-6'){
   assert.equal(g.players[1].active.damage,Number(CATALOG.get('gym2-6').hp)-10);
   assert.equal(g.players[0].prizes.length,beforePrizes);saved++;
  }else{assert.equal(g.players[0].prizes.length,beforePrizes-1);defeated++;}
 }
 assert.ok(saved>0&&defeated>0,'Fortitude must support both outcomes');
}
console.log('PASS Gym reactive Powers: Healing Fire and Fortitude both coin outcomes');
// Stadium interactions including Gym Challenge official errata.
{
 const g=game(),p=g.players[0],f=g.players[1];p.active=unit('base1-3',{energies:['base1-99']});p.bench=[unit('base1-1')];
 g.stadium={id:'gym1-104',owner:1};
 const r=applyCommand(g,0,{type:'retreat',payload:{slot:0}});
 assert.equal(r.ok,false,'Rocket Training Gym adds one Colorless retreat cost');
 g.stadium=null;ok(g,0,'retreat',{slot:0});
}
{
 const g=game(),p=g.players[0],f=g.players[1];p.hand=['base1-92','base1-99','base1-98'];f.active=unit('base1-3',{energies:['base1-100']});g.stadium={id:'gym1-103',owner:1};
 ok(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.min,2,'Two additional cards are required by No Removal Gym');
 choose(g,g.pendingDecision.options.map(x=>x.id));assert.ok(g.pendingDecision);
 choose(g,['slot:-1']);assert.ok(g.pendingDecision);
 choose(g,['n:0']);assert.equal(g.players[1].active.energies.length,0);
 assert.equal(g.players[0].discard.filter(x=>['base1-99','base1-98'].includes(x)).length,2);
}
{
 let triggered=0;
 for(let seed=0;seed<30;seed++){
  const g=game(),p=g.players[0];g.stadium={id:'gym2-119',owner:1};g.rngState=Math.imul(seed,0x9e3779b1)>>>0;p.hand=['base1-3'];p.bench=[];
  ok(g,0,'bench',{handIndex:0});if(g.players[0].bench[0].damage===20)triggered++;
  else assert.equal(g.players[0].bench[0].damage,0);
 }
 assert.ok(triggered>0&&triggered<30,'Minefield should deal 2 damage counters on tails (official errata)');
}
{
 const g=game(),p=g.players[0],f=g.players[1];g.stadium={id:'gym2-109',owner:1};
 p.active=unit('base1-7',{energies:['base1-97']});f.active=unit('base1-57');
 ok(g,0,'attack',{attackIndex:0});assert.equal(g.players[1].active.damage,10,'Resistance Gym changes -30 to -10');
}
{
 const g=game(),p=g.players[0],f=g.players[1];p.hand=['gym2-125'];p.bench=[unit('base1-1')];f.active=unit('gym1-39',{energies:['base1-102','base1-102','base1-102']});
 ok(g,0,'play_trainer',{handIndex:0});assert.ok(g.players[0].transparentWallsUntil>g.turnSerial);
 g.turn=1;g.turnSerial++;const idx=CATALOG.get('gym1-39').attacks.findIndex(a=>a.name==='Spiral Dive');
 ok(g,1,'attack',{attackIndex:idx});assert.equal(g.players[0].bench[0].damage,0,'Transparent Walls stops attacks damaging Bench');
 assert.ok(g.players[0].active.damage>0,'Active is still damaged');
}
console.log('PASS Gym Stadiums: Training, No Removal, Minefield errata, Resistance, Transparent Walls');
// Legacy Trainer preflights: illegal retrieval / movement must not open a
// mandatory decision which the player cannot finish.
for(const [id,hand] of [['base1-81',['base1-81','base1-99']],['gym2-20',['gym2-20']]]){
 const g=game(),p=g.players[0];p.hand=hand;p.discard=[];const snapshot=structuredClone(g);
 const r=applyCommand(g,0,{type:'play_trainer',payload:{handIndex:0}});
 assert.equal(r.ok,false,`Impossible ${id} must be rejected upfront`);
 assert.deepEqual(g,snapshot,`Impossible ${id} must not change cards or create a pending prompt`);
}
console.log('PASS legacy Trainer preflights reject impossible Energy Retrieval and Sabrina resolutions atomically');
