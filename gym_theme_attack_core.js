'use strict';
// Narrowly scoped Gym Heroes / Gym Challenge attack programs for the retail
// theme decks. Card signatures match entire printed attack text and damage.
// Unsupported Gym scripts deliberately return null, never a no-op.
const gym=[...require('./cards/gym1.json'),...require('./cards/gym2.json')];
const specs={
 'gym1-66|Hook Shot':'ignore-resistance',
 'gym1-72|Sand Pit':'no-retreat',
 'gym1-87|Hypnotic Stare':'heads-paralysis-tails-sleep',
 'gym1-53|Water Punch':'water-punch',
 'gym1-10|Jellyfish Poison':'heads-poison-tails-confuse',
 'gym1-84|Spin Ball':'one-coin-times',
 'gym1-51|Super Fang':'half-remaining',
 'gym1-49|Sleep Poison':'sleep-poison',
 'gym1-44|Psychic Exchange':'shuffle-hand-draw-five',
 'gym1-78|Blot':'heal-ten',
 'gym1-78|Sporadic Sponging':'coin-heal-ten',
 'gym1-46|Dream Dance':'sleep-both',
 'gym1-45|Healing Pollen':'coin-heal-forty',
 'gym2-77|Fast-Acting Poison':'two-coin-double-status',
 'gym2-79|Smelly Gas':'coin-bench-all',
 'gym2-50|Spontaneous Explosion':'coin-bonus-recoil',
 'gym2-62|Stoke':'energy-search-fire-attach',
 'gym2-61|Retaliate':'ten-per-self-counter',
 'gym2-75|Double-edge':'recoil-twenty',
 'gym2-44|Poison Sting Tackle':'self-twenty-coin-poison',
 'gym2-76|Retaliation':'min-twenty-damage',
 'gym2-45|Rend':'if-defender-damaged-plus-twenty',
 'gym2-72|Fury Punch':'coin-self-counters-twenty',
 'gym2-42|Risky Attack':'tails-one-hundred-self',
 'gym2-42|Headlock':'heads-bonus-paralysis',
 'gym2-93|Synchronize':'matching-energy-counts',
 'gym2-98|Barrier Attack':'shield-ten',
 'gym2-31|Bonfire':'bonfire-complex',
 'gym2-60|Fire Tail Slap':'fire-tail-complex',
 'gym1-90|Swift':'swift-ignore-effects',
 'gym2-33|Stamp':'stamp-bench',
 'gym1-62|Blaze':'blaze-grass-bench'
};

