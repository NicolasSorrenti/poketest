// Cloudflare Pages serves static assets; the authoritative Classic duel remains
// on the Node backend. Proxy its API on the same origin so duel session tokens,
// authentication headers and RPG checkpoints keep working during migration.
// Set CLASSIC_BACKEND_ORIGIN to the reachable HTTPS Node service to override.
const DEFAULT_BACKEND = 'https://poketest-4y5u.onrender.com';

export async function onRequest({ request, env }) {
  const origin = String(env.CLASSIC_BACKEND_ORIGIN || DEFAULT_BACKEND).replace(/\/+$/, '');
  let backend;
  try {
    backend = new URL(origin);
    if (backend.protocol !== 'https:' || backend.username || backend.password ||
        backend.pathname !== '/' || backend.search || backend.hash) throw new Error('Invalid origin');
  } catch {
    return Response.json({ error: 'Classic duel backend is not configured correctly.' }, { status: 503 });
  }

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, backend.origin);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('cf-connecting-ip');
  headers.delete('cf-ipcountry');
  headers.delete('cf-ray');
  headers.delete('x-forwarded-for');
  headers.delete('x-forwarded-proto');
  headers.set('accept', 'application/json');
  try {
    const upstream = await fetch(new Request(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
      duplex: 'half'
    }));
    if (upstream.status >= 300 && upstream.status < 400) {
      return Response.json({ error: 'Classic duel backend redirected unexpectedly.' }, { status: 502 });
    }
    const type = upstream.headers.get('content-type') || '';
    if (!type.toLowerCase().includes('application/json')) {
      return Response.json({
        error: 'Classic duel backend did not return JSON. Check the Render service and Cloudflare backend configuration.'
      }, { status: 502 });
    }
    const responseHeaders = new Headers();
    responseHeaders.set('content-type', type);
    responseHeaders.set('cache-control', 'no-store');
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({
      error: 'Classic duel backend is unavailable. Check that the Node server is running.'
    }, { status: 503 });
  }
}
