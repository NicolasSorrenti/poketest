// Cloudflare Pages route for solo Cube drafts and tournaments.
// Uses the same original CubeService and ClassicLocalService as the Node server.
import {
 CubeService, ClassicLocalService, listPresetSummaries,
 database, json, errorResponse, verifyOrigin, readBody, storeNew, loadInto, putSession
} from '../../_lib/neo-game-state.js';

export async function onRequest({request,env}) {
 try {
  verifyOrigin(request);
  const url=new URL(request.url);
  const action=url.pathname.split('/').pop();
  if(action==='presets'&&request.method==='GET')return json({presets:listPresetSummaries()});
  const db=await database(env);
  const cube=new CubeService();
  const classic=new ClassicLocalService();
  if(action==='create'&&request.method==='POST'){
   const created=cube.create(await readBody(request));
   await storeNew(db,'cube',cube,created.token);
   return json(created);
  }
  const token=request.headers.get('X-Cube-Token');
  const {storedRevision}=await loadInto(db,'cube',cube,token);
  const session=cube.sessions.get(token);
  if(session.duelToken){
   await loadInto(db,'classic',classic,session.duelToken);
  }
  if(action==='state'&&request.method==='GET'){
   const response=cube.sync(token,classic);
   if(session.revision!==storedRevision)await putSession(db,'cube',token,session,storedRevision);
   return json(response);
  }
  if(request.method==='POST'&&action==='pick'){
   const body=await readBody(request);
   const response=cube.pick(token,body.id,body.revision);
   await putSession(db,'cube',token,session,storedRevision);
   return json(response);
  }
  if(request.method==='POST'&&action==='start'){
   const body=await readBody(request);
   const response=cube.start(token,body.deck,body.revision,classic,body.difficulty);
   await storeNew(db,'classic',classic,response.duelToken);
   await putSession(db,'cube',token,session,storedRevision);
   return json(response);
  }
  if(request.method==='POST'&&action==='next'){
   const body=await readBody(request);
   const response=cube.next(token,body.revision,classic);
   await storeNew(db,'classic',classic,response.duelToken);
   await putSession(db,'cube',token,session,storedRevision);
   return json(response);
  }
  return json({error:'Unknown Cube API endpoint'},404);
 }catch(error){return errorResponse(error);}
}
