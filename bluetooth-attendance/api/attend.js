const { getSession, addAttendee, fail } = require('../lib/store');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { name, roll, code } = req.body || {};
    const n = String(name || '').trim().slice(0, 60), r = String(roll || '').trim().slice(0, 20);
    if (!n || !r) return res.status(400).json({ error: 'Name and roll number are required.' });
    const s = await getSession();
    if (!s || !s.active) return res.status(403).json({ error: 'Attendance is not open right now.' });
    if (!s.requireBle && String(code) !== s.code) return res.status(403).json({ error: 'Wrong class code.' });
    const fresh = await addAttendee(s.id, r.toLowerCase(), { name: n, roll: r, at: Date.now() });
    res.json({ ok: true, duplicate: !fresh, subject: s.subject });
  } catch (e) { fail(res, e); }
};
