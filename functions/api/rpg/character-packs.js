export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const rosterUrl = new URL(request.url);
  rosterUrl.pathname = '/rpg-character-packs.public.json';
  const asset = await env.ASSETS.fetch(rosterUrl);
  if (!asset.ok) {
    return Response.json(
      { error: 'Public RPG roster asset is unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const headers = new Headers(asset.headers);
  headers.set('Cache-Control', 'no-store');
  return new Response(request.method === 'HEAD' ? null : asset.body, {
    status: asset.status,
    headers
  });
}
