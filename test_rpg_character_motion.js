'use strict';
const assert=require('node:assert/strict');
const {beat,emotion,createDirector}=require('./rpg_character_motion');

assert.equal(beat(null,{speaker:'Reina',line:'Hi',location:'shop'}),'initial');
assert.equal(beat(null,{speaker:'Reina',line:'',location:'shop'}),'none');
assert.equal(beat({speaker:'Reina',line:'A',location:'shop'},{speaker:'Reina',line:'A',location:'shop'}),'none');
assert.equal(beat({speaker:'Reina',line:'A',location:'shop'},{speaker:'Reina',line:'B',location:'shop'}),'line');
assert.equal(beat({speaker:'Reina',line:'A',location:'shop'},{speaker:'Hana',line:'B',location:'shop'}),'speaker');
assert.equal(beat({speaker:'Reina',line:'A',location:'shop'},{speaker:'Reina',line:'A',location:'park'}),'scene');
assert.equal(emotion('vulnerable'),'vulnerable');
assert.equal(emotion('not-a-real-emotion','surprised'),'surprised');
assert.equal(emotion(null),'neutral');

function fakeNode(){
 const records=[];
 return {
  records,hidden:false,
  animate(frames,options){
   const animation={id:null,canceled:false,cancel(){this.canceled=true}};
   records.push({frames,options,animation});return animation;
  },
  getAnimations(){return records.map(r=>r.animation);}
 };
}
const dialogue=fakeNode(),speakerElement=fakeNode(),lineElement=fakeNode();
const director=createDirector({window:{matchMedia:()=>({matches:false})}});
const render=(speaker,line,location='shop')=>director.update({speaker,line,location,dialogue,speakerElement,lineElement});
assert.equal(render('Reina','First line'),'initial');
assert.equal(lineElement.records.length,0,'initial render should not animate');
assert.equal(render('Reina','First line'),'none');
assert.equal(render('Reina','Second line'),'line');
assert.equal(lineElement.records.length,1);
assert.equal(speakerElement.records.length,0);
assert.equal(render('Hana','Now I speak'),'speaker');
assert.equal(dialogue.records.length,1,'speaker change moves the dialogue panel');
assert.equal(speakerElement.records.length,1);
assert.equal(lineElement.records.length,2);
assert.equal(lineElement.records[0].animation.canceled,true,'quick dialogue changes cancel previous in-flight beat');
assert.equal(render('Hana','Same scene, new place','park'),'scene');
assert.equal(dialogue.records.length,2);
assert.equal(director.expressionChange(lineElement),true);
assert.equal(lineElement.records.length,4);
director.reset();
assert.equal(render('Hana','On returning','park'),'initial');
assert.equal(lineElement.records.length,4,'reset must suppress stale replay');

const calmDialogue=fakeNode(),calmLine=fakeNode();
const calm=createDirector({window:{matchMedia:()=>({matches:true})}});
calm.update({speaker:'Reina',line:'A',location:'shop',dialogue:calmDialogue,lineElement:calmLine});
assert.equal(calm.update({speaker:'Reina',line:'B',location:'shop',dialogue:calmDialogue,lineElement:calmLine}),'line');
assert.equal(calmLine.records.length,0,'reduced-motion skips animation, not the underlying state');
assert.equal(calm.expressionChange(calmLine),false);

const hiddenDialogue=fakeNode(),hiddenLine=fakeNode();
hiddenDialogue.hidden=true;
const hidden=createDirector({window:{matchMedia:()=>({matches:false})}});
hidden.update({speaker:'Reina',line:'A',location:'shop',dialogue:hiddenDialogue,lineElement:hiddenLine});
assert.equal(hidden.update({speaker:'Reina',line:'B',location:'shop',dialogue:hiddenDialogue,lineElement:hiddenLine}),'line');
assert.equal(hiddenLine.records.length,0,'no animation behind a hidden dialogue panel');

console.log('RPG character motion: speaker swaps, line updates, expression cues and reduced-motion checks passed.');
