// Pages bundles the legacy CommonJS game modules into an ES module.
// esbuild leaves Node built-in require() calls dynamic. Provide only the
// known built-in crypto module; do not expose arbitrary module loading.
import * as nodeCrypto from 'node:crypto';
import * as perfHooks from 'node:perf_hooks';
if(typeof globalThis.require!=='function') {
 globalThis.require = name => {
  if(name==='node:crypto'||name==='crypto')return nodeCrypto;
  if(name==='node:perf_hooks'||name==='perf_hooks')return perfHooks;
  throw new Error('Unsupported Node module in Cloudflare game bundle: '+name);
 };
}
