'use strict';
// RPG opponents always use the strongest available CPU skill from the first day.
// Campaign progression still changes their cards, not their decision-making effort.
const {SKILLS,configuration}=require('./cpu_policy');
const {NPC_PROFILES}=require('./cpu_profiles');
const RPG_CPU_LEVEL=Math.max(...Object.keys(SKILLS).map(Number));
const TACTICS=Object.freeze({prizeRace:true,knockoutTempo:true,opponentResponse:true});

// The server owns this decision: an RPG launch cannot downgrade its opponent.
function forRpgDuel(params={}){
 return {...params,difficulty:RPG_CPU_LEVEL,advancedTactics:true};
}

// Cloud restores and ongoing local RPG duels can predate this policy.
function upgradeRpgSession(session){
 if(!session||typeof session!=='object')throw Error('Missing RPG duel session');
 const previous=session.cpuConfig||{};
 // Returning cloud duels can predate a character's personality profile.
 // Keep the NPC's current character style at full Champion difficulty.
 const npc=session.npc;
 const personality=typeof npc==='string'&&Object.hasOwn(NPC_PROFILES,npc)?NPC_PROFILES[npc].personality:previous.personality;
 if(previous.level===RPG_CPU_LEVEL&&previous.personality===personality&&Object.keys(TACTICS).every(k=>previous[k]===true))return session;
 session.cpuConfig=configuration({...previous,personality,level:RPG_CPU_LEVEL,...TACTICS});
 return session;
}
module.exports={RPG_CPU_LEVEL,forRpgDuel,upgradeRpgSession};
