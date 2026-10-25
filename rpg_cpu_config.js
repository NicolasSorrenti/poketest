'use strict';
// RPG opponents always use the strongest validated CPU skill from the first day.
// Campaign progression still changes their cards, not their decision-making effort.
const {configuration}=require('./cpu_policy');
// Mastermind beat Champion across both repeated general and late-campaign NPC
// mirrors. The ~20–50 ms p95 simulated decision cost is an acceptable trade-off
// for higher RPG playing strength; Level 8 did not show an RPG strength gain.
// Single Match and Cube defaults are independent and remain unchanged.
const RPG_CPU_LEVEL=7;
const TACTICS=Object.freeze({
 prizeRace:true,knockoutTempo:true,opponentResponse:true,
 evolutionTempo:true,energyHorizon:true
});

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
