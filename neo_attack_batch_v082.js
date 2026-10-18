'use strict';
// Exact-signature Neo Revelation / Neo Destiny programs using the shared
// authoritative reducer's already-tested resolution primitives.
// Do not infer support from an attack name or a loose text regex.
const archive=[...require('./cards/neo3.json'),...require('./cards/neo4.json')];
const defs=Object.freeze({
 'neo3-30|Rock Tumble':'rock-tumble',
 'neo3-31|Strange Dance':'strange-dance',
 'neo3-36|Nap':'nap',
 'neo3-36|High-Speed Charge':'high-speed-charge',
 'neo3-37|Horn Swipe':'horn-swipe',
 'neo3-49|Needle Storm':'needle-storm',
 'neo3-53|Magma Ring':'magma-ring',
 'neo3-55|Raging Headbutt':'raging-headbutt',
 'neo4-20|Mind Shock':'mind-shock',
 'neo4-31|Egg Toss':'egg-toss',
 'neo4-38|Rock Tackle':'rock-tackle',
 'neo4-40|Dark Song':'dark-song',
 'neo4-43|Corner':'corner',
 'neo4-51|Slash About':'slash-about'
});
const signatures=new Map();
for(const [key,effect] of Object.entries(defs)){
 const [id,name]=key.split('|');
 const card=archive.find(c=>c.id===id);
 const attack=card?.attacks?.find(a=>a.name===name);
 if(!attack)throw Error('Missing historical Neo attack '+key);
 const signature=JSON.stringify([attack.name,attack.damage||'',attack.text||'']);
 const program=Object.freeze({kind:'neo82:'+effect,damage:Number.parseInt(attack.damage,10)||0});
 const prior=signatures.get(signature);
 if(prior&&prior.kind!==program.kind)throw Error('Conflicting Neo historical text '+key);
 signatures.set(signature,program);
}
function compile(attack){
 return signatures.get(JSON.stringify([attack?.name,attack?.damage||'',attack?.text||'']))||null;
}
function resolve(program,flip,ctx={}){
 if(!program?.kind?.startsWith('neo82:'))throw Error('Invalid Neo attack program');
 const kind=program.kind.slice(6);
 const result={damage:program.damage,flips:[]};
 const coin=()=>{const heads=Boolean(flip());result.flips.push(heads);return heads;};
 switch(kind){
  case 'rock-tumble':result.ignoreResistance=true;break;
  case 'mind-shock':result.ignoreWR=true;break;
  case 'nap':result.healSelf=30;break;
  case 'high-speed-charge':result.selfDamage=30;result.disableThisAttack=true;break;
  case 'rock-tackle':result.selfDamage=10;result.disableThisAttack=true;break;
  case 'magma-ring':case 'corner':result.noRetreat=true;break;
  case 'dark-song':result.status=coin()?'Asleep':'Confused';break;
  case 'needle-storm':{
   let heads=0;
   // Bounded RNG loop: protects the server without interpreting a very long
   // run of heads as a tails result.
   while(heads<1000){if(!coin())break;heads++;}
   if(heads===1000)throw Error('Needle Storm coin limit exceeded');
   result.damage=20*heads;break;
  }
  case 'egg-toss':result.damage=coin()&&coin()?80:0;
   // The second coin is mandatory even when the first is tails.
   if(result.flips.length===1)coin();
   break;
  case 'horn-swipe':result.damage=coin()&&coin()?60:20;
   if(result.flips.length===1)coin();
   break;
  case 'strange-dance':if(coin()){result.damage=40;result.status='Confused';}break;
  case 'raging-headbutt':if(coin())result.damage=10+10*(ctx.selfCounters||0);break;
  case 'slash-about':if((ctx.enemyEnergy||0)>(ctx.selfEnergy||0))result.damage=40;break;
  default:throw Error('Unported Neo attack '+kind);
 }
 return result;
}
module.exports={defs,compile,resolve};