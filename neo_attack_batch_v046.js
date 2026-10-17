'use strict';
// Neo Genesis / Discovery: only uniquely matched printed attacks, never
// name-only fallback or generic flat damage for unported card text.
const cards=[...require('./cards/neo1.json'),...require('./cards/neo2.json')];
const definitions={
 'neo1-13|Steel Wing': 'steel-wing',
 'neo1-20|Eeeeeeek': 'eeeeeeek',
 'neo1-53|Deflector': 'deflector',
 'neo1-74|Roar': 'roar',
 'neo2-37|Recover': 'recover-discard',
 'neo2-37|Spike Cannon': 'spike-cannon',
 'neo2-39|Plunder': 'plunder',
 'neo2-70|Spike Stab': 'spike-stab'
};
const programs=new Map();
for(const [key,type] of Object.entries(definitions)){
 const [id,name]=key.split('|'),c=cards.find(x=>x.id===id),a=c?.attacks?.find(x=>x.name===name);
 if(!a)throw Error('Missing exact Neo attack '+key);
 const signature=JSON.stringify([a.name,a.damage||'',a.text||'']);
 // Recover uses the already-tested Classic interactive discard-one-Energy
 // payment and recover-healing code path. No special case is needed.
 const p=type==='recover-discard'?{kind:'recover-discard',damage:0,subject:'Corsola'}:{kind:'neo46:'+type,damage:Number.parseInt(a.damage,10)||0};
 if(programs.has(signature)&&JSON.stringify(programs.get(signature))!==JSON.stringify(p))throw Error('Conflicting attack signature '+key);
 programs.set(signature,Object.freeze(p));
}
const compile=a=>programs.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'']))||null;
function resolve(p,flip){
 if(!p?.kind?.startsWith('neo46:'))throw Error('Not a Neo v0.46 attack');
 const out={damage:p.damage,flips:[]};
 const coin=()=>{const heads=Boolean(flip());out.flips.push(heads);return heads;};
 switch(p.kind.slice(6)){
  case 'steel-wing':if(coin())out.shield={reduce:20};break;
  case 'eeeeeeek':out.shuffleHandDraw=7;break;
  case 'deflector':out.shield={half:true};break;
  case 'roar':if(coin())out.forceSwitch='switch-defender';break;
  case 'spike-cannon':out.damage=30*(Number(coin())+Number(coin()));break;
  case 'plunder':out.discardDefenderTrainers=true;break;
  case 'spike-stab':if(coin())out.status='Poisoned';else out.damage=0;break;
  default:throw Error('Unhandled Neo attack '+p.kind);
 }
 return out;
}
module.exports={compile,resolve,programs,definitions};
