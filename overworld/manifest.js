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
    {id:'reina',anchor:'E1',pose:'arcade',foot:{x:339,y:287}},
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
