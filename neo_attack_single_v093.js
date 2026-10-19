'use strict';
// Single-card milestone: Neo Revelation Aipom #41, Grab.
// Match the imported WotC printing, including its printed cost and text.
const printed=require('./cards/neo3.json').find(c=>c.id==='neo3-41')?.attacks?.find(a=>a.name==='Grab');
if(!printed)throw Error('Missing Neo Revelation Aipom #41 Grab');
const signature=JSON.stringify([printed.name,printed.damage||'',printed.text||'',printed.cost||[]]);
function compile(a){
 return JSON.stringify([a?.name,a?.damage||'',a?.text||'',a?.cost||[]])===signature
  ?{kind:'neo93:aipom-grab',damage:0}:null;
}
function resolve(program){
 if(program?.kind!=='neo93:aipom-grab')throw Error('Invalid Grab program');
 return {damage:0,flips:[],neo93ReturnTrainer:true};
}
module.exports={compile,resolve};
