'use strict';
// WotC Neo Genesis Berry tools: voluntary between-turn use and mandatory
// beginning-of-turn effects for both players and all in-play hosts.
function eligible(g,u,card){
 for(const t of u.attachedTrainers||[]){
  const name=card(g,t.id).name;
  if(name==='Berry'&&u.damage>=20||name==='Gold Berry'&&u.damage>=40||
     name==='Miracle Berry'&&(u.poison||['Asleep','Confused','Paralyzed'].includes(u.status)))return name;
 }
 return null;
}
function consume(g,owner,u,name,h){
 const idx=u.attachedTrainers.findIndex(t=>h.card(g,t.id).name===name);
 if(idx<0)throw Error('Berry disappeared');
 if(name==='Miracle Berry')h.STATUS.clearConditions(u);
 else u.damage=Math.max(0,u.damage-(name==='Gold Berry'?40:20));
 owner.discard.push(u.attachedTrainers.splice(idx,1)[0].id);
 h.log(g,name+' consumed on '+h.card(g,u.id).name+'.');
}
function between(g,h){
 for(let side=0;side<2;side++){
  const owner=g.players[side];
  for(const [slot,u] of [[-1,owner.active],...owner.bench.map((v,i)=>[i,v])]){
   if(!u||u.damage>=h.maxHP(g,u)||u.berryDeclinedSerial===g.turnSerial)continue;
   const name=eligible(g,u,h.card);if(!name)continue;
   g.nextDecisionId++;
   g.pendingDecision=h.makeDecision({id:'berry:'+g.nextDecisionId,actor:side,kind:'neo-berry',label:'Use '+name+' between turns?',options:[{id:'choice:yes',label:'Use '+name}],min:0,max:1,optional:true});
   g.pendingAction={kind:'neo_berry',side,slot,name};return true;
  }
 }return false;
}
function resolve(g,pending,answer,h){
 const owner=g.players[pending.side],u=pending.slot===-1?owner.active:owner.bench[pending.slot];
 if(!u||eligible(g,u,h.card)!==pending.name)throw Error('Berry eligibility changed');
 if(answer.selected.length)consume(g,owner,u,pending.name,h);
 else u.berryDeclinedSerial=g.turnSerial;
}
function start(g,h){
 for(const owner of g.players)for(const u of [owner.active,...owner.bench].filter(Boolean)){
  if(u.damage>=h.maxHP(g,u))continue;
  const name=eligible(g,u,h.card);
  if(name)consume(g,owner,u,name,h);
 }
}
module.exports={eligible,between,resolve,start};
