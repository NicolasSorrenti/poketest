'use strict';
/* Pure measured-word pagination; one story step can contain several visual
 * dialogue pages, without advancing the engine's scene or CG sequence. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoOverworldTextPages=api;
})(typeof window!=='undefined'?window:null,function(){
 function split(text,width,maxLines,measure){
  if(typeof measure!=='function')throw TypeError('A text-width measurement function is required');
  const limit=Math.max(1,Number(width)||1),rows=Math.max(1,Math.floor(maxLines)||1);
  const lines=[],words=String(text||'').replace(/\r\n/g,'\n').split(/(\n|[ \t]+)/);
  let line='';
  function flush(){lines.push(line.trimEnd());line='';}
  function insert(token){
   if(!token)return;
   if(!line){line=token;return;}
   const candidate=line+' '+token;
   if(measure(candidate)<=limit){line=candidate;return;}
   flush();line=token;
  }
  for(const token of words){
   if(!token||/^[ \t]+$/.test(token))continue;
   if(token==='\n'){flush();continue;}
   if(measure(token)<=limit){insert(token);continue;}
   // Extremely long unbroken words/URLs must never overflow or disappear.
   if(line)flush();
   for(const char of Array.from(token)){
    if(line&&measure(line+char)>limit)flush();
    line+=char;
   }
  }
  if(line||!lines.length)flush();
  const pages=[];
  for(let i=0;i<lines.length;i+=rows)pages.push(lines.slice(i,i+rows).join('\n').trim());
  return pages.length?pages:[''];
 }
 return Object.freeze({split});
});
