'use strict';
// Neo attack batch: exact printed source signatures, no silent name matching.
// Reuse reducer primitives only where their historical semantics already match.
const archive=[...require('./cards/neo3.json'),...require('./cards/neo4.json')];
const defs=Object.freeze({
 'neo3-24|Quick Attack':'quick-attack',
 'neo3-29|Screech':'screech',
 'neo3-29|Poison Bite':'poison-bite',
 'neo3-37|Rising Lunge':'rising-lunge',
 'neo3-51|Toxic Saliva':'toxic-saliva',
 'neo4-22|Healing Light':'healing-light',
 'neo4-22|Protective Wave':'protective-wave',
 'neo4-23|Spark':'spark',
 'neo4-34|High Voltage':'high-voltage',
 'neo4-48|Thunder Needle':'thunder-needle',
 'neo4-50|Fire Blast':'fire-blast'
});
const signatures=new Map();
for(const [key,effect] of Object.entries(defs)){
 const [id,name]=key.split('|');
 const attack=archive.find(c=>c.id===id)?.attacks?.find(a=>a.name===name);
 if(!attack)throw Error('Missing Neo printing '+key);
 const signature=JSON.stringify([attack.name,attack.damage||'',attack.text||'']);
 const program=Object.freeze(effect==='spark'
  ?{kind:'bench-target',damage:30,benchDamage:10}
  :effect==='fire-blast'
  ?{kind:'energy-discard',damage:50,quantity:1,subject:'Light Ninetales',onlyType:'Fire'}
  :{kind:'neo83:'+effect,damage:Number.parseInt(attack.damage,10)||0});
 const before=signatures.get(signature);
 if(before&&JSON.stringify(before)!==JSON.stringify(program))throw Error('Conflicting Neo printing '+key);
 signatures.set(signature,program);
}
const compile=a=>signatures.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'']))||null;
function resolve(program,flip){
 if(!program?.kind?.startsWith('neo83:'))throw Error('Wrong Neo v0.83 program');
 const effect=program.kind.slice(6),r={damage:program.damage,flips:[]};
 const coin=()=>{const x=Boolean(flip());r.flips.push(x);return x;};
 switch(effect){
  case 'quick-attack':if(coin())r.damage+=20;break;
  case 'screech':r.screech=true;break;
  case 'poison-bite':r.status='Poisoned';r.healFromDamage='half';break;
  case 'rising-lunge':if(coin())r.damage+=10;break;
  case 'toxic-saliva':if(coin()){r.status='Poisoned';r.poisonDamage=20;}break;
  case 'healing-light':r.healOwnTeam=10;break;
  case 'protective-wave':if(coin())r.shield={allEffects:true};break;
  case 'high-voltage':if(coin())r.lockTrainers=true;break;
  case 'thunder-needle':{
   let heads=0;for(let i=0;i<3;i++)if(coin())heads++;
   r.damage=heads*20;if(heads>=2)r.status='Paralyzed';break;
  }
  default:throw Error('Unported Neo v0.83 effect '+effect);
 }
 return r;
}
module.exports={defs,compile,resolve};