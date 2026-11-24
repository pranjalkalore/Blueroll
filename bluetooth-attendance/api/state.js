const { getSession, listAttendees, PASS, fail } = require('../lib/store');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const s = await getSession();
    if (!s) return res.json({ session: false, active: false });
    const out = { session: true, id: s.id, subject: s.subject, active: s.active, requireBle: s.requireBle, bleName: s.bleName, startedAt: s.startedAt };
    if (req.headers['x-teacher-pass'] === PASS()) { out.code = s.code; out.attendees = await listAttendees(s.id); }
    res.json(out);
  } catch (e) { fail(res, e); }
};
