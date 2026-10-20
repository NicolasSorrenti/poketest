'use strict';
// NPC reactions are presentation only, based exclusively on public Classic duel state.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgMatchReactions=api;
})(typeof window==='undefined'?null:window,function(){
 const PORTRAITS=Object.freeze({
  hana:'/rpg-assets/hana.png',
  reina:'/rpg-assets/characters/reina/portraits/primary.png',
  shiori:'/rpg-assets/shiori.png',
  yuna:'/rpg-assets/yuna.png',
  akari:'/rpg-assets/akari.png',
  camila:'/rpg-assets/camila.png',
  marina:'/rpg-assets/marina.png',
  kaede:'/rpg-assets/kaede.png',
  jun:'/rpg-assets/jun.png',
  teo:'/rpg-assets/teo.png',
  iris:'/rpg-assets/iris.png',
  elio:'/rpg-assets/elio.png',
  alma:'/rpg-assets/alma.png',
  nereo:'/rpg-assets/nereo.png',
  elena:'/rpg-assets/characters/elena/portrait.png',
  jinx:'/rpg-assets/characters/jinx/neutral.png',
  luna:'/rpg-assets/characters/luna/neutral.png',
  sierra:'/rpg-assets/characters/sierra/portrait.png',
  sol:'/rpg-assets/sol.png'
 });
 const LABELS={attack:['ATTACK!','They go on the offensive'],play_card:['A CARD UP THEIR SLEEVE','A new play'],evolve:['EVOLUTION!','Their team grows stronger'],power:['POKÉMON POWER!','A special play'],hurt:['UNDER PRESSURE','Their Pokémon takes a hit'],ko_taken:['POKÉMON DOWN!','You took one of their Prizes'],ko_scored:['A KNOCKOUT!','They take a Prize']};
 const GENERIC={attack:'Here comes my next attack!',play_card:'I have a play in mind.',evolve:'Things are getting interesting.',power:'Time for a little surprise!',hurt:'That hit harder than I expected.',ko_taken:'That was a good knockout. I am not finished yet.',ko_scored:'That is one step closer!'};
 const VOICES={
  reina:{attack:'Keep up. I am not holding back.',play_card:'I kept this card for a reason.',evolve:'Now things get serious.',power:'Try finding a way around this.',hurt:'Tch. You found an opening.',ko_taken:'Fine. That was a clean knockout.',ko_scored:'Do not fall behind now.'},
  hana:{attack:'Everyone, let us give it our best!',play_card:'I think this will help!',evolve:'Look how far we have come!',power:'A little teamwork goes a long way!',hurt:'Ouch. Are you okay over there?',ko_taken:'Aw, poor thing. We can bounce back!',ko_scored:'We did it! That was amazing!'},
  shiori:{attack:'Let us see how this unfolds.',play_card:'This changes our options.',evolve:'Patience has its rewards.',power:'There is another way forward.',hurt:'I underestimated that line of play.',ko_taken:'Well observed. You earned that.',ko_scored:'A quiet move can still be decisive.'},
  yuna:{attack:'Here comes the exciting part!',play_card:'Surprise! Did you see that coming?',evolve:'Plot twist! An upgrade!',power:'A completely reasonable surprise!',hurt:'Whoa! That was not in the script!',ko_taken:'Nooo, my dramatic comeback arc!',ko_scored:'YES! The crowd goes wild!'},
  akari:{attack:'Testing my damage hypothesis.',play_card:'A statistically useful option.',evolve:'An improvement to my position.',power:'Let us adjust the variables.',hurt:'That outcome was outside my estimate.',ko_taken:'I will need to revise my model.',ko_scored:'The prediction holds.'},
  camila:{attack:'Shall we raise the stakes?',play_card:'Darling, I never show my whole hand.',evolve:'An excellent investment.',power:'There is always another angle.',hurt:'Oh? That cost me more than expected.',ko_taken:'Expensive lesson. Nicely played.',ko_scored:'Such a profitable exchange.'},
  marina:{attack:'All right. Here we go!',play_card:'I saved this for a good moment.',evolve:'Our patience is paying off.',power:'The current is changing.',hurt:'Oh! That startled me.',ko_taken:'It is okay. We will keep going.',ko_scored:'One wave at a time!'},
  kaede:{attack:'Try dodging this one.',play_card:'Oh, you are going to hate this.',evolve:'Now you have my attention.',power:'Watch your step.',hurt:'Ha! That actually stung.',ko_taken:'Not bad. Do it again if you can.',ko_scored:'Too easy. Make me work for it.'}
 };
 const CHANCES={attack:.82,play_card:.52,evolve:.85,power:.65,hurt:.7,ko_taken:1,ko_scored:.95};
 const MAX_REACTIONS=6;
 const prizeCount=player=>Number.isFinite(player?.prizeCount)?player.prizeCount:null;
 const maxSeq=actions=>actions.reduce((n,e)=>Number.isSafeInteger(e?.seq)?Math.max(n,e.seq):n,0);
 const summary=view=>({prizes:[prizeCount(view?.players?.[0]),prizeCount(view?.players?.[1])],cpuUnits:[view?.players?.[1]?.active,...(view?.players?.[1]?.bench||[])].filter(Boolean).map(u=>({id:u.id,damage:Number(u.damage)||0}))});
 function createDirector({npcId,npcName='Opponent',random=Math.random}={}){
  let previous=null,lastSeq=0,lastReactionSeq=-Infinity,count=0;
  function reset(){previous=null;lastSeq=0;lastReactionSeq=-Infinity;count=0;}
  function update(data){
   const view=data?.view;if(!view||!Array.isArray(view.players)||view.players.length<2)return null;
   const all=Array.isArray(data.activity)?data.activity:[];
   const nextSeq=Math.max(lastSeq,maxSeq(all)),now=summary(view);
   if(!previous){previous=now;lastSeq=nextSeq;return null;} // Never replay history after load/resume.
   const prior=previous;previous=now;
   const fresh=all.filter(e=>Number.isSafeInteger(e?.seq)&&e.seq>lastSeq&&e.seq<=nextSeq).sort((a,b)=>a.seq-b.seq);
   lastSeq=nextSeq;
   if((view.phase!=='game'&&!view.over)||count>=MAX_REACTIONS)return null;
   const koTaken=prior.prizes[0]!==null&&now.prizes[0]!==null&&now.prizes[0]<prior.prizes[0];
   const koScored=prior.prizes[1]!==null&&now.prizes[1]!==null&&now.prizes[1]<prior.prizes[1];
   let kind=null,event=null;
   if(koTaken)kind='ko_taken';
   else if(koScored)kind='ko_scored';
   else {
    const cpu=fresh.filter(a=>a.side===1);
    const kinds={attack:'attack',play_trainer:'play_card',evolve:'evolve',use_power:'power',use_stadium:'play_card',bench:'play_card'};
    event=cpu.slice().reverse().find(a=>kinds[a.type]);
    if(event)kind=kinds[event.type];
    else if(fresh.some(a=>a.side===0&&a.type==='attack')){
     if(now.cpuUnits.some(u=>prior.cpuUnits.some(p=>p.id===u.id&&u.damage>p.damage)))kind='hurt';
    }
   }
   if(!kind||(view.phase!=='game'&&kind!=='ko_taken'&&kind!=='ko_scored'))return null;
   const keyMoment=kind==='ko_taken'||kind==='ko_scored';
   if(!keyMoment&&(count>=MAX_REACTIONS-1||nextSeq-lastReactionSeq<3))return null;
   if((typeof random==='function'?random():Math.random())>=CHANCES[kind])return null;
   const titles=LABELS[kind],line=(VOICES[npcId]&&VOICES[npcId][kind])||GENERIC[kind];
   lastReactionSeq=nextSeq;count++;
   return {npcId,npcName,kind,title:titles[0],subtitle:kind==='attack'&&event?.label?'Attack: '+String(event.label).slice(0,64):titles[1],line,index:count,imageKey:kind};
  }
  return {update,reset,get count(){return count;}};
 }
 function assetFor(manifest,npcId,kind){
  const entry=manifest?.characters?.[npcId];
  const candidate=(entry&&typeof entry==='object'&&(entry[kind]||entry.default))||PORTRAITS[npcId];
  const belongsToNpc=path=>path.startsWith('/rpg-assets/'+npcId+'.')||
   path.startsWith('/rpg-assets/characters/'+npcId+'/')||
   path.startsWith('/rpg-assets/reactions/'+npcId+'/');
  const valid=path=>typeof path==='string'&&/^\/rpg-assets\/[a-z0-9/_-]+\.(?:png|webp|jpe?g)$/i.test(path)&&belongsToNpc(path);
  // Invalid/misassigned images must never display a different character.
  return valid(candidate)?candidate:(valid(PORTRAITS[npcId])?PORTRAITS[npcId]:null);
 }
 // Never make players wait for ordinary reactions; the KO cut-in can last a little longer.
 const isClutch=kind=>kind==='ko_taken'||kind==='ko_scored';
 const priorityFor=kind=>isClutch(kind)?3:kind==='evolve'||kind==='power'?2:1;
 const durationFor=(kind,reduced=false)=>reduced?260:isClutch(kind)?1280:900;
 function makeExperience({element,npcId,npcName,random=Math.random,doc=typeof document==='undefined'?null:document,
  schedule=setTimeout,cancel=clearTimeout,media=typeof window==='undefined'?null:window}={}){
  const director=createDirector({npcId,npcName,random});
  let manifest=null,queued=null,active=false,currentPriority=0,timer=null;
  const reduced=()=>!!media?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function hide(){
   if(timer!==null)cancel(timer);
   timer=null;active=false;currentPriority=0;
   element?.classList.add('hidden');element?.replaceChildren();
  }
  function reset(){director.reset();queued=null;hide();}
  function pump(){
   if(active||!queued||!element||!doc)return;
   const reaction=queued;queued=null;active=true;currentPriority=priorityFor(reaction.kind);
   const card=doc.createElement('div');card.className='npc-reaction-card npc-reaction-'+reaction.kind+(isClutch(reaction.kind)?' is-finisher':'');
   const portrait=doc.createElement('div');portrait.className='npc-reaction-portrait';
   const src=assetFor(manifest,npcId,reaction.imageKey);
   if(src){
    const img=doc.createElement('img');img.alt='';img.src=src;
    img.onerror=()=>{const fallback=PORTRAITS[npcId];if(fallback&&img.getAttribute('src')!==fallback){img.src=fallback;}else{img.remove();portrait.classList.add('no-art');}};
    portrait.append(img);
   }else portrait.classList.add('no-art');
   const copy=doc.createElement('div');copy.className='npc-reaction-copy';
   const tag=doc.createElement('span');tag.className='npc-reaction-tag';tag.textContent=reaction.subtitle;
   const name=doc.createElement('strong');name.className='npc-reaction-name';name.textContent=reaction.npcName;
   const title=doc.createElement('span');title.className='npc-reaction-title';title.textContent=reaction.title;
   const line=doc.createElement('p');line.textContent='“'+reaction.line+'”';
   copy.append(tag,name,title,line);card.append(portrait,copy);
   element.replaceChildren(card);element.classList.remove('hidden');
   media?.NeoRpgAudio?.play?.(isClutch(reaction.kind)?'knockout':'cutin');
   const showingPriority=currentPriority;
   timer=schedule(()=>{
    // Stale completion timers cannot clear a newer cut-in.
    if(currentPriority!==showingPriority)return;
    timer=null;hide();pump();
   },durationFor(reaction.kind,reduced()));
  }
  function update(data){
   const reaction=director.update(data);
   if(!reaction)return null;
   const priority=priorityFor(reaction.kind);
   if(active&&priority===3&&priority>currentPriority){
    // A knockout cuts through an ordinary queued quip.
    queued=null;hide();
   }
   if(!active)queued=reaction;
   else if(!queued||priority>priorityFor(queued.kind))queued=reaction;
   pump();
   return reaction;
  }
  return {update,reset,setManifest:value=>{manifest=value;},get count(){return director.count;},
   get active(){return active;},get queued(){return queued?.kind||null;}};
 }
 return {createDirector,makeExperience,assetFor,MAX_REACTIONS,priorityFor,durationFor};
});
