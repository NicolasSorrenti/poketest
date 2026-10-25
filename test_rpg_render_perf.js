'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {reconcileKeyed,displaySignature}=require('./rpg_render_perf');

function element(name){
 return {
  name,dataset:{},children:[],textContent:'',removed:false,onclick:null,parent:null,
  remove(){if(this.parent){const i=this.parent.children.indexOf(this);if(i>=0)this.parent.children.splice(i,1);}
   this.parent=null;this.removed=true;},
  insertBefore(node,before){
   if(node.parent)node.remove();
   const index=before?this.children.indexOf(before):-1;
   if(before&&index<0)throw Error('not a child');
   this.children.splice(index<0?this.children.length:index,0,node);
   node.parent=this;node.removed=false;
  }
 };
}
let created=0;
const parent=element('root');parent.scrollTop=119;
const create=()=>{created++;return element('button')};
const update=(node,item)=>{node.textContent=item.label;node.onclick=item.onClick};
const source1=()=>1,source2=()=>2;
const first=reconcileKeyed(parent,[
 {key:'people:hana',label:'Talk to Hana',onClick:source1},
 {key:'people:reina',label:'Talk to Reina',onClick:source2}
],create,update);
assert.deepEqual(first,{created:2,reused:0,removed:0});
const hana=parent.children[0],reina=parent.children[1];
assert.equal(hana.onclick(),1);
reina.focused=true;
const replacement=()=>42;
const second=reconcileKeyed(parent,[
 {key:'people:hana',label:'Talk to Hana',onClick:source1},
 {key:'people:reina',label:'Talk to Reina',onClick:replacement}
],create,update);
assert.deepEqual(second,{created:0,reused:2,removed:0});
assert.equal(created,2,'ordinary redraw must not rebuild buttons');
assert.equal(parent.children[0],hana);
assert.equal(parent.children[1],reina);
assert.equal(reina.onclick(),42,'must rebind updated action handlers');
assert.equal(reina.focused,true,'focused node retained');
assert.equal(parent.scrollTop,119,'scroll position must remain stable');

const third=reconcileKeyed(parent,[{key:'people:reina',label:'Reina',onClick:replacement},
 {key:'people:hana',label:'Hana',onClick:source1}],create,update);
assert.equal(third.created,0);
assert.equal(parent.children[0],reina,'reordered controls reuse same DOM node');
assert.equal(parent.children[1],hana);
assert.equal(reina.textContent,'Reina');

const fourth=reconcileKeyed(parent,[{key:'people:reina',label:'Reina',onClick:replacement}],create,update);
assert.equal(fourth.removed,1);
assert.equal(hana.removed,true);
assert.equal(parent.children[0],reina);
assert.equal(reconcileKeyed(parent,[],create,update).removed,1);
assert.equal(parent.children.length,0);

assert.throws(()=>reconcileKeyed(parent,[{key:'dup'},{key:'dup'}],create,update),/Duplicate RPG render key/);
assert.equal(displaySignature('shop','Cards'),'shop\u001fCards');

const game=fs.readFileSync('rpg.js','utf8'),html=fs.readFileSync('rpg.html','utf8');
assert.match(game,/NeoRpgRenderPerf\.reconcileKeyed\(body,entries/,'dock reconciliation integrated');
assert.match(game,/NeoRpgRenderPerf\.reconcileKeyed\(\$\('places'\),placeEntries/,'map reconciliation integrated');
assert.match(game,/if\(portraitRoot\.dataset\.npc!==nextPortrait\|\|portraitRoot\.dataset\.artSrc!==nextArt\)/,'portrait preserves image until the character or outfit changes');
assert.match(game,/const selected=button\.dataset\.tab===rpgLocalTab/,'selected tab updates on same button');
assert.match(html,/src="\/rpg_character_bootstrap\.js(?:\?[^"]*)?"/,'RPG loads scripts through the authorized bootstrap');
const bootstrap=fs.readFileSync('rpg_character_bootstrap.js','utf8');
assert.ok(bootstrap.includes('"/rpg_render_perf.js"'),'render performance helper is in the bootstrap dependency list');
assert.ok(bootstrap.indexOf('"/rpg_render_perf.js"')<bootstrap.indexOf('"/rpg.js"'),'render helper is loaded before RPG entrypoint');

console.log('RPG keyed rendering: focus, scroll, live callbacks, reorder, remove, duplicate keys and runtime integration passed.');
