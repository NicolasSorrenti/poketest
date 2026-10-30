// Cloudflare-native Classic duel endpoints: original TCG engine plus D1 sessions.
// No dependency on Render or any other Node HTTP server.
import {
 ClassicLocalService, deckOptions, RpgDuelCheckpoint,
 forRpgDuel, upgradeRpgSession, checkpointFor,
 database, json, errorResponse, verifyOrigin, readBody, loadInto, storeNew, getSession, putSession
} from '../../_lib/neo-game-state.js';

async function recoverSession(db,session) {
 let prior=null;
 try { prior=await getSession(db,'classic',session.token); }
 catch(error) {if(!/expired session/.test(error.message)) throw error;}
 if(prior && prior.snapshot.revision>=session.revision) return prior.snapshot;
 await db.prepare(`INSERT INTO game_sessions(token,kind,revision,snapshot,updated)
 VALUES(?,'classic',?,?,?) ON CONFLICT(token) DO UPDATE SET
 revision=excluded.revision,snapshot=excluded.snapshot,updated=excluded.updated
 WHERE excluded.revision > game_sessions.revision`)
 .bind(session.token,session.revision,JSON.stringify(session),Date.now()).run();
 return session;
}

export async function onRequest({request,env}) {
 try {
  verifyOrigin(request);
  const url=new URL(request.url);
  const action=url.pathname.slice('/api/classic/'.length);
  const classic=new ClassicLocalService();
  if(request.method==='GET'&&action==='decks')return json({decks:deckOptions()});
  if(request.method==='GET'&&action==='card-pool')return json({cards:classic.cardPool()});
  if(request.method==='GET'&&action==='decklist')return json({cards:classic.decklist(url.searchParams.get('id'))});
  const db=await database(env);
  const checkpoint=checkpointFor(env);

  if(request.method==='POST'&&action==='create'){
   const params=await readBody(request);
   if(!params.rpgDuelId){
    const created=classic.create(params);
    await storeNew(db,'classic',classic,created.token);
    return json(created);
   }
   if(!checkpoint.validId(params.rpgDuelId))throw Error('Invalid RPG duel ID');
   const identity=request.headers.get('authorization')?
    await checkpoint.identify(request.headers.get('authorization')):null;
   if(identity){
    const old=await checkpoint.load(params.rpgDuelId,identity);
    if(old){
     const restored=await recoverSession(db,upgradeRpgSession(old));
     classic.sessions.set(restored.token,restored);
     return json({token:restored.token,...classic.response(restored),
      cloudSaved:restored.checkpointRevision===restored.revision,resumed:true});
    }
   }
   const created=classic.create(forRpgDuel(params));
   const session=classic.sessions.get(created.token);
   if(identity){
    session.checkpointOwner=identity.userId;
    session.checkpointDuelId=params.rpgDuelId;
    try {await checkpoint.save(session,identity);created.cloudSaved=true;}
    catch(error){
     created.cloudSaved=false;
     created.cloudError='Cloud checkpoint unavailable: '+error.message;
    }
   } else {
    session.rpgLocalOnly=true;
    created.cloudSaved=false;
    created.cloudError='Sign in through RPG Cloud to synchronize battle saves across devices.';
   }
   await storeNew(db,'classic',classic,created.token);
   return json(created);
  }

  if(request.method==='POST'&&action==='rpg/resume'){
   const body=await readBody(request);
   const identity=await checkpoint.identify(request.headers.get('authorization'));
   const saved=await checkpoint.load(body.duelId,identity);
   if(!saved)return json({error:'No saved RPG duel for this account'},404);
   const session=await recoverSession(db,upgradeRpgSession(saved));
   classic.sessions.set(session.token,session);
   return json({token:session.token,...classic.response(session),resumed:true,
    cloudSaved:session.checkpointRevision===session.revision});
  }

  const token=request.headers.get('X-Duel-Token');
  const {storedRevision}=await loadInto(db,'classic',classic,token);
  const session=classic.sessions.get(token);
  if(session.rpgLocalOnly||session.checkpointDuelId)upgradeRpgSession(session);
  if(request.method==='GET'&&action==='state'){
   const state=classic.response(session);
   if(session.checkpointOwner){
    state.cloudSaved=session.checkpointRevision===session.revision;
   }else if(session.rpgLocalOnly){
    state.cloudSaved=false;
    state.cloudError='Sign in to RPG Cloud to synchronize battle saves across devices.';
   }
   return json(state);
  }
  if(request.method==='POST'&&action==='action'){
   const body=await readBody(request);
   const identity=session.checkpointOwner?
    await checkpoint.identify(request.headers.get('authorization')):null;
   if(session.checkpointOwner&&identity.userId!==session.checkpointOwner)
    return json({error:'Unauthorized RPG duel account'},401);
   const response=classic.action(token,body.command,body.revision);
   if(identity){
    try {await checkpoint.save(session,identity);response.cloudSaved=true;}
    catch(error){response.cloudSaved=false;response.cloudError='Cloud checkpoint pending: '+error.message;}
   } else if(session.rpgLocalOnly){
    response.cloudSaved=false;
    response.cloudError='Sign in to RPG Cloud for cross-device battle saves.';
   }
   await putSession(db,'classic',token,session,storedRevision);
   return json(response);
  }
  return json({error:'Unknown Classic API endpoint'},404);
 }catch(error){return errorResponse(error);}
}
