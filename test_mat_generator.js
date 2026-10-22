'use strict';
// Regression tests for user-created mats and the RPG playmat picker contract.
// Run with: node test_mat_generator.js
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const values=new Map(),images=new Map();
global.localStorage={
 getItem:key=>values.has(key)?values.get(key):null,
 setItem:(key,val)=>values.set(key,String(val)),
 removeItem:key=>values.delete(key)
};
global.indexedDB={
 open(){
  const request={};
  const db={
   objectStoreNames:{contains:()=>true},
   createObjectStore(){},close(){},
   transaction(){
    const tx={
     objectStore(){
      const run=operation=>{
       const req={};
       queueMicrotask(()=>{
        req.result=operation();
        req.onsuccess?.();
        queueMicrotask(()=>tx.oncomplete?.());
       });
       return req;
      };
      return {
       get:id=>run(()=>images.get(id)),
       put:(blob,id)=>run(()=>images.set(id,blob)),
       delete:id=>run(()=>images.delete(id))
      };
     }
    };
    return tx;
   }
  };
  queueMicrotask(()=>{request.result=db;request.onsuccess?.();});
  return request;
 }
};
const originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;
const revoked=[];
URL.createObjectURL=()=> 'blob:neo-mat-testing';
URL.revokeObjectURL=value=>revoked.push(value);
const mats=require('./duel_playmats');
async function run(){
 assert.equal(mats.available([]).length,3,'Only default mats available initially');
 assert(!mats.available([]).some(m=>m.id==='npc-yuna'),'NPC mats still require unlocking');
 assert(mats.available(['yuna']).some(m=>m.id==='npc-yuna'));
 const image=new Blob(['image binary'],{type:'image/webp'});
 const first=await mats.saveCustom('Custom Test Mat',image);
 assert.match(first.id,/^custom-/);
 assert.equal(first.name,'Custom Test Mat');
 assert.equal(mats.custom().length,1);
 assert(mats.available([]).some(m=>m.id===first.id),'Custom mat selectable without NPC gift');
 assert.equal(mats.choose(first.id,mats.available([]).map(m=>m.id)),first.id);
 assert.equal(localStorage.getItem(mats.IMPORT_KEY),first.id,'A new mat is queued for RPG import');
 assert.equal(await mats.imageUrl(first.id),'blob:neo-mat-testing');
 const side={dataset:{},style:{properties:{},setProperty(k,v){this.properties[k]=v;}}};
 mats.apply(side,first.id);
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(side.style.properties['--neo-playmat-image'],/blob:neo-mat-testing/);
 await assert.rejects(mats.saveCustom('Not an image',new Blob(['text'],{type:'text/plain'})),/Invalid/);
 const unavailable=mats.choose('npc-reina',mats.available([]).map(m=>m.id));
 assert.equal(unavailable,'aurora','Unowned gifts are still locked');
 assert.equal(await mats.removeCustom(first.id),true);
 assert.equal(mats.custom().length,0);
 assert.equal(localStorage.getItem(mats.IMPORT_KEY),null);
 assert(revoked.includes('blob:neo-mat-testing'));
 const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
 const studio=fs.readFileSync(path.join(root,'mat_generator.html'),'utf8');
 const script=fs.readFileSync(path.join(root,'mat_generator.js'),'utf8');
 const duel=fs.readFileSync(path.join(root,'classic_live.js'),'utf8');
 const rpg=fs.readFileSync(path.join(root,'rpg.js'),'utf8');
 assert(server.includes("'mat_generator.js'"),'Studio JavaScript exposed by server allowlist');
 assert(studio.includes('id="matCanvas"')&&studio.includes('id="finish"'));
 assert(script.includes('mats.saveCustom(')&&script.includes('exportBlob('));
 assert(duel.includes('refreshMatOptions'),'Picker refreshes after custom mats saved');
 assert(rpg.includes('mats?.IMPORT_KEY'),'RPG imports newly finished mats');
 assert.equal(new Function(script) instanceof Function,true,'Studio script parses');
 console.log('Playmat Studio: catalog, custom storage, rendering, selection and integration passed.');
}
run().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>{
 URL.createObjectURL=originalCreate;
 URL.revokeObjectURL=originalRevoke;
});