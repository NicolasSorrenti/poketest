'use strict';
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoHarborFinale=api;
})(typeof window!=='undefined'?window:null,function(){
 const ENDING_CHOICES=[
  {id:'circuit',title:'Chase the next tournament season',description:'Keep competing beyond Neo Harbor, wherever the circuit leads.'},
  {id:'town',title:'Build a life in Neo Harbor',description:'Stay connected with the community you came to know.'},
  {id:'mentor',title:'Help the next generation of players',description:'Become the person who makes someone else’s first tournament possible.'}
 ];
 const RELATIONSHIP_OUTCOMES={
  hana:'Hana saves you a chair at The Lucky Draw. This time she has no trouble making space for her own plans, either.',
  reina:'Reina declares your next match has already begun, then stays to hear what you have to say before the first card is played.',
  shiori:'Shiori discovers that returning to the table can be a beginning, not an ending. She asks you to stay for another conversation.',
  yuna:'Yuna drafts a ridiculous new combo and insists you be the first to test it. The laughter lasts well after the arcade closes.',
  akari:'Akari closes her notebook without checking a single prediction. She has begun to look forward to the unexpected.',
  camila:'Camila sets aside her careful terms and conditions. Some friendships, she decides, should never be treated like trades.',
  marina:'Marina signs up for the next event before anyone asks her to. Then she invites you to watch the river in the evening.',
  kaede:'Kaede leaves a train ticket on the table, then comes back for it. She has not decided everything, but she no longer has to decide alone.'
 };
 const ROMANCE_OUTCOMES={
  hana:'Hana threads her fingers through yours outside the shop, smiling at the thought of ordinary days you get to choose together.',
  reina:'Reina challenges you to a rematch, only to admit—with a rare smile—that she hopes the day lasts much longer than the duel.',
  shiori:'Shiori lets the silence between you settle into something comfortable. She no longer needs to see the outcome before beginning.',
  yuna:'Yuna plans the most spectacular date in town, forgets half the plan, and discovers the unplanned parts are her favorites.',
  akari:'Akari abandons her carefully plotted itinerary and asks where you would like to go together. The uncertainty is thrilling.',
  camila:'Camila reaches for your hand without a clever remark to cover it. She seems delighted to find she does not need one.',
  marina:'Marina meets you at the river, then walks beside you toward the lights of town, choosing every step for herself.',
  kaede:'Kaede offers to share the next road with you. It is a quieter promise than either of you expected, but she means it.'
 };
 function summary(state){
  const trophies=state.tournament?.completed||{},championship=trophies.championship;
  const wins=(state.results||[]).filter(r=>r.won).length;
  const points=state.points||0;
  const partner=state.partner;
  const friends=Object.entries(state.routeOutcomes||{}).filter(([id,value])=>value==='friendship').map(([id])=>id);
  const relationships=state.relationships||{};
  const strongest=Object.keys(relationships).sort((a,b)=>{
   const score=id=>(relationships[id]?.affection||0)+(relationships[id]?.trust||0)*2;
   return score(b)-score(a);
  })[0]||null;
  let title,competition;
  if(championship?.won){title='Neo Harbor Champion';competition='The championship trophy is yours. The town speaks of your final matches, but you remember the people who made those days matter.';}
  else if(championship){title='The Challenger Who Returned';competition='You competed on the biggest stage in town. The final result was not the one you wanted, but your season has already changed you.';}
  else if(points>=35){title='A Season of Unfinished Business';competition='You built a name in the circuit, even without reaching the final bracket. There will be more tables and more chances to play.';}
  else {title='A Different Kind of Victory';competition='Your path through Neo Harbor was never only about the championship. The season still gave you stories worth taking home.';}
  const intimate=partner?ROMANCE_OUTCOMES[partner]:friends.length?RELATIONSHIP_OUTCOMES[friends[0]]:strongest&&relationships[strongest].affection>=3?RELATIONSHIP_OUTCOMES[strongest]:'The town no longer feels quite so unfamiliar. Even the empty tables hold memories.';
  return {title,competition,intimate,wins,points,partner,friends,champion:!!championship?.won};
 }
 function choose(state,id){
  if(state.day<=90)throw Error('Finish the campaign first');
  const option=ENDING_CHOICES.find(e=>e.id===id);if(!option)throw Error('Unknown epilogue decision');
  if(!state.finale||typeof state.finale!=='object')state.finale={};
  if(state.finale.choice&&state.finale.choice!==id)throw Error('Your epilogue has already been chosen');
  state.finale.choice=id;state.finale.closed=true;
  const outcome=summary(state);
  const text=id==='circuit'?'There are tournaments beyond this town. You pack your deck knowing you will return with new stories.':
    id==='town'?'You keep a place for yourself in Neo Harbor. The games and familiar faces become part of your ordinary life.':
    'You volunteer at the next beginners’ event. Watching the first matches reminds you why you fell in love with the game.';
  return {...outcome,choice:id,choiceTitle:option.title,closing:text};
 }
 function newGamePlus(oldState,fresh){
  if(oldState.day<=90)throw Error('Complete the season before New Game+');
  if(!oldState.finale?.choice)throw Error('Choose an epilogue first');
  const state=fresh();
  state.newGamePlus=(oldState.newGamePlus||0)+1;
  state.credits=100+20*state.newGamePlus;
  if(oldState.collection?.starterReady){
   // Keep cards and saved decks, never the previous story flags or relationship progress.
   state.collection=JSON.parse(JSON.stringify(oldState.collection));
   if(Array.isArray(state.collection.customDeck)&&state.collection.customDeck.length===60)state.playerDeck='custom';
  }
  state.galleryUnlocked=true;
  return state;
 }
 return Object.freeze({ENDING_CHOICES,RELATIONSHIP_OUTCOMES,summary,choose,newGamePlus});
});
