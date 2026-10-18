'use strict';
/* Optional daily priorities. This module owns only campaign pacing and rewards:
   it never changes the historical TCG reducer or authored NPC/story data. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgIntentions=api;
})(typeof window!=='undefined'?window:null,function(){
 const goals=Object.freeze([
  Object.freeze({id:'social',title:'Make time for someone',detail:'Spend time together, keep a meet-up, or finish a personal story or side-quest conversation.',rewardLabel:'+5 focus · +1 insight'}),
  Object.freeze({id:'duel',title:'Play a meaningful match',detail:'Finish one real NPC duel. Wins, draws and losses all count.',rewardLabel:'+10 credits · +1 duel preparation'}),
  Object.freeze({id:'town',title:'Be part of the neighborhood',detail:'Finish a town-life activity or a local encounter.',rewardLabel:'+8 credits · +2 reputation'})
 ]);
 const accepted=Object.freeze({
  social:['hangout','appointment','story','sideQuest','arc'],
  duel:['duel'],
  town:['activity','encounter']
 });
 const rewards=Object.freeze({
  social:{focus:5,insight:1},
  duel:{credits:10,preparation:1},
  town:{credits:8,reputation:2}
 });
 const limits={focus:100,insight:99,credits:999999,preparation:3,reputation:100};
 function hydrate(state){
  if(!state||typeof state!=='object')throw Error('Invalid campaign state');
  if(!Number.isInteger(state.intentionsCompleted)||state.intentionsCompleted<0)state.intentionsCompleted=0;
  state.intentionsCompleted=Math.min(90,state.intentionsCompleted);
  const p=state.dailyIntention;
  if(!p||typeof p!=='object'||Array.isArray(p)||p.day!==state.day
    ||!goals.some(g=>g.id===p.id)||typeof p.completed!=='boolean'
    ||(p.completed&&(!Number.isInteger(p.completedSlot)||p.completedSlot<0||p.completedSlot>2))){
   state.dailyIntention=null;
  }
  return state;
 }
 function status(state){
  hydrate(state);
  const selected=state.dailyIntention;
  return {selected:selected?goals.find(g=>g.id===selected.id):null,completed:!!selected?.completed,chosen:!!selected,completedCount:state.intentionsCompleted};
 }
 function choose(state,id){
  hydrate(state);
  if(!Number.isInteger(state.day)||state.day<1||state.day>90)throw Error('The season is over');
  if(state.dailyIntention)throw Error('Today’s priority is already chosen');
  const goal=goals.find(x=>x.id===id);
  if(!goal)throw Error('Unknown daily priority');
  state.dailyIntention={day:state.day,id,completed:false};
  return goal;
 }
 function record(state,event){
  hydrate(state);
  const p=state.dailyIntention;
  if(!p||p.completed||!accepted[p.id].includes(event)||state.day>90)return null;
  p.completed=true;p.completedSlot=state.slot;
  for(const [key,amount] of Object.entries(rewards[p.id])){
   const previous=Number.isFinite(state[key])?state[key]:0;
   state[key]=Math.min(limits[key],Math.max(0,previous+amount));
  }
  state.intentionsCompleted=Math.min(90,state.intentionsCompleted+1);
  const goal=goals.find(x=>x.id===p.id);
  return {id:p.id,title:goal.title,rewardLabel:goal.rewardLabel};
 }
 return Object.freeze({goals,hydrate,status,choose,record});
});
