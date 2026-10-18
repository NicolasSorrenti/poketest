'use strict';
const PAIRS=Object.freeze([[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]].map(a=>Object.freeze(a)));
function makeSchedule(){return PAIRS.map((seats,i)=>({id:i+1,seats:[...seats],winner:null,method:null,status:'pending',attempts:0}));}
function standings(matches,names){
 const records=names.map((name,seat)=>{
  const played=matches.filter(m=>m.status==='complete'&&m.seats.includes(seat));
  const wins=played.filter(m=>m.winner===seat).length;
  return {seat,name,played:played.length,wins,losses:played.length-wins,points:wins*3};
 });
 // Head-to-head breaks a two-player tie only. Using pairwise head-to-head in
 // three-way ties produces a non-transitive order (rock/paper/scissors).
 const groups=new Map();
 for(const r of records){if(!groups.has(r.points))groups.set(r.points,[]);groups.get(r.points).push(r);}
 const sorted=[...groups.entries()].sort((a,b)=>b[0]-a[0]).flatMap(([,group])=>{
  if(group.length===2){
   const game=matches.find(m=>m.status==='complete'&&group.every(x=>m.seats.includes(x.seat)));
   if(game)return [...group].sort((a,b)=>a.seat===game.winner?-1:b.seat===game.winner?1:a.seat-b.seat);
  }
  return group.sort((a,b)=>a.seat-b.seat);
 });
 return sorted.map((row,i)=>({...row,rank:i+1}));
}
module.exports={PAIRS,makeSchedule,standings};
