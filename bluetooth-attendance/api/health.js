const { mode, cmd } = require('../lib/store');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const m = mode();
  try {
    await cmd(['SET', 'att:health', String(Date.now())]);
    const v = await cmd(['GET', 'att:health']);
    const persistent = m !== 'memory';
    res.json({ ok: !!v, storage: m, persistent, onVercel: !!process.env.VERCEL, usingDefaultPasscode: !process.env.TEACHER_PASSCODE });
  } catch (e) {
    res.status(503).json({ ok: false, storage: m, error: e.message });
  }
};
