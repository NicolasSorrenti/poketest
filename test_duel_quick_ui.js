'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {legalTarget,drawPrizes}=require('./duel_quick_ui');
const {handIntent}=require('./duel_shared_components');
const catalog={a:{name:'Charmander'},b:{name:'Charmeleon'},c:{name:"Brock's Vulpix"}};
const lookup=id=>catalog[id]||{};
const evolve={name:'Charmeleon',evolvesFrom:'Charmander'};
assert.equal(legalTarget('evolve',evolve,{id:'a',playedTurn:2},lookup,-1,{round:3}),true);
assert.equal(legalTarget('evolve',evolve,{id:'b',playedTurn:2},lookup,-1,{round:3}),false,'wrong evolutionary target');
assert.equal(legalTarget('evolve',evolve,{id:'a',playedTurn:3},lookup,-1,{round:3}),false,'cannot evolve Pokémon played this round');
assert.equal(legalTarget('evolve',evolve,{id:'a',playedTurn:2},lookup,-1,{round:2}),false,'once per round');
assert.equal(legalTarget('evolve',{name:"Giovanni's Nidoqueen",evolvesFrom:'Charmander'},{id:'a',playedTurn:3,giovanniEvolveUntil:6},lookup,-1,{round:3,turnSerial:5}),false,'Giovanni cannot bypass species requirements');
assert.equal(legalTarget('attach_energy',{}, {id:'a'},lookup,-1),true);
assert.equal(legalTarget('attach_energy',{}, null,lookup,-1),false);
assert.equal(legalTarget('retreat',{}, {id:'a'},lookup,-1),false);
assert.equal(legalTarget('retreat',{}, {id:'a'},lookup,1),true);
const old=global.document;
function element(tag){return {tag,children:[],attributes:{},textContent:'',className:'',title:'',append(...els){this.children.push(...els);},setAttribute(name,val){this.attributes[name]=val;}};}
try{
 global.document={createElement:element};const node=element('aside');drawPrizes(node,4,2,'RIVAL');
 assert.equal(node.children.length,2);
 assert.equal(node.children[0].children[2].children.filter(x=>!x.className.includes('prize-taken')).length,2);
 assert.equal(node.children[1].children[2].children.filter(x=>!x.className.includes('prize-taken')).length,4);
 assert.ok(!JSON.stringify(node).includes('base1-'), 'Prize card IDs must not be revealed');
} finally {global.document=old;}
assert.equal(handIntent({card:{name:'Switch',supertype:'Trainer'},index:0,canAct:true}).type,'play_trainer','One-click Trainer');
assert.equal(handIntent({card:{name:'Bulbasaur',supertype:'Pokémon',subtypes:['Basic']},index:0,canAct:true}).type,'bench','One-click Basic');
assert.equal(handIntent({card:{name:'Grass Energy',supertype:'Energy'},index:0,canAct:true}).type,'attach_energy','Two-click Energy target');
assert.equal(handIntent({card:{name:'Ivysaur',supertype:'Pokémon',evolvesFrom:'Bulbasaur'},index:0,canAct:true}).type,'evolve','Two-click evolution target');
for(const file of ['online','classic_live']){
 const html=fs.readFileSync(__dirname+'/'+file+'.html','utf8');const js=fs.readFileSync(__dirname+'/'+file+'.js','utf8');
 assert.match(html,/id="prizeRail"/,file+' Prize rail');
 assert.match(html,/class="active-with-attacks"/,file+' attacks next to active');
 assert.match(html,/src="duel_quick_ui\.js"/,file+' shared component');
 assert.match(html,/id="cardPreview"/,file+' card magnifier');
 assert.match(js,/preview\.attach\(b,id\)/,file+' hand previews');
 assert.match(js,/preview\.attach\(b,u\.id,u\)/,file+' played Pokémon previews');
 assert.match(js,/shared\.handIntent\(/,file+' must use shared card intent policy');
 assert.match(js,/send\(command\(intent\.type,intent\.payload\)\)/,file+' must send typed commands selected by shared policy');
 assert.match(js,/setTarget\(intent\.type,intent\.payload,intent\.title\)/,file+' must keep two-click target selection');
 assert.match(js,/function cancelTarget/,file+' cancel');
 assert.match(js,/quick\.drawPrizes/,file+' state-driven prizes');
 assert.match(js,/send\(command\('attack'/,file+' server-approved attacks');
}
console.log('PASS quick duel UI: legal evolution targeting, round restrictions, Prize stacks, preview and accelerated actions for online/local clients');
