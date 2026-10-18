'use strict';
// Neo Revelation/Destiny historical attack effects. Compile ONLY exact text,
// damage and attack-name signatures from the local card archive.
const cards=[...require('./cards/neo3.json'),...require('./cards/neo4.json')];
const defs=Object.freeze({
 'neo3-18|Rainbow Burn':'rainbow-burn',
 'neo3-28|Tail Shock':'tail-shock',
 'neo3-46|Flock Attack':'flock-attack',
 'neo4-33|MAX Burst':'max-burst',
 'neo4-37|Water Cannon':'water-cannon',
 'neo4-40|Slap Awake':'slap-awake',
 'neo4-47|Core Blast':'core-blast',
 'neo4-48|Pulse Guard':'pulse-guard',
 'neo4-52|Hypno Shower':'hypno-shower',
 'neo4-53|Synchronize':'synchronize',
 'neo4-62|Ink Blast':'ink-blast'
});
const programs=new Map();
for(const [key,effect] of Object.entries(defs)){
 const [id,name]=key.split('|'),card=cards.find(x=>x.id===id),attack=card?.attacks?.find(a=>a.name===name);
 if(!attack)throw Error('Missing Neo printing '+key);
 const signature=JSON.stringify([attack.name,attack.damage||'',attack.text||'']);
 const program=Object.freeze(effect==='water-cannon'
  ?{kind:'target-any',damage:0,targetDamage:0,energyMultiplier:10,energyCap:30}
  :{kind:'neo85:'+effect,damage:Number.parseInt(attack.damage,10)||0});
 const existing=programs.get(signature);
 if(existing&&JSON.stringify(existing)!==JSON.stringify(program))throw Error('Neo v085 conflicting historical signature '+key);
 programs.set(signature,program);
}
function compile(attack){return programs.get(JSON.stringify([attack?.name,attack?.damage||'',attack?.text||'']))||null;}
function resolve(program,flip,ctx={}){
 if(!program?.kind?.startsWith('neo85:'))throw Error('Unknown Neo v085 effect');
 const kind=program.kind.slice(6),r={damage:program.damage,flips:[]};
 const coin=()=>{const heads=Boolean(flip());r.flips.push(heads);return heads;};
 switch(kind){
  case 'rainbow-burn':r.damage=30+10*(ctx.selfBasicTypes||0);break;
  case 'tail-shock':if(coin()){r.benchSide='opponent';r.benchDamage=10;}break;
  case 'flock-attack':{
   const n=ctx.murkrowBench||0;
   if(!Number.isInteger(n)||n<0||n>5)throw Error('Invalid Murkrow Bench count');
   r.damage=10;for(let i=0;i<n;i++)if(coin())r.damage+=10;break;
  }
  case 'max-burst':{
   const n=ctx.opponentAllEnergy||0;
   if(!Number.isInteger(n)||n<0||n>60)throw Error('Invalid MAX Burst Energy count');
   r.damage=0;for(let i=0;i<n;i++)if(coin())r.damage+=20;break;
  }
  case 'slap-awake':if(['Asleep','Confused'].includes(ctx.defenderStatus))r.damage=40;
    r.clearDefenderSleepConfuse=true;break;
  case 'core-blast':r.damage=30+20*(ctx.enemySpecialEnergy||0);break;
  case 'pulse-guard':r.shield={minimumDamage:30};break;
  case 'hypno-shower':r.status='Asleep';r.healBothBenches=10;break;
  case 'synchronize':if((ctx.selfEnergy||0)!==(ctx.enemyEnergy||0))r.damage=0;break;
  case 'ink-blast':r.damage=20+Math.min(20,10*(typeof ctx.extraEnergies==='function'?ctx.extraEnergies(null):0));break;
  default:throw Error('Unported Neo v085 effect '+kind);
 }
 return r;
}
module.exports={defs,compile,resolve};