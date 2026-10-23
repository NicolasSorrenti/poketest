'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('duel_action_rail.js','utf8');
const context={globalThis:{}};
vm.runInNewContext(source,context,{filename:'duel_action_rail.js'});
const api=context.globalThis.NeoDuelActionRail;
assert.ok(api,'rail module exported');
assert.equal(api.DESKTOP_QUERY,'(min-width: 781px)');

let doc;
function element(id){
 const events={};
 return {id,parentElement:null,children:[],hidden:false,disabled:false,attributes:{},focusCalls:0,
  append(child){if(child.parentElement)child.parentElement.children=child.parentElement.children.filter(c=>c!==child);this.children.push(child);child.parentElement=this;},
  setAttribute(key,value){this.attributes[key]=value;},
  addEventListener(key,fn){events[key]=fn;},
  removeEventListener(key){delete events[key];},
  fire(key,event={}){events[key]?.(event);},
  contains(node){return node===this||this.children.some(child=>child.contains?.(node));},
  focus(){this.focusCalls++;doc.activeElement=this;},
  querySelectorAll(){return [];}
 };
}
const panel=element('attackPanel'),field=element('fieldAttackDock'),mobile=element('mobileAttackDock');
const surface=element('mobileAttackSurface'),rail=element('desktopAttackDock');
const trigger=element('mobileAttacksToggle'),close=element('closeAttacks');
rail.append(panel);
mobile.append(close);mobile.append(surface);
const names=['attackPanel','fieldAttackDock','mobileAttackDock','mobileAttackSurface',
 'desktopAttackDock','mobileAttacksToggle','closeAttacks'];
const items=[panel,field,mobile,surface,rail,trigger,close];
const body={classes:new Set(['attacks-in-rail']),classList:{
 toggle(name,on){on?body.classes.add(name):body.classes.delete(name);},
 remove(name){body.classes.delete(name);}
}};
const docEvents={};
doc={body,activeElement:null,getElementById:id=>items[names.indexOf(id)],
 addEventListener(name,fn){docEvents[name]=fn;},
 removeEventListener(name){delete docEvents[name];}};
const viewport={matches:true,listener:null,addEventListener(_,fn){this.listener=fn;},removeEventListener(){this.listener=null;}};
const controller=api.createController(doc,viewport);
assert.equal(panel.parentElement,field,'desktop attacks beside active');
assert.equal(rail.hidden,true);
viewport.matches=false;viewport.listener();
assert.equal(panel.parentElement,surface,'mobile attacks moved to modal surface');
trigger.fire('click');
assert.ok(body.classes.has('attack-popup-open'),'trigger opens modal');
assert.equal(mobile.attributes['aria-hidden'],'false');
assert.equal(trigger.attributes['aria-expanded'],'true');
assert.equal(close.focusCalls,1,'modal close receives focus');
close.fire('click');
assert.ok(!body.classes.has('attack-popup-open'),'close button works');
trigger.fire('click');
docEvents.keydown({key:'Escape',preventDefault(){}});
assert.ok(!body.classes.has('attack-popup-open'),'Escape dismisses modal');
trigger.fire('click');
mobile.fire('click',{target:mobile});
assert.ok(!body.classes.has('attack-popup-open'),'backdrop click dismisses modal');
trigger.fire('click');
mobile.fire('click',{target:{closest:selector=>selector==='.attack-action:not(:disabled)'?{}:null}});
assert.ok(!body.classes.has('attack-popup-open'),'attack selection dismisses modal');
trigger.fire('click');
viewport.matches=true;viewport.listener();
assert.equal(panel.parentElement,field,'switching back restores same buttons');
assert.equal(field.children.filter(c=>c===panel).length,1,'attack buttons not duplicated');
assert.ok(!body.classes.has('attack-popup-open'),'desktop sync closes popup');
controller.destroy();

for(const file of ['classic_live.html','online.html']){
 const html=fs.readFileSync(file,'utf8');
 for(const id of names)assert.ok(html.includes('id="'+id+'"'),file+' needs '+id);
 assert.match(html,/src="duel_action_rail\.js\?v=4"/);
 assert.match(html,/duel_mobile_popup\.css\?v=1/);
 assert.ok(html.indexOf('duel_action_rail.js')<html.indexOf(file==='online.html'?'online.js':'classic_live.js'));
}
const desktopCss=fs.readFileSync('duel_match_v085.css','utf8');
assert.match(desktopCss,/\.active-with-attacks #fieldAttackDock\s*\{[^}]*grid-column:3/);
console.log('PASS accessible mobile attack popup and desktop preservation');
