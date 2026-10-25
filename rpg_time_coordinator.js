'use strict';
// Pure RPG clock and appointment arbitration. Never modifies rewards or save data.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgTimeCoordinator=api;
})(typeof window!=='undefined'?window:null,function(){
 const validPeriod=n=>Number.isInteger(n)&&n>0&&n<=270;
 const stamp=(day,slot)=>(day-1)*3+slot;
 function assertClock(state,periods){
  if(!state||!Number.isInteger(state.day)||state.day<1||state.day>90||
   !Number.isInteger(state.slot)||state.slot<0||state.slot>2||
   !validPeriod(periods))throw Error('Invalid campaign time transition');
 }
 function conflicts(state,periods=1){
  assertClock(state,periods);
  const start=stamp(state.day,state.slot),end=start+periods;
  return (Array.isArray(state.appointments)?state.appointments:[])
   .filter(e=>e&&e.status==='booked'&&Number.isInteger(e.day)&&e.day>=1&&e.day<=90&&
    Number.isInteger(e.slot)&&e.slot>=0&&e.slot<=2&&stamp(e.day,e.slot)>=start&&stamp(e.day,e.slot)<end)
   .sort((a,b)=>stamp(a.day,a.slot)-stamp(b.day,a.slot)||a.id-b.id);
 }
 function dueNow(state){
  if(!state||!Number.isInteger(state.day)||!Number.isInteger(state.slot))return [];
  return (Array.isArray(state.appointments)?state.appointments:[])
   .filter(e=>e?.status==='booked'&&e.day===state.day&&e.slot===state.slot);
 }
 function advanceClock(state,periods=1){
  assertClock(state,periods);
  const old={day:state.day,slot:state.slot};
  const total=stamp(state.day,state.slot)+periods;
  state.day=Math.min(91,Math.floor(total/3)+1);
  state.slot=state.day>90?0:total%3;
  if(state.day>90)state.ended=true;
  return {from:old,to:{day:state.day,slot:state.slot},days:state.day-old.day};
 }
 return Object.freeze({stamp,conflicts,dueNow,advanceClock});
});
