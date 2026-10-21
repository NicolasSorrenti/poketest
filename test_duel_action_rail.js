'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('duel_action_rail.js','utf8');
const context={globalThis:{}};
vm.runInNewContext(source,context,{filename:'duel_action_rail.js'});
const api=context.globalThis.NeoDuelActionRail;
assert.ok(api,'action rail module is exported');
assert.equal(api.DESKTOP_QUERY,'(min-width: 781px)');

function node(id){
 return {id,parentElement:null,children:[],hidden:false,append(child){
  if(child.parentElement)child.parentElement.children=child.parentElement.children.filter(x=>x!==child);
  this.children.push(child);child.parentElement=this;
 }};
}
const panel=node('attackPanel'),field=node('fieldAttackDock'),rail=node('desktopAttackDock');
field.append(panel);
const body={classes:new Set(),classList:{toggle(name,on){on?body.classes.add(name):body.classes.delete(name);}}};
const doc={body,getElementById:id=>({attackPanel:panel,fieldAttackDock:field,desktopAttackDock:rail})[id]};
const viewport={matches:true,listener:null,addEventListener(_,fn){this.listener=fn;},removeEventListener(){this.listener=null;}};
const controller=api.createController(doc,viewport);
assert.equal(panel.parentElement,rail,'desktop docks the live attack panel in the command rail');
assert.ok(body.classes.has('attacks-in-rail'));
assert.equal(rail.hidden,false);
viewport.matches=false;viewport.listener();
assert.equal(panel.parentElement,field,'mobile restores the same attack panel beside the Active Pokémon');
assert.equal(body.classes.has('attacks-in-rail'),false);
assert.equal(rail.hidden,true);
controller.destroy();

for(const file of ['classic_live.html','online.html']){
 const html=fs.readFileSync(file,'utf8');
 assert.match(html,/id="fieldAttackDock"/);
 assert.match(html,/id="desktopAttackDock"/);
 assert.match(html,/id="attackPanel"/);
 assert.match(html,/src="duel_action_rail\.js"/);
 assert.ok(html.indexOf('duel_action_rail.js')<html.indexOf(file==='online.html'?'online.js':'classic_live.js'),'rail mounts before the duel client renders attacks');
}
console.log('PASS responsive action rail: one live attack panel, desktop dock and mobile restoration');
