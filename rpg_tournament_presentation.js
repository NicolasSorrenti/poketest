'use strict';
/* Neo Harbor official circuit presentation; all outcomes remain engine-owned. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgTournamentPresentation=api;
})(typeof window==='undefined'?null:window,function(){
 const asText=(v)=>typeof v==='string'?v:'';
 function matchModel(duel,{cast={},cups=[]}={}){
  if(!duel||!duel.npc||!cast[duel.npc])return null;
  const cup=duel.tournamentId?cups.find(c=>c.id===duel.tournamentId):null;
  const isLocal=duel.competitiveKind==='local';
  if(!cup&&!isLocal)return null; // Ordinary duels and daily practice stay fast.
  const number=Number.isInteger(cup?duel.tournamentRound:duel.competitiveRound)?
   (cup?duel.tournamentRound:duel.competitiveRound):0;
  return Object.freeze({
   kind:cup?'official':'local',title:cup?.title||'SATURDAY LOCAL',
   eyebrow:cup?'OFFICIAL CIRCUIT':'THE LUCKY DRAW · SATURDAY LOCAL',
   round:'ROUND '+(number+1)+' / '+(cup?.rounds?.length||2),
   opponentId:duel.npc,opponent:cast[duel.npc].name,
   portrait:asText(cast[duel.npc].portrait)||'/rpg-assets/'+duel.npc+'.png',
   deck:asText(cast[duel.npc].style),isFinal:number===(cup?.rounds?.length||2)-1
  });
 }
 function bracketModel(cup,progress,day,cast={}){
  if(!cup||!Array.isArray(cup.rounds)||!progress)return null;
  const state=progress.state||'open',won=Math.max(0,Math.min(cup.rounds.length,Number(progress.round)||0));
  const inWindow=day>=cup.day&&day<=cup.end;
  const recorded=Array.isArray(progress.results)?progress.results:[];
  const rows=cup.rounds.map((id,index)=>{
   const result=[...recorded].reverse().find(r=>r?.round===index);
   const cleared=index<won;
   let label=cleared?'CLEARED':result?.outcome==='Draw'&&index===won?'REPLAY':
    result?.outcome==='Defeat'&&index===won?'ELIMINATED':
    index===won&&state==='open'&&inWindow?'NEXT UP':'UPCOMING';
   if(index>=won&&!cleared&&(state==='expired'||state==='missed'))label='CLOSED';
   if(index>won&&state==='eliminated')label='CLOSED';
   return Object.freeze({round:index+1,opponent:cast[id]?.name||id,opponentId:id,label,
    result:cleared?'Victory':result?.outcome||null,current:label==='NEXT UP'||label==='REPLAY'});
  });
  return Object.freeze({
   id:cup.id,title:cup.title,state,day:cup.day,end:cup.end,completed:won,total:cup.rounds.length,
   live:inWindow&&state==='open',
   headline:state==='champion'?'🏆 CHAMPION':state==='eliminated'?'ELIMINATED':
    state==='expired'||state==='missed'||(day>cup.end&&state!=='champion')?'REGISTRATION CLOSED':
    day<cup.day?'OPENS DAY '+cup.day:'ROUND '+(won+1)+' / '+cup.rounds.length,
   rows
  });
 }
 function celebrationModel({duel,cupOutcome=null,competitiveOutcome=null,receipt=null}={}){
  if(receipt?.outcome!=='Victory')return null;
  if(duel?.tournamentId&&cupOutcome?.won){
   const champion=cupOutcome.state==='champion';
   return Object.freeze({
    kind:champion?'champion':'round',
    title:champion?'TOURNAMENT CHAMPION!':'ROUND CLEARED!',
    subtitle:champion?'THE BRACKET IS YOURS':'ADVANCING THROUGH THE BRACKET',
    event:asText(cupOutcome.title)||'OFFICIAL CIRCUIT',champion
   });
  }
  if(duel?.competitiveKind==='local'&&competitiveOutcome?.won){
   const champion=competitiveOutcome.champion===true;
   return Object.freeze({
    kind:champion?'champion':'round',title:champion?'LOCAL CHAMPION!':'ROUND CLEARED!',
    subtitle:champion?'SATURDAY LOCAL WINNER':'THE FINAL MATCH AWAITS',
    event:asText(competitiveOutcome.title)||'SATURDAY LOCAL',champion
   });
  }
  return null;
 }
 function createPresenter({document:doc=typeof document==='undefined'?null:document,
  window:win=typeof window==='undefined'?null:window,schedule=setTimeout,cancel=clearTimeout}={}){
  let timer=null,active=null;
  const reduced=()=>!!win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function clear(){
   if(timer!==null){cancel(timer);timer=null;}
   if(active){active.remove();active=null;}
  }
  function show(model){
   if(!model||!doc?.body||typeof doc.createElement!=='function')return false;
   clear();
   const overlay=doc.createElement('div');overlay.className='neo-tournament-versus';
   overlay.setAttribute('aria-label',model.title+' · '+model.round+' · Versus '+model.opponent);
   overlay.setAttribute('role','status');
   const inner=doc.createElement('div');inner.className='neo-tournament-versus__inner';
   const make=(tag,cls,value)=>{const n=doc.createElement(tag);n.className=cls;if(value!==undefined)n.textContent=value;return n;};
   const header=make('span','neo-tournament-versus__eyebrow',model.eyebrow);
   const title=make('strong','neo-tournament-versus__event',model.title);
   const round=make('span','neo-tournament-versus__round',model.isFinal?'FINAL · '+model.round:model.round);
   const names=make('div','neo-tournament-versus__names');
   names.append(make('strong','neo-tournament-versus__you','YOU'),make('span','neo-tournament-versus__vs','VS'),
    make('strong','neo-tournament-versus__opponent',model.opponent));
   const picture=make('div','neo-tournament-versus__portrait');
   const image=doc.createElement('img');image.alt='';
   image.onerror=()=>{image.remove();picture.append(make('span','neo-tournament-versus__fallback',model.opponent.split(' ').map(x=>x[0]).join('')));};
   image.src=model.portrait;picture.append(image);
   inner.append(header,title,round,names,picture);overlay.append(inner);doc.body.append(overlay);
   active=overlay;
   timer=schedule(clear,reduced()?170:880);
   return true;
  }
  return {show,clear,get active(){return !!active;}};
 }
 const presenter=createPresenter();
 return {matchModel,bracketModel,celebrationModel,createPresenter,
  show:options=>presenter.show(options),clear:()=>presenter.clear()};
});