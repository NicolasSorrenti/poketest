// End-to-end HTTP smoke test for Cloudflare-native Cube and Classic APIs.
// Run against an isolated preview deployment; it creates temporary D1 sessions.
const base=process.env.PAGES_URL||'https://c3a8c0a8.poketest-cloudflare-test.pages.dev';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function call(path,{method='GET',body,headers={}}={}){
 const res=await fetch(base+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});
 const raw=await res.text();let data;
 try{data=JSON.parse(raw);}catch{throw Error(path+': expected JSON; HTTP '+res.status+' '+raw.slice(0,180));}
 if(!res.ok)throw Error(path+': HTTP '+res.status+' '+JSON.stringify(data).slice(0,220));
 return data;
}
let presets;
for(let i=0;i<35;i++){
 try{presets=await call('/api/cube/presets');if(presets.presets?.length>=5)break;}
 catch(error){if(i===34)throw error;}
 await sleep(7000);
}
if(!presets?.presets?.length)throw Error('Cube presets unavailable');
const created=await call('/api/cube/create',{method:'POST',body:{preset:'balanced',difficulty:1}});
if(!created.token||!created.pack?.length||created.revision!==0)throw Error('Invalid Cube start');
const cubeHeaders={'X-Cube-Token':created.token};
const state=await call('/api/cube/state',{headers:cubeHeaders});
if(state.revision!==0||!state.pack?.length)throw Error('Cube state did not persist');
const next=await call('/api/cube/pick',{method:'POST',headers:cubeHeaders,body:{id:state.pack[0].id,revision:state.revision}});
if(next.revision!==1)throw Error('Cube pick failed to persist');
const resumed=await call('/api/cube/state',{headers:cubeHeaders});
if(resumed.revision!==1)throw Error('Cube pick lost across requests');
const decks=await call('/api/classic/decks');
if(!decks.decks?.some(d=>d.id==='blackout'))throw Error('Classic deck catalog missing');
const pool=await call('/api/classic/card-pool');
if(!pool.cards?.length||pool.cards.length<500)throw Error('Card pool not loaded');
const duel=await call('/api/classic/create',{method:'POST',body:{deck:'blackout',opponent:'brushfire',difficulty:1}});
if(!duel.token||duel.revision!==0)throw Error('Classic duel not created');
const ongoing=await call('/api/classic/state',{headers:{'X-Duel-Token':duel.token}});
if(ongoing.revision!==0||!ongoing.view)throw Error('Classic game state not persisted');
const duelHeaders={'X-Duel-Token':duel.token};
const catalog=new Map(pool.cards.map(c=>[c.id,c]));
const basic=duel.view.players[0].hand.findIndex(id=>{
 const c=catalog.get(id);return c?.supertype==='Pokémon'&&(c.subtypes||[]).some(s=>s==='Basic'||s==='Baby');
});
if(basic<0)throw Error('Opening hand missing basic Pokemon');
let played=await call('/api/classic/action',{
 method:'POST',headers:duelHeaders,
 body:{revision:duel.revision,command:{type:'setup_select',payload:{handIndex:basic}}}
});
if(played.revision!==1)throw Error('Classic setup action not persisted');
let checkpoint=await call('/api/classic/state',{headers:duelHeaders});
if(checkpoint.revision!==1)throw Error('Classic action lost across requests');
played=await call('/api/classic/action',{
 method:'POST',headers:duelHeaders,
 body:{revision:played.revision,command:{type:'setup_confirm'}}
});
if(!played.view?.phase)throw Error('Classic setup confirmation did not finish');

console.log('PASS: Cloudflare Cube pick/state, catalog, Classic duel setup/actions and D1 persistence');
