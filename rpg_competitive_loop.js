'use strict';
// Neo Harbor competitive circuit: recurring events are campaign-only and never modify TCG rules.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgCompetitiveLoop=api;
})(typeof window!=='undefined'?window:null,function(){
 // Version 1 rosters are preserved for existing saves and pending duels.
 const LEGACY_ROSTERS=Object.freeze([
  Object.freeze(['hana','yuna','marina','shiori']),
  Object.freeze(['reina','camila','akari','shiori']),
  Object.freeze(['kaede','reina','akari','camila'])
 ]);
 // New seasons feature a broader range of opponents at every difficulty tier.
 const ROSTERS=Object.freeze([
  Object.freeze(['hana','yuna','marina','shiori','akari','camila']),
  Object.freeze(['reina','camila','akari','shiori','yuna','kaede','marina','hana']),
  Object.freeze(['kaede','reina','akari','camila','yuna','shiori','marina','hana'])
 ]);
 const validObject=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const week=day=>Math.floor((day-1)/7)+1;
 const tier=day=>day<=30?0:day<=60?1:2;
 function hydrate(s){
  // Existing campaigns retain their original matchups, including pending duels.
  // New campaigns opt into the expanded rosters without altering saved results.
  const existing=validObject(s.competitive);
  if(!existing)s.competitive={};
  const c=s.competitive;
  if(c.matchmakingVersion!==1&&c.matchmakingVersion!==2)
   c.matchmakingVersion=existing?1:2;
  for(const key of ['daily','locals','themes','processed'])if(!validObject(c[key]))c[key]={};
  return c;
 }
 function opponent(day,kind,round=0,version=2){
  const roster=(version===1?LEGACY_ROSTERS:ROSTERS)[tier(day)];
  if(version===1)return roster[(kind==='local'?week(day)+round*2:day+week(day))%roster.length];
  // Five steps per day rotates through the entire roster instead of
  // alternating between the same two opponents all week.
  const base=day*5+week(day)*2;
  let selected=roster[(base+(kind==='local'?2+round*2:0))%roster.length];
  if(kind==='daily'&&day>2&&selected===opponent(day-1,'daily',0,2))
   selected=roster[(base+1)%roster.length];
  return selected;
 }
 function localDay(day){return (day-1)%7===5;}
 function localProgress(s,w=week(s.day)){
  const c=hydrate(s),p=c.locals[w];
  return p&&validObject(p)?p:{round:0,status:'open',results:[]};
 }
 // Theme cups reuse our existing cast and a small shared deck bank. Set caps
 // follow the guaranteed day-unlocks in RPG boosters, never future printings.
 const THEMES=Object.freeze([
  {day:10,title:'Rookie League',sets:['base1','base2'],rarities:['common','uncommon','rare'],description:'Base and Jungle · no holo or secret cards'},
  {day:20,title:'Classic Circuit',sets:['base1','base2','base3','base4'],rarities:['common','uncommon','rare'],description:'Classic expansions · no holo or secret cards'},
  {day:38,title:'Rocket Invitational',sets:['base1','base2','base3','base4','base5','gym1'],rarities:['common','uncommon','rare','holo'],description:'Through Gym Heroes · holo cards allowed'},
  {day:50,title:'Johto Open',sets:['base1','base2','base3','base4','base5','gym1','gym2','neo1'],rarities:['common','uncommon','rare','holo'],description:'Through Neo Genesis · holo cards allowed'},
  {day:64,title:'Neo Challenge',sets:['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2'],rarities:['common','uncommon','rare','holo'],description:'Through Neo Discovery · no secret cards'},
  {day:74,title:'Legend Cup',sets:['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3'],rarities:['common','uncommon','rare','holo'],description:'Through Neo Revelation · no secret cards'},
  {day:86,title:'Ultimate Collection Cup',sets:['base1','base2','base3','base4','base5','gym1','gym2','neo1','neo2','neo3','neo4'],rarities:['common','uncommon','rare','holo','secret'],description:'All sets and rarities · full collection'}
 ]);
 const themeForDay=day=>THEMES.find(t=>t.day===day)||null;
 function themeProgress(s,day=s.day){return hydrate(s).themes[day]||{round:0,status:'open',results:[]};}
 function legalThemeDeck(cards,theme,rarityOf){
  if(!theme||!Array.isArray(cards)||cards.length!==60)return {valid:false,reason:'Save a valid 60-card deck first.'};
  if(typeof rarityOf!=='function')return {valid:false,reason:'Card catalogue is not ready.'};
  for(const id of cards){
   // Basic Energy is legal regardless of the printing's expansion.
   if(/^(base[1-5]|gym[12]|neo[1-4])-\d+$/.test(id)===false)return {valid:false,reason:'Unknown card '+id};
   const set=id.slice(0,id.lastIndexOf('-')),rarity=rarityOf(id);
   if(rarity==='energy')continue;
   if(!theme.sets.includes(set))return {valid:false,reason:'This tournament does not permit cards from '+set+'.'};
   if(!theme.rarities.includes(rarity))return {valid:false,reason:'This tournament does not permit '+(rarity||'unknown')+' cards.'};
  }
  return {valid:true,reason:''};
 }
 function available(s){
  if(!s||!Number.isInteger(s.day)||s.day<1||s.day>90||!Number.isInteger(s.slot)||s.slot<0||s.slot>2)return [];
  const c=hydrate(s),list=[];
  if(s.location==='center'&&s.day>=2&&!c.daily[s.day]){
   const opponentId=opponent(s.day,'daily',0,c.matchmakingVersion);
   list.push({id:'daily-'+s.day,kind:'daily',npc:opponentId,day:s.day,
    title:'Daily Training Challenge',description:'One rotating opponent today · one match',
    tier:tier(s.day)+1,round:0});
  }
  if(s.location==='shop'&&localDay(s.day)){
   const p=localProgress(s),round=Number.isInteger(p.round)?p.round:0;
   if(p.status==='open'&&round<2&&(round>0||s.slot<=1)){
    list.push({id:'local-'+week(s.day)+'-'+round,kind:'local',npc:opponent(s.day,'local',round,c.matchmakingVersion),
     day:s.day,week:week(s.day),round,title:'Saturday Local · Round '+(round+1)+'/2',
     description:round===0?'Win two successive rounds today to claim a booster voucher.':'Final round · a voucher is on the line',
     tier:tier(s.day)+1});
   }
  }
  if(s.location==='center'){
   const theme=themeForDay(s.day),p=themeProgress(s);
   if(theme&&p.status==='open'&&p.round<2&&(p.round>0||s.slot<=1))
    list.push({id:'theme-'+s.day+'-'+p.round,kind:'theme',npc:opponent(s.day,'local',p.round,c.matchmakingVersion),
     day:s.day,round:p.round,title:theme.title+' · Round '+(p.round+1)+'/2',
     description:theme.description+' · 2 rounds · shared CPU decks · booster voucher for champion',tier:tier(s.day)+1});
  }
  return list;
 }
 function begin(s,id){
  if(s.pendingDuel)throw Error('Finish your current duel first');
  const event=available(s).find(e=>e.id===id);
  if(!event)throw Error('This competition is not available now');
  return {...event};
 }
 // Called only after the authoritative duel bridge accepts and records a genuine receipt.
 function settle(s,match,receipt){
  if(!match||!receipt||!['Victory','Defeat','Draw'].includes(receipt.outcome)||
     !receipt.duelId||receipt.duelId!==match.id||!['daily','local','theme'].includes(match.competitiveKind))return null;
  const c=hydrate(s);
  if(c.processed[receipt.duelId]||s.day!==match.day)return null;
  const kind=match.competitiveKind;
  if(kind==='daily'){
   if(s.location!=='center'||s.day<2||c.daily[s.day]||match.competitiveId!=='daily-'+s.day||
      match.npc!==opponent(s.day,'daily',0,c.matchmakingVersion))return null;
  }else if(kind==='theme'){
   const theme=themeForDay(s.day),p=themeProgress(s);
   if(!theme||s.location!=='center'||p.status!=='open'||p.round!==match.competitiveRound||
      match.competitiveId!=='theme-'+s.day+'-'+p.round||
      match.npc!==opponent(s.day,'local',p.round,c.matchmakingVersion))return null;
  }else{
   if(s.location!=='shop'||!localDay(s.day)||match.competitiveWeek!==week(s.day))return null;
   const p=localProgress(s);
   if(p.status!=='open'||p.round!==match.competitiveRound||
      match.competitiveId!=='local-'+week(s.day)+'-'+p.round||
      match.npc!==opponent(s.day,'local',p.round,c.matchmakingVersion))return null;
  }
  const won=receipt.outcome==='Victory',draw=receipt.outcome==='Draw';
  const points=won?(kind==='daily'?4:kind==='theme'?7:5):0;
  const credits=won?(kind==='daily'?8:kind==='theme'?14:10):0;
  let champion=false;
  if(kind==='daily'){
   c.daily[s.day]={npc:match.npc,outcome:receipt.outcome,duelId:receipt.duelId};
  }else if(kind==='theme'){
   const p=c.themes[s.day]||(c.themes[s.day]={round:0,status:'open',results:[]});
   p.results.push({round:p.round,npc:match.npc,outcome:receipt.outcome,duelId:receipt.duelId});
   if(won){p.round++;if(p.round===2){p.status='champion';champion=true;}}
   else if(!draw)p.status='eliminated';
  }else{
   const w=week(s.day);
   if(!c.locals[w])c.locals[w]={round:0,status:'open',results:[]};
   const p=c.locals[w];
   if(!Array.isArray(p.results))p.results=[];
   p.results.push({round:p.round,npc:match.npc,outcome:receipt.outcome,duelId:receipt.duelId});
   if(won){p.round++;if(p.round===2){p.status='champion';champion=true;}}
   else if(!draw)p.status='eliminated';
  }
  c.processed[receipt.duelId]=true;
  const bonusPoints=champion?12:0,bonusCredits=champion?20:0;
  s.points=(s.points||0)+points+bonusPoints;
  s.credits=(s.credits||0)+credits+bonusCredits;
  return {kind,won,draw,champion,points:points+bonusPoints,credits:credits+bonusCredits,
   voucher:champion,title:kind==='daily'?'Daily Training Challenge':kind==='theme'?themeForDay(s.day)?.title:'Saturday Local',
   message:kind==='daily'?(won?'Training challenge cleared.':draw?'Training match drawn.':'Training challenge lost.'):
     kind==='theme'?(champion?'Themed cup champion!':won?'Themed cup round won!':draw?'Themed cup drawn — rematch available.':'Eliminated from the themed cup.'):
     champion?'Saturday Local champion!':won?'Round won — the final awaits today.':
     draw?'Round drawn — rematch available today.':'Eliminated from this week\'s local.'};
 }
 function upcoming(s){
  if(!s||!Number.isInteger(s.day)||s.day>90)return null;
  for(let day=Math.max(1,s.day);day<=90;day++)if(localDay(day))return day;
  return null;
 }
 return Object.freeze({ROSTERS,LEGACY_ROSTERS,THEMES,themeForDay,themeProgress,legalThemeDeck,tier,week,localDay,opponent,hydrate,localProgress,available,begin,settle,upcoming});
});
