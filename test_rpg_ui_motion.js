'use strict';
const assert=require('node:assert/strict');
const {nextDrawer,createController}=require('./rpg_ui_motion');

assert.equal(nextDrawer(null,'map'),'map');
assert.equal(nextDrawer('map','map'),null);
assert.equal(nextDrawer('map','info'),'info');
assert.equal(nextDrawer('info','bad'),null);

function element(){
 const handlers={};
 const attrs={};
 const classes=new Set();
 return {
  attrs,handlers,hidden:true,
  classList:{toggle(k,on){if(on)classes.add(k);else classes.delete(k)},contains(k){return classes.has(k)}},
  addEventListener(type,fn){handlers[type]=fn;},
  querySelector(selector){return selector==='.rpg-drawer-close'?this.closeButton:null;},
  setAttribute(name,value){attrs[name]=value;},
  focus(){this.focused=true;},
  click(event){handlers.click?.(event||{});}
 };
}
const widgets={
 rpgMapToggle:element(),rpgInfoToggle:element(),rpgDrawerBackdrop:element()
};
const mapPanel=element(),infoPanel=element();
mapPanel.closeButton=element();infoPanel.closeButton=element();
const events={};
const doc={
 body:{dataset:{},classList:{toggle(){}}},
 getElementById(id){return widgets[id]||(id==='rpgMapPanel'?mapPanel:id==='rpgInfoPanel'?infoPanel:null);},
 querySelector(selector){return selector==='.locations-panel'?mapPanel:selector==='.sidebar'?infoPanel:null;},
 addEventListener(type,fn){events[type]=fn}
};
const nav=createController({document:doc});
assert.equal(nav.init(),true);
assert.equal(nav.init(),false,'controller should not bind buttons twice');
assert.equal(doc.body.dataset.rpgDrawer,'closed');
assert.equal(widgets.rpgDrawerBackdrop.hidden,true);
assert.equal(widgets.rpgMapToggle.attrs['aria-expanded'],'false');
assert.equal(mapPanel.attrs['aria-hidden'],'true');
assert.equal(mapPanel.inert,true);
assert.equal(infoPanel.inert,true);

widgets.rpgMapToggle.click();
assert.equal(nav.active,'map');
assert.equal(doc.body.dataset.rpgDrawer,'map');
assert.equal(widgets.rpgDrawerBackdrop.hidden,false);
assert.equal(mapPanel.attrs['aria-hidden'],'false');
assert.equal(infoPanel.attrs['aria-hidden'],'true');
assert.equal(widgets.rpgMapToggle.attrs['aria-expanded'],'true');
assert.equal(mapPanel.inert,false);
assert.equal(mapPanel.closeButton.focused,true,'opening the map focuses its close control');

widgets.rpgInfoToggle.click();
assert.equal(nav.active,'info');
assert.equal(mapPanel.attrs['aria-hidden'],'true');
assert.equal(infoPanel.attrs['aria-hidden'],'false');
assert.equal(infoPanel.inert,false);
assert.equal(mapPanel.inert,true);

let prevented=false;
events.keydown({key:'Escape',preventDefault(){prevented=true}});
assert.equal(prevented,true);
assert.equal(nav.active,null);
assert.equal(widgets.rpgInfoToggle.focused,true,'Escape returns focus to the opener');

widgets.rpgMapToggle.click();
mapPanel.click({target:{closest(selector){return selector==='#places button'?{}:null}}});
assert.equal(nav.active,null,'selecting a location closes the map');

widgets.rpgInfoToggle.click();
nav.onLocationChange();
assert.equal(nav.active,null,'travel always closes information panel');

widgets.rpgMapToggle.click();
mapPanel.closeButton.click();
assert.equal(nav.active,null,'internal close button dismisses map');
assert.equal(widgets.rpgMapToggle.focused,true,'close returns focus to map trigger');
widgets.rpgInfoToggle.click();
infoPanel.closeButton.click();
assert.equal(nav.active,null,'internal close button dismisses info');
widgets.rpgMapToggle.click();
widgets.rpgDrawerBackdrop.click();
assert.equal(nav.active,null,'backdrop closes the menu');

console.log('RPG scene-first navigation: toggles, focus, Escape, travel, location selection and backdrop passed.');
