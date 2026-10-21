'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Bridge=require('../rpg_duel_bridge');

function campaign(day=1){
 return {day,credits:80,points:0,results:[],pendingDuel:null,eventsDone:{},
  bonds:{hana:{duels:0,trust:0},reina:{duels:0,trust:0}},
  relationships:{hana:{duels:0,trust:0,respect:0},reina:{duels:0,trust:0,respect:0}}};
}
function finish(state,id,options={}){
 const {winner=0,day=state.day,npc='hana',...special}=options;
 const duel={id,npc,day,...special};
 state.day=day;state.pendingDuel=duel;
 const start=state.credits;
 const receipt=Bridge.settle(state,duel,winner,npc);
 state.pendingDuel=null;
 assert.ok(receipt);
 assert.equal(state.credits-start,receipt.credits);
 return receipt;
}
test('first two ordinary wins per week grant 15 credits, subsequent wins grant 8 across all opponents',()=>{
 const s=campaign();
 const a=finish(s,'a'),b=finish(s,'b',{npc:'reina'}),c=finish(s,'c');
 assert.deepEqual([a.credits,b.credits,c.credits],[15,15,8]);
 assert.equal(s.credits,118);
 assert.equal(s.points,9);
 assert.equal(s.bonds.hana.trust,4);
 assert.equal(s.bonds.reina.trust,2);
 assert.equal(s.results.filter(r=>r.ordinaryCreditWin===true).length,3);
 assert.match(c.notes.join(' '),/Routine win reward/);
});
test('losses and draws keep 5 credits and do not consume weekly full-credit victories',()=>{
 const s=campaign();
 assert.equal(finish(s,'lose',{winner:1}).credits,5);
 assert.equal(finish(s,'draw',{winner:null}).credits,5);
 assert.equal(finish(s,'one').credits,15);
 assert.equal(finish(s,'two').credits,15);
 assert.equal(finish(s,'three').credits,8);
 assert.equal(s.results.filter(x=>x.ordinaryCreditWin).length,3);
});
test('exhibitions, story, relationship and all competitive duels retain full credit payout',()=>{
 const s=campaign();
 const exemptions=[
  {eventKey:'1:exhibition',eventTitle:'Exhibition',eventReward:7},
  {arcEpisode:'arc'},
  {sideQuestId:'quest'},
  {bondChallenge:true},
  {tournamentId:'neighborhood'},
  {competitiveKind:'daily'},
  {competitiveKind:'local'}
 ];
 for(let i=0;i<exemptions.length;i++){
  assert.equal(finish(s,'special-'+i,exemptions[i]).credits,15);
  assert.equal(s.results.at(-1).ordinaryCreditWin,undefined);
 }
 assert.equal(finish(s,'ordinary-1').credits,15);
 assert.equal(finish(s,'ordinary-2').credits,15);
 assert.equal(finish(s,'ordinary-3').credits,8);
 assert.equal(finish(s,'post-cap-tournament',{tournamentId:'regional'}).credits,15);
});
test('weekly cap resets on day 8 and persists across JSON save/load without double payments',()=>{
 let s=campaign(7);
 assert.equal(finish(s,'first').credits,15);
 assert.equal(finish(s,'second').credits,15);
 s=JSON.parse(JSON.stringify(s));
 const repeated={id:'second',npc:'hana',day:7};s.pendingDuel=repeated;
 const credits=s.credits,results=s.results.length;
 assert.equal(Bridge.settle(s,repeated,0,'Hana'),null);
 assert.equal(s.credits,credits);
 assert.equal(s.results.length,results);
 s.pendingDuel=null;
 assert.equal(finish(s,'third',{day:7}).credits,8);
 assert.equal(finish(s,'new-week',{day:8}).credits,15);
});
test('legacy saves remain valid without assuming previous matches were ordinary',()=>{
 const s=campaign(8);
 s.results=[{id:'legacy-a',npc:'hana',won:true,day:8},{id:'legacy-b',npc:'reina',won:true,day:8}];
 assert.equal(finish(s,'a').credits,15);
 assert.equal(finish(s,'b').credits,15);
 assert.equal(finish(s,'c').credits,8);
});
