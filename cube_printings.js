'use strict';
// A Cube represents a named card using ONE expansion's printing throughout
// the complete 240-card pool. Multiple physical copies of that printing are
// permitted: they are useful for evolution chains and four-person drafts.
const {CATALOG}=require('./headless_duel');
const CHRONOLOGY=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4'];
const SETS=new Set(CHRONOLOGY);
const setOf=id=>String(id).split('-')[0];
function printOrder(preset='balanced'){
 if(preset==='neo')return [...new Set(['neo1','neo2','neo3','neo4',...CHRONOLOGY])];
 if(preset==='rocket')return [...new Set(['base5','gym1','gym2',...CHRONOLOGY])];
 return CHRONOLOGY;
}
function printingKey(id){
 const c=CATALOG.get(id);
 if(!c)throw Error('Unknown Cube printing: '+id);
 return c.supertype+'\0'+String(c.name||'').trim().toLocaleLowerCase('en');
}
function preferredPrintings(ids,{preset='balanced'}={}){
 const order=printOrder(preset),rank=new Map(order.map((set,i)=>[set,i]));
 const choice=new Map();
 for(const id of ids){
  if(!CATALOG.has(id))throw Error('Unknown Cube card: '+id);
  const set=setOf(id),key=printingKey(id),current=choice.get(key);
  if(!SETS.has(set))continue;
  if(!current||rank.get(set)<rank.get(current))choice.set(key,set);
 }
 return ids.filter(id=>choice.get(printingKey(id))===setOf(id));
}
function mixedPrintingNames(ids){
 const found=new Map(),mixed=new Set();
 for(const id of ids){
  const key=printingKey(id),set=setOf(id);
  if(found.has(key)&&found.get(key)!==set)mixed.add(CATALOG.get(id).name);
  else found.set(key,set);
 }
 return [...mixed].sort();
}
module.exports={setOf,preferredPrintings,mixedPrintingNames,CHRONOLOGY};
