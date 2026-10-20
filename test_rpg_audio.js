'use strict';
const assert=require('node:assert/strict');
const {parseSettings,cueFor,scenePitch,createController,KEY}=require('./rpg_audio');
assert.equal(parseSettings(null).enabled,true);
assert.equal(parseSettings('not JSON').volume,.35);
assert.equal(parseSettings('{"enabled":false,"volume":4,"ambience":true}').volume,1);
assert.equal(parseSettings({enabled:false,volume:-3}).volume,0);
assert.equal(cueFor('champion').length,4);
assert.equal(cueFor('missing'),null);
assert.equal(scenePitch('park',0)>scenePitch('park',2),true);
const controls=Object.fromEntries(['rpgSoundToggle','rpgSoundVolume','rpgAmbienceToggle','rpgSoundLabel'].map(id=>[id,{
 attrs:{},listeners:{},value:'35',checked:false,textContent:'',
 addEventListener(k,fn){this.listeners[k]=fn;},setAttribute(k,v){this.attrs[k]=v;}
}]));
const documentEvents={},windowEvents={};
const doc={hidden:false,getElementById:id=>controls[id]||null,addEventListener:(k,fn)=>{documentEvents[k]=fn;}};
const win={addEventListener:(k,fn)=>{windowEvents[k]=fn;}};
const stored=new Map(),storage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)};
let factories=0,clock=500,oscillators=[],gainNodes=[],targets=[];
function param(){return {
 setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},
 exponentialRampToValueAtTime(v){this.value=v;},setTargetAtTime(v){targets.push(v);}
};}
function contextFactory(){
 factories++;
 return {state:'running',currentTime:0,destination:{},
 createOscillator(){const o={frequency:param(),startCount:0,stopCount:0,connect(){},disconnect(){},start(){this.startCount++},stop(){this.stopCount++}};oscillators.push(o);return o;},
 createGain(){const g={gain:param(),connect(){},disconnect(){}};gainNodes.push(g);return g;}
 };
}
const sound=createController({doc,win,store:storage,contextFactory,clock:()=>clock});
assert.equal(sound.play('ui'),false,'silent before gesture');
assert.equal(factories,0,'no context before gesture');
assert.equal(sound.init(),true);
assert.equal(sound.init(),false,'only bind once');
assert.equal(controls.rpgSoundToggle.attrs['aria-pressed'],'true');
assert.equal(sound.play('victory'),false);
documentEvents.pointerdown({});
assert.equal(sound.unlocked,true);
assert.equal(factories,1);
assert.equal(sound.play('ui'),true);
assert.equal(oscillators[0].startCount,1);
assert.equal(sound.play('ui'),false,'rate limit');
clock+=80;assert.equal(sound.play('ui'),true);
assert.equal(sound.play('bad'),false);
sound.setVolume(.6);
assert.equal(sound.settings.volume,.6);
assert.equal(controls.rpgSoundVolume.value,'60');
assert.equal(JSON.parse(stored.get(KEY)).volume,.6);
sound.setAmbience(true);
assert.equal(sound.playingAmbience,true);
assert.equal(controls.rpgAmbienceToggle.checked,true);
const before=targets.length;
sound.setScene('park',2);
assert.equal(targets.length>before,true,'location/time pitch');
sound.setPaused(true);assert.equal(sound.playingAmbience,false);
sound.setPaused(false);assert.equal(sound.playingAmbience,true);
doc.hidden=true;documentEvents.visibilitychange();assert.equal(sound.playingAmbience,false);
doc.hidden=false;documentEvents.visibilitychange();assert.equal(sound.playingAmbience,true);
sound.setEnabled(false);
assert.equal(sound.play('victory'),false);
assert.equal(sound.playingAmbience,false);
assert.equal(controls.rpgSoundToggle.attrs['aria-pressed'],'false');
controls.rpgSoundToggle.listeners.click();
assert.equal(sound.settings.enabled,true);
assert.equal(factories,1);
controls.rpgSoundVolume.listeners.input({target:{value:25}});
assert.equal(sound.settings.volume,.25);
controls.rpgAmbienceToggle.listeners.change({target:{checked:false}});
assert.equal(sound.playingAmbience,false);
windowEvents.storage({key:KEY,newValue:'{"enabled":false,"volume":0.2,"ambience":false}'});
assert.equal(sound.settings.enabled,false);
assert.equal(controls.rpgSoundVolume.value,'20');
const unavailable=createController({doc:{addEventListener(){},getElementById(){return null}},
 store:{getItem(){return null}},contextFactory:()=>null});
assert.equal(unavailable.unlock(),false);
assert.equal(unavailable.play('ui'),false);
console.log('RPG audio: user-gesture gating, volume/mute, ambience, persistence, visibility and no-context fallback passed.');
