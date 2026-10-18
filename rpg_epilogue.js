'use strict';
/* End-of-season report and replay archival: only consumes RPG state, never changes TCG combat. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgEpilogue=api;})(typeof window!=='undefined'?window:null,function(){
 const names={hana:'Hana Mizuno',reina:'Reina Kurogane',shiori:'Shiori Tsukishima',yuna:'Yuna Hoshino',
 akari:'Akari Fujimoto',camila:'Camila Vega',marina:'Marina Aoki',kaede:'Kaede Arashi',
 jun:'Jun Arai',sol:'Sol Varela'};
 const cups=[['neighborhood','Neighborhood Cup'],['regional','Regional Qualifier'],['championship','Championship Bracket']];
 function displayName(id){return names[id]||String(id||'Someone').replace(/[_-]+/g,' ').replace(/\b\w/g,x=>x.toUpperCase());}
 function report(state){
  if(!state||typeof state!=='object')throw Error('Invalid RPG season');
  const duels=Array.isArray(state.results)?state.results:[],win=duels.filter(x=>x.won===true).length,draw=duels.filter(x=>x.draw===true).length;
  const cupStates=cups.map(([id,title])=>({id,title,status:state.tournaments?.[id]?.state||'missed',
   roundsWon:Math.min(3,Math.max(0,state.tournaments?.[id]?.round||0))}));
  const champions=cupStates.filter(x=>x.status==='champion');
  const friendships=Object.entries(state.relationships||{}).filter(([id,b])=>b&&typeof b==='object'&&
   ((b.affection||0)>0||(b.trust||0)>0||(b.respect||0)>0||(b.duels||0)>0))
   .map(([id,b])=>({id,name:displayName(id),affection:b.affection||0,trust:b.trust||0,
   closeness:(b.affection||0)+(b.trust||0)+(b.respect||0)+(b.attraction||0)}))
   .sort((a,b)=>b.closeness-a.closeness||a.name.localeCompare(b.name));
  const partner=state.partner?displayName(state.partner):null;
  let title,closing;
  if(cupStates[2].status==='champion'){title='The Harbor Champion';closing='You faced the final bracket and earned a place in the town’s tournament history.';}
  else if(partner){title='A Connection Beyond the Circuit';closing='The tournament season ends, but the relationship you chose is only beginning.';}
  else if(champions.length){title='A Name They Remember';closing='Some of your best matches became the stories players still tell around the card tables.';}
  else if(friendships.length){title='The People Who Stayed';closing='Not every meaningful victory happens under the tournament lights.';}
  else if(duels.length){title='A Season of Challengers';closing='You kept showing up to play, learn, and discover what this town could offer.';}
  else{title='Ninety Days in Neo Harbor';closing='The season has ended, but every path you took made it your own.';}
  return {
   day:Math.min(90,Math.max(1,state.day||90)),title,closing,played:duels.length,wins:win,draws:draw,losses:Math.max(0,duels.length-win-draw),
   points:state.points||0,credits:state.credits||0,cups:cupStates,champions:champions.length,
   partner,closest:friendships.slice(0,3),knownCharacters:friendships.length,
   storyScenes:Object.keys(state.storyDone||{}).length,encounters:Object.keys(state.encountersDone||{}).length,
   run:(Number.isInteger(state.ngPlus)&&state.ngPlus>=0?state.ngPlus:0)+1
  };
 }
 function completed(state){return !!state&&(state.day>90||state.ended===true);}
 function replay(state,createDefaults){
  if(!completed(state))throw Error('Finish the 90-day season before starting New Game+');
  if(typeof createDefaults!=='function')throw Error('Missing season initializer');
  const current=report(state),history=(Array.isArray(state.campaignHistory)?state.campaignHistory:[])
   .filter(x=>x&&typeof x==='object'&&typeof x.title==='string').slice(-9);
  const next=createDefaults();
  next.ngPlus=(Number.isInteger(state.ngPlus)&&state.ngPlus>=0?state.ngPlus:0)+1;
  next.campaignHistory=[...history,current].slice(-10);
  // Replay is a new campaign: preserve the preferred deck preset, but reset all social,
  // economic, bracket and competitive state. No unimplemented card-collection carry-over.
  if(typeof state.playerDeck==='string'&&state.playerDeck.trim())next.playerDeck=state.playerDeck;
  return next;
 }
 return Object.freeze({report,replay,completed,displayName});
});