/* Master-image coordinates; foot anchors refer to the floor, not the top of an image. */
window.NeoOverworld = Object.freeze({
  arcade: {
    id: 'arcade', title: 'Pixel Palace', image: '/rpg-assets/locations/arcade/overworld-map.webp',
    width: 1550, height: 1120, initial: {x: 775, y: 475, viewWidth: 850, viewHeight: 700},
    anchors: {
      P1: {x: 655, y: 440}, P2: {x: 880, y: 440}, P3: {x: 665, y: 620}, P4: {x: 885, y: 620},
      E1: {x: 330, y: 290}, E2: {x: 1140, y: 330}, E3: {x: 410, y: 685}, E4: {x: 1180, y: 680},
      E5: {x: 340, y: 870}, E6: {x: 1210, y: 900}
    },
    hotspots: [
      {id:'arcade-west', label:'Arcade cabinets', x:220,y:188,w:365,h:100},
      {id:'arcade-racing', label:'Racing games', x:205,y:390,w:270,h:130},
      {id:'arcade-east', label:'Arcade cabinets', x:1410,y:455,w:235,h:180},
      {id:'claw', label:'Claw machines', x:1350,y:175,w:235,h:190},
      {id:'tournament', label:'Tournament tables', x:770,y:730,w:450,h:190},
      {id:'lounge', label:'Lounge', x:260,y:860,w:460,h:300},
      {id:'refreshments', label:'Drinks', x:1500,y:810,w:90,h:265}
    ]
  },
  shop: {
    id:'shop', title:'The Lucky Draw · art candidate', image:'/art-production/overworld-candidates/shop-map-v1.png',
    width:1475, height:1066, initial:{x:738,y:450,viewWidth:850,viewHeight:700},
    anchors:{P1:{x:600,y:455},P2:{x:860,y:460},P3:{x:625,y:540},P4:{x:870,y:540}},
    hotspots:[
      {id:'shelves',label:'Card shelves',x:220,y:200,w:400,h:275},
      {id:'counter',label:'Booster counter',x:860,y:250,w:490,h:170},
      {id:'tables',label:'Play tables',x:800,y:690,w:670,h:270},
      {id:'lounge',label:'Trade lounge',x:190,y:635,w:365,h:215}
    ]
  },
  home: { id:'home', title:'Player Home · blueprint', image:'/overworld/maps/home-blueprint.svg', blueprint:true, width:1550,height:1120,initial:{x:775,y:545,viewWidth:850,viewHeight:700},anchors:{P1:{x:665,y:490},P2:{x:890,y:490},P3:{x:660,y:800},P4:{x:885,y:800},E1:{x:600,y:550},E2:{x:965,y:550},E3:{x:650,y:944},E4:{x:910,y:944}},hotspots:[{id:'desk',label:'Deck and journal desk',x:105,y:170,w:545,h:325},{id:'bed',label:'Bed and rest',x:900,y:170,w:540,h:325},{id:'wardrobe',label:'Wardrobe and storage',x:105,y:585,w:500,h:325},{id:'window',label:'Window and personal corner',x:925,y:585,w:515,h:325}] },
  park: { id:'park', title:'Riverside Park · blueprint', image:'/overworld/maps/park-blueprint.svg', blueprint:true, width:1550,height:1120,initial:{x:775,y:545,viewWidth:850,viewHeight:700},anchors:{P1:{x:640,y:420},P2:{x:905,y:420},P3:{x:640,y:700},P4:{x:905,y:700},E1:{x:350,y:450},E2:{x:1210,y:450},E3:{x:380,y:890},E4:{x:1200,y:900}},hotspots:[{id:'a',label:'Waterfront path',x:350,y:270,w:510,h:285},{id:'b',label:'Benches',x:1070,y:270,w:670,h:305},{id:'c',label:'Flyer board',x:350,y:710,w:515,h:345},{id:'d',label:'Garden',x:1070,y:720,w:670,h:315}] },
  cafe: { id:'cafe', title:'The Rest Stop · café blueprint', image:'/overworld/maps/cafe-blueprint.svg', blueprint:true, width:1550,height:1120,initial:{x:775,y:545,viewWidth:850,viewHeight:700},anchors:{P1:{x:640,y:420},P2:{x:905,y:420},P3:{x:640,y:700},P4:{x:905,y:700},E1:{x:350,y:450},E2:{x:1210,y:450},E3:{x:380,y:890},E4:{x:1200,y:900}},hotspots:[{id:'a',label:'Counter',x:350,y:270,w:510,h:285},{id:'b',label:'Strategy tables',x:1070,y:270,w:670,h:305},{id:'c',label:'Window seats',x:350,y:710,w:515,h:345},{id:'d',label:'Coffee station',x:1070,y:720,w:670,h:315}] },
  center: { id:'center', title:'Community Center · blueprint', image:'/overworld/maps/center-blueprint.svg', blueprint:true, width:1550,height:1120,initial:{x:775,y:545,viewWidth:850,viewHeight:700},anchors:{P1:{x:665,y:420},P2:{x:850,y:420},P3:{x:660,y:730},P4:{x:840,y:730},E1:{x:600,y:520},E2:{x:975,y:520},E3:{x:680,y:900},E4:{x:895,y:900}},hotspots:[{id:'tournament',label:'Tournament hall',x:105,y:160,w:530,h:300},{id:'duel',label:'Duel tables',x:900,y:160,w:520,h:300},{id:'registration',label:'Registration',x:105,y:575,w:440,h:340},{id:'practice',label:'Practice area',x:925,y:575,w:500,h:340}] },
  library: { id:'library', title:'Library · blueprint', image:'/overworld/maps/library-blueprint.svg', blueprint:true, width:1550,height:1120,initial:{x:775,y:545,viewWidth:850,viewHeight:700},anchors:{P1:{x:667,y:470},P2:{x:880,y:475},P3:{x:665,y:760},P4:{x:882,y:770},E1:{x:365,y:495},E2:{x:1160,y:500},E3:{x:365,y:944},E4:{x:1170,y:945}},hotspots:[{id:'study',label:'Study tables',x:105,y:155,w:530,h:310},{id:'books',label:'Bookshelves',x:895,y:155,w:535,h:310},{id:'reading',label:'Quiet reading',x:105,y:590,w:530,h:335},{id:'archives',label:'Archives and research',x:900,y:590,w:530,h:335}] },
  characters: {
    reina: {name:'Reina', face:'/rpg-assets/ui/avatars/reina.webp', poses: {
      standing: {src:'/rpg-assets/characters/reina/overworld/standing.png', height:155, facing:'front'},
      arcade: {src:'/rpg-assets/characters/reina/overworld/arcade-playing-character.png', height:152, facing:'back', handOffset:{x:22,y:-95}}
    }},
    yuna: {name:'Yuna', face:'/rpg-assets/characters/yuna/portraits/primary.png', poses:{
      standing:{src:'/rpg-assets/characters/yuna/overworld/gamer-idle.png',height:155,facing:'front'},
      backThreeQuarter:{src:'/rpg-assets/characters/yuna/overworld/back-three-quarter.png',height:155,facing:'back'},
      sidePose:{src:'/rpg-assets/characters/yuna/overworld/side-pose.png',height:155,facing:'side'},
      headphones:{src:'/rpg-assets/characters/yuna/overworld/headphones.png',height:155,facing:'front'},
      gamerIdle:{src:'/rpg-assets/characters/yuna/overworld/gamer-idle.png',height:155,facing:'front'},
      crouchingCards:{src:'/rpg-assets/characters/yuna/overworld/crouching-cards.png',height:146,facing:'front'},
      seatedCards:{src:'/rpg-assets/characters/yuna/overworld/seated-cards.png',height:120,facing:'front'}
    }},
    hana: {name:'Hana', face:'/rpg-assets/characters/hana/portraits/primary.png', poses:{
      standing:{src:'/rpg-assets/characters/hana/overworld/phone-standing.png',height:155,facing:'front'},
      standingBack:{src:'/rpg-assets/characters/hana/overworld/standing-back.png',height:155,facing:'back'},
      phoneStanding:{src:'/rpg-assets/characters/hana/overworld/phone-standing.png',height:155,facing:'front'},
      kneelingBag:{src:'/rpg-assets/characters/hana/overworld/kneeling-bag.png',height:120,facing:'front'}
    }},
    laca: {name:'Laca', face:'/rpg-assets/characters/laca/neutral.webp', poses:{
      standing:{src:'/rpg-assets/characters/laca/overworld/casual/reaching-out.png',height:155,facing:'front'},
      walkingBack:{src:'/rpg-assets/characters/laca/overworld/casual/walking-back.png',height:155,facing:'back'},
      reachingOut:{src:'/rpg-assets/characters/laca/overworld/casual/reaching-out.png',height:155,facing:'front'},
      crouching:{src:'/rpg-assets/characters/laca/overworld/casual/crouching.png',height:146,facing:'front'},
      lifeguardFrontLeaning:{src:'/rpg-assets/characters/laca/overworld/lifeguard/front-leaning.png',height:155,facing:'front',outfit:'lifeguard'},
      lifeguardBackRescueBuoy:{src:'/rpg-assets/characters/laca/overworld/lifeguard/back-rescue-buoy.png',height:155,facing:'back',outfit:'lifeguard'},
      lifeguardKneelingLookout:{src:'/rpg-assets/characters/laca/overworld/lifeguard/kneeling-lookout.png',height:138,facing:'front',outfit:'lifeguard'}
    }},
    rina: {name:'Rina', face:'/rpg-assets/rina.png', poses:{
      standing:{src:'/rpg-assets/characters/rina/overworld/alternate-idol-pose.png',height:155,facing:'front'},
      overShoulder:{src:'/rpg-assets/characters/rina/overworld/over-shoulder.png',height:155,facing:'back'},
      seatedCards:{src:'/rpg-assets/characters/rina/overworld/seated-cards.png',height:122,facing:'front'},
      alternateCardPose:{src:'/rpg-assets/characters/rina/overworld/alternate-card-pose.png',height:155,facing:'front',status:'candidate'},
      alternateIdolPose:{src:'/rpg-assets/characters/rina/overworld/alternate-idol-pose.png',height:155,facing:'front'},
      reachingIdol:{src:'/rpg-assets/characters/rina/overworld/reaching-idol.png',height:155,facing:'front',status:'cropped-source'}
    }},
    akari: {name:'Akari', face:'/rpg-assets/characters/akari/portraits/primary.png', poses:{
      standing:{src:'/rpg-assets/characters/akari/overworld/standing-clipboard.png',height:155,facing:'front'},
      overShoulderCardigan:{src:'/rpg-assets/characters/akari/overworld/over-shoulder-cardigan.png',height:155,facing:'back'},
      clipboardWriting:{src:'/rpg-assets/characters/akari/overworld/clipboard-writing.png',height:155,facing:'front'},
      seatedClipboard:{src:'/rpg-assets/characters/akari/overworld/seated-clipboard.png',height:138,facing:'front'},
      fashionSketch:{src:'/rpg-assets/characters/akari/overworld/fashion-sketch.png',height:132,facing:'front'},
      standingClipboard:{src:'/rpg-assets/characters/akari/overworld/standing-clipboard.png',height:155,facing:'front'},
      overShoulderBag:{src:'/rpg-assets/characters/akari/overworld/over-shoulder-bag.png',height:155,facing:'back'},
      presentingDesigns:{src:'/rpg-assets/characters/akari/overworld/presenting-designs.png',height:155,facing:'front'},
      seatedCoffeeLaptop:{src:'/rpg-assets/characters/akari/overworld/seated-coffee-laptop.png',height:145,facing:'front'},
      fours:{src:'/rpg-assets/characters/akari/overworld/fours.png',height:155,facing:'front'},
      foursFront:{src:'/rpg-assets/characters/akari/overworld/fours%20front.png',height:155,facing:'front'}
    }},
    shiori: {name:'Shiori', face:'/rpg-assets/characters/shiori/portraits/primary.png', poses:{
      standing:{src:'/rpg-assets/characters/shiori/overworld/standing-book.png',height:155,facing:'front'},
      overShoulder:{src:'/rpg-assets/characters/shiori/overworld/over-shoulder.png',height:155,facing:'back'},
      standingBook:{src:'/rpg-assets/characters/shiori/overworld/standing-book.png',height:155,facing:'front'},
      reachingBookFront:{src:'/rpg-assets/characters/shiori/overworld/reaching-book-front.png',height:155,facing:'front'},
      reachingBookBack:{src:'/rpg-assets/characters/shiori/overworld/reaching-book-back.png',height:128,facing:'back',status:'source-needs-qa'}
    }},
    camila: {name:'Camila', face:'/rpg-assets/characters/camila/portraits/primary.png', poses:{
      standing:{src:'/rpg-assets/characters/camila/overworld/standing-front.png',height:155,facing:'front'},
      standingFront:{src:'/rpg-assets/characters/camila/overworld/standing-front.png',height:155,facing:'front'},
      standingBack:{src:'/rpg-assets/characters/camila/overworld/standing-back.png',height:155,facing:'back'}
    }},
    marina: {name:'Marina', face:'/rpg-assets/characters/marina/portraits/primary.png', poses:{
      standing:{src:'/rpg-assets/characters/marina/overworld/standing-front.png',height:155,facing:'front'},
      standingFront:{src:'/rpg-assets/characters/marina/overworld/standing-front.png',height:155,facing:'front'},
      lookingBack:{src:'/rpg-assets/characters/marina/overworld/looking-back.png',height:155,facing:'back'},
      seatedRelaxing:{src:'/rpg-assets/characters/marina/overworld/seated-relaxing.png',height:140,facing:'front'}
    }},
    kaede: {name:'Kaede', face:'/rpg-assets/characters/kaede/portraits/primary.png', poses:{
      standing:{src:'/rpg-assets/characters/kaede/overworld/standing-front.png',height:155,facing:'front'},
      standingFront:{src:'/rpg-assets/characters/kaede/overworld/standing-front.png',height:155,facing:'front'},
      lookingBack:{src:'/rpg-assets/characters/kaede/overworld/looking-back.png',height:155,facing:'back'},
      crouchingRelaxed:{src:'/rpg-assets/characters/kaede/overworld/crouching-relaxed.png',height:145,facing:'front'},
      arcadePlayingFront:{src:'/rpg-assets/characters/kaede/overworld/arcade-playing-front.png',height:155,facing:'front'},
      arcadePlayingBack:{src:'/rpg-assets/characters/kaede/overworld/arcade-playing-back.png',height:155,facing:'back'}
    }},
    barb: {name:'Barb', face:'/rpg-assets/characters/barb/portraits/primary.png', poses:{standing:{src:'/art-production/overworld-candidates/barb-standing-v1.png',height:150,facing:'front',status:'candidate'}}},
    jinx: {name:'Jinx', face:'/rpg-assets/jinx.png'},
    daisy: {name:'Daisy', face:'/rpg-assets/characters/daisy/portraits/primary.png'}
  },
  /* Preview placements only. The RPG's schedule is authoritative once integration is enabled. */
  preview: [
    {id:'reina',anchor:'E1',pose:'arcade',foot:{x:245,y:430}},
    {id:'yuna',anchor:'P2',pose:'gamerIdle'},
    {id:'hana',anchor:'E2',pose:'phoneStanding'},
    {id:'laca',anchor:'E3',pose:'reachingOut'},
    {id:'rina',anchor:'E4',pose:'overShoulder'},
    {id:'akari',anchor:'P1',pose:'standingClipboard'},
    {id:'shiori',anchor:'P3',pose:'standingBook'},
    {id:'camila',anchor:'P4',pose:'standingFront'},
    {id:'marina',anchor:'E5',pose:'seatedRelaxing'},
    {id:'kaede',anchor:'E6',pose:'arcadePlayingFront'}
  ],
  artPreview: [
    {id:'reina',anchor:'P1',pose:'standing'},
    {id:'yuna',anchor:'P2',pose:'standing'},
    {id:'barb',anchor:'P3',pose:'standing'}
  ],
  shopPreview: [
    {id:'yuna',anchor:'P1',pose:'standing'},
    {id:'barb',anchor:'P2',pose:'standing'}
  ]
});
