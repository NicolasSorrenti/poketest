'use strict';
// Follow-on exact printed Neo attack effects. Reuse server-authoritative
// search/discard decisions; never mark a complex effect handled with a no-op.
const cards=[...require('./cards/neo3.json'),...require('./cards/neo4.json')];
const defs=Object.freeze({
 'neo3-1|Gigavolt':'gigavolt',
 'neo3-7|Stoke':'stoke',
 'neo3-24|Swipe':'swipe',
 'neo3-46|Call for Family':'call-for-murkrow',
 'neo4-11|Mountain Smasher':'mountain-smasher'
});
const signatures=new Map();
for(const [key,effect] of Object.entries(defs)){
 const [id,name]=key.split('|'),attack=cards.find(x=>x.id===id)?.attacks?.find(a=>a.name===name);
 if(!attack)throw Error('Missing exact Neo attack '+key);
 const sig=JSON.stringify([attack.name,attack.damage||'',attack.text||'']);
 const program=Object.freeze(effect==='stoke'?{kind:'afternoon-nap',damage:0}
  :effect==='call-for-murkrow'?{kind:'call-family',damage:0,restriction:'Murkrow'}
  :{kind:'neo87:'+effect,damage:Number.parseInt(attack.damage,10)||0});
 const prior=signatures.get(sig);
 if(prior&&JSON.stringify(prior)!==JSON.stringify(program))throw Error('Conflicting printed effect '+key);
 signatures.set(sig,program);
}
const compile=a=>signatures.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'']))||null;
function resolve(program,flip,ctx={}){
 if(!program?.kind?.startsWith('neo87:'))throw Error('Unrecognized Neo v087 program');
 const r={damage:program.damage,flips:[]};
 const coin=()=>{const heads=Boolean(flip());r.flips.push(heads);return heads;};
 switch(program.kind){
  case 'neo87:gigavolt':if(coin())r.damage+=20;else r.status='Paralyzed';break;
  case 'neo87:swipe':if(coin())r.discardOpponentTools=true;break;
  case 'neo87:mountain-smasher':{
   const n=ctx.selfEnergy||0;
   if(!Number.isInteger(n)||n<0||n>60)throw Error('Invalid Tyranitar Energy count');
   let heads=0;for(let i=0;i<n;i++)if(coin())heads++;
   r.damage=20*heads;r.millOpponent=heads;break;
  }
  default:throw Error('Unported Neo v087 type '+program.kind);
 }
 return r;
}
module.exports={defs,compile,resolve};