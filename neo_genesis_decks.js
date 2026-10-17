'use strict';
// Verbatim printed English Neo Genesis theme decks: PokeBeach / Bulbapedia.
// Neo 1 set numbers distinguish alternate Totodile and Cyndaquil prints.
const recipes=Object.freeze({
 cold_fusion:[[2,80],[2,81],[1,31],[1,32],[4,64],[4,62],[2,48],[1,8],[4,55],[2,38],[1,22],[1,33],[2,70],[3,101],[1,96],[1,103],[16,111],[12,109]],
 hotfoot:[[4,61],[2,49],[1,7],[4,68],[3,75],[1,27],[2,56],[2,57],[1,47],[1,23],[2,40],[1,91],[3,101],[2,102],[1,96],[2,103],[21,108],[7,107]]
});
const entries=Object.freeze([
 {id:'cold_fusion',name:'Cold Fusion · Neo Genesis (preview)',set:'Neo Genesis',neo:true},
 {id:'hotfoot',name:'Hotfoot · Neo Genesis (preview)',set:'Neo Genesis',neo:true}
]);
const list=id=>recipes[id]?.flatMap(([amount,number])=>Array(amount).fill(`neo1-${number}`))||null;
const neoIds=Object.freeze([...new Set(entries.flatMap(e=>list(e.id)))]);
module.exports={recipes,entries,list,neoIds};
