'use strict';
/* Optional post-romance visits. Neither relationship ranks nor story chapters are changed. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgRomanceVisits=api;
})(typeof window!=='undefined'?window:null,function(){
 // Only women whose final parody CG is present in the live repository. Live has
 // her own event system; male characters can join when their routes/art are ready.
 const characters=Object.freeze([
  'akari','barb','camila','daisy','elena','hana','iris','jicy','jinx','kaede',
  'laca','lyla','marina','reina','rina','shiori','sierra','yuna'
 ]);
 // Character-authored, non-graphic dialogue for first and repeat private visits.
 // Kept separate from story rewards so visits never alter relationship scores.
 const visitDialogue=Object.freeze({
 "akari": {
  "first": [
   "Statistically, I should be calm. I am not.",
   "My notes did not prepare me for being alone with you.",
   "Could we put the analysis aside and just enjoy this?"
  ],
  "repeat": [
   "I prepared absolutely no notes this time.",
   "You still make my heart behave unpredictably.",
   "I think I prefer the uncertainty."
  ],
  "barks": [
   "Ah… I lost my train of thought.",
   "That was… unexpected.",
   "Wait, let me just… oh!",
   "Yes. I mean—yes!",
   "I refuse to calculate this moment."
  ],
  "outro": [
   "For once, I do not need to understand everything.",
   "My conclusion is unchanged: I like being here with you."
  ]
 },
 "barb": {
  "first": [
   "You really invited me over? Oh, this is exciting!",
   "I was going to play it cool, but clearly that's impossible.",
   "Come here before I trip over my own feet."
  ],
  "repeat": [
   "I brought snacks! And, uh, my whole heart.",
   "It's so good being here again.",
   "Okay, no clumsy entrances this time. Probably."
  ],
  "barks": [
   "Ah! You surprised me!",
   "Ha! Don't laugh at me!",
   "Oh, this is nice…",
   "Yes, yes!",
   "Oops—I'm okay!"
  ],
  "outro": [
   "Best evening ever. Even with my usual chaos.",
   "I warned you I'm a handful. You're still smiling."
  ]
 },
 "camila": {
  "first": [
   "Usually I know exactly what I want.",
   "Tonight, I don't want to negotiate a thing.",
   "Just stay here with me. No fine print."
  ],
  "repeat": [
   "I considered pretending I came for a trade.",
   "But you and I both know better.",
   "Come on. The shop can wait."
  ],
  "barks": [
   "A rather persuasive argument…",
   "Hmm. Interesting.",
   "You certainly know how to surprise me.",
   "Yes… exactly.",
   "No bargaining tonight, remember?"
  ],
  "outro": [
   "I think this is the best deal I've ever made.",
   "Careful. I'm becoming very fond of this arrangement."
  ]
 },
 "daisy": {
  "first": [
   "I've been excited about this all day!",
   "Does that make me sound silly? Maybe a little.",
   "Anyway, I'm really happy we're together."
  ],
  "repeat": [
   "Guess who couldn't stop smiling on the way here?",
   "I missed our little moments.",
   "Can we make another memory today?"
  ],
  "barks": [
   "Ah! Hehe!",
   "Oh, wow!",
   "Yes, yes!",
   "This makes me so happy.",
   "I can't stop grinning!"
  ],
  "outro": [
   "I'm going to remember this forever.",
   "Somehow it just keeps getting better."
  ]
 },
 "elena": {
  "first": [
   "I don't often let my guard down.",
   "But with you, I feel like I can.",
   "I'd like a quiet evening, if you'll stay."
  ],
  "repeat": [
   "It's easier to be myself around you now.",
   "I was hoping we'd get this time together.",
   "Let's leave the rest of the world outside."
  ],
  "barks": [
   "Ah…",
   "You caught me off guard.",
   "That's lovely.",
   "Yes…",
   "Please stay a little longer."
  ],
  "outro": [
   "Thank you for making this feel safe and easy.",
   "I'm glad it's you I get to share this with."
  ]
 },
 "hana": {
  "first": [
   "Everyone keeps asking me for one more favor.",
   "Tonight, I chose something just for myself.",
   "And I chose to be here with you."
  ],
  "repeat": [
   "I finished everything early for once!",
   "I wanted to save this evening for us.",
   "No interruptions this time, okay?"
  ],
  "barks": [
   "Ah! Oh, goodness!",
   "You're making me blush.",
   "Yes!",
   "This is wonderful.",
   "I can finally relax…"
  ],
  "outro": [
   "I didn't know I needed a moment like that so much.",
   "I'm keeping this time on my calendar, just for us."
  ]
 },
 "iris": {
  "first": [
   "I spend so much time on the move.",
   "For once, I wanted somewhere to stay.",
   "Being here with you feels like a destination."
  ],
  "repeat": [
   "No deliveries, no messages, no rushing tonight.",
   "I made time for you.",
   "I hope that's all right."
  ],
  "barks": [
   "Oh!",
   "You always surprise me.",
   "Mm… that's nice.",
   "Yes, I like this.",
   "Let's not hurry."
  ],
  "outro": [
   "It's nice having somewhere I want to return to.",
   "I'll keep finding my way back here."
  ]
 },
 "jicy": {
  "first": [
   "I practiced what to say on the way here.",
   "Now that you're looking at me, I've forgotten it all.",
   "I… I really want to stay with you."
  ],
  "repeat": [
   "I was nervous again, even though I know you.",
   "But it's the happy kind of nervous.",
   "Could you hold my hand?"
  ],
  "barks": [
   "Ah!",
   "S-sorry, I startled myself.",
   "Hehe…",
   "Y-yes!",
   "I'm really happy…"
  ],
  "outro": [
   "I was shy, but I'm glad I stayed.",
   "I think I'm getting a little braver with you."
  ]
 },
 "jinx": {
  "first": [
   "I had three clever things ready to say.",
   "Then you smiled and I forgot all of them.",
   "So how about we just enjoy tonight?"
  ],
  "repeat": [
   "Miss me? Don't answer—I know that smile.",
   "I brought my best jokes. Probably won't need them.",
   "Come closer, troublemaker."
  ],
  "barks": [
   "Ah! Gotcha!",
   "Oh, you're good.",
   "Ha! I knew it.",
   "Yes, yes!",
   "Okay, that was unexpectedly sweet."
  ],
  "outro": [
   "Don't tell anyone you saw my soft side.",
   "You're becoming my favorite kind of trouble."
  ]
 },
 "kaede": {
  "first": [
   "I don't usually stay anywhere long.",
   "But I keep finding reasons to come back.",
   "Tonight, the reason is you."
  ],
  "repeat": [
   "I could have taken the train somewhere else.",
   "Didn't want to.",
   "I'd rather spend this evening here."
  ],
  "barks": [
   "Hmph…",
   "You surprised me.",
   "Not bad.",
   "All right… yes.",
   "Don't make a big deal of it."
  ],
  "outro": [
   "I think I've found something worth staying for.",
   "I'll be back. That's a promise, not a maybe."
  ]
 },
 "laca": {
  "first": [
   "We've known each other for so long.",
   "And yet, somehow, you still make me nervous.",
   "Come on, let's make a new memory."
  ],
  "repeat": [
   "Remember when we couldn't sit still for five minutes?",
   "Now I kind of just want to stay here with you.",
   "Is that terribly sentimental of me?"
  ],
  "barks": [
   "Ah! You goof!",
   "Haha, stop!",
   "Yes, yes!",
   "This feels just right.",
   "You haven't changed a bit…"
  ],
  "outro": [
   "Same old us, just a little closer.",
   "No matter how long it's been, being with you feels easy."
  ]
 },
 "lyla": {
  "first": [
   "I don't usually ask for things like this.",
   "But I wanted some time without an audience.",
   "So… stay, okay?"
  ],
  "repeat": [
   "I turned my phone off.",
   "I don't want anyone interrupting.",
   "I came here for you."
  ],
  "barks": [
   "Ah…",
   "Mm.",
   "You're staring again.",
   "…Yes.",
   "I like this."
  ],
  "outro": [
   "Don't make a big deal of it. I had a good time.",
   "You can ask me again. Just not in front of everyone."
  ]
 },
 "marina": {
  "first": [
   "The river was beautiful today.",
   "But I kept thinking about seeing you tonight.",
   "Can we just let the evening take its time?"
  ],
  "repeat": [
   "I walked past the water on my way here.",
   "It reminded me of our first long talk.",
   "I'm glad we chose this."
  ],
  "barks": [
   "Ah…",
   "That's lovely.",
   "Mm…",
   "Yes…",
   "Let's stay here a while."
  ],
  "outro": [
   "Some moments are worth choosing again and again.",
   "I feel like I can breathe a little easier with you."
  ]
 },
 "reina": {
  "first": [
   "Don't get the wrong idea. I wanted to come.",
   "I don't lose my nerve easily, so don't make me regret this.",
   "Now quit grinning and sit beside me."
  ],
  "repeat": [
   "You look pretty pleased with yourself.",
   "Well, I wanted to see you too. Satisfied?",
   "Come here before I change my mind."
  ],
  "barks": [
   "H-Hey!",
   "Don't get cocky!",
   "Ah… that's unfair.",
   "Yes, yes!",
   "You really are impossible."
  ],
  "outro": [
   "If you mention how red my face got, we're dueling.",
   "I'm still not admitting you won. But I'm coming back."
  ]
 },
 "rina": {
  "first": [
   "I had the whole evening planned out in my head.",
   "Now it feels different—in a good way.",
   "Let's just enjoy being together."
  ],
  "repeat": [
   "I saved this evening for us.",
   "No complicated plans this time.",
   "I just wanted to see you smile."
  ],
  "barks": [
   "Ah!",
   "Oh, that's sweet.",
   "You're making me blush.",
   "Yes!",
   "Hehe, I can't help smiling."
  ],
  "outro": [
   "I think this might be my favorite memory yet.",
   "I'm really glad we made time for each other."
  ]
 },
 "shiori": {
  "first": [
   "It's rather peaceful here.",
   "I don't often say exactly what I'm feeling.",
   "But I'm very glad to be with you."
  ],
  "repeat": [
   "I've been looking forward to this quiet.",
   "You always make silence feel comfortable.",
   "Please, sit with me."
  ],
  "barks": [
   "Ah…",
   "Mm…",
   "How lovely.",
   "Yes…",
   "Let's stay like this."
  ],
  "outro": [
   "Thank you. That was a lovely evening.",
   "I hope we can share another quiet moment soon."
  ]
 },
 "sierra": {
  "first": [
   "I usually keep my composure.",
   "Tonight, I'd rather be honest with you.",
   "I'm happy you asked me here."
  ],
  "repeat": [
   "I set aside the whole evening.",
   "And for once, I have no other plans.",
   "You have my full attention."
  ],
  "barks": [
   "Oh!",
   "You caught me smiling.",
   "Mm, yes.",
   "That's nice.",
   "I'm glad we're here."
  ],
  "outro": [
   "I don't have to pretend to be unshakable around you.",
   "You're becoming someone very important to me."
  ]
 },
 "yuna": {
  "first": [
   "Okay, I was going to make a really cool entrance.",
   "But my heart is beating way too fast!",
   "Can we just skip to the part where I get to smile at you?"
  ],
  "repeat": [
   "Ta-da! Your favorite chaos gremlin has arrived!",
   "I swear I planned a dramatic speech.",
   "Nope. Forgot it. Hi!"
  ],
  "barks": [
   "Ah! Haha!",
   "Oh, no way!",
   "Yes, yes, yes!",
   "My heart's going wild!",
   "This is better than my best combo!"
  ],
  "outro": [
   "Ten out of ten! Would absolutely do this again.",
   "Okay, that was ridiculously fun. Same time again someday?"
  ]
 }
});
 const defaultDialogue=Object.freeze({
  first:["I'm glad you asked me to come.","It's nice being alone together.","Can we stay here a while?"],
  repeat:["It's good to see you again.","I missed having this quiet time with you.","Let's enjoy the evening."],
  barks:["Ah…","This is lovely.","Yes…","I'm happy we're here.","Stay a little longer."],
  outro:["I'm really glad we shared that moment.","I'd love another evening like this."]
 });
 function dialogue(id){return visitDialogue[id]||defaultDialogue;}
 const known=new Set(characters);
 const cooldownDays=5;
 function chapterId(id,story){
  if(!known.has(id)||!Array.isArray(story?.events))return null;
  const prefix=id+'_route_';
  const routes=story.events.filter(e=>e.npc===id&&
   e.id.startsWith(prefix)&&/^\d+$/.test(e.id.slice(prefix.length)));
  if(!routes.length)return null;
  routes.sort((a,b)=>Number(b.id.slice(prefix.length))-Number(a.id.slice(prefix.length)));
  return routes[0].id;
 }
 function eligible(state,id,story){
  const final=chapterId(id,story);
  return !!final&&state?.routeOutcomes?.[id]==='romance'&&
   !!state?.storyDone?.[final]&&Number(state.day)>=1&&Number(state.day)<=90;
 }
 function record(state,id){
  if(!state.romanceVisits||typeof state.romanceVisits!=='object'||Array.isArray(state.romanceVisits))
   state.romanceVisits={};
  return state.romanceVisits[id]||null;
 }
 function nextDay(state,id){
  const last=Number(record(state,id)?.lastDay)||0;
  return last?last+cooldownDays:null;
 }
 function ready(state,id,story){
  if(!eligible(state,id,story))return false;
  const day=nextDay(state,id);
  return day===null||state.day>=day;
 }
 function pending(state,id,story){
  return state.romanceVisitPending===id&&ready(state,id,story);
 }
 function offerable(state,id,story){
  return ready(state,id,story)&&!state.romanceVisitShowing&&!pending(state,id,story);
 }
 function isFirst(state,id){return nextDay(state,id)===null;}
 function accept(state,id,story){
  if(!ready(state,id,story))return false;
  state.romanceVisitPending=id;
  return true;
 }
 function complete(state,id,story){
  if(!ready(state,id,story)||state.location!=='home')return false;
  const visits=state.romanceVisits||(state.romanceVisits={});
  const previous=visits[id]||{};
  visits[id]={lastDay:state.day,count:(Number(previous.count)||0)+1};
  if(state.romanceVisitPending===id)state.romanceVisitPending=null;
  return true;
 }
 function path(id){
  return known.has(id)?'/rpg-assets/characters/'+id+'/events/final/'+(id==='akari'?'akari_glasses_parody.png':id+'_sneeze_parody.png'):null;
 }
 function open({id,name,discreet=false,cgLines=[],lineOffset=0,onFinish,onCancel}){
  const source=path(id),panApi=typeof window!=='undefined'?window.NeoRpgCGPan:null;
  if(!source||!panApi||!document.body||document.getElementById('neoRomanceVisitCG'))return false;
  const dialog=document.createElement('dialog');
  dialog.id='neoRomanceVisitCG';
  dialog.setAttribute('aria-label',name+' · private moment');
  dialog.style.cssText='border:1px solid #b890bc;border-radius:16px;background:#14121f;color:white;padding:0;width:min(94vw,890px);max-width:94vw;max-height:94dvh;overflow:hidden;box-shadow:0 20px 80px #000e';
  const head=document.createElement('div');
  head.style.cssText='padding:13px 16px;background:#292139;text-align:center;font:700 17px system-ui';
  head.textContent='♥ '+name+' · A quiet moment together';
  const viewport=document.createElement('div');
  viewport.style.cssText='position:relative;overflow:hidden;margin:auto;width:100%;height:min(55dvh,470px);max-width:100%;background:#10101c;isolation:isolate';
  const message=document.createElement('p');
  message.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;margin:0;padding:20px;color:#e1d5ed;font:14px system-ui';
  message.textContent=discreet?'Private moment · artwork hidden in Discreet Mode.':'Loading illustration…';
  const img=document.createElement('img');
  img.alt=name+' private moment illustration';
  img.draggable=false;
  img.hidden=true;
  img.style.cssText='position:absolute;top:0;left:0;width:100%;height:auto;max-width:none;max-height:none;pointer-events:none';
  viewport.append(img,message);
  const note=document.createElement('p');
  note.style.cssText='margin:0;padding:10px 12px;color:#c9badb;text-align:center;font:12px system-ui';
  note.textContent='Animated CG · looping vertical movement';
  const actions=document.createElement('div');
  actions.style.cssText='display:flex;flex-wrap:wrap;justify-content:center;gap:10px;padding:12px 16px 16px';
  const finish=document.createElement('button'),cancel=document.createElement('button');
  for(const button of [finish,cancel]){
   button.type='button';
   button.style.cssText='padding:10px 17px;border-radius:9px;border:1px solid #b38bb8;background:#45315a;color:#fff;font:600 14px system-ui;cursor:pointer';
  }
  finish.textContent='Finish visit';
  finish.disabled=!discreet;
  cancel.textContent='Leave for now';
  actions.append(finish,cancel);
  const subtitle=document.createElement('p');
  subtitle.setAttribute('role','status');
  subtitle.setAttribute('aria-live','off');
  subtitle.style.cssText='box-sizing:border-box;margin:0;padding:11px 18px;min-height:43px;background:#221b30;color:#f8e7f8;text-align:center;font:600 clamp(14px,2vw,17px)/1.4 system-ui;letter-spacing:.01em';
  subtitle.textContent=discreet?'A quiet moment together.':'';
  dialog.append(head,viewport,note,subtitle,actions);
  document.body.append(dialog);
  let pan=null,closed=false,subtitleTimer=null;
  const lines=Array.isArray(cgLines)?cgLines.filter(text=>typeof text==='string'&&text.trim()):[];
  let subtitleIndex=lines.length?Math.abs(Math.trunc(Number(lineOffset)||0))%lines.length:0;
  function startSubtitles(){
   if(discreet||!lines.length||subtitleTimer)return;
   subtitle.textContent=lines[subtitleIndex];
   subtitleTimer=setInterval(()=>{
    if(closed)return;
    subtitleIndex=(subtitleIndex+1)%lines.length;
    subtitle.textContent=lines[subtitleIndex];
   },2400);
  }
  function close(done){
   if(closed)return;
   closed=true;
   if(subtitleTimer!==null){clearInterval(subtitleTimer);subtitleTimer=null;}
   pan?.dispose();pan=null;
   img.removeAttribute('src');
   if(dialog.open)dialog.close();
   dialog.remove();
   if(done)onFinish?.();else onCancel?.();
  }
  finish.onclick=()=>{if(!finish.disabled)close(true);};
  cancel.onclick=()=>close(false);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close(false);});
  dialog.showModal();
  if(!discreet){
   img.onload=()=>{
    if(closed)return;
    const width=Math.max(1,Math.min(window.innerWidth*.92,850,
      window.innerHeight*.72*2*img.naturalWidth/img.naturalHeight));
    viewport.style.width=width+'px';
    viewport.style.height=(width*img.naturalHeight/img.naturalWidth/2)+'px';
    pan=panApi.attach(viewport,img,panApi.defaults);
    img.hidden=false;
    message.style.display='none';
    finish.disabled=false;
    startSubtitles();
   };
   img.onerror=()=>{
    if(closed)return;
    message.textContent='This CG could not load. Leave and try again; the visit will not be used.';
    finish.disabled=true;
   };
   img.src=source;
  }
  return true;
 }
 return Object.freeze({characters,cooldownDays,chapterId,eligible,ready,pending,offerable,
  isFirst,accept,complete,nextDay,path,dialogue,open});
});
