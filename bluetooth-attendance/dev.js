// Local test server: node dev.js  → http://localhost:3000  (Bluetooth works on localhost)
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(o)); };
  if (url.pathname.startsWith('/api/')) {
    const f = path.join(__dirname, url.pathname + '.js');
    if (!fs.existsSync(f)) return res.status(404).json({ error: 'Not found' });
    let b = ''; for await (const c of req) b += c;
    try { req.body = b ? JSON.parse(b) : {}; } catch { req.body = {}; }
    return require(f)(req, res);
  }
  let p = url.pathname === '/' ? '/index' : url.pathname;
  let f = path.join(__dirname, 'public', p);
  if (!path.extname(f)) f += '.html';
  if (!f.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(f)) return res.status(404).end('Not found');
  res.setHeader('content-type', types[path.extname(f)] || 'text/plain'); res.end(fs.readFileSync(f));
}).listen(PORT, () => console.log('BlueRoll running on http://localhost:' + PORT));
