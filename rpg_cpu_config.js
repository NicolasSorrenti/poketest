'use strict';
// RPG opponents always use the highest CPU skill supported by the engine.
// Every character uses the same search strength; campaign progression changes
// deck recipes, and their individual personality settings remain intact.
const {SKILLS,configuration}=require('./cpu_policy');
const {NPC_PROFILES}=require('./cpu_profiles');
const RPG_CPU_LEVEL=Math.max(...Object.keys(SKILLS).map(Number));
const TACTICS=Object.freeze({
 prizeRace:true,knockoutTempo:true,opponentResponse:true,
 evolutionTempo:true,energyHorizon:true
});

// No RPG caller can reduce a named or guest NPC's decision-making skill.
function forRpgDuel(params={}){
 return {...params,difficulty:RPG_CPU_LEVEL,advancedTactics:true};
}

// When local/cloud checkpoints are restored, advance CPU policy without
// touching the saved match, RNG, pending actions, deck, or revision.
function upgradeRpgSession(session){
 if(!session||typeof session!=='object')throw Error('Missing RPG duel session');
 const previous=session.cpuConfig||{};
 const npc=session.npc;
 const personality=typeof npc==='string'&&Object.hasOwn(NPC_PROFILES,npc)?
  NPC_PROFILES[npc].personality:previous.personality;
 if(previous.level===RPG_CPU_LEVEL&&previous.personality===personality&&
   Object.keys(TACTICS).every(k=>previous[k]===true))return session;
 session.cpuConfig=configuration({...previous,personality,level:RPG_CPU_LEVEL,...TACTICS});
 return session;
}
module.exports={RPG_CPU_LEVEL,forRpgDuel,upgradeRpgSession};
