// Server-authoritative character roster for Cloudflare Pages.
// Keep exclusive packs out of the public JSON and grant them only after
// Supabase Auth verifies the access token and confirmed email.
import packRegistry from '../../../rpg_character_packs.generated.js';
import access from '../../../rpg_character_access.js';

const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const reply=(payload,status=200)=>Response.json(payload,{status,headers});

export async function onRequestGet({request,env}){
  const all=packRegistry.packs;
  if(!Array.isArray(all)||!all.length)return reply({error:'Character registry unavailable'},503);
  let verifiedEmail='';
  const authorization=request.headers.get('authorization')||'';
  if(authorization){
    if(!/^Bearer [A-Za-z0-9_.-]{10,4096}$/.test(authorization))return reply({error:'Invalid authorization'},401);
    const url=String(env.SUPABASE_URL||'').replace(/\/$/,'');
    const key=env.SUPABASE_PUBLISHABLE_KEY||env.SUPABASE_ANON_KEY||'';
    if(!/^https:\/\/[^/]+\.supabase\.co$/.test(url)||!key)return reply({packs:access.filterPacks(all,''),authStatus:'unavailable',code:'AUTH_CONFIG'});
    let response;
    for(let attempt=0;attempt<2;attempt++){
      try{
        response=await fetch(url+'/auth/v1/user',{headers:{apikey:key,Authorization:authorization},redirect:'error',signal:AbortSignal.timeout(8000)});
        if(response.status<500)break;
      }catch(error){console.error('Supabase user lookup failed',error);}
    }
    if(!response||response.status>=500){
      console.error('Supabase identity provider unavailable',response?.status||'network');
      return reply({packs:access.filterPacks(all,''),authStatus:'unavailable',code:'AUTH_UPSTREAM'},503);
    }
    if(!response.ok)return reply({error:'Invalid or expired login'},401);
    const user=await response.json().catch(()=>null);
    if(!user||typeof user.id!=='string')return reply({error:'Invalid login'},401);
    if(user.email_confirmed_at)verifiedEmail=String(user.email||'').trim().toLowerCase();
  }
  return reply({packs:access.filterPacks(all,verifiedEmail)});
}
