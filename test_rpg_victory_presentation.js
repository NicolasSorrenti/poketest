'use strict';
const assert=require('node:assert/strict');
const {model,createPresenter,resultArtSources}=require('./rpg_victory_presentation');
const fs=require('node:fs');
const path=require('node:path');
const rpgSource=fs.readFileSync(path.join(__dirname,'rpg.js'),'utf8');
assert.match(rpgSource,/avatar:makeAvatar\(duel\.npc\),npcId:duel\.npc/,
 'Battle results must pass NPC identity to the dedicated artwork resolver');
const boosterRoutine=rpgSource.slice(rpgSource.indexOf('function showPackReveal()'),rpgSource.indexOf("const target=$('packCards')"));
assert.match(boosterRoutine,/rpg-assets\/reactions.*attack\.png/,
 'Booster reveal must fall back to NPC attack cut-in');
assert.doesNotMatch(boosterRoutine,/vn-expressions\/surpris|portraits\/surpris|events\/surpris/,
 'Generic surprised artwork should no longer replace an absent booster illustration');

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
const firstAvatar=node('img');
assert.equal(artPresenter.show({receipt,npcId:'reina',avatar:firstAvatar}),true);
assert.equal(nodes.victoryPortrait.children[0],firstAvatar,'Initial portrait is visible on entrance');
assert.equal(createdImages.length,0,'Provided portrait must not trigger a later image swap');
nodes.victoryContinue.onclick();

// Dedicated result artwork remains available when no portrait is supplied.
assert.equal(artPresenter.show({receipt,npcId:'reina'}),true);
const resultArt=createdImages.at(-1);
assert.equal(resultArt.src,'/rpg-assets/characters/reina/events/battle-result.webp');
resultArt.onerror();
assert.equal(resultArt.src,'/rpg-assets/characters/reina/events/battle-result.png');
resultArt.onerror();
assert.equal(resultArt.src,'/rpg-assets/reactions/reina/attack.png','Missing dedicated image uses cut-in');
resultArt.onload();
assert.equal(nodes.victoryPortrait.children[0],resultArt,'Fallback art loads when no portrait exists');
nodes.victoryContinue.onclick();

// A late load from an earlier result may not replace the next character.
const secondAvatar=node('img');
assert.equal(artPresenter.show({receipt:{...receipt,name:'Sol'},npcId:'sol',avatar:secondAvatar}),true);
assert.equal(createdImages.length,1,'New portraits also remain unchanged');
resultArt.onload();
assert.equal(nodes.victoryPortrait.children[0],secondAvatar,'Stale image callbacks cannot replace a newer NPC');
nodes.victoryContinue.onclick();
console.log('RPG victory presentation: stable opening portrait, fallback CG, stale image guard, rewards and Escape passed.');
