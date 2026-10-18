'use strict';
// Neo Revelation/Destiny five-card batch. Printed symbols absent from TCGdex
// attack text are recovered in explicitly scoped Shining Charizard payment.
const cards=[...require('./cards/neo3.json'),...require('./cards/neo4.json')];
const defs=Object.freeze({
 'neo3-5|Present':'present',
 'neo4-5|Crushing Blow':'crushing-blow',
 'neo4-6|Pull In':'pull-in',
 'neo4-50|Guiding Flame':'guiding-flame',
 'neo4-107|White-Hot Flame':'white-hot-flame'
});
const byPrint=new Map();
for(const [key,name] of Object.entries(defs)){
 const [id,attackName]=key.split('|');
 const atk=cards.find(c=>c.id===id)?.attacks?.find(a=>a.name===attackName);
 if(!atk)throw Error('Missing Neo v092 printed attack: '+key);
 const sig=JSON.stringify([atk.name,atk.damage||'',atk.text||'',atk.cost||[]]);
 if(byPrint.has(sig))throw Error('Duplicate Neo v092 signature: '+key);
 byPrint.set(sig,Object.freeze({kind:'neo92:'+name,damage:Number.parseInt(atk.damage,10)||0}));
}
function compile(a){return byPrint.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'',a?.cost||[]]))||null;}
function resolve(p,flip,ctx={}){
 if(!p?.kind?.startsWith('neo92:'))throw Error('Not a Neo v092 attack');
 const r={damage:p.damage,flips:[]};
 const coin=()=>{const heads=Boolean(flip());r.flips.push(heads);return heads;};
 switch(p.kind){
  case 'neo92:present':{
   const heads=Number(coin())+Number(coin())+Number(coin());
   r.damage=heads===1?40:heads===3?60:0;
   if(heads===0)r.neo92HealDefender='all';
   if(heads===2)r.neo92HealDefender=30;
   break;
  }
  case 'neo92:crushing-blow':
   if(ctx.enemyEnergy>0&&coin())r.neo92DiscardOpponentEnergy=true;
   break;
  case 'neo92:pull-in':r.status='Asleep';break;
  case 'neo92:guiding-flame':
   if(ctx.neo92DiscardIndex!==undefined)r.neo92BenchFromDiscard=ctx.neo92DiscardIndex;
   break;
  case 'neo92:white-hot-flame':
   if(ctx.neo92MissingPayment){r.damage=0;break;}
   r.neo92FireLightningPayment=true;
   if(!coin())r.selfDamage=30;
   break;
  default:throw Error('Unknown Neo v092 program '+p.kind);
 }
 return r;
}
module.exports={defs,compile,resolve};
