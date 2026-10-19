'use strict';
/* End-of-season, multi-run gallery and spoiler-safe replay guidance.
 * Pure projections: no RPG reducer writes, rewards, or retroactive unlocks. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgSeasonJourney=api;
})(typeof window!=='undefined'?window:null,function(){
 const labels={profile:'First meetings',pre_duel:'Before duels',social:'Social memories',special:'Unexpected moments'};
 const number=v=>Number.isFinite(v)?Math.max(0,Math.floor(v)):0;
 function gallerySummary(state,cg){
  const entries=cg.gallery({...state,cgUnlocked:{...(state?.cgUnlocked||{})},cgViewed:{...(state?.cgViewed||{})}});
  const byCategory=Object.fromEntries(Object.keys(labels).map(category=>[category,{label:labels[category],total:0,unlocked:0,viewed:0}]));
  const byCharacter={};
  let unlocked=0,viewed=0;
  for(const entry of entries){
   const part=byCategory[entry.category],who=byCharacter[entry.character]||(byCharacter[entry.character]={total:0,unlocked:0});
   part.total++;who.total++;
   if(entry.unlocked){unlocked++;part.unlocked++;who.unlocked++}
   if(entry.unlocked&&entry.viewed){viewed++;part.viewed++}
  }
  return {total:entries.length,unlocked,viewed,remaining:entries.length-unlocked,percent:entries.length?Math.round(100*unlocked/entries.length):0,byCategory,byCharacter};
 }
 function currentRun(state,cg){
  const gallery=gallerySummary(state,cg),done=Object.values(state?.situationDone||{}).filter(v=>v&&Number.isInteger(v.day)).length;
  const chapters=Object.keys(state?.storyDone||{}).filter(k=>state.storyDone[k]).length;
  const sidequests=Object.values(state?.sideQuests||{}).filter(x=>x?.status==='complete').length;
  const appointments=Object.values(state?.appointments||{}).filter(x=>x?.status==='attended').length;
  const out=Object.entries(state?.relationships||{}).filter(([_,r])=>r&&((r.affection||0)>0||(r.trust||0)>0||(r.respect||0)>0));
  return {day:Math.min(90,Math.max(1,number(state?.day)||1)),run:number(state?.ngPlus)+1,
   conversations:chapters,sidequests,appointments,situations:done,
   peopleKnown:out.length,gallery};
 }
 function milestones(state,cg){
  const x=currentRun(state,cg),result=[];
  // Broad season-level progress only; never reveal unearned plot beats.
  if(state.day>90||state.ended===true)result.push({id:'complete',title:'Your season is complete',detail:'Review your final report, revisit collected memories, or begin a fresh New Game+ season.',done:true});
  else if(x.day<31)result.push({id:'first',title:'Find your footing',detail:'Explore locations, meet trainers and prepare your first official cup.',done:x.day>=30});
  else if(x.day<61)result.push({id:'middle',title:'Make your mark',detail:'Follow personal stories and tournament opportunities before the final month.',done:x.day>=60});
  else result.push({id:'final',title:'The final stretch',detail:'Revisit important friendships and finish any remaining brackets before Day 90.',done:x.day>90});
  result.push({id:'bonds',title:'People and promises',detail:x.peopleKnown+' character connections · '+x.appointments+' kept appointments · '+x.conversations+' completed story chapters.',done:x.appointments>0&&x.conversations>0});
  result.push({id:'album',title:'Memory album',detail:x.gallery.unlocked+' of '+x.gallery.total+' memories across this and previous seasons. Some opportunities return in New Game+.',done:x.gallery.remaining===0});
  return result;
 }
 function archive(state){
  const list=Array.isArray(state?.campaignHistory)?state.campaignHistory:[];
  return list.filter(x=>x&&typeof x==='object'&&typeof x.title==='string')
   .slice(-10).map((r,i)=>({run:Number.isInteger(r.run)&&r.run>0?r.run:i+1,
    title:r.title,played:number(r.played),wins:number(r.wins),points:number(r.points),
    partner:typeof r.partner==='string'?r.partner:null,
    memories:number(r.galleryEarned),situations:number(r.situations),dateCount:number(r.appointments)}));
 }
 return Object.freeze({gallerySummary,currentRun,milestones,archive});
});
