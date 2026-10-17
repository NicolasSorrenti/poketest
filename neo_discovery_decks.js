'use strict';
// English Neo Discovery retail theme decks, based on the printed decklists.
// IDs matter: BrainWave Espeon is holo 1/75 (not non-holo 20/75).
const recipes=Object.freeze({
 brainwave:[
  ['neo2',1,38],['neo2',1,1],['neo1',3,58],['neo2',4,59],['neo2',1,52],
  ['neo2',1,33],['neo2',2,68],['neo2',1,50],['neo1',2,64],['neo1',1,66],
  ['neo2',3,60],['neo2',2,43],['neo2',2,65],['neo2',2,75],['neo2',2,72],
  ['neo1',3,101],['neo1',1,96],['neo1',16,110],['neo1',12,111]
 ],
 wallop:[
  ['neo2',3,57],['neo2',2,45],['neo2',4,66],['neo2',1,3],['neo2',4,63],
  ['neo2',4,53],['neo2',2,42],['neo2',1,19],['neo2',2,46],['neo1',1,100],
  ['neo2',2,75],['neo2',1,73],['neo1',1,101],['neo1',1,96],['neo1',3,103],
  ['neo1',16,108],['neo1',12,106]
 ]
});
const entries=Object.freeze([
 {id:'brainwave',name:'BrainWave · Neo Discovery (preview)',set:'Neo Discovery',neo:true},
 {id:'wallop',name:'Wallop · Neo Discovery (preview)',set:'Neo Discovery',neo:true}
]);
const list=id=>recipes[id]?.flatMap(([set,amount,number])=>Array(amount).fill(`${set}-${number}`))||null;
const neoIds=Object.freeze([...new Set(entries.flatMap(e=>list(e.id)).filter(id=>id.startsWith('neo2-')))]);
module.exports={recipes,entries,list,neoIds};
