'use strict';
// Exact Neo Revelation and Neo Destiny prints: typed portable effect programs.
// Fails closed on importer text changes instead of applying approximated damage.
const archive=[...require('./cards/neo3.json'),...require('./cards/neo4.json')];
const defs=Object.freeze({
 'neo3-14|Aurora Wave':'aurora-wave',
 'neo3-16|Psychic Leaf':'psychic-leaf',
 'neo3-34|Octazooka':'octazooka',
 'neo3-42|Positive Ion':'positive-ion',
 'neo3-43|Leek Jab':'leek-jab',
 'neo3-65|Outrage':'outrage',
 'neo4-32|Clamping Jaw':'clamping-jaw',
 'neo4-35|Explosion':'explosion',
 'neo4-44|Expand':'expand',
 'neo4-56|Spike Ball Tackle':'spike-ball-tackle',
 'neo4-63|Shed':'shed',
 'neo4-70|Leer':'leer',
 'neo4-74|Giant Wave':'giant-wave',
 'neo4-79|Migraine':'migraine'
});
const signatures=new Map();
for(const [key,effect] of Object.entries(defs)){
 const [id,name]=key.split('|'),c=archive.find(x=>x.id===id),a=c?.attacks?.find(x=>x.name===name);
 if(!a)throw Error('Missing Neo v084 attack '+key);
 const signature=JSON.stringify([a.name,a.damage||'',a.text||'']);
 const program=Object.freeze({kind:'neo84:'+effect,damage:Number.parseInt(a.damage,10)||0});
 const prior=signatures.get(signature);
 if(prior&&prior.kind!==program.kind)throw Error('Neo v084 conflicting text '+key);
 signatures.set(signature,program);
}
const compile=a=>signatures.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'']))||null;
function resolve(program,flip,ctx={}){
 if(!program?.kind?.startsWith('neo84:'))throw Error('Unknown v084 attack program');
 const kind=program.kind.slice(6),r={damage:program.damage,flips:[]};
 const coin=()=>{const yes=Boolean(flip());r.flips.push(yes);return yes;};
 switch(kind){
  case 'aurora-wave':{
   const hits=Number(coin())+Number(coin());
   if(hits===2)r.status='Paralyzed';
   if(hits===1)r.status='Asleep';
   break;
  }
  case 'psychic-leaf':{
   const count=ctx.enemyEnergy||0;
   if(!Number.isInteger(count)||count<0||count>60)throw Error('Invalid attached Energy count');
   for(let i=0;i<count;i++)if(coin())r.damage+=10;
   r.healFromDamage='full';break;
  }
  case 'octazooka':if(coin())r.attackPenalty=true;break;
  case 'positive-ion':if(coin())r.damage+=10;break;
  case 'leek-jab':r.disableThisAttack=true;break;
  case 'outrage':r.damage=coin()?30+10*(ctx.selfCounters||0):0;break;
  case 'clamping-jaw':r.noRetreat=true;r.attackPenalty=true;break;
  case 'explosion':r.selfDamage=60;break;
  case 'expand':r.shield={reduce:10};break;
  case 'spike-ball-tackle':r.selfDamage=10;break;
  case 'shed':r.healSelf=10;break;
  case 'leer':if(coin())r.attackLock=true;break;
  case 'giant-wave':r.disableAllAttacks=true;break;
  case 'migraine':if(coin())r.status='Confused';else r.selfStatus='Confused';break;
  default:throw Error('Unported Neo v084 attack '+kind);
 }
 return r;
}
module.exports={defs,compile,resolve};