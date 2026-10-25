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
 kaede:Object.freeze({level:4,personality:'aggressive',reason:'challenging disruptive pressure'}),
 // All campaign/guest opponents have a playstyle. RPG overrides level hints
 // with Champion skill, but retains each character's personality.
 jun:Object.freeze({level:3,personality:'tactical',reason:'measured organizer and tournament preparation'}),
 teo:Object.freeze({level:3,personality:'aggressive',reason:'direct attacks and decisive tempo'}),
 iris:Object.freeze({level:3,personality:'defensive',reason:'protecting a developed board'}),
 elio:Object.freeze({level:3,personality:'setup',reason:'careful basics and patient board building'}),
 alma:Object.freeze({level:4,personality:'tactical',reason:'slow Fossil lock and resource control'}),
 nereo:Object.freeze({level:3,personality:'defensive',reason:'resilience and flexible late-game recovery'}),
 elena:Object.freeze({level:4,personality:'tactical',reason:'disciplined contingency planning and Jungle control'}),
 jinx:Object.freeze({level:4,personality:'aggressive',reason:'fast Lightning pressure and confident attacks'}),
 laca:Object.freeze({level:3,personality:'risk_taking',reason:'playful Water evolution tempo and opportunistic attacks'}),
 luna:Object.freeze({level:3,personality:'defensive',reason:'gentle Water tempo and protecting her team'}),
 rina:Object.freeze({level:4,personality:'setup',reason:'developed Grass evolution lines into a strong attack'}),
 sierra:Object.freeze({level:4,personality:'tactical',reason:'calculated Blackout disruption and resource denial'}),
 sol:Object.freeze({level:3,personality:'risk_taking',reason:'unpredictable Fire and Water tempo plays'}),
 barb:Object.freeze({level:4,personality:'tactical',reason:'playful Psychic and Lightning resource tempo'})
});
function profileForNpc(npc){
 if(typeof npc!=='string'||!Object.hasOwn(NPC_PROFILES,npc))throw Error('Unknown CPU NPC profile');
 const {level,personality}=NPC_PROFILES[npc];
 return {level,personality};
}
module.exports={NPC_PROFILES,profileForNpc};
