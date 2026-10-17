'use strict';
const fs=require('node:fs');
const {ClassicLocalService,deckOptions}=require('./classic_local_service');
const RETAIL=require('./retail_theme_decks');
const {LAB}=require('./gym_expanded_decks');
const {verify}=require('./deck_builder_core');
const pool=new ClassicLocalService().cardPool();
const sets=['base1','base2','base3','base4','base5','gym1','gym2'];
const bySet=Object.fromEntries(sets.map(set=>{const cards=pool.filter(c=>c.set===set);return [set,{cards:cards.length,fullyExecutableRecords:cards.filter(c=>c.supported).length,unsupportedRecords:cards.filter(c=>!c.supported).length}];}));
const extra=pool.filter(c=>['gym1','gym2'].includes(c.set)&&!RETAIL.gymIds.includes(c.id));
const summaries={cardsInAvailablePool:pool.length,originalClassicCards:311,gymCardsBefore:107,gymCardsNow:264,additionalGymPrintings:extra.length,additionalPokemon:extra.filter(c=>c.supertype==='Pokémon').length,additionalTrainers:extra.filter(c=>c.supertype==='Trainer').length,additionalEnergies:extra.filter(c=>c.supertype==='Energy').length,newGymCardsWithAllEffectsCompiled:extra.filter(c=>c.supported).length,totalDeckPresets:deckOptions().length};
const result={title:'Neo Campus v0.19 Expanded Gym card audit',scope:'All set printings from Base Set to Gym Challenge (not Neo). Card ready flags indicate compiled effects only, not comprehensive historical accuracy.',summaries,bySet,addedGymCards:extra.map(c=>({id:c.id,name:c.name,supertype:c.supertype,ready:c.supported,missingAttacks:c.attacks.filter(a=>!a.supported).map(a=>a.name),missingPowers:c.powers.filter(a=>!a.supported).map(a=>a.name)})),sampleDecks:Object.fromEntries(Object.entries(LAB).map(([name,deck])=>[name,{size:deck.length,unique:verify(deck,pool).distinct,validation:verify(deck,pool),newGymPrintings:[...new Set(deck)].filter(id=>extra.some(c=>c.id===id))}]))};
if(require.main===module){fs.writeFileSync('GYM_EXPANDED_CARD_REPORT.json',JSON.stringify(result,null,2)+'\n');console.log('Expanded Gym card report:',result.summaries,'per set:',bySet);}
module.exports=result;
