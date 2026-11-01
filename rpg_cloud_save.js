'use strict';
// Signed-in accounts use the cloud as their authoritative RPG save. Browser storage is a temporary cache.
// Supabase publishable keys are public; row-level security protects each user's records.
(function(root){
 const SESSION_KEY='neoRpgCloudSessionV1', META_PREFIX='neoRpgCloudSyncedV1:';
 const OWNER_KEY='neoRpgLocalOwnerV1', ACCOUNT_CACHE_PREFIX='neoRpgAccountCacheV1:';
 let config=null,session=null,adapter=null,button=null,dialog=null,notice=null;
 let meta=null,blocked=false,busy=false,inflight=null,queued=false,timer=null,lastCheck=0;
 const $=id=>dialog?.querySelector('#'+id);
 const local=()=>adapter?.getSave?.()||null;
 async function cloudFetch(url,options={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  try{return await fetch(url,{...options,signal:controller.signal});}
  catch(error){if(error.name==='AbortError')throw Error('Cloud connection timed out. Your browser save is safe.');throw error;}
  finally{clearTimeout(timer);}
 }
 function hash(value){
  const raw=JSON.stringify(value);let h=2166136261;
  for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619);}
  return raw.length+':'+(h>>>0).toString(16);
 }
 function eligible(){return !!local();}
 function fingerprint(){const s=local();return s?hash(s):null;}
 function readMeta(){try{return JSON.parse(localStorage.getItem(META_PREFIX+session.user.id)||'null');}catch{return null;}}
 function mark(revision,snapshot){
  meta={revision,hash:hash(snapshot)};
  localStorage.setItem(META_PREFIX+session.user.id,JSON.stringify(meta));
  localStorage.setItem(OWNER_KEY,session.user.id);
  localStorage.setItem(ACCOUNT_CACHE_PREFIX+session.user.id,JSON.stringify(snapshot));
 }
 function stashLocal(userId){
  if(!userId||localStorage.getItem(OWNER_KEY)!==userId)return;
  const snapshot=local();
  if(snapshot&&validSave(snapshot))localStorage.setItem(ACCOUNT_CACHE_PREFIX+userId,JSON.stringify(snapshot));
 }
 function restoreAccountLocal(){
  const userId=session?.user?.id,owner=localStorage.getItem(OWNER_KEY);
  if(!userId||!owner||owner===userId)return false;
  // Never upload another account's local campaign, even if this account has no cloud row.
  const raw=localStorage.getItem(ACCOUNT_CACHE_PREFIX+userId);
  let ownSave=null;
  try{ownSave=raw?JSON.parse(raw):null;}catch{}
  stashLocal(owner);
  if(!validSave(ownSave)&&typeof adapter.resetSave!=='function'){
   blocked=true;stateLabel('Cannot switch accounts without resetting the local campaign.');return true;
  }
  localStorage.setItem(OWNER_KEY,userId);
  meta=readMeta();
  if(validSave(ownSave))adapter.restoreSave(ownSave);
  else adapter.resetSave?.();
  stateLabel('Switching to this account\'s own campaign…');
  return true;
 }
 function label(message){if(notice)notice.textContent=message;if(button)button.title=message;}
 function stateLabel(message){label(message);if(button)button.textContent=session?'☁ CLOUD':'☁ SIGN IN';const saveButton=document.getElementById?.('save');if(saveButton){saveButton.textContent=session?'☁ SYNC':'▣ SAVE';saveButton.title=session?'Sync campaign to the cloud':'Save your campaign';}}
 function errorText(error){return error?.message||'Cloud saves are unavailable. Your browser save is safe.';}
 function sessionSave(data){
  const previousUserId=session?.user?.id||'';
  stashLocal(previousUserId);
  session=data?{access_token:data.access_token,refresh_token:data.refresh_token,user:data.user,expires_at:Date.now()+Math.max(0,Number(data.expires_in||3600)-60)*1000}:null;
  if(session)localStorage.setItem(SESSION_KEY,JSON.stringify(session));else localStorage.removeItem(SESSION_KEY);
  meta=session?readMeta():null;
  if(button)button.textContent=session?'☁ CLOUD':'☁ SIGN IN';
  renderAccount();
  if(adapter?.recoveryOnly&&session){root.location.reload();return;}
  // The roster is loaded once at startup. Switching accounts must fetch it again.
  if(previousUserId!==(session?.user?.id||'')&&root.NeoRpgExclusiveRosterLoaded)
    root.location.reload();
 }
 async function request(endpoint,body,authenticated=false,method='POST'){
  const expectedOwner=authenticated?session?.user?.id:null;
  if(authenticated)await refreshIfNeeded();
  if(authenticated&&(!session||session.user.id!==expectedOwner))throw Error('Cloud account changed during request');
  const headers={'apikey':config.key,'Content-Type':'application/json'};
  if(authenticated)headers.Authorization='Bearer '+session.access_token;
  const response=await cloudFetch(config.url+endpoint,{method,headers,...(body===undefined?{}:{body:JSON.stringify(body)})});
  const data=await response.json().catch(()=>null);
  if(!response.ok){const error=new Error(data?.msg||data?.message||data?.error_description||data?.error||'Cloud request failed ('+response.status+')');error.code=data?.code||'';error.status=response.status;throw error;}
  return data;
 }
 async function refreshIfNeeded(){
  if(!session)return;
  if(session.expires_at>Date.now())return;
  const originalSession=session;
  const data=await request('/auth/v1/token?grant_type=refresh_token',{refresh_token:originalSession.refresh_token});
  if(session!==originalSession)return;
  if(!data?.access_token)throw Error('Please sign in again.');
  sessionSave(data);
 }
 async function remoteRead(){
  const rows=await request('/rest/v1/rpg_saves?select=save_data,revision,updated_at&limit=1',undefined,true,'GET');
  return Array.isArray(rows)?rows[0]||null:null;
 }
 async function upload(expected){
  if(inflight){queued=true;return false;}
  if(blocked||!session||!eligible()){stateLabel('No campaign to sync yet.');return false;}
  if(localStorage.getItem(OWNER_KEY)&&localStorage.getItem(OWNER_KEY)!==session.user.id){
   await reconcile();return false;
  }
  const ownerId=session.user.id;
  const snapshot=structuredClone(local()),sentHash=hash(snapshot);
  inflight=(async()=>{
   try{
    const result=await request('/rest/v1/rpc/rpg_save_cas',{expected_revision:expected,new_save:snapshot},true);
    if(session?.user?.id!==ownerId)return false;
    const revision=Array.isArray(result)?result[0]?.new_revision:result?.new_revision;
    if(!Number.isSafeInteger(Number(revision)))throw Error('Invalid cloud save confirmation.');
    mark(Number(revision),snapshot);blocked=false;stateLabel('Cloud save synced.');
    if(fingerprint()!==sentHash)queued=true;
    return true;
   }catch(error){
    if(session?.user?.id!==ownerId)return false;
    if(error.code==='40001'||/CLOUD_SAVE_CONFLICT/i.test(error.message)){
     stateLabel('Newer cloud progress found. Loading it…');
     await loadRemote();
    }else stateLabel('Saved locally; cloud sync failed: '+errorText(error));
    return false;
   }
  })();
  try{return await inflight;}finally{
   inflight=null;
   if(queued&&!blocked){queued=false;schedule();}
  }
 }
 function renderAccount(){
  if(!dialog)return;
  const signed=!!session&&!adapter?.recoveryOnly;
  $('cloudAuth').hidden=signed;
  $('cloudSigned').hidden=!signed;
  if(signed)$('cloudEmail').textContent=session.user?.email||'Signed in';
 }
 function show(){if(!dialog)return;renderAccount();if(!dialog.open)dialog.showModal();}
 function close(){if(dialog?.open)dialog.close();}
 function validSave(save){return !!save&&Number.isInteger(save.day)&&save.day>=1&&save.day<=91&&Array.isArray(save.results);}
 function importRemote(record){
  if(!validSave(record?.save_data))throw Error('The cloud save is invalid; your local save was preserved.');
  const downloaded=structuredClone(record.save_data);
  // Ongoing battles are restored from their own server-authoritative cloud checkpoints.
  mark(record.revision,downloaded);
  adapter.restoreSave(downloaded);
  close();stateLabel('Cloud progress loaded.');
 }
 async function loadRemote(){
  const ownerId=session?.user?.id;
  try{
   const record=await remoteRead();
   if(session?.user?.id!==ownerId)return;
   if(record)importRemote(record);
   else{meta=null;stateLabel('Cloud save not found. Reconnecting…');}
  }catch(error){stateLabel('Cloud sync unavailable: '+errorText(error));}
 }
 async function reconcile(background=false){
  if(!session||busy)return;
  const ownerId=session.user.id;
  busy=true;
  try{
   if(restoreAccountLocal())return;
   const remote=await remoteRead();
   if(session?.user?.id!==ownerId)return;
   const saved=local(),localHash=saved?hash(saved):null;
   if(!remote){
    blocked=false;renderAccount();
    if(eligible())await upload(0);
    else stateLabel('Cloud connected. Start a campaign to sync.');
    return;
   }
   if(!validSave(remote.save_data))throw Error('Cloud save failed validation.');
   if(localHash===hash(remote.save_data)){
    mark(remote.revision,saved);blocked=false;renderAccount();stateLabel('Cloud save up to date.');return;
   }
   // Local unsynced actions are safe to upload only while the remote revision
   // matches this device's last known revision. Otherwise the cloud wins.
   if(meta?.revision===remote.revision&&meta?.hash!==localHash){
    blocked=false;renderAccount();
    if(eligible())await upload(remote.revision);
    return;
   }
   if(background){
    // A focus check never interrupts normal play unless another device has
    // advanced the cloud revision. Do not replace unsynced local progress with
    // an identical or older revision.
    if(meta&&remote.revision<=meta.revision){
     stateLabel('Cloud save checked. Local progress kept.');return;
    }
    // The player sees the notification before the active campaign changes.
    root.alert?.('A newer cloud save was found. It will now be loaded.');
    if(session?.user?.id!==ownerId)return;
   }
   importRemote(remote);
  }catch(error){stateLabel('Cloud progress could not be loaded: '+errorText(error));}
  finally{busy=false;lastCheck=Date.now();}
 }
 function schedule(){
  if(timer)clearTimeout(timer);
  // Debounce bursts of game actions; never make gameplay await the network.
  timer=setTimeout(()=>{timer=null;void syncNow();},250);
 }
 async function syncNow(){
  if(!config?.enabled||!session||blocked)return false;
  if(localStorage.getItem(OWNER_KEY)&&localStorage.getItem(OWNER_KEY)!==session.user.id){
   await reconcile();return false;
  }
  // A single writer owns the CAS revision. Coalesce all intervening actions
  // into the newest snapshot after that request completes.
  if(inflight){queued=true;return false;}
  if(!eligible()){stateLabel('Start a campaign to sync to the cloud.');return false;}
  if(meta?.hash===fingerprint()){stateLabel('Cloud save up to date.');return true;}
  if(meta?.revision===undefined){await reconcile();return !blocked&&meta?.hash===fingerprint();}
  return upload(meta.revision);
 }
 function onLocalSave(){
  if(session&&localStorage.getItem(OWNER_KEY)===session.user.id)stashLocal(session.user.id);
  if(session&&!blocked)schedule();
 }
 // Supabase email confirmation returns credentials in the URL fragment.
 // Remove the fragment immediately so credentials never remain in the address bar.
 function takeEmailConfirmation(){
  const fragment=root.location?.hash||'';
  if(!fragment.startsWith('#'))return null;
  const params=new URLSearchParams(fragment.slice(1));
  if(!params.has('access_token')&&!params.has('error'))return null;
  root.history?.replaceState?.(root.history.state,null,root.location.pathname+root.location.search);
  if(params.has('error'))throw Error(params.get('error_description')||'Email confirmation was not successful.');
  const token=params.get('access_token'),refresh=params.get('refresh_token');
  if(!token||!refresh||params.get('token_type')!=='bearer')throw Error('Email confirmation could not complete. Sign in with your password.');
  return {access_token:token,refresh_token:refresh,expires_in:Number(params.get('expires_in')||3600)};
 }
 async function completeEmailConfirmation(data){
  const response=await cloudFetch(config.url+'/auth/v1/user',{
   headers:{apikey:config.key,Authorization:'Bearer '+data.access_token}
  });
  const user=await response.json().catch(()=>null);
  if(!response.ok||!user?.id)throw Error('Email confirmed, but automatic sign-in failed. Sign in using your password.');
  sessionSave({...data,user});
  label('Email confirmed. Loading your cloud progress…');
 }
 function signupEndpoint(){
  const origin=root.location?.origin||'';
  const callback=(origin.startsWith('https://')||origin.startsWith('http://'))?origin+'/rpg.html':null;
  return '/auth/v1/signup'+(callback?'?redirect_to='+encodeURIComponent(callback):'');
 }
 async function signIn(mode){
  if(!config?.enabled){stateLabel('Cloud service not configured yet.');return;}
  const email=$('cloudUser').value.trim(),password=$('cloudPassword').value;
  if(!email||!password){label('Enter an email and password.');return;}
  $('cloudSignIn').disabled=true;$('cloudSignUp').disabled=true;
  try{
   if(mode==='signup'){
    const signup=await request(signupEndpoint(),{email,password});
    if(!signup?.access_token){label('Check your email to confirm your account, then sign in.');return;}
    sessionSave(signup);
   }else sessionSave(await request('/auth/v1/token?grant_type=password',{email,password}));
   $('cloudPassword').value='';
   if(adapter?.recoveryOnly)return;
   label('Signed in. Checking your cloud progress…');
   await reconcile();
  }catch(error){label(errorText(error));}
  finally{$('cloudSignIn').disabled=false;$('cloudSignUp').disabled=false;}
 }
 async function signOut(){
  if(session){
   try{await request('/auth/v1/logout',{},true);}catch{}
  }
  sessionSave(null);blocked=false;meta=null;
  label('Signed out. Your save is still stored in this browser.');renderAccount();
 }
 function ui(){
  if(!adapter.showButton)return;
  button=document.getElementById('cloudSaveButton');
  if(!button){
   button=document.createElement('button');button.type='button';button.id='cloudSaveButton';button.className='toolbar-btn cloud-save-button';
   const actions=document.querySelector('.utility-actions');
   if(actions)actions.prepend(button);else document.querySelector('header')?.append(button);
  }
  button.textContent=localStorage.getItem(SESSION_KEY)?'☁ CLOUD':'☁ SIGN IN';button.title='Cloud save account';button.onclick=show;
  dialog=document.createElement('dialog');dialog.className='cloud-save-dialog';dialog.id='cloudSaveDialog';
  dialog.innerHTML='<div class="cloud-dialog-head"><h2>☁ Cloud Save</h2><button type="button" id="cloudClose" aria-label="Close">✕</button></div>'+
   '<p id="cloudMessage" role="status" aria-live="polite">Sign in to load your cloud campaign and sync progress automatically.</p>'+
   '<div id="cloudAuth"><label>Email<input id="cloudUser" type="email" autocomplete="email" inputmode="email" required></label>'+
   '<label>Password<input id="cloudPassword" type="password" autocomplete="current-password" required minlength="6"></label>'+
   '<div class="cloud-actions"><button type="button" id="cloudSignIn">Sign in</button><button type="button" id="cloudSignUp">Create account</button></div></div>'+
   '<div id="cloudSigned" hidden><p id="cloudEmail"></p><div class="cloud-actions">'+
   '<button type="button" id="cloudSync">Sync now</button><button type="button" id="cloudSignOut">Sign out</button></div></div>'+
   '<p class="cloud-small">Campaign choices and active RPG duels auto-save when signed in. Custom playmat uploads stay on this device.</p>';
  document.body.append(dialog);notice=$('cloudMessage');
  $('cloudClose').onclick=close;$('cloudSignIn').onclick=()=>signIn('signin');$('cloudSignUp').onclick=()=>signIn('signup');
  $('cloudSignOut').onclick=signOut;$('cloudSync').onclick=()=>reconcile();
  $('cloudPassword').addEventListener('keydown',ev=>{if(ev.key==='Enter')signIn('signin');});
  renderAccount();
 }
 async function connect(){
  let confirmed=null;
  try{confirmed=takeEmailConfirmation();}catch(error){label(errorText(error));}
  try{
   let response=await cloudFetch('/api/rpg-cloud/config',{cache:'no-store'}).catch(()=>null);
   config=null;
   if(response?.ok){try{config=await response.json()}catch{}}
   if(!config?.enabled){
    response=await cloudFetch('/rpg-cloud-config.json',{cache:'no-store'}).catch(()=>null);
    if(response?.ok){try{config=await response.json()}catch{}}
   }
   if(!config?.enabled){
    stateLabel('Cloud saves are not connected yet. Your local save is working.');return;
   }
   if(confirmed)await completeEmailConfirmation(confirmed);
   if(adapter?.recoveryOnly){stateLabel('Sign in again to reconnect. Your saved campaign will be kept.');return;}
   const cached=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
   if(!cached?.refresh_token||!cached?.user?.id){
    stateLabel('Sign in to sync your RPG progress between devices.');return;
   }
   session=cached;meta=readMeta();renderAccount();
   await refreshIfNeeded();await reconcile();
  }catch(error){stateLabel('Cloud unavailable; browser progress is safe. '+errorText(error));}
 }
 async function mount(options){
  if(sessionStorage.getItem('neoRpgPlayFreshWithoutCloud')==='1'||sessionStorage.getItem('neoRpgRosterDegraded')==='1')return;
  if(adapter)return;
  adapter=options;ui();
  window.addEventListener('online',()=>{if(!config?.enabled)return connect();if(session&&!blocked)return reconcile();});
  document.addEventListener('visibilitychange',()=>{
   if(document.hidden)return;
   // The foreground game remains visible during a routine cloud check.
   document.documentElement?.classList.remove('rpg-cloud-loading');
   if(session&&Date.now()-lastCheck>30000)void reconcile(true);
  });
  try{await connect();}finally{document.documentElement?.classList.remove('rpg-cloud-loading');}
 }
 root.NeoRpgCloudSave={mount,show,onLocalSave,syncNow,hash,validSave,signupEndpoint,isSignedIn:()=>!!session};
})(typeof window==='undefined'?null:window);
