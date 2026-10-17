'use strict';
const cards=[...require('./cards/neo1.json'),...require('./cards/neo2.json')];
const defs=Object.freeze({'neo1-16|Super Metronome':'super-metronome','neo1-36|Sticky Nectar':'sticky-nectar','neo2-11|Sketch':'sketch','neo2-30|Sketch':'sketch'});
const signatures=new Map();
for(const [key,kind] of Object.entries(defs)){
 const [id,name]=key.split('|'),a=cards.find(c=>c.id===id)?.attacks?.find(x=>x.name===name);
 if(!a)throw Error('Missing Neo attack '+key);
 const signature=JSON.stringify([a.name,a.damage||'',a.text||'']);
 const program=Object.freeze({kind:'neo50:'+kind,damage:kind==='sticky-nectar'?20:0});
 const prior=signatures.get(signature);if(prior&&prior.kind!==program.kind)throw Error('Neo effect collision '+key);
 signatures.set(signature,program);
}
const compile=a=>signatures.get(JSON.stringify([a?.name,a?.damage||'',a?.text||'']))||null;
function resolve(p,flip){
 const o={damage:p.damage,flips:[]};
 if(p.kind==='neo50:sticky-nectar'){const heads=Boolean(flip());o.flips=[heads];o.damage=heads?30:20;o.neo50StickyLock=heads;}
 else if(p.kind==='neo50:super-metronome'){const heads=Boolean(flip());o.flips=[heads];o.neo50MetronomeHeads=heads;}
 else if(p.kind==='neo50:sketch')o.neo50Sketch=true;
 else throw Error('Unknown Neo v0.50 program '+p.kind);
 return o;
}
module.exports={defs,compile,resolve};
