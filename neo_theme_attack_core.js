'use strict';
// Executable subset of the exact English Neo Genesis theme-deck printing.
// Compiles only exact signatures, not look-alike moves from later sets.
const cards=require('./cards/neo1.json');
const kinds={
 'neo1-81|Leer':'coin-attack-lock',
 'neo1-56|Leer':'coin-attack-lock',
 'neo1-33|Swift':'swift',
 'neo1-56|Swift':'swift',
 'neo1-7|Leech Seed':'leech-seed',
 'neo1-68|Hide':'coin-shield',
 'neo1-27|Spider Web':'coin-no-retreat',
 'neo1-75|Scary Face':'scary-face',
 'neo1-32|Sweep Away':'mill-three',
 'neo1-23|Sputter':'sputter',
 'neo1-62|Fin Slap':'fin-slap',
 'neo1-27|Poison Bite':'poison-bite',
 'neo1-31|Screech':'screech',
 'neo1-31|Jaw Clamp':'jaw-clamp',
 'neo1-48|Mud Splash':'mud-splash',
 'neo1-8|Dragon Tornado':'dragon-tornado',
 'neo1-57|Fireworks':'fireworks',
 'neo1-47|Char':'char'
};
const signatures=new Map();
for(const c of cards)for(const a of c.attacks||[]){const kind=kinds[`${c.id}|${a.name}`];if(kind)signatures.set(JSON.stringify([a.name,a.damage||'',a.text||'']),Object.freeze({kind:`neo:${kind}`,damage:Number.parseInt(a.damage,10)||0,subject:c.name}));}
const compile=a=>signatures.get(JSON.stringify([a.name,a.damage||'',a.text||'']))||null;
function resolve(p,flip,ctx={}){
 const roll=()=>Boolean(flip()),base={damage:p.damage,flips:[]};
 switch(p.kind){
  case 'neo:coin-attack-lock':{const heads=roll();return {...base,attackLock:heads,flips:[heads]};}
  case 'neo:swift':return {...base,ignoreWR:true,ignoreDefendingEffects:true};
  case 'neo:leech-seed':return {...base,healFromDamage:'seed'};
  case 'neo:coin-shield':{const heads=roll();return {...base,shield:heads?{allEffects:true}:null,flips:[heads]};}
  case 'neo:coin-no-retreat':{const heads=roll();return {...base,noRetreat:heads,flips:[heads]};}
  case 'neo:scary-face':{const heads=roll();return {...base,noRetreat:heads,attackLock:heads,flips:[heads]};}
  case 'neo:mill-three':return {...base,millSelf:3};
  case 'neo:sputter':return {...base,blankPowers:true};
  case 'neo:fin-slap':return {...base,damage:p.damage+(ctx.damagedPreviousTurn?10:0)};
  case 'neo:poison-bite':return {...base,poisonIfDamaged:true,healFromDamage:'half'};
  case 'neo:screech':return {...base,screech:true};
  case 'neo:jaw-clamp':return {...base,jawClamp:true};
  case 'neo:mud-splash':{const heads=roll();return {...base,benchSide:ctx.enemyBenchCount?'target':null,benchDamage:heads?10:0,flips:[heads]};}
  case 'neo:dragon-tornado':return {...base,dragonTornado:true};
  case 'neo:fireworks':{const heads=roll();return {...base,discardSelfEnergyOnTails:!heads,flips:[heads]};}
  case 'neo:char':{const heads=roll();return {...base,charCounter:heads,flips:[heads]};}
  default:throw Error('Unsupported Neo program '+p.kind);
 }
}
module.exports={compile,resolve,signatures};
