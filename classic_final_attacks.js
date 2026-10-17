'use strict';
// Exact printed texts for the previously unsupported Base/Jungle/Fossil/Rocket attacks.
// This is an allowlist, not a fallback heuristic. Historical semantics are
// implemented by headless_duel, including pending decisions and response timing.
const manifest=require('./classic_final_manifest.json');
const table=new Map();
for(const record of manifest){
 const key=JSON.stringify([record.attackName,record.damage,record.text,record.cost]);
 table.set(key, Object.freeze({kind:record.kind,damage:Number(record.damage)||0,source:record.cardId}));
}
function compile(a){return table.get(JSON.stringify([a?.name,String(a?.damage||''),String(a?.text||''),a?.cost||[]]))||null;}
function resolve(p,flip,ctx){
 const result={damage:p.damage,flips:[]};
 const toss=()=>{const h=Boolean(flip());result.flips.push(h);return h;};
 switch(p.kind){
  case 'copy-attack': case 'mirror-move': case 'amnesia': case 'destiny-bond': case 'barrier': case 'prophecy':
  case 'scavenge': case 'stare': case 'magnetic-lines': case 'energy-bomb': case 'third-eye':
  case 'fascinate': case 'flame-pillar': case 'mirror-shell': return result;
  case 'ram':return {...result,selfDamage:20,forceSwitch:'switch-defender'};
  case 'continuous-fireball':{
   const count=ctx.selfEnergy,heads=[];
   for(let i=0;i<count;i++)if(toss())heads.push(i);
   return {...result,damage:heads.length*50,discardHeadCount:heads.length};
  }
  case 'fireball':{const heads=toss();return {...result,damage:heads?70:0,discardHeadCount:heads?1:0};}
  case 'playing-with-fire':{const heads=toss();return {...result,damage:heads?50:30,discardHeadCount:heads?1:0};}
  default:throw Error('Unknown Classic finale effect '+p.kind);
 }
}
module.exports={compile,resolve,manifest};
