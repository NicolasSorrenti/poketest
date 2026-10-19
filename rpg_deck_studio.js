'use strict';
// RPG adapter for the same visual deck builder used by solo and multiplayer Cube.
// Collection ownership, saved decks and duel snapshots remain governed by NeoRpgCollection.
(()=>{
 if(new URLSearchParams(location.search).has('partner'))return;
 const $=id=>document.getElementById(id);
 const KEY='neoHarborRpgV1',Core=window.NeoRpgCollection,Builder=window.CubeDeckBuilder;
 let state=null,builder=null,notice='',catalog=[];
 const owned=()=>state.deckJourney.owned;
 const draft=()=>Core.draft(state);
 const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));
 const dirty=()=>draft().join('|')!==state.deckJourney.deck.join('|');
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
  status();
 }
 function stage(next){
  const counts=Core.rank(next),inventory=owned();
  // Reject edits outside campaign ownership even when triggered programmatically.
  const illegal=next.length>60||Object.entries(counts).some(([id,n])=>
   !(inventory[id]>0)||n>inventory[id]||(!Core.ENERGY.has(id)&&n>4));
  if(illegal){notice='That edit exceeds your owned cards or campaign copy limits.';render();return;}
  state.deckJourney.draft=[...next];
  notice='';persist();status();
 }
 function showError(message){$('studioError').hidden=false;$('studioError').textContent=message;}
 async function boot(){
  try{
   if(!Core||!Builder)throw Error('The deck builder failed to load. Refresh the page.');
   state=JSON.parse(localStorage.getItem(KEY)||'null');
   if(!state?.deckJourney?.starter)throw Error('Start a campaign and choose your starter deck from Neo Harbor first.');
   if(state.pendingDuel)throw Error('Finish your current duel before editing. Your active duel uses a locked deck snapshot.');
   Core.hydrate(state);
   const libraries=await Promise.all(Object.keys(Core.SETS).map(async set=>{const res=await fetch('/cards/'+set+'.json');if(!res.ok)throw Error('Cannot load '+set+' card library.');return res.json();}));
   const all=libraries.flat();
   if(!Array.isArray(all))throw Error('The historical card library could not be read.');
   const index=new Map(all.filter(c=>c?.id).map(c=>[c.id,c]));
   catalog=Object.keys(owned()).filter(id=>owned()[id]>0).map(id=>
    index.get(id)||{id,name:id,supertype:'Trainer',types:[],subtypes:[],images:{}});
   Core.draft(state);
   persist();
   $('deckProfile').textContent=Core.byId(state.deckJourney.starter).name+' · Day '+state.day;
   builder=Builder.create({
    root:$('rpgDeckBuilder'),
    actionElement:$('rpgBuilderActions'),
    onChange:stage,
    config:{
     targetSize:60,
     eyebrow:'NEO HARBOR · YOUR COLLECTION',
     heading:'Build your 60-card deck',
     description:'Build with the cards you own. Save your changes to use them in the next duel.',
     collectionLabel:'owned cards',
     nameLimit:false,
     unlimitedIds:[...Core.ENERGY],
     validate:next=>Core.check(next,owned())
    }
   });
   $('saveDeck').onclick=()=>{
    try{Core.save(state);persist();notice='Deck saved! Your next duel will use these 60 cards.';render();}
    catch(e){notice=e.message;status();}
   };
   $('discardDraft').onclick=()=>{
    Core.cancel(state);Core.draft(state);persist();
    notice='Changes discarded. Your saved deck is unchanged.';render();
   };
   $('deckStudio').hidden=false;
   render();
  }catch(e){showError(e.message);}
 }
 boot();
})();