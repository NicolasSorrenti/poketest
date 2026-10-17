'use strict';
// Exact imported signatures: all three attacks in the Neo Genesis Mareep line.
// The imported card text loses the Lightning icon in two descriptions; use
// original printed Lightning Energy semantics, not generic Energy.
const printed=require('./cards/neo1.json');
const definitions=Object.freeze({
 'neo1-65|Static Electricity':'static-electricity',
 'neo1-34|Discharge':'discharge',
 'neo1-34|Electric Current':'electric-current'
});
const programs=new Map();
for(const [key,effect] of Object.entries(definitions)){
 const [id,name]=key.split('|'),a=printed.find(c=>c.id===id)?.attacks?.find(a=>a.name===name);
 if(!a)throw Error('Missing Neo v0.47 printed attack '+key);
 const signature=JSON.stringify([a.name,a.damage||'',a.text||'']);
 const program=Object.freeze({kind:'neo47:'+effect,damage:Number.parseInt(a.damage,10)||0});
 if(programs.has(signature))throw Error('Duplicate attack signature '+key);
 programs.set(signature,program);
}
const compile=a=>programs.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'']))||null;
function resolve(program,flip,context={}){
 const kind=program?.kind;
 if(!kind?.startsWith('neo47:'))throw Error('Unknown Neo v0.47 attack');
 const out={damage:program.damage,flips:[]};
 switch(kind.slice(6)){
  case 'static-electricity':out.damage=0;out.neo47Static=true;break;
  case 'discharge':{
   const n=context.selfLightning??0;
   if(!Number.isInteger(n)||n<0)throw Error('Invalid attached Lightning Energy count');
   out.flips=Array.from({length:n},()=>Boolean(flip()));
   out.damage=out.flips.filter(Boolean).length*30;
   out.neo47DiscardLightning=true;
   break;
  }
  case 'electric-current':out.neo47MoveLightning=true;break;
  default:throw Error('Missing Neo v0.47 resolver '+kind);
 }
 return out;
}
module.exports={definitions,programs,compile,resolve};
