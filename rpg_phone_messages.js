'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NeoRpgPhoneMessages=api;
})(typeof window!=='undefined'?window:null,function(){
  const interval=()=>Math.random()<.5?2:3;
  const photoshootInterval=()=>3+Math.floor(Math.random()*3);
  // Generated from the assets currently under Lyla's actual photoshoot directory.
  const lylaPhotos=["/rpg-assets/characters/lyla/photoshoot/01_black_tank_monochrome.png","/rpg-assets/characters/lyla/photoshoot/01_wet_hair_closeup.png","/rpg-assets/characters/lyla/photoshoot/02_arm_overhead.png","/rpg-assets/characters/lyla/photoshoot/03_outdoor_low_crouch.png","/rpg-assets/characters/lyla/photoshoot/04_bed_playful.png","/rpg-assets/characters/lyla/photoshoot/05_red_editorial_full_body.png","/rpg-assets/characters/lyla/photoshoot/06_red_editorial_compact_proportions.png","/rpg-assets/characters/lyla/photoshoot/06_window_shh_revised.png","/rpg-assets/characters/lyla/photoshoot/07_stadium_blue_cap_white_tee.png","/rpg-assets/characters/lyla/photoshoot/07_window_sailor_outfit.png","/rpg-assets/characters/lyla/photoshoot/08_stadium_raised_tee.png","/rpg-assets/characters/lyla/photoshoot/09_goth_blonde_lyla.png","/rpg-assets/characters/lyla/photoshoot/09_poolside_red_tee.png","/rpg-assets/characters/lyla/photoshoot/10_black_white_reclining.png","/rpg-assets/characters/lyla/photoshoot/11_black_background_windswept_portrait.png","/rpg-assets/characters/lyla/photoshoot/11_red_beret_crouch.png","/rpg-assets/characters/lyla/photoshoot/12142image.jpg","/rpg-assets/characters/lyla/photoshoot/12_manga_wall_pink_top.png","/rpg-assets/characters/lyla/photoshoot/14image.jpg","/rpg-assets/characters/lyla/photoshoot/2image.jpg","/rpg-assets/characters/lyla/photoshoot/31image.jpg","/rpg-assets/characters/lyla/photoshoot/55image.jpg","/rpg-assets/characters/lyla/photoshoot/lyla_photoshoot_05_neon_park_petite.png","/rpg-assets/characters/lyla/photoshoot/lyla_photoshoot_07_chunli_cosplay_petite.png","/rpg-assets/characters/lyla/photoshoot/lyla_photoshoot_09_gingham_mirror.png","/rpg-assets/characters/lyla/photoshoot/lyla_photoshoot_10_mai_cosplay_mirror_petite.png","/rpg-assets/characters/lyla/photoshoot/sweating pose.jpg"];
  const photoBystanders=['yuna','hana','jinx','reina','camila','daisy','barb'];
  const sightingPlaces=['on a bus stop advertisement','in a magazine at the café','on a poster near the card shop','in a fashion magazine','on a display in the shopping district'];
  const sightingLines=[
    'Hey, isn\'t this the girl who goes to the TCG store? I just saw her photo!',
    'Heeey, it\'s Lyla! The girl who used Umbreon! Look what I found.',
    'Wait, that\'s Lyla from the card shop, right? She\'s modeling now?',
    'I spotted someone familiar in this ad. Is that the same Lyla we play cards with?'
  ];
  const fromLyla=[
    'The photographer sent the finished photos. This one was okay, I guess.',
    'This came back from the studio today. Thought you might want to see.',
    'They picked this shot for the final set. I like the lighting.',
    'Finished another modeling job. Here is one of the results.'
  ];
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
  // Reply tone is mechanically stable (warm=affection, curious=trust, neutral=no change),
  // while wording belongs to the actual sender and message type.
  const playerReplies={"hana":[["You earned a break, Hana. The shop can survive five minutes.","Did the shop finally let you sit down?","Save me a booster before you vanish again."],["That smile looks good on you. No sales pitch needed.","Tell me the shop didn't drag you back already.","Lucky Draw's unofficial mascot strikes again."]],"reina":[["Even off the bracket, you look ready to win.","Studying opponents or just checking the lighting?","Careful, your rivals might study this photo."],["That's a strong opening. I approve.","What's the tactical purpose of this angle?","So this is your intimidation strategy?"]],"shiori":[["You look comfortable there. I like that.","Did you find anything worth reading?","You've somehow made a quiet corner look dramatic."],["The peaceful look suits you, Shiori.","What book kept you company today?","Is this where you secretly plan your victories?"]],"yuna":[["You actually stopped moving for a picture? Impressive.","Which arcade machine finally beat your attention span?","New high score: one successful selfie."],["You look like trouble in the best way.","What ridiculous combo are you testing now?","Should I expect a victory pose next?"]],"akari":[["The details are lovely. You clearly planned this.","Was that angle part of your experiment?","How many charts did this photo require?"]],"camila":[["You really know how to make a scene look expensive.","Did you discover something valuable today?","Please tell me this isn't the start of a sales pitch."]],"marina":[["That place looks peaceful. I'd sit there with you.","How was the river today?","Even the water looks like it's posing for you."]],"kaede":[["Not bad. You almost look approachable.","Find any competition worth mentioning?","Did the arcade survive your visit?"]],"jun":[["Good to hear from you. Hope you got some rest.","What have you been running around doing?","Actual downtime? I'll mark the calendar."]],"teo":[["Glad you finally took a break.","Did the shift go all right?","I was about to issue a mandatory rest order."]],"iris":[["You look happy. That's a good moment to keep.","What were you working on?","So this is what escaping your to-do list looks like."]],"elio":[["No big reason is a perfectly good reason.","What caught your attention today?","An unsolicited update from you? Rare loot."]],"alma":[["You look at ease. That's nice to see.","Was the coffee worth the trip?","I assume this counts as official relaxation time."]],"nereo":[["I'm glad you found a quiet moment.","What pulled you away from everything?","I'll frame this as proof you know how to relax."]],"barb":[["This look works. Keep that one.","What was the brief for this shoot?","Should I invoice you for art direction?"]],"laca":[["You deserved that break, Laca.","Was work especially busy today?","You know relaxing is allowed, right?"]],"daisy":[["You look great, Daisy. Rare quiet moment and all.","What finally got you to stop moving?","I'm saving this as evidence you can sit still."]],"rina":[["You look great, even after rehearsal.","Did practice go well?","The hairstyle says you gave it everything."]],"sol":[["Nice shot. It's good to see you relaxed.","What happened before this picture?","Should I be worried about the story behind it?"]],"jinx":[["Okay, that looks ridiculously good. Happy now?","What kind of trouble were you causing?","Try not to let that ego break your phone."]],"luna":[["Looks like you found somewhere special.","Where did you wander off to this time?","You collect odd places like I collect cards."]],"elena":[["You look good. Glad you took a breather.","Anything interesting in those notes?","I hope the notes didn't pose for the photo too."]],"sierra":[["This shot has a really nice mood.","What inspired that pose?","Is this your secret modeling debut?"]],"jicy":[["That's a cute photo, Jicy. Thanks for sending it.","How was your day, really?","Trying to charm me through the phone?"]],"lyla":[["I like this one. You seem comfortable.","Did the photographer make you redo it a lot?","You look almost awake. That's progress."],["The lighting works, but it's still you I noticed.","Was this shoot another long day?","Is that your version of an excited expression?"]]};
  const senderReplies={"hana":["That honestly makes my day. Thank you!","I was supposed to be on break, but you know how the shop gets.","Don't give the customers any ideas!"],"reina":["I wasn't asking for praise. Still... noted.","I always have a reason. Some are just less important.","If it works, it works. You should know that."],"shiori":["You noticed. That's rather kind of you.","Just a few chapters. I could lend it to you.","Only the most dangerous plans, naturally."],"yuna":["I KNOW. A historic achievement!","Something completely irresponsible. You'll love it.","Next time I'm bringing a trophy."],"akari":["Good. The framing took some thought.","It was. I tested three alternatives.","Fewer than you might think. More than one."],"camila":["An excellent assessment, darling.","Perhaps. I'll tell you when the timing is right.","Only if you insist on making an offer."],"marina":["There's room for you here sometime.","Calm for once. I enjoyed it.","It was a good day for the camera."],"kaede":["That's almost a compliment.","Nothing I couldn't handle.","Barely. They should thank me."],"jun":["Thanks. I needed that.","Nothing dramatic. Just too many errands.","You'd be surprised how rare this is."],"teo":["I did. It helped more than I expected.","Busy, but manageable.","I'll submit a formal request next time."],"iris":["I'm glad it comes across that way.","A few things. I finally made progress.","It felt strange not rushing."],"elio":["That's what I thought.","Nothing special. Just felt worth sharing.","Don't get used to it."],"alma":["Thank you. It was a nice moment.","Yes, actually. I'd go again.","I like that definition."],"nereo":["Thank you for saying so.","A bit of fresh air. Nothing more.","You have proof now. Use it wisely."],"barb":["I knew you had taste.","Interesting lighting and a difficult client.","I'll remember that when I get the bill."],"laca":["I really did. Thanks.","Enough to make the break worthwhile.","I'm learning, slowly."],"daisy":["Aw, thank you!","A miracle. Don't ask me to explain it.","Delete that evidence immediately."],"rina":["That's sweet! I needed to hear it.","Intense, but fun.","It has earned its retirement."],"sol":["Good to hear, thanks.","Long story. Mostly harmless.","Only a little."],"jinx":["Very happy. Keep going.","The usual. You'd have enjoyed it.","My phone can handle my greatness."],"luna":["It felt that way too.","I'll show you if we go together.","You make that sound like a talent."],"elena":["Thanks. A short break helped.","A few interesting patterns, actually.","Not without asking for credit."],"sierra":["I'm glad you noticed.","It just felt right for the moment.","I wouldn't go that far!"],"jicy":["Really? I'm glad you liked it.","It was okay. Better now that we're talking.","M-me? I wasn't trying anything!"],"lyla":["Thanks. It was one of the better ones.","Not that many. It just felt like a lot.","That's called being consistent."]};
  const lylaPhotoshootReplies=[[["You have a good eye for the shots you keep.","Was this one your choice or the photographer's?","An Umbreon could never pose this patiently."],["I think this one really suits you.","Did you enjoy this session at all?","How do you manage to look unimpressed in every ad?"]],[["Thanks for showing me the finished one, Lyla.","How many takes did this one need?","So this is what 'just another job' looks like."],["You should keep this one. Seriously.","Do you like the result yourself?","Should I expect this on the next bus stop?"]]];
  const lylaSightingReplies={"yuna":[["That's Lyla! She looks like an endgame boss.","Where did you spot that ad?","Umbreon user by night, magazine star by day."]],"hana":[["That's definitely her! She looks great.","Was that near the shop?","Should we reserve her a celebrity table?"]],"jinx":[["Yeah, that's Lyla. Try not to sound jealous.","Where did you find that photo?","Careful, she might steal your spotlight."]],"reina":[["That's Lyla. Her expression barely changed.","Where was this displayed?","Think she analyzes poses like she analyzes decks?"]],"camila":[["That's Lyla! Pretty striking campaign.","Is it a magazine or an advertisement?","Are you scouting her as a collector's item?"]],"daisy":[["No way, that's our Umbreon girl!","Where'd you run into that photo?","She's famous and still acts half asleep."]],"barb":[["That's Lyla. The styling looks really good.","Did the campaign just launch?","Should we expect autographs at the card shop?"]]};
  function responseSet(pending){
    const variant=(Math.max(0,Number(pending.sequence)||0)+Math.max(0,Number(pending.receivedDay)||0))%2;
    if(pending.type==='lyla_photoshoot'){
      if(pending.character==='lyla')return {
        choices:lylaPhotoshootReplies[variant],replies:[
          "Thanks. I wasn't sure about this one, but I kept it.",
          "It took a while. Modeling is mostly waiting around.",
          "Umbreon would have left after the first take."
        ]};
      const choices=lylaSightingReplies[pending.character]||[
        ["Wait, that's Lyla from the shop!","Where was this picture taken?","She's famous and still won't smile at a topdeck."]
      ];
      return {choices:choices[variant%choices.length],replies:[
        pending.character==='reina'?"At least you recognize her. She plays better than she poses.":"Right? I recognized her from the card shop too!",
        "I saw it on my way through town. Had to show you.",
        pending.character==='jinx'?"I don't share the spotlight. I'm just generous.":"Ha! That's exactly what I thought."
      ]};
    }
    const choices=playerReplies[pending.character]||[
      ["You look happy in this one.","How did your day go?","A rare photo update. I approve."]
    ];
    return {choices:choices[variant%choices.length],replies:senderReplies[pending.character]||[
      "Thanks, that's kind of you.","It was a nice break from everything.","You're impossible."
    ]};
  }
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
    if(!box.lylaPhotoshoot||typeof box.lylaPhotoshoot!=='object'||Array.isArray(box.lylaPhotoshoot)){
      box.lylaPhotoshoot={nextDay:state.day+photoshootInterval(),lastDay:0,seen:[],lastSender:null};changed=true;
    }
    const shoot=box.lylaPhotoshoot;
    if(!Number.isInteger(shoot.nextDay)||shoot.nextDay<=0){shoot.nextDay=state.day+photoshootInterval();changed=true;}
    if(!Number.isInteger(shoot.lastDay)||shoot.lastDay<0){shoot.lastDay=0;changed=true;}
    if(!Array.isArray(shoot.seen)){shoot.seen=[];changed=true;}
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
      '.rpg-phone-photo{touch-action:none}',
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
    let photoPanzoom=null;
    function attachZoom(frame,img){
      const setup=()=>{
       if(!frame.isConnected||!img.naturalWidth||!img.naturalHeight||photoPanzoom)return;
       photoPanzoom=window.NeoRpgImagePanzoom?.mount(frame,img,{maxZoom:6})||null;
      };
      img.addEventListener('load',setup);
      if(img.complete&&img.naturalWidth)setup();
    }
    function photo(pending,frame){
      const photoCharacter=pending.photoSubject||pending.character;
      const name=cast[photoCharacter]?.name||photoCharacter;
      if(discreet?.()&&avatars?.set){
        avatars.set(frame,photoCharacter,'neutral',name);
        const safeImage=frame.querySelector('img.rpg-safe-avatar');
        if(safeImage)attachZoom(frame,safeImage);
        return;
      }
      let src=pending.src||fallbackImage?.(pending.character)||'';
      if(!src){frame.textContent='Photo unavailable';return;}
      const img=make('img');img.src=src;img.alt='Photo featuring '+name;img.loading='eager';
      let triedFallback=false;
      img.onerror=()=>{
        const fallback=fallbackImage?.(pending.character);
        if(!triedFallback&&fallback&&fallback!==img.src){triedFallback=true;img.src=fallback;return;}
        img.remove();frame.textContent='The photo could not be loaded.';
      };
      frame.append(img);
      attachZoom(frame,img);
    }
    function button(label,handler,cls='rpg-phone-choice'){
      const b=make('button',label);b.type='button';b.className=cls;b.addEventListener('click',handler);return b;
    }
    function draw(){
      const pending=state.phoneMessages?.pending;if(!pending)return;
      const name=cast[pending.character]?.name||pending.name||pending.character;
      photoPanzoom?.destroy();photoPanzoom=null;
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
        const options=responseSet(pending).choices;
        ['warm','curious','neutral'].forEach((kind,index)=>{
          choices.append(button('“'+options[index]+'”',()=>reply(kind)));
        });
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
      const pending=state.phoneMessages?.pending;
      if(!pending||pending.phase!=='incoming'||!['warm','curious','neutral'].includes(kind))return;
      const sender=pending.character,subject=pending.photoSubject||sender;
      const index={warm:0,curious:1,neutral:2}[kind];
      const options=responseSet(pending);
      pending.playerLine=options.choices[index];
      pending.replyLine=options.replies[index];
      pending.effectText='';
      // Reactions to a friend's sighting do not increase Lyla's affection:
      // only Lyla herself can receive bond effects from her photo messages.
      if(kind==='warm'){
        if(pending.type!=='lyla_photoshoot'||sender===subject){
          relationships?.apply?.(state,sender,{affection:1});
          pending.effectText='Your bond with '+(cast[sender]?.name||sender)+' grew a little.';
        }
      }else if(kind==='curious'){
        if(pending.type!=='lyla_photoshoot'||sender===subject){
          relationships?.apply?.(state,sender,{trust:1});
          pending.effectText='You got to know '+(cast[sender]?.name||sender)+' a little better.';
        }
      }
      pending.phase='reply';pending.choice=kind;pending.deferred=false;
      persist();draw();
    }
    function defer(){
      const pending=state.phoneMessages?.pending;if(!pending)return;
      pending.deferred=true;persist();photoPanzoom?.destroy();photoPanzoom=null;dialog.close();refresh();
    }
    function finish(){
      const box=state.phoneMessages,pending=box?.pending;if(!pending)return;
      box.lastCharacter=pending.character;
      box.pending=null;
      if(box.nextDay<=state.day)box.nextDay=state.day+interval();
      persist();photoPanzoom?.destroy();photoPanzoom=null;dialog.close();refresh();render();
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
      const box=state.phoneMessages;
      // One received SMS maximum per calendar day, regardless of message type.
      if(box.pending||box.lastSentDay===state.day)return null;
      const shoot=box.lylaPhotoshoot;
      const metLyla=!!(state.met_lyla||state.relationships?.lyla?.affection>0||state.relationships?.lyla?.trust>0||state.bonds?.lyla?.affection>0);
      if(metLyla&&lylaPhotos.length&&state.day>=shoot.nextDay){
        const rank=typeof relationships?.bondRank==='function'?relationships.bondRank(state,'lyla'):0;
        const direct=rank>=2;
        const bystanders=photoBystanders.filter(id=>cast[id]&&
          (state['met_'+id]===true||(id==='reina'&&state.metReina===true)));
        if(direct||bystanders.length){
          const remaining=lylaPhotos.filter(src=>!shoot.seen.includes(src));
          const photos=remaining.length?remaining:lylaPhotos;
          const image=photos[Math.floor(Math.random()*photos.length)];
          const sender=direct?'lyla':bystanders.find(id=>id!==shoot.lastSender)||bystanders[0];
          const caption=direct
            ?fromLyla[Math.floor(Math.random()*fromLyla.length)]
            :sightingLines[Math.floor(Math.random()*sightingLines.length)]+' I saw it '+sightingPlaces[Math.floor(Math.random()*sightingPlaces.length)]+'.';
          box.sequence++;
          box.pending={id:'photoshoot-'+state.day+'-'+box.sequence,type:'lyla_photoshoot',
            character:sender,photoSubject:'lyla',name:cast[sender]?.name||sender,
            pose:'photoshoot',src:image,caption,receivedDay:state.day,phase:'incoming',deferred:false};
          shoot.seen=shoot.seen.filter(src=>lylaPhotos.includes(src));
          if(!shoot.seen.includes(image))shoot.seen.push(image);
          shoot.lastSender=sender;shoot.lastDay=state.day;shoot.nextDay=state.day+photoshootInterval();
          box.lastSentDay=state.day;
          // A photoshoot takes today's SMS slot; keep the ordinary schedule moving.
          if(box.nextDay<=state.day)box.nextDay=state.day+interval();
          persist();return box.pending;
        }
        // No established sender yet: try again later, not as a message from Lyla.
        shoot.nextDay=state.day+1;
      }
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