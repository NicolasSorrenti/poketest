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
 const LABELS={attack:['ATTACK!','Their Pokémon attacks'],play_card:['NEW PLAY','They put a card into play'],evolve:['EVOLUTION!','A Pokémon evolves'],power:['POKÉMON POWER!','A special effect'],hurt:['BIG HIT','Their Pokémon takes damage'],ko_taken:['POKÉMON DOWN!','You take a Prize'],ko_scored:['A KNOCKOUT!','They take a Prize']};
 const GENERIC={attack:'Here goes.',play_card:'I can work with this.',evolve:'There we go.',power:'Try this one.',hurt:'Ouch. Good hit.',ko_taken:'You got me there.',ko_scored:'That is one down.'};
 const VOICES={
  "hana": {
    "attack": "Okay, here we go!",
    "play_card": "I think this might help.",
    "evolve": "Aw, you grew up!",
    "power": "Come on, just one more trick.",
    "hurt": "Oh! That was a big one.",
    "ko_taken": "Oh no. I should've switched it out.",
    "ko_scored": "We got one! Sorry—I'm excited."
  },
  "reina": {
    "attack": "Keep up. I'm not waiting for you.",
    "play_card": "Was hoping I'd draw that.",
    "evolve": "Now try it.",
    "power": "Let's see you deal with this.",
    "hurt": "Tch. I left that open.",
    "ko_taken": "I saw that coming. Too late, though.",
    "ko_scored": "One down. Still plenty to do."
  },
  "shiori": {
    "attack": "Shall we?",
    "play_card": "I thought this might come in handy.",
    "evolve": "There you are.",
    "power": "There's another possibility.",
    "hurt": "I should have considered that.",
    "ko_taken": "Ah. I held the wrong card.",
    "ko_scored": "That took longer than I expected."
  },
  "yuna": {
    "attack": "All right, audience of one!",
    "play_card": "Ooh, guess what I found.",
    "evolve": "It gets bigger! It gets worse!",
    "power": "Watch this. No, really, watch.",
    "hurt": "That's not how the trick goes!",
    "ko_taken": "No! The important one!",
    "ko_scored": "YES! That actually worked!"
  },
  "akari": {
    "attack": "Let's test the damage.",
    "play_card": "Interesting draw.",
    "evolve": "That improves things.",
    "power": "The numbers favor this.",
    "hurt": "Hm. That changes the odds.",
    "ko_taken": "I missed a whole line there.",
    "ko_scored": "As expected. More or less."
  },
  "camila": {
    "attack": "Shall we make this interesting?",
    "play_card": "Now, this one I didn't trade away.",
    "evolve": "An upgrade. Very tasteful.",
    "power": "Here's the catch, darling.",
    "hurt": "Oof. That one's going to cost me.",
    "ko_taken": "I should have taken your last offer.",
    "ko_scored": "And that, darling, is a good deal."
  },
  "marina": {
    "attack": "Let's give it a try.",
    "play_card": "Oh, I was hoping for that.",
    "evolve": "There. A little more room to breathe.",
    "power": "I think this could work.",
    "hurt": "Oh! I didn't see that coming.",
    "ko_taken": "I should've kept it on the Bench.",
    "ko_scored": "We did it. Are you all right?"
  },
  "kaede": {
    "attack": "Heads up.",
    "play_card": "Knew I was saving that for something.",
    "evolve": "Now we're getting somewhere.",
    "power": "Don't say I didn't warn you.",
    "hurt": "Ha! Okay, that hurt.",
    "ko_taken": "Nice. I almost want a replay.",
    "ko_scored": "Finally. Your turn to sweat."
  },
  "jun": {
    "attack": "Your turn. Watch the timing.",
    "play_card": "I have an answer to that.",
    "evolve": "Right on schedule.",
    "power": "Here's the ruling in action.",
    "hurt": "Ah. Fair play.",
    "ko_taken": "No argument. You earned it.",
    "ko_scored": "That was legal. And rather satisfying."
  },
  "teo": {
    "attack": "And here we go!",
    "play_card": "Oh, this is a good one.",
    "evolve": "The sequel just got bigger!",
    "power": "You are going to want to see this.",
    "hurt": "Ouch! No, no, we're fine.",
    "ko_taken": "That wasn't how I called it!",
    "ko_scored": "A knockout! Did you see that?"
  },
  "iris": {
    "attack": "All right. Let's work.",
    "play_card": "There it is. Found it.",
    "evolve": "Good, that buys us time.",
    "power": "We have another option.",
    "hurt": "Ow. Right where it hurts.",
    "ko_taken": "Should've kept that one safe.",
    "ko_scored": "That's one less problem to carry."
  },
  "elio": {
    "attack": "Okay. I practiced this.",
    "play_card": "Oh! I know what to do with this.",
    "evolve": "I actually have the next stage!",
    "power": "Wait, I can use this now.",
    "hurt": "Ah. Should've seen that.",
    "ko_taken": "Oh, that was my favorite.",
    "ko_scored": "Did that count? It counted!"
  },
  "alma": {
    "attack": "Right, let's get on with it.",
    "play_card": "Good. That's the one.",
    "evolve": "Well, look at you.",
    "power": "I've got a little something here.",
    "hurt": "Careful. That was a good hit.",
    "ko_taken": "Mm. I was too slow.",
    "ko_scored": "Good. Tea's on me after this."
  },
  "nereo": {
    "attack": "Let's see if it holds.",
    "play_card": "There's the spare part.",
    "evolve": "Finally, a bit of progress.",
    "power": "Got one more trick in the box.",
    "hurt": "Well, that knocked something loose.",
    "ko_taken": "That's one way to sink my plans.",
    "ko_scored": "Made it across. Just."
  },
  "jinx": {
    "attack": "Try and stop me.",
    "play_card": "I love it when this shows up.",
    "evolve": "Oh, now we're talking.",
    "power": "Bet you didn't plan for this.",
    "hurt": "Ha! I left the door wide open.",
    "ko_taken": "Okay. That one was ugly.",
    "ko_scored": "There we go. Don't blink."
  },
  "luna": {
    "attack": "All right. Cards on the table.",
    "play_card": "Oh! I found it.",
    "evolve": "It evolved! Wait, no, that's right.",
    "power": "I've got something for this.",
    "hurt": "Ow. I didn't protect it enough.",
    "ko_taken": "Oh no. That was the one I needed.",
    "ko_scored": "I did it! I mean—we did it."
  },
  "sol": {
    "attack": "Ready? On three. Two—",
    "play_card": "I brought a surprise. A normal-sized one.",
    "evolve": "Ta-da! That's a bigger problem.",
    "power": "Watch the next bit. It's good.",
    "hurt": "Hey! Those were my plans!",
    "ko_taken": "Nooo. Farewell, brave little guy.",
    "ko_scored": "One point for the home team!"
  },
  "rina": {
    "attack": "One, two, and—go!",
    "play_card": "Yes! Right on cue.",
    "evolve": "There you are. Perfect timing.",
    "power": "This is the good part.",
    "hurt": "Oh! That was offbeat.",
    "ko_taken": "I should have seen that turn coming.",
    "ko_scored": "We got it! Somebody cue the music."
  },
  "elena": {
    "attack": "Your move after this.",
    "play_card": "I've been holding this.",
    "evolve": "That should be sufficient.",
    "power": "There is a better line.",
    "hurt": "Hm. I misjudged the risk.",
    "ko_taken": "Yes, that's a costly mistake.",
    "ko_scored": "A clean knockout. I'll take it."
  },
  "sierra": {
    "attack": "Let's see what you've got.",
    "play_card": "Finally. I was waiting on this.",
    "evolve": "New look. Same plan.",
    "power": "You missed one thing.",
    "hurt": "Ouch. That's going on the reel.",
    "ko_taken": "I really should have switched.",
    "ko_scored": "Got it. No cameras needed."
  }
};
 const CHANCES={attack:.82,play_card:.52,evolve:.85,power:.65,hurt:.7,ko_taken:1,ko_scored:.95};
 const MAX_REACTIONS=6;
 const prizeCount=player=>Number.isFinite(player?.prizeCount)?player.prizeCount:null;
 const maxSeq=actions=>actions.reduce((n,e)=>Number.isSafeInteger(e?.seq)?Math.max(n,e.seq):n,0);
 const summary=view=>({prizes:[prizeCount(view?.players?.[0]),prizeCount(view?.players?.[1])],cpuUnits:[view?.players?.[1]?.active,...(view?.players?.[1]?.bench||[])].filter(Boolean).map(u=>({id:u.id,damage:Number(u.damage)||0}))});
 function createDirector({npcId,npcName='Opponent',random=Math.random}={}){
  let previous=null,lastSeq=0,lastReactionSeq=-Infinity,count=0,attackShown=false;
  function reset(){previous=null;lastSeq=0;lastReactionSeq=-Infinity;count=0;attackShown=false;}
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
   // The first CPU attack in an RPG duel always introduces the rival visually.
   // Later reactions remain selective, with a slot reserved for a knockout.
   const firstAttack=kind==='attack'&&!attackShown;
   // Reserve one ordinary slot for that first attack as well as the KO slot.
   const normalCap=MAX_REACTIONS-(attackShown||firstAttack?1:2);
   if(!keyMoment&&(count>=normalCap||(!firstAttack&&nextSeq-lastReactionSeq<3)))return null;
   if(!firstAttack&&(typeof random==='function'?random():Math.random())>=CHANCES[kind])return null;
   const titles=LABELS[kind],line=(VOICES[npcId]&&VOICES[npcId][kind])||GENERIC[kind];
   lastReactionSeq=nextSeq;count++;if(kind==='attack')attackShown=true;
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
 // Presentation duration is independent of movement accessibility preferences.
 // In reduced-motion mode the static card remains readable for just as long.
 const isClutch=kind=>kind==='ko_taken'||kind==='ko_scored';
 const priorityFor=kind=>isClutch(kind)?3:kind==='evolve'||kind==='power'?2:1;
 const durationFor=(kind,reduced=false)=>kind==='attack'?2800:isClutch(kind)?2600:1650;
 function makeExperience({element,npcId,npcName,random=Math.random,doc=typeof document==='undefined'?null:document,
  schedule=setTimeout,cancel=clearTimeout,media=typeof window==='undefined'?null:window}={}){
  const director=createDirector({npcId,npcName,random});
  let manifest=null,queued=null,active=false,currentPriority=0,timer=null,preloadImages=[];
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
    const attempted=new Set([src]);
    img.onerror=()=>{
     const fallback=[assetFor(manifest,npcId,'default'),PORTRAITS[npcId]]
      .find(path=>path&&!attempted.has(path));
     if(fallback){attempted.add(fallback);img.src=fallback;}
     else{img.remove();portrait.classList.add('no-art');}
    };
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
  return {update,reset,setManifest:value=>{
    manifest=value;
    // Preload the RPG character art, including the attack pose, before combat.
    preloadImages=[];
    if(typeof media?.Image==='function'){
     for(const path of new Set([assetFor(manifest,npcId,'attack'),assetFor(manifest,npcId,'default')].filter(Boolean))){
      const image=new media.Image();image.src=path;preloadImages.push(image);
     }
    }
   },get count(){return director.count;},
   get active(){return active;},get queued(){return queued?.kind||null;}};
 }
 return {createDirector,makeExperience,assetFor,MAX_REACTIONS,priorityFor,durationFor,VOICES};
});
