'use strict';
// Regression: desktop hides the old decision panel, so setup must be
// confirmable from the visible battle action rail on desktop and mobile.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('classic_live.js','utf8');
const html=fs.readFileSync('classic_live.html','utf8');

function between(start,end){
 const from=js.indexOf(start);
 assert.notEqual(from,-1,'missing source section: '+start);
 const to=js.indexOf(end,from+start.length);
 assert.ok(to>from,'missing source boundary: '+end);
 return js.slice(from,to);
}
assert.match(html,/id="endBtn" class="primary"/,'setup control uses the permanent, visible action rail');
assert.match(html,/classic_live\.js\?v=\d+/,'updated UI must not use cached browser JavaScript');
assert.match(js,/el\.classList\.toggle\('hidden',!d&&!targetMode&&!v\.over&&\(v\.phase==='game'\|\|v\.phase==='setup'\)&&!bonusPrompt\)/,'show bonus decision while still hiding ordinary setup instructions');
assert.doesNotMatch(js,/acts\.append\(btn\('Confirm opening setup'/,'do not leave a second setup button in the popup');
const visibility=between("  // Once bonus cards have been drawn,","  opts.textContent=");
function decisionHidden(phase,d=null,mulliganBonus=null){
 let hidden;
 vm.runInNewContext(visibility,{
  v:{phase,over:false,mulliganBonus},d,targetMode:null,
  el:{classList:{toggle:(name,value)=>{assert.equal(name,'hidden');hidden=value;}}}
 });
 return hidden;
}
assert.equal(decisionHidden('setup'),true,'opening guidance must not become a popup');
assert.equal(decisionHidden('setup',{id:'mulligan'}),false,'real setup decisions must stay visible');
assert.equal(decisionHidden('setup',null,{side:0,max:2,drawn:null}),false,'mulligan bonus must be visible during setup');
assert.equal(decisionHidden('setup',null,{side:0,max:2,drawn:1}),true,'drawn bonuses should leave the field free for Benching');
assert.equal(decisionHidden('game'),true,'no empty guidance panel during the match');


const draw=between("  const openingSetup=v.phase==='setup'&&!v.over;","  $('concedeBtn').disabled=");
function buttonState({phase,active=null,over=false,busy=false,actionsDisabled=false,pendingDecision=null,mulliganBonus=null}){
 const button={textContent:'',title:'',disabled:false};
 vm.runInNewContext(draw,{
  v:{phase,over,pendingDecision,mulliganBonus},
  you:{active},busy,actionsDisabled,
  $:id=>{assert.equal(id,'endBtn');return button;}
 });
 return button;
}
assert.equal(buttonState({phase:'setup'}).disabled,true,'must select an Active first');
assert.match(buttonState({phase:'setup'}).textContent,/Choose Active/);
assert.equal(buttonState({phase:'setup',active:{id:'base1-50'}}).disabled,false,'ready after choosing Active');
assert.match(buttonState({phase:'setup',active:{id:'base1-50'}}).textContent,/Confirm setup/);
assert.equal(buttonState({phase:'setup',active:{id:'base1-50'},busy:true}).disabled,true,'no repeat submit');
assert.equal(buttonState({phase:'setup',active:{id:'base1-50'},pendingDecision:{id:2}}).disabled,true);
assert.match(buttonState({phase:'setup',active:{id:'base1-50'},mulliganBonus:{side:0,max:2,drawn:null}}).textContent,/bonus/,'bonus selection is a separate step');
assert.equal(buttonState({phase:'setup',active:{id:'base1-50'},mulliganBonus:{side:0,max:2,drawn:null}}).disabled,true,'cannot start before choosing bonus');
assert.match(buttonState({phase:'setup',active:{id:'base1-50'},mulliganBonus:{side:0,max:2,drawn:1}}).textContent,/Start duel/,'confirm after bonus draw');
assert.equal(buttonState({phase:'game'}).textContent,'End turn →','setup label must disappear when play begins');
assert.equal(buttonState({phase:'game',actionsDisabled:true}).disabled,true,'normal turn restrictions remain intact');

const listener=between(" $('endBtn').addEventListener('click',()=>{"," $('retreatBtn').addEventListener('click',");
function click({phase,active=null,pendingDecision=null,busy=false,current=true,mulliganBonus=null}){
 let callback,events=[];
 vm.runInNewContext(listener,{
  current:current?{view:{phase,players:[{active}],pendingDecision,mulliganBonus}}:null,
  busy,
  $:id=>{assert.equal(id,'endBtn');return {addEventListener:(name,fn)=>{assert.equal(name,'click');callback=fn;}};},
  command:type=>({type}),
  send:event=>events.push(event.type)
 });
 callback();
 return events;
}
assert.deepEqual(click({phase:'setup',active:{id:'base1-50'}}),['setup_confirm']);
assert.deepEqual(click({phase:'setup',active:{id:'base1-50'},mulliganBonus:{side:0,max:1,drawn:1}}),['setup_bonus_done']);
assert.deepEqual(click({phase:'setup'}),[],'setup cannot be confirmed without Active');
assert.deepEqual(click({phase:'setup',active:{id:'base1-50'},pendingDecision:{id:'x'}}),[]);
assert.deepEqual(click({phase:'setup',active:{id:'base1-50'},busy:true}),[]);
assert.deepEqual(click({phase:'game',active:{id:'base1-50'}}),['end_turn']);
assert.deepEqual(click({phase:'ended'}),[]);
assert.deepEqual(click({phase:'game',current:false}),[]);
console.log('PASS opening setup uses the visible action button and returns to End turn afterwards');
