'use strict';
const assert=require('node:assert/strict');
const TOURNAMENTS=require('./rpg_tournaments');
const {matchModel,bracketModel,celebrationModel,createPresenter}=require('./rpg_tournament_presentation');
const VICTORY=require('./rpg_victory_presentation');
const cast={
 hana:{name:'Hana Mizuno'},yuna:{name:'Yuna Hoshino'},
 reina:{name:'Reina Kurogane',portrait:'/rpg-assets/characters/reina/portraits/primary.png'},
 marina:{name:'Marina Aoki'},akari:{name:'Akari Fujimoto'},camila:{name:'Camila Vega'},
 kaede:{name:'Kaede Arashi'},shiori:{name:'Shiori Tsukishima'}
};
const cup=TOURNAMENTS.cups[0],newState=()=>({day:30,slot:0,location:'center',points:0,credits:0,tournaments:{},pendingDuel:null});
const ordinary=matchModel({npc:'reina'},{cast,cups:TOURNAMENTS.cups});
assert.equal(ordinary,null,'friendly matches should not get a long splash');
assert.equal(matchModel({npc:'reina',competitiveKind:'daily'},{cast,cups:TOURNAMENTS.cups}),null,'routine daily practice stays fast');
assert.equal(matchModel({npc:'wrong',tournamentId:'neighborhood'},{cast,cups:TOURNAMENTS.cups}),null);
const intro=matchModel({npc:'reina',tournamentId:'neighborhood',tournamentRound:2},{cast,cups:TOURNAMENTS.cups});
assert.equal(intro.kind,'official');
assert.equal(intro.isFinal,true);
assert.equal(intro.round,'ROUND 3 / 3');
assert.equal(intro.opponent,'Reina Kurogane');
const local=matchModel({npc:'reina',competitiveKind:'local',competitiveRound:1},{cast,cups:TOURNAMENTS.cups});
assert.equal(local.kind,'local');
assert.equal(local.round,'ROUND 2 / 2');
assert.equal(local.isFinal,true);
const s=newState();
let displayed=bracketModel(cup,TOURNAMENTS.status(s,'neighborhood'),s.day,cast);
assert.equal(displayed.headline,'ROUND 1 / 3');
assert.deepEqual(displayed.rows.map(r=>r.opponent),['Hana Mizuno','Yuna Hoshino','Reina Kurogane']);
assert.equal(displayed.rows[0].label,'NEXT UP');
for(let index=0;index<3;index++){
 const started=TOURNAMENTS.begin(s,'neighborhood');
 const duel={...started,id:'match-'+index};
 const receipt={outcome:'Victory',duelId:duel.id};
 const actual=TOURNAMENTS.settle(s,duel,receipt);
 assert.equal(actual.won,true);
 assert.equal(TOURNAMENTS.settle(s,duel,receipt),null,'one duel can advance the bracket only once');
 displayed=bracketModel(cup,TOURNAMENTS.status(s,'neighborhood'),s.day,cast);
 assert.equal(displayed.completed,index+1);
 assert.equal(displayed.rows[index].label,'CLEARED');
 const celebrate=celebrationModel({duel,cupOutcome:actual,receipt});
 assert.equal(celebrate.kind,index===2?'champion':'round');
 assert.equal(celebrate.title,index===2?'TOURNAMENT CHAMPION!':'ROUND CLEARED!');
 if(index===2){
  const outcome=VICTORY.model({outcome:'Victory',name:'Reina',points:35,credits:75,trust:2},{presentation:celebrate,hasBooster:true});
  assert.equal(outcome.title,'TOURNAMENT CHAMPION!');
  assert.equal(outcome.competition,'champion');
  assert.equal(outcome.competitionTitle,'Neighborhood Cup');
  assert.equal(outcome.action,'CLAIM BOOSTER →');
  const defeat=VICTORY.model({outcome:'Defeat'},{presentation:celebrate});
  assert.equal(defeat.title,'DUEL COMPLETE','never call a lost duel a championship victory');
 }
}
assert.equal(s.tournaments.neighborhood.state,'champion');
assert.equal(displayed.headline,'🏆 CHAMPION');
assert.equal(displayed.rows[2].label,'CLEARED');
const sDraw=newState(),first=TOURNAMENTS.begin(sDraw,'neighborhood');
const drawDuel={...first,id:'draw-1'},draw={outcome:'Draw',duelId:drawDuel.id};
assert.equal(TOURNAMENTS.settle(sDraw,drawDuel,draw).draw,true);
const drawModel=bracketModel(cup,TOURNAMENTS.status(sDraw,'neighborhood'),sDraw.day,cast);
assert.equal(drawModel.rows[0].label,'REPLAY');
assert.equal(celebrationModel({duel:drawDuel,cupOutcome:{won:true,state:'champion'},receipt:draw}),null);
const sLost=newState(),lostFirst=TOURNAMENTS.begin(sLost,'neighborhood');
TOURNAMENTS.settle(sLost,{...lostFirst,id:'lost-1'},{outcome:'Defeat',duelId:'lost-1'});
assert.equal(bracketModel(cup,TOURNAMENTS.status(sLost,'neighborhood'),sLost.day,cast).rows[0].label,'ELIMINATED');
const future=bracketModel(TOURNAMENTS.cups[2],TOURNAMENTS.status({day:1,tournaments:{}},'championship'),1,cast);
assert.equal(future.headline,'OPENS DAY 88');
assert.equal(celebrationModel({duel:{competitiveKind:'local'},competitiveOutcome:{won:true,champion:true,title:'Saturday Local'},receipt:{outcome:'Victory'}}).title,'LOCAL CHAMPION!');
assert.equal(celebrationModel({duel:{competitiveKind:'daily'},competitiveOutcome:{won:true,champion:false},receipt:{outcome:'Victory'}}),null);

const timers=new Map(),elements=[];let nextId=0;
function makeNode(tag){
 return {
  tag,children:[],attributes:{},className:'',style:{},textContent:'',alt:'',src:'',
  setAttribute(k,v){this.attributes[k]=v;},
  append(...nodes){this.children.push(...nodes);},
  remove(){this.removed=true;const i=elements.indexOf(this);if(i>=0)elements.splice(i,1);}
 };
}
const stage=createPresenter({
 document:{body:{append(el){elements.push(el)}},createElement:makeNode},
 window:{matchMedia:()=>({matches:false})},
 schedule(fn,ms){const id=++nextId;timers.set(id,{fn:()=>{timers.delete(id);fn()},ms});return id;},
 cancel(id){timers.delete(id);}
});
assert.equal(stage.show(null),false);
assert.equal(stage.show(intro),true);
assert.equal(stage.active,true);
assert.equal(elements.length,1);
assert.equal(timers.values().next().value.ms,880);
assert.match(elements[0].attributes['aria-label'],/ROUND 3/);
const previous=elements[0];
assert.equal(stage.show(local),true);
assert.equal(previous.removed,true,'new versus cancels previous overlay');
assert.equal(timers.size,1);
timers.values().next().value.fn();
assert.equal(stage.active,false);
assert.equal(elements.length,0);
assert.equal(timers.size,0);
stage.clear();
const reduced=createPresenter({document:{body:{append(el){elements.push(el)}},createElement:makeNode},
 window:{matchMedia:()=>({matches:true})},schedule(fn,ms){assert.equal(ms,170);return ++nextId;},cancel(){}});
assert.equal(reduced.show(intro),true);reduced.clear();
console.log('Tournament presentation: live bracket progression, draws, elimination, championship result, versus lifecycle and reduced motion passed.');
