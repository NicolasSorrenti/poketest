// Pages bundles the legacy CommonJS game modules into an ES module.
// esbuild leaves Node built-in require() calls dynamic. Provide only the
// known built-in crypto module; do not expose arbitrary module loading.
import * as nodeCrypto from 'node:crypto';
if(typeof globalThis.require!=='function') {
 globalThis.require = name => {
  if(name==='node:crypto'||name==='crypto')return nodeCrypto;
  throw new Error('Unsupported Node module in Cloudflare game bundle: '+name);
 };
}
