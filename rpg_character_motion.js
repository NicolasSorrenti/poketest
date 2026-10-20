'use strict';
/* Lightweight visual-novel choreography for existing character portraits and dialogue.
   No story choices, affinity, time, or save data are modified here. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgCharacterMotion=api;
})(typeof window==='undefined'?null:window,function(){
 const ALLOWED_EMOTIONS=new Set(['neutral','surprised','vulnerable','irritated','determined','happy']);
 function emotion(requested,fallback='neutral'){
  return ALLOWED_EMOTIONS.has(requested)?requested:(ALLOWED_EMOTIONS.has(fallback)?fallback:'neutral');
 }
 function beat(previous,next){
  if(!next||!String(next.line||'').trim())return 'none';
  if(!previous)return 'initial';
  if(next.location!==previous.location)return 'scene';
  if(next.speaker!==previous.speaker)return 'speaker';
  if(next.line!==previous.line)return 'line';
  return 'none';
 }
 function createDirector({window:win=typeof window==='undefined'?null:window}={}){
  let previous=null;
  const reduced=()=>!!win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function play(node,keyframes,options){
   if(reduced()||typeof node?.animate!=='function')return false;
   node.getAnimations?.().filter(a=>a.id==='neo-rpg-beat').forEach(a=>a.cancel());
   const animation=node.animate(keyframes,{...options,fill:'none'});
   animation.id='neo-rpg-beat';
   return true;
  }
  function update({speaker='',line='',location='',dialogue=null,speakerElement=null,lineElement=null}={}){
   const next={speaker:String(speaker),line:String(line),location:String(location)};
   const currentBeat=beat(previous,next);
   previous=next;
   if(currentBeat==='none'||currentBeat==='initial')return currentBeat;
   if(!dialogue||dialogue.hidden||reduced())return currentBeat;
   if(currentBeat==='scene'||currentBeat==='speaker'){
    play(dialogue,[{opacity:.8,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],
       {duration:220,easing:'cubic-bezier(.19,.8,.25,1)'});
    play(speakerElement,[{opacity:.45,transform:'translateX(-13px) skewX(-9deg)'},{opacity:1,transform:'translateX(0) skewX(0)'}],
       {duration:200,easing:'ease-out'});
   }
   play(lineElement,[{opacity:.55,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:currentBeat==='speaker'?230:160,easing:'ease-out'});
   return currentBeat;
  }
  function expressionChange(image){
   return play(image,[{opacity:.63,transform:'translateY(5px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],
       {duration:190,easing:'ease-out'});
  }
  function reset(){previous=null;}
  return {update,expressionChange,reset};
 }
 const director=createDirector();
 return {beat,emotion,createDirector,update:detail=>director.update(detail),
         expressionChange:image=>director.expressionChange(image),reset:()=>director.reset()};
});