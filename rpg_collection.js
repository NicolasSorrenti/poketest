'use strict';
/* RPG-owned cards and collection. No changes to the Classic reducer. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NeoRpgCollection=api;})(typeof window!=='undefined'?window:null,function(){
 const expand=groups=>groups.flatMap(([n,id])=>Array(n).fill(id));
 const trainers=[[2,'base1-91'],[3,'base1-94'],[2,'base1-95'],[1,'base1-93'],[2,'base1-87'],[2,'base1-81'],[2,'base1-83'],[2,'base1-80']];
 const starters=Object.freeze([
 {id:'ember_garden',name:'Ember Garden',types:['Fire','Grass'],description:'Small fire attackers backed by growing Grass Pokémon; gradual evolution and healing.',cards:expand([[3,'base1-46'],[2,'base1-24'],[3,'base1-28'],[1,'base1-23'],[2,'base1-60'],[2,'base1-68'],[3,'base1-44'],[2,'base1-30'],[2,'base1-66'],...trainers,[13,'base1-98'],[11,'base1-99']])},
 {id:'tidal_circuit',name:'Tidal Circuit',types:['Water','Lightning'],description:'Flexible Water attackers and fragile Electric basics. Upgrade your lines to win longer matches.',cards:expand([[3,'base1-63'],[2,'base1-42'],[2,'base1-41'],[1,'base1-25'],[2,'base1-65'],[1,'base1-64'],[3,'base1-58'],[2,'base1-53'],[2,'base1-67'],[1,'base1-21'],[1,'base1-61'],...trainers,[13,'base1-102'],[11,'base1-100']])},
 {id:'mind_and_muscle',name:'Mind & Muscle',types:['Psychic','Fighting'],description:'Psychic disruption and hard-working Fighting Pokémon; few shortcuts or power rares.',cards:expand([[3,'base1-43'],[2,'base1-32'],[3,'base1-49'],[1,'base1-31'],[2,'base1-50'],[1,'base1-29'],[3,'base1-52'],[2,'base1-34'],[2,'base1-62'],[1,'base1-56'],...trainers,[13,'base1-101'],[11,'base1-97']])}
 ]);
 const byId=new Map(starters.map(s=>[s.id,s]));
 const upgrade=['base1-88','base1-84','base1-93','base1-91','base1-95','base1-23','base1-12','base1-14','base1-25','base1-64','base1-9','base1-21','base1-32','base1-29','base1-34','base1-19','base1-30','base1-42','base1-77','base1-92','base1-94','base1-81','base1-82','base1-90','base1-46','base1-44','base1-63','base1-58','base1-43','base1-52','base1-98','base1-99','base1-100','base1-102','base1-101','base1-97'];
 const poolByStarter={
  ember_garden:['base1-12','base1-23','base1-24','base1-30','base1-44','base1-45','base1-46','base1-54','base1-60','base1-66','base1-68','base1-81','base1-82','base1-83','base1-84','base1-88','base1-91','base1-92','base1-93','base1-94','base1-95','base1-98','base1-99'],
  tidal_circuit:['base1-9','base1-14','base1-21','base1-25','base1-35','base1-38','base1-41','base1-42','base1-53','base1-58','base1-59','base1-63','base1-64','base1-65','base1-67','base1-81','base1-82','base1-84','base1-88','base1-91','base1-92','base1-93','base1-94','base1-95','base1-100','base1-102'],
  mind_and_muscle:['base1-19','base1-29','base1-31','base1-32','base1-34','base1-43','base1-47','base1-49','base1-50','base1-52','base1-56','base1-62','base1-81','base1-82','base1-84','base1-88','base1-91','base1-92','base1-93','base1-94','base1-95','base1-97','base1-101']
 };
 const SETS=Object.freeze({
  base1:{name:'Base Set',size:102,rares:16},
  base2:{name:'Jungle',size:64,rares:16},
  base3:{name:'Fossil',size:62,rares:15},
  base4:{name:'Base Set 2',size:130,rares:20},
  base5:{name:'Team Rocket',size:83,rares:17},
  gym1:{name:'Gym Heroes',size:132,rares:19},
  gym2:{name:'Gym Challenge',size:132,rares:20},
  neo1:{name:'Neo Genesis',size:111,rares:19},
  neo2:{name:'Neo Discovery',size:75,rares:17},
  neo3:{name:'Neo Revelation',size:66,rares:14},
  neo4:{name:'Neo Destiny',size:113,rares:16}
 });
 // Every product can be obtained by day progression, relationships, or earlier accomplishments.
 // No rare card / collection-completion grind is necessary to finish the story.
 const SHOP_OFFERS=Object.freeze([
  {set:'base1',price:20,day:1,description:'The foundations of competitive play.'},
  {set:'base2',price:25,day:8,npc:'yuna',description:'Jungle partners and unexpected tricks.'},
  {set:'base3',price:25,day:14,npc:'reina',description:'Ancient Pokémon and fossil strategies.'},
  {set:'base4',price:28,day:17,npc:'hana',description:'Classic reprints for familiar strategies.'},
  {set:'base5',price:30,day:22,npc:'camila',description:'Dark evolutions and mischievous disruption.'},
  {set:'gym1',price:35,day:33,npc:'hana',cup:'neighborhood',description:'Leader Pokémon with their own tactics.'},
  {set:'gym2',price:38,day:43,npc:'akari',cup:'neighborhood',description:'Gym battles and signature strategies.'},
  {set:'neo1',price:40,day:48,npc:'akari',cup:'regional',description:'Johto discoveries and evolving teams.'},
  {set:'neo2',price:45,day:58,npc:'shiori',description:'New evolutions and precise tactics.'},
  {set:'neo3',price:50,day:68,npc:'marina',cup:'regional',description:'Powerful choices from Johto.'},
  {set:'neo4',price:55,day:80,npc:'kaede',cup:'championship',description:'High-stakes cards for the season finale.'}
 ]);

 const CHARACTER_SETS=Object.freeze({hana:'base1',reina:'base3',shiori:'neo2',yuna:'base2',akari:'neo1',camila:'base5',marina:'neo3',kaede:'neo4',jinx:'neo4',luna:'neo3',elena:'base2',rina:'base1',sierra:'base5',sol:'base1',jun:'base3',teo:'base2',iris:'neo1',elio:'base3',alma:'base2',nereo:'neo3'});
 const ENERGY=new Set(['base1-96','base1-97','base1-98','base1-99','base1-100','base1-101','base1-102']);
 const allAllowed=new Set([...starters.flatMap(s=>s.cards),...upgrade,...Object.keys(SETS).flatMap(set=>Array.from({length:SETS[set].size},(_,i)=>set+'-'+(i+1)))]);
 const rank=ids=>Object.fromEntries([...new Set(ids)].map(id=>[id,ids.filter(x=>x===id).length]));
 const chooseRandom=(list,rng=Math.random)=>list[Math.min(list.length-1,Math.floor(Math.max(0,rng())*list.length))];
 // Historical rarity indexes sourced from PokemonTCG/pokemon-tcg-data/cards/en.
 // Includes Rare Trainers, duplicate non-holo rares and Shining/Secret printings.
 const PACK_RARITIES=Object.freeze({"base1":{"holo":[[1,16]],"rare":[[17,22],[70,79]],"uncommon":[[23,42],[80,90],[96,96]],"common":[[43,69],[91,95]],"secret":[],"energy":[[97,102]]},"base2":{"holo":[[1,16]],"rare":[[17,32]],"uncommon":[[33,48]],"common":[[49,64]],"secret":[],"energy":[]},"base3":{"holo":[[1,15]],"rare":[[16,30]],"uncommon":[[31,45],[58,58]],"common":[[46,57],[59,62]],"secret":[],"energy":[]},"base4":{"holo":[[1,20]],"rare":[[21,32],[101,108]],"uncommon":[[33,64],[109,117],[124,124]],"common":[[65,100],[118,123]],"secret":[],"energy":[[125,130]]},"base5":{"holo":[[1,17]],"rare":[[18,31],[71,72],[80,80]],"uncommon":[[32,48],[73,77],[81,82]],"common":[[49,70],[78,79]],"secret":[[83,83]],"energy":[]},"gym1":{"holo":[[1,19]],"rare":[[20,34],[97,104]],"uncommon":[[35,60],[105,120]],"common":[[61,96],[121,126]],"secret":[],"energy":[[127,132]]},"gym2":{"holo":[[1,20]],"rare":[[21,30],[100,110]],"uncommon":[[31,59],[111,123]],"common":[[60,99],[124,126]],"secret":[],"energy":[[127,132]]},"neo1":{"holo":[[1,19]],"rare":[[20,25],[83,90],[104,105]],"uncommon":[[26,52],[91,98]],"common":[[53,82],[99,103]],"secret":[],"energy":[[106,111]]},"neo2":{"holo":[[1,17]],"rare":[[18,36]],"uncommon":[[37,52],[72,74]],"common":[[53,71],[75,75]],"secret":[],"energy":[]},"neo3":{"holo":[[1,14]],"rare":[[15,27]],"uncommon":[[28,40],[60,63]],"common":[[41,59],[64,64]],"secret":[[65,66]],"energy":[]},"neo4":{"holo":[[1,16]],"rare":[[17,30],[92,96]],"uncommon":[[31,60],[97,103]],"common":[[61,91],[104,105]],"secret":[[106,113]],"energy":[]}});
 const expandRanges=(set,ranges)=>ranges.flatMap(([from,to])=>Array.from({length:to-from+1},(_,i)=>set+'-'+(from+i)));
 const PACK_POOLS=Object.freeze(Object.fromEntries(Object.entries(PACK_RARITIES).map(([set,groups])=>
  [set,Object.fromEntries(Object.entries(groups).map(([rarity,ranges])=>[rarity,expandRanges(set,ranges)]))])));
 const packRarity=id=>{
  if(typeof id!=='string')return null;
  const split=id.lastIndexOf('-'),pool=PACK_POOLS[id.slice(0,split)];
  return pool?(Object.keys(pool).find(rarity=>pool[rarity].includes(id))||null):null;
 };
 // Compact catalog of original Pokemon and Trainer roles, derived from cards/*.json.
 // This controls custom booster selection only; it never rewrites actual card data.
 const BOOSTER_ROLES=Object.freeze({"base1":{"basic":[[3,3],[5,5],[7,7],[10,10],[16,16],[20,20],[26,28],[31,31],[35,36],[39,39],[41,41],[43,53],[55,63],[65,69]],"evolution":[[1,2],[4,4],[6,6],[8,9],[11,15],[17,19],[21,25],[29,30],[32,34],[37,38],[40,40],[42,42],[54,54],[64,64]],"trainer":[[71,95]]},"base2":{"basic":[[5,6],[9,11],[21,22],[25,27],[38,38],[47,47],[49,63]],"evolution":[[1,4],[7,8],[12,20],[23,24],[28,37],[39,46],[48,48]],"trainer":[[64,64]]},"base3":{"basic":[[2,3],[7,7],[10,10],[12,12],[15,15],[17,18],[22,22],[25,25],[27,27],[30,30],[33,33],[39,39],[46,49],[51,51],[53,57]],"evolution":[[1,1],[4,6],[8,9],[11,11],[13,14],[16,16],[19,21],[23,24],[26,26],[28,29],[31,32],[34,38],[40,45],[50,50],[52,52]],"trainer":[[58,61]]},"base4":{"basic":[[3,3],[6,6],[8,8],[10,10],[17,17],[20,20],[24,24],[26,27],[29,30],[38,38],[40,40],[42,42],[45,45],[48,48],[50,51],[61,62],[65,80],[82,93],[95,100]],"evolution":[[1,2],[4,5],[7,7],[9,9],[11,16],[18,19],[21,23],[25,25],[28,28],[31,37],[39,39],[41,41],[43,44],[46,47],[49,49],[52,60],[63,64],[81,81],[94,94]],"trainer":[[101,123]]},"base5":{"basic":[[47,50],[52,70]],"evolution":[[1,14],[18,46],[51,51],[83,83]],"trainer":[[15,16],[71,79]]},"gym1":{"basic":[[1,1],[6,6],[11,13],[21,22],[24,25],[27,27],[30,30],[32,33],[35,38],[41,43],[47,47],[50,50],[52,52],[54,54],[57,57],[59,59],[61,96]],"evolution":[[2,5],[7,10],[14,14],[20,20],[23,23],[26,26],[28,29],[31,31],[34,34],[39,40],[44,46],[48,49],[51,51],[53,53],[55,56],[58,58],[60,60]],"trainer":[[15,19],[97,126]]},"gym2":{"basic":[[10,10],[14,15],[24,24],[37,40],[43,43],[48,49],[51,51],[57,57],[59,99]],"evolution":[[1,9],[11,13],[16,16],[21,23],[25,36],[41,42],[44,47],[50,50],[52,56],[58,58]],"trainer":[[17,20],[100,126]]},"neo1":{"basic":[[6,6],[9,9],[12,13],[20,20],[22,26],[30,30],[33,33],[40,41],[43,43],[51,51],[53,82]],"evolution":[[1,5],[7,8],[10,11],[14,18],[21,21],[27,29],[31,32],[34,39],[42,42],[44,50],[52,52]],"trainer":[[83,103]]},"neo2":{"basic":[[3,3],[5,5],[7,7],[11,11],[14,14],[16,17],[22,22],[24,24],[26,26],[30,30],[33,33],[35,40],[46,51],[53,55],[57,59],[61,71]],"evolution":[[1,2],[4,4],[6,6],[8,10],[12,13],[15,15],[18,21],[23,23],[25,25],[27,29],[31,32],[34,34],[41,45],[52,52],[56,56],[60,60]],"trainer":[[72,75]]},"neo3":{"basic":[[3,3],[5,7],[11,11],[13,14],[16,18],[20,20],[22,24],[26,27],[31,31],[38,47],[49,51],[53,59],[65,66]],"evolution":[[1,2],[4,4],[8,10],[12,12],[15,15],[19,19],[21,21],[25,25],[28,30],[32,37],[48,48],[52,52]],"trainer":[[60,64]]},"neo4":{"basic":[[27,31],[41,44],[55,61],[63,71],[73,91],[106,113]],"evolution":[[1,15],[17,26],[32,40],[45,54],[62,62],[72,72]],"trainer":[[92,105]]}});
 const BOOSTER_PARENTS=Object.freeze({"base1-1":["base1-32","base4-46"],"base1-2":["base1-42","base4-63"],"base1-4":["base1-24","base4-35"],"base1-6":["base1-35","base4-50","base5-47"],"base1-8":["base1-34","base4-49"],"base1-9":["base1-53","base4-79","base5-60","neo2-7","neo2-26"],"base1-11":["base1-37","base4-54"],"base1-12":["base1-68","base4-99","neo4-91"],"base1-13":["base1-38","base4-57","neo2-44"],"base1-14":["base1-58","base2-60","base4-87","neo1-70"],"base1-15":["base1-30","base4-44"],"base1-17":["base1-33","base4-47","neo2-41"],"base1-18":["base1-26","base4-38","base5-53","neo4-63"],"base1-19":["base1-47","base4-71","base5-52"],"base1-21":["base1-67","base4-98","base5-69"],"base1-22":["base1-57","base4-86"],"base1-23":["base1-28","base4-42","neo4-68"],"base1-24":["base1-46","base4-69","base5-50"],"base1-25":["base1-41","base4-61","neo4-81"],"base1-29":["base1-50","base3-33","base4-75","neo4-65"],"base1-30":["base1-44","base4-67"],"base1-32":["base1-43","base4-65","base5-49"],"base1-33":["base1-69","base4-100","neo2-70"],"base1-34":["base1-52","base4-78","base5-59","neo4-73"],"base1-37":["base1-55","base4-83"],"base1-38":["base1-59","base4-88","neo2-62"],"base1-40":["base1-61","base4-89","base5-66"],"base1-42":["base1-63","base4-93","base5-68"],"base1-54":["base1-45","base4-68","neo2-53"],"base1-64":["base1-65","base4-95","neo3-56"],"base2-1":["base1-5","base4-6","neo1-30"],"base2-2":["base1-67","base4-98","base5-69"],"base2-3":["base2-51","base5-55","neo2-38"],"base2-4":["base2-51","base5-55","neo2-38"],"base2-7":["base2-40","base4-53"],"base2-8":["base1-22","base4-28"],"base2-12":["base2-51","base5-55","neo2-38"],"base2-13":["base2-63","base4-97","neo4-90"],"base2-14":["base2-48","base4-64"],"base2-15":["base2-37","neo1-36"],"base2-16":["base2-54","base4-77","neo4-44"],"base2-17":["base1-5","base4-6","neo1-30"],"base2-18":["base1-67","base4-98","base5-69"],"base2-19":["base2-51","base5-55","neo2-38"],"base2-20":["base2-51","base5-55","neo2-38"],"base2-23":["base2-40","base4-53"],"base2-24":["base1-22","base4-28"],"base2-28":["base2-51","base5-55","neo2-38"],"base2-29":["base2-63","base4-97","neo4-90"],"base2-30":["base2-48","base4-64"],"base2-31":["base2-37","neo1-36"],"base2-32":["base2-54","base4-77","neo4-44"],"base2-33":["base1-54","base4-81","neo2-42"],"base2-34":["base1-48","base4-72"],"base2-35":["base2-52","base4-74","neo4-64"],"base2-36":["base2-62","base4-92"],"base2-37":["base2-58","base5-63","neo1-68"],"base2-39":["base2-50","base4-70"],"base2-40":["base2-57","base4-82"],"base2-41":["base2-59","base4-85","neo3-47"],"base2-42":["base2-56","base4-80","base5-62"],"base2-43":["base2-55","base5-61"],"base2-44":["base1-60","base5-64"],"base2-45":["base2-61","base4-90"],"base2-46":["base2-53","base4-76","neo3-45"],"base2-48":["base2-49","base4-66"],"base2-60":["neo1-12"],"base3-4":["base1-18","base4-22"],"base3-5":["base1-29","base3-6","base3-21","base4-43"],"base3-6":["base1-50","base3-33","base4-75","neo4-65"],"base3-8":["base1-49","base4-73","base5-54"],"base3-9":["base3-50","neo2-56"],"base3-11":["base1-53","base4-79","base5-60","neo2-7","neo2-26"],"base3-13":["base3-48","base5-57"],"base3-14":["base1-58","base2-60","base4-87","neo1-70"],"base3-19":["base1-18","base4-22"],"base3-20":["base1-29","base3-6","base3-21","base4-43"],"base3-21":["base1-50","base3-33","base4-75","neo4-65"],"base3-23":["base1-49","base4-73","base5-54"],"base3-24":["base3-50","neo2-56"],"base3-26":["base1-53","base4-79","base5-60","neo2-7","neo2-26"],"base3-28":["base3-48","base5-57"],"base3-29":["base1-58","base2-60","base4-87","neo1-70"],"base3-31":["base3-46","base5-56"],"base3-32":["base3-54"],"base3-34":["base3-57","base5-70","neo3-59"],"base3-35":["base3-53","base5-65","neo4-79"],"base3-36":["base3-37","neo3-30"],"base3-37":["base3-47","neo3-44"],"base3-38":["base3-51"],"base3-39":["neo1-23"],"base3-40":["base3-52","neo2-60"],"base3-41":["base1-62","base4-91"],"base3-42":["base3-49","neo1-62"],"base3-43":["base3-55","base5-67","neo1-73"],"base3-44":["base3-56"],"base3-45":["base1-51","base5-58"],"base4-1":["base1-32","base4-46"],"base4-2":["base1-42","base4-63"],"base4-4":["base1-24","base4-35"],"base4-5":["base1-5","base4-6","neo1-30"],"base4-7":["base1-35","base4-50","base5-47"],"base4-9":["base1-53","base4-79","base5-60","neo2-7","neo2-26"],"base4-11":["base1-37","base4-54"],"base4-12":["base2-40","base4-53"],"base4-13":["base1-68","base4-99","neo4-91"],"base4-14":["base1-22","base4-28"],"base4-15":["base1-38","base4-57","neo2-44"],"base4-16":["base1-58","base2-60","base4-87","neo1-70"],"base4-18":["base1-30","base4-44"],"base4-19":["base2-54","base4-77","neo4-44"],"base4-21":["base1-33","base4-47","neo2-41"],"base4-22":["base1-26","base4-38","base5-53","neo4-63"],"base4-23":["base1-47","base4-71","base5-52"],"base4-25":["base1-67","base4-98","base5-69"],"base4-28":["base1-57","base4-86"],"base4-31":["base2-63","base4-97","neo4-90"],"base4-32":["base2-48","base4-64"],"base4-33":["base1-28","base4-42","neo4-68"],"base4-34":["base1-54","base4-81","neo2-42"],"base4-35":["base1-46","base4-69","base5-50"],"base4-36":["base1-41","base4-61","neo4-81"],"base4-37":["base1-48","base4-72"],"base4-39":["base2-52","base4-74","neo4-64"],"base4-41":["base2-62","base4-92"],"base4-43":["base1-50","base3-33","base4-75","neo4-65"],"base4-44":["base1-44","base4-67"],"base4-46":["base1-43","base4-65","base5-49"],"base4-47":["base1-69","base4-100","neo2-70"],"base4-49":["base1-52","base4-78","base5-59","neo4-73"],"base4-52":["base2-50","base4-70"],"base4-53":["base2-57","base4-82"],"base4-54":["base1-55","base4-83"],"base4-55":["base2-59","base4-85","neo3-47"],"base4-56":["base2-56","base4-80","base5-62"],"base4-57":["base1-59","base4-88","neo2-62"],"base4-58":["base1-61","base4-89","base5-66"],"base4-59":["base2-61","base4-90"],"base4-60":["base2-53","base4-76","neo3-45"],"base4-63":["base1-63","base4-93","base5-68"],"base4-64":["base2-49","base4-66"],"base4-81":["base1-45","base4-68","neo2-53"],"base4-94":["base1-65","base4-95","neo3-56"],"base5-1":["base5-39"],"base5-2":["base3-46","base5-56"],"base5-3":["base5-46"],"base5-4":["base5-32"],"base5-5":["base5-33"],"base5-6":["base1-47","base4-71","base5-52"],"base5-7":["base3-57","base5-70","neo3-59"],"base5-8":["base1-35","base4-50","base5-47"],"base5-9":["base1-49","base4-73","base5-54"],"base5-10":["base5-40"],"base5-11":["base1-53","base4-79","base5-60","neo2-7","neo2-26"],"base5-12":["base3-55","base5-67","neo1-73"],"base5-13":["base5-36"],"base5-14":["base1-51","base5-58"],"base5-18":["base5-39"],"base5-19":["base3-46","base5-56"],"base5-20":["base5-46"],"base5-21":["base5-32"],"base5-22":["base5-33"],"base5-23":["base1-47","base4-71","base5-52"],"base5-24":["base3-57","base5-70","neo3-59"],"base5-25":["base1-35","base4-50","base5-47"],"base5-26":["base1-49","base4-73","base5-54"],"base5-27":["base5-40"],"base5-28":["base1-53","base4-79","base5-60","neo2-7","neo2-26"],"base5-29":["base3-55","base5-67","neo1-73"],"base5-30":["base5-36"],"base5-31":["base1-51","base5-58"],"base5-32":["base1-46","base4-69","base5-50"],"base5-33":["base1-26","base4-38","base5-53","neo4-63"],"base5-34":["base1-67","base4-98","base5-69"],"base5-35":["base2-51","base5-55","neo2-38"],"base5-36":["base2-58","base5-63","neo1-68"],"base5-37":["base3-53","base5-65","neo4-79"],"base5-38":["base2-51","base5-55","neo2-38"],"base5-39":["base1-43","base4-65","base5-49"],"base5-40":["base1-52","base4-78","base5-59","neo4-73"],"base5-41":["base3-48","base5-57"],"base5-42":["base2-56","base4-80","base5-62"],"base5-43":["base2-55","base5-61"],"base5-44":["base1-60","base5-64"],"base5-45":["base2-51","base5-55","neo2-38"],"base5-46":["base1-63","base4-93","base5-68"],"base5-51":["base1-61","base4-89","base5-66"],"base5-83":["base1-58","base2-60","base4-87","neo1-70"],"gym1-2":["gym1-22","gym1-70"],"gym1-3":["gym1-25","gym2-40"],"gym1-4":["gym1-42"],"gym1-5":["gym1-45","gym1-46"],"gym1-7":["gym1-52","gym1-83"],"gym1-8":["gym1-50","gym1-80"],"gym1-9":["gym1-86","gym2-87"],"gym1-10":["gym1-32","gym1-57"],"gym1-14":["gym1-58","gym2-55"],"gym1-20":["gym1-40","gym2-34"],"gym1-23":["gym1-71","gym1-72"],"gym1-26":["gym1-48","gym1-49"],"gym1-28":["gym1-81","gym2-84"],"gym1-29":["gym1-89"],"gym1-31":["gym1-53"],"gym1-34":["gym1-96"],"gym1-39":["gym1-24","gym1-74"],"gym1-40":["gym1-38","gym1-66","gym2-68"],"gym1-44":["gym1-43","gym1-77"],"gym1-45":["gym1-47","gym1-78","gym2-70"],"gym1-46":["gym1-47","gym1-78","gym2-70"],"gym1-48":["gym1-75","gym1-76","gym2-38"],"gym1-49":["gym1-75","gym1-76","gym2-38"],"gym1-51":["gym1-82","gym2-85"],"gym1-53":["gym1-87","gym2-89"],"gym1-55":["gym1-30","gym1-85"],"gym1-56":["gym1-90","gym2-92"],"gym1-58":["gym1-93","gym2-96","gym2-97"],"gym1-60":["gym1-95"],"gym2-1":["gym1-35","gym1-62","gym2-62"],"gym2-2":["gym2-31"],"gym2-3":["gym1-73","gym2-37"],"gym2-4":["gym2-41"],"gym2-5":["gym2-73"],"gym2-6":["gym2-42"],"gym2-7":["gym2-45"],"gym2-8":["gym2-43","gym2-74"],"gym2-9":["gym2-47"],"gym2-11":["gym1-81","gym2-84"],"gym2-12":["gym1-54","gym2-90"],"gym2-13":["gym2-88"],"gym2-16":["gym2-58"],"gym2-21":["gym1-65","gym2-66"],"gym2-22":["gym2-67"],"gym2-23":["gym2-44"],"gym2-25":["gym2-77"],"gym2-26":["gym2-78"],"gym2-27":["gym2-49","gym2-80"],"gym2-28":["gym2-51"],"gym2-29":["gym1-58","gym2-55"],"gym2-30":["gym2-99"],"gym2-31":["gym1-61","gym2-60"],"gym2-32":["gym2-61"],"gym2-33":["gym1-63","gym2-64"],"gym2-34":["gym1-38","gym1-66","gym2-68"],"gym2-35":["gym1-67","gym1-68"],"gym2-36":["gym1-71","gym1-72"],"gym2-41":["gym2-39"],"gym2-42":["gym2-72"],"gym2-44":["gym2-75"],"gym2-45":["gym2-76"],"gym2-46":["gym2-83"],"gym2-47":["gym2-82"],"gym2-50":["gym2-48","gym2-79"],"gym2-52":["gym1-84","gym2-86"],"gym2-53":["gym1-82","gym2-85"],"gym2-54":["gym1-88","gym2-91"],"gym2-55":["gym1-93","gym2-96","gym2-97"],"gym2-56":["gym1-92","gym2-95"],"gym2-58":["gym1-91","gym2-93","gym2-94"],"neo1-1":["neo1-34","neo3-28"],"neo1-2":["neo1-66"],"neo1-3":["base2-37","neo1-36"],"neo1-4":["neo1-31","neo1-32"],"neo1-5":["neo1-31","neo1-32"],"neo1-7":["neo1-49","neo3-52"],"neo1-8":["base3-42","neo1-48"],"neo1-10":["neo1-28","neo1-29"],"neo1-11":["neo1-28","neo1-29"],"neo1-14":["base3-55","base5-67","neo1-73"],"neo1-15":["base1-56","base4-84","neo1-69"],"neo1-16":["neo1-51","neo4-56"],"neo1-17":["neo1-46","neo1-47"],"neo1-18":["neo1-46","neo1-47"],"neo1-21":["neo1-43","neo4-76"],"neo1-27":["neo1-75","neo2-64"],"neo1-28":["neo1-53","neo1-54"],"neo1-29":["neo1-53","neo1-54"],"neo1-31":["neo1-80","neo1-81","neo4-85"],"neo1-32":["neo1-80","neo1-81","neo4-85"],"neo1-34":["neo1-65","neo2-58","neo4-75"],"neo1-35":["neo1-71","neo2-63"],"neo1-36":["base2-58","base5-63","neo1-68"],"neo1-37":["neo1-74","neo3-55"],"neo1-38":["neo1-55","neo3-42"],"neo1-39":["neo1-63","neo4-71"],"neo1-42":["neo1-60"],"neo1-44":["neo1-79","neo3-57","neo4-84"],"neo1-45":["neo1-82","neo2-71"],"neo1-46":["neo1-56","neo1-57","neo4-61"],"neo1-47":["neo1-56","neo1-57","neo4-61"],"neo1-48":["base3-49","neo1-62"],"neo1-49":["neo1-61","neo2-55"],"neo1-50":["neo1-78","neo4-83"],"neo1-52":["neo1-67","neo2-59"],"neo2-1":["base2-51","base5-55","neo2-38"],"neo2-2":["neo2-61","neo4-77"],"neo2-4":["neo2-5","neo2-24","neo2-39","neo4-43"],"neo2-6":["base3-50","neo2-56"],"neo2-8":["base1-38","base4-57","neo2-44"],"neo2-9":["base1-38","base4-57","neo2-44"],"neo2-10":["base2-10","base2-26","base4-17","neo2-46","neo4-55"],"neo2-12":["neo2-45"],"neo2-13":["base2-51","base5-55","neo2-38"],"neo2-15":["neo2-65"],"neo2-18":["base1-33","base4-47","neo2-41"],"neo2-19":["base1-54","base4-81","neo2-42"],"neo2-20":["base2-51","base5-55","neo2-38"],"neo2-21":["neo2-61","neo4-77"],"neo2-23":["neo2-5","neo2-24","neo2-39","neo4-43"],"neo2-25":["base3-50","neo2-56"],"neo2-27":["base1-38","base4-57","neo2-44"],"neo2-28":["base1-38","base4-57","neo2-44"],"neo2-29":["base2-10","base2-26","base4-17","neo2-46","neo4-55"],"neo2-31":["neo2-45"],"neo2-32":["base2-51","base5-55","neo2-38"],"neo2-34":["neo2-65"],"neo2-41":["base1-69","base4-100","neo2-70"],"neo2-42":["base1-45","base4-68","neo2-53"],"neo2-43":["base3-52","neo2-60"],"neo2-44":["base1-59","base4-88","neo2-62"],"neo2-45":["neo2-57","neo4-70"],"neo2-52":["neo1-67","neo2-59"],"neo3-1":["neo1-34","neo3-28"],"neo3-2":["base1-3","base4-3","neo4-31"],"neo3-4":["base3-34","neo3-29"],"neo3-8":["neo2-5","neo2-24","neo2-39","neo4-43"],"neo3-9":["neo1-49","neo3-52"],"neo3-10":["base1-53","base4-79","base5-60","neo2-7","neo2-26"],"neo3-12":["base1-39","base5-48","neo4-78"],"neo3-19":["base3-42","neo1-48"],"neo3-21":["base1-58","base2-60","base4-87","neo1-70"],"neo3-25":["base1-65","base4-95","neo3-56"],"neo3-28":["neo1-65","neo2-58","neo4-75"],"neo3-29":["base3-57","base5-70","neo3-59"],"neo3-30":["base3-47","neo3-44"],"neo3-32":["neo1-55","neo3-42"],"neo3-33":["neo3-53","neo4-82"],"neo3-34":["neo3-50","neo4-80"],"neo3-35":["base2-59","base4-85","neo3-47"],"neo3-36":["neo1-79","neo3-57","neo4-84"],"neo3-37":["base2-53","base4-76","neo3-45"],"neo3-48":["neo1-82","neo2-71"],"neo3-52":["neo1-61","neo2-55"],"neo4-1":["neo4-34"],"neo4-2":["base3-34","base5-7","base5-24","neo3-29"],"neo4-3":["neo1-43","neo4-76"],"neo4-4":["base2-51","base5-55","neo2-38"],"neo4-5":["neo4-32"],"neo4-6":["neo4-36"],"neo4-7":["neo2-5","neo2-24","neo2-39","neo4-43"],"neo4-8":["base1-39","base5-48","neo4-78"],"neo4-9":["base2-10","base2-26","base4-17","neo2-46","neo4-55"],"neo4-10":["neo4-39"],"neo4-11":["neo4-38"],"neo4-12":["base1-28","base4-42","neo4-68"],"neo4-13":["neo1-66"],"neo4-14":["neo4-22"],"neo4-15":["neo1-51","neo4-56"],"neo4-17":["neo1-75","neo2-64"],"neo4-18":["neo3-53","neo4-82"],"neo4-19":["neo4-37"],"neo4-20":["base3-55","base5-67","neo1-73"],"neo4-21":["neo2-65"],"neo4-22":["base1-26","base4-38","base5-53","neo4-63"],"neo4-23":["neo1-55","neo3-42"],"neo4-24":["neo1-63","neo4-71"],"neo4-25":["neo4-49"],"neo4-26":["neo1-79","neo3-57","neo4-84"],"neo4-32":["neo1-80","neo1-81","neo4-85"],"neo4-33":["base2-52","base4-74","neo4-64"],"neo4-34":["neo1-65","neo2-58","neo4-75"],"neo4-35":["neo2-61","neo4-77"],"neo4-36":["base1-50","base3-33","base4-75","neo4-65"],"neo4-38":["neo2-57","neo4-70"],"neo4-39":["neo1-56","neo1-57","neo4-61"],"neo4-40":["base2-54","base4-77","neo4-44"],"neo4-45":["base1-41","base4-61","neo4-81"],"neo4-46":["base2-51","base5-55","neo2-38"],"neo4-47":["base3-53","base5-65","neo4-79"],"neo4-48":["base2-51","base5-55","neo2-38"],"neo4-49":["base1-52","base4-78","base5-59","neo4-73"],"neo4-50":["base1-68","base4-99","neo4-91"],"neo4-51":["base3-55","base5-67","neo1-73"],"neo4-52":["base2-51","base5-55","neo2-38"],"neo4-53":["base2-63","base4-97","neo4-90"],"neo4-54":["base2-54","base4-77","neo4-44"],"neo4-62":["neo3-50","neo4-80"],"neo4-72":["neo1-78","neo4-83"]});
 const ROLE_POOLS=Object.freeze(Object.fromEntries(Object.entries(BOOSTER_ROLES).map(([set,roles])=>
  [set,Object.fromEntries(Object.entries(roles).map(([role,ranges])=>[role,new Set(expandRanges(set,ranges))]))])));
 const cardRole=(id,role)=>Object.values(ROLE_POOLS[id?.split('-')[0]]||{}).length>0&&!!ROLE_POOLS[id?.split('-')[0]]?.[role]?.has(id);
 const THEMED_PACKS=Object.freeze([{"id":"arena","name":"Colosseum Circuit","price":20,"day":1,"description":"Reliable Basic Pokémon, straightforward attackers, and staple Energy. A solid choice even late in the season.","sources":["base1","base2","base3","base4","neo1","neo2"],"rare":"basic","uncommon":"basic","common":"basic"},{"id":"evolution","name":"Evolution Workshop","price":26,"day":1,"description":"Evolution Pokémon and their Basic partners. Completes lines from old and newly unlocked expansions.","sources":["base1","base2","base3","base4","base5","gym1","gym2","neo1","neo2","neo3","neo4"],"rare":"evolution","uncommon":"evolution","common":"basic","pair":true},{"id":"toolkit","name":"Trainer's Toolkit","price":22,"day":1,"description":"Trainer-heavy support, search and disruption; older cards stay useful for competitive decks.","sources":["base1","base2","base3","base4","base5","gym1","gym2","neo1","neo2","neo3","neo4"],"rare":"trainer","uncommon":"trainer","common":"trainer"},{"id":"wilderness","name":"Wild Expedition","price":25,"day":8,"description":"Jungle and Fossil Pokémon, with classic support cards and new discoveries as regions unlock.","sources":["base1","base2","base3","neo2"],"rare":"basic","uncommon":"evolution","common":"basic"},{"id":"rocket","name":"Rocket's Shadows","price":30,"day":22,"description":"Dark Pokémon and Team Rocket tricks; new Dark partners arrive with Neo Destiny.","sources":["base5","neo4"],"rare":"evolution","uncommon":"evolution","common":"basic"},{"id":"gym","name":"Gym Champions","price":35,"day":33,"description":"Leader Pokémon, their signature lines, and support from both Gym expansions.","sources":["gym1","gym2"],"rare":"evolution","uncommon":"evolution","common":"basic"},{"id":"johto","name":"Johto Frontiers","price":40,"day":48,"description":"Discover Neo-era Pokémon and upgrade your Johto lines across every unlocked Neo set.","sources":["neo1","neo2","neo3","neo4"],"rare":"evolution","uncommon":"evolution","common":"basic"},{"id":"mystery","name":"Mystery Vault","price":48,"day":68,"description":"Late-season rare Pokémon, powerful support and the chance to discover secret or Shining cards.","sources":["neo3","neo4","base5"],"rare":null,"uncommon":null,"common":null}]);
 const THEMED_BY_ID=new Map(THEMED_PACKS.map(pack=>[pack.id,pack]));
 const STARTER_PACK_IDS=new Set(['arena','evolution','toolkit']);
 const CHARACTER_PACKS=Object.freeze({hana:'toolkit',reina:'wilderness',shiori:'evolution',yuna:'arena',
  akari:'gym',camila:'rocket',marina:'johto',kaede:'mystery',jinx:'mystery',luna:'johto',
  elena:'arena',rina:'arena',sierra:'rocket',sol:'evolution',jun:'wilderness',
  teo:'wilderness',iris:'gym',elio:'wilderness',alma:'gym',nereo:'johto'});
 // Offer availability always comes from the existing expansion release/relationship rules.
 // A custom booster never makes a locked printing obtainable early.
 function availableThemeSets(state,pack){
  const allowed=new Set(shopPacks(state).filter(offer=>offer.unlocked).map(offer=>offer.set));
  return pack.sources.filter(set=>allowed.has(set));
 }
 function selectThemePool(sets,rarity,role=null){
  const all=sets.flatMap(set=>PACK_POOLS[set]?.[rarity]||[]);
  if(!role)return all;
  const preferred=all.filter(id=>cardRole(id,role));
  return preferred.length?preferred:all;
 }
 function themeUnlocked(state,pack){
  if(pack.day===1)return true;
  const unlocked=new Set(shopPacks(state).filter(p=>p.unlocked).map(p=>p.set));
  const triggerSets=pack.id==='mystery'?['neo3','neo4']:pack.sources.filter(set=>set!=='base1');
  return (Number(state?.day)||0)>=pack.day||triggerSets.some(set=>unlocked.has(set));
 }
 // Insight lowers shop prices without bypassing expansion availability or changing card odds.
 const insightDiscount=state=>(Number(state?.insight)||0)>=15?5:(Number(state?.insight)||0)>=6?3:0;
 function themedPacks(state){
  const owned=state?.deckJourney?.owned||{};
  return THEMED_PACKS.map(pack=>{
   const sources=availableThemeSets(state,pack),unlocked=themeUnlocked(state,pack);
   // Every unlocked expansion supplies shared Common/Uncommon support;
   // rare cards remain tied to the featured theme's own expansion pool.
   const shared=shopPacks(state).filter(offer=>offer.unlocked).map(offer=>offer.set);
   const possible=new Set(['rare','holo','secret'].flatMap(kind=>selectThemePool(sources,kind,pack.rare))
    .concat(selectThemePool(shared,'uncommon'),selectThemePool(shared,'common')));
   for(const id of [...ENERGY].filter(x=>x!=='base1-96'))possible.add(id);
   const unique=[...possible].filter(id=>(owned[id]||0)>0).length;
   return {...pack,price:Math.max(1,pack.price-insightDiscount(state)),discount:insightDiscount(state),unlocked,sources,futureSources:[...pack.sources],owned:unique,total:possible.size,
    completion:possible.size?Math.round(100*unique/possible.size):0,
    welcome:STARTER_PACK_IDS.has(pack.id)?Math.max(0,state?.deckJourney?.welcomePacks||0):0,
    unlockHint:pack.day===1?'Available from Day 1':'Usually Day '+pack.day+' · earlier when matching expansion access is earned'};
  });
 }
 function themeContains(state,themeId,cardId){
  const theme=THEMED_BY_ID.get(themeId);
  if(!theme||!themeUnlocked(state,theme))return false;
  if(ENERGY.has(cardId)&&cardId!=='base1-96')return true;
  const sources=availableThemeSets(state,theme),set=cardId?.split('-')[0],rarity=packRarity(cardId);
  const unlocked=shopPacks(state).some(offer=>offer.set===set&&offer.unlocked);
  if(!unlocked)return false;
  // Non-featured support slots draw from all unlocked expansions, including
  // classic staple Trainers in otherwise late-season themed boosters.
  if(rarity==='common'||rarity==='uncommon')return true;
  if(!sources.includes(set))return false;
  return ['rare','holo','secret'].includes(rarity)&&
   selectThemePool(sources,rarity,theme.rare).includes(cardId);
 }
 // Mixed booster design: every pack contains genuine Pokémon and Trainer support.
 // The rare plus two featured slots distinguish ten-card themes (3/10); the
 // remaining slots draw shared support from unlocked expansions. Mini packs
 // protect those same roles, when the unlocked rarities can provide them.
 function randomThemedPack(state,themeId,rng=Math.random,count=10){
  if(count!==5&&count!==10)throw Error('Only five- and ten-card packs are supported');
  const theme=THEMED_BY_ID.get(themeId);
  if(!theme)throw Error('This themed booster does not exist');
  const offer=themedPacks(state).find(x=>x.id===themeId);
  if(!offer?.unlocked)throw Error(theme.name+' is not unlocked yet');
  const sets=offer.sources;
  if(!sets.length)throw Error('No unlocked expansions for this booster');
  const sharedSets=shopPacks(state).filter(offer=>offer.unlocked).map(offer=>offer.set);
  const roll=Math.max(0,Math.min(.999999,rng()));
  const hasSecret=sets.some(set=>PACK_POOLS[set].secret.length>0);
  const rareKind=hasSecret&&roll<.01?'secret':roll<(hasSecret?.26:.25)?'holo':'rare';
  const cached=new Map();
  const pool=(rarity,role=null)=>{
   const key=rarity+':'+(role||'any');
   if(!cached.has(key)){
    const all=selectThemePool(sharedSets,rarity);
    cached.set(key,role?all.filter(id=>cardRole(id,role)):all);
   }
   return cached.get(key);
  };
  const pick=(rarity,role=null)=>{
   const preferred=role?pool(rarity,role):[];
   return chooseRandom(preferred.length?preferred:pool(rarity),rng);
  };
  const featuredPool=(rarity,role=null)=>{
   const all=selectThemePool(sets,rarity);
   return role?all.filter(id=>cardRole(id,role)):all;
  };
  const featuredPick=(rarity,role=null)=>{
   const preferred=role?featuredPool(rarity,role):[];
   return chooseRandom(preferred.length?preferred:featuredPool(rarity),rng);
  };
  const rare=featuredPick(rareKind,theme.rare);
  const energy=chooseRandom([...ENERGY].filter(id=>id!=='base1-96'),rng);
  const ucCount=count===5?1:3,commonCount=count===5?2:5;
  const target=count===10?{basic:2,evolution:1,trainer:2}:{basic:1,evolution:1,trainer:1};
  const selected=[rare],uncommons=[],commons=[],roles=Object.keys(target);
  const lacking=role=>Math.max(0,target[role]-selected.filter(id=>cardRole(id,role)).length);
  // Small matching search: a future card can satisfy only ONE missing role.
  // Checking roles independently would incorrectly accept an all-Basic mini pack.
  function balancedPick(rarity,future,preferred=null){
   const candidates=roles.filter(role=>lacking(role)>0&&pool(rarity,role).length);
   function feasible(role){
    const remaining=Object.fromEntries(roles.map(key=>[key,Math.max(0,lacking(key)-Number(key===role))]));
    function match(at){
     const need=roles.reduce((sum,key)=>sum+remaining[key],0);
     if(!need)return true;
     if(need>future.length-at)return false;
     if(at===future.length)return false;
     for(const key of roles)if(remaining[key]&&pool(future[at],key).length){
      remaining[key]--;
      if(match(at+1))return true;
      remaining[key]++;
     }
     return match(at+1);
    }
    return match(0);
   }
   if(preferred&&pool(rarity,preferred).length&&feasible(preferred))
    return pick(rarity,preferred);
   const feasibleRoles=candidates.filter(feasible),choices=feasibleRoles.length?feasibleRoles:candidates;
   if(choices.length){
    // Take a constrained role before consuming the only rarity that carries it.
    choices.sort((a,b)=>{
     const capacity=role=>future.filter(kind=>pool(kind,role).length>0).length;
     return (capacity(a)-lacking(a))-(capacity(b)-lacking(b))||
      ['evolution','trainer','basic'].indexOf(a)-['evolution','trainer','basic'].indexOf(b);
    });
    return pick(rarity,choices[0]);
   }
   return pick(rarity,preferred);
  }
  // The Evolution Workshop still guarantees a printable Stage 1 plus Basic;
  // prefer an intermediate Stage 1 for its featured rare when possible.
  const ucPool=featuredPool('uncommon','evolution'),commonBasics=new Set(pool('common','basic'));
  const linked=ucPool.filter(id=>(BOOSTER_PARENTS[id]||[]).some(parent=>commonBasics.has(parent)));
  const parentUncommon=(BOOSTER_PARENTS[rare]||[]).filter(id=>linked.includes(id));
  const firstUncommon=theme.pair&&linked.length?
   chooseRandom(parentUncommon.length?parentUncommon:linked,rng):
   count===10?featuredPick('uncommon',theme.uncommon):
   balancedPick('uncommon',['common','common'],theme.uncommon);
  uncommons.push(firstUncommon);selected.push(firstUncommon);
  // Other packs sometimes supply a usable family pair as a pleasant bonus.
  const possibleParents=(BOOSTER_PARENTS[firstUncommon]||[]).filter(id=>commonBasics.has(id));
  const shouldPair=theme.pair||(possibleParents.length>0&&rng()<.35);
  const parent=shouldPair&&possibleParents.length?chooseRandom(possibleParents,rng):null;
  if(parent){
   commons.push(parent);selected.push(parent);
  }else if(count===10){
   const id=featuredPick('common',theme.common);commons.push(id);selected.push(id);
  }
  // Complete the original 1 rare / 3 uncommon / 5 common / 1 Energy
  // (or 1/1/2/1 mini) without disturbing the economy or expansion gates.
  const pending=[];
  for(let i=uncommons.length;i<ucCount;i++)pending.push('uncommon');
  for(let i=commons.length;i<commonCount;i++)pending.push('common');
  for(let i=0;i<pending.length;i++){
   const rarity=pending[i],future=pending.slice(i+1);
   const preferred=count===5&&rarity==='common'&&commons.length===0?theme.common:null;
   const id=balancedPick(rarity,future,preferred);
   if(rarity==='uncommon')uncommons.push(id);else commons.push(id);
   selected.push(id);
  }
  const cards=[rare,energy,...uncommons,...commons];
  for(let i=cards.length-1;i>0;i--){
   const j=Math.min(i,Math.floor(Math.max(0,rng())*(i+1)));
   [cards[i],cards[j]]=[cards[j],cards[i]];
  }
  return cards;
 }
 function themeForCharacter(state,npc){
  const preferred=CHARACTER_PACKS[npc]||'arena';
  return themedPacks(state).some(x=>x.id===preferred&&x.unlocked)?preferred:'arena';
 }
 const setForCharacter=id=>{if(!id)return 'base1';if(CHARACTER_SETS[id])return CHARACTER_SETS[id];const sets=Object.keys(SETS);let hash=2166136261;for(const letter of id){hash^=letter.charCodeAt(0);hash=Math.imul(hash,16777619);}return sets[(hash>>>0)%sets.length];};
 function randomPack(set,rng=Math.random,count=10){
  if(count!==5&&count!==10)throw Error('Only five- and ten-card packs are supported');
  const actual=PACK_POOLS[set]?set:'base1',pool=PACK_POOLS[actual];
  // Tuned game probabilities: 25% holo, plus 1% Secret/Shining in eligible sets.
  const roll=Math.max(0,Math.min(0.999999,rng())),hasSecret=pool.secret.length>0;
  const rarity=hasSecret&&roll<0.01?'secret':roll<(hasSecret?0.26:0.25)?'holo':'rare';
  const rare=chooseRandom(pool[rarity].length?pool[rarity]:pool.rare,rng);
  // Basic Energy always comes from Base Set, even when the chosen set has none.
  const energy=chooseRandom([...ENERGY].filter(id=>id!=='base1-96'),rng);
  const cards=[rare,energy],uncommons=count===5?1:3,commons=count===5?2:5;
  for(let i=0;i<uncommons;i++)cards.push(chooseRandom(pool.uncommon,rng));
  for(let i=0;i<commons;i++)cards.push(chooseRandom(pool.common,rng));
  for(let i=cards.length-1;i>0;i--){const j=Math.min(i,Math.floor(Math.max(0,rng())*(i+1)));[cards[i],cards[j]]=[cards[j],cards[i]];}
  return cards;
 }
 function shopPacks(state){
  const owned=state?.deckJourney?.owned||{};
  return SHOP_OFFERS.map(offer=>{
   const set=offer.set,info=SETS[set],unique=Object.keys(owned).filter(id=>id.startsWith(set+'-')&&owned[id]>0).length;
   const affection=Math.max(Number(state?.relationships?.[offer.npc]?.affection)||0,Number(state?.bonds?.[offer.npc]?.affection)||0);
   const story=offer.npc&&Object.keys(state?.storyDone||{}).some(id=>id.startsWith(offer.npc+'_route_')&&state.storyDone[id]);
   const cup=offer.cup&&state?.tournaments?.[offer.cup]?.state==='champion';
   const vouchers=state?.deckJourney?.vouchers?.[set]||0;
   const unlocked=!offer.npc||state?.day>=offer.day||affection>=3||!!story||!!cup||unique>0||vouchers>0;
   const hint=offer.npc?'Day '+offer.day+' · bond with '+offer.npc+' · or win matching cards'+(offer.cup?' · '+offer.cup+' cup':''):'Available from Day 1';
   return {...offer,name:info.name,total:info.size,owned:unique,completion:Math.round(100*unique/info.size),unlocked,vouchers,unlockHint:hint};
  });
 }
 function fresh(){return {starter:null,owned:{},deck:[],draft:null,packs:0,rewards:0,lastPack:null,pendingPacks:[],vouchers:{},welcomePacks:0,weeklyWins:{},weeklyPacks:{},rewardedDuels:{}};}
 function hydrate(state){
  const x=state.deckJourney;if(x===null||x===undefined)return state;
  if(!x||typeof x!=='object'||Array.isArray(x)){state.deckJourney=fresh();return state}
  if(!byId.has(x.starter)){state.deckJourney=fresh();return state}
  if(!x.owned||typeof x.owned!=='object'||Array.isArray(x.owned))x.owned={};
  for(const id of Object.keys(x.owned))if(!allAllowed.has(id)||!Number.isInteger(x.owned[id])||x.owned[id]<0||x.owned[id]>999)delete x.owned[id];
  x.deck=Array.isArray(x.deck)&&x.deck.length===60?x.deck.filter(id=>allAllowed.has(id)):byId.get(x.starter).cards.slice();
  if(x.deck.length!==60)x.deck=byId.get(x.starter).cards.slice();
  for(const [id,n] of Object.entries(rank(x.deck)))x.owned[id]=Math.max(n,x.owned[id]||0);
  if(!Array.isArray(x.draft)||x.draft.length>60||x.draft.some(id=>!allAllowed.has(id)))x.draft=null;
  if(!x.lastPack||!Array.isArray(x.lastPack.cards)||![5,10].includes(x.lastPack.cards.length)||x.lastPack.cards.some(id=>!allAllowed.has(id)))x.lastPack=null;
  else{x.lastPack.source=['win','shop','gift'].includes(x.lastPack.source)?x.lastPack.source:'shop';x.lastPack.opened=x.lastPack.opened===true;}
  if(!Array.isArray(x.pendingPacks))x.pendingPacks=[];
  x.pendingPacks=x.pendingPacks.filter(p=>p&&Array.isArray(p.cards)&&[5,10].includes(p.cards.length)&&p.cards.every(id=>allAllowed.has(id))&&['win','shop','gift'].includes(p.source));
  for(const p of x.pendingPacks)p.opened=false;
  for(const key of ['weeklyWins','weeklyPacks','rewardedDuels'])
   if(!x[key]||typeof x[key]!=='object'||Array.isArray(x[key]))x[key]={};
  for(const [key,value] of Object.entries(x.weeklyWins))
   if(!/^([1-9]|1[0-3]):[a-z0-9_-]{1,70}$/.test(key)||value!==true)delete x.weeklyWins[key];
  for(const [week,count] of Object.entries(x.weeklyPacks))
   if(!/^([1-9]|1[0-3])$/.test(week)||!Number.isInteger(count)||count<0||count>2)delete x.weeklyPacks[week];
  for(const [id,used] of Object.entries(x.rewardedDuels))
   if(typeof id!=='string'||!id||id.length>150||used!==true)delete x.rewardedDuels[id];
  if(!x.vouchers||typeof x.vouchers!=='object'||Array.isArray(x.vouchers))x.vouchers={};
  for(const [set,n] of Object.entries(x.vouchers))if(!SETS[set]||!Number.isInteger(n)||n<0||n>99)delete x.vouchers[set];
  x.welcomePacks=Number.isInteger(x.welcomePacks)&&x.welcomePacks>=0&&x.welcomePacks<=2?x.welcomePacks:0;
  x.packs=Number.isInteger(x.packs)&&x.packs>=0?x.packs:0;x.rewards=Number.isInteger(x.rewards)&&x.rewards>=0?x.rewards:0;
  return state;
 }
 function choose(state,id){if(state.deckJourney?.starter)throw Error('Starter deck already chosen');
  const starter=byId.get(id);if(!starter)throw Error('Choose one of the three starter decks');
  state.deckJourney={...fresh(),starter:id,owned:rank(starter.cards),deck:[...starter.cards],welcomePacks:2};state.playerDeck='custom';
  return starter;
 }
 function check(deck,owned){
  const errors=[];
  if(!Array.isArray(deck)||deck.length!==60)errors.push('The deck must contain exactly 60 cards.');
  const counts=rank(Array.isArray(deck)?deck:[]);
  for(const [id,n] of Object.entries(counts)){
   if(!allAllowed.has(id))errors.push('Unknown campaign card '+id);
   if(n>(owned?.[id]||0))errors.push('You do not own '+n+' copies of '+id);
   if(!ENERGY.has(id)&&n>4)errors.push('Four-copy limit exceeded for '+id);
  }
  const basics=new Set(['base1-46','base1-28','base1-60','base1-68','base1-44','base1-66','base1-63','base1-41','base1-65','base1-58','base1-53','base1-67','base1-61','base1-43','base1-49','base1-31','base1-50','base1-52','base1-62','base1-56']);
  if(!Object.keys(counts).some(id=>basics.has(id)))errors.push('You need at least one Basic Pokémon.');
  return {valid:errors.length===0,errors,counts};
 }
 function draft(state){hydrate(state);const x=state.deckJourney;if(!x?.starter)throw Error('Choose a starter first');
  if(!x.draft)x.draft=[...x.deck];return x.draft;
 }
 function change(state,remove,add){const x=state.deckJourney;draft(state);
  if(remove===add)throw Error('Choose two different cards');
  const at=x.draft.indexOf(remove);
  if(at<0||!allAllowed.has(add))throw Error('Choose a card to replace and one you own');
  const updated=[...x.draft];updated.splice(at,1,add);
  const v=check(updated,x.owned);if(!v.valid)throw Error(v.errors[0]);
  x.draft=updated;return updated;
 }
 function edit(state,id,quantity){
  const x=state.deckJourney,prior=draft(state);
  if(!allAllowed.has(id)||!Number.isInteger(quantity)||Math.abs(quantity)!==1)throw Error('Invalid deck edit');
  const updated=[...prior],counts=rank(updated);
  if(quantity<0){
   const at=updated.lastIndexOf(id);if(at<0)throw Error('This card is not in your deck');
   updated.splice(at,1);
  }else{
   if(updated.length>=60)throw Error('Remove a card before adding another');
   if((counts[id]||0)>=(x.owned[id]||0))throw Error('You do not own another copy of this card');
   if(!ENERGY.has(id)&&(counts[id]||0)>=4)throw Error('Four-copy limit reached');
   updated.push(id);
  }
  x.draft=updated;return updated;
 }
 function save(state){const x=state.deckJourney;draft(state);const v=check(x.draft,x.owned);
  if(!v.valid)throw Error(v.errors.join(' '));x.deck=[...x.draft];x.draft=null;return x.deck;
 }
 function cancel(state){if(state.deckJourney)state.deckJourney.draft=null}
 function grant(x,ids,source,set,giver,kind=null,theme=null){
  for(const id of ids)x.owned[id]=(x.owned[id]||0)+1;
  const pack={cards:[...ids],source,set,giver:giver||null,opened:false};
  if(kind)pack.kind=kind;
  if(theme)pack.theme=theme;
  // Preserve every unviewed reward, even across a reload.
  if(x.lastPack&&!x.lastPack.opened)x.pendingPacks.push(pack);
  else x.lastPack=pack;
  return ids;
 }
 // Called after authentic duel settlement. Routine wins have a weekly cap;
 // authored story wins and tournament championships are separate milestones.
 function reward(state,win,giver=null,rng=Math.random,context={}){
  const x=state?.deckJourney;
  if(!x?.starter||!win)return null;
  hydrate(state);
  const day=Number.isInteger(context.day)?context.day:state.day;
  if(!Number.isInteger(day)||day<1||day>90)return null;
  const duelId=typeof context.duelId==='string'?context.duelId:null;
  if(duelId&&x.rewardedDuels[duelId])return null;
  const week=String(Math.ceil(day/7)),npc=giver||'trainer',key=week+':'+npc;
  const story=context.story===true,championship=context.championship===true;
  if(!story&&!championship&&(x.weeklyWins[key]||(x.weeklyPacks[week]||0)>=2))return null;
  // NPC victory rewards do not bypass expansion unlock progression.
  const desired=setForCharacter(giver);
  const set=shopPacks(state).some(p=>p.set===desired&&p.unlocked)?desired:'base1';
  const theme=themeForCharacter(state,giver);
  const ids=randomThemedPack(state,theme,rng,championship?10:5);
  if(!story&&!championship)x.weeklyPacks[week]=(x.weeklyPacks[week]||0)+1;
  x.weeklyWins[key]=true;
  if(duelId)x.rewardedDuels[duelId]=true;
  x.rewards++;
  return grant(x,ids,'win',set,giver,championship?'championship':story?'story':'weekly',theme);
 }
 // Welcome mini packs are chosen by the player: two free five-card draws
 // from the three Day 1 themes. Normal shop boosters remain ten cards.
 function buyThemedPack(state,themeId='arena',rng=Math.random){
  const x=state?.deckJourney;
  if(!x?.starter)throw Error('Choose your starter before opening packs');
  if(state.location!=='shop'||state.day>90)throw Error('Buy booster packs at the card shop');
  if(state.pendingDuel||state.activeStory||state.activeSideQuest||state.activeSituation||state.activeArc||state.activeEncounter)
   throw Error('Finish the current scene first');
  if(x.lastPack&&!x.lastPack.opened)throw Error('Reveal your previous booster before buying another');
  const offer=themedPacks(state).find(p=>p.id===themeId);
  if(!offer)throw Error('This themed booster does not exist');
  if(!offer.unlocked)throw Error(offer.name+' is not unlocked yet');
  const welcome=STARTER_PACK_IDS.has(themeId)&&x.welcomePacks>0;
  if(!welcome&&(state.credits||0)<offer.price)throw Error('A '+offer.name+' pack costs '+offer.price+' credits');
  const size=welcome?5:10,ids=randomThemedPack(state,themeId,rng,size);
  if(welcome)x.welcomePacks--;
  else{state.credits-=offer.price;x.packs++;}
  return grant(x,ids,welcome?'gift':'shop',offer.sources[0]||'base1',null,welcome?'welcome':'themed',themeId);
 }
 function buyPack(state,set='base1',rng=Math.random){const x=state?.deckJourney;
  if(!x?.starter)throw Error('Choose your starter before opening packs');
  if(state.location!=='shop'||state.day>90)throw Error('Buy booster packs at the card shop');
  if(state.pendingDuel||state.activeStory||state.activeSideQuest||state.activeSituation||state.activeArc||state.activeEncounter)throw Error('Finish the current scene first');
  if(x.lastPack&&!x.lastPack.opened)throw Error('Reveal your previous booster before buying another');
  const offer=shopPacks(state).find(p=>p.set===set);
  if(!offer)throw Error('This booster does not exist');
  if(!offer.unlocked)throw Error(offer.name+' is not unlocked yet');
  if((state.credits||0)<offer.price)throw Error('A '+offer.name+' pack costs '+offer.price+' credits');
  const ids=randomPack(set,rng);
  state.credits-=offer.price;x.packs++;return grant(x,ids,'shop',set,null);
 }
 function awardSignature(state,id){
  if(!state?.deckJourney?.starter||!allAllowed.has(id))throw Error('Invalid signature card');
  const owned=state.deckJourney.owned;owned[id]=(owned[id]||0)+1;
  return id;
 }
 function awardVoucher(state,set){
  if(!state?.deckJourney?.starter||!SETS[set])throw Error('Invalid booster voucher');
  const vouchers=state.deckJourney.vouchers||(state.deckJourney.vouchers={});
  vouchers[set]=(vouchers[set]||0)+1;return vouchers[set];
 }
 function redeemVoucher(state,set,rng=Math.random){
  const x=state?.deckJourney;
  if(!x?.starter||!SETS[set])throw Error('Invalid booster voucher');
  if(state.location!=='shop'||state.day>90)throw Error('Redeem booster vouchers at the card shop');
  if(state.pendingDuel||state.activeStory||state.activeSideQuest||state.activeSituation||state.activeArc||state.activeEncounter)throw Error('Finish the current scene first');
  if(x.lastPack&&!x.lastPack.opened)throw Error('Reveal your previous booster before opening another');
  if(!x.vouchers?.[set])throw Error('You have no '+SETS[set].name+' booster vouchers');
  const ids=randomPack(set,rng);
  x.vouchers[set]--;x.packs++;
  return grant(x,ids,'gift',set,null);
 }
 return Object.freeze({starters,upgrade,ENERGY,SETS,SHOP_OFFERS,shopPacks,THEMED_PACKS,themedPacks,themeContains,randomThemedPack,themeForCharacter,buyThemedPack,canOwn:id=>allAllowed.has(id),awardSignature,awardVoucher,redeemVoucher,CHARACTER_SETS,setForCharacter,randomPack,packRarity,PACK_POOLS,byId:id=>byId.get(id),fresh,hydrate,choose,check,draft,edit,change,save,cancel,reward,buyPack,rank});
});
