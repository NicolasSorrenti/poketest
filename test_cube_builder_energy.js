'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
class Element{
 constructor(){this.children=[];this.classList={add(){},toggle(){}};this.style={};this.dataset={};this.listeners={};}
 set innerHTML(value){this.nodes=new Map();}
 querySelector(selector){if(!this.nodes)this.nodes=new Map();if(!this.nodes.has(selector))this.nodes.set(selector,new Element());return this.nodes.get(selector);}
 querySelectorAll(){return [];}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];}
 setAttribute(key,value){this[key]=value;}
 addEventListener(name,fn){this.listeners[name]=fn;}
 click(){assert.equal(this.disabled,false,'Control should be enabled');this.listeners.click?.({stopPropagation(){}});}
}
const window={};
vm.runInNewContext(fs.readFileSync(require.resolve('./cube_builder_ui.js'),'utf8'),{window,document:{createElement:()=>new Element()},confirm:()=>true});
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting'];
const energyIds=Object.fromEntries(types.map(type=>[type,type.toLowerCase()]));
const root=new Element();let deck=[];
const builder=window.CubeDeckBuilder.create({root,onChange:next=>{deck=next;}});
const buttons=()=>{const result=[];const walk=n=>{if(/^(Add|Remove) /.test(n['aria-label']||''))result.push(n);n.children.forEach(walk);};walk(root.querySelector('#cbPool'));return result;};
const plus=index=>buttons().find(n=>n['aria-label']==='Add '+types[index]+' Energy');
const minus=index=>buttons().find(n=>n['aria-label']==='Remove '+types[index]+' Energy');
for(let type=0;type<types.length;type++){
 deck=Array(14).fill(energyIds[types[type]]);
 builder.update({energyIds,deck});
 plus(type).click();assert.equal(deck.length,15,'Basic Energy can exceed four copies');
 for(let i=0;i<15;i++)minus(type).click();
 assert.equal(deck.length,0);
 plus(type).click();assert.equal(deck[0],energyIds[types[type]],'Removed Energy can be added back');
}
builder.update({energyIds,deck:Array(40).fill('grass')});
assert.equal(plus(0).disabled,true,'Deck size still caps Energy');
builder.update({energyIds,deck:['grass'],locked:true});
assert.equal(plus(0).disabled,true);assert.equal(minus(0).disabled,true);
const pokemon={id:'p1',name:'Bulbasaur',supertype:'Pokémon',subtypes:['Basic'],types:['Grass']};
builder.update({drafted:Array(8).fill(pokemon),deck:Array(4).fill('p1')});
assert.equal(buttons().find(n=>n['aria-label']==='Add Bulbasaur').disabled,true,'Normal cards retain the four-copy limit');
const energy={id:'grass',name:'Grass Energy',supertype:'Energy',subtypes:[]};
builder.update({drafted:[energy],ownedCounts:{grass:1},deck:['grass']});
assert.equal(plus(0).disabled,true,'Switching away from supplied Energy restores owned limits');
console.log('PASS Cube builder: all six basic Energies, remove/re-add, size cap, lock, normal copy limits and owned Energy');
