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
    id:'shop', title:'The Lucky Draw', image:'/rpg-assets/locations/shop/overworld-map-candidate-20261029.webp', artworkStatus:'uploaded',
    width:1550, height:1120, initial:{x:775,y:510,viewWidth:850,viewHeight:700},
    anchors:{P1:{x:600,y:455},P2:{x:860,y:460},P3:{x:625,y:540},P4:{x:870,y:540}},
    hotspots:[{id:'shelves',label:'Card shelves',x:250,y:330,w:300,h:210},{id:'counter',label:'Booster counter',x:625,y:190,w:410,h:165},{id:'tables',label:'Play tables',x:1025,y:490,w:310,h:340},{id:'lounge',label:'Trade lounge',x:1040,y:140,w:280,h:185}]
  },
  home: { id:'home', title:'Your Apartment', image:'/rpg-assets/locations/home/overworld-map-candidate-20261029.webp', artworkStatus:'uploaded', width:1550,height:1120,initial:{x:775,y:545,viewWidth:850,viewHeight:700},anchors:{P1:{x:665,y:490},P2:{x:890,y:490},P3:{x:660,y:800},P4:{x:885,y:800},E1:{x:600,y:550},E2:{x:965,y:550},E3:{x:650,y:944},E4:{x:910,y:944}},hotspots:[{id:'desk',label:'Deck and journal desk',x:520,y:120,w:355,h:240},{id:'bed',label:'Bed and rest',x:200,y:155,w:260,h:265},{id:'wardrobe',label:'Wardrobe and storage',x:490,y:115,w:125,h:205},{id:'window',label:'Window and personal corner',x:95,y:650,w:230,h:230}] },
  park: { id:'park', title:'Riverside Park', image:'/rpg-assets/locations/park/overworld-map-candidate-20261029.webp', artworkStatus:'uploaded', width:1550,height:1120,initial:{x:775,y:545,viewWidth:850,viewHeight:700},anchors:{P1:{x:640,y:420},P2:{x:905,y:420},P3:{x:640,y:700},P4:{x:905,y:700},E1:{x:350,y:450},E2:{x:1210,y:450},E3:{x:380,y:890},E4:{x:1200,y:900}},hotspots:[{id:'waterfront',label:'Waterfront path',x:80,y:105,w:395,h:175},{id:'benches',label:'Benches',x:1060,y:90,w:360,h:230},{id:'flyer-board',label:'Flyer board',x:125,y:735,w:225,h:175},{id:'garden',label:'Garden',x:1025,y:555,w:400,h:250}] },
  cafe: { id:'cafe', title:'The Rest Stop', image:'/rpg-assets/locations/cafe/overworld-map-candidate-20261029.webp', artworkStatus:'uploaded', width:1550,height:1120,initial:{x:775,y:545,viewWidth:850,viewHeight:700},anchors:{P1:{x:640,y:420},P2:{x:905,y:420},P3:{x:640,y:700},P4:{x:905,y:700},E1:{x:350,y:450},E2:{x:1210,y:450},E3:{x:380,y:890},E4:{x:1200,y:900}},hotspots:[{id:'counter',label:'Counter',x:585,y:100,w:565,h:290},{id:'strategy-tables',label:'Strategy tables',x:420,y:435,w:510,h:285},{id:'window-seats',label:'Window seats',x:230,y:125,w:310,h:230},{id:'coffee-station',label:'Coffee station',x:1220,y:195,w:210,h:240}] },
  center: { id:'center', title:'Community Center', image:'/rpg-assets/locations/center/overworld-map-candidate-20261029.webp', artworkStatus:'uploaded', width:1550,height:1120,initial:{x:775,y:545,viewWidth:850,viewHeight:700},anchors:{P1:{x:665,y:420},P2:{x:850,y:420},P3:{x:660,y:730},P4:{x:840,y:730},E1:{x:600,y:520},E2:{x:975,y:520},E3:{x:680,y:900},E4:{x:895,y:900}},hotspots:[{id:'tournament',label:'Tournament hall',x:505,y:100,w:570,h:160},{id:'duel',label:'Duel tables',x:295,y:250,w:980,h:370},{id:'registration',label:'Registration',x:140,y:720,w:340,h:230},{id:'practice',label:'Practice area',x:1000,y:600,w:285,h:200}] },
  library: { id:'library', title:'Library', image:'/rpg-assets/locations/library/overworld-map-candidate-20261029.webp', artworkStatus:'uploaded', width:1550,height:1120,initial:{x:775,y:545,viewWidth:850,viewHeight:700},anchors:{P1:{x:667,y:470},P2:{x:880,y:475},P3:{x:665,y:760},P4:{x:882,y:770},E1:{x:365,y:495},E2:{x:1160,y:500},E3:{x:365,y:944},E4:{x:1170,y:945}},hotspots:[{id:'study',label:'Study tables',x:995,y:280,w:355,h:330},{id:'books',label:'Bookshelves',x:110,y:100,w:380,h:220},{id:'reading',label:'Quiet reading',x:200,y:310,w:255,h:260},{id:'archives',label:'Archives and research',x:1040,y:90,w:340,h:175}] },
  characters: {
    reina: {name:'Reina', face:'/rpg-assets/ui/avatars/reina.webp', poses: {
      standing: {src:'/rpg-assets/characters/reina/overworld/standing.png', height:155, facing:'front'},
      arcade: {src:'/rpg-assets/characters/reina/overworld/arcade-playing-character.png', height:152, facing:'back', handOffset:{x:22,y:-95}}
    }},
    yuna: {name:'Yuna', face:'/rpg-assets/characters/yuna/portraits/primary.png', poses:{standing:{src:'/art-production/overworld-candidates/yuna-standing-v1.png',height:155,facing:'front',status:'candidate'}}},
    barb: {name:'Barb', face:'/rpg-assets/characters/barb/portraits/primary.png', poses:{standing:{src:'/art-production/overworld-candidates/barb-standing-v1.png',height:150,facing:'front',status:'candidate'}}},
    jinx: {name:'Jinx', face:'/rpg-assets/jinx.png'},
    hana: {name:'Hana', face:'/rpg-assets/characters/hana/portraits/primary.png'},
    laca: {name:'Laca', face:'/rpg-assets/characters/laca/neutral.webp'},
    daisy: {name:'Daisy', face:'/rpg-assets/characters/daisy/portraits/primary.png'},
    rina: {name:'Rina', face:'/rpg-assets/rina.png'}
  },
  /* Preview placements only. The RPG's schedule is authoritative once integration is enabled. */
  preview: [
    {id:'reina',anchor:'E1',pose:'arcade',foot:{x:245,y:430}},
    {id:'yuna',anchor:'P2'}, {id:'barb',anchor:'P3'}, {id:'jinx',anchor:'P4'},
    {id:'laca',anchor:'E3'}, {id:'hana',anchor:'E2'}, {id:'rina',anchor:'E5'}, {id:'daisy',anchor:'E4'}
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
