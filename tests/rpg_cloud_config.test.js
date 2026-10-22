'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {server}=require('../server');

async function withServer(env,callback){
 const keys=['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_ANON_KEY'];
 const old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 for(const key of keys)delete process.env[key];
 for(const [key,value] of Object.entries(env))process.env[key]=value;
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  return await callback(base);
 }finally{
  await new Promise(resolve=>server.close(resolve));
  for(const key of keys){
   if(old[key]===undefined)delete process.env[key];
   else process.env[key]=old[key];
  }
 }
}

test('server disables cloud config without Supabase credentials',async()=>{
 await withServer({},async(base)=>{
  const res=await fetch(base+'/api/rpg-cloud/config');
  assert.equal(res.status,200);
  assert.deepEqual(await res.json(),{enabled:false});
 });
});

test('server exposes only a safe publishable key and project URL',async()=>{
 await withServer({
  SUPABASE_URL:'https://project-ref.supabase.co/',
  SUPABASE_PUBLISHABLE_KEY:'sb_publishable_example'
 },async(base)=>{
  const res=await fetch(base+'/api/rpg-cloud/config');
  assert.equal(res.status,200);
  assert.deepEqual(await res.json(),{
   enabled:true,url:'https://project-ref.supabase.co',key:'sb_publishable_example'
  });
  assert.equal((await fetch(base+'/rpg_cloud_save.js')).status,200);
  assert.equal((await fetch(base+'/rpg_cloud_save.css')).status,200);
  assert.equal((await fetch(base+'/RPG_CLOUD_SAVES_SETUP.md')).status,404);
 });
});

test('server rejects secret and legacy service_role API keys',async()=>{
 const legacy='eyJhbGciOiJIUzI1NiJ9.'+
  Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.fake';
 for(const key of ['sb_secret_private_example',legacy]){
  await withServer({SUPABASE_URL:'https://project-ref.supabase.co',SUPABASE_ANON_KEY:key},async(base)=>{
   const res=await fetch(base+'/api/rpg-cloud/config');
   assert.deepEqual(await res.json(),{enabled:false});
  });
 }
});
