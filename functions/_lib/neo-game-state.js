// Cloudflare-native session storage for the original Classic and Cube engines.
// D1 is authoritative: never rely on Worker isolate globals for game state.
import classicPackage from '../../classic_local_service.js';
import cubePackage from '../../cube_service.js';
import presetsPackage from '../../cube_presets.js';
import checkpointPackage from '../../rpg_duel_checkpoint.js';
import rpgPackage from '../../rpg_cpu_config.js';

export const { ClassicLocalService, deckOptions } = classicPackage;
export const { CubeService } = cubePackage;
export const { listPresetSummaries } = presetsPackage;
export const { RpgDuelCheckpoint } = checkpointPackage;
export const { forRpgDuel, upgradeRpgSession } = rpgPackage;

const TABLE = `CREATE TABLE IF NOT EXISTS game_sessions (
 token TEXT PRIMARY KEY, kind TEXT NOT NULL, revision INTEGER NOT NULL,
 snapshot TEXT NOT NULL, updated INTEGER NOT NULL
)`;
const EXPIRES_MS = 90 * 60 * 1000;
export const json = (value, status = 200) => Response.json(value, {
 status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});
export function errorResponse(error) {
 const message = String(error?.message || error || 'Unknown game error');
 const status = /database is not configured|storage limit/i.test(message)?503:/missing.*token|unauthorized|session|token|sign in|login|credentials/i.test(message) ? 401 :
  /stale|revision|conflict/i.test(message) ? 409 : /expired|not found/i.test(message) ? 404 : 400;
 return json({error:message},status);
}
export function verifyOrigin(request) {
 const header=request.headers.get('origin');
 if(!header) return;
 const source=new URL(header),target=new URL(request.url);
 if(!['https:','http:'].includes(source.protocol)||source.host!==target.host)
  throw Error('Origin not allowed');
}
export async function readBody(request) {
 const length=Number(request.headers.get('content-length')||0);
 if(length>240000) throw Error('Request too large');
 const raw=await request.text();
 if(raw.length>240000) throw Error('Request too large');
 try {return raw?JSON.parse(raw):{};} catch {throw Error('Malformed JSON');}
}
export async function database(env) {
 if(!env.NEO_GAME_DB) throw Error('Cloudflare game session database is not configured');
 await env.NEO_GAME_DB.prepare(TABLE).run();
 return env.NEO_GAME_DB;
}
export async function getSession(db,kind,token) {
 if(typeof token!=='string'||token.length<20||token.length>256) throw Error('Missing or invalid session token');
 const row=await db.prepare('SELECT revision, snapshot, updated FROM game_sessions WHERE token = ? AND kind = ?')
  .bind(token,kind).first();
 if(!row||Date.now()-row.updated>EXPIRES_MS) throw Error('Unknown or expired session');
 const snapshot=JSON.parse(row.snapshot);
 if(snapshot.revision!==row.revision) throw Error('Session revision mismatch');
 return {snapshot,storedRevision:row.revision};
}
export async function putSession(db,kind,token,snapshot,storedRevision=null) {
 if(!snapshot||typeof snapshot!=='object'||(snapshot.token!==undefined&&snapshot.token!==token)||
    !Number.isSafeInteger(snapshot.revision)) throw Error('Invalid session snapshot');
 const serialized=JSON.stringify(snapshot), now=Date.now();
 if(serialized.length>1800000) throw Error('Session exceeds storage limit');
 if(storedRevision===null){
  await db.prepare('INSERT INTO game_sessions(token,kind,revision,snapshot,updated) VALUES(?,?,?,?,?)')
   .bind(token,kind,snapshot.revision,serialized,now).run();
  return;
 }
 const result=await db.prepare(
  'UPDATE game_sessions SET revision=?, snapshot=?, updated=? WHERE token=? AND kind=? AND revision=?'
 ).bind(snapshot.revision,serialized,now,token,kind,storedRevision).run();
 if(!result.meta?.changes) throw Error('Stale session revision — reload your game');
}
export async function storeNew(db,kind,service,token) {
 await putSession(db,kind,token,service.sessions.get(token));
}
export async function loadInto(db,kind,service,token) {
 const stored=await getSession(db,kind,token);
 service.sessions.set(token,stored.snapshot);
 return stored;
}
export const checkpointFor = env => new RpgDuelCheckpoint({settings:()=>env});
