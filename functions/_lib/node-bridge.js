// Bridge the legacy CommonJS engine's Node built-ins into Pages Functions.
// Avoid passing Cloudflare host-native methods through unbound references:
// doing so can throw "Illegal invocation" at duel/session creation.
import * as nodeCrypto from 'node:crypto';
import * as perfHooks from 'node:perf_hooks';
import { Buffer } from 'node:buffer';

function randomBytes(size) {
 if (!Number.isSafeInteger(size) || size < 0 || size > 65536)
  throw new RangeError('Invalid random byte count');
 const bytes = new Uint8Array(size);
 globalThis.crypto.getRandomValues(bytes);
 return Buffer.from(bytes);
}
const cryptoBridge = {...nodeCrypto, randomBytes};
const performanceBridge = {
 ...perfHooks,
 performance: {
  ...perfHooks.performance,
  now: () => globalThis.performance.now()
 }
};
if (typeof globalThis.require !== 'function') {
 globalThis.require = name => {
  if (name === 'node:crypto' || name === 'crypto') return cryptoBridge;
  if (name === 'node:perf_hooks' || name === 'perf_hooks') return performanceBridge;
  throw new Error('Unsupported Node module in Cloudflare game bundle: ' + name);
 };
}
