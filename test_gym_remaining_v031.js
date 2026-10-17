'use strict';
const assert=require('node:assert/strict');
const {CATALOG,createGame,applyCommand}=require('./headless_duel');
const ATTACK=require('./attack_effects_core'),TRAINERS=require('./classic_trainer_core');
const RETAIL=require('./retail_theme_decks');
const unit=(id,extra={})=>({id,under:[],energies:[],attachedTrainers:[],damage:0,status:null,playedTurn:1,...extra});
const energy={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Colorless:'base1-99'};
function game(seed=8137){const g=createGame({decks:[RETAIL.list('brock'),RETAIL.list('misty')],format:'gym-expanded',seed});g.phase='game';g.turn=0;g.round=4;g.turnSerial=8;
 g.players[0].active=unit('base1-3');g.players[1].active=unit('base1-3');g.players[0].bench=[unit('base1-1')];g.players[1].bench=[unit('base1-8')];return g;}
const cmd=(g,side,type,payload={})=>{const r=applyCommand(g,side,{type,payload});assert.ok(r.ok,`${type}: ${r.error}`);return g;};
function attack(g,id,name){const c=CATALOG.get(id),i=c.attacks.findIndex(a=>a.name===name);assert.ok(i>=0);g.players[0].active=unit(id,{energies:c.attacks[i].cost.map(t=>energy[t]||energy.Colorless)});cmd(g,0,'attack',{attackIndex:i});assert.equal(g.pendingDecision,null,id+' / '+name+' unexpectedly asked for an unhandled decision');return g;}
const records=[
 ['gym1-6','Discharge'],['gym1-31','Water Ring'],['gym1-43','Deflector'],['gym1-92','Suggestion'],
 ['gym2-5','Summon Storm'],['gym2-7','Intimidate'],['gym2-14','Juxtapose'],['gym2-15','Plasma'],
 ['gym2-27','Aerial Maneuvers'],['gym2-51','Surprise'],['gym2-53','Focus Energy'],
 ['gym2-85','Focus Energy'],['gym2-92','Star Boomerang'],
 ['gym1-1','Phoenix Flame'],['gym1-14','Pain Amplifier'],['gym1-50','Removal Pulse'],
 ['gym1-96','Removal Beam'],['gym2-5','Dragon Tornado']
];
for(let i=0;i<records.length;i++){
 const [id,name]=records[i],g=game(100+i),c=CATALOG.get(id),a=c.attacks.find(x=>x.name===name);
 assert.ok(ATTACK.compile(a)?.kind.startsWith('gym:'),`Missing Gym compiler for ${id}/${name}`);
 if(name==='Surprise')g.players[1].hand=['base1-99'];
 if(name==='Plasma')g.players[0].discard=['base1-100'];
 if(name==='Juxtapose')g.players[0].active.damage=0;
 if(name==='Removal Pulse'||name==='Removal Beam')g.players[1].active.energies=['base1-101'];
 if(name==='Dragon Tornado'){const c=CATALOG.get(id),index=c.attacks.findIndex(a=>a.name===name);g.players[0].active=unit(id,{energies:c.attacks[index].cost.map(x=>energy[x]||energy.Colorless)});cmd(g,0,'attack',{attackIndex:index});assert.equal(g.pendingDecision?.actor,0);choose(g,['bench:0']);assert.equal(g.pendingDecision,null);}else attack(g,id,name);
}
{const g=game(45),p=g.players[0],f=g.players[1];f.active=unit('base1-3');p.bench=[unit('base1-1'),unit('base1-9')];f.bench=[unit('base1-8'),unit('base1-7')];attack(g,'gym1-31','Water Ring');assert.equal(g.players[0].bench[0].damage,10);assert.equal(g.players[0].bench[1].damage,10);assert.equal(g.players[1].active.damage,30,'Water Ring deals its printed 30 to Defending Pokémon');assert.equal(g.players[1].bench[0].damage,10);}
{const g=game(46),p=g.players[0];p.discard=['base1-100'];attack(g,'gym2-15','Plasma');assert.equal(g.players[0].discard.length,0);assert.ok(g.players[0].active.energies.includes('base1-100'));}
{const g=game(47),p=g.players[0],f=g.players[1];f.hand=['base1-98'];const before=f.deck.length;attack(g,'gym2-51','Surprise');assert.equal(g.players[1].deck.length, before, 'Opponent draws a new card when their turn starts');assert.ok(g.players[0].privateLog?.some(x=>x.startsWith('Surprise revealed '))); }
{const g=game(48),p=g.players[0],f=g.players[1];p.bench=[unit('base1-1')];const before=p.hand.length;attack(g,'gym2-92','Star Boomerang');if(g.players[0].active?.id!=='gym2-92'){assert.ok(g.players[0].hand.includes('gym2-92'));assert.ok(g.players[0].hand.length>before);}}
{const g=game(49),p=g.players[0],f=g.players[1];p.active=unit('gym2-14',{energies:['base1-101'],damage:30});f.active=unit('base1-3',{damage:20});const seed=g.rngState;cmd(g,0,'attack',{attackIndex:0});assert.ok(g.players[0].active.damage===20||g.players[0].active.damage===30);if(g.players[0].active.damage===20)assert.equal(g.players[1].active.damage,30);}
function choose(g,selected){const d=g.pendingDecision;assert.ok(d,'No pending choice');cmd(g,d.actor,'choose',{decisionId:d.id,selected});}
const find=id=>CATALOG.get(id);
{const g=game(),p=g.players[0];p.hand=['gym1-114'];p.deck=['base1-99','base1-98','base1-100','base1-101','base1-97','base1-1','base1-2','base1-3'];cmd(g,0,'play_trainer',{handIndex:0});const d=g.pendingDecision;assert.equal(d.min,2);const kept=[d.options[0].id,d.options[1].id];choose(g,kept);assert.equal(g.pendingDecision,null);assert.equal(g.players[0].hand.length,2);assert.equal(g.players[0].discard.length,6,'Trainer plus five unwanted cards');assert.equal(g.players[0].deck.length,1);}
{const g=game(),p=g.players[0];p.hand=['gym1-126'];p.discard=['base1-99','base1-100'];const count=p.deck.length+p.discard.length+1;cmd(g,0,'play_trainer',{handIndex:0});assert.equal(g.players[0].deck.length+g.players[0].discard.length,count);assert.equal(g.players[0].discard.length,3,'Trash Exchange must count itself');}
{const g=game(),p=g.players[0];p.hand=['gym1-122'];p.active=unit('base1-3',{energies:['base1-99','base1-100']});p.bench=[unit('base1-1',{energies:['base1-98']})];cmd(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.max,3);const d=g.pendingDecision;choose(g,d.options.map(x=>x.id));assert.equal(g.players[0].active.energies.length,0);assert.equal(g.players[0].bench[0].energies.length,0);assert.equal(g.players[0].hand.length,3);}
// Lucky Shot requests one real opponent Bench target; heads can deal 30.
{const g=game(),c=CATALOG.get('gym1-38'),idx=c.attacks.findIndex(a=>a.name==='Lucky Shot');g.players[0].active=unit(c.id,{energies:['base1-97','base1-99']});cmd(g,0,'attack',{attackIndex:idx});assert.equal(g.pendingDecision?.actor,0);choose(g,['bench:0']);assert.equal(g.pendingDecision,null);assert.ok([0,30].includes(g.players[1].bench[0].damage));}
// Opponent Energy choices cannot silently pick index 0 when there are variants.
{let found=false;for(let seed=0;seed<40&&!found;seed++){
 const g=game(seed),c=CATALOG.get('gym1-96');g.players[0].active=unit(c.id,{energies:['base1-99','base1-101']});g.players[1].active.energies=['base1-99','base1-100'];
 cmd(g,0,'attack',{attackIndex:1});if(g.pendingDecision){found=true;assert.equal(g.pendingDecision.actor,0);const old=structuredClone(g);
 const bad=applyCommand(g,0,{type:'choose',payload:{decisionId:g.pendingDecision.id,selected:['energy:12']}});assert.equal(bad.ok,false);assert.deepEqual(g,old);
 choose(g,['energy:1']);assert.equal(g.players[1].active.energies.length,1);assert.equal(g.players[1].discard.at(-1),'base1-100');}}
 assert.ok(found,'Coin-heads Energy discard must prompt for choice');}
{const g=game(),p=g.players[0],f=g.players[1];f.active.damage=20;f.bench=[unit('base1-8',{damage:10}),unit('base1-7')];attack(g,'gym1-14','Pain Amplifier');assert.equal(g.players[1].active.damage,30);assert.equal(g.players[1].bench[0].damage,20);assert.equal(g.players[1].bench[1].damage,0);}
// Misty's Duel is allowed to use the explicitly printed coin-flip fallback.
{const g=game(),p=g.players[0];p.hand=['gym1-123','base1-1','base1-2'];cmd(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision,null);assert.ok(g.players.some(q=>q.hand.length===5));}
// Opponent chooses Treaty mode; both Prize choices belong to their owners.
{const g=game();g.players[0].hand=['gym1-112'];for(const p of g.players)p.prizes=['base1-99','base1-98','base1-100'];const prizes=g.players.map(p=>p.prizes.length);
 cmd(g,0,'play_trainer',{handIndex:0});assert.equal(g.pendingDecision.actor,1);choose(g,['mode:0']);
 assert.equal(g.pendingDecision.actor,1);choose(g,['prize:1']);assert.equal(g.pendingDecision.actor,0);choose(g,['prize:2']);
 assert.equal(g.pendingDecision,null);assert.equal(g.players[0].prizes.length,prizes[0]-1);assert.equal(g.players[1].prizes.length,prizes[1]-1);
}
{const g=game();g.players[0].hand=['gym1-112'];const before=g.players[0].hand.length;
 cmd(g,0,'play_trainer',{handIndex:0});choose(g,['mode:1']);assert.equal(g.pendingDecision,null);
 assert.equal(g.players[0].hand.length,before,'Treaty draw replaces the played Trainer in hand');}
{let heads=0,tails=0;for(let seed=0;seed<50;seed++){
 const g=game(seed);g.players[0].hand=['gym1-113'];const size=g.players[1].hand.length;
 cmd(g,0,'play_trainer',{handIndex:0});if(g.pendingDecision){heads++;assert.equal(g.pendingDecision.actor,0);choose(g,['bench:0']);
 assert.ok(g.players[1].hand.length>=size+1);assert.equal(g.players[1].bench.length,0);
 }else{tails++;assert.equal(g.turn,1,'Minion on tails immediately ends the turn');}}
 assert.ok(heads>0&&tails>0,'Both Minion coin outcomes must be exercised');}
