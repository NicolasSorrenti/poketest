'use strict';
// Transport-independent choice contracts. Options use opaque IDs, never UI array positions.
const assertSide = side => { if(side!==0&&side!==1)throw Error('Invalid decision actor'); };
function makeDecision({id,actor,kind='select',label='',options,min=1,max=1,optional=false}){
 assertSide(actor);
 if(typeof id!=='string'||!id||id.length>120)throw Error('Invalid decision id');
 if(!Array.isArray(options))throw Error('Decision options must be an array');
 if(!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||min<0||max<min||max>options.length)throw Error('Invalid decision bounds');
 const seen=new Set();
 const safeOptions=options.map(o=>{
  if(!o||typeof o.id!=='string'||!o.id||seen.has(o.id))throw Error('Invalid or duplicate option id');
  seen.add(o.id);
  return Object.freeze({id:o.id,label:String(o.label??o.id),...(typeof o.cardId==='string'&&o.cardId?{cardId:o.cardId}:{})});
 });
 return Object.freeze({id,actor,kind,label:String(label),min,max,optional:!!optional,options:Object.freeze(safeOptions)});
}
function validateAnswer(decision,actor,payload){
 if(!decision)throw Error('No pending decision');
 assertSide(actor);
 if(actor!==decision.actor)throw Error('Decision belongs to another player');
 if(!payload||payload.decisionId!==decision.id)throw Error('Stale or missing decision id');
 if(payload.decline===true){if(!decision.optional)throw Error('Decision is mandatory');return Object.freeze({decisionId:decision.id,decline:true,selected:Object.freeze([])});}
 if(!Array.isArray(payload.selected))throw Error('Expected selected option IDs');
 const chosen=payload.selected;
 if(chosen.length<decision.min||chosen.length>decision.max)throw Error('Wrong number of selections');
 const permitted=new Set(decision.options.map(o=>o.id));
 if(chosen.some(id=>typeof id!=='string'||!permitted.has(id)))throw Error('Invalid option selection');
 if(new Set(chosen).size!==chosen.length)throw Error('Duplicate selection');
 return Object.freeze({decisionId:decision.id,decline:false,selected:Object.freeze([...chosen])});
}
function decisionForViewer(decision,side){
 if(!decision)return null;
 // Do not leak hidden card names, option ids, or target identity to the other player.
 if(side!==decision.actor)return {id:decision.id,waitingFor:decision.actor};
 return {id:decision.id,actor:decision.actor,kind:decision.kind,label:decision.label,min:decision.min,max:decision.max,optional:decision.optional,options:decision.options.map(o=>({...o}))};
}
const api={makeDecision,validateAnswer,decisionForViewer};
if(typeof module==='object'&&module.exports)module.exports=api;
if(typeof globalThis!=='undefined')globalThis.NeoDecisionCore=api;
