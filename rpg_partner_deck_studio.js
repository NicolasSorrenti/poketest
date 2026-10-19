'use strict';
// Uses the Cube UI already shared by the RPG; available only after bond chapter two.
(()=>{
 const params=new URLSearchParams(location.search);
 if(!params.has('partner'))return;
 const $=id=>document.getElementById(id),CORE=window.NeoRpgCollection,
  PARTNER=window.NeoRpgPartnerDecks,BONDS=window.NeoRpgBondRewards,BUILDER=window.CubeDeckBuilder;
 const KEY='neoHarborRpgV1',npc=params.get('partner'),theme=params.get('deck'),name=params.get('name')||npc;
 const allowed=/^[a-z][a-z0-9_]{1,40}$/;
 let state,original=[],cards=[],catalog=new Map(),limits={},signature=null,deck=[],saved=[],builder=null;
 let note='';
 const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));
 const showError=message=>{$('studioError').hidden=false;$('studioError').textContent=message;};
 const context=()=>({original,owned:state.deckJourney?.owned||{},catalog,signature});
 const validate=list=>PARTNER.check(list,context());
 function render(){
  builder.update({drafted:cards,ownedCounts:limits,deck});
  $('collectionSize').textContent='Personal collection + '+name+'’s original cards';
  const legal=validate(deck),changed=deck.join('|')!==saved.join('|');
  $('saveDeck').disabled=!changed||!legal.valid;
  $('discardDraft').disabled=!changed;
  $('saveStatus').textContent=note||(!legal.valid?legal.errors[0]:
   changed?'Changes not saved. Keep the signature and 30 original cards.':'Saved and ready for your next friendly match.');
 }
 function stage(next){
  const tally=PARTNER.count(next);
  const protectedAbsent=!tally[signature];
  const maxExceeded=Object.entries(tally).some(([id,n])=>!catalog.has(id)||n>(limits[id]||0));
  if(protectedAbsent||maxExceeded){
   note=protectedAbsent?'That Pokémon is part of your partner’s signature strategy. Keep at least one copy.':
    'That card is not available in your partner’s collection.';
   render();return;
  }
  // The deck can temporarily be incomplete while editing; save validates the entire deck.
  deck=[...next];note='';render();
 }
 async function boot(){
  try{
   if(!PARTNER||!BUILDER||!CORE||!BONDS)throw Error('Partner deckbuilding modules failed to load.');
   if(!allowed.test(npc||'')||!allowed.test(theme||''))throw Error('Open partner deckbuilding from the RPG character menu.');
   state=JSON.parse(localStorage.getItem(KEY)||'null');
   if(!state?.deckJourney?.starter)throw Error('Choose your starter deck in Neo Harbor before editing with partners.');
   if(state.pendingDuel)throw Error('Finish your current duel before changing character decks.');
   if(!PARTNER.unlocked(state,npc))throw Error('Finish two relationship chapters with this character to unlock deck collaboration.');
   CORE.hydrate(state);
   const baseResponse=await fetch('/api/classic/decklist?id='+encodeURIComponent(theme));
   if(!baseResponse.ok)throw Error('This character’s original deck could not be loaded.');
   const base=await baseResponse.json();
   if(!Array.isArray(base.cards)||base.cards.length!==60)throw Error('Character theme deck is not a valid 60-card list.');
   original=[...base.cards];
   const sets=await Promise.all(Object.keys(CORE.SETS).map(async set=>{
    const response=await fetch('/cards/'+set+'.json');if(!response.ok)throw Error('Card library '+set+' is unavailable.');
    return response.json();
   }));
   catalog=new Map(sets.flat().filter(c=>c&&c.id).map(c=>[c.id,c]));
   const preferred=BONDS.SIGNATURES[npc]||null;
   const info=PARTNER.get(state,npc,original,state.deckJourney.owned,catalog,preferred);
   signature=info.signature;
   if(!signature)throw Error('A signature Pokémon could not be identified for this partner.');
   limits=PARTNER.pool(original,state.deckJourney.owned,catalog);
   cards=Object.keys(limits).filter(id=>limits[id]>0).map(id=>catalog.get(id));
   saved=[...info.cards];deck=[...saved];
   const signatureName=catalog.get(signature)?.name||signature;
   $('deckProfile').textContent=name+' · Deck collaboration';
   document.querySelector('.studio-context span').textContent='PARTNER’S DECK · 60-CARD FORMAT';
   $('saveDeck').textContent='Save '+name+'’s deck';
   $('saveStatus').textContent='Protect '+signatureName+' and keep at least 30 original cards.';
   builder=BUILDER.create({root:$('rpgDeckBuilder'),actionElement:$('rpgBuilderActions'),onChange:stage,
    config:{targetSize:60,eyebrow:'NEO HARBOR · PARTNER COLLABORATION',
     heading:name+'’s 60-card deck',
     description:'Collaborate using their original cards and cards you own. '+signatureName+
      ' is protected, and at least 30 original cards must remain. Your own deck stays unchanged.',
     collectionLabel:'partner card pool',nameLimit:true,canClear:false,validate}});
   $('saveDeck').onclick=()=>{
    try{
     PARTNER.save(state,npc,theme,deck,context());
     saved=[...deck];persist();note='Deck saved. '+name+' will use these cards when you duel together.';
     render();
    }catch(err){note=err.message;render();}
   };
   $('discardDraft').onclick=()=>{deck=[...saved];note='Unsaved changes discarded.';render();};
   $('deckStudio').hidden=false;
   render();
  }catch(err){showError(err.message);}
 }
 boot();
})();
