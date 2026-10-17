'use strict';
// Verified original retail 60-card lists; explicit IDs preserve cross-set contents.
// Source: https://www.pokebeach.com/tcg/base-set/theme-decks
const data = {
 'base1:Blackout': [[4,52],[2,34],[3,62],[3,56],[1,7],[3,65],[4,63],[2,42],[2,27],[4,92],[1,79],[1,93],[1,84],[1,88],[16,97],[12,102]],
 'base1:Brushfire': [[4,46],[2,24],[2,28],[1,23],[2,68],[1,12],[4,55],[4,69],[2,66],[1,84],[3,94],[1,93],[1,95],[1,92],[2,81],[1,75],[18,98],[10,99]],
 'base1:Overgrowth': [[4,69],[2,33],[1,17],[4,44],[2,30],[2,35],[1,6],[4,65],[3,64],[2,90],[2,95],[2,93],[2,91],[1,94],[16,99],[12,102]],
 'base1:Zap!': [[3,43],[1,32],[3,50],[2,29],[2,31],[2,49],[1,10],[3,53],[4,58],[2,91],[2,93],[2,95],[1,90],[1,94],[1,80],[1,88],[1,71],[16,101],[12,100]],
 // Retail lists transcribed from PokéBeach /tcg/jungle/theme-decks.
 'base2:Power Reserve': [[4,'base2-49'],[2,'base2-48'],[4,'base2-57'],[2,'base2-40'],[2,'base2-58'],[1,'base2-37'],[4,'base1-43'],[2,'base1-32'],[1,'base1-31'],[1,'base2-5'],[2,'base1-91'],[2,'base1-93'],[1,'base1-87'],[3,'base1-94'],[1,'base1-95'],[17,'base1-99'],[11,'base1-101']],
 'base2:Water Blast': [[4,'base1-59'],[2,'base1-38'],[1,'base1-41'],[1,'base2-12'],[2,'base1-52'],[3,'base2-61'],[1,'base2-45'],[4,'base2-51'],[4,'base2-56'],[2,'base2-42'],[2,'base1-93'],[2,'base1-94'],[1,'base1-88'],[2,'base1-90'],[1,'base1-95'],[14,'base1-102'],[14,'base1-97']],
 // Retail lists from PokéBeach /tcg/neo-genesis/theme-decks.
 'neo1:Cold Fusion': [[2,80],[2,81],[1,31],[1,32],[4,64],[4,62],[2,48],[1,8],[4,55],[2,38],[1,22],[1,33],[2,70],[3,101],[1,96],[1,103],[16,111],[12,109]],
 'neo1:Hotfoot': [[4,61],[2,49],[1,7],[4,68],[3,75],[1,27],[2,56],[2,57],[1,47],[1,23],[2,40],[1,91],[3,101],[2,102],[1,96],[2,103],[21,108],[7,107]]
};
function list(key){const rows=data[key];return rows ? rows.flatMap(([count,num])=>Array(count).fill(typeof num==='string'?num:(key.startsWith('base1:')?'base1':'neo1')+'-'+num)):null}
function validate(){for(const [key,rows] of Object.entries(data)){const n=rows.reduce((a,[q])=>a+q,0);if(n!==60)throw new Error(`${key}: ${n} cards`);if(rows.some(([q,num])=>!Number.isInteger(q)||q<1||!(Number.isInteger(num)||typeof num==='string'&&/^(base1|base2|neo1)-\d+$/.test(num))))throw new Error('Invalid recipe: '+key)}}
validate();
if(typeof module!=='undefined') module.exports={list,data,validate};
if(typeof window!=='undefined')window.AuthenticDecks={list,data,validate};
