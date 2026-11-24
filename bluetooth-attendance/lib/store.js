// Storage layer. Picks, in order:
//  1. Upstash / Vercel KV REST   (UPSTASH_REDIS_REST_URL+TOKEN or KV_REST_API_URL+TOKEN)
//  2. Any Redis over TCP          (REDIS_URL or KV_URL)  e.g. Vercel's "Redis" integration
//  3. In-memory                   (ONLY for local dev; refused on Vercel because it can't work there)
const REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const TCP_URL = process.env.REDIS_URL || process.env.KV_URL;
const mem = global.__attmem || (global.__attmem = { kv: {}, h: {} });

const mode = () => (REST_URL && REST_TOKEN ? 'redis-rest' : TCP_URL ? 'redis-tcp' : 'memory');

async function tcp(args) {
  if (!global.__rcp) {
    const { createClient } = require('redis');
    const c = createClient({ url: TCP_URL, socket: { connectTimeout: 8000 } });
    c.on('error', () => { global.__rcp = null; });
    global.__rcp = c.connect().then(() => c);
  }
  try { return await (await global.__rcp).sendCommand(args.map(String)); }
  catch (e) { global.__rcp = null; throw e; }
}

async function cmd(a) {
  const m = mode();
  if (m === 'redis-rest') {
    const r = await fetch(REST_URL, { method: 'POST', headers: { Authorization: 'Bearer ' + REST_TOKEN }, body: JSON.stringify(a) });
    const j = await r.json().catch(() => ({ error: 'Bad response from database (' + r.status + ')' }));
    if (j.error) throw new Error(j.error);
    return j.result;
  }
  if (m === 'redis-tcp') return tcp(a);
  if (process.env.VERCEL) {
    const e = new Error('DATABASE_NOT_CONFIGURED: connect a Redis database (Upstash) to this Vercel project, then redeploy.');
    e.code = 'DB'; throw e;
  }
  const [c, k, f, v] = a;
  if (c === 'GET') return mem.kv[k] ?? null;
  if (c === 'SET') { mem.kv[k] = f; return 'OK'; }
  if (c === 'HSETNX') { mem.h[k] = mem.h[k] || {}; if (mem.h[k][f]) return 0; mem.h[k][f] = v; return 1; }
  if (c === 'HGETALL') return Object.entries(mem.h[k] || {}).flat();
  throw new Error('Unsupported command ' + c);
}

const getSession = async () => { const v = await cmd(['GET', 'att:session']); return v ? JSON.parse(v) : null; };
const setSession = (s) => cmd(['SET', 'att:session', JSON.stringify(s)]);
const addAttendee = async (sid, roll, obj) => Number(await cmd(['HSETNX', `att:${sid}:list`, roll, JSON.stringify(obj)])) === 1;
const listAttendees = async (sid) => {
  const flat = (await cmd(['HGETALL', `att:${sid}:list`])) || [];
  const out = [];
  for (let i = 1; i < flat.length; i += 2) out.push(JSON.parse(flat[i]));
  return out.sort((a, b) => b.at - a.at);
};
const PASS = () => process.env.TEACHER_PASSCODE || 'teacher123';
const fail = (res, e) => res.status(e.code === 'DB' ? 503 : 500).json({ error: e.message });
module.exports = { mode, cmd, getSession, setSession, addAttendee, listAttendees, PASS, fail };
