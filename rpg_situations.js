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
    "minAffection": 3,
    "minTrust": 1,
    "tag": "community",
    "chance": 75,
    "focusCost": 6,
    "title": "Promotional Apron Trouble",
    "intro": "The shop doorbell rings as Hana reaches for a deck box. A promotional apron ribbon pulls a pile of sleeves toward the counter's edge.",
    "options": [
      {
        "label": "Help untangle the ribbon",
        "response": "Oh, thank you. If that box fell, I'd be sorting sleeves until tomorrow. Now, which end of this thing is the knot?",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Make a joke about the new uniform",
        "response": "Don't laugh! They said one size fits all. I think they meant one size fits a chair.",
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
    "minAffection": 3,
    "minTrust": 1,
    "tag": "competitive",
    "chance": 75,
    "focusCost": 6,
    "title": "Rain Check",
    "intro": "Rain drums on the community center awning. A broken gutter splashes across Reina's deck bag; she lifts the bag but stays in the rain.",
    "options": [
      {
        "label": "Offer your jacket",
        "response": "Keep it. You're getting soaked. ...Actually, could you hold my deck while I sort this out?",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Challenge her to a dramatic rematch pose",
        "response": "Very funny. If the rain gets another turn, I'm conceding and going inside. Coming?",
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
    "minAffection": 3,
    "minTrust": 1,
    "tag": "quiet",
    "chance": 75,
    "focusCost": 6,
    "title": "The Wobbling Shelf",
    "intro": "At the library, Shiori reaches for the last tournament archive. The stack in her arms tilts dangerously toward the floor.",
    "options": [
      {
        "label": "Catch the falling books",
        "response": "Thank you. I was hoping to leave without becoming the library's cautionary example.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Offer to carry the rest",
        "response": "The heavy ones are at the bottom. If you take those, I might get to keep my dignity.",
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
    "minAffection": 3,
    "minTrust": 1,
    "tag": "playful",
    "chance": 75,
    "focusCost": 6,
    "title": "Cardstorm at the Arcade",
    "intro": "A deck sleeve skates across the arcade floor, followed by another. Yuna's jacket is hooked on the stool she knocked against chasing them.",
    "options": [
      {
        "label": "Gather sleeves together",
        "response": "I call the blue ones! No, wait, that's cheating. You've already got more than me.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Strike an over-the-top heroic pose",
        "response": "You look ridiculous. Absolutely heroic, but ridiculous. Okay, now help me get off this stool.",
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
    "minAffection": 3,
    "minTrust": 1,
    "tag": "strategy",
    "chance": 75,
    "focusCost": 6,
    "title": "Out of Control Variables",
    "intro": "A gust through the library window lifts Akari's numbered notes off the table. One sheet lands upside down in your lap.",
    "options": [
      {
        "label": "Catch the notes in order",
        "response": "Page six goes before seven, obviously. ...Sorry. Thank you. The wind doesn't respect numbering.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Help without worrying about order",
        "response": "They're all here? That's something. Give me a minute; apparently I can survive an unnumbered stack.",
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
    "minAffection": 3,
    "minTrust": 1,
    "tag": "collection",
    "chance": 75,
    "focusCost": 6,
    "title": "The Wind's Counteroffer",
    "intro": "A breeze catches Camila's trade ledger on the café terrace. Receipts flutter beneath the neighboring tables.",
    "options": [
      {
        "label": "Help collect the receipts",
        "response": "Careful with the blue one. That's a trade I still owe somebody for. And thank you, darling.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Invent a dramatic bargaining ritual",
        "response": "An outrageous price. I'll pay you in coffee and one completely useless uncommon. Final offer.",
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
    "minAffection": 3,
    "minTrust": 1,
    "tag": "adventure",
    "chance": 75,
    "focusCost": 6,
    "title": "The Stubborn Beach Towel",
    "intro": "At the riverside sandbar, Marina chases a towel that keeps catching the breeze. Her deck box is safe beneath a dry bag.",
    "options": [
      {
        "label": "Hold the towel while she folds it",
        "response": "Got it. Hold tight until I fold this corner. There. One victory I wasn't expecting today.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Challenge the wind to a rematch",
        "response": "If you win, please teach me how. I've been losing this battle since lunch.",
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
    "minAffection": 3,
    "minTrust": 1,
    "tag": "competitive",
    "chance": 75,
    "focusCost": 6,
    "title": "The Jacket Trap",
    "intro": "At the arcade, Kaede's deck-bag strap catches on her jacket buckle as she turns toward an empty table. The bag stops; she doesn't.",
    "options": [
      {
        "label": "Help free the bag",
        "response": "Don't say a word. Actually, hold this buckle. ...Thanks. You saw nothing.",
        "affection": 1,
        "trust": 2,
        "respect": 0
      },
      {
        "label": "Pretend to announce a surprise match",
        "response": "Ladies and gentlemen, the undefeated jacket! Next challenger, a stubborn piece of luggage. Now get me loose.",
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
