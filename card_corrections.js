'use strict';
const CARD_CORRECTIONS={
 'neo4-58':{name:'[Perform]',text:"If an attack damaged Unown [P] during your opponent's last turn and Unown [P] was your Active Pokémon, Unown [P]'s Hidden Power attack does that much more damage to the Defending Pokémon. This power can be used even if Unown [P] is Confused."},
 'neo2-49':{name:'[Metal]',text:'Whenever a Metal Pokémon damages 1 of your Pokémon, reduce that damage by 30 (after applying Weakness and Resistance). This power stops working if you have more than 1 Unown M in play. (This power works even if Unown M is Asleep, Confused, or Paralyzed.)'},
 'neo2-50':{name:'[Normal]',text:'Whenever a Colorless Pokémon damages 1 of your Pokémon, reduce that damage by 30 (after applying Weakness and Resistance). This power stops working if you have more than 1 Unown N in play. (This power works even if Unown N is Asleep, Confused, or Paralyzed.)'},
 'neo2-68':{name:'[Increase]',text:"When you play Unown I from your hand, you may search your deck for a card with Unown in its name and put it onto your Bench. Shuffle your deck afterward. You can't use this power if your Bench is full."},
 'neo3-35':{name:'Allergic Pollen',text:"As long as Parasect is in play, cards in any player's discard piles are not affected by attacks or Pokémon Powers. This power stops working if Parasect becomes Asleep, Confused, or Paralyzed."},
 'neo4-26':{name:'Fluffy Wool',text:"During your opponent's turn, if Light Piloswine is your Active Pokémon and is damaged by your opponent's attack (even if it's Knocked Out), flip a coin. If heads, the attacking Pokémon is now Asleep. This power stops working if Light Piloswine is already Asleep, Confused, or Paralyzed when your opponent attacks."}
};
function applyCardCorrections(list){for(const c of list||[]){const fix=CARD_CORRECTIONS[c.id];if(!fix)continue;const empty=(c.abilities||[]).find(a=>!a.text);if(empty)Object.assign(empty,fix,{type:'Pokémon Power'});else if(!(c.abilities||[]).some(a=>a.name===fix.name))(c.abilities??=[]).push({...fix,type:'Pokémon Power'})}return list}
if(typeof module!=='undefined')module.exports={CARD_CORRECTIONS,applyCardCorrections};
if(typeof window!=='undefined')window.NeoCardCorrections={CARD_CORRECTIONS,applyCardCorrections};
