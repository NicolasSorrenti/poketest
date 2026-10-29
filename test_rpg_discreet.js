'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
const source=read('rpg_discreet.js');
const css=read('rpg_discreet.css');
const html=read('rpg.html');
const duel=read('classic_live.html');

function setup(pathname,search='',initial='0',withButton=true){
 const values=new Map([['neoHarborRpgDiscreetV1',initial]]);
 const events={};
 const root={dataset:{}};
 const handlers={};
 const attributes={};
 const button=withButton?{
  textContent:'',title:'',dataset:{},
  addEventListener(type,fn){handlers[type]=fn;},
  setAttribute(name,value){attributes[name]=value;}
 }:null;
 const win={
  location:{pathname,search},
  localStorage:{getItem:key=>values.get(key)||null,setItem:(key,val)=>values.set(key,val)},
  addEventListener:(event,listener)=>{events[event]=listener;}
 };
 const doc={documentElement:root,getElementById:id=>id==='rpgDiscreetToggle'?button:null};
 // Model the browser's DOM observer without running asynchronous callbacks.
 vm.runInNewContext(source,{window:win,document:doc,URLSearchParams,MutationObserver:class{observe(){}}});
 events.DOMContentLoaded?.();
 return {root,button,attributes,handlers,events,values};
}

let page=setup('/rpg.html');
assert.equal(page.root.dataset.rpgDiscreet,'off');
assert.equal(page.attributes['aria-pressed'],'false');
page.handlers.click();
assert.equal(page.root.dataset.rpgDiscreet,'on');
assert.equal(page.values.get('neoHarborRpgDiscreetV1'),'1');
assert.equal(page.attributes['aria-pressed'],'true');
page.handlers.click();
assert.equal(page.root.dataset.rpgDiscreet,'off');
assert.equal(page.values.get('neoHarborRpgDiscreetV1'),'0');

page=setup('/rpg.html','','1');
assert.equal(page.root.dataset.rpgDiscreet,'on','mode persists after reloading');
page.events.storage({key:'neoHarborRpgDiscreetV1',newValue:'0'});
assert.equal(page.root.dataset.rpgDiscreet,'off','mode syncs with another tab');

const duelPage=setup('/classic_live.html','?rpg=1','1',false);
assert.equal(duelPage.root.dataset.rpgDiscreet,'on','RPG battle iframe inherits setting');
const standalone=setup('/classic_live.html','','1',false);
assert.equal(standalone.root.dataset.rpgDiscreet,undefined,'regular matches are unaffected');

assert.match(html,/id="rpgDiscreetToggle"/);
assert.match(html,/rpg_discreet\.js/);
assert.match(html,/rpg_discreet\.css/);
assert.match(duel,/rpg_discreet\.js/);
assert.match(duel,/rpg_discreet\.css/);
for(const selector of ['.rpg-cast-member img','.person-avatar img','.preduel-art img','#packGiver img','#victoryPortrait img','#cgMomentArt img','#galleryGrid .cg-thumb img','#galleryPreview img','.neo-tournament-versus__portrait','.npc-reaction-portrait']){
 assert.ok(css.includes(selector),'Expected hidden RPG art surface: '+selector);
}
assert.ok(!css.includes('.pack-card img'),'Pokémon booster card images remain visible');
assert.doesNotMatch(source,/\b(?:persist|saveCampaign|campaignState)\s*\(/,
 'Changing view mode must never save or mutate the RPG campaign');
console.log('RPG Discreet Mode: toggle, reload, storage sync, RPG-only battle, and art scopes passed.');
