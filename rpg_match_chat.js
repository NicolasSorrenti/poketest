'use strict';
// Transcript of RPG voice lines that actually appeared as an NPC cut-in.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgMatchChat=api;})(typeof window==='undefined'?null:window,function(){
 function createHistory({storage,key,max=90}={}){
  let entries=[];
  try{const saved=JSON.parse(storage?.getItem(key)||'[]');if(Array.isArray(saved))entries=saved.filter(x=>x&&typeof x.text==='string'&&typeof x.name==='string'&&x.text.length<500).slice(-max);}catch{}
  function add(reaction){
   if(typeof reaction?.line!=='string'||!reaction.line.trim())return null;
   const entry={name:String(reaction.npcName||'Opponent').slice(0,80),text:reaction.line.slice(0,400),title:String(reaction.title||'').slice(0,80),kind:String(reaction.kind||'')};
   entries.push(entry);entries=entries.slice(-max);
   try{storage?.setItem(key,JSON.stringify(entries));}catch{}
   return entry;
  }
  function reset(){entries=[];try{storage?.removeItem(key);}catch{}}
  return {add,reset,get entries(){return entries.slice();}};
 }
 function make({container,key,storage=typeof sessionStorage==='undefined'?null:sessionStorage,doc=typeof document==='undefined'?null:document}={}){
  const history=createHistory({storage,key});
  function render(){
   if(!container||!doc)return;
   const stick=container.scrollHeight-container.scrollTop-container.clientHeight<40;
   container.replaceChildren();
   if(!history.entries.length){const empty=doc.createElement('p');empty.className='rpg-chat-empty';empty.textContent='Character dialogue will appear here during battle.';container.append(empty);return;}
   for(const message of history.entries){
    const el=doc.createElement('article');el.className='rpg-dialogue-message';
    const sender=doc.createElement('strong');sender.textContent=message.name;
    const title=doc.createElement('small');title.textContent=message.title;
    const copy=doc.createElement('p');copy.textContent=message.text;
    el.append(sender,title,copy);container.append(el);
   }
   if(stick)container.scrollTop=container.scrollHeight;
  }
  render();
  return {push(reaction){const entry=history.add(reaction);if(entry)render();return entry;},reset(){history.reset();render();},render,get entries(){return history.entries;}};
 }
 return {createHistory,make};
});
