// Cloudflare-native card artwork proxy. Upstream hosts come exclusively from
// the vetted historical catalog; player input cannot choose an arbitrary URL.
import imagePackage from '../../../cube_card_images.js';
const {sourceUrls}=imagePackage;
const ID=/^(?:base[1-5]|basep|gym[12]|neo[1-4])-[0-9]{1,4}$/;
const types=new Set(['image/webp','image/png','image/jpeg']);
export async function onRequest({request}) {
 if(request.method!=='GET'&&request.method!=='HEAD')
  return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 const id=decodeURIComponent(new URL(request.url).pathname.split('/').pop());
 if(!ID.test(id)) return new Response('Unknown card image',{status:404});
 for(const url of sourceUrls(id)){
  try {
   const r=await fetch(url,{redirect:'error',headers:{Accept:'image/webp,image/png,image/jpeg'},
    signal:AbortSignal.timeout(8000)});
   if(!r.ok)continue;
   const type=(r.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
   if(!types.has(type))continue;
   const length=Number(r.headers.get('content-length')||0);
   if(length>1048576)continue;
   const data=new Uint8Array(await r.arrayBuffer());
   if(!data.byteLength||data.byteLength>1048576)continue;
   if(type==='image/png' && (data[0]!==0x89||data[1]!==0x50))continue;
   if(type==='image/webp' && String.fromCharCode(...data.slice(0,4))!=='RIFF')continue;
   if(type==='image/jpeg' && (data[0]!==0xff||data[1]!==0xd8))continue;
   return new Response(request.method==='HEAD'?null:data,{status:200,headers:{
    'Content-Type':type,'Cache-Control':'public,max-age=86400',
    'X-Content-Type-Options':'nosniff'
   }});
  }catch{}
 }
 return new Response('Card image unavailable',{status:502,headers:{'Cache-Control':'no-store'}});
}
