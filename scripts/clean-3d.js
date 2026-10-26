// Keeps only the 3D contribution calendar (drops language pie, radar and star/fork counters)
// and adds a founder-style contribution label.
const fs = require('fs');
const [src, dest] = process.argv.slice(2);
const s = fs.readFileSync(src, 'utf8');
const re = /<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g;
let d = 0, m, start = null; const kids = [];
while ((m = re.exec(s))) {
  const close = m[1], self = m[4];
  if (!close) { if (d === 1) start = m.index; if (!self) d++; else if (d === 1) kids.push([start, re.lastIndex]); }
  else { d--; if (d === 1) kids.push([start, re.lastIndex]); }
}
const parts = kids.map(([a, b]) => s.slice(a, b));
const style = parts.find(p => p.startsWith('<style'));
const bg = parts.find(p => p.startsWith('<rect'));
const calendar = parts.filter(p => p.startsWith('<g')).sort((a, b) => b.length - a.length)[0];
const statsText = parts.find(p => p.startsWith('<g') && p.includes('class="fill-strong"')) || '';
const num = (statsText.match(/class="fill-strong">([^<]+)</) || [, ''])[1].replace(/[^0-9]/g, '');
const pretty = num ? Number(num).toLocaleString('en-US') : '';
const head = s.slice(0, kids[0][0]);
const label = pretty ? `<g transform="translate(70 700)"><text x="0" y="0" style="font: 800 72px -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; letter-spacing:-2px" fill="#3EE6A8">${pretty}</text><text x="4" y="44" style="font: 600 26px -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" fill="#BFD9CF">contributions in the last 12 months</text></g>` : '';
const border = `<rect x="1" y="1" width="1278" height="848" rx="28" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2"/>`;
const out = head + style + `<clipPath id="r"><rect width="1280" height="850" rx="28"/></clipPath><g clip-path="url(#r)">` + bg + calendar + label + border + `</g></svg>`;
fs.writeFileSync(dest, out);
console.log('kept calendar, label:', pretty);
