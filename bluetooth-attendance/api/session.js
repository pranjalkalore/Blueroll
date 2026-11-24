const { getSession, setSession, PASS, fail } = require('../lib/store');
const rnd = (n, chars) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (req.headers['x-teacher-pass'] !== PASS()) return res.status(401).json({ error: 'Wrong passcode' });
  const { action, subject, requireBle } = req.body || {};
  try {
    if (action === 'auth') return res.json({ ok: true });
    if (action === 'start') {
      const s = {
        id: Date.now().toString(36), subject: String(subject || 'Class').slice(0, 60),
        requireBle: requireBle !== false, code: rnd(4, '0123456789'),
        bleName: 'ATT-' + rnd(4, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'),
        active: true, startedAt: Date.now(),
      };
      await setSession(s);
      return res.json({ ok: true, session: s });
    }
    if (action === 'stop') {
      const s = await getSession();
      if (s) { s.active = false; s.endedAt = Date.now(); await setSession(s); }
      return res.json({ ok: true });
    }
    res.status(400).json({ error: 'Unknown action' });
  } catch (e) { fail(res, e); }
};
