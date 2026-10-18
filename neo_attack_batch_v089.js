'use strict';
// Portable, exact-text Neo Revelation/Destiny effects involving one player
// choice. Never compile just by attack name: printings can reuse names.
const cards=[...require('./cards/neo3.json'),...require('./cards/neo4.json')];
const defs=Object.freeze({
 'neo3-10|Plasma':'plasma',
 'neo3-20|Aerowing':'aerowing',
 'neo3-21|Lightning Strike':'lightning-strike',
 'neo4-26|Knock Over':'knock-over'
});
const lookup=new Map();
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|');
 const attack=cards.find(x=>x.id===id)?.attacks?.find(a=>a.name===name);
 if(!attack)throw Error('Missing Neo v089 historical attack '+key);
 const sig=JSON.stringify([attack.name,attack.damage||'',attack.text||'',attack.cost||[]]);
 const prog=Object.freeze({kind:'neo89:'+kind,damage:Number.parseInt(attack.damage,10)||0});
 if(lookup.has(sig))throw Error('Duplicate v089 printing '+key);
 lookup.set(sig,prog);
}
const compile=a=>lookup.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'',a?.cost||[]]))||null;
function resolve(program,flip,ctx={}){
 if(!program?.kind?.startsWith('neo89:'))throw Error('Unknown v089 program');
 const result={damage:program.damage,flips:[]};
 const kind=program.kind.slice('neo89:'.length);
 switch(kind){
  case 'aerowing':
   if(ctx.optionalBoost){const heads=Boolean(flip());result.flips.push(heads);result.damage=heads?80:0;}
   break;
  case 'lightning-strike':
   if(ctx.optionalBoost){result.damage=80;result.discardAllSelfEnergy=true;}
   break;
  case 'knock-over':
   if(ctx.optionalBoost)result.discardStadium=true;
   break;
  case 'plasma':
   if(ctx.discardEnergyIndex!==undefined)result.recoverAttachedEnergyIndex=ctx.discardEnergyIndex;
   break;
  default:throw Error('Unhandled v089 attack '+kind);
 }
 return result;
}
module.exports={defs,compile,resolve};
