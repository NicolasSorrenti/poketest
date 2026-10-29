const BACKEND_ORIGIN = 'https://poketest-4y5u.onrender.com';

export async function onRequest({ request }) {
  const incoming = new URL(request.url);
  const originHeader = request.headers.get('Origin');
  if (originHeader) {
    try {
      if (new URL(originHeader).origin !== incoming.origin) {
        return Response.json({ error: 'Origin not allowed' }, { status: 403 });
      }
    } catch {
      return Response.json({ error: 'Invalid origin' }, { status: 403 });
    }
  }

  const target = new URL(incoming.pathname + incoming.search, BACKEND_ORIGIN);
  const headers = new Headers(request.headers);
  // The Node API uses a same-host Origin check. The Pages Function has already
  // enforced same-origin requests, so remove Origin before proxying upstream.
  headers.delete('origin');
  headers.delete('host');
  headers.delete('content-length');

  const init = { method: request.method, headers, redirect: 'manual' };
  if (request.method !== 'GET' && request.method !== 'HEAD') init.body = request.body;

  try {
    return await fetch(new Request(target, init));
  } catch {
    return Response.json(
      { error: 'Poketest API is temporarily unavailable.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
