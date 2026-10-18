'use strict';
// Neo Revelation/Destiny exact-printing actions. No generic name-based
// overrides: all text, printed damage and Energy cost must match.
const cards=[...require('./cards/neo3.json'),...require('./cards/neo4.json')];
const defs=Object.freeze({
 'neo3-42|Negative Ion':'negative-ion',
 'neo4-15|Sweet Kiss':'sweet-kiss',
 'neo4-34|Stun Wave':'stun-wave',
 'neo4-56|Charm':'charm'
});
const programs=new Map();
for(const [key,effect] of Object.entries(defs)){
 const [id,name]=key.split('|');
 const attack=cards.find(c=>c.id===id)?.attacks?.find(a=>a.name===name);
 if(!attack)throw Error('Missing Neo v091 printing '+key);
 const signature=JSON.stringify([attack.name,attack.damage||'',attack.text||'',attack.cost||[]]);
 if(programs.has(signature))throw Error('Duplicate Neo v091 printed attack '+key);
 programs.set(signature,Object.freeze({kind:'neo91:'+effect,damage:Number.parseInt(attack.damage,10)||0}));
}
function compile(a){return programs.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'',a?.cost||[]]))||null;}
function resolve(program,flip,ctx={}){
 if(!program?.kind?.startsWith('neo91:'))throw Error('Not a Neo v091 program');
 const result={damage:program.damage,flips:[]};
 switch(program.kind){
  case 'neo91:negative-ion':result.neo91Ion=true;break;
  case 'neo91:charm':result.neo91Charm=true;break;
  case 'neo91:stun-wave':result.neo91PowerSilence=true;break;
  case 'neo91:sweet-kiss':if(ctx.opponentOptDraw)result.neo91OpponentDraw=true;break;
  default:throw Error('Unknown Neo v091 attack');
 }
 return result;
}
module.exports={defs,compile,resolve};