// Explicit card/attack signatures: unsupported wording is never treated as vanilla damage.
specs['gym1-5|Mega Drain']='mega-drain';
specs['gym1-7|Clutch']='no-retreat';
specs['gym1-9|Knockout Needle']='double-heads-bonus';
specs['gym1-28|Thunderbolt']='discard-all-self';
specs['gym1-33|Collapse']='self-sleep';
specs['gym1-34|Healing Pollen']='healing-pollen';
specs['gym1-34|Sonic Distortion']='two-coins-confuse';
specs['gym1-37|Lava Burst']='lava-burst';
specs['gym1-39|Spiral Dive']='spiral-dive';
specs['gym1-58|Night Spirits']='night-spirits';
specs['gym1-59|Good Morning']='wake-defender';
specs['gym1-60|Naptime']='naptime';
specs['gym1-60|Screaming Headbutt']='disable-self-next';
specs['gym1-62|Blaze']='blaze-grass-bench';
specs['gym1-64|Full Speed Charge']='full-speed-charge';
specs['gym1-68|Fidget']='shuffle-own-deck';
specs['gym1-68|Karate Chop']='karate-chop';
specs['gym1-70|Drill Tackle']='double-heads-hit';
specs['gym1-89|Clamp']='clamp';
specs['gym1-93|Spook']='no-retreat';
specs['gym1-95|Lazy Attack']='self-sleep';
specs['gym2-11|Kerzap']='kerzap';
specs['gym2-16|Mega Burn']='disable-self-next';
specs['gym2-21|Burn Up']='coin-discard-fire';
specs['gym2-22|Lie Low']='lie-low';
specs['gym2-23|Love Lariat']='love-lariat';
specs['gym2-25|Poison Buildup']='self-poison';
specs['gym2-25|Poison Power']='poison-power';
specs['gym2-28|High Voltage']='coin-lock-trainers';
specs['gym2-28|Thunder Flare']='thunder-flare';
specs['gym2-29|Dark Wave']='blank-powers';
specs['gym2-29|Shadow Bind']='no-retreat';
specs['gym2-34|Detonate']='detonate';
specs['gym2-35|Mega Thrash']='mega-thrash';
specs['gym2-47|Toxic Secretion']='double-poison';
specs['gym2-50|Toxic Cloud']='double-poison';
specs['gym2-52|Power Ball']='three-coin-bonus';
specs['gym2-56|Pendulum Curse']='pendulum-curse';
specs['gym2-69|Group Therapy']='group-therapy';
specs['gym2-69|Pulled Punch']='pulled-punch';
specs['gym2-71|Poison Spore']='poison-spore';
specs['gym2-73|Ancestral Memory']='single-use-coin';
specs['gym2-81|Grasping Vine']='coin-draw-two';
specs['gym2-88|Play Dead']='coin-all-shield';
specs['gym2-89|Bubbles']='coin-lock-self-next';
specs['gym2-91|Frostbite']='no-retreat';
specs['gym2-94|Psyscan']='peek-opponent-hand';
specs['gym2-99|Random ESP']='random-esp';
specs['gym2-90|ESP']='psyduck-esp';

