'use strict';
// Cloud RPG saves are opt-in. Browser localStorage remains the primary offline backup.
// Supabase publishable keys are public; row-level security protects each user's records.
(function(root){
 const SESSION_KEY='neoRpgCloudSessionV1', META_PREFIX='neoRpgCloudSyncedV1:';
 let config=null,session=null,adapter=null,button=null,dialog=null,notice=null,choice=null;
 let meta=null,blocked=false,busy=false,inflight=null,queued=false,timer=null,lastCheck=0;
 const $=id=>dialog?.querySelector('#'+id);
 const local=()=>adapter?.getSave?.()||null;
 function hash(value){
  const raw=JSON.stringify(value);let h=2166136261;
  for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619);}
  return raw.length+':'+(h>>>0).toString(16);
 }
 function eligible(){const s=local();return !!s&&!s.pendingDuel&&adapter?.canSwitch?.()!==false;}
 function fingerprint(){const s=local();return s?hash(s):null;}
 function readMeta(){try{return JSON.parse(localStorage.getItem(META_PREFIX+session.user.id)||'null');}catch{return null;}}
 function mark(revision,snapshot){meta={revision,hash:hash(snapshot)};localStorage.setItem(META_PREFIX+session.user.id,JSON.stringify(meta));}
 function label(message){if(notice)notice.textContent=message;if(button)button.title=message;}
 function stateLabel(message){label(message);if(button)button.textContent=session?'☁ CLOUD':'☁ LOCAL';}
 function errorText(error){return error?.message||'Cloud saves are unavailable. Your browser save is safe.';}
 function sessionSave(data){
  session=data?{access_token:data.access_token,refresh_token:data.refresh_token,user:data.user,expires_at:Date.now()+Math.max(0,Number(data.expires_in||3600)-60)*1000}:null;
  if(session)localStorage.setItem(SESSION_KEY,JSON.stringify(session));else localStorage.removeItem(SESSION_KEY);
  meta=session?readMeta():null;
  if(button)button.textContent=session?'☁ CLOUD':'☁ LOCAL';
  renderAccount();
 }
 async function request(endpoint,body,authenticated=false,method='POST'){
  if(authenticated)await refreshIfNeeded();
  const headers={'apikey':config.key,'Content-Type':'application/json'};
  if(authenticated)headers.Authorization='Bearer '+session.access_token;
  const response=await fetch(config.url+endpoint,{method,headers,...(body===undefined?{}:{body:JSON.stringify(body)})});
  const data=await response.json().catch(()=>null);
  if(!response.ok){const error=new Error(data?.msg||data?.message||data?.error_description||data?.error||'Cloud request failed ('+response.status+')');error.code=data?.code||'';error.status=response.status;throw error;}
  return data;
 }
 async function refreshIfNeeded(){
  if(!session)return;
  if(session.expires_at>Date.now())return;
  const data=await request('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token});
  if(!data?.access_token)throw Error('Please sign in again.');
  sessionSave(data);
 }
 async function remoteRead(){
  const rows=await request('/rest/v1/rpg_saves?select=save_data,revision,updated_at&limit=1',undefined,true,'GET');
  return Array.isArray(rows)?rows[0]||null:null;
 }
 async function upload(expected){
  if(inflight){queued=true;return inflight;}
  if(blocked||!session||!eligible()){stateLabel('Saved locally. Cloud sync waits until your duel is complete.');return false;}
  const snapshot=local(),sentHash=hash(snapshot);
  inflight=(async()=>{
   try{
    const result=await request('/rest/v1/rpc/rpg_save_cas',{expected_revision:expected,new_save:snapshot},true);
    const revision=Array.isArray(result)?result[0]?.new_revision:result?.new_revision;
    if(!Number.isSafeInteger(Number(revision)))throw Error('Invalid cloud save confirmation.');
    mark(Number(revision),snapshot);blocked=false;stateLabel('Cloud save synced.');
    if(fingerprint()!==sentHash)queued=true;
    return true;
   }catch(error){
    if(error.code==='40001'||/CLOUD_SAVE_CONFLICT/i.test(error.message)){
     blocked=true;stateLabel('Another device saved progress. Choose which save to keep.');
     await offerRemote();
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
  const signed=!!session;
  $('cloudAuth').hidden=signed;
  $('cloudSigned').hidden=!signed;
  if(signed)$('cloudEmail').textContent=session.user?.email||'Signed in';
  $('cloudChoices').hidden=!choice;
  if(choice){
   $('cloudChoiceText').textContent='This device and the cloud have different progress. Choose which one to use. Keeping this device replaces the cloud version; loading the cloud replaces this browser save.';
  }
 }
 function show(){if(!dialog)return;renderAccount();if(!dialog.open)dialog.showModal();}
 function close(){if(dialog?.open)dialog.close();}
 function validSave(save){return !!save&&Number.isInteger(save.day)&&save.day>=1&&save.day<=91&&Array.isArray(save.results);}
 function importRemote(record){
  if(!validSave(record?.save_data))throw Error('The cloud save is invalid; your local save was preserved.');
  if(adapter.canSwitch?.()===false)throw Error('Finish your current duel before switching saves.');
  const downloaded=structuredClone(record.save_data);
  // A duel's server-memory session cannot be moved to another device.
  downloaded.pendingDuel=null;
  mark(record.revision,downloaded);
  adapter.restoreSave(downloaded);
  close();stateLabel('Cloud progress loaded.');
 }
 function offer(record){
  choice=record;blocked=true;renderAccount();show();
  stateLabel('Save conflict: choose cloud progress or this device.');
 }
 async function offerRemote(){try{const record=await remoteRead();if(record)offer(record);else{blocked=false;meta=null;stateLabel('Cloud save missing; local save is safe.');}}catch(error){stateLabel(errorText(error));}}
 async function reconcile(){
  if(!session||busy)return;
  busy=true;
  try{
   const remote=await remoteRead(),saved=local(),localHash=saved?hash(saved):null;
   if(!remote){
    blocked=false;choice=null;renderAccount();
    if(eligible())await upload(0);
    else stateLabel('Cloud connected. Finish your duel to sync.');
    return;
   }
   if(!validSave(remote.save_data))throw Error('Cloud save failed validation.');
   if(!adapter.hadLocalSave||!saved){importRemote(remote);return;}
   const cloudHash=hash(remote.save_data);
   if(localHash===cloudHash){
    mark(remote.revision,saved);choice=null;blocked=false;renderAccount();stateLabel('Cloud save up to date.');return;
   }
   if(meta?.revision===remote.revision&&meta?.hash===localHash){
    offer(remote);return; // Never silently replace progress while the player is on the page.
   }
   if(meta?.revision===remote.revision&&meta?.hash!==localHash){
    blocked=false;choice=null;renderAccount();
    if(eligible())await upload(remote.revision);else stateLabel('Finish the duel before uploading progress.');
    return;
   }
   offer(remote); // First sign-in, another device changed the save, or both edited offline.
  }catch(error){stateLabel('Saved locally; '+errorText(error));}
  finally{busy=false;lastCheck=Date.now();}
 }
 function schedule(){
  if(timer)clearTimeout(timer);
  timer=setTimeout(()=>{timer=null;syncNow();},1400);
 }
 async function syncNow(){
  if(!config?.enabled||!session||blocked)return false;
  if(!eligible()){stateLabel('Saved locally; finish the duel before cloud sync.');return false;}
  if(meta?.hash===fingerprint()){stateLabel('Cloud save up to date.');return true;}
  if(meta?.revision===undefined){await reconcile();return !blocked;}
  return upload(meta.revision);
 }
 function onLocalSave(){if(session&&!blocked)schedule();}
 async function signIn(mode){
  if(!config?.enabled){stateLabel('Cloud service not configured yet.');return;}
  const email=$('cloudUser').value.trim(),password=$('cloudPassword').value;
  if(!email||!password){label('Enter an email and password.');return;}
  $('cloudSignIn').disabled=true;$('cloudSignUp').disabled=true;
  try{
   if(mode==='signup'){
    const signup=await request('/auth/v1/signup',{email,password});
    if(!signup?.access_token){label('Check your email to confirm your account, then sign in.');return;}
    sessionSave(signup);
   }else sessionSave(await request('/auth/v1/token?grant_type=password',{email,password}));
   $('cloudPassword').value='';
   label('Signed in. Checking your cloud progress…');
   await reconcile();
  }catch(error){label(errorText(error));}
  finally{$('cloudSignIn').disabled=false;$('cloudSignUp').disabled=false;}
 }
 async function signOut(){
  if(session){
   try{await request('/auth/v1/logout',{},true);}catch{}
  }
  sessionSave(null);blocked=false;choice=null;meta=null;
  label('Signed out. Your save is still stored in this browser.');renderAccount();
 }
 async function chooseCloud(){
  if(!choice)return;
  try{importRemote(choice);choice=null;blocked=false;}
  catch(error){label(errorText(error));}
 }
 async function chooseLocal(){
  if(!choice||!eligible()){label('Finish this duel before choosing this device save.');return;}
  const currentRemote=choice;choice=null;blocked=false;renderAccount();
  const success=await upload(currentRemote.revision);
  if(success){label('This device is now the cloud save.');close();}
 }
 function ui(){
  if(!adapter.showButton)return;
  button=document.createElement('button');button.type='button';button.id='cloudSaveButton';button.className='save-btn cloud-save-button';button.textContent='☁ LOCAL';button.title='Cloud save account';button.onclick=show;
  const save=document.getElementById('save');if(save)save.insertAdjacentElement('afterend',button);else document.querySelector('header')?.append(button);
  dialog=document.createElement('dialog');dialog.className='cloud-save-dialog';dialog.id='cloudSaveDialog';
  dialog.innerHTML='<div class="cloud-dialog-head"><h2>☁ Cloud Save</h2><button type="button" id="cloudClose" aria-label="Close">✕</button></div>'+
   '<p id="cloudMessage" role="status" aria-live="polite">Your RPG progress always stays saved in this browser.</p>'+
   '<div id="cloudAuth"><label>Email<input id="cloudUser" type="email" autocomplete="email" inputmode="email" required></label>'+
   '<label>Password<input id="cloudPassword" type="password" autocomplete="current-password" required minlength="6"></label>'+
   '<div class="cloud-actions"><button type="button" id="cloudSignIn">Sign in</button><button type="button" id="cloudSignUp">Create account</button></div></div>'+
   '<div id="cloudSigned" hidden><p id="cloudEmail"></p><div class="cloud-actions">'+
   '<button type="button" id="cloudSync">Sync now</button><button type="button" id="cloudSignOut">Sign out</button></div></div>'+
   '<div id="cloudChoices" hidden><p id="cloudChoiceText"></p><div class="cloud-actions">'+
   '<button type="button" id="cloudUseCloud">Load cloud progress</button><button type="button" id="cloudUseLocal">Use this device</button></div></div>'+
   '<p class="cloud-small">Unfinished duels and custom uploaded playmat images do not transfer. Local saves are kept as a fallback.</p>';
  document.body.append(dialog);notice=$('cloudMessage');
  $('cloudClose').onclick=close;$('cloudSignIn').onclick=()=>signIn('signin');$('cloudSignUp').onclick=()=>signIn('signup');
  $('cloudSignOut').onclick=signOut;$('cloudSync').onclick=()=>reconcile();$('cloudUseCloud').onclick=chooseCloud;$('cloudUseLocal').onclick=chooseLocal;
  $('cloudPassword').addEventListener('keydown',ev=>{if(ev.key==='Enter')signIn('signin');});
  renderAccount();
 }
 async function mount(options){
  if(adapter)return;
  adapter=options;ui();
  try{
   const response=await fetch('/api/rpg-cloud/config',{cache:'no-store'});
   config=await response.json();
   if(!response.ok||!config.enabled){stateLabel('Cloud saves are not connected yet. Your local save is working.');return;}
   const cached=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
   if(!cached?.refresh_token||!cached?.user?.id){stateLabel('Sign in to sync your RPG progress between devices.');return;}
   session=cached;meta=readMeta();renderAccount();
   await refreshIfNeeded();await reconcile();
  }catch(error){stateLabel('Cloud unavailable; browser progress is safe. '+errorText(error));}
  window.addEventListener('online',()=>{if(session&&!blocked)schedule();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session&&Date.now()-lastCheck>30000)reconcile();});
 }
 root.NeoRpgCloudSave={mount,onLocalSave,syncNow,hash,validSave};
})(typeof window==='undefined'?null:window);
