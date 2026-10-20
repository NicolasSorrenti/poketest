'use strict';
/* Minimal keyed reconciliation for presentation-only RPG lists.
 * Retains the exact node, focus and scroll position on unrelated game renders. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgRenderPerf=api;
})(typeof window==='undefined'?null:window,function(){
 function reconcileKeyed(parent,entries,create,refresh){
  if(!parent||!Array.isArray(entries))return {created:0,reused:0,removed:0};
  const existing=new Map();
  for(const child of [...parent.children]){
   const key=child.dataset?.renderKey;
   if(key!==undefined&&!existing.has(key))existing.set(key,child);
  }
  const seen=new Set();
  let created=0,reused=0,removed=0;
  for(let index=0;index<entries.length;index++){
   const item=entries[index],key=String(item.key);
   if(seen.has(key))throw Error('Duplicate RPG render key: '+key);
   seen.add(key);
   let node=existing.get(key);
   if(node){reused++;existing.delete(key);}
   else{node=create(item);created++;}
   if(!node.dataset)throw Error('Expected an HTML node with dataset');
   node.dataset.renderKey=key;
   refresh(node,item,index);
   if(parent.children[index]!==node)parent.insertBefore(node,parent.children[index]||null);
  }
  for(const child of [...parent.children]){
   if(seen.has(child.dataset?.renderKey))continue;
   child.remove();removed++;
  }
  return {created,reused,removed};
 }
 function displaySignature(id,label){return String(id)+'\u001f'+String(label).trim();}
 return {reconcileKeyed,displaySignature};
});