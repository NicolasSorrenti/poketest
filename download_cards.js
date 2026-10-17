'use strict';
const fs=require('node:fs/promises'),path=require('node:path');
const {normalizeCard}=require('./tcgdex_adapter');
const SETS=['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4','basep'];
const ROOT='https://api.tcgdex.net/v2/en';
const DIR=path.join(__dirname,'cards');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function request(url){
 let last;
 for(let n=0;n<4;n++){
  try{
   const res=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(20000)});
   if(!res.ok)throw Error(`HTTP ${res.status} ${url}`);
   return await res.json();
  }catch(e){last=e;if(n<3)await delay(500*2**n)}
 }
 throw last;
}
async function inPool(items,worker,count=5){
 const result=new Array(items.length);let cursor=0;
 await Promise.all(Array.from({length:Math.min(count,items.length)},async()=>{
  while(cursor<items.length){const i=cursor++;try{result[i]=await worker(items[i])}catch(err){result[i]={error:String(err),id:items[i].id}}}
 }));return result;
}
async function main(){
 await fs.mkdir(DIR,{recursive:true});let failures=0;const summary=[];
 for(const set of SETS){
  try{
   const meta=await request(`${ROOT}/sets/${set}`);
   if(!Array.isArray(meta.cards))throw Error('No cards in set response');
   const responses=await inPool(meta.cards,x=>request(`${ROOT}/cards/${encodeURIComponent(x.id)}`),5);
   const errors=responses.filter(x=>x.error);
   if(errors.length){failures+=errors.length;await fs.writeFile(path.join(DIR,`${set}.errors.json`),JSON.stringify(errors,null,2));console.warn(`${set}: ${errors.length} cards unavailable; retaining prior cached set if present`);continue}
   let all=responses.map(normalizeCard);
   if(set==='base4')all=require('./reprint_attack_normalizer').normalizeBase2Reprints(all).cards;
   // Atomic replace: do not corrupt previously downloaded complete sets.
   const tmp=path.join(DIR,`${set}.json.tmp`),dest=path.join(DIR,`${set}.json`);
   await fs.writeFile(tmp,JSON.stringify(all));await fs.rename(tmp,dest);
   summary.push({set,count:all.length});console.log(`${set}: cached ${all.length} cards`);
  }catch(e){failures++;console.error(`${set}: ${e.message}`)}
 }
 console.log('TCGdex cache summary:',summary,'failures:',failures);
 if(failures)process.exitCode=1;
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={request,inPool,main};
