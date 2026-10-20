'use strict';
/* Neo Harbor original Web Audio cues. No samples, external files or card-rule hooks. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgAudio=api;
})(typeof window==='undefined'?null:window,function(){
 const KEY='neoRpgAudioV1';
 const DEFAULTS=Object.freeze({enabled:true,volume:.35,ambience:false});
 const NOTE=Object.freeze({
  ui:[[510,610,.055,0,'triangle']],
  travel:[[340,510,.105,0,'triangle'],[540,680,.085,.065,'sine']],
  period:[[392,466,.12,0,'triangle'],[587,698,.12,.085,'sine']],
  day:[[330,440,.15,0,'triangle'],[440,660,.17,.12,'sine'],[659,880,.18,.24,'triangle']],
  sleep:[[440,320,.2,0,'sine'],[330,440,.23,.18,'triangle']],
  finale:[[392,523,.23,0,'triangle'],[523,659,.23,.17,'triangle'],[659,784,.3,.35,'sine']],
  versus:[[250,370,.13,0,'sawtooth'],[500,700,.17,.095,'triangle']],
  final:[[220,400,.19,0,'sawtooth'],[520,820,.21,.17,'triangle']],
  cutin:[[550,680,.11,0,'square']],
  knockout:[[175,110,.2,0,'sawtooth'],[660,440,.2,.12,'triangle']],
  result:[[330,260,.22,0,'sine']],
  victory:[[523,659,.18,0,'triangle'],[659,784,.2,.14,'triangle'],[784,1046,.25,.29,'sine']],
  champion:[[392,523,.23,0,'triangle'],[523,659,.24,.13,'triangle'],[659,784,.25,.3,'triangle'],[784,1046,.32,.45,'sine']],
  booster:[[440,660,.16,0,'triangle'],[659,880,.19,.13,'sine']],
  flip:[[740,990,.075,0,'sine']]
 });
 const BASE={home:174.61,shop:220,arcade:233.08,park:196,cafe:174.61,center:207.65,library:164.81};
 const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0));
 function settings(raw){
  let value=raw;
  if(typeof raw==='string'){try{value=JSON.parse(raw);}catch{return {...DEFAULTS};}}
  if(!value||typeof value!=='object'||Array.isArray(value))return {...DEFAULTS};
  return {
   enabled:typeof value.enabled==='boolean'?value.enabled:DEFAULTS.enabled,
   volume:value.volume===undefined||value.volume===null||!Number.isFinite(Number(value.volume))?DEFAULTS.volume:clamp(value.volume),
   ambience:typeof value.ambience==='boolean'?value.ambience:DEFAULTS.ambience
  };
 }
 function cueFor(name){return NOTE[name]||null;}
 function scenePitch(place,slot){
  const base=BASE[place]||BASE.home;
  return base*(slot===2?.75:slot===1?1:1.125);
 }
 function createController({
  doc=typeof document==='undefined'?null:document,
  win=typeof window==='undefined'?null:window,
  store=typeof window==='undefined'?null:window.localStorage,
  contextFactory=null,clock=()=>Date.now()
 }={}){
  let config;
  try{config=settings(store?.getItem?.(KEY));}catch{config=settings(null);}
  let context=null,activated=false,ambienceNodes=null,initialized=false,scene={place:'home',slot:0},paused=false;
  const lastPlayed=new Map();
  const makeContext=contextFactory||(()=>{const Factory=win?.AudioContext||win?.webkitAudioContext;return Factory?new Factory():null;});
  function persist(){try{store?.setItem?.(KEY,JSON.stringify(config));}catch{/* private mode */}}
  function unlock(){
   if(!config.enabled)return false;
   activated=true;
   if(!context){try{context=makeContext();}catch{return false;}}
   if(!context)return false;
   if(context.state==='suspended'){try{const result=context.resume?.();result?.catch?.(()=>{});}catch{/* browser policy */}}
   updateAmbience();
   return true;
  }
  function tone([start,end,duration,offset,wave],strength=1){
   const now=context.currentTime,from=now+offset;
   const oscillator=context.createOscillator(),gain=context.createGain();
   oscillator.type=wave;
   oscillator.frequency.setValueAtTime(start,from);
   oscillator.frequency.exponentialRampToValueAtTime(Math.max(1,end),from+duration);
   gain.gain.setValueAtTime(0,from);
   const peak=config.volume*.11*strength;
   gain.gain.linearRampToValueAtTime(peak,from+Math.min(.023,duration*.23));
   gain.gain.linearRampToValueAtTime(0,from+duration);
   oscillator.connect(gain);gain.connect(context.destination);
   oscillator.onended=()=>{try{oscillator.disconnect();gain.disconnect();}catch{/* closed context */}};
   oscillator.start(from);oscillator.stop(from+duration+.012);
  }
  function play(name){
   const cue=cueFor(name);
   if(!cue||!config.enabled||config.volume===0||!activated||!context)return false;
   const now=clock(),interval=name==='ui'?70:name==='flip'?85:100;
   if(now-(lastPlayed.get(name)??-Infinity)<interval)return false;
   lastPlayed.set(name,now);
   try{
    const level=name==='ui'?.64:name==='cutin'?.56:name==='flip'?.58:1;
    for(const note of cue)tone(note,level);
    return true;
   }catch{return false;}
  }
  function stopAmbience(){
   if(!ambienceNodes)return;
   const nodes=ambienceNodes;ambienceNodes=null;
   try{nodes.gain.gain.setTargetAtTime(0,context.currentTime,.055);}catch{}
   // Stopping nodes releases CPU and prevents a lingering continuous audio signal.
   let remaining=nodes.oscillators.length;
   for(const osc of nodes.oscillators){
    osc.onended=()=>{
     try{osc.disconnect();}catch{}
     if(--remaining===0)try{nodes.gain.disconnect();}catch{}
    };
    try{osc.stop(context.currentTime+.25);}catch{osc.onended?.();}
   }
  }
  function updateAmbience(){
   if(!context||!activated||!config.enabled||!config.ambience||config.volume===0||paused||doc?.hidden){
    stopAmbience();return;
   }
   if(!ambienceNodes){
    try{
     const gain=context.createGain();gain.gain.setValueAtTime(0,context.currentTime);
     gain.connect(context.destination);
     const oscillators=[];
     for(const wave of ['sine','triangle']){
      const osc=context.createOscillator();osc.type=wave;osc.connect(gain);osc.start();oscillators.push(osc);
     }
     ambienceNodes={oscillators,gain};
    }catch{stopAmbience();return;}
   }
   try{
    const base=scenePitch(scene.place,scene.slot);
    ambienceNodes.oscillators[0].frequency.setTargetAtTime(base,context.currentTime,.18);
    ambienceNodes.oscillators[1].frequency.setTargetAtTime(base*1.5,context.currentTime,.2);
    ambienceNodes.gain.gain.setTargetAtTime(config.volume*.014,context.currentTime,.18);
   }catch{stopAmbience();}
  }
  function setScene(place,slot){const next={place:String(place||'home'),slot:Number.isInteger(slot)?slot:0};
   if(scene.place===next.place&&scene.slot===next.slot)return;
   scene=next;updateAmbience();
  }
  function setPaused(value){if(paused===!!value)return;paused=!!value;updateAmbience();}
  function setEnabled(value){config.enabled=!!value;persist();updateAmbience();syncUI();}
  function setVolume(value){config.volume=clamp(value);persist();updateAmbience();syncUI();}
  function setAmbience(value){config.ambience=!!value;persist();updateAmbience();syncUI();}
  const el=id=>doc?.getElementById?.(id);
  function syncUI(){
   const toggle=el('rpgSoundToggle'),volume=el('rpgSoundVolume'),ambience=el('rpgAmbienceToggle'),label=el('rpgSoundLabel');
   if(toggle){toggle.textContent=config.enabled?'SFX ON':'SFX MUTED';toggle.setAttribute('aria-pressed',String(config.enabled));}
   if(volume)volume.value=String(Math.round(config.volume*100));
   if(ambience)ambience.checked=config.ambience;
   if(label)label.textContent=config.enabled?'♫ SOUND':'♪ MUTED';
  }
  function init({duel=false}={}){
   if(initialized||!doc?.addEventListener)return false;
   initialized=true;
   doc.addEventListener('pointerdown',unlock,{capture:true});
   doc.addEventListener('keydown',event=>{if(!event.repeat)unlock();},{capture:true});
   doc.addEventListener('visibilitychange',updateAmbience);
   if(!duel){
    doc.addEventListener('click',event=>{
     const target=event.target?.closest?.('button,summary');
     if(!target||target.closest?.('.rpg-audio-settings'))return;
     if(target.matches?.('#rpgMapToggle,#rpgInfoToggle,.rpg-dock-tabs button,.rpg-panel-tabs button,.rpg-dock-action,.choice'))
      play('ui');
    },{capture:true});
    el('rpgSoundToggle')?.addEventListener('click',()=>{
     if(!config.enabled)unlock();
     setEnabled(!config.enabled);
     if(config.enabled)unlock();
     play('ui');
    });
    el('rpgSoundVolume')?.addEventListener('input',event=>{setVolume(Number(event.target.value)/100);play('ui');});
    el('rpgAmbienceToggle')?.addEventListener('change',event=>{setAmbience(event.target.checked);play('ui');});
   }
   win?.addEventListener?.('storage',event=>{
    if(event.key!==KEY)return;
    config=settings(event.newValue);updateAmbience();syncUI();
   });
   syncUI();
   return true;
  }
  return {
   init,unlock,play,setScene,setPaused,setEnabled,setVolume,setAmbience,
   get settings(){return {...config};},
   get unlocked(){return activated&&!!context;},
   get playingAmbience(){return !!ambienceNodes;},
   stopAmbience
  };
 }
 const controller=createController();
 return {KEY,DEFAULTS,parseSettings:settings,cueFor,scenePitch,createController,
  init:options=>controller.init(options),unlock:()=>controller.unlock(),
  play:name=>controller.play(name),setScene:(place,slot)=>controller.setScene(place,slot),
  setPaused:value=>controller.setPaused(value),
  setEnabled:value=>controller.setEnabled(value),
  setVolume:value=>controller.setVolume(value),
  setAmbience:value=>controller.setAmbience(value),
  get settings(){return controller.settings}
 };
});