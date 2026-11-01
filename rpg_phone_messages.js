'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NeoRpgPhoneMessages=api;
})(typeof window!=='undefined'?window:null,function(){
  const interval=()=>Math.random()<.5?2:3;
  const voices={
    hana:{caption:'I found a quiet minute between everything. This one came out kind of cute, right?',context:'I escaped the shop for a quick break.'},
    reina:{caption:'A quick photo from between rounds. You can tell me honestly if the angle works.',context:'I was checking the tournament board.'},
    shiori:{caption:'A little pause from my reading. The light was nice, so I took a photo.',context:'I was looking for a quiet corner to read.'},
    yuna:{caption:'I got up from the game long enough to take this. That counts as progress, right?',context:'I was taking a break from the arcade.'},
    akari:{caption:'I was testing a look for my sketchbook. I thought you might appreciate the details.',context:'I was collecting ideas for a new design.'},
    camila:{caption:'Tiny break, quick photo. I liked the colors, so I wanted to share it with you.',context:'I was browsing the card displays.'},
    marina:{caption:'A little moment from my day. The light made the whole place look peaceful.',context:'I had a quiet moment to myself.'},
    kaede:{caption:'Look, I remembered to take a photo before getting distracted by another game.',context:'I was on my way past the arcade.'},
    jun:{caption:'Quick check-in from my day. I figured you could use a change of scenery.',context:'I was taking a break between errands.'},
    teo:{caption:'Proof I took a break instead of doing one more task. What do you think?',context:'I was wrapping up a shift.'},
    iris:{caption:'The light was nice for once, so I took advantage of it. Sending it your way.',context:'I was finishing up a few things.'},
    elio:{caption:'This seemed like a good enough moment to send you a photo. No big reason.',context:'I had a few minutes free.'},
    alma:{caption:'A quick little update from my day. I thought you might like this one.',context:'I was on a coffee break.'},
    nereo:{caption:'A rare quiet moment. I thought I would share it before the day got busy again.',context:'I was stepping away for a minute.'},
    barb:{caption:'Test shot from today. Be honest: does this look work, or should I try another?',context:'I was checking a look for a shoot.'},
    laca:{caption:'Quick break. I liked how this photo came out, so I thought I would send it.',context:'I was taking a breather after work.'},
    daisy:{caption:'Caught me sitting still for once. This may be a collector’s item.',context:'I was taking a break between plans.'},
    rina:{caption:'Post-rehearsal selfie! My hair has absolutely given up, but I kind of like it.',context:'I had just finished practicing.'},
    sol:{caption:'A quick photo from today. I figured you would get a laugh out of it.',context:'I was taking a breather.'},
    jinx:{caption:'Caught me between rounds. Don’t act surprised I look this cool.',context:'I was taking a break from the action.'},
    luna:{caption:'A little update from my day. I thought you might like seeing where I ended up.',context:'I was wandering around town.'},
    elena:{caption:'I was reviewing some notes and took a break for a photo. How is your day going?',context:'I was taking a break from my work.'},
    sierra:{caption:'A small check-in from me. I liked this pose, so I thought I would share it.',context:'I had a moment to myself.'},
    jicy:{caption:'A little photo from my day. I thought you might enjoy the view.',context:'I was taking a short break.'},
    lyla:{caption:'Quick selfie before I head out. I thought you might like this one.',context:'I had a few minutes free.'}
  };
  const favoritePose=/back|rear|seated|sitting|crouch|kneel|arcade|lean|reach|cards|special|phone|playing|sketch|coffee|book|look/i;
  const make=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
  function normalize(state){
    let changed=false;
    if(!state.phoneMessages||typeof state.phoneMessages!=='object'||Array.isArray(state.phoneMessages)){
      state.phoneMessages={nextDay:state.day+interval(),lastSentDay:0,lastCharacter:null,sequence:0,pending:null};changed=true;
    }
    const box=state.phoneMessages;
    if(!Number.isInteger(box.nextDay)||box.nextDay<=0){box.nextDay=state.day+interval();changed=true;}
    if(!Number.isInteger(box.lastSentDay)||box.lastSentDay<0){box.lastSentDay=0;changed=true;}
    if(!Number.isInteger(box.sequence)||box.sequence<0){box.sequence=0;changed=true;}
    if(box.pending&&(!box.pending.character||!['incoming','reply'].includes(box.pending.phase))) {box.pending=null;changed=true;}
    return changed;
  }
  function imageFor(id,manifest){
    const poses=manifest?.characters?.[id]?.poses||{};
    const rows=Object.entries(poses).filter(([,art])=>typeof art?.src==='string'&&art.src.startsWith('/rpg-assets/characters/'));
    const unique=[],seen=new Set();
    for(const [key,art] of rows){if(seen.has(art.src))continue;seen.add(art.src);unique.push({key,art});}
    if(!unique.length)return null;
    const preferred=unique.filter(({key,art})=>favoritePose.test(key+' '+art.src)||art.facing==='back');
    const varied=unique.filter(({key})=>!/^standing$|^greeting$/i.test(key));
    const pool=preferred.length?preferred:varied.length?varied:unique;
    const selected=pool[Math.floor(Math.random()*pool.length)];
    return {pose:selected.key,src:selected.art.src};
  }
  function makeCopy(id){
    return voices[id]||{caption:'A little moment from my day. I thought you might like to see it.',context:'I had a few minutes free.'};
  }
  function create(options){
    const {state,cast,manifest,relationships,persist,render,canShow,people,fallbackImage,audio,discreet,avatars}=options;
    if(normalize(state))persist();
    const style=make('style');
    style.textContent=[
      '.rpg-phone-notice{position:fixed;right:18px;bottom:max(18px,env(safe-area-inset-bottom));z-index:10020;border:1px solid #cf8abd;border-radius:999px;background:#241a35;color:#fff;padding:11px 16px;box-shadow:0 8px 28px #0009;font:700 14px system-ui;cursor:pointer}',
      '.rpg-phone-notice[hidden]{display:none}',
      '.rpg-phone-dialog{width:min(480px,calc(100vw - 24px));max-width:480px;max-height:min(92vh,820px);padding:0;overflow:hidden;border:1px solid #d68bc0;border-radius:20px;background:#171426;color:#f8f4ff;box-shadow:0 24px 90px #000c;font-family:system-ui,sans-serif}',
      '.rpg-phone-dialog::backdrop{background:#070612c9;backdrop-filter:blur(5px)}',
      '.rpg-phone-shell{display:grid;grid-template-rows:auto 1fr auto;max-height:min(92vh,820px)}',
      '.rpg-phone-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid #6d5279;background:#221b32}',
      '.rpg-phone-kicker{color:#f2a7d0;font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}',
      '.rpg-phone-day{color:#cbbbd6;font-size:12px}',
      '.rpg-phone-content{overflow:auto;padding:16px 18px}',
      '.rpg-phone-name{margin:0 0 10px;font-size:20px;color:#ffd0e8}',
      '.rpg-phone-photo{position:relative;display:grid;place-items:center;width:100%;height:min(42vh,370px);min-height:190px;overflow:hidden;border:1px solid #9c70a6;border-radius:15px;background:radial-gradient(ellipse at 50% 38%,#55364f,#211b32 76%)}',
      '.rpg-phone-photo img{display:block;width:100%;height:100%;object-fit:contain}',
      '.rpg-phone-caption,.rpg-phone-bubble{max-width:95%;margin:14px 0 0;padding:12px 14px;border:1px solid #745c80;border-radius:14px;background:#29253b;line-height:1.45}',
      '.rpg-phone-bubble.player{margin-left:auto;border-color:#a65d91;background:#49304b}',
      '.rpg-phone-choices{display:grid;gap:9px;margin-top:16px}',
      '.rpg-phone-choice{width:100%;padding:12px 14px;border:1px solid #846b91;border-radius:12px;background:#29233a;color:#fff;text-align:left;font:700 14px/1.35 system-ui;cursor:pointer}',
      '.rpg-phone-choice:hover,.rpg-phone-choice:focus-visible{border-color:#efadd5;background:#3a2b47}',
      '.rpg-phone-effect{margin:12px 0 0;color:#e8b4d6;font-size:13px}',
      '.rpg-phone-foot{display:flex;justify-content:flex-end;gap:10px;padding:12px 18px;border-top:1px solid #5d486a;background:#211b30}',
      '.rpg-phone-later{padding:9px 14px;border:1px solid #776383;border-radius:10px;background:#282439;color:#e8dfee;font:700 13px system-ui;cursor:pointer}',
      '@media(max-width:560px){.rpg-phone-content{padding:13px}.rpg-phone-photo{height:min(38vh,320px);min-height:160px}.rpg-phone-dialog{border-radius:16px}}'
    ].join('');
    document.head.append(style);
    const notice=make('button','📱 New photo message');
    notice.type='button';notice.className='rpg-phone-notice';notice.hidden=true;notice.setAttribute('aria-label','Open new photo message');
    const dialog=make('dialog');dialog.id='phoneMessageDialog';dialog.className='rpg-phone-dialog';dialog.setAttribute('aria-label','Photo message');
    dialog.addEventListener('cancel',event=>event.preventDefault());
    document.body.append(notice,dialog);
    function safe(){return !dialog.open&&canShow();}
    function photo(pending,frame){
      const name=cast[pending.character]?.name||pending.character;
      if(discreet?.()&&avatars?.set){avatars.set(frame,pending.character,'neutral',name);return;}
      let src=pending.src||fallbackImage?.(pending.character)||'';
      if(!src){frame.textContent='Photo unavailable';return;}
      const img=make('img');img.src=src;img.alt='Photo from '+name;img.loading='eager';
      let triedFallback=false;
      img.onerror=()=>{
        const fallback=fallbackImage?.(pending.character);
        if(!triedFallback&&fallback&&fallback!==img.src){triedFallback=true;img.src=fallback;return;}
        img.remove();frame.textContent='The photo could not be loaded.';
      };
      frame.append(img);
    }
    function button(label,handler,cls='rpg-phone-choice'){
      const b=make('button',label);b.type='button';b.className=cls;b.addEventListener('click',handler);return b;
    }
    function draw(){
      const pending=state.phoneMessages?.pending;if(!pending)return;
      const name=cast[pending.character]?.name||pending.name||pending.character;
      dialog.replaceChildren();
      const shell=make('div');shell.className='rpg-phone-shell';
      const head=make('header');head.className='rpg-phone-head';
      const brand=make('div');brand.className='rpg-phone-kicker';brand.textContent='✦ NEO HARBOR · PHOTO CHAT';
      const day=make('div');day.className='rpg-phone-day';day.textContent='DAY '+pending.receivedDay;
      head.append(brand,day);
      const content=make('main');content.className='rpg-phone-content';
      const title=make('h2',name);title.className='rpg-phone-name';
      const frame=make('div');frame.className='rpg-phone-photo';photo(pending,frame);
      content.append(title,frame);
      if(pending.phase==='incoming'){
        const caption=make('p',pending.caption);caption.className='rpg-phone-caption';
        const prompt=make('p','What do you send back?');prompt.className='rpg-phone-effect';
        const choices=make('div');choices.className='rpg-phone-choices';
        choices.append(
          button('“You look great. I’m glad you sent it to me.”',()=>reply('warm')),
          button('“What were you doing when you took it?”',()=>reply('curious')),
          button('Send a Pokémon sticker 😊',()=>reply('neutral'))
        );
        content.append(caption,prompt,choices);
      }else{
        const caption=make('p',pending.caption);caption.className='rpg-phone-caption';
        const sent=make('p',pending.playerLine);sent.className='rpg-phone-bubble player';
        const received=make('p',pending.replyLine);received.className='rpg-phone-bubble';
        content.append(caption,sent,received);
        if(pending.effectText){const effect=make('p',pending.effectText);effect.className='rpg-phone-effect';content.append(effect);}
      }
      const foot=make('footer');foot.className='rpg-phone-foot';
      if(pending.phase==='incoming'){
        foot.append(button('Later',defer,'rpg-phone-later'));
      }else{
        foot.append(button('Back to game',finish,'rpg-phone-later'));
      }
      shell.append(head,content,foot);dialog.append(shell);
    }
    function reply(kind){
      const pending=state.phoneMessages?.pending;if(!pending||pending.phase!=='incoming')return;
      const id=pending.character;
      if(kind==='warm'){
        relationships?.apply?.(state,id,{affection:1});
        pending.effectText='Your bond with '+(cast[id]?.name||id)+' grew a little.';
        pending.playerLine='You look great. I’m glad you sent it to me.';
        pending.replyLine='I was hoping you’d like it. I wanted to share this with you.';
      }else if(kind==='curious'){
        relationships?.apply?.(state,id,{trust:1});
        pending.effectText='You got to know '+(cast[id]?.name||id)+' a little better.';
        pending.playerLine='What were you doing when you took it?';
        pending.replyLine=''+(makeCopy(id).context)+' It was nice to have a moment to myself.';
      }else{
        pending.effectText='';
        pending.playerLine='You sent a Pokémon sticker 😊';
        pending.replyLine='Okay, that sticker is pretty good. I’ll allow it.';
      }
      pending.phase='reply';pending.choice=kind;pending.deferred=false;
      persist();draw();
    }
    function defer(){
      const pending=state.phoneMessages?.pending;if(!pending)return;
      pending.deferred=true;persist();dialog.close();refresh();
    }
    function finish(){
      const box=state.phoneMessages,pending=box?.pending;if(!pending)return;
      box.lastCharacter=pending.character;
      box.pending=null;
      if(box.nextDay<=state.day)box.nextDay=state.day+interval();
      persist();dialog.close();refresh();render();
    }
    function open(){
      const pending=state.phoneMessages?.pending;
      if(!pending||dialog.open||!canShow())return false;
      pending.deferred=false;draw();dialog.showModal();notice.hidden=true;
      if(pending.phase==='incoming')audio?.();
      return true;
    }
    function refresh(){
      const pending=state.phoneMessages?.pending;
      notice.hidden=!pending||dialog.open;
      if(pending){
        notice.textContent=pending.phase==='reply'?'📱 Continue photo chat':'📱 New photo message';
        notice.disabled=!canShow();
      }
    }
    notice.addEventListener('click',()=>open());
    function showIfReady(){
      refresh();
      const pending=state.phoneMessages?.pending;
      if(pending&&!pending.deferred&&safe())open();
    }
    function onDayAdvance(previousDay){
      normalize(state);
      if(state.day<=previousDay||state.day>90)return null;
      const box=state.phoneMessages;if(box.pending)return null;
      if(state.day<box.nextDay)return null;
      const present=new Set(typeof people==='function'?people():[]);
      let candidates=Object.keys(cast).filter(id=>
        (state['met_'+id]===true||(id==='reina'&&state.metReina===true))&&!present.has(id)
      );
      if(candidates.length>1)candidates=candidates.filter(id=>id!==box.lastCharacter);
      if(!candidates.length){box.nextDay=state.day+1;persist();return null;}
      const id=candidates[Math.floor(Math.random()*candidates.length)],visual=imageFor(id,manifest),copy=makeCopy(id);
      box.sequence++;
      box.pending={
        id:'selfie-'+state.day+'-'+box.sequence,character:id,name:cast[id]?.name||id,
        pose:visual?.pose||'portrait',src:visual?.src||fallbackImage?.(id)||'',
        caption:copy.caption,receivedDay:state.day,phase:'incoming',deferred:false
      };
      box.lastSentDay=state.day;box.nextDay=state.day+interval();
      persist();return box.pending;
    }
    normalize(state);refresh();
    return Object.freeze({onDayAdvance,showIfReady,open,refresh});
  }
  return Object.freeze({create,normalize,imageFor});
});