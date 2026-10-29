function isSafePublicKey(value) {
  const key = String(value || '').trim();
  if (key.startsWith('sb_publishable_')) return true;
  // Keep compatibility with Supabase's legacy anon key format, but never expose service_role.
  try {
    const payload = key.split('.')[1];
    if (!payload) return false;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.role === 'anon';
  } catch {
    return false;
  }
}

export async function onRequest({ env }) {
  const url = String(env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = String(env.SUPABASE_PUBLISHABLE_KEY || '').trim();
  let validUrl = false;
  try {
    const parsed = new URL(url);
    validUrl = parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
  } catch {}

  if (!validUrl || !isSafePublicKey(key)) {
    return Response.json({ enabled: false }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  }

  return Response.json({ enabled: true, url, key }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
