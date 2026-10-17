'use strict';
// Local authority adapter for the new Classic playable interface. Sessions are
// isolated. The human receives ONLY an authorized view of game state.
const crypto=require('node:crypto');
const {createGame,reduce,CATALOG}=require('./headless_duel');
const {publicView,publicActivity}=require('./duel_protocol');
const {driveBot,configuration}=require('./classic_bot');
const {profileForNpc}=require('./cpu_profiles');
const {list}=require('./authentic_decks');
const {LAB}=require('./classic_live_decks');
const RETAIL=require('./retail_theme_decks');
const NEO=require('./neo_genesis_decks');
const DISCOVERY=require('./neo_discovery_decks');
const DESTINY=require('./neo_destiny_decks');
const EXPANDED=require('./gym_expanded_decks').LAB;
const ATTACK=require('./attack_effects_core');
const POWERS=require('./classic_power_core');
const TRAINERS=require('./classic_trainer_core');
const FORMAT=require('./classic_format');
const {countCards}=require('./core_rules');
const DECKS=Object.freeze({
 blackout:'base1:Blackout', brushfire:'base1:Brushfire', overgrowth:'base1:Overgrowth',
 zap:'base1:Zap!', power_reserve:'base2:Power Reserve', water_blast:'base2:Water Blast',
 rocket_lab:'lab:rocket', fossil_lab:'lab:fossil',
 ...Object.fromEntries(RETAIL.entries.map(x=>[x.id,`retail:${x.id}`])),
 ...Object.fromEntries(NEO.entries.map(x=>[x.id,`neo:${x.id}`])),
 ...Object.fromEntries(DISCOVERY.entries.map(x=>[x.id,`discovery:${x.id}`])),
 ...Object.fromEntries(DESTINY.entries.map(x=>[x.id,`destiny:${x.id}`])),
 gym_new_garden:'expanded:garden',gym_new_voltage:'expanded:voltage',custom:'custom:local'
});
class ClassicLocalService {
 constructor({now=()=>Date.now(),ttlMs=1000*60*90,maxSessions=32}={}){
  this.sessions=new Map();this.now=now;this.ttlMs=ttlMs;this.maxSessions=maxSessions;
 }
 prune(){for(const [token,r] of this.sessions)if(this.now()-r.updated>this.ttlMs)this.sessions.delete(token);}
 create({deck='blackout',opponent='brushfire',customDeck,seed,difficulty,personality,aiSeed=1,npc}={}){
  this.prune();if(this.sessions.size>=this.maxSessions)throw Error('Too many active duels');
  if(!DECKS[deck]||!DECKS[opponent])throw Error('Unknown Classic deck');
  if(seed!==undefined&&(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff))throw Error('Invalid seed');
  const defaults=npc===undefined?{level:3,personality:'balanced'}:profileForNpc(npc);
  const cpuConfig=configuration({level:difficulty??defaults.level,personality:personality??defaults.personality,seed:aiSeed});
  if(deck==='custom'&&(!Array.isArray(customDeck)||customDeck.length!==60||!customDeck.every(id=>typeof id==='string'&&id.length<=40)))throw Error('Custom deck must contain exactly 60 card IDs');
  if(deck!=='custom'&&customDeck!==undefined)throw Error('Unexpected custom deck');
  if(opponent==='custom')throw Error('CPU deck must be a preset');
  const deckCards=id=>id==='custom'?[...customDeck]:EXPANDED[id]?[...EXPANDED[id]]:LAB[id]?[...LAB[id]]:DECKS[id].startsWith('retail:')?RETAIL.list(id):DECKS[id].startsWith('neo:')?NEO.list(id):DECKS[id].startsWith('discovery:')?DISCOVERY.list(id):DECKS[id].startsWith('destiny:')?DESTINY.list(id):list(DECKS[id]);
  const playerCards=deckCards(deck),cpuCards=deckCards(opponent);
  const expanded=deck==='custom'||EXPANDED[deck]||EXPANDED[opponent]||[...playerCards,...cpuCards].some(id=>id.startsWith('gym')&&!RETAIL.gymIds.includes(id));
  const format=[...playerCards,...cpuCards].some(id=>['neo1','neo2','neo3','neo4'].some(set=>id.startsWith(set+'-')))?(expanded?'online-preview':'neo-theme'):expanded?'gym-expanded':RETAIL.meta[deck]?.gym||RETAIL.meta[opponent]?.gym?'gym-theme':[...playerCards,...cpuCards].some(id=>id.startsWith('base4'))?'theme-expanded':'classic';
  let game=createGame({decks:[playerCards,cpuCards],names:['You','Classic CPU'],format,seed:seed??crypto.randomBytes(4).readUInt32BE(0)});
  game=driveBot(game,200,cpuConfig).game;
  const token=crypto.randomBytes(24).toString('base64url'),session={game,revision:0,updated:this.now(),token,deck,opponent,cpuConfig,npc:npc??null};
  this.sessions.set(token,session);return {token,...this.response(session)};
 }
 session(token){this.prune();const s=this.sessions.get(token);if(!s)throw Error('Unknown or expired session');s.updated=this.now();return s;}
 response(s){const g=s.game,view=publicView(g,0);
  return {revision:s.revision,view,activity:publicActivity(g),format:g.format,winner:g.winner,turnSerial:g.turnSerial,cpu:{level:s.cpuConfig?.level??3,personality:s.cpuConfig?.personality??'balanced',npc:s.npc??null},
   you:{energyUsed:!!g.players[0].energyUsed,retreated:!!g.players[0].retreated,stadiumUsed:g.players[0].stadiumUsedTurn===g.turnSerial},
   lastActions:g.events.slice(-8).map(e=>({side:e.side,type:e.type})),
   counts:g.players.map(p=>countCards(p))};
 }
 state(token){return this.response(this.session(token));}
 action(token,raw,revision){const s=this.session(token);
  if(!Number.isSafeInteger(revision)||revision!==s.revision)throw Error('Stale match revision — refresh the duel');
  if(!raw||typeof raw!=='object')throw Error('Missing command');
  const result=reduce(s.game,0,raw);
  if(!result.ok)throw Error(result.error||'Illegal command');
  // Bot failures must never commit partial human or computer actions.
  const {game}=driveBot(result.game,200,s.cpuConfig);
  s.game=game;s.revision++;return this.response(s);
 }
 decklist(id){if(!DECKS[id]||id==='custom')throw Error('Unknown theme deck');return EXPANDED[id]?[...EXPANDED[id]]:LAB[id]?[...LAB[id]]:DECKS[id].startsWith('retail:')?RETAIL.list(id):DECKS[id].startsWith('neo:')?NEO.list(id):DECKS[id].startsWith('discovery:')?DISCOVERY.list(id):DECKS[id].startsWith('destiny:')?DESTINY.list(id):list(DECKS[id]);}
 catalog(){return [...CATALOG.values()].filter(c=>['base1','base2','base3','base4','base5','gym1','gym2'].some(set=>c.id.startsWith(set+'-'))||NEO.neoIds.includes(c.id)||DISCOVERY.neoIds.includes(c.id)||DESTINY.neoIds.includes(c.id)||require('./neo_bonus_pool').ids.includes(c.id)||require('./neo_v040_pool').ids.includes(c.id)||require('./neo_v046_pool').ids.includes(c.id)||require('./neo_v047_pool').ids.includes(c.id)||require('./neo_v048_pool').ids.includes(c.id)||require('./neo_v049_pool').ids.includes(c.id)||require('./neo_v050_pool').ids.includes(c.id)||require('./neo_v051_pool').ids.includes(c.id)||require('./neo_v052_pool').ids.includes(c.id)||require('./neo_v053_pool').ids.includes(c.id)||require('./neo_v054_pool').ids.includes(c.id)||require('./neo_v055_pool').ids.includes(c.id)||require('./neo_v056_pool').ids.includes(c.id)||require('./neo_v061_pool').ids.includes(c.id)||require('./neo_v062_pool').ids.includes(c.id)||require('./neo_v063_pool').ids.includes(c.id)||require('./neo_v064_pool').ids.includes(c.id)||require('./neo_v065_pool').ids.includes(c.id)||require('./neo_v066_pool').ids.includes(c.id));}
 cardPool(){return this.catalog().map(c=>{const attacks=(c.attacks||[]).map(a=>({name:a.name,supported:!!ATTACK.compile(a)}));const powers=(c.abilities||[]).filter(a=>a.name).map(a=>({name:a.name,supported:[...POWERS.ACTIVATED,...POWERS.ONPLAY,...POWERS.PASSIVE].includes(a.name)}));const supported=c.supertype==='Trainer'?TRAINERS.SUPPORTED.has(c.name):attacks.every(a=>a.supported)&&powers.every(a=>a.supported);return {id:c.id,name:c.name,supertype:c.supertype,subtypes:c.subtypes||[],types:c.types||[],hp:c.hp||null,evolvesFrom:c.evolvesFrom||null,attacks,powers,supported,images:c.images||{},set:FORMAT.setOf(c.id)};});}
}
const deckOptions=()=>[
 {id:'blackout',name:'Blackout · Base Set'},{id:'brushfire',name:'Brushfire · Base Set'},
 {id:'overgrowth',name:'Overgrowth · Base Set'},{id:'zap',name:'Zap! · Base Set'},
 {id:'power_reserve',name:'Power Reserve · Jungle'},{id:'water_blast',name:'Water Blast · Jungle'},
 ...RETAIL.entries.map(x=>({id:x.id,name:x.name+(x.gym?' · Gym preview':''),gym:x.gym})),
 ...NEO.entries,
 ...DISCOVERY.entries,
 ...DESTINY.entries,
 {id:'rocket_lab',name:'Rocket Lab · custom'},{id:'fossil_lab',name:'Fossil Lab · custom'},
 {id:'gym_new_garden',name:'Gym Discovery · Earth & Garden (new cards)',gym:true,expanded:true},
 {id:'gym_new_voltage',name:'Gym Discovery · Fire & Lightning (new cards)',gym:true,expanded:true},
 {id:'custom',name:'My Custom Gym Deck · deck builder',gym:true,expanded:true}
];
module.exports={ClassicLocalService,DECKS,deckOptions};
