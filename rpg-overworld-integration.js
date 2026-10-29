'use strict';
// Optional adapter. All campaign changes go through the existing RPG controller.
(()=>{
  const bridge=()=>window.NeoRpgOverworldBridge;
  function mount(){
    if(document.getElementById('neoOverworldLaunch')||!bridge())return;
    const mapToggle=document.getElementById('rpgMapToggle');
    if(!mapToggle)return;
    const open=document.createElement('button');open.type='button';open.id='neoOverworldLaunch';open.className='toolbar-btn';open.textContent='◈ OVERWORLD';open.title='Explore your current location on the overworld map';
    mapToggle.insertAdjacentElement('afterend',open);
    const overlay=document.createElement('section');
    overlay.id='neoOverworldOverlay';overlay.hidden=true;overlay.setAttribute('aria-label','Explore Neo Harbor overworld');
    Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'9998',background:'#101021',display:'none',flexDirection:'column',color:'#fff',fontFamily:'system-ui,sans-serif'});
    const toolbar=document.createElement('div');Object.assign(toolbar.style,{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',padding:'8px 12px',background:'#211a37',borderBottom:'1px solid #785c8b'});
    const title=document.createElement('strong');title.style.marginRight='auto';title.textContent='NEO CAMPUS · OVERWORLD';
    const placeSelect=document.createElement('select');placeSelect.setAttribute('aria-label','Travel destination');Object.assign(placeSelect.style,{background:'#322943',color:'#fff',padding:'8px',borderRadius:'8px'});
    const travel=document.createElement('button');travel.type='button';travel.textContent='Travel';const close=document.createElement('button');close.type='button';close.textContent='✕ Return to RPG';
    for(const b of [travel,close])Object.assign(b.style,{padding:'8px 12px',borderRadius:'8px',border:'1px solid #9775a3',background:'#403051',color:'#fff',cursor:'pointer'});
    const note=document.createElement('small');note.setAttribute('role','status');note.style.padding='6px 12px';note.style.background='#211a37';note.textContent='RPG time, schedules and story locks remain authoritative.';
    const frame=document.createElement('iframe');frame.title='Current Neo Campus location';Object.assign(frame.style,{flex:'1',minHeight:'0',width:'100%',border:'0'});
    toolbar.append(title,placeSelect,travel,close);overlay.append(toolbar,note,frame);document.body.append(overlay);
    function snapshot(){return bridge()?.snapshot();}
    function refresh(){
      const data=snapshot();if(!data)return;
      placeSelect.replaceChildren();
      for(const p of data.places){const option=document.createElement('option');option.value=p.id;option.textContent=p.name;placeSelect.append(option);}
      placeSelect.value=data.location;travel.disabled=data.locked;
      const people=data.people.join(',');
      frame.src='/overworld-prototype.html?scene='+encodeURIComponent(data.location)+'&cast='+encodeURIComponent(people)+'&rpg-integration=1';
      note.textContent=data.locked?'Travel disabled during an active conversation, event or duel.':'Day '+data.day+' · '+['Morning','Afternoon','Evening'][data.slot]+' · RPG schedules active · Preview NPC interaction only';
    }
    function dismiss(){overlay.hidden=true;overlay.style.display='none';frame.src='about:blank';open.focus();}
    open.addEventListener('click',()=>{refresh();overlay.hidden=false;overlay.style.display='flex';close.focus();});
    close.addEventListener('click',dismiss);
    travel.addEventListener('click',()=>{
      const target=placeSelect.value;const data=snapshot();if(!data)return;
      if(target===data.location){note.textContent='You are already here.';return;}
      if(!bridge().travel(target)){note.textContent='Travel is unavailable during the current story or activity.';refresh();return;}
      refresh();
    });
    window.addEventListener('message',event=>{
      if(event.origin!==location.origin||event.source!==frame.contentWindow||overlay.hidden)return;
      const message=event.data;if(message?.type!=='neo-overworld-action')return;
      if(message.kind==='navigation'){
        const targets={status:'statusBtn',deck:'deckStudioBtn',activities:'townActivities',events:'storyEvents'};
        const target=document.getElementById(targets[message.id]);
        dismiss();
        if(!target)return;
        if(message.id==='status'||message.id==='deck')target.click();
        else target.scrollIntoView({behavior:'smooth',block:'center'});
        return;
      }
      if(message.kind==='person'){
        if(bridge()?.interact(message.id))dismiss();
        else note.textContent='Character interaction is not currently available.';
      }else if(message.kind==='hotspot'){
        const activities=bridge()?.activities()||[];
        const eligible=activities.filter(a=>!a.disabled);
        if(!eligible.length){note.textContent='No activities are available right now.';return;}
        const panel=document.createElement('div');Object.assign(panel.style,{position:'absolute',bottom:'68px',left:'12px',right:'12px',padding:'12px',maxHeight:'45vh',overflow:'auto',background:'#211a37',border:'1px solid #9775a3',borderRadius:'12px',zIndex:'2'});
        const head=document.createElement('div');head.textContent='Choose a current RPG activity';panel.append(head);
        for(const a of eligible){const button=document.createElement('button');button.textContent=a.title;button.type='button';Object.assign(button.style,{display:'block',marginTop:'8px',padding:'10px',width:'100%',background:'#403051',color:'white',borderRadius:'8px'});button.onclick=()=>{panel.remove();if(bridge()?.activity(a.id))dismiss();else note.textContent='Activity no longer available.';};panel.append(button);}
        const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.onclick=()=>panel.remove();panel.append(cancel);overlay.append(panel);
      }
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.hidden)dismiss();});
  }
  window.addEventListener('neo-rpg-overworld-bridge-ready',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
