'use strict';
/* Deterministic, optional SFW situation-based social moments.
   All NPCs are adults. No random rerolls and no mandatory CG assets. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.NeoRpgSituations=api;
})(typeof window!=='undefined'?window:null,function(){
 const events=[
  {
    "id": "hana_apron_mixup",
    "npc": "hana",
    "place": "shop",
    "start": 9,
    "end": 90,
    "slot": 1,
    "minAffection": 5,
    "minTrust": 1,
    "tag": "community",
    "chance": 75,
    "focusCost": 6,
    "title": "Promotional Apron Trouble",
    "intro": "A ribbon from the shop's promotional apron has tangled around Hana's card case.",
    "options": [
      {
        "label": "Help untangle the ribbon",
        "response": "You steady the card case while she laughs at the ridiculous knot.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Make a joke about the new uniform",
        "response": "Hana strikes a heroic shop-assistant pose. Neither of you can keep a straight face.",
        "affection": 2,
        "trust": 1,
        "respect": 0
      }
    ]
  },
  {
    "id": "reina_rain_catch",
    "npc": "reina",
    "place": "center",
    "start": 21,
    "end": 90,
    "slot": 2,
    "minAffection": 5,
    "minTrust": 1,
    "tag": "competitive",
    "chance": 75,
    "focusCost": 6,
    "title": "Rain Check",
    "intro": "A leaking gutter splashes near Reina at the Community Center entrance after practice.",
    "options": [
      {
        "label": "Offer your jacket",
        "response": "Reina rolls her eyes at first, then offers a rare appreciative smile.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Challenge her to a dramatic rematch pose",
        "response": "She turns the mishap into an absurdly intimidating victory stance.",
        "affection": 2,
        "trust": 1,
        "respect": 1
      }
    ]
  },
  {
    "id": "shiori_bookstack_wobble",
    "npc": "shiori",
    "place": "library",
    "start": 18,
    "end": 85,
    "slot": 1,
    "minAffection": 5,
    "minTrust": 1,
    "tag": "quiet",
    "chance": 75,
    "focusCost": 6,
    "title": "The Wobbling Shelf",
    "intro": "Shiori is trying to balance too many books as a stack starts wobbling.",
    "options": [
      {
        "label": "Catch the falling books",
        "response": "Together you rescue the stack before it crashes, laughing at your clumsy teamwork.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Offer to carry the rest",
        "response": "Shiori accepts your help with a grateful, surprised smile.",
        "affection": 2,
        "trust": 1,
        "respect": 0
      }
    ]
  },
  {
    "id": "yuna_card_scatter",
    "npc": "yuna",
    "place": "arcade",
    "start": 13,
    "end": 88,
    "slot": 2,
    "minAffection": 5,
    "minTrust": 1,
    "tag": "playful",
    "chance": 75,
    "focusCost": 6,
    "title": "Cardstorm at the Arcade",
    "intro": "Yuna has scattered card sleeves around a stool and her jacket is caught on its edge.",
    "options": [
      {
        "label": "Gather sleeves together",
        "response": "You make a ridiculous game of catching each card sleeve before it lands.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Strike an over-the-top heroic pose",
        "response": "Yuna starts laughing so hard she forgets the jacket is tangled.",
        "affection": 2,
        "trust": 1,
        "respect": 0
      }
    ]
  },
  {
    "id": "akari_notes_whirl",
    "npc": "akari",
    "place": "library",
    "start": 15,
    "end": 83,
    "slot": 1,
    "minAffection": 5,
    "minTrust": 1,
    "tag": "strategy",
    "chance": 75,
    "focusCost": 6,
    "title": "Out of Control Variables",
    "intro": "A breeze through the library window sends Akari's painstaking notes into the air.",
    "options": [
      {
        "label": "Catch the notes in order",
        "response": "Akari is impressed by your quick thinking; she jokes about impossible probability.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Help without worrying about order",
        "response": "She discovers there is value in laughing at a plan that went wrong.",
        "affection": 2,
        "trust": 1,
        "respect": 0
      }
    ]
  },
  {
    "id": "camila_windy_receipts",
    "npc": "camila",
    "place": "cafe",
    "start": 14,
    "end": 89,
    "slot": 1,
    "minAffection": 5,
    "minTrust": 1,
    "tag": "collection",
    "chance": 75,
    "focusCost": 6,
    "title": "The Wind's Counteroffer",
    "intro": "The café terrace breeze sends Camila's trade receipts fluttering across the table.",
    "options": [
      {
        "label": "Help collect the receipts",
        "response": "Camila thanks you and tells an unexpectedly sincere story about one of the cards.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Invent a dramatic bargaining ritual",
        "response": "Camila puts on a theatrical act that turns the accident into a shared joke.",
        "affection": 2,
        "trust": 1,
        "respect": 0
      }
    ]
  },
  {
    "id": "marina_beach_towel",
    "npc": "marina",
    "place": "park",
    "start": 17,
    "end": 90,
    "slot": 1,
    "minAffection": 5,
    "minTrust": 1,
    "tag": "adventure",
    "chance": 75,
    "focusCost": 6,
    "title": "The Stubborn Beach Towel",
    "intro": "After a swim at the riverside sandbar, Marina keeps losing her towel to the breeze.",
    "options": [
      {
        "label": "Hold the towel while she folds it",
        "response": "Marina laughs softly as you rescue the enormous towel without getting the deck box wet.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Challenge the wind to a rematch",
        "response": "Your ridiculous strategy makes Marina laugh until she can barely speak.",
        "affection": 2,
        "trust": 1,
        "respect": 0
      }
    ]
  },
  {
    "id": "kaede_jacket_prank",
    "npc": "kaede",
    "place": "arcade",
    "start": 49,
    "end": 90,
    "slot": 2,
    "minAffection": 5,
    "minTrust": 1,
    "tag": "competitive",
    "chance": 75,
    "focusCost": 6,
    "title": "The Jacket Trap",
    "intro": "Kaede's deck bag has caught on her jacket during a dramatic spin at the arcade.",
    "options": [
      {
        "label": "Help free the bag",
        "response": "Kaede accepts your help with a mock-grudging smile.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Pretend to announce a surprise match",
        "response": "She joins the absurd performance and bows as the crowd claps.",
        "affection": 2,
        "trust": 1,
        "respect": 1
      }
    ]
  }
];
 const map=new Map(events.map(x=>[x.id,x]));
 const hash=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
 const chance=(e,day,slot)=>hash(e.id+':'+day+':'+slot)%100<e.chance;
 function hydrate(s){
  if(!s||typeof s!=='object')throw Error('Invalid campaign state');
  if(!s.situationDone||typeof s.situationDone!=='object'||Array.isArray(s.situationDone))s.situationDone={};
  for(const [id,completion] of Object.entries(s.situationDone))
   if(!map.has(id)||!completion||!Number.isInteger(completion.day)||completion.day<1||completion.day>90
     ||![0,1].includes(completion.choice))delete s.situationDone[id];
  const a=s.activeSituation;
  if(a&&(!map.has(a.id)||!['choice','response'].includes(a.phase)
    ||s.situationDone[a.id]||a.phase==='response'&&![0,1].includes(a.choice)))s.activeSituation=null;
  return s;
 }
 function eligible(s,e,people=[]){
  if(!e||!Number.isInteger(s.day)||s.day<e.start||s.day>e.end||s.day>90
   ||s.slot!==e.slot||s.location!==e.place||s.situationDone?.[e.id]
   ||s.hungOut?.[s.day+':'+e.npc]||!people.includes(e.npc)||(s.focus||0)<e.focusCost)return false;
  const bond=s.relationships?.[e.npc]||s.bonds?.[e.npc]||{};
  if((bond.affection||0)<e.minAffection||(bond.trust||0)<e.minTrust)return false;
  return chance(e,s.day,s.slot);
 }
 function available(s,people=[]){
  if(!s||s.pendingDuel||s.activeStory||s.activeSideQuest||s.activeArc||s.activeEncounter||s.activeSituation)return [];
  return events.filter(e=>eligible(s,e,people));
 }
 function start(s,id,people=[]){
  hydrate(s);
  const e=available(s,people).find(x=>x.id===id);
  if(!e)throw Error('That special moment is not available here now');
  s.activeSituation={id:e.id,phase:'choice',choice:null};
  return e;
 }
 function choose(s,choice){
  const a=s.activeSituation,e=map.get(a?.id);
  if(!e||a.phase!=='choice'||![0,1].includes(choice))throw Error('Invalid situation choice');
  if((s.focus||0)<e.focusCost)throw Error('Not enough focus for this moment');
  a.phase='response';a.choice=choice;
  return e.options[choice];
 }
 function finish(s,people=[]){
  hydrate(s);
  const a=s.activeSituation,e=map.get(a?.id);
  if(!e||a.phase!=='response'||![0,1].includes(a.choice))throw Error('No situation ready to complete');
  if(!eligible(s,e,people))throw Error('The character or event is no longer available');
  if((s.focus||0)<e.focusCost)throw Error('Not enough focus');
  const option=e.options[a.choice];
  const r=s.relationships?.[e.npc],b=s.bonds?.[e.npc];
  if(!r||!b)throw Error('Relationship data is unavailable');
  // All validation above happens before the first campaign write.
  s.focus=Math.max(0,s.focus-e.focusCost);
  for(const key of ['affection','trust','respect']){
   const n=option[key]||0;
   r[key]=Math.min(999,(r[key]||0)+n);
   if(key!=='respect')b[key]=Math.min(999,(b[key]||0)+n);
  }
  s.hungOut=s.hungOut||{};s.hungOut[s.day+':'+e.npc]=true;
  s.situationDone[e.id]={day:s.day,slot:s.slot,choice:a.choice};
  s.activeSituation=null;
  return {event:e,response:option.response,choice:a.choice};
 }
 function validate(){
  const problems=[],seen=new Set();
  for(const e of events){
   if(seen.has(e.id))problems.push('duplicate '+e.id);seen.add(e.id);
   if(!e.id||!e.npc||!e.place||e.start>e.end||e.start<1||e.end>90
     ||e.slot<0||e.slot>2||e.minAffection<0||e.minTrust<0||e.chance<1||e.chance>100
     ||!e.title||!e.intro||e.options?.length!==2)problems.push('invalid '+e.id);
  }
  return problems;
 }
 return Object.freeze({events,byId:id=>map.get(id)||null,available,start,choose,finish,hydrate,chance,validate});
});
