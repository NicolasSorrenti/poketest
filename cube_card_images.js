'use strict';
// Only the historical card catalog can choose an upstream image URL.
// Clients supply a card ID, never a remote URL: no arbitrary image proxy/SSRF.
const {CATALOG}=require('./headless_duel');
const MAX_CACHE=240;
const MAX_IMAGE_BYTES=1024*1024;
const CARD_ID=/^(?:base[1-5]|basep|gym[12]|neo[1-4])-[0-9]{1,4}$/;
const MIME=new Set(['image/webp','image/png','image/jpeg']);
function sourceUrls(id){
 const c=CATALOG.get(id);
 if(!c||!CARD_ID.test(id))return [];
 const primary=c.images?.small;
 const urls=[];
 if(typeof primary==='string'){
  try{
   const url=new URL(primary);
   if(url.protocol==='https:'&&url.hostname==='assets.tcgdex.net'&&
    /^\/en\/[a-z0-9/_.-]+\/low\.webp$/.test(url.pathname)&&!url.search)
    urls.push(url.toString());
  }catch{}
 }
 // Secondary historical-card CDN in case the TCGdex image is missing.
 const [set,no]=id.split('-');
 if(set&&no)urls.push('https://images.pokemontcg.io/'+set+'/'+Number(no)+'.png');
 return urls;
}
function createCubeImageStore({fetcher=globalThis.fetch,capacity=MAX_CACHE}={}){
 const cache=new Map(),pending=new Map();
 const get=async id=>{
  if(typeof id!=='string'||!CARD_ID.test(id)||!CATALOG.has(id)){
   const e=Error('Unknown card image');e.status=404;throw e;
  }
  const hit=cache.get(id);
  if(hit){cache.delete(id);cache.set(id,hit);return hit;}
  if(pending.has(id))return pending.get(id);
  const job=(async()=>{
   let last;
   for(const url of sourceUrls(id)){
    try{
     const response=await fetcher(url,{method:'GET',redirect:'error',
      headers:{Accept:'image/webp,image/png,image/jpeg'},
      signal:AbortSignal.timeout(8000)});
     if(!response.ok)throw Error('Upstream image status '+response.status);
     const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
     if(!MIME.has(type))throw Error('Upstream did not return an image');
     const length=Number(response.headers.get('content-length'));
     if(length>MAX_IMAGE_BYTES)throw Error('Upstream image too large');
     const body=Buffer.from(await response.arrayBuffer());
     if(!body.length||body.length>MAX_IMAGE_BYTES)throw Error('Invalid upstream image size');
     // Never treat HTML masquerading as image bytes as successful.
     if(type==='image/webp'&&body.toString('ascii',0,4)!=='RIFF')throw Error('Invalid WebP bytes');
     if(type==='image/png'&&body.toString('hex',0,8)!=='89504e470d0a1a0a')throw Error('Invalid PNG bytes');
     if(type==='image/jpeg'&&body.toString('hex',0,2)!=='ffd8')throw Error('Invalid JPEG bytes');
     const result={bytes:body,type};
     cache.set(id,result);
     while(cache.size>capacity)cache.delete(cache.keys().next().value);
     return result;
    }catch(e){last=e;}
   }
   const err=Error('Card image currently unavailable');err.status=502;err.cause=last;throw err;
  })();
  pending.set(id,job);
  try{return await job;}finally{pending.delete(id);}
 };
 return {get,sourceUrls,cache};
}
const images=createCubeImageStore();
async function sendCardImage(req,res,pathname){
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
 const id=pathname.slice('/api/cube-card-image/'.length);
 if(!CARD_ID.test(id)||!CATALOG.has(id)){res.writeHead(404).end('Unknown card image');return;}
 try{
  const image=await images.get(id);
  res.writeHead(200,{'Content-Type':image.type,'Content-Length':image.bytes.length,
   'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')res.end();else res.end(image.bytes);
 }catch(e){
  res.writeHead(e.status===404?404:502,{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'}).end(
   e.status===404?'Unknown card image':'Card image unavailable');
 }
}
module.exports={createCubeImageStore,sendCardImage,sourceUrls,images};
