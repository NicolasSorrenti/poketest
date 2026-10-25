'use strict';
// RPG opponents always use the strongest validated CPU skill from the first day.
// Campaign progression still changes their cards, not their decision-making effort.
const {SKILLS,configuration}=require('./cpu_policy');
// Experimental levels are opt-in until real matches demonstrate strength and latency.
const RPG_CPU_LEVEL=5;
const TACTICS=Object.freeze({prizeRace:true,knockoutTempo:true,opponentResponse:true});

// The server owns this decision: an RPG launch cannot downgrade its opponent.
function forRpgDuel(params={}){
 return {...params,difficulty:RPG_CPU_LEVEL,advancedTactics:true};
}

// Cloud restores and ongoing local RPG duels can predate this policy.
function upgradeRpgSession(session){
 if(!session||typeof session!=='object')throw Error('Missing RPG duel session');
 const previous=session.cpuConfig||{};
 if(previous.level===RPG_CPU_LEVEL&&Object.keys(TACTICS).every(k=>previous[k]===true))return session;
 session.cpuConfig=configuration({...previous,level:RPG_CPU_LEVEL,...TACTICS});
 return session;
}
module.exports={RPG_CPU_LEVEL,forRpgDuel,upgradeRpgSession};
