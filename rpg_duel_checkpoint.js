'use strict';
// Save *authoritative* single-player RPG duel state after each accepted command.
// Reads/writes are performed server-side using the player's verified Supabase JWT
// and the public API key. RLS ensures a player cannot access another account.
// Never include private hands/decks in the classic HTTP response.
class RpgDuelCheckpoint {
 constructor({fetchImpl=globalThis.fetch,settings=()=>process.env}={}){
  this.fetch=fetchImpl;this.settings=settings;
 }
 config(){
  const env=this.settings();
  const url=String(env.SUPABASE_URL||'').replace(/\/$/,'');
  const key=env.SUPABASE_PUBLISHABLE_KEY||env.SUPABASE_ANON_KEY||'';
  try{
   const parsed=new URL(url);
   if(parsed.protocol!=='https:'||!parsed.hostname.endsWith('.supabase.co')||!key||key.startsWith('sb_secret_'))return null;
   return {url,key};
  }catch{return null;}
 }
 enabled(){return !!this.config();}
 validId(id){return typeof id==='string'&&/^[a-zA-Z0-9_-]{4,100}$/.test(id);}
 bearer(header){
  if(typeof header!=='string'||!/^Bearer [A-Za-z0-9_.-]{10,4096}$/.test(header))throw Error('Sign in to resume or save your RPG duel');
  return header.slice(7);
 }
 async api(endpoint,token,{method='GET',payload}={}){
  const config=this.config();
  if(!config)throw Error('Cloud battle checkpoint storage is not configured');
  const response=await this.fetch(config.url+endpoint,{
   method,headers:{apikey:config.key,Authorization:'Bearer '+token,'Content-Type':'application/json'},
   ...(payload===undefined?{}:{body:JSON.stringify(payload)})
  });
  const data=await response.json().catch(()=>null);
  if(!response.ok){
   const error=new Error(data?.message||data?.msg||data?.error_description||'Cloud checkpoint request failed');
   error.code=data?.code||'';
   error.status=response.status;
   throw error;
  }
  return data;
 }
 async identify(header){
  const token=this.bearer(header);
  const user=await this.api('/auth/v1/user',token);
  if(!user||typeof user.id!=='string'||!/^[0-9a-f-]{36}$/.test(user.id))throw Error('Invalid RPG cloud login');
  return {userId:user.id,accessToken:token};
 }
 snapshot(session){
  return {
   token:session.token,revision:session.revision,game:session.game,
   deck:session.deck,opponent:session.opponent,cpuConfig:session.cpuConfig,
   npc:session.npc,npcDeckTier:session.npcDeckTier,
   undoHistory:(session.undoHistory||[]).slice(-16)
  };
 }
 async save(session,identity){
  if(!identity||session.checkpointOwner!==identity.userId||!this.validId(session.checkpointDuelId))
   throw Error('RPG duel checkpoint identity mismatch');
  const snapshot=this.snapshot(session),expected=session.checkpointRevision??-1;
  const result=await this.api('/rest/v1/rpc/rpg_duel_checkpoint_cas',identity.accessToken,{
   method:'POST',payload:{
    p_duel_id:session.checkpointDuelId,
    p_expected_revision:expected,
    p_revision:session.revision,
    p_snapshot:snapshot
   }
  });
  const revision=Array.isArray(result)?result[0]?.saved_revision:result?.saved_revision;
  if(Number(revision)!==session.revision)throw Error('Cloud duel checkpoint acknowledgement was invalid');
  session.checkpointRevision=session.revision;
  return revision;
 }
 async load(id,identity){
  if(!this.validId(id))throw Error('Invalid RPG duel ID');
  const rows=await this.api('/rest/v1/rpg_duel_checkpoints?select=duel_id,revision,snapshot&duel_id=eq.'+encodeURIComponent(id)+'&limit=1',identity.accessToken);
  const row=Array.isArray(rows)?rows[0]:null;
  if(!row)return null;
  const s=row.snapshot;
  if(!s||!s.game||!Array.isArray(s.game.players)||s.game.players.length!==2||
    !Number.isSafeInteger(s.revision)||s.revision!==row.revision||
    typeof s.token!=='string'||s.token.length<20||!Array.isArray(s.undoHistory)||
    typeof s.cpuConfig!=='object')throw Error('Stored RPG duel checkpoint is invalid');
  return {...s,updated:Date.now(),checkpointOwner:identity.userId,checkpointDuelId:id,
   checkpointRevision:row.revision};
 }
}
module.exports={RpgDuelCheckpoint};
