'use strict';
// Exact Neo Destiny English preconstructed lists from PokeBeach (2009) and
// cross-checked against Bulbapedia. Preserve individual set/card printings.
const recipes=Object.freeze({
 dark:[
  ['neo4',3,61],['neo1',1,57],['neo4',3,39],['neo4',1,10],
  ['neo4',1,68],['neo4',3,82],['neo3',1,33],['neo4',1,18],
  ['neo4',2,91],['neo4',2,65],['neo4',1,36],['neo4',1,66],
  ['neo2',1,67],['neo4',1,87],['neo4',1,88],
  ['neo1',2,99],['neo4',1,97],['neo4',2,99],['neo4',1,105],
  ['neo3',1,63],['neo1',2,103],['neo1',17,107],['neo1',11,110]
 ],
 light:[
  ['neo4',4,67],['neo4',2,42],['neo4',4,73],['neo4',2,49],
  ['neo4',1,25],['neo1',4,66],['neo4',1,13],['neo4',4,81],
  ['neo4',2,45],['neo1',4,99],['neo4',2,104],['neo3',2,62],
  ['neo1',14,106],['neo1',14,111]
 ]
});
const entries=Object.freeze([
 {id:'dark',name:'Dark · Neo Destiny',set:'Neo Destiny',neo:true},
 {id:'light',name:'Light · Neo Destiny',set:'Neo Destiny',neo:true}
]);
const list=id=>recipes[id]?.flatMap(([set,amount,number])=>Array(amount).fill(`${set}-${number}`))||null;
const neoIds=Object.freeze([...new Set(entries.flatMap(e=>list(e.id)))]);
module.exports={recipes,entries,list,neoIds};
