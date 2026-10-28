'use strict';
// Daisy bonus scenes and approved CG registrations.
(function(root){
const solo=[{"id":"daisy_random_window_reflection","npc":"daisy","title":"Window Reflection","place":"shop","slot":1,"start":12,"end":90,"minBond":0,"prerequisite":null,"encounterType":"slice","trigger":"entry","randomForced":true,"chancePercent":37,"participants":[],"lines":[{"speaker":"Narrator","text":"Daisy pauses by the shop window, studying her reflection as the late light catches the glass."},{"speaker":"daisy","text":"You weren't checking the display, were you?"},{"speaker":"Protagonist","text":"I was checking if the shop was open."},{"speaker":"daisy","text":"Sure. And I was checking the weather inside."},{"speaker":"Protagonist","text":"A reflection makes a remarkably honest mirror."},{"speaker":"daisy","text":"Come on. We have a little time left."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_random_window_reflection_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_random_window_reflection_joke","delta":{"affection":1,"respect":1}}]},{"id":"daisy_random_rain_shelter","npc":"daisy","title":"The Borrowed Umbrella","place":"park","slot":2,"start":12,"end":90,"minBond":0,"prerequisite":null,"encounterType":"slice","trigger":"entry","randomForced":true,"chancePercent":37,"participants":[],"lines":[{"speaker":"Narrator","text":"A sudden shower leaves Daisy and the protagonist sharing a borrowed umbrella at the park path."},{"speaker":"daisy","text":"Rain has no respect for a carefully planned outfit."},{"speaker":"Protagonist","text":"At least this umbrella is big enough for both of us."},{"speaker":"daisy","text":"Then I suppose we owe its owner a thank-you note."},{"speaker":"Protagonist","text":"Or we could enjoy the extra five minutes."},{"speaker":"daisy","text":"Come on. We have a little time left."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_random_rain_shelter_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_random_rain_shelter_joke","delta":{"affection":1,"respect":1}}]},{"id":"daisy_random_arcade_disguise","npc":"daisy","title":"Off-Duty Incognito","place":"arcade","slot":2,"start":12,"end":90,"minBond":0,"prerequisite":null,"encounterType":"slice","trigger":"entry","randomForced":true,"chancePercent":37,"participants":[],"lines":[{"speaker":"Narrator","text":"Daisy arrives at the arcade in an oversized hoodie and loose clothes."},{"speaker":"daisy","text":"One whole afternoon and no one recognized me."},{"speaker":"Protagonist","text":"I knew it was you."},{"speaker":"daisy","text":"You're an exception. I should have guessed."},{"speaker":"Protagonist","text":"Want to try the high-score challenge?"},{"speaker":"daisy","text":"Come on. We have a little time left."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_random_arcade_disguise_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_random_arcade_disguise_joke","delta":{"affection":1,"respect":1}}],"artPending":true},{"id":"daisy_random_deck_luck","npc":"daisy","title":"Lucky Draw, Unlucky Shuffle","place":"shop","slot":1,"start":12,"end":90,"minBond":0,"prerequisite":null,"encounterType":"slice","trigger":"entry","randomForced":true,"chancePercent":37,"participants":[],"lines":[{"speaker":"Narrator","text":"Daisy's deck box tips over on the shop floor, scattering sleeved cards around both of you."},{"speaker":"daisy","text":"That's not how I wanted to reveal my strategy."},{"speaker":"Protagonist","text":"I'm not looking at the cards."},{"speaker":"daisy","text":"You say that like your curiosity doesn't have a face."},{"speaker":"Protagonist","text":"Help me collect them and I might give you a fair game."},{"speaker":"daisy","text":"Come on. We have a little time left."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_random_deck_luck_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_random_deck_luck_joke","delta":{"affection":1,"respect":1}}]}];
const cross=[{"id":"daisy_barb_swimsuit_sketch","npc":"barb","participants":["barb","daisy"],"encounterType":"slice","trigger":"talk","place":"shop","slot":1,"start":20,"end":90,"minAffection":0,"plannedMeetup":true,"title":"A Swimsuit With Her Name On It","lines":[{"speaker":"Narrator","text":"At Barb's workshop, Daisy studies a swimsuit sketch beside neatly arranged fabric swatches."},{"speaker":"barb","text":"This cut is designed to stay comfortable when you move. The sketch shows the lines; the swatches show how the fabric catches the light."},{"speaker":"daisy","text":"And I want it to feel like something I'd actually choose, not a costume."},{"speaker":"barb","text":"Then we're keeping the dark plum palette and a clean, secure silhouette."},{"speaker":"Protagonist","text":"What do you need from me?"},{"speaker":"daisy","text":"An opinion about the sketch. Preferably one with actual words."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_barb_swimsuit_sketch_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_barb_swimsuit_sketch_joke","delta":{"affection":1,"respect":1}}],"image":"/rpg-assets/events/cg/season01/daisy_barb_swimsuit_sketch.webp","artPending":false,"art":{"scene":"At Barb's workshop, Daisy studies a swimsuit sketch beside neatly arranged fabric swatches.","composition":"Approved landscape illustration with the lower fifth clear for dialogue.","outfit":"Daisy: lined layered skirt, tasteful burgundy or black outfit; Barb: canonical designer look; swimsuit consultations use secure lined swimwear and sketch/fabric swatches.","expression":"Natural, character-specific animated conversation and close-up reaction","environment":"shop","mood":"playful, warm slice of life","fanservice":0}},{"id":"daisy_barb_fitting_followup","npc":"barb","participants":["barb","daisy"],"encounterType":"slice","trigger":"talk","place":"shop","slot":1,"start":34,"end":90,"minAffection":0,"plannedMeetup":true,"title":"The Final Fitting","lines":[{"speaker":"Narrator","text":"The finished swimsuit is ready in Barb's fitting area, with the curtain drawn for privacy."},{"speaker":"barb","text":"The straps are secure, and the lining sits exactly where it should."},{"speaker":"daisy","text":"I can move comfortably. That's what I wanted."},{"speaker":"barb","text":"Good. Take a breath, then try the full turn again. I'll check the seams."},{"speaker":"Protagonist","text":"The color looks just like the sketch you showed me."},{"speaker":"daisy","text":"It feels like me. That's the important part."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_barb_fitting_followup_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_barb_fitting_followup_joke","delta":{"affection":1,"respect":1}}],"image":"/rpg-assets/events/cg/season01/daisy_barb_fitting_followup.webp","cgSequence":["daisy_barb_fitting_followup","daisy_barb_fitting_followup_stage2"],"cgSwitchSteps":[0,4],"cgSequence":["daisy_barb_fitting_followup","daisy_barb_fitting_followup_stage2"],"cgSwitchSteps":[0,4],"artPending":false,"art":{"scene":"Daisy and Barb complete the swimsuit fitting in Barb's private fitting area.","composition":"Approved two-stage 16:9 landscape illustrations; smooth transition at line 5; dialogue-safe lower fifth.","outfit":"Daisy wears the approved swimsuit in both stages. Barb wears her canonical designer outfit.","expression":"Confident comfort in stage one, pleased surprise and rapport in stage two.","environment":"Barb's workshop fitting area","mood":"warm, supportive, lightly playful","fanservice":1}},{"id":"daisy_laca_boardwalk","npc":"daisy","participants":["daisy","laca"],"encounterType":"slice","trigger":"talk","place":"park","slot":2,"start":23,"end":90,"minAffection":0,"title":"Boardwalk Bluff","lines":[{"speaker":"Narrator","text":"At a beachside café on the boardwalk, Daisy and Laca sit with a deck of cards between them."},{"speaker":"daisy","text":"She says she can guess my deck from my sleeves."},{"speaker":"laca","text":"I said I could guess your opening move. Different sport."},{"speaker":"daisy","text":"Go on then. Impress me."},{"speaker":"Protagonist","text":"I'm staying out of this."},{"speaker":"laca","text":"Too late. You're the referee."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_laca_boardwalk_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_laca_boardwalk_joke","delta":{"affection":1,"respect":1}}],"image":"/rpg-assets/events/cg/season01/daisy_laca_boardwalk.webp","artPending":false,"art":{"scene":"At a beachside café on the boardwalk, Daisy and Laca sit with a deck of cards between them.","composition":"Approved landscape illustration with the lower fifth clear for dialogue.","outfit":"Daisy: lined layered skirt, tasteful burgundy or black outfit; Barb: canonical designer look; swimsuit consultations use secure lined swimwear and sketch/fabric swatches.","expression":"Natural, character-specific animated conversation and close-up reaction","environment":"Beachside boardwalk café","mood":"playful, warm slice of life","fanservice":0}},{"id":"daisy_rina_cafe","npc":"daisy","participants":["daisy","rina"],"encounterType":"slice","trigger":"talk","place":"cafe","slot":2,"start":28,"end":90,"minAffection":0,"title":"No Stage Lights Required","lines":[{"speaker":"Narrator","text":"Rina and Daisy swap tips about styling an outfit for a quiet café appearance."},{"speaker":"rina","text":"I wanted one evening without looking like I'm on stage."},{"speaker":"daisy","text":"Then wear what makes you comfortable. You don't owe the room a performance."},{"speaker":"rina","text":"Easy for you to say. You're dressed beautifully."},{"speaker":"Protagonist","text":"You both look comfortable here."},{"speaker":"daisy","text":"That's better than any review."}],"choices":[{"label":"Offer practical help","reply":"Daisy gives you a grateful, surprised smile.","kind":"support","flag":"daisy_rina_cafe_help","delta":{"affection":1,"trust":1}},{"label":"Make a playful observation","reply":"Daisy laughs and challenges you to keep up.","kind":"playful","flag":"daisy_rina_cafe_joke","delta":{"affection":1,"respect":1}}],"image":"/rpg-assets/events/cg/season01/daisy_rina_cafe.webp","artPending":true,"art":{"scene":"Rina and Daisy swap tips about styling an outfit for a quiet café appearance.","composition":"Cinematic 16:9 modern JRPG visual novel CG, consistent faces, no text, bottom fifth left clear for dialogue. Production prompt only; artwork pending.","outfit":"Daisy: lined layered skirt, tasteful burgundy or black outfit; Barb: canonical designer look; swimsuit consultations use secure lined swimwear and sketch/fabric swatches.","expression":"Natural, character-specific animated conversation and close-up reaction","environment":"cafe","mood":"playful, warm slice of life","fanservice":0}}];
// Approved multi-CG wardrobe fitting sequence; artwork distributed separately.
cross.push({
  "id": "daisy_barb_camila_wrong_size",
  "npc": "daisy",
  "participants": [
    "daisy",
    "camila",
    "barb"
  ],
  "encounterType": "slice",
  "trigger": "talk",
  "place": "shop",
  "slot": 1,
  "start": 35,
  "end": 90,
  "minAffection": 0,
  "prerequisite": null,
  "title": "The Perfectly Wrong Size",
  "image": "/rpg-assets/events/cg/season01/daisy_barb_camila_wrong_size.webp",
  "cgSequence": [
    "daisy_barb_camila_wrong_size",
    "daisy_barb_camila_wrong_size_02",
    "daisy_barb_camila_wrong_size_03"
  ],
  "cgSwitchSteps": [
    0,
    4,
    9
  ],
  "lines": [
    {
      "speaker": "Narrator",
      "text": "After the café mishap, Camila and Daisy come to Barb's workshop to collect their replacement designs."
    },
    {
      "speaker": "barb",
      "text": "I finished both pieces! I might have mixed up the labels, but that's nothing."
    },
    {
      "speaker": "daisy",
      "text": "Why is my jacket big enough to fit the entire card shop?"
    },
    {
      "speaker": "camila",
      "text": "And why is mine the size of a trading card sleeve?"
    },
    {
      "speaker": "Narrator",
      "text": "Camila tries the decorative jacket over her normal black top. It doesn't reach anywhere near where a jacket should."
    },
    {
      "speaker": "camila",
      "text": "It's called a cropped silhouette. A very, very cropped silhouette."
    },
    {
      "speaker": "daisy",
      "text": "Barb, that's a jacket for a Pikachu!"
    },
    {
      "speaker": "barb",
      "text": "Okay, okay. Maybe I copied the measurements onto the wrong pattern."
    },
    {
      "speaker": "daisy",
      "text": "At least my skirt has to be the right size. Hand it over."
    },
    {
      "speaker": "Narrator",
      "text": "Daisy tries on the skirt over its secure lining. The belt sits unusually low, and the finished skirt is comically undersized."
    },
    {
      "speaker": "daisy",
      "text": "BARB! You made mine tiny too!"
    },
    {
      "speaker": "camila",
      "text": "I can't believe we both lost a fight to the measuring tape!"
    },
    {
      "speaker": "barb",
      "text": "This is officially the worst fitting day in the history of my workshop."
    },
    {
      "speaker": "daisy",
      "text": "Next time, let's measure the clothes before we put them on!"
    },
    {
      "speaker": "Narrator",
      "text": "All three burst into helpless laughter. Barb writes 'REMEASURE EVERYTHING' across her sketchbook."
    }
  ],
  "choices": [
    {
      "label": "Help Barb correct the measurements",
      "reply": "Barb borrows your notes while Daisy and Camila keep laughing.",
      "kind": "support",
      "flag": "daisy_wrong_size_help",
      "delta": {
        "affection": 1,
        "trust": 1
      }
    },
    {
      "label": "Suggest they keep the tiny outfits as a warning",
      "reply": "Daisy laughs: 'The Museum of Barb's Greatest Mistakes!'",
      "kind": "playful",
      "flag": "daisy_wrong_size_joke",
      "delta": {
        "affection": 1,
        "respect": 1
      }
    }
  ],
  "artPending": false,
  "art": {
    "scene": "Three-scene fitting-room comedy: wardrobe discovery, Camila's absurdly small decorative jacket, then Daisy's undersized low-slung skirt worn over secure opaque lining; everyone laughing.",
    "composition": "Three approved cinematic 16:9 CGs, separate moments with dialogue in between, lower fifth dialogue-safe.",
    "outfit": "Daisy signature burgundy long-sleeved translucent mesh over opaque underlayer and lined skirt; Camila black top, red skirt and tiny decorative jacket; Barb canonical red-haired designer workshop outfit.",
    "expression": "Surprise building to shared uncontrollable laughter",
    "environment": "shop",
    "mood": "lighthearted",
    "fanservice": 0
  }
});
const pack=root.NeoRpgCharacterPacks?.byId?.('daisy');
if(pack){for(const e of solo){const existing=pack.events.find(x=>x.id===e.id);if(existing)Object.assign(existing,e);else pack.events.push(e);
 if(!pack.art.eventImages.some(x=>x.sceneId===e.id))pack.art.eventImages.push({sceneId:e.id,path:'/rpg-assets/events/cg/slice-life/'+e.id+'.png',prompt:e.lines[0].text+' Cinematic 16:9 scene with Daisy, canonical facial features, costumes and tattoos. Leave lower fifth clear. Artwork pending.'});}}
const registry=root.NeoRpgCrossCharacterEvents;
if(registry?.events)for(const e of cross){const existing=registry.events.find(x=>x.id===e.id);if(existing)Object.assign(existing,e);else registry.events.push(e);}
if(registry?.pendingArt)for(const e of cross){const item=registry.pendingArt.find(x=>x.id===e.id);if(item&&e.artPending===false){item.status='APPROVED';item.path=e.image;item.brief=e.art.scene;}else if(!item)registry.pendingArt.push({id:e.id,path:e.image,participants:e.participants,title:e.title,brief:e.art.scene,composition:e.art.composition,status:e.artPending===false?'APPROVED':'PENDING_CG'});}

// Daisy's three solo illustrated scenes are registered with explicit asset paths.
const daisyPack=root.NeoRpgCharacterPacks?.byId?.('daisy');
if(daisyPack){
 const extras=[
  {id:'daisy_random_window_reflection',title:'Window Reflection',place:'shop',slot:1,image:'/rpg-assets/events/cg/slice-life/daisy_random_window_reflection.png',scene:'Daisy studies her reflection in the shop window.'},
  {id:'daisy_random_rain_shelter',title:'The Borrowed Umbrella',place:'park',slot:2,image:'/rpg-assets/events/cg/slice-life/daisy_random_rain_shelter.png',scene:'Daisy and the protagonist share a borrowed umbrella in a park shower.'},
  {id:'daisy_random_deck_luck',title:'Lucky Draw, Unlucky Shuffle',place:'shop',slot:1,image:'/rpg-assets/events/cg/slice-life/daisy_random_deck_luck.png',scene:'Daisy’s sleeved cards scatter across the card shop floor.'}
 ];
 for(const e of extras){
  const lines=e.id==='daisy_random_window_reflection'?
   [{speaker:'Narrator',text:'Daisy pauses by the shop window, studying her reflection as the late light catches the glass.'},{speaker:'daisy',text:'You weren’t checking the display, were you?'},{speaker:'Protagonist',text:'I was checking if the shop was open.'},{speaker:'daisy',text:'Sure. And I was checking the weather inside.'},{speaker:'Protagonist',text:'A reflection makes a remarkably honest mirror.'},{speaker:'daisy',text:'Come on. We have a little time left.'}]:e.id==='daisy_random_rain_shelter'?
   [{speaker:'Narrator',text:'A sudden shower leaves Daisy and the protagonist sharing a borrowed umbrella at the park path.'},{speaker:'daisy',text:'Rain has no respect for a carefully planned outfit.'},{speaker:'Protagonist',text:'At least this umbrella is big enough for both of us.'},{speaker:'daisy',text:'Then I suppose we owe its owner a thank-you note.'},{speaker:'Protagonist',text:'Or we could enjoy the extra five minutes.'},{speaker:'daisy',text:'Come on. We have a little time left.'}]:
   [{speaker:'Narrator',text:'Daisy’s deck box tips over on the shop floor, scattering sleeved cards around both of you.'},{speaker:'daisy',text:'That’s not how I wanted to reveal my strategy.'},{speaker:'Protagonist',text:'I’m not looking at the cards.'},{speaker:'daisy',text:'You say that like your curiosity doesn’t have a face.'},{speaker:'Protagonist',text:'Help me collect them and I might give you a fair game.'},{speaker:'daisy',text:'Come on. We have a little time left.'}];
  const choices=[{label:'Offer practical help',reply:'Daisy gives you a grateful, surprised smile.',kind:'support',flag:e.id+'_help',delta:{affection:1,trust:1}},{label:'Make a playful observation',reply:'Daisy laughs and challenges you to keep up.',kind:'playful',flag:e.id+'_joke',delta:{affection:1,respect:1}}];
  const event={id:e.id,npc:'daisy',title:e.title,place:e.place,slot:e.slot,start:12,end:90,minBond:0,prerequisite:null,encounterType:'slice',trigger:'entry',randomForced:true,chancePercent:37,participants:[],lines,choices,image:e.image,art:{scene:e.scene,composition:'Approved landscape CG with lower fifth clear for dialogue.',outfit:'Use Daisy’s canonical outfit shown in the approved illustration.',expression:'Character-specific natural expression.',environment:e.place,mood:'everyday',fanservice:0}};
  const existing=daisyPack.events.find(x=>x.id===e.id);if(existing)Object.assign(existing,event);else daisyPack.events.push(event);
  const registered=daisyPack.art.eventImages.find(x=>x.sceneId===e.id);
  if(registered)registered.path=e.image;else daisyPack.art.eventImages.push({sceneId:e.id,path:e.image,prompt:'Approved CG: '+e.scene+' Preserve Daisy’s canonical appearance and keep the lower fifth clear for dialogue.'});
 }
}
if(typeof module==='object'&&module.exports)module.exports={solo,cross};
})(typeof window!=='undefined'?window:globalThis);
