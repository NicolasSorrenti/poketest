'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const I=require('../rpg_event_invites');
const base=()=>({day:12,slot:1,location:'shop',relationships:{hana:{affection:1,trust:0},reina:{affection:2,trust:1}},appointments:[]});
const me=(state,id,extras={})=>I.choose(state,id,{present:['hana','reina','yuna','elio'],...extras});
test('only a currently present NPC with an actually eligible event can invite the player',()=>{
 const s=base();
 assert.equal(me(s,'hana'),null);
 assert.equal(I.choose(s,'hana',{present:[],stories:[{id:'hana_route_1',npc:'hana'}]}),null);
 assert.equal(me({...s,pendingDuel:{id:'x'}},'hana',{stories:[{id:'hana_route_1',npc:'hana'}]}),null);
 assert.equal(me({...s,activeStory:{id:'x'}},'hana',{stories:[{id:'hana_route_1',npc:'hana'}]}),null);
 const valid=me(s,'hana',{stories:[{id:'hana_route_1',npc:'hana',end:18}]});
 assert.deepEqual(valid,{kind:'story',id:'hana_route_1',npc:'hana',urgent:false});
});
test('a bookable appointment takes precedence, but blocked or mismatched plans never trigger',()=>{
 const s=base(),plan={id:8,npc:'hana',status:'booked',day:12,slot:1,place:'shop',socialTone:'romantic'};
 const stories=[{id:'hana_route_1',npc:'hana',end:18}];
 const appointment=me(s,'hana',{appointments:[plan],stories});
 assert.equal(appointment.kind,'appointment');
 assert.equal(appointment.id,'8');
 assert.equal(appointment.tone,'romantic');
 assert.equal(me(s,'hana',{appointments:[plan],canAttend:()=> 'Not enough focus',stories}).kind,'story');
 assert.equal(me(s,'hana',{appointments:[{...plan,slot:2}],stories}).kind,'story');
 assert.equal(me(s,'hana',{appointments:[{...plan,place:'cafe'}]}),null);
});
test('unique story, side quest, rivalry, situation and encounter invitations use real event ids',()=>{
 const s=base();
 assert.deepEqual(me(s,'elio',{sidequests:[{quest:{id:'borrowed_deck'},stage:{npc:'elio',end:18}}]}),
  {kind:'sidequest',id:'borrowed_deck',npc:'elio',urgent:false});
 assert.equal(me(s,'reina',{arcs:[{id:'reina_rival_training',end:12}]}).kind,'arc');
 assert.equal(me(s,'hana',{situations:[{id:'hana_apron_mixup',npc:'hana'}]}).kind,'situation');
 assert.equal(me(s,'hana',{encounters:[{id:'lost_deck',npc:'hana',end:12}]}).kind,'encounter');
 assert.equal(me(s,'hana',{encounters:[{id:'lost_deck',npc:'reina'}]}),null);
});
test('every supported character has a distinct voice and no raw relationship score is disclosed',()=>{
 const names=['hana','reina','shiori','yuna','akari','camila','marina','kaede','elena','jinx','luna','rina','sierra','sol','alma','elio','nereo'];
 for(const id of names){
  assert.ok(I.voice[id],id);
  for(const category of ['wait','ask','unexpected'])assert.equal(I.voice[id][category].length,2);
 }
 const p={kind:'story',id:'hana_route_1',npc:'hana'};
 const reserved=I.dialogue(base(),p),warm=I.dialogue({...base(),relationships:{hana:{affection:8}}},p);
 assert.notEqual(reserved.lines[0].text,warm.lines[0].text);
 assert.notEqual(I.dialogue(base(),{...p,npc:'reina'}).lines[0].text,reserved.lines[0].text);
 for(const line of warm.lines)assert.doesNotMatch(line.text,/affection|trust|\+\d+|chapter \d+/i);
 assert.equal(reserved.lines.length,3);
 assert.deepEqual(reserved.lines.map(x=>x.speaker),['hana','Protagonist','hana']);
 assert.deepEqual(reserved.choices.map(x=>x[1]),
  ['eventInvite:story:hana_route_1','eventChat:hana','close']);
});
test('urgency and a previously agreed romantic date are treated differently from ordinary events',()=>{
 const s=base();
 const story=I.dialogue(s,{kind:'story',id:'x',npc:'hana',urgent:true});
 assert.match(story.lines[2].text,/today/);
 const planned=I.dialogue({...s,partner:'hana'},{
  kind:'appointment',id:'3',npc:'hana',tone:'romantic'});
 assert.match(planned.lines[2].text,/our own little corner/);
 const newRelationship=I.dialogue(s,{kind:'appointment',id:'3',npc:'hana',tone:'romantic'});
 assert.doesNotMatch(newRelationship.lines[2].text,/our own little corner/);
});
test('viewing invitations leaves all gameplay progression unchanged',()=>{
 const state=base(),old=JSON.stringify(state);
 const invite=me(state,'hana',{stories:[{id:'hana_route_1',npc:'hana'}]});
 I.dialogue(state,invite);
 assert.equal(JSON.stringify(state),old);
});