specs['gym1-20|Rock Slide']='bench-select';
specs['gym1-21|Tunneling']='bench-select';
specs['gym2-4|Wide Solarbeam']='bench-select';
specs['gym2-12|Electro Beam']='coin-discard-all-self';
specs['gym2-15|Electroburn']='lightning-recoil';
specs['gym2-38|Stretch Vine']='bench-select';
specs['gym1-25|Moonwatching']='search-basic-energy';
specs['gym2-95|Energy Support']='search-basic-energy';
specs['gym2-62|Stoke']='search-fire-attach';
specs['gym1-6|Charge']='charge-lightning';
specs['gym1-27|Charge']='charge-lightning';
specs['gym1-81|Charge']='charge-lightning';
specs['gym1-32|Jellyfish Pod']='jellyfish-search';
// Gym v0.31: further card-specific, executable attacks. All signatures are
// registered using the full historical attack text, never just attack names.
Object.assign(specs,{
 'gym1-1|Phoenix Flame':'phoenix-flame',
 'gym1-14|Pain Amplifier':'pain-amplifier',
 'gym1-38|Lucky Shot':'bench-select',
 'gym1-50|Removal Pulse':'removal-beam',
 'gym1-96|Removal Beam':'removal-beam',
 'gym2-5|Dragon Tornado':'dragon-tornado',
 'gym1-6|Discharge':'discharge',
 'gym1-31|Water Ring':'water-ring',
 'gym1-43|Deflector':'deflector',
 'gym1-92|Suggestion':'suggestion',
 'gym2-5|Summon Storm':'summon-storm',
 'gym2-7|Intimidate':'intimidate',
 'gym2-14|Juxtapose':'juxtapose',
 'gym2-15|Plasma':'plasma',
 'gym2-27|Aerial Maneuvers':'aerial-maneuvers',
 'gym2-51|Surprise':'surprise',
 'gym2-53|Focus Energy':'focus-raticate',
 'gym2-85|Focus Energy':'focus-rattata',
 'gym2-92|Star Boomerang':'star-boomerang',
 'gym1-43|Egg Bomb':'egg-bomb',
 'gym2-54|Ice Throw':'ice-throw',
 'gym2-30|Damage Shift':'damage-shift',
 'gym2-2|Roaring Flames':'roaring-flames',
 'gym2-10|Giant Growth':'giant-growth',
 'gym2-87|Ink Spurt':'ink-spurt',
 'gym1-91|Energy Loop':'energy-loop',
 'gym1-24|Alert':'alert',
 'gym1-11|Crosscounter':'crosscounter',
 'gym1-12|Fire Wall':'fire-wall',
 'gym1-13|Shadow Images':'shadow-images'
});
// Gym v0.33 interactive final-expansion attack handlers.
Object.assign(specs,{
 'gym1-3|Fairy Power':'last-fairy-power','gym1-4|Take Away':'last-take-away','gym1-14|Call of the Night':'last-call-night',
 'gym1-27|Electric Current':'last-electric-current','gym1-48|Flytrap':'last-flytrap','gym1-61|Kindle':'last-kindle','gym1-94|Sleight of Hand':'last-sleight-hand',
 'gym2-2|Flame Jet':'last-flame-jet','gym2-4|Growth':'last-growth','gym2-12|Super Removal':'last-super-removal','gym2-22|Earthdrill':'last-earthdrill',
 'gym2-24|Overhead Toss':'last-overhead-toss','gym2-39|Errand-Running':'last-errand','gym2-40|Lunar Power':'last-lunar-power','gym2-49|Messenger':'last-messenger',
 'gym2-56|Invigorate':'last-invigorate','gym2-59|Magic Darts':'last-magic-darts','gym2-63|Pranks':'last-pranks','gym2-65|Overrun':'last-overrun',
 'gym2-83|Group Attack':'last-group-attack','gym2-89|Amnesia':'last-amnesia'
});
// Work on only documented, fully implemented effect programs.
const supported=new Set([
 ...Object.values(specs).filter(x=>x.startsWith('last-')),
 'phoenix-flame','pain-amplifier','removal-beam','dragon-tornado',
 'crosscounter','fire-wall','shadow-images',
 'egg-bomb','ice-throw','damage-shift','roaring-flames','giant-growth','ink-spurt','energy-loop','alert',
 'discharge','water-ring','deflector','suggestion','summon-storm','intimidate','juxtapose','plasma','aerial-maneuvers','surprise','focus-raticate','focus-rattata','star-boomerang',
 'coin-discard-all-self','lightning-recoil','ignore-resistance','no-retreat','heads-paralysis-tails-sleep','water-punch','heads-poison-tails-confuse','one-coin-times',
 'half-remaining','sleep-poison','shuffle-hand-draw-five','heal-ten','coin-heal-ten','sleep-both','coin-heal-forty',
 'two-coin-double-status','coin-bench-all','coin-bonus-recoil','ten-per-self-counter','recoil-twenty',
 'self-twenty-coin-poison','min-twenty-damage','if-defender-damaged-plus-twenty','coin-self-counters-twenty',
 'tails-one-hundred-self','heads-bonus-paralysis','matching-energy-counts','shield-ten','bench-select','search-basic-energy','search-fire-attach','charge-lightning','jellyfish-search',
 'blank-powers','blaze-grass-bench','clamp','coin-all-shield','coin-discard-fire','coin-draw-two','coin-lock-self-next','coin-lock-trainers','detonate','disable-self-next','discard-all-self','double-heads-bonus','double-heads-hit','double-poison','full-speed-charge','group-therapy','healing-pollen','karate-chop','kerzap','lava-burst','lie-low','love-lariat','mega-drain','mega-thrash','naptime','night-spirits','peek-opponent-hand','pendulum-curse','poison-power','poison-spore','pulled-punch','random-esp','psyduck-esp','self-poison','self-sleep','shuffle-own-deck','single-use-coin','spiral-dive','three-coin-bonus','thunder-flare','two-coins-confuse','wake-defender'
]);
const signatures=new Map();
for(const card of gym)for(const attack of card.attacks||[]){const kind=specs[card.id+'|'+attack.name];if(kind&&supported.has(kind)){
 const extra={};
 if(kind==='bench-select'){
  extra.maxBench=attack.name==='Rock Slide'?3:2;
  if(attack.name==='Lucky Shot'){extra.maxBench=1;extra.benchMode='one';extra.benchAmount=30;extra.rollToHit=true;}
  if(attack.name==='Stretch Vine')extra.maxBench=1;
  extra.benchAmount=attack.name==='Tunneling'||attack.name==='Wide Solarbeam'?20:10;
  extra.benchMode=attack.name==='Wide Solarbeam'?'exact':attack.name==='Stretch Vine'?'one':'optional';
  extra.locksAll=attack.name==='Tunneling';
 }
 if(kind==='charge-lightning')extra.maxSearch=card.id==='gym1-81'?1:2;
 signatures.set(JSON.stringify([attack.name,attack.damage||'',attack.text||'']),Object.freeze({kind:'gym:'+kind,base:parseInt(attack.damage,10)||0,...extra}));
}}
function compile(attack){return signatures.get(JSON.stringify([attack.name,attack.damage||'',attack.text||'']))||null;}
function resolve(p,flip,c={}){
 const n=p.base,arr=[];const roll=()=>{const x=Boolean(flip());arr.push(x);return x;};
 switch(p.kind){
  case 'gym:last-flame-jet':return {damage:roll()?40:0,ignoreWR:true,flips:arr};
  case 'gym:last-fairy-power':case 'gym:last-growth':case 'gym:last-super-removal':case 'gym:last-overhead-toss':case 'gym:last-errand':case 'gym:last-lunar-power':case 'gym:last-pranks':case 'gym:last-overrun':return {damage:n,flips:[roll()]};
  case 'gym:last-call-night':return {damage:n,flips:[roll(),roll()],gymCallNight:true};
  case 'gym:last-magic-darts':return {damage:10*Array.from({length:3},roll).filter(Boolean).length,flips:arr,ignoreWR:true,gymAnyTarget:true};
  case 'gym:last-group-attack':return {damage:0,flips:arr,gymGroupAttack:true};
  case 'gym:last-take-away':return {damage:0,flips:arr,gymTakeAway:true};
  case 'gym:last-electric-current':return {damage:n,flips:arr,gymElectricCurrent:true};
  case 'gym:last-flytrap':return {damage:n,flips:arr,gymFlytrap:true};
  case 'gym:last-kindle':return {damage:n,flips:arr,gymKindle:true};
  case 'gym:last-sleight-hand':return {damage:0,flips:arr,gymSleight:true};
  case 'gym:last-earthdrill':return {damage:n,flips:arr};
  case 'gym:last-messenger':return {damage:0,flips:arr,gymMessenger:true};
  case 'gym:last-invigorate':return {damage:0,flips:arr,gymInvigorate:true};
  case 'gym:last-amnesia':return {damage:0,flips:arr,gymAmnesia:true};
  case 'gym:crosscounter':return {damage:0,gymCrosscounter:true,flips:arr};
  case 'gym:fire-wall':return {damage:n,gymFireWall:true,flips:arr};
  case 'gym:shadow-images':return {damage:0,gymShadowImages:true,flips:arr};
  case 'gym:egg-bomb':{const heads=roll();return {damage:heads?40:0,selfDamage:heads?0:20,flips:arr};}
  case 'gym:ice-throw':return {damage:c.enemyFighting?40:20,flips:arr};
  case 'gym:damage-shift':return {damage:0,gymDamageShift:true,flips:arr};
  case 'gym:roaring-flames':return {damage:20+20*(c.selfFireCards||0),gymRoaringFlames:true,flips:arr};
  case 'gym:giant-growth':return {damage:0,gymGiantGrowth:roll(),flips:arr};
  case 'gym:ink-spurt':return {damage:n,gymInkSpurt:roll(),flips:arr};
  case 'gym:energy-loop':return {damage:n,gymEnergyLoop:true,flips:arr};
  case 'gym:alert':return {damage:0,gymAlert:true,flips:arr};
  case 'gym:phoenix-flame':return {damage:n,themeReturn:roll()?null:'shuffle',flips:arr};
  case 'gym:pain-amplifier':return {damage:0,gymPainAmplifier:true,flips:arr};
  case 'gym:removal-beam':return {damage:n,discardEnemyEnergy:roll(),flips:arr};
  case 'gym:dragon-tornado':return {damage:n,dragonTornado:true,flips:arr};
  case 'gym:discharge':return {damage:30*Array.from({length:c.selfLightning||0},roll).filter(Boolean).length,discardAllTypeEnergy:'Lightning',flips:arr};
  case 'gym:water-ring':return {damage:n,gymWaterRing:true,flips:arr};
  case 'gym:deflector':return {damage:0,shield:{half:true},flips:arr};
  case 'gym:suggestion':return {damage:0,attackLock:roll(),flips:arr};
  case 'gym:summon-storm':{const first=roll(),second=roll(),hit=first&&second;return {damage:hit?20:0,ignoreWR:true,gymStorm:hit,flips:arr};}
  case 'gym:intimidate':return {damage:0,attackLock:(c.enemyMaxHP||0)<=50,flips:arr};
  case 'gym:juxtapose':return {damage:0,gymSwapCounters:roll(),flips:arr};
  case 'gym:plasma':return {damage:n,gymPlasma:true,flips:arr};
  case 'gym:aerial-maneuvers':{const heads=roll();return {damage:n+(heads?30:0),shield:heads?{allEffects:true}:null,flips:arr};}
  case 'gym:surprise':return {damage:0,gymSurprise:true,flips:arr};
  case 'gym:focus-raticate':return {damage:0,gymFocus:'Double-edge',flips:arr};
  case 'gym:focus-rattata':return {damage:0,gymFocus:'Quick Attack',flips:arr};
  case 'gym:star-boomerang':return {damage:n,gymReturnToHand:roll(),flips:arr};
  case 'gym:coin-discard-all-self':return {damage:n,discardAllSelfEnergy:!roll(),flips:arr};
  case 'gym:lightning-recoil':return {damage:n,selfDamage:10*(c.selfLightning||0),flips:arr};
  case 'gym:bench-select':return {damage:n,benchChosenDamage:p.rollToHit?(roll()?p.benchAmount:0):p.benchAmount,disableAllAttacks:Boolean(p.locksAll),flips:arr};
  case 'gym:search-basic-energy':return {damage:n,flips:arr};
  case 'gym:search-fire-attach':return {damage:n,flips:arr};
  case 'gym:charge-lightning':return {damage:n,flips:arr};
  case 'gym:jellyfish-search':return {damage:n,flips:arr};
  case 'gym:mega-drain':return {damage:n,healFromDamage:'half',flips:arr};
  case 'gym:double-heads-bonus':{const a=roll(),b=roll();return {damage:n+(a&&b?60:0),flips:arr};}
  case 'gym:discard-all-self':return {damage:n,discardAllSelfEnergy:true,flips:arr};
  case 'gym:self-sleep':return {damage:n,selfStatus:'Asleep',flips:arr};
  case 'gym:self-poison':return {damage:n,selfStatus:'Poisoned',flips:arr};
  case 'gym:healing-pollen':{const heads=Array.from({length:3},roll).filter(Boolean).length;return {damage:n,healOwnTeam:10*heads,flips:arr};}
  case 'gym:two-coins-confuse':{const a=roll(),b=roll();return {damage:n,status:a||b?'Confused':null,flips:arr};}
  case 'gym:lava-burst':return {damage:20*(c.topFireCount||0),millSelf:5,flips:arr};
  case 'gym:spiral-dive':return {damage:10,ignoreWR:true,benchSide:'opponent',benchDamage:10,flips:arr};
  case 'gym:night-spirits':return {damage:30*Array.from({length:c.nightSpirits||0},roll).filter(Boolean).length,flips:arr};
  case 'gym:wake-defender':return {damage:n,clearDefenderSleep:true,flips:arr};
  case 'gym:naptime':return {damage:n,healSelf:roll()?30:0,selfStatus:arr[0]?'Asleep':null,flips:arr};
  case 'gym:disable-self-next':return {damage:n,disableThisAttack:true,flips:arr};
  case 'gym:blaze-grass-bench':return {damage:n,opponentBenchType:'Grass',opponentBenchTypeDamage:10,flips:arr};
  case 'gym:full-speed-charge':{const heads=Array.from({length:4},roll).filter(Boolean).length;return {damage:heads*20,selfDamage:(4-heads)*20,flips:arr};}
  case 'gym:shuffle-own-deck':return {damage:n,shuffleOwnDeck:true,flips:arr};
  case 'gym:karate-chop':return {damage:Math.max(0,40-10*(c.selfCounters||0)),flips:arr};
  case 'gym:double-heads-hit':{const a=roll(),b=roll();return {damage:a&&b?n:0,flips:arr};}
  case 'gym:clamp':{const a=roll();return {damage:a?n:0,status:a?'Paralyzed':null,flips:arr};}
  case 'gym:kerzap':{const a=roll();return {damage:n+(a?30:0),discardAllTypeEnergy:a?'Lightning':null,flips:arr};}
  case 'gym:coin-discard-fire':return {damage:n,discardAllTypeEnergy:roll()?null:'Fire',flips:arr};
  case 'gym:lie-low':return {damage:n,shield:{reduce:20},flips:arr};
  case 'gym:love-lariat':return {damage:roll()?50+((c.nidokingOnBench||0)?50:0):0,flips:arr};
  case 'gym:poison-power':return {damage:c.selfPoisoned?40:20,status:c.selfPoisoned?'Poisoned':null,flips:arr};
  case 'gym:coin-lock-trainers':return {damage:n,lockTrainers:roll(),flips:arr};
  case 'gym:thunder-flare':return {damage:n+10*(c.selfCounters||0),selfDamage:roll()?0:30,flips:arr};
  case 'gym:blank-powers':return {damage:n,blankPowers:true,flips:arr};
  case 'gym:detonate':return {damage:n,benchSide:'both',benchDamage:10,selfDamage:50,discardStadium:true,flips:arr};
  case 'gym:mega-thrash':return {damage:n,selfDamage:20,discardStadium:true,flips:arr};
  case 'gym:double-poison':{const a=roll();return {damage:n,status:a?'Poisoned':null,poisonDamage:a?20:0,flips:arr};}
  case 'gym:three-coin-bonus':{const heads=Array.from({length:3},roll).filter(Boolean).length;return {damage:n+10*heads,flips:arr};}
  case 'gym:pendulum-curse':return {damage:20*Array.from({length:c.defenderCounters||0},roll).filter(Boolean).length,flips:arr};
  case 'gym:group-therapy':return {damage:n,healEveryPokemon:10,flips:arr};
  case 'gym:pulled-punch':return {damage:(c.defenderCounters||0)?10:40,flips:arr};
  case 'gym:poison-spore':{const a=roll();return {damage:n,status:a?'Poisoned':null,benchSide:a?'opponent':null,benchDamage:10,flips:arr};}
  case 'gym:single-use-coin':return {damage:roll()?n:0,markOnce:true,flips:arr};
  case 'gym:coin-draw-two':return {damage:n,draw:roll()?2:0,flips:arr};
  case 'gym:coin-all-shield':return {damage:n,shield:roll()?{allEffects:true}:null,flips:arr};
  case 'gym:coin-lock-self-next':return {damage:n,disableThisAttack:!roll(),flips:arr};
  case 'gym:peek-opponent-hand':return {damage:n,peekOpponentHand:true,flips:arr};
  case 'gym:psyduck-esp':{const heads=[roll(),roll(),roll()].filter(Boolean).length;return {damage:heads===2?20:0,draw:heads===1?1:0,gymPsyduckHeads:heads,flips:arr};}
  case 'gym:random-esp':{const a=roll();return {damage:a?n:0,status:a?'Confused':null,selfStatus:a?null:'Confused',flips:arr};}

  case 'gym:ignore-resistance':return {damage:n,ignoreResistance:true,flips:arr};
  case 'gym:no-retreat':return {damage:n,noRetreat:true,flips:arr};
  case 'gym:heads-paralysis-tails-sleep':return {damage:n,status:roll()?'Paralyzed':'Asleep',flips:arr};
  case 'gym:water-punch':{const num=c.selfWater||0;return {damage:n+10*Array.from({length:num},roll).filter(Boolean).length,flips:arr};}
  case 'gym:heads-poison-tails-confuse':return {damage:n,status:roll()?'Poisoned':'Confused',flips:arr};
  case 'gym:one-coin-times':return {damage:roll()?20:0,flips:arr};
  case 'gym:half-remaining':return {damage:Math.ceil((c.enemyRemainingHP||0)/20)*10,flips:arr};
  case 'gym:sleep-poison':return {damage:n,statuses:['Asleep','Poisoned'],flips:arr};
  case 'gym:shuffle-hand-draw-five':return {damage:0,shuffleHandDraw:5,flips:arr};
  case 'gym:heal-ten':return {damage:n,healSelf:10,flips:arr};
  case 'gym:coin-heal-ten':return {damage:n,healSelf:roll()?10:0,flips:arr};
  case 'gym:sleep-both':return {damage:n,status:'Asleep',selfStatus:'Asleep',flips:arr};
  case 'gym:coin-heal-forty':return {damage:n,healSelf:roll()?40:0,flips:arr};
  case 'gym:two-coin-double-status':{const first=roll(),second=roll(),heads=first&&second;return {damage:n,statuses:heads?['Confused','Poisoned']:[],flips:arr};}
  case 'gym:coin-bench-all':return {damage:n,benchSide:roll()?'both':null,benchDamage:10,flips:arr};
  case 'gym:coin-bonus-recoil':{const heads=roll();return {damage:heads?n+30:n,selfDamage:heads?30:0,flips:arr};}
  case 'gym:ten-per-self-counter':return {damage:10*(c.selfCounters||0),flips:arr};
  case 'gym:recoil-twenty':return {damage:n,selfDamage:20,flips:arr};
  case 'gym:self-twenty-coin-poison':return {damage:n,selfDamage:20,status:roll()?'Poisoned':null,flips:arr};
  case 'gym:min-twenty-damage':return {damage:n,flips:arr};
  case 'gym:if-defender-damaged-plus-twenty':return {damage:n+((c.defenderCounters||0)>0?20:0),flips:arr};
  case 'gym:coin-self-counters-twenty':return {damage:roll()?20*(c.selfCounters||0):0,flips:arr};
  case 'gym:tails-one-hundred-self':return {damage:roll()?n:0,selfDamage:arr[0]?0:100,flips:arr};
  case 'gym:heads-bonus-paralysis':{const heads=roll();return {damage:n+(heads?20:0),status:heads?'Paralyzed':null,flips:arr};}
  case 'gym:matching-energy-counts':return {damage:n,flips:arr};
  case 'gym:shield-ten':return {damage:n,shield:{reduce:10},flips:arr};
  default:throw Error('Unsupported Gym attack program '+p.kind);
 }
}
module.exports={compile,resolve,signatures};
