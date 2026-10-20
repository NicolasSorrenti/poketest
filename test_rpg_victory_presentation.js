'use strict';
const assert=require('node:assert/strict');
const {model,createPresenter,resultArtSources}=require('./rpg_victory_presentation');

const receipt={outcome:'Victory',name:'Reina Kurogane',points:8,credits:15,trust:2};
assert.equal(model(receipt,{hasBooster:true}).title,'VICTORY!');
assert.equal(model(receipt,{hasBooster:true}).action,'CLAIM BOOSTER →');
assert.equal(model(receipt,{hasBooster:true}).points,'+8');
assert.equal(model({outcome:'Defeat',credits:5,points:1,trust:1},{hasBooster:true}).hasBooster,false);
assert.equal(model({outcome:'Draw'},{hasBooster:false}).kind,'draw');
assert.equal(model({outcome:'unexpected'}),null);
assert.equal(model(null),null);

function node(tag){
 return {
  tagName:tag,children:[],textContent:'',className:'',dataset:{},
  append(...items){this.children.push(...items);},
  replaceChildren(...items){this.children=[...items];},
  focus(){this.focused=true;}
 };
}
const nodes=Object.fromEntries(
 ['victoryDialog','victoryOutcome','victoryOpponent','victorySubtitle','victoryStats','victoryPortrait','victoryContinue']
 .map(k=>[k,node('div')])
);
const dialog=nodes.victoryDialog;
dialog.open=false;
dialog.showModal=function(){this.open=true;};
dialog.close=function(){this.open=false;};
const presenter=createPresenter({document:{getElementById:id=>nodes[id],createElement:node}});
let claimed=0;
const portrait=node('img');
assert.equal(presenter.show({receipt,hasBooster:true,avatar:portrait,onContinue:()=>{claimed++;}}),true);
assert.equal(presenter.active,true);
assert.equal(dialog.open,true);
assert.equal(dialog.dataset.outcome,'victory');
assert.equal(nodes.victoryOutcome.textContent,'VICTORY!');
assert.equal(nodes.victoryOpponent.textContent,'VS REINA KUROGANE');
assert.equal(nodes.victoryStats.children.length,3);
assert.equal(nodes.victoryStats.children[0].children[0].textContent,'+8');
assert.equal(nodes.victoryPortrait.children[0],portrait);
assert.equal(nodes.victoryContinue.focused,true);
assert.equal(nodes.victoryContinue.textContent,'CLAIM BOOSTER →');
assert.equal(presenter.show({receipt}),false,'cannot stack results or double-award');
nodes.victoryContinue.onclick();
assert.equal(claimed,1);
assert.equal(dialog.open,false);
assert.equal(presenter.active,false);
nodes.victoryContinue.onclick();
assert.equal(claimed,1,'continue is exactly once');
assert.equal(presenter.show({receipt:{outcome:'Defeat',name:'Hana',points:1,credits:5,trust:1},
 onContinue:()=>{claimed++;}}),true);
let wasPrevented=false;
dialog.oncancel({preventDefault(){wasPrevented=true;}});
assert.equal(wasPrevented,true);
assert.equal(dialog.open,false);
assert.equal(claimed,2,'Escape is equivalent to Continue');
assert.equal(nodes.victoryContinue.textContent,'CONTINUE ADVENTURE →');
assert.equal(presenter.show({receipt:{outcome:'Draw',name:'Shiori',points:1,credits:5,trust:1},
 onContinue:()=>{claimed++;}}),true);
assert.equal(dialog.dataset.outcome,'draw');
nodes.victoryContinue.onclick();
assert.equal(claimed,3);

// Art selection is presentation only and never depends on a reward transaction.
assert.deepEqual(resultArtSources('reina'),[
 '/rpg-assets/characters/reina/events/battle-result.webp',
 '/rpg-assets/characters/reina/events/battle-result.png',
 '/rpg-assets/reactions/reina/attack.png'
],'Dedicated post-battle art must fall back to this NPC’s existing cut-in');
assert.deepEqual(resultArtSources('../jinx'),[],'Reject invalid character IDs in generated art paths');
assert.deepEqual(resultArtSources(''),[]);

const createdImages=[];
const artPresenter=createPresenter({document:{
 getElementById:id=>nodes[id],
 createElement(tag){const element=node(tag);if(tag==='img')createdImages.push(element);return element;}
}});
const oldAvatar=node('img');
assert.equal(artPresenter.show({receipt,npcId:'reina',avatar:oldAvatar}),true);
const resultArt=createdImages.at(-1);
assert.equal(resultArt.src,'/rpg-assets/characters/reina/events/battle-result.webp');
assert.equal(nodes.victoryPortrait.children[0],oldAvatar,'Regular avatar stays during download');
resultArt.onerror();
assert.equal(resultArt.src,'/rpg-assets/characters/reina/events/battle-result.png');
resultArt.onerror();
assert.equal(resultArt.src,'/rpg-assets/reactions/reina/attack.png','Missing dedicated image uses cut-in');
resultArt.onload();
assert.equal(nodes.victoryPortrait.children[0],resultArt,'Loaded NPC cut-in replaces temporary avatar');
nodes.victoryContinue.onclick();
assert.equal(dialog.open,false);

const secondAvatar=node('img');
assert.equal(artPresenter.show({receipt:{...receipt,name:'Sol'},npcId:'sol',avatar:secondAvatar}),true);
const newArt=createdImages.at(-1);
resultArt.onload();
assert.equal(nodes.victoryPortrait.children[0],secondAvatar,'Stale image callbacks cannot replace a newer NPC');
newArt.onerror();
newArt.onerror();
newArt.onerror();
assert.equal(nodes.victoryPortrait.children[0],secondAvatar,'Keep standard avatar when every art source fails');
nodes.victoryContinue.onclick();
console.log('RPG victory presentation: receipt metrics, non-blocking handoff, single-claim, defeat/draw and Escape passed.');
