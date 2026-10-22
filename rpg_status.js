'use strict';
// Read-only RPG status view. Uses the live campaign state; never awards stats or alters saves.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NeoRpgStatus=api;
})(typeof window!=='undefined'?window:null,function(){
  const score=value=>Number.isFinite(Number(value))?Math.max(0,Math.floor(Number(value))):0;
  const stats=['affection','trust','respect','attraction'];
  const periods=['Morning','Afternoon','Evening'];
  const labelFor=(affection,trust)=>{
    if(affection>=15&&trust>=10)return 'Deep connection';
    if(affection>=8&&trust>=5)return 'Close bond';
    if(affection>=3||trust>=2)return 'Getting closer';
    return 'New acquaintance';
  };

  function project(state,cast,plan){
    const s=state||{},people=[];
    for(const [id,c] of Object.entries(cast||{})){
      const r=s.relationships?.[id]||{},old=s.bonds?.[id]||{};
      const values={};
      for(const key of stats)values[key]=score(key==='affection'||key==='trust'?Math.max(score(r[key]),score(old[key])):r[key]);
      const duels=Math.max(score(r.duels),score(old.duels));
      const chapters=plan?.byNpc?.[id]||[];
      const completed=chapters.filter(eventId=>!!s.storyDone?.[eventId]).length;
      const outcome=s.routeOutcomes?.[id]||null;
      const partner=s.partner===id;
      const discovered=!!s['met_'+id]||(id==='reina'&&!!s.metReina)||partner||!!outcome||
        duels>0||completed>0||stats.some(key=>values[key]>0);
      if(!discovered)continue; // No names, portraits or paths for strangers.
      people.push({
        id,name:c.name||id,style:c.style||'',...values,duels,
        completed,total:chapters.length,trialWon:!!s.bondTrials?.[id],
        outcome,partner,connection:labelFor(values.affection,values.trust)
      });
    }
    people.sort((a,b)=>Number(b.partner)-Number(a.partner)||
      b.affection-a.affection||b.trust-a.trust||a.name.localeCompare(b.name));
    const results=Array.isArray(s.results)?s.results:[],wins=results.filter(x=>x?.won===true).length;
    return {
      day:Math.min(90,Math.max(1,score(s.day)||1)),ended:score(s.day)>90,
      period:periods[score(s.slot)]||'Morning',points:score(s.points),
      credits:score(s.credits),focus:score(s.focus),insight:score(s.insight),
      reputation:score(s.reputation),duels:results.length,wins,
      chapterCount:Object.keys(s.storyDone||{}).filter(id=>!!s.storyDone[id]).length,
      known:people,undiscovered:Math.max(0,Object.keys(cast||{}).length-people.length),
      partnerName:people.find(p=>p.partner)?.name||null
    };
  }

  function el(tag,className,text){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=String(text);
    return node;
  }
  function cell(label,value){
    const item=el('div','status-overview-stat');
    item.append(el('small','',label),el('strong','',value));
    return item;
  }
  function meter(label,value){
    const row=el('div','status-meter');
    const head=el('div','status-meter-head');
    head.append(el('span','',label),el('strong','',value));
    const track=el('div','status-meter-track');
    track.setAttribute('role','meter');
    track.setAttribute('aria-label',label+' (first 20 points visualized)');
    track.setAttribute('aria-valuemin','0');
    track.setAttribute('aria-valuemax','20');
    track.setAttribute('aria-valuenow',String(Math.min(value,20)));
    const fill=el('span','status-meter-fill');
    fill.style.width=Math.min(100,value/20*100)+'%';
    track.append(fill);
    row.append(head,track);
    return row;
  }

  function open(state,cast,plan,avatar){
    const dialog=document.getElementById('statusDialog');
    const overview=document.getElementById('statusOverview');
    const characters=document.getElementById('statusCharacters');
    const detail=document.getElementById('statusDetail');
    const count=document.getElementById('statusCount');
    if(!dialog||!overview||!characters||!detail||!count)return;
    const data=project(state,cast,plan);
    overview.replaceChildren(
      cell('SEASON',data.ended?'Complete':'Day '+data.day+' / 90 · '+data.period),
      cell('CIRCUIT POINTS',data.points),
      cell('CREDITS',data.credits),
      cell('DUEL RECORD',data.wins+' W / '+data.duels+' played'),
      cell('FOCUS',data.focus),
      cell('REPUTATION',data.reputation),
      cell('INSIGHT',data.insight),
      cell('STORY CHAPTERS',data.chapterCount)
    );
    count.textContent=data.known.length+' met · '+data.undiscovered+' yet to discover';
    characters.replaceChildren();
    detail.replaceChildren();
    const buttons=new Map();
    function select(person){
      for(const [id,button] of buttons){
        const active=id===person.id;
        button.classList.toggle('is-selected',active);
        button.setAttribute('aria-pressed',String(active));
      }
      detail.replaceChildren();
      const heading=el('div','status-detail-heading');
      const headingText=el('div','status-detail-heading-text');
      headingText.append(el('small','status-eyebrow','PERSONAL CONNECTION'),el('h3','',person.name));
      if(person.style)headingText.append(el('p','',person.style));
      heading.append(headingText);
      if(person.partner)heading.append(el('span','status-partner-tag','♥ PARTNER'));
      detail.append(heading,el('p','status-connection-label',person.connection));
      const meters=el('div','status-meters');
      for(const key of stats)meters.append(meter(key[0].toUpperCase()+key.slice(1),person[key]));
      detail.append(meters);
      const notes=el('div','status-detail-facts');
      notes.append(cell('DUELS TOGETHER',person.duels));
      notes.append(cell('CHARACTER CHAPTERS',person.completed+' / '+person.total));
      notes.append(cell('PERSONAL CHALLENGE',person.trialWon?'Completed':'Not completed'));
      detail.append(notes);
      if(person.outcome==='romance'||person.outcome==='friendship')
        detail.append(el('p','status-route',person.outcome==='romance'?'♥ Romance route chosen':'✧ Friendship route chosen'));
      detail.append(el('p','status-disclaimer','Numbers are your real saved relationship stats. Bars visualize the first 20 points, not a maximum. Connection labels are descriptive; story choices and requirements still decide outcomes.'));
    }

    for(const person of data.known){
      const button=el('button','status-character');
      button.type='button';button.setAttribute('aria-pressed','false');
      const portrait=el('span','status-character-avatar');
      if(typeof avatar==='function'){
        portrait.append(avatar(person.id));
        // Respect the RPG's work-safe portrait mode.
        window.NeoRpgDiscreetAvatars?.set?.(portrait,person.id,'neutral',person.name);
      }else portrait.append(el('span','status-character-initials',person.name.split(' ').map(x=>x[0]).slice(0,2).join('')));
      const body=el('span','status-character-body');
      body.append(el('strong','',person.name),el('small','',person.partner?'♥ Partner':person.connection));
      const mini=el('span','status-character-progress');
      const filled=el('span','');
      filled.style.width=Math.min(100,person.affection/20*100)+'%';
      mini.append(filled);body.append(mini);
      button.append(portrait,body);
      button.addEventListener('click',()=>select(person));
      characters.append(button);
      buttons.set(person.id,button);
    }
    if(data.undiscovered){
      const note=el('p','status-undiscovered',data.undiscovered+' more '+(data.undiscovered===1?'person':'people')+' to meet. Their identities and stories are hidden until you encounter them.');
      characters.append(note);
    }
    if(data.known.length)select(data.known[0]);
    else detail.append(el('p','status-empty','Your connections will appear here after you meet characters in Neo Harbor. Explore town and talk to people to get started.'));
    if(!dialog.open)dialog.showModal();
  }
  function close(){const dialog=document.getElementById('statusDialog');if(dialog?.open)dialog.close();}
  return Object.freeze({project,open,close});
});
