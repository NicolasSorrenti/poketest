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
  const SOCIAL=typeof module==='object'&&module.exports?require('./rpg_social_activities'):
    (typeof window!=='undefined'?window.NeoRpgSocialActivities:null);
  const REL=typeof module==='object'&&module.exports?require('./rpg_relationships'):
    (typeof window!=='undefined'?window.NeoRpgRelationships:null);
  // Persona-inspired social-link labels. These stay neutral so a high bond can
  // represent friendship, romance, or a relationship the player has not defined yet.
  const RANK_NAMES=Object.freeze([
    'First Contact',
    'Familiar Face',
    'Trusted Company',
    'Closer Than Words',
    'Shared Secret',
    'Unbreakable Bond'
  ]);
  const RANK_UNLOCKS=Object.freeze([
    'Meet them and begin learning their story.',
    'More personal conversations begin to appear.',
    'Trust-building events and deeper conversations become available.',
    'Private and vulnerable story conversations become available.',
    'Final relationship choices and route scenes become available.',
    'Maximum bond reached. Keep spending time together for bonus conversations.'
  ]);
  const BOND_METRICS=['affection','trust','respect','attraction'];
  const DEFAULT_BOND_WEIGHTS={affection:2,trust:2,respect:2,attraction:2};
  const rankInfo=(values,id)=>{
    const profile=REL?.profileFor?.(id);
    const weights=profile?.weights||DEFAULT_BOND_WEIGHTS;
    const bondScore=BOND_METRICS.reduce((total,key)=>total+
      (Number(values[key])||0)*(Number(weights[key])||0),0);
    const thresholds=Array.isArray(REL?.rankThresholds)&&REL.rankThresholds.length
      ?REL.rankThresholds:[0,8,18,28,40,55];
    let rank=0;
    for(let index=1;index<thresholds.length;index++){
      if(bondScore>=thresholds[index])rank=index;
      else break;
    }
    const maxRank=thresholds.length-1;
    const currentThreshold=Number(thresholds[rank])||0;
    const nextThreshold=Number(thresholds[Math.min(rank+1,maxRank)])||currentThreshold;
    const progress=rank>=maxRank?100:Math.max(0,Math.min(100,
      Math.round((bondScore-currentThreshold)/Math.max(1,nextThreshold-currentThreshold)*100)));
    return {
      score:Math.floor(bondScore),rank,name:RANK_NAMES[rank]||('Bond Rank '+rank),
      progress,currentThreshold,nextThreshold,maxRank,
      nextRank:Math.min(rank+1,maxRank),
      nextName:RANK_NAMES[Math.min(rank+1,maxRank)]||'Maximum Bond',
      nextUnlock:RANK_UNLOCKS[Math.min(rank+1,maxRank)]||RANK_UNLOCKS.at(-1)
    };
  };
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
      const bond=rankInfo(values,id);
      people.push({
        id,name:c.name||id,style:c.style||'',...values,duels,bond,
        completed,total:chapters.length,trialWon:!!s.bondTrials?.[id],
        outcome,partner,connection:labelFor(values.affection,values.trust),
        likes:SOCIAL?.learnedLikes(s,id,cast)||[]
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

  function installPersonaStyles(){
    if(document.getElementById('rpgPersonaStatusStyles'))return;
    const style=document.createElement('style');
    style.id='rpgPersonaStatusStyles';
    style.textContent=`
      .status-persona-rank{
        margin:1rem 0 1.1rem;
        padding:1rem 1.1rem;
        border:1px solid rgba(226,170,255,.72);
        border-radius:16px;
        background:linear-gradient(135deg,rgba(55,28,82,.97),rgba(24,27,59,.97));
        color:#fff;
        box-shadow:0 12px 28px rgba(12,8,28,.22);
      }
      .status-persona-rank-header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:.75rem;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .status-persona-rank-kicker{color:#f3b8ff;font-size:.68rem}
      .status-persona-rank-number{
        padding:.25rem .52rem;
        border:1px solid rgba(255,255,255,.42);
        border-radius:999px;
        font-size:.72rem;
      }
      .status-persona-rank-name{
        margin:.45rem 0 .8rem;
        font-size:1.25rem;
        line-height:1.1;
      }
      .status-persona-rank-progress{
        height:9px;
        overflow:hidden;
        border-radius:999px;
        background:rgba(255,255,255,.18);
      }
      .status-persona-rank-fill{
        display:block;
        height:100%;
        border-radius:inherit;
        background:linear-gradient(90deg,#ff87d7,#ffd36a);
        transition:width .25s ease;
      }
      .status-persona-rank-progress-label{
        display:block;
        margin-top:.42rem;
        color:rgba(255,255,255,.78);
        font-size:.72rem;
        letter-spacing:.04em;
      }
      .status-persona-next{
        margin:.8rem 0 0;
        color:rgba(255,255,255,.86);
        font-size:.82rem;
        line-height:1.45;
      }
      .status-persona-next strong{
        display:block;
        margin-bottom:.15rem;
        color:#ffd36a;
        font-size:.7rem;
        letter-spacing:.08em;
      }
      .status-character-rank{
        color:#bd75d7;
        font-size:.68rem;
        letter-spacing:.04em;
      }
      .status-character-progress[aria-label]{display:block}
    `;
    document.head.appendChild(style);
  }

  function open(state,cast,plan,avatar,onTutorialsChange){
    const dialog=document.getElementById('statusDialog');
    const overview=document.getElementById('statusOverview');
    const characters=document.getElementById('statusCharacters');
    const detail=document.getElementById('statusDetail');
    const count=document.getElementById('statusCount');
    if(!dialog||!overview||!characters||!detail||!count)return;
    installPersonaStyles();
    const tutorialToggle=document.getElementById('statusTutorialToggle');
    if(tutorialToggle){
      tutorialToggle.checked=state?.gameplayTutorials?.disabled===true;
      tutorialToggle.onchange=()=>{
        if(typeof onTutorialsChange==='function')onTutorialsChange(!!tutorialToggle.checked);
      };
    }
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
      const bond=person.bond;
      const rankCard=el('section','status-persona-rank');
      const rankHeader=el('div','status-persona-rank-header');
      rankHeader.append(
        el('small','status-persona-rank-kicker','SOCIAL LINK'),
        el('strong','status-persona-rank-number','RANK '+bond.rank)
      );
      rankCard.append(
        rankHeader,
        el('h4','status-persona-rank-name',bond.name)
      );
      const rankTrack=el('div','status-persona-rank-progress');
      rankTrack.setAttribute('role','progressbar');
      rankTrack.setAttribute('aria-label','Progress toward the next bond rank');
      rankTrack.setAttribute('aria-valuemin','0');
      rankTrack.setAttribute('aria-valuemax','100');
      rankTrack.setAttribute('aria-valuenow',String(bond.progress));
      const rankFill=el('span','status-persona-rank-fill');
      rankFill.style.width=bond.progress+'%';
      rankTrack.append(rankFill);
      rankCard.append(rankTrack);
      const rankProgress=el('small','status-persona-rank-progress-label',
        bond.rank>=bond.maxRank?'MAX RANK · '+bond.score+' BOND SCORE':
          bond.score+' / '+bond.nextThreshold+' BOND SCORE TO NEXT RANK');
      rankCard.append(rankProgress);
      const next=el('p','status-persona-next');
      next.append(
        el('strong','',bond.rank>=bond.maxRank?'CURRENT UNLOCK':'NEXT UNLOCK · RANK '+bond.nextRank+' '+bond.nextName),
        document.createTextNode(' — '+bond.nextUnlock)
      );
      rankCard.append(next);
      detail.append(heading,el('p','status-connection-label',person.connection),rankCard);
      const meters=el('div','status-meters');
      for(const key of stats)meters.append(meter(key[0].toUpperCase()+key.slice(1),person[key]));
      detail.append(meters);
      const notes=el('div','status-detail-facts');
      notes.append(cell('DUELS TOGETHER',person.duels));
      notes.append(cell('CHARACTER CHAPTERS',person.completed+' / '+person.total));
      notes.append(cell('PERSONAL CHALLENGE',person.trialWon?'Completed':'Not completed'));
      detail.append(notes);
      const discovered=el('section','status-discovered-likes');
      discovered.append(el('strong','status-likes-heading','THINGS THEY SEEM TO ENJOY'));
      if(person.likes.length){
        const likes=el('div','status-likes-list');
        for(const like of person.likes)likes.append(el('span','status-like',like.label));
        discovered.append(likes);
      }else discovered.append(el('p','status-likes-unknown','Get to know each other through shared experiences to discover what they enjoy.'));
      detail.append(discovered);
      if(person.outcome==='romance'||person.outcome==='friendship')
        detail.append(el('p','status-route',person.outcome==='romance'?'♥ Romance route chosen':'✧ Friendship route chosen'));
      detail.append(el('p','status-disclaimer','These impressions come from time you have spent together. There is always more to learn about someone.'));
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
      body.append(
        el('strong','',person.name),
        el('small','status-character-rank','RANK '+person.bond.rank+' · '+person.bond.name),
        el('small','',person.partner?'♥ Partner':person.connection)
      );
      const mini=el('span','status-character-progress');
      mini.setAttribute('aria-label','Rank progress '+person.bond.progress+' percent');
      mini.title='Rank '+person.bond.rank+' · '+person.bond.name;
      const filled=el('span','');
      filled.style.width=person.bond.progress+'%';
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