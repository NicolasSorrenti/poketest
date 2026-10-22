'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {ClassicLocalService,deckOptions}=require('./classic_local_service');
const {ClassicOnlineService}=require('./classic_online_service');
const {RpgDuelCheckpoint}=require('./rpg_duel_checkpoint');
const root=__dirname;
const port=Number(process.env.PORT||8000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'};
const classic=new ClassicLocalService();
const online=new ClassicOnlineService();
const rpgDuels=new RpgDuelCheckpoint();
const {CubeService}=require('./cube_service');
const cube=new CubeService();
const {CubeRoomService}=require('./cube_room_service');
const cubeRooms=new CubeRoomService({classic,online});
const {sendCardImage}=require('./cube_card_images');
const sendJSON=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
async function parseJSON(req,maxBytes=65536){return new Promise((resolve,reject)=>{
 let text='';req.on('data',chunk=>{text+=chunk;if(text.length>maxBytes){reject(Error('Request too large'));req.destroy();}});
 req.on('end',()=>{try{resolve(text?JSON.parse(text):{});}catch{reject(Error('Malformed JSON'));}});req.on('error',reject);
});}
async function api(req,res,pathName,url){
 // Prevent malicious origins from sending write requests to the local server.
 const origin=req.headers.origin;
 if(origin){let u;try{u=new URL(origin);}catch{sendJSON(res,403,{error:'Invalid origin'});return;}
  if(u.host!==req.headers.host||!['http:','https:'].includes(u.protocol)){sendJSON(res,403,{error:'Origin not allowed'});return;}}
 try{
  if(pathName==='/api/classic/decks'&&req.method==='GET')return sendJSON(res,200,{decks:deckOptions()});
  if(pathName==='/api/classic/card-pool'&&req.method==='GET')return sendJSON(res,200,{cards:classic.cardPool()});
  if(pathName==='/api/classic/decklist'&&req.method==='GET')return sendJSON(res,200,{cards:classic.decklist(url.searchParams.get('id'))});
  if(pathName==='/api/classic/create'&&req.method==='POST'){
   const params=await parseJSON(req);
   if(!params.rpgDuelId)return sendJSON(res,200,classic.create(params));
   if(!rpgDuels.validId(params.rpgDuelId))return sendJSON(res,400,{error:'Invalid RPG duel ID'});
   const identity=req.headers.authorization?await rpgDuels.identify(req.headers.authorization):null;
   if(identity){
    const live=[...classic.sessions.values()].find(s=>s.checkpointOwner===identity.userId&&s.checkpointDuelId===params.rpgDuelId);
    const old=live||await rpgDuels.load(params.rpgDuelId,identity);
    if(old){classic.sessions.set(old.token,old);return sendJSON(res,200,{token:old.token,...classic.response(old),cloudSaved:true,resumed:true});}
   }
   const created=classic.create(params),session=classic.session(created.token);
   if(identity){
    session.checkpointOwner=identity.userId;session.checkpointDuelId=params.rpgDuelId;
    try{await rpgDuels.save(session,identity);created.cloudSaved=true;}
    catch(error){created.cloudSaved=false;created.cloudError='Cloud checkpoint unavailable. Battle remains active on this server.';}
   }
   return sendJSON(res,200,created);
  }
  if(pathName==='/api/classic/rpg/resume'&&req.method==='POST'){
   const params=await parseJSON(req);
   if(!rpgDuels.validId(params.duelId))return sendJSON(res,400,{error:'Invalid RPG duel ID'});
   const identity=await rpgDuels.identify(req.headers.authorization);
   const live=[...classic.sessions.values()].find(s=>s.checkpointOwner===identity.userId&&s.checkpointDuelId===params.duelId);
   const snapshot=live||await rpgDuels.load(params.duelId,identity);
   if(!snapshot)return sendJSON(res,404,{error:'No saved RPG duel for this account'});
   classic.sessions.set(snapshot.token,snapshot);
   return sendJSON(res,200,{token:snapshot.token,...classic.response(snapshot),cloudSaved:true,resumed:true});
  }
  const token=req.headers['x-duel-token'];
  if(typeof token!=='string'||!token){sendJSON(res,401,{error:'Missing duel token'});return;}
  if(pathName==='/api/classic/state'&&req.method==='GET')return sendJSON(res,200,classic.state(token));
  if(pathName==='/api/classic/action'&&req.method==='POST'){
   const session=classic.session(token);
   const identity=session.checkpointOwner?await rpgDuels.identify(req.headers.authorization):null;
   if(session.checkpointOwner&&session.checkpointOwner!==identity.userId)throw Error('Unauthorized RPG duel account');
   const body=await parseJSON(req);
   const result=classic.action(token,body.command,body.revision);
   if(identity){
    try{await rpgDuels.save(session,identity);result.cloudSaved=true;}
    catch(error){
     result.cloudSaved=false;
     result.cloudError=error.code==='40001'?'Battle checkpoint conflict with another device.':'Cloud checkpoint failed. Progress is still active on this server.';
    }
   }
   return sendJSON(res,200,result);
  }
  return sendJSON(res,404,{error:'Unknown Classic API endpoint'});
 }catch(error){const msg=String(error.message||'Unknown error');const status=/Unauthorized|token|session|Sign in|auth|login/i.test(msg)?401:/Stale match revision|CONFLICT/i.test(msg)?409:400;return sendJSON(res,status,{error:msg});}
}
async function onlineAPI(req,res,pathName,url){
 const origin=req.headers.origin;
 if(origin){let u;try{u=new URL(origin);}catch{sendJSON(res,403,{error:'Invalid origin'});return;}
  if(u.host!==req.headers.host||!['http:','https:'].includes(u.protocol)){sendJSON(res,403,{error:'Origin not allowed'});return;}}
 try{
  if(pathName==='/api/online/decks'&&req.method==='GET')return sendJSON(res,200,{decks:deckOptions()});
  if(pathName==='/api/online/create'&&req.method==='POST')return sendJSON(res,200,online.create(await parseJSON(req)));
  if(pathName==='/api/online/join'&&req.method==='POST')return sendJSON(res,200,online.join(await parseJSON(req)));
  if(pathName==='/api/online/watch'&&req.method==='POST')return sendJSON(res,200,online.watch(await parseJSON(req)));
  const token=req.headers['x-duel-token'];
  if(typeof token!=='string'||!token)return sendJSON(res,401,{error:'Missing duel token'});
  if(pathName==='/api/online/state'&&req.method==='GET')return sendJSON(res,200,online.state(url.searchParams.get('code'),token));
  if(pathName==='/api/online/chat'&&req.method==='POST'){const body=await parseJSON(req);return sendJSON(res,200,online.chatMessage(body.code,token,body));}
  if(pathName==='/api/online/playmat'&&req.method==='GET')return sendJSON(res,200,online.getPlaymat(url.searchParams.get('code'),token,Number(url.searchParams.get('side'))));
  if(pathName==='/api/online/playmat'&&req.method==='POST'){
   const body=await parseJSON(req,240000);
   return sendJSON(res,200,online.setPlaymat(body.code,token,body));
  }
  if(['/api/online/ready','/api/online/deck','/api/online/name','/api/online/start','/api/online/action','/api/online/leave'].includes(pathName)&&req.method==='POST'){
   const body=await parseJSON(req);
   const result=pathName.endsWith('/ready')?online.ready(body.code,token,body):pathName.endsWith('/deck')?online.changeDeck(body.code,token,body):pathName.endsWith('/name')?online.changeName(body.code,token,body):pathName.endsWith('/start')?online.start(body.code,token,body):pathName.endsWith('/leave')?online.leave(body.code,token,body):online.action(body.code,token,body);
   return sendJSON(res,200,result);
  }
  return sendJSON(res,404,{error:'Unknown Online API endpoint'});
 }catch(error){const msg=String(error.message||'Unknown error');
  const status=/Spectators cannot/i.test(msg)?403:/Unauthorized|token/i.test(msg)?401:/Playmat cooldown|Stale match revision/.test(msg)?409:/Room not found|expired/.test(msg)?404:400;
  return sendJSON(res,status,{error:msg});}
}
async function cubeAPI(req,res,pathName){
 const origin=req.headers.origin;
 if(origin){let u;try{u=new URL(origin);}catch{sendJSON(res,403,{error:'Invalid origin'});return;}
 if(u.host!==req.headers.host||!['http:','https:'].includes(u.protocol)){sendJSON(res,403,{error:'Origin not allowed'});return;}}
 try{
  if(pathName==='/api/cube/presets'&&req.method==='GET')return sendJSON(res,200,{presets:require('./cube_presets').PRESETS});
  if(pathName==='/api/cube/create'&&req.method==='POST')return sendJSON(res,200,cube.create(await parseJSON(req)));
  const token=req.headers['x-cube-token'];
  if(typeof token!=='string'||!token)return sendJSON(res,401,{error:'Missing cube token'});
  if(pathName==='/api/cube/state'&&req.method==='GET')return sendJSON(res,200,cube.sync(token,classic));
  if(pathName==='/api/cube/next'&&req.method==='POST'){
   const body=await parseJSON(req);return sendJSON(res,200,cube.next(token,body.revision,classic));
  }
  if(pathName==='/api/cube/start'&&req.method==='POST'){
   const body=await parseJSON(req);return sendJSON(res,200,cube.start(token,body.deck,body.revision,classic,body.difficulty));
  }
  if(pathName==='/api/cube/pick'&&req.method==='POST'){
   const body=await parseJSON(req);return sendJSON(res,200,cube.pick(token,body.id,body.revision));
  }
  return sendJSON(res,404,{error:'Unknown Cube API endpoint'});
 }catch(e){sendJSON(res,/token|expired/i.test(String(e.message))?401:/Stale draft/.test(String(e.message))?409:400,{error:String(e.message||e)});}
}
async function cubeRoomAPI(req,res,pathName){
 const origin=req.headers.origin;
 if(origin){let u;try{u=new URL(origin);}catch{sendJSON(res,403,{error:'Invalid origin'});return;}
  if(u.host!==req.headers.host||!['http:','https:'].includes(u.protocol)){
   sendJSON(res,403,{error:'Origin not allowed'});return;
  }}
 try{
  if(pathName==='/api/cube-room/create'&&req.method==='POST')
   return sendJSON(res,200,cubeRooms.create(await parseJSON(req)));
  if(pathName==='/api/cube-room/join'&&req.method==='POST')
   return sendJSON(res,200,cubeRooms.join(await parseJSON(req)));
  const token=req.headers['x-cube-room-token'];
  const code=req.headers['x-cube-room-code'];
  if(typeof token!=='string'||!token||typeof code!=='string'||!code)
   return sendJSON(res,401,{error:'Cube room credentials required'});
  if(pathName==='/api/cube-room/state'&&req.method==='GET')
   return sendJSON(res,200,cubeRooms.state(code,token));
  if(req.method==='POST'&&pathName==='/api/cube-room/watch'){
   return sendJSON(res,200,cubeRooms.watch(code,token,await parseJSON(req)));
  }
  if(req.method==='POST'&&pathName==='/api/cube-room/chat'){
   return sendJSON(res,200,cubeRooms.chatMessage(code,token,await parseJSON(req)));
  }
  if(req.method==='POST'&&['ready','start','pick','submit'].some(action=>pathName==='/api/cube-room/'+action)){
   const body=await parseJSON(req);
   const result=pathName.endsWith('/ready')?cubeRooms.ready(code,token,body.ready):
    pathName.endsWith('/start')?cubeRooms.start(code,token):
    pathName.endsWith('/pick')?cubeRooms.pick(code,token,body):
    cubeRooms.submit(code,token,body.deck);
   return sendJSON(res,200,result);
  }
  return sendJSON(res,404,{error:'Unknown Cube room endpoint'});
 }catch(e){
  const msg=String(e.message||e);
  return sendJSON(res,/Unauthorized|credentials/i.test(msg)?401:/Stale/i.test(msg)?409:/not found|expired/i.test(msg)?404:400,{error:msg});
 }
}
const server=http.createServer((req,res)=>{
 let url;try{url=new URL(req.url,'http://localhost');}catch{res.writeHead(400).end('Bad request');return;}
 let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{res.writeHead(400).end('Bad request');return;}
 if(pathname.split('/').includes('..')){res.writeHead(403).end('Forbidden');return;}
 if(pathname==='/api/rpg-cloud/config'){
    if(req.method!=='GET')return sendJSON(res,405,{error:'Method not allowed'});
    const rawUrl=process.env.SUPABASE_URL||'';
    const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY||'';
    let enabled=false;
    try{
      const origin=new URL(rawUrl);
      enabled=origin.protocol==='https:'&&origin.hostname.endsWith('.supabase.co')&&!!key&&!key.startsWith('sb_secret_');
      if(enabled&&key.split('.').length===3){
        const payload=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString('utf8'));
        enabled=payload.role==='anon';
      }
    }catch{enabled=false;}
    return sendJSON(res,200,enabled?{enabled:true,url:rawUrl.replace(/\/$/,''),key}:{enabled:false});
  }
 if(pathname==='/'){res.writeHead(302,{'Location':'/play.html','Cache-Control':'no-store'});res.end();return;}
 if(pathname.startsWith('/api/cube-card-image/')){sendCardImage(req,res,pathname);return;}
 if(pathname.startsWith('/api/cube-room/')){cubeRoomAPI(req,res,pathname);return;}
 if(pathname.startsWith('/api/cube/')){cubeAPI(req,res,pathname);return;}
 if(pathname.startsWith('/api/classic/')){api(req,res,pathname,url);return;}
 if(pathname.startsWith('/api/online/')){onlineAPI(req,res,pathname,url);return;}
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end('Method not allowed');return;}
 // Public hosting: never expose source maps, logs, archives, env files or server code over static HTTP.
 if(!(pathname==='/'||/\.(html|js|css|png|jpg|jpeg|svg|webp)$/i.test(pathname)||(/^\/cards\/[a-z0-9_-]+\.json$/i.test(pathname))||pathname==='/rpg-assets/reactions/manifest.json')){res.writeHead(404).end('Not found');return;}
 const publicScripts=new Set(['cube_builder_ui.js','cube_room_client.js','cube_client.js','authentic_decks.js','card_corrections.js','classic_format.js','classic_live.js','core_rules.js','decision_core.js','decision_session.js','duel_quick_ui.js','battle_decision_ui.js','duel_experience_ui.js','battle_presentation_ui.js','duel_shared_components.js','duel_action_rail.js','duel_playmats.js','mat_generator.js','match_log_ui.js','rpg_match_chat.js','cube_pool_viewer.js','cube_analysis_ui.js','rpg_npc_deck_progression.js','rpg_match_reactions.js','rpg_status.js','rpg_discreet.js','rpg_discreet_avatars.js','rpg_cloud_save.js','rpg_deck_studio.js','deck_builder.js','deck_builder_core.js','engine.js','legacy_choice_bridge.js','online.js','target_choice_bridge.js','trainer_rules_v058.js','trainer_rules_v059.js','trainer_rules_v060.js','trainer_rules_v061.js','trainer_rules_v062.js','trainer_rules_v063.js','trainer_rules_v064.js']);
 if(pathname==='/rpg.js'||pathname==='/rpg_narrative_pack.js'||pathname==='/rpg_sol_character.js'||pathname==='/rpg_character_packs.generated.js'||pathname==='/rpg_mandatory_events.js'||pathname==='/rpg_season_events.js'||pathname==='/rpg_side_quests.js'||pathname==='/rpg_bond_chapters.js'||pathname==='/rpg_partner_decks.js'||pathname==='/rpg_partner_deck_studio.js'||pathname==='/rpg_bond_rewards.js'||pathname==='/rpg_conversations.js'||pathname==='/rpg_audio.js'||pathname==='/rpg_render_perf.js'||pathname==='/rpg_legacy_scenes.js'||pathname==='/rpg_story.js'||pathname==='/rpg_schedules.js'||pathname==='/rpg_duel_bridge.js'||pathname==='/rpg_world.js'||pathname==='/rpg_rival_arc.js'||pathname==='/rpg_tournaments.js'||pathname==='/rpg_competitive_loop.js'||pathname==='/rpg_community.js'||pathname==='/rpg_consequences.js'||pathname==='/rpg_strategy.js'||pathname==='/rpg_reactivity.js'||pathname==='/rpg_epilogue.js'||pathname==='/rpg_appointments.js'||pathname==='/rpg_intentions.js'||pathname==='/rpg_cg_gallery.js'||pathname==='/rpg_daily_planner.js'||pathname==='/rpg_social_activities.js'||pathname==='/rpg_planned_dates.js'||pathname==='/rpg_preduel.js'||pathname==='/rpg_situations.js'||pathname==='/rpg_season_journey.js'||pathname==='/rpg_tutorials.js'||pathname==='/rpg_collection.js'||pathname==='/rpg_dialogue.js'||pathname==='/rpg_time_transitions.js'||pathname==='/rpg_ui_motion.js'||pathname==='/rpg_character_motion.js'||pathname==='/rpg_victory_presentation.js'||pathname==='/rpg_tournament_presentation.js')publicScripts.add(pathname.slice(1));
 if(pathname.endsWith('.js')&&!publicScripts.has(pathname.slice(1))){res.writeHead(404).end('Not found');return;}
 const target=path.resolve(root,'.'+pathname,pathname.endsWith('/')?'index.html':'');
 if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403).end('Forbidden');return;}
 fs.stat(target,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(target).pipe(res);
 });
});
if(require.main===module){const host=process.env.HOST||'0.0.0.0';server.listen(port,host,()=>console.log(`Neo Campus ready: http://localhost:${port}/online.html (host ${host}, invite-code duels)`));}
module.exports={server,classic,online,cube,cubeRooms};
