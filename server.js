'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {ClassicLocalService,deckOptions}=require('./classic_local_service');
const {ClassicOnlineService}=require('./classic_online_service');
const root=__dirname;
const port=Number(process.env.PORT||8000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'};
const classic=new ClassicLocalService();
const online=new ClassicOnlineService();
const sendJSON=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
async function parseJSON(req){return new Promise((resolve,reject)=>{
 let text='';req.on('data',chunk=>{text+=chunk;if(text.length>65536){reject(Error('Request too large'));req.destroy();}});
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
  if(pathName==='/api/classic/create'&&req.method==='POST')return sendJSON(res,200,classic.create(await parseJSON(req)));
  const token=req.headers['x-duel-token'];
  if(typeof token!=='string'||!token){sendJSON(res,401,{error:'Missing duel token'});return;}
  if(pathName==='/api/classic/state'&&req.method==='GET')return sendJSON(res,200,classic.state(token));
  if(pathName==='/api/classic/action'&&req.method==='POST'){
   const body=await parseJSON(req);return sendJSON(res,200,classic.action(token,body.command,body.revision));
  }
  return sendJSON(res,404,{error:'Unknown Classic API endpoint'});
 }catch(error){const msg=String(error.message||'Unknown error');const status=/Unauthorized|token|session/i.test(msg)?401:/Stale match revision/.test(msg)?409:400;return sendJSON(res,status,{error:msg});}
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
  if(['/api/online/ready','/api/online/deck','/api/online/name','/api/online/start','/api/online/action','/api/online/leave'].includes(pathName)&&req.method==='POST'){
   const body=await parseJSON(req);
   const result=pathName.endsWith('/ready')?online.ready(body.code,token,body):pathName.endsWith('/deck')?online.changeDeck(body.code,token,body):pathName.endsWith('/name')?online.changeName(body.code,token,body):pathName.endsWith('/start')?online.start(body.code,token,body):pathName.endsWith('/leave')?online.leave(body.code,token,body):online.action(body.code,token,body);
   return sendJSON(res,200,result);
  }
  return sendJSON(res,404,{error:'Unknown Online API endpoint'});
 }catch(error){const msg=String(error.message||'Unknown error');
  const status=/Unauthorized|token/i.test(msg)?401:/Stale match revision/.test(msg)?409:/Room not found|expired/.test(msg)?404:400;
  return sendJSON(res,status,{error:msg});}
}
const server=http.createServer((req,res)=>{
 let url;try{url=new URL(req.url,'http://localhost');}catch{res.writeHead(400).end('Bad request');return;}
 let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{res.writeHead(400).end('Bad request');return;}
 if(pathname.split('/').includes('..')){res.writeHead(403).end('Forbidden');return;}
 if(pathname.startsWith('/api/classic/')){api(req,res,pathname,url);return;}
 if(pathname.startsWith('/api/online/')){onlineAPI(req,res,pathname,url);return;}
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end('Method not allowed');return;}
 // Public hosting: never expose source maps, logs, archives, env files or server code over static HTTP.
 if(!(pathname==='/'||/\.(html|js|css|png|jpg|jpeg|svg|webp)$/i.test(pathname)||(/^\/cards\/[a-z0-9_-]+\.json$/i.test(pathname)))){res.writeHead(404).end('Not found');return;}
 const publicScripts=new Set(['authentic_decks.js','card_corrections.js','classic_format.js','classic_live.js','core_rules.js','decision_core.js','decision_session.js','duel_quick_ui.js','battle_decision_ui.js','duel_experience_ui.js','battle_presentation_ui.js','deck_builder.js','deck_builder_core.js','engine.js','legacy_choice_bridge.js','online.js','target_choice_bridge.js','trainer_rules_v058.js','trainer_rules_v059.js','trainer_rules_v060.js','trainer_rules_v061.js','trainer_rules_v062.js','trainer_rules_v063.js','trainer_rules_v064.js']);
 if(pathname==='/rpg.js'||pathname==='/rpg_story.js'||pathname==='/rpg_schedules.js'||pathname==='/rpg_duel_bridge.js')publicScripts.add(pathname.slice(1));
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
module.exports={server,classic,online};
