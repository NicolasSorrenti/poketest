'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const UI=require('./duel_shared_components');

function node(tag='div'){
 const classes=new Set();
 return {tag,children:[],attrs:{},style:{values:{},setProperty(k,v){this.values[k]=v;}},scrollLeft:0,clientWidth:320,innerHTML:'',textContent:'',
  classList:{add(...names){names.forEach(x=>classes.add(x));},remove(...names){names.forEach(x=>classes.delete(x));},contains(name){return classes.has(name);},toggle(name,force){const enable=force===undefined?!classes.has(name):force;enable?classes.add(name):classes.delete(name);return enable;}},
  append(...items){this.children.push(...items);},
  replaceChildren(...items){this.children=[...items];this.innerHTML='';this.textContent='';},
  setAttribute(name,value){this.attrs[name]=String(value);},
  addEventListener(name,callback){this['on'+name]=callback;}
 };
}
const previousDocument=global.document;
global.document={createElement:node};
const button=(label,fn,style,disabled)=>{const b=node('button');b.textContent=label;b.onClick=fn;b.className=style;b.disabled=disabled;return b;};
try{
 const hand=node(),pic=id=>'/cards/'+id+'.png';
 UI.renderHandPeek({root:hand,ids:['abc','def','ghi','jkl'],picture:pic});
 assert.equal(hand.children.length,3);
 assert.equal(hand.children[0].children[0].src,'/cards/abc.png');
 UI.renderHandPeek({root:hand,ids:[],picture:pic});
 assert.equal(hand.children[0].textContent,'Empty');
 UI.renderHandPeek({root:hand,ids:['secret'],picture:pic,hidden:true});
 assert.equal(hand.textContent,'Hidden');
 assert.equal(hand.children.length,0,'Spectator peek must not expose cards');

 const fan=node();let clicks=0;
 const makeCard=()=>{const b=node('button');b.classList.add('handcard');b.onClick=()=>clicks++;return b;};
 UI.renderHandFan({root:fan,ids:['a','b','c','d'],visible:true,phase:'game',selectedHand:1,targetMode:{type:'attach_energy'},makeCard,getCard:id=>({name:id}),viewportWidth:400});
 assert.equal(fan.children.length,1);
 assert.equal(fan.children[0].children.length,4,'All hand cards must be visible in fan');
 assert.equal(fan.children[0].children[0].classList.contains('hand-inactive'),true);
 assert.equal(fan.children[0].children[1].classList.contains('hand-inactive'),false);
 assert.equal(fan.children[0].children[3].classList.contains('hand-fan-card'),true);
 fan.children[0].children[1].onClick();assert.equal(clicks,1,'Original click handler preserved');
 UI.renderHandFan({root:fan,ids:['a','b','c','d'],visible:false,phase:'game',makeCard,getCard:id=>({name:id}),viewportWidth:400});
 assert.equal(fan.children.length,0,'Closing the hand removes its old cards');
 assert.equal(fan.classList.contains('hidden'),true);
 UI.renderHandFan({root:fan,ids:['a','b','c','d'],visible:true,phase:'game',makeCard,getCard:id=>({name:id}),viewportWidth:400});
 assert.equal(fan.children[0].children.length,4,'Reopening the hand must recreate cards without a state refresh');
 assert.equal(fan.classList.contains('hidden'),false);
 UI.renderHandFan({root:fan,ids:[],visible:true,phase:'game',makeCard,getCard:id=>({name:id}),viewportWidth:400});
 assert.equal(fan.classList.contains('hidden'),true);

 const basic={name:'Bulbasaur',supertype:'Pokémon',subtypes:['Basic']};
 const energy={name:'Grass Energy',supertype:'Energy'};
 const evolution={name:'Ivysaur',supertype:'Pokémon',evolvesFrom:'Bulbasaur'};
 assert.deepEqual(UI.handIntent({card:basic,index:3,setup:true}),{kind:'command',type:'setup_select',payload:{handIndex:3}});
 assert.equal(UI.handIntent({card:basic,index:3,setup:true,setupConfirmed:true}).kind,'none');
 assert.equal(UI.handIntent({card:energy,index:0,setup:true}).kind,'inspect');
 assert.equal(UI.handIntent({card:energy,index:1,canAct:false}).kind,'inspect','Cannot play while observing');
 assert.equal(UI.handIntent({card:energy,index:1,canAct:true,energyUsed:true}).kind,'error');
 assert.deepEqual(UI.handIntent({card:{name:'Switch',supertype:'Trainer'},index:2,canAct:true}),{kind:'command',type:'play_trainer',payload:{handIndex:2}});
 assert.equal(UI.handIntent({card:basic,index:0,canAct:true}).type,'bench');
 assert.equal(UI.handIntent({card:energy,index:0,canAct:true}).type,'attach_energy');
 assert.equal(UI.handIntent({card:evolution,index:0,canAct:true}).type,'evolve');
 assert.equal(UI.handIntent({card:energy,index:1,canAct:true,selectedHand:1,targetMode:{type:'attach_energy'}}).kind,'cancel');
 assert.equal(UI.handIntent({card:{name:'Other',supertype:'Pokémon'},index:0,canAct:true}).kind,'select');
 const handFace=UI.handCardFace({card:{name:'Pikachu <script>'},source:'/image?x="onerror="',handType:'Basic Pokémon'});
 assert.match(handFace,/Pikachu &lt;script&gt;/);assert.doesNotMatch(handFace,/<script>/);
 const zone=node();
 UI.renderZone({root:zone,team:{active:{id:'active'},bench:[{id:'left'},{id:'right'}]},active:true,createPokemon:unit=>{const el=node();el.textContent=unit.id;return el;}});
 assert.equal(zone.children[0].textContent,'active');
 UI.renderZone({root:zone,team:{active:{id:'active'},bench:[{id:'left'},{id:'right'}]},active:false,createPokemon:unit=>{const el=node();el.textContent=unit.id;return el;}});
 assert.deepEqual(zone.children.map(x=>x.textContent),['left','right']);
 UI.renderZone({root:zone,team:{active:null,bench:[]},active:false,createPokemon:()=>node()});
 assert.equal(zone.children[0].textContent,'Empty Bench');
 UI.renderZone({root:zone,team:{active:null,bench:[]},active:true,createPokemon:()=>node()});
 assert.equal(zone.children[0].textContent,'Not selected');
 
 const ownStadium=node(),enemyStadium=node();
 let inspectedStadium=null,attachedStadiums=0;
 const renderStadium=(stadium,me=0)=>UI.renderStadium({
  mine:ownStadium,theirs:enemyStadium,stadium,me,
  getCard:()=>({name:'Sprout Tower'}),picture:id=>'https://cards.example/'+id+'.png',
  onInspect:id=>{inspectedStadium=id;},onHover:()=>{attachedStadiums++;}
 });
 renderStadium({id:'neo1-105',owner:1});
 assert.equal(ownStadium.hidden,true,'Own slot stays empty for opposing Stadium');
 assert.equal(enemyStadium.hidden,false,'Opponent Stadium appears on opponent mat');
 assert.equal(enemyStadium.children[0].children[0].src,'https://cards.example/neo1-105.png');
 enemyStadium.children[0].onclick();
 assert.equal(inspectedStadium,'neo1-105','Stadium card can be inspected');
 const preserved=enemyStadium.children[0];
 renderStadium({id:'neo1-105',owner:1});
 assert.equal(enemyStadium.children[0],preserved,'Unchanged Stadium should not flicker');
 assert.equal(attachedStadiums,1,'Preview handlers should not stack');
 renderStadium({id:'neo2-105',owner:0});
 assert.equal(enemyStadium.hidden,true,'Replaced opposing Stadium disappears');
 assert.equal(ownStadium.children[0].children[0].src,'https://cards.example/neo2-105.png','Replacement follows its owner');
 renderStadium(null);
 assert.equal(ownStadium.children.length,0,'Discarded Stadium clears its slot');
 assert.equal(ownStadium.hidden,true);
 renderStadium({id:'neo4-99',owner:1},1);
 assert.equal(ownStadium.hidden,false,'Online side 1 sees their own Stadium on their half');
 assert.equal(enemyStadium.hidden,true);

 const face=UI.pokemonFace({unit:{energies:['grass'],damage:10},card:{name:'Test <Pokémon>'},source:'x" onerror="alert(1)',energyStack:()=>'<span>Energy</span>',vitals:()=>'<b>HP</b>'});
 assert.match(face,/Energy/);assert.match(face,/HP/);assert.match(face,/1 energy attached/);
 assert.doesNotMatch(face,/<Pokémon>/);assert.doesNotMatch(face,/src="x" onerror=/);

 const attackRoot=node();let chosen=null;
 const unit={id:'a',effectiveAttacks:[{name:'Flame <Thrower>',cost:['Fire','Colorless'],damage:'50'}]};
 UI.renderAttacks({root:attackRoot,unit,view:{phase:'game'},me:0,getCard:()=>({}),enabled:true,button,onAttack:i=>chosen=i,attackReason:()=>null});
 assert.equal(attackRoot.children.length,1);
 assert.match(attackRoot.children[0].innerHTML,/Flame &lt;Thrower&gt;/);
 attackRoot.children[0].onClick();assert.equal(chosen,0);
 UI.renderAttacks({root:attackRoot,unit:null,view:{},me:0,getCard:()=>({}),enabled:false,button,onAttack:()=>{},attackReason:()=>null});
 assert.match(attackRoot.innerHTML,/Choose an Active Pokémon/);

 const option={kind:'prize-card',options:[{id:'prize:0'},{id:'prize:2'}]};
 const grids=[node(),node()];
 const groups=grids.map(grid=>({classList:node().classList,querySelector:()=>grid}));
 const rail={querySelectorAll:()=>groups},dialog=node();
 let selected=null;
 UI.renderPrizeRail({rail,decision:option,busy:false,button,choose:id=>selected=id});
 assert.equal(grids[1].children.length,6);
 assert.match(grids[1].children[1].className,/prize-taken/);
 grids[1].children[2].onClick();assert.equal(selected,'prize:2');
 UI.renderPrizeFallback({container:dialog,decision:option,busy:false,button,choose:id=>selected=id});
 assert.equal(dialog.children[2].children.length,2);
 for(let i=0;i<6;i++)grids[0].append(node()); // quick.drawPrizes fills both rails in production.
 const faceUpView={players:[{revealedPrizes:[{index:0,id:'enemy'}]},{revealedPrizes:[{index:2,id:'mine'}]}]};
 UI.renderFaceUpPrizes({rail,view:faceUpView,me:1,getCard:id=>({name:id})});
 assert.equal(grids[0].children[0].textContent,'enemy','Opposite seat reveals to top Prize rail');
 assert.equal(grids[1].children[2].textContent,'mine','Local seat reveals to lower Prize rail');
 assert.deepEqual(UI.prizeOptions({options:[{id:'prize:6'},{id:'prize:2'},{id:'other'}]}),[{id:'prize:2',index:2}]);

 const classic=fs.readFileSync(__dirname+'/classic_live.js','utf8');
 const online=fs.readFileSync(__dirname+'/online.js','utf8');
 for(const [mode,client] of [['solo',classic],['multiplayer',online]]){
  for(const method of ['renderHandPeek','renderHandFan','handIntent','handCardFace','renderZone','renderStadium','pokemonFace','renderAttacks','renderFaceUpPrizes','renderPrizeRail','renderPrizeFallback'])
   assert.ok(client.includes('shared.'+method),mode+' must use common '+method);
  assert.doesNotMatch(client,/b\.innerHTML=quick\.energyStack/,'Pokémon visuals must not diverge');
 }
 for(const page of ['classic_live.html','online.html']){
  const html=fs.readFileSync(__dirname+'/'+page,'utf8');
  assert.match(html,/src="duel_shared_components\.js(?:\?v=\d+)?"/,page+' must load shared module');
  assert.ok(html.indexOf('duel_shared_components.js')<html.indexOf(page==='online.html'?'online.js':'classic_live.js'),'Common UI must load before client');
 }
 const server=fs.readFileSync(__dirname+'/server.js','utf8');
 assert.ok(server.includes("'duel_shared_components.js'"),'HTTP allowlist must expose common UI script');
 const cube=fs.readFileSync(__dirname+'/cube_service.js','utf8');
 const room=fs.readFileSync(__dirname+'/cube_room_service.js','utf8');
 const rpg=fs.readFileSync(__dirname+'/rpg.js','utf8');
 assert.match(cube,/classic\.createCube\(/,'Solo Cube should reuse Classic duel');
 assert.match(room,/online\.createCubeMatch\(/,'Multiplayer Cube should reuse online duel');
 assert.match(room,/classic\.createCube\(/,'CPU seat in multiplayer Cube should reuse Classic duel');
 assert.match(rpg,/\/classic_live\.html\?rpg=1/,'RPG should continue using Classic duel');
 console.log('PASS shared battle components: DOM behavior, private spectators, target callbacks, and all mode integrations');
}finally{global.document=previousDocument;}
