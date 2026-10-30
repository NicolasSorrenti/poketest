'use strict';
(function(root){
  if(!root||root.NeoOverworldPlacements)return;
  const SESSION_KEY='neoRpgCloudSessionV1';
  let configPromise=null, authDialog=null, authResolve=null;
  const readSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
  const writeSession=value=>{if(value)localStorage.setItem(SESSION_KEY,JSON.stringify(value));else localStorage.removeItem(SESSION_KEY)};
  async function getConfig(){
    if(configPromise)return configPromise;
    configPromise=(async()=>{
      for(const path of ['/api/rpg-cloud/config','/rpg-cloud-config.json']){
        try{
          const response=await fetch(path,{cache:'no-store'});
          if(!response.ok)continue;
          const value=await response.json();
          if(value?.enabled&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(value.url||'')&&value.key)return {url:value.url.replace(/\/$/,''),key:value.key};
        }catch{}
      }
      throw Error('Cloud config is not available on this deployment.');
    })();
    return configPromise;
  }
  function sessionExpiry(data){return {...data,expires_at:Date.now()+Math.max(0,Number(data.expires_in||3600)-60)*1000}}
  async function authRequest(path,body){
    const c=await getConfig();
    const response=await fetch(c.url+'/auth/v1'+path,{method:'POST',headers:{apikey:c.key,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(data.msg||data.message||data.error_description||data.error||'Sign in failed (HTTP '+response.status+').');
    return data;
  }
  async function validSession(){
    let session=readSession();
    if(session?.access_token&&session?.refresh_token&&Number(session.expires_at)>Date.now()+60000)return session;
    if(!session?.refresh_token)return null;
    try{
      const data=await authRequest('/token?grant_type=refresh_token',{refresh_token:session.refresh_token});
      session={...session,...sessionExpiry(data)};
      writeSession(session);
      return session;
    }catch{writeSession(null);return null}
  }
  function ensureDialog(){
    if(authDialog)return authDialog;
    authDialog=document.createElement('dialog');
    authDialog.style.cssText='width:min(420px,calc(100vw - 28px));border:1px solid #a67bb0;border-radius:14px;background:#1d1930;color:#fff;padding:20px;font:14px system-ui;box-shadow:0 18px 55px #000b';
    authDialog.innerHTML='<form method="dialog" style="display:flex;justify-content:space-between;align-items:center"><strong style="font-size:18px">Save overworld positions</strong><button value="cancel" aria-label="Close">✕</button></form><p id="owAuthMessage">Sign in with your cloud save account to save this map for the game.</p><label style="display:grid;gap:5px;margin:10px 0">Email<input id="owAuthEmail" type="email" autocomplete="email" required style="padding:10px;border-radius:8px"></label><label style="display:grid;gap:5px;margin:10px 0">Password<input id="owAuthPassword" type="password" autocomplete="current-password" required style="padding:10px;border-radius:8px"></label><div style="display:flex;gap:8px"><button id="owAuthSignIn" type="button">Sign in</button><button id="owAuthSignUp" type="button">Create account</button></div>';
    document.body.append(authDialog);
    const signIn=async mode=>{
      const message=authDialog.querySelector('#owAuthMessage');
      const email=authDialog.querySelector('#owAuthEmail').value.trim(),password=authDialog.querySelector('#owAuthPassword').value;
      if(!email||!password){message.textContent='Enter your email and password.';return}
      const buttons=authDialog.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);
      try{
        const data=await authRequest(mode==='signup'?'/signup':'/token?grant_type=password',{email,password});
        if(!data.access_token){message.textContent='Check your email to confirm the account, then sign in.';return}
        const c=await getConfig(),userResponse=await fetch(c.url+'/auth/v1/user',{headers:{apikey:c.key,Authorization:'Bearer '+data.access_token}});
        const user=await userResponse.json().catch(()=>null);
        if(!userResponse.ok||!user?.id)throw Error('Could not verify the signed-in account.');
        writeSession(sessionExpiry({...data,user}));
        authDialog.querySelector('#owAuthPassword').value='';
        authDialog.close('signed-in');
      }catch(error){message.textContent=String(error.message||error)}
      finally{buttons.forEach(b=>b.disabled=false)}
    };
    authDialog.querySelector('#owAuthSignIn').onclick=()=>signIn('signin');
    authDialog.querySelector('#owAuthSignUp').onclick=()=>signIn('signup');
    return authDialog;
  }
  async function requireSession(){
    const existing=await validSession();if(existing)return existing;
    const dialog=ensureDialog();
    return new Promise((resolve,reject)=>{
      authResolve={resolve,reject};
      dialog.addEventListener('close',async function done(){
        dialog.removeEventListener('close',done);
        const result=await validSession();
        if(result)resolve(result);
        else reject(Error('Sign in was cancelled or did not complete.'));
      });
      dialog.showModal();
    });
  }
  async function request(path,options={},session=null){
    const c=await getConfig();
    const response=await fetch(c.url+'/rest/v1/'+path,{...options,headers:{apikey:c.key,Authorization:'Bearer '+(session?.access_token||c.key),...(options.headers||{})}});
    const body=await response.json().catch(()=>null);
    if(!response.ok)throw Error(body?.message||body?.hint||'Database request failed (HTTP '+response.status+').');
    return body;
  }
  async function load(){
    const data=await request('overworld_placements?id=eq.global&select=placements,revision,updated_at&limit=1');
    const row=Array.isArray(data)?data[0]:null;
    return row?{placements:row.placements,revision:Number(row.revision)||1,updated_at:row.updated_at}:null;
  }
  async function save(placements,expectedRevision){
    const session=await requireSession();
    const body={placements,revision:Number(expectedRevision)+1,updated_at:new Date().toISOString(),updated_by:session.user.id};
    const rows=await request('overworld_placements?id=eq.global&revision=eq.'+encodeURIComponent(String(expectedRevision)),{
      method:'PATCH',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)
    },session);
    if(!Array.isArray(rows)||!rows.length)throw Error('The map changed since it was loaded. Reload it before saving again.');
    return {revision:Number(rows[0].revision),updated_at:rows[0].updated_at};
  }
  root.NeoOverworldPlacements={load,save,session:validSession};
})(typeof window==='undefined'?null:window);
