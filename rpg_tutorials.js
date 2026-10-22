'use strict';
// Gameplay help is separate from character dialogue. Each topic appears on its
// first two actual uses during a season and is saved alongside that season.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgTutorials=api;
})(typeof window!=='undefined'?window:null,function(){
 const lessons=Object.freeze({
  travel:[
   {title:'Explore the town',text:'Travelling between locations is free and does not advance the clock. People appear in different places at different times.'},
   {title:'Time matters',text:'Check who is around before spending a period. Travelling stays free, but duels, activities and outings usually use one of three daily periods.'}
  ],
  planner:[
   {title:'Find your next opportunity',text:'The daily guide points to available interactions and approaching commitments. Opening one is free; you still decide whether to take the action.'},
   {title:'Follow your own priorities',text:'The guide helps you find opportunities, not tell you the only right choice. Character moments may be missed and your 90-day season continues.'}
  ],
  conversation:[
   {title:'Meet the locals',text:'Talking costs no in-game time. Different people appear across town on different days, and getting to know someone can open new experiences.'},
   {title:'Characters remember',text:'Conversations and shared experiences build relationships. You can review what you have learned about someone in Status.'}
  ],
  social:[
   {title:'Spend time together',text:'Shared activities use a period and some Focus. Characters react according to their personalities; you can discover what they enjoy by trying things.'},
   {title:'Change up your plans',text:'Repeating similar outings soon can feel less special. Choosing something different may lead to new reactions, and Status remembers discovered interests.'}
  ],
  appointments:[
   {title:'Make a plan',text:'You can schedule an outing for a later day. Booking is free; Focus, credits and a time period are used when you actually meet.'},
   {title:'Keep your promises',text:'A scheduled meeting happens at a specific place and time. Check Upcoming Plans before advancing the clock so you do not stand someone up.'}
  ],
  activities:[
   {title:'Town activities',text:'Local activities advance one time period and usually cost Focus. They can earn credits, preparation, Insight, Reputation or other rewards.'},
   {title:'Use your resources',text:'Focus restores when a new day starts or through some rest activities. Insight and Reputation can open new opportunities and improve booster rewards.'}
  ],
  priorities:[
   {title:'A daily priority',text:'Choose one optional goal each day: spend time with someone, play a duel or participate in town life. Completing it grants a small bonus.'},
   {title:'Your own rhythm',text:'Daily priorities reset tomorrow. Missing one does not block the story; they are a little extra reward for activities you already enjoy.'}
  ],
  duels:[
   {title:'Ready to duel',text:'Most regular RPG matches have four Prize cards; important matches may use six. The actual Pokémon TCG rules stay unchanged.'},
   {title:'Practice pays off',text:'Duel Preparation grants a credit bonus after your next match, even if you lose. Visit the Deck Studio between duels to improve your collection deck.'}
  ],
  boosters:[
   {title:'Build your collection',text:'Boosters grant cards you can use in your RPG deck. Themed packs give you different ways to expand it, and earlier packs stay useful.'},
   {title:'Choose packs deliberately',text:'Check each pack’s card pool and cost before buying. Insight can reduce prices, and earned vouchers can be redeemed for expansion packs.'}
  ],
  deck:[
   {title:'Make the deck yours',text:'Your RPG deck uses the cards you own. The Deck Studio lets you edit a 60-card deck before challenging other trainers.'},
   {title:'Improve after a match',text:'Try changing only a few cards at a time. Basics, evolutions, Energy and Trainers work together; new booster cards are not added automatically.'}
  ],
  status:[
   {title:'Your season record',text:'Status shows your progress and connections. Character preferences appear here only after you discover them through shared experiences.'},
   {title:'Help is optional',text:'Gameplay tips explain a system on its first two uses per season. You can turn them off for this run right here in Status.'}
  ]
 });
 function hydrate(s){
  if(!s||typeof s!=='object')throw Error('Invalid RPG state');
  if(!s.gameplayTutorials||typeof s.gameplayTutorials!=='object'||Array.isArray(s.gameplayTutorials))
   s.gameplayTutorials={disabled:false,seen:{}};
  const t=s.gameplayTutorials;
  t.disabled=t.disabled===true;
  if(!t.seen||typeof t.seen!=='object'||Array.isArray(t.seen))t.seen={};
  for(const [key,count] of Object.entries(t.seen)){
   if(!lessons[key])delete t.seen[key];
   else t.seen[key]=Number.isInteger(count)?Math.max(0,Math.min(2,count)):0;
  }
  return t;
 }
 function record(s,topic){
  if(!lessons[topic])return null;
  const t=hydrate(s),index=t.seen[topic]||0;
  if(t.disabled||index>=2)return null;
  t.seen[topic]=index+1;
  return {topic,number:index+1,total:2,...lessons[topic][index]};
 }
 function setDisabled(s,disabled){
  const t=hydrate(s);t.disabled=!!disabled;return t.disabled;
 }
 function status(s){
  const t=s?.gameplayTutorials;
  return {disabled:t?.disabled===true,seen:{...(t?.seen||{})}};
 }
 return Object.freeze({lessons,hydrate,record,setDisabled,status});
});
