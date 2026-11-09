#!/usr/bin/env node
// scripts/browser-check.js - Load built pages in Chromium and look for problems.
//
// Usage: node scripts/browser-check.js <publicDir> <basePath> <page.html>...
//   SHOTS=<dir>  also save desktop + phone screenshots of each page there.
//
// Checks per page (desktop 1280px and phone 390px):
//   - no uncaught JS errors and no console.error
//   - no horizontal page scroll on phone
//   - no failed same-origin requests (missing CSS/JS/images)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [publicDir, base, ...pages] = process.argv.slice(2);
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (!p.startsWith(base)) { res.writeHead(404); return res.end(); }
  p = path.join(publicDir, p.slice(base.length));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const shots = process.env.SHOTS;
  if (shots) fs.mkdirSync(shots, { recursive: true });
  let problems = 0;
  for (const file of pages) {
    const rel = path.relative(publicDir, file).replace(/index\.html$/, '');
    const url = `${origin}${base}/${rel}`;
    for (const vp of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'phone', width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const errs = [];
      page.on('pageerror', e => errs.push('pageerror: ' + e.message));
      page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
      page.on('response', r => { if (r.url().startsWith(origin) && r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url().slice(origin.length)}`); });
      await page.goto(url, { waitUntil: 'networkidle' }).catch(e => errs.push('goto: ' + e.message));
      await page.waitForTimeout(400);
      if (vp.name === 'phone') {
        const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (over > 1) errs.push(`horizontal scroll on phone: ${over}px too wide`);
      }
      if (shots) {
        // Scroll through the page so scroll-triggered reveals run before the full-page shot.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += Math.round(window.innerHeight * 0.7)) {
            window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(700);
        const name = (rel || 'root').replace(/\/$/, '').replace(/\//g, '__') + `.${vp.name}.png`;
        await page.screenshot({ path: path.join(shots, name), fullPage: true });
      }
      for (const e of errs) { console.log(`  FAIL [${vp.name}] /${rel}: ${e}`); problems++; }
      await page.close();
    }
  }
  await browser.close();
  server.close();
  console.log(`      browser: ${pages.length} page(s), ${problems} problem(s)`);
  process.exit(problems ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
