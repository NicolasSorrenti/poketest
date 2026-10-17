'use strict';
// Exact Neo Discovery theme-deck attack signatures. Unsupported multi-stage
// choices remain explicitly uncompiled, never approximated to generic damage.
const cards=require('./cards/neo2.json');
const signatures=new Map();
const effects={
 'neo2-1|Psychic':'psychic-energy',
 'neo2-43|Squeeze':'squeeze',
 'neo2-43|Spike Barrage':'spike-barrage',
 'neo2-65|Nap Time':'nap-time',
 'neo2-3|Detect':'detect',
 'neo2-3|Triple Kick':'triple-kick',
 'neo2-46|Fury Cutter':'fury-cutter',
 'neo2-45|Dust Devil':'dust-devil',
 'neo2-19|Hyper Reverse':'hyper-reverse',
 'neo2-52|Energy Cycle':'energy-cycle',
 'neo2-42|Hatch':'hatch',
 'neo2-19|Magic Dust':'magic-dust',
 'neo2-63|Scout':'scout'
};
for(const c of cards)for(const a of c.attacks||[]){
 const kind=effects[`${c.id}|${a.name}`];
 if(kind)signatures.set(JSON.stringify([a.name,a.damage||'',a.text||'']),Object.freeze({kind:`discovery:${kind}`,damage:Number.parseInt(a.damage,10)||0,subject:c.name}));
}
const compile=a=>signatures.get(JSON.stringify([a.name,a.damage||'',a.text||'']))||null;
function resolve(p,flip,ctx={}){
 const roll=()=>Boolean(flip()),base={damage:p.damage,flips:[]};
 switch(p.kind){
  case 'discovery:psychic-energy':return {...base,damage:30+10*(ctx.enemyEnergy||0)};
  case 'discovery:squeeze':{const heads=roll();return {...base,damage:heads?30:10,status:heads?'Paralyzed':null,flips:[heads]};}
  case 'discovery:spike-barrage':{const flips=Array.from({length:ctx.selfEnergy||0},roll);return {...base,damage:20+20*flips.filter(Boolean).length,flips};}
  case 'discovery:nap-time':return {...base,healAllSelf:true,selfStatus:'Asleep'};
  case 'discovery:detect':{const heads=roll();return {...base,shield:heads?{allEffects:true}:null,flips:[heads]};}
  case 'discovery:triple-kick':{const flips=Array.from({length:3},roll);return {...base,damage:30*flips.filter(Boolean).length,flips};}
  case 'discovery:fury-cutter':{const flips=Array.from({length:4},roll),heads=flips.filter(Boolean).length;return {...base,damage:10+(heads?10*2**(heads-1):0),flips};}
  case 'discovery:dust-devil':return {...base,damage:0,spreadExcludeType:'Fighting',spreadAmount:10};
  case 'discovery:hyper-reverse':return {...base,damage:10*(ctx.enemyEnergy||0),healFromDamage:'all'};
  case 'discovery:energy-cycle':{const heads=roll();return {...base,energyCycle:heads,flips:[heads]};}
  case 'discovery:hatch':{const heads=roll();return {...base,hatch:heads,flips:[heads]};}
  case 'discovery:magic-dust':{const heads=roll();return {...base,magicDust:heads,flips:[heads]};}
  case 'discovery:scout':return {...base,peekOpponentHand:true};
  default:throw Error('Unsupported Neo Discovery program '+p.kind);
 }
}
module.exports={compile,resolve,signatures};
