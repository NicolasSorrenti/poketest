'use strict';
// Shared browser bridge from the RPG Cloud session to trusted Cube mat permission
// checks. The server always verifies this token with Supabase; email stored in
// localStorage is only used to avoid prompting unrelated accounts.
(function(root){
 const SESSION_KEY='neoRpgCloudSessionV1';
 const OWNER_EMAIL='nicolassorrenti2@gmail.com';
 async function bearer(){
  let saved;try{saved=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{return null;}
  if(!saved?.access_token||!saved?.refresh_token||
   String(saved.user?.email||'').trim().toLowerCase()!==OWNER_EMAIL)return null;
  if(Number(saved.expires_at)>Date.now()+30000)return 'Bearer '+saved.access_token;
  try{
   const response=await fetch('/api/rpg-cloud/config',{cache:'no-store'});
   const config=await response.json();
   if(!response.ok||!config?.enabled)return null;
   const refreshed=await fetch(config.url+'/auth/v1/token?grant_type=refresh_token',{
    method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},
    body:JSON.stringify({refresh_token:saved.refresh_token})
   });
   if(!refreshed.ok)return null;
   const data=await refreshed.json();
   if(!data?.access_token||!data?.refresh_token||!data?.user?.id)return null;
   const next={access_token:data.access_token,refresh_token:data.refresh_token,
    user:data.user,expires_at:Date.now()+Math.max(0,Number(data.expires_in||3600)-60)*1000};
   localStorage.setItem(SESSION_KEY,JSON.stringify(next));
   return 'Bearer '+next.access_token;
  }catch{return null;}
 }
 root.NeoCubeMatAuth={bearer,SESSION_KEY};
})(typeof window==='undefined'?globalThis:window);