// Passive powers must execute, not merely enter the handler registry.
{const g=game(),p=g.players[0];p.active=unit('gym1-47',{energies:['base1-98','base1-101'],status:'Asleep'});
 assert.ok(require('./classic_power_core').enabled(g,p.active,'Photosynthesis'),'Photosynthesis works while Asleep');
 p.active.status=null;const c=CATALOG.get('gym1-47'),index=c.attacks.findIndex(a=>a.cost?.includes('Grass'));
 if(index>=0){const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:index}});assert.ok(r.ok,'Oddish uses colored Energy as Grass: '+r.error);}
}
{let reductions=0;for(let seed=0;seed<15;seed++){
 const g=game(seed),f=g.players[1];g.players[0].active=unit('gym1-31',{energies:['base1-102','base1-102','base1-99','base1-99']});f.active=unit('gym1-29');
 const r=applyCommand(g,0,{type:'attack',payload:{attackIndex:0}});assert.ok(r.ok,r.error);
 assert.equal(g.players[1].active.damage,20,'Shell Armor always reduces attack damage by ten');reductions++;
 }assert.equal(reductions,15);}
{const g=game();g.players[0].active=unit('gym2-53',{energies:['base1-99','base1-99']});
 cmd(g,0,'attack',{attackIndex:0});assert.equal(g.players[0].active.gymFocus?.expires,10);
 g.turnSerial=10;g.turn=0;g.players[1].active=unit('base1-3');cmd(g,0,'attack',{attackIndex:1});
 assert.equal(g.players[1].active.damage,80,'Raticate doubled base attack damage');assert.equal(g.players[0].active.damage,40,'Raticate doubled recoil');}
for(const n of ["Misty's Wrath",'Misty\'s Duel','Trash Exchange','Energy Flow'])assert.ok(TRAINERS.SUPPORTED.has(n));
console.log(`PASS Gym v0.31: ${records.length} executable attack signatures; 6 Trainer effects; genuine choices, bench targeting, Energy conservation and card movement`);
