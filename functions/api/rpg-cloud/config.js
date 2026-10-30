// Public Supabase client configuration; the publishable key is not a secret.
// Supabase row-level security and token verification protect user data.
export async function onRequestGet({env}){
 const url=String(env.SUPABASE_URL||'').replace(/\/$/,'');
 const key=env.SUPABASE_PUBLISHABLE_KEY||env.SUPABASE_ANON_KEY||'';
 const enabled=/^https:\/\/[^/]+\.supabase\.co$/.test(url)&&!!key&&!key.startsWith('sb_secret_');
 return Response.json(enabled?{enabled:true,url,key}:{enabled:false},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
