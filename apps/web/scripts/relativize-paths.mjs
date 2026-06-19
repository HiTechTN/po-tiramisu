import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, sep } from 'path';

const outDir = process.argv[2] || join(process.cwd(), 'out');

const isUrl = (s) => s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:') || s.startsWith('//');

function relativize(filePath) {
  const dir = filePath.substring(0, filePath.lastIndexOf(sep));
  const relative = dir === outDir ? '.' : '.' + dir.substring(outDir.length).replace(/\\/g, '/');

  let html = readFileSync(filePath, 'utf-8');

  html = html.replace(/(href|src|action|poster)\s*=\s*"\/[^"]*"/g, (match) => {
    const prefix = match.substring(0, match.indexOf('"') + 1);
    const url = match.substring(match.indexOf('"') + 1, match.length - 1);
    if (isUrl(url)) return match;
    return `${prefix}${relative}${url}"`;
  });

  html = html.replace(/(href|src|action|poster)\s*=\s*'\/[^']*'/g, (match) => {
    const prefix = match.substring(0, match.indexOf("'") + 1);
    const url = match.substring(match.indexOf("'") + 1, match.length - 1);
    if (isUrl(url)) return match;
    return `${prefix}${relative}${url}'`;
  });

  html = html.replace(/"\/_next\/[^"]*"/g, (match) => {
    return `"${relative}${match.substring(1, match.length - 1)}"`;
  });

  html = html.replace(/"\/favicon[^"]*"/g, (match) => {
    return `"${relative}${match.substring(1, match.length - 1)}"`;
  });

  html = html.replace(/"\/images\/[^"]*"/g, (match) => {
    return `"${relative}${match.substring(1, match.length - 1)}"`;
  });

  writeFileSync(filePath, html, 'utf-8');
  console.log(`  relativized: ${filePath}`);
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith('.html')) {
      relativize(full);
    }
  }
}

console.log('Relativizing paths in:', outDir);
walk(outDir);
console.log('Done.');
