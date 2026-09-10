import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.argv[2] || '.pages-dist';
let changed = 0;

function sanitizePack(pack) {
  if (pack?.prefix === 'la') {
    pack.author = { name: 'Line Awesome contributors', url: null };
    changed++;
  }
  return pack;
}

const catalogPath = path.join(root, 'data', 'catalog.json');
const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
catalog.packs = (catalog.packs || []).map(sanitizePack);
await fs.writeFile(catalogPath, JSON.stringify(catalog));

const packsDir = path.join(root, 'data', 'packs');
for (const name of await fs.readdir(packsDir)) {
  if (!name.endsWith('.json')) continue;
  const file = path.join(packsDir, name);
  const pack = JSON.parse(await fs.readFile(file, 'utf8'));
  const before = changed;
  sanitizePack(pack);
  if (changed !== before) await fs.writeFile(file, JSON.stringify(pack));
}

console.log(`Sanitized ${changed} public Pages metadata entries.`);
