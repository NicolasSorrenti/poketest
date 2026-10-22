'use strict';
// Shares the Cube deck UI; all actual editing and validation remain in NeoRpgCollection.
(()=>{
 if(new URLSearchParams(location.search).has('partner'))return;
 const $=id=>document.getElementById(id),KEY='neoHarborRpgV1',
  Core=window.NeoRpgCollection,Builder=window.CubeDeckBuilder,Plan=window.NeoRpgStrategy;
 let state,builder,notice='',catalog=[],allCards=[],index=new Map(),scouts={},requestId=0;
 const persist=()=>{localStorage.setItem(KEY,JSON.stringify(state));window.NeoRpgCloudSave?.onLocalSave();};
 const owned=()=>state.deckJourney.owned,draft=()=>Core.draft(state);
 const dirty=()=>draft().join('|')!==state.deckJourney.deck.join('|');
 const cardName=id=>index.get(id)?.name||id;
 const setName=id=>Core.SETS[Plan.setOf(id)]?.name||Plan.setOf(id);
 const clear=id=>$(id).replaceChildren();
 const say=text=>{$('strategyStatus').textContent=text;};
 function paragraph(root,text,cls=''){const el=document.createElement('p');el.textContent=text;el.className=cls;root.append(el);return el;}
 function button(root,text,fn,disabled=false){
  const el=document.createElement('button');el.type='button';el.textContent=text;el.disabled=disabled;el.onclick=fn;root.append(el);return el;
 }
 function status(){
  const check=Core.check(draft(),owned()),changed=dirty();
  $('saveDeck').disabled=!changed||!check.valid;
  $('discardDraft').disabled=!changed;
  $('saveStatus').textContent=!check.valid?(check.errors[0]||'Deck needs attention'):
   notice||(changed?'Changes not saved. Save to use this deck in your next duel.':'Saved deck is ready for the next duel.');
 }
 function render(){
  builder.update({drafted:catalog,ownedCounts:owned(),deck:draft()});
  $('collectionSize').textContent=Object.values(owned()).reduce((sum,n)=>sum+n,0)+' cards owned';
  status();renderStrategy();
 }
 function stage(next){
  const counts=Core.rank(next),inventory=owned();
  const illegal=next.length>60||Object.entries(counts).some(([id,n])=>
   !(inventory[id]>0)||n>inventory[id]||(!Core.ENERGY.has(id)&&n>4));
  if(illegal){notice='That edit exceeds your owned cards or campaign copy limits.';render();return;}
  state.deckJourney.draft=[...next];notice='';persist();status();renderStrategy();
 }
 function showError(message){$('studioError').hidden=false;$('studioError').textContent=message;}
 const fixedScouts={
  hana:{name:'Hana Mizuno',deck:'power_reserve'},reina:{name:'Reina Kurogane',deck:'blackout'},
  shiori:{name:'Shiori Tsukishima',deck:'overgrowth'},yuna:{name:'Yuna Hoshino',deck:'zap'},
  akari:{name:'Akari Fujimoto',deck:'gym_new_voltage'},camila:{name:'Camila Vega',deck:'rocket_lab'},
  marina:{name:'Marina Aoki',deck:'water_blast'},kaede:{name:'Kaede Arashi',deck:'rocket_lab'}
 };
 function initializeScouts(){
  scouts={...fixedScouts,...(window.NeoRpgNarrativePack?.cast||{}),...(window.NeoRpgSideQuests?.cast||{})};
  const requested=new URLSearchParams(location.search).get('scout'),select=$('strategyOpponent');
  select.replaceChildren();
  for(const [id,npc] of Object.entries(scouts).sort((a,b)=>a[1].name.localeCompare(b[1].name))){
   if(!npc.deck||!(state['met_'+id]||state.results?.some(r=>r.npc===id)||requested===id))continue;
   const opt=document.createElement('option');opt.value=id;opt.textContent=npc.name;select.append(opt);
  }
  if(requested&&scouts[requested]&&[...select.options].some(x=>x.value===requested))select.value=requested;
  $('strategyScout').disabled=!select.options.length;
  if(!select.options.length)paragraph($('strategyScoutResult'),'Meet or duel someone around town before scouting their usual deck.');
  select.onchange=()=>clear('strategyScoutResult');
  $('strategyScout').onclick=scoutOpponent;
 }
 async function scoutOpponent(){
  const id=$('strategyOpponent').value,npc=scouts[id];if(!npc?.deck)return;
  const serial=++requestId;clear('strategyScoutResult');
  paragraph($('strategyScoutResult'),'Reading '+npc.name+'’s usual theme deck…');
  try{
   const response=await fetch('/api/classic/decklist?id='+encodeURIComponent(npc.deck));
   if(!response.ok)throw Error('That theme deck is not available.');
   const result=await response.json(),preview=Plan.scout(result.cards,index,state);
   if(!preview)throw Error('The theme deck could not be analyzed.');
   if(serial!==requestId)return;
   const root=$('strategyScoutResult');root.replaceChildren();
   paragraph(root,npc.name+' · '+preview.composition.pokemon+' Pokémon / '+
    preview.composition.trainer+' Trainers / '+preview.composition.energy+' Energy');
   paragraph(root,'Common Pokémon types: '+(preview.types.map(x=>x.name).join(', ')||'Unknown'));
   paragraph(root,preview.note);
   paragraph(root,'Based on printed theme cards, not hidden hands or a guaranteed counter.');
  }catch(err){if(serial===requestId){clear('strategyScoutResult');say(err.message);}}
 }
 function renderSearch(){
  const root=$('strategySearchResults');root.replaceChildren();
  const term=$('strategySearch').value.trim().toLowerCase();
  if(term.length<2)return;
  const results=allCards.filter(c=>c.name?.toLowerCase().includes(term)&&Core.canOwn(c.id)&&!Core.ENERGY.has(c.id)).slice(0,10);
  for(const card of results){
   const tracked=state.deckStrategy.wishlist.includes(card.id);
   button(root,(tracked?'✓ ':'+ ')+card.name+' · '+setName(card.id),()=>{
    try{Plan.toggle(state,card.id,Core,index);persist();say('Card targets updated.');renderStrategy();}
    catch(err){say(err.message);}
   });
  }
  if(!results.length)paragraph(root,'No matching historical cards.');
 }
 function renderStrategy(){
  if(!state?.deckJourney?.starter||!index.size)return;
  const d=draft(),prof=Plan.profile(d,index);
  $('strategySummary').textContent=d.length+' cards · '+prof.counts.pokemon+' Pokémon / '+
   prof.counts.trainer+' Trainers / '+prof.counts.energy+' Energy · '+
   (prof.primary.length?'Main Pokémon types: '+prof.primary.join(' + '):'Review your type balance')+
   ' · '+prof.basics+' Basic Pokémon';
  const swaps=$('strategySwaps');swaps.replaceChildren();
  const suggestions=Plan.swaps(state,index,Core,5);
  if(!suggestions.length)paragraph(swaps,'No clear legal one-for-one experiments with your owned cards yet. Try a few duels or open boosters.');
  for(const item of suggestions){
   const box=document.createElement('div');box.className='strategy-option';
   paragraph(box,'Try '+cardName(item.add)+' for '+cardName(item.remove),'strategy-option-title');
   paragraph(box,item.explanation);
   button(box,'Stage swap · review before saving',()=>{
    try{Core.change(state,item.remove,item.add);persist();say('Staged '+cardName(item.add)+'. Save the deck below if you like the change.');render();}
    catch(err){say(err.message);}
   });swaps.append(box);
  }
  const targets=$('strategyGoals'),saved=Plan.goals(state,index,Core);targets.replaceChildren();
  if(!saved.length)paragraph(targets,'No targets yet. Search for cards or follow a suggested upgrade.');
  for(const item of saved){
   const box=document.createElement('div');box.className='strategy-option';
   paragraph(box,item.name+' · '+setName(item.id)+(item.owned?' · owned '+item.owned:' · missing'));
   button(box,'Untrack',()=>{Plan.toggle(state,item.id,Core,index);persist();renderStrategy();});
   targets.append(box);
  }
  const ideas=$('strategyProspects');ideas.replaceChildren();
  for(const item of Plan.prospects(state,index,Core,5)){
   const box=document.createElement('div');box.className='strategy-option';
   paragraph(box,item.name+' · '+setName(item.id));paragraph(box,item.reason);
   button(box,item.tracked?'✓ Tracking':'Track as goal',()=>{
    try{if(!item.tracked)Plan.toggle(state,item.id,Core,index);persist();say('Card targets updated.');renderStrategy();}
    catch(err){say(err.message);}
   },item.tracked);ideas.append(box);
  }
  const offers=$('strategyPacks');offers.replaceChildren();
  const plan=Plan.packAdvice(state,index,Core);
  for(const item of plan.filter(x=>x.targets).slice(0,5)){
   const box=document.createElement('div');box.className='strategy-option';
   paragraph(box,item.name+' · '+item.targets+' missing target'+(item.targets===1?'':'s'),'strategy-option-title');
   paragraph(box,item.unlocked?'Available · '+item.price+' credits per ten-card booster':'Locked · '+item.unlockHint);
   offers.append(box);
  }
  if(!plan.some(x=>x.targets))paragraph(offers,'Track missing cards to find themed packs that could contain them. Older packs can gain new cards when expansions unlock.');
  renderSearch();
 }
 async function boot(){
  try{
   if(!Core||!Builder||!Plan)throw Error('The deck builder or Strategy Lab failed to load. Refresh the page.');
   state=JSON.parse(localStorage.getItem(KEY)||'null');
   if(!state?.deckJourney?.starter)throw Error('Start a campaign and choose your starter deck from Neo Harbor first.');
   if(state.pendingDuel)throw Error('Finish your current duel before editing. Your active duel uses a locked deck snapshot.');
   Core.hydrate(state);Plan.hydrate(state,Core);
   const libraries=await Promise.all(Object.keys(Core.SETS).map(async set=>{
    const res=await fetch('/cards/'+set+'.json');if(!res.ok)throw Error('Cannot load '+set+' card library.');return res.json();
   }));
   allCards=libraries.flat().filter(c=>c?.id);index=new Map(allCards.map(c=>[c.id,c]));
   catalog=Object.keys(owned()).filter(id=>owned()[id]>0).map(id=>
    index.get(id)||{id,name:id,supertype:'Trainer',types:[],subtypes:[],images:{}});
   Core.draft(state);initializeScouts();persist();
   $('deckProfile').textContent=Core.byId(state.deckJourney.starter).name+' · Day '+state.day;
   builder=Builder.create({root:$('rpgDeckBuilder'),actionElement:$('rpgBuilderActions'),onChange:stage,
    config:{targetSize:60,eyebrow:'NEO HARBOR · YOUR COLLECTION',heading:'Build your 60-card deck',
     description:'Build with the cards you own. Save your changes to use them in the next duel.',
     collectionLabel:'owned cards',nameLimit:false,unlimitedIds:[...Core.ENERGY],
     validate:next=>Core.check(next,owned())}});
   $('strategySearch').oninput=renderSearch;
   $('saveDeck').onclick=()=>{
    try{Core.save(state);persist();notice='Deck saved! Your next duel will use these 60 cards.';render();}
    catch(err){notice=err.message;status();}
   };
   $('discardDraft').onclick=()=>{
    Core.cancel(state);Core.draft(state);persist();
    notice='Changes discarded. Your saved deck is unchanged.';render();
   };
   $('deckStudio').hidden=false;render();
    window.NeoRpgCloudSave?.mount({
     getSave:()=>JSON.parse(localStorage.getItem(KEY)||'null'),
     restoreSave:save=>{localStorage.setItem(KEY,JSON.stringify(save));location.reload();},
     hadLocalSave:true,
     canSwitch:()=>!state.pendingDuel,
     showButton:false
    });
  }catch(err){showError(err.message);}
 }
 boot();
})();
