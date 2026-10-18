'use strict';
// Exact text matching: this module only compiles effects with fully specified
// portable semantics. Unknown scripts never silently become plain damage.
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoAttackEffectsCore=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 const CLASSIC=(typeof require==='function'?require('./classic_attack_extensions'):null);
 const FINAL=(typeof require==='function'?require('./classic_final_attacks'):null);
 const GYM=(typeof require==='function'?require('./gym_theme_attack_core'):null);
 const NEO=(typeof require==='function'?require('./neo_theme_attack_core'):null);
 const DISCOVERY=(typeof require==='function'?require('./neo_discovery_attack_core'):null);
 const THEME=(typeof require==='function'?require('./theme_completion_attacks'):null);
 const NEO40=(typeof require==='function'?require('./neo_attack_batch_v040'):null);
 const NEO46=(typeof require==='function'?require('./neo_attack_batch_v046'):null);
 const NEO47=(typeof require==='function'?require('./neo_attack_batch_v047'):null);
 const NEO48=(typeof require==='function'?require('./neo_attack_batch_v048'):null);
 const NEO49=(typeof require==='function'?require('./neo_attack_batch_v049'):null);
 const NEO50=(typeof require==='function'?require('./neo_attack_batch_v050'):null);
 const NEO82=(typeof require==='function'?require('./neo_attack_batch_v082'):null);
 const NEO83=(typeof require==='function'?require('./neo_attack_batch_v083'):null);
 const NEO84=(typeof require==='function'?require('./neo_attack_batch_v084'):null);
 const NEO85=(typeof require==='function'?require('./neo_attack_batch_v085'):null);
 const PROMO86=(typeof require==='function'?require('./promo_attack_batch_v086'):null);
 const NEO87=(typeof require==='function'?require('./neo_attack_batch_v087'):null);
 const NEO89=(typeof require==='function'?require('./neo_attack_batch_v089'):null);
 const NEO90=(typeof require==='function'?require('./neo_attack_batch_v090'):null);
 const NEO91=(typeof require==='function'?require('./neo_attack_batch_v091'):null);
 const NEO92=(typeof require==='function'?require('./neo_attack_batch_v092'):null);
 const conditions=new Set(['Poisoned','Asleep','Paralyzed','Confused']);
 const patterns=[
  {kind:'coin-times',re:/^Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.$/i},
  {kind:'coin-failure',re:/^Flip a coin\. If tails, this attack does nothing\.$/i},
  {kind:'coin-bonus',re:/^Flip a coin\. If heads, this attack does (\d+) damage plus (\d+) more damage[;,\.] (?:if|If) tails, this attack does (\d+) damage\.$/i},
  {kind:'status',re:/^The Defending Pokémon is now (Poisoned|Asleep|Paralyzed|Confused)\.$/i},
  {kind:'coin-status',re:/^Flip a coin\. If heads, the Defending Pokémon is now (Poisoned|Asleep|Paralyzed|Confused)\.$/i},
  {kind:'recoil',re:/^([A-Za-z' .-]+) does (\d+) damage to itself\.$/i},
  {kind:'coin-recoil',re:/^Flip a coin\. If tails, ([A-Za-z' .-]+) does (\d+) damage to itself\.$/i},
  // Classic printed attacks with variable damage; all computed at execution.
  {kind:'defender-counters',re:/^Does (\d+) damage plus (\d+) more damage for each damage counter on the Defending Pokémon\.$/i},
  {kind:'own-counters',re:/^Does (\d+) damage plus (\d+) more damage for each damage counter on ([A-Za-z' .-]+)\.$/i},
  {kind:'flail-counters',re:/^Does (\d+) damage times number of damage counters on ([A-Za-z' .-]+)\.$/i},
  {kind:'minus-counters',re:/^Does (\d+) damage minus (\d+) for each damage counter on ([A-Za-z' .-]+)\.$/i},
  {kind:'bench-count',re:/^Does (\d+) damage plus (\d+) more damage for each of your Benched Pokémon\.$/i},
  {kind:'coin-status-split',re:/^Flip a coin\. If heads, the Defending Pokémon is now (Poisoned|Asleep|Paralyzed|Confused); if tails, (?:the Defending Pokémon |it )is now (Poisoned|Asleep|Paralyzed|Confused)\.$/i},
  {kind:'coin-recoil-bonus',re:/^Flip a coin\. If heads, this attack does (\d+) damage plus (\d+) more damage; if tails, this attack does \1 damage and ([A-Za-z' .-]+) does (\d+) damage to itself\.$/i},
  {kind:'ignore-weakness',re:/^Don't apply Weakness and Resistance for this attack\. \(Any other effects that would happen after applying Weakness and Resistance still happen\.\)$/i},
  {kind:'coin-times-short',re:/^Flip (\d+) coins\. This attack does (\d+) damage times number of heads\.$/i},
  {kind:'draw-one',re:/^Draw a card\.$/i},
  // Original printed wording is matched exactly: these attacks are NOT approximated.
  {kind:'bench-own',re:/^Does (\d+) damage to each of your own Benched Pokémon\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)$/i},
  {kind:'bench-both-recoil',re:/^Does (\d+) damage to each Pokémon on each player's Bench\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\) (.+) does (\d+) damage to itself\.$/i},
  {kind:'bench-target',re:/^If your opponent has any Benched Pokémon, choose 1 of them and this attack does (\d+) damage to it\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)$/i},
  {kind:'switch-defender',re:/^If your opponent has any Benched Pokémon, he or she chooses 1 of them and switches it with the Defending Pokémon\. \(Do the damage before switching the Pokémon\.\)$/i},
  {kind:'switch-attacker',re:/^If your opponent has any Benched Pokémon, choose 1 of them and switch it with (?:the Defending Pokémon|his or her Active Pokémon)\.$/i},
  {kind:'switch-self',re:/^Switch (.+) with 1 of your Benched Pokémon\.$/i},
  {kind:'energy-discard',re:/^Discard (\d+) (Fire )?Energy cards? attached to (.+) in order to use this attack\.$/i},
  {kind:'bench-splash-coin',re:/^Flip a coin\. If heads, this attack does (\d+) damage to each of your opponent's Benched Pokémon\. If tails, this attack does (\d+) damage to each of your own Benched Pokémon\. \(Don't apply Weakness and Resistance for Benched Pokémon\.\)$/i}
 ];
 function numericDamage(value){return /^\d*$/.test(value)?Number(value||0):null;}
 function compile(attack){
  if(!attack||typeof attack!=='object')return null;
  // Specific complete card families take priority over broad damage/coin patterns.
  // This prevents a partial broad-pattern match from hiding a valid exact script.
  if(NEO92){const next=NEO92.compile(attack);if(next)return next;}
  if(NEO91){const next=NEO91.compile(attack);if(next)return next;}
  if(NEO90){const next=NEO90.compile(attack);if(next)return next;}
  if(NEO89){const next=NEO89.compile(attack);if(next)return next;}
  if(NEO87){const next=NEO87.compile(attack);if(next)return next;}
  if(PROMO86){const promo=PROMO86.compile(attack);if(promo)return promo;}
  if(NEO85){const nextNeo=NEO85.compile(attack);if(nextNeo)return nextNeo;}
  if(NEO84){const nextNeo=NEO84.compile(attack);if(nextNeo)return nextNeo;}
  if(NEO83){const nextNeo=NEO83.compile(attack);if(nextNeo)return nextNeo;}
  if(NEO82){const nextNeo=NEO82.compile(attack);if(nextNeo)return nextNeo;}
  if(NEO50){const nextNeo=NEO50.compile(attack);if(nextNeo)return nextNeo;}
  if(NEO49){const nextNeo=NEO49.compile(attack);if(nextNeo)return nextNeo;}
  if(NEO48){const nextNeo=NEO48.compile(attack);if(nextNeo)return nextNeo;}
  if(NEO47){const nextNeo=NEO47.compile(attack);if(nextNeo)return nextNeo;}
  if(NEO46){const nextNeo=NEO46.compile(attack);if(nextNeo)return nextNeo;}
  if(NEO40){const nextNeo=NEO40.compile(attack);if(nextNeo)return nextNeo;}
  if(THEME){const theme=THEME.compile(attack);if(theme)return theme;}
  if(NEO){const neo=NEO.compile(attack);if(neo)return neo;}
  if(DISCOVERY){const discovery=DISCOVERY.compile(attack);if(discovery)return discovery;}
  if(FINAL){const final=FINAL.compile(attack);if(final)return final;}
  if(GYM){const gym=GYM.compile(attack);if(gym)return gym;}
  if(CLASSIC){const specific=CLASSIC.compile(attack);if(specific)return specific;}
  const text=String(attack.text||'').trim(),damage=String(attack.damage||'');
  // Neo Revelation Entei #6: the printed two-card discard is an attack
  // cost, not an optional damage bonus. The authoritative reducer already
  // prompts the attacker for the exact Energy cards and commits both atomically.
  if(attack.name==='Searing Flames'&&damage==='60'&&
     text==='Discard 2 Energy cards attached to Entei or this attack does nothing.'&&
     JSON.stringify(attack.cost)===JSON.stringify(['Fire','Fire','Fire']))
   return Object.freeze({kind:'energy-discard',damage:60,quantity:2,onlyType:null,subject:'Entei'});
  // Base Set 2 Poliwrath has an equivalent printing with slightly different
  // Water Gun wording. Keep the exact historical damage semantics.
  if(attack.name==='Water Gun'&&damage==='30+'&&text==="Does 30 damage plus 10 more damage for each Water Energy attached to Poliwrath but not used to pay for this attack's Energy cost. Extra Energy after the 2nd doesn't count."&&JSON.stringify(attack.cost)===JSON.stringify(['Water','Water','Colorless']))
   return Object.freeze({kind:'water-extra',damage:30,factor:10,subject:'Poliwrath',cap:20});
  if(!text&&/^\d+$/.test(damage))return Object.freeze({kind:'flat',damage:Number(damage)});
  for(const {kind,re} of patterns){const m=re.exec(text);if(!m)continue;
   if(['defender-counters','own-counters','flail-counters','minus-counters','bench-count'].includes(kind)){
    const base=Number(m[1]),factor=kind==='flail-counters'?Number(m[1]):Number(m[2]);
    const expected=kind==='flail-counters'?`${base}x`:kind==='minus-counters'?`${base}-`:`${base}+`;
    if(damage!==expected||base>500||factor>200)return null;
    return Object.freeze({kind,base,factor,subject:kind==='flail-counters'?m[2]:['own-counters','minus-counters'].includes(kind)?m[3]:undefined});
   }
   if(kind==='coin-times-short'){
    const flips=Number(m[1]),each=Number(m[2]);
    return flips>=1&&flips<=50&&damage===`${each}x`?Object.freeze({kind:'coin-times',flips,each}):null;
   }
   if(kind==='coin-status-split'){
    const n=numericDamage(damage);
    if(n===null)return null;
    return Object.freeze({kind,damage:n,heads:m[1][0].toUpperCase()+m[1].slice(1).toLowerCase(),tails:m[2][0].toUpperCase()+m[2].slice(1).toLowerCase()});
   }
   if(kind==='coin-recoil-bonus'){
    const base=Number(m[1]),bonus=Number(m[2]),selfDamage=Number(m[4]);
    if(damage!==`${base}+`||base>500||bonus>500||selfDamage>500)return null;
    return Object.freeze({kind,base,bonus,selfDamage,subject:m[3]});
   }
   if(kind==='ignore-weakness'){
    const n=numericDamage(damage);
    return n===null?null:Object.freeze({kind,damage:n});
   }
   if(kind==='coin-times'){
    const flips=Number(m[1]),each=Number(m[2]);
    if(flips>50||flips<1||each>500||damage!==`${each}x`)return null;
    return Object.freeze({kind,flips,each});
   }
   if(kind==='coin-failure'){
    const n=numericDamage(damage);return n===null?null:Object.freeze({kind,damage:n});
   }
   if(kind==='coin-bonus'){
    const base=Number(m[1]),bonus=Number(m[2]),tail=Number(m[3]);
    if(base!==tail||damage!==`${base}+`)return null;
    return Object.freeze({kind,base,bonus});
   }
   if(kind==='status'||kind==='coin-status'){
    const n=numericDamage(damage),status=m[1][0].toUpperCase()+m[1].slice(1).toLowerCase();
    if(n===null||!conditions.has(status))return null;
    return Object.freeze({kind,damage:n,status});
   }
   if(kind==='recoil'||kind==='coin-recoil'){
    const n=numericDamage(damage),selfDamage=Number(m[2]);
    // The attacker's printed name is validated at the call site. A matching
    // string alone is not sufficient to attach someone else's recoil.
    if(n===null||selfDamage<0||selfDamage>1000)return null;
    return Object.freeze({kind,damage:n,selfDamage,subject:m[1]});
   }
   if(kind==='energy-discard'){
    const n=numericDamage(damage),quantity=Number(m[1]),onlyType=m[2]?'Fire':null;
    if(n===null||quantity<1||quantity>6)return null;
    return Object.freeze({kind,damage:n,quantity,onlyType,subject:m[3]});
   }
   if(kind==='bench-own'||kind==='bench-target'){
    const n=numericDamage(damage),benchDamage=Number(m[1]);
    if(n===null||benchDamage>1000)return null;
    return Object.freeze({kind,damage:n,benchDamage});
   }
   if(kind==='bench-both-recoil'){
    const n=numericDamage(damage),benchDamage=Number(m[1]),selfDamage=Number(m[3]);
    if(n===null||benchDamage>1000||selfDamage>1000)return null;
    return Object.freeze({kind,damage:n,benchDamage,selfDamage,subject:m[2]});
   }
   if(kind==='switch-defender'||kind==='switch-attacker'){
    const n=numericDamage(damage);return n===null?null:Object.freeze({kind,damage:n});
   }
   if(kind==='switch-self'){
    const n=numericDamage(damage);return n===null?null:Object.freeze({kind,damage:n,subject:m[1]});
   }
   if(kind==='bench-splash-coin'){
    const n=numericDamage(damage),heads=Number(m[1]),tails=Number(m[2]);
    return n===null||heads>1000||tails>1000?null:Object.freeze({kind,damage:n,heads,tails});
   }
   if(kind==='draw-one'){
    if(damage!=='')return null;
    return Object.freeze({kind,damage:0,draw:1});
   }
  }
  return CLASSIC?CLASSIC.compile(attack):null;
 }
 function resolve(program,flip,context={}){
  if(!program||typeof flip!=='function')throw Error('Attack program and flip function required');
  switch(program.kind){
   case 'flat':return {damage:program.damage,flips:[]};
   case 'defender-counters':return {damage:program.base+program.factor*(context.defenderCounters||0),flips:[]};
   case 'own-counters':return {damage:program.base+program.factor*(context.selfCounters||0),flips:[]};
   case 'flail-counters':return {damage:program.base*(context.selfCounters||0),flips:[]};
   case 'minus-counters':return {damage:Math.max(0,program.base-program.factor*(context.selfCounters||0)),flips:[]};
   case 'bench-count':return {damage:program.base+program.factor*(context.benchCount||0),flips:[]};
   case 'ignore-weakness':return {damage:program.damage,ignoreWR:true,flips:[]};
   case 'coin-status-split':{
    const heads=Boolean(flip());return {damage:program.damage,status:heads?program.heads:program.tails,flips:[heads]};
   }
   case 'coin-recoil-bonus':{
    const heads=Boolean(flip());return {damage:program.base+(heads?program.bonus:0),selfDamage:heads?0:program.selfDamage,flips:[heads]};
   }
   case 'coin-times':{
    const flips=Array.from({length:program.flips},()=>Boolean(flip()));
    return {damage:flips.filter(Boolean).length*program.each,flips};
   }
   case 'coin-failure':{
    const heads=Boolean(flip());return {damage:heads?program.damage:0,flips:[heads]};
   }
   case 'coin-bonus':{
    const heads=Boolean(flip());return {damage:program.base+(heads?program.bonus:0),flips:[heads]};
   }
   case 'status':return {damage:program.damage,flips:[],status:program.status};
   case 'coin-status':{
    const heads=Boolean(flip());return {damage:program.damage,flips:[heads],status:heads?program.status:null};
   }
   case 'recoil':return {damage:program.damage,selfDamage:program.selfDamage,flips:[]};
   case 'coin-recoil':{
    const heads=Boolean(flip());return {damage:program.damage,selfDamage:heads?0:program.selfDamage,flips:[heads]};
   }
   case 'energy-discard':return {damage:program.damage,discardEnergy:program.quantity,onlyType:program.onlyType,flips:[]};
   case 'bench-own':return {damage:program.damage,benchSide:'self',benchDamage:program.benchDamage,flips:[]};
   case 'bench-target':return {damage:program.damage,benchSide:'target',benchDamage:program.energyBenchMultiplier!==undefined?Math.max(0,context.selfEnergy||0)*program.energyBenchMultiplier:program.benchDamage,flips:[]};
   case 'bench-both-recoil':return {damage:program.damage,benchSide:'both',benchDamage:program.benchDamage,selfDamage:program.selfDamage,flips:[]};
   case 'bench-splash-coin':{
    const heads=Boolean(flip());return {damage:program.damage,benchSide:heads?'opponent':'self',benchDamage:heads?program.heads:program.tails,flips:[heads]};
   }
   case 'switch-defender':case 'switch-attacker':case 'switch-self':return {damage:program.damage,forceSwitch:program.kind,flips:[]};
   case 'draw-one':return {damage:0,draw:1,flips:[]};
   case 'target-any':if(program.energyMultiplier!==undefined)return {damage:0,targetDamage:Math.min(program.energyCap,Math.max(0,context.selfEnergy||0)*program.energyMultiplier),flips:[]};return CLASSIC.resolve(program,flip,context);
   default:if(NEO92&&program.kind.startsWith('neo92:'))return NEO92.resolve(program,flip,context);if(NEO91&&program.kind.startsWith('neo91:'))return NEO91.resolve(program,flip,context);if(NEO90&&program.kind.startsWith('neo90:'))return NEO90.resolve(program,flip,context);if(NEO89&&program.kind.startsWith('neo89:'))return NEO89.resolve(program,flip,context);if(NEO87&&program.kind.startsWith('neo87:'))return NEO87.resolve(program,flip,context);if(PROMO86&&program.kind.startsWith('promo86:'))return PROMO86.resolve(program,flip,context);if(NEO85&&program.kind.startsWith('neo85:'))return NEO85.resolve(program,flip,context);if(NEO84&&program.kind.startsWith('neo84:'))return NEO84.resolve(program,flip,context);if(NEO83&&program.kind.startsWith('neo83:'))return NEO83.resolve(program,flip,context);if(NEO82&&program.kind.startsWith('neo82:'))return NEO82.resolve(program,flip,context);if(NEO50&&program.kind.startsWith('neo50:'))return NEO50.resolve(program,flip,context);if(NEO49&&program.kind.startsWith('neo49:'))return NEO49.resolve(program,flip,context);if(NEO48&&program.kind.startsWith('neo48:'))return NEO48.resolve(program,flip,context);if(NEO47&&program.kind.startsWith('neo47:'))return NEO47.resolve(program,flip,context);if(NEO46&&program.kind.startsWith('neo46:'))return NEO46.resolve(program,flip,context);if(NEO40&&program.kind.startsWith('neo40:'))return NEO40.resolve(program,flip,context);if(THEME&&program.kind.startsWith('theme:'))return THEME.resolve(program,flip,context);if(DISCOVERY&&program.kind.startsWith('discovery:'))return DISCOVERY.resolve(program,flip,context);if(NEO&&program.kind.startsWith('neo:'))return NEO.resolve(program,flip,context);if(GYM&&program.kind.startsWith('gym:'))return GYM.resolve(program,flip,context);if(FINAL&&FINAL.manifest.some(x=>x.kind===program.kind))return FINAL.resolve(program,flip,context);if(CLASSIC)return CLASSIC.resolve(program,flip,context);throw Error('Unsupported attack program');
  }
 }
 return Object.freeze({compile,resolve});
});
