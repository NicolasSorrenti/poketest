'use strict';
// Exact printed Neo Revelation / Neo Destiny attack implementations. No
// fallback by attack name alone: the text, damage and cost all must match.
const cards=[...require('./cards/neo3.json'),...require('./cards/neo4.json')];
const defs=Object.freeze({
 'neo3-22|Lightning Spark':'lightning-spark',
 'neo3-27|Crystal Wave':'crystal-wave',
 'neo3-50|Sharpshooting':'sharpshooting',
 'neo4-111|Thundersquall':'thundersquall'
});
const scripts=new Map();
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),printed=cards.find(c=>c.id===id)?.attacks?.find(a=>a.name===name);
 if(!printed)throw Error('Missing Neo v090 printing '+key);
 const signature=JSON.stringify([printed.name,printed.damage||'',printed.text||'',printed.cost||[]]);
 const script=Object.freeze(kind==='thundersquall'
  ?{kind:'bench-target',damage:40,benchDamage:0,energyBenchMultiplier:10}
  :{kind:'neo90:'+kind,damage:Number.parseInt(printed.damage,10)||0});
 if(scripts.has(signature)&&JSON.stringify(scripts.get(signature))!==JSON.stringify(script))throw Error('Conflicting Neo printing '+key);
 scripts.set(signature,script);
}
function compile(a){return scripts.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'',a?.cost||[]]))||null;}
function resolve(program,flip,context={}){
 if(!program?.kind?.startsWith('neo90:'))throw Error('Invalid Neo v090 attack script');
 const result={damage:program.damage,flips:[]};
 const toss=()=>{const heads=Boolean(flip());result.flips.push(heads);return heads;};
 switch(program.kind){
  case 'neo90:crystal-wave':
   if(toss())result.damage=40;
   else if(context.enemyBench>0)result.forceSwitch='switch-defender';
   break;
  case 'neo90:lightning-spark':
   if(context.enemyBench>0&&toss()){result.neo90Target='bench';result.benchSide='target';result.benchDamage=20;}
   break;
  case 'neo90:sharpshooting':
   result.damage=0;
   if(toss())result.neo90Target='any';
   break;
  default:throw Error('Unknown Neo v090 attack '+program.kind);
 }
 return result;
}
module.exports={defs,compile,resolve};
