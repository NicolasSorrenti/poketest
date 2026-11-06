'use strict';
// Authoritative Live event definitions and artwork. Keep IDs stable for saved campaigns.
(()=>{
const LIVE_NEW=window.NeoRpgLiveEverydayEvents||{events:[],art:{},followups:{},artAt:()=>null,finalArt:()=>null,fallback:()=>null,byId:()=>null};
const LIVE_EVENTS=[
 {id:'live_home_welcome',title:'Someone Is Already Home',kind:'season',priority:95,earliestDay:2,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:2},lines:[
  {speaker:'Narrator',text:'You wake up to the smell of fresh coffee. Someone is moving around the kitchen.'},
  {speaker:'Live',text:"Morning! Your mom asked me to look after the apartment. I'm Live. I hope you don't mind me making myself at home."},
  {speaker:'Protagonist',text:'You already seem pretty comfortable here.'},
  {speaker:'Live',text:"Of course! I want you to feel completely taken care of. Oh—did that sound strange? I just mean breakfast!"}
 ],choices:[{label:'Thank her for breakfast',reply:"You're welcome! There's plenty more where that came from.",flag:'live_welcome_kind'},{label:'Ask how she knows Mom',reply:"We've been friends for ages! She said you'd need someone to keep the place in order.",flag:'live_welcome_curious'}]},
 {id:'live_home_cooking',title:'A Little Something in the Kitchen',kind:'season',priority:94,earliestDay:5,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_home_welcome'},lines:[
  {speaker:'Narrator',text:'You return home to find Live cooking with her sleeves rolled up.'},
  {speaker:'Live',text:"Perfect timing! I made enough for two. I like it when you come home hungry."},
  {speaker:'Protagonist',text:'That sounded a little—'},
  {speaker:'Live',text:"What? Oh! I meant dinner. Taste the sauce before it gets cold!"}
 ],choices:[{label:'Help set the table',reply:"That's sweet of you. I knew we'd make a good team!",flag:'live_cooking_help'},{label:'Try the sauce',reply:"See? A little patience makes everything better.",flag:'live_cooking_taste'}]},
 {id:'live_home_reading',title:'The Quiet Afternoon',kind:'season',priority:93,earliestDay:9,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_home_cooking'},lines:[
  {speaker:'Narrator',text:'Live is curled up with a book on the sofa when you enter.'},
  {speaker:'Live',text:"There you are! Come sit close; I saved you the warm spot."},
  {speaker:'Protagonist',text:'You say things like that so naturally.'},
  {speaker:'Live',text:"Well, the sunlight reaches this cushion first. What did you think I meant?"}
 ],choices:[{label:'Sit and read together',reply:"Lovely. You can have the next chapter when I'm done.",flag:'live_read_together'},{label:'Ask about her book',reply:"It's a mystery! I always think I've solved it, and then I'm wrong.",flag:'live_read_book'}]},
 {id:'live_home_relaxing',title:'A Moment to Unwind',kind:'season',priority:92,earliestDay:14,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_home_reading'},lines:[
  {speaker:'Narrator',text:'Live has finished tidying the living room and is relaxing with a cup of tea.'},
  {speaker:'Live',text:"Long day? You can let everything go when you're here. I'll take care of the rest."},
  {speaker:'Protagonist',text:'You really do a lot around here.'},
  {speaker:'Live',text:"It's no trouble. Your mom trusted me with this place, and I want you to feel safe in it."}
 ],choices:[{label:'Offer to make her tea next time',reply:"Oh, I'd love that. You remembered how I take it?",flag:'live_tea_offer'},{label:'Thank her for looking after home',reply:"You don't have to thank me. Still, it's nice to hear.",flag:'live_home_thanks'}]},
 {id:'live_brushing_teeth',title:'A Busy Bathroom Morning',kind:'season',priority:90,earliestDay:17,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_home_relaxing'},lines:[{speaker:'Narrator',text:"You hear the tap running and find Live brushing her teeth."},{speaker:'Live',text:"Oh! Good morning. I was just making room for you at the sink."},{speaker:'Protagonist',text:"You always get up this early?"}],choices:[{label:'Spend a moment with Live',reply:"Only when there's something worth getting up for. Like a clean kitchen!"}]},
 {id:'live_getting_ready',title:'Running a Little Late',kind:'season',priority:90,earliestDay:20,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_brushing_teeth'},lines:[{speaker:'Narrator',text:"Live is searching for her keys by the apartment door."},{speaker:'Live',text:"I thought I was ready, but apparently my keys have other plans."},{speaker:'Protagonist',text:"Need a hand?"}],choices:[{label:'Spend a moment with Live',reply:"Yes, please! You're very good at finding things I lose."}]},
 {id:'live_cleaning_table',title:'A Spotless Table',kind:'season',priority:90,earliestDay:23,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_getting_ready'},lines:[{speaker:'Narrator',text:"Live is carefully wiping down the dining table."},{speaker:'Live',text:"There you are! I wanted everything nice and clean before you came back."},{speaker:'Protagonist',text:"You didn't have to do all this."}],choices:[{label:'Spend a moment with Live',reply:"I know. But I like making this place feel welcoming."}]},
 {id:'live_vacuuming',title:'The Vacuum Ambush',kind:'season',priority:90,earliestDay:26,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_cleaning_table'},lines:[{speaker:'Narrator',text:"A vacuum cleaner hums in the hallway as you enter."},{speaker:'Live',text:"Oh! You surprised me. I didn't hear you over this thing."},{speaker:'Protagonist',text:"I can take over if you want."}],choices:[{label:'Spend a moment with Live',reply:"Deal! Just watch that loose cable by the couch."}]},
 {id:'live_laundry',title:'Laundry Day',kind:'season',priority:90,earliestDay:29,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_vacuuming'},lines:[{speaker:'Narrator',text:"A neat pile of freshly folded laundry sits beside Live."},{speaker:'Live',text:"I was just sorting the washing. I hope you don't mind that I folded yours too."},{speaker:'Protagonist',text:"You really don't have to."}],choices:[{label:'Spend a moment with Live',reply:"It's no trouble. Just tell me if you'd rather do it yourself."}]},
 {id:'live_workout_break',title:'Taking Five',kind:'season',priority:90,earliestDay:33,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_laundry'},lines:[{speaker:'Narrator',text:"Live is taking a break after stretching in the living room."},{speaker:'Live',text:"Phew! I thought I'd have more energy than this."},{speaker:'Protagonist',text:"You look like you earned a break."}],choices:[{label:'Spend a moment with Live',reply:"I certainly did. Would you bring me a glass of water?"}]},
 {id:'live_workout_exhausted',title:'One Last Stretch',kind:'season',priority:90,earliestDay:37,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_workout_break'},lines:[{speaker:'Narrator',text:"You find Live resting on her exercise mat."},{speaker:'Live',text:"I might have overdone it. Remind me not to compete with my own workout plan."},{speaker:'Protagonist',text:"Want me to move the mat?"}],choices:[{label:'Spend a moment with Live',reply:"In a minute. First, I need to remember how standing works."}]},
 {id:'live_extra_exhaused_workout',title:'Past Her Limit',kind:'season',priority:90,earliestDay:39,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_workout_exhausted'},lines:[
  {speaker:'Narrator',text:'You hear a tired sigh from the living room. Live is sitting beside her exercise mat, sweat on her forehead and her breathing still a little heavy.'},
  {speaker:'Protagonist',text:'Live? Are you okay? You look exhausted.'},
  {speaker:'Live',text:"I'm okay! I just thought one more round would be easy. Apparently my legs strongly disagree."},
  {speaker:'Protagonist',text:"You don't have to push yourself that hard."},
  {speaker:'Live',text:"You're right. I got a little carried away. Could you sit with me for a moment while I catch my breath?"}
 ],choices:[
  {label:'Bring her some water',reply:"Thank you. You're always so thoughtful. Next time I'll remember to take breaks before I need rescuing.",flag:'live_extra_workout_water'},
  {label:'Sit beside her until she recovers',reply:"This is nice. I mean, the company—not the part where I can barely move my legs!",flag:'live_extra_workout_company'}
 ]},
 {id:'live_waking_up_casual',title:'The Early Riser',kind:'season',priority:90,earliestDay:41,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_extra_exhaused_workout'},lines:[{speaker:'Narrator',text:"The apartment is quiet until Live appears in the kitchen, still sleepy."},{speaker:'Live',text:"Morning. I was hoping to get breakfast ready before you woke up."},{speaker:'Protagonist',text:"You can sleep in sometimes, you know."}],choices:[{label:'Spend a moment with Live',reply:"I know. I just like having someone to make breakfast for."}]},
 {id:'live_waking_up_lavender',title:'A Slow Start',kind:'season',priority:90,earliestDay:46,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{eventSeen:'live_waking_up_casual'},lines:[{speaker:'Narrator',text:"Live emerges from her room with a sleepy smile."},{speaker:'Live',text:"I think the alarm clock and I have agreed to disagree today."},{speaker:'Protagonist',text:"Coffee?"}],choices:[{label:'Spend a moment with Live',reply:"Please. You're a lifesaver. And I promise I'll make the next pot."}]}
];
// Everyday apartment moments are replayable; they never join the one-time Live storyline.
const REPEATABLE_LIVE_EVENTS=[
 {id:'live_clothe_washing',title:"An Extra Load",kind:'season',priority:90,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[{"speaker":"Narrator","text":"The washing machine is running when you find Live sorting clothes in the apartment."},{"speaker":"Live","text":"Oh, you're home! I thought I could finish the washing before you noticed the laundry basket was full."},{"speaker":"Protagonist","text":"You do know you can leave some of that for me."},{"speaker":"Live","text":"I know. It's just satisfying to get it all done before lunch."}],choices:[{"label":"Offer to help fold","reply":"Then we're a team. You can take the towels!","flag":"live_clothes_help"},{"label":"Tell her to take a break","reply":"All right, but only if you promise not to do it all yourself.","flag":"live_clothes_break"}]},
 {id:'live_cleaning',title:"A Little Tidying",kind:'season',priority:90,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[{"speaker":"Narrator","text":"You find Live busy cleaning the apartment, carefully working around the furniture."},{"speaker":"Live","text":"There you are! I was trying to make the place feel a little brighter."},{"speaker":"Protagonist","text":"It already looked fine to me."},{"speaker":"Live","text":"That's sweet. But it feels even nicer when everything has its place."}],choices:[{"label":"Help her finish","reply":"That'll make this go twice as fast. Thank you!","flag":"live_cleaning_help"},{"label":"Tell her she has done enough","reply":"Maybe you're right. I could use a cup of tea.","flag":"live_cleaning_rest"}]},
 {id:'live_cooking',title:"Something on the Stove",kind:'season',priority:90,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[{"speaker":"Narrator","text":"A familiar smell drifts out of the apartment kitchen as Live watches something simmer."},{"speaker":"Live","text":"Oh! You're just in time to try this. I changed the recipe a little."},{"speaker":"Protagonist","text":"It smells great. What's different?"},{"speaker":"Live","text":"That's the secret. Well, mostly I added more herbs."}],choices:[{"label":"Taste her cooking","reply":"You like it? Good! I'll write down what I changed.","flag":"live_cooking_taste_new"},{"label":"Offer to set the table","reply":"Perfect. I'll bring everything over in a minute.","flag":"live_cooking_table_new"}]},
 {id:'live_library',title:"A Borrowed Afternoon",kind:'season',priority:90,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[{"speaker":"Narrator","text":"You find Live at home with a book and several notes spread across the table."},{"speaker":"Live","text":"I borrowed this from the library. It was supposed to be a quick read, but I lost track of time."},{"speaker":"Protagonist","text":"What has you so interested?"},{"speaker":"Live","text":"A little mystery. I'm trying to solve it before the last chapter."}],choices:[{"label":"Ask her to read you a passage","reply":"Okay, but you have to promise not to guess the ending out loud.","flag":"live_library_read"},{"label":"Try to solve the mystery with her","reply":"Now that's an idea. Let's compare notes.","flag":"live_library_guess"}]},
 {id:'live_sweater_bra',title:'Getting Ready',kind:'season',priority:90,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[
  {speaker:'Narrator',text:"You stop by the apartment to find Live getting dressed for the day, pulling on her sweater over her everyday underclothes. She doesn't seem bothered by your presence."},
  {speaker:'Protagonist',text:"Oh—sorry. I didn't know you were changing."},
  {speaker:'Live',text:"It's okay! I trust you. I was just finishing getting ready."},
  {speaker:'Narrator',text:"Live smiles casually, apparently unaware that the moment has left you a little flustered."},
  {speaker:'Live',text:"Could you hand me the cardigan on the chair? I keep forgetting where I put things."}
 ],choices:[
  {label:'Hand her the cardigan',reply:"Thank you! You're always so helpful. Now, where did I put my keys?"},
  {label:'Give her some privacy',reply:"Oh, sure! That's thoughtful of you. I'll be out in a moment."}
 ]}
];
const REPEATABLE_LIVE_IDS=new Set([...REPEATABLE_LIVE_EVENTS,...LIVE_NEW.events].map(event=>event.id));
// All ordinary apartment moments can repeat; the first introduction is unique.
const LIVE_ROTATING_EVENTS=[...LIVE_EVENTS.filter(event=>event.id!=='live_home_welcome'),...REPEATABLE_LIVE_EVENTS,...LIVE_NEW.events];
const LIVE_ROTATING_IDS=new Set(LIVE_ROTATING_EVENTS.map(event=>event.id));
const LIVE_EVENT_ART={"live_clothe_washing":"/rpg-assets/characters/live/events/live_clothe_washing.jpg","live_cleaning":"/rpg-assets/characters/live/events/live_cleaning.jpg","live_cooking":"/rpg-assets/characters/live/events/live_cooking.jpg","live_library":"/rpg-assets/characters/live/events/live_library.jpg","live_sweater_bra":"/rpg-assets/characters/live/events/live_sweater_bra.jpg","live_home_welcome":"/rpg-assets/characters/live/events/live_couch_sweater.png","live_home_cooking":"/rpg-assets/characters/live/events/live_cooking_evening.png","live_home_reading":"/rpg-assets/characters/live/events/live_reading.png","live_home_relaxing":"/rpg-assets/characters/live/events/live_relaxing_sofa.png","live_brushing_teeth":"/rpg-assets/characters/live/events/live_brushing_teeth.png","live_getting_ready":"/rpg-assets/characters/live/events/live_getting_ready.png","live_cleaning_table":"/rpg-assets/characters/live/events/live_cleaning_table.png","live_vacuuming":"/rpg-assets/characters/live/events/live_vacuuming.png","live_laundry":"/rpg-assets/characters/live/events/live_laundry.png","live_workout_break":"/rpg-assets/characters/live/events/live_workout_break.png","live_workout_exhausted":"/rpg-assets/characters/live/events/live_workout_exhausted.png","live_extra_exhaused_workout":"/rpg-assets/characters/live/events/live_extra_exhaused_workout.jpg","live_waking_up_casual":"/rpg-assets/characters/live/events/live_waking_up_casual.png","live_waking_up_lavender":"/rpg-assets/characters/live/events/live_waking_up_lavender.png"};

Object.assign(LIVE_EVENT_ART,LIVE_NEW.art);

// Glance milestones are independent of the rotating apartment encounters.
// The later two images can be added without changing event code; the CG
// presenter will fall back to the already-shipped couch image if unavailable.
const LIVE_SPECIAL_EVENTS=[
 {id:'live_glance_talk_one',title:'A Word on the Couch',kind:'season',priority:99,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[
  {speaker:'Narrator',text:"After you finish looking, Live motions for you to join her on the couch."},
  {speaker:'Live',text:"Can we talk for a moment? You've been looking my way quite a lot lately."},
  {speaker:'Live',text:"Be a good kid, okay? I went to school with your mom, you know. I've known your family for years."},
  {speaker:'Protagonist',text:"I know. I don't mean to make things awkward."}
 ],choices:[
  {label:"I'm not a kid anymore",reply:"I know you've grown up. I just want us to be careful with each other's feelings."},
  {label:"I understand. I respect you",reply:"Thank you. That's what I wanted to hear."}
 ]},
 {id:'live_glance_talk_two',title:'Please Be Serious',kind:'season',priority:99,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[
  {speaker:'Narrator',text:"Live asks you to sit down beside her again. This time, her expression is serious."},
  {speaker:'Live',text:"We should talk again. You know I've been alone for a while."},
  {speaker:'Live',text:"So please don't play around with me, okay? If there's something you want to say, mean it."},
  {speaker:'Protagonist',text:"I hear you."}
 ],choices:[
  {label:"I wouldn't play with your feelings",reply:"All right. Thank you for taking me seriously."},
  {label:"I'll give you some space if you want",reply:"I appreciate that. Being honest with me matters more than anything."}
 ]},
 {id:'live_glance_next_morning',title:'A Quiet Morning Together',kind:'season',priority:100,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[
  {speaker:'Narrator',text:"You wake to find Live waiting in the living room."},
  {speaker:'Live',text:"Oh, I know you've been wanting to talk about this for a while..."},
  {speaker:'Narrator',text:"The two of you spend the morning together in private. The details fade as the day moves on."},
  {speaker:'Live',text:"Ah..."}
 ],choices:[{label:"Continue to the afternoon",reply:"The afternoon begins, and the usual rhythm of the apartment returns."}]}
];
const LIVE_SPECIAL_IDS=new Set(LIVE_SPECIAL_EVENTS.map(event=>event.id));
const LIVE_SPECIAL_ART={
 live_glance_talk_one:'/rpg-assets/characters/live/events/live_couch_sweater.png',
 live_glance_talk_two:'/rpg-assets/characters/live/events/live_couch_sweater _2.png',
 live_glance_next_morning:'/rpg-assets/characters/live/events/live_confy_scene.jpg'
};
const LIVE_FINAL_ART_2='/rpg-assets/characters/live/events/live_confy_scene2.png';
const LIVE_REPEAT_FINAL_ART_2='/rpg-assets/characters/live/events/2live_confy_scene2.jpg';
const LIVE_AFTER_ART='/rpg-assets/characters/live/events/live_after.png';

const LIVE_LYLA_PHOTO_EVENT={id:'live_lyla_photo_sighting',title:'A Familiar Face',kind:'season',priority:98,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[
 {speaker:'Narrator',text:'Live calls you over and holds out a photograph she spotted around town.'},
 {speaker:'Live',text:"Hey, you play cards at that shop, right? Do you know this girl? I thought I'd seen her around."},
 {speaker:'Protagonist',text:'Wait. Is that Lyla? She plays Umbreon at the TCG store.'},
 {speaker:'Live',text:"That's the one! I didn't realize she modeled, too. Small world, isn't it?"}
],choices:[
 {label:"Yeah, that's Lyla from the card shop",reply:"I thought so! She looks different in a magazine, but I'd recognize that face."},
 {label:"I didn't know her pictures were everywhere",reply:"Neither did I! Imagine seeing your card-shop friends on the side of a bus."}
]};

const LIVE_DAY_FOLLOWUP={id:'live_day_followup',title:'Later at Home',kind:'season',priority:94,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},
 lines:[{speaker:'Live',text:'You came back.'}],
 choices:[{label:'See how her day went',reply:"It's been a full day."}]};
const LIVE_AFTER_EVENT={id:'live_after_intimate',title:'After a Quiet Morning',kind:'season',priority:101,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[
 {speaker:'Narrator',text:'A little later, Live is still catching her breath, her expression soft and astonished.'},
 {speaker:'Live',text:'Honey... that was so... wow.'},
 {speaker:'Protagonist',text:'Are you okay?'},
 {speaker:'Live',text:'More than okay. I just need a moment to find my words.'},
 {speaker:'Narrator',text:'Live smiles at you, then takes a quiet moment to herself. Before long, you are both ready to return to the day.'}
],choices:[{label:'Give her a moment',reply:'Thank you, honey. I will see you in a little while.'}]};
LIVE_EVENT_ART[LIVE_AFTER_EVENT.id]=LIVE_AFTER_ART;
const LIVE_REPEAT_MORNING={id:'live_repeat_private_morning',title:'A Morning Together',kind:'season',priority:99,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},
 lines:[
  {speaker:'Live',text:"Honey... let's keep this just between us, okay?"},
  {speaker:'Narrator',text:"You spend a quiet morning together, away from the rest of the world."},
  {speaker:'Narrator',text:"The scene fades to black. By the time you return to the living room, the morning has passed."}
 ],choices:[{label:'Continue the day',reply:"Live smiles and says she'll see you later."}]};
const LIVE_FOLLOWUPS={
 live_home_welcome:["I've made myself at home now. Your mom would be pleased you were so welcoming.","The coffee pot's washed and I'm settling in. Thank you for being so kind."],
 live_home_cooking:["I kept some of the sauce for you. It turned out even better after resting.","Dinner was lovely! I put the leftovers in the fridge."],
 live_home_reading:["I finished another chapter. I'm starting to suspect everyone.","I finally found the answer. No spoilers until you've read it."],
 live_home_relaxing:["That little break did wonders. I feel much better now.","I'm calling it an early night. Don't stay up too late."],
 live_brushing_teeth:["The bathroom's all yours now; I finished getting ready.","Everything's tidied up. I left you a fresh towel."],
 live_getting_ready:["I finally found my keys and got everything sorted.","I'm all set for tomorrow now."],
 live_cleaning_table:["The table looks so much better. I even polished it.","Everything's clean now. Let's keep it that way for a few hours."],
 live_vacuuming:["I finished the vacuuming. Much quieter in here now, isn't it?","I put the vacuum away. It's time for a rest."],
 live_laundry:["The clothes are dry now. I folded yours too.","Everything's put away. One less chore for tomorrow."],
 live_workout_break:["My legs are complaining, but it was a good workout.","I stretched and had some water. I think I'll rest now."],
 live_workout_exhausted:["I'm feeling a little more human after that workout.","I'm still worn out. No more exercise for me today."],
 live_extra_exhaused_workout:["I'm still recovering from that workout. I may have overdone it.","I've earned an early night after all that exercise."],
 live_waking_up_casual:["I finally woke up properly. Coffee really does help.","This morning feels ages ago. What a day."],
 live_waking_up_lavender:["I changed and made some breakfast after you left.","I was so sleepy this morning. Tomorrow I'm setting two alarms."],
 live_clothe_washing:["The wash is finished! Everything smells fresh.","The laundry's folded and put away. That's one job done."],
 live_cleaning:["I finished tidying. It feels nice to sit down now.","The apartment's spotless. I think I'll rest."],
 live_cooking:["The recipe turned out really well! I saved you a portion.","That meal was delicious, if I say so myself. There are leftovers."],
 live_library:["I finally worked out the twist in that mystery.","I finished the book. Tomorrow I'll have to find another."],
 live_sweater_bra:["I found my cardigan and headed out after getting ready.","I laid out tomorrow's clothes. Hopefully no more lost keys."]
};
Object.assign(LIVE_FOLLOWUPS,LIVE_NEW.followups);
const LIVE_AWAY_IDS=new Set(['live_vacuuming','live_getting_ready','live_sweater_bra','live_clothe_washing','live_library']);

const LIVE_HOME_CHECKIN={id:'live_home_activity_checkin',title:'Still Home?',kind:'season',priority:96,earliestDay:1,delivery:'world',timeCost:0,expiry:'never',fallback:'queue',trigger:{dayGte:1},lines:[
 {speaker:'Narrator',text:'After spending time at home, you notice Live looking over from the living room.'},
 {speaker:'Live',text:"Oh, you're still here! I thought you might be heading out."},
 {speaker:'Live',text:"Are you okay? Why didn't you go out?"}
],choices:[{label:'Leave now',reply:"I'll be here if you need anything."}]};
const LIVE_HOME_CHECKIN_ART=['live_cleaning_table','live_vacuuming','live_laundry','live_getting_ready','live_workout_break'].map(name=>'/rpg-assets/characters/live/events/'+name+'.png');

window.NeoRpgLiveCampaignContent=Object.freeze({LIVE_EVENTS,REPEATABLE_LIVE_EVENTS,REPEATABLE_LIVE_IDS,LIVE_ROTATING_EVENTS,LIVE_ROTATING_IDS,LIVE_EVENT_ART,LIVE_SPECIAL_EVENTS,LIVE_SPECIAL_IDS,LIVE_SPECIAL_ART,LIVE_FINAL_ART_2,LIVE_REPEAT_FINAL_ART_2,LIVE_AFTER_ART,LIVE_LYLA_PHOTO_EVENT,LIVE_DAY_FOLLOWUP,LIVE_AFTER_EVENT,LIVE_REPEAT_MORNING,LIVE_FOLLOWUPS,LIVE_AWAY_IDS,LIVE_HOME_CHECKIN,LIVE_HOME_CHECKIN_ART});
})();
