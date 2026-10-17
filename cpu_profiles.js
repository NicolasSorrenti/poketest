'use strict';
// RPG duel personalities. Data only: story scripts, NPC identities and deck
// ownership stay with the RPG agent. Skill and personality remain orthogonal.
const NPC_PROFILES=Object.freeze({
 hana:Object.freeze({level:2,personality:'setup',reason:'friendly teamwork and gradual development'}),
 reina:Object.freeze({level:4,personality:'aggressive',reason:'ambitious early knockout pressure'}),
 shiori:Object.freeze({level:3,personality:'defensive',reason:'patient survival and recovery'}),
 yuna:Object.freeze({level:2,personality:'risk_taking',reason:'showy surprising moves'}),
 akari:Object.freeze({level:5,personality:'tactical',reason:'methodical denial and control'}),
 camila:Object.freeze({level:4,personality:'tactical',reason:'disruption and resource pressure'}),
 marina:Object.freeze({level:3,personality:'setup',reason:'long-term evolution and Energy development'}),
 kaede:Object.freeze({level:4,personality:'aggressive',reason:'challenging disruptive pressure'})
});
function profileForNpc(npc){
 if(typeof npc!=='string'||!Object.hasOwn(NPC_PROFILES,npc))throw Error('Unknown CPU NPC profile');
 const {level,personality}=NPC_PROFILES[npc];
 return {level,personality};
}
module.exports={NPC_PROFILES,profileForNpc};
