'use strict';
// Server-side entitlement registry. Never use browser-supplied email claims.
// Extend this map with verified Supabase emails for future exclusive NPCs.
const exclusiveEmails=Object.freeze({
 barb:Object.freeze(['nicolassorrenti2@gmail.com'])
});
const normalize=email=>typeof email==='string'?email.trim().toLowerCase():'';
function permitted(id,verifiedEmail){
 const allowed=exclusiveEmails[id];
 return !allowed||allowed.includes(normalize(verifiedEmail));
}
function filterPacks(packs,verifiedEmail){
 if(!Array.isArray(packs))throw Error('Invalid character registry');
 return packs.filter(p=>p&&permitted(p.id,verifiedEmail));
}
module.exports={exclusiveEmails,permitted,filterPacks};
