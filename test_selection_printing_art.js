'use strict';
// Regression: selection thumbnails must use the exact set/number, not a same-name card.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {makeDecision}=require('./decision_core');
const {publicView}=require('./duel_protocol');
const {CATALOG}=require('./headless_duel');

const FOSSIL='base3-39',BASE='base1-36';
assert.equal(CATALOG.get(FOSSIL).name,'Magmar');
assert.equal(CATALOG.get(BASE).name,'Magmar');
assert.notEqual(CATALOG.get(FOSSIL).images.small,CATALOG.get(BASE).images.small);

function game(options,kind='select'){
 return {
  format:'classic',phase:'game',turn:0,round:1,over:false,
  players:[
   {name:'You',hand:[FOSSIL,BASE],deck:[BASE,FOSSIL],
    discard:[FOSSIL],prizes:[],bench:[],active:null},
   {name:'Opponent',hand:[BASE],deck:[FOSSIL],
    discard:[],prizes:[],bench:[],active:null}
  ],
  pendingDecision:makeDecision({
   id:'choose-printing',actor:0,kind,label:'Choose Magmar',options,min:1,max:1
  }),
  message:[],coinFlips:[]
 };
}
function choice(id,label='Magmar',cardId){
 const option={id,label};
 if(cardId)option.cardId=cardId;
 return option;
}
for(const [id,expected] of [
 ['n:0',FOSSIL],['hand:1',BASE],['deck:0',BASE],
 ['deck:1',FOSSIL],['discard:0',FOSSIL]
]){
 const g=game([choice(id)]);
 const projected=publicView(g,0).pendingDecision.options[0];
 assert.equal(projected.cardId,expected,id+' must keep the actual set and number');
 assert.equal(CATALOG.get(projected.cardId).images.small,CATALOG.get(expected).images.small);
}
const authoritative=game([choice('card:0','Magmar',FOSSIL)]);
assert.equal(publicView(authoritative,0).pendingDecision.options[0].cardId,FOSSIL,
 'Server-supplied cardId takes precedence over any index/source inference');
assert.equal(publicView(authoritative,1).pendingDecision.options,undefined,
 'The opponent must not see another player\'s selection');
assert.equal(publicView(authoritative,null).pendingDecision.options,undefined,
 'Spectators must not see private decisions');

for(const id of ['card:0','energy:0','n:99','arbitrary']){
 assert.equal(publicView(game([choice(id)]),0).pendingDecision.options[0].cardId,undefined,
  id+' must not fall back to the first same-named catalog entry');
}
const search=publicView(game([choice('deck:1')],'find'),0).pendingDecision;
assert.deepEqual(search.displayDeck.map(o=>({cardId:o.cardId,eligible:o.eligible})),[
 {cardId:BASE,eligible:false},{cardId:FOSSIL,eligible:true}
],'Deck search should display every exact printing and gray out ineligible cards');
assert.equal(search.displayDeck[1].id,'deck:1','Selection IDs must remain authoritative');

for(const ui of ['classic_live.js','online.js']){
 const source=fs.readFileSync(require('node:path').join(__dirname,ui),'utf8');
 assert.ok(source.includes('const candidate=item.cardId?cards.get(item.cardId):null;'),
  ui+' must display an image only if the actual printing ID is known');
 assert.doesNotMatch(source,/\[\.\.\.cards\.values\(\)\]\.find\(c=>c\.name===item\.label/,
  ui+' must not substitute Base Magmar for Fossil Magmar');
}
console.log('PASS Selection images: Fossil/Base Magmar, owner-only metadata, exact full-deck art, and no name fallback');
